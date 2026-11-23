/*
 * Mythara – Kampf- und Progressionsregeln v3 (eigener Held). Eine Quelle für Simulation, Server und Anzeige.
 * Grundlage (23.11.2026): „Kampf-XP & Kampfstile – Grundlagen“, „Nahkampf / Max-Hit – OSRS-basierte Schadensformel“, „Fernkampf – OSRS-basierte Regelübernahme“,
 *   „Magie: Überarbeitung der Kampfstile“, „XP-Kurven pro Skill (85 % OSRS)“.
 *
 * Tick: 1 Tick = 0,5 Sekunden. Jeder Angriff dauert eine ganze Zahl von Ticks und fällt auf einen Tick.
 * Sechs Skills (Level 1–100), alle mit derselben Kurve: 85 % der kumulierten OSRS-XP je Level, kaufmännisch gerundet (Level 2 = 71, Level 99 = 11.079.266, Level 100 = 12.232.486).
 * Trefferwurf (bleibt Mythara): Zufall(0, Trefferwert) gegen Zufall(0, Verteidigung des Ziels für diese Angriffsart); Treffer nur, wenn der Angriffswurf strikt höher ist.
 * Schadenswurf (bleibt Mythara): ganzzahlig 1 … Max Hit.
 * Nahkampf – 4 Stile:  Trefferwert = Geschick + Stilbonus + Geschick der Ausrüstung;  Max Hit = ⌊0,5 + (Stärke + Stilbonus + 8) × (W + 64) ÷ 640⌋ (mind. 1), W = Summe aller Stärkeboni der Ausrüstung.
 *   Akkurat +3 Geschick (4 Geschick-XP je Schaden) · Ausgewogen +1 Geschick, +1 Stärke, +1 Defense (je 1,33 Geschick/Stärke/Defense) · Aggressiv +3 Stärke (4 Stärke) · Verteidigung +3 Defense (4 Defense).
 * Fernkampf – 3 Stile: Trefferwert = Fernkampf + Stilbonus + fernAngriff ÷ 3;  Max Hit = ⌊0,5 + (Fernkampf + Stilbonus + 8) × (fernStaerke gesamt + 64) ÷ 640⌋ (mind. 1).
 *   Akkurat +3 Fernkampf (4 Fernkampf-XP) · Schnell −1 Tick (4 Fernkampf) · Fern +2 Felder, +3 Defense (2 Fernkampf + 2 Defense).
 * Magie – 3 Stile:     Trefferwert = Magie + Stilbonus + Magische Genauigkeit der Waffe;  Max Hit = ⌊0,5 + (Magie + Stilbonus) × (magieStaerke gesamt + 64) ÷ 640⌋ (mind. 1; ohne die +8).
 *   Akkurat +3 Magie (2 Magie-XP) · Schnell −1 Tick (2 Magie) · Defensiv +1 Magie, +3 Defense (1,33 Magie + 1 Defense).
 * Lebenspunkte: 1,33 XP je tatsächlich verursachtem Schadenspunkt (jeder Stil); Max-LP = 9 + LP-Level (Start 10).
 * Defense: bekommt XP nur noch über die Stile (kein XP mehr je Block). Die Stilboni auf Defense zählen für die Verteidigung gegen Nah- und Fernkampf.
 * Verteidigung: Nahkampf und Fernkampf = Defense-Level + Stilbonus + Ausrüstung; Magie = Magie-Level + Ausrüstung.
 * XP werden intern mit Nachkommastellen geführt (Rest je Skill), gebucht werden ganze XP.
 * Heldenlevel = ⌊Summe der sechs Skill-Level ÷ 6⌋. Erholung: 1 LP je 100 Game-Ticks (50 s), immer (LP_REGEN_TICKS).
 * Gegner: feste Zahlen ohne Ausrüstung (config.ts MonsterDef.v2): Geschick (Trefferwert), Stärke (Schaden 1…Stärke), Ticks, Abwehr, Nahkampfreichweite wie die Helden.
 */
