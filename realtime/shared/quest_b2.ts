/*
 * Riftmere – Quest B2 „Wasser auf die Mühle“ (Phase 3c), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/2-hinter-der-sperre.pdf (Seite 5), doku/konzepte/phase-3.md Abschnitt 3c. Tebbe (Wassermühle Weidenhain), Hanne Kalk (Kornspeicher).
 * Das Winterhochwasser hat am Wehr zwei Schütztafeln weggerissen und die dritte verbogen. Die drei Überläufe untersuchen (die Texte verraten die Reihenfolge),
 * drei Schütztafeln (Tannen, Werkbank), sechs Eisenbänder (Eisenerz, Barren, Amboss), ein Hanftau (Hanf, Garn, Werkbank),
 * dann einsetzen: Mitte, stromab, oben. Falsche Reihenfolge = nur ein Spritzer und „So nicht!“, kein Verlust. Hanne Bescheid sagen, Abgabe bei Tebbe.
 * Lohn: 300 Splitter, 300 Schmieden-XP, 1 Questpunkt. Schalter: wehr_heil (Mühlrad dreht, Fanggrund Wehrkolk), werkstatt_weidenhain (Esse, Amboss, Werkbank
 * in Tebbes Schuppen), hanne_mehl (Hanne verkauft Mehl).
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Issue #6 (Rolle Spiel): Quest-Rezepte schuetztafel, eisenbaender, hanftau; Gegenstände schuetztafel,
 * eisenband, hanftau; Schalter und Drehteil. Tebbe und Hanne sind heute Dorffiguren der Welt – wie Agnes werden sie Questfiguren.
 * Kennungen und Stellen: doku/quests/b2-bausteine.md.
 */
import type { QuestDef, QuestObjekt, Bed, Sperre } from "./questbau";

export const B2 = "weidenhain_wasser_auf_die_muehle";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Wehr: Weidenhain 60 | 40,2. Oben = stromauf, unten = stromab (Vorschlag, die Welt prüft die Stellen) */
const UEB = { oben: [6457.5, 6697.5], mitte: [6460.5, 6697.5], unten: [6463.5, 6697.5] } as const;
const WERKBANK: [number, number] = [6530.5, 6426.5];
const UE = ["ueberlauf_oben", "ueberlauf_mitte", "ueberlauf_unten"];
const KULISSE = "Das Wehr staut den Mühlgraben. Durch drei Überläufe stürzt das Wasser schäumend hinab.";
const SPRITZER = "Kaum hältst du die Tafel ins Wasser, reißt die Strömung sie dir aus den Händen. Ein Schwall – du bist nass bis auf die Knochen. Von der Mühle ruft Tebbe: „So nicht!“";
const HILFE = ["Erst schauen: die drei Überläufe am Wehr. Was du da siehst, sagt dir, wie man's macht.",
  "Drei Schütztafeln aus Tannenholz, je zwei Stämme, an der Werkbank im Osthof. Tannen stehen im Nordsaum und auf der Lichtung im Kreuzwald.",
  "Sechs Eisenbänder: Eisenerz aus den Senken im Kreuzwald, an der Esse drei Barren, am Amboss je zwei Bänder draus.",
  "Ein Tau: vier Hanf vom Osthof, zu Garn gesponnen, an der Werkbank gedreht.", "Dann einsetzen. In der richtigen Reihenfolge. Sonst nimmt der Fluss sie gleich wieder mit."];

/** Eine Schütztafel einsetzen: je eine Tafel und zwei Eisenbänder, oben zusätzlich das Tau */
const setzen = (wo: "oben" | "mitte" | "unten", text: string, extra: { g: string; n?: number }[], sonst: Sperre[]): QuestObjekt => ({
  id: "tafel_" + wo, name: "Wehr – " + (wo === "oben" ? "oberer" : wo === "mitte" ? "mittlerer" : "unterer") + " Überlauf", x: UEB[wo][0], y: UEB[wo][1] + 1, modell: "stelle", tat: "benutzen",
  tatText: "Die Schütztafel einsetzen", weit: 3,
  braucht: { wenn: { hat: "schuetztafel", anzahl: { g: "eisenband", min: 2 } }, text: "Ohne Schütztafel und zwei Eisenbänder kannst du hier nichts ausrichten." },
  nehmen: [{ g: "schuetztafel" }, { g: "eisenband", n: 2 }, ...extra], text, schon: "Die Tafel sitzt fest. Das Wasser staut sich dahinter.", sonst });

