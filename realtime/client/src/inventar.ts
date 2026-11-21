/*
 * Ausrüstung und Rucksack des eigenen Helden.
 * Gespeichert unter „ez_inventar“ im Spielstand – mit Konto gleicht konto.ts ihn mit dem Konto ab (wie alle „ez_“-Schlüssel), als Gast bleibt er auf dem Gerät.
 * Beim ersten Mal entsteht er aus der Startwaffe (shared/gegenstaende.ts startAusruestung).
 */
import { GEGENSTAENDE, Platz, RUCKSACK_PLAETZE, startAusruestung } from "../../shared/gegenstaende";
import { aktiverHeld } from "./held";

export interface Inventar { angelegt: Partial<Record<Platz, string>>; rucksack: string[]; waffe?: string }
const SCHLUESSEL = "ez_inventar";
function lies(): Inventar | null { try { const v = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null"); return v && v.angelegt && Array.isArray(v.rucksack) ? v : null; } catch { return null; } }
function schreib(i: Inventar) { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(i)); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-inventar", { detail: i })); }

/** Das Inventar (neu aus der Startwaffe, wenn noch keins da ist oder die Startwaffe im Editor geändert wurde) */
export function inventar(): Inventar {
  const h = aktiverHeld(), da = lies();
  if (da && (!h || da.waffe === h.waffe)) { const angelegt = Object.fromEntries(Object.entries(da.angelegt).filter(([, g]) => g && GEGENSTAENDE[g])) as Inventar["angelegt"]; /* nicht mehr vorhandene Gegenstände (etwa das frühere Leinenhemd) fallen weg */
    return { angelegt, rucksack: [...da.rucksack].filter((g) => GEGENSTAENDE[g]), waffe: da.waffe }; }
  const neu: Inventar = { angelegt: startAusruestung(h ? h.waffe : "schwert"), rucksack: [], waffe: h ? h.waffe : "schwert" }; if (h) schreib(neu); return neu;
}
/** Ablegen: vom Platz in den Rucksack. false, wenn der Rucksack voll ist */
export function ablegen(platz: Platz): boolean { const i = inventar(), g = i.angelegt[platz]; if (!g) return false; if (i.rucksack.length >= RUCKSACK_PLAETZE) return false;
  delete i.angelegt[platz]; i.rucksack.push(g); schreib(i); return true; }
/** Anlegen: aus dem Rucksack auf seinen Platz; was dort lag, kommt in den Rucksack */
export function anlegen(id: string): boolean { const i = inventar(), G = GEGENSTAENDE[id], k = i.rucksack.indexOf(id); if (!G || k < 0) return false;
  i.rucksack.splice(k, 1); const alt = i.angelegt[G.platz]; if (alt) i.rucksack.splice(k, 0, alt); i.angelegt[G.platz] = id; schreib(i); return true; }
/** Die Figurenebenen der angelegten Waffen (für die eigene Figur) */
export function angelegteEbenen(): string[] { const i = inventar(); return Object.values(i.angelegt).flatMap((g) => (g && GEGENSTAENDE[g] && GEGENSTAENDE[g].ebenen) || []); }
