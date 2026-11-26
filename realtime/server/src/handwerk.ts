/*
 * Mythara Echtzeit – Handwerk auf dem Server (shared/handwerk.ts). Der Server ist die einzige Wahrheit:
 *   · „handwerk“/„start“ (Rezept, Menge): Nähe zur Werkstatt, Handwerk-Level, Zutaten im Rucksack, Platz für das Ergebnis.
 *   · Je Stück so viele Ticks wie im Rezept; dann Zutaten weg, Ergebnis in den Rucksack, XP für den Beruf der Werkstatt (shared/berufe.ts:
 *     Esse und Amboss → Schmieden, Werkbank und Rucksack → Handwerk, Feuer, Backofen, Herd, Kessel, Brunnen → Kochen). Herstellen gelingt immer – außer beim Kochen:
 *     dort brennt manches an (brennChance), dann gibt es den verbrannten Gegenstand ohne XP. Der Moment heißt dort Garpunkt: das Stück gelingt sicher, +50 % XP.
 *   · Glut (12 % je Stück): Fenster von 1,5 s; „handwerk“/„glut“ darin → beim nächsten Stück eine Einheit der häufigsten Zutat gespart, 50 % mehr XP.
 *   · Abbruch: Menge fertig, Zutaten aus, Rucksack voll, weggegangen, „stop“ oder Verbindung weg.
 */
import { REZEPTE, rezept, Rezept, WERKZEUG_AN, STATIONEN, WERKSTAETTEN, HANDWERK_WEIT, GLUT_CHANCE, GLUT_MS, TICK_MS, brennChance, werkstattErreichbar } from "../../shared/handwerk";
import { berufAn, beruf } from "../../shared/berufe";
import { levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aufnehmen, abgeben, anzahlVon, berufXp, berufXpDazu, platzFuer, ladungen, ladungenDazu } from "./inventar";
import { LADUNG_MAX, RESONANZ_MAL } from "../../shared/splitterbinden";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HandwerkSpieler { nutzer: string; gast: boolean; wx?: number; wy?: number }
interface Arbeit { s: HandwerkSpieler; r: Rezept; rest: number; naechst: number; glutBis: number; glut: boolean }
let sb: Sb = async () => null, senden: (s: HandwerkSpieler, m: object) => void = () => {};
const arbeiten = new Map<HandwerkSpieler, Arbeit>();
/** nur Tests: HANDWERK_GLUT = Chance der Glut */
const GLUT = process.env.HANDWERK_GLUT !== undefined ? Number(process.env.HANDWERK_GLUT) : GLUT_CHANCE;
/** nur Tests: HANDWERK_BRENN = feste Chance des Anbrennens (sonst brennChance nach Level) */
const BRENN = process.env.HANDWERK_BRENN !== undefined ? Number(process.env.HANDWERK_BRENN) : undefined;
/** nur Tests: HANDWERK_STELLEN = JSON-Liste zusätzlicher Werkstätten (z. B. ein Kessel, solange die Taverne nicht gebaut ist) */
if (process.env.HANDWERK_STELLEN) for (const w of JSON.parse(process.env.HANDWERK_STELLEN) as typeof WERKSTAETTEN) WERKSTAETTEN.push(w);
export let wuerfel = Math.random;

/** Quest-Rezepte (Rezept.quest): quests.ts setzt, ob man darf und was ein fertiges Stück bewirkt */
export const HANDWERK_QUEST = { pruefen: (_nutzer: string, _r: Rezept): string | null => "Das geht noch nicht.", fertig: (_nutzer: string, _r: Rezept): void => { /* quests.ts */ },
  /** Werkstatt mit Quest-Schalter (Werkstatt.schalter): an für diesen Spieler? (quests.ts) */ schalter: (_nutzer: string, _id: string): boolean => false,
  /** Quest-Rezept: braucht die Quest noch ein Stück? (der passende Schritt ist noch offen) */ weiter: (_nutzer: string, _r: Rezept): boolean => false };
