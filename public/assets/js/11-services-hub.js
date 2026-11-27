(function () {
const LISTS = [
 ['Get Online', 'A credible online presence, built to convert.', [
  ['website', 'Website', 'A fast, premium site that builds trust.', 1, 1], ['app', 'App', 'A custom app for your product or customers.', 1], ['gbp', 'Google Business Profile', 'Be the credible name on Google Maps.', 1]]],
 ['Get Customers', 'Reach the right buyers on Google, Instagram and Facebook.', [
  ['seo', 'SEO', 'Get found on Google by people ready to buy.', 1], ['meta', 'Meta ads', 'Instagram and Facebook ads built to bring qualified leads.', 1], ['social', 'Social media', 'A steady brand presence, planned and published for you.', 1]]],
 ['Talk to customers automatically', 'Every lead answered fast, at any hour.', [
  ['chatbot', 'Chatbot', 'Qualifies leads and answers questions on your site and app.', 1], ['whatsapp', 'WhatsApp agent', 'Replies to customers on WhatsApp for you.', 1], ['voice', 'Voice agent', 'Calls and follows up leads in their own language.', 1]]],
 ['Save time', 'Let software handle the daily routine.', [
  ['followup', 'Lead follow-up', 'Every enquiry gets a reply without you chasing.', 1], ['booking', 'Booking and reminders', 'Customers book alone and never forget.', 1], ['invoices', 'Invoices and payment reminders', 'Bills go out and dues get chased for you.', 0], ['orders', 'Online orders', 'Take orders from your site or WhatsApp.', 0], ['dash', 'Dashboards', 'See sales and leads on one screen.', 1]]]
];
document.getElementById('hubLists').innerHTML = LISTS.map((l, n) => `<section><div class="flex items-start gap-4"><span class="w-11 h-11 rounded-2xl bg-navy text-white font-extrabold grid place-items-center shrink-0">${n + 1}</span><div><h2 class="text-2xl sm:text-3xl font-extrabold">${l[0]}</h2><p class="mt-1 text-slate2">${l[1]}</p></div></div>
 <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${l[2].map(i => `<div class="card hov deep p-6 flex flex-col"><h3 class="text-xl font-extrabold">${i[1]}</h3><p class="mt-2 text-slate2 flex-1">${i[2]}</p>
  <div class="mt-5 flex flex-wrap gap-2 items-center">${i[3] ? `<a href="/${i[0]}" data-go="${i[0]}" class="text-sm font-extrabold text-em2 hover:text-em transition mr-1">Learn more</a>` : ''}${i[4] ? '<a href="/demo" data-go="demo" class="btn bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white font-bold text-sm px-4 py-2 rounded-full">Get a free demo website</a>' : ''}<button type="button" data-pick="${i[0]}" class="btn bg-em hover:bg-em2 text-white font-bold text-sm px-5 py-2 rounded-full">Get a quote</button></div></div>`).join('')}</div></section>`).join('');
})();
