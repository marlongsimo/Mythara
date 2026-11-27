/*
 * World Pipeline – Phase 11 Vorarbeit (#147, 27.11.2026): die Hochlande (W5) jenseits des Grauen Sunds, Gefahr 45–60. Konzept doku/konzepte/phase-11.md.
 *   Zugang: die Brücke zur Furt bei Grauwacht wird zu Ende gebaut (sechs Bögen), dahinter eine Furt über eine Sandbank; Wache und Schild, keine Sperre.
 *   Steinhag: Bergstadt am Steinhagsee mit Hof der Bergvögte, Bank, Markt, Taverne, Schmiede mit Werkbank, Wegstein, Bindestein, Kapelle, Steg.
 *   Grauhorn mit Hochpass und Passwacht (Schneereste), Erzberg mit dem Bergwerk (Untergrund hochlande_bergwerk, Chunks 362–364|300),
 *   Almhütte mit Käserei auf der Hohen Alm, Einsiedelei am Spiegelsee, Klippen zur Nordküste, Nadelwald in den Tälern, Geröllhänge, Bergwiesen.
 * Nur vorhandene Objekte. Schreibt welt/festland/plan_hochlande.json (festland.py) und welt/hochlande_orte.json (Orte, Ortsnamen, NPC-Plätze, Fischplätze,
 * Kräuter, Erzadern im Bergwerk – für sammelstellen.mjs, kraeuter, grenzland.mjs, gegnerplaetze.py). Wiederholbar wie beleben.mjs (Grund in hochlande_grund.json).
 * Aufruf (im Ordner realtime): node werkzeug/welt/hochlande.mjs, danach die ganze Kette.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const breit = (x, y) => Math.sin(x / 17 + y / 23 + 0.7) + 0.7 * Math.sin(y / 13 - x / 19);
let saat = 11011; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wahl = (l) => l[Math.floor(wurf() * l.length)];

/* ───── Grund lesen (eigene Flächen früherer Läufe aus hochlande_grund.json) ───── */
const GRUNDDATEI = join(WELT, "festland", "hochlande_grund.json");
const alt = existsSync(GRUNDDATEI) ? new Map(Object.entries(JSON.parse(readFileSync(GRUNDDATEI, "utf8")).felder)) : new Map();
const GR = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  GR.push({ n, x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const regionVon = (x, y) => GR.find((g) => { const z = g.z[Math.floor(y) - g.y0]; return z && x >= g.x0 && x < g.x0 + z.length; })?.n;
const roh = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const grund = (x, y) => alt.get(Math.floor(x) + "," + Math.floor(y)) ?? roh(x, y);

const feld = new Map(), urs = new Map(), hoehen = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [], fische = [], kraeuter = [], wege = [];
const nass = (c) => "~wMo".includes(c);
const setze = (x, y, c, ueberWasser = false) => { const k = Math.floor(x) + "," + Math.floor(y), g = grund(x, y); if (g === "?" || (nass(g) && c !== "w" && !ueberWasser)) return; if (!urs.has(k)) urs.set(k, g); feld.set(k, c); };
const jetzt = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehen.set(k, (hoehen.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
const koerper = []; let nr = 0;
const ding = (objekt, x, y, mehr = {}) => { const b = BIB.get(objekt); if (!b) throw new Error("unbekanntes Objekt " + objekt); const s = mehr.s ?? 1;
  const kk = b.kollision?.koerper || (b.kollision?.art === "rechteck" ? [{ x0: b.kollision.x, x1: b.kollision.x + b.kollision.b, y0: b.kollision.y, y1: b.kollision.y + b.kollision.h }] : []);
  for (const k of kk) { const r = [x + k.x0 * s, y + k.y0 * s, x + k.x1 * s, y + k.y1 * s]; const hit = koerper.find((q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3]); if (hit && b.kategorie === "gebaeude") throw new Error(`${mehr.id || objekt} überdeckt ${hit[4]}`); koerper.push([...r, mehr.id || objekt]); }
  const o = { id: mehr.id || `hl_${objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|welt|weidenhain|wald|burg|hoehle|wz|holz)_/, "").replace(/_\d+$/, "")}_${++nr}`, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: mehr.tat ? "eingang" : "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: mehr.tat ? 2.0 : 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const weg = (punkte, breite = 1.8, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]); wege.push({ punkte, breite, zeichen });
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => (strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) && !"F".includes(jetzt(x, y)) ? zeichen : null)); };
const huegel = (cx, cy, rx, ry, h, form = 2) => male(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => { const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.06 * breit(x * 2, y * 2); if (d < 1) hebe(x, y, h * (1 - d ** form)); return null; });
/* Fischplatz am Ufer: das begehbare Feld am nächsten zu (x, y), dessen Nachbar Wasser ist (der Fanggrund) */
const uferplatz = (id, fisch, stufe, x, y, text) => { let best = null; for (let r = 0; r < 30 && !best; r++) for (let a = 0; a < 6.3; a += 0.05) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5;
    if (nass(jetzt(px, py)) || "F".includes(jetzt(px, py))) continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (nass(jetzt(px + dx, py + dy)) && nass(jetzt(px + 2 * dx, py + 2 * dy))) { best = [px, py, dx, dy]; break; } if (best) break; }
  if (!best) { console.log("  kein Uferplatz für " + id); return; } const [px, py, dx, dy] = best; lies(id, px, py, text, { fisch, stufe }); fische.push({ id, fisch, stufe, x: px + dx, y: py + dy, stehplatz: [px, py] }); };
const fischplatz = (id, fisch, stufe, x, y, dx, dy, text) => { let px = x, py = y; for (let i = 0; i < 40 && !nass(jetzt(px + dx, py + dy)); i++) { px += dx; py += dy; }
  lies(id, px, py, text, { fisch, stufe }); fische.push({ id, fisch, stufe, x: +(px + dx).toFixed(1), y: +(py + dy).toFixed(1), stehplatz: [+px.toFixed(1), +py.toFixed(1)] }); };

export const ORTE = { furt: [6800, 5761], steinhag: [6990, 5892], steinhagsee: [6990, 5850], hochpass: [6962, 5608], erzberg: [7146, 5800], bergwerk: [7128, 5808],
  alm: [7190, 6000], einsiedelei: [7340, 5664], spiegelsee: [7322, 5650], nordklippen: [7290, 5300] };

/* ═══════ 1. Brücke zur Furt und die Furt über die Sandbank ═══════ */
{ for (let i = 0; i < 8; i++) ding("hochland_steinbruecke_ow", 6746.2 + i * 6.6, 5761.5, { id: "furtbruecke_" + (i + 3) });   /* zehn Bögen über den Grauen Sund (festland.py überschreibt kein Meer) */
  freigeben.push({ art: "rechteck", x0: 6741, y0: 5758.9, x1: 6794, y1: 5761.5 });
  /* die Furt: eine flache Sandbank am Ostufer, wo die Brücke aufsetzt */
  male(6788, 5750, 6812, 5772, (x, y) => { const d = Math.hypot((x - 6798) / 11, (y - 5761) / 9) + 0.12 * welle(x, y); return d < 0.7 ? "s" : d < 1 ? (welle(x, y) > 0 ? "s" : "g") : null; });
  ding("moor_menhir_01", 6795, 5756.5, { id: "furt_stein_1", s: 0.6 }); ding("moor_menhir_01", 6803, 5765.5, { id: "furt_stein_2", s: 0.6 });
  lies("furt", 6799, 5761.6, "Die Furt. Hier setzt die Brücke auf eine Sandbank – früher ging man bei Ebbe zu Fuß hinüber. Vor dir steigen die Hochlande an.");
  ding("welt_wegweiser_01", 6725, 5758, { id: "furtbruecke_schild" });
  lies("furtbruecke_wache", 6724.5, 5763.4, "Ein Wachposten der Burg. „Über die Brücke und die Furt geht es in die Hochlande. Dort drüben ist es rau – Bären, Trolle, und die Widder sind nicht zahm.“");
  npc.push({ id: "wache_furtbruecke", rolle: "Wache an der Brücke zur Furt (keine Sperre)", x: 6725, y: 5763 }); }

/* ═══════ 2. Gelände: Grauhorn mit Hochpass, Erzberg, Hohe Alm, Nordklippen, Seen ═══════ */
const GRAT = [[6862, 5716], [6900, 5668], [6930, 5636], [6962, 5608], [6992, 5578], [7030, 5540], [7066, 5500], [7096, 5462]];   /* Grauhorn, vom Sund bis zu den Nordfelsen */
const PASS = ORTE.hochpass;
/* Lage auf dem Grat (0 … 1) für wechselnde Höhe und Breite – damit kein gleichförmiger Wall entsteht */
const gratT = (x, y) => { let best = 0, bd = Infinity, acc = 0, ges = 0; for (let i = 1; i < GRAT.length; i++) ges += Math.hypot(GRAT[i][0] - GRAT[i - 1][0], GRAT[i][1] - GRAT[i - 1][1]);
  for (let i = 1; i < GRAT.length; i++) { const [x0, y0] = GRAT[i - 1], [x1, y1] = GRAT[i], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (L * L))), d = Math.hypot(x - x0 - t * dx, y - y0 - t * dy); if (d < bd) { bd = d; best = (acc + t * L) / ges; } acc += L; } return best; };
