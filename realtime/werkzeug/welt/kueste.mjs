/*
 * World Pipeline – Phase 10 vorab (#82, 27.11.2026): die Smaragdküste südlich von Weidenhain mit Kielmund, Möwenbucht, Kräuterhof, Leuchtturm,
 * Schiffswrack, Klippenhöhlen und Mangroven. Wie fahleweiten.mjs/glutsande.mjs: ein Plan (welt/festland/plan_kueste.json) für festland.py,
 * dazu die Klippenhöhlen im Untergrund (357–359|300). Die Südstraße beginnt am Südweg von Weidenhain (dort per welt/orte.json).
 *   Neu: der kurze Fluss „Kiel“ aus einem Quellsee zur Küste – an seiner Mündung liegt Kielmund (Hafen, Werft, Kai, Fischmarkt, Küstenhaus, Bank,
 *   Werkstatt, Taverne „Zum Ankerkraut“, Mole mit Leuchtfeuer, Wegstein und Bindestein).
 * Aufruf (im Ordner realtime): node werkzeug/welt/kueste.mjs && python3 werkzeug/welt/festland.py && (ostufer, orte, lichtungen, naehte, bauen …)
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 1010; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const GR = []; for (const n of readdirSync(join(WELT, "regionen"))) { if (!n.startsWith("fl_")) continue; const r = JSON.parse(readFileSync(join(WELT, "regionen", n, "region.json"), "utf8"));
  GR.push({ x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const grund = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const meer = (x, y) => "M".includes(grund(x, y));

const feld = new Map(), hoehe = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [], vorschlag = { fischplaetze: [], adern: [], eiben: [] };
const setze = (x, y, c) => { if (!meer(x + 0.5, y + 0.5) || c === "M" || c === "s" || c === "o") feld.set(Math.floor(x) + "," + Math.floor(y), c); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
const zeichen = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
let n = 0; const ding = (objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: mehr.id || "ks_" + objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|burg|hoehle|welt|wz|holz|waldmark|weidenhain|turm)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: mehr.tat ? "eingang" : "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: mehr.tat ? 2.0 : 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const weg = (punkte, breite = 1.8, z = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) && !"~wM".includes(zeichen(x, y)) ? z : null); };
const steg = (x, y, id) => { ding("dorf_bruecke_01", x, y, { id }); freigeben.push({ art: "rechteck", x0: +(x - 4.9).toFixed(2), y0: +(y - 2.6).toFixed(2), x1: +(x + 3.0).toFixed(2), y1: y }); };
/* Fischplatz: erstes Wasserfeld neben einem begehbaren Stehplatz in Richtung (dx, dy) */
const fischplatz = (id, fisch, stufe, x, y, dx, dy, text) => { let px = x, py = y; for (let i = 0; i < 40 && !"~wMo".includes(zeichen(px + dx, py + dy)); i++) { px += dx; py += dy; }
  const w = [px + dx, py + dy]; lies(id, px, py, text, { fisch, stufe }); vorschlag.fischplaetze.push({ id, fisch, stufe, x: +w[0].toFixed(1), y: +w[1].toFixed(1), stehplatz: [+px.toFixed(1), +py.toFixed(1)] }); };

export const ORTE = { suedstrasse: [6446, 6770], kielmund: [6426, 7314], moewenbucht: [6214, 7160], kraeuterhof: [6418, 7064], leuchtturm: [6176, 7034], wrack: [6282, 7262], klippenhoehlen: [6180, 7090], mangroven: [6508, 7590] };

/* ───── der Fluss Kiel: Quellsee, Lauf zur Küste ───── */
const KIEL = [[6448, 7196], [6440, 7222], [6424, 7250], [6404, 7278], [6388, 7302], [6370, 7322], [6354, 7338], [6340, 7352]];
male(6330, 7180, 6470, 7365, (x, y) => { if (Math.hypot((x - 6450) / 9, (y - 7188) / 7) < 1 + 0.06 * welle(x, y)) return "w"; const d = strecke(x, y, KIEL); return d < 2.6 + 0.3 * Math.sin(y / 7) ? "~" : d < 3.6 && welle(x, y) > 0.2 ? "," : null; });
lies("kiel_quelle", 6460, 7194, "Ein stiller See zwischen Binsen. Hier entspringt die Kiel.");

