/*
 * World Pipeline – Daten für den 3D-Prototyp (echtzeit/welt3d.html, 22.11.2026).
 * Fasst die genannten Gebiete zu einem Rechteck aus ganzen Chunks zusammen und schreibt echtzeit/welt3d/daten.json:
 *   boden   – Geländezeichen je Feld (Zeilen; Leerzeichen = kein Gebiet)
 *   geh     – Begehbarkeit je Feld aus den gebauten Chunks ('#' gesperrt), genau wie in der 2D-Welt
 *   hoehe   – Höhe je Eckpunkt ((B+1) × (H+1), in Hundertsteln eines Feldes): sanfte Hügel, flach unter Häusern und auf Wegen,
 *             Wasser liegt tiefer. Die Höhe ist reine Darstellung – Server, Kollision und Kampf rechnen weiter in der Ebene.
 *   typen / dinge – Objektarten (aus der Bibliothek) und alle gesetzten Objekte; bauplaene – die Baupläne der Gebäude
 * Aufruf (im Ordner realtime): node werkzeug/welt/drei.mjs [gebiet …]     (ohne Angabe: Waldmark mit Nachbarn)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT, WURZEL, region, bibliothek } from "./laden.mjs";

const C = 32, GEBIETE = process.argv.slice(2).length ? process.argv.slice(2) : ["waldmark", "waldweg", "nordwald", "osthof", "westmark"];
const regs = GEBIETE.map((n) => region(n));
let cx0 = Infinity, cy0 = Infinity, cx1 = -Infinity, cy1 = -Infinity;
for (const r of regs) { const [ux, uy] = r.region.ursprung, [cw, ch] = r.region.chunks; cx0 = Math.min(cx0, ux); cy0 = Math.min(cy0, uy); cx1 = Math.max(cx1, ux + cw); cy1 = Math.max(cy1, uy + ch); }
const X0 = cx0 * C, Y0 = cy0 * C, B = (cx1 - cx0) * C, H = (cy1 - cy0) * C;
const bib = bibliothek(), ARTEN = bib.gelaende.arten, OBJ = new Map(bib.objekte.objekte.map((o) => [o.id, o]));
const PLAN = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "bauplaene.json"), "utf8")).bauplaene.map((p) => [p.id, p]));

/* Gelände und Begehbarkeit */
const boden = Array.from({ length: H }, () => Array(B).fill(" ")), geh = Array.from({ length: H }, () => Array(B).fill("#"));
for (const r of regs) { const [ux, uy] = r.region.ursprung, ox = ux * C - X0, oy = uy * C - Y0;
  r.gelaende.forEach((z, y) => { for (let x = 0; x < z.length; x++) boden[oy + y][ox + x] = z[x]; }); }
const ECHTZEIT = join(WURZEL, "echtzeit", "welt"), figuren = [];
for (let cy = cy0; cy < cy1; cy++) for (let cx = cx0; cx < cx1; cx++) { const f = join(ECHTZEIT, `${cx}_${cy}.json`); if (!existsSync(f)) continue;
  const d = JSON.parse(readFileSync(f, "utf8")); if (!GEBIETE.includes(d.region)) continue;
  d.geh.forEach((z, y) => { for (let x = 0; x < C; x++) geh[(cy - cy0) * C + y][(cx - cx0) * C + x] = z[x] === "#" ? "#" : "."; });
  for (const p of d.figuren || []) figuren.push({ figur: p.figur, x: +(p.x - X0).toFixed(2), y: +(p.y - Y0).toFixed(2) }); }

/* Objekte (Koordinaten relativ zur linken oberen Ecke des Rechtecks) */
const typen = [], typNr = new Map(), dinge = [];
for (const r of regs) { const [ux, uy] = r.region.ursprung, ox = ux * C - X0, oy = uy * C - Y0;
  for (const p of r.objekte) { const o = OBJ.get(p.objekt); if (!o) continue;
    if (!typNr.has(o.id)) { typNr.set(o.id, typen.length); typen.push({ id: o.id, kategorie: o.kategorie, bild: o.bild, groesse: o.groesse, anker: o.anker, massstab: o.massstab || 1, kollision: o.kollision || null, plan: PLAN.has(o.id) }); }
    dinge.push([typNr.get(o.id), +(p.x + ox).toFixed(2), +(p.y + oy).toFixed(2), p.s || 1, p.spiegeln ? 1 : 0]); } }

/* Höhen: Rauschen × Spielraum. Der Spielraum hängt am Gelände (Wald hügelig, Wiese sanft, Wege und Pflaster fast eben),
   wird weich verwischt und unter Gebäuden (mit Rand) auf null gezogen – dort steht das Haus eben. */
