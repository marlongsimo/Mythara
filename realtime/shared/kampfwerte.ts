/*
 * Mythara – Kampf- und Progressionsregeln v3 (eigener Held). Eine Quelle für Simulation, Server und Anzeige.
 * Grundlage (23.11.2026): „Kampf-XP & Kampfstile – Grundlagen“, „Nahkampf / Max-Hit – OSRS-basierte Schadensformel“, „Fernkampf – OSRS-basierte Regelübernahme“,
 *   „Magie: Überarbeitung der Kampfstile“, „XP-Kurven pro Skill (85 % OSRS)“.
 *
 * Tick: 1 Tick = 0,5 Sekunden. Jeder Angriff dauert eine ganze Zahl von Ticks und fällt auf einen Tick.
 * Sechs Skills (Level 1–100), alle mit derselben Kurve: 85 % der kumulierten OSRS-XP je Level, kaufmännisch gerundet (Level 2 = 71, Level 99 = 11.079.266, Level 100 = 12.232.486).
 * Trefferwurf (OSRS-Rechnung, seit 23.11.2026): Zufall(0, Angriffswurf) gegen Zufall(0, Verteidigungswurf des Ziels für diese Angriffsart); Treffer nur, wenn der Angriffswurf strikt höher ist.
 *   Jeder Wurf = effektives Level × (Ausrüstungsbonus + 64); effektives Level = Level + Stilbonus + 8 (Helden) bzw. Level + 9 (Gegner).
 * Schadenswurf (bleibt Mythara): ganzzahlig 1 … Max Hit.
 * Nahkampf – 4 Stile:  Angriffswurf = (Geschick + Stilbonus + 8) × (Geschick-Bonus der Ausrüstung + 64);  Max Hit = ⌊0,5 + (Stärke + Stilbonus + 8) × (W + 64) ÷ 640⌋ (mind. 1), W = Summe aller Stärkeboni der Ausrüstung.
 *   Akkurat +3 Geschick (4 Geschick-XP je Schaden) · Ausgewogen +1 Geschick, +1 Stärke, +1 Defense (je 1,33 Geschick/Stärke/Defense) · Aggressiv +3 Stärke (4 Stärke) · Verteidigung +3 Defense (4 Defense).
 * Fernkampf – 3 Stile: Angriffswurf = (Fernkampf + Stilbonus + 8) × (fernAngriff gesamt + 64) – Bögen enthalten die Pfeile, Armbrüste die Bolzen;  Max Hit = ⌊0,5 + (Fernkampf + Stilbonus + 8) × (fernStaerke gesamt + 64) ÷ 640⌋ (mind. 1).
 *   Akkurat +3 Fernkampf (4 Fernkampf-XP) · Schnell −1 Tick (4 Fernkampf) · Fern +2 Felder, +3 Defense (2 Fernkampf + 2 Defense).
 * Magie – 3 Stile:     Angriffswurf = (Magie + Stilbonus + 8) × (Magische Genauigkeit gesamt + 64) – der Stab enthält den Zauber (Magie-Stärke);  Max Hit = ⌊0,5 + (Magie + Stilbonus) × (magieStaerke gesamt + 64) ÷ 640⌋ (mind. 1; ohne die +8).
 *   Akkurat +3 Magie (2 Magie-XP) · Schnell −1 Tick (2 Magie) · Defensiv +1 Magie, +3 Defense (1,33 Magie + 1 Defense).
 * Lebenspunkte: Startlevel 10 (feste Start-XP dazu); 1,33 XP je tatsächlich verursachtem Schadenspunkt (jeder Stil); Max-LP = LP-Level (Start 10).
 * Defense: bekommt XP nur noch über die Stile (kein XP mehr je Block). Die Stilboni auf Defense zählen für die Verteidigung gegen Nah- und Fernkampf.
 * Verteidigung: Nahkampf und Fernkampf = (Defense + Stilbonus + 8) × (Rüstungsbonus + 64); Magie = (⌊0,7 × Magie⌋ + ⌊0,3 × (Defense + Stilbonus + 8)⌋) × (Magie-Rüstungsbonus + 64).
 *   Metallrüstung senkt wie in OSRS den Fernkampf- und Magie-Angriff (negative Boni).
 * XP werden intern mit Nachkommastellen geführt (Rest je Skill), gebucht werden ganze XP.
 * Heldenlevel (wie das Combat Level in OSRS, ohne Prayer) = ⌊0,25 × (Defense + Lebenspunkte) + max(0,325 × (Geschick + Stärke), 0,325 × (Fernkampf + ⌊Fernkampf ÷ 2⌋), 0,325 × (Magie + ⌊Magie ÷ 2⌋))⌋. Erholung: 1 LP je 100 Game-Ticks (50 s), immer (LP_REGEN_TICKS).
 * Gegner wie OSRS-Monster (config.ts MonsterDef.v2): Level der Kampfart, Defense, Magie, optional Angriffs- und Stärkebonus, Verteidigungsboni je Angriffsart, Ticks.
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
  waffe: { art: Art; schaden: [number, number]; plus: number; bonus: number; ticks: number; takt: number; reich: number; flug?: number; /** mehr Max Hit gegen eine Gegnerfamilie */ gegen?: Record<string, number>; /** Fernkampf: was fliegt (Armbrust: Bolzen, sonst Pfeil) – für die Darstellung bei allen Spielern */ geschoss?: "pfeil" | "bolzen" };
  stil: number; max: number; heldenlevel: number; skills: SkillXp }

