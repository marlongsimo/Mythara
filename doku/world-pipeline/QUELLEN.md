# Quellenübersicht der Weltgrafik

Stand: 20.11.2026. Gilt für alles, was die offene Welt (Waldmark, Waldweg, Bibliotheken in `realtime/welt/bibliothek/`) verwendet.

**Grundsatz:** Was nicht eindeutig belegt ist, gilt als **nicht kommerziell freigegeben**. Im Moment ist **keine** der verwendeten Dach-, Holz-, Gras- und Bodentexturen belegt freigegeben. Bevor die Welt veröffentlicht oder verkauft wird, müssen die offenen Punkte unten geklärt oder die betroffenen Bilder ersetzt werden.

Ermittelt aus: Git-Historie (alle drei Zweige), eingebetteten Metadaten (EXIF, XMP, IPTC, C2PA, EPS-Kopfzeilen), dem Lizenzblatt im Vecteezy-Archiv und einer Websuche nach den Archiv- und Dateinamen.

## Übersicht

| Datei(en) | Verwendung in der Welt | Herkunft (Beleg) | Lizenz | kommerziell | Namensnennung |
|---|---|---|---|---|---|
| `realtime/werkzeug/boden/` wiese, wiese-blumen, erde, pflaster, wasser, wasser-ruhig, verlauf-wiese-wasser | Gras, Wege, Pflaster, Wasser, Ufer | **keine** – eingeführt ohne Quellenangabe (Commits a84a19e, a7e5ab1, 5f07c3f); die WebP-Dateien enthalten keine Metadaten | unbekannt | **ungeklärt** | unbekannt |
| `realtime/werkzeug/boden/` rand-erde-wiese, rand-erde-pflaster, rand-pflaster-wiese, rand-wiese-wasser | nicht verwendet | wie oben | unbekannt | **ungeklärt** | unbekannt |
| `realtime/werkzeug/boden/abgeleitet/` wiese-trocken, wiese-satt, waldboden | Grasvarianten, Waldboden | von `werkzeug/welt/texturen.py` aus wiese und erde abgeleitet | folgt den Ausgangsbildern | **ungeklärt** | wie Ausgangsbilder |
| `realtime/werkzeug/vorlage-wiese.png`, `vorlage-pflaster.png` | nicht in der Welt (alte Stadt) | **KI-erzeugt, belegt**: signiertes C2PA-Manifest „ChatGPT / gpt-image“, OpenAI, 20.11.2026 | OpenAI-Nutzungsbedingungen | vermutlich ja (nicht juristisch geprüft) | nein |
| `img/welt/baum1–4.webp` | Waldbäume | laut `img/welt/QUELLEN.md` aus „trees_0.blend“, **vermutlich** *Yo Frankie!* (Blender Foundation); Ausgangsdatei nicht im Repository | **vermutlich** CC-BY 3.0, nicht bestätigt | **ungeklärt** | bei CC-BY: Blender Foundation |
| `img/welt/baum5–6.webp` | Waldbäume | „trees.blend“, Quelle laut `img/welt/QUELLEN.md` offen | unbekannt | **ungeklärt** | unbekannt |
| Dachziegel (Archiv „flat-design-roof-tile-pattern.zip“, Datei 6641577.jpg) | alle Dächer der erzeugten Gebäude | EPS-Kopf: Titel „roof tile pattern 3“, `%%For: Julian`, Illustrator, 16.01.2022. Plattform **vermutlich** Freepik (Archivbenennung, numerische ID); Asset-Seite nicht gefunden | unbekannt | **ungeklärt** | bei Freepik-Gratislizenz Pflicht |
| Holzmaserung (Archiv „wooden-background.zip“, Datei 33421.jpg) | Balken, Rahmen, Palisade | IPTC-Titel „wooden background“, EPS `%%Title: m_wood_-12.eps`, `%%For: Interact_30`, 2012. Plattform **vermutlich** Freepik; nicht gefunden | unbekannt | **ungeklärt** | wie oben |
| Holzbretter (Archiv „wooden-texture-background.zip“, Datei O5GLN30.jpg) | Wände, Türen, Fässer, Kisten | EPS-Kopf **`%%For: freepik`**, 2016 – deutliches Indiz für Freepik | Freepik-Lizenz, Stufe (Gratis/Premium) unbekannt | **ungeklärt** | bei Gratis-Download Pflicht |
| Holzknöpfe (Vecteezy 13396547) | **nicht verwendet** | Vecteezy, Lizenzblatt im Archiv | Vecteezy Free/Pro | Free: eingeschränkt | Free: ja („Vecteezy.com“) |
| `img/welt/gebaeude/*.webp` (21 Bilder) | alle Gebäude und Kleinteile | erzeugt von `werkzeug/welt/haus.py` aus den drei Holz-/Dachvorlagen | folgt den Vorlagen | **ungeklärt** | wie Vorlagen |

