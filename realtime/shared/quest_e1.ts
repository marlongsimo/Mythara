/*
 * Riftmere – Quest E1 „Der Weg nach Grauwacht“ (Phase 8), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-8.md. Merit Stahl (Graufurt) schickt dich nach D2 los: „Ysolde sagt, niemand antwortet mehr. Dann gehen wir hin.“
 * Die Fahlen Weiten sind auch vorher zu Fuß erreichbar (durch den Wald, Entscheidung des Nutzers 26.11.) – E1 öffnet nur die Abkürzung: den Dornenwall
 * am alten Weg im Nordsaum (drei Ranken). In Heidrast Hirtin Mette Heider, der Rudelführer der Heidewölfe, die Abtei: Äbtissin Gunhild.
 * Lohn: Holzfällerei 800, Stärke 800, Defense 800 XP, 300 Splitter, 2 Questpunkte. Schalter dornenwall_offen (Abkürzung offen, je Spieler), grauwacht_stufe1 (Abtei bewohnt);
 * Wegstein-Ziel Heidrast. Alle Namen sind Vorschläge.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 8 (Welt: Fahle Weiten, Heidrast, Abtei; Figuren: Mette, Gunhild; Gegner heidewolf_rudelfuehrer).
 * Stellen aus der Welt (#50, shared/quest_e_orte.ts). Liste: doku/quests/e-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { D2 } from "./quest_d2";
import { DORNEN, MERIT, HEIDRAST, RUDEL, ABTEI } from "./quest_e_orte";

export const E1 = "grauwacht_der_weg";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const RANKEN = ["dornen_1", "dornen_2", "dornen_3"];
const HILFE = ["Der alte Weg nach Norden, am Uferweg im Nordsaum. Seit Jahren zugewachsen. Durch den Wald kommst du auch hin, aber das dauert. Schlag den Weg frei – drei Ranken, so dick wie ein Arm.",
  "Im Norden liegen die Fahlen Weiten. In Heidrast wohnen noch Hirten. Frag dort nach dem Weg.", "Und dann Grauwacht. Wenn da noch jemand ist, sag ihnen: Graufurt steht noch."];

export const QUEST_E1: QuestDef = {
  id: E1, titel: "Der Weg nach Grauwacht", ort: "Graufurt · Nordsaum · Fahle Weiten", start: "Sprich mit Hauptfrau Merit Stahl vor dem Bergfried in Graufurt.",
  logNeu: "Seit Ysolde gesprochen hat, steht Hauptfrau Merit Stahl jeden Abend auf dem Bergfried von Graufurt und schaut nach Norden.",
  logAngeboten: "Merit Stahl in Graufurt will wissen, warum Grauwacht schweigt.",
  logAbgabe: "Du hast die Abtei von Grauwacht erreicht. Sprich mit Äbtissin Gunhild.",
  logFertig: "Der alte Weg durch den Nordsaum ist wieder offen. In der Abtei halten Äbtissin Gunhild und drei Nonnen aus – die Wacht ist nicht ganz tot.",
  geber: "merit", abgabe: "gunhild",
  figuren: [
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
    { id: "mette", name: "Mette Heider", modell: "npcfrau3d", x: HEIDRAST.mette[0], y: HEIDRAST.mette[1], blick: [0, 1] },
    { id: "gunhild", name: "Äbtissin Gunhild", modell: "npcfrau3d", x: ABTEI.gunhild[0], y: ABTEI.gunhild[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Das grüne Licht“ abgeschlossen", wenn: { quest: { id: D2, phase: ["fertig"] } } },
    { text: "Holzfällerei 40", wenn: { skill: { k: "holzfaellerei", min: 40 } } },
  ],
  schritte: [
    ...RANKEN.map((id, i) => ({ id, text: "Den Dornenwall im Nordsaum roden", ereignis: { art: "objekt" as const, id: "e1_" + id }, gruppe: "dornen", wo: DORNEN[i],
      log: "Schlag den alten Weg am Uferweg im Nordsaum frei – drei Dornenranken, mit einem Holzbeil ({n:dornen}). Er ist der kürzeste Weg nach Norden." })),
    { id: "mette", text: "In Heidrast nach dem Weg fragen", ereignis: { art: "antwort" }, bei: "mette",
      log: "Im Norden liegen die Fahlen Weiten. Frag in Heidrast, der Hirtensiedlung, nach dem Weg nach Grauwacht." },
    { id: "rudel", text: "Den Rudelführer der Heidewölfe besiegen", ereignis: { art: "erlegen", typ: "heidewolf_rudelfuehrer" }, nach: ["mette"], wo: RUDEL,
      log: "Ein Wolfsrudel liegt zwischen Heidrast und Grauwacht. Besieg den Rudelführer – er kommt nicht allein." },
  ],
  objekte: RANKEN.map((id, i) => ({ id: "e1_" + id, name: "Dornenranke", x: DORNEN[i][0], y: DORNEN[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Die Ranke roden", weit: 2.5,
    braucht: { wenn: { skill: { k: "holzfaellerei", min: 40 } }, text: "Dornen, so dick wie ein Arm. Dafür braucht es ein scharfes Beil und eine geübte Hand (Holzfällerei 40)." },
    text: "Du hackst dich durch die Ranke. Dornen reißen an deinem Ärmel, dann gibt sie nach. Dahinter läuft der alte Weg schnurgerade nach Norden ({n:dornen}).",
    schon: "Hier ist der Weg frei.", sonst: [{ wenn: NEU, text: "Ein Dornenwall, mannshoch, quer über dem alten Weg. Wer nach Norden will, muss außen herum durch den Wald." }, { wenn: FERTIG, text: "Der alte Weg ist frei." }] })),
  /* Merit: Hauptfrau, förmlich, aber jetzt ungeduldig. Mette: Hirtin, wettergegerbt, trocken, redet mit ihren Schafen mehr als mit Leuten.
     Gunhild: Äbtissin, ruhig, unbeugsam, hat zu lange allein ausgehalten, um noch zu jammern. */
  dialoge: {
    merit: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ysolde sagt, niemand antwortet mehr. Dann gehen wir hin.", "Ich kann den Bergfried nicht verlassen. Aber du kannst."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Gunhild lebt? Und hält die Abtei? …Dann gibt es noch eine Wacht. Zwei Hauptfrauen und drei Nonnen. Immerhin."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: RANKEN }, zeilen: ["Der alte Weg ist frei? Dann geh. Und schreib, wenn du kannst."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der alte Weg am Uferweg im Nordsaum. Schlag ihn frei – dann sind die Weiten nur noch einen Fußmarsch entfernt."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gehe nach Grauwacht. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Der alte Weg führt vom Uferweg im Nordsaum nach Norden. Zugewachsen, seit Jahren – wer heute hinwill, schlägt sich durch den Wald.",
          "Schlag ihn frei, dann ist Grauwacht für uns wieder nah. Und finde heraus, warum die Glocke schweigt."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Sie haben Jahre geschwiegen. Ein paar Tage mehr ändern nichts. Hoffe ich."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
    mette: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["mette"] }, zeilen: ["Von Süden? Aus Graufurt? Da ist seit zehn Jahren keiner hergekommen.", "Was willst du hier draußen, außer frieren?"], antworten: ["weg_fragen"] },
        { wenn: { ...LAEUFT, erledigt: ["rudel"] }, zeilen: ["Der Graue ist tot? Der Rudelführer? Dann schlafen meine Schafe heut Nacht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["mette"] }, zeilen: ["Die Wölfe. Erst die Wölfe, dann Grauwacht. Anders kommst du nicht hin."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Na. Die Wölfe sind leiser seitdem. Die Toten nicht."], antworten: ["tschuess"] },
        { zeilen: ["Mette Heider. Hirtin. Mehr gibt's nicht zu wissen.", "Mäh."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "weg_fragen", text: "Ich suche den Weg nach Grauwacht.", folge: [{ f: { erledige: ["mette"], zeilen: ["Grauwacht? Hm. Nach Norden, immer dem Wind entgegen. Den Turm siehst du, wenn's klar ist.",
          "Aber dazwischen liegt ein Rudel. Heidewölfe. Ihr Führer ist ein grauer Riese, der holt mir jede Woche ein Schaf.",
          "Und nachts … nachts wandern Tote über die Heide. Seit die Glocke schweigt. Glaub's oder nicht."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Halt den Wind im Rücken."] } }] },
      ],
    },
    gunhild: {
      reden: [
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ein Gesicht von draußen. Das letzte war ein Wolf.", "Wer schickt dich?"], antworten: ["graufurt"] },
        { wenn: FERTIG, zeilen: ["Die Abtei hält. Wir halten. Aber die Glocke … die Glocke ist gesprungen."], antworten: ["tschuess"] },
        { zeilen: ["Die Pforte der Abtei bleibt zu, solange draußen Wölfe heulen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "graufurt", text: "Merit Stahl aus Graufurt. Graufurt steht noch.", folge: [{ f: { abschluss: true, zeilen: ["Gunhild schließt die Augen. Sie sagt eine Weile nichts.",
          "Graufurt steht. Und hier stehen wir: drei Schwestern und ich. Die Wacht hat uns vergessen, als die Glocke sprang. Oder wir sie.",
          "Bleib. Iss etwas. Und dann reden wir über die Glocke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit dem Wind."] } }] },
      ],
    },
  },
  schalter: { dornenwall_offen: [FERTIG, { erledigt: RANKEN }], grauwacht_stufe1: FERTIG },
  belohnungText: "Belohnung: Holzfällerei 800, Stärke 800, Defense 800 XP, 300 Splitter · danach: der alte Weg durch den Nordsaum ist offen (Abkürzung), Wegstein-Ziel Heidrast, die Abtei ist bewohnt",
  belohnung: { xp: { staerke: 800, defense: 800 }, berufe: { holzfaellerei: 800 }, splitter: 300 },
  punkte: 2,
};
