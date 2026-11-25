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
  if (l.phase === "") return "Förster Hartwig steht am Rand des Nordwalds, gleich wo man aus der Waldmark hineinkommt. Er sucht jemanden, der ihm hilft.";
  if (l.phase === "fertig") return "Du hast den Waldsäbel geschmiedet. Er trifft, was die Splitter verändert haben, härter – Waldgolems und Mooshocker.";
  if (!(l.bits & HOLZ) || !(l.bits & ERZ)) return `Fälle den Baum des Waldgottes im Hain westlich des Försters${l.bits & HOLZ ? " (erledigt)" : ""} und baue den Waldstein nordöstlich von ihm ab${l.bits & ERZ ? " (erledigt)" : ""}.`;
  if (!(l.bits & BARREN)) return "Schmilz den Waldstein an der Esse in der Schmiede der Waldmark zu einem Barren.";
  if (!(l.bits & SAEBEL)) return "Schmiede am Amboss aus dem Waldsteinbarren und dem Holz des Waldgottes den Waldsäbel. Ein Hammer muss im Rucksack sein.";
  return "Der Waldsäbel ist fertig. Zeig ihn Förster Hartwig am Rand des Nordwalds."; }
export const SCHRITTE3: { text: string; bit: number }[] = [{ text: "Den Baum des Waldgottes fällen", bit: HOLZ }, { text: "Den Waldstein abbauen", bit: ERZ },
  { text: "Den Waldstein an der Esse schmelzen", bit: BARREN }, { text: "Am Amboss den Waldsäbel schmieden", bit: SAEBEL }];
/** Wohin der Pfeil zeigt */
export function ziel3(s: Stand3, esse: [number, number], amboss: [number, number]): "foerster" | [number, number] | null { const l = lage3(s);
  if (l.phase === "") return "foerster"; if (l.phase === "fertig") return null;
  if (!(l.bits & HOLZ)) return BAUM3; if (!(l.bits & ERZ)) return STEIN3; if (!(l.bits & BARREN)) return esse; if (!(l.bits & SAEBEL)) return amboss; return "foerster"; }

/* ---------- Dialogbuch ---------- */
export interface Dialog3 { npc: "foerster"; name: string; zeilen: Zeile[]; antworten: Antwort[] }
export interface Folge3 { stand?: Stand3; abschluss?: boolean; weiter?: boolean; werkzeug?: boolean; zeilen?: Zeile[] }
const F = "Förster Hartwig", z = (...t: string[]): Zeile[] => t.map((text) => ({ wer: F, text })), ENDE: Antwort = { id: "tschuess", text: "Auf Wiedersehen." };
const SPLITTER: Antwort = { id: "splitter", text: "Was sind diese Splitter?" }, WALD: Antwort = { id: "wald", text: "Was ist mit dem Wald los?" };

export function dialog3(s: Stand3, saebelDa: boolean): Dialog3 { const l = lage3(s), d = (zeilen: Zeile[], antworten: Antwort[]): Dialog3 => ({ npc: "foerster", name: F, zeilen, antworten });
  if (l.phase === "") return d(z("Bleib einen Moment stehen, Wanderer. Hörst du das? Kein Vogel. Seit die Splitter gefallen sind, ist dieser Wald nicht mehr derselbe."),
    [SPLITTER, WALD, { id: "annehmen", text: "Kann ich helfen? (Quest annehmen)" }, { id: "spaeter", text: "Jetzt nicht." }]);
  if (l.phase === "fertig") return d(z("Der Säbel steht dir. Wenn dir ein Golem den Weg versperrt – denk daran, was er einmal war. Ein Baum, der zu viel abbekommen hat."), [SPLITTER, ENDE]);
  if (saebelDa) return d(z("Ist das …? Zeig her."), [{ id: "zeigen", text: "Den Waldsäbel zeigen." }, ENDE]);
  return d(z(questlog3(s), "Werkzeug hast du? Wenn nicht – frag mich, ich habe noch etwas im Schuppen."), [{ id: "werkzeug", text: "Mir fehlt Werkzeug." }, SPLITTER, ENDE]); }

export function antwort3(s: Stand3, a: string, saebelDa: boolean): Folge3 | null { const l = lage3(s);
  if (a === "tschuess") return {};
  if (a === "splitter") return { weiter: true, zeilen: z("Niemand weiß genau, woher sie kommen. Sie fielen in der Nacht, als der Himmel riss – Scherben von etwas sehr Großem.",
    "Wo sie in der Erde liegen, verändert sich, was dort lebt. Es wird stärker. Größer, zäher, hungriger. Aber nicht besser.",
    "Ihr Wanderer sammelt sie, ich weiß. Manche sagen, sie machen auch euch stärker. Sei vorsichtig damit, was du in dich hineinlässt.") };
  if (a === "wald" && l.phase === "") return { weiter: true, zeilen: z("Die alten Eichen im Norden stehen auf und gehen. Waldgolems nennen wir sie. Unten am Osthof waren die Mooshocker früher kaum größer als eine Katze.",
    "Nur zwei Dinge hier haben die Splitter nie angenommen: den Baum des Waldgottes und den Waldstein. Was daraus gemacht wird, trifft, was die Splitter verändert haben.") };
  if (a === "annehmen" && l.phase === "") return { stand: "auftrag_0", werkzeug: true, zeilen: z("Gut. Hör zu:",
    "Westlich von hier, im Hain, steht der Baum des Waldgottes. Nimm dir einen Ast – er erlaubt es denen, die ich schicke. Nordöstlich liegt der Waldstein. Schlag dir ein Stück ab.",
    "Den Stein schmilzt du an der Esse in der Schmiede der Waldmark, dann schmiedest du am Amboss aus Barren und Holz einen Säbel. Was dir an Werkzeug fehlt, gebe ich dir.") };
  if (a === "spaeter" && l.phase === "") return { zeilen: z("Wie du meinst. Ich bin hier, falls du es dir anders überlegst.") };
  if (a === "werkzeug" && l.phase === "auftrag") return { werkzeug: true, weiter: true, zeilen: z("Hier. Pass gut darauf auf.") };
  if (a === "zeigen" && l.phase === "auftrag" && saebelDa) return { abschluss: true, zeilen: z("Leicht gebogen, die Klinge grün wie Moos nach Regen. Gute Arbeit.",
    "Er gehört dir – und nur dir. Gegen Waldgolems und Mooshocker beißt er tiefer als jedes andere Schwert deiner Stufe.",
    "Und wenn du mehr Splitter findest … denk an die Eichen. Stärker ist nicht dasselbe wie besser.") };
  return null; }
