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

export interface Bankschalter { id: string; ort: "waldmark" | "weidenhain"; x: number; y: number; /** Name der Bank im Fenster */ bank?: string }
/** Die Schalter (wo der Kunde steht) – gleich den Interaktionen in den Weltdaten */
export const BANKSCHALTER: Bankschalter[] = [
  { id: "bankschalter_links", ort: "waldmark", x: 6476.6, y: 6429.1 },
  { id: "bankschalter_rechts", ort: "waldmark", x: 6479.4, y: 6429.1 },
  { id: "bankschalter", ort: "weidenhain", x: 6436.5, y: 6676.4 },
];
/* #169 (Regel des Nutzers: jede etwas größere Stadt hat mindestens einen Bankschalter): die Bankgebäude der Welt (Bauplan waldmark_bank_01, ungedreht) in Graufurt,
   Grauwacht, Steinhag, Glutbrunn und Kielmund bekommen den linken Schalter wie in der Waldmark – Schalter 1,4 links und 1,9 hinter dem Bauplan-Punkt, der Bankier 3,7 dahinter.
   Ort „waldmark“ = die eine Kampfwelt (wie bei Steinhag). Haferstedt und Sandquell: Welt 72658709 (#169), Bauplan waldmark_bank_01 bei bl_haferstedt_bank / bl_sandquell_bank. */
export const BANKGEBAEUDE: { id: string; stadt: string; x: number; y: number; bankier: [string, string] }[] = [
  { id: "graufurt", stadt: "Graufurt", x: 6703, y: 6482, bankier: ["Albrecht Münzer", "Bankmitarbeiter"] },
  { id: "grauwacht", stadt: "Grauwacht", x: 6716, y: 5730, bankier: ["Hedwig Taler", "Bankmitarbeiterin"] },
  { id: "steinhag", stadt: "Steinhag", x: 6969, y: 5878, bankier: ["Greta Pfand", "Bankmitarbeiterin"] },
  { id: "glutbrunn", stadt: "Glutbrunn", x: 7160, y: 6932, bankier: ["Selim Sandgold", "Bankmitarbeiter"] },
  { id: "kielmund", stadt: "Kielmund", x: 6452, y: 7296, bankier: ["Ole Heuer", "Bankmitarbeiter"] },
  { id: "haferstedt", stadt: "Haferstedt", x: 6246, y: 6978, bankier: ["Jorinde Scheffel", "Bankmitarbeiterin"] },
  { id: "sandquell", stadt: "Sandquell", x: 7407, y: 6730, bankier: ["Yusuf Ockerstein", "Bankmitarbeiter"] },
];
for (const B of BANKGEBAEUDE) BANKSCHALTER.push({ id: B.id + "_bankschalter", ort: "waldmark", x: B.x - 1.4, y: B.y - 1.9, bank: "Bank von " + B.stadt });
/* #167: die zweite Bank von Steinhag im Zunftviertel (Welt 72658709, hochlande_orte.json → hauptstadt.banken): der Kunde steht vor der Tür und schaut nach Norden,
   die Bankmitarbeiterin steht drinnen hinter dem Schalter */
BANKSCHALTER.push({ id: "steinhag_zunftbank_bankschalter", ort: "waldmark", x: 7065, y: 5916.4, bank: "Zunftbank von Steinhag" });
export const istBankschalter = (id: string): boolean => BANKSCHALTER.some((b) => b.id === id);