const fels = (x, y, h, hoch) => { const b = breit(x * 0.8, y * 0.8), w = welle(x * 0.35, y * 0.35);   /* breite Flecken statt Punkte */
  return h > hoch + 1.5 && b > 0.2 ? "S" : h > hoch && b > -0.4 ? "F" : h > hoch - 2.5 ? (w > 0.6 ? "S" : "g") : h > hoch - 6 ? (b > -0.2 ? "g" : w > 0.3 ? "," : null) : null; };
male(6820, 5420, 7140, 5760, (x, y) => { const t = gratT(x, y), breite = 24 + 9 * Math.sin(t * 9.4 + 1) + 6 * breit(x * 0.5, y * 0.5), d = strecke(x, y, GRAT), p = Math.hypot(x - PASS[0], y - PASS[1]); if (d > breite) return null;
  const sattel = Math.min(1, p / 34), top = 10 + 5 * Math.sin(t * 7.3) + 3 * breit(x * 0.3, y * 0.3), h = top * (1 - (d / breite) ** 2) * (0.3 + 0.7 * sattel); hebe(x, y, h);
  if (nass(grund(x, y))) return null; if (p < 12) return welle(x * 0.4, y * 0.4) > 0.3 ? "S" : "g"; return fels(x, y, h, 9); });
huegel(...ORTE.erzberg, 46, 34, 12); male(7100, 5766, 7192, 5834, (x, y) => { const d = Math.hypot((x - ORTE.erzberg[0]) / 46, (y - ORTE.erzberg[1]) / 34) + 0.12 * breit(x * 0.7, y * 0.7); return d < 1 ? fels(x, y, 12 * (1 - d * d), 9) : null; });
huegel(...ORTE.alm, 60, 40, 6, 1.6); male(7130, 5960, 7250, 6040, (x, y) => (Math.hypot((x - ORTE.alm[0]) / 60, (y - ORTE.alm[1]) / 40) < 1 && ".T".includes(grund(x, y)) ? (welle(x, y) > 0.9 ? "," : ".") : null));
/* Klippen zur Nordküste: Felsband am Meer, Geröll dahinter */
male(7140, 5200, 7420, 5340, (x, y) => { if (nass(grund(x, y))) return null; let m = 99; for (let r = 1; r < 8 && m === 99; r++) for (const [dx, dy] of [[0, -r], [r, -r], [-r, -r]]) if (nass(grund(x + dx, y + dy))) m = r; if (m < 3) { hebe(x, y, 5); return "F"; } if (m < 7) { hebe(x, y, 3); return welle(x, y) > -0.3 ? "g" : null; } return null; });
/* Seen: Steinhagsee und Spiegelsee (Wasser mit Ufer), leicht eingesenkt */
const see = (cx, cy, rx, ry) => { male(cx - rx - 4, cy - ry - 4, cx + rx + 4, cy + ry + 4, (x, y) => { const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.06 * welle(x, y); if (d < 1.3) hebe(x, y, -0.6 * Math.max(0, 1.3 - d)); return d < 1 ? "w" : d < 1.18 ? (welle(x, y) > 0 ? "s" : "g") : null; }); };
see(...ORTE.steinhagsee, 32, 13); see(...ORTE.spiegelsee, 16, 10);
/* Bergwiesen (Blumen) und Geröllflecken über die Almen verteilt */
for (let i = 0; i < 70; i++) { const x = 6860 + wurf() * 760, y = 5480 + wurf() * 700, rx = 6 + wurf() * 14, ry = 4 + wurf() * 9, c = wurf() < 0.65 ? "," : "g";
  male(x - rx, y - ry, x + rx, y + ry, (a, b) => (Math.hypot((a - x) / rx, (b - y) / ry) + 0.15 * welle(a, b) < 1 && jetzt(a, b) === "." ? c : null)); }
