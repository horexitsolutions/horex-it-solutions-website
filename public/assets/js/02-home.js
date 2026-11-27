(function(){
document.documentElement.classList.add('js');
const SVC_GO = { 'Fast Business Websites': 'website', 'Custom Mobile Apps': 'app', 'Google Map Setup': 'gbp', 'Google Search Help': 'seo', 'Facebook & Instagram Ads': 'meta', 'Social Media Management': 'social', 'Smart Website Chatbots': 'chatbot', 'WhatsApp Auto-Reply': 'whatsapp', 'Voice Calling Assistants': 'voice', 'Automatic Lead Follow-up': 'followup', 'Easy Booking & Reminders': 'booking', 'Simple Sales Dashboards': 'dash' };
const check = '<svg class="shrink-0 mt-0.5" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#E4F6EE"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#00A86B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Illustrations (inline SVG scenes, drawn in the page so no outside images are needed)
const art = [
  // Website + phone
  '<rect x="8" y="14" width="74" height="50" rx="8" fill="#fff" opacity=".95"/><rect x="8" y="14" width="74" height="12" rx="8" fill="#fff"/><circle cx="18" cy="20" r="2.5" fill="#00A86B"/><circle cx="26" cy="20" r="2.5" fill="#003366"/><rect x="16" y="34" width="34" height="6" rx="3" fill="#003366"/><rect x="16" y="45" width="50" height="4" rx="2" fill="#00A86B" opacity=".6"/><rect x="16" y="53" width="40" height="4" rx="2" fill="#00A86B" opacity=".4"/><rect x="68" y="34" width="34" height="52" rx="8" fill="#003366" stroke="#fff" stroke-width="3"/><circle cx="85" cy="58" r="8" fill="#00A86B"/><path d="M81 58l3 3 5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // Growth chart + people
  '<rect x="10" y="16" width="92" height="64" rx="10" fill="#fff" opacity=".95"/><rect x="22" y="52" width="12" height="20" rx="4" fill="#00A86B" opacity=".5"/><rect x="42" y="42" width="12" height="30" rx="4" fill="#00A86B" opacity=".75"/><rect x="62" y="32" width="12" height="40" rx="4" fill="#00A86B"/><path d="M20 44l24-12 18 8 24-18" stroke="#003366" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M80 22h8v8" stroke="#003366" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // Chat bubbles
  '<rect x="10" y="14" width="64" height="34" rx="14" fill="#fff" opacity=".95"/><path d="M24 48l-4 14 16-10z" fill="#fff" opacity=".95"/><circle cx="28" cy="31" r="4" fill="#00A86B"/><circle cx="42" cy="31" r="4" fill="#003366"/><circle cx="56" cy="31" r="4" fill="#00A86B"/><rect x="42" y="54" width="62" height="30" rx="14" fill="#00A86B"/><path d="M90 84l4 12-14-8z" fill="#00A86B"/><path d="M56 70l8 8 16-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  // Clock + calendar dashboard
  '<rect x="10" y="16" width="64" height="60" rx="10" fill="#fff" opacity=".95"/><rect x="10" y="16" width="64" height="16" rx="10" fill="#00A86B"/><rect x="20" y="42" width="10" height="9" rx="3" fill="#003366" opacity=".7"/><rect x="37" y="42" width="10" height="9" rx="3" fill="#00A86B"/><rect x="54" y="42" width="10" height="9" rx="3" fill="#003366" opacity=".7"/><rect x="20" y="58" width="10" height="9" rx="3" fill="#00A86B" opacity=".6"/><rect x="37" y="58" width="10" height="9" rx="3" fill="#003366" opacity=".7"/><circle cx="84" cy="70" r="22" fill="#003366" stroke="#fff" stroke-width="4"/><path d="M84 56v14l9 6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
];
const grads = ['linear-gradient(135deg,#003366,#00A86B)', 'linear-gradient(135deg,#00A86B,#003366)', 'linear-gradient(135deg,#003366,#0A6B8F 55%,#00A86B)', 'linear-gradient(135deg,#0A6B8F,#003366 60%,#00A86B)'];

const services = [
  ['Get Online', 'Build Trust', [
    ['Fast Business Websites', 'Super fast, clean websites designed to build instant trust.'],
    ['Custom Mobile Apps', 'Easy-to-use mobile apps built for your customers.'],
    ['Google Map Setup', 'Make your business visible and trusted on Google Maps.']]],
  ['Get Customers', 'Grow Sales', [
    ['Google Search Help', 'Get found on Google by people who want to buy right now.'],
    ['Facebook & Instagram Ads', 'Ads built to bring real, interested customers to you.'],
    ['Social Media Management', 'Regular posts and updates managed completely for you.']]],
  ['Talk Automatically', 'Save Time', [
    ['Smart Website Chatbots', 'Instant answers for visitors on your site day and night.'],
    ['WhatsApp Auto-Reply', 'Automated messages and replies sent to your customers on WhatsApp.'],
    ['Voice Calling Assistants', 'Friendly automated calls to follow up with your leads.']]],
  ['Save Time', 'Make Daily Work Easy', [
    ['Automatic Lead Follow-up', 'Every inquiry gets an instant reply without you chasing them.'],
    ['Easy Booking & Reminders', 'Customers can book appointments easily and never forget.'],
    ['Simple Sales Dashboards', 'See all your daily sales and leads on one single screen.']]]
];

const tabs = document.getElementById('tabs'), panel = document.getElementById('panel');
tabs.innerHTML = services.map((s, i) => `
  <button role="tab" data-i="${i}" class="tab w-full text-left rounded-2xl p-5 text-white relative overflow-hidden flex items-center justify-between gap-3" style="background:${grads[i]}">
    <span class="relative z-10">
      <span class="inline-block text-[10px] font-bold tracking-widest bg-em text-white rounded-full px-2.5 py-1">0${i + 1} · HOREX</span>
      <span class="block text-xl font-extrabold mt-1">${s[0]}</span>
      <span class="block text-sm font-semibold opacity-90">${s[1]}</span>
      <span class="mt-3 block w-9 h-6 rounded-md bg-white/30"></span>
    </span>
    <svg class="relative z-10 shrink-0" width="112" height="100" viewBox="0 0 112 100" aria-hidden="true">${art[i]}</svg>
    <span class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></span>
  </button>`).join('');

function show(i) {
  const s = services[i];
  tabs.querySelectorAll('.tab').forEach((t, k) => { t.classList.toggle('active', k === i); t.setAttribute('aria-selected', k === i); });
  panel.innerHTML = `<div class="panel-in">
    <p class="text-sm font-bold text-em2">${s[1]}</p>
    <h3 class="text-2xl sm:text-3xl font-extrabold mt-1">${s[0]}</h3>
    <ul class="mt-6 space-y-5">${s[2].map(d => `<li class="flex gap-3 bg-white rounded-2xl p-4 soft${SVC_GO[d[0]] ? ' cursor-pointer hover:-translate-y-1 hover:shadow-xl transition' : ''}"${SVC_GO[d[0]] ? ` data-go="${SVC_GO[d[0]]}" role="link" tabindex="0"` : ''}>${check}<div><p class="font-bold text-lg">${d[0]}</p><p class="text-slate2 mt-0.5">${d[1]}</p>${SVC_GO[d[0]] ? '<span class="inline-block mt-2 text-sm font-extrabold text-em2">Learn more →</span>' : ''}</div></li>`).join('')}</ul>
    <a href="/contact" data-go="contact" class="mt-6 inline-block bg-em hover:bg-em2 text-white font-bold px-6 py-3 rounded-full transition hover:-translate-y-0.5">Get a Free Quote</a>
  </div>`;
}
tabs.querySelectorAll('.tab').forEach(t => {
  const i = +t.dataset.i;
  t.addEventListener('click', () => show(i));
  t.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) show(i); });
  t.addEventListener('focus', () => show(i));
});
show(0);

