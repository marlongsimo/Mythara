/* Mythara – Sprint (shared/sprint.ts) nach „Sprintkonzept v1.0“: +30 %, Dauer und Erholung nach Geschick, Tick 0,5 s, Erholung nach 1,5 s, Neustart ab 20 %. Aufruf: node test/sprint.test.mjs */
import { build } from "esbuild"; import { fileURLToPath } from "node:url"; import path from "node:path"; import fs from "node:fs";
const HIER = path.dirname(fileURLToPath(import.meta.url)), AUS = path.join(HIER, ".sprint.gebaut.mjs");
await build({ entryPoints: [path.join(HIER, "..", "shared", "sprint.ts")], bundle: true, platform: "node", format: "esm", outfile: AUS, logLevel: "error" }); const S = await import(AUS); fs.unlinkSync(AUS);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const lauf = (L) => { const a = new S.Ausdauer(); a.umschalten(); let t = 0; while (a.an && t < 100) { a.schritt(0.05, true, L); t += 0.05; } return t; };
check([[1, 5], [10, 8], [25, 12], [50, 17], [75, 22], [99, 27]].every(([L, s]) => Math.abs(lauf(L) - s) <= 0.3), `Sprintdauer wie im Konzept: ${[1, 10, 25, 50, 75, 99].map((L) => `Geschick ${L}: ${lauf(L).toFixed(1)} s`).join(" · ")}`);
check([[1, 1], [10, 1.25], [25, 1.6], [50, 2.1], [75, 2.6], [99, 3]].every(([L, x]) => Math.abs(S.erholungFaktor(L) - x) < 1e-9), "Erholung relativ zu Geschick 1: 1,0 / 1,25 / 1,6 / 2,1 / 2,6 / 3,0×");
{ const a = new S.Ausdauer(); a.umschalten(); check(a.faktor === 1.3, "Sprinttempo +30 % (für alle Geschick-Stufen gleich)");
  for (let i = 0; i < 400 && a.an; i++) a.schritt(0.05, true, 1); check(!a.an && a.wert === 0 && a.faktor === 1, "Bei 0 % endet der Sprint von selbst");
  check(!a.umschalten() && !a.an, "Neu sprinten erst ab 20 % Ausdauer");
  a.schritt(1.4, false, 1); check(a.wert === 0, "Erholung beginnt erst 1,5 s (3 Ticks) nach dem Sprintende"); a.schritt(0.2, false, 1); a.schritt(0.5, false, 1); check(a.wert > 0, `… danach füllt sie sich (${a.wert.toFixed(2)} %)`);
  let t = 0; while (a.wert < 100) { a.schritt(0.5, false, 1); t += 0.5; } check(Math.abs(t - 30) <= 2, `Geschick 1: von leer bis voll in etwa 30 s (${t} s)`);
  const b = new S.Ausdauer(); b.umschalten(); for (let i = 0; i < 20; i++) b.schritt(0.5, false, 1); check(b.wert === 100, "Sprint an, aber stehen bleiben: kein Verbrauch"); }
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Sprint: alles in Ordnung"); process.exit(f ? 1 : 0);
