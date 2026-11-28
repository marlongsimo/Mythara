/*
 * Welt-Test Brücken (#187): Jede Brücke und jeder Steg ist eine durchgehende Reihe – die Stücke stoßen lückenlos und gerade aneinander
 * (gleiche Drehung, gleiche Zeile bzw. Spalte), stehen in der 3D-Welt alle gleich hoch (Höhen aus echtzeit/welt3d), der Weg darüber ist
 * Feld für Feld begehbar, und mindestens ein Ende liegt an Land (Brücken über Flüsse: beide). Keine losen Stücke im Wasser.
 * Aufruf (im Ordner realtime, nach drei.mjs): node test/welt-bruecken.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 15)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), C = 32, DREI = join(WELT, "..", "..", "echtzeit", "welt3d");
const ST = { dorf_bruecke_01: [-3.2, -2.7, 3.2, 0.1], moor_bruecke_alt_01: [-3.2, -2.7, 3.2, 0.1], moor_bruecke_alt_02: [-3.2, -2.7, 3.2, 0.1], moor_bruecke_alt_03: [-3.2, -2.7, 3.2, 0.1], moor_bruecke_morsch_01: [-3.2, -2.7, 3.2, 0.1], dorf_bruecke_02: [-1.4, -5.2, 1.4, 0.1],
    /* Steinbrücken der Hochlande (3D-Modelle um den Fußpunkt zentriert, Stücke im Abstand 6,6) */ hochland_bruecke_kopf_w: [-3.3, -1.4, 3.3, 1.4], hochland_bruecke_mitte_ow: [-3.3, -1.4, 3.3, 1.4], hochland_bruecke_kopf_o: [-3.3, -1.4, 3.3, 1.4], hochland_steinbruecke_ow: [-3.3, -1.4, 3.3, 1.4], hochland_steinbruecke: [-1.6, -6.4, 1.6, 0.1] };
const stuecke = [], R = new G.WeltRaster();
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const ux = r.ursprung[0] * C, uy = r.ursprung[1] * C, obj = JSON.parse(readFileSync(join(WELT, "regionen", n, "objekte.json"), "utf8")).filter((p) => ST[p.objekt]); if (!obj.length) continue;
  for (const c of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const p of obj) { const st = ST[p.objekt], k = p.s || 1, d = ((p.dreh || 0) % 360 + 360) % 360, x = p.x + ux, y = p.y + uy;
    const e = [[st[0], st[1]], [st[2], st[3]]].map(([a, b]) => { const [u, v] = d === 90 ? [-b, a] : d === 180 ? [-a, -b] : d === 270 ? [b, -a] : [a, b]; return [x + u * k, y + v * k]; });
    stuecke.push({ id: p.id, objekt: p.objekt, x, y, dreh: d, region: n, r: [Math.min(e[0][0], e[1][0]), Math.min(e[0][1], e[1][1]), Math.max(e[0][0], e[1][0]), Math.max(e[0][1], e[1][1])], g: -1 }); } }
/* Reihen wie drei.mjs: Stücke, die sich berühren */
const beruehrt = (a, b) => a.r[0] < b.r[2] + 2.5 && b.r[0] < a.r[2] + 2.5 && a.r[1] < b.r[3] + 2.5 && b.r[1] < a.r[3] + 2.5;   /* großzügig: auch Stücke mit Lücke gehören zur Reihe */
let ng = 0; for (const s of stuecke) { if (s.g >= 0) continue; s.g = ng; const q = [s]; while (q.length) { const a = q.pop(); for (const b of stuecke) if (b.g < 0 && beruehrt(a, b)) { b.g = ng; q.push(b); } } ng++; }
/* Bodenhöhe wie client/src/welt3d/motor.ts gelaendeHoehe (Eckpunkte aus den 3D-Chunks) */
const chunk = new Map(), eck = (wx, wy) => { const cx = Math.floor(wx / C), cy = Math.floor(wy / C);
  for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) { const k = `${cx + dx}_${cy + dy}`; if (!chunk.has(k)) { const f = join(DREI, k + ".json"); chunk.set(k, existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null); }
    const s = chunk.get(k); if (!s) continue; const lx = wx - (cx + dx) * C, ly = wy - (cy + dy) * C; if (lx > C + 1 || ly > C + 1) continue; return s.hoehe[(ly + 1) * (C + 3) + lx + 1] / 100; } return 0; };
