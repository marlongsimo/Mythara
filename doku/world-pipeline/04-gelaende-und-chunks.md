# World Pipeline – Phase 4: Gelände- und Objektbausteine, Chunk-Bau

Stand: 20.11.2026.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/werkzeug/welt/boden.py` | Bodenbäcker: malt aus der Geländekarte einer Region ein Bodenbild je Chunk (1536 × 1536) |
| `realtime/shared/welt/bau.ts` | Gehraster einer Region (Gelände + Objektkollision + Handkorrektur) und Zerlegung in Chunks |
| `realtime/werkzeug/welt/bauen.mjs` | Ein Befehl für alles: Formprüfung → Chunk-Dateien → Bodenbilder |
| `realtime/test/welt-bau.test.mjs` | 20 Prüfungen zu Gehraster, Kollisionsformen, Chunk-Aufteilung |
| `echtzeit/welt/` | Gebaute Beispielregion: `welt.json`, vier Chunk-Dateien, vier Bodenbilder |
| `realtime/welt/regionen/beispiel/vorschau.webp` | Verkleinerte Ansicht der ganzen Region |

Aufruf im Ordner `realtime`: `node werkzeug/welt/bauen.mjs [region …]`. Braucht Python mit Pillow, numpy und scipy (wie `gelaende.py`).

## Wie der Boden entsteht

Die Verfahren stammen aus `werkzeug/gelaende.py` und wurden auf beliebige Geländekarten verallgemeinert:

- Jede Textur liegt um 45 Grad gedreht in der Welt; so fällt kein Kachelraster auf.
- Die Geländearten werden nach Rang übereinandergelegt. Die eckigen Felder der Karte werden zu runden, leicht unregelmäßigen Formen.
- Randregeln:
  - `fransen` – der Rand franst unregelmäßig in den Nachbarn aus (Erdweg, Wiese).
  - `steine` – Pflaster endet in ganzen Steinen, am Rand liegen einzelne lose Steine.
  - `hart` – klare Kante.
  - `ufer` – Wasser bekommt den gemalten Uferstreifen und einen feuchten Saum.
- Varianten (Blumenwiese in der Wiese) wachsen in großen Flecken ein; eine sanfte Helligkeitsschwankung bricht die Wiederholung.
- Geländearten ohne Textur werden mit ihrer Platzhalterfarbe und etwas Körnung gemalt.

**Nahtlosigkeit:** Alles Unregelmäßige hängt nur von der Lage in der Welt ab, nicht von einer Zufallsfolge. Jeder Chunk rechnet vier Rechenfelder über seinen Rand hinaus.
Gemessen: Ein um einen halben Chunk versetzt gebackener Ausschnitt stimmt mit beiden Nachbar-Chunks bildpunktgenau überein (Abweichung 0). Jeder Chunk lässt sich deshalb einzeln neu backen (`--nur cx_cy`).
Übrig bleibt nur die Kompression: Jedes Bild wird einzeln als WebP gespeichert, an der Naht ist der Sprung rund 10 % größer als im Bildinneren. Im Vergleichsbild war das nicht zu sehen; ob es im Spiel auffällt, zeigt Phase 5.

## Gehraster und Kollision

- Gelände: begehbar → `.`, Wasser → `~` (versperrt den Weg, nicht die Sicht – wie in den Kampfkarten), sonst `#`.
- Objekte: Kollisionsfläche (Kreis, Rechteck, Vieleck) wird mit Maßstab und Spiegelung der Platzierung ins Raster übertragen. Ein Feld gilt als versperrt, wenn die Fläche mindestens vier von neun Messpunkten trifft; das Feld unter dem Fußpunkt eines Kreises immer.
- Danach die Handkorrektur aus `spiel.json`: erst `sperren`, dann `freigeben`.
- Das Ergebnis hat genau die Form der bestehenden Kampfkarten. Wegsuche und Kollision der Simulation können es ohne Umrechnung lesen.

## Ausgabe für das Spiel (`echtzeit/welt/`)

- `welt.json`: Maße, je Region Lage, Start, Spawnzonen, Ausgänge (in Weltkoordinaten) und die Darstellungsdaten aller verwendeten Objekte.
- `<cx>_<cy>.json`: Gehraster (32 Zeilen), Objekte (von hinten nach vorn geordnet), Figuren, Interaktionen – rund 2 KB.
- `<cx>_<cy>.webp`: Bodenbild, in der Beispielregion 400 bis 590 KB.

Chunks heißen nach ihrer Lage im Weltgitter, nicht nach der Region. Dadurch lädt der Client über Regionsgrenzen hinweg, ohne Regionen kennen zu müssen.

## Geprüft

- Typprüfung ohne Fehler; `node build.mjs` läuft; `echtzeit/spiel.js` bytegleich.
- `test/welt-bau.test.mjs` 20 von 20, `test/welt-daten.test.mjs` 21 von 21, `waldweg.test`, `stufe.test` bestanden.
- Nahtprobe des Bodenbäckers: Abweichung 0 (siehe oben).
- Backzeit: rund 10 Sekunden je Chunk.

## Bekannte Grenzen

- Am Rand einer Region gilt vorerst das Randfeld weiter. Sobald zwei Regionen aneinandergrenzen, muss der Bäcker die Geländekarte des Nachbarn mitlesen, sonst entsteht dort eine Kante. Das wird mit der ersten zusammenhängenden Welt (Phase 9) nötig.
- Wege, die schmaler als zwei Rechenfelder sind, können beim Abrunden in Stücke zerfallen.
- Die Objektbibliothek ist noch klein (sechs Bäume, ein Platzhalter-Brunnen). Mehr Bausteine hängen an neuen Bildern (Lückenliste in `01-ist-zustand-und-plan.md`, C8).

## Als Nächstes: Phase 5

Szene `Welt` im Client: Chunks nach Sichtfeld laden, vorladen, entladen; gemeinsames Chunk-Raster für Wegsuche und Kollision; Messung mit einer größeren Testregion.
