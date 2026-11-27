# Phase 5 „Vorbereitung Moor“ – Kräuterkunde, Gegenstände mit eigenen Daten, geladene Waffen, Set-Bonus

Konzept vom 26.11.2026 (Leitstelle). Grundlage: `doku/quests/4-berufe.pdf` (Kräuterkunde, Splitterbinden), Fahrplan `doku/quests/5-fahrplan.pdf`,
Kanon `doku/KANON.md` (Tränke-Regeln, Splitterbinden-Regeln). **Startet nach Phase 4.** Phase 6 (Raben-Trilogie) baut auf allem hier auf.

## Ziel

Spieler können sich für das Rabenmoor **rüsten**: Kräuter sammeln und Tränke brauen, seltene Waffen mit Splittern **laden**, und das Rabenset bekommt seinen
**Set-Bonus** im Kampf. Technisch ist der große Brocken **Gegenstände mit eigenen Daten** – ohne ihn gibt es keine geladenen Waffen.

## Was es schon gibt

| Was | Stand |
|---|---|
| Wirkungs-System (Essen mit Wirkung, Schild unter der Minikarte) | Phase 3b (Integration, auf `claude/welt3d`) |
| Splitterbinden: Seelenlichter, Wegstein-Ladungen, Resonanz, Bindestein an der Linde | Phase 3a ✅ – Ladungen als Zahl im Inventar (`inventar.ladungen.wegstein`), nicht am Gegenstand |
| Kleiner Heiltrank, Heiltrank (Mira verkauft) | ✅ |
| 3D/Bilder: Kräuter, Tränke je **schwach/stark**, leeres Fläschchen, Trüber Sud, Sichel (Handteil) | Figuren #28 ✅ (Einbau #29) |
| Kräuter-Fundstellen (`welt/kraeuter_standorte.json`), Kessel bei Hedda | Welt #35 ✅ |
| Kräuterkunde-Symbol | Figuren #30 ✅ (Eintrag in `berufe.ts`: #31) |
| Rabenset mit Set-Bonus als Daten (`SETS.rabenset`, `setHeilung`) | ✅ Daten, **nicht im Kampf gerechnet** |
| Rucksackfach `string \| { g, n }` | heute **ohne** Platz für Daten je Exemplar |

## 5a · Gegenstände mit eigenen Daten (zuerst)

Ein Fach bekommt optional Daten je Exemplar:

```ts
type Fach = string | { g: string; n: number; d?: { ladungen?: number /* später: haltbar, gravur, … */ } };
```

- **Stapeln** nur bei gleichem `g` **und** ohne `d`. Ein Gegenstand mit `d` belegt immer ein eigenes Feld (`n = 1`).
- Gilt überall gleich: Rucksack, angelegt (`angelegt[platz]` wird `string | { g, d }`), Bank, Boden, Handel, Speichern (Migration nur, falls die Spalte nicht schon JSON ist – vorher prüfen).
- **Handel/Bank:** Ein Gegenstand mit `d.ladungen > 0` ist **nicht handelbar** und nicht auf den Boden legbar (Kanon). In die Bank darf er.
- Alte Stände bleiben gültig (fehlendes `d` = keine Daten). Der Wegstein bleibt vorerst bei `inventar.ladungen` – Umzug auf `d` erst, wenn alles läuft.

**Tests 5a:** Stapeln mit/ohne Daten, Tauschen, Anlegen/Ablegen behält `d`, Bank, Handel lehnt geladene Waffe ab, alter Speicherstand lädt.

## 5b · Geladene Waffen (Splitterbinden)

Regeln laut Kanon (entschieden):

| Stufe Splitterbinden | Waffen der Seltenheit | Kosten je Ladung | XP je Ladung |
|---|---|---|---|
| 20 | Selten | 2 Splitter (oder 1 Splitter + 1 Seelenlicht) | 3 |
| 35 | Episch | 2 | 5 |
| 45 | Legendär | 2 | 8 |
| 65 | Mythisch | 2 | 12 |

