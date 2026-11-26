/*
 * World Pipeline – Osthang und Graufurt (östliche Erweiterung, 21.11.2026):
 *   Osthang (2 × 11 Chunks ab 206|200): Hügelland mit Felsen und lichtem Wald; der östliche Steinweg aus dem Kreuzwald läuft hindurch, an ihm ein Rastplatz.
 *   Graufurt (4 × 11 Chunks ab 208|200): kleine steinerne Vorfeste am Westufer eines breiten grauen Flusses – Ringmauer mit Ecktürmen und drei Torhäusern
 *     (Kenney Castle Kit), innen Bergfried, Steinhäuser mit Schieferdach, Fährhaus, Brunnen, Marktstand. Durchs Wassertor zur Anlegestelle; die Fähre liegt schief,
 *     ihre Kette ist gerissen (der Fluss ist vorerst nicht zu überqueren). Am Ostufer der Turm mit dem grünen Fenster. Durchs Nordtor führt der Uferweg nach Norden
 *     (vorerst von einem umgestürzten Baum versperrt – dort geht es später nach Grauwacht).
 * Gleich große Chunks, die Welt bleibt ein lückenloses Rechteck. Der Server kennt „graufurt“ schon.
 * Aufruf (im Ordner realtime): node werkzeug/welt/graufurt.mjs     danach: node werkzeug/welt/bauen.mjs osthang graufurt
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];
let saat = 113; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const baumZufall = () => { const z = wurf(); return BAUM[z < 0.28 ? 1 : z < 0.52 ? 2 : z < 0.76 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6]; };
const schreibe = (id, region, g, objekte, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
  writeFileSync(join(dir, "region.json"), JSON.stringify(region, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.sort((a, b) => a.y - b.y).map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${objekte.length} Objekte`); };
const wald = (B, H, wo, dichte = 1.0) => { const aus = [], gitter = new Map(), z = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
  for (let i = 0; i < B * H * dichte; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2); if (!wo(x, y)) continue;
    let frei = true; for (let dj = -1; dj <= 1 && frei; dj++) for (let di = -1; di <= 1 && frei; di++) for (const p of gitter.get(z(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < 2.3) { frei = false; break; }
    if (!frei) continue; const p = { id: "b" + String(aus.length + 1).padStart(4, "0"), objekt: baumZufall(), x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) };
    aus.push(p); gitter.set(z(x, y), [...(gitter.get(z(x, y)) || []), p]); }
  return aus; };
const lies = (id, x, y, text) => ({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.6, abgleich: "keiner", daten: { text } });
const tuer = (id, x, y) => { const i = BIB.get(id).interaktion; return [+(x + i.dx).toFixed(2), +(y + i.dy).toFixed(2)]; };
/* derselbe Steinweg wie im Kreuzwald (dort x ab Chunk 198, y ab Chunk 202): hier in Feldern ab dem Ursprung der jeweiligen Region (Zeile 200) */
const TOR = 112, KY = 44, steinK = (xk) => KY + 2.6 * Math.sin((xk - TOR) / 21) + 1.3 * Math.sin((xk - TOR) / 8.3) * Math.min(1, Math.abs(xk - TOR) / 14);
const H = 352;

