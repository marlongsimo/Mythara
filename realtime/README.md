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

## Kampfsystem 0.1

Alle Werte stehen in `shared/config.ts`. Wer am Balancing dreht, ändert nur diese Datei, baut neu (`npm run build`) und misst mit `node test/messen.mjs`.

- **Zwei Würfe wie bei Old School RuneScape:** Angriffswurf (0 bis Angriffswert) gegen Verteidigungswurf (0 bis Verteidigungswert für genau diese Angriffsart: Nahkampf, Fernkampf oder Magie). Trifft der Angriff, wird der Schaden zwischen Mindest- und Höchstschaden der Waffe gewürfelt.
- **Zwei Waffen je Held** als Kippschalter; es gilt immer nur die gewählte.
- **Fernkämpfer** schießen nur im Stehen und holen kurz aus; Nahkämpfer schlagen auch im Laufen.
- **Fähigkeiten Q, E, R** haben nur Abklingzeiten. Flächen und Sprünge treffen räumlich, ohne Trefferwurf.
- **Torvalds Schild** (zweite Waffe) erhöht von vorn seinen Verteidigungswurf.
- **Erholung:** nach 5 Sekunden ohne Schaden 4 % des Höchstlebens je Sekunde.
- **Knochenwächter** holen sichtbar aus; wer dann außer Reichweite ist, wird nicht getroffen. Eine Gruppe wacht gemeinsam auf.

## Stand

Fünf Helden (Torvald, Vaelin, Elara, Vex, Orin) mit Heldenwahl und bis zu zwei Begleitern, zwölf Knochenwächter in fünf Gruppen, Dungeon-Arena, direkte Steuerung (WASD, Steuerknüppel), Torvald mit Lauf- und Hieb-Animation.
Noch nicht: Stufen und Erfahrung (für den ersten Balancing-Test abgeschaltet), Anmeldung über Supabase, Speichern, Figurenbilder für die übrigen Helden und Monster, Gegenstände, mehrere Spieler in einem Riss.
