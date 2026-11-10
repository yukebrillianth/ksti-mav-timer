// Tes: node --test test.js   (tanpa dependency)
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm'), { spawn } = require('child_process');
const { parseCSV, build, check, toSec } = require('./server.js');

const CFG = { lanes: [{ id: 'A', name: 'Lapangan A' }, { id: 'B', name: 'Lapangan B' }], swapSeconds: 30 };
const csv = rows => parseCSV('lapangan,mulai,selesai,kegiatan,tim,babak\n' + rows.join('\n'));
const H = s => [s / 3600, s % 3600 / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':');

test('toSec menerima format jam Excel/Indonesia', () => {
  assert.equal(toSec('9:00'), 32400); assert.equal(toSec('09.05'), 32700); assert.equal(toSec('09:00:30'), 32430);
  assert.ok(isNaN(toSec('9')) && isNaN(toSec('jam 9')) && isNaN(toSec('')));
});

test('parseCSV: pemisah ; (Excel Indonesia), BOM, komentar, kutip, nomor baris asli', () => {
  const r = parseCSV('﻿lapangan;mulai;selesai;kegiatan;tim\n# komentar\n\nA;09:00;09:10;Persiapan;"Tim, Satu"\n');
  assert.equal(r.length, 1); assert.equal(r[0].tim, 'Tim, Satu'); assert.equal(r[0].n, 4);
});

test('build: jeda pergantian 30 dtk disisipkan dan jadwal sesudahnya mundur', () => {
  const [A] = build(csv(['A,09:00,09:10,Persiapan,X', 'A,09:10,09:15,Race 1,X', 'A,09:15,09:25,Persiapan,Y']), CFG);
  assert.deepEqual(A.items.map(i => [i.label, H(i.s), H(i.e), i.type]), [
    ['Persiapan', '09:00:00', '09:10:00', 'prep'], ['Race 1', '09:10:00', '09:15:00', 'race'],
    ['Pergantian tim', '09:15:00', '09:15:30', 'swap'], ['Persiapan', '09:15:30', '09:25:30', 'prep']]);
});

test('build: jeda yang sudah ada menyerap pergantian (tidak molor)', () => {
  const [A] = build(csv(['A,09:00,09:10,Race 1,X', 'A,09:12,09:20,Persiapan,Y']), CFG);
  assert.deepEqual(A.items.map(i => H(i.s)), ['09:00:00', '09:11:30', '09:12:00']);
});

test('build: tidak ada pergantian setelah ISHOMA, ISHOMA bertipe rest', () => {
  const [A] = build(csv(['A,11:00,11:30,Race 1,X', 'A,11:30,12:00,ISHOMA 1,', 'A,12:00,12:10,Persiapan,Y']), CFG);
  assert.deepEqual(A.items.map(i => i.type), ['race', 'rest', 'prep']);
  assert.equal(H(A.items[2].s), '12:00:00');
});

test('build: data rusak ditolak dengan nomor baris', () => {
  assert.throws(() => build(csv(['C,09:00,09:10,Persiapan,X']), CFG), /baris 2: lapangan "C"/);
  assert.throws(() => build(csv(['A,09:10,09:00,Persiapan,X']), CFG), /baris 2: jam/);
  assert.throws(() => build(csv(['A,9 pagi,09:10,Persiapan,X']), CFG), /baris 2: jam/);
  assert.throws(() => build(csv(['A,09:00,09:10,,X']), CFG), /baris 2: kolom kegiatan/);
});

test('check: tim di dua lapangan sekaligus terdeteksi', () => {
  const w = check(build(csv(['A,09:00,09:10,Persiapan,X', 'B,09:05,09:15,Persiapan,X']), CFG));
  assert.equal(w.length, 1); assert.match(w[0], /^X: .*bentrok/);
});

test('rundown.csv: aturan lomba terpenuhi', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  const L = build(parseCSV(fs.readFileSync(path.join(__dirname, cfg.rundownFile), 'utf8')), cfg);
  const [A, B] = L;
  assert.ok(A.items.at(-1).e < 20 * 3600 && B.items.at(-1).e < 20 * 3600, 'lomba selesai sebelum 20:00');
  for (const l of L) {
    const ish = l.items.filter(i => i.type === 'rest');
    assert.deepEqual(ish.map(i => i.label), ['ISHOMA 1', 'ISHOMA 2']);
    assert.deepEqual([H(ish[0].s), H(ish[0].e)], ['11:30:00', '12:00:00'], l.name + ' ISHOMA 1 dikunci 30 mnt');
    assert.equal(l.items[0].s, l.id === 'A' ? 9 * 3600 : 9 * 3600 + 300);
  }
  assert.deepEqual(check(L), []);
  const races = new Map();
  L.forEach(l => l.items.filter(i => i.type === 'race').forEach(i => races.set(i.team, (races.get(i.team) || 0) + 1)));
  assert.equal(races.size, 21, '15 tim penyisihan + 3 final + 3 challenge');
  races.forEach((n, t) => assert.equal(n, 3, t + ' harus race 3 kali'));
});

