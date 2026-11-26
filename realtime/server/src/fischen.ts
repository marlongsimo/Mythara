/*
 * Riftmere Echtzeit – Fischen und Würmer graben (shared/fischen.ts; Phase 3b). Gemeinsamer Sammel-Kern (sammeln.ts) mit wandernden Stellen:
 *   · Fischen: Fangstelle antippen (Angelrute + Wurm, für den Moorhecht die Reuse), alle 5 Ticks ein Versuch; ein Fang kostet einen Wurm.
 *     Nach einem Fang ziehen die Fische manchmal weiter, und spätestens nach rund anderthalb Minuten wechselt eine Stelle je Grund von selbst.
 *   · Würmer: Ackerstelle antippen, ohne Werkzeug; jedes Graben bringt einen Wurm (ohne XP, ohne Splitter).
 */
import { FISCHE, FISCH_GERAETE, BERUF_FISCHEN, FANGSTELLEN, fangstelle, fanggrund, FANG_TAKT_MS, ANGEL_WEIT, STROEMUNG_CHANCE, STROEMUNG_MS, WANDER_MS,
  WURMACKER_ART, WURMACKER, WURMSTELLEN, wurmstelle, GRAB_TAKT_MS, GRAB_WEIT } from "../../shared/fischen";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { sammelBeruf } from "./sammeln";

const name = (g: string) => (GEGENSTAENDE[g] ? GEGENSTAENDE[g].name : g);
const F = sammelBeruf({
  beruf: BERUF_FISCHEN, t: "fisch", liste: "fanggruende", arten: FISCHE, ziel: fangstelle, werkzeuge: FISCH_GERAETE, env: "FISCH",
  taktMs: FANG_TAKT_MS, weit: ANGEL_WEIT, momentChance: STROEMUNG_CHANCE, momentMs: STROEMUNG_MS, tatErtrag: "fang", tatMoment: "stroemung", grundLeer: "weiter",
  wandern: { ziele: () => FANGSTELLEN, gruppe: (id) => (fangstelle(id) || { grund: "" }).grund, aktiv: (g) => (fanggrund(g) || { aktiv: 1 }).aktiv, ms: WANDER_MS },
  ohneKoeder: (a) => `Ohne ${name(a.koeder || "wurm")} beißt hier nichts. Würmer gräbt man auf den Äckern des Osthofs.`,
  texte: { gast: "Fischen geht mit Konto (Menü → Anmelden).", unbekannt: "Hier sind keine Fische.", nah: "Geh näher ans Wasser.",
    ohneWerkzeug: "Du brauchst eine Angelrute im Rucksack (für den Moorhecht eine Reuse).", werkzeugLevel: (l) => `Mit diesem Gerät fischst du erst ab Fischen ${l}.`,
    weg: () => "Die Fische sind weitergezogen.", level: (a) => `Für den ${a.name} brauchst du Fischen ${a.level}.` },
});
export const fischEinrichten = F.einrichten, fischStart = F.start, fischStop = F.stop, fischTakt = F.takt, fischWeg = F.weg, fischMoment = F.moment, leereFangstellen = F.erschoepfte, fischRuhend = F.ruhende, fischZuruecksetzen = F.zuruecksetzen;

const W = sammelBeruf({
  beruf: BERUF_FISCHEN, t: "wurm", liste: "wurmacker", arten: { wurmacker: WURMACKER_ART }, ziel: wurmstelle, werkzeuge: [], env: "WURM", ohneWerkzeug: true, ohneSplitter: true,
  taktMs: GRAB_TAKT_MS, weit: GRAB_WEIT, momentChance: 0, momentMs: 0, tatErtrag: "grab", tatMoment: "moment", grundLeer: "weiter",
  wandern: { ziele: () => WURMSTELLEN, gruppe: () => WURMACKER.id, aktiv: () => WURMACKER.aktiv, ms: WANDER_MS },
  texte: { gast: "Graben geht mit Konto (Menü → Anmelden).", unbekannt: "Hier ist nichts.", nah: "Geh näher an die Stelle.", ohneWerkzeug: "", werkzeugLevel: () => "",
    weg: () => "Hier ist die Erde schon umgegraben. Versuch es ein Stück weiter.", level: () => "" },
});
export const wurmEinrichten = W.einrichten, wurmStart = W.start, wurmStop = W.stop, wurmTakt = W.takt, wurmWeg = W.weg, leereWurmstellen = W.erschoepfte, wurmRuhend = W.ruhende;
