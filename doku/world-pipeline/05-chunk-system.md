# World Pipeline – Phase 5: Chunk-System

Stand: 20.11.2026.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/shared/welt/raster.ts` | `WeltRaster`: Gehraster aus Chunks mit denselben Abfragen wie `shared/karte.ts` (Kollision, Sichtlinie, Schieben, Wegsuche) – ohne feste Kartengröße, ohne gemeinsamen Zustand |
| `realtime/client/src/welt/welt.ts` | Szene `Welt`: lädt Chunks nach Sichtfeld, holt den Ring dahinter vor, gibt Entferntes frei |
| `realtime/client/src/main.ts` | Zwei Zeilen: Import und Eintrag in die Szenenliste (`?welt=<region>`) |
| `realtime/werkzeug/welt/pruefwelt.mjs` | Erzeugt eine große Prüfwelt (6 × 4 Chunks, rund 1650 Bäume) zum Messen; wird nicht ausgeliefert |
| `realtime/test/welt-raster.test.mjs` | 20 Prüfungen, darunter der Vergleich mit der bestehenden Wegsuche |
| `realtime/test/welt-strom.test.mjs` | Nachladen im Browser: Rechner, Handy, großer Bildschirm, Belastungslauf |

Ausprobieren: `…/echtzeit/?welt=beispiel` (mit `&test=1` werden Gehraster, Chunk-Grenzen, Zonen und Messwerte eingeblendet).

## Wie das Nachladen arbeitet

- **Zeigen:** alle Chunks, die das Sichtfeld schneiden, plus 0,3 Chunk Rand. Je Bild wird höchstens ein Chunk neu gezeigt.
- **Vorholen:** der Ring bis einen Chunk hinter dem Bildrand. Geholt werden Daten und das fertig entpackte Bodenbild, aber noch keine Textur.
- **Freigeben:** Was das Bild verlässt, verliert seine Textur und seine Objekte; ab 1,5 Chunks Abstand auch Daten und Gehraster.
- Objektbilder werden über alle Chunks geteilt und beim ersten Bedarf geladen.
- Beim Start werden die Chunks rund um den Helden schon im Ladebildschirm geholt.

## Was die Szene kann (Ausbaustufe 1)

- Ein Held läuft allein: Tasten, Steuerknüppel, Tipp oder Klick mit Wegsuche. Kollision und Tempo wie in der Simulation.
- Tiefensortierung nach Fußpunkt; Bäume werden durchscheinend, wenn der Held dahinter steht (geprüft werden nur die Chunks um ihn).
- Titel und Minikarte der Region, Zoomknopf, gemerkte Stelle.
- Ausgänge führen in bestehende Orte, in Kämpfe oder an eine andere Stelle der Welt. Interaktion „lesen“ zeigt ihren Text.
- Dorffiguren stehen an ihrem Platz (noch ohne Gespräch).

**Noch nicht:** Gegner, Mitspieler, Server. Bewegung rechnet der Browser allein. Das folgt in Phase 10.

## Geprüft

- Typprüfung ohne Fehler, `node build.mjs` läuft.
- Neue Prüfungen: `welt-daten` 21, `welt-bau` 20, `welt-raster` 20 – alle bestanden.
- Wegsuche: 300 zufällige Strecken auf dem Waldweg sind gleich lang wie mit der bestehenden Wegsuche (größte Abweichung 0,5 Rechenfelder); Schieben liefert dasselbe Ergebnis. Zeit für 300 Suchen: 20 ms gegenüber 23 ms.
- Nachladen (Lauf über 186 Rechenfelder quer durch die Prüfwelt):

| Lauf | Bilder mit fehlendem Chunk | zugleich im Bild | am Ende im Speicher (von 24) |
|---|---|---|---|
| Rechner 1280 × 800 | 0 | 6 | – |
| Handy (iPhone 13) | 0 | 6 | 8 |
| Großer Bildschirm 1920 × 1080, dreifaches Tempo | 0 | 6 | 12 |
| Dreifaches Tempo, jede Datei 250 ms verzögert | 0 | 6 | 12 |

- Bestand: `sim.test` (61 Prüfungen, mit Browser und Server), `koop`, `server-kampf`, `konto`, `handy`, `waldweg`, `stufe`, `kampagne`, `rabenmoor` bestanden. Waldmark, Weidenhain und Waldweg laden ohne Fehler.

## Leistung – was die Messung sagt und was nicht

Die Prüfumgebung hat keine Grafikkarte; der Browser rechnet die Bilder in Software. Absolute Bildzeiten sind deshalb nicht auf echte Geräte übertragbar.
Aussagekräftig ist der Vergleich: Bei 1280 × 800 braucht die Welt je Bild 62 ms, der bestehende Waldweg 60 ms, Weidenhain 47 ms. Die Welt ist also nicht teurer als der Bestand.
Eine Messung auf einem echten Handy steht aus.

## Bekannte Grenzen

- `echtzeit/spiel.js` ist nicht mehr bytegleich mit dem ausgelieferten Stand (rund 19 KB mehr). Ohne `?welt=` wird die neue Szene nicht gestartet.
- Bis zu 14 entpackte Bodenbilder liegen im Vorholring bereit. Auf Geräten mit wenig Speicher ist das der erste Wert zum Verkleinern (`VORHOLEN`, `BEHALTEN` in `welt.ts`).
- Die Wegsuche sucht in einem Fenster um Start und Ziel und höchstens über 6000 Felder. Sehr weite Umwege findet sie nicht – gewollt, damit ein Klick ins Unerreichbare nichts kostet.
- Dorffiguren werden vorläufig nach Namenskonvention geladen (`img/echtzeit/<figur>.webp`, quadratische Einzelbilder).
- Der Titel einer Region steht im Zierrahmen der Waldmark; lange Namen brechen um.

## Als Nächstes: Phase 6

World-Builder, Stufe 1: Region öffnen, Gelände malen, Objekte setzen, speichern, im Spiel ansehen.

## Feste Regel: gleich große Chunks im gemeinsamen Raster (21.11.2026)

- Jeder Chunk ist **32 × 32 Rechenfelder = 1536 × 1536 Bildpunkte** – in jeder Region, ohne Ausnahme.
- Jede Region besteht nur aus **ganzen Chunks** und liegt mit **ganzzahligen Chunk-Koordinaten** im gemeinsamen Weltraster (`region.ursprung`, `region.chunks`).
- Bodenbilder und Chunkdaten heißen nach ihrer Lage (`echtzeit/welt/<cx>_<cy>.webp|json`).
- Damit ist die Weltkarte einfach das Raster der Bodenbilder: `python3 werkzeug/welt/weltkarte.py [--px 128]` setzt sie zusammen
  (mit Gebäuden, Bäumen und Dingen an ihren Fußpunkten) und schreibt `echtzeit/welt/weltkarte.webp`.
