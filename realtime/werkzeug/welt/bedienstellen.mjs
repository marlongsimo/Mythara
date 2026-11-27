/*
 * World Pipeline – Bedienstellen (#57, 27.11.2026): für jede Station (Esse, Amboss, Werkbank, Ofen, Herd, Kessel, Bindestein, Brunnen, Feuer) und jeden
 * Kessel/Amboss/Ofen aus den Bauplänen: steht sie in einem Gebäude, dann den Innenraum (Rechteck in Weltfeldern), die Tür und einen Stehplatz drinnen,
 * von der Tür aus erreichbar. Das Spiel bedient eine Station in einem Gebäude nur, wenn der Held im Innenraum steht (sonst läuft er zum Stehplatz).
 * Schreibt welt/bedienstellen.json. Aufruf (im Ordner realtime): node werkzeug/welt/bedienstellen.mjs   (nach bauen.mjs; Test: test/welt-bedienstellen.test.mjs)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, regionNamen, WELT, REALTIME } from "./laden.mjs";

const G = await gemeinsam(), bib = bibliothek(), BIB = new Map(bib.objekte.objekte.map((o) => [o.id, o]));
const BAU = new Map(((j) => j.bauplaene || j)(JSON.parse(readFileSync(join(WELT, "bibliothek", "bauplaene.json"), "utf8"))).map((b) => [b.id, b]));
const WEIT = 2.6;   /* HANDWERK_WEIT in shared/handwerk.ts */
const oberwelt = regionNamen().filter((n) => { const r = region(n).region; return !r.ebene && !r.entwurf && !n.startsWith("fl_"); }), reg = {};
const R = new G.WeltRaster(); for (const n of oberwelt) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const gebietVon = (x, y) => oberwelt.find((n) => { const [X, Y] = ur(n), [b, h] = reg[n].region.chunks.map((v) => v * 32); return x >= X && y >= Y && x < X + b && y < Y + h; });

