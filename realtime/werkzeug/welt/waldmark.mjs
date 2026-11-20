/*
 * World Pipeline – legt die Waldmark als Dorf auf einer Waldlichtung an und südlich davon den Waldweg (Entwurf).
 * Aufruf (im Ordner realtime): node werkzeug/welt/waldmark.mjs      danach: node werkzeug/welt/bauen.mjs waldmark waldweg
 * Schreibt welt/regionen/waldmark/ und welt/regionen/waldweg/. Beide grenzen im Weltgitter aneinander:
 * Durch das offene Tor im Süden läuft man ohne Wechsel auf den Waldweg.
 * Die Gebäude stammen aus werkzeug/welt/haus.py. Alles hier ist ein erster Entwurf zum Ansehen und Nachbessern (später im Editor).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
let saat = 21; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const schreibe = (name, region, g, objekte, spiel) => { const o = join(WELT, "regionen", name); mkdirSync(o, { recursive: true });
  writeFileSync(join(o, "region.json"), JSON.stringify(region, null, 1) + "\n"); writeFileSync(join(o, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(o, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(o, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${name}: ${g[0].length} × ${g.length} Felder, ${objekte.length} Objekte, ${spiel.figuren.length} Figuren`); };
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
/** Bäume streuen: dicht, wo `wald` wahr ist, mit Mindestabstand; nie, wo `tabu` wahr ist */
function baeume(B, H, wald, tabu, dichte, licht = 0) { const aus = [], gitter = new Map(), zelle = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
  const frei = (x, y, ab) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) for (const p of gitter.get(zelle(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < ab) return false; return true; };
  for (let n = 0; n < B * H * dichte; n++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2), w = wald(x, y); if (tabu(x, y) || (!w && wurf() > licht) || !frei(x, y, w ? 2.3 : 6)) continue;
    const z = wurf(), art = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6, p = { id: "b" + String(aus.length + 1).padStart(4, "0"), objekt: "wald_baum" + art, x, y, s: +(0.85 + wurf() * 0.27).toFixed(2) };
    if (wurf() < 0.5) p.spiegeln = true; aus.push(p); const k = zelle(x, y); gitter.set(k, [...(gitter.get(k) || []), p]); }
  return aus; }

