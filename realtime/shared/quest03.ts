/*
 * Mythara – Quest 03 „Der Säbel des Waldgottes“ (Nordwald, 25.11.2026): Einführung in die Berufe. Der Förster Hartwig schickt den Spieler
 * den Baum des Waldgottes fällen (Holzfällerei), den Waldstein abbauen (Bergbau), ihn an der Esse schmelzen und am Amboss mit dem Holz
 * zum Waldsäbel schmieden (Handwerk). Jeder Schritt gibt die XP seines Berufs; der Lohn ist der Säbel selbst (shared/gegenstaende.ts waldsaebel).
 * Nebenbei erzählt der Förster, was die Splitter sind: Scherben, die Wesen verändern und stärker machen – nicht besser.
 * Stand (Migration 045, rpg_held.quests): "" · "auftrag_N" (N Bitmaske: 1 Holz, 2 Erz, 4 Barren, 8 Säbel) · "fertig".
 */
import type { Zeile, Antwort } from "./quest01";

export const Q3 = "nordwald_waldsaebel";
export type Stand3 = string;
export const HOLZ = 1, ERZ = 2, BARREN = 4, SAEBEL = 8;
export interface Lage3 { phase: "" | "auftrag" | "fertig"; bits: number }
export function lage3(s: Stand3): Lage3 { const m = /^auftrag_([0-9]|1[0-5])$/.exec(s || ""); if (m) return { phase: "auftrag", bits: Number(m[1]) }; return s === "fertig" ? { phase: "fertig", bits: 15 } : { phase: "", bits: 0 }; }
export const stand3 = (l: Lage3): Stand3 => (l.phase === "auftrag" ? `auftrag_${l.bits}` : l.phase);
export const gueltig3 = (s: unknown): Stand3 => (typeof s === "string" && (s === "" || stand3(lage3(s)) === s) ? s : "");
export const laeuft3 = (s: Stand3): boolean => lage3(s).phase === "auftrag";
/** Werkzeug, das der Förster beim Annehmen gibt, wenn man es nicht hat */
export const WERKZEUG3 = ["holzbeil_training", "spitzhacke_training", "hammer"];

/* ---------- Figur und Orte (Weltfelder; Nordwald 6272/6336) ---------- */
export interface QuestNpc3 { id: "foerster"; name: string; modell: string; x: number; y: number; blick: [number, number] }
export const NPCS3: QuestNpc3[] = [{ id: "foerster", name: "Förster Hartwig", modell: "npc.foerster", x: 6362.5, y: 6452.5, blick: [0, 1] }];
export const npc3 = (id: string): QuestNpc3 | undefined => NPCS3.find((n) => n.id === id);
export const BAUM3: [number, number] = [6350.5, 6442.5], STEIN3: [number, number] = [6370.5, 6440.5];

/** Questlog: was als Nächstes zu tun ist */
export function questlog3(s: Stand3): string { const l = lage3(s);
  if (l.phase === "") return "Förster Hartwig steht am Waldweg, gleich westlich der Waldmark, wo der Nordwald beginnt. Er sucht jemanden, der ihm hilft.";
  if (l.phase === "fertig") return "Du hast den Waldsäbel geschmiedet. Er trifft, was die Splitter verändert haben, härter – Waldgolems und Mooshocker.";
  if (!(l.bits & HOLZ) || !(l.bits & ERZ)) return `Fälle den Baum des Waldgottes nordwestlich des Försters${l.bits & HOLZ ? " (erledigt)" : ""} und schlag ein Stück vom Waldstein nordöstlich von ihm ab${l.bits & ERZ ? " (erledigt)" : ""}.`;
  if (!(l.bits & BARREN)) return "Schmilz den Waldstein an der Esse in der Schmiede der Waldmark zu einem Barren.";
  if (!(l.bits & SAEBEL)) return "Schmiede am Amboss aus dem Waldsteinbarren und dem Holz des Waldgottes den Waldsäbel. Ein Hammer muss im Rucksack sein.";
  return "Der Waldsäbel ist fertig. Zeig ihn Förster Hartwig am Waldweg westlich der Waldmark."; }
