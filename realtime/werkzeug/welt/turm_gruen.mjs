/*
 * World Pipeline – der Turm mit dem grünen Licht, innen (Phase 7 vorab, 27.11.2026): vier Gebiete der Ebene „innen“ (je 1 Chunk, Chunks 340–343|300):
 *   turm_ebene1 (Eingang, Wachstube), turm_ebene2 (Rüstkammer), turm_ebene3 (Wächterstube mit dem Wächterbuch), turm_dach (Signalfeuer, Zinnen).
 * Treppen verbinden sie (Interaktionen mit „ziel“, wie Rathaus und Unterschlupf); unten führt die Wappentür hinaus ans Ostufer.
 * Jede Ebene ist ein runder Steinraum (r 6), groß genug für Kämpfe mit Turmwächtern. Als Instanz kopierbar, falls der Turmkampf eine wird.
 * Aufruf (im Ordner realtime): node werkzeug/welt/turm_gruen.mjs     danach: node werkzeug/welt/bauen.mjs turm_ebene1 turm_ebene2 turm_ebene3 turm_dach
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const C = 32, M = [16, 16], R = 6.2;
const AUSSEN = [212 * C + 56, 200 * C + 120.2];                         /* vor der Wappentür am Ostufer (ostufer.mjs: TURM 56|118) */
const EBENEN = [["turm_ebene1", 340, "Der Turm – Wachstube", "Ebene 1"], ["turm_ebene2", 341, "Der Turm – Rüstkammer", "Ebene 2"], ["turm_ebene3", 342, "Der Turm – Wächterstube", "Ebene 3"], ["turm_dach", 343, "Das Turmdach", "Signalfeuer"]];
const welt = (i, x, y) => [EBENEN[i][1] * C + x, 300 * C + y];
const AUF = [20.5, 12.5], AB = [11.5, 19.5];                             /* Treppe hinauf (Nordost) und hinunter (Südwest) */
export const TURM_EINGANG = welt(0, 16, 20.6);
if (process.argv[1] && process.argv[1].endsWith("turm_gruen.mjs")) {
  const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
  EBENEN.forEach(([id, cx, name, untertitel], i) => {
    const dach = id === "turm_dach";
    const g = []; for (let y = 0; y < C; y++) { let z = ""; for (let x = 0; x < C; x++) { const d = Math.hypot(x + 0.5 - M[0], y + 0.5 - M[1]); z += d < R ? (dach ? "h" : "d") : d < R + 1.4 ? "h" : "X"; } g.push(z); }
    let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|hoehle|moor|k|turm|stil)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x, y, ...mehr });
    const dinge = [o("hoehle_steinsaeule_01", 16, 10.2), o("moor_feuerkorb_01", 11, 13), o("moor_feuerkorb_01", 21, 19)];
    if (i === 0) dinge.push(o("hoehle_tisch_01", 18.5, 17.5), o("dorf_fass_01", 12.5, 15.5), o("k_banner_rot", 16, 10.8));
    if (i === 1) dinge.push(o("k_kiste", 12, 15), o("k_kiste", 12.8, 15.6), o("k_faesser", 20.5, 17.2), o("hoehle_truhe_01", 13.5, 19));
    if (i === 2) dinge.push(o("hoehle_tisch_01", 16, 15), o("hoehle_lager_01", 20, 18), o("k_kiste", 12.5, 17));
    if (dach) { dinge.length = 0; dinge.push(o("turm_signalfeuer_01", 16, 15.4));
      for (let k = 0; k < 10; k++) { const w = (k / 10) * Math.PI * 2; if (Math.abs(Math.cos(w)) > 0.92 && Math.sin(w) > 0) continue; dinge.push(o("k_ruine_halbmauer", +(16 + Math.cos(w) * 6.9).toFixed(2), +(16.8 + Math.sin(w) * 6.9).toFixed(2))); } }
    for (const p of dinge) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
    const I = []; const lies = (iid, x, y, text, mehr = {}) => I.push({ id: iid, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 1.5 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
    if (i === 0) lies("turm_tuer_hinaus", 16, 21.4, "Die Tür mit dem Wappen führt hinaus ans Ostufer.", { tat: "turm_hinaus", knopf: "Den Turm verlassen", ziel: AUSSEN });
    if (i < 3) lies("treppe_hinauf", AUF[0], AUF[1], "Eine Wendeltreppe aus Stein führt nach oben.", { tat: "turm_hinauf", knopf: "Die Treppe hinaufsteigen", ziel: welt(i + 1, AB[0] + 1.2, AB[1] - 1.2) });
    if (i > 0) lies("treppe_hinunter", AB[0], AB[1], "Die Wendeltreppe führt nach unten.", { tat: "turm_hinunter", knopf: "Die Treppe hinuntergehen", ziel: welt(i - 1, AUF[0] - 1.2, AUF[1] + 1.2) });
    if (i === 2) lies("waechterbuch", 16, 16.4, "Das Wächterbuch der Wacht. Die letzten Einträge sind in Eile geschrieben: „Kein Zeichen aus Grauwacht. Wir halten das Feuer am Brennen.“");
    if (dach) lies("signalfeuer", 16, 17.2, "Das Signalfeuer brennt grün aus einem Splitterkern. Es soll Grauwacht rufen – aber niemand antwortet.");
    const start = i === 0 ? [16, 20.6] : [AB[0] + 1.2, AB[1] - 1.2];
    const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "region.json"), JSON.stringify({ id, name, untertitel, ursprung: [cx, 300], chunks: [1, 1], biom: "innen", stufe: 3, ebene: "innen" }, null, 1) + "\n");
    writeFileSync(join(dir, "gelaende.txt"), g.join("\n") + "\n");
    writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
    writeFileSync(join(dir, "spiel.json"), JSON.stringify({ start: [start], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] }, interaktionen: I }, null, 1) + "\n");
    console.log(`${id}: ${dinge.length} Dinge, ${I.length} Interaktionen`); });
}