/* ───────────── Waldmark: 3 × 2 Chunks ───────────── */
{ const B = 96, H = 64, MX = 48, MY = 31, ZAUN = 56, TOR = 48;
  const lichtung = (x, y) => Math.pow(Math.abs(x - MX) / (33 + 2 * Math.sin(y / 5)), 4) + Math.pow(Math.abs(y - MY) / (24.5 + 1.5 * Math.sin(x / 7)), 4) < 1 && y < ZAUN;
  const wege = [[[TOR, 38], [TOR, 64]], [[42, 32], [33, 31], [26, 32]], [[54, 32], [63, 31], [70, 32]], [[48, 26], [48, 21]], [[40, 36], [37, 44]], [[55, 36], [60, 46]]];
  const teich = (x, y) => Math.hypot((x - 71) / 4.6, (y - 46) / 3.2) < 1;
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5;
    const platz = Math.hypot(cx - MX, cy - 32) < 6.6, weg = wege.some((p) => strecke(cx, cy, p) < 1.5), blume = Math.sin(x / 4.1) * Math.cos(y / 3.3) + Math.sin((x + y) / 6) > 1.25;
    /* vor der Palisade ein Streifen Wiese: Dort stehen keine Bäume, damit Tor und Zaun zu sehen sind */
    const vorfeld = cy >= ZAUN && cx > 13 + 2 * Math.sin(cy) && cx < 83 + 2 * Math.cos(cy);
    z.push(platz ? "p" : weg ? "e" : vorfeld ? "." : !lichtung(cx, cy) ? "f" : teich(cx, cy) ? "w" : blume ? "," : "."); } g.push(z); }
  /* Gebäude: Fußpunkt (Mitte der Vorderwand unten) */
  const bauten = [["heldenhalle", "dorf_heldenhalle_01", 48, 20.4], ["taverne", "dorf_taverne_01", 28, 30.2], ["schmiede", "dorf_schmiede_01", 68.5, 30.2],
    ["haus_nw", "dorf_haus_holz_01", 33, 17.5], ["haus_no", "dorf_haus_holz_02", 64, 17.5], ["huette_sw", "dorf_huette_holz_01", 25, 44], ["haus_s", "dorf_haus_holz_01", 36.5, 50, true],
    ["scheune", "dorf_scheune_holz_01", 78, 39], ["schuppen", "dorf_schuppen_holz_01", 62, 50.5], ["huette_o", "dorf_huette_holz_01", 76.5, 23, true],
    ["stand_1", "dorf_marktstand_01", 39.2, 38.6], ["stand_2", "dorf_marktstand_02", 43.6, 41.6], ["stand_3", "dorf_marktstand_03", 56, 40.4], ["brunnen", "dorf_brunnen_01", 48, 32.8]];
  const objekte = bauten.map(([id, objekt, x, y, sp]) => ({ id, objekt, x, y, ...(sp ? { spiegeln: true } : {}) }));
  for (let x = 17; x <= 79; x += 2) if (Math.abs(x - TOR) > 4) objekte.push({ id: "zaun_" + x, objekt: wurf() < 0.5 ? "dorf_palisade_01" : "dorf_palisade_02", x, y: ZAUN + 1 });
  objekte.push({ id: "tor", objekt: "dorf_tor_01", x: TOR, y: ZAUN + 1.05 });
  const nahBau = (x, y) => bauten.some(([, , bx, by]) => Math.abs(x - bx) < 6.5 && y > by - 7 && y < by + 3.5);
  const amWeg = (x, y) => wege.some((p) => strecke(x, y, p) < 3.2) || Math.hypot(x - MX, y - 32) < 9.5;
  const wald = (x, y) => !lichtung(x, y) && !(y >= ZAUN - 1 && y < ZAUN + 2.2 && x > 15 && x < 81);
  /* im Dorf nur am Rand der Lichtung einzelne Bäume; vor der Palisade keine */
  const mitte = (x, y) => Math.pow(Math.abs(x - MX) / 33, 4) + Math.pow(Math.abs(y - MY) / 24.5, 4) < 0.62;
  objekte.push(...baeume(B, H, wald, (x, y) => amWeg(x, y) || (lichtung(x, y) && (mitte(x, y) || nahBau(x, y) || Math.hypot((x - 71) / 6.5, (y - 46) / 5) < 1)) || (y > ZAUN - 6 && x > 11 && x < 85), 0.95, 0.05));
  objekte.sort((a, b) => a.y - b.y);
  const lies = (id, x, y, text, objekt) => ({ id, art: "lesen", x, y, radius: 1.5, ...(objekt ? { objekt } : {}), abgleich: "keiner", daten: { text } });
  const spiel = { start: [[48, 37.5], [46.8, 38.5], [49.2, 38.5]],
    figuren: [{ id: "wache_west", rolle: "wache", figur: "wache", x: 45.2, y: 58.6 }, { id: "wache_ost", rolle: "wache", figur: "wache", x: 50.8, y: 58.6, links: true }, { id: "schmied", rolle: "haendler", figur: "schmied", x: 61.5, y: 31.4 },
      { id: "kraemer", rolle: "haendler", figur: "kraemer", x: 39.2, y: 39.9 }, { id: "kraeuterfrau", rolle: "haendler", figur: "kraeuterfrau", x: 43.6, y: 42.9 }, { id: "ausrufer", rolle: "npc", figur: "ausrufer", x: 52.6, y: 35.2, links: true },
      { id: "junge", rolle: "npc", figur: "junge", x: 44.2, y: 29.4 }, { id: "wanderer", rolle: "npc", figur: "wanderer", x: 33.2, y: 31.4 }],
    spawnzonen: [],
    interaktionen: [lies("brunnen_ansehen", 48, 34.6, "Der Brunnen der Waldmark. Das Wasser kommt kalt und klar aus dem Waldboden.", "brunnen"),
      lies("halle_tuer", 48, 21.2, "Die Heldenhalle. Hier sammeln sich die Wanderer, bevor sie aufbrechen.", "heldenhalle"), lies("taverne_tuer", 28, 31, "Die Taverne. Drinnen riecht es nach Eintopf und Rauch.", "taverne"),
      lies("schmiede_tuer", 71.6, 31, "Die Schmiede. In der Esse glüht es Tag und Nacht.", "schmiede"), lies("markt", 41.4, 40.6, "Der Markt der Waldmark: Kräuter, Brot und allerlei Nützliches."),
      lies("tor_ansehen", 48, 55, "Das Südtor steht offen. Dahinter beginnt der Waldweg nach Weidenhain.", "tor")],
    ausgaenge: [],
    /* Torpfosten versperren, die Durchfahrt bleibt frei */
    kollision: { sperren: [{ art: "rechteck", x0: 44, y0: 56, x1: 45.6, y1: 57 }, { art: "rechteck", x0: 50.4, y0: 56, x1: 52, y1: 57 }], freigeben: [{ art: "rechteck", x0: 45.6, y0: 55, x1: 50.4, y1: 58 }] } };
  schreibe("waldmark", { id: "waldmark", name: "Waldmark", ursprung: [200, 200], chunks: [3, 2], biom: "dorf", stufe: 1, entwurf: true, gesperrt: [[14, 6, 82, 58]] }, g, objekte, spiel); }

