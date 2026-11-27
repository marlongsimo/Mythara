/*
 * Riftmere – Quest-Baukasten auf dem Server (Fahrplan Phase 1, 26.11.2026).
 * Führt jede Quest aus shared/quests.ts allein aus ihren Daten: Stand je Spieler (Migration 045, rpg_held.quests), Gespräche,
 * Antworten prüfen und ausführen (Gegenstände geben und nehmen, Schritte, Abschluss genau einmal), Questobjekte, Sperren und Ereignisse
 * (Sammeln, Herstellen, Erlegen, Untersuchen, Aufheben, Betreten, Benutzen), bedingte Beute.
 * Belohnung: erst nachdem rpg_held_quest_abschluss den ersten Abschluss bestätigt hat (true) – Splitter und Gegenstände nie doppelt.
 */
import { beruf } from "../../shared/berufe";
import * as QB from "../../shared/questbau";
import { QUESTS, questDef, schalterAn as schalterAnB } from "../../shared/quests";
import { levelAus, heldenlevel, SKILLS, type SkillXp, type Skill } from "../../shared/kampfwerte";
import { besitzt, besitztIrgendwo, aufnehmen, anzahlVon, abgeben, bodenDazu, berufXp, berufXpDazu, ladungenDazu, QUESTLOHN, BEDINGUNGEN, AUFGENOMMEN } from "./inventar";
import { weltRegionBei } from "../../shared/karten";
import { GEGENSTAENDE } from "../../shared/gegenstaende";

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
export function motorVerbinden(f: { melden(nutzer: string): void; xp(nutzer: string, xp: NonNullable<QB.Belohnung["xp"]>): void; heldXp?(nutzer: string): SkillXp | undefined }): void {
  gemeldet = f.melden; xpGutschrift = f.xp; if (f.heldXp) heldXp = f.heldXp; }

/** Was der Motor über den Spieler weiß: Rucksack, Bank, andere Quests, Skills (Kampfskills aus dem geladenen Helden) */
export const kontext = (nutzer: string): QB.Kontext => ({
  hat: (g) => besitzt(nutzer).includes(g), verloren: (g) => !besitztIrgendwo(nutzer, g), anzahl: (g) => anzahlVon(nutzer, g),
  quest: (id) => { const q = questDef(id); return q ? QB.lage(q, qStand(nutzer, id)).phase : "neu"; },
  skill: (k) => { if (beruf(k)) return levelAus(berufXp(nutzer, k)); /* Berufe (Holzfällerei, Handwerk …) aus dem Inventar */ const x = heldXp(nutzer); return x && (SKILLS as string[]).includes(k) ? levelAus(x[k as Skill] || 0, k as Skill) : 0; },
  heldenlevel: () => { const x = heldXp(nutzer); return x ? heldenlevel(x) : 0; }, zeit: () => Date.now() / 1000 /* Weltuhr für den Gesang (QuestObjekt.hoerbar) */, schalter: (id) => schalterAn(nutzer, id) /* Stadtstufen */ });
async function setzen(sb: Sb, nutzer: string, q: QB.QuestDef, s: string): Promise<void> {
  const alt = qStand(nutzer, q.id); if (alt === "fertig" || QB.abholbereit(alt) || !s || s === "fertig" || s === alt) return;
  let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, s); gemeldet(nutzer);
  await sb("/rest/v1/rpc/rpg_held_quest_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_stand: s }) }).catch((e) => console.error(`Queststand ${q.id} speichern:`, (e as Error).message));
  const n = nachziehen(nutzer, q, s); if (n !== s) await setzen(sb, nutzer, q, n); }
/** Aufheben-Schritte, deren Gegenstand der Spieler schon bei sich hat (z. B. das Pergament oder Bruchstücke schon früher gefunden): gleich erledigt, alle Stücke zählen */
function nachziehen(nutzer: string, q: QB.QuestDef, s: string): string { let n = s;
  for (const S of q.schritte) if (S.ereignis.art === "aufheben" && QB.moeglich(q, n, S.id) && besitzt(nutzer).includes(S.ereignis.g)) {
    const g = S.ereignis.g, mal = Math.max(1, Math.min(anzahlVon(nutzer, g) || 1, (S.anzahl || 1) - QB.zaehler(q, n, S.id))); for (let i = 0; i < mal; i++) n = QB.ereignis(q, n, { art: "aufheben", g }); }
  return n; }

/** Weltzustand je Spieler (QuestDef.schalter): Mühle dreht, Kapelle offen, Zielscheiben frei … */
export const schalterAn = (nutzer: string, id: string): boolean => schalterAnB((q) => qStand(nutzer, q), id);

