/*
 * Mythara Echtzeit – die Spielsimulation. Sie allein entscheidet über Bewegung, Treffer, Schaden und Tod.
 * Der Server lässt sie laufen und schickt Zustände an den Client; ohne Server kann der Browser sie ersatzweise selbst rechnen.
 * Kein Zugriff auf Browser, Netz oder Uhr: nur Zustand + Eingaben + Zeitschritt.
 */
import { DT, HELDEN, MONSTER, K } from "./config";
import { Punkt, START, LAGER, abstand, frei, schieben, weg, naechstFrei, begehbar } from "./karte";

export type Eingabe =
  | { t: "richtung"; x: number; y: number }  // direkt steuern: Laufrichtung in der Welt (Länge 0 bis 1), 0/0 = stehen bleiben
  | { t: "lauf"; x: number; y: number }      // zu einem Punkt laufen (Wegsuche)
  | { t: "ziel"; id: number }                // einen Gegner als Ziel wählen: Der Held schlägt zu, sobald und solange er in Reichweite ist (id 0 = kein Ziel)
  | { t: "faehig"; taste: "q" | "e"; x: number; y: number } // Fähigkeit in Richtung des Punktes
  | { t: "halt" }
  | { t: "neu" };                            // nach dem Ende: neuer Riss

export interface Wesen { id: number; held: boolean; typ: string; team: number; bot: boolean; x: number; y: number; r: number; blick: number; lp: number; max: number; stufe: number; xp: number;
  pfad: Punkt[]; zielId: number; cdA: number; cdQ: number; cdE: number; bollwerk: number; betaeubt: number; tot: boolean; wieder: number; heim: Punkt; neuWeg: number; schlag: number; warn: number; warnX: number; warnY: number; fuehrer: number; rx: number; ry: number }
export interface Geschoss { id: number; x: number; y: number; zielId: number; zx: number; zy: number; tempo: number; schaden: number; von: number; knall: number; art: string }
export type Ereignis = { a: "schaden"; id: number; n: number } | { a: "heil"; id: number; n: number } | { a: "hieb"; id: number } | { a: "knall"; x: number; y: number; r: number } | { a: "auf"; id: number; stufe: number }
  | { a: "warn"; x: number; y: number; r: number; t: number } | { a: "tot"; id: number } | { a: "splitter"; x: number; y: number; n: number } | { a: "stoss"; id: number };
export interface Zustand { tick: number; phase: "lauf" | "sieg"; zeit: number; splitter: number; besiegt: number; monster: number;
  w: Array<[number, number, string, number, number, number, number, number, number, number, number, number, number, number]>; // id, held, typ, team, x, y, blick, lp, max, stufe, tot, bollwerk, betaeubt, xp
  g: Array<[number, number, number, string]>; ev: Ereignis[]; ich: { id: number; cdQ: number; cdE: number; zielId: number; wieder: number } }

