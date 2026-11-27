/*
 * Riftmere – Quest S9 „Briefe nach Süden“ (Süden, Block S, kleine Quer-Quest), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Othmar Rehn in Weidenhain hat Post für jeden Ort entlang der Südstraße – und einen Brief für Kielmund.
 * Sechs Briefe abgeben (Heckenhof, Summweide, Schilfsee, Erlengrund, Kreuzstein, Lehmfurt), jeder Ort gibt etwas Kleines mit, der letzte Brief geht an Jasper Kranich in Kielmund.
 * QUER zu G1 „Die Südstraße“ (kueste_die_suedstrasse): Kranich spricht vom verlorenen Getreidewagen, nach G1 bedankt er sich für den Frachtbrief.
 * Keine neuen Gegenstände: Die Briefe sind nur Text, die Gaben gibt es schon. Lohn: 300 Geschick XP, 100 Splitter, 1 Questpunkt.
 *
 * Im Spiel (shared/quests.ts) seit 27.11. Stellen aus der Welt (#120), Figuren vorläufig bis #121. Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed, Option, Rede } from "./questbau";
import { OTHMAR_F, KRANICH, RIKE, IMME, EBBA, BODO, ODILA, KUNO } from "./quest_s_orte";
import { G1 } from "./quest_g1";

export const S9 = "weidenhain_briefe_nach_sueden";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Empfänger: Figur, Ort, was sie sagt, was sie mitgibt */
const POST = [
  { f: RIKE, gruss: "Post? Ich hab keine Zeit für Post. …Gib her.", ort: "auf dem Heckenhof", sagt: ["Von Othmar? Der schreibt, als hätte er Zeit.", "…Er will Kuhfleisch für das Erntefest. Na gut. Hier, ein Brot für den Weg."], g: "brot", name: "ein Brot" },
  { f: IMME, gruss: "Mmm? Ein Bote? Für mich?", ort: "in Summweide", sagt: ["Mmm. Ein Brief. Er riecht nach Weidenhain.", "Othmar bestellt Honig. Wie jedes Jahr. Nimm einen kleinen Trank – mit Honig."], g: "kleiner_heiltrank", name: "einen kleinen Heiltrank" },
  { f: EBBA, gruss: "Was hast du da? Papier? Hier draußen?", ort: "am Schilfsee", sagt: ["Post? Für mich? Wer schreibt mir denn?", "…Lambert. Er fragt, ob der Hecht noch lebt. Hier, ein Barsch. Gebraten. Iss ihn, bevor er's tut."], g: "fisch_muehlbarsch_gebraten", name: "einen gebratenen Mühlbarsch" },
  { f: BODO, gruss: "WAS IST DAS? EIN BRIEF?", ort: "in Erlengrund", sagt: ["POST! Ich krieg nie Post!", "Othmar will Bretter für die Scheune! Sag ihm: JA! Und nimm einen Stamm mit!"], g: "stamm_eiche", name: "einen Eichenstamm" },
  { f: ODILA, gruss: "Ein Bote. Friede mit dir.", ort: "am Kreuzstein", sagt: ["Ein Brief. Für eine Pilgerin.", "Othmar bittet um ein Gebet für die Ernte. Gern. Nimm ein Licht mit."], g: "seelenlicht", name: "ein Seelenlicht" },
  { f: KUNO, gruss: "Brief?", ort: "in Lehmfurt", sagt: ["Brief.", "…Nägel. Er will Nägel. Gut. Kupfer. Ein Barren. Für dich."], g: "barren_kupfer", name: "einen Kupferbarren" },
];
const IDS = POST.map((p) => "brief_" + p.f.id);
const HILFE = ["Sechs Briefe: Rike auf dem Heckenhof, Imme in Summweide, Ebba am Schilfsee, Bodo in Erlengrund, Odila am Kreuzstein, Kuno in Lehmfurt.",
  "Immer der Südstraße nach. Die Reihenfolge ist egal – nur der letzte, der geht nach Kielmund.", "Der für Kielmund ist an Jasper Kranich, vom Küstenhaus. Den gibst du zuletzt ab."];

