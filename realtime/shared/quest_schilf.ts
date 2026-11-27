/*
 * Riftmere – Quest „Schilf und Schnur“ (Phase 3b, Einführung in Fischen und Kochen), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-3.md Abschnitt 3b, doku/quests/2-hinter-der-sperre.pdf. Lambert Schilf, Angler am Mühlgraben in Weidenhain.
 * Würmer graben (Äcker des Osthofs), drei Bachlinge aus dem Mühlgraben, einen am Erntefeuer braten, Lambert kosten lassen.
 * Lohn: Fischen- und Kochen-XP, 20 Würmer, 1 Questpunkt. Kanon 26.11.: nur eine Angelrute ohne Stufen, keine „Lamberts Rute“ –
 * Lambert gibt seine alte Angelrute nur, wenn man keine hat.
 *
 * Seit Phase 3b (Issue #4) im Spiel (shared/quests.ts). Bausteine – Kennungen siehe doku/quests/3b-bausteine.md:
 * Sammelziel „wurmacker“ (Ertrag wurm), Fischen meldet „sammeln“ mit der Fischart als Ziel („bachling“), Rezept „fisch_bachling_gebraten“ (Station Feuer),
 * Gegenstände angelrute, wurm, fisch_bachling_roh, fisch_bachling_gebraten.
 */
import type { QuestDef, Bed, Geben } from "./questbau";

export const SCHILF = "weidenhain_schilf_und_schnur";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Lambert am Mühlgraben, oberhalb der Wassermühle (Vorschlag, Welt prüft die Stelle) */
const LAMBERT: [number, number] = [6462.5, 6687.5] /* 6463,5 · 6686,5 war im Gehraster gesperrt (Mühlengebäude) – das freie Ufer-Feld daneben (Integration, 26.11.) */, ACKER: [number, number] = [6512.5, 6440.5], GRABEN: [number, number] = [6464.5, 6688.5], FEUER: [number, number] = [6442, 6687.9];
const RUTE: Geben[] = [{ g: "angelrute", name: "Lamberts alte Angelrute", fehlt: true, gleich: "^angelrute" }];
const HILFE = ["Würmer zuerst. Auf den Äckern am Osthof, wo die Erde schwer ist. Drei Hände voll.",
  "Dann hierher, an den Graben. Rute rein, Wurm dran, warten. Drei Bachlinge.", "Einen davon bratest du am Erntefeuer auf dem Dorfplatz. Und den bringst du mir. Ich hab Hunger."];

