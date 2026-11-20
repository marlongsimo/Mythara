/*
 * Mythara Echtzeit – Prüfungen: die Simulation für sich (Kampfsystem 0.1), der Server über WebSocket, der Client im Browser.
 * Aufruf (nach „npm run build“): node test/sim.test.mjs      Der Browser-Teil braucht den Testserver des Hauptspiels auf Port 8765.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { Sim, HELDEN, MONSTER, K, HELDENREIHE, trefferchance, BIT } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), { WebSocket } = require("ws");
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));
/** Ein Held und genau ein Knochenwächter auf freier Fläche, alle anderen Monster entfernt */
function duell(held, seed, abstand = 1.2, mit = []) { const s = new Sim(held, seed, mit), h = s.ich, m = s.wesen.find((w) => !w.held); for (const w of s.wesen) if (!w.held && w !== m) w.tot = true; s.monsterZahl = 1; h.x = 12.5; h.y = 5.5; h.ruhe = 0; if (abstand > 6) { m.x = 29.5; m.y = 12.5; } else { m.x = 12.5 + abstand; m.y = 5.5; } m.heim = { x: m.x, y: m.y }; m.gruppe = 99; return { s, h, m }; } // Koboldhöhle, freie Reihe; „weit weg“ = in der Gruft
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };

// ---------- 1. Bewegung und Eingaben ----------
{ const s = new Sim("schildwaechter", 7), h = s.ich;
  check(s.wesen.filter((w) => w.held).length === 1 && s.wesen.filter((w) => w.typ === "knochenwaechter").length === 12 && s.wesen.filter((w) => w.typ === "knochenfuerst").length === 1, "Aufbau: dein Held, zwölf Knochenwächter und der Knochenfürst");
  check(new Sim("assassine", 1, ["lichtbringer", "assassine", "quatsch", "elementarist", "kopfgeldjaeger"]).wesen.filter((w) => w.held).map((w) => w.typ).join() === "assassine,lichtbringer,elementarist", "Begleiter: höchstens zwei, keine Doppelten, nur bekannte Helden");
  const a = { x: h.x, y: h.y }; s.eingabe({ t: "richtung", x: 1, y: 0 }); lauf(s, 1); const weit = h.x - a.x; s.eingabe({ t: "richtung", x: 50, y: 0 }); const b = h.x; lauf(s, 1); const schnell = h.x - b; s.eingabe({ t: "richtung", x: 0, y: 0 }); const c = h.x; lauf(s, 0.5);
  check(Math.abs(weit - HELDEN.schildwaechter.tempo) < 0.1 && h.x === c && schnell <= HELDEN.schildwaechter.tempo + 0.1, `direkt steuern: eine Sekunde = ${weit.toFixed(1)} Felder (Torvalds Tempo), eine überlange Richtung macht nicht schneller, loslassen = stehen`);
  s.eingabe({ t: "richtung", x: -1, y: 0 }); lauf(s, 10); check(h.x > 1.3 && h.x < 1.4, "gegen die Wand laufen: Der Held bleibt davor stehen");
  const vor = JSON.stringify([h.x, h.y, h.lp, h.modus]); let fehler = 0; s.eingabe({ t: "richtung", x: 0, y: 0 });
  for (const e of [null, 5, "x", {}, { t: "lauf" }, { t: "lauf", x: NaN, y: 1 }, { t: "richtung", x: NaN, y: 1 }, { t: "richtung" }, { t: "ziel", id: h.id }, { t: "ziel", id: 99999 }, { t: "faehig", taste: "x", x: 1, y: 1 }, { t: "faehig", taste: "q" }, { t: "lp", lp: 9999 }]) { try { s.eingabe(e); } catch { fehler++; } }
  check(fehler === 0 && JSON.stringify([h.x, h.y, h.lp, h.modus]) === vor && h.zielId === 0, "unsinnige oder manipulierte Eingaben werden verworfen (eigener Held als Ziel, fremde Felder, NaN)"); }

