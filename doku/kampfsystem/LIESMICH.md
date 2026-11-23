# Kampfsystem v4

| Datei | Inhalt |
|---|---|
| `Mythara-Kampfsystem-v4.pdf` | Das gesamte Kampfsystem, wie es im Spiel steckt: Treffer und Abwehr nach OSRS-Rechnung, Max Hit, Stile, XP, Heldenlevel, Startausrüstung, alle Waffen und Rüstungen bis Selten, Gegner (Bandit), Bewegung, Tränke, Beute, Datenvorlage für neue Ausrüstung und Gegner |

Stand 23.11.2026. Ersetzt alle früheren Fassungen (v2, v3 und die alten Datenvorlagen).
Quelle der Regeln im Code: `realtime/shared/kampfwerte.ts`, `gegenstaende.ts`, `config.ts`, `sim.ts`.

PDF neu erzeugen (Python 3 mit reportlab):

```
cd realtime && node build.mjs
node ../doku/kampfsystem/quelle/kampfdaten.mjs > ../doku/kampfsystem/quelle/kampfdaten.json
cd ../doku/kampfsystem/quelle && python3 pdf_kampf.py ../Mythara-Kampfsystem-v4.pdf kampfdaten.json
```
