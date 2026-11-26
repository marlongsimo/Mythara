# Quest B2 „Wasser auf die Mühle“ – Bausteine, die die Quest erwartet

Rolle Quests, 26.11.2026. Die Quest steht in `realtime/shared/quest_b2.ts`, vorerst als **Entwurf** in `shared/quest_entwuerfe.ts`.
Der Prüfer (`test/questbau.test.mjs`) prüft sie mit. Sobald #6 (Rolle Spiel) die Bausteine hat, trägt die Rolle Quests sie in `shared/quests.ts` ein und schreibt den Welt-Test.

## Ablauf (wie im Konzept)
1. Drei Überläufe am Wehr untersuchen (Questobjekte `ueberlauf_oben`, `_mitte`, `_unten`). Die Texte verraten die Reihenfolge.
2. Drei Schütztafeln an der Werkbank (Quest-Rezept, je 2 Tannenstämme).
3. Sechs Eisenbänder am Amboss (Quest-Rezept, je Barren zwei Bänder; der Schritt zählt 3 Schmiedevorgänge).
4. Ein Hanftau an der Werkbank (Quest-Rezept, Garn).
5. Einsetzen (Questobjekte `tafel_mitte` → `tafel_unten` → `tafel_oben`, je 1 Tafel + 2 Bänder, oben zusätzlich das Tau). Falsche Reihenfolge: nur ein Spritzer und „So nicht!“, nichts geht verloren.
6. Hanne Kalk Bescheid sagen, Abgabe bei Tebbe.

Lohn: 300 Splitter, 300 Schmieden-XP, 1 Questpunkt.

## Kennungen (Rolle Spiel, `shared/handwerk.ts` und `gegenstaende.ts`)

| Was | Kennung | Vorschlag |
|---|---|---|
| Gegenstand Schütztafel | `schuetztafel` | Questgegenstand, untauschbar |
| Gegenstand Eisenband | `eisenband` | Questgegenstand, stapelbar |
| Gegenstand Hanftau | `hanftau` | Questgegenstand |
| Rezept Schütztafel | `schuetztafel` | Werkbank, Handwerk 15, 2 × `stamm_tanne` → 1 `schuetztafel`, `quest: "weidenhain_wasser_auf_die_muehle"` |
| Rezept Eisenbänder | `eisenbaender` | Amboss, 1 × `barren_eisen` → **2** `eisenband`, Quest-Rezept. Geht „2 Stück“ nicht, dann 1 → 1, und die Quest zählt 6 statt 3 (kurz Bescheid sagen) |
| Rezept Hanftau | `hanftau` | Werkbank, 4 × `garn` → 1 `hanftau`, Quest-Rezept |

## Schalter

| Schalter | an, wenn | wirkt |
|---|---|---|
| `wehr_heil` | obere Tafel gesetzt oder Quest fertig | Mühlrad dreht sich (je Spieler, `drehen` in der Quest, Stelle 6463 · 6689, r 5), Fanggrund Wehrkolk |
| `werkstatt_weidenhain` | Quest fertig | Esse, Amboss, Werkbank in Tebbes Schuppen |
| `hanne_mehl` | Quest fertig | Hanne Kalk verkauft Mehl |

## Figuren und Stellen (Vorschlag, die Welt prüft)

| Was | Stelle (Weltfeld) |
|---|---|
| Tebbe | 6458,6 · 6692,6 (wo heute die Dorffigur `tebbe` steht). Wird Questfigur wie Agnes, die Dorffigur entfällt |
| Hanne Kalk | 6433,4 · 6679,4 (Dorffigur `hanne`). Wird Questfigur |
| Überläufe oben / Mitte / unten | 6457,5 / 6460,5 / 6463,5 · 6697,5 (Wehr: 6460 · 6696,2). Oben = stromauf |
| Tafel-Stellen | jeweils ein Feld südlich der Überläufe (y 6698,5) |
| Mühlrad (Drehteil) | 6463 · 6689 (Tür der Mühle 6460,4 · 6689,2) |
| Werkbank für Tafeln und Tau | Osthof 6530,5 · 6426,5 (vor B2 die einzige Werkbank) |
