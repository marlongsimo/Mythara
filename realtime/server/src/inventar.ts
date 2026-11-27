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
import { Wirkung, wirkungenPruefen, wirkungenAktiv, wirkungDazu } from "../../shared/wirkungen";
import { LADBAR, LADUNG_MAX, LADUNG_MAX_KERN, KERN_MERKER, WAFFE_LADEN, WAFFE_LADUNG_MAX } from "../../shared/splitterbinden";
import { GEGENSTAENDE, Platz, PLAETZE, RUCKSACK_PLAETZE, startAusruestung, Fach, fachG, fachN, fachD, Daten, datenPruefen, datenGleich, geladen, ablegbar, handelbar, anzeigeName } from "../../shared/gegenstaende";
import { berufeUmstellen, UMSTELLUNG_SCHMIEDEN } from "../../shared/berufe";
import { Startwaffe } from "../../shared/aussehen";
import { BANK_PLAETZE, BANK_MAX, BANK_REITER } from "../../shared/bank";
import { REISEKARTE, reiseTag, reiseMerker } from "../../shared/wegstein";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface Inv { angelegt: Partial<Record<Platz, string>>; /** Daten der angelegten Exemplare (Phase 5a: Ladungen der Waffe, gebunden) */ angelegtD?: Partial<Record<Platz, Daten>>; rucksack: Fach[]; v?: number; /** Bank (shared/bank.ts): [Gegenstand, Menge, Daten?] – stapelt bei gleichen Daten */ bank?: BankFach[]; /** Reiter der Bank: Gegenstand → 1 … BANK_REITER (fehlt = ohne Reiter) */ bankTabs?: Record<string, number>; /** XP der Berufe (Holzfällerei …), nur der Server schreibt */ berufe?: Record<string, number>; /** Ladungen (shared/splitterbinden.ts): Gegenstand → Zahl, z. B. { wegstein: 10 } – nicht am Gegenstand, damit Stapel und Bank einfach bleiben */ ladungen?: Record<string, number>; /** laufende Wirkungen (shared/wirkungen.ts, Phase 3b) */ wirkungen?: Wirkung[]; /** einmalige Umstellungen, die schon geschehen sind (shared/berufe.ts) */ merker?: string[];
  /** Räucherhütte (#102): ein laufender Auftrag – Rezept, Stück, fertig ab (ms) */ warten?: Warten }
/** Ein Auftrag an einer Station mit Wartezeit (Rezept.warten): die Zutaten sind schon genommen */
export interface Warten { r: string; n: number; fertig: number }
const INV_STAND = 2;
/** Ein Bankfach: Gegenstand, Menge und (Phase 5a) Daten je Exemplar */
export type BankFach = [string, number] | [string, number, Daten];
const dKopie = (d?: Daten): Daten | undefined => (d ? { ...d } : undefined);
/** Ladungen nur an Waffen ab Selten (Phase 5b) – sonst fallen sie weg */
const datenFuer = (g: string, d?: Daten): Daten | undefined => { if (!d) return undefined; const G = GEGENSTAENDE[g], x: Daten = { ...d }; if (x.ladungen && !(G && G.waffe && WAFFE_LADEN[G.seltenheit])) delete x.ladungen; return Object.keys(x).length ? x : undefined; };
interface Eintrag { inv: Inv; waffe: Startwaffe; uhr?: ReturnType<typeof setTimeout>; hoerer: Set<(inv: Inv) => void> }
const je = new Map<string, Eintrag>(), laedt = new Map<string, Promise<Eintrag | null>>();
const kopie = (i: Inv): Inv => ({ angelegt: { ...i.angelegt }, ...(i.angelegtD ? { angelegtD: Object.fromEntries(Object.entries(i.angelegtD).map(([k, d]) => [k, { ...d }])) } : {}), rucksack: i.rucksack.map((f) => (typeof f === "string" ? f : f.d ? { ...f, d: { ...f.d } } : { ...f })), v: i.v, ...(i.bank ? { bank: i.bank.map((b) => (b[2] ? [b[0], b[1], { ...b[2] }] : [b[0], b[1]]) as BankFach) } : {}), ...(i.bankTabs ? { bankTabs: { ...i.bankTabs } } : {}), ...(i.berufe ? { berufe: { ...i.berufe } } : {}), ...(i.ladungen ? { ladungen: { ...i.ladungen } } : {}), ...(i.wirkungen ? { wirkungen: i.wirkungen.map((w) => ({ ...w, werte: { ...w.werte } })) } : {}), ...(i.merker ? { merker: [...i.merker] } : {}), ...(i.warten ? { warten: { ...i.warten } } : {}) });
/** Bank aus unbekannter Quelle prüfen: nur bekannte Gegenstände, ganze Mengen 1 … BANK_MAX, jeder Gegenstand einmal, höchstens BANK_PLAETZE */
function bankPruefen(roh: unknown): BankFach[] { const b: BankFach[] = []; if (!Array.isArray(roh)) return b;
  for (const f of roh) { if (!Array.isArray(f)) continue; const g = String(f[0]), n = Math.floor(Number(f[1])), d = datenFuer(g, datenPruefen(f[2])); if (!GEGENSTAENDE[g] || !(n >= 1)) continue;
    const da = b.find((x) => x[0] === g && datenGleich(x[2], d)); if (da) da[1] = Math.min(BANK_MAX, da[1] + n); else if (b.length < BANK_PLAETZE) b.push(d ? [g, Math.min(BANK_MAX, n), d] : [g, Math.min(BANK_MAX, n)]); }
  return b; }

