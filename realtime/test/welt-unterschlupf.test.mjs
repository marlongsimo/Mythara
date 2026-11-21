/*
 * Mythara – der Unterschlupf (Untergrund unter der Hütte in der Westmark), ohne Browser:
 * sechs Räume, alle von der Leiter aus erreichbar; Loch und Leiter verbinden Hütte und Unterschlupf; die Banditen stehen auf freiem Boden.
 * Aufruf (im Ordner realtime): node test/welt-unterschlupf.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
import { RAEUME, LAGER, OBEN, UNTEN } from "../werkzeug/welt/unterschlupf.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
for (const n of ["unterschlupf", "westmark"]) for (const c of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(c);
const d = region("unterschlupf"), [OX, OY] = d.region.ursprung.map((v) => v * 32);
console.log("\nUnterschlupf");
check(d.region.ebene === "untergrund" && Object.keys(RAEUME).length === 6, `ein Untergrund-Gebiet mit 6 Räumen (${Object.keys(RAEUME).join(", ")})`);
const UNTEN_PT = () => ({ x: UNTEN[0], y: UNTEN[1] });
const frei = (x, y) => { for (let r = 0; r < 5; r += 0.5) for (let t = 0; t < 6.3; t += 0.4) { const px = x + Math.cos(t) * r, py = y + Math.sin(t) * r; if (R.begehbar(px, py)) return { x: px, y: py }; } return null; };
const weg = Object.entries(RAEUME).filter(([, [x0, y0, x1, y1]]) => { const z = frei(OX + (x0 + x1) / 2, OY + (y0 + y1) / 2); return !z || R.weg(UNTEN_PT(), z, 0.3, 200).length === 0; });
check(R.begehbar(...UNTEN) && weg.length === 0, "von der Leiter aus sind alle sechs Räume zu Fuß erreichbar", weg.map(([n]) => n));
const fels = LAGER.filter(([, x, y]) => !R.begehbar(x, y)); check(LAGER.length >= 6 && fels.length === 0, `${LAGER.length} Banditen stehen auf freiem Boden`, fels.map(([, x, y]) => `${x}|${y}`));
const loch = region("westmark").spiel.interaktionen.find((i) => i.id === "loch_abstieg"), leiter = d.spiel.interaktionen.find((i) => i.id === "leiter");
check(loch && Array.isArray(loch.daten.ziel) && Math.hypot(loch.daten.ziel[0] - UNTEN[0], loch.daten.ziel[1] - UNTEN[1]) < 0.01, "das Loch in der Hütte führt zur Leiter im Unterschlupf");
check(leiter && Math.hypot(leiter.daten.ziel[0] - OBEN[0], leiter.daten.ziel[1] - OBEN[1]) < 0.01 && R.begehbar(...OBEN), "die Leiter führt zurück in die Hütte (auf freien Boden)");
console.log(ok ? "\nUnterschlupf: alles in Ordnung" : "\nUnterschlupf: FEHLER"); process.exit(ok ? 0 : 1);
