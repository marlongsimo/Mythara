/*
 * Riftmere – Quest „Miras Rezeptbuch“ (Phase 5c, Einführung in Kräuterkunde), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-5.md. Mira Kräuterlieb (Trankladen „Schluck auf!“, Waldmark) hat ihr altes Rezeptheft an Mutter Hedda verliehen.
 * 5 Wegerich sammeln, einen Kleinen Heiltrank am Kessel im Kräuterhaus brauen, nach Rabenmoor zu Hedda (sie prüft dich: welches der drei Kräuter ist das Moorglöckchen?),
 * das Heft zurück zu Mira. Lohn: Kräuterkunde-XP, 3 Heiltränke, 80 Splitter, 1 Questpunkt; danach kauft Mira deine Tränke an (Schalter mira_ankauf).
 * Das Heft ist Erzählung, kein persönliches Rezeptbuch – Rezepte bleiben fest je Level (Kanon 26.11.).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 5c (Kräuterkunde: Sichel, Sammeln, Kessel, Rezept kleiner_heiltrank). Mira ist heute Händlerin
 * (shared/laeden.ts) – als Questfigur braucht sie Laden und Gespräch zugleich. Liste: doku/quests/c-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";

export const MIRA = "waldmark_miras_rezeptbuch";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Mira am Trankladen (laeden.ts traenke), Wegerich vor der Waldmark (welt/kraeuter_standorte.json), Kessel im Kräuterhaus, Hedda vor ihrer Hütte (rabenmoor 17,4 | 21,4) */
const MIRA_XY: [number, number] = [6456, 6441], WEGERICH: [number, number] = [6453.5, 6437.5], KESSEL: [number, number] = [6420.9, 6438.6], HEDDA: [number, number] = [6289.4, 6677.4];
const HILFE = ["Fünf Wegerich. Wächst überall vor der Waldmark, die breiten Blätter am Wegrand. Mit der Sichel, nicht mit den Fingern.",
  "Dann an den Kessel im Kräuterhaus, ein Kleiner Heiltrank. Damit Hedda sieht, dass du weißt, was du tust.",
  "Und dann nach Rabenmoor, zu Mutter Hedda auf ihre Insel. Sie hat mein Heft. Sie wird dich prüfen – sie prüft jeden."];