/** Inventar aus unbekannter Quelle prüfen: nur bekannte Gegenstände, jeder auf seinem Platz, höchstens RUCKSACK_PLAETZE im Rucksack */
export function invPruefen(roh: unknown, waffe: Startwaffe): Inv {
  const o = (roh && typeof roh === "object" ? roh : null) as { angelegt?: Record<string, unknown>; rucksack?: unknown[] } | null;
  if (!o || !o.angelegt || !Array.isArray(o.rucksack)) return { angelegt: startAusruestung(waffe), rucksack: [], v: INV_STAND, merker: [UMSTELLUNG_SCHMIEDEN] }; /* neuer Held: nichts umzustellen */
  const angelegt: Partial<Record<Platz, string>> = {}, angelegtD: Partial<Record<Platz, Daten>> = {}, rohD = ((o as { angelegtD?: unknown }).angelegtD || {}) as Record<string, unknown>;
  for (const { id } of PLAETZE) { const g = o.angelegt[id]; if (typeof g === "string" && GEGENSTAENDE[g] && GEGENSTAENDE[g].platz === id) { angelegt[id] = g; const d = datenFuer(g, datenPruefen(rohD[id])); if (d) angelegtD[id] = d; } }
  const rucksack: Fach[] = []; for (const f of o.rucksack) { const g = typeof f === "string" ? f : f && typeof f === "object" ? String((f as { g?: unknown }).g) : "", G = GEGENSTAENDE[g]; if (!G) continue;
    const d = typeof f === "string" ? undefined : datenFuer(g, datenPruefen((f as { d?: unknown }).d)); /* Phase 5a: Daten je Exemplar bleiben erhalten */
    if (G.stapel) { const n = Math.max(1, Math.min(G.stapel, Math.floor(Number(typeof f === "string" ? 1 : (f as { n?: unknown }).n) || 1))); rucksack.push(d ? { g, n, d } : { g, n }); } else rucksack.push(d ? { g, n: 1, d } : g); }
  /* Zweihandwaffe und Nebenhand zugleich (alter Stand, z. B. Bogen mit Schild): die Nebenhand kommt in den Rucksack – passt sie nicht hinein, bleibt sie, wo sie war */
  if (angelegt.waffe && angelegt.nebenhand && GEGENSTAENDE[angelegt.waffe].zweihand && rucksack.length < RUCKSACK_PLAETZE) { const d = angelegtD.nebenhand; rucksack.push(d ? { g: angelegt.nebenhand, n: 1, d } : angelegt.nebenhand); delete angelegt.nebenhand; delete angelegtD.nebenhand; }
  const inv: Inv = { angelegt, ...(Object.keys(angelegtD).length ? { angelegtD } : {}), rucksack: rucksack.slice(0, RUCKSACK_PLAETZE), v: Number((o as { v?: unknown }).v) || 1 };
  { const bank = bankPruefen((o as { bank?: unknown }).bank); if (bank.length) inv.bank = bank;
    const t = (o as { bankTabs?: unknown }).bankTabs; if (t && typeof t === "object" && bank.length) { const tabs: Record<string, number> = {};
      for (const [g, v] of Object.entries(t as Record<string, unknown>)) { const n = Math.floor(Number(v)); if (bank.some((b) => b[0] === g) && n >= 1 && n <= BANK_REITER) tabs[g] = n; }
      if (Object.keys(tabs).length) { inv.bankTabs = tabs; reiterOrdnen(inv); } } }
  { const b = (o as { berufe?: unknown }).berufe; if (b && typeof b === "object") { const be: Record<string, number> = {}; for (const [k, v] of Object.entries(b as Record<string, unknown>)) { const n = Math.floor(Number(v)); if (/^[a-z]{3,20}$/.test(k) && n > 0) be[k] = Math.min(200_000_000, n); } if (Object.keys(be).length) inv.berufe = be; } }
  { const l = (o as { ladungen?: unknown }).ladungen; if (l && typeof l === "object") { const la: Record<string, number> = {}; for (const [k, v] of Object.entries(l as Record<string, unknown>)) { const n = Math.floor(Number(v)); if ((LADBAR as readonly string[]).includes(k) && n > 0) la[k] = Math.min(LADUNG_MAX_KERN, n); } if (Object.keys(la).length) inv.ladungen = la; } }
  { const w = wirkungenAktiv(wirkungenPruefen((o as { wirkungen?: unknown }).wirkungen)); if (w.length) inv.wirkungen = w; }
  { const w = (o as { warten?: Record<string, unknown> }).warten; if (w && typeof w === "object" && typeof w.r === "string" && /^[a-z0-9_]{1,40}$/.test(w.r) && Number(w.n) >= 1 && Number.isFinite(Number(w.fertig))) inv.warten = { r: w.r, n: Math.min(1000, Math.floor(Number(w.n))), fertig: Number(w.fertig) }; } /* Räucherhütte */
  /* Einmalige Umstellung der Berufe (shared/berufe.ts): Schmieden startet mit dem Stand des Handwerks – mit Merker, damit es nur einmal geschieht */
  { const m = (o as { merker?: unknown }).merker, merker = Array.isArray(m) ? m.filter((x): x is string => typeof x === "string" && /^[a-z0-9_]{1,30}$/.test(x)).slice(0, 50) : [];
    const u = berufeUmstellen(inv.berufe || {}, merker); if (Object.keys(u.berufe).length) inv.berufe = u.berufe; inv.merker = u.merker; }
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
  const D = e.inv.angelegtD || (e.inv.angelegtD = {}), alsFach = (x: string, d?: Daten): Fach => (d ? { g: x, n: 1, d } : x), dNeu = fachD(f!);
  e.inv.rucksack.splice(i, 1); if (alt) e.inv.rucksack.splice(i, 0, alsFach(alt, D[G.platz]));
  if (wegPlatz) { e.inv.rucksack.push(alsFach(e.inv.angelegt[wegPlatz]!, D[wegPlatz])); delete e.inv.angelegt[wegPlatz]; delete D[wegPlatz]; }
  e.inv.angelegt[G.platz] = g; if (dNeu) D[G.platz] = { ...dNeu }; else delete D[G.platz]; if (!Object.keys(D).length) delete e.inv.angelegtD; geaendert(sb, nutzer, e); return null; }
