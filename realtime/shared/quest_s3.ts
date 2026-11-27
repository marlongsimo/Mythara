/*
 * Riftmere – Quest S3 „Der alte Hecht“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Fischerin Ebba Ried in der Reusenkate am Schilfsee: Unter dem Steg lebt ein Hecht, älter als sie.
 * Drei Mühlbarsche als Köder fangen, den alten Hecht am Steg fangen (seltener Fang, nur mit der Quest), QUER: Lambert Schilf in Weidenhain glaubt es erst, wenn er ihn sieht,
 * dann kommt er als Trophäe an die Wand der Reusenkate (Schalter s3_trophaee). Lohn: Fischen 600 XP, 20 Würmer, 80 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Einbau Süden #126, Anschlüsse #134). Stellen aus der Welt (#120). Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { SCHILFSEE, EBBA, LAMBERT } from "./quest_s_orte";
import { SCHILF } from "./quest_schilf";

export const S3 = "schilfsee_der_alte_hecht";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Drei Mühlbarsche. Lebend, als Köder. Der Alte frisst keine Würmer, der ist doch nicht blöd.",
  "Dann an den Steg. Und warten. Lange. Er beißt, wenn er will, nicht wenn du willst.", "Hast du ihn – zeig ihn Lambert in Weidenhain. Sonst glaubt der mir wieder nicht. Dann kommt er an meine Wand."];

export const QUEST_S3: QuestDef = {
  id: S3, titel: "Der alte Hecht", ort: "Schilfsee · Weidenhain", start: "Sprich mit Ebba Ried an der Reusenkate am Schilfsee.",
  logNeu: "Am Schilfsee, abseits der Südstraße, flickt eine Fischerin ihre Reuse und starrt immer wieder unter den Steg.",
  logAngeboten: "Ebba Ried am Schilfsee erzählt von einem Hecht, den keiner fangen kann.",
  logAbgabe: "Lambert hat ihn gesehen. Bring den alten Hecht zu Ebba Ried an den Schilfsee.",
  logFertig: "Der alte Hecht hängt an der Wand der Reusenkate. Ebba erzählt jedem, wer ihn gefangen hat. Mit jedem Mal wird er größer.",
  geber: "ebba",
  figuren: [EBBA, LAMBERT],
  voraussetzungen: [
    { text: "„Schilf und Schnur“ abgeschlossen", wenn: { quest: { id: SCHILF, phase: ["fertig"] } } },
    { text: "Fischen 10", wenn: { skill: { k: "fischen", min: 10 } } },
  ],
  schritte: [
    { id: "koeder", text: "Drei Mühlbarsche fangen", ereignis: { art: "sammeln", ziel: "muehlbarsch" }, anzahl: 3, wo: SCHILFSEE.steg,
      log: "Fang am Schilfsee drei Mühlbarsche als Köder ({n:koeder})." },
    { id: "hecht", text: "Den alten Hecht fangen", ereignis: { art: "sammeln", ziel: "alter_hecht" }, nach: ["koeder"], wo: SCHILFSEE.steg,
      log: "Angle am Steg des Schilfsees nach dem alten Hecht. Er beißt selten. Sehr selten." },
    { id: "lambert", text: "Lambert den Hecht zeigen", ereignis: { art: "antwort" }, nach: ["hecht"], bei: "lambert", wo: "lambert",
      log: "Zeig den alten Hecht Lambert Schilf am Mühlgraben in Weidenhain. Er glaubt es sonst nicht." },
  ],
  /* Ebba: trocken, misstrauisch gegen jedes Anglerlatein – außer ihrem eigenen. Lambert: leise, langsam, neidisch nur ein kleines bisschen. */
  dialoge: {
    ebba: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Siehst du den Schatten da? Unterm Steg? Nein? Eben.", "Der alte Hecht. Älter als ich. Hat meinem Vater die Rute geklaut. Und mir drei Reusen."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Erst angeln lernen. Lambert in Weidenhain zeigt's dir, wenn er wach ist."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Da hängt er. Zwei Ellen. Na gut, anderthalb.", "Wenn einer fragt: Ich hab ihn müde gemacht. Du hast nur gezogen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "alter_hecht" }, zeilen: ["Lambert hat ihn gesehen? Und? Hat er geweint?"], antworten: ["abgeben", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hecht"] }, zeilen: ["DAS ist er. Das ist er! Die Narbe am Kiefer – die ist von mir.", "Zeig ihn Lambert. Sofort. Bevor er stinkt."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["koeder"] }, zeilen: ["Gute Barsche. An den Steg. Und keinen Mucks."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Barsche zuerst. Der Alte frisst nichts Totes."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich fange dir den Hecht. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du? Hm. Warum nicht. Ich hab's ja auch nicht geschafft.",
          "Drei Mühlbarsche als Köder. Dann an den Steg. Und Geduld. Viel Geduld."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Der läuft nicht weg. Der ist nie weggelaufen."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Den alten Hecht geben.", wenn: { hat: "alter_hecht" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "alter_hecht" }],
          zeilen: ["Ebba hebt ihn hoch, mit beiden Armen. Lange sagt sie gar nichts.", "…An die Wand mit dir, Alter. Da kannst du mich jeden Tag ansehen.", "Hier. Würmer. Und Splitter. Und erzähl's nicht zu groß."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Petri. Oder wie die da oben sagen."] } }] },
      ],
    },
    lambert: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["hecht"], offen: ["lambert"], hat: "alter_hecht" }, zeilen: ["Psst. …Was trägst du da?"], antworten: ["hecht_zeigen", "tschuess"] },
        { zeilen: ["Psst."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "hecht_zeigen", text: "Den alten Hecht vom Schilfsee zeigen.", wenn: { hat: "alter_hecht" }, folge: [{ f: { erledige: ["lambert"],
          zeilen: ["Lambert steht auf. Zum ersten Mal, seit du ihn kennst.", "…Ebbas Hecht. Den gibt's wirklich.", "Sag ihr nicht, dass ich gestanden hab. Und jetzt geh. Der Dicke unter meiner Wurzel lacht schon."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
  },
  /* Der alte Hecht beißt nur, solange die Quest ihn sucht (shared/fischen.ts: 1 % je Mühlbarsch am Fanggrund schilfsee_steg) */
  beute: { s3_alter_hecht: { erledigt: ["koeder"], offen: ["hecht"] } },
  schalter: { s3_trophaee: FERTIG },
  belohnungText: "Belohnung: Fischen 600 XP, 20 Würmer, 80 Splitter · danach: der alte Hecht an der Wand der Reusenkate",
  belohnung: { berufe: { fischen: 600 }, splitter: 80, gegenstaende: [{ g: "wurm", n: 20 }] },
  punkte: 1,
};
