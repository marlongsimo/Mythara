/*
 * World Pipeline – der Nordsaum (24.11.2026): 12 × 2 Chunks ab 200|198, über Waldmark, Osthof, Osthang und Graufurt.
 * Schließt das Weltrechteck, seit der Nordwald nach Norden gewachsen ist. Dichter Grenzwald; der Fluss von Graufurt fließt weiter nach Norden
 * (dieselbe Rechnung wie in graufurt.mjs, also bündig), und der Uferweg biegt hinter Graufurt nach Westen ab und führt durch den Wald
 * zum Friedhof im Nordwald (Grenze bei y = NORD_WEG). Dazwischen ein eingestürzter Wachturm.
 * Aufruf (im Ordner realtime): node werkzeug/welt/nordsaum.mjs     danach: node werkzeug/welt/bauen.mjs nordsaum
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const NORD_WEG = 30, B = 384, H = 64, GX = (208 - 200) * 32, GY = (200 - 198) * 32;   /* GX, GY: so weit liegt Graufurt (dort x = 0, y = 0) */
let saat = 91; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
/* Fluss wie in graufurt.mjs (dort in eigenen Feldern) */
const flussX = (yg) => 72 + 4 * Math.sin(yg / 23) + 2 * Math.sin(yg / 9), imFluss = (x, y) => { const xg = x - GX, yg = y - GY; return Math.abs(xg - flussX(yg)) < 6.4 + 0.5 * Math.sin(yg / 3.7); };
const WEG = [[GX + 52, GY + 24], [GX + 51.5, GY - 1], [GX + 51, 50], [GX + 44, 40], [GX + 24, 33], [200, 31], [120, 30.5], [40, 30.5], [-1, NORD_WEG + 0.5]];
const TURM = [262, 24];
/* Phase 8 (#50): der alte Weg nach Grauwacht – vom Knick des Uferwegs nach Norden ins Festland (dort weiter: fahleweiten.mjs). Zugewachsen und
 * vom Dornenwall versperrt (Questobjekt „dornenwall“, Sperre je Spieler offen nach E1). */
const NORDWEG = [[GX + 51.5, 46], [GX + 50, 36], [GX + 44, 24], [GX + 40, 10], [296, -1]], DORN_Y = 30;
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const BAUM = ["stil_tanne_01", "stil_tanne_02", "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_linde_01"];

const g = Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => { const cx = x + 0.5, cy = y + 0.5, d = strecke(cx, cy, WEG);
  if (imFluss(cx, cy)) return "~";
  if (d < 1.4) return "e";
  if (strecke(cx, cy, NORDWEG) < 0.9 + 0.2 * welle(cx, cy)) return cy < DORN_Y + 2 && welle(cx, cy) > 0.4 ? "t" : "e";   /* zugewachsen: Erde mit Torf und Gras */
  if (d < 2.6 || Math.hypot(cx - TURM[0], cy - TURM[1]) < 6 + welle(cx, cy)) return welle(cx, cy) > 1.1 ? "," : ".";
  return "f"; }));
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
/* eingestürzter Wachturm mit Mauerresten, daneben Trümmer und eine tote Erle */
const dinge = [o("k_ruine_turmstumpf", TURM[0] + 0.5, TURM[1] + 0.5), o("k_ruine_halbmauer", TURM[0] - 2.5, TURM[1] + 2), o("k_ruine_halbmauer_tief", TURM[0] + 3, TURM[1] + 1.5),
  o("k_truemmer", TURM[0] + 2.5, TURM[1] + 4.5), o("k_truemmer", TURM[0] - 3.5, TURM[1] - 1.5), o("stil_erle_tot_01", TURM[0] - 4.5, TURM[1] + 4.5), o("k_fels_gross", TURM[0] + 5.5, TURM[1] - 3.5)];
/* Schilf am Fluss */
for (let i = 0; i < 2000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 14; i++) { const y = wurf() * H, seite = wurf() < 0.5 ? -1 : 1, x = GX + flussX(y - GY) + seite * (6.6 + wurf() * 1.0);
  if (y < 1 || y > H - 1 || imFluss(x, y) || strecke(x, y, WEG) < 2) continue; dinge.push(o(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y)); }
/* dichter Grenzwald */
const baeume = [], gitter = new Map(), zelle = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
for (let i = 0; i < B * H * 1.1; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2), cx = Math.min(B - 1, Math.floor(x)), cy = Math.min(H - 1, Math.floor(y));
  if (g[cy][cx] !== "f" || strecke(x, y, WEG) < 2.8 || strecke(x, y, NORDWEG) < 2.4 || Math.abs(x - GX - flussX(y - GY)) < 8.5 || Math.hypot(x - TURM[0], y - TURM[1]) < 8) continue;
  let frei = true; for (let dj = -1; dj <= 1 && frei; dj++) for (let di = -1; di <= 1 && frei; di++) for (const p of gitter.get(zelle(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < 2.3) { frei = false; break; }
  if (!frei) continue; const p = { id: "b" + String(baeume.length + 1).padStart(4, "0"), objekt: BAUM[Math.floor(wurf() * BAUM.length)], x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) };
  baeume.push(p); gitter.set(zelle(x, y), [...(gitter.get(zelle(x, y)) || []), p]); }
/* Dornenwall quer über den Weg, Büsche dicht daneben */
for (let x = GX + 38; x <= GX + 56; x += 1.3) dinge.push(o(Math.abs(x - GX - 46.5) < 4 ? "k_hecke" : "stil_busch_02", x, DORN_Y + 0.4 * Math.sin(x), { id_: 1, ...(Math.abs(x - GX - 46.5) < 4 ? {} : { s: 0.85 }) }));
for (const d of dinge) delete d.id_;
dinge.filter((d) => d.objekt === "k_hecke").forEach((d, i) => { d.id = "dornenwall_" + (i + 1); });
const alle = [...dinge, ...baeume]; for (const p of alle) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
const lies = (id, x, y, text) => ({ id, art: "lesen", x, y, radius: 1.6, abgleich: "keiner", daten: { text } });
const spiel = { start: [[200, 31]], figuren: [], spawnzonen: [], ausgaenge: [],
  interaktionen: [lies("wachturm", TURM[0] + 0.5, TURM[1] + 3.4, "Ein eingestürzter Wachturm. Von hier sah man einst über den Fluss bis nach Graufurt."),
    lies("uferweg_nord", GX + 51.5, 46, "Der Uferweg biegt hier nach Westen ab. Nach Norden führt ein alter, zugewachsener Weg – nach Grauwacht."),
    { ...lies("dornenwall", GX + 46.5, DORN_Y + 2.2, "Ein Wall aus Dornen, mannshoch und dicht verflochten. Dahinter läuft der alte Weg nach Grauwacht weiter. Mit einer Axt ließe er sich roden."), radius: 2.2 }],
  kollision: { sperren: [{ art: "rechteck", x0: GX + 37, y0: DORN_Y - 1.2, x1: GX + 57, y1: DORN_Y + 0.6, schalter: "dornenwall_offen" }], freigeben: [] } };
const dir = join(WELT, "regionen", "nordsaum"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "nordsaum", name: "Der Nordsaum", untertitel: "Grenzwald im Norden, der Uferweg zum alten Friedhof", ursprung: [200, 198], chunks: [12, 2], biom: "wald", stufe: 2 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + alle.sort((a, b) => a.y - b.y).map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`nordsaum: ${B} × ${H} Felder, ${alle.length} Objekte`);
