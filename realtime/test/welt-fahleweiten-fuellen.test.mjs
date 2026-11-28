/*
 * Welt-Test Fahle Weiten füllen, Schritt 1 (#171): Grauwacht als mittlere Hauptstadt (Stufe „burg“: Stadtmauer mit Süd- und Brückentor, Kaserne mit Bankkiste,
 * Taverne, Läden, ~45 Gebäude), neue Orte Hügelgrund, Kohlstatt, Brechstein, Wollhag, Weiherhof (je Bank oder Bankkiste, Laden, Station), Heidrast größer;
 * alles von Heidrast aus zu Fuß erreichbar (auch mit der Mauer der Stufe „burg“), die Mauer ist dicht; Fischplätze, Kräuter, von jedem Weg höchstens 45 Felder
 * bis zur nächsten Arbeitsstelle; keine Gegner in den Orten und in der Stadtmauer; Ortsnamen auf der Karte.
 * Aufruf (im Ordner realtime): node test/welt-fahleweiten-fuellen.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const FO = lies("fahleweiten_orte.json"), BOX = [6000, 5560, 6800, 6260]   /* bis 6260: Jägerlager und Alte Wachruine (Westwald) */, BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const R = new G.WeltRaster(), IA = new Map(), OBJ = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; if (x1 < BOX[0] || x0 > BOX[2] || y1 < BOX[1] || y0 > BOX[3]) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); for (const o of reg.objekte) OBJ.push({ ...o, x: o.x + x0, y: o.y + y0, region: n }); }
