/*
 * Welt-Test Hauptstadt Kielmund (#174): Stadtmauer zur Landseite mit Nordtor und Brückentor (Kiel), im Westen Fluss und Meer – die Stadt ist dicht;
 * ~80–120 Gebäude in vier Vierteln, 2 Banken, 8+ Ladenplätze, Stationen, Leuchtturm-Mole (begehbar bis zum Leuchtturm), Tempel, Haus der Küstenhäuser;
 * alles von der Südstraße aus erreichbar; Privatsteg der Fischerzunft in der Stadt; keine Gegner und Sammelstellen in der Mauer.
 * Aufruf (im Ordner realtime): node test/welt-kielmund.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const KM = lies("kielmund_orte.json"), BOX = [6300, 7200, 6560, 7420], BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const R = new G.WeltRaster(), IA = new Map(), OBJ = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; if (x1 < BOX[0] || x0 > BOX[2] || y1 < BOX[1] || y0 > BOX[3]) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); for (const o of reg.objekte) OBJ.push({ ...o, x: o.x + x0, y: o.y + y0, region: n }); }
const flut = ([sx, sy], zu = []) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny, wx = (nx + 0.5) / s, wy = (ny + 0.5) / s;
      if (seen.has(k) || wx < BOX[0] || wy < BOX[1] || wx > BOX[2] || wy > BOX[3] || !R.begehbar(wx, wy) || zu.some((r) => wx >= r[0] && wx <= r[2] && wy >= r[1] && wy <= r[3])) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; };
const [mx0, my0, mx1, my1] = KM.mauer, inStadt = (p, r = 0) => p.x > 6370 - r && p.x < mx1 + r && p.y > my0 - r && p.y < my1 + r, MARKT = [6426, 7314], DRAUSSEN = [6456, 7236];

console.log("\nKielmund – Mauer und Tore");
const offen = flut(DRAUSSEN);
check(offen(...MARKT), "der Markt ist von der Südstraße aus erreichbar (Nordtor)");
{ const [nx, ny] = KM.tore.nord, [bx, by] = KM.tore.bruecke, zu = flut(DRAUSSEN, [[nx - 4, ny - 2, nx + 4, ny + 2], [bx - 14, by - 5, bx + 4, by + 5]]);
  check(!zu(...MARKT, 1), "mit Nordtor und Brücke zu kein Weg auf den Markt (Mauer, Kiel und Meer schließen die Stadt)"); }
{ const west = flut([6340, 7300]); check(west(...MARKT), "von Westen über die Brücke über die Kiel (Brückentor) erreichbar"); }

console.log("\nViertel, Gebäude, Wahrzeichen");
{ const geb = OBJ.filter((o) => inStadt(o) && BIB.get(o.objekt)?.kategorie === "gebaeude").length; check(geb >= 80 && geb <= 130, `${geb} Gebäude in der Stadt (${JSON.stringify(KM.viertel)})`);
  const hat = (id) => OBJ.some((o) => o.id === id); check(["kuestenhaus", "kielmund_tempel", "kielmund_leuchtturm", "kielmund_mole_1", "kielmund_mole_3", "kielmund_bank", "kielmund_hafenbank", "kielmund_tor_nord"].every(hat), "Haus der Küstenhäuser, Tempel, Leuchtturm-Mole, 2 Banken, Nordtor");
  const lw = IA.get("kielmund_leuchtturm"); check(lw && offen(lw.x, lw.y), "über die Mole bis zum Leuchtturm zu Fuß");
  const ziele = [...KM.laeden.map((l) => [l.id, l.x, l.y]), ...KM.stationen.map((s) => [s.id, s.x, s.y]), ...KM.banken.map((b) => [b.id, ...b.schalter]), ...KM.npc.map((n) => [n.id, n.x, n.y])].filter(([, x, y]) => !offen(x, y, 1.6)).map(([id]) => id);
  check(KM.laeden.length >= 8 && KM.banken.length === 2 && KM.stationen.length >= 5 && !ziele.length, `${KM.laeden.length} Ladenplätze, 2 Banken, ${KM.stationen.length} Stationen, ${KM.npc.length} NPC-Plätze – erreichbar`, ziele); }
{ const z = IA.get("fischerzunft_bankkiste"); check(z && inStadt(z) && offen(z.x, z.y), "der Privatsteg der Fischerzunft liegt in der Stadt und ist erreichbar"); }

console.log("\nGegner, Sammelstellen");
{ const gp = lies("gegnerplaetze.json").plaetze.filter((p) => inStadt(p, 8)).map((p) => p.id); check(!gp.length, "kein Gegnerplatz in der Stadt", gp);
  const sm = lies("sammelstellen.json"), si = [...sm.lichtungen, ...sm.senken].filter((g) => (g.baeume || g.adern).some((p) => inStadt(p))).map((g) => g.name); check(!si.length, "keine Sammelstelle in der Stadt", si); }
console.log(ok ? "\nKielmund: alles in Ordnung" : "\nKielmund: FEHLER"); process.exit(ok ? 0 : 1);