export const SCHRITTE3: { text: string; bit: number }[] = [{ text: "Den Baum des Waldgottes fällen", bit: HOLZ }, { text: "Den Waldstein abbauen", bit: ERZ },
  { text: "Den Waldstein an der Esse schmelzen", bit: BARREN }, { text: "Am Amboss den Waldsäbel schmieden", bit: SAEBEL }];
/** Wohin der Pfeil zeigt */
export function ziel3(s: Stand3, esse: [number, number], amboss: [number, number]): "foerster" | [number, number] | null { const l = lage3(s);
  if (l.phase === "") return "foerster"; if (l.phase === "fertig") return null;
  if (!(l.bits & HOLZ)) return BAUM3; if (!(l.bits & ERZ)) return STEIN3; if (!(l.bits & BARREN)) return esse; if (!(l.bits & SAEBEL)) return amboss; return "foerster"; }

/* ---------- Dialogbuch ---------- */
/* Hartwig: ruhig, knapp, ein Mann, der mit Bäumen mehr redet als mit Menschen. Er erzählt nebenbei, was die Splitter sind – Scherben, die verändern,
   was in ihrer Nähe lebt: stärker, größer, hungriger. Nicht besser. Jeder Schritt hat seine eigene Begrüßung; „Wie war das noch?“ erklärt den Weg. */
export interface Dialog3 { npc: "foerster"; name: string; zeilen: Zeile[]; antworten: Antwort[] }
export interface Folge3 { stand?: Stand3; abschluss?: boolean; weiter?: boolean; werkzeug?: boolean; /** den verlorenen Säbel zurückgeben (nach der Quest) */ zurueck?: boolean; zeilen?: Zeile[] }
const F = "Förster Hartwig", z = (...t: string[]): Zeile[] => t.map((text) => ({ wer: F, text }));
const ENDE: Antwort = { id: "tschuess", text: "Auf Wiedersehen." }, VERLOREN: Antwort = { id: "verloren", text: "Ich habe den Waldsäbel verloren." };
const SPLITTER: Antwort = { id: "splitter", text: "Was sind diese Splitter?" }, WALD: Antwort = { id: "wald", text: "Was ist mit dem Wald los?" }, WER: Antwort = { id: "wer", text: "Wer bist du?" };
const BAUM: Antwort = { id: "baum", text: "Was hat es mit dem Baum und dem Stein auf sich?" }, HILFE: Antwort = { id: "hilfe", text: "Wie war das noch mal?" };

/** Was Hartwig gerade sagt, je nach Schritt */
function gruss3(l: Lage3): string[] {
  const h = (l.bits & HOLZ) !== 0, e = (l.bits & ERZ) !== 0;
  if (!h && !e) return ["Der Baum des Waldgottes steht im Hain nordwestlich von hier – du erkennst ihn an den Adern, die unter der Rinde leuchten. Der Waldstein liegt nordöstlich, grün wie Moos."];
  if (h && !e) return ["Holz vom Waldgott. Ich rieche es von hier – wie Harz nach einem Gewitter.", "Jetzt noch der Waldstein, nordöstlich von hier. Schlag dir ein Stück ab."];
  if (!h && e) return ["Ein Stück Waldstein. Kühl, nicht wahr? Als hätte er nie Sonne gesehen.", "Fehlt noch ein Ast vom Baum des Waldgottes, nordwestlich im Hain."];
  if (!(l.bits & BARREN)) return ["Holz und Stein, beides. Gut.", "Jetzt in die Schmiede der Waldmark, gleich östlich von hier. Erst an die Esse, den Stein schmelzen – dann an den Amboss."];
  return ["Der Barren ist geschmolzen? Dann an den Amboss mit dir. Barren und Holz zusammen, und den Hammer im Rucksack – der Rest ist Geduld."]; }

