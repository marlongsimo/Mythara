/*
 * Mythara – Welt beleben (Welt #140), ohne Browser: Haferstedt und Netzbucht (West) von Weidenhain aus, Sandquell und Nordstrand (Glutsande) vom Pass
 * aus zu Fuß erreichbar, alle NPC-Vorschläge stehen auf begehbarem Boden, die Flächen haben Streugut (Bäume, Hecken, Felder, Teiche bzw. Felsen, Büsche,
 * Bachläufe), keine Gegnerplätze mitten in den neuen Orten, Ortsnamen auf der Karte.
 * Aufruf (im Ordner realtime): node test/welt-beleben.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek();
const B = JSON.parse(readFileSync(join(WELT, "beleben_orte.json"), "utf8")), P = JSON.parse(readFileSync(join(WELT, "festland", "plan_beleben.json"), "utf8"));
const WEST = [6030, 6650, 6700, 7400], OST = [6860, 6420, 7620, 7680];
function welt(box, extra = []) {
  const R = new G.WeltRaster(), reg = {};
  for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
    const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32;
    if (!extra.includes(n) && (x1 < box[0] || x0 > box[2] || y1 < box[1] || y0 > box[3])) continue; reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
  const IA = new Map(); for (const [n, r] of Object.entries(reg)) { const [X, Y] = r.region.ursprung.map((v) => v * 32); for (const i of r.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + X, y: i.y + Y }); }
  return { R, reg, IA };
}
const flut = (R, [sx, sy], box) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  const ok_ = (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); return (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (ok_(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; }; };
const imKasten = (b) => (p) => p.x >= b[0] && p.x < b[2] && p.y >= b[1] && p.y < b[3];

console.log("\nWelt beleben – West");
{ const { R, reg, IA } = welt(WEST, ["weidenhain"]); const [WX, WY] = reg.weidenhain.region.ursprung.map((v) => v * 32);
  const greifbar = flut(R, [WX + reg.weidenhain.spiel.start[0][0], WY + reg.weidenhain.spiel.start[0][1]], WEST);
  const pflicht = ["bl_haferstedt", "bl_netzbucht"], fehlt = pflicht.filter((id) => !IA.has(id) || !greifbar(IA.get(id).x, IA.get(id).y));
  check(!fehlt.length, "Lesestellen Haferstedt und Netzbucht vorhanden und von Weidenhain aus zu Fuß erreichbar", fehlt);
  const npc = B.npc.filter(imKasten(WEST)), weg = npc.filter((p) => !greifbar(p.x, p.y, 1.2)); check(npc.length >= 8 && !weg.length, `${npc.length} NPC-Plätze erreichbar`, weg.map((p) => p.id));
  const o = P.objekte.filter(imKasten(WEST)), z = (re) => o.filter((q) => re.test(q.objekt)).length;
  check(z(/^(stil_(eiche|linde|laub|birke)|wald_baum)/) >= 400 && z(/k_hecke/) >= 60 && z(/schilf/) >= 20, `Streugut: ${z(/^(stil_(eiche|linde|laub|birke)|wald_baum)/)} Bäume, ${z(/k_hecke/)} Heckenstücke, ${z(/schilf/)} Schilf, ${z(/busch/)} Büsche, ${z(/k_fels/)} Steine`);
  check(z(/^(dorf|weidenhain|moor)_.*(haus|kate|fachwerk|taverne|schmiede|kapelle|baeckerei|kornspeicher|scheune|schuppen|muehle|fischer)/) >= 20, "Haferstedt und Netzbucht: mehr als 20 Gebäude"); }

console.log("\nWelt beleben – Glutsande");
{ const { R, IA } = welt(OST); const greifbar = flut(R, [6918, 6740], OST);
  const pflicht = ["bl_sandquell", "bl_nordstrand", "salzpfanne", "glutbrunn"].filter((id) => IA.has(id) || id.startsWith("bl_")), fehlt = pflicht.filter((id) => !IA.has(id) || !greifbar(IA.get(id).x, IA.get(id).y));
  check(!fehlt.length, "Sandquell und Nordstrand (und Salzpfanne, Glutbrunn) vom Pass aus zu Fuß erreichbar", fehlt);
  const npc = B.npc.filter(imKasten(OST)), weg = npc.filter((p) => !greifbar(p.x, p.y, 1.2)); check(npc.length >= 4 && !weg.length, `${npc.length} NPC-Plätze erreichbar`, weg.map((p) => p.id));
  const o = P.objekte.filter(imKasten(OST)), z = (re) => o.filter((q) => re.test(q.objekt)).length;
  check(z(/k_fels/) >= 100 && z(/busch/) >= 200 && z(/_tot_|erle_tot/) >= 50 && z(/ruine|truemmer/) >= 20, `Streugut: ${z(/k_fels/)} Felsen, ${z(/busch/)} Büsche, ${z(/_tot_|erle_tot/)} tote Bäume, ${z(/oliv/)} Ölbäume, ${z(/ruine|truemmer/)} Ruinenteile`);
  check(B.zaehlung.Bachläufe >= 4 && P.hoehen.some(([, , h]) => h < -0.5), `${B.zaehlung.Bachläufe} ausgetrocknete Bachläufe und ${B.zaehlung.Senken} Senken (tiefer gelegt)`); }

console.log("\nOrtsnamen und Gegner");
{ const on = JSON.parse(readFileSync(join(WELT, "ortsnamen.json"), "utf8")).orte.map((o) => o.name), fehlt = B.namen.map((n) => n[0]).filter((n) => !on.includes(n));
  check(!fehlt.length, "Haferstedt, Netzbucht, Sandquell, Nordstrand auf der Karte", fehlt);
  const alle = JSON.parse(readFileSync(join(WELT, "ortsnamen.json"), "utf8")).orte.map((o) => o.name), doppelt = B.namen.map((n) => n[0]).filter((n) => alle.filter((a) => a === n).length > 1); check(!doppelt.length, "Namen nicht doppelt", doppelt);
  const gp = JSON.parse(readFileSync(join(WELT, "gegnerplaetze.json"), "utf8")).plaetze, nah = gp.filter((g) => ["haferstedt", "sandquell"].some((k) => Math.hypot(g.x - B.orte[k][0], g.y - B.orte[k][1]) < 26));
  check(!nah.length, "keine Gegnerplätze in Haferstedt und Sandquell", nah.map((g) => `${g.id} ${g.x}|${g.y}`)); }
console.log(ok ? "\nBeleben: alles in Ordnung" : "\nBeleben: FEHLER"); process.exit(ok ? 0 : 1);
