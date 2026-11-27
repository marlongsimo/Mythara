/*
 * Mythara – Phase 9 vorab (Welt #74), ohne Browser: Glutsande mit Glutbrunn, Kanal, Salzpfanne, Oase und versandetem Tempel; Archiv im Rathaus der Waldmark.
 * Von der Wegmarke „Ende des Grases“ (am Pass des Ostufers) zu Fuß erreichbar; Tempel mit drei Räumen und Kammer (Instanz); Archiv vom Ratssaal aus.
 * Aufruf (im Ordner realtime): node test/welt-glutsande.test.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const NAMEN = ["fl_216_198", "fl_231_198", "fl_216_211", "fl_231_211", "ostufer", "tempel", "tempel_kammer", "rathaus_oben", "rathaus_archiv"], reg = {};
for (const n of NAMEN) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const IA = new Map(); for (const n of NAMEN) { const [X, Y] = ur(n); for (const i of reg[n].spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + X, y: i.y + Y, region: n }); }
const flut = (sx, sy, b) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]]; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < b[0] || ny / s < b[1] || nx / s > b[2] || ny / s > b[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const greifbar = (f, x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (f(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
const O = JSON.parse(readFileSync(join(WELT, "glutsande_orte.json"), "utf8"));
console.log("\nGlutsande");
const SAND = flut(6920, 6746, [6780, 6400, 7500, 7100]);
const pflicht = ["ende_des_grases", "kanal", "lager_west", "lager_ost", "salzpfanne", "siederei", "tempel_tor", "oase", "glutbrunn", "glutbrunn_bank_tuer", "glutbrunn_werkstatt", "badehaus", "karawanenrast", "glutbrunn_wegstein", "glutbrunn_bindestein", "hafenmole", "fischplatz_strom"];
const fehlt = pflicht.filter((id) => !IA.has(id)), weg = pflicht.filter((id) => IA.has(id) && !greifbar(SAND, IA.get(id).x, IA.get(id).y));
check(!fehlt.length, `${pflicht.length} Lesestellen vorhanden`, fehlt); check(!weg.length, "alle von „Ende des Grases“ aus zu Fuß erreichbar", weg);
check(greifbar(SAND, IA.get("turm_wappentuer").x, IA.get("turm_wappentuer").y), "offener Übergang: über den Pass ins Ostufer (bis zum Turm)");
const roh = [...O.adern, O.weltenbaum].filter((p) => !greifbar(SAND, p.x, p.y, 1.6)); check(!roh.length, `Ureisen (${O.adern.length}) und Weltenbaum erreichbar`, roh.map((p) => p.id));
check(greifbar(SAND, ...O.fischplatz.stehplatz, 0.5) && !R.begehbar(O.fischplatz.x, O.fischplatz.y), "Fischplatz: Stehplatz am Ufer, Fanggrund im Wasser");
const npc = O.npc.filter((p) => !greifbar(SAND, p.x, p.y, 1.2)); check(!npc.length, `${O.npc.length} NPC-Plätze erreichbar`, npc.map((p) => p.id));
console.log("\nTempel");
const tor = IA.get("tempel_tor"), [tx, ty] = tor.daten.ziel, [TX, TY] = ur("tempel"), T = flut(tx, ty, [TX - 2, TY - 2, TX + 98, TY + 66]);
const raeume = ["tempel_vorhalle", "spiegelplatte_1", "spiegelplatte_2", "spiegelplatte_3", "spiegelplatte_4", "lichtschacht", "inschrift", "kammer_tor", "tempel_hinauf"].filter((id) => !greifbar(T, IA.get(id).x, IA.get(id).y));
check(R.begehbar(tx, ty) && !raeume.length, "Tor führt hinein; Vorhalle, Spiegelsaal (4 Spiegelplatten), Inschriftensaal und das Tor zur Kammer erreichbar", raeume);
check(greifbar(SAND, ...IA.get("tempel_hinauf").daten.ziel), "der Weg hinauf führt vor den Tempel");
const kt = IA.get("kammer_tor").daten.ziel, [KX, KY] = ur("tempel_kammer"), K = flut(kt[0], kt[1], [KX - 2, KY - 2, KX + 34, KY + 34]);
check(greifbar(K, IA.get("kartenstueck_5").x, IA.get("kartenstueck_5").y) && greifbar(K, IA.get("kammer_ausgang").x, IA.get("kammer_ausgang").y) && greifbar(T, ...IA.get("kammer_ausgang").daten.ziel), "Kammer der Sandmutter (eigenes Gebiet): Kartenstück 5 und Ausgang erreichbar, zurück in den Tempel");
console.log("\nArchiv");
const at = IA.get("archiv_tuer"), [AX, AY] = ur("rathaus_archiv"), A = flut(at.daten.ziel[0], at.daten.ziel[1], [AX - 1, AY - 1, AX + 33, AY + 33]);
const [RX, RY] = ur("rathaus_oben"), RS = flut(...JSON.parse(JSON.stringify(reg.rathaus_oben.spiel.start[0])).map((v, i) => v + [RX, RY][i]), [RX - 1, RY - 1, RX + 33, RY + 33]);
check(Boolean(at) && greifbar(RS, at.x, at.y, 1.3), "Tür zum Archiv im Ratssaal erreichbar");
check(greifbar(A, IA.get("kartenstueck_1").x, IA.get("kartenstueck_1").y) && greifbar(RS, ...IA.get("archiv_hinaus").daten.ziel, 0.5), "im Archiv: Kartenstück 1 erreichbar, und zurück in den Ratssaal");
console.log(ok ? "\nGlutsande: alles in Ordnung" : "\nGlutsande: FEHLER"); process.exit(ok ? 0 : 1);
