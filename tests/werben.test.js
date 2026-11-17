/*
 * Mythara – Freunde werben: Einladungslink, Eintragen des Werbers, Hinweis im Dorf, Fenster mit Stand.
 * Die Datenbankfunktionen (Migration 028) sind nachgebildet; die echten prüft supabase/tests/028_rpg_freunde_werben_test.sql.
 * Aufruf: node tests/werben.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright");
const BASE = "http://localhost:8765"; let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
async function seite(b, o) {
  const ctx = await b.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: "block", permissions: ["clipboard-read", "clipboard-write"] }), p = await ctx.newPage(), fehler = [], rufe = []; p.on("pageerror", (e) => fehler.push(e.message));
  const json = (r, x, st = 200) => r.fulfill({ status: st, contentType: "application/json", body: JSON.stringify(x) });
  await p.route(/\/rest\/v1\/rpc\/rpg_[a-z_]+(\?|$)/, (r) => json(r, { code: "PGRST202", message: "Could not find the function" }, 404)); // alles andere fehlt (zuerst angemeldet: spätere Regeln gehen vor)
  await p.route(/\/rest\/v1\/rpc\/rpg_my_profile(\?|$)/, (r) => json(r, { konto: true, handle: "Wanda", avatar_key: "schildwaechter", created_at: new Date().toISOString() }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_heroes|campaign_heroes)(\?|$)/, (r) => json(r, { konto: true, helden: ["schildwaechter"], start_offen: false, angebote: [], enden: [], alle_enden: {}, titel: [] }));
  await p.route(/\/rest\/v1\/rpc\/rpg_hero_levels(\?|$)/, (r) => json(r, { konto: true, xp: {} }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_inbox|my_campaigns)(\?|$)/, (r) => json(r, r.request().url().includes("inbox") ? { freunde: [], kampagnen: [] } : []));
  await p.route(/\/rest\/v1\/rpc\/rpg_referral_(set|status)(\?|$)/, (r) => { const name = /rpc\/(rpg_[a-z_]+)/.exec(r.request().url())[1]; let a = {}; try { a = JSON.parse(r.request().postData() || "{}"); } catch (e) { /* leer */ } rufe.push([name, a]);
    if (o.ohne) return json(r, { code: "PGRST202", message: "Could not find the function" }, 404);
    if (name === "rpg_referral_set") return json(r, { ok: true, von: "Bruno" });
    return json(r, { konto: true, name: "Wanda", max: 5, belohnt: o.belohnt || 0, offen: 1, von: null, freunde: [{ name: "Neo", belohnt: false, seit: new Date().toISOString() }, { name: "Zwo", belohnt: true, seit: new Date().toISOString() }].slice(0, o.freunde == null ? 2 : o.freunde) }); });
  return { p, fehler, rufe, ctx };
}
(async () => {
  const b = await chromium.launch(); console.log("Freunde werben");
  // 1) Einladungslink auf der Startseite
  { const { p, ctx } = await seite(b, {}); await p.goto(BASE + "/index.html?von=Bruno"); await p.waitForTimeout(1000);
    const r = await p.evaluate(() => ({ url: location.pathname + location.search, von: localStorage.getItem("mythara_von"), text: document.getElementById("einladung").textContent, da: !document.getElementById("einladung").hidden }));
    check(r.url === "/index.html" && r.von === "Bruno" && r.da && /Bruno lädt dich/.test(r.text), "Einladungslink: Die Startseite merkt sich den Namen, zeigt „Bruno lädt dich ein“ und nimmt ihn aus der Adresse");
    await p.goto(BASE + "/index.html?von=%3Cscript%3E"); await p.waitForTimeout(600);
    check(await p.evaluate(() => localStorage.getItem("mythara_von") === "Bruno" && document.getElementById("einladung").hidden), "Ein ungültiger Name wird nicht übernommen");
    // 2) Im Dorf wird der Werber eingetragen
    const s = await seite(b, {}); await s.ctx.addInitScript(() => { try { if (!sessionStorage.getItem("x")) { localStorage.setItem("mythara_von", "Bruno"); sessionStorage.setItem("x", "1"); } } catch (e) { /* */ } });
    await s.p.goto(BASE + "/spiel.html?schnell"); await s.p.waitForSelector("#werben-hinweis:not([hidden])", { timeout: 20000 });
    const set = s.rufe.filter((x) => x[0] === "rpg_referral_set");
    check(set.length === 1 && set[0][1].p_von === "Bruno" && await s.p.evaluate(() => localStorage.getItem("mythara_von") === null), "Mit Konto im Dorf: Der Werber wird genau einmal eingetragen, der gemerkte Name danach gelöscht");
    const h = await s.p.evaluate(() => { const e = document.getElementById("werben-hinweis"); return { text: e.textContent, im: e.parentElement.id }; });
    check(/Freunde einladen/.test(h.text) && /Heldentoken/.test(h.text) && /0 \/ 5/.test(h.text) && h.im === "hub-start", "Im Dorf steht der Hinweis „Freunde einladen“ mit dem Stand 0 / 5");
    await s.p.click("#werben-hinweis"); await s.p.waitForSelector("#werben-url");
    const f = await s.p.evaluate(() => ({ url: document.getElementById("werben-url").value, text: document.querySelector(".werben").textContent }));
    check(f.url === BASE + "/?von=Wanda" && /Neo/.test(f.text) && /spielt noch/.test(f.text) && /Zwo/.test(f.text) && /Token erhalten/.test(f.text), "Das Fenster zeigt den eigenen Link und die geworbenen Freunde mit ihrem Stand");
    await s.p.click("#werben-kopieren"); await s.p.waitForTimeout(300);
    check(await s.p.evaluate(() => navigator.clipboard.readText()) === BASE + "/?von=Wanda" && /kopiert/.test(await s.p.textContent("#werben-fb")), "„Link kopieren“ legt den Link in die Zwischenablage");
    check(await s.p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Hinweis und Fenster passen in Handybreite");
    if (process.env.SHOT_DIR) await s.p.screenshot({ path: process.env.SHOT_DIR + "/werben-fenster.png" });
    check(!s.fehler.length, "keine Skriptfehler" + (s.fehler.length ? ": " + s.fehler.join(" | ") : ""));
    await ctx.close(); await s.ctx.close(); }
  // 3) Ohne Migration 028 bleibt alles unsichtbar, der gemerkte Name bleibt für später
  { const s = await seite(b, { ohne: true }); await s.ctx.addInitScript(() => { try { localStorage.setItem("mythara_von", "Bruno"); } catch (e) { /* */ } });
    await s.p.goto(BASE + "/spiel.html?schnell"); await s.p.waitForSelector('.dorf-ort[data-hub="shop"]', { timeout: 20000 }); await s.p.waitForTimeout(1500);
    check(await s.p.evaluate(() => { const e = document.getElementById("werben-hinweis"); return (!e || e.hidden) && localStorage.getItem("mythara_von") === "Bruno"; }) && !s.fehler.length, "Ohne Migration 028: kein Hinweis, keine Fehlermeldung, der Name bleibt gemerkt");
    await s.ctx.close(); }
  await b.close(); console.log(ok ? "\nWERBEN IN ORDNUNG" : "\nWERBEN: FEHLER"); process.exit(ok ? 0 : 1);
})();
