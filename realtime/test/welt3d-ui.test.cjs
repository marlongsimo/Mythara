/* Mythara – Oberfläche der 3D-Welt: kein Profil oben links, Chat links oben (einklappbar, halb durchsichtig), darunter die Leiste mit sieben Knöpfen,
   an der Minikarte nur Karte und Sprint, LP-Bogen und gelber Bogen. PC und Handy quer. Aufruf: node test/welt3d-ui.test.cjs   (BILD=pfad/ für Bildschirmfotos) */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };
const BILD = process.env.BILD || '';
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [art, opt] of [['PC', { viewport: { width: 1280, height: 800 } }], ['Handy quer', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }]]) {
    console.log(`— ${art}`); const c = await b.newContext(opt), p = await c.newPage(); const fehler = [];
    p.on('pageerror', (e) => fehler.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
    await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
    await c.route('https://**', (r) => r.abort());
    await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_mein_held', JSON.stringify({ aussehen: { g: 'mann', frisur: 'scheitel', bart: 'vollbart', haar: 'dunkelbraun', haut: 'mittel' }, waffe: 'schwert' })); localStorage.removeItem('ez_welt_pos'); });
    await p.goto('http://localhost:8765/echtzeit/?server=&welt3d=1&neu=1');
    await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen && document.querySelectorAll('#ez-leiste button').length, null, { timeout: 90000 });
    await p.waitForTimeout(1500);
    const sicht = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'; }, sel);
    check(!(await sicht('#ez-profil')) && !(await sicht('#ez-oben-knoepfe')) && !(await sicht('#ez-menue')), 'Kein Profil oben links, keine alten Knöpfe oben und rechts');
    const lage = await p.evaluate(() => { const c = document.getElementById('ez-chat').getBoundingClientRect(), l = document.getElementById('ez-leiste').getBoundingClientRect(), k = [...document.querySelectorAll('#ez-leiste button')].map((x) => { const r = x.getBoundingClientRect(); return [r.left, r.top, r.width, r.bottom]; });
      return { c: [c.left, c.top, c.right, c.bottom], l: [l.left, l.top, l.right, l.bottom], k, namen: [...document.querySelectorAll('#ez-leiste button')].map((x) => x.getAttribute('aria-label')), h: innerHeight }; });
    check(lage.c[0] < 30 && lage.c[1] < 30, `Chat links oben (${lage.c.map(Math.round).join(', ')})`);
    check(lage.namen.join(',') === 'Angriffsstil,Quests,Rucksack,Ausrüstung,Skills', `Leiste: ${lage.namen.join(' · ')}`);
    check(lage.l[0] < 30 && Math.abs(lage.h - lage.l[3] - 10) < 6 && lage.k.every((q, i) => !i || Math.abs(q[0] - lage.k[0][0]) < 1), `Leiste hochkant fest unten links (Knopf ${Math.round(lage.k[0][2])} px)`);
    /* Chat einklappen: nach oben, die Leiste rückt hoch */
    const zu0 = await p.evaluate(() => document.getElementById('ez-chat').classList.contains('zu'));
    if (zu0) { await p.click('#ez-chat .klapp'); await p.waitForTimeout(700); }
    { const o = await p.evaluate(() => { const c = document.getElementById('ez-chat').getBoundingClientRect(), k = [...document.querySelectorAll('#ez-leiste button')].map((x) => x.getBoundingClientRect()); return { cb: c.bottom, l: k[0].left, t: k[0].top, unten: k[k.length - 1].bottom, h: innerHeight, g: k[0].width }; });
      check(o.t >= o.cb && o.l < 30 && o.unten <= o.h && Math.abs(o.t - lage.k[0][1]) < 1, `Chat offen: die Leiste bleibt unten links an ihrem Platz und berührt den Chat nicht (${Math.round(o.t - o.cb)} px Luft)`); }
    const offen = await p.evaluate(() => ({ c: document.getElementById('ez-chat').getBoundingClientRect().bottom, l: document.getElementById('ez-leiste').getBoundingClientRect(), liste: getComputedStyle(document.querySelector('#ez-chat .liste')).backgroundColor, ein: getComputedStyle(document.querySelector('#ez-chat .eingabe input')).backgroundColor }));
    check(/rgba\(.*0\.5\)/.test(offen.liste) && /rgba\(.*0\.5\)/.test(offen.ein), `Chat offen: Nachrichten und Eingabefeld halb durchsichtig (${offen.liste}, ${offen.ein})`);
    if (BILD) await p.screenshot({ path: BILD + `ui-${art === 'PC' ? 'pc' : 'handy'}-chat-offen.png` });
    await p.click('#ez-chat .klapp'); await p.waitForTimeout(700);
    const zu = await p.evaluate(() => ({ zu: document.getElementById('ez-chat').classList.contains('zu'), c: document.getElementById('ez-chat').getBoundingClientRect(), l: document.getElementById('ez-leiste').getBoundingClientRect() }));
    check(zu.zu && zu.c.top < 30 && zu.c.height < 50 && Math.abs(zu.l.top - offen.l.top) < 1, `Eingeklappt nach oben (nur die Reiter, ${Math.round(zu.c.height)} px hoch); die Leiste bewegt sich nicht`);
    /* Minikarte: nur Karte und Sprint; Bögen */
    const karte = await p.evaluate(() => ({ k: [...document.querySelectorAll('#ez-kartenrahmen .rknoepfe button, #ez-kbogen button')].map((x) => x.getAttribute('aria-label')),
      links: [...document.querySelectorAll('#ez-kartenrahmen .rknoepfe button, #ez-kbogen button')].filter((x) => ['Teleport', 'Freunde', 'Einstellungen'].includes(x.getAttribute('aria-label'))).every((x) => { const r = x.getBoundingClientRect(), m = document.querySelector('#ez-kartenrahmen .rund').getBoundingClientRect(); return r.right <= m.left + m.width * 0.3 && r.left >= 0 && r.width > 0; }), b: !!document.querySelector('#ez-kartenrahmen .ez-boegen .voll.lp')?.getAttribute('d'), g: !!document.querySelector('#ez-kartenrahmen .ez-boegen .voll.gelb')?.getAttribute('d'),
      im: (() => { const r = document.querySelector('#ez-kartenrahmen .ez-boegen').getBoundingClientRect(); return r.right <= innerWidth + 1 && r.top >= -1; })() }));
    check(karte.k.join(',') === 'Karte,Sprint,Teleport,Freunde,Einstellungen', `An der Minikarte: ${karte.k.join(' · ')}`);
    check(karte.links, 'Teleport, Freunde und Einstellungen sitzen links neben der Karte');
    check(karte.b && karte.g && karte.im, 'LP-Bogen und gelber Bogen an der Minikarte, ganz im Bild');
    await p.evaluate(() => window.__lp && 0); /* Lebenspunkte im Kampf: gleich über die Anzeige selbst prüfen */
    /* Rucksack ohne Verweis auf Ausrüstung */
    const o0 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort }));
    await p.click('#ez-leiste [data-l="rucksack"]'); await p.waitForTimeout(500);
    const ruck = await p.evaluate(() => ({ offen: !!document.getElementById('ez-rucksacktab'), titel: document.querySelector('#ez-rucksacktab .kopf b')?.textContent, faecher: document.querySelectorAll('#ez-rucksacktab .traster .ifeld').length, reiter: !!document.querySelector('#ez-rucksacktab .treiter') }));
    check(ruck.offen && ruck.titel === 'Rucksack' && ruck.faecher === 24 && !ruck.reiter, `Rucksack öffnet sich als Tab (6 × 4 = ${ruck.faecher} Fächer), ohne Reiter zur Ausrüstung`);
    if (BILD && art === 'PC') await p.screenshot({ path: BILD + 'ui-pc-rucksack.png' });
    await p.click('#ez-leiste [data-l="stil"]'); await p.waitForTimeout(400); /* ein anderer Tab ersetzt den offenen */
    check(await p.evaluate(() => !document.getElementById('ez-rucksacktab') && !!document.getElementById('ez-stiltab')), 'Ein anderer Knopf ersetzt den offenen Tab');
    { const st = await p.evaluate(() => ({ titel: document.getElementById('ez-stiltab') ? 'Angriffsstil' : '', stile: [...document.querySelectorAll('#ez-stiltab .stil b')].map((b) => b.firstChild.textContent), an: document.querySelector('#ez-stiltab .stil.an b')?.firstChild.textContent, werte: document.querySelector('#ez-stiltab .stil.an b em')?.textContent }));
      check(st.titel === 'Angriffsstil' && st.stile.join() === 'Genau,Normal,Aggressiv' && st.an === 'Normal', `Angriffsstil (Schwert): ${st.stile.join(' · ')}, gewählt ${st.an} – ${st.werte}`);
      if (BILD && art === 'PC') await p.screenshot({ path: BILD + 'ui-stil.png' });
      await p.click('#ez-stiltab .stil[data-s="2"]'); await p.waitForTimeout(300);
      check(await p.evaluate(() => JSON.parse(localStorage.getItem('ez_stil') || '{}').nah === 2 && document.querySelector('#ez-stiltab .stil.an b').firstChild.textContent === 'Aggressiv'), 'Aggressiv gewählt: gemerkt und markiert'); }
    await p.click('#ez-leiste [data-l="skills"]'); await p.waitForTimeout(400);
    { const sk = await p.evaluate(() => [...document.querySelectorAll('#ez-skillstab .tskills li')].map((l) => (l.querySelector('img') ? '🖼' : '') + l.querySelector('b').textContent + ' ' + l.querySelector('.lv').textContent + '→' + l.querySelector('.lv.nach').textContent));
      check(sk.join(', ') === '🖼Geschick 1→2, 🖼Stärke 1→2, 🖼Fernkampf 1→2, 🖼Magie 1→2, 🖼Leben 1→2, 🖼Defense 1→2', `Skills-Tab: Zeichen, Name, Level, nächstes Level: ${sk.join(', ')}`); if (BILD && art === 'PC') await p.screenshot({ path: BILD + 'ui-skills.png' }); }
    await p.click('#ez-leiste [data-l="skills"]'); await p.waitForTimeout(300); check(await p.evaluate(() => !document.querySelector('.seitentab')), 'Nochmal antippen schließt den Tab');
    await p.click('#ez-leiste [data-l="quests"]'); await p.waitForTimeout(300);
    { const q = await p.evaluate(() => { const t = document.getElementById('ez-queststab'), r = document.getElementById('ez-leiste').querySelectorAll('[data-l]'); if (!t) return null; const a = t.getBoundingClientRect(); return { titel: t.querySelector('.kopf b').textContent, leer: /Noch keine Quests/.test(t.textContent), o: a.top - r[0].getBoundingClientRect().top, u: a.bottom - r[r.length - 1].getBoundingClientRect().bottom }; });
      check(q && q.titel === 'Quests' && q.leer && Math.abs(q.o) < 1.5 && Math.abs(q.u) < 1.5, `Quests als Tab in gleicher Größe, noch leer (${JSON.stringify(q)})`); }
    await p.click('#ez-leiste [data-l="quests"]'); await p.waitForTimeout(200);
    await p.click('#ez-kartenrahmen [aria-label="Einstellungen"]'); await p.waitForTimeout(500);
    check(await p.evaluate(() => !document.getElementById('ez-konto').hidden), 'Einstellungen öffnen das Menü');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); if (!(await p.evaluate(() => document.getElementById('ez-konto').hidden))) { await p.click('#ez-konto [data-t="zu"]').catch(() => {}); await p.waitForTimeout(300); }
    const o1 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort }));
    check(Math.hypot(o1.x - o0.x, o1.y - o0.y) < 0.3, 'Antippen der Leiste lässt den Helden nicht loslaufen');
    if (BILD) await p.screenshot({ path: BILD + `ui-${art === 'PC' ? 'pc' : 'handy'}.png` });
    check(!fehler.filter((e) => !/favicon|Failed to load resource|net::ERR/.test(e)).length, 'Keine Fehler im Browser ' + fehler.slice(0, 3).join(' | '));
    await c.close(); }
  await b.close(); console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : 'Oberfläche der 3D-Welt: alles in Ordnung'); process.exit(f ? 1 : 0);
})();