export const QUEST_SCHILF: QuestDef = {
  id: SCHILF, titel: "Schilf und Schnur", ort: "Einführung in Fischen und Kochen · Weidenhain", start: "Sprich mit Lambert Schilf am Mühlgraben in Weidenhain.",
  logNeu: "Am Mühlgraben in Weidenhain sitzt ein Mann im Schilf und rührt sich nicht. Nur die Angelschnur zittert.",
  logAngeboten: "Lambert Schilf am Mühlgraben in Weidenhain würde dir das Angeln zeigen. Er sitzt noch da. Er sitzt immer da.",
  logAbgabe: "Du hast einen Bachling gebraten. Bring ihn Lambert Schilf am Mühlgraben in Weidenhain.",
  logFertig: "Lambert Schilf hat dir das Angeln gezeigt. Bachlinge beißen im Mühlgraben, am Bach der Obstwiesen und im Ried am Moorrand. Braten kannst du sie an jedem Feuer.",
  geber: "lambert",
  figuren: [{ id: "lambert", name: "Lambert Schilf", modell: "npc.lambert", x: LAMBERT[0], y: LAMBERT[1], blick: [1, 0] }],
  voraussetzungen: [{ text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } }],
  schritte: [
    { id: "wuermer", text: "Würmer graben", ereignis: { art: "sammeln", ziel: "wurmacker" }, anzahl: 3, wo: ACKER,
      log: "Grab auf den Äckern des Osthofs nach Würmern ({n:wuermer})." },
    { id: "fang", text: "Drei Bachlinge fangen", ereignis: { art: "sammeln", ziel: "bachling" }, anzahl: 3, nach: ["wuermer"], wo: GRABEN,
      log: "Fang im Mühlgraben von Weidenhain drei Bachlinge – Angelrute und Würmer im Rucksack ({n:fang})." },
    { id: "braten", text: "Einen Bachling am Erntefeuer braten", ereignis: { art: "herstellen", rezept: "fisch_bachling_gebraten" }, nach: ["fang"], wo: FEUER,
      log: "Brat einen Bachling am Erntefeuer auf dem Dorfplatz von Weidenhain. Verbrennt er, versuch es mit dem nächsten." },
  ],
  /* Lambert: leise, langsam, redet über Fische wie über Nachbarn. Kein Satz zu viel – der Graben hört mit. Je Schritt eine eigene Begrüßung. */
  dialoge: {
    lambert: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Psst.", "…", "Weg ist er. Der Dicke unter der Wurzel. Seit drei Sommern lacht er mich aus."],
          antworten: ["annehmen", "wer", "spaeter"] },
        { wenn: NEU, zeilen: ["Psst. Du machst die Fische nervös.", "Wie bist du überhaupt hergekommen? Die Straße ist doch gesperrt."], antworten: ["wer", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Na. Beißen sie?", "Im Graben die Bachlinge. Weiter unten, wo's tiefer ist, die Barsche – wenn du so weit bist. Der Dicke unter der Wurzel gehört aber mir."],
          antworten: ["wer", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "fisch_bachling_gebraten" }, zeilen: ["Riecht man bis hier. Na komm, her damit."], antworten: ["abgeben", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gebraten hast du ihn, sagst du. Und wo ist er?", "Gegessen? …Na, dann weißt du ja, wie er schmeckt."], antworten: ["abgeben", "tschuess"] },
        { wenn: { erledigt: ["fang"] }, zeilen: ["Drei Stück. Nicht schlecht für den ersten Tag.", "Jetzt einen davon ans Feuer. Nicht zu nah, nicht zu lang – sonst wird er Kohle."],
          antworten: ["hilfe", "rute", "tschuess"] },
        { wenn: { erledigt: ["wuermer"], zaehler: { schritt: "fang", min: 1 } }, zeilen: ["Einer zappelt schon im Korb. Hab's gehört.", "Weiter. Nicht reden. Angeln."],
          antworten: ["hilfe", "rute", "tschuess"] },
        { wenn: { erledigt: ["wuermer"] }, zeilen: ["Gute Würmer. Fett. Die Bachlinge werden sich freuen.", "Rute ins Wasser, gleich hier am Graben. Und still sein."],
          antworten: ["hilfe", "rute", "tschuess"] },
        { zeilen: ["Ohne Würmer beißt hier nichts. Nicht mal ich.", "Die Äcker am Osthof. Da, wo die Erde schwer ist."], antworten: ["hilfe", "rute", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Zeig mir, wie man angelt. (Quest annehmen)", folge: [{ f: { start: true, geben: RUTE, zeilen: ["Zeigen. Hm. Angeln zeigt man nicht. Angeln wartet man.",
          "Aber gut. Erst Würmer, drei Hände voll, von den Äckern am Osthof. Dann drei Bachlinge aus dem Graben. Einen bratest du am Erntefeuer.",
          "Und den bringst du mir. Das ist der Preis."] } }] },
        { id: "wer", text: "Wer bist du?", folge: [
          { wenn: FERTIG, f: { weiter: true, zeilen: ["Lambert. Schilf heißen wir, seit einer von uns im Schilf eingeschlafen ist. Mein Großvater, glaub ich.", "Jetzt kennst du den Graben fast so gut wie ich. Fast."] } },
          { f: { weiter: true, zeilen: ["Lambert. Schilf heißen wir, seit einer von uns im Schilf eingeschlafen ist. Mein Großvater, glaub ich.",
            "Früher hab ich Fisch nach Graufurt gebracht. Seit die Straße zu war, essen ihn die Weidenhainer selbst. Die beschweren sich nicht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Mhm. Ich bin hier.", "Ich bin immer hier."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "rute", text: "Ich habe keine Angelrute.", folge: [{ f: { weiter: true, geben: RUTE, zeilen: ["Hier. Meine alte. Biegt sich, bricht aber nicht. Wie ich."],
          nichtsZuGeben: ["Doch, hast du. Schau in den Rucksack.", "Und eine bessere gibt's nicht. Eine Rute ist eine Rute. Den Fisch fängt der, der sie hält."] } }] },
        { id: "abgeben", text: "Den gebratenen Bachling geben.", folge: [
          { wenn: { hat: "fisch_bachling_gebraten" }, f: { abschluss: true, nehmen: [{ g: "fisch_bachling_gebraten" }], zeilen: ["Lambert riecht daran, beißt hinein und kaut lange. Sehr lange.",
            "…Gut. Ein bisschen zu lang am Feuer. Aber gut.", "Würmer hast du verbraucht, hier, nimm meine. Und jetzt geh angeln. Allein. Ich hab zu tun."] } },
          { f: { abschluss: true, zeilen: ["Na gut. Ich glaub dir.", "Wer drei Bachlinge aus dem Graben holt, kann auch einen braten. Hier, Würmer für den Weg. Und jetzt geh angeln. Allein."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ wenn: FERTIG, f: { zeilen: ["Mhm. Petri."] } }, { f: { zeilen: ["Psst."] } }] },
      ],
    },
  },
  glueckwunsch: "Mhm. Du angelst jetzt. Allein. Und der Dicke unter der Wurzel gehört trotzdem mir.",
  belohnungText: "Belohnung: Fischen- und Kochen-XP, 20 Würmer · Lambert gibt dir seine alte Angelrute, wenn du keine hast",
  belohnung: { berufe: { fischen: 250, kochen: 120 }, gegenstaende: [{ g: "wurm", n: 20 }] },
  punkte: 1,
};
