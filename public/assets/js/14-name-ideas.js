(function () {
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KINDS = [
 ['Restaurant, cafe or food business', 'food'], ['Bakery or sweet shop', 'bakery'], ['Salon, parlour or spa', 'salon'], ['Gym, yoga or fitness studio', 'gym'], ['Clinic or doctor', 'clinic'], ['Coaching or tuition', 'coaching'],
 ['Real estate agent or broker', 'estate'], ['Manufacturer or small factory', 'maker'], ['Wholesale or distribution', 'wholesale'], ['Shop or retail store', 'retail'], ['Pet shop, grooming or pet care', 'pet'], ['Professional service (CA, consultant, agency)', 'pro'],
 ['Home service (repair, cleaning, installation)', 'home'], ['Events, wedding or decoration services', 'events'], ['Hotel, homestay or travel', 'hotel'], ['Creator, freelancer or artist', 'creator']];
const STYLES = ['Simple and easy to say', 'Modern and short', 'Desi and warm'];
const BANK = {
 food: [['Chai', 'Brew', 'Cup', 'Kitchen', 'Tiffin', 'Plate'], ['चाय', 'कप', 'रसोई', 'टिफ़िन', 'थाली', 'ज़ायका']],
 bakery: [['Bake', 'Crumb', 'Sweet', 'Mithai', 'Oven', 'Treat'], ['बेक', 'मिठास', 'मिठाई', 'ओवन', 'स्वाद', 'केक']],
 salon: [['Glow', 'Style', 'Shine', 'Blush', 'Mirror', 'Aura'], ['ग्लो', 'स्टाइल', 'चमक', 'आभा', 'श्रृंगार', 'सजावट']],
 gym: [['Fit', 'Flex', 'Pulse', 'Strong', 'Zen', 'Stride'], ['फिट', 'ताक़त', 'दम', 'ज़ेन', 'जोश', 'योग']],
 clinic: [['Care', 'Health', 'Cure', 'Well', 'Heal', 'Life'], ['केयर', 'स्वास्थ्य', 'आरोग्य', 'सेहत', 'जीवन', 'उपचार']],
 coaching: [['Learn', 'Scholar', 'Gyan', 'Bright', 'Topper', 'Mentor'], ['ज्ञान', 'विद्या', 'गुरुकुल', 'टॉपर', 'ब्राइट', 'शिक्षा']],
 estate: [['Home', 'Nest', 'Plot', 'Key', 'Roof', 'Estate'], ['घर', 'आशियाना', 'नींव', 'प्लॉट', 'छत', 'चाबी']],
 maker: [['Craft', 'Forge', 'Works', 'Tech', 'Prime', 'Build'], ['कारीगर', 'निर्माण', 'वर्क्स', 'शक्ति', 'उद्योग', 'प्राइम']],
 wholesale: [['Bulk', 'Trade', 'Mart', 'Supply', 'Link', 'Bazaar'], ['थोक', 'व्यापार', 'मंडी', 'सप्लाई', 'बाज़ार', 'लिंक']],
 retail: [['Mart', 'Store', 'Bazaar', 'Basket', 'Hub', 'Choice'], ['मार्ट', 'बाज़ार', 'स्टोर', 'दुकान', 'पसंद', 'टोकरी']],
 pet: [['Paw', 'Pet', 'Woof', 'Tail', 'Fur', 'Buddy'], ['पॉ', 'पेट', 'दोस्त', 'पूँछ', 'प्यार', 'केयर']],
 pro: [['Advisor', 'Consult', 'Prime', 'Axis', 'Edge', 'Compass'], ['सलाहकार', 'कंसल्ट', 'दिशा', 'कम्पास', 'प्राइम', 'एज']],
 home: [['Fix', 'Care', 'Clean', 'Handy', 'Repair', 'Home'], ['सुधार', 'सफ़ाई', 'घर', 'सेवा', 'मरम्मत', 'हैंडी']],
 events: [['Utsav', 'Shaadi', 'Bloom', 'Festive', 'Celebrate', 'Mandap'], ['उत्सव', 'शादी', 'मंडप', 'सजावट', 'जश्न', 'बहार']],
 hotel: [['Stay', 'Trip', 'Yatra', 'Haven', 'Voyage', 'Retreat'], ['ठिकाना', 'सफ़र', 'यात्रा', 'विश्राम', 'सराय', 'रिट्रीट']],
 creator: [['Studio', 'Canvas', 'Pixel', 'Frame', 'Muse', 'Craft'], ['स्टूडियो', 'कैनवास', 'कला', 'रंग', 'फ्रेम', 'रचना']]
};
const SUF = [['Corner', 'House', 'Point', 'Hub', 'Nook', 'Studio', 'Station', 'Co', 'Place', 'Circle'], ['कॉर्नर', 'हाउस', 'पॉइंट', 'हब', 'घर', 'स्टूडियो', 'स्टेशन', 'सर्कल', 'दुनिया', 'बाज़ार']];
const PRE = [['The Daily', 'Happy', 'Royal', 'Prime', 'Fresh', 'Bright'], ['रोज़ का', 'हैप्पी', 'रॉयल', 'प्राइम', 'ताज़ा', 'उजाला']];
const DESI = [['Apna', 'Desi', 'Shree', 'Swagat', 'Dil Se', 'Maa Ka', 'Mera'], ['अपना', 'देसी', 'श्री', 'स्वागत', 'दिल से', 'माँ का', 'मेरा']];
const pick = a => a[Math.floor(Math.random() * a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function localNames(kindLabel, what, city, style, lang) {
  const key = (KINDS.find(k => k[0] === kindLabel) || KINDS[9])[1], hi = lang === 'hi', L = hi ? 1 : 0;
  const cores = BANK[key][L].slice(); const w = (what.match(/[A-Za-z]{3,14}/) || [''])[0];
  if (!hi && w) cores.push(cap(w));
  const cityW = ((hi ? city.match(/[\u0900-\u097F]+/) : city.match(/[A-Za-z]+/)) || [''])[0]; const cty = hi ? cityW : cap(cityW);
  const out = new Set();
  const P = {
    0: [c => `${c} ${pick(SUF[L])}`, c => hi ? `${pick(PRE[L])} ${c}` : `The ${c} ${pick(SUF[L])}`, c => cty ? `${cty} ${c}` : `${pick(PRE[L])} ${c}`, c => `${pick(PRE[L])} ${c} ${pick(SUF[L])}`],
    1: [c => `${c} ${pick(cores)}`, c => hi ? `${c} हब` : `${c} Hub`, c => hi ? `${c} कंपनी` : `${c} Co`, c => hi ? `${c} ${pick(SUF[L])}` : `${c} ${pick(['Nook', 'Lab', 'Studio', 'Point'])}`],
    2: [c => `${pick(DESI[L])} ${c}`, c => `${pick(DESI[L])} ${c} ${pick(SUF[L])}`, c => hi ? `${c} वाला` : `${c} Wala`, c => cty ? (hi ? `${cty} का ${c}` : `${cty} Ka ${c}`) : `Shree ${c} ${pick(SUF[L])}`]
  }[style];
  let guard = 0; while (out.size < 10 && guard++ < 200) { const n = pick(P)(pick(cores)).replace(/\s+/g, ' ').trim(); const w = n.split(' '); if (n && new Set(w).size === w.length) out.add(n); }
  return [...out];
}

const S = { lang: 'en' };
const hiUI = () => window.LANG === 'hi';
$('#nm-kind').innerHTML = `<option value="">Choose a kind of business</option>` + KINDS.map(k => `<option value="${k[0]}">${k[0]}</option>`).join('');
$('#nm-style').innerHTML = STYLES.map((s, i) => `<button type="button" class="chip${i === 0 ? ' sel' : ''}" data-i="${i}">${s}</button>`).join('');
$('#nm-lang').innerHTML = '<button type="button" class="chip sel" data-l="en">English</button><button type="button" class="chip" data-l="hi">हिंदी</button>';
let style = 0;
$('#nm-style').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; style = +b.dataset.i; [...$('#nm-style').children].forEach(c => c.classList.toggle('sel', c === b)); });
$('#nm-lang').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; S.lang = b.dataset.l; [...$('#nm-lang').children].forEach(c => c.classList.toggle('sel', c === b)); });

