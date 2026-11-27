/*
 * World Pipeline – Phase 8 vorab (#50, 27.11.2026): die Fahlen Weiten (W3) und Grauwacht.
 * Alles liegt auf dem Festland (Regionen fl_*). Dieses Werkzeug schreibt einen Plan (welt/festland/plan_fahleweiten.json), den festland.py beim
 * Schneiden der Kacheln einarbeitet (Gelände, Höhen, ebene Plätze, Objekte, Lesestellen, Sperren) – so bleibt festland.py die einzige Quelle des Festlands.
 * Dazu die Grabkammern als eigene Gebiete im Untergrund (Chunks 346–350|300).
 *   Nordsaum-Weg (in nordsaum.mjs, mit Dornenwall) → Grenzposten der Wacht (verfallen, Deserteure) → Heidrast (Hirtensiedlung)
 *   → Grauwacht: Burg auf dem Felsrücken, Abtei im Tal mit Glockenturm, Unterstadt, Brücke zur Furt (gesperrt).
 *   Westlich von Heidrast: das Hügelgräberfeld (8 Hügel, 3 begehbar) und das Kernbaum-Tal.
 * Grauwacht in drei Ausbaustufen: Objekte tragen "ausbau" ("verlassen" = immer, "abtei" = ab Stufe Abtei bewohnt, "burg" = ab Burg besetzt) und,
 * wenn sie mit einer Stufe verschwinden, "ausbau_bis". NPC-Plätze stehen in welt/grauwacht_ausbau.json (noch keine Figuren in der Welt).
 * Aufruf (im Ordner realtime): node werkzeug/welt/fahleweiten.mjs && python3 werkzeug/welt/festland.py && (orte, lichtungen, naehte, bauen …)
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 8808; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;

/* ───── Plan ───── */
const feld = new Map(), hoehe = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [];
const setze = (x, y, c) => feld.set(Math.floor(x) + "," + Math.floor(y), c);
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehe.set(k, (hoehe.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
let n = 0; const ding = (objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: (mehr.id || "fw_" + objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|burg|hoehle|welt|wz|holz|waldmark|weidenhain)_/, "").replace(/_\d+$/, "") + "_" + ++n), objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; delete o.id_; objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: mehr.tat ? "eingang" : "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: mehr.tat ? 2.0 : 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const sperre = (x, y, b = 1, h = 1) => sperren.push({ art: "rechteck", x0: x, y0: y, x1: x + b, y1: y + h });
const weg = (punkte, breite = 1.6, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) ? zeichen : null); };
const huegel = (x, y, r, h) => { for (let j = -r - 1; j <= r + 1; j++) for (let i = -r - 1; i <= r + 1; i++) { const d = Math.hypot(i, j) / r; if (d < 1) hebe(x + i, y + j, h * Math.pow(Math.cos(d * Math.PI / 2), 1.4)); } };

/* ───── Wege ───── */
const NORDSAUM_ENDE = [6696, 6336];   /* hier endet der Weg aus nordsaum.mjs am Nordrand der alten Karte */
export const ORTE = { grenzposten: [6640, 6112], heidrast: [6596, 5872], grauwacht: [6706, 5748], graeber: [6462, 5770], kernbaumtal: [6236, 5778] };
const W_NORD = [NORDSAUM_ENDE, [6694, 6300], [6682, 6246], [6662, 6182], [6648, 6124], [6640, 6064], [6628, 6004], [6612, 5944], [6600, 5890]];
const W_GRAUWACHT = [[6604, 5866], [6622, 5846], [6648, 5826], [6676, 5812], [6700, 5800], [6702, 5792]];
const W_GRAEBER = [[6584, 5872], [6556, 5858], [6520, 5830], [6494, 5800], [6476, 5786]];
const W_TAL = [[6444, 5770], [6400, 5778], [6344, 5786], [6288, 5784], [6252, 5780]];
for (const w of [W_NORD, W_GRAUWACHT]) weg(w, 2.2, "k");   /* Straße zwischen Großstädten (#89) */
for (const w of [W_GRAEBER, W_TAL]) weg(w, 1.8);

