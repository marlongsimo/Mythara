# Mythara Echtzeit

Die Echtzeit-Engine entsteht hier neben dem bisherigen Spiel. Das bisherige Spiel wird davon nicht berührt.

| Ordner | Inhalt |
|---|---|
| `shared/` | Zahlen, Karte mit Wegsuche und die **Simulation** – läuft auf dem Server und ersatzweise im Browser |
| `server/` | Node-Spielserver: rechnet die Partie mit 20 Schritten je Sekunde, schickt etwa 10 Zustände je Sekunde über WebSocket |
| `client/` | Phaser 3 + TypeScript: isometrische Darstellung, Klick-Steuerung, Kamera, Anzeige |
| `test/` | Prüfungen für Simulation, Server und Client |
| `../echtzeit/` | der gebaute Client, wie ihn GitHub Pages ausliefert |

## Befehle (in diesem Ordner)

    npm install
    npm run check    # Typprüfung
    npm run build    # baut ../echtzeit (Client) und server/dist (Server)
    npm start        # Server auf Port 8787 (PORT=… ändert das)
    npm test         # alle Prüfungen; der Browser-Teil braucht „node tools/testserver.js“ im Hauptordner

## Wer rechnet?

- **Mit Server** (so soll es sein): Der Browser schickt nur Eingaben (`lauf`, `ziel`, `faehig`, `halt`, `neu`). Bewegung, Treffer, Schaden und Tod entscheidet allein der Server.
- **Ohne Server:** Ist in `client/src/main.ts` keine Serveradresse eingetragen oder der Server nicht erreichbar, rechnet der Browser dieselbe Simulation selbst. Das ist zum Ausprobieren da und nicht gegen Schummeln geschützt.

Zum Testen eines Servers ohne Neubau: `…/echtzeit/?server=wss://adresse`.

## Server einrichten (Render)

Im Hauptordner liegt `render.yaml`. Bei Render ein neues „Blueprint“ aus dem Repository anlegen; danach die Adresse des Dienstes (`wss://….onrender.com`) in `client/src/main.ts` bei `SERVER` eintragen und neu bauen.
Die Datei ist nicht gegen Render erprobt – beim ersten Einrichten bitte das Protokoll des Dienstes ansehen.

Geheime Schlüssel (etwa ein Supabase-Service-Schlüssel, sobald Ergebnisse gespeichert werden) gehören ausschließlich in die Umgebungsvariablen des Servers, nie in `client/` oder `shared/`.

## Stand

Erster Schnitt durch Phase 1 bis 4 des Gesamtkonzepts: Verbindung, isometrische Karte, Klick-Bewegung mit Wegsuche, Kamera, Angriffe, zwei Fähigkeiten, Monster mit einfachem Verhalten, ein Begleiter, Erfahrung und Stufen, Erbsplitter, ein Boss mit angekündigtem Flächenschlag, „Riss geschafft“.
Noch nicht: Anmeldung über Supabase, Speichern, Animationen, eigene Kartenkacheln (Tiled), weitere Helden, Gegenstände, mehrere Spieler in einem Riss.
