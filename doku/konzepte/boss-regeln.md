# Boss-Regeln: hohe Stufen, Mechanik statt Gebete

*Entwurf Konzept-Chat, 27.11.2026, noch nicht abgesegnet.*

Diese Grundregel gilt für alle Bosse ab den Hütern der Hochlande, ebenso für das Endgame (Rissgrube, Uralt, Unikate, Weltenkern) und die Gruppen-Bosse.
Grundsatz: **Bosse dürfen eine deutlich höhere Stufe haben als die Helden.** Besiegen kann man sie trotzdem mit **Mechanik**, Ausrüstung und Vorbereitung. **Gebete gibt es nicht.**

## 1. Warum ein Boss Stufe 300 haben kann

- Die Stufe eines Gegners wird wie beim Helden aus seinen Werten berechnet (`kampfwerte.ts`). Ein Held mit allen Skills auf 100 hat etwa **Heldenlevel 115**.
- Bosse haben sehr viele Lebenspunkte und hohe Einzelwerte, daraus kommt die hohe Stufe.
- Jeder Boss hat **mindestens eine klare Schwäche**: niedrige Verteidigung gegen einen Kampfstil. Gegen diesen Stil trifft man trotz hoher Stufe regelmäßig.
- Eine hohe Stufe heißt also: langer Kampf, harte Angriffe. Sie heißt nicht: unbesiegbar.

### Richtwerte der Stufen

| Abschnitt | Ausrüstung | Boss-Stufe |
|---|---|---|
| Hüter der Hochlande (Grumhold, Sturmschwinge, Frostwitwe) | Stufe 70 | ca. 150–200 |
| Rissgrube / Uralt | Stufe 75 | ca. 220–280 |
| Unikate | Stufe 80 | ca. 280–350 |
| Weltenkern | Stufe 90 | ca. 400+ |

## 2. Zwei Sorten Angriffe

| | Grundangriff | Großangriff |
|---|---|---|
| Ankündigung | keine | **immer vorher angezeigt** (Fläche am Boden, Kegel, Linie, Zeichen am Boss, Laut) |
| Treffer | normaler Trefferwurf | trifft, wer in der Gefahrenzone steht |
| Schaden | höchstens etwa **8–15 %** des Höchstlebens eines passend ausgerüsteten Helden | nicht ausgewichen: **30–60 %** des Höchstlebens |
| Gegenmittel | Rüstung, Defense, Essen, Tränke | **Mechanik:** richtig reagieren vermeidet ihn |

*Schadensrahmen vom Nutzer entschieden (27.11., über die Leitstelle).*

## 3. Streifschaden: je nach Boss

Das Schadensbild wählt man je Boss aus zwei Arten. Zusammen sollen sie ausgeglichen sein.

| Boss-Art | Grundangriffe | Großangriffe richtig gemeistert |
|---|---|---|
| **Schläger** (hoher Grundschaden) | schlagen hart zu, hier zählen Rüstung und Essen | **kein Schaden** |
| **Taktiker** (niedriger Grundschaden) | eher schwach | **Streifschaden**, Richtwert 5–15 % des vollen Treffers, durch Rüstung minderbar |

So zählt Ausrüstung bei jedem Boss. Beim Schläger fängt sie die Grundangriffe ab, beim Taktiker auch den Streifschaden der Mechanik. Welcher Boss welche Art ist, steht im Steckbrief des Bosses.

## 4. Werkzeuge der Mechanik

Je Boss werden einige davon gewählt, nicht alle:

- **Ausweichen:** aus der angezeigten Fläche laufen (Sprint gibt es schon).
- **Deckung:** hinter Säulen oder Felsen stellen. Auch Deckung, die nach einigen Treffern zerbricht.
- **Unterbrechen:** Wer einen geladenen Angriff rechtzeitig mit genug Schaden trifft, bricht ihn ab.
- **Stilwechsel:** Der Boss wechselt Schwäche oder Panzer, man muss den Kampfstil wechseln.
- **Diener und Kristalle:** zuerst zerstören, sonst heilt sich der Boss oder wird stärker.
- **Gelände:** Eisfelder, Gift oder einstürzender Boden. Der sichere Platz wandert.
- **Gruppe (2–4), nur bei Gruppen-Bossen:** Angriffe, die man nur gemeinsam übersteht (Schaden teilen, einander befreien, zwei Schalter gleichzeitig).

## 5. Schwächefenster

Nach einem ausgewichenen, abgeblockten oder unterbrochenen Großangriff ist der Boss kurz verwundbar (Richtwert: einige Sekunden, z. B. +25 % Schaden auf ihn).
Gute Spieler werden dadurch schneller, schwächere schaffen den Boss trotzdem, nur langsamer.

## 6. Steckbrief je Boss (Vorlage)

- Name, Ort, Stufe (Richtwert aus Abschnitt 1)
- Art: Schläger oder Taktiker
- stark gegen / schwach gegen
- Grundangriff: Stil, Takt, etwa Höchstschaden
- Großangriffe: Ankündigung, Wirkung, Gegenmittel
- Schwächefenster: Auslöser, Dauer
- allein, Gruppe oder beides
- Beute

## Offen

- Genaue Werte je Boss: kommen bei den einzelnen Boss-Konzepten (Hüter, Rissherz, Endgame-Bosse).
- Feinwerte für Streifschaden und Schwächefenster nach Probe-Kämpfen.
- Ob die Stufe im Spiel zusätzlich mit einer Gefahrenanzeige versehen wird.
