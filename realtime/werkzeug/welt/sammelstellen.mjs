/*
 * World Pipeline – Sammelstellen (#142, 27.11.2026): Holzfäller-Bäume und Erzadern in Gruppen nahe jedem Ort im Süden, in Haferstedt/Netzbucht und in den Glutsande –
 * wie in OSRS: von jedem Ort ist man in wenigen Schritten an einer Gruppe. Nur vorhandene Arten (shared/holz.ts, shared/bergbau.ts), Stufe passend zur Gegend
 * (Süden 1–35, Küste/Haferstedt 1–35, Glutsande 35–65 nach Phase 9). Erlengrund (Holz) und Lehmfurt (Erz) bleiben Schwerpunkte.
 * Die schon früher vorgeschlagenen Stellen (sueden_orte.json holz/erze, kueste_orte.json eiben/adern, glutsande_orte.json adern, Weltenbaum der Oase) werden
 * als feste Gruppen übernommen.
 * Schreibt welt/sammelstellen.json im Format der Standortdateien ({ lichtungen: [{ name, baeume }], senken: [{ name, x, y, r, adern }] }):
 *   · lichtungen.mjs liest sie (wie die Vorschläge in welt/orte.json): Bewuchs weg, Feldweg zum nächsten Weg, Baum- und Aderfelder gesperrt, Senke für drei.mjs;
 *   · gegnerplaetze.py hält sie von Gegnern frei;
 *   · ins Spiel kommen sie, wenn sie in shared/holz_standorte.json und shared/bergbau_standorte.json stehen (Integration/Systeme, siehe Issue).
 * Stabil: schon vorhandene Gruppen (gleicher Name) bleiben, wo sie sind; nur fehlende werden gesucht. Neu würfeln: --neu.
 * Aufruf (im Ordner realtime): node werkzeug/welt/sammelstellen.mjs [--neu]   (nach festland/orte, vor lichtungen)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const DATEI = join(WELT, "sammelstellen.json"), C = 32;
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const lies = (f) => (existsSync(join(WELT, f)) ? JSON.parse(readFileSync(join(WELT, f), "utf8")) : {});
const HOLZ_ARTEN = ["eiche", "tanne", "eibe", "moorweide", "kernbaum", "weltenbaum"], ERZ_ARTEN = ["kupfer", "eisen", "schwarzeisen", "sterneisen", "splittereisen", "ureisen"];

/* ───── Welt lesen ───── */
const REG = [], hinder = [], figuren = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * C, y0 = r.ursprung[1] * C, z = readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n").filter((l) => l.length);
  REG.push({ n, x0, y0, x1: x0 + z[0].length, y1: y0 + z.length, z });
  for (const o of JSON.parse(readFileSync(join(WELT, "regionen", n, "objekte.json"), "utf8"))) { const k = BIB.get(o.objekt)?.kategorie; if (k && k !== "bewuchs") hinder.push([o.x + x0, o.y + y0, k === "gebaeude" ? 6 : 2]); }
  const sp = JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8"));
  for (const i of sp.interaktionen || []) figuren.push([i.x + x0, i.y + y0, 5]);
  for (const f of sp.figuren || []) figuren.push([f.x + x0, f.y + y0, 5]); }
const regionAn = (x, y) => REG.find((g) => x >= g.x0 && x < g.x1 && y >= g.y0 && y < g.y1);
const zeichen = (x, y) => { const g = regionAn(x, y); return g ? g.z[Math.floor(y) - g.y0][Math.floor(x) - g.x0] : "?"; };
const GEHBAR = new Set(".,afjvtsuygTmhd"), WEG = new Set(["e", "k", "p"]);
for (const g of [...(lies("gegnerplaetze.json").plaetze || []).filter((p) => !p.id.startsWith("gp_")), ...(lies("sueden_orte.json").gegner || [])]) hinder.push([g.x, g.y, 10 + (g.r || 0)]);
for (const [k, [x, y]] of Object.entries(lies("glutsande_orte.json").orte || {})) if (k.startsWith("lager")) hinder.push([x, y, 16]);
for (const s of [...(lies("troedler_standorte.json").standorte || []), ...(lies("bedienstellen.json").stationen || [])]) figuren.push([s.x, s.y, 5]);
const ORTE = { ...lies("sueden_orte.json").orte, ...lies("kueste_orte.json").orte, ...lies("glutsande_orte.json").orte, ...lies("beleben_orte.json").orte, ...lies("hochlande_orte.json").orte };
const HL = lies("hochlande_orte.json");
const ORTSRADIUS = { haferstedt: 40, sandquell: 34, glutbrunn: 46, kielmund: 34, netzbucht: 14, steinhag: 58, steinhagsee: 36, spiegelsee: 20, erzberg: 30, alm: 22, hochpass: 16, furt: 30, nordklippen: 10 };

