/*
 * World Pipeline – Phase 12 Ockerlande (#172, 27.11.2026; Plan welt/plaene/ockerlande_plan.png, Konzept doku/konzepte/phase-12.md). Schritt 1: Gelände.
 *   Lehmsteppe (neuer Boden Lehm „l“ und Lehm, rissig „L“, boden_lehm.py) statt der Dünen im Kernland, am Rand zu den Glutsanden und an den Küsten bleibt Sand;
 *   Ockerstrom im Westen (Nord → Süd ins Südmeer, Furt bei Rotlehm), drei Tafelberge (Felsrand, flache Kuppe), zwei Trockenflüsse, Wasserlöcher, Akazienhaine.
 * Nur vorhandene Objekte. Schreibt welt/festland/plan_ockerlande.json (festland.py) und welt/ockerlande_orte.json. Wiederholbar (Grund in welt/festland/ockerlande_grund.json).
 * Aufruf (im Ordner realtime): node werkzeug/welt/ockerlande.mjs, danach die ganze Kette.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const breit = (x, y) => Math.sin(x / 17 + y / 23 + 0.7) + 0.7 * Math.sin(y / 13 - x / 19);
const gross = (x, y) => Math.sin(x / 61 + y / 47 + 1.3) + 0.8 * Math.sin(y / 53 - x / 71 + 0.4) + 0.5 * Math.sin((x + y) / 37);
let saat = 12012; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wahl = (l) => l[Math.floor(wurf() * l.length)];

/* ───── Grund ───── */
const GRUNDDATEI = join(WELT, "festland", "ockerlande_grund.json");
const alt = existsSync(GRUNDDATEI) ? new Map(Object.entries(JSON.parse(readFileSync(GRUNDDATEI, "utf8")).felder)) : new Map();
const GR = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  GR.push({ n, x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const regionVon = (x, y) => GR.find((g) => { const z = g.z[Math.floor(y) - g.y0]; return z && x >= g.x0 && x < g.x0 + z.length; })?.n;
const roh = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const grund = (x, y) => alt.get(Math.floor(x) + "," + Math.floor(y)) ?? roh(x, y);

/* ───── Plan ───── */
const feld = new Map(), urs = new Map(), hoehen = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [];
const nass = (c) => "~wMo".includes(c);
const setze = (x, y, c) => { const k = Math.floor(x) + "," + Math.floor(y), g = grund(x, y); if (g === "?" || g === "M" || (nass(g) && c !== "w" && c !== "~")) return; if (!urs.has(k)) urs.set(k, g); feld.set(k, c); };
const jetzt = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehen.set(k, (hoehen.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
let nr = 0;
const ding = (objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: mehr.id || `ok_${objekt.replace(/^(stil|k|moor|wald|dorf)_/, "").replace(/_\d+$/, "")}_${++nr}`, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });

const PLAN = JSON.parse(readFileSync(join(WELT, "plaene", "ockerlande_plan.json"), "utf8"));
const koerperVon = (o) => { const b = BIB.get(o.objekt); const k = o.kollision || b?.kollision; const s = o.s ?? 1;
  const kk = k?.koerper || (k?.art === "rechteck" ? [{ x0: k.x, x1: k.x + k.b, y0: k.y, y1: k.y + k.h }] : k?.art === "kreis" ? [{ x0: -k.r, x1: k.r, y0: -k.r, y1: k.r }] : []);
  return kk.map((c) => [o.x + c.x0 * s, o.y + c.y0 * s, o.x + c.x1 * s, o.y + c.y1 * s, o.id || o.objekt]); };
const koerper = [];
for (const f of readdirSync(join(WELT, "festland"))) if (/^plan_.*\.json$/.test(f) && f !== "plan_ockerlande.json") for (const o of JSON.parse(readFileSync(join(WELT, "festland", f), "utf8")).objekte || []) if (o.objekt) koerper.push(...koerperVon(o));
const bau = (objekt, x, y, mehr = {}) => { const b = BIB.get(objekt); if (b && b.kategorie !== "bewuchs" && Number.isInteger(y / 32)) y -= 0.01; const o = ding(objekt, x, y, mehr);
  const rs = koerperVon(o); for (const r of rs) { const hit = koerper.find((q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3]); if (hit && b.kategorie === "gebaeude") throw new Error(`${o.id} überdeckt ${hit[4]}`); } koerper.push(...rs);   /* erst alle Körper prüfen: mehrteilige Gebäude überdecken sich nicht selbst */ return o; };
const BODEN = new Set([..."lLy.,gsfa"]);
const npc = [], banken = [], laeden = [], stationen = [], namen = [], orte = {}, rast = [], wege = [], fische = [];
const passt1 = (r, mehr) => { const rand = mehr.rand ?? 1; if (regionVon(r[0], r[1] - 0.5) !== regionVon(r[2], r[3] + 0.5)) return false;
  for (let v = Math.floor(r[1]) - rand; v < Math.ceil(r[3]) + rand; v++) for (let u = Math.floor(r[0]) - rand; u < Math.ceil(r[2]) + rand; u++) if (!BODEN.has(jetzt(u + 0.5, v + 0.5))) return false;
  if (koerper.some((q) => r[0] - 1.4 < q[2] && q[0] < r[2] + 1.4 && r[1] - 1.4 < q[3] && q[1] < r[3] + 1.4)) return false;
  if ([...interaktionen.map((i) => [i.x, i.y]), ...npc.map((n) => [n.x, n.y])].some(([px, py]) => px > r[0] - 2 && px < r[2] + 2 && py > r[1] - 2 && py < r[3] + 2)) return false;
  return !(mehr.frei && mehr.frei.some(([a, b, c, d]) => r[0] < c && a < r[2] && r[1] < d && b < r[3])); };
const passt = (objekt, x, y, s = 1, mehr = {}) => { const rs = koerperVon({ objekt, x, y, s }); return !rs.length || rs.every((r) => passt1(r, mehr)); };
const baue = (objekt, x, y, mehr = {}, suche = 8) => { const s = mehr.s ?? 1; for (let r = 0; r <= suche; r += 0.5) for (let a = 0; a < 6.28; a += r ? 0.4 / r + 0.2 : 7) { const px = Math.round((x + Math.cos(a) * r) * 2) / 2, py = Math.round((y + Math.sin(a) * r) * 2) / 2;
    if (passt(objekt, px, py, s, mehr)) { const { rand, frei, ...rest } = mehr; return bau(objekt, px, py, rest); } }
  throw new Error(`kein Platz für ${mehr.id || objekt} bei ${x}|${y}`); };
const weg = (punkte, breite = 1.8, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]); wege.push({ punkte, breite, zeichen });
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => (strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) && !nass(jetzt(x, y)) && jetzt(x, y) !== "F" ? zeichen : null)); };

