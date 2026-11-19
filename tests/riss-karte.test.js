/*
 * Mythara – Rissgänger (Prototyp), Spielart „Karte“: Einstieg, Karte mit dunklen Räumen, durchlaufende Uhr,
 * Erfahrung je verlorenem Lebenspunkt der Monster (blauer Balken zählt im Kampf mit), Erbsplitter und Funde von Hand aufheben
 * (ein Held muss daneben stehen; bei einem Fund: für wen?), der Raum bleibt nach dem letzten Monster offen, Raum verlassen,
 * Teleport bei Ablauf der Zeit (auch aus dem Kampf), Siegelwächterin, Finale ohne Startpunkte; kein Neuladen mitten in der Partie.
 * Aufruf: node tests/riss-karte.test.js   (Webserver auf Port 8765)
 */
const { chromium } = require("playwright");
const URL = "http://localhost:8765/spiel.html?schnell&riss=1&risskarte=ring&risszeit=45";
let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
(async () => {
  const b = await chromium.launch(), fehler = [];
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" })).newPage(); p.on("pageerror", (e) => fehler.push(e.message));
  await p.goto(URL); await p.click("#my-gast-start"); await p.waitForSelector(".dorf-ort"); await p.waitForSelector("#riss-zugang:not([hidden])");
  check(await p.evaluate(() => document.body.classList.contains("fackeln") && !window.RISS.laeuft()), "Fackeln sind Standard; noch läuft keine Partie");
  await p.click("#riss-zugang"); await p.waitForSelector("#riss-suchen");
  check(await p.isDisabled("#riss-suchen") && (await p.$$("#riss-team .riss-platz.leer")).length === 3, "beim ersten Mal ist das Team leer");
  check(await p.evaluate(() => document.querySelector("#riss-art").value === "karte" && Boolean(document.querySelector("#riss-zeit"))), "Spielart „Karte“ ist die Voreinstellung, die Zeit ist wählbar");
  await p.click("#riss-bearbeiten"); await p.waitForSelector("#riss-helden");
  await p.setViewportSize({ width: 420, height: 420 }); await p.evaluate(() => { document.getElementById("riss-ebene").scrollTop = 200; }); const y0 = await p.evaluate(() => document.getElementById("riss-ebene").scrollTop);
  for (let i = 0; i < 3; i++) await p.evaluate((n) => document.querySelector(`#riss-helden [data-held]:nth-child(${n})`).click(), i + 1); // direkt klicken: p.click würde selbst zum Helden rollen
  check(y0 > 0 && await p.evaluate((y) => Math.abs(document.getElementById("riss-ebene").scrollTop - y) < 40, y0) && (await p.$$("#riss-helden .an")).length === 3, "Helden antippen: Die Seite springt nicht nach oben");
  await p.setViewportSize({ width: 1280, height: 720 }); await p.click("#riss-speichern"); await p.waitForSelector("#riss-suchen:not([disabled])");
  check(await p.evaluate(() => JSON.parse(localStorage.getItem("ab_riss_team")).length === 3 && document.querySelectorAll("#riss-team .riss-platz img").length === 3), "das Team ist gespeichert und steht oben");
  await p.click("#riss-suchen"); await p.waitForSelector("#karte .fig"); // nach dem Start geht es (nach dem Film, hier übersprungen) direkt in den ersten Raum
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.karte.slice().sort().join() === "boss,schwer,truhe1,truhe2" && Z.bot.karte.join() === Z.karte.join() && window.RISS.laeuft(); }), "Karte gelost (ein schwerer Raum, ein Boss, zwei leichte), für beide gleich; die Partie läuft (kein Neuladen)");
  // Kampf vom Rechner-Helfer spielen lassen. bis: "erster" = bis das erste Monster liegt, sonst bis alle liegen (der Raum bleibt dann offen)
  const spielen = async (bis) => { await p.waitForSelector("#karte .fig");
    for (let i = 0; i < 900; i++) { const e = await p.evaluate((bis) => { const st = window.AB.st; if (!st) return "weg"; const g = st.figuren.filter((f) => f.seite === "gegner" && window.AB.R.GEGNER[f.art]);
      if (st.ende) return st.ende; if (g.every((f) => f.tp <= 0)) return "frei"; if (bis === "erster" && g.some((f) => f.tp <= 0)) return "erster";
      const a = window.AB.R.aktiv(st); if (a.seite === "spieler") window.AB.R.autoZug(st); else window.AB.R.gegnerZug(st); window.AB.render(); return null; }, bis); if (e) return e; } return null; };
  // Einsammeln im Test: Der Held am Zug wird neben den Fund gestellt, hebt auf (das kostet seine Aktion) und beendet den Zug
  const einsammeln = async () => p.evaluate(() => { const D = window.RISS.karteZustand().drops, st = window.AB.st, R = window.AB.R; let n = 0;
    for (const d of D.liste.filter((x) => !x.weg)) { let k = 0; while (!(R.aktiv(st).fid && R.aktiv(st).tp > 0 && st.zug.aktion) && k++ < 12) R.zugEnde(st);
      const h = R.aktiv(st); h.x = d.x; h.y = d.y; if (window.RISS.feldAufheben(d.x, d.y)) n++; const w = document.querySelector("#riss-fund [data-wer]:not([disabled])"); if (w) w.click(); if (!st.ende) R.zugEnde(st); } return n; });
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"), K = window.RISS.karteZustand(); return K.laeuft && u && !u.hidden; }), "die Uhr läuft ab dem ersten Raum");
  let e = await spielen(); await p.waitForTimeout(500);
  const offen = await p.evaluate(() => { const K = window.RISS.karteZustand(), st = window.AB.st; return { frei: K.frei, ende: st && st.ende, liegt: K.drops.liste.filter((d) => !d.weg).length, marken: document.querySelectorAll("#karte rect.feld.riss-drop, #karte rect.feld.riss-drop-segen").length, splitter: window.RISS.zustand().ich.splitter, knopf: document.querySelector("#riss-raus").textContent, weiter: Boolean(document.querySelector("#ende:not([hidden]) #weiter-abenteuer")) }; });
  check(await p.evaluate(() => { const el = document.querySelector("#riss-aufstieg"); return Boolean(el) && /Stufe 2/.test(el.textContent) && el.textContent.includes("▲"); }), "fällt das Monster, das die Stufe bringt, erscheint die Kachel „Das Team steigt auf – Stufe 2“ mit Pfeil nach oben");
  await p.waitForFunction(() => window.AB.st && window.AB.st.figuren.filter((f) => f.fid && f.seite === "spieler").every((f) => f.stufe === 2), null, { timeout: 5000 }).catch(() => {});
  check(await p.evaluate(() => { const st = window.AB.st, F = window.ABF || window.FIGUREN_API || null, Z = window.RISS.zustand(); const h = st.figuren.filter((f) => f.fid && f.seite === "spieler");
    return h.length === 3 && h.every((f) => f.stufe === 2 && Z.ich.stufen[f.fid] === 2 && f.tp <= f.tpMax) && st.log.some((l) => /Stufe 2: .*auf/.test(l.t || "")); }), "Aufstieg mitten im Kampf: Alle drei Helden sind sofort Stufe 2, das steht in der Chronik");
  check(e === "frei" && offen.frei && !offen.ende && !offen.weiter && offen.liegt >= 1, `alle Monster besiegt: Der Raum bleibt offen, ${offen.liegt} Funde liegen noch`);
  check(await p.evaluate(() => { const l = window.RISS.karteZustand().drops.liste.filter((d) => !d.weg && !d.ding), b = document.querySelectorAll("#karte .riss-feldbild:not(.fund) image"); return b.length >= 1 && b.length <= l.length && [...b].every((x) => /erbsplitter\.gif/.test(x.getAttribute("href"))); }), "wo Erbsplitter liegen, zeigt das Feld das Erbsplitter-Bild");
  check(offen.splitter === 0 && offen.marken >= 1 && /Zur Karte/.test(offen.knopf), "nichts wird von selbst aufgehoben; die Felder sind markiert, der Knopf heißt „Zur Karte“");
  const fern = await p.evaluate(() => { const D = window.RISS.karteZustand().drops, st = window.AB.st, d = D.liste.find((x) => !x.weg); for (const f of st.figuren) if (f.fid) { f.x = d.x > 5 ? 1 : 10; f.y = 7; } return window.RISS.feldAufheben(d.x, d.y) === false && !d.weg; });
  check(fern, "zu weit weg: Antippen hebt nichts auf");
  const kosten = await p.evaluate(() => { const D = window.RISS.karteZustand().drops, st = window.AB.st, R = window.AB.R; let k = 0; while (!(R.aktiv(st).fid && R.aktiv(st).tp > 0 && st.zug.aktion) && k++ < 12) R.zugEnde(st);
    const offen = D.liste.filter((x) => !x.weg), l = offen.filter((x) => !x.ding && offen.filter((o) => o.x === x.x && o.y === x.y).length === 1), h = R.aktiv(st); if (l.length < 2) return null; const andere = st.figuren.find((f) => f.fid && f !== h && f.tp > 0), vor = window.RISS.zustand().ich.splitter;
    andere.x = l[0].x; andere.y = l[0].y; h.x = 0; h.y = 8; const fremd = window.RISS.feldAufheben(l[0].x, l[0].y) === false && !l[0].weg; // ein anderer Held steht daneben, ist aber nicht am Zug
    andere.x = 11; andere.y = 8; h.x = l[0].x; h.y = l[0].y; window.RISS.feldAufheben(l[0].x, l[0].y); const eins = l[0].weg && st.zug.aktion === false && window.RISS.zustand().ich.splitter > vor;
    h.x = l[1].x; h.y = l[1].y; window.RISS.feldAufheben(l[1].x, l[1].y); return { fremd, eins, zwei: !l[1].weg }; });
  if (kosten && !(kosten.fremd && kosten.eins && kosten.zwei)) console.log("kosten", JSON.stringify(kosten));
  if (kosten) check(kosten.fremd && kosten.eins && kosten.zwei, "Aufheben macht nur der Held am Zug, es kostet seine Aktion, und ohne Aktion geht kein zweites Mal");
  const n1 = await einsammeln();
  check(n1 >= 1 && await p.evaluate(() => window.RISS.zustand().ich.splitter + Object.values(window.RISS.zustand().ich.dinge).flat().length > 0), "Held daneben und antippen: aufgehoben; ist alles eingesammelt, schließt der Raum");
  await p.waitForSelector("[data-riss-karte]", { timeout: 15000 });
  check(await p.evaluate(() => { const Z = window.RISS.zustand(); return Z.ich.xp >= 45 && Z.ich.xp % 5 === 0 && Z.ich.xp === Z.ich.verlauf[0].xp && Object.values(Z.ich.stufen).every((s) => s === 2); }), "Einstieg: 5 Erfahrung je Lebenspunkt der Monster, Stufe 2");
  check((await p.$$(".rk-raum.dunkel")).length === 4 && (await p.$$(".rk-raum.hell")).length === 1, "Karte: die Mitte leuchtet, vier Räume sind dunkel");
  check(await p.evaluate(() => { const u = document.querySelector("#riss-uhr"); return u && !u.hidden && /0:[0-4]\d/.test(u.textContent); }), "auf der Karte läuft dieselbe Uhr weiter");
  // zweiter Raum: Erfahrung zählt im Kampf mit; dann verlassen
  await p.click(".rk-raum.dunkel"); await p.waitForSelector("#riss-raus:not([hidden])");
  e = await spielen("erster"); await p.waitForTimeout(500);
  const live = await p.evaluate(() => { const st = window.AB.st, K = window.RISS.kern(), el = document.querySelector("#riss-xpleiste"); return { xp: K.kXp(st), sichtbar: el && !el.hidden, breite: el && el.querySelector("u").style.width, text: el && el.textContent }; });
  check(live.xp > 0 && live.sichtbar && /EP|Stufe/.test(live.text), `der blaue Balken zählt im Kampf mit (${live.xp} Erfahrung aus diesem Raum, ${live.breite})`);
  if (e === "erster") { await p.click("#riss-raus"); await p.click("#riss-raus"); } else { await einsammeln(); }
  await p.waitForSelector("[data-riss-karte]", { timeout: 15000 });
  const nachGehen = await p.evaluate((x) => { const Z = window.RISS.zustand(), v = Z.ich.verlauf[1], m = Object.values(window.RISS.karteZustand().raeume).find((r) => !r.sieg && !r.zu); return { ok: Z.ich.besucht.length === 1 && v.xp >= x && Z.ich.xp === Z.ich.verlauf[0].xp + v.xp, xp: Z.ich.xp, monster: m ? m.monster.map((q) => q.tp).join(",") : null, lebend: m ? m.monster.filter((q) => q.tp > 0).length : 0, liegt: m ? m.liegt.length : 0 }; }, live.xp);
  if (e === "erster") {
    check(nachGehen.ok && nachGehen.lebend >= 1, "Raum verlassen: zurück auf der Karte, die Erfahrung bleibt, der Raum merkt sich seine Monster (" + nachGehen.monster + ")");
    check((await p.$$(".rk-raum.dunkel")).length === 3 && (await p.$$(".rk-raum.offen[data-ort]")).length === 1 && await p.evaluate(() => document.getElementById("riss-xpleiste").hidden), "der verlassene Raum ist auf der Karte als verlassen markiert und anwählbar");
    await p.click(".rk-raum.offen[data-ort]"); await p.waitForSelector("#karte .fig"); await p.waitForTimeout(500);
    const wieder = await p.evaluate(() => { const st = window.AB.st, g = st.figuren.filter((f) => f.seite === "gegner" && window.AB.R.GEGNER[f.art]), K = window.RISS.karteZustand(); return { monster: g.map((q) => Math.max(0, q.tp)).sort().join(","), liegt: K.drops.liste.filter((d) => !d.weg).length, balken: document.querySelector("#riss-xpleiste small").textContent }; });
    check(wieder.monster === nachGehen.monster.split(",").sort().join(",") && wieder.liegt === nachGehen.liegt, "wieder betreten: Monster und Funde sind wie beim Verlassen (" + wieder.monster + ", " + wieder.liegt + " am Boden)");
    await p.click("#riss-raus"); await p.click("#riss-raus"); await p.waitForSelector("[data-riss-karte]", { timeout: 15000 });
    check(await p.evaluate((xp) => window.RISS.zustand().ich.xp === xp, nachGehen.xp), "für schon besiegte Monster gibt es beim zweiten Besuch keine Erfahrung noch einmal");
  }
  // nächster Raum: Die Zeit läuft ab, der Riss holt die Gruppe heraus
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
