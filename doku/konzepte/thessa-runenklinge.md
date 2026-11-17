# Thessa, die Runenklinge (Entwurf, noch nicht im Spiel)

Vierte Zauberin, geplant für Mitte oder Ende von Season 0. Erste Zauberin für die vordere Reihe. Zahlen sind ein Entwurf und noch nicht simuliert.

Bilder liegen bereit (Kennung `runenklinge`): `img/figuren/runenklinge.jpg`, `img/figuren/ganz/runenklinge.webp`, `img/figuren/ganz/runenklinge-gross.webp`.

- Klasse Zauberer · Rolle: vorn, Nahkampf mit Magie · Spruch: „Ich schreibe es dir ins Fleisch.“
- Werte: INT 16, KON 14, GES 13 · RK 13 (mit Runenhaut bis 15) · Bewegung 4 · Lebenspunkte wie die anderen Zauberer

| Ab Stufe | Fähigkeit | Art | Wirkung |
|---|---|---|---|
| 1 | Runenklinge | Aktion | Nahkampfangriff mit INT, 1W8 + INT, magisch |
| 1 | Runenhaut | passiv | +2 RK bei mindestens zwei übrigen Zauberplätzen, +1 RK bei genau einem |
| 1 | Runenschritt | Bonusaktion, 2× je Kampf | bis zu 3 Felder versetzen, ohne Gelegenheitsangriffe |
| 1 | Entladung | Bonusaktion, 1 Platz | nächster Treffer der Runenklinge +1W8, Gegner neben dem Ziel 1W6 |
| 3 | Rückkopplung | passiv | wer sie im Nahkampf trifft, nimmt 1W4 |
| 7 | Runensturm | Aktion, 1 großer Platz | Gegner in 1 Feld: GES-Rettungswurf, sonst 3W6 und 1 Runde verlangsamt; bei Erfolg halber Schaden |

Meisterschaften: Stufe 5 – Runenhaut +2 RK schon ab einem Platz · Stufe 8 – Rückkopplung 1W6 · Stufe 10 – „Herrin der Runen“: die erste Entladung je Kampf kostet keinen Platz.

Bremsen: Lebenspunkte einer Zauberin; Fernkampf und Rettungswurf-Zauber umgehen Runenhaut und Rückkopplung; jede Entladung senkt die RK.
Stellschrauben, falls zu stark: Schaden der Rückkopplung, Schwelle der Runenhaut.

Herkunft: Schreiberin des Wachtordens, die die Runen eines reißenden Siegels auf die eigene Haut gesetzt hat.

Vor dem Einbau: Turnier auf Stufe 1, 5 und 10; Eintrag im Heldenkatalog der Datenbank; neue Fassung der Arena-Funktion; Entscheidung, wie man sie bekommt.

## Simulation (Arbeitskopie, Rechner gegen Rechner, Thessa mit zwei zufälligen Helden gegen drei zufällige)

Skin „Runenkönigin“ liegt bereit (Kennung `runenklinge_s1`).

| Fassung | Stufe 1 | Stufe 5 | Stufe 10 |
|---|---|---|---|
| Entwurf wie oben (TP 10/24/42, RK 13, 1W8) | 42 % | 35 % | 33 % |
| + 7 TP, RK 14 | 48 % | 42 % | 39 % |
| TP 15/33/56, RK 14, Runenklinge 1W10, Entladung +2W6, Rückkopplung ab Stufe 1 | 47 % | 53 % | 51 % |

Je Zelle 60 bis 120 Kämpfe, Unsicherheit etwa ±5 Punkte. Ein durchschnittlicher Held liegt bei 50 %.
Befund: Mit den Lebenspunkten einer Zauberin fällt sie vorn in drei von vier Kämpfen, auf Stufe 1 in der zweiten Runde.
Der Rechner-Gegner spielt sie nicht gut (geht mit den Zauberplätzen nicht haushälterisch um, nutzt den Runenschritt kaum);
ein Mensch dürfte mehr herausholen. Ziel für die Freigabe: 54 bis 58 %.
