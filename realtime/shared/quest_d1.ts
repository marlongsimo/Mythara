/*
 * Riftmere – Quest D1 „Die Fährkette“ (Phase 7), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-7.md. Fährmann Kord Weller (Fährhaus Graufurt), Hauptfrau Merit Stahl (Bergfried), die Schmiedin der Stadt.
 * Merit gibt die Erlaubnis gegen das Wappen aus A2. 6 Splittereisenerz in der Furtklamm, an der Esse Barren, am Amboss 8 Kettenglieder (Quest-Rezept),
 * das Kettenschloss bei der Schmiedin (QUER: sie braucht Meilerpech gegen den Flussnebel – von Köhler Ulf im Nordwald, wie in C1), die Kette an der Winde des Westanlegers einhängen, erste Überfahrt mit Kord.
 * Lohn: 1.000 Schmieden-XP, 1.000 Bergbau-XP (Grenze aus Migration 048), 400 Splitter, 2 Questpunkte. Schalter faehre_frei (die Fähre fährt: die Abkürzung zum Ostufer – zu Fuß geht es auch, der lange Weg über den Pass in den Glutsanden, #74).
 * Alle neuen Namen sind Vorschläge (doku/KANON.md).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 7 (Figuren #37, Spiel nach Phase 6). Stellen aus der Welt (#36, Region graufurt, Ursprung 6656 | 6400).
 * Liste: doku/quests/d-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { A2 } from "./quest_a2";

export const D1 = "graufurt_die_faehrkette";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Graufurt (#36): Fährmann 61,8 | 115,6, Winde 60,1 | 111,8, vor dem Bergfried 21,5 | 82,6, vor der Schmiede 19,5 | 138,6, Furtklamm 34,4 | 44,6 */
const KORD: [number, number] = [6717.8, 6515.6], WINDE: [number, number] = [6716.1, 6511.8], MERIT: [number, number] = [6677.5, 6484.5];
const SCHMIEDIN: [number, number] = [6675.5, 6540.5], KLAMM: [number, number] = [6690.4, 6444.6], ULF: [number, number] = [6360.5, 6428.5];
const HILFE = ["Erst zu Hauptfrau Stahl im Bergfried. Ohne ihr Wort fass ich die Fähre nicht an. Zeig ihr dein Wappen.",
  "Dann Splittereisen aus der Furtklamm, sechs Brocken. An der Esse Barren draus, am Amboss acht Glieder. Schmieden 45, darunter wird's Draht.",
  "Das Schloss macht die Schmiedin, aber sie will Pech von Köhler Ulf aus dem Nordwald. Hol's ab. Und dann hängen wir die Kette an die Winde, hier am Anleger."];

