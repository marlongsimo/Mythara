/*
 * Riftmere – Quest-Baukasten auf dem Server (Fahrplan Phase 1, 26.11.2026).
 * Führt jede Quest aus shared/questbau.ts allein aus ihren Daten: Stand je Spieler (Migration 045, rpg_held.quests), Gespräche,
 * Antworten prüfen und ausführen (Gegenstände geben, Schritte, Abschluss genau einmal), Sperren und Ereignisse beim Sammeln und Herstellen.
 * Neue Quests: Datei in shared/ anlegen und hier in QUESTS eintragen – sonst nichts.
 */
import * as QB from "../../shared/questbau";
import { QUEST3 } from "../../shared/quest03";
import { REDE_WEIT } from "../../shared/quest01";
import { besitzt, besitztIrgendwo, aufnehmen } from "./inventar";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
/** Alle Quests des Baukastens */
export const QUESTS: QB.QuestDef[] = [QUEST3];
export const questDef = (id: string): QB.QuestDef | undefined => QUESTS.find((q) => q.id === id);

const staende = new Map<string, Map<string, string>>();
export const qStand = (nutzer: string, id: string): string => (staende.get(nutzer) || new Map()).get(id) || "";
/** Gespeicherte Stände übernehmen (aus rpg_held.quests) */
export function staendeLaden(nutzer: string, quests: Record<string, { s?: string }> | null | undefined): void {
  const m = new Map<string, string>(); for (const q of QUESTS) m.set(q.id, QB.gueltig(q, quests && quests[q.id] ? quests[q.id].s : "")); staende.set(nutzer, m); }
export const staendeGeladen = (nutzer: string): boolean => staende.has(nutzer);

let gemeldet: (nutzer: string) => void = () => { /* quests.ts */ };
let xpGutschrift: (nutzer: string, xp: NonNullable<QB.QuestDef["belohnung"]>) => void = () => { /* quests.ts → index.ts */ };
export function motorVerbinden(f: { melden(nutzer: string): void; xp(nutzer: string, xp: NonNullable<QB.QuestDef["belohnung"]>): void }): void { gemeldet = f.melden; xpGutschrift = f.xp; }

