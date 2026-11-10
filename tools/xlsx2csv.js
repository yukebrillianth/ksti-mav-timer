#!/usr/bin/env node
// Konversi sheet 'MAV' di Rundown MAV.xlsx -> rundown.csv. Tanpa dependency (xlsx = zip berisi XML).
// Pakai: node tools/xlsx2csv.js "Rundown MAV.xlsx"            (menulis rundown.csv, cadangan lama -> rundown.bak.csv)
//        node tools/xlsx2csv.js "Rundown MAV.xlsx" -          (cetak ke layar saja)
// Koreksi bug sumber (Excel aslinya tidak diubah):
//   - jam < 07:00 = salah ketik 12 jam (02:35 -> 14:35)
//   - Start Lapangan B berisi =B{baris} (selesai Lapangan A) -> dirantai dari kegiatan B sebelumnya
// Jeda pergantian tim 30 dtk TIDAK ditulis di sini; server menyisipkannya otomatis.
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const START_ROW = 6;
const COLS = { A: ['A', 'B', 'D', 'E'], B: ['G', 'H', 'J', 'K'] }; // start, end, keterangan, tim

function unzip(buf) {
  let e = buf.length - 22; while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error('bukan file .xlsx');
  const out = {}; let p = buf.readUInt32LE(e + 16);
  for (let i = buf.readUInt16LE(e + 10); i > 0; i--) {
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), off = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nl), d0 = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const data = buf.subarray(d0, d0 + size);
    out[name] = method === 8 ? zlib.inflateRawSync(data) : data;
    p += 46 + nl + buf.readUInt16LE(p + 30) + buf.readUInt16LE(p + 32);
  }
  return out;
}
const unxml = s => s.replace(/&(lt|gt|quot|apos|amp|#(\d+));/g, (_, n, c) => c ? String.fromCharCode(+c) : { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' }[n]);
const colNum = c => [...c].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
const colName = n => { let s = ''; for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + (n - 1) % 26) + s; return s; };
// rumus bersama (shared formula): geser referensi relatif dari sel induk
const shift = (f, dr, dc) => f.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (_, a, c, b, r) => a + (a ? c : colName(colNum(c) + dc)) + b + (b ? r : +r + dr));

