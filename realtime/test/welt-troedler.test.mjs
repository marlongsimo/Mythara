/*
 * Mythara – Trödler-Standorte (Welt #88), ohne Browser: jeder Standplatz liegt in seiner Region, ist ringsum frei und begehbar und vom Start der Region aus erreichbar.
 * Aufruf (im Ordner realtime): node test/welt-troedler.test.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), S = JSON.parse(readFileSync(join(WELT, "troedler_standorte.json"), "utf8")).standorte;
console.log("\nTrödler");
const schlecht = [];
for (const s of S) { const r = region(s.region), R = new G.WeltRaster(); for (const c of G.chunksBauen(r, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  const [X, Y] = r.region.ursprung.map((v) => v * 32), [B, H] = r.region.chunks.map((v) => v * 32);
  const drin = s.x >= X && s.y >= Y && s.x < X + B && s.y < Y + H; let frei = true; for (let a = 0; a < 6.3; a += 0.4) for (let d = 0; d <= s.frei; d += 0.3) if (!R.begehbar(s.x + Math.cos(a) * d, s.y + Math.sin(a) * d)) frei = false;
  const st = r.spiel.start[0], f = new Set(), q = [[Math.floor((X + st[0]) * 2), Math.floor((Y + st[1]) * 2)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (f.has(k) || nx < X * 2 || ny < Y * 2 || nx >= (X + B) * 2 || ny >= (Y + H) * 2 || !R.begehbar((nx + .5) / 2, (ny + .5) / 2)) continue; f.add(k); q.push([nx, ny]); } }
  const erreichbar = f.has(Math.floor(s.x * 2) + "," + Math.floor(s.y * 2)); if (!drin || !frei || !erreichbar) schlecht.push(`${s.id}: drin ${drin}, frei ${frei}, erreichbar ${erreichbar}`); }
check(S.length >= 5, `${S.length} Standorte: ${S.map((s) => s.id.replace("troedler_", "")).join(", ")}`);
check(!schlecht.length, "alle in ihrer Region, ringsum frei und vom Regionsstart aus erreichbar", schlecht);
console.log(ok ? "\nTrödler: alles in Ordnung" : "\nTrödler: FEHLER"); process.exit(ok ? 0 : 1);
