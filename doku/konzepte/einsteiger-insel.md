# Die Einsteiger-Insel „Ankerholm“

*Entwurf Konzept-Chat, 28.11.2026, noch nicht abgesegnet.* Eigener Riftmere-Entwurf, keine Nachbildung eines anderen Spiels.
Kanon (28.11.): eigene Ankunftsinsel als Quest, etwa 10–15 min. Man lernt kurz Holzfällen, Bergbau, Schmieden, Fischen, Kochen und alle drei Kampfarten und wählt dort die Einsteiger-Ausrüstung. **Pflicht für alle neuen Figuren**, bestehende müssen nicht. Ziel: Ausgabe 2 oder später.
Nutzer (28.11.): **Nach der Insel ist man in der Waldmark.**

## Geschichte

Man kommt mit dem Auswandererschiff **„Seeschwalbe“** von jenseits des Endlosen Meeres, um in den Splitterlanden neu anzufangen.
Kurz vor der Küste trifft das Schiff ein **Splittersturm**: Blaues Licht regnet vom Himmel, der Mast bricht, und die Seeschwalbe läuft vor **Ankerholm** auf Grund, einer kleinen Felseninsel mit einem alten Leuchtfeuer der Wacht.
Damit es weitergeht, muss das Schiff geflickt werden: Holz für den Mast, Beschläge aus der Schmiede, Proviant für die Mannschaft. Dabei lernt man die Splitterlande kennen: Die Splitter, die der Sturm auf die Insel geworfen hat, locken Plünderer an.
Am Ende segelt die geflickte Seeschwalbe mit einem zum Festland. Man steigt in der **Waldmark** an Land, und dort beginnt die erste Quest („Die gesperrte Straße“).

## Figuren

| Figur | Wer | Lehrt |
|---|---|---|
| **Kapitänin Telse Brack** | führt die Seeschwalbe, rau, aber gerecht | Ankunft, Bewegen, Gespräch, Holzfällen |
| **Arvid Thorn** | Schiffszimmermann und Schmied der Mannschaft | Bergbau, Schmelzen, Schmieden |
| **Merle Haff** | Köchin an Bord, wuchs an der Küste auf | Fischen, Kochen |
| **Hauke Morn** | alter Veteran der Wacht, hütet das Leuchtfeuer allein | Kämpfen: Nahkampf, Fernkampf, Magie |

## Karte (grob)

Eine kleine Insel, etwa 120 × 90 Felder, in drei Minuten zu Fuß umrundet:
- **Südstrand:** die gestrandete Seeschwalbe (Startpunkt), Feuerstelle der Mannschaft, Merles Kochplatz, ein Steg mit Fischstellen.
- **Kiefernhain** in der Mitte: wenige Bäume zum Fällen.
- **Felsen im Osten:** zwei Kupferadern, Arvids Behelfsschmiede mit Ofen und Amboss in einer Höhlennische.
- **Nordspitze:** das Leuchtfeuer der Wacht mit Haukes Übungsplatz (drei Übungspuppen) und die Bucht der Plünderer.
- Rundum Meer, kein Weg zum Festland zu Fuß.

## Ablauf (Quest „Gestrandet auf Ankerholm“, etwa 12 min)

| Schritt | Ort | Was man tut | lernt | etwa |
|---|---|---|---|---|
| 1. Gestrandet | Südstrand | Aufwachen am Wrack, Telse ansprechen, zum Feuer laufen | Laufen, Kamera, Gespräch, Rucksack | 1 min |
| 2. Ein neuer Mast | Kiefernhain | Trainings-Holzbeil von Telse, **3 Kiefernstämme** fällen, zum Wrack bringen | Holzfällen, Gegenstände tragen | 2 min |
| 3. Beschläge | Felsen, Schmiede | Trainings-Spitzhacke von Arvid, **2 Kupfererz** abbauen, am Ofen **1 Kupferbarren** schmelzen, am Amboss **Schiffsbeschläge** schmieden | Bergbau, Schmelzen, Schmieden | 3 min |
| 4. Proviant | Steg, Kochplatz | Angel von Merle, **2 Bachlinge** fangen, am Feuer braten; einen davon essen | Fischen, Kochen, Essen heilt | 2 min |
| 5. Haukes Lehre | Leuchtfeuer | Hauke gibt nacheinander Trainingsschwert und -schild, Trainingsbogen und Trainingsstab. **Drei Übungspuppen**, jede nur mit einer Kampfart zu treffen (sie zeigen es an der Farbe) | Nahkampf, Fernkampf, Magie, Waffe wechseln, Kampfstile | 2 min |
| 6. Die Plünderer | Bucht der Plünderer | **3 Plünderer** (schwach) und ihr Anführer, der **„Schwarze Ole“**: eine Mini-Boss-Fassung mit **einem angezeigten Rundumschlag** zum Ausweichen | Kämpfen, Ausweichen, Boss-Anzeige, Beute aufheben | 2 min |
| 7. Die Wahl | Leuchtfeuer | Hauke: „Welcher Weg ist deiner?“ **Ausrüstungswahl** im Abschlussfenster (siehe unten) | Abschlussfenster, Ausrüstung anlegen | 0,5 min |
| 8. Ablegen | Südstrand | Die geflickte Seeschwalbe legt ab, **Ankunft sofort am Steg der Waldmark** (wie bei den Schiffslinien). Bürgermeister Hagan Voss wartet schon | Überleitung zu Quest 1 | 0,5 min |

