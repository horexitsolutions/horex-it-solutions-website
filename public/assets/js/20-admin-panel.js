/* ============================================================
   Horex IT Solutions – Admin Panel  (#admin-panel / #view-adminPanel)
   - PIN lock (sessionStorage, changeable)
   - Site settings / content editor → localStorage → applied across the site
   - JSON export / import / reset
   - Local mirror of form submissions (from HorexForm interception)
   localStorage keys used:
     hx_admin_pin         PIN hash (SHA-256 hex, salted)
     hx_settings          JSON object of site settings
     hx_leads             JSON array of captured lead objects
   sessionStorage key:
     hx_admin_sess        '1' while unlocked in this tab
   ============================================================ */
(function () {
  'use strict';

  /* ── constants ─────────────────────────────────────────── */
  const LS_PIN      = 'hx_admin_pin';
  const LS_SETTINGS = 'hx_settings';
  const LS_LEADS    = 'hx_leads';
  const SS_SESS     = 'hx_admin_sess';
  const SALT        = 'horex-2026-admin-';
  const DEFAULT_PIN = '1234';

  /* ── default site settings ───────────────────────────────
     These are shown in the editor and applied across the site.
     Keep keys short and human-readable; the editor labels them. */
  const DEFAULTS = {
    phone:         '+91 9414122762',
    whatsapp:      '919414122762',
    email:         'hello@horexitsolutions.com',
    city:          'Jodhpur',
    businessName:  'Horex IT Solutions',
    tagline:       'Your Vision. Our Code.',
    ctaLabel:      'Get a Quote',
    auditLabel:    'Get Free Checkup',
    demoLabel:     'Make my free demo website',
    footerNote:    '© 2026 Horex IT Solutions. All rights reserved.',
    youtubeUrl:    'https://www.youtube.com/@HorexITSolutions',
    instagramUrl:  'https://www.instagram.com/horexitsolutions_/',
    facebookUrl:   'https://www.facebook.com/profile.php?id=61596749427169',
    linkedinUrl:   'https://www.linkedin.com/company/horex-it-solutions/',
    announcement:  '',       // shown as a banner if non-empty
    maintenanceMode: false   // hides public pages (flag only, enforced below)
  };

  /* ── setting metadata for the editor UI ──────────────────
     [ key, label, type ('text'|'url'|'toggle'|'textarea'), hint ] */
  const FIELDS = [
    ['businessName', 'Business Name',         'text',     'Shown in the page title and footer.'],
    ['tagline',      'Tagline',               'text',     'Shown beside the business name.'],
    ['phone',        'Phone (display)',        'text',     'Shown to visitors on the contact page.'],
    ['whatsapp',     'WhatsApp number',        'text',     'Digits only, with country code. E.g. 919414122762'],
    ['email',        'Contact email',          'text',     'Shown on the contact page. Leave blank to hide.'],
    ['city',         'Primary city',           'text',     'Shown in the footer and audit defaults.'],
    ['ctaLabel',     'Primary CTA label',      'text',     'Text on "Get a Quote" buttons.'],
    ['auditLabel',   'Audit CTA label',        'text',     'Text on the homepage audit button.'],
    ['demoLabel',    'Demo CTA label',         'text',     'Text on the demo form submit button.'],
    ['footerNote',   'Footer copyright note',  'text',     'Shown at the bottom of every page.'],
    ['youtubeUrl',   'YouTube URL',            'url',      ''],
    ['instagramUrl', 'Instagram URL',          'url',      ''],
    ['facebookUrl',  'Facebook URL',           'url',      ''],
    ['linkedinUrl',  'LinkedIn URL',           'url',      ''],
    ['announcement', 'Announcement banner',    'textarea', 'Show a banner across the site. Leave blank to hide.'],
    ['maintenanceMode', 'Maintenance mode',    'toggle',   'Redirect public visitors to a "coming soon" message.'],
  ];

  /* ── helpers ─────────────────────────────────────────────*/
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  async function sha256(msg) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function getSettings() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(LS_SETTINGS) || '{}')); }
    catch { return Object.assign({}, DEFAULTS); }
  }
  function saveSettings(obj) { localStorage.setItem(LS_SETTINGS, JSON.stringify(obj)); applySettings(obj); }

  function getLeads() {
    try { return JSON.parse(localStorage.getItem(LS_LEADS) || '[]'); }
    catch { return []; }
  }
  function saveLeads(arr) { localStorage.setItem(LS_LEADS, JSON.stringify(arr)); }

  /* ── intercept HorexForm.send to mirror leads locally ───
     We wrap the existing send() after it has been defined.    */
  function installLeadMirror() {
    if (!window.HorexForm) return;
    const origSend = window.HorexForm.send.bind(window.HorexForm);
    window.HorexForm.send = async function (formType, fields) {
      const result = await origSend(formType, fields);
      const leads  = getLeads();
      leads.unshift({
        id:         Date.now(),
        ts:         new Date().toISOString(),
        formType:   formType || '',
        name:       (fields && fields.name)         || '',
        contact:    (fields && fields.contact)      || '',
        business:   (fields && fields.businessName) || '',
        message:    (fields && fields.message)      || '',
        sent:       result && result.ok,
        status:     'new'
      });
      saveLeads(leads.slice(0, 2000)); // cap at 2000
      return result;
    };
  }

  /* ── apply settings across the site ──────────────────────
     Lightweight: just swaps text nodes and hrefs that exist.  */
  function applySettings(s) {
    s = s || getSettings();
    // announcement banner
    let banner = $('hx-announce');
    if (s.announcement && s.announcement.trim()) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'hx-announce';
        banner.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0);left:0;right:0;z-index:9999;background:#003366;color:#fff;text-align:center;font-size:.85rem;font-weight:700;padding:.55rem 2.5rem .55rem 1rem;line-height:1.4';
        const x = document.createElement('button');
        x.setAttribute('aria-label','Close');
        x.style.cssText = 'position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;line-height:1';
        x.textContent = '×';
        x.onclick = () => banner.remove();
        banner.appendChild(x);
        document.body.prepend(banner);
      }
      // set text without overwriting the button
      let tn = banner.firstChild;
      if (!tn || tn.nodeType !== 3) { tn = document.createTextNode(''); banner.prepend(tn); }
      tn.nodeValue = s.announcement + '  ';
    } else if (banner) banner.remove();
    // maintenance mode redirect
    if (s.maintenanceMode && sessionStorage.getItem(SS_SESS) !== '1') {
      const v = location.hash.replace('#','');
      if (v && v !== 'adminPanel') window.route && window.route('home');
    }
    // WhatsApp float button href
    const wa = $('waFloat');
    if (wa && s.whatsapp) wa.href = 'https://wa.me/' + s.whatsapp.replace(/\D/g,'');
    // footer copyright
    document.querySelectorAll('[data-hx-footer-note]').forEach(el => { el.textContent = s.footerNote || DEFAULTS.footerNote; });
    // phone links
    document.querySelectorAll('[data-hx-phone]').forEach(el => {
      el.textContent = s.phone || DEFAULTS.phone;
      if (el.tagName === 'A') el.href = 'tel:' + (s.phone || DEFAULTS.phone).replace(/\s/g,'');
    });
    // CTA labels
    document.querySelectorAll('[data-hx-cta]').forEach(el => { el.textContent = s.ctaLabel || DEFAULTS.ctaLabel; });
    // social links
    const socials = { youtube: 'youtubeUrl', instagram: 'instagramUrl', facebook: 'facebookUrl', linkedin: 'linkedinUrl' };
    Object.entries(socials).forEach(([k, sk]) => {
      document.querySelectorAll(`[data-hx-social="${k}"]`).forEach(el => { if (s[sk]) el.href = s[sk]; });
    });
  }

  /* ── PIN utilities ───────────────────────────────────────*/
  async function hashPin(pin) { return sha256(SALT + pin); }
  function getStoredHash() { return localStorage.getItem(LS_PIN); }
  async function isPinSet() { return !!getStoredHash(); }
  async function checkPin(pin) {
    const stored = getStoredHash();
    if (!stored) return (await hashPin(DEFAULT_PIN)) === (await hashPin(pin)) || pin === DEFAULT_PIN;
    return (await hashPin(pin)) === stored;
  }
  async function setPin(newPin) { localStorage.setItem(LS_PIN, await hashPin(newPin)); }

  /* ── admin panel rendered HTML ───────────────────────────*/
  function buildPanelHTML() {
    return `
<div id="ap-wrap" class="min-h-screen" style="background:#f0f4f8;font-family:'Plus Jakarta Sans',sans-serif">
  <!-- ── PIN screen ── -->
  <div id="ap-pin" class="min-h-screen flex items-center justify-center p-5">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 bg-navy text-white font-extrabold text-lg px-5 py-2.5 rounded-2xl mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A86B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Admin Panel
        </div>
        <p class="text-sm text-slate2 font-semibold mt-1">Horex IT Solutions · Private Access</p>
      </div>
      <div class="bg-white rounded-2xl p-7" style="box-shadow:0 4px 24px rgba(0,51,102,.12)">
        <label class="block text-sm font-bold text-navy mb-2" for="ap-pin-input">Enter PIN</label>
        <input id="ap-pin-input" type="password" inputmode="numeric" maxlength="12" placeholder="••••"
          class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-lg font-bold text-center tracking-[.5em] focus:outline-none focus:border-em transition"
          autocomplete="current-password">
        <p id="ap-pin-err" class="hidden mt-3 text-sm font-semibold text-red-600 text-center"></p>
        <button id="ap-pin-btn" class="mt-4 w-full rounded-xl py-3.5 font-extrabold text-white transition"
          style="background:#00A86B">Unlock</button>
        <p class="mt-5 text-xs text-center font-semibold" style="color:#3D5675">
          Default PIN: <span class="font-extrabold text-navy">1234</span> — change it after first login.
        </p>
      </div>
    </div>
  </div>

  <!-- ── Main panel (hidden until unlocked) ── -->
  <div id="ap-main" class="hidden">
    <!-- Top bar -->
    <div class="sticky top-0 z-40 flex items-center justify-between gap-3 px-5 py-3"
      style="background:#003366;box-shadow:0 2px 12px rgba(0,51,102,.35)">
      <div class="flex items-center gap-3">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A86B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="3"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span class="text-white font-extrabold text-lg tracking-tight">Horex Admin</span>
      </div>
      <div class="flex items-center gap-2">
        <button id="ap-go-site" class="text-white/80 hover:text-white text-sm font-bold px-4 py-2 rounded-xl transition"
          style="background:rgba(255,255,255,.12)">← Back to site</button>
        <button id="ap-lock" class="text-white/80 hover:text-white text-sm font-bold px-4 py-2 rounded-xl transition"
          style="background:rgba(255,255,255,.12)">Lock</button>
      </div>
    </div>

    <!-- Tab nav -->
    <div class="flex gap-1 px-5 pt-5 pb-0 overflow-x-auto">
      ${[['settings','⚙️ Settings'],['leads','📋 Leads'],['security','🔒 Security']].map(([k,l],i)=>`
      <button data-tab="${k}" class="ap-tab shrink-0 px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${i===0?'text-navy bg-white':'text-white/70 hover:text-white'}"
        style="${i===0?'':'background:rgba(255,255,255,.12)'}">${l}</button>`).join('')}
    </div>

    <!-- Panel body -->
    <div class="p-5 space-y-6 max-w-4xl mx-auto">

      <!-- ══ SETTINGS TAB ══ -->
      <section id="ap-tab-settings">
        <div class="bg-white rounded-2xl p-6" style="box-shadow:0 2px 16px rgba(0,51,102,.08)">
          <div class="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <h2 class="text-xl font-extrabold text-navy">Site Settings</h2>
            <div class="flex flex-wrap gap-2">
              <button id="ap-export" class="ap-btn-sec text-sm px-4 py-2 rounded-xl font-bold">Export JSON</button>
              <label class="ap-btn-sec text-sm px-4 py-2 rounded-xl font-bold cursor-pointer">
                Import JSON <input id="ap-import-file" type="file" accept=".json" class="sr-only">
              </label>
              <button id="ap-reset" class="text-sm px-4 py-2 rounded-xl font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 transition">Reset to Defaults</button>
            </div>
          </div>
          <div id="ap-settings-fields" class="grid sm:grid-cols-2 gap-5"></div>
          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button id="ap-save" class="ap-btn px-7 py-3 rounded-xl font-extrabold text-white text-sm transition"
              style="background:#00A86B">Save &amp; Apply</button>
            <p id="ap-save-msg" class="hidden text-sm font-bold text-em2"></p>
          </div>
        </div>
      </section>

      <!-- ══ LEADS TAB ══ -->
      <section id="ap-tab-leads" class="hidden">
        <div class="bg-white rounded-2xl p-6" style="box-shadow:0 2px 16px rgba(0,51,102,.08)">
          <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 class="text-xl font-extrabold text-navy">Form Submissions</h2>
            <div class="flex flex-wrap gap-2">
              <select id="ap-lead-filter" class="text-sm border-2 border-navy/20 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-em">
                <option value="">All types</option>
                ${['Free Audit','Get a Quote','Build Page Quote','Contact','Build Website','Free Demo',
                   'Name Ideas Lead','Budget Planner Lead','Break-Even Lead'].map(t=>`<option>${t}</option>`).join('')}
              </select>
              <select id="ap-status-filter" class="text-sm border-2 border-navy/20 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-em">
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
              <button id="ap-leads-json" class="ap-btn-sec text-sm px-4 py-2 rounded-xl font-bold">Export JSON</button>
              <button id="ap-leads-csv"  class="ap-btn-sec text-sm px-4 py-2 rounded-xl font-bold">Export CSV</button>
              <button id="ap-leads-clear" class="text-sm px-4 py-2 rounded-xl font-bold border-2 border-red-200 text-red-600 hover:bg-red-50 transition">Clear All</button>
            </div>
          </div>
          <p id="ap-leads-count" class="text-sm font-semibold mb-4" style="color:#3D5675"></p>
          <div id="ap-leads-list" class="space-y-3"></div>
          <p id="ap-leads-empty" class="hidden text-center py-12 text-sm font-semibold" style="color:#3D5675">
            No submissions yet. Forms that are submitted while this tab is open will appear here.
          </p>
        </div>
      </section>

      <!-- ══ SECURITY TAB ══ -->
      <section id="ap-tab-security" class="hidden">
        <div class="bg-white rounded-2xl p-6" style="box-shadow:0 2px 16px rgba(0,51,102,.08)">
          <h2 class="text-xl font-extrabold text-navy mb-5">Change PIN</h2>
          <div class="max-w-sm space-y-4">
            <div>
              <label class="block text-sm font-bold text-navy mb-1.5" for="ap-old-pin">Current PIN</label>
              <input id="ap-old-pin" type="password" inputmode="numeric" maxlength="12" placeholder="••••"
                class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-em transition">
            </div>
            <div>
              <label class="block text-sm font-bold text-navy mb-1.5" for="ap-new-pin">New PIN</label>
              <input id="ap-new-pin" type="password" inputmode="numeric" maxlength="12" placeholder="New PIN (min 4 digits)"
                class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-em transition">
            </div>
            <div>
              <label class="block text-sm font-bold text-navy mb-1.5" for="ap-confirm-pin">Confirm New PIN</label>
              <input id="ap-confirm-pin" type="password" inputmode="numeric" maxlength="12" placeholder="Repeat new PIN"
                class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-em transition">
            </div>
            <p id="ap-pin-change-err" class="hidden text-sm font-semibold text-red-600"></p>
            <p id="ap-pin-change-ok"  class="hidden text-sm font-semibold" style="color:#00A86B"></p>
            <button id="ap-change-pin-btn" class="ap-btn px-6 py-3 rounded-xl font-extrabold text-white text-sm"
              style="background:#00A86B">Change PIN</button>
          </div>
          <div class="mt-8 pt-6 border-t border-navy/10">
            <h3 class="font-extrabold text-navy mb-3">Session Info</h3>
            <p class="text-sm font-semibold" style="color:#3D5675">Session stored in <code>sessionStorage</code>. Closing this tab logs you out automatically.</p>
            <p class="mt-2 text-sm font-semibold" style="color:#3D5675">PIN hash stored in <code>localStorage</code> as SHA-256 (salted). The PIN itself is never stored.</p>
            <div class="mt-4 p-4 rounded-xl" style="background:#E4F6EE">
              <p class="text-sm font-bold" style="color:#003366">Admin panel URL: <span id="ap-url" class="font-extrabold"></span></p>
              <p class="text-xs mt-1 font-semibold" style="color:#3D5675">Navigate here manually — there is no public link to the admin panel.</p>
            </div>
          </div>
        </div>
      </section>

    </div><!-- /panel body -->
  </div><!-- /ap-main -->
</div><!-- /ap-wrap -->`;
  }

  /* ── build settings fields ───────────────────────────────*/
  function renderSettingsFields(s) {
    const container = $('ap-settings-fields');
    if (!container) return;
    container.innerHTML = FIELDS.map(([key, label, type, hint]) => {
      const val = s[key];
      if (type === 'toggle') return `
        <div class="sm:col-span-2 flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-navy/10">
          <div>
            <p class="font-bold text-navy text-sm">${esc(label)}</p>
            ${hint ? `<p class="text-xs mt-0.5 font-semibold" style="color:#3D5675">${esc(hint)}</p>` : ''}
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" data-key="${key}" class="sr-only peer" ${val ? 'checked' : ''}>
            <div class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition" style="background:${val?'#00A86B':'#cbd5e1'}"></div>
          </label>
        </div>`;
      if (type === 'textarea') return `
        <div class="sm:col-span-2">
          <label class="block text-sm font-bold text-navy mb-1.5">${esc(label)}</label>
          ${hint ? `<p class="text-xs mb-1.5 font-semibold" style="color:#3D5675">${esc(hint)}</p>` : ''}
          <textarea data-key="${key}" rows="3"
            class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-em transition resize-y"
            placeholder="Leave blank to hide">${esc(String(val ?? ''))}</textarea>
        </div>`;
      return `
        <div>
          <label class="block text-sm font-bold text-navy mb-1.5">${esc(label)}</label>
          ${hint ? `<p class="text-xs mb-1.5 font-semibold" style="color:#3D5675">${esc(hint)}</p>` : ''}
          <input type="${type === 'url' ? 'url' : 'text'}" data-key="${key}" value="${esc(String(val ?? ''))}"
            class="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-em transition"
            placeholder="${esc(String(DEFAULTS[key] ?? ''))}">
        </div>`;
    }).join('');
    // Toggle visuals: update bg on change
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        const bg = cb.closest('label').querySelector('div');
        if (bg) bg.style.background = cb.checked ? '#00A86B' : '#cbd5e1';
      });
    });
  }

  function collectSettings() {
    const s = {};
    document.querySelectorAll('#ap-settings-fields [data-key]').forEach(el => {
      const k = el.dataset.key;
      if (el.type === 'checkbox') s[k] = el.checked;
      else s[k] = el.value.trim();
    });
    return s;
  }

  /* ── render leads list ───────────────────────────────────*/
  const STATUS_COLOURS = {
    new:       { bg:'#FEF9C3', text:'#854D0E', label:'New' },
    contacted: { bg:'#DBEAFE', text:'#1E40AF', label:'Contacted' },
    closed:    { bg:'#DCFCE7', text:'#166534', label:'Closed' }
  };

  function renderLeads() {
    const list    = $('ap-leads-list');
    const empty   = $('ap-leads-empty');
    const countEl = $('ap-leads-count');
    if (!list) return;
    const typeFilter   = ($('ap-lead-filter')   || {}).value || '';
    const statusFilter = ($('ap-status-filter') || {}).value || '';
    let leads = getLeads();
    if (typeFilter)   leads = leads.filter(l => l.formType === typeFilter);
    if (statusFilter) leads = leads.filter(l => (l.status || 'new') === statusFilter);
    if (countEl) countEl.textContent = leads.length
      ? `${leads.length} submission${leads.length > 1 ? 's' : ''}` + (typeFilter || statusFilter ? ' (filtered)' : '')
      : '';
    if (!leads.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    list.innerHTML = leads.map(l => {
      const sc = STATUS_COLOURS[l.status || 'new'] || STATUS_COLOURS.new;
      const dt = l.ts ? new Date(l.ts).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '';
      const msgLines = (l.message || '').split('\n').filter(Boolean);
      return `<div class="rounded-2xl border-2 border-navy/8 p-5 hover:border-em/30 transition" style="border-color:rgba(0,51,102,.08)">
        <div class="flex flex-wrap items-start gap-3 mb-3">
          <span class="text-xs font-extrabold rounded-full px-3 py-1" style="background:#E4F6EE;color:#003366">${esc(l.formType)}</span>
          <span class="text-xs font-bold rounded-full px-3 py-1" style="background:${sc.bg};color:${sc.text}">${sc.label}</span>
          <span class="text-xs font-semibold ml-auto" style="color:#3D5675">${esc(dt)}</span>
          ${l.sent===false?'<span class="text-xs font-bold text-red-600">⚠ Sheet send failed</span>':''}
        </div>
        <div class="grid sm:grid-cols-3 gap-2 text-sm mb-3">
          ${l.name    ? `<p><span class="font-bold text-navy">Name:</span> <span style="color:#3D5675">${esc(l.name)}</span></p>` : ''}
          ${l.contact ? `<p><span class="font-bold text-navy">Contact:</span> <span style="color:#3D5675">${esc(l.contact)}</span></p>` : ''}
          ${l.business? `<p><span class="font-bold text-navy">Business:</span> <span style="color:#3D5675">${esc(l.business)}</span></p>` : ''}
        </div>
        ${msgLines.length ? `<details class="mt-1">
          <summary class="text-xs font-bold cursor-pointer" style="color:#00A86B">View message fields (${msgLines.length})</summary>
          <ul class="mt-2 space-y-1 text-xs font-semibold" style="color:#3D5675">${msgLines.map(ml=>`<li class="flex gap-2"><span>${esc(ml)}</span></li>`).join('')}</ul>
        </details>` : ''}
        <div class="mt-3 flex flex-wrap gap-2">
          <label class="text-xs font-bold" style="color:#3D5675">Status:</label>
          ${['new','contacted','closed'].map(st=>`
            <button data-lead="${l.id}" data-st="${st}"
              class="ap-st-btn text-xs font-bold px-3 py-1 rounded-full border-2 transition ${(l.status||'new')===st?'border-navy text-navy bg-mint':'border-navy/20 hover:border-navy/50'}"
              style="${(l.status||'new')===st?'background:#E4F6EE':''}">${STATUS_COLOURS[st].label}</button>`).join('')}
          <button data-del="${l.id}" class="ml-auto text-xs font-bold text-red-500 hover:text-red-700 transition px-2">Delete</button>
        </div>
      </div>`;
    }).join('');
    // Status buttons
    list.querySelectorAll('.ap-st-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const leads2 = getLeads();
        const lead = leads2.find(l => l.id == btn.dataset.lead);
        if (lead) { lead.status = btn.dataset.st; saveLeads(leads2); renderLeads(); }
      });
    });
    // Delete buttons
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this submission?')) return;
        saveLeads(getLeads().filter(l => l.id != btn.dataset.del));
        renderLeads();
      });
    });
  }

  /* ── CSV export ──────────────────────────────────────────*/
  function leadsToCSV(leads) {
    const cols = ['id','ts','formType','name','contact','business','sent','status','message'];
    const esc2 = v => '"' + String(v ?? '').replace(/"/g,'""').replace(/\n/g,' | ') + '"';
    return [cols.join(','), ...leads.map(l => cols.map(c => esc2(l[c])).join(','))].join('\r\n');
  }

  function download(filename, text, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime }));
    a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ── tab switching ───────────────────────────────────────*/
  function showTab(name) {
    ['settings','leads','security'].forEach(t => {
      const sec = $(`ap-tab-${t}`);
      const btn = document.querySelector(`[data-tab="${t}"]`);
      if (sec) sec.classList.toggle('hidden', t !== name);
      if (btn) {
        const active = t === name;
        btn.style.background = active ? '#fff' : 'rgba(255,255,255,.12)';
        btn.style.color = active ? '#003366' : 'rgba(255,255,255,.7)';
      }
    });
    if (name === 'leads') renderLeads();
    if (name === 'security') { const u = $('ap-url'); if (u) u.textContent = location.origin + location.pathname + '#adminPanel'; }
  }

  /* ── show / hide the panel screens ──────────────────────*/
  function showMainPanel() {
    sessionStorage.setItem(SS_SESS, '1');
    const pin   = $('ap-pin');
    const main  = $('ap-main');
    if (pin)  pin.classList.add('hidden');
    if (main) { main.classList.remove('hidden'); }
    const s = getSettings();
    renderSettingsFields(s);
    showTab('settings');
  }

  function lockPanel() {
    sessionStorage.removeItem(SS_SESS);
    const pin  = $('ap-pin');
    const main = $('ap-main');
    if (pin)  { pin.classList.remove('hidden'); const inp = $('ap-pin-input'); if (inp) { inp.value = ''; inp.focus(); } }
    if (main) main.classList.add('hidden');
  }

  /* ── wire up all events ──────────────────────────────────*/
  function wireEvents() {
    // PIN unlock
    async function tryUnlock() {
      const inp = $('ap-pin-input'); if (!inp) return;
      const err = $('ap-pin-err');
      const ok  = await checkPin(inp.value.trim());
      if (ok) { if (err) { err.textContent = ''; err.classList.add('hidden'); } showMainPanel(); }
      else { if (err) { err.textContent = 'Incorrect PIN. Try again.'; err.classList.remove('hidden'); } inp.value = ''; inp.focus(); }
    }
    const unlockBtn = $('ap-pin-btn');
    if (unlockBtn) unlockBtn.addEventListener('click', tryUnlock);
    const pinInp = $('ap-pin-input');
    if (pinInp) pinInp.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

    // Lock
    const lockBtn = $('ap-lock');
    if (lockBtn) lockBtn.addEventListener('click', lockPanel);

    // Back to site
    const siteBtn = $('ap-go-site');
    if (siteBtn) siteBtn.addEventListener('click', () => { if (window.route) window.route('home'); });

    // Tabs
    document.querySelectorAll('.ap-tab').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // Settings save
    const saveBtn = $('ap-save');
    if (saveBtn) saveBtn.addEventListener('click', () => {
      const s = collectSettings();
      saveSettings(Object.assign(getSettings(), s));
      const msg = $('ap-save-msg');
      if (msg) { msg.textContent = '✓ Saved and applied.'; msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000); }
    });

    // Export JSON
    const exportBtn = $('ap-export');
    if (exportBtn) exportBtn.addEventListener('click', () => {
      download('horex-settings-' + new Date().toISOString().slice(0,10) + '.json',
        JSON.stringify(getSettings(), null, 2), 'application/json');
    });

    // Import JSON
    const importFile = $('ap-import-file');
    if (importFile) importFile.addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Not an object');
          saveSettings(Object.assign(getSettings(), parsed));
          renderSettingsFields(getSettings());
          alert('Settings imported and applied.');
        } catch (err) { alert('Invalid JSON file: ' + err.message); }
        importFile.value = '';
      };
      reader.readAsText(f);
    });

    // Reset to defaults
    const resetBtn = $('ap-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (!confirm('Reset all settings to defaults? This cannot be undone.')) return;
      localStorage.removeItem(LS_SETTINGS);
      applySettings(DEFAULTS);
      renderSettingsFields(DEFAULTS);
    });

    // Leads filters
    [$('ap-lead-filter'), $('ap-status-filter')].forEach(el => {
      if (el) el.addEventListener('change', renderLeads);
    });

    // Leads export JSON
    const leadsJson = $('ap-leads-json');
    if (leadsJson) leadsJson.addEventListener('click', () => {
      const filter = ($('ap-lead-filter') || {}).value || '';
      let leads = getLeads();
      if (filter) leads = leads.filter(l => l.formType === filter);
      download('horex-leads-' + new Date().toISOString().slice(0,10) + '.json',
        JSON.stringify(leads, null, 2), 'application/json');
    });

    // Leads export CSV
    const leadsCsv = $('ap-leads-csv');
    if (leadsCsv) leadsCsv.addEventListener('click', () => {
      const filter = ($('ap-lead-filter') || {}).value || '';
      let leads = getLeads();
      if (filter) leads = leads.filter(l => l.formType === filter);
      download('horex-leads-' + new Date().toISOString().slice(0,10) + '.csv',
        leadsToCSV(leads), 'text/csv');
    });

    // Leads clear all
    const leadsClear = $('ap-leads-clear');
    if (leadsClear) leadsClear.addEventListener('click', () => {
      if (!confirm('Delete ALL submissions from local storage? This cannot be undone.')) return;
      localStorage.removeItem(LS_LEADS);
      renderLeads();
    });

    // Change PIN
    const changePinBtn = $('ap-change-pin-btn');
    if (changePinBtn) changePinBtn.addEventListener('click', async () => {
      const oldVal  = ($('ap-old-pin')     || {}).value || '';
      const newVal  = ($('ap-new-pin')     || {}).value || '';
      const confVal = ($('ap-confirm-pin') || {}).value || '';
      const errEl   = $('ap-pin-change-err');
      const okEl    = $('ap-pin-change-ok');
      const hide = el => el && el.classList.add('hidden');
      const show = (el, txt) => { if (el) { el.textContent = txt; el.classList.remove('hidden'); } };
      hide(errEl); hide(okEl);
      if (!(await checkPin(oldVal))) return show(errEl, 'Current PIN is incorrect.');
      if (!newVal || newVal.length < 4) return show(errEl, 'New PIN must be at least 4 digits.');
      if (newVal !== confVal) return show(errEl, 'New PINs do not match.');
      await setPin(newVal);
      ['ap-old-pin','ap-new-pin','ap-confirm-pin'].forEach(id => { const el = $(id); if (el) el.value = ''; });
      show(okEl, '✓ PIN changed successfully.');
    });
  }

  /* ── inject the view div into index.html ─────────────────
     We add <div id="view-adminPanel"> to the DOM dynamically
     so index.html itself needs no edit beyond the script tag. */
  function injectViewDiv() {
    if ($('view-adminPanel')) return;
    const div = document.createElement('div');
    div.id = 'view-adminPanel';
    div.className = 'hidden';
    div.innerHTML = buildPanelHTML();
    document.body.appendChild(div);
  }

  /* ── add admin CSS ───────────────────────────────────────*/
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
      #view-adminPanel { font-family: 'Plus Jakarta Sans', sans-serif; }
      .ap-btn { transition: opacity .2s, transform .15s; }
      .ap-btn:hover { opacity: .88; transform: translateY(-1px); }
      .ap-btn-sec { background: #E4F6EE; color: #003366; border: 2px solid rgba(0,51,102,.12); transition: background .2s, border-color .2s; }
      .ap-btn-sec:hover { background: #d1f0e3; border-color: #00A86B; }
      .ap-tab { transition: background .2s, color .2s; }
      #ap-pin-btn:hover { opacity: .88; }
      #ap-wrap summary { user-select: none; }
    `;
    document.head.appendChild(s);
  }

  /* ── patch the router to include adminPanel ──────────────
     We wait until window.route exists (19-language-and-router.js
     runs after us), then wrap it.                            */
  function patchRouter() {
    // Retry until route is available (scripts load synchronously
    // but we patch immediately after DOMContentLoaded)
    const orig = window.route;
    if (!orig) return;
    window.route = function (v, scroll, fromHash) {
      if (v === 'adminPanel') {
        // hide all standard views
        document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
        const ap = $('view-adminPanel');
        if (ap) ap.classList.remove('hidden');
        document.title = 'Admin Panel – Horex IT Solutions';
        if (!fromHash) try { history.pushState(null, '', '#adminPanel'); } catch(e) {}
        window.scrollTo({ top: 0 });
        // check session
        if (sessionStorage.getItem(SS_SESS) === '1') showMainPanel();
        // else PIN screen is already shown
        return;
      }
      // hide admin panel when navigating elsewhere
      const ap = $('view-adminPanel');
      if (ap) ap.classList.add('hidden');
      return orig(v, scroll, fromHash);
    };
    // Handle direct navigation to #adminPanel
    window.addEventListener('hashchange', () => {
      if (location.hash === '#adminPanel') window.route('adminPanel', null, true);
    });
    if (location.hash === '#adminPanel') window.route('adminPanel', null, true);
  }

  /* ── boot ────────────────────────────────────────────────*/
  function boot() {
    injectCSS();
    injectViewDiv();
    wireEvents();
    patchRouter();
    installLeadMirror();
    applySettings();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Also patch after the router script loads (it's the last script)
  window.addEventListener('load', () => {
    patchRouter();
    installLeadMirror();
    applySettings();
  });
})();
