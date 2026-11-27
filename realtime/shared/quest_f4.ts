/*
 * Riftmere – Quest F4 „Der Strom trägt“ (Phase 9, klein), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md. Fischerin Nalia am Strom bei Glutbrunn: zwei Glutwelse fangen (Fischen 65), einen mit Salzkruste kochen (Kochen 65, Salz aus F2).
 * Lohn: Fischen 5.000, Kochen 5.000 XP, 300 Splitter, 1 Questpunkt; danach ist das Rezept „Glutwels mit Salzkruste“ am Herd frei.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Strom, Nalia, Glutwels, Rezept glutwels_salzkruste, Salz). Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { F2 } from "./quest_f2";
import { STROM, GLUTBRUNN } from "./quest_f_orte";

export const F4 = "glutsande_der_strom_traegt";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };

export const QUEST_F4: QuestDef = {
  id: F4, titel: "Der Strom trägt", ort: "Glutbrunn · am Strom", start: "Sprich mit der Fischerin Nalia am Strom bei Glutbrunn.",
  logNeu: "Am Strom bei Glutbrunn sitzt eine Fischerin mit den Füßen im Wasser und summt.",
  logAngeboten: "Nalia am Strom würde dir zeigen, wie man den Glutwels fängt.",
  logAbgabe: "Bring Nalia den Glutwels mit Salzkruste.",
  logFertig: "Du kannst Glutwels mit Salzkruste kochen – am Herd in Glutbrunn, mit Salz aus der Salzpfanne.",
  geber: "nalia",
  figuren: [{ id: "nalia", name: "Nalia", modell: "npcfrau3d", x: STROM.nalia[0], y: STROM.nalia[1], blick: [1, 0] }],
  voraussetzungen: [
    { text: "„Salz und Feuer“ abgeschlossen", wenn: { quest: { id: F2, phase: ["fertig"] } } },
    { text: "Fischen 65", wenn: { skill: { k: "fischen", min: 65 } } },
    { text: "Kochen 65", wenn: { skill: { k: "kochen", min: 65 } } },
  ],
  schritte: [
    { id: "welse", text: "Zwei Glutwelse fangen", ereignis: { art: "sammeln", ziel: "glutwels" }, anzahl: 2, wo: STROM.fischplatz,
      log: "Fang am Strom bei Glutbrunn zwei Glutwelse ({n:welse})." },
    { id: "kruste", text: "Einen Glutwels mit Salzkruste kochen", ereignis: { art: "herstellen", rezept: "glutwels_salzkruste" }, nach: ["welse"], wo: GLUTBRUNN.herd,
      log: "Koch am Herd in Glutbrunn einen Glutwels mit Salzkruste – Salz von Ruwen aus der Salzpfanne." },
  ],
  /* Nalia: Fischerin, ruhig, singt beim Arbeiten, redet über den Strom wie über eine alte Freundin. */
  dialoge: {
    nalia: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Der Strom trägt alles. Boote, Dreck, Lieder. Und Welse, so groß wie ein Kind.", "Willst du einen fangen? Und dann richtig kochen? Mit Salz drum, wie bei uns?"], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Psst. Er hört zu."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Na? Hat er gebissen? Er beißt immer, wenn du nicht hinsiehst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "glutwels_salzkruste" }, zeilen: ["Ich rieche Salz und Feuer. Komm, lass sehen."], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gekocht und gegessen? Dann war er gut. Koch noch einen, ich will auch."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["welse"] }, zeilen: ["Zwei! Der Strom mag dich.", "Jetzt Salz drum, dick, wie eine Rüstung. Dann ins Feuer. Die Kruste schlägst du auf, wenn er fertig ist."], antworten: ["tschuess"] },
        { zeilen: ["Rute rein, Wurm dran, warten. Glutwelse sind geduldig. Sei geduldiger."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Zeig es mir. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Zwei Glutwelse. Dann zum Herd in der Stadt. Salz hast du? Ruwen hat welches, seit du ihm geholfen hast."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Der Strom ist morgen auch noch da."] } }] },
        { id: "abgeben", text: "Den Glutwels mit Salzkruste geben.", wenn: { hat: "glutwels_salzkruste" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "glutwels_salzkruste" }],
          zeilen: ["Nalia schlägt die Kruste mit einem Stein auf. Dampf steigt auf. Sie isst mit den Fingern, schweigend.", "So hat meine Großmutter ihn gemacht. Genau so. Jetzt kannst du's auch."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Der Strom trägt dich."] } }] },
      ],
    },
  },
  /* Das Rezept ist erst mit Nalia frei (danach für immer) */
  sperren: { herstellen: { glutwels_salzkruste: [{ wenn: NEU, text: "Wie man den Glutwels mit Salzkruste kocht, zeigt dir Nalia am Strom." }] } },
  belohnungText: "Belohnung: Fischen 5.000, Kochen 5.000 XP, 300 Splitter · danach: das Rezept Glutwels mit Salzkruste",
  belohnung: { berufe: { fischen: 5000, kochen: 5000 }, splitter: 300 },
  punkte: 1,
};
