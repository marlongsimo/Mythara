/*
 * Riftmere – zwei kleine Aufgaben im Walddorf Pechtann (Westwald der Fahlen Weiten, #189), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Stellen aus Welts Bau (c3103542, welt/fahleweiten_orte.json): Pechtann (6470 | 6095), Jägerhütte mit der Jägerin (6481.5 | 6089.2), Pechkessel mit dem Pechsieder (6462.5 | 6100.6),
 * Jägerlager (6402 | 6172), Streifgebiet „Wildschweine im Westwald“ (Stufe 18, Mitte 6280 | 6175), Harzlichtung (6230 | 6045), Verfallene Pechhütte (Questplatz 6202 | 6129.5).
 *  – „Drei Wildschweine für die Jägerin“: Sigrun Fähr kommt mit dem verletzten Arm nicht hinaus. Spuren am Jägerlager lesen, drei Wildschweine im Westwald erlegen.
 *  – „Die verlorenen Harzeimer“: Gerlach Ruß wartet auf seine Harzeimer. Die Spur führt von der Harzlichtung zur Verfallenen Pechhütte.
 * Beide nach E1 („Der Weg nach Grauwacht“, die Fahlen Weiten sind offen), je 1 QP. Keine neuen Gegenstände.
 */
import type { QuestDef, Bed, QuestFigur, Voraussetzung } from "./questbau";
import { E1 } from "./quest_e1";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const NACH_E1: Voraussetzung = { text: "„Der Weg nach Grauwacht“ abgeschlossen", wenn: { quest: { id: E1, phase: ["fertig"] } } };

/* ───── Stellen (Welt c3103542) ───── */
const LAGER: Feld = [6401.5, 6173.5];     /* Jägerlager, am Feuer; Spuren nach Westen */
const SCHWEINE: Feld = [6280, 6175];      /* Streifgebiet „Wildschweine im Westwald“ */
const LICHTUNG: Feld = [6231.5, 6046.5];  /* Harzlichtung, umgestoßene Eimer */
const HUETTE: Feld = [6202, 6129.5];      /* Verfallene Pechhütte, Questplatz pechhuette_harzeimer */

/* ───── Figuren (Plätze jaegerin_pechtann, pechsieder_pechtann) ───── */
const SIGRUN: QuestFigur = { id: "sigrun", name: "Jägerin Sigrun Fähr", modell: "npc.wanderin", x: 6481.5, y: 6089.2, blick: [0, 1] };
const GERLACH: QuestFigur = { id: "gerlach", name: "Pechsieder Gerlach Ruß", modell: "npc.saegemueller", x: 6462.5, y: 6100.6, blick: [0, 1] };

