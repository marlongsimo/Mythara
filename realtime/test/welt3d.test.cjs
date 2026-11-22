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
  check(ergebnis.some((e) => e.zeit > 0 && e.weit / e.zeit > 1.5), `Lauftempo stimmt (bestes: ${Math.max(...ergebnis.map((e) => e.zeit ? e.weit / e.zeit : 0)).toFixed(1)} Felder je Sekunde Spielzeit)`);
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
  check(await p.evaluate(() => { const c = document.querySelector('#ez-kartenrahmen canvas.karte3d'); if (!c || !c.width) return false; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let hell = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) hell++; return hell > d.length / 8; }), 'Minikarte live aus der 3D-Welt gezeichnet');
  check(await p.evaluate(() => /rotate/.test(document.querySelector('#ez-karte').style.transform)), 'Die Minikarte dreht sich mit der Kamera');
  check(await p.evaluate(() => !!JSON.parse(localStorage.getItem('ez_welt_pos') || 'null')), 'Die Stelle wird gemerkt');
  check(await p.evaluate(() => document.querySelectorAll('#ez-kartenrahmen .rknoepfe button, #ez-kartenrahmen [data-k]').length) > 0, 'Knöpfe an der runden Karte da');
  /* Antippen auf der Minikarte: der Held läuft dorthin */
  { const o1 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })), r = await p.evaluate(() => { const b = document.querySelector('#ez-karte').parentElement.getBoundingClientRect(); return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.5 }; });
    await p.mouse.click(r.x + 25, r.y + 18); await p.waitForTimeout(400);
    const z = await p.evaluate(() => { const W = window.EZW.welt3d; return W.pfad.length ? W.pfad[W.pfad.length - 1] : null; }), g = -(await p.evaluate(() => window.EZW.welt3d.motor.gieren));
    /* die Karte ist mit der Kamera gedreht: rechts unten am Bildschirm ist in der Welt (25, 18) um −gieren gedreht */
    const soll = [25 * Math.cos(g) - 18 * Math.sin(g), 25 * Math.sin(g) + 18 * Math.cos(g)], ist = z ? [z.x - o1.x, z.y - o1.y] : [0, 0], passt = (ist[0] * soll[0] + ist[1] * soll[1]) / (Math.hypot(...ist) * Math.hypot(...soll) || 1);
    check(z && passt > 0.9, `Antippen auf der gedrehten Minikarte: Weg in die angetippte Richtung (Ziel ${ist.map((v) => v.toFixed(1)).join(' | ')} Felder, Richtung passt zu ${(passt * 100).toFixed(0)} %)`);
    await p.waitForTimeout(3000); const o2 = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); check(Math.hypot(o2.x - o1.x, o2.y - o1.y) > 0.5, 'und der Held läuft los'); }
  /* Handeln durch Antippen der Stelle: beim Hinlaufen erscheint kein Knopf mehr; die angetippte Stelle zeigt einen kleinen Knopf, der Held geht hin und handelt */
  const tippe = async (x, y) => { const q = await p.evaluate(([x, y]) => { const W = window.EZW.welt3d; return W.motor.bildschirm(x, W.motor.hoehe(x, y), y); }, [x, y]); await p.mouse.click(q.x, q.y); await p.waitForTimeout(400); };
  await p.evaluate(() => window.EZW.gehe(6448, 6437.5)); await p.waitForFunction(() => Math.hypot(window.EZW.welt3d.ort.x - 6448, window.EZW.welt3d.ort.y - 6437.5) < 0.8, null, { timeout: 40000 }).catch(() => {});
  check(await p.evaluate(() => document.querySelector('#ez-dorf-knopf').hidden), 'Am Brunnen erscheint beim Hinlaufen kein Knopf mehr');
  await p.evaluate(() => { const M = window.EZW.welt3d.motor; M.gieren = 0; M.neigen = 0.95; M.abstand = 16; }); await p.waitForTimeout(800);
  await tippe(6448, 6435.6);
  const wahl1 = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(wahl1 === 'Ansehen', `Antippen des Brunnens: kleiner Knopf „${wahl1}“ an der Stelle`);
  if (BILD) await p.screenshot({ path: BILD + 'wahl-brunnen.png' });
  await p.click('.ez-wahl3d button'); await p.waitForFunction(() => /Brunnen der Waldmark/.test(document.querySelector('#ez-dorf-hilfe').textContent), null, { timeout: 30000 }).catch(() => {});
  check(await p.evaluate(() => /Brunnen der Waldmark/.test(document.querySelector('#ez-dorf-hilfe').textContent)), 'Der Knopf: hingehen und den Text des Brunnens zeigen');
  /* Rathaus: Treppe antippen → „Hoch“ → oben im Ratssaal; dort „Runter“ */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6438.5, 6426)); await p.waitForTimeout(2500); await p.evaluate(() => { const M = window.EZW.welt3d.motor; M.gieren = 0; M.neigen = 1.2; M.abstand = 12; }); await p.waitForTimeout(1000);
  await tippe(6435.7, 6423.8);
  const wahl2 = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(wahl2 === 'Hoch', `Treppe im Rathaus: „${wahl2}“`);
  if (BILD) await p.screenshot({ path: BILD + 'wahl-treppe.png' });
  await p.click('.ez-wahl3d button'); await p.waitForFunction(() => window.EZW.welt3d.ort.x > 7400 && !window.EZW.welt3d.gesperrt, null, { timeout: 40000 }).catch(() => {});
  const oben = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); check(oben.x > 7400, `Hoch: der Held steht oben im Ratssaal (${oben.x.toFixed(1)} | ${oben.y.toFixed(1)})`);
  await p.waitForTimeout(2500); await tippe(7500.7, 7377.4);
  const wahl3 = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(wahl3 === 'Runter', `Oben an der Treppe: „${wahl3}“`);
  if (BILD) await p.screenshot({ path: BILD + 'wahl-runter.png' });
  await p.click('.ez-wahl3d button'); await p.waitForFunction(() => window.EZW.welt3d.ort.x < 6500 && !window.EZW.welt3d.gesperrt, null, { timeout: 40000 }).catch(() => {});
  check(await p.evaluate(() => Math.hypot(window.EZW.welt3d.ort.x - 6436, window.EZW.welt3d.ort.y - 6425) < 3), 'Runter: wieder unten im Rathaus');
  /* die Heldenhalle: Tür antippen → Knopf → Heldenhalle */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6448, 6425)); await p.waitForFunction(() => { const W = window.EZW.welt3d, M = W.motor; return !M.warte.length && !M.laedt.size && W.anStelle(6448, 6421.2); }, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(1500); await p.evaluate(() => { const M = window.EZW.welt3d.motor; M.gieren = 0; M.neigen = 0.95; M.abstand = 14; }); await p.waitForTimeout(800);
  await tippe(6448, 6421.2);
  const halle = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(halle.trim().length > 0 && !/Ansehen/.test(halle), `Tür der Heldenhalle: „${halle.trim()}“`);
  if (BILD) await p.screenshot({ path: BILD + 'halle.png' });
  await p.click('.ez-wahl3d button'); await p.waitForFunction(() => window.EZW.welt3d.gesperrt, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(800);
  check(await p.evaluate(() => window.EZW.welt3d.gesperrt && [...document.querySelectorAll('.tafel, #ez-halle, [id*=halle]')].some((e) => e.offsetParent)), 'Der Knopf öffnet die Heldenhalle (die Welt steht still)');
  if (BILD) await p.screenshot({ path: BILD + 'halle-offen.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(500); if (await p.evaluate(() => window.EZW.welt3d.gesperrt)) { await p.click('#ez-konto [data-t="zu"]').catch(() => {}); await p.waitForTimeout(500); }
  /* Leiter im Häuschen zum Unterschlupf: „Runter“, unten die Leiter „Hoch“ */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6302.4, 6585)); await p.waitForFunction(() => { const M = window.EZW.welt3d.motor; return !M.warte.length && !M.laedt.size; }, null, { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(2500);
  await tippe(6302.4, 6582.8);
  const wahl4 = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(wahl4 === 'Runter', `Loch im Häuschen: „${wahl4}“`);
  if (BILD) await p.screenshot({ path: BILD + 'wahl-loch.png' });
  await p.click('.ez-wahl3d button'); await p.waitForFunction(() => window.EZW.welt3d.ort.x > 7300 && !window.EZW.welt3d.gesperrt, null, { timeout: 40000 }).catch(() => {});
  check(await p.evaluate(() => window.EZW.welt3d.ort.x > 7300), 'Runter: der Held ist unten im Unterschlupf');
  await p.waitForTimeout(2500); await tippe(7372, 7390.2);
  const wahl5 = await p.evaluate(() => { const w = document.querySelector('.ez-wahl3d button'); return w ? w.textContent : ''; }); check(wahl5 === 'Hoch', `Unten an der Leiter: „${wahl5}“`);
  /* Tippen woanders schließt den Knopf und geht dorthin */
  { const o = await p.evaluate(() => ({ ...window.EZW.welt3d.ort })); const z = await p.evaluate(() => { const W = window.EZW.welt3d, o = W.ort; for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) { const x = o.x + dx, y = o.y + dy; if (W.raster.frei(o, { x, y }, 0.3) && !W.anStelle(x, y)) return [x, y]; } return null; });
    if (z) await tippe(z[0], z[1]); check(z && await p.evaluate(() => !document.querySelector('.ez-wahl3d')), 'Tippen auf freien Boden schließt den Knopf (und der Held geht dorthin)'); void o; }
  check(!fehler.length, 'Keine Fehler im Browser ' + fehler.slice(0, 4).join(' | '));
  await b.close(); console.log(f ? f + ' Fehler' : '3D-Welt Stufe 1: alles in Ordnung'); process.exit(f ? 1 : 0); })();