/* Nadelwald in den Tälern: Waldboden */
const WAELDER = [[7085, 6010, 40, 28], [6900, 5960, 30, 22], [7270, 5900, 36, 26], [7420, 5760, 34, 30], [6930, 6080, 34, 20]];
for (const [cx, cy, rx, ry] of WAELDER) male(cx - rx, cy - ry, cx + rx, cy + ry, (x, y) => (Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.18 * breit(x * 2, y * 2) < 1 && ".,".includes(jetzt(x, y)) ? "f" : null));

/* Bergbäche (Füllen, #147): vom Grauhorn in den Steinhagsee, vom Erzberg an der Alm vorbei zur Südküste – Wege queren sie als Furt */
const BAECHE = { grauhornbach: [[7016, 5694], [7008, 5730], [7012, 5770], [7000, 5806], [6998, 5838]], almbach: [[7162, 5846], [7150, 5900], [7158, 5950], [7150, 6040], [7166, 6110], [7160, 6190], [7166, 6250]] };
for (const b of Object.values(BAECHE)) { const xs = b.map((p) => p[0]), ys = b.map((p) => p[1]);
  male(Math.min(...xs) - 5, Math.min(...ys) - 5, Math.max(...xs) + 5, Math.max(...ys) + 5, (x, y) => { const d = strecke(x, y, b) + 0.25 * welle(x, y); if (d < 3) hebe(x, y, -0.5 * (1 - d / 3));
    return nass(grund(x, y)) ? null : d < 1.1 ? "~" : d < 2.2 ? (welle(x, y) > 0.2 ? "s" : "g") : null; }); }
/* ═══════ 3. Steinhag ═══════ */
const [SX, SY] = ORTE.steinhag;
{ eben.push([SX - 46, SY - 22, SX + 46, SY + 40]);
  male(SX - 50, SY - 24, SX + 50, SY + 42, (x, y) => (jetzt(x, y) === "w" ? null : (Math.abs(x - SX) < 48 && y > SY - 24 && y < SY + 40) ? (welle(x, y) > 1.2 ? "," : ".") : null));
  male(SX - 13, SY - 13, SX + 13, SY + 5, () => "p");                                         /* Markt vor dem Hof */
  weg([[SX - 50, SY + 9], [SX + 50, SY + 9]], 3, "k");                                        /* Hauptgasse */
  weg([[SX - 40, SY + 26], [SX + 42, SY + 26]], 2.4, "k");                                    /* Untere Gasse */
  weg([[SX, SY + 5], [SX, SY + 44]], 2.6, "k");                                               /* Steig vom Markt nach Süden */
  weg([[SX - 30, SY - 25], [SX + 30, SY - 25]], 2, "k");                                      /* Uferweg */
  weg([[SX - 16, SY - 13], [SX - 16, SY - 25]], 1.8, "k"); weg([[SX + 16, SY - 13], [SX + 16, SY - 25]], 1.8, "k");
  /* Hof der Bergvögte, Bank, Taverne am Markt (Tür zum Markt) */
  ding("graufurt_bergfried_01", SX, SY - 14, { id: "steinhag_vogthof", s: 1.6 }); ding("burg_mauer_quer", SX - 7, SY - 15.5, { id: "steinhag_hofmauer_1" }); ding("burg_mauer_quer", SX + 7, SY - 15.5, { id: "steinhag_hofmauer_2" });
  ding("waldmark_bank_01", SX - 21, SY - 13.6, { id: "steinhag_bank" }); ding("dorf_taverne_01", SX + 20, SY - 13.6, { id: "steinhag_taverne" });
  ding("dorf_brunnen_01", SX, SY - 4, { id: "steinhag_brunnen" }); ding("moor_menhir_02", SX - 6, SY - 3, { id: "steinhag_wegstein" }); ding("wz_bindestein", SX + 6, SY - 3, { id: "steinhag_bindestein" });
  for (const [i, dx] of [-8, 0, 8].entries()) ding(["dorf_marktstand_01", "dorf_marktstand_02", "dorf_marktstand_03"][i], SX + dx, SY + 4, { id: "steinhag_stand_" + (i + 1) });
  for (const [dx, dy] of [[-12, -12], [12, -12], [-12, 4], [12, 4]]) ding("dorf_laterne_01", SX + dx, SY + dy);
  lies("steinhag", SX + 2.5, SY - 1.5, "Steinhag. Die Bergstadt am See – Stein auf Stein, Dächer mit Schiefer beschwert. Wer in die Hochlande will, kommt hier vorbei.");
  lies("steinhag_vogthof", SX + 1, SY - 12.6, "Der Hof der Bergvögte. Über dem Tor das Zeichen der Hochlande: zwei gekreuzte Hämmer unter einem Berg.");
  lies("steinhag_bank_tuer", SX - 21, SY - 13, "Die Bank von Steinhag. Dasselbe Konto wie im Tal – nur das Gold riecht nach Stollen.");
  lies("steinhag_wegstein", SX - 6, SY - 1.4, "Der Wegstein von Steinhag."); lies("steinhag_bindestein", SX + 6, SY - 1.4, "Ein Bindestein am Brunnen von Steinhag.");
  /* Häuser an der Hauptgasse (Tür zur Gasse) */
  for (const [dx, o] of [[-45, "graufurt_steinhaus_01"], [-37, "graufurt_steinhaus_02"], [-28, "dorf_haus_holz_03"], [27, "graufurt_steinhaus_01"], [36, "graufurt_steinhaus_02"], [45, "graufurt_steinhaus_01"]]) ding(o, SX + dx, SY + 7);
  /* zwischen den Gassen: Schmiede mit Werkbank, Häuser (Tür zur Unteren Gasse) */
  ding("dorf_schmiede_01", SX + 14, SY + 24, { id: "steinhag_schmiede" }); ding("hand_werkbank_01", SX + 21, SY + 23.4, { id: "steinhag_werkbank" });
  lies("steinhag_werkstatt", SX + 17, SY + 28, "Die Werkstatt von Steinhag: Esse, Amboss und eine Werkbank, an der Grubenholz zugeschnitten wird.");
  for (const [dx, o] of [[-34, "graufurt_steinhaus_02"], [-25, "graufurt_steinhaus_01"], [-14, "dorf_haus_holz_03"], [30, "graufurt_steinhaus_01"], [38, "dorf_haus_holz_03"]]) ding(o, SX + dx, SY + 24);
  /* am Uferweg neben Bank und Taverne, und am Südrand */
  for (const [dx, o] of [[-33, "graufurt_steinhaus_02"], [-42, "graufurt_steinhaus_01"], [33, "graufurt_steinhaus_01"], [42, "dorf_haus_holz_03"]]) ding(o, SX + dx, SY - 14);
  for (const [dx, o] of [[-36, "graufurt_steinhaus_01"], [36, "graufurt_steinhaus_02"]]) ding(o, SX + dx, SY + 38);
  /* südlich der Unteren Gasse: Kapelle, Scheune, Holzlager */
  ding("dorf_kapelle_01", SX - 22, SY + 38, { id: "steinhag_kapelle" }); ding("dorf_scheune_holz_01", SX + 22, SY + 38, {}); ding("dorf_holzstapel_01", SX + 30, SY + 32); ding("k_karren", SX - 10, SY + 31);
  /* Steg am See und Fischplatz */
  ding("dorf_bruecke_01", SX + 26, SY - 29.4, { id: "steinhag_steg" }); freigeben.push({ art: "rechteck", x0: SX + 21.1, y0: SY - 32, x1: SX + 29, y1: SY - 29.4 });
  fischplatz("fischplatz_steinhagsee", "wels", 45, SX + 24, SY - 28, 0, -1, "Vom Steg aus beißen im kalten Steinhagsee die Welse.");
  npc.push({ id: "bergvoegtin", rolle: "Bergvögtin (Hof)", x: SX + 1, y: SY - 12 }, { id: "wirt_steinhag", rolle: "Wirt (Taverne)", x: SX + 20, y: SY - 12.2 }, { id: "bankier_steinhag", rolle: "Bank", x: SX - 21, y: SY - 12 },
    { id: "schmied_steinhag", rolle: "Schmied", x: SX + 16, y: SY + 25.6 }, { id: "haendler_steinhag_1", rolle: "Händler am Marktstand", x: SX - 8, y: SY + 5.4 }, { id: "haendler_steinhag_2", rolle: "Händlerin am Marktstand", x: SX + 8, y: SY + 5.4 },
    { id: "troedler_steinhag", rolle: "Trödler", x: SX - 16, y: SY + 2 }); }

