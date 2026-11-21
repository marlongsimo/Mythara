/*
 * World Pipeline – der Unterschlupf: Hauptquartier der Banditen unter der verlassenen Hütte in der Westmark (Untergrund, 21.11.2026).
 * Ein eigenes Gebiet aus gleich großen Chunks, aber abseits der Oberwelt (Chunk 230|230, „ebene“: „untergrund“) – man erreicht es nur
 * durch das Loch im Boden der Hütte (die Welt versetzt den Helden ohne Szenenwechsel) und kommt über die Leiter wieder hinauf.
 * Sechs Räume, durch Gänge verbunden, aus dem Fels gehauen:
 *   1 Einstieg (Leiter)   2 Wachstube   3 Schlafsaal   4 Beutelager   5 Versammlungshalle (Mehrkampf)   6 Kammer des Anführers
 * Die Banditen sind echte Gegner der offenen Welt (werkzeug/weltzonen.py → Karte „unterschlupf“).
 * Aufruf (im Ordner realtime): node werkzeug/welt/unterschlupf.mjs     danach: node werkzeug/welt/bauen.mjs unterschlupf
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

export const URSPRUNG = [230, 230], B = 96, H = 64, OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32;
/** Wo man in der Hütte ankommt (Weltfelder) und wo unten an der Leiter */
export const OBEN = [196 * 32 + 30.4, 202 * 32 + 118.9], UNTEN = [OX + 12, OY + 31];
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 2.3 + y / 3.1) * 0.6 + Math.sin(y / 1.7 - x / 2.9) * 0.4;

/* Räume: [x0, y0, x1, y1, Boden] in Feldern des Gebiets */
export const RAEUME = {
  einstieg: [6, 26, 18, 37, "h"], wache: [25, 23, 41, 40, "d"], schlaf: [25, 4, 45, 16, "h"],
  lager: [25, 48, 41, 60, "h"], halle: [50, 16, 75, 47, "h"], anfuehrer: [81, 24, 92, 40, "d"] };
const GAENGE = [[[18, 32], [25, 32]], [[33, 23], [34, 16]], [[33, 40], [33, 48]], [[41, 31], [50, 31.5]], [[75, 32], [81, 32]]];
const imRaum = (x, y) => { for (const [x0, y0, x1, y1, b] of Object.values(RAEUME)) { const r = 0.9 * welle(x, y); if (x > x0 - r && x < x1 + r && y > y0 - r && y < y1 + r) return b; } return null; };
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5;
  z.push(imRaum(cx, cy) || (GAENGE.some((p) => strecke(cx, cy, p) < 1.6 + 0.3 * welle(cx, cy)) ? "h" : "F")); } g.push(z); }

let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|hoehle|moor|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const R = RAEUME, dinge = [
  /* 1 Einstieg */ o("hoehle_leiter_01", 12, 27.4), o("k_kiste", 8, 35.6), o("k_kiste", 9.2, 36.2), o("moor_feuerkorb_01", 16.6, 28.4),
  /* 2 Wachstube */ o("hoehle_tisch_01", 33, 30), o("k_faesser", 27, 25.4), o("dorf_fass_01", 39.6, 25), o("dorf_bank_01", 33, 32.6), o("moor_feuerkorb_01", 26.4, 38.4), o("moor_feuerkorb_01", 39.6, 38.4),
  /* 3 Schlafsaal */ ...[[28, 7], [33, 6.6], [38, 7], [43, 7.4], [29, 13], [41, 13.4]].map(([x, y]) => o("hoehle_lager_01", x, y)), o("moor_feuerkorb_01", 35, 14.6),
  /* 4 Beutelager */ o("hoehle_truhe_01", 33, 57.6), o("k_kiste", 27, 50.4), o("k_kiste", 28.2, 51), o("k_faesser", 38.8, 50.6), o("k_flaschenzug", 39, 57), o("dorf_heuballen_01", 27.4, 57.6), o("k_karren", 30, 54.4),
  /* 5 Versammlungshalle */ o("dorf_festfeuer_01", 62.5, 32), o("k_banner_rot", 58, 17.6), o("k_banner_rot", 67, 17.6), ...[[52, 19], [73, 19], [52, 45], [73, 45]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
    o("dorf_bank_01", 58.5, 29.4), o("dorf_bank_01", 66.5, 29.4), o("dorf_bank_01", 58.5, 35.6), o("dorf_bank_01", 66.5, 35.6), o("k_faesser", 52.6, 26), o("k_kiste", 72.8, 40.4),
  /* 6 Kammer des Anführers */ o("hoehle_thron_01", 86.5, 26.4), o("hoehle_truhe_01", 90.6, 38.4), o("hoehle_tisch_01", 85, 34), o("moor_feuerkorb_01", 82.6, 26), o("moor_feuerkorb_01", 90.6, 26)];
for (const p of dinge) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
for (const p of dinge) if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("im Fels: " + p.id);

/** Banditen (Weltfelder, für werkzeug/weltzonen.py): Wache 2, Schlafsaal 2, Lager 1, Halle 3, Anführer 1 */
export const LAGER = [[30, 35], [37, 26], [30, 10], [40, 10], [35, 54], [57, 25], [68, 38], [62, 42], [86, 30]].map(([x, y]) => ["bandit_dolch", OX + x, OY + y]);
export const MEHRKAMPF = [[OX + R.halle[0], OY + R.halle[1], OX + R.halle[2], OY + R.halle[3]]];

const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.5, abgleich: "keiner", daten: { text, ...mehr } });
const spiel = { start: [[UNTEN[0] - OX, UNTEN[1] - OY]], figuren: [], spawnzonen: [],
  interaktionen: [lies("leiter", 12, 30.2, "Die Leiter führt hinauf in die verlassene Hütte.", { tat: "aufstieg", knopf: "Die Leiter hinaufsteigen", ziel: OBEN }),
    lies("karte_tisch", 33, 31, "Auf dem Tisch liegt eine Karte der Westmark. Der Steinweg ist rot markiert – und Weidenhain mit einem Kreuz."),
    lies("beute", 33, 58.6, "Eine Truhe voller Beute: Münzen, ein silberner Kerzenleuchter, Stoffballen aus Graufurt."),
    lies("anfuehrer", 86.5, 28, "Der Stuhl des Anführers. Dahinter hängt das rote Banner der Bande.")],
  ausgaenge: [], kollision: { sperren: [], freigeben: [] } };
const dir = join(WELT, "regionen", "unterschlupf"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "unterschlupf", name: "Der Unterschlupf", untertitel: "Hauptquartier der Banditen", ursprung: URSPRUNG, chunks: [B / 32, H / 32], biom: "hoehle", stufe: 4, ebene: "untergrund" }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.sort((a, b) => a.y - b.y).map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`unterschlupf: ${B} × ${H} Felder, 6 Räume, ${dinge.length} Dinge, ${LAGER.length} Banditen`);