import { GEGENSTAENDE, Platz, WaffenWerte } from "./gegenstaende";

export type Skill = "geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense";
export type Art = "nah" | "fern" | "magie";
export const SKILLS: Skill[] = ["geschick", "staerke", "fernkampf", "magie", "lp", "defense"];
export const SKILL_NAME: Record<Skill, string> = { geschick: "Geschick", staerke: "Stärke", fernkampf: "Fernkampf", magie: "Magie", lp: "Lebenspunkte", defense: "Defense" };
/** LP-XP je tatsächlich verursachtem Schadenspunkt (jeder Stil) */
export const LP_XP_JE_SCHADEN = 4 / 3;
export const SKILL_MAX = 100, ERHOLUNG = { nach: 5, jeSek: 0.04 }, LP_START = 10;
/** Lebensregeneration (eigener Held): 1 LP je 100 Game-Ticks (50 Sekunden), immer – auch im Kampf und außerhalb der Kampfgebiete */
export const LP_REGEN_TICKS = 100, LP_REGEN_SEK = LP_REGEN_TICKS * 0.5;
/** 1 Tick in Sekunden; gemeinsame Nahkampfreichweite (Felder, vom Rand des Ziels) */
export const TICK = 0.5, NAH_REICH = 1.5;
export interface SkillXp { geschick: number; staerke: number; fernkampf: number; magie: number; lp: number; defense: number }
export const NULL_XP: SkillXp = { geschick: 0, staerke: 0, fernkampf: 0, magie: 0, lp: 0, defense: 0 };

/** Angriffsstile je Kampfart (Nahkampf 4, Fernkampf und Magie 3; Index 1 ist der Standard) mit ihren unsichtbaren Boni und den XP je Schadenspunkt */
export interface Stil { id: string; name: string; text: string; /** Bonus auf die effektiven Level */ plus: Partial<Record<Skill, number>>; /** Ticks dazu, Felder Reichweite dazu */ ticks?: number; reich?: number; /** XP je Schadenspunkt */ xp: Partial<Record<Skill, number>> }
const D = 4 / 3;
export const STILE: Record<Art, Stil[]> = {
  nah: [{ id: "akkurat", name: "Akkurat", text: "+3 Geschick · 4 Geschick-XP je Schaden", plus: { geschick: 3 }, xp: { geschick: 4 } },
    { id: "ausgewogen", name: "Ausgewogen", text: "+1 Geschick, +1 Stärke, +1 Defense · XP zu je einem Drittel", plus: { geschick: 1, staerke: 1, defense: 1 }, xp: { geschick: D, staerke: D, defense: D } },
    { id: "aggressiv", name: "Aggressiv", text: "+3 Stärke · 4 Stärke-XP je Schaden", plus: { staerke: 3 }, xp: { staerke: 4 } },
    { id: "verteidigung", name: "Verteidigung", text: "+3 Defense · 4 Defense-XP je Schaden", plus: { defense: 3 }, xp: { defense: 4 } }],
  fern: [{ id: "akkurat", name: "Akkurat", text: "+3 Fernkampf · 4 Fernkampf-XP je Schaden", plus: { fernkampf: 3 }, xp: { fernkampf: 4 } },
    { id: "schnell", name: "Schnell", text: "1 Tick schneller · 4 Fernkampf-XP je Schaden", plus: {}, ticks: -1, xp: { fernkampf: 4 } },
    { id: "fern", name: "Fern", text: "+2 Felder Reichweite, +3 Defense · 2 Fernkampf- und 2 Defense-XP", plus: { defense: 3 }, reich: 2, xp: { fernkampf: 2, defense: 2 } }],
  magie: [{ id: "akkurat", name: "Akkurat", text: "+3 Magie · 2 Magie-XP je Schaden", plus: { magie: 3 }, xp: { magie: 2 } },
    { id: "schnell", name: "Schnell", text: "1 Tick schneller · 2 Magie-XP je Schaden", plus: {}, ticks: -1, xp: { magie: 2 } },
    { id: "defensiv", name: "Defensiv", text: "+1 Magie, +3 Defense · 1,33 Magie- und 1 Defense-XP", plus: { magie: 1, defense: 3 }, xp: { magie: D, defense: 1 } }],
};

