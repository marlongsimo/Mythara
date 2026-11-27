/*
 * Mythara – Den Süden beleben (Welt #120), ohne Browser: sieben Orte entlang der Südstraße, alle Lesestellen, NPC-, Gegner-, Fisch-, Kräuter-, Erz-, Holz- und
 * Seelenlicht-Plätze von Weidenhain aus zu Fuß erreichbar; die Furt in Lehmfurt ist bis zur Quest gesperrt (Schalter), der Steinbruch hat Erze.
 * Aufruf (im Ordner realtime): node test/welt-sueden.test.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const NAMEN = ["weidenhain", "obstwiesen", "rabenmoor", "fl_186_211", "fl_201_211", "fl_186_225", "fl_201_225"], reg = {};
for (const n of NAMEN) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const IA = new Map(); for (const n of NAMEN) { const [X, Y] = ur(n); for (const i of reg[n].spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + X, y: i.y + Y }); }
const [WX, WY] = ur("weidenhain"), s = 2, seen = new Set(), q = [[Math.floor((WX + reg.weidenhain.spiel.start[0][0]) * s), Math.floor((WY + reg.weidenhain.spiel.start[0][1]) * s)]];
while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < 6100 || ny / s < 6650 || nx / s > 6700 || ny / s > 7400 || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
const ok_ = (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)), greifbar = (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (ok_(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
const S = JSON.parse(readFileSync(join(WELT, "sueden_orte.json"), "utf8"));
console.log("\nSüden");
const pflicht = ["heckenhof", "heckenhof_herd", "summweide", "bienenstoecke", "schilfsee", "saegemuehle", "saegemuehle_werkbank", "koehlermeiler", "waldsenke", "lehmfurt_schmiede", "steinbruch", "furt", "wegkapelle", "halber_weg", "wegelager_nord", "wegelager_sued"];
const fehlt = pflicht.filter((id) => !IA.has(id)), weg = pflicht.filter((id) => IA.has(id) && !greifbar(IA.get(id).x, IA.get(id).y));
check(!fehlt.length, `${pflicht.length} Lesestellen vorhanden`, fehlt); check(!weg.length, "alle zu Fuß von Weidenhain aus erreichbar", weg);
const stellen = [...S.npc.map((p) => ["npc " + p.id, p.x, p.y, 1.2]), ...S.gegner.map((p) => ["gegner " + p.id, p.x, p.y, 3]), ...S.kraeuter.map((p) => ["kraut " + p.id, p.x, p.y, 1]), ...S.erze.map((p) => ["erz " + p.id, p.x, p.y, 1.6]),
  ...S.holz.filter((p) => !p.vorhanden).map((p) => ["holz " + p.id, p.x, p.y, 2]), ...S.seelenlichter.map((p) => ["licht " + p.id, p.x, p.y, 1.8]), ...S.fischplaetze.map((p) => ["fisch " + p.id, p.stehplatz[0], p.stehplatz[1], 0.8]), ...S.troedler.map((p) => ["trödler", p.x, p.y, 0.5])];
const nicht = stellen.filter(([, x, y, w]) => !greifbar(x, y, w)); check(!nicht.length, `${stellen.length} Plätze (NPC, Gegner, Kräuter, Erze, Holz, Licht, Fisch, Trödler) erreichbar`, nicht.map((p) => p[0]));
check(S.fischplaetze.every((f) => !R.begehbar(f.x, f.y)), "Fischplätze: Fanggrund im Wasser");
const sp = Object.values(reg).flatMap((r) => (r.spiel.kollision?.sperren || []).filter((x) => x.schalter === "lehmfurt_trittsteine")); check(sp.length === 1, "Furt in Lehmfurt: Sperre mit Schalter lehmfurt_trittsteine (Quest S5)");
check(S.erze.length >= 3 && new Set(S.erze.map((e) => e.art)).size === 3, "Steinbruch: Kupfer, Eisen, Schwarzeisen (keine neuen Rohstoffe)");
console.log(ok ? "\nSüden: alles in Ordnung" : "\nSüden: FEHLER"); process.exit(ok ? 0 : 1);
