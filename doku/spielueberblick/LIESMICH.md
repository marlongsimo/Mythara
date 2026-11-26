# Mythara – Spielüberblick

`Mythara-Spielueberblick.pdf`: Spielprinzip, Kampfsystem (Kurzfassung v4), Weltkarte mit Figuren/Händlern/Gegnern, Gegner, Quests, Händler und alle Gegenstände.
Alle Zahlen kommen aus dem Spielcode.

Neu erzeugen (Arbeitsordner beliebig, z. B. ein leerer Ordner):
1. `ein.ts` nach `realtime/` kopieren und mit esbuild zu `daten.mjs` bündeln (bundle, platform node, format esm).
2. `node daten.js.mjs > spiel.json`
3. `python3 karte.py` (liest `echtzeit/welt/*.webp`, schreibt `weltkarte.jpg`, `ausschnitt.jpg`, `legende.json`)
4. `python3 pdf_ueberblick.py Mythara-Spielueberblick.pdf`
