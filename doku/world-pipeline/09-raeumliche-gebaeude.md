# Räumliche Gebäude als Standard – Baukasten und neue Waldmark

Stand: 21.11.2026. Nach Freigabe des Prototyps (`08-gebaeude-prototyp.md`). Keine Änderungen an Server, Datenbank, Koop oder Kampagnen.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/werkzeug/welt/gebaeude.py` | **Gebäude-Baukasten**: baut räumliche Gebäude aus Bauplänen |
| `realtime/welt/bibliothek/bauplaene.json` | 14 Baupläne |
| `img/welt/gebaeude/raeumlich/<kennung>/` | Ebenen und Gesamtbild je Gebäude |
| `realtime/shared/welt/typen.ts`, `form.ts`, `bau.ts` | Gebäude aus Ebenen im Datenmodell, Formprüfung, Kollision mit Wänden und Türlücken |
| `realtime/client/src/welt/welt.ts` | Ebenen zeichnen, Dach je Baukörper ausblenden, Türen öffnen, Silhouette |

## Die Bausteine eines Bauplans

Ein neues Gebäude ist ein Eintrag in `bauplaene.json` und ein Aufruf `python3 werkzeug/welt/gebaeude.py <kennung>` – rund 20 Sekunden je Gebäude.

| Baustein | Möglichkeiten |
|---|---|
| **Baukörper** | beliebig viele Quader (Haupthaus, Anbau, Erker, Turm), je mit Breite, Tiefe, Wandhöhe, Lage; begehbar oder nicht |
| **Wand** | `bretter`, `blockbohlen`, `stein`, `putz`; Steinsockel, Eckbalken, Rähm |
| **Dach** | `sattel` (First quer oder nach Norden mit Südgiebel), `walm`, `pult`, `zelt`, `flach`; Deckung `ziegel` (frei einfärbbar), `schindel`, `stroh`; Höhe und Überstand |
| **Türen** | `einfach`, `doppel`, `tor`; Breite, Höhe; jede mit den Zuständen zu und offen |
| **Fenster** | Süd- oder Ostwand; `kreuz`, `rund`, `schmal`, `glut` (Esse, Ofen); Läden, Blumenkasten |
| **Zubehör** | `kamin`, `vordach`, `schild`, `laterne`, `banner`, `esse` (offene Werkstatt mit Glut und Amboss), `glocke`, `kraeuter` |
| **Innenraum** | Boden `bretter` oder `stein`; Möbel `tisch`, `bett`, `theke`, `fass`, `amboss`, `regal`, `ofen`, `altar`, `bank`, `kessel` |

Der Baukasten rechnet daraus selbst: Ebenen mit Tiefe, Gesamtbild, Fußpunkt, sichtbaren Bereich, Kollision, Innenräume, Türpunkte und den Eintrag in `objekte.json`.

## Die Waldmark

Aufbau und Fußpunkte der Gebäude sind geblieben. Umgestellt auf räumliche Gebäude:

| Gebäude | Bauweise |
|---|---|
| Heldenhalle | Blockbohlen, Südgiebel, blaues Ziegeldach, Doppeltor, Banner, Rundfenster |
| Taverne | Haupthaus mit Küchenanbau (Pultdach), Vordach, Schild, Laterne, drei Kamine; innen Theke, Tische, Fässer |
| Schmiede | offene Werkstatt mit Esse und Amboss, großer Kamin, Glut im Seitenfenster |
| Holzhaus, Langhaus (Walmdach, Vordach), Blockhaus (Schindeln, Südgiebel), Holzhütte, Strohhütte (Kräuterbündel), Scheune (Tor), Schuppen (Pultdach) | je eigener Bauplan – kein Haus kommt doppelt vor außer dem Holzhaus |

Neu und etwas ausgefallener:

| Gebäude | Bauweise |
|---|---|
| **Kapelle** | Steinbau mit Südgiebel und Rundfenster, Glockenturm mit Zeltdach; innen Altar und Bänke |
| **Kräuterhaus** | Blockbohlen, Strohdach, Erker mit Zeltdach, Kräuterbündel unter der Traufe; innen Kessel |
| **Bäckerei** | Haus mit gemauertem Ofenanbau und eigenem Kamin, Vordach, Schild, glühendes Fenster |
| **Zwei Wachtürme** | am Südtor, Blockbohlen, Zeltdach, Ausguck, Banner, Laterne |

## Verhalten im Spiel

- Betritt der Held einen Raum, verschwindet nur das Dach dieses Baukörpers; die Südwand wird fast durchsichtig. Ein nicht begehbarer Anbau bleibt geschlossen.
- Nahe einer Tür steht sie offen.
- Verdeckt ein Gebäude den Helden, zeigt eine goldene Silhouette, wo er steht. Ob er verdeckt ist, entscheidet eine Deckungsmaske des Bildes (je 4 × 4 Bildpunkte), nicht das Bildrechteck.
- Bäume bleiben durchscheinend wie bisher.

## Gefundene und behobene Fehler

- **Wände doppelt so dick im Raster:** Eine dünne Wand quer über zwei Rasterzeilen sperrte beide; die Türlücke war dann oft zu schmal. Jetzt belegt jede Wand genau die Zeile ihrer Mittellinie, und die Tür öffnet jede Zelle, die sie zu mehr als 0,3 Feldern überdeckt.
- **Held blieb an Kanten hängen:** Kommt er einem Wegpunkt 0,6 Sekunden lang nicht näher, gilt der Punkt als erreicht.
- **Bildrate halbiert:** 88 Ebenen in voller Gebäudegröße wurden übereinander gezeichnet (8,5 statt 19 Bilder je Sekunde in der Prüfumgebung). Jetzt ist jede Ebene auf ihren Inhalt zugeschnitten, und Innenräume werden nur gezeichnet, wenn ihr Dach offen ist.
- **Wachturm verdeckte die Kräuterfrau** (zu hoch, zu nah): Turm verschoben.
- Pultdach mit doppelter Ecke; eine genau in Blickrichtung liegende Dachfläche (45° Neigung) – beides berichtigt.

## Geprüft

- `welt-waldmark.test` (ohne Browser): alles in Ordnung, neu: jeder Innenraum durch seine Tür erreichbar, keine Überschneidung, nichts gespiegelt.
- `welt-waldmark-browser.test`: Türen aller Interaktionen erreicht, Taverne betreten (Dach 0,01, Südwand 0,29), Tür offen und Dach zurück, Silhouette hinter der Heldenhalle, Übergang zum Waldweg ohne Neuladen, keine Positionssprünge, kein fehlender Boden.
- `welt-daten`, `welt-bau`, `welt-raster`, `waldweg`, `stufe`, `koop`, `server-kampf`: bestanden. Katalog: keine Verstöße gegen Muss-Regeln.

## Offen

- Texturen der Häuser: Lizenz ungeklärt (`QUELLEN.md`).
- Der handgemalte Eindruck hängt an den Texturen; der Baukasten nimmt neue, gemalte Texturen ohne Änderung auf.
- Gebäudefunktionen (Laden, Heldenwahl, Gespräche) hängen weiter an der alten Waldmark.
