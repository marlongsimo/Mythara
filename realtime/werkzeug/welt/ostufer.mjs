/*
 * World Pipeline – das Ostufer (Phase 7 vorab, 27.11.2026): eine Region östlich von Graufurt (Chunks 212–215 × 200–210), Gefahrenstufe 3.
 * Nur über die Fähre erreichbar: im Westen der Fluss (in Graufurt), ringsum ein gewachsener Felsgrat mit Geröll (ostufer_form.mjs, #42);
 * außerhalb des Grats liegt der Untergrund des Festlands (welt/festland/ostufer_grund.txt), so dass Küste und Wald nahtlos weiterlaufen.
 *   Wiesen (Splitterreiher), ein Weltenbaum-Hain mit 3 Bäumen (Holz 65), 3 Urgestein-Adern (Ureisen 65) auf einer Geröllhalde,
 *   der Turm mit dem grünen Licht auf einer Anhöhe (Höhenfeld hoehen.json, nur 3D). Der Ostanleger liegt am Ostufer des Flusses in Graufurt.
 * Aufruf (im Ordner realtime) nach festland.py:
 *   node werkzeug/welt/ostufer.mjs     danach: node werkzeug/welt/bauen.mjs ostufer
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
import { TURM_EINGANG } from "./turm_gruen.mjs";
import * as FORM from "./ostufer_form.mjs";

const C = 32, UX = 212, UY = 200, B = 128, H = 352, X0 = UX * C, Y0 = UY * C;
let saat = 7101; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
/* Untergrund: das Festland an dieser Stelle (festland.py schreibt welt/festland/ostufer_grund.txt) – außerhalb des Kessels bleibt es, wie es ist */
const GRUND = readFileSync(join(WELT, "festland", "ostufer_grund.txt"), "utf8").split("\n").filter((z) => z.length).map((z) => [...z]);
const GRUND_H = JSON.parse(readFileSync(join(WELT, "festland", "ostufer_hoehen.json"), "utf8")).werte;
/* Orte (Gebietsfelder) */
export const TURM = { x: 56, y: 118 }, HAIN = { x: 70, y: 215 }, HALDE = { x: 78, y: 280 };
export const WELTENBAEUME = [[66, 211], [74, 213], [70, 221]], URGESTEIN = [[74, 276], [80, 279], [76, 285]];
const PFAD = [[0, 115.5], [20, 114], [40, 118], [52, 121], [56, 124]], PFAD2 = [[40, 118], [50, 160], [62, 198], [68, 208]], PFAD3 = [[64, 200], [72, 248], [76, 270]];
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const wiese = (x, y) => Math.sin(x / 17 + y / 23 + 0.7) + 0.7 * Math.sin(y / 13 - x / 19) + 0.35 * welle(x, y);   /* > 0: Wiese, sonst Wald */
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy), a = FORM.art(X0 + cx, Y0 + cy); let c;
  if (a !== "pass" && x > B - 14 && FORM.passWeg(X0 + cx, Y0 + cy)) c = "e";   /* der Weg läuft bis an den Rand weiter */
  else if (a === "pass") c = FORM.passWeg(X0 + cx, Y0 + cy) ? "e" : w > 0.5 ? "g" : "y";   /* der Pass in die Glutsande: Weg, Geröll, Steppe */
  else if (a === "aussen") c = GRUND[y][x];
  else if (a === "F" || a === "g") c = "~wM".includes(GRUND[y][x]) && FORM.abstand(X0 + cx, Y0 + cy) > 0 ? GRUND[y][x] : a;   /* der Grat geht nicht ins Meer hinaus */
  else if (strecke(cx, cy, PFAD) < 1.3 || strecke(cx, cy, PFAD2) < 1.1 || strecke(cx, cy, PFAD3) < 1.1) c = "e";
  else if (Math.hypot(cx - HALDE.x, cy - HALDE.y) < 9 + w) c = "g";
  else if (Math.hypot(cx - TURM.x, cy - TURM.y) < 7 + 0.5 * w) c = w > 0.6 ? "g" : ".";
  else if (Math.hypot(cx - HAIN.x, cy - HAIN.y) < 10 + w) c = w > 0.4 ? "," : ".";
  else { const v = wiese(cx, cy); c = v > 0.15 ? (w > 1.0 ? "," : ".") : v > -0.05 ? (w > 0 ? "." : "v") : "f"; }   /* Wiesen und Waldstücke im Wechsel, weiche Säume */
  z.push(c); } g.push(z); }
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|graufurt|stil|k|moor|turm|hoehle)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const dinge = [o("graufurt_turm_ost_01", TURM.x, TURM.y), o("turm_gruenlicht_01", TURM.x, TURM.y - 1.5), o("hoehle_felswand_01", TURM.x - 5, TURM.y - 3), o("hoehle_felswand_01", TURM.x + 5, TURM.y - 2, { spiegeln: true })];
/* Felsbrocken auf dem Grat: geben ihm in 3D Gestalt */
for (const [wx, wy] of FORM.gratPunkte(8)) { const x = wx - X0, y = wy - Y0; if (x < 1 || y < 1 || x > B - 1 || y > H - 1) continue; if (g[Math.floor(y)][Math.floor(x)] !== "F") continue;
  dinge.push(o("hoehle_felswand_01", x + (wurf() - 0.5) * 1.5, y + (wurf() - 0.5) * 1.5, { s: +(0.8 + wurf() * 0.6).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
const frei = (x, y, ab) => !dinge.some((d) => Math.hypot(d.x - x, d.y - y) < ab);
const wegNah = (x, y) => strecke(x, y, PFAD) < 3 || strecke(x, y, PFAD2) < 3 || strecke(x, y, PFAD3) < 3 || Math.hypot(x - TURM.x, y - TURM.y) < 11 || Math.hypot(x - HAIN.x, y - HAIN.y) < 12 || Math.hypot(x - HALDE.x, y - HALDE.y) < 11;
/* Bäume: dicht auf Waldboden, vereinzelt auf den Wiesen (innen); außen am Grat ein lockerer Waldsaum, der ins Festland ausläuft */
const ARTEN = ["stil_eiche_02", "stil_birke_01", "stil_linde_01", "stil_eiche_02", "stil_busch_01", "stil_busch_02"];
for (let i = 0; i < 60000; i++) { const x = 1 + wurf() * (B - 2), y = 1 + wurf() * (H - 2), c = g[Math.floor(y)][Math.floor(x)], d = FORM.abstand(X0 + x, Y0 + y);
  if (!"f.,v".includes(c) || wegNah(x, y)) continue; const wald = c === "f";
  const p = d < 0 ? (wald ? 0.5 : 0.04) : (wald ? 0.42 * Math.max(0, 1 - (d - 4) / 26) : 0.03 * Math.max(0, 1 - d / 14));
  if (wurf() > p || !frei(x, y, wald ? 2.6 : 4.5)) continue;
  dinge.push(o(ARTEN[Math.floor(wurf() * ARTEN.length)], x, y, { s: +(0.85 + wurf() * 0.3).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
for (let i = 0; i < 2000 && dinge.filter((d) => d.objekt === "hoehle_felswand_01" && Math.hypot(d.x - HALDE.x, d.y - HALDE.y) < 10).length < 6; i++) { const a = wurf() * 6.28, r = 3 + wurf() * 6; const x = HALDE.x + Math.cos(a) * r, y = HALDE.y + Math.sin(a) * r;
  if (URGESTEIN.some(([u, v]) => Math.hypot(u + 0.5 - x, v + 0.5 - y) < 2.5) || !frei(x, y, 3) || strecke(x, y, PFAD3) < 2) continue; dinge.push(o("hoehle_felswand_01", x, y, { s: +(0.5 + wurf() * 0.3).toFixed(2) })); }
for (const p of dinge) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[4.5, 115.5]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [...WELTENBAEUME, ...URGESTEIN].map(([x, y]) => ({ art: "rechteck", x0: x, y0: y, x1: x + 1, y1: y + 1 })), freigeben: [] },
  interaktionen: [lies("turm_wappentuer", TURM.x, TURM.y + 1.0, "Eine Tür aus Eichenbohlen. In das Holz ist ein Wappen geschnitten: ein Turm über drei Wellen. Sie ist verschlossen.", { tat: "turm", knopf: "Die Tür mit dem Wappen öffnen", ziel: TURM_EINGANG }),
    lies("turm_ansehen_nah", TURM.x - 3, TURM.y + 3.5, "Der Turm mit dem grünen Licht. Oben brennt es, still und ohne zu flackern.")] };
/* Höhenfeld (nur 3D): Festland-Untergrund, der Felsgrat und die Anhöhe des Turms */
const werte = []; for (let y = 0; y <= H; y++) for (let x = 0; x <= B; x++) { const d = Math.hypot(x - TURM.x, (y - TURM.y) * 0.9);
  const huegel = d < 16 ? 3.2 * Math.pow(1 - d / 16, 1.3) : 0, flach = Math.max(0, 1 - Math.min(1, d / 6)), grat = FORM.hoehe(X0 + x, Y0 + y), innen = FORM.abstand(X0 + x, Y0 + y) < 0 ? 1 : 0;
  const unten = GRUND_H[y * (B + 1) + x] / 100 * Math.min(1, Math.max(0, FORM.abstand(X0 + x, Y0 + y) / 8));   /* innen eben wie Graufurt, außen das Festland */
  werte.push(Math.round((unten + huegel * (1 - 0.15 * flach) + grat) * 100)); }
const dir = join(WELT, "regionen", "ostufer"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "ostufer", name: "Das Ostufer", untertitel: "Jenseits des grauen Flusses – nur mit der Fähre", ursprung: [UX, UY], chunks: [B / C, H / C], biom: "wiese", stufe: 3 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
writeFileSync(join(dir, "hoehen.json"), JSON.stringify({ hinweis: "Zusatzhöhe je Eckpunkt in Hundertsteln eines Feldes, (Breite+1) × (Höhe+1), zeilenweise", werte }) + "\n");
console.log(`ostufer: ${B} × ${H} Felder, ${dinge.length} Objekte`);
