# Mythara Fabrik

Baut aus Referenzbildern modulare, bewegte Spielfiguren und gibt sie als Bildblätter in acht echten Blickrichtungen aus.
Die Fabrik steht neben dem Spiel und fasst es nicht an: kein Server, keine Datenbank, keine Spiellogik.

Der Plan dahinter steht in `doku/konzepte/ki-3d-asset-pipeline.md`. Der jetzige Krieger ist ein **technischer Platzhalter**: Er prüft Aufbau, Skelett, Ebenen und Formate. Das Aussehen ist zurückgestellt.

## Ablauf

| Schritt | Werkzeug | Ergebnis |
|---|---|---|
| 1 Referenzblatt zerlegen | `referenz.py <asset>` | `referenz/teile/*.png`, `analyse.json`, Kontaktbogen |
| 2 Körper erzeugen | `triposr.py <bild> <ziel.glb> <ablage>` (lokal, ohne Dienst) oder `huelle.py <asset>` (nur aus den Ansichten) | Netz des Körpers |
| 3 Körper anmalen und ausrichten | `anmalen.py <modell> <asset> <ziel.glb> [drehung]` | 1,80 m, Füße am Boden, Blick nach −y, Farben aus den Ansichten |
| 4 flache Ausrüstung bauen | `flachteil.py <vorn.png> <ziel.glb> <länge> <dicke> [hinten.png]` | Schwert, Schild als eigene Teile |
| 5 Figur bauen | `rig.py <koerper.glb> <figur.blend> <ausruestung.json>` | Skelett, Gewichte, Waffen an Knochen, Rüstung als Hüllen, sieben Bewegungen |
| 5b Fußpunkt festhalten | `boden.py <figur.blend> <ziel.blend> laufen` | tiefster Punkt in jedem Bild genau auf dem Boden |
| 6 rendern | `rendern.py <figur.blend> <export> <id>` | je Ebene und Bewegung ein Blatt, Metadaten; Feldgröße und Fußpunkt werden so gewählt, dass nichts abgeschnitten wird. Vorhandene Blätter werden weiterverwendet, solange sie ins Feld passen; sonst wird alles neu gerendert |
| 7 packen | `packen.py <export> <id>` | je Ebene ein Atlas für Phaser |
| 8 prüfen | `pruefung.py <figur.blend> <export> <id>` | `bericht.json` mit Status |
| 9 ansehen | `vorschau/`, `vorschau-gif.py <export> <id> <ziel.gif>` | Testszene in Phaser 3.90, bewegte Vorschau |

Schritte mit Blender laufen mit einem Python, in dem `bpy` installiert ist (`pip install bpy pillow scipy`; Blender 5.x, gerendert wird mit Cycles auf dem Prozessor).
Zur schnellen Kontrolle eines einzelnen Modells: `rundum.py <modell.glb> <bild.png>`.

## Aufbau einer Figur

- **Ein Skelett** für alle Humanoiden: becken, bauch, brust, hals, kopf; je Seite oberarm, unterarm, hand, oberschenkel, unterschenkel, fuss (`.L` = linke Körperseite = +x, `.R` = rechte = −x). Die Figur blickt nach −y.
- **Starre Ausrüstung** (Waffe, Schild) hängt an einem Knochen: Schwert an `hand.R`, Schild an `unterarm.L`. Weitere Befestigungspunkte sind angelegt: `punkt.kopf`, `punkt.ruecken`, `punkt.huefte`.
- **Rüstung** (Brust, Beine, Hände, Füße) liegt als Hülle über dem Körper und trägt dessen Gewichte – sie läuft deshalb ohne eigenes Rig auf demselben Skelett. Die Hüllen des Platzhalters sind aus dem Körper abgeleitet; fertige Rüstungsmodelle nehmen später dieselben Plätze ein und übernehmen die Gewichte auf dieselbe Weise.
- Was es gibt und wohin es gehört, steht in `assets/<figur>/ausruestung.json`.

## Bewegungen

`ruhe` (6 Bilder, Schleife), `laufen` (8, Schleife), `angriff` (8, einhändig), `block` (6, bleibt im letzten Bild stehen), `angriff2h` (8, beidhändig – der Schild wird dabei nicht gezeigt), `treffer` (5), `ausweichen` (6).
Alle bleiben an Ort und Stelle; die Bewegung über den Boden macht das Spiel. Sie sind gerechnet (Gelenkwinkel und Zielrichtungen in `rig.py`), nicht aufgenommen, und damit frei von Lizenzfragen.
Die Waffenführung ist als Richtung vorgegeben: das Handgelenk führt die Klinge, der Unterarm die Schildfläche. Beim beidhändigen Angriff rechnet Blender die linke Hand an den Griff.