// ---------- 2. Trefferwurf und Schadenswurf ----------
{ // Trefferquote und Schadensbereich über viele Hiebe gegen einen unsterblichen Knochenwächter
  const { s, h, m } = duell("schildwaechter", 21); m.max = m.lp = 1e7; m.betaeubt = 1e7; s.eingabe({ t: "ziel", id: m.id }); let treffer = 0, nullen = 0, min = 1e9, max = 0;
  for (let i = 0; i < 20 * 600; i++) { s.schritt(); for (const e of s.zustand().ev) { if (e.id !== m.id) continue; if (e.a === "schaden") { treffer++; min = Math.min(min, e.n); max = Math.max(max, e.n); } else if (e.a === "null") nullen++; } }
  const soll = trefferchance(HELDEN.schildwaechter.angriff.nah, MONSTER.knochenwaechter.abwehr.nah), ist = treffer / (treffer + nullen), W = HELDEN.schildwaechter.modi[0];
  check(Math.abs(ist - soll) < 0.04, `Trefferwurf: Torvalds Schwert trifft den Knochenwächter zu ${Math.round(100 * ist)} % (gerechnet ${Math.round(100 * soll)} %, ${treffer + nullen} Hiebe)`);
  check(min >= W.schaden[0] && max <= W.schaden[1] && max - min >= 8, `Schadenswurf: jeder Treffer liegt zwischen ${W.schaden[0]} und ${W.schaden[1]} (gesehen ${min} bis ${max})`);
  check(Math.abs((treffer + nullen) / 600 - 1 / W.takt) < 0.05, `Angriffstempo: ein Hieb alle ${W.takt} Sekunden`); }
{ // Verteidigung je Angriffsart: Vaelins Magie trifft den Knochenwächter öfter als Torvalds Schwert, und Vaelin wird im Nahkampf öfter getroffen als Torvald
  const quote = (held, wie) => { const { s, h, m } = duell(held, 31); let t = 0, n = 0; m.max = m.lp = 1e7; if (wie === "aus") { m.betaeubt = 1e7; s.eingabe({ t: "ziel", id: m.id }); } else { h.max = h.lp = 1e7; h.betaeubt = 1e7; }
    for (let i = 0; i < 20 * 400; i++) { s.schritt(); for (const e of s.zustand().ev) { if (e.id !== (wie === "aus" ? m.id : h.id)) continue; if (e.a === "schaden") t++; else if (e.a === "null" || e.a === "block") n++; } } return t / (t + n); };
  const tA = quote("schildwaechter", "aus"), vA = quote("elementarist", "aus"), tE = quote("schildwaechter", "ein"), vE = quote("elementarist", "ein");
  check(vA > tA + 0.1 && vE > tE + 0.25, `drei Verteidigungsarten: Magie trifft das Skelett zu ${Math.round(100 * vA)} % (Schwert ${Math.round(100 * tA)} %); das Skelett trifft Vaelin zu ${Math.round(100 * vE)} %, Torvald zu ${Math.round(100 * tE)} %`);
  // Schild von vorn und von hinten
  const schild = (vonHinten) => { const { s, h, m } = duell("schildwaechter", 41); h.max = h.lp = 1e7; m.max = m.lp = 1e7; s.eingabe({ t: "modus" }); h.betaeubt = 1e7; h.blick = vonHinten ? Math.PI : 0; let t = 0, n = 0; for (let i = 0; i < 20 * 400; i++) { s.schritt(); for (const e of s.zustand().ev) { if (e.id !== h.id) continue; if (e.a === "schaden") t++; else if (e.a === "block" || e.a === "null") n++; } } return t / (t + n); };
  const vorn = schild(false), hinten = schild(true);
  check(vorn < tE * 0.55 && Math.abs(hinten - tE) < 0.08, `Schildmodus: von vorn wird Torvald nur zu ${Math.round(100 * vorn)} % getroffen, von hinten zu ${Math.round(100 * hinten)} % (ohne Schild ${Math.round(100 * tE)} %)`); }

