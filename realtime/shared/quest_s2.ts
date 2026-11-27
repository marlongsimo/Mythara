/*
 * Riftmere – Quest S2 „Der verschwundene Stock“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Imkerin Imme Sommer in Summweide: Ein Sturm hat einen Bienenstock fortgerissen.
 * Dem Summen folgen (drei Stellen), den Stock aufrichten, sechs Ringelblumen pflücken. QUER: Drei davon will Mira Kräuterlieb in der Waldmark für einen Trank.
 * Danach verkauft Imme Heiltränke (LAEDEN.imme an der Questfigur, offen, wenn die Quest fertig ist). Lohn: Kräuterkunde 400 XP, 1 kleiner Heiltrank, 50 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Kräuterkunde #133). Stellen aus der Welt (#120). Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { SUMMWEIDE, IMME, MIRA_F } from "./quest_s_orte";

export const S2 = "summweide_der_verschwundene_stock";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const SUMMEN = ["summen_1", "summen_2", "summen_3"];
const HILFE = ["Hör hin. Die Damen summen, wo ihr Stock liegt. Erst leise, dann lauter. Drei Mal bleibst du stehen und lauschst.",
  "Den Stock richtest du auf. Vorsichtig. Sie sind beleidigt.", "Dann Ringelblumen, sechs, mit der Sichel. Drei für mich, drei für Mira in der Waldmark – sie wartet seit dem Frühjahr."];

export const QUEST_S2: QuestDef = {
  id: S2, titel: "Der verschwundene Stock", ort: "Summweide · Waldmark", start: "Sprich mit Imme Sommer bei den Bienenstöcken in Summweide.",
  logNeu: "In Summweide, an der Blumenwiese südlich von Weidenhain, zählt eine Imkerin ihre Bienenstöcke – und kommt nie auf dieselbe Zahl.",
  logAngeboten: "Imme Sommer in Summweide vermisst einen Bienenstock.",
  logAbgabe: "Bring Imme Sommer in Summweide die drei Ringelblumen.",
  logFertig: "Der Stock steht wieder bei den anderen. Imme Sommer verkauft dir Heiltränke, und Mira hat ihre Ringelblumen.",
  geber: "imme",
  figuren: [IMME, MIRA_F],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Kräuterkunde 10", wenn: { skill: { k: "kraeuterkunde", min: 10 } } },
  ],
  schritte: [
    ...SUMMEN.map((id, i) => ({ id, text: "Dem Summen folgen", ereignis: { art: "objekt" as const, id: "s2_" + id }, gruppe: "summen", wo: SUMMWEIDE.summen[i],
      log: "Folg dem Summen über die Wiese von Summweide ({n:summen})." })),
    { id: "stock", text: "Den Bienenstock aufrichten", ereignis: { art: "objekt", id: "s2_stock" }, nach: SUMMEN, wo: SUMMWEIDE.stock,
      log: "Am Ende des Summens liegt der Bienenstock im Gras. Richte ihn auf." },
    { id: "blumen", text: "Sechs Ringelblumen pflücken", ereignis: { art: "sammeln", ziel: "ringelblume" }, anzahl: 6, nach: ["stock"], wo: SUMMWEIDE.wiese,
      log: "Schneid auf der Wiese von Summweide mit der Sichel sechs Ringelblumen ({n:blumen})." },
    { id: "mira", text: "Mira drei Ringelblumen bringen", ereignis: { art: "antwort" }, nach: ["blumen"], bei: "mira", wo: "mira",
      log: "Bring drei Ringelblumen zu Mira Kräuterlieb in der Waldmark." },
  ],
  objekte: [
    ...SUMMEN.map((id, i) => ({ id: "s2_" + id, name: "Summen im Gras", x: SUMMWEIDE.summen[i][0], y: SUMMWEIDE.summen[i][1], modell: "stelle", tat: "untersuchen" as const, tatText: "Lauschen", weit: 3,
      text: ["Ein leises Summen, irgendwo im Klee. Weiter nach Osten ({n:summen}).", "Lauter jetzt. Eine Biene setzt sich auf deinen Ärmel und fliegt voraus ({n:summen}).",
        "Hier summt es, als hätte die Wiese Fieber. Da vorn, im hohen Gras ({n:summen})."][i],
      schon: "Bienen, auf dem Weg nach Hause.", sonst: [{ wenn: NEU, text: "Klee und Bienen." }, { wenn: FERTIG, text: "Klee und Bienen." }] })),
    { id: "s2_stock", name: "Umgestürzter Bienenstock", x: SUMMWEIDE.stock[0], y: SUMMWEIDE.stock[1], modell: "stelle", tat: "benutzen", tatText: "Den Stock aufrichten", weit: 3,
      text: "Du stellst den Stock auf. Ein Brummen, beleidigt und laut. Dann fliegen sie, eine nach der anderen, zurück zu den anderen Stöcken.",
      schon: "Der Stock steht wieder.", sonst: [{ wenn: NEU, text: "Ein Bienenstock liegt im Gras." }, { wenn: FERTIG, text: "Der Stock steht wieder." },
        { wenn: { offen: ["stock"] }, text: "Hohes Gras. Irgendwo summt es." }] },
  ],
  /* Imme: sanft, summt beim Reden, nennt die Bienen „die Damen“. Mira: schnell, neugierig, freut sich über Kräuter wie andere über Gold. */
  dialoge: {
    imme: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Mmm. Elf. Zwölf. …Elf.", "Der Sturm vorgestern. Er hat mir einen Stock fortgetragen. Die Damen darin sind sicher furchtbar wütend."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Leise, bitte. Die Damen schlafen.", "Kennst du dich mit Blumen aus? Ringelblumen? Nein? Dann komm wieder, wenn du es tust. Kräuterkunde 10, mit einer Sichel."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Zwölf. Zwölf! Jeden Morgen zähle ich und lächle.", "Brauchst du etwas? Heiltränke, mit Honig. Für dich zum guten Preis."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, anzahl: { g: "ringelblume", min: 3 } }, zeilen: ["Riecht nach Sommer. Gib her."], antworten: ["abgeben", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Mira hat ihre? Gut. Und meine drei?"], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["blumen"] }, zeilen: ["Sechs! Drei davon zu Mira, in die Waldmark. Sie macht daraus etwas, das selbst mich gesund hält."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["stock"] }, zeilen: ["Sie sind zurück. Ich hab's gehört.", "Jetzt Ringelblumen. Sechs Stück. Die Damen mögen die gelben."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Hörst du sie? Folg dem Summen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich suche deinen Stock. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Mmm. Danke.", "Folg dem Summen. Die Damen wissen, wo sie hingehören – sie finden nur den Weg nicht zurück."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Elf. Zwölf. …Elf."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Die Ringelblumen geben.", wenn: { anzahl: { g: "ringelblume", min: 3 } }, folge: [{ f: { abschluss: true, nehmen: [{ g: "ringelblume", n: 3 }],
          zeilen: ["Imme legt die Blüten in einen Korb. Eine Biene landet darauf, sofort.", "Siehst du. Sie danken dir auch. Hier – ein kleiner Trank. Mit Honig."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mmm. Summ schön."] } }] },
      ],
    },
    mira: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["blumen"], offen: ["mira"], anzahl: { g: "ringelblume", min: 3 } }, zeilen: ["Riecht das nach … Summweide? Ringelblumen? Für mich?"], antworten: ["blumen_mira", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["blumen"], offen: ["mira"] }, zeilen: ["Imme schickt dich? Und die Ringelblumen? Drei brauche ich."], antworten: ["tschuess"] },
        { zeilen: ["Kräuter, Kind? Später."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "blumen_mira", text: "Drei Ringelblumen aus Summweide geben.", wenn: { anzahl: { g: "ringelblume", min: 3 } }, folge: [{ f: { erledige: ["mira"], nehmen: [{ g: "ringelblume", n: 3 }],
          zeilen: ["Mira riecht daran und schließt die Augen. „Die aus Summweide sind die besten. Die Bienen wissen das.“", "Sag Imme, sie kriegt die erste Salbe. Und jetzt zurück zu ihr – sie zählt sonst wieder."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bis bald!"] } }] },
      ],
    },
  },
  belohnungText: "Belohnung: Kräuterkunde 400 XP, 1 kleiner Heiltrank, 50 Splitter · danach: Imme verkauft Heiltränke",
  belohnung: { berufe: { kraeuterkunde: 400 }, splitter: 50, gegenstaende: [{ g: "kleiner_heiltrank" }] },
  punkte: 1,
};
