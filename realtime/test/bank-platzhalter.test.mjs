/*
 * Riftmere – Bank (#117), Server-Teil: Reihenfolge, Felder tauschen, Platzhalter (Menge 0) an/aus, beim Einzahlen auf seinen Platz, eins oder alle entfernen,
 * gespeichert im Inventar (nach dem Laden noch da). Ohne Server-Prozess: server/src/inventar.ts mit nachgebildeter Supabase.
 * Aufruf (im Ordner realtime): node test/bank-platzhalter.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-bank117-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * as I from "./server/src/inventar";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { I } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
let ROW = [], GESPEICHERT = null; const sb = async (p, init) => { if (p.includes("rpg_held?")) return ROW; if (p.includes("inventar_setzen")) GESPEICHERT = JSON.parse(init.body).p_inventar; return null; };
const N = "bea", bank = () => I.inventarVon(N).bank || [], reihe = () => bank().map(([g, n]) => `${g}:${n}`).join(" ");
ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [{ g: "splitter", n: 50 }, { g: "heiltrank", n: 3 }, "kleiner_heiltrank"], v: 2, bank: [["salz", 10], ["krebsschere", 4], ["wachtstein", 2]] } }];
await I.inventarLaden(sb, N);

console.log("\nReihenfolge und Tauschen");
check(reihe() === "salz:10 krebsschere:4 wachtstein:2", `die Reihenfolge der Bank bleibt, wie gespeichert (${reihe()})`);
check(I.bankTauschen(sb, N, 0, 2) === null && reihe() === "wachtstein:2 krebsschere:4 salz:10", "bank tauschen: Feld 1 und 3 tauschen ihre Plätze");
check(I.bankTauschen(sb, N, 0, 9) !== null && reihe() === "wachtstein:2 krebsschere:4 salz:10", "ein Feld, das es nicht gibt: abgelehnt, nichts ändert sich");

console.log("\nPlatzhalter");
check(I.bankAbheben(sb, N, "krebsschere", 0) === null && reihe() === "wachtstein:2 salz:10", "Platzhalter aus (Standard): alles abheben räumt das Feld");
I.bankEinzahlen(sb, N, "krebsschere", 0); I.bankTauschen(sb, N, 1, 2); /* wieder in die Mitte */
check(I.bankPlatzhalterSetzen(sb, N, true) === null && I.inventarVon(N).bankPlatzhalter === true, "Schalter Platzhalter an");
check(I.bankAbheben(sb, N, "krebsschere", 0) === null && reihe() === "wachtstein:2 krebsschere:0 salz:10", "alles abheben: das Feld bleibt als Platzhalter (Menge 0)");
check(I.bankAbheben(sb, N, "krebsschere", 1) !== null, "aus einem Platzhalter kann man nichts abheben");
check(I.bankEinzahlen(sb, N, "heiltrank", 0) === null && reihe() === "wachtstein:2 krebsschere:0 salz:10 heiltrank:3", "Neues kommt ans Ende");
check(I.bankEinzahlen(sb, N, "krebsschere", 0) === null && reihe() === "wachtstein:2 krebsschere:4 salz:10 heiltrank:3", "einzahlen: der Gegenstand landet auf seinem Platzhalter");
I.bankAbheben(sb, N, "krebsschere", 0); I.bankAbheben(sb, N, "salz", 0);
{ const S = I.inventarVon(N); check(JSON.stringify(S.bank) === JSON.stringify([["wachtstein", 2], ["krebsschere", 0], ["salz", 0], ["heiltrank", 3]]) && S.bankPlatzhalter === true, "im Inventar (das gespeichert wird): Platzhalter mit Menge 0 und der Schalter"); }

console.log("\nPlatzhalter entfernen und Laden");
check(I.bankPlatzhalterEntfernen(sb, N, 0) !== null, "ein Feld mit Inhalt ist kein Platzhalter");
check(I.bankPlatzhalterEntfernen(sb, N, 1) === null && reihe() === "wachtstein:2 salz:0 heiltrank:3", "einen Platzhalter entfernen (langes Drücken)");
I.bankAbheben(sb, N, "wachtstein", 0);
check(I.bankPlatzhalterEntfernen(sb, N) === null && reihe() === "heiltrank:3", "alle Platzhalter entfernen");
check(I.bankPlatzhalterEntfernen(sb, N) !== null, "ohne Platzhalter: Hinweis");
I.bankAbheben(sb, N, "heiltrank", 0);
ROW = [{ waffe: "schwert", inventar: JSON.parse(JSON.stringify(I.inventarVon(N))) }]; await I.inventarLaden(sb, "bea2");
check(JSON.stringify(I.inventarVon("bea2").bank) === JSON.stringify([["heiltrank", 0]]) && I.inventarVon("bea2").bankPlatzhalter === true, "nach dem Laden: Platzhalter und Schalter noch da");
ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2, bank: [["salz", 0], ["salz", 5], ["nichts_davon", 0]] } }]; await I.inventarLaden(sb, "bea3");
check(JSON.stringify(I.inventarVon("bea3").bank) === JSON.stringify([["salz", 5]]), "beim Laden: ein Platzhalter und derselbe Gegenstand werden ein Feld, Unbekanntes fällt weg");
ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2, bank: [["salz", 0], ["wachtstein", 1]] } }]; await I.inventarLaden(sb, "bea4");
check(!I.besitztIrgendwo("bea4", "salz") && I.besitztIrgendwo("bea4", "wachtstein"), "ein Platzhalter zählt nicht als Besitz");

console.log(f ? `\nBank (#117): ${f} FEHLER` : "\nBank (#117): alles in Ordnung");
process.exit(f ? 1 : 0);