/* ───── Südstraße ───── */
const SUED = [[6444, 6752.5], [6446, 6790], [6452, 6860], [6460, 6940], [6466, 7020], [6470, 7100], [6466, 7180], [6462, 7230], [6450, 7270], [6436, 7296]];
weg(SUED, 2.2, "k");   /* Straße zwischen Großstädten (Waldmark/Weidenhain → Kielmund, #89) */
ding("k_banner_rot", ORTE.suedstrasse[0] + 2.6, ORTE.suedstrasse[1], { id: "suedstrasse_schild" });
lies("suedstrasse_schild", ORTE.suedstrasse[0] + 2.6, ORTE.suedstrasse[1] + 1.4, "Ein Schild der Wacht: „Südstraße nach Kielmund. Ab hier ohne Geleit – Gefahrenstufe 20.“");
npc.push({ id: "wache_suedstrasse", rolle: "Wache an der Südstraße (keine Sperre)", x: ORTE.suedstrasse[0] - 2, y: ORTE.suedstrasse[1] });

/* ───── Kielmund ───── */
{ const [cx, cy] = ORTE.kielmund;
  male(cx - 44, cy - 30, cx + 50, cy + 40, (x, y) => { if ("~wM".includes(zeichen(x, y))) return null; const d = Math.hypot((x - cx - 4) / 46, (y - cy) / 32) - 0.08 * welle(x, y); if (d > 1) return null;
    if (Math.hypot((x - cx) / 7, (y - cy) / 5) < 1 || strecke(x, y, [[cx - 30, cy - 14], [cx + 40, cy - 14]]) < 1.3 || strecke(x, y, [[cx, cy - 26], [cx, cy + 30]]) < 1.3) return "p"; return welle(x, y) > 1.0 ? "," : "."; });
  eben.push([cx - 40, cy - 28, cx + 46, cy + 36]);
  /* Kai am Fluss (Westrand der Stadt), Stege in die Kiel, Werft mit Boot */
  const kai = []; for (let y = cy - 24; y < cy + 26; y += 1) { let x = cx; while (x > cx - 50 && !"~M".includes(zeichen(x - 1, y))) x--; if (x > cx - 50) kai.push([x, y]); }
  for (const [x, y] of kai) male(x, y, x + 3, y + 1, (u, v) => (!"~wM".includes(zeichen(u, v)) ? "p" : null));
  const kaiAn = (y) => kai.reduce((b, k) => (Math.abs(k[1] - y) < Math.abs(b[1] - y) ? k : b), kai[0]);
  for (const [i, dy] of [[1, -10], [2, 2]]) { const [x, y] = kaiAn(cy + dy); steg(x - 1.1, y + 1.3, "kielmund_steg_" + i); }
  { const [x, y] = kaiAn(cy + 14); ding("graufurt_faehre_01", x - 4, y + 2, { id: "kielmund_werft_boot" }); ding("dorf_holzstapel_01", x + 3, y - 1, { id: "kielmund_werft_holz" }); ding("wald_baumstamm_01", x + 4, y + 2.5); ding("k_kiste", x + 6, y - 1);
    lies("werft", x + 2, y + 3.2, "Die Werft von Kielmund. Auf der Helling liegt ein halbfertiger Rumpf, daneben Spanten und Pech."); }
  { const [x, y] = kaiAn(cy - 4); lies("kai", x + 1.5, y, "Der Kai an der Kiel. Fässer, Taue, Möwen – und der Geruch von Hering."); fischplatz("fischplatz_kai", "hering", 20, x + 0.5, y + 0.5, -1, 0, "Am Kai beißen die Heringe."); }
  /* Häuser und Einrichtungen */
  ding("dorf_taverne_01", cx + 10, cy - 18, { id: "taverne_ankerkraut" }); lies("taverne_ankerkraut", cx + 11.5, cy - 17.4, "Die Taverne „Zum Ankerkraut“. Drinnen singt jemand von einem Schiff, das nie zurückkam.");
  ding("waldmark_rathaus_01", cx - 12, cy - 18, { id: "kuestenhaus" });   /* Haus der Küstenhäuser mit Ratssaal (#174) */ lies("kuestenhaus", cx - 12, cy - 17.2, "Das Haus der Küstenhäuser – hier sitzen die Familien, die den Hafen verwalten.");
  ding("waldmark_bank_01", cx + 26, cy - 18, { id: "kielmund_bank" }); lies("kielmund_bank_tuer", cx + 26, cy - 17.4, "Die Bank von Kielmund.");
  male(cx + 18, cy + 4, cx + 34, cy + 14, () => "p"); ding("dorf_schmiede_01", cx + 23, cy + 10, { id: "kielmund_schmiede" }); ding("hand_werkbank_01", cx + 30, cy + 12, { id: "kielmund_werkbank" });
  lies("kielmund_werkstatt", cx + 26, cy + 13.4, "Die Werkstatt von Kielmund: Esse, Amboss, Werkbank – und ein Haufen rostiger Anker.");
  ding("dorf_marktstand_03", cx - 4, cy + 7, { id: "fischmarkt_1" }); ding("dorf_marktstand_01", cx + 3, cy + 7, { id: "fischmarkt_2" }); ding("k_faesser", cx - 8, cy + 9);
  lies("fischmarkt", cx, cy + 9.4, "Der Fischmarkt. Hering, Klippenbarsch, Seeaal – und ein Händler, der schwört, einen Glutwels zu haben.");
  for (const [o, dx, dy] of [["dorf_haus_holz_01", -26, 2], ["dorf_haus_holz_02", 36, -4], ["dorf_haus_holz_03", 36, 18], ["graufurt_steinhaus_02", 14, 22], ["dorf_haus_holz_01", -6, 24]]) ding(o, cx + dx, cy + dy);
  ding("dorf_brunnen_01", cx, cy + 0.6, { id: "kielmund_brunnen" }); lies("kielmund", cx, cy + 2.4, "Kielmund, wo die Kiel ins Meer fällt. Möwen über den Dächern, Salz in der Luft.");
  /* Mole hinaus ins Meer mit Leuchtfeuer, Wegstein und Bindestein */
  let mx = cx - 6, my = cy + 20; for (let i = 0; i < 40 && !meer(mx, my + 1); i++) my++;
  weg([[cx, cy + 4], [cx - 2, my - 1]], 2.2, "p");   /* die Mole mit dem Leuchtfeuer baut kielmund.mjs an der Küste (#174); hier lag sie auf dem Land */
  ding("moor_menhir_02", cx - 6, my - 3, { id: "kielmund_wegstein" }); ding("wz_bindestein", cx + 2, my - 3, { id: "kielmund_bindestein" });
  lies("kielmund_wegstein", cx - 6, my - 1.4, "Der Wegstein von Kielmund."); lies("kielmund_bindestein", cx + 2, my - 1.4, "Ein Bindestein am Südplatz von Kielmund. Von hier sieht man das Leuchtfeuer auf der Mole.");
  /* Brücke über die Kiel nach Westen */
  { let y = cy - 14, x0 = cx; while (!"~".includes(zeichen(x0 - 1, y))) x0--; let x1 = x0; while ("~".includes(zeichen(x1 - 1, y)) && x1 > x0 - 12) x1--; const bx = (x0 + x1) / 2 + 1; ding("dorf_bruecke_01", bx, y + 1.3, { id: "kiel_bruecke" }); freigeben.push({ art: "rechteck", x0: x1 - 1.5, y0: y - 1.3, x1: x0 + 1.5, y1: y + 1.3 }); }
  /* Fischerzunft (#168, ab Fischen 60): Privatsteg am Strand südwestlich der Stadt mit vielen Fangstellen (Seeaal, Klippenbarsch, Hering), Räucherhütte, Bankkiste;
     der Strand davor ist eingehegt (Hecke bis ins Wasser), ein Tor im Osten – das Feld des Tors bekommt Systeme als Tür (beruf fischen, Stufe 60) */
  { const PY = 7353.3, X1 = 6402, Y0 = 7345, Y1 = 7360, TOR = 7353; let hx = 0; const hid = () => "zaun_fischerzunft_" + ++hx;
    let land = 6400; while (land > 6360 && !meer(land - 1 + 0.5, PY - 1.3)) land--;   /* erstes Meerfeld westlich: dort setzt der Steg an */
    for (const [y, yy] of [[Y0 + 0.96, Y0 + 0.5], [Y1, Y1 - 0.5]]) { let a = X1 - 1.2; while (a > 6360 && !meer(a - 1.2, yy)) a -= 2.2; for (let x = a; x <= X1 - 1.2 + 0.01; x += 2.2) ding("k_hecke", x, y, { id: hid() }); }
    let lo = -Infinity, hi = Infinity; for (let y = Y0 + 1.7; y < Y1 + 0.01; y += 0.8) { const yy = Math.min(y, Y1 - 0.8); if (yy - 0.96 > TOR + 1.5 || yy < TOR - 1.5) { ding("k_hecke", X1 - 1.2, yy, { id: hid() }); if (yy < TOR) lo = Math.max(lo, yy); else hi = Math.min(hi, yy - 0.96); } }
    for (let i = 0; i < 4; i++) steg(land + 4.9 - i * 6.8, PY, "fischerzunft_steg_" + (i + 1));   /* 6,8 Felder: ohne Lücke; das vierte Stück für die Zunft-Fische (#176) */
    const fang = [["seeaal", 45, 3], ["seeaal", 45, 5], ["klippenbarsch", 35, 7], ["seeaal", 45, 9], ["seeaal", 45, 11], ["hering", 20, 12]];
    fang.forEach(([f, st, dx], i) => fischplatz("fischerzunft_fang_" + (i + 1), f, st, land - dx + 0.5, i % 2 ? PY - 0.8 : PY - 1.8, 0, i % 2 ? 1 : -1, "Vom Privatsteg der Fischerzunft aus beißen " + { seeaal: "Seeaale", klippenbarsch: "Klippenbarsche", hering: "Heringe" }[f] + "."));
    /* #176: die Zunft-Fische ganz draußen am vierten Stegstück – Silberbarsch (70, Angel), Sturmhecht (80, Reuse), Tiefseeaal (90, Reuse), je zwei Stellen */
    [["silberbarsch", 70, 14, -1, "Silberbarsche"], ["silberbarsch", 70, 15, 1, "Silberbarsche"], ["sturmhecht", 80, 16, -1, "Sturmhechte"], ["sturmhecht", 80, 17, 1, "Sturmhechte"], ["tiefseeaal", 90, 18, -1, "Tiefseeaale"], ["tiefseeaal", 90, 19, 1, "Tiefseeaale"]]
      .forEach(([f, st, dx, seite, name], i) => fischplatz(`fischerzunft_${f}_${i % 2 + 1}`, f, st, land - dx + 0.5, seite > 0 ? PY - 0.8 : PY - 1.8, 0, seite, `Ganz draußen am Privatsteg der Fischerzunft ziehen ${name}.`));
    for (const f of vorschlag.fischplaetze.filter((f) => f.id.startsWith("fischerzunft_"))) if (Math.abs(f.stehplatz[1] - PY) > 2) throw new Error("Fischerzunft: Fangstelle nicht am Steg " + f.id);
    ding("kueste_raeucherhuette", 6396, 7349.5, { id: "fischerzunft_raeucherhuette" }); ding("kueste_netze", 6393, 7357.5, { id: "fischerzunft_netze" }); ding("steinhag_bankkiste", 6399, 7357.6, { id: "fischerzunft_bankkiste" });
    lies("fischerzunft_bankkiste", 6399, 7359, "Die Bankkiste der Fischerzunft. Was du hier einlegst, liegt auf deinem Konto.");
    lies("fischerzunft", X1 + 1.6, TOR - 2.2, "Der Privatsteg der Fischerzunft. „Nur für Meister des Fischens – ab Stufe 60.“");
    weg([[cx - 1, cy + 34], [6416, 7352], [X1 + 1, TOR]], 1.8, "e");
    vorschlag.fischerzunft = { zunft: "fischerzunft", name: "Fischerzunft", ort: "Kielmund", beruf: "fischen", ab: 60, flaeche: [land - 24, Y0, X1, Y1], tor: [X1 - 3, Math.floor(lo), X1 - 1, Math.ceil(hi) - 1], wache: [X1 + 1.5, TOR],
      bankkiste: { id: "fischerzunft_bankkiste", x: 6399, y: 7359 }, stationen: [{ id: "raeucherhuette_fischerzunft", station: "raeucherhuette", x: 6396, y: 7351 }], fang: vorschlag.fischplaetze.filter((f) => f.id.startsWith("fischerzunft_")).map((f) => f.id) };
    npc.push({ id: "zunftfischer", rolle: "Meisterfischer der Zunft", x: land + 1.5, y: PY - 1.3 }, { id: "fischerzunft_wache", rolle: "Wache am Tor der Fischerzunft (ab Stufe 60)", x: X1 + 1.5, y: TOR + 1.5 }); }
  npc.push({ id: "hafenmeister", rolle: "Hafenmeister", x: kaiAn(cy)[0] + 2, y: cy }, { id: "wirtin_ankerkraut", rolle: "Taverne", x: cx + 11, y: cy - 15.6 }, { id: "fischhaendler", rolle: "Fischmarkt", x: cx - 4, y: cy + 8.8 },
    { id: "bankier_kielmund", rolle: "Bank", x: cx + 26, y: cy - 16 }, { id: "schmied_kielmund", rolle: "Werkstatt", x: cx + 25, y: cy + 12 }, { id: "schiffbauer", rolle: "Werft", x: kaiAn(cy + 14)[0] + 3, y: cy + 16 }); }