/* ═══════ 4. Erzberg mit Bergwerk ═══════ */
const BW_U = [362, 300], [BX, BY] = ORTE.bergwerk;
{ /* Vorplatz und Zugang aus dem Fels geschlagen (Höhlenboden), bis hinunter zum Weg */
  male(BX - 8, BY - 1, BX + 7, BY + 9, (x, y) => (Math.hypot((x - BX) / 7.5, (y - BY - 4) / 5.5) < 1 ? "h" : null)); male(BX - 6, BY + 4, BX + 2, BY + 16, (x, y) => (strecke(x, y, [[BX, BY + 4], [BX - 3, BY + 14]]) < 2.4 ? "g" : null));
  ding("hochland_stolleneingang", BX, BY - 1, { id: "bergwerk_eingang" }); ding("hochland_grubenholz", BX + 5, BY + 3, { id: "bergwerk_grubenholz_1" }); ding("hochland_grubenholz", BX + 6.5, BY + 5, { id: "bergwerk_grubenholz_2", spiegeln: true });
  ding("hochland_lore", BX - 1.5, BY + 6, { id: "bergwerk_lore" }); ding("hochland_schienen", BX - 1.5, BY + 3.5, { id: "bergwerk_schienen_1" }); ding("hochland_schienen", BX - 1.5, BY + 6, { id: "bergwerk_schienen_2" }); ding("dorf_holzstapel_01", BX + 4, BY + 6); ding("moor_feuerkorb_01", BX - 2, BY + 2);
  ding("moor_kate_02", BX - 14, BY + 12, { id: "bergwerk_kaue" });
  lies("bergwerk_eingang", BX, BY + 1.2, "Der Stollen ins Erzberg-Bergwerk. Kalte Luft, das Klopfen von Hämmern – und tief drinnen etwas Schweres, das sich bewegt.", { tat: "bergwerk", knopf: "Hineingehen", ziel: [BW_U[0] * 32 + 48, BW_U[1] * 32 + 58] });
  npc.push({ id: "steiger", rolle: "Steiger (Bergwerk)", x: BX - 4, y: BY + 3 }, { id: "bergmann_1", rolle: "Bergmann", x: BX + 3, y: BY + 4 }, { id: "bergmann_2", rolle: "Bergfrau", x: BX - 12, y: BY + 13.5 }); }

/* ═══════ 5. Passwacht am Hochpass ═══════ */
{ const [px, py] = PASS; eben.push([px - 10, py - 8, px + 10, py + 8]);
  ding("dorf_wachturm_01", px + 7, py - 3, { id: "passwacht_turm" }); ding("moor_kate_01", px - 8, py - 2, { id: "passwacht_stube" });
  for (const dx of [-5, -3, 3, 5]) ding("dorf_palisade_01", px + dx, py - 7, { id: "passwacht_palisade_" + (dx + 6) }); ding("hochland_pass_schranke", px, py - 7, { id: "passwacht_schranke" });
  ding("moor_feuerkorb_01", px + 2, py + 2); ding("k_faesser", px - 4, py + 3); ding("hochland_steinmann", px + 14, py - 14, { id: "grauhorn_steinmann" }); ding("hochland_gipfelkreuz", 6900, 5668, { id: "grauhorn_gipfelkreuz" });
  lies("passwacht", px + 1, py + 3.4, "Die Passwacht am Hochpass. Dahinter, im Norden, beginnt das Eis der Frostkrone. Die Schranke ist offen – wer hinüber will, geht auf eigene Gefahr.");
  lies("grauhorn_steinmann", px + 14, py - 12.6, "Ein Steinmann auf dem Grat des Grauhorns. Jeder, der hier oben war, hat einen Stein dazugelegt.");
  npc.push({ id: "passwaechterin", rolle: "Passwächterin", x: px + 2, y: py + 0.5 }, { id: "passwaechter", rolle: "Passwächter", x: px - 7, y: py - 0.4 }); }

