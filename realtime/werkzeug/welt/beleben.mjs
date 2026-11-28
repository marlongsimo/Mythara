/*
 * World Pipeline – Welt beleben (#140, 27.11.2026): zwei leere Flächen bekommen Leben.
 *   West: südwestlich von Rabenmoor, westlich der Südstraße bis zur Westküste – Marktflecken „Haferstedt“, Fischerweiler „Netzbucht“ an der Bucht,
 *         dazu Baumgruppen, einzelne Bäume, Hecken, Felder, Teiche, Feldwege und Steine; der Dschungelboden („j“) wird zu lichtem Wald.
 *   Ost:  die Glutsande östlich des Ostufers bis zur Ostküste – Oasenort „Sandquell“ an einer neuen Wegkreuzung (Oase – Salzpfanne – Nordstrand),
 *         dazu Felsgruppen, Trockenbüsche, tote Bäume, Trockengras-Flecken, ausgetrocknete Bachläufe (Senken), Ruinenreste.
 * Nur vorhandene Objekte der Bibliothek, keine neuen Rohstoffe. Orte und Lesestellen anderer Phasen, Wege, Wasser und Gegnerlager bleiben frei.
 * Schreibt welt/festland/plan_beleben.json (festland.py arbeitet es als erstes ein) und welt/beleben_orte.json (Ortsnamen für grenzland.mjs,
 * Ausnahmen für gegnerplaetze.py, NPC-Vorschläge). Wiederholbar: das ursprüngliche Gelände unter den eigenen Flächen steht in welt/festland/beleben_grund.json.
 * Aufruf (im Ordner realtime): node werkzeug/welt/beleben.mjs, danach die ganze Kette (festland.py … bauen, gegnerplaetze.py, weltzonen, weltkarte, drei).
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 14040; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wahl = (l) => l[Math.floor(wurf() * l.length)];

/* ───── Grundgelände, Objekte und Lesestellen der Welt lesen (ohne die eigenen von früheren Läufen) ───── */
const GRUNDDATEI = join(WELT, "festland", "beleben_grund.json");
const alt = existsSync(GRUNDDATEI) ? new Map(Object.entries(JSON.parse(readFileSync(GRUNDDATEI, "utf8")).felder)) : new Map();
const GR = [], belegt = [], orte = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32; GR.push({ x0, y0, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") });
  for (const o of JSON.parse(readFileSync(join(WELT, "regionen", n, "objekte.json"), "utf8"))) if (!o.id.startsWith("bl_")) belegt.push([o.x + x0, o.y + y0, BIB.get(o.objekt)?.kategorie === "gebaeude" ? 7 : 3]);
  const sp = JSON.parse(readFileSync(join(WELT, "regionen", n, "spiel.json"), "utf8"));
  for (const i of sp.interaktionen || []) if (!i.id.startsWith("bl_")) belegt.push([i.x + x0, i.y + y0, 6]);
  for (const f of sp.figuren || []) belegt.push([f.x + x0, f.y + y0, 5]); }
const roh = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const grund = (x, y) => alt.get(Math.floor(x) + "," + Math.floor(y)) ?? roh(x, y);
/* Orte anderer Phasen freihalten (Ortsmitte mit Radius) */
const ortsdatei = (f) => existsSync(join(WELT, f)) ? JSON.parse(readFileSync(join(WELT, f), "utf8")) : {};
for (const f of ["sueden_orte.json", "kueste_orte.json", "glutsande_orte.json"]) for (const [k, [x, y]] of Object.entries(ortsdatei(f).orte || {})) orte.push([x, y, /glutbrunn|kielmund/.test(k) ? 50 : /mangroven|suedstrasse/.test(k) ? 0 : 22]);
for (const [x, y] of [[6176, 7036], [6214, 7160], [6180, 7090], [6282, 7262]]) orte.push([x, y, 18]);   /* Leuchtturm, Möwenbucht, Klippenhöhlen, Wrack */
for (const g of [...(ortsdatei("gegnerplaetze.json").plaetze || [])]) if (g.x) belegt.push([g.x, g.y, 4]);   /* Gegnerplätze aussparen */
for (const s of ortsdatei("troedler_standorte.json").standorte || []) belegt.push([s.x, s.y, 6]);
for (const s of ortsdatei("bedienstellen.json").stationen || []) belegt.push([s.x, s.y, 6]);

/* ───── Plan ───── */
const feld = new Map(), urs = new Map(), hoehen = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], npc = [];
const nass = (c) => "~wMo".includes(c);
const setze = (x, y, c) => { const k = Math.floor(x) + "," + Math.floor(y), g = grund(x, y); if (g === "?" || (nass(g) && c !== "w") || "F".includes(g)) return; if (!urs.has(k)) urs.set(k, g); feld.set(k, c); };
const jetzt = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehen.set(k, (hoehen.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
const meine = []; let nr = 0;
const ding = (objekt, x, y, mehr = {}, r = 2) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: mehr.id || `bl_${objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|welt|weidenhain|kueste|sueden|wald)_/, "").replace(/_\d+$/, "")}_${++nr}`, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; delete o.r; objekte.push(o); meine.push([x, y, r]); return o; };
const lies = (id, x, y, text) => { interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text } }); meine.push([x, y, 3]); };
const weg = (punkte, breite = 1.8, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]); wege.push({ punkte, breite });
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) ? zeichen : null); };
const wege = [], flaechen = [];   /* eigene Orte (Rechtecke), in denen der Streukram nichts setzt */
const wegNah = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if ("ekpd".includes(jetzt(x + dx, y + dy))) return true; return false; };
const frei = (x, y, r, gruende) => { if (!gruende.includes(jetzt(x, y))) return false;
  for (let a = 0; a < 6.3; a += 1.05) if (!gruende.includes(jetzt(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7))) return false;
  if (wegNah(x, y, 2)) return false; if (flaechen.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1)) return false;
  if (orte.some(([ox, oy, or]) => Math.hypot(ox - x, oy - y) < or)) return false;
  if (belegt.some(([bx, by, br]) => Math.abs(bx - x) < br + r && Math.abs(by - y) < br + r && Math.hypot(bx - x, by - y) < br + r * 0.5)) return false;
  return !meine.some(([bx, by, br]) => Math.abs(bx - x) < br + r && Math.hypot(bx - x, by - y) < Math.max(br, r)); };
