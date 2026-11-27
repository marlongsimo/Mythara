/*
 * Riftmere – Quest S8 „Der Graupelz“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Bodo Span in Erlengrund: Ein Alpha-Wolf reißt die Zugpferde. QUER: Förster Hartwig im Nordwald kennt die Spur.
 * Hartwig fragen, drei Spuren im Erlengrund-Wald lesen, den Graupelz in der Waldsenke stellen (Mini-Gegner, kein Boss, erscheint selten mit zwei Wölfen).
 * Danach hängt sein Fell an der Wand der Sägemühle (Schalter s8_trophaee). Lohn aus vorhandenen Gegenständen: Stärke 800, Geschick 400 XP, 2 Heiltränke, 150 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Einbau Süden #126, Anschlüsse #134). Stellen aus der Welt (#120). Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { ERLENGRUND, BODO, HARTWIG } from "./quest_s_orte";
import { S4 } from "./quest_s4";

export const S8 = "erlengrund_der_graupelz";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const SPUREN = ["spur_1", "spur_2", "spur_3"];
const HILFE = ["Hartwig im Nordwald! Der kennt jeden Wolf beim Vornamen!", "Spuren im Wald hinter der Mühle! Drei! Dann weißt du, wo er schläft!",
  "Die Senke! Er kommt nicht jeden Tag! Und nie allein!"];

export const QUEST_S8: QuestDef = {
  id: S8, titel: "Der Graupelz", ort: "Erlengrund · Nordwald", start: "Sprich mit Bodo Span an der Sägemühle in Erlengrund.",
  logNeu: "In Erlengrund erzählen sie von einem grauen Wolf, so groß wie ein Kalb.",
  logAngeboten: "Bodo Span in Erlengrund will den Graupelz los sein.",
  logAbgabe: "Der Graupelz ist erlegt. Sag Bodo Span Bescheid.",
  logFertig: "Das Fell des Graupelzes hängt an der Wand der Sägemühle in Erlengrund. Die Zugpferde schlafen wieder.",
  geber: "bodo",
  figuren: [BODO, HARTWIG],
  voraussetzungen: [
    { text: "„Klemmende Säge“ abgeschlossen", wenn: { quest: { id: S4, phase: ["fertig"] } } },
    { text: "Heldenlevel 25", wenn: { heldenlevel: 25 } },
  ],
  schritte: [
    { id: "hartwig", text: "Förster Hartwig nach dem Graupelz fragen", ereignis: { art: "antwort" }, bei: "foerster", wo: "foerster",
      log: "Frag Förster Hartwig am Waldweg westlich der Waldmark nach dem Graupelz." },
    ...SPUREN.map((id, i) => ({ id, text: "Die Spuren des Graupelzes lesen", ereignis: { art: "objekt" as const, id: "s8_" + id }, gruppe: "spuren", nach: ["hartwig"], wo: ERLENGRUND.spuren[i],
      log: "Lies im Wald hinter der Sägemühle die Spuren des Graupelzes ({n:spuren})." })),
    { id: "graupelz", text: "Den Graupelz stellen", ereignis: { art: "erlegen", typ: "graupelz" }, nach: SPUREN, wo: ERLENGRUND.senke,
      log: "Stell den Graupelz in der Waldsenke bei Erlengrund. Er kommt nicht jeden Tag – und nie allein." },
  ],
  objekte: [
    ...SPUREN.map((id, i) => ({ id: "s8_" + id, name: ["Pfotenabdruck", "Gerissener Zaunpfahl", "Graue Haare an der Rinde"][i], x: ERLENGRUND.spuren[i][0], y: ERLENGRUND.spuren[i][1],
      modell: "stelle", tat: "untersuchen" as const, tatText: "Die Spur lesen", weit: 2.5,
      text: ["Ein Abdruck, groß wie deine Hand. Daneben zwei kleinere. Hartwig hatte recht ({n:spuren}).", "Der Pfahl ist zerbissen, nicht zerbrochen. Er war hungrig ({n:spuren}).",
        "Graues Haar, hoch an der Rinde. Hier reibt er sich. Die Senke ist nah ({n:spuren})."][i],
      schon: "Die Spur des Graupelzes.", sonst: [{ wenn: NEU, text: "Waldboden." }, { wenn: FERTIG, text: "Waldboden." }, { wenn: { offen: ["hartwig"] }, text: "Waldboden. Was du hier suchst, weiß Hartwig." }] })),
  ],
  /* Bodo: ruft, immer. Hartwig: ruhig, knapp, redet mit Bäumen mehr als mit Menschen. */
  dialoge: {
    bodo: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["DU! Gut, dass du kommst! Der Graupelz war wieder da!", "Zwei Zugpferde! Ohne Pferde keine Stämme, ohne Stämme keine Säge!"], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Der Wald ist gefährlich! Komm wieder, wenn du stärker bist!"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Da hängt er! Jeden Morgen sag ich ihm guten Tag! Er antwortet nicht mehr!"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Erlegt? WIRKLICH? Erzähl!"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: SPUREN }, zeilen: ["Die Senke! Da schläft er! Geh, wenn's dämmert! Oder wenn's hell ist! Hauptsache, du gehst!"], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hartwig"] }, zeilen: ["Hartwig weiß was? Natürlich weiß er was! Dann lies die Spuren!"], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Hartwig! Im Nordwald! Frag ihn!"], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich stelle den Graupelz. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["DANKE! Aber nicht blind in den Wald!", "Frag zuerst Hartwig im Nordwald. Der kennt die Spur!"] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann pass auf dich auf! Und auf meine Pferde!"] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Der Graupelz ist erlegt.", folge: [{ f: { abschluss: true, zeilen: ["Bodo wird still. Zum ersten Mal.", "…Danke.", "SEIN FELL KOMMT AN DIE WAND! Und das hier ist für dich!"] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["WAS? Ja! Tschüss!"] } }] },
      ],
    },
    foerster: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["hartwig"] }, zeilen: ["Du riechst nach Sägespänen. Erlengrund?"], antworten: ["graupelz_fragen", "tschuess"] },
        { zeilen: ["Der Wald ist ruhig heute."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "graupelz_fragen", text: "Was weißt du über den Graupelz?", folge: [{ f: { erledige: ["hartwig"],
          zeilen: ["Der Graupelz. Den kenne ich. Er kam vor drei Wintern aus dem Norden. Allein.", "Jetzt hat er zwei bei sich. Junge.", "Lies die Spuren. Er reibt sich an Rinde, er beißt Holz. Er schläft in der Senke. Und er lässt dich warten."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh leise."] } }] },
      ],
    },
  },
  schalter: { s8_trophaee: FERTIG },
  belohnungText: "Belohnung: Stärke 800, Geschick 400 XP, 2 Heiltränke, 150 Splitter · danach: das Fell des Graupelzes an der Wand der Sägemühle",
  belohnung: { xp: { staerke: 800, geschick: 400 }, splitter: 150, gegenstaende: [{ g: "heiltrank", n: 2 }] },
  punkte: 1,
};
