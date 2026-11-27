/*
 * Riftmere – Quest S5 „Die Furt“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Schmied Kuno Lehm in Lehmfurt: Das Hochwasser hat die Trittsteine durch die Furt über den Kiel fortgespült.
 * Im Steinbruch Blöcke brechen (Bergbau 15) und fünf Trittsteine in die Furt setzen → Abkürzung über den Kiel (Schalter lehmfurt_trittsteine).
 * Offene Welt: Der Kiel ist auch vorher über die Straße zu queren, die Furt ist nur kürzer. Keine neuen Gegenstände: Die Blöcke sind Questobjekte.
 * Lohn: Bergbau 500 XP, 3 Eisenbarren, 80 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. Stellen aus der Welt (#120), Figuren vorläufig bis #121. Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { LEHMFURT, KUNO } from "./quest_s_orte";

export const S5 = "lehmfurt_die_furt";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const STEINE = ["stein_1", "stein_2", "stein_3", "stein_4", "stein_5"];
const HILFE = ["Steinbruch. Fünf Blöcke.", "Furt. Fünf Steine. Einer nach dem anderen, vom Ufer aus.", "Dann rüber. Trocken."];

export const QUEST_S5: QuestDef = {
  id: S5, titel: "Die Furt", ort: "Lehmfurt am Kiel", start: "Sprich mit Kuno Lehm vor der Schmiede in Lehmfurt.",
  logNeu: "In Lehmfurt am Kiel steht ein Schmied am Ufer und sieht ins Wasser, wo früher Trittsteine lagen.",
  logAngeboten: "Kuno Lehm in Lehmfurt will die Trittsteine in der Furt zurück.",
  logAbgabe: "Die Trittsteine liegen. Sag Kuno Lehm Bescheid.",
  logFertig: "Über die Furt in Lehmfurt kommst du trockenen Fußes über den Kiel – der kürzeste Weg nach Süden.",
  geber: "kuno",
  figuren: [KUNO],
  voraussetzungen: [{ text: "Bergbau 15", wenn: { skill: { k: "bergbau", min: 15 } } }],
  schritte: [
    { id: "bruch", text: "Im Steinbruch Blöcke brechen", ereignis: { art: "objekt", id: "s5_bruch" }, wo: LEHMFURT.bruch,
      log: "Brich im Steinbruch von Lehmfurt fünf Blöcke für die Trittsteine." },
    ...STEINE.map((id, i) => ({ id, text: "Trittsteine in die Furt setzen", ereignis: { art: "objekt" as const, id: "s5_" + id }, gruppe: "steine", nach: i === 0 ? ["bruch"] : ["bruch", STEINE[i - 1]],
      wo: LEHMFURT.steine[i], log: "Setz die Trittsteine in die Furt, einen nach dem anderen vom Ufer aus ({n:steine})." })),
  ],
  objekte: [
    { id: "s5_bruch", name: "Steinbruch", x: LEHMFURT.bruch[0], y: LEHMFURT.bruch[1], modell: "stelle", tat: "benutzen", tatText: "Blöcke brechen", weit: 3,
      braucht: { wenn: { skill: { k: "bergbau", min: 15 } }, text: "Fester Fels. Ohne Bergbau 15 brichst du dir hier nur die Hacke." },
      text: "Fünf Blöcke, kantig und schwer. Du rollst sie ans Ufer.", schon: "Die Blöcke liegen am Ufer.",
      sonst: [{ wenn: NEU, text: "Ein Steinbruch am Hang." }, { wenn: FERTIG, text: "Ein Steinbruch am Hang." }] },
    ...STEINE.map((id, i) => ({ id: "s5_" + id, name: "Leere Stelle in der Furt", x: LEHMFURT.steine[i][0], y: LEHMFURT.steine[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Den Stein setzen", weit: 3,
      text: i < 4 ? "Platsch. Der Stein sitzt. Der nächste ({n:steine})." : "Der letzte Stein. Das Wasser rauscht jetzt um fünf Rücken herum ({n:steine}).",
      schon: "Ein Trittstein, fest im Kiesbett.", sonst: [{ wenn: NEU, text: "Flaches Wasser über Kies." }, { wenn: FERTIG, text: "Ein Trittstein, fest im Kiesbett." },
        { wenn: { offen: ["bruch"] }, text: "Flaches Wasser. Erst Blöcke aus dem Steinbruch." }, { wenn: { offen: i === 0 ? ["bruch"] : [STEINE[i - 1]] }, text: "Zu weit vom Ufer. Erst den Stein davor." }] })),
  ],
  /* Kuno: wortkarg. Ein Wort, wo andere zehn brauchen. Lacht nie, nickt viel. */
  dialoge: {
    kuno: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Steine. Weg.", "Hochwasser."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Hacke. Erst lernen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Trocken.", "…Gut."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Fünf."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["stein_1"] }, zeilen: ["Weiter."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["bruch"] }, zeilen: ["Blöcke. Gut. Ins Wasser."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Steinbruch. Da."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich setze neue Steine. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut.", "Fünf Blöcke. Steinbruch. Dann Furt."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Hm."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Die Trittsteine liegen.", folge: [{ f: { abschluss: true, zeilen: ["Kuno geht hinüber. Und zurück. Und noch einmal.",
          "Trocken.", "Eisen. Für dich."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
  },
  schalter: { lehmfurt_trittsteine: FERTIG },
  glueckwunsch: "Trocken. …Gut.",
  belohnungText: "Belohnung: Bergbau 500 XP, 3 Eisenbarren, 80 Splitter · danach: Abkürzung durch die Furt über den Kiel",
  belohnung: { berufe: { bergbau: 500 }, splitter: 80, gegenstaende: [{ g: "barren_eisen", n: 3 }] },
  punkte: 1,
};