function readSheet(file, sheetName) {
  const z = unzip(fs.readFileSync(file)), txt = n => z[n] ? z[n].toString('utf8') : '';
  const rid = (txt('xl/workbook.xml').match(new RegExp(`<sheet [^>]*name="${sheetName}"[^>]*r:id="([^"]+)"`)) || [])[1];
  if (!rid) throw new Error(`sheet "${sheetName}" tidak ada`);
  const target = txt('xl/_rels/workbook.xml.rels').match(new RegExp(`Id="${rid}"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="${rid}"`));
  const sheetPath = 'xl/' + (target[1] || target[2]).replace(/^\/?xl\//, '');
  const strings = [...txt('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => unxml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join('')));
  const cells = {}, shared = {};
  for (const m of txt(sheetPath).matchAll(/<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const [, col, row, attrs, inner = ''] = m, t = (attrs.match(/ t="(\w+)"/) || [])[1];
    const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1], fm = inner.match(/<f([^>]*)(?:\/>|>([\s\S]*?)<\/f>)/);
    let f = fm ? unxml(fm[2] || '') : null;
    if (fm) { const si = (fm[1].match(/si="(\d+)"/) || [])[1];
      if (si != null && f) shared[si] = { f, r: +row, c: colNum(col) };
      else if (si != null && shared[si]) f = shift(shared[si].f, +row - shared[si].r, colNum(col) - shared[si].c); }
    const value = v == null ? (t === 'inlineStr' ? unxml((inner.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1] || '') : null)
      : t === 's' ? strings[+v] : t === 'str' || t === 'inlineStr' ? unxml(v) : t === 'b' ? v === '1' : +v;
    cells[col + row] = { v: value, f };
  }
  return { get: a => cells[a]?.v ?? null, formula: a => cells[a]?.f ?? null, maxRow: Math.max(0, ...Object.keys(cells).map(k => +k.match(/\d+/)[0])) };
}

function convert(file) {
  const ws = readSheet(file, 'MAV');
  const isTime = v => typeof v === 'number' && v >= 0 && v < 1;
  const sec = v => { const s = Math.round(v * 1440) * 60; return s < 7 * 3600 ? s + 12 * 3600 : s; };
  const H = s => String(Math.floor(s / 3600)).padStart(2, '0') + ':' + String(Math.floor(s % 3600 / 60)).padStart(2, '0');
  const babak = (tm, prev) => !tm ? prev : /CHALLENGE$/i.test(tm) ? 'Final Challenge' : /^TIM FINAL/i.test(tm) ? 'Final' : 'Penyisihan';
  const out = ['lapangan,mulai,selesai,kegiatan,tim,babak'];
  for (const [k, [cs, ce, cl, ct]] of Object.entries(COLS)) {
    let lastTeam = null, lastEnd = null, ph = 'Penyisihan', nIsh = 0;
    for (let r = START_ROW; r <= ws.maxRow; r++) {
      const s = ws.get(cs + r), e = ws.get(ce + r); let l = ws.get(cl + r), tm = ws.get(ct + r);
      if (!isTime(s) || !isTime(e) || typeof l !== 'string' || !l.trim()) continue;
      l = l.trim(); tm = typeof tm === 'string' && tm.trim() ? tm.trim() : null;
      let s0 = sec(s), e0 = sec(e);
      if (k === 'B' && lastEnd != null && (ws.formula('G' + r) || '').replace(/[\s=]/g, '') === 'B' + r) { e0 = lastEnd + (e0 - s0); s0 = lastEnd; }
      if (l.toUpperCase() === 'ISHOMA') { nIsh++; tm = lastTeam = null; l = 'ISHOMA ' + nIsh; }
      else if (tm) lastTeam = tm; else tm = lastTeam; // nama tim hanya ditulis di baris Persiapan
      ph = babak(tm, ph); lastEnd = e0;
      out.push([k, H(s0), H(e0), l, tm && tm.includes(',') ? `"${tm}"` : tm || '', ph].join(','));
    }
  }
  return out.join('\n') + '\n';
}

module.exports = { convert };
if (require.main === module) {
  const [src, dst = path.join(__dirname, '..', 'rundown.csv')] = process.argv.slice(2);
  if (!src) { console.error('Pakai: node tools/xlsx2csv.js "Rundown MAV.xlsx"'); process.exit(1); }
  try {
    const csv = convert(src);
    // validasi dulu dengan aturan server; kalau gagal, rundown lama tidak disentuh
    const { parseCSV, build, check } = require('../server.js');
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
    const lanes = build(parseCSV(csv), cfg), warn = check(lanes);
    if (dst === '-') { process.stdout.write(csv); process.exit(0); }
    if (fs.existsSync(dst)) fs.copyFileSync(dst, dst.replace(/\.csv$/, '.bak.csv'));
    fs.writeFileSync(dst, csv);
    const hms = s => [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':');
    console.log(`OK: ${csv.trim().split('\n').length - 1} kegiatan ditulis ke rundown.csv (versi lama disimpan di rundown.bak.csv)`);
    lanes.forEach(l => console.log(`  ${l.name}: ${hms(l.items[0].s)} - ${hms(l.items.at(-1).e)}`));
    if (warn.length) { console.log('\nPERIKSA, ada jadwal bentrok:'); warn.forEach(w => console.log('  - ' + w)); }
  } catch (e) {
    console.error('GAGAL membaca rundown: ' + (e.message || e) + '\nRundown lama tetap dipakai.'); process.exit(1);
  }
}
