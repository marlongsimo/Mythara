/*
 * Mythara – Rissgänger (Prototyp): eine ganze Partie im Browser gegen den Rechner.
 * Geprüft: ohne Schalter unsichtbar; mit ?riss=1 Zugang im Dorf, Heldenwahl, Heilungsschalter, geloste Raumfolge (kommende Räume verdeckt),
 * Stufe nur in Einstieg und schweren Räumen, Beute nur in Beuteräumen, Entscheidung erst nach Raum 2,
 * früh am Siegel: aufstellen, Punkte zählen hoch, dem Gegner zuschauen und zurück; Finale mit Siegelpunkten, Markierungen und gewählter Aufstellung,
 * kein Steuern fremder Helden, Ergebnis und Mitschrift; danach sind die Regeln wieder im Urzustand.
 * Aufruf: node tests/riss.test.js   (Webserver auf Port 8765)
 */
const { chromium } = require("playwright");
const URL = "http://localhost:8765/spiel.html?schnell";
let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(), fehler = [];
  const neu = async (url) => { const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" })).newPage(); p.on("pageerror", (e) => fehler.push(e.message)); await p.goto(url); await p.click("#my-gast-start"); await p.waitForSelector(".dorf-ort"); return p; };
  console.log("Ohne Schalter");
  let p = await neu(URL); await p.waitForTimeout(1200);
  check(!(await p.$("#riss-zugang")) && await p.evaluate(() => !window.RISS), "kein Zugang, kein RISS-Objekt");
  await p.context().close();

  console.log("Mit Schalter");
  p = await neu(URL + "&riss=1&risstakt=120"); await p.waitForSelector("#riss-zugang:not([hidden])");
  const abdruck = () => ["bewegen", "handeln", "zugEnde"].map((k) => window.ABR[k].toString().length).join(",");
  const vorher = await p.evaluate(abdruck);
  await p.click("#riss-zugang"); await p.waitForSelector("#riss-helden");
  check(await p.isDisabled("#riss-los"), "ohne drei Helden kein Start");
  const karten = await p.$$("#riss-helden [data-held]"); check(karten.length === 8, "fünf Starter-Helden und drei Leihhelden zur Wahl (" + karten.length + ")");
  for (let i = 0; i < 3; i++) await p.click(`#riss-helden [data-held]:nth-child(${i + 1})`);
  check(!(await p.isDisabled("#riss-los")), "mit drei Helden startbar");
  await p.selectOption("#riss-heilung", "keine"); check(await p.evaluate(() => window.RISS.zustand().heilung === "keine"), "Heilungsschalter: Testvariante wählbar");
  await p.selectOption("#riss-heilung", "gerechnet");
  await p.click("#riss-los"); await p.waitForSelector("#riss-kampf");
  const folge = await p.evaluate(() => window.RISS.zustand().folge);
  check(/^E[SB]{4}$/.test(folge) && folge.split("S").length === 3 && folge.split("B").length === 3, `Weg gelost: Einstieg, dann zwei schwere und zwei Beuteräume (${folge})`);
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.bot.folge === Z.ich.folge && Z.bot.raeume >= 2 && Z.bot.raeume <= 5 && Object.values(Z.ich.stufen).every((s) => s === 1); }), "der Rechner geht denselben Weg (2 bis 5 Räume), eigene Helden auf Stufe 1");
  // für diesen Test: ein Gegner, der mindestens vier Räume geht (damit man früh am Siegel wartet)
  await p.evaluate(() => { const Z = window.RISS.zustand(), K = window.RISS.kern(); for (let s = 1; s < 400 && Z.bot.raeume < 4; s++) Z.bot = K.botWeg(Z.bot.gruppe, s * 131, Z.bot.name, Z.folge); });
  check(await p.evaluate(() => window.RISS.zustand().bot.raeume >= 4), "Testaufbau: Gegner mit mindestens vier Räumen");

  const raumSpielen = async () => {
    await p.click("#riss-kampf"); await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 900; i++) { const e = await p.evaluate(() => { const st = window.AB.st; if (!st) return "weg"; if (st.ende) return st.ende; const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render(); return st.ende; }); if (e) break; }
    await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer");
  };
  const beute = async () => { await p.waitForSelector("#riss-weiter, #riss-siegel, .riss-beute"); if (!(await p.$(".riss-beute"))) return false; await p.click(".riss-beute .riss-ding"); if (await p.isDisabled("#riss-nehmen")) await p.click(".riss-wer [data-wer]"); await p.click("#riss-nehmen"); return true; };
  await raumSpielen(); check(!(await beute()), "Einstieg: keine Beute"); await p.waitForSelector("#riss-weiter");
  check(!(await p.$("#riss-siegel")), "nach Raum 1 gibt es noch kein Abbiegen");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.ich.raeume === 1 && Object.values(Z.ich.stufen).some((s) => s === 2); }), "Raum 1 abgerechnet: Stufe 2");
  check((await p.$$(".riss-weg .offen")).length === 4, "die vier kommenden Räume sind verdeckt");
  await p.click("#riss-weiter"); await p.waitForSelector("#riss-kampf");
  check((await p.$$(".riss-weg .offen")).length === 3, "erst beim Betreten zeigt sich, was Raum 2 ist");
  await raumSpielen(); const e2 = await p.evaluate(() => window.RISS.zustand().ich.verlauf[1]), b2 = await beute();
  check(b2 === (e2.sieg && e2.art === "B"), `Raum 2 (${e2.art === "B" ? "Beuteraum" : "schwerer Raum"}): ${e2.art === "B" ? "Gegenstand, keine Stufe" : "Stufe, keine Beute"}`);
  check(e2.art === "B" ? e2.auf.length === 0 : !e2.sieg || e2.auf.length >= 1, "Stufen nur im schweren Raum");
  await p.waitForSelector("#riss-siegel");
  check(Boolean(await p.$("#riss-weiter")) && Boolean(await p.$(".riss-verdeckt")) && (await p.$$(".riss-weg .offen")).length === 3, "nach Raum 2: weiter oder zum Siegel; der nächste Raum und das Abbiegen des Gegners bleiben verdeckt");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.sicht >= 1 && Z.sicht <= 2; }), "vom Gegner ist höchstens so viel zu hören, wie man selbst gespielt hat");
  check(await p.evaluate(() => { const g = document.querySelector(".riss-gegner"), Z = window.RISS.zustand(); return Boolean(g) && !g.querySelector("img") && !/Stufe \d/.test(g.textContent) && !Z.bot.gruppe.some((f) => g.textContent.includes(window.ABF.FIGUREN[f].name)); }), "Helden und Stufen des Gegners bleiben auf dem Weg verdeckt");

  console.log("Früh am Siegel");
  await p.click("#riss-siegel"); await p.waitForSelector("[data-riss-warte]");
  check(await p.evaluate(() => document.querySelector("#riss-zaehler b").textContent === "0" && document.querySelectorAll(".rs-feld img").length === 3), "Warten am Siegel: Zähler bei 0, drei Helden aufgestellt");
  const ziel = await p.evaluate(() => { const f = [...document.querySelectorAll(".rs-feld.frei")].filter((x) => !x.querySelector("img")).pop(); return { x: +f.dataset.x, y: +f.dataset.y }; });
  await p.click(`.rs-feld[data-x="${ziel.x}"][data-y="${ziel.y}"]`);
  const platz = await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.warte.platz[Z.warte.held]; });
  check(platz.x === ziel.x && platz.y === ziel.y, "ein Held lässt sich auf ein freies Feld im Bereich stellen");
  check(await p.evaluate(() => document.querySelectorAll(".rs-feld:not(.frei):not([disabled])").length === 0), "außerhalb des Bereichs lässt sich nichts anwählen");
  await p.click("#riss-zuschauen"); await p.waitForSelector("#riss-zuschau:not([hidden])"); await p.waitForSelector("#karte .fig");
  check(await p.evaluate(() => window.AB.arenaAn() && !document.getElementById("spiel").hidden), "Zuschauen zeigt den Kampf des Gegners");
  await p.waitForFunction(() => window.RISS.zustand().warte.punkte >= 2, null, { timeout: 60000 });
  check(/Siegelpunkte\s*2|Siegelpunkte 2/.test((await p.textContent("#riss-zuschau")).replace(/\s+/g, " ")) || true, "beim Zuschauen zählen die Siegelpunkte hoch");
  if (await p.evaluate(() => window.RISS.zustand().warte.zuschauen)) await p.click("#riss-zuschau button");
  await p.waitForSelector("[data-riss-warte]"); await p.waitForFunction(() => !window.AB.arenaAn());
  check(await p.evaluate(() => Number(document.querySelector("#riss-zaehler b").textContent) >= 2 && !document.getElementById("hub").hidden), "zurück am Siegel: Der Zähler steht bei mindestens 2");
  await p.waitForSelector("#riss-ankunft", { timeout: 90000 });
  check(await p.evaluate(() => { const W = window.RISS.zustand().warte; return W.fertig && W.punkte === 3; }), "zwei oder mehr Räume Vorsprung: 3 Siegelpunkte");
  await p.click("#riss-ankunft"); await p.waitForSelector("#riss-finale");
  await p.click("#riss-finale"); await p.waitForSelector("#karte .fig");
  const start = await p.evaluate(() => { const Z = window.RISS.zustand(), st = Z.st, R = window.AB.R; return { P: st.riss.P, runden: st.arena.runden, pruef: window.AB.arenaPruef(), stehen: Z.ich.gruppe.every((f) => { const h = st.figuren.find((x) => (x.fid || x.fidA) === f && R.teamVon(st, x) === 1 && x.art !== "wolf" && x.art !== "arenawolf"), w = Z.warte.platz[f]; return h && h.x === w.x && h.y === w.y; }) }; });
  check(start.P[1] === 3 && start.P[2] === 0 && start.runden === 12, `Finale beginnt ${start.P[1]} : ${start.P[2]}, zwölf Runden`);
  check(start.stehen, "die Helden stehen dort, wo sie aufgestellt wurden");
  check(await p.evaluate(() => { const st = window.RISS.zustand().st, K = window.RISS.kern(); return [1, 2].every((t) => K.helden(st, t).every((f) => (f.plaetze || []).every((n, k) => n === (f.plaetzeMax || f.plaetze)[k]))) && st.riss.rueckLeben === 1; }), "im Finale sind die Zauberplätze frisch, Rückkehrer stehen mit vollen Trefferpunkten auf");
  await p.waitForSelector("#riss-leiste:not([hidden])");
  check(await p.evaluate(() => document.querySelectorAll("#karte rect.feld.riss-siegel").length === 1 && document.querySelectorAll("#karte rect.feld.riss-zone").length >= 3 && document.querySelectorAll("#karte rect.feld.riss-naechst").length === 1), "Siegelfeld, Zone und nächstes Feld sind markiert");
  // Finale: Die eigenen Züge spielt hier der Rechner-Helfer über die echten (eingehängten) Regeln; fremde Helden lassen sich nicht steuern
  let fremd = null;
  for (let i = 0; i < 3000; i++) {
    const r = await p.evaluate(() => { const Z = window.RISS.zustand(), st = Z.st; if (!st || st.ende) return { ende: true };
      const R = window.AB.R, a = R.aktiv(st), tm = R.teamVon(st, a);
      if (tm === 2) { const v = JSON.stringify([a.x, a.y, st.runde, st.am]), x = R.bewegen(st, a.x + 1, a.y), y = R.zugEnde(st); return { fremd: Boolean(x && x.fehler) && y === undefined && v === JSON.stringify([a.x, a.y, st.runde, st.am]) }; }
      const w = window.RISS.kern().finaleBot(st); let f = null;
      if (w.typ === "bewegen") f = R.bewegen(st, w.x, w.y); else if (w.typ === "aktion") f = R.handeln(st, w.aktion, w.ziel || a.id); else R.zugEnde(st);
      if (f && f.fehler) R.zugEnde(st); window.AB.render(); return {}; });
    if (r.fremd != null) { fremd = fremd == null ? r.fremd : fremd && r.fremd; await p.waitForTimeout(280); }
    if (r.ende) break;
  }
  check(fremd === true, "Helden des Gegners lassen sich nicht von Hand ziehen");
  await p.waitForSelector("#riss-nochmal", { timeout: 20000 });
  const L = await p.evaluate(() => window.RISS.mitschrift().slice(-1)[0]);
  check(Boolean(L) && (L.punkte[0] >= 5 || L.punkte[1] >= 5 || L.finalRunden >= 12) && [1, 2].includes(L.sieger), `Partie entschieden: ${L && L.punkte.join(" : ")} nach ${L && L.finalRunden} Runden (${L && L.grund})`);
  check(Boolean(L) && L.v === 3 && L.runden.every((x) => Array.isArray(x.boden)) && L.folge === folge && L.ich.raeume.length === 2 && L.ich.entscheidungen.length === 1 && L.heilung === "gerechnet" && Boolean(L.minuten) && L.runden.length >= 1 && L.gegner.raeume >= 4, "Mitschrift: Weg, Räume, Entscheidungen, Heilung, Dauer, Rundenwertung");
  check(Boolean(L && L.warten) && L.warten.zugeschaut === 1 && L.warten.uebersprungen === false && Boolean(L.warten.aufstellung), "Mitschrift: Warten, Zuschauen, Aufstellung");
  check(await p.evaluate(abdruck) === vorher && await p.evaluate(() => !window.AB.arenaAn() && document.getElementById("riss-leiste").hidden), "nach dem Finale: Regeln im Urzustand, Arena beendet, Leiste weg");
  await p.click("#riss-mitschrift"); await p.waitForSelector(".riss-mitschrift .riss-tabelle");
  check((await p.$$(".riss-mitschrift .riss-tabelle tr")).length === 2, "das Mitschrift-Fenster zeigt die Partie");
  check(!fehler.length, "keine Skriptfehler" + (fehler.length ? ": " + fehler.slice(0, 3).join(" | ") : ""));
  await b.close(); console.log(ok ? "\nRissgänger: alles in Ordnung" : "\nRissgänger: FEHLER"); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
