/*
 * Mythara – Sammelstellen (Welt #142), ohne Browser: Holzfäller-Bäume und Erzadern in Gruppen an jedem Ort im Süden, an der Küste, in Haferstedt/Netzbucht und
 * in den Glutsande. Jede Gruppe liegt nahe ihrem Ort, jeder Baum und jede Ader ist von Weidenhain bzw. vom Pass aus zu Fuß erreichbar, die Stufe passt zur Gegend,
 * Erlengrund (Holz) und Lehmfurt (Erz) sind Schwerpunkte, keine Gegnerplätze in den Gruppen, Kennungen eindeutig.
 * Aufruf (im Ordner realtime): node test/welt-sammelstellen.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT, REALTIME } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const S = lies("sammelstellen.json"), gruppen = [...S.lichtungen.map((l) => ({ ...l, typ: "holz", pts: l.baeume })), ...S.senken.map((s) => ({ ...s, typ: "erz", pts: s.adern }))];
const ORTE = { ...lies("sueden_orte.json").orte, ...lies("kueste_orte.json").orte, ...lies("glutsande_orte.json").orte, ...lies("beleben_orte.json").orte, leuchtturm: [6176, 7036] };
/* wirksam ist, was die Welt baut: gleichnamige Gruppen aus shared/ (von Integration übernommen) gehen vor (lichtungen.mjs) */
const SH = new Map([...JSON.parse(readFileSync(join(REALTIME, "shared", "holz_standorte.json"), "utf8")).lichtungen, ...JSON.parse(readFileSync(join(REALTIME, "shared", "bergbau_standorte.json"), "utf8")).senken].map((l) => [l.name, l]));
const wirksam = gruppen.map((g) => SH.has(g.name) ? { ...g, pts: SH.get(g.name).baeume || SH.get(g.name).adern } : g);
const abweichend = gruppen.filter((g) => SH.has(g.name) && JSON.stringify(g.pts.map((p) => [p.art, p.x, p.y])) !== JSON.stringify(wirksam.find((w) => w.name === g.name).pts.map((p) => [p.art, p.x, p.y]))).map((g) => g.name);
if (abweichend.length) console.log("  ℹ in shared/ noch die alte Fassung (Integration): " + abweichend.join(", "));
const WEST = [6030, 6650, 6720, 7400], OST = [6860, 6420, 7620, 7680], HOCH = [6780, 5200, 7700, 6300];
const imUnter = (p) => p.y > 9000, imHoch = (p) => !imUnter(p) && p.x >= HOCH[0] && p.y < 6350, imOst = (p) => !imUnter(p) && p.x >= OST[0] && p.y >= 6350, imWest = (p) => !imUnter(p) && !imHoch(p) && !imOst(p);
function welt(box, extra = []) {
  const R = new G.WeltRaster();
  for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
    const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32;
    if (!extra.includes(n) && (x1 < box[0] || x0 > box[2] || y1 < box[1] || y0 > box[3])) continue; for (const c of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(c); }
  return R; }
