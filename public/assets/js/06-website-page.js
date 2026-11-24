(function () {
const $ = s => document.querySelector(s);
const tick = '<svg class="shrink-0 mt-0.5" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#00A86B"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
$('#webFor').innerHTML = ['Founders launching a fresh startup or D2C brand.', 'Growing companies whose current website no longer matches their scale.', 'Clinics, educational institutes, real estate firms, and manufacturers winning clients online.']
  .map(t => `<div class="card hov deep p-6 flex gap-3">${tick}<p class="font-semibold leading-relaxed">${t}</p></div>`).join('');
$('#webGet').innerHTML = ['Lightning-fast loading speed on every mobile device.', 'Dedicated pages for your core offers, brand story, and client proof.', 'Clear, prominent calls-to-action for every visitor: enquire, book, or request a demo.', 'Full ownership of your custom domain, completely configured and set up by our team.']
  .map(t => `<div class="card hov deep p-6 flex gap-3">${tick}<p class="font-semibold leading-relaxed">${t}</p></div>`).join('');
$('#webSteps').innerHTML = ['Share your business details and core growth goal.', 'Choose from a curated free design layout or request a custom build.', 'We engineer the site, you review it, and we launch it live.']
  .map((t, i) => `<div class="card hov deep p-6"><span class="w-11 h-11 rounded-full bg-em text-white font-extrabold grid place-items-center mb-4 shadow-[0_0_0_6px_rgba(0,168,107,.18)]">${i + 1}</span><p class="font-semibold leading-relaxed">${t}</p></div>`).join('');
$('#webFaq').innerHTML = [
  ['Can I try before I decide?', 'Yes! You can request a free demo website preview before making any commitment.'],
  ['Will I be able to change things later?', 'Absolutely. We build systems that are easy to update, and we show you how to manage them.'],
  ['Is the domain mine?', '100% yours. Your domain and hosting accounts stay registered entirely under your name.']
].map((f, i) => `<div class="faq ${i === 0 ? 'open' : ''} card soft"><button type="button" class="w-full flex items-center justify-between gap-4 text-left p-5 font-bold" aria-expanded="${i === 0}"><span>${f[0]}</span><svg class="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A86B" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/><path class="vbar" d="M12 5v14"/></svg></button><div class="faq-body"><div class="overflow-hidden"><p class="px-5 pb-5 text-slate2">${f[1]}</p></div></div></div>`).join('');
document.querySelectorAll('#webFaq button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.parentElement.classList.toggle('open'))));

// Inject FAQPage and HowTo JSON-LD when on #website, clear when navigating away (AEO/GEO)
if (window.HXSchema) {
  const _webFaqs = [
    ['Can I try before I decide?', 'Yes! You can request a free demo website preview before making any commitment.'],
    ['Will I be able to change things later?', 'Absolutely. We build systems that are easy to update, and we show you how to manage them.'],
    ['Is the domain mine?', '100% yours. Your domain and hosting accounts stay registered entirely under your name.']
  ];
  const _webSteps = [
    'Share your business details and core growth goal.',
    'Choose from a curated free design layout or request a custom build.',
    'We engineer the site, you review it, and we launch it live.'
  ];
  window.HXSchema.setFAQ('website', _webFaqs);
  window.HXSchema.setHowTo('website', 'Website Development', _webSteps);
  const _webPrevOnView = window.onView;
  window.onView = function (v) {
    if (_webPrevOnView) _webPrevOnView(v);
    if (v !== 'website') window.HXSchema.clearPageSchemas('website');
    else { window.HXSchema.setFAQ('website', _webFaqs); window.HXSchema.setHowTo('website', 'Website Development', _webSteps); }
  };
}

// Buttons that pick a service in the quote form, then go there
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pick]'); if (!b) return;
  e.preventDefault();
  if (b.dataset.pick === 'demo') return window.route('demo');
  if (window.quotePick) window.quotePick(b.dataset.pick);
  window.route('quote');
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-go][role="link"]')) e.target.click(); });
})();
