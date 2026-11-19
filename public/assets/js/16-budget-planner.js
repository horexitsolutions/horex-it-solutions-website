
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const hi = () => window.LANG === 'hi', t = (en, h) => hi() ? h : en;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = v => Math.min(1e10, parseFloat(String(v == null ? '' : v).replace(/[^\d.]/g, '')) || 0);
  const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const rs = n => '₹' + nf.format(Math.round(n));
  const KEY = 'hx_budget_planner', MONTHS = [1, 2, 3, 4, 6, 12];
  const PH_ONE = ['Equipment or machines', 'Deposits (rent, electricity)', 'Licences and registration', 'Initial stock', 'Interiors and setup'];
  const PH_MON = ['Rent', 'Salaries', 'Electricity and internet', 'Software and subscriptions', 'Marketing'];
  const blank = n => Array.from({ length: n }, () => ({ l: '', a: '' }));
  let S = { name: '', one: blank(5), mon: blank(5), ready: '', sales: '', months: 3 };
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && Array.isArray(saved.one) && Array.isArray(saved.mon)) S = Object.assign(S, saved); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  // ---- The calculation (pure) ----
  function calc(s) {
    const one = s.one.reduce((a, r) => a + num(r.a), 0), mon = s.mon.reduce((a, r) => a + num(r.a), 0);
    const buffer = mon * s.months, needed = one + buffer, ready = num(s.ready), sales = num(s.sales), diff = ready - needed;
    const after = ready - one, burn = mon - sales;
    return { one, mon, buffer, needed, ready, sales, diff, after, burn };
  }
  function insight(c, months) {
    if (!c.one && !c.mon) return t('Add your costs on the left to see your budget.', 'अपना बजट देखने के लिए बाईं ओर अपने खर्च जोड़िए।');
    const guess = t(' That number is your own guess, so test it with real customers.', ' वह आँकड़ा आपका अपना अंदाज़ा है, इसलिए असली ग्राहकों के साथ उसे परखिए।');
    if (c.sales > 0 && c.mon > 0 && c.sales >= c.mon) return t('By your own monthly sales number, sales cover your monthly costs.', 'आपकी अपनी मासिक बिक्री के आँकड़े के हिसाब से, बिक्री आपके महीने के खर्च पूरे कर देती है।') + guess;
    let run = '';
    if (c.ready > 0) {
      if (c.after < 0) run = t(`Your money does not cover the one-time costs yet. You are short by ${rs(-c.after)}.`, `आपका पैसा अभी एक बार के खर्चों के लिए पूरा नहीं है। ${rs(-c.after)} की कमी है।`);
      else if (c.burn > 0) { const n = Math.floor(c.after / c.burn); run = n < 1 ? t('After the one-time costs, your money lasts less than 1 month.', 'एक बार के खर्चों के बाद आपका पैसा 1 महीने से कम चलेगा।') : t(`After the one-time costs, your money lasts about ${n} month${n === 1 ? '' : 's'}.`, `एक बार के खर्चों के बाद आपका पैसा लगभग ${n} महीने चलेगा।`); }
    }
    if (c.sales > 0) return t(`By your own sales number, you are short by ${rs(c.burn)} each month. `, `आपकी अपनी बिक्री के आँकड़े के हिसाब से हर महीने ${rs(c.burn)} की कमी रहती है। `) + run + guess;
    return (c.ready > 0 ? run : t('Add the money you have ready to see how long it lasts with no sales.', 'बिना बिक्री के आपका पैसा कितना चलेगा यह देखने के लिए अपना तैयार पैसा जोड़िए।'));
  }

  // ---- Rendering ----
  function rows(kind) {
    const list = S[kind], ph = kind === 'one' ? PH_ONE : PH_MON, box = $('#bp-' + kind);
    box.innerHTML = list.map((r, i) => `<div class="bp-row flex items-center gap-2" data-i="${i}"><input class="inp flex-1 min-w-0" data-k="l" value="${esc(r.l)}" maxlength="50" placeholder="${esc(ph[i] || '')}" aria-label="Line name"><span class="font-extrabold text-em2" aria-hidden="true">₹</span><input class="inp w-28 sm:w-36" data-k="a" value="${esc(r.a)}" inputmode="numeric" placeholder="0" aria-label="Amount (₹)"><button type="button" class="bp-x" data-del aria-label="Remove line">×</button></div>`).join('');
    if (hi() && window.applyLang) window.applyLang();
  }
  function months() {
    $('#bp-months').innerHTML = MONTHS.map(m => `<button type="button" class="chip${m === S.months ? ' sel' : ''}" data-m="${m}" aria-pressed="${m === S.months}">${m}</button>`).join('');
  }
  function summary() {
    const c = calc(S);
    $('#bp-oneT').textContent = rs(c.one); $('#bp-monT').textContent = rs(c.mon); $('#bp-bufT').textContent = rs(c.buffer);
    $('#bp-bufL').textContent = t(`Keep aside for ${S.months} month${S.months === 1 ? '' : 's'} of running costs`, `चलाने के खर्च के ${S.months} महीने अलग रखिए`);
    $('#bp-needT').textContent = rs(c.needed); $('#bp-readyT').textContent = rs(c.ready);
    const short = c.diff < 0, d = $('#bp-diffT');
    $('#bp-diffL').textContent = short ? t('Short by', 'कमी') : t('Above what you need', 'ज़रूरत से ऊपर');
    d.textContent = rs(Math.abs(c.diff)); d.className = 'font-extrabold ' + (short ? 'text-amber-600' : 'text-em2');
    $('#bp-note').textContent = insight(c, S.months);
    sheet(c);
  }
  function sheet(c) {
    const line = r => r.l.trim() || num(r.a) ? `<tr><td style="padding:4px 0">${esc(r.l.trim() || '—')}</td><td style="padding:4px 0;text-align:right">${rs(num(r.a))}</td></tr>` : '';
    const tbl = (title, list, total) => `<h3 style="margin:18px 0 6px;font-size:16px">${title}</h3><table style="width:100%;border-collapse:collapse;font-size:14px">${list.map(line).join('')}<tr><td style="padding:6px 0;font-weight:800">${t('Total', 'कुल')}</td><td style="padding:6px 0;text-align:right;font-weight:800">${rs(total)}</td></tr></table>`;
    const row = (a, b, bold) => `<tr><td style="padding:5px 0;${bold ? 'font-weight:800' : ''}">${a}</td><td style="padding:5px 0;text-align:right;${bold ? 'font-weight:800;color:#00A86B' : ''}">${b}</td></tr>`;
    $('#bp-sheet').innerHTML = `<h1 style="margin:0;font-size:24px">${t('Startup budget', 'स्टार्टअप बजट')}${S.name.trim() ? ' · ' + esc(S.name.trim()) : ''}</h1><p style="margin:4px 0 0;font-size:12px;color:#3D5675">${new Date().toLocaleDateString(hi() ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`
      + tbl(t('One-time costs', 'एक बार के खर्च'), S.one, c.one) + tbl(t('Monthly costs', 'महीने के खर्च'), S.mon, c.mon)
      + `<h3 style="margin:18px 0 6px;font-size:16px">${t('Summary', 'सारांश')}</h3><table style="width:100%;border-collapse:collapse;font-size:14px">`
      + row(t('One-time costs', 'एक बार के खर्च'), rs(c.one)) + row(t('Monthly costs', 'महीने के खर्च'), rs(c.mon))
      + row(t(`Keep aside for ${S.months} month${S.months === 1 ? '' : 's'} of running costs`, `चलाने के खर्च के ${S.months} महीने अलग`), rs(c.buffer))
      + row(t('Money needed to start comfortably', 'आराम से शुरू करने के लिए ज़रूरी पैसा'), rs(c.needed), true) + row(t('Money you have ready', 'आपके पास तैयार पैसा'), rs(c.ready))
      + row(c.diff < 0 ? t('Short by', 'कमी') : t('Above what you need', 'ज़रूरत से ऊपर'), rs(Math.abs(c.diff)), true) + `</table>`
      + `<p style="margin-top:14px;font-size:13px">${esc(insight(c, S.months))}</p><p style="margin-top:18px;font-size:11px;color:#3D5675">${t('Made on your own device with the free budget planner by Horex IT Solutions. Your numbers are not saved by us.', 'Horex IT Solutions के फ्री बजट प्लानर से आपके अपने डिवाइस पर बना। आपके आँकड़े हमारे पास सेव नहीं होते।')}</p>`;
  }
  function all() { $('#bp-name').value = S.name; $('#bp-ready').value = S.ready; $('#bp-sales').value = S.sales; rows('one'); rows('mon'); months(); summary(); }

  // ---- Events ----
  $('#bp-name').addEventListener('input', e => { S.name = e.target.value; save(); summary(); });
  ['ready', 'sales'].forEach(k => $('#bp-' + k).addEventListener('input', e => { S[k] = e.target.value; save(); summary(); }));
  ['one', 'mon'].forEach(kind => {
    const box = $('#bp-' + kind);
    box.addEventListener('input', e => { const row = e.target.closest('.bp-row'); if (!row) return; S[kind][+row.dataset.i][e.target.dataset.k] = e.target.value; save(); summary(); });
    box.addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (!b) return; const i = +b.closest('.bp-row').dataset.i;
      if (S[kind].length > 1) S[kind].splice(i, 1); else S[kind][0] = { l: '', a: '' }; save(); rows(kind); summary(); });
  });
  $$('#view-budgetPlanner [data-add]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.add; if (S[k].length >= 30) return; S[k].push({ l: '', a: '' }); save(); rows(k); summary(); const ins = $$('#bp-' + k + ' input[data-k="l"]'); ins[ins.length - 1].focus(); }));
  $('#bp-months').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; S.months = +b.dataset.m; save(); months(); summary(); });
  $('#bp-clear').addEventListener('click', () => { S = { name: '', one: blank(5), mon: blank(5), ready: '', sales: '', months: 3 }; try { localStorage.removeItem(KEY); } catch (e) {} all(); });
  $('#bp-print').addEventListener('click', () => {
    summary(); const off = () => document.body.classList.remove('bp-printing');
    document.body.classList.add('bp-printing'); window.addEventListener('afterprint', off, { once: true }); setTimeout(off, 60000);
    try { window.print(); } catch (e) { off(); }
  });

  // Lead capture (nothing is sent anywhere until you connect your own endpoint)
  $('#bp-lead').addEventListener('click', async () => {
    const btn = $('#bp-lead'); if (HorexForm.isBusy(btn)) return;
    const v = $('#bp-contact').value.trim(), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''));
    const err = $('#bp-leadErr'), done = $('#bp-leadOk'); done.classList.add('hidden');
    if (!ok) { err.textContent = 'Please type a valid email address or 10-digit mobile number.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden'); HorexForm.busy(btn, true);
    // The budget numbers are NOT sent on purpose (the page promises they stay on the device).
    const res = await HorexForm.send('free-tool-budget-planner', { name: '', contact: v, businessName: '', message: 'Tool: Startup Budget Planner' });
    HorexForm.busy(btn, false);
    if (!res.ok) { err.textContent = HorexForm.ERROR_MSG; err.classList.remove('hidden'); return; }
    window.budgetLead = { contact: v };
    done.textContent = 'Thank you! We will contact you about your free audit.'; done.classList.remove('hidden');
  });

  // Keep dynamic text in step with the language switcher
  const prevRender = window.quoteRender; window.quoteRender = () => { if (prevRender) prevRender(); summary(); };

  // Hindi strings for this view (merged into the site's HI dictionary once it exists)
  const BP_HI = {
    'Startup budget planner': 'स्टार्टअप बजट प्लानर', 'Free startup budget planner': 'फ्री स्टार्टअप बजट प्लानर',
    'List your one-time and monthly costs, see how much money you need to start and how long your money lasts, and print a one-page budget. Your numbers stay on your phone. No login.': 'अपने एक बार और महीने के खर्च लिखिए, देखिए शुरू करने के लिए कितना पैसा चाहिए और आपका पैसा कितना चलेगा, और एक पन्ने का बजट प्रिंट कीजिए। आपके आँकड़े आपके फ़ोन में ही रहते हैं। कोई लॉगिन नहीं।',
    'Business name (optional, for the printout)': 'बिज़नेस का नाम (वैकल्पिक, प्रिंट के लिए)',
    'Type only your own numbers in rupees. Leave a line empty if it does not apply. Your entries stay on this device.': 'सिर्फ़ अपने खुद के आँकड़े रुपये में लिखिए। जो लाइन लागू न हो उसे खाली छोड़िए। आपकी एंट्री इसी डिवाइस पर रहती हैं।',
    'A. One-time costs': 'A. एक बार के खर्च', 'B. Monthly costs': 'B. महीने के खर्च', '+ Add a line': '+ एक लाइन जोड़ें', 'C. Your money and sales': 'C. आपका पैसा और बिक्री',
    'Money you have ready (savings or loan you have already arranged)': 'आपके पास तैयार पैसा (बचत या पहले से तय लोन)', 'Sales you expect each month (your own guess, optional)': 'हर महीने अपेक्षित बिक्री (आपका अपना अंदाज़ा, वैकल्पिक)',
    'Leave empty to see how long your money lasts with no sales at all.': 'बिल्कुल बिक्री न होने पर आपका पैसा कितना चलेगा, यह देखने के लिए खाली छोड़िए।', 'Months of running cost to keep aside': 'चलाने के खर्च के कितने महीने अलग रखें',
    'Your budget': 'आपका बजट', 'One-time costs': 'एक बार के खर्च', 'Monthly costs': 'महीने के खर्च', 'Money needed to start comfortably': 'आराम से शुरू करने के लिए ज़रूरी पैसा', 'Money you have ready': 'आपके पास तैयार पैसा',
    'Above what you need': 'ज़रूरत से ऊपर', 'Short by': 'कमी', 'Print or save as PDF': 'प्रिंट करें या PDF सेव करें', 'Clear all': 'सब साफ़ करें',
    'If the print window does not open, save this page as PDF from your browser menu.': 'अगर प्रिंट विंडो न खुले, तो अपने ब्राउज़र के मेन्यू से इस पेज को PDF के रूप में सेव कीजिए।',
    'Line name': 'लाइन का नाम', 'Amount (₹)': 'राशि (₹)', 'Remove line': 'लाइन हटाएं',
    'Equipment or machines': 'उपकरण या मशीनें', 'Deposits (rent, electricity)': 'डिपॉज़िट (किराया, बिजली)', 'Licences and registration': 'लाइसेंस और रजिस्ट्रेशन', 'Initial stock': 'शुरुआती स्टॉक', 'Interiors and setup': 'इंटीरियर और सेटअप',
    'Rent': 'किराया', 'Salaries': 'वेतन', 'Electricity and internet': 'बिजली और इंटरनेट', 'Software and subscriptions': 'सॉफ़्टवेयर और सब्सक्रिप्शन', 'Marketing': 'मार्केटिंग',
    'List your one-time costs and your monthly costs.': 'अपने एक बार के खर्च और महीने के खर्च लिखिए।', 'Add the money you have ready, and your sales guess if you want.': 'अपना तैयार पैसा जोड़िए, और चाहें तो बिक्री का अंदाज़ा भी।',
    'Choose how many months of running cost to keep aside.': 'चलाने के खर्च के कितने महीने अलग रखने हैं, चुनिए।', 'Read the summary, then print or save one page.': 'सारांश पढ़िए, फिर एक पन्ना प्रिंट या सेव कीजिए।'
  };
  document.addEventListener('DOMContentLoaded', () => { if (typeof HI !== 'undefined') Object.assign(HI, BP_HI); });
  window.__bp = { calc, insight, num };
  all();
})();
