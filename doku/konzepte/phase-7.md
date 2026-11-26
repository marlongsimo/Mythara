# Phase 7 „Karte nach außen“ – Graufurt, die Fährkette und der Grüne Turm

Konzept vom 26.11.2026 (Leitstelle). Grundlage: Fahrplan `doku/quests/5-fahrplan.pdf` (Phase 7), Weltkonzept `doku/quests/6-weltkonzept.pdf` (W1 „Grenzland vollenden“).
**Wird jetzt vorgearbeitet (Welt, Figuren, Quest-Entwürfe); eingebaut wird nach Phase 6.**
Alle neuen Namen sind **Vorschläge**, bis der Nutzer sie bestätigt (`doku/KANON.md`).

## Ziel

Das Grenzland wird rund: **Graufurt** wächst von der Vorfeste zur ersten **Großstadt** am grauen Fluss, die gerissene **Fährkette** wird neu geschmiedet,
und jenseits des Flusses öffnet sich das **Ostufer** mit dem **Turm mit dem grünen Licht**. Spieler bekommen hier die Rohstoffe der Stufen 45 und 65.
Die Haken liegen schon in der Welt: Bergfried, Steinhäuser, Fährhaus, Fähre und „Turm am Ostufer“ (Welt-Bibliothek), das Wappen mit dem Turm über drei Wellen (Quest A2), der Weg nach Grauwacht im Nordsaum.

## Was es schon gibt

| Was | Wo |
|---|---|
| Region Graufurt (128 × 352 Felder, Stufe 1) mit Bergfried, zwei Steinhäusern, Fährhaus, Fähre | `realtime/welt/…`, `shared/weltzonen.ts` |
| Bauplan „Turm am Ostufer“ (`graufurt_turm_ost_01`) | `realtime/welt/bibliothek/bauplaene.json` |
| Erze Splittereisen (Bergbau 45, „Splitterfelsen“) und Ureisen (65, „Urgestein“) | `shared/bergbau.ts` |
| Weltenbaum (Holz 65), Werkzeuge aus Splittereisen und Ureisen | `shared/holz.ts`, `shared/gegenstaende.ts` |
| Wegstein, Teleport über den Server, Schalter, Quest-Baukasten | Phase 1 und 3a |

## Bausteine (Spiel)

| Baustein | Was |
|---|---|
| **Graufurt als Großstadt** | Bank, Läden, Werkstatt (Esse, Amboss, Werkbank, Kessel, Herd), Wegstein-Ziel, Heilstelle in der Wachtkapelle. Stadt = sicherer Ort ohne Gegner. |
| **Fähre** | Überfahrt zwischen Westanleger (Graufurt) und Ostanleger. Erst mit Schalter `faehre_frei` (nach D1). Technisch wie der Wegstein-Teleport über den Server, mit kurzer Überfahrt (Bild/Blende, ca. 3 s). Ohne Schalter: Fährmann sagt, warum nicht. |
| **Ostufer** | Neue Region östlich von Graufurt, Gefahrenstufe 3 (Gegner Stufe 45–60). Nur über die Fähre erreichbar. |
| **Turm mit dem grünen Licht** | Begehbares Gebäude mit drei Ebenen und Dach, Gegner im Turm, Tür mit dem Wappen (öffnet nur nach Quest A2). |
| **Rohstoffe 45/65** | Splittereisen in der **Furtklamm** (Graufurt, Westseite), Ureisen und Weltenbaum am Ostufer. Kräuter 45 (Nebelkraut) bleibt im Rabenmoor, Kräuter 65 (Lindenblüte) in Weidenhain. |
| **Fischen 45 / Kochen 45** | Graufurter Wels am Fährhafen, Welspastete (Herd). Fischen 65 und Kochen 65 folgen mit der Glutsande-Region (W2). |

### Gegner am Ostufer (Vorschlag)

| Gegner | Stufe | Wo | Besonderheit | Beute (Kurz) |
|---|---|---|---|---|
| Schlickkrebs | 45 | Ufer, Schilf | langsam, hohe Defense | Splitter, Krebsschere (Kochen) |
| Splitterreiher | 50 | Ostufer-Wiesen | Fernkampf (Splitter-Stoß), flieht nicht | Splitter, Federn, selten Splittereisenerz |
| Turmwächter | 58 | im Turm | gerüstete Steinfigur der Wacht, Rundumschlag mit Ansage (Boss-Baukasten aus Phase 4) | Splitter, Wachtstein, selten Teile der Wachtrüstung |
| Grünlicht | 60 | Turmdach (einzeln) | Irrlicht, heilt Turmwächter in der Nähe | Splitter, Seelenlicht |

Genaue Werte und Beutetabellen schreibt die Leitstelle vor dem Einbau in `beute.md` dazu (wie Phase 4/6).

## Quests (Block D)

**D1 „Die Fährkette“** – Fährmann **Kord Weller** (Fährhaus Graufurt). Voraussetzung: Schmieden 45, Bergbau 45, Quest A2.
Kord zeigt die gerissene Kette → Hauptfrau **Merit Stahl** (Bergfried) gibt die Erlaubnis, wenn man ihr das Wappen aus A2 zeigt →
6 Splittereisenerz in der Furtklamm → 3 Splittereisenbarren (Esse Graufurt) → 8 Kettenglieder (Quest-Rezept, Amboss, Schmieden 45) →
Kettenschloss bei der Schmiedin der Stadt abholen → Kette an der Winde des Westanlegers einhängen (Questobjekt) → erste Überfahrt mit Kord.
Lohn: 2.500 Schmieden-XP, 1.000 Bergbau-XP, 400 Splitter, 2 Questpunkte. Schalter `faehre_frei` (Fähre fährt, Ostufer offen).

