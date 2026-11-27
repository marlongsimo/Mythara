/*
 * Riftmere – Streifgebiete (#143): 5–7 Tiere derselben Art, jedes wandert für sich über eine größere Fläche (welt/streifgebiete.json → weltzonen.py → Lager mit „streif“).
 * Ohne Server-Prozess: jedes Tier bleibt in seinem Rechteck, die Tiere bewegen sich unabhängig (kein Rudel), nach dem Kampf zurück ins Gebiet, Wiederkehr im Gebiet,
 * fern aller Helden ruhen sie (große Kampfwelt).
 * Aufruf (im Ordner realtime): node test/streifgebiete.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-streif-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/karte"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, AKTIV_WEIT } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
const B = 140, H = 90, R = [20, 15, 100, 75]; /* 80 × 60 Felder */
const zeilen = Array.from({ length: H }, (_, j) => Array.from({ length: B }, (_, i) => (i === 60 && j > 30 && j < 50 ? "T" : ".")).join("")); /* eine Mauer mitten im Gebiet */
const lager = [[30, 20], [40, 60], [60, 25], [80, 50], [90, 70], [55, 45]].map(([x, y], i) => ({ art: "heidewolf", x, y, gruppe: i + 1, streif: R }));
setzeKarte({ zeilen, start: [[130, 85]], lager }, 1);
const s = new Sim("schildwaechter", 1, []); const W = () => s.wesen.filter((w) => !w.held && w.typ === "heidewolf");
const drin = (w) => w.x >= R[0] - 1 && w.x <= R[2] + 1 && w.y >= R[1] - 1 && w.y <= R[3] + 1; /* ein Feld Spiel: Rempeln */
console.log("\nStreifen");
check(W().length === 6 && W().every((w) => w.streif && drin(w)), "sechs Heidewölfe, jeder mit seinem Streifgebiet");
const h = s.wesen.find((w) => w.held); h.x = 135; h.y = 88; /* fern genug für keine Aggro */
const start = W().map((w) => ({ x: w.x, y: w.y })), weg = W().map(() => 0), stets = { ok: true }, ziele = W().map(() => new Set());
for (let t = 0; t < 120 * 20; t++) { const vor = W().map((w) => ({ x: w.x, y: w.y })); s.schritt(); W().forEach((w, i) => { weg[i] += Math.hypot(w.x - vor[i].x, w.y - vor[i].y); if (!drin(w)) { stets.ok = false; } ziele[i].add(Math.floor(w.x / 10) + "," + Math.floor(w.y / 10)); }); }
check(stets.ok, "in zwei Minuten verlässt keiner sein Gebiet");
check(weg.every((d) => d > 15), `alle ziehen umher (Wege ${weg.map((d) => Math.round(d)).join(", ")} Felder)`);
check(ziele.every((z) => z.size >= 3), `jeder kommt weit herum (${ziele.map((z) => z.size).join(", ")} Abschnitte à 10 × 10 Felder)`);
{ const E = W(), d = []; for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) d.push(Math.hypot(E[i].x - E[j].x, E[i].y - E[j].y));
  check(d.filter((x) => x > 12).length >= d.length / 2 && new Set(E.map((w) => Math.round(w.blick * 2))).size >= 3, `kein Rudel: die Tiere sind verteilt und schauen in verschiedene Richtungen (mittlerer Abstand ${Math.round(d.reduce((a, b) => a + b, 0) / d.length)} Felder)`); }
console.log("\nKampf und Wiederkehr");
{ const w = W()[0]; h.max = h.lp = 1e6; h.x = w.x + 1; h.y = w.y; s.eingabe({ t: "auto", an: false }, h.id); lauf(s, 3);
  check(w.zielId === h.id, "kommt ein Held nah, greift der Wolf an wie sonst");
  h.x = 135; h.y = 88; lauf(s, 25); check(!w.zielId && drin(w) && Math.hypot(w.x - w.heim.x, w.y - w.heim.y) < 2, "danach zurück an seine Stelle im Gebiet");
  w.lp = 0; w.tot = true; s["wiederkehr"].push({ w, t: 0.1 }); lauf(s, 1);
  check(!w.tot && drin(w), "die Wiederkehr steht wieder im Gebiet"); }
console.log("\nRuhe fern der Helden");
{ const s2 = new Sim("schildwaechter", 1, []); s2["weltZeit"] = true; const h2 = s2.wesen.find((w) => w.held); h2.x = 135 + AKTIV_WEIT; h2.y = 88 + AKTIV_WEIT;
  const E = s2.wesen.filter((w) => !w.held), v = E.map((w) => w.x + "," + w.y); lauf(s2, 30); check(E.every((w, i) => w.x + "," + w.y === v[i]), "fern aller Helden ruhen sie (keine Bewegung)"); }
console.log(f ? `\nStreifgebiete: ${f} FEHLER` : "\nStreifgebiete: alles in Ordnung");
process.exit(f ? 1 : 0);
