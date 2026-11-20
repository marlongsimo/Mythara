/* Mythara – der MMO-Rahmen im Browser: Aktionen 1–4 unten rechts, runde Minikarte, Rucksack/Ausrüstung/Quests (Testseite auf Port 8765, ohne Server). */
const { chromium } = require('playwright'); let f = 0; const ok = (b, t) => { console.log((b ? '✓ ' : '✗ ') + t); if (!b) f++; };
(async () => { const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 1280, height: 720 } }), p = await c.newPage(), err = []; p.on('pageerror', (e) => err.push(String(e)));
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); localStorage.setItem('ez__alles', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_ort_weidenhain', JSON.stringify({ ankunft: true, hanne: true })); });
  await p.goto('http://localhost:8765/echtzeit/?server=&ort=weidenhain&kampf=waldweg'); await p.waitForFunction(() => window.EZ && window.EZ.zustand(), null, { timeout: 30000 }); await p.waitForTimeout(800);
  ok(await p.$$eval('#ez-tasten [data-taste]', (l) => l.map((x) => x.querySelector('b').textContent).join('')) === '1234', 'Aktionen 1–4 unten rechts');
  const box = await p.$eval('#ez-tasten', (e) => e.getBoundingClientRect().toJSON()); ok(box.right > 1200 && box.bottom > 650, 'Aktionsfeld sitzt unten rechts');
  ok(await p.$eval('#ez-karte', (e) => /translate/.test(e.style.transform) && e.querySelectorAll('u.feind').length === 6), 'Runde Minikarte folgt dem Helden und zeigt 6 Gegner');
  await p.keyboard.press('b'); ok(await p.isVisible('.tafel.taschen .faecher'), 'B öffnet den Rucksack'); await p.click('.treiter [data-a=ausruestung]'); ok(await p.isVisible('.tafel.taschen .puppe'), 'Reiter Ausrüstung');
  await p.keyboard.press('Escape'); ok(await p.$eval('#ez-konto', (e) => e.hidden), 'Esc schließt'); await p.keyboard.press('l'); ok(await p.isVisible('.tafel.quests'), 'L öffnet die Quests'); await p.keyboard.press('Escape');
  /* Angriff: zum Lager laufen, dann 1 drücken */
  await p.evaluate(() => { const z = window.EZ.zustand(), m = z.w.find((e) => e[3] !== 0); window.EZ.netz.sende({ t: 'lauf', x: m[4] - 4, y: m[5] + 3 }); });
  await p.waitForFunction(() => { const z = window.EZ.zustand(), i = z.w.find((e) => e[0] === z.ich.id); return z.w.some((e) => e[3] !== 0 && Math.hypot(e[4] - i[4], e[5] - i[5]) < 11); }, null, { timeout: 30000 }).catch(() => {});
  await p.keyboard.press('1'); await p.waitForTimeout(400); ok(await p.evaluate(() => window.EZ.zustand().ich.zielId) > 0, 'Taste 1 wählt den nächsten Gegner als Ziel');
  await p.keyboard.press('2'); await p.waitForTimeout(300); ok(await p.evaluate(() => window.EZ.zustand().ich.cdQ) > 0, 'Taste 2 löst Fähigkeit 1 (Q) aus');
  /* Stadt */
  await p.goto('http://localhost:8765/echtzeit/?server='); await p.waitForTimeout(4000);
  ok(await p.$$eval('#ez-kartenrahmen .rknoepfe small', (l) => l.map((x) => x.textContent).join(',')) === 'Weltkarte,Teleport,Quests', 'Waldmark: Weltkarte · Teleport · Quests unter der runden Karte');
  await p.click('#ez-menue [aria-label=Ausrüstung]'); ok(await p.isVisible('.tafel.taschen .puppe'), 'Waldmark: Ausrüstung über das Menü'); await p.keyboard.press('Escape');
  await p.click('#ez-kartenrahmen [aria-label=Weltkarte]'); await p.waitForTimeout(500); ok(await p.isVisible('#ez-welt'), 'Weltkarte über den Knopf an der Minikarte');
  ok(err.length === 0, 'keine Fehler ' + err.join(' | ')); await b.close(); process.exit(f ? 1 : 0); })();
