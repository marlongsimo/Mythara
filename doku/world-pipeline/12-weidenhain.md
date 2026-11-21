# 12 – Weidenhain in der offenen Welt (Nachbau)

Stand: 21.11.2026 · Vorlage: das gemalte Dorf der Kampagne (`img/echtzeit/weidenhain.webp`, Nachtbild)

## Ergebnis

Region `weidenhain` (3 × 2 Chunks ab Chunk 200|208), direkt südlich des Kreuzwalds. Der Spielserver kennt den Ort schon; Server und Datenbank bleiben unverändert.
Bei Tag gebaut wie die übrige Welt; Feuer und Laternen bleiben.

| Gemälde | Nachbau |
|---|---|
| Kornspeicher mit offenem Tor, Heu | `weidenhain_kornspeicher_01`: Scheune mit Tor, Anbau mit Vordach, innen Heu, Säcke, Fass |
| Fachwerk-Bauernhaus | `weidenhain_bauernhaus_01`: neue Wandart **Fachwerk**, Läden, Blumenkästen, Kamin, Vordach |
| Wassermühle mit Rad | `weidenhain_muehle_01`: Stein mit Fachwerk-Anbau, **Mühlrad** vor der Südwand, innen Mühlstein und Säcke |
| Dorfplatz mit Feuer und Bänken | gepflasterter Platz, `dorf_festfeuer_01`, vier Bänke |
| Linde im Steinring | `dorf_steinring_01` mit Waldbaum 4 darin |
| zwei Stände, Fässer, Heu, Kürbisse | vorhandene Stände, Fässer, Heuballen, neue `dorf_kuerbisse_01` |
| Mühlgraben, Wehr, Zaun am Ufer | Graben unter dem Mühlrad hindurch, `dorf_wehr_01` mit drei Überläufen, `dorf_zaun_01` |
| Leute | Hanne, Lene, Tebbe, Agnes, Mette (vorhandene Figuren) |

## Neu im Baukasten

- `gebaeude.py`: Wandart `fachwerk` (Putz mit Schwelle, Riegel, Pfosten, Streben); Zubehör `muehlrad` (vor der Südwand, weil Ostwände in der Schrägansicht zu schmal erscheinen); Möbel `heu`, `saecke`, `muehlstein`.
- `haus.py`: `feuer`, `steinring`, `wehr`, `zaun`, `kuerbisse`. Steinring und Kürbisse sind ohne Bildvorlage gezeichnet. Feuer, Wehr und Zaun nutzen die Holzmaserung, deren Lizenz ungeklärt ist (QUELLEN.md).
- Generator `werkzeug/welt/weidenhain.mjs`, Prüfung `test/welt-weidenhain.test.mjs` (Türen, Lesestellen und Leute erreichbar, alle Bauten da, Graben fließt).

## Anschluss (noch offen)

Weidenhain ist gebaut, aber noch **nicht erreichbar**: Der Feldweg des Kreuzwalds endet weiter an einem umgestürzten Baum.
Zum Anschließen in `werkzeug/welt/waldmark.mjs` den Südstamm und seine Sperre entfernen, den Feldweg bis an den Südrand verlängern
(er trifft bei x ≈ 48 auf den Dorfeingang) und beide Regionen neu backen. Vorschau ohne Anschluss: `echtzeit/?welt=weidenhain`.
