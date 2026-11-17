/*
 * Mythara – Neuigkeiten vom Game Developer: Megafon im Dorfkopf statt des Händler-Symbols, Fenster, Punkt für Ungelesenes.
 * Aufruf: node tests/neuigkeiten.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const BASE = "http://localhost:8765"; let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: "block" }), p = await ctx.newPage(), fehler = []; p.on("pageerror", (e) => fehler.push(e.message));
  let meldungen = [{ id: "a1", datum: "2026-11-10", art: "balance", titel: "Grau läuft kürzer", text: "Erster Absatz.\n\n- Punkt eins\n- Punkt zwei", link: { text: "Zum Händler", hub: "shop" } }, { id: "a2", datum: "2026-11-12", art: "held", titel: "Neue Heldin <b>", text: "Bald." }];
  await p.route(/supabase\.co/, (r) => r.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ code: "PGRST202", message: "x" }) }));
  await p.route(/daten\/neuigkeiten\.json/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(meldungen) }));
  console.log("Neuigkeiten");
  const echt = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "daten", "neuigkeiten.json"), "utf8"));
  check(Array.isArray(echt) && echt.length >= 1 && echt.every((x) => x.id && /^\d{4}-\d{2}-\d{2}$/.test(x.datum) && x.titel && x.text) && new Set(echt.map((x) => x.id)).size === echt.length, "Die echte Datei ist gültig: jede Meldung mit eindeutiger Kennung, Datum, Titel und Text");
  await p.goto(BASE + "/spiel.html?schnell"); await p.click("#my-gast-start"); await p.waitForSelector("#hub-funk");
  await p.waitForFunction(() => document.querySelector("#hub-funk").classList.contains("neu"), null, { timeout: 8000 }).catch(() => {});
  const k = await p.evaluate(() => ({ shop: Boolean(document.querySelector("#hub-shop")), zahl: document.querySelector("#hub-funk .hub-zahl").textContent, sichtbar: !document.querySelector("#hub-funk .hub-zahl").hidden, haendler: Boolean(document.querySelector('.dorf-ort[data-hub="shop"]')) }));
  check(!k.shop && k.sichtbar && k.zahl === "2" && k.haendler, "Im Dorfkopf steht das Megafon statt des Händler-Symbols, mit „2“ für zwei ungelesene Meldungen; der Händler bleibt im Dorf erreichbar");
  await p.click("#hub-funk"); await p.waitForSelector(".funk-meldung");
  const f = await p.evaluate(() => ({ titel: [...document.querySelectorAll(".funk-meldung h3")].map((e) => e.textContent), neu: document.querySelectorAll(".funk-meldung.neu").length, von: document.querySelector(".funk-von").textContent, liste: document.querySelectorAll(".funk-meldung li").length, html: document.querySelector(".funk").innerHTML, art: document.querySelector(".funk-art").textContent }));
  check(f.titel.join("|") === "Neue Heldin <b>|Grau läuft kürzer" && f.neu === 2 && /Game Developer · 12\.11\.2026/.test(f.von) && f.art === "Neuer Held" && f.liste === 2 && !/<b>/.test(f.html.replace(/<b class|<\/?b>(?=Game)/g, "")), "Das Fenster zeigt die Meldungen, die neueste zuerst, als „Game Developer“ mit Datum und Art; Listen werden gesetzt, fremdes HTML nicht ausgeführt");
  check(await p.evaluate(() => document.querySelector("#hub-funk .hub-zahl").hidden && !document.querySelector("#hub-funk").classList.contains("neu")), "Nach dem Öffnen ist der Punkt weg");
  await p.click("[data-funk-hub]"); await p.waitForSelector("[data-shop], .shop-bald", { timeout: 8000 }).catch(() => {});
  check(await p.evaluate(() => Boolean(document.querySelector("[data-shop], .shop-bald")) && document.querySelector("#qr-overlay").hidden), "Der Knopf in einer Meldung führt ans Ziel (hier: zum Händler)");
  await p.reload(); await p.waitForSelector("#hub-funk"); await p.waitForTimeout(800);
  check(await p.evaluate(() => document.querySelector("#hub-funk .hub-zahl").hidden), "Nach dem Neuladen bleibt Gelesenes gelesen");
  meldungen = meldungen.concat([{ id: "a3", datum: "2026-11-20", art: "roadmap", titel: "Was kommt", text: "Bald mehr." }]);
  await p.reload(); await p.waitForSelector("#hub-funk"); await p.waitForFunction(() => document.querySelector("#hub-funk").classList.contains("neu"), null, { timeout: 8000 }).catch(() => {});
  check(await p.evaluate(() => document.querySelector("#hub-funk .hub-zahl").textContent === "1" && !document.querySelector("#hub-funk .hub-zahl").hidden), "Eine neue Meldung bringt den Punkt zurück („1“)");
  await p.click("#hub-funk"); await p.waitForSelector(".funk-meldung");
  check(await p.evaluate(() => document.querySelectorAll(".funk-meldung.neu").length === 1 && document.querySelector(".funk-meldung.neu h3").textContent === "Was kommt" && document.documentElement.scrollWidth <= innerWidth), "Nur die neue Meldung ist als „neu“ markiert; alles passt in Handybreite");
  if (process.env.SHOT_DIR) await p.screenshot({ path: process.env.SHOT_DIR + "/neuigkeiten.png" });
  check(!fehler.length, "keine Skriptfehler" + (fehler.length ? ": " + fehler.join(" | ") : ""));
  await b.close(); console.log(ok ? "\nNEUIGKEITEN IN ORDNUNG" : "\nNEUIGKEITEN: FEHLER"); process.exit(ok ? 0 : 1);
})();
