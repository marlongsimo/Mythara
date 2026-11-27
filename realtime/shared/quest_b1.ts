/*
 * Riftmere – Quest B1 „Der Wegstein“ (Phase 3a, 26.11.2026), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/2-hinter-der-sperre.pdf (claude/relaxed-sagan-erl6lf). Agnes an der Linde im Steinring in Weidenhain.
 * Quellstein und Quellwasser an der Quelle der Obstwiesen, Span vom Totholz der Linde (Holzfällerei 15), 250 Splitter für den geweihten Splitter,
 * an der Werkbank den Wegstein fügen (Handwerk 10), am Erntefeuer weihen, zurück zu Agnes.
 * Lohn: der Wegstein mit 10 Ladungen, 400 Magie-XP, Splitterbinden-XP, 1 Questpunkt; danach der Bindestein an der Linde (Schalter bindestein_linde)
 * und das Wegstein-Ziel „Weidenhain – die Linde“ (shared/wegstein.ts).
 */
import type { QuestDef, Bed, Geben } from "./questbau";
import { B1_ID } from "./wegstein";

export const B1 = B1_ID;
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const QUELLE: [number, number] = [6567.8, 6696.4], FEUER: [number, number] = [6442, 6687.9], WERKBANK: [number, number] = [6530.5, 6426.5], TOTHOLZ: [number, number] = [6446.5, 6677.5];
const NEUER: Geben[] = [{ g: "wegstein", name: "einen neuen Wegstein", verloren: true }];
const HILFE = ["Hör gut zu, ich sag's nur zweimal.", "Aus der Quelle der Obstwiesen einen glatten Stein und eine Flasche Wasser. Vom Totholz der Linde einen Span – Holzfällerei 15, sonst bricht er dir.",
  "Dann 250 Splitter für die Wurzeln. An der Werkbank im Osthof fügst du Stein, Span und Splitter zusammen. Und zum Schluss: Wasser auf den Stein, über das Erntefeuer."];

