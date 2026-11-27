/*
 * Riftmere – Quest B3 „Fallobst“ (Phase 4), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/2-hinter-der-sperre.pdf (Seite 6), doku/konzepte/phase-4.md. Gisbert Ast (Obstwiesen), Othmar Rehn (Weidenhain).
 * Drei Spuren an Gisberts leeren Kisten, fünf Banditen-Späher in der Westmark, der Karrenbrief („an R., Westmark, bei den Fässern“),
 * die gestohlenen Kisten an der verlassenen Hütte – ab hier ist die Leiter in den Unterschlupf offen –, Kisten zu Gisbert, Othmar liest den Brief.
 * Lohn: Fernkampf 500, Geschick 300, LP 200, 10 Äpfel, 120 Splitter, 1 Questpunkt. Danach verkauft Gisbert Äpfel.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Issue #15 (Gegner bandit_spaeher, bedingte Beute b3_karrenbrief, Gegenstände, Schalter)
 * und darauf, dass eine Figur in mehreren Quests sprechen kann (Othmar gehört heute Quest 1). Liste: doku/quests/b3-b4-bausteine.md.
 * Orte: Issue #21 (Welt, 81778e67).
 */
import type { QuestDef, Bed } from "./questbau";

export const B3 = "obstwiesen_fallobst";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const SPUREN = [[6550.5, 6700.5], [6541.5, 6711.5], [6533.5, 6722.5]] as const;
const LAGER: [number, number] = [6284.5, 6553.5], KISTEN: [number, number] = [6305.6, 6586.6];
const SP = ["spur_stiefel", "spur_karren", "spur_apfel"];
const HILFE = ["Drei Spuren hier bei den Kisten, Richtung Westen. Schau sie dir an.",
  "Dann in die Westmark. Da laufen Kerle mit Schleudern rum, die gehören da nicht hin. Einer von denen weiß, wo meine Äpfel sind.",
  "Und wenn du sie findest – bring sie mir. Alle drei Kisten. Die sind vom Großvater."];