export function ablegen(sb: Sb, nutzer: string, platz: string): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; const g = e.inv.angelegt[platz as Platz]; if (!g) return "Dort ist nichts angelegt.";
  if (e.inv.rucksack.length >= RUCKSACK_PLAETZE) return "Der Rucksack ist voll."; const d = e.inv.angelegtD && e.inv.angelegtD[platz as Platz]; delete e.inv.angelegt[platz as Platz];
  if (e.inv.angelegtD) { delete e.inv.angelegtD[platz as Platz]; if (!Object.keys(e.inv.angelegtD).length) delete e.inv.angelegtD; } e.inv.rucksack.push(d ? { g, n: 1, d } : g); geaendert(sb, nutzer, e); return null; }
/** Ein ganzes Fach aus dem Rucksack nehmen (zum Fallenlassen; ein Stapel als Ganzes). Zurück: Gegenstand und Anzahl oder null */
/** Rucksack umsortieren (ziehen): Fach i mit Fach j tauschen; j hinter dem letzten belegten Fach = ans Ende legen. Zurück: Fehlertext oder null */
export function tauschen(sb: Sb, nutzer: string, i: number, j: number): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; const R = e.inv.rucksack;
  if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= R.length || j >= RUCKSACK_PLAETZE) return "Dieses Fach gibt es nicht."; if (i === j) return null;
  if (j >= R.length) { const [f] = R.splice(i, 1); R.push(f); } else [R[i], R[j]] = [R[j], R[i]]; geaendert(sb, nutzer, e); return null; }
export function herausnehmen(sb: Sb, nutzer: string, i: number): { g: string; n: number; d?: Daten } | { fehler: string } | null { const e = je.get(nutzer); if (!e) return null; const f = e.inv.rucksack[i]; if (f === undefined) return null;
  if (!ablegbar(fachG(f), fachD(f))) return { fehler: "Eine geladene Waffe kannst du nicht ablegen. Entlade sie am Bindestein." }; /* Kanon (Phase 5b) */
  e.inv.rucksack.splice(i, 1); geaendert(sb, nutzer, e); const d = fachD(f); return d ? { g: fachG(f), n: fachN(f), d: { ...d } } : { g: fachG(f), n: fachN(f) }; }
/** In den Rucksack legen, so viele wie Platz ist – Stapelbares auf vorhandene Stapel, sonst je Gegenstand ein Fach. Zurück: wie viele genommen wurden */
/** Einlegen ohne Meldung (Stapel auffüllen, dann freie Fächer). Zurück: wie viele hineinpassten */
/** d: Daten je Exemplar (Phase 5a) – gestapelt wird nur mit gleichen Daten, Geladenes nie */
function einlegen(e: Eintrag, g: string, n: number, d0?: Daten): number { const G = GEGENSTAENDE[g]; if (!G || n < 1) return 0; let rest = n; const d = datenFuer(g, d0), mit = (x: Fach) => (d ? { ...(x as object), d: { ...d } } as Fach : x);
  if (G.stapel && !geladen(d)) { for (const f of e.inv.rucksack) if (typeof f !== "string" && f.g === g && f.n < G.stapel && datenGleich(f.d, d)) { const k = Math.min(rest, G.stapel - f.n); f.n += k; rest -= k; if (!rest) break; }
    while (rest > 0 && e.inv.rucksack.length < RUCKSACK_PLAETZE) { const k = Math.min(rest, G.stapel); e.inv.rucksack.push(mit({ g, n: k })); rest -= k; } }
  else while (rest > 0 && e.inv.rucksack.length < RUCKSACK_PLAETZE) { e.inv.rucksack.push(d ? { g, n: 1, d: { ...d } } : g); rest--; }
  return n - rest; }
export function aufnehmen(sb: Sb, nutzer: string, g: string, n: number, melden = true, d?: Daten): number { const e = je.get(nutzer); if (!e || !GEGENSTAENDE[g] || n < 1) return 0;
  const k = einlegen(e, g, n, d); if (k && melden) geaendert(sb, nutzer, e); if (k) for (const f of AUFGENOMMEN) f(nutzer, g, k); return k; }
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

/** Reisekarte (#102): ist der freie Sprung heute noch frei (Karte im Rucksack oder angelegt)? */
export function reisekarteFrei(nutzer: string, tag = reiseTag()): boolean { const e = je.get(nutzer); return Boolean(e && besitzt(nutzer).includes(REISEKARTE) && !(e.inv.merker || []).includes(reiseMerker(tag))); }
/** Den freien Sprung von heute verbrauchen (ältere Merker der Reisekarte gehen). Zurück: ob er frei war */
export function reisekarteNutzen(sb: Sb, nutzer: string, tag = reiseTag()): boolean { const e = je.get(nutzer); if (!e || !reisekarteFrei(nutzer, tag)) return false;
  e.inv.merker = [...(e.inv.merker || []).filter((m) => !m.startsWith("reisekarte_")), reiseMerker(tag)]; geaendert(sb, nutzer, e); return true; }
