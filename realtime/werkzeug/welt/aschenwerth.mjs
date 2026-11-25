/*
 * World Pipeline – Westried und Aschenwerth (25.11.2026): ein Streifen Marschland westlich der bisherigen Welt (Chunks 192–195, 4 breit),
 * damit die Welt ein lückenloses Rechteck bleibt.
 *   westried     (192|198, 4 × 8): unbegehbares Marschland neben Nordwald und Westmark – Moorwasser, Riedbulten, tote Erlen, Nebel.
 *                Am Ostrand ein schmaler Saum wie beim Nachbarn (Wald, Wiese, Torf), damit die Grenzen bündig sind; dahinter nur Wasser.
 *   aschenwerth  (192|206, 4 × 5): eine größere Insel mit Ruinen mitten im Sumpf, rundherum Moor – erreichbar nur über die alte Brücke
 *                aus Rabenmoor (Brückenkopf in rabenmoor.mjs). Auf der Insel: zerfallenes Heiligtum mit Säulenhalle und Altar,
 *                eingestürzte Türme, ein überwachsener Friedhof mit Gruft, ein Menhirkreis, tote Bäume, Irrlichter und Nebel.
 * Aufruf (im Ordner realtime): node werkzeug/welt/aschenwerth.mjs     danach: node werkzeug/welt/bauen.mjs westried aschenwerth
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const C = 32, X0 = 192 * C, X1 = 196 * C, Y0 = 198 * C, Y1 = 211 * C, GRENZE = 206 * C;
let saat = 2511; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const gl = (t) => t * t * (3 - 2 * t);
const wert = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = gl(x - xi), fy = gl(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; };
const n2 = (x, y, s, o = 0) => (wert(x / s + o, y / s - o) * 0.65 + wert(x / (s * 0.45) + 9 + o, y / (s * 0.45) + 3) * 0.35) * 2 - 1;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));

/* ───── Nachbarn im Osten: ihre Westkante (x = 6272) Zeile für Zeile ───── */
const kante = new Map();
for (const id of ["nordwald", "westmark", "rabenmoor"]) { const r = JSON.parse(readFileSync(join(WELT, "regionen", id, "region.json"), "utf8")), z = readFileSync(join(WELT, "regionen", id, "gelaende.txt"), "utf8").split("\n");
  z.forEach((zeile, j) => { if (zeile) kante.set(r.ursprung[1] * C + j, zeile[0]); }); }
const LAND = new Set(["f", ".", ",", "v", "t", "m", "e", "k", "p", "a", "s"]);

/* ───── die Insel und die Brücke (Weltfelder) ───── */
const INSEL = { x: 6194, y: 6680, rx: 36, ry: 30 };
const welle = (x, y) => 1 + 0.1 * n2(x, y, 9, 3) + 0.06 * n2(x, y, 4, 8);
const inInsel = (x, y, k = 1) => Math.hypot((x - INSEL.x) / INSEL.rx, (y - INSEL.y) / INSEL.ry) < k * welle(x, y);
const BRUECKE_Y = 6656 + 45.6;   /* wie in rabenmoor.mjs (dort y = 45.6) */
const TEILE = ["moor_bruecke_alt_03", "moor_bruecke_alt_01", "moor_bruecke_alt_02", "moor_bruecke_alt_01", "moor_bruecke_alt_03", "moor_bruecke_alt_02", "moor_bruecke_alt_01"];
const BRUECKE = [6269, 6263, 6257, 6251, 6245, 6239, 6233].map((x, i) => ({ objekt: TEILE[i], x, y: BRUECKE_Y }));
const LANDUNG = [6224, BRUECKE_Y - 1.3];   /* Westende der Brücke: hier beginnt die Insel */
const aufBahn = (x, y, r = 0) => x > LANDUNG[0] - 2 && x < X1 + 1 && y > BRUECKE_Y - 2.6 - r && y < BRUECKE_Y + r;
/* Heiligtum: Mauergeviert mit Säulenhalle; Tor im Süden, der Pfad kommt von der Brücke */
const H = { x0: 6176, x1: 6208, y0: 6658, y1: 6688, tor: 6192 };
const PFAD = [[LANDUNG[0] + 3, LANDUNG[1]], [6214, BRUECKE_Y - 1.5], [6200, 6698], [H.tor, H.y1 + 1], [H.tor, H.y1 - 4]];
const FRIEDHOF = { x: 6170, y: 6700, r: 9 }, KREIS = { x: 6216, y: 6664, r: 6.5 };