/* ───── Osthang ───── */
{ const B = 64, sy = (x) => steinK(x + 256) + 64;
  const saum = (x, y) => 5 + 1.6 * Math.sin(y / 5.3) + Math.sin(y / 2.7 + x);
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy), d = Math.abs(cy - sy(cx)); let c;
    if (d < 3.1) c = "k";
    else if (d < 5.2 + w) c = ".";
    else if (cx < saum(cx, cy) || cy < 5 + w || cy > H - 5 - w) c = "f";                 /* Waldsaum zu Osthof, Kreuzwald, Obstwiesen und am Weltrand */
    else c = w > 1.05 ? "," : w < -1.2 ? "t" : ".";
    z.push(c); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const RAST = [34, sy(34) + 6];
  const dinge = [o("dorf_festfeuer_01", RAST[0], RAST[1]), o("dorf_bank_01", RAST[0] - 3.4, RAST[1] - 1.4), o("dorf_bank_01", RAST[0] + 3.4, RAST[1] - 1.4), o("dorf_holzstapel_01", RAST[0] + 6, RAST[1] + 1)];
  for (let i = 0; i < 4000 && dinge.length < 70; i++) { const x = +(6 + wurf() * (B - 10)).toFixed(2), y = +(8 + wurf() * (H - 16)).toFixed(2);
    if (Math.abs(y - sy(x)) < 6 || Math.hypot(x - RAST[0], y - RAST[1]) < 8 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 7)) continue;
    dinge.push(o(["k_fels_gross", "k_fels_klein", "k_fels_breit"][Math.floor(wurf() * 3)], x, y, wurf() < 0.5 ? { spiegeln: true } : {})); }
  const baeume = wald(B, H, (x, y) => Math.abs(y - sy(x)) > 6 && Math.hypot(x - RAST[0], y - RAST[1]) > 8 && !dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 3.2) && (g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))] === "f" || wurf() < 0.33), 0.9);
  schreibe("osthang", { id: "osthang", name: "Der Osthang", untertitel: "Hügelland am Steinweg nach Graufurt", ursprung: [206, 200], chunks: [2, 11], biom: "wiese", stufe: 1 }, g, [...dinge, ...baeume],
    { start: [[4, sy(4)]], figuren: [], spawnzonen: [], interaktionen: [lies("rastplatz", RAST[0], RAST[1] + 1, "Ein Rastplatz am Steinweg. Die Asche im Feuerring ist noch warm.")], ausgaenge: [], kollision: { sperren: [], freigeben: [] } }); }

/* ───── Graufurt (seit Phase 7 vorab, 27.11.2026: die Stadt am grauen Fluss) ─────
 * Großer Mauerring (x 8–58, y 60–170) mit Westtor (Steinweg), Nordtor (Uferweg) und Wassertor (Hafen). Innen: Markt mit Brunnen, Wegstein und fünf Ständen,
 * Bergfried mit Wachtkapelle, Bank, Werkstatt-Hof (Schmiede mit Esse und Amboss, Werkbank, Herd, Kessel), Taverne „Zur Furt“, Fährhaus, Steinhäuser.
 * Plätze und Gassen bleiben frei. Am Hafen: Westanleger mit der Winde der Fährkette, Fischplatz; drüben der Ostanleger.
 * Nordwestlich vor der Stadt die Furtklamm (Schlucht mit 4 Splitterfelsen). Das Ostufer des Flusses ist zum Festland hin durch Felsriegel abgeschlossen –
 * hinüber nur mit der Fähre (Region „ostufer“, werkzeug/welt/ostufer.mjs; Turm innen: turm_gruen.mjs). */
