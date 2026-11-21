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

/* ───── Graufurt ───── */
{ const B = 128, sy = (x) => steinK(x + 320) + 64;
  const flussX = (y) => 72 + 4 * Math.sin(y / 23) + 2 * Math.sin(y / 9), imFluss = (x, y) => Math.abs(x - flussX(y)) < 6.4 + 0.5 * Math.sin(y / 3.7);
  const W0 = 14, W1 = 56, N0 = 86, S0 = 128, GW = Math.round(sy(W0)), GN = 35, GO = 112;     /* Mauerring, Westtor (Steinweg), Nordtor, Wassertor */
  const PLATZ = { x: 35, y: 108, rx: 15, ry: 13 };
  const UFERWEG = [[GN, N0], [40, 70], [48, 50], [52, 24], [51.5, -1]], WASSERWEG = [[W1, GO + 1], [61, GO + 1]], INNEN = [[W0, GW], [PLATZ.x, PLATZ.y], [GN, N0], [PLATZ.x, PLATZ.y], [W1, GO]];
  const innen = (x, y) => x > W0 + 1 && x < W1 - 1 && y > N0 + 1 && y < S0 - 1;
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, w = welle(cx, cy); let c;
    if (imFluss(cx, cy)) c = "~";
    else if (cx < W0 + 0.5 && Math.abs(cy - sy(cx)) < 3.1) c = "k";
    else if (innen(cx, cy)) c = Math.hypot((cx - PLATZ.x) / PLATZ.rx, (cy - PLATZ.y) / PLATZ.ry) < 1 || strecke(cx, cy, INNEN) < 1.6 ? "p" : ".";
    else if (strecke(cx, cy, UFERWEG) < 1.4 || strecke(cx, cy, WASSERWEG) < 1.4) c = "e";
    else if (cx < W0 + 2 && Math.abs(cy - sy(cx)) < 5.2 + w) c = ".";
    else if (cy < 16 + w && strecke(cx, cy, UFERWEG) > 2.6) c = "f";                       /* hinter der Sperre im Norden: Wald */
    else if (cx > flussX(cy) + 6 && !(Math.hypot(cx - 92, (cy - 104) * 1.2) < 9)) c = cx > 100 + 2 * w || cy < 10 || cy > H - 8 ? "f" : (w > 0.9 ? "," : ".");
    else if (cx < 5 + w || cy > H - 5 - w) c = "f";
    else c = w > 1.1 ? "," : w < -1.3 ? "t" : ".";
    z.push(c); } g.push(z); }
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|graufurt|wald|stil|burg|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const dinge = [];
  /* Ringmauer: Blöcke zu 2 Feldern, an den Toren ausgespart; Ecktürme; Torhäuser */
  for (let x = W0 + 2; x < W1 - 1; x += 2) { if (Math.abs(x + 1 - GN) > 2.6) dinge.push(o("burg_mauer_quer", x + 1, N0 + 1)); dinge.push(o("burg_mauer_quer", x + 1, S0 + 1)); }
  for (let y = N0 + 2; y < S0 - 1; y += 2) { if (Math.abs(y + 1 - GW) > 2.6) dinge.push(o("burg_mauer_laengs", W0, y + 2)); if (Math.abs(y + 1 - GO) > 2.6) dinge.push(o("burg_mauer_laengs", W1, y + 2)); }
  for (const [x, y] of [[W0, N0 + 1.3], [W1, N0 + 1.3], [W0, S0 + 1.3], [W1, S0 + 1.3]]) dinge.push(o("burg_eckturm", x, y));
  dinge.push(o("burg_torhaus", GN, N0 + 1), o("burg_torhaus_tief", W0, GW + 1.5), o("burg_torhaus_tief", W1, GO + 1.5));
  const PFEILER = [{ art: "rechteck", x0: GN - 1.5, y0: N0 - 0.6, x1: GN - 0.7, y1: N0 + 1 }, { art: "rechteck", x0: GN + 0.7, y0: N0 - 0.6, x1: GN + 1.5, y1: N0 + 1 },
    ...[[W0, GW], [W1, GO]].flatMap(([x, y]) => [{ art: "rechteck", x0: x - 0.8, y0: y - 1.5, x1: x + 0.8, y1: y - 0.7 }, { art: "rechteck", x0: x - 0.8, y0: y + 0.7, x1: x + 0.8, y1: y + 1.5 }])];
  /* Gebäude und Dinge in der Feste */
  const BERG = [23.5, 99.5], HAUS1 = [46, 98.5], HAUS2 = [23, 124], HAUS3 = [46.5, 125], FAEHR = [47.5, 109.5];
  dinge.push(o("graufurt_bergfried_01", ...BERG), o("graufurt_steinhaus_01", ...HAUS1), o("graufurt_steinhaus_02", ...HAUS2), o("graufurt_steinhaus_01", ...HAUS3), o("graufurt_faehrhaus_01", ...FAEHR),
    o("dorf_brunnen_01", PLATZ.x, PLATZ.y + 0.6), o("k_stand_rot", 29.5, 113.5), o("k_stand_gruen", 40.5, 116), o("k_faesser", 33.4, 99.4), o("k_kiste", 38.6, 99.6), o("k_banner_rot", 31.6, 93.4), o("k_banner_rot", 38.4, 93.4),
    ...[[W0 + 3, GW - 2.6], [W0 + 3, GW + 3.2], [GN - 3, N0 + 3.6], [GN + 3, N0 + 3.6], [W1 - 3, GO - 2.6], [W1 - 3, GO + 3.2]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
    o("dorf_bruecke_01", 64.4, GO + 2.6), o("graufurt_faehre_01", 71.5, GO + 6.4), o("graufurt_turm_ost_01", 92, 104), o("wald_baumstamm_01", 51.5, 15.6), o("dorf_holzstapel_01", 60, GO - 2));
  for (let i = 0; i < 4000 && dinge.filter((d) => d.objekt.startsWith("k_fels")).length < 26; i++) { const x = +(8 + wurf() * 50).toFixed(2), y = +(20 + wurf() * (H - 30)).toFixed(2);
    if ((x > W0 - 6 && x < W1 + 6 && y > N0 - 6 && y < S0 + 6) || imFluss(x, y) || Math.abs(x - flussX(y)) < 9 || strecke(x, y, UFERWEG) < 4 || Math.abs(y - sy(x)) < 6 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 7)) continue;
    dinge.push(o(["k_fels_gross", "k_fels_klein", "k_fels_breit"][Math.floor(wurf() * 3)], x, y)); }
  for (let i = 0; i < 3000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 40; i++) { const y = +(wurf() * H).toFixed(2), seite = wurf() < 0.5 ? -1 : 1, x = +(flussX(y) + seite * (6.4 + wurf() * 1.2)).toFixed(2);
    if (Math.abs(y - GO - 3) < 8 || Math.hypot(x - 92, y - 104) < 9 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 2.4)) continue; dinge.push(o(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y)); }
  const frei = (x, y) => (x > W0 - 4 && x < W1 + 4 && y > N0 - 4 && y < S0 + 4) || imFluss(x, y) || strecke(x, y, UFERWEG) < 3 || strecke(x, y, WASSERWEG) < 3 || (x < W0 && Math.abs(y - sy(x)) < 6) || Math.hypot(x - 92, (y - 104) * 1.2) < 9 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 3);
  const baeume = wald(B, H, (x, y) => !frei(x, y) && (g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))] === "f" || wurf() < 0.22), 1.0);
  const spiel = { start: [[3, sy(3)]],
    figuren: [{ id: "wache_west_1", rolle: "wache", figur: "wache", x: W0 - 2.2, y: GW - 2.6 }, { id: "wache_west_2", rolle: "wache", figur: "wache", x: W0 - 2.2, y: GW + 3, links: true },
      { id: "kraemer", rolle: "haendler", figur: "kraemer", x: 29.5, y: 115.6 }, { id: "faehrmann", rolle: "npc", figur: "wanderer", x: 62, y: GO + 1.2, links: true }, { id: "ausrufer", rolle: "npc", figur: "ausrufer", x: 36, y: 104, links: true }],
    spawnzonen: [],
    interaktionen: [lies("bergfried_tuer", ...tuer("graufurt_bergfried_01", ...BERG), "Der Bergfried von Graufurt. Von oben sieht man weit über den grauen Fluss."),
      lies("faehrhaus_tuer", ...tuer("graufurt_faehrhaus_01", ...FAEHR), "Das Fährhaus. Hinter dem Tresen hängen Seile, Haken und eine Karte des Flusses."),
      lies("faehre", 61.6, GO + 1.4, "Die Fähre liegt schief an der Anlegestelle. Ihre schwere Eisenkette ist gerissen – so kommt niemand über den Fluss."),
      lies("turm_ansehen", 62, 104, "Drüben am Ostufer steht ein Turm. In seinem obersten Fenster brennt ein grünes Licht, das nicht flackert."),
      lies("uferweg_sperre", 51.5, 17.4, "Ein umgestürzter Baum versperrt den Uferweg nach Norden. Hier geht es noch nicht weiter.")],
    ausgaenge: [], kollision: { sperren: [...PFEILER, { art: "rechteck", x0: 0, y0: 14.6, x1: flussX(15) - 6, y1: 15.8 }, { art: "rechteck", x0: 0, y0: 0, x1: 1, y1: 15.8 }], freigeben: [{ art: "rechteck", x0: 59.5, y0: GO, x1: 67.4, y1: GO + 2.6 }]   /* Anlegestelle: vom Ufer bis zum Ende des Stegs */ } };
  schreibe("graufurt", { id: "graufurt", name: "Graufurt", untertitel: "Die Vorfeste am grauen Fluss", ursprung: [208, 200], chunks: [4, 11], biom: "dorf", stufe: 1 }, g, [...dinge, ...baeume], spiel); }
