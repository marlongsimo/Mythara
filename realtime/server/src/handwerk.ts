/*
 * Mythara Echtzeit – Handwerk auf dem Server (shared/handwerk.ts). Der Server ist die einzige Wahrheit:
 *   · „handwerk“/„start“ (Rezept, Menge): Nähe zur Werkstatt, Handwerk-Level, Zutaten im Rucksack, Platz für das Ergebnis.
 *   · Je Stück so viele Ticks wie im Rezept; dann Zutaten weg, Ergebnis in den Rucksack, XP für den Beruf der Werkstatt (shared/berufe.ts:
 *     Esse und Amboss → Schmieden, Werkbank und Rucksack → Handwerk, Feuer, Backofen, Herd, Kessel, Brunnen → Kochen). Herstellen gelingt immer – außer beim Kochen:
 *     dort brennt manches an (brennChance), dann gibt es den verbrannten Gegenstand ohne XP. Der Moment heißt dort Garpunkt: das Stück gelingt sicher, +50 % XP.
 *   · Glut (12 % je Stück): Fenster von 1,5 s; „handwerk“/„glut“ darin → beim nächsten Stück eine Einheit der häufigsten Zutat gespart, 50 % mehr XP.
 *   · Abbruch: Menge fertig, Zutaten aus, Rucksack voll, weggegangen, „stop“ oder Verbindung weg.
 */
import { REZEPTE, rezept, Rezept, WERKZEUG_AN, STATIONEN, WERKSTAETTEN, HANDWERK_WEIT, GLUT_CHANCE, GLUT_MS, TICK_MS, brennChance } from "../../shared/handwerk";
import { berufAn, beruf } from "../../shared/berufe";
import { levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aufnehmen, abgeben, anzahlVon, berufXp, berufXpDazu, platzFuer, ladungen, ladungenDazu, waffeLadung, waffeLadenDazu, waffeEntladen, wartenVon, wartenSetzen, ladungMax, merkerHat, merkerDazu } from "./inventar";
import { LADUNG_MAX, RESONANZ_MAL, AN_WAFFE, WAFFE_LADUNG_MAX } from "../../shared/splitterbinden";

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
const naheWerkstaetten = (s: HandwerkSpieler, r: Rezept) => s.wx !== undefined && s.wy !== undefined ? WERKSTAETTEN.filter((W) => W.station === r.station && Math.hypot(s.wx! - W.x, s.wy! - W.y) <= HANDWERK_WEIT) : [];
const nah = (s: HandwerkSpieler, r: Rezept) => { if (r.station === "hand") return true; /* im Rucksack: überall */ return naheWerkstaetten(s, r).some((W) => offen(s, W)); };   /* irgendein (freigeschalteter) Standort dieser Station */
/** „ladung:wegstein“ → wegstein (Rezepte, die Ladungen statt eines Gegenstands geben) */
const ladungZiel = (r: Rezept): string | null => (r.ergebnis.startsWith("ladung:") ? r.ergebnis.slice(7) : null);
/** Phase 5b: Waffe laden/entladen – die angelegte Waffe passt zum Rezept (Seltenheit)? Zurück: Fehlertext oder null */
const entladen = (r: Rezept): boolean => r.ergebnis === "entladen:" + AN_WAFFE;
function waffePasst(nutzer: string, r: Rezept): string | null { const w = waffeLadung(nutzer), G = w && GEGENSTAENDE[w.g]; if (!w || !G || !G.waffe) return "Leg die Waffe an, die du laden willst.";
  if (entladen(r)) return w.n > 0 ? null : `${G.name} ist nicht geladen.`; if (r.fuer && G.seltenheit !== r.fuer) return `Dieses Binden ist für ${r.fuer === "selten" ? "seltene" : r.fuer === "episch" ? "epische" : r.fuer === "legendaer" ? "legendäre" : "mythische"} Waffen – ${G.name} ist das nicht.`; return null; }
/** Welche Sorte einer Zutat nehmen: die erste, von der genug da ist */
const sorte = (nutzer: string, g: string[], n: number) => g.find((x) => anzahlVon(nutzer, x) >= n) || null;
/** Was fehlt für ein Stück (null = alles da); spar: diese Zutat (Index) braucht eine Einheit weniger (Glut) */
function fehlt(nutzer: string, r: Rezept, spar = -1): string | null {
  for (let i = 0; i < r.zutaten.length; i++) { const z = r.zutaten[i], n = Math.max(0, z.n - (i === spar ? 1 : 0)); if (n && !sorte(nutzer, z.g, n)) return `${n} × ${z.g.map((g) => GEGENSTAENDE[g] ? GEGENSTAENDE[g].name : g).join(" oder ")}`; }
  return null; }
