# Phase 3 „Weidenhain & Riedwiesen“

Konzept vom 26.11.2026 (Rolle Konzept & Review). Grundlage: `doku/quests/2-hinter-der-sperre.pdf`, `doku/quests/4-berufe.pdf`.
Baut auf: Quest-Baukasten (`schalter`, `drehen`, Ereignisse `sammeln/herstellen/erlegen/treffen/untersuchen/objekt/aufheben/betreten/benutzen`),
Berufe-Liste (`shared/berufe.ts`), Essen (`brot`, Art „Essen“), Heim-Teleport (`client/src/welt/anschluss.ts`).

**Ziel:** Weidenhain wird das zweite Zentrum, die Riedwiesen das erste Sammelgebiet der neuen Berufe: Splitterbinden mit Wegstein-Teleport,
Fischen und Kochen mit Wirkungs-System, Werkstatt Weidenhain, Rohstoffe über Stufe 35.
**Reihenfolge:** 3a → 3b → 3c, jeder Teil für sich live-fähig.
**Vorbedingungen:** Migrationen 048/049 eingespielt; Lage des Grenzlands auf dem Festland festgelegt.

---

## 3a · Splitterbinden und Wegstein (ca. 1–1,5 Arbeitstage)

| Baustein | Was | Wo |
|---|---|---|
| Beruf Splitterbinden | Eintrag in `shared/berufe.ts` (Symbol, Texte), Station `bindestein`; startet für alle bei 0 | `berufe.ts`, `handwerk.ts` |
| Bindestein | Station an der Linde im Steinring (Weidenhain); nutzbar nur mit Schalter `bindestein_linde` (B1). Später Obelisk (Nordwald), Schrein (Aschenwerth) | Werkstätten, Quest-Schalter |
| Wegstein | Gegenstand `wegstein`, untauschbar, einer je Spieler; **Ladungen als Wert im Inventar** (`inventar.ladungen.wegstein`), nicht am Gegenstand (Gegenstände mit eigenen Daten erst in Phase 5) | `gegenstaende.ts`, `server/src/inventar.ts` |
| Laden am Bindestein | 2 Splitter → 1 Ladung, oder 1 Splitter + 1 Seelenlicht → 1 Ladung; Splitterbinden 1; 2 XP je Ladung; Stapel 1/10/50/alle; höchstens 100 Ladungen | Rezepte mit Station `bindestein` |
| Resonanz | Moment-Bonus wie Kernschlag/Glut: 12 %, binnen 1,5 s tippen → doppelte Ladungen, +50 % XP | wie `sammeln.ts` / Glut |
| Seelenlichter | Sammelziele ohne Werkzeug, Datei `seelenlicht_standorte.json`; Ertrag Gegenstand **Seelenlicht** (stapelbar) + XP; 25 % Splitter-Fund | `shared/`, Server-Sammeln, `welt3d` |
| Teleport vom Server | Nachricht `{t:"wegstein", ziel}`: Server prüft Ziel frei, Ladung, nicht im Kampf, Abklingzeit 2 min; zieht Ladung ab, `stelleMerken`, Antwort `{t:"wegstein", ok, x, y, region}`, setzt den Helden in der Kampfwelt um (wie `abreise(teleport)`). **Der Browser setzt keine Position mehr selbst.** Heim-Teleport (T, 5 min) über denselben Weg | `server/src/welt.ts`, `index.ts`, `client/src/welt/anschluss.ts` |
| Ziel-Liste | `shared/wegstein.ts`: Ziel → Weltfeld + Bedingung (`weidenhain_linde` nach B1, `osthof_muehle` nach A3) | `shared/` |

**Seelenlichter Phase 3:** Stufe 1 „Mattes Licht“ um die Linde (8 XP) · Stufe 10 „Wiesenlicht“ in den Riedwiesen (2–3 Stellen) und an der Quelle der Obstwiesen (15 XP).

**Quest B1 „Der Wegstein“** – Agnes an der Linde. Voraussetzung: Die gesperrte Straße, Holzfällerei 15, Handwerk 10.
Schritte: ansprechen → Quellstein und Quellwasser an der Quelle der Obstwiesen (`objekt`) → Totholz der Linde (Quest-Baum, Holz 15, fällt nie) →
250 Splitter an Agnes (`nehmen`) → „Wegstein (ungeweiht)“ an der Werkbank (Quest-Rezept, Handwerk 10) → am Erntefeuer weihen (`benutzen`) → zurück, erstes Laden.
Lohn: Wegstein, 10 Ladungen, Splitterbinden-XP, 400 Magie-XP, 1 Questpunkt. Schalter `bindestein_linde`, Ziel `weidenhain_linde`. Verlust: Agnes gibt neuen (Ladungen bleiben).

**Tests 3a:** Laden (2:1, mit Seelenlicht, Stapel, Resonanz, Höchstwert) · Teleport abgelehnt ohne Ladung/im Kampf/Abklingzeit/gesperrtes Ziel; erfolgreich mit Server-Position, Ladung weniger, Kampfwelt am Ziel, Mitspieler sieht den Helden dort (zwei Browser) · Seelenlicht Stufe 10 gesperrt unter Splitterbinden 10 · B1 im Prüfer und als Welt-Test.

---

## 3b · Wirkungen, Fischen, Kochen (ca. 1,5–2 Arbeitstage)

