# Die neue Waldmark im Spiel – Ausgangspunkt der Welt

Stand: 21.11.2026. Die Waldmark der offenen Welt ersetzt im Spiel das gemalte Waldmark-Bild. Auf ihr baut die Welt künftig auf.
Keine Änderungen an Server, Datenbank, Koop oder Kampagnen.

## Was sich für Spieler ändert

- **Spielstart** (`echtzeit/` ohne Zusatz, nach Anmeldung oder als Gast): die neue Waldmark, Start am Brunnen; die zuletzt besuchte Stelle wird gemerkt.
- **Heldenhalle:** An ihrer Tür „Die Heldenhalle betreten“ – öffnet die Heldenauswahl wie bisher.
- **Südtor:** „Zur Weltkarte“ – öffnet die Weltkarte wie bisher das Stadttor. Durch das offene Tor läuft man ohne Ladebildschirm auf den Waldweg.
- **Taverne, Markt:** „kommt noch“ wie bisher. Schmiede, Kapelle, Kräuterhaus, Bäckerei und Brunnen zeigen einen kurzen Text.
- **Menü unten rechts:** Helden, Weltkarte, Riss, Menü – wie bisher. Der Riss ist nur noch über das Menü erreichbar (er war in der gemalten Waldmark ein Ort im Bild).
- **Rückkehr aus einer Kampagne** (`?von=tor`, etwa „Zurück nach Waldmark“ in Weidenhain): Man steht auf dem Waldweg vor dem Südtor.
- **Alte Ausgangspunkte bleiben erreichbar:** das gemalte Bild unter `?stadt=bild`, die alte Iso-Stadt unter `?stadt=alt`.

## Was im Code geändert wurde

| Datei | Änderung |
|---|---|
| `realtime/client/src/welt/anschluss.ts` (neu) | Verbindet die Welt mit Heldenhalle, Weltkarte, Riss, Menütafel, Oberfläche; Ankunft vor dem Tor |
| `realtime/client/src/main.ts` | Szenenliste: ohne Zusatz `[Welt, Spiel]` statt `[Stadt, Spiel]`; `?stadt=bild` und `?stadt=alt` wählen die alten Szenen |
| `realtime/client/src/welt/welt.ts` | Einstellpunkte `WELT.tat`, `WELT.menue`, `WELT.tor`; Interaktionen mit `daten.tat`; `halt()`, `profil()`; Untertitel der Region |
| `realtime/client/src/konto.ts` | Heldenwechsel in der Profiltafel lädt auch in der neuen Waldmark neu (eine Bedingung ergänzt) |
| `realtime/werkzeug/welt/waldmark.mjs` | Interaktionen mit `tat` (halle, welt, bald); Waldmark und Waldweg sind keine Entwürfe mehr |
| `realtime/welt/regionen/beispiel/region.json` | Entwurf: wird nicht mehr ausgeliefert |
| `realtime/test/konto.test.mjs` | erkennt „im Spiel“ jetzt an beiden Ausgangspunkten |
| `realtime/test/welt-spielstart.test.mjs` (neu) | Prüfung des neuen Spielstarts |

## Geprüft

- `welt-spielstart.test`:
  - Spielstart in der Welt-Szene mit Banner und Startpunkt am Brunnen;
  - Menü vorhanden;
  - Heldenhalle und Weltkarte öffnen sich;
  - der Riss zeigt die Heldenwahl;
  - `?von=tor` führt vor das Tor;
  - das gemalte Bild, Weidenhain und die Waldweg-Strecke der Kampagne sind weiter erreichbar.
- Bestand: `sim` (mit Browser und Server), `handy`, `konto`, `koop`, `server-kampf` bestanden.
- Welt: `welt-waldmark`, `welt-waldmark-browser`, `welt-daten`, `welt-bau`, `welt-raster`.

## Auslieferung

Die Änderungen liegen auf dem Arbeitszweig `claude/mythara-world-pipeline-z4ynx5`. Live geht das Spiel über GitHub Pages vom Zweig `main` (`echtzeit/`). Für die Auslieferung müssen dorthin übernommen werden:

- `echtzeit/spiel.js`, `echtzeit/index.html`, `echtzeit/welt/` (Weltdaten),
- `img/welt/` (Gebäude, Bäume).

Der Spielserver (Render, Zweig `feature/realtime-engine`) ist nicht betroffen. Die Übernahme nach `main` steht noch aus und braucht deine Freigabe.

## Wie es weitergeht

Neue Regionen grenzen im Weltgitter an Waldmark oder Waldweg an und werden mit `node werkzeug/welt/bauen.mjs` gebaut. Neue Gebäude entstehen als Bauplan (`09-raeumliche-gebaeude.md`).
