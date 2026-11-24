/*
 * Mythara Echtzeit – Holzfällerei auf dem Server (shared/holz.ts). Der Server ist die einzige Wahrheit:
 *   · „holz“/„start“: Nähe zum Stamm, Holzfällerei-Level, bestes benutzbares Holzbeil, Baum steht noch, Platz im Rucksack.
 *   · Alle 4 Ticks (2 s) ein Hieb: Erfolg → Stamm (stapelt nicht) + XP, mit 25 % dazu 5–15 Splitter; danach fällt der Baum mit seiner Fällchance.
 *   · Kernschlag: nach einem Hieb manchmal (12 %) ein Fenster von 1,5 s; „holz“/„kern“ darin → zwei Stämme, 50 % mehr XP.
 *   · Gefällte Bäume sind für alle ein Stumpf, bis sie nachwachsen („baeume“ an alle; beim Anmelden der Stand).
 *   · Abbruch: weggegangen, Rucksack voll, Baum gefallen, anderes Ziel („holz“/„stop“) oder Verbindung weg.
 * XP liegen im Inventar des Helden (inventar.ts → berufe.holzfaellerei).
 */
import { BAEUME, HOLZBAEUME, holzbaum, BEILE, beilVon, hiebChance, HOLZ_TAKT_MS, HOLZ_WEIT, KERN_CHANCE, KERN_FENSTER_MS, SPLITTER_CHANCE, SPLITTER_MIN, SPLITTER_MAX, BERUF, Holzbaum } from "../../shared/holz";
import { levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aufnehmen, berufXp, berufXpDazu, besitzt, freieFaecher, platzFuer } from "./inventar";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HolzSpieler { nutzer: string; gast: boolean; wx?: number; wy?: number }
interface Sitzung { s: HolzSpieler; baum: Holzbaum; naechst: number; kernBis: number; stufe: number }
let sb: Sb = async () => null, senden: (s: HolzSpieler, m: object) => void = () => {}, alle: () => Iterable<HolzSpieler> = () => [];
const gefallen = new Map<string, number>(), sitzungen = new Map<HolzSpieler, Sitzung>();
/** Nur für Tests (Umgebung): HOLZ_KERN = Kernschlag-Chance, HOLZ_FALL = Faktor auf die Fällchance (0 = fällt nie) */
const KERN = process.env.HOLZ_KERN !== undefined ? Number(process.env.HOLZ_KERN) : KERN_CHANCE, FALL_FAKTOR = process.env.HOLZ_FALL !== undefined ? Number(process.env.HOLZ_FALL) : 1;
/** Zufall (für Tests austauschbar) */
export let wuerfel = Math.random; export function wuerfelSetzen(f: () => number): void { wuerfel = f; }

export function holzEinrichten(o: { sb: Sb; senden: (s: HolzSpieler, m: object) => void; alle: () => Iterable<HolzSpieler> }): void { sb = o.sb; senden = o.senden; alle = o.alle; }
export const holzLevel = (nutzer: string): number => levelAus(berufXp(nutzer, BERUF));
const stehtNoch = (id: string, jetzt = Date.now()) => !(gefallen.get(id)! > jetzt);
/** Die gefällten Bäume (für die Anzeige): [id, Sekunden bis nachgewachsen] */
export function gefaellte(jetzt = Date.now()): [string, number][] { return [...gefallen].filter(([, bis]) => bis > jetzt).map(([id, bis]) => [id, Math.ceil((bis - jetzt) / 1000)]); }
const allenMelden = () => { const m = { t: "baeume", weg: gefaellte() }; for (const s of alle()) senden(s, m); };
/** Bestes Beil, das man mit diesem Holzfällerei-Level benutzen darf (Rucksack oder Hand) */
function bestesBeil(nutzer: string, level: number): number { const hat = new Set(besitzt(nutzer)); let st = -1; for (const b of BEILE) if (hat.has(b.g) && b.level <= level) st = Math.max(st, b.stufe); return st; }
const nah = (s: HolzSpieler, b: Holzbaum) => s.wx !== undefined && s.wy !== undefined && Math.hypot(s.wx - b.x, s.wy - b.y) <= HOLZ_WEIT;

