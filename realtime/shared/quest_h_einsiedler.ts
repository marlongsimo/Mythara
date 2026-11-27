/*
 * Riftmere – Nebenquest „Der Einsiedler vom Spiegelsee“ (Phase 11, Hochlande), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, #161). Der Einsiedler sammelt Bergkräuter und schreibt die Geschichte der Hochlande.
 * Drei Eisenhut und drei Nebelkraut von den Schattenhängen bringen; am Grauhorn drei Steinmänner aufsuchen und ihre Inschriften lesen (Erkunden).
 * QUER: Mira Kräuterlieb in der Waldmark – der Einsiedler war einmal ihr Lehrer und hat das Tal verlassen, ohne Abschied. Mira schickt einen Gruß zurück.
 * Lohn: Kräuterkunde 2.500 XP, 300 Splitter, 1 Questpunkt; Schalter kessel_spiegelsee (der Kessel an der Einsiedelei, Welt d344565a).
 */
import type { QuestDef, Bed } from "./questbau";
import { EINSIEDLER, MIRA, GRAUHORN } from "./quest_h_orte";
import { H_QUESTS } from "./hochlande";
import { H1 } from "./quest_h1";

export const H_EINSIEDLER = H_QUESTS.einsiedler;
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const STEINE = ["stein_1", "stein_2", "stein_3"];
const INSCHRIFT = [
  "Auf einem flachen Stein, mit Kohle geschrieben und vom Regen fast verwischt: „Ebert, Hirte. Ging den Ziegen nach. Die Ziegen kamen wieder.“",
  "In den obersten Stein gekratzt: „Hier rasteten Ilse und Marten, Bergleute aus Steinhag. Sie wollten den Gipfel sehen. Sie haben ihn gesehen.“",
  "Ein Steinmann, höher als du, mit einem Wappen der alten Wacht: „Für die Wächterin vom Pass. Sie blieb, als wir gingen.“",
];
const HILFE = ["Eisenhut und Nebelkraut wachsen an den Schattenhängen, wo die Sonne nachmittags nicht hinkommt. Drei von jedem.",
  "Und am Grauhorn stehen Steinmänner. Drei sind es, die ich noch nicht kenne. Lies, was auf ihnen steht, und erzähl es mir.",
  "Wenn du ins Tal gehst: In der Waldmark lebt eine Kräuterfrau, Mira. …Grüß sie nicht von mir. Oder doch. Ich weiß es nicht."];