/* ───── Leuchtturm mit Wärterhaus, Klippenbarsch, Klippenhöhlen ───── */
const HOEHLE_U = [357, 300], KAPITAEN_U = [359, 300];
{ const [lx, ly] = ORTE.leuchtturm; male(lx - 8, ly - 8, lx + 22, ly + 8, (x, y) => (Math.hypot((x - lx - 7) / 14, (y - ly) / 7) < 1 && !"F~M".includes(zeichen(x, y)) ? (welle(x, y) > 0.7 ? "g" : ".") : null));
  ding("graufurt_turm_ost_01", lx, ly, { id: "leuchtturm", s: 1.6 }); ding("turm_signalfeuer_01", lx, ly - 1.4, { id: "leuchtturm_feuer", s: 0.7 }); ding("moor_kate_01", lx + 10, ly + 1, { id: "waerterhaus" });
  ding("hand_kessel_01", lx + 14, ly + 4.6, { id: "leuchtturm_kessel" });   /* G2 (#118): Kessel am Wärterhaus, Station kessel_leuchtturm (shared/handwerk.ts, 6190 | 7039,5) */
  lies("leuchtturm", lx, ly + 1.2, "Der Leuchtturm auf der Klippe. Oben brennt kein Licht mehr – seit das Schiff unten am Strand liegt."); lies("waerterhaus", lx + 10.5, ly + 1.6, "Das Wärterhaus. Auf dem Tisch ein Logbuch, die letzte Seite ist herausgerissen.");
  npc.push({ id: "leuchtturmwaerter", rolle: "Leuchtturmwärter", x: lx + 12, y: ly + 3 });
  fischplatz("fischplatz_klippe", "klippenbarsch", 35, 6150.5, 7104.5, -0.5, 0.5, "Unten an der Klippe schäumt die Brandung – Klippenbarsche stehen im Kehrwasser.");
  const [hx, hy] = ORTE.klippenhoehlen; ding("hoehle_tuer_01", hx, hy - 0.4, { id: "klippenhoehlen_eingang" });
  lies("klippenhoehlen_eingang", hx, hy + 1.2, "Ein Spalt in der Klippe, aus dem kalte, salzige Luft weht.", { tat: "klippenhoehle", knopf: "Hineingehen", ziel: [HOEHLE_U[0] * 32 + 32, HOEHLE_U[1] * 32 + 58] });
  /* Kupfer und Eisen in den Klippen (gesperrte Aderfelder am Fuß) */
  for (const [id, art, x, y] of [["kupfer_klippe_1", "kupfer", 6184.5, 7080.5], ["kupfer_klippe_2", "kupfer", 6186.5, 7096.5], ["eisen_klippe_1", "eisen", 6160.5, 7036.5], ["eisen_klippe_2", "eisen", 6166.5, 7032.5]]) {
    if (!"F".includes(zeichen(x, y)) && zeichen(x, y) !== "?") { setze(x, y, "g"); sperren.push({ art: "rechteck", x0: Math.floor(x), y0: Math.floor(y), x1: Math.floor(x) + 1, y1: Math.floor(y) + 1 }); vorschlag.adern.push({ id, art, x, y }); } } }

