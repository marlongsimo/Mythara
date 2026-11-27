/*
 * World Pipeline – Den Süden beleben (#120, 27.11.2026): sieben kleine Orte entlang der Südstraße, Gegner- und Arbeitsplätze.
 * Grundsatz des Nutzers: erst schauen, was es schon gibt, und darauf aufbauen. Deshalb:
 *   Rastplatz „Halber Weg“   = der vorhandene Rastplatz rast_suedstrasse (wegenetz.mjs), ergänzt um Karren, Tränke und Trödler-Platz
 *   Schilfsee + Reusenkate   = der vorhandene Quellsee der Kiel (kueste.mjs), etwas größer, mit Schilf, Kate und Steg
 *   Wegkapelle am Kreuzstein = die vorhandene Kreuzung Südstraße/Weg zum Kräuterhof
 *   Erlengrund               = am Waldrand neben den vorhandenen Eiben (eibe_kueste_1–5) und dem Kräuterhof
 *   Lehmfurt                 = an der Kiel, wo die Südstraße sie fast berührt; Furt mit Trittsteinen (Sperre mit Schalter, Quest S5)
 *   neu: Heckenhof, Summweide, Steinbruch, zwei Wegelager, Waldsenke. Keine neuen Rohstoffe – nur vorhandene Arten.
 * Plan welt/festland/plan_sueden.json (festland.py), Vorschläge (NPC, Gegner, Fisch, Kräuter, Erz, Holz, Seelenlichter) in welt/sueden_orte.json.
 * Aufruf (im Ordner realtime): node werkzeug/welt/sueden.mjs – vor festland.py.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 1200; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const GR = []; for (const n of readdirSync(join(WELT, "regionen"))) { if (!n.startsWith("fl_")) continue; const r = JSON.parse(readFileSync(join(WELT, "regionen", n, "region.json"), "utf8"));
  GR.push({ n, x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, b: r.chunks[0] * 32, h: r.chunks[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const kachel = (x, y) => GR.find((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h);
const grund = (x, y) => { const g = kachel(x, y); return g ? g.z[Math.floor(y) - g.y0][Math.floor(x) - g.x0] : "?"; };

const feld = new Map(), objekte = [], interaktionen = [], sperren = [], freigeben = [], eben = [], V = { npc: [], gegner: [], fischplaetze: [], kraeuter: [], erze: [], holz: [], seelenlichter: [], troedler: [] };
const setze = (x, y, c) => { if (grund(x + 0.5, y + 0.5) !== "M") feld.set(Math.floor(x) + "," + Math.floor(y), c); };
const zeichen = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
const ding = (id, objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error(objekt); objekte.push({ id, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }); };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const weg = (p, b = 1.8, z = "e") => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => (strecke(x, y, p) < b / 2 + 0.25 && !"~wMoF".includes(zeichen(x, y)) ? z : null)); };
const platz = (cx, cy, rx, ry, f) => male(cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1, (x, y) => { const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.06 * welle(x, y); return d < 1 ? f(x, y, d) : null; });
const kat = (x, y) => kachel(x, y)?.n;

export const ORTE = { heckenhof: [6490, 6812], summweide: [6418, 6904], schilfsee: [6450, 7188], erlengrund: [6392, 7004], lehmfurt: [6466, 7244], kreuzstein: [6476, 7098], halber_weg: [6474, 7010],
  lager_nord: [6432, 6950], lager_sued: [6496, 7166], steinbruch: [6500, 7236], waldsenke: [6342, 6968],
  faehrtenlager: [6608, 6834], laemmerhang: [6292, 7096], distelhof: [6560, 6966] };   /* #130: kleine Orte abseits der Südstraße */

