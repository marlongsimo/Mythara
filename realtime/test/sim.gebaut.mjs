// shared/config.ts
var TICK = 20;
var DT = 1 / TICK;
var HELDEN = {
  schildwaechter: {
    name: "Torvald",
    klasse: "Krieger",
    bild: "img/figuren/schildwaechter.jpg",
    lp: 320,
    tempo: 4.2,
    reich: 1.35,
    schaden: 26,
    takt: 0.8,
    nah: true,
    q: { name: "Schildsto\xDF", zeit: 7, text: "St\xFCrmt vor: Schaden und kurze Bet\xE4ubung f\xFCr den ersten Gegner." },
    e: { name: "Bollwerk", zeit: 12, text: "3 Sekunden lang 60 % weniger Schaden." }
  },
  elementarist: {
    name: "Vaelin",
    klasse: "Magier",
    bild: "img/figuren/elementarist.jpg",
    lp: 190,
    tempo: 4.2,
    reich: 6,
    schaden: 20,
    takt: 0.75,
    nah: false,
    flug: 14,
    q: { name: "Feuerball", zeit: 6, text: "Explodiert am Ziel und trifft alle im Umkreis." },
    e: { name: "Blinzeln", zeit: 10, text: "Springt ein St\xFCck in Zielrichtung." }
  }
};
var MONSTER = {
  schattenkobold: { name: "Schattenkobold", bild: "img/gegner/schattenkobold.jpg", lp: 60, tempo: 3.7, reich: 1.2, schaden: 8, takt: 0.9, r: 0.32, xp: 20 },
  rostkaefer: { name: "Rostk\xE4fer", bild: "img/gegner/rostkaefer.jpg", lp: 95, tempo: 3.2, reich: 1.2, schaden: 11, takt: 1, r: 0.36, xp: 28 },
  knochenwaechter: { name: "Knochenw\xE4chter", bild: "img/gegner/knochenwaechter.jpg", lp: 150, tempo: 3.3, reich: 1.3, schaden: 15, takt: 1.1, r: 0.38, xp: 45 },
  grabritter: { name: "Siegelw\xE4chter", bild: "img/gegner/grabritter.jpg", lp: 700, tempo: 2.9, reich: 1.6, schaden: 28, takt: 1.3, r: 0.62, xp: 200, boss: true }
};
var K = {
  R_HELD: 0.36,
  SICHT: 6,
  // so weit greift ein Held von selbst an, wenn er nichts zu tun hat
  AGGRO: 5.5,
  LEINE: 9,
  // Monster: ab wann sie angreifen, wie weit sie ihrem Lager folgen
  WIEDER_HELD: 5,
  // Sekunden bis ein gefallener Held am Eingang wieder aufsteht
  XP_STUFE: [0, 60, 150, 280, 450, 660, 910, 1200, 1530, 1900],
  // Erfahrung für Stufe 1 bis 10
  LP_JE_STUFE: 0.12,
  SCHADEN_JE_STUFE: 0.1,
  SPLITTER: [1, 20],
  SPLITTER_BOSS: [40, 60],
  BOSS_SCHLAG: { alle: 6, warn: 1.1, r: 2.3, schaden: 60 },
  // der Boss kündigt einen Flächenschlag an – ausweichen!
  STOSS: { weite: 3.4, schaden: 32, betaeubt: 1 },
  BOLLWERK: { dauer: 3, faktor: 0.4 },
  FEUER: { reich: 6.5, r: 1.6, schaden: 48, flug: 11 },
  BLINZELN: 3.5,
  EINGABEN_JE_SEK: 30
  // mehr nimmt der Server von einem Client nicht an
};

