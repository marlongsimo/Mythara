/*
 * World Pipeline – die beiden östlichen Ecken der Welt (Skizze vom 21.11.2026), damit die Welt ein lückenloses Rechteck aus gleich großen Chunks ist:
 *   Osthof (3 × 2 Chunks ab 203|200, östlich der Waldmark): Gehöft mit Bauernhaus, Scheune und Windmühle, Äcker und Koppeln.
 *     Ein Feldweg kommt aus dem Kreuzwald herauf (vom östlichen Steinweg, Kreuzwald x ≈ 180).
 *   Obstwiesen (2 × 3 Chunks ab 204|208, östlich von Weidenhain): Apfelgarten, Felder, ein Bach aus einem Quellteich, Hütte des Obstbauern.
 *     Die östliche Gasse von Weidenhain (y ≈ 29,8) führt hinein.
 * An allen Rändern zu Nachbarn ein Waldsaum (dort ist auch beim Nachbarn Wald) – nur die Wege laufen bündig über die Grenze.
 * Aufruf (im Ordner realtime): node werkzeug/welt/ostland.mjs     danach: node werkzeug/welt/bauen.mjs osthof obstwiesen
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];
let saat = 91; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const baumZufall = () => { const z = wurf(); return BAUM[z < 0.3 ? 1 : z < 0.55 ? 2 : z < 0.78 ? 3 : z < 0.82 ? 4 : z < 0.92 ? 5 : 6]; };
const schreibe = (id, region, g, objekte, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
  writeFileSync(join(dir, "region.json"), JSON.stringify(region, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.sort((a, b) => a.y - b.y).map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${objekte.length} Objekte`); };
const wald = (B, H, wo) => { const aus = [], gitter = new Map(), z = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
  for (let i = 0; i < B * H * 1.0; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2); if (!wo(x, y)) continue;
    let frei = true; for (let dj = -1; dj <= 1 && frei; dj++) for (let di = -1; di <= 1 && frei; di++) for (const p of gitter.get(z(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < 2.3) { frei = false; break; }
    if (!frei) continue; const p = { id: "b" + String(aus.length + 1).padStart(4, "0"), objekt: baumZufall(), x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) };
    aus.push(p); gitter.set(z(x, y), [...(gitter.get(z(x, y)) || []), p]); }
  return aus; };
const lies = (id, x, y, text) => ({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.6, abgleich: "keiner", daten: { text } });
const tuer = (id, x, y) => { const i = BIB.get(id).interaktion; return [+(x + i.dx).toFixed(2), +(y + i.dy).toFixed(2)]; };

/* ───── Osthof ───── */
{ const B = 96, H = 64, saum = (x, y) => 5 + 1.6 * Math.sin(x / 4.1 + y / 5.3) + Math.sin(y / 2.7 - x / 3.3);
  const randWald = (x, y) => x < saum(x, y) || y < saum(x, y) - 1 || x > B - saum(x, y) || y > H - saum(x, y);
  const HAUS = [26, 27], SCHEUNE = [43, 27.5], MUEHLE = [72, 21];
  const WEG = [[20, H + 1], [21, 52], [24, 40], [HAUS[0] - 1.6, HAUS[1] + 0.7]], ABZWEIG = [[24, 38], [44, 38.5], [62, 32], [MUEHLE[0], MUEHLE[1] + 0.7]];
  const HOF = { x: 34, y: 33, rx: 12, ry: 5 };
  const AECKER = [[50, 40, 88, 56], [8, 10, 22, 22], [48, 8, 62, 18], [80, 26, 90, 38]];
  const imAcker = (x, y) => AECKER.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1);
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c;
    if (strecke(cx, cy, WEG) < 1.6 || strecke(cx, cy, ABZWEIG) < 1.1) c = "e";
    else if (randWald(cx, cy)) c = "f";
    else if (Math.hypot((cx - HOF.x) / HOF.rx, (cy - HOF.y) / HOF.ry) < 1 + 0.06 * w) c = "e";
    else if (imAcker(cx, cy)) c = "a";
    else c = w > 1.2 ? "," : ".";
    z.push(c); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|weidenhain|wald|stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const dinge = [o("weidenhain_fachwerk_03", ...HAUS), o("dorf_scheune_holz_01", ...SCHEUNE), o("dorf_windmuehle_01", ...MUEHLE),
    o("k_karren_hoch", 36, 34.6), o("dorf_heuballen_01", 48.6, 30.2), o("dorf_heuballen_01", 50, 31), o("dorf_heuballen_01", 66, 50), o("dorf_heuballen_01", 76, 47),
    o("dorf_kuerbisse_01", 31, 34.6), o("dorf_fass_01", 20, 28), o("dorf_holzstapel_01", 19, 24.6), o("dorf_brunnen_01", 33.6, 31.2),
    ...[51, 55, 59, 63, 67, 71, 75, 79, 83, 87].map((x) => o("dorf_zaun_01", x, 39.6)), ...[9, 13, 17, 21].map((x) => o("dorf_zaun_01", x, 23.2)),
    ...[[12, 30], [56, 26], [86, 20], [40, 48]].map(([x, y]) => o("stil_apfel_01", x, y, { s: 0.95 }))];
  const frei = (x, y) => strecke(x, y, WEG) < 3.5 || strecke(x, y, ABZWEIG) < 2.5 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 4);
  const baeume = wald(B, H, (x, y) => randWald(x, y) && !frei(x, y));
  const spiel = { start: [[21, 60]], figuren: [{ id: "baeuerin", rolle: "npc", figur: "kraeuterfrau", x: 30, y: 32.6 }, { id: "muellerjunge", rolle: "npc", figur: "junge", x: 68, y: 25, links: true }], spawnzonen: [],
    interaktionen: [lies("hof_tuer", ...tuer("weidenhain_fachwerk_03", ...HAUS), "Das Bauernhaus des Osthofs. Im Stall nebenan schnaubt ein Pferd."),
      lies("muehle_tuer", ...tuer("dorf_windmuehle_01", ...MUEHLE), "Die Windmühle. Wenn Wind geht, mahlt sie das Korn für die ganze Waldmark."),
      lies("scheune_tor", ...tuer("dorf_scheune_holz_01", ...SCHEUNE), "Die Scheune ist bis unters Dach mit Heu gefüllt.")],
    ausgaenge: [], kollision: { sperren: [{ art: "rechteck", x0: 66, y0: 59, x1: B, y1: H }], freigeben: [] } };   /* Südostrand: dahinter liegt der Kreuzwald hinter dem umgestürzten Baum am Ostweg */
  schreibe("osthof", { id: "osthof", name: "Der Osthof", untertitel: "Felder und Windmühle östlich der Waldmark", ursprung: [203, 200], chunks: [3, 2], biom: "wiese", stufe: 1 }, g, [...dinge, ...baeume], spiel); }

