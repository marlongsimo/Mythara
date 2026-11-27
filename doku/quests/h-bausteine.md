# Hochlande (Block H) – Quests H1–H4 und „Der Einsiedler vom Spiegelsee“: was dem Baukasten fehlt

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/phase-11.md` (Tabelle Block H, Zweig `claude/relaxed-sagan-erl6lf`), Issue #161. Fehlende Bausteine: #118.

- **Dateien:**
  - `realtime/shared/quest_h1.ts`, `quest_h2.ts`, `quest_h3.ts`, `quest_h4.ts`, `quest_h_einsiedler.ts`
  - Stellen und Figuren: `quest_h_orte.ts`
- **Im Spiel** (`shared/quests.ts`): H1, H2, H3 und die Nebenquest.
- **Entwurf** (`shared/quest_entwuerfe.ts`): H4. Die Räume für Horst und Eishöhle fehlen noch (#162).
- **Kennungen und Bausteine:** von Systeme, `shared/hochlande.ts` (8f50070c). Das sind die Quest-IDs, `kaeserad`, `ziegenmilch`, `grubenholz`, `erzprobe_splitterlicht`, die Hüter in `bosse.ts` HUETER und die Tür zur Urkammer.
- **Welt-Tests:**
  - `realtime/test/h-welt.test.mjs` (Ports 8855/8856, etwa 120 s): H1 und die Nebenquest.
  - `realtime/test/h23-welt.test.mjs` (Ports 8859/8860, etwa 20 s): H2 und H3.

## Quests

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| H1 „Über den Pass“ | `hochlande_ueber_den_pass` | Wigand Fels (Burg Grauwacht) · Merit · Wache Odo an der Furt · Bergvögtin Hilde Erzgrund · **2 Bergtrolle am Hochpass** · Ansgar (Passwacht) · Afra (Alm) · Abgabe bei Hilde | **Merit Stahl** (Graufurt) | Stärke 1.500, Defense 1.500, 500 Splitter, 1 QP; Wegstein-Ziel Steinhag; Schalter `erzwagen_steinhag` |
| H2 „Käse für die Passwacht“ | `hochlande_kaese_fuer_die_passwacht` | 4 Ziegen locken (folgen) · Gatter · melken (3 Ziegenmilch) · **Mettes Käse-Kniff** · Almkäse (`kaeserad`) am Herd der Alm (Kochen 40) · Käse zu Brun; verdorben → Afra gibt neue Milch | **Mette Heider** (Heidrast) | Kochen 2.000, 300 Splitter, 1 QP; danach Rezept frei; Schalter `afra_laden` |
| H3 „Tiefer als erlaubt“ | `hochlande_tiefer_als_erlaubt` | 3 morsche Stempel durch Grubenholz ersetzen (Handwerk 40) · Geröll wegräumen (Bergbau 50) · 3 Verschüttete mit Heiltränken versorgen · leuchtende Erzprobe · **Hedda** | **Mutter Hedda** (Rabenmoor) | Bergbau 3.000, Handwerk 2.000, 600 Splitter, 2 QP; Schalter `urkammer_offen` (Tür zur Urkammer) |
| H4 „Die Hüter der Hochlande“ | `hochlande_die_hueter` | drei Stränge, Reihenfolge frei. **Grumhold:** Wendel zeigt den Weg · Grumhold in der Trollhalle (Instanz im Bergwerk) · Splitterkern ansehen · Hedda. **Sturmschwinge:** 3 Sturmfedern · Sturmschwinge im Horst. **Frostwitwe:** Eisrunen am Pass · Einsiedler deutet · Frostwitwe in der Eishöhle | **Hedda**, **Einsiedler**, Passwächterin Brun | Stärke, Fernkampf, Magie, Defense je 4.000, 2.000 Splitter, 4 QP; danach die starken Hüter |
| Nebenquest „Der Einsiedler vom Spiegelsee“ | `hochlande_der_einsiedler` | 3 Eisenhut + 3 Nebelkraut · 3 Steinmänner am Grauhorn lesen · Mira grüßen | **Mira Kräuterlieb** (Waldmark): er war ihr Lehrer | Kräuterkunde 2.500, 300 Splitter, 1 QP; Schalter `kessel_spiegelsee` |

**Voraussetzungen:**
- **H1:** E4 fertig und Heldenlevel 45. Wigand bietet vorher E4 an (`figurQuest`: die erste angebotene Quest spricht).
- **H2:** H1 und Kochen 40.
- **H3:** H1, Bergbau 50 und Handwerk 40.
- **H4:** H1, H3 und Heldenlevel 55.
- **Nebenquest:** H1 und Kräuterkunde 35.

## Hüter (Boss-Regel #116, `shared/bosse.ts` HUETER)

| Hüter | Gegner | Instanz | während der Quest (allein, schwächer) | danach (stark) |
|---|---|---|---|---|
| Grumhold | `grumhold` | `trollhalle` (im Bergwerk) | `grumhold_halle` = läuft, `weg` erledigt, `grumhold` offen | `grumhold_danach` = fertig |
| Sturmschwinge | `sturmschwinge` | `horst_grauhorn` (#162) | `sturmschwinge_horst` = läuft, drei Federn erledigt, `sturmschwinge` offen | `sturmschwinge_danach` = fertig |
| Frostwitwe | `frostwitwe` | `eishoehle_hochpass` (#162) | `frostwitwe_hoehle` = läuft, `einsiedler` erledigt, `frostwitwe` offen | `frostwitwe_danach` = fertig |

## Was noch fehlt (#118, #162)

- **Welt (#162):**
  - Die Instanzen `horst_grauhorn` und `eishoehle_hochpass`. Danach kommt H4 ins Spiel, mit einem Welt-Test.
  - Werkbank in Steinhag für das Grubenholz. Bis dahin geht jede Werkbank.
- **Integration:** `questFigur` in `laeden.ts` für die Bewohner, die in Quests sprechen. Sonst stehen sie doppelt da.
  - `hochland_furtwache` → `furtwache`
  - `steinhag_vogt` → `bergvoegtin`
  - `hochland_steiger` → `wendel`
  - `hochland_passwaechter` → `ansgar`
  - `hochland_passwaechterin` → `brun`
  - `hochland_sennerin` → `afra`
  - `hochland_einsiedler` → `einsiedler`
- **Integration:** Afras Laden nach H2 (Schalter `afra_laden`, Almkäse und Ziegenmilch).
- **Leitstelle fragt den Nutzer:** Ob die Läden in Steinhag erst nach H1 öffnen.
