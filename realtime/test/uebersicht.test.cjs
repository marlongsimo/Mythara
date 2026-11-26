/* Mythara – die Übersichtskarte (Knopf „Karte“ an der Minikarte, Taste M): alle Regionen aus welt.json, eigene Stelle mittig, ziehen, fester Zoom (etwa 750 Felder Breite, #11), keine Gegner; das Spiel bekommt solange keine Tasten. Aufruf: node test/uebersicht.test.cjs */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = '/home/user/mythara', TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.css': 'text/css', '.woff2': 'font/woff2' };
const BILD = '/tmp/claude-0/-home-user/41c9406e-0350-52e3-a9f4-165cb5f77c3a/scratchpad/';
(async () => { const b = await chromium.launch(); let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  for (const [vp, name] of [[{ width: 1280, height: 720 }, 'Bildschirm'], [{ width: 844, height: 390, hasTouch: true, isMobile: true }, 'Handy (quer)']]) {
  const c = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.hasTouch, isMobile: !!vp.isMobile, deviceScaleFactor: 1 }), p = await c.newPage(); const fehler = []; p.on('pageerror', (e) => fehler.push(String(e)));
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), contentType: TYP[path.extname(fl)] || 'application/octet-stream' }); });
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_welt_pos', JSON.stringify([6448, 6470, 'waldweg'])); });
  await p.goto('http://localhost:8765/echtzeit/?server='); await p.waitForFunction(() => window.EZW && window.EZW.szene && window.EZW.szene.ort, null, { timeout: 30000 }); await p.waitForTimeout(1500);
  const knopf = p.locator('#ez-kartenrahmen [aria-label="Karte"]'); check(await knopf.count() === 1, `${name}: Knopf „Karte“ an der Minikarte`);
  await knopf.click(); await p.waitForSelector('#ez-uebersicht', { timeout: 5000 }); await p.waitForTimeout(1200);
  const info = await p.evaluate(() => { const u = document.getElementById('ez-uebersicht'), im = [...u.querySelectorAll('.wk-leinwand img[data-region]')], fl = u.querySelector('.wk-flaeche').getBoundingClientRect(), ich = u.querySelector('.wk-ich i').getBoundingClientRect();
    return { regionen: im.map((i) => i.dataset.region), geladen: im.every((i) => i.complete && i.naturalWidth > 0), namen: [...u.querySelectorAll('.wk-name')].map((n) => n.textContent), ort: u.querySelector('.wk-kopfort').textContent, kopf: (() => { const t = u.querySelector('.wk-kopf b').getBoundingClientRect(), o = u.querySelector('.wk-kopfort').getBoundingClientRect(); return { ueber: !(o.left >= t.right - 0.5 || o.right <= t.left + 0.5) || o.width === 0 }; })(),
      mitte: Math.hypot(ich.x + ich.width / 2 - (fl.x + fl.width / 2), ich.y + ich.height / 2 - (fl.y + fl.height / 2)), tf: u.querySelector('.wk-leinwand').style.transform, gegner: u.querySelectorAll('.wk-leinwand *:not(img):not(.wk-name):not(.wk-ich):not(i)').length }; });
  const erwartet = await p.evaluate(() => Object.values(window.EZW.szene.index.regionen).filter((r) => !r.region.ebene).map((r) => r.region.id)); /* Ebenen (Untergrund wie der Unterschlupf, Obergeschosse wie Rathaus oben) zeigt die Karte nicht */
  const namenSoll = await p.evaluate(() => new Set(Object.values(window.EZW.szene.index.regionen).filter((r) => !r.region.ebene).map((r) => r.region.name)).size); /* ein Land aus mehreren Kacheln hat einen Namen */
  check(JSON.stringify(info.regionen.sort()) === JSON.stringify(erwartet.sort()) && info.geladen, `${name}: alle Regionen aus welt.json als Bilder geladen (${info.regionen.join(', ')})`);
  check(info.namen.length === namenSoll, `${name}: Regionsnamen (${info.namen.join(', ')}), Ort oben: ${info.ort}`);
  check(info.mitte < 3, `${name}: eigene Stelle beim Öffnen in der Mitte (${info.mitte.toFixed(1)} px)`);
  check(!info.kopf.ueber, `${name}: Titel „Karte“ und Ortsname überdecken sich nicht`);
  check(info.gegner === 0, `${name}: keine Gegner oder Figuren auf der Karte`);
  await p.screenshot({ path: BILD + 'uebersicht-' + name + '.png' });
  /* ziehen */
  const vorher = info.tf; await p.mouse.move(vp.width / 2, vp.height / 2); await p.mouse.down(); await p.mouse.move(vp.width / 2 - 150, vp.height / 2 - 80, { steps: 6 }); await p.mouse.up();
  const nach = await p.evaluate(() => document.querySelector('#ez-uebersicht .wk-leinwand').style.transform); check(nach !== vorher, `${name}: Ziehen verschiebt die Karte (${vorher} → ${nach})`);
  /* fester Zoom: etwa 750 Felder in der Breite, kein Zoomen mit Rad, Fingern oder Knöpfen */
  const z = () => p.evaluate(() => Number(getComputedStyle(document.getElementById('ez-uebersicht')).getPropertyValue('--wkz'))); const z0 = await z();
  const felder = vp.width / (z0 * 4); check(Math.abs(felder - 750) < 5, `${name}: fester Ausschnitt ${felder.toFixed(0)} Felder breit`);
  check(await p.locator('#ez-uebersicht [data-k="plus"], #ez-uebersicht [data-k="minus"]').count() === 0 && await p.locator('#ez-uebersicht [data-k="ich"]').count() === 1, `${name}: keine Knöpfe + / −, „zu mir“ bleibt`);
  check(/Ziehen zum Verschieben · M oder Esc schließt/.test(await p.locator('#ez-uebersicht .wk-hilfe').textContent()), `${name}: Hilfetext ohne Zoomen`);
  if (name === 'Bildschirm') { await p.mouse.move(640, 360); await p.mouse.wheel(0, -600); await p.waitForTimeout(100); await p.keyboard.press('+'); await p.waitForTimeout(100); const z2 = await z(); check(z2 === z0, `Mausrad und Taste + zoomen nicht (${z0.toFixed(3)} → ${z2.toFixed(3)})`);
    await p.click('#ez-uebersicht [data-k="ich"]'); await p.screenshot({ path: BILD + 'uebersicht-fest.png' });
    /* Tasten gehen nicht ans Spiel */
    const o0 = await p.evaluate(() => [window.EZW.szene.ort.x, window.EZW.szene.ort.y]); await p.keyboard.down('d'); await p.waitForTimeout(700); await p.keyboard.up('d'); const o1 = await p.evaluate(() => [window.EZW.szene.ort.x, window.EZW.szene.ort.y]);
    check(Math.hypot(o1[0] - o0[0], o1[1] - o0[1]) < 0.2, `Bei offener Karte läuft der Held nicht (${Math.hypot(o1[0] - o0[0], o1[1] - o0[1]).toFixed(2)} Felder)`);
    await p.keyboard.press('m'); await p.waitForTimeout(200); check(await p.locator('#ez-uebersicht').count() === 0, 'M schließt die Karte');
    await p.keyboard.press('m'); await p.waitForTimeout(300); check(await p.locator('#ez-uebersicht').count() === 1, 'M öffnet sie wieder'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); check(await p.locator('#ez-uebersicht').count() === 0, 'Esc schließt');
    await p.keyboard.down('d'); await p.waitForTimeout(700); await p.keyboard.up('d'); const o2 = await p.evaluate(() => [window.EZW.szene.ort.x, window.EZW.szene.ort.y]); check(Math.hypot(o2[0] - o1[0], o2[1] - o1[1]) > 0.5, 'Danach läuft der Held wieder');
  } else { await p.click('#ez-uebersicht .wk-zu'); await p.waitForTimeout(200); check(await p.locator('#ez-uebersicht').count() === 0, `${name}: ✕ schließt`); }
  check(!fehler.length, `${name}: keine Fehler im Browser ${fehler.join(' | ')}`); await c.close(); }
  await b.close(); console.log(f ? f + ' Fehler' : 'Übersichtskarte: alles in Ordnung'); process.exit(f ? 1 : 0); })();