/* ───── Obstwiesen ───── */
{ const B = 64, H = 96, saum = (x, y) => 4.5 + 1.4 * Math.sin(x / 4.1 + y / 5.3) + Math.sin(y / 2.7 - x / 3.3);
  const randWald = (x, y) => x < saum(x, y) || y < saum(x, y) || x > B - saum(x, y);
  const GASSE = [[-1, 29.8], [10, 30.2], [22, 32], [30, 34.6]], HUETTE = [30, 34];
  const QUELLE = [44, 40], BACH = [[44, 41], [43, 52], [46, 64], [44, 78], [45, H + 1]], imBach = (x, y) => strecke(x, y, BACH) < 1.15 + 0.15 * Math.sin(y / 3);
  const WEG2 = [[30.8, 34.7], [36, 50], [42, 58], [52, 60]], BRUECKE = { objekt: "dorf_bruecke_01", x: 45.6, y: 61.2, frei: [42.6, 58.6, 48.6, 61.2] };
  const FELDER = [[8, 46, 38, 62], [10, 66, 40, 86], [50, 66, 58, 88]], imFeld = (x, y) => FELDER.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1);
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c;
    if (imBach(cx, cy) || Math.hypot((cx - QUELLE[0]) / 3.6, (cy - QUELLE[1]) / 2.6) < 1) c = "w";
    else if (strecke(cx, cy, GASSE) < 1.15 || strecke(cx, cy, WEG2) < 1.0) c = "e";
    else if (randWald(cx, cy)) c = "f";
    else if (imFeld(cx, cy)) c = "a";
    else c = w > 1.1 ? "," : ".";
    z.push(c); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|weidenhain|wald|stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const dinge = [o("dorf_huette_holz_02", ...HUETTE), o(BRUECKE.objekt, BRUECKE.x, BRUECKE.y), o("dorf_kiste_01", 34.6, 34.4), o("dorf_kiste_01", 35.4, 35), o("dorf_fass_01", 25.4, 34.6),
    o("dorf_heuballen_01", 30, 64), o("dorf_heuballen_01", 52, 74), o("k_karren", 40, 38), o("stil_schilf_01", 47.5, 41), o("stil_schilf_02", 40.4, 40.6)];
  /* Apfelgarten in versetzten Reihen nördlich der Hütte */
  for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) { const x = 8 + i * 6.4 + (j % 2) * 3.2 + (wurf() - 0.5), y = 9 + j * 4.6 + (wurf() - 0.5);
    if (strecke(x, y, GASSE) < 3 || randWald(x, y) || Math.hypot(x - QUELLE[0], y - QUELLE[1]) < 6) continue; dinge.push(o(wurf() < 0.5 ? "stil_apfel_01" : "stil_apfel_02", x, y, { s: +(0.85 + wurf() * 0.2).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
  const frei = (x, y) => strecke(x, y, GASSE) < 3.5 || strecke(x, y, WEG2) < 2.5 || strecke(x, y, BACH) < 3 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 3);
  const baeume = wald(B, H, (x, y) => randWald(x, y) && !frei(x, y));
  const spiel = { start: [[2, 30]], figuren: [{ id: "obstbauer", rolle: "npc", figur: "wanderer", x: 27, y: 37, links: true }], spawnzonen: [],
    interaktionen: [lies("huette_tuer", ...tuer("dorf_huette_holz_02", ...HUETTE), "Die Hütte des Obstbauern. Vor der Tür stehen Kisten voller Äpfel."),
      lies("quelle", QUELLE[0] - 4.2, QUELLE[1] + 0.4, "Eine klare Quelle. Hier entspringt der Bach, der durch die Obstwiesen nach Süden fließt.")],
    ausgaenge: [], kollision: { sperren: [], freigeben: [{ art: "rechteck", x0: BRUECKE.frei[0], y0: BRUECKE.frei[1], x1: BRUECKE.frei[2], y1: BRUECKE.frei[3] }] } };
  schreibe("obstwiesen", { id: "obstwiesen", name: "Die Obstwiesen", untertitel: "Apfelgärten östlich von Weidenhain", ursprung: [204, 208], chunks: [2, 3], biom: "wiese", stufe: 1 }, g, [...dinge, ...baeume], spiel); }
