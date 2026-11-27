/*
 * Riftmere – Quest C3 „Der Oberste Rabenpriester“ (Phase 6, Raben-Trilogie Teil 3), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/3-raben-trilogie.pdf (Seite 7–8), doku/konzepte/phase-6.md. Mutter Hedda gibt den Auftrag, Bertold Krähe den Lohn.
 * QUER: Heddas Moorwasser muss erst am Bindestein an der Linde in Weidenhain geweiht werden (Wegstein), sonst trübt es das Becken nicht.
 * Abstieg durch die Gruft, Federgänge, Kerkerschlüssel vom Kerkermeister, die vier Käfige (Liske und die anderen folgen bis zur Treppe), Heddas Moorwasser
 * ins Splitterbecken (dann heilt sich der Oberste nicht), der Oberste Rabenpriester im Thronsaal (Instanz), Liske bei Hedda, Fest im Langhaus.
 * Lohn: Rabenpanzer (Set komplett), je 1.000 XP Geschick, Stärke, Defense, 1.000 Splitter, 2 Questpunkte.
 * Boss-Regel (#116): Im Thronsaal kämpfst du in der Quest allein gegen eine schwächere Fassung (Schalter rabenpriester_thronsaal, Eintritt mit einem Federsiegel –
 * Hedda gibt eines mit), danach die stärkere öffentlich oder als eigene Instanz (rabenpriester_danach). Das Becken trübt der Schalter becken_getruebt.
 * Danach: Wegstein-Ziel „Aschenwerth“, Bindestein am gereinigten Becken (Schalter bindestein_becken).
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Kerkermeister, Moorwasser 364c6523). Stellen: rabengrund (Ursprung 10560 | 9600), rabengrund_thronsaal (10752 | 9600).
 * Liste: doku/quests/c-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { C2 } from "./quest_c2";

export const C3 = "rabengrund_der_oberste";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HEDDA: [number, number] = [6289.4, 6677.4], LISKE: [number, number] = [6291.5, 6679.5], BERTOLD: [number, number] = [6320, 6697], GRUFT: [number, number] = [6188, 6726.6];
/** Rabengrund: Kerker 85 | 16, Splitterbecken 92 | 67,2, Tor zum Thronsaal 115 | 62 · Thronsaal Mitte 16 | 16 */
const LINDE: [number, number] = [6453.2, 6679.4], KERKER: [number, number] = [10645, 9616], BECKEN: [number, number] = [10652, 9667.2], THRON: [number, number] = [10768, 9616];
const HILFE = ["Durch die Gruft hinunter. Raben in den Gängen, viele, klein. Lass dich nicht einkreisen.",
  "Der Kerkermeister hat den Schlüssel. Lass sie raus, alle vier. Sie finden den Weg zur Treppe, wenn du ihnen vorangehst.",
  "Das Moorwasser trägst du erst zur Linde nach Weidenhain, an den Bindestein – geweiht trübt es das Becken. Dann gießt du es hinein, bevor du zu ihm gehst.", "Und dann … komm wieder. Mit Liske."];

