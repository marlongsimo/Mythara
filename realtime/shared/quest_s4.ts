/*
 * Riftmere – Quest S4 „Klemmende Säge“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Sägemüller Bodo Span in Erlengrund: Das Wasserrad der Sägemühle steht.
 * QUER: Tebbe in Weidenhain weiß, wie man Eisenbänder um ein Rad legt (wie das Mühlrad in B2). Vier Eichenstämme, zwei Eisenbänder, das Rad reparieren.
 * Danach ist die Werkbank in der Sägemühle frei (Schalter saegemuehle_frei). Lohn: Holzfällerei 400, Schmieden 300 XP, 2 Eichenstämme, 70 Splitter, 1 Questpunkt.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Erlengrund mit Sägemühle (Welt #120), Bodo (Figuren #121), Rezept eisenbaender auch für S4. Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { ERLENGRUND, BODO, TEBBE } from "./quest_s_orte";
import { B2 } from "./quest_b2";

export const S4 = "erlengrund_klemmende_saege";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Vier Eichenstämme! Aus dem Wald hinter der Mühle!", "Eisenbänder! Zwei! Frag Tebbe in Weidenhain, der hat sein Mühlrad auch so geflickt!",
  "Dann ans Rad! Stämme rein, Bänder drum! Und dann hörst du sie wieder singen!"];

export const QUEST_S4: QuestDef = {
  id: S4, titel: "Klemmende Säge", ort: "Erlengrund · Weidenhain", start: "Sprich mit Bodo Span an der Sägemühle in Erlengrund.",
  logNeu: "In Erlengrund am Waldrand steht die Sägemühle still. Der Sägemüller ruft trotzdem, als würde sie laufen.",
  logAngeboten: "Bodo Span in Erlengrund braucht Hilfe mit dem Wasserrad seiner Sägemühle.",
  logAbgabe: "Das Rad dreht sich. Sag Bodo Span Bescheid.",
  logFertig: "Die Sägemühle von Erlengrund klappert wieder. Die Werkbank darin steht dir offen.",
  geber: "bodo",
  figuren: [BODO, TEBBE],
  voraussetzungen: [
    { text: "„Wasser auf die Mühle“ abgeschlossen", wenn: { quest: { id: B2, phase: ["fertig"] } } },
    { text: "Holzfällerei 10", wenn: { skill: { k: "holzfaellerei", min: 10 } } },
  ],
  schritte: [
    { id: "staemme", text: "Vier Eichenstämme schlagen", ereignis: { art: "sammeln", ziel: "eiche" }, anzahl: 4, wo: ERLENGRUND.wald,
      log: "Schlag im Wald hinter der Sägemühle vier Eichenstämme ({n:staemme})." },
    { id: "tebbe", text: "Tebbe nach den Eisenbändern fragen", ereignis: { art: "antwort" }, bei: "tebbe", wo: "tebbe",
      log: "Frag Tebbe in Weidenhain, wie er die Eisenbänder um sein Mühlrad gelegt hat." },
    { id: "baender", text: "Zwei Eisenbänder schmieden", ereignis: { art: "herstellen", rezept: "eisenbaender" }, nach: ["tebbe"],
      log: "Schmied am Amboss Eisenbänder aus einem Eisenbarren." },
    { id: "rad", text: "Das Wasserrad reparieren", ereignis: { art: "objekt", id: "s4_rad" }, nach: ["staemme", "baender"], wo: ERLENGRUND.rad,
      log: "Setz die vier Eichenstämme ins Wasserrad der Sägemühle und leg die Eisenbänder darum." },
  ],
  objekte: [
    { id: "s4_rad", name: "Wasserrad der Sägemühle", x: ERLENGRUND.rad[0], y: ERLENGRUND.rad[1], modell: "stelle", tat: "benutzen", tatText: "Das Rad reparieren", weit: 3,
      braucht: { wenn: { anzahl: { g: "stamm_eiche", min: 4 }, hat: "eisenband" }, text: "Das Rad hängt schief, drei Schaufeln sind gebrochen. Dafür brauchst du vier Eichenstämme und zwei Eisenbänder." },
      nehmen: [{ g: "stamm_eiche", n: 4 }, { g: "eisenband", n: 2 }],
      text: "Schaufel um Schaufel, dann die Bänder, Schlag auf Schlag. Das Wasser drückt – das Rad knarrt – und dreht sich.",
      schon: "Das Rad dreht sich und spritzt.", sonst: [{ wenn: NEU, text: "Ein Wasserrad, das sich nicht dreht." }, { wenn: FERTIG, text: "Das Rad dreht sich und spritzt." },
        { wenn: { offen: ["staemme"] }, text: "Drei Schaufeln sind gebrochen. Erst Eichenstämme." }, { wenn: { offen: ["baender"] }, text: "Ohne Eisenbänder hält das nicht." }] },
  ],
  /* Bodo: ruft immer, weil die Säge sonst lauter ist – auch wenn sie steht. Tebbe: brummig, stolz auf sein Rad. */
  dialoge: {
    bodo: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["WAS? Ach, du redest. Entschuldige. Ich bin's gewohnt, gegen die Säge anzubrüllen.",
          "Sie steht! Seit dem Hochwasser! Drei Schaufeln weg, das Rad schief! Und ich hab Aufträge bis Kielmund!"], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["WER? Ach so. Komm wieder, wenn du einen Baum von einem Besen unterscheiden kannst!"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["HÖRST DU SIE? SIE SINGT!", "Die Werkbank drinnen gehört dir, wann du willst!"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Sie dreht sich! Sie dreht sich wirklich!"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["staemme", "baender"] }, zeilen: ["Alles da! Ans Rad damit!"], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["tebbe"] }, zeilen: ["Tebbe hat's dir verraten? Der alte Brummbär! Dann ab an den Amboss!"], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["staemme"] }, zeilen: ["Gute Eiche! Jetzt die Bänder! Frag Tebbe!"], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Eiche! Vier Stämme! Der Wald ist gleich da!"], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich helfe mit dem Rad. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["GUT! Vier Eichenstämme für die Schaufeln! Zwei Eisenbänder drum!",
          "Wie man die legt, weiß Tebbe in Weidenhain! Der hat's beim Mühlrad vorgemacht!"] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["WAS? …Ach so. Später. Ja."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Das Rad dreht sich wieder.", folge: [{ f: { abschluss: true, zeilen: ["Bodo zieht den Hebel. Die Säge fährt an, frisst sich in einen Stamm.",
          "DANKE!", "Hier, zwei Eichenstämme, schon gesägt! Und die Werkbank, wann immer du willst!"] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["WAS? Ja! Tschüss!"] } }] },
      ],
    },
    tebbe: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["tebbe"] }, zeilen: ["Erlengrund? Bodo? Ist der immer noch so laut?"], antworten: ["baender_fragen", "tschuess"] },
        { zeilen: ["Hm."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "baender_fragen", text: "Wie hast du die Eisenbänder um dein Rad gelegt?", folge: [{ f: { erledige: ["tebbe"],
          zeilen: ["Heiß. Man legt sie heiß. Dann ziehen sie sich zusammen und halten wie ein Schwur.", "Ein Eisenbarren am Amboss, gibt zwei Bänder. Mehr ist es nicht. Sag Bodo, er soll nicht so brüllen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
  },
  schalter: { saegemuehle_frei: FERTIG },
  belohnungText: "Belohnung: Holzfällerei 400, Schmieden 300 XP, 2 Eichenstämme, 70 Splitter · danach: die Werkbank in der Sägemühle",
  belohnung: { berufe: { holzfaellerei: 400, schmieden: 300 }, splitter: 70, gegenstaende: [{ g: "stamm_eiche", n: 2 }] },
  punkte: 1,
};
