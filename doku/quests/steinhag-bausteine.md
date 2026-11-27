# Hauptstadt Steinhag – kleine Stadt-Quests (#167)

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/hauptstaedte.md` (Zweig `claude/relaxed-sagan-erl6lf`) und Welts Plan `welt/plaene/steinhag_plan.json` (Commit a29fc0ee).

- **Datei:** `realtime/shared/quest_steinhag.ts`
- **Stand:** Entwurf in `shared/quest_entwuerfe.ts`. Die Quests kommen ins Spiel, sobald die Stadt nach dem Plan steht. Danach folgt der Welt-Test.
- **Rahmen:**
  - klein, 5–10 Minuten, je 1 Questpunkt
  - alle nach H1 „Über den Pass“
  - keine neuen Gegenstände
- **Stellen:** aus dem Plan.

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
| Fenn | `npc.junge` | bei den Fischerhäusern am Seeufer, 6951,5 \| 5834,5 |
| Hauptfrau Ragnhild | `stadtwache3d` | Burgplatz |
| Wachmann Kuno | `stadtwache3d` | Südostecke der Mauer |
| Zunftwächter Bodo | `stadtwache3d` | am Abstieg zum Stollen der Bergmannszunft |

Wenn Systeme dort eine eigene Wache stellt (Zugang ab Stufe 60), bitte mit `questFigur: "zunftwache"` verbinden.

## Was die Welt liefern muss (#167)

Die Plätze stehen in `quest_steinhag.ts`. Wo der Bau abweicht, passe ich die Stellen an.

- Seeufer mit Steg West (6960 | 5840) und Fischerhäusern (6944–6966 | 5832–5840)
- Ringmauer mit vier begehbaren Ecktürmen bzw. Mauerecken:
  - Pass-Tor 6937 | 5826
  - unter der Burg 7086 | 5842
  - Südost 7086 | 5954
  - Südwest 6920 | 5954
- Burgplatz vor der Vogtsburg (7044 | 5868)
- Abstieg zum Zunftstollen (7076 | 5948)
- Herd der Taverne (7008 | 5879, gibt es schon)
