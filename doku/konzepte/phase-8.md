# Phase 8 „Der Weg nach Grauwacht“ – Fahle Weiten (W3) und Grauwacht

Konzept vom 26.11.2026 (Leitstelle). Grundlage: Weltkonzept `doku/quests/6-weltkonzept.pdf` (W3, Großstadt ③ Grauwacht), Phase 7 (`phase-7.md`, Ysolde und die Glocke).
**Vorarbeit jetzt** (Welt, Figuren, Quest-Entwürfe), Einbau nach Phase 7. Alle Namen sind **Vorschläge**.

> **Annahme:** Die Fahlen Weiten (W3) kommen **vor** den Glutsanden (W2). Begründung: Der rote Faden der Geschichte läuft über die Wacht –
> das Wappen (A2), der Turm mit dem grünen Licht und Ysolde (D2) zeigen nach Grauwacht. Die Fähre aus D1 führt vorerst nur zum Ostufer.
> Entscheidet der Nutzer anders, wird dieses Konzept Phase 9 und die Glutsande rücken vor.

## Ziel

Der zugewachsene Weg im Nordsaum öffnet sich. Dahinter liegen die **Fahlen Weiten**: bleiche Graslande, Heide, Hügelgräber, ständiger Wind (Gefahr 30–50).
Am Ende steht **Grauwacht**, Abtei und Burg der alten Wacht, halb verlassen. Spieler bauen die Stadt **Schritt für Schritt wieder auf** – jede Quest belebt einen Teil.
Grauwacht wird die zweite Großstadt und das Tor zu den Hochlanden (W5).

## Neu im Spiel

| Baustein | Was |
|---|---|
| **Stadt im Wiederaufbau** | Grauwacht hat drei Stufen je Spieler (Schalter): verlassen → Abtei bewohnt (E1/E2) → Burg besetzt (E3/E4). Mit jeder Stufe kommen NPCs, Läden, Bank, Werkstatt und Wegstein dazu. Technisch: Objekte und NPCs mit `nurMitSchalter` (Baustein aus Phase 2, erweitert auf ganze Gruppen). |
| **Wind** | Weltereignis in den Fahlen Weiten: alle paar Minuten eine Böe (Ansage 2 Ticks, Fernkampf −20 % für 10 s). Rein atmosphärisch plus ein kleiner Kniff für den Kampf. |
| **Hügelgräber** | Drei kleine Grabkammern (Untergrund), je mit Seelenlichtern (Grablicht 35) und Gegnern; die größte ist der Dungeon für E4. |
| **Die Glocke** | Nach E2 läutet die Glocke von Grauwacht **zu jeder vollen Stunde für alle** (Klang über die ganze Region) – und Wiedergänger in den Weiten sind dann 1 Minute lang friedlich. |

## Region Fahle Weiten (Welt)

- **Nordsaum-Weg**: heute zugewachsen. Ab E1 frei (Dornenwall je Spieler offen). Die Fahlen Weiten sind **schon vorher zu Fuß** durch Wald und Festland erreichbar (Entscheidung 26.11.) – E1 öffnet nur die Abkürzung.
- **Heidrast**: Hirtensiedlung mit 4–5 Katen, Schafpferch, Brunnen. Erste Rast, Wegstein-Ziel nach E1.
- **Grenzposten** der Wacht am Nordsaum (verfallen, Deserteure-Lager).
- **Hügelgräber**: Feld mit 7–9 Grabhügeln, drei davon begehbar; das **Grab des Grauen Hauptmanns** als Dungeon.
- **Glockenturm** von Grauwacht weithin sichtbar; **Brücke zur Furt** im Osten (gesperrt, Haken für W5 Hochlande).
- **Grauwacht**: Burg auf einem Felsrücken, Abtei im Tal, Unterstadt mit leeren Häusern (füllt sich mit den Stufen), Markt, Bank, Werkstatt-Hof, Abteiküche (Herd, Kessel), Bindestein in der Abtei.
- **Rohstoffe**: Kernbaum (Holz 45) in einem windgeschützten Tal, Eisen/Schwarzeisen im Burgfels, Kräuter bis 35 (Eisenhut an den Gräbern).

## Gegner (Vorschlag)

| Gegner | Stufe | Kampf | Wo |
|---|---|---|---|
| Heidewolf | 32 | Nahkampf, im Rudel (3) | offene Heide |
| Wiedergänger | 38 | Nahkampf, langsam, zäh; friedlich beim Glockenschlag | Hügelgräber, nachts in der Heide |
| Deserteur (Schwert) | 42 | Nahkampf, flieht zum Lager (Fliehen aus Phase 4) | Grenzposten |
| Deserteur (Armbrust) | 44 | Fernkampf | Grenzposten |
| Grabwächter | 48 | Steinfigur, Rundumschlag mit Ansage | Grabkammern |
| **Der Graue Hauptmann** | 52 | Mini-Boss (Geist in Wacht-Rüstung): Phasen, ruft Wiedergänger, Deckung hinter Grabsteinen (Boss-Baukasten Phase 4/6) | Grab des Grauen Hauptmanns (Instanz) |

