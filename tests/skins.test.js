/*
 * Mythara – Helden-Skins: Reiter beim Händler, Kauf, Anlegen auf der Heldenkarte, Bilder im Spiel.
 * Die Datenbankfunktionen (Migration 029) sind nachgebildet; die echten prüft supabase/tests/029_rpg_skins_test.sql.
 * Aufruf: node tests/skins.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const BASE = "http://localhost:8765", WURZEL = path.join(__dirname, ".."); let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
function welt(o) {
  const DB = { waehrung: o.waehrung, helden: o.helden, besitz: [], aktiv: {}, rufe: [], ohne: Boolean(o.ohne) };
  const KAT = [{ id: "berserker_wolfsblut", held: "berserker", preis: 650 }, { id: "assassine_rabenschatten", held: "assassine", preis: 650 }];
  const stand = () => ({ konto: true, waehrung: DB.waehrung, aktiv: Object.assign({}, DB.aktiv), katalog: KAT.map((k) => Object.assign({}, k, { besitzt: DB.besitz.includes(k.id), hat_held: DB.helden.includes(k.held) })) });
  DB.server = (name, a) => { DB.rufe.push([name, a]);
    if (DB.ohne) return { fehler: "Could not find the function", fehlt: true };
    if (name === "rpg_skins") return stand();
    if (name === "rpg_skin_buy") { const k = KAT.find((x) => x.id === a.p_id); if (!k) return { fehler: "Das führt der Händler nicht." }; if (!DB.helden.includes(k.held)) return { fehler: "Diesen Helden hast du noch nicht." }; if (DB.waehrung < k.preis) return { fehler: "Dafür reichen deine Seelensplitter nicht." }; DB.waehrung -= k.preis; DB.besitz.push(k.id); return stand(); }
    if (name === "rpg_skin_equip") { if (a.p_skin == null) delete DB.aktiv[a.p_held]; else { if (!DB.besitz.includes(a.p_skin)) return { fehler: "Diesen Skin besitzt du nicht für diesen Helden." }; DB.aktiv[a.p_held] = a.p_skin; } return stand(); }
    return { fehler: "nicht erwartet", fehlt: true }; };
  return DB;
}
async function seite(b, DB) {
  const ctx = await b.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: "block" }), p = await ctx.newPage(), fehler = [], fehlend = []; p.on("pageerror", (e) => fehler.push(e.message)); p.on("dialog", (d) => d.accept());
  p.on("response", (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) fehlend.push(r.url().replace(BASE, "")); });
  const json = (r, x, st = 200) => r.fulfill({ status: st, contentType: "application/json", body: JSON.stringify(x) });
  await p.route(/\/rest\/v1\/rpc\/rpg_[a-z_]+(\?|$)/, (r) => json(r, { code: "PGRST202", message: "Could not find the function" }, 404));
  await p.route(/\/rest\/v1\/rpc\/rpg_my_profile(\?|$)/, (r) => json(r, { konto: true, handle: "Wanda", avatar_key: "schildwaechter", created_at: new Date().toISOString() }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_heroes|campaign_heroes)(\?|$)/, (r) => json(r, { konto: true, helden: DB.helden, start_offen: false, angebote: [], enden: [], alle_enden: {}, titel: [] }));
  await p.route(/\/rest\/v1\/rpc\/rpg_hero_levels(\?|$)/, (r) => json(r, { konto: true, xp: {} }));
  await p.route(/\/rest\/v1\/rpc\/rpg_(my_inbox|my_campaigns)(\?|$)/, (r) => json(r, r.request().url().includes("inbox") ? { freunde: [], kampagnen: [] } : []));
  await p.route(/\/rest\/v1\/rpc\/rpg_shop_week(\?|$)/, (r) => json(r, { konto: true, preis: 830, angebot: 415, token_preis: 830, tokens: 0, waehrung: DB.waehrung, bis: new Date(Date.now() + 2 * 864e5).toISOString(), alle: false, held: "gelehrter", gekauft: false }));
  await p.route(/\/rest\/v1\/rpc\/rpg_skin[a-z_]*(\?|$)/, (r) => { const name = /rpc\/(rpg_[a-z_]+)/.exec(r.request().url())[1]; let a = {}; try { a = JSON.parse(r.request().postData() || "{}"); } catch (e) { /* leer */ }
    const e = DB.server(name, a); return e && e.fehler ? json(r, { code: e.fehlt ? "PGRST202" : "P0001", message: e.fehler }, e.fehlt ? 404 : 400) : json(r, e); });
  await p.goto(BASE + "/spiel.html?schnell"); await p.waitForSelector('.dorf-ort[data-hub="shop"]', { timeout: 20000 });
  return { p, fehler, fehlend, ctx };
}
const shot = async (p, n) => { if (process.env.SHOT_DIR) await p.screenshot({ path: process.env.SHOT_DIR + "/" + n + ".png" }); };
(async () => {
  const b = await chromium.launch(); console.log("Helden-Skins");
  for (const id of ["berserker_wolfsblut", "assassine_rabenschatten", "gelehrter_sternenkunde"]) check(["img/figuren/" + id + ".jpg", "img/figuren/ganz/" + id + ".webp", "img/figuren/ganz/" + id + "-gross.webp"].every((f) => fs.existsSync(path.join(WURZEL, f))), `Bilder für ${id}: Porträt, Kampffigur und großes Bild sind da`);
  { const DB = welt({ waehrung: 1000, helden: ["schildwaechter", "berserker"] }), { p, fehler, fehlend, ctx } = await seite(b, DB);
    await p.waitForFunction(() => window.SKINS && window.SKINS.da(), null, { timeout: 15000 });
    await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector('[data-shop-feld="skins"]');
    check(/Skins/.test(await p.textContent('[data-shop-feld="skins"]')) && /650/.test(await p.textContent('[data-shop-feld="skins"]')), "Beim Händler gibt es die Kachel „Skins“ (ab 650 Seelensplitter)");
    await p.click('[data-shop-feld="skins"]'); await p.waitForSelector(".skin-karte"); await shot(p, "skins-haendler");
    const k = await p.evaluate(() => [...document.querySelectorAll(".skin-karte")].map((e) => ({ t: e.textContent, kauf: Boolean(e.querySelector("[data-skin-kauf]:not([disabled])")), zu: Boolean(e.querySelector("button[disabled]")) })));
    check(k.length === 2 && /Wolfsblut/.test(k[0].t) && /Skin für Ragnar/.test(k[0].t) && k[0].kauf && /Rabenschatten/.test(k[1].t) && k[1].zu && /brauchst du erst Vex/.test(k[1].t), "Der Reiter zeigt beide Skins mit Namen: Wolfsblut ist kaufbar, Rabenschatten erst mit Vex");
    await p.click('[data-skin-kauf="berserker_wolfsblut"]'); await p.waitForSelector('[data-skin-anlegen="berserker_wolfsblut"]');
    check(DB.waehrung === 350 && DB.besitz.includes("berserker_wolfsblut") && DB.aktiv.berserker === "berserker_wolfsblut" && /gehört jetzt dir/.test(await p.textContent(".shop-meldung")), "Gekauft: 650 Seelensplitter weg, der Skin gehört dem Konto und ist gleich angelegt");
    check(await p.evaluate(() => window.ABF.bild("berserker") === "img/figuren/berserker_wolfsblut.jpg" && window.ABF.ganzBild("berserker") === "img/figuren/ganz/berserker_wolfsblut.webp" && window.ABF.bild("berserker", null) === "img/figuren/berserker.jpg" && window.ABF.bild("schildwaechter") === "img/figuren/schildwaechter.jpg"), "Ragnars Bilder kommen jetzt vom Skin, andere Helden bleiben unverändert");
    // Heldenhalle: Aussehen wählen
    await p.evaluate(() => window.MYTHARA.zeigeHub()); await p.click('.dorf-ort[data-hub="helden"]'); await p.waitForSelector('#hub-seite [data-klasse="krieger"]');
    if (!(await p.$('#hub-seite [data-fid="berserker"]'))) await p.click('#hub-seite [data-klasse="krieger"]');
    await p.waitForSelector('#hub-seite [data-fid="berserker"]', { timeout: 8000 }).catch(async () => { console.log("DBG", (await p.evaluate(() => document.querySelector("#hub-seite").innerHTML.slice(0, 600)))); });
    if (!(await p.$('[data-skin-wahl="berserker"]'))) await p.click('#hub-seite [data-fid="berserker"]');
    await p.waitForSelector('[data-skin-wahl="berserker"]'); await shot(p, "skins-heldenkarte");
    const w = await p.evaluate(() => ({ punkte: [...document.querySelectorAll("[data-skin-wahl] .skin-wahl-punkt")].map((e) => e.textContent.trim() + (e.classList.contains("an") ? " [an]" : "")), bild: document.querySelector(".held-bild img").getAttribute("src") }));
    check(w.punkte.length === 2 && /Standard/.test(w.punkte[0]) && /Wolfsblut.*\[an\]/.test(w.punkte[1]) && /berserker_wolfsblut/.test(w.bild), "Heldenkarte: „Aussehen“ mit Standard und Wolfsblut (angelegt), das Kartenbild zeigt den Skin");
    await p.click('[data-skin-wahl] [data-skin-setzen=""]'); await p.waitForFunction(() => /img\/figuren\/berserker\.jpg/.test(document.querySelector(".held-bild img").getAttribute("src")), null, { timeout: 8000 }).catch(() => {});
    check(!DB.aktiv.berserker && await p.evaluate(() => window.ABF.bild("berserker") === "img/figuren/berserker.jpg" && document.querySelector("[data-skin-wahl] .skin-wahl-punkt.an").textContent.includes("Standard")), "Zurück auf Standard: Ragnar sieht wieder normal aus");
    await p.click('[data-skin-wahl] [data-skin-setzen="berserker_wolfsblut"]'); await p.waitForFunction(() => /wolfsblut/.test(document.querySelector(".held-bild img").getAttribute("src")), null, { timeout: 8000 }).catch(() => {});
    check(DB.aktiv.berserker === "berserker_wolfsblut", "Wieder angelegt");
    // Gegner in der Arena: eigener und fremder Skin getrennt
    check(await p.evaluate(() => { const F = window.ABF; F.SKIN.gegner = { assassine: "assassine_rabenschatten" }; const r = F.bild("assassine", F.SKIN.gegner.assassine) === "img/figuren/assassine_rabenschatten.jpg" && F.bild("assassine") === "img/figuren/assassine.jpg" && F.bild("berserker", F.SKIN.gegner.berserker || null) === "img/figuren/berserker.jpg" && F.bild("assassine", "berserker_wolfsblut") === "img/figuren/assassine.jpg"; F.SKIN.gegner = {}; return r; }), "Arena: Der Skin des Gegners gilt nur für dessen Helden, der eigene nur für die eigenen; ein fremder Skin passt auf keinen anderen Helden");
    check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Alles passt in Handybreite");
    check(!fehler.length && !fehlend.length, "keine Skriptfehler, keine fehlenden Bilder" + (fehler.length || fehlend.length ? ": " + fehler.concat(fehlend).join(" | ") : ""));
    await ctx.close(); }
  { const DB = welt({ waehrung: 1000, helden: ["berserker"], ohne: true }), { p, fehler, ctx } = await seite(b, DB); await p.waitForTimeout(1200);
    await p.click('.dorf-ort[data-hub="shop"]'); await p.waitForSelector("[data-shop-feld]");
    check(!(await p.$('[data-shop-feld="skins"]')) && !fehler.length && await p.evaluate(() => window.ABF.bild("berserker") === "img/figuren/berserker.jpg"), "Ohne Migration 029: keine Kachel, keine Fehlermeldung, alle Bilder normal");
    await ctx.close(); }
  { const R = require("../js/regeln.js"), sql = fs.readFileSync(path.join(WURZEL, "supabase/029_rpg_skins.sql"), "utf8"), SK = require("../js/skins.js").SKINS;
    check(Object.keys(SK).length === 3 && Object.entries(SK).every(([id, s]) => R.FD.FIGUREN[s.held] && s.name && new RegExp("'" + id + "', '" + s.held + "', 650").test(sql)), "Jeder Skin im Spiel steht mit seinem Helden und 650 Seelensplittern in der Migration (" + Object.values(SK).map((s) => s.name).join(", ") + ")"); }
  await b.close(); console.log(ok ? "\nSKINS IN ORDNUNG" : "\nSKINS: FEHLER"); process.exit(ok ? 0 : 1);
})();
