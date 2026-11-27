/*
 * Riftmere – Nebenquest „Der Kräuterhof“ (Phase 10), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-10.md. Zweite Kräuterkunde-Quest: Kräuterbäuerin Frieda Saat im Küstenwald will Ringelblumen und Moorglöckchen züchten.
 * QUER: Ringelblumensamen von Mira Kräuterlieb (Waldmark), Moorglöckchen-Ableger von Mutter Hedda (Rabenmoor). Beide Beete anlegen, aus der ersten Ernte zwei Heiltränke brauen.
 * Lohn: Kräuterkunde 2.500 XP, 300 Splitter, 1 Questpunkt; danach wachsen auf dem Kräuterhof Ringelblume und Moorglöckchen (Schalter kraeuterhof_beete).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 10 (Kräuterhof, Kessel dort) und Phase 5c (Kräuterkunde). Liste: doku/quests/g-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { MIRA as MIRA_Q } from "./quest_mira";
import { MIRA, HEDDA, KRAEUTERHOF } from "./quest_g_orte";

export const KRAEUTERHOF_ID = "kueste_der_kraeuterhof";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Ringelblumen-Samen hat Mira in der Waldmark. Sie hat mir mal welche versprochen, als wir jung waren.", "Moorglöckchen wachsen nur, wo's nass ist. Mutter Hedda im Rabenmoor hat Ableger – wenn sie dich mag.",
  "Dann in die Beete, hinter dem Haus. Und aus der ersten Ernte zwei Heiltränke, am Kessel hier. Dann weiß ich, dass es taugt."];

export const QUEST_KRAEUTERHOF: QuestDef = {
  id: KRAEUTERHOF_ID, titel: "Der Kräuterhof", ort: "Smaragdküste · Waldmark · Rabenmoor", start: "Sprich mit der Kräuterbäuerin Frieda Saat auf dem Kräuterhof im Küstenwald.",
  logNeu: "Auf dem Kräuterhof im Küstenwald liegen zwei Beete brach. Die Bäuerin kniet davor und schüttelt den Kopf.",
  logAngeboten: "Frieda Saat auf dem Kräuterhof sucht Samen und Ableger für ihre Beete.",
  logAbgabe: "Bring Frieda Saat die zwei Heiltränke aus der ersten Ernte.",
  logFertig: "Auf dem Kräuterhof im Küstenwald blühen Ringelblumen und Moorglöckchen – mitten an der Küste, wo sie eigentlich nicht wachsen.",
  geber: "frieda",
  figuren: [
    { id: "frieda", name: "Frieda Saat", modell: "npcfrau3d", x: KRAEUTERHOF.baeuerin[0], y: KRAEUTERHOF.baeuerin[1], blick: [0, 1] },
    { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: MIRA[0], y: MIRA[1], blick: [0, -1] },
    { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: HEDDA[0], y: HEDDA[1], blick: [1, 0] },
  ],
  voraussetzungen: [
    { text: "„Miras Rezeptbuch“ abgeschlossen", wenn: { quest: { id: MIRA_Q, phase: ["fertig"] } } },
    { text: "Kräuterkunde 20", wenn: { skill: { k: "kraeuterkunde", min: 20 } } },
  ],
  schritte: [
    { id: "samen", text: "Ringelblumensamen von Mira holen", ereignis: { art: "antwort" }, bei: "mira", gruppe: "saat",
      log: "Hol Ringelblumensamen bei Mira in der Waldmark und Moorglöckchen-Ableger bei Hedda im Rabenmoor ({n:saat})." },
    { id: "ableger", text: "Moorglöckchen-Ableger von Hedda holen", ereignis: { art: "antwort" }, bei: "hedda", gruppe: "saat",
      log: "Hol Ringelblumensamen bei Mira in der Waldmark und Moorglöckchen-Ableger bei Hedda im Rabenmoor ({n:saat})." },
    { id: "beet_1", text: "Die zwei Beete anlegen", ereignis: { art: "objekt", id: "kh_beet_1" }, nach: ["samen"], gruppe: "beete", wo: KRAEUTERHOF.beet_1,
      log: "Leg hinter dem Kräuterhof die zwei Beete an – Ringelblume und Moorglöckchen ({n:beete})." },
    { id: "beet_2", text: "Die zwei Beete anlegen", ereignis: { art: "objekt", id: "kh_beet_2" }, nach: ["ableger"], gruppe: "beete", wo: KRAEUTERHOF.beet_2,
      log: "Leg hinter dem Kräuterhof die zwei Beete an – Ringelblume und Moorglöckchen ({n:beete})." },
    { id: "traenke", text: "Zwei Heiltränke aus der ersten Ernte brauen", ereignis: { art: "herstellen", rezept: "brauen_heiltrank" }, anzahl: 2, nach: ["beet_1", "beet_2"], wo: KRAEUTERHOF.kessel,
      log: "Brau am Kessel des Kräuterhofs zwei Heiltränke ({n:traenke}) – Ringelblume aus dem neuen Beet und Wegerich." },
  ],
  objekte: [
    { id: "kh_beet_1", name: "Brachbeet", x: KRAEUTERHOF.beet_1[0], y: KRAEUTERHOF.beet_1[1], modell: "stelle", tat: "benutzen", tatText: "Die Samen säen", weit: 2.5,
      braucht: { wenn: { hat: "ringelblumensamen" }, text: "Ein Beet, frisch umgegraben. Es fehlen Samen." }, nehmen: [{ g: "ringelblumensamen" }],
      text: "Du drückst die Samen in die feuchte Küstenerde. Frieda gießt hinterher und murmelt etwas, das wie ein Gebet klingt ({n:beete}).",
      schon: "Das Ringelblumenbeet grünt.", sonst: [{ wenn: NEU, text: "Ein brachliegendes Beet." }, { wenn: FERTIG, text: "Ringelblumen, gelb wie Butter." }] },
    { id: "kh_beet_2", name: "Nasses Beet", x: KRAEUTERHOF.beet_2[0], y: KRAEUTERHOF.beet_2[1], modell: "stelle", tat: "benutzen", tatText: "Die Ableger setzen", weit: 2.5,
      braucht: { wenn: { hat: "moorgloeckchen_ableger" }, text: "Ein Beet, das Frieda mit Moorerde gefüllt hat. Es fehlen Ableger." }, nehmen: [{ g: "moorgloeckchen_ableger" }],
      text: "Die Ableger aus dem Moor sinken in die nasse Erde, als wären sie zu Hause. Frieda staunt ({n:beete}).",
      schon: "Die Moorglöckchen läuten leise, wenn Wind geht.", sonst: [{ wenn: NEU, text: "Ein Beet mit schwarzer Moorerde." }, { wenn: FERTIG, text: "Moorglöckchen, mitten an der Küste." }] },
  ],
  /* Frieda: Kräuterbäuerin, geduldig, redet mit Pflanzen. Mira: munter, plappert. Hedda: spöttisch, „Kind“. */
  dialoge: {
    frieda: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Zwei Beete. Und nichts drin. Die Küste ist zu salzig für alles, was ich kenne.", "Aber Mira sagt, Ringelblumen halten alles aus. Und Hedda sagt, Moorglöckchen auch. Wenn man sie fragt."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Kräuter? Noch nicht. Bald."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Sie wachsen! Beide! Ich red jeden Morgen mit ihnen. Sie antworten nicht, aber sie wachsen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, anzahl: { g: "heiltrank", min: 2 } }, zeilen: ["Aus meinen Beeten? Zeig her."], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gebraut hast du? Und wo sind sie?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["beet_1", "beet_2"] }, zeilen: ["Beide Beete! Jetzt brau mir zwei Heiltränke aus der ersten Ernte. Dann weiß ich, dass es taugt."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Samen von Mira, Ableger von Hedda. Dann in die Beete."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole Samen und Ableger. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Mira in der Waldmark, Hedda im Rabenmoor. Grüß beide von mir. Hedda wird so tun, als kennt sie mich nicht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Beete warten. Sie sind geduldig. Ich weniger."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Die zwei Heiltränke geben.", wenn: { anzahl: { g: "heiltrank", min: 2 } }, folge: [{ f: { abschluss: true, nehmen: [{ g: "heiltrank", n: 2 }],
          zeilen: ["Frieda riecht an der Flasche, dann trinkt sie einen Schluck. Sie lächelt.", "Ringelblume von der Küste. Wer hätte das gedacht. Komm wieder, wann du willst – nimm dir, was blüht."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Wachs gut!"] } }] },
      ],
    },
    mira: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["samen"] }, zeilen: ["Frieda? Frieda Saat? An der Küste? Oh, die gute alte Frieda!", "Samen will sie? Ringelblumen? Natürlich! Wo hab ich … da. Nein. Da!"], antworten: ["samen_nehmen", "tschuess"] },
        { zeilen: ["Bleib gesund! Und wenn nicht – du weißt, wo du mich findest."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "samen_nehmen", text: "Die Samen nehmen.", folge: [{ f: { erledige: ["samen"], geben: [{ g: "ringelblumensamen", name: "ein Tütchen Ringelblumensamen" }], zeilen: ["Hier. Sag ihr, sie soll sie nicht zu nass halten. Und dass sie mir schreiben soll. Sie schreibt nie."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bleib gesund!"] } }] },
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["ableger"] }, zeilen: ["Frieda Saat. Hm. Die hat mir vor dreißig Jahren eine Brennnessel ins Bett gelegt.", "…Ableger will sie? Für die Küste? Die werden ertrinken. Im Salz."], antworten: ["ableger_bitten", "tschuess"] },
        { zeilen: ["Na, Kind? Krank oder neugierig? Beides kostet."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "ableger_bitten", text: "Bitte. Sie hat ein Beet mit Moorerde gefüllt.", folge: [{ f: { erledige: ["ableger"], geben: [{ g: "moorgloeckchen_ableger", name: "Moorglöckchen-Ableger" }],
          zeilen: ["Moorerde? An der Küste? …Die alte Närrin.", "Hier. Drei Ableger, in nassem Moos. Und sag ihr, das mit der Brennnessel hab ich nicht vergessen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
  },
  schalter: { kraeuterhof_beete: FERTIG },
  belohnungText: "Belohnung: Kräuterkunde 2.500 XP, 300 Splitter · danach: auf dem Kräuterhof wachsen Ringelblume und Moorglöckchen",
  belohnung: { berufe: { kraeuterkunde: 2500 }, splitter: 300 },
  punkte: 1,
};
