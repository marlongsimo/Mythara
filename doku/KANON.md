# Kanon – Namen und Entscheidungen

Gepflegt von der Rolle Konzept & Review. **Entschieden** = vom Nutzer bestätigt, gilt. **Vorschlag** = noch offen, nicht als fest behandeln.
Zuletzt aktualisiert: 26.11.2026.

## Welt

| Thema | Festlegung | Status |
|---|---|---|
| Name des Spiels | **Riftmere** (Domain riftmere.de, iOS-App „Riftmere“) | entschieden |
| Kontinent | Das **Festland** von Riftmere (Karte im Spiel); Großregionen: Grenzland, Smaragdküste, Fahle Weiten, Glutsande, Hochlande, Ockerlande, Frostkrone, Drachenarm; Meere: Splittermeer (NO), Endloses Meer (SO) | entschieden (Karte) |
| Riftmere / Mythara | Riftmere = Kontinent und Spiel, Mythara = Name der alten Zeit vor dem Riss | Vorschlag |
| Großstädte | ① Graufurt ② Kielmund ③ Grauwacht ④ Glutbrunn ⑤ Erzhalden ⑥ Steinkrone ⑦ Letzthafen | Vorschlag (Weltkonzept) |
| Gebirge | A Smaragdgrat, B Frostkamm, C Glutgrat, D Weiße Zinnen | Vorschlag |
| Zeitlinie | altes Mythara → Magierkrieg → die Wacht → Himmelsriss (Splitter, Splittermeer) → Zerfall der Wacht → heute | Vorschlag |
| Fraktionen | Wacht, Grenzlandbund, Rabenorden, die Freien, Küstenhäuser, Wanderer | Vorschlag |
| Die Insel der Raben-Trilogie | **Aschenwerth** (Brücke statt Kahn in C1, zwei Steinkreise in C2, Rabengrund unter der Gruft in C3) | Vorschlag (Fahrplan) |
| Splitter | Scherben aus der Nacht, als der Himmel riss; machen Wesen „stärker, nicht besser“; sind Geld, Rohstoff und Seelen | entschieden (im Spiel, Quest 3) |

## Figuren

| Name | Rolle | Ort |
|---|---|---|
| Jori | Kind, Quest 1 | Waldmark |
| Hagan Voss | Bürgermeister der Waldmark | Rathaus |
| Brida Wegner | Wegwartin, Quest 2 | Waldmark-Süd |
| Fenna Ried | Marktfrau, Quest 1 | Osthof |
| Odo Kern, Wenzel | Bauer und Knecht, Quest 2 | Osthof |
| Förster Hartwig | Quest 3 | Nordwald |
| Raban, Tilda | Wachen an der Straßensperre | Kreuzwald |
| Othmar Rehn | **Bürgermeister von Weidenhain** (nicht Hanne Kalk) | Weidenhain |
| Hanne Kalk | Verwalterin des Kornspeichers | Weidenhain |
| Gesa Brandt, Bruder Anselm, Köhler Ulf, Till Mahler, Grete Korn | Quests A1–A3 | Waldmark, Nordwald, Osthof |
| Mira Kräuterlieb, Brann Hackebeil, Gerold Dickfell | Händler | Waldmark-Markt |
| geplant: Agnes, Tebbe, **Lambert Schilf** (Angler, bestätigt), **Hilde Krug** (Wirtin, bestätigt) | Phase 3 | Weidenhain, Waldmark |
| geplant: Gisbert Ast, Hauptmann Rotmantel | Phase 4 | Obstwiesen, Unterschlupf |
| geplant: Bertold Krähe, Joost, Mutter Hedda, Harm, Ebbo, Liske, Federmutter Ravena | Phase 6 | Rabenmoor, Aschenwerth |
| Vorschlag: Kord Weller (Fährmann), Merit Stahl (Hauptfrau der Wacht), Alma Furtner (Wirtin „Zur Furt“), Ysolde (Geist der Wächterin) | Phase 7 | Graufurt, Ostufer |

**Vergeben, nicht neu verwenden:** Fenna (Marktfrau), Mira (Händlerin). Jorins Schwester heißt **Liske**.

## Spielregeln (entschieden)

- **Ein Konto, ein Gerät** (Gerätesperre) – bleibt.
- **Schmieden** ist ein eigener Beruf (Esse, Amboss); **Handwerk** behält die Werkbank.
- **Neue Berufe:** Fischen, Kochen, Kräuterkunde, Splitterbinden.
- **Splitterbinden:** keine Splitterwaage. Lädt Teleport-Gegenstände und Waffen (ab Stufe Selten, „… (s)“), 2 Splitter je Ladung, +10 % Werte, 1 Ladung je Angriff, leer = normal. Geladene Waffen **nicht handelbar**; Entladen nur am Bindestein, die Splitter verfallen. Laden **nur am Bindestein**.
- **XP-Kurve:** eigene Riftmere-Tabelle (kein Bezug mehr auf OSRS).
- **Waffen und Rüstungen** heißen nach ihrem Material.
- **Repository:** Altbestand (Würfelspiel, 2D/Phaser-Reste, alte Bodenbilder, ungenutzte Bilder) **wird aufgeräumt** *(26.11., ersetzt „bleibt“)*: einmaliger Auftrag „Aufräumen“, erst Liste mit Nachweis „nirgends verwendet“, der Nutzer gibt frei; Löschen auf `main` nur mit seinem ausdrücklichen einmaligen Okay. Konzept-PDFs, `fabrik/`-Quellen und Supabase-Migrationen bleiben.
- **Abstand zu OSRS:** keine OSRS-Begriffe in Spiel, Code-Kommentaren und Konzepten.

