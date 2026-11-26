# Handel zwischen Spielern

Konzept vom 26.11.2026 (Leitstelle), Wunsch des Nutzers. Vorbild für den Aufbau: ein schlichtes Handelsfenster mit zwei Seiten
(„Dein Angebot“ / „Sein Angebot“), Annehmen und Ablehnen – **im Stil von Riftmere** (Gold auf Dunkel, Symbole aus #30/#32), **kompakt, ohne Scrollen**.

## Ablauf

1. **Anfrage:** anderen Spieler lange drücken / rechts anklicken → Aktionsmenü → **„Handeln“**.
   Beim anderen erscheint im Chat (Kanal System, hervorgehoben) „**Name möchte mit dir handeln.**“ – Antippen der Zeile oder selbst „Handeln“ auf den Anfragenden öffnet das Fenster.
   Anfrage verfällt nach 30 s. Beide müssen im selben Gebiet und höchstens ~8 Felder voneinander entfernt sein; nicht im Kampf.
2. **Fenster 1 – Angebot:** Jeder legt Gegenstände aus seinem Rucksack hinein (antippen = 1, lange drücken = Menge wählen: 1 / 5 / 10 / X / Alle) und optional **Splitter** (eigenes Feld mit Zahl).
   Antippen eines angebotenen Gegenstands nimmt ihn wieder heraus.
   **Annehmen** färbt die eigene Seite grün; der andere sieht „Name hat angenommen“. **Jede Änderung** an einem der beiden Angebote setzt beide Annahmen zurück.
3. **Fenster 2 – Bestätigen:** Wenn beide angenommen haben, kommt eine **Zusammenfassung** als Liste („Du gibst: … / Du bekommst: …“), keine Änderung mehr möglich.
   Erst wenn beide hier **noch einmal** annehmen, tauscht der Server. (Schutz gegen Last-Second-Tricks.)
4. **Tausch:** auf dem Server **in einem Schritt** (alles oder nichts), danach Meldung „Handel abgeschlossen.“ Ablehnen, Weglaufen (> 8 Felder), Kampf, Gebietswechsel, Teleport oder Verbindungsabbruch brechen ab – nichts wechselt den Besitzer.

## Regeln

| Regel | Wert |
|---|---|
| Plätze je Seite | so viele wie der Rucksack, Stapel zählen als ein Platz |
| Platz-Prüfung | Mitte zeigt „Name hat N freie Plätze“; Annehmen geht nicht, wenn der Empfänger keinen Platz hat (Stapel mit Vorhandenem zählen mit) |
| Nicht handelbar | **geladene Waffen „(s)“** (Kanon), Questgegenstände, Belohnungen mit Kennzeichen `gebunden` (z. B. Rabenset, Klinge des Grauen Hauptmanns – Liste vor dem Einbau festlegen). Sie erscheinen im Rucksack-Teil des Fensters ausgegraut |
| Wert-Anzeige | je Seite „Wert: N Splitter“ = Summe der Ladenpreise (wo es einen gibt), nur als Orientierung |
| Gäste | handeln nicht (nur mit Konto) |
| Gerätesperre | gilt wie immer – ein Konto, ein Gerät |
| Protokoll | Server schreibt jeden abgeschlossenen Handel ins Log (wer, was, wann); später in eine Tabelle (Migration mit Rückbau), falls Betrugsfälle zu klären sind |

## Fenster (kompakt, ohne Scrollen)

**PC / Querformat** – ein Fenster über der Spielwelt, Rucksack bleibt rechts sichtbar:

```
┌──────────────── Handel mit Name ───────────────── ✕ ┐
│  Dein Angebot          │ Name hat 21 freie │  Angebot von Name     │
│  [ Raster 4×4 ]        │ Plätze            │  [ Raster 4×4 ]       │
│  ◆ 120 Splitter        │  [ Annehmen ]     │  ◆ 0 Splitter         │
│  Wert: 340             │  [ Ablehnen ]     │  Wert: 0              │
└───────────────────────────────────────────────────────────────────┘
          Rucksack (rechts wie immer) – antippen legt ins Angebot
```

**Handy / Hochformat** – drei Bänder übereinander, alles auf einen Blick:
oben „Angebot von Name“ (Raster 7×2 + Splitter), Mitte schmale Leiste (freie Plätze, Annehmen, Ablehnen), darunter „Dein Angebot“ (7×2), unten der **eigene Rucksack** (7×4) zum Antippen.
Mehr als 14 Plätze je Seite: Raster wird enger (Symbole kleiner), nicht scrollen.

Stil: Rahmen und Knöpfe wie die übrigen Fenster (Bank, Rucksack), grüne Umrandung bei „angenommen“, Hinweistext in Gold.

## Wer macht was

| Rolle | Aufgabe |
|---|---|
| Systeme | Handel auf dem Server (Anfrage, Zustand, zwei Bestätigungen, atomarer Tausch, Abbruchgründe, Platz-Prüfung, nicht handelbare Gegenstände, Log) + Fenster im Client + Tests (zwei Spieler: erfolgreicher Tausch, Änderung setzt zurück, Abbruch bei Weglaufen, kein Platz, geladene Waffe abgelehnt) |
| Integration | Kennzeichen `gebunden` an den betroffenen Gegenständen eintragen; Menüpunkt „Handeln“ im Aktionsmenü, falls das Menü bei Integration liegt |
| Figuren | (optional) Symbol „Handel“ im Stil von #32 für Menü und Chat-Zeile |

## Offen (Nutzer)

- Welche Belohnungen sollen **gebunden** (nicht handelbar) sein? Vorschlag: Quest-Belohnungen mit eigenem Namen (Rabenset, Klinge des Grauen Hauptmanns, Rotes Banner), Rabenküken.
- Maximale Entfernung zum Handeln (Vorschlag 8 Felder) oder überall im selben Gebiet?