/* ───── Grenzposten der Wacht (verfallen, Deserteure-Lager) ───── */
{ const [cx, cy] = ORTE.grenzposten; male(cx - 16, cy - 12, cx + 16, cy + 12, (x, y) => Math.hypot((x - cx) / 15, (y - cy) / 11) < 1 + 0.06 * welle(x, y) ? (welle(x, y) > 0.9 ? "g" : ".") : null);
  for (let x = cx - 10; x <= cx + 10; x += 3) { if (Math.abs(x - cx + 4) > 2.5) ding(wurf() < 0.5 ? "k_ruine_mauer" : "k_ruine_halbmauer", x, cy - 7); if (Math.abs(x - cx) > 2.5) ding(wurf() < 0.5 ? "k_ruine_halbmauer" : "k_ruine_mauer_tief", x, cy + 7.5); }
  ding("k_ruine_turmstumpf", cx - 11, cy - 7); ding("k_ruine_turmstumpf", cx + 11, cy + 7);
  ding("welt_zelt_01", cx - 4, cy - 1); ding("welt_zelt_01", cx + 5, cy - 2, { spiegeln: true }); ding("welt_zelt_01", cx + 1, cy + 4);
  ding("dorf_festfeuer_01", cx, cy + 1); ding("k_kiste", cx - 7, cy + 3); ding("k_faesser", cx + 8, cy + 3); ding("k_banner_rot", cx + 3, cy - 6);
  lies("grenzposten", cx - 2, cy + 3.2, "Ein Grenzposten der alten Wacht. Die Mauern sind eingefallen, aber jemand hat Zelte aufgeschlagen und das Feuer brennt noch.");
  lies("grenzposten_wappen", cx + 11, cy + 9.6, "Auf dem Turmstumpf ist ein Wappen in den Stein geschlagen: ein Turm über drei Wellen – jemand hat es mit dem Messer zerkratzt."); }

/* ───── Heidrast (Hirtensiedlung) ───── */
{ const [cx, cy] = ORTE.heidrast; male(cx - 22, cy - 18, cx + 22, cy + 18, (x, y) => { const d = Math.hypot((x - cx) / 20, (y - cy) / 16); return d < 0.35 ? "e" : d < 1 + 0.08 * welle(x, y) ? (welle(x, y) > 1.0 ? "," : ".") : null; });
  eben.push([cx - 20, cy - 16, cx + 20, cy + 16]);
  const KATEN = [["weidenhain_kate_01", -12, -8], ["moor_kate_01", 9, -9], ["dorf_huette_holz_01", -14, 8], ["weidenhain_kate_01", 1, 13], ["moor_kate_02", 13, 7]];
  KATEN.forEach(([o, dx, dy], i) => ding(o, cx + dx, cy + dy, { id: "heidrast_kate_" + (i + 1) }));
  ding("dorf_brunnen_01", cx, cy + 0.6, { id: "heidrast_brunnen" }); ding("moor_menhir_02", cx - 4, cy + 1, { id: "heidrast_wegstein" });
  /* Schafpferch östlich: Zaun mit Gatter im Westen */
  const P = [cx + 22, cy - 6, cx + 34, cy + 6];
  for (let x = P[0] + 1.2; x < P[2]; x += 2.4) { ding("k_zaun", x, P[1]); ding("k_zaun", x, P[3]); }
  for (let y = P[1] + 1.0; y < P[3]; y += 1.7) { if (Math.abs(y - cy) > 1.6) ding("stil_busch_02", P[0], y, { s: 0.7, kollision: { art: "rechteck", x: -0.8, y: -0.9, b: 1.6, h: 1.8 } }); ding("stil_busch_02", P[2], y, { s: 0.7, kollision: { art: "rechteck", x: -0.8, y: -0.9, b: 1.6, h: 1.8 } }); }   /* Seiten: Dornbüsche (Zäune gibt es nur quer) */
  male(P[0], P[1], P[2], P[3], (x, y) => (welle(x, y) > 0.3 ? "t" : "."));
  lies("heidrast", cx + 1.5, cy + 2.4, "Heidrast. Ein paar Katen im Wind, ein Brunnen, ein Pferch. Der Rauch steigt schräg auf, so stark weht es hier.");
  lies("heidrast_wegstein", cx - 4, cy + 2.6, "Ein Wegstein mit eingeritzten Splitterlinien. Hier kann man später den Wegstein binden.");
  lies("schafpferch", P[0] - 1.2, cy, "Der Schafpferch. Im Zaun hängen Wollfetzen – und an einer Stelle ist er von außen eingedrückt.");
  npc.push({ id: "mette_heider", rolle: "Hirtin (E1, „Mettes Schafe“)", x: cx + 2.5, y: cy + 3, ausbau: "verlassen" }, { id: "hirte_1", rolle: "Hirte", x: P[0] + 4, y: cy + 1, ausbau: "verlassen" }); }

