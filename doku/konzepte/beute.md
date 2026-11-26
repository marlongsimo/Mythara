# Beutetabellen – Bosse und neue Gegner (Phase 4 und 6)

Konzept vom 26.11.2026 (Leitstelle). Format wie in `realtime/shared/config.ts` (`drops: [{ wurf: [{ g, chance, anzahl }] }, …]`):
jeder **Wurf** wählt höchstens einen Eintrag, Chancen in Prozent; `nur:` = nur in einem Questschritt.

## Grundsätze

1. **Vier Würfe je Gegner:** ① Grundlohn (fast immer Splitter) · ② Ressourcen für die Berufe · ③ Ausrüstung (selten) · ④ Einzigartiges (nur Bosse) · dazu Questbeute mit `nur:`.
2. **Splitter decken das Laden.** Eine geladene Waffe kostet 2 Splitter je Angriff – bei einem Angriff alle 2–3 Sekunden etwa **40–60 Splitter pro Minute**.
   Ein Boss muss deshalb so viel Splitter geben, dass sich geladene Waffen gegen ihn lohnen, aber nicht von selbst bezahlen:
   Rotmantel (ca. 2 min Kampf) ≈ 120 Splitter, der Oberste Rabenpriester (ca. 4 min) ≈ 450 Splitter im Schnitt.
3. **Ressourcen füttern die Berufe**, statt fertige Ausrüstung zu verschenken: Barren, Erz, Holz, Leder, Garn, Kräuter, Seelenlichter.
   Ausrüstung fällt selten – Schmieden und Handwerk bleiben der Hauptweg zu guter Ausrüstung.
4. **Einzigartiges gibt es nur beim Boss** – der Grund, ihn zu wiederholen. Keine Werte, die alles andere überflüssig machen.
5. **Ausrüstung eine Stufe über dem Gegner nur sehr selten**, die eigene Stufe gelegentlich.
6. **Jede neue Ressource hat einen Verbrauch** (keine toten Gegenstände) – siehe Rabenfedern.

## Hauptmann Rotmantel (Mini-Boss, Phase 4, Stufe ~32, öffentlich, 3 min Wiederkehr)

| Wurf | Eintrag | Chance | Anzahl |
|---|---|---|---|
| ① immer | Splitter | 100 % | 80–160 |
| ② Ressourcen | Eisenbarren | 20 % | 3–5 |
| | Schwarzeisenerz | 15 % | 4–8 |
| | Leder (Stufe Selten) | 15 % | 2–4 |
| | Heiltrank | 15 % | 2–3 |
| | Garn | 10 % | 20–40 |
| | Seelenlicht | 10 % | 3–5 |
| | Splitter (Beutel) | 10 % | 150–250 |
| | – nichts – | 5 % | |
| ③ Ausrüstung | Waffe oder Rüstung der Stufe **Selten** (zufällig) | 4 % (≈ 1/25) | 1 |
| | Waffe der Stufe **Episch** | 0,5 % (1/200) | 1 |
| ④ Einzigartig | **Rotes Banner** (Zierde; später Haus/Gildenhalle) | 1/150 | 1 |
| | **Rotmantels Klinge** (Zweihänder zwischen Selten und Episch, eigenes Aussehen) | 1/400 | 1 |

Der erste Sieg in Quest B4 gibt den Questlohn (feste Selten-Waffe nach Wahl) – die Tabelle gilt danach.

## Der Oberste Rabenpriester (Boss, Phase 6, Stufe ~55, Instanz, Eintritt: Federsiegel)

