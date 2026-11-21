/*
 * Kampfregeln v1 auf dem Server (shared/kampfwerte.ts): Skill-XP des eigenen Helden lesen, die gemeldete Ausrüstung prüfen,
 * die Kampfwerte bilden und die im Kampf verdienten XP über rpg_held_xp_gutschrift (Migration 041) buchen.
 * Die XP zählt allein der Server (2 je tatsächlich abgezogenem Lebenspunkt, shared/sim.ts); der Browser meldet nur, was angelegt ist.
 * Erlaubt sind nur Gegenstände, die der Held besitzt – bis es Beute gibt, ist das seine Startausrüstung (aus der Startwaffe in rpg_held).
 */
import { Kampfwerte, SkillXp, kampfwerte, skillXpPruefen, levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE, Platz, PLAETZE, startAusruestung } from "../../shared/gegenstaende";
import { Startwaffe } from "../../shared/aussehen";
import type { Sim } from "../../shared/sim";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HeldV1 { waffe: Startwaffe; xp: SkillXp; angelegt: Partial<Record<Platz, string>>; offen: SkillXp; bucht: boolean; zuletzt: number; stufen: string; schluss?: boolean }

/** Der eigene Held mit Skill-XP (null: kein Held → alte Kampfwerte). Ohne Migration 041 fehlen die XP-Spalten: dann Level 1, gebucht wird nichts. */
export async function heldV1Lesen(sb: Sb, nutzer: string): Promise<HeldV1 | null> {
  const z = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=*`).catch(() => [])) as Record<string, unknown>[];
  const r = z[0]; if (!r || !["schwert", "bogen", "stab"].includes(String(r.waffe))) return null;
  const xp = skillXpPruefen({ staerke: Number(r.xp_staerke), geschick: Number(r.xp_geschick), magie: Number(r.xp_magie) }), waffe = r.waffe as Startwaffe;
  return { waffe, xp, angelegt: startAusruestung(waffe), offen: { staerke: 0, geschick: 0, magie: 0 }, bucht: false, zuletzt: Date.now(), stufen: stufenVon(xp) };
}
/** Gemeldete Ausrüstung prüfen: nur bekannte Plätze, nur Gegenstände für diesen Platz, nur eigene (Startausrüstung) */
export function angelegtPruefen(roh: unknown, waffe: Startwaffe): Partial<Record<Platz, string>> {
  const besitz = new Set(Object.values(startAusruestung(waffe))), aus: Partial<Record<Platz, string>> = {}, o = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  for (const { id } of PLAETZE) { const g = o[id]; if (typeof g === "string" && GEGENSTAENDE[g] && GEGENSTAENDE[g].platz === id && besitz.has(g)) aus[id] = g; }
  return aus;
}
const stufenVon = (x: SkillXp) => [levelAus(x.staerke), levelAus(x.geschick), levelAus(x.magie)].join("/");
export const kampfwerteVon = (h: HeldV1): Kampfwerte => kampfwerte(h.xp, h.angelegt);

/** Im Takt (etwa einmal je Sekunde): neue XP aus der Simulation holen; steigt ein Skilllevel, die Kampfwerte neu setzen; alle 10 s (und beim Verlassen) buchen */
export function v1Takt(sb: Sb, nutzer: string, h: HeldV1, sim: Sim, heldId: number, schluss = false): void {
  const x = sim.xpAbholen(heldId); if (x) { for (const k of ["staerke", "geschick", "magie"] as const) { h.offen[k] += x[k]; h.xp[k] += x[k]; } }
  const st = stufenVon(h.xp); if (st !== h.stufen && !schluss) { h.stufen = st; sim.kampfwerteSetzen(heldId, kampfwerteVon(h)); }
  const jetzt = Date.now(); if (schluss) h.schluss = true;
  if (h.bucht || !(h.offen.staerke || h.offen.geschick || h.offen.magie) || (!h.schluss && jetzt - h.zuletzt < 10000)) return;
  void xpBuchen(sb, nutzer, h, 0);
}
/** Offene XP buchen; beim Verlassen bis zu drei Versuche, und was während einer laufenden Buchung dazukam, gleich danach */
async function xpBuchen(sb: Sb, nutzer: string, h: HeldV1, versuch: number): Promise<void> {
  const o = h.offen; h.offen = { staerke: 0, geschick: 0, magie: 0 }; h.bucht = true; h.zuletzt = Date.now();
  try { await sb("/rest/v1/rpc/rpg_held_xp_gutschrift", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_staerke: o.staerke, p_geschick: o.geschick, p_magie: o.magie }) }); versuch = 0; }
  catch (e) { console.error("Skill-XP nicht gebucht (bleibt offen):", (e as Error).message, JSON.stringify(o)); for (const k of ["staerke", "geschick", "magie"] as const) h.offen[k] += o[k]; versuch++; }
  h.bucht = false;
  if (h.schluss && (h.offen.staerke || h.offen.geschick || h.offen.magie) && versuch < 3) { if (versuch) await new Promise((r) => setTimeout(r, 1500 * versuch)); return xpBuchen(sb, nutzer, h, versuch); }
}