export const QUEST_C3: QuestDef = {
  id: C3, titel: "Der Oberste Rabenpriester", ort: "Aschenwerth · Rabengrund · Rabenmoor", start: "Sprich mit Mutter Hedda vor ihrer Hütte in Rabenmoor.",
  logNeu: "Unter der Gruft auf Aschenwerth liegt der Rabengrund. Mutter Hedda weiß, wer dort unten ist.",
  logAngeboten: "Mutter Hedda wartet, bis du bereit bist, in den Rabengrund hinabzusteigen.",
  logAbgabe: "Der Oberste Rabenpriester ist gefallen, Liske ist frei. Rabenmoor feiert im Langhaus – Bertold Krähe wartet auf dich.",
  logFertig: "Der Oberste Rabenpriester ist besiegt, das Rabenset ist vollständig. Am gereinigten Becken liegt ein Bindestein. Und der Oberste … kehrt zurück, für jeden, der ein Federsiegel bringt.",
  geber: "hedda", abgabe: "bertold",
  figuren: [
    { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: HEDDA[0], y: HEDDA[1], blick: [1, 0] },
    { id: "liske", name: "Liske", modell: "npc.liske", x: LISKE[0], y: LISKE[1], blick: [-1, 0] },
    { id: "bertold", name: "Bertold Krähe", modell: "npc.bertold", x: BERTOLD[0], y: BERTOLD[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Der Gesang der Spiralsteine“ abgeschlossen", wenn: { quest: { id: C2, phase: ["fertig"] } } },
    { text: "Defense 30", wenn: { skill: { k: "defense", min: 30 } } },
  ],
  schritte: [
    { id: "abstieg", text: "Durch die Gruft in den Rabengrund hinabsteigen", ereignis: { art: "betreten", region: "rabengrund" }, wo: GRUFT,
      log: "Steig durch die Gruft auf Aschenwerth hinab in den Rabengrund. (Heldenlevel 40 empfohlen.)" },
    { id: "schluessel", text: "Den Kerkerschlüssel erbeuten", ereignis: { art: "aufheben", g: "kerkerschluessel" }, nach: ["abstieg"], wo: KERKER,
      log: "Der Kerkermeister trägt den Schlüssel zu den Käfigen. Nimm ihn ihm ab." },
    { id: "kaefige", text: "Die Gefangenen befreien", ereignis: { art: "objekt", id: "c3_kaefige" }, nach: ["schluessel"], wo: KERKER,
      log: "Schließ die vier Käfige im Kerker auf." },
    { id: "weihen", text: "Das Moorwasser an der Linde weihen", ereignis: { art: "objekt", id: "c3_linde" }, wo: LINDE,
      log: "Heddas Moorwasser wirkt erst, wenn es geweiht ist. Halt die Phiole an den Bindestein unter der Linde in Weidenhain – der Wegstein bringt dich hin." },
    { id: "becken", text: "Das Moorwasser ins Splitterbecken gießen", ereignis: { art: "objekt", id: "c3_becken" }, nach: ["abstieg", "weihen"], wo: BECKEN,
      log: "Gieß Heddas Moorwasser ins Splitterbecken, damit der Oberste sich nicht daraus heilen kann." },
    { id: "oberster", text: "Den Obersten Rabenpriester besiegen", ereignis: { art: "erlegen", typ: "oberster_rabenpriester" }, nach: ["kaefige", "becken"], wo: THRON,
      log: "Im Thronsaal wartet der Oberste Rabenpriester – du gehst allein. Das Tor öffnet sich mit einem Federsiegel. Weich den dunklen Feldern aus, wenn er schwebt; geh hinter eine Säule, wenn er die Flügel hebt." },
    { id: "liske", text: "Liske bei Hedda wiedersehen", ereignis: { art: "antwort" }, nach: ["oberster"], bei: "liske",
      log: "Liske wartet oben bei Mutter Hedda in Rabenmoor." },
  ],
  objekte: [
    { id: "c3_linde", name: "Bindestein an der Linde", x: LINDE[0], y: LINDE[1], modell: "stelle", tat: "benutzen", tatText: "Das Moorwasser weihen", weit: 3,
      braucht: { wenn: { hat: "moorwasser" }, text: "Der Bindestein zwischen den Wurzeln der Linde. Hedda hat gesagt, du sollst ihr Moorwasser hierher bringen." },
      nehmen: [{ g: "moorwasser" }], geben: [{ g: "moorwasser_geweiht" }],
      text: "Du hältst die Phiole an den Stein. Das braune Wasser wird klar, dann golden, als hätte die Linde hineingeatmet. Agnes nickt dir von ihrer Bank aus zu.",
      schon: "Dein Moorwasser ist geweiht.", sonst: [{ wenn: NEU, text: "Der Bindestein zwischen den Wurzeln der Linde." }, { wenn: FERTIG, text: "Der Bindestein zwischen den Wurzeln der Linde." }] },
    { id: "c3_kaefige", name: "Käfige", x: KERKER[0], y: KERKER[1], modell: "stelle", tat: "benutzen", tatText: "Die Käfige aufschließen", weit: 3,
      braucht: { wenn: { hat: "kerkerschluessel" }, text: "Vier Käfige, schwere Schlösser. Ohne den Schlüssel des Kerkermeisters geht keiner auf." }, nehmen: [{ g: "kerkerschluessel" }],
      text: "Ein Schloss nach dem anderen. Ebbos Bruder, zwei Fremde, die nicht wissen, welcher Tag ist – und ein Mädchen mit Jorins Augen. „Liske?“ Sie nickt. Sie folgen dir zur Treppe.",
      schon: "Die Käfige stehen offen und leer.", sonst: [{ wenn: NEU, text: "Vier Käfige an der Wand." }, { wenn: FERTIG, text: "Die Käfige stehen offen und leer." }] },
    { id: "c3_becken", name: "Splitterbecken", x: BECKEN[0], y: BECKEN[1], modell: "stelle", tat: "benutzen", tatText: "Das Moorwasser hineingießen", weit: 3,
      braucht: { wenn: { hat: "moorwasser_geweiht" }, text: "Das Becken ist voll von etwas, das wie Wasser aussieht und wie Splitter leuchtet. Ohne geweihtes Moorwasser trübst du es nicht." },
      nehmen: [{ g: "moorwasser_geweiht" }],
      text: "Das braune Moorwasser zieht in Schlieren durch das Leuchten. Das Becken wird trüb, das Licht matt. Irgendwo hinter dem Tor schreit etwas.",
      schon: "Das Becken ist trüb.", sonst: [{ wenn: NEU, text: "Das Becken ist voll von etwas, das wie Wasser aussieht und wie Splitter leuchtet." }, { wenn: FERTIG, text: "Das Becken ist zerbrochen. Darüber schwebt ein stilles Licht." }] },
  ],
  /* Bindestein an der Linde: dasselbe Weidenhain wie B1 (Agnes) – das Moorwasser wird geweiht */
  /* Hedda: gefasst, aber die Stimme bricht bei Liske. Liske: still, müde, will nach Hause zu Jorin. Bertold: feierlich, endlich erleichtert. */
  dialoge: {
    hedda: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Du bist ausgeruht. Gut. Dann hör zu.", "Unter dem Stein ist ein Ort. Meine Großmutter nannte ihn den Rabengrund. Dort füttert einer ein Becken mit Splittern – und mit dem, was er den Leuten abnimmt."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Na, Kind? Krank oder neugierig? Beides kostet."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Liske schläft bei mir. Jorin weicht ihr nicht von der Seite.", "Danke, Kind. Das sag ich nicht oft."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["oberster"] }, zeilen: ["Sie ist hier. Sie ist wirklich hier. Geh zu ihr."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kaefige"] }, zeilen: ["Ebbos Bruder ist oben angekommen. Er sagt, du hast sie alle rausgelassen. Und Liske?", "…Dann geh und bring es zu Ende."], antworten: ["hilfe", "moorwasser", "tschuess"] },
        { zeilen: ["Durch die Gruft hinunter. Und vergiss das Moorwasser nicht."], antworten: ["hilfe", "moorwasser", "siegel", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gehe hinunter. (Quest annehmen)", folge: [{ f: { start: true, geben: [{ g: "moorwasser", name: "eine Phiole Moorwasser", fehlt: true }, { g: "federsiegel", name: "ein Federsiegel", fehlt: true }],
          zeilen: ["Dann nimm das. Moorwasser, vom tiefsten Loch im Moor. Trag es zur Linde nach Weidenhain und lass es am Bindestein weihen. Dann gieß es ins Becken, bevor du ihm gegenübertrittst.", "Und bring sie nach Hause. Alle, die noch laufen können."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Sie warten schon lange. Ein paar Tage mehr … ich hoffe, sie halten das aus."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "moorwasser", text: "Ich brauche noch Moorwasser.", folge: [{ f: { weiter: true, geben: [{ g: "moorwasser", name: "eine Phiole Moorwasser", fehlt: true }], zeilen: ["Hier. Verschütt's nicht."],
          nichtsZuGeben: ["Du hast doch eine Phiole. Oder ist sie schon im Becken? Dann brauchst du keine mehr."] } }] },
        { id: "siegel", text: "Ich brauche ein Federsiegel für den Thronsaal.", wenn: { phase: ["laeuft"], offen: ["oberster"] }, folge: [{ f: { weiter: true, geben: [{ g: "federsiegel", name: "ein Federsiegel", fehlt: true }],
          zeilen: ["Hier. Eins von denen, die du mir gebracht hast.", "Der Altar frisst es. Jedes Mal eins. Also stirb nicht zu oft."], nichtsZuGeben: ["Du hast doch eins. Schau in den Rucksack."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
    liske: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["oberster"], offen: ["liske"] }, zeilen: ["Du bist die aus dem Kerker. Die mit dem Schlüssel.", "Ist er … ist er wirklich weg?"], antworten: ["sprechen"] },
        { wenn: { erledigt: ["liske"] }, zeilen: ["Jorin sagt, im Langhaus wird gefeiert. Geh hin. Ich komm später. Ich bin noch so müde."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ich träume noch von den Federn. Aber weniger."], antworten: ["tschuess"] },
        { zeilen: ["Ein Mädchen sitzt neben Hedda, in eine Decke gewickelt. Sie schaut auf das Moor hinaus."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "sprechen", text: "Er ist weg. Du bist zu Hause.", folge: [{ f: { erledige: ["liske"], zeilen: ["Liske nickt. Dann weint sie, ganz leise.",
          "Er hat gesagt, wir sind keine Menschen mehr, nur Splitter mit Beinen. Er hat gelogen, oder?", "…Danke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bis bald."] } }] },
      ],
    },
    bertold: {
      reden: [
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Da ist er ja! Platz machen, Platz!", "Rabenmoor feiert, und du sitzt am Kopf des Tisches. Keine Widerrede."], antworten: ["fest"] },
        { wenn: FERTIG, zeilen: ["Steht dir, der Panzer. Harm hat drei Nächte daran gearbeitet."], antworten: ["tschuess"] },
        { zeilen: ["Hedda sagt, du gehst hinunter. Komm wieder. Rabenmoor hat genug Leute verloren."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "fest", text: "Mitfeiern. (Quest abschließen)", folge: [{ f: { abschluss: true, zeilen: ["Das Torffeuer brennt hoch, Joost spielt Fiedel, schlecht. Ebbo lacht zum ersten Mal.",
          "Bertold steht auf, und es wird still. Harm reicht ihm etwas Schwarzes, Glänzendes.", "Aus den Federn des Obersten. Harm hat ihn geschmiedet, ich überreiche ihn. Für den, der Liske nach Hause gebracht hat.",
          "Und der Splitter, den er gesammelt hat … das Becken ist zerbrochen, aber es leuchtet noch. Hedda sagt, man kann dort jetzt Steine laden. Wie an der Linde in Weidenhain."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
  },
  /* Kerkerschlüssel: vom Kerkermeister, solange er fehlt (Rolle Spiel: chance 100) */
  beute: { c3_kerkerschluessel: { erledigt: ["abstieg"], offen: ["schluessel"] } },
  /* Thronsaal (shared/bosse.ts): in der Quest allein und schwächer, sobald Käfige und Becken erledigt sind; danach öffentlich oder eigene Instanz */
  schalter: { rabenpriester_thronsaal: { phase: ["laeuft"], erledigt: ["kaefige", "becken"], offen: ["oberster"] }, becken_getruebt: [{ erledigt: ["becken"] }, FERTIG],
    bindestein_becken: FERTIG, rabenpriester_danach: FERTIG },
  glueckwunsch: "Der Oberste ist gefallen, und unsere Leute sind zu Hause. Rabenmoor feiert. Mit dir.",
  belohnungText: "Belohnung: der Rabenpanzer (Set komplett), je 1.000 XP Geschick, Stärke und Defense, 1.000 Splitter · danach: Wegstein-Ziel Aschenwerth, Bindestein am Becken, der Oberste als Boss",
  belohnung: { xp: { geschick: 1000, staerke: 1000, defense: 1000 }, splitter: 1000, gegenstaende: [{ g: "rabenpanzer" }] },
  punkte: 2,
};
