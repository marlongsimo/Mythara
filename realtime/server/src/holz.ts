/*
 * Mythara Echtzeit – Holzfällerei auf dem Server (shared/holz.ts). Der Ablauf steckt im gemeinsamen Sammel-Kern (sammeln.ts):
 *   · „holz“/„start“: Nähe zum Stamm, Holzfällerei-Level, bestes benutzbares Holzbeil, Baum steht noch, Platz im Rucksack.
 *   · Alle 3 Ticks (1,5 s) ein Hieb: Erfolg → Stamm (stapelt nicht) + XP, mit 25 % dazu 5–15 Splitter; danach fällt der Baum mit seiner Fällchance.
 *   · Kernschlag: nach einem Hieb manchmal (12 %) ein Fenster von 1,5 s; „holz“/„kern“ darin → zwei Stämme, 50 % mehr XP.
 *   · Gefällte Bäume sind für alle ein Stumpf, bis sie nachwachsen („baeume“ an alle; beim Anmelden der Stand).
 * XP liegen im Inventar des Helden (inventar.ts → berufe.holzfaellerei).
 */
import { BAEUME, HOLZBAEUME, holzbaum, BEILE, HOLZ_TAKT_MS, HOLZ_WEIT, KERN_CHANCE, KERN_FENSTER_MS, BERUF } from "../../shared/holz";
import { sammelBeruf, SammelSpieler } from "./sammeln";

export type HolzSpieler = SammelSpieler;
const H = sammelBeruf({
  beruf: BERUF, t: "holz", liste: "baeume", arten: BAEUME, ziel: holzbaum, werkzeuge: BEILE, env: "HOLZ",
  taktMs: HOLZ_TAKT_MS, weit: HOLZ_WEIT, momentChance: KERN_CHANCE, momentMs: KERN_FENSTER_MS, tatErtrag: "stamm", tatMoment: "kern", grundLeer: "gefallen",
  texte: { gast: "Holzfällen geht mit Konto (Menü → Anmelden).", unbekannt: "Diesen Baum gibt es nicht.", nah: "Geh näher an den Baum.", ohneWerkzeug: "Du brauchst ein Holzbeil.",
    werkzeugLevel: (l) => `Für dein Holzbeil brauchst du Holzfällerei ${l}.`, weg: (a) => `Hier steht nur noch ein Stumpf. Die ${a.name} wächst bald nach.`,
    level: (a) => `Für eine ${a.name} brauchst du Holzfällerei ${a.level}.` },
});
export const holzEinrichten = H.einrichten, holzStart = H.start, holzStop = H.stop, holzKern = H.moment, holzTakt = H.takt, holzWeg = H.weg;
export const gefaellte = H.erschoepfte, holzLevel = H.level, faellt = H.aktiv, holzZuruecksetzen = H.zuruecksetzen;
export { HOLZBAEUME };