const zaehl = {};
const zaehle = (k) => (zaehl[k] = (zaehl[k] || 0) + 1);

/* ═════════════════════ WEST ═════════════════════ */
export const ORTE = { haferstedt: [6215, 6980], netzbucht: [6146, 6930], sandquell: [7384, 6740], nordstrand: [7450, 6500] };
const BAEUME_W = ["stil_eiche_01", "stil_eiche_02", "stil_linde_01", "stil_laub_oliv", "stil_laub_dunkel", "stil_birke_01", "wald_baum1", "wald_baum3", "wald_baum5"];
{ /* ───── Haferstedt: Marktflecken mit Markt, zwei Gassen, Mühle und Feldern ───── */
  const [mx, my] = ORTE.haferstedt; flaechen.push([mx - 50, my - 34, mx + 50, my + 34]); eben.push([mx - 44, my - 26, mx + 44, my + 26]);
  male(mx - 44, my - 26, mx + 44, my + 26, (x, y) => (".,jv".includes(grund(x, y)) ? (welle(x, y) > 1.2 ? "," : ".") : null));   /* Ortsboden */
  male(mx - 13, my - 8, mx + 13, my + 10, () => "p");                       /* Marktplatz */
  weg([[mx - 46, my + 1], [mx + 46, my + 1]], 3, "k");                          /* Hauptgasse */
  weg([[mx - 36, my + 17], [mx + 38, my + 17]], 2.4, "k");                      /* Hintergasse */
  weg([[mx, my + 10], [mx, my + 17]], 2.6, "k");
  ding("dorf_brunnen_01", mx, my - 3, { id: "bl_haferstedt_brunnen" }, 3);
  ding("dorf_marktstand_01", mx - 8, my + 6, { id: "bl_haferstedt_stand_1" }); ding("dorf_marktstand_02", mx, my + 7, { id: "bl_haferstedt_stand_2" }); ding("dorf_marktstand_03", mx + 8, my + 6, { id: "bl_haferstedt_stand_3" });
  for (const [dx, dy] of [[-12, -7], [12, -7], [-12, 8], [12, 8]]) ding("dorf_laterne_01", mx + dx, my + dy);
  ding("k_karren", mx - 10, my + 3); ding("dorf_fass_01", mx + 10, my - 4); ding("dorf_kiste_01", mx + 11, my - 3); ding("dorf_bank_01", mx - 5, my - 6); ding("dorf_bank_01", mx + 5, my - 6);
  lies("bl_haferstedt", mx + 2.5, my - 1.5, "Haferstedt. Ein Marktflecken mitten in den Feldern – wer zwischen Rabenmoor und der Küste Korn, Wolle oder Fisch verkaufen will, kommt am Markttag hierher.");
  /* Häuser nördlich der Hauptgasse (Tür nach Süden zur Gasse) */
  const nord = [[-40, "weidenhain_fachwerk_02"], [-31, "dorf_haus_holz_01"], [-22, "weidenhain_fachwerk_03"], [-4, "dorf_taverne_01", "bl_haferstedt_taverne"], [20, "dorf_baeckerei_01", "bl_haferstedt_baeckerei"], [31, "waldmark_bank_01", "bl_haferstedt_bank"], [40, "weidenhain_bauernhaus_01"]];   /* Bank (#169: jede größere Stadt mit Bankschalter) */
  for (const [dx, o, id] of nord) ding(o, mx + dx, my - 9 + (dx === -4 ? 0 : 7), id ? { id } : {}, 6);
  lies("bl_haferstedt_bank_tuer", mx + 31, my - 1.4, "Die Bank von Haferstedt. Dasselbe Konto wie in der Stadt – und am Markttag eine lange Schlange.");
  ding("dorf_kapelle_01", mx - 3, my - 26, { id: "bl_haferstedt_kapelle" }, 6); weg([[mx + 3, my - 18], [mx + 3, my - 9]], 1.6, "k");
  /* Häuser zwischen den Gassen (Tür zur Hintergasse) */
  const mitte = [[-30, "dorf_haus_holz_03"], [-21, "weidenhain_kate_01"], [-12, "dorf_schmiede_01", "bl_haferstedt_schmiede"], [14, "weidenhain_fachwerk_02"], [23, "dorf_haus_holz_01"], [32, "weidenhain_kate_01"]];
  for (const [dx, o, id] of mitte) ding(o, mx + dx, my + 15, id ? { id } : {}, 5);
  /* südlich der Hintergasse: Scheunen, Kornspeicher, Gärten */
  ding("weidenhain_kornspeicher_01", mx - 22, my + 30, { id: "bl_haferstedt_kornspeicher" }, 8); ding("dorf_scheune_holz_01", mx + 22, my + 29, {}, 6); ding("dorf_schuppen_holz_01", mx + 32, my + 28, {}, 4);
  for (const [dx, dy] of [[-36, 24], [-8, 24], [4, 24], [12, 26]]) { male(mx + dx - 4, my + dy - 2, mx + dx + 4, my + dy + 3, () => "a"); ding("dorf_zaun_01", mx + dx - 3, my + dy + 3.4); ding("dorf_zaun_01", mx + dx + 1, my + dy + 3.4); }
  ding("dorf_kuerbisse_01", mx - 8, my + 24); ding("dorf_heuballen_01", mx + 26, my + 31); ding("dorf_heuballen_01", mx + 29, my + 32); ding("dorf_holzstapel_01", mx - 14, my + 21);
  /* Windmühle und Felder im Norden */
  ding("dorf_windmuehle_01", mx + 30, my - 30, { id: "bl_haferstedt_muehle" }, 6); weg([[mx + 30, my - 29], [mx + 34, my - 9]], 1.6, "e");
  for (const [x0, y0, b, h] of [[mx - 46, my - 52, 22, 14], [mx - 20, my - 54, 18, 12], [mx + 40, my - 50, 20, 16], [mx + 52, my - 28, 14, 20], [mx - 70, my + 8, 16, 22], [mx + 52, my + 14, 18, 16], [mx - 4, my + 38, 24, 12]]) {
    male(x0, y0, x0 + b, y0 + h, (x, y) => (".,jv".includes(grund(x, y)) ? "a" : null)); flaechen.push([x0 - 2, y0 - 2, x0 + b + 2, y0 + h + 2]); zaehle("Felder");
    for (let x = x0 + 1.2; x < x0 + b - 1; x += 2.4) if (".,jv".includes(grund(x, y0 + h + 0.6))) ding("k_hecke", x, y0 + h + 0.9, {}, 1);
    if (wurf() < 0.6) ding(wahl(["dorf_heuballen_01", "sueden_vogelscheuche", "dorf_heuballen_01"]), x0 + b / 2, y0 + h / 2, {}, 2); }
  /* Wege hinaus: nach Osten zum Erlengrund, nach Süden zum Leuchtturmpfad, nach Westen zur Netzbucht */
  weg([[mx + 46, my + 1], [6290, 6992], [6340, 7004], [6378, 7010]], 1.8);
  weg([[mx, my + 17], [mx - 4, my + 36], [6204, 7040], [6197, 7070]], 1.8);
  weg([[mx - 46, my + 1], [6168, 6960], [6152, 6940]], 1.6);
  npc.push({ id: "marktvogt_haferstedt", rolle: "Marktvogt (Markt)", x: mx + 2, y: my + 1.5 }, { id: "bankier_haferstedt", rolle: "Bank (Schalter, Systeme)", x: mx + 31, y: my - 0.6 }, { id: "wirtin_haferstedt", rolle: "Wirtin (Taverne)", x: mx - 4, y: my - 7.5 },
    { id: "baecker_haferstedt", rolle: "Bäcker", x: mx + 20, y: my - 0.6 }, { id: "schmiedin_haferstedt", rolle: "Schmiedin", x: mx - 12, y: my + 16.5 }, { id: "mueller_haferstedt", rolle: "Müller", x: mx + 30, y: my - 28.5 },
    { id: "haendler_haferstedt_1", rolle: "Händler am Marktstand", x: mx - 8, y: my + 7.4 }, { id: "haendler_haferstedt_2", rolle: "Händlerin am Marktstand", x: mx + 8, y: my + 7.4 }); }

