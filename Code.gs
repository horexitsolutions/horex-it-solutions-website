/**
 * Horex IT Solutions — Google Apps Script Web App  (Code.gs)
 *
 * Deploy settings (Extensions > Apps Script > Deploy > New deployment):
 *   Type            : Web app
 *   Execute as      : Me
 *   Who has access  : Anyone
 *
 * After EVERY edit, click "Deploy > Manage deployments > ✏️ Edit > Version > New version > Deploy".
 * The URL never changes, so you do NOT need to update the site after redeploying.
 *
 * What this script does
 * ─────────────────────
 * 1. Saves a lead row in the Sheet tab named after formType.
 *    Every "Field Label: Value" line in `message` becomes its own column.
 * 2. Sends a 6-digit OTP email  → action:"send_otp"
 * 3. Verifies the OTP           → action:"verify_otp"
 *
 * Sheet tab names (created automatically on first submission):
 *   Free Audit · Get a Quote · Build Page Quote · Contact · Build Website
 *   Free Demo · Name Ideas Lead · Budget Planner Lead · Break-Even Lead
 *
 * JSON sent by the site (all as text/plain;charset=utf-8 so no CORS preflight is needed):
 *   Lead    → { formType, name, contact, businessName, message }
 *   OTP     → { action:"send_otp",   email, name, language }
 *   Verify  → { action:"verify_otp", email, otp }
 *
 * Response always includes { success, action? } so the browser can tell if Code.gs is outdated.
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const SPREADSHEET_ID = ''; // Leave blank to use the spreadsheet this script is bound to.
                            // Or paste a Spreadsheet ID here: '1AbCd…xyz'

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS   = 5;
const OTP_RATE_LIMIT_MIN = 1;   // minimum minutes between resend requests for the same email

// Column names that always appear first (before the parsed message fields)
const FIXED_COLS = ['Timestamp', 'Form Type', 'Name', 'Contact', 'Business Name'];

// Valid formType values. Any unknown value is stored in a tab called "Other".
const VALID_FORM_TYPES = new Set([
  'Free Audit', 'Get a Quote', 'Build Page Quote', 'Contact', 'Build Website',
  'Free Demo', 'Name Ideas Lead', 'Budget Planner Lead', 'Break-Even Lead'
]);

// ─── Entry point ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);

    if (d.action === 'send_otp')   return ok(handleSendOtp(d),   'send_otp');
    if (d.action === 'verify_otp') return ok(handleVerifyOtp(d), 'verify_otp');

    // Default: save a lead row
    saveLead(d);
    return ok({ saved: true });

  } catch (err) {
    return fail(String(err));
  }
}

// Allow OPTIONS preflight (not needed for text/plain, kept as a safety net)
function doGet(e) {
  return ContentService.createTextOutput('Horex IT Solutions – Web App running.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ─── Lead saving ─────────────────────────────────────────────────────────────

function saveLead(d) {
  const ss  = getSpreadsheet();
  const tab = sanitiseTabName(d.formType || 'Other');
  let   sh  = ss.getSheetByName(tab);

  // Parse "Field Label: Value" lines from message into an ordered map
  const fields = parseMessage(d.message || '');

  // Build the full ordered column list for this submission
  const extraCols = [...fields.keys()];

  if (!sh) {
    sh = ss.insertSheet(tab);
    sh.appendRow([...FIXED_COLS, ...extraCols]);
    formatHeader(sh);
  } else {
    extendHeaders(sh, extraCols); // add any new columns that this submission has
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    if (h === 'Timestamp')     return new Date();
    if (h === 'Form Type')     return unsafe(d.formType  || '');
    if (h === 'Name')          return unsafe(d.name       || '');
    if (h === 'Contact')       return unsafe(d.contact    || '');
    if (h === 'Business Name') return unsafe(d.businessName || '');
    return fields.has(h) ? unsafe(fields.get(h)) : '';
  });

  sh.appendRow(row);
  autoResizeFirstTime(sh);
}

function parseMessage(msg) {
  const map = new Map();
  (msg || '').split('\n').forEach(line => {
    const idx = line.indexOf(': ');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 2).trim();
      if (key && val) map.set(key, val);
    }
  });
  return map;
}

function extendHeaders(sh, newCols) {
  if (!newCols.length) return;
  const lastCol  = sh.getLastColumn();
  const existing = new Set(sh.getRange(1, 1, 1, lastCol).getValues()[0]);
  const toAdd    = newCols.filter(c => !existing.has(c));
  if (toAdd.length) {
    sh.getRange(1, lastCol + 1, 1, toAdd.length).setValues([toAdd]);
    formatHeader(sh);
  }
}

function formatHeader(sh) {
  const hdr = sh.getRange(1, 1, 1, sh.getLastColumn());
  hdr.setFontWeight('bold').setBackground('#003366').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
}

function autoResizeFirstTime(sh) {
  // Only resize columns the first time rows are sparse (< 3 rows) to avoid slowness on large sheets
  if (sh.getLastRow() < 3) {
    for (let c = 1; c <= sh.getLastColumn(); c++) sh.autoResizeColumn(c);
  }
}

function sanitiseTabName(raw) {
  const clean = String(raw).replace(/[\[\]*\/\\?:]/g, '').trim().slice(0, 99);
  return VALID_FORM_TYPES.has(clean) ? clean : 'Other';
}

/** Remove the leading ' that the browser added to prevent formula injection */
function unsafe(v) {
  return String(v).replace(/^'+/, '');
}

function getSpreadsheet() {
  return SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

// ─── OTP: send ───────────────────────────────────────────────────────────────

function handleSendOtp(d) {
  const email = normaliseEmail(d.email || '');
  if (!email) return { success: false, error: 'invalid_email' };

  const cache  = CacheService.getScriptCache();
  const rateKey = 'otp_rate_' + hashKey(email);

  // Rate-limit: one code per OTP_RATE_LIMIT_MIN minutes per email
  if (cache.get(rateKey)) return { success: false, error: 'rate_limited' };

  const otp      = generateOtp();
  const attempts = 0;
  const otpKey   = 'otp_' + hashKey(email);

  cache.put(otpKey,   JSON.stringify({ otp, attempts }), OTP_EXPIRY_MINUTES * 60);
  cache.put(rateKey,  '1',                               OTP_RATE_LIMIT_MIN * 60);

  const name     = String(d.name     || 'there').trim();
  const language = String(d.language || 'English').trim();
  const sent     = sendOtpEmail(email, name, otp, language);

  if (!sent) {
    cache.remove(otpKey); cache.remove(rateKey);
    return { success: false, error: 'send_failed' };
  }
  return { success: true };
}

function sendOtpEmail(email, name, otp, language) {
  try {
    const isHindi = language === 'Hindi';
    const subject = isHindi
      ? 'आपका Horex वेबसाइट कोड: ' + otp
      : 'Your Horex demo website code: ' + otp;
    const greeting = isHindi
      ? 'नमस्ते ' + name + ','
      : 'Hi ' + name + ',';
    const body1 = isHindi
      ? 'आपका 6-अंकीय कोड है:'
      : 'Your 6-digit code is:';
    const body2 = isHindi
      ? 'यह कोड ' + OTP_EXPIRY_MINUTES + ' मिनट के लिए वैध है।'
      : 'This code is valid for ' + OTP_EXPIRY_MINUTES + ' minutes.';
    const body3 = isHindi
      ? 'अगर आपने यह कोड नहीं माँगा, तो बस इस ईमेल को अनदेखा करें।'
      : 'If you did not request this, please ignore this email.';

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08)">
  <tr><td style="background:#003366;padding:28px 36px">
    <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.3px">Horex IT Solutions</span>
  </td></tr>
  <tr><td style="padding:36px">
    <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e">${greeting}</p>
    <p style="margin:0 0 24px;font-size:16px;color:#1a1a2e;line-height:1.6">${body1}</p>
    <div style="text-align:center;margin:0 0 28px">
      <span style="display:inline-block;background:#003366;color:#fff;font-size:38px;font-weight:900;letter-spacing:12px;padding:18px 32px;border-radius:12px">${otp}</span>
    </div>
    <p style="margin:0 0 12px;font-size:14px;color:#6b7280;line-height:1.6">${body2}</p>
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">${body3}</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 36px;text-align:center">
    <p style="margin:0;font-size:12px;color:#9ca3af">Horex IT Solutions · +91 9414122762 · horexitsolutions.com</p>
  </td></tr>
</table></td></tr></table></body></html>`;

    MailApp.sendEmail(email, subject,
      greeting + '\n\n' + body1 + '\n\n' + otp + '\n\n' + body2 + '\n\n' + body3,
      { htmlBody: html, name: 'Horex IT Solutions' });
    return true;
  } catch (err) {
    console.error('sendOtpEmail failed:', err);
    return false;
  }
}

// ─── OTP: verify ─────────────────────────────────────────────────────────────

function handleVerifyOtp(d) {
  const email = normaliseEmail(d.email || '');
  const otp   = String(d.otp || '').replace(/\D/g, '').slice(0, 6);
  if (!email || !/^\d{6}$/.test(otp)) return { success: false, error: 'invalid_email' };

  const cache  = CacheService.getScriptCache();
  const otpKey = 'otp_' + hashKey(email);
  const raw    = cache.get(otpKey);
  if (!raw) return { success: false, error: 'expired' };

  let entry;
  try { entry = JSON.parse(raw); } catch (_) { return { success: false, error: 'expired' }; }

  entry.attempts = (entry.attempts || 0) + 1;
  if (entry.attempts > OTP_MAX_ATTEMPTS) {
    cache.remove(otpKey);
    return { success: false, error: 'too_many_attempts' };
  }

  if (entry.otp !== otp) {
    // Write back incremented attempt count (keep same TTL is not possible, so we re-put with max remaining)
    cache.put(otpKey, JSON.stringify(entry), OTP_EXPIRY_MINUTES * 60);
    return { success: false, error: 'wrong_otp' };
  }

  cache.remove(otpKey); // consumed — single use
  return { success: true };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normaliseEmail(raw) {
  const e = String(raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : '';
}

/** Simple deterministic key for CacheService (which only accepts string keys ≤ 250 chars) */
function hashKey(email) {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (Math.imul(31, h) + email.charCodeAt(i)) | 0;
  return 'h' + Math.abs(h) + '_' + email.replace(/[^a-z0-9]/g, '').slice(0, 30);
}

function ok(data, action) {
  const payload = Object.assign({ success: true }, action ? { action } : {}, data || {});
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function fail(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
