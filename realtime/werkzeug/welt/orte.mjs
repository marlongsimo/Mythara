/*
 * World Pipeline – Orte für Systeme und Quests (Phase 3, 27.11.2026): trägt welt/orte.json in die vorhandenen Gebiete ein, ohne sie neu zu erzeugen
 * (damit Änderungen anderer Rollen an den Gebietsdateien erhalten bleiben). Mehrfach ausführbar:
 *   · Objekte mit Kennung „ort_…“ werden je Lauf zuerst entfernt und dann neu gesetzt; „weg“ nennt fremde Objekte, die dafür Platz machen.
 *   · Flächen (Kreis oder Rechteck) setzen ein Geländezeichen, aber nur auf den Zeichen in „auf“; „frei“ räumt Bewuchs im Umkreis.
 *   · Wege werden als Erdweg („e“) gezogen (nicht über Wasser, Pflaster oder Holzboden), Bewuchs auf dem Weg verschwindet.
 * Reihenfolge: node werkzeug/welt/orte.mjs && node werkzeug/welt/lichtungen.mjs && node werkzeug/welt/bauen.mjs … (lichtungen.mjs nimmt die
 * vorgeschlagenen Lichtungen und Senken aus welt/orte.json mit, solange sie nicht in den Standort-Dateien stehen).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url)), RT = join(HIER, "..", ".."), REG = join(RT, "welt", "regionen"), C = 32;
const ORTE = JSON.parse(readFileSync(join(RT, "welt", "orte.json"), "utf8"));
/* weitere Ortslisten (z. B. welt/orte_wegenetz.json aus wegenetz.mjs): Wege, Flächen, Objekte und Lesestellen werden angehängt */
for (const f of readdirSync(join(RT, "welt")).filter((f) => f.startsWith("orte_") && f.endsWith(".json")).sort()) { const z = JSON.parse(readFileSync(join(RT, "welt", f), "utf8"));
  for (const k of ["wege", "flaechen", "objekte", "interaktionen"]) ORTE[k] = [...(ORTE[k] || []), ...(z[k] || [])]; }
const BIB = new Map(JSON.parse(readFileSync(join(RT, "welt", "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const istBewuchs = (p) => BIB.get(p.objekt)?.kategorie === "bewuchs" && !String(p.id || "").startsWith("zaun_");   /* Hecken als Einhegung (zaun_…, #168) bleiben */
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };

/* Oberwelt-Gebiete laden */
const gebiete = [];
for (const n of readdirSync(REG)) { const p = join(REG, n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  gebiete.push({ id: n, r, x0: r.ursprung[0] * C, y0: r.ursprung[1] * C, b: r.chunks[0] * C, h: r.chunks[1] * C, gel: null, obj: null, neu: false }); }
const gebietVon = (x, y) => gebiete.find((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h);
const lade = (g) => { if (!g.gel) { g.gel = readFileSync(join(REG, g.id, "gelaende.txt"), "utf8").split("\n").filter((z) => z.length).map((z) => [...z]); g.obj = JSON.parse(readFileSync(join(REG, g.id, "objekte.json"), "utf8")); } return g; };
const zeichen = (x, y) => { const g = gebietVon(x, y); if (!g) return null; lade(g); return g.gel[Math.floor(y) - g.y0][Math.floor(x) - g.x0]; };
const setze = (x, y, c) => { const g = gebietVon(x, y); if (!g) return false; lade(g); const i = Math.floor(x) - g.x0, j = Math.floor(y) - g.y0; if (g.gel[j][i] === c) return false; g.gel[j][i] = c; g.neu = true; return true; };
const raeumen = (x, y, r) => { let n = 0; for (const g of gebiete) { if (x + r < g.x0 || x - r > g.x0 + g.b || y + r < g.y0 || y - r > g.y0 + g.h) continue; lade(g);
  const vor = g.obj.length; g.obj = g.obj.filter((p) => !(istBewuchs(p) && !p.id.startsWith("ort_") && Math.hypot(p.x + g.x0 - x, p.y + g.y0 - y) < r)); if (g.obj.length !== vor) { g.neu = true; n += vor - g.obj.length; } } return n; };

/* 1. Wege */
for (const w of ORTE.wege || []) { let n = 0; const xs = w.punkte.map((p) => p[0]), ys = w.punkte.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys) - 3); y <= Math.max(...ys) + 3; y++) for (let x = Math.floor(Math.min(...xs) - 3); x <= Math.max(...xs) + 3; x++) {
    if (strecke(x + 0.5, y + 0.5, w.punkte) >= w.breite / 2 + 0.25) continue; const c = zeichen(x, y); if (c === null || "~wodpkMFX".replace(w.zeichen === "k" ? "k" : "", "").includes(c)) continue; if (setze(x, y, w.zeichen || "e")) n++; }
  for (let i = 1; i < w.punkte.length; i++) { const [a, b] = [w.punkte[i - 1], w.punkte[i]], l = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let t = 0; t <= l; t += 1.5) raeumen(a[0] + (b[0] - a[0]) * t / l, a[1] + (b[1] - a[1]) * t / l, w.breite / 2 + 1.4); }
  console.log(`  Weg „${w.name}“: ${n} Felder neu`); }
/* 2. Flächen */
for (const f of ORTE.flaechen || []) { let n = 0; const [x0, y0, x1, y1] = f.rechteck || [f.x - f.r - 1, f.y - f.r - 1, f.x + f.r + 1, f.y + f.r + 1];
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
    if (!f.rechteck && Math.hypot(x + 0.5 - f.x, y + 0.5 - f.y) > f.r) continue; const c = zeichen(x, y); if (c === null || !f.auf.includes(c)) continue; if (setze(x, y, f.zeichen)) n++; }
  const fr = f.frei ?? 0, mx = f.rechteck ? (x0 + x1) / 2 : f.x, my = f.rechteck ? (y0 + y1) / 2 : f.y; const weg = fr ? raeumen(mx, my, fr) : 0;
  console.log(`  Fläche „${f.name}“: ${n} Felder, ${weg} Bewuchs weg`); }
