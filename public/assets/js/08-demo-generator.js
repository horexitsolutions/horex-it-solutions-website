(function () {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => { u = (u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.') ? x.href : ''; } catch (e) { return ''; } };
const D = { feel: 'Modern', lang: 'English', photos: [] };

// Option chips
function chips(id, opts, key) {
  const box = $(id);
  opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (D[key] === o ? ' sel' : ''); b.textContent = o;
    b.addEventListener('click', () => { D[key] = o; box.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c === b)); }); box.appendChild(b); });
}
chips('#dm-feel', ['Luxury', 'Bold', 'Warm', 'Calm', 'Playful', 'Modern'], 'feel');
chips('#dm-lang', ['English', 'Hinglish'], 'lang');

// Photos: read, shrink and keep in memory as data URLs
function shrink(file) { return new Promise(res => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => {
  const k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .8)); }; im.onerror = () => res(''); im.src = fr.result; }; fr.onerror = () => res(''); fr.readAsDataURL(file); }); }
function thumbs() { $('#dm-thumbs').innerHTML = D.photos.map((p, i) => `<div class="thumb"><img src="${p}" alt="" class="aspect-square w-full object-cover rounded-2xl soft"><button type="button" data-rm="${i}" aria-label="Remove" class="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold grid place-items-center">×</button></div>`).join(''); }
$('#dm-photos').addEventListener('change', async e => {
  const files = [...e.target.files].filter(f => f.type.startsWith('image/')); e.target.value = '';
  for (const f of files) { if (D.photos.length >= 8) { err('#dm-err', 'You can add up to 8 photos.'); break; } const d = await shrink(f); if (d) D.photos.push(d); }
  thumbs();
});
$('#dm-thumbs').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; D.photos.splice(+b.dataset.rm, 1); thumbs(); });

function err(sel, m) { const x = $(sel); x.textContent = m; x.classList.remove('hidden'); }
const clr = sel => $(sel).classList.add('hidden');
function stage(n) {
  $$('#dmFlow .stage').forEach(s => s.classList.toggle('on', s.dataset.stage === n));
  const prev = n === 'preview';
  $('#dmFlow').classList.toggle('hidden', prev); $('#dmPreview').classList.toggle('hidden', !prev);
  $('#dmFloat').classList.toggle('hidden', !prev); $('#dmFootA').classList.toggle('hidden', prev); $('#dmFootB').classList.toggle('hidden', !prev);
  window.scrollTo({ top: 0 });
}
const v = id => $(id).value.trim();
['#dm-biz', '#dm-what', '#dm-city', '#dm-email', '#dm-mobile'].forEach(s => $(s).addEventListener('input', () => clr('#dm-err')));