const LAND = [6660, 7070, 8000, 7790];   /* Rechteck der Ockerlande (südlich des Glutflusses) */
const imLand = (x, y) => x > LAND[0] && x < LAND[2] && y > LAND[1] && y < LAND[3] && regionVon(x, y) && !/^Die Glutsande$/.test("");
const kuesteNah = (x, y, r) => { for (let a = 0; a < 6.28; a += 0.7) if (grund(x + Math.cos(a) * r, y + Math.sin(a) * r) === "M") return true; return false; };

/* ═══════ 1. Lehmsteppe: Dünen und Steppe im Kernland werden Lehm, rissig nach großem Rauschen; am Glutfluss-Rand und an der Küste bleibt Sand ═══════ */
male(LAND[0], LAND[1], LAND[2], LAND[3], (x, y) => { const g = grund(x, y); if (!"uy".includes(g)) return null;
  const innen = Math.min(y - LAND[1], LAND[3] - y, x - LAND[0], LAND[2] - x), rand = Math.min(innen, 60) / 60 + 0.35 * gross(x * 1.3, y * 1.3) / 2.3 + 0.12 * breit(x, y);   /* weicher Übergang an allen Seiten */
  if (rand < 0.5 || kuesteNah(x, y, 10)) return null;
  const r = gross(x, y) + 0.35 * breit(x * 1.7, y * 1.7) + 0.15 * welle(x, y);
  return r > 1.05 ? "L" : r > -1.2 ? "l" : g === "y" ? "y" : (welle(x, y) > 0.8 ? "y" : "l"); });

/* ═══════ 2. Ockerstrom im Westen: Quelle im Norden, Mündung ins Südmeer; Ufer mit Gras und Schilf, Furt bei Rotlehm ═══════ */
const STROM = PLAN.ockerstrom, FURT_Y = PLAN.orte.Rotlehm[1];
{ const xs = STROM.map((p) => p[0]), ys = STROM.map((p) => p[1]);
  male(Math.min(...xs) - 12, Math.min(...ys) - 4, Math.max(...xs) + 12, Math.max(...ys) + 40, (x, y) => {
    const t = Math.max(0, Math.min(1, (y - ys[0]) / (ys.at(-1) - ys[0]))), b = 2.2 + 3.2 * t + 0.5 * breit(x, y), d = strecke(x, y, [...STROM, [STROM.at(-1)[0] + 10, STROM.at(-1)[1] + 40]]) + 0.3 * welle(x, y);
    if (d < b + 3) hebe(x, y, -0.7 * Math.max(0, 1 - d / (b + 3)));
    if (Math.abs(y - FURT_Y) < 2.6 && d < b) return "s";   /* Furt: Sandbank quer durch den Strom */
    return d < b ? "w" : d < b + 1.2 ? (welle(x, y) > 0.3 ? "s" : "v") : d < b + 4 ? (welle(x, y) > 0.9 ? "," : ".") : null; }); }

/* ═══════ 3. Tafelberge: Felsrand (gesperrt), flache Kuppe, Aufgang an einer Seite ═══════ */
const TAFEL = {};
for (const [name, [cx, cy, rx, ry]] of Object.entries(PLAN.tafelberge)) {
  const aufgang = name === "Roter Tisch" ? [cx - rx - 4, cy] : [cx, cy + ry + 4];
  male(cx - rx - 6, cy - ry - 6, cx + rx + 6, cy + ry + 6, (x, y) => { const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.06 * breit(x * 2, y * 2);
    if (d > 1.15) return null; const kuppe = d < 0.82, rampe = strecke(x, y, [aufgang, [cx + (aufgang[0] - cx) * 0.6, cy + (aufgang[1] - cy) * 0.6]]) < 2;
    hebe(x, y, d < 0.82 ? 7 : d < 1.0 ? 7 * (1 - (d - 0.82) / 0.18) + 1 : 1 * (1.15 - d) / 0.15);
    if (rampe) return "g"; if (kuppe) return welle(x * 0.5, y * 0.5) > 0.6 ? "g" : "L"; return d < 1.0 ? "F" : "g"; });
  TAFEL[name] = { mitte: [cx, cy], r: [rx, ry], aufgang }; }

/* ═══════ 4. Trockenflüsse: Sand und Kies, leicht eingesenkt ═══════ */
for (const t of PLAN.trockenfluesse) { const xs = t.map((p) => p[0]), ys = t.map((p) => p[1]);
  male(Math.min(...xs) - 5, Math.min(...ys) - 5, Math.max(...xs) + 5, Math.max(...ys) + 5, (x, y) => { const d = strecke(x, y, t) + 0.6 * welle(x * 0.6, y * 0.6); if (d > 3.2) return null;
    hebe(x, y, -0.4 * (1 - d / 3.2)); const c = jetzt(x, y); if (nass(c) || c === "F") return null; return d < 1.6 ? "s" : welle(x, y) > 0.2 ? "g" : null; }); }

/* ═══════ 5. Wasserlöcher mit grünem Rand, Akazienhaine ═══════ */
for (const [x0, y0] of PLAN.wasserloecher) male(x0 - 9, y0 - 7, x0 + 9, y0 + 7, (x, y) => { const d = Math.hypot((x - x0) / 5, (y - y0) / 3.5) + 0.1 * welle(x, y); if (d < 1.6) hebe(x, y, -0.4 * Math.max(0, 1.4 - d));
  return d < 1 ? "w" : d < 1.4 ? (welle(x, y) > 0 ? "v" : ".") : d < 1.9 ? (welle(x, y) > 0.5 ? "." : null) : null; });
const AKAZIE = ["ocker_akazie", "stil_laub_gold", "ocker_akazie"];   /* Akazie von Figuren (#172) */
for (const [cx, cy, r] of PLAN.akazienhaine) for (let i = 0; i < r * 1.2; i++) { const a = wurf() * 6.28, d = Math.sqrt(wurf()) * r, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
  if (!"lLy.,".includes(jetzt(x, y)) || objekte.some((o) => Math.hypot(o.x - x, o.y - y) < 3)) continue; ding(wahl(AKAZIE), x, y, { s: +(0.85 + wurf() * 0.35).toFixed(2) }); }
/* Streu: einzelne Akazien und Felsen auf der Steppe */
for (let i = 0; i < 9000 && objekte.length < 360; i++) { const x = LAND[0] + wurf() * (LAND[2] - LAND[0]), y = LAND[1] + wurf() * (LAND[3] - LAND[1]), c = jetzt(x, y);
  if (!"lLy".includes(c) || objekte.some((o) => Math.hypot(o.x - x, o.y - y) < 9)) continue; ding(wurf() < 0.55 ? wahl(AKAZIE) : wahl(["k_fels_klein", "k_fels_breit"]), x, y, { s: +(0.7 + wurf() * 0.4).toFixed(2) }); }

