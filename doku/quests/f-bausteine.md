# Phase 9 – Quests F1–F4 und „Die Karte des Boten“: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Grundlage: `doku/konzepte/phase-9.md` (neuer Grundsatz: Quests über Regionsgrenzen). Alle Namen sind Vorschläge.
Dateien: `realtime/shared/quest_f1.ts` … `quest_f4.ts`, `quest_karte.ts`, Stellen in `quest_f_orte.ts`. Alle als **Entwurf** in `shared/quest_entwuerfe.ts`.
Lohn nach Migration 051 (bis 50.000 je Skill), mit Maß: F1–F4 je 2.000–5.000, die Karte des Boten je 6.000 in fünf Kampfskills. Der Prüfer meldet jetzt erst über 50.000.

**Stellen:** in den älteren Regionen echt (Kord, Merit, Hagan, Hedda, Ysolde, Sarkophag in `hauptmann_gruft`). Die **Glutsande sind Platzhalter**
östlich des Ostufers. Sobald die Welt sie anlegt, werden die Stellen nur in `quest_f_orte.ts` umgestellt.

## Querverbindungen in Block F (Grundsatz Phase 9)

| Quest | quer durch |
|---|---|
| F1 | Start in **Graufurt** (Kord, Phase 7) → **Ostufer** (Fähre) → Glutsande → Glutbrunn |
| F2 | Pfannenblech aus **Schwarzeisen vom Burgfels in Grauwacht** (Phase 8) |
| F4 | Salz aus F2, Glutwels nur mit **Fischen 65 / Kochen 65** |
| Karte des Boten | **Waldmark** (Hagan) · **Rabenmoor** (Hedda, Steinhaut aus Kräuterkunde 5c) · **Graufurt** (Merit) · **Grauwacht** (Grab des Hauptmanns, nach E4) · **Glutsande** (Tempel, nach F3); Start und Ende bei **Ysolde** (Ostufer, D2). Am Ende zeigt die Karte die Nachbarregionen: **Smaragdküste/Kielmund** (südlich von Weidenhain) und die **Hochlande** (hinter der Furt bei Grauwacht) – nicht die Splitterinsel (Nutzer 26.11.) |

## Für den Motor (Rolle Spiel)

| # | Baustein | Wo | Vorschlag |
|---|---|---|---|
| 1 | **Figur in mehreren Quests** | Kord (D1, F1), Ysolde (D2, Karte), Hagan (Quest 1, Karte), Hedda (Mira, C2, C3, Karte), Merit (D1, D2, E1, Karte) | Laut Konzept seit #48 da – auf `feature/realtime-engine` und `claude/welt3d` finde ich es noch nicht (`motorReden` nimmt die erste Quest). Der Prüfer meldet es weiter als „wartet auf“ |
| 2 | **Lohn bis 50.000** | alle F-Quests | Migration 051 ist laut Kanon eingespielt, aber auf keinem Zweig, den ich sehe. Außerdem kappt `questmotor.ts` (Zeile 124) Berufe-XP noch mit `Math.min(1000, n)` |
| 3 | **Reisekarte** | Lohn der Karte des Boten | Gegenstand `reisekarte` (gebunden), zeigt alle Wegstein-Ziele, einmal am Tag ein Wegstein-Sprung ohne Ladung (Zähler je Konto und Tag) |
| 4 | **Spiegel-Rätsel** | F3: drei Spiegelplatten, Reihenfolge über `nach` (geht schon). Optisch: Licht lenken | Lichtstrahl als Weltzustand je Spieler (Schalter `f3_spiegel_1–3` erledigt) |
| 5 | **Instanz** | F3: Kammer der Sandmutter, Schalter `tempel_kammer_instanz` | wie Rotmantel / Oberster |
| 6 | **Gegner, die `erlegen` melden** | `karawanenraeuber` (F1, 3×), `glutskorpion` (F2, 5×), `glutgeist` (F3, 3×), `sandmutter` (F3) | Sand-Auftauchen, Gift, Flackern laut Konzept |
| 7 | **Ereignis `betreten`** | F3: Region `glut_tempel` | Name der Region von der Welt |
| 8 | **Rezepte** | `pfannenblech` (Amboss, Schmieden 50, 2 `barren_schwarzeisen`, Quest-Rezept F2), `glutwels_salzkruste` (Herd, Kochen 65, Glutwels + Salz; erst nach F4 frei: Sperre bei „neu“) | |
| 9 | **Fischen 65** | F4: Fang meldet `{ art: "sammeln", ziel: "glutwels" }` | wie `bachling`, `wels` |
| 10 | **Schalter** | `ruwen_salz` (F2, Ruwen verkauft Salz), `ureisen_tafelberge` (F3) | |
| 11 | **Wegstein-Ziel** | Glutbrunn (F1) | `shared/wegstein.ts` |
| 12 | **Steinhaut (schwach)** | Karte, Stück 2: `steinhaut_schwach` (Kräuterkunde 30, Phase 5c) | Kennung aus 5c übernehmen |