export const QUEST_D1: QuestDef = {
  id: D1, titel: "Die Fährkette", ort: "Graufurt · Furtklamm", start: "Sprich mit Fährmann Kord Weller am Fährhaus in Graufurt.",
  logNeu: "Am Fährhaus von Graufurt liegt die Fähre schief am Anleger. Ihre Kette ist gerissen. Der Fährmann sitzt daneben und flickt ein Netz, das nicht kaputt ist.",
  logAngeboten: "Fährmann Kord Weller in Graufurt wartet, ob du die Fährkette neu schmiedest.",
  logAbgabe: "Die Kette hängt an der Winde. Sag Kord Weller Bescheid – die erste Überfahrt gehört dir.",
  logFertig: "Die Fähre von Graufurt fährt wieder. Kord Weller setzt dich ans Ostufer über, wann immer du willst – kürzer als der lange Weg durch die Glutsande.",
  geber: "kord",
  figuren: [
    { id: "kord", name: "Kord Weller", modell: "npc.kord", x: KORD[0], y: KORD[1], blick: [-1, 0] },
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
    { id: "schmiedin", name: "Die Schmiedin", modell: "npc.schmiedin", x: SCHMIEDIN[0], y: SCHMIEDIN[1], blick: [0, 1] },
    { id: "ulf", name: "Köhler Ulf", modell: "npc.schmied", x: ULF[0], y: ULF[1], blick: [1, 0] },
  ],
  voraussetzungen: [
    { text: "„Das Wappen mit dem Turm“ abgeschlossen", wenn: { quest: { id: A2, phase: ["fertig"] } } },
    { text: "Schmieden 45", wenn: { skill: { k: "schmieden", min: 45 } } },
    { text: "Bergbau 45", wenn: { skill: { k: "bergbau", min: 45 } } },
  ],
  schritte: [
    { id: "merit", text: "Hauptfrau Merit Stahl um Erlaubnis bitten", ereignis: { art: "antwort" }, bei: "merit",
      log: "Hol dir im Bergfried die Erlaubnis von Hauptfrau Merit Stahl. Sie will das Wappen mit dem Turm sehen." },
    { id: "erz", text: "Sechs Splittereisenerz abbauen", ereignis: { art: "sammeln", ziel: "splittereisen" }, anzahl: 6, nach: ["merit"], wo: KLAMM,
      log: "Bau in der Furtklamm sechs Splittereisenerz ab ({n:erz})." },
    { id: "glieder", text: "Acht Kettenglieder schmieden", ereignis: { art: "herstellen", rezept: "kettenglied" }, anzahl: 8, nach: ["erz"], wo: "amboss",
      log: "Schmilz an der Esse Splittereisenbarren und schmiede am Amboss acht Kettenglieder ({n:glieder}). Ein Hammer muss im Rucksack sein." },
    { id: "pech", text: "Meilerpech von Köhler Ulf holen", ereignis: { art: "antwort" }, nach: ["merit"], bei: "ulf",
      log: "Die Schmiedin braucht Meilerpech für das Kettenschloss. Köhler Ulf auf der Köhlerlichtung im Nordwald brennt es dir – gegen drei Tannenstämme." },
    { id: "schloss", text: "Das Kettenschloss bei der Schmiedin abholen", ereignis: { art: "antwort" }, nach: ["pech"], bei: "schmiedin",
      log: "Bring der Schmiedin von Graufurt das Meilerpech und hol das Kettenschloss ab." },
    { id: "winde", text: "Die Kette an der Winde einhängen", ereignis: { art: "objekt", id: "d1_winde" }, nach: ["glieder", "schloss"], wo: WINDE,
      log: "Häng die neue Kette an der Winde des Westanlegers ein: acht Glieder und das Schloss." },
  ],
  objekte: [
    { id: "d1_winde", name: "Winde am Westanleger", x: WINDE[0], y: WINDE[1], modell: "stelle", tat: "benutzen", tatText: "Die Kette einhängen", weit: 3,
      braucht: { wenn: { hat: "kettenschloss", anzahl: { g: "kettenglied", min: 8 } }, text: "Eine rostige Winde, an der ein abgerissenes Kettenende baumelt. Acht Glieder und ein Schloss braucht es, sagt Kord." },
      nehmen: [{ g: "kettenglied", n: 8 }, { g: "kettenschloss" }],
      text: "Glied um Glied läuft durch deine Hände, dann schnappt das Schloss zu. Kord legt sich in die Kurbel – die Kette spannt sich über den grauen Fluss, und die Fähre richtet sich auf.",
      schon: "Die Kette ist straff gespannt. Die Fähre wartet.",
      sonst: [{ wenn: NEU, text: "Eine rostige Winde, an der ein abgerissenes Kettenende baumelt." }, { wenn: FERTIG, text: "Die Kette läuft sauber über die Winde." },
        { wenn: { offen: ["winde"] }, text: "Eine rostige Winde, an der ein abgerissenes Kettenende baumelt. Erst die Glieder und das Schloss." }] },
  ],
  /* Kord: Fährmann, maulfaul, Flussweisheiten, schaut immer aufs andere Ufer. Merit: Hauptfrau der Wacht, aufrecht, förmlich, hält an der alten Ordnung fest.
     Die Schmiedin: laut, schnell, keine Zeit, Hammer in der Hand. */
  dialoge: {
    kord: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Riss im Frühjahr. Einfach so. Die Kette hat dreißig Jahre gehalten, und dann – plopp.",
          "Seitdem steht die Fähre. Und drüben brennt dieses Licht."], antworten: ["annehmen", "licht", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Fähre fährt nicht. Siehst du doch.", "Wer die Kette neu machen will, muss Splittereisen schmieden können. Und abbauen. Das kannst du nicht. Noch nicht."], antworten: ["was_fehlt", "licht", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Übersetzen? Steig ein. Für dich fahr ich immer."], antworten: ["licht", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Sie hält. Ich hab's gehört, das Knarren. Das schönste Geräusch der Welt.", "Na komm. Die erste Fahrt gehört dir."], antworten: ["fahrt"] },
        { wenn: { ...LAEUFT, erledigt: ["glieder", "schloss"] }, zeilen: ["Glieder und Schloss? Dann an die Winde damit. Ich halt die Kurbel."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["erz"] }, zeilen: ["Splittereisen. Schwer, oder? Das hält was aus.", "Jetzt an die Esse und den Amboss. Acht Glieder."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["merit"] }, zeilen: ["Die Hauptfrau hat ja gesagt? Hätt ich nicht gedacht.", "Dann ab in die Furtklamm. Splittereisen."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Erst zur Hauptfrau. Bergfried. Sie redet nicht mit jedem, aber mit dir vielleicht."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich schmiede eine neue Kette. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du? Hm. Splittereisen schmiedet nicht jeder.",
          "Aber erst die Hauptfrau. Merit Stahl, oben im Bergfried. Die Fähre gehört der Wacht, nicht mir. Ich fahr sie nur."] } }] },
        { id: "licht", text: "Was für ein Licht?", folge: [{ f: { weiter: true, zeilen: ["Drüben, am Ostufer. Im Turm. Grün.", "Seit die Kette riss, brennt es jede Nacht. Ich schau nicht hin. Meistens.", "Hinkommen? Zu Fuß, durch den Sand im Süden und über den Pass. Tage. Mit der Fähre: ein Lied lang."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Der Fluss läuft nicht weg. Ich auch nicht."] } }] },
        { id: "was_fehlt", text: "Was muss ich können?", folge: [{ f: { weiter: true, zeilen: ["Schmieden 45, Bergbau 45. Und die Hauptfrau muss dich kennen – mit dem Wappen mit dem Turm.", "Steht alles in deinem Questlog."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fahrt", text: "Fahren wir. (Quest abschließen)", folge: [{ f: { abschluss: true, zeilen: ["Kord stößt ab. Die Kette knarrt, die Fähre gleitet über das graue Wasser.",
          "Mitten auf dem Fluss sagt er: „Danke.“ Mehr nicht. Für Kord ist das eine Rede.", "Von jetzt an fahr ich dich, wann immer du willst. Und das Licht da drüben … schau's dir an. Mir ist es nicht geheuer."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm. Der Fluss grüßt."] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["merit"], hat: "wappenabrieb" }, zeilen: ["Halt. Wer schickt dich?", "…Kord. Natürlich. Und was willst du mit der Fähre der Wacht?"], antworten: ["wappen", "tschuess"] },
        { wenn: { ...LAEUFT, offen: ["merit"] }, zeilen: ["Halt. Wer schickt dich?", "Kord? Die Fähre gehört der Wacht. Zeig mir, dass du weißt, was das heißt – oder geh."], antworten: ["kein_wappen", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Fähre fährt. Gut. Der Fluss gehört wieder uns."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Du hast mein Wort. Enttäusch es nicht."], antworten: ["tschuess"] },
        { zeilen: ["Hauptfrau Merit Stahl, Wacht von Graufurt.", "Was es von der Wacht noch gibt, jedenfalls."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wappen", text: "Den Wappenabrieb zeigen.", wenn: { hat: "wappenabrieb" }, folge: [{ f: { erledige: ["merit"], zeilen: ["Merit nimmt das Pergament. Lange. Der Turm über drei Wellen.",
          "Von der Gruft im Nordwald? Dann weißt du mehr über die Wacht als die meisten, die heute ihr Wappen tragen.", "Gut. Du hast mein Wort. Schmiede die Kette. Und gib das hier nicht aus der Hand."] } }] },
        { id: "kein_wappen", text: "Ich kenne das Wappen mit dem Turm. Bruder Anselm hat es mir gezeigt.", folge: [{ f: { erledige: ["merit"], zeilen: ["Anselm? Der alte Mönch an der Kapelle? …Dann warst du an der Gruft.",
          "Gut. Du hast mein Wort. Schmiede die Kette."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
    ulf: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["merit"], offen: ["pech"] }, zeilen: ["Pech? Für Graufurt? Für eine Kette?", "Hm. Drei Tannenstämme. Dann brenn ich's dir."], antworten: ["tannen", "tschuess"] },
        { zeilen: ["Der Meiler brennt. Komm nicht zu nah."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "tannen", text: "Drei Tannenstämme geben.", wenn: { anzahl: { g: "stamm_tanne", min: 3 } }, folge: [{ f: { erledige: ["pech"], nehmen: [{ g: "stamm_tanne", n: 3 }], geben: [{ g: "meilerpech", name: "einen Topf Meilerpech" }],
          zeilen: ["Ulf wirft die Stämme in den Meiler. „Graufurt. Da war ich mal. Zu viel Nebel.“", "Hier. Noch warm."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
    schmiedin: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["merit"], offen: ["pech"] }, zeilen: ["Du bist das mit der Kette? Kord hat's rumerzählt.", "Das Schloss ist fertig, aber roh. Im Flussnebel rostet es dir in einem Winter weg. Ich brauch Meilerpech zum Versiegeln. Köhler Ulf im Nordwald hat das beste."],
          antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["pech"], offen: ["schloss"] }, zeilen: ["Pech von Ulf? Riecht man bis hier. Gut.", "Das Schloss liegt bereit. Hab's schon vor Wochen gemacht. Hat nur keiner abgeholt."],
          antworten: ["schloss_nehmen", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Hält das Schloss? Natürlich hält es. Ich hab's gemacht."], antworten: ["tschuess"] },
        { zeilen: ["Keine Zeit, keine Zeit. Wenn du was willst, sag's schnell."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "schloss_nehmen", text: "Das Meilerpech geben und das Kettenschloss nehmen.", wenn: { hat: "meilerpech" }, folge: [{ f: { erledige: ["schloss"], nehmen: [{ g: "meilerpech" }], geben: [{ g: "kettenschloss", name: "das Kettenschloss" }],
          zeilen: ["Hier. Splittereisen, gehärtet, zweimal. Das reißt nicht – eher reißt der Fluss."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Ja, ja."] } }] },
      ],
    },
  },
  sperren: { herstellen: { kettenglied: [{ wenn: { phase: ["neu", "fertig"] }, text: "Kettenglieder schmiedest du nur für Kords Fähre." }, { wenn: { erledigt: ["glieder"] }, text: "Acht Glieder hast du schon." }] } },
  schalter: { faehre_frei: FERTIG },
  belohnungText: "Belohnung: 1.000 Schmieden-XP, 1.000 Bergbau-XP, 400 Splitter · danach: die Fähre fährt – der kurze Weg zum Ostufer",
  belohnung: { berufe: { schmieden: 1000, bergbau: 1000 }, splitter: 400 },
  punkte: 2,
};
