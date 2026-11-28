/*
 * Riftmere – Quest B4 „Das rote Banner“ (Phase 4, erster Boss), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/2-hinter-der-sperre.pdf (Seite 7–8), doku/konzepte/phase-4.md. Othmar Rehn (Weidenhain), Gesa Brandt (wartet an der Hütte).
 * Einstieg und Wachstube (Schläger, Armbrustschützen), Schlüsselbund (bedingte Beute), Kartentisch (Angriffsplan auf Weidenhain), Truhe im Beutelager
 * (Silberleuchter aus B3), Versammlungshalle (zwei Wellen), Kammer des Anführers als Instanz: Hauptmann Rotmantel, Brief mit Rabensiegel, das rote Banner.
 * Lohn: je 1.000 XP Stärke, Geschick, Defense, 500 LP-XP, 500 Splitter, eine seltene Waffe nach Wahl (Schwert, Zweihänder, Kurzbogen, Stab), 1 Questpunkt.
 * Die Wahl: heute vier Abschluss-Antworten, jede gibt eine andere Waffe (geben beim Abschluss). Nach der Regel „Belohnung zur Auswahl“ (Kanon 27.11.) soll die Wahl ins
 * Abschlussfenster (Bild, Werte, Rückfrage) – sobald der Baukasten ein Wahl-Feld hat (Issue). Die nicht gewählten Waffen verkauft Othmar danach für 1.000 Splitter. Das rote Banner nimmt man in der Kammer selbst mit.
 *
 * Im Spiel (shared/quests.ts). Als Entwurf wartete die Quest auf Issue #16 (Boss-Baukasten, Instanz, Tür mit Schlüssel, Ereignis für die Wellen, Gegenstände)
 * Othmar spricht in Quest 1, B3 und B4 (Figur in mehreren Quests, questbau.figurQuest, #48). Liste: doku/quests/b3-b4-bausteine.md.
 * Rotmantel (Kanon 27.11.): In der Quest kämpfst du immer allein, gegen eine schwächere, gut machbare Fassung (Instanz). Nach der Quest gibt es die stärkere Fassung öffentlich oder als eigene Instanz.
 * Orte: Issue #21 (Welt, 81778e67): Unterschlupf (Ursprung 10240 | 9600), Kammer rotmantel_kammer (Ursprung 10432 | 9600).
 */
import type { QuestDef, Bed, Folge } from "./questbau";
import { B3 } from "./quest_b3";

export const B4 = "westmark_das_rote_banner";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HUETTE: [number, number] = [6299.5, 6586.5], KARTE: [number, number] = [10273, 9631.5], TRUHE: [number, number] = [10273, 9658.6];
const HALLE: [number, number] = [10302, 9632], KAMMER: [number, number] = [10448, 9615.5], BANNER: [number, number] = [10450.5, 9606.5];
const HILFE = ["Gesa Brandt wartet mit zwei Wachen an der verlassenen Hütte in der Westmark. Unter den Fässern geht's hinab.",
  "In der Wachstube trägt einer den Schlüsselbund. Der öffnet das Beutelager. Was Rotmantel geplant hat, liegt auf seinem Kartentisch.",
  "Dann die Versammlungshalle. Sie werden zu mehreren kommen. Und dahinter: Rotmantels Kammer.", "Bring mir, wer ihn bezahlt. Und sorg dafür, dass er nicht nach Weidenhain kommt."];
