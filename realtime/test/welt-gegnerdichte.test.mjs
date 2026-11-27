/*
 * Mythara – Gegnerdichte (Welt #130), ohne Browser: von jedem begehbaren Feld der Oberwelt außerhalb der Ausnahmen (Städte, Dörfer, Orte, Questorte,
 * Bedienstellen, Trödler, Inselchen) ist der nächste Gegnerplatz höchstens ~25 Felder entfernt; Gegnerplätze stehen nicht auf Wegen und nicht in Orten.
 * Geprüft auf einem Gitter (jedes 3. Feld). Aufruf (im Ordner realtime): node test/welt-gegnerdichte.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const X0 = 186 * 32, Y0 = 155 * 32, B = 75 * 32, H = 99 * 32, GEL = new Uint8Array(B * H), WEG = new Uint8Array(B * H);
const geh = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "gelaende.json"), "utf8")).arten.map((a) => [a.zeichen, a.begehbar]));
for (const n of readdirSync(join(WELT, "regionen"))) { const p = join(WELT, "regionen", n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * 32 - X0, y0 = r.ursprung[1] * 32 - Y0; if (x0 < 0 || y0 < 0 || x0 >= B || y0 >= H) continue;
  readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n").forEach((z, j) => { for (let i = 0; i < z.length; i++) { const k = (y0 + j) * B + x0 + i; if (geh.get(z[i])) GEL[k] = 1; if ("ekpd".includes(z[i])) WEG[k] = 1; } }); }
const D = JSON.parse(readFileSync(join(WELT, "gegnerplaetze.json"), "utf8"));
/* Ausnahmen: die Kreise aus der Datei plus Questorte/Bedienstellen/Trödler, wie im Werkzeug */
const kreise = D.ausnahmen.filter((a) => a.x !== undefined).map((a) => [a.x, a.y, a.r]);
for (const n of readdirSync(join(WELT, "regionen"))) { const p = join(WELT, "regionen", n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  for (const i of JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8")).interaktionen) kreise.push([r.ursprung[0] * 32 + i.x, r.ursprung[1] * 32 + i.y, 6]); }
for (const s of JSON.parse(readFileSync(join(WELT, "bedienstellen.json"), "utf8")).stationen) kreise.push([s.x, s.y, 8]);
for (const s of JSON.parse(readFileSync(join(WELT, "troedler_standorte.json"), "utf8")).standorte) kreise.push([s.x, s.y, 6]);
const KG = new Map(); for (const k of kreise) for (let gy = Math.floor((k[1] - k[2]) / 64); gy <= Math.floor((k[1] + k[2]) / 64); gy++) for (let gx = Math.floor((k[0] - k[2]) / 64); gx <= Math.floor((k[0] + k[2]) / 64); gx++) { const s = gx + "," + gy; (KG.get(s) || KG.set(s, []).get(s)).push(k); }
const ausgenommen = (x, y) => (KG.get(Math.floor(x / 64) + "," + Math.floor(y / 64)) || []).some(([a, b, r]) => (a - x) ** 2 + (b - y) ** 2 <= r * r);
/* Gegnerplätze: neue aus der Datei plus vorhandene Lager aus weltzonen.py */
const P = D.plaetze.map((p) => [p.x, p.y]); for (const [, x, y] of readFileSync(new URL("../werkzeug/weltzonen.py", import.meta.url), "utf8").matchAll(/\("\w+",\s*(\d{4,5}),\s*(\d{4,5})\)/g)) P.push([+x, +y]);
const PG = new Map(); for (const [x, y] of P) { const s = Math.floor(x / 32) + "," + Math.floor(y / 32); (PG.get(s) || PG.set(s, []).get(s)).push([x, y]); }
const naechster = (x, y) => { let best = Infinity; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const [a, b] of PG.get((Math.floor(x / 32) + dx) + "," + (Math.floor(y / 32) + dy)) || []) best = Math.min(best, Math.hypot(a - x, b - y)); return best; };
/* kleine Inselchen wie im Werkzeug ausnehmen: Größe der Landstücke (begehbar, 4er-Nachbarschaft) */
const LAB = new Int32Array(B * H), GR = [0]; let n = 0; const st = new Int32Array(B * H);
for (let k = 0; k < B * H; k++) if (GEL[k] && !LAB[k]) { n++; let s = 0, e = 0; st[e++] = k; LAB[k] = n; let z = 0; while (s < e) { const m = st[s++]; z++; for (const d of [1, -1, B, -B]) { const q = m + d; if (q >= 0 && q < B * H && GEL[q] && !LAB[q] && !(d === 1 && q % B === 0) && !(d === -1 && m % B === 0)) { LAB[q] = n; st[e++] = q; } } } GR.push(z); }
console.log("\nGegnerdichte");
let geprueft = 0; const zuweit = [];
for (let y = 1; y < H; y += 3) for (let x = 1; x < B; x += 3) { const k = y * B + x; if (!GEL[k] || GR[LAB[k]] < 400) continue; const wx = x + X0 + 0.5, wy = y + Y0 + 0.5; if (ausgenommen(wx, wy)) continue; geprueft++;
  const d = naechster(wx, wy); if (d > D.reichweite + 1) zuweit.push(`${Math.round(wx)}|${Math.round(wy)}: ${d === Infinity ? "> 32" : d.toFixed(1)} Felder`); }
check(!zuweit.length, `von ${geprueft} geprüften Feldern (jedes 3.) ist der nächste Gegnerplatz höchstens ${D.reichweite + 1} Felder entfernt`, zuweit);
const aufWeg = D.plaetze.filter((p) => WEG[(Math.floor(p.y) - Y0) * B + Math.floor(p.x) - X0]); check(aufWeg.length <= D.plaetze.length * 0.01, `Gegnerplätze nicht auf Wegen (${aufWeg.length} von ${D.plaetze.length})`, aufWeg.map((p) => p.id));
const inOrt = D.plaetze.filter((p) => p.quelle !== "Süden #120" && ausgenommen(p.x, p.y));   /* die Plätze aus #120 liegen absichtlich am Ortsrand (Felder, Ufer, Steinbruch) */ check(!inOrt.length, "kein Gegnerplatz in Städten, Dörfern, Orten, an Questorten oder Bedienstellen", inOrt.map((p) => p.id));
check(D.fehlend.length > 0 && D.fehlend.every((f) => f.gegner && f.stufe && f.gelaende), `${D.fehlend.length} fehlende Modelle mit Stufe und Gelände gelistet`);
console.log(ok ? "\nGegnerdichte: alles in Ordnung" : "\nGegnerdichte: FEHLER"); process.exit(ok ? 0 : 1);