/* ───── Möwenbucht (Fischerdorf) ───── */
{ const [mx, my] = ORTE.moewenbucht; male(mx - 14, my - 14, mx + 22, my + 14, (x, y) => (Math.hypot((x - mx - 4) / 16, (y - my) / 12) < 1 && !"~M".includes(zeichen(x, y)) ? (welle(x, y) > 0.9 ? "s" : ".") : null));
  for (const [o, dx, dy, id] of [["moor_kate_01", 6, -6, "moewenbucht_kate_1"], ["weidenhain_kate_01", 14, -2, "moewenbucht_kate_2"], ["moor_kate_02", 10, 8, "moewenbucht_kate_3"], ["dorf_huette_holz_01", 0, 6, "raeucherhuette"]]) ding(o, mx + dx, my + dy, { id });
  ding("dorf_festfeuer_01", mx + 4, my + 9, { id: "raeucherhuette_feuer" }); ding("k_faesser", mx + 2, my + 8); ding("moor_kahn_01", mx - 6, my + 2, { id: "moewenbucht_kahn" });
  lies("raeucherhuette", mx + 0.5, my + 6.6, "Die Räucherhütte. Heringe hängen in Reihen im Rauch – hier wird Räucherhering gemacht.", { station: "raeucherhuette" });
  ding("steinhag_bankkiste", mx + 9.5, my - 4.6, { id: "moewenbucht_bankkiste" }); lies("moewenbucht_bankkiste", mx + 9.5, my - 3.2, "Die Bankkiste der Möwenbucht. Eisenbeschlagen, und der Schlüssel hängt beim Fischer – was du einlegst, liegt auf deinem Konto.");
  lies("moewenbucht", mx + 6, my + 1, "Möwenbucht. Netze trocknen zwischen den Katen, und über allem kreischen die Möwen.");
  let sx = mx, sy = my; while (!"~M".includes(zeichen(sx - 1, sy)) && sx > mx - 30) sx--; steg(sx - 1, sy + 1.3, "moewenbucht_steg");
  fischplatz("fischplatz_moewenbucht", "hering", 20, sx + 1.5, sy - 1.5, -1, 0, "Vom Steg aus fängt man Heringe.");
  npc.push({ id: "fischerin_moewenbucht", rolle: "Fischerin", x: mx + 3, y: my + 3 }, { id: "raeucherer", rolle: "Räucherhütte", x: mx + 2.5, y: my + 8.6 }); }

