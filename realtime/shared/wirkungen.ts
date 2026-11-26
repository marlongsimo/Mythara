/*
 * Riftmere – Wirkungen (Phase 3b, 26.11.2026; Konzept doku/konzepte/phase-3.md Abschnitt 3b).
 * Eine Wirkung ist { id, art, werte, bis }: der Server führt sie im Inventar des Helden (inventar.wirkungen), rechnet sie in die Kampfwerte ein
 * und lässt sie nach der Uhr ablaufen – auch während man abgemeldet ist (bis ist eine feste Zeit).
 * Je Art höchstens eine: eine neue Essens-Wirkung ersetzt die alte. Der Platz für Tränke („trank“) folgt in Phase 5.
 */
import type { Skill } from "./kampfwerte";

export type WirkArt = "essen" | "trank";
/** Was eine Wirkung verändert: Skill-Level (+n, wie ein Trank in anderen Spielen) oder die Erholung der Ausdauer (Anteil, 0.25 = 25 % schneller) */
export type WirkWert = Skill | "ausdauer";
export interface Wirkung { id: string; art: WirkArt; werte: Partial<Record<WirkWert, number>>; bis: number }
export interface WirkDef { id: string; art: WirkArt; werte: Partial<Record<WirkWert, number>>; ms: number; name: string; /** kurz, für Symbol und Rucksack */ text: string; symbol: string }

const B = "img/objekte3d/skilling/symbole/";
export const WIRKUNGEN: Record<string, WirkDef> = {
  fischsuppe: { id: "fischsuppe", art: "essen", werte: { defense: 2 }, ms: 5 * 60_000, name: "Fischsuppe", text: "Defense +2", symbol: B + "kochen_klein.webp" },
  bauerneintopf: { id: "bauerneintopf", art: "essen", werte: { ausdauer: 0.25 }, ms: 10 * 60_000, name: "Bauerneintopf", text: "Ausdauer erholt sich 25 % schneller", symbol: B + "kochen_klein.webp" },
};
const SKILL_WERTE: Skill[] = ["geschick", "staerke", "fernkampf", "magie", "lp", "defense"];

/** Nur die noch laufenden */
export const wirkungenAktiv = (w: Wirkung[] | undefined, jetzt = Date.now()): Wirkung[] => (w || []).filter((x) => x.bis > jetzt);
/** Neue Wirkung dazu: ersetzt eine laufende derselben Art */
export function wirkungDazu(w: Wirkung[] | undefined, id: string, jetzt = Date.now()): Wirkung[] {
  const D = WIRKUNGEN[id]; if (!D) return wirkungenAktiv(w, jetzt);
  return [...wirkungenAktiv(w, jetzt).filter((x) => x.art !== D.art), { id, art: D.art, werte: { ...D.werte }, bis: jetzt + D.ms }]; }
/** Skill-Plus aller laufenden Wirkungen (für shared/kampfwerte.ts) */
export function skillPlus(w: Wirkung[] | undefined, jetzt = Date.now()): Partial<Record<Skill, number>> {
  const p: Partial<Record<Skill, number>> = {}; for (const x of wirkungenAktiv(w, jetzt)) for (const k of SKILL_WERTE) if (x.werte[k]) p[k] = (p[k] || 0) + x.werte[k]!; return p; }
/** Faktor auf die Erholung der Ausdauer (1 = normal) */
export const ausdauerMal = (w: Wirkung[] | undefined, jetzt = Date.now()): number => 1 + wirkungenAktiv(w, jetzt).reduce((s, x) => s + (x.werte.ausdauer || 0), 0);
/** Gespeicherte Wirkungen prüfen (nur bekannte, mit Werten aus der Liste, höchstens eine je Art) */
export function wirkungenPruefen(roh: unknown): Wirkung[] {
  if (!Array.isArray(roh)) return []; const aus: Wirkung[] = [];
  for (const r of roh) { const o = (r || {}) as Partial<Wirkung>, D = typeof o.id === "string" ? WIRKUNGEN[o.id] : undefined, bis = Number(o.bis);
    if (!D || !Number.isFinite(bis) || aus.some((x) => x.art === D.art)) continue; aus.push({ id: D.id, art: D.art, werte: { ...D.werte }, bis }); }
  return aus; }