/** Räucherhütte (#102): der laufende Auftrag (oder null) */
export function wartenVon(nutzer: string): Warten | null { const e = je.get(nutzer); return e && e.inv.warten ? { ...e.inv.warten } : null; }
/** Auftrag setzen (null: abgeholt) – gespeichert wie der Rucksack */
export function wartenSetzen(sb: Sb, nutzer: string, w: Warten | null): void { const e = je.get(nutzer); if (!e) return; if (w) e.inv.warten = { ...w }; else delete e.inv.warten; geaendert(sb, nutzer, e); }
/** Wie viele davon im Rucksack liegen (alle Fächer zusammen) */
export function anzahlVon(nutzer: string, g: string): number { const e = je.get(nutzer); return e ? e.inv.rucksack.reduce((n, f) => n + (fachG(f) === g ? fachN(f) : 0), 0) : 0; }
/** Passt ein weiteres Stück davon in den Rucksack? */
export function platzFuer(nutzer: string, g: string): boolean { const e = je.get(nutzer), G = GEGENSTAENDE[g]; if (!e || !G) return false;
  return e.inv.rucksack.length < RUCKSACK_PLAETZE || Boolean(G.stapel && e.inv.rucksack.some((f) => typeof f !== "string" && f.g === g && f.n < G.stapel!)); }
/** Kaufen: preis Stück der Währung abgeben, dann den Gegenstand in den Rucksack (alles oder nichts). Zurück: Fehlertext oder null */
export function kaufen(sb: Sb, nutzer: string, g: string, preis: number, waehrung: string): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; if (!GEGENSTAENDE[g] || GEGENSTAENDE[g].untauschbar) return "Das gibt es hier nicht."; /* nicht tauschbar: nur als Questbelohnung */
  const hat = anzahlVon(nutzer, waehrung); if (hat < preis) return `Dafür fehlen dir ${preis - hat} ${GEGENSTAENDE[waehrung] ? GEGENSTAENDE[waehrung].name : waehrung}.`;
  let rest = preis; for (let i = e.inv.rucksack.length - 1; i >= 0 && rest > 0; i--) { const f = e.inv.rucksack[i]; if (fachG(f) !== waehrung) continue; const n = fachN(f), k = Math.min(n, rest); rest -= k;
    if (k >= n) e.inv.rucksack.splice(i, 1); else (f as { g: string; n: number }).n = n - k; }
  if (!platzFuer(nutzer, g)) { aufnehmen(sb, nutzer, waehrung, preis, false); return "Der Rucksack ist voll."; } /* Geld zurück (es lag eben noch drin, also passt es) */
  aufnehmen(sb, nutzer, g, 1, false); geaendert(sb, nutzer, e); return null; }
/** An einen Händler verkaufen (#87/#88): n Stück aus Fach i für preis Splitter je Stück – alles oder nichts. Zurück: Fehlertext oder { n, splitter, g } */
export function verkaufen(sb: Sb, nutzer: string, i: number, n: number, preis: (g: string, d?: Daten) => number | null): string | { g: string; n: number; splitter: number } {
  const e = je.get(nutzer); if (!e) return "Kein Inventar."; if (!Number.isInteger(i) || i < 0 || i >= e.inv.rucksack.length) return "Diesen Gegenstand gibt es im Rucksack nicht.";
  const f = e.inv.rucksack[i], g = fachG(f), d = fachD(f), p = preis(g, d); if (p === null || !(p > 0)) return "Das kauft dieser Händler nicht.";
  const hat = fachN(f), k = Math.max(1, Math.min(hat, Math.floor(Number(n) || 1))), summe = k * p, G = GEGENSTAENDE.splitter;
  /* passen die Splitter hinein? auf einen Stapel, in ein freies Fach oder in das Fach, das der Verkauf frei macht */
  const raum = e.inv.rucksack.reduce((s, x) => s + (typeof x !== "string" && x.g === "splitter" && !x.d ? Math.max(0, (G.stapel || 1) - x.n) : 0), 0) + (RUCKSACK_PLAETZE - e.inv.rucksack.length + (k >= hat ? 1 : 0)) * (G.stapel || 1);
  if (raum < summe) return "Dein Rucksack ist voll – für die Splitter ist kein Platz.";
  if (k >= hat) e.inv.rucksack.splice(i, 1); else (f as { n: number }).n = hat - k;
  einlegen(e, "splitter", summe); geaendert(sb, nutzer, e); return { g, n: k, splitter: summe }; }
/* ───────── Handel zwischen Spielern (#65) ───────── */
/** Ein Posten im Angebot: Gegenstand, Menge, Daten (dieselben wie im Rucksack) */
export interface Posten { g: string; n: number; d?: Daten }
/** Wie viele davon (genau mit diesen Daten) liegen im Rucksack? */
const zaehlen = (inv: Inv, g: string, d?: Daten): number => inv.rucksack.reduce((s, f) => s + (fachG(f) === g && datenGleich(fachD(f), d) ? fachN(f) : 0), 0);
/** Ein Angebot prüfen: alles handelbar und im Rucksack vorhanden (Splitter extra). Zurück: Fehlertext oder null */
export function angebotPruefen(nutzer: string, posten: Posten[], splitter: number): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar.";
  const summe = new Map<string, Posten>(); for (const p of posten) { if (!GEGENSTAENDE[p.g] || !(p.n >= 1)) return "Das gibt es nicht."; if (!handelbar(p.g, p.d)) return `${anzeigeName(p.g, p.d)} ist nicht handelbar.`;
    const k = p.g + "|" + JSON.stringify(p.d || {}), x = summe.get(k); if (x) x.n += p.n; else summe.set(k, { ...p }); }
  for (const p of summe.values()) if (zaehlen(e.inv, p.g, p.d) < p.n) return `So viel ${anzeigeName(p.g, p.d)} hast du nicht.`;
  if (splitter < 0 || !Number.isInteger(splitter)) return "Ungültige Menge."; if (splitter > zaehlen(e.inv, "splitter")) return "So viele Splitter hast du nicht."; return null; }