/* ───── Gruppen: Ort, Art (holz/erz), Arten der Bäume bzw. Adern, Name ───── */
const fest = (liste) => liste.filter((p) => p.x !== undefined).map((p) => ({ id: p.id, art: p.art, x: p.x, y: p.y }));
const S = lies("sueden_orte.json"), K = lies("kueste_orte.json"), GL = lies("glutsande_orte.json");
const ureisen = fest(GL.adern || []);
const PLAN = [
  /* Süden an der Südstraße (Stufe 1–35) */
  ["heckenhof", "holz", ["eiche", "eiche", "eiche", "eiche"], "Eichen am Heckenhof"],
  ["heckenhof", "erz", ["kupfer", "kupfer", "kupfer"], "Kupfersenke am Heckenhof"],
  ["summweide", "holz", ["eiche", "eiche", "tanne", "tanne"], "Hain an der Summweide"],
  ["summweide", "erz", ["kupfer", "kupfer", "eisen"], "Senke an der Summweide"],
  ["halber_weg", "erz", ["kupfer", "kupfer", "eisen", "eisen"], "Senke am Halben Weg"],
  ["halber_weg", "holz", ["eiche", "eiche", "tanne"], "Eichen am Halben Weg"],
  ["erlengrund", "fest", fest(S.holz || []).slice(0, 4), "Holzfällerschlag am Erlengrund"],   /* der fünfte, abseits stehende Vorschlag entfällt (Gruppen statt Einzelbäume) */
  ["erlengrund", "holz", ["tanne", "tanne", "tanne", "eibe"], "Tannen hinter der Sägemühle"],
  ["kraeuterhof", "holz", ["eibe", "eibe", "eibe", "eibe"], "Eibenhain beim Kräuterhof"],   /* ersetzt die verstreuten Eiben-Vorschläge aus kueste_orte.json */
  ["erlengrund", "holz", ["eibe", "eibe", "eibe", "moorweide"], "Eiben am Erlengrund"],
  ["erlengrund", "erz", ["kupfer", "kupfer", "eisen"], "Senke am Erlengrund"],
  ["kreuzstein", "holz", ["tanne", "tanne", "tanne", "eiche"], "Tannen am Kreuzstein"],
  ["kreuzstein", "erz", ["eisen", "eisen", "kupfer"], "Senke am Kreuzstein"],
  ["schilfsee", "holz", ["moorweide", "moorweide", "moorweide"], "Moorweiden am Schilfsee"],
  ["schilfsee", "erz", ["eisen", "eisen", "schwarzeisen"], "Senke am Schilfsee"],
  ["lehmfurt", "festerz", fest(S.erze || []), "Steinbruch von Lehmfurt"],
  ["lehmfurt", "erz", ["eisen", "schwarzeisen", "schwarzeisen", "sterneisen"], "Tiefe Senke bei Lehmfurt"],
  ["lehmfurt", "erz", ["kupfer", "kupfer", "eisen", "eisen"], "Lehmgrube bei Lehmfurt"],
  ["lehmfurt", "holz", ["eiche", "tanne", "tanne"], "Wäldchen bei Lehmfurt"],
  ["distelhof", "erz", ["eisen", "eisen", "schwarzeisen"], "Eisensenke am Distelhof"],
  ["distelhof", "holz", ["eiche", "eiche", "tanne"], "Eichen am Distelhof"],
  ["faehrtenlager", "holz", ["tanne", "tanne", "eibe", "eibe"], "Jägerschlag am Fährtenlager"],
  ["faehrtenlager", "erz", ["eisen", "eisen", "schwarzeisen"], "Senke am Fährtenlager"],
  ["laemmerhang", "holz", ["eiche", "eiche", "eiche"], "Eichen am Lämmerhang"],
  ["laemmerhang", "erz", ["kupfer", "kupfer", "eisen"], "Senke am Lämmerhang"],
  /* Küste (Phase 10) und die neuen Orte im Westen (#140) */
  ["kielmund", "holz", ["eiche", "tanne", "tanne", "eibe"], "Gehölz bei Kielmund"],
  ["kielmund", "erz", ["eisen", "schwarzeisen", "schwarzeisen"], "Senke bei Kielmund"],
  ["moewenbucht", "holz", ["eibe", "eibe", "eiche"], "Eiben an der Möwenbucht"],
  ["moewenbucht", "erz", ["kupfer", "eisen", "eisen"], "Senke an der Möwenbucht"],
  ["leuchtturm", "erz", ["kupfer", "kupfer", "eisen", "eisen"], "Klippenadern am Leuchtturm"],   /* ersetzt die vier verstreuten Vorschläge aus kueste_orte.json */
  ["haferstedt", "holz", ["eiche", "eiche", "eiche", "tanne"], "Eichen bei Haferstedt"],
  ["haferstedt", "holz", ["tanne", "eibe", "eibe"], "Gehölz nördlich von Haferstedt"],
  ["haferstedt", "erz", ["kupfer", "eisen", "eisen", "schwarzeisen"], "Senke bei Haferstedt"],
  ["netzbucht", "holz", ["eibe", "eibe", "eiche"], "Eiben an der Netzbucht"],
  ["netzbucht", "erz", ["kupfer", "kupfer", "eisen"], "Senke an der Netzbucht"],
  /* Glutsande (Phase 9, Gefahr 40–60, Rohstoffe bis 65) */
  ["tempel", "festerz", ureisen, "Ureisen in den Tafelbergen"],
  ["oase", "festholz", [{ id: "weltenbaum_oase", art: "weltenbaum", x: 7263.5, y: 6796.5 }], "Weltenbaum in der Oase"],
  ["sandquell", "erz", ["sterneisen", "sterneisen", "splittereisen", "splittereisen"], "Felsen bei Sandquell"],
  ["sandquell", "holz", ["kernbaum", "kernbaum", "kernbaum"], "Kernbäume an der Quelle"],
  ["glutbrunn", "holz", ["moorweide", "moorweide", "kernbaum", "kernbaum"], "Bäume im Flusstal bei Glutbrunn"],
  ["glutbrunn", "erz", ["sterneisen", "splittereisen", "splittereisen"], "Senke über Glutbrunn"],
  ["salzpfanne", "erz", ["splittereisen", "sterneisen", "splittereisen"], "Felsen an der Salzpfanne"],
  ["salzpfanne", "holz", ["moorweide", "kernbaum", "kernbaum"], "Bäume an der Siederei"],
  ["nordstrand", "holz", ["kernbaum", "kernbaum", "moorweide"], "Kernbäume am Nordstrand"],
  ["nordstrand", "erz", ["sterneisen", "sterneisen", "splittereisen"], "Felsen am Nordstrand"],
  /* Hochlande (Phase 11, #147): Stufe 40–65 – Bergbau im Bergwerk und an den Geröllhängen, Holz in den Tälern, einzelne alte Bäume */
  ["bergwerk", "festerz", (HL.adern || []).map((p) => ({ ...p })), "Erzadern im Erzberg-Bergwerk"],
  ["erzberg", "erz", ["sterneisen", "sterneisen", "splittereisen", "splittereisen"], "Geröllhang am Erzberg"],
  ["hochpass", "erz", ["splittereisen", "splittereisen", "ureisen"], "Erzgrat am Hochpass"],
  ["steinhag", "holz", ["kernbaum", "kernbaum", "eibe", "eibe"], "Bergwald unter Steinhag"],
  ["steinhag", "erz", ["sterneisen", "sterneisen", "splittereisen"], "Steinbruch von Steinhag"],
  ["alm", "holz", ["kernbaum", "kernbaum", "kernbaum", "eibe"], "Kernbäume an der Hohen Alm"],
  ["alm", "erz", ["sterneisen", "splittereisen", "splittereisen"], "Felsen an der Hohen Alm"],
  ["einsiedelei", "holz", ["eibe", "kernbaum", "kernbaum"], "Bäume am Spiegelsee"],
  ["einsiedelei", "einzeln", ["weltenbaum"], "Der alte Baum über dem Spiegelsee"],
  ["nordklippen", "erz", ["ureisen", "splittereisen", "splittereisen"], "Adern in den Nordklippen"],
  /* Nachtrag des Nutzers (#142): einzelne Stellen deutlich über der Gegend, sparsam, versteckt abseits der Wege (ohne Feldweg) – zum Entdecken */
  ["heckenhof", "einzeln", ["eibe"], "Einsame Eibe hinter dem Heckenhof"],
  ["summweide", "einzeln", ["moorweide"], "Alte Moorweide im Wiesengrund"],
  ["haferstedt", "einzeln", ["kernbaum"], "Kernbaum im Wald über Haferstedt"],
  ["faehrtenlager", "einzeln", ["sterneisen"], "Sterneisen-Brocken im Gehölz"],
  ["laemmerhang", "einzeln", ["splittereisen"], "Splitterfels am Lämmerhang"],
  ["netzbucht", "einzeln", ["schwarzeisen"], "Schwarzeisen an der Bucht"],
];
ORTE.leuchtturm ??= [6176, 7036];

