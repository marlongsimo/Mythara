/*
 * World Pipeline – Phase 12 Ockerlande (#172, 27.11.2026; Plan welt/plaene/ockerlande_plan.png, Konzept doku/konzepte/phase-12.md). Schritt 1: Gelände.
 *   Lehmsteppe (neuer Boden Lehm „l“ und Lehm, rissig „L“, boden_lehm.py) statt der Dünen im Kernland, am Rand zu den Glutsanden und an den Küsten bleibt Sand;
 *   Ockerstrom im Westen (Nord → Süd ins Südmeer, Furt bei Rotlehm), drei Tafelberge (Felsrand, flache Kuppe), zwei Trockenflüsse, Wasserlöcher, Akazienhaine.
 * Nur vorhandene Objekte. Schreibt welt/festland/plan_ockerlande.json (festland.py) und welt/ockerlande_orte.json. Wiederholbar (Grund in welt/festland/ockerlande_grund.json).
 * Aufruf (im Ordner realtime): node werkzeug/welt/ockerlande.mjs, danach die ganze Kette.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
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
  for (const r of koerperVon(o)) { const hit = koerper.find((q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3]); if (hit && b.kategorie === "gebaeude") throw new Error(`${o.id} überdeckt ${hit[4]}`); koerper.push(r); } return o; };
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
const AKAZIE = ["stil_laub_oliv", "stil_laub_gold", "stil_laub_oliv"];
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
  bau("dorf_brunnen_01", cx, cy - 0.5, { id: "rotlehm_brunnen" }); bau("moor_menhir_02", cx - 6, cy + 3, { id: "rotlehm_wegstein" }); bau("wz_bindestein", cx + 6, cy + 3, { id: "rotlehm_bindestein" });
  lies("rotlehm", cx + 2.5, cy + 1.6, "Rotlehm. Eine Stadt aus Lehm und Staub am Ockerstrom – hier enden die Karawanen aus den Glutsanden.");
  lies("rotlehm_wegstein", cx - 6, cy + 4.6, "Der Wegstein von Rotlehm."); lies("rotlehm_bindestein", cx + 6, cy + 4.6, "Ein Bindestein am Markt von Rotlehm.");
  for (const [i, [o, dx, dy]] of [["dorf_marktstand_01", -6, -5], ["dorf_marktstand_02", 6, -5], ["dorf_marktstand_03", -6, 6.5], ["k_stand_rot", 6, 6.5]].entries()) { const st = baue(o, cx + dx, cy + dy, { id: "rotlehm_stand_" + (i + 1), rand: 0 }, 3);
    laeden.push({ id: st.id, ort: "Rotlehm", art: "Marktstand", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] }); }
  /* Lehmfeste im Nordosten: Mauergeviert mit Torhaus, Bergfried, Türmen */
  { const F0 = [cx + 44, cy - 46, cx + 70, cy - 28], GX = (F0[0] + F0[2]) / 2; male(F0[0] + 1, F0[1] + 1, F0[2] - 1, F0[3] - 1, () => "g");
    for (let x = F0[0]; x < F0[2]; x += 2) { bau("burg_mauer_quer", x + 1, F0[1] + 1, { id: "rotlehm_feste_mauer_n" + x }); if (Math.abs(x + 1 - GX) > 2.6) bau("burg_mauer_quer", x + 1, F0[3] + 1, { id: "rotlehm_feste_mauer_s" + x }); }
    for (let y = F0[1]; y < F0[3] - 1; y += 2) { bau("burg_mauer_laengs", F0[0], y + 2, { id: "rotlehm_feste_mauer_w" + y }); bau("burg_mauer_laengs", F0[2], y + 2, { id: "rotlehm_feste_mauer_o" + y }); }
    for (const [x, y] of [[F0[0], F0[1]], [F0[2], F0[1]], [F0[0], F0[3]], [F0[2], F0[3]]]) bau("burg_eckturm", x, y + 1.3, { id: `rotlehm_feste_turm_${x}_${y}` });
    bau("burg_torhaus", GX, F0[3] + 1, { id: "rotlehm_feste_tor" }); bau("graufurt_bergfried_01", GX, F0[1] + 10, { id: "rotlehm_feste_bergfried", s: 1.4 });
    lies("rotlehm_feste", GX + 2.5, F0[3] + 3, "Die Lehmfeste von Rotlehm. Die Mauern sind dick wie ein Mann lang ist – gegen Hitze, Hyänen und Räuber.");
    npc.push({ id: "festenhauptfrau_rotlehm", rolle: "Hauptfrau der Lehmfeste", x: GX + 1.5, y: F0[1] + 12.5 }, { id: "festenwache_rotlehm", rolle: "Wache am Festentor", x: GX - 3, y: F0[3] + 3 }); }
  /* Karawanenhof im Nordwesten: ummauerter Hof mit Zelten, Ständen, Herd und Kessel */
  { const K0 = [cx - 52, cy - 46, cx - 16, cy - 28], GX = (K0[0] + K0[2]) / 2; male(K0[0] + 1, K0[1] + 1, K0[2] - 1, K0[3] - 1, () => "s");
    for (let x = K0[0]; x < K0[2]; x += 2) { bau("burg_mauer_quer", x + 1, K0[1] + 1, { id: "rotlehm_karawanenhof_mauer_n" + x }); if (Math.abs(x + 1 - GX) > 3) bau("burg_mauer_quer", x + 1, K0[3] + 1, { id: "rotlehm_karawanenhof_mauer_s" + x }); }
    for (let y = K0[1]; y < K0[3] - 1; y += 2) { bau("burg_mauer_laengs", K0[0], y + 2, { id: "rotlehm_karawanenhof_mauer_w" + y }); bau("burg_mauer_laengs", K0[2], y + 2, { id: "rotlehm_karawanenhof_mauer_o" + y }); }
    bau("burg_torhaus", GX, K0[3] + 1, { id: "rotlehm_karawanenhof_tor" });
    for (const [i, x] of [K0[0] + 5, K0[0] + 12, K0[2] - 12, K0[2] - 5].entries()) bau("welt_zelt_01", x, K0[1] + 7, { id: "rotlehm_karawanenhof_zelt_" + (i + 1) });
    const s1 = baue("dorf_marktstand_02", K0[0] + 8, K0[3] - 4, { id: "rotlehm_karawanenhof_stand_1", rand: 0 }, 3), s2 = baue("k_stand_rot", K0[2] - 8, K0[3] - 4, { id: "rotlehm_karawanenhof_stand_2", rand: 0 }, 3);
    for (const st of [s1, s2]) laeden.push({ id: st.id, ort: "Rotlehm", art: "Stand im Karawanenhof", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
    const h = baue("hand_herd_01", GX - 2, K0[1] + 12, { id: "rotlehm_karawanenhof_herd", rand: 0 }, 3), k = baue("hand_kessel_01", GX + 3, K0[1] + 12, { id: "rotlehm_karawanenhof_kessel", rand: 0 }, 3);
    stationen.push({ id: "herd_rotlehm", station: "herd", x: h.x, y: h.y + 1.4 }, { id: "kessel_rotlehm", station: "kessel", x: k.x, y: k.y + 1.4 });
    lies("rotlehm_karawanenhof", GX + 3.5, K0[3] + 3, "Der Karawanenhof. Kamelglocken, Gewürzsäcke, und im Schatten der Mauer schläft ein Treiber auf seinen Ballen.");
    npc.push({ id: "karawanenmeisterin_rotlehm", rolle: "Karawanenmeisterin (Karawanenhof)", x: GX, y: K0[1] + 15 }, { id: "treiber_rotlehm", rolle: "Treiber", x: K0[0] + 6, y: K0[1] + 10 }); }
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
  const FREI = [[cx - 10, cy - 8, cx + 10, cy + 8]]; const HAUS = ["graufurt_steinhaus_01", "graufurt_steinhaus_02", "moor_kate_01", "moor_kate_02", "weidenhain_kate_01", "graufurt_steinhaus_01"];
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
  for (let a = 0.3; a < 6.28; a += 1.05) { try { baue("welt_zelt_01", cx + Math.cos(a) * 13, cy + Math.sin(a) * 10.5, { rand: 0 }, 4); } catch { /* kein Platz: Zelt fällt weg */ } }
  baue("moor_kate_01", cx - 16, cy - 2, { id: "brunnenkreis_kate" }, 6); baue("weidenhain_kate_01", cx + 16, cy + 2, { id: "brunnenkreis_haus" }, 6);
  const f = baue("dorf_festfeuer_01", cx + 7, cy + 7, { id: "brunnenkreis_feuer", rand: 0 }, 4); stationen.push({ id: "feuer_brunnenkreis", station: "feuer", x: f.x, y: f.y + 1.6 });
  const st = baue("dorf_marktstand_02", cx - 7, cy + 8, { id: "brunnenkreis_stand", rand: 0 }, 4); laeden.push({ id: st.id, ort: "Brunnenkreis", art: "Wasser und Proviant", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
  lies("brunnenkreis", cx, cy + 6, "Brunnenkreis. Ein Wasserloch, ein Kreis aus Zelten – und jede Karawane hält hier, ob sie will oder nicht.");
  npc.push({ id: "brunnenwaechter", rolle: "Brunnenwächter", x: cx + 2, y: cy + 5.5 }, { id: "haendlerin_brunnenkreis", rolle: "Händlerin (Wasser, Proviant)", x: st.x, y: st.y + 1.2 });
  fische.push(...[]); }

/* ───── Rastplätze ───── */
for (const [i, [x, y]] of PLAN.rastplaetze.entries()) { const id = "rast_ockerlande_" + (i + 1), f = baue("dorf_festfeuer_01", x + 3, y + 3, { id: id + "_feuer", rand: 1 }, 8); try { baue("wald_baumstamm_01", f.x - 2.5, f.y + 1.5, { id: id + "_stamm", s: 0.8, rand: 0 }, 4); } catch { /* ohne Stamm */ }
  lies(id, f.x + 0.5, f.y + 2.4, "Ein Rastplatz an der Karawanenstraße. Asche, Dattelkerne, ein umgestürzter Krug."); rast.push(id); }

/* ───── schreiben ───── */
let X0 = Infinity, Y0 = Infinity, X1 = -Infinity, Y1 = -Infinity; for (const k of feld.keys()) { const [x, y] = k.split(",").map(Number); if (x < X0) X0 = x; if (y < Y0) Y0 = y; if (x > X1) X1 = x; if (y > Y1) Y1 = y; }
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let s = ""; for (let x = X0; x <= X1; x++) s += feld.get(x + "," + y) || " "; zeilen.push(s.replace(/ +$/, "")); } if (zeilen.some((s) => s.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
const hoehenListe = [...hoehen].filter(([, h]) => Math.abs(h) > 0.02).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_ockerlande.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/ockerlande.mjs (#172): Ockerlande – Lehmsteppe, Ockerstrom, Tafelberge, Trockenflüsse, Wasserlöcher, Akazien. Weltfelder.", gelaende: patches, hoehen: hoehenListe, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "ockerlande.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
writeFileSync(join(WELT, "ockerlande_orte.json"), JSON.stringify({ hinweis: "Phase 12 Ockerlande (Welt #172): Gelände (Strom, Tafelberge, Trockenflüsse, Wasserlöcher, Haine), Rotlehm, Brunnenkreis, Wege, Rastplätze; Dornhag und Tafelrast folgen. Weltfelder.", land: LAND, strom: STROM, furt: [STROM[3][0], FURT_Y], tafelberge: TAFEL, trockenfluesse: PLAN.trockenfluesse, wasserloecher: PLAN.wasserloecher, akazienhaine: PLAN.akazienhaine, orte, namen, npc, banken, laeden, stationen, fischplaetze: fische, rastplaetze: rast, wege: [...wege, { punkte: PLAN.karawanenstrasse, breite: 2.6 }] }, null, 1) + "\n");
const zaehl = {}; for (const c of feld.values()) zaehl[c] = (zaehl[c] || 0) + 1;
console.log(`Ockerlande: ${feld.size} Geländefelder ${JSON.stringify(zaehl)}, ${hoehenListe.length} Höhen, ${objekte.length} Objekte`);