$('#dm-go').addEventListener('click', async () => {
  const btn = $('#dm-go'); if (HorexForm.isBusy(btn)) return;
  if (!v('#dm-biz')) return err('#dm-err', 'Please type your business name.');
  if (!v('#dm-what')) return err('#dm-err', 'Please tell us what you sell or do.');
  if (!v('#dm-city')) return err('#dm-err', 'Please tell us your city.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#dm-email'))) return err('#dm-err', 'Please type a valid email address.');
  if (v('#dm-mobile') && !/^[6-9]\d{9}$/.test(v('#dm-mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return err('#dm-err', 'Please type a valid 10-digit mobile number.');
  Object.assign(D, { biz: v('#dm-biz'), what: v('#dm-what'), city: v('#dm-city'), area: v('#dm-area'), hours: v('#dm-hours'), maps: v('#dm-maps'), old: v('#dm-old'), email: v('#dm-email'), mobile: v('#dm-mobile'), consent: $('#dm-consent').checked });
  clr('#dm-err'); window.demoData = D; sendCode(false);
});
let timers = [];
// ---- Real email OTP via Google Apps Script ----
async function sendCode(isResend) {
  timers.forEach(clearTimeout); timers = [];
  // If this is a fresh send (not a resend), show the "sending" animation stage.
  // If it is a resend, stay on the OTP stage so the visitor can see the spinner on the button.
  const resendBtn = isResend ? $('#otp-resend') : null;
  if (!isResend) { stage('send'); $('#otpMail').textContent = D.email; $('#otp').value = ''; clr('#otp-err'); }
  if (resendBtn) { resendBtn.disabled = true; resendBtn.style.opacity = '.5'; }
  const res = await HorexForm.request('send_otp', { email: D.email, name: D.biz, language: HorexForm.language() });
  if (resendBtn) { resendBtn.disabled = false; resendBtn.style.opacity = ''; }
  if (!res.ok) {
    if (isResend) {
      // Show error on the OTP stage without leaving it
      err('#otp-err', HorexForm.otpMessage(res.error));
    } else {
      stage('form'); err('#dm-err', HorexForm.otpMessage(res.error));
    }
    return;
  }
  if (!isResend) { stage('otp'); $('#otpMail').textContent = D.email; $('#otp').focus(); }
  // Success confirmation (resend or first send reaching OTP stage)
  const msg = HorexForm.language() === 'Hindi' ? '\u0906\u092a\u0915\u0947 \u0908\u092e\u0947\u0932 \u092a\u0930 \u0928\u092f\u093e \u0915\u094b\u0921 \u092d\u0947\u091c \u0926\u093f\u092f\u093e \u0917\u092f\u093e \u0939\u0948\u0964' : 'A new code has been sent to your email.';
  if (isResend) {
    $('#otp-err').textContent = msg; $('#otp-err').classList.remove('hidden');
    $('#otp-err').style.cssText = 'background:#D1FAE5!important;color:#064E3B!important';
    setTimeout(() => { clr('#otp-err'); $('#otp-err').style.cssText = ''; }, 4000);
  }
}

$('#otp-resend').addEventListener('click', () => sendCode(true));
$('#otp-back').addEventListener('click', () => { stage('form'); clr('#dm-err'); });
$('#otp').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); clr('#otp-err'); });

$('#otp-go').addEventListener('click', async () => {
  if (!/^\d{6}$/.test($('#otp').value)) return err('#otp-err', 'Please enter the 6-digit code.');
  const btn = $('#otp-go'); if (HorexForm.isBusy(btn)) return;
  HorexForm.busy(btn, true, 'Checking\u2026');
  const res = await HorexForm.request('verify_otp', { email: D.email, otp: $('#otp').value });
  HorexForm.busy(btn, false);
  if (!res.ok) { err('#otp-err', HorexForm.otpMessage(res.error)); return; }
  // OTP verified — save lead then generate demo
  clr('#otp-err');
  await HorexForm.send('Free Demo', {
    name: '', contact: HorexForm.contact(D.mobile, D.email), businessName: D.biz,
    message: HorexForm.lines([['Business Name', D.biz], ['What They Sell Or Do', D.what], ['City', D.city], ['Area', D.area],
      ['Opening Hours', D.hours], ['Website Style', D.feel], ['Website Language', D.lang], ['Photos Added', D.photos.length],
      ['Google Maps Link', D.maps], ['Old Website', D.old], ['Email', D.email], ['Mobile', D.mobile], ['OK To Contact', D.consent]])
  });
  generate();
});

$('#otp').addEventListener('keydown', e => { if (e.key === 'Enter') $('#otp-go').click(); });

