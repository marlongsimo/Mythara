/*
 * Riftmere – Quest-Baukasten auf dem Server (Fahrplan Phase 1, 26.11.2026).
 * Führt jede Quest aus shared/quests.ts allein aus ihren Daten: Stand je Spieler (Migration 045, rpg_held.quests), Gespräche,
 * Antworten prüfen und ausführen (Gegenstände geben und nehmen, Schritte, Abschluss genau einmal), Questobjekte, Sperren und Ereignisse
 * (Sammeln, Herstellen, Erlegen, Untersuchen, Aufheben, Betreten, Benutzen), bedingte Beute.
 * Belohnung: erst nachdem rpg_held_quest_abschluss den ersten Abschluss bestätigt hat (true) – Splitter und Gegenstände nie doppelt.
 */
import * as QB from "../../shared/questbau";
import { QUESTS, questDef } from "../../shared/quests";
import { REDE_WEIT } from "../../shared/quest01";
import { levelAus, heldenlevel, SKILLS, type SkillXp, type Skill } from "../../shared/kampfwerte";
import { besitzt, besitztIrgendwo, aufnehmen, anzahlVon, abgeben, BEDINGUNGEN, AUFGENOMMEN } from "./inventar";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export { QUESTS, questDef };

const staende = new Map<string, Map<string, string>>(), sbJe = new Map<string, Sb>();
export const qStand = (nutzer: string, id: string): string => (staende.get(nutzer) || new Map()).get(id) || "";
/** Alle Stände eines Spielers (für den Browser) */
export const alleStaende = (nutzer: string): Record<string, string> => Object.fromEntries(QUESTS.map((q) => [q.id, qStand(nutzer, q.id)]));
/** Gespeicherte Stände übernehmen (aus rpg_held.quests; ältere Formate übersetzt die Quest) */
export function staendeLaden(nutzer: string, quests: Record<string, { s?: string }> | null | undefined, sb?: Sb): void {
  const m = new Map<string, string>(); for (const q of QUESTS) m.set(q.id, QB.gueltig(q, quests && quests[q.id] ? quests[q.id].s : "")); staende.set(nutzer, m); if (sb) sbJe.set(nutzer, sb); }
export const staendeGeladen = (nutzer: string): boolean => staende.has(nutzer);

let gemeldet: (nutzer: string) => void = () => { /* quests.ts */ };
let xpGutschrift: (nutzer: string, xp: NonNullable<QB.Belohnung["xp"]>) => void = () => { /* quests.ts → index.ts */ };
let heldXp: (nutzer: string) => SkillXp | undefined = () => undefined;
/** Fremde Quests (noch nicht im Baukasten, z. B. Quest 01): Phase für Bedingungen */
let fremdePhase: (nutzer: string, id: string) => QB.Phase | undefined = () => undefined;
export function motorVerbinden(f: { melden(nutzer: string): void; xp(nutzer: string, xp: NonNullable<QB.Belohnung["xp"]>): void; heldXp?(nutzer: string): SkillXp | undefined; phase?(nutzer: string, id: string): QB.Phase | undefined }): void {
  gemeldet = f.melden; xpGutschrift = f.xp; if (f.heldXp) heldXp = f.heldXp; if (f.phase) fremdePhase = f.phase; }

/** Was der Motor über den Spieler weiß: Rucksack, Bank, andere Quests, Skills (Kampfskills aus dem geladenen Helden) */
export const kontext = (nutzer: string): QB.Kontext => ({
  hat: (g) => besitzt(nutzer).includes(g), verloren: (g) => !besitztIrgendwo(nutzer, g), anzahl: (g) => anzahlVon(nutzer, g),
  quest: (id) => { const q = questDef(id); return q ? QB.lage(q, qStand(nutzer, id)).phase : fremdePhase(nutzer, id) || "neu"; },
  skill: (k) => { const x = heldXp(nutzer); return x && (SKILLS as string[]).includes(k) ? levelAus(x[k as Skill] || 0, k as Skill) : 0; },
  heldenlevel: () => { const x = heldXp(nutzer); return x ? heldenlevel(x) : 0; } });
