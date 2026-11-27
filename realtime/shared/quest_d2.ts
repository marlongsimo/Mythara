/*
 * Riftmere – Quest D2 „Das grüne Licht“ (Phase 7), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-7.md. Beginnt am Ostanleger bei Kord Weller („Seit die Kette riss, brennt da drüben dieses Licht.“), Abgabe bei Merit Stahl.
 * Wappentür des Turms, Turmwächter auf Ebene 1 und 2, das Wächterbuch auf Ebene 3, das Grünlicht auf dem Dach, der Splitterkern im Signalfeuer,
 * der Geist der Wächterin Ysolde. Lohn: je 1.000 XP Stärke, Geschick, Defense, 500 LP-XP, 600 Splitter, 2 Questpunkte, Wegstein-Ziel Ostufer (Turm).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 7 (Ostufer und Turm aus #36, Ysolde und Gegner aus #37, Spiel nach Phase 6).
 * Stellen aus der Welt (#36): Ostanleger in graufurt, Wappentür in ostufer (Ursprung 6784 | 6400), Turm turm_ebene1–3 und turm_dach (Ursprung 10880 … 10976 | 9600). Liste: doku/quests/d-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { D1 } from "./quest_d1";

export const D2 = "ostufer_das_gruene_licht";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Ostanleger (graufurt 80,4 | 113,4), Wappentür (ostufer 56 | 119), Ebene 1 Mitte, Wächterbuch (turm_ebene3 16 | 16,4), Signalfeuer (turm_dach 16 | 17,2), Merit vor dem Bergfried */
const OSTANLEGER: [number, number] = [6736.4, 6515.4], TUER: [number, number] = [6840, 6519], EBENE: [number, number] = [10896.5, 9614.5];
const BUCH: [number, number] = [10960, 9616.4], DACH: [number, number] = [10992, 9617.2], MERIT: [number, number] = [6677.5, 6484.5];
const HILFE = ["Der Turm steht oben auf der Anhöhe. Die Tür hat das Wappen – Turm über drei Wellen. Du weißt ja, wie das aussieht.",
  "Drinnen sollen Wächter stehen. Steinerne. Die alten Leute sagen, die haben nie aufgehört zu wachen.", "Ganz oben brennt das Licht. Bring der Hauptfrau, was du findest."];