export const QUEST_H_EINSIEDLER: QuestDef = {
  id: H_EINSIEDLER, titel: "Der Einsiedler vom Spiegelsee", ort: "Spiegelsee · Grauhorn · Waldmark", start: "Sprich mit dem Einsiedler an seiner Hütte am Spiegelsee.",
  logNeu: "Am Spiegelsee wohnt ein alter Mann allein in einer Hütte voller Bücher und getrockneter Kräuter.",
  logAngeboten: "Der Einsiedler vom Spiegelsee braucht Bergkräuter und Geschichten.",
  logAbgabe: "Kräuter, Inschriften und ein Gruß aus dem Tal: Geh zurück zum Einsiedler am Spiegelsee.",
  logFertig: "Der Einsiedler hat drei neue Seiten in seiner Geschichte der Hochlande. Und einen Brief aus dem Tal, den er noch nicht beantwortet hat.",
  geber: "einsiedler",
  figuren: [EINSIEDLER, MIRA],
  voraussetzungen: [
    { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H1, phase: ["fertig"] } } },
    { text: "Kräuterkunde 35", wenn: { skill: { k: "kraeuterkunde", min: 35 } } },
  ],
  schritte: [
    { id: "kraeuter", text: "Drei Eisenhut und drei Nebelkraut bringen", ereignis: { art: "antwort" }, bei: "einsiedler",
      log: "Sammle an den Schattenhängen der Hochlande drei Eisenhut und drei Nebelkraut und bring sie dem Einsiedler." },
    ...STEINE.map((id, i) => ({ id, text: "Die Steinmänner am Grauhorn lesen", ereignis: { art: "objekt" as const, id: "he_" + id }, gruppe: "steine", wo: GRAUHORN.steinmaenner[i],
      log: "Am Grauhorn stehen drei Steinmänner mit Inschriften. Lies sie für den Einsiedler ({n:steine})." })),
    { id: "mira", text: "Mira Kräuterlieb in der Waldmark grüßen", ereignis: { art: "antwort" }, bei: "mira",
      log: "Der Einsiedler hat von einer Kräuterfrau in der Waldmark gesprochen, Mira. Er wollte sie nicht grüßen lassen. Oder doch." },
  ],
  objekte: STEINE.map((id, i) => ({ id: "he_" + id, name: "Steinmann", x: GRAUHORN.steinmaenner[i][0], y: GRAUHORN.steinmaenner[i][1], modell: "stelle", tat: "untersuchen" as const, tatText: "Die Inschrift lesen", weit: 2.5,
    text: INSCHRIFT[i] + " ({n:steine})", schon: "Diese Inschrift kennst du.",
    sonst: [{ wenn: NEU, text: "Ein Haufen aufgeschichteter Steine. Jemand hat etwas darauf geschrieben." }, { wenn: FERTIG, text: INSCHRIFT[i] }] })),
  /* Einsiedler: alt, ruhig, spricht in Bildern, war Kräuterlehrer im Tal, ging vor dreißig Jahren in die Berge. Mira: herzlich, gerade heraus, nennt ihn „den alten Sturkopf“. */
  dialoge: {
    einsiedler: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ah, ein Wanderer. Setz dich. Der See erzählt dir mehr als ich.",
          "Ich schreibe die Geschichte der Hochlande auf. Aber ich bin alt, und meine Knie sind älter. Mir fehlen Kräuter für den Winter – und Geschichten für das Buch."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Ah, ein Wanderer. Setz dich. Der See erzählt dir mehr als ich."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Drei neue Seiten. Und eine, die ich noch nicht schreiben kann – die Antwort an Mira.", "Der Kessel steht dir offen. Ein Kräuterkundiger sollte nicht ohne Kessel durch die Berge gehen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, offen: ["kraeuter"], anzahl: { g: "eisenhut", min: 3 } }, zeilen: ["Du riechst nach Schattenhang. Hast du, was ich brauche?"], antworten: ["kraeuter_geben", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du warst lange fort. Erzähl. Erst die Steine. Dann … dann das Tal."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["mira"] }, zeilen: ["Du warst im Tal? …Später. Erst das, worum ich dich gebeten habe."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Eisenhut und Nebelkraut, die Steinmänner am Grauhorn. Keine Eile. Die Berge laufen nicht weg."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich helfe dir. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Dann hör zu.", ...HILFE] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann ein andermal. Ich bin hier. Ich bin immer hier."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "kraeuter_geben", text: "Drei Eisenhut und drei Nebelkraut.", wenn: { anzahl: { g: "nebelkraut", min: 3 } }, folge: [{ f: { erledige: ["kraeuter"], nehmen: [{ g: "eisenhut", n: 3 }, { g: "nebelkraut", n: 3 }],
          zeilen: ["Der Einsiedler riecht an jedem Stängel, bevor er ihn auf die Leine hängt.", "Gut gewählt. Nicht zu jung, nicht zu alt. Wer hat dich das gelehrt?"] } }] },
        { id: "fertig", text: "Die Steinmänner – und ein Gruß von Mira.", folge: [{ f: { abschluss: true, zeilen: ["Er schreibt, während du erzählst. Ebert, der Hirte. Ilse und Marten. Die Wächterin vom Pass.",
          "Dann sagst du ihm, was Mira gesagt hat. Er legt die Feder hin.", "Dreißig Jahre. Und sie ist immer noch böse. …Gut. Das heißt, sie hat mich nicht vergessen.",
          "Mein Kessel steht dir offen. Und wenn du wieder ins Tal gehst – sag ihr, ich schreibe ihr. Irgendwann."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit den Steinen."] } }] },
      ],
    },
    mira: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["mira"] }, zeilen: ["Du warst in den Hochlanden? Ach, das hör ich an deinen Stiefeln. Was gibt's?"], antworten: ["gruss", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["mira"] }, zeilen: ["Und sag ihm, er soll Socken anziehen. Dort oben ist es kalt."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Er schreibt mir? Irgendwann? …Der alte Sturkopf. Dann warte ich halt noch ein bisschen."], antworten: ["tschuess"] },
        { zeilen: ["Na, brauchst du was aus dem Kessel?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "gruss", text: "Ein alter Mann am Spiegelsee hat von dir gesprochen. Ein Einsiedler.", folge: [{ f: { erledige: ["mira"],
          zeilen: ["Mira lässt den Löffel sinken.", "Am Spiegelsee? …Er lebt. Der alte Sturkopf lebt.",
          "Er hat mich alles gelehrt, was ich über Kräuter weiß. Dann ist er eines Morgens in die Berge gegangen. Ohne ein Wort. Dreißig Jahre.",
          "Sag ihm … sag ihm, ich bin ihm böse. Und dass mein Eisenhut besser wächst als seiner. Das wird ihn ärgern. Gut."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Pass auf dich auf, ja?"] } }] },
      ],
    },
  },
  schalter: { kessel_spiegelsee: FERTIG },
  glueckwunsch: "Drei Geschichten und ein Gruß. Das ist mehr, als mir in dreißig Jahren jemand gebracht hat. Danke.",
  belohnungText: "Belohnung: Kräuterkunde 2.500 XP, 300 Splitter · danach: der Kessel des Einsiedlers am Spiegelsee steht dir offen",
  belohnung: { berufe: { kraeuterkunde: 2500 }, splitter: 300 },
  punkte: 1,
};
