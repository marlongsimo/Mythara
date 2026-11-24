/*
 * World Pipeline – Daten für die 3D-Welt (echtzeit/welt3d.html), Chunk für Chunk wie die 2D-Welt (22.11.2026).
 *   echtzeit/welt3d/index.json        Objektarten, Geländearten, Baupläne, Gebiete (mit Ebene), Liste der Chunks, Startpunkt
 *   echtzeit/welt3d/<cx>_<cy>.json    je Chunk: boden (34 × 34 Zeichen, mit einem Feld Rand der Nachbarn), geh (32 × 32 aus der 2D-Welt),
 *                                     hoehe (35 × 35 Eckpunkte, ein Punkt Rand, in Hundertsteln eines Feldes), dinge, figuren, interaktionen
 * Alle Koordinaten sind Weltfelder wie in der 2D-Welt und auf dem Server. Die Höhe ist reine Darstellung (Server, Kollision und Kampf
 * rechnen weiter in der Ebene): sanfte Hügel, eben unter Häusern und auf Wegen, Wasser tiefer; im Untergrund werden Felsfelder zu Wänden.
 * Höhen werden je Ebene über das ganze Rechteck gerechnet, damit sie an Chunkgrenzen nahtlos sind.
 * Aufruf (im Ordner realtime): node werkzeug/welt/drei.mjs         (danach bei Bedarf: python3 werkzeug/welt/kenney3d.py)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { WELT, WURZEL, region, regionNamen, bibliothek } from "./laden.mjs";

const C = 32, bib = bibliothek(), ARTEN = bib.gelaende.arten, OBJ = new Map(bib.objekte.objekte.map((o) => [o.id, o]));
const PLAN = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "bauplaene.json"), "utf8")).bauplaene.map((p) => [p.id, p]));
const ZIEL = join(WURZEL, "echtzeit", "welt3d"), ECHTZEIT = join(WURZEL, "echtzeit", "welt"); mkdirSync(ZIEL, { recursive: true });
for (const f of readdirSync(ZIEL)) if (/^\d+_\d+\.json$/.test(f) || f === "daten.json") unlinkSync(join(ZIEL, f));
const alle = regionNamen().map((n) => region(n));
/* Ebenen: die Oberwelt (alle Gebiete ohne „ebene“) und jedes Untergrund-Gebiet für sich */
const ebenen = [{ name: "oberwelt", art: "oberwelt", regs: alle.filter((r) => !r.region.ebene) }, ...alle.filter((r) => r.region.ebene).map((r) => ({ name: r.region.id, art: r.region.ebene, regs: [r] }))];   /* ebene: untergrund (Höhle) oder innen (Obergeschoss) */

