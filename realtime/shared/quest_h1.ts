/*
 * Riftmere – Quest H1 „Über den Pass“ (Phase 11, Hochlande, Einstieg), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, freigegeben 27.11., #161). Nach Block E (E4): Wigand Fels auf der Burg Grauwacht: Seit Wochen kommen keine Erzwagen mehr aus Steinhag.
 * QUER: Merit Stahl in Graufurt wartet auf das Erz für ihre Schmiede. Über die Brücke zur Furt (Wache Odo) nach Steinhag zur Bergvögtin Hilde Erzgrund;
 * am Hochpass die Bergtrolle vertreiben (Wächter Ansgar), auf der Hohen Alm Sennerin Afra Bescheid geben. Abgabe bei Hilde.
 * Lohn: Stärke und Defense je 1.500 XP, 500 Splitter, 1 Questpunkt; Wegstein-Ziel Steinhag (shared/wegstein.ts, STEINHAG_QUEST), die Läden in Steinhag
 * (Integration: laeden.ts „wenn“), Schalter erzwagen_steinhag (die Erzwagen fahren wieder, Reisende auf der Straße, #118).
 * Stellen und Figuren: shared/quest_h_orte.ts. Liste: doku/quests/h-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { H_QUESTS } from "./hochlande";
import { WIGAND, MERIT, ODO, HILDE, ANSGAR, AFRA, PASS_TROLLE, STEINHAG } from "./quest_h_orte";

export const H1 = H_QUESTS.h1;
const E4 = "grauwacht_grab_des_hauptmanns"; /* Wigand bietet vorher E4 an (figurQuest: die erste angebotene Quest spricht) */
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const BOTEN = ["ansgar", "afra"];
const HILFE = ["Die Brücke zur Furt, östlich der Burg. Odo hält dort Wache, er kennt den Weg.",
  "Drüben liegt Steinhag, die Bergstadt am See. Die Bergvögtin heißt Hilde Erzgrund. Frag sie, warum die Wagen nicht mehr kommen.",
  "Und geh vorher bei Merit in Graufurt vorbei. Sie wartet auf das Erz mehr als ich."];

