/*
 * Riftmere – Quest H2 „Käse für die Passwacht“ (Phase 11, Hochlande, klein), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, #161). Sennerin Afra auf der Hohen Alm versorgt die Passwacht mit Käse – aber ihre vier Ziegen sind ausgebüxt.
 * Jede Ziege ansprechen („Locken“) – sie folgt dir (QuestFigur.folgt, wie S6) –, am Pferch das Gatter schließen, melken (drei Krüge Ziegenmilch).
 * QUER: Afras Lab ist alle; Mette Heider in Heidrast (Mettes Schafe, E-Block) hat welches. Am Herd der Alm den Käselaib machen (Kochen 45, Rezept kaeselaib, Quest-Rezept),
 * im Käsekeller unter der Käserei reifen lassen (Questobjekt kaeseregal),
 * zur Passwacht tragen (Wächterin Brun). Abgabe bei Afra.
 * Lohn: Kochen 2.000 XP, 300 Splitter, 1 Questpunkt; danach das Käse-Rezept frei (Herd der Alm) und Afras Laden (Schalter afra_laden, Integration #118).
 * Bausteine (Systeme 8f50070c, shared/hochlande.ts): Ziegenmilch, Lab, Käselaib (kaeselaib), Rezept kaeselaib (Herd der Alm, Kochen 45, 3 Ziegenmilch + 1 Lab); Käsekeller mit Regal (Welt, Region kaesekeller).
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
  "Lock sie, dann laufen sie dir nach. Rein in den Pferch, Gatter zu, dann melken.", "Und Lab brauch ich. Meins ist alle. Mette Heider unten in Heidrast hat welches, von ihren Schafen.",
  "Dann den Käse am Herd, und ab damit in den Keller zum Reifen. Und das Rad zur Passwacht, zu Brun. Die frieren da oben, und hungrig sind sie auch."];

export const QUEST_H2: QuestDef = {
  id: H2, titel: "Käse für die Passwacht", ort: "Hohe Alm · Heidrast · Passwacht", start: "Sprich mit Sennerin Afra auf der Hohen Alm.",
  logNeu: "Auf der Hohen Alm ruft eine Sennerin nach ihren Ziegen. Keine antwortet.",
  logAngeboten: "Sennerin Afra auf der Hohen Alm vermisst vier Ziegen – und die Passwacht wartet auf ihren Käse.",
  logAbgabe: "Brun an der Passwacht hat ihren Käse. Sag Afra Bescheid.",
  logFertig: "Afras Ziegen stehen im Pferch, und an der Passwacht gibt es wieder Käse. Afra zeigt jedem, der fragt, wie man einen Käselaib macht.",
  geber: "afra",
  figuren: [AFRA, METTE, BRUN, ...ZIEGE_FIG],
  voraussetzungen: [
    { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H1, phase: ["fertig"] } } },
    { text: "Kochen 45", wenn: { skill: { k: "kochen", min: 45 } } },
  ],
  schritte: [
    ...ZIEGEN.map((id, i) => ({ id, text: "Die entlaufenen Ziegen locken", ereignis: { art: "antwort" as const }, bei: id, gruppe: "ziegen", wo: ALM.ziegen[i],
      log: "Such Afras vier Ziegen auf den Wiesen rund um die Hohe Alm und lock sie zum Pferch ({n:ziegen})." })),
    { id: "gatter", text: "Das Gatter am Pferch schließen", ereignis: { art: "objekt", id: "h2_gatter" }, nach: ZIEGEN, wo: ALM.gatter,
      log: "Alle vier laufen hinter dir. Schließ das Gatter am Pferch hinter ihnen." },
    { id: "melken", text: "Die Ziegen melken", ereignis: { art: "objekt", id: "h2_melken" }, nach: ["gatter"], wo: ALM.gatter,
      log: "Die Ziegen sind im Pferch. Melk sie – drei Krüge Milch braucht Afra für einen Laib." },
    { id: "lab", text: "Lab von Mette Heider holen", ereignis: { art: "antwort" }, bei: "mette",
      log: "Afras Lab ist alle. Mette Heider in Heidrast, die Hirtin in den Fahlen Weiten, hat welches von ihren Schafen." },
    { id: "kaese", text: "Am Herd der Alm einen Käselaib machen", ereignis: { art: "herstellen", rezept: "kaeselaib" }, nach: ["melken", "lab"], wo: ALM.herd,
      log: "Drei Krüge Ziegenmilch und das Lab: Mach am Herd der Alm einen Käselaib (Kochen 45)." },
    { id: "reifen", text: "Den Käse im Keller reifen lassen", ereignis: { art: "objekt", id: "kaeseregal" }, nach: ["kaese"], wo: ALM.regal,
      log: "Unter der Käserei liegt der Käsekeller. Leg deinen Laib ins Regal und nimm dafür einen reifen mit – so macht es Afra immer." },
    { id: "brun", text: "Den Käse zur Passwacht bringen", ereignis: { art: "antwort" }, nach: ["reifen"], bei: "brun",
      log: "Bring den Käselaib zu Wächterin Brun an die Passwacht am Hochpass." },
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
      braucht: { wenn: { hat: "kaeselaib" }, text: "Ohne eigenen Käse nimmst du hier besser nichts weg. Afra zählt die Laibe." },
      text: "Du legst deinen Laib ins Regal, ganz unten, wo es kühl ist. Dafür nimmst du einen von oben – reif, mit harter Rinde. Afra wird es nicht merken. Afra merkt alles.",
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
        { wenn: FERTIG, zeilen: ["Die Gretl steht wieder auf dem Dach vom Stall. Aber sie kommt runter, wenn ich ruf. Meistens.", "Den Käse kannst du jetzt selbst. Am Herd, wann du willst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Brun hat ihren Käse? Und was hat sie gesagt? …Nichts? Das heißt bei der: sehr gut."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["reifen"] }, zeilen: ["Ein reifer Laib aus dem Keller! Jetzt rauf damit zur Passwacht, zu Brun."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kaese"] }, zeilen: ["Schön ist er geworden! Aber frischer Käse ist nichts für Wächter. Runter in den Keller damit – leg ihn ins Regal und nimm einen reifen mit."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["melken", "lab"] }, zeilen: ["Milch und Lab! Dann an den Herd. Langsam warm werden lassen, nicht kochen – sonst wird's Gummi."], antworten: ["milch_neu", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["melken"] }, zeilen: ["Drei Krüge, sauber. Jetzt fehlt noch das Lab von Mette."], antworten: ["milch_neu", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ZIEGEN }, zeilen: ["Alle vier hinter dir! Rein in den Pferch, Gatter zu!"], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Resi, Hansi, die Schecke und die Gretl. Irgendwo da draußen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole deine Ziegen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Du bist ein Engel! Ein Engel mit Stiefeln.",
          "Halt ihnen Gras hin, dann laufen sie dir nach. Und dann rein in den Pferch.", "Lab brauch ich auch noch. Meins ist alle – Mette Heider in Heidrast hat welches. Sag, Afra schickt dich."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann ruf ich halt weiter. Resi! …Siehst du."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "milch_neu", text: "Der Käse ist mir verdorben. Hast du noch Milch?", wenn: { erledigt: ["melken"], offen: ["kaese"] }, folge: [
          { wenn: { anzahl: { g: "ziegenmilch", min: 3 }, hat: "lab" }, f: { weiter: true, zeilen: ["Du hast doch noch drei Krüge und das Lab! Ab an den Herd."] } },
          { f: { weiter: true, geben: [{ g: "ziegenmilch", name: "Ziegenmilch" }, { g: "ziegenmilch", name: "Ziegenmilch" }, { g: "ziegenmilch", name: "Ziegenmilch" }, { g: "lab", name: "Lab", fehlt: true }],
            zeilen: ["Verdorben? Zu heiß gemacht, was? Wie ich. Wie Mette sagt.", "Afra füllt drei Krüge aus der Kanne im Keller und kratzt den letzten Rest Lab aus dem Topf. Diesmal langsam. Und nicht rühren!"] } }] },
        { id: "fertig", text: "Die Passwacht hat ihren Käse.", folge: [{ f: { abschluss: true, zeilen: ["Afra drückt dich, dass dir die Luft wegbleibt.",
          "Jetzt weißt du, wie's geht. Der Herd da steht dir offen, wann immer du Milch hast. Und mein Laden auch – für dich zum halben Ärger."] } }] },
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
        { id: "lab_holen", text: "Afra von der Hohen Alm schickt mich. Sie braucht Lab für ihren Käse.", folge: [{ f: { erledige: ["lab"], geben: [{ g: "lab", name: "Lab" }],
          zeilen: ["Afra? Die lebt noch da oben? …Natürlich lebt sie. Die überlebt uns alle.", "Mette kramt in einem Tontopf und reicht dir ein Säckchen. Riecht streng.",
          "Lab, vom Lamm. Für einen Laib reicht's. Und sag ihr: langsam warm werden lassen, nicht rühren. Und dass sie mir ein Rad schuldet."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Halt den Wind im Rücken."] } }] },
      ],
    },
    brun: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["reifen"], offen: ["brun"], hat: "kaeselaib" }, zeilen: ["Halt. Was trägst du da? …Das riecht nach Alm."], antworten: ["kaese_geben", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["reifen"], offen: ["brun"] }, zeilen: ["Afra schickt dich? Und wo ist der Käse?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["brun"] }, zeilen: ["Sag Afra danke. Und dass Ansgar die Rinde mitgegessen hat."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Käse ist alle. Aber Afra schickt nächste Woche wieder einen. Hat sie gesagt."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Hinter dem Pass beginnt die Kälte. Wer weitergeht, tut es auf eigene Gefahr."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "kaese_geben", text: "Käse von Afra. Für die Passwacht.", wenn: { hat: "kaeselaib" }, folge: [{ f: { erledige: ["brun"], nehmen: [{ g: "kaeselaib" }],
          zeilen: ["Brun nimmt den Laib mit beiden Händen, wie etwas Zerbrechliches.", "Seit drei Wochen Brot und Schnee. …Danke. Sag Afra danke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bleib auf dem Weg."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    kaeselaib: [{ wenn: NEU, text: "Wie man Käse macht, zeigt dir Afra auf der Hohen Alm." }, { wenn: { ...LAEUFT, erledigt: ["kaese"] }, text: "Den Käse für die Passwacht hast du schon." },
      { wenn: { ...LAEUFT, offen: ["melken"] }, text: "Erst brauchst du Milch. Die Ziegen sind noch nicht gemolken." }],
  } },
  schalter: { afra_laden: FERTIG },
  glueckwunsch: "Brun hat gelächelt? Dann hast du ein Wunder vollbracht. Pfiat di, und komm wieder!",
  belohnungText: "Belohnung: Kochen 2.000 XP, 300 Splitter · danach: Käselaibe am Herd selbst machen, Afras Laden auf der Hohen Alm",
  belohnung: { berufe: { kochen: 2000 }, splitter: 300 },
  punkte: 1,
};