/* ═══════ 6. Schritt 2: Wege, Rotlehm, Brunnenkreis, Rastplätze (Dornhag und Tafelrast folgen) ═══════ */
const RL = PLAN.orte.Rotlehm.slice(0, 2), BK = PLAN.orte.Brunnenkreis.slice(0, 2), DH = PLAN.orte.Dornhag.slice(0, 2), TR = PLAN.orte.Tafelrast.slice(0, 2);
const ORTSFLAECHEN = [[RL[0] - 72, RL[1] - 52, RL[0] + 80, RL[1] + 58], [BK[0] - 22, BK[1] - 18, BK[0] + 22, BK[1] + 18]];
/* Streugut aus den Ortsflächen und von den Wegen nehmen, übriges Streugut zählt als Körper */
const alleWege = [PLAN.karawanenstrasse, ...PLAN.nebenwege];
for (let i = objekte.length - 1; i >= 0; i--) { const o = objekte[i]; if (ORTSFLAECHEN.some(([a, b, c, d]) => o.x > a && o.x < c && o.y > b && o.y < d) || alleWege.some((w) => strecke(o.x, o.y, w) < 5)) objekte.splice(i, 1); }
for (const o of objekte) koerper.push(...koerperVon(o));
weg(PLAN.karawanenstrasse, 2.6, "e"); for (const w of PLAN.nebenwege) weg(w, 1.8, "e");

