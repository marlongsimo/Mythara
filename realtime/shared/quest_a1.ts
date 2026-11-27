/*
 * Riftmere – Quest A1 „Sehnen für den Wachturm“ (Phase 2 „Waldland“, 26.11.2026), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/1-erste-schritte.pdf. Gesa Brandt, Wachführerin am Südtor der Waldmark (statt einer der zwei namenlosen Wachen).
 * Werkbank, Flachs, Holz, ein Bogen in zwei Schritten (Quest-Rezept „Wachbogen“) und die Zielscheibe (Ereignis „treffen“, nur Fernkampf).
 * Lohn: der Wachbogen (einer der zwei bleibt bei Gesa), 300 Fernkampf-XP, 40 Splitter, 1 Questpunkt; danach bleiben die Zielscheiben (bis Fernkampf 10).
 */
import type { QuestDef, Bed, Geben } from "./questbau";

export const A1 = "waldmark_sehnen_fuer_den_wachturm";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const G = "Gesa Brandt", ICH = "Du";
const BEIL: Geben[] = [{ g: "holzbeil_training", name: "ein Trainingsbeil", fehlt: true, gleich: "^holzbeil_" }];
const WERKBANK: [number, number] = [6530.5, 6426.5], SCHEIBEN: [number, number] = [6434.5, 6461];
const HILFE = ["Noch einmal, langsam:", "Zwei Flachs vom Feld im Osthof, an der Werkbank daneben zu Sehnen drehen.",
  "Zwei Eichen fällen – im Kreuzwald, gleich südwestlich vom Tor, stehen welche. An der Werkbank zwei Wachbögen schnitzen.",
  "Sehne auf Bogen, im Rucksack. Dann fünf Treffer an den Scheiben links vom Tor. Mit dem Bogen, nicht mit der Faust."];

