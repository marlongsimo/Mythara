/*
 * Mythara – Läden der Splitterlande (24.11.2026): Sortiment und Preise in Seelensplittern. Gemeinsam für Client und (später) Server,
 * damit der Server beim Kauf dieselben Preise prüft, die der Laden anzeigt.
 * seltenheit: einfach (weiß) · selten (blau) – wie in vielen Rollenspielen.
 */
export type Seltenheit = "einfach" | "selten";
export interface Ware { id: string; name: string; art: "beil" | "spitzhacke" | "hammer"; seltenheit: Seltenheit; preis: number; text: string }
export interface Laden { id: string; name: string; haendler: string; gruss: string; waren: Ware[] }

export const LAEDEN: Record<string, Laden> = {
  handwerker: { id: "handwerker", name: "Werkzeug des Handwerkers", haendler: "Der Handwerker", gruss: "Gutes Werkzeug ist die halbe Arbeit. Was brauchst du?",
    waren: [
      { id: "beil_einfach", name: "Beil", art: "beil", seltenheit: "einfach", preis: 150, text: "Ein solides Beil für Holz und Gestrüpp." },
      { id: "beil_selten", name: "Geschärftes Beil", art: "beil", seltenheit: "selten", preis: 350, text: "Klinge aus gehärtetem Stahl, liegt gut in der Hand." },
      { id: "spitzhacke_einfach", name: "Spitzhacke", art: "spitzhacke", seltenheit: "einfach", preis: 150, text: "Bricht Stein und Erz – mit etwas Geduld." },
      { id: "spitzhacke_selten", name: "Bergmannshacke", art: "spitzhacke", seltenheit: "selten", preis: 350, text: "Doppelte Spitze aus Graufurter Eisen." },
      { id: "hammer", name: "Hammer", art: "hammer", seltenheit: "einfach", preis: 100, text: "Für Nägel, Bretter und kleine Reparaturen." },
    ] },
};
