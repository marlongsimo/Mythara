/*
 * Riftmere – Quest G1 „Die Südstraße“ (Phase 10), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-10.md. QUER: Othmar Rehn (Weidenhain) schickte Getreide nach Kielmund, der letzte Wagen kam nie an.
 * Zwei Spuren auf der Südstraße, vier Strandräuber, der umgestürzte Wagen (Frachtbrief), in Kielmund Kaufherr Jasper Kranich vom Küstenhaus.
 * Lohn: Stärke 2.000, Fernkampf 2.000, Defense 1.500 XP, 400 Splitter, 2 Questpunkte; Wegstein-Ziel Kielmund (die Kutsche ist gestrichen, Nutzer 26.11.).
 * Der Weg ist offen (offene Welt) – die Quest belohnt mit der Abkürzung.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 10 (Strandräuber, Wegstein-Ziel Kielmund). Stellen aus der Welt (#82). Stellen: shared/quest_g_orte.ts. Liste: doku/quests/g-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { OTHMAR, SUEDSTRASSE, KIELMUND } from "./quest_g_orte";

export const G1 = "kueste_die_suedstrasse";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const SPUREN = ["spur_1", "spur_2"];
const HILFE = ["Die Südstraße, gleich hinter dem Dorf nach Süden. Der Wagen ist vor drei Wochen los. Such Spuren.",
  "Wenn du ihn findest – der Kutscher hatte einen Frachtbrief. Den will das Küstenhaus sehen, sonst zahlen die nicht.", "Kielmund liegt an der Flussmündung. Frag nach Jasper Kranich, dem Kaufherrn."];

export const QUEST_G1: QuestDef = {
  id: G1, titel: "Die Südstraße", ort: "Weidenhain · Südstraße · Kielmund", start: "Sprich mit Bürgermeister Othmar Rehn in Weidenhain.",
  logNeu: "Othmar Rehn in Weidenhain wartet auf Nachricht aus dem Süden. Ein Getreidewagen nach Kielmund ist nie angekommen.",
  logAngeboten: "Othmar Rehn in Weidenhain sucht jemanden, der der Südstraße folgt.",
  logAbgabe: "Bring den Frachtbrief zu Kaufherr Jasper Kranich im Haus der Küstenhäuser in Kielmund.",
  logFertig: "Die Südstraße ist wieder sicher, und der Wegstein kennt Kielmund – ein Reiben, und du stehst an der Mole.",
  geber: "othmar", abgabe: "kranich",
  figuren: [
    { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: OTHMAR[0], y: OTHMAR[1], blick: [0, -1] },
    { id: "kranich", name: "Jasper Kranich", modell: "npcmann3d", x: KIELMUND.kaufherr[0], y: KIELMUND.kaufherr[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Heldenlevel 20", wenn: { heldenlevel: 20 } },
  ],
  schritte: [
    ...SPUREN.map((id, i) => ({ id, text: "Den Spuren auf der Südstraße folgen", ereignis: { art: "objekt" as const, id: "g1_" + id }, gruppe: "spuren", wo: i === 0 ? SUEDSTRASSE.spur_1 : SUEDSTRASSE.spur_2,
      log: "Folg der Südstraße von Weidenhain nach Süden und such nach Spuren des Getreidewagens ({n:spuren})." })),
    { id: "raeuber_saebel", text: "Zwei Strandräuber mit Säbel besiegen", ereignis: { art: "erlegen", typ: "strandraeuber_saebel" }, anzahl: 2, nach: SPUREN, wo: SUEDSTRASSE.raeuber, gruppe: "raeuber",
      log: "Am umgestürzten Wagen lagern Strandräuber, mit Säbeln und Armbrüsten. Besieg vier ({n:raeuber})." },
    { id: "raeuber_armbrust", text: "Zwei Strandräuber mit Armbrust besiegen", ereignis: { art: "erlegen", typ: "strandraeuber_armbrust" }, anzahl: 2, nach: SPUREN, wo: SUEDSTRASSE.raeuber, gruppe: "raeuber",
      log: "Am umgestürzten Wagen lagern Strandräuber, mit Säbeln und Armbrüsten. Besieg vier ({n:raeuber})." },
    { id: "wagen", text: "Den Wagen durchsuchen", ereignis: { art: "objekt", id: "g1_wagen" }, nach: ["raeuber_saebel", "raeuber_armbrust"], wo: SUEDSTRASSE.wagen,
      log: "Durchsuch den umgestürzten Getreidewagen. Der Kutscher hatte einen Frachtbrief." },
  ],
  objekte: [
    { id: "g1_spur_1", name: "Radspur", x: SUEDSTRASSE.spur_1[0], y: SUEDSTRASSE.spur_1[1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Tiefe Radspuren, schwer beladen. Hier hat jemand gebremst – und dann ging es im Galopp weiter ({n:spuren}).", schon: "Die Spur eines schweren Wagens.",
      sonst: [{ wenn: NEU, text: "Radspuren im Schlamm der Südstraße." }, { wenn: FERTIG, text: "Radspuren im Schlamm der Südstraße." }] },
    { id: "g1_spur_2", name: "Verstreutes Korn", x: SUEDSTRASSE.spur_2[0], y: SUEDSTRASSE.spur_2[1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Korn, über den Weg verstreut, und ein Hufeisen. Weiter vorn riecht es nach Rauch und Salz ({n:spuren}).", schon: "Verstreutes Korn. Die Vögel sind schon dran.",
      sonst: [{ wenn: NEU, text: "Ein paar Körner auf dem Weg." }, { wenn: FERTIG, text: "Die Vögel haben das Korn gefressen." }] },
    { id: "g1_wagen", name: "Umgestürzter Wagen", x: SUEDSTRASSE.wagen[0], y: SUEDSTRASSE.wagen[1], modell: "stelle", tat: "untersuchen", tatText: "Den Wagen durchsuchen", weit: 3, geben: [{ g: "frachtbrief" }],
      text: "Die Säcke sind aufgeschlitzt, das Korn ist fort. Unter dem Kutschbock, in einer Lederhülle: der Frachtbrief. „Sechzig Sack, Weidenhain an Küstenhaus Kranich.“",
      schon: "Ein leerer Wagen.", sonst: [{ wenn: NEU, text: "Ein umgestürzter Wagen am Wegrand." }, { wenn: FERTIG, text: "Ein leerer Wagen." }, { wenn: { offen: ["wagen"] }, text: "Die Räuber lassen dich nicht an den Wagen." }] },
  ],
  /* Othmar: Bürgermeister, besonnen, rechnet mit dem Schlimmsten. Jasper Kranich: Kaufherr, höflich, berechnend, freundlicher, wenn Geld im Spiel ist. */
  dialoge: {
    othmar: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Sechzig Sack Korn, nach Kielmund. Die Küstenhäuser zahlen gut. Wenn das Korn ankommt.", "Der Wagen ist vor drei Wochen los. Seitdem nichts."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Weidenhain hat wieder Gäste, seit die Straße offen ist."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Kranich hat gezahlt. Und Weidenhain hat wieder einen Weg zum Meer. Wer hätte das gedacht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wagen"] }, zeilen: ["Das Korn ist fort? …Dann bring wenigstens den Brief nach Kielmund. Kranich soll wissen, dass wir geliefert haben."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Die Südstraße, nach Süden. Folg den Spuren."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich suche den Wagen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Danke. Die Südstraße, immer nach Süden, bis du das Meer riechst.", "Und wenn du Kielmund erreichst: Jasper Kranich vom Küstenhaus. Sag ihm, Weidenhain hat geliefert."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Das Korn wird nicht frischer. Aber gut."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege."] } }] },
      ],
    },
    kranich: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, hat: "frachtbrief" }, zeilen: ["Aus Weidenhain? Zu Fuß? Dann hat Othmar Sie geschickt. Willkommen im Haus der Küstenhäuser.", "Sie haben etwas für mich?"], antworten: ["brief_geben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ein Brief, sagen Sie? Und wo ist er?"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Das Haus Kranich vergisst nicht, wer seinen Weizen gerettet hat. Nun ja – den Brief zum Weizen."], antworten: ["tschuess"] },
        { zeilen: ["Jasper Kranich, Küstenhaus Kranich. Womit kann ich dienen?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "brief_geben", text: "Den Frachtbrief übergeben.", wenn: { hat: "frachtbrief" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "frachtbrief" }],
          zeilen: ["Kranich liest, seine Augenbrauen wandern nach oben. „Sechzig Sack. Geliefert. Und auf der Straße gestohlen.“", "Dann zahlt das Haus. Othmar bekommt sein Geld, und Sie bekommen Ihren Anteil.",
            "Der Wegstein am Markt kennt Sie jetzt. Willkommen in Kielmund."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Geschäfte."] } }] },
      ],
    },
  },
  glueckwunsch: "Der Frachtbrief! Das Küstenhaus vergisst keine Schulden. Und keine Gefallen.",
  belohnungText: "Belohnung: Stärke 2.000, Fernkampf 2.000, Defense 1.500 XP, 400 Splitter · danach: Wegstein-Ziel Kielmund",
  belohnung: { xp: { staerke: 2000, fernkampf: 2000, defense: 1500 }, splitter: 400 },
  punkte: 2,
};
