/*
 * World Pipeline – PROBE „Waldmark kompakt“: die Waldmark als kompaktes, ummauertes Startdorf mit Kenney-Bausteinen (CC0).
 * Entwurfsregion (region.entwurf = true): wird nur gebaut, wenn man sie ausdrücklich nennt, und liegt abseits der echten Welt (Chunk 150|150).
 * Ansehen: echtzeit/?welt=waldmark_kompakt&server=
 *
 *   Ringmauer, Ecktürme, Torhaus und Tortürme: Kenney Castle Kit (werkzeug/welt/kenney.py, mit unseren Materialien gemalt)
 *   Marktstände, Karren, Laternen, Banner, Hecken, Zäune, Felsen: Kenney Town Kit; Fässer, Kisten, Flaschenzug: Kenney Retro Fantasy Kit
 *   Heldenhalle, Taverne, Schmiede, Wohnhäuser, Brunnen: unser eigener Baukasten (Türen, Innenräume, aufklappende Dächer)
 *
 * Aufruf (im Ordner realtime): node werkzeug/welt/waldmark_kompakt.mjs      danach: node werkzeug/welt/bauen.mjs waldmark_kompakt
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const B = 64, H = 64;
const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];   /* Bäume im Spielstil (werkzeug/welt/baum.py) statt der alten Waldbäume */
let saat = 5; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));

/* ───── Mauerring ───── */
const X0 = 10, X1 = 54, Y0 = 10, Y1 = 52, TOR = 32;
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|weidenhain|wald|burg|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const dinge = [];
for (let x = X0 + 2; x < X1 - 2; x += 2) { dinge.push(o("burg_mauer_quer", x + 1, Y0 + 2)); if (x + 2 <= TOR - 4 || x >= TOR + 4) dinge.push(o("burg_mauer_quer", x + 1, Y1)); }
for (let y = Y0 + 2.3; y < Y1 - 2.3; y += 2) { dinge.push(o("burg_mauer_laengs", X0 + 1, Math.min(y + 2, Y1 - 2.3))); dinge.push(o("burg_mauer_laengs", X1 - 1, Math.min(y + 2, Y1 - 2.3))); }
for (const [x, y] of [[X0 + 1, Y0 + 2.3], [X1 - 1, Y0 + 2.3], [X0 + 1, Y1 + 0.3], [X1 - 1, Y1 + 0.3], [TOR - 2.7, Y1 + 0.3], [TOR + 2.7, Y1 + 0.3]]) dinge.push(o("burg_eckturm", x, y));
dinge.push(o("burg_torhaus", TOR, Y1));
const TORPFEILER = [{ art: "rechteck", x0: TOR - 1.5, y0: Y1 - 1.6, x1: TOR - 0.7, y1: Y1 }, { art: "rechteck", x0: TOR + 0.7, y0: Y1 - 1.6, x1: TOR + 1.5, y1: Y1 }];

/* ───── Dorf in der Mauer ───── */
const PLATZ = { x: 32, y: 33, rx: 10, ry: 7 };
const HALLE = [32, 22.5], TAVERNE = [19.5, 31], SCHMIEDE = [45.5, 31];
dinge.push(
  o("dorf_heldenhalle_01", ...HALLE), o("dorf_taverne_01", ...TAVERNE), o("dorf_schmiede_01", ...SCHMIEDE), o("dorf_brunnen_01", PLATZ.x, PLATZ.y + 0.5),
  o("weidenhain_kate_01", 16.5, 21), o("dorf_huette_holz_01", 23.5, 19.5), o("weidenhain_fachwerk_02", 47, 21.5), o("dorf_haus_holz_03", 17, 46.5), o("weidenhain_fachwerk_03", 46.5, 46.5),
  o("k_stand_rot", 26, 40), o("k_stand_gruen", 38, 40), o("k_karren", 22.6, 37.6), o("k_karren_hoch", 42, 37.4),
  ...[[25.5, 27.6], [38.5, 27.6], [25.5, 38.4], [38.5, 38.4], [30.2, 48.6], [33.8, 48.6]].map(([x, y]) => o("k_laterne", x, y)),
  o("k_banner_rot", 28.2, 23.0), o("k_banner_gruen", 35.8, 23.0),
  o("k_faesser", 25.0, 31.6), o("k_kiste", 26.0, 31.2), o("k_flaschenzug", 41.4, 31.4), o("k_kiste", 50.4, 47.2), o("k_faesser", 13.8, 47.4),
  o("k_hecke", 22.4, 48.6), o("k_hecke", 41.6, 48.6), o("k_zaun", 13.6, 22.2), o("k_zaun", 50.4, 22.8),
  /* vor der Mauer */
  o("k_fels_gross", 5.5, 30), o("k_fels_klein", 59, 18), o("k_fels_breit", 58, 44), o("k_fels_klein", 6, 58.5), o("k_fels_gross", 50, 61) );

