# Hochlande (Block H) – Quests H1–H4 und „Der Einsiedler vom Spiegelsee“: was dem Baukasten fehlt

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/phase-11.md` (Tabelle Block H, Zweig `claude/relaxed-sagan-erl6lf`), Issue #161. Fehlende Bausteine: #118.

- **Dateien:**
  - `realtime/shared/quest_h1.ts`, `quest_h2.ts`, `quest_h3.ts`, `quest_h4.ts`, `quest_h_einsiedler.ts`
  - Stellen und Figuren: `quest_h_orte.ts`
- **Im Spiel** (`shared/quests.ts`): alle fünf – H1, H2, H3, H4 und die Nebenquest.
- **Kennungen und Bausteine:** von Systeme, `shared/hochlande.ts` (8f50070c). Systeme hat sich am Ende nach dieser Liste gerichtet (d1597a14e): die Quest-IDs, `ziegenmilch`, `lab`, `kaeselaib`, `grubenstempel`, `erzprobe_leuchtend`, `eisrunen_abschrift`, die Hüter in `bosse.ts` HUETER und die Tür `bergwerk_stollen`.
- **Welt-Tests:**
  - `realtime/test/h-welt.test.mjs` (Ports 8855/8856, etwa 120 s): H1 und die Nebenquest.
  - `realtime/test/h23-welt.test.mjs` (Ports 8859/8860, etwa 20 s): H2 und H3.
  - `realtime/test/h4-welt.test.mjs` (Ports 8861/8862, etwa 160 s): die drei Hüter je allein in ihrer Instanz, Abgabe und die `*_danach`-Schalter.

## Quests

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| H1 „Über den Pass“ | `hochlande_ueber_den_pass` | Wigand Fels (Burg Grauwacht) · Merit · Wache Odo an der Furt · Bergvögtin Hilde Erzgrund · **2 Bergtrolle am Hochpass** · Ansgar (Passwacht) · Afra (Alm) · Abgabe bei Hilde | **Merit Stahl** (Graufurt) | Stärke 1.500, Defense 1.500, 500 Splitter, 1 QP; Wegstein-Ziel Steinhag; Schalter `erzwagen_steinhag` |
| H2 „Käse für die Passwacht“ | `hochlande_kaese_fuer_die_passwacht` | 4 Ziegen locken (folgen) · Gatter · melken (3 Ziegenmilch) · **Lab von Mette** · Käselaib (`kaeselaib`) am Herd der Alm (Kochen 45) · im Käsekeller reifen lassen (Regal `kaeseregal`) · Käse zu Brun; verdorben → Afra gibt neue Milch und Lab | **Mette Heider** (Heidrast) | Kochen 2.000, 300 Splitter, 1 QP; danach Rezept frei; Schalter `afra_laden` |
| H3 „Tiefer als erlaubt“ | `hochlande_tiefer_als_erlaubt` | 3 morsche Stempel durch Grubenstempel ersetzen (Handwerk 45) · Geröll wegräumen (Bergbau 50) · 3 Verschüttete mit Heiltränken versorgen · leuchtende Erzprobe · **Hedda** | **Mutter Hedda** (Rabenmoor) | Bergbau 3.000, Handwerk 2.000, 600 Splitter, 2 QP; Schalter `urkammer_offen` und `bergwerk_stollen_frei` (Tür `bergwerk_stollen` vor der Urkammer, #162) |
| H4 „Die Hüter der Hochlande“ | `hochlande_hueter_der_hochlande` | drei Stränge, Reihenfolge frei. **Grumhold:** Wendel zeigt den Weg · Grumhold in der Trollhalle (Instanz im Bergwerk) · Splitterkern ansehen · Hedda. **Sturmschwinge:** 3 Sturmfedern · Sturmschwinge im Horst. **Frostwitwe:** Eisrunen am Höhlenmund abschreiben · Einsiedler deutet · Frostwitwe in der Eishöhle | **Hedda**, **Einsiedler**, Passwächterin Brun | Stärke, Fernkampf, Magie, Defense je 4.000, 2.000 Splitter, 4 QP; danach die starken Hüter |
| Nebenquest „Der Einsiedler vom Spiegelsee“ | `hochlande_einsiedler_vom_spiegelsee` | 3 Eisenhut + 3 Nebelkraut · 3 Steinmänner am Grauhorn lesen · Mira grüßen | **Mira Kräuterlieb** (Waldmark): er war ihr Lehrer | Kräuterkunde 2.500, 300 Splitter, 1 QP; Schalter `kessel_spiegelsee` |

**Voraussetzungen:**
- **H1:** E4 fertig und Heldenlevel 45. Wigand bietet vorher E4 an (`figurQuest`: die erste angebotene Quest spricht).
- **H2:** H1 und Kochen 45.
- **H3:** H1, Bergbau 50 und Handwerk 45.
- **H4:** H1, H3 und Heldenlevel 55.
- **Nebenquest:** H1 und Kräuterkunde 35.

## Hüter (Boss-Regel #116, `shared/bosse.ts` HUETER)

| Hüter | Gegner | Instanz | während der Quest (allein, schwächer) | danach (stark) |
|---|---|---|---|---|
| Grumhold | `grumhold` | `trollhalle` (im Bergwerk) | `grumhold_halle` = läuft, `weg` erledigt, `grumhold` offen | `grumhold_danach` = fertig |
| Sturmschwinge | `sturmschwinge` | `horst_grauhorn` (Aufstieg `horst_aufstieg` auf dem Grauhorn) | `sturmschwinge_horst` = läuft, drei Federn erledigt, `sturmschwinge` offen | `sturmschwinge_danach` = fertig |
| Frostwitwe | `frostwitwe` | `eishoehle_hochpass` (Höhlenmund `eishoehle_eingang` südlich der Passwacht) | `frostwitwe_hoehle` = läuft, `einsiedler` erledigt, `frostwitwe` offen | `frostwitwe_danach` = fertig |

## Was noch fehlt (#118)

- **Welt:** eine Werkbank in Steinhag für das Grubenholz. Bis dahin geht jede Werkbank.
- **Integration:**
  - `questFigur` in `laeden.ts` (sonst stehen die Bewohner doppelt da):
    - `hochland_furtwache` → `furtwache`
    - `steinhag_vogt` → `bergvoegtin`
    - `hochland_steiger` → `wendel`
    - `hochland_passwaechter` → `ansgar`
    - `hochland_passwaechterin` → `brun`
    - `hochland_sennerin` → `afra`
    - `hochland_einsiedler` → `einsiedler`
  - Afras Laden nach H2 (`afra_laden`).
- **Entschieden (Nutzer):** Die Läden in Steinhag öffnen erst nach H1 (Systeme d1597a14e).
