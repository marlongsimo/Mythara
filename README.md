# Mythara

Das Strategie-Rollenspiel für den Spieltisch – ausgeliefert unter https://mythara-dungeon.de (GitHub Pages, Zweig `main`).

- Spiel: `index.html`, `handy.html`, `js/`, `css/`, `daten/`, `img/`, `ton/`
- Arena-Server (Supabase Edge Function): Quelle in `server/` und `js/{regeln,figuren}.js`, gebaut mit `node tools/arena-funktion-bauen.js` nach `supabase/functions/arena/index.ts`
- Datenbank: Migrationen mit Rückbau und Tests in `supabase/`
- Tests: `node tools/testserver.js` starten, dann `node tests/<name>.test.js`
- Konzepte und Doku: `doku/` und die `*.md` im Wurzelverzeichnis

Im Browser steht ausschließlich der öffentliche Publishable Key (`verbindung.js`). Niemals einen Secret- oder Service-Role-Key in dieses Repository schreiben.
