// Compact QR encoder: byte mode, error correction level M, versions 1-10 (up to 213 bytes)
const QR = (function () {
  const EXP = new Array(512), LOG = new Array(256); let x = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => a && b ? EXP[LOG[a] + LOG[b]] : 0;
  function gen(n) { let p = [1]; for (let i = 0; i < n; i++) { const q = new Array(p.length + 1).fill(0); for (let j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); } p = q; } return p; }
  function rs(data, n) { const g = gen(n), r = new Array(n).fill(0); for (const d of data) { const f = d ^ r.shift(); r.push(0); if (f) for (let i = 0; i < n; i++) r[i] ^= mul(g[i + 1], f); } return r; }
  const EC = { 1: [10, [[1, 16]]], 2: [16, [[1, 28]]], 3: [26, [[1, 44]]], 4: [18, [[2, 32]]], 5: [24, [[2, 43]]], 6: [16, [[4, 27]]], 7: [18, [[4, 31]]], 8: [22, [[2, 38], [2, 39]]], 9: [22, [[3, 36], [2, 37]]], 10: [26, [[4, 43], [1, 44]]] };
  const AL = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };
  const dcw = v => EC[v][1].reduce((a, g) => a + g[0] * g[1], 0);
  const cap = v => Math.floor((dcw(v) * 8 - 4 - (v < 10 ? 8 : 16)) / 8);
  const MASKS = [(r, c) => (r + c) % 2 === 0, (r, c) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0, (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => (r * c) % 2 + (r * c) % 3 === 0, (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0, (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0];
  const fmtBits = d => { let v = d << 10; for (let i = 14; i >= 10; i--) if ((v >> i) & 1) v ^= 0x537 << (i - 10); return ((d << 10) | v) ^ 0x5412; };
  const verBits = n => { let v = n << 12; for (let i = 17; i >= 12; i--) if ((v >> i) & 1) v ^= 0x1f25 << (i - 12); return (n << 12) | v; };

  function penalty(m, n) {
    let p = 0;
    for (let a = 0; a < n; a++) for (const rowwise of [true, false]) {
      let run = 1;
      for (let b = 1; b < n; b++) { const cur = rowwise ? m[a][b] : m[b][a], prev = rowwise ? m[a][b - 1] : m[b - 1][a]; if (cur === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; }
    }
    for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) { const v = m[r][c]; if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3; }
    const pat = [1, 0, 1, 1, 1, 0, 1];
    for (let a = 0; a < n; a++) for (let b = 0; b <= n - 7; b++) for (const rowwise of [true, false]) {
      const at = k => rowwise ? m[a][b + k] : m[b + k][a]; let ok = true; for (let k = 0; k < 7; k++) if (at(k) !== pat[k]) { ok = false; break; }
      if (!ok) continue;
      const w = (s, e) => { for (let k = s; k < e; k++) { const i = b + k; if (i < 0 || i >= n) continue; if ((rowwise ? m[a][i] : m[i][a]) !== 0) return false; } return true; };
      if (w(-4, 0) || w(7, 11)) p += 40;
    }
    let dark = 0; for (const row of m) for (const v of row) dark += v;
    return p + Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
  }

  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let v = 1; while (v <= 10 && bytes.length > cap(v)) v++;
    if (v > 10) throw new Error('too_long');
    const bits = []; const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
    const total = dcw(v) * 8; for (let i = 0; i < 4 && bits.length < total; i++) bits.push(0);
    while (bits.length % 8) bits.push(0);
    const cw = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; cw.push(b); }
    for (let pad = 0xec; cw.length < dcw(v); pad = pad === 0xec ? 0x11 : 0xec) cw.push(pad);
    const [ecLen, groups] = EC[v], blocks = []; let off = 0;
    groups.forEach(([count, len]) => { for (let i = 0; i < count; i++) { const d = cw.slice(off, off + len); off += len; blocks.push({ d, e: rs(d, ecLen) }); } });
    const out = []; const maxD = Math.max(...blocks.map(b => b.d.length));
    for (let i = 0; i < maxD; i++) blocks.forEach(b => { if (i < b.d.length) out.push(b.d[i]); });
    for (let i = 0; i < ecLen; i++) blocks.forEach(b => out.push(b.e[i]));
    const sb = []; out.forEach(b => { for (let i = 7; i >= 0; i--) sb.push((b >> i) & 1); });

    const n = 17 + 4 * v, m = Array.from({ length: n }, () => new Array(n).fill(0)), fn = Array.from({ length: n }, () => new Array(n).fill(false));
    const set = (r, c, val) => { if (r < 0 || c < 0 || r >= n || c >= n) return; m[r][c] = val; fn[r][c] = true; };
    [[0, 0], [0, n - 7], [n - 7, 0]].forEach(([r0, c0]) => { for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) { const rr = r0 + r, cc = c0 + c; const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6; const dark = inside && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)); set(rr, cc, dark ? 1 : 0); } });
    for (let i = 8; i < n - 8; i++) { set(6, i, i % 2 === 0 ? 1 : 0); set(i, 6, i % 2 === 0 ? 1 : 0); }
    const ap = AL[v];
    ap.forEach(r => ap.forEach(c => { if ((r === 6 && c === 6) || (r === 6 && c === ap[ap.length - 1]) || (c === 6 && r === ap[ap.length - 1])) return; for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0); }));
    for (let i = 0; i < 9; i++) { fn[8][i] = true; fn[i][8] = true; }
    for (let i = 0; i < 8; i++) { fn[8][n - 1 - i] = true; fn[n - 1 - i][8] = true; }
    set(n - 8, 8, 1);
    if (v >= 7) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { fn[i][n - 11 + j] = true; fn[n - 11 + j][i] = true; }
    let bi = 0, dir = -1, r = n - 1;
    for (let c = n - 1; c > 0; c -= 2) {
      if (c === 6) c = 5;
      for (;;) { for (let j = 0; j < 2; j++) { const cc = c - j; if (!fn[r][cc]) m[r][cc] = bi < sb.length ? sb[bi++] : 0; } r += dir; if (r < 0 || r >= n) { r -= dir; dir = -dir; break; } }
    }
    function finish(mask) {
      const q = m.map(row => row.slice());
      for (let rr = 0; rr < n; rr++) for (let cc = 0; cc < n; cc++) if (!fn[rr][cc] && MASKS[mask](rr, cc)) q[rr][cc] ^= 1;
      const fb = fmtBits(mask);
      for (let i = 0; i < 15; i++) { const bit = (fb >> i) & 1;
        if (i < 6) q[i][8] = bit; else if (i < 8) q[i + 1][8] = bit; else q[n - 15 + i][8] = bit;
        if (i < 8) q[8][n - i - 1] = bit; else if (i < 9) q[8][15 - i] = bit; else q[8][15 - i - 1] = bit; }
      q[n - 8][8] = 1;
      if (v >= 7) { const vb = verBits(v); for (let i = 0; i < 18; i++) { const bit = (vb >> i) & 1; q[Math.floor(i / 3)][i % 3 + n - 11] = bit; q[i % 3 + n - 11][Math.floor(i / 3)] = bit; } }
      return q;
    }
    let best = null, bp = Infinity;
    for (let k = 0; k < 8; k++) { const q = finish(k), p = penalty(q, n); if (p < bp) { bp = p; best = q; } }
    return { size: n, version: v, m: best };
  }
  return { encode, maxBytes: cap(10) };
})();