// shared/karte.ts
var KB = 33;
var KH = 20;
var OFFEN = [
  [1, 1, 7, 6],
  // Eingang
  [8, 3, 3, 2],
  [11, 1, 8, 7],
  // Koboldhöhle
  [14, 8, 2, 3],
  [10, 11, 10, 7],
  // Käfernest
  [20, 13, 3, 2],
  [23, 10, 9, 8],
  // Gruft
  [26, 7, 2, 3],
  [21, 1, 11, 6]
  // Siegelkammer
];
var SAEULEN = [[14, 4], [15, 4], [14, 14], [27, 14], [27, 15], [24, 3]];
var FELS = new Uint8Array(KB * KH).fill(1);
for (const [x, y, w, h] of OFFEN) for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) FELS[j * KB + i] = 0;
for (const [x, y] of SAEULEN) FELS[y * KB + x] = 1;
var START = [{ x: 3.5, y: 4.5 }, { x: 4.5, y: 5.5 }, { x: 2.5, y: 5.5 }];
var LAGER = [
  { art: "schattenkobold", x: 13.5, y: 2.5 },
  { art: "schattenkobold", x: 16.5, y: 2.5 },
  { art: "schattenkobold", x: 16.5, y: 5.5 },
  { art: "rostkaefer", x: 12.5, y: 14.5 },
  { art: "rostkaefer", x: 16.5, y: 13.5 },
  { art: "rostkaefer", x: 17.5, y: 16.5 },
  { art: "knochenwaechter", x: 25.5, y: 13.5 },
  { art: "knochenwaechter", x: 29.5, y: 12.5 },
  { art: "knochenwaechter", x: 29.5, y: 16.5 },
  { art: "grabritter", x: 28.5, y: 3.5 },
  { art: "knochenwaechter", x: 25.5, y: 2.5 },
  { art: "knochenwaechter", x: 25.5, y: 5.5 }
];
var fels = (i, j) => i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1;
var begehbar = (x, y) => !fels(Math.floor(x), Math.floor(y));
var abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function frei(a, b, rand = 0) {
  const d = abstand(a, b), n = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
  for (let k = 0; k <= n; k++) {
    const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
    if (!begehbar(x, y)) return false;
    if (rand > 0 && (!begehbar(x + nx * rand, y + ny * rand) || !begehbar(x - nx * rand, y - ny * rand))) return false;
  }
  return true;
}
function schieben(e) {
  const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
    if (!fels(i, j)) continue;
    const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
    if (d >= e.r) continue;
    if (d > 1e-4) {
      e.x = nx + dx / d * e.r;
      e.y = ny + dy / d * e.r;
    } else {
      e.x = i0 + 0.5;
      e.y = j0 + 0.5;
    }
  }
}
function naechstFrei(p) {
  if (begehbar(p.x, p.y)) return { x: p.x, y: p.y };
  let best = null, bd = Infinity;
  for (let i = 0; i < KB; i++) for (let j = 0; j < KH; j++) {
    if (fels(i, j)) continue;
    const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y);
    if (d < bd) {
      bd = d;
      best = { x: i + 0.5, y: j + 0.5 };
    }
  }
  return best || { x: START[0].x, y: START[0].y };
}
function weg(von, nach, rand = 0.3) {
  const ziel = naechstFrei(nach), start = naechstFrei(von);
  if (frei(start, ziel, rand)) return [ziel];
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y), N = KB * KH;
  const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen = [];
  const h = (i, j) => {
    const dx = Math.abs(i - zi), dy = Math.abs(j - zj);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const f = new Float32Array(N).fill(Infinity), s0 = sj * KB + si;
  g[s0] = 0;
  f[s0] = h(si, sj);
  offen.push(s0);
  while (offen.length) {
    let bi = 0;
    for (let k2 = 1; k2 < offen.length; k2++) if (f[offen[k2]] < f[offen[bi]]) bi = k2;
    const c = offen[bi];
    offen[bi] = offen[offen.length - 1];
    offen.pop();
    if (zu[c]) continue;
    zu[c] = 1;
    const ci = c % KB, cj = (c - ci) / KB;
    if (ci === zi && cj === zj) break;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj;
      if (fels(i, j)) continue;
      if (di && dj && (fels(ci + di, cj) || fels(ci, cj + dj))) continue;
      const n = j * KB + i, kosten = g[c] + (di && dj ? 1.414 : 1);
      if (kosten < g[n]) {
        g[n] = kosten;
        her[n] = c;
        f[n] = kosten + h(i, j);
        offen.push(n);
      }
    }
  }
  const z0 = zj * KB + zi;
  if (her[z0] < 0 && z0 !== s0) return [];
  const roh = [ziel];
  for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: c % KB + 0.5, y: Math.floor(c / KB) + 0.5 });
  roh.reverse();
  const aus = [];
  let hier = start, k = 0;
  while (k < roh.length) {
    let m = k;
    for (let n = roh.length - 1; n > k; n--) if (frei(hier, roh[n], rand)) {
      m = n;
      break;
    }
    aus.push(roh[m]);
    hier = roh[m];
    k = m + 1;
  }
  return aus;
}