## Gegenstände

| Kennung | Was |
|---|---|
| `kords_brief` | F1, Questgegenstand (Kord gibt Ersatz) |
| `pfannenblech` | F2, Quest-Rezept |
| `salz` | Rohstoff (Kochen 65), F2 gibt die ersten 5, danach bei Ruwen |
| `tempelabschrift` | F3, Abschrift der Inschrift |
| `glutwels_salzkruste` | F4, Gericht (Konzept: heilt 12, Ausdauer +10 % · 10 min) |
| `kartenstueck_1` … `_5` | Karte des Boten, Questgegenstände |
| `reisekarte` | Lohn der Karte, gebunden |

## Querverbindungen in älteren Entwürfen (Nutzer 26.11.: 1–9 eingebaut, 10 später)

| # | Quest | eingebaut | neu für die Rolle Spiel |
|---|---|---|---|
| 1 | D3 | Alma will Mehl von **Hanne Kalk** (Weidenhain) für die Welspastete | Rezept `welspastete`: Wels + `mehl` |
| 2 | E2 | neuer erster Schritt `rezept`: **Merit Stahl** in Graufurt kennt das Rezept der Glockenbronze (Kupfer aus der Senke vor der Waldmark, Splittereisen aus der Furtklamm) | – |
| 3 | E1 | neuer Schritt `othmar`: **Othmar Rehn** in Weidenhain gibt einen Brief für Gunhild mit; Abgabe nur mit dem Brief | Gegenstand `othmars_brief` |
| 4 | C3 | neuer Schritt `weihen`: das Moorwasser am **Bindestein an der Linde** (Weidenhain) weihen, erst dann trübt es das Becken | Gegenstand `moorwasser_geweiht` |
| 5 | D1 | neuer Schritt `pech`: die Schmiedin will **Meilerpech von Köhler Ulf** (Nordwald, 3 Tannenstämme) für das Kettenschloss | `meilerpech` (wie C1) |
| 6 | C1 | neuer Schritt `gisbert`: **Gisbert Ast** (Obstwiesen) sagt, welche Moorweiden taugen | – |
| 7 | E3 | Tjark ist ein **Vetter von Raban** (Straßensperre, Quest 1) – eine Gesprächsantwort bei Tjark. Raban selbst bleibt an der Sperre (er steht in Quest 1 fest dort) | – |
| 8 | Mettes Schafe | Mette will eine **Ringelblume aus den Obstwiesen** in den Eintopf | Rezept `hammeleintopf`: Hammelfleisch + Wasser + `ringelblume` |
| 9 | C1 (statt B4) | Wer das **rote Banner aus B4** trägt, dem zeigt Bertold das Rabenzeichen darunter (Gesprächsantwort). In C1 statt B4, damit B4 vor dem Einbau unverändert bleibt | – |

Punkt 10 (Selma reist nach Graufurt) kommt später.
