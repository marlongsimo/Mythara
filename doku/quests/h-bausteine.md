# Hochlande (Block H) – Quests H1–H4 und „Der Einsiedler vom Spiegelsee“: was dem Baukasten fehlt

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/phase-11.md` (Tabelle Block H, Zweig `claude/relaxed-sagan-erl6lf`), Issue #161. Fehlende Bausteine: #118.

- **Dateien:**
  - `realtime/shared/quest_h1.ts`, `quest_h2.ts`, `quest_h3.ts`, `quest_h4.ts`, `quest_h_einsiedler.ts`
  - Stellen und Figuren: `quest_h_orte.ts`
- **Im Spiel** (`shared/quests.ts`): H1 und die Nebenquest. Sie brauchen nichts Neues.
- **Entwurf** (`shared/quest_entwuerfe.ts`): H2, H3, H4. Sie warten auf die Bausteine unten.
- **Welt-Test:** `realtime/test/h-welt.test.mjs` (Ports 8855/8856, etwa 140 s) spielt H1 und die Nebenquest ganz durch.

## Quests

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| H1 „Über den Pass“ | `hochlande_ueber_den_pass` | Wigand Fels (Burg Grauwacht) · Merit · Wache Odo an der Furt · Bergvögtin Hilde Erzgrund · **2 Bergtrolle am Hochpass** · Ansgar (Passwacht) · Afra (Alm) · Abgabe bei Hilde | **Merit Stahl** (Graufurt) | Stärke 1.500, Defense 1.500, 500 Splitter, 1 QP; Wegstein-Ziel Steinhag; Schalter `erzwagen_steinhag` |
| H2 „Käse für die Passwacht“ | `hochlande_kaese_fuer_die_passwacht` | 4 Ziegen locken (folgen) · Gatter · melken (3 Ziegenmilch) · **Lab von Mette** · Käselaib am Herd der Alm (Kochen 45) · Käse zu Brun | **Mette Heider** (Heidrast) | Kochen 2.000, 300 Splitter, 1 QP; danach Rezept frei; Schalter `afra_laden` |
| H3 „Tiefer als erlaubt“ | `hochlande_tiefer_als_erlaubt` | 3 morsche Stempel durch Grubenstempel ersetzen (Handwerk 45) · Geröll wegräumen (Bergbau 50) · 3 Verschüttete mit Heiltränken versorgen · leuchtende Erzprobe · **Hedda** | **Mutter Hedda** (Rabenmoor) | Bergbau 3.000, Handwerk 2.000, 600 Splitter, 2 QP; Schalter `urkammer_offen`, `tiefer_stollen_frei` |
| H4 „Die Hüter der Hochlande“ | `hochlande_hueter_der_hochlande` | drei Stränge, Reihenfolge frei. **Grumhold:** Wendel zeigt den Weg · Trollhalle · Grumhold · Splitterkern · Hedda. **Sturmschwinge:** 3 Sturmfedern · Horst · Sturmschwinge. **Frostwitwe:** Eisrunen am Pass · Einsiedler deutet · Eishöhle · Frostwitwe | **Hedda**, **Einsiedler**, Passwächterin Brun | Stärke, Fernkampf, Magie, Defense je 4.000, 2.000 Splitter, 4 QP; danach die starken Hüter |
| Nebenquest „Der Einsiedler vom Spiegelsee“ | `hochlande_einsiedler_vom_spiegelsee` | 3 Eisenhut + 3 Nebelkraut · 3 Steinmänner am Grauhorn lesen · Mira grüßen | **Mira Kräuterlieb** (Waldmark): er war ihr Lehrer | Kräuterkunde 2.500, 300 Splitter, 1 QP; Schalter `kessel_spiegelsee` |

**Voraussetzungen:**
- **H1:** E4 fertig und Heldenlevel 45. Wigand bietet vorher E4 an (`figurQuest`: die erste angebotene Quest spricht).
- **H2:** H1 und Kochen 45.
- **H3:** H1, Bergbau 50 und Handwerk 45.
- **H4:** H1, H3 und Heldenlevel 55.
- **Nebenquest:** H1 und Kräuterkunde 35.

## Hüter (Boss-Regel #116)

| Hüter | Gegner | während der Quest (Instanz, allein, schwächer) | danach (stark, öffentlich oder eigene Instanz) |
|---|---|---|---|
| Grumhold | `grumhold` | `grumhold_halle` = läuft, `weg` erledigt, `grumhold` offen | `grumhold_danach` = fertig |
| Sturmschwinge | `sturmschwinge` | `sturmschwinge_horst` = läuft, drei Federn erledigt, `sturmschwinge` offen | `sturmschwinge_danach` = fertig |
| Frostwitwe | `frostwitwe` | `frostwitwe_hoehle` = läuft, `einsiedler` erledigt, `frostwitwe` offen | `frostwitwe_danach` = fertig |

Vor der Quest ist jede Kammer leer. Betreten meldet die Region: `grumhold_halle`, `sturmschwinge_horst`, `frostwitwe_hoehle`.

## Was fehlt (#118)

**Integration (Inhaltsdaten):**
- **`laeden.ts`, `questFigur`** für die Bewohner, die in Quests sprechen:
  - `hochland_furtwache` → `furtwache`
  - `steinhag_vogt` → `bergvoegtin`
  - `hochland_steiger` → `wendel`
  - `hochland_passwaechter` → `ansgar`
  - `hochland_passwaechterin` → `brun`
  - `hochland_sennerin` → `afra`
  - `hochland_einsiedler` → `einsiedler`
  - Sonst stehen sie doppelt da.
- **Läden in Steinhag:** `wenn: { quest: "hochlande_ueber_den_pass", phase: "fertig" }`.
- **Laden der Sennerin:** nach H2 (`hochlande_kaese_fuer_die_passwacht` fertig), mit Käselaib und Ziegenmilch.
- **Neue Gegenstände:**
  - `ziegenmilch`
  - `lab`
  - `kaeselaib` (Essen)
  - `grubenstempel`
  - `erzprobe_leuchtend` (Questgegenstand)
  - `eisrunen_abschrift` (Questgegenstand)
- **Neue Rezepte:**
  - `kaeselaib`: Herd, Kochen 45, 3 Ziegenmilch + 1 Lab, `quest: "hochlande_kaese_fuer_die_passwacht"`.
  - `grubenstempel`: Werkbank, Handwerk 45, 1 Kernbaumstamm, `quest: "hochlande_tiefer_als_erlaubt"`.

**Systeme:**
- Die drei Hüter als Gegner (`grumhold`, `sturmschwinge`, `frostwitwe`), je mit Quest-Fassung und starker Fassung, nach den Schaltern oben.
- Mechaniken und Drops laut `phase-11.md`.
- Schalter `urkammer_offen` sperrt den Zugang zur Urkammer (Ureisen) bis nach H3.

**Welt:**
- Herd an der Käserei der Alm (`quest_h_orte.ts` ALM.herd, 7194 | 6004).
- Kessel am Spiegelsee (`kessel_spiegelsee`).
- Regionen `grumhold_halle` (unter dem Bergwerk, hinter dem Geröll), `sturmschwinge_horst` (Gipfel Grauhorn) und `frostwitwe_hoehle` (hinter der Passwacht).
- Optional Deko: Steinmänner am Grauhorn, Federn, Eisrunen, morsche Stempel, Geröll.

**Figuren:**
- Ziegen `ziege3d` gibt es schon.
- Die Verschütteten nutzen `npc.bergmann`, `npc.bergmann2` und `npc.bergfrau`.
- Die Hüter-Modelle baut Figuren laut `phase-11.md`.