/** Mit dem Fällen beginnen. Zurück: Fehlertext oder null */
export function holzStart(s: HolzSpieler, id: string): string | null {
  if (s.gast) return "Holzfällen geht mit Konto (Menü → Anmelden).";
  const b = holzbaum(id); if (!b) return "Diesen Baum gibt es nicht."; const D = BAEUME[b.art];
  if (!nah(s, b)) return "Geh näher an den Baum.";
  if (!stehtNoch(id)) return `Hier steht nur noch ein Stumpf. Die ${D.name} wächst bald nach.`;
  const L = holzLevel(s.nutzer); if (L < D.level) return `Für eine ${D.name} brauchst du Holzfällerei ${D.level}.`;
  const st = bestesBeil(s.nutzer, L);
  if (st < 0) { const hat = BEILE.filter((x) => besitzt(s.nutzer).includes(x.g)); return hat.length ? `Für dein Holzbeil brauchst du Holzfällerei ${Math.min(...hat.map((x) => x.level))}.` : "Du brauchst ein Holzbeil."; }
  if (freieFaecher(s.nutzer) <= 0) return "Dein Rucksack ist voll.";
  sitzungen.set(s, { s, baum: b, naechst: Date.now() + HOLZ_TAKT_MS, kernBis: 0, stufe: st });
  senden(s, { t: "holz", tat: "start", id, beil: BEILE.find((x) => x.stufe === st)!.g }); return null;
}
export function holzStop(s: HolzSpieler, grund = ""): void { const z = sitzungen.get(s); if (!z) return; sitzungen.delete(s); senden(s, { t: "holz", tat: "stop", id: z.baum.id, grund }); }
export const holzWeg = (s: HolzSpieler): void => { sitzungen.delete(s); };
export const faellt = (s: HolzSpieler): string | null => (sitzungen.get(s) ? sitzungen.get(s)!.baum.id : null);

/** Ein Stamm (bzw. beim Kernschlag zwei): Rucksack, XP, Splitter-Wurf, Fällchance. Zurück: ob es weitergeht */
function ernten(z: Sitzung, kern: boolean, jetzt: number): boolean {
  const { s, baum } = z, D = BAEUME[baum.art], G = GEGENSTAENDE[D.stamm]; let staemme = 0, splitter = 0;
  for (let i = 0; i < (kern ? 2 : 1); i++) { if (!aufnehmen(sb, s.nutzer, D.stamm, 1)) break; staemme++;
    if (wuerfel() < SPLITTER_CHANCE) { const n = SPLITTER_MIN + Math.floor(wuerfel() * (SPLITTER_MAX - SPLITTER_MIN + 1)); if (platzFuer(s.nutzer, "splitter")) { splitter += aufnehmen(sb, s.nutzer, "splitter", n); } } }
  if (!staemme) { holzStop(s, "voll"); return false; }
  const vorher = holzLevel(s.nutzer), xp = D.xp * staemme * (kern ? 1.5 : 1); berufXpDazu(sb, s.nutzer, BERUF, xp); const nachher = holzLevel(s.nutzer);
  senden(s, { t: "holz", tat: "stamm", id: baum.id, g: D.stamm, name: G ? G.name : D.stamm, n: staemme, xp, splitter, kern, level: nachher, aufstieg: nachher > vorher ? nachher : 0 });
  if (wuerfel() < D.fall * FALL_FAKTOR) { gefallen.set(baum.id, jetzt + D.nachwachsen * 1000); for (const [o, w] of [...sitzungen]) if (w.baum.id === baum.id) holzStop(o, "gefallen"); allenMelden(); return false; }
  if (freieFaecher(s.nutzer) <= 0) { holzStop(s, "voll"); return false; }
  return true;
}
/** Kernschlag angetippt */
export function holzKern(s: HolzSpieler): void { const z = sitzungen.get(s); if (!z) return; const jetzt = Date.now();
  if (!z.kernBis || jetzt > z.kernBis + 300 /* Laufzeit */) { z.kernBis = 0; return; }
  z.kernBis = 0; if (ernten(z, true, jetzt)) z.naechst = jetzt + HOLZ_TAKT_MS; }

/** Takt: alle 100 ms (vom Weltserver gerufen) */
export function holzTakt(jetzt = Date.now()): void {
  let nach = false; for (const [id, bis] of [...gefallen]) if (bis <= jetzt) { gefallen.delete(id); nach = true; } if (nach) allenMelden();
  for (const [s, z] of [...sitzungen]) {
    if (!nah(s, z.baum)) { holzStop(s, "weg"); continue; }
    if (z.kernBis && jetzt > z.kernBis + 300) z.kernBis = 0;
    if (jetzt < z.naechst) continue; z.naechst = jetzt + HOLZ_TAKT_MS;
    const D = BAEUME[z.baum.art], L = holzLevel(s.nutzer); senden(s, { t: "holz", tat: "hieb", id: z.baum.id });
    if (wuerfel() < hiebChance(L, D, z.stufe)) { if (!ernten(z, false, jetzt)) continue; }
    if (!z.kernBis && wuerfel() < KERN) { z.kernBis = jetzt + KERN_FENSTER_MS; senden(s, { t: "holz", tat: "kern", id: z.baum.id, ms: KERN_FENSTER_MS }); }
  }
}
/** für Tests: alles zurücksetzen */
export function holzZuruecksetzen(): void { gefallen.clear(); sitzungen.clear(); }
export { HOLZBAEUME };