/* ───── Gelände ───── */
const B = X1 - X0, HH = Y1 - Y0, G = Array.from({ length: HH }, () => Array(B).fill("o"));
for (let j = 0; j < HH; j++) for (let i = 0; i < B; i++) { const x = X0 + i + 0.5, y = Y0 + j + 0.5, r1 = n2(x, y, 14, 2), r2 = n2(x, y, 5, 6); let c = "o";
  if (inInsel(x, y)) { /* Insel: Torf und Moorwiese, am Rand Schlamm; im Heiligtum altes, zerbrochenes Pflaster */
    c = !inInsel(x, y, 0.9) ? "m" : r2 > 0.35 ? "t" : "v";
    if (x > H.x0 && x < H.x1 && y > H.y0 && y < H.y1) c = r2 > 0.18 || (r2 > -0.1 && hash(Math.floor(x), Math.floor(y)) < 0.45) ? "p" : r1 > 0 ? "t" : "v";   /* aufgebrochenes Pflaster */
    if (Math.hypot(x - FRIEDHOF.x, (y - FRIEDHOF.y) * 1.2) < FRIEDHOF.r) c = r2 > 0.4 ? "t" : "v";
    if (strecke(x, y, PFAD) < 1.1) c = r2 > 0.55 ? "t" : "e"; }
  else if (Math.hypot(x - LANDUNG[0], (y - LANDUNG[1]) * 1.4) < 7) c = "m";   /* Landestelle: Schlamm bis an die Brücke */
  else if (!inInsel(x, y, 1.25) && !aufBahn(x, y, 3.5) && y > Y0 + 3 && Math.abs(y - GRENZE) > 5 && x < X1 - 8 && r1 > 0.5 && r2 > -0.2) c = r2 > 0.5 ? "t" : "v";   /* Riedbulten: einzeln, unerreichbar */
  /* Ostrand wie der Nachbar (bündige Grenze), 3 Felder breit; Land davon wird zum schmalen Saum */
  if (x > X1 - 3) { const k = kante.get(Math.floor(y)) || "o"; c = LAND.has(k) ? (k === "e" || k === "k" || k === "p" ? "t" : k) : "o"; }
  G[j][i] = c; }
/* die Grenze zwischen westried und aschenwerth: überall Wasser (außer im Saum), damit Wasser auf Wasser trifft */
for (let y = GRENZE - 4; y < GRENZE + 4; y++) for (let i = 0; i < B - 3; i++) G[y - Y0][i] = "o";
const feld = (x, y) => G[Math.floor(y) - Y0]?.[Math.floor(x) - X0] ?? "o";

