# Die neuen Gegnerstufen (berechnet aus den Kampfwerten)

*Konzept-Chat, 27.11.2026. **Entschieden (Nutzer):** Die Gegner bleiben genau so, wie sie sind, ohne Farbe und ohne neue Werte. Um die Stufen der bestehenden Gegner kümmern wir uns nicht weiter.*
Grundlage: Kanon „Gegnerstufe wird berechnet“. Die Stufe kommt aus `kampfwerte.ts` `gegnerStufe()`: dieselbe Formel wie das Heldenlevel, die Lebenspunkte zählen als LP-Level.
Die Zahlen unten sind mit dem Stand von `feature/realtime-engine` vom 27.11. nachgerechnet. Werte geändert hat dabei niemand, nur die **Anzeige** ist neu.

## Was sich verschiebt

| Bereich | alte Stufe | neue Stufe | Faktor |
|---|---|---|---|
| Anfänger (Ente, Schaf, Hase, Bandit) | 1–4 | 1–5 | etwa gleich |
| Waldland, Westmark (Späher, Golem, Wildschwein, Wegelagerer) | 14–24 | 17–28 | ×1,1–1,6 |
| Küste, Moor, Fahle Weiten (Krabben, Heidewolf, Lurch, Novize) | 26–38 | 31–58 | ×1,2–1,9 |
| Glutsande, Ostufer (Deserteur, Sandkriecher, Skorpion, Räuber) | 42–52 | 72–89 | ×1,6–1,8 |
| Hochlande (Widder, Bär, Troll, Adler) | 52–58 | 86–114 | ×1,6–2,0 |
| Frostgegner (Frostwolf, Elch, Eisgolem, Drakling) | 62–72 | 111–131 | ×1,8 |

Je höher die Gegner, desto stärker wächst die Zahl, weil ihre Lebenspunkte viel stärker steigen als ihre übrigen Werte.

### Bosse

| Boss | alt | neu |
|---|---|---|
| Hauptmann Rotmantel | 32 | **64** |
| Federmutter Ravena | 40 | **98** |
| Der Wrackkapitän | 40 | **103** |
| Tjark Sölde | 46 | **119** |
| Der Graue Hauptmann | 52 | **135** |
| Der Oberste Rabenpriester | 55 | **151** |
| Die Sandmutter | 60 | **157** |
| Frostwitwe · Sturmschwinge · Grumhold | – | **171 · 184 · 200** |

## Bewertung

- Die **Boss-Regeln** passen weiter. Die Hüter liegen mit 171–200 in ihrem Rahmen (150–200), und die Endgame-Stufen darüber (Rissgrube 220–280, Unikate 280–350, Raid bis 500) bleiben sinnvoll. Neu dazu käme eine Zeile **„Midgame-Bosse: ca. 60–160“**.
- Ein Held kommt höchstens auf etwa **Heldenlevel 115**. Normale Gegner der Hochlande (86–114) zeigen damit schon fast Höchststufe an, obwohl man sie mit Heldenlevel um 55–60 gut schafft.
- **Faustregel neu:** Ein normaler Gegner passt zu einem Helden, dessen Heldenlevel etwa **die Hälfte bis zwei Drittel** der Gegnerstufe beträgt. Auf niedrigen Stufen liegt beides fast gleich.
- Manche Texte nennen noch alte Stufen, z. B. in `phase-11.md` „Gegner 46–58“ und in Questtexten. Diese Stellen müssen angepasst werden (Leitstelle bzw. Quests).

## Vorschlag zur Anzeige (Entscheidung des Nutzers)

- **A, so lassen und eine Hilfe dazu:** Die Zahl bleibt, wie sie ist. Daneben zeigt eine **Farbe**, wie gefährlich der Gegner für *diesen* Helden ist: grün (leicht), gelb (passend), orange (schwer), rot (sehr gefährlich). Die Farbe wird aus dem Kampf selbst gerechnet (Trefferchancen und Max Hit beider Seiten), nicht aus der Stufe.
- **B, Werte nachziehen:** Normale Gegner bekommen weniger Leben und mehr Abwehr, damit Stufe und Heldenlevel wieder ungefähr gleich sind. Das wäre viel Arbeit und verändert die Spielbalance.

**Empfehlung: A.** Die Anzeige bleibt ehrlich, und die Farbe sagt Spielern ohne Rechnen, woran sie sind.

## Offen
- A oder B?
- Bei A: Grenzen der Farben (z. B. nach der geschätzten Zahl der Treffer, die man selbst aushält).