export const QUEST_B1: QuestDef = {
  id: B1, titel: "Der Wegstein", ort: "Weidenhain · Obstwiesen · Osthof", start: "Sprich mit Agnes an der Linde im Steinring in Weidenhain.",
  logNeu: "Unter der alten Linde im Steinring von Weidenhain sitzt jeden Abend Agnes. Man sagt, sie weiß noch, wie man die alten Wegsteine macht.",
  logAngeboten: "Agnes an der Linde in Weidenhain hat dir von den Wegsteinen erzählt. Sie wartet, ob du einen machen willst.",
  logAbgabe: "Der Wegstein ist geweiht. Bring ihn Agnes an der Linde.",
  logFertig: "Du hast einen Wegstein. Reib ihn im Rucksack, und er bringt dich zur Linde – eine Ladung je Reise. Laden kannst du ihn am Bindestein zwischen den Wurzeln der Linde.",
  geber: "agnes",
  figuren: [{ id: "agnes", name: "Agnes", modell: "npc.agnes", x: 6450.5, y: 6681.6, blick: [1, -1] }],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Holzfällerei 15", wenn: { skill: { k: "holzfaellerei", min: 15 } } },
    { text: "Handwerk 10", wenn: { skill: { k: "handwerk", min: 10 } } },
  ],
  schritte: [
    { id: "quelle", text: "Quellstein und Quellwasser holen", ereignis: { art: "objekt", id: "b1_quelle" }, wo: QUELLE,
      log: "Hol an der Quelle der Obstwiesen einen glatten Quellstein und eine Flasche Quellwasser." },
    { id: "span", text: "Einen Span vom Totholz der Linde schneiden", ereignis: { art: "sammeln", ziel: "linde_totholz" }, wo: TOTHOLZ,
      log: "Schneid einen Span vom Totholz der Linde – ein Holzbeil und Holzfällerei 15." },
    { id: "opfer", text: "250 Splitter für die Wurzeln der Linde", ereignis: { art: "antwort" }, bei: "agnes",
      log: "Gib Agnes 250 Splitter für die Wurzeln der Linde. Dafür bekommst du einen geweihten Splitter." },
    { id: "fuegen", text: "Den Wegstein an der Werkbank fügen", ereignis: { art: "herstellen", rezept: "wegstein_ungeweiht" }, nach: ["quelle", "span", "opfer"], wo: WERKBANK,
      log: "Füg an der Werkbank im Osthof Quellstein, Lindenspan und geweihten Splitter zum Wegstein (Handwerk 10)." },
    { id: "weihen", text: "Den Wegstein am Erntefeuer weihen", ereignis: { art: "objekt", id: "b1_feuer" }, nach: ["fuegen"], wo: FEUER,
      log: "Gieß das Quellwasser auf den Stein und halt ihn über das Erntefeuer auf dem Dorfplatz von Weidenhain." },
  ],
  objekte: [
    { id: "b1_quelle", name: "Quelle", x: QUELLE[0], y: QUELLE[1], modell: "stelle", tat: "benutzen", tatText: "Stein und Wasser holen", weit: 3,
      geben: [{ g: "quellstein" }, { g: "quellwasser" }],
      text: "Du greifst ins kalte Wasser und findest einen flachen, glatten Stein. Dann füllst du die Flasche bis zum Rand.",
      schon: "Quellstein und Wasser hast du schon.", sonst: [{ wenn: NEU, text: "Eine klare Quelle. Hier entspringt der Bach, der durch die Obstwiesen fließt." }] },
    { id: "b1_feuer", name: "Erntefeuer", x: FEUER[0], y: FEUER[1], modell: "stelle", tat: "benutzen", tatText: "Den Wegstein weihen", weit: 3,
      braucht: { wenn: { hat: "wegstein_ungeweiht" }, text: "Das Erntefeuer auf dem Dorfplatz. Erst brauchst du einen gefügten Wegstein." },
      nehmen: [{ g: "wegstein_ungeweiht" }, { g: "quellwasser" }], geben: [{ g: "wegstein" }],
      text: "Das Wasser zischt auf dem Stein. Du hältst ihn in den Rauch – und für einen Herzschlag riechst du Lindenblüten. Der Splitter in der Mitte leuchtet auf.",
      schon: "Das Erntefeuer prasselt. Dein Wegstein ist längst geweiht.", sonst: [{ wenn: NEU, text: "Das Erntefeuer auf dem Dorfplatz. Hier wird gefeiert, wenn das Korn eingebracht ist." }] },
  ],
  dialoge: {
    agnes: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Setz dich, setz dich. Die Linde mag Gesellschaft.",
          "Früher trugen die Reisenden kleine Steine bei sich, gefasst in einen Span der Linde, mit einem Splitter in der Mitte. Wer den Stein rieb, fand heim zur Linde.",
          "Seit die Straße gesperrt war, hat keiner mehr einen gemacht. Und meine Hände sind zu alt dafür."], antworten: ["annehmen", "wie", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Linde mag Gesellschaft. Aber für das, was ich dir erzählen könnte, bist du noch nicht so weit.",
          "Komm wieder, wenn du ein Beil zu führen weißt und eine Werkbank kennst."], antworten: ["was_fehlt", "tschuess"] },
        { wenn: { phase: ["fertig"], verloren: "wegstein" }, zeilen: ["Du hast ihn verloren? Ach, Kind.", "Die Linde vergisst keinen, der ihr etwas gegeben hat. Hier – ich hab noch einen gefügt."], antworten: ["neuer", "tschuess"] },
        /* Phase 5 (#80, Konzept 5b): ab Splitterbinden 20 erzählt Agnes vom Laden einer Waffe – ein Gespräch, keine Quest */
        { wenn: { ...FERTIG, skill: { k: "splitterbinden", min: 20 } }, zeilen: ["Du riechst nach Splittern. Nicht nach Staub – nach Licht. Du bist weiter, als ich dachte.",
          "Eine gute Klinge kann Splitter tragen wie der Wegstein. Leg sie an den Bindestein, zwei Splitter je Ladung – oder einen und ein Seelenlicht.",
          "Dann schlägt sie mit mehr als Eisen zu, bis die Ladung verbraucht ist. Nur seltene Waffen halten das aus. Und am Obelisk im Nordwald gibt es einen zweiten Stein, seit der alte Friedhof Ruhe hat."],
          antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Linde vergisst keinen, der ihr etwas gegeben hat. Sie ruft dich, wenn du sie rufst.",
          "Und wenn der Stein müde wird: zwei Splitter zwischen die Wurzeln, und er hat wieder Kraft. Der Bindestein liegt gleich hier."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "wegstein" }, zeilen: ["Er ist warm. Ich spür's von hier.", "Gib ihn mir – nur einen Augenblick."], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, offen: ["opfer"], anzahl: { g: "splitter", min: 250 } }, zeilen: ["Hast du die Splitter? Die Linde nimmt nur, was man gern gibt."], antworten: ["opfern", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, offen: ["opfer"] }, zeilen: ["Zweihundertfünfzig Splitter, nicht einer weniger. Die Linde zählt mit."], antworten: ["hilfe", "tschuess"] },
        { wenn: { erledigt: ["fuegen"] }, zeilen: ["Gefügt ist er. Jetzt Wasser darauf und ab übers Erntefeuer – dann erst hört er auf dich."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Stein, Wasser, Span und Splitter. Mehr braucht es nicht – und alles davon ist schwer zu holen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich mache einen Wegstein. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Dann hör zu. Aus der Quelle der Obstwiesen holst du einen glatten Stein und eine Flasche Wasser.",
          "Vom Totholz der Linde – dort drüben, der graue Ast – schneidest du einen Span. Vorsichtig, sie lebt noch.", "Und dann bringst du mir 250 Splitter. Die gehören der Linde."] } }] },
        { id: "wie", text: "Wie funktioniert so ein Stein?", folge: [{ f: { weiter: true, zeilen: ["Der Splitter merkt sich die Linde, das Wasser merkt sich den Weg. Reibst du den Stein, zieht es dich zurück.",
          "Aber jede Reise kostet Kraft. Die legst du am Bindestein hinein – zwei Splitter für eine Reise."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Linde wartet. Sie hat Zeit. Ich … weniger."] } }] },
        { id: "was_fehlt", text: "Was fehlt mir denn?", folge: [{ f: { weiter: true, zeilen: ["Erst die gesperrte Straße – ohne sie kommt keiner zu uns. Dann Holzfällerei 15 und Handwerk 10.", "Das steht auch in deinem Questlog."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "opfern", text: "250 Splitter geben.", wenn: { anzahl: { g: "splitter", min: 250 } }, folge: [{ f: { erledige: ["opfer"], nehmen: [{ g: "splitter", n: 250 }], geben: [{ g: "geweihter_splitter", name: "einen geweihten Splitter" }],
          zeilen: ["Agnes legt die Splitter zwischen die Wurzeln, einen nach dem anderen. Einer bleibt in ihrer Hand – er schimmert grünlich.", "Der hier ist geweiht. Pass auf ihn auf."] } }] },
        { id: "abgeben", text: "Den Wegstein zeigen.", wenn: { hat: "wegstein" }, folge: [{ f: { abschluss: true,
          zeilen: ["Agnes legt den Stein auf den Bindestein zwischen den Wurzeln und zwei Splitter daneben. Der Stein summt.", "Zehn Reisen hab ich hineingelegt. Danach lädst du ihn selbst – hier, am Bindestein.",
            "Reib ihn im Rucksack, und er bringt dich heim zur Linde."] } }] },
        { id: "neuer", text: "Einen neuen Wegstein nehmen.", wenn: { verloren: "wegstein" }, folge: [{ f: { geben: NEUER, zeilen: ["Hier. Und diesmal binde ihn fest.", "Die Ladungen? Die stecken nicht im Stein, die stecken in dir. Sie sind noch da."],
          nichtsZuGeben: ["Du hast ihn doch noch. Schau in den Rucksack – oder in die Bank."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Die Linde vergisst dich nicht."] } }] },
      ],
    },
  },
  sperren: {
    sammeln: { linde_totholz: [
      { wenn: FERTIG, text: "Das Totholz der Linde hat dir gegeben, was du brauchtest." },
      { wenn: { phase: ["neu"] }, text: "Ein grauer, abgestorbener Ast der alten Linde. Ohne Agnes' Erlaubnis schneidest du hier nichts." },
      { wenn: { erledigt: ["span"] }, text: "Ein Span genügt. Die Linde lebt noch." },
    ] },
    herstellen: { wegstein_ungeweiht: [
      { wenn: { phase: ["neu", "fertig"] }, text: "Einen Wegstein fügst du nur mit Agnes' Segen." },
      { wenn: { erledigt: ["fuegen"] }, text: "Dein Wegstein ist schon gefügt." },
    ] },
  },
  schalter: { bindestein_linde: FERTIG },
  glueckwunsch: "Die Linde vergisst keinen, der ihr etwas gegeben hat. Sie ruft dich, wenn du sie rufst.",
  belohnungText: "Belohnung: der Wegstein mit 10 Ladungen, 400 Magie-XP, Splitterbinden-XP · danach: der Bindestein an der Linde und das Wegstein-Ziel Weidenhain",
  belohnung: { xp: { magie: 400 }, berufe: { splitterbinden: 20 }, ladungen: { wegstein: 10 } },
  punkte: 1,
};
