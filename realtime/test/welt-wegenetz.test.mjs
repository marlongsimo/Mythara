/*
 * Mythara – Wegenetz (Welt #89), ohne Browser: jede Stadt und jedes Dorf ist von jedem anderen über Wege erreichbar (Straße „k“, Feldweg „e“, Pflaster „p“,
 * Holz „d“, Brücken über die Freigaben; ein Feld Spielraum am Wegrand). Sperren mit Quest-Schalter (Dornenwall) zählen als offen – der Weg ist da.
 * Dazu: Wegweiser mit Lesestelle, Rastplätze mit Feuer.
 * Aufruf (im Ordner realtime): node test/welt-wegenetz.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const X0 = 186 * 32, Y0 = 155 * 32, B = 75 * 32, H = 99 * 32, WEG = new Uint8Array(B * H);
const regs = {};
for (const n of readdirSync(join(WELT, "regionen"))) { const p = join(WELT, "regionen", n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * 32 - X0, y0 = r.ursprung[1] * 32 - Y0; if (x0 < 0 || y0 < 0 || x0 >= B || y0 >= H) continue; regs[n] = r;
  readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n").forEach((z, j) => { for (let i = 0; i < z.length; i++) if ("ekpd".includes(z[i])) WEG[(y0 + j) * B + x0 + i] = 1; });
  const s = JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8"));
  for (const f of s.kollision?.freigeben || []) for (let y = Math.floor(y0 + f.y0); y < Math.ceil(y0 + f.y1); y++) for (let x = Math.floor(x0 + f.x0); x < Math.ceil(x0 + f.x1); x++) WEG[y * B + x] = 1; }
/* ein Feld Spielraum */
const NETZ = new Uint8Array(B * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < B - 1; x++) { const k = y * B + x; if (WEG[k] || WEG[k - 1] || WEG[k + 1] || WEG[k - B] || WEG[k + B]) NETZ[k] = 1; }
const N = JSON.parse(readFileSync(join(WELT, "wegenetz.json"), "utf8"));
const STAEDTE = ["Waldmark", "Weidenhain", "Osthof", "Rabenmoor", "Graufurt", "Ostufer", "Glutbrunn", "Heidrast", "Grauwacht", "Kielmund", "Möwenbucht"];
const naechster = ([x, y]) => { for (let r = 0; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const k = (y - Y0 + dy) * B + (x - X0 + dx); if (NETZ[k]) return k; } return -1; };
console.log("\nWegenetz");
const start = naechster(N.orte.Waldmark), seen = new Uint8Array(B * H), q = new Int32Array(B * H); let a = 0, e = 0; q[e++] = start; seen[start] = 1;
while (a < e) { const k = q[a++]; for (const d of [1, -1, B, -B]) { const m = k + d; if (!seen[m] && NETZ[m]) { seen[m] = 1; q[e++] = m; } } }
const fehlt = STAEDTE.filter((s) => { const k = naechster(N.orte[s]); return k < 0 || !seen[k]; });
check(!fehlt.length, `alle ${STAEDTE.length} Städte und Dörfer über das Wegenetz verbunden (Wegnetz ${e} Felder)`, fehlt);
console.log("\nWegweiser und Rastplätze");
const ia = new Map(); for (const n of Object.keys(regs)) { const [x0, y0] = regs[n].ursprung.map((v) => v * 32); for (const i of JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8")).interaktionen) ia.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); }
const ww = N.wegweiser.filter((w) => !ia.has("wegweiser_" + w.id + "_lesen") && !ia.has("ort_wegweiser_" + w.id + "_lesen"));
check(N.wegweiser.length >= 8 && !ww.length, `${N.wegweiser.length} Wegweiser mit Lesestelle („Nach … →“)`, ww.map((w) => w.id));
const nahWeg = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (seen[(Math.floor(y) - Y0 + dy) * B + Math.floor(x) - X0 + dx]) return true; return false; };
const abseits = N.wegweiser.filter((w) => !nahWeg(w.x, w.y, 4)).concat(N.rastplaetze.filter((r) => !nahWeg(r.x, r.y, 8)));
check(!abseits.length, "Wegweiser und Rastplätze liegen am Wegenetz", abseits.map((w) => w.id));
const rast = N.rastplaetze.filter((r) => !ia.has(r.id) || ia.get(r.id).daten.station !== "feuer"); check(N.rastplaetze.length >= 4 && !rast.length, `${N.rastplaetze.length} Rastplätze mit Lagerfeuer als Kochstelle`, rast.map((r) => r.id));
console.log(ok ? "\nWegenetz: alles in Ordnung" : "\nWegenetz: FEHLER"); process.exit(ok ? 0 : 1);