Weitere Bewegungen, die eine Figur über `bewegungen` in ihrer Liste bekommt: `angriff_axt` (8, schwer, weit ausgeholt), `angriff_dolch` (7, schneller Stich), `tod` (8, fällt nach hinten und bleibt im letzten Bild liegen).
Jede Waffe nennt ihre Angriffsbewegung (`"angriff": "angriff_axt"`); die Testszene spielt auf J den Angriff der getragenen Waffe. Ohne Schild wird mit `"block": "waffe"` mit der Waffe pariert.
`boden.py` hält in allen Bewegungen den tiefsten Punkt des Körpers auf dem Boden; die Prüfung verlangt das hart (±1 cm) für jede Bewegung.

## Ausgabe

`assets/<figur>/<version>/export/`

- `<ebene>.<bewegung>.webp` – Blatt: **Zeilen = Richtungen** (O, SO, S, SW, W, NW, N, NO), **Spalten = Bilder**, Feld je nach Figur (Krieger: 288 px, steht in den Metadaten). Zeile zu einem Winkel: `round(winkel / (π/4)) mod 8` (0 = Osten, π/2 = Süden, y nach unten).
- `atlas/<ebene>.webp` und `.json` – dieselben Bilder dicht gepackt (Phaser „JSON Hash“ mit Beschnitt); Bildname `<bewegung>/<richtung>/<bild>`.
- `<id>.json` – Feld, Fußpunkt, Maße (wie `laufMass` im Spiel), Bewegungen, Ebenen, Plätze, Tiefe der Waffen je Bild.
- `bericht.json` – Prüfbericht.

### Ebenen zusammensetzen

Von unten nach oben:

1. `<waffe>.hinten` aller Waffen, die fernste zuerst
2. `koerper`
3. Rüstungsebenen in beliebiger Reihenfolge – jede ist schon so ausgeschnitten, dass sie nichts verdeckt, was vor ihr liegt
4. `<waffe>.vorn` aller Waffen, die fernste zuerst

Für eine neue Kombination wird nichts neu gerendert. Welche Waffe ferner ist, steht je Bewegung, Richtung und Bild unter `tiefe` in den Metadaten.

## Testszene

    cd fabrik/vorschau && npm install && npm run build
    node ../../tools/testserver.js          # im Hauptordner; dann http://localhost:8765/fabrik/vorschau/
    node test.mjs                           # Prüfung im Browser

Laufen mit WASD, Pfeilen oder Antippen · J Angriff der getragenen Waffe · K Block (halten) · L Zweihand · H Treffer · Leertaste Ausweichen · T Tod (noch einmal: aufstehen) · Ausrüstung über die Tafel rechts. Knöpfe für Bewegungen, die eine Figur nicht hat, werden ausgeblendet.

## Versionen

Jeder Stand einer Figur liegt in einem eigenen Ordner (`v001`, `v002`, …). Ein abgeschlossener Ordner wird nicht mehr verändert; Neues kommt in den nächsten.

| Version | Inhalt |
|---|---|
| `held.krieger/v001` | Körper nur aus den drei Ansichten (Hülle) |
| `held.krieger/v002` | Körper aus TripoSR, angemalt; Ruhe und Laufen als ein Blatt je Bewegung |
| `held.krieger/v003` | modulare Figur: Waffen, Rüstungsebenen, sieben Bewegungen, Atlasse, Prüfbericht |
| `held.krieger/v004` | wie v003; Renderbereich passt sich der größten Ausdehnung an (Feld 288 px, nichts abgeschnitten), Fußpunkt beim Laufen auf dem Boden (`boden.py`) – **aktuelle Version** |
| `gegner.bandit/v001` | zweite Figur aus derselben Pipeline: eigenes Referenzblatt, gleiches Skelett; Kapuze, Halstuch, Lederrüstung, Gürtel, Hose, Stiefel als Ebenen; Kurzschwert (Standard) und Axt; Ruhe und Laufen. Bogen und Dolch gebaut, aber noch nicht angehängt |
| `gegner.bandit/v002` | kampffähiger Gegner: Kurzschwert-, Axt- und Dolchangriff (je Waffe eigene Bewegung), Parade mit der Waffe, Treffer, Ausweichen, Tod (bleibt liegen); eigene Liste `v002/ausruestung.json` |
| `gegner.bandit/varianten/dolch`, `…/schwert` | feste Varianten aus v002 (Kleidung + eine Waffe, Angriff der Waffe), ohne neu zu rendern: `variante.py <export> <id> <name> <waffe> <ziel>` |
| `npc.standard.m/v001` | Dorfbewohner: Ruhe und Laufen (Haltung zivil), Weste, Hose, Stiefel, Gürtel; Schürze, Halstuch (wahlfreie Lagen), Strohhut (Drehkörper) |
| `npc.standard.m/varianten` | 10 Rollen aus `rollen.json` (Westenfarbe + Zusatzteile), Ebenen nur einmal gespeichert: `npc_varianten.py` |
| `held.priesterin/v001` | Elara: Stab rechts (Licht-, Heil-, Zeremonienstab), Streitkolben links; Ruhe, Laufen, Heilung, Schutzsegen, Lichtnova, Streitkolbenangriff links, Treffer, Tod; Robe, Schulterumhang, Gürtel, Armschienen, Stiefel, Kapuze (wahlfrei) |

