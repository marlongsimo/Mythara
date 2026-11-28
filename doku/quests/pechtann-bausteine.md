# Pechtann (Westwald der Fahlen Weiten): zwei kleine Aufgaben (#189)

Rolle Quests, 28.11.2026. Die Aufgaben sind vom Nutzer mit Pechtann freigegeben. Die Stellen kommen aus Welts Bau (c3103542, `welt/fahleweiten_orte.json`).

- **Datei:** `realtime/shared/quest_pechtann.ts`
- **Stand:** Entwurf in `shared/quest_entwuerfe.ts`, bis Pechtann (Welt c3103542) auf `ausgabe/naechste` ist. Dann in `shared/quests.ts` eintragen.
- **Welt-Test:** `realtime/test/pechtann-welt.test.mjs` (Ports 8883/8884, etwa 170 s; mit Pechtann in einer Testkopie grün, als Entwurf endet er sofort grün)
- **Neue Gegenstände:** keine.

| Quest | Kennung | Ablauf | Lohn |
|---|---|---|---|
| „Drei Wildschweine für die Jägerin“ | `pechtann_drei_wildschweine` | Jägerin Sigrun Fähr (Jägerhütte) · Spuren am Jägerlager · 3 Wildschweine im Westwald (Stufe 18) | Stärke 800, Fernkampf 400 XP, 150 Splitter, 1 QP |
| „Die verlorenen Harzeimer“ | `pechtann_die_verlorenen_harzeimer` | Pechsieder Gerlach Ruß (Pechkessel) · umgestoßene Eimer an der Harzlichtung · die Eimer in der Verfallenen Pechhütte (die Wildschweine haben sie hingeschleppt) | Holzfällerei 800, Handwerk 400 XP, 150 Splitter, 1 QP |

**Voraussetzung (beide):** „Der Weg nach Grauwacht“ (E1).

## Namen (Vorschlag Quests)

| Figur | Name | Modell | Platz |
|---|---|---|---|
| Jägerin | **Sigrun Fähr**, Kennung `sigrun` | `npc.wanderin` | `jaegerin_pechtann` |
| Pechsieder | **Gerlach Ruß**, Kennung `gerlach` | `npc.saegemueller` | `pechsieder_pechtann` |

Hinweis für alle Rollen: Der Server kürzt Figuren-Kennungen auf 16 Zeichen.