/* ───── Grauwacht ───── */
const GW = { burg: [6706, 5704], platz: [6706, 5748], abtei: [6672, 5768] };
{ /* Felsrücken: Ellipse mit Felswänden ringsum, oben eine Hochfläche, im Süden eine Rampe */
  const [bx, by] = GW.burg, RX = 20, RY = 12, RAMPE = [[6706, 5711], [6704, 5718], [6698, 5727], [6699, 5740]];
  const norm = (x, y) => Math.hypot((x - bx) / RX, (y - by) / RY) / (1 + 0.05 * welle(x, y));
  male(bx - RX - 4, by - RY - 4, bx + RX + 4, by + RY + 4, (x, y) => { const d = norm(x, y); if (d > 1.12) return null;
    if (strecke(x, y, RAMPE) < 1.4) return "k"; if (d > 0.8) return d < 1.0 ? "F" : "g"; return x > bx - 9 && x < bx + 9 && y > by - 6 && y < by + 6 ? "p" : "g"; });
  for (let j = -RY - 3; j <= RY + 3; j++) for (let i = -RX - 3; i <= RX + 3; i++) { const x = bx + i, y = by + j, d = norm(x + 0.5, y + 0.5); if (d < 1.05) hebe(x, y, 2.8 * (d < 0.8 ? 1 : Math.max(0, (1.05 - d) / 0.25))); }
  for (let t = 0; t <= 1; t += 0.02) { const k = Math.floor(t * (RAMPE.length - 1)), u = t * (RAMPE.length - 1) - k, a = RAMPE[k], b = RAMPE[Math.min(k + 1, RAMPE.length - 1)]; const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) hebe(x + i, y + j, 0); }
  /* Burg: Mauerring mit Torhaus im Süden, Bergfried, zwei Ecktürme */
  const W0 = bx - 9, W1 = bx + 9, N0 = by - 6, S0 = by + 6;
  for (let x = W0 + 2; x < W1 - 1; x += 2) { ding("burg_mauer_quer", x + 1, N0 + 1); if (Math.abs(x + 1 - bx) > 2.6) ding("burg_mauer_quer", x + 1, S0 + 1); }
  for (let y = N0 + 2; y < S0 - 1; y += 2) { ding("burg_mauer_laengs", W0, y + 2); ding("burg_mauer_laengs", W1, y + 2); }
  for (const [x, y] of [[W0, N0 + 1.3], [W1, N0 + 1.3], [W0, S0 + 1.3], [W1, S0 + 1.3]]) ding("burg_eckturm", x, y);
  ding("burg_torhaus", bx, S0 + 1, { id: "grauwacht_burgtor" }); ding("graufurt_bergfried_01", bx, by - 0.5, { id: "grauwacht_bergfried" });
  ding("k_banner_rot", bx - 3, S0 + 2.4, { ausbau: "burg" }); ding("k_banner_rot", bx + 3, S0 + 2.4, { ausbau: "burg" });
  ding("k_faesser", W0 + 3, N0 + 3.5, { ausbau: "burg" }); ding("k_kiste", W1 - 3, N0 + 3.5, { ausbau: "burg" }); ding("moor_feuerkorb_01", bx - 4, by + 3, { ausbau: "burg" });
  ding("k_truemmer", bx + 4, by + 3, { ausbau_bis: "burg" }); ding("k_truemmer", W0 + 3, S0 - 2, { ausbau_bis: "burg", spiegeln: true });
  sperren.push({ art: "rechteck", x0: bx - 1.5, y0: S0 - 0.6, x1: bx - 0.7, y1: S0 + 1 }, { art: "rechteck", x0: bx + 0.7, y0: S0 - 0.6, x1: bx + 1.5, y1: S0 + 1 });
  lies("grauwacht_bergfried_tuer", bx, by + 0.4, "Der Bergfried von Grauwacht. Über der Tür das Wappen der Wacht: ein Turm über drei Wellen.");
  lies("grauwacht_burgtor_innen", bx, S0 - 1.2, "Das Burgtor. Die Flügel hängen schief in den Angeln.");
  npc.push({ id: "wigand_fels", rolle: "Burgvogt (E3, E4)", x: bx + 2, y: by + 2, ausbau: "abtei" }, { id: "burgwache_1", rolle: "Wache am Burgtor", x: bx - 2.4, y: S0 + 3, ausbau: "burg" }, { id: "burgwache_2", rolle: "Wache am Burgtor", x: bx + 2.4, y: S0 + 3, ausbau: "burg" });
  /* Eisen und Schwarzeisen am Fuß des Felsens (gesperrte Aderfelder; Standorte für bergbau_standorte.json) */
  const ADERN = [["eisen_gw_1", 200], ["eisen_gw_2", 160], ["eisen_gw_3", 230], ["schwarzeisen_gw_1", 290], ["schwarzeisen_gw_2", 250]];
  for (const [id, grad] of ADERN) { const w = grad * Math.PI / 180; let x = bx + Math.cos(w) * RX * 1.02, y = by + Math.sin(w) * RY * 1.02; x = Math.floor(x) + 0.5; y = Math.floor(y) + 0.5;
    setze(x, y, "g"); sperre(Math.floor(x), Math.floor(y)); objekte.push({ ader: id, x, y }); }
  /* Unterstadt: Platz, Gassen, Häuser, Markt, Bank, Werkstatt-Hof, Wegstein */
  const [px, py] = GW.platz;
  const GASSEN = [[[px, py], [6688, 5768]], [[px, py], [6699, 5740]], [[px, py], [6726, 5760]], [[px, py], [6702, 5792]], [[6694, 5768], [6716, 5768]]];
  male(px - 30, py - 26, px + 26, py + 50, (x, y) => Math.hypot((x - px) / 7, (y - py) / 5.5) < 1 + 0.05 * welle(x, y) || GASSEN.some((g) => strecke(x, y, g) < 1.2) ? "p" : null);
  eben.push([6686, 5726, 6728, 5796]);
  const HAEUSER = [["graufurt_steinhaus_01", 6694, 5740], ["graufurt_steinhaus_02", 6718, 5740], ["graufurt_steinhaus_01", 6694, 5762], ["graufurt_steinhaus_02", 6718, 5762], ["graufurt_steinhaus_01", 6716, 5778], ["dorf_haus_holz_02", 6692, 5778]];
  HAEUSER.forEach(([o, x, y], i) => ding(o, x, y, { id: "grauwacht_haus_" + (i + 1) }));
  ding("waldmark_bank_01", 6716, 5730, { id: "grauwacht_bank", ausbau: "burg" });
  ding("dorf_brunnen_01", px, py + 0.6, { id: "grauwacht_brunnen" }); ding("moor_menhir_02", px - 6, py + 2, { id: "grauwacht_wegstein", ausbau: "burg" });
  ding("dorf_marktstand_01", px - 4, py - 3, { id: "grauwacht_stand_1", ausbau: "abtei" }); ding("dorf_marktstand_02", px + 4, py - 3, { id: "grauwacht_stand_2", ausbau: "burg" }); ding("k_stand_rot", px + 4.5, py + 5, { id: "grauwacht_stand_waffen", ausbau: "burg" });
  ding("k_truemmer", px - 3, py + 4, { ausbau_bis: "abtei" }); ding("k_truemmer", px + 7, py - 1, { ausbau_bis: "abtei", spiegeln: true }); ding("k_faesser", 6721, 5745, { ausbau_bis: "burg" });
  /* Werkstatt-Hof */
  male(6693, 5781, 6712, 5793, () => "p");
  ding("dorf_schmiede_01", 6699, 5788, { id: "grauwacht_schmiede", ausbau: "burg" }); ding("hand_werkbank_01", 6707, 5790, { id: "grauwacht_werkbank", ausbau: "burg" }); ding("dorf_holzstapel_01", 6709.5, 5786, { ausbau: "burg" });
  lies("grauwacht_platz", px, py + 3.4, "Der Platz von Grauwacht. Die Häuser stehen leer, die Fensterläden schlagen im Wind.");
  lies("grauwacht_bank_tuer", 6716, 5730.6, "Die Bank von Grauwacht – noch geschlossen.", { ausbau: "burg" });
  lies("grauwacht_schmiede_tuer", 6700.5, 5788.6, "Die Schmiede der Unterstadt. Die Esse ist kalt.");
  lies("grauwacht_wegstein", px - 6, py + 3.6, "Ein Wegstein. Er ist stumm, bis Grauwacht wieder lebt.", { ausbau: "burg" });
  npc.push({ id: "haendlerin_markt", rolle: "Händlerin (Markt)", x: px - 4, y: py - 1.4, ausbau: "abtei" }, { id: "waffenhaendler", rolle: "Waffenladen (E3)", x: px + 4.5, y: py + 6.6, ausbau: "burg" },
    { id: "bankier", rolle: "Bank (E3)", x: 6716, y: 5732, ausbau: "burg" }, { id: "schmied", rolle: "Werkstatt (E4)", x: 6703, y: 5790, ausbau: "burg" });
  /* Abtei im Tal: Mauergeviert, Kirche, Glockenturm, Kreuzgarten, Küche mit Herd und Kessel, Bindestein */
  const A = [6656, 5752, 6688, 5786];
  male(A[0], A[1], A[2], A[3], (x, y) => (Math.abs(x - 6672) < 1.2 || Math.abs(y - 5768) < 1.2 ? "p" : x > 6660 && x < 6686 && y > 5766 && y < 5784 ? (welle(x, y) > 0.2 ? "," : ".") : "."));
  for (let x = A[0] + 1.5; x < A[2]; x += 3) { if (Math.abs(x - 6672) > 2.5) { ding("k_ruine_halbmauer", x, A[1]); ding("k_ruine_halbmauer", x, A[3]); } }
  for (let y = A[1] + 3; y < A[3] - 1; y += 3) { if (Math.abs(y - 5768) > 2.5) { ding("k_ruine_saeule_ganz", A[0], y); ding("k_ruine_saeule_ganz", A[2], y); } }   /* Seiten: Säulen des Kreuzgangs */
  ding("dorf_kapelle_01", 6664, 5762, { id: "abtei_kirche" }); ding("graufurt_turm_ost_01", 6680, 5761, { id: "grauwacht_glockenturm", s: 1.6 });
  ding("graufurt_steinhaus_02", 6681, 5781, { id: "abtei_kueche" }); ding("hand_herd_01", 6684.5, 5783.5, { id: "abtei_herd", ausbau: "abtei" }); ding("hand_kessel_01", 6678, 5784, { id: "abtei_kessel", ausbau: "abtei" });
  ding("wz_bindestein", 6668, 5774, { id: "abtei_bindestein", ausbau: "abtei" }); ding("dorf_brunnen_01", 6664, 5779, { id: "abtei_brunnen" });
  ding("k_truemmer", 6676, 5774, { ausbau_bis: "abtei" });
  lies("abtei_kirche_tuer", 6665, 5762.6, "Die Abteikirche. Drinnen brennt eine einzelne Kerze.");
  lies("glocke", 6680, 5762.4, "Der Glockenturm von Grauwacht. Oben hängt die Glocke – ein Riss läuft quer durch die Bronze.", { questobjekt: "glocke" });
  lies("abtei_kessel", 6678, 5785.6, "Der Kessel der Abteiküche.", { ausbau: "abtei" });
  lies("abtei_bindestein", 6668, 5775.6, "Ein Bindestein im Kreuzgarten. Er schläft, bis die Glocke wieder läutet.", { ausbau: "abtei" });
  npc.push({ id: "aebtissin_gunhild", rolle: "Äbtissin (E1, E2, E4)", x: 6669, y: 5765, ausbau: "verlassen" }, { id: "nonne_1", rolle: "Nonne", x: 6674, y: 5779, ausbau: "verlassen" },
    { id: "nonne_2", rolle: "Nonne (Küche)", x: 6682, y: 5785.6, ausbau: "abtei" }, { id: "nonne_3", rolle: "Nonne (Garten)", x: 6662, y: 5772, ausbau: "abtei" });
  /* Brücke zur Furt: die ersten zwei Bögen; die übrigen acht, die Furt dahinter und die Wache baut hochlande.mjs (Phase 11, #147) – keine Sperre mehr */
  weg([[6722, 5760], [6730, 5760.5]], 1.8, "p");
  ding("hochland_steinbruecke_ow", 6733, 5761.5, { id: "furtbruecke_1" }); ding("hochland_steinbruecke_ow", 6739.6, 5761.5, { id: "furtbruecke_2" });   /* Steinbögen von Figuren (#148) */
  freigeben.push({ art: "rechteck", x0: 6728, y0: 5758.9, x1: 6741, y1: 5761.5 });
  lies("furtbruecke", 6727, 5760, "Die Brücke zur Furt. Zehn steinerne Bögen über den Grauen Sund bis zur Sandbank drüben – und drüben, im Dunst, die Hochlande."); }

