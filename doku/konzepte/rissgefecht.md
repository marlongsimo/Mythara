# Rissgefecht – Echtzeit-Versuch

Stand: erster spielbarer Versuch nach dem Konzeptentwurf 0.1 („Rissgefecht – ein kompetitiver Teammodus zwischen Heldenentwicklung und taktischer Rundenwirtschaft“).

Seite: `rissgefecht.html` (eigene Seite, hängt nicht am übrigen Spiel). Code: `js/rissgefecht.js`. Test: `node tests/rissgefecht.test.js [Partien]`.

## Was der Versuch zeigen soll

Abschnitt 9 des Konzepts: ob die Schleife aus **Kampf, Erfahrung, Wirtschaft und Seitenwechsel** trägt – und ob sich Echtzeit mit einem Helden je Spieler für Mythara gut anfühlt.

Er zeigt **nicht**, ob das online gegen Menschen funktioniert. Dafür braucht es einen dauerhaft laufenden Spielserver, den es noch nicht gibt (siehe unten).

## Was gebaut ist

- **3 gegen 3 in Echtzeit.** Du steuerst einen Helden, die anderen fünf spielt der Rechner. Nichts wird gespeichert oder verschickt.
- **Vier Helden:** Torvald (Nahkämpfer), Vaelin (Fernkämpfer), Brogar (Heiler), Darian (Meuchler). Jeder hat einen Grundangriff und zwei Fähigkeiten mit Abklingzeit.
- **Für den ersten Test spielt der Gegner dieselben drei Helden wie dein Team.** Die Helden sind untereinander nicht abgestimmt; mit gelosten Gegnern (`?gegner=zufall`) entscheidet die Zusammenstellung die Partie (Endstände wie 10:0).
- **Karte:** punktsymmetrisch, Mauern als Deckung, das Siegel in der Mitte, oben und unten je ein Risswächter.
- **Sicht:** Gegner siehst du nur, wenn jemand aus deinem Team freie Sicht auf sie hat.
- **Rundenziel (nur eines):** Siegelkontrolle. Wer 18 Sekunden allein im Siegelkreis steht, gewinnt die Runde – oder wer alle Gegner ausschaltet. Nach 100 Sekunden gewinnt, wer länger am Siegel war.
- **Wer fällt, setzt die Runde aus.** Leben bleibt zwischen den Runden erhalten; Gefallene kommen mit halbem Leben zurück.
- **Erfahrung** je Held: 20 je Runde, +10 für den Sieg, 25 für einen besiegten Gegner (10 für Verbündete), 25 für einen Risswächter (10 für Verbündete). Stufe 2 bis 5 bei 70, 170, 300, 470. Je Stufe +12 % Leben und +10 % Schaden.
- **Erbsplitter** als Teamvorrat: Start 40, Sieg 50, Niederlage 35, +5 je weiterer Niederlage in Folge (höchstens +15), Risswächter 10.
- **Kaufphase** (25 Sekunden): vollständige Heilung 70, Heiltrank 15 (einer je Held), Offensivsegen 40, Schutzsegen 40 (je 20 %, nur für die nächste Runde).
- **Zehn Runden, Seitenwechsel nach Runde 5** mit vollem Neustart von Erfahrung, Stufen, Erbsplittern, Tränken und Leben. Der Rundenstand bleibt.
- **5:5:** eine Entscheidungsrunde mit gleichem Neustart für beide.
- **Mitschrift** je Partie (Rundensieger, Dauer, Stufen, Erbsplitter vor und nach dem Kauf, Käufe, Leben) zum Kopieren – die Messgrößen aus Abschnitt 10.

Steuerung: WASD laufen, Maus zielen, linke Maustaste angreifen, Q und E Fähigkeiten, F Heiltrank. Am Handy: linke Bildhälfte laufen, rechte zielen und angreifen, Knöpfe unten für Q, E, F.

Schalter in der Adresse: `auto=1` (auch dein Held wird vom Rechner gespielt), `tempo=<n>`, `seed=<n>`, `held=<kennung>`, `gegner=zufall`.

## Erste Zahlen (zehn Partien Rechner gegen Rechner, gleiche Helden)

- Endstände: 0:10 · 6:5 · 7:3 · 7:3 · 4:6 · 2:8 · 3:7 · 5:6 · 4:6 · 6:5 – meist eng, drei von zehn gingen in die Entscheidungsrunde, eine Partie lief völlig einseitig.
- Rundendauer im Schnitt 33 Sekunden; 87 von 103 Runden endeten über das Siegel, 16 durch Ausschalten.
- Stufen am Ende einer Halbzeit: meist 3, oft 2 oder 4, nie 5 – das trifft das Ziel des Konzepts (3 bis 4, Stufe 5 als besondere Leistung).
- Rundensiege links 45, rechts 58. Bei 103 Runden ist das kein belastbarer Unterschied, sollte aber mit mehr Partien geprüft werden.

Das sind Rechnerpartien. Sie zeigen, dass das Format fehlerfrei durchläuft und die Zahlen nicht absurd sind – nicht, dass es Spaß macht oder gegen Menschen ausgeglichen ist.

## Was fehlt

- **Mehrspieler.** Echtzeit gegen Menschen braucht einen Server, der die Partie selbst rechnet (20 bis 60 Schritte je Sekunde), mit Ausgleich für Verzögerung. Die Supabase-Funktion der Arena kann das nicht. Das ist die größte offene Entscheidung und kostet laufend Geld und Betrieb.
- **Animationen.** Die Helden sind runde Marken mit ihrem Bild; es gibt keine Lauf- oder Angriffsbewegung.
- **Abstimmung der Helden** untereinander (siehe oben).
- **Rollen:** Das Konzept spricht von Angreifer und Verteidiger. Hier sind beide Seiten gleich (symmetrisches Siegelziel, wie für den ersten Test empfohlen); der Seitenwechsel tauscht nur die Startseite.
- **Töne, Kartenbild, Einweisung.**
- Auf einem echten Handy nicht ausprobiert.
