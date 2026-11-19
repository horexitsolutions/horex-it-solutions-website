(function () {
const $ = s => document.querySelector(s);
const show = (id, m) => { const e = $(id); if (!m) { e.classList.add('hidden'); return; } e.textContent = m; e.classList.remove('hidden'); };
let step = 1, done = false;
function go(n) {
  step = n; $('#bs-step1').classList.toggle('hidden', n !== 1); $('#bs-step2').classList.toggle('hidden', n !== 2);
  $('#bs-bar').style.width = n === 1 ? '50%' : '100%'; $('#bs-stepLabel').textContent = n === 1 ? 'Step 1 of 2' : 'Step 2 of 2';
  if (window.LANG === 'hi' && window.applyLang) window.applyLang();
}
$('#bs-continue').addEventListener('click', () => {
  const b = $('#bs-biz').value.trim(), c = $('#bs-city').value.trim();
  if (!b) return show('#bs-err1', 'Please type your business name.');
  if (!c) return show('#bs-err1', 'Please tell us your city.');
  show('#bs-err1', ''); $('#bs-sum').textContent = `${b}, ${c}`; go(2); $('#bs-type').focus();
});
['#bs-biz', '#bs-city'].forEach(s => $(s).addEventListener('input', () => show('#bs-err1', '')));
$('#bs-edit').addEventListener('click', () => go(1));
['#bs-type', '#bs-from', '#bs-name', '#bs-mobile', '#bs-email', '#bs-site', '#bs-insta', '#bs-consent'].forEach(s => $(s).addEventListener('input', () => show('#bs-err2', '')));
const siteOk = u => { u = u.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.'); } catch (e) { return false; } };
$('#bs-go').addEventListener('click', async () => {
  const btn = $('#bs-go'); if (HorexForm.isBusy(btn)) return;
  const v = id => $(id).value.trim();
  if (!$('#bs-type').value) return show('#bs-err2', 'Please choose a business type.');
  if (!$('#bs-from').value) return show('#bs-err2', 'Please choose where your customers come from.');
  if (!v('#bs-name')) return show('#bs-err2', 'Please type your name.');
  if (!/^[6-9]\d{9}$/.test(v('#bs-mobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))) return show('#bs-err2', 'Please type a valid 10-digit mobile number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('#bs-email'))) return show('#bs-err2', 'Please type a valid email address.');
  if (v('#bs-site') && !siteOk(v('#bs-site'))) return show('#bs-err2', 'Please type a valid website address, like www.yourbusiness.com.');
  const ig = v('#bs-insta').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, '');
  if (v('#bs-insta') && !/^[A-Za-z0-9._]{1,30}$/.test(ig)) return show('#bs-err2', 'Please type a valid Instagram handle.');
  if (!$('#bs-consent').checked) return show('#bs-err2', 'Please tick the box so we can email you about your website.');
  const data = { business: v('#bs-biz'), city: v('#bs-city'), businessType: $('#bs-type').value, customersFrom: $('#bs-from').value, name: v('#bs-name'), mobile: v('#bs-mobile'), email: v('#bs-email'),
    details: v('#bs-more'), area: v('#bs-area'), existingWebsite: v('#bs-site'), instagram: ig, emailConsent: true };
  show('#bs-err2', ''); HorexForm.busy(btn, true);
  const res = await HorexForm.send('Build Website', {
    name: data.name, contact: HorexForm.contact(data.mobile, data.email), businessName: data.business,
    message: HorexForm.lines([['Name', data.name], ['Mobile', data.mobile], ['Email', data.email], ['Business Name', data.business], ['City', data.city], ['Business Type', data.businessType],
      ['Customers Come From', data.customersFrom], ['Details', data.details], ['Area', data.area], ['Existing Website', data.existingWebsite], ['Instagram', data.instagram],
      ['OK To Email About The Website', data.emailConsent]])
  });
  HorexForm.busy(btn, false);
  if (!res.ok) return show('#bs-err2', HorexForm.ERROR_MSG);
  window.buildSiteData = data;
  $('#bs-doneName').textContent = data.name.split(' ')[0]; $('#bs-step1').classList.add('hidden'); $('#bs-step2').classList.add('hidden'); $('#bs-done').classList.remove('hidden'); $('#bs-bar').style.width = '100%'; $('#bs-stepLabel').textContent = ''; done = true;
});
// Coming back after sending starts a fresh form
const prev = window.onView;
window.onView = v => { if (prev) prev(v);
  if (v === 'buildsite' && done) { done = false; $('#bs-done').classList.add('hidden'); ['#bs-biz', '#bs-city', '#bs-name', '#bs-mobile', '#bs-email', '#bs-more', '#bs-area', '#bs-site', '#bs-insta'].forEach(s => $(s).value = ''); $('#bs-type').value = ''; $('#bs-from').value = ''; $('#bs-consent').checked = false; go(1); } };
})();
