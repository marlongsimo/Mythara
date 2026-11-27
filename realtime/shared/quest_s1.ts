/*
 * Riftmere – Quest S1 „Saat und Krähen“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Bäuerin Rike Heck auf dem Heckenhof, gleich südlich von Weidenhain: Krähen fressen die Saat.
 * Drei Krähenschwärme vertreiben, ein Hanftuch weben (Werkbank), die Vogelscheuche aus Hanftuch und Hanf aufstellen, für die Knechte einen Hasenbraten braten (Kochen 5,
 * Hasenfleisch vom Feldhasen – Fleisch ist erlaubt, Nutzer 27.11.). Sonst nur Vorhandenes: Hanf, Garn und Hanftuch gibt es schon. Lohn: Handwerk 300 XP, 2 Brot, 60 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Einbau Süden #126, Anschlüsse #134). Stellen aus der Welt (#120). Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { HECKENHOF, RIKE } from "./quest_s_orte";

export const S1 = "heckenhof_saat_und_kraehen";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Erst die Krähen. Drei Schwärme hocken auf dem Feld. Scheuch sie, wie du willst.",
  "Dann ein Hanftuch. An jeder Werkbank, aus Garn. Garn machst du aus Hanf, der wächst hier am Feldrand.", "Tuch und zwei Hand voll Hanf an das Kreuz am Feld. Fertig ist der Kerl.",
  "Und die Knechte haben Hunger. Ein Feldhase, am Feuer gebraten. Die Hasen fressen mir sowieso den Rest."];

export const QUEST_S1: QuestDef = {
  id: S1, titel: "Saat und Krähen", ort: "Heckenhof · südlich von Weidenhain", start: "Sprich mit Rike Heck auf dem Heckenhof an der Südstraße.",
  logNeu: "Auf dem Heckenhof, gleich südlich von Weidenhain, schimpft eine Bäuerin über die Krähen auf ihrem Feld.",
  logAngeboten: "Rike Heck auf dem Heckenhof braucht jemanden gegen die Krähen.",
  logAbgabe: "Die Vogelscheuche steht. Bring Rike Heck den Hasenbraten für die Knechte.",
  logFertig: "Auf dem Feld des Heckenhofs steht eine Vogelscheuche. Die Krähen sitzen jetzt auf dem Zaun – und trauen sich nicht weiter.",
  geber: "rike",
  figuren: [RIKE],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Kochen 5", wenn: { skill: { k: "kochen", min: 5 } } },
  ],
  schritte: [
    { id: "kraehen", text: "Drei Krähenschwärme vertreiben", ereignis: { art: "erlegen", typ: "kraehenschwarm" }, anzahl: 3, wo: HECKENHOF.feld,
      log: "Vertreib die Krähenschwärme vom Feld des Heckenhofs ({n:kraehen})." },
    { id: "tuch", text: "Ein Hanftuch weben", ereignis: { art: "herstellen", rezept: "stoff_hanf" }, nach: ["kraehen"],
      log: "Web an einer Werkbank ein Hanftuch. Garn spinnst du aus Hanf – er wächst am Feldrand." },
    { id: "scheuche", text: "Die Vogelscheuche aufstellen", ereignis: { art: "objekt", id: "s1_scheuche" }, nach: ["tuch"], wo: HECKENHOF.scheuche,
      log: "Häng das Hanftuch und zwei Hand voll Hanf an das Holzkreuz am Feld." },
    { id: "braten", text: "Einen Hasenbraten braten", ereignis: { art: "herstellen", rezept: "hasenbraten" }, nach: ["kraehen"], wo: HECKENHOF.feld,
      log: "Erleg auf dem Feld einen Feldhasen und brat das Fleisch an einem Feuer – für Rikes Knechte." },
  ],
  objekte: [
    { id: "s1_scheuche", name: "Holzkreuz am Feld", x: HECKENHOF.scheuche[0], y: HECKENHOF.scheuche[1], modell: "stelle", tat: "benutzen", tatText: "Die Vogelscheuche bauen", weit: 3,
      braucht: { wenn: { hat: "stoff_hanf", anzahl: { g: "hanf", min: 2 } }, text: "Ein leeres Holzkreuz. Es fehlen ein Hanftuch und zwei Hand voll Hanf." },
      nehmen: [{ g: "stoff_hanf" }, { g: "hanf", n: 2 }],
      text: "Hanf in die Ärmel, das Tuch darüber, ein Knoten am Hals. Der Wind fährt hinein – und die Scheuche winkt.",
      schon: "Die Vogelscheuche winkt.", sonst: [{ wenn: NEU, text: "Ein leeres Holzkreuz am Feldrand." }, { wenn: FERTIG, text: "Die Vogelscheuche winkt." },
        { wenn: { offen: ["tuch"] }, text: "Ein leeres Holzkreuz. Erst die Krähen, dann das Tuch." }] },
  ],
  /* Rike: derb, schnell, hat keine Zeit und sagt das auch. */
  dialoge: {
    rike: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Siehst du die? Schwarz und frech. Die fressen mir die Saat aus dem Boden, bevor sie keimt.",
          "Ich hab zwei Hände. Eine für die Hacke, eine für die Kuh. Keine für Krähen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Weidenhain ist da oben. Ich bin hier unten. Und hab zu tun."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Kerl am Feld. Sieht dir ein bisschen ähnlich.", "Die Saat kommt. Danke."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "hasenbraten" }, zeilen: ["Sie winkt! Die Krähen sitzen auf dem Zaun und schmollen.", "Und das riecht nach Braten. Her damit, bevor die Knechte es riechen."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Die Scheuche winkt. Schön.", "Und der Braten? Gegessen? Die Knechte schauen schon so."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["scheuche"] }, zeilen: ["Sie winkt! Jetzt fehlt nur noch was im Topf. Ein Hasenbraten."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["tuch"] }, zeilen: ["Schönes Tuch. Fast zu schön für eine Scheuche.", "Ans Kreuz damit. Und zwei Hand voll Hanf für den Bauch."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kraehen"] }, zeilen: ["Weg sind sie. Für heute.", "Morgen kommen sie wieder. Darum: eine Scheuche. Erst ein Hanftuch."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Da, auf dem Feld. Hörst du sie lachen?"], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich kümmere mich um die Krähen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Erst verscheuchen. Dann einen bauen, der sie verscheucht, wenn du weg bist.",
          "Hanftuch und Hanf. Mehr braucht so ein Kerl nicht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Krähen haben Zeit. Ich nicht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Die Vogelscheuche steht. Und hier ist der Hasenbraten.", wenn: { hat: "hasenbraten" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "hasenbraten" }], zeilen: ["Rike stemmt die Hände in die Hüften und sieht lange aufs Feld. Dann riecht sie am Braten.",
          "Gut. Hier, Brot. Vom Korn vom letzten Jahr – das, was die Krähen übrig gelassen haben."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Ja. Ja. Geh nur."] } }] },
      ],
    },
  },
  glueckwunsch: "Der Kerl winkt, die Knechte sind satt. Die Saat kommt. Danke.",
  belohnungText: "Belohnung: Handwerk 300, Kochen 200 XP, 2 Brot, 60 Splitter",
  belohnung: { berufe: { handwerk: 300, kochen: 200 }, splitter: 60, gegenstaende: [{ g: "brot", n: 2 }] },
  punkte: 1,
};
