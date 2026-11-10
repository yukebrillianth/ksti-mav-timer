// Efek suara timer (Web Audio, tanpa file). Hanya bunyi saat waktu berjalan normal, bukan saat jadwal dilompati.
const PRIO = { buzzer: 4, go: 3, tick: 2, warn: 1, chime: 0 };

// kejadian yang dilewati lapangan l saat waktunya maju dari t0 ke t1 (t0 < t1); satu suara per lapangan per detik
function laneEvents(l, t0, t1) {
  const hit = x => x > t0 && x <= t1, ev = [];
  for (const i of l.items) {
    if (i.type === 'race') {
      if (hit(i.s)) ev.push('go');
      if (hit(i.e)) ev.push('buzzer');
      for (let k = 1; k <= 5; k++) if (hit(i.s - k) || hit(i.e - k)) ev.push('tick');
    } else if (i.type === 'prep' || i.type === 'rest') {
      if (hit(i.s)) ev.push('chime');
      if (i.type === 'prep' && i.e - i.s > 120 && hit(i.e - 60)) ev.push('warn');
    }
  }
  return ev.sort((a, b) => PRIO[b] - PRIO[a]).slice(0, 1);
}

const Sound = {
  on: false, ctx: null, last: {},
  enable() { this.ctx ??= new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume(); this.on = true; },
  tone(f, dur, { type = 'square', gain = .25, at = 0, to } = {}) {
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .01); g.gain.setValueAtTime(gain, t + dur - .04); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .02);
  },
  play(name) {
    if (!this.on) return;
    if (name === 'tick') this.tone(880, .12);
    if (name === 'go') { this.tone(1320, .7, { gain: .3 }); this.tone(660, .7, { gain: .15, type: 'sawtooth' }); }
    if (name === 'buzzer') { this.tone(180, 1.1, { type: 'sawtooth', gain: .35 }); this.tone(186, 1.1, { type: 'square', gain: .15 }); }
    if (name === 'warn') { this.tone(988, .18, { type: 'sine', gain: .35 }); this.tone(988, .18, { type: 'sine', gain: .35, at: .25 }); }
    if (name === 'chime') { this.tone(660, .5, { type: 'sine', gain: .3 }); this.tone(990, .6, { type: 'sine', gain: .2, at: .12 }); }
  },
  // dipanggil tiap render; maks lompatan 2 dtk dianggap waktu normal (jeda, lompat jadwal, simulasi cepat = diam)
  update(lanes, T) {
    for (const l of lanes) {
      const t0 = this.last[l.id], t1 = T[l.id]; this.last[l.id] = t1;
      if (t0 == null || t1 <= t0 || t1 - t0 > 2) continue;
      laneEvents(l, t0, t1).forEach(e => this.play(e));
    }
  },
};
