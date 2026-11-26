# Phase 4 „Westmark & erster Boss“

Konzept vom 26.11.2026 (Leitstelle). Grundlage: `doku/quests/2-hinter-der-sperre.pdf` (B3, B4), Fahrplan `doku/quests/5-fahrplan.pdf`,
Beute: `doku/konzepte/beute.md`. **Startet nach Phase 3.**

## Bausteine (Spiel)

| Baustein | Was |
|---|---|
| **Banditen-Varianten** | Späher (Stufe ~18, Schleuder = Fernkampf, **flieht** bei wenig LP zum nächsten Kumpan), Schläger (~22, Nahkampf), Armbrustschütze (~24, Fernkampf). Lager in der **Westmark** und am Moorrand der **Riedwiesen**. Beute laut `beute.md`. |
| **Fliehen** | Neues Gegnerverhalten: unter 25 % LP zum nächsten Lagerkumpan laufen, dort weiterkämpfen. |
| **Türen und Schlüssel** | Durchgang im Gehraster, je Spieler offen, wenn er den Schlüssel hat (baut auf den Schaltern aus Phase 2 auf). |
| **Boss-Baukasten** | Angriffe mit Ansage (Felder leuchten 2 Ticks vorher), Phasen nach LP, Helfer rufen, Heilorte; Bosse als Daten wie Quests. Wird in Phase 6 wiederverwendet. |
| **Instanzen** | Kopie eines Raums je Spieler (Quest-Kampf), an die Instanzen der Kampagnenkämpfe anknüpfen. |
| **Bosszähler** | wie oft ein Konto einen Boss besiegt hat. |

## Quests

**B3 „Fallobst“** – Gisbert Ast (Obstwiesen). Voraussetzung: Die gesperrte Straße, Heldenlevel 15.
Spuren untersuchen (3) → Westmark → 5 Späher besiegen, Karrenbrief (garantiert beim 5.) → gestohlene Kisten an der verlassenen Hütte; die **Leiter in den Unterschlupf erst ab hier nutzbar** →
Kisten zu Gisbert → Othmar Rehn liest den Brief („R.? Rotmantel.“). Lohn: Fernkampf 500, Geschick 300, LP 200, 10 Äpfel (Essen, heilt 2), 120 Splitter, 1 Questpunkt; Gisbert verkauft Äpfel.

**B4 „Das rote Banner“** – Othmar Rehn (Weidenhain). Voraussetzung: B3, Heldenlevel 25 empfohlen, Defense 20.
Gesa Brandt wartet an der Hütte → Einstieg und Wachstube (Schläger, Armbrustschützen) → Schlüsselbund → Beutelager (Kartentisch, Silberleuchter) →
Versammlungshalle (Mehrkampf, 2 Wellen à 3) → **Kammer des Anführers als Instanz: Hauptmann Rotmantel** → Brief mit Rabensiegel → Othmar.
Lohn: je 1.000 XP Stärke/Geschick/Defense, 500 LP, 500 Splitter, **eine Selten-Waffe nach Wahl**, Rotes Banner, 1 Questpunkt. Danach: Rotmantel öffentlicher Mini-Boss (3 min Wiederkehr) mit Beute aus `beute.md`.

**Rotmantel (Kampf):** Stufe ~32, 120 LP, max. Treffer 14, Zweihänder. 100–50 %: Rundumschlag alle 5 Angriffe (8 Felder leuchten 2 Ticks vorher).
Bei 50 %: ruft 2 Schläger. 50–0 %: Rundumschlag alle 3 Angriffe; am Thron trinkt er einmal einen Heiltrank.

## Orte (Welt)
- Westmark: Späher-Lager, Wege zur verlassenen Hütte, Spuren zwischen Obstwiesen und Westmark
- Riedwiesen: zweites Lager am Moorrand
- Unterschlupf: verschlossene Tür zum Beutelager, Kammer des Anführers als eigener Raum (Instanz), Platz für 2 Wellen in der Versammlungshalle
- Obstwiesen: Gisberts leere Kisten, 3 Spurenstellen

## Figuren und Bilder
- Banditen-Varianten: Späher (Schleuder), Schläger (Keule/Axt), Armbrustschütze – auf dem Banditenmodell, unterscheidbar
- Rotmantel (`banditenboss3d`): Rundumschlag, Ruf-Geste, Trinken, Treffer, Tod prüfen/ergänzen
- Gisbert Ast (Obstbauer); Gesa Brandt in Rüstung (optional)
- Gegenstandsbilder: Karrenbrief, Schlüsselbund, Silberleuchter, Apfel, Rotes Banner, Rotmantels Klinge
