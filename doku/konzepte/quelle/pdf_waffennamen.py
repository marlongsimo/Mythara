"""Mythara – Konzept „Namen nach Material“ (Waffen und Rüstungen) als PDF. Namen aus dem Spielcode (realtime/shared/gegenstaende.ts).
Aufruf (im Ordner doku/konzepte/quelle): python3 pdf_waffennamen.py ../Mythara-Namen-nach-Material.pdf namen.json
namen.json: { kennung: [name, seltenheit] } – erzeugt aus GEGENSTAENDE (siehe README im Commit)."""
import json, sys
import os
_k = open("kopf.py").read().split("STAND =")[0]
if not os.path.exists("/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"): _k = _k.replace("DejaVuSans-Oblique.ttf", "DejaVuSans.ttf")   # Kursiv fehlt hier: aufrecht setzen
exec(_k)
STAND = "Konzept · Stand 26.11.2026"
def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(16 * mm, 13 * mm, 194 * mm, 13 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(16 * mm, 9 * mm, f"Mythara – Splitterlande · Namen nach Material · {STAND}")
    c.drawRightString(194 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()
N = json.load(open(sys.argv[2]))
STUFEN = [("gewoehnlich", "Einfach", 10), ("selten", "Selten", 20), ("episch", "Episch", 35), ("legendaer", "Legendär", 45), ("mythisch", "Mythisch", 65)]
VORSILBEN = ["Splittereisen", "Schwarzeisen", "Sterneisen", "Ureisen", "Eisen", "Weichleder", "Hartleder", "Moorleder", "Splitterleder", "Urleder", "Grobtuch", "Feintuch",
             "Mondtuch", "Splittertuch", "Weltentuch", "Moorweiden", "Weltenbaum", "Kernholz", "Tannen", "Eiben", "Trainings"]
def weich(n):
    """Trennstelle an der Wortfuge (nicht mitten im Wort): Sterneisen|schwert, Trainings|schwert"""
    for v in VORSILBEN:
        if n.startswith(v) and len(n) > len(v) and n[len(v)] != "-": return v + "<br/>" + n[len(v):] if len(n) > 15 else n
    return n.replace("-", "-<br/>") if len(n) > 12 else n
def name(basis, st, grund):   # Grundteil (ohne _stufe) hat die Seltenheit „grund“
    return weich(N.get(basis if st == grund else f"{basis}_{st}", ["–"])[0])
s = [Paragraph("Namen nach Material", T),
     Paragraph(f"Waffen und Rüstungen heißen nach dem, woraus sie gemacht sind – passend zum Handwerk · {STAND}", U)]
s.append(p("Bisher trug jede Waffe und jedes Rüstungsteil die Stufe im Namen: <i>Einfaches Schwert</i>, <i>Seltenes Schwert</i>, <i>Episches Schwert</i>. "
           "Mit dem Handwerk bekommt jede Stufe ihren eigenen Rohstoff (Konzept <i>Handwerk</i>, Stand 24.11.2026). Die Namen sagen jetzt, "
           "<b>woraus</b> ein Teil ist: <i>Eisenschwert</i>, <i>Schwarzeisenschwert</i>, <i>Sterneisenschwert</i>. Die Stufe zeigen weiter Rahmenfarbe und Stufen-Etikett."))
s.append(Paragraph("Grundsätze", H2))
s += li(["<b>Ein Material je Stufe:</b> Metallteile nach dem Barren, Lederteile nach dem Leder, Stoffteile nach dem Tuch, Bögen, Stäbe, Schilde und Armbrüste nach dem Holz.",
         "<b>Zwei Materialien → das Hauptmaterial:</b> Die Armbrust (Stämme + Barren + Sehne) und der Schild (Stämme + Barren) heißen nach dem Holz.",
         "<b>Schreibweise:</b> kurze Wörter zusammen (<i>Eisenschwert</i>, <i>Ureisenspeer</i>, <i>Eibenstab</i>), lange mit Bindestrich (<i>Sterneisen-Zweihänder</i>, <i>Moorleder-Wams</i>, <i>Eiben-Langbogen</i>).",
         "<b>Training bleibt Training:</b> Trainingsschwert, Trainingsschild, Trainingsbogen, Trainingsstab, Trainings-Lederpanzer, Trainingsrobe, Trainings-Holzbeil, Trainings-Spitzhacke.",
         "<b>Eigennamen bleiben:</b> Rabenset (Rabenkapuze, Rabenpanzer, Rabenbeinschützer) und der Gesegnete Waldsäbel – sie gehören nicht zur Materialreihe.",
         "<b>Nur der Anzeigename ändert sich:</b> Die Kennungen (z. B. <i>eidschwert_episch</i>) bleiben – Spielstände, Server und Datenbank sind nicht betroffen."])
s.append(Paragraph("1 · Material je Stufe", H1))
s.append(tab(["Stufe", "Lvl", "Metall (Barren)", "Leder", "Stoff", "Holz"], [
    ["Training", 1, "bleibt „Training…“", "", "", ""],
    ["Einfach", 10, "Eisen", "Weichleder", "Grobtuch", "Tannen-"], ["Selten", 20, "Schwarzeisen", "Hartleder", "Feintuch", "Eiben-"],
    ["Episch", 35, "Sterneisen", "Moorleder", "Mondtuch", "Moorweiden-"], ["Legendär", 45, "Splittereisen", "Splitterleder", "Splittertuch", "Kernholz-"],
    ["Mythisch", 65, "Ureisen", "Urleder", "Weltentuch", "Weltenbaum-"]], [22, 10, 38, 36, 36, 36]))
s.append(p("Lederarten und Stoffe wie im Handwerk-Konzept; nur „Gehärtetes Leder“ wird im Namen zu <i>Hartleder</i> (kürzer: <i>Hartleder-Wams</i> statt <i>Gehärtetes-Leder-Wams</i>). "
           "Kernbaum wird im Namen zu <i>Kernholz</i>."))
s.append(PageBreak())
s.append(Paragraph("2 · Waffen", H1))
WAFFEN = [("Einhandschwert", "eidschwert"), ("Dolch", "eiddolch"), ("Zweihänder", "eidzweihaender"), ("Streitkolben", "sternbrecher"), ("Speer", "sterndorn"),
          ("Schild", "sternenschild"), ("Kurzbogen", "mondkurzbogen"), ("Langbogen", "mondlangbogen"), ("Armbrust", "sternarmbrust"), ("Stab", "sternenszepter")]
TRAIN = {"eidschwert": "Trainingsschwert", "sternenschild": "Trainingsschild", "mondkurzbogen": "Trainingsbogen", "sternenszepter": "Trainingsstab"}
s.append(tab(["Familie", "Training"] + [x[1] for x in STUFEN], [[f, weich(TRAIN.get(b, "–"))] + [name(b, st, "selten") for st, _, _ in STUFEN] for f, b in WAFFEN],
             [24, 24, 26, 30, 26, 30, 26], klein=True))
s.append(Paragraph("3 · Rüstungen", H1))
RUE = [("Helm (schwer)", "eisenwachthelm", "selten"), ("Brustpanzer (schwer)", "eisenwacht", "selten"), ("Beinschienen (schwer)", "eisenbeinschienen", "selten"),
       ("Kapuze (leicht)", "jaegerkapuze", "gewoehnlich"), ("Wams (leicht)", "jaegerwams", "gewoehnlich"), ("Hose (leicht)", "jaegerhose", "gewoehnlich"),
       ("Kapuze (Stoff)", "magierkapuze", "gewoehnlich"), ("Robe (Stoff)", "magierrobe", "gewoehnlich"), ("Rock (Stoff)", "magierrock", "gewoehnlich")]
TRR = {"jaegerwams": "Trainings-Lederpanzer", "magierrobe": "Trainingsrobe"}
s.append(tab(["Familie", "Training"] + [x[1] for x in STUFEN], [[f, weich(TRR.get(b, "–"))] + [name(b, st, g) for st, _, _ in STUFEN] for f, b, g in RUE],
             [26, 26, 25, 29, 25, 29, 26], klein=True))
s.append(PageBreak())
s.append(Paragraph("4 · Was sich ändert – und was nicht", H1))
s.append(tab(["Bereich", "Änderung"], [
    ["Spiel (Anzeige)", "Namen im Ausrüstungsfenster, Rucksack, Datenblatt und Händler: aus realtime/shared/gegenstaende.ts (ein Block „Namen nach dem Material“)."],
    ["Kennungen, Spielstände", "Unverändert (eidschwert, eidschwert_episch …). Kein Spielstand muss angepasst werden."],
    ["Server, Datenbank", "Keine Änderung – der Server rechnet mit Kennungen, nicht mit Namen."],
    ["Datenblätter", "95 Ordner umbenannt, z. B. waffen/schwert/3-episch/sterneisenschwert/; der Name im Datenblatt ist angepasst, eingetragene Werte bleiben."],
    ["Stufe erkennen", "Rahmenfarbe und Stufen-Etikett (Einfach … Mythisch) wie bisher; der Name verrät das Material."]], [40, 138]))
s.append(Paragraph("Vorteile", H2))
s += li(["Name und Rezept passen zusammen: Wer ein <i>Sterneisenschwert</i> sieht, weiß, dass er Sterneisenbarren braucht.",
         "Die Welt wirkt geschlossener: Gesteine (Sterneisen), Bäume (Moorweide), Barren und Ausrüstung tragen dieselben Namen.",
         "Platz für Besonderes: Eigennamen (Waldsäbel, Rabenset, später Meisterstücke) heben sich deutlich von der Materialreihe ab."])
s.append(Paragraph("Zu bedenken", H2))
s += li(["Spieler müssen die Reihenfolge der Materialien lernen (Eisen → Schwarzeisen → Sterneisen → Splittereisen → Ureisen). Hilfe: Rahmenfarbe, Etikett und eine kurze Erklärung im Datenblatt.",
         "Die Set-Herkunft (Jäger, Magier, Eisenwacht) steht nicht mehr im Namen. Wenn sie wichtig bleibt: <i>Hartleder-Jägerwams</i>, <i>Feintuch-Magierrobe</i> – offen."])
s.append(kasten("<b>Offene Fragen:</b> Sollen die Set-Namen (Jäger, Magier, Eisenwacht) im Namen bleiben? Bekommen Holzbeil und Spitzhacke auch Materialnamen "
                "(z. B. <i>Sterneisen-Spitzhacke</i>) – sie heißen bisher <i>Episches Holzbeil</i> …? Sollen Meisterstücke später eigene Namen tragen?"))
SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm,
                  title="Mythara – Namen nach Material", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("PDF:", sys.argv[1])
