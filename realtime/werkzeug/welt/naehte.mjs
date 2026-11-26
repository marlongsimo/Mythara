/*
 * World Pipeline – Nähte (#42, 27.11.2026): rundet die geraden Kanten ab, an denen die alten, einzeln gebauten Regionen aneinander und an das
 * Festland stoßen. Läuft als letzter Schritt vor bauen.mjs (nach orte.mjs und lichtungen.mjs) und ist mehrfach ausführbar.
 *   1. Die Grenze zweier Regionen wird zu einer geschwungenen Linie: Felder jenseits der Linie übernehmen das gespiegelte Feld der Nachbarregion
 *      (Bodenzeichen und Bewuchs), dazu einzelne Inseln nahe der Linie (Baumgruppen, Lichtungen). Nur natürlicher Boden wird getauscht –
 *      Wasser, Fels, Wege, Pflaster, Acker, Böden in Häusern bleiben, wie sie sind. Also bleibt alles begehbar, was begehbar war, und umgekehrt.
 *   2. Auf dem Festland laufen Wald und Bewuchs der alten Karte aus: Bäume auf Waldboden und vereinzelte Büsche, immer lichter mit dem Abstand.
 * Gesetzte Objekte heißen „naht_…“. Was ersetzt wurde, steht in welt/naehte/<gebiet>.json und wird beim nächsten Lauf erst zurückgesetzt
 * (nur Felder, die seitdem niemand anders geändert hat), dann neu gerechnet.
 * Aufruf (im Ordner realtime): node werkzeug/welt/naehte.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HIER = dirname(fileURLToPath(import.meta.url)), RT = join(HIER, "..", ".."), REG = join(RT, "welt", "regionen"), PROT = join(RT, "welt", "naehte"), C = 32;
const BIB = new Map(JSON.parse(readFileSync(join(RT, "welt", "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const istBewuchs = (p) => BIB.get(p.objekt)?.kategorie === "bewuchs" && !p.id.startsWith("ort_");
const NATUR = new Set([..."f.,vtgsmyTuSj"]), MOOR = "o";   /* Moorwasser: darf sich ausbreiten, wird aber in alten Gebieten nie zu Land */
const BAND = 32, AMP = 21, AUSKLANG = 34;

/* Gebiete der Oberwelt */
const gebiete = [];
for (const n of readdirSync(REG).sort()) { const p = join(REG, n, "region.json"); if (!existsSync(p)) continue; const r = JSON.parse(readFileSync(p, "utf8")); if (r.ebene || r.entwurf) continue;
  const gel = readFileSync(join(REG, n, "gelaende.txt"), "utf8").split("\n").filter((z) => z.length).map((z) => [...z]);
  const obj = JSON.parse(readFileSync(join(REG, n, "objekte.json"), "utf8")), spiel = JSON.parse(readFileSync(join(REG, n, "spiel.json"), "utf8"));
  gebiete.push({ id: n, alt: !r.nahtlos, x0: r.ursprung[0] * C, y0: r.ursprung[1] * C, b: r.chunks[0] * C, h: r.chunks[1] * C, gel, obj, spiel, neu: false, felder: [], entfernt: [] }); }
