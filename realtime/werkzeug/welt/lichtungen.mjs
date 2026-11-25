/*
 * World Pipeline – Lichtungen (Holzfällerei) und Senken (Bergbau) mit Feldwegen (24.11.2026). Läuft NACH den Gebietsskripten (waldmark.mjs, nordsaum.mjs, rabenmoor.mjs …),
 * weil die die Gebiete neu schreiben, und VOR bauen.mjs / drei.mjs / weltzonen.py:
 *
 *   node werkzeug/welt/lichtungen.mjs && node werkzeug/welt/bauen.mjs nordwald nordsaum waldweg rabenmoor && node werkzeug/welt/drei.mjs && python3 werkzeug/weltzonen.py
 *
 * Für jede Lichtung aus shared/holz_standorte.json und jede Senke aus shared/bergbau_standorte.json:
 *   · Waldbäume, Büsche und Schilf im Umkreis weg (nur Bewuchs; Häuser, Felsen und Kleinteile bleiben).
 *   · Waldboden wird Wiese, zum Rand hin locker ausgefranst (im Moor bleibt der Moorboden); in einer Senke Steinboden (Höhlenboden), am Rand Erde.
 *   · Senken: spiel.json → senken [{ x, y, r, tiefe }] (Gebietsfelder); drei.mjs senkt dort den Boden zur Mulde ab.
 *   · Ein Feldweg (Erde) zum nächsten vorhandenen Weg, Bewuchs entlang des Wegs weg.
 *   · Die Felder der Holzfäller-Bäume und Erzadern selbst werden gesperrt (spiel.json → kollision.sperren), damit niemand durch den Stamm läuft –
 *     auch nicht in den Kampfgebieten (weltzonen.py liest das Gehraster).
 * Mehrfach ausführbar: schon freie Stellen bleiben frei, die Sperren der Bäume werden ersetzt, nicht verdoppelt.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url)), RT = join(HIER, "..", ".."), REG = join(RT, "welt", "regionen");
const C = 32, WEG = new Set(["e", "k", "p"]), WASSER = new Set(["~", "w", "o"]), GESPERRT = new Set(["F", "X"]);
const standorte = [...JSON.parse(readFileSync(join(RT, "shared", "holz_standorte.json"), "utf8")).lichtungen,
  ...JSON.parse(readFileSync(join(RT, "shared", "bergbau_standorte.json"), "utf8")).senken.map((s) => ({ ...s, baeume: s.adern, senke: true }))];
const bib = JSON.parse(readFileSync(join(RT, "welt", "bibliothek", "objekte.json"), "utf8")).objekte;
const kategorie = new Map(bib.map((o) => [o.id, o.kategorie]));
const istBewuchs = (p) => kategorie.get(p.objekt) === "bewuchs";
const zufall = (x, y) => { let h = Math.imul(x | 0, 0x9e3779b1) ^ Math.imul(y | 0, 0x85ebca77); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

const nachRegion = new Map();
for (const l of standorte) { const r = l.baeume[0].region; (nachRegion.get(r) || nachRegion.set(r, []).get(r)).push(l); }
for (const [rid, lichtungen] of nachRegion) {
  const pfad = (n) => join(REG, rid, n), region = JSON.parse(readFileSync(pfad("region.json"), "utf8"));
  const ux = region.ursprung[0] * C, uy = region.ursprung[1] * C;
  const gel = readFileSync(pfad("gelaende.txt"), "utf8").split("\n").filter((z) => z.length).map((z) => [...z]);
  const H = gel.length, B = gel[0].length; let objekte = JSON.parse(readFileSync(pfad("objekte.json"), "utf8"));
  const spiel = JSON.parse(readFileSync(pfad("spiel.json"), "utf8"));
  const moor = rid === "rabenmoor"; let weg = 0, gefaellt = 0, wiese = 0; const senken = [];
  const feld = (x, y) => (x >= 0 && y >= 0 && x < B && y < H ? gel[y][x] : "X");
  const fremd = objekte.filter((p) => !istBewuchs(p)); /* Häuser, Felsen, Kleinteile: dort keinen Weg hindurch */
  const blockiert = (x, y) => WASSER.has(feld(x, y)) || GESPERRT.has(feld(x, y)) || fremd.some((p) => Math.abs(p.x - (x + 0.5)) < 1.6 && Math.abs(p.y - (y + 0.5)) < 1.6);
  const baumFelder = new Set(lichtungen.flatMap((l) => l.baeume.map((b) => `${Math.floor(b.x - ux)},${Math.floor(b.y - uy)}`)));
  for (const l of lichtungen) {
    const bs = l.baeume.map((b) => ({ x: b.x - ux, y: b.y - uy })), mx = l.senke ? l.x - ux : bs.reduce((s, b) => s + b.x, 0) / bs.length, my = l.senke ? l.y - uy : bs.reduce((s, b) => s + b.y, 0) / bs.length;
    const R = l.senke ? l.r : Math.max(5, Math.max(...bs.map((b) => Math.hypot(b.x - mx, b.y - my))) + 3.2);
    if (l.senke) senken.push({ x: +mx.toFixed(1), y: +my.toFixed(1), r: R, tiefe: 1.1 });
    /* 1. Bewuchs im Umkreis weg */
    const vor = objekte.length; objekte = objekte.filter((p) => !(istBewuchs(p) && Math.hypot(p.x - mx, p.y - my) < R + 0.6)); gefaellt += vor - objekte.length;
    /* 2. Waldboden wird Wiese, am Rand ausgefranst */
    if (!moor) for (let y = Math.floor(my - R - 1); y <= my + R + 1; y++) for (let x = Math.floor(mx - R - 1); x <= mx + R + 1; x++) {
      const d = Math.hypot(x + 0.5 - mx, y + 0.5 - my); if (feld(x, y) !== "f") continue;
      if (d < R - 1.2 || (d < R + 0.8 && zufall(x, y) < 0.55)) { gel[y][x] = l.senke ? (d < R - 2.2 || (d < R - 1.2 && zufall(x * 5, y) < 0.5) ? "h" : "e") : zufall(x * 3, y * 7) < 0.25 ? "," : "."; wiese++; } }
    /* 3. Feldweg: kürzester begehbarer Weg (8 Nachbarn) vom Rand der Lichtung zum nächsten Weg */
    const sx = Math.floor(mx), sy = Math.floor(my), vorher = new Map([[`${sx},${sy}`, null]]), schlange = [[sx, sy]]; let ziel = null;
    while (schlange.length && !ziel) { const [x, y] = schlange.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
        if (vorher.has(k) || nx < 1 || ny < 1 || nx >= B - 1 || ny >= H - 1 || blockiert(nx, ny) || baumFelder.has(k)) continue;
        vorher.set(k, [x, y]); if (WEG.has(feld(nx, ny)) && Math.hypot(nx - mx, ny - my) > R - 1) { ziel = [nx, ny]; break; } schlange.push([nx, ny]); } }
    if (!ziel) { console.log(`  ${l.name}: kein Weg in Reichweite gefunden`); continue; }
    const strecke = []; for (let p = ziel; p; p = vorher.get(`${p[0]},${p[1]}`)) strecke.push(p);
    for (const [x, y] of strecke) { if (Math.hypot(x + 0.5 - mx, y + 0.5 - my) < R - 1.5 || baumFelder.has(`${x},${y}`)) continue; if (!WEG.has(gel[y][x])) { gel[y][x] = "e"; weg++; } }
    const vorW = objekte.length; objekte = objekte.filter((p) => !(istBewuchs(p) && strecke.some(([x, y]) => Math.hypot(p.x - (x + 0.5), p.y - (y + 0.5)) < 1.6))); gefaellt += vorW - objekte.length;
    console.log(`  ${l.name}: Radius ${R.toFixed(1)}, Feldweg ${strecke.length} Felder`);
  }
  /* 4. Baum- und Aderfelder sperren (alte Sperren ersetzen); Senken für drei.mjs */
  if (senken.length) spiel.senken = senken; else delete spiel.senken;
  const k = spiel.kollision || (spiel.kollision = { sperren: [], freigeben: [] });
  k.sperren = k.sperren.filter((z) => !baumFelder.has(`${z.x0},${z.y0}`) || z.x1 - z.x0 !== 1 || z.y1 - z.y0 !== 1);
  for (const f of baumFelder) { const [x, y] = f.split(",").map(Number); k.sperren.push({ art: "rechteck", x0: x, y0: y, x1: x + 1, y1: y + 1 }); }
  writeFileSync(pfad("gelaende.txt"), gel.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(pfad("objekte.json"), "[\n" + objekte.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n");
  writeFileSync(pfad("spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${rid}: ${lichtungen.length} Lichtungen/Senken, ${gefaellt} Waldbäume entfernt, ${wiese} Felder Wiese, ${weg} Felder Feldweg, ${baumFelder.size} Baumfelder gesperrt`);
}

/* Handwerk (shared/handwerk_welt.json): Kuhgehege im Osthof und die Felder der Werkbank in der Waldmark – Zaun-Objekte und Sperren, mehrfach ausführbar */
for (const b of JSON.parse(readFileSync(join(RT, "shared", "handwerk_welt.json"), "utf8")).bauten) {
  const pfad = (n) => join(REG, b.region, n), spiel = JSON.parse(readFileSync(pfad("spiel.json"), "utf8")); let objekte = JSON.parse(readFileSync(pfad("objekte.json"), "utf8"));
  const gleich = (p, q) => p.objekt === q.objekt && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.y - q.y) < 0.01;
  /* Bewuchs im Bereich weg, dann die Objekte (ohne doppelte) */
  const [bx0, by0, bx1, by1] = b.sperren.reduce((r, [x0, y0, x1, y1]) => [Math.min(r[0], x0), Math.min(r[1], y0), Math.max(r[2], x1), Math.max(r[3], y1)], [1e9, 1e9, -1e9, -1e9]);
  objekte = objekte.filter((p) => !(istBewuchs(p) && p.x > bx0 - 1 && p.x < bx1 + 1 && p.y > by0 - 1 && p.y < by1 + 1));
  for (const o of b.objekte) if (!objekte.some((p) => gleich(p, o))) objekte.push({ id: `${b.region}_hw_${o.objekt}_${o.x}_${o.y}`.replace(/\./g, "_"), ...o });
  const k = spiel.kollision || (spiel.kollision = { sperren: [], freigeben: [] });
  for (const [x0, y0, x1, y1] of b.sperren) if (!k.sperren.some((z) => z.x0 === x0 && z.y0 === y0 && z.x1 === x1 && z.y1 === y1)) k.sperren.push({ art: "rechteck", x0, y0, x1, y1 });
  writeFileSync(pfad("objekte.json"), "[\n" + objekte.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n");
  writeFileSync(pfad("spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${b.region}: ${b.name} – ${b.objekte.length} Objekte, ${b.sperren.length} Sperren`);
}