const sparIndex = (r: Rezept) => { let best = -1, n = 1; r.zutaten.forEach((z, i) => { if (z.n > n) { n = z.n; best = i; } }); return best; };   // die häufigste Zutat (mindestens 2 nötig)
/** Passt das Ergebnis noch in den Rucksack? Wenn eine verbrauchte Zutat einzeln liegt, wird ihr Fach frei */
const passt = (nutzer: string, r: Rezept) => { if (entladen(r)) return true; const l = ladungZiel(r); return l === AN_WAFFE ? (waffeLadung(nutzer) || { n: WAFFE_LADUNG_MAX }).n < WAFFE_LADUNG_MAX : l ? ladungen(nutzer, l) < ladungMax(nutzer, l) : merkerZiel(r) ? true : passtG(nutzer, r); };
/** „merker:…“ (Splitterkern einsetzen): das Rezept setzt einen Merker im Inventar statt eines Gegenstands */
const merkerZiel = (r: Rezept): string | null => (r.ergebnis.startsWith("merker:") ? r.ergebnis.slice(7) : null);
const passtG = (nutzer: string, r: Rezept) => platzFuer(nutzer, r.ergebnis) || r.zutaten.some((z) => z.g.some((g) => GEGENSTAENDE[g] && !GEGENSTAENDE[g].stapel && anzahlVon(nutzer, g) > 0));

const ARTIKEL: Partial<Record<string, string>> = { bindestein: "den", amboss: "den", feuer: "ein", backofen: "einen", herd: "einen", kessel: "einen", brunnen: "einen" };
/** Mit dem Herstellen beginnen. Zurück: Fehlertext oder null */
export function handwerkStart(s: HandwerkSpieler, id: string, menge: number): string | null {
  if (s.gast) return "Handwerk geht mit Konto (Menü → Anmelden).";
  const r = rezept(id); if (!r) return "Dieses Rezept gibt es nicht.";
  if (!nah(s, r) && r.station !== "hand") { const zu = naheWerkstaetten(s, r).find((W) => !offen(s, W)); return zu ? zu.gesperrt || "Das geht hier noch nicht." : `Geh näher an ${ARTIKEL[r.station] || "die"} ${STATIONEN[r.station].name}.`; }
  if (r.warten && wartenVon(s.nutzer)) return wartenAbholen(s, r); /* läuft schon ein Auftrag: abholen (oder sagen, wie lange noch) */
  const L = handwerkLevel(s.nutzer, r.station); if (L < r.level) return `Dafür brauchst du ${(beruf(berufAn(r.station)) || { name: "Handwerk" }).name} ${r.level}.`;
  if (r.quest) { let q: string | null = HANDWERK_QUEST.pruefen(s.nutzer, r); for (const id of r.auchQuest || []) if (q) q = HANDWERK_QUEST.pruefen(s.nutzer, { ...r, quest: id }) && q; if (q) return q; } /* auchQuest (#126): eine der Quests genügt */
  { const m = merkerZiel(r); if (m && merkerHat(s.nutzer, m)) return "Dein Wegstein trägt schon einen Splitterkern."; if (m && anzahlVon(s.nutzer, "wegstein") <= 0) return "Du brauchst deinen Wegstein im Rucksack."; }
  const w = WERKZEUG_AN[r.station]; if (w && anzahlVon(s.nutzer, w) <= 0) return `Du brauchst einen ${GEGENSTAENDE[w].name} im Rucksack.`;
  const f = fehlt(s.nutzer, r); if (f) return `Dir fehlt: ${f}.`;
  if (ladungZiel(r) === AN_WAFFE || entladen(r)) { const w = waffePasst(s.nutzer, r); if (w) return w; if (!passt(s.nutzer, r)) return `Mehr als ${WAFFE_LADUNG_MAX} Ladungen hält keine Waffe.`; } /* Phase 5b */
  else if (!passt(s.nutzer, r)) return ladungZiel(r) ? `Der ${GEGENSTAENDE[ladungZiel(r)!] ? GEGENSTAENDE[ladungZiel(r)!].name : "Stein"} ist voll – mehr als ${ladungMax(s.nutzer, ladungZiel(r)!)} Ladungen hält er nicht.` : "Dein Rucksack ist voll.";
  if (ladungZiel(r) && ladungZiel(r) !== AN_WAFFE && anzahlVon(s.nutzer, ladungZiel(r)!) <= 0) return `Du brauchst deinen ${GEGENSTAENDE[ladungZiel(r)!].name} im Rucksack.`;
  const n = Math.max(1, Math.min(1000, Math.floor(menge) || 1));
  if (r.warten) return wartenStart(s, r, n); /* Räucherhütte (#102) */
  arbeiten.set(s, { s, r, rest: n, naechst: Date.now() + r.ticks * TICK_MS, glutBis: 0, glut: false });
  senden(s, { t: "handwerk", tat: "start", rezept: r.id, station: r.station, menge: n, ms: r.ticks * TICK_MS }); return null;
}
/* ───────── Station mit Wartezeit (Räucherhütte, #102) ───────── */
/** Hineinlegen: Zutaten für so viele Stück, wie da sind (höchstens n), sofort nehmen; fertig nach r.warten Sekunden */
function wartenStart(s: HandwerkSpieler, r: Rezept, n: number): string | null { let k = 0;
  while (k < n && !fehlt(s.nutzer, r)) { for (const z of r.zutaten) { const g = sorte(s.nutzer, z.g, z.n)!; for (let i = 0; i < z.n; i++) abgeben(sb, s.nutzer, g); } k++; }
  if (!k) return "Dir fehlen die Zutaten.";
  const fertig = Date.now() + r.warten! * 1000; wartenSetzen(sb, s.nutzer, { r: r.id, n: k, fertig });
  senden(s, { t: "handwerk", tat: "warten", rezept: r.id, station: r.station, menge: k, fertig, ms: r.warten! * 1000 });
  senden(s, { t: "chat", kanal: "system", text: `${k} × ${(GEGENSTAENDE[r.ergebnis] || { name: r.ergebnis }).name} hängen jetzt im Rauch – fertig in ${zeitText(r.warten! * 1000)}.`, zeit: Date.now() }); return null; }
