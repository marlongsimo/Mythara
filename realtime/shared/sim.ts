/*
 * Mythara Echtzeit – die Spielsimulation (Kampfsystem 0.1). Sie allein entscheidet über Bewegung, Treffer, Schaden und Tod.
 * Der Server lässt sie laufen und schickt Zustände an den Client; ohne Server kann der Browser sie ersatzweise selbst rechnen.
 * Kein Zugriff auf Browser, Netz oder Uhr: nur Zustand + Eingaben + Zeitschritt. Alle Zahlen stehen in config.ts.
 *
 * Reihenfolge bei jedem Angriff (siehe treffen): 1 prüfen (Reichweite, Sicht) · 2 Trefferwurf · 3 Schadenswurf · 4 Boni · 5 Block und Schutz · 6 Leben
 */
import { DT, HELDEN, MONSTER, K, HELDENREIHE, Modus, Schadensart, STAERKE, HELDENSTUFE, HELDENEP, STUFENBONUS, stufeAusEp } from "./config";
const SB = (w: { held: boolean; typ: string }) => STUFENBONUS(w.held ? HELDENSTUFE[w.typ] || 1 : 1);
import { karteJetzt, karteNehmen, KartenStand, SchleuseStand, Punkt, START, LAGER, abstand, frei, schieben, weg, naechstFrei, begehbar } from "./karte";

export type Taste = "q" | "e" | "r";
export type Eingabe =
  | { t: "richtung"; x: number; y: number }  // direkt steuern: Laufrichtung in der Welt (Länge 0 bis 1), 0/0 = stehen bleiben
  | { t: "lauf"; x: number; y: number }      // zu einem Punkt laufen (Wegsuche)
  | { t: "ziel"; id: number }                // Ziel wählen: Gegner (angreifen in Reichweite) oder im Heilmodus ein Verbündeter; id 0 = kein Ziel
  | { t: "faehig"; taste: Taste; x: number; y: number } // Fähigkeit in Richtung des Punktes
  | { t: "modus" }                           // Kippschalter: zwischen erster und zweiter Waffe wechseln
  | { t: "halt" }
  | { t: "neu" };

interface Dauer { t: number; jeSek: number; von: number; art: "blut" | "gift" | "brand" }
interface Spec { grund: number; min?: number; /* Höchst- und Mindestschaden; ohne min: FAEHIG_MIN × grund */ art: Schadensart; flaeche?: boolean; wucht?: boolean; sicher?: boolean; mal?: number; untot?: number; nach?: string } // sicher: kein Trefferwurf (räumlich getroffen)
export interface Wesen { cdS: number; ladeT: number; ladeX: number; ladeY: number; /* Spezialangriff: Pause, Rest der Ladezeit, Zielfläche */ id: number; held: boolean; typ: string; team: number; bot: boolean; x: number; y: number; r: number; blick: number; lp: number; max: number;
  pfad: Punkt[]; zielId: number; cdA: number; cdQ: number; cdE: number; cdR: number; cdM: number; modus: number; tot: boolean; wieder: number; heim: Punkt; gruppe: number; neuWeg: number; rx: number; ry: number; fuehrer: number;
  aushol: number; ausholZiel: number; bollwerk: number; betaeubt: number; langsamT: number; langsamF: number; dauer: Dauer[]; dauerRest: number; malT: number; bruchT: number; bruchSperre: number; festSperre: number;
  schutz: number; schutzT: number; mrPlusT: number; spottT: number; spottId: number; giftHiebe: number; ruhe: number; wach: boolean }
export interface Geschoss { id: number; x: number; y: number; zielId: number; zx: number; zy: number; tempo: number; von: number; spec: Spec; knall: number; art: string }
export type Ereignis = { a: "schaden"; id: number; n: number; art?: string } | { a: "null"; id: number } | { a: "block"; id: number } | { a: "heil"; id: number; n: number } | { a: "hieb"; id: number } | { a: "aushol"; id: number; t: number } | { a: "ep"; x: number; y: number; n: number } | { a: "stufe"; id: number; s: number } | { a: "schleuse"; x: number; y: number } | { a: "auftauchen"; id: number; x: number; y: number } | { a: "laden"; id: number; x: number; y: number; r: number; t: number } | { a: "speien"; id: number; x: number; y: number; r: number } | { a: "anlegen"; id: number; t: number }
  | { a: "knall"; x: number; y: number; r: number; farbe: string } | { a: "tot"; id: number } | { a: "splitter"; x: number; y: number; n: number } | { a: "stoss"; id: number } | { a: "text"; id: number; t: string };
/* Merkmale je Wesen im Zustand, als Bits */
export const BIT = { bollwerk: 1, betaeubt: 2, langsam: 4, dauer: 8, mal: 16, schild: 32, aushol: 64, schutz: 128 };
export interface Zustand { tick: number; phase: "lauf" | "sieg"; zeit: number; splitter: number; besiegt: number; monster: number;
  w: Array<[number, number, string, number, number, number, number, number, number, number, number, number, number]>; // id, held, typ, team, x, y, blick, lp, max, bits, tot, schutz, modus
  g: Array<[number, number, number, string]>; b?: Array<[number, number, number, number]>; /* Beute am Boden: id, x, y, Anzahl */ ev: Ereignis[]; st?: Record<string, [number, number]>; sl?: [number, number, number, number]; /* Schleuse: x, y, offen (1/0), Fortschritt beim Schließen 0–1 */ /* Stufe und Erfahrung je Held im Team */ ich: { id: number; cdQ: number; cdE: number; cdR: number; zielId: number; wieder: number; modus: number; stufe?: number; ep?: number } }

