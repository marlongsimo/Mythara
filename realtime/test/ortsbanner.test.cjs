/* Mythara – das Ortsbanner erscheint beim Betreten einer Region nur kurz (etwa 3,5 s) und verblasst dann; beim nächsten Regionswechsel kommt es wieder.
   Dateien liefert Playwright aus, kein Testserver nötig. Aufruf: node test/ortsbanner.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2' };
(async () => { const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(); let f = 0;
  const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); });
  const sicht = () => p.evaluate(() => { const t = document.getElementById('ez-titel'); return !t.hidden && getComputedStyle(t).display !== 'none' && Number(getComputedStyle(t).opacity) > 0.5 ? t.querySelector('b').textContent : ''; });
  await p.goto('http://localhost:8765/echtzeit/?server=&wx=6448&wy=6455'); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 });
  await p.waitForTimeout(800); const a = await sicht(); check(a === 'Waldmark', `Beim Betreten steht das Banner da („${a}“)`);
  await p.waitForTimeout(4500); const z = await p.evaluate(() => document.getElementById('ez-titel').hidden); check(z, 'Nach gut 4 Sekunden ist es verblasst und ausgeblendet');
  /* nach Süden in den Kreuzwald */
  await p.keyboard.down('s'); await p.waitForFunction(() => window.EZW.szene.hier === 'waldweg', null, { timeout: 15000 }).catch(() => {}); await p.keyboard.up('s'); await p.waitForTimeout(500);
  const k = await sicht(); check(/Kreuzwald/.test(k), `Beim Wechsel in den Kreuzwald erscheint es wieder („${k}“)`);
  await p.waitForTimeout(4600); check(await p.evaluate(() => document.getElementById('ez-titel').hidden), 'und verblasst auch dort wieder');
  await b.close(); console.log(f ? f + ' Fehler' : 'Ortsbanner: alles in Ordnung'); process.exit(f ? 1 : 0); })();
