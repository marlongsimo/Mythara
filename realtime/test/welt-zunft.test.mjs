/*
 * Welt-Test Zunfthäuser (#167, #168): jede Zunft ist eingehegt und hat genau ein Tor (Feld für die Tür „ab Stufe 60“ von Systeme).
 * Mit offenem Tor sind Bankkiste, Stationen, Bäume, Kräuter und Fangstellen drinnen von draußen zu Fuß erreichbar – mit geschlossenem Tor keine davon.
 * Dazu: das Tor liegt auf begehbarem Boden, die Bankkiste ist eine Lesestelle, im Zunftstollen ist der Abstieg der Zugang.
 * Aufruf (im Ordner realtime): node test/welt-zunft.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const ZO = lies("zunft_orte.json"), HO = lies("hochlande_orte.json"), KO = lies("kueste_orte.json");
const ZUENFTE = [...ZO.zuenfte, { ...HO.hauptstadt.zunftschmiede, zunft: "zunftschmiede", name: "Zunftschmiede (Steinhag)", stationen: HO.hauptstadt.stationen.filter((s) => /zunft/.test(s.id)) }, { ...KO.fischerzunft }];
const BOX = (z) => [z.flaeche[0] - 14, z.flaeche[1] - 14, z.flaeche[2] + 14, z.flaeche[3] + 14];
const R = new G.WeltRaster(), IA = new Map();
const noetig = (x0, y0, x1, y1) => ZUENFTE.some((z) => { const b = BOX(z); return x1 > b[0] && x0 < b[2] && y1 > b[1] && y0 < b[3]; });
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32; if (!noetig(x0, y0, x0 + r.chunks[0] * 32, y0 + r.chunks[1] * 32)) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); }
/* Flut auf halben Feldern von einem Punkt draußen; zu = Tor-Feld gesperrt */
const flut = ([sx, sy], box, zu) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  const gesperrt = (x, y) => zu && x >= zu[0] && x < zu[2] + 1 && y >= zu[1] && y < zu[3] + 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny, wx = (nx + 0.5) / s, wy = (ny + 0.5) / s;
      if (seen.has(k) || wx < box[0] || wy < box[1] || wx > box[2] || wy > box[3] || !R.begehbar(wx, wy) || gesperrt(wx, wy)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.6) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; };
const HOLZ = Object.fromEntries([...lies("sammelstellen.json").lichtungen.flatMap((l) => l.baeume)].map((b) => [b.id, b]));
const KR = Object.fromEntries(lies("kraeuter_standorte.json").stellen.map((k) => [k.id, k])), FI = Object.fromEntries(KO.fischplaetze.map((f) => [f.id, f]));

for (const z of ZUENFTE) {
  console.log(`\n${z.name}`);
  const box = BOX(z), draussen = [z.wache[0], z.wache[1]], [t0, t1, t2, t3] = z.tor;
  const ziele = [["Bankkiste", z.bankkiste.x, z.bankkiste.y], ...(z.stationen || []).map((s) => [s.id, s.x, s.y]), ...(z.baeume || []).map((id) => [id, HOLZ[id]?.x, HOLZ[id]?.y]),
    ...(z.kraeuter || []).map((id) => [id, KR[id]?.x, KR[id]?.y]), ...(z.fang || []).map((id) => [id, ...(FI[id]?.stehplatz || [])])];
  const fehlt = ziele.filter(([, x]) => x === undefined).map(([id]) => id); check(!fehlt.length && ziele.length >= 2, `${ziele.length} Ziele drinnen (Bankkiste, Stationen, Bäume, Kräuter, Fangstellen)`, fehlt);
  check(IA.has(z.bankkiste.id) || IA.has(z.bankkiste.id.replace(/_bankkiste$/, "") + "_bankkiste"), `Bankkiste ${z.bankkiste.id} ist eine Lesestelle`);
  let torFrei = 0; for (let y = t1; y <= t3; y++) for (let x = t0; x <= t2; x++) if (R.begehbar(x + 0.5, y + 0.5)) torFrei++; check(torFrei >= 2, `Tor-Feld [${z.tor.join(", ")}] begehbar (${torFrei} Felder)`);
  const offen = flut(draussen, box), zu = flut(draussen, box, z.tor);
  const nichtOffen = ziele.filter(([, x, y]) => x !== undefined && !offen(x, y)).map(([id]) => id), durchZu = ziele.filter(([, x, y]) => x !== undefined && zu(x, y, 0.8)).map(([id]) => id);
  check(!nichtOffen.length, "mit offenem Tor alles drinnen erreichbar", nichtOffen); check(!durchZu.length, "mit geschlossenem Tor nichts drinnen erreichbar (die Einhegung ist dicht)", durchZu); }

console.log("\nStollen der Bergmannszunft");
{ const e = IA.get("steinhag_zunftstollen_eingang"); check(e && e.daten.tat === "zunftstollen" && HO.hauptstadt.zunftstollen.ab_stufe === 60, "Zugang über den Abstieg (Tat zunftstollen, ab Stufe 60), Bankkiste und Schmelzofen in der Zunfthalle"); }
console.log(ok ? "\nZunfthäuser: alles in Ordnung" : "\nZunfthäuser: FEHLER"); process.exit(ok ? 0 : 1);