test('xlsx2csv: rumus bersama Excel digeser dengan benar', () => {
  const src = fs.readFileSync(path.join(__dirname, 'tools/xlsx2csv.js'), 'utf8');
  const ctx = { require, module: {}, process: { argv: [] }, __dirname: path.join(__dirname, 'tools') }; vm.createContext(ctx);
  vm.runInContext(src.replace(/^#!.*\n/, '') + ';this.shift=shift;', ctx);
  assert.equal(ctx.shift('B7', 1, 0), 'B8'); assert.equal(ctx.shift('H6', 3, 0), 'H9');
  assert.equal(ctx.shift('$B$7+C7', 2, 1), '$B$7+D9');
});

// ---------- logika layar (common.js) dijalankan tanpa browser ----------
function client(search = '') {
  const ctx = { location: { search }, document: { getElementById: () => null }, Intl, URLSearchParams, Date, Math, JSON, console, EventSource: function () { } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'public/common.js'), 'utf8') + ';this.api={laneState,teamState,clockTimes,index,dur,hm,set D(v){D=v},get D(){return D},TEAMS:()=>TEAMS};', ctx);
  return ctx.api;
}
test('common.js: status lapangan & tim di batas waktu', () => {
  const c = client(); const lanes = build(csv(['A,09:00,09:10,Persiapan,X', 'A,09:10,09:15,Race 1,X', 'B,09:00,09:10,Persiapan,Y']), CFG);
  c.D = { lanes, teams: {}, state: { delay: { A: 0, B: 0 }, pausedAt: {}, names: {} } }; c.index();
  const A = lanes[0], t0 = 9 * 3600;
  assert.equal(c.laneState(A, t0 - 1).kind, 'pre');
  assert.equal(c.laneState(A, t0).cur.label, 'Persiapan');
  assert.equal(c.laneState(A, t0 + 600).cur.label, 'Race 1'); // tepat di batas: kegiatan berikutnya
  assert.equal(c.laneState(A, t0 + 900).kind, 'done');
  assert.equal(c.teamState('X', { A: t0 + 605, B: 0 }).k, 'live');
  assert.equal(c.teamState('X', { A: t0 + 605, B: 0 }).rem, 295);
  assert.equal(c.teamState('X', { A: t0 + 900, B: 0 }).k, 'done');
  assert.equal(c.dur(295), '04:55'); assert.equal(c.dur(3725), '1:02:05'); assert.equal(c.dur(-5), '00:00');
  assert.equal(c.hm(34230), '09:30:30'); assert.equal(c.hm(34200), '09:30');
});
test('common.js: tunda & jeda menggeser waktu jadwal', () => {
  const c = client(); c.D = { lanes: [{ id: 'A', items: [] }, { id: 'B', items: [] }], state: { delay: { A: 300, B: 0 }, pausedAt: { A: null, B: 1000 } } };
  const { W, T } = c.clockTimes();
  assert.equal(T.A, W - 300); assert.equal(T.B, 1000);
});

test('sound.js: bunyi tepat di detik yang benar, diam saat lompat/jeda', () => {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'public/sound.js'), 'utf8') + ';this.ev=laneEvents;this.S=Sound;', ctx);
  const [A] = build(csv(['A,09:00,09:10,Persiapan,X', 'A,09:10,09:15,Race 1,X', 'A,09:15,09:25,Persiapan,Y']), CFG);
  const t = s => toSec(s), at = s => ctx.ev(A, t(s) - 1, t(s))[0];
  assert.equal(at('09:00:00'), 'chime'); assert.equal(at('09:09:00'), 'warn');
  assert.equal(at('09:09:55'), 'tick'); assert.equal(at('09:09:59'), 'tick'); assert.equal(at('09:10:00'), 'go');
  assert.equal(at('09:14:55'), 'tick'); assert.equal(at('09:15:00'), 'buzzer', 'buzzer menang dari kegiatan berikutnya');
  assert.equal(at('09:15:30'), 'chime', 'persiapan tim berikutnya setelah pergantian');
  assert.equal(at('09:05:00'), undefined); assert.equal(at('09:09:54'), undefined);
  const played = []; ctx.S.on = true; ctx.S.play = n => played.push(n);
  const lanes = [A]; ctx.S.update(lanes, { A: t('09:09:58') });                // halaman baru dibuka: diam
  ctx.S.update(lanes, { A: t('09:09:59') }); ctx.S.update(lanes, { A: t('09:09:59') }); // render berulang di detik yang sama: sekali
  ctx.S.update(lanes, { A: t('09:10:00') });
  ctx.S.update(lanes, { A: t('09:14:58') });                                    // operator lompat jadwal: diam
  ctx.S.update(lanes, { A: t('09:14:40') });                                    // mundur: diam
  assert.deepEqual(played, ['tick', 'go']);
});

