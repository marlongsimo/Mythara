# World Pipeline – Phase 3: Asset-Standard und Katalog

Stand: 20.11.2026.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/welt/bibliothek/bestand.json` | Einordnung von 49 vorhandenen Bildern: Art, Ansicht, in der Welt nutzbar ja / bedingt / nein |
| `realtime/werkzeug/welt/katalog.py` | Misst und prüft alle Bilder der Bibliotheken gegen diesen Standard, schreibt die Übersichtsseite |
| `realtime/welt/katalog.html` | Übersichtsseite mit Vorschaubildern, Maßen, Anker, Kollision, Hinweisen (erzeugt) |

Aufruf im Ordner `realtime`: `python3 werkzeug/welt/katalog.py` (braucht Pillow und numpy, wie die übrigen Werkzeuge).

## Befund des Katalogs

- **In der Welt nutzbar (14):** Wiese, Blumenwiese, Erde, Pflaster, zwei Wasserflächen, Uferstreifen, sechs Waldbäume, Kornsack.
- **Mit Nacharbeit nutzbar (11):** vier gemalte Randkacheln, zwei Zaunvorlagen (noch nicht freigestellt), Zaun (nur zwei Richtungen), Brunnen (Iso), Fackel, Rune, weichgezeichnete Wiese.
- **Nicht nutzbar (24):** alle Gebäude (Iso mit eigenem Pflastersockel), Baum und Tanne mit Steinsockel, alle Gesamtbilder der Orte, Oberflächen.
- **Hinweise der Prüfung:**
  - Beide Wassertexturen sind am Rand nicht nahtlos (Sprung 3- bis 6-fach gegenüber dem Inneren). Beim Backen muss Wasser überblendet oder die Textur nachbearbeitet werden.
  - Sieben Geländearten haben noch keine Textur: Moorwasser, Schlamm, Torf, Sand, Waldboden, Acker, Fels.
  - Die Herkunft aller sechs Waldbäume ist laut `img/welt/QUELLEN.md` nicht abschließend geklärt.
- Die Kollisionsradien der schlanken Bäume 5 und 6 wurden nach Messung auf 0,3 Rechenfelder verkleinert. Bei den breiten Bäumen 1 bis 4 hängt die Krone bis zum Boden; ihr Stamm lässt sich nicht aus dem Bild messen, die Radien (0,45 und 0,7) bleiben geschätzt.

## Der Standard

### Maße und Ansicht

- 1 Rechenfeld = 48 px. Der Held ist 84 px hoch (1,75 Rechenfelder). Alle Größen beziehen sich darauf.
- **Boden:** senkrechte Draufsicht, ohne Perspektive, ohne Schatten von Objekten.
- **Objekte:** Ansicht von schräg oben wie die Bäume am Waldweg – man sieht Vorderseite und etwas Dach oder Krone. Kein Iso, kein eigener Sockel, kein eingemalter Boden.
- **Licht:** von oben links, weich. Schatten nur als kleiner, weicher Fleck direkt unter dem Objekt.
- **Farben:** gedeckt, gemalt, wie die bestehenden Orte; keine reinen Schwarz- oder Weißflächen, keine Umrisslinien.

### Bodentexturen

| Regel | Art |
|---|---|
| Quadratisch, mindestens 1024 × 1024 (Bestand: 1254 × 1254) | Muss |
| Nahtlos kachelbar in beide Richtungen | Soll (Prüfwert „Naht“ höchstens 2,5) |
| Keine auffälligen Einzelmerkmale, die das Wiederholen verraten | Soll |
| WebP, Qualität 85–90, bis 900 KB | Soll |
| Eintrag in `gelaende.json` mit Zeichen, Rang, Randregel, Farbe, Herkunft | Muss |

Bei 1254 px Kantenlänge deckt eine Textur rund 26 Rechenfelder; mit Varianten (`varianten`) und Rauschmasken fällt die Wiederholung nicht auf.

### Objekte

| Regel | Art |
|---|---|
| WebP mit durchsichtigem Hintergrund; alle vier Bildecken durchsichtig | Muss |
| `groesse` in der Bibliothek stimmt mit dem Bild überein | Muss |
| Ankerpunkt = Fußpunkt (wo das Objekt den Boden berührt), 0 bis 1 | Muss |
| Kollision angegeben – `null`, wenn das Objekt nichts versperrt | Muss |
| Herkunft und Lizenz eingetragen | Muss |
| Knapp beschnitten, aber nicht angeschnitten | Soll |
| Bis 350 KB | Soll |
| Gezeigte Höhe passt zur Kategorie (Tabelle unten) | Soll |

Gezeigte Höhe = Bildhöhe × `massstab`. Üblicher Bereich in Heldenhöhen:

| Kategorie | von | bis | Beispiele |
|---|---|---|---|
| `kleinteil` | 0,15 | 3 | Fass, Kiste, Laterne, Wegweiser |
| `fels` | 0,2 | 4 | Stein, Felsblock |
| `bauteil` | 0,3 | 5 | Zaun, Tor, Steg, Mauerstück |
| `bewuchs` | 0,4 | 8 | Busch, Schilf, Baum |
| `wasserbau` | 0,3 | 8 | Brücke, Wehr, Kahn |
| `gebaeude` | 1,5 | 10 | Hütte, Haus, Mühle |
| `sonderort` | 1 | 40 | Schrein, Steinkreis, Ruine |

Bilder so groß anlegen, dass `massstab` zwischen 0,5 und 1 liegt (scharf, aber nicht verschwenderisch).

### Benennung

- Kennung: `bereich_name_variante`, nur Kleinbuchstaben, Ziffern, Unterstrich – etwa `wald_eiche_gross_01`, `moor_huette_reet_02`, `dorf_fass_01`.
- Bereich: `wald`, `wiese`, `dorf`, `moor`, `berg`, `ufer`, `allgemein`.
- Datei: `img/welt/<kategorie>/<kennung>.webp`. Die sechs Waldbäume bleiben an ihrem Platz in `img/welt/`, weil der Waldweg sie von dort lädt.
- Zustände eines Objekts als eigene Dateien mit Endung: `…_offen.webp`, `…_zu.webp`.

### Gebäude – räumliche Bauweise (Standard seit 21.11.2026)

**Alle Gebäude der offenen Welt werden räumlich gebaut**, mit dem Gebäude-Baukasten `realtime/werkzeug/welt/gebaeude.py` aus Bauplänen in `realtime/welt/bibliothek/bauplaene.json`. Begründung und Vergleich: `08-gebaeude-prototyp.md`; Umsetzung: `09-raeumliche-gebaeude.md`.

- **Ansicht:** schräge Parallelprojektion, `Bildpunkt = ((x + 0,32·d)·48, −(d + z)·48)` relativ zum Fuß. Sichtbar sind Süd- und Ostseiten und die Dächer. Licht von links, aus Süden, von oben.
- **Fuß:** Mitte der Südwand des ersten Baukörpers.
- **Nie spiegeln:** Ein gespiegeltes Gebäude zeigte die Westwand; die Formprüfung weist das zurück.
- **Maße:** Wandhöhe 2,0–3,1 Felder, Türen mindestens 1,85 Felder hoch (Held 1,75).
- **Ebenen:** Schatten, je Baukörper Innenraum, Ostwand, Südwand, Dach, ggf. Vordach, je Tür „zu“ und „offen“. Jede Ebene ist auf ihren Inhalt zugeschnitten.
- **Kollision:** Art `gebaeude`; begehbare Baukörper sperren nur ihre Wände, Türen bleiben offen.
- **Kleinteile** (Fass, Kiste, Holzstapel, Bank, Heuballen, Laterne, Marktstand, Brunnen, Tor, Palisade) bleiben frontal (`werkzeug/welt/haus.py`).

Die Beschreibung unten gilt weiter für frontale Kleinteile und ältere Gebäudebilder.

Ein (frontales) Gebäude ist ein Objekt der Kategorie `gebaeude` mit:

- einem Außenbild als Grundzustand, weiteren Bildern unter `zustaende` (`offen`, `zu`, `nacht`),
- einer Kollision als Rechteck oder Vieleck der Grundfläche,
- einer `interaktion` (`tuer` oder `eingang`) mit dem Punkt vor der Tür,
- und – in der Region – einem Ausgang oder einer Interaktion, die sagt, wohin die Tür führt (Innenraum als eigener Ort, Laden, Gespräch).

So kommt ein neues Gebäude allein durch einen Bibliothekseintrag und ein Bild ins Spiel.

### Externe Bilder

Nur mit geklärter Lizenz. Herkunft, Urheber und Lizenz stehen im Feld `herkunft` und in `img/welt/QUELLEN.md`. Die Prüfung meldet jeden Eintrag, dessen Herkunft „offen“, „vermutlich“ oder „zu klären“ enthält.

## Ablauf für ein neues Bild

1. Bild nach Standard erzeugen, mit `werkzeug/bau.py` freistellen, nach `img/welt/<kategorie>/` legen.
2. Eintrag in `objekte.json` (oder `gelaende.json`) ergänzen.
3. `python3 werkzeug/welt/katalog.py` – zeigt gemessenen Fußpunkt, Größe im Vergleich zum Helden und alle Verstöße.
4. `node werkzeug/welt/form.mjs` – prüft die Bibliothek als Ganzes.

## Geprüft

- `katalog.py`: keine Verstöße gegen Muss-Regeln; Hinweise siehe oben.
- `form.mjs`, `test/welt-daten.test.mjs` (21 von 21), Typprüfung: in Ordnung.
- Am Spiel wurde nichts geändert; diese Phase fügt nur Daten, ein Werkzeug und Dokumentation hinzu.
