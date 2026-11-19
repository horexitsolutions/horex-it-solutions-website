(function () {
const $ = s => document.querySelector(s);
const OPTS = [['website', 'Website'], ['app', 'App'], ['gbp', 'Google Business Profile'], ['seo', 'SEO'], ['meta', 'Meta Ads'], ['social', 'Social Media'], ['chatbot', 'Chatbot'], ['whatsapp', 'WhatsApp Agent'], ['voice', 'Voice Agent'], ['followup', 'Lead Follow-up'], ['booking', 'Booking and reminders'], ['invoices', 'Invoices and payment reminders'], ['orders', 'Online orders'], ['dash', 'Dashboards']];
const MAX = 3, sel = []; let done = false;
const tick = '<svg class="shrink-0 mt-0.5" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#00A86B"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$('#qt-badges').innerHTML = ['A reply within 1 working day', 'Takes about a minute, no payment here', 'Not sure what you need? Pick what sounds close and we will help you choose'].map(t => `<li class="flex gap-2 bg-white rounded-2xl p-3.5 soft">${tick}<span>${t}</span></li>`).join('');
$('#qt-pills').innerHTML = OPTS.map(o => `<button type="button" class="chip" data-id="${o[0]}" aria-pressed="false">${o[1]}</button>`).join('');
function render() {
  document.querySelectorAll('#qt-pills .chip').forEach(b => { const on = sel.includes(b.dataset.id); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); b.style.opacity = !on && sel.length >= MAX ? '.5' : ''; });
  $('#qt-count').textContent = sel.length ? (window.LANG === 'hi' ? `${sel.length} / ${MAX} चुने गए` : `${sel.length} of ${MAX} picked`) : '';
}
$('#qt-pills').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return; const id = b.dataset.id, i = sel.indexOf(id);
  $('#qt-err').classList.add('hidden');
  if (i >= 0) { sel.splice(i, 1); $('#qt-limit').classList.add('hidden'); }
  else if (sel.length >= MAX) { $('#qt-limit').classList.remove('hidden'); return; }
  else sel.push(id);
  render();
});
// Called by service-page buttons: tick that service (replace the oldest if three are already picked)
window.quotePick = id => { if (!OPTS.some(o => o[0] === id)) return; if (!sel.includes(id)) { if (sel.length >= MAX) sel.shift(); sel.push(id); } $('#qt-limit').classList.add('hidden'); render(); };
window.quoteRender = render;
$('#qt-noteBtn').addEventListener('click', () => {
  const open = $('#qt-note').classList.toggle('hidden') === false;
  $('#qt-noteBtn').textContent = open ? '− Hide note' : '+ Add a note'; $('#qt-noteBtn').setAttribute('aria-expanded', open);
  if (open) $('#qt-note').focus(); if (window.LANG === 'hi' && window.applyLang) window.applyLang();
});
const err = m => { const e = $('#qt-err'); e.textContent = m; e.classList.remove('hidden'); };
['#qt-name', '#qt-mobile', '#qt-email', '#qt-city', '#qt-note'].forEach(s => $(s).addEventListener('input', () => $('#qt-err').classList.add('hidden')));
$('#qt-go').addEventListener('click', async () => {
  const btn = $('#qt-go'); if (HorexForm.isBusy(btn)) return;
  const v = id => $(id).value.trim();
  if (!v('#qt-name')) return err('Please type your name.');
  if (!/^[6-9]\d{9}$/.test(v('#qt-mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return err('Please type a valid 10-digit mobile number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#qt-email'))) return err('Please type a valid email address.');
  if (!v('#qt-city')) return err('Please tell us your city.');
  if (!sel.length && !v('#qt-note')) return err('Please tick a service or tell us about your project.');
  const names = Object.fromEntries(OPTS);
  const data = { name: v('#qt-name'), mobile: v('#qt-mobile'), email: v('#qt-email'), business: v('#qt-biz'), city: v('#qt-city'), services: sel.map(id => names[id]), budget: $('#qt-budget').value, start: $('#qt-start').value, note: v('#qt-note'), mayCallOrWhatsApp9to9: $('#qt-consent').checked };
  $('#qt-err').classList.add('hidden'); HorexForm.busy(btn, true);
  const res = await HorexForm.send('quote', {
    name: data.name, contact: HorexForm.contact(data.mobile, data.email), businessName: data.business,
    message: HorexForm.lines([['City', data.city], ['Services', data.services], ['Budget', data.budget], ['Start', data.start], ['Note', data.note], ['Email', data.email], ['Mobile', data.mobile], ['OK to call or WhatsApp 9am-9pm', data.mayCallOrWhatsApp9to9]])
  });
  HorexForm.busy(btn, false);
  if (!res.ok) return err(HorexForm.ERROR_MSG);
  window.quoteData = data;
  $('#qt-doneName').textContent = data.name.split(' ')[0]; $('#qt-form').classList.add('hidden'); $('#qt-done').classList.remove('hidden'); done = true;
});
// Coming back to this page after sending starts a fresh form
const prevOnView = window.onView;
window.onView = v => { if (prevOnView) prevOnView(v); if (v === 'quote' && done) { done = false; $('#qt-done').classList.add('hidden'); $('#qt-form').classList.remove('hidden'); ['#qt-name', '#qt-mobile', '#qt-email', '#qt-biz', '#qt-city', '#qt-note'].forEach(s => $(s).value = ''); $('#qt-budget').value = ''; $('#qt-start').value = ''; $('#qt-consent').checked = false; sel.length = 0; render(); } };
render();
})();