// ---------- server end-to-end ----------
test('server: perintah operator, PIN, validasi, siaran SSE', async t => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mav-')), port = 18000 + Math.floor(Math.random() * 1000);
  const p = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, PORT: port, STATE_FILE: path.join(tmp, 's.json') } });
  t.after(() => p.kill());
  await new Promise((ok, no) => { p.stdout.on('data', d => /jalan/.test(d) && ok()); p.on('exit', no); });
  const base = `http://localhost:${port}`, pin = JSON.parse(fs.readFileSync('config.json')).operatorPin;
  const cmd = (b, pinv = pin) => fetch(base + '/api/cmd', { method: 'POST', body: JSON.stringify({ pin: pinv, ...b }) });
  const ac = new AbortController(); t.after(() => ac.abort());
  const sse = (await fetch(base + '/api/events', { signal: ac.signal })).body.getReader();
  let buf = ''; const next = async () => { for (;;) { const i = buf.indexOf('\n\n'); if (i >= 0) { const m = buf.slice(6, i); buf = buf.slice(i + 2); const j = JSON.parse(m); if (j.lanes) return j; continue; } buf += new TextDecoder().decode((await sse.read()).value); } };
  const first = await next(); assert.equal(first.lanes.length, 2); assert.deepEqual(first.warnings, []);

  assert.equal((await cmd({ op: 'auth' }, 'salah')).status, 401);
  assert.equal((await cmd({ op: 'auth' })).status, 200);
  assert.equal((await cmd({ op: 'shift', lanes: ['A'], sec: 1e9 })).status, 400);
  assert.equal((await cmd({ op: 'hapus' })).status, 400);
  assert.equal((await fetch(base + '/api/cmd', { method: 'POST', body: 'bukan json' })).status, 401);

  assert.equal((await cmd({ op: 'shift', lanes: ['A', 'Z'], sec: 300 })).status, 200);
  let s = (await next()).state; assert.equal(s.delay.A, 300); assert.equal(s.delay.B, 0);
  await cmd({ op: 'pause', lanes: ['B'] }); s = (await next()).state; assert.ok(s.pausedAt.B > 0);
  await new Promise(r => setTimeout(r, 1100));
  await cmd({ op: 'resume', lanes: ['B'] }); s = (await next()).state; assert.equal(s.pausedAt.B, null); assert.ok(s.delay.B >= 1, 'waktu jeda menambah tunda');
  await cmd({ op: 'startAt', lanes: ['A'], s: 9 * 3600 }); s = (await next()).state;
  const wib = Math.floor(Date.now() / 1000 + 7 * 3600) % 86400; assert.ok(Math.abs(wib - s.delay.A - 9 * 3600) <= 1, 'kegiatan 09:00 mulai sekarang');
  await cmd({ op: 'message', text: 'x'.repeat(500) }); s = (await next()).state; assert.equal(s.message.length, 200);
  await cmd({ op: 'name', code: 'TIM FINAL 1', name: '  IRIS  ' }); s = (await next()).state; assert.equal(s.names['TIM FINAL 1'], 'IRIS');
  await cmd({ op: 'name', code: 'TIM FINAL 1', name: '' }); s = (await next()).state; assert.equal(s.names['TIM FINAL 1'], undefined);
  // simulasi: tunda disimpan, jam server ikut simulasi, lalu dikembalikan
  await cmd({ op: 'shift', lanes: ['B'], sec: 120 }); s = (await next()).state; const savedB = s.delay.B;
  assert.equal((await cmd({ op: 'sim', start: '09:30', speed: 9999 })).status, 400);
  assert.equal((await cmd({ op: 'sim', start: 'jam', speed: 60 })).status, 400);
  await cmd({ op: 'sim', start: '09:30', speed: 60 }); s = (await next()).state;
  assert.equal(s.sim.base, 9 * 3600 + 1800); assert.equal(s.delay.B, 0, 'simulasi mulai dengan jadwal bersih');
  await cmd({ op: 'startAt', lanes: ['A'], s: 9 * 3600 }); s = (await next()).state;
  assert.ok(s.delay.A >= 1800 && s.delay.A <= 1800 + 120, 'startAt memakai jam simulasi, bukan jam asli');
  await cmd({ op: 'simStop' }); s = (await next()).state;
  assert.equal(s.sim, null); assert.equal(s.delay.B, savedB, 'tunda asli kembali setelah simulasi');
  assert.equal((await cmd({ op: 'theme', value: 'pink' })).status, 400);
  await cmd({ op: 'theme', value: 'terang' }); s = (await next()).state; assert.equal(s.theme, 'terang');
  await cmd({ op: 'reset', lanes: ['A', 'B'] }); s = (await next()).state; assert.deepEqual(s.delay, { A: 0, B: 0 });
  assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 's.json'))).delay.A, 0, 'state tersimpan ke disk');

  for (const [u, code] of [['/', 200], ['/operator', 200], ['/common.js', 200], ['/../server.js', 404], ['/..%2fconfig.json', 404]])
    assert.equal((await fetch(base + u)).status, code, u);
});