export function handwerkEinrichten(o: { sb: Sb; senden: (s: HandwerkSpieler, m: object) => void }): void { sb = o.sb; senden = o.senden; }
/** Level im Beruf dieser Werkstatt (Schmieden an Esse und Amboss, sonst Handwerk) */
export const handwerkLevel = (nutzer: string, station: Rezept["station"] = "werkbank"): number => levelAus(berufXp(nutzer, berufAn(station)));
const offen = (s: HandwerkSpieler, W: { schalter?: string }) => !W.schalter || HANDWERK_QUEST.schalter(s.nutzer, W.schalter);
const naheWerkstaetten = (s: HandwerkSpieler, r: Rezept) => s.wx !== undefined && s.wy !== undefined ? WERKSTAETTEN.filter((W) => W.station === r.station && Math.hypot(s.wx! - W.x, s.wy! - W.y) <= HANDWERK_WEIT && werkstattErreichbar(s.wx!, s.wy!, W)) : []; /* nicht durch die Wand (#57) */
const nah = (s: HandwerkSpieler, r: Rezept) => { if (r.station === "hand") return true; /* im Rucksack: überall */ return naheWerkstaetten(s, r).some((W) => offen(s, W)); };   /* irgendein (freigeschalteter) Standort dieser Station */
/** „ladung:wegstein“ → wegstein (Rezepte, die Ladungen statt eines Gegenstands geben) */
const ladungZiel = (r: Rezept): string | null => (r.ergebnis.startsWith("ladung:") ? r.ergebnis.slice(7) : null);
/** Welche Sorte einer Zutat nehmen: die erste, von der genug da ist */
const sorte = (nutzer: string, g: string[], n: number) => g.find((x) => anzahlVon(nutzer, x) >= n) || null;
/** Was fehlt für ein Stück (null = alles da); spar: diese Zutat (Index) braucht eine Einheit weniger (Glut) */
function fehlt(nutzer: string, r: Rezept, spar = -1): string | null {
  for (let i = 0; i < r.zutaten.length; i++) { const z = r.zutaten[i], n = Math.max(0, z.n - (i === spar ? 1 : 0)); if (n && !sorte(nutzer, z.g, n)) return `${n} × ${z.g.map((g) => GEGENSTAENDE[g] ? GEGENSTAENDE[g].name : g).join(" oder ")}`; }
  return null; }
const sparIndex = (r: Rezept) => { let best = -1, n = 1; r.zutaten.forEach((z, i) => { if (z.n > n) { n = z.n; best = i; } }); return best; };   // die häufigste Zutat (mindestens 2 nötig)
/** Passt das Ergebnis noch in den Rucksack? Wenn eine verbrauchte Zutat einzeln liegt, wird ihr Fach frei */
const passt = (nutzer: string, r: Rezept) => { const l = ladungZiel(r); return l ? ladungen(nutzer, l) < LADUNG_MAX : passtG(nutzer, r); };
const passtG = (nutzer: string, r: Rezept) => platzFuer(nutzer, r.ergebnis) || r.zutaten.some((z) => z.g.some((g) => GEGENSTAENDE[g] && !GEGENSTAENDE[g].stapel && anzahlVon(nutzer, g) > 0));