// ---------- 3. Waffenwechsel, Fernkampf, Heilung, Erholung ----------
{ const { s, h, m } = duell("assassine", 51, 5); check(h.modus === 0 && s.waffe(h).name === "Dolch", "Vex beginnt mit der ersten Waffe (Dolch)"); s.eingabe({ t: "modus" }); check(h.modus === 1 && s.waffe(h).name === "Armbrust", "Kippschalter: jetzt gilt nur die Armbrust");
  s.eingabe({ t: "modus" }); check(h.modus === 1, "der Wechsel hat eine kurze Sperre (kein Hin und Her in einem Augenblick)"); m.betaeubt = 1e7; m.max = m.lp = 1e7;
  s.eingabe({ t: "ziel", id: m.id }); s.eingabe({ t: "richtung", x: 0, y: 1 }); const g0 = s.geschosse.length; lauf(s, 2); const imLaufen = s.zustand().ev.filter((e) => e.a === "hieb" && e.id === h.id).length;
  s.eingabe({ t: "richtung", x: 0, y: 0 }); h.y = 5.5; s.zustand(); lauf(s, 0.2); const holtAus = h.aushol > 0; s.eingabe({ t: "richtung", x: 1, y: 0 }); const x0 = h.x; lauf(s, 0.1); const stehtBeimAusholen = h.x === x0; s.eingabe({ t: "richtung", x: 0, y: 0 }); lauf(s, 2);
  check(imLaufen === 0 && g0 === 0, "Fernkampf: im Laufen wird nicht geschossen"); check(holtAus && stehtBeimAusholen && s.zustand().ev.some((e) => e.a === "hieb" && e.id === h.id), "Fernkampf: im Stehen holt Vex kurz aus (und steht dabei), dann fliegt der Bolzen"); }
{ const { s, h, m } = duell("schildwaechter", 62); m.betaeubt = 1e7; const lp = m.lp; s.eingabe({ t: "modus" }); s.eingabe({ t: "ziel", id: m.id }); h.blick = 2; lauf(s, 4); const still = !s.zustand().ev.some((e) => e.a === "hieb" && e.id === h.id) && m.lp === lp, zu = Math.abs(h.blick) < 0.05;
  s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); check(still && zu && m.lp < lp, "Schildmodus: Torvald greift nicht an und wendet den Schild dem gewählten Gegner zu; der Schildstoß (Q) geht trotzdem"); }
{ const { s, h, m } = duell("schildwaechter", 61); m.betaeubt = 1e7; m.max = m.lp = 1e7; s.eingabe({ t: "ziel", id: m.id }); s.eingabe({ t: "richtung", x: 0, y: 0.3 }); lauf(s, 1.2); check(s.zustand().ev.some((e) => e.a === "hieb" && e.id === h.id), "Nahkampf: Torvald schlägt auch im Laufen zu"); }
{ const { s, h } = duell("lichtbringer", 71, 12, ["schildwaechter"]), t = s.wesen[1]; t.x = h.x + 2; t.y = h.y; t.lp = 100; t.ruhe = 0; t.betaeubt = 1e7; const lp = t.lp; lauf(s, 4);
  const W = HELDEN.lichtbringer.modi[0]; check(t.lp >= lp + 2 * W.schaden[0] && t.lp <= lp + 2 * W.schaden[1], `Elaras Heilstab heilt von selbst, wer am schwersten verletzt ist (${t.lp - lp} Leben in 4 Sekunden, ohne Trefferwurf)`);
  h.lp = 50; t.lp = t.max; s.eingabe({ t: "faehig", taste: "q", x: h.x, y: h.y }); check(h.lp === 50 + K.WORT.heilung, "Heilendes Wort heilt um 55 – hier Elara selbst"); }
{ const { s, h, m } = duell("schildwaechter", 81, 20); h.lp = 100; h.ruhe = 0; lauf(s, K.ERHOLUNG.nach - 0.5); const frueh = h.lp; lauf(s, 3); check(frueh === 100 && h.lp > 100 + 2 * h.max * K.ERHOLUNG.jeSek, `Erholung: ${K.ERHOLUNG.nach} Sekunden ohne Schaden, dann heilt der Held von selbst (${Math.round(h.lp - 100)} Leben in 2,5 Sekunden)`); }

