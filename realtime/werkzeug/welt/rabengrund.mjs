/*
 * World Pipeline – Rabengrund (Phase 6, 27.11.2026): der Dungeon unter der Gruft von Aschenwerth. Untergrund, Chunk 330|300, 4 × 3 Chunks.
 *   1 Einstieg (Treppe aus der Gruft)  2 Federgänge (gewundene Gänge mit drei Nischen für Rabenschwärme und Akoluthen)
 *   3 Kerker (vier Käfige, Ecke des Kerkermeisters)  4 Splitterbecken (runde Halle, Becken in der Mitte, Splitterkristalle)
 *   Vom Splitterbecken führt ein Durchgang in den Thronsaal – ein eigenes Gebiet (rabengrund_thronsaal.mjs), als Instanz kopierbar.
 * Stimmung: dunkler Stein, wenige Feuerkörbe, violettes Splitterlicht (Splitter-Obelisken), Federn am Boden.
 * Aufruf (im Ordner realtime): node werkzeug/welt/rabengrund.mjs     danach: node werkzeug/welt/bauen.mjs rabengrund
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
import { EINGANG as THRON_EINGANG } from "./rabengrund_thronsaal.mjs";

export const URSPRUNG = [330, 300], B = 128, H = 96, OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32;
/** Unten an der Treppe (Weltfelder) und oben vor der Gruft in Aschenwerth */
export const UNTEN = [OX + 12, OY + 50], OBEN = [6188, 6727.6];
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 2.3 + y / 3.1) * 0.6 + Math.sin(y / 1.7 - x / 2.9) * 0.4;

/* Räume (Gebietsfelder) */
export const EINSTIEG = [6, 42, 18, 56], KERKER = [70, 6, 100, 26], BECKEN = { x: 92, y: 62, r: 14 };
const NISCHEN = [[36, 34, 6], [60, 32, 6.5], [46, 70, 6]];
const GAENGE = [[[18, 49], [28, 48], [36, 34], [48, 28], [60, 32], [66, 44], [56, 58], [46, 70], [60, 76], [78, 66]], [[60, 32], [72, 26]], [[86, 26], [88, 40], [90, 48]], [[105, 62], [116, 62]]];
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c = "F";
  const inR = ([x0, y0, x1, y1]) => cx > x0 - 0.8 * w && cx < x1 + 0.8 * w && cy > y0 - 0.8 * w && cy < y1 + 0.8 * w;
  if (inR(EINSTIEG) || inR(KERKER)) c = "h";
  else if (Math.hypot(cx - BECKEN.x, cy - BECKEN.y) < BECKEN.r + 0.8 * w) c = Math.hypot(cx - BECKEN.x, cy - BECKEN.y) < 4.2 ? "o" : "h";
  else if (NISCHEN.some(([nx, ny, r]) => Math.hypot(cx - nx, cy - ny) < r + 0.8 * w)) c = "h";
  else if (GAENGE.some((p) => strecke(cx, cy, p) < 1.9 + 0.4 * w)) c = "h";
  z.push(c); } g.push(z); }
/* Kerker: Mauer mit Durchgang zwischen Käfigreihe und Gang ist nicht nötig – die Käfige stehen an der Nordwand */

let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|hoehle|moor|k|wz)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
export const KAEFIGE = [[75, 9.6], [81, 9.6], [87, 9.6], [93, 9.6]];
const dinge = [
  /* 1 Einstieg */ o("hoehle_leiter_01", 12, 43.4), o("moor_feuerkorb_01", 16.6, 44.4), o("hoehle_federn_01", 9, 52),
  /* 2 Federgänge: Federn, wenige Feuerkörbe, Knochen und Trümmer */
  ...[[24, 48.5], [33, 38], [38, 31.5], [52, 29], [63, 36], [64, 46], [52, 61], [44, 67.5], [50, 73], [62, 75], [72, 69]].map(([x, y], i) => o("hoehle_federn_01", x, y, i % 2 ? { spiegeln: true } : {})),
  o("moor_feuerkorb_01", 36, 38.6), o("moor_feuerkorb_01", 60, 36.8), o("moor_feuerkorb_01", 46, 74.4), o("k_truemmer", 33.6, 31.6), o("k_truemmer", 63.6, 28.6), o("k_truemmer", 41.6, 72.4, { spiegeln: true }),
  /* 3 Kerker */ ...KAEFIGE.map(([x, y]) => o("hoehle_kaefig_01", x, y)), o("hoehle_tisch_01", 95.5, 21.6), o("k_faesser", 98, 17.6), o("moor_feuerkorb_01", 72.6, 22.6), o("moor_feuerkorb_01", 97.6, 24.4),
  o("hoehle_federn_01", 84, 18), o("hoehle_federn_01", 78, 22, { spiegeln: true }),
  /* 4 Splitterbecken: Splitter-Obelisken im Kreis, Federn */
  ...[0, 1, 2, 3, 4, 5].map((i) => { const w = (i / 6) * Math.PI * 2 + 0.5; return o("wz_splitter_obelisk", BECKEN.x + Math.cos(w) * 8.6, BECKEN.y + Math.sin(w) * 8.6); }),
  o("hoehle_federn_01", 84, 70), o("hoehle_federn_01", 100, 55, { spiegeln: true }), o("moor_feuerkorb_01", 104, 58.6), o("moor_feuerkorb_01", 104, 66.6)];
for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("im Fels: " + p.id); }

const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[UNTEN[0] - OX, UNTEN[1] - OY]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
  interaktionen: [lies("treppe_hinauf", 12, 46.2, "Die ausgetretenen Stufen führen hinauf in die Gruft.", { tat: "aufstieg", knopf: "Hinauf in die Gruft", ziel: OBEN }),
    lies("kerker", 85, 16, "Vier Käfige an der Wand. In einem hockt jemand und hebt den Kopf, als du näher kommst."),
    lies("splitterbecken", BECKEN.x, BECKEN.y + 5.2, "Das Becken ist voll von etwas, das wie Wasser aussieht, aber violett leuchtet. Die Splitter am Rand summen leise."),
    lies("thronsaal_tor", 115, 62, "Ein hohes Tor aus schwarzem Holz, mit Federn behängt. Dahinter: der Thronsaal.", { tat: "thronsaal", knopf: "Den Thronsaal betreten", ziel: THRON_EINGANG })] };
const dir = join(WELT, "regionen", "rabengrund"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "rabengrund", name: "Rabengrund", untertitel: "Unter der Gruft von Aschenwerth", ursprung: URSPRUNG, chunks: [B / 32, H / 32], biom: "hoehle", stufe: 7, ebene: "untergrund" }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`rabengrund: ${B} × ${H} Felder, ${dinge.length} Dinge`);