const ARTIKEL: Partial<Record<string, string>> = { bindestein: "den", amboss: "den", feuer: "ein", backofen: "einen", herd: "einen", kessel: "einen", brunnen: "einen" };
/** Mit dem Herstellen beginnen. Zurück: Fehlertext oder null */
export function handwerkStart(s: HandwerkSpieler, id: string, menge: number): string | null {
  if (s.gast) return "Handwerk geht mit Konto (Menü → Anmelden).";
  const r = rezept(id); if (!r) return "Dieses Rezept gibt es nicht.";
  if (!nah(s, r) && r.station !== "hand") { const zu = naheWerkstaetten(s, r).find((W) => !offen(s, W)); return zu ? zu.gesperrt || "Das geht hier noch nicht." : `Geh näher an ${ARTIKEL[r.station] || "die"} ${STATIONEN[r.station].name}.`; }
  const L = handwerkLevel(s.nutzer, r.station); if (L < r.level) return `Dafür brauchst du ${(beruf(berufAn(r.station)) || { name: "Handwerk" }).name} ${r.level}.`;
  if (r.quest) { const q = HANDWERK_QUEST.pruefen(s.nutzer, r); if (q) return q; }
  const w = WERKZEUG_AN[r.station]; if (w && anzahlVon(s.nutzer, w) <= 0) return `Du brauchst einen ${GEGENSTAENDE[w].name} im Rucksack.`;
  const f = fehlt(s.nutzer, r); if (f) return `Dir fehlt: ${f}.`;
  if (!passt(s.nutzer, r)) return ladungZiel(r) ? `Der ${GEGENSTAENDE[ladungZiel(r)!] ? GEGENSTAENDE[ladungZiel(r)!].name : "Stein"} ist voll – mehr als ${LADUNG_MAX} Ladungen hält er nicht.` : "Dein Rucksack ist voll.";
  if (ladungZiel(r) && anzahlVon(s.nutzer, ladungZiel(r)!) <= 0) return `Du brauchst deinen ${GEGENSTAENDE[ladungZiel(r)!].name} im Rucksack.`;
  const n = Math.max(1, Math.min(1000, Math.floor(menge) || 1));
  arbeiten.set(s, { s, r, rest: n, naechst: Date.now() + r.ticks * TICK_MS, glutBis: 0, glut: false });
  senden(s, { t: "handwerk", tat: "start", rezept: r.id, station: r.station, menge: n, ms: r.ticks * TICK_MS }); return null;
}
export function handwerkStop(s: HandwerkSpieler, grund = ""): void { const a = arbeiten.get(s); if (!a) return; arbeiten.delete(s); senden(s, { t: "handwerk", tat: "stop", rezept: a.r.id, grund }); }
export const handwerkWeg = (s: HandwerkSpieler): void => { arbeiten.delete(s); };
/** Glut angetippt: gilt für das Stück, an dem gerade gearbeitet wird */
export function handwerkGlut(s: HandwerkSpieler): void { const a = arbeiten.get(s); if (!a || !a.glutBis || Date.now() > a.glutBis + 300) return; a.glutBis = 0; a.glut = true; }