/** Aus einer Kopie des Inventars nehmen (hinten zuerst). Zurück: ob alles da war */
function wegnehmen(e: Eintrag, g: string, n: number, d?: Daten): boolean { let rest = n;
  for (let i = e.inv.rucksack.length - 1; i >= 0 && rest > 0; i--) { const f = e.inv.rucksack[i]; if (fachG(f) !== g || !datenGleich(fachD(f), d)) continue; const k = Math.min(fachN(f), rest); rest -= k;
    if (k >= fachN(f)) e.inv.rucksack.splice(i, 1); else (f as { n: number }).n -= k; } return rest === 0; }
/** Freie Rucksackfächer nach dem Tausch, wenn dieser Spieler gibt und bekommt (für die Anzeige und die Prüfung) – null: passt nicht */
function nachTausch(e: Eintrag, gibt: Posten[], gibtS: number, bekommt: Posten[], bekommtS: number): Eintrag | null { const k: Eintrag = { ...e, inv: kopie(e.inv), hoerer: new Set() };
  for (const p of gibt) if (!wegnehmen(k, p.g, p.n, p.d)) return null; if (gibtS && !wegnehmen(k, "splitter", gibtS)) return null;
  for (const p of bekommt) if (einlegen(k, p.g, p.n, p.d) < p.n) return null; if (bekommtS && einlegen(k, "splitter", bekommtS) < bekommtS) return null; return k; }
/** Passt der Tausch in beide Rucksäcke? Zurück: wer keinen Platz hat (a/b) oder null */
export function tauschPasst(a: string, b: string, la: Posten[], sa: number, lb: Posten[], sb2: number): "a" | "b" | null { const ea = je.get(a), eb = je.get(b); if (!ea || !eb) return "a";
  return !nachTausch(ea, la, sa, lb, sb2) ? "a" : !nachTausch(eb, lb, sb2, la, sa) ? "b" : null; }
/** Freie Fächer im Rucksack */
export const freiePlaetze = (nutzer: string): number => freieFaecher(nutzer);
/** Der Tausch in einem Schritt: beide Angebote noch einmal prüfen, auf Kopien rechnen, dann beide Inventare zugleich ersetzen – alles oder nichts.
 *  Zurück: Fehlertext oder null */
export function handelTauschen(sb: Sb, a: string, b: string, la: Posten[], sa: number, lb: Posten[], sb2: number): string | null {
  const ea = je.get(a), eb = je.get(b); if (!ea || !eb || a === b) return "Der Handel geht nicht.";
  const fa = angebotPruefen(a, la, sa) || angebotPruefen(b, lb, sb2); if (fa) return fa;
  const na = nachTausch(ea, la, sa, lb, sb2), nb = nachTausch(eb, lb, sb2, la, sa); if (!na || !nb) return "Für den Tausch fehlt Platz im Rucksack.";
  ea.inv = na.inv; eb.inv = nb.inv; geaendert(sb, a, ea); geaendert(sb, b, eb); return null; }
/** Einen Trank aus Fach i nehmen (eins vom Stapel). Zurück: die Trank-Art (VERBRAUCH) oder null */
export function trankNehmen(sb: Sb, nutzer: string, i: number): string | null { const e = je.get(nutzer); if (!e) return null; const f = e.inv.rucksack[i]; if (f === undefined) return null; const G = GEGENSTAENDE[fachG(f)];
  if (!G || !G.trank) return null; if (typeof f !== "string" && f.n > 1) f.n--; else e.inv.rucksack.splice(i, 1); geaendert(sb, nutzer, e); return G.trank; }
/** Einen genommenen Trank zurücklegen (das Trinken ging nicht) */
export function trankZurueck(sb: Sb, nutzer: string, g: string): void { aufnehmen(sb, nutzer, g, 1); }

/* ───────── Berufe (Holzfällerei …): XP im Inventar ───────── */
/** Ladungen (Wegstein …) – Zahl im Inventar, höchstens LADUNG_MAX */
export function ladungen(nutzer: string, g: string): number { const e = je.get(nutzer); return (e && e.inv.ladungen && e.inv.ladungen[g]) || 0; }
/** Höchstzahl Ladungen (der Wegstein mit Splitterkern fasst LADUNG_MAX_KERN) */
export function ladungMax(nutzer: string, g: string): number { const e = je.get(nutzer); return g === "wegstein" && e && (e.inv.merker || []).includes(KERN_MERKER) ? LADUNG_MAX_KERN : LADUNG_MAX; }
/** Ein Merker im Inventar (einmalige Dinge: Splitterkern eingesetzt …) */
export const merkerHat = (nutzer: string, m: string): boolean => { const e = je.get(nutzer); return Boolean(e && (e.inv.merker || []).includes(m)); };
export function merkerDazu(sb: Sb, nutzer: string, m: string): boolean { const e = je.get(nutzer); if (!e || (e.inv.merker || []).includes(m)) return false; e.inv.merker = [...(e.inv.merker || []), m]; geaendert(sb, nutzer, e); return true; }
/** n Ladungen dazu (gekappt bei ladungMax). Zurück: wie viele wirklich dazukamen */
export function ladungenDazu(sb: Sb, nutzer: string, g: string, n: number): number { const e = je.get(nutzer); if (!e || !(n > 0)) return 0;
  const l = e.inv.ladungen || (e.inv.ladungen = {}), vorher = l[g] || 0, neu = Math.min(ladungMax(nutzer, g), vorher + Math.floor(n)); l[g] = neu; geaendert(sb, nutzer, e); return neu - vorher; }
