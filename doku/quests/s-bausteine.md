# Süden (Block S) – Quests S1–S9: was dem Baukasten fehlt

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/sueden.md` (Zweig `claude/relaxed-sagan-erl6lf`), Issue #124.

- **Dateien:** `realtime/shared/quest_s1.ts` bis `quest_s9.ts`, Stellen und Figuren in `quest_s_orte.ts`.
- **Status:** Alle sind als **Entwurf** in `shared/quest_entwuerfe.ts` eingetragen.
- **Rahmen:**
  - 5–15 Minuten
  - je 1 Questpunkt
  - Lohn klein (Stufe 5–30)
  - kein Boss
  - **keine neuen Rohstoffe:** Lohn und Zutaten nur aus Vorhandenem (Brot, Kuhfleisch, Hanf, Hanftuch, Eichenstämme, Eisenbänder, Eisen- und Kupferbarren, Seelenlicht, Würmer, Heiltränke).

**Platzhalter:** Die Orte baut die Welt (#120), die Figuren baut #121. Alle Stellen in `quest_s_orte.ts` sind vorläufig: Sie liegen entlang der Südstraße (x ≈ 6440) zwischen Weidenhain und Kielmund. Kommen die Kennungen, tauschen wir nur die Zahlen.

## Quests

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| S1 „Saat und Krähen“ | `heckenhof_saat_und_kraehen` | 3 Krähenschwärme · Hanftuch weben · Vogelscheuche (Questobjekt, nimmt Hanftuch + 2 Hanf) | Rike erzählt von Weidenhain | Handwerk 300, 2 Brot, 60 Splitter |
| S2 „Der verschwundene Stock“ | `summweide_der_verschwundene_stock` | 3× dem Summen folgen · Stock aufrichten · 6 Ringelblumen · 3 an Mira · 3 an Imme | **Mira** (Waldmark) | Kräuterkunde 400, kleiner Heiltrank, 50 Splitter; Schalter `imme_laden` |
| S3 „Der alte Hecht“ | `schilfsee_der_alte_hecht` | 3 Mühlbarsche · der alte Hecht (seltener Fang) · Lambert zeigen · an die Wand | **Lambert** (Weidenhain); setzt „Schilf und Schnur“ voraus | Fischen 600, 20 Würmer, 80 Splitter; Schalter `s3_trophaee` |
| S4 „Klemmende Säge“ | `erlengrund_klemmende_saege` | 4 Eichenstämme · Tebbe fragen · Eisenbänder schmieden · Wasserrad (nimmt 4 Eiche + 2 Bänder) | **Tebbe** (Weidenhain); setzt B2 voraus | Holzfällerei 400, Schmieden 300, 2 Eiche, 70 Splitter; Schalter `saegemuehle_frei` |
| S5 „Die Furt“ | `lehmfurt_die_furt` | Steinbruch (Bergbau 15) · 5 Trittsteine der Reihe nach | – | Bergbau 500, 3 Eisenbarren, 80 Splitter; Schalter `lehmfurt_trittsteine` (nur Abkürzung) |
| S6 „Schafe zählen“ | `heckenhof_schafe_zaehlen` | 5 Schafe locken (sie folgen dir) · Gatter schließen | – | Geschick 300, 2 Kuhfleisch, 50 Splitter |
| S7 „Licht am Kreuzstein“ | `kreuzstein_licht_am_kreuzstein` | 3 Wiesenlichter (Splitterbinden 10) · Agnes' Segen · Schale weihen (nimmt 3 Seelenlicht) | **Agnes** (Linde, Weidenhain) | Splitterbinden 400, 3 Seelenlichter, 60 Splitter; Schalter `kreuzstein_heil` |
| S8 „Der Graupelz“ | `erlengrund_der_graupelz` | Hartwig fragen · 3 Spuren · den Graupelz stellen | **Förster Hartwig** (Nordwald); setzt S4 voraus, Heldenlevel 25 | Stärke 800, Geschick 400, 2 Heiltränke, 150 Splitter; Schalter `s8_trophaee` |
| S9 „Briefe nach Süden“ | `weidenhain_briefe_nach_sueden` | **Othmar** gibt 6 Briefe (Rike, Imme, Ebba, Bodo, Odila, Kuno); jeder gibt etwas Kleines mit · letzter Brief an **Kranich** in Kielmund | G1: Kranich spricht anders, wenn G1 fertig ist | Geschick 300, 100 Splitter |

**Neue Figuren (Namen doppeln sich nicht):**
- Bäuerin **Rike Heck** und Schäfer **Tamme** (Heckenhof)
- Imkerin **Imme Sommer** (Summweide)
- Fischerin **Ebba Ried** (Schilfsee)
- Sägemüller **Bodo Span** (Erlengrund, S4 und S8)
- Pilgerin **Odila** (Kreuzstein)
- Schmied **Kuno Lehm** (Lehmfurt)

Alle stehen auch in S9. Figuren aus älteren Quests stehen mit derselben Stelle und demselben Modell wie dort.

**Nicht aus dem Konzept übernommen:** Bei S1 kommt der Stoff nicht von Gerold. Gerold ist eine Ladenfigur, keine Questfigur, und verkauft keinen Stoff. Das Hanftuch webt man selbst.

## Für Welt, Figuren und Systeme

| # | Baustein | Wer | Quest | Vorschlag |
|---|---|---|---|---|
| 1 | Orte und Stellen | Welt #120 | alle | Kennungen nennen, dann tauscht die Rolle Quests die Platzhalter |
| 2 | Figuren | Figuren #121 | alle | Rike, Tamme, Imme, Ebba, Bodo, Odila, Kuno; Schafe (5) |
| 3 | Gegner, die `erlegen` melden | Spiel | S1, S8 | `kraehenschwarm`, `graupelz` (selten, alle 15 min, mit zwei Wölfen) |
| 4 | **Seltener Fang** | Systeme | S3 | Am Steg des Schilfsees, nur während S3, nach den Ködern: 1 % je Versuch. Meldet `{ art: "sammeln", ziel: "alter_hecht" }` und gibt den Questgegenstand `alter_hecht` (untauschbar, kein Rohstoff) |
| 5 | **Folgen für Questfiguren** | Systeme | S6 | Ein gelocktes Schaf folgt dem Spieler (`folgen.ts`, #54/#49). Erst am Pferch zählt es. Bis dahin zählt das Locken allein |
| 6 | Rezept `eisenbaender` | Spiel | S4 | Heute nur für B2 (`quest: B2`). Bitte auch während S4 erlauben |
| 7 | Sammelziel `ringelblume` | Spiel (5c) | S2 | Kräuterkunde. Der Beruf `kraeuterkunde` fehlt noch, wie bei Mira und dem Kräuterhof |
| 8 | Schalter für Welt und Läden | Spiel / Welt | S2–S8 | `imme_laden` (Kräuter, Heiltränke) · `s3_trophaee` (Hecht an der Wand) · `saegemuehle_frei` (Werkbank) · `lehmfurt_trittsteine` (Trittsteine als Weg, Abkürzung) · `kreuzstein_heil` (Heilstelle wie `kapelle_offen`) · `s8_trophaee` (Fell an der Wand) |
| 9 | Sammelziel Wiesenlicht am Kreuzstein | Welt | S7 | Seelenlicht-Art `wiese` (Splitterbinden 10) hinter der Kapelle |
