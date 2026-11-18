/*
 * Mythara – Rissgänger (Prototyp): eine ganze Partie im Browser gegen den Rechner.
 * Geprüft: ohne Schalter unsichtbar; mit ?riss=1 Zugang im Dorf, Heldenwahl, Heilungsschalter, Räume mit Stufenaufstieg,
 * Entscheidung erst nach Raum 2, Beute nach Raum 4, Ankunft, Finale mit Siegelpunkten und Markierungen,
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
  p = await neu(URL + "&riss=1"); await p.waitForSelector("#riss-zugang:not([hidden])");
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
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.bot.raeume >= 2 && Z.bot.raeume <= 5 && Z.bot.abgebogen && Object.values(Z.ich.stufen).every((s) => s === 1); }), "Rechner hat seinen Weg (2 bis 5 Räume), eigene Helden auf Stufe 1");

  const raumSpielen = async () => {
    await p.click("#riss-kampf"); await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 600; i++) { const e = await p.evaluate(() => { const st = window.AB.st; if (!st) return "weg"; if (st.ende) return st.ende; const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render(); return st.ende; }); if (e) break; }
    await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer");
  };
  const beute = async () => { if (!(await p.$(".riss-beute"))) return false; await p.click(".riss-beute .riss-ding"); if (await p.isDisabled("#riss-nehmen")) await p.click(".riss-wer [data-wer]"); await p.click("#riss-nehmen"); return true; };
  await raumSpielen(); await p.waitForSelector("#riss-weiter");
  check(!(await p.$("#riss-siegel")), "nach Raum 1 gibt es noch kein Abbiegen");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.ich.raeume === 1 && Object.values(Z.ich.stufen).some((s) => s === 2); }), "Raum 1 abgerechnet: Stufe 2");
  await p.click("#riss-weiter"); await raumSpielen(); await p.waitForSelector("#riss-siegel");
  check(Boolean(await p.$("#riss-weiter")) && Boolean(await p.$(".riss-verdeckt")), "nach Raum 2: weiter oder zum Siegel, das Abbiegen des Gegners bleibt verdeckt");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.sicht >= 1 && Z.sicht <= 2 && Z.sicht <= Z.bot.raeume; }), "vom Gegner ist höchstens so viel zu hören, wie man selbst gespielt hat");
  await p.click("#riss-weiter"); await raumSpielen(); await p.waitForSelector("#riss-weiter"); await p.click("#riss-weiter"); await raumSpielen(); await p.waitForSelector("#riss-siegel, .riss-beute");
  const sieg4 = await p.evaluate(() => window.RISS.zustand().ich.verlauf[3].sieg), hatBeute = await beute();
  check(sieg4 === hatBeute, "nach gewonnenem Raum 4 gibt es einen Gegenstand" + (sieg4 ? "" : " (Raum 4 verloren: keine Beute)"));
  if (hatBeute) check(await p.evaluate(() => Object.values(window.RISS.zustand().ich.dinge).flat().length === 1), "der Gegenstand liegt bei einem Helden");
  await p.waitForSelector("#riss-siegel"); await p.click("#riss-siegel"); await p.waitForSelector("#riss-finale");
  const lage = await p.evaluate(() => { const Z = window.RISS.zustand(); return { a: Z.ich.raeume, b: Z.bot.raeume }; });
  await p.click("#riss-finale"); await p.waitForSelector("#karte .fig");
  const start = await p.evaluate(() => { const st = window.RISS.zustand().st; return { P: st.riss.P, runden: st.arena.runden }; });
  const soll = lage.a === lage.b ? [0, 0] : lage.a < lage.b ? [Math.min(3, lage.b - lage.a + 1), 0] : [0, Math.min(3, lage.a - lage.b + 1)];
  check(start.P[1] === soll[0] && start.P[2] === soll[1] && start.runden === 12, `Startpunkte ${start.P[1]} : ${start.P[2]} bei ${lage.a} gegen ${lage.b} Räumen, zwölf Runden`);
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
    if (r.fremd != null) { fremd = fremd == null ? r.fremd : fremd && r.fremd; await p.waitForTimeout(300); }
    if (r.ende) break;
  }
  check(fremd === true, "Helden des Gegners lassen sich nicht von Hand ziehen");
  await p.waitForSelector("#riss-nochmal", { timeout: 20000 });
  const L = await p.evaluate(() => window.RISS.mitschrift().slice(-1)[0]);
  check(Boolean(L) && (L.punkte[0] >= 5 || L.punkte[1] >= 5 || L.finalRunden >= 12) && [1, 2].includes(L.sieger), `Partie entschieden: ${L && L.punkte.join(" : ")} nach ${L && L.finalRunden} Runden (${L && L.grund})`);
  check(Boolean(L) && L.ich.raeume.length === 4 && L.ich.entscheidungen.length === 3 && L.heilung === "gerechnet" && Boolean(L.minuten) && L.runden.length >= 1, "Mitschrift: Räume, Entscheidungen, Heilung, Dauer, Rundenwertung");
  check(await p.evaluate(abdruck) === vorher && await p.evaluate(() => !window.AB.arenaAn() && document.getElementById("riss-leiste").hidden), "nach dem Finale: Regeln im Urzustand, Arena beendet, Leiste weg");
  await p.click("#riss-mitschrift"); await p.waitForSelector(".riss-mitschrift .riss-tabelle");
  check((await p.$$(".riss-mitschrift .riss-tabelle tr")).length === 2, "das Mitschrift-Fenster zeigt die Partie");
  check(!fehler.length, "keine Skriptfehler" + (fehler.length ? ": " + fehler.slice(0, 3).join(" | ") : ""));
  await b.close(); console.log(ok ? "\nRissgänger: alles in Ordnung" : "\nRissgänger: FEHLER"); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
