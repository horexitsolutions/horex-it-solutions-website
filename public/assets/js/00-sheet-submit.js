/* Google Sheet + email OTP helper.
   Everything the site sends to Google goes through here, to ONE Google Apps Script Web App (Code.gs).
   To change the Sheet / script, change the one URL below (address ending in /exec).

   1. Lead forms:   HorexForm.send(formType, { name, contact, businessName, message })
        -> POST { formType, name, contact, businessName, message }
        formType is the Sheet tab name: 'Free Audit', 'Get a Quote', 'Build Page Quote', 'Contact',
        'Build Website', 'Free Demo', 'Name Ideas Lead', 'Budget Planner Lead', 'Break-Even Lead'.
        `message` is "Field Label: Value" lines built with HorexForm.lines(); Code.gs turns each line
        into its own column.
   2. Email OTP:    HorexForm.request('send_otp',   { email, name, language })
                    HorexForm.request('verify_otp', { email, otp })
   All requests are JSON sent as text/plain;charset=utf-8 (no CORS preflight needed). */
(function () {
  const SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwQFDK2ii7HQ2QqzCAbyJNgyAIG-JFTJjDRoi44KE_dDi8GhlNx2dooEgRUcRt_mfPfcg/exec';
  const TIMEOUT_MS = 30000; // Apps Script can take several seconds to wake up or send an email

  // ---- visitor-facing text ----
  const SENDING = 'Sending\u2026';
  const ERROR_MSG = 'Sorry, we could not send your details. Please check your internet and try again, or call or WhatsApp us on +91\u00a09414122762.';
  const OTP_MSGS = {
    invalid_email:      'Please type a valid email address.',
    rate_limited:       'Please wait a minute before asking for another code.',
    send_failed:        'We could not email the code. Please check your email address and try again.',
    expired:            'This code has expired. Please ask for a new code.',
    wrong_otp:          'That code is not correct. Please check your email and try again.',
    too_many_attempts:  'Too many wrong tries. Please ask for a new code.',
    script_outdated:    'Server error. Please refresh the page and try again, or contact us directly.',
    network:            ERROR_MSG
  };
  OTP_MSGS.not_found = OTP_MSGS.email_not_verified = OTP_MSGS.expired;

  const HI_TEXT = {
    'Sending\u2026': '\u092d\u0947\u091c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948\u2026',
    'Checking\u2026': '\u091c\u093e\u0901\u091a \u0939\u094b \u0930\u0939\u0940 \u0939\u0948\u2026',
    [ERROR_MSG]: '\u092e\u093e\u092b\u093c \u0915\u0940\u091c\u093f\u090f, \u0906\u092a\u0915\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0928\u0939\u0940\u0902 \u092d\u0947\u091c\u0940 \u091c\u093e \u0938\u0915\u0940\u0964 \u0915\u0943\u092a\u092f\u093e \u0907\u0902\u091f\u0930\u0928\u0947\u091f \u091c\u093e\u0901\u091a\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0940\u091c\u093f\u090f, \u092f\u093e \u0939\u092e\u0947\u0902 +91\u00a09414122762 \u092a\u0930 \u0915\u0949\u0932 \u092f\u093e WhatsApp \u0915\u0940\u091c\u093f\u090f\u0964',
    [OTP_MSGS.rate_limited]:      '\u0926\u0942\u0938\u0930\u093e \u0915\u094b\u0921 \u092e\u093e\u0901\u0917\u0928\u0947 \u0938\u0947 \u092a\u0939\u0932\u0947 \u0915\u0943\u092a\u092f\u093e \u090f\u0915 \u092e\u093f\u0928\u091f \u0930\u0941\u0915\u093f\u090f\u0964',
    [OTP_MSGS.send_failed]:       '\u0939\u092e \u0915\u094b\u0921 \u0908\u092e\u0947\u0932 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0947\u0964 \u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u0908\u092e\u0947\u0932 \u092a\u0924\u093e \u091c\u093e\u0901\u091a\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0940\u091c\u093f\u090f\u0964',
    [OTP_MSGS.expired]:           '\u092f\u0939 \u0915\u094b\u0921 \u090f\u0915\u094d\u0938\u092a\u093e\u092f\u0930 \u0939\u094b \u0917\u092f\u093e \u0939\u0948\u0964 \u0915\u0943\u092a\u092f\u093e \u0928\u092f\u093e \u0915\u094b\u0921 \u092e\u093e\u0901\u0917\u093f\u090f\u0964',
    [OTP_MSGS.wrong_otp]:         '\u092f\u0939 \u0915\u094b\u0921 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u093e \u0908\u092e\u0947\u0932 \u091c\u093e\u0901\u091a\u0915\u0930 \u0926\u094b\u092c\u093e\u0930\u093e \u0915\u094b\u0936\u093f\u0936 \u0915\u0940\u091c\u093f\u090f\u0964',
    [OTP_MSGS.too_many_attempts]: '\u092c\u0939\u0941\u0924 \u091c\u093c\u094d\u092f\u093e\u0926\u093e \u0917\u0932\u0924 \u0915\u094b\u0936\u093f\u0936\u0947\u0902 \u0939\u0941\u0908\u0902\u0964 \u0915\u0943\u092a\u092f\u093e \u0928\u092f\u093e \u0915\u094b\u0921 \u092e\u093e\u0901\u0917\u093f\u090f\u0964',
    'A new code has been sent to your email.': '\u0906\u092a\u0915\u0947 \u0908\u092e\u0947\u0932 \u092a\u0930 \u0928\u092f\u093e \u0915\u094b\u0921 \u092d\u0947\u091c \u0926\u093f\u092f\u093e \u0917\u092f\u093e \u0939\u0948\u0964',
    [OTP_MSGS.invalid_email]:     '\u0915\u0943\u092a\u092f\u093e \u0938\u0939\u0940 \u0908\u092e\u0947\u0932 \u092a\u0924\u093e \u0932\u093f\u0916\u093f\u090f\u0964'
  };
  document.addEventListener('DOMContentLoaded', () => { if (typeof HI !== 'undefined') Object.assign(HI, HI_TEXT); });

  // ---- spinner / disabled button ----
  const css = document.createElement('style');
  css.textContent =
    '@keyframes hx-rot{to{transform:rotate(360deg)}}' +
    '.hx-spin{display:inline-block;width:1em;height:1em;margin-right:.55em;vertical-align:-.15em;' +
    'border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:hx-rot .7s linear infinite}' +
    '.hx-busy{opacity:.75;cursor:wait!important;pointer-events:none}';
  document.head.appendChild(css);

  const str = v => (v === undefined || v === null ? '' : String(v)).trim();
  const safe = v => { v = str(v); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  const fmt  = v => (Array.isArray(v) ? v.filter(Boolean).join(', ') : v === true ? 'Yes' : v === false ? 'No' : str(v)).replace(/\s*[\r\n]+\s*/g, ' ');
  const language = () => window.LANG === 'hi' ? 'Hindi' : 'English';

  function lines(pairs) {
    return pairs.map(p => [p[0], fmt(p[1])]).filter(p => p[1]).map(p => p[0] + ': ' + p[1]).join('\n');
  }
  const contact = (...parts) => parts.map(str).filter(Boolean).join(' / ');

  const isBusy = btn => !!(btn && btn.dataset.hxBusy);
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) {
      if (btn.dataset.hxBusy) return;
      btn.dataset.hxBusy = '1'; btn._hxKids = [...btn.childNodes]; btn._hxLang = window.LANG;
      const sp = document.createElement('span'); sp.className = 'hx-spin'; sp.setAttribute('aria-hidden', 'true');
      btn.replaceChildren(sp, document.createTextNode(label || SENDING));
      btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.classList.add('hx-busy');
    } else {
      if (!btn.dataset.hxBusy) return;
      delete btn.dataset.hxBusy;
      btn.replaceChildren(...(btn._hxKids || []));
      btn.disabled = false; btn.removeAttribute('aria-busy'); btn.classList.remove('hx-busy');
      if (btn._hxLang !== window.LANG && window.applyLang) window.applyLang();
      btn._hxKids = null;
    }
  }

  /* post(payload) -> { transport, body, reason }
     transport=true means Google replied (even with a script error); false means network/timeout. */
  async function post(payload) {
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(SHEET_WEB_APP_URL)) {
      console.error('[Horex] SHEET_WEB_APP_URL in 00-sheet-submit.js is not a Google Apps Script /exec address.');
      return { transport: false, body: null, reason: 'not-configured' };
    }
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : 0;
    try {
      const res = await fetch(SHEET_WEB_APP_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload), redirect: 'follow',
        signal: ctrl ? ctrl.signal : undefined
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (/^\s*<(!doctype|html)/i.test(text)) throw new Error(
        'Apps Script returned an HTML error page. Deploy Code.gs as a NEW version with Execute as: Me and access: Anyone.');
      let body = null; try { body = JSON.parse(text); } catch (_) {}
      return { transport: true, body, reason: '' };
    } catch (e) {
      console.error('[Horex] Request failed:', e.message || e);
      return { transport: false, body: null, reason: e.name === 'AbortError' ? 'timeout' : 'failed' };
    } finally { if (timer) clearTimeout(timer); }
  }

  /* send(formType, fields) -> Promise<{ok}|{ok,reason,error}>
     Saves one lead row in the Sheet tab named by formType. Never throws. */
  async function send(formType, f) {
    f = f || {};
    const message = [str(f.message), 'Language: ' + language()].filter(Boolean).join('\n');
    const r = await post({ formType: str(formType), name: safe(f.name), contact: safe(f.contact), businessName: safe(f.businessName), message });
    if (!r.transport) return { ok: false, reason: r.reason, error: 'network' };
    const b = r.body;
    if (b && (b.success === false || b.ok === false ||
              /^error$/i.test(str(b.result)) || /^error$/i.test(str(b.status)) || b.error)) {
      console.error('[Horex] Script error for "' + formType + '":', b && (b.error || b.message) || b);
      return { ok: false, reason: 'script-error', error: str((b && b.error) || '') || 'failed' };
    }
    return { ok: true };
  }

  /* request(action, fields) -> Promise<{ok,body}|{ok,error}>
     action: 'send_otp' | 'verify_otp'
     Returns ok:true only when Code.gs replies { success:true, action:<same> }.
     If Code.gs is outdated (doesn't know OTP), error='script_outdated'. Never throws. */
  async function request(action, fields) {
    const r = await post(Object.assign({ action }, fields || {}));
    if (!r.transport) return { ok: false, error: 'network' };
    const b = r.body;
    if (!b || b.action !== action) {
      console.error('[Horex] Apps Script did not echo action="' + action +
        '". Deploy Code.gs as a NEW version (Manage deployments > Edit > New version).');
      return { ok: false, error: 'script_outdated' };
    }
    return b.success === true ? { ok: true, body: b } : { ok: false, error: str((b && b.error) || '') || 'failed', body: b };
  }

  const otpMessage = code => OTP_MSGS[code] || ERROR_MSG;

  window.HorexForm = { send, request, busy, isBusy, lines, contact, language, otpMessage, ERROR_MSG };
})();