/** eine Ladung verbrauchen. Zurück: ob eine da war */
/** Laufende Wirkungen (abgelaufene fallen weg) */
export function wirkungenVon(nutzer: string): Wirkung[] { const e = je.get(nutzer); return e ? wirkungenAktiv(e.inv.wirkungen) : []; }
/** Eine Wirkung beginnen (ersetzt eine laufende derselben Art, z. B. Essen). Zurück: die laufenden Wirkungen */
export function wirkungSetzen(sb: Sb, nutzer: string, id: string): Wirkung[] { const e = je.get(nutzer); if (!e) return [];
  const w = wirkungDazu(e.inv.wirkungen, id); if (w.length) e.inv.wirkungen = w; else delete e.inv.wirkungen; geaendert(sb, nutzer, e); return wirkungenAktiv(e.inv.wirkungen); }
/* ───────── Geladene Waffen (Phase 5b): Ladungen an der angelegten Waffe (angelegtD.waffe.ladungen) ───────── */
/** Die angelegte Waffe und ihre Ladungen (null: keine Waffe) */
export function waffeLadung(nutzer: string): { g: string; n: number } | null { const e = je.get(nutzer); const g = e && e.inv.angelegt.waffe; if (!e || !g) return null; return { g, n: (e.inv.angelegtD && e.inv.angelegtD.waffe && e.inv.angelegtD.waffe.ladungen) || 0 }; }
/** n Ladungen dazu (höchstens WAFFE_LADUNG_MAX). Zurück: wie viele wirklich dazukamen */
export function waffeLadenDazu(sb: Sb, nutzer: string, n: number): number { const e = je.get(nutzer); if (!e || !e.inv.angelegt.waffe || !(n > 0)) return 0;
  const D = e.inv.angelegtD || (e.inv.angelegtD = {}), d = D.waffe || (D.waffe = {}), vorher = d.ladungen || 0, neu = Math.min(WAFFE_LADUNG_MAX, vorher + Math.floor(n)); d.ladungen = neu; geaendert(sb, nutzer, e); return neu - vorher; }
/** Entladen (nur am Bindestein): die Ladungen verfallen. Zurück: wie viele es waren */
export function waffeEntladen(sb: Sb, nutzer: string): number { const e = je.get(nutzer), d = e && e.inv.angelegtD && e.inv.angelegtD.waffe; if (!e || !d || !d.ladungen) return 0;
  const n = d.ladungen; delete d.ladungen; if (!Object.keys(d).length) delete e.inv.angelegtD!.waffe; if (e.inv.angelegtD && !Object.keys(e.inv.angelegtD).length) delete e.inv.angelegtD; geaendert(sb, nutzer, e); return n; }
/** Ein Angriff mit der geladenen Waffe: eine Ladung weg (auch bei einem Fehlschlag). Zurück: übrige Ladungen (-1: war nicht geladen).
 *  Gemeldet (Kampfwerte, Browser) wird nur, wenn die letzte Ladung verbraucht ist – gespeichert wird immer */
export function waffeLadungVerbrauchen(sb: Sb, nutzer: string): number { const e = je.get(nutzer), d = e && e.inv.angelegtD && e.inv.angelegtD.waffe; if (!e || !d || !d.ladungen) return -1;
  d.ladungen--; if (d.ladungen > 0) { merken(sb, nutzer, e); return d.ladungen; } delete d.ladungen; if (!Object.keys(d).length) delete e.inv.angelegtD!.waffe; if (e.inv.angelegtD && !Object.keys(e.inv.angelegtD).length) delete e.inv.angelegtD; geaendert(sb, nutzer, e); return 0; }
export function ladungAbziehen(sb: Sb, nutzer: string, g: string): boolean { const e = je.get(nutzer); if (!e || !e.inv.ladungen || !(e.inv.ladungen[g] > 0)) return false;
  e.inv.ladungen[g]--; if (!e.inv.ladungen[g]) delete e.inv.ladungen[g]; geaendert(sb, nutzer, e); return true; }
export function berufXp(nutzer: string, beruf: string): number { const e = je.get(nutzer); return (e && e.inv.berufe && e.inv.berufe[beruf]) || 0; }
export function berufXpDazu(sb: Sb, nutzer: string, beruf: string, n: number): number { const e = je.get(nutzer); if (!e || !(n > 0)) return berufXp(nutzer, beruf);
  const b = e.inv.berufe || (e.inv.berufe = {}); b[beruf] = Math.min(200_000_000, Math.round((b[beruf] || 0) + n)); geaendert(sb, nutzer, e); return b[beruf]; }
/** Gegenstände, die der Held trägt (Rucksack und angelegt) – für Werkzeuge */
/** Hat man es irgendwo – Rucksack, angelegt oder in der Bank (Questgegenstände zurückgeben, wenn verloren) */
export function besitztIrgendwo(nutzer: string, g: string): boolean { const e = je.get(nutzer); return Boolean(e && (besitzt(nutzer).includes(g) || (e.inv.bank || []).some(([b]) => b === g))); }
export function besitzt(nutzer: string): string[] { const e = je.get(nutzer); if (!e) return []; return [...e.inv.rucksack.map(fachG), ...Object.values(e.inv.angelegt).filter((g): g is string => Boolean(g))]; }
/** Freie Rucksackfächer */
export function freieFaecher(nutzer: string): number { const e = je.get(nutzer); return e ? RUCKSACK_PLAETZE - e.inv.rucksack.length : 0; }

