/*
 * Riftmere – Bosse, Instanzen und Türen auf dem Server (Phase 4, Issue #48). Regeln: shared/boss.ts, Daten: shared/bosse.ts, Kampf: shared/sim.ts.
 * - Instanzen und Türen: je Spieler aus seinem Queststand (Schalter). Jede Sekunde für jeden Helden der Kampfwelt: in welcher Kopie steht er,
 *   welche Türen sind für ihn zu. Die Simulation trennt die Kopien (Sicht, Ziele, Treffer) und sperrt die Felder geschlossener Türen.
 * - Wellen: fällt eine Welle einer Kopie, meldet der Server dem Questmotor { art: "erlegen", typ: InstanzDef.welle }.
 * - Bosszähler und Bestzeit je Konto: rpg_held_boss_sieg (Migration 050). Fehlt sie noch, zählt der Server bis zum Neustart im Speicher.
 */
import type { Sim } from "../../shared/sim";
import { INSTANZEN, TUEREN, BOSSE } from "../../shared/bosse";
import { instanzBei, tuerenZu, type InstanzDef } from "../../shared/boss";
import { MONSTER } from "../../shared/config";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
/** Schlüssel einer Kopie: Raum und Konto */
export const instanzSchluessel = (def: InstanzDef, nutzer: string): string => def.id + ":" + nutzer;
/** Aus dem Schlüssel einer Kopie: Raum und Konto */
export function instanzAus(key: string): { def: InstanzDef; nutzer: string } | null { const i = key.indexOf(":"); if (i < 0) return null;
  const def = INSTANZEN.find((d) => d.id === key.slice(0, i)); return def ? { def, nutzer: key.slice(i + 1) } : null; }

/** Jede Sekunde für einen Helden: Kopie und Türen nach seinem Queststand. wx/wy: seine Stelle in Weltfeldern. Zurück: die Kopie, die er gerade betreten hat (sonst null) */
export function weltJeSpieler(sim: Sim, heldId: number, nutzer: string, wx: number, wy: number, an: (schalter: string) => boolean): InstanzDef | null {
  const vorher = sim.instanzVon(heldId), def = INSTANZEN.length ? instanzBei(INSTANZEN, wx, wy, an) : null, key = def ? instanzSchluessel(def, nutzer) : undefined;
  if (key !== vorher) sim.instanzSetzen(heldId, key, def || undefined);
  if (TUEREN.length) sim.sperrenSetzen(heldId, tuerenZu(TUEREN, an));
  return def && key !== vorher ? def : null; }

/* ───────── Bosszähler ───────── */
const imSpeicher = new Map<string, { siege: number; bestzeit: number | null }>(); let ohne050 = false;
/** Name eines Bosses für die Meldung */
const bossName = (typ: string): string => (MONSTER[typ] ? MONSTER[typ].name : typ);
const zeitText = (s: number): string => { const t = Math.max(0, Math.round(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
/** Ist das ein Boss mit Zähler? */
export const istBoss = (typ: string): boolean => Boolean(BOSSE[typ] || (MONSTER[typ] && MONSTER[typ].boss));
/** Ein Konto hat einen Boss besiegt (sek: Dauer des Kampfes). Zurück: Text für den Chat */
export async function bossSieg(sb: Sb, nutzer: string, typ: string, sek: number): Promise<string> {
  let r: { siege: number; bestzeit: number | null } | null = null;
  if (!ohne050) try { const a = (await sb("/rest/v1/rpc/rpg_held_boss_sieg", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_boss: typ, p_sekunden: Math.max(0, Math.round(sek * 10) / 10) }) })) as { siege?: number; bestzeit?: number | null } | null;
    if (a && typeof a.siege === "number") r = { siege: a.siege, bestzeit: a.bestzeit === null || a.bestzeit === undefined ? null : Number(a.bestzeit) }; }
  catch (e) { const t = (e as Error).message; if (/PGRST202|404|boss_sieg/.test(t)) { ohne050 = true; console.error("Migration 050 fehlt noch: Bosszähler nur im Speicher des Servers."); } else console.error("Bosszähler:", t); }
  if (!r) { const k = nutzer + "|" + typ, m = imSpeicher.get(k) || { siege: 0, bestzeit: null }; m.siege++; if (sek > 0 && (m.bestzeit === null || sek < m.bestzeit)) m.bestzeit = sek; imSpeicher.set(k, m); r = m; }
  const best = r.bestzeit !== null && r.bestzeit > 0 ? ` · Bestzeit ${zeitText(r.bestzeit)}` : "", neu = sek > 0 && r.bestzeit !== null && Math.abs(r.bestzeit - sek) < 0.05 && r.siege > 1 ? " – neue Bestzeit!" : "";
  return `${bossName(typ)} besiegt (${zeitText(sek)}) – zum ${r.siege}. Mal${best}${neu}`; }
/** Nur für Tests */
export function bosseVergessen(): void { imSpeicher.clear(); ohne050 = false; }
