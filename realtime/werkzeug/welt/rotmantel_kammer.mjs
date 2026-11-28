/*
 * World Pipeline – die Kammer des Anführers (Phase 4, 27.11.2026): Hauptmann Rotmantels Halle, ein eigenes Gebiet im Untergrund (1 Chunk,
 * Chunk 326|300, „ebene“: „untergrund“), damit das Spiel sie je Spieler als Instanz kopieren kann. Erreichbar aus der Vorkammer des Unterschlupfs.
 *   Runde Halle (Durchmesser ~22 Felder) mit Holzboden in der Mitte; Thron im Norden (Heilort: dort trinkt Rotmantel einmal),
 *   vier große Säulen weit genug vom Kampfplatz, dass der Rundumschlag (8 Felder um ihn) frei bleibt; Banner, Feuerkörbe, Beutetruhe.
 * Aufruf (im Ordner realtime): node werkzeug/welt/rotmantel_kammer.mjs     danach: node werkzeug/welt/bauen.mjs rotmantel_kammer
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

export const URSPRUNG = [326, 300], B = 32, H = 32, OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32;
const M = [16, 15.5];                                      /* Mitte der Halle, Kampfplatz */
export const THRON = [16, 6.6], EINGANG = [OX + 16, OY + 26.5];
/** Zurück in den Unterschlupf: Vorkammer (Weltfelder, wie unterschlupf.mjs) */
const VORKAMMER = [320 * 32 + 86, 300 * 32 + 32];
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 2.3 + y / 3.1) * 0.5 + Math.sin(y / 1.7 - x / 2.9) * 0.35;
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, d = Math.hypot(cx - M[0], (cy - M[1]) * 1.05);
  const gang = Math.abs(cx - 16) < 2 + 0.3 * welle(cx, cy) && cy > 24 && cy < 30;   /* Gang nach Süden zum Eingang */
  z.push(d < 6.5 ? "d" : d < 11 + 0.6 * welle(cx, cy) || gang ? "h" : "F"); } g.push(z); }
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|hoehle|moor|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const dinge = [o("hoehle_thron_01", THRON[0], THRON[1]), o("k_banner_rot", 12.5, 6.2), o("k_banner_rot", 19.5, 6.2),
  ...[[9.5, 9.5], [22.5, 9.5], [9.5, 21.5], [22.5, 21.5]].map(([x, y]) => o("k_saeule_gross", x, y)),
  ...[[13, 7.6], [19, 7.6], [7, 15.5], [25, 15.5], [12.5, 24], [19.5, 24]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
  o("hoehle_truhe_01", 23.6, 12.6), o("k_faesser", 8.6, 12.4), o("hoehle_tisch_01", 24, 19)];
for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("im Fels: " + p.id); }
const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[EINGANG[0] - OX, EINGANG[1] - OY]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
  interaktionen: [lies("kammer_ausgang", 16, 28.4, "Der Gang zurück in die Vorkammer.", { tat: "kammer_zurueck", knopf: "Zurück in die Vorkammer", ziel: VORKAMMER }),
    lies("thron", THRON[0], THRON[1] + 1.8, "Der Stuhl des Anführers, aus Fässern und Schilden gezimmert. Dahinter hängt das rote Banner der Bande.")] };
/* nur beim Aufruf als Werkzeug schreiben (unterschlupf.mjs und Tests importieren die Maße) */
if (process.argv[1] && process.argv[1].endsWith("rotmantel_kammer.mjs")) {
const dir = join(WELT, "regionen", "rotmantel_kammer"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "rotmantel_kammer", name: "Die Kammer des Anführers", untertitel: "Hauptmann Rotmantel", ursprung: URSPRUNG, chunks: [1, 1], biom: "hoehle", stufe: 5, ebene: "untergrund" }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`rotmantel_kammer: ${B} × ${H} Felder, ${dinge.length} Dinge`);
}