// Mobile menu
const mm = document.getElementById('mobileMenu');
document.getElementById('menuBtn').addEventListener('click', () => mm.classList.toggle('hidden'));
mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.classList.add('hidden')));

// Scroll fade-in
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); setTimeout(() => e.target.style.transitionDelay = '', 1000); } }), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Live chat simulation (loops)
const m1 = document.getElementById('m1'), ty = document.getElementById('typing'), m2 = document.getElementById('m2'), m3 = document.getElementById('m3');
let timers = [];
const at = (ms, fn) => timers.push(setTimeout(fn, ms));
const appear = el => { el.classList.remove('hidden'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show'))); };
function play() {
  timers.forEach(clearTimeout); timers = [];
  [m1, ty, m2, m3].forEach(m => m.classList.remove('show'));
  ty.classList.add('hidden'); m2.classList.add('hidden');
  at(600, () => m1.classList.add('show'));
  at(1600, () => appear(ty));
  at(3400, () => { ty.classList.remove('show'); ty.classList.add('hidden'); appear(m2); });
  at(4800, () => m3.classList.add('show'));
  at(10000, play);
}
const chatIo = new IntersectionObserver(es => { if (es[0].isIntersecting) { play(); chatIo.disconnect(); } }, { threshold: 0.3 });
chatIo.observe(document.getElementById('chat'));

})();
