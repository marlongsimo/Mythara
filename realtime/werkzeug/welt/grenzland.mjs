/*
 * World Pipeline – Grenzland verfeinern (#90, 27.11.2026).
 *   1. Kleine Orte am Nordrand des Grenzlands (Festland, Plan welt/festland/plan_grenzland.json): Gehöft, Mühle am Bach, Köhlerhütte, Schrein, Ruine –
 *      mit einem Pfad vom Friedhof im Nordwald.
 *   2. Details in den alten Dörfern (welt/orte_details.json, orte.mjs trägt sie ein): Holzstapel, Fässer und Kisten an den Hauswänden, Zäune an den Feldern,
 *      Steine in den Wiesen, Blumeninseln vor den Häusern. Nie auf Wegen, nie vor Türen, nie nahe an Quest- und Bedienstellen, Figuren oder Sperren.
 *   3. Ortsnamen und Grenzen (welt/ortsnamen.json) für Weltkarte und Schriftzug beim Betreten (baut die Oberfläche).
 * Aufruf (im Ordner realtime): node werkzeug/welt/grenzland.mjs – vor festland.py und orte.mjs.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const C = 32, BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 9090; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const REG = {}; for (const n of readdirSync(join(WELT, "regionen"))) { const p = join(WELT, "regionen", n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  REG[n] = { r, x0: r.ursprung[0] * C, y0: r.ursprung[1] * C, b: r.chunks[0] * C, h: r.chunks[1] * C, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n"),
    obj: JSON.parse(readFileSync(join(WELT, "regionen", n, "objekte.json"), "utf8")), spiel: JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8")) }; }
const gebiet = (x, y) => Object.values(REG).find((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h);
const zeichen = (x, y) => { const g = gebiet(x, y); return g ? g.z[Math.floor(y) - g.y0][Math.floor(x) - g.x0] : "?"; };

/* ───── 1. Kleine Orte (Festland) ───── */
const feld = new Map(), objekte = [], interaktionen = [], freigeben = [], eben = [];
const setze = (x, y, c) => { if (!"M".includes(zeichen(x + 0.5, y + 0.5))) feld.set(Math.floor(x) + "," + Math.floor(y), c); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
const ding = (id, objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error(objekt); objekte.push({ id, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }); };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });
export const KLEIN = { gehoeft: [6150, 6236], muehle: [6224, 6282], koehler: [6188, 6262], schrein: [6420, 6300], ruine: [6320, 6232] };
const PFAD = [[6372, 6338], [6380, 6318], [6412, 6304], [6360, 6276], [6320, 6246], [6262, 6258], [6232, 6272], [6206, 6256], [6186, 6252], [6160, 6244]];
male(6150, 6230, 6420, 6345, (x, y) => (strecke(x, y, PFAD) < 0.9 + 0.1 * welle(x, y) ? "e" : null));
{ const [x, y] = KLEIN.gehoeft; male(x - 14, y - 12, x + 14, y + 12, (u, v) => (Math.hypot((u - x) / 13, (v - y) / 11) < 1 ? (v > y + 3 && Math.abs(u - x) < 10 ? "a" : welle(u, v) > 1 ? "," : ".") : null)); eben.push([x - 13, y - 11, x + 13, y + 11]);
  ding("gehoeft_haus", "weidenhain_bauernhaus_01", x - 3, y - 1); ding("gehoeft_stapel", "dorf_holzstapel_01", x + 5, y - 2); ding("gehoeft_fass", "k_faesser", x - 9, y - 2);
  for (let i = -8; i <= 8; i += 2.4) ding("gehoeft_zaun_" + Math.round(i + 10), "k_zaun", x + i, y + 3.4);
  lies("gehoeft", x, y + 1.4, "Ein einsames Gehöft am Rand des Grenzlands. Der Bauer grüßt mit der Mistgabel."); }
{ const [x, y] = KLEIN.muehle, BACH = [[6200, 6266], [6212, 6276], [6222, 6284], [6240, 6292], [6262, 6302], [6290, 6318], [6304, 6330]];
  male(6196, 6260, 6310, 6334, (u, v) => (strecke(u, v, BACH) < 1.2 + 0.2 * Math.sin(u / 4) ? "~" : null));
  ding("muehle_haus", "moor_kate_02", x + 4, y - 3); ding("muehle_rad", "hand_wasserrad_01", x - 0.5, y + 1); ding("muehle_saecke", "k_kiste", x + 8, y - 1);
  lies("muehle_am_bach", x + 3, y - 1.4, "Eine kleine Mühle am Bach. Das Rad dreht sich gemächlich, drinnen klappert der Mahlstein."); }
{ const [x, y] = KLEIN.koehler; male(x - 7, y - 6, x + 7, y + 6, (u, v) => (Math.hypot(u - x, v - y) < 6 ? (welle(u, v) > 0.3 ? "t" : "g") : null));
  ding("koehler_meiler", "wald_meiler_01", x + 2, y + 1); ding("koehler_huette", "dorf_huette_holz_02", x - 4, y - 2); ding("koehler_holz", "dorf_holzstapel_01", x + 4, y - 3);
  lies("koehlerhuette", x - 3, y + 0.6, "Eine Köhlerhütte. Der Meiler qualmt, und alles hier riecht nach Rauch und Harz."); }
{ const [x, y] = KLEIN.schrein; male(x - 5, y - 4, x + 5, y + 4, (u, v) => (Math.hypot(u - x, v - y) < 3.6 ? "p" : null));
  ding("schrein_grenzland", "moor_schrein_01", x, y - 0.5); ding("schrein_stein_1", "moor_menhir_01", x - 3, y - 1); ding("schrein_stein_2", "moor_menhir_02", x + 3, y - 1, { spiegeln: true });
  lies("schrein", x, y + 1.6, "Ein kleiner Schrein am Weg. Jemand hat frische Blumen und einen Splitter hineingelegt."); }
{ const [x, y] = KLEIN.ruine; male(x - 10, y - 8, x + 10, y + 8, (u, v) => (Math.hypot((u - x) / 9, (v - y) / 7) < 1 ? (welle(u, v) > 0.5 ? "g" : ".") : null));
  for (const [o, dx, dy] of [["k_ruine_mauer", -5, -4], ["k_ruine_halbmauer", 0, -4.5], ["k_ruine_mauer_tief", 5, -3.5], ["k_ruine_saeule", -6, 2], ["k_ruine_turmstumpf", 6, 2], ["k_truemmer", 1, 3]]) ding("ruine_grenzland_" + (objekte.length + 1), o, x + dx, y + dy);
  lies("ruine", x, y + 0.8, "Die Ruine eines Wachhauses der alten Wacht. Im Mörtel stecken Pfeilspitzen."); }

