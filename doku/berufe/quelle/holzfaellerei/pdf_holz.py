"""Mythara – Konzept Holzfällerei als PDF. Zahlen aus zahlen.json (gleiche Formel wie das Konzept Holz und Bergbau).
Aufruf: python3 pdf_holz.py ausgabe.pdf"""
import json, sys
exec(open("kopf.py").read().split("STAND =")[0])
from reportlab.platypus import Image as Bild
STAND = "Konzept · Stand 24.11.2026"
def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(16 * mm, 13 * mm, 194 * mm, 13 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(16 * mm, 9 * mm, f"Mythara – Splitterlande · Holzfällerei · {STAND}")
    c.drawRightString(194 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()
Z0 = json.load(open("zahlen.json")); de = lambda v: f"{v:,}".replace(",", ".")
PFAD = "/home/user/mythara/fabrik/assets/skilling/"
FALL = [35, 22, 15, 12, 10, 8]
STUFEN = ["Training", "Einfach", "Selten", "Episch", "Legendär", "Mythisch"]
s = []
s += [Paragraph("Holzfällerei", T), Paragraph(f"Bäume fällen, Stämme gewinnen – Ablauf, Bäume, Holzbeile, Fundorte, Balancing und was dafür noch fehlt · {STAND}", U)]
s.append(p("Die Holzfällerei ist einer der vier Berufe (Holzfällerei, Bergbau, Handwerk, Alchemie). Sie liefert die <b>Stämme</b>, aus denen das Handwerk Bögen, Armbrüste, "
           "Stäbe, Schilde und Werkzeugstiele baut, und den <b>Brennstoff</b> für das Schmelzen der Barren. Alle Modelle stehen schon bereit: sechs Bäume mit je eigenem Stumpf, "
           "das Holzbeil in sechs Stufen und die sechs Stämme."))
s.append(Bild(PFAD + "holzfaellerei/vorschau.png", width=178 * mm, height=178 * mm * 560 / 1560))
s.append(Paragraph("Eiche · Tanne · Eibe · Moorweide · Kernbaum · Weltenbaum-Setzling – oben im Wald, unten der Stumpf nach dem Fällen", K))
s.append(Paragraph("Grundsätze", H2))
s += li(["<b>Eigene Holzfäller-Bäume:</b> Die vielen Bäume der Landschaft bleiben Schmuck. Fällen kann man nur die Holzfäller-Bäume – an ihren <b>leuchtenden Adern</b> erkennt man sie sofort.",
         "<b>Sechs Stufen wie das Kampfsystem:</b> Level 1, 10, 20, 35, 45, 65 – passend zu Training, Einfach, Selten, Episch, Legendär, Mythisch.",
         "<b>Der Server entscheidet alles:</b> Abstand, Level, Beil, ob der Baum noch steht, Erfolg, XP und was in den Rucksack kommt.",
         "<b>Gemeinsame Welt:</b> Ein gefällter Baum ist für alle ein Stumpf, bis er nachwächst.",
         "<b>Aufmerksamkeit lohnt sich:</b> Wer im richtigen Moment tippt (Kernschlag), sammelt rund ein Fünftel mehr – wer nur wartet, kommt trotzdem voran.",
         "Die Holzfällerei zählt nicht ins Heldenlevel. XP-Kurve wie bei allen Skills (85 % OSRS, Level 1 bis 100)."])
s.append(PageBreak())

s.append(Paragraph("1 · So fällt man einen Baum", H1))
s += li(["<b>Antippen:</b> Baum kurz antippen → der Held läuft hin und beginnt zu fällen. Lange drücken: „Fällen“ und „Untersuchen“ (Name, nötiges Level, was er liefert).",
         "<b>Voraussetzung:</b> ein Holzbeil im Rucksack oder in der Hand, und das nötige Holzfällerei-Level. Es zählt immer das <b>beste Beil</b>, das man benutzen darf. "
         "Fehlt etwas: „Du brauchst ein Holzbeil.“ bzw. „Dafür brauchst du Holzfällerei 35.“",
         "<b>Takt:</b> alle 4 Ticks (2 Sekunden) ein Hieb. Gelingt er, kommt ein Stamm in den Rucksack und es gibt XP.",
         "<b>Weiter von selbst</b>, bis der Rucksack voll ist, der Baum fällt, man wegläuft oder angegriffen wird.",
         "<b>Fällchance und Stumpf:</b> Nach jedem Stamm fällt der Baum mit einer Wahrscheinlichkeit, die mit dem Baumlevel sinkt (Eiche 35 % … Weltenbaum 8 %). Dann steht für alle der Stumpf, bis der Baum nachwächst."])
s.append(Paragraph("Erfolgschance", H2))
s.append(kasten("<b>Chance je Hieb</b> = ((lo + 8 · B) · (99 − L) + (hi + 8 · B) · (L − 1)) / 98 / 256, höchstens 95 %<br/>"
                "L = Holzfällerei-Level, B = Beilstufe 0 (Training) bis 5 (Mythisch), lo/hi = Werte des Baums. Wie in OSRS machen Level und Beil schneller, nicht ertragreicher."))
s.append(Paragraph("Kernschlag – der aktive Moment", H2))
s.append(p("Ungefähr bei jedem achten Hieb <b>glühen die Adern des Baums an einer Stelle hell auf</b> (die blauen Adern, die die Modelle schon haben). 1,5 Sekunden lang kann man die Stelle antippen: "
           "Dieser Hieb gelingt sicher, bringt <b>zwei Stämme</b> und <b>50 % mehr XP</b>. Wer nicht tippt, hackt normal weiter. Den Moment lost der Server aus und prüft das Antippen."))
s.append(Paragraph("Splitter beim Fällen", H2))
s.append(p("Jeder Stamm bringt mit <b>25 % Wahrscheinlichkeit 5 bis 15 Splitter</b> dazu (gleich verteilt, im Schnitt 2,5 Splitter je Stamm). Das macht die Holzfällerei auch ohne Handwerk lohnend. "
           "Weil man an höheren Bäumen langsamer Stämme bekommt, bringen sie <b>weniger Splitter pro Stunde, aber mehr XP</b> – wer Geld will, fällt eine Stufe tiefer. Nebenprodukte (Harz o. Ä.) gibt es vorerst nicht."))
s.append(PageBreak())

s.append(Paragraph("2 · Die Bäume", H1))
rows = []
ort = ["Waldmark (Rand) und Kreuzwald an der Straße – ca. 20", "Westmark und Nordsaum – ca. 16", "Kreuzwald-Lichtungen und Obstwiesen – ca. 12",
       "Rabenmoor (erst nach Quest 1) – ca. 10", "Nordwald, Feste und Friedhof – ca. 6, bei den Waldgolems", "Nordsaum, an den Rissen – 3, sehr selten"]
for i, r in enumerate(Z0["zeilen"]):
    rows.append([f"<b>{r['baum']}</b>", r["level"], STUFEN[i], f"{r['name']}", r["xp"], f"{FALL[i]} % (Ø {100 / FALL[i]:.1f})".replace(".", ","), f"{r['nach']} s", ort[i]])
s.append(tab(["Baum", "Level", "Stufe", "Ertrag", "XP", "Fällt je Stamm (Ø Stämme)", "Nachw.", "Wo (Vorschlag)"], rows, [24, 10, 14, 26, 8, 22, 12, 62], klein=True))
s.append(Spacer(1, 3 * mm))
s.append(Bild("staemme_reihe.jpg", width=178 * mm, height=178 * mm / 6))
s.append(Paragraph("Die sechs Stämme (img/objekte3d/skilling/erzeugnisse/stamm_*.webp)", K))
s.append(Paragraph("Wofür das Holz gebraucht wird (Handwerk)", H2))
s.append(tab(["Stamm", "Wird zu"], [
    ["Eichenstamm", "Training-Bogen und -Stab, Stiele für Trainings-Werkzeug; Brennstoff für Kupfer- und Eisenbarren"],
    ["Tannenstamm", "Einfache Bögen, Armbrüste, Stäbe und Holzschilde; Stiel des Einfachen Holzbeils"],
    ["Eibenstamm", "Seltene Bögen und Armbrüste (Eibe ist das klassische Bogenholz), Stäbe"],
    ["Moorweidenstamm", "Epische Stäbe und Bögen; Brennstoff ab Sterneisen"],
    ["Kernbaumstamm", "Legendäre Stäbe, Bögen und Schilde; Brennstoff für Splittereisen"],
    ["Weltenbaumstamm", "Mythische Stäbe und Bögen; Brennstoff für Ureisen"]], [32, 142]))
s.append(PageBreak())

s.append(Paragraph("3 · Die Holzbeile", H1))
s.append(Bild(PFAD + "utensilien/holzbeil/referenz/stufen.png", width=178 * mm, height=178 * mm * 320 / 1800))
s.append(tab(["Beil", "Beilstufe", "Fällen ab", "Als Waffe ab", "Woher", "Herstellung (Handwerk)"], [
    ["Trainings-Holzbeil", "0", "Holzfällerei 1", "–", "Händler „Zur Scharfen Kante“ (10 Splitter)", "Kupferbarren + Eichenstamm (Handwerk 1)"],
    ["Einfaches Holzbeil", "1", "Holzfällerei 10", "Geschick 10", "Händler (350 Splitter)", "Eisenbarren + Tannenstamm (10)"],
    ["Seltenes Holzbeil", "2", "Holzfällerei 20", "Geschick 20", "Handwerk", "Schwarzeisenbarren + Eibenstamm (20)"],
    ["Episches Holzbeil", "3", "Holzfällerei 35", "Geschick 35", "Handwerk", "Sterneisenbarren + Moorweidenstamm (35)"],
    ["Legendäres Holzbeil", "4", "Holzfällerei 45", "Geschick 45", "Handwerk", "Splittereisenbarren + Kernbaumstamm (45)"],
    ["Mythisches Holzbeil", "5", "Holzfällerei 65", "Geschick 65", "Handwerk", "Ureisenbarren + Weltenbaumstamm (65)"]], [28, 14, 20, 18, 46, 52], klein=True))
s.append(Paragraph("Beil als Waffe", H2))
s.append(p("Ein Holzbeil kann man <b>wie eine Einhandwaffe anlegen</b> – dann muss es nicht im Rucksack liegen. Im Kampf taugt es weniger als eine Klinge derselben Stufe "
           "(etwa zwei Drittel der Werte, Tempo 4 Ticks): praktisch für Holzfäller im Nordwald, keine Waffe für Bosse. Zum Anlegen gilt Geschick wie bei allen Waffen, "
           "zum Fällen die Holzfällerei."))
s.append(PageBreak())

s.append(Paragraph("4 · Balancing", H1))
s.append(p("Mit der Formel aus Kapitel 1, 2 Sekunden je Hieb und 15 % Abzug für Laufen und Nachwachsen – <b>ohne</b> Kernschlag (damit rund 20 % mehr) und <b>ohne</b> Wege zur Bank."))
rows = [[f"<b>{r['name']}</b>"] + [f"{c} % · {de(n)}/h · {de(x)} XP/h · ≈{de(round(n * 2.5))} Spl./h" for (c, n, x) in r["werte"]] for r in Z0["zeilen"]]
s.append(tab(["Stamm", "Mindestlevel, passendes Beil", "Mindestlevel + 20", "Level 99, Mythisches Beil"], rows, [32, 48, 47, 47], klein=True))
s.append(Paragraph("Wie lange bis …", H2))
zi = Z0["ziele"]; t = lambda h: f"{round(h * 60)} Min." if h < 1 else f"{str(round(h, 1)).replace('.', ',')} Std."
s.append(tab(["Level"] + list(zi.keys()), [["Dauer"] + [t(v) for v in zi.values()]], [16] + [14.4] * len(zi), klein=True))
s += li(["Immer am ergiebigsten Baum, ohne Bankwege und Kernschlag. <b>Mit Wegen zum Lager real eher 120 bis 150 Stunden bis 99</b> – in der Größenordnung von OSRS.",
         "<b>Stämme stapeln nicht</b> (wie in OSRS): 24 Stück je Gang, dann zur Bank. Dafür gibt es jetzt die Bank in der Waldmark und den Schalter in Weidenhain. "
         "Weite Wege (Rabenmoor, Nordwald) sind gewollt – dafür bringen die Bäume dort mehr.",
         "Erste Werte zum Ausprobieren; nach dem Einbau stellen wir lo/hi, Fällchance und Nachwachsen im Spiel nach."])
s.append(PageBreak())

s.append(Paragraph("5 · Was wir dafür noch brauchen", H1))
s.append(Paragraph("Schon da", H2))
s += li(["Sechs Bäume mit Stumpf (3D, leuchtende Adern), Holzbeil in sechs Stufen (3D), sechs Stämme (Bilder), Bank in der Waldmark und in Weidenhain."])
s.append(Paragraph("Von dir (Figuren und Grafik)", H2))
s += li(["<b>Hacken</b> – Bewegung des Helden mit dem Beil, ein Durchlauf 2 Sekunden, in Schleife (bis dahin nehme ich den vorhandenen Schlag).",
         "<b>Beil in der rechten Hand</b> – als starres Teil wie in der Utensilien-README vorgesehen.",
         "Optional: Geräusche (Hieb, fallender Baum)."])
s.append(Paragraph("Von der Welt", H2))
s += li(["Die Holzfäller-Bäume an ihre Plätze setzen (Weltobjekte der sechs Bäume, Zahlen und Orte wie in Kapitel 2) – der Server liest die Bäume dann direkt aus den Weltdaten."])
s.append(Paragraph("Von mir (Spiel und Server)", H2))
s += li(["<b>Datenbank – Migration 048:</b> Spalten für Holzfällerei und gleich Bergbau, Handwerk, Alchemie; Buchen der XP nur durch den Server. SQL mit Rückbau und Test bekommst du vorher im Chat.",
         "<b>Gegenstände:</b> sechs Stämme, sechs Holzbeile (mit Kampfwerten als Waffe).",
         "<b>Server:</b> Zustand jedes Baums (steht oder Stumpf, Nachwachsen) für alle gemeinsam, Fällen im Takt, Fällchance, Splitter-Wurf, Kernschlag, XP buchen.",
         "<b>Spiel:</b> Antippen und Menü, Stumpf statt Baum, Leuchten beim Kernschlag, Späne, Meldungen, Holzfällerei im Skills-Fenster, Beile beim Händler."])
s.append(Paragraph("Vorschlag für Version 1", H2))
s.append(kasten("<b>Eiche und Tanne</b> in und um die Waldmark, <b>Trainings- und Einfaches Holzbeil</b> beim Händler, Kernschlag, Stumpf und Nachwachsen, Migration 048, "
                "Holzfällerei im Skills-Fenster. Die übrigen vier Bäume folgen, sobald die Welt sie gesetzt hat – die Regeln dafür sind dann schon fertig."))
SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm, title="Mythara – Holzfällerei", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("ok")