/** XP-Kurve aller Skills: 85 % der kumulierten OSRS-XP je Level (OSRS-Formel, für Level 100 um eine Stufe fortgeführt), kaufmännisch gerundet */
const XP_KURVE: number[] = (() => { const k = [0, 0]; let punkte = 0; for (let L = 2; L <= SKILL_MAX; L++) { punkte += Math.floor(L - 1 + 300 * Math.pow(2, (L - 1) / 7)); k[L] = Math.round(Math.floor(punkte / 4) * 0.85); } return k; })();
/** Kumulierte XP für Level L (alle Skills dieselbe Kurve; der zweite Parameter bleibt für Aufrufer erhalten) */
export const xpFuer = (L: number, _skill?: Skill): number => (L <= 1 ? 0 : XP_KURVE[Math.min(SKILL_MAX, Math.floor(L))]);
/** Lebenspunkte starten auf Level 10 (wie in OSRS): zu den gebuchten LP-XP kommen fest die XP für Level 10 dazu */
export const LP_START_LEVEL = 10;
export const xpEffektiv = (xp: number, skill?: Skill): number => (skill === "lp" ? (xp || 0) + xpFuer(LP_START_LEVEL) : xp || 0);
/** Skilllevel aus XP (1–100) */
export function levelAus(xp: number, skill?: Skill): number { xp = xpEffektiv(xp, skill); let L = 1; while (L < SKILL_MAX && xp >= xpFuer(L + 1, skill)) L++; return L; }
/** Heldenlevel wie das Combat Level in OSRS (Attack = Geschick, Strength = Stärke, Hitpoints = Lebenspunkte; Prayer gibt es nicht = 0) */
export const heldenlevel = (x: SkillXp): number => { const L = (k: Skill) => levelAus(x[k] || 0, k), f = L("fernkampf"), m = L("magie");
  return Math.floor(0.25 * (L("defense") + L("lp")) + Math.max(0.325 * (L("geschick") + L("staerke")), 0.325 * (f + Math.floor(f / 2)), 0.325 * (m + Math.floor(m / 2)))); };