export interface Bankier { id: string; name: string; titel: string; ort: "waldmark" | "weidenhain"; modell: string; x: number; y: number; blick: [number, number]; schalter: string; /** Name der Bank im Fenster (sonst nach ort) */ bank?: string }
/** Die Bankmitarbeiter, je einer hinter jedem Schalter (Figuren-Fabrik: npc.bankmitarbeiter), Blick nach Süden zum Kunden */
export const BANKIERS: Bankier[] = [
  { id: "lorenz", name: "Lorenz Gülden", titel: "Bankmitarbeiter", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 6476.6, y: 6427.3, blick: [0, 1], schalter: "bankschalter_links" },
  { id: "edwin", name: "Edwin Pfennig", titel: "Bankmitarbeiter", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 6479.4, y: 6427.3, blick: [0, 1], schalter: "bankschalter_rechts" },
  { id: "mattis", name: "Mattis Schober", titel: "Bankmitarbeiter", ort: "weidenhain", modell: "npc.bankmitarbeiter", x: 6436.5, y: 6675.1, blick: [0, 1], schalter: "bankschalter" },
];
/* #169: je Bankgebäude ein Bankier hinter dem Schalter (Steinhag: Greta Pfand stand bisher vor dem Gebäude, jetzt hinter dem Schalter) */
for (const B of BANKGEBAEUDE) BANKIERS.push({ id: B.id === "steinhag" ? "steinhag_bank" : B.id + "_bank", name: B.bankier[0], titel: B.bankier[1], ort: "waldmark", modell: "npc.bankmitarbeiter",
  x: B.x - 1.4, y: B.y - 3.7, blick: [0, 1], schalter: B.id + "_bankschalter", bank: "Bank von " + B.stadt });
BANKIERS.push({ id: "steinhag_zunftbank", name: "Barbara Schlägel", titel: "Bankmitarbeiterin", ort: "waldmark", modell: "npc.bankmitarbeiter", x: 7065, y: 5912.6, blick: [0, 1],
  schalter: "steinhag_zunftbank_bankschalter", bank: "Zunftbank von Steinhag" });

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

/* #167/#168: Bankkisten in den Zunfthäusern – nur Ablegen und Abheben (keine Reiter, kein Tauschen, keine Platzhalter). Die Kisten stehen als Interaktionen
   in den Weltdaten (Welt baut sie, die Kennung steht hier). Ort wie bei den Bankmitarbeitern: die eine Kampfwelt („waldmark“). */
export interface Bankkiste { id: string; name: string; x: number; y: number; ort: string }
export const BANKKISTEN: Bankkiste[] = [
  /* Entscheidung des Nutzers (27.11., #169): kleinere Orte bekommen eine Bankkiste – Rabenmoor, Möwenbucht und das Bergwerk am Erzberg.
     Welt hat sie aufgestellt (22d95c3a, 72658709): Kennung = Interaktion in den Weltdaten, Stelle = deren Weltfeld */
  { id: "rabenmoor_bankkiste", name: "Bankkiste von Rabenmoor", x: 6312.5, y: 6705.15, ort: "waldmark" },
  { id: "moewenbucht_bankkiste", name: "Bankkiste der Möwenbucht", x: 6223.5, y: 7156.8, ort: "waldmark" },
  { id: "bergwerk_bankkiste", name: "Bankkiste an der Kaue", x: 7118.5, y: 5821.8, ort: "waldmark" },
];
export const istBankkiste = (id: string): boolean => BANKKISTEN.some((k) => k.id === id);
/** Steht man an einer Bankkiste (und nicht an einer richtigen Bank)? */
export const nahAnBankkiste = (ort: string, x: number, y: number): boolean => BANKKISTEN.some((k) => k.ort === ort && Math.hypot(k.x - x, k.y - y) <= BANK_WEIT);
/** Was an einer Bankkiste geht: ablegen (auch alles) und abheben */
export const KISTE_TATEN = new Set(["ein", "ab", "alles"]);

/** Steht man nah genug an einer Bank? (Schalter oder Bankmitarbeiter, im selben Ort) */
export function nahAnBank(ort: string, x: number, y: number): boolean {
  return BANKSCHALTER.some((b) => b.ort === ort && Math.hypot(b.x - x, b.y - y) <= BANK_WEIT) || BANKIERS.some((b) => b.ort === ort && Math.hypot(b.x - x, b.y - y) <= BANK_WEIT);
}