/* ───── 2. Details in den alten Dörfern ───── */
const DOERFER = ["waldmark", "weidenhain", "osthof", "waldweg", "nordwald", "rabenmoor", "obstwiesen", "westmark"];
const BED = existsSync(join(WELT, "bedienstellen.json")) ? JSON.parse(readFileSync(join(WELT, "bedienstellen.json"), "utf8")).stationen : [];
const schutz = [];
for (const n of DOERFER) { const g = REG[n]; for (const i of g.spiel.interaktionen) schutz.push([g.x0 + i.x, g.y0 + i.y, 3]); for (const f of g.spiel.figuren || []) schutz.push([g.x0 + f.x, g.y0 + f.y, 3]);
  for (const s of g.spiel.kollision?.sperren || []) schutz.push([g.x0 + (s.x0 + s.x1) / 2, g.y0 + (s.y0 + s.y1) / 2, Math.hypot(s.x1 - s.x0, s.y1 - s.y0) / 2 + 2]); }
for (const s of BED) schutz.push([s.x, s.y, 3]);
for (const f of ["kraeuter_standorte.json", "troedler_standorte.json", "seelenlicht_standorte.json"]) if (existsSync(join(WELT, f))) { const j = JSON.parse(readFileSync(join(WELT, f), "utf8")); for (const p of [...(j.stellen || []), ...(j.standorte || []), ...(j.lichter || [])]) schutz.push([p.x, p.y, 3]); }
for (const f of ["../shared/bergbau_standorte.json", "../shared/holz_standorte.json"]) if (existsSync(join(WELT, f))) { const s = JSON.stringify(JSON.parse(readFileSync(join(WELT, f), "utf8"))); for (const m of s.matchAll(/"x":([\d.]+),"y":([\d.]+)/g)) schutz.push([+m[1], +m[2], 3.5]); }
const alleObj = []; for (const n of DOERFER) { const g = REG[n]; for (const o of g.obj) if (!o.id.startsWith("ort_d_")) alleObj.push([g.x0 + o.x, g.y0 + o.y, o]); }
const neu = [], flaechen = [];
const frei = (x, y, r = 1.8) => { const c = zeichen(x, y); if (!".,vtfga".includes(c)) return false; for (let a = 0; a < 6.3; a += 0.8) if (!".,vtfgams".includes(zeichen(x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4))) return false;
  if (schutz.some(([a, b, s]) => Math.hypot(a - x, b - y) < s)) return false; if (neu.some((o) => Math.hypot(o.x - x, o.y - y) < r)) return false;
  for (const [a, b, o] of alleObj) { const d = BIB.get(o.objekt), k = d?.kollision; const rr = k?.art === "gebaeude" ? 0.2 : d?.kategorie === "bewuchs" ? 3.2 : 1.4; if (Math.hypot(a - x, b - y) < rr) return false; if (d?.kategorie === "bewuchs" && b > y && b - y < 7 && Math.abs(a - x) < 3.5) return false; } return true; };   /* nicht unter Baumkronen */
