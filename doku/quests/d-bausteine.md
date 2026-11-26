# Phase 7 – Quests D1–D3: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Die Quests stehen in `realtime/shared/quest_d1.ts`, `quest_d2.ts` und `quest_d3.ts`, als **Entwurf** in `shared/quest_entwuerfe.ts`.
Grundlage: `doku/konzepte/phase-7.md`. Alle neuen Namen sind Vorschläge (Kord Weller, Merit Stahl, Alma Furtner, Ysolde, Furtklamm, „Zur Furt“).
Die **Stellen sind vorläufig**: in Graufurt aus der heutigen Region, am Ostufer Platzhalter östlich von Graufurt. Sobald #36 (Orte) und #37 (Figuren) fertig sind, trägt die Rolle Quests die echten Stellen und Modelle ein.

## Für den Motor und die Datenbank (Rolle Spiel)

| # | Baustein | Warum | Vorschlag |
|---|---|---|---|
| 1 | **Lohn über 1.000 XP** | D1: 2.500 Schmieden-XP. D2: je 2.000 Stärke, Geschick, Defense. Migration 048 kappt je Skill und Beruf bei 1.000, der Rest ginge stillschweigend verloren | Neue Migration mit höherer Grenze (z. B. 5.000), mit Rückbau und Test. **Oder** die Leitstelle senkt den Lohn im Konzept auf 1.000. Der Prüfer meldet das als „Lohn … über 1.000“ |
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
| `kord` | Kord Weller (D1) | 6718 · 6513,2 – heutige Dorffigur `faehrmann`, wird Questfigur | `npcmann3d` |
| `kord_ost` | Kord Weller am Ostanleger (D2, eigene Figur) | Platzhalter 6790,5 · 6513,5 | `npcmann3d` |
| `merit` | Merit Stahl (D1, D2) | 6679,5 · 6502,5 vor dem Bergfried | `stadtwache3d` |
| `schmiedin` | Die Schmiedin (noch ohne Namen) | 6690,5 · 6512,5 | `npc.schmied` |
| `ysolde` | Ysolde, Geist (D2) | auf dem Turmdach | `npc.ysolde` (neu, durchscheinend, grün) |
| `alma` | Alma Furtner (D3) | 6696,5 · 6520,5 | `npcfrau3d` |

Ysolde steht immer auf dem Dach. Bevor das Feuer erlischt, „flackert“ sie nur (eigene Rede). Soll sie erst danach sichtbar sein, braucht es eine Sichtbarkeits-Bedingung für Questfiguren (Baukasten).