const typen = [], typNr = new Map(), typVon = (o) => { if (!typNr.has(o.id)) { typNr.set(o.id, typen.length); typen.push({ id: o.id, kategorie: o.kategorie, bild: o.bild, groesse: o.groesse, anker: o.anker, massstab: o.massstab || 1, kollision: o.kollision || null, plan: PLAN.has(o.id) }); } return typNr.get(o.id); };
const RAUM = { f: 3.4, v: 0.9, ".": 1.7, ",": 1.7, a: 0.35, e: 0.25, k: 0.15, p: 0.05, s: 0.4, m: 0.3, t: 0.5, d: 0, h: 0.15, F: 1.5, "~": 0.2, w: 0.2, o: 0.2, " ": 3.4 };
const WASSER = new Set(ARTEN.filter((a) => a.wasser).map((a) => a.zeichen));
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const glatt = (t) => t * t * (3 - 2 * t);
const wert = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = glatt(x - xi), fy = glatt(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
const rauschen = (x, y) => 1.0 * wert(x / 23, y / 23) + 0.5 * wert(x / 11 + 31, y / 11 + 17) + 0.25 * wert(x / 5 + 7, y / 5 + 91);
const verwischen = (a, w, h, r) => { for (let lauf = 0; lauf < 2; lauf++) { const t = new Float32Array(w * h);
    for (let y = 0; y < h; y++) { let s = 0, n = 0; for (let x = -r; x < w + r; x++) { if (x + r < w) { s += a[y * w + Math.min(w - 1, x + r)]; n++; } if (x - r - 1 >= 0) { s -= a[y * w + x - r - 1]; n--; } if (x >= 0 && x < w) t[y * w + x] = s / Math.max(1, n); } }
    for (let x = 0; x < w; x++) { let s = 0, n = 0; for (let y = -r; y < h + r; y++) { if (y + r < h) { s += t[Math.min(h - 1, y + r) * w + x]; n++; } if (y - r - 1 >= 0) { s -= t[(y - r - 1) * w + x]; n--; } if (y >= 0 && y < h) a[y * w + x] = s / Math.max(1, n); } } }
  return a; };

const chunks = [], gebiete = []; let start = null;
for (const E of ebenen) {
  let cx0 = Infinity, cy0 = Infinity, cx1 = -Infinity, cy1 = -Infinity;
  for (const r of E.regs) { const [ux, uy] = r.region.ursprung, [cw, ch] = r.region.chunks; cx0 = Math.min(cx0, ux); cy0 = Math.min(cy0, uy); cx1 = Math.max(cx1, ux + cw); cy1 = Math.max(cy1, uy + ch); }
  const X0 = cx0 * C, Y0 = cy0 * C, B = (cx1 - cx0) * C, H = (cy1 - cy0) * C, unten = E.art === "untergrund", innen = E.art === "innen";
  const boden = Array.from({ length: H }, () => Array(B).fill(unten ? "F" : innen ? "X" : " ")), dinge = [];
  for (const r of E.regs) { const [ux, uy] = r.region.ursprung, ox = ux * C - X0, oy = uy * C - Y0;
    r.gelaende.forEach((z, y) => { for (let x = 0; x < z.length; x++) boden[oy + y][ox + x] = z[x]; });
    for (const p of r.objekte) { const o = OBJ.get(p.objekt); if (o) dinge.push([typVon(o), +(p.x + ux * C).toFixed(2), +(p.y + uy * C).toFixed(2), p.s || 1, p.spiegeln ? 1 : 0]); }
    gebiete.push({ id: r.region.id, name: r.region.name, untertitel: r.region.untertitel || "", ebene: r.region.ebene || "oberwelt", biom: r.region.biom || "", x: ux * C, y: uy * C, b: r.region.chunks[0] * C, h: r.region.chunks[1] * C });
    if (r.region.id === "waldmark" && r.spiel.start && r.spiel.start[0]) start = [r.spiel.start[0][0] + ux * C, r.spiel.start[0][1] + uy * C]; }
  /* Höhen über das ganze Rechteck der Ebene */
  const W = B + 1, Hh = H + 1, raum = new Float32Array(W * Hh), nass = new Float32Array(W * Hh), fels = new Float32Array(W * Hh), fuss = new Float32Array(W * Hh).fill(99);
  const zeichen = (x, y) => boden[Math.max(0, Math.min(H - 1, y))][Math.max(0, Math.min(B - 1, x))];
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { let s = 0, n = 0, f = 0; for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const z = zeichen(x + dx, y + dy); s += RAUM[z] ?? 1; n += WASSER.has(z) ? 1 : 0; f += z === "F" ? 1 : 0; }
    raum[y * W + x] = s / 4; nass[y * W + x] = n / 4; fels[y * W + x] = f === 4 ? 1 : 0; }
  verwischen(raum, W, Hh, 3); verwischen(nass, W, Hh, 1);
  for (const [t, wx, wy] of dinge) { const ty = typen[t], k = ty.kollision; if (!k) continue; const x = wx - X0, y = wy - Y0;
    const rechtecke = k.art === "gebaeude" ? k.koerper.map((r) => [x + r.x0, y + r.y0, x + r.x1, y + r.y1]) : k.art === "rechteck" && ty.kategorie !== "bewuchs" ? [[x + k.x, y + k.y, x + k.x + k.b, y + k.y + k.h]] : ty.kategorie === "kleinteil" && k.art === "kreis" ? [[x - k.r, y - k.r, x + k.r, y + k.r]] : [];
    for (const [a0, b0, a1, b1] of rechtecke) for (let yy = Math.floor(b0 - 5); yy <= Math.ceil(b1 + 5); yy++) for (let xx = Math.floor(a0 - 5); xx <= Math.ceil(a1 + 5); xx++) {
      if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue; const d = Math.hypot(Math.max(a0 - xx, 0, xx - a1), Math.max(b0 - yy, 0, yy - b1)); fuss[yy * W + xx] = Math.min(fuss[yy * W + xx], d); } }
  const hoehe = new Int16Array(W * Hh);
  if (innen) { /* Obergeschoss: eben */ }
  else if (unten) { const f = Float32Array.from(fels); verwischen(f, W, Hh, 1);   /* Höhle: Felsfelder werden zu Wänden, der Boden bleibt fast eben */
    for (let i = 0; i < W * Hh; i++) { const x = i % W, y = (i - x) / W; hoehe[i] = Math.round(100 * (Math.pow(f[i], 0.8) * (3.6 + 0.8 * rauschen(x + X0, y + Y0)) + 0.12 * (rauschen(x * 3 + X0, y * 3 + Y0) - 0.8))); } }
  else for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x, haus = glatt(Math.max(0, Math.min(1, (fuss[i] - 1) / 3)));
    hoehe[i] = Math.round(100 * (raum[i] * haus * (rauschen(x + X0, y + Y0) - 0.45) - 0.7 * nass[i] * haus)); }
  /* Senken (Bergbau, spiel.json → senken, eingetragen von lichtungen.mjs): weiche Mulde, in der Mitte „tiefe“ Felder tiefer */
  if (!innen && !unten) for (const r of E.regs) for (const sk of r.spiel.senken || []) { const mx = r.region.ursprung[0] * C - X0 + sk.x, my = r.region.ursprung[1] * C - Y0 + sk.y, R = sk.r + 1.5;
    for (let y = Math.max(0, Math.floor(my - R)); y <= Math.min(Hh - 1, Math.ceil(my + R)); y++) for (let x = Math.max(0, Math.floor(mx - R)); x <= Math.min(W - 1, Math.ceil(mx + R)); x++) {
      const t = 1 - Math.hypot(x - mx, y - my) / R; if (t > 0) hoehe[y * W + x] -= Math.round(100 * sk.tiefe * glatt(Math.min(1, t * 1.6))); } }
  /* je Chunk schreiben */
  const geh = new Map(); for (let cy = cy0; cy < cy1; cy++) for (let cx = cx0; cx < cx1; cx++) { const f = join(ECHTZEIT, `${cx}_${cy}.json`); if (existsSync(f)) geh.set(`${cx}_${cy}`, JSON.parse(readFileSync(f, "utf8"))); }
  for (let cy = cy0; cy < cy1; cy++) for (let cx = cx0; cx < cx1; cx++) { const d2 = geh.get(`${cx}_${cy}`); if (!d2) continue;
    const lx = (cx - cx0) * C, ly = (cy - cy0) * C, b = [], h = [];
    for (let y = -1; y <= C; y++) { let z = ""; for (let x = -1; x <= C; x++) z += zeichen(lx + x, ly + y); b.push(z); }
    for (let y = -1; y <= C + 1; y++) for (let x = -1; x <= C + 1; x++) { const gx = Math.max(0, Math.min(B, lx + x)), gy = Math.max(0, Math.min(H, ly + y)); h.push(hoehe[gy * W + gx]); }
    const meine = dinge.filter(([, x, y]) => Math.floor(x / C) === cx && Math.floor(y / C) === cy);
    writeFileSync(join(ZIEL, `${cx}_${cy}.json`), JSON.stringify({ cx, cy, region: d2.region, ebene: E.name, art: E.art, boden: b, geh: d2.geh, hoehe: h, dinge: meine,
      figuren: (d2.figuren || []).map((p) => ({ figur: p.figur, x: p.x, y: p.y })), interaktionen: d2.interaktionen || [] }));
    chunks.push(`${cx}_${cy}`); }
}
const arten = Object.fromEntries(ARTEN.map((a) => [a.zeichen, { id: a.id, farbe: a.farbe, wasser: Boolean(a.wasser), begehbar: a.begehbar }]));
const bauplaene = Object.fromEntries(typen.filter((t) => t.plan).map((t) => [t.id, PLAN.get(t.id)]));
const stand = Date.now().toString(36);
writeFileSync(join(ZIEL, "index.json"), JSON.stringify({ stand, chunkFelder: C, start, gebiete, arten, typen, bauplaene, chunks }));
console.log(`3D-Daten: ${gebiete.length} Gebiete, ${chunks.length} Chunks, ${typen.length} Objektarten, ${Object.keys(bauplaene).length} Baupläne → echtzeit/welt3d/ (Stand ${stand})`);
