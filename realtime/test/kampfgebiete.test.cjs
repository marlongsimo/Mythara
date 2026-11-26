/* Mythara – jede Region ist Kampfgebiet (Einzelkampf), außer den sicheren (Waldmark); die Banditen-Lichtung im Kreuzwald ist Mehrkampf.
   Prüft je Region im Browser (ohne Spielserver, die Simulation läuft im Spiel): Anzeige der Kampfart, der Held läuft, und den Übergang zwischen zwei Kampfgebieten.
   Dateien liefert Playwright aus, kein Testserver nötig. Aufruf: node test/kampfgebiete.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2' };
const welt = JSON.parse(fs.readFileSync(path.join(WURZEL, 'echtzeit/welt/welt.json'), 'utf8'));
(async () => { const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1280, height: 720 } }); let f = 0; const fehler = [];
  const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); });
  const p = await c.newPage(); p.on('pageerror', (e) => fehler.push(String(e)));
  const art = () => p.evaluate(() => { const e = document.querySelector('#ez-kampfart b'); return e ? e.textContent : ''; });
  const ort = () => p.evaluate(() => [window.EZW.szene.ort.x, window.EZW.szene.ort.y]);
  for (const [rid, R] of Object.entries(welt.regionen)) {
    const [sx, sy] = R.start[0];
    await p.goto(`http://localhost:8765/echtzeit/?server=&wx=${sx}&wy=${sy}`); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(2500);
    const hier = await p.evaluate(() => window.EZW.szene.hier), a = await art(), soll = rid === 'waldmark' ? 'Sicherer Ort' : 'Einzelkampf';
    check(hier === rid && a === soll, `${R.region.name}: „${a}“ (erwartet „${soll}“)`);
    const o0 = await ort(); for (const k of ['d', 's', 'a', 'w']) { await p.keyboard.down(k); await p.waitForTimeout(700); await p.keyboard.up(k); const o = await ort(); if (Math.hypot(o[0] - o0[0], o[1] - o0[1]) > 0.8) break; }
    const o1 = await ort(), weg = Math.hypot(o1[0] - o0[0], o1[1] - o0[1]); check(weg > 0.8, `${R.region.name}: der Held läuft (${weg.toFixed(1)} Felder)${rid !== 'waldmark' ? ' – im Kampfgebiet' + (await p.evaluate(() => window.EZK && window.EZK.eingetreten) ? '' : ' (noch nicht eingetreten?)') : ''}`);
  }
  /* Übergang zwischen zwei Kampfgebieten: aus dem Kreuzwald nach Süden nach Weidenhain (x 6446: dort ist die Grenze über drei Felder Breite frei von Bäumen) */
  await p.goto('http://localhost:8765/echtzeit/?server=&wx=6446.5&wy=6646'); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.hier === 'waldweg', null, { timeout: 30000 }); await p.waitForTimeout(2500);
  await p.keyboard.down('s'); await p.waitForFunction(() => window.EZW.szene.hier === 'weidenhain', null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(2500); await p.keyboard.up('s'); await p.waitForTimeout(800);
  const h = await p.evaluate(() => [window.EZW.szene.hier, window.EZK && window.EZK.region, window.EZK && window.EZK.eingetreten]);
  check(h[0] === 'weidenhain' && h[1] === 'weidenhain' && h[2], `Kreuzwald → Weidenhain: angekommen, Kampfgebiet gewechselt (${JSON.stringify(h)}), „${await art()}“`);
  check(!fehler.length, 'Keine Fehler im Browser ' + fehler.slice(0, 3).join(' | '));
  await b.close(); console.log(f ? f + ' Fehler' : 'Kampfgebiete: alles in Ordnung'); process.exit(f ? 1 : 0); })();