/* ───── Kräuterhof im Küstenwald, Eiben ───── */
{ const [kx, ky] = ORTE.kraeuterhof; male(kx - 14, ky - 10, kx + 14, ky + 10, (x, y) => (Math.hypot((x - kx) / 13, (y - ky) / 9) < 1 ? (Math.abs(x - kx) < 8 && y > ky + 1 && y < ky + 7 ? "a" : welle(x, y) > 0.6 ? "," : ".") : null));
  ding("dorf_kraeuterhaus_01", kx - 4, ky - 1, { id: "kraeuterhof_haus" }); ding("hand_kessel_01", kx + 4, ky - 2, { id: "kraeuterhof_kessel" }); ding("dorf_zaun_01", kx - 8, ky + 8); ding("dorf_zaun_01", kx + 8, ky + 8);
  lies("kraeuterhof", kx, ky + 0.6, "Der Kräuterhof. Beete voller Ringelblumen, Moorglöckchen, Eisenhut und Nebelkraut – ein zweites Kräutergebiet.");
  npc.push({ id: "kraeuterbaeuerin", rolle: "Kräuterhof", x: kx + 1, y: ky + 1 });
  for (const [i, [x, y]] of [[6372, 7040], [6382, 7030], [6392, 7046], [6366, 7056], [6380, 7062]].entries()) { male(x - 2, y - 2, x + 2, y + 2, () => "."); ding("holz_eibe_01", x, y, { id: "eibe_kueste_" + (i + 1) }); vorschlag.eiben.push({ id: "eibe_kueste_" + (i + 1), art: "eibe", x, y }); }
  weg([[kx, ky + 8], [kx + 20, ky + 20], [6468, 7100]], 1.6); }