/* ───────── Abschluss (genau einmal) ───────── */
/** Questpunkte des Spielers: immer aus den Queststand-Daten abgeleitet (Σ punkte aller abgeschlossenen Quests) – auch für Abschlüsse vor Migration 048.
 *  rpg_held.questpunkte ist nur eine Kopie, die der Server nachführt (punkteAbgleichen). */
export const questpunkte = (nutzer: string): number => QUESTS.reduce((n, q) => n + (qStand(nutzer, q.id) === "fertig" ? Math.min(10, q.punkte || 0) : 0), 0);
/** Die gespeicherte Kopie (rpg_held.questpunkte) an den abgeleiteten Wert angleichen – über rpg_held_questpunkte_setzen (Migration 049); fehlt sie, bleibt es beim Anzeigen */
let ohne049 = false;
export async function punkteAbgleichen(sb: Sb, nutzer: string, gespeichert: unknown): Promise<void> { const soll = questpunkte(nutzer);
  if (ohne049 || Math.floor(Number(gespeichert)) === soll) return;
  await sb("/rest/v1/rpc/rpg_held_questpunkte_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_punkte: soll }) })
    .catch((e) => { const t = (e as Error).message; if (/PGRST202|404|questpunkte_setzen/.test(t)) ohne049 = true; else console.error("Questpunkte speichern:", t); }); }
let ohneV2 = false;
/** Abschluss buchen: rpg_held_quest_abschluss_v2 (Migration 048: Kampf-XP, Berufe-XP, Questpunkte); fehlt sie noch, die alte Funktion (045: nur Kampf-XP).
 *  true = erster Abschluss (jetzt gibt es den Lohn), false = schon abgeschlossen, null = Fehler */
async function buchen(sb: Sb, nutzer: string, q: QB.QuestDef): Promise<boolean | null> { const B = q.belohnung || {}, X = B.xp || {};
  if (!ohneV2) try { return (await sb("/rest/v1/rpc/rpg_held_quest_abschluss_v2", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_xp: X, p_berufe: B.berufe || {}, p_punkte: q.punkte || 0 }) })) as boolean; }
    catch (e) { const t = (e as Error).message; if (!/PGRST202|404|abschluss_v2/.test(t)) { console.error(`Questabschluss ${q.id}:`, t); return null; }
      ohneV2 = true; console.error("Migration 048 fehlt noch: Questabschluss über rpg_held_quest_abschluss (ohne Questpunkte; Berufe-XP nur über das Inventar)."); }
  return (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: q.id, p_geschick: X.geschick || 0, p_staerke: X.staerke || 0, p_fernkampf: X.fernkampf || 0, p_magie: X.magie || 0, p_lp: X.lp || 0, p_defense: X.defense || 0 }) })
    .catch((e) => { console.error(`Questabschluss ${q.id}:`, (e as Error).message); return null; })) as boolean | null; }

/* ───────── Gespräche ───────── */
const offen = new Map<string, { q: string; npc: string }>();
/* ───────── Folge.angriff (E3): die Figur wird Gegner – die Kampfwelt (index.ts) holt die Wünsche ab und setzt den Gegner (Sim.angreifer) ───────── */
const angriffe = new Map<string, { art: string; x: number; y: number }[]>();
/** Wartende Angriffe dieses Spielers (Weltfelder) – danach leer */
export function angriffeHolen(nutzer: string): { art: string; x: number; y: number }[] { const L = angriffe.get(nutzer); if (!L) return []; angriffe.delete(nutzer); return L; }
export interface MotorAntwort { dialog?: QB.Dialog; zeilen?: QB.Zeile[]; ende?: boolean; fehler?: string; /** Kampf-XP (der Browser trägt sie nach) */ belohnung?: NonNullable<QB.Belohnung["xp"]>; splitter?: number; /** ein Teil des Lohns liegt am Boden */ amBoden?: boolean; /** Questpunkte für diesen Abschluss */ punkte?: number; /** #77: abgeschlossen, der Lohn dieser Quest wartet aufs Abholen */ abholen?: string; /** Folge.angriff: diese Figur ist jetzt ein Gegner (der Browser lässt sie beiseite treten) */ angriff?: string }
/** Gehört die Figur zu einer Quest des Baukastens? */
export const figurDa = (id: string): boolean => QUESTS.some((q) => q.figuren.some((f) => f.id === id));
export function motorReden(sb: Sb, nutzer: string, id: string, wx: number | undefined, wy: number | undefined): MotorAntwort {
  { const q = QB.figurQuest(QUESTS, (x) => qStand(nutzer, x), id, kontext(nutzer)), F = q && q.figuren.find((f) => f.id === id); if (!q || !F) return { fehler: "Hier ist niemand." }; /* Figur in mehreren Quests: die, bei der es etwas zu tun gibt */
    const k0 = kontext(nutzer), s1 = qStand(nutzer, q.id); if (!QB.figurDa(q, F, s1, k0)) return { fehler: "Hier ist niemand." }; /* QuestFigur.sichtbar (#49) */
    if (!QB.figurFolgt(q, F, s1, k0) && (wx === undefined || wy === undefined || Math.hypot(F.x - wx, F.y - wy) > (F.weit ?? QB.REDE_WEIT))) return { fehler: `Geh näher an ${F.name} heran.` }; /* wer folgt, ist beim Spieler */
    const k = k0, s0 = s1, s = nachziehen(nutzer, q, s0); if (s !== s0) void setzen(sb, nutzer, q, s); /* schon Dabeigehabtes zählt, bevor die Figur spricht */
    const d = QB.dialog(q, F.id, s, k); if (!d) return { fehler: "Hier ist niemand." };
    const r = QB.rede(q, F.id, s, k); if (r && r.anbieten) { const n = QB.nachFolge(q, s, { zeilen: [], anbieten: true }); if (n !== s) void setzen(sb, nutzer, q, n); }
    offen.set(nutzer, { q: q.id, npc: F.id }); return { dialog: d }; }
  return { fehler: "Hier ist niemand." }; }
