/* Mythara – Abmelden im Browser: nach 5 Minuten ohne Eingabe geht das Spiel auf die Willkommensseite mit Hinweis; „Ins Spiel“ führt zurück.
   Hinweis „anderes Gerät“ auf der Willkommensseite. Aufruf: node test/abmelden-ui.test.cjs (nach node build.mjs) */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.webmanifest': 'application/manifest+json' };
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
  await c.route('https://**', (r) => r.abort());
  await c.addInitScript(() => { try { sessionStorage.setItem('mr-gast', '1'); if (!/willkommen/.test(location.pathname)) sessionStorage.setItem('ez__lager', '1'); sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_mein_held', JSON.stringify({ aussehen: { g: 'mann', frisur: 'zopf_eng', bart: 'wikinger', haar: 'schwarz', haut: 'braun' }, waffe: 'bogen' })); } catch (e) { /* */ } });
  const p = await c.newPage(); await p.goto('http://localhost:8765/echtzeit/?vorwaermen=0'); await p.waitForFunction(() => typeof window.EZ_UNTAETIG === 'function', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(6000); check(/echtzeit\/(index\.html)?\?/.test(p.url()) || /echtzeit\/$/.test(p.url()) || /vorwaermen/.test(p.url()), 'Im Spiel: nach 6 s ohne Eingabe noch nicht abgemeldet (' + p.url().replace(/^.*echtzeit\//, '') + ')');
  await p.evaluate(() => window.EZ_UNTAETIG(4 * 60 * 1000 + 50000)); await p.mouse.click(5, 5); await p.waitForTimeout(500); await p.evaluate(() => window.EZ_UNTAETIG(4 * 60 * 1000)); await p.waitForTimeout(6000);
  check(!/willkommen/.test(p.url()), 'Eine Eingabe setzt die 5 Minuten zurück');
  await p.evaluate(() => window.EZ_UNTAETIG(5 * 60 * 1000)); await p.waitForURL(/willkommen\.html\?grund=ruhe/, { timeout: 10000 }).catch(() => {});
  check(/willkommen\.html\?grund=ruhe&weiter=%3Fvorwaermen%3D0/.test(p.url()), '5 Minuten ohne Eingabe: zur Willkommensseite (' + p.url().replace(/^.*echtzeit\//, '') + ')');
  await p.waitForTimeout(800); const m = await p.textContent('#meldung').catch(() => ''); check(/5 Minuten untätig/.test(m), 'Hinweis: ' + m);
  check(await p.evaluate(() => sessionStorage.getItem('ez__lager')) === null, 'Zurück ins Spiel nur über „Ins Spiel“');
  await p.goto('http://localhost:8765/echtzeit/willkommen.html?grund=anderes'); await p.waitForTimeout(800); const m2 = await p.textContent('#meldung').catch(() => ''); check(/anderen Gerät/.test(m2), 'Hinweis anderes Gerät: ' + m2);
  await b.close(); console.log(f ? f + ' Fehler' : 'Abmelden im Browser: alles in Ordnung'); process.exit(f ? 1 : 0); })();