// ---------- 4. Fähigkeiten ----------
{ const { s, h, m } = duell("schildwaechter", 91, 2); const lp = m.lp, x = m.x; s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); check(m.lp < lp && m.x > x + 1 && h.cdQ === HELDEN.schildwaechter.q.zeit, "Torvald Q – Schildstoß: Schaden, der Gegner wird zurückgestoßen, die Abklingzeit läuft");
  s.eingabe({ t: "faehig", taste: "e", x: 0, y: 0 }); check(Boolean(s.zustand().w[0][9] & BIT.bollwerk), "Torvald E – Bollwerk ist aktiv"); m.zielId = 0; s.eingabe({ t: "faehig", taste: "r", x: 0, y: 0 }); check(m.zielId === h.id && h.schutz === K.SCHILD_GRAUWACHT.schutz, "Torvald R – Gegner greifen Torvald an, er bekommt 80 Schutzpunkte");
  const l0 = h.lp; m.betaeubt = 0; m.x = h.x + 1.1; lauf(s, 4); check(h.lp === l0 || h.schutz < K.SCHILD_GRAUWACHT.schutz, "Schutzpunkte fangen Schaden ab, bevor Leben verloren geht"); }
{ const { s, h, m } = duell("elementarist", 101, 4); m.betaeubt = 1e7; let lp = m.lp; s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); const q = lp - m.lp; check(q >= K.FROST.schaden * K.FAEHIG_MIN - 1 && q <= K.FROST.schaden && Boolean(s.zustand().w.find((e) => e[0] === m.id)[9] & BIT.langsam), `Vaelin Q – Frosthauch: ${q} Schaden ohne Trefferwurf, der Gegner ist verlangsamt`);
  lp = m.lp; const x = m.x; s.eingabe({ t: "faehig", taste: "e", x: m.x - 0.5, y: m.y }); check(m.lp < lp && m.x > x + 0.8, "Vaelin E – Donnerwelle: Schaden und Rückstoß"); m.max = m.lp = 1e6; lp = m.lp; s.eingabe({ t: "faehig", taste: "r", x: m.x, y: m.y }); lauf(s, 1); const sofort = lp - m.lp; lauf(s, 4);
  check(sofort >= K.GLUT.schaden * K.FAEHIG_MIN - 1 && lp - m.lp > sofort + 15, `Vaelin R – Glutsphäre: ${sofort} Schaden beim Einschlag, danach brennt das Ziel weiter (${lp - m.lp - sofort})`); }
{ const { s, h, m } = duell("assassine", 111, 3); m.betaeubt = 1e7; m.blick = 0; let lp = m.lp; s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); const vorn = lp - m.lp; check(vorn > 0 && Math.hypot(h.x - m.x, h.y - m.y) < 1.2, "Vex Q – Schattenstich: springt zum Ziel und trifft");
  h.cdQ = 0; h.x = m.x - 3; m.blick = 0; m.lp = m.max; s.zustand(); s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); check(s.zustand().ev.some((e) => e.a === "text" && e.t === "von hinten"), "Schattenstich in den Rücken gibt den Bonus");
  m.lp = m.max = 1e6; s.eingabe({ t: "faehig", taste: "e", x: 0, y: 0 }); s.eingabe({ t: "ziel", id: m.id }); lauf(s, 4); const arten = new Set(); for (let i = 0; i < 80; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "schaden" && e.art) arten.add(e.art); }
  check(arten.has("blut") || arten.has("gift"), "Dolchtreffer lassen nachbluten; mit Giftklinge kommt Gift dazu"); m.max = 150; m.lp = 30; h.cdR = 0; s.eingabe({ t: "faehig", taste: "r", x: m.x, y: m.y }); check(m.tot, "Vex R – Hinrichtung tötet einen angeschlagenen Knochenwächter"); }
{ const { s, h, m } = duell("kopfgeldjaeger", 121, 5); m.betaeubt = 1e7; m.max = m.lp = 1e6; s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); check(m.malT > 0, "Orin Q – Jägermal liegt auf dem Ziel"); s.eingabe({ t: "faehig", taste: "e", x: m.x, y: m.y }); lauf(s, 0.6); s.eingabe({ t: "faehig", taste: "r", x: m.x, y: m.y }); const lp = m.lp; lauf(s, 0.6);
  check(lp - m.lp >= K.ERLEGEN.schaden * K.FAEHIG_MIN * (1 + K.ERLEGEN.mal) - 1, `Orin R – Erlegen trifft sicher und härter gegen ein markiertes Ziel (${Math.round(lp - m.lp)} Schaden)`); }
{ const { s, h, m } = duell("lichtbringer", 131, 3); m.betaeubt = 1e7; h.lp = 100; const lp = m.lp; s.eingabe({ t: "faehig", taste: "r", x: 0, y: 0 }); check(h.lp === 100 + Math.round(h.max * K.GOETTLICH.anteil) && lp - m.lp === K.GOETTLICH.heilig, "Elara R – Göttliches Licht heilt um 30 % und trifft Untote mit 50 heiligem Schaden"); s.eingabe({ t: "faehig", taste: "e", x: 0, y: 0 }); check(h.schutz === K.SCHUTZKREIS.schutz && h.mrPlusT > 0, "Elara E – Schutzkreis gibt Schutzpunkte und Magieverteidigung"); }

