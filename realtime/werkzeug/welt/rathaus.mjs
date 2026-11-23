/*
 * World Pipeline – das Obergeschoss des Rathauses der Waldmark (Ratssaal, 22.11.2026).
 * Wie der Unterschlupf ein eigenes Gebiet abseits der Oberwelt (Chunk 234|230, „ebene“: „innen“): ein Raum so groß wie das Rathaus
 * (8,8 × 6,8 Felder), ringsum Leere. Unten im Rathaus führt die Treppe hinauf, oben dieselbe Treppe wieder hinunter –
 * die Welt versetzt den Helden ohne Szenenwechsel (wie Loch und Leiter).
 * Aufruf (im Ordner realtime): node werkzeug/welt/rathaus.mjs     danach: node werkzeug/welt/bauen.mjs rathaus_oben
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

export const URSPRUNG = [234, 230], OX = URSPRUNG[0] * 32, OY = URSPRUNG[1] * 32, FUSS = [16.5, 21];
/** Rathaus unten (Waldmark, Weltfelder): Fuß und Treppe; oben: wo man ankommt */
const UNTEN_FUSS = [200 * 32 + 39.5, 200 * 32 + 27], TREPPE = [-3.3, 5.4];
export const UNTEN_TREPPE = [UNTEN_FUSS[0] + TREPPE[0], UNTEN_FUSS[1] - TREPPE[1] + 1.8];          /* am Fuß der Treppe (Lesestelle) */
export const UNTEN = [UNTEN_FUSS[0] + TREPPE[0] + 0.1, UNTEN_FUSS[1] - TREPPE[1] + 2.9];             /* hier kommt man unten an */
export const OBEN = [OX + FUSS[0] + TREPPE[0] + 0.1, OY + FUSS[1] - TREPPE[1] + 2.9];               /* hier kommt man oben an */
const OBEN_TREPPE = [FUSS[0] + TREPPE[0], FUSS[1] - TREPPE[1] + 1.8];

if (process.argv[1] && process.argv[1].endsWith("rathaus.mjs")) {
  const g = []; for (let y = 0; y < 32; y++) { let z = ""; for (let x = 0; x < 32; x++) z += x >= 12 && x < 21 && y >= 14 && y < 21 ? "d" : "X"; g.push(z); }
  const dinge = [{ id: "rathaus_oben", objekt: "waldmark_rathaus_oben_01", x: FUSS[0], y: FUSS[1] }];
  const spiel = { start: [[OBEN[0] - OX, OBEN[1] - OY]], figuren: [], spawnzonen: [],
    interaktionen: [{ id: "treppe_runter", art: "eingang", x: OBEN_TREPPE[0], y: OBEN_TREPPE[1], radius: 1.3, abgleich: "keiner",
      daten: { text: "Die Treppe führt hinunter in die Halle des Rathauses.", tat: "abstieg", knopf: "Die Treppe hinuntergehen", ziel: UNTEN } },
      { id: "ratstafel", art: "lesen", x: FUSS[0] + 0.3, y: FUSS[1] - 1.6, radius: 1.6, abgleich: "keiner", daten: { text: "Die Ratstafel der Waldmark. Hier beraten die Ältesten über Wege, Wachen und die Gefahren im Kreuzwald." } }],
    ausgaenge: [], kollision: { sperren: [], freigeben: [] } };
  const dir = join(WELT, "regionen", "rathaus_oben"); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "rathaus_oben", name: "Der Ratssaal", untertitel: "Obergeschoss des Rathauses der Waldmark", ursprung: URSPRUNG, chunks: [1, 1], biom: "innen", stufe: 1, ebene: "innen" }, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), g.join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log("rathaus_oben: Ratssaal 8,8 × 6,8 Felder, Treppe hinunter →", UNTEN.map((v) => v.toFixed(1)).join("|"));
}
