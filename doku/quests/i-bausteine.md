# Block I – die Ockerlande (Phase 12): Quests I1–I4

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/phase-12.md` und die Kurzfassung der Rolle Quests. Der Nutzer hat sie freigegeben: statt eines Eimers ein Krug, als Boss die Ockermutter.
Stellen aus Welts Bau (#172, 9187427c): `welt/ockerlande_orte.json`, `welt/festland/plan_ockerlande.json`.

- **Datei:** `realtime/shared/quest_ockerlande.ts`
- **Im Spiel:** I1 und I2
- **Entwurf:** I3 und I4. Sie kommen ins Spiel, sobald ihre Bausteine da sind.
- **Welt-Test:** `realtime/test/ockerlande-welt.test.mjs` (Ports 8867/8868, etwa 110 s) spielt I1 und I2 durch. Den Teil für I3 überspringt er, solange I3 Entwurf ist.
- **Neue Gegenstände:** keine.
- **Drachenarm:** nichts.

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| I1 „Die Karawanenstraße“ | `ockerlande_die_karawanenstrasse` | Ruben Weit (Sandquell) vermisst eine Karawane · Selma fragen · Brunnenwächter Tarik · 2 Rastfeuer · 3 Ockerhyänen · zerbrochener Wagen · Karawanenmeisterin Nadira in Rotlehm | **Selma Dornfeld** (Glutbrunn, F1) | Stärke 1.500, Geschick 1.500, 400 Splitter |
| I2 „Wasser für Dornhag“ | `ockerlande_wasser_fuer_dornhag` | Hirtin Malika · Ayla fragen · 3 Lehmklumpen (Bergbau 30) · Tränke mit einem Krug · 4 Ziegen vom Akazienhain (folgen) · Gatter | **Ayla Dünenruh** (Sandquell) | Bergbau 1.200, Handwerk 600, 300 Splitter |
| I3 „Der Tafelberg“ | `ockerlande_der_tafelberg` | Steinbrecherin Rahel · Lore (Handwerk 25) · 2 Sterneisen im Steinbruch · Inschrift in der Höhle im Roten Tisch · Hasim | **Hasim Tal** (F3) | Bergbau 1.500, Handwerk 600, 400 Splitter |
| I4 „Die Ockermutter“ | `ockerlande_die_ockermutter` | Hauptfrau Imara (Lehmfeste) · Malika fragen · 3 Spuren zur Ockerkanzel · die Ockermutter allein in ihrem Bau | **Malika** (I2) | je 3.000 Stärke, Fernkampf, Magie, Defense, 1.500 Splitter, 2 QP |

**Voraussetzungen:**
- I1: F1 und Heldenlevel 45
- I2: I1 und Bergbau 30
- I3: I1, F3, Bergbau 40 und Handwerk 25
- I4: I2, I3 und Heldenlevel 55

## Namen (Vorschlag Quests)

| Figur | Ort |
|---|---|
| Karawanenmeisterin Nadira Sandweg | Karawanenhof Rotlehm |
| Brunnenwächter Tarik | Brunnenkreis |
| Hirtin Malika Dorn | Dornhag |
| Steinbrecherin Rahel Keil | Tafelrast |
| Hauptfrau Imara Lehm | Lehmfeste Rotlehm |

Die Plätze kommen aus den NPC-Plätzen der Welt. Ruben Weit (`troedler_sandquell`) und Ayla Dünenruh (`sandquell_quelle`) gibt es schon in `laeden.ts`. Integration bitte `questFigur` setzen: `ruben` und `ayla`.

## Was fehlt

- **I3, für Integration:** die Sammelstellen der Ockerlande (`welt/sammelstellen.json`, u. a. `steinbruch_am_roten_tisch_sterneisen_1`) nach `shared/bergbau_standorte.json` übernehmen. Sonst gibt der Steinbruch dem Server kein Erz.
- **I4:**
  - **Systeme/Figuren:** Gegner `ockermutter`.
    - Modell: Ockerhyäne, groß.
    - Rundumschlag.
    - Heulen ruft zwei Ockerhyänen.
    - Nach dem Sprung kurz benommen (Schwächefenster).
    - Schläger.
    - Quest-Fassung allein und schwächer, starke Fassung danach.
  - **Welt:** ihr Bau unter der Ockerkanzel als Instanz. Eingang am Aufgang 7120 | 7544.
  - **Schalter:** `ockermutter_bau` (die Quest läuft, die drei Spuren sind erledigt, die Mutter steht noch) und `ockermutter_danach` (nach der Quest).
- **I1, für Systeme:** Wegstein-Ziel Rotlehm. Die Quest-Texte nennen es noch nicht; wenn es da ist, ergänze ich den Lohn-Text.