/* ───── Suche ───── */
const alt = !process.argv.includes("--neu") && existsSync(DATEI) ? JSON.parse(readFileSync(DATEI, "utf8")) : { lichtungen: [], senken: [] };
const altNach = new Map([...alt.lichtungen.map((l) => [l.name, { ...l, typ: "holz" }]), ...alt.senken.map((s) => [s.name, { ...s, typ: "erz" }])]);
const gesetzt = []; /* [x, y, r] */
for (const g of altNach.values()) { const pts = g.baeume || g.adern, mx = g.x ?? pts.reduce((s, p) => s + p.x, 0) / pts.length, my = g.y ?? pts.reduce((s, p) => s + p.y, 0) / pts.length; gesetzt.push([mx, my, g.r ?? 6]); }
const wegNah = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (WEG.has(zeichen(x + dx, y + dy))) return true; return false; };
const wegErreichbar = (x, y, max = 60) => { const g = regionAn(x, y); if (!g) return false; const s = new Set([Math.floor(x) + "," + Math.floor(y)]), q = [[Math.floor(x), Math.floor(y), 0]];
  while (q.length) { const [a, b, d] = q.shift(); if (d > max) return false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = a + dx, ny = b + dy, k = nx + "," + ny; if (s.has(k) || nx < g.x0 + 1 || ny < g.y0 + 1 || nx >= g.x1 - 1 || ny >= g.y1 - 1) continue; const c = zeichen(nx + 0.5, ny + 0.5);
      if (WEG.has(c)) return true; if (!GEHBAR.has(c) || hinder.some(([hx, hy, hr]) => hr <= 2 && Math.abs(hx - nx - 0.5) < 1.6 && Math.abs(hy - ny - 0.5) < 1.6)) continue; s.add(k); q.push([nx, ny, d + 1]); } } return false; };
