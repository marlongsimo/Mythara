/*
 * Mythara – Kampf- und Progressionsregeln v2 (eigener Held). Eine Quelle für Simulation, Server und Anzeige.
 * Grundlage: „Nahkampf-Balancing v2“, „Fernkampf-Balancing v4“, „Magie-Balancing v2“, „Rüstung Brust- und Schildslot v1“ (22.11.2026).
 *
 * Tick: 1 Tick = 0,5 Sekunden. Jeder Angriff dauert eine ganze Zahl von Ticks und fällt auf einen Tick.
 * Vier Skills, alle beginnen auf 1 und steigen nur durch XP: Geschick, Stärke, Fernkampf, Magie.
 *   1 tatsächlich abgezogener Lebenspunkt = 2 XP. Nahkampf: Genau → Geschick, Aggressiv → Stärke, Normal → je die Hälfte. Fernkampf → Fernkampf, Magie → Magie.
 * Trefferwurf: Zufall(0, Trefferwert) gegen Zufall(0, Verteidigung des Ziels für diese Angriffsart); Treffer nur, wenn der Angriffswurf strikt höher ist.
 * Nahkampf:  Trefferwert = (Geschick + Waffen-Geschick) × Stil-Faktor;  Max Hit = ⌊(Waffen-Stärke + Stärke ÷ 3) × Stil-Faktor⌋ (mind. 1); Schaden 1…Max Hit.
 *            Genau ×1,05 / ×0,95 · Normal ×1 / ×1 · Aggressiv ×0,95 / ×1,05. Takt: Kurzwaffen 2, Langwaffen 3, Zweihänder 4 Ticks. Gemeinsame Reichweite NAH_REICH.
 * Fernkampf: Trefferwert = Fernkampf + Fernkampfstärke der Waffe ÷ 3; Schaden 1…Fernkampfstärke (der Skill erhöht den Schaden nicht).
 *            Akkurat −1 Tick, −10 % Reichweite · Normal · Fern +1 Tick, +10 % Reichweite.
 * Magie:     Trefferwert = Magie + Magische Genauigkeit der Waffe; Schaden = (Waffenwurf + Magie ÷ 3) × (1 + Stil-Bonus), gerundet, mind. 1.
 *            Schnell −1 Tick, 0 % · Normal +2 % · Fokus +1 Tick, +4 %. Einheitliche Reichweite 6.
 * LP und Defense („LP & Defense Fortschritt v1“): zwei weitere Skills mit eigenen XP-Kurven (Meilensteine, dazwischen gleichmäßig wachsend).
 *   LP: 1 XP je tatsächlich verursachtem Schadenspunkt; Max-LP = 19 + LP-Level (Start 20).
 *   Defense: 10 XP je Block (jeder verfehlte Gegnerangriff zählt als Block); Defense-Grundwert = Defense-Level (Start 1).
 * Verteidigung: Nahkampf und Fernkampf = Defense-Level + Brust + Schild; Magie = Magie-Level + Brust + Schild (ersetzt 1 + 0,5 × (Heldenlevel − 1)).
 * Heldenlevel = ⌊Summe der sechs Skill-Level ÷ 6⌋. XP der vier Kampfskills für Level L (kumuliert) = ⌊100 × (L^2,2 − 1)⌋, Level 1–100.
 * Erholung: im Kampf keine; 5 s nach dem letzten Angriff 4 % der Max-LP je Sekunde.
 * Gegner: feste Zahlen ohne Ausrüstung (config.ts MonsterDef.v2): Geschick (Trefferwert), Stärke (Schaden 1…Stärke), Ticks, Abwehr, Nahkampfreichweite wie die Helden.
 */
import { GEGENSTAENDE, Platz, WaffenWerte } from "./gegenstaende";

export type Skill = "geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense";
export type Art = "nah" | "fern" | "magie";
export const SKILLS: Skill[] = ["geschick", "staerke", "fernkampf", "magie", "lp", "defense"];
export const SKILL_NAME: Record<Skill, string> = { geschick: "Geschick", staerke: "Stärke", fernkampf: "Fernkampf", magie: "Magie", lp: "Lebenspunkte", defense: "Defense" };
/** LP-XP je tatsächlich verursachtem Schadenspunkt, Defense-XP je Block */
export const LP_XP_JE_SCHADEN = 1, DEFENSE_XP_JE_BLOCK = 10;
export const XP_JE_SCHADEN = 2, SKILL_MAX = 100, ERHOLUNG = { nach: 5, jeSek: 0.04 };
/** 1 Tick in Sekunden; gemeinsame Nahkampfreichweite (Felder, vom Rand des Ziels) */
export const TICK = 0.5, NAH_REICH = 1.5;
export interface SkillXp { geschick: number; staerke: number; fernkampf: number; magie: number; lp: number; defense: number }
export const NULL_XP: SkillXp = { geschick: 0, staerke: 0, fernkampf: 0, magie: 0, lp: 0, defense: 0 };

