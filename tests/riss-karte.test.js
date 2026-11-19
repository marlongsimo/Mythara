/*
 * Mythara – Rissgänger (Prototyp), Spielart „Karte“: Einstieg, Karte mit dunklen Räumen, durchlaufende Uhr, Erfahrung je Monster,
 * Erbsplitter und Segen aufheben (ein Held muss daneben stehen), Raum verlassen, Teleport bei Ablauf der Zeit (auch aus dem Kampf),
 * Siegelwächterin, Finale ohne Startpunkte.
 * Aufruf: node tests/riss-karte.test.js   (Webserver auf Port 8765)
 */
const { chromium } = require("playwright");
const URL = "http://localhost:8765/spiel.html?schnell&riss=1&risszeit=40";
let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(), fehler = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" })).newPage(); p.on("pageerror", (e) => fehler.push(e.message));
  await p.goto(URL); await p.click("#my-gast-start"); await p.waitForSelector(".dorf-ort"); await p.waitForSelector("#riss-zugang:not([hidden])");
  await p.click("#riss-zugang"); await p.waitForSelector("#riss-helden");
  check(await p.evaluate(() => document.querySelector("#riss-art").value === "karte" && Boolean(document.querySelector("#riss-zeit"))), "Spielart „Karte“ ist die Voreinstellung, die Zeit ist wählbar");
  for (let i = 0; i < 3; i++) await p.click(`#riss-helden [data-held]:nth-child(${i + 1})`);
  await p.click("#riss-los"); await p.waitForSelector("#riss-kampf");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.karte.slice().sort().join() === "boss,schwer,truhe1,truhe2" && Z.bot.karte.join() === Z.karte.join(); }), "Karte gelost (ein schwerer Raum, ein Boss, zwei leichte), für beide Seiten gleich");
  // Kampf vom Rechner-Helfer spielen lassen; hebt: true lässt die Helden nichts von Hand aufheben (nur über das Spiel)
  const spielen = async (bis) => { await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 900; i++) { const e = await p.evaluate((bis) => { const st = window.AB.st; if (!st) return "weg"; if (st.ende) return st.ende; const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render();
      if (bis === "erster" && st.figuren.some((f) => f.seite === "gegner" && f.tp <= 0)) return "erster"; return st.ende; }, bis); if (e) return e; } return null; };
  await p.click("#riss-kampf"); await spielen(); await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer");
  await p.waitForSelector("[data-riss-karte]");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.ich.xp === 100 && Object.values(Z.ich.stufen).every((s) => s === 2) && Z.ich.splitter > 0; }), "Einstieg: 100 Erfahrung, Stufe 2, Erbsplitter eingesammelt");
  check((await p.$$(".rk-raum.dunkel")).length === 4 && (await p.$$(".rk-raum.hell")).length === 1, "Karte: die Mitte leuchtet, vier Räume sind dunkel");
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"); return u && !u.hidden && /0:[0-4]\d/.test(u.textContent); }), "die Uhr läuft, sobald die Karte offen ist");
  // erster Raum: bis zum ersten besiegten Monster, dann prüfen, dass etwas liegt oder aufgehoben wurde; danach verlassen
  await p.click(".rk-raum.dunkel"); await p.waitForSelector("#riss-raus:not([hidden])");
  const vorSplitter = await p.evaluate(() => window.RISS.zustand().ich.splitter);
  await spielen("erster"); await p.waitForTimeout(700);
  const fund = await p.evaluate(() => { const Z = window.RISS.zustand(), D = Z.ich && window.RISS.karteZustand().drops; return { liste: D.liste.length, weg: D.liste.filter((d) => d.weg).length, marken: document.querySelectorAll("#karte rect.feld.riss-drop, #karte rect.feld.riss-drop-segen").length, splitter: Z.ich.splitter }; });
  check(fund.liste >= 1 && fund.marken === fund.liste - fund.weg, `besiegte Monster lassen etwas liegen (${fund.liste} Fund, ${fund.weg} aufgehoben, ${fund.marken} auf der Karte markiert)`);
  check(fund.weg ? fund.splitter >= vorSplitter : fund.splitter === vorSplitter, "Erbsplitter zählen erst, wenn ein Held daneben steht");
  if (await p.evaluate(() => !window.AB.st.ende)) { await p.click("#riss-raus"); await p.click("#riss-raus"); }
  else { await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer"); }
  await p.waitForSelector("[data-riss-karte]", { timeout: 15000 });
  check(await p.evaluate(() => { const Z = window.RISS.zustand(), v = Z.ich.verlauf[1]; return Z.ich.besucht.length === 2 && v.xp > 0 && Z.ich.xp === 100 + v.xp; }), "Raum verlassen: zurück auf der Karte, Erfahrung für die besiegten Monster bleibt, der Raum ist zu");
  check((await p.$$(".rk-raum.dunkel")).length === 3, "der verlassene Raum ist nicht mehr dunkel");
  // zweiter Raum: gewinnen, alles wird eingesammelt
  await p.click(".rk-raum.dunkel"); const e2 = await spielen();
  if (e2 === "sieg") { await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer"); await p.waitForSelector("[data-riss-karte], #riss-waechterin");
    check(await p.evaluate(() => { const r = window.RISS.zustand().log.ich.raeume[2]; return r.sieg && r.liegenGelassen === 0 && (r.splitter > 0 || r.segen.length > 0); }), "gewonnener Raum: Was noch liegt, wird eingesammelt"); }
  // Zeit läuft im nächsten Raum ab: Der Riss holt die Gruppe aus dem Kampf
  if (await p.$("[data-riss-karte] .rk-raum.dunkel")) { await p.click(".rk-raum.dunkel"); await p.waitForSelector("#karte .fig"); }
  await p.waitForSelector("#riss-waechterin", { timeout: 60000 });
  check(await p.evaluate(() => { const Z = window.RISS.zustand(), u = document.querySelector("#riss-uhr"); return (!u || u.hidden) && !window.AB.st && document.getElementById("riss-raus").hidden; }), "Zeit um: Der Riss holt die Gruppe heraus (auch aus dem Kampf), Uhr und Knopf sind weg");
  await p.click("#riss-waechterin"); await p.waitForSelector("[data-riss-laden]");
  await p.evaluate(() => { const Z = window.RISS.zustand(); Z.ich.splitter = 200; }); // für den Test: genug Erbsplitter
  await p.evaluate(() => window.RISS.laden()); await p.waitForSelector("[data-riss-laden] .riss-ding");
  const vor = await p.evaluate(() => { const W = window.RISS.zustand().ich; return { s: W.splitter, segen: W.segen.length }; });
  const segenKnopf = await p.$(".riss-ding.segen:not([disabled])");
  if (segenKnopf) { await segenKnopf.click(); check(await p.evaluate((v) => { const W = window.RISS.zustand().ich; return W.splitter === v.s - 90 && W.segen.length === v.segen + 1; }, vor), "Siegelwächterin: Segen für 90 Erbsplitter gekauft"); }
  await p.click(".riss-ding:not(.segen):nth-child(2)"); await p.waitForSelector(".riss-wer [data-wer]"); await p.click(".riss-wer [data-wer]");
  check(await p.evaluate(() => { const W = window.RISS.zustand().ich; return Object.values(W.traenke).reduce((a, n) => a + n, 0) === 1 && W.kaeufe.some((k) => k.typ === "trank"); }), "Siegelwächterin: Heiltrank für einen Helden gekauft");
  await p.click("#riss-laden-fertig"); await p.waitForSelector("#karte .fig"); await p.waitForSelector("#riss-leiste:not([hidden])");
  const start = await p.evaluate(() => { const Z = window.RISS.zustand(), st = Z.st, K = window.RISS.kern(); const h = K.helden(st, 1); return { P: st.riss.P, frueh: st.riss.frueh, unten: h.every((f) => f.y >= 6), traenke: h.reduce((a, f) => a + ((f.rucksack || []).find((x) => x.id === "heiltrank") || { n: 0 }).n, 0), heilung: st.riss.heilung }; });
  check(start.P[1] === 0 && start.P[2] === 0 && start.frueh === 0 && start.unten, "Finale: beide kommen gleichzeitig an, 0 : 0, jede Gruppe an ihrem Eingang");
  check(start.traenke === 4 && start.heilung === "keine", "der gekaufte Heiltrank ist im Finale dabei; Heilung gibt es nur bei der Wächterin");
  check(!fehler.length, "keine Skriptfehler" + (fehler.length ? ": " + fehler.slice(0, 3).join(" | ") : ""));
  await b.close(); console.log(ok ? "\nRissgänger (Karte): alles in Ordnung" : "\nRissgänger (Karte): FEHLER"); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