- Laden **nur am Bindestein**, im Stapel (10 / 50 / alle), höchstens 1.000 Ladungen je Waffe. Resonanz wie beim Wegstein (doppelte Ladungen, +50 % XP).
- Geladen heißt die Waffe **„… (s)“** und zeigt die Ladungen (Rucksack, angelegt, Tooltip).
- **+10 % auf Angriffs- und Schadensboni** der Waffe, solange Ladungen da sind. **Jeder Angriff verbraucht eine Ladung**, auch ein Fehlschlag. Leer = normale Waffe.
- **Entladen nur am Bindestein**, die Splitter verfallen. Danach wieder handelbar.
- Bindesteine: Linde Weidenhain (nach B1) ✅, Obelisk im Nordwald (nach A2) – neu als Station, Schrein Aschenwerth (nach C3, Phase 6).
- **Seelenlichter 20/35/45:** Irrlicht (Rabenmoor, über dem Wasser), Grablicht (Friedhof und Obelisk Nordwald), Nebellicht (Nebelfelder Rabenmoor) – Standorte von Welt (neues Issue), Werte wie im Berufe-PDF (28 / 45 / 70 XP).
- Agnes erklärt das erste Laden einer Waffe in einem kurzen Gespräch, sobald man Splitterbinden 20 hat und eine seltene Waffe trägt (Dialog-Erweiterung, kein Quest).

**Tests 5b:** Laden nur am Bindestein und nur mit passender Stufe, Ladung je Angriff weg (auch bei Fehlschlag), +10 % im Kampf (Server), leer = normal, Entladen verwirft, Handel lehnt ab.

## 5c · Kräuterkunde (Sammeln und Brauen)

**Sammeln:** mit der **Sichel** (Handteil von Figuren, Laden: Handwerker; Handwerk 1 an der Werkbank). Sammel-Kern wie Holz/Erz, Moment-Bonus „Tau“, 25 % Splitter-Fund.