export const QUEST_MIRA: QuestDef = {
  id: MIRA, titel: "Miras Rezeptbuch", ort: "Einführung in Kräuterkunde · Waldmark · Rabenmoor", start: "Sprich mit Mira Kräuterlieb am Trankladen „Schluck auf!“ in der Waldmark.",
  logNeu: "Mira Kräuterlieb am Trankladen der Waldmark blättert in losen Zetteln und seufzt. Etwas fehlt ihr.",
  logAngeboten: "Mira Kräuterlieb am Trankladen der Waldmark vermisst ihr altes Rezeptheft.",
  logAbgabe: "Du hast Miras Rezeptheft. Bring es ihr zurück an den Trankladen in der Waldmark.",
  logFertig: "Mira hat ihr Rezeptheft zurück. Am Kessel im Kräuterhaus braust du Tränke, und Mira kauft dir welche ab – zum halben Ladenpreis.",
  geber: "mira",
  figuren: [
    { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: MIRA_XY[0], y: MIRA_XY[1], blick: [0, -1] },
    { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: HEDDA[0], y: HEDDA[1], blick: [1, 0] },
  ],
  voraussetzungen: [{ text: "„Die gesperrte Straße“ abgeschlossen (Rabenmoor)", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } }],
  schritte: [
    { id: "wegerich", text: "Fünf Wegerich sammeln", ereignis: { art: "sammeln", ziel: "wegerich" }, anzahl: 5, wo: WEGERICH,
      log: "Sammel vor der Waldmark fünf Wegerich – mit einer Sichel ({n:wegerich})." },
    { id: "trank", text: "Einen Kleinen Heiltrank brauen", ereignis: { art: "herstellen", rezept: "brauen_kleiner_heiltrank" }, nach: ["wegerich"], wo: KESSEL,
      log: "Brau am Kessel im Kräuterhaus der Waldmark einen Kleinen Heiltrank – Wegerich und ein leeres Fläschchen." },
    { id: "hedda", text: "Mutter Hedda in Rabenmoor um das Heft bitten", ereignis: { art: "antwort" }, nach: ["trank"], bei: "hedda",
      log: "Geh nach Rabenmoor zu Mutter Hedda auf ihre Insel und bitte sie um Miras Rezeptheft." },
  ],
  /* Mira: munter, plappert, verliert ständig etwas, kennt jedes Kraut beim Vornamen. Hedda: alt, spöttisch, prüft jeden, redet Leute mit „Kind“ an. */
  dialoge: {
    mira: {
      reden: [
        { wenn: NEU, zeilen: ["Wo hab ich … nein. Da auch nicht.", "Mein Rezeptheft! Das alte, mit den Flecken. Ich hab's Mutter Hedda geliehen, im Frühjahr, und seitdem braue ich aus dem Kopf. Mein Kopf ist nicht mehr der jüngste."],
          antworten: ["annehmen", "hedda_wer", "spaeter"] },
        { wenn: FERTIG, zeilen: ["Mein Heft! Ich les jeden Abend drin, als wär's ein Roman.", "Und wenn du Tränke übrig hast – bring sie mir. Ich zahl die Hälfte vom Ladenpreis. Ehrlich."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "rezeptheft" }, zeilen: ["Ist das …? Die Flecken! Das ist es!"], antworten: ["abgeben"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Hedda hat's dir gegeben? Und … wo ist es jetzt?", "Nicht verloren. Bitte sag nicht verloren."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["trank"] }, zeilen: ["Ein Kleiner Heiltrank! Rot wie ein Abendhimmel. Ja, so sieht er aus.", "Jetzt nach Rabenmoor. Hedda wohnt auf der letzten trockenen Insel. Sei höflich. Sie mag's nicht, aber sie merkt's."],
          antworten: ["hilfe", "hedda_wer", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wegerich"] }, zeilen: ["Fünf Wegerich, schön breit. Gute Wahl.", "Jetzt an den Kessel im Kräuterhaus. Ein Blatt, ein Fläschchen, ein bisschen Geduld."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Wegerich! Wächst überall, sieht keiner. Schau an den Wegrändern vor der Waldmark."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole dein Heft. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Oh, du bist ein Schatz.",
          "Aber Hedda gibt nichts her, ohne zu prüfen, wer fragt. Zeig ihr, dass du mit Kräutern umgehen kannst: Sammel fünf Wegerich, brau einen Kleinen Heiltrank im Kräuterhaus.",
          "Und dann ab nach Rabenmoor. Eine Sichel hat der Handwerker vor der Schmiede."] } }] },
        { id: "hedda_wer", text: "Wer ist Mutter Hedda?", folge: [{ f: { weiter: true, zeilen: ["Die beste Kräuterfrau zwischen hier und dem Meer. Und die mürrischste.",
          "Sie wohnt draußen in Rabenmoor, auf der letzten trockenen Insel. Was ich kann, hab ich von ihr. Das sag ich ihr aber nicht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Schon gut. Ich such weiter in meinem Kopf. Irgendwo da drin muss es ja sein."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "abgeben", text: "Das Rezeptheft zurückgeben.", wenn: { hat: "rezeptheft" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "rezeptheft" }],
          zeilen: ["Mira drückt das Heft an sich und blättert sofort darin herum.", "Hier, drei Heiltränke, für den Weg. Und – sie hat was reingeschrieben! „Zu viel Ringelblume, Kind.“ Typisch.",
            "Wenn du Tränke übrig hast: Ich kauf sie dir ab. Die Hälfte vom Ladenpreis."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bleib gesund! Und wenn nicht – du weißt, wo du mich findest."] } }] },
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["trank"], offen: ["hedda"] }, zeilen: ["Mira schickt dich. Ich riech's. Sie benutzt zu viel Ringelblume.",
          "Ihr Heft? Hm. Erst sehen wir, ob du's verdienst. Hier liegen drei Kräuter. Welches ist das Moorglöckchen?"], antworten: ["kraut_blau", "kraut_gelb", "kraut_weiss", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hedda"] }, zeilen: ["Bring Mira ihr Heft. Und sag ihr: weniger Ringelblume."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Du kommst von Mira? Dann zeig mir erst, dass du einen Trank brauen kannst. Mit leeren Händen redet man nicht über Rezepte."], antworten: ["tschuess"] },
        { zeilen: ["Na, Kind? Krank oder neugierig? Beides kostet."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "kraut_blau", text: "Das kleine, mit den hängenden blauen Glocken.", folge: [{ f: { erledige: ["hedda"], geben: [{ g: "rezeptheft", name: "Miras Rezeptheft" }],
          zeilen: ["Hedda nickt, ganz knapp. Das ist bei ihr ein Lob.", "Moorglöckchen. Läutet, wenn's regnet. Wächst nur hier im Moor, und nur da, wo's nass ist.",
            "Hier, Miras Heft. Sie hat's mit Honig vollgekleckert. Bring's ihr, bevor ich's noch verbessere."] } }] },
        { id: "kraut_gelb", text: "Das gelbe, mit den runden Blüten.", folge: [{ f: { weiter: true, zeilen: ["Ringelblume. Wächst in jedem Bauerngarten. Das hast du doch schon mal gesehen, Kind.", "Noch mal."] } }] },
        { id: "kraut_weiss", text: "Das mit den breiten Blättern.", folge: [{ f: { weiter: true, zeilen: ["Wegerich. Den hast du doch selbst gepflückt! Wo hast du deine Augen?", "Noch mal."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
  },
  schalter: { mira_ankauf: FERTIG },
  glueckwunsch: "Mein Heft! Mit allen Flecken! Du bist ein Schatz, weißt du das?",
  belohnungText: "Belohnung: Kräuterkunde-XP, 3 Heiltränke, 80 Splitter · danach: Mira kauft deine Tränke an (halber Ladenpreis)",
  belohnung: { berufe: { kraeuterkunde: 400 }, splitter: 80, gegenstaende: [{ g: "heiltrank", n: 3 }] },
  punkte: 1,
};