/* 3. Objekte: frühere „ort_…“ weg, Platzmacher weg, neu setzen */
const wegIds = new Set((ORTE.objekte || []).flatMap((o) => o.weg || []));
for (const g of gebiete) { const pfad = join(REG, g.id, "objekte.json"); if (!existsSync(pfad)) continue; lade(g); const vor = g.obj.length;
  g.obj = g.obj.filter((p) => !p.id.startsWith("ort_") && !wegIds.has(p.id)); if (g.obj.length !== vor) g.neu = true; }
for (const o of ORTE.objekte || []) { if (!BIB.has(o.objekt)) throw new Error(`unbekanntes Objekt ${o.objekt} (${o.id})`); const g = lade(gebietVon(o.x, o.y));
  g.obj.push({ id: o.id, objekt: o.objekt, x: +(o.x - g.x0).toFixed(2), y: +(o.y - g.y0).toFixed(2), ...(o.s ? { s: o.s } : {}), ...(o.spiegeln ? { spiegeln: true } : {}) }); g.neu = true;
  /* auch Bewuchs, der das Objekt verdecken würde */
  const k = BIB.get(o.objekt).kollision; if (k && k.art === "rechteck") raeumen(o.x + k.x + k.b / 2, o.y + k.y + k.h / 2, Math.hypot(k.b, k.h) / 2 + 1); }
/* 4. Lesestellen „ort_…“ (z. B. Wegweiser): frühere entfernen, neu eintragen */
const spielVon = new Map();
for (const g of gebiete) { const p = join(REG, g.id, "spiel.json"); if (!existsSync(p)) continue; const s = JSON.parse(readFileSync(p, "utf8")); const vor = s.interaktionen.length;
  s.interaktionen = s.interaktionen.filter((i) => !i.id.startsWith("ort_")); spielVon.set(g, { s, neu: s.interaktionen.length !== vor }); }
for (const i of ORTE.interaktionen || []) { const g = gebietVon(i.x, i.y); if (!g) throw new Error("Lesestelle außerhalb: " + i.id); const e = spielVon.get(g);
  e.s.interaktionen.push({ id: i.id, art: "lesen", x: +(i.x - g.x0).toFixed(2), y: +(i.y - g.y0).toFixed(2), radius: i.radius ?? 1.8, abgleich: "keiner", daten: i.daten }); e.neu = true; }
for (const [g, e] of spielVon) if (e.neu) writeFileSync(join(REG, g.id, "spiel.json"), JSON.stringify(e.s, null, 1) + "\n");
/* schreiben */
for (const g of gebiete) if (g.neu) {   /* Reihenfolge der vorhandenen Objekte bleibt (kleine Diffs) */
  writeFileSync(join(REG, g.id, "gelaende.txt"), g.gel.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(REG, g.id, "objekte.json"), "[\n" + g.obj.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  console.log(`${g.id}: geschrieben`); }