const zeitText = (ms: number): string => { const s = Math.max(1, Math.ceil(ms / 1000)); return s >= 120 ? `${Math.ceil(s / 60)} min` : `${s} s`; };
/** Abholen: fertig → in den Rucksack (was nicht passt, bleibt hängen), XP je Stück; sonst wie lange noch */
function wartenAbholen(s: HandwerkSpieler, r0: Rezept): string | null { const W = wartenVon(s.nutzer)!, r = rezept(W.r) || r0, jetzt = Date.now();
  if (r.station !== r0.station) return `In der ${r.station === "hand" ? "Werkstatt" : STATIONEN[r.station].name} wartet noch etwas auf dich.`;
  if (jetzt < W.fertig) return `Noch nicht fertig – noch ${zeitText(W.fertig - jetzt)}.`;
  const je = r.menge || 1; let k = 0; while (k < W.n && aufnehmen(sb, s.nutzer, r.ergebnis, je, false) === je) k++;
  if (!k) return "Dein Rucksack ist voll.";
  berufXpDazu(sb, s.nutzer, berufAn(r.station), r.xp * k); if (r.quest) for (let i = 0; i < k; i++) HANDWERK_QUEST.fertig(s.nutzer, r);
  wartenSetzen(sb, s.nutzer, k < W.n ? { ...W, n: W.n - k } : null);
  senden(s, { t: "handwerk", tat: "abgeholt", rezept: r.id, menge: k * je, rest: W.n - k });
  senden(s, { t: "chat", kanal: "system", text: `Du nimmst ${k * je} × ${(GEGENSTAENDE[r.ergebnis] || { name: r.ergebnis }).name} aus dem Rauch.${k < W.n ? " Der Rest hängt noch – dein Rucksack ist voll." : ""}`, zeit: Date.now() }); return null; }
export function handwerkStop(s: HandwerkSpieler, grund = ""): void { const a = arbeiten.get(s); if (!a) return; arbeiten.delete(s); senden(s, { t: "handwerk", tat: "stop", rezept: a.r.id, grund }); }
export const handwerkWeg = (s: HandwerkSpieler): void => { arbeiten.delete(s); };
/** Glut angetippt: gilt für das Stück, an dem gerade gearbeitet wird */
export function handwerkGlut(s: HandwerkSpieler): void { const a = arbeiten.get(s); if (!a || !a.glutBis || Date.now() > a.glutBis + 300) return; a.glutBis = 0; a.glut = true; }

