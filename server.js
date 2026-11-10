#!/usr/bin/env node
// Timer MAV KSTI 2026. Jalankan: node server.js  (tanpa npm install)
// Penonton: http://<ip>:8080/   Operator: http://<ip>:8080/operator
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');

const DIR = __dirname, PUB = path.join(DIR, 'public'), STATE_FILE = process.env.STATE_FILE || path.join(DIR, 'state.json');
const WIB = 7 * 3600; // Asia/Jakarta tidak punya DST, jadi offset tetap
// jam acuan: WIB asli, atau jam simulasi bila operator menyalakan simulasi (semua layar ikut)
const wibNow = () => state.sim ? Math.floor(state.sim.base + (Date.now() - state.sim.ref) / 1000 * state.sim.speed) % 86400
  : Math.floor(Date.now() / 1000 + WIB) % 86400;

let cfg, lanes, loadError = null, warnings = [];
let state = { delay: {}, pausedAt: {}, names: {}, message: '', sim: null, simSaved: null };

// ---------- rundown ----------
function toSec(v) { // "9:00", "09.00", "09:00:30"
  const m = String(v).trim().match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/);
  return m ? +m[1] * 3600 + +m[2] * 60 + +(m[3] || 0) : NaN;
}
function parseCSV(txt) {
  const lines = txt.replace(/^﻿/, '').split(/\r?\n/).map((l, i) => [l, i + 1]).filter(([l]) => l.trim() && !l.startsWith('#'));
  const h = lines[0][0], sep = (h.split(';').length > h.split(',').length) ? ';' : ','; // Excel locale Indonesia menyimpan CSV dengan ';'
  const split = l => { const out = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === sep && !q) { out.push(cur.trim()); cur = ''; } else cur += ch; } out.push(cur.trim()); return out; };
  const head = split(h).map(x => x.toLowerCase());
  return lines.slice(1).map(([l, n]) => { const c = split(l); return { n, ...Object.fromEntries(head.map((k, i) => [k, c[i] || ''])) }; });
}
function build(rows, conf) {
  const out = conf.lanes.map(l => ({ id: l.id, name: l.name, items: [] }));
  for (const r of rows) {
    const lane = out.find(l => l.id === r.lapangan.toUpperCase());
    if (!lane) throw new Error(`baris ${r.n}: lapangan "${r.lapangan}" tidak ada di config.json`);
    const s = toSec(r.mulai), e = toSec(r.selesai);
    if (isNaN(s) || isNaN(e) || e <= s) throw new Error(`baris ${r.n}: jam mulai/selesai tidak valid ("${r.mulai}" - "${r.selesai}")`);
    if (!r.kegiatan) throw new Error(`baris ${r.n}: kolom kegiatan kosong`);
    lane.items.push({ s, e, label: r.kegiatan, team: r.tim || null, phase: r.babak || '' });
  }
  const gap = +conf.swapSeconds || 0;
  for (const lane of out) {
    const res = []; let prevE = null, prevTeam = null;
    for (const it of lane.items.sort((a, b) => a.s - b.s)) {
      const rest = /^ishoma/i.test(it.label), d = it.e - it.s;
      let s = prevE == null ? it.s : Math.max(it.s, prevE); // kalau sebelumnya molor, ikut mundur
      if (gap && it.team && prevTeam && it.team !== prevTeam && !rest) { // jeda pergantian tim, diletakkan tepat sebelum kegiatan
        const ss = Math.max(prevE, it.s - gap);
        res.push({ s: ss, e: ss + gap, label: 'Pergantian tim', team: it.team, phase: it.phase, type: 'swap' });
        s = Math.max(s, ss + gap);
      }
      res.push({ ...it, s, e: s + d, type: rest ? 'rest' : /^race/i.test(it.label) ? 'race' : 'prep' });
      prevE = s + d; prevTeam = rest ? null : it.team;
    }
    lane.items = res;
  }
  return out;
}
// peringatan untuk operator: tim yang dijadwalkan di dua tempat sekaligus
function check(ls) {
  const w = [], by = new Map();
  ls.forEach(l => l.items.forEach(i => { if (i.team && i.type !== 'swap') (by.get(i.team) || by.set(i.team, []).get(i.team)).push({ ...i, lane: l.name }); }));
  by.forEach((a, team) => { a.sort((x, y) => x.s - y.s); for (let k = 1; k < a.length; k++) if (a[k].s < a[k - 1].e)
    w.push(`${team}: ${a[k - 1].label} ${a[k - 1].lane} (${hms(a[k - 1].s)}-${hms(a[k - 1].e)}) bentrok dengan ${a[k].label} ${a[k].lane} (${hms(a[k].s)})`); });
  ls.forEach(l => { for (let k = 1; k < l.items.length; k++) if (l.items[k].s < l.items[k - 1].e) w.push(`${l.name}: ${l.items[k - 1].label} dan ${l.items[k].label} tumpang tindih (${hms(l.items[k].s)})`); });
  return w;
}
function load() {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(DIR, 'config.json'), 'utf8'));
    const l = build(parseCSV(fs.readFileSync(path.join(DIR, c.rundownFile || 'rundown.csv'), 'utf8')), c);
    cfg = c; lanes = l; loadError = null; warnings = check(l);
    warnings.forEach(x => console.warn('[cek]', x));
    for (const x of cfg.lanes) { state.delay[x.id] ??= 0; state.pausedAt[x.id] ??= null; }
    console.log(`[rundown] ${lanes.map(x => `${x.name}: ${x.items.length} item, selesai ${hms(x.items.at(-1).e)}`).join(' | ')}`);
  } catch (e) {
    loadError = String(e.message || e); console.error('[rundown] GAGAL:', loadError, cfg ? '(data lama tetap dipakai)' : '');
    if (!cfg) process.exit(1);
  }
}
const hms = s => [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':');

