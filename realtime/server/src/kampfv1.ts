/*
 * Kampfregeln v2 auf dem Server (shared/kampfwerte.ts): die vier Skills des eigenen Helden lesen (Migration 042: skill_geschick, skill_staerke,
 * skill_fernkampf, skill_magie), die gemeldete Ausrüstung und den Angriffsstil prüfen, die Kampfwerte bilden und die verdienten XP
 * über rpg_held_skill_gutschrift buchen. Ohne Migration 042 fehlen die Spalten: dann Level 1 und die Buchung scheitert (XP bleiben offen, Meldung im Log).
 * Die XP zählt allein der Server (2 je tatsächlich abgezogenem Lebenspunkt, shared/sim.ts); der Browser meldet nur, was angelegt ist.
 * Erlaubt sind nur Gegenstände, die der Held besitzt – bis es Beute gibt, ist das seine Startausrüstung (aus der Startwaffe in rpg_held).
 */
import { Kampfwerte, SkillXp, kampfwerte, skillXpPruefen, levelAus, SKILLS, NULL_XP } from "../../shared/kampfwerte";
import { GEGENSTAENDE, Platz, PLAETZE, startAusruestung } from "../../shared/gegenstaende";
import { Startwaffe } from "../../shared/aussehen";
import type { Sim } from "../../shared/sim";
import { Wirkung, skillPlus, wirkungenAktiv } from "../../shared/wirkungen";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HeldV1 { /** laufende Wirkungen aus dem Server-Inventar (Essen, shared/wirkungen.ts) */ wirkungen?: Wirkung[]; /** gespeicherte Lebenspunkte (Migration 046) */ lpStand?: { lp: number; z: number } | null; waffe: Startwaffe; xp: SkillXp; angelegt: Partial<Record<Platz, string>>; /** Angriffsstil 0, 1 = Normal, 2 */ stil: number; offen: SkillXp; bucht: boolean; zuletzt: number; stufen: string; schluss?: boolean }

/** Der eigene Held mit seinen vier Skills (null: kein Held → alte Kampfwerte) */
export async function heldV1Lesen(sb: Sb, nutzer: string): Promise<HeldV1 | null> {
  const z = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=*`).catch(() => [])) as Record<string, unknown>[];
  const r = z[0]; if (!r || !["schwert", "bogen", "stab"].includes(String(r.waffe))) return null;
  const xp = skillXpPruefen({ geschick: Number(r.skill_geschick), staerke: Number(r.skill_staerke), fernkampf: Number(r.skill_fernkampf), magie: Number(r.skill_magie), lp: Number(r.skill_lp), defense: Number(r.skill_defense) }) /* ohne Migration 044: LP und Defense Level 1 */, waffe = r.waffe as Startwaffe;
  const ls = r.lp_stand as { lp?: unknown; z?: unknown } | null | undefined, lpStand = ls && typeof ls.lp === "number" && typeof ls.z === "number" ? { lp: ls.lp, z: ls.z } : null;
  return { lpStand, waffe, xp, angelegt: startAusruestung(waffe), stil: 1, offen: { ...NULL_XP }, bucht: false, zuletzt: Date.now(), stufen: stufenVon(xp) };
}
/** Gemeldete Ausrüstung prüfen: nur bekannte Plätze, nur Gegenstände für diesen Platz, nur eigene (Startausrüstung) */
export function angelegtPruefen(roh: unknown, waffe: Startwaffe): Partial<Record<Platz, string>> {
  const besitz = new Set(Object.values(startAusruestung(waffe))), aus: Partial<Record<Platz, string>> = {}, o = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  for (const { id } of PLAETZE) { const g = o[id]; if (typeof g === "string" && GEGENSTAENDE[g] && GEGENSTAENDE[g].platz === id && besitz.has(g)) aus[id] = g; }
  return aus;
}
const stufenVon = (x: SkillXp) => SKILLS.map((k) => levelAus(x[k] || 0, k)).join("/");
export const kampfwerteVon = (h: HeldV1): Kampfwerte => kampfwerte(h.xp, h.angelegt, h.stil, skillPlus(h.wirkungen));
/** Gemeldeten Angriffsstil prüfen (0 bis 3; was die Kampfart der Waffe nicht kennt, wird in kampfwerte zum Standard 1) */
export const stilPruefen = (v: unknown): number => (v === 0 || v === 2 || v === 3 ? v : 1);

/** Im Takt (etwa einmal je Sekunde): neue XP aus der Simulation holen; steigt ein Skilllevel, die Kampfwerte neu setzen; alle 10 s (und beim Verlassen) buchen */
export function v1Takt(sb: Sb, nutzer: string, h: HeldV1, sim: Sim, heldId: number, schluss = false): void {
  const x = sim.xpAbholen(heldId); if (x) { for (const k of SKILLS) { h.offen[k] += x[k]; h.xp[k] += x[k]; } }
  const st = stufenVon(h.xp); if (st !== h.stufen && !schluss) { h.stufen = st; sim.kampfwerteSetzen(heldId, kampfwerteVon(h)); }
  /* Wirkung abgelaufen (Fischsuppe …): ohne sie neu rechnen */
  if (h.wirkungen && h.wirkungen.length && !schluss) { const w = wirkungenAktiv(h.wirkungen); if (w.length !== h.wirkungen.length) { h.wirkungen = w; sim.kampfwerteSetzen(heldId, kampfwerteVon(h)); } }
  const jetzt = Date.now(); if (schluss) h.schluss = true;
  if (h.bucht || !SKILLS.some((k) => h.offen[k]) || (!h.schluss && jetzt - h.zuletzt < 10000)) return;
  void xpBuchen(sb, nutzer, h, 0);
}
/** Offene XP buchen; beim Verlassen bis zu drei Versuche, und was während einer laufenden Buchung dazukam, gleich danach */
async function xpBuchen(sb: Sb, nutzer: string, h: HeldV1, versuch: number): Promise<void> {
  const o = h.offen; h.offen = { ...NULL_XP }; h.bucht = true; h.zuletzt = Date.now();
  try { await sb("/rest/v1/rpc/rpg_held_skill_gutschrift", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_geschick: o.geschick, p_staerke: o.staerke, p_fernkampf: o.fernkampf, p_magie: o.magie, ...(o.lp || o.defense ? { p_lp: o.lp, p_defense: o.defense } : {}) }) }); /* LP/Defense nur mitschicken, wenn es welche gibt (vor Migration 044 kennt die Funktion sie nicht) */ versuch = 0; }
  catch (e) { console.error("Skill-XP nicht gebucht (bleibt offen; Migration 042 eingespielt?):", (e as Error).message, JSON.stringify(o)); for (const k of SKILLS) h.offen[k] += o[k]; versuch++; }
  h.bucht = false;
  if (h.schluss && SKILLS.some((k) => h.offen[k]) && versuch < 3) { if (versuch) await new Promise((r) => setTimeout(r, 1500 * versuch)); return xpBuchen(sb, nutzer, h, versuch); }
}