const gebietVon = (x, y) => gebiete.find((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h);
const alte = gebiete.filter((g) => g.alt);

/* 0. Zurücksetzen, was der letzte Lauf getan hat */
mkdirSync(PROT, { recursive: true });
for (const g of gebiete) { const p = join(PROT, g.id + ".json"); const vor = g.obj.length; g.obj = g.obj.filter((o) => !o.id.startsWith("naht_")); if (g.obj.length !== vor) g.neu = true;
  if (!existsSync(p)) continue; const alt = JSON.parse(readFileSync(p, "utf8"));
  for (const [i, j, vorher, nachher] of alt.felder) if (g.gel[j]?.[i] === nachher) { g.gel[j][i] = vorher; g.neu = true; }
  const da = new Set(g.obj.map((o) => o.id)); for (const o of alt.entfernt) if (!da.has(o.id)) { g.obj.push(o); g.neu = true; } }
/* ursprüngliche Lage (Quelle für alle Spiegelungen) */
const zeichen0 = new Map(gebiete.map((g) => [g, g.gel.map((z) => z.slice())]));
const zeichenAn = (x, y) => { const g = gebietVon(x, y); return g ? zeichen0.get(g)[Math.floor(y) - g.y0][Math.floor(x) - g.x0] : null; };
const bewuchsIn = new Map(gebiete.map((g) => { const m = new Map(); for (const o of g.obj) if (istBewuchs(o) && !o.id.startsWith("naht_")) { const k = Math.floor(o.x) + "," + Math.floor(o.y); (m.get(k) || m.set(k, []).get(k)).push(o); } return [g, m]; }));

/* geschützte Stellen: Interaktionen, Figuren, Sperren, Standorte, Nicht-Bewuchs-Objekte */
const schutz = [];
for (const g of gebiete) { for (const i of g.spiel.interaktionen || []) schutz.push([g.x0 + i.x, g.y0 + i.y, 3]); for (const f of g.spiel.figuren || []) schutz.push([g.x0 + f.x, g.y0 + f.y, 3]);
  for (const s of g.spiel.kollision?.sperren || []) if (s.art === "rechteck") schutz.push([g.x0 + (s.x0 + s.x1) / 2, g.y0 + (s.y0 + s.y1) / 2, Math.hypot(s.x1 - s.x0, s.y1 - s.y0) / 2 + 2]);
  for (const o of g.obj) if (!istBewuchs(o)) schutz.push([g.x0 + o.x, g.y0 + o.y, 2.5]); }
const sammle = (v) => { if (Array.isArray(v)) v.forEach(sammle); else if (v && typeof v === "object") { if (typeof v.x === "number" && typeof v.y === "number") schutz.push([v.x, v.y, (v.r || 1) + 2.5]); Object.values(v).forEach(sammle); } };
for (const f of ["shared/bergbau_standorte.json", "shared/holz_standorte.json", "shared/seelenlicht_standorte.json", "welt/seelenlicht_standorte.json", "welt/kraeuter_standorte.json"]) if (existsSync(join(RT, f))) sammle(JSON.parse(readFileSync(join(RT, f), "utf8")));
const SG = new Map(); for (const s of schutz) { const k = Math.floor(s[0] / 16) + "," + Math.floor(s[1] / 16); (SG.get(k) || SG.set(k, []).get(k)).push(s); }
const geschuetzt = (x, y, um = 1.2) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) for (const [a, b, r] of SG.get((Math.floor(x / 16) + di) + "," + (Math.floor(y / 16) + dj)) || []) if (Math.hypot(a - x, b - y) < r) return true;
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const c = zeichenAn(x + di * um, y + dj * um); if (c && !NATUR.has(c) && c !== MOOR) return true; } return false; };

/* Rauschen */
const glatt = (t, s) => Math.sin(t / 47 + s * 1.7) * 0.42 + Math.sin(t / 21.3 + s * 3.1) * 0.33 + Math.sin(t / 6.9 + s * 5.3) * 0.13 + Math.sin(t / 2.9 + s * 2.3) * 0.07;
const fein = (x, y) => { const v = Math.sin(x / 2.9 + y / 4.1) * Math.sin(y / 3.3 - x / 5.3 + 1.1) + 0.5 * Math.sin((x * 0.7 + y) / 1.9); return v / 1.5; };
let saat = 4242; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;