/* ───── Heckenhof: Gehöft mit Feldern (Hanf, Flachs), Weiden, Pferch, Herd ───── */
{ const [x, y] = ORTE.heckenhof; platz(x, y, 22, 16, (u, v) => (v > y + 2 && u < x + 2 ? "a" : v > y + 2 ? (welle(u, v) > 0.5 ? "," : ".") : welle(u, v) > 1.1 ? "," : "."));
  eben.push([x - 20, y - 14, x + 20, y + 14]);
  ding("heckenhof_haus", "weidenhain_bauernhaus_01", x - 4, y - 3); ding("heckenhof_kate", "weidenhain_kate_01", x + 8, y - 4); ding("heckenhof_herd", "hand_herd_01", x + 3, y - 1);
  for (let i = 0; i < 6; i++) ding("heckenhof_hanf_" + (i + 1), i % 2 ? "samm_flachs_01" : "samm_hanf_01", x - 16 + (i % 3) * 5, y + 6 + Math.floor(i / 3) * 4);
  for (let i = -20; i <= 20; i += 2.4) if (Math.abs(i - 4) > 2) ding("heckenhof_zaun_" + Math.round(i + 30), "k_zaun", x + i, y + 2.2);
  const P = [x + 8, y + 4, x + 20, y + 13]; for (let u = P[0] + 1.2; u < P[2]; u += 2.4) { ding("heckenhof_pferch_n" + Math.round(u), "k_zaun", u, P[1]); ding("heckenhof_pferch_s" + Math.round(u), "k_zaun", u, P[3]); }
  lies("heckenhof", x, y + 0.6, "Der Heckenhof. Hanf und Flachs auf den Feldern, Kühe und Schafe auf der Weide – und Krähen überall."); lies("heckenhof_herd", x + 3, y + 0.4, "Der Herd vor dem Haus. Hier kocht die Bäuerin für die Knechte.", { station: "herd" });
  V.npc.push({ id: "baeuerin_heckenhof", rolle: "Bäuerin (S1)", x: x + 1, y: y + 1 }, { id: "schaefer_heckenhof", rolle: "Schäfer (S6)", x: x + 14, y: y + 3 });
  V.gegner.push({ id: "heckenhof_felder", gegner: ["feldhase", "kraehenschwarm"], stufe: "2–5", x: x - 10, y: y + 9, r: 9 }); }

/* ───── Summweide: Imkerei, Blumenwiese, Wegerich und Ringelblume ───── */
{ const [x, y] = ORTE.summweide; platz(x, y, 18, 13, (u, v) => (welle(u, v) > -0.6 ? "," : "."));
  for (const [o, dx, dy, id] of [["moor_kate_01", -6, -4, "summweide_kate_1"], ["weidenhain_kate_01", 4, -6, "summweide_kate_2"], ["moor_kate_02", 10, 2, "summweide_kate_3"]]) ding(id, o, x + dx, y + dy);
  for (let i = 0; i < 6; i++) ding("bienenstock_" + (i + 1), "k_kiste", x - 10 + i * 2.6, y + 7, { s: 0.7 });
  lies("summweide", x, y + 2, "Summweide. Über der Blumenwiese summt es, und es riecht nach Honig."); lies("bienenstoecke", x - 4, y + 9, "Bienenstöcke in einer Reihe. Einer fehlt – nur ein heller Fleck im Gras.", { questobjekt: "bienenstock" });
  for (let i = 0; i < 3; i++) V.kraeuter.push({ id: "sueden_wegerich_" + (i + 1), art: "wegerich", x: x - 12 + i * 6 + 0.5, y: y - 9.5, region: kat(x, y) }, { id: "sueden_ringelblume_" + (i + 1), art: "ringelblume", x: x - 8 + i * 6 + 0.5, y: y + 10.5, region: kat(x, y) });
  V.npc.push({ id: "imkerin_summweide", rolle: "Imkerin (S2)", x: x + 1, y: y + 3 }); V.gegner.push({ id: "summweide_rand", gegner: ["wildbienen_schwarm"], stufe: 8, x: x - 4, y: y + 12, r: 6 }); }

