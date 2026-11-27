/*
 * Riftmere – Tiere zur Stimmung (Phase 11, Wunsch des Nutzers „nicht zu leer“): Ziegen, Murmeltiere, Schafe wandern friedlich in ihrem Umkreis umher.
 * Kein Kampf, kein Server: die Stelle jedes Tiers hängt nur von der Uhr ab (alle sehen es gleich, wie die Reisenden in reisende.ts). Je Abschnitt (TIER_TAKT Sekunden)
 * geht es zu einem neuen zufälligen Punkt im Umkreis (fest aus Platz, Nummer und Abschnitt), dann frisst es oder macht Männchen. Der Browser zeichnet nur Tiere in der Nähe
 * (welt3d/npc3d.ts TierFigur) – fern der Helden wird nichts gerechnet. Die Plätze stehen in shared/tierplaetze.json (Welt schlägt sie vor).
 * Die Schafe und Enten des Südens bleiben Lager-Gegner (man kann sie scheren bzw. rupfen: Garn und Federn als Beute).
 */
import PLAETZE_JSON from "./tierplaetze.json";

export type TierArt = "ziege" | "murmeltier" | "schaf";
export interface TierDef { /** Modell (img/figuren-echt3d) */ datei: string; /** Felder je Sekunde */ tempo: number; /** Bewegung in der Pause */ pause: string; /** Höhe für Npc3D (1,8 = Größe des Modells) */ hoehe: number }
export const TIERARTEN: Record<TierArt, TierDef> = {
  ziege: { datei: "ziege3d", tempo: 0.7, pause: "fressen", hoehe: 1.8 },
  murmeltier: { datei: "murmeltier3d", tempo: 1.3, pause: "maennchen", hoehe: 1.8 },
  schaf: { datei: "schaf3d", tempo: 0.55, pause: "fressen", hoehe: 1.8 },
};
export interface Tierplatz { id: string; art: TierArt; /** Mitte (Weltfelder) */ x: number; y: number; /** Umkreis (Felder) */ radius: number; anzahl: number }
export const TIERPLAETZE: Tierplatz[] = (PLAETZE_JSON as { plaetze: Tierplatz[] }).plaetze.filter((p) => p.art in TIERARTEN);
/** Länge eines Abschnitts (s): gehen, dann Pause */
export const TIER_TAKT = 14;
/** fester Zufall 0…1 aus Zahlen */
function zufall(...n: number[]): number { let h = 2166136261; for (const v of n) { h ^= Math.floor(v * 1000) | 0; h = Math.imul(h, 16777619) >>> 0; h ^= h >>> 13; h = Math.imul(h, 2246822519) >>> 0; } return (h >>> 0) / 4294967296; }
const kennzahl = (s: string): number => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
/** Ziel des Abschnitts k: ein Punkt im Umkreis (frei: nur begehbare Punkte – sonst die Mitte) */
function punkt(p: Tierplatz, s: number, k: number, frei?: (x: number, y: number) => boolean): [number, number] {
  for (let c = 0; c < 6; c++) { const a = zufall(s, k, c) * Math.PI * 2, d = p.radius * Math.sqrt(zufall(s, k, c + 17)), x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d; if (!frei || frei(x, y)) return [x, y]; }
  return [p.x, p.y]; }
/** Wo ist Tier i des Platzes zur Zeit t (Sekunden)? geht: unterwegs (sonst Pause) */
export function tierStelle(p: Tierplatz, i: number, t: number, frei?: (x: number, y: number) => boolean): { x: number; y: number; dx: number; dy: number; geht: boolean } {
  const s = kennzahl(p.id) + i * 7919, T = t + zufall(s, 99) * TIER_TAKT, k = Math.floor(T / TIER_TAKT), u = T - k * TIER_TAKT;
  const [ax, ay] = punkt(p, s, k, frei), [bx, by] = punkt(p, s, k + 1, frei), dauer = Math.min(TIER_TAKT * 0.6, Math.hypot(bx - ax, by - ay) / TIERARTEN[p.art].tempo);
  if (u < dauer) { const f = u / dauer; return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, dx: bx - ax, dy: by - ay, geht: true }; }
  return { x: bx, y: by, dx: bx - ax, dy: by - ay, geht: false }; }