/* ───── Hügelgräberfeld ───── */
const GRAEBER = [[6432, 5752, 4.5], [6452, 5742, 5, "grabkammer_1"], [6476, 5750, 4], [6494, 5764, 5, "grabkammer_2"], [6440, 5776, 4], [6466, 5778, 8, "hauptmann"], [6488, 5790, 4], [6452, 5798, 4.5]];
export const KAMMER_EINGANG = {};
{ const [cx, cy] = ORTE.graeber; male(cx - 46, cy - 38, cx + 46, cy + 40, (x, y) => { const d = Math.hypot((x - cx) / 44, (y - cy) / 36); return d < 1 + 0.08 * welle(x, y) ? (welle(x, y) > 0.8 ? "," : welle(x, y) < -1.2 ? "g" : "T") : null; });
  GRAEBER.forEach(([x, y, r, kammer], i) => { huegel(x, y, r + 2, kammer === "hauptmann" ? 3.8 : 2.4); male(x - r - 1, y - r - 1, x + r + 1, y + r + 1, (u, v) => { const d = Math.hypot(u - x, v - y); return d < r * 0.45 ? "." : d < r + 0.4 * welle(u, v) ? (welle(u, v) > 1.1 ? "g" : "T") : null; });   /* Kuppe grasig, Hang Heide mit Steinen */
    ding(["k_grabstein_rund", "k_grabstein_zerbrochen", "k_grabstein_breit"][i % 3], x - 1.5, y + r + 1.2, { spiegeln: i % 2 === 1 });
    if (kammer) { const ex = x, ey = y + r + 0.4; ding("k_gruft", ex, ey - 0.6, { id: "huegelgrab_" + kammer }); KAMMER_EINGANG[kammer] = [ex, ey + 1.4]; }
    else ding("moor_menhir_01", x + 1.6, y - r * 0.4); });
  for (let i = 0; i < 9; i++) { const w = (i / 9) * Math.PI * 2; const [x, y] = [6466 + Math.cos(w) * 12, 5778 + Math.sin(w) * 10]; ding(i % 2 ? "moor_menhir_02" : "moor_menhir_01", x, y, { spiegeln: i % 3 === 0 }); }
  lies("huegelgraeber", cx + 8, cy - 2, "Grabhügel, so weit man sieht. Der Wind pfeift über die Kuppen; an manchen Stellen ist die Erde frisch aufgewühlt – von innen."); }