export class Sim {
  tick = 0; zeit = 0; phase: "lauf" | "sieg" = "lauf"; splitter = 0; besiegt = 0;
  wesen: Wesen[] = []; geschosse: Geschoss[] = []; ev: Ereignis[] = [];
  private lauf = 1; private zs: number;
  constructor(public heldTyp = "schildwaechter", seed = 1) { this.zs = (seed >>> 0) || 1; this.aufbau(); }
  private zf(): number { this.zs = (this.zs + 0x6d2b79f5) >>> 0; let t = this.zs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  private neu(held: boolean, typ: string, team: number, p: Punkt, bot: boolean): Wesen {
    const lp = held ? HELDEN[typ].lp : MONSTER[typ].lp;
    const w: Wesen = { id: this.lauf++, held, typ, team, bot, x: p.x, y: p.y, r: held ? K.R_HELD : MONSTER[typ].r, blick: 0, lp, max: lp, stufe: 1, xp: 0, pfad: [], zielId: 0, cdA: 0, cdQ: 0, cdE: 0, bollwerk: 0, betaeubt: 0, tot: false, wieder: 0, heim: { x: p.x, y: p.y }, neuWeg: 0, schlag: K.BOSS_SCHLAG.alle, warn: 0, warnX: 0, warnY: 0, fuehrer: 0, rx: 0, ry: 0 };
    this.wesen.push(w); return w;
  }
  private aufbau(): void {
    this.wesen = []; this.geschosse = []; this.tick = 0; this.zeit = 0; this.phase = "lauf"; this.splitter = 0; this.besiegt = 0; this.lauf = 1;
    const ich = this.neu(true, HELDEN[this.heldTyp] ? this.heldTyp : "schildwaechter", 0, START[0], false);
    const begleiter = this.neu(true, ich.typ === "elementarist" ? "schildwaechter" : "elementarist", 0, START[1], true); begleiter.fuehrer = ich.id;
    for (const l of LAGER) this.neu(false, l.art, 1, l, true);
  }
  get ich(): Wesen { return this.wesen[0]; }
  private nach(id: number): Wesen | undefined { return this.wesen.find((w) => w.id === id); }
  private schadenVon(w: Wesen): number { return (w.held ? HELDEN[w.typ].schaden : MONSTER[w.typ].schaden) * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1)); }

  /** Eine Eingabe des Spielers. Alles wird geprüft und begrenzt – der Client bestimmt nie ein Ergebnis. */
  eingabe(e: Eingabe): void {
    const h = this.ich; if (!e || typeof e !== "object") return;
    if (e.t === "neu") { if (this.phase === "sieg") this.aufbau(); return; }
    if (h.tot || this.phase !== "lauf") return;
    const zahl = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    if (e.t === "richtung") { if (!zahl(e.x) || !zahl(e.y)) return; const l = Math.hypot(e.x, e.y); if (l < 0.05) { h.rx = 0; h.ry = 0; } else { const k = Math.min(1, l) / l; h.rx = e.x * k; h.ry = e.y * k; h.pfad = []; } } // nie schneller als das Tempo des Helden
    else if (e.t === "lauf") { if (!zahl(e.x) || !zahl(e.y)) return; h.zielId = 0; h.rx = 0; h.ry = 0; h.pfad = weg(h, { x: e.x, y: e.y }); }
    else if (e.t === "ziel") { if (e.id === 0) { h.zielId = 0; return; } const z = this.nach(e.id); if (z && !z.tot && z.team !== h.team) h.zielId = z.id; }
    else if (e.t === "halt") { h.pfad = []; h.zielId = 0; h.rx = 0; h.ry = 0; }
    else if (e.t === "faehig") { if ((e.taste !== "q" && e.taste !== "e") || !zahl(e.x) || !zahl(e.y)) return; this.faehigkeit(h, e.taste, { x: e.x, y: e.y }); }
  }

  private treffer(z: Wesen, menge: number, von: Wesen | undefined): void {
    if (z.tot) return; let m = menge; if (z.bollwerk > 0) m *= K.BOLLWERK.faktor; m = Math.max(1, Math.round(m));
    z.lp -= m; this.ev.push({ a: "schaden", id: z.id, n: m });
    if (!z.held && von && von.held && !z.zielId) z.zielId = von.id; // wer ein Monster schlägt, hat seine Aufmerksamkeit
    if (z.lp > 0) return; z.lp = 0; z.tot = true; z.pfad = []; z.zielId = 0; this.ev.push({ a: "tot", id: z.id });
    if (z.held) { z.wieder = K.WIEDER_HELD; return; }
    const D = MONSTER[z.typ]; this.besiegt++;
    const [a, b] = D.boss ? K.SPLITTER_BOSS : K.SPLITTER, n = a + Math.floor(this.zf() * (b - a + 1)); this.splitter += n; this.ev.push({ a: "splitter", x: z.x, y: z.y, n });
    for (const h of this.wesen) if (h.held) { h.xp += D.xp; let s = 1; while (s < K.XP_STUFE.length && h.xp >= K.XP_STUFE[s]) s++; if (s > h.stufe) { const alt = h.max; h.stufe = s; h.max = Math.round(HELDEN[h.typ].lp * (1 + K.LP_JE_STUFE * (s - 1))); if (!h.tot) h.lp += h.max - alt; this.ev.push({ a: "auf", id: h.id, stufe: s }); } }
    if (D.boss) this.phase = "sieg";
  }
  private sprung(w: Wesen, richtung: number, weite: number, beiGegner?: (o: Wesen) => void): void {
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    for (let s = 0; s < weite; s += 0.15) { const nx = w.x + dx * 0.15, ny = w.y + dy * 0.15; if (!begehbar(nx + dx * w.r, ny + dy * w.r)) break; w.x = nx; w.y = ny;
      if (beiGegner) { const o = this.wesen.find((o) => !o.tot && o.team !== w.team && abstand(w, o) < w.r + o.r + 0.15); if (o) { beiGegner(o); break; } } }
    schieben(w); w.pfad = [];
  }
  private faehigkeit(w: Wesen, taste: "q" | "e", ziel: Punkt): void {
    if (w.tot || w.betaeubt > 0 || !w.held) return; const D = HELDEN[w.typ]; if (taste === "q" ? w.cdQ > 0 : w.cdE > 0) return;
    const richtung = Math.atan2(ziel.y - w.y, ziel.x - w.x); w.blick = richtung;
    if (taste === "q") { w.cdQ = D.q.zeit;
      if (w.typ === "schildwaechter") { this.ev.push({ a: "stoss", id: w.id }); this.sprung(w, richtung, K.STOSS.weite, (o) => { this.treffer(o, K.STOSS.schaden * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1)), w); o.betaeubt = Math.max(o.betaeubt, K.STOSS.betaeubt); w.zielId = o.id; }); }
      else { const d = Math.min(K.FEUER.reich, abstand(w, ziel)); this.geschosse.push({ id: this.lauf++, x: w.x, y: w.y, zielId: 0, zx: w.x + Math.cos(richtung) * d, zy: w.y + Math.sin(richtung) * d, tempo: K.FEUER.flug, schaden: K.FEUER.schaden * (1 + K.SCHADEN_JE_STUFE * (w.stufe - 1)), von: w.id, knall: K.FEUER.r, art: "feuer" }); } }
    else { w.cdE = D.e.zeit; if (w.typ === "schildwaechter") w.bollwerk = K.BOLLWERK.dauer; else this.sprung(w, richtung, Math.min(K.BLINZELN, abstand(w, ziel))); }
  }
  private angriff(w: Wesen, z: Wesen): void {
    const D = w.held ? HELDEN[w.typ] : null, takt = D ? D.takt : MONSTER[w.typ].takt; w.cdA = takt; w.blick = Math.atan2(z.y - w.y, z.x - w.x); this.ev.push({ a: "hieb", id: w.id });
    if (D && !D.nah) this.geschosse.push({ id: this.lauf++, x: w.x, y: w.y, zielId: z.id, zx: z.x, zy: z.y, tempo: D.flug || 12, schaden: this.schadenVon(w), von: w.id, knall: 0, art: "blitz" });
    else this.treffer(z, this.schadenVon(w), w);
  }
  /** Auf ein Ziel zugehen und zuschlagen, sobald es in Reichweite ist */
  private jagen(w: Wesen, z: Wesen, reich: number): void {
    const d = abstand(w, z) - z.r;
    if (d <= reich && frei(w, z)) { w.pfad = []; w.blick = Math.atan2(z.y - w.y, z.x - w.x); if (w.cdA <= 0) this.angriff(w, z); return; }
    w.neuWeg -= DT; if (w.neuWeg <= 0 || !w.pfad.length) { w.pfad = weg(w, z); w.neuWeg = 0.3; }
  }
  private naechsterGegner(w: Wesen, weit: number): Wesen | null {
    let best: Wesen | null = null, bd = weit; for (const o of this.wesen) { if (o.tot || o.team === w.team) continue; const d = abstand(w, o); if (d < bd && frei(w, o)) { bd = d; best = o; } } return best;
  }

  /** Ein Rechenschritt (DT Sekunden) */
  schritt(): void {
    this.tick++; if (this.phase !== "lauf") return; this.zeit += DT;
    for (const w of this.wesen) {
      if (w.tot) { if (w.held) { w.wieder -= DT; if (w.wieder <= 0) { w.tot = false; w.lp = w.max; const p = START[w.bot ? 1 : 0]; w.x = p.x; w.y = p.y; w.pfad = []; w.zielId = 0; } } continue; }
      w.cdA = Math.max(0, w.cdA - DT); w.cdQ = Math.max(0, w.cdQ - DT); w.cdE = Math.max(0, w.cdE - DT); w.bollwerk = Math.max(0, w.bollwerk - DT);
      if (w.betaeubt > 0) { w.betaeubt = Math.max(0, w.betaeubt - DT); continue; }
      let ziel = w.zielId ? this.nach(w.zielId) : undefined; if (ziel && ziel.tot) { ziel = undefined; w.zielId = 0; }
      if (w.held) {
        const D = HELDEN[w.typ];
        if (w.bot) { // der Begleiter: bleibt beim Spieler, greift dessen Ziel oder den nächsten Gegner an
          const f = this.nach(w.fuehrer); const fz = f && f.zielId ? this.nach(f.zielId) : undefined;
          if (!ziel) ziel = (fz && !fz.tot ? fz : this.naechsterGegner(w, K.SICHT)) || undefined; w.zielId = ziel ? ziel.id : 0;
          if (f && !f.tot && abstand(w, f) > 7) { ziel = undefined; w.zielId = 0; }
          if (ziel) { if (!D.nah && abstand(w, ziel) < 2.2) { const weg0 = Math.atan2(w.y - ziel.y, w.x - ziel.x); w.pfad = [naechstFrei({ x: w.x + Math.cos(weg0) * 2, y: w.y + Math.sin(weg0) * 2 })]; } else this.jagen(w, ziel, D.reich);
            if (w.typ === "elementarist" && w.cdQ <= 0 && abstand(w, ziel) < K.FEUER.reich && frei(w, ziel)) this.faehigkeit(w, "q", ziel);
            if (w.typ === "schildwaechter" && w.cdQ <= 0 && abstand(w, ziel) < K.STOSS.weite) this.faehigkeit(w, "q", ziel); }
          else if (f && !f.tot && abstand(w, f) > 2.4) { w.neuWeg -= DT; if (w.neuWeg <= 0) { w.pfad = weg(w, { x: f.x - Math.cos(f.blick) * 1.2, y: f.y - Math.sin(f.blick) * 1.2 }); w.neuWeg = 0.4; } }
        } else { // der Held des Spielers: Er läuft nur, wohin gesteuert wird. Ein gewähltes Ziel greift er an, sobald und solange es in Reichweite ist.
          const faehrt = w.rx !== 0 || w.ry !== 0;
          if (faehrt) { w.x += w.rx * D.tempo * DT; w.y += w.ry * D.tempo * DT; w.blick = Math.atan2(w.ry, w.rx); }
          if (ziel) { if (abstand(w, ziel) - ziel.r <= D.reich && frei(w, ziel)) { w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x); if (w.cdA <= 0) this.angriff(w, ziel); } }
          else if (!faehrt && !w.pfad.length) { const o = this.naechsterGegner(w, D.nah ? 2.2 : D.reich); if (o && w.cdA <= 0) this.angriff(w, o); } // wer steht und kein Ziel hat, wehrt sich von selbst
        }
      } else {
        const D = MONSTER[w.typ]; if (ziel && (abstand(ziel, w.heim) > K.LEINE || ziel.tot)) { ziel = undefined; w.zielId = 0; }
        if (!ziel) { const o = this.naechsterGegner(w, K.AGGRO); if (o && abstand(o, w.heim) <= K.LEINE) { ziel = o; w.zielId = o.id; } }
        if (D.boss) { // Flächenschlag mit Ankündigung
          if (w.warn > 0) { w.warn -= DT; w.pfad = []; if (w.warn <= 0) { this.ev.push({ a: "knall", x: w.warnX, y: w.warnY, r: K.BOSS_SCHLAG.r }); for (const o of this.wesen) if (!o.tot && o.team !== w.team && Math.hypot(o.x - w.warnX, o.y - w.warnY) < K.BOSS_SCHLAG.r + o.r) this.treffer(o, K.BOSS_SCHLAG.schaden, w); } continue; }
          if (ziel) { w.schlag -= DT; if (w.schlag <= 0) { w.schlag = K.BOSS_SCHLAG.alle; w.warn = K.BOSS_SCHLAG.warn; w.warnX = ziel.x; w.warnY = ziel.y; this.ev.push({ a: "warn", x: ziel.x, y: ziel.y, r: K.BOSS_SCHLAG.r, t: K.BOSS_SCHLAG.warn }); continue; } } }
        if (ziel) this.jagen(w, ziel, D.reich);
        else if (abstand(w, w.heim) > 0.3) { w.neuWeg -= DT; if (w.neuWeg <= 0 || !w.pfad.length) { w.pfad = weg(w, w.heim); w.neuWeg = 1; } }
        else if (w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * 0.15 * DT);
      }
      // laufen
      if (w.pfad.length) { let rest = (w.held ? HELDEN[w.typ].tempo : MONSTER[w.typ].tempo) * DT;
        while (rest > 0 && w.pfad.length) { const p = w.pfad[0], d = abstand(w, p); if (d <= rest) { w.x = p.x; w.y = p.y; rest -= d; w.pfad.shift(); } else { w.blick = Math.atan2(p.y - w.y, p.x - w.x); w.x += (p.x - w.x) / d * rest; w.y += (p.y - w.y) / d * rest; rest = 0; } } }
    }
    // niemand steht ineinander
    for (let i = 0; i < this.wesen.length; i++) for (let j = i + 1; j < this.wesen.length; j++) { const a = this.wesen[i], b = this.wesen[j]; if (a.tot || b.tot) continue; const d = abstand(a, b), soll = a.r + b.r; if (d < soll && d > 1e-4) { const s = (soll - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d; a.x -= dx * s; a.y -= dy * s; b.x += dx * s; b.y += dy * s; } }
    for (const w of this.wesen) if (!w.tot) schieben(w);
    // Geschosse
    for (const g of this.geschosse) { const z = g.zielId ? this.nach(g.zielId) : undefined; if (z && !z.tot) { g.zx = z.x; g.zy = z.y; }
      const d = Math.hypot(g.zx - g.x, g.zy - g.y), s = g.tempo * DT;
      if (d > s) { g.x += (g.zx - g.x) / d * s; g.y += (g.zy - g.y) / d * s; if (g.knall && !begehbar(g.x, g.y)) { g.zx = g.x; g.zy = g.y; } else continue; }
      g.tempo = 0; const von = this.nach(g.von);
      if (g.knall) { this.ev.push({ a: "knall", x: g.zx, y: g.zy, r: g.knall }); for (const o of this.wesen) if (!o.tot && von && o.team !== von.team && Math.hypot(o.x - g.zx, o.y - g.zy) < g.knall + o.r) this.treffer(o, g.schaden, von); }
      else if (z && !z.tot) this.treffer(z, g.schaden, von); }
    this.geschosse = this.geschosse.filter((g) => g.tempo > 0);
  }

  /** Der Zustand für den Client (kompakt). Die Ereignisse seit dem letzten Abruf sind enthalten und werden danach geleert. */
  zustand(): Zustand {
    const r = (v: number) => Math.round(v * 100) / 100, h = this.ich, ev = this.ev; this.ev = [];
    return { tick: this.tick, phase: this.phase, zeit: Math.round(this.zeit * 10) / 10, splitter: this.splitter, besiegt: this.besiegt, monster: this.wesen.filter((w) => !w.held).length,
      w: this.wesen.filter((w) => w.held || !w.tot).map((w) => [w.id, w.held ? 1 : 0, w.typ, w.team, r(w.x), r(w.y), r(w.blick), Math.round(w.lp), w.max, w.stufe, w.tot ? 1 : 0, w.bollwerk > 0 ? 1 : 0, w.betaeubt > 0 ? 1 : 0, w.xp]),
      g: this.geschosse.map((g) => [g.id, r(g.x), r(g.y), g.art]), ev, ich: { id: h.id, cdQ: r(h.cdQ), cdE: r(h.cdE), zielId: h.zielId, wieder: r(Math.max(0, h.wieder)) } };
  }
}
