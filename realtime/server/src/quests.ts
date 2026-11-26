/*
 * Riftmere – Quests auf dem Server (Migration 045: rpg_held.quests). Alle Quests laufen über den Baukasten (questmotor.ts, shared/questbau.ts,
 * Liste in shared/quests.ts) – hier nur der Anschluss an Welt, Inventar, Sammeln, Handwerk und Kampf. Kein Quest-Sondercode.
 * Der Server führt den Stand je Spieler, prüft jede Antwort, schickt Dialoge nur an den, der spricht, und bucht den Abschluss genau einmal.
 * Ohne Migration 045 (Spalte fehlt): Stand nur im Arbeitsspeicher, Speichern scheitert mit Meldung im Log – das Spiel läuft weiter.
 */
import { QUESTS } from "../../shared/quests";
import * as QB from "../../shared/questbau";
import { staendeLaden, staendeGeladen, qStand, alleStaende, motorVerbinden, figurDa, motorReden, motorImGespraech, motorAntworten, motorEnde, motorSperre, motorEreignis, motorVergessen, motorObjekt, kontext, questpunkte, punkteLaden, type MotorAntwort } from "./questmotor";
import type { SkillXp } from "../../shared/kampfwerte";
import { SAMMEL_QUEST } from "./sammeln";
import { HANDWERK_QUEST } from "./handwerk";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
/** Hörer: die Stände aller Quests (id → Stand) und die Summe der Questpunkte */
type Hoerer = (b: Record<string, string>, punkte: number) => void;
const hoerer = new Map<string, Set<Hoerer>>(), sbJe = new Map<string, Sb>();

/** Die Queststände laden (einmal je Anmeldung; danach aus dem Speicher). Zurück: alle Stände */
export async function questsLaden(sb: Sb, nutzer: string): Promise<Record<string, string>> {
  sbJe.set(nutzer, sb); if (staendeGeladen(nutzer)) return alleStaende(nutzer);
  const r = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=quests`).catch((e) => { console.error("Quests laden (Migration 045 eingespielt?):", (e as Error).message); return null; })) as { quests?: Record<string, { s?: string }> }[] | null;
  staendeLaden(nutzer, r && r[0] ? r[0].quests : null, sb);
  /* Questpunkte (Migration 048) – eigene Abfrage: ohne die Spalte bleibt es bei 0, der Queststand lädt trotzdem */
  const p = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=questpunkte`).catch(() => null)) as { questpunkte?: number }[] | null; punkteLaden(nutzer, p && p[0] ? p[0].questpunkte : 0);
  return alleStaende(nutzer); }
/** Summe der Questpunkte */
export const punkte = (nutzer: string): number => questpunkte(nutzer);
/** Stand einer Quest */
export const questStand = (nutzer: string, id: string): string => qStand(nutzer, id);
/** Stände aller Quests */
export const questsB = (nutzer: string): Record<string, string> => alleStaende(nutzer);
export function questHoeren(nutzer: string, f: Hoerer): () => void { let m = hoerer.get(nutzer); if (!m) hoerer.set(nutzer, (m = new Set())); m.add(f); return () => { m!.delete(f); }; }
function melden(nutzer: string) { const b = alleStaende(nutzer), p = questpunkte(nutzer); for (const f of hoerer.get(nutzer) || []) try { f(b, p); } catch (x) { console.error("Quest-Hörer:", (x as Error).message); } }

/* ───────── Freigaben (Sperren, gesperrte Regionen) aus den Quest-Daten ───────── */
/** Darf der Spieler in diese Region? Zurück: null = ja, sonst die Quest, die sie sperrt (mit zurueck: wohin) */
export function regionGesperrt(nutzer: string, region: string): QB.QuestDef | null {
  for (const q of QUESTS) if (QB.frei(q, qStand(nutzer, q.id), region, kontext(nutzer)) === false) return q; return null; }

