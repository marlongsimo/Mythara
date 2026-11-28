/**
 * Riftmere – Schimpfwortfilter für den Chat (Deutsch und Englisch).
 * Ein Wort wird durch Sternchen ersetzt, wenn es mit einem der Stämme beginnt (oder einer der Wörter in GANZ genau ist).
 * Vergleich auf einer vereinfachten Form: klein, Umlaute aufgelöst, Zahlen/Zeichen wie 0→o, 1→i, 3→e, 4→a, 5→s, @→a, $→s,
 * wiederholte Buchstaben zusammengezogen („fiiiick“ → „fick“). Wörter wie „Marsch“ oder „Schnitzel“ bleiben, weil nur der Wortanfang zählt.
 * Mehrwortige Wendungen (SAETZE) werden auch über Leerzeichen hinweg erkannt.
 */

/** Wortanfänge: alles, was damit beginnt, wird ersetzt */
const STAEMME = [
  // Deutsch
  "fick", "gefick", "ficker", "fotz", "wichs", "hurensohn", "hurenso", "hure", "huren", "nutte", "schlampe", "arschloch", "arschgeig", "arschgesicht",
  "missgeburt", "spast", "mongo", "schwuchtel", "schwuchtl", "kanake", "kanacke", "neger", "nigger", "nigga", "zigeuner", "judensau", "vergewaltig",
  "pisser", "scheißkerl", "scheisskerl", "drecksau", "dreckssau", "verpiss", "wixer", "wixxer", "kinderficker", "pimmel", "schwanzlutsch",
  "muschi", "titten", "penis", "vagina", "porno",
  // Englisch
  "fuck", "motherfuck", "shit", "bullshit", "bitch", "cunt", "asshole", "whore", "slut", "faggot", "fag", "retard", "dickhead", "cock", "pussy",
  "rape", "rapist", "nazi", "kys",
];
/** Nur als ganzes Wort (als Wortanfang zu viele harmlose Treffer: „Arschbombe“, „fressen“) */
const GANZ = ["arsch", "hitler", "fresse", "scheiße", "scheisse", "scheiß", "scheiss", "kacke", "idiot", "wtf", "stfu"];
/** Wendungen über mehrere Wörter */
const SAETZE = ["sieg heil", "heil hitler", "kill yourself", "kill urself", "bring dich um", "häng dich auf", "haeng dich auf", "geh sterben", "go die"];

const ERSATZ: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "@": "a", "$": "s", "!": "i", "|": "i", "€": "e" };
/** Vereinfachte Form eines Wortes zum Vergleichen */
export function einfach(w: string): string {
  let s = w.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
  s = [...s].map((c) => ERSATZ[c] ?? c).join("").replace(/[^a-z]/g, "");
  return s.replace(/(.)\1+/g, "$1");
}
const e = (w: string) => einfach(w);
const STAEMME_E = [...new Set(STAEMME.map(e))].filter((x) => x.length >= 3);
const GANZ_E = new Set(GANZ.map(e));
const SAETZE_E = SAETZE.map((t) => t.split(" ").map(e));
/** Ausnahmen: beginnen mit einem Stamm, sind aber harmlos */
const HARMLOS = new Set(["fagott", "cockpit", "cocktail", "shitake", "assassin", "penisola", "spastik", "nutella", "mongolei", "mongole", "mongolen", "mongolisch"].map(e));

function boese(wort: string): boolean {
  const s = einfach(wort.replace(/^[^\p{L}\p{N}@$]+|[^\p{L}\p{N}]+$/gu, "")); /* Satzzeichen am Rand zählen nicht („sch3isse!“) */ if (s.length < 2 || HARMLOS.has(s)) return false;
  if (GANZ_E.has(s)) return true;
  return STAEMME_E.some((x) => s.startsWith(x));
}

/** Text filtern: anstößige Wörter werden durch Sternchen gleicher Länge ersetzt. Gibt den Text und ob etwas ersetzt wurde zurück. */
export function filtern(text: string): { text: string; ersetzt: boolean } {
  const teile = text.split(/(\s+)/); const woerter = teile.map((t, i) => ({ t, i })).filter((x) => !/^\s+$/.test(x.t) && x.t !== "");
  const weg = new Set<number>();
  for (const w of woerter) if (boese(w.t)) weg.add(w.i);
  const einf = woerter.map((w) => einfach(w.t));
  for (const satz of SAETZE_E) for (let k = 0; k + satz.length <= einf.length; k++) if (satz.every((x, j) => einf[k + j] === x)) for (let j = 0; j < satz.length; j++) weg.add(woerter[k + j].i);
  if (!weg.size) return { text, ersetzt: false };
  return { text: teile.map((t, i) => (weg.has(i) ? "*".repeat(Math.max(3, [...t].length)) : t)).join(""), ersetzt: true };
}