/* ───── Gelände ───── */
const GASSEN = [[[TOR, 39], [TOR, H + 1]], [[22.5, 33], [19.5, 31.6]], [[42, 33], [47.1, 31.6]], [[HALLE[0], 26], [HALLE[0], 23]], [[24, 36], [17.8, 47]], [[40, 36], [45, 47.2]], [[24, 28], [16.5, 21.6]], [[40, 28], [47, 22.1]]];
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5; let c = "f";
  const innen = cx > X0 && cx < X1 && cy > Y0 && cy < Y1, rand = 5 + 1.6 * Math.sin(cx / 3.1 + cy / 4.7) + Math.sin(cy / 2.3 - cx / 3.9), vorfeld = cx > X0 - rand && cx < X1 + rand && cy > Y0 - rand && cy < Y1 + rand;
  if (Math.hypot((cx - PLATZ.x) / PLATZ.rx, (cy - PLATZ.y) / PLATZ.ry) < 1 + 0.06 * Math.sin(cx * 1.3 + cy)) c = "p";
  else if (GASSEN.some((p) => strecke(cx, cy, p) < (p[0][0] === TOR ? 1.6 : 1.0))) c = "e";
  else if (innen) c = Math.sin(cx / 2.7) * Math.cos(cy / 3.3) > 0.6 ? "," : ".";
  else if (vorfeld) c = ".";
  z.push(c); } g.push(z); }

/* ───── Wald ringsum ───── */
const wald = [], frei = (x, y) => wald.every((p) => Math.hypot(p.x - x, p.y - y) >= 2.3);
for (let i = 0; i < B * H * 0.95; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2);
  if (g[Math.floor(y)][Math.floor(x)] !== "f" || strecke(x, y, GASSEN[0]) < 4 || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 4) || !frei(x, y)) continue;
  const z = wurf(), a = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6;
  wald.push({ id: "b" + String(wald.length + 1).padStart(4, "0"), objekt: BAUM[a], x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
const objekte = [...dinge, ...wald].sort((a, b) => a.y - b.y);
for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);

/* ───── Spiel ───── */
const tuer = (id, x, y) => { const i = BIB.get(id).interaktion; return [+(x + i.dx).toFixed(2), +(y + i.dy).toFixed(2)]; };
const lies = (id, [x, y], text, tat, knopf) => ({ id, art: tat && tat !== "bald" ? "eingang" : "lesen", x, y, radius: 1.5, abgleich: "keiner", daten: { text, ...(tat ? { tat, knopf } : {}) } });
const spiel = {
  start: [[TOR, 46.5], [TOR - 1, 46], [TOR + 1, 46]],
  figuren: [{ id: "wache_west", rolle: "wache", figur: "wache", x: TOR - 2.2, y: Y1 + 1.6 }, { id: "wache_ost", rolle: "wache", figur: "wache", x: TOR + 2.2, y: Y1 + 1.6, links: true },
    { id: "kraemer", rolle: "haendler", figur: "kraemer", x: 26, y: 42.2 }, { id: "junge", rolle: "npc", figur: "junge", x: 35.2, y: 36.2 }, { id: "ausrufer", rolle: "npc", figur: "ausrufer", x: 29, y: 29, links: true }],
  spawnzonen: [],
  interaktionen: [lies("halle_tuer", tuer("dorf_heldenhalle_01", ...HALLE), "Die Heldenhalle. Hier sammeln sich die Wanderer, bevor sie aufbrechen.", "halle", "Die Heldenhalle betreten"),
    lies("taverne_tuer", tuer("dorf_taverne_01", ...TAVERNE), "Die Taverne. Drinnen riecht es nach Eintopf und Rauch.", "bald", "Taverne – kommt noch"),
    lies("schmiede_tuer", tuer("dorf_schmiede_01", ...SCHMIEDE), "Die Schmiede. In der Esse glüht es Tag und Nacht."),
    lies("brunnen_ansehen", [PLATZ.x, PLATZ.y + 1.8], "Der Brunnen der Waldmark, mitten im Ring der Mauern.")],
  ausgaenge: [], kollision: { sperren: TORPFEILER, freigeben: [] } };

const dir = join(WELT, "regionen", "waldmark_kompakt"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "waldmark_kompakt", name: "Waldmark", untertitel: "Probe: kompaktes Startdorf", ursprung: [150, 150], chunks: [2, 2], biom: "dorf", stufe: 1, entwurf: true }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`waldmark_kompakt: ${B} × ${H} Felder, ${objekte.length} Objekte (${dinge.length} im Dorf und an der Mauer), ${spiel.figuren.length} Figuren`);