/* ───── Rotlehm: Hauptort am Ostufer des Ockerstroms ───── */
{ const [cx, cy] = RL; eben.push([cx - 60, cy - 45, cx + 70, cy + 50]); orte.rotlehm = RL; namen.push(["Rotlehm", "Stadt", cx, cy]);
  /* Gassen: Hauptstraße von der Furt nach Osten, Querstraße, Gassen der Viertel */
  const FX = STROM.reduce((b, p) => (Math.abs(p[1] - FURT_Y) < Math.abs(b[1] - FURT_Y) ? p : b))[0];
  const G = [[[FX, FURT_Y], [cx + 70, cy]], [[cx, cy - 46], [cx, cy + 50]], [[cx - 50, cy - 24], [cx + 66, cy - 24]], [[cx - 50, cy + 22], [cx + 66, cy + 22]], [[cx - 40, cy - 40], [cx - 40, cy + 44]], [[cx + 40, cy - 40], [cx + 40, cy + 44]], [[cx - 50, cy + 40], [cx + 66, cy + 40]]];
  for (const g of G) weg(g, 2.4, "p");
  male(cx - 9, cy - 7, cx + 9, cy + 7, (x, y) => (Math.hypot((x - cx) / 9, (y - cy) / 7) < 1 ? "p" : null));   /* Markt */
  bau("ocker_ziehbrunnen", cx, cy - 0.5, { id: "rotlehm_brunnen" }); bau("moor_menhir_02", cx - 6, cy + 3, { id: "rotlehm_wegstein" }); bau("wz_bindestein", cx + 6, cy + 3, { id: "rotlehm_bindestein" });
  lies("rotlehm", cx + 2.5, cy + 1.6, "Rotlehm. Eine Stadt aus Lehm und Staub am Ockerstrom – hier enden die Karawanen aus den Glutsanden.");
  lies("rotlehm_wegstein", cx - 6, cy + 4.6, "Der Wegstein von Rotlehm."); lies("rotlehm_bindestein", cx + 6, cy + 4.6, "Ein Bindestein am Markt von Rotlehm.");
  for (const [i, [o, dx, dy]] of [["dorf_marktstand_01", -6, -5], ["dorf_marktstand_02", 6, -5], ["dorf_marktstand_03", -6, 6.5], ["k_stand_rot", 6, 6.5]].entries()) { const st = baue(o, cx + dx, cy + dy, { id: "rotlehm_stand_" + (i + 1), rand: 0 }, 3);
    laeden.push({ id: st.id, ort: "Rotlehm", art: "Marktstand", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] }); }
  /* Lehmfeste im Nordosten: Mauergeviert mit Torhaus, Bergfried, Türmen */
  { const F0 = [cx + 44, cy - 46, cx + 70, cy - 28], GX = (F0[0] + F0[2]) / 2; male(F0[0] + 1, F0[1] + 1, F0[2] - 1, F0[3] - 1, () => "g");
    for (let x = F0[0]; x < F0[2]; x += 2) { bau("burg_mauer_quer", x + 1, F0[1] + 1, { id: "rotlehm_feste_mauer_n" + x }); if (Math.abs(x + 1 - GX) > 2.6) bau("burg_mauer_quer", x + 1, F0[3] + 1, { id: "rotlehm_feste_mauer_s" + x }); }
    for (let y = F0[1]; y < F0[3] - 1; y += 2) { bau("burg_mauer_laengs", F0[0], y + 2, { id: "rotlehm_feste_mauer_w" + y }); bau("burg_mauer_laengs", F0[2], y + 2, { id: "rotlehm_feste_mauer_o" + y }); }
    for (const [x, y] of [[F0[0], F0[1]], [F0[2], F0[1]], [F0[0], F0[3]], [F0[2], F0[3]]]) bau("burg_eckturm", x, y + 1.3, { id: `rotlehm_feste_turm_${x}_${y}` });
    bau("burg_torhaus", GX, F0[3] + 1, { id: "rotlehm_feste_tor" }); bau("ocker_lehmfeste_01", GX, F0[1] + 12, { id: "rotlehm_feste_bergfried" });
    lies("rotlehm_feste", GX + 2.5, F0[3] + 3, "Die Lehmfeste von Rotlehm. Die Mauern sind dick wie ein Mann lang ist – gegen Hitze, Hyänen und Räuber.");
    npc.push({ id: "festenhauptfrau_rotlehm", rolle: "Hauptfrau der Lehmfeste", x: GX + 1.5, y: F0[1] + 12.5 }, { id: "festenwache_rotlehm", rolle: "Wache am Festentor", x: GX - 3, y: F0[3] + 3 }); }
  /* Karawanenhof im Nordwesten: ummauerter Hof mit Zelten, Ständen, Herd und Kessel */
  { const K0 = [cx - 52, cy - 46, cx - 16, cy - 28], GX = (K0[0] + K0[2]) / 2; male(K0[0] + 1, K0[1] + 1, K0[2] - 1, K0[3] - 1, () => "s");
    for (let x = K0[0]; x < K0[2]; x += 2) { bau("burg_mauer_quer", x + 1, K0[1] + 1, { id: "rotlehm_karawanenhof_mauer_n" + x }); if (Math.abs(x + 1 - GX) > 3) bau("burg_mauer_quer", x + 1, K0[3] + 1, { id: "rotlehm_karawanenhof_mauer_s" + x }); }
    for (let y = K0[1]; y < K0[3] - 1; y += 2) { bau("burg_mauer_laengs", K0[0], y + 2, { id: "rotlehm_karawanenhof_mauer_w" + y }); bau("burg_mauer_laengs", K0[2], y + 2, { id: "rotlehm_karawanenhof_mauer_o" + y }); }
    bau("burg_torhaus", GX, K0[3] + 1, { id: "rotlehm_karawanenhof_tor" });
    bau("ocker_karawanenhof_01", GX, K0[1] + 9, { id: "rotlehm_karawanenhof_halle" });
    for (const [i, x] of [K0[0] + 5, K0[2] - 5].entries()) bau(i ? "ocker_zelt_rund" : "ocker_zelt_gross", x, K0[1] + 7, { id: "rotlehm_karawanenhof_zelt_" + (i + 1) });
    const s1 = baue("dorf_marktstand_02", K0[0] + 8, K0[3] - 4, { id: "rotlehm_karawanenhof_stand_1", rand: 0 }, 3), s2 = baue("k_stand_rot", K0[2] - 8, K0[3] - 4, { id: "rotlehm_karawanenhof_stand_2", rand: 0 }, 3);
    for (const st of [s1, s2]) laeden.push({ id: st.id, ort: "Rotlehm", art: "Stand im Karawanenhof", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
    const h = baue("hand_herd_01", GX - 14.5, K0[1] + 13, { id: "rotlehm_karawanenhof_herd", rand: 0 }, 3), k = baue("hand_kessel_01", GX + 14.5, K0[1] + 13, { id: "rotlehm_karawanenhof_kessel", rand: 0 }, 3);   /* seitlich der Halle im Hof */
    stationen.push({ id: "herd_rotlehm", station: "herd", x: h.x, y: h.y + 1.4 }, { id: "kessel_rotlehm", station: "kessel", x: k.x, y: k.y + 1.4 });
    lies("rotlehm_karawanenhof", GX + 3.5, K0[3] + 3, "Der Karawanenhof. Kamelglocken, Gewürzsäcke, und im Schatten der Mauer schläft ein Treiber auf seinen Ballen.");
    npc.push({ id: "karawanenmeisterin_rotlehm", rolle: "Karawanenmeisterin (Karawanenhof)", x: GX, y: K0[1] + 16.5 }, { id: "treiber_rotlehm", rolle: "Treiber", x: K0[0] + 6, y: K0[1] + 10 }); }
  /* Bank, Werkstatt, Taverne */
  const bank = baue("waldmark_bank_01", cx + 14, cy - 10, { id: "rotlehm_bank" }); lies("rotlehm_bank_tuer", bank.x, bank.y + 0.6, "Die Bank von Rotlehm – im kühlsten Haus der Stadt.");
  banken.push({ id: "rotlehm_bank", ort: "Rotlehm", gebaeude: "rotlehm_bank", schalter: [bank.x, bank.y + 1.4] }); npc.push({ id: "bankier_rotlehm", rolle: "Bank", x: bank.x, y: bank.y + 1.4 });
  const sm = baue("dorf_schmiede_01", cx - 16, cy + 16, { id: "rotlehm_schmiede" }), wb = baue("hand_werkbank_01", sm.x + 7, sm.y + 1, { id: "rotlehm_werkbank", rand: 0 }, 3);
  stationen.push({ id: "esse_rotlehm", station: "esse", x: sm.x - 1.5, y: sm.y + 1.4 }, { id: "amboss_rotlehm", station: "amboss", x: sm.x + 1.5, y: sm.y + 1.4 }, { id: "werkbank_rotlehm", station: "werkbank", x: wb.x, y: wb.y + 1.4 });
  lies("rotlehm_werkstatt", sm.x, sm.y + 1.6, "Die Werkstatt von Rotlehm: Esse, Amboss, Werkbank – und Hufeisen für die Lasttiere.");
  const tav = baue("dorf_taverne_01", cx - 14, cy - 10, { id: "rotlehm_taverne" }); lies("rotlehm_taverne", tav.x + 1.5, tav.y + 0.6, "Die Taverne „Zum Roten Krug“. Es gibt Wasser, Dattelwein und Geschichten über die Tafelberge.");
  laeden.push({ id: "rotlehm_taverne", ort: "Rotlehm", art: "Taverne", x: tav.x + 1.5, y: tav.y + 1.4, blick: [0, 1] }); npc.push({ id: "wirt_rotlehm", rolle: "Wirt (Taverne)", x: tav.x + 1.5, y: tav.y + 1.4 });
  npc.push({ id: "haendler_rotlehm_1", rolle: "Händler (Markt)", x: cx - 6, y: cy - 3.8 }, { id: "fergin_rotlehm", rolle: "Fährmann an der Furt", x: FX + 6, y: FURT_Y + 2.5 });
  /* Häuser: Steinhäuser und Katen an den Gassen */
  const FREI = [[cx - 10, cy - 8, cx + 10, cy + 8]]; const HAUS = ["ocker_lehmhaus_01", "ocker_lehmhaus_02", "ocker_lehmhaus_03", "ocker_lehmhaus_04", "ocker_lehmhaus_01", "ocker_lehmhaus_03"];   /* Lehmhäuser von Figuren (#172) */
  let n = 0; for (const tiefe of [4, 8]) for (let y = cy - 44; y < cy + 48; y++) for (let x = cx - 56; x < cx + 72 && n < 40; x++) { if (n >= 40) break;
    const o = wahl(HAUS); if (!passt(o, x, y, 1, { frei: FREI })) continue; let vorn = false; for (let v = 1; v <= tiefe && !vorn; v++) for (let u = -1; u <= 1; u++) if ("pe".includes(jetzt(x + u, y + v))) vorn = true; if (!vorn) continue;
    bau(o, x, y); n++; }
  const geb = objekte.filter((o) => BIB.get(o.objekt)?.kategorie === "gebaeude" && Math.abs(o.x - cx) < 80 && Math.abs(o.y - cy) < 60).length;
  orte.rotlehm_gebaeude = geb;
  /* Fischplätze am Strom (Ufer an der Furt) */
  for (const [id, f, st, dy] of [["fischplatz_ockerstrom_nord", "moorhecht", 20, -14], ["fischplatz_ockerstrom_sued", "wels", 45, 16]]) {
    let px = FX + 6, py = FURT_Y + dy; while (px > FX - 10 && !nass(jetzt(px - 1, py))) px--; lies(id, px + 0.5, py + 0.5, "Am Ufer des Ockerstroms – das Wasser ist trüb, aber die Fische sind fett.", { fisch: f, stufe: st }); fische.push({ id, fisch: f, stufe: st, x: px - 0.5, y: py + 0.5, stehplatz: [px + 0.5, py + 0.5] }); } }

/* ───── Brunnenkreis: Wasserstelle mit Zeltlager der Karawanen ───── */
{ const W = PLAN.wasserloecher.reduce((b, p) => (Math.hypot(p[0] - BK[0], p[1] - BK[1]) < Math.hypot(b[0] - BK[0], b[1] - BK[1]) ? p : b)), [cx, cy] = W;   /* der Weiler um das Wasserloch */
  orte.brunnenkreis = [cx, cy]; namen.push(["Brunnenkreis", "Ort", cx, cy]);
  male(cx - 16, cy - 14, cx + 16, cy + 14, (x, y) => { const d = Math.hypot((x - cx) / 15, (y - cy) / 12); return d < 1 && !nass(jetzt(x, y)) && d > 0.5 ? "." : null; });
  for (let a = 0.3; a < 6.28; a += 1.05) { try { baue(a < 3 ? "ocker_zelt_rund" : "ocker_zelt_gross", cx + Math.cos(a) * 13, cy + Math.sin(a) * 10.5, { rand: 0 }, 4); } catch { /* kein Platz: Zelt fällt weg */ } }
  baue("ocker_lehmhaus_04", cx - 16, cy - 2, { id: "brunnenkreis_kate" }, 6); baue("ocker_lehmhaus_01", cx + 16, cy + 2, { id: "brunnenkreis_haus" }, 6);
  try { baue("ocker_ziehbrunnen", cx + 9, cy - 4, { id: "brunnenkreis_ziehbrunnen", rand: 0 }, 5); } catch { /* ohne Ziehbrunnen */ }
  const f = baue("dorf_festfeuer_01", cx + 7, cy + 7, { id: "brunnenkreis_feuer", rand: 0 }, 4); stationen.push({ id: "feuer_brunnenkreis", station: "feuer", x: f.x, y: f.y + 1.6 });
  const st = baue("dorf_marktstand_02", cx - 7, cy + 8, { id: "brunnenkreis_stand", rand: 0 }, 4); laeden.push({ id: st.id, ort: "Brunnenkreis", art: "Wasser und Proviant", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
  lies("brunnenkreis", cx, cy + 6, "Brunnenkreis. Ein Wasserloch, ein Kreis aus Zelten – und jede Karawane hält hier, ob sie will oder nicht.");
  npc.push({ id: "brunnenwaechter", rolle: "Brunnenwächter", x: cx + 2, y: cy + 5.5 }, { id: "haendlerin_brunnenkreis", rolle: "Händlerin (Wasser, Proviant)", x: st.x, y: st.y + 1.2 });
  fische.push(...[]); }

/* ───── Rastplätze ───── */
for (const [i, [x, y]] of PLAN.rastplaetze.entries()) { const id = "rast_ockerlande_" + (i + 1), f = baue("dorf_festfeuer_01", x + 3, y + 3, { id: id + "_feuer", rand: 1 }, 8); try { baue("wald_baumstamm_01", f.x - 2.5, f.y + 1.5, { id: id + "_stamm", s: 0.8, rand: 0 }, 4); } catch { /* ohne Stamm */ }
  lies(id, f.x + 0.5, f.y + 2.4, "Ein Rastplatz an der Karawanenstraße. Asche, Dattelkerne, ein umgestürzter Krug."); rast.push(id); }

/* ═══════ 7. Schritt 3: Dornhag, Tafelrast, Höhle am Roten Tisch (Ureisen), Fische und Kräuter an den Wasserlöchern ═══════ */
const kraeuter = [], adern = [], HOEHLE_U = [373, 300];
const uferplatz = (id, fisch, stufe, x, y, text) => { let best = null; for (let r = 0; r < 20 && !best; r++) for (let a = 0; a < 6.3; a += 0.05) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5;
    if (nass(jetzt(px, py)) || "F".includes(jetzt(px, py)) || koerper.some((q) => px > q[0] - 0.5 && px < q[2] + 0.5 && py > q[1] - 0.5 && py < q[3] + 0.5)) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (nass(jetzt(px + dx, py + dy)) && nass(jetzt(px + 2 * dx, py + 2 * dy))) { best = [px, py, dx, dy]; break; } if (best) break; }
  if (!best) throw new Error("kein Uferplatz für " + id); const [px, py, dx, dy] = best; lies(id, px, py, text, { fisch, stufe }); fische.push({ id, fisch, stufe, x: px + dx, y: py + dy, stehplatz: [px, py] }); };
const kraut = (id, art, x, y) => { for (let r = 2; r < 9; r++) for (let a = 0; a < 6.3; a += 0.5) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5;
    if (!".,vlLy".includes(jetzt(px, py)) || koerper.some((q) => px > q[0] - 1 && px < q[2] + 1 && py > q[1] - 1 && py < q[3] + 1)) continue; kraeuter.push({ id, art, x: px, y: py, region: regionVon(px, py) }); return; } };

/* ───── Dornhag: Hirtendorf hinter Dornenhecken, Herden, Bank ───── */
{ const W = PLAN.wasserloecher.reduce((b, p) => (Math.hypot(p[0] - DH[0], p[1] - DH[1]) < Math.hypot(b[0] - DH[0], b[1] - DH[1]) ? p : b)), [cx, cy] = [DH[0], DH[1] + 4];
  orte.dornhag = [cx, cy]; namen.push(["Dornhag", "Dorf", cx, cy]); eben.push([cx - 20, cy - 16, cx + 22, cy + 18]);
  for (let i = objekte.length - 1; i >= 0; i--) if (Math.abs(objekte[i].x - cx) < 34 && Math.abs(objekte[i].y - cy) < 30 && /^ok_/.test(objekte[i].id)) { const o = objekte.splice(i, 1)[0]; for (let j = koerper.length - 1; j >= 0; j--) if (koerper[j][4] === o.id) koerper.splice(j, 1); }
  male(cx - 18, cy - 14, cx + 18, cy + 16, (x, y) => (nass(jetzt(x, y)) ? null : Math.hypot((x - cx) / 18, (y - cy) / 15) < 1 ? (welle(x, y) > 1 ? "," : ".") : null));
  weg([[cx - 20, cy + 3], [cx + 22, cy + 3]], 2.2, "e"); weg([[cx, cy + 3], [cx, cy - 12]], 2, "e");
  const bank = baue("waldmark_bank_01", cx + 9, cy, { id: "dornhag_bank" }); lies("dornhag_bank_tuer", bank.x, bank.y + 0.6, "Die Bank von Dornhag. Die Hirten legen hier ihre Wollgelder ein.");
  banken.push({ id: "dornhag_bank", ort: "Dornhag", gebaeude: "dornhag_bank", schalter: [bank.x, bank.y + 1.4] }); npc.push({ id: "bankier_dornhag", rolle: "Bank", x: bank.x, y: bank.y + 1.4 });
  for (const [o, dx, dy] of [["ocker_lehmhaus_04", -10, 0], ["ocker_lehmhaus_01", -14, -8], ["ocker_lehmhaus_03", -4, -10], ["dorf_scheune_holz_01", 10, -10], ["weidenhain_bauernhaus_01", 16, 0], ["ocker_lehmhaus_02", -12, 12], ["ocker_lehmhaus_04", 8, 12], ["graufurt_steinhaus_02", 16, 12]]) try { baue(o, cx + dx, cy + dy, {}, 6); } catch { /* weniger Häuser */ }
  const kessel = baue("hand_kessel_01", cx - 3, cy + 7, { id: "dornhag_kessel", rand: 0 }, 4); stationen.push({ id: "kessel_dornhag", station: "kessel", x: kessel.x, y: kessel.y + 1.4 });
  const st = baue("dorf_marktstand_02", cx + 3, cy + 7, { id: "dornhag_stand", rand: 0 }, 4); laeden.push({ id: st.id, ort: "Dornhag", art: "Wolle, Milch, Käse", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
  /* Dornenhecke um den Ort (Lücken an den Wegen) und ein Pferch im Osten */
  for (let a = 0; a < 6.28; a += 0.13) { const x = cx + Math.cos(a) * 20, y = cy + 1 + Math.sin(a) * 17; if (Math.abs(y - cy - 3) < 3 || (Math.abs(x - cx) < 3 && y < cy)) continue; /* Dornenhecke von Figuren (#172): Stücke dürfen aneinanderstoßen; an Ost- und Westseite um 90° gedreht */
    const senk = Math.abs(Math.cos(a)) > 0.7, r = senk ? [x - 0.3, y - 1.5, x + 0.3, y + 1.5] : [x - 1.5, y - 0.3, x + 1.5, y + 0.3];
    let frei = true; for (let v = Math.floor(r[1]); v < Math.ceil(r[3]) && frei; v++) for (let u = Math.floor(r[0]); u < Math.ceil(r[2]); u++) if (!BODEN.has(jetzt(u + 0.5, v + 0.5))) { frei = false; break; }
    if (!frei || koerper.some((q) => !String(q[4]).startsWith("dornhag_dorn_") && r[0] - 1 < q[2] && q[0] < r[2] + 1 && r[1] - 1 < q[3] && q[1] < r[3] + 1)) continue;
    if ([...interaktionen.map((i) => [i.x, i.y]), ...npc.map((n) => [n.x, n.y])].some(([px, py]) => px > r[0] - 1.5 && px < r[2] + 1.5 && py > r[1] - 1.5 && py < r[3] + 1.5)) continue;
    ding("ocker_dornenhecke", x, y, { id: "dornhag_dorn_" + Math.round(a * 100), ...(senk ? { dreh: 90 } : {}) }); koerper.push([...r, "dornhag_dorn_" + Math.round(a * 100)]); }
  lies("dornhag", cx + 1.5, cy + 1.4, "Dornhag. Hinter den Dornenhecken sind die Herden sicher vor den Hyänen – meistens.");
  npc.push({ id: "hirtin_dornhag", rolle: "Hirtin", x: cx - 2, y: cy + 4.5 }, { id: "haendler_dornhag", rolle: "Händler (Laden)", x: st.x, y: st.y + 1.2 },
    ...[[28, -4], [31, 0], [27, 4], [33, 5], [30, -8]].map(([dx, dy], i) => ({ id: "dornhag_herde_" + (i + 1), rolle: (i % 2 ? "Ziege" : "Rind") + " (Stimmung)", x: cx + dx, y: cy + dy })));
  uferplatz("fischplatz_dornhag", "moorhecht", 20, W[0], W[1], "Im Wasserloch von Dornhag stehen Moorhechte – niemand weiß, wie sie hierher kamen."); kraut("dornhag_nebelkraut_1", "nebelkraut", W[0] + 6, W[1]); kraut("dornhag_eisenhut_1", "eisenhut", W[0] - 6, W[1] + 2); }

/* ───── Tafelrast: Rastort am Fuß des Roten Tisches, Steinbruch, Bankkiste, Höhle ───── */
{ const T = TAFEL["Roter Tisch"], [cx, cy] = TR; orte.tafelrast = TR; namen.push(["Tafelrast", "Dorf", cx, cy]); eben.push([cx - 16, cy - 12, cx + 14, cy + 14]);
  for (let i = objekte.length - 1; i >= 0; i--) if (Math.abs(objekte[i].x - cx) < 26 && Math.abs(objekte[i].y - cy) < 24 && /^ok_/.test(objekte[i].id)) { const o = objekte.splice(i, 1)[0]; for (let j = koerper.length - 1; j >= 0; j--) if (koerper[j][4] === o.id) koerper.splice(j, 1); }
  male(cx - 14, cy - 10, cx + 12, cy + 12, (x, y) => (nass(jetzt(x, y)) || jetzt(x, y) === "F" ? null : Math.hypot((x - cx) / 14, (y - cy) / 11) < 1 ? "." : null));
  weg([[cx - 14, cy], [T.aufgang[0], T.aufgang[1]]], 2, "e");
  for (const [o, dx, dy] of [["ocker_lehmhaus_02", -8, -6], ["ocker_lehmhaus_04", 4, -8], ["ocker_lehmhaus_03", -9, 8], ["ocker_lehmhaus_01", 7, 8], ["dorf_schuppen_holz_01", -2, 10]]) try { baue(o, cx + dx, cy + dy, {}, 6); } catch { /* weniger Häuser */ }
  const kiste = baue("steinhag_bankkiste", cx + 2, cy + 2, { id: "tafelrast_bankkiste", rand: 0 }, 5); lies("tafelrast_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste von Tafelrast, im Fels verankert. Was du einlegst, liegt auf deinem Konto.");
  banken.push({ id: "tafelrast_bankkiste", ort: "Tafelrast", kiste: [kiste.x, kiste.y + 1.4] });
  const sm = baue("dorf_schmiede_01", cx - 2, cy - 2, { id: "tafelrast_steinmetz" }, 6); stationen.push({ id: "esse_tafelrast", station: "esse", x: sm.x - 1.5, y: sm.y + 1.4 }, { id: "amboss_tafelrast", station: "amboss", x: sm.x + 1.5, y: sm.y + 1.4 });
  lies("tafelrast_steinmetz", sm.x, sm.y + 1.6, "Die Werkstatt der Steinbrecher von Tafelrast: Keile, Hämmer und eine Esse, die nie ausgeht.");
  const st = baue("k_stand_rot", cx - 6, cy + 3, { id: "tafelrast_stand", rand: 0 }, 4); laeden.push({ id: st.id, ort: "Tafelrast", art: "Werkzeug und Proviant", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
  for (const [x, y] of [[T.aufgang[0] + 2, T.aufgang[1] - 6], [T.aufgang[0] + 3, T.aufgang[1] + 6]]) try { baue("k_truemmer", x, y, { rand: 0 }, 3); } catch { }
  try { baue("hochland_lore", T.aufgang[0] - 2, T.aufgang[1] + 3, { id: "tafelrast_lore", rand: 0 }, 3); } catch { }
  lies("tafelrast", cx + 1.5, cy - 1, "Tafelrast. Wer zum Roten Tisch hinauf will, rastet hier – und wer vom Steinbruch kommt, trinkt hier seinen Staub weg.");
  npc.push({ id: "steinbrecherin_tafelrast", rolle: "Steinbrecherin", x: sm.x + 0.5, y: sm.y + 2.5 }, { id: "haendler_tafelrast", rolle: "Händler (Laden)", x: st.x, y: st.y + 1.2 });
  /* Höhle am Roten Tisch: Eingang an der Südflanke, Untergrund-Gebiet mit Ureisen (die einzigen der Ockerlande) */
  const [mx, my] = T.mitte; let ey = my + T.r[1] * 1.02, ex = mx - 8; while (jetzt(ex, ey) === "F" && ey < my + T.r[1] + 8) ey++;
  male(ex - 2.5, ey - 2, ex + 2.5, ey + 2, () => "g"); bau("hoehle_tuer_01", ex, ey - 0.4, { id: "ockerhoehle_eingang" });
  lies("ockerhoehle_eingang", ex, ey + 1.2, "Ein Spalt in der Flanke des Roten Tisches. Drinnen glänzt es schwarz – Ureisen, sagen die Steinbrecher, und etwas, das darüber wacht.", { tat: "ockerhoehle", knopf: "Hineingehen", ziel: [HOEHLE_U[0] * 32 + 16, HOEHLE_U[1] * 32 + 27] });
  weg([[ex, ey + 2], [cx + 4, cy + 10]], 1.6, "e");
  const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9), G = Array.from({ length: 32 }, (_, y) => Array.from({ length: 32 }, (_, x) => {
    const d = Math.hypot((x + 0.5 - 16) / 11, (y + 0.5 - 13) / 8) + 0.07 * zw(x, y); return d < 1 ? "h" : Math.abs(x + 0.5 - 16) < 1.8 && y > 18 && y < 31 ? "h" : "F"; }));
  const AD = [[7, 11], [10, 6], [16, 5], [22, 6], [25, 11]]; AD.forEach(([x, y], i) => { G[y][x] = "h"; adern.push({ id: "ockerhoehle_" + (i < 3 ? "ureisen" : "splittereisen") + "_" + (i + 1), art: i < 3 ? "ureisen" : "splittereisen", x: HOEHLE_U[0] * 32 + x + 0.5, y: HOEHLE_U[1] * 32 + y + 0.5, region: "ockerhoehle" }); });
  const dir = join(WELT, "regionen", "ockerhoehle"); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "ockerhoehle", name: "Die Höhle im Roten Tisch", untertitel: "Unter dem Tafelberg (Ureisen)", ursprung: HOEHLE_U, chunks: [1, 1], biom: "hoehle", stufe: 12, ebene: "untergrund" }, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), G.map((r) => r.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + [{ id: "ockerhoehle_leiter", objekt: "hoehle_leiter_01", x: 16, y: 29.4 }, { id: "ockerhoehle_feuerkorb_1", objekt: "moor_feuerkorb_01", x: 11, y: 18 }, { id: "ockerhoehle_feuerkorb_2", objekt: "moor_feuerkorb_01", x: 21, y: 18 }, { id: "ockerhoehle_saeule", objekt: "hoehle_steinsaeule_01", x: 16, y: 13 }].map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify({ start: [[16, 27]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [{ id: "ockerhoehle_hinaus", art: "eingang", x: 16, y: 30.2, radius: 2, abgleich: "keiner", daten: { text: "Hinaus ins Licht der Ockerlande.", tat: "ockerhoehle_hinaus", knopf: "Hinaus", ziel: [ex, ey + 2.2] } },
      { id: "ockerhoehle_halle", art: "lesen", x: 16, y: 16.6, radius: 1.6, abgleich: "keiner", daten: { text: "Eine Halle im Inneren des Tafelbergs. Die Wände glänzen schwarz und blau – Ureisen und Splittereisen." } }] }, null, 1) + "\n");
  kraut("tafelrast_eisenhut_1", "eisenhut", cx + 10, cy - 8); }

/* ───── Block I: Bau der Ockermutter unter der Ockerkanzel (Instanz) – Eingang an der Ostflanke (zu Dornhag hin), runde Kampfhöhle mit Platz für Sprung und Rudel,
   dazu die Spuren der gerissenen Herde von Dornhag bis zum Eingang ───── */
const OM_U = [374, 300], om = {};
{ const T = TAFEL["Ockerkanzel"], [mx, my] = T.mitte, [rx, ry] = T.r, dh = orte.dornhag, a = Math.atan2(dh[1] - my, dh[0] - mx);
  let s = 1.0, ex = 0, ey = 0; for (; s < 1.6; s += 0.02) { ex = Math.round((mx + Math.cos(a) * rx * s) * 2) / 2; ey = Math.round((my + Math.sin(a) * ry * s) * 2) / 2; if (jetzt(ex, ey) !== "F" && jetzt(ex, ey + 1) !== "F" && jetzt(ex, ey - 1.5) === "F" || s > 1.3) break; }
  male(ex - 3, ey - 1.5, ex + 3, ey + 3, (x, y) => (jetzt(x, y) === "F" && y < ey ? null : "g")); bau("hoehle_tuer_01", ex, ey - 0.4, { id: "ockermutter_eingang" });
  const ZIEL = [OM_U[0] * 32 + 16, OM_U[1] * 32 + 27];
  lies("ockermutter_eingang", ex, ey + 1.2, "Ein Schlund im Fuß der Ockerkanzel. Der Lehm davor ist zertrampelt, es riecht nach Aas. Von drinnen kommt ein Lachen, das kein Mensch lacht.", { tat: "ockermutter_hoehle", knopf: "Hineingehen", ziel: ZIEL });
  /* Spuren der gerissenen Herde: vom Westrand Dornhags bis vor den Eingang, leicht geschlängelt; drei Stellen mit Resten */
  const start = [dh[0] - 21, dh[1] + 2], ziel = [ex + 0.5, ey + 3.5], L = Math.hypot(ziel[0] - start[0], ziel[1] - start[1]), nx = -(ziel[1] - start[1]) / L, ny = (ziel[0] - start[0]) / L, spur = [];
  for (let t = 0, i = 0; t <= L; t += 8) { const q = 3.5 * Math.sin(t / 23) + 1.5 * Math.sin(t / 7.3); let x = start[0] + (ziel[0] - start[0]) * t / L + nx * q, y = start[1] + (ziel[1] - start[1]) * t / L + ny * q;
    if (nass(jetzt(x, y)) || jetzt(x, y) === "F" || koerper.some((r) => x > r[0] - 0.8 && x < r[2] + 0.8 && y > r[1] - 0.8 && y < r[3] + 0.8)) continue;
    spur.push([+x.toFixed(1), +y.toFixed(1)]); ding("welt_spuren_01", x, y, { id: "ockermutter_spur_" + ++i, s: 0.9 }); }
  const RESTE = [[0.12, "Die Dornenhecke ist hier niedergedrückt, Wolle hängt in den Dornen. Die Herde ist nicht hinausgelaufen – sie wurde hinausgetrieben."],
    [0.5, "Ein Rind, oder was davon übrig ist. Die Bisse sind groß wie ein Brotlaib, und um die Reste herum Spuren von einem Dutzend Hyänen."],
    [0.85, "Schleifspuren im Lehm, alle in eine Richtung: zum Fuß der Ockerkanzel. Was hier getötet wurde, wurde nicht hier gefressen."]];
  om.reste = RESTE.map(([f, text], i) => { const p = spur[Math.min(spur.length - 1, Math.round(f * (spur.length - 1)))]; lies("ockermutter_reste_" + (i + 1), p[0] + 0.8, p[1] + 0.6, text); return { id: "ockermutter_reste_" + (i + 1), x: +(p[0] + 0.8).toFixed(2), y: +(p[1] + 0.6).toFixed(2) }; });
  /* Kampfhöhle (Untergrund, 1 Chunk): runder Kessel Ø ~24 Felder aus Lehm, glatt (kein Hindernis – Platz für den Sprung), sechs Nischen am Rand, aus denen das Rudel kommt, Gang nach Süden */
  const zw = (x, y) => 0.6 * Math.sin(x / 2.1 + y / 2.9) + 0.4 * Math.sin(y / 1.6 - x / 2.7), M = [16, 14], R = 11.5;
  const NISCHEN = [180, -145, -35, 0, 35, 145].map((g, i) => { const w = g * Math.PI / 180; return [+(M[0] + Math.cos(w) * (R + 1.6)).toFixed(1), +(M[1] + Math.sin(w) * (R + 1.6)).toFixed(1)]; });
  const G = Array.from({ length: 32 }, (_, y) => Array.from({ length: 32 }, (_, x) => { const px = x + 0.5, py = y + 0.5, d = Math.hypot(px - M[0], py - M[1]) + 0.35 * zw(x, y);
    if (d < R) return zw(x * 0.7, y * 0.7) > 0.55 ? "L" : "l"; if (NISCHEN.some(([nx2, ny2]) => Math.hypot(px - nx2, py - ny2) < 2.4)) return "g"; if (Math.abs(px - 16) < 1.9 && y > 22 && y < 31) return "g"; return "F"; }));
  const dir = join(WELT, "regionen", "ockermutter_bau"); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "ockermutter_bau", name: "Der Bau der Ockermutter", untertitel: "Unter der Ockerkanzel (Instanz)", ursprung: OM_U, chunks: [1, 1], biom: "hoehle", stufe: 12, ebene: "untergrund" }, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), G.map((r) => r.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + [{ id: "ockermutter_leiter", objekt: "hoehle_leiter_01", x: 16, y: 29.4 }, { id: "ockermutter_feuerkorb_1", objekt: "moor_feuerkorb_01", x: 14.3, y: 25 }, { id: "ockermutter_feuerkorb_2", objekt: "moor_feuerkorb_01", x: 17.7, y: 25 },
    { id: "ockermutter_lager", objekt: "hoehle_lager_01", x: 16, y: 5.2 }, { id: "ockermutter_spuren_1", objekt: "welt_spuren_01", x: 12, y: 18 }, { id: "ockermutter_spuren_2", objekt: "welt_spuren_01", x: 20.5, y: 11 }].map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify({ start: [[16, 27]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [{ id: "ockermutter_hinaus", art: "eingang", x: 16, y: 30.2, radius: 2, abgleich: "keiner", daten: { text: "Hinaus in die Ockerlande.", tat: "ockermutter_hinaus", knopf: "Hinaus", ziel: [ex, ey + 2.2] } },
      { id: "ockermutter_kessel", art: "lesen", x: 16, y: 23.4, radius: 1.6, abgleich: "keiner", daten: { text: "Ein runder Kessel unter dem Tafelberg, der Boden festgetreten und glatt. In den Nischen ringsum glimmen Augen." } }] }, null, 1) + "\n");
  const W0 = [OM_U[0] * 32, OM_U[1] * 32];
  Object.assign(om, { region: "ockermutter_bau", ursprung: OM_U, feld: [W0[0], W0[1], W0[0] + 31, W0[1] + 31], eingang: "ockermutter_eingang", eingang_xy: [ex, ey], ziel: ZIEL, hinaus: "ockermutter_hinaus",
    boss: [W0[0] + 16, W0[1] + 9], mitte: [W0[0] + M[0], W0[1] + M[1]], radius: R, nischen: NISCHEN.map(([x, y]) => [W0[0] + x, W0[1] + y]), spur_von: start, spur_bis: ziel, spuren: spur.length }); }

/* ───── Fische und Kräuter an den übrigen Wasserlöchern ───── */
for (const [i, [x, y]] of PLAN.wasserloecher.entries()) { if (Math.hypot(x - DH[0], y - DH[1]) < 30) continue;
  uferplatz("fischplatz_wasserloch_" + (i + 1), i % 2 ? "wels" : "moorhecht", i % 2 ? 45 : 20, x, y, "Ein Wasserloch in der Lehmsteppe. Erstaunlich, was hier im trüben Wasser schwimmt.");
  kraut(`ockerlande_nebelkraut_${i + 1}`, "nebelkraut", x + 7, y - 2); }
uferplatz("fischplatz_ockerstrom_muendung", "glutwels", 65, STROM.at(-1)[0] + 2, STROM.at(-1)[1] - 6, "Nahe der Mündung des Ockerstroms: In der warmen Strömung jagen Glutwelse.");

/* ───── schreiben ───── */
let X0 = Infinity, Y0 = Infinity, X1 = -Infinity, Y1 = -Infinity; for (const k of feld.keys()) { const [x, y] = k.split(",").map(Number); if (x < X0) X0 = x; if (y < Y0) Y0 = y; if (x > X1) X1 = x; if (y > Y1) Y1 = y; }
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let s = ""; for (let x = X0; x <= X1; x++) s += feld.get(x + "," + y) || " "; zeilen.push(s.replace(/ +$/, "")); } if (zeilen.some((s) => s.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
const hoehenListe = [...hoehen].filter(([, h]) => Math.abs(h) > 0.02).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_ockerlande.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/ockerlande.mjs (#172): Ockerlande – Lehmsteppe, Ockerstrom, Tafelberge, Trockenflüsse, Wasserlöcher, Akazien. Weltfelder.", gelaende: patches, hoehen: hoehenListe, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "ockerlande.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
writeFileSync(join(WELT, "ockerlande_orte.json"), JSON.stringify({ hinweis: "Phase 12 Ockerlande (Welt #172): Gelände (Strom, Tafelberge, Trockenflüsse, Wasserlöcher, Haine), Rotlehm, Brunnenkreis, Wege, Rastplätze; Dornhag und Tafelrast folgen. Weltfelder.", land: LAND, strom: STROM, furt: [STROM[3][0], FURT_Y], tafelberge: TAFEL, trockenfluesse: PLAN.trockenfluesse, wasserloecher: PLAN.wasserloecher, akazienhaine: PLAN.akazienhaine, orte, namen, npc, banken, laeden, stationen, fischplaetze: fische, kraeuter, adern, hoehle: { region: "ockerhoehle", ursprung: HOEHLE_U, eingang: "ockerhoehle_eingang" }, ockermutter: om, rastplaetze: rast, wege: [...wege, { punkte: PLAN.karawanenstrasse, breite: 2.6 }] }, null, 1) + "\n");
const zaehl = {}; for (const c of feld.values()) zaehl[c] = (zaehl[c] || 0) + 1;
console.log(`Ockerlande: ${feld.size} Geländefelder ${JSON.stringify(zaehl)}, ${hoehenListe.length} Höhen, ${objekte.length} Objekte`);