/* ───── Schiffswrack am Strand ───── */
{ const [wx, wy] = ORTE.wrack; male(wx - 10, wy - 8, wx + 10, wy + 8, (x, y) => (!"~M".includes(zeichen(x, y)) && Math.hypot((x - wx) / 9, (y - wy) / 6) < 1 ? "s" : null));
  ding("graufurt_faehre_01", wx, wy, { id: "wrack_rumpf", s: 1.8 }); ding("k_truemmer", wx - 4, wy + 2); ding("wald_baumstamm_02", wx + 5, wy - 1, { spiegeln: true }); ding("k_kiste", wx + 3, wy + 3); ding("k_faesser", wx - 6, wy - 2);
  lies("wrack", wx + 1, wy + 2.6, "Ein Schiffswrack, halb im Sand. Am Bug noch lesbar: „Morgenstern“. Der Kapitän, sagen sie, ist nie von Bord gegangen.");
  fischplatz("fischplatz_wrack", "seeaal", 45, wx - 7, wy - 5, -0.5, 0.5, "Zwischen den Spanten des Wracks lauern Seeaale."); }

/* ───── Mangroven im Süden: Wasserwege, Stege ───── */
{ const [cx, cy] = ORTE.mangroven; male(cx - 40, cy - 26, cx + 40, cy + 26, (x, y) => { if (meer(x, y)) return null; const d = Math.hypot((x - cx) / 38, (y - cy) / 24); if (d > 1) return null;
    const kanal = Math.sin(x / 9 + Math.sin(y / 7)) * Math.sin(y / 11 - x / 23); return Math.abs(kanal) < 0.16 ? "o" : welle(x, y) > 0.8 ? "m" : "v"; });
  for (let i = 0; i < 60; i++) { const x = cx - 34 + wurf() * 68, y = cy - 20 + wurf() * 40; if (!"vm".includes(zeichen(x, y)) || objekte.some((o) => Math.hypot(o.x - x, o.y - y) < 3)) continue; ding(wurf() < 0.6 ? "stil_erle_tot_01" : "stil_laub_oliv", x, y, { s: +(0.7 + wurf() * 0.4).toFixed(2) }); }
  lies("mangroven", cx, cy - 27, "Die Mangroven. Wurzeln wie Finger im Brackwasser, schmale Wasserwege – irgendwann fahren hier Boote.");
  let fx = cx, fy = cy; for (let r = 0; r < 20 && zeichen(fx, fy) !== "o"; r++) fx += 1; fischplatz("fischplatz_mangroven", "seeaal", 45, fx - 3, fy, 1, 0, "Im Brackwasser der Mangroven ziehen Seeaale."); }

