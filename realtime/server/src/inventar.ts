/*
 * Mythara Echtzeit – Inventar des eigenen Helden und Gegenstände am Boden (seit 22.11.2026). Der Server ist die einzige Wahrheit:
 * Der Browser bittet (anlegen, ablegen, fallen lassen, aufheben), der Server prüft, ändert und schickt das neue Inventar zurück.
 *
 * Inventar: je Konto im Arbeitsspeicher, geladen aus rpg_held.inventar (Migration 043; fehlt es, aus der Startwaffe), gespeichert über
 *   rpg_held_inventar_setzen (nur service_role) kurz nach jeder Änderung und beim Gehen. Form: { angelegt: {waffe, brust, nebenhand}, rucksack: [id | {g, n}, …], v }.
 *   Stapelbare Gegenstände (z. B. Splitter) liegen als {g, n} in einem Fach. v: Stand der Startausrüstung (2: mit Rüstung zu Bogen und Stab).
 * Boden: je Region (Weltfelder), nur im Arbeitsspeicher.
 *   Beute eines Gegners: 30 s nur für den, der den meisten Schaden gemacht hat (bei Gleichstand den letzten Schlag), dann 5 min für alle.
 *   Selbst fallen gelassen: 1 min nur für einen selbst, dann 10 min für alle. Danach verschwindet es.
 */
import { GEGENSTAENDE, Platz, PLAETZE, RUCKSACK_PLAETZE, startAusruestung, Fach, fachG, fachN } from "../../shared/gegenstaende";
import { Startwaffe } from "../../shared/aussehen";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface Inv { angelegt: Partial<Record<Platz, string>>; rucksack: Fach[]; v?: number }
const INV_STAND = 2;
interface Eintrag { inv: Inv; waffe: Startwaffe; uhr?: ReturnType<typeof setTimeout>; hoerer: Set<(inv: Inv) => void> }
const je = new Map<string, Eintrag>(), laedt = new Map<string, Promise<Eintrag | null>>();
const kopie = (i: Inv): Inv => ({ angelegt: { ...i.angelegt }, rucksack: i.rucksack.map((f) => (typeof f === "string" ? f : { ...f })), v: i.v });

