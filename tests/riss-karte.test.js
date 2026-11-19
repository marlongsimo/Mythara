/*
 * Mythara – Rissgänger (Prototyp), Spielart „Karte“: Einstieg, Karte mit dunklen Räumen, durchlaufende Uhr,
 * Erfahrung je verlorenem Lebenspunkt der Monster (blauer Balken zählt im Kampf mit), Erbsplitter und Funde von Hand aufheben
 * (ein Held muss daneben stehen; bei einem Fund: für wen?), der Raum bleibt nach dem letzten Monster offen, Raum verlassen,
 * Teleport bei Ablauf der Zeit (auch aus dem Kampf), Siegelwächterin, Finale ohne Startpunkte; kein Neuladen mitten in der Partie.
 * Aufruf: node tests/riss-karte.test.js   (Webserver auf Port 8765)
 */
const { chromium } = require("playwright");
const URL = "http://localhost:8765/spiel.html?schnell&riss=1&risszeit=45";
let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(), fehler = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" })).newPage(); p.on("pageerror", (e) => fehler.push(e.message));
  await p.goto(URL); await p.click("#my-gast-start"); await p.waitForSelector(".dorf-ort"); await p.waitForSelector("#riss-zugang:not([hidden])");
  check(await p.evaluate(() => document.body.classList.contains("fackeln") && !window.RISS.laeuft()), "Fackeln sind Standard; noch läuft keine Partie");
  await p.click("#riss-zugang"); await p.waitForSelector("#riss-helden");
  check(await p.evaluate(() => document.querySelector("#riss-art").value === "karte" && Boolean(document.querySelector("#riss-zeit"))), "Spielart „Karte“ ist die Voreinstellung, die Zeit ist wählbar");
  for (let i = 0; i < 3; i++) await p.click(`#riss-helden [data-held]:nth-child(${i + 1})`);
  await p.click("#riss-los"); await p.waitForSelector("#karte .fig"); // nach dem Start geht es (nach dem Film, hier übersprungen) direkt in den ersten Raum
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.karte.slice().sort().join() === "boss,schwer,truhe1,truhe2" && Z.bot.karte.join() === Z.karte.join() && window.RISS.laeuft(); }), "Karte gelost (ein schwerer Raum, ein Boss, zwei leichte), für beide gleich; die Partie läuft (kein Neuladen)");
  // Kampf vom Rechner-Helfer spielen lassen. bis: "erster" = bis das erste Monster liegt, sonst bis alle liegen (der Raum bleibt dann offen)
  const spielen = async (bis) => { await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 900; i++) { const e = await p.evaluate((bis) => { const st = window.AB.st; if (!st) return "weg"; const g = st.figuren.filter((f) => f.seite === "gegner" && window.AB.R.GEGNER[f.art]);
      if (st.ende) return st.ende; if (g.every((f) => f.tp <= 0)) return "frei"; if (bis === "erster" && g.some((f) => f.tp <= 0)) return "erster";
      const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render(); return null; }, bis); if (e) return e; } return null; };
  const einsammeln = async () => p.evaluate(() => { const D = window.RISS.karteZustand().drops, st = window.AB.st, h = st.figuren.find((f) => f.fid && f.tp > 0); let n = 0;
    for (const d of D.liste.filter((x) => !x.weg)) { h.x = d.x; h.y = d.y; if (window.RISS.feldAufheben(d.x, d.y)) n++; const w = document.querySelector("#riss-fund [data-wer]:not([disabled])"); if (w) w.click(); } return n; });
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"), K = window.RISS.karteZustand(); return K.laeuft && u && !u.hidden; }), "die Uhr läuft ab dem ersten Raum");
  let e = await spielen(); await p.waitForTimeout(500);
  const offen = await p.evaluate(() => { const K = window.RISS.karteZustand(), st = window.AB.st; return { frei: K.frei, ende: st && st.ende, liegt: K.drops.liste.filter((d) => !d.weg).length, marken: document.querySelectorAll("#karte rect.feld.riss-drop, #karte rect.feld.riss-drop-segen").length, splitter: window.RISS.zustand().ich.splitter, knopf: document.querySelector("#riss-raus").textContent, weiter: Boolean(document.querySelector("#ende:not([hidden]) #weiter-abenteuer")) }; });
  check(e === "frei" && offen.frei && !offen.ende && !offen.weiter && offen.liegt >= 1, `alle Monster besiegt: Der Raum bleibt offen, ${offen.liegt} Funde liegen noch`);
  check(offen.splitter === 0 && offen.marken >= 1 && /Zur Karte/.test(offen.knopf), "nichts wird von selbst aufgehoben; die Felder sind markiert, der Knopf heißt „Zur Karte“");
  const fern = await p.evaluate(() => { const D = window.RISS.karteZustand().drops, st = window.AB.st, d = D.liste.find((x) => !x.weg); for (const f of st.figuren) if (f.fid) { f.x = d.x > 5 ? 1 : 10; f.y = 7; } return window.RISS.feldAufheben(d.x, d.y) === false && !d.weg; });
  check(fern, "zu weit weg: Antippen hebt nichts auf");
  const n1 = await einsammeln(); await p.waitForSelector("#weiter-abenteuer", { timeout: 15000 });
  check(n1 >= 1 && await p.evaluate(() => window.RISS.zustand().ich.splitter + Object.values(window.RISS.zustand().ich.dinge).flat().length > 0), "Held daneben und antippen: aufgehoben; ist alles eingesammelt, schließt der Raum");
  await p.click("#weiter-abenteuer"); await p.waitForSelector("[data-riss-karte]");
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.ich.xp >= 45 && Z.ich.xp % 5 === 0 && Z.ich.xp === Z.ich.verlauf[0].xp && Object.values(Z.ich.stufen).every((s) => s === 2); }), "Einstieg: 5 Erfahrung je Lebenspunkt der Monster, Stufe 2");
  check((await p.$$(".rk-raum.dunkel")).length === 4 && (await p.$$(".rk-raum.hell")).length === 1, "Karte: die Mitte leuchtet, vier Räume sind dunkel");
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"); return u && !u.hidden && /0:[0-4]\d/.test(u.textContent); }), "auf der Karte läuft dieselbe Uhr weiter");
  // zweiter Raum: Erfahrung zählt im Kampf mit; dann verlassen
  await p.click(".rk-raum.dunkel"); await p.waitForSelector("#riss-raus:not([hidden])");
  e = await spielen("erster"); await p.waitForTimeout(500);
  const live = await p.evaluate(() => { const st = window.AB.st, K = window.RISS.kern(), el = document.querySelector("#riss-xpleiste"); return { xp: K.kXp(st), sichtbar: el && !el.hidden, breite: el && el.querySelector("u").style.width, text: el && el.textContent }; });
  check(live.xp > 0 && live.sichtbar && /EP|Stufe/.test(live.text), `der blaue Balken zählt im Kampf mit (${live.xp} Erfahrung aus diesem Raum, ${live.breite})`);
  if (e === "erster") { await p.click("#riss-raus"); await p.click("#riss-raus"); } else { await einsammeln(); await p.waitForSelector("#weiter-abenteuer"); await p.click("#weiter-abenteuer"); }
  await p.waitForSelector("[data-riss-karte]", { timeout: 15000 });
  check(await p.evaluate((x) => { const Z = window.RISS.zustand(), v = Z.ich.verlauf[1]; return Z.ich.besucht.length === 2 && v.xp >= x && Z.ich.xp === Z.ich.verlauf[0].xp + v.xp; }, live.xp), "Raum verlassen: zurück auf der Karte, die Erfahrung bleibt, der Raum ist zu");
  check((await p.$$(".rk-raum.dunkel")).length === 3 && await p.evaluate(() => document.getElementById("riss-xpleiste").hidden), "der verlassene Raum ist nicht mehr dunkel, der Balken ist weg");
  // dritter Raum: Die Zeit läuft ab, der Riss holt die Gruppe heraus
  await p.click(".rk-raum.dunkel"); await p.waitForSelector("#karte .fig");
  await p.waitForSelector("#riss-waechterin", { timeout: 70000 });
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"); return (!u || u.hidden) && !window.AB.st && document.getElementById("riss-raus").hidden && window.ABR.bewegen === window.AB.R.bewegen; }), "Zeit um: Der Riss holt die Gruppe aus dem Kampf, Uhr und Knopf sind weg");
  await p.click("#riss-waechterin"); await p.waitForSelector("[data-riss-laden]");
  await p.evaluate(() => { window.RISS.zustand().ich.splitter = 200; window.RISS.laden(); }); await p.waitForSelector("[data-riss-laden] .riss-ding"); // für den Test: genug Erbsplitter
  const vor = await p.evaluate(() => { const W = window.RISS.zustand().ich; return { s: W.splitter, segen: W.segen.length }; });
  await p.click(".riss-ding.segen:not([disabled])");
  check(await p.evaluate((v) => { const W = window.RISS.zustand().ich; return W.splitter === v.s - 90 && W.segen.length === v.segen + 1; }, vor), "Siegelwächterin: Segen für 90 Erbsplitter gekauft");
  await p.click(".riss-ding:not(.segen):nth-child(2)"); await p.waitForSelector(".riss-wer [data-wer]"); await p.click(".riss-wer [data-wer]");
  check(await p.evaluate(() => { const W = window.RISS.zustand().ich; return Object.values(W.traenke).reduce((a, n) => a + n, 0) === 1 && W.kaeufe.some((k) => k.typ === "trank"); }), "Siegelwächterin: Heiltrank für einen Helden gekauft");
  await p.click("#riss-laden-fertig"); await p.waitForSelector("#karte .fig"); await p.waitForSelector("#riss-leiste:not([hidden])");
  const start = await p.evaluate(() => { const Z = window.RISS.zustand(), st = Z.st, K = window.RISS.kern(); const h = K.helden(st, 1); return { P: st.riss.P, frueh: st.riss.frueh, unten: h.every((f) => f.y >= 6), traenke: h.reduce((a, f) => a + ((f.rucksack || []).find((x) => x.id === "heiltrank") || { n: 0 }).n, 0), heilung: st.riss.heilung }; });
  check(start.P[1] === 0 && start.P[2] === 0 && start.frueh === 0 && start.unten, "Finale: beide kommen gleichzeitig an, 0 : 0, jede Gruppe an ihrem Eingang");
  check(start.traenke === 4 && start.heilung === "keine", "der gekaufte Heiltrank ist im Finale dabei; Heilung gibt es nur bei der Wächterin");
  // Seite mitten im Finale verlassen: Es bleibt ein Eintrag in der Mitschrift
  await p.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  check(await p.evaluate(() => { const L = window.RISS.mitschrift().slice(-1)[0]; return Boolean(L) && L.abgebrochen && L.phase === "finale" && Array.isArray(L.punkte); }), "bricht die Partie ab, steht sie trotzdem in der Mitschrift");
  check(!fehler.length, "keine Skriptfehler" + (fehler.length ? ": " + fehler.slice(0, 3).join(" | ") : ""));
  await b.close(); console.log(ok ? "\nRissgänger (Karte): alles in Ordnung" : "\nRissgänger (Karte): FEHLER"); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