async function setzen(sb: Sb, nutzer: string, q: QB.QuestDef, s: string): Promise<void> {
  const alt = qStand(nutzer, q.id); if (alt === "fertig" || !s || s === "fertig" || s === alt) return;
  let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, s); gemeldet(nutzer);
  await sb("/rest/v1/rpc/rpg_held_quest_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_stand: s }) }).catch((e) => console.error(`Queststand ${q.id} speichern:`, (e as Error).message)); }

/* ───────── Gespräche ───────── */
const offen = new Map<string, { q: string; npc: string }>();
export interface MotorAntwort { dialog?: QB.Dialog; zeilen?: QB.Zeile[]; ende?: boolean; fehler?: string; /** Kampf-XP (der Browser trägt sie nach) */ belohnung?: NonNullable<QB.Belohnung["xp"]>; splitter?: number }
/** Gehört die Figur zu einer Quest des Baukastens? */
export const figurDa = (id: string): boolean => QUESTS.some((q) => q.figuren.some((f) => f.id === id));
export function motorReden(sb: Sb, nutzer: string, id: string, wx: number | undefined, wy: number | undefined): MotorAntwort {
  for (const q of QUESTS) { const F = q.figuren.find((f) => f.id === id); if (!F) continue;
    if (wx === undefined || wy === undefined || Math.hypot(F.x - wx, F.y - wy) > (F.weit ?? REDE_WEIT)) return { fehler: `Geh näher an ${F.name} heran.` };
    const k = kontext(nutzer), s = qStand(nutzer, q.id), d = QB.dialog(q, F.id, s, k); if (!d) return { fehler: "Hier ist niemand." };
    const r = QB.rede(q, F.id, s, k); if (r && r.anbieten) { const n = QB.nachFolge(q, s, { zeilen: [], anbieten: true }); if (n !== s) void setzen(sb, nutzer, q, n); }
    offen.set(nutzer, { q: q.id, npc: F.id }); return { dialog: d }; }
  return { fehler: "Hier ist niemand." }; }
export const motorImGespraech = (nutzer: string, id: string): boolean => { const o = offen.get(nutzer); return Boolean(o && o.npc === id); };
export function motorEnde(nutzer: string): void { offen.delete(nutzer); }

/** Gegenstände einer Folge geben: verlorene zurück (Pflicht – sonst Fehler), fehlende Werkzeuge (nur, was weder im Rucksack noch angelegt ist, auch nichts Gleichwertiges) */
function geben(sb: Sb, nutzer: string, L: QB.Geben[], k: QB.Kontext): { neu: string[]; fehler?: string } {
  const neu: string[] = [];
  for (const G of L) {
    if (G.verloren) { if (!k.verloren(G.g)) return { neu, fehler: "Das hast du doch noch." }; if (!aufnehmen(sb, nutzer, G.g, 1)) return { neu, fehler: "Dein Rucksack ist voll." }; neu.push(G.name); continue; }
    if (G.fehlt) { const da = besitzt(nutzer), re = G.gleich ? new RegExp(G.gleich) : null; if (da.includes(G.g) || (re && da.some((x) => re.test(x)))) continue; }
    if (aufnehmen(sb, nutzer, G.g, 1)) neu.push(G.name); }
  return { neu }; }

export async function motorAntworten(sb: Sb, nutzer: string, id: string, a: string): Promise<MotorAntwort> {
  const o = offen.get(nutzer), q = o && questDef(o.q); if (!o || !q || o.npc !== id) return { fehler: "Das Gespräch ist vorbei." };
  const k = kontext(nutzer), s = qStand(nutzer, q.id), f = QB.antwort(q, o.npc, s, String(a || "").slice(0, 24), k);
  if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  /* Gegenstände nehmen: erst prüfen, dann alle auf einmal */
  for (const N of f.nehmen || []) if (anzahlVon(nutzer, N.g) < (N.n || 1)) return { fehler: "Dafür fehlt dir noch etwas." };
  for (const N of f.nehmen || []) for (let i = 0; i < (N.n || 1); i++) if (!abgeben(sb, nutzer, N.g)) return { fehler: "Dafür fehlt dir noch etwas." };
  const aus: MotorAntwort = {}; let neu: string[] = [];
  if (f.abschluss) {
    if (!QB.laeuft(q, s)) return { fehler: "Das ist schon erledigt." }; const B = q.belohnung || {}, X = B.xp || {};
    const ok = (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_geschick: X.geschick || 0, p_staerke: X.staerke || 0, p_fernkampf: X.fernkampf || 0, p_magie: X.magie || 0, p_lp: X.lp || 0, p_defense: X.defense || 0 }) })
      .catch((e) => { console.error(`Questabschluss ${q.id}:`, (e as Error).message); return null; })) as boolean | null;
    if (ok === null) return { fehler: "Der Abschluss konnte nicht gespeichert werden. Versuch es gleich noch einmal." };
    let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, "fertig"); gemeldet(nutzer);
    if (ok) { /* erster Abschluss: jetzt – und nur jetzt – der Lohn */
      neu = geben(sb, nutzer, f.geben || [], k).neu;
      if (B.splitter) { const n = aufnehmen(sb, nutzer, "splitter", B.splitter); if (n < B.splitter) console.error(`Quest ${q.id}: Splitter passten nicht in den Rucksack:`, nutzer, n); aus.splitter = n; }
      for (const G of B.gegenstaende || []) { const n = aufnehmen(sb, nutzer, G.g, G.n || 1); if (n < (G.n || 1)) console.error(`Quest ${q.id}: ${G.g} passte nicht in den Rucksack:`, nutzer, n); }
      if (Object.values(X).some((v) => v)) { aus.belohnung = X; try { xpGutschrift(nutzer, X); } catch (e) { console.error("Quest-XP live:", (e as Error).message); } } } }
  else { const r = geben(sb, nutzer, f.geben || [], k); if (r.fehler) return { fehler: r.fehler }; neu = r.neu;
    const n = QB.nachFolge(q, s, f); if (n !== s) await setzen(sb, nutzer, q, n); }
  let zeilen = QB.folgeZeilen(q, o.npc, qStand(nutzer, q.id), f.geben && f.geben.length && !neu.length && f.nichtsZuGeben ? f.nichtsZuGeben : f.zeilen);
  const F = q.figuren.find((x) => x.id === o.npc)!; if (neu.length) zeilen = [...zeilen, { wer: F.name, text: `(Du bekommst: ${neu.join(", ")}.)` }];
  if (f.weiter) { const d = QB.dialog(q, o.npc, qStand(nutzer, q.id), kontext(nutzer)); return { ...aus, zeilen, dialog: d || undefined }; }
  offen.delete(nutzer); return { ...aus, zeilen, ende: true }; }

