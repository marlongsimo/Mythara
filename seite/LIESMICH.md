# Dateien für die Wurzel von main

Die Pipeline „Welt live“ (`.github/scripts/welt-live.sh`, `MAIN_DATEIEN`) legt diese Dateien an die Wurzel von `main`:

| Quelle | auf main |
|---|---|
| `realtime/client/startseite.html` (Rolle Oberfläche) | `index.html` |
| `seite/manifest.webmanifest` | `manifest.webmanifest` (alte App-Installationen starten in `echtzeit/`) |
| `seite/spiel.html` | `spiel.html` (früher das Würfelspiel; leitet nach `echtzeit/` weiter, für alte App-Installationen) |

Einmalige Löschung auf `main` (#157, Freigabe des Nutzers 27.11.2026): `.github/main-loeschen.txt`.
