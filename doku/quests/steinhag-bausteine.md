# Hauptstadt Steinhag – kleine Stadt-Quests (#167)

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/hauptstaedte.md` (Zweig `claude/relaxed-sagan-erl6lf`) und Welts Plan `welt/plaene/steinhag_plan.json` (Commit a29fc0ee).

- **Datei:** `realtime/shared/quest_steinhag.ts`
- **Stand:** Im Spiel (`shared/quests.ts`). Die Stadt steht (Welt 726587099), die Stellen sind an den Bau angepasst.
- **Welt-Test:** `realtime/test/steinhag-welt.test.mjs` (Ports 8863/8864, etwa 15 s) spielt alle drei durch.
- **Rahmen:**
  - klein, 5–10 Minuten, je 1 Questpunkt
  - alle nach H1 „Über den Pass“
  - keine neuen Gegenstände
- **Stellen:** aus der gebauten Stadt.

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| „Der Dieb vom Bergmarkt“ | `steinhag_dieb_vom_bergmarkt` | Jakob Kiesel (Bergmarkt) · 3 Spuren der Reihe nach (Kiste am Stand, Gasse zum See, Steg) · Fenn, der Fischerjunge · Merit fragen · Abgabe bei Jakob | **Merit Stahl** (Graufurt): nimmt Fenn als Lehrling | Geschick 1.500, 250 Splitter |
| „Die Burgwache“ | `steinhag_die_burgwache` | Hauptfrau Ragnhild (Burgplatz) · 4 Ecktürme der Ringmauer · Wachmann Kuno schläft an der Südostecke · Bericht nach Grauwacht | **Wigand Fels** (Grauwacht): alte Bekannte vom Pass | Defense 1.500, 250 Splitter |
| „Eintopf für die Kumpel“ | `steinhag_eintopf_fuer_die_kumpel` | Wirt Ruprecht Talg · 2 Bauerneintöpfe am Herd der Taverne (Kochen 25) · Zunftwache Bodo am Stollen · Steiger Wendel am Erzberg | **Steiger Wendel** (H3) | Kochen 1.200, 2 Bauerneintöpfe, 150 Splitter |

## Figuren

- **Aus dem Bestand** (`laeden.ts`), gleicher Name, Platz und Modell:
  - Jakob Kiesel (`steinhag_allerlei`, Figur `jakob`)
  - Ruprecht Talg (`steinhag_taverne`, Figur `ruprecht`)
  - Integration bitte `questFigur` setzen.
- **Neu:**

| Figur | Modell | Ort |
|---|---|---|
| Fenn | `npc.junge` | am Fischerhaus am Seeufer, 6949,5 \| 5866,5 |
| Hauptfrau Ragnhild | `stadtwache3d` | Burgplatz |
| Wachmann Kuno | `stadtwache3d` | Südostecke der Mauer |
| Zunftwächter Bodo | `stadtwache3d` | am Abstieg zum Stollen der Bergmannszunft |

Wenn Systeme dort eine eigene Wache stellt (Zugang ab Stufe 60), bitte mit `questFigur: "zunftwache"` verbinden.

## Stellen in der gebauten Stadt

- Spuren: hinter dem Bergmarkt (6984 | 5898,5), Gasse zum See (6975,5 | 5880,5), Fischerhäuser (6962,5 | 5867,5); Fenn am Fischerhaus (6949,5 | 5866,5)
- Ecktürme der Ringmauer: Nordwest am See (6938,5 | 5863,5), Ost (7071,5 | 5931,5), Südost (7071,5 | 5948,5), Südwest (6938,5 | 5948,5); Kuno an der Südostecke
- Burgplatz (7053 | 5868), Zunftwächter am Stolleneingang (7065,5 | 5944,5), Herd der Taverne (7008,2 | 5874)
