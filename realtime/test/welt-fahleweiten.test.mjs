/*
 * Mythara – Phase 8 vorab (Welt #50), ohne Browser: Nordsaum-Weg mit Dornenwall, Fahle Weiten, Heidrast, Grenzposten, Hügelgräber mit drei Grabkammern,
 * Kernbaum-Tal, Grauwacht (Burg, Abtei, Unterstadt), Brücke zur Furt (endet im Wasser). Erreichbarkeit zu Fuß von Heidrast aus, Eingänge, Bossraum.
 * Aufruf (im Ordner realtime): node test/welt-fahleweiten.test.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const NAMEN = ["fl_186_169", "fl_201_169", "fl_186_183", "fl_201_183", "nordsaum", "grabkammer_1", "grabkammer_2", "hauptmann_grab", "hauptmann_gruft"], reg = {};
for (const n of NAMEN) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const alleIa = new Map(); for (const n of NAMEN) { const [X, Y] = ur(n); for (const i of reg[n].spiel.interaktionen) alleIa.set(i.id, { ...i, x: i.x + X, y: i.y + Y, region: n }); }
const flut = (sx, sy, b) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]]; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < b[0] || ny / s < b[1] || nx / s > b[2] || ny / s > b[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const greifbar = (f, x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (f(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
console.log("\nFahle Weiten");
const OBEN = flut(6596, 5876, [6150, 5600, 6800, 6336]);
const pflicht = ["heidrast", "heidrast_wegstein", "schafpferch", "grenzposten", "grenzposten_wappen", "huegelgraeber", "kernbaum_tal", "grauwacht_platz", "grauwacht_bergfried_tuer", "grauwacht_burgtor_innen",
  "grauwacht_bank_tuer", "grauwacht_schmiede_tuer", "grauwacht_wegstein", "abtei_kirche_tuer", "glocke", "abtei_kessel", "abtei_bindestein", "furtbruecke", "grabkammer_1_eingang", "grabkammer_2_eingang", "hauptmann_eingang"];
const fehlt = pflicht.filter((id) => !alleIa.has(id)), weg = pflicht.filter((id) => alleIa.has(id) && !greifbar(OBEN, alleIa.get(id).x, alleIa.get(id).y));
check(!fehlt.length, `${pflicht.length} Lesestellen und Eingänge vorhanden`, fehlt);
check(!weg.length, "alle von Heidrast aus zu Fuß erreichbar (Grauwacht, Abtei, Burg, Gräber, Tal, Grenzposten)", weg);
check(OBEN(6744, 5760) && OBEN(6760, 5760), "die Brücke zur Furt führt seit Phase 11 (#147) über den Grauen Sund – Wache und Schild, keine Sperre (Weg in die Hochlande prüft welt-hochlande)");
const A = JSON.parse(readFileSync(join(WELT, "grauwacht_ausbau.json"), "utf8"));
const nicht = [...A.adern, ...A.eisenhut, ...A.kernbaeume].filter((p) => !greifbar(OBEN, p.x, p.y, 1.6));
check(!nicht.length, `Adern (${A.adern.length}), Eisenhut (${A.eisenhut.length}) und Kernbäume (${A.kernbaeume.length}) erreichbar`, nicht.map((p) => p.id));
check(A.npc.every((p) => OBEN(p.x, p.y) || greifbar(OBEN, p.x, p.y, 1.2)), `${A.npc.length} NPC-Plätze auf begehbarem Boden`, A.npc.filter((p) => !greifbar(OBEN, p.x, p.y, 1.2)).map((p) => p.id));
const stufen = new Set(); for (const n of NAMEN.slice(0, 4)) for (const o of reg[n].objekte) { if (o.ausbau) stufen.add(o.ausbau); if (o.ausbau_bis) stufen.add("bis:" + o.ausbau_bis); }
check(stufen.has("abtei") && stufen.has("burg") && stufen.has("bis:abtei") && stufen.has("bis:burg"), "Objekte nach Ausbaustufen gekennzeichnet (ab Abtei, ab Burg, bis Abtei, bis Burg)", [...stufen]);
console.log("\nNordsaum-Weg");
const [NX, NY] = ur("nordsaum"), dw = reg.nordsaum.spiel.interaktionen.find((i) => i.id === "dornenwall"), sp = reg.nordsaum.spiel.kollision.sperren.find((s) => s.schalter === "dornenwall_offen");
check(Boolean(dw && sp), "Dornenwall als Questobjekt mit Sperre (Schalter dornenwall_offen)");
const SUED = flut(NX + 307.5, NY + 47, [NX + 295, NY + 20, NX + 312, NY + 64]);   /* nur der Wegkorridor: ringsum ist Wald (begehbar) */
check(greifbar(SUED, dw.x + NX, dw.y + NY) && !SUED(NX + 300, NY + 26), "der Dornenwall ist vom Uferweg aus erreichbar und sperrt den Weg (im Wegkorridor)");
console.log("\nGrabkammern");
for (const [ein, n, ziele] of [["grabkammer_1_eingang", "grabkammer_1", ["grabkammer_1_sarg", "grabkammer_1_hinauf"]], ["grabkammer_2_eingang", "grabkammer_2", ["grabkammer_2_sarg", "grabkammer_2_hinauf"]], ["hauptmann_eingang", "hauptmann_grab", ["hauptmann_siegel", "hauptmann_gruft_tor", "hauptmann_hinauf"]]]) {
  const e = alleIa.get(ein), [zx, zy] = e.daten.ziel, f = flut(zx, zy, [ur(n)[0] - 2, ur(n)[1] - 2, ur(n)[0] + 66, ur(n)[1] + 66]);
  const schlecht = ziele.filter((id) => !greifbar(f, alleIa.get(id).x, alleIa.get(id).y)); const hin = alleIa.get(ziele[ziele.length - 1]);
  check(R.begehbar(zx, zy) && !schlecht.length && greifbar(OBEN, hin.daten.ziel[0], hin.daten.ziel[1]), `${n}: Eingang führt hinein, alles erreichbar, und wieder hinauf`, schlecht); }
const tor = alleIa.get("hauptmann_gruft_tor"), fb = flut(tor.daten.ziel[0], tor.daten.ziel[1], [ur("hauptmann_gruft")[0] - 2, ur("hauptmann_gruft")[1] - 2, ur("hauptmann_gruft")[0] + 34, ur("hauptmann_gruft")[1] + 34]);
check(greifbar(fb, alleIa.get("hauptmann_sarkophag").x, alleIa.get("hauptmann_sarkophag").y) && greifbar(fb, alleIa.get("hauptmann_gruft_ausgang").x, alleIa.get("hauptmann_gruft_ausgang").y), "Bossraum (eigenes Gebiet): Sarkophag und Ausgang erreichbar");
const gl = A.grablichter.filter((l) => { const n = l.region, f = flut(alleIa.get(n === "hauptmann_grab" ? "hauptmann_eingang" : n + "_eingang").daten.ziel[0], alleIa.get(n === "hauptmann_grab" ? "hauptmann_eingang" : n + "_eingang").daten.ziel[1], [ur(n)[0] - 2, ur(n)[1] - 2, ur(n)[0] + 66, ur(n)[1] + 66]); return !greifbar(f, l.x, l.y, 1.5); });
check(A.grablichter.length >= 7 && !gl.length, `${A.grablichter.length} Grablichter in den Grabkammern greifbar`, gl.map((l) => l.id));
console.log(ok ? "\nFahle Weiten: alles in Ordnung" : "\nFahle Weiten: FEHLER"); process.exit(ok ? 0 : 1);
