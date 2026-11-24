/* Mythara – Querformat ab dem Heldeneditor: auf Handy und Tablet hochkant der Hinweis „Bitte dreh dein Gerät“, quer nicht; am PC nie;
   schon ab der Anmeldeseite (seit 24.11.2026); auf Android ein Knopf für Vollbild und Querformat-Sperre, auf dem iPhone nicht (dort geht keine Sperre).
   Aufruf: node test/querformat.test.cjs   (BILD=pfad/ für Bildschirmfotos) */
const { chromium, devices } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.svg': 'image/svg+xml' };
const BILD = process.env.BILD || '';
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch();
  async function seite(geraet, adresse) { const c = await b.newContext(geraet), p = await c.newPage(); const fehler = []; p.on('pageerror', (e) => fehler.push(String(e)));
    await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
    await c.route('https://**', (r) => r.abort()); await p.goto('http://localhost:8765/echtzeit/' + adresse); await p.waitForTimeout(2500);
    const hinweis = await p.evaluate(() => { const e = document.getElementById('ez-quer'); return { da: !!e && getComputedStyle(e).display !== 'none', knopf: !!e && !e.querySelector('button').hidden }; });
    return { c, p, hinweis, fehler }; }
  const iphone = devices['iPhone 13'], iphoneQuer = devices['iPhone 13 landscape'], pixel = devices['Pixel 7'], pc = { viewport: { width: 1280, height: 800 } };
  { const s = await seite(iphone, 'held.html'); check(s.hinweis.da && !s.hinweis.knopf, 'iPhone hochkant im Heldeneditor: „Bitte dreh dein Gerät“ (ohne Sperr-Knopf – Apple erlaubt keine Sperre)'); if (BILD) await s.p.screenshot({ path: BILD + 'quer-hinweis.png' }); check(!s.fehler.length, 'keine Fehler ' + s.fehler.join(' | ')); await s.c.close(); }
  { const s = await seite(iphoneQuer, 'held.html'); check(!s.hinweis.da, 'iPhone quer im Heldeneditor: kein Hinweis'); if (BILD) await s.p.screenshot({ path: BILD + 'quer-editor.png' });
    const passt = await s.p.evaluate(() => { const h = innerHeight, w = innerWidth, sicht = (q) => { const e = document.querySelector(q), r = e && e.getBoundingClientRect(); return r && r.width > 0 && r.top >= 0 && r.bottom <= h + 1 && r.left >= 0 && r.right <= w + 1; }; return { nah: sicht('#nah'), geschlecht: sicht('[data-g="frau"]'), seite: document.documentElement.scrollHeight <= h + 2 }; });
    check(passt.nah && passt.geschlecht && passt.seite, `Heldeneditor quer: Gesicht und Auswahl passen auf den Bildschirm, nichts zum Scrollen (${JSON.stringify(passt)})`);
    await s.p.click('#weiter'); await s.p.waitForTimeout(1500); if (BILD) await s.p.screenshot({ path: BILD + 'quer-waffen.png' });
    check(await s.p.evaluate(() => [...document.querySelectorAll('.waffe')].every((e) => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1; })), 'Startwaffen quer: alle drei nebeneinander sichtbar'); await s.c.close(); }
  { const s = await seite(pixel, 'held.html'); check(s.hinweis.da && s.hinweis.knopf, 'Android hochkant: Hinweis mit Knopf „Querformat einschalten“'); await s.c.close(); }
  { const s = await seite(pc, 'held.html'); check(!s.hinweis.da, 'PC: nie ein Hinweis'); await s.c.close(); }
  { const s = await seite(iphone, 'anmelden.html'); check(s.hinweis.da && !s.hinweis.knopf, 'Anmeldeseite auf dem iPhone hochkant: schon hier „Bitte dreh dein Gerät“ (Querformat ab dem Login)'); if (BILD) await s.p.screenshot({ path: BILD + 'quer-login.png' }); check(!s.fehler.length, 'keine Fehler auf der Anmeldeseite: ' + s.fehler.join(' | ')); await s.c.close(); }
  { const s = await seite(iphoneQuer, 'anmelden.html'); check(!s.hinweis.da, 'Anmeldeseite auf dem iPhone quer: kein Hinweis'); await s.c.close(); }
  { const s = await seite(pixel, 'willkommen.html'); check(s.hinweis.da && s.hinweis.knopf, 'Willkommensseite auf Android hochkant: Hinweis mit Knopf „Querformat einschalten“'); await s.c.close(); }
  { const s = await seite(pc, 'anmelden.html'); check(!s.hinweis.da, 'Anmeldeseite am PC: nie ein Hinweis'); await s.c.close(); }
  await b.close(); console.log(f ? f + ' Fehler' : 'Querformat: alles in Ordnung'); process.exit(f ? 1 : 0); })();
