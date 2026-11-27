/*
 * Riftmere – Quest E2 „Die Glocke“ (Phase 8), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-8.md. Äbtissin Gunhild: Die Glocke ist gesprungen; seit sie schweigt, wandern die Toten.
 * QUER: Gunhild schickt dich erst zu Merit Stahl nach Graufurt – die Wacht hat das Rezept der Glockenbronze im Bergfried: Kupfer aus der Senke vor der Waldmark, Splittereisen aus der Furtklamm.
 * Glockenbronze aus Kupfer und Splittereisen (Esse, Quest-Rezept), die Glockenform am Herd der Abteiküche (Quest-Rezept), der Klöppel aus Kernbaum (Werkbank),
 * mit den Nonnen aufhängen, der erste Schlag – Ysoldes Stimme antwortet von Graufurt aus: „Endlich.“
 * Lohn: Schmieden 1.000 XP, 400 Splitter, 2 Questpunkte. Schalter glocke_heil (die Glocke läutet stündlich, für alle in den Fahlen Weiten – shared/weltereignisse.ts), bindestein_abtei.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 8 (Abtei, Glockenturm, Rezepte glockenbronze, glocke, kloeppel; Glocke als Weltereignis).
 * Stellen aus der Welt (#50, shared/quest_e_orte.ts; Lesestelle glocke mit questobjekt „glocke“). Liste: doku/quests/e-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { E1 } from "./quest_e1";
import { ABTEI, KERNBAUM, MERIT } from "./quest_e_orte";

export const E2 = "grauwacht_die_glocke";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Das Rezept der Glockenbronze hat die Wacht in Graufurt – frag Merit Stahl. Dann vier Barren, aus Kupfer und Splittereisen, an der Esse. Splittereisen gibt es in der Furtklamm bei Graufurt.",
  "Die Form gießt du in der Küche der Abtei, am großen Herd. Schwester Ida hält das Feuer, du gießt.", "Der Klöppel aus Kernbaum – der wächst im windstillen Tal westlich der Abtei. Dann hängen wir sie auf. Zu fünft schaffen wir das."];

export const QUEST_E2: QuestDef = {
  id: E2, titel: "Die Glocke", ort: "Grauwacht · Furtklamm", start: "Sprich mit Äbtissin Gunhild in der Abtei von Grauwacht.",
  logNeu: "Im Glockenturm der Abtei von Grauwacht hängt eine Glocke mit einem Sprung von oben bis unten.",
  logAngeboten: "Äbtissin Gunhild in Grauwacht hofft, dass jemand die Glocke neu gießt.",
  logAbgabe: "Die Glocke läutet. Sag es Äbtissin Gunhild.",
  logFertig: "Die Glocke von Grauwacht läutet wieder – zu jeder vollen Stunde, weit über die Fahlen Weiten. Für eine Minute ruhen dann die Wiedergänger.",
  geber: "gunhild",
  figuren: [
    { id: "gunhild", name: "Äbtissin Gunhild", modell: "npcfrau3d", x: ABTEI.gunhild[0], y: ABTEI.gunhild[1], blick: [0, 1] },
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Der Weg nach Grauwacht“ abgeschlossen", wenn: { quest: { id: E1, phase: ["fertig"] } } },
    { text: "Schmieden 45", wenn: { skill: { k: "schmieden", min: 45 } } },
  ],
  schritte: [
    { id: "rezept", text: "Merit Stahl nach der Glockenbronze fragen", ereignis: { art: "antwort" }, bei: "merit",
      log: "Frag Hauptfrau Merit Stahl in Graufurt nach dem Rezept der Glockenbronze. Die Wacht hat es im Bergfried aufbewahrt." },
    { id: "bronze", text: "Vier Barren Glockenbronze schmelzen", ereignis: { art: "herstellen", rezept: "glockenbronze" }, anzahl: 4, nach: ["rezept"], wo: "esse",
      log: "Schmilz an der Esse vier Barren Glockenbronze – Kupfer und Splittereisen aus der Furtklamm ({n:bronze})." },
    { id: "form", text: "Die Glocke in der Abteiküche gießen", ereignis: { art: "herstellen", rezept: "glocke" }, nach: ["bronze"], wo: ABTEI.kueche,
      log: "Gieß die Glockenbronze in der Küche der Abtei in die Glockenform." },
    { id: "kloeppel", text: "Einen Klöppel aus Kernbaum schnitzen", ereignis: { art: "herstellen", rezept: "kloeppel" }, wo: KERNBAUM,
      log: "Fäll im windstillen Tal westlich der Abtei einen Kernbaum und schnitz an der Werkbank einen Klöppel." },
    { id: "aufhaengen", text: "Die Glocke aufhängen", ereignis: { art: "objekt", id: "e2_turm" }, nach: ["form", "kloeppel"], wo: ABTEI.glocke,
      log: "Häng mit den Schwestern die neue Glocke im Turm auf – Glocke und Klöppel." },
    { id: "schlag", text: "Den ersten Schlag läuten", ereignis: { art: "objekt", id: "e2_seil" }, nach: ["aufhaengen"], wo: ABTEI.seil,
      log: "Zieh am Glockenseil." },
  ],
  objekte: [
    { id: "e2_turm", name: "Glockenstuhl", x: ABTEI.glocke[0], y: ABTEI.glocke[1], modell: "stelle", tat: "benutzen", tatText: "Die Glocke aufhängen", weit: 3,
      braucht: { wenn: { hat: "glocke_neu", anzahl: { g: "kloeppel", min: 1 } }, text: "Der leere Glockenstuhl. Die alte Glocke liegt gesprungen daneben." }, nehmen: [{ g: "glocke_neu" }, { g: "kloeppel" }],
      text: "Fünf Hände am Seil, Gunhild zählt. Die Glocke steigt, schwingt, hängt. Schwester Ida setzt den Klöppel ein und tritt zurück, als könnte er beißen.",
      schon: "Die neue Glocke hängt im Stuhl.", sonst: [{ wenn: NEU, text: "Die Glocke hat einen Sprung von oben bis unten." }, { wenn: FERTIG, text: "Die Glocke hängt und schweigt bis zur nächsten Stunde." },
        { wenn: { offen: ["aufhaengen"] }, text: "Der Glockenstuhl. Erst gießen, dann hängen." }] },
    { id: "e2_seil", name: "Glockenseil", x: ABTEI.seil[0], y: ABTEI.seil[1], modell: "stelle", tat: "benutzen", tatText: "Läuten", weit: 2.5,
      text: "Du ziehst. Ein Ton, tief und rund, rollt über die Abtei, über die Heide, nach Süden. Eine Ewigkeit nichts. Dann, ganz leise, wie aus weiter Ferne, eine Frauenstimme: „Endlich.“",
      schon: "Das Seil hängt still. Die Glocke läutet zur vollen Stunde von selbst.", sonst: [{ wenn: NEU, text: "Ein Seil, an dem keiner mehr zieht." }, { wenn: FERTIG, text: "Die Glocke läutet zur vollen Stunde." },
        { wenn: { offen: ["schlag"] }, text: "Ein Seil, das ins Leere führt." }] },
  ],
  dialoge: {
    gunhild: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Die Glocke ist gesprungen. In der Nacht, als der Himmel riss. Seitdem schweigt sie.",
          "Und seit sie schweigt, wandern die Toten. Ich weiß nicht, ob das eine mit dem anderen zu tun hat. Ich weiß nur: Früher haben sie geschlafen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Abtei hält. Mehr kann ich dir nicht sagen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Hörst du sie? Jede Stunde. Die Schwestern weinen jedes Mal. Ich auch, aber leiser."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ich hab sie gehört. Und … ich hab jemanden antworten gehört. Von Süden."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["aufhaengen"] }, zeilen: ["Sie hängt. Jetzt zieh. Ich kann nicht. Meine Hände zittern."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["form", "kloeppel"] }, zeilen: ["Glocke und Klöppel. Ruf mich, wenn du hinaufgehst. Wir helfen alle."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["bronze"] }, zeilen: ["Glockenbronze. Sie riecht wie damals. Der Ofen ist warm."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Kupfer und Splittereisen. Vier Barren. Die Wacht hat ihre Glocken immer aus beidem gegossen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gieße eine neue Glocke. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du kannst Glocken gießen? …Dann hat uns der Himmel dich geschickt. Oder Merit. Beides ist mir recht.",
          "Das Rezept hat die Wacht in Graufurt – frag Merit Stahl. Dann vier Barren Glockenbronze. Die Form gießen wir in der Küche, am großen Herd. Und einen Klöppel aus Kernbaum, der springt nicht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Glocke hat Jahre geschwiegen. Sie kann noch etwas warten."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Das war Ysolde. Aus dem Turm am Ostufer.", folge: [{ f: { abschluss: true, zeilen: ["Gunhild setzt sich auf die Stufe der Kirche. Ganz langsam.",
          "Ysolde. Wir haben zusammen gelernt, als Mädchen. Sie hat gewartet. Sie hat all die Jahre gewartet.", "Die Abtei hat einen Bindestein, unten in der Krypta. Er gehört dir. Und Grauwacht … Grauwacht wacht wieder."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit dem Wind."] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["rezept"] }, zeilen: ["Gunhild schickt dich? Wegen der Glocke?", "…Es gibt ein Rezept. Im Bergfried, in der Truhe der Wacht. Ich hab's nie gebraucht."], antworten: ["rezept_fragen", "tschuess"] },
        { wenn: { erledigt: ["rezept"] }, zeilen: ["Läutet sie schon? Ich will sie hören. Bis hierher."], antworten: ["tschuess"] },
        { zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "rezept_fragen", text: "Wie macht man Glockenbronze?", folge: [{ f: { erledige: ["rezept"], zeilen: ["Merit holt ein vergilbtes Blatt. „Vier Teile Kupfer aus der Senke vor der Waldmark – das weiche, rote. Ein Teil Splittereisen aus der Furtklamm.“",
          "„Wer Splittereisen in die Glocke tut, dessen Glocke hört man auch dort, wo kein Ohr ist.“ …Ich wusste nie, was das heißt. Jetzt vielleicht."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    glockenbronze: [{ wenn: { phase: ["neu", "fertig"] }, text: "Glockenbronze gießt du nur für die Glocke von Grauwacht." }, { wenn: { erledigt: ["bronze"] }, text: "Vier Barren hast du schon." }],
    glocke: [{ wenn: { phase: ["neu", "fertig"] }, text: "Eine Glocke gießt man nicht aus Langeweile." }, { wenn: { erledigt: ["form"] }, text: "Die Glocke ist gegossen." }],
    kloeppel: [{ wenn: { phase: ["neu", "fertig"] }, text: "Einen Klöppel schnitzt du nur für die Glocke von Grauwacht." }, { wenn: { erledigt: ["kloeppel"] }, text: "Den Klöppel hast du schon." }],
  } },
  schalter: { glocke_heil: [FERTIG, { erledigt: ["schlag"] }], bindestein_abtei: FERTIG },
  belohnungText: "Belohnung: Schmieden 1.000 XP, 400 Splitter · danach: die Glocke läutet stündlich für alle, Bindestein in der Abtei",
  belohnung: { berufe: { schmieden: 1000 }, splitter: 400 },
  punkte: 2,
};
