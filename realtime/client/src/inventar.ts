/*
 * Ausrüstung und Rucksack (= das Inventar) des eigenen Helden.
 * Mit Konto gehört das Inventar dem Spielserver (Migration 043): er schickt es über die Welt-Verbindung (inventarVomServer), und Anlegen, Ablegen und
 * Fallenlassen sind nur Bitten an ihn – er prüft und schickt das neue Inventar. „ez_inventar“ ist dann nur die Kopie fürs Anzeigen.
 * Als Gast bleibt das Inventar auf dem Gerät (ohne Beute).
 * Beim ersten Mal entsteht er aus der Startwaffe (shared/gegenstaende.ts startAusruestung).
 */
import { GEGENSTAENDE, Platz, RUCKSACK_PLAETZE, startAusruestung, Fach, fachG, fachN } from "../../shared/gegenstaende";
import { aktiverHeld } from "./held";

/** rucksack: je Fach die Gegenstands-id; anzahl: je Fach die Menge (Stapel, z. B. Splitter) */
export interface Inventar { angelegt: Partial<Record<Platz, string>>; rucksack: string[]; anzahl?: number[]; waffe?: string }
const SCHLUESSEL = "ez_inventar";
function lies(): Inventar | null { try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && v.angelegt && Array.isArray(v.rucksack) ? v : null; } catch { return null; } }
function schreib(i: Inventar) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(i)); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-inventar", { detail: i })); }

/* ───────── Inventar vom Server ───────── */
let vomServer: Inventar | null = null, sender: ((m: object) => void) | null = null;
/** Die Welt-Verbindung meldet sich als Weg zum Server an */
export function inventarSender(f: ((m: object) => void) | null): void { sender = f; }
/** Der Server schickt das Inventar (nach dem Anmelden und nach jeder Änderung) */
export function inventarVomServer(roh: { angelegt?: Record<string, string>; rucksack?: Fach[] }): void { const h = aktiverHeld(), faecher = (roh.rucksack || []).filter((f) => GEGENSTAENDE[fachG(f)]);
  vomServer = { angelegt: Object.fromEntries(Object.entries(roh.angelegt || {}).filter(([, g]) => g && GEGENSTAENDE[g])) as Inventar["angelegt"], rucksack: faecher.map(fachG), anzahl: faecher.map(fachN), waffe: h ? h.waffe : undefined }; schreib(vomServer); }
/** Gehört das Inventar dem Server (mit Konto verbunden)? */
export const inventarAmServer = (): boolean => Boolean(vomServer && sender);
const bitten = (m: object): boolean => { if (!vomServer || !sender) return false; sender(m); return true; };
/** Fallen lassen: aus dem Rucksack auf den Boden (nur mit Server-Inventar) */
export function fallenLassen(i: number): boolean { return bitten({ t: "inv", tat: "fallen", i }); }

/** Das Inventar (neu aus der Startwaffe, wenn noch keins da ist oder die Startwaffe im Editor geändert wurde) */
export function inventar(): Inventar {
  if (vomServer) return { angelegt: { ...vomServer.angelegt }, rucksack: [...vomServer.rucksack], anzahl: [...(vomServer.anzahl || [])], waffe: vomServer.waffe };
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
  const P = G.platz; i.rucksack.splice(k, 1); const alt = i.angelegt[P]; if (alt) i.rucksack.splice(k, 0, alt); i.angelegt[P] = id; schreib(i); return true; }
/** Die Figurenebenen der angelegten Waffen (für die eigene Figur) */
export function angelegteEbenen(): string[] { const i = inventar(); return Object.values(i.angelegt).flatMap((g) => (g && GEGENSTAENDE[g] && GEGENSTAENDE[g].ebenen) || []); }
