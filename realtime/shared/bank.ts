/*
 * Mythara – die Bank (seit 24.11.2026): ein Konto je Held, überall dasselbe – in der Bank der Waldmark (zwei Schalter) und am Bankschalter in Weidenhain.
 * Wie in OSRS: Bankmitarbeiter antippen → Gespräch („Ich möchte auf mein Konto zugreifen“) oder lange drücken → „Bank“; den Schalter antippen → gleich die Bank.
 * Im Bankfenster stapelt alles (auch Waffen und Rüstung). Der Server rechnet allein (server/src/inventar.ts): Nähe zum Schalter, Platz, Mengen.
 * Gespeichert wird die Bank im Inventar des Helden (rpg_held.inventar, Feld „bank“) – dieselbe Spalte und Funktion wie der Rucksack, keine neue Tabelle.
 * Stellen: Weltfelder. Die Schalter stehen in den Weltdaten (welt/regionen/waldmark|weidenhain/spiel.json, Interaktionen „bankschalter…“);
 * die Bankmitarbeiter stehen dahinter (Bauplan waldmark_bank_01: Schalter 3 Felder hinter der Südwand; weidenhain_bankschalter_01: im Häuschen).
 */

/** So viele verschiedene Gegenstände fasst ein Bankkonto */
export const BANK_PLAETZE = 200;
/** Reiter der Bank (wie in OSRS): höchstens so viele; ein leerer Reiter verschwindet, die folgenden rücken auf */
export const BANK_REITER = 9;
/** Höchstmenge je Gegenstand in der Bank */
export const BANK_MAX = 2_147_483_647;
/** So nah muss man an einem Schalter oder Bankmitarbeiter stehen (Felder) */
export const BANK_WEIT = 3.5;

export interface Bankschalter { id: string; ort: "waldmark" | "weidenhain"; x: number; y: number }
/** Die Schalter (wo der Kunde steht) – gleich den Interaktionen in den Weltdaten */
export const BANKSCHALTER: Bankschalter[] = [
  { id: "bankschalter_links", ort: "waldmark", x: 6476.6, y: 6429.1 },
  { id: "bankschalter_rechts", ort: "waldmark", x: 6479.4, y: 6429.1 },
  { id: "bankschalter", ort: "weidenhain", x: 6436.5, y: 6676.4 },
];
export const istBankschalter = (id: string): boolean => BANKSCHALTER.some((b) => b.id === id);

export interface Bankier { id: string; name: string; titel: string; ort: "waldmark" | "weidenhain"; modell: string; x: number; y: number; blick: [number, number]; schalter: string; /** Name der Bank im Fenster (sonst nach ort) */ bank?: string }
/** Die Bankmitarbeiter, je einer hinter jedem Schalter (Figuren-Fabrik: npc.bankmitarbeiter), Blick nach Süden zum Kunden */
export const BANKIERS: Bankier[] = [
  { id: "lorenz", name: "Lorenz Gülden", titel: "Bankmitarbeiter", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 6476.6, y: 6427.3, blick: [0, 1], schalter: "bankschalter_links" },
  { id: "edwin", name: "Edwin Pfennig", titel: "Bankmitarbeiter", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 6479.4, y: 6427.3, blick: [0, 1], schalter: "bankschalter_rechts" },
  /* Phase 11: die Bank von Steinhag (Welt: steinhag_bank, Platz aus welt/hochlande_orte.json); ort gilt für die eine Kampfwelt wie in der Waldmark */
  { id: "steinhag_bank", name: "Greta Pfand", titel: "Bankmitarbeiterin", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 6969, y: 5880, blick: [0, 1], schalter: "steinhag_bank", bank: "Bank von Steinhag" },
  { id: "mattis", name: "Mattis Schober", titel: "Bankmitarbeiter", ort: "weidenhain", modell: "npc.bankmitarbeiter", x: 6436.5, y: 6675.1, blick: [0, 1], schalter: "bankschalter" },
];

/** Gespräch (wie in OSRS): Gruß, dann drei Antworten */
export const BANK_GRUSS = "Guten Tag. Wie kann ich dir helfen?";
export const BANK_ANTWORTEN = [
  { id: "konto", text: "Ich möchte auf mein Bankkonto zugreifen." },
  { id: "ort", text: "Was ist das hier für ein Ort?" },
  { id: "nein", text: "Nichts, danke." },
];
export const BANK_ORT = ["Das ist die Bank der Splitterlande. Was du bei uns einlagerst, ist sicher – auch wenn du im Kampf fällst.",
  "Dein Konto ist überall dasselbe: hier, in der Bank der Waldmark und am Schalter in Weidenhain."];
export const BANK_TSCHUESS = "Dann einen schönen Tag noch.";

/** Steht man nah genug an einer Bank? (Schalter oder Bankmitarbeiter, im selben Ort) */
export function nahAnBank(ort: string, x: number, y: number): boolean {
  return BANKSCHALTER.some((b) => b.ort === ort && Math.hypot(b.x - x, b.y - y) <= BANK_WEIT) || BANKIERS.some((b) => b.ort === ort && Math.hypot(b.x - x, b.y - y) <= BANK_WEIT);
}