/** Angriffsstile je Kampfart (Index 0, 1, 2; 1 = Normal) */
export interface Stil { id: string; name: string; text: string }
export const STILE: Record<Art, Stil[]> = {
  nah: [{ id: "genau", name: "Genau", text: "+5 % Geschick, −5 % Stärke · XP an Geschick" }, { id: "normal", name: "Normal", text: "Ausgewogen · XP je zur Hälfte an Geschick und Stärke" }, { id: "aggressiv", name: "Aggressiv", text: "−5 % Geschick, +5 % Stärke · XP an Stärke" }],
  fern: [{ id: "akkurat", name: "Akkurat", text: "1 Tick schneller, −10 % Reichweite" }, { id: "normal", name: "Normal", text: "Grundtakt und Grundreichweite" }, { id: "fern", name: "Fern", text: "1 Tick langsamer, +10 % Reichweite" }],
  magie: [{ id: "schnell", name: "Schnell", text: "1 Tick schneller, kein Schadensbonus" }, { id: "normal", name: "Normal", text: "Grundtakt, +2 % Schaden" }, { id: "fokus", name: "Fokus", text: "1 Tick langsamer, +4 % Schaden" }],
};
const NAH_FAKTOR: [number, number][] = [[1.05, 0.95], [1, 1], [0.95, 1.05]], TICK_PLUS = [-1, 0, 1], FERN_REICH = [0.9, 1, 1.1], MAGIE_BONUS = [0, 0.02, 0.04];

export interface Kampfwerte {
  /** Trefferwert je Angriffsart (nur die der Waffe zählt) und Verteidigung je Angriffsart */ angriff: Record<Art, number>; abwehr: Record<Art, number>;
  /** schaden: Wurfbereich; plus/bonus (Magie): Endschaden = (Wurf + plus) × (1 + bonus); takt in Sekunden = ticks × TICK */
  waffe: { art: Art; schaden: [number, number]; plus: number; bonus: number; ticks: number; takt: number; reich: number; flug?: number };
  stil: number; max: number; heldenlevel: number; skills: SkillXp }

/** LP-Kurve: kumulierte XP an den Meilensteinen (Defense: jeweils das Doppelte); dazwischen gleichmäßig wachsend (geometrisch), ganze Zahlen */
const LP_MEILENSTEINE: [number, number][] = [[1, 0], [2, 100], [3, 250], [5, 650], [10, 2500], [20, 10000], [30, 25000], [50, 80000], [75, 250000], [99, 650000], [100, 700000]];
const LP_KURVE: number[] = (() => { const k = [0, 0]; for (let L = 2; L <= SKILL_MAX; L++) { const i = LP_MEILENSTEINE.findIndex(([m]) => m >= L), [l1, x1] = LP_MEILENSTEINE[i - 1], [l2, x2] = LP_MEILENSTEINE[i];
  k[L] = L === l2 ? x2 : l1 === 1 ? Math.round(x2 * (L - 1) / (l2 - 1)) : Math.round(x1 * Math.pow(x2 / x1, (L - l1) / (l2 - l1))); } return k; })();
/** Kumulierte XP für Level L (Kampfskills; mit skill = "lp" oder "defense" deren eigene Kurve) */
export const xpFuer = (L: number, skill?: Skill): number => (L <= 1 ? 0 : skill === "lp" ? LP_KURVE[Math.min(SKILL_MAX, L)] : skill === "defense" ? 2 * LP_KURVE[Math.min(SKILL_MAX, L)] : Math.floor(100 * (Math.pow(L, 2.2) - 1)));
/** Skilllevel aus XP (1–100) */
export function levelAus(xp: number, skill?: Skill): number { let L = 1; while (L < SKILL_MAX && xp >= xpFuer(L + 1, skill)) L++; return L; }
export const heldenlevel = (x: SkillXp): number => Math.floor(SKILLS.reduce((n, k) => n + levelAus(x[k] || 0, k), 0) / SKILLS.length);
/** Max-LP aus den LP-XP: 19 + LP-Level */
export const maxLp = (lpXp: number): number => 19 + levelAus(lpXp || 0, "lp");
/** Fäuste: wenn keine Waffe angelegt ist */
export const FAEUSTE: WaffenWerte = { art: "nah", ticks: 2, reich: NAH_REICH, geschick: 0, staerke: 0 };
const stilIndex = (s: number | undefined): number => (s === 0 || s === 2 ? s : 1);

