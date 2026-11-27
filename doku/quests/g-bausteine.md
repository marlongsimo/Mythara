# Phase 10 – Quests G1–G4 und „Der Kräuterhof“: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Grundlage: `doku/konzepte/phase-10.md`. Alle Namen sind vom Nutzer bestätigt (27.11.) – **neu**: Kaufherr **Jasper Kranich** (Küstenhaus), Leuchtturmwärterin **Wiebke Strand**,
Fischerin **Bente Möller** (Möwenbucht), Kräuterbäuerin **Frieda Saat**. Dateien: `realtime/shared/quest_g1.ts` … `quest_g4.ts`, `quest_kraeuterhof.ts`, Stellen in `quest_g_orte.ts`.
Alle als **Entwurf** in `shared/quest_entwuerfe.ts`. Lohn für Stufe 20–40: 800–3.000 je Skill.

**Stellen aus der Welt (#82)**, gesammelt in `quest_g_orte.ts`: Küstenhaus, Kai, Leuchtturm und Wärterin, Wrack, Klippenhöhlen und Kajüte (`wrack_kajuete`, mit der Logbuchseite als neuem Schritt in G3), Möwenbucht mit Räucherhütte, Kräuterhof. Vorschläge, weil die Welt sie nicht nennt: Spuren und Wagen auf der Südstraße, die zwei Beete, der Kessel im Wärterhaus.

## Querverbindungen (Grundsatz Phase 9)

| Quest | quer durch |
|---|---|
| G1 | Start bei **Othmar in Weidenhain**, Südstraße, Abgabe in Kielmund |
| G2 | Splitterglut am **Bindestein an der Linde** (Weidenhain, B1), Seelenlicht aus Waldmark/Weidenhain |
| G3 | Der Brief mit dem Rabensiegel muss zu **Bertold** (Rabenmoor) und **Merit** (Graufurt); Voraussetzung B4 |
| Kräuterhof | Samen von **Mira** (Waldmark), Ableger von **Hedda** (Rabenmoor); Voraussetzung „Miras Rezeptbuch“ |

## Für den Motor (Rolle Spiel)

| # | Baustein | Wo | Vorschlag |
|---|---|---|---|
| 1 | ~~Kutsche~~ | gestrichen (Nutzer 26.11.) – G1 gibt nur Wegstein-Ziel Kielmund, XP und Questpunkte | – |
| 2 | **Räucherhütte** | G4: Kochstation mit Wartezeit, Schalter `raeucherhuette` (während G4 und danach) | |
| 3 | **Instanz** | G3: Kajüte `wrack_kajuete` hinter den Klippenhöhlen, Schalter `wrack_instanz` | wie Rotmantel |
| 4 | **Gegner, die `erlegen` melden** | `strandraeuber` (G1 4×, G3 4×), `wrackkapitaen` (G3) | |
| 5 | **Fischen** | `hering` (G2 5×, G4 5×) | `{ art: "sammeln", ziel: "hering" }` |
| 6 | **Rezepte** | `lampenoel` (Kessel im Wärterhaus, 5 Heringe → 1 Lampenöl), `splitterglut` (Bindestein, Splitterbinden 20, 1 Seelenlicht + 5 Splitter, Quest-Rezept G2), `fischernetz` (Werkbank, Handwerk 20, 6 Garn, Quest-Rezept G4), `raeucherhering` (Räucherhütte, Hering), `heiltrank` (Kessel, aus 5c) | |
| 7 | **Kessel auf dem Kräuterhof** | Kräuterhof „traenke“ | Station Kessel wie bei Hedda |
| 8 | **Schalter** | `leuchtfeuer_an` (G2), `kraeuterhof_beete` (Kräuterhof: Ringelblume und Moorglöckchen als Sammelstellen) | |
| 9 | **Wegstein-Ziel** | Kielmund (G1) | |

## Gegenstände

| Kennung | Was |
|---|---|
| `frachtbrief` | G1 |
| `lampenoel`, `splitterglut` | G2 |
| `wrackbrief` | G3, Brief mit Rabensiegel aus dem Wrack |
| `fischernetz`, `raeucherhering` | G4 |
| `ringelblumensamen`, `moorgloeckchen_ableger` | Kräuterhof |

## Abweichungen vom Konzept
- G2: Tran aus **Hering** (Fischen 20) statt Seeaal (Fischen 45), damit die Quest in die Küstenstufe 20–40 passt.
- G3: Auftraggeber ist Kaufherr Kranich (das Wrack ist ein Schiff seines Hauses).
