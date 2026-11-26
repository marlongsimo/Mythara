# Phase 8 – Quests E1–E4 und zwei Nebenquests: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Grundlage: `doku/konzepte/phase-8.md`. Alle Namen sind Vorschläge (dazu neu: Schwester Ida in E2, Bolko in E3, nur in Dialogen).
Dateien: `realtime/shared/quest_e1.ts` … `quest_e4.ts`, `quest_e_neben.ts` („Mettes Schafe“, „Ruhelose Gräber“), Stellen in `quest_e_orte.ts`.
Alle als **Entwurf** in `shared/quest_entwuerfe.ts`. Lohn höchstens 1.000 je Skill (Migration 048).

**Stellen sind Platzhalter**: Die Fahlen Weiten gibt es in der Welt noch nicht. Nur der Dornenwall am Uferweg-Nord im Nordsaum (307,5 | 46) ist echt.
Sobald die Welt die Regionen anlegt, werden die Stellen nur in `quest_e_orte.ts` umgestellt.

## Für den Motor (Rolle Spiel)

| # | Baustein | Wo | Vorschlag |
|---|---|---|---|
| 1 | **Figur in mehreren Quests** | Merit (D1, D2, E1), Gunhild (E1, E2, Gräber), Mette (E1, Schafe), Wigand (E3, E4) | siehe `b3-b4-bausteine.md` |
| 2 | **Figur wird Gegner** | E3: Tjark Sölde. Antwort „Ergib dich“ → er greift an. Sein Tod (`erlegen` `tjark_soelde`) erledigt den Schritt | `Folge.angriff: "tjark_soelde"`: die Figur verschwindet, ein Gegner erscheint an ihrer Stelle (nur für diesen Spieler) |
| 3 | **Wahl im Stand** | E3: überredet oder besiegt. Heute zeigt nur der Gegenstand `tjarks_eid`, welcher Weg es war; `grauwacht_stufe2` gilt für beide | Bit „Wahl“ im Stand, eine Bedingung `wahl: "frieden"` (dieselbe Technik wie die Zufalls-Reihenfolge in C2) |
| 4 | **Stadtstufen** | Schalter `grauwacht_stufe1` (E1), `grauwacht_stufe2` (E3), `grauwacht_stufe3` (E4) | Objekte und NPCs der Stadt mit `nurMitSchalter` (Gruppen, Konzept) |
| 5 | **Weg frei** | E1: `nordsaum_frei` öffnet den Dornenwall (Questobjekte `e1_dornen_1–3`) | wie die Baumstamm-Schranken aus Quest 1 (`schranken`/`freigaben`) |
| 6 | **Glocke als Weltereignis** | E2: `glocke_laeutet` – stündlich für alle, Wiedergänger 1 min friedlich | Weltuhr; die Bedingung gilt für irgendeinen Spieler (das Läuten hören alle) |
| 7 | **Bindestein Abtei** | E2: Schalter `bindestein_abtei` | Werkstatt mit `schalter` wie an der Linde |
| 8 | **Instanz** | E4: `grab_hauptmann` (eigene Region im Untergrund), Schalter `hauptmann_instanz` | wie Rotmantel (B4) |
| 9 | **Gegner, die `erlegen` melden** | `heidewolf_rudelfuehrer` (E1), `heidewolf` (Schafe, 5×), `tjark_soelde` (E3), `grabwaechter` (E4, 2×), `grauer_hauptmann` (E4) | |
| 10 | **Bedingte Beute** | `e4_klinge` (Grauer Hauptmann, chance 100 in der Quest) | |
| 11 | **Rezepte** | `glockenbronze` (Esse, Kupfer + Splittereisen → `barren_glockenbronze`), `glocke` (Ofen der Abtei, 4 Glockenbronze → `glocke_neu`), `kloeppel` (Werkbank, Kernbaumstamm → `kloeppel`), `hammeleintopf` (Herd, Hammelfleisch + Wasser) | Quest-Rezepte außer `hammeleintopf` |
| 12 | **Sammelziel** | `grablicht` (Seelenlicht 35) | |
| 13 | **Wegstein-Ziele** | Heidrast (E1), Grauwacht (E4) | `shared/wegstein.ts` |
| 14 | **Bedingung „Skill“ im `braucht` eines Objekts** | E1: Dornenranke braucht Holzfällerei 40 | geht schon (`gilt` mit Kontext) – bitte im Server prüfen |

## Gegenstände

| Kennung | Was |
|---|---|
| `barren_glockenbronze` | Rohstoff (Quest) |
| `glocke_neu` | die gegossene Glocke |
| `kloeppel` | Klöppel aus Kernbaum |
| `tjarks_eid` | Tjarks Eid, aufgeschrieben (E3, Weg „überreden“) |
| `klinge_hauptmann` | Klinge des Grauen Hauptmanns (geht an Wigand) |
| `wappenrock_grauwacht` | Grauwachts Wappenrock, Teil 1 der Wachtrüstung (neues Set, Nutzer entscheidet) |
| `hammelfleisch`, `hammeleintopf` | Nebenquest „Mettes Schafe“ |
| `grablicht` | Seelenlicht 35 |

## Figuren (Figuren & 3D)

Mette Heider (Hirtin), Äbtissin Gunhild, Burgvogt Wigand Fels (Rüstung der Wacht), Tjark Sölde (Deserteur, umgedrehter Wappenrock). Heute vorläufig `npcfrau3d`, `npcmann3d`, `stadtwache3d`.
