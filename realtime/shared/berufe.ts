/*
 * Riftmere – die Berufe (Fahrplan Phase 1c, 26.11.2026). Eine Liste für Server, Browser und Tests: Speicher (inventar.berufe),
 * Skill-Tab, XP-Anzeige, Skill-Übersicht und Quest-Belohnung lesen nur diese Liste. Neuer Beruf: hier eintragen.
 * Werkstätten (shared/handwerk.ts) gehören genau einem Beruf: Esse und Amboss dem Schmieden, Werkbank und Rucksack dem Handwerk.
 */
import type { StationId } from "./handwerk";

export interface Beruf {
  id: string; name: string;
  /** Symbol (Pfad ab Spielwurzel), groß und klein */ symbol: string; symbolKlein: string;
  /** Werkstätten, an denen dieser Beruf XP bekommt (Sammelberufe: keine) */ stationen: StationId[];
  /** Info-Fenster: Wofür, So steigst du auf */ wofuer: string; aufstieg: string;
}
const S = "img/objekte3d/skilling/symbole/";
export const BERUFE: Beruf[] = [
  { id: "holzfaellerei", name: "Holzfällerei", symbol: S + "holzfaellerei.webp", symbolKlein: S + "holzfaellerei_klein.webp", stationen: [],
    wofuer: "Stämme für das Handwerk (Bögen, Stäbe, Schilde, Werkzeugstiele) und Brennstoff für die Esse. Jeder Stamm bringt mit 25 % Wahrscheinlichkeit 5–15 Splitter.",
    aufstieg: "Holzfäller-Bäume (leuchtende Adern) antippen, ein Holzbeil im Rucksack oder in der Hand. Eiche ab Level 1 (25 XP), Tanne 10 (40), Eibe 20 (70), Moorweide 35 (110), Kernbaum 45 (175), Weltenbaum-Setzling 65 (260). Ein besseres Beil fällt schneller." },
  { id: "bergbau", name: "Bergbau", symbol: S + "bergbau.webp", symbolKlein: S + "bergbau_klein.webp", stationen: [],
    wofuer: "Erze für das Schmieden: Barren schmelzen für Waffen, Rüstungen und Werkzeuge. Jedes Erz bringt mit 25 % Wahrscheinlichkeit 5–15 Splitter.",
    aufstieg: "Erzadern in den Senken antippen, eine Spitzhacke im Rucksack oder in der Hand. Kupfer ab Level 1 (20 XP), Eisen 10 (35), Schwarzeisen 20 (60), Sterneisen 35 (100), Splittereisen 45 (160), Ureisen 65 (250). Eine bessere Spitzhacke baut schneller." },
  { id: "schmieden", name: "Schmieden", symbol: S + "schmieden_2.webp", symbolKlein: S + "schmieden_2_klein.webp" /* eigenes Symbol (26.11.2026) */, stationen: ["esse", "amboss"],
    wofuer: "Aus Erz wird Metall: Barren an der Esse, Waffen, Rüstungen und Werkzeuge am Amboss. Esse und Amboss stehen in der Schmiede der Waldmark.",
    aufstieg: "An der Esse oder am Amboss ein Rezept wählen (oder Erz bzw. einen Barren im Rucksack benutzen und die Werkstatt antippen). Am Amboss braucht man einen Hammer im Rucksack. Jedes Stück braucht seine Ticks, auch bei „Alle“." },
  { id: "handwerk", name: "Handwerk", symbol: S + "handwerk.webp", symbolKlein: S + "handwerk_klein.webp", stationen: ["werkbank", "hand"],
    wofuer: "Bogensehnen, Garn, Leder, Stoff und Holzwaren an der Werkbank im Osthof – und was sich im Rucksack zusammensetzen lässt (Sehne auf Bogen).",
    aufstieg: "An der Werkbank ein Rezept wählen (oder einen Rohstoff im Rucksack benutzen und die Werkbank antippen): Bogensehne und Garn ab Level 1, Leder und Stoff je Stufe. Jedes Stück braucht seine Ticks, auch bei „Alle“." },
  { id: "splitterbinden", name: "Splitterbinden", symbol: S + "splitterbinden.webp", symbolKlein: S + "splitterbinden_klein.webp", stationen: ["bindestein"],
    wofuer: "Splitter tragen Kraft. Am Bindestein legst du sie in den Wegstein: jede Ladung bringt dich einmal zu einem Ziel, das du freigeschaltet hast. Der erste Bindestein steht an der Linde in Weidenhain.",
    aufstieg: "Am Bindestein den Wegstein laden: 2 Splitter je Ladung (2 XP) – oder 1 Splitter und 1 Seelenlicht. Seelenlichter fängst du ohne Werkzeug: Mattes Licht ab Level 1 um die Linde (8 XP), Wiesenlicht ab 10 in den Riedwiesen und an der Quelle der Obstwiesen (15). Schwingt der Stein (Resonanz), tipp schnell: doppelt so viele Ladungen." },
  { id: "fischen", name: "Fischen", symbol: S + "fischen.webp", symbolKlein: S + "fischen_klein.webp", stationen: [],
    wofuer: "Fische zum Kochen: gebraten heilen sie, in der Suppe stärken sie. Jeder Fang bringt mit 25 % Wahrscheinlichkeit 5–15 Splitter.",
    aufstieg: "Eine Stelle im Wasser antippen, wo sich Wellen kräuseln – mit Angelrute und Würmern im Rucksack. Die Fische ziehen weiter, dann such die nächste Stelle. Bachling ab Level 1 (20 XP) im Mühlgraben von Weidenhain und im Bach der Obstwiesen, Mühlbarsch ab 10 (35) weiter unten im Mühlgraben, Moorhecht ab 20 (60) im Rabenmoor mit der Reuse. Würmer gräbst du auf dem Acker im Osthof. Schäumt das Wasser (Strömung lesen), tipp schnell: zwei Fische." },
  { id: "kochen", name: "Kochen", symbol: S + "kochen.webp", symbolKlein: S + "kochen_klein.webp", stationen: ["feuer", "backofen", "herd", "kessel", "brunnen", "raeucherhuette"],
    wofuer: "Essen, das heilt – und manches stärkt dich eine Weile (Fischsuppe: Defense +2 für 5 Minuten). Feuer stehen in Weidenhain, am Rastplatz Osthang und im Rabenmoor; Wasser schöpfst du am Brunnen in einen Krug.",
    aufstieg: "Am Feuer ein Rezept wählen (oder einen rohen Fisch benutzen und das Feuer antippen): Bachling ab Level 1 (30 XP), Mühlbarsch ab 10 (50), Moorhecht ab 20 (80); Fischsuppe ab 15 im Kessel, Bauerneintopf ab 25 am Herd. Anfangs brennt manches an – je höher dein Level, desto seltener. Glüht der Garpunkt, tipp schnell: das Stück gelingt sicher, mit 50 % mehr XP." },
];
export const beruf = (id: string): Beruf | undefined => BERUFE.find((b) => b.id === id);
/** Welcher Beruf bekommt die XP an dieser Werkstatt? */
export const berufAn = (station: StationId): string => (BERUFE.find((b) => b.stationen.includes(station)) || { id: "handwerk" }).id;
/** Einmalige Umstellungen gespeicherter Berufe (Merker im Inventar): Schmieden startet mit dem Stand des Handwerks, damit niemand Stufen verliert */
export const UMSTELLUNG_SCHMIEDEN = "schmieden";
export function berufeUmstellen(b: Record<string, number>, merker: string[]): { berufe: Record<string, number>; merker: string[]; geaendert: boolean } {
  if (merker.includes(UMSTELLUNG_SCHMIEDEN)) return { berufe: b, merker, geaendert: false };
  const n = { ...b }; if ((n.handwerk || 0) > (n.schmieden || 0)) n.schmieden = n.handwerk;
  return { berufe: n, merker: [...merker, UMSTELLUNG_SCHMIEDEN], geaendert: true }; }