const STEPS = ['Collecting your details...', 'Reading your photos...', 'Writing your words...', 'Designing your layout...', 'Adding motion and checking readiness...'];
const tickSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function generate() {
  timers.forEach(clearTimeout); stage('gen');
  $('#gen-steps').innerHTML = STEPS.map(s => `<li class="gstep flex items-center gap-3 font-semibold"><span class="gi w-7 h-7 rounded-full border-2 border-em grid place-items-center shrink-0">${tickSvg}</span><span>${s}</span></li>`).join('');
  const li = $$('#gen-steps .gstep'); $('#gen-bar').style.width = '0%'; timers = [];
  li.forEach((el, i) => {
    timers.push(setTimeout(() => { el.classList.add('on'); $('#gen-bar').style.width = ((i + .5) / STEPS.length * 100) + '%'; }, i * 1100));
    timers.push(setTimeout(() => { el.classList.add('done'); $('#gen-bar').style.width = ((i + 1) / STEPS.length * 100) + '%'; }, i * 1100 + 900));
  });
  timers.push(setTimeout(() => { $('#dmSite').innerHTML = site(D); stage('preview'); }, STEPS.length * 1100 + 300));
}
$('#dm-again').addEventListener('click', () => { stage('form'); clr('#dm-err'); });

// When the visitor navigates back to the demo page, always reset to the form stage
// so they can start fresh (or continue if they just came from a different page mid-flow).
(function () {
  const prev = window.onView;
  window.onView = v => {
    if (prev) prev(v);
    if (v === 'demo') {
      // Reset to form; the OTP / generation state is single-use anyway
      timers.forEach(clearTimeout); timers = [];
      stage('form'); clr('#dm-err');
    }
  };
})();