/** Waffe nach Wahl aus Rotmantels Waffenkammer: je eine Abschluss-Antwort */
const WAHL: { id: string; text: string; g: string; name: string; satz: string }[] = [
  { id: "wahl_schwert", text: "Das Schwert.", g: "eidschwert", name: "ein seltenes Schwert", satz: "Ein Schwert. Ehrlich und gerade. Passt zu dir." },
  { id: "wahl_zweihaender", text: "Den Zweihänder.", g: "eidzweihaender", name: "einen seltenen Zweihänder", satz: "Den Zweihänder? Mit dem hat er selbst gekämpft. Jetzt kämpft er für uns." },
  { id: "wahl_bogen", text: "Den Kurzbogen.", g: "mondkurzbogen", name: "einen seltenen Kurzbogen", satz: "Den Bogen. Gesa wird nicken, wenn sie ihn sieht." },
  { id: "wahl_stab", text: "Den Stab.", g: "sternenszepter", name: "einen seltenen Zauberstab", satz: "Einen Stab hätte ich bei Banditen nicht erwartet. Gestohlen, sicher. Jetzt gehört er dir." },
];
/* Den Rabenbrief behält der Spieler: Bertold Krähe will ihn in C1 sehen (shared/quest_c1.ts) */
/** Belohnung zur Auswahl (Kanon): Die nicht gewählten Waffen bleiben erreichbar – Othmar verkauft sie nach der Quest aus Rotmantels Waffenkammer (auch als Ersatz bei Verlust) */
const KAUFPREIS = 1000;
const KAUF = WAHL.map((w) => ({ id: "kauf_" + w.g, text: `${w.text.replace(/\.$/, "")} aus der Waffenkammer kaufen (${KAUFPREIS} Splitter).`,
  wenn: { ...FERTIG, verloren: w.g, anzahl: { g: "splitter", min: KAUFPREIS } },
  folge: [{ f: { weiter: true, nehmen: [{ g: "splitter", n: KAUFPREIS }], geben: [{ g: w.g, name: w.name }], zeilen: ["Othmar schließt die Waffenkammer auf. „Rotmantel braucht sie nicht mehr. Und Weidenhain braucht Splitter.“"] } }] }));
const abschluss = (w: (typeof WAHL)[number]): Folge => ({ abschluss: true, nehmen: [{ g: "silberleuchter" }], geben: [{ g: w.g, name: w.name }],
  zeilen: [w.satz, "Weidenhain schuldet dir mehr, als ich zahlen kann. Nimm, was ich habe.",
    "Und der Brief … „Die Insel wartet.“ Federn, Splitter, eine Insel. Das führt ins Rabenmoor.", "Behalt ihn. Zeig ihn Bertold Krähe, dem Schulzen von Rabenmoor. Wenn einer weiß, welche Insel gemeint ist, dann er."] });