## Eine neue Figur

Am Beispiel des Banditen (`assets/gegner.bandit/`):

1. Referenzblatt nach `referenz/original.png`, Kästen in `referenz/schnitt.json`, dann `referenz.py`.
2. Körper: `triposr.py` mit der Vorderansicht, `anmalen.py` mit vorn, Seite (blickt nach rechts) und hinten.
3. Waffen: `flachteil.py`; schräg gezeichnete Waffen mit `drehen=<grad>` aufrichten (Griff oben).
4. `ausruestung.json`: welche Teile an welchen Platz, welche Bewegungen (`bewegungen`), ob Hüllen sich ausschließen (`exklusiv`), welche Teile nur vorbereitet sind (`vorbereitet`). Das erste Teil je Platz ist die Standardausrüstung.
5. `rig.py`, `boden.py … ruhe,laufen`, `rendern.py`, `packen.py`, `pruefung.py`, `vorschau-gif.py`.
6. Testszene: `?figur=<id>&version=<v>`, Prüfung im Browser mit `node vorschau/test-figur.mjs <id> <version>`.

## Im Spiel

Torvald (`schildwaechter`) ist seit dem 21.11.2026 die modulare Figur `held.krieger` – live auf mythara-dungeon.de.

- Spielfassung: `assets/held.krieger/spiel/` = Krieger v004 plus der Gang mit erhobenem Schild (`schildlauf.py`), gerendert mit den getragenen Teilen und den fünf Bewegungen, die das Spiel nutzt (ruhe, laufen, angriff, block, schild_laufen).
- Ausgabe fürs Spiel: `spiel_export.py <export> held.krieger <spiel>/img/figuren-fabrik/held.krieger <ebenen> <waffen>`.
- Im Spiel: `realtime/client/src/modulfigur.ts` (auf `feature/realtime-engine`). Welche Helden modular sind, steht dort in `MODUL`. Das Modul übersetzt die bisherigen Aufrufe (Laufbilder, Standbild, Hieb, Schild) in die Bewegungen der Fabrik und wählt aus der Blickrichtung eine von acht Zeilen.
- Ein weiterer Held: Figur bauen und rendern, mit `spiel_export.py` ausgeben, in `MODUL` eintragen, Client bauen.


## Tiere (Vierbeiner): Riesenkröte

`rig_tier.py <koerper.glb> <figur-roh.blend> <tier.json>` baut ein Vierbeiner-Skelett (Füße = tiefste äußere Punkte je Viertel), gewichtet (Wärmeverteilung, sonst nach Abstand),
setzt einen Mundraum in den Kopf und eine Zunge an und legt die Bewegungen aus `tier.json` an (`ruhe`, `springen`, `zunge`, `tod`).
Danach wie bei Menschen: `boden.py` (Flugbilder eines Sprungs – `sprung` in den Metadaten – bleiben in der Luft), `rendern.py`, `packen.py`, `pruefung.py`, `vorschau-gif.py`.
Die Prüfung verlangt bei Tieren: Flugbilder ≥ 10 cm über dem Boden, alle anderen Bilder ±1 cm am Boden, am Ende des Todes höchstens 85 % der Anfangshöhe.
In der Testszene ist `springen` die Fortbewegung, wenn die Figur kein `laufen` hat, und J spielt den eigenen Angriff (die Bewegung mit Trefferbild, hier `zunge`).
