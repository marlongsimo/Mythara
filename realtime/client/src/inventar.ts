/*
 * Ausrüstung und Rucksack (= das Inventar) des eigenen Helden.
 * Mit Konto gehört das Inventar dem Spielserver (Migration 043): er schickt es über die Welt-Verbindung (inventarVomServer), und Anlegen, Ablegen und
 * Fallenlassen sind nur Bitten an ihn – er prüft und schickt das neue Inventar. „ez_inventar“ ist dann nur die Kopie fürs Anzeigen.
 * Als Gast bleibt das Inventar auf dem Gerät (ohne Beute).
 * Beim ersten Mal entsteht er aus der Startwaffe (shared/gegenstaende.ts startAusruestung).
 */
import { GEGENSTAENDE, Platz, RUCKSACK_PLAETZE, startAusruestung, Fach, fachG, fachN, fachD, Daten, datenPruefen } from "../../shared/gegenstaende";
import { aktiverHeld } from "./held";
import { Wirkung, wirkungenPruefen, wirkungenAktiv, ausdauerMal } from "../../shared/wirkungen";
import { AUSDAUER } from "./sprintzustand";
/** Laufende Wirkungen (vom Server; abgelaufene fallen weg) */
export const wirkungenJetzt = (): Wirkung[] => wirkungenAktiv(vomServer ? vomServer.wirkungen : []);
/** Wirkungen haben sich geändert: Ausdauer-Erholung anpassen, HUD neu zeichnen (ez-wirkungen) */
function wirkungenMelden(): void { const w = wirkungenJetzt(); AUSDAUER.erholMal = ausdauerMal(w); try { window.dispatchEvent(new CustomEvent("ez-wirkungen", { detail: w })); } catch { /* Tests ohne Fenster */ } }
/** Nach dem Essen (getrunken mit wirkungen): sofort übernehmen, ohne auf das nächste Inventar zu warten */
export function wirkungenSetzen(roh: unknown): void { if (!vomServer) return; vomServer.wirkungen = wirkungenPruefen(roh); wirkungenMelden(); }

/** rucksack: je Fach die Gegenstands-id; anzahl: je Fach die Menge (Stapel, z. B. Splitter) */
export interface Inventar { /** laufende Wirkungen (Essen, shared/wirkungen.ts) */ wirkungen?: Wirkung[]; angelegt: Partial<Record<Platz, string>>; rucksack: string[]; anzahl?: number[]; /** Daten je Fach (Phase 5a: Ladungen „(s)“, gebunden) und je angelegtem Platz – für die Anzeige (shared/gegenstaende.ts anzeigeName, handelbar) */ daten?: (Daten | undefined)[]; angelegtD?: Partial<Record<Platz, Daten>>; waffe?: string; /** Bank (nur mit Server): [Gegenstand, Menge] */ bank?: [string, number][]; /** Reiter der Bank: Gegenstand → 1 … 9 */ bankTabs?: Record<string, number>; /** XP der Berufe (Holzfällerei …) */ berufe?: Record<string, number>; /** Ladungen (Wegstein …, nur der Server schreibt) */ ladungen?: Record<string, number> }
const SCHLUESSEL = "ez_inventar";
function lies(): Inventar | null { try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && v.angelegt && Array.isArray(v.rucksack) ? v : null; } catch { return null; } }
function schreib(i: Inventar) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(i)); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-inventar", { detail: i })); }

/* ───────── Inventar vom Server ───────── */
let vomServer: Inventar | null = null, sender: ((m: object) => void) | null = null;
/** Hat der Server das Inventar schon geschickt? (Ladebildschirm: erst dann weiß man, was der Held angelegt hat) */
export const inventarVomServerDa = (): boolean => vomServer !== null;
/** Die Welt-Verbindung meldet sich als Weg zum Server an */
export function inventarSender(f: ((m: object) => void) | null): void { sender = f; }
/** Der Server schickt das Inventar (nach dem Anmelden und nach jeder Änderung) */
export function inventarVomServer(roh: { angelegt?: Record<string, string>; angelegtD?: Record<string, unknown>; rucksack?: Fach[]; bank?: [string, number][]; bankTabs?: Record<string, number>; berufe?: Record<string, number>; ladungen?: Record<string, number>; wirkungen?: unknown }): void { const h = aktiverHeld(), faecher = (roh.rucksack || []).filter((f) => GEGENSTAENDE[fachG(f)]);
  vomServer = { angelegt: Object.fromEntries(Object.entries(roh.angelegt || {}).filter(([, g]) => g && GEGENSTAENDE[g])) as Inventar["angelegt"], rucksack: faecher.map(fachG), anzahl: faecher.map(fachN), daten: faecher.map(fachD), angelegtD: Object.fromEntries(Object.entries(roh.angelegtD || {}).map(([k, d]) => [k, datenPruefen(d)]).filter(([, d]) => d)) as Partial<Record<Platz, Daten>>, waffe: h ? h.waffe : undefined, bank: (Array.isArray(roh.bank) ? roh.bank : []).filter((b) => Array.isArray(b) && GEGENSTAENDE[b[0]] && b[1] > 0), berufe: roh.berufe && typeof roh.berufe === "object" ? { ...roh.berufe } : {}, bankTabs: roh.bankTabs && typeof roh.bankTabs === "object" ? { ...roh.bankTabs } : {}, ladungen: roh.ladungen && typeof roh.ladungen === "object" ? { ...roh.ladungen } : {}, wirkungen: wirkungenPruefen(roh.wirkungen) }; schreib(vomServer); wirkungenMelden(); }
