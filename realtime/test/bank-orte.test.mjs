/*
 * Riftmere – Regel des Nutzers (#169): jede etwas größere Stadt hat mindestens einen Bankschalter. Orte und Mitten aus der Bestandsaufnahme der Welt (#169).
 * Geprüft: ein Schalter (shared/bank.ts BANKSCHALTER) höchstens 40 Felder von der Ortsmitte (Graufurt: 110, die Stadt ist lang gezogen), auf freiem Boden, mit Bankier dahinter, und dort geht die Bank (nahAnBank).
 * Rabenmoor und Möwenbucht haben eine Bankkiste (nur ablegen und abheben). Haferstedt und Sandquell bekommen ihr Bankgebäude von Welt – bis dahin nur ein Hinweis. Aufruf (im Ordner realtime): node test/bank-orte.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-bankorte-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/bank"; export { versperrt } from "./shared/handwerk";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" },
  bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { BANKSCHALTER, BANKIERS, BANKKISTEN, nahAnBank, nahAnBankkiste, versperrt } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const ORTE = [["Die Waldmark", 6448, 6432], ["Weidenhain", 6464, 6704], ["Graufurt", 6720, 6576, 110 /* lang gezogen: die Bank steht im Norden der Stadt */], ["Grauwacht", 6706, 5740], ["Steinhag", 6990, 5892], ["Glutbrunn", 7160, 6950], ["Kielmund", 6426, 7314]];
const FOLGT = [["Haferstedt", 6215, 6980], ["Sandquell", 7384, 6740]];
const bankBei = ([, x, y, r = 40]) => BANKSCHALTER.filter((s) => Math.hypot(s.x - x, s.y - y) <= r);
console.log("\nJede größere Stadt hat eine Bank");
for (const O of ORTE) { const S = bankBei(O), s = S[0], B = s && BANKIERS.find((b) => b.schalter === s.id);
  check(s && !versperrt(Math.floor(s.x), Math.floor(s.y)) && B && nahAnBank(s.ort, s.x, s.y), `${O[0]}: ${S.length} Schalter${B ? ` (${B.name}, ${B.bank || "Bank der Splitterlande"})` : ""}`); }
console.log("\nKleinere Orte mit Bankkiste (Entscheidung des Nutzers: nur ablegen und abheben)");
for (const [n, x, y] of [["Rabenmoor", 6336, 6704], ["Möwenbucht", 6214, 7160]]) { const K = BANKKISTEN.find((k) => Math.hypot(k.x - x, k.y - y) <= 40);
  check(K && !versperrt(Math.floor(K.x), Math.floor(K.y)) && nahAnBankkiste(K.ort, K.x, K.y + 1) && !nahAnBank(K.ort, K.x, K.y), `${n}: ${K ? K.name : "keine Bankkiste"}`); }
for (const O of FOLGT) console.log(`  · ${O[0]}: ${bankBei(O).length ? "Schalter da" : "Bankgebäude folgt von Welt (#169)"}`);
console.log(f ? `\nBanken: ${f} FEHLER` : "\nBanken: alles in Ordnung");
process.exit(f ? 1 : 0);
