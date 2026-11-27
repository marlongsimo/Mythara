/*
 * Mythara – Orte für Phase 5b/6 (Welt #45), ohne Browser: Seelenlichter 20/35/45/65 sind von erreichbarem Boden aus zu greifen,
 * Bindestein am Obelisk im Nordwald, Kessel im Kräuterhaus der Waldmark und bei Hedda erreichbar, zwei Steinkreise mit Spiralsteinen auf Aschenwerth,
 * Leiter im Kerker des Rabengrunds hinauf zur Gruft.
 * Aufruf (im Ordner realtime): node test/welt-orte-p56.test.mjs
 */
import { readFileSync } from "node:fs";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";
import { join } from "node:path";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const N = ["rabenmoor", "nordwald", "rabengrund", "aschenwerth", "westried", "waldweg", "weidenhain", "nordsaum", "westmark", "waldmark", "osthof"], reg = {};
for (const n of N) { reg[n] = region(n); for (const c of G.chunksBauen(reg[n], bib.gelaende, bib.objekte).chunks) R.dazu(c); }
const ur = (n) => reg[n].region.ursprung.map((v) => v * 32);
const flut = (n) => { const [X, Y] = ur(n), st = reg[n].spiel.start[0], s = 2, seen = new Set(), q = [[Math.floor((X + st[0]) * s), Math.floor((Y + st[1]) * s)]], b = [X - 140, Y - 140, X + 400, Y + 300]; seen.add(q[0].join());
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k)) continue;
    if (nx / s < b[0] || ny / s < b[1] || nx / s > b[2] || ny / s > b[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y) => seen.has(Math.floor(x * s) + "," + Math.floor(y * s)); };
const greifbar = (ok, x, y, w) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (ok(x + Math.cos(t) * r, y + Math.sin(t) * r)) return true; return false; };
const ia = (n, id) => { const i = reg[n].spiel.interaktionen.find((i) => i.id === id); if (!i) return null; const [X, Y] = ur(n); return { ...i, x: i.x + X, y: i.y + Y }; };
const erreich = {}; const von = (n) => (erreich[n] ||= flut(n));
console.log("\nSeelenlichter");
const L = JSON.parse(readFileSync(join(WELT, "seelenlicht_standorte.json"), "utf8"));
for (const art of ["irrlicht", "grablicht", "nebellicht", "splitterlicht"]) { const l = L.lichter.filter((x) => x.art === art), schlecht = l.filter((x) => !greifbar(von(x.region), x.x, x.y, 1.5));
  check(l.length >= 3 && !schlecht.length, `${art} (Stufe ${L.arten[art].level}): ${l.length} Lichter, alle von erreichbarem Boden aus zu greifen`, schlecht.map((x) => x.id)); }
console.log("\nStationen");
const [NX, NY] = ur("nordwald"), bs = reg.nordwald.objekte.find((o) => o.id === "ort_p5_bindestein_obelisk");
check(Boolean(bs) && Math.hypot(NX + bs.x - (NX + 101.5), NY + bs.y - (NY + 36.5)) < 4 && greifbar(von("nordwald"), NX + bs.x, NY + bs.y + 1, 1.5), "Bindestein am Obelisk im Nordwald, erreichbar");
const [WX, WY] = ur("waldmark"), kh = reg.waldmark.objekte.find((o) => o.id === "kraeuterhaus");
check(Boolean(kh) && greifbar(von("waldmark"), WX + kh.x + 0.9, WY + kh.y - 1.5 + 1.2, 1.5), "Kessel im Kräuterhaus der Waldmark (Bauplan, innen) erreichbar");
const [RX, RY] = ur("rabenmoor"), kes = reg.rabenmoor.objekte.find((o) => o.id === "ort_p5_kessel_hedda");
check(Boolean(kes) && greifbar(von("rabenmoor"), RX + kes.x, RY + kes.y + 1, 1.5), "Kessel bei Hedda (Rabenmoor) erreichbar");
console.log("\nAschenwerth");
const st = reg.aschenwerth.spiel.interaktionen.filter((i) => /^spiralstein_\d_\d$/.test(i.id));
check(st.filter((i) => i.id.startsWith("spiralstein_1_")).length === 7 && st.filter((i) => i.id.startsWith("spiralstein_2_")).length === 5, "zwei Steinkreise: 7 + 5 Spiralsteine als eigene Questobjekte");
const nicht = [...st.map((i) => i.id), "steinkreis", "steinkreis_2", "gruft"].filter((id) => { const i = ia("aschenwerth", id); return !i || !greifbar(von("aschenwerth"), i.x, i.y, 1.5); });
check(!nicht.length, "Spiralsteine, beide Kreise und die Gruft von der Insel aus erreichbar", nicht);
console.log("\nRabengrund");
const kt = ia("rabengrund", "kerker_treppe"), kk = ia("rabengrund", "kerker");
check(Boolean(kt) && greifbar(von("rabengrund"), kt.x, kt.y, 1.5) && greifbar(von("rabengrund"), kk.x, kk.y, 1.5), "Leiter im Kerker vom Einstieg aus erreichbar");
check(Boolean(kt) && greifbar(von("aschenwerth"), kt.daten.ziel[0], kt.daten.ziel[1], 0.6), "die Leiter führt hinauf zur Gruft auf Aschenwerth (begehbar)");
const sp = L.lichter.filter((x) => x.art === "splitterlicht"), becken = ia("rabengrund", "splitterbecken");
check(sp.every((l) => Math.hypot(l.x - becken.x, l.y - (becken.y - 5.2)) < 9), "Splitterlichter über dem Splitterbecken");
console.log(ok ? "\nOrte Phase 5/6: alles in Ordnung" : "\nOrte Phase 5/6: FEHLER"); process.exit(ok ? 0 : 1);