| Stufe | Kraut | XP | Wo (Welt #35) |
|---|---|---|---|
| 1 | Wegerich | 10 | Wiesen der Waldmark, Feldränder Osthof |
| 10 | Ringelblume | 18 | Obstwiesen |
| 20 | Moorglöckchen | 30 | Rabenmoor, Heddas Insel |
| 35 | Eisenhut | 50 | Friedhof und Feste im Nordwald |
| 45 | Nebelkraut | 75 | Nebelfelder im Rabenmoor |
| 65 | Lindenblüte | 110 | alte Linde in Weidenhain (wenige Blüten, wachsen langsam nach) |

**Brauen** am **Kessel** (Kräuterhaus Waldmark, bei Mutter Hedda; nach Phase 7 auch Graufurt). Rezepte sind **fest je Level** (Kanon) – kein Entdecken, kein Rezeptbuch.
Jeder Trank hat eine **schwache** und eine **starke** Fassung (Modelle von Figuren). Die schwache ist früh verfügbar und wirkt deutlich schwächer, ohne Nebenwirkung;
die starke kommt später, wirkt kräftig – **Nebenwirkungen nur bei den starken Tränken der hohen Stufen (ab 45)**.

| Stufe | Trank | Zutaten (+ leeres Fläschchen) | Wirkung | Nebenwirkung |
|---|---|---|---|---|
| 1 | Kleiner Heiltrank | Wegerich | heilt 5 | – |
| 10 | Heiltrank | Ringelblume, Wegerich | heilt 10 + 5 % | – |
| 20 | Atemtrank (schwach) | Moorglöckchen | Ausdauer sofort +20 | – |
| 30 | Steinhaut (schwach) | Eisenhut, Golemstein | Defense +2 · 3 min | – |
| 35 | Atemtrank (stark) | 2 Moorglöckchen | Ausdauer sofort +40 | – |
| 40 | Steinhaut (stark) | 2 Eisenhut, Golemstein | Defense +4 · 5 min | – |
| 45 | Moorfeuer (schwach) | Nebelkraut, Eisenhut | Stärke +2 · 3 min | – |
| 50 | Nebelschleier (schwach) | Nebelkraut, Moorglöckchen | Gegner bemerken dich ein Viertel später | – |
| 55 | Moorfeuer (stark) | 2 Nebelkraut, Eisenhut | Stärke +5 · 3 min | kostet 5 LP beim Trinken |
| 60 | Nebelschleier (stark) | 2 Nebelkraut, Moorglöckchen | Gegner bemerken dich erst halb so weit | Fernkampf −3 |
| 65 | Lindentau (schwach) | Lindenblüte, Seelenlicht | heilt 15 | – |
| 70 | Lindentau (stark) | 2 Lindenblüten, Seelenlicht | heilt 20, hebt Nebenwirkungen auf | – |

- **Fehlschlag** („Trüber Sud“, nicht trinkbar) sinkt mit der Stufe: 25 % auf Rezeptstufe, 0 % ab Rezeptstufe + 20. Moment-Bonus „Siedepunkt“: kein Fehlschlag und +50 % XP.
- **Trank-Platz** im Wirkungs-System: höchstens **eine Trank-Wirkung** und **eine Essens-Wirkung** gleichzeitig (Essens-Platz aus 3b). Neuer Trank ersetzt den alten.
- Leeres Fläschchen: Mira und Hedda verkaufen es (2 Splitter), getrunkene Tränke geben es zurück.
- Würzen (Kochen mit Kräutern verlängert Essens-Wirkungen um die Hälfte) – **später**, nicht in Phase 5.

**Quest „Miras Rezeptbuch“** (Mira Kräuterlieb, Trankladen Waldmark; Einführung, leicht). Mira hat ihr altes Rezeptheft an Mutter Hedda verliehen.
Wegerich (5) sammeln → Kleiner Heiltrank am Kessel im Kräuterhaus → nach Rabenmoor zu Hedda (Heft holen; Hedda prüft dich mit 3 Moorglöckchen) → Heft zurück zu Mira.
Lohn: Kräuterkunde-XP (über die Schritte ca. 600), 3 Heiltränke, 80 Splitter, 1 Questpunkt; Mira kauft Tränke wie jeder Händler nach der allgemeinen Regel an (nur was sie führt, zu 80 %).
*(Das Heft ist Erzählung, kein persönliches Rezeptbuch – Rezepte bleiben fest je Level.)*

**Tests 5c:** Sammeln nur mit Sichel und Stufe, Brauen nur am Kessel, schwach/stark nach Level, Nebenwirkung nur bei den starken ab 45, Trank ersetzt Trank, Essen bleibt, Fehlschlag sinkt, Quest im Prüfer und als Welt-Test.

## 5d · Set-Bonus im Kampf

- Rabenset vollständig angelegt: jeder Treffer **gegen** den Helden, der Schaden macht, heilt mit 15 % um 50 % dieses Schadens (nicht über das maximale Leben) – `setHeilung` in der Simulation aufrufen.
- Anzeige: kleines Set-Symbol am Lebensbalken, wenn aktiv; Tooltip „Set 3/3“.
- Allgemein bauen (`SETS`), damit spätere Sets nur Daten sind.
- Das Rabenset ist bis Phase 6 nicht erhältlich – Test mit Testheld.

**Tests 5d:** Bonus nur bei 3/3, nie über Max-LP, nur bei Schaden > 0, Häufigkeit über viele Treffer ≈ 15 %.

## Wer macht was

| Rolle | Aufgabe | Issue |
|---|---|---|
| Integration | 5a, 5b, 5c (System, Kessel, Sichel, Rezepte), 5d; Einbau der Figuren-Teile | #29, #31 + neue Issues 5a–5d |
| Quests | „Miras Rezeptbuch“ als Entwurf | neues Issue |
| Welt | Seelenlichter 20/35/45 (Irrlicht, Grablicht, Nebellicht), Bindestein am Obelisk im Nordwald, Kessel im Kräuterhaus Waldmark prüfen | neues Issue |
| Figuren | Brau-Bewegung am Kessel (wie werk_…), Symbol „(s)“-Leuchten für geladene Waffen, Seelenlichter 20/35/45 in Farbe | neues Issue |

## Fertig, wenn …

- Gegenstände mit eigenen Daten laufen überall, alte Stände laden.
- Eine seltene Waffe lässt sich am Bindestein laden, schlägt 10 % besser, verbraucht Ladungen und ist geladen nicht handelbar.
- Kräuterkunde im Skill-Tab: sammeln, brauen, Tränke mit Wirkung, Miras Rezeptbuch.
- Rabenset-Bonus wirkt im Kampf. Alle Tests grün.

## Offen (Nutzer)

- Trank-Werte (schwach/stark) sind ein Startpunkt – nach dem ersten Spieltest nachschärfen?