/* Küstenwald und Wege: ein paar Büsche an der Straße */
for (let i = 0; i < 3000 && objekte.filter((o) => o.kueste).length < 50; i++) { const x = 6150 + wurf() * 360, y = 6780 + wurf() * 560;
  if (Object.values(ORTE).some(([a, b]) => Math.hypot(a - x, b - y) < 26) || strecke(x, y, SUED) < 3 || strecke(x, y, SUED) > 14 || "~wMo".includes(zeichen(x, y))) continue;
  ding(wurf() < 0.5 ? "stil_busch_01" : "stil_laub_oliv", x, y, { kueste: true, s: +(0.7 + wurf() * 0.3).toFixed(2) }); }
for (const o of objekte) delete o.kueste;

/* ───── Untergrund: Klippenhöhlen und Kajüte des Wrackkapitäns (Instanz) ───── */
const raster = (B, H, frei) => Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => (frei(x + 0.5, y + 0.5) ? "h" : "F")));
const iaU = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9);
const schreibeGebiet = (id, R, g, dinge, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error(id + ": im Fels " + p.id); }
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id, ...R }, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${dinge.length} Dinge, ${spiel.interaktionen.length} Interaktionen`); };
{ const GANG = [[32, 61], [32, 50], [20, 40], [14, 26], [24, 14], [40, 12], [48, 24], [46, 38], [32, 50]], GROTTE = { x: 46, y: 18, r: 7 }, BECKEN = { x: 18, y: 30, r: 6 };
  const g = raster(64, 64, (x, y) => strecke(x, y, GANG) < 2.2 + 0.4 * zw(x, y) || Math.hypot(x - GROTTE.x, y - GROTTE.y) < GROTTE.r + 0.6 * zw(x, y) || Math.hypot(x - 32, y - 52) < 6 + 0.5 * zw(x, y) || Math.hypot(x - BECKEN.x, y - BECKEN.y) < BECKEN.r + 0.4 * zw(x, y) || (y > 56 && y < 63 && Math.abs(x - 32) < 2.5));
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (g[y][x] === "h" && Math.hypot(x + 0.5 - BECKEN.x, y + 0.5 - BECKEN.y) < BECKEN.r - 2.5) g[y][x] = "w";   /* Gezeitenbecken */
  let m = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz|graufurt)_/, "").replace(/_\d+$/, "") + "_" + ++m, objekt, x, y, ...mehr });
  const dinge = [o("hoehle_leiter_01", 32, 59.4), o("moor_feuerkorb_01", 28, 50), o("k_kiste", 36, 54), o("k_faesser", 28.5, 54), o("k_truemmer", 44, 20, { spiegeln: true }), o("hoehle_steinsaeule_01", 42, 14), o("hoehle_steinsaeule_01", 50, 22), o("graufurt_faehre_01", 46, 18.5, { id: "hoehle_rettungsboot" })];
  const [ox, oy] = [HOEHLE_U[0] * 32, HOEHLE_U[1] * 32], KAP = [KAPITAEN_U[0] * 32 + 16, KAPITAEN_U[1] * 32 + 27];
  schreibeGebiet("klippenhoehlen", { name: "Die Klippenhöhlen", untertitel: "Unter dem Leuchtturm", ursprung: HOEHLE_U, chunks: [2, 2], biom: "hoehle", stufe: 5, ebene: "untergrund" }, g, dinge,
    { start: [[32, 57]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
      interaktionen: [iaU("klippenhoehlen_hinaus", 32, 61.2, "Hinaus zur Klippe.", { tat: "klippenhoehle_hinaus", knopf: "Hinaus", ziel: [ORTE.klippenhoehlen[0], ORTE.klippenhoehlen[1] + 2] }),
        iaU("gezeitenbecken", BECKEN.x + BECKEN.r - 1.5, BECKEN.y, "Ein Gezeitenbecken. Bei Flut läuft es voll, bei Ebbe glitzern Muscheln am Grund."),
        iaU("schmugglerlager", 32, 55, "Kisten mit fremden Siegeln – Schmuggelgut, und frisch."), iaU("rettungsboot", GROTTE.x, GROTTE.y + 3.4, "Ein Rettungsboot mit der Aufschrift „Morgenstern“. Dahinter eine Tür aus Schiffsplanken."),
        iaU("kajuete_tuer", GROTTE.x + 4, GROTTE.y - 4.6, "Eine Tür aus Schiffsplanken, mit Muscheln bewachsen. Dahinter: die Kajüte des Kapitäns.", { tat: "kajuete", knopf: "Die Kajüte betreten", ziel: KAP })] });
  const gk = raster(32, 32, (x, y) => (Math.abs(x - 16) < 9 + 0.4 * zw(x, y) && Math.abs(y - 14) < 7 + 0.4 * zw(x, y)) || (Math.abs(x - 16) < 2 && y > 20 && y < 31));
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (gk[y][x] === "h") gk[y][x] = "d";
  let mk = 0; const ok = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz)_/, "").replace(/_\d+$/, "") + "_" + ++mk, objekt, x, y, ...mehr });
  const dk = [ok("hoehle_tisch_01", 16, 10), ok("k_kiste", 9, 9), ok("k_kiste", 23, 9), ok("k_faesser", 9, 18), ok("k_faesser", 23, 18), ok("moor_feuerkorb_01", 12, 15), ok("moor_feuerkorb_01", 20, 15)];
  schreibeGebiet("wrack_kajuete", { name: "Die Kajüte des Kapitäns", untertitel: "Instanz", ursprung: KAPITAEN_U, chunks: [1, 1], biom: "hoehle", stufe: 6, ebene: "untergrund" }, gk, dk,
    { start: [[16, 27]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
      interaktionen: [iaU("kajuete_hinaus", 16, 29, "Zurück in die Höhle.", { tat: "kajuete_zurueck", knopf: "Zurück", ziel: [ox + GROTTE.x + 4, oy + GROTTE.y - 2.5] }), iaU("logbuch_seite", 16, 12.4, "Auf dem Tisch: die herausgerissene Seite aus dem Logbuch des Leuchtturms.", { questobjekt: "logbuch_seite" })] }); }

/* ───── Plan schreiben ───── */
const patches = []; { const keys = [...feld.keys()].map((k) => k.split(",").map(Number)); const x0 = Math.min(...keys.map((k) => k[0])), y0 = Math.min(...keys.map((k) => k[1])), x1 = Math.max(...keys.map((k) => k[0])), y1 = Math.max(...keys.map((k) => k[1]));
  for (let ya = y0; ya <= y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, y1 + 1); y++) { let z = ""; for (let x = x0; x <= x1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0, y0: ya, zeilen }); } }
writeFileSync(join(WELT, "festland", "plan_kueste.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/kueste.mjs – festland.py arbeitet es ein. Weltfelder.", gelaende: patches, hoehen: [...hoehe.entries()].map(([k, h]) => [...k.split(",").map(Number), h]), eben, objekte, interaktionen, sperren, freigeben }) + "\n");
writeFileSync(join(WELT, "kueste_orte.json"), JSON.stringify({ hinweis: "Phase 10 (Welt #82): NPC-Plätze, Fischplätze, Adern und Eiben als Vorschlag (Weltfelder).", orte: ORTE, npc, ...vorschlag }, null, 1) + "\n");
console.log(`Küste: ${feld.size} Geländefelder, ${objekte.length} Objekte, ${interaktionen.length} Interaktionen, ${npc.length} NPC-Plätze, ${vorschlag.fischplaetze.length} Fischplätze`);
