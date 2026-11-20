# Gebäude-Prototyp: frontal, räumlich oder isometrisch?

Stand: 20.11.2026. Ein einzelnes Wohnhaus, in einer isolierten Testszene neben einem bisherigen Gebäude. Keine bestehenden Gebäude ersetzt, keine Änderungen an Server, Datenbank oder Koop.

## 1. Kamera, Figuren und Weltkoordinaten (Bestand)

| | Befund | Fundstelle |
|---|---|---|
| Boden | echte Draufsicht ohne Stauchung: 1 Rechenfeld = 48 × 48 px, Norden = Bildschirm oben | `client/src/welt/welt.ts` (`F = FELD_PX`), Bodenbäcker |
| Raster | Kollision, Wege und Chunks achsparallel | `shared/welt/raster.ts` |
| Figuren | frontal gemalt, 84 px hoch (1,75 Felder), nur links/rechts gespiegelt, keine Diagonalansichten | `HELD_PX`, `shared/config.ts` |
| Tiefe | nach Fußpunkt: `depth = y · 48` | `welt.ts` |
| Laufen | gleiches Tempo in alle Richtungen (in der Welt keine Stauchung wie die 0,62 der alten Orte) | `welt.ts` |

**Folgerung:** Zu dieser Kamera passt eine **schräge Parallelprojektion**: Die Vorderwand bleibt unverzerrt, 1 Feld Tiefe geht auf dem Bildschirm 48 px nach oben, Höhen ebenfalls. Damit eine Seitenwand sichtbar wird, läuft die Tiefe zusätzlich leicht nach rechts (Scherung `kx = 0,32`, also 15 px je Feld Tiefe). Eine klassische 45°-Isometrie setzt dagegen einen gedrehten, 2:1 gestauchten Boden voraus – den hat die Welt nicht.

## 2. Was gebaut wurde

| Datei | Inhalt |
|---|---|
| `realtime/werkzeug/welt/haus3d.py` | Kleines 3D-Modell (Quader, Satteldach, Tür, Fenster, Kamin, Möbel) mit wählbarer Projektion; zerlegt das Haus in Ebenen |
| `realtime/client/src/welt/prototyp.ts`, `client/prototyp-seite.html` | Testszene: drei Häuser, Held, Kollision, Dachausblendung, Tür, Silhouette, Prüfansicht (Taste K) |
| `realtime/werkzeug/welt/prototyp.mjs` | Stellt die Seite zusammen |
| `realtime/welt/regionen/prototyp/` | Kleine Wiese als Untergrund (Entwurf, wird nicht ausgeliefert) |

**Das neue Haus:**
- Grundriss 5 × 4 Felder, Wandhöhe 2,45 Felder, Tür 1,95 Felder hoch (Held 1,75).
- Ebenen, jede ein eigenes Bild mit eigener Tiefe:

| Ebene | Inhalt | Tiefe |
|---|---|---|
| `innen` | Dielenboden, Innenseiten von Rück- und Westwand, Tisch, Bett | Rückwand |
| `seite` | Ostwand außen mit Fenster | Rückwand |
| `vorn` | Vorderwand | Vorderwand |
| `fenster` | Fenster der Vorderwand | Vorderwand + ε |
| `tuer_zu`, `tuer_offen` | Tür in zwei Zuständen | Vorderwand + ε |
| `dach` | Dach mit Kamin | Traufkante (Vorderwand + 0,4) |

- Kollision: nur die Wände (Ring um den Grundriss), in der Vorderwand eine Lücke für die Tür; innen kann man laufen.
- Verhalten:
  - Drinnen ist das Dach ausgeblendet, die Vorderwand fast durchsichtig.
  - Nahe der Tür steht sie offen.
  - Verdeckt ein Gebäude den Helden, zeigt eine goldene Silhouette, wo er steht.

## 3. Vergleich

Screenshots: Übersicht, im Haus, hinter dem Haus, an der Seitenwand, Prüfansicht, Isometrie-Seite, Türen beider Häuser.