Die Originalvorlagen der Häuser liegen nicht im Repository (`realtime/werkzeug/welt/texturen/`, per `.gitignore` ausgeschlossen).

## Frei verwendbar (Stand 21.11.2026)

| Datei(en) | Verwendung | Herkunft | Lizenz | kommerziell | Namensnennung |
|---|---|---|---|---|---|
| Steintexturen `stein` (Bruchstein), `quader`, `schiefer`, `holz` in `werkzeug/welt/gebaeude.py` | Mauerwerk aller räumlichen Gebäude (Mühle, Sockel, Kamine, Öfen), Burgturm | **selbst gerechnet**, ohne Bildvorlage; ersetzt die frühere Steintextur, die aus dem ungeklärten `pflaster.webp` abgeleitet war | eigene Arbeit | **ja** | nein |
| `werkzeug/welt/texturen_frei/ziegel.jpg` (Wandart `ziegel`) | noch an keinem Gebäude | `brick_wall_07_1k.blend.zip` – Name und Aufbau entsprechen **Poly Haven** (alle Inhalte CC0); im Archiv lag keine Lizenzdatei, **Quelle vom Auftraggeber zu bestätigen** | vermutlich CC0 | vermutlich ja | nein |
| `werkzeug/welt/kenney/castle/` (OBJ, Farbtafel, `License.txt`) | Form des Burgturms `burg_turm_01` | Kenney Castle Kit (kenney.nl), Lizenzdatei im Archiv | **CC0** | **ja** | nein (erwünscht: „Kenney“) |
| weitere Kenney-Baukästen (Fantasy Town Kit 2.0, Modular Cave Kit, Mini Forest, Retro Fantasy Kit) | noch nicht verwendet | Kenney, Lizenzdateien in den Archiven | **CC0** | **ja** | nein |
| umgestürzte Bäume, Steinring, Kürbisse (`haus.py`) | Kreuzwald, Weidenhain | selbst gezeichnet, ohne Bildvorlage | eigene Arbeit | **ja** | nein |

## Was die Plattformen verlangen (soweit ermittelt)

- **Freepik** (heute unter dem Namen Magnific): Gratisnutzung nur mit Namensnennung; Premium-Abonnenten ohne. Verboten ist unter anderem der Weiterverkauf von Produkten, in denen der Inhalt das Hauptelement ist – ausdrücklich auch Spiele. Laut Freepik-FAQ dürfen Ressourcen in Spielen nur Nebenelemente sein. Holz und Ziegel als Teil zusammengesetzter Gebäude sind damit wahrscheinlich zulässig, **sobald die Lizenzstufe geklärt ist**. Die Bedingungen bitte im Original prüfen; sie konnten nur über Zusammenfassungen gelesen werden (die Seite verweigerte den automatischen Abruf).
- **Vecteezy:** Gratislizenz mit Namensnennung und ohne Verwendung auf Produkten zum Weiterverkauf; keine Weitergabe als eigenständige Datei oder „in a tool or template, as source files“.

## Was zu klären ist

1. **Bodentexturen (`werkzeug/boden/`):** Wer hat sie erzeugt und womit? Falls mit ChatGPT oder einem anderen Bildgenerator: die Originaldateien mit Metadaten und die Prompts sichern. Bis dahin gelten sie als nicht freigegeben.
2. **Dach- und Holzvorlagen:** Im Download-Verlauf des Freepik-Kontos (bzw. der Plattform, von der sie stammen) die Asset-Seiten, Urheber und die Lizenzstufe feststellen und das Lizenz-PDF sichern. Bei Gratis-Download: Namensnennung im Spiel einbauen oder Premium-Lizenz nutzen.
3. **Bäume 1–4:** „trees_0.blend“ mit Download-Adresse beschaffen und Lizenz (CC-BY 3.0?) belegen; dann Namensnennung „Blender Foundation“.
4. **Bäume 5–6:** Quelle ermitteln – sonst ersetzen.
5. **`vorlage-*.png`:** als ChatGPT-Bilder in `img/welt/QUELLEN.md` eintragen; prüfen, ob das verwendete Konto kommerzielle Nutzung abdeckt.

## Wo die Herkunft im Projekt steht

- Je Geländeart: Feld `herkunft` in `realtime/welt/bibliothek/gelaende.json` (jetzt mit „UNGEKLÄRT“ gekennzeichnet).
- Je Objekt: Feld `herkunft` in `realtime/welt/bibliothek/objekte.json`.
- Der Katalog (`python3 realtime/werkzeug/welt/katalog.py`) meldet jedes Bild mit ungeklärter Herkunft.
