/*
 * Riftmere – Quest C2 „Der Gesang der Spiralsteine“ (Phase 6, Raben-Trilogie Teil 2), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/3-raben-trilogie.pdf (Seite 5–6), doku/konzepte/phase-6.md (zwei Steinkreise, Abstieg durch die Gruft).
 * Mutter Hedda gibt Moorglöckchen-Wachs, mit der Rabenkapuze greifen die Novizen nicht an. An beiden Steinkreisen lauschen (im Moor und auf Aschenwerth),
 * drei Federsiegel von Akoluthen, mit Hedda die Silben zusammensetzen (Dialog-Rätsel), die vier Spiralsteine auf Aschenwerth in der richtigen Reihenfolge
 * berühren (Mond, Welle, Feder, Auge; falsch = nur ein Misston), unter dem Steinkreis das Nest der Federmutter Ravena, zurück zu Hedda.
 * Boss-Regel (#116): In der Quest kämpfst du allein gegen eine schwächere Fassung (Schalter federmutter_kammer), danach die stärkere öffentlich oder als eigene Instanz (federmutter_danach).
 * Lohn: Rabenbeinschützer, Fernkampf 800, Magie 600, Defense 800 XP, 1 Questpunkt. Schalter gruft_offen (Abstieg in den Rabengrund).
 *
 * Im Spiel (shared/quests.ts) seit 27.11. (Phase 6, Federmutter #116, Gegenstände ffb6891f).
 * und auf Figuren in mehreren Quests (Hedda auch in „Miras Rezeptbuch“ und C3). Liste: doku/quests/c-bausteine.md.
 */
import type { QuestDef, QuestObjekt, Bed, Sperre } from "./questbau";
import { C1 } from "./quest_c1";

export const C2 = "aschenwerth_gesang_der_spiralsteine";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Hedda vor ihrer Hütte (rabenmoor 17,4 | 21,4), Steinkreis im Moor (rabenmoor 86 | 19,6), Steinkreis auf Aschenwerth (98 | 142,4), Gruft (44 | 134,6) */
const HEDDA: [number, number] = [6289.4, 6677.4], KREIS_MOOR: [number, number] = [6358, 6675.6], KREIS_INSEL: [number, number] = [6242, 6734.4];
/** Einstieg ins Nest im Steinkreis von Aschenwerth (federmutter_abstieg), Ravena im Nest (Region federmutter_kammer, shared/bosse.ts) */
const ABSTIEG: [number, number] = [6242, 6728.4], NEST: [number, number] = [11536.5, 9611.5];
/** Die vier Spiralsteine um den Kreis auf Aschenwerth (Vorschlag, die Welt prüft) */
const STEINE = { mond: [6239.5, 6731.5], welle: [6244.5, 6731.5], feder: [6244.5, 6737.5], auge: [6239.5, 6737.5] } as const;
const NAME = { mond: "Spiralstein mit dem Mond", welle: "Spiralstein mit der Welle", feder: "Spiralstein mit der Feder", auge: "Spiralstein mit dem Auge" } as const;
const LAUSCHEN = ["lauschen_moor", "lauschen_insel"];
const MISSTON = "Du legst die Hand auf den Stein. Ein Misston, tief und hässlich, läuft durch den ganzen Kreis. Die Spiralen werden dunkel. So nicht – fang vorn an, wie Hedda gesagt hat.";
const HILFE = ["Setz die Kapuze auf. Die Novizen sehen dann nur einen der Ihren. Die mit Bogen und Speer nicht – die schauen genauer hin.",
  "Zwei Kreise. Einer hier im Moor, einer drüben auf Aschenwerth. Alle paar Minuten singen sie. Stell dich dazu und hör zu, mit Wachs in den Ohren.",
  "Drei Federsiegel. Die tragen die Akoluthen. Ohne Siegel rührt sich kein Stein.", "Dann komm zu mir. Wir setzen die Silben zusammen. Richtig herum."];

const stein = (k: keyof typeof STEINE, text: string, sonst: Sperre[]): QuestObjekt => ({ id: "c2_" + k, name: NAME[k], x: STEINE[k][0], y: STEINE[k][1], modell: "stelle", tat: "benutzen",
  tatText: "Den Stein berühren", weit: 2.5, text, schon: "Die Spirale auf dem Stein leuchtet still.", sonst: [{ wenn: NEU, text: "Ein Stein voller Spiralen, kalt und feucht." }, { wenn: FERTIG, text: "Die Spirale leuchtet still." }, ...sonst] });
const SILBEN_FERTIG: Bed = { erledigt: ["silben"] };

