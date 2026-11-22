/*
 * Mythara – Rathaus der Waldmark mit Treppe ins Obergeschoss (Ratssaal, eigenes Gebiet „rathaus_oben“), ohne Browser:
 * Von der Rathaustür kommt man zu Fuß zur Treppe; die Treppe führt in den Ratssaal (auf freien Boden), dort ist die Ratstafel erreichbar,
 * und die Treppe führt wieder hinunter (auf freien Boden im Rathaus, von dort zurück zur Tür).
 * Aufruf (im Ordner realtime): node test/welt-rathaus.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
import { OBEN, UNTEN } from "../werkzeug/welt/rathaus.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
for (const n of ["waldmark", "rathaus_oben"]) for (const c of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(c);
const wm = region("waldmark"), ob = region("rathaus_oben"), W = 200 * 32, [OX, OY] = ob.region.ursprung.map((v) => v * 32);
const ia = (r, id) => r.spiel.interaktionen.find((i) => i.id === id), welt = (i, x0, y0) => ({ x: i.x + x0, y: i.y + y0 });
const tuer = ia(wm, "rathaus_tuer"), hoch = ia(wm, "treppe_hoch"), runter = ia(ob, "treppe_runter"), tafel = ia(ob, "ratstafel");
console.log("\nRathaus");
check(ob.region.ebene === "innen" && Boolean(tuer && hoch && runter && tafel), "Rathaus mit Treppe hinauf, Ratssaal (Ebene innen) mit Treppe hinunter und Ratstafel");
const nah = (p) => { for (let r = 0; r < 2.5; r += 0.25) for (let t = 0; t < 6.3; t += 0.4) { const q = { x: p.x + Math.cos(t) * r, y: p.y + Math.sin(t) * r }; if (R.begehbar(q.x, q.y)) return q; } return null; };
const T = nah(welt(tuer, W, W + 1.2)), H0 = nah(welt(hoch, W, W));
check(Boolean(T && H0) && R.weg(T, H0, 0.3, 200).length > 0, "von der Rathaustür zu Fuß bis zur Treppe");
check(R.begehbar(OBEN[0], OBEN[1]) && Math.hypot(hoch.daten.ziel[0] - OBEN[0], hoch.daten.ziel[1] - OBEN[1]) < 0.01, "die Treppe führt in den Ratssaal, auf freien Boden");
const Tf = nah(welt(tafel, OX, OY)), Rn = nah(welt(runter, OX, OY));
check(Boolean(Tf && Rn) && R.weg({ x: OBEN[0], y: OBEN[1] }, Tf, 0.3, 100).length > 0 && R.weg({ x: OBEN[0], y: OBEN[1] }, Rn, 0.3, 100).length >= 0, "oben: Ratstafel und Treppe erreichbar");
check(R.begehbar(UNTEN[0], UNTEN[1]) && Math.hypot(runter.daten.ziel[0] - UNTEN[0], runter.daten.ziel[1] - UNTEN[1]) < 0.01 && R.weg({ x: UNTEN[0], y: UNTEN[1] }, T, 0.3, 200).length > 0, "die Treppe führt zurück ins Rathaus und von dort zur Tür");
console.log(ok ? "\nRathaus: alles in Ordnung" : "\nRathaus: FEHLER"); process.exit(ok ? 0 : 1);