export const GRAUFURT = { W0: 8, W1: 58, N0: 60, S0: 170, GN: 34, GO: 112 };
{ const B = 128, sy = (x) => steinK(x + 320) + 64;
  const flussX = (y) => 72 + 4 * Math.sin(y / 23) + 2 * Math.sin(y / 9), imFluss = (x, y) => Math.abs(x - flussX(y)) < 6.4 + 0.5 * Math.sin(y / 3.7);
  const { W0, W1, N0, S0, GN, GO } = GRAUFURT, GW = Math.round(sy(W0));
  const PLATZ = { x: 33, y: 110, rx: 12, ry: 9 }, HOF = [12, 139, 27, 147];
  const UFERWEG = [[GN, N0], [42, 44], [50, 28], [51.5, -1]], WASSERWEG = [[W1, GO + 1], [61, GO + 1]], OSTWEG = [[79, GO + 1.3], [96, GO + 2.5], [112, 114.5], [128, 115.5]], KLAMMWEG = [[41, 47], [33, 43.5]];
  const GASSEN = [[[W0, GW], [PLATZ.x, PLATZ.y]], [[PLATZ.x, PLATZ.y], [GN, N0]], [[PLATZ.x, PLATZ.y], [W1, GO]], [[PLATZ.x, PLATZ.y], [33, 152]], [[12, 152], [54, 152]], [[22, 84], [47, 84]], [[33, 84], [33, 100]], [[18, 139], [18, 152]], [[44, 141], [44, 152]], [[49, 123], [49, 116]]];
  const innen = (x, y) => x > W0 + 1 && x < W1 - 1 && y > N0 + 1 && y < S0 - 1;
  const KLAMM = { x0: 6, x1: 33, y0: 34, y1: 52 }, klammBoden = (x, y) => Math.abs(y - (43 + 1.2 * Math.sin(x / 4))) < 2.4 + 0.5 * Math.sin(x / 2.3) && x > KLAMM.x0 + 2 && x < KLAMM.x1;
  const ostRiegel = (x, y) => { const r = 2.4 + 1.4 * Math.sin(x / 4.3) * Math.sin(x / 2.1); return x > flussX(y) + 3 && (Math.abs(y - 22 - 2 * Math.sin(x / 7)) < r || Math.abs(y - 330 - 2 * Math.sin(x / 6)) < r); };
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c;
    if (imFluss(cx, cy)) c = "~";
    else if (ostRiegel(cx, cy)) c = "F";                                                     /* Felsriegel: das Ostufer nur mit der Fähre */
    else if (cx < W0 + 0.5 && Math.abs(cy - sy(cx)) < 3.1) c = "k";
    else if (innen(cx, cy)) c = Math.hypot((cx - PLATZ.x) / PLATZ.rx, (cy - PLATZ.y) / PLATZ.ry) < 1 || GASSEN.some((p) => strecke(cx, cy, p) < 1.5) || (cx > HOF[0] && cx < HOF[2] && cy > HOF[1] && cy < HOF[3]) ? "p" : w > 1.0 ? "," : ".";
    else if (strecke(cx, cy, UFERWEG) < 1.4 || strecke(cx, cy, WASSERWEG) < 1.4 || strecke(cx, cy, OSTWEG) < 1.3 || strecke(cx, cy, KLAMMWEG) < 1.2) c = "e";
    else if (cx > KLAMM.x0 && cx < KLAMM.x1 + 2 && cy > KLAMM.y0 && cy < KLAMM.y1) c = klammBoden(cx, cy) ? "g" : "F";   /* Furtklamm */
    else if (cx < W0 + 2 && Math.abs(cy - sy(cx)) < 5.2 + w) c = ".";
    else if (cy < 16 + w && strecke(cx, cy, UFERWEG) > 2.6) c = "f";
    else if (cx > flussX(cy) + 6) c = cx > 100 + 2 * w || cy < 10 || cy > H - 8 ? "f" : (w > 0.9 ? "," : ".");
    else if (cx < 5 + w || cy > H - 5 - w) c = "f";
    else c = w > 1.1 ? "," : w < -1.3 ? "t" : ".";
    z.push(c); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|graufurt|wald|stil|burg|k|hand|moor)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const dinge = [];
  for (let x = W0 + 2; x < W1 - 1; x += 2) { if (Math.abs(x + 1 - GN) > 2.6) dinge.push(o("burg_mauer_quer", x + 1, N0 + 1)); dinge.push(o("burg_mauer_quer", x + 1, S0 + 1)); }
  for (let y = N0 + 2; y < S0 - 1; y += 2) { if (Math.abs(y + 1 - GW) > 2.6) dinge.push(o("burg_mauer_laengs", W0, y + 2)); if (Math.abs(y + 1 - GO) > 2.6) dinge.push(o("burg_mauer_laengs", W1, y + 2)); }
  for (const [x, y] of [[W0, N0 + 1.3], [W1, N0 + 1.3], [W0, S0 + 1.3], [W1, S0 + 1.3]]) dinge.push(o("burg_eckturm", x, y));
  dinge.push(o("burg_torhaus", GN, N0 + 1), o("burg_torhaus_tief", W0, GW + 1.5), o("burg_torhaus_tief", W1, GO + 1.5));
  const PFEILER = [{ art: "rechteck", x0: GN - 1.5, y0: N0 - 0.6, x1: GN - 0.7, y1: N0 + 1 }, { art: "rechteck", x0: GN + 0.7, y0: N0 - 0.6, x1: GN + 1.5, y1: N0 + 1 },
    ...[[W0, GW], [W1, GO]].flatMap(([x, y]) => [{ art: "rechteck", x0: x - 0.8, y0: y - 1.5, x1: x + 0.8, y1: y - 0.7 }, { art: "rechteck", x0: x - 0.8, y0: y + 0.7, x1: x + 0.8, y1: y + 1.5 }])];
  /* Gebäude (Fuß = Mitte der Südwand, Tür nach Süden) */
  const BAU = { bergfried: [22, 82], kapelle: [32, 82], bank: [47, 82], haus_nw: [14, 97], haus_no: [50, 98], faehrhaus: [49, 122], schmiede: [18, 138], taverne: [44, 140], haus_s1: [14, 164], haus_s2: [28, 164], haus_s3: [46, 165] };
  dinge.push(o("graufurt_bergfried_01", ...BAU.bergfried), o("dorf_kapelle_01", ...BAU.kapelle), o("waldmark_bank_01", ...BAU.bank), o("graufurt_steinhaus_01", ...BAU.haus_nw), o("graufurt_steinhaus_02", ...BAU.haus_no),
    o("graufurt_faehrhaus_01", ...BAU.faehrhaus), o("dorf_schmiede_01", ...BAU.schmiede), o("dorf_taverne_01", ...BAU.taverne), o("graufurt_steinhaus_02", ...BAU.haus_s1), o("graufurt_steinhaus_01", ...BAU.haus_s2), o("graufurt_steinhaus_01", ...BAU.haus_s3));
  /* Markt: Brunnen, Wegstein, fünf Stände (Waffen, Rüstung, Tränke, Handwerk, Lebensmittel) */
  const STAENDE = { waffen: [25, 104.5], ruestung: [41, 104.5], traenke: [23.5, 117.5], handwerk: [42.5, 117.5], lebensmittel: [33, 121.6] };
  dinge.push(o("dorf_brunnen_01", PLATZ.x, PLATZ.y + 0.6), o("moor_menhir_02", 27.5, 110.6), o("k_stand_rot", ...STAENDE.waffen), o("k_stand_gruen", ...STAENDE.ruestung), o("dorf_marktstand_01", ...STAENDE.traenke),
    o("dorf_marktstand_02", ...STAENDE.handwerk), o("dorf_marktstand_03", ...STAENDE.lebensmittel), o("k_banner_rot", 30.4, 76.4), o("k_banner_rot", 35.6, 76.4));
  /* Werkstatt-Hof */
  dinge.push(o("hand_werkbank_01", 24, 142.6), o("hand_herd_01", 13.8, 141.6), o("hand_kessel_01", 16.4, 145.4), o("dorf_holzstapel_01", 25.6, 146.2), o("k_faesser", 21.5, 145.8));
  /* Tore, Hafen (Westanleger mit Winde, Fischplatz), Ostanleger */
  dinge.push(...[[W0 + 3, GW - 2.6], [W0 + 3, GW + 3.2], [GN - 3, N0 + 3.6], [GN + 3, N0 + 3.6], [W1 - 3, GO - 2.6], [W1 - 3, GO + 3.2]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
    o("dorf_bruecke_01", 64.4, GO + 2.6), o("graufurt_faehre_01", 71.5, GO + 6.4), o("graufurt_winde_01", 60.1, GO - 1.4), o("dorf_holzstapel_01", 60.4, GO - 4.4),
    o("dorf_bruecke_01", 76.2, GO + 2.6, { spiegeln: true }), o("moor_feuerkorb_01", 80.6, GO - 0.4), o("wald_baumstamm_01", 51.5, 15.6), o("k_kiste", 60.6, GO + 13.2), o("dorf_fass_01", 60.2, GO + 15.2));
  /* Furtklamm: Splitterfelsen-Felder (für shared/bergbau_standorte.json) – gesperrt, Steine am Rand */
  const SPLITTERFELSEN = [[12, 42], [18, 44], [24, 42], [29, 44]];
  for (const [x, y] of [[9, 40], [15, 46], [21, 39.6], [27, 46.4], [31.6, 40.4]]) dinge.push(o("k_fels_klein", x + 0.5, y + 0.5));
  for (let i = 0; i < 4000 && dinge.filter((d) => d.objekt.startsWith("k_fels")).length < 26; i++) { const x = +(8 + wurf() * 50).toFixed(2), y = +(20 + wurf() * (H - 30)).toFixed(2);
    if ((x > W0 - 6 && x < W1 + 6 && y > N0 - 6 && y < S0 + 6) || (x > KLAMM.x0 - 3 && x < KLAMM.x1 + 5 && y > KLAMM.y0 - 3 && y < KLAMM.y1 + 3) || imFluss(x, y) || Math.abs(x - flussX(y)) < 9 || strecke(x, y, UFERWEG) < 4 || Math.abs(y - sy(x)) < 6 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 7)) continue;
    dinge.push(o(["k_fels_gross", "k_fels_klein", "k_fels_breit"][Math.floor(wurf() * 3)], x, y)); }
  for (let i = 0; i < 3000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 46; i++) { const y = +(wurf() * H).toFixed(2), seite = wurf() < 0.5 ? -1 : 1, x = +(flussX(y) + seite * (6.4 + wurf() * 1.2)).toFixed(2);
    if (Math.abs(y - GO - 3) < 9 || (seite < 0 && y > N0 - 4 && y < S0 + 4) || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 2.4)) continue; dinge.push(o(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y)); }
  const frei = (x, y) => (x > W0 - 4 && x < W1 + 4 && y > N0 - 4 && y < S0 + 4) || (x > KLAMM.x0 - 2 && x < KLAMM.x1 + 4 && y > KLAMM.y0 - 2 && y < KLAMM.y1 + 2) || imFluss(x, y) || strecke(x, y, UFERWEG) < 3 || strecke(x, y, WASSERWEG) < 3 || strecke(x, y, OSTWEG) < 3 || strecke(x, y, KLAMMWEG) < 3 || (x < W0 && Math.abs(y - sy(x)) < 6) || Math.abs(y - GO - 2) < 8 && x > 74 && x < 86 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 3);
  const baeume = wald(B, H, (x, y) => !frei(x, y) && (g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))] === "f" || wurf() < 0.22), 1.0);
  const t = (id, xy) => tuer(id, ...xy);
  const spiel = { start: [[3, sy(3)]],
    figuren: [{ id: "wache_west_1", rolle: "wache", figur: "wache", x: W0 - 2.2, y: GW - 2.6 }, { id: "wache_west_2", rolle: "wache", figur: "wache", x: W0 - 2.2, y: GW + 3, links: true },
      { id: "wache_nord", rolle: "wache", figur: "wache", x: GN + 2.4, y: N0 + 2.6, links: true },
      { id: "kraemer", rolle: "haendler", figur: "kraemer", x: 33, y: 123.6 }, { id: "faehrmann", rolle: "npc", figur: "wanderer", x: 61.8, y: GO + 3.6, links: true }, { id: "ausrufer", rolle: "npc", figur: "ausrufer", x: 36.5, y: 106, links: true }],
    spawnzonen: [],
    interaktionen: [lies("bergfried_tuer", ...t("graufurt_bergfried_01", BAU.bergfried), "Der Bergfried von Graufurt, Sitz der Wacht. Von oben sieht man weit über den grauen Fluss."),
      lies("kapelle_tuer", BAU.kapelle[0], BAU.kapelle[1] + 0.6, "Die Wachtkapelle. Über dem Altar hängt das Wappen der Wacht: ein Turm über drei Wellen."),
      lies("bank_tuer", BAU.bank[0], BAU.bank[1] + 0.6, "Die Bank von Graufurt. Dasselbe Konto wie in der Waldmark."),
      lies("taverne_tuer", ...t("dorf_taverne_01", BAU.taverne), "Die Taverne „Zur Furt“. Es riecht nach Flussfisch und Rauch."),
      lies("schmiede_tuer", ...t("dorf_schmiede_01", BAU.schmiede), "Die Schmiede der Stadt. Im Hof stehen Werkbank, Herd und Kessel."),
      lies("faehrhaus_tuer", ...t("graufurt_faehrhaus_01", BAU.faehrhaus), "Das Fährhaus. Hinter dem Tresen hängen Seile, Haken und eine Karte des Flusses."),
      lies("wegstein_markt", 27.5, 112.2, "Ein glatter Stein mit eingeritzten Splitterlinien. Hier kann man später den Wegstein binden."),
      lies("markt", PLATZ.x, PLATZ.y + 3.4, "Der Markt von Graufurt: Waffen, Rüstung, Tränke, Handwerk und Lebensmittel."),
      lies("winde_westanleger", 60.1, GO - 0.2, "Die Winde der Fährkette. Die Kette ist gerissen; ein Ende hängt lose ins Wasser."),
      lies("faehre", 61.6, GO + 1.4, "Die Fähre liegt schief an der Anlegestelle. Ohne Kette kommt niemand über den Fluss."),
      lies("fischplatz", 61.4, GO + 14, "Ein ruhiger Platz am Ufer. Unten im trüben Wasser ziehen große Welse vorbei."),
      lies("ostanleger", 80.4, GO + 1.4, "Der Ostanleger. Von hier fährt die Fähre zurück nach Graufurt."),
      lies("turm_ansehen", 62, 104, "Drüben am Ostufer steht ein Turm auf einer Anhöhe. In seinem obersten Fenster brennt ein grünes Licht, das nicht flackert."),
      lies("furtklamm", 34.4, 44.6, "Die Furtklamm. Zwischen den Felswänden blitzen Splitterfelsen."),
      lies("uferweg_sperre", 51.5, 17.4, "Ein umgestürzter Baum versperrt den Uferweg nach Norden. Hier geht es noch nicht weiter.")],
    ausgaenge: [], kollision: { sperren: [...PFEILER, ...SPLITTERFELSEN.map(([x, y]) => ({ art: "rechteck", x0: x, y0: y, x1: x + 1, y1: y + 1 })), { art: "rechteck", x0: 0, y0: 14.6, x1: flussX(15) - 6, y1: 15.8 }, { art: "rechteck", x0: 0, y0: 0, x1: 1, y1: 15.8 }],
      freigeben: [{ art: "rechteck", x0: 59.5, y0: GO, x1: 67.4, y1: GO + 2.6 }, { art: "rechteck", x0: 73, y0: GO, x1: 79.4, y1: GO + 2.6 }] } };
  schreibe("graufurt", { id: "graufurt", name: "Graufurt", untertitel: "Die Stadt am grauen Fluss", ursprung: [208, 200], chunks: [4, 11], biom: "dorf", stufe: 1 }, g, [...dinge, ...baeume], spiel); }
