/* Google Sheet form helper.
   Every lead form on the site sends its data through window.HorexForm.send(), which POSTs to your
   Google Apps Script Web App. To change the Sheet, change the one URL below (use the address that ends in /exec).

   Body sent (JSON, as text/plain so the browser does not need a CORS preflight):
     { formType, name, contact, businessName, message }
   formType is the sheet tab name: 'Free Audit', 'Get a Quote', 'Build Page Quote', 'Contact', 'Build Website', 'Free Demo',
   'Name Ideas Lead', 'Budget Planner Lead', 'Break-Even Lead'. `message` is "Field Label: Value" lines (built with lines()).
   Loaded right after 00-standalone-shim.js and before every page script. */
(function () {
  const SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwQFDK2ii7HQ2QqzCAbyJNgyAIG-JFTJjDRoi44KE_dDi8GhlNx2dooEgRUcRt_mfPfcg/exec';
  const TIMEOUT_MS = 20000;

  // ---- text shown to visitors (English here, Hindi registered below) ----
  const SENDING = 'Sending…';
  const ERROR_MSG = 'Sorry, we could not send your details. Please check your internet and try again, or call or WhatsApp us on +91 9414122762.';
  const HI_TEXT = {
    'Sending…': 'भेजा जा रहा है…',
    'Sorry, we could not send your details. Please check your internet and try again, or call or WhatsApp us on +91 9414122762.': 'माफ़ कीजिए, आपकी जानकारी नहीं भेजी जा सकी। कृपया इंटरनेट जाँचकर दोबारा कोशिश कीजिए, या हमें +91 9414122762 पर कॉल या WhatsApp कीजिए।'
  };
  // The page's Hindi dictionary (HI) is created by 19-language-and-router.js, so merge once everything has loaded.
  document.addEventListener('DOMContentLoaded', () => { if (typeof HI !== 'undefined') Object.assign(HI, HI_TEXT); });

  // ---- spinner + disabled look for the button (injected here so no other CSS file changes) ----
  const css = document.createElement('style');
  css.textContent = '@keyframes hx-rot{to{transform:rotate(360deg)}}'
    + '.hx-spin{display:inline-block;width:1em;height:1em;margin-right:.55em;vertical-align:-.15em;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:hx-rot .7s linear infinite}'
    + '.hx-busy{opacity:.75;cursor:wait!important;pointer-events:none}';
  document.head.appendChild(css);

  const str = v => (v === undefined || v === null ? '' : String(v)).trim();
  // Stop Google Sheets turning text such as "=SUM(1)" or "+91 98..." into a formula.
  const safe = v => { v = str(v); return /^[=+\-@]/.test(v) ? "'" + v : v; };
  // One value = one line: line breaks typed by the visitor are turned into spaces so every "Label: Value" stays on its own line.
const fmt = v => (Array.isArray(v) ? v.filter(Boolean).join(', ') : v === true ? 'Yes' : v === false ? 'No' : str(v)).replace(/\s*[\r\n]+\s*/g, ' ');

  /* lines([['City', 'Jodhpur'], ['Budget', '']]) -> "City: Jodhpur"  (empty values are skipped) */
  function lines(pairs) {
    return pairs.map(p => [p[0], fmt(p[1])]).filter(p => p[1]).map(p => p[0] + ': ' + p[1]).join('\n');
  }
  /* contact('9876543210', 'a@b.com') -> "9876543210 / a@b.com" */
  const contact = (...parts) => parts.map(str).filter(Boolean).join(' / ');

  /* Loading state: spinner + "Sending…" while the request runs. The button's original nodes are kept
     (not copied) so the English/Hindi switcher still works on them afterwards. */
  const isBusy = btn => !!(btn && btn.dataset.hxBusy);
  function busy(btn, on) {
    if (!btn) return;
    if (on) {
      if (btn.dataset.hxBusy) return;
      btn.dataset.hxBusy = '1'; btn._hxKids = [...btn.childNodes]; btn._hxLang = window.LANG;
      const sp = document.createElement('span'); sp.className = 'hx-spin'; sp.setAttribute('aria-hidden', 'true');
      btn.replaceChildren(sp, document.createTextNode(SENDING));
      btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.classList.add('hx-busy');
    } else {
      if (!btn.dataset.hxBusy) return;
      delete btn.dataset.hxBusy;
      btn.replaceChildren(...(btn._hxKids || []));
      btn.disabled = false; btn.removeAttribute('aria-busy'); btn.classList.remove('hx-busy');
      if (btn._hxLang !== window.LANG && window.applyLang) window.applyLang();   // language was switched while sending
      btn._hxKids = null;
    }
  }

  /* send('quote', { name, contact, businessName, message }) -> Promise<{ ok: true } | { ok: false, reason }>
     Never throws, so callers only check .ok. */
  async function send(formType, f) {
    f = f || {};
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(SHEET_WEB_APP_URL)) {
      console.error('[Horex forms] SHEET_WEB_APP_URL in 00-sheet-submit.js is not a Google Apps Script web app address.');
      return { ok: false, reason: 'not-configured' };
    }
    const message = [str(f.message), 'Language: ' + (window.LANG === 'hi' ? 'Hindi' : 'English')].filter(Boolean).join('\n');
    const payload = { formType: str(formType), name: safe(f.name), contact: safe(f.contact), businessName: safe(f.businessName), message };
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : 0;
    try {
      const res = await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: ctrl ? ctrl.signal : undefined
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      // Apps Script returns an HTML error page (with HTTP 200) when the script itself crashes.
      if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('Apps Script returned an error page. Check the script and its deployment (access: Anyone).');
      let body = null; try { body = JSON.parse(text); } catch (e) {}
      if (body && (body.success === false || body.ok === false || /^error$/i.test(str(body.result)) || /^error$/i.test(str(body.status)) || body.error))
        throw new Error('Script reported an error: ' + (body.error || body.message || JSON.stringify(body)));
      return { ok: true };
    } catch (e) {
      console.error('[Horex forms] Could not send "' + formType + '":', e);
      return { ok: false, reason: e && e.name === 'AbortError' ? 'timeout' : 'failed' };
    } finally { if (timer) clearTimeout(timer); }
  }

  window.HorexForm = { send, busy, isBusy, lines, contact, ERROR_MSG };
})();
