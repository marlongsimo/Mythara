/*
 * Riftmere – Quest H4 „Die Hüter der Hochlande“ (Phase 11, Boss-Quest), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, #161; Entscheidung des Nutzers 27.11.: eine Quest für alle drei Hüter, Reihenfolge frei).
 * Bergvögtin Hilde Erzgrund: Drei alte Hüter halten die Hochlande in Atem. Jeder Hüter ist ein eigener Strang, die drei Stränge in beliebiger Reihenfolge:
 *  – Grumhold (uralter Bergtroll) in der Trollhalle unter dem Bergwerk: Steiger Wendel zeigt den Weg (nach H3), hinab, Grumhold allein besiegen,
 *    in der Halle den Splitterkern finden; QUER: Mutter Hedda erkennt ihn (Haken für die Rissgrube).
 *  – Die Sturmschwinge (Riesenadler) im Horst auf dem Grauhorn: drei Sturmfedern am Aufstieg finden, hinauf in den Horst, sie besiegen.
 *  – Die Frostwitwe (Eismagierin) in der Eishöhle am Hochpass: die Eisrunen am Pass abschreiben, der Einsiedler vom Spiegelsee deutet sie, hinein, sie besiegen.
 * Boss-Regel (#116): vor der Quest ist die Kammer leer; in der Quest kämpft man allein gegen eine schwächere Fassung (eigene Instanz, Schalter *_halle/_horst/_hoehle);
 * nach der Quest (Schalter *_danach) die starke Fassung, öffentlich oder als eigene Instanz – jeder Hüter droppt seinen Rüstungssatz der Stufe 70 (1 : 75 je Sieg).
 * Lohn: Stärke, Fernkampf, Magie, Defense je 4.000 XP, 2.000 Splitter, 4 Questpunkte.
 * Neu (#118): Gegner grumhold, sturmschwinge, frostwitwe (Quest-Fassung und starke Fassung, Systeme); Regionen grumhold_halle, sturmschwinge_horst, frostwitwe_hoehle (Welt);
 * Gegenstände splitterkern, eisrunen_abschrift.
 */
import type { QuestDef, Bed } from "./questbau";
import { HILDE, WENDEL, HEDDA, EINSIEDLER, BRUN, GRAUHORN, HOCHPASS, TROLLHALLE } from "./quest_h_orte";
import { H1 } from "./quest_h1";
import { H3 } from "./quest_h3";

export const H4 = "hochlande_hueter_der_hochlande";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const FEDERN = ["feder_1", "feder_2", "feder_3"];
const HUETER = ["grumhold", "sturmschwinge", "frostwitwe"];
const HILFE = ["Grumhold schläft in der Trollhalle unter dem Erzberg. Wendel kennt den Weg, seit ihr den tiefen Stollen freigelegt habt.",
  "Die Sturmschwinge horstet auf dem Grauhorn. Wer den Weg hinauf sucht, folgt ihren Federn.", "Die Frostwitwe haust in einer Eishöhle am Hochpass. Am Pass sind Runen ins Eis geritzt – der Einsiedler am Spiegelsee kann sie lesen.",
  "In welcher Reihenfolge, ist mir gleich. Hauptsache, du kommst zurück."];

