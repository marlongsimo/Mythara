/*
 * Mythara – Quest 03 „Der Säbel des Waldgottes“ (Nordwald, 25.11.2026): Einführung in die Berufe. Der Förster Hartwig schickt den Spieler
 * den Baum des Waldgottes fällen (Holzfällerei), den Waldstein abbauen (Bergbau), ihn an der Esse schmelzen und am Amboss mit dem Holz
 * zum Waldsäbel schmieden (Schmieden). Jeder Schritt gibt die XP seines Berufs; der Lohn ist der Säbel selbst (shared/gegenstaende.ts waldsaebel).
 * Nebenbei erzählt der Förster, was die Splitter sind: Scherben, die Wesen verändern und stärker machen – nicht besser.
 *
 * Seit 26.11.2026 eine Datei des Quest-Baukastens (shared/questbau.ts): nur Daten, kein eigener Code. Stand wie bisher „auftrag_N“
 * (Bit 1 Holz, 2 Erz, 4 Barren, 8 Säbel) – gespeicherte Stände gelten unverändert.
 */
import type { QuestDef, Bed, Folge } from "./questbau";

export const Q3 = "nordwald_waldsaebel";
const F = "Förster Hartwig";
const NEU: Bed = { phase: ["neu"] }, LAEUFT: Bed = { phase: ["laeuft"] }, FERTIG: Bed = { phase: ["fertig"] };
/** Werkzeug, das der Förster gibt, wenn man es (oder ein besseres) nicht hat */
const WERKZEUG: Folge["geben"] = [{ g: "holzbeil_training", name: "ein Trainings-Holzbeil", fehlt: true, gleich: "^holzbeil_" }, { g: "spitzhacke_training", name: "eine Trainings-Spitzhacke", fehlt: true, gleich: "^spitzhacke_" }, { g: "hammer", name: "einen Hammer", fehlt: true }];

const SPLITTER = ["Niemand weiß genau, woher sie kommen. Sie fielen in der Nacht, als der Himmel riss – Scherben von etwas sehr Großem. Manche so klein wie ein Fingernagel, manche größer als ein Haus.",
  "Wo sie in der Erde liegen, verändert sich, was dort lebt. Es wird stärker. Größer, zäher, hungriger.", "Aber nicht besser. Nie besser."];