- **Wegstein:** Ladungen (2 Splitter je Ladung) **und** 2 Minuten Abklingzeit. *(26.11.)*
- **Tränke (Kräuterkunde):** Rezepte sind **fest je Level verfügbar**, wie bei der Ausrüstung – kein Entdecken durch Ausprobieren, kein persönliches Rezeptbuch.
  **Nebenwirkungen nur bei den ganz starken Tränken der hohen Stufen.** Niedrige Tränke haben keine Nebenwirkungen, dafür eine deutlich schwächere Wirkung.
  *(26.11.; ersetzt die Abschnitte „Rezepte entdecken“ und „Nebenwirkungen“ in `doku/quests/4-berufe.pdf`)*
- **Angelrute:** nur **eine** Angelrute, **ohne Stufen** (wie der Hammer beim Schmieden). Die Fangchance hängt nur vom Fischen-Level ab. Keine „Lamberts Rute“. Die Reuse bleibt ein eigenes Gerät. *(26.11.)*
- **Rabenküken** (Begleiter, Beute des Obersten Rabenpriesters 1/2000): eine **Mini-Version des Obersten Rabenpriesters**. *(26.11., über den Figuren-Chat)*
- **Lage des Grenzlands auf dem Festland:** fix (kann sich später noch ändern). *(26.11.)*
- **Supabase:** Migrationen 048 und 049 sind eingespielt. *(26.11.)*
- **Essen** (Stand heute): Brot heilt 4, nicht stapelbar, 1,5 s zwischen zwei Bissen, auch im Kampf. Gerichte mit Wirkung kommen mit Kochen (Phase 3b). *(26.11., Erklärung, keine Änderung)*
- **Quest-Lohn über 1.000 XP je Skill** wird gebraucht: neue Migration hebt die Grenze aus 048 an (Vorschlag 50.000 je Skill/Beruf, Issue #41). Bis dahin höchstens 1.000. *(26.11.)*
- **Phase 3** vom Nutzer im Spiel getestet und freigegeben. *(26.11.)*
- **Aufräumen:** Gruppe A freigegeben; Würfelspiel bleibt, bis eine **neue Startseite im Riftmere-Stil** live ist (#78). *(26.11.)*
- **Querverbindungen** 1–9 aus #76 werden in die älteren Quest-Entwürfe eingebaut. *(26.11.)*
- **Vorarbeit begrenzen:** Welt, Figuren und Quests sind bis Phase 10 vorgearbeitet. Bis die Integration aufholt, keine weiteren neuen Regionen; Welt macht Qualität (Wegenetz #89, Grenzland verfeinern #90, Handy-Leistung #91). *(26.11.)*
- **Karte wächst in die Breite, den Quests folgend:** keine Sprünge zu fernen Zielen (Splitterinsel später). Nach Phase 9 werden die angrenzenden Großregionen ausgebaut, dorthin wo die Quests führen – Vorschlag: Phase 10 Smaragdküste (W4, Kielmund, Südstraße von Weidenhain), Phase 11 Hochlande (W5, Furt hinter Grauwacht). *(26.11.)*
- **Quests über Regionsgrenzen:** Regionen greifen ineinander, Quests führen quer über die Karte. Jeder neue Quest-Block hat mindestens eine Quest durch zwei oder mehr ältere Regionen; Figuren und Gegenstände kehren wieder. Erste große Quer-Quest: „Die Karte des Boten“ (Phase 9). *(26.11.)*
- **Offene Welt statt Sperren:** Großregionen sind zu Fuß erreichbar, wer früher hingeht, trägt das Risiko. Quests öffnen nur Abkürzungen (z. B. E1 den Weg durch den Dornenwall im Nordsaum; D1 die **Fähre** – das Ostufer ist auch über den langen Weg durch die Glutsande und einen Pass im Südosten zu Fuß erreichbar, Welt #74). *(26.11.)*
- **Handel zwischen Spielern:** „Handeln“ führt den Helden bis auf **ein Feld** an den anderen heran (das ist die Nähe). Der andere bekommt die Anfrage im Chat: Zeile antippen öffnet das Handelsfenster, oder selbst per langem Drücken „Handeln“. *(26.11.)*
- **Supabase:** Migrationen 050 (Bosszähler) und 051 (Quest-Lohn bis 50.000 XP je Skill) sind **eingespielt**. *(26.11.)*
- **Quest-Abschluss:** eigenes Abschlussfenster (Glückwunsch, Belohnungen, Questpunkte), gutgeschrieben mit „Okay“ (bleibt abholbereit, nichts geht verloren). Passt etwas nicht in den Rucksack, **landet es auf dem Boden** nach den **allgemeinen Boden-Regeln** (kurz privat, dann offen, dann verfällt). **Gebundene Gegenstände** verschwinden nach derselben allgemeinen Zeit, werden dabei aber **nie für andere sichtbar** (nur der Besitzer sieht und hebt sie auf). *(26.11., #77)*
- **Live-Zeiten:** Neues geht nur noch **zweimal am Tag** live, **3:00 und 16:00 Uhr** (deutsche Zeit), mit **15-Minuten-Countdown** im Spiel; **Bugfixes** dürfen jederzeit (kurzer Countdown). Umsetzung #96. *(26.11.)*
- **Verkaufen an Händler:** Jeder Händler kauft **nur Waren, die er selbst führt**, zu **80 % seines Verkaufspreises** (abgerundet). Im Laden ist der Rucksack daneben offen: antippen zeigt den Verkaufspreis, langes Drücken bietet „Verkaufen“. Gebundenes und geladene „(s)“-Ausrüstung kann man nicht verkaufen. *(26.11.)*
- **Kutsche:** gestrichen für Phase 10, das gebaute Modell bleibt liegen (nicht löschen); **Idee für später** als Kutschennetz zwischen den Großstädten (ab etwa 5 Städten, günstige Reise ohne Splitterbinden, kleine Splitter-Senke). *(26.11.)*
- **Trödler** (Wunsch 26.11.): über die Welt verstreute Händler, die **alles Handelbare** ankaufen, aber nur zu **50 %** des normalen Händlerpreises (Grundwert). Gebundenes, „(s)“ und Questgegenstände nicht. Der erste steht im **Rabenmoor** (nicht Kreuzwald/Osthof). Konzept `doku/konzepte/troedler.md`.
- **Handelskontor** (zentraler Marktplatz): als Konzept für später aufgehoben, `doku/konzepte/handelskontor.md`. *(26.11.)*
- **Nicht handelbar (gebunden):** **alle Quest-Belohnungen** (Gegenstände als Questlohn, z. B. Rabenset, Klinge des Grauen Hauptmanns, Rotes Banner) und **geladene Ausrüstung „(s)“**. *(26.11.)*
- **Wachtrüstung** (zweites Set, Phase 8): **vorerst nicht**. Die gebauten Teile bleiben ungenutzt in der Fabrik; E4 gibt stattdessen die Klinge des Grauen Hauptmanns. *(26.11.)*
- **HUD überarbeiten** (26.11., später am Tag): **ja** – kompakt, einfach, möglichst ohne Scrollen; eigener Chat „Oberfläche“, Regeln `doku/konzepte/hud.md`. Die neuen Symbole (#30/#32/#33) bleiben. (Die Gold-UI-Vorlagen von vorher sind kein Muss.) **Nichts einfach so ändern:** jede Oberflächen-Änderung zuerst als Vorschau zeigen und mit dem Nutzer gemeinsam ausarbeiten.
- **Vorarbeit Phase 7** (Graufurt, Fährkette, Ostufer, Grüner Turm) und **Kräuter-Fundstellen (Phase 5)** freigegeben. *(26.11.)*

## Für später (Ideen, noch nicht geplant)

- **Strafe beim Tod** einführen (Wunsch des Nutzers, 26.11.) – Art und Härte noch offen; vor einem Konzept mit dem Nutzer klären.
- Kutschennetz zwischen den Großstädten · Handelskontor (`doku/konzepte/handelskontor.md`) · Splitterinsel

## Offen (Fragen an den Nutzer)

- Rotmantel nach Quest B4: öffentlicher Mini-Boss oder Instanz?
- Bossing allein oder in Gruppen?
- Phase 10: Namen (Smaragdküste, Kielmund, Möwenbucht, „Zum Ankerkraut“, Wrackkapitän, Küstenhäuser)
- Phase 9: Namen (Glutsande, Glutbrunn, Selma Dornfeld, Ruwen Kehl, Hasim Tal, Nalia, Sandmutter).
- Phase 8: Reihenfolge W2/W3 (Konzept nimmt W3 Fahle Weiten zuerst an), Namen (Heidrast, Mette Heider, Äbtissin Gunhild, Wigand Fels, Tjark Sölde, Der Graue Hauptmann)
- Phase 7: Namen (Kord Weller, Merit Stahl, Alma Furtner, Ysolde, Furtklamm), Turmkampf öffentlich oder Instanz, Ostufer mit Blick auf die Glutsande?
- Weltkonzept: Namen (Riftmere/Mythara, Städte), Gebirge A–D, Reihenfolge W2/W3, Splitterinsel
