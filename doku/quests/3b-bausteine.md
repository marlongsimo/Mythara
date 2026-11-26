# Phase 3b – Bausteine, die die Quests erwarten

Rolle Quests, 26.11.2026. Die Quests „Schilf und Schnur“ (`realtime/shared/quest_schilf.ts`) und „Die Taverne öffnet“ (`quest_taverne.ts`) sind fertig geschrieben.
Sie stehen als **Entwurf** in `realtime/shared/quest_entwuerfe.ts`. Der Prüfer (`test/questbau.test.mjs`) prüft sie mit und nennt fehlende Bausteine als „wartet auf …“.
Server und Browser lesen die Entwürfe nicht. Sobald #4 die Bausteine hat, trägt die Rolle Quests sie in `shared/quests.ts` ein und schreibt die Welt-Tests.

Wenn #4 andere Kennungen wählt, ist das kein Problem: kurz im Issue sagen, die Quests werden angepasst.

## Kennungen

| Was | Kennung | Für |
|---|---|---|
| Gegenstand Angelrute (eine, ohne Stufen, Kanon 26.11.) | `angelrute` | Lambert gibt sie, wenn man keine hat (`fehlt`, gleichwertig `^angelrute`) |
| Gegenstand Köder | `wurm` (stapelbar) | Lohn: 20 Würmer |
| Fisch roh / gebraten / verbrannt | `fisch_bachling_roh`, `fisch_bachling_gebraten`, `fisch_bachling_verbrannt` (Muster auch für `muehlbarsch`, `moorhecht`, wie die Bilder der Figuren-Fabrik) | Abgabe bei Lambert und Hilde |
| Gericht | `fischsuppe` | Abgabe bei Hilde |
| Brot | `brot` (gibt es schon) | Abgabe bei Hilde |
| Sammelziel Würmer graben | Art `wurmacker`, meldet `{ art: "sammeln", ziel: "wurmacker" }` je Graben | Schritt „wuermer“ (3×) |
| Fischen | meldet je Fang `{ art: "sammeln", ziel: "<fischart>" }`, also `ziel: "bachling"` | Schritt „fang“ (3×) |
| Rezept Braten | `fisch_bachling_gebraten` (Station Feuer). Das Ereignis `herstellen` nur, wenn der Fisch **gelingt**; verbrannt zählt nicht | Schritt „braten“ |
| Berufe im Lohn | `fischen`, `kochen` (`shared/berufe.ts`) | Lohn beider Quests |

## Schalter (aus `quest_taverne.ts`)

| Schalter | an, wenn | wirkt |
|---|---|---|
| `taverne_kueche` | Quest „Die Taverne öffnet“ läuft oder ist fertig | Herd und Kessel in der Taverne nutzbar, damit die Fischsuppe während der Quest gekocht werden kann |
| `taverne_offen` | Quest fertig | Hilde verkauft einfache Gerichte; die Tür heißt nicht mehr „kommt noch“ |

Issue #4 nennt für Herd und Kessel `taverne_offen`. Das ergäbe einen Kreis, weil die Suppe den Kessel schon braucht, bevor die Taverne offen ist. Deshalb gibt es zwei Schalter.

## Orte (Vorschlag, die Welt prüft)

| Was | Stelle (Weltfeld) |
|---|---|
| Lambert Schilf | 6463,5 · 6686,5 – am Mühlgraben oberhalb der Wassermühle (Tür 6460,4 · 6689,2) |
| Fanggrund Bachling für den Pfeil | 6464,5 · 6688,5 – Mühlgraben Weidenhain |
| Wurmacker | 6512,5 · 6440,5 – Äcker des Osthofs |
| Erntefeuer (Braten) | 6442 · 6687,9 – gibt es schon (B1) |
| Hilde Krug | 6428,5 · 6432,5 – vor der Tür der Taverne der Waldmark (Tür 6428 · 6430,8) |

## Offene Punkte für das Konzept

- „Die Taverne öffnet“ verlangt Kochen 10, die Fischsuppe aber Kochen 15 (und einen Mühlbarsch, Fischen 10). Der Spieler muss also während der Quest auf 15 kommen. So steht es im Konzept, und das Questlog sagt es dazu.
- „Schilf und Schnur“ hat als Voraussetzung nur „Die gesperrte Straße“, weil Weidenhain dahinter liegt.
