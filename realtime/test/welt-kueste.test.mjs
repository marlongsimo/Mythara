/*
 * Mythara – Phase 10 vorab (Welt #82), ohne Browser: Südstraße von Weidenhain, Kielmund, Möwenbucht, Kräuterhof, Leuchtturm, Wrack, Mangroven,
 * Klippenhöhlen mit Kajüte (Instanz). Alles zu Fuß von Weidenhain erreichbar; Fischplätze, Adern und Eiben greifbar.
 * Aufruf (im Ordner realtime): node test/welt-kueste.test.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const NAMEN = ["weidenhain", "fl_186_211", "fl_201_211", "fl_186_225", "fl_201_225", "fl_186_239", "fl_201_239", "klippenhoehlen", "wrack_kajuete"], reg = {};
for (const n of NAMEN) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const IA = new Map(); for (const n of NAMEN) { const [X, Y] = ur(n); for (const i of reg[n].spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + X, y: i.y + Y }); }
const flut = (sx, sy, b) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]]; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < b[0] || ny / s < b[1] || nx / s > b[2] || ny / s > b[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const greifbar = (f, x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (f(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
const O = JSON.parse(readFileSync(join(WELT, "kueste_orte.json"), "utf8"));
console.log("\nSmaragdküste");
const [WX, WY] = ur("weidenhain"), K = flut(WX + reg.weidenhain.spiel.start[0][0], WY + reg.weidenhain.spiel.start[0][1], [6000, 6650, 6700, 7700]);
const pflicht = ["suedstrasse_schild", "kiel_quelle", "kielmund", "kai", "werft", "taverne_ankerkraut", "kuestenhaus", "kielmund_bank_tuer", "kielmund_werkstatt", "fischmarkt", "mole", "kielmund_wegstein", "kielmund_bindestein",
  "leuchtturm", "waerterhaus", "klippenhoehlen_eingang", "moewenbucht", "raeucherhuette", "kraeuterhof", "wrack", "mangroven"];
const fehlt = pflicht.filter((id) => !IA.has(id)), weg = pflicht.filter((id) => IA.has(id) && !greifbar(K, IA.get(id).x, IA.get(id).y));
check(!fehlt.length, `${pflicht.length} Lesestellen vorhanden`, fehlt); check(!weg.length, "alle zu Fuß von Weidenhain aus erreichbar (über die Südstraße, offene Welt)", weg);
const fp = O.fischplaetze.filter((f) => !greifbar(K, ...f.stehplatz, 0.6) || R.begehbar(f.x, f.y));
check(O.fischplaetze.length >= 5 && !fp.length, `${O.fischplaetze.length} Fischplätze (Hering, Klippenbarsch, Seeaal): Stehplatz erreichbar, Fanggrund im Wasser`, fp.map((f) => f.id));
const roh = [...O.adern, ...O.eiben].filter((p) => !greifbar(K, p.x, p.y, 1.6)); check(O.adern.length >= 3 && !roh.length, `Kupfer/Eisen (${O.adern.length}) und Eiben (${O.eiben.length}) erreichbar`, roh.map((p) => p.id));
const npc = O.npc.filter((p) => !greifbar(K, p.x, p.y, 1.2)); check(!npc.length, `${O.npc.length} NPC-Plätze erreichbar`, npc.map((p) => p.id));
console.log("\nKlippenhöhlen");
const e = IA.get("klippenhoehlen_eingang"), [HX, HY] = ur("klippenhoehlen"), H = flut(e.daten.ziel[0], e.daten.ziel[1], [HX - 2, HY - 2, HX + 66, HY + 66]);
const innen = ["klippenhoehlen_hinaus", "gezeitenbecken", "schmugglerlager", "rettungsboot", "kajuete_tuer"].filter((id) => !greifbar(H, IA.get(id).x, IA.get(id).y));
check(R.begehbar(...e.daten.ziel) && !innen.length && greifbar(K, ...IA.get("klippenhoehlen_hinaus").daten.ziel), "Eingang führt hinein, alles erreichbar, und wieder hinaus", innen);
const kt = IA.get("kajuete_tuer").daten.ziel, [KX, KY] = ur("wrack_kajuete"), KJ = flut(kt[0], kt[1], [KX - 2, KY - 2, KX + 34, KY + 34]);
check(greifbar(KJ, IA.get("logbuch_seite").x, IA.get("logbuch_seite").y) && greifbar(H, ...IA.get("kajuete_hinaus").daten.ziel), "Kajüte des Kapitäns (eigenes Gebiet, Instanz): Logbuchseite erreichbar, zurück in die Höhle");
console.log(ok ? "\nKüste: alles in Ordnung" : "\nKüste: FEHLER"); process.exit(ok ? 0 : 1);
