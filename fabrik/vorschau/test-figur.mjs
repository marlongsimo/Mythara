/*
 * Mythara Fabrik – Prüfung der Testszene für eine beliebige Figur: Start, laufen in acht Richtungen, die vorhandenen Taten, jedes Ausrüstungsteil an- und ablegen.
 * (test.mjs prüft den Krieger mit allen Kampfbewegungen; dieser Test richtet sich nach den Metadaten der Figur.)
 * Aufruf (Testserver des Hauptspiels auf Port 8765, davor „npm run build“ hier):
 *   node test-figur.mjs <figur> <version> [bildordner]          z. B. node test-figur.mjs gegner.bandit v001
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const [figur = "gegner.bandit", version = "v001", bilder = ""] = process.argv.slice(2); let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const br = await chromium.launch(), p = await (await br.newContext({ viewport: { width: 1100, height: 700 } })).newPage(), fehler = [];
p.on("pageerror", (e) => fehler.push(String(e))); p.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
await p.goto(`http://localhost:8765/fabrik/vorschau/?figur=${figur}&version=${version}`); await p.waitForFunction(() => window.FABRIK && window.FABRIK.zustand().geladen, null, { timeout: 30000 });
const z = () => p.evaluate(() => window.FABRIK.zustand()), warte = (ms) => p.waitForTimeout(ms), bild = async (n) => { if (bilder) await p.screenshot({ path: `${bilder}/${n}.png` }); };
const meta = await p.evaluate(() => window.FABRIK.szene.meta); console.log(`${meta.id} · ${version} · Bewegungen: ${Object.keys(meta.animationen).join(", ")}`);
let s = await z(); const plaetze = Object.keys(meta.plaetze);
check(s.anim === "ruhe" && s.sichtbar.includes("koerper"), "Start: die Figur steht in Ruhe, der Körper ist zu sehen");
check(plaetze.every((q) => s.tragen[q] && s.sichtbar.some((e) => e === s.tragen[q] || e.startsWith(s.tragen[q] + "."))), `Anfangsausrüstung: alle ${plaetze.length} Plätze belegt, jedes Teil als eigene Ebene sichtbar (${plaetze.join(", ")})`);
await bild("1-start");
const wege = [["d", 0], ["d+s", 1], ["s", 2], ["a+s", 3], ["a", 4], ["a+w", 5], ["w", 6], ["d+w", 7]]; let richtig = 0, bewegt = 0;
for (const [t, r] of wege) { const a = await z(), ks = t.split("+"); for (const k of ks) await p.keyboard.down(k); await warte(350); const b = await z(); for (const k of ks) await p.keyboard.up(k);
  if (b.richtung === r && b.anim === "laufen") richtig++; const dx = b.x - a.x, dy = b.y - a.y, w = Math.atan2(dy, dx), soll = r * Math.PI / 4; if (Math.hypot(dx, dy) > 20 && Math.abs(Math.atan2(Math.sin(w - soll), Math.cos(w - soll))) < 0.2) bewegt++; await warte(60); }
check(richtig === 8, `laufen: alle acht Richtungen wählen die richtige Zeile (${richtig}/8)`); check(bewegt === 8, `laufen: die Figur bewegt sich in Blickrichtung (${bewegt}/8)`);
await warte(250); s = await z(); check(s.anim === "ruhe", "Tasten los: zurück in die Ruhe"); await bild("2-gelaufen");
await p.keyboard.press("j"); await warte(150); s = await z(); check(s.anim === "ruhe", "Taten, die die Figur noch nicht hat (hier: Angriff), werden übergangen – kein Fehler");
// jedes Teil einzeln ab- und wieder anlegen, Varianten durchschalten
let einzeln = 0, varianten = 0, n = 0;
for (const q of plaetze) { const vorher = (await z()).tragen[q];
  await p.evaluate((q) => window.FABRIK.trage(q, ""), q); await warte(120); s = await z(); if (!s.sichtbar.some((e) => e === vorher || e.startsWith(vorher + "."))) einzeln++;
  for (const t of meta.plaetze[q]) { n++; await p.evaluate(([q, t]) => window.FABRIK.trage(q, t), [q, t]); await p.waitForFunction(() => window.FABRIK.zustand().geladen); await warte(120); s = await z();
    if (s.sichtbar.some((e) => e === t || e.startsWith(t + ".")) && meta.plaetze[q].filter((u) => u !== t).every((u) => !s.sichtbar.some((e) => e === u || e.startsWith(u + ".")))) varianten++; }
  await p.evaluate(([q, t]) => window.FABRIK.trage(q, t), [q, vorher]); await warte(80); }
check(einzeln === plaetze.length, `jedes Teil lässt sich einzeln ablegen, die übrigen bleiben (${einzeln}/${plaetze.length})`);
check(varianten === n, `jede Variante eines Platzes ersetzt die andere (${varianten}/${n})`);
const zweite = plaetze.find((q) => meta.plaetze[q].length > 1); if (zweite) { await p.evaluate(([q, t]) => window.FABRIK.trage(q, t), [zweite, meta.plaetze[zweite][1]]); await warte(300); await bild("3-variante"); }
for (const q of plaetze) await p.evaluate((q) => window.FABRIK.trage(q, ""), q); await warte(300); s = await z();
check(s.sichtbar.length === 1 && s.sichtbar[0] === "koerper", "alles ablegen: nur der Körper bleibt"); await bild("4-ohne-alles");
check(fehler.length === 0, "keine Fehler im Browser" + (fehler.length ? " – " + fehler[0] : "")); await br.close();
console.log(ok ? "\nTestszene: alles in Ordnung" : "\nTestszene: FEHLER"); process.exit(ok ? 0 : 1);
