/*
 * Mythara – Kammer der Federmutter (Welt #132), ohne Browser: Einstieg im Steinkreis auf Aschenwerth (von der Insel erreichbar), die Kammer ist ein eigenes
 * Gebiet im Untergrund (Instanz), Nest und Leiter erreichbar, die Leiter führt zurück in den Steinkreis.
 * Aufruf (im Ordner realtime): node test/welt-federmutter.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster(), reg = {};
for (const n of ["aschenwerth", "rabenmoor", "federmutter_kammer"]) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ia = (n, id) => { const i = reg[n].spiel.interaktionen.find((q) => q.id === id), [x, y] = reg[n].region.ursprung.map((v) => v * 32); return i && { ...i, x: i.x + x, y: i.y + y }; };
const flut = (sx, sy, b) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]]; seen.add(q[0].join()); while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < b[0] || ny / s < b[1] || nx / s > b[2] || ny / s > b[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } } return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const greifbar = (f, x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (f(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
console.log("\nFedermutter");
const [AX, AY] = reg.aschenwerth.region.ursprung.map((v) => v * 32), st = reg.aschenwerth.spiel.start[0], insel = flut(AX + st[0], AY + st[1], [AX - 10, AY - 10, AX + 140, AY + 170]);
const ab = ia("aschenwerth", "federmutter_abstieg"); check(Boolean(ab) && greifbar(insel, ab.x, ab.y), "Einstieg im Steinkreis von der Insel aus erreichbar");
check(reg.federmutter_kammer.region.ebene === "untergrund" && reg.federmutter_kammer.region.chunks.join() === "1,1", "Kammer ist ein eigenes Gebiet im Untergrund (1 Chunk, als Instanz kopierbar)");
const [KX, KY] = reg.federmutter_kammer.region.ursprung.map((v) => v * 32), K = flut(ab.daten.ziel[0], ab.daten.ziel[1], [KX, KY, KX + 32, KY + 32]);
check(R.begehbar(...ab.daten.ziel) && greifbar(K, ia("federmutter_kammer", "federmutter_nest").x, ia("federmutter_kammer", "federmutter_nest").y) && greifbar(K, ia("federmutter_kammer", "federmutter_hinauf").x, ia("federmutter_kammer", "federmutter_hinauf").y), "der Abstieg führt hinein; Nest und Leiter erreichbar");
const h = ia("federmutter_kammer", "federmutter_hinauf"); check(greifbar(insel, h.daten.ziel[0], h.daten.ziel[1], 0.6), "die Leiter führt zurück in den Steinkreis");
console.log(ok ? "\nFedermutter: alles in Ordnung" : "\nFedermutter: FEHLER"); process.exit(ok ? 0 : 1);