Hilfen unterwegs: Ein Pfeil zeigt zum nächsten Ziel, und jeder Schritt erklärt die Bedienung in einem Satz (am Handy: Tippen und Halten). Wer stirbt, erwacht am Feuer der Mannschaft, ohne Verlust.

## Ausrüstungswahl (Schritt 7)

Nach der Regel „Belohnung zur Auswahl“ (Kanon): Die Wahl geschieht im Abschlussfenster mit Bild, Werten und Rückfrage („… nehmen?“).

| Weg | Satz |
|---|---|
| **Nahkampf** | Trainingsschwert, Trainingsschild, Trainings-Lederpanzer |
| **Fernkampf** | Trainingsbogen, Trainings-Lederpanzer |
| **Magie** | Trainingsstab, Trainingsrobe |

- Alle Teile gibt es schon (`gegenstaende.ts`, Seltenheit „Anfänger“).
- Die **nicht gewählten** Sätze bleiben erreichbar: Brann Hackebeil in der Waldmark verkauft sie für wenige Splitter, und sie fallen weiter bei den Banditen.
- Holzbeil, Spitzhacke und Angel behält man.
- Die Waffenwahl im **Heldeneditor** entfällt, dort wählt man nur noch das Aussehen. Die Wahl auf der Insel ersetzt sie.

**Lohn:** die gewählte Ausrüstung, die übrigen gebratenen Bachlinge, **50 Splitter** (für die erste Schiffs- oder Wegstein-Nutzung), kleine XP in allen gelernten Berufen und Kampfskills, 1 Questpunkt.

## Was mit dem jetzigen Start passiert

- **Neue Figuren** beginnen auf Ankerholm statt in der Waldmark. Nach Schritt 8 stehen sie am **Steg der Waldmark**, dem neuen Ankunftspunkt (Welt legt ihn ans Ufer bei der Waldmark; gibt es dort kein Wasser, ist es ein Anleger an einem Fluss oder See in der Nähe).
- **Bestehende Figuren** bleiben, wo sie sind, und haben die Quest nicht offen.
- Die Insel gehört **nicht** zu den Schiffslinien. Sie ist nur auf der Hinfahrt erreichbar.

## Wer was baut

| Rolle | Aufgabe |
|---|---|
| Welt | Insel Ankerholm (eigene Region abseits des Festlands), Strand mit Wrack, Kiefernhain, Felsen mit 2 Kupferadern und Schmiede, Steg mit Fischstellen, Leuchtfeuer mit Übungsplatz, Plünderer-Bucht; Anleger an der Waldmark |
| Figuren | Seeschwalbe als Wrack und geflickt, Telse, Arvid, Merle, Hauke, Plünderer, Schwarzer Ole, drei Übungspuppen (je eine Farbe) |
| Systeme | Startpunkt neuer Figuren auf der Insel; Übungspuppen nur mit einer Kampfart treffbar; Ausrüstungswahl im Abschlussfenster; Überfahrt am Ende (Ankunft sofort); Waffenwahl aus dem Heldeneditor nehmen |
| Quests | Quest „Gestrandet auf Ankerholm“ mit Dialogen und Hilfetexten; Übergang zu Quest 1 (Hagan Voss am Anleger) |
| Oberfläche | Hilfetexte und Zielpfeil für Einsteiger; Heldeneditor ohne Waffenwahl |
| Integration | Kiefernstamm, Schiffsbeschläge (Questgegenstand), Werte der Plünderer, Lohn, Einbau |

## Offen (an den Nutzer, höchstens 3)

1. Dürfen **bestehende Figuren** die Insel **freiwillig** besuchen (z. B. ein Kapitän am Anleger der Waldmark bringt sie hin, Lohn nur XP, keine zweite Ausrüstung)? Oder ist sie nur für neue Figuren?
2. Soll die Waffenwahl im **Heldeneditor wegfallen**, sodass man nur noch auf der Insel wählt?
3. Ist die Insel **für alle gemeinsam** (man sieht andere Neue) oder eine **eigene Instanz** je Spieler?
