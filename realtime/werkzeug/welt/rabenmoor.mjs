/*
 * World Pipeline – Rabenmoor: Torfstecherdorf auf einer Sandinsel im Schwarzmoor, westlich von Weidenhain (nach dem gemalten Dorf der Kampagne,
 * im neuen Spielstil). Aus Weidenhain führt die westliche Gasse durch den Wald hinaus; am Moorrand beginnt ein Bohlenweg übers Wasser zur Insel.
 *   Insel: gepflasterter Platz mit Brunnen und Feuerkörben, Langhaus des Schulzen (Bertold), Moorhütten, Torfstecherhütte, Marktstand,
 *          im Süden die Fischerhütte mit Steg und Kahn (Joost). Nordwestlich auf der letzten trockenen Insel Heddas Hütte, über einen Torfpfad.
 *   Moor: Moorwasser mit Entengrütze, Torfinseln, tote Erlen, Birken, Schilf, stille Irrlichter.
 *
 * Lage: 4 × 3 Chunks ab Chunk 196|208 (gleich große Chunks im gemeinsamen Raster; Ostrand = Westrand von Weidenhain). Der Server kennt „rabenmoor“.
 * Aufruf (im Ordner realtime): node werkzeug/welt/rabenmoor.mjs      danach: node werkzeug/welt/bauen.mjs rabenmoor
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const B = 128, H = 96;
const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];
let saat = 31; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const PLAN = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "bauplaene.json"), "utf8")).bauplaene.map((p) => [p.id, p]));
const welle = (x, y) => 1 + 0.08 * Math.sin(x / 3.1 + y / 4.3) + 0.06 * Math.sin(y / 2.3 - x / 5.1) + 0.04 * Math.sin(x / 1.7);

/* ───── Plan (Felder; x nach Osten, y nach Süden) ───── */
const WALDRAND = (y) => 98 + 4 * Math.sin(y / 9) + 2 * Math.sin(y / 3.7);           /* östlich davon Wald, westlich Moor */
const INSEL = { x: 50, y: 46, rx: 28, ry: 22 }, inInsel = (x, y, k = 1) => Math.hypot((x - INSEL.x) / INSEL.rx, (y - INSEL.y) / INSEL.ry) < k * welle(x, y);
const HEDDA = { x: 15, y: 18, r: 7 }, inHedda = (x, y) => Math.hypot(x - HEDDA.x, (y - HEDDA.y) * 1.2) < HEDDA.r * welle(x * 2, y);
const PLATZ = { x: 50, y: 47, rx: 9, ry: 6.5 }, aufPlatz = (x, y) => Math.hypot((x - PLATZ.x) / PLATZ.rx, (y - PLATZ.y) / PLATZ.ry) < welle(x * 1.7, y * 1.3);
const WEG = [[B + 1, 40], [118, 40.6], [108, 41.6], [100, 42.4]];                     /* aus Weidenhain (dort die westliche Gasse bei y ≈ 40) */
const BOHLEN = [95, 89, 83, 77].map((x) => ({ objekt: "dorf_bruecke_01", x, y: 43.6, frei: [x - 3, 41.0, x + 3, 43.6] }));   /* Bohlenweg übers Moor */
const STEG = { objekt: "dorf_bruecke_02", x: 56, y: 73.6, frei: [54.7, 68.4, 57.3, 73.6] };
const TORFPFAD = [[31, 33], [26, 28.5], [21, 24.5], [18.5, 22]];
const SCHREIN = { x: 86, y: 18, r: 8 }, inSchrein = (x, y) => Math.hypot(x - SCHREIN.x, (y - SCHREIN.y) * 1.15) < SCHREIN.r * welle(x * 1.3, y);   /* abgelegen, ohne Weg: der versunkene Schrein */
const torfInseln = [ [70, 80, 5], [100, 72, 4], [28, 74, 5.5], [80, 12, 3.5], [10, 50, 4], [40, 88, 4], [112, 86, 4]];
const aufTorf = (x, y) => torfInseln.some(([a, b, r]) => Math.hypot(x - a, (y - b) * 1.2) < r * welle(x, y * 2));

/* ───── Häuser (Fuß = Mitte der Südwand, Tür nach Süden) ───── */
const HAEUSER = [["moor_langhaus_01", 50, 36.4], ["moor_kate_01", 36.5, 42.5], ["moor_kate_02", 64.5, 43.5], ["moor_kate_01", 38.5, 57.5], ["moor_kate_02", 62.5, 58], ["moor_fischer_01", 51, 64.5], ["moor_kate_02", HEDDA.x, HEDDA.y + 2]];
const tuer = (id, x, y) => { const t = PLAN.get(id).tueren[0]; return [x + t.x, y + 0.6]; };
const GASSEN = HAEUSER.slice(0, 6).map(([id, x, y]) => { const [tx, ty] = tuer(id, x, y); return [[tx, ty], [PLATZ.x + (tx - PLATZ.x) * 0.35, PLATZ.y + (ty - PLATZ.y) * 0.35]]; });
GASSEN.push([[76, 42.3], [58, 45.5]], [[51.9, 65.1], [55.6, 68.6]], [[38, 37], [31, 33]]);

