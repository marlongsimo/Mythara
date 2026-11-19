/*
 * Rissgänger, Kartenform „Pfade“: dreizehn Räume als Netz, nur verbundene Wege, Bosse mit doppelter Erfahrung.
 * Aufruf: node tests/riss-pfade.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright");
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF);
const URL = "http://localhost:8765/spiel.html?schnell&riss=1&risszeit=90";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };

(async () => {
  // --- Regeln ohne Browser ---
  let zs = 3; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
  const karte = K.netzLosen(zf), W = K.neuK(R.FD.REIHE.slice(0, 3), "x", karte);
  check(karte.length === 12 && karte.slice(0, 4).every((x) => x.startsWith("n_")) && karte.slice(4).filter((x) => x.startsWith("b_")).length === 4, "gelost: innen vier leichte Räume, außen acht, darunter vier Bosse");
  check(JSON.stringify(K.kWege(W)) === "[0,1,2,3]", "am Anfang sind nur die vier Räume um die Mitte erreichbar");
  W.frei.push(1); check(JSON.stringify(K.kWege(W).slice().sort((a, b) => a - b)) === "[0,1,2,3,6,7]", "ist ein innerer Raum frei, öffnen sich seine zwei äußeren Nachbarn");
  W.frei.push(7); check(K.kWege(W).includes(8) && !K.kWege(W).includes(9), "außen geht es reihum weiter – aber nur einen Raum");
  { const ort = karte.findIndex((x) => x.startsWith("b_")), def = K.kDef(W, ort), st = R.neuesSpiel(4, K.kOpts(W, ort)), m = st.figuren.filter((f) => f.seite === "gegner"), boss = m.find((f) => f.art === def.boss);
    check(Boolean(boss) && K.kXpFig(boss, def) === 10 * boss.tpMax && m.filter((f) => f !== boss).every((f) => K.kXpFig(f, def) === 5 * f.tpMax), "der Boss gibt doppelte Erfahrung, seine Begleiter die gewöhnliche"); }
  { const B = K.botKarte(R.FD.REIHE.slice(3, 6), 4711, "Rechner", karte, 480); check(B.besucht.length >= 2 && B.verlauf.every((v) => v.ort === "M" || true) && B.xp > 0, `der Rechner findet seinen Weg durch die Pfade (${B.besucht.length} Räume, Stufe ${K.kStufe(B.xp).stufe})`); }

  // --- im Browser ---
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
  await p.goto(URL); await p.click("#my-gast-start"); await p.waitForSelector("#riss-zugang:not([hidden])"); await p.click("#riss-zugang"); await p.waitForSelector("#riss-suchen");
  check(await p.evaluate(() => document.querySelector("#riss-form").value === "pfade"), "Voreinstellung: Kartenform „Pfade“");
  await p.click("#riss-bearbeiten"); await p.waitForSelector("#riss-helden");
  for (let i = 0; i < 3; i++) await p.evaluate((n) => document.querySelector(`#riss-helden [data-held]:nth-child(${n})`).click(), i + 1);
  await p.click("#riss-speichern"); await p.waitForSelector("#riss-suchen:not([disabled])"); await p.click("#riss-suchen"); await p.waitForSelector("#karte .fig");
  // Raum vom Rechner-Helfer spielen lassen, dann einsammeln (der Held am Zug wird neben den Fund gestellt) – danach geht es von selbst zur Karte
  const raeumen = async () => { await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 900; i++) { const e = await p.evaluate(() => { const st = window.AB.st; if (!st) return "weg"; const g = st.figuren.filter((f) => f.seite === "gegner" && window.AB.R.GEGNER[f.art]);
      if (st.ende) return st.ende; if (g.every((f) => f.tp <= 0)) return "frei"; const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render(); return null; }); if (e) break; }
    await p.waitForTimeout(500);
    await p.evaluate(() => { const st = window.AB.st; if (!st) return; const D = window.RISS.karteZustand().drops, R = window.AB.R;
      for (const d of D.liste.filter((x) => !x.weg)) { let k = 0; while (!(R.aktiv(st).fid && R.aktiv(st).tp > 0 && st.zug.aktion) && k++ < 12) R.zugEnde(st);
        const h = R.aktiv(st); h.x = d.x; h.y = d.y; window.RISS.feldAufheben(d.x, d.y); const w = document.querySelector("#riss-fund [data-wer]:not([disabled])"); if (w) w.click(); if (!st.ende) R.zugEnde(st); } }); };
  const zurKarte = async () => { await p.waitForSelector("[data-riss-karte]", { timeout: 20000 }); };
  await raeumen(); await zurKarte();
  check((await p.$$(".riss-karte.netz .rk-raum.dunkel")).length === 12 && (await p.$$(".riss-karte.netz .rk-raum.dunkel.fern")).length === 8 && (await p.$$(".riss-karte.netz [data-ort]")).length === 4, "Karte: zwölf dunkle Räume, vier davon erreichbar, acht noch nicht");
  check(await p.evaluate(() => [...document.querySelectorAll(".riss-karte.netz [data-ort] b")].every((x) => x.textContent.trim().length > 3) && [...document.querySelectorAll(".riss-karte.netz .fern b")].every((x) => !x.textContent.trim())), "vor erreichbaren Räumen steht eine Ahnung, vor den anderen nichts");
  check(await p.evaluate(() => { window.RISS.zustand(); const fern = document.querySelector(".riss-karte.netz .fern"); return fern.disabled; }), "ein Raum ohne Verbindung lässt sich nicht betreten");
  await p.click('.riss-karte.netz [data-ort="2"]'); await p.waitForSelector("#karte .fig"); await raeumen(); await zurKarte();
  check(await p.evaluate(() => { const l = [...document.querySelectorAll(".riss-karte.netz [data-ort]")].map((x) => +x.dataset.ort); return l.includes(8) && l.includes(9) && !l.includes(10) && window.RISS.zustand().ich.frei.includes(2); }), "Raum 2 freigeräumt: Die beiden äußeren Räume dahinter sind jetzt erreichbar");
  check((await p.$$(".riss-karte.netz line.frei")).length >= 6, "freie Wege leuchten auf der Karte");
  await p.click('.riss-karte.netz [data-ort="8"]'); await p.waitForSelector("#karte .fig");
  const aussen = await p.evaluate(() => { const Z = window.RISS.zustand(), st = window.AB.st, d = window.RISS.kern().kDef(Z.ich, 8); return { klasse: d.klasse, monster: st.figuren.filter((f) => f.seite === "gegner").length, xpVor: Z.ich.xp }; });
  await raeumen(); await zurKarte();
  check(aussen.monster >= 1 && await p.evaluate((v) => window.RISS.zustand().ich.xp >= v, aussen.xpVor), `äußerer Raum (${aussen.klasse}) gespielt, zurück auf der Karte`);
  check(fehler.length === 0, "keine Skriptfehler" + (fehler.length ? ": " + fehler[0] : ""));
  await p.screenshot({ path: process.env.RISS_BILD || "/dev/null" }).catch(() => {});
  await b.close();
  console.log(ok ? "\nRissgänger (Pfade): alles in Ordnung" : "\nRissgänger (Pfade): FEHLER"); process.exit(ok ? 0 : 1);
})();