// ---------- siaran ke semua layar (SSE) ----------
const clients = new Set();
const payload = () => JSON.stringify({ title: cfg.title, subtitle: cfg.subtitle, lanes, teams: cfg.teams, state, error: loadError, warnings, now: Date.now() });
const send = (res, data) => res.write(`data: ${data}\n\n`);
function broadcast() { const p = payload(); clients.forEach(c => send(c, p)); }

// ---------- perintah operator ----------
function apply(cmd) {
  const ids = cfg.lanes.map(l => l.id);
  const sel = (Array.isArray(cmd.lanes) ? cmd.lanes : []).filter(x => ids.includes(x));
  const now = wibNow();
  switch (cmd.op) {
    case 'shift': { const v = Number(cmd.sec); if (!Number.isFinite(v) || Math.abs(v) > 3600) throw 'nilai geser tidak valid';
      sel.forEach(id => state.delay[id] = Math.max(-4 * 3600, Math.min(6 * 3600, state.delay[id] + v))); break; }
    case 'reset': sel.forEach(id => { state.delay[id] = 0; state.pausedAt[id] = null; }); break;
    case 'startAt': { const v = Number(cmd.s); if (!Number.isFinite(v)) throw 'jam tidak valid'; // kegiatan berjadwal v dimulai sekarang
      sel.forEach(id => { state.delay[id] = now - v; state.pausedAt[id] = null; }); break; }
    case 'pause': sel.forEach(id => state.pausedAt[id] ??= now); break;
    case 'resume': sel.forEach(id => { if (state.pausedAt[id] != null) { state.delay[id] += now - state.pausedAt[id]; state.pausedAt[id] = null; } }); break;
    case 'message': state.message = String(cmd.text || '').slice(0, 200); break;
    case 'name': { const code = String(cmd.code || ''), name = String(cmd.name || '').trim().slice(0, 60);
      if (!code) throw 'kode tim kosong'; if (name) state.names[code] = name; else delete state.names[code]; break; }
    case 'sim': { // mulai / ubah simulasi. Tunda & jeda asli disimpan dulu, dikembalikan saat simulasi dihentikan
      const speed = Number(cmd.speed), base = cmd.start != null ? toSec(cmd.start) : now;
      if (!(speed >= 1 && speed <= 600)) throw 'kecepatan simulasi 1-600x';
      if (isNaN(base)) throw 'jam simulasi tidak valid';
      if (!state.sim) { state.simSaved = { delay: { ...state.delay }, pausedAt: { ...state.pausedAt } }; ids.forEach(id => { state.delay[id] = 0; state.pausedAt[id] = null; }); }
      else if (cmd.start != null) ids.forEach(id => { state.delay[id] = 0; state.pausedAt[id] = null; }); // mulai ulang dari jam baru = jadwal bersih
      state.sim = { base, ref: Date.now(), speed }; break; }
    case 'simStop':
      if (state.sim) { Object.assign(state.delay, state.simSaved?.delay); Object.assign(state.pausedAt, state.simSaved?.pausedAt); }
      state.sim = null; state.simSaved = null; break;
    default: throw 'perintah tidak dikenal';
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  broadcast();
}

// ---------- http ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const ROUTES = { '/': 'display.html', '/operator': 'operator.html' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    clients.add(res); send(res, payload()); req.on('close', () => clients.delete(res)); return;
  }
  if (url.pathname === '/api/cmd' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 10000) req.destroy(); });
    req.on('end', () => {
      let cmd; try { cmd = JSON.parse(body); } catch { cmd = {}; }
      if (String(cmd.pin) !== String(cfg.operatorPin)) { res.writeHead(401); return res.end('PIN salah'); }
      try { if (cmd.op !== 'auth') apply(cmd); res.writeHead(200); res.end('ok'); }
      catch (e) { res.writeHead(400); res.end(String(e)); }
    });
    return;
  }
  const file = path.join(PUB, ROUTES[url.pathname] || path.normalize(url.pathname));
  if (!file.startsWith(PUB + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Tidak ditemukan'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(data);
  });
});

module.exports = { parseCSV, build, check, toSec };
if (require.main === module) {
  try { Object.assign(state, JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))); } catch { } // tunda/jeda/nama bertahan saat server restart
  load();
  setInterval(() => clients.forEach(c => send(c, JSON.stringify({ now: Date.now() }))), 10000); // sinkron jam + jaga koneksi
  for (const f of ['config.json', cfg.rundownFile || 'rundown.csv']) // edit file lalu simpan: semua layar ikut berubah
    fs.watchFile(path.join(DIR, f), { interval: 1000 }, () => { load(); broadcast(); });
  const PORT = +process.env.PORT || cfg.port || 8080;
  server.listen(PORT, () => {
    const ips = Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address);
    console.log(`\nTimer MAV jalan. Buka dari perangkat di jaringan yang sama:`);
    for (const ip of ['localhost', ...ips]) console.log(`  Penonton: http://${ip}:${PORT}/     Operator: http://${ip}:${PORT}/operator`);
  });
}
