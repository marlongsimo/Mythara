/* Mythara – offene Welt und Lichtung im Browser, ohne Testserver (Playwright liefert die Dateien aus): gemerkte Stelle im Kreuzwald, Eintritt in die Kampfzone an der eigenen Stelle, nahtloser Rückweg, Teleport. Aufruf: node test/welt-lichtung.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = '/home/user/mythara', TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
let f = 0; const ok = (b, t) => { console.log((b ? '✓ ' : '✗ ') + t); if (!b) f++; };
(async () => { const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(), log = [];
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), contentType: TYP[path.extname(fl)] || 'application/octet-stream' }); });
  p.on('pageerror', (e) => log.push('ERR ' + e));
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); if (!sessionStorage.getItem('pos_gesetzt')) { localStorage.setItem('ez_welt_pos', JSON.stringify([6508.5, 6587, 'waldweg'])); sessionStorage.setItem('pos_gesetzt', '1'); } });
  await p.goto('http://localhost:8765/echtzeit/?server='); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(2500);
  const o = await p.evaluate(() => ({ x: window.EZW.szene.ort.x, y: window.EZW.szene.ort.y, hier: window.EZW.szene.hier }));
  ok(Math.abs(o.x - 6508.5) < 1 && Math.abs(o.y - 6587) < 1 && o.hier === 'waldweg', `Beginnt an der gemerkten Stelle im Kreuzwald (${o.x.toFixed(1)}, ${o.y.toFixed(1)}, ${o.hier})`);
  ok(await p.$$eval('#ez-kartenrahmen .rknoepfe small', (l) => l.map((x) => x.textContent.replace(/ \(\d+\)/, '')).join(',')) === 'Teleport,Spieler,Held', 'Unter der Minimap: Teleport, Spieler, Held');
  await p.screenshot({ path: '/tmp/claude-0/-home-user/41c9406e-0350-52e3-a9f4-165cb5f77c3a/scratchpad/kreuzwald-rand.png' });
  /* ein paar Schritte nach Osten: in die Lichtung */
  await Promise.all([p.waitForURL(/kampf=lichtung/, { timeout: 15000 }).catch(() => {}), p.evaluate(() => { window.EZW.szene.ort.x = 6513; })]);
  const u = p.url(); ok(/ort=kreuzwald&kampf=lichtung&lx=7\.\d+&ly=37\.\d+/.test(u), 'Weiter hinein: es geht in die Kampfzone, an genau dieser Stelle (' + u.replace(/.*\?/, '') + ')');
  await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 30000 }); await p.waitForTimeout(800);
  const h = await p.evaluate(() => { const z = window.EZ.zustand(), e = z.w.find((q) => q[0] === z.ich.id); return [e[4], e[5]]; }); ok(Math.abs(h[0] - 7) < 1.5 && Math.abs(h[1] - 37) < 1.5, `Im Kampf steht der Held an derselben Stelle (${h[0].toFixed(1)}, ${h[1].toFixed(1)})`);
  /* zurück an den Rand: nahtlos in die Welt */
  await Promise.all([p.waitForURL((x) => !/kampf=/.test(x), { timeout: 15000 }).catch(() => {}), p.evaluate(() => window.EZ.netz.sende({ t: 'lauf', x: 0.3, y: 37 }))]);
  ok(/wx=6506\.\d+&wy=6587/.test(p.url()) || /wx=650[67]/.test(p.url()), 'Am Rand der Lichtung zurück in die Welt (' + p.url().replace(/.*\?/, '') + ')');
  await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(1500);
  const o2 = await p.evaluate(() => ({ x: window.EZW.szene.ort.x, y: window.EZW.szene.ort.y })); ok(Math.hypot(o2.x - 6506.96, o2.y - 6587.28) < 2 && o2.x - 6506 < 4, `…an dieser Stelle (nächstes freies Feld, noch vor der Kampfzone) (${o2.x.toFixed(1)}, ${o2.y.toFixed(1)})`);
  /* Teleport */
  await Promise.all([p.waitForURL(/von=teleport/, { timeout: 15000 }).catch(() => {}), p.click('#ez-kartenrahmen [aria-label="Teleport"]')]);
  await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(1500);
  const o3 = await p.evaluate(() => ({ hier: window.EZW.szene.hier, x: window.EZW.szene.ort.x, y: window.EZW.szene.ort.y })); ok(o3.hier === 'waldmark', `Teleport: zurück in der Waldmark (${o3.x.toFixed(1)}, ${o3.y.toFixed(1)})`);
  ok(log.length === 0, 'Keine Fehler im Browser ' + log.join(' | ')); await b.close(); process.exit(f ? 1 : 0); })();