/* ───────────── Waldweg: 3 × 2 Chunks, direkt südlich ───────────── */
{ const B = 96, H = 64, wegX = (y) => 48 + 9 * Math.sin(y / 11) + 3 * Math.sin(y / 4.7) * Math.min(1, y / 8);
  const lichtungen = [[30, 30, 9, 6.5], [66, 47, 8, 6]], inL = (x, y, k = 1) => lichtungen.some(([lx, ly, rx, ry]) => Math.hypot((x - lx) / (rx * k), (y - ly) / (ry * k)) < 1);
  const teich = (x, y) => Math.hypot((x - 70) / 3.6, (y - 45) / 2.6) < 1, abzweig = [[wegX(30), 30], [37, 30.5]], abzweig2 = [[wegX(46), 46], [59, 47]];
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, d = Math.abs(cx - wegX(cy));
    if (cy < 3.5 + Math.sin(cx / 3) && cx > 13 && cx < 83 && d >= 1.6) { z.push("."); continue; } /* das Vorfeld des Dorfs läuft hier aus */
    z.push(d < 1.6 || strecke(cx, cy, abzweig) < 1.2 || strecke(cx, cy, abzweig2) < 1.2 ? "e" : teich(cx, cy) ? "w" : inL(cx, cy) ? (inL(cx, cy, 0.55) ? "," : ".") : d < 4.2 + Math.sin(cy / 3) ? "." : "f"); } g.push(z); }
  const objekte = baeume(B, H, (x, y) => g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))] === "f", (x, y) => Math.abs(x - wegX(y)) < 3 || strecke(x, y, abzweig) < 2.6 || strecke(x, y, abzweig2) < 2.6 || Math.hypot((x - 70) / 5.2, (y - 45) / 4) < 1 || (y < 4.5 && Math.abs(x - 48) < 38), 0.95, 0.03);
  objekte.sort((a, b) => a.y - b.y);
  const ex = +wegX(63.5).toFixed(1), spiel = { start: [[48, 2.5], [47, 1.5], [49, 1.5]], figuren: [{ id: "wanderer_am_weg", rolle: "npc", figur: "wanderer", x: 33, y: 29.4 }],
    spawnzonen: [{ id: "kroeten_lichtung", zone: { art: "kreis", x: 66, y: 49.5, r: 3 }, gegner: [{ art: "schlammkroete", anzahl: 2 }, { art: "kroetchen", anzahl: 1 }], aggro: 7, leine: 16, respawn: 180, abgleich: "server" }],
    interaktionen: [], ausgaenge: [{ id: "nach_weidenhain", zone: { art: "rechteck", x0: ex - 4, y0: 62.6, x1: ex + 4, y1: 64 }, nach: { art: "ort", ort: "weidenhain" }, text: "Weiter nach Weidenhain" }], kollision: { sperren: [], freigeben: [] } };
  schreibe("waldweg", { id: "waldweg", name: "Der Waldweg", ursprung: [200, 202], chunks: [3, 2], biom: "wald", stufe: 1, entwurf: true }, g, objekte, spiel); }
