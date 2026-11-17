/*
 * Mythara – Feedback: Eintrag im Profil-Menü (nur mit Konto), Senden, Reiter „Nachrichten“ im Admin-Bereich.
 * Die Datenbankfunktionen (Migration 032) sind nachgebildet; die echten prüft supabase/tests/032_rpg_feedback_test.sql.
 * Aufruf: node tests/feedback.test.js   (Testserver auf Port 8765)
 */
const { chromium } = require("playwright");
const BASE = "http://localhost:8765"; let ok = true; const check = (c, m) => { console.log((c ? "  ✓ " : "  ✗ ") + m); if (!c) ok = false; };
async function seite(b, o) {
  const ctx = await b.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: "block" }), p = await ctx.newPage(), fehler = [], post = o.post || []; p.on("pageerror", (e) => fehler.push(e.message)); p.on("dialog", (d) => d.accept());
  const json = (r, x, st = 200) => r.fulfill({ status: st, contentType: "application/json", body: JSON.stringify(x) });
  const liste = (nur) => ({ neu: post.filter((x) => !x.gelesen).length, gesamt: post.length, liste: post.filter((x) => !nur || !x.gelesen).slice().reverse() });
  await p.route(/\/rest\/v1\/rpc\/rpg_[a-z_]+(\?|$)/, (r) => json(r, { code: "PGRST202", message: "Could not find the function" }, 404));
  await p.route(/daten\/neuigkeiten\.json/, (r) => json(r, []));
  if (o.konto) {
    await p.route(/\/rest\/v1\/rpc\/rpg_my_profile(\?|$)/, (r) => json(r, { konto: true, handle: "Wanda", avatar_key: "schildwaechter", created_at: new Date().toISOString() }));
    await p.route(/\/rest\/v1\/rpc\/rpg_(my_heroes|campaign_heroes)(\?|$)/, (r) => json(r, { konto: true, admin: Boolean(o.admin), helden: ["schildwaechter"], start_offen: false, angebote: [], enden: [], alle_enden: {}, titel: [] }));
    await p.route(/\/rest\/v1\/rpc\/rpg_hero_levels(\?|$)/, (r) => json(r, { konto: true, xp: {} }));
    await p.route(/\/rest\/v1\/rpc\/rpg_(my_inbox|my_campaigns)(\?|$)/, (r) => json(r, r.request().url().includes("inbox") ? { freunde: [], kampagnen: [] } : []));
    await p.route(/\/rest\/v1\/rpc\/rpg_(feedback_send|admin_feedback|admin_feedback_read)(\?|$)/, (r) => { const name = /rpc\/(rpg_[a-z_]+)/.exec(r.request().url())[1]; let a = {}; try { a = JSON.parse(r.request().postData() || "{}"); } catch (e) { /* leer */ }
      if (name === "rpg_feedback_send") { if (o.voll) return json(r, { code: "P0001", message: "Du hast gerade schon mehrere Nachrichten geschickt. Bitte versuch es später noch einmal." }, 400); post.push({ id: "n" + post.length, art: a.p_art, text: a.p_text, von: "Wanda", am: new Date().toISOString(), gelesen: false, kontext: a.p_kontext }); return json(r, { ok: true }); }
      if (!o.admin) return json(r, { code: "P0001", message: "Nur Admins lesen die Nachrichten." }, 400);
      if (name === "rpg_admin_feedback_read") { post.forEach((x) => { if (a.p_id == null || x.id === a.p_id) x.gelesen = a.p_id == null ? true : a.p_gelesen; }); return json(r, liste(false)); }
      return json(r, liste(a.p_nur_neu)); });
  }
  await p.goto(BASE + "/spiel.html?schnell"); if (!o.konto) await p.click("#my-gast-start"); await p.waitForSelector("#hub-profil-knopf", { timeout: 20000 });
  return { p, fehler, post, ctx };
}
(async () => {
  const b = await chromium.launch(); console.log("Feedback");
  { const { p, ctx } = await seite(b, {}); await p.click("#hub-profil-knopf");
    check(!(await p.$('#hub-menue [data-profil="feedback"]')), "Gäste haben im Menü keinen Eintrag „Feedback geben“"); await ctx.close(); }
  { const { p, fehler, post, ctx } = await seite(b, { konto: true }); await p.click("#hub-profil-knopf");
    const m = await p.evaluate(() => [...document.querySelectorAll("#hub-menue button")].map((x) => x.textContent.trim()));
    check(m.indexOf("Feedback geben") === m.indexOf("Abmelden") - 1 && m.indexOf("Feedback geben") > 0, "Mit Konto steht „Feedback geben“ im Profil-Menü direkt vor „Abmelden“: " + m.join(" · "));
    await p.click('#hub-menue [data-profil="feedback"]'); await p.waitForSelector("#fb-text");
    await p.fill("#fb-text", "ab"); await p.click("#fb-senden"); check(/ein paar Worte/.test(await p.textContent("#fb-fb")) && post.length === 0, "Zu kurze Nachricht: Hinweis, nichts gesendet");
    await p.click('.fb-art input[value="bug"] + span'); await p.fill("#fb-text", "Grau bleibt im Kampf stehen,\nwenn Faye am Boden liegt."); check(Number(await p.textContent("#fb-zahl")) === await p.evaluate(() => document.querySelector("#fb-text").value.length) && Number(await p.textContent("#fb-zahl")) > 40, "Der Zähler zeigt die Länge");
    if (process.env.SHOT_DIR) await p.screenshot({ path: process.env.SHOT_DIR + "/feedback.png" });
    await p.click("#fb-senden"); await p.waitForSelector(".fb-danke");
    const k = post[0] && post[0].kontext;
    check(post.length === 1 && post[0].art === "bug" && /Grau bleibt/.test(post[0].text) && k && /^\d+\.\d+$/.test(k.stand) && /^hub/.test(k.ansicht) && k.schirm === "420x900" && /Mozilla/.test(k.geraet), "Gesendet als Bug, mit Spielstand, Ansicht, Bildschirm und Gerät: " + JSON.stringify(k && { stand: k.stand, ansicht: k.ansicht, schirm: k.schirm }));
    check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth) && !fehler.length, "Passt in Handybreite, keine Skriptfehler"); await ctx.close(); }
  { const { p, ctx } = await seite(b, { konto: true, voll: true }); await p.click("#hub-profil-knopf"); await p.click('#hub-menue [data-profil="feedback"]'); await p.fill("#fb-text", "Noch eine Nachricht"); await p.click("#fb-senden");
    await p.waitForFunction(() => /später noch einmal/.test(document.querySelector("#fb-fb").textContent), null, { timeout: 8000 }).catch(() => {});
    check(/später noch einmal/.test(await p.textContent("#fb-fb")) && await p.evaluate(() => !document.querySelector("#fb-senden").disabled && document.querySelector("#fb-text").value === "Noch eine Nachricht"), "Bei der Begrenzung bleibt der Text stehen, die Meldung der Datenbank wird gezeigt"); await ctx.close(); }
  { const post = [{ id: "a", art: "feedback", text: "Tolle <b>Skins</b>!", von: "Neo", am: "2026-11-17T10:00:00Z", gelesen: true, kontext: { stand: "86.32", ansicht: "hub/shop" } }, { id: "b", art: "bug", text: "Arena hängt", von: "Zwo", am: "2026-11-17T12:00:00Z", gelesen: false, kontext: { stand: "86.32", ansicht: "kampf", arena: true, fehler: "x is undefined @ spiel.js:12" } }];
    const { p, fehler, ctx } = await seite(b, { konto: true, admin: true, post });
    await p.waitForFunction(() => document.querySelector("#hub-profil-knopf").classList.contains("post"), null, { timeout: 10000 }).catch(() => {});
    await p.click("#hub-profil-knopf");
    check(await p.evaluate(() => document.querySelector("#hub-profil-knopf").classList.contains("post") && /Admin-Bereich\s*1/.test(document.querySelector('#hub-menue [data-profil="admin"]').textContent)), "Admin: Punkt am Profilbild und „1“ am Eintrag Admin-Bereich für eine ungelesene Nachricht");
    await p.click('#hub-menue [data-profil="admin"]'); await p.waitForSelector(".fb-eintrag");
    const a = await p.evaluate(() => ({ tabs: [...document.querySelectorAll("[data-admin-tab]")].map((x) => x.textContent + (x.classList.contains("an") ? "*" : "")), eintraege: [...document.querySelectorAll(".fb-eintrag")].map((e) => e.textContent.replace(/\s+/g, " ")), neu: document.querySelectorAll(".fb-eintrag.neu").length, html: document.querySelector(".fb-admin").innerHTML }));
    check(a.tabs.includes("Nachrichten*") && a.eintraege.length === 2 && /Bug\s*Zwo.*Arena hängt.*Stand 86\.32.*im Arenakampf.*Letzter Fehler: x is undefined/.test(a.eintraege[0]) && a.neu === 1 && !/<b>Skins<\/b>/.test(a.html), "Der Admin-Bereich öffnet bei neuen Nachrichten den Reiter „Nachrichten“: neueste zuerst, mit Angaben; fremdes HTML wird nicht ausgeführt");
    if (process.env.SHOT_DIR) await p.screenshot({ path: process.env.SHOT_DIR + "/feedback-admin.png" });
    await p.click('[data-fb-lesen="b"]'); await p.waitForFunction(() => document.querySelectorAll(".fb-eintrag.neu").length === 0, null, { timeout: 8000 }).catch(() => {});
    check(post[1].gelesen === true && await p.evaluate(() => /0<\/b> ungelesen/.test(document.querySelector(".fb-admin-kopf").innerHTML)), "„gelesen“ markiert die Nachricht; der Zähler steht auf 0");
    await p.click("[data-fb-filter]"); await p.waitForFunction(() => !document.querySelector(".fb-eintrag"), null, { timeout: 8000 }).catch(() => {});
    check(await p.evaluate(() => /Keine ungelesenen/.test(document.querySelector(".fb-admin").textContent)) && !fehler.length, "Der Filter „Nur ungelesene“ zeigt dann nichts mehr; keine Skriptfehler"); await ctx.close(); }
  await b.close(); console.log(ok ? "\nFEEDBACK IN ORDNUNG" : "\nFEEDBACK: FEHLER"); process.exit(ok ? 0 : 1);
})();
