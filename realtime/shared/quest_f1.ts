/*
 * Riftmere – Quest F1 „Ende des Grases“ (Phase 9), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md. QUER: Start in Graufurt bei Fährmann Kord Weller (Phase 7), Weg über das Ostufer in die Glutsande, Abgabe in Glutbrunn.
 * Kord gibt einen Brief nach Glutbrunn mit – seit die Kette riss, kam keine Antwort. Die Wegmarke „Ende des Grases“, Karawanenräuber am Kanal,
 * Händlerin Selma Dornfeld in der Karawanenrast liest den Brief und lacht: Er ist zwanzig Jahre alt.
 * Lohn: Fernkampf 3.000, Stärke 3.000, Defense 2.000 XP, 600 Splitter, 2 Questpunkte; Wegstein-Ziel Glutbrunn. Alle Namen sind Vorschläge.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Glutsande, Glutbrunn, Karawanenräuber, Selma) und auf „Figur in mehreren Quests“ (Kord aus D1).
 * Stellen: shared/quest_f_orte.ts. Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { D2 } from "./quest_d2";
import { KORD, GRASENDE, KANAL, GLUTBRUNN } from "./quest_f_orte";

export const F1 = "glutsande_ende_des_grases";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Übers Ostufer, immer nach Osten, bis das Gras aufhört. Dann ist es Sand. Viel Sand.",
  "Am alten Kanal lagern Räuber. Die lassen keinen durch, der allein kommt. Du bist allein. Also pass auf.",
  "Glutbrunn liegt am Strom. Gib den Brief der Händlerin an der Karawanenrast. Sie heißt Selma. Hieß sie jedenfalls."];

export const QUEST_F1: QuestDef = {
  id: F1, titel: "Ende des Grases", ort: "Graufurt · Ostufer · Glutsande · Glutbrunn", start: "Sprich mit Fährmann Kord Weller am Fährhaus in Graufurt.",
  logNeu: "Kord Weller am Fährhaus in Graufurt dreht einen alten Brief in den Händen, als wüsste er nicht, wohin damit.",
  logAngeboten: "Kord Weller in Graufurt hat einen Brief nach Glutbrunn, den niemand mitnimmt.",
  logAbgabe: "Du bist in Glutbrunn. Gib Kords Brief der Händlerin Selma Dornfeld an der Karawanenrast.",
  logFertig: "Kords Brief ist angekommen – zwanzig Jahre zu spät. Glutbrunn am Strom ist offen für dich, und am Wegstein der Stadt kannst du heimreisen.",
  geber: "kord", abgabe: "selma",
  figuren: [
    { id: "kord", name: "Kord Weller", modell: "npc.kord", x: KORD[0], y: KORD[1], blick: [-1, 0] },
    { id: "selma", name: "Selma Dornfeld", modell: "npcfrau3d", x: GLUTBRUNN.selma[0], y: GLUTBRUNN.selma[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Das grüne Licht“ abgeschlossen", wenn: { quest: { id: D2, phase: ["fertig"] } } },
    { text: "Heldenlevel 40", wenn: { heldenlevel: 40 } },
  ],
  schritte: [
    { id: "gras", text: "Das Ende des Grases erreichen", ereignis: { art: "objekt", id: "f1_grasende" }, wo: GRASENDE,
      log: "Setz mit der Fähre ans Ostufer über und geh nach Osten, bis das Gras aufhört – zur Wegmarke „Ende des Grases“." },
    { id: "raeuber", text: "Drei Karawanenräuber am Kanal besiegen", ereignis: { art: "erlegen", typ: "karawanenraeuber" }, anzahl: 3, nach: ["gras"], wo: KANAL,
      log: "Am ausgetrockneten Kanal lauern Karawanenräuber. Besieg drei ({n:raeuber}) – sie fliehen, wenn es eng wird." },
  ],
  objekte: [
    { id: "f1_grasende", name: "Wegmarke „Ende des Grases“", x: GRASENDE[0], y: GRASENDE[1], modell: "stelle", tat: "untersuchen", tatText: "Die Wegmarke lesen", weit: 3,
      text: "Ein Stein, halb im Sand. Eingemeißelt: „Ende des Grases. Wasser: drei Tage.“ Jemand hat die Drei durchgestrichen und eine Eins daneben gekratzt.",
      schon: "„Wasser: drei Tage.“ Oder einer.", sonst: [{ wenn: NEU, text: "Ein Stein, halb im Sand. Hier hört das Gras auf." }, { wenn: FERTIG, text: "Ein Stein, halb im Sand. Hier hört das Gras auf." }] },
  ],
  /* Kord: wie in D1 maulfaul, aber hier rührselig wegen des Briefs. Selma: Händlerin, laut, lacht viel, hat alles schon gesehen und kauft trotzdem. */
  dialoge: {
    kord: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Du warst am Turm. Du kommst rum.", "Hier. Ein Brief. Nach Glutbrunn, am Strom, hinter dem Sand. Ich hab ihn geschrieben, als die Kette noch hielt. Antwort kam nie."],
          antworten: ["annehmen", "brief_wer", "spaeter"] },
        { wenn: NEU, zeilen: ["Übersetzen? Steig ein."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Zwanzig Jahre, sagt sie? …Hm. Dann war ich jung. Und sie auch."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["raeuber"] }, zeilen: ["Du bist noch hier? Glutbrunn ist am Strom. Lauf."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der Brief. Nach Glutbrunn. Hast du ihn noch?"], antworten: ["hilfe", "brief_neu", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe deinen Brief. (Quest annehmen)", folge: [{ f: { start: true, geben: [{ g: "kords_brief", name: "Kords Brief", fehlt: true }],
          zeilen: ["Gut. Übers Ostufer, nach Osten, bis das Gras aufhört.", "An Selma Dornfeld, an der Karawanenrast. Wenn sie noch da ist. …Wenn nicht, wirf ihn in den Strom."] } }] },
        { id: "brief_wer", text: "An wen ist der Brief?", folge: [{ f: { weiter: true, zeilen: ["Geht dich nichts an.", "…Eine Händlerin. Sie kam mit der Karawane bis zum Fluss, jeden Herbst. Dann riss die Kette, und keiner kam mehr."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Zwanzig Jahre hat er gewartet. Auf einen Tag kommt's nicht an."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "brief_neu", text: "Ich habe den Brief verloren.", folge: [{ f: { weiter: true, geben: [{ g: "kords_brief", name: "Kords Brief", fehlt: true }], zeilen: ["Verloren? …Dann schreib ich ihn halt noch mal. Hab ihn ja auswendig."],
          nichtsZuGeben: ["Du hast ihn doch. In der Tasche. Ich seh die Ecke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
    selma: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, hat: "kords_brief" }, zeilen: ["Ein Fremder aus dem Westen! Durch den Sand gekommen? Und lebendig? Setz dich, trink was.", "Was hast du da in der Hand?"], antworten: ["brief_geben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du siehst aus, als hättest du etwas für mich. Aber deine Hände sind leer."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Kord Weller. Ich lach immer noch, wenn ich dran denk. Und dann nicht mehr."], antworten: ["tschuess"] },
        { zeilen: ["Karawanenrast Glutbrunn! Gewürze, Salz, Stoffe aus dem Süden! …Na ja. Salz haben wir gerade wenig."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "brief_geben", text: "Einen Brief von Kord Weller aus Graufurt.", wenn: { hat: "kords_brief" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "kords_brief" }],
          zeilen: ["Selma liest. Dann lacht sie, laut, bis ihr die Tränen kommen.", "„Ich warte am Fluss.“ Zwanzig Jahre! Der Narr. Ich hab gewartet. Zwei Herbste. Dann kam keiner mehr über den Fluss.",
            "Sag ihm … nein. Ich sag's ihm selbst. Irgendwann. Jetzt, wo der Weg wieder offen ist.", "Der Wegstein am Markt kennt dich jetzt. Komm wieder – Glutbrunn hat lange keinen Gast aus dem Westen gehabt."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Wasser nicht vergessen!"] } }] },
      ],
    },
  },
  belohnungText: "Belohnung: Fernkampf 3.000, Stärke 3.000, Defense 2.000 XP, 600 Splitter · danach: Wegstein-Ziel Glutbrunn",
  belohnung: { xp: { fernkampf: 3000, staerke: 3000, defense: 2000 }, splitter: 600 },
  punkte: 2,
};