const hoehe = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, a = eck(xi, zi), b = eck(xi + 1, zi), c = eck(xi, zi + 1), e = eck(xi + 1, zi + 1); return fx + fz < 1 ? a + (b - a) * fx + (c - a) * fz : e + (c - e) * (1 - fx) + (b - e) * (1 - fz); };

console.log(`\nBrücken und Stege: ${stuecke.length} Stücke in ${ng} Reihen`);
const luecken = [], schief = [], stufen = [], gesperrt = [], lose = [], ufer = [];
for (let g = 0; g < ng; g++) { const reihe = stuecke.filter((s) => s.g === g), name = reihe.map((s) => s.id).join(", ");
  const waag = (reihe[0].r[2] - reihe[0].r[0]) >= (reihe[0].r[3] - reihe[0].r[1]);   /* Ost–West (sonst Nord–Süd) */
  if (reihe.length > 1) {
    if (reihe.some((s) => s.dreh !== reihe[0].dreh) || reihe.some((s) => Math.abs((waag ? s.r[1] : s.r[0]) - (waag ? reihe[0].r[1] : reihe[0].r[0])) > 0.05)) schief.push(name);
    const sort = [...reihe].sort((a, b) => (waag ? a.r[0] - b.r[0] : a.r[1] - b.r[1]));
    for (let i = 1; i < sort.length; i++) { const lu = waag ? sort[i].r[0] - sort[i - 1].r[2] : sort[i].r[1] - sort[i - 1].r[3]; if (lu > 0.05) luecken.push(`${sort[i - 1].id} → ${sort[i].id}: ${lu.toFixed(2)} Felder Lücke`); }
    const h = reihe.map((s) => hoehe(s.x, s.y)); if (Math.max(...h) - Math.min(...h) > 0.02) stufen.push(`${name}: Höhen ${h.map((v) => v.toFixed(2)).join(" / ")}`); }
  /* Mittellinie: Feld für Feld begehbar; Enden: an Land? */
  const x0 = Math.min(...reihe.map((s) => s.r[0])), y0 = Math.min(...reihe.map((s) => s.r[1])), x1 = Math.max(...reihe.map((s) => s.r[2])), y1 = Math.max(...reihe.map((s) => s.r[3]));
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, schritte = []; if (waag) for (let x = x0 + 0.5; x <= x1 - 0.5; x += 0.5) schritte.push([x, my]); else for (let y = y0 + 0.5; y <= y1 - 0.5; y += 0.5) schritte.push([mx, y]);
  const zu = schritte.filter(([x, y]) => !R.begehbar(x, y)); if (zu.length) gesperrt.push(`${name}: ${zu.length} gesperrte Stellen, z. B. ${zu[0].map((v) => v.toFixed(1)).join("|")}`);
  const enden = waag ? [[x0 - 1.5, my], [x1 + 1.5, my]] : [[mx, y0 - 1.5], [mx, y1 + 1.5]], anLand = enden.filter(([x, y]) => R.begehbar(x, y) && !R.wasser?.(x, y)).length;
  if (!anLand) lose.push(`${name} (${mx.toFixed(0)}|${my.toFixed(0)})`);
  if (reihe.length > 1 && !/steg|mole/.test(name) && anLand < 2)   /* einzelne Stücke mit einem Ende im Wasser sind Anleger (Fähre, Boote) */ ufer.push(`${name}: nur ${anLand} Ende an Land`); }
check(!luecken.length, "die Stücke jeder Reihe stoßen lückenlos aneinander", luecken);
check(!schief.length, "jede Reihe ist gerade (gleiche Drehung, gleiche Zeile bzw. Spalte)", schief);
check(!stufen.length, "alle Stücke einer Reihe stehen in 3D gleich hoch", stufen);
check(!gesperrt.length, "der Weg über jede Brücke und jeden Steg ist durchgehend begehbar", gesperrt);
check(!lose.length, "kein loses Stück im Wasser (mindestens ein Ende an Land)", lose);
check(!ufer.length, "Brücken über Flüsse: beide Enden an Land", ufer);
console.log(ok ? "\nBrücken: alles in Ordnung" : "\nBrücken: FEHLER"); process.exit(ok ? 0 : 1);