/* ───── Dinge ───── */
const dinge = [], lesen = [];
const ding = (objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekannt: " + objekt); dinge.push({ objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }); };
for (const b of BRUECKE) ding(b.objekt, b.x, b.y, b.objekt.endsWith("_02") ? { spiegeln: true } : {});
/* Heiligtum: Mauern mit Lücken, Türme an zwei Ecken, Säulenhalle, Altar */
const luecke = (v) => hash(Math.floor(v), 77) < 0.28;
for (let x = H.x0 + 1; x < H.x1 - 1; x += 3) { if (!luecke(x)) ding(hash(x, 1) < 0.5 ? "k_ruine_mauer" : "k_ruine_halbmauer", x + 1.5, H.y0 + 0.5);
  if (Math.abs(x + 1.5 - H.tor) > 3 && !luecke(x + 3)) ding(hash(x, 2) < 0.5 ? "k_ruine_mauer" : "k_ruine_halbmauer", x + 1.5, H.y1); }
for (let y = H.y0 + 3; y < H.y1 - 2; y += 3) { if (!luecke(y)) ding(hash(y, 3) < 0.5 ? "k_ruine_mauer_tief" : "k_ruine_halbmauer_tief", H.x0 + 0.5, y + 3);
  if (!luecke(y + 5)) ding(hash(y, 4) < 0.5 ? "k_ruine_mauer_tief" : "k_ruine_halbmauer_tief", H.x1 - 0.5, y + 3); }
ding("k_ruine_turmstumpf", H.x0 + 1.5, H.y0 + 2.5); ding("k_ruine_turmstumpf", H.x1 - 1.5, H.y1 - 0.5);
for (const s of [-1, 1]) for (let y = H.y0 + 7; y < H.y1 - 5; y += 4) ding(hash(y, s + 5) < 0.35 ? "k_ruine_saeule" : hash(y, s + 9) < 0.7 ? "k_ruine_saeule_ganz" : "k_saeule_gross", H.tor + s * 5, y);
ding("k_altar_stein", H.tor, H.y0 + 5.6); ding("k_obelisk", H.tor - 9, H.y0 + 5); ding("k_obelisk", H.tor + 9, H.y0 + 5);
for (const [dx, dy] of [[-3, 13], [6.5, 9], [-8, 19], [2.5, 22], [11, 17], [-12, 11]]) ding("k_truemmer", H.tor + dx, H.y0 + dy, hash(dx, dy) < 0.5 ? { spiegeln: true } : {});
ding("stil_erle_tot_01", H.x0 + 5, H.y1 - 4); ding("stil_erle_tot_02", H.x1 - 6, H.y0 + 6, { spiegeln: true });
/* Friedhof mit Gruft, Menhirkreis, tote Bäume und Birken am Rand */
ding("k_gruft", FRIEDHOF.x, FRIEDHOF.y - 2.5);
for (let i = 0; i < 9; i++) { const w = (i / 9) * Math.PI * 2 + 0.3, r = 4 + (i % 3) * 1.6; ding(["k_grabstein_kreuz", "k_grabstein_rund", "k_grabstein_zerbrochen", "k_grabstein_breit"][i % 4], FRIEDHOF.x + Math.cos(w) * r, FRIEDHOF.y + 1.5 + Math.sin(w) * r * 0.6, i % 2 ? { spiegeln: true } : {}); }
for (let i = 0; i < 7; i++) { const w = (i / 7) * Math.PI * 2; ding(i % 3 === 1 ? "moor_menhir_02" : "moor_menhir_01", KREIS.x + Math.cos(w) * KREIS.r, KREIS.y + Math.sin(w) * KREIS.r * 0.75, i % 2 ? { spiegeln: true } : {}); }
ding("moor_schrein_01", KREIS.x, KREIS.y + 0.6);
for (const [x, y, id] of [[6166, 6668, "stil_erle_tot_01"], [6222, 6688, "stil_erle_tot_02"], [6180, 6712, "stil_birke_01"], [6210, 6705, "stil_erle_tot_01"], [6164, 6690, "stil_birke_01"], [6227, 6672, "stil_erle_tot_02"]])
  ding(id, x, y, { s: +(0.85 + hash(x, y) * 0.3).toFixed(2), ...(hash(y, x) < 0.5 ? { spiegeln: true } : {}) });
/* Moor ringsum: Schilf an allen Ufern, tote Erlen auf den Bulten, Irrlichter und Nebel über dem Wasser – nicht auf der Brücke */
const frei = (x, y, ab) => !aufBahn(x, y, 2.5) && dinge.every((d) => Math.hypot(d.x - x, d.y - y) >= ab);
const amUfer = (x, y) => feld(x, y) === "o" && [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]].some(([dx, dy]) => feld(x + dx, y + dy) !== "o");
for (let i = 0; i < 30000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 260; i++) { const x = X0 + 1 + wurf() * (B - 6), y = Y0 + 1 + wurf() * (HH - 2);
  if (amUfer(x, y) && frei(x, y, 2.2)) ding(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y, wurf() < 0.5 ? { spiegeln: true } : {}); }