export const motorImGespraech = (nutzer: string, id: string): boolean => { const o = offen.get(nutzer); return Boolean(o && o.npc === id); };
export function motorEnde(nutzer: string): void { offen.delete(nutzer); }

/** Gegenstände einer Folge geben: verlorene zurück (Pflicht – sonst Fehler), fehlende Werkzeuge (nur, was weder im Rucksack noch angelegt ist, auch nichts Gleichwertiges) */
function geben(sb: Sb, nutzer: string, L: QB.Geben[], k: QB.Kontext, rein: (g: string, n: number) => number = (g, n) => aufnehmen(sb, nutzer, g, n)): { neu: string[]; fehler?: string } {
  const neu: string[] = [];
  for (const G of L) {
    if (G.verloren) { if (!k.verloren(G.g)) return { neu, fehler: "Das hast du doch noch." }; if (!aufnehmen(sb, nutzer, G.g, 1)) return { neu, fehler: "Dein Rucksack ist voll." }; neu.push(G.name); continue; }
    if (G.fehlt) { const da = besitzt(nutzer), re = G.gleich ? new RegExp(G.gleich) : null; if (da.includes(G.g) || (re && da.some((x) => re.test(x)))) continue; }
    if (rein(G.g, 1)) neu.push(G.name); }
  return { neu }; }

/** wo: Stelle des Spielers (Weltfelder) – dort landet Lohn, der nicht mehr in den Rucksack passt */
export async function motorAntworten(sb: Sb, nutzer: string, id: string, a: string, wo?: { x?: number; y?: number }): Promise<MotorAntwort> {
  const o = offen.get(nutzer), q = o && questDef(o.q); if (!o || !q || o.npc !== id) return { fehler: "Das Gespräch ist vorbei." };
  const k = kontext(nutzer), s = qStand(nutzer, q.id), f = QB.antwort(q, o.npc, s, String(a || "").slice(0, 24), k);
  if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  /* Gegenstände nehmen: erst prüfen, dann alle auf einmal */
  for (const N of f.nehmen || []) if (anzahlVon(nutzer, N.g) < (N.n || 1)) return { fehler: "Dafür fehlt dir noch etwas." };
  const nehmen = () => { for (const N of f.nehmen || []) for (let i = 0; i < (N.n || 1); i++) abgeben(sb, nutzer, N.g); };
  if (!f.abschluss) nehmen(); /* beim Abschluss erst nach der Buchung */
  const aus: MotorAntwort = {}; let neu: string[] = [];
  if (f.abschluss) { /* #77: die Quest ist jetzt abgeschlossen, der Lohn wartet aufs Abholen („Okay“ im Abschlussfenster) – gebucht wird erst dann, genau einmal */
    if (!QB.laeuft(q, s)) return { fehler: "Das ist schon erledigt." };
    const F0 = q.figuren.find((x) => x.id === o.npc)!, bx = wo && Number.isFinite(wo.x) ? wo.x! : F0.x, by = wo && Number.isFinite(wo.y) ? wo.y! : F0.y; let boden = 0;
    nehmen(); neu = geben(sb, nutzer, (f.geben || []).filter((G) => !G.verloren), k, lohnGeber(sb, nutzer, bx, by, (n) => { boden += n; })).neu; /* was die Figur im Gespräch gibt (Waffe nach Wahl), gleich */
    await setzen(sb, nutzer, q, QB.ABHOLBEREIT); if (boden) aus.amBoden = true; aus.abholen = q.id; }
  else { const r = geben(sb, nutzer, f.geben || [], k); if (r.fehler) return { fehler: r.fehler }; neu = r.neu;
    if (f.angriff) { const F1 = q.figuren.find((x) => x.id === o.npc)!; angriffe.set(nutzer, [...(angriffe.get(nutzer) || []), { art: f.angriff, x: F1.x, y: F1.y }]); aus.angriff = F1.id; }
    const n = QB.nachFolge(q, s, f); if (n !== s) await setzen(sb, nutzer, q, n); }
  let zeilen = QB.folgeZeilen(q, o.npc, qStand(nutzer, q.id), f.geben && f.geben.length && !neu.length && f.nichtsZuGeben ? f.nichtsZuGeben : f.zeilen);
  const F = q.figuren.find((x) => x.id === o.npc)!; if (neu.length) zeilen = [...zeilen, { wer: F.name, text: `(Du bekommst: ${neu.join(", ")}.)` }];
  if (aus.amBoden) zeilen = [...zeilen, { wer: F.name, text: "(Dein Rucksack ist voll – der Rest liegt neben dir am Boden.)" }];
  if (f.weiter) { const d = QB.dialog(q, o.npc, qStand(nutzer, q.id), kontext(nutzer)); return { ...aus, zeilen, dialog: d || undefined }; }
  offen.delete(nutzer); return { ...aus, zeilen, ende: true }; }

