/*
 * Riftmere – Quest G4 „Netze für die Möwenbucht“ (Phase 10, klein), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-10.md. Fischerin Bente Möller in der Möwenbucht: Der Sturm hat die Netze zerrissen.
 * Ein Fischernetz aus Garn knüpfen (Werkbank, Handwerk 20, Quest-Rezept), fünf Heringe fangen, drei in der Räucherhütte räuchern.
 * Lohn: Fischen 1.500, Kochen 1.500, Handwerk 800 XP, 250 Splitter, 1 Questpunkt; die Räucherhütte ist frei (Schalter raeucherhuette_frei – während der Quest und danach).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 10 (Möwenbucht, Räucherhütte als Kochstation, Hering, Rezepte fischernetz und raeucherhering). Liste: doku/quests/g-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { G1 } from "./quest_g1";
import { MOEWENBUCHT } from "./quest_g_orte";

export const G4 = "kueste_netze_fuer_die_moewenbucht";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };

export const QUEST_G4: QuestDef = {
  id: G4, titel: "Netze für die Möwenbucht", ort: "Möwenbucht · Smaragdküste", start: "Sprich mit der Fischerin Bente Möller am Steg der Möwenbucht.",
  logNeu: "Am Steg der Möwenbucht sitzt eine Fischerin zwischen zerrissenen Netzen und flucht leise.",
  logAngeboten: "Bente Möller in der Möwenbucht braucht ein neues Netz.",
  logAbgabe: "Bring Bente Möller die Räucherheringe.",
  logFertig: "Die Möwenbucht fischt wieder. In der Räucherhütte kannst du selbst Fisch räuchern.",
  geber: "bente",
  figuren: [{ id: "bente", name: "Bente Möller", modell: "npcfrau3d", x: MOEWENBUCHT.fischerin[0], y: MOEWENBUCHT.fischerin[1], blick: [0, 1] }],
  voraussetzungen: [
    { text: "„Die Südstraße“ abgeschlossen", wenn: { quest: { id: G1, phase: ["fertig"] } } },
    { text: "Handwerk 20", wenn: { skill: { k: "handwerk", min: 20 } } },
    { text: "Fischen 20", wenn: { skill: { k: "fischen", min: 20 } } },
  ],
  schritte: [
    { id: "netz", text: "Ein Fischernetz knüpfen", ereignis: { art: "herstellen", rezept: "fischernetz" }, wo: "werkbank",
      log: "Knüpf an einer Werkbank aus sechs Garn ein Fischernetz (Handwerk 20)." },
    { id: "netz_geben", text: "Bente das Netz bringen", ereignis: { art: "antwort" }, nach: ["netz"], bei: "bente",
      log: "Bring Bente Möller das neue Netz." },
    { id: "heringe", text: "Fünf Heringe fangen", ereignis: { art: "sammeln", ziel: "hering" }, anzahl: 5, nach: ["netz_geben"], wo: MOEWENBUCHT.steg,
      log: "Fang am Steg der Möwenbucht fünf Heringe ({n:heringe})." },
    { id: "raeuchern", text: "Drei Heringe räuchern", ereignis: { art: "herstellen", rezept: "raeucherhering" }, anzahl: 3, nach: ["heringe"], wo: MOEWENBUCHT.raeucherhuette,
      log: "Räucher in der Räucherhütte drei Heringe ({n:raeuchern}). Räuchern braucht Zeit." },
  ],
  /* Bente: Fischerin, laut, lacht über alles, am meisten über sich. */
  dialoge: {
    bente: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Sturm. Drei Nächte. Und jetzt schau dir das an. Mehr Loch als Netz.", "Kannst du knüpfen? Dann kannst du mir helfen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Fisch? Morgen. Vielleicht."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Hütte raucht, die Netze halten. Und du? Willst du räuchern? Die Hütte steht offen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, anzahl: { g: "raeucherhering", min: 3 } }, zeilen: ["Riecht man bis Kielmund! Her damit."], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Geräuchert hast du? Und gegessen auch, wie's riecht. Räucher noch drei."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["heringe"] }, zeilen: ["Fünf! Und jetzt in die Hütte. Nicht zu heiß, sonst wird's Kohle."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["netz_geben"] }, zeilen: ["Das Netz hält. Jetzt fischen – am Steg, da beißen die Heringe."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["netz"], hat: "fischernetz" }, zeilen: ["Ist das …? Ein Netz! Gib her!"], antworten: ["netz_geben", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["netz"] }, zeilen: ["Du hast ein Netz geknüpft, sagst du? Dann bring es her. Ohne Netz kein Fisch."], antworten: ["tschuess"] },
        { zeilen: ["Sechs Garn, eine Werkbank, ruhige Finger. In Kielmund gibt's eine Werkbank."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich knüpfe dir ein Netz. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Sechs Garn. Werkbank in Kielmund. Und dann zeig ich dir, wie man Heringe räuchert. Das kann hier jeder, aber keiner wie ich."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann flick ich weiter. Mit den Zähnen."] } }] },
        { id: "netz_geben", text: "Das Netz übergeben.", wenn: { hat: "fischernetz" }, folge: [{ f: { erledige: ["netz_geben"], nehmen: [{ g: "fischernetz" }], zeilen: ["Bente zieht am Netz, mit aller Kraft. Es hält. Sie lacht laut.", "Jetzt fischen wir. Du auch."] } }] },
        { id: "abgeben", text: "Die Räucherheringe geben.", wenn: { anzahl: { g: "raeucherhering", min: 3 } }, folge: [{ f: { abschluss: true, nehmen: [{ g: "raeucherhering", n: 3 }],
          zeilen: ["Bente beißt in einen Hering. Kaut. Nickt.", "Fast so gut wie meine. Fast. Die Hütte gehört jetzt auch dir."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mast- und Schotbruch!"] } }] },
      ],
    },
  },
  sperren: { herstellen: { fischernetz: [{ wenn: { phase: ["neu", "fertig"] }, text: "Ein Fischernetz knüpfst du für Bente in der Möwenbucht." }, { wenn: { erledigt: ["netz_geben"] }, text: "Bente hat ihr Netz schon." }] } },
  schalter: { raeucherhuette_frei: [LAEUFT, FERTIG] },
  belohnungText: "Belohnung: Fischen 1.500, Kochen 1.500, Handwerk 800 XP, 250 Splitter · danach: die Räucherhütte der Möwenbucht",
  belohnung: { berufe: { fischen: 1500, kochen: 1500, handwerk: 800 }, splitter: 250 },
  punkte: 1,
};