for (let i = 0; i < 20000 && dinge.filter((d) => d.objekt.startsWith("stil_erle_tot")).length < 46; i++) { const x = X0 + 2 + wurf() * (B - 8), y = Y0 + 2 + wurf() * (HH - 4), c = feld(x, y);
  if ((c === "v" || c === "t") && !inInsel(x, y, 1.1) && frei(x, y, 5)) ding(wurf() < 0.6 ? "stil_erle_tot_01" : "stil_erle_tot_02", x, y, { s: +(0.8 + wurf() * 0.35).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
for (let i = 0; i < 20000 && dinge.filter((d) => d.objekt === "stil_moorlicht_01").length < 34; i++) { const x = X0 + 2 + wurf() * (B - 8), y = Y0 + 2 + wurf() * (HH - 4);
  if (feld(x, y) === "o" && !amUfer(x, y) && frei(x, y, 7)) ding("stil_moorlicht_01", x, y); }
for (let i = 0; i < 6000 && dinge.filter((d) => d.objekt === "moor_nebel_01").length < 26; i++) { const x = X0 + 6 + wurf() * (B - 14), y = Y0 + 6 + wurf() * (HH - 12);
  if (feld(x, y) === "o" && !aufBahn(x, y, 4) && !dinge.some((d) => d.objekt === "moor_nebel_01" && Math.hypot(d.x - x, d.y - y) < 15)) ding("moor_nebel_01", x, y, { s: +(1 + wurf() * 0.6).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
/* im Saum am Ostrand: Bäume, wo der Nachbar Wald hat */
for (let y = Y0 + 1.5; y < Y1 - 1; y += 2.4) { const k = kante.get(Math.floor(y)); if (k !== "f") continue; const x = X1 - 1.5 - wurf() * 1.2; if (frei(x, y, 2.2)) ding(["stil_tanne_01", "stil_eiche_01", "stil_tanne_02", "stil_erle_tot_01"][Math.floor(wurf() * 4)], x, y, { s: +(0.85 + wurf() * 0.25).toFixed(2) }); }

/* ───── Lesestellen ───── */
lesen.push({ id: "bruecke_west", x: LANDUNG[0] + 2.5, y: LANDUNG[1] + 1.5, text: "Das Westende der alten Brücke. Hinter dir das Moor und die Lichter von Rabenmoor, vor dir Aschenwerth – eine Insel, auf der niemand mehr wohnt." });
lesen.push({ id: "heiligtum_tor", x: H.tor, y: H.y1 + 2, text: "Das eingestürzte Tor des Heiligtums von Aschenwerth. Über dem Bogen ist ein Zeichen in den Stein geschlagen: ein zerbrochener Kreis." });
lesen.push({ id: "altar", x: H.tor, y: H.y0 + 7.4, text: "Ein Altar aus schwarzem Stein, rissig von Frost und Feuer. In der Mulde liegt Asche, die nie kalt zu werden scheint." });
lesen.push({ id: "gruft", x: FRIEDHOF.x, y: FRIEDHOF.y + 0.6, text: "Eine Gruft, halb im Torf versunken. Die Tür ist mit Ketten verschlossen – von innen." });
lesen.push({ id: "steinkreis", x: KREIS.x, y: KREIS.y + 2.4, text: "Sieben Steine im Kreis, mit Spiralen bedeckt wie die beim Schrein im Rabenmoor. Hier ist es still, selbst die Frösche schweigen." });

/* ───── schreiben ───── */
const REG = [
  { id: "westried", name: "Das Westried", untertitel: "Unbegehbares Marschland am Westrand", ursprung: [192, 198], chunks: [4, 8], biom: "sumpf", stufe: 2 },
  { id: "aschenwerth", name: "Aschenwerth", untertitel: "Die Ruineninsel im Sumpf – nur über die alte Brücke", ursprung: [192, 206], chunks: [4, 5], biom: "sumpf", stufe: 3 }];
for (const R of REG) { const rx0 = R.ursprung[0] * C, ry0 = R.ursprung[1] * C, rb = R.chunks[0] * C, rh = R.chunks[1] * C, drin = (d) => d.x >= rx0 && d.x < rx0 + rb && d.y >= ry0 && d.y < ry0 + rh;
  const zeilen = G.slice(ry0 - Y0, ry0 - Y0 + rh).map((z) => z.join(""));
  let n = 0; const objekte = dinge.filter(drin).map((d) => ({ id: d.objekt.replace(/^(stil|k|moor)_/, "").replace(/_\d+$/, "") + "_" + ++n, ...d, x: +(d.x - rx0).toFixed(2), y: +(d.y - ry0).toFixed(2) })).sort((a, b) => a.y - b.y);
  const ia = lesen.filter(drin).map((l) => ({ id: l.id, art: "lesen", x: +(l.x - rx0).toFixed(1), y: +(l.y - ry0).toFixed(1), radius: 1.8, abgleich: "keiner", daten: { text: l.text } }));
  const freigeben = BRUECKE.filter(drin).map((b) => ({ art: "rechteck", x0: +(b.x - 3 - rx0).toFixed(2), y0: +(b.y - 2.6 - ry0).toFixed(2), x1: +(b.x + 3 - rx0).toFixed(2), y1: +(b.y - ry0).toFixed(2) }));
  /* Start (für die Formprüfung): auf der Insel bzw. im Saum am Ostrand */
  const start = R.id === "aschenwerth" ? [H.tor - rx0, H.y1 + 3 - ry0] : (() => { for (let y = 8; y < rh; y++) if (zeilen[y][rb - 2] !== "o") return [rb - 1.5, y + 0.5]; return [rb - 1.5, 8.5]; })();
  const dir = join(WELT, "regionen", R.id); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "region.json"), JSON.stringify(R, null, 1) + "\n");
  writeFileSync(join(dir, "gelaende.txt"), zeilen.join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  writeFileSync(join(dir, "spiel.json"), JSON.stringify({ start: [start], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben }, interaktionen: ia }, null, 1) + "\n");
  console.log(`${R.id}: ${rb} × ${rh} Felder, ${objekte.length} Objekte, ${ia.length} Lesestellen, ${freigeben.length} Brückenteile`); }
