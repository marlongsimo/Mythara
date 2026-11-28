/*
 * Riftmere – Quest A3 „Die Mühle steht still“ (Phase 2 „Waldland“, 26.11.2026), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/1-erste-schritte.pdf. Till Mahler (bisher der namenlose Müllerjunge an der Windmühle im Osthof), Grete Korn (Bäckerin in der Waldmark).
 * Kupfer abbauen, Kupferbarren schmelzen, am Amboss ein Mühlenachslager schmieden (Quest-Rezept), an der Mühle einbauen, Mehl zu Grete.
 * Lohn: 5 Brot, 150 Defense-XP, 50 Splitter, 1 Questpunkt; danach dreht sich die Mühle (nur für diesen Spieler) und die Bäckerei verkauft Brot.
 */
import type { QuestDef, Bed } from "./questbau";

export const A3 = "osthof_die_muehle_steht_still";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const MUEHLE: [number, number] = [6566.5, 6423.5];

export const QUEST_A3: QuestDef = {
  id: A3, titel: "Die Mühle steht still", ort: "Osthof · Waldmark", start: "Sprich mit Till Mahler an der Windmühle im Osthof.",
  logNeu: "Die Windmühle im Osthof steht still. Der Müllerjunge Till sieht ratlos zu den Flügeln hinauf.",
  logAngeboten: "Till Mahler an der Windmühle im Osthof hofft noch auf deine Hilfe.",
  logAbgabe: "Bring den Mehlsack zu Grete Korn, der Bäckerin der Waldmark.",
  logFertig: "Die Mühle dreht sich wieder, und Grete Korn backt. In ihrer Bäckerei in der Waldmark gibt es Brot – für 8 Splitter.",
  geber: "till", abgabe: "grete",
  figuren: [
    { id: "till", name: "Till Mahler", modell: "npc.junge", x: 6564.5, y: 6425.5, blick: [1, -1] },
    { id: "grete", name: "Grete Korn", modell: "npcfrau3d", x: 6454.5, y: 6451.8, blick: [0, 1] },
  ],
  schritte: [
    { id: "kupfer", text: "Vier Kupfererz abbauen", ereignis: { art: "sammeln", ziel: "kupfer" }, anzahl: 4, wo: [6438.5, 6475.5],
      log: "Bau in der Senke vor der Waldmark vier Kupfererz ab – mit einer Spitzhacke ({n:kupfer})." },
    { id: "eichen", text: "Zwei Eichen fällen", ereignis: { art: "sammeln", ziel: "eiche" }, anzahl: 2, wo: [6411.5, 6477.5],
      log: "Fäll zwei Eichen als Brennholz für die Esse ({n:eichen})." },
    { id: "barren", text: "Zwei Kupferbarren schmelzen", ereignis: { art: "herstellen", rezept: "barren_kupfer" }, anzahl: 2, nach: ["kupfer", "eichen"], wo: "esse",
      log: "Schmilz an der Esse in der Schmiede der Waldmark zwei Kupferbarren ({n:barren})." },
    { id: "lager", text: "Das Mühlenachslager schmieden", ereignis: { art: "herstellen", rezept: "muehlenachslager" }, nach: ["barren"], wo: "amboss",
      log: "Schmiede am Amboss aus den zwei Kupferbarren ein Mühlenachslager. Ein Hammer muss im Rucksack sein." },
    { id: "einbau", text: "Das Lager in die Mühle einbauen", ereignis: { art: "objekt", id: "a3_muehle" }, nach: ["lager"],
      log: "Bau das Achslager an der Windmühle im Osthof ein." },
    { id: "mehl", text: "Den Mehlsack von Till holen", ereignis: { art: "antwort" }, nach: ["einbau"], bei: "till",
      log: "Die Flügel drehen sich! Till hat Mehl für dich." },
  ],
  objekte: [
    { id: "a3_muehle", name: "Windmühle", x: MUEHLE[0], y: MUEHLE[1], modell: "stelle", tat: "benutzen", tatText: "Das Achslager einbauen", weit: 3.2,
      braucht: { wenn: { hat: "muehlenachslager" }, text: "Das alte Achslager ist gebrochen. Ohne ein neues dreht sich hier nichts." },
      nehmen: [{ g: "muehlenachslager" }],
      text: "Du setzt das Lager ein, Till hält die Welle. Ein Ruck – und über euch beginnen die Flügel zu knarren. Die Mühle dreht sich wieder!",
      schon: "Die Mühle dreht sich.", sonst: [] },
  ],
  dialoge: {
    till: {
      reden: [
        { wenn: NEU, zeilen: ["Sieh dir das an. Steht still. Das Achslager ist gebrochen, und Vater ist mit dem letzten Mehl auf dem Markt in Weidenhain.",
          "Ich soll das „bis zum Abend“ lösen. Ich hab einen Plan! Aber keine Spitzhacke. Und keine Ahnung, wie man aus Erz Metall macht."], antworten: ["annehmen", "plan", "spaeter"] },
        { wenn: FERTIG, zeilen: ["Hörst du das? Sie mahlt! Vater wird's nicht glauben.", "Er hat übrigens Ärger mit dem Wehr in Weidenhain, schreibt er. Aber das ist eine andere Geschichte."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["mehl"] }, zeilen: ["Bring das Mehl zu Grete! Sie wollte schon zumachen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["einbau"] }, zeilen: ["Sie dreht sich! Sie dreht sich wirklich! Warte – der erste Sack ist gleich voll."], antworten: ["mehlsack"] },
        { wenn: { erledigt: ["lager"] }, zeilen: ["Das ist es! Das Lager! Schnell, an die Mühle damit – ich halt die Welle."], antworten: ["tschuess"] },
        { wenn: { erledigt: ["barren"] }, zeilen: ["Zwei Barren! Jetzt an den Amboss – und den Hammer nicht vergessen."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Kupfer! Vater sagt immer: Kupfer hält, bis die Mühle umfällt. Und die fällt nicht um. Glaub ich.",
          "Kupfer gibt's in der Senke vor der Waldmark. Eine Spitzhacke hat der Handwerker vor der Schmiede."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich helfe dir. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Danke! Also: Kupfererz – vier Stück, aus der Senke vor der Waldmark. Und Holz für die Esse.",
          "In der Schmiede der Waldmark schmilzt du daraus Barren, und am Amboss wird ein Achslager draus. Hast du keine Spitzhacke – der Handwerker vor der Schmiede verkauft welche."] } }] },
        { id: "plan", text: "Was für ein Plan?", folge: [{ f: { weiter: true, zeilen: ["Kupfer schmelzen, ein neues Lager schmieden, einbauen. Ganz einfach. Glaub ich. Nur … ich hab das noch nie gemacht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Oh. Na gut. Ich bin hier. Die Mühle läuft ja nicht weg."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: ["Vier Kupfererz aus der Senke vor der Waldmark, zwei Eichen fürs Feuer.",
          "An der Esse zwei Kupferbarren, am Amboss das Achslager – Hammer im Rucksack! Dann einbauen, hier an der Mühle."] } }] },
        { id: "mehlsack", text: "Den Mehlsack nehmen.", folge: [{ f: { erledige: ["mehl"], geben: [{ g: "mehlsack", name: "einen Sack Mehl" }],
          zeilen: ["Hier, der erste Sack! Bring ihn zu Grete Korn in die Waldmark – die Bäckerei. Sie war kurz davor, zuzumachen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bis gleich!"] } }] },
      ],
    },
    grete: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, hat: "mehlsack" }, zeilen: ["Ist das … Mehl? Aus der Mühle im Osthof?", "Ich hatte die Läden schon halb zu."], antworten: ["abgeben"] },
        { wenn: FERTIG, zeilen: ["Der Ofen ist heiß, das Brot ist warm. Kauf dir eins – an der Tür, für 8 Splitter."], antworten: ["tschuess"] },
        { zeilen: ["Kein Mehl, kein Brot. Die Mühle im Osthof steht still, und ich weiß nicht, wie lange ich noch aufmache."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "abgeben", text: "Den Mehlsack übergeben.", wenn: { hat: "mehlsack" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "mehlsack" }],
          zeilen: ["Du bist ein Segen. Warte – die ersten Laibe sind gleich fertig. Hier, nimm fünf. Die gehen aufs Haus.", "Und von morgen an: Brot für alle. 8 Splitter, und es ist jeden Splitter wert."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    muehlenachslager: [{ wenn: { phase: ["neu", "fertig"] }, text: "Ein Mühlenachslager schmiedest du nur im Auftrag von Till Mahler." }, { wenn: { erledigt: ["lager"] }, text: "Das Lager hast du schon geschmiedet." }],
  } },
  schalter: { muehle_dreht: [FERTIG, { erledigt: ["einbau"] }], baeckerei_offen: FERTIG },
  drehen: [{ schalter: "muehle_dreht", x: 6568, y: 6421, r: 6 }],
  glueckwunsch: "Sie mahlt! Riechst du das? Das ist Brot. Das erste seit Wochen.",
  belohnungText: "Belohnung: 5 Brot, 150 Defense-XP, 50 Splitter · danach: die Mühle dreht sich, und die Bäckerei der Waldmark verkauft Brot",
  belohnung: { xp: { defense: 150 }, splitter: 50, gegenstaende: [{ g: "brot", n: 5 }] },
  punkte: 1,
};