(function () {
const $ = s => document.querySelector(s);
const safeUrl = u => { u = (u || '').trim(); if (!u || /\s/.test(u)) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.') ? x.href : ''; } catch (e) { return ''; } };
const reviewUrl = s => { s = (s || '').trim(); return /^ChIJ[\w-]{10,}$/.test(s) ? 'https://search.google.com/local/writereview?placeid=' + s : safeUrl(s); };
const TXT = { English: { h: 'Loved your visit? Scan to leave us a Google review!', s: 'It takes 30 seconds. Thank you!', i: 'Open your phone camera and point it here.', n: 'Your business name' },
              Hindi: { h: 'हमारी सेवा पसंद आई? Google पर रिव्यू देने के लिए स्कैन कीजिए!', s: 'सिर्फ़ 30 सेकंड लगते हैं। धन्यवाद!', i: 'अपने फ़ोन का कैमरा खोलिए और यहाँ दिखाइए।', n: 'आपके बिज़नेस का नाम' } };
const STY = {
  Emerald: { bg: ['#00A86B', '#008F5B'], fg: '#FFFFFF', sub: 'rgba(255,255,255,.92)', qr: '#003366', star: '#FAF9F6', foot: 'rgba(255,255,255,.8)' },
  Navy: { bg: ['#003366', '#0A4A5F'], fg: '#FFFFFF', sub: 'rgba(255,255,255,.9)', qr: '#003366', star: '#00A86B', foot: 'rgba(255,255,255,.75)' },
  Clean: { bg: ['#FAF9F6', '#FFFFFF'], fg: '#003366', sub: '#3D5675', qr: '#003366', star: '#00A86B', foot: '#3D5675' }
};
const S = { lang: 'English', style: 'Emerald' };
const FONT = '"Plus Jakarta Sans","Noto Sans Devanagari",system-ui,-apple-system,"Segoe UI",sans-serif';

function chips(id, opts, key) {
  const box = $(id);
  opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S[key] === o ? ' sel' : ''); b.textContent = o;
    b.addEventListener('click', () => { const prev = S[key]; S[key] = o; box.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c === b));
      if (key === 'lang' && prev !== o) { const hd = $('#qr-head'); if (!hd.value.trim() || hd.value === TXT[prev].h) hd.value = TXT[o].h; }
      redraw(); }); box.appendChild(b); });
}
chips('#qr-lang', ['English', 'Hindi'], 'lang');
chips('#qr-style', ['Emerald', 'Navy', 'Clean'], 'style');
$('#qr-head').value = TXT.English.h;

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function lines(c, text, maxW, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean), out = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
  if (cur) out.push(cur); return out.slice(0, maxLines);
}
function drawPoster(cv, o) {
  const c = cv.getContext('2d'), W = 1240, H = 1754, st = STY[o.style] || STY.Emerald, L = TXT[o.lang] || TXT.English;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, st.bg[0]); g.addColorStop(1, st.bg[1]); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const rg = c.createRadialGradient(W, 0, 0, W, 0, 700); rg.addColorStop(0, 'rgba(0,168,107,.35)'); rg.addColorStop(1, 'rgba(0,168,107,0)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  let y = 150;
  c.fillStyle = st.fg; c.font = `700 62px ${FONT}`;
  const nm = lines(c, o.biz || L.n, 1040, 2); nm.forEach(t => { c.fillText(t, W / 2, y); y += 76; });
  y += 30; c.font = `800 90px ${FONT}`;
  lines(c, o.headline || L.h, 1040, 4).forEach(t => { c.fillText(t, W / 2, y + 70); y += 106; });
  y += 60;
  const card = 700, cx = (W - card) / 2; c.save(); c.shadowColor = 'rgba(0,51,102,.35)'; c.shadowBlur = 50; c.shadowOffsetY = 20; c.fillStyle = '#FFFFFF'; rr(c, cx, y, card, card, 48); c.fill(); c.restore();
  const n = o.qr.size, mod = Math.floor(620 / (n + 8)), tot = mod * (n + 8), ox = Math.round(cx + (card - tot) / 2 + mod * 4), oy = Math.round(y + (card - tot) / 2 + mod * 4);
  c.fillStyle = st.qr; for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) if (o.qr.m[r][q]) c.fillRect(ox + q * mod, oy + r * mod, mod, mod);
  y += card + 70;
  c.fillStyle = st.star; for (let i = 0; i < 5; i++) { const sx = W / 2 + (i - 2) * 86, sy = y; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? 15 : 36; c[k ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * rad, sy + Math.sin(a) * rad); } c.closePath(); c.fill(); }
  y += 90; c.fillStyle = st.fg; c.font = `700 44px ${FONT}`; c.fillText(L.s, W / 2, y);
  y += 54; c.fillStyle = st.sub; c.font = `500 36px ${FONT}`; c.fillText(L.i, W / 2, y);
  if (o.small) { y += 52; c.font = `500 32px ${FONT}`; c.fillText(o.small, W / 2, y); }
  c.fillStyle = st.foot; c.font = `500 24px ${FONT}`; c.fillText('Free QR poster by Horex IT Solutions', W / 2, H - 36);
}
function svgFor(qr) {
  const n = qr.size, q = 4; let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.m[r][c]) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" width="${(n + 2 * q) * 10}" height="${(n + 2 * q) * 10}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#FFFFFF"/><path fill="#003366" d="${d}"/></svg>`;
}
window.__qrTools = { reviewUrl, drawPoster, svgFor, QR };

