/* Mythara – der eigene Held: Spiel ohne Helden → Heldeneditor (Aussehen, Startwaffe) → zurück ins Spiel mit diesem Helden (Figur, Gesicht oben links).
   Danach zwei Gäste am Spielserver: jeder sieht das Aussehen des anderen. Dateien liefert Playwright aus, Supabase ist gesperrt (Gast).
   Aufruf: node test/heldeneditor.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const BILD = process.env.BILD || '';
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch({ args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessPermissionPrompt'] });
  const kontext = async () => { const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
    await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
    await c.route('https://**', (r) => r.abort()); await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); }); return c; };
  const fehler = []; const c1 = await kontext(), p = await c1.newPage(); p.on('pageerror', (e) => fehler.push(String(e)));
  /* 1. ohne Helden ins Spiel → Heldeneditor */
  await p.goto('http://localhost:8765/echtzeit/'); await p.waitForURL(/held\.html/, { timeout: 20000 }).catch(() => {});
  check(/held\.html/.test(p.url()), 'Ohne eigenen Helden führt das Spiel in den Heldeneditor');
  await p.waitForTimeout(1500);
  await p.click('[data-g="frau"]'); await p.click('[data-wahl="frisur"][data-d="1"]'); await p.click('[data-wahl="frisur"][data-d="1"]'); await p.click('#haar [data-k="orange"]'); await p.click('#haut [data-k="oliv"]');
  const h = await p.evaluate(() => window.EZH.held); check(h.aussehen.g === 'frau' && h.aussehen.frisur === 'pixie' && h.aussehen.haar === 'orange' && h.aussehen.haut === 'oliv', `Auswahl: ${JSON.stringify(h.aussehen)}`);
  const pixel = await p.evaluate(() => { const c = document.getElementById('nahbild'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  check(pixel > 20000, `Nahansicht zeigt das Gesicht (${pixel} Bildpunkte)`);
  await p.click('#rechts'); check(await p.evaluate(() => window.EZH.richtung) === 3, 'Drehen in der Nahansicht');
  await p.click('#weiter'); await p.waitForSelector('#schritt2:not([hidden])'); check(await p.locator('#waffen [data-w]').count() === 3, 'Drei Startwaffen: Schwert und Schild, Bogen, Stab');
  await p.click('[data-w="stab"]'); await p.click('#beginnen');
  await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.figur, null, { timeout: 30000 }).catch(() => {});
  check(!/held\.html/.test(p.url()) && await p.evaluate(() => Boolean(window.EZW && window.EZW.szene)), 'Abenteuer beginnen: zurück im Spiel');
  await p.waitForTimeout(3000);
  const ich = await p.evaluate(() => { const f = window.EZW.szene.figur; return { figur: f.figur, teile: f.list ? f.list.length : 0, held: localStorage.getItem('ez_held'), bild: document.getElementById('ez-profil-bild').src.slice(0, 22), weg: document.getElementById('ez-profil-held').textContent }; });
  check(ich.figur === 'held.frau' && ich.teile >= 4, `Die Figur ist der eigene Held (${ich.figur}, ${ich.teile} Ebenen)`);
  check(ich.held === 'elementarist', `Startwaffe Stab → Kampfwerte des Magie-Satzes (${ich.held})`);
  console.log('  Profil:', JSON.stringify(ich));
  check(ich.bild.startsWith('data:image/png') && /Magie/.test(ich.weg), `Oben links: das Gesicht des Helden und „${ich.weg}“`);
  if (BILD) await p.screenshot({ path: BILD + 'held-spiel.png' });
  /* 2. zwei Gäste am Spielserver sehen einander mit ihrem Aussehen */
  const port = 8811, srv = spawn('node', [path.join(__dirname, '..', 'server', 'dist', 'server.js')], { env: { ...process.env, PORT: String(port), SUPABASE_URL: 'http://localhost:1', SUPABASE_SERVICE_KEY: 'sb_secret_test', ERLAUBTE_HERKUNFT: 'http://localhost:8765' }, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1500));
  try {
    const ben = { aussehen: { g: 'mann', frisur: 'zopf_eng', bart: 'wikinger', haar: 'schwarz', haut: 'braun' }, waffe: 'bogen' };
    const c2 = await kontext(); await c2.addInitScript((h) => { localStorage.setItem('ez_mein_held', JSON.stringify(h)); }, ben); const q = await c2.newPage(); q.on('pageerror', (e) => fehler.push(String(e)));
    const S = `?server=ws://localhost:${port}&wx=6440&wy=6440`; await p.goto('http://localhost:8765/echtzeit/' + S); await q.goto('http://localhost:8765/echtzeit/' + S);
    const sieht = (seite, figur) => seite.waitForFunction((fg) => { const m = window.EZW && window.EZW.szene && window.EZW.szene.mit; return m && [...m.figuren.values()].some((x) => x.sp.figur === fg && x.sp.list && x.sp.list.length >= 4); }, figur, { timeout: 25000 }).then(() => true).catch(() => false);
    await p.waitForTimeout(6000); console.log('  Mitspieler bei Anna:', JSON.stringify(await p.evaluate(() => { const m = window.EZW.szene.mit; return { mit: Boolean(m), n: m ? m.figuren.size : -1, fig: m ? [...m.figuren.values()].map((x) => [x.sp.figur, x.sp.list && x.sp.list.length, x.d.a && x.d.a.aussehen.g, x.d.h]) : [], spieler: window.EZW.spieler && window.EZW.spieler(), ich: window.EZW.ich && window.EZW.ich() }; })));
    check(await sieht(p, 'held.mann'), 'Anna (Frau) sieht Ben als Mann mit seinem Aussehen');
    check(await sieht(q, 'held.frau'), 'Ben sieht Anna als Frau mit ihrem Aussehen');
    if (BILD) { await p.waitForTimeout(1500); await p.screenshot({ path: BILD + 'held-mitspieler.png' }); }
  } finally { srv.kill(); }
  check(!fehler.length, 'Keine Fehler im Browser ' + fehler.slice(0, 3).join(' | '));
  await b.close(); console.log(f ? f + ' Fehler' : 'Heldeneditor: alles in Ordnung'); process.exit(f ? 1 : 0); })();