/** Ein Stück fertig: Zutaten weg, Ergebnis dazu, XP. Zurück: ob es weitergeht */
function fertigStueck(a: Arbeit): boolean {
  const { s, r } = a, laden = ladungZiel(r), kochen = Boolean(r.verbrannt), spar = a.glut && !laden && !kochen && sparIndex(r) >= 0 ? sparIndex(r) : -1, glut = a.glut; a.glut = false; /* Resonanz (Laden): statt Sparen doppelt so viele Ladungen; Garpunkt (Kochen): brennt sicher nicht an */
  if (fehlt(s.nutzer, r, spar)) { handwerkStop(s, "zutaten"); return false; }
  { const w = WERKZEUG_AN[r.station]; if (w && anzahlVon(s.nutzer, w) <= 0) { handwerkStop(s, "werkzeug"); return false; } }   /* Hammer unterwegs abgelegt */
  for (let i = 0; i < r.zutaten.length; i++) { const z = r.zutaten[i], n = Math.max(0, z.n - (i === spar ? 1 : 0)), g = sorte(s.nutzer, z.g, n); if (!g) continue; for (let k = 0; k < n; k++) abgeben(sb, s.nutzer, g); }
  let stueck = 1;
  /* Kochen: Anbrennen (sinkt mit dem Level, ab +30 nie; Garpunkt schützt) – dann der verbrannte Gegenstand, ohne XP, zählt nicht für Quests */
  const verbrannt = kochen && !glut && wuerfel() < (BRENN !== undefined ? BRENN : brennChance(handwerkLevel(s.nutzer, r.station), r));
  if (verbrannt) { if (!aufnehmen(sb, s.nutzer, r.verbrannt!, 1)) { handwerkStop(s, "voll"); return false; }
    a.rest--; const V = GEGENSTAENDE[r.verbrannt!];
    senden(s, { t: "handwerk", tat: "fertig", rezept: r.id, g: r.verbrannt, name: V ? V.name : r.verbrannt, xp: 0, beruf: berufAn(r.station), glut: false, gespart: false, verbrannt: true, rest: a.rest, level: handwerkLevel(s.nutzer, r.station), aufstieg: 0 });
    if (a.rest <= 0) { arbeiten.delete(s); senden(s, { t: "handwerk", tat: "stop", rezept: r.id, grund: "fertig" }); return false; }
    if (fehlt(s.nutzer, r)) { handwerkStop(s, "zutaten"); return false; }
    return true; }
  if (laden) { if (anzahlVon(s.nutzer, laden) <= 0) { handwerkStop(s, "werkzeug"); return false; } stueck = ladungenDazu(sb, s.nutzer, laden, glut ? RESONANZ_MAL : 1); if (!stueck) { handwerkStop(s, "voll"); return false; } }
  else if (!aufnehmen(sb, s.nutzer, r.ergebnis, r.menge || 1)) { handwerkStop(s, "voll"); return false; } else stueck = r.menge || 1;
  const vorher = handwerkLevel(s.nutzer, r.station), xp = Math.round(r.xp * (glut ? 1.5 : 1)), b = berufAn(r.station); berufXpDazu(sb, s.nutzer, b, xp); const nachher = handwerkLevel(s.nutzer, r.station);
  a.rest--; const G = GEGENSTAENDE[laden || r.ergebnis]; HANDWERK_QUEST.fertig(s.nutzer, r); /* jedes Stück zählt für Quests (2 Bogensehnen, 2 Kupferbarren …) */ if (r.quest && !HANDWERK_QUEST.weiter(s.nutzer, r)) a.rest = 0; /* Questrezept: nur so viele, wie die Quest noch braucht (B2: drei Tafeln) */
  senden(s, { t: "handwerk", tat: "fertig", rezept: r.id, g: r.ergebnis, name: G ? G.name : r.ergebnis, xp, beruf: b, glut, gespart: spar >= 0, rest: a.rest, level: nachher, aufstieg: nachher > vorher ? nachher : 0,
    ...(laden ? { ladungen: ladungen(s.nutzer, laden), stueck } : r.menge ? { stueck } : {}) });
  if (a.rest <= 0) { arbeiten.delete(s); senden(s, { t: "handwerk", tat: "stop", rezept: r.id, grund: "fertig" }); return false; }
  if (fehlt(s.nutzer, r)) { handwerkStop(s, "zutaten"); return false; }
  if (!passt(s.nutzer, r)) { handwerkStop(s, "voll"); return false; }
  return true;
}
/** Takt: alle 100 ms (vom Weltserver gerufen) */
export function handwerkTakt(jetzt = Date.now()): void {
  for (const [s, a] of [...arbeiten]) {
    if (!nah(s, a.r)) { handwerkStop(s, "weg"); continue; }
    if (a.glutBis && jetzt > a.glutBis + 300) a.glutBis = 0;
    if (jetzt < a.naechst) continue;
    senden(s, { t: "handwerk", tat: "schlag", rezept: a.r.id });
    if (!fertigStueck(a)) continue;
    a.naechst = jetzt + a.r.ticks * TICK_MS;
    if (!a.glut && !a.glutBis && wuerfel() < GLUT) { a.glutBis = jetzt + GLUT_MS; senden(s, { t: "handwerk", tat: "glut", rezept: a.r.id, ms: GLUT_MS }); }
  }
}
export const handwerkAktiv = (s: HandwerkSpieler): string | null => (arbeiten.get(s) ? arbeiten.get(s)!.r.id : null);
export { REZEPTE };
