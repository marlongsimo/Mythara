/*
 * Mythara Echtzeit – Handwerk auf dem Server (shared/handwerk.ts). Der Server ist die einzige Wahrheit:
 *   · „handwerk“/„start“ (Rezept, Menge): Nähe zur Werkstatt, Handwerk-Level, Zutaten im Rucksack, Platz für das Ergebnis.
 *   · Je Stück so viele Ticks wie im Rezept; dann Zutaten weg, Ergebnis in den Rucksack, XP (berufe.handwerk). Herstellen gelingt immer.
 *   · Glut (12 % je Stück): Fenster von 1,5 s; „handwerk“/„glut“ darin → beim nächsten Stück eine Einheit der häufigsten Zutat gespart, 50 % mehr XP.
 *   · Abbruch: Menge fertig, Zutaten aus, Rucksack voll, weggegangen, „stop“ oder Verbindung weg.
 */
import { REZEPTE, rezept, Rezept, STATIONEN, HANDWERK_WEIT, GLUT_CHANCE, GLUT_MS, TICK_MS, BERUF_HAND } from "../../shared/handwerk";
import { levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aufnehmen, abgeben, anzahlVon, berufXp, berufXpDazu, platzFuer } from "./inventar";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HandwerkSpieler { nutzer: string; gast: boolean; wx?: number; wy?: number }
interface Arbeit { s: HandwerkSpieler; r: Rezept; rest: number; naechst: number; glutBis: number; glut: boolean }
let sb: Sb = async () => null, senden: (s: HandwerkSpieler, m: object) => void = () => {};
const arbeiten = new Map<HandwerkSpieler, Arbeit>();
/** nur Tests: HANDWERK_GLUT = Chance der Glut */
const GLUT = process.env.HANDWERK_GLUT !== undefined ? Number(process.env.HANDWERK_GLUT) : GLUT_CHANCE;
export let wuerfel = Math.random;

export function handwerkEinrichten(o: { sb: Sb; senden: (s: HandwerkSpieler, m: object) => void }): void { sb = o.sb; senden = o.senden; }
export const handwerkLevel = (nutzer: string): number => levelAus(berufXp(nutzer, BERUF_HAND));
const nah = (s: HandwerkSpieler, r: Rezept) => { if (r.station === "hand") return true; /* im Rucksack: überall */ const S = STATIONEN[r.station]; return s.wx !== undefined && s.wy !== undefined && Math.hypot(s.wx - S.x, s.wy - S.y) <= HANDWERK_WEIT; };
/** Welche Sorte einer Zutat nehmen: die erste, von der genug da ist */
const sorte = (nutzer: string, g: string[], n: number) => g.find((x) => anzahlVon(nutzer, x) >= n) || null;
/** Was fehlt für ein Stück (null = alles da); spar: diese Zutat (Index) braucht eine Einheit weniger (Glut) */
function fehlt(nutzer: string, r: Rezept, spar = -1): string | null {
  for (let i = 0; i < r.zutaten.length; i++) { const z = r.zutaten[i], n = Math.max(0, z.n - (i === spar ? 1 : 0)); if (n && !sorte(nutzer, z.g, n)) return `${n} × ${z.g.map((g) => GEGENSTAENDE[g] ? GEGENSTAENDE[g].name : g).join(" oder ")}`; }
  return null; }
const sparIndex = (r: Rezept) => { let best = -1, n = 1; r.zutaten.forEach((z, i) => { if (z.n > n) { n = z.n; best = i; } }); return best; };   // die häufigste Zutat (mindestens 2 nötig)
/** Passt das Ergebnis noch in den Rucksack? Wenn eine verbrauchte Zutat einzeln liegt, wird ihr Fach frei */
const passt = (nutzer: string, r: Rezept) => platzFuer(nutzer, r.ergebnis) || r.zutaten.some((z) => z.g.some((g) => GEGENSTAENDE[g] && !GEGENSTAENDE[g].stapel && anzahlVon(nutzer, g) > 0));

/** Mit dem Herstellen beginnen. Zurück: Fehlertext oder null */
export function handwerkStart(s: HandwerkSpieler, id: string, menge: number): string | null {
  if (s.gast) return "Handwerk geht mit Konto (Menü → Anmelden).";
  const r = rezept(id); if (!r) return "Dieses Rezept gibt es nicht.";
  if (!nah(s, r) && r.station !== "hand") return `Geh näher an die ${STATIONEN[r.station].name}.`;
  const L = handwerkLevel(s.nutzer); if (L < r.level) return `Dafür brauchst du Handwerk ${r.level}.`;
  const f = fehlt(s.nutzer, r); if (f) return `Dir fehlt: ${f}.`;
  if (!passt(s.nutzer, r)) return "Dein Rucksack ist voll.";
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
  const { s, r } = a, spar = a.glut && sparIndex(r) >= 0 ? sparIndex(r) : -1, glut = a.glut; a.glut = false;
  if (fehlt(s.nutzer, r, spar)) { handwerkStop(s, "zutaten"); return false; }
  for (let i = 0; i < r.zutaten.length; i++) { const z = r.zutaten[i], n = Math.max(0, z.n - (i === spar ? 1 : 0)), g = sorte(s.nutzer, z.g, n); if (!g) continue; for (let k = 0; k < n; k++) abgeben(sb, s.nutzer, g); }
  if (!aufnehmen(sb, s.nutzer, r.ergebnis, 1)) { handwerkStop(s, "voll"); return false; }
  const vorher = handwerkLevel(s.nutzer), xp = Math.round(r.xp * (glut ? 1.5 : 1)); berufXpDazu(sb, s.nutzer, BERUF_HAND, xp); const nachher = handwerkLevel(s.nutzer);
  a.rest--; const G = GEGENSTAENDE[r.ergebnis];
  senden(s, { t: "handwerk", tat: "fertig", rezept: r.id, g: r.ergebnis, name: G ? G.name : r.ergebnis, xp, glut, gespart: spar >= 0, rest: a.rest, level: nachher, aufstieg: nachher > vorher ? nachher : 0 });
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