export class Sim {
  tick = 0; zeit = 0; phase: "lauf" | "sieg" = "lauf"; splitter = 0; besiegt = 0; monsterZahl = 0;
  wesen: Wesen[] = []; geschosse: Geschoss[] = []; ev: Ereignis[] = []; beute: { id: number; x: number; y: number; n: number }[] = [];
  private lauf = 1; private zs: number; private begleiter: string[];
  /** heldTyp: der Held des Spielers. begleiter: bis zu zwei weitere Helden, die der Rechner spielt. */
  /* eigene Karte, Gegnerstärke und Heldenstufen dieser Partie (beim Anlegen übernommen, vor jedem Schritt wieder eingesetzt) */
  /* Schleuse dieses Kampfes (oder keine): offen, Fortschritt beim Schließen, Zeit bis zur nächsten Welle */
  sl: (SchleuseStand & { offen: boolean; fort: number; warte: number; raus: number }) | null = null;
  /* Brut (Laich): je Mutter die Zeit bis zum nächsten Jungen, wie viele schon geschlüpft sind, und die Kennungen der Jungen */
  private brut = new Map<number, { t: number; n: number; junge: number[] }>();
  private karte: KartenStand = karteJetzt(); private staerke = { ...STAERKE }; private stufen: Record<string, number> = { ...HELDENSTUFE }; private epStand: Record<string, number> = { ...HELDENEP };
  private bereit(): void { karteNehmen(this.karte); Object.assign(STAERKE, this.staerke); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; Object.assign(HELDENSTUFE, this.stufen); }
  constructor(public heldTyp = "schildwaechter", seed = 1, begleiter: string[] = []) { this.zs = (seed >>> 0) || 1; if (!HELDEN[this.heldTyp]) this.heldTyp = "schildwaechter";
    this.begleiter = (Array.isArray(begleiter) ? begleiter : []).filter((b, i, l) => HELDEN[b] && b !== this.heldTyp && l.indexOf(b) === i).slice(0, 2); this.aufbau(); }
  zf(): number { this.zs = (this.zs + 0x6d2b79f5) >>> 0; let t = this.zs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  private neu(held: boolean, typ: string, team: number, p: Punkt, bot: boolean, gruppe = 0): Wesen {
    const lp = held ? Math.round(HELDEN[typ].lp * (1 + STUFENBONUS(HELDENSTUFE[typ] || 1).lp)) : Math.round(MONSTER[typ].lp * STAERKE.lp);
    const w: Wesen = { id: this.lauf++, held, typ, team, bot, x: p.x, y: p.y, r: held ? K.R_HELD : MONSTER[typ].r, blick: 0, lp, max: lp, pfad: [], zielId: 0, cdA: 0, cdQ: 0, cdE: 0, cdR: 0, cdM: 0, cdS: 5, ladeT: 0, ladeX: 0, ladeY: 0, modus: 0, tot: false, wieder: 0, heim: { x: p.x, y: p.y }, gruppe, neuWeg: 0, rx: 0, ry: 0, fuehrer: 0,
      aushol: 0, ausholZiel: 0, bollwerk: 0, betaeubt: 0, langsamT: 0, langsamF: 0, dauer: [], dauerRest: 0, malT: 0, bruchT: 0, bruchSperre: 0, festSperre: 0, schutz: 0, schutzT: 0, mrPlusT: 0, spottT: 0, spottId: 0, giftHiebe: 0, ruhe: 99, wach: false };
    this.wesen.push(w); return w;
  }
  private aufbau(): void {
    this.wesen = []; this.geschosse = []; this.beute = []; this.tick = 0; this.zeit = 0; this.phase = "lauf"; this.splitter = 0; this.besiegt = 0; this.lauf = 1;
    const ich = this.neu(true, this.heldTyp, 0, START[0], false);
    this.begleiter.forEach((b, i) => { this.neu(true, b, 0, START[i + 1], true).fuehrer = ich.id; });
    for (const l of LAGER) this.neu(false, l.art, 1, l, true, l.gruppe); this.monsterZahl = LAGER.length;
    this.brut.clear(); const S0 = this.karte.SCHLEUSE; this.sl = S0 ? { ...S0, offen: true, fort: 0, warte: S0.erst, raus: 0 } : null;
  }
  get ich(): Wesen { return this.wesen[0]; }
  /** Erfahrung für jeden Helden im Team; wer dabei eine Stufe erreicht, wird sofort stärker und bekommt sein Leben ganz zurück */
  private erfahrung(n: number): void {
    for (const w of this.wesen) { if (!w.held || w.team !== 0) continue; const vor = this.stufen[w.typ] || 1; this.epStand[w.typ] = (this.epStand[w.typ] || 0) + n; const nach = Math.max(vor, stufeAusEp(this.epStand[w.typ]));
      if (nach <= vor) continue; this.stufen[w.typ] = nach; HELDENSTUFE[w.typ] = nach; w.max = Math.round(HELDEN[w.typ].lp * (1 + STUFENBONUS(nach).lp)); if (!w.tot) w.lp = w.max; this.ev.push({ a: "stufe", id: w.id, s: nach }); }
  }
  nach(id: number): Wesen | undefined { return this.wesen.find((w) => w.id === id); }
  private wert(w: Wesen) { return w.held ? HELDEN[w.typ] : MONSTER[w.typ]; }
  /** Der Angriff, der gerade gilt: beim Helden der gewählte Waffenmodus */
  waffe(w: Wesen): Modus | { art: Schadensart; schaden: [number, number]; takt: number; reich: number; aushol: number } { return w.held ? HELDEN[w.typ].modi[w.modus] : MONSTER[w.typ].angriff; }
  private tempo(w: Wesen): number { return this.wert(w).tempo * (w.langsamT > 0 ? 1 - w.langsamF : 1) * (w.held && HELDEN[w.typ].modi[w.modus].schild ? K.BLOCK.tempo : 1); }
  private feinde(w: Wesen): Wesen[] { return this.wesen.filter((o) => !o.tot && o.team !== w.team); }
  private freunde(w: Wesen): Wesen[] { return this.wesen.filter((o) => !o.tot && o.team === w.team); }
  private untot(w: Wesen): boolean { return !w.held && Boolean(MONSTER[w.typ].untot); }

  /** Eine Eingabe des Spielers. Alles wird geprüft und begrenzt – der Client bestimmt nie ein Ergebnis. */
  eingabe(e: Eingabe): void { this.bereit();
    const h = this.ich; if (!e || typeof e !== "object") return;
    if (e.t === "neu") { if (this.phase === "sieg") this.aufbau(); return; }
    if (h.tot || (this.phase !== "lauf" && !STAERKE.beute)) return;
    const zahl = (v: unknown) => typeof v === "number" && Number.isFinite(v);
    if (e.t === "richtung") { if (!zahl(e.x) || !zahl(e.y)) return; const l = Math.hypot(e.x, e.y); if (l < 0.05) { h.rx = 0; h.ry = 0; } else { const k = Math.min(1, l) / l; h.rx = e.x * k; h.ry = e.y * k; h.pfad = []; } }
    else if (e.t === "lauf") { if (!zahl(e.x) || !zahl(e.y)) return; h.zielId = 0; h.rx = 0; h.ry = 0; h.pfad = weg(h, { x: e.x, y: e.y }); }
    else if (e.t === "ziel") { if (e.id === 0) { h.zielId = 0; return; } const z = this.nach(e.id); if (!z || z.tot) return; const heilt = this.waffe(h).art === "heil"; if (z.team !== h.team ? !heilt : heilt) h.zielId = z.id; }
    else if (e.t === "modus") this.wechsel(h);
    else if (e.t === "halt") { h.pfad = []; h.zielId = 0; h.rx = 0; h.ry = 0; }
    else if (e.t === "faehig") { if ((e.taste !== "q" && e.taste !== "e" && e.taste !== "r") || !zahl(e.x) || !zahl(e.y)) return; this.faehigkeit(h, e.taste, { x: e.x, y: e.y }); }
  }
  private wechsel(w: Wesen): void { if (w.cdM > 0 || w.aushol > 0 || w.betaeubt > 0) return; w.modus = w.modus ? 0 : 1; w.cdM = K.WECHSEL; w.zielId = 0; w.cdA = Math.max(w.cdA, 0.25); }

  /* ---------- Treffen und Schaden ---------- */
  private heilen(z: Wesen, menge: number): void { if (z.tot) return; const v = z.lp; z.lp = Math.min(z.max, z.lp + Math.round(menge)); if (z.lp > v) this.ev.push({ a: "heil", id: z.id, n: z.lp - v }); }
  private schutzGeben(z: Wesen, punkte: number, dauer: number): void { z.schutz = Math.max(z.schutz, punkte); z.schutzT = dauer; }
  /** Direkter Schaden ohne Würfe (Gift, Blutung, Brand, heiliges Licht): nur Schutzpunkte fangen ihn ab */
  private abziehen(z: Wesen, menge: number, von: Wesen | undefined, art?: string): void {
    if (z.tot || menge <= 0) return; let m = Math.max(1, Math.round(menge));
    if (z.schutz > 0) { const a = Math.min(z.schutz, m); z.schutz -= a; m -= a; if (m <= 0) { this.ev.push({ a: "block", id: z.id }); return; } }
    z.lp -= m; z.ruhe = 0; this.ev.push(art ? { a: "schaden", id: z.id, n: m, art } : { a: "schaden", id: z.id, n: m });
    if (!z.held) { z.wach = true; if (von && von.held && !z.zielId) z.zielId = von.id; this.wecken(z); }
    if (z.lp > 0) return; z.lp = 0; z.tot = true; z.pfad = []; z.zielId = 0; z.dauer = []; z.aushol = 0; this.ev.push({ a: "tot", id: z.id });
    if (z.held) { z.wieder = K.WIEDER_HELD; return; }
    this.besiegt++; const B = STAERKE.beute, [a, b] = B || K.SPLITTER; let n = a + Math.floor(this.zf() * (b - a + 1)); if (B && MONSTER[z.typ].boss) n *= STAERKE.bossMal;
    if (STAERKE.ep > 0) { const e = Math.max(1, Math.round(MONSTER[z.typ].lp * STAERKE.ep / 10)); this.ev.push({ a: "ep", x: z.x, y: z.y, n: e }); this.erfahrung(e); }
    if (B) this.beute.push({ id: this.lauf++, x: z.x, y: z.y, n }); /* bleibt liegen, bis ein Held darüberläuft */ else { this.splitter += n; this.ev.push({ a: "splitter", x: z.x, y: z.y, n }); }
    if (this.besiegt >= this.monsterZahl && !(this.sl && this.sl.offen)) this.phase = "sieg"; /* bei offener Schleuse kommen noch welche */
  }
  /** Ein Angriff trifft auf ein Ziel. Zurück: Schaden (0 = abgewehrt oder verfehlt). */
  treffen(von: Wesen, z: Wesen, s: Spec): number {
    if (z.tot) return 0;
    // Schild und Bollwerk: von vorn wird Torvald seltener getroffen; Verbündete direkt hinter einem Bollwerk ebenso
    let minder = 0; const winkel = (a: number, b: number) => { let d = Math.abs(a - b) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d; return d; };
    if (z.held && HELDEN[z.typ].modi[z.modus].schild) { if (winkel(Math.atan2(von.y - z.y, von.x - z.x), z.blick) <= K.BLOCK.winkel * Math.PI / 180) minder = K.BLOCK[s.art] + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0); }
    else if (z.held) { const t = this.freunde(z).find((o) => o.bollwerk > 0 && o !== z && abstand(o, z) <= 1.8); if (t && winkel(Math.atan2(von.y - t.y, von.x - t.x), Math.atan2(z.y - t.y, z.x - t.x)) > Math.PI / 2) minder = K.BOLLWERK.hinter; }
    minder = Math.min(K.MINDERUNG_MAX, minder);
    // 2 Trefferwurf: Angriffswert des Angreifers gegen den Verteidigungswert des Ziels für diese Angriffsart
    const wurf = !s.sicher && K.TREFFERWURF;
    if (wurf) {
      const a = (von.held ? HELDEN[von.typ].angriff : MONSTER[von.typ].angriffswert)[s.art] + SB(von).angriff;
      let d = this.wert(z).abwehr[s.art] + SB(z).abwehr; if (s.art === "magie") d += (z.mrPlusT > 0 ? K.SCHUTZKREIS.magie : 0) + (z.held && this.freunde(z).some((o) => o.typ === "lichtbringer" && abstand(o, z) <= K.BEISTAND.radius) ? K.BEISTAND.magie : 0); else if (z.bruchT > 0) d -= K.DURCHBRECHEN.abwehr;
      d = Math.max(0, d) / (1 - minder); // ein Block von 60 % heißt: der Verteidigungswurf reicht 2,5-mal so hoch
      if (!(this.zf() * (a + 1) > this.zf() * (d + 1))) { this.ev.push(minder >= 0.4 ? { a: "block", id: z.id } : { a: "null", id: z.id }); if (!z.held) { z.wach = true; if (!z.zielId && von.held) z.zielId = von.id; this.wecken(z); } return 0; }
    }
    // 3 Schadenswurf zwischen Mindest- und Höchstschaden
    const min = s.min != null ? s.min : s.grund * K.FAEHIG_MIN; let m = (min + this.zf() * (s.grund - min)) * (1 + SB(von).schaden);
    // 4 Boni
    if (s.mal && z.malT > 0) m *= 1 + s.mal;
    if (s.wucht && !z.held && MONSTER[z.typ].anfaellig === "wucht") m *= 1 + K.WUCHT;
    if (s.untot && this.untot(z)) m *= 1 + s.untot;
    // 5 ohne Trefferwurf (Flächen, Sprünge) mindert der Schild stattdessen den Schaden
    if (!wurf && minder > 0) { m *= 1 - (s.flaeche ? Math.min(minder, K.BLOCK.flaeche + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0)) : minder); }
    // 6 Leben
    const vor = z.lp + z.schutz; this.abziehen(z, m, von); return Math.max(0, vor - (z.lp + z.schutz));
  }
  /** Wer ein Monster weckt, weckt seine Gruppe */
  private wecken(m: Wesen): void { if (!m.gruppe || !m.zielId) return; for (const o of this.wesen) if (!o.tot && !o.held && o.gruppe === m.gruppe && !o.zielId) { o.zielId = m.zielId; o.wach = true; } }
  private langsam(z: Wesen, f: number, t: number): void { if (f >= z.langsamF || z.langsamT <= 0) { z.langsamF = f; z.langsamT = Math.max(z.langsamT, t); } }
  private dauerSchaden(z: Wesen, art: Dauer["art"], jeSek: number, t: number, von: Wesen): void { const d = z.dauer.find((x) => x.art === art); if (d) { d.t = t; d.jeSek = Math.max(d.jeSek, jeSek); d.von = von.id; } else z.dauer.push({ t, jeSek, von: von.id, art }); }
  private stossen(z: Wesen, dx: number, dy: number, weite: number): void { const l = Math.hypot(dx, dy) || 1; for (let s = 0; s < weite; s += 0.15) { const nx = z.x + dx / l * 0.15, ny = z.y + dy / l * 0.15; if (!begehbar(nx + dx / l * z.r, ny + dy / l * z.r)) break; z.x = nx; z.y = ny; } schieben(z); z.pfad = []; z.aushol = 0; }
  private sprung(w: Wesen, richtung: number, weite: number, beiGegner?: (o: Wesen) => void): void {
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    for (let s = 0; s < weite; s += 0.15) { const nx = w.x + dx * 0.15, ny = w.y + dy * 0.15; if (!begehbar(nx + dx * w.r, ny + dy * w.r)) break; w.x = nx; w.y = ny;
      if (beiGegner) { const o = this.feinde(w).find((o) => abstand(w, o) < w.r + o.r + 0.15); if (o) { beiGegner(o); break; } } }
    schieben(w); w.pfad = [];
  }
  private flaeche(von: Wesen, ort: Punkt, radius: number, s: Spec, je?: (o: Wesen) => void): void { for (const o of this.feinde(von)) if (Math.hypot(o.x - ort.x, o.y - ort.y) <= radius + o.r) { this.treffen(von, o, Object.assign({ flaeche: true, sicher: true }, s)); if (je && !o.tot) je(o); } }
  /** Das Ziel einer gezielten Fähigkeit: das gewählte Ziel, sonst der Gegner am nächsten zum angegebenen Punkt, sonst der nächste überhaupt – immer in Reichweite und mit Sicht */
  private zielBei(w: Wesen, punkt: Punkt, reich: number): Wesen | null {
    const ok = (o: Wesen | undefined) => Boolean(o && !o.tot && o.team !== w.team && abstand(w, o) - o.r <= reich && frei(w, o)); const g = this.nach(w.zielId); if (ok(g)) return g as Wesen;
    let best: Wesen | null = null, bd = 2.5; for (const o of this.feinde(w)) { const d = Math.hypot(o.x - punkt.x, o.y - punkt.y); if (d < bd && ok(o)) { bd = d; best = o; } } if (best) return best;
    bd = reich + 1; for (const o of this.feinde(w)) { const d = abstand(w, o); if (d < bd && ok(o)) { bd = d; best = o; } } return best;
  }
  private schwaechster(w: Wesen, reich: number, unter = 1): Wesen | null { let best: Wesen | null = null, bq = unter; for (const o of this.freunde(w)) { const q = o.lp / o.max; if (q < bq && abstand(w, o) <= reich && (o === w || frei(w, o))) { bq = q; best = o; } } return best; }
  private schuss(von: Wesen, z: Wesen | null, ort: Punkt, tempo: number, spec: Spec, art: string, knall = 0): void { this.geschosse.push({ id: this.lauf++, x: von.x, y: von.y, zielId: z ? z.id : 0, zx: ort.x, zy: ort.y, tempo, von: von.id, spec, knall, art }); }

  /* ---------- Fähigkeiten ---------- */
  private faehigkeit(w: Wesen, taste: Taste, ziel: Punkt): boolean {
    if (w.tot || w.betaeubt > 0 || !w.held || w.aushol > 0) return false; const D = HELDEN[w.typ], cd = taste === "q" ? "cdQ" : taste === "e" ? "cdE" : "cdR"; if (w[cd] > 0) return false;
    const richtung = Math.atan2(ziel.y - w.y, ziel.x - w.x), nahBei = (reich: number): Punkt => { const d = Math.min(reich, abstand(w, ziel)); return { x: w.x + Math.cos(richtung) * d, y: w.y + Math.sin(richtung) * d }; };
    let ok = true;
    if (w.typ === "schildwaechter") {
      if (taste === "q") { w.blick = richtung; this.ev.push({ a: "stoss", id: w.id }); this.sprung(w, richtung, K.STOSS.weite, (o) => { this.treffen(w, o, { grund: K.STOSS.schaden, art: "nah", wucht: true, sicher: true }); if (!o.tot) this.stossen(o, Math.cos(richtung), Math.sin(richtung), K.STOSS.zurueck); w.zielId = o.id; }); }
      else if (taste === "e") w.bollwerk = K.BOLLWERK.dauer;
      else { const S = K.SCHILD_GRAUWACHT; for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius) { o.spottT = S.spott; o.spottId = w.id; o.zielId = w.id; o.wach = true; } for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.schutzGeben(o, S.schutz, S.schutzDauer); this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" }); }
    } else if (w.typ === "elementarist") {
      if (taste === "q") { const o = nahBei(K.FROST.reich); this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.FROST.radius, farbe: "eis" }); this.flaeche(w, o, K.FROST.radius, { grund: K.FROST.schaden, art: "magie" }, (g) => this.langsam(g, K.FROST.langsam, K.FROST.dauer)); }
      else if (taste === "e") { const o = nahBei(K.DONNER.reich); this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.DONNER.radius, farbe: "blitz" }); this.flaeche(w, o, K.DONNER.radius, { grund: K.DONNER.schaden, art: "magie" }, (g) => this.stossen(g, g.x - o.x || 0.01, g.y - o.y, K.DONNER.zurueck)); }
      else this.schuss(w, null, nahBei(K.GLUT.reich), K.GLUT.flug, { grund: K.GLUT.schaden, art: "magie", nach: "brand" }, "feuer", K.GLUT.radius);
    } else if (w.typ === "lichtbringer") {
      if (taste === "q") { const g = this.nach(w.zielId), z = g && !g.tot && g.team === w.team && abstand(w, g) <= K.WORT.reich ? g : this.schwaechster(w, K.WORT.reich); if (!z) ok = false; else this.heilen(z, K.WORT.heilung); }
      else if (taste === "e") { const S = K.SCHUTZKREIS; for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) { this.schutzGeben(o, S.schutz, S.dauer); o.mrPlusT = S.dauer; } this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" }); }
      else { const S = K.GOETTLICH; for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.heilen(o, o.max * S.anteil); for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius && this.untot(o)) this.abziehen(o, S.heilig, w, "licht"); this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" }); }
    } else if (w.typ === "assassine") {
      if (taste === "q") { const z = this.zielBei(w, ziel, K.STICH.weite); if (!z) ok = false; else { const hin = Math.atan2(z.y - w.y, z.x - w.x); let d = Math.abs(Math.atan2(w.y - z.y, w.x - z.x) - z.blick) % (2 * Math.PI); if (d > Math.PI) d = 2 * Math.PI - d; const hinten = d > Math.PI * 2 / 3;
          this.sprung(w, hin, Math.max(0, abstand(w, z) - w.r - z.r - 0.1)); w.blick = hin; this.ev.push({ a: "stoss", id: w.id }); this.treffen(w, z, { grund: K.STICH.schaden * (hinten ? 1 + K.STICH.hinten : 1), art: "nah", sicher: true }); if (hinten) this.ev.push({ a: "text", id: z.id, t: "von hinten" }); w.zielId = z.id; } }
      else if (taste === "e") { w.giftHiebe = K.GIFT.hiebe; this.ev.push({ a: "text", id: w.id, t: "Giftklinge" }); }
      else { const z = this.zielBei(w, ziel, K.HINRICHTUNG.reich); if (!z) ok = false; else { const H = K.HINRICHTUNG, mehr = z.lp / z.max < H.unter && !(MONSTER[z.typ] && MONSTER[z.typ].boss); w.blick = Math.atan2(z.y - w.y, z.x - w.x); this.ev.push({ a: "hieb", id: w.id }); this.treffen(w, z, { grund: H.schaden * (mehr ? 1 + H.plus : 1), art: "nah", sicher: true }); } }
    } else if (w.typ === "kopfgeldjaeger") {
      const z = this.zielBei(w, ziel, taste === "q" ? K.MAL.reich : HELDEN[w.typ].modi[0].reich); if (!z) ok = false;
      else if (taste === "q") { for (const o of this.wesen) o.malT = 0; z.malT = K.MAL.dauer; w.zielId = z.id; this.ev.push({ a: "text", id: z.id, t: "Jägermal" }); }
      else if (taste === "e") { w.blick = Math.atan2(z.y - w.y, z.x - w.x); this.schuss(w, z, z, 20, { grund: K.BOLZEN.schaden, art: "fern", mal: K.MAL.plus, nach: "laehmen" }, "bolzen"); }
      else { const E = K.ERLEGEN; w.blick = Math.atan2(z.y - w.y, z.x - w.x); this.schuss(w, z, z, 24, { grund: E.schaden * (z.lp / z.max < E.unter ? 1 + E.plus : 1), art: "fern", mal: E.mal, sicher: true }, "erlegen"); }
    }
    if (ok) w[cd] = D[taste].zeit * (1 - SB(w).abklingen); return ok;
  }

  /* ---------- Grundangriff ---------- */
  /** Angriff beginnen: Nahkämpfer treffen sofort, Fernkämpfer und Monster holen erst aus */
  private angriff(w: Wesen, z: Wesen): void {
    const A = this.waffe(w); if (w.held && (A as Modus).schild) return; /* mit erhobenem Schild wird nicht angegriffen */ w.cdA = A.takt; w.blick = Math.atan2(z.y - w.y, z.x - w.x);
    const aus = w.held ? (A.art === "nah" ? 0 : K.AUSHOLEN_FERN) : (A as { aushol: number }).aushol;
    if (aus > 0) { w.aushol = aus; w.ausholZiel = z.id; w.pfad = []; this.ev.push({ a: w.held ? "anlegen" : "aushol", id: w.id, t: aus }); } /* Monster: sichtbare Warnung; Helden: die Schuss- oder Heilbewegung beginnt */ else this.ausloesen(w, z);
  }
  private ausloesen(w: Wesen, z: Wesen): void {
    const A = this.waffe(w); this.ev.push({ a: "hieb", id: w.id });
    if (A.art === "heil") { if (z.team === w.team && abstand(w, z) <= A.reich + 1) this.heilen(z, A.schaden[0] + this.zf() * (A.schaden[1] - A.schaden[0])); return; }
    if (z.tot || abstand(w, z) - z.r > A.reich + (w.held ? 0.6 : 0.35) || !frei(w, z)) return; // wer inzwischen weg ist, wird nicht getroffen
    const M = w.held ? (A as Modus) : null, spec: Spec = { grund: A.schaden[1] * (w.held ? 1 : STAERKE.schaden), min: A.schaden[0] * (w.held ? 1 : STAERKE.schaden), art: A.art as Schadensart, wucht: Boolean(M && M.wucht), untot: M ? M.untot : 0, mal: w.typ === "kopfgeldjaeger" ? K.MAL.plus : 0 };
    if (w.held && A.art !== "nah") { spec.nach = w.typ === "kopfgeldjaeger" && w.modus === 0 ? "durchbrechen" : ""; this.schuss(w, z, z, (A as Modus).flug || 14, spec, A.art === "magie" ? "blitz" : "bolzen"); return; }
    const n = this.treffen(w, z, spec); if (n > 0 && !z.tot) this.nachTreffer(w, z, w.typ === "schildwaechter" ? (w.modus === 0 ? "festnageln" : "schildhieb") : w.typ === "assassine" && w.modus === 0 ? "dolch" : w.typ === "elementarist" ? "rueckstoss" : "");
  }
  /** Was ein Treffer zusätzlich auslöst */
  private nachTreffer(von: Wesen, z: Wesen, was: string): void {
    if (was === "festnageln") { if (z.festSperre <= 0) { this.langsam(z, K.FESTNAGELN.langsam, K.FESTNAGELN.dauer); z.festSperre = K.FESTNAGELN.sperre; } }
    else if (was === "schildhieb") { z.aushol = 0; z.cdA = Math.max(z.cdA, 0.5); }
    else if (was === "dolch") { this.dauerSchaden(z, "blut", K.NACHBLUTEN.jeSek, K.NACHBLUTEN.dauer, von); if (von.giftHiebe > 0) { von.giftHiebe--; this.dauerSchaden(z, "gift", K.GIFT.jeSek, K.GIFT.dauer, von); } }
    else if (was === "rueckstoss") this.stossen(z, z.x - von.x, z.y - von.y, 0.6);
    else if (was === "durchbrechen") { if (z.bruchSperre <= 0) { z.bruchT = K.DURCHBRECHEN.dauer; z.bruchSperre = K.DURCHBRECHEN.sperre; } }
    else if (was === "laehmen") this.langsam(z, K.BOLZEN.langsam, K.BOLZEN.dauer);
  }
  /** Auf ein Ziel zugehen und angreifen, sobald es in Reichweite ist (Monster und Begleiter) */
  private jagen(w: Wesen, z: Wesen, reich: number): void {
    const d = abstand(w, z) - z.r;
    if (d <= reich && frei(w, z)) { w.pfad = []; w.blick = Math.atan2(z.y - w.y, z.x - w.x); if (w.cdA <= 0) this.angriff(w, z); return; }
    w.neuWeg -= DT; if (w.neuWeg <= 0 || !w.pfad.length) { w.pfad = weg(w, z); w.neuWeg = 0.3; }
  }
  private naechsterGegner(w: Wesen, weit: number): Wesen | null { let best: Wesen | null = null, bd = weit; for (const o of this.feinde(w)) { const d = abstand(w, o); if (d < bd && frei(w, o)) { bd = d; best = o; } } return best; }

  /* ---------- Begleiter (vom Rechner gespielte Helden) ---------- */
  private begleiterZug(w: Wesen): void {
    const f = this.nach(w.fuehrer), D = HELDEN[w.typ]; let ziel: Wesen | undefined;
    const folgen = () => { if (f && !f.tot && abstand(w, f) > 2.4) { w.neuWeg -= DT; if (w.neuWeg <= 0) { w.pfad = weg(w, { x: f.x - Math.cos(f.blick) * 1.2, y: f.y - Math.sin(f.blick) * 1.2 }); w.neuWeg = 0.4; } } };
    /* Gefahr am Boden: Lädt ein Gegner einen Flächenangriff und der Begleiter steht darin, läuft er auf dem kürzesten Weg hinaus – in Richtung des Anführers, wenn der schon draußen ist. */
    for (const g of this.wesen) { if (g.held || g.tot || g.ladeT <= 0) continue; const S = MONSTER[g.typ].spezial!, d = Math.hypot(w.x - g.ladeX, w.y - g.ladeY), rand = S.radius + w.r + 0.5; if (d >= rand) continue;
      let wx = w.x - g.ladeX, wy = w.y - g.ladeY; if (f && !f.tot && Math.hypot(f.x - g.ladeX, f.y - g.ladeY) > rand) { wx = f.x - g.ladeX; wy = f.y - g.ladeY; } const l = Math.hypot(wx, wy) || 1;
      w.neuWeg -= DT; if (w.neuWeg <= 0 || !w.pfad.length) { w.pfad = weg(w, naechstFrei({ x: g.ladeX + wx / l * (rand + 0.8), y: g.ladeY + wy / l * (rand + 0.8) })); w.neuWeg = 0.5; } w.zielId = 0; return; }
    if (f && !f.tot && abstand(w, f) > 8) { w.zielId = 0; folgen(); return; }
    if (w.typ === "lichtbringer") { // heilen, wer es braucht; sonst mit dem Streitkolben helfen
      const v = this.schwaechster(w, 12, 0.92), feind = this.naechsterGegner(w, 2.6);
      if (v && v.lp / v.max < 0.6 && w.cdQ <= 0 && abstand(w, v) <= K.WORT.reich) { w.zielId = v.id; this.faehigkeit(w, "q", v); }
      if (w.cdR <= 0 && this.freunde(w).filter((o) => o.lp / o.max < 0.45 && abstand(w, o) <= K.GOETTLICH.radius).length >= (this.freunde(w).length > 1 ? 2 : 1)) this.faehigkeit(w, "r", w);
      if (feind && w.cdE <= 0 && w.lp / w.max < 0.8) this.faehigkeit(w, "e", w);
      if (v) { if (w.modus !== 0) this.wechsel(w); if (w.modus === 0) { if (abstand(w, v) > D.modi[0].reich - 0.5) { w.neuWeg -= DT; if (w.neuWeg <= 0) { w.pfad = weg(w, v); w.neuWeg = 0.3; } } else { w.pfad = []; if (w.cdA <= 0 && w.aushol <= 0) this.angriff(w, v); } } return; }
      if (feind) { if (w.modus !== 1) this.wechsel(w); if (w.modus === 1) this.jagen(w, feind, D.modi[1].reich); return; }
      folgen(); return;
    }
    const fz = f && f.zielId ? this.nach(f.zielId) : undefined; ziel = w.zielId ? this.nach(w.zielId) : undefined; if (ziel && (ziel.tot || ziel.team === w.team)) ziel = undefined;
    if (!ziel) ziel = (fz && !fz.tot && fz.team !== w.team ? fz : this.naechsterGegner(w, K.SICHT)) || undefined; w.zielId = ziel ? ziel.id : 0;
    if (!ziel) { folgen(); return; }
    const d = abstand(w, ziel);
    if (w.typ === "schildwaechter") { const soll = w.lp / w.max < 0.35 ? 1 : w.lp / w.max > 0.6 ? 0 : w.modus; if (w.modus !== soll) this.wechsel(w); if (w.modus === 1) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x); /* angeschlagen: Schild hoch, bis er sich erholt hat */ if (w.cdQ <= 0 && d < K.STOSS.weite && d > 1.2) this.faehigkeit(w, "q", ziel); if (w.cdE <= 0 && w.modus === 1) this.faehigkeit(w, "e", ziel); if (w.cdR <= 0 && this.feinde(w).filter((o) => abstand(w, o) < 5 && o.zielId && o.zielId !== w.id).length >= 2) this.faehigkeit(w, "r", w); }
    else if (w.typ === "elementarist") { if (d < 8 && frei(w, ziel)) { const viele = this.feinde(w).filter((o) => abstand(o, ziel as Wesen) < 2.5).length; if (w.cdR <= 0 && viele >= 2) this.faehigkeit(w, "r", ziel); if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel); if (w.cdE <= 0 && d < 7) this.faehigkeit(w, "e", ziel); } }
    else if (w.typ === "assassine") { if (w.cdE <= 0 && d < 3) this.faehigkeit(w, "e", ziel); if (w.cdQ <= 0 && d < K.STICH.weite && d > 1.4) this.faehigkeit(w, "q", ziel); if (w.cdR <= 0 && d < K.HINRICHTUNG.reich && ziel.lp / ziel.max < 0.6) this.faehigkeit(w, "r", ziel); }
    else if (w.typ === "kopfgeldjaeger") { if (d < 9 && frei(w, ziel)) { if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel); if (w.cdE <= 0) this.faehigkeit(w, "e", ziel); if (w.cdR <= 0 && ziel.lp > 60) this.faehigkeit(w, "r", ziel); } }
    const A = D.modi[w.modus];
    if (A.art !== "nah" && d < 2.4 && w.aushol <= 0) { const fort = Math.atan2(w.y - ziel.y, w.x - ziel.x); w.pfad = [naechstFrei({ x: w.x + Math.cos(fort) * 2.5, y: w.y + Math.sin(fort) * 2.5 })]; return; } // Fernkämpfer weichen zurück
    this.jagen(w, ziel, A.reich - (A.art === "nah" ? 0 : 0.5));
  }

  /* ---------- ein Rechenschritt (DT Sekunden) ---------- */
  schritt(): void { this.bereit();
    this.tick++; if (this.phase !== "lauf" && !STAERKE.beute) return; if (this.phase === "lauf") this.zeit += DT;
    if (this.beute.length) this.beute = this.beute.filter((b) => { const h = this.wesen.find((w) => w.held && !w.tot && Math.hypot(w.x - b.x, w.y - b.y) < 0.9); if (!h) return true; this.splitter += b.n; this.ev.push({ a: "splitter", x: b.x, y: b.y, n: b.n }); return false; });
    for (const w of this.wesen) {
      if (w.tot) { if (w.held) { w.wieder -= DT; if (w.wieder <= 0) { w.tot = false; w.lp = w.max; const p = START[Math.max(0, this.wesen.filter((o) => o.held).indexOf(w))] || START[0]; w.x = p.x; w.y = p.y; w.pfad = []; w.zielId = 0; w.ruhe = 99; } } continue; }
      for (const k of ["cdA", "cdQ", "cdE", "cdR", "cdM", "cdS", "bollwerk", "langsamT", "malT", "bruchT", "bruchSperre", "festSperre", "mrPlusT", "spottT"] as const) if (w[k] > 0) w[k] = Math.max(0, w[k] - DT);
      if (w.schutzT > 0) { w.schutzT -= DT; if (w.schutzT <= 0) w.schutz = 0; }
      // Gift, Blutung, Brand: läuft weiter, wird alle halbe Sekunde abgezogen
      if (w.dauer.length) { for (const d of w.dauer) { w.dauerRest += d.jeSek * DT; d.t -= DT; } const art = w.dauer[0].art, von = this.nach(w.dauer[0].von); w.dauer = w.dauer.filter((d) => d.t > 0); if (w.dauerRest >= 3 || !w.dauer.length) { const n = w.dauerRest; w.dauerRest = 0; this.abziehen(w, n, von, art); if (w.tot) continue; } }
      // Erholung
      w.ruhe += DT; if (w.held && w.ruhe >= K.ERHOLUNG.nach && w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * K.ERHOLUNG.jeSek * DT);
      if (w.betaeubt > 0) { w.betaeubt = Math.max(0, w.betaeubt - DT); continue; }
      if (w.ladeT > 0) { w.ladeT -= DT; if (w.ladeT <= 0) { const S = MONSTER[w.typ].spezial!; this.ev.push({ a: "speien", id: w.id, x: w.ladeX, y: w.ladeY, r: S.radius }); this.flaeche(w, { x: w.ladeX, y: w.ladeY }, S.radius, { grund: S.schaden[1] * STAERKE.schaden, min: S.schaden[0] * STAERKE.schaden, art: S.art }); w.cdS = S.alle; } continue; } // wer lädt, steht
      if (w.aushol > 0) { w.aushol -= DT; if (w.aushol <= 0) { const z = this.nach(w.ausholZiel); if (z) this.ausloesen(w, z); } continue; } // wer ausholt, steht
      let ziel = w.zielId ? this.nach(w.zielId) : undefined; if (ziel && ziel.tot) { ziel = undefined; w.zielId = 0; }
      if (!w.held && MONSTER[w.typ].fest) { const B = MONSTER[w.typ].brut; if (B) this.brueten(w, B); continue; } /* Laich: bewegt sich nicht, greift nicht an, brütet */
      if (!w.held) {
        const D = MONSTER[w.typ]; if (w.spottT > 0) { const s = this.nach(w.spottId); if (s && !s.tot) { ziel = s; w.zielId = s.id; } }
        if (ziel && abstand(ziel, w.heim) > K.LEINE && w.spottT <= 0) { ziel = undefined; w.zielId = 0; w.wach = false; }
        if (!ziel) { const o = this.naechsterGegner(w, K.AGGRO); if (o && abstand(o, w.heim) <= K.LEINE) { ziel = o; w.zielId = o.id; w.wach = true; this.wecken(w); } }
        if (ziel && D.spezial && w.cdS <= 0 && abstand(w, ziel) <= D.spezial.reich) { w.ladeT = D.spezial.laden; w.ladeX = ziel.x; w.ladeY = ziel.y; w.pfad = []; w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x); this.ev.push({ a: "laden", id: w.id, x: ziel.x, y: ziel.y, r: D.spezial.radius, t: D.spezial.laden }); }
        else if (ziel) this.jagen(w, ziel, D.angriff.reich);
        else if (abstand(w, w.heim) > 0.3) { w.neuWeg -= DT; if (w.neuWeg <= 0 || !w.pfad.length) { w.pfad = weg(w, w.heim); w.neuWeg = 1; } }
        else if (w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * (D.boss ? K.HEIM_HEILUNG_BOSS : K.HEIM_HEILUNG) * DT);
      } else if (w.bot) this.begleiterZug(w);
      else { // der Held des Spielers: Er läuft nur, wohin gesteuert wird
        const A = this.waffe(w), faehrt = w.rx !== 0 || w.ry !== 0, v = this.tempo(w);
        if (faehrt) { w.x += w.rx * v * DT; w.y += w.ry * v * DT; w.blick = Math.atan2(w.ry, w.rx); }
        if (w.held && (A as Modus).schild) { // Schild erhoben: kein Angriff. Torvald wendet den Schild dem gewählten Gegner zu, sonst dem nächsten in der Nähe.
          const g = ziel && ziel.team !== w.team && abstand(w, ziel) < 10 ? ziel : this.naechsterGegner(w, 5); if (g) w.blick = Math.atan2(g.y - w.y, g.x - w.x);
        } else if (A.art === "heil") { // Heilstab: gewählter Verbündeter, sonst wer am schwersten verletzt ist
          const z = ziel && ziel.team === w.team && ziel.lp < ziel.max ? ziel : this.schwaechster(w, A.reich); if (z && !faehrt && w.cdA <= 0 && abstand(w, z) <= A.reich && (z === w || frei(w, z))) this.angriff(w, z);
        } else { if (ziel && ziel.team === w.team) { ziel = undefined; w.zielId = 0; }
          const nah = A.art === "nah", darf = nah || !faehrt; // Fernkämpfer schießen nur im Stehen
          if (!ziel && !faehrt && !w.pfad.length) ziel = this.naechsterGegner(w, nah ? 2.2 : A.reich) || undefined; // wer steht und kein Ziel hat, wehrt sich von selbst
          if (ziel && darf && abstand(w, ziel) - ziel.r <= A.reich && frei(w, ziel)) { if (!faehrt || nah) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x); if (w.cdA <= 0) this.angriff(w, ziel); } }
      }
      if (w.pfad.length && w.aushol <= 0) { let rest = this.tempo(w) * DT; // laufen (Wegpunkte)
        while (rest > 0 && w.pfad.length) { const p = w.pfad[0], d = abstand(w, p); if (d <= rest) { w.x = p.x; w.y = p.y; rest -= d; w.pfad.shift(); } else { w.blick = Math.atan2(p.y - w.y, p.x - w.x); w.x += (p.x - w.x) / d * rest; w.y += (p.y - w.y) / d * rest; rest = 0; } } }
    }
    if (this.sl && this.sl.offen && this.phase === "lauf") this.schleuse(this.sl);
    for (let i = 0; i < this.wesen.length; i++) for (let j = i + 1; j < this.wesen.length; j++) { const a = this.wesen[i], b = this.wesen[j]; if (a.tot || b.tot) continue; const d = abstand(a, b), soll = a.r + b.r; if (d < soll && d > 1e-4) { const s = (soll - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d; a.x -= dx * s; a.y -= dy * s; b.x += dx * s; b.y += dy * s; } }
    for (const w of this.wesen) if (!w.tot) schieben(w);
    for (const w of this.wesen) if (!w.held && !w.tot && MONSTER[w.typ].fest) { w.x = w.heim.x; w.y = w.heim.y; } /* Festes bleibt, wo es ist, auch wenn jemand dagegenläuft */
    for (const g of this.geschosse) { const z = g.zielId ? this.nach(g.zielId) : undefined; if (z && !z.tot) { g.zx = z.x; g.zy = z.y; }
      const d = Math.hypot(g.zx - g.x, g.zy - g.y), s = g.tempo * DT;
      if (d > s) { g.x += (g.zx - g.x) / d * s; g.y += (g.zy - g.y) / d * s; if (g.knall && !begehbar(g.x, g.y)) { g.zx = g.x; g.zy = g.y; } else continue; }
      g.tempo = 0; const von = this.nach(g.von); if (!von) continue;
      if (g.knall) { this.ev.push({ a: "knall", x: g.zx, y: g.zy, r: g.knall, farbe: "feuer" }); this.flaeche(von, { x: g.zx, y: g.zy }, g.knall, g.spec, (o) => { if (g.spec.nach === "brand") this.dauerSchaden(o, "brand", K.GLUT.brand, K.GLUT.dauer, von); }); }
      else if (z && !z.tot) { const n = this.treffen(von, z, g.spec); if (n > 0 && !z.tot && g.spec.nach) this.nachTreffer(von, z, g.spec.nach); } }
    this.geschosse = this.geschosse.filter((g) => g.tempo > 0);
  }

  /** Offene Schleuse: Gegner kriechen in Wellen aus dem Wasser und sammeln sich am Hebel. Wer drei Sekunden ungestört am Hebel steht, schließt sie; ein Treffer fängt von vorn an. */
  private schleuse(sl: SchleuseStand & { offen: boolean; fort: number; warte: number; raus: number }): void {
    const h = this.ich, nah = !h.tot && Math.hypot(h.x - sl.x, h.y - sl.y) < 1.4;
    if (nah && h.ruhe > 0.05) { sl.fort = Math.min(1, sl.fort + DT / 3); if (sl.fort >= 1) { sl.offen = false; this.ev.push({ a: "schleuse", x: sl.x, y: sl.y }); if (this.besiegt >= this.monsterZahl) this.phase = "sieg"; return; } } else sl.fort = 0;
    sl.warte -= DT; if (sl.warte > 0 || sl.raus >= sl.gesamt) return; sl.warte = sl.takt;
    if (this.wesen.filter((w) => !w.held && !w.tot && w.gruppe >= 100).length >= sl.max) return;
    const p = sl.quellen[Math.floor(this.zf() * sl.quellen.length)], m = this.neu(false, sl.art, 1, { x: p.x, y: p.y }, true, 100 + this.lauf);
    m.wach = true; m.heim = { x: sl.x, y: sl.y }; /* sie ziehen zum Hebel und verteidigen ihn */ this.monsterZahl++; sl.raus++; this.ev.push({ a: "auftauchen", id: m.id, x: p.x, y: p.y });
  }
  /** Laich: Sobald ein Held in der Nähe ist, schlüpft alle takt Sekunden ein Junges – höchstens max zugleich, gesamt insgesamt. */
  private brueten(w: Wesen, B: { art: string; takt: number; max: number; gesamt: number }): void {
    let b = this.brut.get(w.id); if (!b) { b = { t: B.takt * 0.4, n: 0, junge: [] }; this.brut.set(w.id, b); }
    if (b.n >= B.gesamt || !this.wesen.some((h) => h.held && !h.tot && abstand(h, w) < 9)) return;
    b.t -= DT; if (b.t > 0) return; b.t = B.takt; b.junge = b.junge.filter((id) => { const j = this.nach(id); return j && !j.tot; }); if (b.junge.length >= B.max) return;
    const a = this.zf() * Math.PI * 2, p = naechstFrei({ x: w.x + Math.cos(a) * 1.1, y: w.y + Math.sin(a) * 1.1 }), j = this.neu(false, B.art, 1, p, true, 200 + this.lauf);
    j.wach = true; j.heim = { x: w.x, y: w.y }; b.n++; b.junge.push(j.id); this.monsterZahl++; this.ev.push({ a: "auftauchen", id: j.id, x: p.x, y: p.y });
  }
  /** Der Zustand für den Client (kompakt). Die Ereignisse seit dem letzten Abruf sind enthalten und werden danach geleert. */
  zustand(): Zustand { this.bereit();
    const r = (v: number) => Math.round(v * 100) / 100, h = this.ich, ev = this.ev; this.ev = [];
    const bits = (w: Wesen) => (w.bollwerk > 0 ? BIT.bollwerk : 0) | (w.betaeubt > 0 ? BIT.betaeubt : 0) | (w.langsamT > 0 ? BIT.langsam : 0) | (w.dauer.length ? BIT.dauer : 0) | (w.malT > 0 ? BIT.mal : 0) | (w.held && HELDEN[w.typ].modi[w.modus].schild ? BIT.schild : 0) | (w.aushol > 0 ? BIT.aushol : 0) | (w.schutz > 0 ? BIT.schutz : 0);
    return { tick: this.tick, phase: this.phase, zeit: Math.round(this.zeit * 10) / 10, splitter: this.splitter, besiegt: this.besiegt, monster: this.monsterZahl, b: this.beute.map((q) => [q.id, q.x, q.y, q.n]),
      w: this.wesen.filter((w) => w.held || !w.tot).map((w) => [w.id, w.held ? 1 : 0, w.typ, w.team, r(w.x), r(w.y), r(w.blick), Math.round(w.lp), w.max, bits(w), w.tot ? 1 : 0, Math.round(w.schutz), w.modus]),
      g: this.geschosse.map((g) => [g.id, r(g.x), r(g.y), g.art]), ev, ich: { id: h.id, cdQ: r(h.cdQ), cdE: r(h.cdE), cdR: r(h.cdR), zielId: h.zielId, wieder: r(Math.max(0, h.wieder)), modus: h.modus, stufe: this.stufen[h.typ] || 1, ep: this.epStand[h.typ] || 0 },
      sl: this.sl ? [r(this.sl.x), r(this.sl.y), this.sl.offen ? 1 : 0, r(this.sl.fort)] : undefined,
      st: Object.fromEntries(this.wesen.filter((w) => w.held && w.team === 0).map((w) => [w.typ, [this.stufen[w.typ] || 1, this.epStand[w.typ] || 0]])) };
  }
}
export { HELDENREIHE };
