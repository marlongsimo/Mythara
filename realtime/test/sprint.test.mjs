/* Mythara – Sprint (shared/sprint.ts): 2 Felder je Tick, Verbrauch und Erholung nach der OSRS-Formel der Laufenergie mit Geschick statt Agility, Tick 0,5 s,
   Erholung erst nach 1,5 s, Neustart ab 20 %. Aufruf: node test/sprint.test.mjs */
import { build } from "esbuild"; import { fileURLToPath } from "node:url"; import path from "node:path"; import fs from "node:fs";
const HIER = path.dirname(fileURLToPath(import.meta.url)), AUS = path.join(HIER, ".sprint.gebaut.mjs");
await build({ entryPoints: [path.join(HIER, "..", "shared", "sprint.ts")], bundle: true, platform: "node", format: "esm", outfile: AUS, logLevel: "error" }); const S = await import(AUS); fs.unlinkSync(AUS);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const nah = (a, b, e = 1e-9) => Math.abs(a - b) < e;
check(nah(S.verbrauchJeTick(1), 67 * (1 - 1 / 300)) && nah(S.verbrauchJeTick(99), 67 * (1 - 99 / 300)), "Verbrauch je Tick = 67 × (1 − Geschick ÷ 300) (OSRS-Formel ohne Gewicht)");
check(nah(S.erholungJeTick(1), 1 / 6 + 8) && nah(S.erholungJeTick(99), 99 / 6 + 8), "Erholung je Tick = Geschick ÷ 6 + 8");
const lauf = (L) => { const a = new S.Ausdauer(); a.umschalten(); let t = 0; while (a.an && t < 1000) { a.schritt(0.5, true, L); t += 0.5; } return t; };
check(lauf(1) === 75 && lauf(99) === 111.5, `Sprintdauer: Geschick 1 ${lauf(1)} s, Geschick 50 ${lauf(50)} s, Geschick 99 ${lauf(99)} s (99 sprintet ~49 % länger)`);
const erhol = (L) => { const a = new S.Ausdauer(); a.einheiten = 0; let t = 0; while (a.einheiten < S.AUSDAUER_MAX) { a.schritt(0.5, false, L); t += 0.5; } return t; };
check(erhol(1) > 600 && erhol(1) < 620 && erhol(99) > 200 && erhol(99) < 210, `Erholung leer → voll: Geschick 1 ${erhol(1)} s, Geschick 99 ${erhol(99)} s`);
{ const a = new S.Ausdauer(); a.umschalten(); check(a.faktor === 2, "Sprint: 2 Felder je Tick statt 1 (für alle Geschick-Stufen gleich)");
  for (let i = 0; i < 400 && a.an; i++) a.schritt(0.5, true, 1); check(!a.an && a.wert === 0 && a.faktor === 1, "Bei 0 % endet der Sprint von selbst");
  check(!a.umschalten() && !a.an, "Neu sprinten erst ab 20 % Ausdauer");
  a.schritt(1.4, false, 1); check(a.wert === 0, "Erholung beginnt erst 1,5 s (3 Ticks) nach dem Sprintende"); a.schritt(1.1, false, 1); check(a.wert > 0, `… danach füllt sie sich (${a.wert.toFixed(2)} %)`);
  const b = new S.Ausdauer(); b.umschalten(); for (let i = 0; i < 20; i++) b.schritt(0.5, false, 1); check(b.wert === 100, "Sprint an, aber stehen bleiben: kein Verbrauch"); }
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Sprint: alles in Ordnung"); process.exit(f ? 1 : 0);