/* 1. Grenzlinien */
let zahl = 0, getauscht = 0;
const tausche = (g, i, j, x, y, sx, sy, spiegelX, spiegelY, tiefe) => {
  const ziel = zeichen0.get(g)[j][i], quelle = zeichenAn(sx, sy); if (quelle === null) return;
  const ok = (NATUR.has(ziel) && NATUR.has(quelle)) || (NATUR.has(ziel) && quelle === MOOR && !geschuetzt(x, y, 2.5)) || (ziel === MOOR && NATUR.has(quelle) && (!g.alt || (tiefe < 10 && !geschuetzt(x, y, 3)))); if (!ok) return;   /* in alten Gebieten weicht Moorwasser nur am äußersten Rand */
  const q = gebietVon(sx, sy); const k = Math.floor(sx - q.x0) + "," + Math.floor(sy - q.y0);
  if (ziel !== quelle) { g.gel[j][i] = quelle; g.felder.push([i, j, ziel, quelle]); }
  /* Bewuchs: der eigene auf dem Feld geht, der gespiegelte der Nachbarn kommt */
  const vor = g.obj.length; g.obj = g.obj.filter((o) => { if (!istBewuchs(o) || o.id.startsWith("naht_") || Math.floor(o.x) !== i || Math.floor(o.y) !== j) return true; g.entfernt.push(o); return false; });
  for (const o of bewuchsIn.get(q).get(k) || []) { const wx = spiegelX(o.x + q.x0), wy = spiegelY(o.y + q.y0); if (geschuetzt(wx, wy)) continue;
    g.obj.push({ id: "naht_" + ++zahl, objekt: o.objekt, x: +(wx - g.x0).toFixed(2), y: +(wy - g.y0).toFixed(2), ...(o.s ? { s: o.s } : {}), ...(o.spiegeln ? {} : { spiegeln: true }) }); }
  if (ziel !== quelle || g.obj.length !== vor) { g.neu = true; getauscht++; } };
for (const g of gebiete) for (let j = 0; j < g.h; j++) for (let i = 0; i < g.b; i++) {
  const kanten = [[i, "W"], [g.b - 1 - i, "O"], [j, "N"], [g.h - 1 - j, "S"]].filter(([d]) => d < BAND).sort((a, b) => a[0] - b[0]); if (!kanten.length) continue;
  const [d, seite] = kanten[0], x = g.x0 + i + 0.5, y = g.y0 + j + 0.5;
  const senkrecht = seite === "W" || seite === "O", e = seite === "W" ? g.x0 : seite === "O" ? g.x0 + g.b : seite === "N" ? g.y0 : g.y0 + g.h;
  const nx = seite === "W" ? g.x0 - 0.5 : seite === "O" ? g.x0 + g.b + 0.5 : x, ny = seite === "N" ? g.y0 - 0.5 : seite === "S" ? g.y0 + g.h + 0.5 : y, q = gebietVon(nx, ny);
  if (!q || q === g || (!g.alt && !q.alt)) continue;
  /* die geschwungene Linie: Lage e + off(t) quer zur Kante; ein Feld gehört zur Seite, auf der es von der Linie aus liegt */
  const t = senkrecht ? y : x, off = AMP * glatt(t, e / 13.7), pos = senkrecht ? x : y, auf = seite === "W" || seite === "N" ? -1 : 1;   /* auf: Richtung, in der der Nachbar liegt */
  const jenseits = (pos - (e + off)) * auf > 0, abst = Math.abs(pos - (e + off));
  const insel = !jenseits && abst < 9 && fein(x, y) > 0.5 + 0.05 * abst;
  if (!jenseits && !insel) continue;
  const sx = senkrecht ? 2 * e - x : x, sy = senkrecht ? y : 2 * e - y;
  tausche(g, i, j, x, y, sx, sy, senkrecht ? (v) => 2 * e - v : (v) => v, senkrecht ? (v) => v : (v) => 2 * e - v, d); }

/* 2. Auf dem Festland: Wald und Bewuchs der alten Karte laufen aus */
const altAbstand = (x, y) => { let best = Infinity, wer = null; for (const a of alte) { const dx = Math.max(a.x0 - x, 0, x - a.x0 - a.b), dy = Math.max(a.y0 - y, 0, y - a.y0 - a.h); const d = Math.hypot(dx, dy); if (d < best) { best = d; wer = a; } } return [best, wer]; };
const artenVon = new Map(alte.map((a) => { const z = new Map(); for (const o of a.obj) if (istBewuchs(o) && !o.id.startsWith("naht_")) z.set(o.objekt, (z.get(o.objekt) || 0) + 1);
  const l = [...z.entries()].sort((p, q) => q[1] - p[1]).slice(0, 8).flatMap(([k, n]) => Array(Math.max(1, Math.round(n / Math.max(1, a.obj.length) * 40))).fill(k)); return [a, l.length ? l : ["stil_eiche_02", "stil_busch_01"]]; }));
