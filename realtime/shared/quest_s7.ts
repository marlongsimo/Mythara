/*
 * Riftmere – Quest S7 „Licht am Kreuzstein“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Pilgerin Odila an der Wegkapelle am Kreuzstein: Die Kapelle ist dunkel, seit ihr Licht erlosch.
 * Drei Wiesenlichter einfangen (Splitterbinden 10), QUER: Agnes in Weidenhain gibt den Segen, die Kapelle weihen → Heilstelle (Schalter kreuzstein_heil, wie die Kapelle in A2).
 * Lohn: Splitterbinden 400 XP, 3 Seelenlichter, 60 Splitter, 1 Questpunkt.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf die Wegkapelle mit Wiesenlichtern (Welt #120), Odila (Figuren #121), Heilstelle kreuzstein (Systeme). Liste: doku/quests/s-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { KREUZSTEIN, ODILA, AGNES } from "./quest_s_orte";

export const S7 = "kreuzstein_licht_am_kreuzstein";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Drei Lichter. Sie schweben über der Wiese hinter dem Stein, wenn es still ist.",
  "Agnes an der Linde in Weidenhain hat die Kapelle damals geweiht. Ohne ihren Segen bleibt das Licht nicht.", "Dann die Lichter in die Schale am Kreuzstein."];

export const QUEST_S7: QuestDef = {
  id: S7, titel: "Licht am Kreuzstein", ort: "Wegkapelle am Kreuzstein · Weidenhain", start: "Sprich mit der Pilgerin Odila an der Wegkapelle am Kreuzstein.",
  logNeu: "An der Kreuzung der Südstraße steht eine kleine Kapelle. Eine Pilgerin kniet davor, obwohl drinnen kein Licht brennt.",
  logAngeboten: "Die Pilgerin Odila am Kreuzstein will die Kapelle wieder erleuchten.",
  logAbgabe: "Die Kapelle leuchtet. Sag Odila Bescheid.",
  logFertig: "In der Wegkapelle am Kreuzstein brennt wieder Licht. Wer dort rastet, kommt heil weiter.",
  geber: "odila",
  figuren: [ODILA, AGNES],
  voraussetzungen: [{ text: "Splitterbinden 10", wenn: { skill: { k: "splitterbinden", min: 10 } } }],
  schritte: [
    { id: "lichter", text: "Drei Wiesenlichter einfangen", ereignis: { art: "sammeln", ziel: "wiese" }, anzahl: 3, wo: KREUZSTEIN.lichter,
      log: "Fang auf der Wiese hinter dem Kreuzstein drei Wiesenlichter ({n:lichter})." },
    { id: "segen", text: "Agnes um den Segen bitten", ereignis: { art: "antwort" }, bei: "agnes", wo: "agnes",
      log: "Bitte Agnes an der Linde in Weidenhain um ihren Segen für die Kapelle am Kreuzstein." },
    { id: "weihen", text: "Die Kapelle weihen", ereignis: { art: "objekt", id: "s7_schale" }, nach: ["lichter", "segen"], wo: KREUZSTEIN.stein,
      log: "Leg drei Seelenlichter in die Schale am Kreuzstein." },
  ],
  objekte: [
    { id: "s7_schale", name: "Schale am Kreuzstein", x: KREUZSTEIN.stein[0], y: KREUZSTEIN.stein[1], modell: "stelle", tat: "benutzen", tatText: "Die Lichter hineinlegen", weit: 3,
      braucht: { wenn: { anzahl: { g: "seelenlicht", min: 3 } }, text: "Eine leere Steinschale. Drei Seelenlichter passen hinein." }, nehmen: [{ g: "seelenlicht", n: 3 }],
      text: "Die Lichter sinken in die Schale – und steigen wieder, langsam, bis unter das Dach. Die Kapelle atmet auf.",
      schon: "Die Lichter schweben unter dem Dach.", sonst: [{ wenn: NEU, text: "Eine leere Steinschale." }, { wenn: FERTIG, text: "Die Lichter schweben unter dem Dach." },
        { wenn: { offen: ["segen"] }, text: "Ohne Segen halten die Lichter nicht. Agnes in Weidenhain." }] },
  ],
  /* Odila: leise, feierlich, spricht in kurzen Gebeten. Agnes: warm, praktisch, die gute Seele von Weidenhain. */
  dialoge: {
    odila: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Sieh. Dunkel. Seit dem Winter.", "Wer hier rastet, soll heil weitergehen. Das war das Versprechen dieser Kapelle."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Friede auf deinem Weg."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Es brennt. Ruh dich aus, wenn du müde bist."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Licht. Endlich wieder Licht."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["lichter", "segen"] }, zeilen: ["Gesegnet und gesammelt. In die Schale, bitte."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["segen"] }, zeilen: ["Agnes hat gesegnet? Dann fehlen nur die Lichter."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["lichter"] }, zeilen: ["Drei Lichter. Schön. Doch ohne Segen verlöschen sie. Agnes, in Weidenhain."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Hinter dem Stein, auf der Wiese. Wenn es still ist."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe das Licht zurück. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Danke.", "Drei Lichter von der Wiese. Und den Segen von Agnes, in Weidenhain."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Ich warte. Das kann ich."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Die Kapelle leuchtet wieder.", folge: [{ f: { abschluss: true, zeilen: ["Odila steht auf. Ihre Knie knacken.",
          "Friede auf deinem Weg. Und Licht. Hier, nimm ein paar mit."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Friede auf deinem Weg."] } }] },
      ],
    },
    agnes: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["segen"] }, zeilen: ["Setz dich. Der Kreuzstein? Die Kapelle haben wir mit Blüten von dieser Linde geweiht. Damals, als ich jung war.", "Ist sie dunkel?"], antworten: ["segen_bitten", "tschuess"] },
        { zeilen: ["Setz dich, setz dich."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "segen_bitten", text: "Gib mir deinen Segen für die Kapelle.", folge: [{ f: { erledige: ["segen"],
          zeilen: ["Agnes pflückt eine Lindenblüte und legt sie dir in die Hand. „Die gehört in die Schale. Dann hält das Licht.“", "Grüß Odila. Sie betet zu viel und isst zu wenig."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Die Linde wartet. Ich auch."] } }] },
      ],
    },
  },
  schalter: { kreuzstein_heil: FERTIG },
  belohnungText: "Belohnung: Splitterbinden 400 XP, 3 Seelenlichter, 60 Splitter · danach: Heilstelle in der Kapelle am Kreuzstein",
  belohnung: { berufe: { splitterbinden: 400 }, splitter: 60, gegenstaende: [{ g: "seelenlicht", n: 3 }] },
  punkte: 1,
};
