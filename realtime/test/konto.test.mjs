/* Konto und Spielstand der Splitterlande im Browser, gegen eine nachgebildete Datenbank (die echte wird hier nie angesprochen).
   Die Nachbildung verhält sich wie Migration 034: je Konto ein Stand mit Version; veraltete Version = Konflikt. Sie lebt im Browser-Speicher unter „fake_db“. */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url), { chromium } = require("playwright");
const URL0 = "http://localhost:8765/echtzeit/"; let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const FAKE = `window.supabase = { createClient() { const L = (k) => JSON.parse(sessionStorage.getItem(k) || "null"), S = (k, v) => sessionStorage.setItem(k, JSON.stringify(v));
  const db = () => L("fake_db") || { konten: { Anna: { pw: "geheim1", stand: null, version: 0 }, Bert: { pw: "geheim2", stand: null, version: 0 } } };
  return { auth: { async getSession() { const s = L("fake_sitzung"); return { data: { session: s ? { user: { is_anonymous: s === "gast" } } : null } }; }, async signInAnonymously() { S("fake_sitzung", "gast"); return { error: null }; },
      async signInWithPassword({ email, password }) { const n = email.split("@")[0], k = db().konten[n]; if (!k || k.pw !== password) return { error: { message: "Invalid login credentials" } }; S("fake_sitzung", n); return { error: null }; }, async signOut() { sessionStorage.removeItem("fake_sitzung"); }, async updateUser({ email, password }) { const d = db(), n = email.split("@")[0]; d.konten[n] = { pw: password, stand: null, version: 0 }; S("fake_db", d); S("fake_sitzung", n); return { error: null }; } },
    async rpc(fn, a) { const d = db(), wer = L("fake_sitzung"), k = d.konten[wer]; window.__rpc = (window.__rpc || []).concat(fn);
      if (fn === "rpg_set_profile") return d.konten[a.p_handle] ? { data: null, error: { message: "Dieser Benutzername ist schon vergeben." } } : { data: { anmeldung: a.p_handle + "@x" }, error: null };
      if (fn === "rpg_handle_frei") return { data: d.konten[a.p_handle] ? "vergeben" : "frei", error: null };
      if (fn === "rpg_login_email") return { data: d.konten[a.p_handle] ? a.p_handle + "@x" : null, error: null };
      if (fn === "rpg_my_profile") return { data: k ? { handle: wer, konto: true } : { konto: false }, error: null };
      if (!k) return { data: null, error: { message: "Bitte melde dich an." } };
      if (fn === "rpg_echtzeit_laden") return { data: k.stand ? { stand: k.stand, version: k.version } : { stand: {}, version: 0 }, error: null };
      if (fn === "rpg_echtzeit_speichern") { if (k.stand && a.p_version !== k.version) return { data: { ok: false, konflikt: true, stand: k.stand, version: k.version }, error: null }; k.stand = a.p_stand; k.version = (k.stand ? k.version : 0) + 1; S("fake_db", d); return { data: { ok: true, version: k.version }, error: null }; }
      return { data: null, error: { message: "unbekannt " + fn } }; } }; } };`;
const br = await chromium.launch(), ctx = await br.newContext({ viewport: { width: 1100, height: 650 } }), p = await ctx.newPage(), f = []; p.on("pageerror", (e) => f.push(String(e)));
await ctx.route("**/vendor/supabase-js-*.js", (r) => r.fulfill({ contentType: "text/javascript", body: FAKE }));
const dorf = async (pfad = "") => { await p.goto(URL0 + pfad); await p.waitForFunction(() => window.EZD || window.EZO || document.querySelector("#my-gast-start"), null, { timeout: 20000 }); await p.waitForTimeout(700); };
const imSpiel = async () => { await p.waitForFunction(() => window.EZD, null, { timeout: 20000 }); await p.waitForTimeout(700); };
const konto = (n) => p.evaluate((n) => { const d = JSON.parse(sessionStorage.getItem("fake_db") || "null"); return d ? d.konten[n] : null; }, n);

