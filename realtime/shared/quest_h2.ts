/*
 * Riftmere – Quest H2 „Käse für die Passwacht“ (Phase 11, Hochlande, klein), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, #161). Sennerin Afra auf der Hohen Alm versorgt die Passwacht mit Käse – aber ihre vier Ziegen sind ausgebüxt.
 * Jede Ziege ansprechen („Locken“) – sie folgt dir (QuestFigur.folgt, wie S6) –, am Pferch das Gatter schließen, melken (drei Krüge Ziegenmilch).
 * QUER: Mette Heider in Heidrast (Mettes Schafe, E-Block) kennt den Kniff, damit der Käse fest wird. Am Käsekessel der Sennerin den Almkäse machen (Kochen 40, Rezept kaeserad, Quest-Rezept),
 * im Käsekeller unter der Käserei reifen lassen (Questobjekt kaeseregal),
 * zur Passwacht tragen (Wächterin Brun). Abgabe bei Afra.
 * Lohn: Kochen 2.000 XP, 300 Splitter, 1 Questpunkt; danach das Käse-Rezept frei (Käsekessel der Alm) und Afras Laden (Schalter afra_laden, Integration #118).
 * Bausteine (Systeme 8f50070c, shared/hochlande.ts): Ziegenmilch, Almkäse (kaeserad), Rezept kaeserad (Käsekessel kessel_alm, Kochen 40, 3 Ziegenmilch); Käsekeller mit Regal (Welt, Region kaesekeller).
 */
import type { QuestDef, Bed, QuestFigur, Option, Rede } from "./questbau";
import { AFRA, METTE, BRUN, ALM } from "./quest_h_orte";
import { H_QUESTS } from "./hochlande";
import { H1 } from "./quest_h1";

export const H2 = H_QUESTS.h2;
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ZIEGEN = ["ziege_1", "ziege_2", "ziege_3", "ziege_4"];
const NAMEN = ["Resi", "Hansi", "die Schecke", "Gretl"];
const LOCKEN = [`${NAMEN[0]} meckert, als hätte sie auf dich gewartet. Dann kommt sie.`, `${NAMEN[1]} rammt dir den Kopf gegen das Knie. Das heißt wohl ja.`,
  `${NAMEN[2]} kaut weiter, als sähe sie dich nicht. Dann trottet sie doch nach.`, `${NAMEN[3]} springt von einem Felsen und landet neben dir. Sie folgt dir, aber nur, weil sie will.`];
const ZIEGE_FIG: QuestFigur[] = ZIEGEN.map((id, i) => { const [x, y] = ALM.ziegen[i];
  return { id, name: `Ziege (${NAMEN[i]})`, modell: "ziege3d", x, y, blick: [0, 1], folgt: { wenn: { erledigt: [id], offen: ["gatter"] }, abstand: 1.5 + i * 0.6 },
    beiseite: { wenn: { erledigt: ["gatter"] }, dx: ALM.pferch_ziegen[i][0] - x, dy: ALM.pferch_ziegen[i][1] - y, blick: [0, 1] } }; });
const HILFE = ["Vier sind's. Resi, Hansi, die Schecke und die Gretl. Irgendwo auf den Wiesen rund um die Alm, die Luder.",
  "Lock sie, dann laufen sie dir nach. Rein in den Pferch, Gatter zu, dann melken.", "Und frag Mette Heider unten in Heidrast, wie sie ihren Käse fest kriegt. Meiner wird seit Wochen nichts. Die weiß einen Kniff.",
  "Dann den Käse am Kessel, und ab damit in den Keller zum Reifen. Und das Rad zur Passwacht, zu Brun. Die frieren da oben, und hungrig sind sie auch."];