/* ───── Kernbaum-Tal ───── */
export const KERNBAEUME = [[6228, 5772], [6236, 5766], [6244, 5774], [6232, 5782]];
{ const [cx, cy] = ORTE.kernbaumtal; male(cx - 24, cy - 20, cx + 24, cy + 20, (x, y) => { const d = Math.hypot((x - cx) / 22, (y - cy) / 18) + 0.06 * welle(x, y);
    if (d > 1.05) return null; if (d > 0.82 && !(x > cx + 10 && Math.abs(y - cy - 2) < 4)) return d < 0.92 ? "F" : "g"; return welle(x, y) > 0.6 ? "," : "."; });
  for (let j = -24; j <= 24; j++) for (let i = -28; i <= 28; i++) { const d = Math.hypot(i / 22, j / 18); if (d > 0.75 && d < 1.2 && !(i > 10 && Math.abs(j - 2) < 4)) hebe(cx + i, cy + j, 3.2 * Math.max(0, 1 - Math.abs(d - 0.95) / 0.25)); }
  KERNBAEUME.forEach(([x, y], i) => ding("holz_kernbaum_01", x, y, { id: "kernbaum_tal_" + (i + 1) }));
  for (let i = 0; i < 10; i++) { const w = wurf() * 6.28, r = 6 + wurf() * 8; ding(wurf() < 0.6 ? "stil_busch_01" : "stil_birke_01", cx + Math.cos(w) * r, cy + Math.sin(w) * r * 0.8); }
  lies("kernbaum_tal", cx + 12, cy + 2, "Ein Tal, in dem der Wind schweigt. Die Kernbäume stehen hier dicht und gerade."); }