export const QUEST3: QuestDef = {
  id: Q3, titel: "Der Säbel des Waldgottes", ort: "Einführung in die Berufe · Nordwald", geber: "foerster",
  start: "Sprich mit Förster Hartwig am Waldweg, gleich westlich der Waldmark, wo der Nordwald beginnt.",
  logNeu: "Förster Hartwig steht am Waldweg, gleich westlich der Waldmark, wo der Nordwald beginnt. Er sucht jemanden, der ihm hilft.",
  logFertig: "Du hast den Waldsäbel geschmiedet. Er trifft, was die Splitter verändert haben, härter – Waldgolems und Mooshocker.",
  logAbgabe: "Der Waldsäbel ist fertig. Zeig ihn Förster Hartwig am Waldweg westlich der Waldmark.",
  punkte: 1,
  glueckwunsch: "Der Säbel steht dir. Geh mit dem Wald – und lass die Eichen im Norden in Ruhe.",
  belohnungText: "Belohnung: der Gesegnete Waldsäbel (untauschbar, ab Geschick 5, +15 % Schaden gegen Waldwesen) und XP in Holzfällerei, Bergbau und Schmieden",
  figuren: [{ id: "foerster", name: F, modell: "npc.foerster", x: 6362.5, y: 6452.5, blick: [0, 1] }],
  schritte: [
    { id: "holz", text: "Den Baum des Waldgottes fällen", ereignis: { art: "sammeln", ziel: "waldgott" }, wo: [6350.5, 6442.5],
      log: "Fälle den Baum des Waldgottes nordwestlich des Försters." },
    { id: "erz", text: "Den Waldstein abbauen", ereignis: { art: "sammeln", ziel: "waldstein" }, wo: [6370.5, 6440.5],
      log: "Schlag ein Stück vom Waldstein nordöstlich des Försters ab." },
    { id: "barren", text: "Den Waldstein an der Esse schmelzen", ereignis: { art: "herstellen", rezept: "barren_waldstein" }, nach: ["erz"], wo: "esse",
      log: "Schmilz den Waldstein an der Esse in der Schmiede der Waldmark zu einem Barren." },
    { id: "saebel", text: "Am Amboss den Waldsäbel schmieden", ereignis: { art: "herstellen", rezept: "waldsaebel" }, nach: ["holz", "barren"], wo: "amboss",
      log: "Schmiede am Amboss aus dem Waldsteinbarren und dem Holz des Waldgottes den Waldsäbel. Ein Hammer muss im Rucksack sein." },
  ],
  /* Hartwig: ruhig, knapp, ein Mann, der mit Bäumen mehr redet als mit Menschen. Er erzählt nebenbei, was die Splitter sind – Scherben, die verändern,
     was in ihrer Nähe lebt: stärker, größer, hungriger. Nicht besser. Jeder Schritt hat seine eigene Begrüßung; „Wie war das noch?“ erklärt den Weg. */
  dialoge: { foerster: {
    reden: [
      { wenn: NEU, zeilen: ["Leise. Hörst du das?", "Nichts. Kein Specht, kein Häher, nicht einmal Mücken. So still war der Nordwald nie – nicht, bevor die Splitter gefallen sind."],
        antworten: ["wald", "splitter", "wer", "annehmen", "spaeter"] },
      { wenn: { ...FERTIG, verloren: "waldsaebel" }, zeilen: ["Du siehst aus, als hättest du etwas verloren."], antworten: ["verloren", "splitter", "tschuess"] },
      { wenn: FERTIG, zeilen: ["Der Säbel steht dir. Wenn dir ein Golem den Weg versperrt – denk daran, was er einmal war. Eine Eiche, die zu viel abbekommen hat."], antworten: ["splitter", "wer", "tschuess"] },
      { wenn: { ...LAEUFT, erledigt: ["saebel"], verloren: "waldsaebel" }, zeilen: ["Du hattest den Säbel schon geschmiedet – und jetzt ist er fort?"], antworten: ["verloren", "tschuess"] },
      { wenn: { ...LAEUFT, hat: "waldsaebel" }, zeilen: ["Warte. Ist das …?", "Zeig her."], antworten: ["zeigen", "tschuess"] },
      { wenn: { offen: ["holz", "erz"] }, zeilen: ["Der Baum des Waldgottes steht im Hain nordwestlich von hier – du erkennst ihn an den Adern, die unter der Rinde leuchten. Der Waldstein liegt nordöstlich, grün wie Moos."], antworten: ["hilfe", "werkzeug", "baum", "splitter", "tschuess"] },
      { wenn: { erledigt: ["holz"], offen: ["erz"] }, zeilen: ["Holz vom Waldgott. Ich rieche es von hier – wie Harz nach einem Gewitter.", "Jetzt noch der Waldstein, nordöstlich von hier. Schlag dir ein Stück ab."], antworten: ["hilfe", "werkzeug", "baum", "splitter", "tschuess"] },
      { wenn: { offen: ["holz"], erledigt: ["erz"] }, zeilen: ["Ein Stück Waldstein. Kühl, nicht wahr? Als hätte er nie Sonne gesehen.", "Fehlt noch ein Ast vom Baum des Waldgottes, nordwestlich im Hain."], antworten: ["hilfe", "werkzeug", "baum", "splitter", "tschuess"] },
      { wenn: { offen: ["barren"] }, zeilen: ["Holz und Stein, beides. Gut.", "Jetzt in die Schmiede der Waldmark, gleich östlich von hier. Erst an die Esse, den Stein schmelzen – dann an den Amboss."], antworten: ["hilfe", "werkzeug", "baum", "splitter", "tschuess"] },
      { zeilen: ["Der Barren ist geschmolzen? Dann an den Amboss mit dir. Barren und Holz zusammen, und den Hammer im Rucksack – der Rest ist Geduld."], antworten: ["hilfe", "werkzeug", "baum", "splitter", "tschuess"] },
    ],
    optionen: [
      { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ wenn: FERTIG, f: { zeilen: ["Geh mit dem Wald."] } }, { f: { zeilen: ["Pass auf dich auf. Und lass die Eichen im Norden in Ruhe, solange du kannst."] } }] },
      { id: "verloren", text: "Ich habe den Waldsäbel verloren.", folge: [
        { wenn: { ...FERTIG, verloren: "waldsaebel" }, f: { geben: [{ g: "waldsaebel", name: "den Gesegneten Waldsäbel", verloren: true }], zeilen: ["Verloren, ja? Seltsam. Heute früh lag er am Waldrand, mitten auf dem Weg – als hätte der Wald ihn mir zurückgebracht.", "Hier. Pass diesmal besser auf ihn auf."] } },
        { wenn: { ...LAEUFT, erledigt: ["saebel"], verloren: "waldsaebel" }, f: { vonVorn: true, geben: WERKZEUG, zeilen: ["Fort. Hm.", "Dann noch einmal von vorn. Der Baum gibt dir einen neuen Ast und der Stein ein neues Stück – sie wissen, dass ich dich schicke."] } }] },
      { id: "splitter", text: "Was sind diese Splitter?", folge: [
        { wenn: NEU, f: { weiter: true, zeilen: [SPLITTER[0], SPLITTER[1], SPLITTER[2]] } },
        { f: { weiter: true, zeilen: [...SPLITTER, "Ihr Wanderer sammelt sie, ich weiß. Manche sagen, sie machen auch euch stärker. Überleg dir gut, was du in dich hineinlässt."] } }] },
      { id: "wald", text: "Was ist mit dem Wald los?", wenn: NEU, folge: [{ f: { weiter: true, zeilen: ["Die alten Eichen im Norden stehen auf und gehen. Waldgolems nennen die Leute sie. Ich habe drei davon als Setzlinge gepflanzt.",
        "Und unten am Osthof die Mooshocker. Früher kaum größer als eine Katze – heute rollen sie sich zusammen und du hältst sie für einen Felsbrocken. Bis er dich beißt.",
        "Nur zwei Dinge hier haben die Splitter nie angenommen: den Baum des Waldgottes und den Waldstein. Was man daraus macht, trifft, was die Splitter verändert haben."] } }] },
      { id: "wer", text: "Wer bist du?", folge: [
        { wenn: FERTIG, f: { weiter: true, zeilen: ["Hartwig. Förster, wie mein Vater vor mir und dessen Vater davor.", "Und jetzt einer, der einem Wanderer gezeigt hat, wie man aus Holz und Stein eine Klinge macht. Hätte ich nicht gedacht."] } },
        { f: { weiter: true, zeilen: ["Hartwig. Förster, wie mein Vater vor mir und dessen Vater davor.", "Ich kenne jeden Baum zwischen der Waldmark und dem Nordsaum. Kannte. Manche stehen nicht mehr da, wo sie standen."] } }] },
      { id: "baum", text: "Was hat es mit dem Baum und dem Stein auf sich?", wenn: LAEUFT, folge: [{ f: { weiter: true, zeilen: ["Meine Großmutter sagte, der Waldgott habe den Baum als Merkzeichen gesetzt – damit der Wald nicht vergisst, wie er einmal war.",
        "Und der Waldstein ist das Gegenstück: kühl, grün, still. Die Splitter gleiten an beiden ab wie Regen an Wachs.", "Zusammen ergeben sie eine Klinge, die trifft, was die Splitter verändert haben. Als würde der Wald zurückschlagen."] } }] },
      { id: "hilfe", text: "Wie war das noch mal?", wenn: LAEUFT, folge: [{ f: { weiter: true, zeilen: ["Der Reihe nach:",
        "Mit dem Beil einen Ast vom Baum des Waldgottes, nordwestlich im Hain. Das ist Holzfällerei.", "Mit der Spitzhacke ein Stück vom Waldstein, nordöstlich von hier. Das ist Bergbau.",
        "In der Schmiede der Waldmark, östlich: an der Esse den Stein zu einem Barren schmelzen, dann am Amboss Barren und Holz zum Säbel schmieden. Das ist Schmieden – und dafür brauchst du einen Hammer im Rucksack.",
        "Dann bring mir den Säbel. Und jeder Schritt lehrt dich etwas – das wirst du merken."] } }] },
      { id: "annehmen", text: "Kann ich dir helfen? (Quest annehmen)", wenn: NEU, folge: [{ f: { start: true, geben: WERKZEUG, zeilen: ["Du? Hm. Du hast ruhige Hände. Das reicht.",
        "Nordwestlich von hier, im Hain, steht der Baum des Waldgottes – der mit den leuchtenden Adern. Nimm dir einen Ast. Er lässt es zu, wenn ich dich schicke.",
        "Nordöstlich liegt der Waldstein, grün wie Moos. Schlag dir ein Stück davon ab.",
        "Den Stein schmilzt du an der Esse in der Schmiede der Waldmark, und am Amboss schmiedest du aus Barren und Holz einen Säbel. Was dir an Werkzeug fehlt, gebe ich dir."] } }] },
      { id: "spaeter", text: "Jetzt nicht.", wenn: NEU, folge: [{ f: { zeilen: ["Wie du meinst. Ich bin hier. Der Wald läuft nicht weg.", "…Na ja. Die meisten Bäume jedenfalls nicht."] } }] },
      { id: "werkzeug", text: "Mir fehlt Werkzeug.", wenn: LAEUFT, folge: [{ f: { weiter: true, geben: WERKZEUG, zeilen: ["Hier, aus meinem Schuppen. Pass gut darauf auf."], nichtsZuGeben: ["Du hast doch alles, was du brauchst. Beil, Spitzhacke, Hammer – los."] } }] },
      { id: "zeigen", text: "Den Waldsäbel zeigen.", wenn: { ...LAEUFT, hat: "waldsaebel" }, folge: [{ f: { abschluss: true, zeilen: ["Leicht gebogen. Die Klinge grün wie Moos nach Regen, und der Griff … warm. Er ist warm.",
        "Gute Arbeit. Wirklich gute Arbeit.",
        "Er gehört dir – und nur dir. Kein Händler wird ihn kaufen, und in fremden Händen ist er nur ein Stück Metall.",
        "Gegen Waldgolems und Mooshocker beißt er tiefer als jede andere Klinge deiner Stufe. Und wenn du mehr Splitter findest … denk an die Eichen. Stärker ist nicht dasselbe wie besser."] } }] },
    ] } },
  /* Baum und Waldstein (Sammeln) und Esse/Amboss (Schmieden): nur mit dem Auftrag, jeweils solange der Schritt noch offen ist */
  sperren: {
    sammeln: {
      waldgott: [{ wenn: FERTIG, text: "Der Baum hat dir gegeben, was du brauchtest. Die Adern unter der Rinde leuchten ruhig." },
        { wenn: NEU, text: "Ein uralter Baum, an dem kein Splitter haftet. Ohne Erlaubnis des Försters legst du hier kein Beil an – Förster Hartwig steht gleich südöstlich am Weg." },
        { wenn: { erledigt: ["holz"] }, text: "Du hast schon einen Ast vom Baum des Waldgottes – mehr braucht es nicht." },
        { wenn: { hat: "holz_waldgott" }, text: "Du hast schon einen Ast vom Baum des Waldgottes – mehr braucht es nicht." }],
      waldstein: [{ wenn: FERTIG, text: "Der Waldstein liegt still da. Du hast dein Stück schon bekommen." },
        { wenn: NEU, text: "Ein grünlicher Fels, an dem kein Splitter haftet. Förster Hartwig, gleich südwestlich am Weg, weiß mehr darüber." },
        { wenn: { erledigt: ["erz"] }, text: "Du hast schon ein Stück Waldstein – mehr braucht es nicht." },
        { wenn: { hat: "erz_waldstein" }, text: "Du hast schon ein Stück Waldstein – mehr braucht es nicht." }],
    },
    herstellen: {
      barren_waldstein: [{ wenn: { phase: ["neu", "fertig"] }, text: "Das kannst du nur im Auftrag von Förster Hartwig herstellen." }, { wenn: { erledigt: ["barren"] }, text: "Den Waldstein hast du schon geschmolzen." }],
      waldsaebel: [{ wenn: { phase: ["neu", "fertig"] }, text: "Das kannst du nur im Auftrag von Förster Hartwig herstellen." }, { wenn: { erledigt: ["saebel"] }, text: "Den Waldsäbel hast du schon geschmiedet." }],
    },
  },
};