/* ═══════ 6. Almhütte mit Käserei ═══════ */
{ const [ax, ay] = ORTE.alm; eben.push([ax - 14, ay - 10, ax + 14, ay + 10]);
  ding("moor_langhaus_01", ax - 4, ay, { id: "almhuette" }); ding("weidenhain_kate_01", ax + 8, ay - 1, { id: "kaeserei" }); ding("hand_kessel_01", ax + 8, ay + 2, { id: "kaeserei_kessel" }); ding("hochland_kaeserad", ax + 11, ay + 3, { id: "kaeserei_kaeserad_1" }); ding("hochland_kaeserad", ax + 12.2, ay + 3.4, { id: "kaeserei_kaeserad_2" });
  ding("k_faesser", ax + 12, ay + 1); ding("dorf_heuballen_01", ax - 11, ay + 3); ding("dorf_brunnen_01", ax + 1, ay + 5, { id: "alm_brunnen" });
  for (let u = ax - 18; u <= ax + 18; u += 2.4) ding("k_zaun", u, ay + 10, { id: "alm_zaun_" + Math.round(u - ax + 20) });
  lies("almhuette", ax - 4, ay + 1.6, "Die Almhütte auf der Hohen Alm. Im Sommer weiden hier Schafe und Ziegen, und in der Käserei reifen Laibe so groß wie Wagenräder.");
  npc.push({ id: "sennerin", rolle: "Sennerin (Käserei)", x: ax + 7, y: ay + 1.2 }, { id: "senn", rolle: "Senn", x: ax - 5, y: ay + 2.4 });
  npc.push(...[[ax - 10, ay + 16], [ax - 4, ay + 18], [ax + 3, ay + 15], [ax + 10, ay + 18], [ax + 16, ay + 14]].map(([x, y], i) => ({ id: "alm_tier_" + (i + 1), rolle: i % 2 ? "Ziege (Stimmung)" : "Schaf (Stimmung)", x, y }))); }

/* ═══════ 7. Einsiedelei am Spiegelsee ═══════ */
{ const [ex, ey] = ORTE.einsiedelei; male(ex - 8, ey - 6, ex + 8, ey + 6, (x, y) => (jetzt(x, y) === "w" ? null : "."));
  ding("moor_kate_01", ex, ey, { id: "einsiedelei" }); ding("moor_schrein_01", ex + 6, ey + 2, { id: "einsiedelei_schrein" }); ding("dorf_holzstapel_01", ex - 5, ey + 1);
  lies("einsiedelei", ex, ey + 1.6, "Die Einsiedelei am Spiegelsee. Der Einsiedler spricht wenig – aber er weiß, wo das Ureisen liegt.");
  uferplatz("fischplatz_spiegelsee", "wels", 45, ex - 8, ey - 6, "Im Spiegelsee stehen die Welse tief und still.");
  npc.push({ id: "einsiedler", rolle: "Einsiedler", x: ex + 1, y: ey + 1.4 }); }

/* ═══════ 8. Wege und Wegweiser ═══════ */
const W_FURT = [[6796, 5761], [6830, 5786], [6880, 5830], [6930, 5868], [SX - 50, SY + 9]];
const W_PASS = [[SX - 50, SY + 9], [6934, 5870], [6936, 5810], [6950, 5740], [6962, 5680], PASS, [6946, 5560], [6920, 5520]];   /* westlich am Steinhagsee vorbei */
const W_ERZ = [[SX + 50, SY + 9], [7060, 5880], [7100, 5850], [BX - 2, BY + 6]];
const W_ALM = [[SX, SY + 44], [7030, 5960], [7100, 5980], [7150, 5996], [ORTE.alm[0] - 10, ORTE.alm[1] + 4]];
const W_SIEDEL = [[BX + 2, BY + 6], [7200, 5780], [7270, 5720], [7320, 5680], [ORTE.einsiedelei[0] - 2, ORTE.einsiedelei[1] + 4]];
const W_KLIPPEN = [[7200, 5780], [7230, 5660], [7250, 5560], [7270, 5440], [ORTE.nordklippen[0], ORTE.nordklippen[1] + 40]];
for (const w of [W_FURT, W_ERZ, W_ALM]) weg(w, 2.2, "e"); for (const w of [W_PASS, W_SIEDEL, W_KLIPPEN]) weg(w, 1.8, "e");
for (const [x, y, id, text] of [[6810, 5767, "wegweiser_furt", "Wegweiser: Westen – Grauwacht (über die Furt) · Osten – Steinhag"], [SX - 52, SY + 5, "wegweiser_steinhag_west", "Wegweiser: Norden – Hochpass, Passwacht · Westen – die Furt, Grauwacht"],
  [SX + 52, SY + 5, "wegweiser_steinhag_ost", "Wegweiser: Osten – Erzberg, Bergwerk · Süden – Hohe Alm"], [7204, 5786, "wegweiser_erzberg", "Wegweiser: Nordosten – Einsiedelei am Spiegelsee · Norden – die Nordklippen"]]) {
  ding("welt_wegweiser_01", x, y, { id }); lies(id, x + 0.5, y + 1.4, text); }
lies("nordklippen", ORTE.nordklippen[0], ORTE.nordklippen[1] + 41.6, "Die Nordklippen. Unten bricht das Meer, oben kreisen die Adler.");

