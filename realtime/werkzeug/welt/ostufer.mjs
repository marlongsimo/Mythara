/*
 * World Pipeline – das Ostufer (Phase 7 vorab, 27.11.2026): eine Region östlich von Graufurt (Chunks 212–215 × 200–210), Gefahrenstufe 3.
 * Nur über die Fähre erreichbar: im Westen der Fluss (in Graufurt), ringsum ein Saum aus Fels, der das Ufer vom Festland trennt.
 *   Wiesen (Splitterreiher), ein Weltenbaum-Hain mit 3 Bäumen (Holz 65), 3 Urgestein-Adern (Ureisen 65) auf einer Geröllhalde,
 *   der Turm mit dem grünen Licht auf einer Anhöhe (Höhenfeld hoehen.json, nur 3D). Der Ostanleger liegt am Ostufer des Flusses in Graufurt.
 * Ränder wie die Nachbarn (bündig). Aufruf (im Ordner realtime) nach festland.py und graufurt.mjs:
 *   node werkzeug/welt/ostufer.mjs     danach: node werkzeug/welt/bauen.mjs ostufer
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
import { TURM_EINGANG } from "./turm_gruen.mjs";

const C = 32, UX = 212, UY = 200, B = 128, H = 352, X0 = UX * C, Y0 = UY * C;
let saat = 7101; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
/* Nachbarkanten: Westen = Graufurt (letzte Spalte), Norden/Süden/Osten = Festland */
const gel = (id) => readFileSync(join(WELT, "regionen", id, "gelaende.txt"), "utf8").split("\n").filter((z) => z.length);
const reg = (id) => JSON.parse(readFileSync(join(WELT, "regionen", id, "region.json"), "utf8"));
const feldVon = (ids) => { const m = new Map(); for (const id of ids) { const r = reg(id), z = gel(id), ux = r.ursprung[0] * C, uy = r.ursprung[1] * C; z.forEach((zeile, j) => { for (let i = 0; i < zeile.length; i++) m.set(`${ux + i},${uy + j}`, zeile[i]); }); } return m; };
const N = feldVon(["graufurt", "fl_212_198", "fl_216_198", "fl_201_211", "fl_216_211"]);
const nach = (x, y) => N.get(`${x},${y}`) ?? "M";
/* Orte (Gebietsfelder) */
export const TURM = { x: 56, y: 118 }, HAIN = { x: 86, y: 220 }, HALDE = { x: 104, y: 290 };
export const WELTENBAEUME = [[82, 216], [90, 218], [86, 226]], URGESTEIN = [[100, 286], [106, 289], [102, 295]];
const PFAD = [[0, 115], [20, 114], [40, 118], [52, 121], [56, 124]], PFAD2 = [[40, 118], [60, 160], [80, 205], [86, 214]], PFAD3 = [[80, 205], [96, 260], [104, 282]];
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const RAND = 4, dick = (t) => RAND + 2.5 + 3 * (1 + Math.sin(t / 9.3) * Math.sin(t / 4.1 + 1)) + Math.abs(Math.sin(t / 1.7));   /* Breite des Felssaums, unregelmäßig */
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c;
  const randN = y, randS = H - 1 - y, randO = B - 1 - x;
  if (x === 0) c = nach(X0 - 1, Y0 + y) === "~" ? "~" : nach(X0 - 1, Y0 + y);                              /* Westkante wie Graufurt */
  else if (y === 0) c = nach(X0 + x, Y0 - 1); else if (y === H - 1) c = nach(X0 + x, Y0 + H); else if (x === B - 1) c = nach(X0 + B, Y0 + y);
  else if (randN < dick(x) || randS < dick(x + 50) || randO < dick(y) || (x < dick(y + 90) && (y < 27 || y > 325))) c = "F";   /* Felssaum: trennt vom Festland (im Westen nur außerhalb der Graufurter Felsriegel offen) */
  else if (strecke(cx, cy, PFAD) < 1.3 || strecke(cx, cy, PFAD2) < 1.1 || strecke(cx, cy, PFAD3) < 1.1) c = "e";
  else if (Math.hypot(cx - HALDE.x, cy - HALDE.y) < 9 + w) c = "g";
  else if (Math.hypot(cx - TURM.x, cy - TURM.y) < 7 + 0.5 * w) c = w > 0.6 ? "g" : ".";
  else if (Math.hypot(cx - HAIN.x, cy - HAIN.y) < 10 + w) c = w > 0.4 ? "," : ".";
  else c = w > 1.1 ? "," : w < -1.2 ? "t" : x < 10 ? "." : ".";
  z.push(c); } g.push(z); }