await dorf(); check(/anmelden\.html/.test(p.url()) && await p.isVisible("#my-name"), "Ohne Anmeldung landet man auf der Anmeldeseite, nicht im Spiel");
await p.click("#my-reg"); await p.fill("#my-reg-name", "Anna"); await p.waitForTimeout(700); check(/vergeben/.test(await p.textContent("#my-name-info")), "Konto erstellen: vergebener Name wird gleich gemeldet");
await p.fill("#my-reg-name", "Neu_1"); await p.fill("#my-reg-pw", "langgenug1"); await p.fill("#my-reg-pw2", "anders"); await p.click("#my-reg-form .my-knopf"); check(/stimmen nicht/.test(await p.textContent("#my-konto-fb")), "… und zwei verschiedene Passwörter werden abgelehnt");
await p.click("#my-zur-anmeldung"); await Promise.all([p.waitForNavigation(), p.click("#my-gast-start")]); await imSpiel(); check(await p.textContent("#ez-profil-name") === "Gast · anmelden", "Als Gast spielen: man ist im Spiel, oben steht „Gast“");
await dorf(); check(Boolean(await p.evaluate(() => Boolean(window.EZD))), "Beim nächsten Laden im selben Besuch wird nicht noch einmal gefragt");
await p.evaluate(() => { localStorage.setItem("ez_kampagnen", "1"); localStorage.setItem("ez_team", JSON.stringify({ held: "lichtbringer", mit: [] })); }); await p.waitForTimeout(700);
check(!(await konto("Anna")) || !(await konto("Anna")).stand, "Als Gast wird nichts ins Konto geschrieben");
await Promise.all([p.waitForNavigation(), p.click("#ez-profil")]); await p.waitForSelector("#my-name"); check(true, "Ein Tipp auf das Gast-Profil führt zur Anmeldeseite");
await p.fill("#my-name", "Anna"); await p.fill("#my-pw", "falsch"); await p.click("#my-anmelden .my-knopf"); await p.waitForTimeout(500); check(/falsch/.test(await p.textContent("#my-konto-fb")), "Falsches Passwort: Meldung, keine Anmeldung");
await p.fill("#my-pw", "geheim1"); await Promise.all([p.waitForNavigation(), p.click("#my-anmelden .my-knopf")]); await imSpiel();
check(await p.textContent("#ez-profil-name") === "Anna", "Nach der Anmeldung ist man im Spiel, der Name steht im Profil");
let a = await konto("Anna"); check(a.stand && a.stand.daten.ez_kampagnen === "1" && a.version === 1, "Konto ohne Stand: der Stand vom Gerät wird übernommen (Version 1)");
await p.evaluate(() => localStorage.setItem("ez_kampagnen", "2")); await p.waitForTimeout(900); a = await konto("Anna"); check(a.stand.daten.ez_kampagnen === "2" && a.version === 2, "Eine Änderung im Spiel landet kurz darauf im Konto (Version 2)");
check(await p.evaluate(() => localStorage.getItem("ez__offen")) === null, "… und die Merkmarke „offen“ ist wieder weg");
/* ein anderes Gerät hat weitergespielt: Das Konto hat einen neueren Stand als dieses Gerät */
await p.evaluate(() => { const d = JSON.parse(sessionStorage.getItem("fake_db")); d.konten.Anna.stand.daten.ez_kampagnen = "3"; d.konten.Anna.version = 7; sessionStorage.setItem("fake_db", JSON.stringify(d)); });
await dorf(); await p.waitForTimeout(600); check(await p.evaluate(() => localStorage.getItem("ez_kampagnen")) === "3", "Neuerer Stand im Konto wird beim Laden aufs Gerät übernommen");
/* das Speichern kam nicht durch (Seite wurde vorher verlassen): die Merkmarke steht noch */
await p.evaluate(() => { const f = document.createElement("iframe"); document.body.appendChild(f); const roh = f.contentWindow.Storage.prototype.setItem; roh.call(localStorage, "ez_kampagnen", "4"); roh.call(localStorage, "ez__offen", "1"); /* am Mithören vorbei, wie wenn die Seite vor dem Speichern verlassen wurde */ }); await dorf(); await p.waitForTimeout(600);
a = await konto("Anna"); check(a.stand.daten.ez_kampagnen === "4", "Nicht gespeicherte Änderung wird beim nächsten Laden nachgeholt");
/* zoom gehört zum Gerät */
await p.evaluate(() => localStorage.setItem("ez_zoom", "1.2")); await p.waitForTimeout(700); a = await konto("Anna"); check(!("ez_zoom" in a.stand.daten), "Die Zoom-Einstellung bleibt auf dem Gerät");
/* abmelden */
await p.click("#ez-profil"); await Promise.all([p.waitForNavigation(), p.click('#ez-konto [data-t="ab"]')]); await p.waitForTimeout(900);
check(/anmelden\.html/.test(p.url()) && await p.evaluate(() => localStorage.getItem("ez_kampagnen")) === null, "Abmelden: man landet auf der Anmeldeseite, der Fortschritt bleibt nicht auf dem Gerät");
/* ein zweites Konto sieht den Stand des ersten nicht */
await p.fill("#my-name", "Bert"); await p.fill("#my-pw", "geheim2"); await Promise.all([p.waitForNavigation(), p.click("#my-anmelden .my-knopf")]); await imSpiel();
check(await p.textContent("#ez-profil-name") === "Bert" && await p.evaluate(() => localStorage.getItem("ez_kampagnen")) === null, "Ein anderes Konto beginnt ohne den Stand des ersten");
check((await konto("Anna")).stand.daten.ez_kampagnen === "4", "… und der Stand des ersten ist unberührt");
/* ein ganz neues Konto anlegen */
await p.click("#ez-profil"); await Promise.all([p.waitForNavigation(), p.click('#ez-konto [data-t="ab"]')]); await p.waitForTimeout(800);
await p.click("#my-reg"); await p.fill("#my-reg-name", "Cleo_7"); await p.fill("#my-reg-pw", "langgenug1"); await p.fill("#my-reg-pw2", "langgenug1"); await Promise.all([p.waitForNavigation(), p.click("#my-reg-form .my-knopf")]); await imSpiel();
check(await p.textContent("#ez-profil-name") === "Cleo_7", "Neues Konto erstellt: Man ist gleich angemeldet und im Spiel");
check(f.length === 0, "Keine Fehler im Browser" + (f.length ? ": " + f.join(" | ") : ""));
await br.close(); console.log(fehler ? `\n${fehler} Prüfungen fehlgeschlagen` : "\nKonto und Spielstand: alles in Ordnung"); process.exit(fehler ? 1 : 0);
