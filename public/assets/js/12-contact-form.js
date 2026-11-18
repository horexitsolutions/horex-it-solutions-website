(function () {
const $ = s => document.querySelector(s);
// Email is a placeholder for now: put the address here later (for example 'hello@yourdomain.com') and the card turns into a mailto link.
const CONTACT_EMAIL = '';
$('#ct-email').innerHTML = CONTACT_EMAIL
  ? `<a href="mailto:${CONTACT_EMAIL}" class="font-extrabold text-em2 hover:text-em transition break-all">${CONTACT_EMAIL}</a>`
  : '<p>Our email address is coming soon. For now, please use the form below, or call or WhatsApp us.</p>';
const OPTS = [['website', 'Website'], ['app', 'App'], ['gbp', 'Google Business Profile'], ['seo', 'SEO'], ['meta', 'Meta Ads'], ['social', 'Social Media'], ['chatbot', 'Chatbot'], ['whatsapp', 'WhatsApp Agent'], ['voice', 'Voice Agent'], ['followup', 'Lead Follow-up'], ['booking', 'Booking and reminders'], ['invoices', 'Invoices and payment reminders'], ['orders', 'Online orders'], ['dash', 'Dashboards']];
const MAX = 3, sel = []; let done = false;
$('#ct-pills').innerHTML = OPTS.map(o => `<button type="button" class="chip" data-id="${o[0]}" aria-pressed="false">${o[1]}</button>`).join('');
function render() {
  document.querySelectorAll('#ct-pills .chip').forEach(b => { const on = sel.includes(b.dataset.id); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); b.style.opacity = !on && sel.length >= MAX ? '.5' : ''; });
  $('#ct-count').textContent = sel.length ? (window.LANG === 'hi' ? `${sel.length} / ${MAX} चुने गए` : `${sel.length} of ${MAX} picked`) : '';
}
$('#ct-pills').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return; const id = b.dataset.id, i = sel.indexOf(id); $('#ct-err').classList.add('hidden');
  if (i >= 0) { sel.splice(i, 1); $('#ct-limit').classList.add('hidden'); } else if (sel.length >= MAX) { $('#ct-limit').classList.remove('hidden'); return; } else sel.push(id);
  render();
});
$('#ct-noteBtn').addEventListener('click', () => {
  const open = $('#ct-note').classList.toggle('hidden') === false;
  $('#ct-noteBtn').textContent = open ? '− Hide note' : '+ Add a note'; $('#ct-noteBtn').setAttribute('aria-expanded', open);
  if (open) $('#ct-note').focus(); if (window.LANG === 'hi' && window.applyLang) window.applyLang();
});
const err = m => { const e = $('#ct-err'); e.textContent = m; e.classList.remove('hidden'); };
['#ct-name', '#ct-mobile', '#ct-city', '#ct-note'].forEach(s => $(s).addEventListener('input', () => $('#ct-err').classList.add('hidden')));
$('#ct-go').addEventListener('click', () => {
  const v = id => $(id).value.trim();
  if (!v('#ct-name')) return err('Please type your name.');
  if (!/^[6-9]\d{9}$/.test(v('#ct-mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return err('Please type a valid 10-digit mobile number.');
  if (!v('#ct-city')) return err('Please tell us your city.');
  if (!sel.length && !v('#ct-note')) return err('Please tick a service or tell us about your project.');
  const names = Object.fromEntries(OPTS);
  const data = { name: v('#ct-name'), mobile: v('#ct-mobile'), business: v('#ct-biz'), city: v('#ct-city'), services: sel.map(id => names[id]), budget: $('#ct-budget').value, start: $('#ct-start').value, note: v('#ct-note') };
  // TODO: send `data` to your server, CRM or email service here.
  console.log('Contact request', data); window.contactData = data;
  $('#ct-doneName').textContent = data.name.split(' ')[0]; $('#ct-body').classList.add('hidden'); $('#ct-done').classList.remove('hidden'); done = true;
});
// Chain with the other pages' hooks instead of replacing them
const prevView = window.onView; window.onView = v => { if (prevView) prevView(v);
  if (v === 'contact' && done) { done = false; $('#ct-done').classList.add('hidden'); $('#ct-body').classList.remove('hidden'); ['#ct-name', '#ct-mobile', '#ct-biz', '#ct-city', '#ct-note'].forEach(s => $(s).value = ''); $('#ct-budget').value = ''; $('#ct-start').value = ''; sel.length = 0; render(); } };
const prevRender = window.quoteRender; window.quoteRender = () => { if (prevRender) prevRender(); render(); };
render();
})();