const flut = (R, [sx, sy], box) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.6) => { for (let r = 0.6; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; };

console.log("\nSammelstellen");
const SUED_HOLZ = ["eiche", "tanne", "eibe", "moorweide"], SUED_ERZ = ["kupfer", "eisen", "schwarzeisen", "sterneisen"], GLUT = ["moorweide", "kernbaum", "weltenbaum", "sterneisen", "splittereisen", "ureisen"];
const HOCHL = ["eiche", "tanne", "eibe", "moorweide", "kernbaum", "weltenbaum", "kupfer", "eisen", "schwarzeisen", "sterneisen", "splittereisen", "ureisen"];   /* Hochlande (#147, „Hochlande füllen“): Grundholz und niedrige Erze nahe Steinhag und an den Wegen, Höheres an den Hängen */
const ureisenOben = gruppen.flatMap((g) => g.pts.filter((p) => imHoch(p) && p.art === "ureisen").map((p) => p.id)); check(!ureisenOben.length, "Hochlande: Ureisen nur unter Tage", ureisenOben);
const falsch = gruppen.filter((g) => !g.einzeln).flatMap((g) => g.pts.filter((p) => !(imHoch(p) || imUnter(p) ? HOCHL : imOst(p) ? GLUT : g.typ === "holz" ? SUED_HOLZ : SUED_ERZ).includes(p.art)).map((p) => `${g.name}: ${p.art}`));
check(!falsch.length, "Stufen passen: Süden/Westen Holz 1–35 und Erz 1–35, Glutsande ab 35 (bis Ureisen/Weltenbaum 65), Hochlande 40–65", falsch);
const pflicht = ["heckenhof", "summweide", "halber_weg", "erlengrund", "kreuzstein", "schilfsee", "lehmfurt", "distelhof", "faehrtenlager", "laemmerhang", "kielmund", "moewenbucht", "haferstedt", "netzbucht", "sandquell", "glutbrunn", "salzpfanne", "nordstrand"];
const RADIUS = { haferstedt: 40, sandquell: 34, glutbrunn: 46, kielmund: 34 };
const fern = pflicht.filter((o) => !gruppen.some((g) => g.ort === o && g.pts.every((p) => Math.hypot(p.x - ORTE[o][0], p.y - ORTE[o][1]) < (RADIUS[o] ?? 12) + 20)));
check(!fern.length, `jeder der ${pflicht.length} Orte hat eine Gruppe in der Nähe (höchstens 20 Felder hinter dem Ortsrand)`, fern);
const halb = pflicht.filter((o) => !["holz", "erz"].every((t) => gruppen.some((g) => g.ort === o && g.typ === t))); check(!halb.length, "jeder dieser Orte hat Bäume und Erz", halb);
const groesse = gruppen.filter((g) => (g.pts.length < 3 || g.pts.length > 6) && !g.einzeln && !/Ureisen|Weltenbaum/.test(g.name)).map((g) => `${g.name}: ${g.pts.length}`);
check(!groesse.length, "Gruppen von 3–6 Stellen (Ausnahme Phase 9: Ureisen in den Tafelbergen, der einzelne Weltenbaum der Oase)", groesse);
/* Nachtrag #142: 4–6 einzelne Stellen über der Stufe der Gegend im Süden und Westen, bis Stufe 45, versteckt abseits der Wege */
{ const STUFE = { eiche: 1, tanne: 10, eibe: 20, moorweide: 35, kernbaum: 45, kupfer: 1, eisen: 10, schwarzeisen: 20, sterneisen: 35, splittereisen: 45 };
  const E = gruppen.filter((g) => g.einzeln && imWest(g.pts[0])), wegZ = new Set(["e", "k", "p"]);
  const GR = readdirSync(join(WELT, "regionen")).filter((n) => existsSync(join(WELT, "regionen", n, "region.json"))).map((n) => { const r = JSON.parse(readFileSync(join(WELT, "regionen", n, "region.json"), "utf8")); return r.ebene || r.entwurf ? null : { x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }; }).filter(Boolean);
  const zeichen = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
  const nahWeg = E.filter((g) => { const p = g.pts[0]; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (wegZ.has(zeichen(p.x + dx, p.y + dy))) return true; return false; }).map((g) => g.name);
  const zuHoch = E.filter((g) => STUFE[g.pts[0].art] === undefined || STUFE[g.pts[0].art] > 45 || STUFE[g.pts[0].art] < 20).map((g) => `${g.name}: ${g.pts[0].art}`);
  check(E.length >= 4 && E.length <= 6 && E.every((g) => g.pts.length === 1) && !zuHoch.length, `${E.length} einzelne Stellen über der Gegend (Stufe 20–45): ${E.map((g) => g.pts[0].art).join(", ")}`, zuHoch);
  check(!nahWeg.length, "sie liegen versteckt, mindestens 6 Felder abseits der Wege (kein Feldweg)", nahWeg); }
const zahl = (o, t) => gruppen.filter((g) => g.ort === o && g.typ === t).length;
check(zahl("erlengrund", "holz") >= 3 && zahl("lehmfurt", "erz") >= 3, `Schwerpunkte: Erlengrund ${zahl("erlengrund", "holz")} Baumgruppen, Lehmfurt ${zahl("lehmfurt", "erz")} Senken`);
/* shared/ ohne die schon eingebauten Gruppen dieser Datei (Integration hängt sie an holz_/bergbau_standorte.json an, #142) */
const eigene = new Set(gruppen.map((g) => g.name)), ids = gruppen.flatMap((g) => g.pts.map((p) => p.id)), shared = [...JSON.parse(readFileSync(join(REALTIME, "shared", "holz_standorte.json"), "utf8")).lichtungen.filter((l) => !eigene.has(l.name)).flatMap((l) => l.baeume), ...JSON.parse(readFileSync(join(REALTIME, "shared", "bergbau_standorte.json"), "utf8")).senken.filter((s) => !eigene.has(s.name)).flatMap((s) => s.adern)].map((p) => p.id);
const doppelt = ids.filter((id, i) => ids.indexOf(id) !== i || shared.includes(id)); check(!doppelt.length, `${ids.length} Kennungen eindeutig (auch gegenüber shared/)`, doppelt);
const region1 = gruppen.filter((g) => new Set(g.pts.map((p) => p.region)).size > 1).map((g) => g.name); check(!region1.length, "jede Gruppe liegt in einem Gebiet", region1);
const gp = lies("gegnerplaetze.json").plaetze, nah = wirksam.flatMap((g) => g.pts.filter((p) => gp.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 6)).map((p) => `${g.name} ${p.id}`)); check(!nah.length, "keine Gegnerplätze an den Bäumen und Adern", nah);
/* gesperrt (man läuft nicht durch den Stamm) und von außen erreichbar */
{ const R = welt(WEST, ["weidenhain"]), w = region("weidenhain"), [WX, WY] = w.region.ursprung.map((v) => v * 32), greifbar = flut(R, [WX + w.spiel.start[0][0], WY + w.spiel.start[0][1]], WEST);
  const west = wirksam.flatMap((g) => g.pts.filter(imWest).map((p) => ({ ...p, g: g.name }))), weg = west.filter((p) => !greifbar(p.x, p.y)), offen = west.filter((p) => R.begehbar(p.x, p.y));
  check(!weg.length, `Westen/Süden: ${west.length} Bäume und Adern von Weidenhain aus erreichbar`, weg.map((p) => `${p.g} ${p.id} ${p.x}|${p.y}`)); check(!offen.length, "ihre Felder sind gesperrt", offen.map((p) => p.id)); }
{ const R = welt(OST), greifbar = flut(R, [6918, 6740], OST);
  const ost = wirksam.flatMap((g) => g.pts.filter(imOst).map((p) => ({ ...p, g: g.name }))), weg = ost.filter((p) => !greifbar(p.x, p.y)), offen = ost.filter((p) => R.begehbar(p.x, p.y));
  check(!weg.length, `Glutsande: ${ost.length} Bäume und Adern vom Pass aus erreichbar`, weg.map((p) => `${p.g} ${p.id} ${p.x}|${p.y}`)); check(!offen.length, "ihre Felder sind gesperrt", offen.map((p) => p.id)); }
{ const R = welt(HOCH), greifbar = flut(R, [6800, 5766], HOCH);
  const hoch = wirksam.flatMap((g) => g.pts.filter(imHoch).map((p) => ({ ...p, g: g.name }))), weg = hoch.filter((p) => !greifbar(p.x, p.y)), offen = hoch.filter((p) => R.begehbar(p.x, p.y));
  check(hoch.length >= 20 && !weg.length, `Hochlande: ${hoch.length} Bäume und Adern von der Furt aus erreichbar`, weg.map((p) => `${p.g} ${p.id} ${p.x}|${p.y}`)); check(!offen.length, "ihre Felder sind gesperrt", offen.map((p) => p.id)); }
console.log(ok ? "\nSammelstellen: alles in Ordnung" : "\nSammelstellen: FEHLER"); process.exit(ok ? 0 : 1);
