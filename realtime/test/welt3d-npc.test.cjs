/* Mythara – 3D-Dorfbewohner: die Wachen als 3D-Modell (stadtwache3d) statt Bild, Nia läuft in ihrem Salon umher, bleibt stehen und tritt vor die Tür.
   Aufruf: node test/welt3d-npc.test.cjs   (BILD=pfad/ für Bildschirmfotos) */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const WURZEL = path.resolve(__dirname, '..', '..'), TYP = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };
const BILD = process.env.BILD || '';
(async () => { let f = 0; const check = (ok, t) => { console.log((ok ? '✓ ' : '✗ ') + t); if (!ok) f++; };
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), c = await b.newContext({ viewport: { width: 1280, height: 800 } }), p = await c.newPage(); const fehler = [];
  p.on('pageerror', (e) => fehler.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  await c.route('http://localhost:8765/**', (r) => { let u = new URL(r.request().url()).pathname; if (u.endsWith('/')) u += 'index.html'; const fl = path.join(WURZEL, decodeURIComponent(u)); if (!fs.existsSync(fl)) return r.fulfill({ status: 404, body: '' }); r.fulfill({ status: 200, body: fs.readFileSync(fl), headers: { 'content-type': TYP[path.extname(fl)] || 'application/octet-stream' } }); });
  await c.route('https://**', (r) => r.abort());
  await c.addInitScript(() => { sessionStorage.setItem('ez__gefragt', '1'); sessionStorage.setItem('ez__hilfe', '1'); localStorage.setItem('ez_mein_held', JSON.stringify({ aussehen: { g: 'frau', frisur: 'lang', bart: 'ohne', haar: 'blond', haut: 'hell' }, waffe: 'schwert' })); localStorage.removeItem('ez_welt_pos'); });
  await p.goto('http://localhost:8765/echtzeit/?server=&welt3d=1&neu=1');
  await p.waitForFunction(() => window.EZW && window.EZW.welt3d && window.EZW.welt3d.figur && window.EZW.welt3d.figur.geladen, null, { timeout: 90000 });
  /* zu den Wachen am Südtor der Waldmark */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6448, 6463));
  await p.waitForFunction(() => { const M = window.EZW.welt3d.motor, s = M.st.get('201_201'); return s && s.gebaut && s.npcs && s.npcs.length === 2 && s.npcs.every((n) => n.geladen); }, null, { timeout: 90000 }).catch(() => {});
  const w = await p.evaluate(() => { const s = window.EZW.welt3d.motor.st.get('201_201'); return s && s.npcs ? s.npcs.map((n) => ({ geladen: n.geladen, bildWeg: n.gruppe && n.ersatz ? !n.ersatz.visible : null, x: n.gruppe.position.x, z: n.gruppe.position.z })) : []; });
  check(w.length === 2 && w.every((n) => n.geladen), `Beide Wachen am Tor als 3D-Modell (${JSON.stringify(w.map((n) => [n.x, n.z]))})`);
  await p.evaluate(() => { const M = window.EZW.welt3d.motor; M.gieren = 0; M.neigen = 0.6; M.abstand = 10; }); await p.waitForTimeout(1500);
  if (BILD) await p.screenshot({ path: BILD + 'wachen.png' });
  /* keine 2D-Figuren in der Welt: weder Bewohner-Bilder noch das alte Heldenbild (Bildaufsteller: ShaderMaterial, renderOrder ≥ 10) */
  const zweiD = async () => p.evaluate(() => { let n = 0; window.EZW.welt3d.motor.szene.traverse((o) => { let v = o.visible, q = o.parent; while (v && q) { v = q.visible; q = q.parent; } if (v && o.isMesh && o.material && o.material.isShaderMaterial && o.renderOrder >= 10) n++; }); return n; });
  check(await zweiD() === 0, 'Keine 2D-Figur sichtbar (Tor)');
  check(await p.evaluate(() => window.EZW.welt3d.figur.constructor.name !== 'FigurLeinwand' && !!window.EZW.welt3d.figur.mixer), 'Auch der Held ohne eigenes Aussehen (Gast) ist ein 3D-Modell');
  /* zu Nias Salon */
  await p.evaluate(() => window.EZW.welt3d.versetzen(6458.5, 6431.5));
  await p.waitForFunction(() => { const s = window.EZW.welt3d.motor.st.get('201_200'); return s && s.wanderer && s.wanderer[0] && s.wanderer[0].npc.geladen; }, null, { timeout: 90000 }).catch(() => {});
  check(await p.evaluate(() => { const s = window.EZW.welt3d.motor.st.get('201_200'); return !!(s && s.wanderer && s.wanderer[0].npc.geladen); }), 'Nia (npc.nia) ist im Salon geladen');
  /* über einige Sekunden: wo war sie, ist sie gelaufen und hat gestanden, war sie draußen? Das Testbild ist langsam – darum Spielzeit beschleunigt */
  const spur = await p.evaluate(async () => { const n = window.EZW.welt3d.motor.st.get('201_200').wanderer[0], s = []; const R = n.w;
    for (let i = 0; i < 1500; i++) { n.schritt(0.1); s.push({ x: n.x, z: n.z, geht: n.pfad.length > 0 }); }
    return { s, R }; });
  const drinnen = (q) => q.x >= spur.R.drinnen[0] && q.x <= spur.R.drinnen[2] + 1 && q.z >= spur.R.drinnen[1] && q.z <= spur.R.drinnen[3] + 1;
  const draussen = (q) => q.z >= 6429;
  const zielStellen = new Set(spur.s.filter((q, i) => i && !q.geht && spur.s[i - 1].geht).map((q) => q.x.toFixed(1) + '|' + q.z.toFixed(1)));
  check(spur.s.some((q) => q.geht) && spur.s.some((q) => !q.geht), `Nia läuft und bleibt stehen (${spur.s.filter((q) => q.geht).length} von ${spur.s.length} Schritten unterwegs)`);
  check([...zielStellen].length >= 3, `Sie steuert verschiedene Stellen an (${zielStellen.size} verschiedene Halte in 150 s Spielzeit)`);
  check(spur.s.some(draussen) && spur.s[spur.s.length - 1] && spur.s.filter(drinnen).length > spur.s.filter(draussen).length, `Sie tritt vor die Tür (${spur.s.filter(draussen).length} Schritte draußen) und ist meist drinnen (${spur.s.filter(drinnen).length})`);
  check(await p.evaluate((s) => s.every((q) => { const M = window.EZW.welt3d.motor; return M.gehbar(Math.floor(q.x), Math.floor(q.z)); }), spur.s), 'Sie geht nie durch Wände (jede Stelle begehbar)');
  /* Bildschirmfoto: Nia vor der Tür oder im Haus */
  await p.evaluate(() => { const M = window.EZW.welt3d.motor; M.gieren = 0; M.neigen = 0.75; M.abstand = 11; }); await p.waitForTimeout(2500);
  if (BILD) await p.screenshot({ path: BILD + 'nia.png' });
  await p.evaluate(() => window.EZW.welt3d.versetzen(6458.5, 6426.5)); await p.waitForTimeout(3000);
  if (BILD) await p.screenshot({ path: BILD + 'nia-drinnen.png' });
  check(await zweiD() === 0, 'Keine 2D-Figur sichtbar (Marktplatz: Schmied, Junge, Krämer … sind weg)');
  check(!fehler.filter((e) => !/favicon|Failed to load resource|net::ERR/.test(e)).length, 'Keine Fehler im Browser ' + fehler.slice(0, 3).join(' | '));
  await b.close(); console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : '3D-Dorfbewohner: alles in Ordnung'); process.exit(f ? 1 : 0);
})();
