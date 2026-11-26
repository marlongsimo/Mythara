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
  { id: "schmieden", name: "Schmieden", symbol: S + "schmieden.webp", symbolKlein: S + "schmieden_klein.webp", stationen: ["esse", "amboss"],
    wofuer: "Aus Erz wird Metall: Barren an der Esse, Waffen, Rüstungen und Werkzeuge am Amboss. Esse und Amboss stehen in der Schmiede der Waldmark.",
    aufstieg: "An der Esse oder am Amboss ein Rezept wählen (oder Erz bzw. einen Barren im Rucksack benutzen und die Werkstatt antippen). Am Amboss braucht man einen Hammer im Rucksack. Jedes Stück braucht seine Ticks, auch bei „Alle“." },
  { id: "handwerk", name: "Handwerk", symbol: S + "handwerk.webp", symbolKlein: S + "handwerk_klein.webp", stationen: ["werkbank", "hand"],
    wofuer: "Bogensehnen, Garn, Leder, Stoff und Holzwaren an der Werkbank im Osthof – und was sich im Rucksack zusammensetzen lässt (Sehne auf Bogen).",
    aufstieg: "An der Werkbank ein Rezept wählen (oder einen Rohstoff im Rucksack benutzen und die Werkbank antippen): Bogensehne und Garn ab Level 1, Leder und Stoff je Stufe. Jedes Stück braucht seine Ticks, auch bei „Alle“." },
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
