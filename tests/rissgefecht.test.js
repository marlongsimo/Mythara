/*
 * Rissgefecht (Echtzeit-Versuch): eine ganze Partie vom Rechner durchspielen lassen und die Regeln des Formats prüfen.
 * Aufruf: node tests/rissgefecht.test.js [Partien]   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright");
const N = +process.argv[2] || 3;
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };

(async () => {
  const b = await chromium.launch(), stat = { siege: [0, 0], runden: 0, dauer: 0, gruende: {}, seite: [0, 0], stufen: [], entscheidung: 0 };
  for (let i = 0; i < N; i++) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
    await p.goto(`http://localhost:8765/rissgefecht.html?auto=1&seed=${1000 + i * 77}`); await p.waitForFunction(() => window.RG && window.RG.S.phase === "runde");
    if (i === 0) {
      check(await p.evaluate(() => { const S = window.RG.S; return S.helden.length === 6 && S.helden.every((h) => h.stufe === 1 && h.lp === h.max) && S.es[0] === window.RG.K.START_ES && S.es[1] === S.es[0]; }), "Start: sechs Helden auf Stufe 1, beide Teams mit gleichem Budget");
      check(await p.evaluate(() => { const M = window.RG.MAUERN, W = 1600, H = 1000; return M.every((m) => M.some((o) => Math.abs(o[0] - (W - m[0] - m[2])) < 1 && Math.abs(o[1] - (H - m[1] - m[3])) < 1 && o[2] === m[2] && o[3] === m[3])); }), "die Karte ist punktsymmetrisch (beide Seiten gleich)");
      // nach fünf Runden: Seitenwechsel und voller Neustart
      const halb = await p.evaluate(() => { const RG = window.RG, S = RG.S; let n = 0; while (S.log.runden.length < 5 && n++ < 4000) RG.vor(1); const vorher = S.log.runden[4];
        return { runden: S.log.runden.length, phase: S.phase, seiten: S.seiten.join(), stufen: S.helden.map((h) => h.stufe).join(), xp: S.helden.reduce((a, h) => a + h.xp, 0), voll: S.helden.every((h) => h.lp === h.max && !h.tot && h.trank === 0), es: S.es.join(), stand: S.stand[0] + S.stand[1], stufenVor: vorher.helden.map((h) => h.stufe) }; });
      check(halb.runden === 5 && halb.stand === 5, "nach fünf Runden steht der Rundenstand bei zusammen 5");
      check(halb.seiten === "1,0" && halb.stufen === "1,1,1,1,1,1" && halb.xp === 0 && halb.voll, "Seitenwechsel: Seiten getauscht, alle wieder Stufe 1 ohne Erfahrung, volles Leben, keine Tränke");
      check(halb.es.split(",").every((x) => +x <= 40), "Seitenwechsel: Erbsplitter zurück auf das Startbudget (abzüglich der Käufe des Rechners)");
      check(Math.max(...halb.stufenVor) >= 2, `innerhalb der Halbzeit steigen Helden auf (höchste Stufe nach Runde 5: ${Math.max(...halb.stufenVor)})`);
    }
    const e = await p.evaluate(() => { const RG = window.RG, S = RG.S; let n = 0; while (S.phase !== "ende" && n++ < 9000) RG.vor(1); return { phase: S.phase, log: S.log, stand: S.stand }; });
    const L = e.log;
    if (i === 0) {
      check(e.phase === "ende" && L.runden.length >= 10 && L.runden.length <= 11, `die Partie endet nach zehn Runden oder einer Entscheidungsrunde (${L.runden.length} Runden, ${e.stand.join(" : ")})`);
      check(e.stand[0] !== e.stand[1] && e.stand[0] + e.stand[1] === L.runden.length, "es gibt einen Sieger, jede Runde zählt genau einmal");
      check(L.runden.every((r) => r.dauer <= 101 && r.einkommen.every((x) => x >= 35) && r.helden.length === 6), "jede Runde: höchstens 100 Sekunden, beide Teams bekommen Einkommen, alles steht in der Mitschrift");
      const serie = L.runden.find((r, k) => k > 0 && k !== 5 && L.runden[k - 1].sieger === r.sieger && r.serieBonus > 0);
      check(!L.runden.some((r, k) => k > 0 && k !== 5 && k !== 10 && L.runden[k - 1].sieger === r.sieger) || Boolean(serie), "wer zweimal in Folge verliert, bekommt den Serienbonus");
      check(await p.evaluate(() => !document.querySelector("#rg-fenster").hidden && /Sieg|Niederlage/.test(document.querySelector("#rg-fenster h1").textContent) && Boolean(document.querySelector("#rg-kopie"))), "am Ende steht das Ergebnis mit Mitschrift zum Kopieren");
    }
    check(fehler.length === 0, `Partie ${i + 1}: keine Skriptfehler` + (fehler.length ? " – " + fehler[0] : ""));
    (stat.staende = stat.staende || []).push(e.stand.join(":"));
    stat.siege[L.sieger]++; stat.runden += L.runden.length; if (L.runden.length > 10) stat.entscheidung++;
    for (const r of L.runden) { stat.dauer += r.dauer; stat.gruende[r.grund] = (stat.gruende[r.grund] || 0) + 1; stat.seite[r.seiten[r.sieger]]++; }
    for (const k of [4, 9]) if (L.runden[k]) stat.stufen.push(...L.runden[k].helden.map((h) => h.stufe));
    await p.close();
  }
  // von Hand steuerbar? Ein Held ohne Rechner, Tasten bewegen ihn
  { const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
    await p.goto("http://localhost:8765/rissgefecht.html?seed=5&held=schildwaechter"); await p.waitForSelector("#rg-los");
    check((await p.$$(".rg-held")).length === 4 && await p.evaluate(() => document.querySelector(".rg-held.an").dataset.held === "schildwaechter"), "Startseite: vier Helden zur Wahl, die Vorauswahl ist markiert");
    await p.click('[data-held="elementarist"]'); await p.click("#rg-los"); await p.waitForFunction(() => window.RG.S.phase === "runde");
    const x0 = await p.evaluate(() => window.RG.S.ich.x); await p.keyboard.down("d"); await p.waitForTimeout(700); await p.keyboard.up("d");
    const nach = await p.evaluate(() => ({ x: window.RG.S.ich.x, bot: window.RG.S.ich.bot, typ: window.RG.S.ich.typ, andere: window.RG.S.helden.filter((h) => h.bot).length }));
    check(!nach.bot && nach.typ === "elementarist" && nach.andere === 5 && nach.x > x0 + 60, `du steuerst einen Helden (Taste D: ${Math.round(nach.x - x0)} Pixel nach rechts), die anderen fünf der Rechner`);
    await p.mouse.move(900, 400); await p.mouse.down(); await p.waitForTimeout(300); await p.mouse.up();
    check(await p.evaluate(() => window.RG.S.ich.cdA > 0 || window.RG.S.geschosse.length > 0), "Maustaste: der Held greift in Zielrichtung an");
    await p.waitForFunction(() => window.RG.S.ich.cdQ === 0, null, { timeout: 5000 }); await p.keyboard.press("q"); await p.waitForTimeout(150); check(await p.evaluate(() => window.RG.S.ich.cdQ > 5), "Taste Q löst die Fähigkeit aus, danach läuft die Abklingzeit");
    await p.screenshot({ path: process.env.RG_BILD || "/dev/null" }).catch(() => {});
    check(fehler.length === 0, "von Hand: keine Skriptfehler" + (fehler.length ? " – " + fehler[0] : "")); await p.close(); }
  // Handy im Querformat: Feld füllt den Bildschirm, Kamera folgt, Angriffsknopf zielt von selbst
  { const k = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), p = await k.newPage(); const fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
    await p.goto("http://localhost:8765/rissgefecht.html?seed=9&handy=1"); await p.waitForSelector("#rg-los");
    await p.tap('[data-held="schildwaechter"]'); await p.tap("#rg-los"); await p.waitForFunction(() => window.RG.S.phase === "runde");
    await p.waitForFunction(() => !document.querySelector("#rg-tasten").hidden, null, { timeout: 3000 }).catch(() => {});
    check(await p.evaluate(() => { const c = document.querySelector("#rg-feld").getBoundingClientRect(), t = document.querySelector("#rg-tasten"); return window.RG.HANDY && Math.round(c.width) === innerWidth && Math.round(c.height) === innerHeight && !t.hidden && getComputedStyle(t).display !== "none" && window.RG.KAM.z > 1; }), "Handy quer: Das Feld füllt den ganzen Bildschirm, die Knöpfe sind da, die Kamera ist nah am Helden");
    // Steuerknüppel: Finger aufs Feld, nach rechts ziehen
    const x0 = await p.evaluate(() => window.RG.S.ich.x); const cdp = await k.newCDPSession(p);
    const finger = (typ, x, y) => cdp.send("Input.dispatchTouchEvent", { type: typ, touchPoints: typ === "touchEnd" ? [] : [{ x, y, id: 1 }] });
    await finger("touchStart", 150, 250); await finger("touchMove", 210, 250); await p.waitForTimeout(600);
    check(await p.evaluate(() => !document.querySelector("#rg-stick").hidden), "wo der Finger liegt, erscheint der Steuerknüppel"); await finger("touchEnd");
    check(await p.evaluate((v) => window.RG.S.ich.x > v + 50, x0), "Knüppel nach rechts: der Held läuft nach rechts");
    // Torvald macht Schaden: Gegner in die Nähe stellen, Angriffsknopf halten – er läuft heran und schlägt zu
    const erg = await p.evaluate(async () => { const S = window.RG.S, h = S.ich, g = S.helden.find((o) => o.team === 1); for (const o of S.helden) if (o !== h && o !== g) { o.x = o.team === 0 ? 100 : 1500; o.y = 900; o.bot = false; } g.bot = false; g.x = h.x + 190; g.y = h.y; const lp = g.lp;
      const a = document.querySelector("#rg-angriff"); a.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 7, clientX: 760, clientY: 320, bubbles: true })); await new Promise((r) => setTimeout(r, 1800)); a.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, bubbles: true }));
      return { schaden: Math.round(lp - g.lp), abstand: Math.round(Math.hypot(g.x - h.x, g.y - h.y)), ziel: Boolean(S.autoZiel) }; });
    check(erg.schaden > 0 && erg.abstand < 120, `Angriffsknopf halten: Torvald läuft von selbst an den Gegner heran und trifft (${erg.schaden} Schaden, Abstand ${erg.abstand})`);
    await p.screenshot({ path: process.env.RG_HANDY || "/dev/null" }).catch(() => {});
    check(fehler.length === 0, "Handy: keine Skriptfehler" + (fehler.length ? " – " + fehler[0] : "")); await k.close(); }
  await b.close();
  const st = {}; for (const s of stat.stufen) st[s] = (st[s] || 0) + 1;
  console.log(`\n${N} Rechnerpartien: Team A ${stat.siege[0]} : ${stat.siege[1]} Team B · Runden Ø ${(stat.runden / N).toFixed(1)} (Entscheidungsrunde in ${stat.entscheidung}) · Rundendauer Ø ${(stat.dauer / stat.runden).toFixed(0)} s`);
  console.log(`Endstände: ${stat.staende.join(" · ")}`);
  console.log(`Rundensiege nach Seite – links ${stat.seite[0]} : ${stat.seite[1]} rechts · Gründe ${JSON.stringify(stat.gruende)}`);
  console.log(`Stufen am Ende einer Halbzeit: ${Object.keys(st).map((k) => `Stufe ${k}: ${st[k]}`).join(" · ")}`);
  console.log(ok ? "\nRissgefecht: alles in Ordnung" : "\nRissgefecht: FEHLER"); process.exit(ok ? 0 : 1);
})();
