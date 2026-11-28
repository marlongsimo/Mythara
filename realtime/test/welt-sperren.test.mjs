/*
 * Welt-Test Sperren (Welt-Erlebnis, KANON 27.11.): Bergsturz am Hals des Drachenarms und Schneesturm an der Frostkrone.
 * Mit den Sperrstücken (ausbau_bis drachenarm_frei / frostkrone_frei) sind die Faust des Drachenarms und der Schnee der Frostkrone von Steinhag aus
 * nicht zu erreichen; Grauhorn, Hochpass, Passwacht, Furt, Nordklippen, Einsiedelei und die Wurzel des Drachenarms bleiben offen.
 * Ohne die Sperrstücke (Schalter an) ist alles wieder erreichbar. Wachen und Hinweise stehen auf der offenen Seite.
 * Aufruf (im Ordner realtime): node test/welt-sperren.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), SP = JSON.parse(readFileSync(join(WELT, "sperren.json"), "utf8"));
const BOX = [6100, 4980, 8320, 6480], BW = BOX[2] - BOX[0], BH = BOX[3] - BOX[1];
const R = new G.WeltRaster(), STUECKE = [], IA = new Map();
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; if (x1 < BOX[0] || x0 > BOX[2] || y1 < BOX[1] || y0 > BOX[3]) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 });
  for (const o of reg.objekte) if (o.ausbau_bis === "drachenarm_frei" || o.ausbau_bis === "frostkrone_frei") STUECKE.push({ ...o, x: o.x + x0, y: o.y + y0 }); }
/* Felder, die die Sperrstücke belegen (wie shared/welt/bau.ts sperrFelder: Feldmitte im Rechteck reicht hier, die Stücke sind großzügig) */
const zu = (stufe) => { const s = new Set(); for (const o of STUECKE) { if (stufe && o.ausbau_bis !== stufe) continue; const k = o.kollision; if (!k) continue;
  const ax = o.x + k.x, ay = o.y + k.y; for (let j = Math.floor(ay); j < Math.ceil(ay + k.h); j++) for (let i = Math.floor(ax); i < Math.ceil(ax + k.b); i++) if (i + 0.5 >= ax && i + 0.5 <= ax + k.b && j + 0.5 >= ay && j + 0.5 <= ay + k.h) s.add(i + "," + j); } return s; };
const flut = (start, gesperrt) => { const seen = new Uint8Array(BW * BH), q = [[Math.floor(start[0]), Math.floor(start[1])]]; seen[(q[0][1] - BOX[1]) * BW + q[0][0] - BOX[0]] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < BOX[0] || ny < BOX[1] || nx >= BOX[2] || ny >= BOX[3]) continue;
    const k = (ny - BOX[1]) * BW + nx - BOX[0]; if (seen[k] || !R.begehbar(nx + 0.5, ny + 0.5) || gesperrt.has(nx + "," + ny)) continue; seen[k] = 1; q.push([nx, ny]); } }
  return (x, y, r = 2) => { for (let v = Math.floor(y - r); v <= Math.floor(y + r); v++) for (let u = Math.floor(x - r); u <= Math.floor(x + r); u++) if (u >= BOX[0] && v >= BOX[1] && u < BOX[2] && v < BOX[3] && seen[(v - BOX[1]) * BW + u - BOX[0]]) return true; return false; }; };
const STEINHAG = [6990.5, 5901.5], ZIELE = { "Faust des Drachenarms": [8180, 6130], "Schnee der Frostkrone": [6800, 5300], "Frostwölfe (Mitte)": [6792, 5272] },
  OFFEN = { "Wurzel des Drachenarms": [7900, 5800], "Horst auf dem Grauhorn": [7028, 5549], Passwacht: [6962, 5610], Hochpass: [6950, 5636], "Die Furt": [6800, 5761], Nordklippen: [7290, 5342], Einsiedelei: [7340, 5664] };

console.log("\nSperren (Bergsturz, Schneesturm)");
const alle = zu(), mit = flut(STEINHAG, alle);
check(STUECKE.filter((o) => o.ausbau_bis === "drachenarm_frei" && o.kollision).length >= 4 && STUECKE.filter((o) => o.ausbau_bis === "frostkrone_frei").length >= 50, `${STUECKE.filter((o) => o.ausbau_bis === "drachenarm_frei").length} Stücke Bergsturz, ${STUECKE.filter((o) => o.ausbau_bis === "frostkrone_frei").length} Stücke Schneesturm in der Welt`);
{ const offen = Object.entries(ZIELE).filter(([, p]) => mit(...p)).map(([n]) => n); check(!offen.length, "gesperrt: " + Object.keys(ZIELE).join(", "), offen.map((n) => "erreichbar: " + n)); }
{ const zuX = Object.entries(OFFEN).filter(([, p]) => !mit(...p)).map(([n]) => n); check(!zuX.length, "offen: " + Object.keys(OFFEN).join(", "), zuX.map((n) => "gesperrt: " + n)); }
{ const w = [...SP.drachenarm.wachen, ...SP.frostkrone.hinweise].filter((p) => !mit(p[0], p[1], 0.6)).map((p) => p.join("|")), h = [SP.drachenarm.hinweis].filter((id) => !IA.has(id) || !mit(IA.get(id).x, IA.get(id).y, 0.6));
  check(!w.length && !h.length, `2 Wachen und ${SP.frostkrone.hinweise.length + 1} Hinweise auf der offenen Seite erreichbar`, [...w, ...h]); }
console.log("\nFreigeschaltet (Schalter an: die Stücke verschwinden)");
{ const ohneD = flut(STEINHAG, zu("frostkrone_frei")), ohneF = flut(STEINHAG, zu("drachenarm_frei"));
  check(ohneD(...ZIELE["Faust des Drachenarms"]) && !ohneD(...ZIELE["Schnee der Frostkrone"]), "drachenarm_frei: die Faust ist erreichbar, die Frostkrone bleibt zu");
  check(ohneF(...ZIELE["Schnee der Frostkrone"]) && !ohneF(...ZIELE["Faust des Drachenarms"]), "frostkrone_frei: der Schnee ist erreichbar, der Drachenarm bleibt zu"); }
{ const gp = JSON.parse(readFileSync(join(WELT, "gegnerplaetze.json"), "utf8")).plaetze, an = gp.filter((p) => [...alle].some((k) => { const [x, y] = k.split(",").map(Number); return Math.abs(p.x - x - 0.5) < 1 && Math.abs(p.y - y - 0.5) < 1; })).map((p) => p.id);
  check(!an.length, "kein Gegnerplatz steht in einem Sperrstück", an); }
console.log(ok ? "\nSperren: alles in Ordnung" : "\nSperren: FEHLER"); process.exit(ok ? 0 : 1);
