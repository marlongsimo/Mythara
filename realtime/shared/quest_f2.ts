/*
 * Riftmere – Quest F2 „Salz und Feuer“ (Phase 9), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md. Salzsieder Ruwen Kehl in der Salzpfanne: Glutskorpione in den Pfannen, die Siederei steht.
 * Fünf Glutskorpione, ein neues Pfannenblech am Amboss (Schmieden 50, Quest-Rezept), die Pfanne reparieren, das erste Salz sieden.
 * QUER: Das Pfannenblech braucht Schwarzeisen (Burgfels Grauwacht, Phase 8) – Handwerk aus dem Norden für den Süden.
 * Lohn: Schmieden 3.000, Kochen 2.000 XP, 500 Splitter, 2 Questpunkte; Salz als Rohstoff (Kochen 65), die Siederei verkauft Salz (Schalter ruwen_salz).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Salzpfanne, Glutskorpion, Rezept pfannenblech, Gegenstand salz). Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { F1 } from "./quest_f1";
import { SALZPFANNE } from "./quest_f_orte";

export const F2 = "glutsande_salz_und_feuer";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Die Skorpione zuerst. Fünf. Die anderen laufen dann von allein.", "Das Pfannenblech ist durchgebrannt. Ich brauch ein neues – Schwarzeisen, das hält die Glut. Aus dem Norden, sagt man, gibt's welches im Burgfels von Grauwacht.",
  "Am Amboss in Glutbrunn schmiedest du's, dann setzen wir's ein. Und dann sieden wir."];

export const QUEST_F2: QuestDef = {
  id: F2, titel: "Salz und Feuer", ort: "Glutsande · Salzpfanne · Grauwacht", start: "Sprich mit Salzsieder Ruwen Kehl in der Salzpfanne.",
  logNeu: "In der Salzpfanne der Glutsande steht die Siederei still. Der Salzsieder sitzt im Schatten und wirft Steine nach etwas, das zurückzischt.",
  logAngeboten: "Ruwen Kehl in der Salzpfanne braucht jemanden, der Skorpione nicht fürchtet.",
  logAbgabe: "Das erste Salz ist gesiedet. Sag es Ruwen Kehl.",
  logFertig: "Die Siederei in der Salzpfanne läuft wieder. Ruwen Kehl verkauft Salz – und ohne Salz keine Glutwels-Kruste.",
  geber: "ruwen",
  figuren: [{ id: "ruwen", name: "Ruwen Kehl", modell: "npcmann3d", x: SALZPFANNE.ruwen[0], y: SALZPFANNE.ruwen[1], blick: [1, 0] }],
  voraussetzungen: [
    { text: "„Ende des Grases“ abgeschlossen", wenn: { quest: { id: F1, phase: ["fertig"] } } },
    { text: "Schmieden 50", wenn: { skill: { k: "schmieden", min: 50 } } },
  ],
  schritte: [
    { id: "skorpione", text: "Fünf Glutskorpione vertreiben", ereignis: { art: "erlegen", typ: "glutskorpion" }, anzahl: 5, wo: SALZPFANNE.skorpione,
      log: "Besieg in den Salzpfannen fünf Glutskorpione ({n:skorpione}). Ihr Gift brennt nach." },
    { id: "blech", text: "Ein neues Pfannenblech schmieden", ereignis: { art: "herstellen", rezept: "pfannenblech" }, wo: "amboss",
      log: "Schmiede am Amboss ein Pfannenblech aus zwei Schwarzeisenbarren (Schmieden 50). Schwarzeisen gibt es im Burgfels von Grauwacht." },
    { id: "pfanne", text: "Die Siedepfanne reparieren", ereignis: { art: "objekt", id: "f2_pfanne" }, nach: ["skorpione", "blech"], wo: SALZPFANNE.pfanne,
      log: "Setz das neue Blech in die große Siedepfanne ein." },
    { id: "sieden", text: "Das erste Salz sieden", ereignis: { art: "objekt", id: "f2_sieden" }, nach: ["pfanne"], wo: SALZPFANNE.pfanne,
      log: "Feuer unter die Pfanne, Sole hinein – sied das erste Salz." },
  ],
  objekte: [
    { id: "f2_pfanne", name: "Siedepfanne", x: SALZPFANNE.pfanne[0], y: SALZPFANNE.pfanne[1], modell: "stelle", tat: "benutzen", tatText: "Das Blech einsetzen", weit: 3,
      braucht: { wenn: { hat: "pfannenblech" }, text: "Die große Pfanne, das Blech durchgebrannt bis auf den Rost. Ohne neues Blech siedet hier nichts." }, nehmen: [{ g: "pfannenblech" }],
      text: "Ruwen hält, du schlägst. Nieten, Lehm in die Fugen, noch mehr Nieten. Das Blech sitzt.",
      schon: "Das Blech sitzt.", sonst: [{ wenn: NEU, text: "Eine große Siedepfanne, kalt und rostig." }, { wenn: FERTIG, text: "Die Pfanne dampft." }, { wenn: { offen: ["pfanne"] }, text: "Erst die Skorpione, dann das Blech." }] },
    { id: "f2_sieden", name: "Feuer unter der Pfanne", x: SALZPFANNE.pfanne[0] + 1, y: SALZPFANNE.pfanne[1], modell: "stelle", tat: "benutzen", tatText: "Sieden", weit: 3, geben: [{ g: "salz", n: 5 }],
      text: "Die Sole zischt, dampft, wird weiß an den Rändern. Ruwen kratzt die erste Kruste ab und hält sie in die Sonne. Sie glitzert.",
      schon: "Die Pfanne siedet von selbst. Ruwen passt auf.", sonst: [{ wenn: NEU, text: "Eine kalte Feuerstelle." }, { wenn: FERTIG, text: "Die Pfanne siedet." }, { wenn: { offen: ["sieden"] }, text: "Erst muss die Pfanne dicht sein." }] },
  ],
  /* Ruwen: Salzsieder, sonnenverbrannt, flucht farbig, aber nie gemein; liebt sein Salz wie andere ihre Kinder. */
  dialoge: {
    ruwen: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Glutskorpione! In MEINEN Pfannen! Sie mögen die Wärme, die Biester.", "Und als ob das nicht reicht, ist mir das Blech durchgebrannt. Ohne Blech kein Salz. Ohne Salz kein Glutbrunn."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Salz? Hab keins. Frag die Skorpione."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Salz! Weißes Gold! Willst du welches? Für dich zum Freundespreis."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Riechst du das? Salz in der Luft! Komm her!"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["pfanne"] }, zeilen: ["Das Blech sitzt! Jetzt Feuer drunter. Langsam, sonst springt's."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["skorpione", "blech"] }, zeilen: ["Skorpione weg, Blech da. Zur Pfanne, aber zack!"], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["skorpione"] }, zeilen: ["Ruhe in den Pfannen. Hörst du? Kein Zischen. Herrlich.", "Jetzt das Blech."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Fünf Skorpione. Und ein Blech. Mehr will ich gar nicht."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe deine Siederei zum Laufen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du? Gut! Die Skorpione sind in den hinteren Pfannen.", "Und das Blech – Schwarzeisen, zwei Barren, am Amboss. Kriegst du das hin?"] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann wirf ich weiter Steine. Bringt nichts, tut aber gut."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Das erste Salz ist fertig.", folge: [{ f: { abschluss: true, zeilen: ["Ruwen nimmt eine Prise und lässt sie auf der Zunge zergehen. Er schließt die Augen.",
          "Das ist es. Das beste Salz zwischen hier und dem Meer. Behalt, was du gesiedet hast. Ab heute verkauf ich wieder."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Und tritt auf keinen Skorpion!"] } }] },
      ],
    },
  },
  sperren: { herstellen: { pfannenblech: [{ wenn: { phase: ["neu", "fertig"] }, text: "Ein Pfannenblech schmiedest du nur für Ruwens Siederei." }, { wenn: { erledigt: ["blech"] }, text: "Das Blech hast du schon." }] } },
  schalter: { ruwen_salz: FERTIG },
  belohnungText: "Belohnung: Schmieden 3.000, Kochen 2.000 XP, 500 Splitter, das erste Salz · danach: Ruwen Kehl verkauft Salz",
  belohnung: { berufe: { schmieden: 3000, kochen: 2000 }, splitter: 500 },
  punkte: 2,
};