export const QUEST_H1: QuestDef = {
  id: H1, titel: "Über den Pass", ort: "Grauwacht · Graufurt · Steinhag · Hochpass · Hohe Alm", start: "Sprich mit Wigand Fels auf der Burg Grauwacht.",
  logNeu: "Wigand Fels steht auf der Mauer der Burg und schaut nach Osten, wo die Straße zur Furt hinunterführt.",
  logAngeboten: "Wigand Fels will wissen, warum aus Steinhag keine Erzwagen mehr kommen.",
  logAbgabe: "Die Passwacht und die Alm wissen Bescheid. Geh zurück zu Hilde Erzgrund in Steinhag.",
  logFertig: "Die Straße über die Furt ist wieder sicher genug für die Erzwagen. Steinhag hat Grauwacht nicht vergessen – und Grauwacht nicht Steinhag.",
  geber: "wigand", abgabe: "bergvoegtin",
  figuren: [WIGAND, MERIT, ODO, HILDE, ANSGAR, AFRA],
  voraussetzungen: [
    { text: "„Das Grab des Grauen Hauptmanns“ abgeschlossen", wenn: { quest: { id: E4, phase: ["fertig"] } } },
    { text: "Heldenlevel 45", wenn: { heldenlevel: 45 } },
  ],
  schritte: [
    { id: "merit", text: "Merit Stahl in Graufurt nach dem Erz fragen", ereignis: { art: "antwort" }, bei: "merit",
      log: "Wigand sagt, Merit Stahl in Graufurt warte auf das Erz aus Steinhag mehr als er. Frag sie, was sie braucht." },
    { id: "furtwache", text: "Mit Odo an der Brücke zur Furt reden", ereignis: { art: "antwort" }, bei: "furtwache",
      log: "Östlich der Burg führt die Brücke zur Furt in die Hochlande. Wache Odo steht dort und kennt den Weg." },
    { id: "bergvoegtin", text: "Die Bergvögtin in Steinhag sprechen", ereignis: { art: "antwort" }, nach: ["furtwache"], bei: "bergvoegtin", wo: STEINHAG,
      log: "Hinter der Furt liegt Steinhag, die Bergstadt am See. Frag die Bergvögtin Hilde Erzgrund, warum die Erzwagen nicht mehr fahren." },
    { id: "trolle", text: "Zwei Bergtrolle am Hochpass vertreiben", ereignis: { art: "erlegen", typ: "bergtroll" }, anzahl: 2, nach: ["bergvoegtin"], wo: PASS_TROLLE,
      log: "Die Trolle stehen bis an die Passwacht heran. Besieg zwei Bergtrolle am Hochpass ({n:trolle}) – sie sind langsam, aber sie schlagen hart." },
    { id: "ansgar", text: "Der Passwacht Bescheid geben", ereignis: { art: "antwort" }, nach: ["trolle"], bei: "ansgar", gruppe: "boten",
      log: "Sag Wächter Ansgar an der Passwacht, dass Steinhag die Wagen wieder schicken will und der Pass frei ist." },
    { id: "afra", text: "Sennerin Afra auf der Hohen Alm Bescheid geben", ereignis: { art: "antwort" }, nach: ["bergvoegtin"], bei: "afra", gruppe: "boten",
      log: "Die Alm liegt südöstlich von Steinhag. Sag Sennerin Afra, dass die Wagen wieder fahren – sie schickt ihren Käse mit." },
  ],
  /* Wigand: Hauptmann, knapp, militärisch, seit E3 wieder mit Leuten. Merit: Hauptfrau, sachlich, rechnet in Wagen und Klingen.
     Odo: Wache, gutmütig, gelangweilt. Hilde: Bergvögtin, stolz, müde, spricht wie jemand, der Leute im Berg verloren hat.
     Ansgar: Passwächter, schweigsam, trockener Humor. Afra: Sennerin, herzlich, laut, Mundart der Alm („Pfiat di“). */
  dialoge: {
    wigand: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Die Burg ist wieder besetzt. Aber eine Burg ohne Eisen ist ein Haus mit Mauern.",
          "Früher kamen jede Woche Erzwagen aus Steinhag über die Furt. Seit einem Monat keiner. Kein Wagen, kein Bote, nichts."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Halt die Augen offen. Hinter der Furt beginnen die Berge."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die ersten Wagen sind durch. Sterneisen, so schwer, dass die Achsen knarren. Gute Arbeit."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["bergvoegtin"] }, zeilen: ["Trolle? Am Pass? Dann ist es schlimmer, als ich dachte. Hilf ihnen. Grauwacht braucht dieses Erz."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Über die Furt nach Steinhag. Frag die Bergvögtin."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gehe nach Steinhag. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Die Brücke zur Furt liegt östlich der Burg, Odo steht dort Wache.",
          "Drüben liegt Steinhag. Frag die Bergvögtin, was los ist. Und wenn du kannst: mach den Weg frei.", "Ach – Merit in Graufurt wartet auch auf das Erz. Sag ihr, dass du gehst. Sie wird dir etwas mitgeben wollen."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Das Eisen läuft uns nicht weg. Die Trolle vielleicht auch nicht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["merit"] }, zeilen: ["Du gehst nach Steinhag? Endlich jemand.", "Meine Esse steht kalt. Ohne Sterneisen schmiede ich Hufeisen, keine Klingen."], antworten: ["erz_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["merit"] }, zeilen: ["Sag der Vögtin: Graufurt zahlt. Für jeden Wagen."], antworten: ["tschuess"] },
        { zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "erz_fragen", text: "Was soll ich der Bergvögtin sagen?", folge: [{ f: { erledige: ["merit"], zeilen: ["Dass Graufurt zahlt. In Silber, nicht in Versprechen.",
          "Und dass ich drei Wagen Sterneisen will, bevor der Winter kommt. Hilde Erzgrund kennt mich. Wir haben uns einmal um einen Wagen gestritten. Sie hat gewonnen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf, sagen sie da oben. Also: Glück auf."] } }] },
      ],
    },
    furtwache: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["furtwache"] }, zeilen: ["Die Brücke trägt. Drüben beginnen die Hochlande – und die Trolle.", "Willst du rüber?"], antworten: ["weg_fragen", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Heute früh sind zwei Wagen durch! Der Kutscher hat mir einen Apfel geschenkt. Aus Steinhag. Da oben wachsen keine Äpfel."], antworten: ["tschuess"] },
        { zeilen: ["Früher kamen hier jeden Tag Erzwagen aus Steinhag. Seit Wochen keiner mehr."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "weg_fragen", text: "Wigand schickt mich. Wie komme ich nach Steinhag?", folge: [{ f: { erledige: ["furtwache"], zeilen: ["Über die Brücke, dann der Straße nach, immer bergauf. Die Stadt liegt an einem See, du siehst sie von weitem.",
          "Der letzte Kutscher, der runterkam, hat gesagt: Trolle am Pass. Dann kam keiner mehr. Pass auf dich auf."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Pass auf dich auf."] } }] },
      ],
    },
    bergvoegtin: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["bergvoegtin"] }, zeilen: ["Ein Fremder aus dem Tal. Von Grauwacht? …Dann lebt die Burg noch.", "Ihr wollt wissen, wo die Wagen bleiben."], antworten: ["wagen_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Brun hat mir schon einen Läufer geschickt. Der Pass ist frei, und Afra schickt ihren Käse mit.", "Setz dich. Du hast dir etwas verdient."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, offen: ["trolle"] }, zeilen: ["Die Trolle am Hochpass. Zwei sind es mindestens, die Ansgar jeden Tag sieht."], antworten: ["hilfe_hilde", "tschuess"] },
        { wenn: LAEUFT, zeilen: ["Ansgar an der Passwacht, Afra auf der Alm. Erst wenn beide Bescheid wissen, schicke ich die Wagen."], antworten: ["hilfe_hilde", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Wagen fahren. Steinhag hat wieder Silber und Grauwacht wieder Eisen.", "Aber der Berg … der Berg ist unruhig. Das ist eine andere Geschichte."], antworten: ["tschuess"] },
        { zeilen: ["Willkommen in Steinhag. Wir haben Erz, Holz und Fisch – und seit Wochen zu viele Trolle."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wagen_fragen", text: "Warum kommen keine Erzwagen mehr über die Furt?", folge: [{ f: { erledige: ["bergvoegtin"], zeilen: ["Weil kein Kutscher mehr fahren will. Die Trolle kommen von den Hängen herunter, bis an den Pass.",
          "Die Passwacht hält kaum noch. Drei Leute, und der Pass ist breit.", "Vertreib die Trolle am Hochpass. Dann sag Ansgar Bescheid – und Afra auf der Alm, sie schickt ihren Käse immer mit den Wagen.",
          "Merit Stahl wartet auf Sterneisen? Sie hat immer gewartet. Sie bekommt es, wenn der Pass frei ist."] } }] },
        { id: "hilfe_hilde", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: ["Zwei Bergtrolle am Hochpass, nördlich der Stadt. Dann Ansgar an der Passwacht. Dann Afra auf der Hohen Alm, südöstlich.",
          "Wenn beide Bescheid wissen, komm zurück."] } }] },
        { id: "fertig", text: "Der Pass ist frei. Ansgar und Afra wissen Bescheid.", folge: [{ f: { abschluss: true, zeilen: ["Hilde Erzgrund nickt langsam. Dann ruft sie einen Jungen herein und schickt ihn zu den Kutschern.",
          "Morgen fahren die ersten drei Wagen. Einer nach Graufurt, für Merit – damit sie aufhört, mir Briefe zu schreiben.",
          "Der Wegstein am Markt kennt dich jetzt. Und die Händler machen wieder auf. Glück auf."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
    ansgar: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["trolle"], offen: ["ansgar"] }, zeilen: ["Die zwei Großen sind weg? …Hm. Das hab ich von der Mauer aus gesehen.", "Was willst du?"], antworten: ["pass_frei", "tschuess"] },
        { wenn: { ...LAEUFT, offen: ["trolle"] }, zeilen: ["Drei von uns, und der Pass ist breit. Die Trolle wissen das.", "Wenn du helfen willst: Da vorn stehen zwei. Wir zählen sie jeden Morgen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["ansgar"] }, zeilen: ["Sag Hilde, die Schranke geht wieder hoch, wenn ein Wagen kommt."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Gestern drei Wagen. Einer hat geknarrt wie ein alter Mann. Aber er ist durch."], antworten: ["tschuess"] },
        { zeilen: ["Drei von uns, und der Pass ist breit. Die Trolle wissen das."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "pass_frei", text: "Hilde schickt die Wagen wieder, wenn der Pass frei ist.", folge: [{ f: { erledige: ["ansgar"], zeilen: ["Ansgar sieht den Pass hinunter. Lange.",
          "Dann soll sie sie schicken. Wir halten die Schranke offen. Und wenn wieder Trolle kommen, hörst du von uns."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mögen die Steine stillhalten."] } }] },
      ],
    },
    afra: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["bergvoegtin"], offen: ["afra"] }, zeilen: ["Grüß dich! Du kommst von unten? Aus dem Tal?", "Bringst du gute Nachrichten oder nur Hunger?"], antworten: ["wagen_sagen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["afra"] }, zeilen: ["Zwei Laibe für Hilde, einen für Merit in Graufurt. Ich pack sie ein, wenn die Wagen kommen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Mein Käse fährt wieder ins Tal! Und meine Ziegen … na, das ist eine andere Geschichte."], antworten: ["tschuess"] },
        { zeilen: ["Grüß dich! Frische Milch, Käse im Rad – aber erst, wenn die Ziegen wieder da sind."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wagen_sagen", text: "Die Erzwagen fahren bald wieder. Hilde lässt ausrichten: Käse mitschicken.", folge: [{ f: { erledige: ["afra"], zeilen: ["Afra klatscht in die Hände. Die Schafe am Pferch heben die Köpfe.",
          "Endlich! Drei Räder stehen im Keller und werden alt. Sag Hilde: Afra schickt, was sie hat."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Pfiat di!"] } }] },
      ],
    },
  },
  schalter: { erzwagen_steinhag: FERTIG },
  glueckwunsch: "Die Wagen fahren. Glück auf, Wanderer – Steinhag vergisst das nicht.",
  belohnungText: "Belohnung: Stärke 1.500, Defense 1.500 XP, 500 Splitter · danach: Wegstein-Ziel Steinhag, die Läden in Steinhag sind offen, die Erzwagen fahren wieder",
  belohnung: { xp: { staerke: 1500, defense: 1500 }, splitter: 500 },
  punkte: 1,
};