export const QUEST_C2: QuestDef = {
  id: C2, titel: "Der Gesang der Spiralsteine", ort: "Rabenmoor · Aschenwerth", start: "Sprich mit Mutter Hedda vor ihrer Hütte in Rabenmoor.",
  logNeu: "Mutter Hedda hat Ebbo bei sich aufgenommen und hört ihm seit zwei Nächten zu. Sie hat etwas herausgehört.",
  logAngeboten: "Mutter Hedda in Rabenmoor wartet mit dem Wachs und einem Lied, das man nicht mitsingen soll.",
  logAbgabe: "Federmutter Ravena ist gefallen, die Gruft auf Aschenwerth steht offen. Geh zurück zu Mutter Hedda.",
  logFertig: "Unter der Gruft auf Aschenwerth liegt der Rabengrund. Dort sind die Verschwundenen – alle. Auch Liske, Jorins Schwester.",
  geber: "hedda",
  figuren: [{ id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: HEDDA[0], y: HEDDA[1], blick: [1, 0] }],
  voraussetzungen: [
    { text: "„Schwarze Federn“ abgeschlossen", wenn: { quest: { id: C1, phase: ["fertig"] } } },
    { text: "Defense 25", wenn: { skill: { k: "defense", min: 25 } } },
  ],
  schritte: [
    { id: "lauschen_moor", text: "Am Steinkreis im Moor lauschen", ereignis: { art: "objekt", id: "c2_kreis_moor" }, gruppe: "lauschen", wo: KREIS_MOOR,
      log: "Lausch an beiden Steinkreisen, wenn der Orden singt – im Moor und auf Aschenwerth ({n:lauschen}). Mit Wachs in den Ohren und der Kapuze auf dem Kopf." },
    { id: "lauschen_insel", text: "Am Steinkreis auf Aschenwerth lauschen", ereignis: { art: "objekt", id: "c2_kreis_insel" }, gruppe: "lauschen", wo: KREIS_INSEL,
      log: "Lausch an beiden Steinkreisen, wenn der Orden singt – im Moor und auf Aschenwerth ({n:lauschen}). Mit Wachs in den Ohren und der Kapuze auf dem Kopf." },
    { id: "siegel", text: "Drei Federsiegel von Akoluthen", ereignis: { art: "aufheben", g: "federsiegel" }, anzahl: 3, wo: KREIS_INSEL,
      log: "Die Akoluthen auf Aschenwerth tragen Federsiegel. Nimm drei an dich ({n:siegel}). Sie durchschauen deine Kapuze." },
    { id: "silben", text: "Mit Hedda die Silben zusammensetzen", ereignis: { art: "antwort" }, nach: [...LAUSCHEN, "siegel"], bei: "hedda",
      log: "Geh mit dem, was du gehört hast, zu Mutter Hedda. Sie setzt die Silben mit dir zusammen." },
    { id: "mond", text: "Die Spiralsteine in der richtigen Reihenfolge berühren", ereignis: { art: "objekt", id: "c2_mond" }, nach: ["silben"], gruppe: "steine", wo: [STEINE.mond[0], STEINE.mond[1]],
      log: "Berühr die Spiralsteine am Kreis auf Aschenwerth in der Reihenfolge, die ihr gefunden habt ({n:steine})." },
    { id: "welle", text: "Die Spiralsteine in der richtigen Reihenfolge berühren", ereignis: { art: "objekt", id: "c2_welle" }, nach: ["mond"], gruppe: "steine", wo: [STEINE.welle[0], STEINE.welle[1]],
      log: "Berühr die Spiralsteine am Kreis auf Aschenwerth in der Reihenfolge, die ihr gefunden habt ({n:steine})." },
    { id: "feder", text: "Die Spiralsteine in der richtigen Reihenfolge berühren", ereignis: { art: "objekt", id: "c2_feder" }, nach: ["welle"], gruppe: "steine", wo: [STEINE.feder[0], STEINE.feder[1]],
      log: "Berühr die Spiralsteine am Kreis auf Aschenwerth in der Reihenfolge, die ihr gefunden habt ({n:steine})." },
    { id: "auge", text: "Die Spiralsteine in der richtigen Reihenfolge berühren", ereignis: { art: "objekt", id: "c2_auge" }, nach: ["feder"], gruppe: "steine", wo: [STEINE.auge[0], STEINE.auge[1]],
      log: "Berühr die Spiralsteine am Kreis auf Aschenwerth in der Reihenfolge, die ihr gefunden habt ({n:steine})." },
    { id: "abstieg", text: "Unter den Steinkreis hinabsteigen", ereignis: { art: "betreten", region: "federmutter_kammer" }, nach: ["auge"], wo: ABSTIEG,
      log: "Mitten im Steinkreis von Aschenwerth hat sich der Boden geöffnet. Steig hinab ins Nest – du gehst allein." },
    { id: "ravena", text: "Federmutter Ravena besiegen", ereignis: { art: "erlegen", typ: "federmutter" }, nach: ["abstieg"], wo: NEST,
      log: "Im Nest unter dem Steinkreis hebt Federmutter Ravena den Kopf. Sie wechselt zwischen Stab, Bogen und Speer – schau auf ihre Waffe." },
  ],
  objekte: [
    { id: "c2_kreis_moor", name: "Steinkreis im Moor", x: KREIS_MOOR[0], y: KREIS_MOOR[1], modell: "stelle", tat: "untersuchen", tatText: "Lauschen", weit: 4,
      text: "Die Priester singen, das Wachs dämpft die Stimmen zu einem Summen. Aber die Silben hörst du: „…erst der Mond, der das Wasser zieht, dann die Welle, die ihm folgt …“ ({n:lauschen})",
      schon: "„Erst der Mond, dann die Welle.“", sonst: [{ wenn: NEU, text: "Spiralsteine im Kreis, mitten im Moor. Es ist still hier. Zu still." }, { wenn: FERTIG, text: "Der Kreis schweigt." }] },
    { id: "c2_kreis_insel", name: "Steinkreis auf Aschenwerth", x: KREIS_INSEL[0], y: KREIS_INSEL[1], modell: "stelle", tat: "untersuchen", tatText: "Lauschen", weit: 4,
      text: "Hier singen sie lauter, falsch herum, wie Hedda gesagt hat. Du drehst es im Kopf um: „…dann die Feder, die fällt, zuletzt das Auge, das alles sieht.“ ({n:lauschen})",
      schon: "„Dann die Feder, zuletzt das Auge.“", sonst: [{ wenn: NEU, text: "Sieben Steine im Kreis, mit Spiralen bedeckt." }, { wenn: FERTIG, text: "Der Kreis schweigt. Die Gruft steht offen." }] },
    stein("mond", "Der Stein mit dem Mond summt, als du ihn berührst. Die Spirale leuchtet silbern auf ({n:steine}).", [
      { wenn: { offen: ["silben"] }, text: "Ein Stein mit einem Mond. Ohne das Lied weißt du nicht, was er will." }]),
    stein("welle", "Der Stein mit der Welle antwortet, tiefer als der erste. Zwei Spiralen leuchten ({n:steine}).", [
      { wenn: { ...SILBEN_FERTIG, offen: ["mond"] }, text: MISSTON }, { wenn: { offen: ["silben"] }, text: "Ein Stein mit einer Welle. Ohne das Lied weißt du nicht, was er will." }]),
    stein("feder", "Die Feder auf dem Stein glüht auf, und irgendwo unter dir knackt etwas ({n:steine}).", [
      { wenn: { ...SILBEN_FERTIG, offen: ["welle"] }, text: MISSTON }, { wenn: { offen: ["silben"] }, text: "Ein Stein mit einer Feder. Ohne das Lied weißt du nicht, was er will." }]),
    stein("auge", "Das Auge öffnet sich – so sieht es jedenfalls aus. Der ganze Kreis singt jetzt, ohne Priester. In der Mitte bricht der Boden auf, und von unten raschelt es. Federn.", [
      { wenn: { ...SILBEN_FERTIG, offen: ["feder"] }, text: MISSTON }, { wenn: { offen: ["silben"] }, text: "Ein Stein mit einem Auge. Ohne das Lied weißt du nicht, was er will." }]),
  ],
  /* Hedda: alt, spöttisch, sagt „Kind“, weiß mehr, als sie zugibt. Hinter dem Spott Angst um Liske. Je Abschnitt eine eigene Begrüßung. */
  dialoge: {
    hedda: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ebbo redet im Schlaf. Ich hör zu. Das tu ich seit zwei Nächten.",
          "Die Priester singen jedem Stein eine Silbe vor. In der richtigen Reihenfolge öffnet sich etwas. Was darunter liegt, weiß keiner. Nur, dass keiner wieder herauskam."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Na, Kind? Krank oder neugierig? Beides kostet."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Unter dem Stein sind sie. Ich weiß es. Ich spür's in den Knochen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Die Federmutter. Ich hab den Schrei bis hierher gehört.", "Komm her, Kind. Setz dich."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["auge"] }, zeilen: ["Der Kreis hat gesungen, ohne sie. Dann ist etwas aufgewacht. Pass auf dich auf."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["silben"] }, zeilen: ["Mond, Welle, Feder, Auge. Richtig herum. Geh und sing's ihnen vor – mit den Händen."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: [...LAUSCHEN, "siegel"] }, zeilen: ["Du hast gehört, was sie singen? Und drei Siegel? Gut.", "Dann sag mir: in welcher Reihenfolge?"],
          antworten: ["reihe_richtig", "reihe_falsch", "reihe_quer", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: LAUSCHEN }, zeilen: ["Beide Kreise gehört. Jetzt die Siegel. Ohne Siegel rührt sich kein Stein."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Wachs in die Ohren, Kapuze auf den Kopf. Und dann hör hin, wenn sie singen."], antworten: ["hilfe", "wachs", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich höre ihnen zu. (Quest annehmen)", folge: [{ f: { start: true, geben: [{ g: "moorwachs", name: "einen Klumpen Moorglöckchen-Wachs", fehlt: true }],
          zeilen: ["Dann nimm das. Moorglöckchen-Wachs. In die Ohren damit, sonst singst du mit. Und wer mitsingt, geht hinunter und kommt nicht wieder.",
            "Setz die Kapuze auf, die Bertold dir gelassen hat. Die Novizen sehen dann einen der Ihren.", "Und bring mir Siegel. Drei. Die tragen die Akoluthen."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Gut. Dann sitz ich hier und hör weiter Ebbo zu."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "wachs", text: "Ich habe das Wachs verloren.", folge: [{ f: { weiter: true, geben: [{ g: "moorwachs", name: "einen Klumpen Moorglöckchen-Wachs", fehlt: true }], zeilen: ["Hier. Ich hab genug davon. Und pass besser auf deine Ohren auf."],
          nichtsZuGeben: ["Du hast doch welches, Kind. Schau in deine Taschen."] } }] },
        { id: "reihe_richtig", text: "Mond, Welle, Feder, Auge.", folge: [{ f: { erledige: ["silben"], nehmen: [{ g: "federsiegel", n: 3 }],
          zeilen: ["Hedda schließt die Augen und summt es leise. Einmal. Zweimal.", "Ja. So geht es. Richtig herum. Die Siegel nehm ich – die legst du nicht auf die Steine, die verbrenne ich. Du brauchst nur die Hände.",
            "Geh. Und wenn sich der Stein öffnet: renn nicht hinein. Erst kommt etwas heraus."] } }] },
        { id: "reihe_falsch", text: "Auge, Feder, Welle, Mond.", folge: [{ f: { weiter: true, zeilen: ["So singen sie es. Falsch herum, Kind. Damit keiner mitsingt.", "Dreh es um."] } }] },
        { id: "reihe_quer", text: "Feder, Mond, Auge, Welle.", folge: [{ f: { weiter: true, zeilen: ["Hast du überhaupt zugehört? Der Mond zieht das Wasser. Was kommt zuerst?"] } }] },
        { id: "fertig", text: "Ravena ist besiegt.", folge: [{ f: { abschluss: true, zeilen: ["Hedda nimmt deine Hand. Ihre ist kalt und zittert.",
          "Unter dem Stein sind sie. Alle. Auch Liske. Jorins Schwester. Seit dem Frühjahr.", "Harm hat dir etwas gemacht, aus den Federn, die sie hinterlassen hat. Zieh es an. Und dann geh hinunter – aber nicht heute. Heute ruhst du dich aus."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
  },
  /* Federsiegel: in C2 von jedem Akoluthen garantiert, solange noch welche fehlen (Rolle Spiel: chance 100) */
  beute: { c2_federsiegel: { phase: ["laeuft"], offen: ["siegel"] } },
  /* Nest der Federmutter (shared/bosse.ts): in der Quest allein und schwächer, danach öffentlich oder eigene Instanz. Die Gruft öffnet sich nach dem Kreis (Abstieg in den Rabengrund, C3). */
  schalter: { gruft_offen: [FERTIG, { erledigt: ["auge"] }], federmutter_kammer: { phase: ["laeuft"], erledigt: ["auge"], offen: ["ravena"] }, federmutter_danach: FERTIG },
  glueckwunsch: "Der Gesang ist still. Gut gemacht, Kind. Das sag ich nicht oft.",
  belohnungText: "Belohnung: die Rabenbeinschützer, Fernkampf 800, Magie 600, Defense 800 XP · danach: der Abstieg durch die Gruft in den Rabengrund",
  belohnung: { xp: { fernkampf: 800, magie: 600, defense: 800 }, gegenstaende: [{ g: "rabenbeinschuetzer" }] },
  punkte: 1,
};
