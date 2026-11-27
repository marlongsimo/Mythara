/*
 * Riftmere – Quest G2 „Das Leuchtfeuer“ (Phase 10), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-10.md. Leuchtturmwärterin Wiebke Strand: Das Feuer ist erloschen, Schiffe laufen auf.
 * Lampenöl aus Heringstran (fünf Heringe, Kessel im Wärterhaus), Splitterglut am Bindestein (Splitterbinden 20, Seelenlicht + Splitter),
 * die Linse polieren (Handwerk 25), das Feuer entzünden.
 * QUER: Seelenlicht aus der Waldmark oder von der Linde in Weidenhain; die Splitterglut wird am Bindestein an der Linde (B1) gebunden.
 * Abweichung vom Konzept: Tran aus Hering (Fischen 20) statt Seeaal (Fischen 45), damit die Quest in die Küstenstufe 20–40 passt.
 * Lohn: Splitterbinden 1.500, Handwerk 1.500, Fischen 800 XP, 500 Splitter, 2 Questpunkte; Schalter leuchtfeuer_an.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Inhalte Phase 9/10, 9c0d16bd und e7f482af). Liste: doku/quests/g-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { G1 } from "./quest_g1";
import { LEUCHTTURM, KIELMUND, LINDE } from "./quest_g_orte";

export const G2 = "kueste_das_leuchtfeuer";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Öl: fünf Heringe vom Kai, ausgekocht im Kessel hier. Tran stinkt, aber er brennt.",
  "Und Glut: Mit Öl allein sieht dich keiner auf See. Der alte Wärter hat einen Splitter hineingebunden, an einem Bindestein. Der nächste steht an der Linde in Weidenhain. Ein Seelenlicht und ein paar Splitter.",
  "Dann die Linse. Die ist blind vom Salz. Poliert sie, mit ruhiger Hand. Und dann – Feuer."];

export const QUEST_G2: QuestDef = {
  id: G2, titel: "Das Leuchtfeuer", ort: "Kielmund · Leuchtturm · Weidenhain", start: "Sprich mit der Leuchtturmwärterin Wiebke Strand am Leuchtturm bei Kielmund.",
  logNeu: "Der Leuchtturm auf der Klippe bei Kielmund ist dunkel. Die Wärterin steht oben und starrt aufs Meer.",
  logAngeboten: "Wiebke Strand am Leuchtturm bei Kielmund hofft, dass jemand ihr Feuer wieder entzündet.",
  logAbgabe: "Das Leuchtfeuer brennt. Geh zu Wiebke Strand.",
  logFertig: "Das Leuchtfeuer über Kielmund brennt wieder, mit einer grünen Splitterglut im Kern. Kein Schiff läuft mehr auf die Klippen.",
  geber: "wiebke",
  figuren: [{ id: "wiebke", name: "Wiebke Strand", modell: "npcfrau3d", x: LEUCHTTURM.waerterin[0], y: LEUCHTTURM.waerterin[1], blick: [0, 1] }],
  voraussetzungen: [
    { text: "„Die Südstraße“ abgeschlossen", wenn: { quest: { id: G1, phase: ["fertig"] } } },
    { text: "Splitterbinden 20", wenn: { skill: { k: "splitterbinden", min: 20 } } },
    { text: "Handwerk 25", wenn: { skill: { k: "handwerk", min: 25 } } },
  ],
  schritte: [
    { id: "heringe", text: "Fünf Heringe fangen", ereignis: { art: "sammeln", ziel: "hering" }, anzahl: 5, wo: KIELMUND.kai,
      log: "Fang am Kai von Kielmund fünf Heringe ({n:heringe})." },
    { id: "oel", text: "Lampenöl auskochen", ereignis: { art: "herstellen", rezept: "lampenoel" }, nach: ["heringe"], wo: LEUCHTTURM.kessel,
      log: "Koch im Kessel im Wärterhaus aus den Heringen Lampenöl." },
    { id: "glut", text: "Eine Splitterglut binden", ereignis: { art: "herstellen", rezept: "splitterglut" }, wo: LINDE,
      log: "Bind am Bindestein an der Linde in Weidenhain eine Splitterglut – ein Seelenlicht und fünf Splitter (Splitterbinden 20)." },
    { id: "linse", text: "Die Linse polieren", ereignis: { art: "objekt", id: "g2_linse" }, wo: LEUCHTTURM.linse,
      log: "Polier oben im Leuchtturm die blinde Linse (Handwerk 25)." },
    { id: "feuer", text: "Das Leuchtfeuer entzünden", ereignis: { art: "objekt", id: "g2_feuer" }, nach: ["oel", "glut", "linse"], wo: LEUCHTTURM.feuer,
      log: "Füll Öl in die Schale, leg die Splitterglut hinein und entzünde das Leuchtfeuer." },
  ],
  objekte: [
    { id: "g2_linse", name: "Linse des Leuchtfeuers", x: LEUCHTTURM.linse[0], y: LEUCHTTURM.linse[1], modell: "stelle", tat: "benutzen", tatText: "Die Linse polieren", weit: 2.5,
      braucht: { wenn: { skill: { k: "handwerk", min: 25 } }, text: "Die Linse ist blind vom Salz. Wer sie zerkratzt, macht sie für immer stumpf. Dafür braucht es Handwerk 25." },
      text: "Stunde um Stunde, Kreis um Kreis. Dann blitzt das Glas auf, und die Sonne wirft einen Fleck aufs Meer, so hell, dass die Möwen ausweichen.",
      schon: "Die Linse glänzt.", sonst: [{ wenn: NEU, text: "Eine große Linse, blind vom Salz." }, { wenn: FERTIG, text: "Die Linse glänzt." }] },
    { id: "g2_feuer", name: "Feuerschale", x: LEUCHTTURM.feuer[0], y: LEUCHTTURM.feuer[1], modell: "stelle", tat: "benutzen", tatText: "Das Feuer entzünden", weit: 2.5,
      braucht: { wenn: { hat: "lampenoel", anzahl: { g: "splitterglut", min: 1 } }, text: "Eine kalte Schale. Öl und Glut gehören hinein." }, nehmen: [{ g: "lampenoel" }, { g: "splitterglut" }],
      text: "Das Öl fängt Feuer, die Splitterglut flammt grün auf, und die Linse wirft das Licht weit hinaus. Unten im Hafen läutet jemand eine Glocke.",
      schon: "Das Feuer brennt.", sonst: [{ wenn: NEU, text: "Eine kalte Feuerschale." }, { wenn: FERTIG, text: "Das Feuer brennt." }, { wenn: { offen: ["feuer"] }, text: "Öl, Glut und eine saubere Linse – dann brennt es." }] },
  ],
  /* Wiebke: Wärterin, wortkarg, wetterhart, zählt Schiffe statt Tage. */
  dialoge: {
    wiebke: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Drei Schiffe diesen Monat. Auf den Klippen.", "Das Feuer ist aus, seit der Alte starb. Ich krieg's nicht an. Öl allein reicht nicht. Er hatte etwas hineingebunden."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Leuchtturm. Kein Licht. Geh weiter."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Kein Schiff mehr auf den Klippen. Ich zähl sie trotzdem."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Es brennt. Es brennt wirklich."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["oel", "glut", "linse"] }, zeilen: ["Öl, Glut, Linse. Hoch mit dir."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["glut"] }, zeilen: ["Grün. Wie beim Alten. Gut."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["oel"] }, zeilen: ["Stinkt. Brennt aber. Jetzt die Glut."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Öl, Glut, Linse. In der Reihenfolge, die dir passt."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich entzünde dein Feuer. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Öl aus Hering, Glut aus Splittern, eine saubere Linse.", "Den Kessel kannst du benutzen. Den Rest musst du selbst holen."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann zähl ich weiter."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Das Feuer brennt.", folge: [{ f: { abschluss: true, zeilen: ["Wiebke steht lange am Fenster. Draußen dreht ein Schiff ab, weg von den Klippen.", "…Danke. Das Haus Kranich zahlt dir was. Ich hab nur das hier: Komm rauf, wann du willst. Die Aussicht ist umsonst."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    lampenoel: [{ wenn: { phase: ["neu"] }, text: "Lampenöl kochst du für Wiebkes Leuchtfeuer." }],
    splitterglut: [{ wenn: { phase: ["neu", "fertig"] }, text: "Eine Splitterglut bindest du nur für das Leuchtfeuer." }, { wenn: { erledigt: ["glut"] }, text: "Die Glut hast du schon." }],
  } },
  schalter: { leuchtfeuer_an: [FERTIG, { erledigt: ["feuer"] }] },
  glueckwunsch: "Das Feuer brennt. Die Schiffe sehen Kielmund wieder.",
  belohnungText: "Belohnung: Splitterbinden 1.500, Handwerk 1.500, Fischen 800 XP, 500 Splitter · danach: das Leuchtfeuer über Kielmund brennt",
  belohnung: { berufe: { splitterbinden: 1500, handwerk: 1500, fischen: 800 }, splitter: 500 },
  punkte: 2,
};