/* ───────── Bank (shared/bank.ts) – Nähe zum Schalter prüft welt.ts ───────── */
/** Reiter aufräumen: nur Gegenstände, die in der Bank liegen; leere Reiter fallen weg, die folgenden rücken auf (1, 2, 3 … ohne Lücke) */
function reiterOrdnen(inv: Inv): void { const t = inv.bankTabs; if (!t) return; const B = inv.bank || [];
  for (const g of Object.keys(t)) if (!B.some((b) => b[0] === g)) delete t[g];
  const benutzt = [...new Set(Object.values(t))].sort((a, b) => a - b), neu = new Map(benutzt.map((n, i) => [n, i + 1]));
  for (const g of Object.keys(t)) t[g] = neu.get(t[g])!; if (!Object.keys(t).length) delete inv.bankTabs; }
/** Einen Gegenstand der Bank in einen Reiter legen (0 = ohne Reiter). Ein neuer Reiter ist die nächste freie Nummer */
export function bankReiter(sb: Sb, nutzer: string, g: string, tab: number): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar.";
  if (!bankVon(e).some((b) => b[0] === g)) return "Das liegt nicht in deiner Bank."; if (!Number.isInteger(tab) || tab < 0 || tab > BANK_REITER) return "Diesen Reiter gibt es nicht.";
  const t = (e.inv.bankTabs = e.inv.bankTabs || {}), anzahl = new Set(Object.values(t)).size; if (tab > anzahl + 1 || (tab === anzahl + 1 && anzahl >= BANK_REITER)) return "Mehr Reiter gehen nicht.";
  if (tab === 0) delete t[g]; else t[g] = tab; reiterOrdnen(e.inv); geaendert(sb, nutzer, e); return null; }
const bankVon = (e: Eintrag): BankFach[] => (e.inv.bank = e.inv.bank || []);
/** Einzahlen: n Stück von g aus dem Rucksack (alle Fächer, hinten zuerst) in die Bank; n ≤ 0 = alle. Zurück: Fehlertext oder null */
export function bankEinzahlen(sb: Sb, nutzer: string, g: string, n: number, tab = 0): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar.";
  const neu = !bankVon(e).some((b) => b[0] === g), r = einzahlen(e, g, n); if (r !== null) return r;
  if (neu && Number.isInteger(tab) && tab >= 1 && tab <= BANK_REITER && new Set(Object.values(e.inv.bankTabs || {})).has(tab)) { (e.inv.bankTabs = e.inv.bankTabs || {})[g] = tab; } /* neu Eingezahltes landet im offenen Reiter (wie in OSRS) */
  geaendert(sb, nutzer, e); return null; }
function einzahlen(e: Eintrag, g: string, n: number): string | null { const hat = e.inv.rucksack.reduce((s, f) => s + (fachG(f) === g ? fachN(f) : 0), 0); if (!hat) return "Das hast du nicht im Rucksack.";
  const B = bankVon(e), fach = B.find((b) => b[0] === g); if (!fach && B.length >= BANK_PLAETZE) return "Deine Bank ist voll.";
  const menge = Math.min(n > 0 ? n : hat, hat, BANK_MAX - (fach ? fach[1] : 0)); if (menge <= 0) return "Davon passt nichts mehr in die Bank.";
  /* je Fach mit seinen Daten (Phase 5a): gleiche Daten landen im selben Bankfach; neue Fächer nur, solange Platz ist */
  let rest = menge; for (let i = e.inv.rucksack.length - 1; i >= 0 && rest > 0; i--) { const f = e.inv.rucksack[i]; if (fachG(f) !== g) continue; const d = fachD(f), ziel = B.find((b) => b[0] === g && datenGleich(b[2], d));
    if (!ziel && B.length >= BANK_PLAETZE) continue; const k = Math.min(fachN(f), rest, BANK_MAX - (ziel ? ziel[1] : 0)); if (k <= 0) continue; rest -= k;
    if (k >= fachN(f)) e.inv.rucksack.splice(i, 1); else (f as { g: string; n: number }).n -= k; if (ziel) ziel[1] += k; else B.push(d ? [g, k, { ...d }] : [g, k]); }
  return rest >= menge ? "Deine Bank ist voll." : null; }
/** Abheben: n Stück von g aus der Bank in den Rucksack (n ≤ 0 = alle, so viele passen). Zurück: Fehler-/Hinweistext oder null */
/** fach: Index des Bankfachs (gleicher Gegenstand mit verschiedenen Daten, z. B. zwei geladene Waffen) – sonst das erste mit g */
export function bankAbheben(sb: Sb, nutzer: string, g: string, n: number, fach?: number): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar.";
  const B = bankVon(e), i = fach !== undefined && Number.isInteger(fach) && B[fach] && B[fach][0] === g ? fach : B.findIndex((b) => b[0] === g); if (i < 0) return "Das liegt nicht in deiner Bank.";
  const will = Math.min(n > 0 ? n : B[i][1], B[i][1]), k = einlegen(e, g, will, B[i][2]); if (!k) return "Dein Rucksack ist voll.";
  B[i][1] -= k; if (B[i][1] <= 0) { B.splice(i, 1); reiterOrdnen(e.inv); } geaendert(sb, nutzer, e); return k < will ? "Nicht alles passte in den Rucksack." : null; }
