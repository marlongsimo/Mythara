/*
 * Riftmere – Quer-Quest „Die Karte des Boten“ (Phase 9), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-9.md (neuer Grundsatz: Quests über Regionsgrenzen). Startet bei Ysolde (Geist auf dem Grünen Turm, D2): „Der Bote ist nie in Grauwacht angekommen.“
 * Fünf Stücke der Karte, in beliebiger Reihenfolge – wer weiter ist, sammelt schneller:
 *   1 Waldmark – Bürgermeister Hagan Voss lässt dich ins Archiv hinter dem Ratssaal, wenn du sein Rätsel löst (Gebiet rathaus_archiv, #74)
 *   2 Rabenmoor – Mutter Hedda (sie gibt es gegen eine schwache Steinhaut, Kräuterkunde 30)
 *   3 Graufurt – Merit Stahl verwahrt es im Bergfried
 *   4 Grauwacht – im Grab des Grauen Hauptmanns (erst nach E4)
 *   5 Glutsande – in der Kammer der Sandmutter (erst nach F3)
 * Jedes Stück nennt das nächste. Abgabe bei Ysolde. Lohn: die Reisekarte (gebunden; zeigt alle Wegstein-Ziele, einmal am Tag ein Wegstein-Sprung ohne Ladung),
 * je 6.000 XP Stärke, Geschick, Defense, Fernkampf, Magie, 4.000 LP, 3.000 Splitter, 4 Questpunkte. Haken: Die Karte zeigt die angrenzenden Regionen – die Smaragdküste mit Kielmund südlich von Weidenhain und die Hochlande hinter der Furt bei Grauwacht.
 * (Entscheidung des Nutzers 26.11.: Die Karte wächst in die Breite, den Quests folgend; die Splitterinsel ist kein Haken.)
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 9 (Reisekarte als Gegenstand mit täglichem Sprung, Kartenstücke, Steinhaut-Rezept aus 5c)
 * und auf „Figur in mehreren Quests“ (Ysolde, Hagan, Hedda, Merit). Stellen: shared/quest_f_orte.ts. Liste: doku/quests/f-bausteine.md.
 */
import type { QuestDef, Bed, Option } from "./questbau";
import { D2 } from "./quest_d2";
import { E4 } from "./quest_e4";
import { F3 } from "./quest_f3";
import { YSOLDE, HAGAN, ARCHIV, HEDDA, MERIT, SARKOPHAG, TEMPEL } from "./quest_f_orte";

export const KARTE = "festland_karte_des_boten";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const STUECKE = ["stueck_1", "stueck_2", "stueck_3", "stueck_4", "stueck_5"];
const ALLE_STUECKE = STUECKE.map((_, i) => ({ g: "kartenstueck_" + (i + 1) }));
const gib = (i: number) => [{ g: "kartenstueck_" + i, name: "ein Stück der Karte des Boten (" + i + "/5)" }];
const HILFE = ["Fünf Stücke. Der Bote war vorsichtig: Wo er rastete, ließ er eins zurück, damit nie einer alles hat.",
  "In der Waldmark beim Bürgermeister. Im Rabenmoor bei der Kräuterfrau. In Graufurt bei der Hauptfrau. In Grauwacht, im Grab des letzten Hauptmanns.",
  "Und eins … eins ging mit ihm nach Süden, in den Sand. Dorthin, wo etwas Großes unter dem Tempel schläft."];
