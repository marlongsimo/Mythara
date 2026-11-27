/*
 * Riftmere – Quest D3 „Wels im Trüben“ (Phase 7, kleine Nebenquest), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-7.md. Wirtin Alma Furtner, Taverne „Zur Furt“ in Graufurt. Voraussetzung Fischen 45, Kochen 45.
 * 3 Graufurter Welse am Fährhafen, 2 Welspasteten am Herd der Taverne (QUER: Teig aus dem Mehl von Hanne Kalk, Weidenhain, nach B2), Abgabe. Lohn: Fischen- und Kochen-XP, 150 Splitter, 1 Questpunkt;
 * danach verkauft Alma Welspastete (Schalter alma_pastete).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 7 (Taverne und Fischplatz aus #36, Alma aus #37, Fischen/Kochen 45 im Spiel).
 * Stellen aus der Welt (#36, Region graufurt). Fischen meldet { art: "sammeln", ziel: "<fischart>" } wie in „Schilf und Schnur“. Liste: doku/quests/d-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";

export const D3 = "graufurt_wels_im_trueben";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Alma vor der Taverne „Zur Furt“ (Tür 44 | 140,6), Fischplatz am Fährhafen (61,4 | 126) – Graufurt, Ursprung 6656 | 6400 */
const ALMA: [number, number] = [6700.5, 6542.5], HAFEN: [number, number] = [6717.4, 6526];
const HILFE = ["Drei Welse. Graufurter, aus dem Fährhafen – keine Bachlinge, keine Barsche. Die brauchen Geduld und Fischen 45.",
  "Dann an meinen Herd. Zwei Pasteten. Mehl brauchst du – das gute, aus Weidenhain. Hanne Kalk am Kornspeicher verkauft es, seit die Mühle wieder läuft.", "Und wenn sie mir schmecken, kommen sie auf die Karte."];

export const QUEST_D3: QuestDef = {
  id: D3, titel: "Wels im Trüben", ort: "Graufurt · Fährhafen", start: "Sprich mit Alma Furtner vor der Taverne „Zur Furt“ in Graufurt.",
  logNeu: "Vor der Taverne „Zur Furt“ in Graufurt steht die Wirtin und schimpft über leere Töpfe.",
  logAngeboten: "Alma Furtner vor der Taverne „Zur Furt“ sucht noch jemanden, der Welse fängt und kocht.",
  logAbgabe: "Bring Alma Furtner die zwei Welspasteten.",
  logFertig: "Almas Welspastete steht auf der Karte der Taverne „Zur Furt“. Du kannst sie bei ihr kaufen.",
  geber: "alma",
  figuren: [{ id: "alma", name: "Alma Furtner", modell: "npc.alma", x: ALMA[0], y: ALMA[1], blick: [0, 1] }],
  voraussetzungen: [
    { text: "Fischen 45", wenn: { skill: { k: "fischen", min: 45 } } },
    { text: "Kochen 45", wenn: { skill: { k: "kochen", min: 45 } } },
  ],
  schritte: [
    { id: "welse", text: "Drei Graufurter Welse fangen", ereignis: { art: "sammeln", ziel: "wels" }, anzahl: 3, wo: HAFEN,
      log: "Fang am Fährhafen von Graufurt drei Graufurter Welse ({n:welse})." },
    { id: "pasteten", text: "Zwei Welspasteten backen", ereignis: { art: "herstellen", rezept: "welspastete" }, anzahl: 2, nach: ["welse"], wo: ALMA,
      log: "Back am Herd der Taverne „Zur Furt“ zwei Welspasteten ({n:pasteten}) – mit Mehl von Hanne Kalk aus Weidenhain." },
  ],
  /* Alma: Wirtin, schnell, spöttisch, kocht besser als sie redet – und redet viel. */
  dialoge: {
    alma: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Riechst du das? Nein? Eben. Nichts im Topf.",
          "Früher hat mir Kord jeden Morgen einen Wels gebracht. Seit die Fähre stand, fischt er nicht mehr. Sitzt nur rum und starrt aufs Wasser."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Du willst helfen? Kannst du einen Wels von einem Stiefel unterscheiden?", "Fischen 45, Kochen 45. Darunter brauch ich dich nicht."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Welspastete! Frisch! Kauf eine, sonst ess ich sie selbst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, anzahl: { g: "welspastete", min: 2 } }, zeilen: ["Riecht man bis auf die Straße. Her damit!"], antworten: ["abgeben", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Zwei Pasteten hast du gebacken? Und wo sind sie?", "Gegessen? …Dann back neue. Der Herd ist warm."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["welse"] }, zeilen: ["Drei Welse! Na also.", "An den Herd. Zwei Pasteten. Ich schau zu und sag nichts. Versprochen. …Fast."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Welse beißen am Fährhafen, wenn's trüb ist. Also immer."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich fange dir Welse. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut! Drei Graufurter Welse, aus dem Hafen. Und dann kochst du sie mir. Zwei Pasteten.", "Mehl hab ich keins mehr. Das gute kommt aus Weidenhain, von Hanne Kalk. Das andere ist Sägemehl.",
          "Mein Herd steht dir offen. Aber putz ihn danach."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann eben Suppe aus Steinen. Wie letzte Woche."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Die Welspasteten geben.", wenn: { anzahl: { g: "welspastete", min: 2 } }, folge: [{ f: { abschluss: true, nehmen: [{ g: "welspastete", n: 2 }],
          zeilen: ["Alma bricht eine Pastete auf, riecht daran und kneift die Augen zu.", "…Gut. Zu viel Salz. Aber gut.", "Die kommt auf die Karte. Mit deinem Namen. Nein, mit meinem. Aber ich denk an dich."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Komm hungrig wieder."] } }] },
      ],
    },
  },
  schalter: { alma_pastete: FERTIG },
  glueckwunsch: "Zu viel Salz. Aber gut. Die kommt auf die Karte.",
  belohnungText: "Belohnung: Fischen- und Kochen-XP, 150 Splitter · danach: Alma verkauft Welspastete",
  belohnung: { berufe: { fischen: 1000, kochen: 1000 }, splitter: 150 },
  punkte: 1,
};
