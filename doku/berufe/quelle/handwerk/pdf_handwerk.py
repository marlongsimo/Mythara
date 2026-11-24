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
kopfzeile = Table([[Bild(BILD, width=34 * mm, height=34 * mm), [Paragraph("Handwerk", T), Paragraph(f"Aus Stämmen, Erz, Fasern und Häuten wird Ausrüstung – Werkstätten, Rezepte, XP, Balancing und was dafür noch fehlt · {STAND}", U)]]],
                  colWidths=[40 * mm, 138 * mm]); kopfzeile.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
s.append(kopfzeile)
s.append(p("Das Handwerk ist der dritte der vier Berufe. Holzfällerei und Bergbau <b>sammeln</b>, das Handwerk <b>verarbeitet</b>: Es schmilzt Erz zu Barren, "
           "schmiedet Klingen und schwere Rüstung, baut Bögen, Armbrüste, Stäbe und Schilde, spinnt und webt Stoff, gerbt Leder und näht leichte und Stoffrüstung. "
           "Damit lässt sich <b>jedes Ausrüstungsteil des Spiels</b> selbst herstellen – von der Trainingsstufe bis Mythisch."))
s.append(Paragraph("Grundsätze", H2))
s += li(["<b>Alles ist herstellbar, alles ist sammelbar:</b> Jede Zutat kommt aus einem Beruf oder aus dem Kampf. Nichts muss man kaufen – wer will, kann es aber.",
         "<b>Sechs Stufen wie überall:</b> Level 1, 10, 20, 35, 45, 65 – Training, Einfach, Selten, Episch, Legendär, Mythisch. Innerhalb einer Stufe kommen die größeren Teile ein paar Level später (Dolch zuerst, Brustpanzer zuletzt).",
         "<b>Eine Stufe = ein Rohstoff:</b> Eisenwacht (Einfach) braucht Eisenbarren und Tannenholz, Eisenwacht (Episch) Sterneisen und Moorweide. Man sieht einem Teil an, woraus es ist.",
         "<b>Splitter als Veredelung:</b> Ab Episch kostet jedes Teil zusätzlich Splitter. Das gibt den Splittern aus dem Sammeln einen Zweck und nimmt Währung aus dem Spiel.",
         "<b>Kein Fehlschlag, aber ein aktiver Moment:</b> Herstellen gelingt immer. Manchmal glüht das Werkstück auf („Glut“) – wer rechtzeitig tippt, spart eine Zutat und bekommt 50 % mehr XP. Wie Kernschlag und Riss.",
         "<b>Der Server entscheidet alles:</b> Level, Zutaten im Rucksack, Nähe zur Werkstatt, Ergebnis und XP. Der Browser zeigt nur an.",
         "Zählt nicht ins Heldenlevel. XP-Kurve wie alle Skills (85 % OSRS, Level 1 bis 100). XP liegen wie bei Holz und Bergbau im Inventar des Helden (berufe.handwerk) – keine neue Tabelle."])
s.append(kasten("<b>Kreislauf:</b> Holzfällerei → Stämme · Bergbau → Erz · Pflücken → Fasern · Kampf → Häute &nbsp;⟶&nbsp; Handwerk: Schmelzen, Spinnen, Weben, Gerben &nbsp;⟶&nbsp; "
                "Schmieden, Werkbank, Nähtisch &nbsp;⟶&nbsp; Waffen, Rüstung, Werkzeuge &nbsp;⟶&nbsp; bessere Werkzeuge sammeln schneller, bessere Ausrüstung schlägt stärkere Gegner (bessere Häute)."))
s.append(PageBreak())

s.append(Paragraph("1 · Werkstätten und Ablauf", H1))
s.append(tab(["Werkstatt", "Was man dort macht", "Wo (Vorschlag)"], [
    ["Esse", "Erz + Brennholz → Barren (Schmelzen)", "Schmiede der Waldmark (neben Brann Hackebeil)"],
    ["Amboss", "Barren (+ Stiel, Leder) → Klingen, Speer, Streitkolben, schwere Rüstung, Holzbeil, Spitzhacke", "Schmiede der Waldmark; später Graufurt"],
    ["Werkbank", "Stämme (+ Barren, Garn) → Bögen, Armbrust, Stab, Schild", "Zimmerei / Sägeplatz bei der Waldmark (Meiler im Nordwald)"],
    ["Spinnrad · Webstuhl", "Fasern → Garn → Stoff", "Weberhaus der Waldmark"],
    ["Gerbbottich", "Haut + Gerberlohe (Stamm) → Leder", "Gerberei am Bach vor der Waldmark"],
    ["Nähtisch", "Leder oder Stoff + Garn → leichte und Stoffrüstung", "Weberhaus der Waldmark"]], [30, 88, 60]))
