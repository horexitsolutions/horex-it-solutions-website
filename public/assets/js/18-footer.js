/* Universal footer: one footer for every page of the site.
   To change a link, edit it here. Use  go: 'viewName'  for a page inside the site,  url: 'https://…'  for an outside page.
   An entry with neither is shown as plain text (no page or address has been given for it yet). */
(function () {
  const FOOTER = {
    social: [
      { name: 'YouTube', url: 'https://www.youtube.com/@HorexITSolutions', icon: '<rect x="2.5" y="6" width="19" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.4v5.2l4.6-2.6z" fill="currentColor"/>' },
      { name: 'Instagram', url: 'https://www.instagram.com/horexitsolutions_/', icon: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>' },
      { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61596749427169', icon: '<path d="M14 8h2.5V4.5H14C11.8 4.5 10.5 6 10.5 8.2V10H8v3.5h2.5V20H14v-6.5h2.6l.4-3.5H14V8.6c0-.4.2-.6.6-.6z" fill="currentColor"/>' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/company/horex-it-solutions/', icon: '<rect x="3.5" y="9" width="3.6" height="11.5" fill="currentColor"/><circle cx="5.3" cy="5.2" r="2" fill="currentColor"/><path d="M10 9h3.3v1.6c.5-1 1.8-1.9 3.6-1.9 3.2 0 3.9 2.1 3.9 4.9v6.9h-3.5v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6.1H10z" fill="currentColor"/>' }
    ],
    columns: [
      { title: 'For your business', links: [
        { t: 'Free audit', go: 'audit' }, { t: 'Services', go: 'services' }, { t: 'Free demo website', go: 'demo' },
        { t: 'Free business tools', go: 'freetools' }, { t: 'Google review QR', go: 'qr' }, { t: 'Get a quote', go: 'quote' }] },
      { title: 'Free Tools', links: [
        { t: 'Startup Budget Planner', go: 'budgetPlanner' }, { t: 'Price & Break-Even Calculator', go: 'breakEven' }, { t: 'Business Name Generator', go: 'names' },
        { t: 'UPI QR Standee', go: 'freetools' }, { t: 'WhatsApp Link & QR', go: 'freetools' }] },
      { title: 'Services', links: [
        { t: 'Custom Web Development', go: 'website' }, { t: 'Mobile Apps', go: 'app' }, { t: 'AI Chatbots', go: 'chatbot' },
        { t: 'Technical SEO & Audits', go: 'seo' }, { t: 'UI/UX Design', go: 'services' }] },
      { title: 'Company', links: [
        { t: 'Contact', go: 'contact' }, { t: 'Terms' }, { t: 'Privacy' }, { t: 'Refunds' }, { t: 'Shipping' }, { t: 'Disclaimer' }] }
    ]
  };
  window.HX_FOOTER = FOOTER;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cls = 'text-cream/80 hover:text-emerald-300 transition';
  const link = l => l.go ? `<a href="#${l.go}" data-go="${l.go}" class="${cls}">${esc(l.t)}</a>`
    : l.url ? `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" class="${cls}">${esc(l.t)}</a>`
    : `<span class="text-cream/70">${esc(l.t)}</span>`;
  const root = document.getElementById('siteFooter'); if (!root) return;
  root.innerHTML = `<div class="max-w-6xl mx-auto px-5 pt-14 pb-8">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
      <div class="max-w-md">
        <a href="#home" data-go="home" class="inline-block rounded-2xl bg-cream px-4 py-2.5 shadow-lg" aria-label="Horex IT Solutions"><img id="ftLogo" alt="Horex IT Solutions" class="h-12 w-auto"></a>
        <p class="mt-4 text-lg font-extrabold text-white">Your Vision. Our Code.</p>
        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
          <a href="tel:+919414122762" class="text-emerald-300 hover:text-white transition">+91 9414122762</a>
          <a href="https://wa.me/919414122762" target="_blank" rel="noopener noreferrer" class="text-cream/80 hover:text-emerald-300 transition">WhatsApp us</a>
        </div>
      </div>
      <ul class="flex gap-3" aria-label="Social media">${FOOTER.social.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.name)}" class="w-11 h-11 rounded-full grid place-items-center text-cream bg-white/10 hover:bg-em hover:text-white hover:-translate-y-0.5 transition"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">${s.icon}</svg></a></li>`).join('')}</ul>
    </div>
    <div class="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">${FOOTER.columns.map(c => `<nav aria-label="${esc(c.title)}"><h2 class="font-extrabold text-white mb-4">${esc(c.title)}</h2><ul class="space-y-2.5 text-sm font-medium">${c.links.map(l => `<li>${link(l)}</li>`).join('')}</ul></nav>`).join('')}</div>
    <div class="mt-12 pt-6 text-center text-xs text-cream/65" style="box-shadow:inset 0 1px 0 rgba(250,249,246,.12)">© 2026 Horex IT Solutions. All rights reserved.</div>
  </div>`;
  const hdr = document.querySelector('header img'), img = document.getElementById('ftLogo');
  if (hdr && img) img.src = hdr.getAttribute('src');
})();