/** Die Kampfwerte eines Helden aus seinen Skill-XP, der angelegten Ausrüstung und dem Angriffsstil (0, 1 = Normal, 2) */
export function kampfwerte(x: SkillXp, angelegt: Partial<Record<Platz, string>>, stil = 1): Kampfwerte {
  const hl = heldenlevel(x), lv = Object.fromEntries(SKILLS.map((k) => [k, levelAus(x[k] || 0, k)])) as Record<Skill, number>, s = stilIndex(stil);
  const W = angelegt.waffe && GEGENSTAENDE[angelegt.waffe] && GEGENSTAENDE[angelegt.waffe].waffe ? GEGENSTAENDE[angelegt.waffe].waffe! : FAEUSTE;
  const abwehr: Record<Art, number> = { nah: lv.defense, fern: lv.defense, magie: lv.magie }; /* Defense-Level für Nah- und Fernkampf, Magie-Level für Magie */
  for (const p of ["nebenhand", "brust"] as Platz[]) { const G = angelegt[p] && GEGENSTAENDE[angelegt[p]!]; if (G && G.abwehr) for (const a of ["nah", "fern", "magie"] as Art[]) abwehr[a] += G.abwehr[a]; }
  const angriff: Record<Art, number> = { nah: 0, fern: 0, magie: 0 }; let schaden: [number, number], plus = 0, bonus = 0, ticks = W.ticks, reich = W.reich;
  if (W.art === "nah") { const [fg, fs] = NAH_FAKTOR[s]; angriff.nah = (lv.geschick + (W.geschick || 0)) * fg; schaden = [1, Math.max(1, Math.floor(((W.staerke || 0) + lv.staerke / 3) * fs))]; }
  else if (W.art === "fern") { angriff.fern = lv.fernkampf + (W.fernStaerke || 0) / 3; schaden = [1, Math.max(1, W.fernStaerke || 1)]; ticks = Math.max(1, W.ticks + TICK_PLUS[s]); reich = W.reich * FERN_REICH[s]; }
  else { angriff.magie = lv.magie + (W.genau || 0); schaden = W.schaden ? [W.schaden[0], W.schaden[1]] : [1, 1]; plus = lv.magie / 3; bonus = MAGIE_BONUS[s]; ticks = Math.max(1, W.ticks + TICK_PLUS[s]); }
  return { angriff, abwehr, waffe: { art: W.art, schaden, plus, bonus, ticks, takt: ticks * TICK, reich, ...(W.flug ? { flug: W.flug } : {}) }, stil: s, max: maxLp(x.lp), heldenlevel: hl, skills: { ...NULL_XP, ...x } };
}
/** Schaden eines Treffers: Wurf im Bereich (ganzzahlig, z = Zufall 0…1) und für Magie (Wurf + plus) × (1 + bonus), gerundet, mind. 1 */
export function schadenWurf(w: Kampfwerte["waffe"], z: number): number { const r = w.schaden[0] + Math.floor(z * (w.schaden[1] - w.schaden[0] + 1));
  return w.art === "magie" ? Math.max(1, Math.round((r + w.plus) * (1 + w.bonus))) : r; }
/** Wohin die XP eines Treffers gehen (Anteile je Skill) */
export function xpZiel(art: Art, stil: number): Partial<Record<Skill, number>> {
  if (art === "fern") return { fernkampf: 1 }; if (art === "magie") return { magie: 1 };
  return stil === 0 ? { geschick: 1 } : stil === 2 ? { staerke: 1 } : { geschick: 0.5, staerke: 0.5 }; }
/** Skill-XP aus unbekannter Quelle prüfen (nur nicht negative ganze Zahlen) */
export function skillXpPruefen(v: unknown): SkillXp { const o = (v || {}) as Partial<SkillXp>, z = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  return { geschick: z(o.geschick), staerke: z(o.staerke), fernkampf: z(o.fernkampf), magie: z(o.magie), lp: z(o.lp), defense: z(o.defense) }; }
/** Trefferchance bei stetigen Würfen (Anzeige und Balancing): A gegen V */
export const trefferChance = (a: number, v: number): number => (a <= 0 ? 0 : v <= 0 ? 1 : a >= v ? 1 - v / (2 * a) : a / (2 * v));