export interface Kampfwerte {
  /** Trefferwert je Angriffsart (nur die der Waffe zählt) und Verteidigung je Angriffsart */ angriff: Record<Art, number>; abwehr: Record<Art, number>;
  /** schaden: Wurfbereich 1 … Max Hit; plus (Magie): Endschaden = Wurf + plus, gerundet; bonus: seit v3 immer 0 (bleibt für alte Aufrufer); takt in Sekunden = ticks × TICK */
  waffe: { art: Art; schaden: [number, number]; plus: number; bonus: number; ticks: number; takt: number; reich: number; flug?: number };
  stil: number; max: number; heldenlevel: number; skills: SkillXp }

/** XP-Kurve aller Skills: 85 % der kumulierten OSRS-XP je Level (OSRS-Formel, für Level 100 um eine Stufe fortgeführt), kaufmännisch gerundet */
const XP_KURVE: number[] = (() => { const k = [0, 0]; let punkte = 0; for (let L = 2; L <= SKILL_MAX; L++) { punkte += Math.floor(L - 1 + 300 * Math.pow(2, (L - 1) / 7)); k[L] = Math.round(Math.floor(punkte / 4) * 0.85); } return k; })();
/** Kumulierte XP für Level L (alle Skills dieselbe Kurve; der zweite Parameter bleibt für Aufrufer erhalten) */
export const xpFuer = (L: number, _skill?: Skill): number => (L <= 1 ? 0 : XP_KURVE[Math.min(SKILL_MAX, Math.floor(L))]);
/** Skilllevel aus XP (1–100) */
export function levelAus(xp: number, skill?: Skill): number { let L = 1; while (L < SKILL_MAX && xp >= xpFuer(L + 1, skill)) L++; return L; }
export const heldenlevel = (x: SkillXp): number => Math.floor(SKILLS.reduce((n, k) => n + levelAus(x[k] || 0, k), 0) / SKILLS.length);
/** Max-LP aus den LP-XP: 9 + LP-Level (Start 10) */
export const maxLp = (lpXp: number): number => LP_START - 1 + levelAus(lpXp || 0, "lp");
/** Fäuste: wenn keine Waffe angelegt ist */
export const FAEUSTE: WaffenWerte = { art: "nah", ticks: 2, reich: NAH_REICH, geschick: 0, staerke: 0 };
/** Gültiger Stil-Index für eine Kampfart (sonst der Standard 1) */
export const stilIndex = (s: number | undefined, art: Art = "nah"): number => (typeof s === "number" && Number.isInteger(s) && s >= 0 && s < STILE[art].length ? s : 1);
/** Max Hit nach der OSRS-Grundformel: ⌊0,5 + (Level + Stilbonus + 8) × (Ausrüstungsbonus + 64) ÷ 640⌋, mindestens 1.
 *  Magie (vereinfacht, grund = 0): effektive Magie = Magie-Level + Stilbonus, ohne die +8. */
export const maxHit = (level: number, stilbonus: number, ausruestung: number, grund = 8): number => Math.max(1, Math.floor(0.5 + (level + stilbonus + grund) * (ausruestung + 64) / 640));
export const maxHitMagie = (level: number, stilbonus: number, magieStaerke: number): number => maxHit(level, stilbonus, magieStaerke, 0);

