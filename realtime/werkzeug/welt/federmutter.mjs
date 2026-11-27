/*
 * World Pipeline – Kammer der Federmutter (#132, 27.11.2026): kleiner Raum unter dem großen Steinkreis auf Aschenwerth für die Solo-Quest-Fassung von C2
 * (Boss-Regel #116: in Quests allein, in einer eigenen Kopie). Eigenes Gebiet (1 Chunk, Untergrund, Chunk 360|300), als Instanz kopierbar.
 * Vorhandenes wiederverwendet (wie der Thronsaal im Rabengrund): runder Raum mit Felswänden, Steinsäulen als Deckung, Federn, Feuerkörbe,
 * Spiralsteine (Menhire) im Kreis wie oben, die Leiter hinauf. Einstieg: Lesestelle „federmutter_abstieg“ im Steinkreis (aschenwerth.mjs).
 * Aufruf (im Ordner realtime): node werkzeug/welt/federmutter.mjs     danach: node werkzeug/welt/bauen.mjs federmutter_kammer
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

export const URSPRUNG = [360, 300], B = 32, H = 32, OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32;
const M = [16, 14];
export const EINGANG = [OX + 16, OY + 25.5];
export const OBEN = [6242, 6728.4];   /* im Steinkreis auf Aschenwerth, nördlich des Schreins */
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 2.3 + y / 3.1) * 0.5 + Math.sin(y / 1.7 - x / 2.9) * 0.35;
if (process.argv[1] && process.argv[1].endsWith("federmutter.mjs")) {
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, d = Math.hypot(cx - M[0], (cy - M[1]) * 1.1);
    z.push(d < 10 + 0.6 * welle(cx, cy) || (Math.abs(cx - 16) < 2 + 0.3 * welle(cx, cy) && cy > 20 && cy < 29) ? "h" : "F"); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(hoehle|moor|k|wz)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const SPIRAL = [0, 1, 2, 3, 4].map((i) => { const w = (i / 5) * Math.PI * 2 - Math.PI / 2; return [M[0] + Math.cos(w) * 8, M[1] + Math.sin(w) * 7]; });
  const dinge = [o("hoehle_leiter_01", 16, 27.4), ...SPIRAL.map(([x, y], i) => o(i % 2 ? "moor_menhir_01" : "moor_menhir_02", x, y, i % 2 ? { spiegeln: true } : {})),
    ...[[11, 11], [21, 11], [12, 18], [20, 18]].map(([x, y]) => o("hoehle_steinsaeule_01", x, y)), o("k_altar_stein", 16, 6.4),
    ...[[8, 14], [24, 14], [13, 22.5], [19, 22.5]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
    ...[[14, 12], [18, 16], [10, 15], [22, 16], [16, 9], [15, 20]].map(([x, y], i) => o("hoehle_federn_01", x, y, i % 2 ? { spiegeln: true } : {}))];
  const WAND = []; for (let i = 0; i < 18; i++) { const w = (i / 18) * Math.PI * 2, r = 10.8; const x = M[0] + Math.cos(w) * r, y = M[1] + Math.sin(w) * r / 1.1; if (y > 19) continue; WAND.push(o("hoehle_felswand_01", x, y + 0.5, i % 2 ? { spiegeln: true } : {})); }
  for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error("im Fels: " + p.id); }
  const alle = [...dinge, ...WAND.filter((p) => p.x > 0.5 && p.y > 0.5 && p.x < B - 0.5 && p.y < H - 0.5)];
  const lies = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
  const spiel = { start: [[EINGANG[0] - OX, EINGANG[1] - OY]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [lies("federmutter_hinauf", 16, 28.6, "Die Leiter hinauf in den Steinkreis.", { tat: "federmutter_hinauf", knopf: "Hinaufsteigen", ziel: OBEN }),
      lies("federmutter_nest", 16, 8, "Ein Nest aus schwarzen Federn und Knochen. Hier wartet die Federmutter.", { questobjekt: "federmutter_nest" })] };
  const dir = join(WELT, "regionen", "federmutter_kammer"); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "federmutter_kammer", name: "Die Kammer unter dem Steinkreis", untertitel: "Federmutter Ravena (Instanz)", ursprung: URSPRUNG, chunks: [1, 1], biom: "hoehle", stufe: 7, ebene: "untergrund" }, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + alle.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`federmutter_kammer: ${B} × ${H} Felder, ${alle.length} Dinge`); }