/* Randzeilen innen an die Nachbarn angleichen: in der zweiten Zeile/Spalte dasselbe wie am Rand, damit Wasser auf Wasser trifft */
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|graufurt|stil|k|moor|turm)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const dinge = [o("graufurt_turm_ost_01", TURM.x, TURM.y), o("turm_gruenlicht_01", TURM.x, TURM.y - 1.5), o("hoehle_felswand_01", TURM.x - 5, TURM.y - 3), o("hoehle_felswand_01", TURM.x + 5, TURM.y - 2, { spiegeln: true })];
for (let i = 0; i < 6000 && dinge.filter((d) => d.objekt.startsWith("stil_")).length < 150; i++) { const x = 6 + wurf() * (B - 14), y = 8 + wurf() * (H - 16), c = g[Math.floor(y)][Math.floor(x)];
  if (!".,t".includes(c) || strecke(x, y, PFAD) < 3 || strecke(x, y, PFAD2) < 3 || strecke(x, y, PFAD3) < 3 || Math.hypot(x - TURM.x, y - TURM.y) < 11 || Math.hypot(x - HAIN.x, y - HAIN.y) < 12 || Math.hypot(x - HALDE.x, y - HALDE.y) < 11) continue;
  if (dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 4)) continue; if (wurf() > 0.35) continue;
  dinge.push(o(["stil_eiche_02", "stil_birke_01", "stil_busch_01", "stil_linde_01", "stil_busch_02"][Math.floor(wurf() * 5)], x, y, { s: +(0.85 + wurf() * 0.25).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
for (let i = 0; i < 2000 && dinge.filter((d) => d.objekt.startsWith("k_fels")).length < 14; i++) { const a = wurf() * 6.28, r = 3 + wurf() * 6; const x = HALDE.x + Math.cos(a) * r, y = HALDE.y + Math.sin(a) * r;
  if (URGESTEIN.some(([u, v]) => Math.hypot(u + 0.5 - x, v + 0.5 - y) < 2.5) || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 3) || strecke(x, y, PFAD3) < 2) continue; dinge.push(o(wurf() < 0.5 ? "k_fels_klein" : "k_fels_breit", x, y)); }
for (const p of dinge) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[4.5, 115.5]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [...WELTENBAEUME, ...URGESTEIN].map(([x, y]) => ({ art: "rechteck", x0: x, y0: y, x1: x + 1, y1: y + 1 })), freigeben: [] },
  interaktionen: [lies("turm_wappentuer", TURM.x, TURM.y + 1.0, "Eine Tür aus Eichenbohlen. In das Holz ist ein Wappen geschnitten: ein Turm über drei Wellen. Sie ist verschlossen.", { tat: "turm", knopf: "Die Tür mit dem Wappen öffnen", ziel: TURM_EINGANG }),
    lies("turm_ansehen_nah", TURM.x - 3, TURM.y + 3.5, "Der Turm mit dem grünen Licht. Oben brennt es, still und ohne zu flackern.")] };
/* Höhenfeld (nur 3D): die Anhöhe des Turms und sanfte Wellen; null am Rand */
const werte = []; for (let y = 0; y <= H; y++) for (let x = 0; x <= B; x++) { const d = Math.hypot(x - TURM.x, (y - TURM.y) * 0.9), rand = Math.min(x, y, B - x, H - y);
  const huegel = d < 16 ? 3.2 * Math.pow(1 - d / 16, 1.3) : 0, flach = Math.max(0, 1 - Math.min(1, d / 6)); const h = (huegel * (1 - 0.15 * flach) + 0.35 * (1 + Math.sin(x / 13) * Math.sin(y / 17))) * Math.min(1, rand / 10);
  werte.push(Math.round(h * 100)); }
const dir = join(WELT, "regionen", "ostufer"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "ostufer", name: "Das Ostufer", untertitel: "Jenseits des grauen Flusses – nur mit der Fähre", ursprung: [UX, UY], chunks: [B / C, H / C], biom: "wiese", stufe: 3 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
writeFileSync(join(dir, "hoehen.json"), JSON.stringify({ hinweis: "Zusatzhöhe je Eckpunkt in Hundertsteln eines Feldes, (Breite+1) × (Höhe+1), zeilenweise", werte }) + "\n");
console.log(`ostufer: ${B} × ${H} Felder, ${dinge.length} Objekte`);