/** saebelDa: im Rucksack oder in der Hand; verloren: nirgends, auch nicht in der Bank */
export function dialog3(s: Stand3, saebelDa: boolean, verloren = false): Dialog3 { const l = lage3(s), d = (zeilen: Zeile[], antworten: Antwort[]): Dialog3 => ({ npc: "foerster", name: F, zeilen, antworten });
  if (l.phase === "") return d(z("Leise. Hörst du das?", "Nichts. Kein Specht, kein Häher, nicht einmal Mücken. So still war der Nordwald nie – nicht, bevor die Splitter gefallen sind."),
    [WALD, SPLITTER, WER, { id: "annehmen", text: "Kann ich dir helfen? (Quest annehmen)" }, { id: "spaeter", text: "Jetzt nicht." }]);
  if (l.phase === "fertig") return d(z(verloren ? "Du siehst aus, als hättest du etwas verloren." : "Der Säbel steht dir. Wenn dir ein Golem den Weg versperrt – denk daran, was er einmal war. Eine Eiche, die zu viel abbekommen hat."),
    verloren ? [VERLOREN, SPLITTER, ENDE] : [SPLITTER, WER, ENDE]);
  if (!saebelDa && l.bits & SAEBEL && verloren) return d(z("Du hattest den Säbel schon geschmiedet – und jetzt ist er fort?"), [VERLOREN, ENDE]);
  if (saebelDa) return d(z("Warte. Ist das …?", "Zeig her."), [{ id: "zeigen", text: "Den Waldsäbel zeigen." }, ENDE]);
  return d(z(...gruss3(l)), [HILFE, { id: "werkzeug", text: "Mir fehlt Werkzeug." }, BAUM, SPLITTER, ENDE]); }

