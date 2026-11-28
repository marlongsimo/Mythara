/*
 * Riftmere – Wirkungen (Phase 3b, 26.11.2026; Konzept doku/konzepte/phase-3.md Abschnitt 3b).
 * Eine Wirkung ist { id, art, werte, bis }: der Server führt sie im Inventar des Helden (inventar.wirkungen), rechnet sie in die Kampfwerte ein
 * und lässt sie nach der Uhr ablaufen – auch während man abgemeldet ist (bis ist eine feste Zeit).
 * Je Art höchstens eine: eine neue Essens-Wirkung ersetzt die alte. Der Platz für Tränke („trank“) folgt in Phase 5.
 */
import type { Skill } from "./kampfwerte";

export type WirkArt = "essen" | "trank";
/** Was eine Wirkung verändert: Skill-Level (+n, wie ein Trank in anderen Spielen) oder die Erholung der Ausdauer (Anteil, 0.25 = 25 % schneller) */
export type WirkWert = Skill | "ausdauer" | "bemerken" | "magieSchaden"; /* magieSchaden (#176, Splittersicht): Prozentpunkte auf den Max Hit der Magie */ /* bemerken (#133, Nebelschleier): Anteil der Weite, auf die Gegner einen bemerken (0,75 = ein Viertel später) */
export interface Wirkung { id: string; art: WirkArt; werte: Partial<Record<WirkWert, number>>; bis: number }
export interface WirkDef { id: string; art: WirkArt; werte: Partial<Record<WirkWert, number>>; ms: number; name: string; /** kurz, für Symbol und Rucksack */ text: string; symbol: string }

const B = "img/objekte3d/skilling/symbole/";
export const WIRKUNGEN: Record<string, WirkDef> = {
  fischsuppe: { id: "fischsuppe", art: "essen", werte: { defense: 2 }, ms: 5 * 60_000, name: "Fischsuppe", text: "Defense +2", symbol: B + "kochen_klein.webp" },
  /* Phase 10 (#92): Räucherhering – lange haltbar, kleine Wirkung „Ausdauer“ */
  raeucherhering: { id: "raeucherhering", art: "essen", werte: { ausdauer: 0.15 }, ms: 20 * 60_000, name: "Räucherhering", text: "Ausdauer erholt sich 15 % schneller", symbol: B + "kochen_klein.webp" },
  /* Kräuterkunde (#133): Tränke belegen den Trank-Platz (je Art eine Wirkung: ein Trank und ein Essen zugleich) */
  steinhaut_schwach: { id: "steinhaut_schwach", art: "trank", werte: { defense: 2 }, ms: 3 * 60_000, name: "Steinhaut", text: "Defense +2", symbol: "img/objekte3d/kraeuterkunde/symbole/steinhaut_schwach.webp" },
  steinhaut_stark: { id: "steinhaut_stark", art: "trank", werte: { defense: 4 }, ms: 5 * 60_000, name: "Steinhaut (stark)", text: "Defense +4", symbol: "img/objekte3d/kraeuterkunde/symbole/steinhaut_stark.webp" },
  moorfeuer_schwach: { id: "moorfeuer_schwach", art: "trank", werte: { staerke: 2 }, ms: 3 * 60_000, name: "Moorfeuer", text: "Stärke +2", symbol: "img/objekte3d/kraeuterkunde/symbole/moorfeuer_schwach.webp" },
  moorfeuer_stark: { id: "moorfeuer_stark", art: "trank", werte: { staerke: 5 }, ms: 3 * 60_000, name: "Moorfeuer (stark)", text: "Stärke +5", symbol: "img/objekte3d/kraeuterkunde/symbole/moorfeuer_stark.webp" },
  nebelschleier_schwach: { id: "nebelschleier_schwach", art: "trank", werte: { bemerken: 0.75 }, ms: 5 * 60_000, name: "Nebelschleier", text: "Gegner bemerken dich später", symbol: "img/objekte3d/kraeuterkunde/symbole/nebelschleier_schwach.webp" },
  nebelschleier_stark: { id: "nebelschleier_stark", art: "trank", werte: { bemerken: 0.5, fernkampf: -3 }, ms: 5 * 60_000, name: "Nebelschleier (stark)", text: "Gegner bemerken dich erst halb so weit · Fernkampf −3", symbol: "img/objekte3d/kraeuterkunde/symbole/nebelschleier_stark.webp" },
  /* Süden (#126): Braten und Gulasch */
  wildschweinbraten: { id: "wildschweinbraten", art: "essen", werte: { staerke: 1 }, ms: 5 * 60_000, name: "Wildschweinbraten", text: "Stärke +1", symbol: B + "kochen_klein.webp" },
  wolfsgulasch: { id: "wolfsgulasch", art: "essen", werte: { defense: 2 }, ms: 5 * 60_000, name: "Wolfsgulasch", text: "Defense +2", symbol: B + "kochen_klein.webp" },
  /* #176 Zunft-Tränke (Kräuterkunde 75–85, 5 Minuten) */
  staerketrank_stark: { id: "staerketrank_stark", art: "trank", werte: { staerke: 7 }, ms: 5 * 60_000, name: "Trank der Stärke (stark)", text: "Stärke +7", symbol: "img/objekte3d/kraeuterkunde/symbole/staerketrank_stark.webp" },
  glutwurz_feuertrank: { id: "glutwurz_feuertrank", art: "trank", werte: { fernkampf: 7 }, ms: 5 * 60_000, name: "Glutwurz-Feuertrank", text: "Fernkampf +7", symbol: "img/objekte3d/kraeuterkunde/symbole/glutwurz_feuertrank.webp" },
  splittersicht: { id: "splittersicht", art: "trank", werte: { magieSchaden: 5 }, ms: 5 * 60_000, name: "Splittersicht", text: "Magieschaden +5 %", symbol: "img/objekte3d/kraeuterkunde/symbole/splittersicht.webp" },
  bauerneintopf: { id: "bauerneintopf", art: "essen", werte: { ausdauer: 0.25 }, ms: 10 * 60_000, name: "Bauerneintopf", text: "Ausdauer erholt sich 25 % schneller", symbol: B + "kochen_klein.webp" },
};
const SKILL_WERTE: Skill[] = ["geschick", "staerke", "fernkampf", "magie", "lp", "defense"];

