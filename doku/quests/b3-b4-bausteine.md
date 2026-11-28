# Quests B3 „Fallobst“ und B4 „Das rote Banner“ – was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Die Quests stehen in `realtime/shared/quest_b3.ts` und `quest_b4.ts`, vorerst als **Entwurf** in `shared/quest_entwuerfe.ts`.
Der Prüfer (`test/questbau.test.mjs`) prüft sie mit und listet fehlende Bausteine als „wartet auf …“. Orte aus Issue #21, Figuren aus #19.

## Für den Motor (Rolle Spiel)

| # | Baustein | Warum | Vorschlag |
|---|---|---|---|
| 1 | ~~Figur in mehreren Quests~~ | erledigt mit #48 (`questbau.figurQuest`, Zweig `claude/systeme`): Othmar spricht in Quest 1, B3 und B4 | – |
| 2 | **Wellen in der Halle** | B4 „halle“: 2 Wellen à 3 in einer eigenen Kopie der Versammlungshalle | Schalter `halle_instanz` (läuft, Schlüssel erledigt, Halle offen; #61). Die Integration trägt die Halle mit `welle: "unterschlupf_welle"` in `shared/bosse.ts` ein, jede gefallene Welle meldet `erlegen` `unterschlupf_welle` |
| 3 | **Instanz der Kammer** | B4 „rotmantel“: Kammer `rotmantel_kammer` je Spieler | Schalter `rotmantel_instanz` (Quest läuft) → `kammer_tuer` führt in die eigene Kopie. Danach `rotmantel_oeffentlich` (Quest fertig) → gemeinsame Kammer mit dem Mini-Boss |
| 4 | **Tür mit Schlüssel** | Tür zum Beutelager (Felder 10270–10275 \| 9644) | Schalter `beutelager_offen`: an mit dem Schlüssel (Schritt erledigt) oder nach der Quest |
| 5 | **Boss Rotmantel** | B4 „rotmantel“ | Gegnertyp `rotmantel`, meldet `erlegen`. Werte und Phasen laut `phase-4.md` |
| 6 | **Bedingte Beute** | Bedingungen in der Quest (`beute`) | `b3_karrenbrief` (Späher, kleine Chance) und `b3_karrenbrief_sicher` (ab Zähler 4, **Chance 100**: garantiert beim 5., #61), `b4_schluessel` (Wachstubenführer), `b4_rabenbrief` (Rotmantel in der Instanz, chance 100) |
| 7 | **Schalter** | B3 | `leiter_unterschlupf` (Leiter in der Hütte erst nach den Kisten), `gisbert_aepfel` (Gisbert verkauft Äpfel) |

Gegnertypen: `bandit_spaeher` (B3 zählt 5), dazu `bandit_schlaeger`, `bandit_armbrust` für die Wachstube und die Wellen. Die Modelle kommen aus #19: `bandit3d_spaeher`, `bandit3d_schlaeger`, `bandit3d_armbrust`, `banditenboss3d`.

## Gegenstände (`gegenstaende.ts`, Bilder aus #19 in `img/objekte3d/beute/symbole/`)

| Kennung | Was |
|---|---|
| `karrenbrief` | Questgegenstand, B3 |
| `apfelkisten` | Questgegenstand: Gisberts drei Kisten „getragen“ |
| `apfel` | Essen, heilt 2, stapelbar (Lohn B3: 10) |
| `schluesselbund` | Questgegenstand, B4 |
| `silberleuchter` | Questgegenstand, B4 (geht an Othmar) |
| `rabenbrief` | Questgegenstand: Brief mit Rabensiegel |
| `rotes_banner` | Trophäe, bleibt beim Spieler |

Die Waffe nach Wahl in B4 nutzt vorhandene Gegenstände: `eidschwert`, `eidzweihaender`, `mondkurzbogen`, `sternenszepter`. Sie kommt über `geben` in einer von vier Abschluss-Antworten. Das kann der Motor schon.

## Figuren und Stellen

| Was | Stelle | Modell |
|---|---|---|
| Gisbert Ast | 6562,5 · 6691,5 (bei seinen leeren Kisten) | `npc.gisbert` |
| Othmar Rehn | 6451,5 · 6688,5 (wie in Quest 1) | `npc.alter_bauer` |
| Gesa Brandt an der Hütte | 6299,5 · 6586,5 (eigene Figur `gesa_huette`, nicht die Gesa vom Südtor) | `stadtwache3d` |
| Spuren | 6550,5 · 6700,5 / 6541,5 · 6711,5 / 6533,5 · 6722,5 | Stelle |
| Kisten hinter den Fässern | 6305,6 · 6586,6 | Stelle |
| Kartentisch | 10273 · 9631,5 (Interaktion `karte_tisch`) | Stelle |
| Truhe im Beutelager | 10273 · 9658,6 (Interaktion `beute`) | Stelle |
| Rotes Banner | 10450,5 · 9606,5 (hinter dem Thron) | Stelle |

## Abweichungen vom Konzept
- „Ohne A1: namenlose Wache“: Gesa Brandt steht immer an der Hütte. Eine Figur mit wechselndem Namen kann der Baukasten nicht.
- Heldenlevel 25 ist für B4 nur empfohlen (steht im Questlog), Voraussetzung ist Defense 20 und B3.