/** Die Kampfwerte eines Helden aus seinen Skill-XP, der angelegten Ausrüstung und dem Angriffsstil (Index in STILE der Kampfart, 1 = Standard) */
export function kampfwerte(x: SkillXp, angelegt: Partial<Record<Platz, string>>, stil = 1): Kampfwerte {
  const hl = heldenlevel(x), lv = Object.fromEntries(SKILLS.map((k) => [k, levelAus(x[k] || 0, k)])) as Record<Skill, number>;
  const W = angelegt.waffe && GEGENSTAENDE[angelegt.waffe] && GEGENSTAENDE[angelegt.waffe].waffe ? GEGENSTAENDE[angelegt.waffe].waffe! : FAEUSTE;
  const s = stilIndex(stil, W.art), S = STILE[W.art][s], p = (k: Skill) => S.plus[k] || 0;
  /* Ausrüstung gesamt: Waffe und die Boni aller angelegten Teile */
  const aus = { geschick: W.geschick || 0, staerke: W.staerke || 0, fernAngriff: W.fernAngriff || 0, fernStaerke: W.fernStaerke || 0, magieStaerke: W.magieStaerke || 0 };
  const abwehr: Record<Art, number> = { nah: lv.defense + p("defense"), fern: lv.defense + p("defense"), magie: lv.magie }; /* Defense-Level (+ Stilbonus) für Nah- und Fernkampf, Magie-Level für Magie */
  for (const pl of ["kopf", "nebenhand", "brust", "beine"] as Platz[]) { const G = angelegt[pl] && GEGENSTAENDE[angelegt[pl]!]; if (!G) continue;
    if (G.abwehr) for (const a of ["nah", "fern", "magie"] as Art[]) abwehr[a] += G.abwehr[a];
    if (G.bonus) for (const k of ["geschick", "staerke", "fernAngriff", "fernStaerke", "magieStaerke"] as const) aus[k] += G.bonus[k] || 0; }
  const angriff: Record<Art, number> = { nah: 0, fern: 0, magie: 0 }; let schaden: [number, number]; const plus = 0, ticks = Math.max(1, W.ticks + (S.ticks || 0)), reich = W.reich + (S.reich || 0);
  if (W.art === "nah") { angriff.nah = lv.geschick + p("geschick") + aus.geschick; schaden = [1, maxHit(lv.staerke, p("staerke"), aus.staerke)]; }
  else if (W.art === "fern") { angriff.fern = lv.fernkampf + p("fernkampf") + aus.fernAngriff / 3; schaden = [1, maxHit(lv.fernkampf, p("fernkampf"), aus.fernStaerke)]; }
  else { angriff.magie = lv.magie + p("magie") + (W.genau || 0); schaden = [1, maxHitMagie(lv.magie, p("magie"), aus.magieStaerke)]; }
  return { angriff, abwehr, waffe: { art: W.art, schaden, plus, bonus: 0, ticks, takt: ticks * TICK, reich, ...(W.flug ? { flug: W.flug } : {}) }, stil: s, max: maxLp(x.lp), heldenlevel: hl, skills: { ...NULL_XP, ...x } };
}
/** Schaden eines Treffers: ganzzahliger Wurf 1 … Max Hit (z = Zufall 0…1); plus ist seit der Magie-Max-Hit-Formel immer 0 */
export function schadenWurf(w: Kampfwerte["waffe"], z: number): number { const r = w.schaden[0] + Math.floor(z * (w.schaden[1] - w.schaden[0] + 1));
  return w.art === "magie" ? Math.max(1, Math.round(r + w.plus)) : r; }
/** XP je tatsächlich verursachtem Schadenspunkt, je Skill (nach Kampfart und Stil; LP kommen immer dazu: LP_XP_JE_SCHADEN) */
export function xpZiel(art: Art, stil: number): Partial<Record<Skill, number>> { return STILE[art][stilIndex(stil, art)].xp; }
/** Skill-XP aus unbekannter Quelle prüfen (nur nicht negative ganze Zahlen) */
export function skillXpPruefen(v: unknown): SkillXp { const o = (v || {}) as Partial<SkillXp>, z = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0);
  return { geschick: z(o.geschick), staerke: z(o.staerke), fernkampf: z(o.fernkampf), magie: z(o.magie), lp: z(o.lp), defense: z(o.defense) }; }
/** Trefferchance bei stetigen Würfen (Anzeige und Balancing): A gegen V */
export const trefferChance = (a: number, v: number): number => (a <= 0 ? 0 : v <= 0 ? 1 : a >= v ? 1 - v / (2 * a) : a / (2 * v));
