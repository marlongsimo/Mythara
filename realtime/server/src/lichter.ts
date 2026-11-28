/*
 * Riftmere Echtzeit – Seelenlichter einfangen (Splitterbinden, shared/splitterbinden.ts; Phase 3a). Gemeinsamer Sammel-Kern (sammeln.ts) wie Flachs, ohne Werkzeug:
 * Licht antippen → alle 3 Ticks ein Griff; Ertrag Seelenlicht (stapelbar), XP fürs Splitterbinden, 25 % Chance auf Splitter wie bei Holz und Erz.
 * Danach ist das Licht mit 50 % verloschen (für alle) und leuchtet nach einigen Sekunden wieder.
 */
import { LICHTER, seelenlicht, BERUF_BINDEN, FANG_TAKT_MS, FANG_WEIT } from "../../shared/splitterbinden";
import { sammelBeruf } from "./sammeln";
import { bedingungErfuellt, anzahlVon } from "./inventar";
/** „Ruhelose Gräber“ (#118): solange diese Beute-Bedingung gilt (QuestDef.beute), gibt ein Grablicht dazu den Questgegenstand grablicht – höchstens GRABLICHT_MAX im Rucksack */
export const GRABLICHT_BEDINGUNG = "graeber_grablicht", GRABLICHT_MAX = 3;
export function grablichtFund(nutzer: string, id: string): { g: string; ziel: string; text: string } | null { const L = seelenlicht(id);
  return L && L.art === "grablicht" && bedingungErfuellt(nutzer, GRABLICHT_BEDINGUNG) && anzahlVon(nutzer, "grablicht") < GRABLICHT_MAX
    ? { g: "grablicht", ziel: "", text: "Ein Licht bleibt kalt in deiner Hand liegen – ein Grablicht für die Kammern." } : null; }

const L = sammelBeruf({
  beruf: BERUF_BINDEN, t: "licht", liste: "lichter", arten: LICHTER, ziel: seelenlicht, werkzeuge: [], env: "LICHT", ohneWerkzeug: true, selten: grablichtFund,
  taktMs: FANG_TAKT_MS, weit: FANG_WEIT, momentChance: 0, momentMs: 0, tatErtrag: "fang", tatMoment: "moment", grundLeer: "leer",
  texte: { gast: "Seelenlichter fängt man mit Konto (Menü → Anmelden).", unbekannt: "Dieses Licht gibt es nicht.", nah: "Geh näher an das Licht.", ohneWerkzeug: "",
    werkzeugLevel: () => "", weg: (a) => `Das ${a.name} ist verloschen. Es leuchtet bald wieder.`, level: (a) => `Für ein ${a.name} brauchst du Splitterbinden ${a.level}.` },
});
export const lichterEinrichten = L.einrichten, lichtStart = L.start, lichtStop = L.stop, lichtTakt = L.takt, lichtWeg = L.weg, verloschene = L.erschoepfte;