/* ───── Heide: einzelne Büsche und Steine an den Wegen (sparsam) ───── */
for (let i = 0; i < 4000 && objekte.filter((o) => o.heide).length < 70; i++) { const x = 6240 + wurf() * 500, y = 5700 + wurf() * 420;
  if (Object.values(ORTE).some(([a, b]) => Math.hypot(a - x, b - y) < 30) || [W_NORD, W_GRAUWACHT, W_GRAEBER, W_TAL].some((w) => strecke(x, y, w) < 3)) continue;
  if (![W_NORD, W_GRAUWACHT, W_GRAEBER, W_TAL].some((w) => strecke(x, y, w) < 14)) continue;
  ding(wurf() < 0.7 ? "stil_busch_02" : "stil_birke_01", x, y, { heide: true, s: +(0.7 + wurf() * 0.3).toFixed(2) }); }
for (const o of objekte) delete o.heide;

/* ───── Eingänge der Grabkammern ───── */
const KAMMERN = { grabkammer_1: { ursprung: [346, 300], name: "Grabkammer am Westhang" }, grabkammer_2: { ursprung: [347, 300], name: "Grabkammer am Osthang" } };
const HAUPTMANN = { ursprung: [348, 300] }, HAUPTMANN_BOSS = { ursprung: [350, 300] };
const innen = (u, x, y) => [u[0] * 32 + x, u[1] * 32 + y];
for (const [k, K] of Object.entries(KAMMERN)) lies(k + "_eingang", ...KAMMER_EINGANG[k], "Ein Eingang in den Grabhügel, mit Steinplatten gefasst. Kalte Luft steigt herauf.", { tat: "grabkammer", knopf: "Hinabsteigen", ziel: innen(K.ursprung, 16, 24.5) });
lies("hauptmann_eingang", ...KAMMER_EINGANG.hauptmann, "Das Grab des Grauen Hauptmanns. Über dem Eingang ist ein Schwert in den Stein geschlagen. Das Siegel ist gebrochen.", { tat: "grabkammer", knopf: "Hinabsteigen", ziel: innen(HAUPTMANN.ursprung, 32, 58) });