const tschuess: Option = { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege."] } }] };

export const QUEST_KARTE: QuestDef = {
  id: KARTE, titel: "Die Karte des Boten", ort: "Quer über das Festland · Waldmark · Rabenmoor · Graufurt · Grauwacht · Glutsande",
  start: "Sprich mit Ysolde auf dem Dach des Turms mit dem grünen Licht am Ostufer.",
  logNeu: "Auf dem Dach des Turms am Ostufer flackert Ysolde noch manchmal auf, wenn jemand kommt. Sie wartet auf einen Boten, der nie ankam.",
  logAngeboten: "Ysolde auf dem Turm am Ostufer hat dir vom Boten der Wacht erzählt.",
  logAbgabe: "Alle fünf Stücke der Karte sind beisammen. Bring sie Ysolde auf den Turm am Ostufer.",
  logFertig: "Die Karte des Boten ist wieder ganz. Sie zeigt alle Wegsteine des Grenzlands – und Wege, die weiterführen: nach Süden zur Smaragdküste und nach Kielmund, nach Norden über die Furt bei Grauwacht in die Hochlande.",
  geber: "ysolde",
  figuren: [
    { id: "ysolde", name: "Ysolde", modell: "npc.ysolde", x: YSOLDE[0], y: YSOLDE[1], blick: [-1, 0] },
    { id: "hagan", name: "Hagan Voss", modell: "npc.buergermeister_waldmark", x: HAGAN[0], y: HAGAN[1], blick: [0, 1], wandert: "npc.buergermeister_waldmark", weit: 9 },
    { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: HEDDA[0], y: HEDDA[1], blick: [1, 0] },
    { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: MERIT[0], y: MERIT[1], blick: [0, 1] },
  ],
  voraussetzungen: [{ text: "„Das grüne Licht“ abgeschlossen", wenn: { quest: { id: D2, phase: ["fertig"] } } }],
  schritte: [
    { id: "archiv", text: "Hagan Voss um das Archiv bitten", ereignis: { art: "antwort" }, bei: "hagan", wo: HAGAN,
      log: "Bürgermeister Hagan Voss in der Waldmark hütet das Archiv hinter dem Ratssaal. Frag ihn, ob du hinein darfst." },
    { id: "stueck_1", text: "Das Stück der Karte in der Waldmark", ereignis: { art: "objekt", id: "karte_archiv" }, nach: ["archiv"], gruppe: "karte", wo: ARCHIV,
      log: "Sammle die fünf Stücke der Karte des Boten ({n:karte}): in der Waldmark, im Rabenmoor, in Graufurt, in Grauwacht und in den Glutsanden." },
    { id: "stueck_2", text: "Das Stück der Karte im Rabenmoor", ereignis: { art: "antwort" }, bei: "hedda", gruppe: "karte", wo: HEDDA,
      log: "Sammle die fünf Stücke der Karte des Boten ({n:karte}): in der Waldmark, im Rabenmoor, in Graufurt, in Grauwacht und in den Glutsanden." },
    { id: "stueck_3", text: "Das Stück der Karte in Graufurt", ereignis: { art: "antwort" }, bei: "merit", gruppe: "karte", wo: MERIT,
      log: "Sammle die fünf Stücke der Karte des Boten ({n:karte}): in der Waldmark, im Rabenmoor, in Graufurt, in Grauwacht und in den Glutsanden." },
    { id: "stueck_4", text: "Das Stück der Karte in Grauwacht", ereignis: { art: "objekt", id: "karte_sarkophag" }, gruppe: "karte", wo: SARKOPHAG,
      log: "Sammle die fünf Stücke der Karte des Boten ({n:karte}): in der Waldmark, im Rabenmoor, in Graufurt, in Grauwacht und in den Glutsanden." },
    { id: "stueck_5", text: "Das Stück der Karte in den Glutsanden", ereignis: { art: "objekt", id: "karte_tempel" }, gruppe: "karte", wo: TEMPEL.kammer,
      log: "Sammle die fünf Stücke der Karte des Boten ({n:karte}): in der Waldmark, im Rabenmoor, in Graufurt, in Grauwacht und in den Glutsanden." },
  ],
  objekte: [
    { id: "karte_archiv", name: "Archivregal", x: ARCHIV[0], y: ARCHIV[1], modell: "stelle", tat: "untersuchen", tatText: "Das Regal durchsuchen", weit: 2.5, geben: [{ g: "kartenstueck_1" }],
      text: "Zwischen Steuerlisten und Grenzbriefen steckt ein Pergament, das nicht dazugehört. Am Rand, in zierlicher Schrift: „Weiter nach Rabenmoor. Die Kräuterfrau weiß, wo man trocken schläft.“ ({n:karte})",
      schon: "Das Regal riecht nach Staub und alten Steuern.", sonst: [{ wenn: NEU, text: "Ein Regal voller Akten." }, { wenn: FERTIG, text: "Ein Regal voller Akten." },
        { wenn: { offen: ["archiv"] }, text: "Das Archiv des Bürgermeisters. Ohne seine Erlaubnis rührst du hier nichts an." }] },
    { id: "karte_sarkophag", name: "Sarkophag des Hauptmanns", x: SARKOPHAG[0], y: SARKOPHAG[1], modell: "stelle", tat: "untersuchen", tatText: "Den Sarkophag durchsuchen", weit: 2.5,
      braucht: { wenn: { quest: { id: E4, phase: ["fertig"] } }, text: "Der Sarkophag des Grauen Hauptmanns. Solange er nicht ruht, rührst du hier nichts an. (Erst nach „Das Grab des Grauen Hauptmanns“.)" },
      geben: [{ g: "kartenstueck_4" }],
      text: "Unter der Platte, in der Hand des Hauptmanns, steckt ein gefaltetes Pergament. Ein Stück Karte – Grauwacht ist darauf eingezeichnet, mit einem Pfeil nach Süden, in den Sand ({n:karte}).",
      schon: "Der Sarkophag ist leer bis auf Staub.", sonst: [{ wenn: NEU, text: "Ein schwerer Sarkophag aus grauem Stein." }, { wenn: FERTIG, text: "Der Sarkophag ist leer bis auf Staub." }] },
    { id: "karte_tempel", name: "Sandverwehte Nische", x: TEMPEL.kartenstueck[0], y: TEMPEL.kartenstueck[1], modell: "stelle", tat: "untersuchen", tatText: "Die Nische durchsuchen", weit: 2.5,
      braucht: { wenn: { quest: { id: F3, phase: ["fertig"] } }, text: "Eine Nische, halb voller Sand. Solange die Sandmutter hier lebt, gräbst du nicht. (Erst nach „Der versandete Tempel“.)" },
      geben: [{ g: "kartenstueck_5" }],
      text: "Im Sand ein Lederbeutel, die Naht von Hand geflickt. Darin: ein Stück Karte und ein Abzeichen der Wacht. Der Bote ist bis hierher gekommen. Nicht weiter ({n:karte}).",
      schon: "Die Nische ist leer.", sonst: [{ wenn: NEU, text: "Eine Nische, halb voller Sand." }, { wenn: FERTIG, text: "Die Nische ist leer." }] },
  ],
  /* Ysolde: Geist, langsam, spricht in der Zeit von damals. Hagan: Bürgermeister, gründlich, liebt Ordnung und Akten. Hedda: spöttisch, „Kind“. Merit: förmlich, Wacht. */
  dialoge: {
    ysolde: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Du bist es. Die Glocke … hat sie geläutet?", "Dann gibt es noch eine Frage, die ich nicht loslasse. Der Bote. Er ging mit der Karte nach Grauwacht, als der Himmel riss. Er ist nie dort angekommen."],
          antworten: ["annehmen", "karte_was", "spaeter"] },
        { wenn: NEU, zeilen: ["Eine Gestalt flackert über dem kalten Feuer. Sie sieht nach Norden."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Karte ist ganz. Und der Bote … ruht, wo er gefallen ist. Danke."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ich sehe es an dir. Alle fünf.", "Leg sie aneinander. Hier, auf den Stein."], antworten: ["zusammenlegen"] },
        { wenn: LAEUFT, zeilen: ["Hast du weitere Stücke gefunden? Jedes zeigt den Weg zum nächsten. Er war ein ordentlicher Bote."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich suche die Karte. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Er war vorsichtig. Wo er rastete, ließ er ein Stück zurück. Fünf Stücke, fünf Orte.",
          "Fang an, wo du willst. Jedes Stück nennt das nächste."] } }] },
        { id: "karte_was", text: "Was zeigt die Karte?", folge: [{ f: { weiter: true, zeilen: ["Alle Wegsteine der Wacht. Und die Orte, an denen wir die Siegel hielten. Wer sie hat, findet überall heim.",
          "Und vielleicht … einen Ort, den nur die Boten kannten."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Ich habe Zeit. Nur Zeit."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "zusammenlegen", text: "Die fünf Stücke zusammenlegen.", folge: [{ f: { abschluss: true, nehmen: ALLE_STUECKE,
          zeilen: ["Du legst die Stücke aneinander. Die Risse schließen sich – nicht ganz, aber die Linien laufen ineinander. Wegsteine, Siegelorte, Straßen, die es nicht mehr gibt.",
            "Ysolde berührt die Karte. Für einen Augenblick leuchtet sie grün.", "Sie gehört dir. Sie zeigt dir jeden Wegstein, und einmal am Tag trägt sie dich hin, auch wenn dein Stein leer ist.",
            "Und hier – die Linien hören nicht auf. Südlich von Weidenhain ein Weg zur Küste, „Kielmund“ steht daneben. Und hinter der Furt bei Grauwacht: die Hochlande.", "Der Bote kannte Wege, die wir vergessen haben. Geh sie, wenn du kannst."] } }] },
        { id: "tschuess", text: "Gehen.", folge: [{ f: { zeilen: ["…"] } }] },
      ],
    },
    hagan: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["archiv"] }, zeilen: ["Eine Karte? Von einem Boten der Wacht? …Im Archiv liegt allerhand. Mein Vorgänger hat alles aufgehoben, was nicht weglief.",
          "Aber ich gebe Akten nicht jedem. Sag mir: Was steht über dem Tor jeder Wachtburg?"], antworten: ["raetsel_turm", "raetsel_rabe", "raetsel_linde", tschuess.id] },
        { wenn: { erledigt: ["archiv"] }, zeilen: ["Das Archiv ist hinter dem Ratssaal, die Tür links. Fass nichts an, was du nicht brauchst. Ich hoffe, die Karte führt dich weit. Und bring sie mir irgendwann zum Abschreiben."], antworten: [tschuess.id] },
        { zeilen: ["Das Rathaus der Waldmark. Was kann ich für dich tun? Kurz, bitte. Ich habe Akten."], antworten: [tschuess.id] },
      ],
      optionen: [
        { id: "raetsel_turm", text: "Ein Turm über drei Wellen.", folge: [{ f: { erledige: ["archiv"],
          zeilen: ["Richtig. Das wissen nur noch wenige.", "Gut. Das Archiv ist oben, hinter dem Ratssaal. Such selbst – ich hab keine Zeit für Boten, die schon dreißig Jahre tot sind."] } }] },
        { id: "raetsel_rabe", text: "Ein Rabe über einem Steinkreis.", folge: [{ f: { weiter: true, zeilen: ["Das ist das Zeichen der Rabenpriester. Wenn du das über einem Wachttor siehst, lauf."] } }] },
        { id: "raetsel_linde", text: "Eine Linde mit sieben Wurzeln.", folge: [{ f: { weiter: true, zeilen: ["Hübsch. Das ist aber das Wappen von Weidenhain. Noch einmal."] } }] },
        tschuess,
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["stueck_2"] }, zeilen: ["Ein Stück Karte? Das alte Ding mit den Linien? Darauf trockne ich seit Jahren meine Moorglöckchen.",
          "Kriegst du. Aber nicht umsonst, Kind. Brau mir eine Steinhaut. Meine Knie knirschen."], antworten: ["steinhaut", tschuess.id] },
        { wenn: { erledigt: ["stueck_2"] }, zeilen: ["Meine Knie danken dir. Die Moorglöckchen weniger."], antworten: [tschuess.id] },
        { zeilen: ["Na, Kind? Krank oder neugierig? Beides kostet."], antworten: [tschuess.id] },
      ],
      optionen: [
        { id: "steinhaut", text: "Eine schwache Steinhaut geben.", wenn: { hat: "steinhaut_schwach" }, folge: [{ f: { erledige: ["stueck_2"], nehmen: [{ g: "steinhaut_schwach" }], geben: gib(2),
          zeilen: ["Hedda trinkt, verzieht das Gesicht und klopft auf ihr Knie. „Hm. Geht.“", "Hier. Es riecht nach Moor, aber es ist noch lesbar. Da steht: „Graufurt. Die Hauptfrau hält, was man ihr gibt.“"] } }] },
        tschuess,
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["stueck_3"] }, zeilen: ["Ein Kartenstück? …Ja. Es liegt im Bergfried, seit ich hier diene. Niemand wusste, wozu es gehört.", "Wenn Ysolde dich schickt, gehört es dir."], antworten: ["stueck_nehmen", tschuess.id] },
        { wenn: { erledigt: ["stueck_3"] }, zeilen: ["Für die Wacht. Und für den Boten."], antworten: [tschuess.id] },
        { zeilen: ["Hauptfrau Merit Stahl, Wacht von Graufurt."], antworten: [tschuess.id] },
      ],
      optionen: [
        { id: "stueck_nehmen", text: "Das Kartenstück nehmen.", folge: [{ f: { erledige: ["stueck_3"], geben: gib(3),
          zeilen: ["Merit gibt dir ein Pergament in einer Lederhülle.", "Auf der Rückseite steht: „Nach Norden, zum Hauptmann. Er hält, was ihm anvertraut ist, auch über den Tod.“"] } }] },
        tschuess,
      ],
    },
  },
  glueckwunsch: "Die Karte ist ganz. Der Bote ist angekommen – durch dich.",
  belohnungText: "Belohnung: die Reisekarte (alle Wegstein-Ziele, einmal am Tag ein Sprung ohne Ladung), je 6.000 XP Stärke, Geschick, Defense, Fernkampf und Magie, 4.000 LP-XP, 3.000 Splitter",
  belohnung: { xp: { staerke: 6000, geschick: 6000, defense: 6000, fernkampf: 6000, magie: 6000, lp: 4000 }, splitter: 3000, gegenstaende: [{ g: "reisekarte" }] },
  punkte: 4,
};
