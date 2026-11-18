
(function () {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const chk = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const LISTS = [
 ['Get Online', 'A credible online presence, built to convert.', [
  ['website', 'Website', 'A fast, premium site that builds trust.', 1], ['app', 'App', 'A custom app for your product or customers.'], ['gbp', 'Google Business Profile', 'Be the credible name on Google Maps.']]],
 ['Get Customers', 'Reach the right buyers on Google, Instagram and Facebook.', [
  ['seo', 'SEO', 'Get found on Google by people ready to buy.'], ['meta', 'Meta ads', 'Instagram and Facebook ads built to bring qualified leads.'], ['social', 'Social media', 'A steady brand presence, planned and published for you.']]],
 ['Talk to customers automatically', 'Every lead answered fast, at any hour.', [
  ['chatbot', 'Chatbot', 'Qualifies leads and answers questions on your site and app.'], ['whatsapp', 'WhatsApp agent', 'Replies to customers on WhatsApp for you.'], ['voice', 'Voice agent', 'Calls and follows up leads in their own language.']]],
 ['Save time', 'Let software handle the daily routine.', [
  ['followup', 'Lead follow-up', 'Every enquiry gets a reply without you chasing.'], ['booking', 'Booking and reminders', 'Customers book alone and never forget.'], ['invoices', 'Invoices and payment reminders', 'Bills go out and dues get chased for you.'], ['orders', 'Online orders', 'Take orders from your site or WhatsApp.'], ['dash', 'Dashboards', 'See sales and leads on one screen.']]]
];
const names = {}; LISTS.forEach(l => l[2].forEach(i => names[i[0]] = i[1]));
const sel = new Set(); let demo = false;
const PAGES = { website: 'website', app: 'app', gbp: 'gbp', seo: 'seo', meta: 'meta', social: 'social', chatbot: 'chatbot', whatsapp: 'whatsapp', voice: 'voice', followup: 'followup', booking: 'booking', dash: 'dash' };

$('#svcLists').innerHTML = LISTS.map((l, n) => `<section><div class="flex items-start gap-4"><span class="w-11 h-11 rounded-2xl bg-navy text-white font-extrabold grid place-items-center shrink-0">${n + 1}</span><div><h2 class="text-2xl sm:text-3xl font-extrabold">${l[0]}</h2><p class="mt-1 text-slate2">${l[1]}</p></div></div>
 <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${l[2].map(i => `<div class="svc card hov deep p-5 flex flex-col" data-id="${i[0]}">
  <label class="flex gap-3 items-start cursor-pointer"><input type="checkbox" class="sr-only" value="${i[0]}"><span class="box w-7 h-7 rounded-lg border-2 border-navy/25 grid place-items-center shrink-0 mt-0.5">${chk}</span><span><span class="block text-lg font-extrabold">${i[1]}</span><span class="block mt-1 text-slate2">${i[2]}</span></span></label>
  <div class="mt-auto pt-5 flex flex-wrap gap-2 items-center">${PAGES[i[0]] ? `<a href="#${PAGES[i[0]]}" data-go="${PAGES[i[0]]}" class="text-sm font-extrabold text-em2 hover:text-em transition mr-1">Learn more →</a>` : ''}${i[3] ? '<button type="button" data-act="demo" class="btn bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white font-bold text-sm px-4 py-2 rounded-full">Get a free demo website</button>' : ''}<button type="button" data-act="quote" class="btn bg-em hover:bg-em2 text-white font-bold text-sm px-5 py-2 rounded-full">Get a quote</button></div></div>`).join('')}</div></section>`).join('');

function refresh() {
  $$('#svcLists .svc').forEach(c => { const on = sel.has(c.dataset.id); c.classList.toggle('on', on); c.querySelector('input').checked = on; });
  const box = $('#selSummary');
  box.innerHTML = sel.size || demo
    ? `<span class="mr-2">You selected:</span>${[...sel].map(id => `<span class="inline-block bg-em text-white rounded-full px-3 py-1 mr-1.5 my-1">${names[id]}</span>`).join('')}${demo ? '<span class="inline-block bg-navy text-white rounded-full px-3 py-1 mr-1.5 my-1">Get a free demo website</span>' : ''}`
    : '<span>Nothing ticked yet. You can also just describe your project below.</span>';
}
const toForm = () => { const q = $('#quote'); if (q) q.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
$('#svcLists').addEventListener('change', e => { if (e.target.type !== 'checkbox') return; e.target.checked ? sel.add(e.target.value) : sel.delete(e.target.value); refresh(); });
$('#svcLists').addEventListener('click', e => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  if (b.dataset.act === 'demo') { window.route('demo'); return; }
  const id = b.closest('.svc').dataset.id; sel.add(id); refresh(); toForm();
});
refresh();
window.pickService = (id, d) => { sel.add(id); if (d) demo = true; refresh(); };

const showErr = m => { const x = $('#qErr'); x.textContent = m; x.classList.remove('hidden'); };
['#q-name', '#q-mobile', '#q-email', '#q-brief'].forEach(s => $(s).addEventListener('input', () => $('#qErr').classList.add('hidden')));
$('#qSubmit').addEventListener('click', () => {
  const v = id => $(id).value.trim();
  if (!v('#q-name')) return showErr('Please type your name.');
  if (!/^[6-9]\d{9}$/.test(v('#q-mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return showErr('Please type a valid 10-digit mobile number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#q-email'))) return showErr('Please type a valid email address.');
  if (!sel.size && !demo && !v('#q-brief')) return showErr('Please tick a service or tell us about your project.');
  const data = { name: v('#q-name'), mobile: v('#q-mobile'), email: v('#q-email'), brief: v('#q-brief'), services: [...sel].map(id => names[id]), freeDemoWebsite: demo };
  // TODO: send `data` to your server, CRM or email service here.
  console.log('Quote request', data);
  window.quoteData = data;
  $('#qDoneName').textContent = data.name.split(' ')[0];
  $('#qForm').classList.add('hidden'); $('#qDone').classList.remove('hidden');
});
})();