{ /* ───── Netzbucht: Fischerweiler am Südufer der kleinen Bucht ───── */
  const [nx, ny] = ORTE.netzbucht; flaechen.push([nx - 20, ny - 10, nx + 22, ny + 14]);
  male(nx - 16, ny - 6, nx + 18, ny + 10, (x, y) => (jetzt(x, y) === "j" ? (Math.hypot(x - nx, (y - ny) * 1.4) < 14 ? "s" : ".") : null));
  ding("moor_fischer_01", nx - 8, ny + 6, { id: "bl_netzbucht_kate_1" }, 5); ding("moor_fischer_01", nx + 6, ny + 7, { id: "bl_netzbucht_kate_2" }, 5); ding("moor_kate_02", nx + 15, ny + 4, {}, 5);
  ding("kueste_raeucherhuette", nx - 14, ny + 2, { id: "bl_netzbucht_raeucherhuette" }, 4); ding("kueste_netze", nx - 2, ny - 1, {}, 2); ding("kueste_netze", nx + 4, ny - 2, { spiegeln: true }, 2);
  ding("moor_kahn_01", nx - 4, ny - 6, {}, 2); ding("k_faesser", nx + 9, ny + 1); ding("k_kiste", nx + 10, ny + 2); ding("dorf_holzstapel_01", nx - 11, ny + 8); ding("dorf_festfeuer_01", nx + 1, ny + 3, {}, 2);
  lies("bl_netzbucht", nx + 1, ny + 1, "Netzbucht. Drei Fischerkaten und eine Räucherhütte an einer stillen Bucht. Der Fang geht jeden Markttag nach Haferstedt.");
  npc.push({ id: "fischer_netzbucht", rolle: "Fischer (Räucherfisch)", x: nx - 12, y: ny + 3.5 }, { id: "netzflickerin_netzbucht", rolle: "Netzflickerin", x: nx + 2, y: ny + 0.5 }); }