const RAUM = { f: 3.4, v: 0.9, ".": 1.7, ",": 1.7, a: 0.35, e: 0.25, k: 0.15, p: 0.05, s: 0.4, m: 0.3, t: 0.5, d: 0, h: 0.3, F: 1.5, "~": 0.2, w: 0.2, o: 0.2, " ": 3.4 };
const WASSER = new Set(ARTEN.filter((a) => a.wasser).map((a) => a.zeichen));
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const glatt = (t) => t * t * (3 - 2 * t);
const wert = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = glatt(x - xi), fy = glatt(y - yi);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
const rauschen = (x, y) => 1.0 * wert(x / 23, y / 23) + 0.5 * wert(x / 11 + 31, y / 11 + 17) + 0.25 * wert(x / 5 + 7, y / 5 + 91);   /* 0 … 1.75 */
const verwischen = (a, w, h, r) => { /* Kastenfilter (zweimal) über ein w × h-Feld */
  for (let lauf = 0; lauf < 2; lauf++) { const t = new Float32Array(w * h);
    for (let y = 0; y < h; y++) { let s = 0, n = 0; for (let x = -r; x < w + r; x++) { if (x + r < w) { s += a[y * w + Math.min(w - 1, x + r)]; n++; } if (x - r - 1 >= 0) { s -= a[y * w + x - r - 1]; n--; } if (x >= 0 && x < w) t[y * w + x] = s / Math.max(1, n); } }
    for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let y = -r; y < h + r; y++) { if (y + r < h) { s += t[Math.min(h - 1, y + r) * w + x]; n++; } if (y - r - 1 >= 0) { s -= t[(y - r - 1) * w + x]; n--; } if (y >= 0 && y < h) a[y * w + x] = s / Math.max(1, n); } } }
  return a; };
const W = B + 1, Hh = H + 1, raum = new Float32Array(W * Hh), nass = new Float32Array(W * Hh), haus = new Float32Array(W * Hh).fill(1);
const zeichen = (x, y) => boden[Math.max(0, Math.min(H - 1, y))][Math.max(0, Math.min(B - 1, x))];
for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0; for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const z = zeichen(x + dx, y + dy); s += RAUM[z] ?? 1; n += WASSER.has(z) ? 1 : 0; }
  raum[y * W + x] = s / 4; nass[y * W + x] = n / 4; }
verwischen(raum, W, Hh, 3); verwischen(nass, W, Hh, 1);
/* Gebäude: Grundfläche + 1 Feld Rand eben, dann über 3 Felder weich ansteigend */
const fuss = new Float32Array(W * Hh).fill(99);
for (const [t, x, y] of dinge) { const ty = typen[t], k = ty.kollision; if (!k) continue;
  const rechtecke = k.art === "gebaeude" ? k.koerper.map((r) => [x + r.x0, y + r.y0, x + r.x1, y + r.y1]) : k.art === "rechteck" ? [[x + k.x, y + k.y, x + k.x + k.b, y + k.y + k.h]] : ty.kategorie === "kleinteil" && k.art === "kreis" ? [[x - k.r, y - k.r, x + k.r, y + k.r]] : [];
  for (const [a0, b0, a1, b1] of rechtecke) for (let yy = Math.floor(b0 - 5); yy <= Math.ceil(b1 + 5); yy++) for (let xx = Math.floor(a0 - 5); xx <= Math.ceil(a1 + 5); xx++) {
    if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const d = Math.hypot(Math.max(a0 - xx, 0, xx - a1), Math.max(b0 - yy, 0, yy - b1)); fuss[yy * W + xx] = Math.min(fuss[yy * W + xx], d); } }
for (let i = 0; i < W * Hh; i++) haus[i] = glatt(Math.max(0, Math.min(1, (fuss[i] - 1) / 3)));
const hoehe = new Array(W * Hh);
for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x, gx = x + X0, gy = y + Y0;
  hoehe[i] = Math.round(100 * (raum[i] * haus[i] * (rauschen(gx, gy) - 0.45) - 0.7 * nass[i] * haus[i])); }

const ziel = join(WURZEL, "echtzeit", "welt3d"); mkdirSync(ziel, { recursive: true });
const arten = Object.fromEntries(ARTEN.map((a) => [a.zeichen, { id: a.id, farbe: a.farbe, wasser: Boolean(a.wasser), begehbar: a.begehbar }]));
const start = regs[0].spiel.start && regs[0].spiel.start[0] ? [regs[0].spiel.start[0][0] + regs[0].region.ursprung[0] * C - X0, regs[0].spiel.start[0][1] + regs[0].region.ursprung[1] * C - Y0] : [B / 2, H / 2];
const gebiete = regs.map((r) => ({ id: r.region.id, name: r.region.name, untertitel: r.region.untertitel || "", x: r.region.ursprung[0] * C - X0, y: r.region.ursprung[1] * C - Y0, b: r.region.chunks[0] * C, h: r.region.chunks[1] * C }));
const bauplaene = Object.fromEntries(typen.filter((t) => t.plan).map((t) => [t.id, PLAN.get(t.id)]));
writeFileSync(join(ziel, "daten.json"), JSON.stringify({ x0: X0, y0: Y0, b: B, h: H, start, gebiete, arten, boden: boden.map((z) => z.join("")), geh: geh.map((z) => z.join("")), hoehe, typen, dinge, bauplaene, figuren }));
console.log(`3D-Daten: ${GEBIETE.join(", ")} – ${B} × ${H} Felder, ${dinge.length} Objekte, ${Object.keys(bauplaene).length} Baupläne → echtzeit/welt3d/daten.json`);