s.append(Paragraph("Ablauf", H2))
s += li(["Werkstatt antippen → <b>Rezeptfenster</b>: alle Teile der Werkstatt, nach Stufe sortiert. Grau, wenn Level oder Zutaten fehlen; die fehlenden Zutaten stehen rot darunter.",
         "Menge wählen (1, 5, 10, Alle) → der Held arbeitet von selbst weiter, bis die Menge fertig ist, die Zutaten ausgehen oder man weggeht.",
         "<b>Dauer:</b> Schmelzen, Pflücken, Weben, Gerben 3 Ticks; Spinnen 2 Ticks; ein Werkstück 3 Ticks plus 2 Ticks je Zutat (Dolch 2 s, Brustpanzer 5,5 s).",
         "<b>Glut</b> (12 % je Werkstück): das Werkstück glüht 1,5 s auf; rechtzeitig angetippt → eine Einheit der häufigsten Zutat bleibt im Rucksack, 50 % mehr XP.",
         "Das fertige Teil landet im Rucksack. Ausrüstung braucht zum Anlegen weiter ihr Kampf-Level – herstellen darf man sie vorher schon (z. B. zum Verkaufen)."])
s.append(Paragraph("Animation", H2))
s.append(p("Schmieden: Hammer (img/objekte3d/skilling/utensilien/hammer.glb) beidhändig (hieb2h) über dem Amboss, Funken. Werkbank: Hobel bzw. Einhand-Hieb. Nähen, Spinnen, Weben, Gerben: Ruhe-Pose mit kurzer Handbewegung "
           "(bis eigene Clips da sind). Angelegte Waffe und Schild sind während der Arbeit weg – wie beim Fällen und Abbauen."))

s.append(Paragraph("2 · Rohstoffe je Stufe", H1))
R = ["Training", "Einfach", "Selten", "Episch", "Legendär", "Mythisch"]; L = [1, 10, 20, 35, 45, 65]
s.append(tab(["Stufe", "Lvl", "Holz (Holzfällerei)", "Erz → Barren (Bergbau)", "Faser (Pflücken)", "Haut → Leder (Kampf)", "Splitter je Einheit"], [
    [R[i], L[i], ["Eiche", "Tanne", "Eibe", "Moorweide", "Kernbaum", "Weltenbaum"][i], ["Kupfer (1 Erz)", "Eisen (2)", "Schwarzeisen (2)", "Sterneisen (2)", "Splittereisen (2)", "Ureisen (3)"][i],
     ["Flachs", "Nessel", "Silberhanf", "Moorseide", "Kernfaser", "Weltenseide"][i], ["Raue Haut", "Wildleder-Haut", "Dornhaut", "Moorhaut", "Splitterhaut", "Urhaut"][i], ["–", "–", "–", "15", "40", "100"][i]] for i in range(6)],
    [18, 9, 30, 32, 26, 37, 26]))
s += li(["<b>Fasern</b> wachsen an <b>Faserbüschen</b> in der Welt (wie Holzfäller-Bäume, aber ohne Werkzeug). Pflücken gibt Handwerk-XP, der Busch ist danach eine Weile kahl. "
         "Flachs auf den Wiesen um die Waldmark, Nessel am Kreuzwald, Silberhanf am Nordsaum, Moorseide im Rabenmoor, Kernfaser im Nordwald, Weltenseide an den Rissen.",
         "<b>Häute</b> lassen Tiere und tierische Gegner fallen (Beutetabelle, wie Splitter): Raue Haut z. B. von Wölfen und Keilern um die Waldmark, Dornhaut von den Mooshockern, Moorhaut aus dem Rabenmoor. "
         "Raue Haut und Wildleder-Haut verkauft außerdem der Gerber – damit niemand am Anfang festhängt.",
         "<b>Brennholz:</b> Jeder Barren braucht einen Stamm – höchstens zwei Stufen unter dem Erz (Sterneisen ab Eibe). So bleibt niedriges Holz bis zum Schluss nützlich.",
         "<b>Gerberlohe:</b> Gerben braucht ebenfalls einen Stamm (beliebige Sorte)."])
s.append(PageBreak())

s.append(Paragraph("3 · Vorstufen: Schmelzen, Pflücken, Spinnen, Weben, Gerben", H1))
s.append(p("Diese Schritte machen aus den Rohstoffen die Bausteine der Rezepte. Jeder gibt eigene Handwerk-XP."))
s.append(tab(["Schritt", "Ergebnis", "Lvl", "Zutaten", "XP", "Ticks"], [[v["art"], v["name"], v["level"], v["zutaten"], v["xp"], v["ticks"]] for v in Z0["vor"]], [34, 34, 9, 80, 11, 10], klein=True))
s.append(PageBreak())

s.append(Paragraph("4 · Rezepte", H1))
s.append(p("Alle Teile, die es im Spiel schon gibt, in allen Stufen. Lvl = Handwerk-Level. Die Trainingsstufe liefert die bekannten Anfängerteile (Ritterschwert, Rundschild, Jagdbogen …). "
           "XP = die Hälfte der Sammel-XP, die in den Zutaten steckt – wer also ein Teil aus selbst gesammeltem Material baut, bekommt fürs Bauen noch einmal halb so viel XP wie fürs Sammeln."))