**D2 „Das grüne Licht“** – beginnt am Ostanleger (Kord: „Seit die Kette riss, brennt da drüben dieses Licht.“). Voraussetzung: D1, Heldenlevel 45 empfohlen.
Zum Turm → Tür mit dem Wappen (Turm über drei Wellen) → Ebene 1 und 2: Turmwächter → Ebene 3: Wächterbuch (Lore: die Wacht, die Glocke von Grauwacht) →
Dach: das grüne Signalfeuer brennt aus einem Splitterkern; das Grünlicht bewacht es → Geist der Wächterin **Ysolde** erscheint, erzählt, dass das Feuer Grauwacht rufen sollte und niemand mehr antwortet →
Splitterkern zu Merit Stahl. Lohn: je 2.000 XP Stärke/Geschick/Defense, 600 Splitter, 2 Questpunkte, **Wegstein-Ziel Ostufer (Turm)**. Haken für W3: „Der Weg nach Grauwacht“.

**D3 „Wels im Trüben“** (Nebenquest, klein) – Wirtin **Alma Furtner** (Taverne „Zur Furt“, Graufurt). Voraussetzung: Fischen 45, Kochen 45.
3 Graufurter Welse fangen → 2 Welspasteten am Herd der Taverne → Abgabe. Lohn: Fischen- und Kochen-XP, 150 Splitter, 1 Questpunkt; Alma verkauft danach Welspastete.

## Orte (Welt)

- **Graufurt zur Stadt** (bestehende Region, Ausbau): Stadtmauer mit zwei Toren (West zur Waldmark/Osthang, Nord zum Nordsaum), Bergfried mit Wachtkapelle,
  Markt (Waffen, Rüstung, Tränke, Handwerk, Lebensmittel), **Bank**, Werkstatt-Hof (Esse, Amboss, Werkbank, Kessel, Herd), Taverne „Zur Furt“, Fährhafen mit Fährhaus und **Westanleger mit Winde**,
  Wegstein am Markt. Nicht alles mit Häusern füllen – Plätze, Gassen und Flussufer frei lassen.
- **Furtklamm**: Schlucht am Stadtrand mit 4 Splitterfelsen (Splittereisen).
- **Fischplatz** am Fährhafen (Graufurter Wels, Fischen 45).
- **Ostufer** (neue Region, Stufe 3): Ostanleger, Schilfufer (Schlickkrebse), Wiesen (Splitterreiher), 3 Urgestein-Adern, Weltenbaum-Hain mit 3 Bäumen, der **Turm** auf einer Anhöhe.
- **Turm mit dem grünen Licht**: Innenräume Ebene 1–3 und Dach (Treppen, Wappentür unten, Wächterbuch auf Ebene 3, Signalfeuer oben, grünes Licht weithin sichtbar).
- Weg nach Grauwacht im Nordsaum bleibt **zugewachsen** (Haken für W3).

## Figuren und Bilder (Figuren & 3D)

- NPCs: Kord Weller (Fährmann), Merit Stahl (Hauptfrau der Wacht, Rüstung mit dem Turm-Wappen), Alma Furtner (Wirtin), Schmiedin, 2–3 Wachen der Wacht, 3 Stadtleute (Varianten), Händler für den Markt (wo möglich vorhandene wiederverwenden),
  **Ysolde** als Geist (durchscheinend, grünes Leuchten).
- Gegner: Schlickkrebs, Splitterreiher, Turmwächter (Steinfigur in Wacht-Rüstung, Animation Rundumschlag), Grünlicht (Irrlicht).
- Objekte: Fähre (3D, mit Kette), Winde mit Kette, Kettenglied, Kettenschloss, Splitterkern mit grüner Flamme, Wächterbuch, Signalfeuer-Schale.
- Gegenstände/Bilder: Kettenglied, Kettenschloss, Graufurter Wels, Welspastete, Krebsschere, Wachtstein, grüner Splitterkern.
- Kartensymbol: Fähre/Anleger (im Stil der neuen Kartensymbole, #33).

## Reihenfolge

1. **Jetzt (Vorarbeit):** Welt baut Graufurt, Furtklamm, Ostufer, Turm · Figuren baut NPCs, Gegner, Objekte · Quests schreibt D1–D3 als Entwurf (nach den Phase-4-Entwürfen).
2. **Nach Phase 6 (Integration):** Fähre, Ostufer-Zugang, Gegner mit Werten und Beute, Rohstoffe, Wegstein-Ziele, Quests einbauen.

## Tests (für den Einbau)

Fähre nur mit Schalter, beide Richtungen · Ostufer nicht anders erreichbar · Wappentür nur nach A2 · D1 vollständig (Rezepte, Questobjekt Winde) · D2 mit Turmkampf · Rohstoffe 45/65 nur ab Stufe · Prüfer nimmt D1–D3 an.

## Offen (Nutzer)

- Namen: Kord Weller, Merit Stahl, Alma Furtner, Ysolde, Furtklamm, Taverne „Zur Furt“, Gegnernamen.
- Turmkampf öffentlich oder als Instanz (wie die Frage bei Rotmantel)?
- Soll das Ostufer schon ein Stück Glutsande zeigen (Dünen am Horizont) oder bewusst grün bleiben?