/* ───── Untergrund: Grabkammern ───── */
const schreibeGebiet = (id, R, g, dinge, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error(id + ": im Fels " + p.id); }
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id, ...R }, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${dinge.length} Dinge, ${spiel.interaktionen.length} Interaktionen`); };
const raster = (B, H, frei) => Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => (frei(x + 0.5, y + 0.5) ? "h" : "F")));
const iaU = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
export const GRABLICHTER = [];
for (const [k, K] of Object.entries(KAMMERN)) { const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9);
  const GANG = [[16, 29], [16, 22], [k === "grabkammer_1" ? 12 : 20, 16], [16, 11]];
  const g = raster(32, 32, (x, y) => strecke(x, y, GANG) < 1.6 + 0.3 * zw(x, y) || Math.hypot((x - 16) / 8, (y - 10) / 6) < 1 + 0.08 * zw(x, y) || (y > 26 && y < 31 && Math.abs(x - 16) < 2.5));
  let m = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor)_/, "") + "_" + ++m, objekt, x, y, ...mehr });
  const dinge = [o("hoehle_leiter_01", 16, 27.4), o("k_altar_stein", 16, 8.2), o("moor_feuerkorb_01", 11, 9), o("moor_feuerkorb_01", 21, 9), o("k_grabstein_breit", 11.5, 13), o("k_grabstein_zerbrochen", 20.5, 13), o("k_truemmer", k === "grabkammer_1" ? 13 : 19, 18, { spiegeln: true })];
  const zurueck = KAMMER_EINGANG[k];
  const spiel = { start: [[16, 25]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [iaU(k + "_hinauf", 16, 29.2, "Die Stufen hinauf ins Freie.", { tat: "grabkammer_hinauf", knopf: "Hinaufsteigen", ziel: [zurueck[0], zurueck[1] + 0.6] }),
      iaU(k + "_sarg", 16, 10.4, "Ein Steinsarg. Der Deckel ist verschoben – jemand oder etwas ist herausgestiegen.")] };
  const [ox, oy] = [K.ursprung[0] * 32, K.ursprung[1] * 32]; GRABLICHTER.push([k, ox + 12.5, oy + 11.5], [k, ox + 19.5, oy + 11.5]);
  schreibeGebiet(k, { name: K.name, untertitel: "Ein Grabhügel in den Fahlen Weiten", ursprung: K.ursprung, chunks: [1, 1], biom: "hoehle", stufe: 6, ebene: "untergrund" }, g, dinge, spiel); }
/* Grab des Grauen Hauptmanns: Vorhalle, Gang mit zwei Nischen (Grabwächter), Siegelkammer, Tor in die Gruft (Bossraum, eigene Instanz) */
{ const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9);
  const GANG = [[32, 61], [32, 50], [32, 30], [32, 12]], NISCHEN = [[22, 40, 5], [42, 40, 5], [24, 22, 4.5], [40, 22, 4.5]];
  const g = raster(64, 64, (x, y) => strecke(x, y, GANG) < 2.2 + 0.3 * zw(x, y) || Math.hypot((x - 32) / 9, (y - 52) / 6) < 1 + 0.06 * zw(x, y) || NISCHEN.some(([a, b, r]) => Math.hypot(x - a, y - b) < r + 0.5 * zw(x, y)) || strecke(x, y, [[22, 40], [42, 40]]) < 1.8 || strecke(x, y, [[24, 22], [40, 22]]) < 1.8 || Math.hypot((x - 32) / 8, (y - 10) / 6) < 1 + 0.06 * zw(x, y) || (y > 56 && y < 63 && Math.abs(x - 32) < 2.5));
  let m = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz)_/, "") + "_" + ++m, objekt, x, y, ...mehr });
  const dinge = [o("hoehle_leiter_01", 32, 59.4), o("moor_feuerkorb_01", 26, 50), o("moor_feuerkorb_01", 38, 50), ...NISCHEN.map(([a, b]) => o("hoehle_steinsaeule_01", a, b - 1.5)),
    o("k_altar_stein", 32, 8.2), o("wz_splitter_obelisk", 27, 9), o("wz_splitter_obelisk", 37, 9), o("k_grabstein_kreuz", 22, 43), o("k_grabstein_breit", 42, 43), o("k_truemmer", 31, 44, { spiegeln: true })];
  const BOSS_EIN = [HAUPTMANN_BOSS.ursprung[0] * 32 + 16, HAUPTMANN_BOSS.ursprung[1] * 32 + 27], [ox, oy] = [HAUPTMANN.ursprung[0] * 32, HAUPTMANN.ursprung[1] * 32];
  const spiel = { start: [[32, 56]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [iaU("hauptmann_hinauf", 32, 61.2, "Die Stufen hinauf ins Freie.", { tat: "grabkammer_hinauf", knopf: "Hinaufsteigen", ziel: [KAMMER_EINGANG.hauptmann[0], KAMMER_EINGANG.hauptmann[1] + 0.6] }),
      iaU("hauptmann_siegel", 32, 10.4, "Ein Altar mit einer leeren Mulde – hier lag das Siegel des Hauptmanns."),
      iaU("hauptmann_gruft_tor", 32, 4.4, "Eine Tür aus Eisen, kalt wie Eis. Dahinter: die Gruft des Grauen Hauptmanns.", { tat: "hauptmann_gruft", knopf: "Die Gruft betreten", ziel: BOSS_EIN })] };
  for (let y = 3; y < 5; y++) for (let x = 30; x < 35; x++) g[y][x] = "h";
  GRABLICHTER.push(["hauptmann", ox + 22.5, oy + 40.5], ["hauptmann", ox + 41.5, oy + 40.5], ["hauptmann", ox + 32.5, oy + 26.5]);
  schreibeGebiet("hauptmann_grab", { name: "Grab des Grauen Hauptmanns", untertitel: "Der größte Hügel der Fahlen Weiten", ursprung: HAUPTMANN.ursprung, chunks: [2, 2], biom: "hoehle", stufe: 8, ebene: "untergrund" }, g, dinge, spiel);
  /* Bossraum (eigenes Gebiet, als Instanz kopierbar): runde Gruft, Grabsteine als Deckung, Sarkophag in der Mitte */
  const gb = raster(32, 32, (x, y) => Math.hypot(x - 16, y - 15) < 12 + 0.6 * zw(x, y) || (Math.abs(x - 16) < 2 && y > 24 && y < 31));
  let mb = 0; const ob = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz)_/, "") + "_" + ++mb, objekt, x, y, ...mehr });
  const db = [ob("k_altar_stein", 16, 14), ...[[9, 9], [23, 9], [7, 17], [25, 17], [11, 22], [21, 22]].map(([x, y], i) => ob(["k_grabstein_breit", "k_grabstein_kreuz", "k_grabstein_rund"][i % 3], x, y)),
    ...[[6, 12], [26, 12], [16, 4.5]].map(([x, y]) => ob("moor_feuerkorb_01", x, y))];
  schreibeGebiet("hauptmann_gruft", { name: "Die Gruft des Grauen Hauptmanns", untertitel: "Instanz", ursprung: HAUPTMANN_BOSS.ursprung, chunks: [1, 1], biom: "hoehle", stufe: 9, ebene: "untergrund" }, gb, db,
    { start: [[16, 27]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
      interaktionen: [iaU("hauptmann_gruft_ausgang", 16, 29, "Zurück in die Siegelkammer.", { tat: "hauptmann_gruft_zurueck", knopf: "Zurück", ziel: [ox + 32, oy + 6.5] }), iaU("hauptmann_sarkophag", 16, 16.4, "Der Sarkophag des Grauen Hauptmanns. Auf dem Deckel liegt eine Klinge aus grauem Stahl.")] }); }

/* ───── Plan schreiben ───── */
const ADERN = objekte.filter((o) => o.ader), echt = objekte.filter((o) => !o.ader);
const patches = []; { const keys = [...feld.keys()].map((k) => k.split(",").map(Number)); const x0 = Math.min(...keys.map((k) => k[0])), y0 = Math.min(...keys.map((k) => k[1])), x1 = Math.max(...keys.map((k) => k[0])), y1 = Math.max(...keys.map((k) => k[1]));
  /* in Streifen zu 64 Zeilen, damit die Datei lesbar bleibt */
  for (let ya = y0; ya <= y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, y1 + 1); y++) { let z = ""; for (let x = x0; x <= x1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0, y0: ya, zeilen }); } }
const hoehen = [...hoehe.entries()].filter(([, h]) => h > 0.01).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
mkdirSync(join(WELT, "festland"), { recursive: true });
writeFileSync(join(WELT, "festland", "plan_fahleweiten.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/fahleweiten.mjs – festland.py arbeitet es ein. Weltfelder.", gelaende: patches, hoehen, eben, objekte: echt, interaktionen, sperren, freigeben }) + "\n");
writeFileSync(join(WELT, "grauwacht_ausbau.json"), JSON.stringify({
  hinweis: "Phase 8 (Welt #50): Grauwacht in drei Ausbaustufen je Spieler. Objekte im Festland tragen \"ausbau\" (zeigt sich ab Stufe) bzw. \"ausbau_bis\" (verschwindet mit Stufe). Hier die NPC-Plätze (Weltfelder), Adern, Grablichter und Kernbäume als Vorschlag.",
  stufen: ["verlassen", "abtei", "burg"], npc, adern: ADERN.map((a) => ({ id: a.ader, art: a.ader.startsWith("schwarz") ? "schwarzeisen" : "eisen", x: a.x, y: a.y })),
  grablichter: GRABLICHTER.map(([k, x, y], i) => ({ id: `grab_${k}_${i + 1}`, art: "grablicht", x, y, region: k === "hauptmann" ? "hauptmann_grab" : k })),
  kernbaeume: KERNBAEUME.map(([x, y], i) => ({ id: "kernbaum_tal_" + (i + 1), art: "kernbaum", x, y })),
  eisenhut: GRAEBER.slice(0, 6).map(([x, y, r], i) => ({ id: "eisenhut_" + (i + 1), art: "eisenhut", x: Math.floor(x + r + 1.5) + 0.5, y: Math.floor(y) + 0.5 })) }, null, 1) + "\n");
console.log(`Fahle Weiten: ${feld.size} Geländefelder, ${hoehen.length} Höhenfelder, ${echt.length} Objekte, ${interaktionen.length} Interaktionen, ${sperren.length} Sperren; ${npc.length} NPC-Plätze`);