/* ───── Westen: Streugut auf Wiese und Dschungelboden ───── */
const WEST = [6036, 6784, 6446, 7330], OST = [6890, 6420, 7600, 7660];
const streu = (box, schritte, f) => { for (let i = 0; i < schritte; i++) f(box[0] + wurf() * (box[2] - box[0]), box[1] + wurf() * (box[3] - box[1])); };
const westlich = (x, y) => x < 6446 - (y > 7100 ? 10 : 0) && strecke(x, y, [[6448, 6762], [6456, 6840], [6462, 6904], [6466, 6960], [6470, 7003], [6472, 7050], [6472, 7092], [6468, 7160], [6462, 7230], [6450, 7270]]) > 14;
/* Teiche (Wasser mit Schilfrand) */
streu(WEST, 600, (x, y) => { if (zaehl.Teiche >= 9 || !westlich(x, y) || !frei(x, y, 12, ".,j")) return; const rx = 4 + wurf() * 4, ry = 3 + wurf() * 3;
  male(x - rx - 3, y - ry - 3, x + rx + 3, y + ry + 3, (a, b) => { const d = Math.hypot((a - x) / rx, (b - y) / ry) + 0.08 * welle(a, b); return d < 1 ? "w" : d < 1.35 ? "s" : null; });
  for (let a = 0; a < 6.3; a += 0.9 + wurf()) ding(wahl(["stil_schilf_01", "stil_schilf_02"]), x + Math.cos(a) * (rx + 0.6), y + Math.sin(a) * (ry + 0.6), {}, 0.5);
  if (wurf() < 0.5) ding("stil_erle_tot_01", x + rx + 2, y - 1, {}, 1); meine.push([x, y, Math.max(rx, ry) + 4]); zaehle("Teiche"); });
/* Felder mit Hecke draußen bei den Höfen */
streu(WEST, 900, (x, y) => { if (zaehl.Feldstücke >= 14 || !westlich(x, y) || !frei(x, y, 12, ".,")) return; const b = 12 + Math.floor(wurf() * 10), h = 8 + Math.floor(wurf() * 8);
  male(x - b / 2, y - h / 2, x + b / 2, y + h / 2, (a, c) => (".,".includes(grund(a, c)) ? "a" : null));
  for (let a = x - b / 2 + 1.2; a < x + b / 2 - 1; a += 2.4) ding("k_hecke", a, y + h / 2 + 0.9, {}, 0.5);
  if (wurf() < 0.5) ding(wahl(["dorf_heuballen_01", "sueden_vogelscheuche"]), x, y, {}, 1); meine.push([x, y, Math.max(b, h) / 2 + 2]); zaehle("Feldstücke"); });