| Punkt | Bisher frontal | Neu räumlich (Schrägsicht) | Klassisch isometrisch |
|---|---|---|---|
| **Perspektive** | passt zur Kamera, aber flach | passt zur Kamera: Vorderwand unverzerrt, Grundriss auf dem Raster, Ostwand sichtbar | passt **nicht**: Bildgrundriss 2:1-Raute, Weltgrundriss 1:1 – das Haus „schwebt“ neben seiner Kollision |
| **Größe** | Tür 70 px – **kleiner als der Held** (84 px) | Tür 94 px, Wand 118 px – stimmig zum Helden | stimmig in der Höhe, Grundriss verzerrt |
| **Räumliche Wirkung** | gering | deutlich: Volumen, Seitenwand, Schatten, Innenraum | stark, aber stilfremd zu Boden und Figuren |
| **Dachausblendung** | nicht möglich (ein Bild) | funktioniert: Dach weg, Innenraum sichtbar | nur mit Zerlegung möglich (nicht gebaut) |
| **Tiefensortierung** | ein Fußpunkt; Haus wirkt 2 Felder tief, das Dach zeigt 4–5 → Held läuft „ins Dach“ | stimmt an allen geprüften Stellen: davor, dahinter, drinnen, an der Seite | **fehlerhaft**: Neben der Ostwand steht der Held optisch auf dem Dach; ein Einzelbild lässt sich nicht richtig sortieren |
| **Laufwege, Kollision** | Rechteck 5 × 2 unter der Fassade; Dachfläche begehbar | Kollision = echter Grundriss; durch die Tür hinein und hinaus geprüft; an der Wand bleibt der Held stehen | Raute im Raster: stimmt nicht mit dem Bild überein |

Gemessene Tiefen (Bildpunkte, Held vor dem Haus bei y = 22,5): `innen 673 · seite 673 · vorn 864 · dach 883`; Held drinnen 778 (über Boden, unter Vorderwand), dahinter 605 (unter allem, Silhouette an), an der Ostseite 782 (vor der Seitenwand, keine Silhouette).

## 4. Empfehlung

**Die räumliche Schrägsicht als neuen Standard für Gebäude übernehmen – nicht die klassische Isometrie.**

Gründe:
1. Sie passt zur bestehenden Kamera, zu den frontalen Figuren und zum achsparallelen Raster. Kollision ist der echte Grundriss, Wege und Chunks bleiben unverändert.
2. Gebäude werden betretbar (Dach aus, Innenraum sichtbar), ohne Szenenwechsel.
3. Die Tiefensortierung funktioniert mit wenigen Ebenen je Haus und den vorhandenen Phaser-Mitteln (`setDepth`).
4. Die klassische Isometrie würde einen neuen Boden, neue Figuren mit Diagonalansichten, gedrehte Kollisionen und eine zerlegte Sortierung verlangen – praktisch ein neues Spiel.

Bedingungen und Kosten:
- **Fest einheitlich:** Scherung `kx`, Lichtrichtung und Wandhöhen gelten für alle Gebäude. Gespiegelt werden dürfen räumliche Gebäude nicht (sonst zeigte eines die Westwand).
- **Mehr Arbeit je Gebäude:** 6–7 Ebenen statt 1 Bild, dazu ein Innenraum für betretbare Häuser. Nicht betretbare Häuser brauchen keinen Innenraum.
- **Aussehen:** Der Prototyp nutzt die vorhandenen Holz- und Ziegeltexturen mit einem einfachen Malfilter. Der handgemalte Eindruck der Orte entsteht erst mit gemalten Texturen oder Übermalung der Ebenen. Die Lizenz der Texturen ist ungeklärt (siehe `QUELLEN.md`).
- **Verdeckung:** Für Gebäude die Silhouette statt Durchsichtigkeit verwenden – ein halb durchsichtiges Dach zeigt sonst den Innenraum. Bäume bleiben durchscheinend.
- **Prüfung bildpunktgenau:** Ob etwas den Helden verdeckt, entscheidet der Bildpunkt an Brust und Kopf, nicht das Bildrechteck (sonst wird das Dach schon neben dem Haus ausgelöst).

Vorschlag für die Umsetzung, jeweils nach Freigabe:
1. Projektion und Ebenen als Teil des Asset-Standards festschreiben; das Datenmodell um „Gebäude aus Ebenen“ erweitern.
2. Das Welt-Szene-Rendering um Ebenen, Tür-Zustände und Silhouette erweitern.
3. Ein Haus der Waldmark probeweise austauschen, ansehen, dann die übrigen.
