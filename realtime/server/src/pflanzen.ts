/*
 * Mythara Echtzeit – Flachs und Hanf pflücken (Handwerk, shared/handwerk.ts). Gemeinsamer Sammel-Kern (sammeln.ts), aber ohne Werkzeug und ohne Splitter:
 * Pflanze antippen → alle 3 Ticks ein Griff, fast immer ein Bündel; danach ist die Pflanze mit 30 % abgeerntet (für alle), nach 15 s wächst sie nach.
 * Die XP zählen zum Handwerk (berufe.handwerk).
 */
import { PFLANZEN, pflanze, BERUF_HAND, PFLUECK_TAKT_MS, PFLUECK_WEIT } from "../../shared/handwerk";
import { sammelBeruf } from "./sammeln";

const P = sammelBeruf({
  beruf: BERUF_HAND, t: "pflanze", liste: "pflanzen", arten: PFLANZEN, ziel: pflanze, werkzeuge: [], env: "PFLANZE", ohneWerkzeug: true, ohneSplitter: true,
  taktMs: PFLUECK_TAKT_MS, weit: PFLUECK_WEIT, momentChance: 0, momentMs: 0, tatErtrag: "ernte", tatMoment: "moment", grundLeer: "leer",
  texte: { gast: "Pflücken geht mit Konto (Menü → Anmelden).", unbekannt: "Diese Pflanze gibt es nicht.", nah: "Geh näher an die Pflanze.", ohneWerkzeug: "",
    werkzeugLevel: () => "", weg: (a) => `Hier ist schon alles abgeerntet. Der ${a.name} wächst bald nach.`, level: (a) => `Für ${a.name} brauchst du Handwerk ${a.level}.` },
});
export const pflanzenEinrichten = P.einrichten, pflueckStart = P.start, pflueckStop = P.stop, pflueckTakt = P.takt, pflueckWeg = P.weg, abgeerntete = P.erschoepfte;