const kontext = (nutzer: string): QB.Kontext => ({ hat: (g) => besitzt(nutzer).includes(g), verloren: (g) => !besitztIrgendwo(nutzer, g) });
async function setzen(sb: Sb, nutzer: string, q: QB.QuestDef, s: string): Promise<void> {
  const alt = qStand(nutzer, q.id); if (alt === "fertig" || !s || s === "fertig" || s === alt) return;
  let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, s); gemeldet(nutzer);
  await sb("/rest/v1/rpc/rpg_held_quest_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_stand: s }) }).catch((e) => console.error(`Queststand ${q.id} speichern:`, (e as Error).message)); }

/* ───────── Gespräche ───────── */
const offen = new Map<string, { q: string; npc: string }>();
export interface MotorAntwort { dialog?: QB.Dialog; zeilen?: QB.Zeile[]; ende?: boolean; fehler?: string }
/** Gehört die Figur zu einer Quest des Baukastens? */
export const figurDa = (id: string): boolean => QUESTS.some((q) => q.figuren.some((f) => f.id === id));
export function motorReden(nutzer: string, id: string, wx: number | undefined, wy: number | undefined): MotorAntwort {
  for (const q of QUESTS) { const F = q.figuren.find((f) => f.id === id); if (!F) continue;
    if (wx === undefined || wy === undefined || Math.hypot(F.x - wx, F.y - wy) > (F.weit ?? REDE_WEIT)) return { fehler: `Geh näher an ${F.name} heran.` };
    const d = QB.dialog(q, F.id, qStand(nutzer, q.id), kontext(nutzer)); if (!d) return { fehler: "Hier ist niemand." };
    offen.set(nutzer, { q: q.id, npc: F.id }); return { dialog: d }; }
  return { fehler: "Hier ist niemand." }; }
export const motorImGespraech = (nutzer: string, id: string): boolean => { const o = offen.get(nutzer); return Boolean(o && o.npc === id); };
export function motorEnde(nutzer: string): void { offen.delete(nutzer); }
export async function motorAntworten(sb: Sb, nutzer: string, id: string, a: string): Promise<MotorAntwort> {
  const o = offen.get(nutzer), q = o && questDef(o.q); if (!o || !q || o.npc !== id) return { fehler: "Das Gespräch ist vorbei." };
  const F = q.figuren.find((x) => x.id === o.npc)!, k = kontext(nutzer), s = qStand(nutzer, q.id), f = QB.antwort(q, o.npc, s, String(a || "").slice(0, 24), k);
  if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  /* Gegenstände: verlorene zurück (Pflicht – sonst Fehler), fehlende Werkzeuge (nur, was weder im Rucksack noch angelegt ist, auch nichts Gleichwertiges) */
  const neu: string[] = [];
  for (const G of f.geben || []) {
    if (G.verloren) { if (!k.verloren(G.g)) return { fehler: "Das hast du doch noch." }; if (!aufnehmen(sb, nutzer, G.g, 1)) return { fehler: "Dein Rucksack ist voll." }; neu.push(G.name); continue; }
    if (G.fehlt) { const da = besitzt(nutzer), re = G.gleich ? new RegExp(G.gleich) : null; if (da.includes(G.g) || (re && da.some((x) => re.test(x)))) continue; }
    if (aufnehmen(sb, nutzer, G.g, 1)) neu.push(G.name); }
  if (f.abschluss) {
    if (!QB.laeuft(q, s)) return { fehler: "Das ist schon erledigt." }; const B = q.belohnung || {};
    const ok = (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_geschick: B.geschick || 0, p_staerke: B.staerke || 0, p_fernkampf: B.fernkampf || 0, p_magie: B.magie || 0, p_lp: B.lp || 0, p_defense: B.defense || 0 }) })
      .catch((e) => { console.error(`Questabschluss ${q.id}:`, (e as Error).message); return null; })) as boolean | null;
    if (ok === null) return { fehler: "Der Abschluss konnte nicht gespeichert werden. Versuch es gleich noch einmal." };
    let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, "fertig"); gemeldet(nutzer);
    if (ok && Object.values(B).some((v) => v)) try { xpGutschrift(nutzer, B); } catch (e) { console.error("Quest-XP live:", (e as Error).message); } }
  else { const n = QB.nachFolge(q, s, f); if (n !== s) await setzen(sb, nutzer, q, n); }
  let zeilen = (f.geben && f.geben.length && !neu.length && f.nichtsZuGeben ? f.nichtsZuGeben : f.zeilen).map((text) => ({ wer: F.name, text }));
  if (neu.length) zeilen = [...zeilen, { wer: F.name, text: `(Du bekommst: ${neu.join(", ")}.)` }];
  if (f.weiter) { const d = QB.dialog(q, o.npc, qStand(nutzer, q.id), kontext(nutzer)); return { zeilen, dialog: d || undefined }; }
  offen.delete(nutzer); return { zeilen, ende: true }; }

/* ───────── Sammeln und Herstellen ───────── */
/** Darf der Spieler dieses Questziel abbauen / dieses Questrezept herstellen? Text = nein; null = ja */
export function motorSperre(nutzer: string, art: "sammeln" | "herstellen", ziel: string, questId?: string): string | null {
  for (const q of QUESTS) { if (questId && q.id !== questId) continue; const r = QB.sperre(q, art, ziel, qStand(nutzer, q.id), kontext(nutzer)); if (r !== undefined) return r; }
  return questId ? "Das geht noch nicht." : null; }
/** Etwas ist geschehen (gesammelt, hergestellt, erlegt): Schritte erledigen */
export function motorEreignis(sb: Sb, nutzer: string, e: QB.Ereignis): void {
  for (const q of QUESTS) { const s = qStand(nutzer, q.id), n = QB.ereignis(q, s, e); if (n !== s) void setzen(sb, nutzer, q, n); } }
/** Nur für Tests */
export function motorVergessen(): void { staende.clear(); offen.clear(); }
