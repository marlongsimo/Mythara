"""Mythara – Konzept Handwerk als PDF. Zahlen aus zahlen.json (rechnen.py).
Aufruf (im Ordner handwerk): python3 rechnen.py && python3 pdf_handwerk.py ../../Mythara-Handwerk.pdf"""
import json, sys
exec(open("../kopf.py").read().split("STAND =")[0])
from reportlab.platypus import Image as Bild
STAND = "Konzept · Stand 24.11.2026"
def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(16 * mm, 13 * mm, 194 * mm, 13 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(16 * mm, 9 * mm, f"Mythara – Splitterlande · Handwerk · {STAND}")
    c.drawRightString(194 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()
Z0 = json.load(open("zahlen.json")); de = lambda v: f"{v:,}".replace(",", ".")
BILD = "/home/user/mythara/fabrik/assets/skilling/symbole/handwerk_vorlage.png"
s = []
kopfzeile = Table([[Bild(BILD, width=34 * mm, height=34 * mm), [Paragraph("Handwerk", T), Paragraph(f"Aus Stämmen, Erz, Flachs, Hanf und Kuhhaut wird Ausrüstung – Werkstätten, Rezepte, XP, Balancing und was dafür noch fehlt · {STAND}", U)]]],
                  colWidths=[40 * mm, 138 * mm]); kopfzeile.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(kopfzeile)
s.append(p("Das Handwerk ist der dritte der vier Berufe. Holzfällerei und Bergbau <b>sammeln</b>, das Handwerk <b>verarbeitet</b>: Es schmilzt Erz zu Barren, "
           "schmiedet Klingen und schwere Rüstung, baut Bögen, Armbrüste, Stäbe und Schilde, dreht Bogensehnen und Garn, webt Stoff, gerbt Leder und näht leichte und Stoffrüstung. "
           "Damit lässt sich <b>jedes Ausrüstungsteil des Spiels</b> selbst herstellen – von der Trainingsstufe bis Mythisch."))
s.append(Paragraph("Grundsätze", H2))
s += li(["<b>Alles ist herstellbar, alles ist sammelbar:</b> Jede Zutat kommt aus einem Beruf oder aus dem Kampf. Nichts muss man kaufen – wer will, kann es aber.",
         "<b>Sechs Stufen wie überall:</b> Level 1, 10, 20, 35, 45, 65 – Training, Einfach, Selten, Episch, Legendär, Mythisch. Innerhalb einer Stufe kommen die größeren Teile ein paar Level später (Dolch zuerst, Brustpanzer zuletzt).",
         "<b>Eine Stufe = ein Rohstoff:</b> Eisenwacht (Einfach) braucht Eisenbarren und Tannenholz, Eisenwacht (Episch) Sterneisen und Moorweide. Man sieht einem Teil an, woraus es ist.",
         "<b>Drei Werkstätten, wenige Grundstoffe:</b> Esse, Amboss und Werkbank. Zwei Pflanzen (Flachs für Bogensehnen, Hanf für Garn und Stoff) und eine einzige Haut (Kuhhaut) – welches Leder und welcher Stoff daraus wird, entscheidet das Handwerk-Level.",
         "<b>Nichts stapelt, nichts kostet extra:</b> Jedes Stück belegt ein Rucksackfach (wie Stämme und Erze). Herstellen kostet nur die Zutaten – keine Splitter.",
         "<b>Kein Fehlschlag, aber ein aktiver Moment:</b> Herstellen gelingt immer. Manchmal glüht das Werkstück auf („Glut“) – wer rechtzeitig tippt, spart eine Zutat und bekommt 50 % mehr XP. Wie Kernschlag und Riss.",
         "<b>Der Server entscheidet alles:</b> Level, Zutaten im Rucksack, Nähe zur Werkstatt, Ergebnis und XP. Der Browser zeigt nur an.",
         "Zählt nicht ins Heldenlevel. XP-Kurve wie alle Skills (85 % OSRS, Level 1 bis 100). XP liegen wie bei Holz und Bergbau im Inventar des Helden (berufe.handwerk) – keine neue Tabelle."])
s.append(kasten("<b>Kreislauf:</b> Holzfällerei → Stämme · Bergbau → Erz · Pflücken → Flachs und Hanf · Kühe → Kuhhaut &nbsp;⟶&nbsp; Handwerk: Schmelzen (Esse), Sehne, Garn, Gerben, Weben (Werkbank) &nbsp;⟶&nbsp; "
                "Amboss und Werkbank &nbsp;⟶&nbsp; Waffen, Rüstung, Werkzeuge &nbsp;⟶&nbsp; bessere Werkzeuge sammeln schneller, bessere Ausrüstung schlägt stärkere Gegner."))
s.append(PageBreak())

s.append(Paragraph("1 · Werkstätten und Ablauf", H1))
s.append(tab(["Werkstatt", "Was man dort macht", "Wo (Vorschlag)"], [
    ["Esse", "Erz + Brennholz → Barren (Schmelzen)", "Schmiede der Waldmark (Schmiedeofen steht schon)"],
    ["Amboss", "Barren (+ Stiel, Leder) → Klingen, Speer, Streitkolben, schwere Rüstung, Holzbeil, Spitzhacke", "Schmiede der Waldmark (Amboss steht schon)"],
    ["Werkbank", "Flachs → Bogensehne · Hanf → Garn · Kuhhaut → Leder (Gerben) · Garn → Stoff (Weben) · Stämme (+ Sehne) → Bögen, Armbrust, Stab, Schild · Leder/Stoff + Garn → leichte und Stoffrüstung", "Werkstatt der Waldmark (beim Handwerker), eine zweite in Graufurt"]], [24, 100, 54]))
s.append(Paragraph("Ablauf", H2))
s += li(["Werkstatt antippen → <b>Rezeptfenster</b>: alle Teile der Werkstatt, nach Stufe sortiert. Grau, wenn Level oder Zutaten fehlen; die fehlenden Zutaten stehen rot darunter.",
         "Menge wählen (1, 5, 10, Alle) → der Held arbeitet von selbst weiter, bis die Menge fertig ist, die Zutaten ausgehen oder man weggeht.",
         "<b>Dauer:</b> Schmelzen, Pflücken, Weben, Gerben 3 Ticks; Sehne und Garn 2 Ticks; ein Werkstück 3 Ticks plus 2 Ticks je Zutat (Dolch 2 s, Brustpanzer 5,5 s).",
         "<b>Glut</b> (12 % je Werkstück): das Werkstück glüht 1,5 s auf; rechtzeitig angetippt → eine Einheit der häufigsten Zutat bleibt im Rucksack, 50 % mehr XP.",
         "Das fertige Teil landet im Rucksack. Ausrüstung braucht zum Anlegen weiter ihr Kampf-Level – herstellen darf man sie vorher schon (z. B. zum Verkaufen)."])
s.append(Paragraph("Animation", H2))
s.append(p("Schmieden: Hammer (img/objekte3d/skilling/utensilien/hammer.glb) beidhändig (hieb2h) über dem Amboss, Funken. Werkbank: Hobel bzw. Einhand-Hieb. Sehne, Garn, Weben, Gerben, Nähen: Ruhe-Pose mit kurzer Handbewegung "
           "(bis eigene Clips da sind). Angelegte Waffe und Schild sind während der Arbeit weg – wie beim Fällen und Abbauen."))

s.append(Paragraph("2 · Rohstoffe je Stufe", H1))
R = ["Training", "Einfach", "Selten", "Episch", "Legendär", "Mythisch"]; L = [1, 10, 20, 35, 45, 65]
s.append(tab(["Stufe", "Lvl", "Holz (Holzfällerei)", "Erz → Barren (Bergbau)", "Leder (aus Kuhhaut)", "Stoff (aus Garn)"], [
    [R[i], L[i], ["Eiche", "Tanne", "Eibe", "Moorweide", "Kernbaum", "Weltenbaum"][i], ["Kupfer (1 Erz)", "Eisen (2)", "Schwarzeisen (2)", "Sterneisen (2)", "Splittereisen (2)", "Ureisen (3)"][i],
     ["Raues Leder (1 Haut)", "Weiches Leder (1)", "Gehärtetes Leder (2)", "Moorleder (2)", "Splitterleder (3)", "Urleder (4)"][i], ["Hanftuch (2 Garn)", "Grobtuch (3)", "Feintuch (4)", "Mondtuch (5)", "Splittertuch (6)", "Weltentuch (8)"][i]] for i in range(6)],
    [18, 9, 30, 36, 40, 45]))
s += li(["<b>Flachs und Hanf</b> wachsen auf <b>Flachs- und Hanffeldern</b> rund um die Waldmark (wie Holzfäller-Bäume, aber ohne Werkzeug), beide ab Level 1. Pflücken gibt etwas Handwerk-XP, das Feld ist danach eine Weile abgeerntet.",
         "An der Werkbank wird aus einem Flachs eine <b>Bogensehne</b> (für Kurz-, Langbogen und Armbrust) und aus einem Hanf ein <b>Garn</b> (für Stoff und zum Nähen) – je nur diese eine Sorte.",
         "<b>Kuhhaut</b> lassen die <b>10 Kühe</b> im Gehege vor der Waldmark fallen – immer (100 %); nach 20 s ist eine neue Kuh da. Es gibt nur diese eine Haut. "
         "An der Werkbank wird sie <b>je nach Handwerk-Level</b> zu verschiedenem Leder gegerbt: höhere Lederarten brauchen mehr Häute und geben mehr XP.",
         "<b>Stoff</b> genauso: Garn wird je nach Level zu Hanftuch, Grobtuch … Weltentuch gewebt; höhere Stoffe brauchen mehr Garn.",
         "<b>Brennholz:</b> Jeder Barren braucht einen Stamm – höchstens zwei Stufen unter dem Erz (Sterneisen ab Eibe). So bleibt niedriges Holz bis zum Schluss nützlich.",
         "<b>Gerberlohe:</b> Gerben braucht ebenfalls einen Stamm (beliebige Sorte)."])
s.append(PageBreak())

s.append(Paragraph("3 · Vorstufen: Flachs, Hanf, Sehne, Garn, Schmelzen, Gerben, Weben", H1))
s.append(p("Diese Schritte machen aus den Rohstoffen die Bausteine der Rezepte. Jeder gibt eigene Handwerk-XP."))
s.append(tab(["Schritt", "Ergebnis", "Lvl", "Zutaten", "XP", "Ticks"], [[v["art"], v["name"], v["level"], v["zutaten"], v["xp"], v["ticks"]] for v in Z0["vor"]], [34, 34, 9, 80, 11, 10], klein=True))
s.append(PageBreak())

s.append(Paragraph("4 · Rezepte", H1))
s.append(p("Alle Teile, die es im Spiel schon gibt, in allen Stufen. Lvl = Handwerk-Level. Die Trainingsstufe liefert die bekannten Anfängerteile (Ritterschwert, Rundschild, Jagdbogen …). "
           "XP = die Hälfte der Sammel-XP, die in den Zutaten steckt – wer also ein Teil aus selbst gesammeltem Material baut, bekommt fürs Bauen noch einmal halb so viel XP wie fürs Sammeln."))
for werk in ["Amboss", "Werkbank"]:
    s.append(Paragraph(werk, H2)); rows = []
    for r in sorted([r for r in Z0["rezepte"] if r["werk"] == werk], key=lambda r: (r["fam"], r["t"])):
        rows.append([r["fam"], r["stufe"], r["name"], r["level"], " + ".join(f"{n} {z}" for z, n in r["zutaten"]), de(r["xp"])])
    s.append(tab(["Familie", "Stufe", "Teil", "Lvl", "Zutaten", "XP"], rows, [30, 17, 29, 9, 82, 14], klein=True))
s.append(PageBreak())

s.append(Paragraph("5 · XP und Balancing", H1))
s += li(["<b>Verarbeiten:</b> 50 % der XP, die in den Zutaten stecken (ein Barren zählt als seine Erze, Leder und Stoff als zwei Gerb- bzw. Web-Schritte, Garn und Bogensehne als zwei Pflanzen).",
         "<b>Schmelzen:</b> 30 % der Erz-XP. <b>Flachs und Hanf</b> je 8 XP, <b>Sehne und Garn</b> je 4 XP, <b>Gerben und Weben</b> feste XP je Stufe (siehe Vorstufen).",
         "Damit steckt im Handwerk etwa <b>60 % der Sammel-XP</b> seiner Zutaten. Kühe sind schnell erledigt – deshalb kosten höhere Lederarten mehr Häute."])
s.append(Paragraph("Wie schnell an der Werkbank (Zutaten vorhanden)", H2))
s.append(tab(["Stufe", "Schnellstes Rezept", "XP / Stunde"], [[q["stufe"], q["rezept"], de(q["xph"])] for q in Z0["proh"]], [25, 100, 30]))
s.append(p("Mit Zutaten im Rucksack geht Handwerk schnell – die eigentliche Grenze sind die Zutaten. Deshalb rechnen wir die Dauer in <b>Sammel-XP</b>:"))
s.append(tab(["Handwerk-Level", "Handwerk-XP", "Zutaten aus rund … Sammel-XP"], [[k, de(Z0["kurve"][k]), de(Z0["sammeln"][k])] for k in ["10", "20", "35", "45", "65", "99"]], [35, 40, 70]))
s.append(kasten("<b>Einordnung:</b> Holzfällerei 99 und Bergbau 99 sind zusammen rund 22 Mio. Sammel-XP. Handwerk 99 braucht Zutaten aus rund 18 Mio. – "
                "<b>wer alles selbst sammelt, erreicht Handwerk 99 ungefähr zur selben Zeit</b> wie seine Sammelberufe. Wer Zutaten tauscht oder kauft (später: Handel), kommt schneller voran. "
                "Erste Werte zum Ausprobieren; nach dem Einbau prüfen wir sie im Spiel."))
s.append(Paragraph("Warum es sich lohnt, selbst herzustellen", H2))
s += li(["Viele Teile ab Selten gibt es bei keinem Händler – nur als seltene Beute oder aus dem Handwerk.",
         "Hergestellte Teile kann man beim Händler verkaufen (Ankaufspreis nach Seltenheit) – Handwerk wird so auch zur Einnahmequelle.",
         "Werkzeuge: bessere Holzbeile und Spitzhacken gibt es nur bis Einfach beim Händler, darüber nur aus dem Handwerk."])
s.append(PageBreak())

s.append(Paragraph("6 · Was wir dafür bauen müssen", H1))
s.append(Paragraph("Figuren-Fabrik (Modelle und Bilder)", H2))
s += li(["<b>Werkbank</b> in 3D (Esse und Amboss gibt es schon in der Schmiede der Waldmark).",
         "<b>Kuh</b> als Figur mit Ruhe, Laufen, Treffer und Umfallen – lässt immer eine Kuhhaut fallen.",
         "<b>Flachsfeld und Hanffeld</b> (je voll und abgeerntet) – wie Baum und Stumpf.",
         "<b>Bilder für den Rucksack:</b> Flachs, Hanf, Bogensehne, Garn, Kuhhaut, 6 Leder, 6 Stoffe (Barren, Stämme und Erze gibt es schon).",
         "Symbol Handwerk: fertig (img/objekte3d/skilling/symbole/handwerk.webp, aus deinem Bild)."])
s.append(Paragraph("Welt (World Pipeline)", H2))
s += li(["Werkbank in die Waldmark setzen (beim Handwerker), Kartensymbol Amboss/Werkbank.",
         "<b>Kuhgehege</b> vor der Waldmark mit <b>10 Kühen</b>, die nach dem Erledigen nach <b>20 Sekunden</b> wiederkommen; Flachs- und Hanffelder daneben – über eine Standortliste wie die Lichtungen und Senken."])
s.append(Paragraph("Spiel (Server und Browser)", H2))
s += li(["shared/handwerk.ts: Rezepte, Vorstufen, Werkstätten – eine Liste, aus der Server, Rezeptfenster und dieses Heft lesen.",
         "Server: „handwerk“/„start“ (Rezept, Menge) mit Prüfung von Level, Zutaten, Nähe; Takt, Glut, Abbruch. Flachs und Hanf pflücken über den gemeinsamen Sammel-Kern (wie Holz und Bergbau).",
         "Kuh als Gegner im bestehenden Kampfsystem: Level 1, 10 Lebenspunkte, 100 % Kuhhaut, normale Kampf-XP.",
         "Browser: Rezeptfenster je Werkstatt, Fortschritt, Glut-Knopf; Handwerk unter Skills → Berufe; XP-Drop mit dem Handwerk-Symbol.",
         "Gegenstände: 6 Barren, Flachs, Hanf, Bogensehne, Garn, Kuhhaut, 6 Leder, 6 Stoffe – nichts stapelt.",
         "Keine neue Datenbank-Tabelle, keine Migration: XP und Zutaten liegen im Inventar des Helden."])
s.append(Paragraph("Offene Fragen an dich", H2))
s += li(["<b>Meisterstücke</b> (eigene, etwas stärkere Varianten) später als Ausbaustufe? Dafür müsste ein Gegenstand eigene Werte tragen können.",
         "<b>Kühe</b> (festgelegt): 10 im Gehege, 20 s bis sie wiederkommen, Level 1 mit 10 Lebenspunkten, Kampf-XP wie bei jedem Gegner (1,33 XP je abgezogenem Lebenspunkt).",
         "<b>Leder- und Stoffnamen</b> (Raues … Urleder, Hanftuch … Weltentuch) – passen sie, oder hast du eigene?"])
SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm,
                  title="Mythara – Handwerk (Konzept)", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("fertig", sys.argv[1])