/** Max-LP = Lebenspunkte-Level (Start Level 10 = 10 LP, Level 99 = 99 LP) */
export const maxLp = (lpXp: number): number => levelAus(lpXp || 0, "lp");
/** Fäuste: wenn keine Waffe angelegt ist */
export const FAEUSTE: WaffenWerte = { art: "nah", ticks: 2, reich: NAH_REICH, geschick: 0, staerke: 0 };
/** Gültiger Stil-Index für eine Kampfart (sonst der Standard 1) */
export const stilIndex = (s: number | undefined, art: Art = "nah"): number => (typeof s === "number" && Number.isInteger(s) && s >= 0 && s < STILE[art].length ? s : 1);
/** Max Hit nach der OSRS-Grundformel: ⌊0,5 + (Level + Stilbonus + 8) × (Ausrüstungsbonus + 64) ÷ 640⌋, mindestens 1.
 *  Magie (vereinfacht, grund = 0): effektive Magie = Magie-Level + Stilbonus, ohne die +8. */
export const maxHit = (level: number, stilbonus: number, ausruestung: number, grund = 8): number => Math.max(1, Math.floor(0.5 + (level + stilbonus + grund) * (ausruestung + 64) / 640));
/** OSRS-Wurfwert (Angriff oder Verteidigung): effektives Level × (Bonus + 64), nie unter 0 */
export const wurfWert = (effLevel: number, bonus: number): number => Math.max(0, effLevel) * Math.max(0, bonus + 64);
export const maxHitMagie = (level: number, stilbonus: number, magieStaerke: number): number => maxHit(level, stilbonus, magieStaerke, 0);