export const QUEST_H4: QuestDef = {
  id: H4, titel: "Die Hüter der Hochlande", ort: "Steinhag · Trollhalle · Grauhorn · Hochpass · Spiegelsee · Rabenmoor", start: "Sprich mit der Bergvögtin Hilde Erzgrund in Steinhag.",
  logNeu: "In Steinhag erzählen sie von drei Hütern, die älter sind als die Stadt. Seit der Berg unruhig ist, glaubt niemand mehr, dass es nur Geschichten sind.",
  logAngeboten: "Die Bergvögtin Hilde Erzgrund sucht jemanden, der sich den drei Hütern der Hochlande stellt.",
  logAbgabe: "Grumhold, die Sturmschwinge und die Frostwitwe sind besiegt. Geh zurück zu Hilde Erzgrund in Steinhag.",
  logFertig: "Die drei Hüter sind besiegt – fürs Erste. Sie kommen wieder, stärker als zuvor, und wer sich ihnen stellt, kann ihre alte Rüstung gewinnen.",
  geber: "bergvoegtin",
  figuren: [HILDE, WENDEL, HEDDA, EINSIEDLER, BRUN],
  voraussetzungen: [
    { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H1, phase: ["fertig"] } } },
    { text: "„Tiefer als erlaubt“ abgeschlossen", wenn: { quest: { id: H3, phase: ["fertig"] } } },
    { text: "Heldenlevel 55", wenn: { heldenlevel: 55 } },
  ],
  schritte: [
    /* Grumhold */
    { id: "weg", text: "Steiger Wendel nach dem Weg in die Trollhalle fragen", ereignis: { art: "antwort" }, bei: "wendel",
      log: "Grumhold schläft in der Trollhalle unter dem Erzberg. Steiger Wendel kennt den Weg durch den tiefen Stollen." },
    { id: "halle", text: "In die Trollhalle hinabsteigen", ereignis: { art: "betreten", region: "grumhold_halle" }, nach: ["weg"], wo: TROLLHALLE,
      log: "Hinter dem Geröll aus dem tiefen Stollen führt ein Gang hinab in die Trollhalle." },
    { id: "grumhold", text: "Grumhold besiegen", ereignis: { art: "erlegen", typ: "grumhold" }, nach: ["halle"], wo: TROLLHALLE,
      log: "Grumhold, der uralte Bergtroll. Seine Steinhaut hält Klingen ab – Magie trifft ihn besser. Weich seinen Stampf-Ringen aus und zerschlag die Felsbrocken, bevor sie ihn heilen." },
    { id: "kern", text: "Den Splitterkern in der Trollhalle nehmen", ereignis: { art: "objekt", id: "h4_kern" }, nach: ["grumhold"], wo: TROLLHALLE,
      log: "Wo Grumhold geschlafen hat, leuchtet etwas im Boden. Nimm es mit." },
    { id: "hedda", text: "Mutter Hedda den Splitterkern zeigen", ereignis: { art: "antwort" }, nach: ["kern"], bei: "hedda",
      log: "Mutter Hedda im Rabenmoor hat schon die Erzprobe erkannt. Zeig ihr, was Grumhold bewacht hat." },
    /* Sturmschwinge */
    ...FEDERN.map((id, i) => ({ id, text: "Sturmfedern am Aufstieg zum Grauhorn finden", ereignis: { art: "objekt" as const, id: "h4_" + id }, gruppe: "federn", wo: GRAUHORN.federn[i],
      log: "Die Sturmschwinge horstet auf dem Grauhorn. Folg ihren Federn den Aufstieg hinauf ({n:federn})." })),
    { id: "horst", text: "Zum Horst auf dem Grauhorn hinaufsteigen", ereignis: { art: "betreten", region: "sturmschwinge_horst" }, nach: FEDERN, wo: GRAUHORN.horst,
      log: "Die Federn führen zum Gipfel. Steig hinauf in den Horst der Sturmschwinge." },
    { id: "sturmschwinge", text: "Die Sturmschwinge besiegen", ereignis: { art: "erlegen", typ: "sturmschwinge" }, nach: ["horst"], wo: GRAUHORN.horst,
      log: "Die Sturmschwinge kreist außer Reichweite und stößt herab – achte auf ihren Schatten. Der Wind lenkt Zauber ab; Pfeile treffen sie, und nach dem Sturzflug ist sie kurz am Boden." },
    /* Frostwitwe */
    { id: "runen", text: "Die Eisrunen am Hochpass abschreiben", ereignis: { art: "objekt", id: "h4_runen" }, wo: HOCHPASS.runen,
      log: "Am Hochpass sind Runen ins Eis geritzt, gleich bei der Passwacht. Schreib sie ab." },
    { id: "einsiedler", text: "Den Einsiedler am Spiegelsee die Runen deuten lassen", ereignis: { art: "antwort" }, nach: ["runen"], bei: "einsiedler",
      log: "Der Einsiedler am Spiegelsee schreibt die Geschichte der Hochlande auf. Er kann die Eisrunen lesen." },
    { id: "hoehle", text: "In die Eishöhle am Hochpass gehen", ereignis: { art: "betreten", region: "frostwitwe_hoehle" }, nach: ["einsiedler"], wo: HOCHPASS.hoehle,
      log: "Die Runen nennen den Eingang: hinter der Passwacht, wo der Schnee nie schmilzt. Geh in die Eishöhle." },
    { id: "frostwitwe", text: "Die Frostwitwe besiegen", ereignis: { art: "erlegen", typ: "frostwitwe" }, nach: ["hoehle"], wo: HOCHPASS.hoehle,
      log: "Die Frostwitwe friert den Boden ein – bleib nicht zu lange auf dem Eis stehen. Ihre Eiswand fängt Pfeile ab; geh nah heran." },
  ],
  objekte: [
    { id: "h4_kern", name: "Leuchten im Boden", x: TROLLHALLE[0], y: TROLLHALLE[1], modell: "stelle", tat: "aufheben", tatText: "Den Splitterkern nehmen", weit: 3,
      geben: [{ g: "splitterkern" }],
      text: "Ein Stein, so groß wie eine Faust, durchscheinend grün. Er pocht in deiner Hand, langsam, wie ein Herz, das schläft.", schon: "Den Splitterkern hast du.",
      sonst: [{ wenn: NEU, text: "Hier liegt nur Geröll." }, { wenn: FERTIG, text: "Wo der Kern lag, ist nur noch eine Mulde im Fels." }, { wenn: { offen: ["grumhold"] }, text: "Grumhold liegt darauf. Noch." }] },
    ...FEDERN.map((id, i) => ({ id: "h4_" + id, name: "Sturmfeder", x: GRAUHORN.federn[i][0], y: GRAUHORN.federn[i][1], modell: "stelle", tat: "aufheben" as const, tatText: "Die Feder ansehen", weit: 2.5,
      text: ["Eine Feder, länger als dein Arm. Sie zeigt bergauf.", "Noch eine, im Geröll verkeilt. Der Wind zerrt an ihr.", "Die dritte, auf einem Felsen, als hätte jemand sie dorthin gelegt. Darüber nur noch der Gipfel."][i] + " ({n:federn})",
      schon: "Die Feder hast du gesehen.", sonst: [{ wenn: NEU, text: "Eine große graue Feder. Irgendein Vogel." }, { wenn: FERTIG, text: "Eine Feder der Sturmschwinge, vom Wind verweht." }] })),
    { id: "h4_runen", name: "Eisrunen", x: HOCHPASS.runen[0], y: HOCHPASS.runen[1], modell: "stelle", tat: "untersuchen", tatText: "Die Runen abschreiben", weit: 2.5,
      geben: [{ g: "eisrunen_abschrift" }],
      text: "Zeichen, tief ins blaue Eis geritzt, älter als die Passwacht. Du schreibst sie ab, so gut es mit klammen Fingern geht.", schon: "Die Runen hast du abgeschrieben.",
      sonst: [{ wenn: NEU, text: "Kratzer im Eis. Oder Zeichen?" }, { wenn: FERTIG, text: "Die Runen sind noch da. Lesen kannst du sie jetzt." }] },
  ],
  /* Hilde: Bergvögtin, kennt die alten Geschichten, glaubt sie erst jetzt. Wendel: Steiger, will seine Leute nie wieder in die Halle schicken.
     Hedda: weiß mehr, als sie sagt. Einsiedler: ruhig, bedächtig, spricht in Bildern. Brun: Passwächterin, hat die Frostwitwe gesehen. */
  dialoge: {
    bergvoegtin: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Wendel hat mir erzählt, was in der Halle schläft. Und Hedda hat recht gehabt.",
          "Meine Großmutter hat von drei Hütern gesprochen. Grumhold im Berg, die Sturmschwinge auf dem Grauhorn, die Frostwitwe am Pass. Ich dachte, das sind Geschichten für Kinder.",
          "Seit der Berg wach ist, sind sie wach. Alle drei."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Wagen fahren. Aber der Berg ist unruhig."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Drei Hüter, und du stehst noch. Die Alten singen jetzt ein Lied über dich. Es ist schlecht, aber es ist laut.",
          "Sie kommen wieder, das weißt du. Stärker. Aber wer sie dann besiegt, dem geben sie, was sie bewachen – ihre alte Rüstung."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Alle drei? …Setz dich. Erzähl. Von Anfang an."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: HUETER }, zeilen: ["Alle drei besiegt – und Hedda weiß noch nichts? Dann geh zu ihr, bevor der Kern Unheil anrichtet."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["grumhold"] }, zeilen: ["Grumhold liegt? Dann hört der Berg vielleicht auf zu zittern. Zwei bleiben."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["sturmschwinge"] }, zeilen: ["Die Murmeltiere pfeifen nicht mehr, sagt Bartl. Die Sturmschwinge ist fort."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["frostwitwe"] }, zeilen: ["Am Pass taut es, sagt Brun. Zum ersten Mal seit Wochen."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Grumhold im Berg, die Sturmschwinge auf dem Grauhorn, die Frostwitwe am Pass. Die Reihenfolge wählst du."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich stelle mich den Hütern. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Hilde sieht dich lange an. Dann nickt sie.",
          "Grumhold zuerst, wenn du mich fragst – Wendel kennt den Weg in die Halle. Aber das ist deine Sache.",
          "Die Sturmschwinge horstet auf dem Grauhorn; folg ihren Federn. Und am Pass sind Runen ins Eis geritzt, die führen zur Frostwitwe. Der Einsiedler am Spiegelsee kann sie lesen.",
          "Jeden von ihnen stellst du allein. Glück auf."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Sie warten. Sie haben immer gewartet."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Grumhold, die Sturmschwinge und die Frostwitwe sind besiegt.", folge: [{ f: { abschluss: true, zeilen: ["Hilde Erzgrund steht auf. Im Hof der Vögte wird es still.",
          "Steinhag hat dir viel zu danken. Mehr, als in eine Truhe passt.", "Aber hör: Die Hüter sterben nicht. Sie schlafen nur. Wenn sie wieder erwachen, sind sie stärker – und wer sie dann bezwingt, dem lassen sie ihre Rüstung."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
    wendel: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["weg"] }, zeilen: ["Die Vögtin schickt dich in die Halle? …Dann muss ich dir den Weg zeigen. Ich wünschte, ich müsste nicht."], antworten: ["weg_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["weg"], offen: ["grumhold"] }, zeilen: ["Hinter dem Geröll, immer abwärts. Wenn der Boden warm wird, bist du da."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["grumhold"] }, zeilen: ["Er ist tot? Der Berg … der Berg ist still. Zum ersten Mal seit Wochen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Halle bleibt zu für meine Leute. Was dort unten wieder erwacht, ist deine Sache. Glück auf."], antworten: ["tschuess"] },
        { zeilen: ["Glück auf."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "weg_fragen", text: "Wie komme ich in die Trollhalle?", folge: [{ f: { erledige: ["weg"], zeilen: ["Durch den tiefen Stollen, den du freigelegt hast. Hinter den Verschütteten geht es weiter hinab.",
          "Da unten ist eine Halle, zu groß für den Berg. Und darin schläft er. Grumhold. Ein Troll, so alt wie der Fels.", "Klingen helfen wenig gegen seine Haut, sagt Marthe. Sie hat ihn gesehen. Nimm Zauber mit, wenn du kannst."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kern"], offen: ["hedda"], hat: "splitterkern" }, zeilen: ["Kind. Du bringst mir schon wieder Licht. Diesmal mehr."], antworten: ["kern_zeigen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hedda"] }, zeilen: ["Der Kern ist sicher bei mir. Sicherer als in einem Berg voller Bergleute."], antworten: ["tschuess"] },
        { zeilen: ["Kind. Setz dich nicht auf den Kessel."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "kern_zeigen", text: "Grumhold hat das hier bewacht.", wenn: { hat: "splitterkern" }, folge: [{ f: { erledige: ["hedda"], nehmen: [{ g: "splitterkern" }],
          zeilen: ["Hedda nimmt den Kern nicht in die Hand. Sie legt ein Tuch darüber und hebt ihn so auf.", "Ein Splitterkern. Daraus wachsen die Risse, Kind. Wo einer liegt, öffnet sich die Welt.",
          "Grumhold hat ihn nicht bewacht. Er hat ihn gefressen, Jahrhundert für Jahrhundert, damit er nicht wächst. …Und jetzt ist er draußen.", "Ich behalte ihn. Und wenn unter dem Erzberg ein Riss aufgeht, dann weißt du, warum."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh, Kind."] } }] },
      ],
    },
    einsiedler: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["runen"], offen: ["einsiedler"], hat: "eisrunen_abschrift" }, zeilen: ["Du bringst mir Zeichen aus dem Eis? Zeig her. Langsam."], antworten: ["runen_zeigen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["einsiedler"] }, zeilen: ["Wo der Schnee nie schmilzt. Geh nicht ohne Feuer."], antworten: ["tschuess"] },
        { zeilen: ["Ah, ein Wanderer. Setz dich. Der See erzählt dir mehr als ich."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "runen_zeigen", text: "Runen vom Hochpass.", wenn: { hat: "eisrunen_abschrift" }, folge: [{ f: { erledige: ["einsiedler"], nehmen: [{ g: "eisrunen_abschrift" }],
          zeilen: ["Der Einsiedler fährt die Zeichen mit dem Finger nach. Seine Lippen bewegen sich.", "„Hier ruht, die den Pass hielt, als die Wacht fiel. Wer sie weckt, friert.“",
          "Die Frostwitwe. Sie war eine Wächterin, vor langer Zeit. Die letzte am Pass. Sie wollte nicht gehen – und das Eis hat sie behalten.",
          "Der Eingang liegt hinter der Passwacht, wo der Schnee nie schmilzt. Geh nah an sie heran; das Eis fängt alles, was fliegt."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit den Steinen."] } }] },
      ],
    },
    brun: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["runen"] }, zeilen: ["Die Frostwitwe? …Ich hab sie gesehen. Nachts, wenn der Mond tief steht. Am Eis hinter der Wacht.", "Neben der Schranke sind Zeichen ins Eis geritzt. Keiner von uns kann sie lesen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["frostwitwe"] }, zeilen: ["Es taut. Hörst du das? Das Eis singt, wenn es schmilzt."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Manchmal friert es wieder, nachts. Dann weiß ich, sie ist zurück."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Hinter dem Pass beginnt die Kälte. Wer weitergeht, tut es auf eigene Gefahr."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bleib auf dem Weg."] } }] },
      ],
    },
  },
  /* Boss-Regel #116: in der Quest allein und schwächer (Kammer als eigene Instanz), danach die starke Fassung */
  schalter: {
    grumhold_halle: { phase: ["laeuft"], erledigt: ["weg"], offen: ["grumhold"] }, grumhold_danach: FERTIG,
    sturmschwinge_horst: { phase: ["laeuft"], erledigt: FEDERN, offen: ["sturmschwinge"] }, sturmschwinge_danach: FERTIG,
    frostwitwe_hoehle: { phase: ["laeuft"], erledigt: ["einsiedler"], offen: ["frostwitwe"] }, frostwitwe_danach: FERTIG,
  },
  glueckwunsch: "Drei Hüter. Ein Wanderer. Die Hochlande werden deinen Namen in Stein schreiben – neben die Steinmänner.",
  belohnungText: "Belohnung: Stärke, Fernkampf, Magie, Defense je 4.000 XP, 2.000 Splitter · danach: die drei Hüter in ihrer starken Fassung – jeder kann seinen Rüstungssatz der Stufe 70 fallen lassen",
  belohnung: { xp: { staerke: 4000, fernkampf: 4000, magie: 4000, defense: 4000 }, splitter: 2000 },
  punkte: 4,
};