/* ══════════════ „Drei Wildschweine für die Jägerin“ ══════════════ */
export const PECHTANN_WILDSCHWEINE = "pechtann_drei_wildschweine";
/* Sigrun: trocken, ungeduldig mit sich selbst, spricht in kurzen Sätzen. */
export const QUEST_PECHTANN_WILDSCHWEINE: QuestDef = {
  id: PECHTANN_WILDSCHWEINE, titel: "Drei Wildschweine für die Jägerin", ort: "Pechtann · Jägerlager · Westwald", start: "Sprich mit der Jägerin Sigrun Fähr an der Jägerhütte in Pechtann.",
  logNeu: "An der Jägerhütte in Pechtann sitzt eine Jägerin mit verbundenem Arm und flucht leise.",
  logAngeboten: "Sigrun Fähr in Pechtann braucht drei Wildschweine.",
  logAbgabe: "Drei Wildschweine liegen. Sag es Sigrun Fähr in Pechtann.",
  logFertig: "Die Rotte im Westwald ist kleiner geworden, und in Pechtann hängt wieder Fleisch im Rauch.",
  geber: "sigrun",
  figuren: [SIGRUN],
  voraussetzungen: [NACH_E1],
  schritte: [
    { id: "lager", text: "Die Spuren am Jägerlager lesen", ereignis: { art: "objekt", id: "pt_spuren" }, wo: LAGER,
      log: "Sigrun hat die Rotte zuletzt am Jägerlager südlich des Dorfs gespürt. Lies dort die Spuren." },
    { id: "schweine", text: "Drei Wildschweine im Westwald erlegen", ereignis: { art: "erlegen", typ: "wildschwein" }, anzahl: 3, nach: ["lager"], wo: SCHWEINE,
      log: "Die Spuren führen nach Westen, wo die Rotte wühlt. Erlege drei Wildschweine ({n:schweine})." },
  ],
  objekte: [
    { id: "pt_spuren", name: "Wühlspuren", x: LAGER[0], y: LAGER[1], modell: "stelle", tat: "untersuchen", tatText: "Spuren lesen", weit: 2.5,
      text: "Der Boden ist aufgewühlt, als hätte jemand gepflügt. Große Hufe, kleine Hufe, eine ganze Rotte. Die Fährte führt nach Westen, zwischen die alten Eichen.",
      schon: "Die Fährte führt nach Westen.",
      sonst: [{ wenn: NEU, text: "Aufgewühlter Boden. Wildschweine waren hier." }, { wenn: FERTIG, text: "Alte Spuren. Die Rotte meidet das Lager jetzt." }] },
  ],
  dialoge: {
    sigrun: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Sigrun hebt den verbundenen Arm. „Ein Keiler. Hat mich gegen einen Baum gedrückt. Mein Fehler.“",
          "Der Winter kommt, und im Rauchhaus hängt nichts. Drei Schweine, dann reicht es fürs Dorf. Ich kann den Bogen grade nicht spannen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Fremde im Westwald. Pass auf die Schweine auf."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du riechst nach Wald und Blut. Gut. Wie viele?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["lager"] }, zeilen: ["Nach Westen, ja. Da wühlen sie. Nicht zu nah an die Keiler, die sind schneller, als sie aussehen."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Erst das Jägerlager. Südlich, am Weg zur alten Wachruine. Lies die Spuren, dann weißt du, wohin."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Arm heilt. Nächsten Winter jag ich wieder selbst. Vielleicht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole dir drei Wildschweine. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Fang am Jägerlager an, südlich. Dort hab ich sie zuletzt gespürt. Und unterschätz die Keiler nicht. Ich hab's getan."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann nicht. Die Schweine warten. Der Winter nicht."] } }] },
        { id: "fertig", text: "Drei Wildschweine. Die Rotte ist kleiner geworden.", folge: [{ f: { abschluss: true,
          zeilen: ["Sigrun nickt langsam. „Drei. Das reicht bis zum Tauwetter.“", "Die Männer holen sie mit dem Karren. Hier, nimm. Und komm im Winter vorbei, dann gibt's Braten."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Augen auf im Wald."] } }] },
      ],
    },
  },
  glueckwunsch: "Drei Schweine und kein Arm gebrochen. Besser als ich.",
  belohnungText: "Belohnung: Stärke 800 XP, Fernkampf 400 XP, 150 Splitter",
  belohnung: { xp: { staerke: 800, fernkampf: 400 }, splitter: 150 },
  punkte: 1,
};

/* ══════════════ „Die verlorenen Harzeimer“ ══════════════ */
export const PECHTANN_HARZEIMER = "pechtann_die_verlorenen_harzeimer";
/* Gerlach: alt, rußig, redet viel und gern über Pech, vergesslich. */
export const QUEST_PECHTANN_HARZEIMER: QuestDef = {
  id: PECHTANN_HARZEIMER, titel: "Die verlorenen Harzeimer", ort: "Pechtann · Harzlichtung · Verfallene Pechhütte", start: "Sprich mit dem Pechsieder Gerlach Ruß am Pechkessel in Pechtann.",
  logNeu: "Am Pechkessel in Pechtann steht ein alter Pechsieder vor einem leeren Kessel.",
  logAngeboten: "Gerlach Ruß in Pechtann vermisst seine Harzeimer.",
  logAbgabe: "Die Harzeimer sind gefunden. Bring Gerlach Ruß in Pechtann die Nachricht.",
  logFertig: "Der Kessel in Pechtann brodelt wieder. Gerlach hat seine Eimer – und weiß jetzt, wer sie umgestoßen hat.",
  geber: "gerlach",
  figuren: [GERLACH],
  voraussetzungen: [NACH_E1],
  schritte: [
    { id: "lichtung", text: "An der Harzlichtung nach den Eimern sehen", ereignis: { art: "objekt", id: "pt_lichtung" }, wo: LICHTUNG,
      log: "Gerlachs Harzsammler haben die Eimer an der Harzlichtung im Westen stehen lassen. Sieh dort nach." },
    { id: "huette", text: "Die Harzeimer in der Verfallenen Pechhütte finden", ereignis: { art: "objekt", id: "pt_harzeimer" }, nach: ["lichtung"], wo: HUETTE,
      log: "An der Lichtung liegen nur umgestoßene Eimer. Eine Schleifspur führt nach Süden, zur Verfallenen Pechhütte am Harzpfad." },
  ],
  objekte: [
    { id: "pt_lichtung", name: "Umgestoßene Eimer", x: LICHTUNG[0], y: LICHTUNG[1], modell: "stelle", tat: "untersuchen", tatText: "Genauer ansehen", weit: 2.5,
      text: "Drei Eimer liegen umgestoßen im Gras, das Harz ist ausgelaufen und klebt an den Halmen. Die anderen fehlen. Eine breite Schleifspur führt nach Süden, und überall Hufabdrücke.",
      schon: "Die Schleifspur führt nach Süden, zur alten Pechhütte.",
      sonst: [{ wenn: NEU, text: "Umgestoßene Eimer, ausgelaufenes Harz." }, { wenn: FERTIG, text: "Die Eimer sind fort. Nur das Harz klebt noch im Gras." }] },
    { id: "pt_harzeimer", name: "Harzeimer", x: HUETTE[0], y: HUETTE[1], modell: "stelle", tat: "untersuchen", tatText: "Durchsuchen", weit: 2.5,
      text: "Hinter der eingefallenen Wand der Pechhütte: acht Harzeimer, sauber aufgereiht, die Deckel fest. Daneben ein Lager aus Farn – und Schweineborsten. Die Rotte hat die Eimer nicht umgestoßen. Sie hat sie hierher geschleppt, weil das Harz süß riecht.",
      schon: "Die Eimer stehen bereit. Gerlachs Leute holen sie.",
      sonst: [{ wenn: NEU, text: "Eine eingefallene Hütte. Es riecht nach altem Pech." }, { wenn: FERTIG, text: "Hier standen Gerlachs Eimer." }, { wenn: { offen: ["lichtung"] }, text: "Eine eingefallene Hütte. Es riecht nach altem Pech." }] },
  ],
  dialoge: {
    gerlach: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Gerlach stochert in einem leeren Kessel. „Leer. Seit drei Tagen. Weißt du, was ein Pechsieder ohne Harz ist? Ein alter Mann mit schwarzen Händen.“",
          "Meine Sammler haben die Eimer an der Harzlichtung stehen lassen, über Nacht, wie immer. Am Morgen: weg. Die Jungs trauen sich nicht mehr hin. Sie reden von Geistern."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Pech für Fässer, Pech für Boote, Pech für Fackeln. Ohne Pech hält nichts dicht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Und? Geister?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["lichtung"] }, zeilen: ["Umgestoßen? Und eine Spur zur alten Hütte? Da hat seit meinem Vater keiner mehr gesotten. Sieh nach."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Die Harzlichtung, im Westen am Harzpfad. Folg dem Geruch, du kannst es nicht verfehlen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Kessel brodelt. Riechst du das? So riecht ein guter Tag."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich suche deine Eimer. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Gut! Die Harzlichtung, im Westen. Und wenn's doch Geister sind – lauf."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Na gut. Der Kessel ist geduldig. Ich weniger."] } }] },
        { id: "fertig", text: "Keine Geister. Wildschweine. Sie haben deine Eimer in die alte Pechhütte geschleppt.", folge: [{ f: { abschluss: true,
          zeilen: ["Gerlach starrt dich an. Dann lacht er, bis er husten muss.", "Schweine! Die Rotte von Sigrun! Die fressen alles, was süß riecht. Harz, Honig, meine Stiefel.",
            "Ich schick die Jungs mit dem Karren. Und einen Zaun bau ich um die Lichtung. Hier, für deine Mühe – und sag Sigrun, ihre Schweine schulden mir einen Kessel."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Halt dich vom Kessel fern, der beißt."] } }] },
      ],
    },
  },
  glueckwunsch: "Acht Eimer Harz! Das gibt Pech bis zum Frühjahr.",
  belohnungText: "Belohnung: Holzfällerei 800 XP, Handwerk 400 XP, 150 Splitter",
  belohnung: { berufe: { holzfaellerei: 800, handwerk: 400 }, splitter: 150 },
  punkte: 1,
};