/** Alles einzahlen: den ganzen Rucksack oder die ganze angelegte Ausrüstung. Zurück: Fehler-/Hinweistext oder null */
export function bankAlles(sb: Sb, nutzer: string, was: "rucksack" | "ausruestung"): string | null { const e = je.get(nutzer); if (!e) return "Kein Inventar."; let fehler: string | null = null, etwas = false;
  if (was === "rucksack") { for (const g of [...new Set(e.inv.rucksack.map(fachG))]) { const r = einzahlen(e, g, 0); if (r) fehler = r; else etwas = true; } if (!etwas && !fehler) return "Dein Rucksack ist leer."; }
  else { for (const { id } of PLAETZE) { const g = e.inv.angelegt[id]; if (!g) continue; const d = e.inv.angelegtD && e.inv.angelegtD[id], B = bankVon(e), fach = B.find((b) => b[0] === g && datenGleich(b[2], d));
      if (!fach && B.length >= BANK_PLAETZE) { fehler = "Deine Bank ist voll."; continue; } if (fach) fach[1] = Math.min(BANK_MAX, fach[1] + 1); else B.push(d ? [g, 1, { ...d }] : [g, 1]); delete e.inv.angelegt[id];
      if (e.inv.angelegtD) { delete e.inv.angelegtD[id]; if (!Object.keys(e.inv.angelegtD).length) delete e.inv.angelegtD; } etwas = true; }
    if (!etwas && !fehler) return "Du trägst nichts, was man einzahlen könnte."; }
  if (etwas) geaendert(sb, nutzer, e); return fehler; }

/* ───────── Boden ───────── */
export interface BodenDing { id: number; g: string; n: number; ort: string; x: number; y: number; besitzer: string; offenAb: number; bis: number; /** Daten je Exemplar (Phase 5a) */ d?: Daten }
const boden = new Map<number, BodenDing>(); let nr = 1;
const FALLEN_ZEIT = { privat: 60_000, offen: 10 * 60_000 };
export const LOOT = { privat: 30_000, offen: 5 * 60_000 }, FALLEN = FALLEN_ZEIT, /** Questlohn, der nicht mehr in den Rucksack passte (#77, Entscheidung des Nutzers): dieselben Zeiten wie Fallengelassenes; Gebundenes sieht dabei nie ein anderer (bodenDazu: nur für den Besitzer, verschwindet nach privat + offen) */ QUESTLOHN = { privat: FALLEN_ZEIT.privat, offen: FALLEN_ZEIT.offen }, AUFHEBEN_WEIT = 0; /* Feldabstand: man muss auf dem Feld des Gegenstands stehen */
/** Etwas auf den Boden legen. besitzer "": sofort für alle sichtbar */
export function bodenDazu(ort: string, x: number, y: number, g: string, n: number, besitzer: string, zeiten: { privat: number; offen: number }, jetzt = Date.now(), d?: Daten): BodenDing | null {
  if (!GEGENSTAENDE[g] || n < 1 || !Number.isFinite(x) || !Number.isFinite(y)) return null; const nurSelbst = Boolean(besitzer && (GEGENSTAENDE[g].untauschbar || (d && d.gebunden))) /* nicht tauschbar (Quest): sieht nie jemand anderes, liegt aber genauso lange */, offenAb = nurSelbst ? Number.MAX_SAFE_INTEGER : besitzer ? jetzt + zeiten.privat : jetzt;
  const dd = datenFuer(g, d), b: BodenDing = { id: nr++, g, n: Math.floor(n), ort, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, besitzer, offenAb, bis: nurSelbst ? jetzt + zeiten.privat + zeiten.offen : offenAb + zeiten.offen, ...(dd ? { d: dd } : {}) }; boden.set(b.id, b); return b; }
const sichtbar = (d: BodenDing, nutzer: string, jetzt: number) => jetzt < d.bis && (jetzt >= d.offenAb || (nutzer !== "" && d.besitzer === nutzer));
/** So weit (Weltfelder) sieht man Gegenstände am Boden – unabhängig von Regionsgrenzen (seit 26.11.2026) */
export const BODEN_SICHT = 40;
/** Was dieser Spieler am Boden sieht: in der offenen Welt alles im Umkreis seiner Weltstelle (wo), sonst (ohne Stelle) in seiner Region */
export function bodenSicht(ort: string, nutzer: string, jetzt = Date.now(), wo?: { x: number; y: number }): { i: number; g: string; n: number; x: number; y: number }[] {
  const aus: { i: number; g: string; n: number; x: number; y: number }[] = [];
  for (const d of boden.values()) if ((wo ? Math.max(Math.abs(d.x - wo.x), Math.abs(d.y - wo.y)) <= BODEN_SICHT : d.ort === ort) && sichtbar(d, nutzer, jetzt)) aus.push({ i: d.id, g: d.g, n: d.n, x: d.x, y: d.y }); return aus; }
/** Aufheben: nur was man sieht und auf dessen Feld man steht (Feldabstand ≤ AUFHEBEN_WEIT). Zurück: Fehlertext oder null */
export function bodenAufheben(sb: Sb, nutzer: string, ort: string, id: number, x: number | undefined, y: number | undefined, jetzt = Date.now()): string | null {
  const d = boden.get(id); if (!d || !sichtbar(d, nutzer, jetzt) || (x === undefined && d.ort !== ort)) return "Das liegt hier nicht (mehr)."; /* über Regionsgrenzen hinweg: es zählt nur der Abstand (unten) */
  if (x === undefined || y === undefined || Math.max(Math.abs(Math.floor(d.x) - Math.floor(x)), Math.abs(Math.floor(d.y) - Math.floor(y))) > AUFHEBEN_WEIT) return "Stell dich auf das Feld, um es aufzuheben.";
  if (!je.get(nutzer)) return "Kein Inventar."; const k = aufnehmen(sb, nutzer, d.g, d.n, true, d.d); if (!k) return "Der Rucksack ist voll.";
  if (k < d.n) { d.n -= k; return "Der Rucksack ist voll – ein Teil bleibt liegen."; }
  if (k >= d.n) boden.delete(id); else d.n -= k; return null; }
/** Abgelaufenes wegräumen (einmal je Sekunde) */
export function bodenAufraeumen(jetzt = Date.now()): void { for (const [id, d] of boden) if (jetzt >= d.bis) boden.delete(id); }
/** Für Prüfungen */
export const bodenAlle = (): BodenDing[] => [...boden.values()];