/* ───── Schilfsee (der Quellsee der Kiel) mit Reusenkate und Steg ───── */
{ const [x, y] = ORTE.schilfsee; platz(x, y, 15, 11, (u, v, d) => (d < 0.62 ? "w" : d < 0.78 ? (welle(u, v) > 0 ? "v" : ".") : null));
  for (let i = 0; i < 18; i++) { const w = (i / 18) * 6.28, r = 0.68 + 0.06 * Math.sin(i * 1.7); ding("schilfsee_schilf_" + (i + 1), i % 2 ? "stil_schilf_01" : "stil_schilf_02", x + Math.cos(w) * 15 * r, y + Math.sin(w) * 11 * r); }
  ding("reusenkate", "moor_kate_01", x - 15, y - 4); ding("reusenkate_reuse", "k_faesser", x - 18, y - 2);
  const sx = x - 9.5, sy = y + 1.3; ding("schilfsee_steg", "dorf_bruecke_01", sx + 4.9, sy); freigeben.push({ art: "rechteck", x0: sx - 0.4, y0: sy - 2.6, x1: sx + 7.9, y1: sy });
  lies("schilfsee", x - 11, y - 1.4, "Der Schilfsee. Hier entspringt die Kiel; im Schilf ziehen Bachlinge, weiter draußen Mühlbarsche.");
  for (const [i, [fx, fy, sx2, sy2]] of [[1, [sx + 8.5, sy - 1.3, sx + 7.2, sy - 1.3]], [2, [x + 1.5, y - 6.5, x + 1.5, y - 8.4]], [3, [x + 9, y + 0.5, x + 10.8, y + 0.5]]])
    V.fischplaetze.push({ id: "schilfsee_fisch_" + i, fische: ["bachling", "muehlbarsch"], stufe: "1–10", x: fx, y: fy, stehplatz: [sx2, sy2] });
  V.npc.push({ id: "fischerin_schilfsee", rolle: "Fischerin (S3)", x: x - 13, y: y - 1 }); V.gegner.push({ id: "schilfsee_ufer", gegner: ["schilfkroete"], stufe: 12, x: x + 8, y: y + 10, r: 6 }); }

/* ───── Erlengrund: Holzfällerdorf mit Sägemühle (Werkbank, Wasserrad am Teich), Köhlermeiler, Waldsenke ───── */
{ const [x, y] = ORTE.erlengrund; platz(x, y, 16, 12, (u, v) => (welle(u, v) > 0.8 ? "t" : "."));
  male(x - 15, y - 2, x - 7, y + 5, (u, v) => (Math.hypot((u - x + 11) / 4, (v - y - 1.5) / 3) < 1 ? "w" : null));
  ding("saegemuehle", "graufurt_steinhaus_02", x - 3, y - 2); ding("saegemuehle_rad", "hand_wasserrad_01", x - 8.6, y + 1.5); ding("saegemuehle_werkbank", "hand_werkbank_01", x + 3, y + 2);
  ding("erlengrund_stamm_1", "wald_baumstamm_01", x + 7, y + 4); ding("erlengrund_stamm_2", "wald_baumstamm_02", x + 9, y + 1, { spiegeln: true }); ding("erlengrund_holz", "dorf_holzstapel_01", x + 6, y - 3);
  ding("erlengrund_meiler", "wald_meiler_01", x + 12, y - 6); ding("erlengrund_kate", "dorf_huette_holz_02", x - 10, y - 7);
  lies("saegemuehle", x - 2, y - 1.4, "Die Sägemühle von Erlengrund. Das Rad steht still – die Welle klemmt.", { questobjekt: "saegemuehle_rad" }); lies("saegemuehle_werkbank", x + 3, y + 3.6, "Die Werkbank in der Sägemühle.", { station: "werkbank", schalter: "saegemuehle_frei" });
  lies("koehlermeiler", x + 12, y - 4.4, "Ein Köhlermeiler. Er qualmt seit drei Tagen.");
  V.holz.push(...[["eiche", -14, -12], ["eiche", -8, -14], ["tanne", 0, -15], ["tanne", 6, -14], ["eiche", -16, 10]].map(([art, dx, dy], i) => ({ id: "erlengrund_" + art + "_" + (i + 1), art, x: x + dx + 0.5, y: y + dy + 0.5 })),
    ...["eibe_kueste_1", "eibe_kueste_2", "eibe_kueste_3", "eibe_kueste_4", "eibe_kueste_5"].map((id) => ({ id, art: "eibe", vorhanden: true })));
  V.npc.push({ id: "saegemueller", rolle: "Sägemüller (S4)", x: x + 1, y: y + 1 });
  V.gegner.push({ id: "erlengrund_wald", gegner: ["fuchs", "wildschwein"], stufe: "14 / 18", x: x - 26, y: y - 6, r: 10 });
  /* Waldsenke des Graupelz */
  const [wx, wy] = ORTE.waldsenke; platz(wx, wy, 9, 7, (u, v) => (welle(u, v) > 0.5 ? "g" : "f")); for (let j = -8; j <= 8; j++) for (let i = -10; i <= 10; i++) { const d = Math.hypot(i / 9, j / 7); if (d < 1) feld.set((wx + i) + "," + (wy + j), zeichen(wx + i, wy + j)); }
  V.hoehen = [[wx, wy, 9, -1.4]]; ding("waldsenke_knochen", "k_truemmer", wx + 2, wy + 1); lies("waldsenke", wx, wy + 2.4, "Eine Senke im Wald. Abgenagte Knochen, Pfotenabdrücke so groß wie ein Teller.");
  V.gegner.push({ id: "waldsenke_graupelz", gegner: ["graupelz", "wolf", "wolf"], stufe: 30, x: wx, y: wy, r: 6, selten: "alle 15 min" }); }

