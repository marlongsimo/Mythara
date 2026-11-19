/*
 * Mythara Echtzeit – Prüfungen: die Simulation für sich, der Server über WebSocket, der Client im Browser.
 * Aufruf (nach „npm run build“): node test/sim.test.mjs      Der Browser-Teil braucht den Testserver des Hauptspiels auf Port 8765.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { Sim } from "./sim.gebaut.mjs";
const require = createRequire(import.meta.url), { WebSocket } = require("ws");
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const warte = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 1. Simulation ----------
{ const s = new Sim("schildwaechter", 7), h = s.ich, x0 = h.x;
  check(s.wesen.filter((w) => w.held).length === 2 && s.wesen.filter((w) => !w.held).length === 12 && h.lp === h.max, "Aufbau: dein Held, ein Begleiter, zwölf Monster");
  s.eingabe({ t: "lauf", x: 6.5, y: 2.5 }); for (let i = 0; i < 40; i++) s.schritt();
  check(Math.hypot(h.x - 6.5, h.y - 2.5) < 0.1 && h.x !== x0, "Laufen: Der Held kommt am angeklickten Punkt an");
  s.eingabe({ t: "lauf", x: 12.5, y: 14.5 }); let imFels = false, n = 0; while (h.pfad.length && n++ < 600) { s.schritt(); if (s.wesen.some((w) => !w.tot && !Number.isFinite(w.x))) imFels = true; }
  check(!imFels && n < 600 && Math.hypot(h.x - 12.5, h.y - 14.5) < 3, `Wegsuche: um Wände herum bis ins Käfernest (${(n / 20).toFixed(1)} s)`);
  // unsinnige Eingaben ändern nichts und werfen nichts
  const vor = JSON.stringify([h.x, h.y, h.lp]); let fehler = 0;
  for (const e of [null, 5, "x", {}, { t: "lauf" }, { t: "lauf", x: NaN, y: 1 }, { t: "lauf", x: "9", y: 1 }, { t: "ziel", id: h.id }, { t: "ziel", id: 99999 }, { t: "faehig", taste: "x", x: 1, y: 1 }, { t: "lp", lp: 9999 }]) { try { s.eingabe(e); } catch { fehler++; } }
  h.pfad = []; h.zielId = 0; check(fehler === 0 && JSON.stringify([h.x, h.y, h.lp]) === vor, "unsinnige oder manipulierte Eingaben werden verworfen (eigener Held als Ziel, fremde Felder, NaN)");
  s.eingabe({ t: "lauf", x: -50, y: 900 }); for (let i = 0; i < 200; i++) s.schritt(); check(h.x > 0.3 && h.y < 19.7 && Number.isFinite(h.x), "ein Klick weit außerhalb der Karte führt zum nächsten begehbaren Feld, nicht hinaus"); }
// ganze Risse vom Rechner gespielt: Der Held greift immer das nächste Monster an
{ const erg = []; for (let k = 0; k < 6; k++) { const s = new Sim(k % 2 ? "elementarist" : "schildwaechter", 100 + k), h = s.ich; let n = 0, tode = 0, lebte = true;
    while (s.phase === "lauf" && n++ < 20 * 600) { if (n % 10 === 0 && !h.tot) { const m = s.wesen.filter((w) => !w.held && !w.tot).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0]; if (m) { if (h.zielId !== m.id && !h.zielId) s.eingabe({ t: "ziel", id: m.id }); if (Math.hypot(m.x - h.x, m.y - h.y) < 4) { s.eingabe({ t: "faehig", taste: "q", x: m.x, y: m.y }); if (h.lp < h.max * 0.5) s.eingabe({ t: "faehig", taste: "e", x: h.x - (m.x - h.x), y: h.y - (m.y - h.y) }); } } }
      s.schritt(); if (h.tot && lebte) tode++; lebte = !h.tot; if (s.wesen.some((w) => !Number.isFinite(w.x) || !Number.isFinite(w.lp))) { n = 1e9; break; } }
    erg.push({ sieg: s.phase === "sieg", sek: Math.round(s.zeit), stufe: h.stufe, tode, splitter: s.splitter }); }
  check(erg.every((e) => e.sieg), `sechs Risse vom Rechner gespielt: alle bis zum Siegelwächter geschafft (${erg.map((e) => e.sek + " s").join(", ")})`);
  console.log("    Stufe am Ende: " + erg.map((e) => e.stufe).join(" ") + " · gefallen: " + erg.map((e) => e.tode).join(" ") + " · Erbsplitter: " + erg.map((e) => e.splitter).join(" "));
  const s = new Sim("schildwaechter", 3); for (const w of s.wesen) if (!w.held) { w.lp = 1; } const boss = s.wesen.find((w) => w.typ === "grabritter"); s.ich.x = boss.x - 1; s.ich.y = boss.y; s.eingabe({ t: "ziel", id: boss.id }); for (let i = 0; i < 60 && s.phase === "lauf"; i++) s.schritt();
  check(s.phase === "sieg", "fällt der Siegelwächter, ist der Riss geschafft"); const z = s.zustand(); check(JSON.stringify(z).length < 2500 && z.w.every((e) => e.length === 14), `ein Zustand ist klein (${JSON.stringify(z).length} Zeichen)`);
  s.eingabe({ t: "neu" }); check(s.phase === "lauf" && s.wesen.filter((w) => !w.held && !w.tot).length === 12, "„Neuer Riss“ baut alles frisch auf"); }

// ---------- 2. Server ----------
const PORT = 8799, server = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: String(PORT), ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((r) => server.stdout.once("data", r));
try {
  const lebt = await (await fetch(`http://localhost:${PORT}/`)).json(); check(lebt.ok === true && lebt.dienst === "mythara-echtzeit", "Server: Lebenszeichen über HTTP");
  const fremd = await new Promise((r) => { const w = new WebSocket(`ws://localhost:${PORT}/`, { origin: "https://boese.example" }); w.on("open", () => { w.close(); r(false); }); w.on("error", () => r(true)); });
  check(fremd, "Server: Verbindungen von fremden Seiten werden abgelehnt");
  const ws = new WebSocket(`ws://localhost:${PORT}/?held=schildwaechter`, { origin: "http://localhost:8765" }), nachr = []; ws.on("message", (d) => nachr.push(JSON.parse(String(d))));
  await new Promise((r, f) => { ws.on("open", r); ws.on("error", f); }); await warte(1050);
  const zust = nachr.filter((m) => m.t === "z"); check(nachr[0].t === "hallo" && zust.length >= 8 && zust.length <= 12, `Server: Begrüßung, dann etwa zehn Zustände je Sekunde (${zust.length})`);
  const ich = (z) => z.z.w.find((e) => e[0] === z.z.ich.id), a = ich(zust[zust.length - 1]); ws.send(JSON.stringify({ t: "lauf", x: 6.5, y: 2.5 })); await warte(1500); const b = ich(nachr[nachr.length - 1]);
  check(Math.hypot(b[4] - 6.5, b[5] - 2.5) < 0.2 && (a[4] !== b[4] || a[5] !== b[5]), "Server: Eine Lauf-Eingabe bewegt den Helden – berechnet vom Server");
  ws.send("kein json"); ws.send(JSON.stringify({ t: "lp", lp: 99999 })); ws.send("x".repeat(600)); await warte(300); const offen = ws.readyState === 1; const c = offen ? ich(nachr[nachr.length - 1]) : null;
  check(!offen || c[8] === a[8], "Server: Müll und Manipulationsversuche ändern nichts (zu große Nachrichten trennen die Verbindung)");
  ws.close();
  // ---------- 3. Client im Browser ----------
  const { chromium } = require("playwright"), br = await chromium.launch();
  for (const [name, url, erwartet] of [["über den Server", `http://localhost:8765/echtzeit/?server=ws://localhost:${PORT}`, "server"], ["ohne Server", "http://localhost:8765/echtzeit/?server=", "lokal"]]) {
    const p = await br.newPage({ viewport: { width: 1280, height: 720 } }), fehler = []; p.on("pageerror", (e) => fehler.push(String(e))); p.on("console", (m) => { if (m.type() === "error") fehler.push(m.text()); });
    await p.goto(url); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 15000 });
    const art = await p.evaluate(() => window.EZ.netz.art); check(art === erwartet, `Client ${name}: verbunden (${art})`);
    const ort = () => p.evaluate(() => { const z = window.EZ.zustand(); const e = z.w.find((e) => e[0] === z.ich.id); return [e[4], e[5]]; }), o1 = await ort();
    await p.mouse.click(820, 300); await p.waitForTimeout(1200); const o2 = await ort(); check(Math.hypot(o2[0] - o1[0], o2[1] - o1[1]) > 1, `Client ${name}: Klick auf den Boden – der Held läuft dorthin`);
    await p.keyboard.press("q"); await p.waitForTimeout(350); check(await p.evaluate(() => window.EZ.zustand().ich.cdQ > 3), `Client ${name}: Taste Q löst die Fähigkeit aus`);
    check(await p.evaluate(() => /Torvald/.test(document.querySelector("#ez-name").textContent) && /Monster 0 \/ 12/.test(document.querySelector("#ez-stand").textContent)), `Client ${name}: Anzeige zeigt Held und Stand`);
    if (process.env.EZ_BILD) await p.screenshot({ path: process.env.EZ_BILD.replace(".png", "-" + erwartet + ".png") });
    check(fehler.length === 0, `Client ${name}: keine Fehler` + (fehler.length ? " – " + fehler[0] : "")); await p.close(); }
  await br.close();
} finally { server.kill(); }
console.log(ok ? "\nMythara Echtzeit: alles in Ordnung" : "\nMythara Echtzeit: FEHLER"); process.exit(ok ? 0 : 1);
