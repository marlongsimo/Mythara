/*
 * Riftmere – Bosse, Instanzen und Türen auf dem Server (Phase 4, Issue #48). Regeln: shared/boss.ts, Daten: shared/bosse.ts, Kampf: shared/sim.ts.
 * - Instanzen und Türen: je Spieler aus seinem Queststand (Schalter). Jede Sekunde für jeden Helden der Kampfwelt: in welcher Kopie steht er,
 *   welche Türen sind für ihn zu. Die Simulation trennt die Kopien (Sicht, Ziele, Treffer) und sperrt die Felder geschlossener Türen.
 * - Eintritt je Versuch (InstanzDef.eintritt, #49 Federsiegel): beim Betreten wird der Gegenstand verbraucht; ohne ihn entsteht keine Kopie (Text InstanzDef.ohne).
 *   Wer den Raum verlässt, beendet den Versuch (die Kopie verschwindet sofort; wer darin fällt, ebenso – das regelt die Simulation).
 * - Wellen: fällt eine Welle einer Kopie, meldet der Server dem Questmotor { art: "erlegen", typ: InstanzDef.welle }.
 * - Bosszähler und Bestzeit je Konto: rpg_held_boss_sieg (Migration 050). Fehlt sie noch, zählt der Server bis zum Neustart im Speicher.
 */
import type { Sim } from "../../shared/sim";
import { INSTANZEN, TUEREN, BOSSE } from "../../shared/bosse";
import "../../shared/zunft"; /* #167: Zunft-Türen (TUEREN) eintragen */
import { instanzBei, instanzFassung, tuerenZu, imFeld, BOSS_WAHL_STANDARD, type InstanzDef, type BossFassung, type BossWahl } from "../../shared/boss";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { MONSTER } from "../../shared/config";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
/** Schlüssel einer Kopie: Raum, Konto (später: Gruppe) und Fassung (#116: quest ohne Zusatz, stark mit „:stark“) */
export const instanzSchluessel = (def: InstanzDef, nutzer: string, fassung: BossFassung = "quest"): string => def.id + ":" + nutzer + (fassung === "quest" ? "" : ":" + fassung);
/** Aus dem Schlüssel einer Kopie: Raum, Konto und Fassung */
export function instanzAus(key: string): { def: InstanzDef; nutzer: string; fassung: BossFassung } | null { const [id, nutzer, f] = key.split(":"); if (!id || !nutzer) return null;
  const def = INSTANZEN.find((d) => d.id === id); return def ? { def, nutzer, fassung: f === "stark" || f === "leer" ? f : "quest" } : null; }

/* ───────── #116: Wahl am Eingang nach der Quest (öffentlich · eigene Instanz) – je Konto und Instanz, im Speicher des Servers (Standard öffentlich) ───────── */
const wahlen = new Map<string, BossWahl>();
/** Die Wahl eines Kontos für eine Instanz */
export const bossWahl = (nutzer: string, id: string): BossWahl => wahlen.get(nutzer + "|" + id) || BOSS_WAHL_STANDARD;
/** Wahl setzen ({ t: "bosswahl", id, wahl }); nur nach der Quest (InstanzDef.danach an). Zurück: Text für den Chat oder null (ungültig) */
export function bossWahlSetzen(nutzer: string, id: unknown, wahl: unknown, an: (schalter: string) => boolean): string | null {
  const d = INSTANZEN.find((x) => x.id === id); if (!d || !d.danach || !an(d.danach) || (wahl !== "oeffentlich" && wahl !== "instanz")) return null;
  wahlen.set(nutzer + "|" + d.id, wahl); return wahl === "instanz" ? `${d.name}: eigene Instanz – du kämpfst allein${d.eintritt ? ` (Eintritt: ${(GEGENSTAENDE[d.eintritt] || { name: d.eintritt }).name})` : ""}.` : `${d.name}: öffentlich – wer da ist, kämpft mit.`; }
/** Nur für Tests */
export function wahlenVergessen(): void { wahlen.clear(); }

/** Rucksack für den Eintritt: hat er den Gegenstand, einen abgeben */
export interface Beutel { hat: (g: string) => boolean; abgeben: (g: string) => boolean; /** #167: Berufsstufe (Zunft-Türen) */ beruf?: (id: string) => number }
const OHNE: Beutel = { hat: () => false, abgeben: () => false }, abgewiesen = new Map<number, string>(); /* Held → Kopie, für die der Hinweis „ohne Eintritt“ schon kam */
/** Jede Sekunde für einen Helden: Kopie und Türen nach seinem Queststand. wx/wy: seine Stelle in Weltfeldern.
 *  Zurück: Text für den Chat (Kopie betreten: InstanzDef.text; Eintritt fehlt: InstanzDef.ohne) oder null */
export function weltJeSpieler(sim: Sim, heldId: number, nutzer: string, wx: number, wy: number, an: (schalter: string) => boolean, beutel: Beutel = OHNE): string | null {
  const wahl = (id: string) => bossWahl(nutzer, id);
  const vorher = sim.instanzVon(heldId); let def = INSTANZEN.length ? instanzBei(INSTANZEN, wx, wy, an, wahl) : null; const fassung: BossFassung = def ? instanzFassung(def, an, wahl(def.id)) || "quest" : "quest";
  let key = def ? instanzSchluessel(def, nutzer, fassung) : undefined, text: string | null = null;
  const neu = Boolean(key && (key !== vorher || !sim.instanzDa(key))); /* betritt die Kopie (oder sie ist inzwischen abgebaut: ein neuer Versuch) */
  if (def && neu && def.eintritt && fassung !== "leer") { if (beutel.abgeben(def.eintritt)) text = `${(GEGENSTAENDE[def.eintritt] || { name: def.eintritt }).name} verbraucht – ein Versuch.`;
    else { const d = def; text = abgewiesen.get(heldId) === key ? null : d.ohne || `Ohne ${(GEGENSTAENDE[d.eintritt!] || { name: d.eintritt! }).name} kein Eintritt.`; abgewiesen.set(heldId, key!); def = null; key = undefined; } }
  if (!def || !def.eintritt) { if (!INSTANZEN.some((d) => d.eintritt && imFeld(d.feld, wx, wy))) abgewiesen.delete(heldId); }
  if (key !== vorher || neu) sim.instanzSetzen(heldId, key, def || undefined, fassung);
  if (vorher && vorher !== key) { const A = instanzAus(vorher); if (A && A.def.eintritt) sim.instanzWeg(vorher); } /* hinaus: der Versuch ist vorbei */
  if (TUEREN.length) sim.sperrenSetzen(heldId, tuerenZu(TUEREN, an, { hat: beutel.hat, x: wx, y: wy, wahl, beruf: beutel.beruf }, INSTANZEN));
  if (def && neu && def.text && fassung !== "leer") text = text ? text + " " + def.text : def.text;
  return text; }

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