const SAMPLE_URL = 'https://search.google.com/local/writereview?placeid=ChIJSAMPLEPLACEID0000';
let timer = 0;
function state() {
  const url = reviewUrl($('#qr-link').value); let qr = null, bad = '';
  if (url) { try { qr = QR.encode(url); } catch (e) { bad = 'long'; } }
  return { url, qr, bad };
}
async function redraw() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const st = state(); $('#qr-sample').classList.toggle('hidden', !!st.qr);
    try { if (document.fonts && document.fonts.load) await Promise.all([document.fonts.load(`800 60px "Plus Jakarta Sans"`), document.fonts.load(`700 60px "Noto Sans Devanagari"`)]); } catch (e) {}
    drawPoster($('#qr-canvas'), { biz: $('#qr-biz').value.trim(), headline: $('#qr-head').value.trim(), small: $('#qr-small').value.trim(), style: S.style, lang: S.lang, qr: st.qr || QR.encode(SAMPLE_URL) });
  }, 120);
}
['#qr-biz', '#qr-link', '#qr-head', '#qr-small'].forEach(s => $(s).addEventListener('input', () => { $('#qr-err').classList.add('hidden'); $('#qr-ok').classList.add('hidden'); redraw(); }));
const showErr = m => { $('#qr-ok').classList.add('hidden'); const e = $('#qr-err'); e.textContent = m; e.classList.remove('hidden'); };
const showOk = m => { $('#qr-err').classList.add('hidden'); const e = $('#qr-ok'); e.textContent = m; e.classList.remove('hidden'); };
function check() {
  if (!$('#qr-biz').value.trim()) { showErr('Please type your business name.'); return null; }
  const st = state();
  if (st.bad) { showErr('This link is too long for a clean QR. Please use a shorter link.'); return null; }
  if (!st.qr) { showErr('Please paste a valid Google review link or Place ID.'); return null; }
  return st;
}
async function save(filename, data, makeFallback) {
  let d = null; try { d = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) {}
  if (!d) { if (makeFallback) { makeFallback(); } return; }
  try { await d.save({ filename, data }); showOk('Poster saved.'); }
  catch (e) { if (e && e.code === 'declined') return; if (makeFallback) makeFallback(); }
}
const slug = () => ($('#qr-biz').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-business');
$('#qr-png').addEventListener('click', async () => {
  const st = check(); if (!st) return;
  clearTimeout(timer);
  try { if (document.fonts && document.fonts.load) await Promise.all([document.fonts.load('800 60px "Plus Jakarta Sans"'), document.fonts.load('700 60px "Noto Sans Devanagari"')]); } catch (e) {}
  const cv = $('#qr-canvas'); drawPoster(cv, { biz: $('#qr-biz').value.trim(), headline: $('#qr-head').value.trim(), small: $('#qr-small').value.trim(), style: S.style, lang: S.lang, qr: st.qr });
  const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
  save(slug() + '-review-poster.png', blob, () => { $('#qr-img').src = cv.toDataURL('image/png'); $('#qr-fallback').classList.remove('hidden'); });
});
$('#qr-svg').addEventListener('click', () => {
  const st = check(); if (!st) return;
  save(slug() + '-review-qr.svg', svgFor(st.qr), () => showErr('Download is not available here. Press and hold the poster image to save it.'));
});
redraw();
})();