export const QUEST_S9: QuestDef = {
  id: S9, titel: "Briefe nach Süden", ort: "Weidenhain · Südstraße · Kielmund", start: "Sprich mit Bürgermeister Othmar Rehn in Weidenhain.",
  logNeu: "Othmar Rehn in Weidenhain sortiert Briefe auf einem Fass. Es sind viele.",
  logAngeboten: "Othmar Rehn in Weidenhain sucht jemanden, der Briefe nach Süden trägt.",
  logAbgabe: "Bring den letzten Brief zu Jasper Kranich im Küstenhaus in Kielmund.",
  logFertig: "Die Post ist im Süden angekommen – vom Heckenhof bis nach Kielmund. Jeder Ort an der Südstraße kennt jetzt dein Gesicht.",
  geber: "othmar", abgabe: "kranich",
  figuren: [OTHMAR_F, KRANICH, ...POST.map((p) => p.f)],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Heldenlevel 10", wenn: { heldenlevel: 10 } },
  ],
  schritte: POST.map((p, i) => ({ id: IDS[i], text: "Die Briefe entlang der Südstraße abgeben", ereignis: { art: "antwort" as const }, bei: p.f.id, gruppe: "briefe", wo: p.f.id,
    log: "Trag Othmars Briefe die Südstraße entlang: Heckenhof, Summweide, Schilfsee, Erlengrund, Kreuzstein, Lehmfurt ({n:briefe})." })),
  dialoge: {
    /* Othmar: Bürgermeister, besonnen, ordentlich – jeder Brief hat seinen Platz. */
    othmar: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Seit die Straße wieder offen ist, schreibt ganz Weidenhain. Und keiner trägt's.",
          "Sechs Briefe für die Orte an der Südstraße. Einer für Kielmund."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Post muss warten. Wie alles."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Rike hat geantwortet. Bodo auch, in Großbuchstaben. Danke."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Fehlt nur noch Kielmund. Jasper Kranich, im Küstenhaus."], antworten: ["hilfe", "tschuess"] },
        { wenn: LAEUFT, zeilen: ["Noch Briefe in der Tasche? Der Süden wartet."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich trage die Briefe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Hier. Heckenhof, Summweide, Schilfsee, Erlengrund, der Kreuzstein, Lehmfurt.",
          "Und dieser – mit dem Siegel – für Kielmund. Den zuletzt."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann bleiben sie auf dem Fass."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit Bedacht."] } }] },
      ],
    },
    /* Kranich: Kaufherr, höflich, berechnend – freundlicher, wenn Geld im Spiel ist. */
    kranich: {
      reden: [
        { wenn: { ...LAEUFT, alle: true, quest: { id: G1, phase: ["fertig"] } }, zeilen: ["Ah, Sie schon wieder. Diesmal mit Post statt mit Frachtbriefen?"], antworten: ["brief_kranich"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Post aus Weidenhain? Zu Fuß? Die Südstraße hat seit Wochen keiner heil hinter sich gebracht."], antworten: ["brief_kranich"] },
        { wenn: LAEUFT, zeilen: ["Sie haben noch andere Briefe in der Tasche. Erst die, dann ich. Ordnung, bitte."], antworten: ["tschuess"] },
        { zeilen: ["Küstenhaus Kranich. Womit kann ich dienen?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "brief_kranich", text: "Othmars Brief für das Küstenhaus geben.", folge: [
          { wenn: { quest: { id: G1, phase: ["fertig"] } }, f: { abschluss: true, zeilen: ["Kranich bricht das Siegel. „Othmar schickt neues Korn. Und schreibt, wer die Straße freigemacht hat.“",
            "Er lächelt. Diesmal echt. „Das Küstenhaus vergisst nicht. Weder Schulden noch Gefallen.“"] } },
          { f: { abschluss: true, zeilen: ["Kranich bricht das Siegel. „Othmar fragt nach seinem Getreidewagen. Den fragt er jede Woche.“",
            "„Sechzig Sack, nie angekommen. Wenn Sie auf der Südstraße etwas davon sehen – sagen Sie es Othmar.“", "„Für den Weg. Das Küstenhaus zahlt Boten.“"] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Geschäfte."] } }] },
      ],
    },
    ...Object.fromEntries(POST.map((p, i) => [p.f.id, {
      reden: [
        { wenn: { ...LAEUFT, offen: [IDS[i]] }, zeilen: [p.gruss], antworten: [IDS[i], "tschuess"] } as Rede,
        { zeilen: ["Schön, dich zu sehen."], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: IDS[i], text: `Othmars Brief ${p.ort} abgeben.`, folge: [{ f: { erledige: [IDS[i]], geben: [{ g: p.g, name: p.name }], zeilen: p.sagt } }] } as Option,
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Reise."] } }] } as Option,
      ],
    }])),
  },
  glueckwunsch: "Die Post ist angekommen, und das Küstenhaus vergisst keinen Boten.",
  belohnungText: "Belohnung: Geschick 300 XP, 100 Splitter · unterwegs: ein Brot, ein kleiner Heiltrank, ein gebratener Barsch, ein Eichenstamm, ein Seelenlicht, ein Kupferbarren",
  belohnung: { xp: { geschick: 300 }, splitter: 100 },
  punkte: 1,
};