/** Inventar aus unbekannter Quelle prüfen: nur bekannte Gegenstände, jeder auf seinem Platz, höchstens RUCKSACK_PLAETZE im Rucksack */
export function invPruefen(roh: unknown, waffe: Startwaffe): Inv {
  const o = (roh && typeof roh === "object" ? roh : null) as { angelegt?: Record<string, unknown>; rucksack?: unknown[] } | null;
  if (!o || !o.angelegt || !Array.isArray(o.rucksack)) return { angelegt: startAusruestung(waffe), rucksack: [], v: INV_STAND };
  const angelegt: Partial<Record<Platz, string>> = {}; for (const { id } of PLAETZE) { const g = o.angelegt[id]; if (typeof g === "string" && GEGENSTAENDE[g] && GEGENSTAENDE[g].platz === id) angelegt[id] = g; }
  const rucksack: Fach[] = []; for (const f of o.rucksack) { const g = typeof f === "string" ? f : f && typeof f === "object" ? String((f as { g?: unknown }).g) : "", G = GEGENSTAENDE[g]; if (!G) continue;
    if (G.stapel) { const n = Math.max(1, Math.min(G.stapel, Math.floor(Number(typeof f === "string" ? 1 : (f as { n?: unknown }).n) || 1))); rucksack.push({ g, n }); } else rucksack.push(g); }
  const inv: Inv = { angelegt, rucksack: rucksack.slice(0, RUCKSACK_PLAETZE), v: Number((o as { v?: unknown }).v) || 1 };
  if ((inv.v ?? 1) < INV_STAND) { /* Startausrüstung erweitert (Rüstung zu Bogen und Stab): einmal nachreichen, wenn der Platz frei ist und sie nirgends liegt */
    for (const [platz, g] of Object.entries(startAusruestung(waffe)) as [Platz, string][]) if (!inv.angelegt[platz] && !inv.rucksack.some((f) => fachG(f) === g)) inv.angelegt[platz] = g;
    inv.v = INV_STAND; }
  return inv;
}
/** Das Inventar eines Kontos laden (einmal; danach aus dem Arbeitsspeicher). null: das Konto hat noch keinen eigenen Helden */
export function inventarLaden(sb: Sb, nutzer: string): Promise<Eintrag | null> {
  const da = je.get(nutzer); if (da) return Promise.resolve(da); const l = laedt.get(nutzer); if (l) return l;
  const p = (sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=*`) as Promise<{ waffe: string; inventar?: unknown }[]>).then((z) => {
    const r = z && z[0]; if (!r || !["schwert", "bogen", "stab"].includes(String(r.waffe))) return null; const waffe = r.waffe as Startwaffe;
    const e: Eintrag = { inv: invPruefen(r.inventar, waffe), waffe, hoerer: new Set() }; je.set(nutzer, e); if (!r.inventar || (Number((r.inventar as { v?: unknown }).v) || 1) < INV_STAND) merken(sb, nutzer, e); return e; })
    .catch((x) => { console.error("Inventar laden:", (x as Error).message); return null; }).finally(() => laedt.delete(nutzer));
  laedt.set(nutzer, p); return p; }
/** Das geladene Inventar (Kopie) oder null */
export function inventarVon(nutzer: string): Inv | null { const e = je.get(nutzer); return e ? kopie(e.inv) : null; }
/** Bei jeder Änderung Bescheid bekommen (Welt-Verbindung schickt es dem Browser, das Kampfgebiet setzt die Kampfwerte neu). Zurück: abmelden */
export function inventarHoeren(nutzer: string, f: (inv: Inv) => void): () => void { const e = je.get(nutzer); if (!e) return () => {}; e.hoerer.add(f); return () => { e.hoerer.delete(f); }; }
function geaendert(sb: Sb, nutzer: string, e: Eintrag) { for (const f of e.hoerer) try { f(kopie(e.inv)); } catch (x) { console.error("Inventar-Hörer:", (x as Error).message); } merken(sb, nutzer, e); }
/** Speichern kurz nach der letzten Änderung (mehrere schnelle Änderungen = ein Speichern) */
function merken(sb: Sb, nutzer: string, e: Eintrag) { if (e.uhr) clearTimeout(e.uhr); e.uhr = setTimeout(() => { e.uhr = undefined; void speichern(sb, nutzer, e); }, 1500); }
async function speichern(sb: Sb, nutzer: string, e: Eintrag) {
  try { await sb("/rest/v1/rpc/rpg_held_inventar_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_inventar: e.inv }) }); }
  catch (x) { console.error("Inventar nicht gespeichert (Migration 043 eingespielt?):", (x as Error).message); } }
/** Jetzt speichern (beim Gehen) */
export function inventarSichern(sb: Sb, nutzer: string): void { const e = je.get(nutzer); if (!e || !e.uhr) return; clearTimeout(e.uhr); e.uhr = undefined; void speichern(sb, nutzer, e); }

/* ───────── Aktionen (Rückgabe: Fehlertext für den Spieler oder null) ───────── */
export function anlegen(sb: Sb, nutzer: string, i: number): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; const f = e.inv.rucksack[i], g = f !== undefined ? fachG(f) : "", G = g ? GEGENSTAENDE[g] : null; if (!g || !G) return "Diesen Gegenstand gibt es im Rucksack nicht.";
  if (!G.platz) return "Das kann man nicht anlegen.";
  /* Zweihänder und Speer belegen auch die Nebenhand; ein Schild bei angelegter Zweihandwaffe legt die Waffe ab. Was weg muss, kommt in den Rucksack. */
  const W = e.inv.angelegt.waffe, wegPlatz: Platz | null = G.zweihand && e.inv.angelegt.nebenhand ? "nebenhand" : G.platz === "nebenhand" && W && GEGENSTAENDE[W] && GEGENSTAENDE[W].zweihand ? "waffe" : null;
  const alt = e.inv.angelegt[G.platz], danach = e.inv.rucksack.length - 1 + (alt ? 1 : 0) + (wegPlatz ? 1 : 0); /* Fächer nach dem Tausch */
  if (danach > RUCKSACK_PLAETZE) return "Der Rucksack ist voll.";
  e.inv.rucksack.splice(i, 1); if (alt) e.inv.rucksack.splice(i, 0, alt);
  if (wegPlatz) { e.inv.rucksack.push(e.inv.angelegt[wegPlatz]!); delete e.inv.angelegt[wegPlatz]; }
  e.inv.angelegt[G.platz] = g; geaendert(sb, nutzer, e); return null; }
export function ablegen(sb: Sb, nutzer: string, platz: string): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; const g = e.inv.angelegt[platz as Platz]; if (!g) return "Dort ist nichts angelegt.";
  if (e.inv.rucksack.length >= RUCKSACK_PLAETZE) return "Der Rucksack ist voll."; delete e.inv.angelegt[platz as Platz]; e.inv.rucksack.push(g); geaendert(sb, nutzer, e); return null; }
/** Ein ganzes Fach aus dem Rucksack nehmen (zum Fallenlassen; ein Stapel als Ganzes). Zurück: Gegenstand und Anzahl oder null */
export function herausnehmen(sb: Sb, nutzer: string, i: number): { g: string; n: number } | null { const e = je.get(nutzer); if (!e) return null; const f = e.inv.rucksack[i]; if (f === undefined) return null;
  e.inv.rucksack.splice(i, 1); geaendert(sb, nutzer, e); return { g: fachG(f), n: fachN(f) }; }
/** In den Rucksack legen, so viele wie Platz ist – Stapelbares auf vorhandene Stapel, sonst je Gegenstand ein Fach. Zurück: wie viele genommen wurden */
export function aufnehmen(sb: Sb, nutzer: string, g: string, n: number, melden = true): number { const e = je.get(nutzer), G = GEGENSTAENDE[g]; if (!e || !G || n < 1) return 0; let rest = n;
  if (G.stapel) { for (const f of e.inv.rucksack) if (typeof f !== "string" && f.g === g && f.n < G.stapel) { const k = Math.min(rest, G.stapel - f.n); f.n += k; rest -= k; if (!rest) break; }
    while (rest > 0 && e.inv.rucksack.length < RUCKSACK_PLAETZE) { const k = Math.min(rest, G.stapel); e.inv.rucksack.push({ g, n: k }); rest -= k; } }
  else while (rest > 0 && e.inv.rucksack.length < RUCKSACK_PLAETZE) { e.inv.rucksack.push(g); rest--; }
  const k = n - rest; if (k && melden) geaendert(sb, nutzer, e); if (k) for (const f of AUFGENOMMEN) f(nutzer, g, k); return k; }
/** Bedingungen für Drop-Rolls (config.ts MonsterDef.drops nur), eingetragen von den Quests: „einsteigerquest“ – Quest 01 läuft (quests.ts) */
export const BEDINGUNGEN = new Map<string, (nutzer: string) => boolean>();
export function bedingungErfuellt(nutzer: string, name: string): boolean { const f = BEDINGUNGEN.get(name); return Boolean(f && nutzer && f(nutzer)); }
/** Wer erfahren will, was jemand in den Rucksack bekommt (Quests: das Schriftstück) */
export const AUFGENOMMEN: ((nutzer: string, g: string, n: number) => void)[] = [];
/** Trägt er diesen Gegenstand im Rucksack? */
export function hat(nutzer: string, g: string): boolean { const e = je.get(nutzer); return Boolean(e && e.inv.rucksack.some((f) => fachG(f) === g)); }
/** Einen Gegenstand aus dem Rucksack abgeben (Quest: Beweis übergeben). Zurück: ob es ihn gab */
export function abgeben(sb: Sb, nutzer: string, g: string): boolean { const e = je.get(nutzer); if (!e) return false; const i = e.inv.rucksack.findIndex((f) => fachG(f) === g); if (i < 0) return false;
  const f = e.inv.rucksack[i]; if (typeof f !== "string" && f.n > 1) f.n--; else e.inv.rucksack.splice(i, 1); geaendert(sb, nutzer, e); return true; }

/** Wie viele davon im Rucksack liegen (alle Fächer zusammen) */
export function anzahlVon(nutzer: string, g: string): number { const e = je.get(nutzer); return e ? e.inv.rucksack.reduce((n, f) => n + (fachG(f) === g ? fachN(f) : 0), 0) : 0; }
/** Passt ein weiteres Stück davon in den Rucksack? */
export function platzFuer(nutzer: string, g: string): boolean { const e = je.get(nutzer), G = GEGENSTAENDE[g]; if (!e || !G) return false;
  return e.inv.rucksack.length < RUCKSACK_PLAETZE || Boolean(G.stapel && e.inv.rucksack.some((f) => typeof f !== "string" && f.g === g && f.n < G.stapel!)); }
/** Kaufen: preis Stück der Währung abgeben, dann den Gegenstand in den Rucksack (alles oder nichts). Zurück: Fehlertext oder null */
export function kaufen(sb: Sb, nutzer: string, g: string, preis: number, waehrung: string): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; if (!GEGENSTAENDE[g]) return "Das gibt es hier nicht.";
  const hat = anzahlVon(nutzer, waehrung); if (hat < preis) return `Dafür fehlen dir ${preis - hat} ${GEGENSTAENDE[waehrung] ? GEGENSTAENDE[waehrung].name : waehrung}.`;
  let rest = preis; for (let i = e.inv.rucksack.length - 1; i >= 0 && rest > 0; i--) { const f = e.inv.rucksack[i]; if (fachG(f) !== waehrung) continue; const n = fachN(f), k = Math.min(n, rest); rest -= k;
    if (k >= n) e.inv.rucksack.splice(i, 1); else (f as { g: string; n: number }).n = n - k; }
  if (!platzFuer(nutzer, g)) { aufnehmen(sb, nutzer, waehrung, preis, false); return "Der Rucksack ist voll."; } /* Geld zurück (es lag eben noch drin, also passt es) */
  aufnehmen(sb, nutzer, g, 1, false); geaendert(sb, nutzer, e); return null; }
/** Einen Trank aus Fach i nehmen (eins vom Stapel). Zurück: die Trank-Art (VERBRAUCH) oder null */
export function trankNehmen(sb: Sb, nutzer: string, i: number): string | null { const e = je.get(nutzer); if (!e) return null; const f = e.inv.rucksack[i]; if (f === undefined) return null; const G = GEGENSTAENDE[fachG(f)];
  if (!G || !G.trank) return null; if (typeof f !== "string" && f.n > 1) f.n--; else e.inv.rucksack.splice(i, 1); geaendert(sb, nutzer, e); return G.trank; }
/** Einen genommenen Trank zurücklegen (das Trinken ging nicht) */
export function trankZurueck(sb: Sb, nutzer: string, g: string): void { aufnehmen(sb, nutzer, g, 1); }

/* ───────── Boden ───────── */
export interface BodenDing { id: number; g: string; n: number; ort: string; x: number; y: number; besitzer: string; offenAb: number; bis: number }
const boden = new Map<number, BodenDing>(); let nr = 1;
export const LOOT = { privat: 30_000, offen: 5 * 60_000 }, FALLEN = { privat: 60_000, offen: 10 * 60_000 }, AUFHEBEN_WEIT = 0; /* Feldabstand: man muss auf dem Feld des Gegenstands stehen */
/** Etwas auf den Boden legen. besitzer "": sofort für alle sichtbar */
export function bodenDazu(ort: string, x: number, y: number, g: string, n: number, besitzer: string, zeiten: { privat: number; offen: number }, jetzt = Date.now()): BodenDing | null {
  if (!GEGENSTAENDE[g] || n < 1 || !Number.isFinite(x) || !Number.isFinite(y)) return null; const offenAb = besitzer ? jetzt + zeiten.privat : jetzt;
  const d: BodenDing = { id: nr++, g, n: Math.floor(n), ort, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, besitzer, offenAb, bis: offenAb + zeiten.offen }; boden.set(d.id, d); return d; }
const sichtbar = (d: BodenDing, nutzer: string, jetzt: number) => jetzt < d.bis && (jetzt >= d.offenAb || (nutzer !== "" && d.besitzer === nutzer));
/** Was dieser Spieler in seiner Region am Boden sieht */
export function bodenSicht(ort: string, nutzer: string, jetzt = Date.now()): { i: number; g: string; n: number; x: number; y: number }[] {
  const aus: { i: number; g: string; n: number; x: number; y: number }[] = []; for (const d of boden.values()) if (d.ort === ort && sichtbar(d, nutzer, jetzt)) aus.push({ i: d.id, g: d.g, n: d.n, x: d.x, y: d.y }); return aus; }
/** Aufheben: nur was man sieht und auf dessen Feld man steht (Feldabstand ≤ AUFHEBEN_WEIT). Zurück: Fehlertext oder null */
export function bodenAufheben(sb: Sb, nutzer: string, ort: string, id: number, x: number | undefined, y: number | undefined, jetzt = Date.now()): string | null {
  const d = boden.get(id); if (!d || d.ort !== ort || !sichtbar(d, nutzer, jetzt)) return "Das liegt hier nicht (mehr).";
  if (x === undefined || y === undefined || Math.max(Math.abs(Math.floor(d.x) - Math.floor(x)), Math.abs(Math.floor(d.y) - Math.floor(y))) > AUFHEBEN_WEIT) return "Stell dich auf das Feld, um es aufzuheben.";
  if (!je.get(nutzer)) return "Kein Inventar."; const k = aufnehmen(sb, nutzer, d.g, d.n); if (!k) return "Der Rucksack ist voll.";
  if (k < d.n) { d.n -= k; return "Der Rucksack ist voll – ein Teil bleibt liegen."; }
  if (k >= d.n) boden.delete(id); else d.n -= k; return null; }
/** Abgelaufenes wegräumen (einmal je Sekunde) */
export function bodenAufraeumen(jetzt = Date.now()): void { for (const [id, d] of boden) if (jetzt >= d.bis) boden.delete(id); }
/** Für Prüfungen */
export const bodenAlle = (): BodenDing[] => [...boden.values()];