const anordnen = (arten, cx, cy, erz) => { const n = arten.length, r = erz ? 2.6 : 3.4; return arten.map((art, i) => { const a = (i / n) * Math.PI * 2 + (erz ? 0.4 : 0.9); return { art, x: Math.floor(cx + Math.cos(a) * r) + 0.5, y: Math.floor(cy + Math.sin(a) * r) + 0.5 }; }); };
function suche(ort, arten, erz, einzeln = false) {
  const [ox, oy] = ORTE[ort], or = ORTSRADIUS[ort] ?? 12, R = einzeln ? 4 : erz ? 5 : 6.6; let best = null;
  for (let d = or + (einzeln ? 34 : 4); d < or + (einzeln ? 110 : 46) && !best; d += 2) for (let a = 0; a < 6.28; a += 0.21) {
    const cx = ox + Math.cos(a) * d, cy = oy + Math.sin(a) * d, g = regionAn(cx, cy); if (!g || cx - R - 3 < g.x0 || cy - R - 3 < g.y0 || cx + R + 3 > g.x1 || cy + R + 3 > g.y1) continue;
    const pts = einzeln ? [{ art: arten[0], x: Math.floor(cx) + 0.5, y: Math.floor(cy) + 0.5 }] : anordnen(arten, cx, cy, erz); if (pts.some((p) => !GEHBAR.has(zeichen(p.x, p.y)) || "a".includes(zeichen(p.x, p.y)) || wegNah(p.x, p.y, einzeln ? 9 : 1))) continue;
    let gut = 0, alle = 0; for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) if (Math.hypot(x - cx, y - cy) <= R) { alle++; if (GEHBAR.has(zeichen(x, y)) && zeichen(x, y) !== "a") gut++; } if (gut < alle * 0.85) continue;
    if (hinder.some(([x, y, r]) => Math.hypot(x - cx, y - cy) < R + r) || figuren.some(([x, y, r]) => Math.hypot(x - cx, y - cy) < R + r)) continue;
    if (Object.entries(ORTE).some(([k, [x, y]]) => Math.hypot(x - cx, y - cy) < (ORTSRADIUS[k] ?? 12) + R - 2)) continue;
    if (gesetzt.some(([x, y, r]) => Math.hypot(x - cx, y - cy) < r + R + 6)) continue;
    if (!wegErreichbar(cx, cy, einzeln ? 140 : 60)) continue;
    best = { cx, cy, R, pts, region: g.n }; }
  return best; }

