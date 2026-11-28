# Phase 7 – Quests D1–D3: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Die Quests stehen in `realtime/shared/quest_d1.ts`, `quest_d2.ts` und `quest_d3.ts`, als **Entwurf** in `shared/quest_entwuerfe.ts`.
Grundlage: `doku/konzepte/phase-7.md`. Alle Namen sind vom Nutzer bestätigt (27.11.) (Kord Weller, Merit Stahl, Alma Furtner, Ysolde, Furtklamm, „Zur Furt“).
Die **Stellen stammen aus der Welt (#36)**, vom Zweig `claude/mythara-world-pipeline-z4ynx5`: Regionen `graufurt`, `ostufer`, `turm_ebene1`–`3`, `turm_dach`. Die Modelle sind vorläufig, bis #37 fertig ist.

## Für den Motor und die Datenbank (Rolle Spiel)

| # | Baustein | Warum | Vorschlag |
|---|---|---|---|
| 1 | ~~Lohn über 1.000 XP~~ | erledigt: Die Leitstelle hat das Konzept korrigiert (D1: 1.000 Schmieden, 1.000 Bergbau · D2: je 1.000 Stärke, Geschick, Defense, 500 LP). Die Grenze aus Migration 048 gilt | – |
| 2 | **Figur in mehreren Quests** | Merit Stahl steht in D1 (Erlaubnis) und D2 (Abgabe). Wie Othmar in B3/B4 (siehe `b3-b4-bausteine.md`) | wie dort |
| 3 | **Fähre** | Überfahrt Westanleger ↔ Ostanleger, nur mit Schalter `faehre_frei` (D1 fertig) | Wie der Wegstein-Teleport über den Server, mit kurzer Blende. Ohne Schalter sagt der Fährmann, warum nicht |
| 4 | **Wappentür des Turms** | D2 „tuer“ | Questobjekt `d2_tuer`. Die Tür im Gehraster ist je Spieler offen, sobald der Schritt erledigt ist (`erledigt: ["tuer"]`) oder D2 fertig ist. A2 ist über D1 schon Voraussetzung |
| 5 | **Kampf im Turm** | D2: `turmwaechter` (zählt 2, Ebene 1 und 2), `gruenlicht` (Dach) | Gegnertypen, die `erlegen` melden. Rundumschlag aus dem Boss-Baukasten (Phase 4). Instanz oder öffentlich: offene Frage im Konzept |
| 6 | **Wegstein-Ziel Ostufer (Turm)** | D2-Lohn | Eintrag in `shared/wegstein.ts` mit `quest: "ostufer_das_gruene_licht"`, `wenn: { phase: ["fertig"] }` |
| 7 | **Rezepte** | D1 „glieder“, D3 „pasteten“ | `kettenglied` (Amboss, Schmieden 45, 1 `barren_splittereisen` → 1 Glied, Quest-Rezept) · `welspastete` (Herd, Kochen 45, Wels + Mehl, normales Rezept) |
| 8 | **Fischen 45** | D3 „welse“ | Fischen meldet `{ art: "sammeln", ziel: "wels" }` (wie `bachling` in „Schilf und Schnur“) |
| 9 | **Schalter** | | `faehre_frei` (D1), `alma_pastete` (D3: Alma verkauft Welspastete) |

## Gegenstände

| Kennung | Was |
|---|---|
| `kettenglied` | Questgegenstand, stapelbar (8 für die Winde) |
| `kettenschloss` | Questgegenstand, von der Schmiedin |
| `splitterkern_gruen` | Questgegenstand, aus dem Signalfeuer, geht an Merit |
| `fisch_wels_roh` (Fang) / `welspastete` | Fischen 45 / Kochen 45 |
| `wappenabrieb` | gibt es (A2). Merit will ihn sehen; wer ihn nicht mehr hat, kann sich auf Bruder Anselm berufen |

## Figuren (Modelle aus #37)

| Kennung | Name | Stelle (vorläufig) | Modell (vorläufig) |
|---|---|---|---|
| `kord` | Kord Weller (D1) | 6717,8 · 6515,6 – heutige Dorffigur `faehrmann` (graufurt 61,8 | 115,6), wird Questfigur | `npcmann3d` |
| `kord_ost` | Kord Weller am Ostanleger (D2, eigene Figur) | 6736,4 · 6515,4 (Ostanleger 80,4 | 113,4) | `npcmann3d` |
| `merit` | Merit Stahl (D1, D2) | 6677,5 · 6484,5 vor dem Bergfried (Tür 21,5 | 82,6) | `stadtwache3d` |
| `schmiedin` | Die Schmiedin (noch ohne Namen) | 6675,5 · 6540,5 vor der Schmiede (Tür 19,5 | 138,6) | `npc.schmied` |
| `ysolde` | Ysolde, Geist (D2) | 10994 · 9617,2 neben dem Signalfeuer (turm_dach 16 | 17,2) | `npc.ysolde` (neu, durchscheinend, grün) |
| `alma` | Alma Furtner (D3) | 6700,5 · 6542,5 vor der Taverne „Zur Furt“ (Tür 44 | 140,6) | `npcfrau3d` |

| Questobjekt / Pfeil | Stelle |
|---|---|
| `d1_winde` | 6716,1 · 6511,8 (Interaktion `winde_westanleger`) |
| Furtklamm (Pfeil Erz) | 6690,4 · 6444,6 |
| `d2_tuer` | 6840 · 6519 (Interaktion `turm_wappentuer`, ostufer 56 | 119) |
| Turmwächter (Pfeil) | 10896,5 · 9614,5 (turm_ebene1) |
| `d2_buch` | 10960 · 9616,4 (Interaktion `waechterbuch`) |
| `d2_feuer` | 10992 · 9617,2 (Interaktion `signalfeuer`) |
| Fischplatz (Pfeil Welse) | 6717,4 · 6526 |

Ysolde steht immer auf dem Dach. Bevor das Feuer erlischt, „flackert“ sie nur (eigene Rede). Soll sie erst danach sichtbar sein, braucht es eine Sichtbarkeits-Bedingung für Questfiguren (Baukasten).