export const QUEST_A1: QuestDef = {
  id: A1, titel: "Sehnen für den Wachturm", ort: "Waldmark · Osthof", start: "Sprich mit Wachführerin Gesa Brandt am Südtor der Waldmark.",
  logNeu: "Am Südtor der Waldmark steht Wachführerin Gesa Brandt. Sie sieht aus, als suche sie jemanden, der zupacken kann.",
  logAngeboten: "Gesa Brandt am Südtor wartet noch auf eine Antwort. Sie braucht Hilfe mit den Bögen der Wache.",
  logAbgabe: "Fünf Treffer – die Bögen taugen. Bring Gesa Brandt am Südtor einen der Wachbögen.",
  logFertig: "Die Wache hat wieder Bögen, und du hast deinen eigenen. Die Zielscheiben am Südtor darfst du weiter benutzen – bis Fernkampf 10 lernst du dort etwas.",
  geber: "gesa",
  figuren: [{ id: "gesa", name: G, modell: "stadtwache3d", x: 6445.2, y: 6458.6, blick: [0, -1] }],
  schritte: [
    { id: "flachs", text: "Zwei Flachs pflücken", ereignis: { art: "sammeln", ziel: "flachs" }, anzahl: 2, wo: [6511, 6414.5],
      log: "Pflücke zwei Flachs auf dem Feld im Osthof ({n:flachs})." },
    { id: "sehnen", text: "Zwei Bogensehnen drehen", ereignis: { art: "herstellen", rezept: "bogensehne" }, anzahl: 2, nach: ["flachs"], wo: WERKBANK,
      log: "Dreh an der Werkbank im Osthof zwei Bogensehnen ({n:sehnen})." },
    { id: "eichen", text: "Zwei Eichen fällen", ereignis: { art: "sammeln", ziel: "eiche" }, anzahl: 2, wo: [6411.5, 6477.5],
      log: "Fäll zwei Eichen – die nächsten stehen im Kreuzwald, südwestlich vom Tor ({n:eichen})." },
    { id: "schnitzen", text: "Zwei Wachbögen schnitzen", ereignis: { art: "herstellen", rezept: "wachbogen_ungespannt" }, anzahl: 2, nach: ["eichen"], wo: WERKBANK,
      log: "Schnitz an der Werkbank zwei Wachbögen aus Eichenholz ({n:schnitzen})." },
    { id: "bespannen", text: "Die Wachbögen bespannen", ereignis: { art: "herstellen", rezept: "wachbogen" }, anzahl: 2, nach: ["sehnen", "schnitzen"],
      log: "Benutze im Rucksack je eine Bogensehne auf einem Wachbogen ({n:bespannen})." },
    { id: "schiessen", text: "Fünf Treffer an der Zielscheibe", ereignis: { art: "treffen", ziel: "zielscheibe", waffe: "fern" }, anzahl: 5, nach: ["bespannen"], wo: SCHEIBEN,
      log: "Leg einen Wachbogen an und triff fünfmal die Zielscheiben links vom Südtor ({n:schiessen})." },
  ],
  dialoge: {
    gesa: {
      reden: [
        { wenn: NEU, zeilen: ["Du da. Kannst du einen Bogen spannen?", { wer: ICH, text: "…" }, "Nein? Gut. Dann lernst du heute zwei Dinge.",
          "Meine Wachen haben Bögen, aber keine Sehnen – der Winter hat sie spröde gemacht, und der Bogner ist vor Wochen nach Weidenhain gezogen. Ich brauche zwei neue Wachbögen. Du baust sie."],
          antworten: ["annehmen", "wer", "spaeter"] },
        { wenn: FERTIG, zeilen: ["Der Bogen hält? Natürlich hält er. Du hast ihn ja selbst gebaut.", "Die Scheiben stehen dir offen. Wenn du dort nichts mehr lernst, such dir lebende Ziele."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "wachbogen" }, zeilen: ["Fünf Treffer. Ich hab gezählt.", "Zeig her."], antworten: ["abgeben", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Gut geschossen – aber wo ist der Bogen? Einen will ich für die Wache."], antworten: ["tschuess"] },
        { wenn: { offen: ["schiessen"], erledigt: ["bespannen"] }, zeilen: ["Zwei Bögen mit Sehne. Jetzt beweis, dass sie taugen: fünf Treffer an den Scheiben links vom Tor ({n:schiessen})."], antworten: ["hilfe", "tschuess"] },
        { wenn: { erledigt: ["sehnen", "schnitzen"] }, zeilen: ["Sehnen und Bögen hast du. Sehne auf Bogen, im Rucksack – das schaffst du ohne Werkbank ({n:bespannen})."], antworten: ["hilfe", "tschuess"] },
        { wenn: { erledigt: ["flachs"], offen: ["sehnen"] }, zeilen: ["Flachs hast du. Jetzt ab an die Werkbank im Osthof und dreh zwei Sehnen draus ({n:sehnen})."], antworten: ["hilfe", "beil", "tschuess"] },
        { zeilen: ["Flachs vom Osthof, Eichen aus dem Kreuzwald, alles an der Werkbank zusammen. Steh nicht rum."], antworten: ["hilfe", "beil", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich baue dir die Bögen. (Quest annehmen)", folge: [{ f: { start: true, geben: BEIL, zeilen: ["Gut. Hier, der Weg zum Osthof – auf dem Zettel. Flachs pflücken, an der Werkbank zu Sehnen drehen.",
          "Dann zwei Eichen fällen und an derselben Werkbank zwei Wachbögen schnitzen. Sehne drauf, Probe schießen. Fertig.", "Und wenn dir ein Beil fehlt – hier, nimm meins."],
          nichtsZuGeben: ["Gut. Hier, der Weg zum Osthof – auf dem Zettel. Flachs pflücken, an der Werkbank zu Sehnen drehen.", "Dann zwei Eichen fällen und an derselben Werkbank zwei Wachbögen schnitzen. Sehne drauf, Probe schießen. Fertig."] } }] },
        { id: "wer", text: "Wer bist du?", folge: [{ f: { weiter: true, zeilen: ["Gesa Brandt. Ich führe die Wache der Waldmark – was davon übrig ist.", "Zwei Türme, ein Tor, sechs Leute. Und keine einzige brauchbare Sehne."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann geh mir aus dem Licht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "beil", text: "Mir fehlt ein Beil.", folge: [{ f: { weiter: true, geben: BEIL, zeilen: ["Hier. Bring es zurück, wenn du ein besseres hast. Oder behalt es."], nichtsZuGeben: ["Du hast doch eins. Benutz es."] } }] },
        { id: "abgeben", text: "Einen Wachbogen übergeben.", wenn: { hat: "wachbogen" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "wachbogen" }], zeilen: ["Gerade gewachsen, saubere Sehne. Der kommt auf den Turm.",
          "Den anderen behältst du. Ein Bogen, den man selbst gebaut hat, verzeiht einem mehr.", "Und die Scheiben – die bleiben für dich stehen. Bis du nichts mehr daran lernst."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    wachbogen_ungespannt: [{ wenn: { phase: ["neu", "fertig"] }, text: "Einen Wachbogen schnitzt du nur im Auftrag von Gesa Brandt." }, { wenn: { erledigt: ["schnitzen"] }, text: "Zwei Wachbögen sind genug." }],
    wachbogen: [{ wenn: { phase: ["neu", "fertig"] }, text: "Den Wachbogen bespannst du nur im Auftrag von Gesa Brandt." }, { wenn: { erledigt: ["bespannen"] }, text: "Beide Wachbögen haben schon eine Sehne." }],
  } },
  schalter: { zielscheibe_frei: FERTIG },
  glueckwunsch: "Der Bogen hält. Natürlich hält er. Du hast ihn ja selbst gebaut.",
  belohnungText: "Belohnung: dein eigener Wachbogen, 300 Fernkampf-XP, 40 Splitter · danach: die Zielscheiben am Südtor (Training bis Fernkampf 10)",
  belohnung: { xp: { fernkampf: 300 }, splitter: 40 },
  punkte: 1,
};
