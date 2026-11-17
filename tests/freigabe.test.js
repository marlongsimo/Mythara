/*
 * Mythara – neue Helden: unsichtbar bis zur Freigabe, Start-Angebot beim Händler, Schalter im Admin-Bereich.
 * Die Datenbankfunktionen (Migration 033) sind nachgebildet; die echten prüft supabase/tests/033_rpg_helden_freigabe_test.sql.
 * Aufruf: node tests/freigabe.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright");
const BASE = "http://localhost:8765"; let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
const shot = async (p, n) => { if (process.env.SHOT_DIR) await p.screenshot({ path: process.env.SHOT_DIR + "/" + n + ".png", fullPage: true }); };
async function seite(b, DB, vp) {
  const ctx = DB.ctx || await b.newContext({ viewport: vp || { width: 420, height: 900 }, serviceWorkers: "block" }), p = await ctx.newPage(), fehler = []; p.on("pageerror", (e) => fehler.push(e.message)); p.on("dialog", (d) => d.accept());
  const json = (r, x, st = 200) => r.fulfill({ status: st, contentType: "application/json", body: JSON.stringify(x) });
  const angebot = () => ({ id: "start_runenklinge", held: "runenklinge", skin: "runenklinge_s1", pakete: { gross: 2, mittel: 1 }, preis: 1698, einzeln: 2830, ep: 850, bis: new Date(Date.now() + 5 * 864e5 - 6e4).toISOString(),
    hat_held: DB.helden.includes("runenklinge"), hat_skin: DB.skin, gekauft: DB.gekauft });
  const plan = () => [{ held: "runenklinge", klasse: "zauberer", skin: "runenklinge_s1", pakete: { gross: 2, mittel: 1 }, preis: 1698, tage: 5, freigegeben: DB.frei ? "2026-12-01T19:00:00Z" : null, angebot_bis: DB.frei ? "2026-12-06T19:00:00Z" : null, gekauft: DB.gekauft ? 1 : 0 }];
  await p.route(/\/rest\/v1\/rpc\/rpg_[a-z_]+(\?|$)/, (r) => json(r, { code: "PGRST202", message: "Could not find the function" }, 404));
  await p.route(/daten\/neuigkeiten\.json/, (r) => json(r, []));
  await p.route(/\/rest\/v1\/rpc\/rpg_my_profile(\?|$)/, (r) => json(r, { konto: true, handle: "Wanda", avatar_key: "schildwaechter", created_at: new Date().toISOString() }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_heroes|campaign_heroes)(\?|$)/, (r) => json(r, { konto: true, admin: Boolean(DB.admin), helden: DB.helden, start_offen: false, angebote: [], enden: [], alle_enden: {}, titel: [] }));
  await p.route(/\/rest\/v1\/rpc\/rpg_hero_levels(\?|$)/, (r) => json(r, { konto: true, xp: {} }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_inbox|my_campaigns)(\?|$)/, (r) => json(r, r.request().url().includes("inbox") ? { freunde: [], kampagnen: [] } : []));
  await p.route(/\/rest\/v1\/rpc\/rpg_shop_week(\?|$)/, (r) => json(r, { konto: true, preis: 830, angebot: 415, token_preis: 830, tokens: 0, waehrung: DB.waehrung, bis: new Date(Date.now() + 2 * 864e5).toISOString(), alle: false, held: "gelehrter", gekauft: false }));
  await p.route(/\/rest\/v1\/rpc\/rpg_admin_codes(\?|$)/, (r) => json(r, []));
  if (!DB.ohne) await p.route(/\/rest\/v1\/rpc\/rpg_(hero_katalog|launch_list|launch_buy|admin_hero_plan|admin_hero_release)(\?|$)/, (r) => { const name = /rpc\/(rpg_[a-z_]+)/.exec(r.request().url())[1]; let a = {}; try { a = JSON.parse(r.request().postData() || "{}"); } catch (e) { /* leer */ }
    DB.rufe.push([name, a]); const liste = () => ({ konto: true, waehrung: DB.waehrung, angebote: DB.frei ? [angebot()] : [] });
    if (name === "rpg_hero_katalog") return json(r, ["schildwaechter", "gelehrter"].concat(DB.frei ? ["runenklinge"] : []));
    if (name === "rpg_launch_list") return json(r, liste());
    if (name === "rpg_launch_buy") { if (DB.gekauft) return json(r, { code: "P0001", message: "Dieses Angebot hast du schon gekauft." }, 400); if (DB.waehrung < 1698) return json(r, { code: "P0001", message: "Dafür reichen deine Seelensplitter nicht." }, 400);
      DB.waehrung -= 1698; DB.gekauft = true; DB.skin = true; if (!DB.helden.includes("runenklinge")) DB.helden.push("runenklinge"); return json(r, liste()); }
    if (!DB.admin) return json(r, { code: "P0001", message: "Nur Admins." }, 400);
    if (name === "rpg_admin_hero_release") { DB.frei = true; return json(r, plan()); }
    return json(r, plan()); });
  await p.goto(BASE + "/spiel.html?schnell"); await p.waitForSelector('.dorf-ort[data-hub="shop"]', { timeout: 20000 });
  return { p, fehler, ctx };
}
const welt = (o) => Object.assign({ waehrung: 2000, helden: ["schildwaechter"], frei: false, gekauft: false, skin: false, rufe: [] }, o);
(async () => {
  const b = await chromium.launch(); console.log("Helden-Freigabe");
  { const DB = welt({}), { p, fehler, ctx } = await seite(b, DB); await p.waitForTimeout(1200);
    check(await p.evaluate(() => Boolean(window.ABF.FIGUREN.runenklinge) && !window.ABF.REIHE.includes("runenklinge")), "Vor der Freigabe: Thessa steckt in den Regeln, steht aber nicht in der Heldenreihe");
    await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector("[data-woche]"); await p.waitForTimeout(400);
    check(!(await p.$("[data-start]")) && !fehler.length && await p.evaluate(() => !document.body.innerHTML.includes("Thessa")), "Vor der Freigabe: kein Start-Angebot beim Händler, Thessa taucht nirgends auf"); await ctx.close(); }
  { const DB = welt({ ohne: true }), { p, fehler, ctx } = await seite(b, DB); await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector("[data-woche]"); await p.waitForTimeout(400);
    check(!(await p.$("[data-start]")) && !fehler.length, "Ohne Migration 033: kein Angebot, keine Fehlermeldung"); await ctx.close(); }
  for (const vp of [{ width: 420, height: 900 }, { width: 1280, height: 900 }]) { const DB = welt({ frei: true }), { p, fehler, ctx } = await seite(b, DB, vp);
    await p.waitForFunction(() => window.ABF.REIHE.includes("runenklinge"), null, { timeout: 8000 }).catch(() => {});
    const r = await p.evaluate(() => ({ r: window.ABF.REIHE, k: window.ABF.FIGUREN }));
    check(r.r.includes("runenklinge") && r.k[r.r[r.r.indexOf("runenklinge") - 1]].klasse === "zauberer", "Nach der Freigabe (" + vp.width + " px): Thessa steht in der Heldenreihe, bei den Zauberern");
    await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector("[data-start]"); await p.waitForTimeout(500); await shot(p, "start-angebot-" + vp.width);
    const a = await p.evaluate(() => { const s = document.querySelector("[data-start]"), w = document.querySelector("[data-woche]"), bilder = [...s.querySelectorAll("img")];
      return { text: s.textContent.replace(/\s+/g, " "), vor: Boolean(s.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING), bilder: bilder.length && bilder.every((i) => i.complete && i.naturalWidth > 0), breit: document.documentElement.scrollWidth <= innerWidth }; });
    check(/Thessa/.test(a.text) && /−40 %/.test(a.text) && /2830/.test(a.text) && /1698/.test(a.text) && /Runenkönigin/.test(a.text) && /850 EP/.test(a.text) && /Noch 4 T\./.test(a.text), "Start-Angebot: Thessa, Skin „Runenkönigin“, 850 EP, 1698 statt 2830 (−40 %), Restzeit: " + a.text.slice(0, 150));
    check(a.vor && a.bilder && a.breit, "Es steht über dem Wochenangebot, beide Bilder laden, nichts ragt über den Rand");
    await p.click("[data-start]"); await p.waitForSelector("[data-start-kauf]"); await shot(p, "start-seite-" + vp.width);
    const t = await p.evaluate(() => document.querySelector("[data-startseite]").textContent.replace(/\s+/g, " "));
    check(/2× großes Erfahrungspaket \(350 EP\)/.test(t) && /1× mittleres Erfahrungspaket \(150 EP\)/.test(t) && /von Stufe 1 auf Stufe 5/.test(t) && await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Angebotsseite: zählt Heldin, Skin und die Erfahrungspakete auf");
    await p.click("[data-start-kauf]"); await p.waitForSelector(".shop-meldung");
    check(DB.waehrung === 302 && DB.rufe.some((x) => x[0] === "rpg_launch_buy" && x[1].p_id === "start_runenklinge") && /gehört jetzt zu deiner Sammlung/.test(await p.textContent(".shop-meldung")) && !(await p.$("[data-start-kauf]")) && /Gekauft|gekauft/.test(await p.textContent(".paket-kauf")), "Gekauft: 1698 Seelensplitter weg, die Seite zeigt „gekauft“ statt des Knopfs");
    await p.click("[data-shop-zurueck]"); await p.waitForSelector("[data-start]");
    check(/Gekauft/.test(await p.textContent("[data-start]")) && !fehler.length, "Beim Händler steht das Angebot als gekauft; keine Skriptfehler" + (fehler.length ? ": " + fehler.join(" | ") : ""));
    if (vp.width === 420) { DB.ctx = ctx; DB.ohne = true; const z = await seite(b, DB); check(await z.p.evaluate(() => window.ABF.REIHE.includes("runenklinge")), "Beim nächsten Laden ist Thessa sofort da (gemerkt im Browser), auch wenn die Datenbank gerade nicht antwortet"); }
    await ctx.close(); }
  { const DB = welt({ frei: true, helden: ["schildwaechter", "runenklinge"], waehrung: 100 }), { p, ctx } = await seite(b, DB); await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector("[data-start]"); await p.click("[data-start]"); await p.waitForSelector("[data-start-kauf]");
    const t = await p.evaluate(() => document.querySelector("[data-startseite]").textContent.replace(/\s+/g, " "));
    check(/hast du schon/.test(t) && /Angebotspreis bleibt gleich/.test(t) && /Dir fehlen 1598/.test(t) && await p.evaluate(() => document.querySelector("[data-start-kauf]").disabled), "Wer Thessa schon hat, sieht das Angebot zum vollen Angebotspreis; ohne genug Seelensplitter ist der Knopf gesperrt"); await ctx.close(); }
  { const DB = welt({ admin: true }), { p, fehler, ctx } = await seite(b, DB); await p.click("#hub-profil-knopf"); await p.click('#hub-menue [data-profil="admin"]'); await p.waitForSelector('[data-admin-tab="helden"]'); await p.click('[data-admin-tab="helden"]'); await p.waitForSelector("[data-frei]");
    await shot(p, "freigabe-admin");
    const t = await p.evaluate(() => document.querySelector(".fb-admin").textContent.replace(/\s+/g, " "));
    check(/wartet/.test(t) && /Thessa/.test(t) && /1698/.test(t) && /5 Tage/.test(t) && /2× gross, 1× mittel/.test(t), "Admin, Reiter „Helden“: Thessa wartet, mit Preis, Dauer und Paketen");
    await p.click("[data-frei]"); await p.waitForSelector(".fb-admin .shop-meldung");
    const n = await p.evaluate(() => ({ t: document.querySelector(".fb-admin").textContent.replace(/\s+/g, " "), knopf: Boolean(document.querySelector("[data-frei]")), reihe: window.ABF.REIHE.includes("runenklinge") }));
    check(DB.frei && DB.rufe.some((x) => x[0] === "rpg_admin_hero_release" && x[1].p_held === "runenklinge") && /ist freigegeben/.test(n.t) && /Angebot bis/.test(n.t) && !n.knopf && n.reihe && !fehler.length, "Schalter umgelegt: Freigabe gerufen, Thessa sofort sichtbar, der Knopf ist weg; keine Skriptfehler"); await ctx.close(); }
  await b.close(); console.log(ok ? "\nFREIGABE IN ORDNUNG" : "\nFREIGABE: FEHLER"); process.exit(ok ? 0 : 1);
})();
