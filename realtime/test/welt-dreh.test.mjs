/*
 * Riftmere – Drehung von Weltobjekten (#148): Platzierung.dreh (0/90/180/270°, im Uhrzeigersinn von oben, um den Fußpunkt).
 * Kollision (shared/welt/bau.ts sperrFelder, auch räumliche Gebäude), Prüfung (shared/welt/form.ts), 3D-Daten aus drei.mjs (Stelle 6 der „dinge“),
 * alte Daten ohne dreh bleiben gleich. Aufruf (im Ordner realtime): node test/welt-dreh.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
let f = 0; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) f++; };
const datei = join(tmpdir(), `riftmere-dreh-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { drehe, sperrFelder } from "./shared/welt/bau"; export { regionFehler } from "./shared/welt/form";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { drehe, sperrFelder, regionFehler } = await import(datei); void gemeinsam;
const bib = bibliothek(), def = new Map(bib.objekte.objekte.map((o) => [o.id, o])), menge = (L) => new Set(L.map((x) => x.join(","))), gleich = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

console.log("\nDrehen eines Versatzes");
check(drehe(1, 0, 90).join() === "0,1" && drehe(1, 0, 180).join() === "-1,0" && drehe(1, 0, 270).join() === "0,-1" && drehe(2, 3, 0).join() === "2,3" && drehe(2, 3).join() === "2,3", "90°: Osten wird Süden (im Uhrzeigersinn), 0° und ohne Angabe: unverändert");

console.log("\nKollision");
{ const o = { kollision: { art: "rechteck", x: 0, y: -1, b: 4, h: 1 } }, p = { id: "b", objekt: "o", x: 10, y: 10 };
  const d0 = sperrFelder(p, o), d90 = sperrFelder({ ...p, dreh: 90 }, o), d180 = sperrFelder({ ...p, dreh: 180 }, o), d270 = sperrFelder({ ...p, dreh: 270 }, o);
  check(gleich(menge(d0), menge(sperrFelder({ ...p, dreh: 0 }, o))), "dreh 0 sperrt dieselben Felder wie ohne Angabe (alte Daten gültig)");
  check(d0.every(([, j]) => j === 9) && d90.every(([i]) => i === 10) && d90.every(([, j]) => j >= 10 && j <= 13), `Rechteck 4 × 1 nach Osten → um 90° gedreht nach Süden (${d90.map((x) => x.join("|")).join(" ")})`);
  check(d180.every(([, j]) => j === 10) && Math.max(...d180.map(([i]) => i)) === 9 && d270.every(([i]) => i === 9) && Math.max(...d270.map(([, j]) => j)) === 9, "180°: nach Westen, 270°: nach Norden");
  check([d90, d180, d270].every((d) => d.length === d0.length), `gleich viele Felder in jeder Lage (${d0.length})`); }
{ const o = { kollision: { art: "kreis", r: 0.4, dx: 3, dy: 0 } }, p = { id: "k", objekt: "o", x: 20.5, y: 20.5 };
  check(sperrFelder({ ...p, dreh: 90 }, o).some(([i, j]) => i === 20 && j === 23), "Kreis mit Versatz: der Mittelpunkt dreht mit"); }
{ const D = def.get("dorf_schmiede_01"), p = { id: "s", objekt: "dorf_schmiede_01", x: 40, y: 40 };
  const g0 = sperrFelder(p, D), g90 = sperrFelder({ ...p, dreh: 90 }, D), g180 = sperrFelder({ ...p, dreh: 180 }, D);
  const box = (L) => [Math.min(...L.map((x) => x[0])), Math.min(...L.map((x) => x[1])), Math.max(...L.map((x) => x[0])), Math.max(...L.map((x) => x[1]))];
  const [a, b, c, d] = box(g0), [a9, b9, c9, d9] = box(g90);
  check(D && D.kollision.art === "gebaeude" && g90.length === g0.length && g180.length === g0.length, `räumliches Gebäude (Schmiede): gleich viele Felder gedreht (${g0.length})`);
  check(c9 - a9 === d - b && d9 - b9 === c - a, `um 90° gedreht: Breite und Tiefe tauschen (${c - a + 1}×${d - b + 1} → ${c9 - a9 + 1}×${d9 - b9 + 1})`);
  const lueckeS = [...Array(c - a + 1).keys()].map((k) => a + k).filter((i) => !g0.some(([x, y]) => x === i && y === d)), [a8, b8, c8] = box(g180);
  const lueckeN = [...Array(c8 - a8 + 1).keys()].map((k) => a8 + k).filter((i) => !g180.some(([x, y]) => x === i && y === b8));
  check(d < 40 && b8 >= 40 && lueckeS.length > 0 && lueckeN.length === lueckeS.length && lueckeN.every((i) => lueckeS.includes(79 - i)), `180°: das Gebäude liegt südlich statt nördlich des Fußpunkts, die Tür in der Nordwand (Lücke ${lueckeS.join(",")} → ${lueckeN.join(",")})`); }


console.log("\nPrüfung und 3D-Daten");
{ const R = region("beispiel"), K = JSON.parse(JSON.stringify(R)), p = K.objekte.find((o) => o.objekt && def.get(o.objekt));
  const ohne = regionFehler(K, bib.gelaende, bib.objekte).length; p.dreh = 90; const mit = regionFehler(K, bib.gelaende, bib.objekte).length; p.dreh = 45; const falsch = regionFehler(K, bib.gelaende, bib.objekte);
  check(mit === ohne && falsch.some((t) => /dreh/.test(t)), "form.ts: 90 gilt, 45 wird gemeldet („0, 90, 180 oder 270 erwartet“)"); }
{ const src = (await import("node:fs")).readFileSync(new URL("../werkzeug/welt/drei.mjs", import.meta.url), "utf8");
  check(/p\.dreh \? \[p\.dreh\]/.test(src) && /p\.dreh \? \[""\]/.test(src), "drei.mjs schreibt die Drehung an Stelle 6 der „dinge“ (Ausbau-Marke leer, wenn es keine gibt)"); }

console.log(f ? `\nDrehung: ${f} FEHLER` : "\nDrehung: alles in Ordnung");
process.exit(f ? 1 : 0);