/* Stufe „burg“: Objekte mit ausbau sperren je Spieler – für den Test als Rechtecke dazu */
const burg = OBJ.filter((o) => o.ausbau === "burg").flatMap((o) => { const k = BIB.get(o.objekt)?.kollision, s = o.s ?? 1; if (!k || k.art !== "rechteck") return []; return [[o.x + k.x * s, o.y + k.y * s, o.x + (k.x + k.b) * s, o.y + (k.y + k.h) * s]]; });
const flut = ([sx, sy], box, mitBurg, zu = []) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  const frei = (x, y) => R.begehbar(x, y) && !(mitBurg && burg.some((r) => x > r[0] && x < r[2] && y > r[1] && y < r[3])) && !zu.some((r) => x >= r[0] && x < r[2] + 1 && y >= r[1] && y < r[3] + 1);
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !frei((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; };
const HEIDRAST = [6596, 5876], M = FO.grauwacht.mauer, inMauer = (p, r = 0) => p.x > M[0] - r && p.x < M[2] + r && p.y > M[1] - r && p.y < M[3] + r;

console.log("\nGrauwacht (Stufe „burg“)");
const mit = flut(HEIDRAST, BOX, true), platz = FO.orte.grauwacht;
check(mit(...platz), "der Platz ist mit Stadtmauer von Heidrast aus erreichbar (Südtor)");
{ const BR = [6728, 5756, 6742, 5764], SUED = [FO.grauwacht.tore.sued[0] - 3, M[3] - 2, FO.grauwacht.tore.sued[0] + 3, M[3] + 2]; const zu = flut(HEIDRAST, BOX, true, [BR, SUED]);
  check(!zu(...platz, 1), "mit geschlossenem Süd- und Brückentor ist der Platz nicht zu erreichen (die Mauer ist dicht, Burgfelsen und Meer schließen sie)"); }
{ const geb = OBJ.filter((o) => inMauer(o) && BIB.get(o.objekt)?.kategorie === "gebaeude").length; check(geb >= 40 && geb <= 70, `${geb} Gebäude in der Stadtmauer (mittlere Hauptstadt, kleiner als Steinhag)`);
  const hat = (id) => OBJ.some((o) => o.id === id); check(["grauwacht_kaserne", "grauwacht_taverne", "grauwacht_tor_sued", "grauwacht_kaserne_bankkiste", "grauwacht_bank"].every(hat) && FO.grauwacht.laeden.length >= 6, `Kaserne mit Bankkiste, Taverne, Bank, Südtor, ${FO.grauwacht.laeden.length} Läden`);
  const lw = FO.grauwacht.laeden.filter((l) => !mit(l.x, l.y, 1.6)).map((l) => l.id); check(!lw.length, "alle Läden erreichbar", lw); }

console.log("\nNeue Orte, Heidrast");
for (const [k, name] of [["huegelgrund", "Hügelgrund"], ["kohlstatt", "Kohlstatt"], ["brechstein", "Brechstein"], ["wollhag", "Wollhag"], ["weiherhof", "Weiherhof"], ["reifbach", "Reifbach"], ["pechtann", "Pechtann"]]) {
  const [cx, cy] = FO.orte[k], geb = OBJ.filter((o) => Math.hypot(o.x - cx, o.y - cy) < 26 && BIB.get(o.objekt)?.kategorie === "gebaeude").length;
  const bank = FO.banken.find((b) => b.ort === name), laden = FO.laeden.find((l) => l.ort === name), st = FO.stationen.some((s) => Math.hypot(s.x - cx, s.y - cy) < 30);
  const ia = [...IA.values()].filter((i) => i.id.startsWith(k)), weg = ia.filter((i) => !mit(i.x, i.y)).map((i) => i.id);
  check(geb >= 4 && bank && laden && st && ia.length >= 2 && !weg.length, `${name}: ${geb} Gebäude, ${bank?.gebaeude ? "Bank" : "Bankkiste"}, Laden, Station – von Heidrast aus erreichbar`, weg); }
{ const [cx, cy] = HEIDRAST, geb = OBJ.filter((o) => Math.hypot(o.x - cx, o.y - cy) < 24 && BIB.get(o.objekt)?.kategorie === "gebaeude").length; check(geb >= 8 && IA.has("heidrast_bankkiste"), `Heidrast: ${geb} Gebäude, Bankkiste`); }
{ const nw = FO.npc.filter((n) => !mit(n.x, n.y, 1.4)).map((n) => n.id); check(!nw.length, `${FO.npc.length} NPC-Plätze erreichbar`, nw);
  const rw = FO.rastplaetze.filter((id) => !IA.has(id) || !mit(IA.get(id).x, IA.get(id).y)); check(FO.rastplaetze.length >= 3 && !rw.length, `${FO.rastplaetze.length} Rastplätze an den Wegen`, rw); }

/* Westwald (Leitstelle 28.11.): Pechtann mit Wegen in alle vier Richtungen; Harzlichtung, Pechhütte, Jägerlager erreichbar; die Wölfe von E2 bleiben unberührt */
{ const WW = FO.westwald, ziele = { Harzlichtung: WW.lichtung, "Verfallene Pechhütte": WW.huette, "Jägerlager": WW.lager, Grenzposten: [6642, 6080], "Alte Wachruine": [6326, 6228], Brechstein: [6612, 5972] };
  const weg = Object.entries(ziele).filter(([, p]) => !mit(p[0], p[1], 2)).map(([n]) => n); check(!weg.length, "Pechtann: Harzlichtung, Pechhütte, Jägerlager und die Wege zu Grenzposten, Alter Wachruine und Brechstein erreichbar", weg);
  const W = WW.woelfe, drin = OBJ.filter((o) => /^(pechtann|jaegerlager|rast_harzlichtung)/.test(o.id) && o.x > W[0] && o.x < W[2] && o.y > W[1] && o.y < W[3]).map((o) => o.id);
  const ST = lies("streifgebiete.json").gebiete, ws = ST.find((g) => g.gegner === "wildschwein" && /Westwald/.test(g.name));
  check(!drin.length && ws && ST.some((g) => g.id === "streifgebiet_heidewolf_weiten"), `Wölfe von E2 unberührt, Streifgebiet „${ws?.name}“ bei ${ws?.mitte?.join("|")}`, drin); }

console.log("\nArbeit: Fischen, Kräuter, Holz und Erz");
{ const fw = FO.fischplaetze.filter((f) => !mit(...f.stehplatz, 1) || R.begehbar(f.x, f.y)).map((f) => f.id); check(FO.fischplaetze.length >= 5 && !fw.length, `${FO.fischplaetze.length} Fischplätze (Weiher, Küste) – Stehplatz erreichbar, Fanggrund im Wasser`, fw);
  const kw = FO.kraeuter.filter((k) => !mit(k.x, k.y, 1)).map((k) => k.id); check(FO.kraeuter.length >= 12 && !kw.length, `${FO.kraeuter.length} Kräuter an den Orten und auf der Heide`, kw);
  const SM = lies("sammelstellen.json"), SH = [...lies("../shared/holz_standorte.json").lichtungen.flatMap((l) => l.baeume), ...lies("../shared/bergbau_standorte.json").senken.flatMap((s) => s.adern)], punkte = [...SM.lichtungen.flatMap((l) => l.baeume), ...SM.senken.flatMap((s) => s.adern), ...SH].filter((p) => p.x > BOX[0] - 60 && p.x < BOX[2] + 60 && p.y > BOX[1] - 60 && p.y < BOX[3] + 200);
  const KR = lies("kraeuter_standorte.json").stellen, alle = [...punkte, ...KR, ...FO.fischplaetze.map((f) => ({ x: f.stehplatz[0], y: f.stehplatz[1] }))];
  const luecken = []; for (const w of FO.wege) for (let j = 1; j < w.punkte.length; j++) { const [x0, y0] = w.punkte[j - 1], [x1, y1] = w.punkte[j], L = Math.hypot(x1 - x0, y1 - y0);
    for (let t = 0; t <= L; t += 10) { const x = x0 + (x1 - x0) * t / L, y = y0 + (y1 - y0) * t / L; if (!inMauer({ x, y }, 12) && !alle.some((p) => Math.hypot(p.x - x, p.y - y) < 45)) luecken.push(`${Math.round(x)}|${Math.round(y)}`); } }
  check(!luecken.length, `von jedem Weg aus höchstens 45 Felder bis zu Holz, Erz, Kraut oder Fisch (${punkte.length} Bäume und Adern)`, luecken);
  const pw = punkte.filter((p) => p.x > BOX[0] && p.x < BOX[2] && p.y > BOX[1] && p.y < BOX[3] && !p.region?.startsWith?.("grab") && !mit(p.x, p.y, 1.8)).map((p) => p.id); check(!pw.length, "alle Bäume und Adern erreichbar", pw); }

console.log("\nGegner, Namen");
{ const GP = lies("gegnerplaetze.json").plaetze, inOrt = GP.filter((p) => inMauer(p, 10) || Object.entries(FO.orte).some(([k, [x, y]]) => k !== "grauwacht" && Math.hypot(p.x - x, p.y - y) < 16)).map((p) => p.id);
  check(!inOrt.length, "kein Gegnerplatz in der Stadtmauer und in den neuen Orten", inOrt);
  const ON = lies("ortsnamen.json").orte.map((o) => o.name), nf = FO.namen.map((n) => n[0]).filter((n) => !ON.includes(n)); check(!nf.length, `Ortsnamen auf der Karte: ${FO.namen.map((n) => n[0]).join(", ")}`, nf); }
console.log(ok ? "\nFahle Weiten füllen: alles in Ordnung" : "\nFahle Weiten füllen: FEHLER"); process.exit(ok ? 0 : 1);
