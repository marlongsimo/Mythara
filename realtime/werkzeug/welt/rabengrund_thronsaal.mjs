/*
 * World Pipeline – Thronsaal im Rabengrund (Phase 6, 27.11.2026): Halle des Obersten Rabenpriesters, ein eigenes Gebiet (1 Chunk, Chunk 336|300,
 * Untergrund), damit das Spiel sie je Spieler als Instanz kopieren kann. Erreichbar durch das Tor am Splitterbecken.
 *   Runde Halle (Durchmesser ~24 Felder), in der Mitte ein Splitterbecken (r 3), um das der Priester schwebt; vier Säulen als Deckung im Ring
 *   zwischen Becken und Wand, ein Thron aus Stein im Norden, Splitter-Obelisken, Federn.
 * Aufruf (im Ordner realtime): node werkzeug/welt/rabengrund_thronsaal.mjs     danach: node werkzeug/welt/bauen.mjs rabengrund_thronsaal
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

export const URSPRUNG = [336, 300], B = 32, H = 32, OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32;
const M = [16, 15];
export const EINGANG = [OX + 16, OY + 28.5];
const ZURUECK = [330 * 32 + 113, 300 * 32 + 62];   /* vor dem Tor am Splitterbecken (rabengrund.mjs) */
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 2.3 + y / 3.1) * 0.5 + Math.sin(y / 1.7 - x / 2.9) * 0.35;
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, d = Math.hypot(cx - M[0], cy - M[1]);
  const gang = Math.abs(cx - 16) < 2 + 0.3 * welle(cx, cy) && cy > 24 && cy < 31;
  z.push(d < 3.0 ? "o" : d < 12 + 0.6 * welle(cx, cy) || gang ? "h" : "F"); } g.push(z); }
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|hoehle|moor|k|wz)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
export const SAEULEN = [[10, 9], [22, 9], [10, 21], [22, 21]];
const dinge = [o("k_altar_stein", 16, 5.2), ...SAEULEN.map(([x, y]) => o("k_saeule_gross", x, y)),
  ...[[16, 10.6], [20.4, 15], [16, 19.4], [11.6, 15]].map(([x, y]) => o("wz_splitter_obelisk", x, y)),
  ...[[6, 12], [26, 12], [7, 20], [25, 20], [13, 25], [19, 25]].map(([x, y], i) => o("hoehle_federn_01", x, y, i % 2 ? { spiegeln: true } : {})),
  o("moor_feuerkorb_01", 12.6, 24.2), o("moor_feuerkorb_01", 19.4, 24.2)];
for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("im Fels: " + p.id); }
const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[EINGANG[0] - OX, EINGANG[1] - OY]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
  interaktionen: [lies("thronsaal_ausgang", 16, 30, "Das Tor zurück zum Splitterbecken.", { tat: "thronsaal_zurueck", knopf: "Zurück zum Splitterbecken", ziel: ZURUECK })] };
const dir = join(WELT, "regionen", "rabengrund_thronsaal"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "rabengrund_thronsaal", name: "Der Thronsaal", untertitel: "Der Oberste Rabenpriester", ursprung: URSPRUNG, chunks: [1, 1], biom: "hoehle", stufe: 8, ebene: "untergrund" }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`rabengrund_thronsaal: ${B} × ${H} Felder, ${dinge.length} Dinge`);