export const QUEST_B2: QuestDef = {
  id: B2, titel: "Wasser auf die Mühle", ort: "Weidenhain · Kreuzwald · Nordsaum · Osthof", start: "Sprich mit Tebbe an der Wassermühle in Weidenhain.",
  logNeu: "Das Mühlrad in Weidenhain steht still. Tebbe, der Müller, steht am Mühlgraben und schaut auf das Wehr.",
  logAngeboten: "Tebbe an der Wassermühle in Weidenhain braucht noch Hilfe am Wehr.",
  logAbgabe: "Das Wehr hält, das Mühlrad dreht sich. Sag Tebbe an der Wassermühle Bescheid.",
  logFertig: "Das Wehr von Weidenhain hält wieder, und die Mühle mahlt. Tebbes Schuppen ist jetzt deine Werkstatt: Esse, Amboss und Werkbank, gleich neben der Bank. Hanne Kalk verkauft Mehl.",
  geber: "tebbe",
  figuren: [
    { id: "tebbe", name: "Tebbe", modell: "npc.tebbe", x: 6458.6, y: 6692.6, blick: [0, 1] },
    { id: "hanne", name: "Hanne Kalk", modell: "npcfrau3d", x: 6433.4, y: 6679.4, blick: [0, 1] },
  ],
  voraussetzungen: [
    { text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } },
    { text: "Holzfällerei 10", wenn: { skill: { k: "holzfaellerei", min: 10 } } },
    { text: "Bergbau 10", wenn: { skill: { k: "bergbau", min: 10 } } },
    { text: "Handwerk 15", wenn: { skill: { k: "handwerk", min: 15 } } },
  ],
  schritte: [
    ...(["oben", "mitte", "unten"] as const).map((w) => ({ id: "ueberlauf_" + w, text: "Die drei Überläufe am Wehr untersuchen", ereignis: { art: "objekt" as const, id: "ueberlauf_" + w },
      gruppe: "ueberlaeufe", wo: [UEB[w][0], UEB[w][1]] as [number, number], log: "Untersuch die drei Überläufe am Wehr von Weidenhain ({n:ueberlaeufe})." })),
    { id: "tafeln", text: "Drei Schütztafeln bauen", ereignis: { art: "herstellen", rezept: "schuetztafel" }, anzahl: 3, wo: WERKBANK,
      log: "Fäll sechs Tannen (Nordsaum oder Lichtung im Kreuzwald) und bau an der Werkbank im Osthof drei Schütztafeln, je zwei Tannenstämme ({n:tafeln})." },
    { id: "baender", text: "Sechs Eisenbänder schmieden", ereignis: { art: "herstellen", rezept: "eisenbaender" }, anzahl: 3, wo: "amboss",
      log: "Bau in den Senken des Kreuzwalds sechs Eisenerz ab, schmilz an der Esse drei Eisenbarren und schmiede am Amboss aus jedem zwei Eisenbänder ({n:baender} Barren)." },
    { id: "tau", text: "Ein Hanftau drehen", ereignis: { art: "herstellen", rezept: "hanftau" }, wo: WERKBANK,
      log: "Pflück im Osthof vier Hanf, spinn daraus Garn und dreh an der Werkbank ein Hanftau." },
    { id: "setzen_mitte", text: "Die mittlere Schütztafel einsetzen", ereignis: { art: "objekt", id: "tafel_mitte" }, nach: [...UE, "tafeln", "baender"], wo: [UEB.mitte[0], UEB.mitte[1] + 1],
      log: "Setz die Schütztafeln am Wehr ein – in der Reihenfolge, die dir die Überläufe verraten haben. Je Tafel zwei Eisenbänder." },
    { id: "setzen_unten", text: "Die untere Schütztafel einsetzen", ereignis: { art: "objekt", id: "tafel_unten" }, nach: ["setzen_mitte"], wo: [UEB.unten[0], UEB.unten[1] + 1],
      log: "Die Mitte hält. Setz die nächste Tafel ein." },
    { id: "setzen_oben", text: "Die obere Schütztafel einsetzen", ereignis: { art: "objekt", id: "tafel_oben" }, nach: ["setzen_unten", "tau"], wo: [UEB.oben[0], UEB.oben[1] + 1],
      log: "Noch eine Tafel – die letzte braucht das Hanftau, damit sie gegen die Strömung hält." },
    { id: "hanne", text: "Hanne Kalk Bescheid sagen", ereignis: { art: "antwort" }, nach: ["setzen_oben"], bei: "hanne",
      log: "Das Mühlrad dreht sich! Sag Hanne Kalk am Kornspeicher Bescheid." },
  ],
  objekte: [
    { id: "ueberlauf_mitte", name: "Wehr – mittlerer Überlauf", x: UEB.mitte[0], y: UEB.mitte[1], modell: "stelle", tat: "untersuchen", weit: 3,
      text: "Hier fehlt die Tafel ganz. Das Wasser schießt mit voller Kraft durch und zieht an allem, was daneben steht. Solange die Mitte offen ist, hält hier nichts ({n:ueberlaeufe}).",
      schon: "Der mittlere Überlauf. Hier zieht es am stärksten.", sonst: [{ wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die mittlere Tafel hält. Das Wasser steht ruhig dahinter." }] },
    { id: "ueberlauf_unten", name: "Wehr – unterer Überlauf", x: UEB.unten[0], y: UEB.unten[1], modell: "stelle", tat: "untersuchen", weit: 3,
      text: "Die Tafel stromab ist verbogen, die Bänder gerissen. Sie hätte gehalten – wäre in der Mitte nicht alles durchgebrochen. Erst wenn die Mitte zu ist, wird es hier ruhig ({n:ueberlaeufe}).",
      schon: "Der untere Überlauf. Er wird ruhig, sobald die Mitte hält.", sonst: [{ wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die untere Tafel hält." }] },
    { id: "ueberlauf_oben", name: "Wehr – oberer Überlauf", x: UEB.oben[0], y: UEB.oben[1], modell: "stelle", tat: "untersuchen", weit: 3,
      text: "Oben ist die Tafel weggerissen, und hier drückt das ganze gestaute Wasser. Wer hier zuerst eine Tafel setzt, verliert sie. Die kommt zuletzt – und mit einem Tau gesichert ({n:ueberlaeufe}).",
      schon: "Der obere Überlauf. Zuletzt, und mit einem Tau.", sonst: [{ wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die obere Tafel hält, das Tau ist straff gespannt." }] },
    setzen("mitte", "Du drückst die Tafel in die Führung, Tebbe kommt angerannt und hilft dir, die Bänder zu schlagen. Das Wasser hinter der Mitte steigt – und hält.", [], [
      { wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die mittlere Tafel hält." },
      { wenn: { offen: ["setzen_mitte"], erledigt: UE }, text: "Erst die Tafeln und die Eisenbänder. Dann kannst du hier etwas einsetzen." },
      { wenn: { offen: ["setzen_mitte"] }, text: "Schau dir erst alle drei Überläufe an, bevor du etwas einsetzt." }]),
    setzen("unten", "Jetzt, wo die Mitte hält, liegt die Tafel stromab ruhig in der Hand. Zwei Bänder, ein paar Schläge – sie sitzt.", [], [
      { wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die untere Tafel hält." },
      { wenn: { offen: ["setzen_mitte", "setzen_unten"], erledigt: UE }, text: SPRITZER },
      { wenn: { offen: ["setzen_unten"] }, text: "Schau dir erst alle drei Überläufe an, bevor du etwas einsetzt." }]),
    setzen("oben", "Die letzte Tafel. Das Wasser drückt mit aller Kraft, aber das Tau hält sie, bis die Bänder sitzen. Dann ein Knarren von der Mühle – das Rad dreht sich!", [{ g: "hanftau" }], [
      { wenn: NEU, text: KULISSE }, { wenn: FERTIG, text: "Die obere Tafel hält, das Tau ist straff gespannt." },
      { wenn: { offen: ["setzen_unten", "setzen_oben"], erledigt: UE }, text: SPRITZER },
      { wenn: { offen: ["tau", "setzen_oben"], erledigt: ["setzen_unten"] }, text: "Ohne Tau reißt dir das Wasser die Tafel weg. Dreh erst ein Hanftau an der Werkbank." },
      { wenn: { offen: ["setzen_oben"] }, text: "Schau dir erst alle drei Überläufe an, bevor du etwas einsetzt." }]),
  ],
  /* Tebbe: Müller, mehlige Hände, wenig Worte, zählt gern auf. Sagt nichts zweimal, außer man fragt „Wie war das noch?“. Je Abschnitt eine eigene Begrüßung.
     Hanne: Verwalterin des Kornspeichers, rechnet in Säcken, nüchtern, aber man merkt ihr die Erleichterung an. */
  dialoge: {
    tebbe: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Drei Tafeln, zwölf Bänder, ein Tau.", "…Na gut, sechs Bänder. Zwölf wär schöner.",
          "Das Hochwasser hat mir das Wehr zerlegt. Das Wasser läuft am Rad vorbei, und ich steh hier und schau zu."], antworten: ["annehmen", "wehr", "spaeter"] },
        { wenn: NEU, zeilen: ["Das Wehr ist kaputt. Und du siehst nicht aus, als könntest du's flicken.", "Nichts für ungut."], antworten: ["was_fehlt", "wehr", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Hörst du's? Mahlt, als wär nichts gewesen.", "Mein Schuppen steht dir offen. Esse, Amboss, Werkbank. Mach nichts kaputt."], antworten: ["schuppen", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Hanne war hier. Hat geweint. Sagt sie nicht, hat sie aber.", "Komm her."], antworten: ["fertig"] },
        { wenn: { erledigt: ["setzen_oben"] }, zeilen: ["Das Rad! Siehst du das Rad?", "Lauf zu Hanne. Sag's ihr. Ich glaub's selbst noch nicht."], antworten: ["tschuess"] },
        { wenn: { erledigt: ["setzen_mitte"] }, zeilen: ["Die Mitte hält. Gut. Ich hab's gesehen.", "Weiter. Nicht trödeln, der Pegel steigt."], antworten: ["hilfe", "reihenfolge", "tschuess"] },
        { wenn: { erledigt: [...UE, "tafeln", "baender"] }, zeilen: ["Tafeln. Bänder. Alles da?", "Dann ans Wehr. Und denk dran, was du gesehen hast."], antworten: ["hilfe", "reihenfolge", "tschuess"] },
        { wenn: { erledigt: UE }, zeilen: ["Gesehen, wie's aussieht? Dann weißt du jetzt mehr als die Zimmerleute in Graufurt.", "Holz, Eisen, Hanf. Los."], antworten: ["hilfe", "reihenfolge", "tschuess"] },
        { zeilen: ["Erst schauen, dann bauen. Die drei Überläufe am Wehr, gleich unterhalb.", "Wer nicht hinschaut, baut zweimal."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich flicke das Wehr. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du? …Hm. Hast Hände. Das ist mehr, als ich von den meisten sagen kann.",
          "Schau dir erst die drei Überläufe an. Dann brauchst du drei Schütztafeln aus Tanne, sechs Eisenbänder und ein Hanftau.", "Und dann die Reihenfolge. Die sag ich dir nicht. Die sagt dir das Wasser."] } }] },
        { id: "wehr", text: "Was ist mit dem Wehr passiert?", folge: [{ f: { weiter: true, zeilen: ["Winterhochwasser. Zwei Tafeln weggerissen, die dritte verbogen.",
          "Die Zimmerleute sitzen in Graufurt, hinter der gerissenen Fährkette. Und Hannes Speicher wird voll und voller, und keiner mahlt."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Mhm. Das Wasser wartet nicht. Aber ich schon."] } }] },
        { id: "was_fehlt", text: "Was fehlt mir?", folge: [{ f: { weiter: true, zeilen: ["Holzfällerei 10, Bergbau 10, Handwerk 15. Und die Straße hierher muss frei sein, sonst stehst du nicht hier.", "Steht auch in deinem Questlog."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "reihenfolge", text: "In welcher Reihenfolge?", folge: [{ f: { weiter: true, zeilen: ["Wo zieht's am stärksten? Da fängst du an.", "Und wo drückt's am meisten? Da hörst du auf. Mit Tau."] } }] },
        { id: "fertig", text: "Das Wehr hält.", folge: [{ f: { abschluss: true, zeilen: ["Tebbe legt dir eine mehlige Hand auf die Schulter. Lange.",
          "Hier. Splitter, was die Mühle hergibt. Und mein Schuppen – Esse, Amboss, Werkbank. Gleich neben der Bank. Benutz ihn.", "Drei Tafeln, sechs Bänder, ein Tau. Merk ich mir."] } }] },
        { id: "schuppen", text: "Dein Schuppen?", folge: [{ f: { weiter: true, zeilen: ["Gleich neben der Bank. Esse, Amboss, Werkbank. Musst nicht mehr bis in die Waldmark laufen.", "Den Hammer bringst du selbst mit."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ wenn: FERTIG, f: { zeilen: ["Mhm. Das Rad grüßt."] } }, { f: { zeilen: ["Mhm."] } }] },
      ],
    },
    hanne: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["setzen_oben"], offen: ["hanne"] }, zeilen: ["Ich hab's gehört! Das Rad! Erst dachte ich, das Dach kommt runter.", "Ist es wahr? Hält das Wehr?"], antworten: ["bescheid"] },
        { wenn: FERTIG, zeilen: ["Mehl gibt's wieder. Bei mir, am Speicher. Ehrlicher Preis.", "Und wenn Grete in der Waldmark knapp wird – schick sie her."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hanne"] }, zeilen: ["Geh zu Tebbe. Er will's dir selbst sagen. Er sagt nicht viel, aber das schon."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Tebbe sagt, du flickst das Wehr. Gut.", "Vierhundert Sack liegen hier und warten. Ich hab sie gezählt. Zweimal."], antworten: ["tschuess"] },
        { zeilen: ["Der Speicher platzt. Korn bis unters Dach, und keiner mahlt.", "Rede mit Tebbe an der Mühle. Vielleicht hörst du ihm länger zu als ich."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "bescheid", text: "Das Wehr hält, die Mühle mahlt.", folge: [{ f: { erledige: ["hanne"], zeilen: ["Hanne setzt sich auf einen Sack. Dann steht sie wieder auf.",
          "Dann mahlt er heute Nacht durch, wenn ich ihn kenne. Geh zu Tebbe – er will's dir selbst sagen.", "Und danach: Mehl gibt's bei mir. Für dich zum ehrlichen Preis."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit Gott. Oder mit Mehl."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    schuetztafel: [{ wenn: { phase: ["neu", "fertig"] }, text: "Schütztafeln baust du nur für Tebbes Wehr." }, { wenn: { erledigt: ["tafeln"] }, text: "Drei Schütztafeln hast du schon gebaut." }],
    eisenbaender: [{ wenn: { phase: ["neu", "fertig"] }, text: "Eisenbänder schmiedest du nur für Tebbes Wehr." }, { wenn: { erledigt: ["baender"] }, text: "Sechs Eisenbänder hast du schon geschmiedet." }],
    hanftau: [{ wenn: { phase: ["neu", "fertig"] }, text: "Ein Hanftau drehst du nur für Tebbes Wehr." }, { wenn: { erledigt: ["tau"] }, text: "Das Hanftau hast du schon gedreht." }],
  } },
  schalter: { wehr_heil: [FERTIG, { erledigt: ["setzen_oben"] }], werkstatt_weidenhain: FERTIG, hanne_mehl: FERTIG },
  /* Mühlrad an der Wassermühle (Tür Weidenhain 60,4 | 33,2) – Stelle: Vorschlag, die Welt prüft */
  drehen: [{ schalter: "wehr_heil", x: 6463, y: 6689, r: 5 }],
  glueckwunsch: "Das Rad dreht sich. Hörst du's? So klingt Weidenhain, wenn es lebt.",
  belohnungText: "Belohnung: 300 Splitter, 300 Schmieden-XP · danach: das Mühlrad dreht sich, Tebbes Schuppen wird deine Werkstatt (Esse, Amboss, Werkbank), Hanne Kalk verkauft Mehl",
  belohnung: { splitter: 300, berufe: { schmieden: 300 } },
  punkte: 1,
};