**Wirkungs-System (zuerst):** `{ id, werte, bis }`, vom Server geführt und im Kampf eingerechnet (`kampfwerteVon`); HUD-Symbol mit Restzeit.
Höchstens **eine Essens-Wirkung** gleichzeitig (neue ersetzt alte); Trank-Platz folgt in Phase 5. Läuft beim Abmelden weiter ab.

**Fischen**
| Stufe | Fisch | XP | Wo | Gerät | gekocht heilt |
|---|---|---|---|---|---|
| 1 | Bachling | 20 | Bach der Obstwiesen, Mühlgraben Weidenhain, Ried am Moorrand (Riedwiesen) | Angel + Würmer | 3 |
| 10 | Mühlbarsch | 35 | Mühlgraben (nach B2 auch Wehrkolk) | Angel + Würmer | 5 |
| 20 | Moorhecht | 60 | Rabenmoor, Joosts Steg | Reuse | 7 |

Fanggründe als Standort-Datei · Angel (Handwerk 1 oder Training-Angel beim Handwerker), Reuse (Handwerk 20, Tannenholz + Garn); Werkzeugstufe wirkt auf die Chance ·
Würmer graben an den Äckern des Osthofs · Moment-Bonus „Strömung lesen“ · 25 % Splitter-Fund.

**Kochen**
| Stufe | Gericht | Zutaten | Station | heilt | Wirkung |
|---|---|---|---|---|---|
| 1 | Gebratener Bachling | Bachling | Feuer | 3 | – |
| 1 | Brot (vorhanden) | Mehl + Wasser | Backofen | 4 | – |
| 10 | Gebratener Mühlbarsch | Mühlbarsch | Feuer | 5 | – |
| 15 | Fischsuppe | Mühlbarsch + Wasser | Kessel | 6 | Defense +2 · 5 min |
| 20 | Moorhecht am Spieß | Moorhecht | Feuer | 7 | – |
| 25 | Bauerneintopf | Kuhfleisch + Mehl + Wasser | Herd | 8 | Ausdauer erholt sich 25 % schneller · 10 min |

Stationen: Feuer (Erntefeuer Weidenhain, Torffeuer Rabenmoor, Rastplatz Osthang), Backofen (Bäckerei Waldmark nach A3), Herd + Kessel (Taverne Waldmark nach Quest).
Rohstoffe: Mehl (Till nach A3), Wasser (Krug am Brunnen), Kuhfleisch (zweite Kuh-Beute, 100 %). Anbrennen sinkt mit der Stufe (0 bei +30). Moment-Bonus „Garpunkt“.

**Quests:** „Schilf und Schnur“ (Lambert Schilf, Mühlgraben Weidenhain): Angel, Würmer, 3 Bachlinge, einen braten → Lamberts Rute, XP, 1 Questpunkt.
„Die Taverne öffnet“ (Hilde Krug, Taverne Waldmark; Kochen 10): Brot, gebratener Bachling, Fischsuppe → Schalter `taverne_offen` (Herd, Kessel, Verkauf), Kochen-XP, 80 Splitter, 1 Questpunkt.

**Tests 3b:** Fischsuppe gibt Defense +2 im Kampf (Server), Ersetzen, Ablaufen · Fischen (Stufen, Werkzeug, Köder, Moment-Bonus) · Kochen (Stationen nur mit Schalter, Anbrennen, Kuhfleisch) · beide Quests im Prüfer und als Welt-Test.

---

## 3c · Mühle Weidenhain, Werkstatt, Rohstoffe (ca. 1 Arbeitstag)

**Quest B2 „Wasser auf die Mühle“** – Tebbe (Wassermühle), Hanne Kalk (Kornspeicher). Voraussetzung: Holz 10, Bergbau 10, Handwerk 15.
Schritte: drei Überläufe untersuchen (Texte verraten die Reihenfolge) → 6 Tannen → 3 Schütztafeln (Quest-Rezept, Werkbank) → 6 Eisenerz → 3 Barren →
6 Eisenbänder (Quest-Rezept, Amboss, Schmieden) → 4 Hanf → Garn → Hanftau (Quest-Rezept) → einbauen in der Reihenfolge Mitte, stromab, oben (Questobjekte mit `nach`; falsche Tafel = nur Text) → Abgabe.
Lohn: 300 Splitter, 300 Schmieden-XP (Abschluss), 1 Questpunkt. Schalter: `wehr_heil` (Mühlrad dreht, Fanggrund Wehrkolk), `werkstatt_weidenhain` (Esse, Amboss, Werkbank in Tebbes Schuppen), `hanne_mehl` (Hanne verkauft Mehl).

**Rohstoffe:** Sterneisen (Bergbau 35) – neue Senke in der Westmark, 3 Adern · Kernbaum (Holz 45) – Hain am Westrand der Riedwiesen, 4 Bäume. Beide sind in `bergbau.ts`/`holz.ts` schon definiert.

**Tests 3c:** B2 vollständig mit Reihenfolge · Mühlrad dreht bei A, nicht bei B (wie `muehle-ui`) · Werkstatt erst nach B2 · Sterneisen/Kernbaum nur ab Stufe.

---

## Fertig, wenn …
- 3a: Wegstein/Laden/Teleport über den Server, Seelenlichter sammelbar, B1 spielbar
- 3b: Fischen und Kochen im Skill-Tab, Essen mit Wirkung, beide Einführungsquests, Taverne
- 3c: B2, Mühlrad, Wehrkolk, Werkstatt Weidenhain, Sterneisen und Kernbaum in der Welt
- alle bestehenden Tests grün, Prüfer nimmt die neuen Quests mit
