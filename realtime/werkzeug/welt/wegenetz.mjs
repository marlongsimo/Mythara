/*
 * World Pipeline – Wegenetz (#89, 27.11.2026): Wege zwischen allen Städten und Dörfern, Brücken, Wegweiser an Kreuzungen, Rastplätze.
 *   Wegklassen: „k“ gepflasterte Straße zwischen Großstädten, „e“ Feldweg zu Dörfern, schmaler „e“-Pfad in die Wildnis.
 *   Was auf dem Festland liegt, kommt in den Plan welt/festland/plan_wegenetz.json (festland.py, zuletzt angewandt – schließt Lücken an Ortsrändern);
 *   was in alten Gebieten liegt, in welt/orte_wegenetz.json (orte.mjs). Wegweiser sind Objekte mit einer Lesestelle („Nach Graufurt →“).
 * Aufruf (im Ordner realtime): node werkzeug/welt/wegenetz.mjs  – vor festland.py und orte.mjs. Test: test/welt-wegenetz.test.mjs
 */
import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const C = 32, ALT = new Map();
for (const n of readdirSync(join(WELT, "regionen"))) { const r = JSON.parse(readFileSync(join(WELT, "regionen", n, "region.json"), "utf8")); if (r.ebene || r.entwurf) continue;
  ALT.set(n, { alt: !r.nahtlos, x0: r.ursprung[0] * C, y0: r.ursprung[1] * C, b: r.chunks[0] * C, h: r.chunks[1] * C, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const gebiet = (x, y) => [...ALT.values()].find((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h);
const zeichen = (x, y) => { const g = gebiet(x, y); return g ? g.z[Math.floor(y) - g.y0][Math.floor(x) - g.x0] : "?"; };
const aufAlt = (x, y) => gebiet(x, y)?.alt ?? false;

/* Orte (Mitte, für Wegweiser-Richtungen) */
export const ORTE = { Waldmark: [6448, 6434], Weidenhain: [6444, 6716], Osthof: [6522, 6436], Rabenmoor: [6328, 6722], Graufurt: [6689, 6513], Ostufer: [6840, 6520], Glutbrunn: [7160, 6950],
  Heidrast: [6596, 5872], Grauwacht: [6706, 5748], Kielmund: [6426, 7314], "Möwenbucht": [6214, 7160], Leuchtturm: [6176, 7036], "Hügelgräber": [6462, 5770], Aschenwerth: [6216, 6716],
  Heckenhof: [6490, 6812], Summweide: [6418, 6904], Schilfsee: [6450, 7188], Erlengrund: [6392, 7004], Lehmfurt: [6466, 7244], "Kräuterhof": [6418, 7064] };

/* Wege: [Punkte, Klasse, Breite] */
const WEGE = [
  /* Graufurt ↔ Glutbrunn (Straße): vom Westtor nach Süden, Brücke über den grauen Fluss, am Nordufer des Stroms nach Osten */
  { name: "Glutstraße (Graufurt → Glutbrunn)", punkte: [[6662, 6512], [6660, 6560], [6659, 6640], [6660, 6720], [6662, 6740], [6662, 6762], [6684, 6776], [6716, 6788]], z: "k", b: 2.2 },
  { name: "Glutstraße, Ostteil", punkte: [[6758, 6790], [6800, 6842], [6880, 6876], [6960, 6900], [7040, 6920], [7104, 6938], [7128, 6942]], z: "k", b: 2.2 },
  /* Anschlüsse an Ortsränder, die Ortspläne überdeckt hatten */
  { name: "Südstraße in Kielmund", punkte: [[6462, 7230], [6450, 7270], [6436, 7292], [6426, 7300]], z: "k", b: 2.2 },
  { name: "Weg vom Pass nach Glutbrunn", punkte: [[6918, 6739], [6914, 6742], [6950, 6800], [6996, 6860], [7050, 6905], [7110, 6935], [7130, 6941], [7150, 6946]], z: "e", b: 1.8 },   /* über das trockene Kanalbett */
  { name: "Heidrast: Nordsaum-Weg zum Dorfplatz", punkte: [[6604, 5904], [6600, 5890], [6597, 5876]], z: "k", b: 2.0 },
  { name: "Heidrast: Straße nach Grauwacht", punkte: [[6597, 5874], [6606, 5864], [6624, 5846]], z: "k", b: 2.0 },
  { name: "Heidrast: Weg zu den Hügelgräbern", punkte: [[6596, 5874], [6584, 5872], [6560, 5860]], z: "e", b: 1.8 },
  { name: "Nordsaum-Weg durch den Grenzposten", punkte: [[6662, 6182], [6648, 6124], [6644, 6100], [6640, 6064]], z: "k", b: 2.2 },
  /* Kielmund ↔ Möwenbucht (über die Kielbrücke), Pfade zu Leuchtturm und Wrack */
  { name: "Küstenweg (Kielmund → Möwenbucht)", punkte: [[6372, 7300], [6340, 7272], [6300, 7236], [6262, 7196], [6230, 7168]], z: "e", b: 1.8 },
  { name: "Pfad zum Leuchtturm", punkte: [[6230, 7168], [6226, 7158], [6214, 7120], [6196, 7072], [6184, 7046]], z: "e", b: 1.2 },
  { name: "Pfad zum Wrack", punkte: [[6292, 7228], [6286, 7250]], z: "e", b: 1.2 },
];

/* ───── Brücken: wo ein Weg Wasser kreuzt (Fluss), Brückenstück + Freigabe ───── */
const objekte = [], interaktionen = [], freigeben = [], wegeAlt = [], objekteAlt = [], interaktionenAlt = [], feld = new Map();
let n = 0;
const bruecke = (x0, x1, y, id) => { for (let x = x0 + 4.9, i = 1; x < x1 + 3; x += 7.9, i++) objekte.push({ id: `${id}_${i}`, objekt: "dorf_bruecke_01", x: +x.toFixed(2), y: +(y + 1.3).toFixed(2) });
  freigeben.push({ art: "rechteck", x0: +(x0 - 0.5).toFixed(2), y0: +(y - 1.3).toFixed(2), x1: +(x1 + 0.5).toFixed(2), y1: +(y + 1.3).toFixed(2) }); };
{ /* Glutstraße über den grauen Fluss bei y ≈ 6789: Wasserbreite messen */
  const y = 6789; let a = 6700; while (!"~".includes(zeichen(a, y + 0.5)) && a < 6800) a++; let b = a; while ("~".includes(zeichen(b, y + 0.5))) b++;
  bruecke(a - 1, b + 1, y, "glutstrasse_bruecke"); WEGE.push({ name: "Brückenkopf West", punkte: [[6716, 6788], [a - 1, y]], z: "k", b: 2.2 }, { name: "Brückenkopf Ost", punkte: [[b + 1, y], [6758, 6790]], z: "k", b: 2.2 }); }

{ /* Küstenweg: am Westende der Kielbrücke ansetzen */
  const y = 7300; let x = 6430; while (!"~".includes(zeichen(x, y + 0.5)) && x > 6340) x--; while ("~".includes(zeichen(x, y + 0.5)) && x > 6340) x--;
  WEGE.find((w) => w.name.startsWith("Küstenweg")).punkte[0] = [x - 1, y]; }
/* Wege malen: Festland in den Plan, alte Gebiete in orte_wegenetz.json */
for (const w of WEGE) { const xs = w.punkte.map((p) => p[0]), ys = w.punkte.map((p) => p[1]); let alt = [];
  for (let y = Math.floor(Math.min(...ys) - 3); y <= Math.max(...ys) + 3; y++) for (let x = Math.floor(Math.min(...xs) - 3); x <= Math.max(...xs) + 3; x++) {
    if (strecke(x + 0.5, y + 0.5, w.punkte) >= w.b / 2 + 0.25) continue;   /* wie orte.mjs: bündig an den Gebietsgrenzen */ const c = zeichen(x + 0.5, y + 0.5); if ("~wMoFX?".includes(c)) continue;
    if (aufAlt(x + 0.5, y + 0.5)) alt.push([x, y]); else feld.set(x + "," + y, w.z); }
  if (alt.length) wegeAlt.push({ name: w.name + " (#89)", breite: w.b, zeichen: w.z, punkte: w.punkte.filter(([x, y]) => aufAlt(x, y) || true) }); }

/* ───── Wegweiser an Kreuzungen (Ziele mit Richtungspfeil) ───── */
const pfeil = (dx, dy) => ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
const WEGWEISER = [
  ["kreuzweg", [6506, 6508], ["Waldmark", "Graufurt", "Weidenhain"]],
  ["weidenhain_sued", [6448, 6762], ["Kielmund", "Weidenhain"]],
  ["graufurt_westtor", [6656, 6516], ["Waldmark", "Graufurt", "Glutbrunn"]],
  ["nordsaum_knick", [6711, 6384], ["Grauwacht", "Graufurt", "Waldmark"]],
  ["glutstrasse_bruecke", [6762, 6794], ["Glutbrunn", "Graufurt"]],
  ["ende_des_grases", [6918, 6748], ["Ostufer", "Glutbrunn"]],
  ["heidrast", [6603, 5880], ["Grauwacht", "Hügelgräber", "Graufurt"]],
  ["kielmund_nord", [6440, 7286], ["Weidenhain", "Möwenbucht", "Kielmund"]],
  ["moewenbucht", [6234, 7172], ["Kielmund", "Leuchtturm"]],
  ["glutbrunn_west", [7108, 6934], ["Glutbrunn", "Ostufer", "Graufurt"]],
  ["halber_weg", [6470, 7003], ["Weidenhain", "Erlengrund", "Kielmund"]],   /* Süden (#120) */
  ["kreuzstein", [6472, 7092], ["Weidenhain", "Kräuterhof", "Kielmund"]],
  ["suedstrasse_nord", [6462, 6904], ["Weidenhain", "Summweide", "Kielmund"]],
];
const RICHTUNG = { "halber_weg:Weidenhain": [0, -1], "halber_weg:Kielmund": [0, 1], "kreuzstein:Weidenhain": [0, -1], "kreuzstein:Kielmund": [0, 1], "suedstrasse_nord:Weidenhain": [0, -1], "suedstrasse_nord:Kielmund": [0, 1], "nordsaum_knick:Waldmark": [-1, 0.2], "nordsaum_knick:Graufurt": [0, 1], "graufurt_westtor:Glutbrunn": [0.1, 1], "glutstrasse_bruecke:Graufurt": [-0.5, -1], "glutbrunn_west:Graufurt": [-1, -0.2], "glutbrunn_west:Ostufer": [-0.8, -1], "ende_des_grases:Ostufer": [-1, -1], "heidrast:Graufurt": [0, 1], "kielmund_nord:Weidenhain": [0.2, -1] };
for (const [id, [x, y], ziele] of WEGWEISER) {
  const zeilen = ziele.map((z) => { const r = RICHTUNG[id + ":" + z]; const [dx, dy] = r || [ORTE[z][0] - x, ORTE[z][1] - y]; return Math.hypot(ORTE[z][0] - x, ORTE[z][1] - y) < 25 && !r ? `${z} (hier)` : `Nach ${z} ${pfeil(dx, dy)}`; });
  const o = { id: "ort_wegweiser_" + id, objekt: "welt_wegweiser_01", x, y }, i = { id: "ort_wegweiser_" + id + "_lesen", x, y: y + 1.2, radius: 1.8, daten: { text: "Ein Wegweiser: " + zeilen.join(" · "), ziele: zeilen } };
  if (aufAlt(x, y)) { objekteAlt.push(o); interaktionenAlt.push(i); } else { objekte.push({ ...o, id: "wegweiser_" + id }); interaktionen.push({ ...i, id: "wegweiser_" + id + "_lesen", art: "lesen", abgleich: "keiner" }); } }

/* ───── Rastplätze an langen Wegen: Lagerfeuer (Kochstelle), Sitzstämme ───── */
const RAST = [["rast_nordsaumweg", [6690, 6232]], ["rast_glutstrasse", [6880, 6866]], ["rast_suedstrasse", [6474, 7010]], ["rast_heidrast_grauwacht", [6660, 5832]], ["rast_kuestenweg", [6300, 7226]]];
const rast = [];
for (const [id, [x, y]] of RAST) { for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) if (Math.hypot(i / 5, j / 4) < 1 && !"~wMoF".includes(zeichen(x + i, y + j)) && !feld.has((x + i) + "," + (y + j))) feld.set((x + i) + "," + (y + j), Math.hypot(i, j) < 2 ? "g" : ".");
  objekte.push({ id: id + "_feuer", objekt: "dorf_festfeuer_01", x, y }, { id: id + "_stamm_1", objekt: "wald_baumstamm_01", x: x - 3, y: y + 2 }, { id: id + "_stamm_2", objekt: "wald_baumstamm_02", x: x + 3, y: y - 1.5, spiegeln: true });
  interaktionen.push({ id, art: "lesen", x, y: y + 2.4, radius: 1.8, abgleich: "keiner", daten: { text: "Ein Rastplatz am Weg. Die Glut im Feuer ist noch warm – hier kann man kochen.", station: "feuer" } });
  rast.push({ id, x, y, kochstelle: [x, y] }); }

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let z = ""; for (let x = X0; x <= X1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
writeFileSync(join(WELT, "festland", "plan_wegenetz.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/wegenetz.mjs – festland.py arbeitet es zuletzt ein (Dateiname plan_wegenetz). Weltfelder.", gelaende: patches, hoehen: [], eben: [], objekte, interaktionen, sperren: [], freigeben }) + "\n");
writeFileSync(join(WELT, "orte_wegenetz.json"), JSON.stringify({ _hinweis: "Erzeugt von werkzeug/welt/wegenetz.mjs (#89): Wegstücke, Wegweiser und Lesestellen in den alten Gebieten – orte.mjs trägt sie ein.", wege: wegeAlt, objekte: objekteAlt, interaktionen: interaktionenAlt }, null, 1) + "\n");
writeFileSync(join(WELT, "wegenetz.json"), JSON.stringify({ hinweis: "Wegenetz (#89): Orte, Wegweiser und Rastplätze (Weltfelder). Test: test/welt-wegenetz.test.mjs", orte: ORTE, wegweiser: WEGWEISER.map(([id, p, z]) => ({ id, x: p[0], y: p[1], ziele: z })), rastplaetze: rast, wege: WEGE.map((w) => ({ name: w.name, klasse: w.z === "k" ? "Straße" : w.b < 1.5 ? "Pfad" : "Feldweg", punkte: w.punkte })) }, null, 1) + "\n");
console.log(`Wegenetz: ${feld.size} Felder Festland, ${wegeAlt.length} Wegstücke in alten Gebieten, ${WEGWEISER.length} Wegweiser, ${RAST.length} Rastplätze, ${freigeben.length} Brücken`);
