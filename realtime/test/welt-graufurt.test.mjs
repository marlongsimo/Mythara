/*
 * Mythara – Graufurt, Ostufer und der Turm mit dem grünen Licht (Phase 7 vorab), ohne Browser:
 * Von Graufurts Westtor erreicht man zu Fuß Markt, Hafen (Winde, Fähre, Fischplatz) und die Furtklamm; das Ostufer ist zu Fuß NICHT erreichbar
 * (weder aus Graufurt noch vom Festland), vom Ostanleger aus aber Turm, Weltenbäume und Urgestein; im Turm führen die Treppen hinauf bis aufs Dach.
 * Aufruf (im Ordner realtime): node test/welt-graufurt.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const NAMEN = ["graufurt", "ostufer", "osthang", "fl_212_198", "fl_216_198", "fl_216_211", "fl_201_211", "turm_ebene1", "turm_ebene2", "turm_ebene3", "turm_dach"];
const reg = Object.fromEntries(NAMEN.map((n) => [n, region(n)]));
for (const n of NAMEN) for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c);
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32), ia = (n, id) => { const i = reg[n].spiel.interaktionen.find((i) => i.id === id); if (!i) return null; const [x0, y0] = ur(n); return { ...i, x: i.x + x0, y: i.y + y0 }; };
const nah = (p) => { if (!p) return null; for (let r = 0; r < 3; r += 0.25) for (let t = 0; t < 6.3; t += 0.4) { const q = { x: p.x + Math.cos(t) * r, y: p.y + Math.sin(t) * r }; if (R.begehbar(q.x, q.y)) return q; } return null; };
/* Flutfüllung in halben Feldern */
const flut = (start, box) => { const s = 2, seen = new Set(), q = [[Math.floor(start.x * s), Math.floor(start.y * s)]]; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !R.begehbar((nx + 0.5) / s, (ny + 0.5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (p) => p && seen.has(Math.floor(p.x * s) + "," + Math.floor(p.y * s)); };
const [GX, GY] = ur("graufurt"), BOX = [GX - 120, GY - 60, GX + 400, GY + 400], NAH = [GX - 120, GY - 60, GX + 256, GY + 352];   /* NAH: nur Graufurt und Ostufer – der lange Weg über die Glutsande zählt nicht */
console.log("\nGraufurt");
const west = nah({ x: GX + 3, y: GY + reg.graufurt.spiel.start[0][1] }), inStadt = flut(west, NAH);
for (const id of ["markt", "bergfried_tuer", "kapelle_tuer", "bank_tuer", "taverne_tuer", "schmiede_tuer", "faehrhaus_tuer", "wegstein_markt", "winde_westanleger", "faehre", "fischplatz", "furtklamm"])
  check(inStadt(nah(ia("graufurt", id))), `vom Westtor zu Fuß erreichbar: ${id}`);
const [OX, OY] = ur("ostufer"), ost = nah(ia("graufurt", "ostanleger"));
check(Boolean(ost) && !inStadt(ost), "der Ostanleger ist vom Westufer aus NICHT zu Fuß erreichbar");
for (const id of ["turm_wappentuer", "turm_ansehen_nah"]) check(!inStadt(nah(ia("ostufer", id))), `das Ostufer (${id}) ist zu Fuß nicht erreichbar`);
/* Phase 9 (#74, offene Welt): über den Pass im Südosten ist das Ostufer vom Festland (Glutsande) aus zu Fuß erreichbar – nur nicht direkt über den Fluss */
const vomFestland = flut(nah({ x: 6920, y: 6746 }), BOX);   /* an der Wegmarke „Ende des Grases“ (Glutsande) */
check(vomFestland(nah(ia("ostufer", "turm_wappentuer"))), "offener Übergang: von den Glutsanden führt der Weg über den Pass aufs Ostufer");
console.log("\nOstufer");
const amOst = flut(ost, BOX);
check(amOst(nah(ia("ostufer", "turm_wappentuer"))), "vom Ostanleger zu Fuß bis zur Wappentür");
check(reg.ostufer.spiel.kollision.sperren.length === 6, "6 gesperrte Felder: 3 Weltenbäume, 3 Urgestein-Adern");
for (const { x0: x, y0: y } of reg.ostufer.spiel.kollision.sperren) check(amOst(nah({ x: OX + x + 0.5, y: OY + y + 2 })), `neben Weltenbaum/Urgestein ${x}|${y} erreichbar`);
console.log("\nTurm");
const tuer = ia("ostufer", "turm_wappentuer"), e1 = { x: tuer.daten.ziel[0], y: tuer.daten.ziel[1] };
check(R.begehbar(e1.x, e1.y), "die Wappentür führt in den Turm auf freien Boden");
let p = e1;
for (const [n, m] of [["turm_ebene1", "turm_ebene2"], ["turm_ebene2", "turm_ebene3"], ["turm_ebene3", "turm_dach"]]) { const h = ia(n, "treppe_hinauf"), H = nah(h); const z = { x: h.daten.ziel[0], y: h.daten.ziel[1] };
  check(Boolean(H) && R.weg(p, H, 0.3, 200).length > 0 && R.begehbar(z.x, z.y), `${n}: zu Fuß zur Treppe, sie führt nach ${m}`); p = z; }
check(R.weg(p, nah(ia("turm_dach", "signalfeuer")), 0.3, 200).length > 0, "auf dem Dach: Signalfeuer erreichbar");
check(R.weg({ x: ia("turm_ebene2", "treppe_hinauf").daten.ziel[0], y: ia("turm_ebene2", "treppe_hinauf").daten.ziel[1] }, nah(ia("turm_ebene3", "waechterbuch")), 0.3, 200).length > 0, "Ebene 3: Wächterbuch erreichbar");
const raus = ia("turm_ebene1", "turm_tuer_hinaus"); check(Boolean(raus) && amOst(nah({ x: raus.daten.ziel[0], y: raus.daten.ziel[1] })), "die Turmtür führt zurück aufs Ostufer");
console.log(ok ? "\nGraufurt: alles in Ordnung" : "\nGraufurt: FEHLER"); process.exit(ok ? 0 : 1);
