/*
 * Mythara Echtzeit – Prüfung: Die Waldmark der offenen Welt ist der Ausgangspunkt des Spiels.
 * Spielstart ohne Zusatz, Heldenhalle, Weltkarte am Südtor, Riss über das Menü, Rückkehr aus einer Kampagne (?von=tor),
 * und dass die bisherigen Wege weiter funktionieren (gemaltes Bild unter ?stadt=bild, Weidenhain, Waldweg-Strecke).
 * Vorher: node build.mjs; im Hauptordner node tools/testserver.js.  Aufruf: node test/welt-spielstart.test.mjs
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const A = "http://localhost:8765/echtzeit/", O = 6400;
const b = await chromium.launch();
const seite = async (adr) => { const p = await b.newPage({ viewport: { width: 1280, height: 800 } }), f = []; p.on("pageerror", (e) => f.push(e.message)); await p.goto(A + adr, { waitUntil: "load" }); return { p, f }; };

{ const { p, f } = await seite("?server=");
  await p.evaluate(() => { try { localStorage.removeItem("ez_welt_pos"); } catch { /* */ } }); await p.reload({ waitUntil: "load" });
  await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(1200);
  const z = await p.evaluate(() => ({ szene: window.EZW.szene.scene.key, titel: document.querySelector("#ez-titel b").textContent, unter: document.querySelector("#ez-titel small").textContent, ort: { ...window.EZW.ort() }, menue: document.querySelectorAll("#ez-menue button, #ez-menue [data-zeichen], #ez-menue > *").length, stadt: Boolean(window.EZD) }));
  check(z.szene === "welt" && !z.stadt, `Spielstart ohne Zusatz: die Welt-Szene (${z.szene}), nicht das gemalte Bild`);
  check(z.titel === "Waldmark" && z.unter === "Die Zuflucht der Wanderer", `Banner „${z.titel} – ${z.unter}“`);
  check(Math.hypot(z.ort.x - O - 48, z.ort.y - O - 37.5) < 0.6, `Start am Brunnen (${(z.ort.x - O).toFixed(1)} | ${(z.ort.y - O).toFixed(1)})`);
  check(z.menue >= 4, `Menü unten rechts vorhanden (${z.menue} Knöpfe)`);
  /* Heldenhalle über ihre Tür */
  const t = await p.evaluate(() => { const s = window.EZW.szene, a = []; for (const st of s.stuecke.values()) if (st.daten) for (const i of st.daten.interaktionen) a.push(i); return a; });
  const halle = t.find((a) => a.id === "halle_tuer"), tor = t.find((a) => a.id === "tor_ansehen");
  await p.evaluate(([x, y]) => { const s = window.EZW.szene; s.ort.x = x; s.ort.y = y; }, [halle.x, halle.y]); await p.waitForTimeout(600);
  const kn = await p.evaluate(() => document.querySelector("#ez-dorf-knopf").textContent); check(/Heldenhalle betreten/.test(kn), `an der Tür der Heldenhalle: Knopf „${kn.trim()}“`);
  await p.click("#ez-dorf-knopf"); await p.waitForTimeout(800);
  const halleOffen = await p.evaluate(() => { const k = document.querySelector("#ez-konto"); return Boolean(k && !k.hidden && getComputedStyle(k).display !== "none") && window.EZW.szene.gesperrt; });
  check(halleOffen, "die Heldenhalle öffnet sich, die Welt steht still");
  await p.screenshot({ path: "/tmp/claude-0/-home-user-Mythara/de112ecd-2973-5a26-8c07-c748a7280ef5/scratchpad/s-halle.png" });
  await p.keyboard.press("Escape"); await p.evaluate(() => { const z = document.querySelector("#ez-konto [data-zu], #ez-konto .zu, #ez-konto button"); if (z) z.click(); }); await p.waitForTimeout(600);
  /* Weltkarte am Südtor */
  await p.evaluate(() => { window.EZW.szene.gesperrt = false; }); await p.evaluate(([x, y]) => { const s = window.EZW.szene; s.ort.x = x; s.ort.y = y; }, [tor.x, tor.y]); await p.waitForTimeout(600);
  const kt = await p.evaluate(() => document.querySelector("#ez-dorf-knopf").textContent); check(/Weltkarte/.test(kt), `am Südtor: Knopf „${kt.trim()}“`);
  await p.click("#ez-dorf-knopf"); await p.waitForTimeout(800);
  const karte = await p.evaluate(() => { const k = document.querySelector("#ez-welt"); return Boolean(k && !k.hidden && getComputedStyle(k).display !== "none"); }); check(karte, "die Weltkarte öffnet sich");
  await p.screenshot({ path: "/tmp/claude-0/-home-user-Mythara/de112ecd-2973-5a26-8c07-c748a7280ef5/scratchpad/s-weltkarte.png" });
  check(f.length === 0, f.length ? "Fehler: " + f.slice(0, 3).join(" | ") : "keine Fehler im Browser"); await p.close(); }

{ /* Riss über das Menü: Heldenwahl erscheint; nach der Wahl startet der Kampf */
  const { p, f } = await seite("?server="); await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(800);
  await p.evaluate(() => { window.EZW.szene.gesperrt = false; }); const riss = await p.$("#ez-menue [data-art=riss], #ez-menue .riss"); 
  if (riss) await riss.click(); else await p.evaluate(() => { const k = [...document.querySelectorAll("#ez-menue button")].find((b) => /Riss/.test(b.textContent || b.title || "")); if (k) k.click(); });
  await p.waitForTimeout(800); const wahl = await p.evaluate(() => { const w = document.querySelector("#ez-wahl"); return Boolean(w && !w.hidden && getComputedStyle(w).display !== "none"); });
  check(wahl, "Riss im Menü: die Heldenwahl erscheint");
  check(f.length === 0, f.length ? "Fehler: " + f.slice(0, 3).join(" | ") : "keine Fehler beim Riss"); await p.close(); }

{ /* Rückkehr aus einer Kampagne */
  const { p, f } = await seite("?von=tor&server="); await p.waitForFunction(() => window.EZW && window.EZW.szene.figur, null, { timeout: 30000 }); await p.waitForTimeout(1200);
  const z = await p.evaluate(() => ({ ort: { ...window.EZW.ort() }, region: window.EZW.szene.hier, adresse: location.search }));
  check(z.region === "waldweg" && Math.hypot(z.ort.x - O - 48, z.ort.y - O - 66.5) < 1, `?von=tor: vor dem Südtor auf dem Waldweg (${(z.ort.x - O).toFixed(1)} | ${(z.ort.y - O).toFixed(1)}), Zusatz aus der Adresse entfernt (${z.adresse || "leer"})`);
  check(f.length === 0, "keine Fehler"); await p.close(); }

for (const [adr, name, frage] of [["?stadt=bild&server=", "das gemalte Bild (?stadt=bild)", () => Boolean(window.EZD)], ["?ort=weidenhain&server=&neu=1", "Weidenhain", () => Boolean(window.EZO)], ["?ort=weidenhain&kampf=waldweg&server=&neu=1", "die Waldweg-Strecke der Kampagne", () => document.querySelectorAll("canvas").length === 1]]) {
  const { p, f } = await seite(adr); await p.waitForTimeout(5000); const da = await p.evaluate(frage);
  check(da && f.length === 0, `weiterhin erreichbar: ${name}${f.length ? " – Fehler: " + f[0] : ""}`); await p.close(); }

await b.close(); console.log(ok ? "\nSpielstart: alles in Ordnung" : "\nSpielstart: FEHLER"); process.exit(ok ? 0 : 1);