/* ───── Lehmfurt: Weiler an der Kiel, Schmiede, Steinbruch, Furt mit Trittsteinen ───── */
{ const [x, y] = ORTE.lehmfurt; platz(x, y, 12, 9, (u, v) => ("~w".includes(zeichen(u, v)) ? null : welle(u, v) > 1 ? "," : "."));
  ding("lehmfurt_schmiede", "dorf_schmiede_01", x + 2, y - 2); ding("lehmfurt_kate", "moor_kate_02", x - 7, y - 4); ding("lehmfurt_holz", "dorf_holzstapel_01", x + 8, y);
  lies("lehmfurt_schmiede", x + 3.5, y - 1.4, "Die kleine Schmiede von Lehmfurt: Esse und Amboss, Erz aus dem Steinbruch nebenan.", { station: "esse_amboss" });
  /* Furt: wo die Kiel am nächsten ist, ein Streifen Schlamm (begehbar) mit Sperre bis zur Quest S5 */
  let fy = y + 2, fx = x; while (!"~".includes(zeichen(fx, fy)) && fx > x - 40) fx--; let fx0 = fx; while ("~".includes(zeichen(fx0 - 1, fy))) fx0--;
  for (let u = fx0 - 1; u <= fx + 1; u++) for (let v = fy - 1; v <= fy + 1; v++) if ("~".includes(zeichen(u, v))) setze(u, v, "m");
  sperren.push({ art: "rechteck", x0: fx0 - 1, y0: fy - 1.5, x1: fx + 2, y1: fy + 2.5, schalter: "lehmfurt_trittsteine" });
  lies("furt", fx + 2.5, fy + 0.5, "Eine Furt durch die Kiel. Mit ein paar Trittsteinen käme man trocken hinüber.", { questobjekt: "trittsteine" }); V.furt = { x: (fx0 + fx) / 2, y: fy, schalter: "lehmfurt_trittsteine" };
  /* Steinbruch östlich: Felskante, Geröllboden, Erzadern (gesperrte Felder) */
  const [sx, sy] = ORTE.steinbruch; platz(sx, sy, 11, 9, (u, v, d) => (d > 0.78 && v < sy ? "F" : "g"));
  for (const [id, art, dx, dy] of [["lehmfurt_kupfer_1", "kupfer", -6, -6], ["lehmfurt_kupfer_2", "kupfer", -2, -7], ["lehmfurt_eisen_1", "eisen", 3, -7], ["lehmfurt_eisen_2", "eisen", 7, -5], ["lehmfurt_schwarzeisen_1", "schwarzeisen", 9, -2]]) {
    const ex = sx + dx + 0.5, ey = sy + dy + 0.5; setze(ex, ey, "g"); sperren.push({ art: "rechteck", x0: Math.floor(ex), y0: Math.floor(ey), x1: Math.floor(ex) + 1, y1: Math.floor(ey) + 1 }); V.erze.push({ id, art, x: ex, y: ey }); }
  for (const [dx, dy] of [[-3, 2], [4, 3], [0, -2]]) ding("steinbruch_fels_" + (dx + 10), "hoehle_felswand_01", sx + dx, sy + dy, { s: 0.5 });
  lies("steinbruch", sx, sy + 4, "Der Steinbruch von Lehmfurt. Kupfer, Eisen und an der Kante sogar Schwarzeisen.");
  weg([[x + 6, y], [sx - 6, sy + 2]], 1.6);
  V.npc.push({ id: "schmied_lehmfurt", rolle: "Schmied (S5)", x: x + 3, y: y });
  V.gegner.push({ id: "steinbruch", gegner: ["steinschlucker"], stufe: 26, x: sx, y: sy + 1, r: 6 }); }