const lichtungen = [], senken = [], bericht = [];
for (const [ort, typ, arten, name] of PLAN) {
  if (altNach.has(name)) { const g = altNach.get(name), zusatz = g.einzeln ? { einzeln: true, ohneWeg: true } : {}; if (g.typ === "holz") lichtungen.push({ name, ort, baeume: g.baeume, ...zusatz }); else senken.push({ name, ort, x: g.x, y: g.y, r: g.r, adern: g.adern, ...zusatz }); bericht.push(`${name}: bleibt`); continue; }
  if (typ.startsWith("fest")) { if (!arten.length) { bericht.push(`${name}: keine Vorschläge`); continue; } const erz = typ === "festerz" || ERZ_ARTEN.includes(arten[0].art);
    /* feste Vorschläge nach Nähe gruppieren (eine Gruppe je 20 Felder) */
    const teile = []; for (const p of arten) { const t = teile.find((t) => t.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 20)); (t || (teile.push([]), teile.at(-1))).push(p); }
    teile.forEach((t, i) => { const nm = teile.length > 1 ? `${name} ${i + 1}` : name, region = t[0].region ?? regionAn(t[0].x, t[0].y).n, pts = t.map((p) => ({ ...p, region })), mx = t.reduce((s, p) => s + p.x, 0) / t.length, my = t.reduce((s, p) => s + p.y, 0) / t.length;
      if (erz) senken.push({ name: nm, ort, x: +mx.toFixed(1), y: +my.toFixed(1), r: Math.max(4, Math.ceil(Math.max(...t.map((p) => Math.hypot(p.x - mx, p.y - my))) + 2)), adern: pts });
      else lichtungen.push({ name: nm, ort, baeume: pts }); gesetzt.push([mx, my, 6]); bericht.push(`${nm}: fest (${t.length})`); });
    continue; }
  const einzeln = typ === "einzeln", erz = typ === "erz" || (einzeln && ERZ_ARTEN.includes(arten[0])), f = suche(ort, arten, erz, einzeln); if (!f) { bericht.push(`${name}: KEIN PLATZ`); continue; }
  const stamm = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
  const pts = f.pts.map((p, i) => ({ id: `${stamm}_${p.art}_${i + 1}`, art: p.art, x: p.x, y: p.y, region: f.region }));
  const zusatz = einzeln ? { einzeln: true, ohneWeg: true } : {};
  if (erz) senken.push({ name, ort, x: +f.cx.toFixed(1), y: +f.cy.toFixed(1), r: einzeln ? 3 : 5, adern: pts, ...zusatz }); else lichtungen.push({ name, ort, baeume: pts, ...zusatz });
  gesetzt.push([f.cx, f.cy, f.R]); bericht.push(`${name}: ${Math.round(Math.hypot(f.cx - ORTE[ort][0], f.cy - ORTE[ort][1]))} Felder vom Ort`); }
for (const g of [...lichtungen.flatMap((l) => l.baeume), ...senken.flatMap((s) => s.adern)]) if (![...HOLZ_ARTEN, ...ERZ_ARTEN].includes(g.art)) throw new Error("unbekannte Art " + g.art);
writeFileSync(DATEI, JSON.stringify({ _hinweis: "Erzeugt von werkzeug/welt/sammelstellen.mjs (#142): Holzfäller-Bäume (lichtungen) und Erzadern (senken) in Gruppen nahe den Orten, Weltfelder, Format wie shared/holz_standorte.json und shared/bergbau_standorte.json. lichtungen.mjs schneidet sie frei; ins Spiel kommen sie über die Standortdateien in shared/.",
  lichtungen, senken }, null, 1) + "\n");
console.log(bericht.join("\n")); console.log(`Sammelstellen: ${lichtungen.length} Baumgruppen (${lichtungen.reduce((s, l) => s + l.baeume.length, 0)} Bäume), ${senken.length} Senken (${senken.reduce((s, l) => s + l.adern.length, 0)} Adern)`);
