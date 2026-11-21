/* Mythara – Leistungsmessung der modularen 3D-Figuren in der Testszene (echtzeit/figurentest.html?anzahl=N). Braucht den Testserver auf Port 8765.
   Aufruf: node test/figuren3d-leistung.cjs [ausgabe.json]   – misst Ladezeit, Texturen, Grafikspeicher, Sprites und Rechenzeit der Darstellung für 1, 11 und 31 Figuren. */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const aus = [];
  for (const n of [0, 10, 30]) {
    const p = await b.newPage({ viewport: { width: 1100, height: 700 } }); let bytes = 0;
    p.on('response', async (r) => { if (/figuren3d/.test(r.url())) { try { bytes += (await r.body()).length; } catch { /* abgebrochen */ } } });
    const t0 = Date.now(); await p.goto('http://localhost:8765/echtzeit/figurentest.html?anzahl=' + n);
    await p.waitForFunction((k) => window.FT && window.FT.mc && window.FT.menge.length === k, n, { timeout: 120000 }); const bereit = Date.now() - t0;
    await p.waitForTimeout(3000); const s = await p.evaluate(() => window.FT.statistik()); s.seiteBereitMs = bereit; s.downloadMB = +(bytes / 1e6).toFixed(2); aus.push(s);
    console.log(JSON.stringify(s)); await p.close(); }
  await b.close(); if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(aus, null, 1)); })();