let ausklang = 0;
for (const g of gebiete) { if (g.alt) continue; const lx0 = Math.min(...alte.map((a) => a.x0)) - AUSKLANG, lx1 = Math.max(...alte.map((a) => a.x0 + a.b)) + AUSKLANG, ly0 = Math.min(...alte.map((a) => a.y0)) - AUSKLANG, ly1 = Math.max(...alte.map((a) => a.y0 + a.h)) + AUSKLANG;
  if (g.x0 > lx1 || g.x0 + g.b < lx0 || g.y0 > ly1 || g.y0 + g.h < ly0) continue;
  const gitter = new Map(), zk = (x, y) => Math.floor(x / 3) + "," + Math.floor(y / 3);
  const frei = (x, y, ab) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) for (const [a, b] of gitter.get((Math.floor(x / 3) + di) + "," + (Math.floor(y / 3) + dj)) || []) if (Math.hypot(a - x, b - y) < ab) return false; return true; };
  for (const o of g.obj) if (istBewuchs(o)) { const k = zk(o.x + g.x0, o.y + g.y0); (gitter.get(k) || gitter.set(k, []).get(k)).push([o.x + g.x0, o.y + g.y0]); }
  for (let fy = Math.max(g.y0, ly0); fy < Math.min(g.y0 + g.h, ly1); fy++) for (let fx = Math.max(g.x0, lx0); fx < Math.min(g.x0 + g.b, lx1); fx++) { const x = fx + wurf(), y = fy + wurf();
    const [d, a] = altAbstand(x, y); if (d > AUSKLANG || d < 0.5) continue; const c = g.gel[Math.floor(y - g.y0)][Math.floor(x - g.x0)];
    const p = c === "f" ? 0.42 * Math.pow(1 - d / AUSKLANG, 1.2) : ".,v".includes(c) ? 0.03 * Math.pow(1 - d / (AUSKLANG * 0.6), 2) * (d < AUSKLANG * 0.6 ? 1 : 0) : 0;
    if (wurf() > p || geschuetzt(x, y) || !frei(x, y, c === "f" ? 2.6 : 4.5)) continue;
    const arten = artenVon.get(a), art = c === "f" ? arten[Math.floor(wurf() * arten.length)] : (wurf() < 0.7 ? "stil_busch_01" : arten[Math.floor(wurf() * arten.length)]);
    if (!BIB.has(art)) continue;
    g.obj.push({ id: "naht_" + ++zahl, objekt: art, x: +(x - g.x0).toFixed(2), y: +(y - g.y0).toFixed(2), s: +(0.8 + wurf() * 0.3).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) });
    const k = zk(x, y); (gitter.get(k) || gitter.set(k, []).get(k)).push([x, y]); g.neu = true; ausklang++; } }

/* schreiben */
for (const g of gebiete) { const p = join(PROT, g.id + ".json");
  if (g.felder.length || g.entfernt.length) writeFileSync(p, JSON.stringify({ hinweis: "naehte.mjs: [i, j, vorher, nachher] und ersetzter Bewuchs – zum Zurücksetzen beim nächsten Lauf", felder: g.felder, entfernt: g.entfernt }) + "\n");
  else if (existsSync(p)) writeFileSync(p, JSON.stringify({ felder: [], entfernt: [] }) + "\n");
  if (!g.neu) continue;
  writeFileSync(join(REG, g.id, "gelaende.txt"), g.gel.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(REG, g.id, "objekte.json"), "[\n" + g.obj.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n"); }
console.log(`Nähte: ${getauscht} Felder an Grenzen getauscht, ${ausklang} Bäume und Büsche im Ausklang, ${zahl} Objekte „naht_…“`);
