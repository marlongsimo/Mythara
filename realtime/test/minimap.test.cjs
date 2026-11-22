/* Mythara – die Minimap: der eigene Held steht immer genau in der Mitte des Kreises, auch am Rand einer Region (Dateien liefert Playwright aus, kein Testserver nötig). Aufruf: node test/minimap.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = '/home/user/mythara', TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.css': 'text/css', '.woff2': 'font/woff2' };
(async () => { const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(); let f = 0;
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), contentType: TYP[path.extname(fl)] || 'application/octet-stream' }); });
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); });
  const mitte = () => p.evaluate(() => { const r = document.querySelector('#ez-kartenrahmen .rund').getBoundingClientRect(), d = document.getElementById('ez-karte-punkt').getBoundingClientRect(); return Math.hypot(d.x + d.width / 2 - (r.x + r.width / 2), d.y + d.height / 2 - (r.y + r.height / 2)); });
  await p.goto('http://localhost:8765/echtzeit/?server='); await p.waitForTimeout(1000);
  for (const [name, pos] of [['Waldmark-Start', null], ['Waldmark, Westrand', [6403, 6440, 'waldmark']], ['Kreuzwald, Südtor (Regionsrand)', [6448, 6465, 'waldweg']], ['Kreuzwald, Ostrand', [6588, 6500, 'waldweg']]]) {
    await p.evaluate((st) => { if (st) localStorage.setItem('ez_welt_pos', JSON.stringify(st)); else localStorage.removeItem('ez_welt_pos'); }, pos);
    await p.goto('http://localhost:8765/echtzeit/?server='); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(1500);
    const d = await mitte(); console.log((d < 2 ? '✓ ' : '✗ ') + `${name}: Spielerpunkt ${d.toFixed(1)} px von der Kreismitte`); if (d >= 2) f++;
    await p.keyboard.down('a'); await p.waitForTimeout(800); await p.keyboard.up('a'); await p.waitForTimeout(200); const d2 = await mitte(); console.log((d2 < 2 ? '✓ ' : '✗ ') + `  …nach dem Laufen: ${d2.toFixed(1)} px`); if (d2 >= 2) f++;
    if (name.includes('Südtor')) await p.screenshot({ path: '/tmp/claude-0/-home-user/41c9406e-0350-52e3-a9f4-165cb5f77c3a/scratchpad/minimap-mitte.png', clip: { x: 1080, y: 0, width: 200, height: 290 } }); }
  await b.close(); process.exit(f ? 1 : 0); })();