// shared/sim.ts
var Sim = class {
  constructor(heldTyp = "schildwaechter", seed = 1) {
    this.heldTyp = heldTyp;
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.wesen = [];
    this.geschosse = [];
    this.ev = [];
    this.lauf = 1;
    this.zs = seed >>> 0 || 1;
    this.aufbau();
  }
  zf() {
    this.zs = this.zs + 1831565813 >>> 0;
    let t = this.zs;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  neu(held, typ, team, p, bot) {
    const lp = held ? HELDEN[typ].lp : MONSTER[typ].lp;
    const w = { id: this.lauf++, held, typ, team, bot, x: p.x, y: p.y, r: held ? K.R_HELD : MONSTER[typ].r, blick: 0, lp, max: lp, stufe: 1, xp: 0, pfad: [], zielId: 0, cdA: 0, cdQ: 0, cdE: 0, bollwerk: 0, betaeubt: 0, tot: false, wieder: 0, heim: { x: p.x, y: p.y }, neuWeg: 0, schlag: K.BOSS_SCHLAG.alle, warn: 0, warnX: 0, warnY: 0, fuehrer: 0 };
    this.wesen.push(w);
    return w;
  }
  aufbau() {
    this.wesen = [];
    this.geschosse = [];
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.lauf = 1;
    const ich = this.neu(true, HELDEN[this.heldTyp] ? this.heldTyp : "schildwaechter", 0, START[0], false);
    const begleiter = this.neu(true, ich.typ === "elementarist" ? "schildwaechter" : "elementarist", 0, START[1], true);
    begleiter.fuehrer = ich.id;
    for (const l of LAGER) this.neu(false, l.art, 1, l, true);
  }
  get ich() {
    return this.wesen[0];
  }
  nach(id) {
    return this.wesen.find((w) => w.id === id);
  }
  schadenVon(w) {
    return (w.held ? HELDEN[w.typ].schaden : MONSTER[w.typ].schaden) * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1));
  }
  /** Eine Eingabe des Spielers. Alles wird geprüft und begrenzt – der Client bestimmt nie ein Ergebnis. */
  eingabe(e) {
    const h = this.ich;
    if (!e || typeof e !== "object") return;
    if (e.t === "neu") {
      if (this.phase === "sieg") this.aufbau();
      return;
    }
    if (h.tot || this.phase !== "lauf") return;
    const zahl = (v) => typeof v === "number" && Number.isFinite(v);
    if (e.t === "lauf") {
      if (!zahl(e.x) || !zahl(e.y)) return;
      h.zielId = 0;
      h.pfad = weg(h, { x: e.x, y: e.y });
    } else if (e.t === "ziel") {
      const z = this.nach(e.id);
      if (z && !z.tot && z.team !== h.team) {
        h.zielId = z.id;
        h.neuWeg = 0;
      }
    } else if (e.t === "halt") {
      h.pfad = [];
      h.zielId = 0;
    } else if (e.t === "faehig") {
      if (e.taste !== "q" && e.taste !== "e" || !zahl(e.x) || !zahl(e.y)) return;
      this.faehigkeit(h, e.taste, { x: e.x, y: e.y });
    }
  }
  treffer(z, menge, von) {
    if (z.tot) return;
    let m = menge;
    if (z.bollwerk > 0) m *= K.BOLLWERK.faktor;
    m = Math.max(1, Math.round(m));
    z.lp -= m;
    this.ev.push({ a: "schaden", id: z.id, n: m });
    if (!z.held && von && von.held && !z.zielId) z.zielId = von.id;
    if (z.lp > 0) return;
    z.lp = 0;
    z.tot = true;
    z.pfad = [];
    z.zielId = 0;
    this.ev.push({ a: "tot", id: z.id });
    if (z.held) {
      z.wieder = K.WIEDER_HELD;
      return;
    }
    const D = MONSTER[z.typ];
    this.besiegt++;
    const [a, b] = D.boss ? K.SPLITTER_BOSS : K.SPLITTER, n = a + Math.floor(this.zf() * (b - a + 1));
    this.splitter += n;
    this.ev.push({ a: "splitter", x: z.x, y: z.y, n });
    for (const h of this.wesen) if (h.held) {
      h.xp += D.xp;
      let s = 1;
      while (s < K.XP_STUFE.length && h.xp >= K.XP_STUFE[s]) s++;
      if (s > h.stufe) {
        const alt = h.max;
        h.stufe = s;
        h.max = Math.round(HELDEN[h.typ].lp * (1 + K.LP_JE_STUFE * (s - 1)));
        if (!h.tot) h.lp += h.max - alt;
        this.ev.push({ a: "auf", id: h.id, stufe: s });
      }
    }
    if (D.boss) this.phase = "sieg";
  }
  sprung(w, richtung, weite, beiGegner) {
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    for (let s = 0; s < weite; s += 0.15) {
      const nx = w.x + dx * 0.15, ny = w.y + dy * 0.15;
      if (!begehbar(nx + dx * w.r, ny + dy * w.r)) break;
      w.x = nx;
      w.y = ny;
      if (beiGegner) {
        const o = this.wesen.find((o2) => !o2.tot && o2.team !== w.team && abstand(w, o2) < w.r + o2.r + 0.15);
        if (o) {
          beiGegner(o);
          break;
        }
      }
    }
    schieben(w);
    w.pfad = [];
  }
  faehigkeit(w, taste, ziel) {
    if (w.tot || w.betaeubt > 0 || !w.held) return;
    const D = HELDEN[w.typ];
    if (taste === "q" ? w.cdQ > 0 : w.cdE > 0) return;
    const richtung = Math.atan2(ziel.y - w.y, ziel.x - w.x);
    w.blick = richtung;
    if (taste === "q") {
      w.cdQ = D.q.zeit;
      if (w.typ === "schildwaechter") {
        this.ev.push({ a: "stoss", id: w.id });
        this.sprung(w, richtung, K.STOSS.weite, (o) => {
          this.treffer(o, K.STOSS.schaden * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1)), w);
          o.betaeubt = Math.max(o.betaeubt, K.STOSS.betaeubt);
          w.zielId = o.id;
        });
      } else {
        const d = Math.min(K.FEUER.reich, abstand(w, ziel));
        this.geschosse.push({ id: this.lauf++, x: w.x, y: w.y, zielId: 0, zx: w.x + Math.cos(richtung) * d, zy: w.y + Math.sin(richtung) * d, tempo: K.FEUER.flug, schaden: K.FEUER.schaden * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1)), von: w.id, knall: K.FEUER.r, art: "feuer" });
      }
    } else {
      w.cdE = D.e.zeit;
      if (w.typ === "schildwaechter") w.bollwerk = K.BOLLWERK.dauer;
      else this.sprung(w, richtung, Math.min(K.BLINZELN, abstand(w, ziel)));
    }
  }
  angriff(w, z) {
    const D = w.held ? HELDEN[w.typ] : null, takt = D ? D.takt : MONSTER[w.typ].takt;
    w.cdA = takt;
    w.blick = Math.atan2(z.y - w.y, z.x - w.x);
    this.ev.push({ a: "hieb", id: w.id });
    if (D && !D.nah) this.geschosse.push({ id: this.lauf++, x: w.x, y: w.y, zielId: z.id, zx: z.x, zy: z.y, tempo: D.flug || 12, schaden: this.schadenVon(w), von: w.id, knall: 0, art: "blitz" });
    else this.treffer(z, this.schadenVon(w), w);
  }
  /** Auf ein Ziel zugehen und zuschlagen, sobald es in Reichweite ist */
  jagen(w, z, reich) {
    const d = abstand(w, z) - z.r;
    if (d <= reich && frei(w, z)) {
      w.pfad = [];
      w.blick = Math.atan2(z.y - w.y, z.x - w.x);
      if (w.cdA <= 0) this.angriff(w, z);
      return;
    }
    w.neuWeg -= DT;
    if (w.neuWeg <= 0 || !w.pfad.length) {
      w.pfad = weg(w, z);
      w.neuWeg = 0.3;
    }
  }
  naechsterGegner(w, weit) {
    let best = null, bd = weit;
    for (const o of this.wesen) {
      if (o.tot || o.team === w.team) continue;
      const d = abstand(w, o);
      if (d < bd && frei(w, o)) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  /** Ein Rechenschritt (DT Sekunden) */
  schritt() {
    this.tick++;
    if (this.phase !== "lauf") return;
    this.zeit += DT;
    for (const w of this.wesen) {
      if (w.tot) {
        if (w.held) {
          w.wieder -= DT;
          if (w.wieder <= 0) {
            w.tot = false;
            w.lp = w.max;
            const p = START[w.bot ? 1 : 0];
            w.x = p.x;
            w.y = p.y;
            w.pfad = [];
            w.zielId = 0;
          }
        }
        continue;
      }
      w.cdA = Math.max(0, w.cdA - DT);
      w.cdQ = Math.max(0, w.cdQ - DT);
      w.cdE = Math.max(0, w.cdE - DT);
      w.bollwerk = Math.max(0, w.bollwerk - DT);
      if (w.betaeubt > 0) {
        w.betaeubt = Math.max(0, w.betaeubt - DT);
        continue;
      }
      let ziel = w.zielId ? this.nach(w.zielId) : void 0;
      if (ziel && ziel.tot) {
        ziel = void 0;
        w.zielId = 0;
      }
      if (w.held) {
        const D = HELDEN[w.typ];
        if (w.bot) {
          const f = this.nach(w.fuehrer);
          const fz = f && f.zielId ? this.nach(f.zielId) : void 0;
          if (!ziel) ziel = (fz && !fz.tot ? fz : this.naechsterGegner(w, K.SICHT)) || void 0;
          w.zielId = ziel ? ziel.id : 0;
          if (f && !f.tot && abstand(w, f) > 7) {
            ziel = void 0;
            w.zielId = 0;
          }
          if (ziel) {
            if (!D.nah && abstand(w, ziel) < 2.2) {
              const weg0 = Math.atan2(w.y - ziel.y, w.x - ziel.x);
              w.pfad = [naechstFrei({ x: w.x + Math.cos(weg0) * 2, y: w.y + Math.sin(weg0) * 2 })];
            } else this.jagen(w, ziel, D.reich);
            if (w.typ === "elementarist" && w.cdQ <= 0 && abstand(w, ziel) < K.FEUER.reich && frei(w, ziel)) this.faehigkeit(w, "q", ziel);
            if (w.typ === "schildwaechter" && w.cdQ <= 0 && abstand(w, ziel) < K.STOSS.weite) this.faehigkeit(w, "q", ziel);
          } else if (f && !f.tot && abstand(w, f) > 2.4) {
            w.neuWeg -= DT;
            if (w.neuWeg <= 0) {
              w.pfad = weg(w, { x: f.x - Math.cos(f.blick) * 1.2, y: f.y - Math.sin(f.blick) * 1.2 });
              w.neuWeg = 0.4;
            }
          }
        } else if (ziel) this.jagen(w, ziel, D.reich);
        else if (!w.pfad.length) {
          const o = this.naechsterGegner(w, D.nah ? 2.2 : D.reich);
          if (o && w.cdA <= 0) this.angriff(w, o);
        }
      } else {
        const D = MONSTER[w.typ];
        if (ziel && (abstand(ziel, w.heim) > K.LEINE || ziel.tot)) {
          ziel = void 0;
          w.zielId = 0;
        }
        if (!ziel) {
          const o = this.naechsterGegner(w, K.AGGRO);
          if (o && abstand(o, w.heim) <= K.LEINE) {
            ziel = o;
            w.zielId = o.id;
          }
        }
        if (D.boss) {
          if (w.warn > 0) {
            w.warn -= DT;
            w.pfad = [];
            if (w.warn <= 0) {
              this.ev.push({ a: "knall", x: w.warnX, y: w.warnY, r: K.BOSS_SCHLAG.r });
              for (const o of this.wesen) if (!o.tot && o.team !== w.team && Math.hypot(o.x - w.warnX, o.y - w.warnY) < K.BOSS_SCHLAG.r + o.r) this.treffer(o, K.BOSS_SCHLAG.schaden, w);
            }
            continue;
          }
          if (ziel) {
            w.schlag -= DT;
            if (w.schlag <= 0) {
              w.schlag = K.BOSS_SCHLAG.alle;
              w.warn = K.BOSS_SCHLAG.warn;
              w.warnX = ziel.x;
              w.warnY = ziel.y;
              this.ev.push({ a: "warn", x: ziel.x, y: ziel.y, r: K.BOSS_SCHLAG.r, t: K.BOSS_SCHLAG.warn });
              continue;
            }
          }
        }
        if (ziel) this.jagen(w, ziel, D.reich);
        else if (abstand(w, w.heim) > 0.3) {
          w.neuWeg -= DT;
          if (w.neuWeg <= 0 || !w.pfad.length) {
            w.pfad = weg(w, w.heim);
            w.neuWeg = 1;
          }
        } else if (w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * 0.15 * DT);
      }
      if (w.pfad.length) {
        let rest = (w.held ? HELDEN[w.typ].tempo : MONSTER[w.typ].tempo) * DT;
        while (rest > 0 && w.pfad.length) {
          const p = w.pfad[0], d = abstand(w, p);
          if (d <= rest) {
            w.x = p.x;
            w.y = p.y;
            rest -= d;
            w.pfad.shift();
          } else {
            w.blick = Math.atan2(p.y - w.y, p.x - w.x);
            w.x += (p.x - w.x) / d * rest;
            w.y += (p.y - w.y) / d * rest;
            rest = 0;
          }
        }
      }
    }
    for (let i = 0; i < this.wesen.length; i++) for (let j = i + 1; j < this.wesen.length; j++) {
      const a = this.wesen[i], b = this.wesen[j];
      if (a.tot || b.tot) continue;
      const d = abstand(a, b), soll = a.r + b.r;
      if (d < soll && d > 1e-4) {
        const s = (soll - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d;
        a.x -= dx * s;
        a.y -= dy * s;
        b.x += dx * s;
        b.y += dy * s;
      }
    }
    for (const w of this.wesen) if (!w.tot) schieben(w);
    for (const g of this.geschosse) {
      const z = g.zielId ? this.nach(g.zielId) : void 0;
      if (z && !z.tot) {
        g.zx = z.x;
        g.zy = z.y;
      }
      const d = Math.hypot(g.zx - g.x, g.zy - g.y), s = g.tempo * DT;
      if (d > s) {
        g.x += (g.zx - g.x) / d * s;
        g.y += (g.zy - g.y) / d * s;
        if (g.knall && !begehbar(g.x, g.y)) {
          g.zx = g.x;
          g.zy = g.y;
        } else continue;
      }
      g.tempo = 0;
      const von = this.nach(g.von);
      if (g.knall) {
        this.ev.push({ a: "knall", x: g.zx, y: g.zy, r: g.knall });
        for (const o of this.wesen) if (!o.tot && von && o.team !== von.team && Math.hypot(o.x - g.zx, o.y - g.zy) < g.knall + o.r) this.treffer(o, g.schaden, von);
      } else if (z && !z.tot) this.treffer(z, g.schaden, von);
    }
    this.geschosse = this.geschosse.filter((g) => g.tempo > 0);
  }
  /** Der Zustand für den Client (kompakt). Die Ereignisse seit dem letzten Abruf sind enthalten und werden danach geleert. */
  zustand() {
    const r = (v) => Math.round(v * 100) / 100, h = this.ich, ev = this.ev;
    this.ev = [];
    return {
      tick: this.tick,
      phase: this.phase,
      zeit: Math.round(this.zeit * 10) / 10,
      splitter: this.splitter,
      besiegt: this.besiegt,
      monster: this.wesen.filter((w) => !w.held).length,
      w: this.wesen.filter((w) => w.held || !w.tot).map((w) => [w.id, w.held ? 1 : 0, w.typ, w.team, r(w.x), r(w.y), r(w.blick), Math.round(w.lp), w.max, w.stufe, w.tot ? 1 : 0, w.bollwerk > 0 ? 1 : 0, w.betaeubt > 0 ? 1 : 0, w.xp]),
      g: this.geschosse.map((g) => [g.id, r(g.x), r(g.y), g.art]),
      ev,
      ich: { id: h.id, cdQ: r(h.cdQ), cdE: r(h.cdE), zielId: h.zielId, wieder: r(Math.max(0, h.wieder)) }
    };
  }
};
export {
  Sim
};
