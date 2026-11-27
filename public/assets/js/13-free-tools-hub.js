(function () {
const $ = s => document.querySelector(s);
// [name, description, link]  (link = view name of a finished tool; null = coming soon)
const LISTS = [
 ['Starting a business', [
  ['Business name ideas', 'Name ideas for your kind of business, and a self-check list. Ideas only, not a legal check.', 'names'],
  ['Startup budget planner', 'Start costs, monthly costs, total and how long your money lasts. Print it on one page.', 'budgetPlanner'],
  ['Price and break-even calculator', 'What you keep per sale, your margin and the sales you need to break even.', 'breakEven'],
  ['WhatsApp link and QR', 'A click-to-chat link and a QR code from your own number. Nothing is saved.', null],
  ['One-page business plan', 'Eight guided questions, then print or save one clear page. No forecasts.', null],
  ['Bio and caption generator', 'Instagram bio, Google description and five captions for your kind of business.', null],
  ['Google review reply writer', 'Paste a review, get three polite replies. English or Hindi.', null],
  ['Business starter checklist', 'Eight steps from idea to first customers. Your ticks stay on your phone.', null]]],
 ['Get more customers', [
  ['AI prompt kit', 'Ready prompts for a logo, poster, photo clean-up, highlight covers, WhatsApp Status, bio and a 30-day plan.', null]]],
 ['Print and pay', [
  ['Visiting card', 'Front and back, print-ready PDF with 3 mm bleed. Add your name, phone, address and colours.', null],
  ['UPI QR standee', 'A “Scan & Pay” stand made from your own UPI ID. Customers pay you directly.', null],
  ['Bill and quotation maker', 'A clean bill or quotation with tested totals. GST only if you give your own GSTIN.', null],
  ['Google review QR', 'Customers scan and land on your Google review box. A4, A5 and sticker sizes, in Hindi and English.', 'qr']]]
];
$('#ftLists').innerHTML = LISTS.map(l => `<section><h2 class="text-2xl sm:text-3xl font-extrabold">${l[0]}</h2><div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${l[1].map((t, i) => `<div class="card hov deep p-6 flex flex-col"><div class="flex items-start justify-between gap-3"><h3 class="text-xl font-extrabold">${t[0]}</h3>${t[2] ? '' : '<span class="shrink-0 bg-mint text-em2 text-[11px] font-extrabold rounded-full px-2.5 py-1">Coming soon</span>'}</div><p class="mt-2 text-slate2 flex-1">${t[1]}</p>${t[2] ? `<a href="/${t[2]}" data-go="${t[2]}" class="mt-5 self-start font-extrabold text-em2 hover:text-em transition">Open →</a>` : `<button type="button" data-soon="${t[0]}" class="mt-5 self-start font-extrabold text-em2 hover:text-em transition">Open →</button>`}</div>`).join('')}</div></section>`).join('');

const modal = $('#ftModal'); let opener = null;
function close() { modal.classList.add('hidden'); if (opener) opener.focus(); }
$('#ftLists').addEventListener('click', e => { const b = e.target.closest('[data-soon]'); if (!b) return; opener = b; $('#ftModalTitle').textContent = b.dataset.soon; modal.classList.remove('hidden'); if (window.LANG === 'hi' && window.applyLang) window.applyLang(); $('#ftModalClose').focus(); });
$('#ftModalClose').addEventListener('click', close);
modal.addEventListener('click', e => { if (e.target === modal) close(); });
$('#ftModalQuote').addEventListener('click', () => modal.classList.add('hidden'));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) close(); });
const prev = window.onView; window.onView = v => { if (prev) prev(v); modal.classList.add('hidden'); };
})();
