# HUD und Fenster überarbeiten – kompakt, einfach, ohne Scrollen

Wunsch des Nutzers (26.11.2026): Das HUD wird überarbeitet. Alles **möglichst kompakt**, **einfach** und **am liebsten ohne Scrollen**.
Zuständig: Chat **„Riftmere · Oberfläche“** (`rolle:ui`). Die neuen Symbole aus #30 (Skills), #32 (Menüleiste) und #33 (Karte) bleiben die Grundlage.

## Grundregeln

1. **Festes Gerüst, die Mitte bleibt frei.** Alles am Rand: Minikarte oben rechts, Leben/Ausdauer daneben, Menüleiste am Rand, Chat unten links. Nichts schwebt frei, nichts überlappt.
2. **Ein Fensterplatz.** Rucksack, Ausrüstung, Skills, Quests, Freunde, Einstellungen öffnen sich **im selben Kasten** an derselben Stelle (gleiche Größe) – man wechselt nur den Inhalt.
   Große Fenster (Bank, Handel, Läden, Weltkarte) liegen in der Mitte, immer nur eins.
3. **Kein Scrollen.** Raster und Listen sind so gebaut, dass sie in den Kasten passen (Rucksack 4×7, Skills als Raster, Bank mit Reitern statt langer Liste). Wird es eng: Symbole kleiner, nicht scrollen.
   Ausnahme nur, wo es wirklich nicht geht (Chatverlauf, lange Questtexte) – dort schlicht und deutlich.
4. **Wenige Farben.** Ein Rahmenstil für alles (Gold auf Dunkel). Gold = Rahmen und Text, Farbe = Zustand (rot Leben, gelb Ausdauer, blau/violett Splitter, grün „bereit/angenommen“).
5. **Verzierung nur im Titel.** Keine Glüh-, Verlaufs- oder Lorbeer-Effekte im Fensterinhalt; Glühen nur am gerade gewählten Feld.
6. **Eine Symbolgröße je Ebene** (Menüleiste, Rasterfelder, Kartensymbole), Symbole mittig im Feld, Mengen klein oben links.
7. **Zahlen statt großer Balken** wo möglich (Leben/Ausdauer als schlanke Leiste mit Zahl).
8. **Handy zuerst.** Hochformat ~390 px und Querformat; PC ist die große Fassung desselben Gerüsts. Daumen-Reichweite: wichtige Knöpfe unten.

## Was überarbeitet wird (Bestand im Client)

| Teil | Datei(en) heute |
|---|---|
| Rahmen, Seitenfenster (Rucksack, Ausrüstung, Skills, Berufe) | `client/src/rahmen.ts`, Stile in `client/index.html` |
| HUD (Leben, Ausdauer, Hinweise, Wirkungsschild) | `client/src/hud.ts`, `client/src/wirkanzeige.ts`, `client/src/sprintzustand.ts` |
| Menüleiste rechts/links | `client/src/welt3d/oberflaeche.ts`, `client/src/symbole.ts`, `client/src/symbolordnung.ts` |
| Minikarte, Weltkarte | `client/src/weltkarte.ts`, `client/src/zoom.ts` |
| Chat | `client/src/kanal.ts` |
| Aktionsmenü (lange drücken) | `client/src/aktionsmenue.ts` |
| Bank, Läden, Dialoge, Freunde, Gruppe | `bank.ts`, `laden.ts`, `dialog.ts`, `freunde.ts`, `gruppe.ts` |

## Vorgehen

**Grundsatz (Nutzer, 26.11.): Nichts wird einfach so geändert.** Jede Änderung an HUD oder Fenstern – auch kleine – zuerst als **Vorschau** (Bilder, gern vorher/nachher, Handy und PC) zeigen und **gemeinsam mit dem Nutzer ausarbeiten**. Erst nach seinem ausdrücklichen Okay committen.


1. **Entwurf zuerst:** klickbarer Prototyp (nur Scratchpad, nichts committen) für Handy hoch/quer und PC mit allen Fenstern – dem Nutzer als Bilder zeigen, Rückmeldung abwarten.
2. **Dann Schritt für Schritt umbauen** – jeder Schritt wieder mit Vorschau und Okay des Nutzers – je Schritt ein Commit mit Tests (betroffene `*-ui.test.mjs`) und Bildschirmfotos im Issue: Gerüst + Menüleiste → Seitenfenster (ein Kasten) → HUD-Leisten → Chat → große Fenster (Bank, Läden, Dialoge) → Karte.
3. Neue Fenster aus den Systemen (z. B. **Handel #65**, Wirkungen, Set-Symbol, geladene Waffen) baut die Oberfläche **im neuen Stil**; Systeme liefert die Daten und Ereignisse.
