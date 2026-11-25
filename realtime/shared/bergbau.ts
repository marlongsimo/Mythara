/*
 * Mythara – Bergbau (seit 24.11.2026, Konzept doku/berufe/Mythara-Holz-und-Bergbau.pdf; Regeln wie die Holzfällerei, gemeinsamer Teil: shared/sammeln.ts).
 * Erzadern liegen in Senken (shared/bergbau_standorte.json; Mulde, Steinboden und Feldweg: werkzeug/welt/lichtungen.mjs, Absenkung: drei.mjs).
 * Ablauf: Ader antippen → alle 3 Ticks (1,5 s) ein Schlag mit der Spitzhacke. Erfolg → ein Erz (stapelt nicht) und XP; mit 25 % dazu 5–15 Splitter.
 * Nach jedem Erz ist die Ader mit ihrer Erschöpfungschance leer (sinkt mit der Erzstufe); dann ist sie für alle grau, bis sie nachwächst.
 * Riss: nach einem Schlag manchmal (12 %) leuchtet ein Riss im Gestein; wer binnen 1,5 s antippt, bekommt zwei Erze und 50 % mehr XP.
 * Der Server rechnet alles (server/src/bergbau.ts). Die XP stehen im Inventar des Helden (Feld „berufe“, Schlüssel „bergbau“).
 */
import STANDORTE_JSON from "./bergbau_standorte.json";
import { SammelArt, SammelWerkzeug } from "./sammeln";

export type ErzArt = "kupfer" | "eisen" | "schwarzeisen" | "sterneisen" | "splittereisen" | "ureisen" | "waldstein";
export interface AderDef extends SammelArt { art: ErzArt; /** 3D-Modell der vollen und der leeren Ader */ modell: string; leer: string; /** Größe im Spiel (Felder, längste Seite) */ groesse: number }
const M = "img/objekte3d/skilling/bergbau/";
const A = (art: ErzArt, datei: string, name: string, level: number, xp: number, lo: number, hi: number, fall: number, nachwachsen: number, groesse = 1.5): AderDef =>
  ({ art, name, level, xp, lo, hi, fall, nachwachsen, ertrag: "erz_" + art, modell: M + datei + ".glb", leer: M + datei + "-leer.glb", groesse });
export const ADERN: Record<ErzArt, AderDef> = {
  kupfer: A("kupfer", "kupferstein", "Kupferader", 1, 20, 70, 210, 0.45, 10),
  eisen: A("eisen", "eisen", "Eisenader", 10, 35, 36, 160, 0.30, 20),
  schwarzeisen: A("schwarzeisen", "schwarzeisen", "Schwarzeisenader", 20, 60, 18, 115, 0.22, 45),
  sterneisen: A("sterneisen", "sterneisen", "Sterneisenader", 35, 100, 9, 85, 0.16, 90),
  splittereisen: A("splittereisen", "splittereisen", "Splitterfelsen", 45, 160, 5, 62, 0.12, 180, 1.8),
  ureisen: A("ureisen", "ureisen", "Urgestein", 65, 250, 2, 44, 0.09, 420, 1.8),
  /* Quest 03: der Waldstein im Nordwald – ein Erz je Held, nur mit dem Auftrag des Försters; er erschöpft nie */
  waldstein: { ...A("waldstein", "sterneisen", "Waldstein", 1, 25, 140, 220, 0, 1, 1.7), quest: "nordwald_waldsaebel" },
};
/** Eine Erzader in der Welt (Weltfelder) */
export interface Erzader { id: string; art: ErzArt; x: number; y: number; region: string }
export interface Senke { name: string; x: number; y: number; r: number; adern: Erzader[] }
export const SENKEN: Senke[] = (STANDORTE_JSON as { senken: Senke[] }).senken;
export const ERZADERN: Erzader[] = SENKEN.flatMap((s) => s.adern);
export const erzader = (id: string): Erzader | undefined => ERZADERN.find((a) => a.id === id);

/** Spitzhacken: Stufe 0 (Training) bis 5 (Mythisch) */
export const SPITZHACKEN: SammelWerkzeug[] = [
  { g: "spitzhacke_training", stufe: 0, level: 1 }, { g: "spitzhacke_einfach", stufe: 1, level: 10 }, { g: "spitzhacke_selten", stufe: 2, level: 20 },
  { g: "spitzhacke_episch", stufe: 3, level: 35 }, { g: "spitzhacke_legendaer", stufe: 4, level: 45 }, { g: "spitzhacke_mythisch", stufe: 5, level: 65 }];

export const BERG_TAKT_MS = 1500;           // 3 Ticks
export const BERG_WEIT = 2.2;               // so nah muss man an der Ader stehen (Felder)
export const RISS_CHANCE = 0.12, RISS_FENSTER_MS = 1500;
export const BERUF_BERG = "bergbau";