export function antwort3(s: Stand3, a: string, saebelDa: boolean, verloren = false): Folge3 | null { const l = lage3(s);
  if (a === "tschuess") return { zeilen: z(l.phase === "fertig" ? "Geh mit dem Wald." : "Pass auf dich auf. Und lass die Eichen im Norden in Ruhe, solange du kannst.") };
  if (a === "verloren" && verloren && l.phase === "fertig") return { zurueck: true, zeilen: z("Verloren, ja? Seltsam. Heute früh lag er am Waldrand, mitten auf dem Weg – als hätte der Wald ihn mir zurückgebracht.", "Hier. Pass diesmal besser auf ihn auf.") };
  if (a === "verloren" && verloren && l.phase === "auftrag" && l.bits & SAEBEL) return { stand: "auftrag_0", werkzeug: true, zeilen: z("Fort. Hm.", "Dann noch einmal von vorn. Der Baum gibt dir einen neuen Ast und der Stein ein neues Stück – sie wissen, dass ich dich schicke.") };
  if (a === "splitter") return { weiter: true, zeilen: z("Niemand weiß genau, woher sie kommen. Sie fielen in der Nacht, als der Himmel riss – Scherben von etwas sehr Großem. Manche so klein wie ein Fingernagel, manche größer als ein Haus.",
    "Wo sie in der Erde liegen, verändert sich, was dort lebt. Es wird stärker. Größer, zäher, hungriger.", "Aber nicht besser. Nie besser.",
    ...(l.phase === "" ? [] : ["Ihr Wanderer sammelt sie, ich weiß. Manche sagen, sie machen auch euch stärker. Überleg dir gut, was du in dich hineinlässt."])) };
  if (a === "wald" && l.phase === "") return { weiter: true, zeilen: z("Die alten Eichen im Norden stehen auf und gehen. Waldgolems nennen die Leute sie. Ich habe drei davon als Setzlinge gepflanzt.",
    "Und unten am Osthof die Mooshocker. Früher kaum größer als eine Katze – heute rollen sie sich zusammen und du hältst sie für einen Felsbrocken. Bis er dich beißt.",
    "Nur zwei Dinge hier haben die Splitter nie angenommen: den Baum des Waldgottes und den Waldstein. Was man daraus macht, trifft, was die Splitter verändert haben.") };
  if (a === "wer") return { weiter: true, zeilen: z("Hartwig. Förster, wie mein Vater vor mir und dessen Vater davor.",
    l.phase === "fertig" ? "Und jetzt einer, der einem Wanderer gezeigt hat, wie man aus Holz und Stein eine Klinge macht. Hätte ich nicht gedacht." : "Ich kenne jeden Baum zwischen der Waldmark und dem Nordsaum. Kannte. Manche stehen nicht mehr da, wo sie standen.") };
  if (a === "baum" && l.phase === "auftrag") return { weiter: true, zeilen: z("Meine Großmutter sagte, der Waldgott habe den Baum als Merkzeichen gesetzt – damit der Wald nicht vergisst, wie er einmal war.",
    "Und der Waldstein ist das Gegenstück: kühl, grün, still. Die Splitter gleiten an beiden ab wie Regen an Wachs.", "Zusammen ergeben sie eine Klinge, die trifft, was die Splitter verändert haben. Als würde der Wald zurückschlagen.") };
  if (a === "hilfe" && l.phase === "auftrag") return { weiter: true, zeilen: z("Der Reihe nach:",
    "Mit dem Beil einen Ast vom Baum des Waldgottes, nordwestlich im Hain. Das ist Holzfällerei.", "Mit der Spitzhacke ein Stück vom Waldstein, nordöstlich von hier. Das ist Bergbau.",
    "In der Schmiede der Waldmark, östlich: an der Esse den Stein zu einem Barren schmelzen, dann am Amboss Barren und Holz zum Säbel schmieden. Das ist Handwerk – und dafür brauchst du einen Hammer im Rucksack.",
    "Dann bring mir den Säbel. Und jeder Schritt lehrt dich etwas – das wirst du merken.") };
  if (a === "annehmen" && l.phase === "") return { stand: "auftrag_0", werkzeug: true, zeilen: z("Du? Hm. Du hast ruhige Hände. Das reicht.",
    "Nordwestlich von hier, im Hain, steht der Baum des Waldgottes – der mit den leuchtenden Adern. Nimm dir einen Ast. Er lässt es zu, wenn ich dich schicke.",
    "Nordöstlich liegt der Waldstein, grün wie Moos. Schlag dir ein Stück davon ab.",
    "Den Stein schmilzt du an der Esse in der Schmiede der Waldmark, und am Amboss schmiedest du aus Barren und Holz einen Säbel. Was dir an Werkzeug fehlt, gebe ich dir.") };
  if (a === "spaeter" && l.phase === "") return { zeilen: z("Wie du meinst. Ich bin hier. Der Wald läuft nicht weg.", "…Na ja. Die meisten Bäume jedenfalls nicht.") };
  if (a === "werkzeug" && l.phase === "auftrag") return { werkzeug: true, weiter: true, zeilen: z("Hier, aus meinem Schuppen. Pass gut darauf auf.") };
  if (a === "zeigen" && l.phase === "auftrag" && saebelDa) return { abschluss: true, zeilen: z("Leicht gebogen. Die Klinge grün wie Moos nach Regen, und der Griff … warm. Er ist warm.",
    "Gute Arbeit. Wirklich gute Arbeit.",
    "Er gehört dir – und nur dir. Kein Händler wird ihn kaufen, und in fremden Händen ist er nur ein Stück Metall.",
    "Gegen Waldgolems und Mooshocker beißt er tiefer als jede andere Klinge deiner Stufe. Und wenn du mehr Splitter findest … denk an die Eichen. Stärker ist nicht dasselbe wie besser.") };
  return null; }
