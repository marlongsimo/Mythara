/*
 * World Pipeline – erzeugt die Prüfwelt: eine große, dicht bewachsene Region zum Messen von Nachladen und Leistung.
 * Aufruf (im Ordner realtime): node werkzeug/welt/pruefwelt.mjs [breit=6] [hoch=4]   (Größe in Chunks)
 * Schreibt welt/regionen/pruefwelt/ (als Entwurf: wird nicht mit ausgeliefert). Danach: node werkzeug/welt/bauen.mjs pruefwelt
 * Die Region liegt weit weg von allem anderen im Weltgitter (Ursprung 100 | 100).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
const CB = Number(process.argv[2]) || 6, CH = Number(process.argv[3]) || 4, B = CB * 32, H = CH * 32;
let saat = 7; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wegY = (x) => H / 2 + 7 * Math.sin(x / 17) + 3 * Math.sin(x / 6.3), nebenX = (y) => B * 0.62 + 5 * Math.sin(y / 9);
/* Teiche und Lichtungen als Ellipsen [x, y, rx, ry] */
const teiche = Array.from({ length: Math.round(CB * CH / 4) }, () => [8 + wurf() * (B - 16), 8 + wurf() * (H - 16), 4 + wurf() * 5, 3 + wurf() * 4]).filter(([x, y]) => Math.abs(y - wegY(x)) > 9 && Math.abs(x - nebenX(y)) > 9);
const lichtungen = Array.from({ length: Math.round(CB * CH / 2) }, () => [wurf() * B, wurf() * H, 7 + wurf() * 9, 5 + wurf() * 7]);
const inEllipse = (l, x, y, k = 1) => l.some(([ex, ey, rx, ry]) => Math.hypot((x - ex) / (rx * k), (y - ey) / (ry * k)) < 1);
const g = [];
for (let y = 0; y < H; y++) { let z = ""; for (let x = 0; x < B; x++) {
  const amWeg = Math.abs(y - wegY(x)) < 1.7 || (Math.abs(x - nebenX(y)) < 1.4 && y < wegY(x));
  const platz = Math.hypot(x - B * 0.62, y - wegY(B * 0.62)) < 5.5;
  z += platz ? "p" : amWeg ? "e" : inEllipse(teiche, x + 0.5, y + 0.5) ? "w" : inEllipse(lichtungen, x, y) || Math.abs(y - wegY(x)) < 5 ? (inEllipse(lichtungen, x, y, 0.5) ? "," : ".") : "f"; }
  g.push(z); }
/* Bäume: dicht im Wald, vereinzelt auf der Wiese, nie auf Weg, Platz oder im Wasser, mit Mindestabstand */
const objekte = [], gitter = new Map(), zelle = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
const frei = (x, y, ab) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) for (const p of gitter.get(zelle(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < ab) return false; return true; };
for (let n = 0; n < B * H * 0.9; n++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2), c = g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))];
  if (c === "e" || c === "p" || c === "w") continue; const wald = c === "f"; if (!wald && wurf() > 0.06) continue;
  if (Math.abs(y - wegY(x)) < 3 || Math.abs(x - nebenX(y)) < 2.6 || inEllipse(teiche, x, y, 1.25) || !frei(x, y, wald ? 2.3 : 5)) continue;
  const w = wurf(), art = w < 0.26 ? 1 : w < 0.5 ? 2 : w < 0.74 ? 3 : w < 0.8 ? 4 : w < 0.9 ? 5 : 6, p = { id: "b" + String(objekte.length + 1).padStart(4, "0"), objekt: "wald_baum" + art, x, y, s: +(0.85 + wurf() * 0.27).toFixed(2) };
  if (wurf() < 0.5) p.spiegeln = true; objekte.push(p); const k = zelle(x, y); gitter.set(k, [...(gitter.get(k) || []), p]); }
objekte.sort((a, b) => a.y - b.y);
const sy = +wegY(2.5).toFixed(1), spiel = { start: [[2.5, sy], [1.5, sy - 1], [1.5, sy + 1]], figuren: [], spawnzonen: [], interaktionen: [],
  ausgaenge: [{ id: "west", zone: { art: "rechteck", x0: 0, y0: sy - 3, x1: 0.8, y1: sy + 3 }, nach: { art: "ort", ort: "waldmark" }, text: "Zurück in die Waldmark" }], kollision: { sperren: [], freigeben: [] } };
/* An jedem Teich eine Krötengruppe (für die spätere Messung mit Gegnern) */
teiche.forEach(([x, y, rx, ry], i) => { const zx = Math.min(B - 4, Math.max(4, x)), zy = Math.min(H - 4, y + ry + 3.5); spiel.spawnzonen.push({ id: "teich_" + (i + 1), zone: { art: "kreis", x: +zx.toFixed(1), y: +zy.toFixed(1), r: 3 }, gegner: [{ art: "schlammkroete", anzahl: 2 }, { art: "kroetchen", anzahl: 1 }], aggro: 7, leine: 16, respawn: 120, abgleich: "server" }); });
const ordner = join(WELT, "regionen", "pruefwelt"); mkdirSync(ordner, { recursive: true });
writeFileSync(join(ordner, "region.json"), JSON.stringify({ id: "pruefwelt", name: "Prüfwelt", ursprung: [100, 100], chunks: [CB, CH], biom: "wald", stufe: 1, entwurf: true }, null, 1) + "\n");
writeFileSync(join(ordner, "gelaende.txt"), g.join("\n") + "\n");
writeFileSync(join(ordner, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(ordner, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`Prüfwelt: ${CB} × ${CH} Chunks (${B} × ${H} Felder), ${objekte.length} Bäume, ${teiche.length} Teiche, ${spiel.spawnzonen.length} Spawnzonen`);