// ---------- 5. Knochenwächter und ganzer Riss ----------
{ const { s, h, m } = duell("schildwaechter", 141, 1.2); h.max = h.lp = 1e6; let aus = false, n = 0; while (!aus && n++ < 200) { s.schritt(); aus = s.zustand().ev.some((e) => e.a === "aushol" && e.id === m.id); } const lp = h.lp; h.x -= 4; lauf(s, 0.6);
  check(aus && h.lp === lp, "der Knochenwächter holt sichtbar aus – wer dann außer Reichweite läuft, wird nicht getroffen"); }
{ const s = new Sim("schildwaechter", 151), g = s.wesen.filter((w) => !w.held && w.gruppe === 1); s.ich.x = 13.5; s.ich.y = 4.5; lauf(s, 0.5); check(g.length === 2 && g.every((w) => w.zielId === s.ich.id) && s.wesen.filter((w) => !w.held && w.zielId).length === 2, "wer einen Knochenwächter weckt, weckt seine Gruppe – und nur die"); }
{ const erg = []; for (let k = 0; k < 5; k++) { const typ = HELDENREIHE[k], s = new Sim(typ, 200 + k, k % 2 ? ["lichtbringer"].filter((x) => x !== typ) : []), h = s.ich; let n = 0; if (typ === "lichtbringer") s.eingabe({ t: "modus" });
    while (s.phase === "lauf" && n++ < 20 * 900) { if (n % 5 === 0 && !h.tot) { const A = HELDEN[typ].modi[h.modus], m = s.wesen.filter((w) => !w.held && !w.tot).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0]; if (m) { const d = Math.hypot(m.x - h.x, m.y - h.y); if (d > (A.art === "nah" ? 1.3 : 5)) { if (!h.pfad.length || n % 20 === 0) s.eingabe({ t: "lauf", x: m.x, y: m.y }); } else { if (h.pfad.length) s.eingabe({ t: "halt" }); if (h.zielId !== m.id) s.eingabe({ t: "ziel", id: m.id }); for (const t of ["q", "e", "r"]) s.eingabe({ t: "faehig", taste: t, x: m.x, y: m.y }); } } }
      s.schritt(); if (s.wesen.some((w) => !Number.isFinite(w.x) || !Number.isFinite(w.lp))) { n = 1e9; break; } }
    erg.push({ name: HELDEN[typ].name, sieg: s.phase === "sieg", sek: Math.round(s.zeit) }); }
  check(erg.every((e) => e.sieg), `ganzer Riss mit jedem der fünf Helden vom Rechner gespielt: alle dreizehn Gegner besiegt (${erg.map((e) => e.name + " " + e.sek + " s").join(", ")})`);
  const s = new Sim("schildwaechter", 3, ["lichtbringer"]); for (const w of s.wesen) if (!w.held) w.lp = 1; const z = s.zustand(); check(JSON.stringify(z).length < 2200 && z.w.every((e) => e.length === 13), `ein Zustand ist klein (${JSON.stringify(z).length} Zeichen)`); }

