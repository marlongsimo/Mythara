/*
 * Riftmere – Phase 8, zwei kleine Nebenquests in den Fahlen Weiten, Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-8.md („Nebenquests (klein)“).
 * „Mettes Schafe“ (QUER: Ringelblume aus den Obstwiesen): Hirtin Mette Heider in Heidrast – fünf Heidewölfe, aus dem gerissenen Schaf einen Hammeleintopf am Herd der Abteiküche (Heidrast hat keinen Herd).
 * „Ruhelose Gräber“: Äbtissin Gunhild – drei Grablichter einfangen (Splitterbinden 35) und in den drei Grabkammern zur Ruhe legen.
 *
 * Stellen aus der Welt (#50, shared/quest_e_orte.ts). Im Spiel (shared/quests.ts) seit 27.11. (a34079ee). Liste: doku/quests/e-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { E1 } from "./quest_e1";
import { HEIDRAST, HEIDE, ABTEI, GRAEBER } from "./quest_e_orte";

const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const NACH_E1 = { text: "„Der Weg nach Grauwacht“ abgeschlossen", wenn: { quest: { id: E1, phase: ["fertig"] as ("fertig")[] } } };

export const SCHAFE = "heidrast_mettes_schafe";
export const QUEST_SCHAFE: QuestDef = {
  id: SCHAFE, titel: "Mettes Schafe", ort: "Heidrast · Fahle Weiten", start: "Sprich mit Mette Heider am Schafpferch in Heidrast.",
  logNeu: "Am Schafpferch in Heidrast zählt eine Hirtin ihre Schafe. Zweimal. Es fehlt immer eins.",
  logAngeboten: "Mette Heider in Heidrast würde dir von ihren Schafen erzählen.",
  logAbgabe: "Bring Mette Heider den Hammeleintopf.",
  logFertig: "Die Heidewölfe meiden Heidrast, und Mette Heider kocht dir einen Hammeleintopf, wenn du vorbeikommst.",
  geber: "mette",
  figuren: [{ id: "mette", name: "Mette Heider", modell: "npcfrau3d", x: HEIDRAST.mette[0], y: HEIDRAST.mette[1], blick: [0, 1] }],
  voraussetzungen: [NACH_E1, { text: "Kochen 30", wenn: { skill: { k: "kochen", min: 30 } } }],
  schritte: [
    { id: "woelfe", text: "Fünf Heidewölfe besiegen", ereignis: { art: "erlegen", typ: "heidewolf" }, anzahl: 5, wo: HEIDE,
      log: "Besieg auf der Heide um Heidrast fünf Heidewölfe ({n:woelfe}). Sie jagen zu dritt." },
    { id: "fleisch", text: "Das gerissene Schaf von Mette holen", ereignis: { art: "antwort" }, nach: ["woelfe"], bei: "mette",
      log: "Die Wölfe sind fort. Geh zurück zu Mette." },
    { id: "eintopf", text: "Einen Hammeleintopf kochen", ereignis: { art: "herstellen", rezept: "hammeleintopf" }, nach: ["fleisch"], wo: ABTEI.kueche,
      log: "Koch am Herd der Abteiküche in Grauwacht einen Hammeleintopf – mit einer Ringelblume aus den Obstwiesen als Würze, wie Mette es will." },
  ],
  dialoge: {
    mette: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Dreiundvierzig. Gestern waren's vierundvierzig.", "Die Wölfe holen mir jede Nacht eins. Der Rudelführer ist tot, ja – aber sein Rudel hat Hunger."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Mäh. …Das war ein Schaf, nicht ich."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Vierundvierzig. Seit Tagen. Hunger? Der Topf steht auf dem Herd."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "hammeleintopf" }, zeilen: ["Riecht nach Ringelblume. Wie bei meiner Mutter."], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gekocht hast du? Und gegessen auch, wie's aussieht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["fleisch"] }, zeilen: ["Der Herd in der Abtei ist warm. Einen Eintopf. Ich hab seit Wochen nichts Warmes gegessen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["woelfe"] }, zeilen: ["Fünf? Hab sie heulen hören, dann nicht mehr. Gut.", "Eins haben sie mir heut Nacht noch geholt. Liegt hinten. Wär schade drum."], antworten: ["fleisch_nehmen"] },
        { zeilen: ["Die Wölfe. Draußen auf der Heide. Fünf, dann reden wir."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich halte dir die Wölfe vom Leib. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Fünf Stück. Dann trauen sie sich nicht mehr her. Wölfe zählen auch."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Zweiundvierzig, morgen."] } }] },
        { id: "fleisch_nehmen", text: "Das Schaf nehmen.", folge: [{ f: { erledige: ["fleisch"], geben: [{ g: "hammelfleisch", name: "Hammelfleisch" }],
          zeilen: ["Hier. Bring's den Schwestern in der Abtei, die haben einen Herd. Ein Eintopf draus. Mehr will ich nicht. Nur was Warmes.", "Und tu eine Ringelblume rein. Aus den Obstwiesen, im Süden. Meine Mutter kam von dort. Ohne schmeckt's nach nichts."] } }] },
        { id: "abgeben", text: "Den Eintopf geben.", wenn: { hat: "hammeleintopf" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "hammeleintopf" }],
          zeilen: ["Mette isst schweigend. Dann noch einmal.", "…Gut. Komm wieder, wenn du Hunger hast. Ich koch dann. Schlechter als du, aber ich koch."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Halt den Wind im Rücken."] } }] },
      ],
    },
  },
  glueckwunsch: "Der Eintopf ist gut, und die Wölfe sind fort. Mehr braucht Heidrast nicht.",
  belohnungText: "Belohnung: Kochen 600, Stärke 300 XP, 150 Splitter",
  belohnung: { xp: { staerke: 300 }, berufe: { kochen: 600 }, splitter: 150 },
  punkte: 1,
};

export const GRAEBER_ID = "grauwacht_ruhelose_graeber";
const KAMMERN = ["kammer_1", "kammer_2", "kammer_3"];
export const QUEST_GRAEBER: QuestDef = {
  id: GRAEBER_ID, titel: "Ruhelose Gräber", ort: "Grauwacht · Hügelgräber", start: "Sprich mit Äbtissin Gunhild in der Abtei von Grauwacht.",
  logNeu: "In den kleinen Grabkammern der Hügelgräber flackern Lichter. Die Schwestern der Abtei sagen, das sind die, die keine Ruhe finden.",
  logAngeboten: "Äbtissin Gunhild sucht jemanden, der mit Lichtern umgehen kann.",
  logAbgabe: "Die drei Grabkammern sind still. Sag es Äbtissin Gunhild.",
  logFertig: "In den drei kleinen Grabkammern brennt kein Licht mehr. Die Schwestern beten dort jetzt für die Wacht.",
  geber: "gunhild",
  figuren: [{ id: "gunhild", name: "Äbtissin Gunhild", modell: "npcfrau3d", x: ABTEI.gunhild[0], y: ABTEI.gunhild[1], blick: [0, 1] }],
  voraussetzungen: [NACH_E1, { text: "Splitterbinden 35", wenn: { skill: { k: "splitterbinden", min: 35 } } }],
  schritte: [
    { id: "lichter", text: "Drei Grablichter einfangen", ereignis: { art: "sammeln", ziel: "grablicht" }, anzahl: 3, wo: GRAEBER.feld,
      log: "Fang an den Hügelgräbern drei Grablichter ein ({n:lichter})." },
    ...KAMMERN.map((id, i) => ({ id, text: "Die drei Grabkammern zur Ruhe legen", ereignis: { art: "objekt" as const, id: "eg_" + id }, nach: ["lichter"], gruppe: "kammern", wo: GRAEBER.kammern[i],
      log: "Leg in jeder der drei kleinen Grabkammern ein Grablicht auf den Stein ({n:kammern})." })),
  ],
  objekte: KAMMERN.map((id, i) => ({ id: "eg_" + id, name: "Grabstein", x: GRAEBER.kammern[i][0], y: GRAEBER.kammern[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Das Licht ablegen", weit: 2.5,
    braucht: { wenn: { hat: "grablicht" }, text: "Ein kalter Grabstein. Gunhild sagt, ein Licht darauf bringt Ruhe." }, nehmen: [{ g: "grablicht" }],
    text: "Du legst das Licht auf den Stein. Es flackert, wird ruhig, erlischt. Die Kälte in der Kammer lässt nach ({n:kammern}).",
    schon: "Hier ist es still.", sonst: [{ wenn: NEU, text: "Ein kalter Grabstein. Ein Licht schwebt darüber und will nicht gehen." }, { wenn: FERTIG, text: "Hier ist es still." },
      { wenn: { offen: ["lichter"] }, text: "Ein kalter Grabstein. Erst brauchst du Grablichter." }] })),
  dialoge: {
    gunhild: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["In den kleinen Gräbern brennen Lichter. Die Toten dort sind keine Wiedergänger, nur … unruhig.",
          "Du kannst Lichter fangen, sagt man. Bring jedem von ihnen eins zurück. Dann schlafen sie."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Abtei hält."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Schwestern beten jetzt in den Kammern. Es ist ruhig dort. Ruhiger als hier."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Still? Alle drei?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["lichter"] }, zeilen: ["Drei Lichter. Jetzt in jede Kammer eins. Auf den Stein."], antworten: ["tschuess"] },
        { zeilen: ["Grablichter schweben über den Hügeln, nachts am hellsten."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe ihnen Ruhe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Drei Lichter, drei Kammern. Und sei leise dabei."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Sie warten. Sie sind gut im Warten."] } }] },
        { id: "fertig", text: "Alle drei Kammern sind still.", folge: [{ f: { abschluss: true, zeilen: ["Gunhild schlägt das Zeichen der Wacht.", "Danke. Die Schwestern werden für dich beten. Ob du willst oder nicht."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit dem Wind."] } }] },
      ],
    },
  },
  /* Grablichter geben den Questgegenstand grablicht, solange die Quest läuft (server/src/lichter.ts, höchstens 3 im Rucksack) */
  beute: { graeber_grablicht: { phase: ["laeuft"] } },
  glueckwunsch: "Die Toten schlafen. Und wir auch, endlich.",
  belohnungText: "Belohnung: Splitterbinden 800 XP, 200 Splitter",
  belohnung: { berufe: { splitterbinden: 800 }, splitter: 200 },
  punkte: 1,
};