const KLEINKRAM = ["dorf_holzstapel_01", "k_faesser", "k_kiste", "dorf_holzstapel_01", "k_faesser"];
let nr = 0;
for (const n of DOERFER) { const g = REG[n]; let haus = 0, zaun = 0, stein = 0, blume = 0;
  /* an den Hauswänden: seitlich, eine Feldbreite neben dem Haus, nicht vorn */
  for (const o of g.obj) { const k = BIB.get(o.objekt)?.kollision; if (k?.art !== "gebaeude") continue; const kk = k.koerper[0], s = o.s ?? 1, sp = o.spiegeln ? -1 : 1, x = g.x0 + o.x, y = g.y0 + o.y;
    const xa = x + Math.min(kk.x0 * sp, kk.x1 * sp) * s, xb = x + Math.max(kk.x0 * sp, kk.x1 * sp) * s, ya = y + kk.y0 * s;
    for (const [px, py] of [[xa - 1.1, y - 1.2], [xb + 1.1, y - 1.2], [xa - 1.1, ya + 1], [xb + 1.1, ya + 1]]) { if (wurf() < 0.45 || !frei(px, py)) continue;
      neu.push({ id: `ort_d_${n}_${++nr}`, objekt: KLEINKRAM[Math.floor(wurf() * KLEINKRAM.length)], x: +px.toFixed(2), y: +py.toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); haus++; }
    /* Blumen vor dem Haus, seitlich der Tür */
    if (blume < 4 && wurf() < 0.5) { const bx = xb + 2.2, by = y + 1.6; if (".,".includes(zeichen(bx, by)) && !schutz.some(([a, b, s]) => Math.hypot(a - bx, b - by) < s)) { flaechen.push({ name: `Blumen ${n} ${nr}`, x: bx, y: by, r: 1.6, zeichen: ",", auf: ".", frei: 0 }); blume++; } } }
  /* Zäune an den Feldern: obere Kante jeder Ackerfläche */
  const acker = new Set(); for (let j = 0; j < g.h; j++) for (let i = 0; i < g.b; i++) if (g.z[j]?.[i] === "a") acker.add(i + "," + j);
  for (const key of acker) { const [i, j] = key.split(",").map(Number); if (acker.has(i + "," + (j - 1)) || i % 3 !== 0) continue; const x = g.x0 + i + 0.5, y = g.y0 + j - 0.2;
    if (zaun > 40 || !".,vtfg".includes(zeichen(x, y - 0.8)) || schutz.some(([a, b, s]) => Math.hypot(a - x, b - y) < s) || neu.some((o) => Math.hypot(o.x - x, o.y - y) < 2)) continue;
    neu.push({ id: `ort_d_${n}_${++nr}`, objekt: "k_zaun", x: +x.toFixed(2), y: +y.toFixed(2) }); zaun++; }
  /* Steine in Wiesen und Waldsäumen */
  for (let v = 0; v < 400 && stein < (["waldmark", "weidenhain", "osthof", "rabenmoor"].includes(n) ? 0 : 8); v++) {   /* in Dörfern keine Steine */ const x = g.x0 + 4 + wurf() * (g.b - 8), y = g.y0 + 4 + wurf() * (g.h - 8); if (!".,v".includes(zeichen(x, y)) || !frei(x, y, 6)) continue;
    let wegNah = false; for (let a = 0; a < 6.3; a += 0.6) for (let d = 1; d < 3.5; d += 1) if ("ekpd".includes(zeichen(x + Math.cos(a) * d, y + Math.sin(a) * d))) wegNah = true; if (wegNah) continue;
    neu.push({ id: `ort_d_${n}_${++nr}`, objekt: "hoehle_felswand_01", x: +x.toFixed(2), y: +y.toFixed(2), s: +(0.3 + wurf() * 0.15).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); stein++; }
  console.log(`  ${n}: ${haus} an Häusern, ${zaun} Zaunstücke, ${stein} Steine, ${blume} Blumeninseln`); }

/* Pfadstück im Nordwald zum Friedhof */
const wege = [{ name: "Pfad vom Friedhof nach Norden (#90)", breite: 1.6, punkte: [[6374, 6356], [6373, 6345], [6372, 6338], [6372, 6333]] }];

/* ───── 3. Ortsnamen ───── */
const NAMEN = { waldmark: ["Die Waldmark", "Stadt"], weidenhain: ["Weidenhain", "Dorf"], osthof: ["Der Osthof", "Gehöft"], waldweg: ["Der Kreuzwald", "Wald"], nordwald: ["Der Nordwald", "Wald"], rabenmoor: ["Rabenmoor", "Dorf"],
  obstwiesen: ["Die Obstwiesen", "Landschaft"], westmark: ["Die Westmark", "Landschaft"], westried: ["Die Riedwiesen", "Landschaft"], aschenwerth: ["Aschenwerth", "Ruineninsel"], nordsaum: ["Der Nordsaum", "Wald"],
  osthang: ["Der Osthang", "Landschaft"], graufurt: ["Graufurt", "Stadt"], ostufer: ["Das Ostufer", "Landschaft"] };
const orte = Object.entries(NAMEN).filter(([n]) => REG[n]).map(([n, [name, art]]) => { const g = REG[n]; return { id: n, name, art, untertitel: g.r.untertitel || "", grenze: [g.x0, g.y0, g.x0 + g.b, g.y0 + g.h], schrift: [g.x0 + g.b / 2, g.y0 + g.h / 2] }; });
const PUNKTE = [["Kreuzweg", "Kreuzung", 6506, 6508], ["Heidrast", "Dorf", 6596, 5872], ["Grauwacht", "Stadt", 6706, 5740], ["Hügelgräber", "Ort", 6462, 5770], ["Grenzposten", "Ruine", 6640, 6112], ["Kernbaum-Tal", "Tal", 6236, 5778],
  ["Glutbrunn", "Stadt", 7160, 6950], ["Salzpfanne", "Ort", 7330, 6642], ["Der versandete Tempel", "Ort", 7112, 6680], ["Oase", "Ort", 7256, 6800], ["Ende des Grases", "Wegmarke", 6914, 6742],
  ["Kielmund", "Stadt", 6426, 7314], ["Möwenbucht", "Dorf", 6214, 7160], ["Leuchtturm", "Ort", 6176, 7036], ["Kräuterhof", "Ort", 6418, 7064], ["Mangroven", "Landschaft", 6508, 7590],
  ["Gehöft", "Ort", ...KLEIN.gehoeft], ["Mühle am Bach", "Ort", ...KLEIN.muehle], ["Köhlerhütte", "Ort", ...KLEIN.koehler], ["Schrein", "Ort", ...KLEIN.schrein], ["Alte Wachruine", "Ruine", ...KLEIN.ruine],
  ["Die Fahlen Weiten", "Landschaft", 6450, 5700], ["Die Glutsande", "Landschaft", 7200, 6750], ["Die Smaragdküste", "Landschaft", 6330, 7150], ["Die Furtklamm", "Ort", 6684, 6443], ["Heckenhof", "Gehöft", 6490, 6812], ["Summweide", "Ort", 6418, 6904], ["Schilfsee", "Ort", 6450, 7188], ["Erlengrund", "Dorf", 6392, 7004], ["Lehmfurt", "Dorf", 6466, 7244], ["Wegkapelle am Kreuzstein", "Ort", 6476, 7098], ["Halber Weg", "Wegmarke", 6474, 7010], ["Fährtenlager", "Ort", 6608, 6834], ["Lämmerhang", "Ort", 6292, 7096], ["Distelhof", "Gehöft", 6560, 6966], ["Der Turm mit dem grünen Licht", "Ort", 6840, 6518]];
/* Welt beleben (#140): Haferstedt, Netzbucht, Sandquell, Nordstrand aus welt/beleben_orte.json (beleben.mjs) */
for (const f of ["beleben_orte.json", "hochlande_orte.json", "fahleweiten_orte.json", "ockerlande_orte.json"]) if (existsSync(join(WELT, f))) PUNKTE.push(...JSON.parse(readFileSync(join(WELT, f), "utf8")).namen);   /* #140, Hochlande #147 */

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let z = ""; for (let x = X0; x <= X1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
writeFileSync(join(WELT, "festland", "plan_grenzland.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/grenzland.mjs (#90). Weltfelder.", gelaende: patches, hoehen: [], eben, objekte, interaktionen, sperren: [], freigeben }) + "\n");
writeFileSync(join(WELT, "orte_details.json"), JSON.stringify({ _hinweis: "Erzeugt von werkzeug/welt/grenzland.mjs (#90): Details in den alten Dörfern (Kennungen ort_d_…) – orte.mjs trägt sie ein.", wege, flaechen, objekte: neu }, null, 1) + "\n");
writeFileSync(join(WELT, "ortsnamen.json"), JSON.stringify({ hinweis: "Ortsnamen und Grenzen (#90) für die Weltkarte und den Schriftzug beim Betreten (Oberfläche). gebiete: Grenze [x0, y0, x1, y1] und Schriftpunkt in Weltfeldern; orte: einzelne Namen auf der Karte.",
  gebiete: orte, orte: PUNKTE.map(([name, art, x, y]) => ({ name, art, x, y })) }, null, 1) + "\n");
console.log(`Grenzland: ${Object.keys(KLEIN).length} kleine Orte, ${neu.length} Details, ${flaechen.length} Blumeninseln, ${orte.length} Gebietsnamen, ${PUNKTE.length} Ortsnamen`);