for werk in ["Amboss", "Werkbank", "Nähtisch"]:
    s.append(Paragraph(werk, H2)); rows = []
    for r in sorted([r for r in Z0["rezepte"] if r["werk"] == werk], key=lambda r: (r["fam"], r["t"])):
        rows.append([r["fam"], r["stufe"], r["name"], r["level"], " + ".join(f"{n} {z}" for z, n in r["zutaten"]), de(r["splitter"]) if r["splitter"] else "–", de(r["xp"])])
    s.append(tab(["Familie", "Stufe", "Teil", "Lvl", "Zutaten", "Splitter", "XP"], rows, [28, 16, 27, 8, 70, 13, 14], klein=True))
s.append(PageBreak())

s.append(Paragraph("5 · XP und Balancing", H1))
s += li(["<b>Verarbeiten:</b> 50 % der Sammel-XP der Zutaten (ein Barren zählt als seine Erze, Garn als zwei Fasern, Stoff als vier, Leder als zwei Gerb-Schritte).",
         "<b>Schmelzen:</b> 30 % der Erz-XP. <b>Pflücken</b> gibt volle XP (wie ein Sammelberuf), <b>Spinnen/Weben</b> je 30 %, <b>Gerben</b> feste XP je Haut.",
         "Damit steckt im Handwerk etwa <b>60 % der Sammel-XP</b> seiner Zutaten."])
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
s += li(["<b>Werkstätten in 3D:</b> Esse, Amboss, Werkbank, Spinnrad, Webstuhl, Gerbbottich, Nähtisch (je ein Modell, ohne Stufen).",
         "<b>Faserbüsche:</b> 6 Pflanzen (Flachs, Nessel, Silberhanf, Moorseide, Kernfaser, Weltenseide), je voll und kahl – wie Baum und Stumpf.",
         "<b>Bilder für den Rucksack:</b> 6 Fasern, 6 Garne, 6 Stoffballen, 6 Häute, 6 Leder (Barren, Stämme und Erze gibt es schon).",
         "<b>Tiere / Häute:</b> ein bis zwei Tiergegner für Raue Haut und Wildleder-Haut rund um die Waldmark (z. B. Wolf, Keiler).",
         "Symbol Handwerk: fertig (img/objekte3d/skilling/symbole/handwerk.webp, aus deinem Bild)."])
s.append(Paragraph("Welt (World Pipeline)", H2))
s += li(["Werkstätten in die Waldmark setzen (Schmiede, Weberhaus, Gerberei am Bach), je mit Kartensymbol (Amboss gibt es schon).",
         "Faserbüsche verteilen – wie die Lichtungen über eine Standortliste (shared/handwerk_standorte.json), eingetragen von lichtungen.mjs."])
s.append(Paragraph("Spiel (Server und Browser)", H2))
s += li(["shared/handwerk.ts: Rezepte, Vorstufen, Werkstätten – eine Liste, aus der Server, Rezeptfenster und dieses Heft lesen.",
         "Server: „handwerk“/„start“ (Rezept, Menge) mit Prüfung von Level, Zutaten, Nähe; Takt, Glut, Abbruch. Pflücken über den gemeinsamen Sammel-Kern (wie Holz und Bergbau).",
         "Browser: Rezeptfenster je Werkstatt, Fortschritt, Glut-Knopf; Handwerk unter Skills → Berufe; XP-Drop mit dem Handwerk-Symbol.",
         "Gegenstände: 6 Barren, 36 Zwischenstücke (Fasern, Garn, Stoff, Häute, Leder) – stapelbar bis 1.000, damit der Rucksack nicht platzt.",
         "Beutetabellen: Häute bei den passenden Gegnern. Händler: Gerber verkauft Raue Haut und Wildleder-Haut, kauft Fertigteile an.",
         "Keine neue Datenbank-Tabelle, keine Migration: XP und Zutaten liegen im Inventar des Helden."])
s.append(Paragraph("Offene Fragen an dich", H2))
s += li(["<b>Häute:</b> aus dem Kampf (so vorgeschlagen) – oder später ein eigener Beruf „Jagd“ mit Fallen?",
         "<b>Zwischenstücke stapelbar?</b> Vorschlag: Barren, Garn, Stoff, Leder, Fasern und Häute stapeln (bis 1.000); Stämme und Erze bleiben einzeln wie in OSRS.",
         "<b>Splitter-Kosten</b> ab Episch: 15 / 40 / 100 je Rohstoff-Einheit – ein mythischer Brustpanzer kostet so 600 Splitter. Passt das zur Splitter-Menge im Spiel?",
         "<b>Meisterstücke</b> (eigene, etwas stärkere Varianten) später als Ausbaustufe? Dafür müsste ein Gegenstand eigene Werte tragen können."])
SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm,
                  title="Mythara – Handwerk (Konzept)", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("fertig", sys.argv[1])
