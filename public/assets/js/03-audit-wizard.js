(function(){
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const TOTAL = 8; let step = 1, lang = 'en';
const tick = '<svg class="shrink-0 mt-0.5" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#00A86B"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$$('.ck').forEach(e => e.outerHTML = tick);

// Build option chips
$$('[data-chips]').forEach(box => {
  const multi = box.hasAttribute('data-multi');
  box.classList.add('flex', 'flex-wrap', 'gap-2.5');
  box.dataset.opts.split('|').forEach(o => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = o; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      if (!multi) box.querySelectorAll('.chip').forEach(c => { c.classList.remove('sel'); c.setAttribute('aria-pressed', 'false'); });
      b.classList.toggle('sel', multi ? !b.classList.contains('sel') : true);
      b.setAttribute('aria-pressed', b.classList.contains('sel'));
      if (box.dataset.chips === 'hasSite') $('#urlWrap').classList.toggle('hidden', get('hasSite')[0] !== 'Yes');
      hideErr();
    });
    box.appendChild(b);
  });
});
const get = n => n === 'type' ? ($('#type').value ? [$('#type').value] : []) : $$(`[data-chips="${n}"] .chip.sel`).map(c => c.textContent);
$('#type').addEventListener('change', () => hideErr());
const showErr = m => { const e = $('#err'); e.textContent = m; e.classList.remove('hidden'); };
const hideErr = () => $('#err').classList.add('hidden');
const v = id => $('#' + id).value.trim();

function validate(s) {
  if (s === 1) {
    if (!v('bname')) return 'Please tell us your business name.';
    if (!v('city')) return 'Please tell us your city.';
    if (!get('type').length) return 'Please pick the kind of business.';
  }
  if (s === 2 && !get('sell').length) return 'Please choose how you sell.';
  if (s === 3) {
    if (!get('hasSite').length) return 'Please choose Yes or No.';
    if (get('hasSite')[0] === 'Yes' && !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v('url'))) return 'Please type your website address, like www.yourbusiness.com.';
  }
  if (s === 4 && !(get('insta').length && get('fb').length && get('gmaps').length)) return 'Please answer all three questions.';
  if (s === 5 && !get('pay').length) return 'Please tick at least one way customers pay you.';
  if (s === 6 && !(get('enq').length && get('sales').length)) return 'Please answer both questions.';
  if (s === 7 && !get('problem').length) return 'Please pick your biggest problem.';
  if (s === 8) {
    if (!v('name')) return 'Please type your name.';
    if (!/^[6-9]\d{9}$/.test(v('mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return 'Please type a valid 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) return 'Please type a valid email address.';
    if (!$('#consent').checked) return 'Please tick the box so we can email you your audit.';
  }
  return '';
}

function render() {
  $$('.step').forEach(el => el.classList.toggle('on', +el.dataset.step === step));
  const p = step / TOTAL * 100;
  $('#bar').style.width = p + '%'; $('#pct').textContent = Math.round(p) + '%';
  $('#qLabel').textContent = window.LANG === 'hi' ? `सवाल ${step} / ${TOTAL}` : `Question ${step} of ${TOTAL}`;
  $('#back').classList.toggle('invisible', step === 1);
  $('#next').classList.toggle('hidden', step === TOTAL);
  $('#submit').classList.toggle('hidden', step !== TOTAL);
  $('#nav').classList.toggle('justify-between', step !== TOTAL);
  hideErr();
}
const go = d => {
  if (d > 0) { const m = validate(step); if (m) return showErr(m); }
  step = Math.min(TOTAL, Math.max(1, step + d)); render();
  $('#wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
};
$('#next').addEventListener('click', () => go(1));
$('#back').addEventListener('click', () => go(-1));
$('#form').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); step < TOTAL ? go(1) : $('#submit').click(); } });

$('#submit').addEventListener('click', () => {
  const m = validate(8); if (m) return showErr(m);
  const data = { business: v('bname'), city: v('city'), type: get('type')[0], sell: get('sell')[0], hasWebsite: get('hasSite')[0], website: v('url'),
    instagram: get('insta')[0], facebook: get('fb')[0], googleMaps: get('gmaps')[0], payments: get('pay'), enquiries: get('enq')[0], sales: get('sales')[0],
    problem: get('problem')[0], name: v('name'), mobile: v('mobile'), email: v('email'), consent: true };
  // TODO: send `data` to your server or CRM here (for example with fetch to your own API).
  console.log('Audit request', data);
  hideErr();
  $('#doneName').textContent = data.name.split(' ')[0]; $('#doneBiz').textContent = data.business; $('#doneMail').textContent = data.email;
  window.userData = window.auditData = data; window.route('report');
});

// Sample report
$('#sampleBtn').addEventListener('click', () => $('#sample').classList.toggle('hidden'));

// FAQ
const faqs = [
  ['Will you post or change anything without asking me?', 'No. Nothing goes live without your OK. The audit only looks at your public presence.'],
  ['Is my data safe?', 'We use your details only to send your audit and to answer your questions about it.'],
  ['What if I do not like what you make?', 'Just tell us what to change. You get a clear written price first, and work starts only after you say yes.'],
  ['Do I need technical skills?', 'Not at all! Tell us about your business in simple words, and we handle all the tech work.'],
  ['Can I cancel?', 'Yes. The audit is free, and nothing starts until you say yes.']
];
$('#faqs').innerHTML = faqs.map(f => `<div class="faq bg-white rounded-2xl soft border border-navy/10">
  <button type="button" class="w-full flex items-center justify-between gap-4 text-left p-5 font-bold" aria-expanded="false"><span>${f[0]}</span>
  <svg class="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A86B" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/><path class="vbar" d="M12 5v14"/></svg></button>
  <div class="faq-body"><div class="overflow-hidden"><p class="px-5 pb-5 text-slate2">${f[1]}</p></div></div></div>`).join('');
$$('.faq button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.parentElement.classList.toggle('open'))));

window.auditRender = render;
render();

})();
