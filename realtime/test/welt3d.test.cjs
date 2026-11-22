/* Mythara – die 3D-Welt als Spielwelt (Stufe 1): Start in der Waldmark, eigener Held als Bild, Laufen (Tastatur, Antippen), Kamera drehen,
   Regionstitel und Minikarte, Gespräche/Knopf, gemerkte Stelle, Teleport-Knopf. Aufruf: node test/welt3d.test.cjs   (BILD=pfad/ für Bildschirmfotos) */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary' };
const BILD = process.env.BILD || '';
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), c = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await c.newPage(); const fehler = [];
  p.on('pageerror', (e) => fehler.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
  await c.route('https://**', (r) => r.abort());
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_mein_held', JSON.stringify({ aussehen: { g: 'mann', frisur: 'scheitel', bart: 'vollbart', haar: 'dunkelbraun', haut: 'mittel' }, waffe: 'schwert' })); localStorage.removeItem('ez_welt_pos'); });
  const t0 = Date.now(); await p.goto('http://localhost:8765/echtzeit/?server=&welt3d=1&neu=1');
  await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 90000 });
  console.log(`  geladen in ${((Date.now() - t0) / 1000).toFixed(1)} s`); await p.waitForFunction(() => !window.EZW.welt3d.motor.warte.length && !window.EZW.welt3d.motor.laedt.size, null, { timeout: 60000 }); await p.waitForTimeout(1000);
  const st = await p.evaluate(() => { const W = window.EZW.welt3d; return { ort: { ...W.ort }, hier: W.hier, chunks: W.motor.st.size, titel: (document.querySelector('#ez-titel b, #ez-titel') || {}).textContent, canvas: !!document.querySelector('#ez-feld canvas'), phaser: !!window.Phaser && !!document.querySelector('#ez-feld canvas[data-phaser]'), name: W.schild.textContent }; });
  check(st.canvas && st.chunks > 0, `3D-Welt läuft (${st.chunks} Chunks gebaut)`);
  check(st.hier === 'waldmark' && Math.abs(st.ort.x - 6448) < 3, `Start in der Waldmark (${st.ort.x.toFixed(1)} | ${st.ort.y.toFixed(1)}, Titel „${(st.titel || '').trim().slice(0, 40)}“)`);
  check(/Lv|Gast/.test(st.name), `Namensschild über dem Helden: „${st.name}“`);
  check(await p.evaluate(() => ['q', 'e', 'r'].every((t) => getComputedStyle(document.querySelector(`[data-taste="${t}"]`)).display === 'none') && getComputedStyle(document.querySelector('#ez-modus')).display === 'none' && document.querySelector('[data-taste="a"] small').textContent === 'Angreifen'), 'Auch außerhalb der Kampfgebiete nur „Angreifen“ (keine alten Fähigkeitstasten)');
  check(await p.evaluate(() => { const W = window.EZW.welt3d, o = W.ort, kopf = W.motor.bildschirm(o.x, W.motor.hoehe(o.x, o.y) + 2.0, o.y), r = W.schild.getBoundingClientRect(); return kopf && r.bottom <= kopf.y + 4 && r.bottom > kopf.y - 40 && Math.abs((r.left + r.right) / 2 - kopf.x) < 6; }), 'Das Namensschild sitzt über dem Kopf des Helden');
  if (BILD) await p.screenshot({ path: BILD + 'start.png' });
  /* WASD zur Kamera hin gedacht: W weg von der Kamera, S zu ihr hin, A links, D rechts */
  const lauf = { g: 0 }; const ergebnis = [];
  for (const [k, sx, sy] of [['w', 0, -1], ['d', 1, 0], ['s', 0, 1], ['a', -1, 0]]) { const o0 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort, t: window.EZW.welt3d.simZeit })); await p.keyboard.down(k); await p.waitForTimeout(1500); await p.keyboard.up(k); await p.waitForTimeout(150);
    const o1 = await p.evaluate(() => ({ x: window.EZW.welt3d.ort.x, y: window.EZW.welt3d.ort.y, g: window.EZW.welt3d.motor.gieren, t: window.EZW.welt3d.simZeit, v: window.EZW.welt3d.figur && 0 })), g = o1.g; lauf.g = g;
    const soll = [sx * Math.cos(g) + sy * Math.sin(g), -sx * Math.sin(g) + sy * Math.cos(g)], weit = Math.hypot(o1.x - o0.x, o1.y - o0.y), passt = weit > 0.05 ? ((o1.x - o0.x) * soll[0] + (o1.y - o0.y) * soll[1]) / weit : 1;
    ergebnis.push({ k, weit, passt, zeit: o1.t - o0.t }); }
  const tempo = await p.evaluate(() => 3); console.log('    ' + ergebnis.map((e) => `${e.k.toUpperCase()}: ${e.weit.toFixed(1)} Felder in ${e.zeit.toFixed(2)} s Spielzeit (${(e.passt * 100).toFixed(0)} %)`).join(' · '));
  check(ergebnis.every((e) => e.passt > 0.7 && (e.weit > 0.05 || e.zeit < 0.08)) && ergebnis.filter((e) => e.weit > 0.05).length >= 3, 'Laufen mit WASD, jede Taste in ihre Richtung – ausgerichtet an der Kamera');
  check(ergebnis.some((e) => e.zeit > 0 && e.weit / e.zeit > 2), `Lauftempo stimmt (bestes: ${Math.max(...ergebnis.map((e) => e.zeit ? e.weit / e.zeit : 0)).toFixed(1)} Felder je Sekunde Spielzeit)`);
  /* Kamera drehen mit der rechten Maustaste */
  const g0 = lauf.g; await p.mouse.move(640, 400); await p.mouse.down({ button: 'right' }); await p.mouse.move(760, 400, { steps: 6 }); await p.mouse.up({ button: 'right' });
  check(await p.evaluate((g) => Math.abs(window.EZW.welt3d.motor.gieren - g) > 0.3, g0), 'Kamera dreht sich mit der rechten Maustaste');
  if (BILD) await p.screenshot({ path: BILD + 'gedreht.png' });
  /* Ziehen (linke Maustaste, am Handy ein Finger) dreht die Kamera ebenfalls – der Held bleibt stehen */
  { const g1 = await p.evaluate(() => window.EZW.welt3d.motor.gieren), o1 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); await p.mouse.move(500, 300); await p.mouse.down(); await p.mouse.move(380, 300, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(300);
    const g2 = await p.evaluate(() => window.EZW.welt3d.motor.gieren), o2 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })), marke = await p.evaluate(() => window.EZW.welt3d.marke.visible);
    check(Math.abs(g2 - g1) > 0.3 && Math.hypot(o2.x - o1.x, o2.y - o1.y) < 0.3 && !marke, `Ziehen dreht die Kamera (${(g2 - g1).toFixed(2)}), ohne loszulaufen`); }
  /* Antippen: dorthin gehen */
  const ziel = await p.evaluate(() => { const W = window.EZW.welt3d, o = W.ort; for (const [dx, dy] of [[-4, 0], [4, 0], [0, 4], [0, -4], [-3, 3], [3, 3]]) { const x = o.x + dx, y = o.y + dy; if (W.raster.frei(x, y, 0.3)) { const q = W.motor.bildschirm(x, W.motor.hoehe(x, y), y); if (q) return { x, y, px: q.x, py: q.y }; } } return null; });
  if (ziel) { await p.mouse.click(ziel.px, ziel.py); await p.waitForFunction((z) => Math.hypot(window.EZW.welt3d.ort.x - z.x, window.EZW.welt3d.ort.y - z.y) < 0.8, ziel, { timeout: 30000 }).catch(() => {}); }
  const nachKlick = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); check(ziel && Math.hypot(nachKlick.x - ziel.x, nachKlick.y - ziel.y) < 0.8, `Antippen einer Bodenstelle: der Held geht genau dorthin (${ziel ? Math.hypot(nachKlick.x - ziel.x, nachKlick.y - ziel.y).toFixed(2) : '–'} Felder entfernt)`);
  check(await p.evaluate(() => { const m = document.querySelector('#ez-karte-punkt'); return m && m.style.left.endsWith('%'); }), 'Minikarte: der Punkt läuft mit');
  check(await p.evaluate(() => !!JSON.parse(localStorage.getItem('ez_welt_pos') || 'null')), 'Die Stelle wird gemerkt');
  check(await p.evaluate(() => document.querySelectorAll('#ez-kartenrahmen .rknoepfe button, #ez-kartenrahmen [data-k]').length) > 0, 'Knöpfe an der runden Karte da');
  /* Antippen auf der Minikarte: der Held läuft dorthin */
  { const o1 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })), r = await p.evaluate(() => { const b = document.querySelector('#ez-karte').parentElement.getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.5 }; });
    await p.mouse.click(r.x + 25, r.y + 18); await p.waitForTimeout(400);
    const z = await p.evaluate(() => { const W = window.EZW.welt3d; return W.pfad.length ? W.pfad[W.pfad.length - 1] : null; });
    check(z && (z.x - o1.x) > 1 && (z.y - o1.y) > 1, `Antippen auf der Minikarte: Weg nach rechts unten (Ziel ${z ? (z.x - o1.x).toFixed(1) + ' | ' + (z.y - o1.y).toFixed(1) : '–'} Felder entfernt)`);
    await p.waitForTimeout(3000); const o2 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); check(Math.hypot(o2.x - o1.x, o2.y - o1.y) > 0.5, 'und der Held läuft los'); }
  /* Gespräche und Türen: zum Brunnen, „Ansehen“ [E] zeigt den Text; zur Heldenhalle, der Knopf öffnet die Heldenhalle */
  await p.evaluate(() => window.EZW.gehe(6448, 6435.6)); await p.waitForFunction(() => { const k = document.querySelector('#ez-dorf-knopf'); return k && !k.hidden && /Ansehen/.test(k.textContent); }, null, { timeout: 40000 }).catch(() => {});
  const knopf = await p.evaluate(() => { const k = document.querySelector('#ez-dorf-knopf'); return k && !k.hidden ? k.textContent : ''; }); check(/Ansehen/.test(knopf), `Am Brunnen erscheint der Knopf „${knopf.trim()}“`);
  await p.keyboard.press('e'); await p.waitForTimeout(400); check(/Brunnen der Waldmark/.test(await p.evaluate(() => document.querySelector('#ez-dorf-hilfe').textContent)), '[E] zeigt den Text des Brunnens');
  await p.evaluate(() => window.EZW.gehe(6448, 6422.2)); await p.waitForFunction(() => { const k = document.querySelector('#ez-dorf-knopf'); return k && !k.hidden && !/Ansehen/.test(k.textContent); }, null, { timeout: 60000 }).catch(() => {});
  const halle = await p.evaluate(() => document.querySelector('#ez-dorf-knopf').textContent); check(!/Ansehen/.test(halle) && halle.trim().length > 0, `Vor der Heldenhalle: „${halle.trim()}“`);
  if (BILD) await p.screenshot({ path: BILD + 'halle.png' });
  await p.click('#ez-dorf-knopf'); await p.waitForTimeout(800);
  check(await p.evaluate(() => window.EZW.welt3d.gesperrt && [...document.querySelectorAll('.tafel, #ez-halle, [id*=halle]')].some((e) => e.offsetParent)), 'Der Knopf öffnet die Heldenhalle (die Welt steht still)');
  if (BILD) await p.screenshot({ path: BILD + 'halle-offen.png' });
  check(!fehler.length, 'Keine Fehler im Browser ' + fehler.slice(0, 4).join(' | '));
  await b.close(); console.log(f ? f + ' Fehler' : '3D-Welt Stufe 1: alles in Ordnung'); process.exit(f ? 1 : 0); })();
