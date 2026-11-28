/*
 * World Pipeline – Baumdichte (#91, 27.11.2026): lichtet das Innere dichter Wälder für flüssiges Spielen auf dem Handy.
 * Bäume (Bewuchs mit 3D-Modell, viele Dreiecke) im Waldinneren dürfen nicht dichter als ABSTAND stehen; Waldränder (wenige Nachbarn), Holzfäller-Bäume,
 * Gesetztes („ort_…“) und Bäume nahe an Wegen, Gebäuden, Lesestellen und Figuren bleiben. Die verbleibenden Bäume im Inneren werden etwas größer,
 * damit das Kronendach geschlossen wirkt.
 * Mehrfach ausführbar: entfernte Bäume stehen in welt/baumdichte/<gebiet>.json und werden vor jedem Lauf zurückgesetzt.
 * Aufruf (im Ordner realtime): node werkzeug/welt/baumdichte.mjs [--zuruecksetzen]
 * Reihenfolge: baumdichte.mjs --zuruecksetzen → orte → lichtungen → naehte → baumdichte.mjs → bauen (die Nähte spiegeln den ungelichteten Wald).
 * Messung #91 (Handy-Profil, Waldmark): bei Pixelverhältnis 1 +8 % Bilder/s im Stand, +12 % beim Gehen; bei 2,75 begrenzt die Pixelmenge (kein Gewinn).
 * Mit --zuruecksetzen ist alles wieder wie vorher.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RT = join(dirname(fileURLToPath(import.meta.url)), "..", ".."), REG = join(RT, "welt", "regionen"), PROT = join(RT, "welt", "baumdichte"), C = 32;
const BIB = new Map(JSON.parse(readFileSync(join(RT, "welt", "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const ABSTAND = 3.7, RAND_R = 5, RAND_N = 5, SKALA = 1.15;
const istBaum = (o) => { const d = BIB.get(o.objekt); return d?.kategorie === "bewuchs" && /^(stil_(eiche|linde|herbst|tanne|birke|laub)|wald_baum)/.test(o.objekt) && !o.id.startsWith("ort_"); };
const hash = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };
mkdirSync(PROT, { recursive: true });
let weg = 0, vorher = 0;
for (const n of readdirSync(REG).sort()) { const rp = join(REG, n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  const op = join(REG, n, "objekte.json"), pp = join(PROT, n + ".json"); let obj = JSON.parse(readFileSync(op, "utf8")); let geaendert = false;
  /* zurücksetzen */
  if (existsSync(pp)) { const alt = JSON.parse(readFileSync(pp, "utf8")); const da = new Set(obj.map((o) => o.id)); for (const { _i, ...o } of [...alt.entfernt].sort((a, b) => a._i - b._i)) if (!da.has(o.id)) { obj.splice(Math.min(_i, obj.length), 0, o); geaendert = true; }   /* an der alten Stelle */
    for (const [id, s] of alt.skaliert) { const o = obj.find((q) => q.id === id); if (o && Math.abs((o.s ?? 1) - s * SKALA) < 0.011) { if (s === 1) delete o.s; else o.s = s; geaendert = true; } } }
  if (process.argv.includes("--zuruecksetzen")) { if (geaendert) writeFileSync(op, "[\n" + obj.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n"); if (existsSync(pp)) writeFileSync(pp, JSON.stringify({ entfernt: [], skaliert: [] }) + "\n"); continue; }
  const spiel = JSON.parse(readFileSync(join(REG, n, "spiel.json"), "utf8")), gel = readFileSync(join(REG, n, "gelaende.txt"), "utf8").split("\n");
  const schutz = [...spiel.interaktionen.map((i) => [i.x, i.y, 4]), ...(spiel.figuren || []).map((f) => [f.x, f.y, 4]), ...obj.filter((o) => !BIB.get(o.objekt) || BIB.get(o.objekt).kategorie !== "bewuchs").map((o) => [o.x, o.y, 3])];
  const wegNah = (x, y) => { for (let dy = -3; dy <= 3; dy++) { const z = gel[Math.floor(y) + dy]; if (!z) continue; for (let dx = -3; dx <= 3; dx++) if ("ekpd~".includes(z[Math.floor(x) + dx] || "")) return true; } return false; };
  const baeume = obj.filter(istBaum); vorher += baeume.length;
  /* Gitter für Nachbarn */
  const G = new Map(), k = (x, y) => Math.floor(x / 6) + "," + Math.floor(y / 6); for (const b of baeume) { const kk = k(b.x, b.y); (G.get(kk) || G.set(kk, []).get(kk)).push(b); }
  const nachbarn = (b, r) => { const aus = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) for (const q of G.get((Math.floor(b.x / 6) + dx) + "," + (Math.floor(b.y / 6) + dy)) || []) if (q !== b && Math.hypot(q.x - b.x, q.y - b.y) < r) aus.push(q); return aus; };
  const behalten = new Set(), entfernt = [];
  for (const b of [...baeume].sort((a, c) => hash(a.x, a.y) - hash(c.x, c.y))) {
    const innen = nachbarn(b, RAND_R).length >= RAND_N, geschuetzt = !innen || wegNah(b.x, b.y) || schutz.some(([x, y, r]) => Math.hypot(x - b.x, y - b.y) < r);
    if (geschuetzt || !nachbarn(b, ABSTAND).some((q) => behalten.has(q))) behalten.add(b); else entfernt.push(b); }
  const index = new Map(obj.map((o, i) => [o, i])); const skaliert = []; if (entfernt.length) { const weg_ = new Set(entfernt); obj = obj.filter((o) => !weg_.has(o)); geaendert = true;
    for (const b of behalten) if (nachbarn(b, ABSTAND + 1).some((q) => weg_.has(q))) { skaliert.push([b.id, b.s ?? 1]); b.s = +((b.s ?? 1) * SKALA).toFixed(2); } }
  weg += entfernt.length;
  writeFileSync(pp, JSON.stringify({ hinweis: "baumdichte.mjs: entfernte Bäume (mit alter Stelle _i) und vergrößerte Nachbarn – zum Zurücksetzen beim nächsten Lauf", entfernt: entfernt.map((o) => ({ ...o, _i: index.get(o) })), skaliert }) + "\n");
  if (geaendert) writeFileSync(op, "[\n" + obj.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n"); }
console.log(`Baumdichte: ${vorher} Bäume, ${weg} im Waldinneren entfernt (${Math.round(weg / Math.max(1, vorher) * 100)} %)`);
