// Logika bersama layar penonton dan operator. Data + state datang dari server lewat SSE.
const pad = n => String(Math.floor(n)).padStart(2, '0');
const hm = s => { s = ((Math.floor(s) % 86400) + 86400) % 86400; return pad(s / 3600) + ':' + pad(s % 3600 / 60) + (s % 60 ? ':' + pad(s % 60) : ''); };
const dur = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600); return (h ? h + ':' : '') + pad(s % 3600 / 60) + ':' + pad(s % 60); };
const inText = s => { const m = Math.ceil(s / 60); return m <= 0 ? 'sekarang' : m < 60 ? `${m} mnt lagi` : `${Math.floor(m / 60)} j ${m % 60} mnt lagi`; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toSec = v => { const m = String(v).match(/^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/); return m ? +m[1] * 3600 + +m[2] * 60 + +(m[3] || 0) : NaN; };
const $ = id => document.getElementById(id);
const set = (el, html) => { if (el && el.__h !== html) { el.innerHTML = html; el.__h = html; } }; // hindari render ulang yang tidak perlu (tombol tetap bisa diklik)

// Mode uji: tambahkan ?t=11:35&speed=60 di URL. Jadwal dipratinjau tanpa tunda; kontrol operator dimatikan.
const Q = new URLSearchParams(location.search);
const SIM = Q.has('t') && !isNaN(toSec(Q.get('t'))) ? { base: toSec(Q.get('t')), ref: Date.now(), speed: +Q.get('speed') || 1 } : null;

let D = null, OFF = 0, online = false, TEAMS = new Map(), TEAM_LIST = [], START = 0, END = 0, PHASES = [];
const wib = () => { const sv = D?.state.sim; // ?t= (pratinjau lokal) > simulasi dari operator > WIB asli
  return Math.floor(SIM ? SIM.base + (Date.now() - SIM.ref) / 1000 * SIM.speed
    : sv ? (sv.base + (Date.now() + OFF - sv.ref) / 1000 * sv.speed) % 86400
    : ((Date.now() + OFF) / 1000 + 7 * 3600) % 86400); };
const name = code => D.state.names[code] || D.teams[code] || code;

// waktu jadwal per lapangan = jam WIB - tunda; saat dijeda, waktu dibekukan
function clockTimes() {
  const W = wib(), T = {};
  D.lanes.forEach(l => T[l.id] = SIM ? W : (D.state.pausedAt[l.id] ?? W) - D.state.delay[l.id]);
  return { W, T };
}

function index() {
  TEAMS = new Map();
  D.lanes.forEach(l => l.items.forEach(i => {
    i.lane = l.id; i.laneName = l.name;
    if (!i.team || i.type === 'swap') return;
    if (!TEAMS.has(i.team)) TEAMS.set(i.team, []);
    TEAMS.get(i.team).push(i);
  }));
  TEAMS.forEach(a => a.sort((x, y) => x.s - y.s));
  TEAM_LIST = [...TEAMS.keys()].sort((a, b) => TEAMS.get(a)[0].s - TEAMS.get(b)[0].s);
  START = Math.min(...D.lanes.map(l => l.items[0].s));
  END = Math.max(...D.lanes.map(l => l.items.at(-1).e));
  PHASES = [];
  D.lanes.flatMap(l => l.items).forEach(i => { if (!i.phase) return; let p = PHASES.find(x => x.name === i.phase);
    if (!p) PHASES.push(p = { name: i.phase, s: i.s, e: i.e }); p.s = Math.min(p.s, i.s); p.e = Math.max(p.e, i.e); });
  PHASES.sort((a, b) => a.s - b.s);
  PHASES.forEach((p, k) => { if (PHASES[k + 1]) p.e = PHASES[k + 1].s; }); // segmen bersambung
}

function connect(onData) {
  const es = new EventSource('/api/events');
  es.onmessage = e => {
    const m = JSON.parse(e.data);
    if (!SIM) OFF = m.now - Date.now();
    online = true;
    if (m.lanes) { D = m; index(); onData && onData(); }
  };
  es.onerror = () => { online = false; }; // EventSource menyambung ulang sendiri; timer tetap jalan dengan data terakhir
}

// ---------- status ----------
function laneState(l, t) {
  const its = l.items, cands = its.filter(i => i.s <= t && t < i.e);
  const cur = cands.find(i => i.type !== 'rest') || cands[0] || null;
  const queue = its.filter(i => i.s > t && i !== cur);
  if (cur) return { kind: 'cur', cur, queue };
  if (t >= its.at(-1).e) return { kind: 'done', queue: [] };
  return { kind: t < its[0].s ? 'pre' : 'gap', queue };
}
function teamState(code, T) {
  const a = TEAMS.get(code);
  const cur = a.find(i => i.s <= T[i.lane] && T[i.lane] < i.e);
  if (cur) return { k: 'live', cur, rem: cur.e - T[cur.lane] };
  const nxt = a.find(i => i.s > T[i.lane]);
  if (!nxt) return { k: 'done' };
  return { k: T[nxt.lane] < a[0].s ? 'soon' : 'wait', nxt, rem: nxt.s - T[nxt.lane] };
}
const isPaused = id => !SIM && D.state.pausedAt[id] != null;
const shiftChip = sh => Math.abs(sh) < 60 ? '' : `<span class="chip ${sh > 0 ? 'late' : 'early'}">${sh > 0 ? 'Mundur' : 'Maju'} ${Math.round(Math.abs(sh) / 60)} mnt</span>`;
const teamLine = i => i.type === 'swap' ? 'Masuk: ' + name(i.team) : i.team ? name(i.team) : '';
const phaseNow = T => { for (const l of D.lanes) { const s = laneState(l, T[l.id]); if (s.cur?.phase) return s.cur.phase; } for (const l of D.lanes) { const s = laneState(l, T[l.id]); if (s.queue[0]?.phase) return s.queue[0].phase; } return ''; };

// ---------- render ----------
function renderLane(l, W, T, nq) {
  const t = T[l.id], sh = W - t, s = laneState(l, t);
  let cls = 't-idle', k = '', v = '', who = '', timer = '--:--', meter = '', range = '';
  if (s.kind === 'cur') {
    const c = s.cur, rem = c.e - t;
    cls = 't-' + c.type + ' live'; k = c.label; v = c.type === 'rest' ? 'Istirahat' : c.type === 'swap' ? 'Keluar / masuk lapangan' : 'Berlangsung';
    who = teamLine(c); timer = dur(rem);
    meter = `<div class="meter"><i style="width:${((t - c.s) / (c.e - c.s) * 100).toFixed(1)}%"></i></div>`;
    range = `<span>mulai ${hm(c.s + sh)}</span><span>selesai ${hm(c.e + sh)}</span>`;
    if (rem <= 30 && c.type !== 'rest' && c.type !== 'swap') cls += ' urgent';
  } else if (s.kind === 'done') {
    k = 'Selesai'; v = 'Semua kegiatan tuntas'; range = `<span>kegiatan terakhir selesai ${hm(l.items.at(-1).e + sh)}</span>`;
  } else {
    const n = s.queue[0]; k = s.kind === 'pre' ? 'Belum mulai' : 'Berikutnya'; v = n.label;
    who = teamLine(n) || ''; timer = dur(n.s - t); range = `<span>mulai ${hm(n.s + sh)}</span><span>${esc(n.phase)}</span>`;
  }
  if (isPaused(l.id)) { cls += ' paused'; v = 'Dijeda operator'; }
  const q = s.queue.slice(0, nq).map(i => `<div class="qi t-${i.type}">
      <span class="tm">${hm(i.s + sh)}</span><span class="sw"></span>
      <span class="tx"><b>${esc(i.label)}</b>${teamLine(i) ? ` <span>· ${esc(teamLine(i))}</span>` : ''}</span>
      <span class="in">${inText(i.s - t)}</span></div>`).join('') || '<div class="empty">Tidak ada antrian lagi.</div>';
  return `<article class="lane">
    <div class="lane-head"><span class="lt">${esc(l.id)}</span><h2>${esc(l.name)}</h2>${shiftChip(sh)}</div>
    <div class="now ${cls}">
      <div class="status"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>
      <div class="team${who.length > 22 ? ' long' : ''}">${esc(who)}</div>
      <div class="timer num">${timer}</div>${meter}<div class="range">${range}</div>
    </div>
    ${nq ? `<div class="q"><h3>Berikutnya di ${esc(l.name)}</h3>${q}</div>` : ''}
  </article>`;
}

function renderTeam(code, T, W) {
  const s = teamState(code, T), nm = esc(name(code));
  const row = (cls, st, tm) => `<div class="tr ${cls}"><span class="bd"></span><span class="tn" title="${nm}">${nm}</span><span class="ts">${st}</span><span class="tt num">${tm}</span></div>`;
  if (s.k === 'live') return row('live t-' + s.cur.type, `${esc(s.cur.label)} · Lap. ${esc(s.cur.lane)}`, dur(s.rem));
  if (s.k === 'done') return row('done', 'Selesai', '');
  return row('t-' + s.nxt.type, `${hm(s.nxt.s + W - T[s.nxt.lane])} · ${esc(s.nxt.label)} · Lap. ${esc(s.nxt.lane)}`, dur(s.rem));
}

// header bersama: jam, tanggal, status koneksi, progres hari
const dfmt = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
function renderCommon(W, T) {
  $('clock').textContent = hm(W).padEnd(8, ':00').slice(0, 8);
  set($('date'), SIM ? `<span class="simtag">Pratinjau ${SIM.speed}x</span>` : D.state.sim ? `<span class="simtag">Simulasi ${D.state.sim.speed}x</span>` : esc(dfmt.format(new Date(Date.now() + OFF))));
  $('conn').className = 'conn' + (online || SIM ? ' on' : '');
  $('conn').title = online ? 'Terhubung ke server' : 'Terputus dari server, timer tetap jalan dengan data terakhir';
  if ($('title')) { $('title').textContent = D.title; $('sub').textContent = D.subtitle; }
  const tMin = Math.min(...Object.values(T)), span = END - START;
  const ph = tMin < START ? 'Belum dimulai' : tMin >= END ? 'Perlombaan selesai' : (phaseNow(T) || 'Berlangsung');
  const sh = Math.max(...D.lanes.map(l => W - T[l.id]));
  set($('phase'), `<b>${esc(ph)}</b>`);
  set($('overall'), tMin >= END ? 'Semua lapangan selesai' : `Perkiraan selesai ${hm(END + sh)}`);
  const pc = x => Math.max(0, Math.min(100, (x - START) / span * 100));
  set($('bar'), `<div class="fill" style="width:${pc(tMin)}%"></div>` +
    PHASES.map(p => `<span class="ph" style="left:${pc(p.s)}%;width:${pc(p.e) - pc(p.s)}%">${esc(p.name)}</span>`).join('') +
    D.lanes[0].items.filter(i => i.type === 'rest').map(i => `<span class="rs" style="left:${pc(i.s)}%;width:${pc(i.e) - pc(i.s)}%" title="${esc(i.label)}"></span>`).join('') +
    D.lanes.map(l => `<i class="mk" style="left:${pc(T[l.id])}%"><b>${esc(l.id)}</b></i>`).join(''));
  const m = $('msg');
  if (m.textContent !== D.state.message) { // pengumuman baru: kilatan ulang
    m.textContent = D.state.message; m.classList.remove('fresh'); void m.offsetWidth; m.classList.toggle('fresh', !!D.state.message); }
  m.hidden = !D.state.message;
}
