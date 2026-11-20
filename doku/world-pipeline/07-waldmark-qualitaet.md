# World Pipeline – Waldmark: Qualitäts- und Integrationsphase

Stand: 20.11.2026. Aufbau, Gebäude und ihre Positionen sind unverändert; geändert wurden Boden, Waldrand, Details und Prüfungen. Keine Änderungen an Server, Datenbank oder Kampagnen.

## 1. Bestandsaufnahme vor den Änderungen

Neue Prüfung `realtime/test/welt-waldmark.test.mjs` (ohne Browser). Befunde am bisherigen Stand:

| Prüfung | Ergebnis |
|---|---|
| Erreichbarkeit aller freien Felder im Dorf | in Ordnung (3155 von 3155) |
| Weg vom Brunnen durch das Tor auf den Waldweg | in Ordnung |
| Türen frei und erreichbar | in Ordnung |
| Interaktion der Schmiede | **lag 1,5 Felder neben der Tür** |
| Sichtbarkeit | **östliche Hütte zu 51 % von Baumkronen verdeckt** |
| Figuren, Bäume in Häusern, Objekte im Wasser | in Ordnung |
| Übergang Waldmark – Waldweg | in Ordnung |

## 2. Verbesserungen

**Boden**
- Drei neue, aus den vorhandenen Texturen abgeleitete Bodenbilder (`werkzeug/welt/texturen.py`): trockene Wiese, satte Wiese, Waldboden mit Moos, Nadeln und Laub. Gleicher Stil, gleiche Herkunft.
- Die Wiese mischt jetzt vier Varianten in großen, unregelmäßigen Flecken (vorher fiel jede Variante an dieselbe Stelle).
- Wegränder: stärker gewellt; daneben ein ausgetretener Saum (Gras gelblich und licht, Erde schaut durch).
- Streudetails, die der Bodenbäcker je Geländeart setzt: Grasbüschel, Steinchen, Kiesel auf Wegen, Zweige im Wald, kleine Blumen.
- Unter jedem Baum Wurzeln und ein weicher Schatten; vor jeder Gebäudetür ausgetretene Erde.
- Alles hängt nur von der Lage in der Welt ab: Chunk-Nähte bleiben unsichtbar, auch über die Regionsgrenze.

**Wald**
- Die Lichtung hat einen runden Rand mit Buchten und Vorsprüngen statt der fast eckigen Form.
- Dichte: tief im Wald dicht, am Waldrand lückig, in der Lichtung nur am Rand vereinzelte Bäume.
- Vor der Palisade ein Streifen ohne Bäume mit unregelmäßigem Rand, der über die Grenze in den Waldweg weiterläuft (vorher zwei gerade Kanten).
- Kein Baum darf ein Gebäude, ein Palisadenstück, das Tor, ein Kleinteil oder eine Figur zu mehr als 10 % verdecken – geprüft an den echten Bildgrößen der Bäume (bis zu zwölf Felder breit).
- Transparenz: gemessen an der tatsächlichen Bildfläche statt am Fußpunkt (Bäume mit versetztem Stamm wurden vorher zu früh oder zu spät durchscheinend). Gilt für Bäume und Gebäude.

**Gebäude**
- Neue Kleinteile im selben Stil: Fass, Kiste, Holzstapel, Bank, Heuballen, Laterne. 22 Stück neben den Häusern, nie vor einer Tür.
- Blumenkästen unter den Fenstern der Wohnhäuser.
- Interaktionen von Taverne, Schmiede und Heldenhalle liegen jetzt genau am Türpunkt der Bibliothek (Schmiede berichtigt).

## 3. Technische Prüfung nach den Änderungen

`test/welt-waldmark.test.mjs` – alles in Ordnung. Zusätzlich `test/welt-waldmark-browser.test.mjs` (Browser):

| Prüfung | Ergebnis |
|---|---|
| Zu jeder Tür laufen, Knopf erscheint (Taverne, Schmiede, Heldenhalle, Brunnen, Tor) | in Ordnung |
| Durch das Tor auf den Waldweg und zurück, ohne Neuladen | in Ordnung |
| Positionssprünge über 1532 Bilder | keine |
| Bilder mit fehlendem Boden | keine |
| Heldenhalle wird durchscheinend, wenn man dahinter steht; davor wieder voll | in Ordnung (0,41 / 0,99) |
| Baumkrone wird durchscheinend | in Ordnung |
| Nach dem Neuladen an derselben Stelle | in Ordnung |

Bestand: `welt-daten`, `welt-bau`, `welt-raster`, `waldweg`, `stufe`, `koop`, `server-kampf` bestanden.

## 4. Koop – geprüft, nicht umgebaut

Die Welt-Szene ist noch nicht an das Koop-Dorf angeschlossen. Für den späteren Anschluss an das bestehende Relay (`server/src/index.ts`, Funktion `dorf`) gilt:

- Ortsnamen müssen `^[a-z]{2,20}$` erfüllen – `waldmark` und `waldweg` tun das.
- Positionen werden nur bis ±20 000 angenommen und auf ganze Zahlen gerundet. Absolute Weltbildpunkte (bis 311 808) würden verworfen. **Positionen müssen relativ zur Region in Bildpunkten** gesendet werden (bis 4 608); das passt.
- Ein Ortswechsel des Anführers setzt die gemeinsamen Merker zurück. Waldmark und Waldweg sollten im Koop deshalb **als ein Ort** gemeldet werden (etwa „waldmark“), sonst verliert die Gruppe beim Gang durchs Tor ihren Fortschritt.
- Die bestehenden Koop-Prüfungen laufen unverändert durch.

## 5. Lizenzen

Siehe `QUELLEN.md` in diesem Ordner. Kurz: Keine der verwendeten Dach-, Holz-, Gras- und Bodentexturen ist belegt freigegeben.