let ideas = [], city = '', checked = new Map();
const showMsg = (id, t) => { const e = $(id); if (!t) { e.classList.add('hidden'); return; } e.textContent = t; e.classList.remove('hidden'); };
function render() {
  const box = $('#nm-results');
  $('#nm-resWrap').classList.toggle('hidden', !ideas.length);
  box.innerHTML = ideas.map((n, i) => `<div class="card hov deep p-5 flex flex-col"><p class="text-xl font-extrabold break-words" ${S.lang === 'hi' ? 'lang="hi"' : ''}>${esc(n)}</p><div class="mt-4 flex flex-wrap gap-2"><button type="button" data-copy="${i}" class="btn bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white font-bold text-sm px-4 py-2 rounded-full">Copy</button><button type="button" data-check="${i}" class="btn bg-em hover:bg-em2 text-white font-bold text-sm px-4 py-2 rounded-full">Check this name</button></div></div>`).join('');
}
function validate() {
  if (!$('#nm-kind').value) { showMsg('#nm-err', 'Please choose a kind of business.'); return null; }
  if (!$('#nm-what').value.trim()) { showMsg('#nm-err', 'Please tell us what you sell or do.'); return null; }
  showMsg('#nm-err', ''); return { kind: $('#nm-kind').value, what: $('#nm-what').value.trim(), city: $('#nm-city').value.trim() };
}
function done(list, note) { ideas = list; city = $('#nm-city').value.trim(); showMsg('#nm-note', note || ''); render(); $('#nm-resWrap').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$('#nm-quick').addEventListener('click', () => { const v = validate(); if (!v) return; done(localNames(v.kind, v.what, v.city, style, S.lang), ''); });

let busy = false;
$('#nm-ai').addEventListener('click', async () => {
  const v = validate(); if (!v || busy) return; busy = true; $('#nm-ai').disabled = true; showMsg('#nm-note', ''); showMsg('#nm-wait', 'Asking AI for ideas...');
  const fallback = msg => done(localNames(v.kind, v.what, v.city, style, S.lang), msg);
  try {
    const sample = window.claude && window.claude.use ? await window.claude.use('sample') : null;
    if (!sample) { fallback('AI is not available here, so we used quick ideas from your phone.'); return; }
    const styleText = ['simple, plain and easy to say', 'modern and short (one or two words)', 'desi and warm, with a friendly Indian feel'][style];
    const prompt = `You are helping a small Indian business choose a name. Reply with only a JSON array of exactly 10 strings (business name ideas), and nothing else.\nBusiness kind: ${v.kind}\nWhat they sell or do: ${v.what}\nCity or area: ${v.city || 'not given'}\nStyle: ${styleText}\nLanguage: ${S.lang === 'hi' ? 'Hindi names written in Devanagari script' : 'English names written in the Latin alphabet'}\nRules: each name is 1 to 4 words, easy to say and spell, fits this business, and is not a famous or existing brand. No claims that a name is available. No emojis and no quotation marks inside a name.\nExample reply: ["Chai & Co","Brew Nook"]`;
    const arr = await sample.json(prompt, { modelTier: 'quick' });
    const list = [...new Set((Array.isArray(arr) ? arr : []).filter(x => typeof x === 'string').map(x => x.replace(/["“”]/g, '').trim()).filter(x => x && x.length <= 40))].slice(0, 10);
    if (!list.length) fallback('AI could not answer right now, so we used quick ideas from your phone.'); else done(list, '');
  } catch (e) {
    fallback(e && e.code === 'not_granted' ? 'AI was not allowed here, so we used quick ideas from your phone.' : 'AI could not answer right now, so we used quick ideas from your phone.');
  } finally { busy = false; $('#nm-ai').disabled = false; showMsg('#nm-wait', ''); }
});

// Copy + toast
let tt = 0;
function toast(t) { const e = $('#nmToast'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(tt); tt = setTimeout(() => e.classList.add('hidden'), 2200); if (window.LANG === 'hi' && window.applyLang) window.applyLang(); }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  try { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); const ok = document.execCommand('copy'); t.remove(); return ok; } catch (e) { return false; }
}
$('#nm-results').addEventListener('click', async e => {
  const c = e.target.closest('[data-copy]'), k = e.target.closest('[data-check]');
  if (c) toast((await copy(ideas[+c.dataset.copy])) ? 'Copied' : 'Could not copy. Select the name and copy it yourself.');
  if (k) openCheck(ideas[+k.dataset.check], k);
});

// "Check this name" checklist
const modal = $('#nmModal'); let cur = '', opener = null;
const slugOf = n => n.toLowerCase().replace(/[^a-z0-9]/g, '');
function items(n) {
  const q = encodeURIComponent, slug = slugOf(n), cty = city;
  return [
    ['Search the name on Google, in quotes, with your city.', 'Search on Google →', `https://www.google.com/search?q=${q('"' + n + '" ' + cty)}`],
    ['Search it on Google Maps: is a business near you already using it?', 'Search on Maps →', `https://www.google.com/maps/search/${q(n + ' ' + cty)}`],
    ['Look for the same name as an Instagram page.', 'Open this Instagram name →', slug ? `https://www.instagram.com/${slug}/` : `https://www.google.com/search?q=${q('site:instagram.com "' + n + '"')}`],
    ['Check that a matching website address (domain) is not taken.', 'Domain search →', slug ? `https://lookup.icann.org/en/lookup?name=${slug}.com` : `https://www.google.com/search?q=${q(n + ' domain name')}`, true],
    ['Look at the official trademark public search yourself.', 'Official trademark public search →', 'https://tmrsearch.ipindia.gov.in/tmrpublicsearch/']
  ];
}
function renderModal() {
  if (!cur) return; const set = checked.get(cur) || new Set(), its = items(cur);
  $('#nmTitle').textContent = hiUI() ? `क्या “${cur}” नाम खाली है? खुद जाँचिए` : `Is “${cur}” free? Check it yourself`;
  $('#nmCount').textContent = hiUI() ? `${set.size} / 5 पर टिक (सिर्फ़ आपका नोट)` : `${set.size} of 5 ticked (your own note)`;
  $('#nmItems').innerHTML = its.map((it, i) => `<li class="rounded-2xl bg-cream p-4 flex gap-3 items-start"><input type="checkbox" id="nmck${i}" data-i="${i}" ${set.has(i) ? 'checked' : ''} class="mt-1 w-5 h-5 shrink-0 rounded-md" style="accent-color:#00A86B"><div class="flex-1"><label for="nmck${i}" class="font-semibold cursor-pointer">${it[0]}</label><div class="mt-2 flex flex-wrap gap-x-5 gap-y-1"><a href="${esc(it[2])}" target="_blank" rel="noopener noreferrer" class="inline-block font-extrabold text-em2 hover:text-em transition">${it[1]}</a>${it[3] ? `<button type="button" data-build class="inline-block text-left font-extrabold text-em2 hover:text-em transition cursor-pointer">Build my website →</button>` : ''}</div></div></li>`).join('');
}
function openCheck(n, from) { cur = n; opener = from; renderModal(); modal.classList.remove('hidden'); $('#nmClose').focus(); if (hiUI() && window.applyLang) window.applyLang(); }
function closeCheck() { modal.classList.add('hidden'); if (opener && opener.focus) opener.focus(); }
$('#nmItems').addEventListener('change', e => { const i = e.target.dataset.i; if (i === undefined) return; const s = checked.get(cur) || new Set(); e.target.checked ? s.add(+i) : s.delete(+i); checked.set(cur, s); renderModal(); if (hiUI() && window.applyLang) window.applyLang(); });
// Item 4: close the checklist and open the Build my website form (name and city carried over when the form is empty)
$('#nmItems').addEventListener('click', e => { if (!e.target.closest('[data-build]')) return; const biz = $('#bs-biz'), cty = $('#bs-city'); if (biz && !biz.value.trim()) biz.value = cur; if (cty && !cty.value.trim() && city) cty.value = city; modal.classList.add('hidden'); window.route('buildsite'); });
$('#nmClose').addEventListener('click', closeCheck); $('#nmX').addEventListener('click', closeCheck);
modal.addEventListener('click', e => { if (e.target === modal) closeCheck(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeCheck(); });

// Lead capture: also saves the list as a text file on the person's own device (never uploaded)
async function saveFile() {
  if (!ideas.length) return false; let d = null; try { d = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) {}
  if (!d) return false;
  const lines = ideas.map(n => { const s = checked.get(n); return `${n}${s && s.size ? `  (${s.size} of 5 checks ticked)` : ''}`; });
  try { await d.save({ filename: 'business-name-ideas.txt', data: 'Business name ideas (made on your own device)\n\n' + lines.join('\n') + '\n\nIdeas only. Not a legal check.\n' }); return true; } catch (e) { return false; }
}
$('#nm-lead').addEventListener('click', async () => {
  const btn = $('#nm-lead'); if (HorexForm.isBusy(btn)) return;
  const v = $('#nm-contact').value.trim(), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''));
  $('#nm-ok').classList.add('hidden');
  if (!ok) { showMsg('#nm-leadErr', 'Please type a valid email address or 10-digit mobile number.'); return; }
  showMsg('#nm-leadErr', ''); HorexForm.busy(btn, true);
  const res = await HorexForm.send('free-tool-name-ideas', {
    name: '', contact: v, businessName: '',
    message: HorexForm.lines([['Tool', 'Business Name Ideas'], ['Name ideas', ideas]])
  });
  HorexForm.busy(btn, false);
  if (!res.ok) { showMsg('#nm-leadErr', HorexForm.ERROR_MSG); return; }
  window.nameLead = { contact: v, ideas };
  const saved = await saveFile(); showMsg('#nm-ok', saved ? 'Thank you! We will contact you about your free audit. Your list was saved to your device.' : 'Thank you! We will contact you about your free audit.');
});
['#nm-kind', '#nm-what'].forEach(s => $(s).addEventListener('input', () => showMsg('#nm-err', '')));
const prevRender = window.quoteRender; window.quoteRender = () => { if (prevRender) prevRender(); if (!modal.classList.contains('hidden')) renderModal(); };
const prevView = window.onView; window.onView = v => { if (prevView) prevView(v); modal.classList.add('hidden'); };
window.__nameTools = { localNames, KINDS };
})();
