/*
 * Mythara Echtzeit – Prüfung: Chunk-Bau der World Pipeline (Gehraster, Kollision der Objekte, Aufteilung in Chunks).
 * Aufruf (im Ordner realtime): node test/welt-bau.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const G = await gemeinsam(), bib = bibliothek(), d = region("beispiel"), kopie = (v) => JSON.parse(JSON.stringify(v));
const def = new Map(bib.objekte.objekte.map((o) => [o.id, o]));
const geh = G.gehRaster(d, bib.gelaende, bib.objekte), an = (x, y) => geh[Math.floor(y)][Math.floor(x)];

check(geh.length === 64 && geh.every((z) => z.length === 64 && /^[.~#]+$/.test(z)), "Gehraster: 64 × 64 Felder, nur „.“, „~“ und „#“");
check(an(46, 18) === "~" && an(30, 32) === "." && an(2.5, 32) === ".", "Gelände: Teich ist Wasser, Platz und Weg sind frei");
check(d.objekte.every((p) => p.y < 0 || p.x < 0 || p.x >= 64 || p.y >= 64 || an(p.x, p.y) === "#"), "jedes Objekt mit Kollision versperrt das Feld unter seinem Fußpunkt");
{ const p = d.objekte.find((o) => o.id === "brunnen"), f = G.sperrFelder(p, def.get(p.objekt));
  check(f.length >= 3 && f.length <= 7 && f.every(([i, j]) => Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y) < 1.1 * (p.s ?? 1) + 0.8), `Brunnen (Kreis 1,1): versperrt ${f.length} Felder rund um den Fußpunkt`); }
{ const p = { id: "x", objekt: "o", x: 10, y: 10 }, o = { kollision: { art: "rechteck", x: -1, y: -2, b: 2, h: 2 } };
  check(G.sperrFelder(p, o).length === 4, "Rechteck 2 × 2 genau auf dem Raster: vier Felder");
  check(G.sperrFelder({ ...p, s: 2 }, o).length === 16, "doppelter Maßstab: sechzehn Felder");
  const schief = { kollision: { art: "rechteck", x: 0, y: -1, b: 3, h: 1 } }, re = G.sperrFelder(p, schief).map((f) => f[0]), li = G.sperrFelder({ ...p, spiegeln: true }, schief).map((f) => f[0]);
  check(Math.min(...re) === 10 && Math.max(...re) === 12 && Math.min(...li) === 7 && Math.max(...li) === 9, "gespiegelt: die Fläche liegt auf der anderen Seite des Fußpunkts");
  check(G.sperrFelder(p, { kollision: { art: "vieleck", punkte: [[-1, -1], [1, -1], [1, 1], [-1, 1]] } }).length === 4, "Vieleck: vier Felder");
  check(G.sperrFelder(p, { kollision: null }).length === 0 && G.sperrFelder({ ...p, kollision: null }, o).length === 0, "ohne Kollision (auch von Hand abgeschaltet): nichts versperrt"); }
{ const k = kopie(d); k.spiel.kollision.sperren.push({ art: "rechteck", x0: 10, y0: 30, x1: 12, y1: 32 }); k.spiel.kollision.freigeben.push({ art: "rechteck", x0: 46, y0: 18, x1: 47, y1: 19 });
  const g = G.gehRaster(k, bib.gelaende, bib.objekte);
  check(g[30][10] === "#" && g[31][11] === "#" && g[32][12] === geh[32][12], "von Hand sperren: genau die Fläche");
  check(g[18][46] === "." && g[18][47] === "~", "von Hand freigeben: ein Feld im Teich wird begehbar (Steg), der Rest bleibt Wasser"); }

const bau = G.chunksBauen({ ...d, region: { ...d.region, ursprung: [3, 5] } }, bib.gelaende, bib.objekte);
check(bau.chunks.length === 4 && bau.chunks.map((c) => `${c.cx}_${c.cy}`).sort().join() === "3_5,3_6,4_5,4_6", "vier Chunks an ihrem Platz im Weltgitter");
check(bau.chunks.every((c) => c.geh.length === 32 && c.geh.every((z) => z.length === 32)), "jeder Chunk hat 32 × 32 Felder Gehraster");
check(bau.chunks.reduce((s, c) => s + c.objekte.length, 0) === d.objekte.length && new Set(bau.chunks.flatMap((c) => c.objekte.map((o) => o.id))).size === d.objekte.length, "jedes Objekt liegt in genau einem Chunk");
check(bau.chunks.every((c) => c.objekte.every((o) => (o.x < 96 || G.chunkVon(o.x) === c.cx || o.x >= 160) && G.chunkVon(Math.max(160, Math.min(223.99, o.y))) === c.cy)), "… und zwar in dem, in dem sein Fußpunkt steht (Weltkoordinaten)");
check(bau.chunks.every((c) => c.objekte.every((o, i, a) => i === 0 || a[i - 1].y <= o.y)), "Objekte je Chunk von hinten nach vorn geordnet");
{ const zusammen = []; for (let j = 0; j < 64; j++) zusammen.push(bau.chunks.filter((c) => c.cy === 5 + Math.floor(j / 32)).sort((a, b) => a.cx - b.cx).map((c) => c.geh[j % 32]).join(""));
  check(zusammen.join("\n") === geh.join("\n"), "die Chunks ergeben zusammengesetzt wieder das Gehraster der Region (keine Lücke an den Nähten)"); }
check(bau.kopf.start[0][0] === d.spiel.start[0][0] + 96 && bau.kopf.spawnzonen[0].zone.x === 46 + 96 && bau.kopf.ausgaenge[0].zone.y0 === d.spiel.ausgaenge[0].zone.y0 + 160, "Start, Spawnzonen und Ausgänge stehen in Weltkoordinaten");
check(bau.benutzt.includes("dorf_brunnen") && bau.benutzt.every((id) => def.has(id)), "Liste der verwendeten Objekte");
{ const fig = bau.chunks.flatMap((c) => c.figuren), akt = bau.chunks.flatMap((c) => c.interaktionen);
  check(fig.length === 1 && akt.length === 1 && fig[0].x === d.spiel.figuren[0].x + 96, "Figuren und Interaktionen liegen in ihren Chunks"); }

console.log(ok ? "\nChunk-Bau: alles in Ordnung" : "\nChunk-Bau: FEHLER"); process.exit(ok ? 0 : 1);