/* ───────── Abholen (#77): der Lohn nach dem Abschlussfenster ───────── */
/** Lohn in den Rucksack – gebunden (Entscheidung zu #65, außer Splittern); was nicht passt, liegt am Boden unter dem Spieler, nur für ihn (beimBoden: wie viele) */
function lohnGeber(sb: Sb, nutzer: string, bx: number, by: number, beimBoden: (n: number) => void): (g: string, n: number) => number {
  return (g, n) => { const d = g === "splitter" ? undefined : { gebunden: true }, k = aufnehmen(sb, nutzer, g, n, true, d); if (k < n && bodenDazu(weltRegionBei(bx, by), bx, by, g, n - k, nutzer, QUESTLOHN, Date.now(), d)) beimBoden(n - k); return n; }; }
export interface MotorAbgeholt { fehler?: string; /** gebucht für diese Quest */ abgeholt?: string; /** war schon gebucht (nichts doppelt) */ schon?: boolean; belohnung?: NonNullable<QB.Belohnung["xp"]>; berufe?: Record<string, number>; splitter?: number; gegenstaende?: string[]; punkte?: number; gesamtPunkte?: number; /** so viele Gegenstände liegen am Boden (Rucksack voll) */ amBoden?: number; /** #146: die gewählte Belohnung; wahlFehlt: ohne gültige Wahl nichts gebucht */ gewaehlt?: string; wahlFehlt?: boolean }
const holt = new Set<string>();
/** Den Lohn einer abgeschlossenen Quest abholen: bucht genau einmal (rpg_held_quest_abschluss_v2); doppeltes „Okay“ bucht nichts doppelt. wo: Stelle des Spielers */
export async function motorAbholen(sb: Sb, nutzer: string, id: string, wo?: { x?: number; y?: number }, wahl?: unknown): Promise<MotorAbgeholt> {
  const q = questDef(String(id || "")); if (!q) return { fehler: "Diese Quest gibt es nicht." };
  const s = qStand(nutzer, q.id); if (!QB.abholbereit(s)) return s === "fertig" ? { abgeholt: q.id, schon: true } : { fehler: "Da gibt es nichts abzuholen." };
  const W = (q.belohnung || {}).wahl, gewaehlt = W && W.length ? W.find((x) => x.g === String(wahl || "")) : undefined; /* #146: Belohnung zur Auswahl – genau eine der angebotenen */
  if (W && W.length && !gewaehlt) return { fehler: "Wähle zuerst eine Belohnung.", wahlFehlt: true };
  const key = nutzer + "|" + q.id; if (holt.has(key)) return { fehler: "Einen Moment …" }; holt.add(key);
  try { const ok = await buchen(sb, nutzer, q); if (ok === null) return { fehler: "Der Lohn konnte nicht gebucht werden. Versuch es gleich noch einmal." };
    let m = staende.get(nutzer); if (!m) staende.set(nutzer, (m = new Map())); m.set(q.id, "fertig"); gemeldet(nutzer);
    if (!ok) return { abgeholt: q.id, schon: true, gesamtPunkte: questpunkte(nutzer) }; /* in der Datenbank schon gebucht (z. B. nach einem Absturz): nichts doppelt */
    const B = q.belohnung || {}, X = B.xp || {}, F0 = q.figuren.find((x) => x.id === (q.abgabe || q.geber)) || q.figuren[0], bx = wo && Number.isFinite(wo.x) ? wo.x! : F0.x, by = wo && Number.isFinite(wo.y) ? wo.y! : F0.y;
    let boden = 0; const lohn = lohnGeber(sb, nutzer, bx, by, (n) => { boden += n; }), aus: MotorAbgeholt = { abgeholt: q.id, gegenstaende: [] };
    if (B.splitter) aus.splitter = lohn("splitter", B.splitter);
    for (const G of [...(B.gegenstaende || []), ...(gewaehlt ? [gewaehlt] : [])]) { lohn(G.g, G.n || 1); aus.gegenstaende!.push(GEGENSTAENDE[G.g] ? GEGENSTAENDE[G.g].name : G.g); }
    if (gewaehlt) aus.gewaehlt = gewaehlt.g;
    if (Object.values(X).some((v) => v)) { aus.belohnung = X; try { xpGutschrift(nutzer, X); } catch (e) { console.error("Quest-XP live:", (e as Error).message); } }
    for (const [b, n] of Object.entries(B.berufe || {})) if (n > 0) berufXpDazu(sb, nutzer, b, Math.min(QB.LOHN_JE_SKILL, n)); /* dieselbe Grenze wie in der Datenbank (Migration 051) */
    if (B.berufe) aus.berufe = { ...B.berufe };
    for (const [g, n] of Object.entries(B.ladungen || {})) if (n > 0) ladungenDazu(sb, nutzer, g, n);   /* B1: 10 Ladungen im Wegstein */
    if (q.punkte) { aus.punkte = Math.min(10, q.punkte); if (ohneV2) void punkteAbgleichen(sb, nutzer, -1); /* ohne 048 hat die Buchung keine Punkte geschrieben */ }
    aus.gesamtPunkte = questpunkte(nutzer); if (boden) aus.amBoden = boden; return aus; }
  finally { holt.delete(key); } }