/** Gehört das Inventar dem Server (mit Konto verbunden)? */
export const inventarAmServer = (): boolean => Boolean(vomServer && sender);
const bitten = (m: object): boolean => { if (!vomServer || !sender) return false; sender(m); return true; };
/** Trinken: einen Trank aus Fach i (nur mit Server-Inventar; der Server heilt und schickt „getrunken“) */
export function trinken(i: number): boolean { return bitten({ t: "inv", tat: "trinken", i }); }
/** Kaufen am Marktplatz (der Server prüft Preis, Nähe und Platz) */
export function kaufenBitten(laden: string, g: string): boolean { return bitten({ t: "kaufen", laden, g }); }
/** Fallen lassen: aus dem Rucksack auf den Boden (nur mit Server-Inventar) */
/** Rucksack: Fach i auf Fach j ziehen (tauschen; auf ein leeres Fach: ans Ende) */
export function tauschenBitten(i: number, j: number): boolean { return bitten({ t: "inv", tat: "tauschen", i, j }); }
export function fallenLassen(i: number): boolean { return bitten({ t: "inv", tat: "fallen", i }); }
/** Bank (shared/bank.ts): einzahlen/abheben (menge 0 = alle) oder alles einzahlen – der Server prüft Nähe, Platz und Mengen */
export function bankBitten(m: { tat: "ein" | "ab"; g: string; menge: number; tab?: number } | { tat: "alles"; was: "rucksack" | "ausruestung" } | { tat: "tab"; g: string; tab: number }): boolean { return bitten({ t: "bank", ...m }); }

/** Das Inventar (neu aus der Startwaffe, wenn noch keins da ist oder die Startwaffe im Editor geändert wurde) */
export function inventar(): Inventar {
  if (vomServer) return { angelegt: { ...vomServer.angelegt }, rucksack: [...vomServer.rucksack], anzahl: [...(vomServer.anzahl || [])], waffe: vomServer.waffe, bank: (vomServer.bank || []).map(([g, n]) => [g, n] as [string, number]), berufe: { ...(vomServer.berufe || {}) }, bankTabs: { ...(vomServer.bankTabs || {}) } , ladungen: { ...(vomServer.ladungen || {}) }, wirkungen: (vomServer.wirkungen || []).map((w) => ({ ...w })) };
  const h = aktiverHeld(), da = lies();
  if (da && (!h || da.waffe === h.waffe)) { const angelegt = Object.fromEntries(Object.entries(da.angelegt).filter(([, g]) => g && GEGENSTAENDE[g])) as Inventar["angelegt"]; /* nicht mehr vorhandene Gegenstände (etwa das frühere Leinenhemd) fallen weg */
    return { angelegt, rucksack: [...da.rucksack].filter((g) => GEGENSTAENDE[g]), waffe: da.waffe }; }
  const neu: Inventar = { angelegt: startAusruestung(h ? h.waffe : "schwert"), rucksack: [], waffe: h ? h.waffe : "schwert" }; if (h) schreib(neu); return neu;
}
/** Ablegen: vom Platz in den Rucksack. false, wenn der Rucksack voll ist */
export function ablegen(platz: Platz): boolean { if (vomServer) { if (vomServer.rucksack.length >= RUCKSACK_PLAETZE) return false; return bitten({ t: "inv", tat: "ablegen", platz }); }
  const i = inventar(), g = i.angelegt[platz]; if (!g) return false; if (i.rucksack.length >= RUCKSACK_PLAETZE) return false;
  delete i.angelegt[platz]; i.rucksack.push(g); schreib(i); return true; }
/** Anlegen: aus dem Rucksack auf seinen Platz; was dort lag, kommt in den Rucksack */
export function anlegen(id: string): boolean { const i = inventar(), G = GEGENSTAENDE[id], k = i.rucksack.indexOf(id); if (!G || k < 0 || !G.platz) return false;
  if (vomServer) return bitten({ t: "inv", tat: "anlegen", i: k });
  const P = G.platz; i.rucksack.splice(k, 1); const alt = i.angelegt[P]; if (alt) i.rucksack.splice(k, 0, alt);
  const W = i.angelegt.waffe, weg = G.zweihand && i.angelegt.nebenhand ? "nebenhand" : P === "nebenhand" && W && GEGENSTAENDE[W] && GEGENSTAENDE[W].zweihand ? "waffe" : null; /* Zweihand: Schild bzw. Waffe in den Rucksack */
  if (weg) { i.rucksack.push(i.angelegt[weg]!); delete i.angelegt[weg]; } i.angelegt[P] = id; schreib(i); return true; }
/** Die Figurenebenen der angelegten Waffen (für die eigene Figur) */
export function angelegteEbenen(): string[] { const i = inventar(); return Object.values(i.angelegt).flatMap((g) => (g && GEGENSTAENDE[g] && GEGENSTAENDE[g].ebenen) || []); }