/* 1. Stationen sammeln */
const stationen = [];
const S = readFileSync(join(REALTIME, "shared", "handwerk.ts"), "utf8");
for (const [, id, x, y] of S.matchAll(/(esse|amboss|bindestein): \{ id: "\w+", name: "[^"]+", x: ([\d.]+), y: ([\d.]+)/g)) stationen.push({ id, station: id, x: +x, y: +y, quelle: "shared/handwerk.ts" });
stationen.push({ id: "werkbank_osthof", station: "werkbank", x: 6530.5, y: 6426.5, quelle: "shared/handwerk.ts" });
for (const k of JSON.parse(readFileSync(join(REALTIME, "shared", "kochstellen.json"), "utf8")).stellen) stationen.push({ id: k.id, station: k.station, x: k.x, y: k.y, quelle: "shared/kochstellen.json" });
const ART = { hand_werkbank_01: "werkbank", hand_herd_01: "herd", hand_kessel_01: "kessel", hand_backofen_01: "backofen", wz_bindestein: "bindestein" };
for (const n of oberwelt) { const [X, Y] = ur(n); for (const o of reg[n].objekte) {
  if (ART[o.objekt] && !stationen.some((s) => Math.hypot(s.x - X - o.x, s.y - Y - o.y) < 1.5)) stationen.push({ id: o.id, station: ART[o.objekt], x: X + o.x, y: Y + o.y, quelle: `welt/regionen/${n} (Objekt)` });
  const bp = BAU.get(o.objekt); for (const m of bp?.innen?.moebel || []) { const st = { kessel: "kessel", amboss: "amboss", ofen: "backofen", esse: "esse", herd: "herd", werkbank: "werkbank" }[m.art]; if (!st) continue;
    const s = o.s ?? 1, x = X + o.x + m.x * s * (o.spiegeln ? -1 : 1), y = Y + o.y - m.d * s;
    if (!stationen.some((q) => q.station === st && Math.hypot(q.x - x, q.y - y) < 2)) stationen.push({ id: stationen.some((q) => q.id === `${o.id}_${m.art}`) || reg[n].objekte.filter((p) => p.id === o.id).length > 1 || oberwelt.some((r) => r !== n && reg[r].objekte.some((p) => p.id === o.id && BAU.get(p.objekt)?.innen?.moebel?.length)) ? `${n}_${o.id}_${m.art}` : `${o.id}_${m.art}`, station: st, x: +x.toFixed(2), y: +y.toFixed(2), quelle: `Bauplan ${o.objekt} (${n})` }); } } }

/* 2. Gebäude je Station, Tür, Stehplatz, und ob man sie von außen durch die Wand erreicht hätte */
const raum = (x, y) => { const n = gebietVon(x, y); if (!n) return null; const [X, Y] = ur(n);
  for (const o of reg[n].objekte) { const k = BIB.get(o.objekt)?.kollision; if (k?.art !== "gebaeude") continue; const s = o.s ?? 1, sp = o.spiegeln ? -1 : 1;
    for (const kk of k.koerper) { const xa = X + o.x + Math.min(kk.x0 * sp, kk.x1 * sp) * s, xb = X + o.x + Math.max(kk.x0 * sp, kk.x1 * sp) * s, ya = Y + o.y + kk.y0 * s, yb = Y + o.y + kk.y1 * s;
      if (x > xa && x < xb && y > ya && y < yb) { const t = (k.tueren || [])[0]; const tx = t ? X + o.x + ((t.x0 + t.x1) / 2) * sp * s : X + o.x, ty = Y + o.y + (t ? t.y : 0) * s;
        return { gebaeude: o.id, objekt: o.objekt, region: n, rechteck: [+xa.toFixed(2), +ya.toFixed(2), +xb.toFixed(2), +yb.toFixed(2)], tuer: [+tx.toFixed(2), +ty.toFixed(2)] }; } } } return null; };
const flut = (sx, sy, box) => { const s = 4, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]]; if (!R.begehbar(sx, sy)) return () => false; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const aus = [];
for (const st of stationen) { const r = raum(st.x, st.y); const e = { ...st };
  if (r) { const [xa, ya, xb, yb] = r.rechteck, drin = flut(r.tuer[0], r.tuer[1] - 0.6, [xa - 0.5, ya - 0.5, xb + 0.5, yb + 0.5]);
    let best = null; for (let y = ya + 0.3; y < yb - 0.2; y += 0.25) for (let x = xa + 0.3; x < xb - 0.2; x += 0.25) { const d = Math.hypot(x - st.x, y - st.y); if (d < 0.6 || d > WEIT - 0.1 || !drin(x, y)) continue; if (!best || d < best[2]) best = [x, y, d]; }
    let aussen = null; for (let y = st.y - WEIT; y <= st.y + WEIT; y += 0.25) for (let x = st.x - WEIT; x <= st.x + WEIT; x += 0.25) { if (Math.hypot(x - st.x, y - st.y) > WEIT || (x > xa && x < xb && y > ya && y < yb) || !R.begehbar(x, y)) continue; aussen = [+x.toFixed(2), +y.toFixed(2)]; break; }
    Object.assign(e, { innen: true, gebaeude: r.gebaeude, bauplan: r.objekt, region: r.region, innenraum: r.rechteck, tuer: r.tuer, stehplatz: best ? [+best[0].toFixed(2), +best[1].toFixed(2)] : null, von_aussen_in_greifweite: aussen }); }
  else Object.assign(e, { innen: false, region: gebietVon(st.x, st.y) || null });
  aus.push(e); }
writeFileSync(join(WELT, "bedienstellen.json"), JSON.stringify({ hinweis: "Welt #57: Stationen in Gebäuden mit Innenraum (Rechteck x0, y0, x1, y1 in Weltfeldern), Tür und Stehplatz drinnen. Regel fürs Spiel: Station in einem Gebäude nur bedienen, wenn der Held im Innenraum steht; sonst zum Stehplatz laufen (durch die Tür). „von_aussen_in_greifweite“: ein Feld außerhalb der Wand, von dem aus die Greifweite (2,6) heute reicht – der Fehler aus #57. Erzeugt von werkzeug/welt/bedienstellen.mjs.", stationen: aus }, null, 1) + "\n");
for (const e of aus) console.log(`${e.innen ? "innen " : "außen "} ${e.id.padEnd(28)} ${e.station.padEnd(10)} ${e.innen ? `${e.gebaeude} Stehplatz ${JSON.stringify(e.stehplatz)}${e.von_aussen_in_greifweite ? "  ⚠ von außen " + JSON.stringify(e.von_aussen_in_greifweite) : ""}` : e.region}`);
