/*
 * Riftmere – Quest E4 „Das Grab des Grauen Hauptmanns“ (Phase 8), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-8.md. Burgvogt Wigand Fels: Der letzte Hauptmann von Grauwacht liegt im größten Hügelgrab und lässt die Wiedergänger nicht ruhen.
 * In die Grabkammer, zwei Grabwächter, das Siegel des Hauptmanns, der Graue Hauptmann (Instanz), seine Klinge zurück in die Burg.
 * Lohn: Grauwachts Wappenrock (Teil 1 der Wachtrüstung), Stärke 1.000, Defense 1.000, LP 500 XP, 600 Splitter, 3 Questpunkte.
 * Schalter grauwacht_stufe3 (voll belebt: Werkstatt, Markt, Wegstein), hauptmann_instanz (solange die Quest läuft). Haken: die Brücke zur Furt (W5).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 8 (Hügelgräber, Grab als Instanz, Grabwächter, Grauer Hauptmann, Wachtrüstung). Liste: doku/quests/e-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { E3 } from "./quest_e3";
import { BURG, GRAEBER, GRAB } from "./quest_e_orte";

export const E4 = "grauwacht_grab_des_hauptmanns";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Das größte Hügelgrab, östlich der Heide. Die Wiedergänger kommen von dort. Steig hinab.",
  "Unten wachen Steinfiguren der Wacht. Sie schlagen rundum – geh aus dem Kreis, wenn er leuchtet.",
  "Hinter ihnen liegt sein Siegel. Brich es, und er steht auf. Dann gib ihm, was er will: Ruhe."];

export const QUEST_E4: QuestDef = {
  id: E4, titel: "Das Grab des Grauen Hauptmanns", ort: "Grauwacht · Hügelgräber", start: "Sprich mit Burgvogt Wigand Fels in der Burg von Grauwacht.",
  logNeu: "Auch wenn die Glocke läutet: Nachts wandern die Wiedergänger noch immer über die Fahlen Weiten – vom größten Hügelgrab aus.",
  logAngeboten: "Burgvogt Wigand Fels in Grauwacht weiß, wer im größten Hügelgrab liegt.",
  logAbgabe: "Der Graue Hauptmann ruht. Bring seine Klinge zu Burgvogt Wigand Fels.",
  logFertig: "Der Graue Hauptmann ruht, die Klinge hängt in der Burg. Grauwacht ist wieder eine Stadt. Im Osten führt eine gesperrte Brücke zur Furt – und weiter in die Hochlande.",
  geber: "wigand",
  figuren: [{ id: "wigand", name: "Wigand Fels", modell: "stadtwache3d", x: BURG.wigand[0], y: BURG.wigand[1], blick: [0, 1] }],
  voraussetzungen: [{ text: "„Fahnenflucht“ abgeschlossen", wenn: { quest: { id: E3, phase: ["fertig"] } } }],
  schritte: [
    { id: "abstieg", text: "In das größte Hügelgrab hinabsteigen", ereignis: { art: "betreten", region: "grab_hauptmann" }, wo: GRAEBER.feld,
      log: "Steig in das größte Hügelgrab östlich der Heide hinab. (Heldenlevel 48 empfohlen.)" },
    { id: "waechter", text: "Zwei Grabwächter besiegen", ereignis: { art: "erlegen", typ: "grabwaechter" }, anzahl: 2, nach: ["abstieg"], wo: GRAB.kampf,
      log: "In der Grabkammer stehen zwei Grabwächter. Besieg sie ({n:waechter}). Geh aus dem Kreis, wenn er leuchtet." },
    { id: "siegel", text: "Das Siegel des Hauptmanns brechen", ereignis: { art: "objekt", id: "e4_siegel" }, nach: ["waechter"], wo: GRAB.siegel,
      log: "Brich das Siegel auf dem Sarkophag des Hauptmanns." },
    { id: "hauptmann", text: "Den Grauen Hauptmann besiegen", ereignis: { art: "erlegen", typ: "grauer_hauptmann" }, nach: ["siegel"], wo: GRAB.kampf,
      log: "Der Graue Hauptmann steht auf. Er ruft Wiedergänger, und hinter den Grabsteinen bist du vor seinem Sturm sicher." },
    { id: "klinge", text: "Die Klinge des Hauptmanns an dich nehmen", ereignis: { art: "aufheben", g: "klinge_hauptmann" }, nach: ["hauptmann"], wo: GRAB.kampf,
      log: "Nimm die Klinge des Grauen Hauptmanns an dich." },
  ],
  objekte: [
    { id: "e4_siegel", name: "Siegel des Hauptmanns", x: GRAB.siegel[0], y: GRAB.siegel[1], modell: "stelle", tat: "benutzen", tatText: "Das Siegel brechen", weit: 2.5,
      text: "Das Wachs springt mit einem Knall. Kälte steigt aus dem Sarkophag, und eine Stimme, die lange nicht gesprochen hat: „Wer weckt die Wacht?“",
      schon: "Das Siegel ist gebrochen.", sonst: [{ wenn: NEU, text: "Ein Sarkophag aus grauem Stein, versiegelt mit dem Turm über drei Wellen." }, { wenn: FERTIG, text: "Der Sarkophag ist leer und still." },
        { wenn: { offen: ["siegel"] }, text: "Die Grabwächter lassen dich nicht an den Sarkophag." }] },
  ],
  dialoge: {
    wigand: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Die Glocke läutet, und doch wandern sie. Ich weiß, warum.",
          "Der letzte Hauptmann von Grauwacht liegt im größten Hügelgrab. Er hat geschworen, die Weiten zu halten, bis die Wacht zurückkehrt. Er hält sie noch. Mit den Toten."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Seine Klinge hängt über dem Tor. Jeder, der hindurchgeht, grüßt sie. Ich auch."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "klinge_hauptmann" }, zeilen: ["Du bist zurück. Und du trägst … ist das seine Klinge?"], antworten: ["klinge_geben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Er ruht, sagst du. Und seine Klinge? Die gehört in die Burg."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["waechter"] }, zeilen: ["Die Wächter sind gefallen? Dann bist du weiter als ich je war."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Das größte Hügelgrab, östlich der Heide. Geh hinunter."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe ihm Ruhe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Ruhe. Ja. Das hat er verdient.", "Bring mir seine Klinge. Sie gehört in die Burg, über das Tor, wo jeder sie sieht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Er hat Jahre gewartet. Er kann noch eine Nacht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "klinge_geben", text: "Die Klinge übergeben.", wenn: { hat: "klinge_hauptmann" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "klinge_hauptmann" }],
          zeilen: ["Wigand nimmt die Klinge mit beiden Händen und kniet. Mitten im Hof.", "Grauwacht ist wieder eine Stadt. Die Werkstatt öffnet, der Markt, der Wegstein am Brunnen.",
            "Und das hier – sein Wappenrock. Er lag bei ihm. Trag ihn. Die Wacht braucht wieder Gesichter.", "Im Osten ist eine Brücke, zur Furt. Gesperrt, seit … seit immer. Irgendwann gehen wir da hinüber."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  /* Die Klinge: garantiert vom Grauen Hauptmann in der Quest-Instanz (Rolle Spiel: chance 100) */
  beute: { e4_klinge: { erledigt: ["hauptmann"], offen: ["klinge"] } },
  schalter: { grauwacht_stufe3: FERTIG, hauptmann_instanz: LAEUFT },
  belohnungText: "Belohnung: Grauwachts Wappenrock, Stärke 1.000, Defense 1.000, LP 500 XP, 600 Splitter · danach: Grauwacht ist voll belebt (Werkstatt, Markt, Wegstein)",
  belohnung: { xp: { staerke: 1000, defense: 1000, lp: 500 }, splitter: 600, gegenstaende: [{ g: "wappenrock_grauwacht" }] },
  punkte: 3,
};