/* ───── Wegkapelle am Kreuzstein (Kreuzung Südstraße/Weg zum Kräuterhof) ───── */
{ const [x, y] = ORTE.kreuzstein; platz(x, y, 5, 4, () => "p");
  ding("wegkapelle", "moor_schrein_01", x + 1, y - 1); ding("kreuzstein", "moor_menhir_02", x - 2.5, y - 0.5);
  lies("wegkapelle", x + 1, y + 1.2, "Die Wegkapelle am Kreuzstein. Das Licht darin ist erloschen.", { questobjekt: "wegkapelle" });
  for (let i = 0; i < 3; i++) { const w = (i / 3) * 6.28 + 0.6; V.seelenlichter.push({ id: "kreuzstein_licht_" + (i + 1), art: "wiese", x: +(x + Math.cos(w) * 5).toFixed(1), y: +(y + Math.sin(w) * 4).toFixed(1), region: kat(x, y) }); } }

/* ───── Rastplatz „Halber Weg“ (= vorhandener Rastplatz rast_suedstrasse): Karren, Tränke, Trödler ───── */
{ const [x, y] = ORTE.halber_weg; ding("halber_weg_karren", "k_karren", x + 5, y - 3); ding("halber_weg_traenke", "k_faesser", x - 5, y - 3);
  lies("halber_weg", x + 4, y + 2.4, "Der Rastplatz „Halber Weg“. Bis Weidenhain ist es so weit wie bis Kielmund."); V.troedler.push({ id: "troedler_halber_weg", x: x + 7.5, y: y + 1.5, ort: "Rastplatz „Halber Weg“ an der Südstraße", variante: "karren" }); }

/* ───── zwei Wegelagerer-Lager an der Südstraße ───── */
for (const [k, [x, y]] of [["nord", ORTE.lager_nord], ["sued", ORTE.lager_sued]]) { platz(x, y, 7, 5, (u, v) => (welle(u, v) > 0.4 ? "t" : "."));
  ding(`wegelager_${k}_zelt`, "welt_zelt_01", x - 2, y - 1); ding(`wegelager_${k}_feuer`, "moor_feuerkorb_01", x + 2, y + 1); ding(`wegelager_${k}_kiste`, "k_kiste", x + 4, y - 2);
  lies("wegelager_" + k, x, y + 2.4, "Ein Lager im Gebüsch, gut versteckt neben der Straße. Wegelagerer."); V.gegner.push({ id: "wegelager_" + k, gegner: ["wegelagerer_knueppel", "wegelagerer_schleuder"], stufe: k === "nord" ? 20 : 22, x, y, r: 7, fliehen: true }); }

/* ───── #130: kleine Orte abseits der Südstraße ───── */
{ const [x, y] = ORTE.faehrtenlager; platz(x, y, 10, 7, (u, v) => (welle(u, v) > 0.6 ? "t" : "."));   /* Jägerlager im Südosten, Richtung Osthang/Graufurt */
  ding("faehrtenlager_zelt_1", "welt_zelt_01", x - 3, y - 2); ding("faehrtenlager_zelt_2", "welt_zelt_01", x + 3, y - 3, { spiegeln: true }); ding("faehrtenlager_feuer", "dorf_festfeuer_01", x, y + 1);
  ding("faehrtenlager_holz", "dorf_holzstapel_01", x + 6, y); ding("faehrtenlager_kiste", "k_kiste", x - 6, y + 1);
  lies("faehrtenlager", x, y + 3.4, "Das Fährtenlager. Jäger aus Graufurt trocknen hier Felle und lesen die Spuren der Wölfe.", { station: "feuer" }); V.npc.push({ id: "jaegerin_faehrtenlager", rolle: "Jägerin", x: x + 2, y: y + 2 }); }
{ const [x, y] = ORTE.laemmerhang; platz(x, y, 14, 10, (u, v) => (welle(u, v) > 0.7 ? "," : "."));   /* Schäferei im Westen zwischen Erlengrund und Möwenbucht */
  ding("laemmerhang_kate", "moor_kate_01", x - 4, y - 3); ding("laemmerhang_stall", "dorf_huette_holz_01", x + 5, y - 4);
  const P = [x - 9, y + 1, x + 9, y + 8]; for (let u = P[0] + 1.2; u < P[2]; u += 2.4) { ding("laemmerhang_zaun_n" + Math.round(u), "k_zaun", u, P[1]); if (Math.abs(u - x) > 2) ding("laemmerhang_zaun_s" + Math.round(u), "k_zaun", u, P[3]); }
  lies("laemmerhang", x, y - 0.4, "Der Lämmerhang, eine Schäferei. Im Pferch blöken die Lämmer, der Hund schläft in der Sonne."); V.npc.push({ id: "schaeferin_laemmerhang", rolle: "Schäferin", x: x + 1, y: y - 1 }); }
{ const [x, y] = ORTE.distelhof; platz(x, y, 12, 9, (u, v) => (v > y + 1 ? "a" : welle(u, v) > 1 ? "," : "."));   /* kleiner Hof östlich der Südstraße */
  ding("distelhof_haus", "weidenhain_kate_01", x - 2, y - 2); ding("distelhof_holz", "dorf_holzstapel_01", x + 5, y - 2); for (let u = x - 9; u <= x + 9; u += 2.4) ding("distelhof_zaun_" + Math.round(u + 20), "k_zaun", u, y + 1.2);
  lies("distelhof", x, y + 0.4, "Der Distelhof. Mehr Disteln als Korn – aber die Bäuerin gibt nicht auf."); V.npc.push({ id: "baeuerin_distelhof", rolle: "Bäuerin", x: x + 1, y: y }); }