/* ───────── Questobjekte ───────── */
/** Gehört das Objekt zu einer Quest des Baukastens? */
export const objektDa = (id: string): boolean => QUESTS.some((q) => (q.objekte || []).some((o) => o.id === id));
/** Ein Questobjekt antippen (untersuchen / aufheben): Text für den Spieler; nur nah dran */
export async function motorObjekt(sb: Sb, nutzer: string, id: string, wx: number | undefined, wy: number | undefined): Promise<string> {
  for (const q of QUESTS) { const O = (q.objekte || []).find((o) => o.id === id); if (!O) continue;
    if (wx === undefined || wy === undefined || Math.hypot(O.x - wx, O.y - wy) > (O.weit ?? 3.2)) return "Geh näher heran.";
    const s = qStand(nutzer, q.id), r = QB.objekt(q, s, id, kontext(nutzer)); if (!r) return "Hier ist nichts."; if (r.stand !== s) await setzen(sb, nutzer, q, r.stand); return r.text; }
  return "Hier ist nichts."; }

/* ───────── Sammeln, Herstellen, Erlegen … ───────── */
/** Darf der Spieler dieses Questziel abbauen / dieses Questrezept herstellen? Text = nein; null = ja */
export function motorSperre(nutzer: string, art: "sammeln" | "herstellen", ziel: string, questId?: string): string | null {
  for (const q of QUESTS) { if (questId && q.id !== questId) continue; const r = QB.sperre(q, art, ziel, qStand(nutzer, q.id), kontext(nutzer)); if (r !== undefined) return r; }
  return questId ? "Das geht noch nicht." : null; }
/** Etwas ist geschehen (gesammelt, hergestellt, erlegt, untersucht …): Schritte erledigen, Zähler weiter */
export function motorEreignis(sb: Sb, nutzer: string, e: QB.Meldung): void {
  for (const q of QUESTS) { const s = qStand(nutzer, q.id), n = QB.ereignis(q, s, e); if (n !== s) void setzen(sb, nutzer, q, n); } }

/* ───────── Bedingte Beute und Aufheben ───────── */
/* Drop-Tabellen (config.ts „nur: <name>“): die Bedingung kommt aus den Quest-Daten (QuestDef.beute) */
for (const q of QUESTS) for (const [name, b] of Object.entries(q.beute || {})) {
  if (BEDINGUNGEN.has(name)) console.error(`Quest ${q.id}: Beute-Bedingung ${name} gibt es schon – wird ersetzt.`);
  BEDINGUNGEN.set(name, (nutzer) => QB.gilt(q, qStand(nutzer, q.id), b, kontext(nutzer))); }
AUFGENOMMEN.push((nutzer, g) => { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "aufheben", g }); });

/** Nur für Tests */
export function motorVergessen(): void { staende.clear(); offen.clear(); sbJe.clear(); }
