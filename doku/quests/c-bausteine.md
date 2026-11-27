# Phase 5–6 – „Miras Rezeptbuch“ und die Raben-Trilogie C1–C3: was dem Baukasten fehlt

Rolle Quests, 26.11.2026. Dateien: `realtime/shared/quest_mira.ts`, `quest_c1.ts`, `quest_c2.ts`, `quest_c3.ts`, als **Entwurf** in `shared/quest_entwuerfe.ts`.
Grundlage: `doku/konzepte/phase-5.md`, `phase-6.md`, `doku/quests/3-raben-trilogie.pdf`. Stellen aus der Welt (#23, #35, Zweig `claude/mythara-world-pipeline-z4ynx5`),
Modelle aus der Figuren-Fabrik (`npc.hedda`, `npc.bertold`, `npc.joost`, `npc.harm`, `npc.ebbo`, `npc.liske`, `npc.kraeuterfrau`). Lohn höchstens 1.000 je Skill (Migration 048).

## Änderung an B4
Othmar **behält den Rabenbrief nicht mehr**. Der Spieler nimmt ihn mit, weil Bertold ihn in C1 sehen will. Wer ihn nicht mehr hat, bekommt von Bertold dieselbe Geschichte, nur ohne Brief.

## Für den Motor (Rolle Spiel)

| # | Baustein | Wo | Vorschlag |
|---|---|---|---|
| 1 | **Figur in mehreren Quests** | Hedda (Mira, C2, C3), Bertold (C1, C3), Ulf (A2, C1) – dazu Othmar (B3/B4) und Merit (D1/D2) | siehe `b3-b4-bausteine.md` |
| 2 | **Händlerin als Questfigur** | Mira steht als Laden in `laeden.ts` (traenke, 6456 · 6441) | Laden und Gespräch an derselben Figur: Antwort „Laden“ neben den Quest-Antworten, oder der Laden öffnet sich nach dem Gespräch |
| 3 | **Verkleidung** | C2: mit angelegter `rabenkapuze` greifen Novizen nicht an | Gegner-Eintrag `friedlichMit: ["rabenkapuze"]` (Konzept) |
| 4 | **Gesang mit Zeitfenster** | C2: Questobjekte `c2_kreis_moor`, `c2_kreis_insel` nur „hörbar“, während der Orden singt (alle 2 min) | Objekt-Eigenschaft `zeitfenster` (Weltuhr des Servers). Sonst gilt ein `sonst`-Text: „Die Steine schweigen. Warte auf den Gesang.“ |
| 5 | **Zufalls-Reihenfolge je Spieler** | C2: Spiralsteine Mond → Welle → Feder → Auge (heute fest) | Zufallswert im Queststand beim Annehmen. Die Texte der Kreise und die Antworten bei Hedda brauchen dann Platzhalter (`{reihe}`) |
| 6 | **Oder-Bedingung** | C2: „Magie **oder** Fernkampf 30“ (heute nicht als Voraussetzung, nur im Konzept) | `Bed.eines: Bed[]` |
| 7 | **Folgen** | C3: befreite Gefangene laufen bis zur Treppe | Konzept „Folgen“ (M) |
| 8 | **Boss und Instanz** | C3: `oberster_rabenpriester` im Thronsaal, Schalter `thronsaal_instanz` (läuft), `becken_trueb` (Becken getrübt → keine Heilung), danach `bossing_oberster`, `bindestein_becken` | Boss-Baukasten aus Phase 4, plus Schweben und Deckung |
| 9 | **Lohn nach Wahl (XP)** | C3: 1.000 XP Fern **oder** Magie nach Wahl im Abschlussgespräch | `Folge.xp` beim Abschluss (wie `geben` bei B4). Bis dahin ohne diesen Teil |
| 10 | **Gegner, die `erlegen` melden** | `rabenpriester_novize` (C1, 3×), `federmutter` (C2), `oberster_rabenpriester` (C3) | |
| 11 | **Bedingte Beute** | `c2_federsiegel` (Akoluthen, chance 100 solange C2 läuft und Siegel fehlen), `c3_kerkerschluessel` (Kerkermeister) | |
| 12 | **Schalter** | `bruecke_aschenwerth` (C1, ab der Brücke), `gruft_offen` (C2, ab dem letzten Stein), `mira_ankauf` (Mira kauft Tränke) | |
| 13 | **Wegstein-Ziele** | „Rabenmoor“ nach C1, „Aschenwerth“ nach C3 | `shared/wegstein.ts` |
| 14 | **Rezepte** | `kleiner_heiltrank` (Kessel, Kräuterkunde 1), `brueckenplanke` (Harms Werkbank, Handwerk 25, 1 Moorweidenstamm → 1 Planke, Quest-Rezept C1) | |
| 15 | **Sammelziele** | `wegerich` (Kräuterkunde), `moorweide` (Holzfällerei 35) | |

## Gegenstände

| Kennung | Was | Quest |
|---|---|---|
| `rezeptheft` | Miras Rezeptheft, Questgegenstand | Mira |
| `meilerpech` | Topf Meilerpech von Ulf | C1 |
| `brueckenplanke` | Quest-Rezept bei Harm | C1 |
| `novizenkapuze` | gefunden am Ufer, geht an Bertold (Lohn: `rabenkapuze`) | C1 |
| `moorwachs` | Moorglöckchen-Wachs von Hedda | C2 |
| `federsiegel` | Beute der Akoluthen (später auch Eintritt zum Boss) | C2 |
| `kerkerschluessel` | Beute des Kerkermeisters | C3 |
| `moorwasser` | Phiole von Hedda, ins Splitterbecken | C3 |
| `rabenbrief` | aus B4, der Spieler behält ihn | C1 |

`rabenkapuze`, `rabenbeinschuetzer`, `rabenpanzer`, `heiltrank` und `stamm_tanne` gibt es schon.

## Stellen

| Was | Stelle (Weltfeld) |
|---|---|
| Mira | 6456 · 6441 (Trankladen) |
| Kessel Kräuterhaus | 6420,9 · 6438,6 (`kessel_kraeuterhaus`) |
| Hedda | 6289,4 · 6677,4 (Dorffigur `hedda`, rabenmoor 17,4 | 21,4) |
| Bertold / Harm / Joost | 6320 · 6697 / 6312,5 · 6701,6 / 6328 · 6726,4 (Dorffiguren, werden Questfiguren) |
| Brücke nach Aschenwerth | 6296,6 · 6700,3 (`bruecke_aschenwerth`) |
| Moorweiden (Pfeil) | 6305,5 · 6712,5 (Vorschlag) |
| Steinkreis im Moor | 6358 · 6675,6 (`schrein_ansehen`) |
| Steinkreis Aschenwerth | 6242 · 6734,4 (`steinkreis`); Spiralsteine Mond / Welle / Feder / Auge um den Kreis (Vorschlag ±2,5) |
| Ebbo am Menhir | 6245,5 · 6738,5 (Vorschlag) |
| Kapuze am Ufer | 6254,5 · 6703,5 (Vorschlag, nahe `bruecke_west`) |
| Gruft | 6188 · 6726,6 |
| Kerker / Splitterbecken | 10645 · 9616 / 10652 · 9667,2 (rabengrund) |
| Thronsaal | 10768 · 9616 (rabengrund_thronsaal) |
| Liske (nach C3) | 6291,5 · 6679,5 neben Hedda |

Die Welt prüft bitte die Vorschläge (Moorweiden, Spiralsteine, Ebbo, Kapuze).
