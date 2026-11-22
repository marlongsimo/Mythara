# Kampfsystem (Kampfregeln v2)

| Datei | Inhalt |
|---|---|
| `Mythara-Kampfsystem-v2.pdf` | Das gesamte Kampfsystem, wie es im Spiel umgesetzt ist (Tick, Skills, Formeln, Stile, Ausrüstung, Bandit, Balancing, Speicherung) |
| `Mythara-Vorlage-Ausruestung.pdf` | Welche Daten ein Ausrüstungsstück braucht (Pflicht, optional, noch nicht im Spiel) |
| `Mythara-Vorlage-Gegner.pdf` | Welche Daten ein Gegner braucht (Werte, Aggro, Platzierung, Drop-Tabelle, Darstellung) |

Stand 22.11.2026. Quelle der Regeln im Code: `realtime/shared/kampfwerte.ts`, `gegenstaende.ts`, `config.ts`, `sim.ts`.
Die PDFs werden mit den Skripten in `quelle/` erzeugt (Python, reportlab): `python3 pdf_kampf.py` und `python3 pdf_vorlagen.py` im Ordner `quelle/`.
