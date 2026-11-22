# World Pipeline – Zwischenschritt: Waldmark als Dorf im Wald (Entwurf)

Stand: 20.11.2026. Eingeschoben vor Phase 6 (World-Builder), auf Wunsch: Gebäude selbst bauen, „viel mehr aus Holz“.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/werkzeug/welt/haus.py` | Hausgenerator: setzt Gebäude aus Texturen zusammen und trägt sie mit Fußpunkt, Kollision und Türpunkt in die Objektbibliothek ein |
| `img/welt/gebaeude/` | 15 erzeugte Bilder: zwei Wohnhäuser, Hütte, Scheune, Schuppen, Taverne, Schmiede, Heldenhalle, drei Marktstände, Brunnen, Dorftor, zwei Palisadenstücke |
| `realtime/werkzeug/welt/waldmark.mjs` | Legt die Regionen `waldmark` und `waldweg` an |
| `realtime/welt/regionen/waldmark/`, `…/waldweg/` | Die beiden Regionen (je 3 × 2 Chunks), als Entwurf markiert |
| `realtime/werkzeug/welt/boden.py` | Liest an Regionsgrenzen jetzt das Gelände der Nachbarregion mit (keine Kante am Übergang) |

Ansehen: `…/echtzeit/?welt=waldmark`. Die bestehende Waldmark (`stadt.ts`) ist unberührt und bleibt der Einstieg des Spiels.

## Das Dorf

- Lichtung im Wald, in der Mitte ein Pflasterplatz mit Brunnen.
- Heldenhalle im Norden, Taverne im Westen, Schmiede im Osten, Markt mit drei Ständen südlich des Platzes; dazu Wohnhäuser, Scheune, Schuppen, ein Teich.
- Palisade im Süden mit offenem Tor und zwei Wachen. Der Riss ist nicht mehr da.
- Durch das Tor läuft man **ohne Szenenwechsel** auf den Waldweg (eigene Region direkt südlich). Geprüft: Lauf vom Platz durchs Tor, die Region wechselt auf „Der Waldweg“, die Seite wird nicht neu geladen.
- Am Südende des Waldwegs führt ein Ausgang in das bestehende Weidenhain.
- Acht Dorfleute stehen an ihren Plätzen (vorhandene Figurenbilder der Waldmark).

## Was noch nicht geht

- **Die Gebäude haben keine Funktion.** Taverne, Schmiede, Heldenhalle und Markt zeigen nur einen Text. Laden, Heldenwahl und Gespräche hängen noch an der alten Waldmark; die Anbindung gehört zu Phase 10.
- **Keine Gegner auf dem Waldweg** (eine Krötengruppe ist als Spawnzone eingetragen, wird aber erst mit dem Server lebendig).
- **Waldboden ist noch eine Farbfläche** (keine Textur vorhanden).
- **Stilbruch:** Die Häuser sind aus flächigen Vektor-Texturen gebaut und wirken glatter als die gemalten Orte und Figuren. Für einen ersten Entwurf trägt das; für die Endfassung wären gemalte Texturen besser.

## Herkunft der Texturen – offen

Die Häuser entstehen aus drei Vorlagen, die als Archive hochgeladen wurden (Dachziegel, Holzbretter, Holzmaserung). Die Vorlagen selbst liegen **nicht** im Repository (`werkzeug/welt/texturen/`, per `.gitignore` ausgeschlossen), nur die daraus erzeugten Gebäudebilder.
Anbieter, Lizenzart und eine mögliche Pflicht zur Namensnennung sind noch zu bestätigen und dann in `img/welt/QUELLEN.md` einzutragen. Der Katalog meldet alle 15 Bilder deshalb mit „Herkunft/Lizenz ungeklärt“.
Ohne die Vorlagen lässt sich `haus.py` nicht ausführen (siehe `werkzeug/welt/texturen/LIESMICH.md`).

## Geprüft

- Formprüfung aller Regionen und Bibliotheken in Ordnung; Typprüfung ohne Fehler; Build läuft.
- `welt-daten`, `welt-bau`, `welt-raster`, `waldweg`, `stufe`: bestanden.
- Im Browser: Dorf lädt ohne Fehler; Lauf durchs Tor auf den Waldweg ohne Neuladen.
- Nicht erneut ausgeführt: `welt-strom` (Prüfwelt) und die Koop-, Server- und Konto-Tests – dieser Schritt hat nur Daten, Bilder und Werkzeuge hinzugefügt und am Spielcode nichts geändert.
