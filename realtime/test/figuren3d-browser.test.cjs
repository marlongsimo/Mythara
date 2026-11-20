/* Mythara – Browserprüfung der Figuren-Vorschau (echtzeit/figurenvorschau.html) und der Testszene (echtzeit/figurentest.html). Braucht den Testserver auf Port 8765. Aufruf: node test/figuren3d-browser.test.cjs */
const { chromium } = require('playwright'); const S = process.env.EZ_BILD || require('os').tmpdir(); let ok = true; const check = (b, t) => { console.log((b ? '✓ ' : '✗ ') + t); if (!b) ok = false; };
(async () => { const b = await chromium.launch(); const fehler = [];
  /* Vorschau */
  const p = await b.newPage({ viewport: { width: 1280, height: 860 } }); p.on('pageerror', (e) => fehler.push('vorschau: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') fehler.push('vorschau: ' + m.text()); });
  await p.goto('http://localhost:8765/echtzeit/figurenvorschau.html'); await p.waitForFunction(() => window.VORSCHAU && Object.keys(window.VORSCHAU.atlas).length > 5, null, { timeout: 30000 }); await p.waitForTimeout(800);
  const st = await p.evaluate(() => ({ ebenen: Object.keys(VORSCHAU.atlas), meld: VORSCHAU.meldungen.map((m) => m.art + ':' + m.text) }));
  check(!st.meld.some((m) => m.startsWith('fehler')), 'Vorschau lädt die Standardausrüstung ohne Fehlermeldung (' + st.ebenen.length + ' Ebenen)' + (st.meld.some((m) => m.startsWith('fehler')) ? ' ' + st.meld.join(' | ') : ''));
  check(await p.isVisible('#testmarke'), 'Vorschau zeigt den Hinweis TEST ASSET'); await p.screenshot({ path: S + '/v1-standard.png' });
  await p.click('#richtungen button[data-r="*"]'); await p.waitForTimeout(400); await p.screenshot({ path: S + '/v2-alle8.png' });
  await p.selectOption('#anim', 'attack'); await p.click('#spiel'); for (let i = 0; i < 7; i++) await p.click('#vor'); await p.screenshot({ path: S + '/v3-angriff.png' });
  const reihe = await p.textContent('#stand'); check(/Frame 8\//.test(reihe), 'Einzelbild-Schritte funktionieren (' + reihe.split('·')[2].trim() + ')');
  await p.click('text=Schatten (episch)'); await p.waitForTimeout(600); await p.click('#richtungen button[data-r="SW"]'); await p.selectOption('#anim', 'idle'); await p.click('#spiel'); await p.waitForTimeout(500); await p.screenshot({ path: S + '/v4-schatten.png' });
  await p.click('text=Schwert & Schild'); await p.waitForTimeout(600); await p.click('#richtungen button[data-r="*"]'); await p.selectOption('#anim', 'block'); await p.waitForTimeout(500); await p.screenshot({ path: S + '/v5-schild.png' });
  const w = await p.evaluate(() => VORSCHAU.wahl); check(w.main_hand === 'test_schwert_kurz' && w.off_hand === 'test_schild_rund', 'Set „Schwert & Schild“ angelegt');
  /* Zweihänder wählen: der Schild muss weichen */
  const idx = await p.evaluate(() => [...document.querySelectorAll('#slots select')].findIndex((s) => [...s.options].some((o) => o.value === 'test_zweihaender')));
  await p.locator('#slots select').nth(idx).selectOption('test_zweihaender'); await p.waitForTimeout(500);
  const w2 = await p.evaluate(() => VORSCHAU.wahl); check(w2.main_hand === 'test_zweihaender' && !w2.off_hand, 'Zweihänder legt den Schild ab (Nebenhand belegt)');
  await p.click('text=Splitter (legendär)'); await p.waitForTimeout(500); await p.click('#richtungen button[data-r="N"]'); await p.selectOption('#anim', 'walk'); await p.waitForTimeout(400); await p.screenshot({ path: S + '/v6-splitter-n.png' });
  /* Testszene mit echter Simulation */
  const t = await b.newPage({ viewport: { width: 1100, height: 700 } }); t.on('pageerror', (e) => fehler.push('test: ' + e.message)); t.on('console', (m) => { if (m.type() === 'error') fehler.push('test: ' + m.text()); });
  await t.goto('http://localhost:8765/echtzeit/figurentest.html'); await t.waitForFunction(() => window.FT && window.FT.mc && window.FT.mc.container.length > 5, null, { timeout: 30000 }); await t.waitForTimeout(600);
  const a0 = await t.evaluate(() => [FT.mc.animator.anim, FT.mc.animator.richtung, FT.mc.container.length]); check(a0[0] === 'idle', `Testszene: Krieger steht (${a0.join(', ')} Ebenen)`); await t.screenshot({ path: S + '/t1-start.png' });
  await t.keyboard.down('d'); await t.waitForTimeout(700); const a1 = await t.evaluate(() => [FT.mc.animator.anim, FT.mc.animator.richtung, FT.tempo.toFixed(2)]); await t.screenshot({ path: S + '/t2-geht.png' }); await t.keyboard.up('d');
  check(a1[0] === 'walk' || a1[0] === 'run', `Nach rechts laufen: ${a1[0]}, Richtung ${a1[1]}, ${a1[2]} m/s`); check(a1[1] === 'O', 'Richtung passt zur Bewegung (Osten)');
  await t.waitForTimeout(600); const a3 = await t.evaluate(() => [FT.mc.animator.anim, FT.tempo.toFixed(2)]); check(a3[0] === 'idle', 'Stehen bleiben: idle (' + a3.join(', ') + ' m/s)');
  await t.keyboard.down('s'); await t.keyboard.down('a'); await t.waitForTimeout(600); const a2 = await t.evaluate(() => FT.mc.animator.richtung); await t.keyboard.up('s'); await t.keyboard.up('a'); check(a2 === 'SW', 'Diagonal links unten: Richtung SW (' + a2 + ')');
  /* einer Kröte als Ziel: der Held läuft hin und schlägt zu */
  const gesehen = new Set(); for (let i = 0; i < 80; i++) { await t.evaluate(() => { const s = FT.sim, h = s.ich; let m = null, bd = 1e9; for (const w of s.wesen) { if (w.held || w.tot || w.team === 0) continue; const d = Math.hypot(w.x - h.x, w.y - h.y); if (d < bd) { bd = d; m = w; } } if (m) { if (bd > 1.6) s.eingabe({ t: 'lauf', x: m.x, y: m.y }); else s.eingabe({ t: 'halt' }); s.eingabe({ t: 'ziel', id: m.id }); } });
    await t.waitForTimeout(150); gesehen.add(await t.evaluate(() => FT.mc.animator.anim)); if (gesehen.has('attack') && gesehen.has('hit')) break; }
  await t.screenshot({ path: S + '/t3-kampf.png' }); check(gesehen.has('attack'), 'Hieb der Simulation löst die Angriffsanimation aus (' + [...gesehen].join(', ') + ')');
  const e1 = await t.evaluate(async () => { const p1 = await FT.mc.anlegen('head', 'test_helm_schatten'); const p2 = await FT.mc.anlegen('off_hand', 'test_schild_rund'); return [p1, p2, FT.mc.ausruestung.main_hand, FT.mc.ausruestung.head]; });
  check(e1[0].length === 0 && e1[1].length === 0 && !e1[2] && e1[3] === 'test_helm_schatten', 'Ausrüstungswechsel im Spiel: Schattenhelm an, Schild an (Zweihänder abgelegt)');
  await t.waitForTimeout(400); await t.screenshot({ path: S + '/t4-wechsel.png' });
  const tiefe = await t.evaluate(() => [FT.mc.container.depth, FT.sim.ich.y * 20 + 15]); check(Math.abs(tiefe[0] - tiefe[1]) < 1, 'Zeichentiefe nach dem Fußpunkt wie im Spiel');
  check(fehler.length === 0, 'Keine Fehler in der Browser-Konsole' + (fehler.length ? ': ' + fehler.slice(0, 3).join(' | ') : ''));
  await b.close(); console.log(ok ? '\nVorschau und Testszene: alles in Ordnung' : '\nVorschau und Testszene: FEHLER'); process.exit(ok ? 0 : 1); })();