/* Feldwege zwischen Haferstedt, Lämmerhang und Summweide */
weg([[6262, 6981], [6280, 6950], [6330, 6926], [6400, 6912]], 1.4);
weg([[6215, 7016], [6260, 7040], [6300, 7090]], 1.4);
/* Hecken an Wegen und Feldrainen */
streu(WEST, 1400, (x, y) => { if (zaehl.Hecken >= 30 || !westlich(x, y) || !frei(x, y, 6, ".,")) return; const lang = 3 + Math.floor(wurf() * 5), quer = wurf() < 0.5;
  for (let i = 0; i < lang; i++) { const a = x + (quer ? 0 : i * 2.4), b = y + (quer ? i * 1.3 : 0); if (".,".includes(jetzt(a, b)) && !wegNah(a, b, 1)) ding("k_hecke", a, b, { s: +(0.85 + wurf() * 0.25).toFixed(2) }, 0.6); }
  meine.push([x, y, 4]); zaehle("Hecken"); });
/* Baumgruppen und einzelne Bäume auf der Wiese, lichter Wald auf dem Dschungelboden */
streu(WEST, 2600, (x, y) => { if (zaehl.Baumgruppen >= 70 || !westlich(x, y) || !frei(x, y, 5, ".,j")) return; const j = jetzt(x, y) === "j", n = (j ? 6 : 3) + Math.floor(wurf() * (j ? 7 : 5)), r = j ? 9 : 5;
  for (let i = 0; i < n; i++) { const a = x + (wurf() - 0.5) * 2 * r, b = y + (wurf() - 0.5) * 2 * r; if (!".,j".includes(jetzt(a, b)) || wegNah(a, b, 2) || meine.some(([p, q, s]) => s < 1.5 && Math.hypot(p - a, q - b) < 2.6)) continue;
    ding(wahl(j ? ["stil_eiche_01", "stil_eiche_02", "stil_laub_dunkel", "wald_baum1", "wald_baum3", "wald_baum5", "stil_linde_01"] : BAEUME_W), a, b, { s: +(0.85 + wurf() * 0.35).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }, 1); }
  for (let i = 0; i < 3; i++) ding(wahl(["stil_busch_01", "stil_busch_02"]), x + (wurf() - 0.5) * r * 2.4, y + (wurf() - 0.5) * r * 2.4, {}, 0.6);
  meine.push([x, y, r + 3]); zaehle("Baumgruppen"); });
streu(WEST, 3000, (x, y) => { if (zaehl.Einzelbäume >= 150 || !westlich(x, y) || !frei(x, y, 3, ".,j")) return; ding(wahl(BAEUME_W), x, y, { s: +(0.9 + wurf() * 0.3).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }, 3); zaehle("Einzelbäume"); });
streu(WEST, 3000, (x, y) => { if (zaehl.Büsche >= 160 || !westlich(x, y) || !frei(x, y, 2, ".,jv")) return; ding(wahl(["stil_busch_01", "stil_busch_02"]), x, y, {}, 2); zaehle("Büsche"); });
streu(WEST, 1500, (x, y) => { if (zaehl.Steine >= 30 || !westlich(x, y) || !frei(x, y, 4, ".,j")) return; ding(wahl(["k_fels_klein", "k_fels_klein", "k_fels_breit"]), x, y, { s: +(0.6 + wurf() * 0.4).toFixed(2) }, 3); zaehle("Steine"); });