export const QUEST_H2: QuestDef = {
  id: H2, titel: "Käse für die Passwacht", ort: "Hohe Alm · Heidrast · Passwacht", start: "Sprich mit Sennerin Afra auf der Hohen Alm.",
  logNeu: "Auf der Hohen Alm ruft eine Sennerin nach ihren Ziegen. Keine antwortet.",
  logAngeboten: "Sennerin Afra auf der Hohen Alm vermisst vier Ziegen – und die Passwacht wartet auf ihren Käse.",
  logAbgabe: "Brun an der Passwacht hat ihren Käse. Sag Afra Bescheid.",
  logFertig: "Afras Ziegen stehen im Pferch, und an der Passwacht gibt es wieder Käse. Afra zeigt jedem, der fragt, wie man ein Rad Almkäse macht.",
  geber: "afra",
  figuren: [AFRA, METTE, BRUN, ...ZIEGE_FIG],
  voraussetzungen: [
    { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H1, phase: ["fertig"] } } },
    { text: "Kochen 40", wenn: { skill: { k: "kochen", min: 40 } } },
  ],
  schritte: [
    ...ZIEGEN.map((id, i) => ({ id, text: "Die entlaufenen Ziegen locken", ereignis: { art: "antwort" as const }, bei: id, gruppe: "ziegen", wo: ALM.ziegen[i],
      log: "Such Afras vier Ziegen auf den Wiesen rund um die Hohe Alm und lock sie zum Pferch ({n:ziegen})." })),
    { id: "gatter", text: "Das Gatter am Pferch schließen", ereignis: { art: "objekt", id: "h2_gatter" }, nach: ZIEGEN, wo: ALM.gatter,
      log: "Alle vier laufen hinter dir. Schließ das Gatter am Pferch hinter ihnen." },
    { id: "melken", text: "Die Ziegen melken", ereignis: { art: "objekt", id: "h2_melken" }, nach: ["gatter"], wo: ALM.gatter,
      log: "Die Ziegen sind im Pferch. Melk sie – drei Krüge Milch braucht Afra für ein Rad Almkäse." },
    { id: "lab", text: "Mette Heider nach ihrem Käse-Kniff fragen", ereignis: { art: "antwort" }, bei: "mette",
      log: "Afras Käse wird seit Wochen nicht fest. Mette Heider in Heidrast, die Hirtin in den Fahlen Weiten, weiß einen Kniff." },
    { id: "kaese", text: "Am Käsekessel einen Almkäse machen", ereignis: { art: "herstellen", rezept: "kaeserad" }, nach: ["melken", "lab"], wo: ALM.kessel,
      log: "Drei Krüge Ziegenmilch und Mettes Kniff: Mach am Käsekessel der Sennerin ein Rad Almkäse (Kochen 40)." },
    { id: "reifen", text: "Den Käse im Keller reifen lassen", ereignis: { art: "objekt", id: "kaeseregal" }, nach: ["kaese"], wo: ALM.regal,
      log: "Unter der Käserei liegt der Käsekeller. Leg dein Rad ins Regal und nimm dafür ein reifes mit – so macht es Afra immer." },
    { id: "brun", text: "Den Käse zur Passwacht bringen", ereignis: { art: "antwort" }, nach: ["reifen"], bei: "brun",
      log: "Bring den Almkäse zu Wächterin Brun an die Passwacht am Hochpass." },
  ],
  objekte: [
    { id: "h2_gatter", name: "Gatter am Pferch", x: ALM.gatter[0], y: ALM.gatter[1], modell: "stelle", tat: "benutzen", tatText: "Das Gatter schließen", weit: 3,
      braucht: { wenn: { erledigt: ZIEGEN }, text: "Noch nicht alle da. Afra zählt mit – laut." },
      text: "Vier Ziegen drängen durch das Gatter, eine meckert dich noch einmal an. Du legst den Riegel vor.", schon: "Das Gatter ist zu.",
      sonst: [{ wenn: NEU, text: "Ein Gatter, das offen steht. Im Pferch stehen nur Schafe." }, { wenn: FERTIG, text: "Das Gatter ist zu. Die Ziegen kauen." }, { wenn: { offen: ["gatter"] }, text: "Noch nicht alle da." }] },
    { id: "h2_melken", name: "Melkschemel", x: ALM.gatter[0], y: ALM.gatter[1], modell: "stelle", tat: "benutzen", tatText: "Die Ziegen melken", weit: 3,
      braucht: { wenn: { erledigt: ["gatter"] }, text: "Erst müssen die Ziegen im Pferch sein." },
      geben: [{ g: "ziegenmilch", n: 3 }],
      text: "Resi hält still, Hansi nicht. Nach einer Weile hast du drei Krüge voll Milch – und Milch im Ärmel.", schon: "Die Ziegen sind gemolken.",
      sonst: [{ wenn: NEU, text: "Ein Melkschemel, umgekippt." }, { wenn: FERTIG, text: "Die Ziegen sind gemolken." }] },
    { id: "kaeseregal", name: "Käseregal", x: ALM.regal[0], y: ALM.regal[1], modell: "stelle", tat: "benutzen", tatText: "Den Käse ins Regal legen", weit: 2.5,
      braucht: { wenn: { hat: "kaeserad" }, text: "Ohne eigenen Käse nimmst du hier besser nichts weg. Afra zählt die Räder." },
      text: "Du legst dein Rad ins Regal, ganz unten, wo es kühl ist. Dafür nimmst du eins von oben – reif, mit harter Rinde. Afra wird es nicht merken. Afra merkt alles.",
      schon: "Dein Rad reift im Regal.", sonst: [{ wenn: NEU, text: "Die Regale mit den Käselaiben. Manche brauchen noch Wochen." }, { wenn: FERTIG, text: "Die Regale mit den Käselaiben. Eins davon ist deins." },
        { wenn: { offen: ["kaese"] }, text: "Die Regale mit den Käselaiben. Erst brauchst du einen eigenen." }] },
  ],
  /* Afra: herzlich, laut, schimpft auf ihre Ziegen und liebt sie. Brun: Passwächterin, ernst, friert, freut sich still. Mette: trocken, redet lieber mit Schafen. */
  dialoge: {
    ...Object.fromEntries(ZIEGEN.map((id, i) => [id, {
      reden: [
        { wenn: { ...LAEUFT, offen: [id] }, zeilen: ["Mähähä."], antworten: ["locken"] } as Rede,
        { wenn: { ...LAEUFT, offen: ["gatter"] }, zeilen: [`${NAMEN[i]} läuft dir nach und knabbert an deinem Mantel.`], antworten: ["tschuess"] } as Rede,
        { zeilen: ["Mähähä."], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: "locken", text: "Locken. (Eine Handvoll Gras hinhalten)", folge: [{ f: { erledige: [id], zeilen: [LOCKEN[i] + " ({n:ziegen})"] } }] } as Option,
        { id: "tschuess", text: "Weitergehen.", folge: [{ f: { zeilen: ["Mähähä."] } }] } as Option,
      ],
    }])),
    afra: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Resi! Hansi! …Nichts. Die Luder.", "Vier Ziegen sind mir durch den Zaun. Und die Passwacht wartet auf ihren Käse. Ohne Milch kein Käse, ohne Ziegen keine Milch."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Grüß dich! Frische Milch, Käse im Rad – aber erst, wenn die Ziegen wieder da sind."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Gretl steht wieder auf dem Dach vom Stall. Aber sie kommt runter, wenn ich ruf. Meistens.", "Den Käse kannst du jetzt selbst. Am Kessel, wann du willst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Brun hat ihren Käse? Und was hat sie gesagt? …Nichts? Das heißt bei der: sehr gut."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["reifen"] }, zeilen: ["Ein reifes Rad aus dem Keller! Jetzt rauf damit zur Passwacht, zu Brun."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kaese"] }, zeilen: ["Schön ist er geworden! Aber frischer Käse ist nichts für Wächter. Runter in den Keller damit – leg ihn ins Regal und nimm ein reifes mit."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["melken", "lab"] }, zeilen: ["Milch und Mettes Kniff! Dann an den Kessel. Langsam warm werden lassen, nicht kochen – sonst wird's Gummi."], antworten: ["milch_neu", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["melken"] }, zeilen: ["Drei Krüge, sauber. Und was sagt Mette? Frag sie, bevor du an den Kessel gehst."], antworten: ["milch_neu", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ZIEGEN }, zeilen: ["Alle vier hinter dir! Rein in den Pferch, Gatter zu!"], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Resi, Hansi, die Schecke und die Gretl. Irgendwo da draußen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole deine Ziegen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du bist ein Engel! Ein Engel mit Stiefeln.",
          "Halt ihnen Gras hin, dann laufen sie dir nach. Und dann rein in den Pferch.", "Und frag Mette Heider in Heidrast nach ihrem Kniff. Mein Käse wird nicht mehr fest. Sag, Afra schickt dich."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann ruf ich halt weiter. Resi! …Siehst du."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "milch_neu", text: "Der Käse ist mir verdorben. Hast du noch Milch?", wenn: { erledigt: ["melken"], offen: ["kaese"] }, folge: [
          { wenn: { anzahl: { g: "ziegenmilch", min: 3 } }, f: { weiter: true, zeilen: ["Du hast doch noch drei Krüge! Ab an den Kessel."] } },
          { f: { weiter: true, geben: [{ g: "ziegenmilch", name: "Ziegenmilch" }, { g: "ziegenmilch", name: "Ziegenmilch" }, { g: "ziegenmilch", name: "Ziegenmilch" }],
            zeilen: ["Verdorben? Zu heiß gemacht, was? Wie ich. Wie Mette sagt.", "Afra füllt drei Krüge aus der Kanne im Keller. Diesmal langsam. Und nicht rühren!"] } }] },
        { id: "fertig", text: "Die Passwacht hat ihren Käse.", folge: [{ f: { abschluss: true, zeilen: ["Afra drückt dich, dass dir die Luft wegbleibt.",
          "Jetzt weißt du, wie's geht. Der Kessel da steht dir offen, wann immer du Milch hast. Und mein Laden auch – für dich zum halben Ärger."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Pfiat di!"] } }] },
      ],
    },
    mette: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["lab"] }, zeilen: ["Schon wieder du. Diesmal nicht wegen Wölfen?", "Was willst du?"], antworten: ["lab_holen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["lab"] }, zeilen: ["Grüß Afra. Und sag ihr, ihre Ziegen sind Schafe ohne Verstand."], antworten: ["tschuess"] },
        { zeilen: ["Na. Die Schafe grüßen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "lab_holen", text: "Afra von der Hohen Alm schickt mich. Ihr Käse wird nicht fest.", folge: [{ f: { erledige: ["lab"],
          zeilen: ["Afra? Die lebt noch da oben? …Natürlich lebt sie. Die überlebt uns alle.", "Nicht fest? Dann macht sie die Milch zu heiß. Wie immer.",
          "Langsam warm werden lassen, so warm wie eine Hand. Dann still stehen lassen und nicht rühren. Nicht rühren! Sag ihr das. Und dass sie mir ein Rad schuldet."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Halt den Wind im Rücken."] } }] },
      ],
    },
    brun: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["reifen"], offen: ["brun"], hat: "kaeserad" }, zeilen: ["Halt. Was trägst du da? …Das riecht nach Alm."], antworten: ["kaese_geben", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["reifen"], offen: ["brun"] }, zeilen: ["Afra schickt dich? Und wo ist der Käse?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["brun"] }, zeilen: ["Sag Afra danke. Und dass Ansgar die Rinde mitgegessen hat."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Käse ist alle. Aber Afra schickt nächste Woche wieder einen. Hat sie gesagt."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Hinter dem Pass beginnt die Kälte. Wer weitergeht, tut es auf eigene Gefahr."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "kaese_geben", text: "Käse von Afra. Für die Passwacht.", wenn: { hat: "kaeserad" }, folge: [{ f: { erledige: ["brun"], nehmen: [{ g: "kaeserad" }],
          zeilen: ["Brun nimmt das Rad mit beiden Händen, wie etwas Zerbrechliches.", "Seit drei Wochen Brot und Schnee. …Danke. Sag Afra danke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bleib auf dem Weg."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    kaeserad: [{ wenn: NEU, text: "Wie man Käse macht, zeigt dir Afra auf der Hohen Alm." }, { wenn: { ...LAEUFT, erledigt: ["kaese"] }, text: "Den Käse für die Passwacht hast du schon." },
      { wenn: { ...LAEUFT, offen: ["melken"] }, text: "Erst brauchst du Milch. Die Ziegen sind noch nicht gemolken." }],
  } },
  schalter: { afra_laden: FERTIG },
  glueckwunsch: "Brun hat gelächelt? Dann hast du ein Wunder vollbracht. Pfiat di, und komm wieder!",
  belohnungText: "Belohnung: Kochen 2.000 XP, 300 Splitter · danach: Almkäse am Käsekessel selbst machen, Afras Laden auf der Hohen Alm",
  belohnung: { berufe: { kochen: 2000 }, splitter: 300 },
  punkte: 1,
};
