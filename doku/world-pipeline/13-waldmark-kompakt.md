# 13 – Probe „Waldmark kompakt“ mit Kenney-Bausteinen

Stand: 21.11.2026 · **Entwurf**, nicht in den Spieldateien, die echte Waldmark ist unverändert.

## Idee

Die Waldmark als kompaktes, ummauertes Startdorf auf 2 × 2 Chunks (statt 3 × 2), gebaut aus Kenney-Formen (CC0) und unseren Gebäuden:

| Teil | Woher |
|---|---|
| Ringmauer (2 × 2-Felder-Blöcke mit Zinnen), vier Ecktürme, Torhaus, zwei Tortürme | Kenney Castle Kit, mit unseren Texturen gemalt (`werkzeug/welt/kenney.py`) |
| Marktstände, Karren, Heuwagen, Laternen, Banner, Hecken, Zäune, Felsen | Kenney Town Kit |
| Fässer, Kisten, Flaschenzug | Kenney Retro Fantasy Kit |
| Heldenhalle, Taverne, Schmiede, Wohnhäuser, Brunnen | unser Baukasten (Türen, Innenräume, aufklappende Dächer) |

## Kenney-Renderer

- Material je Paket aus Kenneys Farbtafel (im Town Kit ist Ocker Holz, im Castle Kit Stein) bzw. aus den Materialnamen (Retro Kit).
- Texturen alle selbst gerechnet: `quader`, `stein`, `schiefer`, `holz`, `laub`, `stoff`, `fels` (gebaeude.tex). Kenneys kräftige Farben werden gedämpft, Laub zum Waldgrün gezogen.
- Neue Objekte: `burg_mauer_quer`, `burg_mauer_laengs`, `burg_eckturm`, `burg_torhaus`, `k_*` (Stände, Karren, Laternen, Banner, Hecke, Zaun, Felsen, Fässer, Kiste, Flaschenzug). Die verwendeten Modelle liegen mit Lizenzdatei unter `werkzeug/welt/kenney/`.

## Ansehen

    node werkzeug/welt/waldmark_kompakt.mjs && node werkzeug/welt/bauen.mjs waldmark_kompakt && node build.mjs
    → echtzeit/?welt=waldmark_kompakt&server=

Danach die Probe wieder aus `echtzeit/welt/` entfernen (Chunks 150–151, `karte-waldmark_kompakt.webp`, Eintrag in `welt.json`), bevor gebaute Dateien live gehen.
`bauen.mjs` übernimmt Regionen, die schon in `welt.json` stehen.

## Offen, falls sie die echte Waldmark ersetzen soll

- Anschluss an den Kreuzwald: Das Südtor müsste auf die Kreuzung zulaufen (Lage 200|200 und Größe der Region anpassen, Kreuzwald-Nordrand prüfen).
- Mauern haben keine Innenansicht; die Mauerkrone ist nicht begehbar.
- Die Tür des Burgturms ist aus Stein (Kenney färbt Tür und Mauer gleich); Tore und Türen wären gezielt als Holz zu markieren.