/** Ein Stück fertig: Zutaten weg, Ergebnis dazu, XP. Zurück: ob es weitergeht */
function fertigStueck(a: Arbeit): boolean {
  const { s, r } = a, laden = ladungZiel(r), kochen = Boolean(r.verbrannt), spar = a.glut && !laden && !kochen && sparIndex(r) >= 0 ? sparIndex(r) : -1, glut = a.glut; a.glut = false; /* Resonanz (Laden): statt Sparen doppelt so viele Ladungen; Garpunkt (Kochen): brennt sicher nicht an */
  if (fehlt(s.nutzer, r, spar)) { handwerkStop(s, "zutaten"); return false; }
  if ((laden === AN_WAFFE || entladen(r)) && waffePasst(s.nutzer, r)) { handwerkStop(s, "werkzeug"); return false; } /* Waffe unterwegs abgelegt oder gewechselt */
  if (entladen(r)) { const n = waffeEntladen(sb, s.nutzer), w = waffeLadung(s.nutzer); a.rest = 0; arbeiten.delete(s); /* Entladen: die Splitter verfallen */
    senden(s, { t: "handwerk", tat: "fertig", rezept: r.id, g: w ? w.g : "", name: w && GEGENSTAENDE[w.g] ? GEGENSTAENDE[w.g].name : "Waffe", xp: 0, beruf: berufAn(r.station), glut: false, gespart: false, rest: 0, level: handwerkLevel(s.nutzer, r.station), aufstieg: 0, ladungen: 0, entladen: n });
    senden(s, { t: "handwerk", tat: "stop", rezept: r.id, grund: "fertig" }); return false; }
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
  if (laden === AN_WAFFE) { stueck = waffeLadenDazu(sb, s.nutzer, glut ? RESONANZ_MAL : 1); if (!stueck) { handwerkStop(s, "voll"); return false; } } /* Phase 5b: Ladungen an der angelegten Waffe */
  else if (laden) { if (anzahlVon(s.nutzer, laden) <= 0) { handwerkStop(s, "werkzeug"); return false; } stueck = ladungenDazu(sb, s.nutzer, laden, glut ? RESONANZ_MAL : 1); if (!stueck) { handwerkStop(s, "voll"); return false; } }
  else if (merkerZiel(r)) { if (!merkerDazu(sb, s.nutzer, merkerZiel(r)!)) { handwerkStop(s, "fertig"); return false; } a.rest = 1; } /* Splitterkern: einmal */
  else if (!aufnehmen(sb, s.nutzer, r.ergebnis, r.menge || 1)) { handwerkStop(s, "voll"); return false; } else stueck = r.menge || 1;
  const vorher = handwerkLevel(s.nutzer, r.station), xp = Math.round(r.xp * (glut ? 1.5 : 1)), b = berufAn(r.station); berufXpDazu(sb, s.nutzer, b, xp); const nachher = handwerkLevel(s.nutzer, r.station);
  a.rest--; const G = GEGENSTAENDE[laden === AN_WAFFE ? (waffeLadung(s.nutzer) || { g: "" }).g : laden || r.ergebnis]; HANDWERK_QUEST.fertig(s.nutzer, r); /* jedes Stück zählt für Quests (2 Bogensehnen, 2 Kupferbarren …) */ if (r.quest && ![r.quest, ...(r.auchQuest || [])].some((id) => HANDWERK_QUEST.weiter(s.nutzer, { ...r, quest: id }))) a.rest = 0; /* Questrezept: nur so viele, wie die Quest noch braucht (B2: drei Tafeln) */
  senden(s, { t: "handwerk", tat: "fertig", rezept: r.id, g: r.ergebnis, name: G ? G.name : merkerZiel(r) ? "Splitterkern im Wegstein" : r.ergebnis, xp, beruf: b, glut, gespart: spar >= 0, rest: a.rest, level: nachher, aufstieg: nachher > vorher ? nachher : 0,
    ...(laden ? { ladungen: laden === AN_WAFFE ? (waffeLadung(s.nutzer) || { n: 0 }).n : ladungen(s.nutzer, laden), stueck } : r.menge ? { stueck } : {}) });
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