/** Gegner bemerken den Helden erst auf diesem Anteil ihrer Weite (Nebelschleier, #133; 1 = wie immer) */
export function bemerkenFaktor(w: Wirkung[] | undefined, jetzt = Date.now()): number { let f = 1; for (const x of wirkungenAktiv(w, jetzt)) if (x.werte.bemerken) f *= x.werte.bemerken; return f; }
/** Nur die noch laufenden */
export const wirkungenAktiv = (w: Wirkung[] | undefined, jetzt = Date.now()): Wirkung[] => (w || []).filter((x) => x.bis > jetzt);
/** Neue Wirkung dazu: ersetzt eine laufende derselben Art */
export function wirkungDazu(w: Wirkung[] | undefined, id: string, jetzt = Date.now()): Wirkung[] {
  const D = WIRKUNGEN[id]; if (!D) return wirkungenAktiv(w, jetzt);
  return [...wirkungenAktiv(w, jetzt).filter((x) => x.art !== D.art), { id, art: D.art, werte: { ...D.werte }, bis: jetzt + D.ms }]; }
/** Skill-Plus aller laufenden Wirkungen (für shared/kampfwerte.ts) */
export function skillPlus(w: Wirkung[] | undefined, jetzt = Date.now()): Partial<Record<Skill, number>> {
  const p: Partial<Record<Skill, number>> = {}; for (const x of wirkungenAktiv(w, jetzt)) for (const k of SKILL_WERTE) if (x.werte[k]) p[k] = (p[k] || 0) + x.werte[k]!; return p; }
/** #176: Prozentpunkte Magieschaden aller laufenden Wirkungen (Splittersicht) */
export const magieSchadenPlus = (w: Wirkung[] | undefined, jetzt = Date.now()): number => wirkungenAktiv(w, jetzt).reduce((s, x) => s + (x.werte.magieSchaden || 0), 0);
/** Faktor auf die Erholung der Ausdauer (1 = normal) */
export const ausdauerMal = (w: Wirkung[] | undefined, jetzt = Date.now()): number => 1 + wirkungenAktiv(w, jetzt).reduce((s, x) => s + (x.werte.ausdauer || 0), 0);
/** Gespeicherte Wirkungen prüfen (nur bekannte, mit Werten aus der Liste, höchstens eine je Art) */
export function wirkungenPruefen(roh: unknown): Wirkung[] {
  if (!Array.isArray(roh)) return []; const aus: Wirkung[] = [];
  for (const r of roh) { const o = (r || {}) as Partial<Wirkung>, D = typeof o.id === "string" ? WIRKUNGEN[o.id] : undefined, bis = Number(o.bis);
    if (!D || !Number.isFinite(bis) || aus.some((x) => x.art === D.art)) continue; aus.push({ id: D.id, art: D.art, werte: { ...D.werte }, bis }); }
  return aus; }