/* ═══════ 8b. Füllen (#147, Konzept „Hochlande füllen“): Stationen, Rastplätze, Steinmänner, Fischplätze, Tiere ═══════ */
const stationen = [], reisende = [];
{ /* Stationen (Objekte; die Stationen selbst trägt Systeme ein): Esse und Amboss am Bergwerk, Herd an der Alm, Feuer an der Passwacht, Kessel an der Einsiedelei */
  ding("dorf_schmiede_01", BX + 13, BY + 15, { id: "bergwerk_schmiede" }); lies("bergwerk_schmiede", BX + 14.5, BY + 16.4, "Die Schmiede am Stollen: Esse und Amboss, damit die Bergleute ihre Hacken gleich vor Ort richten.");
  stationen.push({ id: "esse_bergwerk", station: "esse", x: BX + 14.5, y: BY + 16 }, { id: "amboss_bergwerk", station: "amboss", x: BX + 12, y: BY + 16 });
  const [ax, ay] = ORTE.alm; ding("hand_herd_01", ax - 12, ay + 6, { id: "alm_herd" }); stationen.push({ id: "herd_alm", station: "herd", x: ax - 12, y: ay + 7.4 });
  const [px, py] = PASS; ding("dorf_festfeuer_01", px - 3, py + 5, { id: "passwacht_feuer" }); stationen.push({ id: "feuer_passwacht", station: "feuer", x: px - 3, y: py + 6.6 });
  const [ex, ey] = ORTE.einsiedelei; ding("hand_kessel_01", ex - 4, ey + 4, { id: "einsiedelei_kessel" }); stationen.push({ id: "kessel_einsiedelei", station: "kessel", x: ex - 4, y: ey + 5.4 });
  male(ex + 2, ey + 4, ex + 8, ey + 8, () => "a"); ding("dorf_zaun_01", ex + 3, ey + 8.4); ding("dorf_zaun_01", ex + 7, ey + 8.4);   /* der Garten des Einsiedlers */
  /* Rastplätze an den Wegen und Steinmänner */
  for (const [id, x, y] of [["rast_passweg", 6942, 5770], ["rast_siedelweg", 7262, 5734], ["rast_klippenweg", 7226, 5620]]) {
    ding("dorf_festfeuer_01", x, y, { id: id + "_feuer" }); ding("wald_baumstamm_01", x - 2.5, y + 1.5, { id: id + "_stamm_1", s: 0.8 }); ding("wald_baumstamm_02", x + 2.5, y - 1, { id: id + "_stamm_2", s: 0.8, spiegeln: true });
    lies(id, x + 0.5, y + 2.4, "Ein Rastplatz am Weg. Asche im Steinring – hier ruhen Bergleute und Hirten."); }
  for (const [i, [x, y]] of [[6955, 5720], [6966, 5650], [7238, 5600], [7262, 5470], [7290, 5700]].entries()) ding("hochland_steinmann", x, y, { id: "steinmann_" + (i + 1) });
  /* Fischplätze: Bachfische in den Bergbächen, Küstenfische an den Nordklippen (ein Steig führt hinunter) */
  uferplatz("fischplatz_grauhornbach", "bachling", 1, 7014, 5740, "Im Grauhornbach stehen kleine Bachlinge im kalten Wasser.");
  uferplatz("fischplatz_grauhornbach_unten", "muehlbarsch", 10, 7002, 5800, "Wo der Grauhornbach in den See fällt, ziehen Mühlbarsche.");
  uferplatz("fischplatz_almbach", "bachling", 1, 7154, 5920, "Der Almbach. Bachlinge schießen zwischen den Steinen hin und her.");
  uferplatz("fischplatz_almbach_unten", "muehlbarsch", 10, 7160, 6080, "Unterhalb der Alm wird der Bach breiter – Mühlbarsche.");
  { const [kx, ky] = ORTE.nordklippen; let sy = ky + 38; while (sy > ky - 30 && !nass(grund(kx + 0.5, sy - 1))) { setze(kx, sy, "g"); setze(kx + 1, sy, "g"); sy--; } setze(kx, sy, "g"); setze(kx + 1, sy, "g");   /* Klippensteig bis ans Wasser */
    uferplatz("fischplatz_nordklippen", "klippenbarsch", 35, kx, sy + 1, "Unten an den Nordklippen beißen Klippenbarsche in der Brandung.");
    uferplatz("fischplatz_nordklippen_ost", "hering", 20, kx + 3, sy + 2, "Heringsschwärme ziehen dicht an den Klippen vorbei."); }
  /* Tiere zur Stimmung (Vorschläge für Figuren/Systeme): Ziegen an den Hängen, Murmeltiere im Geröll */
  const fest = (x, y) => { for (let r = 0; r < 20; r++) for (let a = 0; a < 6.3; a += 0.4) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5; if (!"F~wMS".includes(jetzt(px, py))) return [px, py]; } return [x, y]; };
  for (const [i, [x, y]] of [[6982, 5700], [6990, 5712], [7120, 5770], [7180, 5760], [7230, 5640]].entries()) { const [a, b] = fest(x, y); npc.push({ id: "ziege_" + (i + 1), rolle: "Ziege (Stimmung)", x: a, y: b }); }
  for (const [i, [x, y]] of [[6948, 5640], [6976, 5590], [7110, 5790], [7172, 5786], [7280, 5380]].entries()) { const [a, b] = fest(x, y); npc.push({ id: "murmeltier_" + (i + 1), rolle: "Murmeltier (Stimmung)", x: a, y: b }); }
  reisende.push({ id: "bergleute_steinhag_erzberg", rolle: "Bergleute auf dem Weg zur Schicht (Reisende nach der Uhr)", punkte: W_ERZ.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]) }); }

