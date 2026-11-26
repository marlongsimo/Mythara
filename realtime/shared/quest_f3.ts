/*
 * Riftmere – Quest F3 „Der versandete Tempel“ (Phase 9), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md. Gelehrter Hasim Tal aus Glutbrunn sucht im Tempel in den Tafelbergen nach Inschriften aus der alten Zeit (Mythara, Magierkrieg).
 * Abstieg, drei Glutgeister, drei Spiegelplatten in der richtigen Reihenfolge (Licht lenken), die Sandmutter in der Kammer (Instanz), die Inschrift abschreiben.
 * In der Kammer liegt auch ein Stück der „Karte des Boten“ (shared/quest_karte.ts) – es zu nehmen ist ein Schritt der Quer-Quest.
 * Lohn: Magie 5.000, Defense 5.000 XP, 1.500 Splitter, 3 Questpunkte; Zugang zum Ureisen in den Tafelbergen (Schalter ureisen_tafelberge).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Tempel als Untergrund mit Kammer als Instanz, Glutgeist, Sandmutter, Spiegel-Rätsel). Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, QuestObjekt, Bed, Sperre } from "./questbau";
import { F1 } from "./quest_f1";
import { GLUTBRUNN, TEMPEL } from "./quest_f_orte";

export const F3 = "glutsande_versandeter_tempel";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ZERSTREUT = "Du drehst die Platte. Das Licht springt an die Wand, flackert und verliert sich im Sand. Falsche Richtung – das Licht muss vom Eingang her kommen.";
const HILFE = ["Der Tempel liegt in den Tafelbergen, östlich von hier. Der Eingang ist halb verschüttet.", "Drinnen ist es dunkel. Die Erbauer haben mit Spiegeln Licht in die Tiefe geholt. Erst der Spiegel am Eingang, dann der gegenüber, zuletzt der oben im Gewölbe.",
  "Hinter dem Licht liegt die Kammer. Etwas Großes lebt dort im Sand. Und an der Wand: die Inschrift. Schreib sie mir ab. Jedes Zeichen."];
const spiegel = (i: number, text: string, sonst: Sperre[]): QuestObjekt => ({ id: "f3_spiegel_" + (i + 1), name: "Spiegelplatte", x: TEMPEL.spiegel[i][0], y: TEMPEL.spiegel[i][1], modell: "stelle", tat: "benutzen",
  tatText: "Die Platte drehen", weit: 2.5, text, schon: "Die Platte wirft ihr Licht weiter.", sonst: [{ wenn: NEU, text: "Eine blinde Spiegelplatte aus Bronze." }, { wenn: FERTIG, text: "Die Platte wirft ihr Licht weiter." }, ...sonst] });

export const QUEST_F3: QuestDef = {
  id: F3, titel: "Der versandete Tempel", ort: "Glutsande · Tafelberge", start: "Sprich mit dem Gelehrten Hasim Tal an der Karawanenrast in Glutbrunn.",
  logNeu: "In Glutbrunn sitzt ein Gelehrter über Abschriften, die niemand lesen kann. Er sucht die Inschrift, die alles erklärt.",
  logAngeboten: "Hasim Tal in Glutbrunn wartet, ob du in den versandeten Tempel steigst.",
  logAbgabe: "Du hast die Inschrift abgeschrieben. Bring sie Hasim Tal nach Glutbrunn.",
  logFertig: "Hasim Tal liest die Inschrift aus dem versandeten Tempel: Sie erzählt von Mythara vor dem Magierkrieg. In den Tafelbergen kannst du jetzt Ureisen abbauen.",
  geber: "hasim",
  figuren: [{ id: "hasim", name: "Hasim Tal", modell: "npcmann3d", x: GLUTBRUNN.hasim[0], y: GLUTBRUNN.hasim[1], blick: [0, 1] }],
  voraussetzungen: [
    { text: "„Ende des Grases“ abgeschlossen", wenn: { quest: { id: F1, phase: ["fertig"] } } },
    { text: "Defense 50", wenn: { skill: { k: "defense", min: 50 } } },
  ],
  schritte: [
    { id: "abstieg", text: "In den versandeten Tempel hinabsteigen", ereignis: { art: "betreten", region: "glut_tempel" }, wo: TEMPEL.eingang,
      log: "Steig in den versandeten Tempel in den Tafelbergen hinab. (Heldenlevel 55 empfohlen.)" },
    { id: "geister", text: "Drei Glutgeister besiegen", ereignis: { art: "erlegen", typ: "glutgeist" }, anzahl: 3, nach: ["abstieg"], wo: TEMPEL.raum,
      log: "In den Gängen flackern Glutgeister. Besieg drei ({n:geister}) – wenn sie flackern, triffst du sie nicht." },
    ...[0, 1, 2].map((i) => ({ id: "spiegel_" + (i + 1), text: "Das Licht mit den Spiegelplatten lenken", ereignis: { art: "objekt" as const, id: "f3_spiegel_" + (i + 1) },
      nach: i === 0 ? ["geister"] : ["spiegel_" + i], gruppe: "spiegel", wo: TEMPEL.spiegel[i],
      log: "Dreh die drei Spiegelplatten so, dass das Licht in die Kammer fällt – vom Eingang aus, wie Hasim gesagt hat ({n:spiegel})." })),
    { id: "sandmutter", text: "Die Sandmutter besiegen", ereignis: { art: "erlegen", typ: "sandmutter" }, nach: ["spiegel_3"], wo: TEMPEL.kammer,
      log: "Im Licht regt sich der Sand der Kammer. Die Sandmutter taucht auf – und ab. Schau, wo der Sand sich hebt." },
    { id: "inschrift", text: "Die Inschrift abschreiben", ereignis: { art: "objekt", id: "f3_inschrift" }, nach: ["sandmutter"], wo: TEMPEL.inschrift,
      log: "Schreib die Inschrift an der Wand der Kammer ab." },
  ],
  objekte: [
    spiegel(0, "Die erste Platte fängt das Tageslicht vom Eingang. Ein Strahl schneidet durch den Staub zur Gegenwand ({n:spiegel}).", []),
    spiegel(1, "Die zweite Platte nimmt den Strahl auf und wirft ihn nach oben ins Gewölbe ({n:spiegel}).", [{ wenn: { offen: ["spiegel_1"] }, text: ZERSTREUT }]),
    spiegel(2, "Die dritte Platte schickt das Licht in die Tiefe. Unter dir leuchtet eine Kammer auf – und der Sand darin bewegt sich.", [{ wenn: { offen: ["spiegel_2"] }, text: ZERSTREUT }]),
    { id: "f3_inschrift", name: "Inschrift", x: TEMPEL.inschrift[0], y: TEMPEL.inschrift[1], modell: "stelle", tat: "untersuchen", tatText: "Abschreiben", weit: 2.5, geben: [{ g: "tempelabschrift" }],
      text: "Zeichen, die du nicht lesen kannst, aber du zeichnest sie nach, eins nach dem anderen. Darunter, kleiner: ein Turm über drei Wellen. Die Wacht war schon einmal hier.",
      schon: "Die Abschrift hast du.", sonst: [{ wenn: NEU, text: "Zeichen an der Wand, halb unter Sand." }, { wenn: FERTIG, text: "Die Inschrift. Hasim hat sie übersetzt." }, { wenn: { offen: ["inschrift"] }, text: "Erst die Sandmutter." }] },
  ],
  /* Hasim: Gelehrter, begeistert, redet zu schnell, vergisst über Büchern das Essen. */
  dialoge: {
    hasim: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ah! Ein Reisender! Aus dem Westen? Wissen die dort noch etwas über Mythara? Über die Zeit vor dem Krieg der Magier?",
          "Nein? Niemand weiß es. Aber es steht geschrieben. Im Tempel in den Tafelbergen. Ich bin zu alt, zu langsam und zu feige, es zu holen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Hm? Ja? Ich lese gerade."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ich übersetze immer noch. Jeden Tag ein Zeichen. Es geht um einen Riss – vor dem Riss."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "tempelabschrift" }, zeilen: ["Du lebst! Und du hast …? Zeig her, zeig her!"], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du warst in der Kammer? Und die Abschrift?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["spiegel_3"] }, zeilen: ["Licht in der Kammer? Dann ist sie wach. Was immer dort lebt."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["geister"] }, zeilen: ["Die Geister sind fort? Dann die Spiegel. Vom Eingang aus. Immer vom Licht her denken."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der Tempel. In den Tafelbergen. Ich warte hier. Mit Tee."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole dir die Inschrift. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Oh! Hier, Kohle und Papier. Schreib alles ab, auch was du für Kratzer hältst.",
          "Der Tempel ist dunkel. Die Erbauer haben Spiegel gesetzt, um Licht hinunterzuholen. Und etwas lebt dort unten. Etwas, das den Sand mag."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Inschrift wartet seit tausend Jahren. Ich seit dreißig. Wir können beide noch warten."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Die Abschrift übergeben.", wenn: { hat: "tempelabschrift" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "tempelabschrift" }],
          zeilen: ["Hasim liest mit dem Finger, die Lippen bewegen sich. Dann hält er inne.", "Hier – ein Turm über drei Wellen. Die Wacht. Sie war dort. Vor uns allen.",
            "Und hier: Mythara. Ein Name für das Land, bevor es zerbrach. Danke. Danke! Die Tafelberge stehen dir offen – das Ureisen dort gehört dem, der es holt."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Und trink Wasser!"] } }] },
      ],
    },
  },
  schalter: { tempel_kammer_instanz: LAEUFT, ureisen_tafelberge: FERTIG },
  belohnungText: "Belohnung: Magie 5.000, Defense 5.000 XP, 1.500 Splitter · danach: Ureisen in den Tafelbergen; in der Kammer liegt ein Stück der Karte des Boten",
  belohnung: { xp: { magie: 5000, defense: 5000 }, splitter: 1500 },
  punkte: 3,
};
