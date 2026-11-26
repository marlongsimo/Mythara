# Phase 6 „Raben-Trilogie & Aschenwerth“ – Rabenpriester, C1–C3, Rabengrund, Bossing

Konzept vom 26.11.2026 (Leitstelle). Grundlage: `doku/quests/3-raben-trilogie.pdf`, Beute `doku/konzepte/beute.md`, Kanon `doku/KANON.md`.
**Startet nach Phase 5** (braucht Wirkungen/Tränke, geladene Waffen und den Set-Bonus) und nutzt den **Boss-Baukasten und die Instanzen aus Phase 4** (Rotmantel).

## Ziel

Der rote Faden aus A2 („Federn wie schwarzer Schnee“) und B4 (Brief mit Rabensiegel: „Für jeden Splitter eine Feder. Die Insel wartet. – Der Oberste“) wird aufgelöst.
Spieler verdienen das **Rabenset** Stück für Stück (Kapuze → Beinschützer → Panzer) und schalten den ersten **wiederholbaren Boss** frei.

## Änderungen gegenüber dem PDF (Kanon, entschieden bzw. von Welt gebaut)

| PDF | Jetzt |
|---|---|
| Steinkreis-Insel im Schwarzmoor, Kahn von Joost | Insel **Aschenwerth**. In C1 wird die **morsche Brücke** repariert (Objekt `moor_bruecke_morsch_01`), kein Kahn. Joost bleibt Fischer (Fischen-Bezug). |
| ein Steinkreis mit 7 Menhiren | **zwei Steinkreise** in C2 (je ein Teil des Lieds) |
| Einstieg durch den Schrein | Einstieg durch die **Gruft** auf Aschenwerth |
| Rabengrund als Idee | Gebaut (Welt #23): Einstieg, Federgänge mit drei Nischen, Kerker mit vier Käfigen, Splitterbecken-Halle, **Thronsaal als eigenes Gebiet, als Instanz kopierbar** (Becken, vier Säulen, Altar) |
| Holzfällerei 35 / Handwerk 25 für C1 | bleibt (Moorweiden-Planken), Alternative für Schwächere: Harm verkauft Planken für 40 Splitter je Stück |

## Was es schon gibt

| Was | Stand |
|---|---|
| Rabenmoor-Dorf mit Bertold Krähe, Joost, Mutter Hedda, Harm, Ilse, Jorin | Welt ✅, NPCs 3D (Figuren #28) ✅, Dialoge fehlen |
| Aschenwerth, Lager, Gruft, Rabengrund, Thronsaal | Welt #23 ✅ |
| Rabenpriester-Varianten (Novize, Akoluth), Moorrabe, Federmutter, Oberster mit Flug, Rabenküken, Beute-Bilder | Figuren #20 ✅ (Einbau #26) |
| Rabenset mit Set-Bonus | Daten ✅, Kampf in Phase 5d |
| Boss-Baukasten, Instanzen, Türen/Schlüssel, Bosszähler | Phase 4 (Rotmantel) |
| Beutetabellen | `beute.md` ✅ |

## Gegner (Werte-Vorschlag)

| Gegner | Stufe | LP | max. Treffer | Kampf | Wo |
|---|---|---|---|---|---|
| Moorrabe | 20 | 25 | 4 | Nahkampf, schnell, in Schwärmen (3–5) | Federgänge, Moor bei Nacht |
| Rabenpriester-Novize | 28 | 60 | 7 | Magie (Stab), schwach gegen Fernkampf | Steinkreis Aschenwerth |
| Akoluth (Bogen) | 35 | 85 | 9 | Fernkampf, hält Abstand | Heiligtum, Rabengrund |
| Akoluth (Speer) | 35 | 95 | 10 | Nahkampf, Ansturm | Heiligtum, Kerker (Kerkermeister) |
| Federmutter Ravena | 40 | 200 | 12 | Mini-Boss: wechselt alle 20 s Stab/Bogen/Speer, sichtbar an der Waffe | Steinkreis (C2) |
| Oberster Rabenpriester | 55 | 350 | 18 (Nahkampf) / 25 (Flügelschlag) | Boss, 2×2 Felder, drei Phasen | Thronsaal (Instanz) |

Beute je Gegner: `beute.md` (Novize, Akoluth, Moorrabe, Federmutter, Oberster).

## Quests

**C1 „Schwarze Federn“** – Bertold Krähe (Langhaus Rabenmoor). Voraussetzung: B4, Holzfällerei 35, Handwerk 25, Heldenlevel 30.
Brief aus B4 zeigen → Bertold erzählt von Ebbo und den Lichtern auf Aschenwerth → die alte Brücke ist morsch →
4 Moorweiden fällen → Harms Werkbank: 4 Brückenplanken (Quest-Rezept, Handwerk 25) → Köhler Ulf (Köhlerlichtung) brennt Meilerpech gegen 5 Tannen →
Brücke flicken (Questobjekt `moor_bruecke_morsch_01`) → am Steinkreis 3 Novizen → Ebbo gefesselt am Menhir, flieht → Novizenkapuze am Ufer, Bertold erkennt das Zeichen.
Lohn: **Rabenkapuze**, Magie 600, Defense 600, LP 300 XP (+ Berufe-XP über die Schritte), 1 Questpunkt. Schalter `bruecke_aschenwerth` (Brücke begehbar), **Wegstein-Ziel „Rabenmoor“**.

**C2 „Der Gesang der Spiralsteine“** – Mutter Hedda (Heddas Insel). Voraussetzung: C1, Defense 25, Magie oder Fernkampf 30.
Hedda gibt Moorglöckchen-Wachs („sonst singst du mit“) → mit **aufgesetzter Rabenkapuze** greifen Novizen nicht an (Akoluthen schon) →
an beiden Steinkreisen lauschen, während der Orden singt (alle 2 Minuten ein Gesang, je Kreis Teile des Lieds) → 3 Akoluthen, je ein Federsiegel (in C2 garantiert) →
Hedda setzt die Silben zusammen (Reihenfolge je Spieler zufällig beim Annehmen) → Spiralsteine in Reihenfolge berühren → die Gruft öffnet sich →
**Federmutter Ravena** steigt auf (Mini-Boss) → Hedda: „Unter dem Stein sind sie. Alle. Auch Liske.“
Lohn: **Rabenbeinschützer**, Fernkampf 800, Magie 600, Defense 800 XP, 1 Questpunkt. Schalter `gruft_offen` (Abstieg in den Rabengrund).

**C3 „Der Oberste Rabenpriester“** – Mutter Hedda / Bertold. Voraussetzung: C2, Heldenlevel 40 empfohlen, Defense 30.
Abstieg durch die Gruft → Federgänge (Moorraben, Akoluthen) → Kerker: Kerkermeister trägt den Schlüssel, vier Käfige (Ebbos Bruder, **Liske**, zwei weitere), Befreite folgen bis zur Treppe →
Splitterbecken: Heddas Phiole Moorwasser hineingießen (Becken trüb = Boss heilt sich nicht) → **Thronsaal (Instanz): der Oberste Rabenpriester** →
Becken zerbricht, Splitter regnen als Beute → Fest im Langhaus, Bertold überreicht den Rabenpanzer (Harm hat ihn aus den Federn des Obersten geschmiedet).
Lohn: **Rabenpanzer (Set komplett)**, je 1.000 XP Geschick/Stärke/Defense und Fern- **oder** Magie (Wahl im Abschlussgespräch), 1.000 Splitter, 2 Questpunkte.
**Wegstein-Ziel „Aschenwerth“**, **Bindestein** am gereinigten Splitterbecken (Phase 5b), Seelenlicht 65 „Splitterlicht“ über dem Becken, **Bossing frei**.

## Bosskampf: Der Oberste Rabenpriester

| Phase | Verhalten | Gegenmittel |
|---|---|---|
| 1 · 100–60 % | zwei Schwerter, **Doppelhieb** (zwei Treffer in einem Tick) | Defense, Set-Heilung, Tränke |
| 2 · 60–30 % | **erhebt sich** über das Becken (15 s, für Nahkampf unerreichbar, Flug-Animation von Figuren); **Sturzraben**: 3–5 Felder leuchten 2 Ticks vorher, dann Einschlag; ruft 2 Akoluthen | ausweichen, Fern/Magie solange er schwebt, Helfer zuerst |
| 3 · unter 30 % | **Schwarzer Flügelschlag** alle 6 Ticks: hoher Schaden im ganzen Saal außer hinter einer der **4 Säulen** (Windschatten) | hinter Säule, zwischen den Schlägen angreifen |
| immer | heilt sich am Becken, außer es ist getrübt | Moorwasser von Hedda |

Alles mit dem **Boss-Baukasten aus Phase 4** (Ansage-Felder, Phasen nach LP, Helfer, Heilort) – neu sind nur **Schweben** (unangreifbar für Nahkampf) und **Deckung** (Säule blockt Flächenangriff).

## Bossing (nach C3)

| Baustein | Regel |
|---|---|
| Eintritt | ein **Federsiegel** je Versuch: Beute der Akoluthen (1/12) oder herstellen (Splitterbinden: 25 Rabenfedern + 50 Splitter) |
| Instanz | eigener Thronsaal je Versuch – **allein** (Gruppe offen, siehe unten) |
| Schwierigkeit | Wiederhol-Version heilt sich am Becken, wenn man kein Moorwasser mitbringt (Hedda verkauft es, 20 Splitter) |
| Wiederholen | nach dem Sieg „Noch einmal?“ an der Treppe (neues Siegel) oder hinauf |
| Zähler | Bosssiege und Bestzeit je Konto, im Questlog („Raben-Zähler: 37 · Bestzeit 2:41“) |
| Beute | `beute.md` (Splitter, Federn, Ressourcen, Selten 1/16, Episch 1/64, Legendär 1/512, Splitterkern 1/64, Rabenschwinge 1/256, Rabenküken 1/2000) |
| Seltenes sichtbar | Chat-Meldung, Lichtstrahl am Boden bei Einzigartigem |

## Neu im System (Integration)

| Baustein | Größe | Anmerkung |
|---|---|---|
| **Verkleidung**: Aggression abhängig von angelegter Ausrüstung (Rabenkapuze → Novizen friedlich) | S | Gegner-Eintrag `friedlichMit: ["rabenkapuze"]` |
| **Gesang mit Zeitfenster** (Questobjekt nur alle 2 min „hörbar“) | S | Weltuhr auf dem Server |
| **Rätsel-Reihenfolge je Spieler** (Zufall beim Annehmen, im Queststand gespeichert) | S | Quest-Baukasten: Zufallswert im Stand |
| **Folgen** (Befreite laufen hinter dem Spieler bis zu einem Ziel) | M | gleiche Technik später für das Rabenküken |
| **Schweben** und **Deckung** im Boss-Baukasten | M | Erweiterung Phase 4 |
| **Stilwechsel** (Federmutter wechselt Waffe und Angriffsart nach Zeit) | S | Gegner mit mehreren Angriffsarten |
| Federsiegel als Eintritt, Rezept Federsiegel | S | Splitterbinden-Rezept |
| Bosszähler + Bestzeit (Migration mit Rückbau) | S | evtl. schon aus Phase 4 |
| Begleiter Rabenküken (folgt, kein Kampf) | M | kann nach Phase 6 kommen |

## Wer macht was

| Rolle | Aufgabe | Issue |
|---|---|---|
| Integration | Gegner und Beute, Boss, Bossing, neue Systembausteine | #17, #18, #26 (+ Liste oben) |
| Quests | C1–C3 als Entwurf (Dialoge für Bertold, Joost, Hedda, Harm, Ebbo, Liske), Bausteinliste ins Issue | neues Issue |
| Welt | Nichts Großes mehr offen; prüfen: zwei Steinkreise mit Spiralsteinen als Questobjekte, Heddas Insel mit Kessel, Treppe/Ausgang im Kerker | neues Issue (klein) |
| Figuren | Flug- und Angriffsbewegungen des Obersten prüfen (Doppelhieb, Erheben, Flügelschlag), Liske/Ebbo als Gefangene (gefesselt, befreit) | nur falls noch nicht in #20 |

## Fertig, wenn …

- C1–C3 spielbar, Rabenset vollständig erhältlich, Set-Bonus wirkt.
- Der Oberste ist als Quest- und als Wiederhol-Boss besiegbar, mit Beute und Zähler.
- Alle Tests grün (Quest-Welt-Tests C1–C3, Bosskampf mit Phasen, Instanz je Spieler, Federsiegel-Eintritt).

## Offen (Nutzer)

- **Bossing allein oder in Gruppen?** Vorschlag: zum Start allein; Gruppe (bis 3, Boss mit mehr LP) als eigener Schritt danach.
- Soll **Alwine die Stumme** (alte Kampagne) als Geist im Rabengrund warnen?
- Rotmantel nach B4: öffentlich oder Instanz? (betrifft den gemeinsamen Boss-Baukasten)