/** Die Kampfwerte eines Helden aus seinen Skill-XP, der angelegten Ausrüstung und dem Angriffsstil (Index in STILE der Kampfart, 1 = Standard) */
export function kampfwerte(x: SkillXp, angelegt: Partial<Record<Platz, string>>, stil = 1): Kampfwerte {
  const hl = heldenlevel(x), lv = Object.fromEntries(SKILLS.map((k) => [k, levelAus(x[k] || 0, k)])) as Record<Skill, number>;
  const W = angelegt.waffe && GEGENSTAENDE[angelegt.waffe] && GEGENSTAENDE[angelegt.waffe].waffe ? GEGENSTAENDE[angelegt.waffe].waffe! : FAEUSTE;
  const s = stilIndex(stil, W.art), S = STILE[W.art][s], p = (k: Skill) => S.plus[k] || 0;
  /* Ausrüstung gesamt: Waffe und die Boni aller angelegten Teile (Rüstung kann Angriffsboni senken: Metall gegen Fernkampf und Magie) */
  const aus = { geschick: W.geschick || 0, staerke: W.staerke || 0, fernAngriff: W.fernAngriff || 0, fernStaerke: W.fernStaerke || 0, genau: W.genau || 0, magieStaerke: W.magieStaerke || 0 };
  const ab: Record<Art, number> = { nah: 0, fern: 0, magie: 0 }; /* Verteidigungsboni der Ausrüstung je Angriffsart */
  for (const pl of ["waffe", "kopf", "nebenhand", "brust", "beine"] as Platz[]) { /* auch die Waffe: Zweihänder und Speer haben eine kleine eigene Abwehr */ const G = angelegt[pl] && GEGENSTAENDE[angelegt[pl]!]; if (!G) continue;
    if (G.abwehr) for (const a of ["nah", "fern", "magie"] as Art[]) ab[a] += G.abwehr[a];
    if (G.bonus) for (const k of ["geschick", "staerke", "fernAngriff", "fernStaerke", "genau", "magieStaerke"] as const) aus[k] += G.bonus[k] || 0; }
  /* OSRS: Verteidigungswurf = effektives Defense-Level × (Bonus + 64); gegen Magie zählt 70 % Magie-Level und 30 % effektive Defense */
  const effDef = lv.defense + p("defense") + 8;
  const abwehr: Record<Art, number> = { nah: wurfWert(effDef, ab.nah), fern: wurfWert(effDef, ab.fern), magie: wurfWert(Math.floor(0.7 * lv.magie) + Math.floor(0.3 * effDef), ab.magie) };
  const angriff: Record<Art, number> = { nah: 0, fern: 0, magie: 0 }; let schaden: [number, number]; const plus = 0, ticks = Math.max(1, W.ticks + (S.ticks || 0)), reich = W.reich + (S.reich || 0);
  /* OSRS: Angriffswurf = (Level + Stilbonus + 8) × (Angriffsbonus + 64) */
  if (W.art === "nah") { angriff.nah = wurfWert(lv.geschick + p("geschick") + 8, aus.geschick); schaden = [1, maxHit(lv.staerke, p("staerke"), aus.staerke)]; }
  else if (W.art === "fern") { angriff.fern = wurfWert(lv.fernkampf + p("fernkampf") + 8, aus.fernAngriff); schaden = [1, maxHit(lv.fernkampf, p("fernkampf"), aus.fernStaerke)]; }
  else { angriff.magie = wurfWert(lv.magie + p("magie") + 8, aus.genau); schaden = [1, maxHitMagie(lv.magie, p("magie"), aus.magieStaerke)]; }
  return { angriff, abwehr, waffe: { art: W.art, schaden, plus, bonus: 0, ticks, takt: ticks * TICK, reich, ...(W.flug ? { flug: W.flug } : {}), ...(W.gegen ? { gegen: { ...W.gegen } } : {}), ...(W.art === "fern" ? { geschoss: angelegt.waffe && GEGENSTAENDE[angelegt.waffe] && GEGENSTAENDE[angelegt.waffe].art === "Armbrust" ? "bolzen" as const : "pfeil" as const } : {}) }, stil: s, max: maxLp(x.lp), heldenlevel: hl, skills: { ...NULL_XP, ...x } };
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

/** Gegner nach den OSRS-Regeln für Monster: eine Kampfart (Nahkampf, Fernkampf oder Magie) mit den Skill-Leveln dafür
 *  – Nahkampf: Geschick und Stärke, Fernkampf: Fernkampf, Magie: Magie –, ein Defense-Level und Verteidigungsboni gegen alle drei Angriffsarten.
 *  Wie in OSRS: effektives Level = Level + 9 (Monster haben keinen Stil), Wurf = effektives Level × (Bonus + 64); gegen Magie verteidigt das Magie-Level.
 *  Skills fehlen = Level 1, Angriffs- und Stärkebonus fehlen = 0. Lebenspunkte stehen eigens am Gegner (MonsterDef.lp). */
export interface GegnerV3 { geschick?: number; staerke?: number; fernkampf?: number; magie?: number; defense?: number; /** Angriffsbonus (Trefferwurf) und Stärkebonus (Max Hit) */ angriffBonus?: number; staerkeBonus?: number;
  /** Angriffstakt in Ticks */ ticks: number; /** Verteidigungsboni je Angriffsart */ abwehr: Record<Art, number> }
/** Angriffswurf, Max Hit und Verteidigungswürfe eines Gegners für seine Angriffsart */
export function gegnerWerte(v: GegnerV3, art: Art): { treffer: number; maxHit: number; abwehr: Record<Art, number> } {
  const L = (n?: number) => Math.max(1, n || 1), aB = v.angriffBonus || 0, sB = v.staerkeBonus || 0;
  const abwehr: Record<Art, number> = { nah: wurfWert(L(v.defense) + 9, v.abwehr.nah), fern: wurfWert(L(v.defense) + 9, v.abwehr.fern), magie: wurfWert(L(v.magie) + 9, v.abwehr.magie) };
  if (art === "fern") return { treffer: wurfWert(L(v.fernkampf) + 9, aB), maxHit: maxHit(L(v.fernkampf), 0, sB, 9), abwehr };
  if (art === "magie") return { treffer: wurfWert(L(v.magie) + 9, aB), maxHit: maxHitMagie(L(v.magie), 0, sB), abwehr };
  return { treffer: wurfWert(L(v.geschick) + 9, aB), maxHit: maxHit(L(v.staerke), 0, sB, 9), abwehr }; }