/* ───── Gelände ───── */
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5; let c = "o";
  const wald = cx > WALDRAND(cy);
  if (strecke(cx, cy, WEG) < 1.3) c = "e";
  else if (!wald && cx > WALDRAND(cy) - 6 && Math.sin(cy / 3 + cx / 5) > 0.2) c = "m";   /* schlammiger Moorrand */
  else if (wald) c = cx < WALDRAND(cy) + 3 ? "t" : "f";
  else if (aufPlatz(cx, cy)) c = "p";
  else if (inInsel(cx, cy) || inHedda(cx, cy)) c = GASSEN.some((p) => strecke(cx, cy, p) < 1.0) ? "e" : (inInsel(cx, cy, 0.9) || inHedda(cx, cy)) ? (Math.sin(cx / 3.3) * Math.cos(cy / 2.7) > 0.32 ? "t" : Math.sin(cx / 2.1 + 1) * Math.cos(cy / 1.9) > 0.78 ? "m" : "v") : "s";
  else if (inSchrein(cx, cy)) c = Math.hypot(cx - SCHREIN.x, cy - SCHREIN.y) < 3.2 ? "m" : "t";
  else if (strecke(cx, cy, TORFPFAD) < 1.2) c = "m";
  else if (strecke(cx, cy, TORFPFAD) < 2.6 || aufTorf(cx, cy)) c = "t";
  z.push(c); } g.push(z); }

/* ───── Dinge ───── */
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|moor|wald|stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
const dinge = [
  ...HAEUSER.map(([id, x, y]) => o(id, x, y)), ...BOHLEN.map((b) => o(b.objekt, b.x, b.y)), o(STEG.objekt, STEG.x, STEG.y), o("moor_kahn_01", 59.6, 72.2),
  o("dorf_brunnen_01", PLATZ.x, PLATZ.y + 0.6), o("dorf_marktstand_02", 57.6, 49.4), o("k_banner_rot", 45.4, 41.4),
  ...[[42.5, 43], [57.5, 43], [42.5, 52], [57.5, 52.6], [77, 41.2], [53.2, 67.8]].map(([x, y]) => o("moor_feuerkorb_01", x, y)),
  o("dorf_fass_01", 33.6, 43.3), o("dorf_fass_01", 34.2, 43.9), o("dorf_holzstapel_01", 67.6, 44.2), o("dorf_kiste_01", 48.4, 65.4), o("dorf_heuballen_01", 41.4, 58.3), o("dorf_bank_01", 46, 51.6),
  ...Array.from({ length: 7 }, (_, i) => { const w = i / 7 * 2 * Math.PI; return o(i % 3 === 1 ? "moor_menhir_02" : "moor_menhir_01", SCHREIN.x + Math.cos(w) * 4.6, SCHREIN.y + Math.sin(w) * 3.6, i % 2 ? { spiegeln: true } : {}); }),
  o("moor_schrein_01", SCHREIN.x, SCHREIN.y + 0.6), o("stil_erle_tot_01", SCHREIN.x + 6, SCHREIN.y - 3), o("stil_erle_tot_02", SCHREIN.x - 6.5, SCHREIN.y + 2, { spiegeln: true }),
  ...[[33, 39.6], [36, 39.6], [62, 40.6], [65, 40.6], [35.5, 54.6], [41.5, 54.6], [59.5, 55.2], [65.5, 55.2], [46, 61.6], [12, 22.8], [18, 22.8]].map(([x, y]) => o("dorf_zaun_01", x, y)),
  o("stil_erle_tot_01", 28, 38), o("stil_erle_tot_02", 72, 47), o("stil_erle_tot_01", 44, 26, { spiegeln: true }), o("stil_erle_tot_02", 58, 27),
  o("stil_birke_01", 30, 50), o("stil_birke_01", 70, 52, { s: 0.9 }), o("stil_birke_01", 23, 15, { s: 0.85 }), o("stil_erle_tot_01", 66, 32), o("stil_erle_tot_02", 34, 64) ];
/* Moor: tote Erlen und Birken auf den Torfinseln, Schilf an den Ufern, Irrlichter über dem Wasser */
for (const [a, b, r] of torfInseln) { dinge.push(o(wurf() < 0.6 ? "stil_erle_tot_01" : "stil_erle_tot_02", a + (wurf() - 0.5) * r, b + (wurf() - 0.3) * r * 0.6, { s: +(0.85 + wurf() * 0.3).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }));
  if (r > 4.2) dinge.push(o("stil_birke_01", a + r * 0.4, b + 1, { s: 0.85 })); }