export const QUEST_D2: QuestDef = {
  id: D2, titel: "Das grüne Licht", ort: "Ostufer · Turm · Graufurt", start: "Sprich mit Kord Weller am Ostanleger, gegenüber von Graufurt.",
  logNeu: "Am Ostufer steht auf einer Anhöhe ein Turm. In seinem obersten Fenster brennt ein grünes Licht – jede Nacht, seit die Fährkette riss.",
  logAngeboten: "Kord Weller am Ostanleger hat dir vom grünen Licht im Turm erzählt.",
  logAbgabe: "Bring den Splitterkern aus dem Signalfeuer zu Hauptfrau Merit Stahl in den Bergfried von Graufurt.",
  logFertig: "Das grüne Licht ist erloschen. Ysolde hat gewartet, dass Grauwacht antwortet – niemand antwortete. Der Weg nach Grauwacht im Nordsaum ist zugewachsen. Noch.",
  geber: "kord_ost", abgabe: "merit",
  figuren: [
    { id: "kord_ost", name: "Kord Weller", modell: "npc.kord", x: OSTANLEGER[0], y: OSTANLEGER[1], blick: [1, 0] },
    { id: "ysolde", name: "Ysolde", modell: "npc.ysolde", x: DACH[0] + 2, y: DACH[1], blick: [-1, 0] },
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
  ],
  voraussetzungen: [{ text: "„Die Fährkette“ abgeschlossen", wenn: { quest: { id: D1, phase: ["fertig"] } } }],
  schritte: [
    { id: "tuer", text: "Die Wappentür des Turms öffnen", ereignis: { art: "objekt", id: "d2_tuer" }, wo: TUER,
      log: "Geh zum Turm auf der Anhöhe am Ostufer und öffne die Tür mit dem Wappen. (Heldenlevel 45 empfohlen.)" },
    { id: "waechter", text: "Die Turmwächter auf Ebene 1 und 2 besiegen", ereignis: { art: "erlegen", typ: "turmwaechter" }, anzahl: 2, nach: ["tuer"], wo: EBENE,
      log: "Auf den ersten beiden Ebenen des Turms wachen steinerne Turmwächter. Besieg sie ({n:waechter}). Weich aus, wenn die Felder um sie leuchten." },
    { id: "buch", text: "Das Wächterbuch lesen", ereignis: { art: "objekt", id: "d2_buch" }, nach: ["waechter"], wo: BUCH,
      log: "Auf der dritten Ebene liegt ein Buch. Lies es." },
    { id: "gruenlicht", text: "Das Grünlicht auf dem Dach besiegen", ereignis: { art: "erlegen", typ: "gruenlicht" }, nach: ["buch"], wo: DACH,
      log: "Auf dem Dach bewacht ein Grünlicht das Signalfeuer. Besieg es." },
    { id: "kern", text: "Den Splitterkern aus dem Signalfeuer nehmen", ereignis: { art: "objekt", id: "d2_feuer" }, nach: ["gruenlicht"], wo: DACH,
      log: "Nimm den Splitterkern aus dem grünen Signalfeuer." },
    { id: "ysolde", text: "Mit der Wächterin Ysolde sprechen", ereignis: { art: "antwort" }, nach: ["kern"], bei: "ysolde",
      log: "Als das Feuer erlischt, steht eine Gestalt auf dem Dach. Sprich mit ihr." },
  ],
  objekte: [
    { id: "d2_tuer", name: "Tür mit dem Wappen", x: TUER[0], y: TUER[1], modell: "stelle", tat: "benutzen", tatText: "Die Tür öffnen", weit: 3,
      text: "Du legst die Hand auf das Wappen – Turm über drei Wellen. Etwas im Stein erkennt es. Die Tür schwingt auf, als hätte sie gewartet.",
      schon: "Die Tür steht offen.", sonst: [{ wenn: NEU, text: "Eine schwere Tür. In das Holz ist ein Wappen geschnitzt: ein Turm über drei Wellen." }, { wenn: FERTIG, text: "Die Tür steht offen. Drinnen ist es still." }] },
    { id: "d2_buch", name: "Wächterbuch", x: BUCH[0], y: BUCH[1], modell: "stelle", tat: "untersuchen", tatText: "Das Buch lesen", weit: 2.5,
      text: "„Dritter Tag ohne Antwort aus Grauwacht. Die Glocke schweigt. Wir halten das Feuer am Brennen, bis jemand kommt.“ – Die letzten Seiten sind leer. Nur ein Name, immer wieder: Ysolde.",
      schon: "„Wir halten das Feuer am Brennen, bis jemand kommt.“", sonst: [{ wenn: NEU, text: "Ein Buch mit dem Wappen der Wacht. Es ist abgeschlossen." }, { wenn: FERTIG, text: "Das Wächterbuch. Ysolde hat ihren Namen hineingeschrieben." },
        { wenn: { offen: ["buch"] }, text: "Ein Buch mit dem Wappen der Wacht. Erst die Wächter." }] },
    { id: "d2_feuer", name: "Grünes Signalfeuer", x: DACH[0], y: DACH[1], modell: "stelle", tat: "benutzen", tatText: "Den Splitterkern nehmen", weit: 3,
      geben: [{ g: "splitterkern_gruen" }],
      text: "Du greifst in die grüne Flamme. Sie brennt nicht – sie ist kalt. Der Kern löst sich, und das Licht erlischt. Über den Fluss hinweg wird es dunkel.",
      schon: "Die Schale ist leer und kalt.", sonst: [{ wenn: NEU, text: "Eine Feuerschale. Grünes Licht, das nicht wärmt." }, { wenn: FERTIG, text: "Die Schale ist leer und kalt." },
        { wenn: { offen: ["kern"] }, text: "Das Grünlicht kreist um die Schale. So kommst du nicht heran." }] },
  ],
  /* Kord am Ostanleger: maulfaul, aber hier drüben nervös. Ysolde: Geist, spricht langsam, in der Zeit von damals, wartet noch immer auf Antwort.
     Merit: Hauptfrau, förmlich – bis sie Ysoldes Namen hört. */
  dialoge: {
    kord_ost: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Da. Siehst du's? Seit die Kette riss, brennt da drüben dieses Licht.", "Ich fahr dich her. Weiter geh ich nicht."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Zu Fuß hergekommen? Über den Pass? Respekt. Ich fahr dich zurück, wenn du willst."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Dunkel da oben. Endlich. Ich schlaf wieder."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kern"] }, zeilen: ["Das Licht ist aus! Ich hab's gesehen, vom Boot aus.", "Was hast du da oben gefunden? …Nein. Sag's der Hauptfrau, nicht mir."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["tuer"] }, zeilen: ["Du warst drin? Und kommst wieder raus? Respekt."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der Turm. Oben auf der Anhöhe. Ich wart hier."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich sehe nach. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Mutig. Oder dumm. Bei euch Wanderern weiß man das nie.",
          "Die Tür hat das Wappen der Wacht. Und der Turm gehört der Wacht. Was auch immer da oben ist – bring's der Hauptfrau."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Gut. Ich wollt's auch nicht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm. Ich wart am Boot."] } }] },
      ],
    },
    ysolde: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kern"], offen: ["ysolde"] }, zeilen: ["Das Feuer … ist aus.", "Hat Grauwacht geantwortet? Ist jemand gekommen?"], antworten: ["sprechen"] },
        { wenn: { erledigt: ["ysolde"] }, zeilen: ["Geh. Sag ihnen, dass wir gewartet haben."], antworten: ["tschuess"] },
        { zeilen: ["Eine Gestalt flackert im grünen Licht. Sie sieht durch dich hindurch, über den Fluss, nach Norden."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "sprechen", text: "Niemand ist gekommen. Die Wacht gibt es nicht mehr.", folge: [{ f: { erledige: ["ysolde"], zeilen: ["Ysolde schweigt lange. Das Leuchten wird schwächer.",
          "Wir haben das Feuer entzündet, als der Himmel riss. Damit Grauwacht weiß, dass wir noch stehen. Damit sie die Glocke läuten.",
          "Die Glocke hat nie geläutet. Wir haben weiter gebrannt. Ich habe weiter gebrannt.", "Nimm den Kern. Bring ihn zu dem, der heute das Wappen trägt. Und wenn du je nach Grauwacht kommst – frag, warum sie schwiegen."] } }] },
        { id: "tschuess", text: "Gehen.", folge: [{ f: { zeilen: ["…"] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, hat: "splitterkern_gruen" }, zeilen: ["Du warst im Turm. Ich seh's dir an.", "Was hast du mitgebracht?"], antworten: ["kern_geben", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Das Licht ist aus. Und was hat es genährt? Wo ist es?"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ysolde. Ich hab den Namen nachgeschlagen. Sie war die letzte Hauptfrau am Ostufer.", "Und ich frage mich jeden Tag, warum Grauwacht geschwiegen hat."], antworten: ["tschuess"] },
        { zeilen: ["Hauptfrau Merit Stahl, Wacht von Graufurt."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "kern_geben", text: "Den Splitterkern geben und von Ysolde erzählen.", wenn: { hat: "splitterkern_gruen" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "splitterkern_gruen" }],
          zeilen: ["Merit hält den Kern in beiden Händen. Er ist noch kalt.", "Ysolde … Wartet. All die Jahre. Auf eine Glocke, die nie läutete.",
            "Die Wacht ist ihr etwas schuldig. Ich bin ihr etwas schuldig. Und dir.", "Der Weg nach Grauwacht ist zugewachsen. Noch. Wenn er frei wird, will ich wissen, warum sie geschwiegen haben."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  /* Die Wappentür (shared/bosse.ts, TUEREN „turm_wappentuer“) ist offen ab dem Schritt „tuer“ und nach der Quest */
  schalter: { wappentuer_offen: [{ erledigt: ["tuer"] }, FERTIG] },
  glueckwunsch: "Ysolde hat gewartet. Jetzt nicht mehr. Die Wacht dankt dir – und ich auch.",
  belohnungText: "Belohnung: je 1.000 XP Stärke, Geschick und Defense, 500 LP-XP, 600 Splitter · danach: Wegstein-Ziel Ostufer (Turm)",
  belohnung: { xp: { staerke: 1000, geschick: 1000, defense: 1000, lp: 500 }, splitter: 600 },
  punkte: 2,
};