/* ═════════════════════ OST ═════════════════════ */
{ /* ───── Sandquell: Oasenort an der Kreuzung Oase – Salzpfanne – Nordstrand ───── */
  const [sx, sy] = ORTE.sandquell; flaechen.push([sx - 40, sy - 34, sx + 42, sy + 34]); eben.push([sx - 34, sy - 26, sx + 34, sy + 26]);
  male(sx - 36, sy - 28, sx + 36, sy + 28, (x, y) => { const d = Math.hypot((x - sx) / 34, (y - sy) / 26) + 0.06 * welle(x, y); return d < 0.55 ? (welle(x, y) > 1.1 ? "," : ".") : d < 0.8 ? "y" : d < 1 ? (welle(x, y) > 0 ? "y" : null) : null; });
  male(sx - 5, sy - 4, sx + 5, sy + 4, (x, y) => { const d = Math.hypot((x - sx) / 4.2, (y - sy) / 3.2); return d < 1 ? "w" : null; });   /* die Quelle */
  male(sx - 12, sy - 10, sx + 12, sy + 10, (x, y) => { const d = Math.hypot((x - sx) / 11, (y - sy) / 9); return d >= 0.5 && d < 1 ? "p" : null; });
  for (let a = 0; a < 6.3; a += 0.7) ding(wahl(["stil_laub_oliv", "stil_laub_gold"]), sx + Math.cos(a) * 7.2, sy + Math.sin(a) * 5.6 + 0.4, { s: 0.9 }, 0.8);
  ding("moor_kahn_01", sx - 1.5, sy + 0.5, {}, 0.5);
  lies("bl_sandquell_bank_tuer", sx + 22.5, sy - 9.4, "Die Bank von Sandquell. Kühl hinter dicken Mauern – Karawanen legen hier ihr Salzgeld ein.");
  lies("bl_sandquell", sx + 1, sy + 5.6, "Sandquell. Eine Quelle mitten in den Dünen – hier tränken die Karawannen zwischen Glutbrunn, der Salzpfanne und dem Nordstrand ihre Tiere.");
  /* Häuser im Ring (Tür nach Süden) */
  for (const [dx, dy, o, id] of [[-22, -10, "graufurt_steinhaus_01"], [-12, -14, "graufurt_steinhaus_02", "bl_sandquell_herberge"], [12, -14, "graufurt_steinhaus_01"], [22.5, -10, "waldmark_bank_01", "bl_sandquell_bank"],
    [-24, 10, "moor_kate_01"], [-14, 18, "graufurt_steinhaus_01", "bl_sandquell_karawanserei"], [14, 18, "graufurt_steinhaus_02"], [25, 11, "weidenhain_kate_01"], [0, -20, "dorf_kapelle_01", "bl_sandquell_schrein"]]) ding(o, sx + dx, sy + dy, id ? { id } : {}, 6);
  for (const [dx, dy] of [[-30, -2], [-30, 4], [30, -2], [30, 4], [-6, 24], [6, 24]]) ding("welt_zelt_01", sx + dx, sy + dy, {}, 2);
  ding("dorf_marktstand_01", sx - 6, sy + 12, { id: "bl_sandquell_stand_1" }); ding("dorf_marktstand_03", sx + 6, sy + 12, { id: "bl_sandquell_stand_2" });
  ding("k_karren_hoch", sx - 18, sy + 2); ding("k_karren", sx + 18, sy + 2); ding("k_faesser", sx - 9, sy - 7); ding("k_kiste", sx + 9, sy - 7); ding("dorf_festfeuer_01", sx + 30, sy + 14, {}, 2);
  ding("k_banner_rot", sx - 3, sy - 11); ding("k_banner_rot", sx + 3, sy - 11); ding("k_stand_rot", sx - 20, sy - 4);
  /* Gärten an der Quelle */
  for (const [dx, dy] of [[-28, -20], [24, -22], [-30, 18]]) { male(sx + dx - 4, sy + dy - 3, sx + dx + 4, sy + dy + 3, () => "a"); ding("stil_laub_oliv", sx + dx + 5, sy + dy, {}, 1); }
  /* Wege: zur Oase, zur Salzpfanne, zum Nordstrand */
  weg([[7246, 6806], [7300, 6790], [7340, 6770], [sx - 12, sy + 4]], 1.8);
  weg([[7322, 6646], [7350, 6680], [7370, 6712], [sx - 2, sy - 10]], 1.8);
  weg([[sx + 4, sy - 22], [7410, 6640], [7428, 6580], [7446, 6520]], 1.6);
  npc.push({ id: "quellwaechterin_sandquell", rolle: "Quellwächterin", x: sx + 2, y: sy + 5 }, { id: "bankier_sandquell", rolle: "Bank (Schalter, Systeme)", x: sx + 22.5, y: sy - 8.6 }, { id: "wirt_sandquell", rolle: "Wirt der Herberge", x: sx - 12, y: sy - 12.6 },
    { id: "karawanenmeister_sandquell", rolle: "Karawanenmeister", x: sx - 14, y: sy + 19.6 }, { id: "haendler_sandquell", rolle: "Händler am Marktstand", x: sx - 6, y: sy + 13.4 }); }
{ /* ───── Nordstrand: ein grüner Saum am Meer mit Rastplatz ───── */
  const [bx, by] = ORTE.nordstrand; flaechen.push([bx - 12, by - 8, bx + 12, by + 10]);
  ding("dorf_festfeuer_01", bx, by + 2, {}, 2); ding("wald_baumstamm_01", bx - 3, by + 3); ding("wald_baumstamm_02", bx + 3, by + 1, { spiegeln: true }); ding("welt_zelt_01", bx + 6, by + 5, {}, 2);
  for (let i = 0; i < 9; i++) ding(wahl(["stil_laub_oliv", "stil_busch_01", "stil_laub_gold"]), bx - 30 + wurf() * 60, by - 6 + wurf() * 14, {}, 1);
  lies("bl_nordstrand", bx + 1.5, by + 3.4, "Der Nordstrand. Nach den Dünen ein Streifen grünes Gras und Meer, so weit man sieht. Die Karawanen rasten hier, bevor sie umkehren."); }

