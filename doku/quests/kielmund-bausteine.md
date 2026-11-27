# Hauptstadt Kielmund – kleine Stadt-Quests (#174)

Rolle Quests, 27.11.2026. Grundlage: `doku/konzepte/kielmund-quests.md` (vom Nutzer abgesegnet, alle vier). Stellen aus Welts Bau: `welt/kielmund_orte.json` (7a15f662), `welt/regionen/fl_186_225`.

- **Datei:** `realtime/shared/quest_kielmund.ts`
- **Stand:** im Spiel (`shared/quests.ts`)
- **Welt-Test:** `realtime/test/kielmund-welt.test.mjs` (Ports 8865/8866, etwa 220 s; davon 3 Minuten Räuchern) spielt alle vier zugleich durch.
- **Rahmen:**
  - alle vier nach G1 „Die Südstraße“
  - je 1 Questpunkt
  - keine neuen Gegenstände, keine neuen Rezepte
  - das Leuchtfeuer bleibt bei G2

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| „Lichter im Nebel“ | `kielmund_lichter_im_nebel` | Hafenmeisterin Ilka · Kisten ohne Siegel am Kai · Wiebke fragen · 3 falsche Lichtzeichen (Mole, Klippen, Wrack) · 2 Strandräuber am Wrack · Liste der Hehler · Ende bei Kranich | **Wiebke Strand** (Leuchtfeuer, G2), **Jasper Kranich** | Stärke 1.200, Defense 1.200, 300 Splitter |
| „Kiel auf Stapel“ | `kielmund_kiel_auf_stapel` | Werftmeister Okko · 2 Segeltuch (`stoff_hanf`, Werkbank) · 2 Eisenbarren (Esse) · Eiche von Jost · Stapellauf an der Werft | **Hofwächter Jost** (Holzfällerhof Erlengrund) | Handwerk 900, Schmieden 900, 250 Splitter; Schalter `kielmund_neues_boot` |
| „Suppe für die Altstadt“ | `kielmund_suppe_fuer_die_altstadt` | Schwester Maren · 2 Mühlbarsche vom Fischmarkt · 3 Heringe am Kai · Bente (4 Garn → 2 Heringe) · 2 Fischsuppen am Kessel · 5 Räucherheringe · Speisung am Tempel | **Bente Möller** (Möwenbucht, G4) | Fischen 800, Kochen 800, 200 Splitter |
| „Der Brief des Ratsherrn“ | `kielmund_brief_des_ratsherrn` | Ratsherr Edzard · Briefe an Ilka (Hafen), Samira (Kaufmannsviertel, Salz zurück), Maren (Altstadt), Hanne (Fischerquartier, Brot zurück) | alle vier Viertel | Geschick 800, 150 Splitter |

## Entscheidungen

- **Fischsuppe:** das vorhandene Rezept `fischsuppe` (Kessel, Mühlbarsch + Wasser). Die Mühlbarsche gibt der Fischmarkt.
  - Die Heringe vom Kai und von Bente werden zu Räucherheringen.
  - Kein neues Rezept nötig.
- **Werft:** Planken (`brueckenplanke`) und Tau (`hanftau`) sind Quest-Rezepte von C1 und B2 und dort gesperrt. Darum baut man das Boot aus Dingen, die man frei herstellt:
  - Segeltuch (`stoff_hanf`)
  - Eisenbarren
  - Eichenstämme
- **Eiche als Brennstoff:** Eisenbarren verbrauchen einen Stamm als Brennstoff, und Eiche steht dort an erster Stelle.
  - Okko warnt, man soll mit Tanne heizen.
  - Wer die Eiche trotzdem verfeuert, bekommt von Jost noch einmal zwei Stämme.

## Figuren

**Neu (Namen von Quests):**

| Figur | Modell | Ort |
|---|---|---|
| Hafenmeisterin Ilka Brandt | `npc.hafen_frau` | Kai, 6388,5 \| 7314,5 |
| Werftmeister Okko Spant | `npc.hafen_mann` | Werft, 6381,5 \| 7323,5 |
| Ratsherr Edzard Wellmann | `npc.kaufmann` | vor dem Haus der Küstenhäuser, 6417,5 \| 7299,5 |

**Aus `laeden.ts`** (Integration bitte `questFigur` setzen, sonst stehen sie doppelt da):

| Laden | Figur |
|---|---|
| `kielmund_priesterin` | `maren` |
| `kielmund_fischmarkt` | `wiebke_hering` |
| `kielmund_gewuerze` | `samira` |
| `kielmund_baecker` | `hanne_kombuese` |
| `zunft_wache_holzfaellerhof` | `hofwaechter_jost` |

**Aus Block G (unverändert):** Jasper Kranich, Wiebke Strand, Bente Möller.

## Für Welt/Systeme (optional)

- **Schalter `kielmund_neues_boot`** (nach „Kiel auf Stapel“): ein zweites Boot sichtbar im Hafen. Die Werft hat heute `kielmund_werft_boot` (Fähre) auf der Helling.