| Wurf | Eintrag | Chance | Anzahl |
|---|---|---|---|
| ① immer | Splitter | 100 % | 300–600 |
| ① immer | Rabenfedern | 100 % | 10–25 |
| ② Ressourcen | Sterneisenbarren | 18 % | 3–6 |
| | Splittereisenerz (erste Quelle vor Graufurt) | 12 % | 5–10 |
| | Moorweidenstämme | 15 % | 10–20 |
| | Kernbaumstämme | 10 % | 5–10 |
| | Seelenlicht | 15 % | 10–20 |
| | Kräuter der Stufe 35–45 (Eisenhut, Nebelkraut) | 10 % | 5–10 |
| | Starke Tränke | 10 % | 2–4 |
| | **Federsiegel** (nächster Eintritt) | 10 % | 1–2 |
| ③ Ausrüstung | Selten | 1/16 | 1 |
| | Episch | 1/64 | 1 |
| | Legendär | 1/512 | 1 |
| ④ Einzigartig | **Splitterkern** (Splitterbinden: Wegstein fasst 200 statt 100 Ladungen; später Verstärkungen) | 1/64 | 1 |
| | **Rabenschwinge** (Einhandschwert, Episch-Werte, eigenes Aussehen, höhere Abwehr gegen Magie) | 1/256 | 1 |
| | **Rabenküken** (Begleiter, folgt dir) | 1/2000 | 1 |

Das Rabenset gibt es nur über die Quests (C1–C3), nicht als Beute.

## Neue Gegner

| Gegner (Phase) | ① Splitter | ② Ressourcen | ③ Ausrüstung | Quest (`nur:`) |
|---|---|---|---|---|
| Banditen-Späher (4, Stufe ~18) | 90 %: 3–10 | Leder 15 % · Garn 10 % (5–10) · Äpfel 10 % (1–3) · Kleiner Heiltrank 8 % | Kurzbogen Einfach 1/64 | Karrenbrief (B3, garantiert beim 5.) |
| Bandit-Schläger (4, ~22) | 90 %: 5–12 | Eisenerz 15 % (1–3) · Heiltrank 5 % | Nahkampfwaffe Selten 1/128 | Schlüsselbund (B4) |
| Armbrustschütze (4, ~24) | 90 %: 5–12 | Tannenstämme 15 % (1–2) · Garn 10 % | Armbrust Einfach 1/64 | – |
| Rabenpriester-Novize (6, ~28) | 90 %: 8–15 | Rabenfedern 50 % (1–3) · Moorglöckchen 15 % · Seelenlicht 10 % | Zauberstab Selten 1/128 | – |
| Akoluth (6, ~35) | 90 %: 10–20 | Rabenfedern 60 % (2–5) · Seelenlicht 15 % | Bogen/Speer Selten 1/96 · Episch 1/1024 | Federsiegel 1/12 (Boss-Eintritt); in C2 garantiert 3 |
| Moorrabe (6, ~20, viele) | 50 %: 1–3 | Rabenfedern 40 % (1) | – | – |
| Federmutter Ravena (6, Mini-Boss) | 100 %: 100–200 | Rabenfedern 100 % (5–10) · Seelenlicht 30 % (3–6) | Selten 1/20 | – |

## Verbrauch der neuen Ressourcen

- **Rabenfedern:** Splitterbinden – **Federsiegel herstellen** (25 Rabenfedern + 50 Splitter → 1 Federsiegel) als zweiter Weg zum Boss; später Federschmuck/Verstärkungen.
- **Seelenlicht:** ersetzt beim Laden einen der zwei Splitter (Phase 3a).
- **Splitterkern:** einmalig am Wegstein einsetzen (200 Ladungen).
- **Rotes Banner, Rabenküken:** Sammelstücke, zeigen den Erfolg.

## Was technisch dazukommt

- Gegner-Einträge mit diesen Tabellen (`config.ts`), neue Gegenstände (Rabenfedern, Federsiegel, Splitterkern, Rotes Banner, Rotmantels Klinge, Rabenschwinge, Rabenküken).
- **Seltene Funde sichtbar machen:** Meldung im Chat, kurzer Lichtstrahl am Boden bei Einzigartigem.
- **Bosszähler** je Konto (wie oft besiegt) – Grundlage für spätere Anzeigen.
- Begleiter (Rabenküken) braucht eine Figur, die dem Spieler folgt – kann nach Phase 6 kommen.