// ---------- 6. Server ----------
const PORT = 8799, server = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: String(PORT), ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.once("data", r));
try {
  const lebt = await (await fetch(`http://localhost:${PORT}/`)).json(); check(lebt.ok === true && lebt.dienst === "mythara-echtzeit", "Server: Lebenszeichen über HTTP");
  const fremd = await new Promise((r) => { const w = new WebSocket(`ws://localhost:${PORT}/`, { origin: "https://boese.example" }); w.on("open", () => { w.close(); r(false); }); w.on("error", () => r(true)); });
  check(fremd, "Server: Verbindungen von fremden Seiten werden abgelehnt");
  const ws = new WebSocket(`ws://localhost:${PORT}/?held=assassine&mit=lichtbringer,quatsch`, { origin: "http://localhost:8765" }), nachr = []; ws.on("message", (d) => nachr.push(JSON.parse(String(d))));
  await new Promise((r, f) => { ws.on("open", r); ws.on("error", f); }); await warte(1050);
  const zust = nachr.filter((m) => m.t === "z"); check(nachr[0].t === "hallo" && zust.length >= 17 && zust.length <= 23, `Server: Begrüßung, dann etwa zwanzig Zustände je Sekunde (${zust.length})`);
  const letzter = () => nachr[nachr.length - 1].z, ich = (z) => z.w.find((e) => e[0] === z.ich.id), a = ich(letzter()); check(a[2] === "assassine" && letzter().w.filter((e) => e[1]).map((e) => e[2]).join() === "assassine,lichtbringer", "Server: Held und Begleiter aus der Adresse (unbekannte werden verworfen)");
  ws.send(JSON.stringify({ t: "richtung", x: 1, y: 0 })); await warte(500); ws.send(JSON.stringify({ t: "richtung", x: 0, y: 0 })); await warte(200); const b = ich(letzter());
  check(b[4] - a[4] > 1.6 && b[4] - a[4] < 2.9 && Math.abs(b[5] - a[5]) < 0.05, `Server: Eine Richtungs-Eingabe bewegt den Helden – berechnet vom Server (${(b[4] - a[4]).toFixed(1)} Felder in einer halben Sekunde)`);
  ws.send(JSON.stringify({ t: "modus" })); await warte(200); check(letzter().ich.modus === 1, "Server: Der Waffenwechsel kommt an");
  ws.send("kein json"); ws.send(JSON.stringify({ t: "lp", lp: 99999 })); ws.send("x".repeat(600)); await warte(300); const offen = ws.readyState === 1;
  check(!offen || ich(letzter())[8] === a[8], "Server: Müll und Manipulationsversuche ändern nichts (zu große Nachrichten trennen die Verbindung)"); ws.close();
  // ---------- 7. Client im Browser ----------
  const { chromium } = require("playwright"), br = await chromium.launch();
  { const p = await br.newPage({ viewport: { width: 1280, height: 760 } }), fehler = []; p.on("pageerror", (e) => fehler.push(String(e)));
    await p.goto("http://localhost:8765/echtzeit/?dorf=0&server="); await p.waitForSelector("#ez-los");
    check((await p.$$(".ez-held")).length === 5 && await p.evaluate(() => /Torvald/.test(document.querySelector(".ez-karte h2").textContent) && /Angriff:/.test(document.querySelector(".ez-karte").textContent)), "Heldenwahl: fünf Helden, der gewählte mit Werten, Waffen und Fähigkeiten");
    await p.click('[data-held="assassine"]'); await p.click('[data-mit="lichtbringer"]'); await p.click('[data-mit="schildwaechter"]'); await p.click('[data-mit="elementarist"]');
    check(await p.evaluate(() => /Vex/.test(document.querySelector(".ez-karte h2").textContent) && document.querySelectorAll(".ez-mit .an").length === 2 && /Dolch.*7–18/.test(document.querySelector(".ez-karte").textContent)), "Vex gewählt: Karte zeigt Dolch 7–18; höchstens zwei Begleiter lassen sich wählen");
    if (process.env.EZ_BILD) await p.screenshot({ path: process.env.EZ_BILD.replace(".png", "-wahl.png") });
    await p.click("#ez-los"); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 15000 });
    check(await p.evaluate(() => { const z = window.EZ.zustand(); return z.w.filter((e) => e[1]).map((e) => e[2]).join() === "assassine,lichtbringer,schildwaechter" && /Vex · Dolch/.test(document.querySelector("#ez-name").textContent); }), "nach dem Start: Vex mit zwei Begleitern im Riss, die Anzeige nennt die Waffe");
    await p.keyboard.press(" "); await p.waitForFunction(() => /Armbrust/.test(document.querySelector("#ez-name").textContent), null, { timeout: 3000 }).catch(() => {}); check(await p.evaluate(() => /Vex · Armbrust/.test(document.querySelector("#ez-name").textContent) && /Armbrust/.test(document.querySelector("#ez-modus").textContent)), "Leertaste: Waffe gewechselt, Anzeige und Knopf zeigen die Armbrust");
    check(fehler.length === 0, "Heldenwahl: keine Fehler" + (fehler.length ? " – " + fehler[0] : "")); await p.close(); }
  for (const [name, url, erwartet] of [["über den Server", `http://localhost:8765/echtzeit/?los=1&server=ws://localhost:${PORT}`, "server"], ["ohne Server", "http://localhost:8765/echtzeit/?los=1&server=", "lokal"]]) {
    const p = await br.newPage({ viewport: { width: 1280, height: 720 } }), fehler = []; p.on("pageerror", (e) => fehler.push(String(e))); p.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
    await p.goto(url); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 15000 });
    const art = await p.evaluate(() => window.EZ.netz.art); check(art === erwartet, `Client ${name}: verbunden (${art})`);
    const ort = () => p.evaluate(() => { const z = window.EZ.zustand(); const e = z.w.find((e) => e[0] === z.ich.id); return [e[4], e[5]]; }), o1 = await ort();
    await p.keyboard.down("d"); await p.waitForTimeout(600); await p.keyboard.up("d"); await p.waitForTimeout(200); const o2 = await ort(); check(o2[0] - o1[0] > 0.8 && o2[1] - o1[1] < -0.8, `Client ${name}: Taste D – der Held läuft am Bildschirm nach rechts (${(o2[0] - o1[0]).toFixed(1)} / ${(o2[1] - o1[1]).toFixed(1)} Felder)`);
    for (const t of ["q", "e", "r"]) await p.keyboard.press(t); await p.waitForTimeout(350); check(await p.evaluate(() => { const i = window.EZ.zustand().ich; return i.cdQ > 3 && i.cdE > 3 && i.cdR > 3; }), `Client ${name}: Q, E und R lösen die Fähigkeiten aus`);
    check(await p.evaluate(() => /Torvald · Langschwert/.test(document.querySelector("#ez-name").textContent) && /Gegner 0 \/ 13/.test(document.querySelector("#ez-stand").textContent)), `Client ${name}: Anzeige zeigt Held, Waffe und Stand`);
    if (process.env.EZ_BILD) await p.screenshot({ path: process.env.EZ_BILD.replace(".png", "-" + erwartet + ".png") });
    check(fehler.length === 0, `Client ${name}: keine Fehler` + (fehler.length ? " – " + fehler[0] : "")); await p.close(); }
  await br.close();
} finally { server.kill(); }
console.log(ok ? "\nMythara Echtzeit: alles in Ordnung" : "\nMythara Echtzeit: FEHLER"); process.exit(ok ? 0 : 1);