/* ═══════ 9. Bäume, Büsche, Felsen ═══════ */
const besetzt = (x, y, r) => objekte.some((o) => Math.abs(o.x - x) < r && Math.abs(o.y - y) < r) || interaktionen.some((i) => Math.hypot(i.x - x, i.y - y) < 4);
const ORTSKREISE = [[SX, SY + 6, 60], [...ORTE.alm, 24], [...PASS, 18], [...ORTE.einsiedelei, 14], [BX, BY + 6, 16], [...ORTE.furt, 22]];
const imOrt = (x, y) => ORTSKREISE.some(([a, b, r]) => Math.hypot(a - x, b - y) < r);
const wegNah = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ("ekp".includes(jetzt(x + dx, y + dy))) return true; return false; };
const zaehl = {}; const z = (k) => (zaehl[k] = (zaehl[k] || 0) + 1);
for (const [cx, cy, rx, ry] of WAELDER) for (let i = 0; i < rx * ry * 0.12; i++) { const x = cx + (wurf() - 0.5) * 2 * rx, y = cy + (wurf() - 0.5) * 2 * ry;
  if (jetzt(x, y) !== "f" || imOrt(x, y) || wegNah(x, y, 2) || besetzt(x, y, 2.4)) continue; ding(wahl(["stil_tanne_01", "stil_tanne_02", "stil_tanne_01", "wald_baum2", "stil_birke_01"]), x, y, { s: +(0.9 + wurf() * 0.35).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); z("Nadelbäume"); }
for (let i = 0; i < 9000 && (zaehl.Einzeltannen || 0) < 160; i++) { const x = 6840 + wurf() * 780, y = 5460 + wurf() * 740;
  if (!".,".includes(jetzt(x, y)) || imOrt(x, y) || wegNah(x, y, 3) || besetzt(x, y, 4)) continue; const n = 1 + Math.floor(wurf() * 4);
  for (let k = 0; k < n; k++) { const a = x + (wurf() - 0.5) * 7, b = y + (wurf() - 0.5) * 7; if (".,".includes(jetzt(a, b)) && !besetzt(a, b, 2.2)) { ding(wahl(["stil_tanne_01", "stil_tanne_02", "stil_birke_01"]), a, b, { s: +(0.85 + wurf() * 0.3).toFixed(2) }); z("Einzeltannen"); } } }
for (let i = 0; i < 9000 && (zaehl.Felsen || 0) < 140; i++) { const x = 6840 + wurf() * 780, y = 5440 + wurf() * 760;
  if (!"g,.".includes(jetzt(x, y)) || imOrt(x, y) || wegNah(x, y, 2) || besetzt(x, y, 3)) continue; ding(jetzt(x, y) === "g" ? wahl(["k_fels_gross", "k_fels_breit", "k_fels_klein"]) : "k_fels_klein", x, y, { s: +(0.6 + wurf() * 0.6).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); z("Felsen"); }
for (let i = 0; i < 9000 && (zaehl.Büsche || 0) < 180; i++) { const x = 6840 + wurf() * 780, y = 5440 + wurf() * 760;
  if (!".,g".includes(jetzt(x, y)) || imOrt(x, y) || wegNah(x, y, 2) || besetzt(x, y, 2)) continue; ding(wahl(["stil_busch_01", "stil_busch_02"]), x, y); z("Büsche"); }

/* ═══════ 10. Kräuter an Schattenhängen (Nordseiten von Grauhorn und Erzberg) ═══════ */
{ let k = 0; for (let i = 0; i < 6000 && kraeuter.length < 10; i++) { const x = 6860 + wurf() * 340, y = 5460 + wurf() * 380; const art = kraeuter.length % 2 ? "nebelkraut" : "eisenhut";
    const amHang = strecke(x, y, GRAT) < 26 && strecke(x, y, GRAT) > 8 || Math.hypot((x - ORTE.erzberg[0]) / 46, (y - ORTE.erzberg[1]) / 34) < 1.05 && y < ORTE.erzberg[1];
    if (!amHang || !"g,.".includes(jetzt(x, y)) || imOrt(x, y) || wegNah(x, y, 2) || besetzt(x, y, 3) || kraeuter.some((q) => Math.hypot(q.x - x, q.y - y) < 10)) continue;
    kraeuter.push({ id: `hochlande_${art}_${++k}`, art, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, region: regionVon(x, y) }); }
  /* niedrige Kräuter auf der Alm, ein kleines Beet am Garten des Einsiedlers */
  const [ax, ay] = ORTE.alm, [ex, ey] = ORTE.einsiedelei;
  for (const [art, x, y] of [["wegerich", ax - 20, ay - 12], ["wegerich", ax - 16, ay - 14], ["ringelblume", ax + 18, ay - 12], ["ringelblume", ax + 22, ay - 9], ["wegerich", ax + 24, ay + 4],
    ["moorgloeckchen", ex + 3.5, ey + 5.5], ["ringelblume", ex + 6.5, ey + 5.5], ["moorgloeckchen", ex + 5, ey + 7]]) {
    if (!"F~wM".includes(jetzt(x, y))) kraeuter.push({ id: `hochlande_${art}_${++k}`, art, x: Math.floor(x) + 0.5, y: Math.floor(y) + 0.5, region: regionVon(x, y) }); }
  /* in die Kräuter-Fundstellen eintragen (frühere hochlande_… ersetzen; kraeuter.py übernimmt sie aus hochlande_orte.json) */
  const KP = join(WELT, "kraeuter_standorte.json"), KS = JSON.parse(readFileSync(KP, "utf8")); KS.stellen = [...KS.stellen.filter((q) => !q.id.startsWith("hochlande_")), ...kraeuter]; writeFileSync(KP, JSON.stringify(KS, null, 1)); }

/* ═══════ 11. Untergrund: das Bergwerk im Erzberg (3 × 2 Chunks) ═══════ */
const ADERN = [], ARENA = [];
{ const raster = (B, H, frei) => Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => (frei(x + 0.5, y + 0.5) ? "h" : "F")));
  const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9);
  const HAUPT = [[48, 61], [48, 46], [30, 40], [16, 30], [14, 14]], OSTSTOLLEN = [[48, 46], [66, 40], [80, 28], [84, 12]], QUER = [[30, 40], [40, 24], [60, 18], [80, 28]];
  const HALLE = { x: 23, y: 14, r: 11 }, KAMMER = { x: 86, y: 12, r: 7 }, VORRAUM = { x: 48, y: 52, r: 6 };
  const g = raster(96, 64, (x, y) => strecke(x, y, HAUPT) < 2.4 + 0.4 * zw(x, y) || strecke(x, y, OSTSTOLLEN) < 2.2 + 0.4 * zw(x, y) || strecke(x, y, QUER) < 1.8 + 0.3 * zw(x, y) ||
    Math.hypot(x - HALLE.x, y - HALLE.y) < HALLE.r + 0.6 * zw(x, y) || Math.hypot(x - KAMMER.x, y - KAMMER.y) < KAMMER.r + 0.5 * zw(x, y) || Math.hypot(x - VORRAUM.x, y - VORRAUM.y) < VORRAUM.r + 0.4 * zw(x, y) || (y > 56 && y < 63 && Math.abs(x - 48) < 2.5));
  /* Trollhalle als Boss-Arena (#116, später): freie Fläche, gut sichtbarer Steinboden, Feuerkörbe nur am Rand */
  for (let y = 0; y < 64; y++) for (let x = 0; x < 96; x++) if (g[y][x] === "h" && Math.hypot(x + 0.5 - HALLE.x, y + 0.5 - HALLE.y) < HALLE.r - 1.2) g[y][x] = "p";
  ARENA.push({ region: "hochlande_bergwerk", x: BW_U[0] * 32 + HALLE.x, y: BW_U[1] * 32 + HALLE.y, r: HALLE.r - 1.2, hinweis: "Trollhalle: freie Fläche für den Mini-Boss (Instanz nach #116), Eingang von Osten über den Querschlag" });
  let m = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz|wald|dorf)_/, "").replace(/_\d+$/, "") + "_" + ++m, objekt, x, y, ...mehr });
  const dinge = [o("hoehle_leiter_01", 48, 59.4), o("moor_feuerkorb_01", 44, 52), o("moor_feuerkorb_01", 52, 52), o("hochland_lore", 47, 49, { id: "bergwerk_lore_1" }), o("hochland_lore", 66, 41, { id: "bergwerk_lore_2" }), o("hochland_schienen", 48, 54), o("hochland_schienen", 48, 51.5), o("hochland_schienen", 48, 49),
    o("hochland_grubenholz", 30, 38), o("hochland_grubenholz", 60, 18.4, { spiegeln: true }), o("hochland_grubenholz", 80, 26), o("moor_feuerkorb_01", 16, 7), o("moor_feuerkorb_01", 30, 7), o("moor_feuerkorb_01", 16, 21), o("moor_feuerkorb_01", 30, 21), o("hoehle_steinsaeule_01", 83, 9), o("k_kiste", 51, 55), o("dorf_holzstapel_01", 40, 26)];
  /* Erzadern an den Stollenwänden: Sterneisen (35) im Hauptstollen, Splittereisen (45) im Querschlag, Ureisen (65) in der Kammer – für sammelstellen.mjs */
  const ader = (id, art, x, y) => { g[Math.floor(y)][Math.floor(x)] = "h"; ADERN.push({ id, art, x: BW_U[0] * 32 + x, y: BW_U[1] * 32 + y, region: "hochlande_bergwerk" }); };
  [[46, 44], [44, 42], [50, 44]].forEach(([x, y], i) => ader("bergwerk_sterneisen_" + (i + 1), "sterneisen", x + 0.5, y + 0.5));
  [[38, 26], [42, 22], [58, 16]].forEach(([x, y], i) => ader("bergwerk_splittereisen_" + (i + 1), "splittereisen", x + 0.5, y + 0.5));
  [[84, 8], [90, 12], [86, 16]].forEach(([x, y], i) => ader("bergwerk_ureisen_" + (i + 1), "ureisen", x + 0.5, y + 0.5));
  const iaU = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
  const dir = join(WELT, "regionen", "hochlande_bergwerk"); mkdirSync(dir, { recursive: true });
  for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("bergwerk: im Fels " + p.id); }
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "hochlande_bergwerk", name: "Das Erzberg-Bergwerk", untertitel: "Unter dem Erzberg", ursprung: BW_U, chunks: [3, 2], biom: "hoehle", stufe: 12, ebene: "untergrund" }, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), g.map((r) => r.join("")).join("\n") + "\n"); writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify({ start: [[48, 57]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [iaU("bergwerk_hinaus", 48, 61.2, "Hinaus ans Tageslicht.", { tat: "bergwerk_hinaus", knopf: "Hinaus", ziel: [BX, BY + 2.4] }),
      iaU("bergwerk_vorraum", 48, 54.6, "Der Füllort: Loren, Kisten, eine Tafel mit den Schichten. Die letzte Zeile ist durchgestrichen."),
      iaU("bergwerk_trollhalle", HALLE.x + 4, HALLE.y + HALLE.r - 1.5, "Eine Halle, aus dem Fels geschlagen – zu groß für Menschenhände. Am Boden Knochen und abgenagte Grubenhölzer."),
      iaU("bergwerk_urkammer", KAMMER.x - 3, KAMMER.y + KAMMER.r - 1.5, "Die Urkammer. Das Gestein glänzt schwarz und schwer – Ureisen.")] }, null, 1) + "\n");
  console.log(`hochlande_bergwerk: 96 × 64 Felder, ${dinge.length} Dinge, ${ADERN.length} Adern`); }

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let s = ""; for (let x = X0; x <= X1; x++) s += feld.get(x + "," + y) || " "; zeilen.push(s.replace(/ +$/, "")); } if (zeilen.some((s) => s.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
const hoehenListe = [...hoehen].filter(([, h]) => Math.abs(h) > 0.02).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_hochlande.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/hochlande.mjs (#147): Hochlande – Brücke zur Furt, Steinhag, Grauhorn mit Hochpass, Erzberg, Hohe Alm, Spiegelsee, Nordklippen. Weltfelder.", gelaende: patches, hoehen: hoehenListe, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "hochlande.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
writeFileSync(join(WELT, "hochlande_orte.json"), JSON.stringify({ hinweis: "Phase 11 Vorarbeit (Welt #147): Orte, Ortsnamen, NPC-Plätze (Vorschläge für Figuren #148), Fischplätze, Kräuter, Erzadern im Bergwerk, Wege. Weltfelder.",
  orte: ORTE, namen: [["Die Hochlande", "Landschaft", 7240, 5860], ["Steinhag", "Stadt", SX, SY], ["Hohe Alm", "Gehöft", ...ORTE.alm], ["Erzberg-Bergwerk", "Ort", BX, BY], ["Passwacht", "Ort", ...PASS],
    ["Einsiedelei", "Ort", ...ORTE.einsiedelei], ["Die Furt", "Wegmarke", ...ORTE.furt], ["Grauhorn", "Landschaft", 6990, 5570], ["Steinhagsee", "Landschaft", 6990, 5846], ["Spiegelsee", "Landschaft", ...ORTE.spiegelsee], ["Die Nordklippen", "Landschaft", ...ORTE.nordklippen]],
  npc, fischplaetze: fische, kraeuter, adern: ADERN, stationen, reisende, arena: ARENA[0], baeche: BAECHE, wege, zaehlung: zaehl }, null, 1) + "\n");
console.log(`Hochlande: ${feld.size} Geländefelder, ${hoehenListe.length} Höhen, ${objekte.length} Objekte, ${interaktionen.length} Lesestellen, ${npc.length} NPC-Plätze, ${fische.length} Fischplätze, ${kraeuter.length} Kräuter –`, JSON.stringify(zaehl));
