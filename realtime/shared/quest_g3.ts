/*
 * Riftmere – Quest G3 „Was das Wrack verschweigt“ (Phase 10), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-10.md. Kaufherr Jasper Kranich (Küstenhaus) vermisst eine Ladung aus dem Wrack am Strand.
 * Strandräuber im Wrack, eine Kiste mit dem Rabensiegel (der Rabenorden kaufte über Kielmund Splitter ein – B4/C-Bezug), die Klippenhöhlen, der Wrackkapitän (Instanz).
 * QUER: Bertold Krähe (Rabenmoor) und Merit Stahl (Graufurt) müssen den Fund sehen, bevor Kranich die Wahrheit hört.
 * Lohn: Stärke 3.000, Geschick 3.000, Defense 3.000 XP, 800 Splitter, 2 Questpunkte. Schalter wrackkapitaen_kajuete (Instanz, solange die Quest läuft; danach die stärkere Fassung öffentlich oder als eigene Instanz).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 10 (Wrack, Klippenhöhlen und Kajüte wrack_kajuete als Instanz aus #82, Strandräuber, Wrackkapitän). Liste: doku/quests/g-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { G1 } from "./quest_g1";
import { B4 } from "./quest_b4";
import { KIELMUND, WRACK, HOEHLE, BERTOLD, MERIT } from "./quest_g_orte";

export const G3 = "kueste_was_das_wrack_verschweigt";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ZEUGEN = ["bertold", "merit"];
const HILFE = ["Das Wrack am Strand, südlich vom Hafen. Strandräuber hausen drin. Eine Kiste gehört dem Haus – oder hat es einmal.",
  "Was du darin findest, zeig es denen, die sich damit auskennen. Ich bin Kaufmann, kein Gelehrter.", "Und die Höhlen in den Klippen … man sagt, der Kapitän des Wracks spukt dort. Ich glaube nicht an Geister. Meine Leute schon."];

export const QUEST_G3: QuestDef = {
  id: G3, titel: "Was das Wrack verschweigt", ort: "Kielmund · Strand · Rabenmoor · Graufurt · Klippenhöhlen", start: "Sprich mit Kaufherr Jasper Kranich im Haus der Küstenhäuser in Kielmund.",
  logNeu: "Jasper Kranich vom Küstenhaus in Kielmund schaut öfter zum Wrack am Strand, als einem Kaufmann guttut.",
  logAngeboten: "Jasper Kranich in Kielmund vermisst eine Ladung aus dem Wrack.",
  logAbgabe: "Der Wrackkapitän ruht. Erzähl Jasper Kranich in Kielmund, was das Wrack verschwiegen hat.",
  logFertig: "Das Wrack vor Kielmund trug Splitter für den Rabenorden. Bertold Krähe und Merit Stahl wissen es – und das Küstenhaus Kranich kauft nie wieder von Fremden ohne Siegel.",
  geber: "kranich",
  figuren: [
    { id: "kranich", name: "Jasper Kranich", modell: "npcmann3d", x: KIELMUND.kaufherr[0], y: KIELMUND.kaufherr[1], blick: [0, 1] },
    { id: "bertold", name: "Bertold Krähe", modell: "npc.bertold", x: BERTOLD[0], y: BERTOLD[1], blick: [0, 1] },
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Die Südstraße“ abgeschlossen", wenn: { quest: { id: G1, phase: ["fertig"] } } },
    { text: "„Das rote Banner“ abgeschlossen", wenn: { quest: { id: B4, phase: ["fertig"] } } },
    { text: "Heldenlevel 35", wenn: { heldenlevel: 35 } },
  ],
  schritte: [
    { id: "raeuber", text: "Die Strandräuber im Wrack besiegen", ereignis: { art: "erlegen", typ: "strandraeuber" }, anzahl: 4, wo: WRACK.raeuber,
      log: "Vertreib die Strandräuber aus dem Wrack am Strand ({n:raeuber})." },
    { id: "kiste", text: "Die Kiste im Wrack öffnen", ereignis: { art: "objekt", id: "g3_kiste" }, nach: ["raeuber"], wo: WRACK.kiste,
      log: "Öffne die Kiste im Bauch des Wracks." },
    { id: "bertold", text: "Bertold Krähe den Fund zeigen", ereignis: { art: "antwort" }, nach: ["kiste"], bei: "bertold", gruppe: "zeugen",
      log: "Zeig die Kiste mit dem Rabensiegel Bertold Krähe im Rabenmoor und Merit Stahl in Graufurt ({n:zeugen})." },
    { id: "merit", text: "Merit Stahl den Fund zeigen", ereignis: { art: "antwort" }, nach: ["kiste"], bei: "merit", gruppe: "zeugen",
      log: "Zeig die Kiste mit dem Rabensiegel Bertold Krähe im Rabenmoor und Merit Stahl in Graufurt ({n:zeugen})." },
    { id: "kapitaen", text: "Den Wrackkapitän in den Klippenhöhlen stellen", ereignis: { art: "erlegen", typ: "wrackkapitaen" }, nach: ZEUGEN, wo: HOEHLE.kapitaen,
      log: "Merit und Bertold sagen dasselbe: Der Kapitän wusste, was er fuhr. Steig durch die Felstür an der Klippe in die Höhlen und stell den Wrackkapitän in seiner Kajüte." },
    { id: "logbuch", text: "Die Logbuchseite in der Kajüte lesen", ereignis: { art: "objekt", id: "g3_logbuch" }, nach: ["kapitaen"], wo: HOEHLE.logbuch,
      log: "In der Kajüte liegt eine Seite aus dem Logbuch der „Morgenstern“. Lies sie." },
  ],
  objekte: [
    { id: "g3_logbuch", name: "Logbuchseite", x: HOEHLE.logbuch[0], y: HOEHLE.logbuch[1], modell: "stelle", tat: "untersuchen", tatText: "Die Seite lesen", weit: 2.5,
      text: "„Morgenstern, letzte Fahrt. Ladung: 40 Säckchen. Abnehmer: die Insel. Bezahlung: Federn.“ Darunter, zittrig: „Sie sagen, die Federn machen stark. Sie machen nur kalt.“",
      schon: "Die Logbuchseite der „Morgenstern“.", sonst: [{ wenn: NEU, text: "Eine Seite Papier, feucht und gewellt." }, { wenn: FERTIG, text: "Die Logbuchseite der „Morgenstern“." },
        { wenn: { offen: ["logbuch"] }, text: "Der Kapitän steht zwischen dir und dem Tisch." }] },
    { id: "g3_kiste", name: "Kiste im Wrack", x: WRACK.kiste[0], y: WRACK.kiste[1], modell: "stelle", tat: "untersuchen", tatText: "Die Kiste öffnen", weit: 2.5, geben: [{ g: "wrackkiste", name: "die Kiste mit dem Rabensiegel" }],
      text: "Unter nassem Segeltuch: Splitter, sorgfältig in Säckchen genäht. Und eine kleine Kiste, das Siegel schwarz – ein Rabe über einem Kreis aus Steinen. Darin Rechnungen über Splitter, gekauft über Kielmund.",
      schon: "Die Kiste ist leer.", sonst: [{ wenn: NEU, text: "Eine Kiste im Bauch des Wracks, mit Ketten gesichert." }, { wenn: FERTIG, text: "Die Kiste ist leer." }, { wenn: { offen: ["kiste"] }, text: "Die Strandräuber hocken auf der Kiste." }] },
  ],
  /* Kranich: höflich, rechnet. Bertold: schwer, erkennt das Zeichen sofort. Merit: förmlich, wird hart, wenn es um die Wacht geht. */
  dialoge: {
    kranich: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Das Wrack am Strand. Unser Schiff, offiziell. Inoffiziell … hatte es eine Ladung, die nicht in meinen Büchern stand.", "Ich will wissen, was."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Gute Geschäfte."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Splitter für Raben. Unter meiner Flagge. Ich prüfe jetzt jede Kiste selbst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Sie sind zurück. Und Ihr Gesicht sagt mir, dass ich die Wahrheit nicht mögen werde."], antworten: ["bericht"] },
        { wenn: { ...LAEUFT, erledigt: ["kiste"] }, zeilen: ["Eine Kiste mit einem Raben? Ich kenne das Zeichen nicht. Zeigen Sie ihn denen, die es kennen."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Das Wrack, südlich vom Hafen. Seien Sie vorsichtig."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich sehe mir das Wrack an. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Diskret, wenn's geht. Das Haus Kranich hat einen Ruf."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Das Wrack rostet ohnehin weiter."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "bericht", text: "Euer Schiff fuhr Splitter für den Rabenorden.", folge: [{ f: { abschluss: true, zeilen: ["Kranich setzt sich. Er sagt lange nichts.", "Für jeden Splitter eine Feder, schreiben die. Und mein Kapitän hat mitgemacht.",
          "Das Haus Kranich ist Ihnen etwas schuldig. Und es wird sich merken, wer seinen Namen sauber gehalten hat."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Geschäfte."] } }] },
      ],
    },
    bertold: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kiste"], offen: ["bertold"], hat: "wrackkiste" }, zeilen: ["Du kommst von der Küste? Mit Salz im Haar? Was bringst du mir?"], antworten: ["wrackkiste_bertold", "tschuess"] },
        { zeilen: ["Geh mit trockenen Füßen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wrackkiste_bertold", text: "Die Kiste mit dem Rabensiegel zeigen.", wenn: { hat: "wrackkiste" }, folge: [{ f: { erledige: ["bertold"], zeilen: ["Bertold muss das Siegel nicht einmal brechen. Er kennt es.",
          "Der Orden hat über das Meer eingekauft. Auch nach dem Obersten. Das heißt: Es gibt noch welche. Irgendwo."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kiste"], offen: ["merit"], hat: "wrackkiste" }, zeilen: ["Du hast etwas aus Kielmund mitgebracht? Zeig her."], antworten: ["wrackkiste_merit", "tschuess"] },
        { zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wrackkiste_merit", text: "Die Kiste mit dem Rabensiegel zeigen.", wenn: { hat: "wrackkiste" }, folge: [{ f: { erledige: ["merit"], zeilen: ["Merit blättert die Rechnungen durch. Ihr Kiefer wird hart.",
          "Der Kapitän hat unterschrieben. Mit dem Zeichen der Wacht – ein ehemaliger Seemann der Wacht. Er wusste, was er fuhr.", "Such ihn. Lebendig oder nicht – er muss Rede stehen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  schalter: { wrackkapitaen_kajuete: LAEUFT },
  belohnungText: "Belohnung: Stärke 3.000, Geschick 3.000, Defense 3.000 XP, 800 Splitter",
  belohnung: { xp: { staerke: 3000, geschick: 3000, defense: 3000 }, splitter: 800 },
  punkte: 2,
};