weg([[6672, 6770], [6640, 6800], [ORTE.faehrtenlager[0] + 4, ORTE.faehrtenlager[1] - 2]]);
weg([[ORTE.erlengrund[0] - 14, ORTE.erlengrund[1] + 6], [6340, 7050], [ORTE.laemmerhang[0] + 8, ORTE.laemmerhang[1] - 3]]);
weg([[6464, 6966], [ORTE.distelhof[0] - 10, ORTE.distelhof[1]]]);

/* ───── Wege und Anschlüsse an die Südstraße ───── */
weg([[6458, 6812], [ORTE.heckenhof[0] - 6, ORTE.heckenhof[1]]]);
weg([[6458, 6900], [ORTE.summweide[0] + 6, ORTE.summweide[1] + 2]]);
weg([[6470, 7010], [ORTE.erlengrund[0] + 10, ORTE.erlengrund[1] + 2]]);
weg([[6466, 7182], [ORTE.schilfsee[0] + 10, ORTE.schilfsee[1] + 6], [ORTE.schilfsee[0] - 12, ORTE.schilfsee[1] + 9], [ORTE.schilfsee[0] - 14, ORTE.schilfsee[1] - 1]], 1.6);
weg([[6462, 7244], [ORTE.lehmfurt[0], ORTE.lehmfurt[1] + 1]]);

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let z = ""; for (let x = X0; x <= X1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
const hoehen = []; for (const [hx, hy, r, h] of V.hoehen || []) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = Math.hypot(i, j) / r; if (d < 1) hoehen.push([hx + i, hy + j, +(h * (1 - d * d)).toFixed(2)]); }
delete V.hoehen;
writeFileSync(join(WELT, "festland", "plan_sueden.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/sueden.mjs (#120). Weltfelder.", gelaende: patches, hoehen, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
writeFileSync(join(WELT, "sueden_orte.json"), JSON.stringify({ hinweis: "Den Süden beleben (#120): Orte, NPC-Plätze, Gegnerplätze, Fischplätze, Kräuter-, Erz-, Holz- und Seelenlicht-Stellen als Vorschlag (Weltfelder). Keine neuen Rohstoffe.", orte: ORTE, ...V }, null, 1) + "\n");
/* Kräuterstellen und Trödler-Platz gleich in die Weltdateien übernehmen (kraeuter.py behält „sueden_…“) */
const kp = join(WELT, "kraeuter_standorte.json"), k = JSON.parse(readFileSync(kp, "utf8")); k.stellen = [...k.stellen.filter((s) => !s.id.startsWith("sueden_")), ...V.kraeuter]; writeFileSync(kp, JSON.stringify(k, null, 1) + "\n");
const tp = join(WELT, "troedler_standorte.json"), t = JSON.parse(readFileSync(tp, "utf8")); t.standorte = [...t.standorte.filter((s) => s.id !== "troedler_halber_weg"), ...V.troedler.map((s) => ({ ...s, region: kat(s.x, s.y), frei: 1.8 }))]; writeFileSync(tp, JSON.stringify(t, null, 1) + "\n");
console.log(`Süden: ${feld.size} Geländefelder, ${objekte.length} Objekte, ${interaktionen.length} Lesestellen; ${V.npc.length} NPC, ${V.gegner.length} Gegnerplätze, ${V.fischplaetze.length} Fischplätze, ${V.kraeuter.length} Kräuter, ${V.erze.length} Erze, ${V.holz.length} Holz, ${V.seelenlichter.length} Lichter`);