// ---- The demo website (built on this page from the answers; no outside AI service is called) ----
const TONES = {
  Luxury: { f: 'Georgia,"Times New Roman",serif', w: 600, up: 0, r: '1rem', page: '#FAF9F6', hero: 'linear-gradient(135deg,#003366,#0A4A5F)', dark: 1 },
  Bold: { f: 'inherit', w: 800, up: 1, r: '.75rem', page: '#FFFFFF', hero: 'linear-gradient(135deg,#00A86B,#003366)', dark: 1 },
  Warm: { f: 'inherit', w: 700, up: 0, r: '1.5rem', page: '#FAF9F6', hero: 'linear-gradient(135deg,#E4F6EE,#FAF9F6)', dark: 0 },
  Calm: { f: 'inherit', w: 600, up: 0, r: '1.25rem', page: '#F2FAF6', hero: 'linear-gradient(135deg,#FFFFFF,#E4F6EE)', dark: 0 },
  Playful: { f: 'inherit', w: 800, up: 0, r: '2rem', page: '#FFFFFF', hero: 'linear-gradient(135deg,#00A86B,#E4F6EE)', dark: 0, tilt: 1 },
  Modern: { f: 'inherit', w: 700, up: 0, r: '1rem', page: '#FFFFFF', hero: 'linear-gradient(135deg,#003366,#00A86B)', dark: 1 }
};
const TXT = {
  English: {
    tag: { Luxury: '{biz}: crafted with care in {city}.', Bold: '{biz}. Built to stand out in {city}.', Warm: 'Welcome to {biz}, your friendly local in {city}.', Calm: '{biz}: simple, honest and relaxed, in {city}.', Playful: 'Hello from {biz}! Fun, friendly and right here in {city}.', Modern: '{biz}: modern {what} for {city}.' },
    sub: 'We offer {what} in {place}. Come visit us or call today.', call: 'Call us', visit: 'Visit us', do: 'What we do', ph: 'Our photos', ab: 'About the founder', vi: 'Visit us',
    card: '{item}: quality work, clear pricing and a friendly welcome.', fill: ['Friendly, expert service', 'Clear and fair pricing', 'Fast replies'],
    about: '{biz} started with a simple idea: do {what} the right way and treat every customer well. Today we proudly serve {city}.', founder: 'Founder, {biz}',
    hours: 'Opening hours: {h}', nohours: 'Call us to confirm opening hours.', find: 'Find us in {place}', map: 'Open in Google Maps', more: 'Instagram or website', ph0: 'Your photo here' },
  Hinglish: {
    tag: { Luxury: '{biz}: {city} mein premium andaaz.', Bold: '{biz}. {city} mein sabse alag.', Warm: '{biz} mein aapka swagat hai, {city} ka apna.', Calm: '{biz}: simple, imaandaar aur sukoon bhara, {city} mein.', Playful: '{biz} ki taraf se hello! {city} mein masti aur bharosa.', Modern: '{biz}: {city} ke liye modern {what}.' },
    sub: 'Hum {place} mein {what} dete hain. Aaj hi aaiye ya call kijiye.', call: 'Call kijiye', visit: 'Aaiye', do: 'Hum kya karte hain', ph: 'Hamari photos', ab: 'Founder ke baare mein', vi: 'Humse milne aaiye',
    card: '{item}: acchi quality, saaf daam aur dosti bhara swagat.', fill: ['Dosti bhari expert service', 'Saaf aur sahi daam', 'Tez response'],
    about: '{biz} ek simple soch se shuru hua: {what} sahi tareeke se karna aur har customer ko izzat dena. Aaj hum {city} mein fakhr se seva dete hain.', founder: 'Founder, {biz}',
    hours: 'Khulne ka samay: {h}', nohours: 'Khulne ka samay jaanne ke liye call kijiye.', find: 'Humein dhundhiye: {place}', map: 'Google Maps mein kholiye', more: 'Instagram ya website', ph0: 'Aapki photo yahan' }
};
const fm = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => k in o ? o[k] : m);
function site(d) {
  const T = TONES[d.feel] || TONES.Modern, L = TXT[d.lang] || TXT.English;
  const biz = esc(d.biz), city = esc(d.city), what = esc(d.what.toLowerCase()), place = esc(d.area ? d.area + ', ' + d.city : d.city);
  const o = { biz, city, what, place };
  const items = d.what.split(/,|&|;|\/|\band\b/i).map(s => s.trim()).filter(Boolean).slice(0, 3); while (items.length < 3) items.push(L.fill[items.length]);
  const fg = T.dark ? '#FFFFFF' : '#003366', sub = T.dark ? 'rgba(255,255,255,.88)' : '#3D5675';
  const hf = `font-family:${T.f};font-weight:${T.w};${T.up ? 'text-transform:uppercase;' : ''}`;
  const rad = `border-radius:${T.r}`, tilt = i => T.tilt ? `transform:rotate(${i % 2 ? 1.2 : -1.2}deg);` : '';
  const maps = safeUrl(d.maps) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([d.biz, d.area, d.city].filter(Boolean).join(' '))}`, old = safeUrl(d.old);
  const phones = d.mobile ? `tel:${esc(d.mobile.replace(/[^\d+]/g, ''))}` : '#visit';
  const photos = d.photos.length ? d.photos.map((p, i) => `<img src="${p}" alt="${biz}" class="w-full aspect-square object-cover soft" style="${rad};${tilt(i)}">`).join('')
    : [0, 1, 2, 3, 4, 5].map(i => `<div class="aspect-square soft grid place-items-center text-center text-sm font-bold p-3" style="${rad};${tilt(i)}background:${['#E4F6EE', '#003366', '#00A86B'][i % 3]};color:${i % 3 === 0 ? '#003366' : '#fff'}">${L.ph0}</div>`).join('');
  return `<div style="background:${T.page};color:#003366">
  <div class="sticky top-0 z-30 backdrop-blur" style="background:rgba(255,255,255,.85);box-shadow:0 8px 24px -16px rgba(0,51,102,.3)"><div class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3"><span class="text-lg" style="${hf}">${biz}</span><nav class="hidden sm:flex gap-6 text-sm font-semibold text-slate2"><a href="#dm-s1" data-local>${L.do}</a><a href="#dm-s2" data-local>${L.ph}</a><a href="#dm-s3" data-local>${L.ab}</a><a href="#visit" data-local>${L.vi}</a></nav></div></div>
  <section style="background:${T.hero};color:${fg}"><div class="max-w-6xl mx-auto px-5 py-16 sm:py-24"><p class="inline-block text-xs font-bold tracking-widest rounded-full px-3 py-1.5" style="background:rgba(0,168,107,.9);color:#fff">${city}${d.area ? ' · ' + esc(d.area) : ''}</p>
   <h2 class="mt-5 text-4xl sm:text-6xl leading-tight max-w-3xl" style="${hf}">${fm(L.tag[d.feel] || L.tag.Modern, o)}</h2><p class="mt-5 text-lg max-w-2xl" style="color:${sub}">${fm(L.sub, o)}</p>
   <div class="mt-8 flex flex-wrap gap-3"><a href="${phones}" class="inline-block font-extrabold px-7 py-3.5 rounded-full" style="background:#00A86B;color:#fff">${L.call}</a><a href="#visit" data-local class="inline-block font-extrabold px-7 py-3.5 rounded-full" style="background:#fff;color:#003366">${L.visit}</a></div></div></section>
  <section id="dm-s1" class="max-w-6xl mx-auto px-5 py-14"><h3 class="text-3xl" style="${hf}">${L.do}</h3><div class="mt-6 grid md:grid-cols-3 gap-5">${items.map((it, i) => `<div class="bg-white p-6 soft" style="${rad};${tilt(i)}"><span class="w-10 h-10 rounded-full grid place-items-center font-extrabold text-white" style="background:#00A86B">${i + 1}</span><h4 class="mt-4 text-xl font-extrabold">${esc(it)}</h4><p class="mt-2 text-slate2">${fm(L.card, { item: esc(it) })}</p></div>`).join('')}</div></section>
  <section id="dm-s2" class="max-w-6xl mx-auto px-5 pb-14"><h3 class="text-3xl" style="${hf}">${L.ph}</h3><div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">${photos}</div></section>
  <section id="dm-s3" class="max-w-6xl mx-auto px-5 pb-14"><div class="bg-white p-7 sm:p-10 soft grid sm:grid-cols-4 gap-6 items-center" style="${rad}"><div class="w-24 h-24 rounded-full grid place-items-center text-4xl font-extrabold text-white mx-auto" style="background:linear-gradient(135deg,#003366,#00A86B)">${esc(d.biz.trim().charAt(0).toUpperCase())}</div><div class="sm:col-span-3"><h3 class="text-3xl" style="${hf}">${L.ab}</h3><p class="mt-3 text-slate2 leading-relaxed">${fm(L.about, o)}</p><p class="mt-3 font-bold text-em2">${fm(L.founder, o)}</p></div></div></section>
  <section id="visit" class="max-w-6xl mx-auto px-5 pb-20"><h3 class="text-3xl" style="${hf}">${L.vi}</h3><div class="mt-6 grid md:grid-cols-2 gap-5"><div class="relative min-h-[14rem] soft overflow-hidden" style="${rad};background:#E4F6EE"><div class="absolute inset-0 opacity-70" style="background-image:linear-gradient(rgba(0,51,102,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,51,102,.08) 1px,transparent 1px);background-size:32px 32px"></div><svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="56" height="56" viewBox="0 0 24 24" fill="#00A86B"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg></div>
   <div class="bg-white p-7 soft" style="${rad}"><p class="text-xl font-extrabold">${fm(L.find, o)}</p><p class="mt-3 text-slate2">${d.hours ? fm(L.hours, { h: esc(d.hours) }) : L.nohours}</p><div class="mt-5 flex flex-wrap gap-3"><a href="${esc(maps)}" target="_blank" rel="noopener noreferrer" class="inline-block font-bold px-5 py-2.5 rounded-full text-white" style="background:#00A86B">${L.map}</a>${old ? `<a href="${esc(old)}" target="_blank" rel="noopener noreferrer" class="inline-block font-bold px-5 py-2.5 rounded-full" style="background:#E4F6EE;color:#003366">${L.more}</a>` : ''}</div></div></div></section>
  </div>`;
}
window.__demoSite = site;
// In-preview anchors scroll inside the page (the app router owns the hash)
$('#dmSite').addEventListener('click', e => { const a = e.target.closest('a[data-local]'); if (!a) return; e.preventDefault(); const t = document.getElementById(a.getAttribute('href').slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
})();