export const QUEST_B3: QuestDef = {
  id: B3, titel: "Fallobst", ort: "Obstwiesen · Westmark · Weidenhain", start: "Sprich mit Gisbert Ast bei seinen leeren Apfelkisten in den Obstwiesen.",
  logNeu: "In den Obstwiesen steht ein Bauer vor drei leeren Kisten und kratzt sich am Kopf.",
  logAngeboten: "Gisbert Ast in den Obstwiesen fehlen drei Kisten Äpfel. Er hofft noch auf dich.",
  logAbgabe: "Gisbert hat seine Kisten. Bring den Karrenbrief zu Othmar Rehn in Weidenhain – „an R.“ muss jemand lesen, der die Gegend kennt.",
  logFertig: "Othmar Rehn hat den Karrenbrief gelesen: „R.“ ist Hauptmann Rotmantel, und er lebt. Gisbert Ast verkauft wieder Äpfel.",
  geber: "gisbert", abgabe: "othmar",
  figuren: [
    { id: "gisbert", name: "Gisbert Ast", modell: "npc.gisbert", x: 6562.5, y: 6691.5, blick: [1, 0] },
    { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] },
  ],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Heldenlevel 15", wenn: { heldenlevel: 15 } },
  ],
  schritte: [
    { id: "spur_stiefel", text: "Drei Spuren bei den Kisten untersuchen", ereignis: { art: "objekt", id: "b3_stiefel" }, gruppe: "spuren", wo: [SPUREN[0][0], SPUREN[0][1]],
      log: "Untersuch die drei Spuren bei Gisberts leeren Kisten ({n:spuren})." },
    { id: "spur_karren", text: "Drei Spuren bei den Kisten untersuchen", ereignis: { art: "objekt", id: "b3_karren" }, gruppe: "spuren", wo: [SPUREN[1][0], SPUREN[1][1]],
      log: "Untersuch die drei Spuren bei Gisberts leeren Kisten ({n:spuren})." },
    { id: "spur_apfel", text: "Drei Spuren bei den Kisten untersuchen", ereignis: { art: "objekt", id: "b3_apfel" }, gruppe: "spuren", wo: [SPUREN[2][0], SPUREN[2][1]],
      log: "Untersuch die drei Spuren bei Gisberts leeren Kisten ({n:spuren})." },
    { id: "spaeher", text: "Fünf Banditen-Späher besiegen", ereignis: { art: "erlegen", typ: "bandit_spaeher" }, anzahl: 5, nach: SP, wo: LAGER,
      log: "Folg der Spur in die Westmark und besieg fünf Banditen-Späher ({n:spaeher}). Vorsicht: Sie fliehen zu ihren Kumpanen." },
    { id: "brief", text: "Den Karrenbrief an dich nehmen", ereignis: { art: "aufheben", g: "karrenbrief" }, nach: SP, wo: LAGER,
      log: "Einer der Späher trägt etwas Geschriebenes bei sich. Nimm es an dich." },
    { id: "kisten", text: "Die gestohlenen Kisten an der Hütte finden", ereignis: { art: "objekt", id: "b3_kisten" }, nach: ["brief"], wo: KISTEN,
      log: "„An R., Westmark, bei den Fässern.“ Such hinter den Fässern an der verlassenen Hütte in der Westmark nach Gisberts Kisten." },
    { id: "zurueck", text: "Gisbert die Kisten bringen", ereignis: { art: "antwort" }, nach: ["kisten"], bei: "gisbert",
      log: "Bring Gisbert Ast seine Apfelkisten zurück in die Obstwiesen." },
  ],
  objekte: [
    { id: "b3_stiefel", name: "Stiefelabdruck", x: SPUREN[0][0], y: SPUREN[0][1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Ein Stiefelabdruck, tief im weichen Boden. Genagelte Sohle – kein Bauer trägt so etwas. Die Spitze zeigt nach Westen ({n:spuren}).",
      schon: "Ein genagelter Stiefel, nach Westen.", sonst: [{ wenn: NEU, text: "Zertretenes Gras." }, { wenn: FERTIG, text: "Die Spur ist fast verwischt." }] },
    { id: "b3_karren", name: "Karrenrinne", x: SPUREN[1][0], y: SPUREN[1][1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Zwei tiefe Rinnen, eine Spur breit. Ein schwerer Karren, voll beladen – und er ist nicht zum Dorf gefahren, sondern querfeldein nach Westen ({n:spuren}).",
      schon: "Karrenrinnen, schwer beladen, nach Westen.", sonst: [{ wenn: NEU, text: "Zwei Rinnen im Gras." }, { wenn: FERTIG, text: "Die Rinnen wachsen langsam zu." }] },
    { id: "b3_apfel", name: "Zerdrückter Apfel", x: SPUREN[2][0], y: SPUREN[2][1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Ein zerdrückter Apfel am Westrand der Wiese, halb gegessen. Die Bissspuren sind frisch. Wer auch immer das war, hatte Hunger – und es eilig ({n:spuren}).",
      schon: "Ein halber Apfel. Jemand hatte Hunger.", sonst: [{ wenn: NEU, text: "Ein Apfel im Gras." }, { wenn: FERTIG, text: "Die Wespen haben ihn gefunden." }] },
    { id: "b3_kisten", name: "Kisten hinter den Fässern", x: KISTEN[0], y: KISTEN[1], modell: "stelle", tat: "aufheben", tatText: "Die Kisten nehmen", weit: 3,
      geben: [{ g: "apfelkisten" }],
      text: "Hinter den Fässern: drei Kisten, auf jeder ein eingebranntes „A“. Gisberts Kisten. Und unter den Fässern ein Loch im Boden, eine Leiter führt hinab.",
      schon: "Die Kisten hast du schon. Das Loch unter den Fässern bleibt.",
      sonst: [{ wenn: NEU, text: "Fässer, an die Hüttenwand gelehnt. Es riecht nach Äpfeln." }, { wenn: { offen: ["brief"] }, text: "Fässer, an die Hüttenwand gelehnt. Es riecht nach Äpfeln. Wer stellt hier draußen Fässer ab?" }] },
  ],
  /* Gisbert: Obstbauer, bedächtig, rechnet in Äpfeln und Kisten, Sprüche wie vom Großvater. Othmar: Bürgermeister, ruhig, gewählt, wird blass beim Namen. */
  dialoge: {
    gisbert: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ein Fuchs nimmt einen Apfel. Ein Dieb nimmt die Kiste.", "Und wer nimmt drei Kisten in drei Nächten? Jemand, der Hunger für viele hat."],
          antworten: ["annehmen", "wer", "spaeter"] },
        { wenn: NEU, zeilen: ["Drei Kisten weg. Und du siehst nicht aus, als könntest du einen Dieb einholen.", "Komm wieder, wenn du ein paar Jahre mehr auf dem Buckel hast."], antworten: ["wer", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Meine Kisten! Die vom Großvater. Hier, nimm dir Äpfel, wenn du welche brauchst – zum ehrlichen Preis."], antworten: ["wer", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["zurueck"] }, zeilen: ["Der Zettel, den du gefunden hast – bring den zu Othmar nach Weidenhain. Der kennt jeden Namen zwischen hier und Graufurt."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kisten"], hat: "apfelkisten" }, zeilen: ["Sind das …? Das „A“ auf dem Deckel. Das hat Großvater eingebrannt!"], antworten: ["kisten_geben"] },
        { wenn: { ...LAEUFT, erledigt: ["kisten"] }, zeilen: ["Du hast sie gefunden, sagst du? Und wo sind sie?", "Hinter den Fässern stehen lassen? …Dann hol sie, bevor's die Kerle merken."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["brief"] }, zeilen: ["Ein Zettel? „An R., Westmark, bei den Fässern.“ Fässer … An der alten Hütte in der Westmark stehen Fässer.", "Geh nachsehen. Ich komm nicht mit. Meine Knie."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: SP }, zeilen: ["Nach Westen, also. In die Westmark. Da wohnt keiner mehr, seit der Steinweg gesperrt war.", "Aber man sieht dort Kerle mit Schleudern. Pass auf, die laufen weg und kommen mit Freunden wieder."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Schau dir die Spuren an. Hier am Boden, von den Kisten weg.", "Ich hab's versucht, aber ich seh nur Gras."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich finde deine Kisten. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Das würdest du tun? Gut.",
          "Die Spuren fangen hier an, bei den Kisten. Drei hab ich gesehen, aber nicht verstanden. Du vielleicht."] } }] },
        { id: "wer", text: "Wer bist du?", folge: [{ f: { weiter: true, zeilen: ["Gisbert Ast. Die Obstwiesen hat mein Großvater gepflanzt, die Kisten hat er gezimmert.",
          "Äpfel bis nach Graufurt hab ich verkauft. Dann kam die Sperre, und jetzt kommt jemand nachts und holt sie sich umsonst."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann eben nicht. Ich zähl inzwischen, was noch übrig ist."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "kisten_geben", text: "Die Kisten zurückgeben.", wenn: { hat: "apfelkisten" }, folge: [{ f: { erledige: ["zurueck"], nehmen: [{ g: "apfelkisten" }],
          zeilen: ["Gisbert streicht über das eingebrannte „A“, als wär's ein Hund.", "Halb leer. Egal. Die Kisten sind wieder da.",
            "Und der Zettel, den du gefunden hast – bring den zu Othmar Rehn nach Weidenhain. Wenn einer weiß, wer „R.“ ist, dann er."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ wenn: FERTIG, f: { zeilen: ["Ein Apfel am Tag, sagt man. Ich sag: zwei."] } }, { f: { zeilen: ["Pass auf dich auf. Und auf die Äpfel."] } }] },
      ],
    },
    othmar: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, hat: "karrenbrief" }, zeilen: ["Du kommst aus der Westmark? Man sieht's an den Stiefeln.", "Was hast du da?"], antworten: ["brief_zeigen", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gisbert hat mir erzählt, du hättest einen Brief gefunden. Wo ist er?"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Rotmantel. Ich krieg den Namen nicht aus dem Kopf."], antworten: ["tschuess"] },
        { zeilen: ["Weidenhain hat wieder Gäste, seit die Straße offen ist. Nicht alle davon sind mir lieb."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "brief_zeigen", text: "Den Karrenbrief zeigen.", wenn: { hat: "karrenbrief" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "karrenbrief" }],
          zeilen: ["Othmar liest. Einmal. Dann noch einmal, langsamer.", "Äpfel. Silberleuchter. Stoffballen aus Graufurt. „An R., Westmark, bei den Fässern.“",
            "R.? …Dann ist es Rotmantel. Ich dachte, der ist tot.", "Behalt das für dich, ja? Ich muss nachdenken. Komm wieder, wenn du bereit bist für mehr als Späher."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege."] } }] },
      ],
    },
  },
  /* Karrenbrief: fällt garantiert beim fünften Späher (ab Zähler 4), nur solange er noch fehlt */
  beute: { b3_karrenbrief: { erledigt: SP, offen: ["brief"], zaehler: { schritt: "spaeher", min: 4 } } },
  schalter: { leiter_unterschlupf: [FERTIG, { erledigt: ["kisten"] }], gisbert_aepfel: FERTIG },
  belohnungText: "Belohnung: Fernkampf 500, Geschick 300, LP 200 XP, 10 Äpfel, 120 Splitter · danach: Gisbert Ast verkauft Äpfel",
  belohnung: { xp: { fernkampf: 500, geschick: 300, lp: 200 }, splitter: 120, gegenstaende: [{ g: "apfel", n: 10 }] },
  punkte: 1,
};
