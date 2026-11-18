(function () {
  const $ = s => document.querySelector(s);
  const hi = () => window.LANG === 'hi', t = (en, h) => hi() ? h : en;
  const num = v => Math.min(1e10, parseFloat(String(v == null ? '' : v).replace(/[^\d.]/g, '')) || 0);
  const nf = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }), n0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const rs = n => '₹' + nf.format(Math.round(n * 100) / 100), rs0 = n => '₹' + n0.format(Math.round(n));
  const KEY = 'hx_breakeven', GST = [0, 5, 12, 18, 28], WANT = [20, 30, 40, 50];
  const DEF = { cost: '', price: '', gst: '', included: true, fixed: '', salary: '', want: '' };
  let S = Object.assign({}, DEF);
  try { const x = JSON.parse(localStorage.getItem(KEY) || 'null'); if (x && typeof x === 'object') S = Object.assign(S, x); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  // ---- Pure calculations ----
  function calc(s) {
    const cost = num(s.cost), price = num(s.price), g = Math.min(100, num(s.gst)) / 100, fixed = num(s.fixed), salary = num(s.salary);
    const net = s.included ? price / (1 + g) : price;
    const gstAmt = s.included ? price - net : price * g, pays = s.included ? price : price + gstAmt;
    const profit = net - cost, margin = net > 0 ? profit / net * 100 : 0, markup = cost > 0 ? profit / cost * 100 : null;
    const ok = profit > 0;
    const beUnits = ok ? Math.ceil(fixed / profit - 1e-9) : null, tgtUnits = ok ? Math.ceil((fixed + salary) / profit - 1e-9) : null;
    return { cost, price, g, fixed, salary, net, gstAmt, pays, profit, margin, markup, ok, beUnits, tgtUnits,
      beSales: ok ? beUnits * net : null, tgtSales: ok ? tgtUnits * net : null };
  }
  function target(s) {   // price needed for the margin the person wants
    const cost = num(s.cost), m = num(s.want), g = Math.min(100, num(s.gst)) / 100;
    if (!(m > 0) || m >= 95 || !(cost > 0)) return null;
    const net = cost / (1 - m / 100);
    return { net, pays: net * (1 + g), profit: net - cost, markup: (net - cost) / cost * 100 };
  }

  // ---- Rendering ----
  const row = (l, v, strong) => `<div class="flex justify-between gap-3${strong ? ' rounded-2xl bg-mint px-3 py-3' : ''}"><dt class="${strong ? 'font-extrabold' : 'text-slate2 font-semibold'}">${l}</dt><dd class="font-extrabold ${strong ? 'text-em2 text-lg' : ''}">${v}</dd></div>`;
  function chips(id, list, cur, key, suffix) {
    $(id).innerHTML = list.map(v => `<button type="button" class="chip${Number(cur) === v && String(cur) !== '' ? ' sel' : ''}" data-v="${v}" data-k="${key}" aria-pressed="${Number(cur) === v && String(cur) !== ''}">${v}${suffix}</button>`).join('');
  }
  function mode() {
    $('#be-mode').innerHTML = [[true, 'Price includes GST', 'कीमत में GST शामिल है'], [false, 'GST added on top', 'GST ऊपर से जुड़ता है']]
      .map(m => `<button type="button" class="chip${S.included === m[0] ? ' sel' : ''}" data-mode="${m[0]}" aria-pressed="${S.included === m[0]}">${t(m[1], m[2])}</button>`).join('');
  }
  function render() {
    const c = calc(S), out = [];
    const hasPrice = c.price > 0;
    if (c.g > 0 && hasPrice) { out.push(row(t('Your customer pays', 'आपका ग्राहक देता है'), rs(c.pays)), row(t('GST in that price (goes to the government)', 'उस कीमत में GST (सरकार को जाता है)'), rs(c.gstAmt))); }
    out.push(row(t('You keep per sale (without GST)', 'हर बिक्री पर आपके पास (GST के बिना)'), rs(c.net)));
    out.push(row(t('Profit per unit', 'हर यूनिट पर मुनाफ़ा'), `<span class="${c.profit < 0 ? 'text-amber-600' : 'text-em2'}">${c.profit < 0 ? '−' : ''}${rs(Math.abs(c.profit))}</span>`, true));
    out.push(row(t('Margin', 'मार्जिन'), hasPrice ? `${nf.format(Math.round(c.margin * 10) / 10)}%` : '0%'));
    if (c.markup !== null && hasPrice) out.push(row(t('Markup on your cost', 'आपकी लागत पर मार्कअप'), `${nf.format(Math.round(c.markup * 10) / 10)}%`));
    out.push(row(t('Sales needed each month to break even', 'ब्रेक-ईवन के लिए हर महीने ज़रूरी बिक्री'), c.ok ? `${n0.format(c.beUnits)} ${t('units', 'यूनिट')}` : '—', true));
    out.push(row(t('Sales value at break-even (without GST)', 'ब्रेक-ईवन पर बिक्री की रकम (GST के बिना)'), c.ok ? rs0(c.beSales) : '—'));
    out.push(row(t('Sales needed to also pay yourself', 'खुद को भी देने के लिए ज़रूरी बिक्री'), c.ok ? `${n0.format(c.tgtUnits)} ${t('units', 'यूनिट')}` : '—', true));
    out.push(row(t('Sales value for that target (without GST)', 'उस लक्ष्य की बिक्री की रकम (GST के बिना)'), c.ok ? rs0(c.tgtSales) : '—'));
    $('#be-out').innerHTML = out.join('');
    $('#be-note').textContent = note(c);
    // Margin finder
    const w = target(S), box = $('#be-wantOut');
    if (!w) box.innerHTML = `<p class="rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-slate2">${num(S.cost) > 0 ? t('Choose a margin between 1% and 94%.', '1% से 94% के बीच कोई मार्जिन चुनिए।') : t('Enter the cost of one unit first.', 'पहले एक यूनिट की लागत लिखिए।')}</p>`;
    else box.innerHTML = row(t('Selling price before GST', 'GST से पहले बिक्री की कीमत'), rs(w.net), true) + (num(S.gst) > 0 ? row(t('Price your customer pays (with GST)', 'आपका ग्राहक जो कीमत देगा (GST के साथ)'), rs(w.pays)) : '')
      + row(t('Profit on each sale', 'हर बिक्री पर मुनाफ़ा'), rs(w.profit)) + row(t('That is a markup on cost of', 'यह लागत पर मार्कअप है'), `${nf.format(Math.round(w.markup * 10) / 10)}%`);
  }
  function note(c) {
    if (!(c.cost > 0) && !(c.price > 0)) return t('Enter your cost and your selling price to see your results.', 'अपने नतीजे देखने के लिए अपनी लागत और बिक्री की कीमत लिखिए।');
    if (!(c.price > 0)) return t('Now enter your selling price.', 'अब अपनी बिक्री की कीमत लिखिए।');
    if (c.profit <= 0) return t(`At this price you ${c.profit < 0 ? 'lose ' + rs(-c.profit) : 'make nothing'} on every sale, so selling more will not help. Raise the price or lower your cost.`, `इस कीमत पर हर बिक्री पर ${c.profit < 0 ? rs(-c.profit) + ' का नुकसान' : 'कुछ भी नहीं बचता'}, इसलिए ज़्यादा बेचने से मदद नहीं मिलेगी। कीमत बढ़ाइए या लागत घटाइए।`);
    if (!(c.fixed > 0) && !(c.salary > 0)) return t(`You keep ${rs(c.profit)} on each sale. Add your monthly fixed costs and the salary you want to see how many sales you need.`, `हर बिक्री पर आपके पास ${rs(c.profit)} बचते हैं। कितनी बिक्री चाहिए यह देखने के लिए अपने महीने के फ़िक्स्ड खर्च और अपनी चाही सैलरी लिखिए।`);
    const perDay = Math.ceil(c.tgtUnits / 26);
    return t(`You keep ${rs(c.profit)} on each sale. You need ${n0.format(c.beUnits)} sales a month to cover your fixed costs, and ${n0.format(c.tgtUnits)} sales (about ${n0.format(perDay)} a day, over 26 working days) to also pay yourself.`,
      `हर बिक्री पर आपके पास ${rs(c.profit)} बचते हैं। फ़िक्स्ड खर्च पूरे करने के लिए हर महीने ${n0.format(c.beUnits)} बिक्री चाहिए, और खुद को भी देने के लिए ${n0.format(c.tgtUnits)} बिक्री (26 कामकाजी दिनों में लगभग ${n0.format(perDay)} रोज़)।`);
  }
  function all() {
    ['cost', 'price', 'gst', 'fixed', 'salary', 'want'].forEach(k => { $('#be-' + k).value = S[k]; });
    chips('#be-gstChips', GST, S.gst, 'gst', '%'); chips('#be-wantChips', WANT, S.want, 'want', '%'); mode(); render();
  }

  // ---- Events ----
  ['cost', 'price', 'gst', 'fixed', 'salary', 'want'].forEach(k => $('#be-' + k).addEventListener('input', e => {
    S[k] = e.target.value; save(); if (k === 'gst') chips('#be-gstChips', GST, S.gst, 'gst', '%'); if (k === 'want') chips('#be-wantChips', WANT, S.want, 'want', '%'); render(); }));
  const pickChip = e => { const b = e.target.closest('[data-k]'); if (!b) return; S[b.dataset.k] = b.dataset.v; $('#be-' + b.dataset.k).value = S[b.dataset.k]; save();
    chips('#be-gstChips', GST, S.gst, 'gst', '%'); chips('#be-wantChips', WANT, S.want, 'want', '%'); render(); };
  $('#be-gstChips').addEventListener('click', pickChip); $('#be-wantChips').addEventListener('click', pickChip);
  $('#be-mode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; S.included = b.dataset.mode === 'true'; save(); mode(); render(); });
  $('#be-clear').addEventListener('click', () => { S = Object.assign({}, DEF); try { localStorage.removeItem(KEY); } catch (e) {} all(); });

  // Lead capture (nothing is sent anywhere until you connect your own endpoint)
  $('#be-lead').addEventListener('click', () => {
    const v = $('#be-contact').value.trim(), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''));
    const err = $('#be-leadErr'), done = $('#be-leadOk'); done.classList.add('hidden');
    if (!ok) { err.textContent = 'Please type a valid email address or 10-digit mobile number.'; err.classList.remove('hidden'); return; }
    err.classList.add('hidden');
    // TODO: send { contact: v } to your server or CRM here. The calculator numbers are NOT included on purpose.
    console.log('Break-even calculator lead', { contact: v }); window.breakEvenLead = { contact: v };
    done.textContent = 'Thank you! We will contact you about your free audit.'; done.classList.remove('hidden');
  });
  const prevRender = window.quoteRender; window.quoteRender = () => { if (prevRender) prevRender(); mode(); render(); };

  const BE_HI = {
    'Price and break-even calculator': 'कीमत और ब्रेक-ईवन कैलकुलेटर', 'Free price and break-even calculator': 'फ्री कीमत और ब्रेक-ईवन कैलकुलेटर',
    'See what you keep on each sale, your margin, and how many sales you need each month to cover your costs and pay yourself. Your numbers stay on your phone. No login.': 'देखिए हर बिक्री पर आपके पास क्या बचता है, आपका मार्जिन, और अपने खर्च पूरे करने और खुद को देने के लिए हर महीने कितनी बिक्री चाहिए। आपके आँकड़े आपके फ़ोन में ही रहते हैं। कोई लॉगिन नहीं।',
    'Type only your own numbers in rupees. Leave a box empty if it does not apply. Your entries stay on this device.': 'सिर्फ़ अपने खुद के आँकड़े रुपये में लिखिए। जो खाना लागू न हो उसे खाली छोड़िए। आपकी एंट्री इसी डिवाइस पर रहती हैं।',
    'Your price': 'आपकी कीमत', 'Cost of ONE unit (what it costs you to make or buy one)': 'एक यूनिट की लागत (एक बनाने या खरीदने में आपका कितना खर्च होता है)', 'Selling price (for one unit)': 'बिक्री की कीमत (एक यूनिट की)',
    'GST percentage': 'GST प्रतिशत', 'Is GST already in your selling price?': 'क्या GST पहले से आपकी बिक्री की कीमत में शामिल है?', 'Price includes GST': 'कीमत में GST शामिल है', 'GST added on top': 'GST ऊपर से जुड़ता है',
    'Enter your cost without GST if you can claim that GST back. If you cannot claim it, include it in your cost.': 'अगर आप उस GST को वापस ले सकते हैं तो अपनी लागत GST के बिना लिखिए। अगर वापस नहीं ले सकते, तो उसे अपनी लागत में जोड़िए।',
    'Your month': 'आपका महीना', 'Monthly fixed costs (rent, salaries, bills, loan payments)': 'महीने के फ़िक्स्ड खर्च (किराया, वेतन, बिल, लोन की किस्तें)', 'Salary or profit you want for yourself each month': 'हर महीने खुद के लिए चाही गई सैलरी या मुनाफ़ा',
    'What price gives me a margin I want?': 'कौन सी कीमत मुझे मेरा चाहा हुआ मार्जिन देगी?', 'Margin I want (as a percentage of the selling price)': 'मेरा चाहा हुआ मार्जिन (बिक्री की कीमत के प्रतिशत के रूप में)',
    'Margin is profit as a share of the selling price (without GST). Markup is profit as a share of your cost, so it is always a bigger number.': 'मार्जिन बिक्री की कीमत (GST के बिना) में मुनाफ़े का हिस्सा है। मार्कअप आपकी लागत में मुनाफ़े का हिस्सा है, इसलिए वह हमेशा बड़ा आँकड़ा होता है।',
    'Your results': 'आपके नतीजे', 'Clear all': 'सब साफ़ करें',
    'Enter what one unit costs you and what you sell it for.': 'लिखिए कि एक यूनिट आपको कितने की पड़ती है और आप उसे कितने में बेचते हैं।', 'Add your GST, and say if it is already in your price.': 'अपना GST जोड़िए, और बताइए कि वह कीमत में पहले से शामिल है या नहीं।',
    'Add your monthly fixed costs and the salary you want.': 'अपने महीने के फ़िक्स्ड खर्च और चाही हुई सैलरी जोड़िए।', 'Read how many sales you need, or find the price for a margin you want.': 'पढ़िए कितनी बिक्री चाहिए, या अपने चाहे मार्जिन के लिए कीमत ढूँढिए।',
    'This is a simple planner, not tax advice. Check GST rules with your CA.': 'यह एक सरल प्लानर है, टैक्स सलाह नहीं। GST के नियम अपने CA से जाँच लीजिए।'
  };
  document.addEventListener('DOMContentLoaded', () => { if (typeof HI !== 'undefined') Object.assign(HI, BE_HI); });
  window.__be = { calc, target, num };
  all();
})();
