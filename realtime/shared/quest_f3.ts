/*
 * Riftmere – Quest F3 „Der versandete Tempel“ (Phase 9), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md. Der Gelehrte Hasim Tal aus Glutbrunn wartet vor dem Tempel in den Tafelbergen; er sucht Inschriften aus der alten Zeit (Mythara, Magierkrieg).
 * Abstieg (Gebiet tempel), drei Glutgeister, vier Spiegelplatten im Spiegelsaal in der richtigen Reihenfolge (Licht vom Schacht in den Inschriftensaal lenken),
 * die Inschrift abschreiben, hinter dem Kammertor die Sandmutter (Gebiet tempel_kammer, Instanz). In der Kammer liegt ein Stück der „Karte des Boten“ (quest_karte.ts).
 * Lohn: Magie 5.000, Defense 5.000 XP, 1.500 Splitter, 3 Questpunkte; Zugang zum Ureisen in den Tafelbergen (Schalter ureisen_tafelberge).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Kammer als Instanz, Glutgeist, Sandmutter, Spiegel-Rätsel optisch). Stellen aus der Welt (#74, quest_f_orte.ts).
 * Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, QuestObjekt, Bed, Sperre } from "./questbau";
import { F1 } from "./quest_f1";
import { TEMPEL } from "./quest_f_orte";

export const F3 = "glutsande_versandeter_tempel";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ZERSTREUT = "Du drehst die Platte. Das Licht springt an die Wand, flackert und verliert sich im Sand. Falsche Richtung – das Licht muss vom Schacht her kommen, Platte für Platte.";
const SPIEGEL = [0, 1, 2, 3];
const HILFE = ["Der Tempel liegt hier im Tafelberg, hinter dem Tor. Drinnen ist es dunkel.",
  "Die Erbauer haben mit Spiegeln Licht in die Tiefe geholt. Vier Platten. Unter dem Schacht fängt es an: erst die linke vordere, dann die rechte vordere, dann die linke hintere, zuletzt die rechte hintere. So steht es in meinen Abschriften.",
  "Wenn das Licht den Inschriftensaal erreicht, schreib die Inschrift ab. Jedes Zeichen. Und hinter dem Kammertor … lebt etwas Großes im Sand."];
const spiegel = (i: number, text: string, sonst: Sperre[]): QuestObjekt => ({ id: "f3_spiegel_" + (i + 1), name: "Spiegelplatte", x: TEMPEL.spiegel[i][0], y: TEMPEL.spiegel[i][1], modell: "stelle", tat: "benutzen",
  tatText: "Die Platte drehen", weit: 2.5, text, schon: "Die Platte wirft ihr Licht weiter.", sonst: [{ wenn: NEU, text: "Eine blinde Spiegelplatte aus Bronze." }, { wenn: FERTIG, text: "Die Platte wirft ihr Licht weiter." }, ...sonst] });

export const QUEST_F3: QuestDef = {
  id: F3, titel: "Der versandete Tempel", ort: "Glutsande · Tafelberge", start: "Sprich mit dem Gelehrten Hasim Tal vor dem versandeten Tempel in den Tafelbergen.",
  logNeu: "Vor einem halb verschütteten Tor in den Tafelbergen sitzt ein Gelehrter aus Glutbrunn über Abschriften, die niemand lesen kann.",
  logAngeboten: "Hasim Tal vor dem versandeten Tempel wartet, ob du hinabsteigst.",
  logAbgabe: "Du hast die Inschrift, und die Sandmutter ist besiegt. Geh zurück zu Hasim Tal vor dem Tempel.",
  logFertig: "Hasim Tal liest die Inschrift aus dem versandeten Tempel: Sie erzählt von Mythara vor dem Magierkrieg. In den Tafelbergen kannst du jetzt Ureisen abbauen.",
  geber: "hasim",
  figuren: [{ id: "hasim", name: "Hasim Tal", modell: "npcmann3d", x: TEMPEL.hasim[0], y: TEMPEL.hasim[1], blick: [0, -1] }],
  voraussetzungen: [
    { text: "„Ende des Grases“ abgeschlossen", wenn: { quest: { id: F1, phase: ["fertig"] } } },
    { text: "Defense 50", wenn: { skill: { k: "defense", min: 50 } } },
  ],
  schritte: [
    { id: "abstieg", text: "In den versandeten Tempel hinabsteigen", ereignis: { art: "betreten", region: "tempel" }, wo: TEMPEL.tor,
      log: "Steig durch das Tor im Tafelberg in den versandeten Tempel hinab. (Heldenlevel 55 empfohlen.)" },
    { id: "geister", text: "Drei Glutgeister besiegen", ereignis: { art: "erlegen", typ: "glutgeist" }, anzahl: 3, nach: ["abstieg"], wo: TEMPEL.raum,
      log: "In der Vorhalle flackern Glutgeister. Besieg drei ({n:geister}) – wenn sie flackern, triffst du sie nicht." },
    ...SPIEGEL.map((i) => ({ id: "spiegel_" + (i + 1), text: "Das Licht mit den Spiegelplatten lenken", ereignis: { art: "objekt" as const, id: "f3_spiegel_" + (i + 1) },
      nach: i === 0 ? ["geister"] : ["spiegel_" + i], gruppe: "spiegel", wo: TEMPEL.spiegel[i],
      log: "Dreh im Spiegelsaal die vier Platten so, dass das Licht aus dem Schacht weiterwandert – in der Reihenfolge aus Hasims Abschriften ({n:spiegel})." })),
    { id: "inschrift", text: "Die Inschrift abschreiben", ereignis: { art: "objekt", id: "f3_inschrift" }, nach: ["spiegel_4"], wo: TEMPEL.inschrift,
      log: "Das Licht erreicht den Inschriftensaal. Schreib die Inschrift an der Wand ab." },
    { id: "sandmutter", text: "Die Sandmutter besiegen", ereignis: { art: "erlegen", typ: "sandmutter" }, nach: ["inschrift"], wo: TEMPEL.kammer,
      log: "Hinter dem Kammertor regt sich der Sand. Die Sandmutter taucht auf – und ab. Schau, wo der Sand sich hebt, und bleib bei den Säulen." },
  ],
  objekte: [
    spiegel(0, "Die erste Platte fängt das Licht aus dem Schacht. Ein Strahl schneidet durch den Staub nach rechts ({n:spiegel}).", []),
    spiegel(1, "Die zweite Platte nimmt den Strahl auf und wirft ihn nach hinten ({n:spiegel}).", [{ wenn: { offen: ["spiegel_1"] }, text: ZERSTREUT }]),
    spiegel(2, "Die dritte Platte fängt ihn und schickt ihn quer durch den Saal ({n:spiegel}).", [{ wenn: { offen: ["spiegel_2"] }, text: ZERSTREUT }]),
    spiegel(3, "Die vierte Platte lenkt das Licht durch einen Spalt in der Wand. Drüben, im Inschriftensaal, leuchten Zeichen auf.", [{ wenn: { offen: ["spiegel_3"] }, text: ZERSTREUT }]),
    { id: "f3_inschrift", name: "Inschrift", x: TEMPEL.inschrift[0], y: TEMPEL.inschrift[1], modell: "stelle", tat: "untersuchen", tatText: "Abschreiben", weit: 2.5, geben: [{ g: "tempelabschrift" }],
      text: "Zeichen, die du nicht lesen kannst, aber du zeichnest sie nach, eins nach dem anderen. Darunter, kleiner: ein Turm über drei Wellen. Die Wacht war schon einmal hier. Hinter dir knirscht das Kammertor.",
      schon: "Die Abschrift hast du.", sonst: [{ wenn: NEU, text: "Zeichen an der Wand, im Dunkeln kaum zu sehen." }, { wenn: FERTIG, text: "Die Inschrift. Hasim hat sie übersetzt." }, { wenn: { offen: ["inschrift"] }, text: "Zu dunkel. Ohne Licht siehst du keine Zeichen." }] },
  ],
  /* Hasim: Gelehrter, begeistert, redet zu schnell, vergisst über Büchern das Essen. Wartet vor dem Tor, weil er sich nicht hineintraut. */
  dialoge: {
    hasim: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ah! Ein Reisender! Aus dem Westen? Wissen die dort noch etwas über Mythara? Über die Zeit vor dem Krieg der Magier?",
          "Nein? Niemand weiß es. Aber es steht geschrieben. Da drin, hinter diesem Tor. Ich bin zu alt, zu langsam und zu feige, es zu holen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Hm? Ja? Ich lese gerade."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ich übersetze immer noch. Jeden Tag ein Zeichen. Es geht um einen Riss – vor dem Riss."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "tempelabschrift" }, zeilen: ["Du lebst! Und du hast …? Zeig her, zeig her!"], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du warst in der Kammer? Und die Abschrift?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["inschrift"] }, zeilen: ["Du hast sie? Wunderbar! Aber … hinter dir das Tor. Hast du das Knirschen gehört? Da ist noch etwas."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["geister"] }, zeilen: ["Die Geister sind fort? Dann die Spiegel. Vom Schacht aus. Immer vom Licht her denken."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der Tempel. Gleich hinter mir. Ich warte hier. Mit Tee."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole dir die Inschrift. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Oh! Hier, Kohle und Papier. Schreib alles ab, auch was du für Kratzer hältst.",
          "Drinnen ist es dunkel. Die Erbauer haben Spiegel gesetzt, um Licht hinunterzuholen. Und etwas lebt dort unten. Etwas, das den Sand mag."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Inschrift wartet seit tausend Jahren. Ich seit dreißig. Wir können beide noch warten."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Die Abschrift übergeben.", wenn: { hat: "tempelabschrift" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "tempelabschrift" }],
          zeilen: ["Hasim liest mit dem Finger, die Lippen bewegen sich. Dann hält er inne.", "Hier – ein Turm über drei Wellen. Die Wacht. Sie war dort. Vor uns allen.",
            "Und hier: Mythara. Ein Name für das Land, bevor es zerbrach. Danke. Danke! Die Tafelberge stehen dir offen – das Ureisen dort gehört dem, der es holt."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Und trink Wasser!"] } }] },
      ],
    },
  },
  schalter: { sandmutter_kammer: LAEUFT, ureisen_tafelberge: FERTIG },
  glueckwunsch: "Die Sandmutter schläft für immer. Der Tempel spricht wieder. Danke, Fremder.",
  belohnungText: "Belohnung: Magie 5.000, Defense 5.000 XP, 1.500 Splitter · danach: Ureisen in den Tafelbergen; in der Kammer liegt ein Stück der Karte des Boten",
  belohnung: { xp: { magie: 5000, defense: 5000 }, splitter: 1500 },
  punkte: 3,
};