/* ───── Glutsande: Streugut ───── */
const sandig = (x, y) => !"~w".includes(jetzt(x, y)) && Math.abs(y - (strom(x) ?? -999)) > 34;
const STROM = new Map(); const strom = (x) => { const k = Math.floor(x / 8); if (!STROM.has(k)) { let s = 0, n = 0; for (let y = 6860; y < 7140; y += 2) if (grund(k * 8 + 4, y) === "~") { s += y; n++; } STROM.set(k, n ? s / n : null); } return STROM.get(k); };
/* ausgetrocknete Bachläufe: flache Senken mit Geröll, Sand und Büschen */
const BAECHE = [[[7006, 6470], [7030, 6520], [7070, 6560], [7090, 6610]], [[7470, 6560], [7440, 6600], [7420, 6650], [7428, 6700]], [[7200, 7120], [7240, 7190], [7230, 7260], [7280, 7330], [7300, 7400]],
  [[6980, 7180], [7020, 7230], [7080, 7260], [7110, 7330]], [[7420, 7200], [7380, 7270], [7400, 7350], [7360, 7430]]];
for (const b of BAECHE) { const xs = b.map((p) => p[0]), ys = b.map((p) => p[1]);
  male(Math.min(...xs) - 6, Math.min(...ys) - 6, Math.max(...xs) + 6, Math.max(...ys) + 6, (x, y) => { if (!"uy".includes(grund(x, y)) || !sandig(x, y)) return null; const d = strecke(x, y, b) + 0.5 * welle(x, y);
    if (d < 4.5) hebe(x, y, -0.7 * (1 - d / 4.5)); return d < 1.4 ? "g" : d < 3.2 ? "s" : d < 4.5 && welle(x, y) > 0.3 ? "y" : null; });
  for (let i = 1; i < b.length; i++) for (let t = 0; t < 1; t += 0.12) { const x = b[i - 1][0] + (b[i][0] - b[i - 1][0]) * t + (wurf() - 0.5) * 8, y = b[i - 1][1] + (b[i][1] - b[i - 1][1]) * t + (wurf() - 0.5) * 8;
    if (frei(x, y, 1.5, "uys")) ding(wahl(["stil_busch_02", "stil_busch_02", "stil_tot_01", "stil_erle_tot_02"]), x, y, {}, 1.5); } zaehle("Bachläufe"); }
/* Senken mit Trockengras */
streu(OST, 900, (x, y) => { if (zaehl.Senken >= 10 || !sandig(x, y) || !frei(x, y, 14, "u")) return; const r = 8 + wurf() * 8;
  male(x - r - 2, y - r - 2, x + r + 2, y + r + 2, (a, b) => { const d = Math.hypot(a - x, b - y) / r + 0.07 * welle(a, b); if (d < 1) hebe(a, b, -0.9 * (1 - d * d)); return d < 0.55 ? (welle(a, b) > 0.8 ? "g" : "y") : d < 0.85 && welle(a, b) > -0.2 ? "y" : null; });
  for (let i = 0; i < 4; i++) ding(wahl(["stil_busch_02", "stil_busch_01", "stil_laub_oliv"]), x + (wurf() - 0.5) * r, y + (wurf() - 0.5) * r, {}, 1);
  meine.push([x, y, r + 2]); zaehle("Senken"); });
/* Trockengras-Flecken */
streu(OST, 1500, (x, y) => { if (zaehl.Grasflecken >= 45 || !sandig(x, y) || !frei(x, y, 7, "u")) return; const rx = 5 + wurf() * 9, ry = 4 + wurf() * 6;
  male(x - rx - 2, y - ry - 2, x + rx + 2, y + ry + 2, (a, b) => (Math.hypot((a - x) / rx, (b - y) / ry) + 0.12 * welle(a, b) < 1 && "u".includes(grund(a, b)) ? "y" : null));
  if (wurf() < 0.7) ding("stil_busch_02", x, y, {}, 1); zaehle("Grasflecken"); });