export const QUEST_B4: QuestDef = {
  id: B4, titel: "Das rote Banner", ort: "Westmark · Unterschlupf · Weidenhain", start: "Sprich mit Othmar Rehn in Weidenhain.",
  logNeu: "Othmar Rehn in Weidenhain hat den Namen Rotmantel nicht vergessen. Er sucht jemanden, der in die Westmark hinabsteigt.",
  logAngeboten: "Othmar Rehn in Weidenhain wartet, ob du gegen Rotmantel ziehst.",
  logAbgabe: "Rotmantel ist besiegt. Bring den Brief mit dem Rabensiegel und die Silberleuchter zu Othmar Rehn nach Weidenhain.",
  logFertig: "Hauptmann Rotmantel ist geschlagen, Weidenhain ist sicher. Doch der Brief mit dem Rabensiegel spricht von einer Insel und vom „Obersten“ – die Spur führt ins Rabenmoor. Bertold Krähe, der Schulze von Rabenmoor, sollte den Brief sehen.",
  geber: "othmar",
  figuren: [
    { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] },
    { id: "gesa_huette", name: "Gesa Brandt", modell: "stadtwache3d", x: HUETTE[0], y: HUETTE[1], blick: [1, 0] },
  ],
  voraussetzungen: [
    { text: "„Fallobst“ abgeschlossen", wenn: { quest: { id: B3, phase: ["fertig"] } } },
    { text: "Defense 20", wenn: { skill: { k: "defense", min: 20 } } },
  ],
  schritte: [
    { id: "gesa", text: "Gesa Brandt an der Hütte treffen", ereignis: { art: "antwort" }, bei: "gesa_huette",
      log: "Gesa Brandt wartet an der verlassenen Hütte in der Westmark. Sprich mit ihr, bevor du hinabsteigst. (Heldenlevel 25 empfohlen.)" },
    { id: "schluessel", text: "Den Schlüsselbund der Wachstube erbeuten", ereignis: { art: "aufheben", g: "schluesselbund" }, nach: ["gesa"], wo: [10273, 9628],
      log: "Kämpf dich durch die Wachstube des Unterschlupfs. Einer der Banditen trägt den Schlüsselbund zum Beutelager." },
    { id: "karte", text: "Den Kartentisch untersuchen", ereignis: { art: "objekt", id: "b4_karte" }, nach: ["gesa"], wo: KARTE,
      log: "Sieh dir den Kartentisch im Unterschlupf an. Was hat Rotmantel vor?" },
    { id: "truhe", text: "Die Truhe im Beutelager öffnen", ereignis: { art: "objekt", id: "b4_truhe" }, nach: ["schluessel"], wo: TRUHE,
      log: "Schließ mit dem Schlüsselbund das Beutelager auf und öffne die Truhe." },
    { id: "halle", text: "Die Versammlungshalle säubern", ereignis: { art: "erlegen", typ: "unterschlupf_welle" }, anzahl: 2, nach: ["schluessel"], wo: HALLE,
      log: "In der Versammlungshalle kommen die Banditen in zwei Wellen zu dritt. Halte stand ({n:halle} Wellen)." },
    { id: "rotmantel", text: "Hauptmann Rotmantel besiegen", ereignis: { art: "erlegen", typ: "rotmantel" }, nach: ["halle"], wo: KAMMER,
      log: "Hinter dem roten Banner liegt die Kammer des Anführers. Besieg Hauptmann Rotmantel – du stehst ihm allein gegenüber. Weich dem Rundumschlag aus, wenn die Felder rot leuchten, und lock ihn vom Thron weg." },
    { id: "brief", text: "Den Brief mit dem Rabensiegel an dich nehmen", ereignis: { art: "aufheben", g: "rabenbrief" }, nach: ["halle"], wo: KAMMER,
      log: "Rotmantel trug einen Brief bei sich. Nimm ihn an dich." },
    { id: "banner", text: "Das rote Banner abnehmen", ereignis: { art: "objekt", id: "b4_banner" }, nach: ["rotmantel"], wo: BANNER,
      log: "Nimm das rote Banner hinter dem Thron als Beweis mit." },
  ],
  objekte: [
    { id: "b4_karte", name: "Kartentisch", x: KARTE[0], y: KARTE[1], modell: "stelle", tat: "untersuchen", weit: 2.5,
      text: "Eine Karte der Westmark, der Steinweg rot markiert. Daneben Weidenhain, dick rot angekreuzt. Darunter in krakeliger Schrift: „In drei Tagen. Alles, was trägt.“",
      schon: "Weidenhain, rot angekreuzt. In drei Tagen.", sonst: [{ wenn: NEU, text: "Auf dem Tisch liegt eine Karte der Westmark." }, { wenn: FERTIG, text: "Die Karte ist nutzlos geworden. Das Kreuz bei Weidenhain bleibt ein Kreuz auf Papier." }] },
    { id: "b4_truhe", name: "Truhe im Beutelager", x: TRUHE[0], y: TRUHE[1], modell: "stelle", tat: "benutzen", tatText: "Die Truhe öffnen", weit: 2.5,
      geben: [{ g: "silberleuchter" }],
      text: "Münzen, Stoffballen aus Graufurt – und zwei silberne Kerzenleuchter, eingewickelt in Sackleinen. Die aus Gisberts Karrenbrief. Othmar wird sie zurückhaben wollen.",
      schon: "Die Truhe ist leer bis auf Stoff und Staub.", sonst: [{ wenn: NEU, text: "Eine Truhe voller Beute. Sie gehört nicht dir." }, { wenn: FERTIG, text: "Die Truhe ist leer." }] },
    { id: "b4_banner", name: "Das rote Banner", x: BANNER[0], y: BANNER[1], modell: "stelle", tat: "aufheben", tatText: "Das Banner abnehmen", weit: 3,
      geben: [{ g: "rotes_banner" }],
      text: "Du reißt das Banner von der Wand. Schwerer roter Stoff, an den Rändern verbrannt. Darunter, in die Wand geritzt: ein Rabe.",
      schon: "Das Banner hast du schon.", sonst: [{ wenn: NEU, text: "Ein rotes Banner hängt hinter dem Thron." }, { wenn: { offen: ["rotmantel"] }, text: "Erst Rotmantel. Das Banner läuft nicht weg." }] },
  ],
  /* Othmar: Bürgermeister, besonnen, wählt die Worte, trägt die Sorge für ein ganzes Dorf. Gesa: Wachführerin, knapp, militärisch, trocken. */
  dialoge: {
    othmar: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Rotmantel. Ich krieg den Namen nicht aus dem Kopf.",
          "Er war Söldner der Wacht, damals. Jetzt hat er unter der Westmark eine Bande, die mehr frisst, als die Wiesen hergeben. Rotmantel bezahlt seine Leute nicht mit Äpfeln.",
          "Irgendwer bezahlt ihn. Finde heraus, wer – und sorg dafür, dass er nicht nach Weidenhain kommt."], antworten: ["annehmen", "wacht", "spaeter"] },
        { wenn: NEU, zeilen: ["Weidenhain hat wieder Gäste, seit die Straße offen ist. Nicht alle davon sind mir lieb."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Weidenhain schläft wieder ruhig. Ich nicht. Ich denke an diese Insel.", "In Rotmantels Waffenkammer liegen noch Waffen. Willst du eine, sag es."], antworten: ["wacht", ...KAUF.map((k) => k.id), "tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "rabenbrief" }, zeilen: ["Du lebst. Und Rotmantel?", "…Zeig mir, was du gefunden hast."], antworten: ["zeigen", ...WAHL.map((w) => w.id), "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Rotmantel ist gefallen, höre ich. Aber der Brief, den er bei sich trug – wo ist er?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["rotmantel"] }, zeilen: ["Rotmantel ist geschlagen? Dann bring mir, was er bei sich hatte. Alles."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["karte"] }, zeilen: ["In drei Tagen, sagst du? Weidenhain, rot angekreuzt?", "Dann haben wir keine drei Tage. Geh."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["gesa"] }, zeilen: ["Gesa hält den Ausgang. Gut. Dann kommt keiner raus, der nicht raus soll."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Gesa Brandt wartet an der Hütte in der Westmark. Sie und zwei ihrer Leute halten dir den Rücken frei."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gehe hinab. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Ich hab keine Soldaten. Aber ich hab dich – und Gesa Brandt aus der Waldmark. Sie wartet mit zwei Wachen an der Hütte.",
          "Unter den Fässern ist das Loch, das du gefunden hast. Die Wachstube, dahinter das Beutelager, die Versammlungshalle. Und irgendwo ganz hinten: Rotmantel.", "Komm zurück. Das ist ein Befehl, auch wenn ich keine geben darf."] } }] },
        { id: "wacht", text: "Rotmantel war bei der Wacht?", folge: [
          { wenn: FERTIG, f: { weiter: true, zeilen: ["Einer der Letzten. Als die Wacht zerfiel, sind manche nach Hause gegangen. Er nicht.", "Und jetzt wissen wir, wem er am Ende gedient hat. Einem Raben."] } },
          { f: { weiter: true, zeilen: ["Einer der Letzten. Als die Wacht zerfiel, sind manche nach Hause gegangen, manche in die Städte.", "Er ist geblieben. Nur auf der anderen Seite."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Ich verstehe. Aber wart nicht zu lange. Er wartet auch nicht."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "zeigen", text: "Den Brief und die Silberleuchter zeigen.", wenn: { hat: "rabenbrief" }, folge: [{ f: { weiter: true, zeilen: [
          "Othmar bricht das Siegel nicht – es ist schon gebrochen. Ein Rabe, in schwarzes Wachs gedrückt.", "„Für jeden Splitter, den ihr bringt, eine Feder. Die Insel wartet. – Der Oberste.“",
          "Er legt den Brief auf den Tisch, ganz langsam. Dann die Leuchter daneben.", "In Rotmantels Kammer lagen Waffen, sagt Gesa. Gute Waffen. Such dir eine aus – du hast sie dir verdient."] } }] },
        ...WAHL.map((w) => ({ id: w.id, text: w.text, wenn: { ...LAEUFT, alle: true, hat: "rabenbrief" }, folge: [{ f: abschluss(w) }] })),
        ...KAUF,
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege. Und pass auf dich auf."] } }] },
      ],
    },
    gesa_huette: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["gesa"] }, zeilen: ["Da bist du ja. Othmar hat dich geschickt?", "Wir halten den Ausgang. Was rauskommt, kommt nicht weit."], antworten: ["bereit", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Rotmantel. Hätte nicht gedacht, dass ich den Namen noch mal höre. Und noch weniger, dass jemand ihn erledigt.", "Gut gemacht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["rotmantel"] }, zeilen: ["Du bist wieder oben. Und Rotmantel nicht. Gut.", "Ab zu Othmar. Wir räumen hier auf."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Wir halten den Ausgang. Unten bist du allein.", "Die Armbrustschützen zuerst. Die Schläger sind langsam."], antworten: ["tschuess"] },
        { zeilen: ["Wachdienst. Weiter."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "bereit", text: "Ich bin bereit.", folge: [{ f: { erledige: ["gesa"], zeilen: ["Gut. Unter den Fässern geht's runter.", "In der Wachstube sitzen Schläger und Armbrustschützen. Einer hat den Schlüssel zum Beutelager – such ihn.",
          "Und wenn du Rotmantel siehst: Er schlägt rundum, wenn's um ihn rot wird. Dann raus da. Nicht heldenhaft sein. Lebendig sein.", "In seine Kammer gehst du allein. Wir halten dir hier den Rücken frei."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Augen auf."] } }] },
      ],
    },
  },
  /* Schlüsselbund und Rabenbrief nur, solange sie fehlen (Rolle Spiel: Schlüsselbund vom Wachstubenführer, Rabenbrief garantiert von Rotmantel in der Quest-Instanz) */
  beute: { b4_schluessel: { erledigt: ["gesa"], offen: ["schluessel"] }, b4_rabenbrief: { erledigt: ["halle"], offen: ["brief"] } },
  /* Die Tür zum Beutelager ist je Spieler offen mit dem Schlüssel (oder danach); die Kammer ist für die Quest eine Instanz, danach Rotmantel öffentlich */
  schalter: { beutelager_offen: [FERTIG, { erledigt: ["schluessel"] }], rotmantel_instanz: LAEUFT, rotmantel_oeffentlich: FERTIG, rotmantel_kammer_offen: [FERTIG, { erledigt: ["halle"] }],
    /* die Halle ist für die Quest eine eigene Kopie mit zwei Wellen (shared/bosse.ts), solange der Schritt offen ist */ unterschlupf_halle: { phase: ["laeuft"], erledigt: ["schluessel"], offen: ["halle"] } },
  glueckwunsch: "Rotmantel ist geschlagen. Weidenhain schläft ruhig – und du hast dir das verdient.",
  belohnungText: "Belohnung: je 1.000 XP Stärke, Geschick und Defense, 500 LP-XP, 500 Splitter, eine seltene Waffe nach Wahl, das rote Banner · danach: Rotmantel kehrt als Mini-Boss zurück",
  belohnung: { xp: { staerke: 1000, geschick: 1000, defense: 1000, lp: 500 }, splitter: 500 },
  punkte: 1,
};
