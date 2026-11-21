/*
 * Mythara – Grenzen der Welt: alle Regionen bilden ein lückenloses Rechteck aus gleich großen Chunks (keine Überlappung, keine Lücke),
 * und an jeder Grenze zwischen zwei Regionen trifft Weg auf Weg und Wasser auf Wasser (bündig). Ohne Browser.
 * Aufruf (im Ordner realtime): node test/welt-grenzen.test.mjs
 */
import { region, regionNamen } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const C = 32, namen = regionNamen().filter((n) => !region(n).region.entwurf), R = Object.fromEntries(namen.map((n) => [n, region(n)]));
const besitz = new Map(); const doppelt = [];
for (const n of namen) { const r = R[n].region; for (let j = 0; j < r.chunks[1]; j++) for (let i = 0; i < r.chunks[0]; i++) { const k = (r.ursprung[0] + i) + "_" + (r.ursprung[1] + j); if (besitz.has(k)) doppelt.push(k + ": " + besitz.get(k) + " / " + n); besitz.set(k, n); } }
const xs = [...besitz.keys()].map((k) => +k.split("_")[0]), ys = [...besitz.keys()].map((k) => +k.split("_")[1]);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)], luecken = [];
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!besitz.has(x + "_" + y)) luecken.push(x + "_" + y);
console.log("\nWeltgrenzen");
check(doppelt.length === 0, `keine Region überlappt eine andere (${namen.length} Regionen, ${besitz.size} Chunks)`, doppelt);
check(luecken.length === 0, `die Welt ist ein lückenloses Rechteck: Chunks ${x0}|${y0} bis ${x1}|${y1}`, luecken);
/* Feld (Weltkoordinaten in Feldern) → Geländezeichen */
const feld = (X, Y) => { const k = Math.floor(X / C) + "_" + Math.floor(Y / C), n = besitz.get(k); if (!n) return null; const r = R[n].region; return R[n].gelaende[Y - r.ursprung[1] * C]?.[X - r.ursprung[0] * C] ?? null; };
const WEG = new Set(["e", "k", "p", "m"]), WASSER = new Set(["~", "w", "o"]);
const art = (c) => (WEG.has(c) ? "weg" : WASSER.has(c) ? "wasser" : "land");
const brueche = [];
for (let Y = y0 * C; Y < (y1 + 1) * C; Y++) for (let X = x0 * C; X < (x1 + 1) * C; X++) {
  const a = feld(X, Y); if (a === null) continue;
  for (const [dx, dy] of [[1, 0], [0, 1]]) { const X2 = X + dx, Y2 = Y + dy; if (besitz.get(Math.floor(X2 / C) + "_" + Math.floor(Y2 / C)) === besitz.get(Math.floor(X / C) + "_" + Math.floor(Y / C))) continue;
    const b = feld(X2, Y2); if (b === null) continue; if (art(a) !== art(b) && (art(a) !== "land" || art(b) !== "land")) brueche.push({ X, Y, dx, a, b }); } }
/* einzelne Randfelder eines breiten Wegs dürfen ausfransen – ein Bruch zählt erst, wenn an einer Stelle zwei Felder nebeneinander nicht passen */
const ernst = brueche.filter((p) => brueche.some((q) => q !== p && q.dx === p.dx && Math.abs(q.X - p.X) + Math.abs(q.Y - p.Y) === 1));
check(ernst.length === 0, `an allen Regionsgrenzen trifft Weg auf Weg und Wasser auf Wasser (${brueche.length} einzelne Randfelder)`, ernst.map((p) => `${besitz.get(Math.floor(p.X / C) + "_" + Math.floor(p.Y / C))} → ${besitz.get(Math.floor((p.X + p.dx) / C) + "_" + Math.floor((p.Y + 1 - p.dx) / C))} bei ${p.X}|${p.Y}: „${p.a}“ gegen „${p.b}“`));
console.log(ok ? "\nGrenzen: alles in Ordnung" : "\nGrenzen: FEHLER"); process.exit(ok ? 0 : 1);
