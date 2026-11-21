/*
 * Mythara – Kampf- und Progressionsregeln v1 (eigener Held). Eine Quelle für Simulation, Server und Anzeige.
 *
 * Drei Skills: Stärke (Nahkampf), Geschicklichkeit (Fernkampf), Magie. Alle beginnen auf 1 und steigen nur durch XP:
 * 1 tatsächlich abgezogener Lebenspunkt = 2 XP für den Skill der Angriffsart (kein Überkill, keine Kill-XP, kein Bonus).
 * Jeder Angriff: Angriffswurf Zufall(0, Angriff) gegen Blockwurf Zufall(0, Verteidigung). Blockwurf ≥ Angriffswurf → vollständig
 * geblockt (0 Schaden). Sonst Schaden Zufall(Min, Max). Kein Ausweichen, keine kritischen Treffer, keine Schadensminderung durch Rüstung.
 *   Angriff      = 1 + Skilllevel + Waffenbonus
 *   Verteidigung = 1 + 0,5 × (Heldenlevel − 1) + Schild + Rüstung   (je Angriffsart, aus allen Richtungen)
 *   Schaden      = Waffen-Min/-Max + ⌊Skilllevel / 10⌋
 *   Heldenlevel  = ⌊(Stärke + Geschicklichkeit + Magie) / 3⌋,  Max-LP = 60 + 2 × (Heldenlevel − 1)
 *   XP für Level L (kumuliert) = ⌊100 × (L^2,2 − 1)⌋, Level 1–100
 *   Erholung: im Kampf keine; 5 s nach dem letzten Angriff (eigenem oder fremdem) 4 % der Max-LP je Sekunde.
 * Die Zahlen sind die erste gemeinsame Testbasis aus dem Konzept „Mythara – Kampf- und Progressionskonzept v1“, nicht fertiges Balancing.
 */
import { GEGENSTAENDE, Platz, WaffenWerte } from "./gegenstaende";

export type Skill = "staerke" | "geschick" | "magie";
export type Art = "nah" | "fern" | "magie";
export const SKILL_VON: Record<Art, Skill> = { nah: "staerke", fern: "geschick", magie: "magie" };
export const SKILL_NAME: Record<Skill, string> = { staerke: "Stärke", geschick: "Geschicklichkeit", magie: "Magie" };
export const XP_JE_SCHADEN = 2, SKILL_MAX = 100, ERHOLUNG = { nach: 5, jeSek: 0.04 };
export interface SkillXp { staerke: number; geschick: number; magie: number }
export interface Kampfwerte { angriff: Record<Art, number>; abwehr: Record<Art, number>; waffe: { art: Art; schaden: [number, number]; takt: number; reich: number; flug?: number }; max: number; heldenlevel: number; skills: SkillXp }

/** Kumulierte XP für Level L */
export const xpFuer = (L: number): number => (L <= 1 ? 0 : Math.floor(100 * (Math.pow(L, 2.2) - 1)));
/** Skilllevel aus XP (1–100) */
export function levelAus(xp: number): number { let L = 1; while (L < SKILL_MAX && xp >= xpFuer(L + 1)) L++; return L; }
export const heldenlevel = (x: SkillXp): number => Math.floor((levelAus(x.staerke) + levelAus(x.geschick) + levelAus(x.magie)) / 3);
export const maxLp = (hl: number): number => 60 + 2 * (hl - 1);
/** Fäuste: wenn keine Waffe angelegt ist */
export const FAEUSTE: WaffenWerte = { art: "nah", bonus: 0, schaden: [1, 2], takt: 1.0, reich: 1.3 };

/** Die Kampfwerte eines Helden aus seinen Skill-XP und der angelegten Ausrüstung */
export function kampfwerte(x: SkillXp, angelegt: Partial<Record<Platz, string>>): Kampfwerte {
  const hl = heldenlevel(x), lv: Record<Skill, number> = { staerke: levelAus(x.staerke), geschick: levelAus(x.geschick), magie: levelAus(x.magie) };
  const W = angelegt.waffe && GEGENSTAENDE[angelegt.waffe] && GEGENSTAENDE[angelegt.waffe].waffe ? GEGENSTAENDE[angelegt.waffe].waffe! : FAEUSTE;
  const abwehr: Record<Art, number> = { nah: 1 + 0.5 * (hl - 1), fern: 1 + 0.5 * (hl - 1), magie: 1 + 0.5 * (hl - 1) };
  for (const p of ["nebenhand", "brust"] as Platz[]) { const G = angelegt[p] && GEGENSTAENDE[angelegt[p]!]; if (G && G.abwehr) for (const a of ["nah", "fern", "magie"] as Art[]) abwehr[a] += G.abwehr[a]; }
  const angriff: Record<Art, number> = { nah: 1 + lv.staerke, fern: 1 + lv.geschick, magie: 1 + lv.magie }; angriff[W.art] += W.bonus;
  const plus = Math.floor(lv[SKILL_VON[W.art]] / 10);
  return { angriff, abwehr, waffe: { art: W.art, schaden: [W.schaden[0] + plus, W.schaden[1] + plus], takt: W.takt, reich: W.reich, ...(W.flug ? { flug: W.flug } : {}) }, max: maxLp(hl), heldenlevel: hl, skills: { ...x } };
}
/** Skill-XP aus unbekannter Quelle prüfen (nur nicht negative ganze Zahlen) */
export function skillXpPruefen(v: unknown): SkillXp { const o = (v || {}) as Partial<SkillXp>, z = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  return { staerke: z(o.staerke), geschick: z(o.geschick), magie: z(o.magie) }; }