/* ───────── Gespräche ───────── */
export type Antwort1 = MotorAntwort;
/** Ein Gespräch beginnen (wx/wy: Stelle des Spielers in Weltfeldern) */
export function reden(nutzer: string, id: string, wx: number | undefined, wy: number | undefined): Antwort1 {
  if (!figurDa(id)) return { fehler: "Hier ist niemand." }; const sb = sbJe.get(nutzer); return sb ? motorReden(sb, nutzer, id, wx, wy) : { fehler: "Einen Moment …" }; }
/** Gutgeschriebene Quest-XP sofort an den laufenden Helden der Kampfwelt geben (index.ts) – sonst stimmte das Level erst nach dem Neuanmelden (26.11.2026) */
let xpLive: (nutzer: string, xp: Partial<Record<"geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense", number>>) => void = () => { /* noch nicht verbunden */ };
export function xpLiveSetzen(f: typeof xpLive): void { xpLive = f; }
/** Eine Antwort wählen: der Server prüft sie gegen den Stand und führt sie aus (wo: Stelle des Spielers – dort landet Lohn, der nicht mehr in den Rucksack passt) */
export async function antworten(sb: Sb, nutzer: string, id: string, a: string, wo?: { x?: number; y?: number }): Promise<Antwort1> {
  if (!motorImGespraech(nutzer, id)) return { fehler: "Das Gespräch ist vorbei." }; return motorAntworten(sb, nutzer, id, a, wo); }
export function gespraechEnde(nutzer: string): void { motorEnde(nutzer); }

/* ───────── Questobjekte, Untersuchen, Erlegen, Betreten ───────── */
/** Ein Questobjekt (Bruchstelle, Rutenbündel …) benutzen – nur nah dran. Zurück: Text für den Spieler */
export async function dingTat(sb: Sb, nutzer: string, ort: string, id: string, wx: number | undefined, wy: number | undefined): Promise<string> { void ort; return motorObjekt(sb, nutzer, id, wx, wy); }
/** Eine Gegnerart untersuchen (Bestiarium): zählt für Quests (z. B. Mooshocker am Moosrain) */
export async function untersucht(sb: Sb, nutzer: string, typ: string, wx: number | undefined, wy: number | undefined): Promise<void> { motorEreignis(sb, nutzer, { art: "untersuchen", ziel: typ, x: wx, y: wy }); }
/** Ein Gegner wurde besiegt (die Sim meldet den, der am meisten Schaden gemacht hat) */
export function erlegt(nutzer: string, typ: string): void { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "erlegen", typ }); }
/** Region betreten / Stelle erreicht (welt.ts) */
const BETRETEN = QUESTS.some((q) => q.schritte.some((x) => x.ereignis.art === "betreten"));
export function betreten(nutzer: string, region: string, wx: number, wy: number): void { if (!BETRETEN) return; const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "betreten", region, x: wx, y: wy }); }
/** Kampf-XP des geladenen Helden (index.ts), für Voraussetzungen und Bedingungen */
let heldXp: (nutzer: string) => SkillXp | undefined = () => undefined;
export function heldXpSetzen(f: typeof heldXp): void { heldXp = f; }

/* ───────── Anschluss ───────── */
motorVerbinden({ melden, xp: (nutzer, x) => xpLive(nutzer, x), heldXp: (nutzer) => heldXp(nutzer) });
/* Questziele beim Sammeln (Baum des Waldgottes, Waldstein …) und Questrezepte (Esse, Amboss): Sperren und Schritte aus den Quest-Daten */
SAMMEL_QUEST.pruefen = (nutzer, art, quest) => motorSperre(nutzer, "sammeln", art, quest);
SAMMEL_QUEST.ertrag = (nutzer, art) => { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "sammeln", ziel: art }); };
HANDWERK_QUEST.pruefen = (nutzer, r) => motorSperre(nutzer, "herstellen", r.id, r.quest);
HANDWERK_QUEST.fertig = (nutzer, r) => { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "herstellen", rezept: r.id }); };
/** Nur für Tests: Speicher leeren */
export function questsVergessen(): void { motorVergessen(); hoerer.clear(); }
