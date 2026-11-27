# Stand – wo wir im Fahrplan stehen

Gepflegt von der Rolle Konzept & Review. Zuletzt aktualisiert: **27.11.2026, 10:35 UTC**.
Fahrplan: `doku/quests/5-fahrplan.pdf` · Weltkonzept: `doku/quests/6-weltkonzept.pdf` · Arbeitsweise: `doku/ARBEITSWEISE.md`

## Fahrplan (Grenzland)

| Phase | Inhalt | Stand |
|---|---|---|
| 0 | Gerätesperre (ein Konto, ein Gerät) | ✅ live |
| — | Zonen-Umbau (eine Kampfwelt, eine Verbindung je Gerät) | ✅ live |
| — | Fix: Held bewegt sich nach App-Hintergrund wieder | ✅ live |
| 1 | Fundament: Quest-Baukasten (1a–1c), alle drei alten Quests als Daten, Abschluss v2 (Migration 048), Berufe-Liste, Schmieden als Beruf, eigene XP-Kurve | ✅ live |
| — | Fix: Questpunkte aus dem Queststand (Migration 049) | ✅ live |
| 2 | Waldland: Quests A1–A3, Zielscheibe, Kapelle, Bäckerei, Brot, Golem-Beute, Mühle je Spieler | ✅ live |
| 3 | Weidenhain & Riedwiesen – 3a Splitterbinden + Wegstein + B1 · 3b Wirkungen, Fischen, Kochen · 3c B2, Werkstatt Weidenhain, Sterneisen/Kernbaum | ✅ live und vom Nutzer getestet (26.11.) |
| 4 | Westmark & erster Boss: Banditen-Varianten, B3, Boss-Baukasten, Instanzen, B4 Rotmantel | ✅ live (27.11.) – bitte im Spiel testen |
| **5** | **Vorbereitung Moor**: Kräuterkunde, geladene Waffen, Set-Bonus | ✅ live und vom Nutzer getestet (27.11., „ganz gut“) |
| 6 | Raben-Trilogie & Aschenwerth: Rabenpriester, C1–C3, Rabengrund, Bossing | ✅ live (27.11., main 2fbe914b) – **bitte testen**: C1–C3, Federmutter, Oberster Rabenpriester, Kerkermeister |
| 7 | Graufurt zur Stadt, Fährkette, Ostufer, Grüner Turm | 🟡 Systeme + Inhalte fertig auf `claude/systeme` (Systeme hat den Einbau übernommen); Quest-Entwürfe verknüpft; wartet aufs Zusammenführen |
| 8 | Der Weg nach Grauwacht: Fahle Weiten (W3), Grauwacht im Wiederaufbau, Quests E1–E4, Wachtrüstung | 🟡 Systeme + Inhalte fertig auf `claude/systeme` (Systeme hat den Einbau übernommen); Quest-Entwürfe verknüpft; wartet aufs Zusammenführen |
| 9 | Glut und Strom: Glutsande (W2), Glutbrunn, Quests F1–F4, Quer-Quest „Die Karte des Boten“ | 🟡 Systeme + Inhalte fertig auf `claude/systeme` (Systeme hat den Einbau übernommen); Quest-Entwürfe verknüpft; wartet aufs Zusammenführen |
| 10 | Salz und Segel: Smaragdküste (W4), Kielmund, Quests G1–G4, Fischen an der Küste | 🟡 Systeme + Inhalte fertig auf `claude/systeme` (Systeme hat den Einbau übernommen); Quest-Entwürfe verknüpft; wartet aufs Zusammenführen |
| Süden | Dörfer, Arbeits- und Gegnerplätze, kurze Quests S1–S9 entlang der Südstraße | ✅ live (27.11.): Orte, Gegner, Fleisch/Gerichte, Reisende, S1–S9 |
| — | Ganze Welt als Kampfwelt, Gegnerplätze über die ganze Welt (#122, #130), 10 neue Gegner aus Modellen des Nutzers (#138) | ✅ live: Kampfwelt, 10 neue Gegner, Streifgebiete (#143), Orte Haferstedt/Netzbucht/Sandquell (#140/#141), 158 Holz-/Erzstellen (#142) |

## Festland (Weltkonzept)

| Stufe | Inhalt | Stand |
|---|---|---|
| Entwurf | Festland als Gelände und Höhen, Minikarten; Unterschlupf und Ratssaal verlegt | 🟡 im Spiel, ohne Orte, Gegner, Wege |
| W1–W8 | Großregionen mit Großstädten | ⬜ – wartet auf Entscheidungen im Weltkonzept |

## Daneben fertig
- Hintergrundmusik mit Schalter in den Einstellungen
- Förster als eigenes Modell, Splitter-Obelisk als Wahrzeichen
- Waffen und Rüstungen nach Material benannt

## Prozess
- Automatische Server-Tests nach jedem Push: Workflow „Tests“ (35 Tests). 4 rote Tests ausgenommen → Issue #10.
- Issue-Brett mit Rollen-Labels eingerichtet; Startnachrichten und Dauerauftrag je Rolle in `doku/ARBEITSWEISE.md` Abschnitt 6.

## Offen beim Nutzer (`für-dich`)
- Issue #9 erledigt (26.11.): Migrationen 048/049 eingespielt, Grenzland-Lage fix, Namen bestätigt, Wegstein-Abklingzeit, Tränke-Regeln.
- Noch offen: Entscheidungen aus dem Weltkonzept (Namen, Gebirge A–D, Reihenfolge W2/W3, Splitterinsel).

## Die Chats
| Chat | Rolle | Zweig |
|---|---|---|
| Riftmere · Leitstelle | Konzept, Review, Verteilen, Takt stündlich | `claude/relaxed-sagan-erl6lf` |
| Riftmere · Integration | Zusammenführen, Live, Inhalte einbauen, Oberfläche | `claude/welt3d` → `feature/realtime-engine` |
| Riftmere · Aufräumen | Altbestand aufräumen (einmalig, seit 26.11., session_01TxcDgEcDbLo7f245QtC2EJ) | `claude/aufraeumen` |
| Riftmere · Oberfläche | HUD und Fenster überarbeiten (seit 26.11., session_01TxcDgB4mevNoCcMXvpgjvs) | `claude/oberflaeche` |
| Riftmere · Bugs | Fehler beheben (seit 26.11., session_01TxcDgCbmWBUtRdqteuxHgV) | `claude/bugs` |
| Riftmere · Systeme | neue Mechaniken (seit 26.11., session_01TxcDgE5j3LqSdTzrgFQR7Y) | `claude/systeme` |
| Riftmere · Quests | Quests als Daten (seit 26.11.) | `claude/riftmere-quests` |
| Riftmere · Figuren | Figuren, Modelle, Bilder | `claude/tender-heisenberg-bruby2` |
| Riftmere · Welt | Welt, Orte, Karten | `claude/mythara-world-pipeline-z4ynx5` |

## Wer gerade woran arbeitet
| Rolle | Arbeitet an |
|---|---|
| Integration & Inhalte | Phase 3a abgeschlossen, Tests stabilisieren; danach 3b (#4) |
| Figuren & 3D | Symbole neu (#30, #32, #33 fertig); HUD-Prototyp nur zum Ansehen (Wunsch, kein Commit) |
| Worldbuilding | #25 (Orte für Fischen, Taverne) |
| Konzept & Review | Takt, Stand, Kanon |
| Quests | Entwürfe B2, Schilf und Schnur, Taverne (#5, #6) |