const amUfer = (x, y) => { const c = g[Math.floor(y)]?.[Math.floor(x)]; if (c !== "o") return false; for (const [dx, dy] of [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]]) { const d = g[Math.floor(y + dy)]?.[Math.floor(x + dx)]; if (d && d !== "o") return true; } return false; };
const belegt = (x, y, ab) => dinge.some((d) => Math.hypot(d.x - x, d.y - y) < ab) || BOHLEN.some((b) => x > b.frei[0] - 1 && x < b.frei[2] + 1 && y > b.frei[1] - 2 && y < b.frei[3] + 1) || (x > STEG.frei[0] - 2 && x < STEG.frei[2] + 4 && y > STEG.frei[1] - 1 && y < STEG.frei[3] + 2);
for (let i = 0; i < 4000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 120; i++) { const x = +(wurf() * (WALDRAND(40) - 4)).toFixed(2), y = +(wurf() * H).toFixed(2);
  if (amUfer(x, y) && !belegt(x, y, 2.2)) dinge.push(o(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y, wurf() < 0.5 ? { spiegeln: true } : {})); }
for (let i = 0; i < 3000 && dinge.filter((d) => d.objekt === "stil_moorlicht_01").length < 26; i++) { const x = +(wurf() * 92).toFixed(2), y = +(wurf() * H).toFixed(2);
  if (g[Math.floor(y)][Math.floor(x)] === "o" && !amUfer(x, y) && !belegt(x, y, 6)) dinge.push(o("stil_moorlicht_01", x, y)); }
for (let i = 0; i < 2000 && dinge.filter((d) => d.objekt === "moor_nebel_01").length < 18; i++) { const x = +(8 + wurf() * 84).toFixed(2), y = +(6 + wurf() * (H - 10)).toFixed(2);
  if (g[Math.floor(y)][Math.floor(x)] === "o" && !dinge.some((d) => d.objekt === "moor_nebel_01" && Math.hypot(d.x - x, d.y - y) < 14)) dinge.push(o("moor_nebel_01", x, y, { s: +(0.9 + wurf() * 0.6).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
/* Wald im Osten */
const wald = [], frei = (x, y) => wald.every((p) => Math.hypot(p.x - x, p.y - y) >= 2.3);
for (let i = 0; i < B * H * 0.6; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2);
  if (x < WALDRAND(y) + 2.5 || strecke(x, y, WEG) < 4 || !frei(x, y)) continue;
  const z = wurf(), a = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6;
  wald.push({ id: "b" + String(wald.length + 1).padStart(4, "0"), objekt: BAUM[a], x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
const objekte = [...dinge, ...wald].sort((a, b) => a.y - b.y);
for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);

/* ───── Leute, Lesestellen ───── */
const lies = (id, [x, y], text) => ({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.6, abgleich: "keiner", daten: { text } });
const spiel = {
  start: [[124, 40.5], [124, 39.5], [124, 41.5]],
  figuren: [{ id: "bertold", rolle: "npc", figur: "bertold", x: 48, y: 41 }, { id: "ilse", rolle: "npc", figur: "ilse", x: 55.6, y: 52.4, links: true }, { id: "jorin", rolle: "npc", figur: "jorin", x: 44.6, y: 48.6 },
    { id: "harm", rolle: "npc", figur: "harm", x: 40.5, y: 45.6 }, { id: "joost", rolle: "npc", figur: "joost", x: 56, y: 70.4 }, { id: "hedda", rolle: "npc", figur: "hedda", x: HEDDA.x + 2.4, y: HEDDA.y + 3.4, links: true }],
  spawnzonen: [],
  interaktionen: [lies("brunnen_ansehen", [PLATZ.x, PLATZ.y + 2], "Der Brunnen von Rabenmoor. Das Wasser schmeckt nach Torf, aber es ist sauber."),
    lies("langhaus_tuer", tuer("moor_langhaus_01", 50, 36.4), "Das Langhaus des Schulzen. Über der Tür hängt ein Hirschschädel, im Herd glimmt Torf."),
    lies("bohlenweg", [97, 42.2], "Der Bohlenweg nach Rabenmoor. Die Bretter sind nass, und unter ihnen ist das Wasser schwarz."),
    lies("steg_ansehen", [56, 69.2], "Joosts Steg. Der Kahn liegt bereit; weiter draußen beginnt das Ried."),
    lies("schrein_ansehen", [SCHREIN.x, SCHREIN.y + 1.6], "Spiralsteine im Kreis, mitten im Moor. Auf dem Altar steht eine Schale mit stillem, hellem Wasser."),
    lies("hedda_tuer", tuer("moor_kate_02", HEDDA.x, HEDDA.y + 2), "Heddas Hütte auf der letzten trockenen Insel. Getrocknete Kräuter hängen unter dem Vordach.")],
  ausgaenge: [], kollision: { sperren: [], freigeben: [...BOHLEN, STEG].map((b) => ({ art: "rechteck", x0: b.frei[0], y0: b.frei[1], x1: b.frei[2], y1: b.frei[3] })) } };

const dir = join(WELT, "regionen", "rabenmoor"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "rabenmoor", name: "Rabenmoor", untertitel: "Das Dorf im Schwarzmoor", ursprung: [196, 208], chunks: [B / 32, H / 32], biom: "sumpf", stufe: 1 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`rabenmoor: ${B} × ${H} Felder, ${objekte.length} Objekte (${dinge.length} im Moor und im Dorf), ${spiel.figuren.length} Figuren`);
