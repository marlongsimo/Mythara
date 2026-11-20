/*
 * Mythara Fabrik – Prüfung der Testszene im Browser: laufen in acht Richtungen, angreifen, blocken, ausweichen, Ausrüstung wechseln.
 * Aufruf (Testserver des Hauptspiels auf Port 8765: „node tools/testserver.js“ im Hauptordner, davor „npm run build“ hier):
 *   node test.mjs [bildordner]
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url); let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = createRequire("/opt/")("playwright")); }
const bilder = process.argv[2] || ""; let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const br = await chromium.launch(), p = await (await br.newContext({ viewport: { width: 1100, height: 700 } })).newPage(), fehler = [];
p.on("pageerror", (e) => fehler.push(String(e))); p.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
await p.goto("http://localhost:8765/fabrik/vorschau/"); await p.waitForFunction(() => window.FABRIK && window.FABRIK.zustand().geladen, null, { timeout: 30000 });
const z = () => p.evaluate(() => window.FABRIK.zustand()), warte = (ms) => p.waitForTimeout(ms), bild = async (n) => { if (bilder) await p.screenshot({ path: `${bilder}/${n}.png` }); };
let s = await z(); check(s.anim === "ruhe" && s.sichtbar.includes("koerper"), "Start: die Figur steht in Ruhe, der Körper ist zu sehen");
check(["waffe.langschwert.vorn", "schild.baum.vorn", "ruestung.brust.platte", "ruestung.bein.schiene", "ruestung.hand.leder", "ruestung.fuss.stiefel"].every((e) => s.sichtbar.includes(e) || e.endsWith(".vorn")), "Anfangsausrüstung liegt als eigene Ebenen auf der Figur");
await bild("1-start");
// acht Richtungen laufen: Taste(n) -> erwartete Zeile (0 = Osten, im Uhrzeigersinn)
const wege = [["d", 0], ["d+s", 1], ["s", 2], ["a+s", 3], ["a", 4], ["a+w", 5], ["w", 6], ["d+w", 7]]; let richtig = 0, bewegt = 0;
for (const [t, r] of wege) { const a = await z(), ks = t.split("+"); for (const k of ks) await p.keyboard.down(k); await warte(350); const b = await z(); for (const k of ks) await p.keyboard.up(k);
  if (b.richtung === r && b.anim === "laufen") richtig++; const dx = b.x - a.x, dy = b.y - a.y, w = Math.atan2(dy, dx), soll = r * Math.PI / 4; if (Math.hypot(dx, dy) > 20 && Math.abs(Math.atan2(Math.sin(w - soll), Math.cos(w - soll))) < 0.2) bewegt++; await warte(60); }
check(richtig === 8, `laufen: alle acht Richtungen wählen die richtige Zeile (${richtig}/8)`); check(bewegt === 8, `laufen: die Figur bewegt sich in Blickrichtung (${bewegt}/8)`);
await warte(250); s = await z(); check(s.anim === "ruhe", "Tasten los: zurück in die Ruhe");
await p.evaluate(() => window.FABRIK.richte(1)); await p.keyboard.press("j"); await warte(150); s = await z(); check(s.anim === "angriff", "J: Einhandangriff beginnt"); await bild("2-angriff"); await warte(700); s = await z(); check(s.anim === "ruhe", "der Angriff endet von selbst in der Ruhe");
await p.keyboard.down("k"); await warte(900); s = await z(); check(s.anim === "block" && s.bild === 5, `K halten: Block bleibt im Haltebild stehen (Bild ${s.bild + 1})`); await bild("3-block"); await p.keyboard.up("k"); await warte(200); s = await z(); check(s.anim === "ruhe", "K los: Block endet");
await p.keyboard.press("l"); await warte(330); s = await z(); check(s.anim === "angriff2h" && !s.sichtbar.some((e) => e.startsWith("schild.")), "L: Zweihandangriff, der Schild ist dabei abgelegt"); await bild("4-zweihand"); await warte(600);
await p.keyboard.press("h"); await warte(120); s = await z(); check(s.anim === "treffer", "H: Trefferbewegung"); await warte(500);
await p.keyboard.press("Space"); await warte(200); s = await z(); check(s.anim === "ausweichen", "Leertaste: Ausweichen"); await bild("5-ausweichen"); await warte(600);
// Ausrüstung wechseln
await p.evaluate(() => window.FABRIK.trage("arm_l", "schild.baum.stahl")); await p.waitForFunction(() => window.FABRIK.zustand().geladen); await warte(150); s = await z();
check(s.sichtbar.some((e) => e.startsWith("schild.baum.stahl.")) && !s.sichtbar.some((e) => e.startsWith("schild.baum.") && !e.startsWith("schild.baum.stahl")), "Schild wechseln: der Stahlschild ersetzt den Wappenschild");
await p.evaluate(() => window.FABRIK.trage("brust", "ruestung.brust.gambeson")); await p.waitForFunction(() => window.FABRIK.zustand().geladen); await warte(150); s = await z();
check(s.sichtbar.includes("ruestung.brust.gambeson") && !s.sichtbar.includes("ruestung.brust.platte"), "Brust wechseln: Gambeson statt Platte"); await bild("6-andere-ausruestung");
for (const platz of ["hand_r", "arm_l", "brust", "bein", "hand", "fuss"]) await p.evaluate((q) => window.FABRIK.trage(q, ""), platz); await warte(300); s = await z();
check(s.sichtbar.length === 1 && s.sichtbar[0] === "koerper", "alles ablegen: nur der Körper bleibt"); await bild("7-ohne-alles");
await p.keyboard.down("d"); await warte(300); s = await z(); await p.keyboard.up("d"); check(s.anim === "laufen", "auch ohne Ausrüstung läuft die Figur");
await p.selectOption('select[data-platz="hand_r"]', "waffe.langschwert"); await p.waitForFunction(() => window.FABRIK.zustand().geladen); await warte(200); s = await z(); check(s.tragen.hand_r === "waffe.langschwert", "Auswahl in der Tafel legt das Schwert wieder an");
check(fehler.length === 0, "keine Fehler im Browser" + (fehler.length ? " – " + fehler[0] : "")); await br.close();
console.log(ok ? "\nTestszene: alles in Ordnung" : "\nTestszene: FEHLER"); process.exit(ok ? 0 : 1);