/** Quests, deren Lohn aufs Abholen wartet (nach dem Einloggen zeigt der Browser das Fenster wieder) */
export const abholbereitListe = (nutzer: string): string[] => QUESTS.filter((q) => QB.abholbereit(qStand(nutzer, q.id))).map((q) => q.id);

/* ───────── Questobjekte ───────── */
/** Gehört das Objekt zu einer Quest des Baukastens? */
export const objektDa = (id: string): boolean => QUESTS.some((q) => (q.objekte || []).some((o) => o.id === id));
/** Ein Questobjekt antippen (untersuchen / aufheben): Text für den Spieler; nur nah dran */
export async function motorObjekt(sb: Sb, nutzer: string, id: string, wx: number | undefined, wy: number | undefined): Promise<string> {
  for (const q of QUESTS) { const O = (q.objekte || []).find((o) => o.id === id); if (!O) continue;
    if (wx === undefined || wy === undefined || Math.hypot(O.x - wx, O.y - wy) > (O.weit ?? 3.2)) return "Geh näher heran.";
    const s = qStand(nutzer, q.id), r = QB.objekt(q, s, id, kontext(nutzer)); if (!r) return "Hier ist nichts.";
    if (r.falsch) { if (r.stand !== s) await setzen(sb, nutzer, q, r.stand); return r.text; } /* Rätsel: falsche Reihenfolge – von vorn */
    if (r.stand !== s) { /* erledigt: erst nehmen (alles da?), dann geben, dann den Stand */
      for (const N of O.nehmen || []) if (anzahlVon(nutzer, N.g) < (N.n || 1)) return "Dafür fehlt dir noch etwas.";
      for (const N of O.nehmen || []) for (let i = 0; i < (N.n || 1); i++) abgeben(sb, nutzer, N.g);
      for (const G of O.geben || []) { const n = G.n || 1, k = aufnehmen(sb, nutzer, G.g, n); if (k < n) bodenDazu(weltRegionBei(O.x, O.y), wx, wy, G.g, n - k, nutzer, QUESTLOHN); }
      await setzen(sb, nutzer, q, r.stand); }
    return r.text; }
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
export function motorVergessen(): void { staende.clear(); offen.clear(); sbJe.clear(); ohne049 = false; }