Beute: Splitter, Grablicht/Seelenlicht, Wachtstein (aus Phase 7), Teile einer **Wachtrüstung** (neues Set, siehe unten), Selten/Episch selten. Tabellen schreibt die Leitstelle vor dem Einbau in `beute.md`.

## Quests (Block E)

**E1 „Der Weg nach Grauwacht“** – Merit Stahl (Graufurt) schickt dich nach D2 los: „Ysolde sagt, niemand antwortet mehr. Dann gehen wir hin.“
Voraussetzung: D2, Holzfällerei 40. Dornenwall im Nordsaum roden (Questobjekte) → Heidrast: Hirtin **Mette Heider** erzählt von Wölfen und „Toten, die nachts wandern“ →
Rudelführer der Heidewölfe → weiter zur Abtei: Äbtissin **Gunhild** und drei Nonnen halten die Abtei allein.
Lohn: Wegstein-Ziel Heidrast, Abtei bewohnt (Stufe 1), XP (Holz, Stärke, Defense, je ≤ 1.000), 300 Splitter, 2 Questpunkte.

**E2 „Die Glocke“** – Äbtissin Gunhild. Voraussetzung: E1, Schmieden 45.
Die Glocke ist gesprungen; seit sie schweigt, wandern die Toten. Glockenbronze: Kupfer + Splittereisen (Furtklamm) → Glockenform im Ofen der Abtei (Quest-Rezept) →
Klöppel aus Kernbaum → mit Hilfe der Nonnen aufhängen → erster Schlag: Ysoldes Stimme antwortet von Graufurt aus („Endlich.“).
Lohn: **Glocke läutet stündlich für alle**, Bindestein in der Abtei, Schmieden-XP, 400 Splitter, 2 Questpunkte.

**E3 „Fahnenflucht“** – Burgvogt **Wigand Fels** (einziger Wachtmann in der Burg). Voraussetzung: E2, Heldenlevel 42.
Die Deserteure am Grenzposten sind Wachtleute, die nach dem Zerfall fortliefen. Lager auskundschaften → Anführer **Tjark Sölde** stellen →
**Wahl**: überreden (Deserteure kehren als Burgbesatzung zurück, Burg Stufe 2 schneller, Läden in der Burg) oder besiegen (Beute, Burg bleibt dünn besetzt bis E4).
Lohn: Burg besetzt (Stufe 2), Bank und Waffenladen in Grauwacht, XP, 400 Splitter, 2 Questpunkte. *(Quest-Baukasten: Abschluss mit Wahl, aus Phase 4.)*

**E4 „Das Grab des Grauen Hauptmanns“** – Wigand Fels / Äbtissin Gunhild. Voraussetzung: E3, Heldenlevel 48 empfohlen.
Der letzte Hauptmann von Grauwacht liegt im größten Hügelgrab und lässt die Wiedergänger nicht ruhen. Grabkammer (Grabwächter, Wiedergänger) →
Siegel des Hauptmanns → **Der Graue Hauptmann** (Instanz) → seine Klinge bringt Wigand zurück in die Burg.
Lohn: **Klinge des Grauen Hauptmanns** (Selten-Langschwert mit eigenem Aussehen, kein Set), Grauwacht voll belebt (Werkstatt, Markt, Wegstein), XP, 600 Splitter, 3 Questpunkte. Haken: die Brücke zur Furt (W5).

**Nebenquests (klein):** „Mettes Schafe“ (Heidewölfe, Kochen: Hammeleintopf), „Ruhelose Gräber“ (Seelenlichter in den drei Grabkammern, Splitterbinden 35).

## Wachtrüstung

**Vorerst nicht** (Entscheidung des Nutzers, 26.11.). Die Teile `*.wacht` von Figuren (#51) bleiben in der Fabrik liegen und werden nicht als Gegenstände eingetragen.

## Wer macht was (Vorarbeit jetzt)

| Rolle | Aufgabe |
|---|---|
| Welt | Nordsaum-Weg mit Dornenwall, Region Fahle Weiten, Heidrast, Grenzposten, Hügelgräberfeld + 3 Grabkammern, Grauwacht (Burg, Abtei, Unterstadt in drei Stufen), Brücke zur Furt (gesperrt) |
| Figuren | NPCs: Mette Heider, Äbtissin Gunhild + 3 Nonnen, Burgvogt Wigand Fels, Tjark Sölde, Deserteure (Schwert/Armbrust), Hirten; Gegner: Heidewolf (+ Rudelführer), Wiedergänger, Grabwächter, Der Graue Hauptmann (Geist); Objekte: Glocke (gesprungen/heil), Glockenform, Dornenwall, Grabhügel-Eingang |
| Quests | E1–E4 und die zwei Nebenquests als Entwurf |
| Systeme (später) | Stadtstufen über Schaltergruppen, Wind-Ereignis, Glocke als stündliches Weltereignis mit friedlichen Wiedergängern |

## Offen (Nutzer)

- **Reihenfolge W2/W3** (siehe Annahme oben).
- Namen: Fahle Weiten, Grauwacht, Heidrast, Mette Heider, Äbtissin Gunhild, Wigand Fels, Tjark Sölde, Der Graue Hauptmann.