/* Felsgruppen mit Geröll */
streu(OST, 2200, (x, y) => { if (zaehl.Felsgruppen >= 55 || !sandig(x, y) || !frei(x, y, 7, "uyg")) return; const n = 2 + Math.floor(wurf() * 4);
  male(x - 6, y - 5, x + 6, y + 5, (a, b) => (Math.hypot((a - x) / 5.5, (b - y) / 4.2) + 0.15 * welle(a, b) < 1 && "uy".includes(grund(a, b)) ? "g" : null));
  for (let i = 0; i < n; i++) ding(i === 0 && wurf() < 0.4 ? "k_fels_gross" : wahl(["k_fels_klein", "k_fels_breit", "k_fels_klein"]), x + (wurf() - 0.5) * 6, y + (wurf() - 0.5) * 4, { s: +(0.7 + wurf() * 0.5).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }, 1.5);
  meine.push([x, y, 7]); zaehle("Felsgruppen"); });
/* Ruinenreste */
const RUINE = ["k_ruine_mauer", "k_ruine_halbmauer", "k_ruine_saeule", "k_truemmer", "k_ruine_turmstumpf", "k_ruine_saeule_ganz"];
streu(OST, 1500, (x, y) => { if (zaehl.Ruinen >= 9 || !sandig(x, y) || !frei(x, y, 10, "uy")) return;
  male(x - 6, y - 5, x + 6, y + 5, (a, b) => (Math.hypot((a - x) / 6, (b - y) / 4.5) < 1 && welle(a, b) > -0.4 ? "g" : null));
  for (let i = 0; i < 3 + Math.floor(wurf() * 3); i++) ding(wahl(RUINE), x + (wurf() - 0.5) * 9, y + (wurf() - 0.5) * 6, {}, 1.5);
  meine.push([x, y, 10]); zaehle("Ruinen"); });
/* tote Bäume, Trockenbüsche, einzelne Ölbäume */
streu(OST, 4000, (x, y) => { if (zaehl["Tote Bäume"] >= 70 || !sandig(x, y) || !frei(x, y, 3, "uyg")) return; ding(wahl(["stil_tot_01", "stil_erle_tot_01", "stil_erle_tot_02"]), x, y, { s: +(0.8 + wurf() * 0.3).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }, 3); zaehle("Tote Bäume"); });
streu(OST, 6000, (x, y) => { if (zaehl.Trockenbüsche >= 260 || !sandig(x, y) || !frei(x, y, 2, "uyg")) return; ding(wurf() < 0.8 ? "stil_busch_02" : "stil_busch_01", x, y, {}, 2); zaehle("Trockenbüsche"); });
streu(OST, 3000, (x, y) => { if (zaehl.Ölbäume >= 40 || !sandig(x, y) || !frei(x, y, 3, "y")) return; ding("stil_laub_oliv", x, y, { s: +(0.8 + wurf() * 0.3).toFixed(2) }, 3); zaehle("Ölbäume"); });

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)); const patches = [];
for (const box of [WEST, OST]) { const ks = keys.filter(([x, y]) => x >= box[0] - 80 && x < box[2] + 80 && y >= box[1] - 80 && y < box[3] + 80); if (!ks.length) continue;
  const X0 = Math.min(...ks.map((k) => k[0])), X1 = Math.max(...ks.map((k) => k[0])), Y0 = Math.min(...ks.map((k) => k[1])), Y1 = Math.max(...ks.map((k) => k[1]));
  for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let z = ""; for (let x = X0; x <= X1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z.replace(/ +$/, "")); } if (zeilen.some((z) => z.trim())) patches.push({ x0: X0, y0: ya, zeilen }); } }
const hoehenListe = [...hoehen].map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_beleben.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/beleben.mjs (#140): Haferstedt, Netzbucht, Sandquell, Nordstrand und Streugut. Weltfelder.", gelaende: patches, hoehen: hoehenListe, eben, objekte, interaktionen, sperren, freigeben: [] }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "beleben.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
writeFileSync(join(WELT, "beleben_orte.json"), JSON.stringify({ hinweis: "Welt beleben (#140): neue Orte (Weltfelder), Ortsnamen für grenzland.mjs, NPC-Plätze als Vorschlag (Figuren/Quests verteilt die Leitstelle).",
  orte: ORTE, namen: [["Haferstedt", "Dorf", ...ORTE.haferstedt], ["Netzbucht", "Ort", ...ORTE.netzbucht], ["Sandquell", "Dorf", ...ORTE.sandquell], ["Nordstrand", "Ort", ...ORTE.nordstrand]], npc, wege, zaehlung: zaehl }, null, 1) + "\n");
console.log(`Beleben: ${objekte.length} Objekte, ${feld.size} Felder, ${hoehenListe.length} Höhen –`, JSON.stringify(zaehl));
