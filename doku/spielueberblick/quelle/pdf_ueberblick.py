"""Mythara – Spielüberblick als PDF: Spielprinzip, Kampfsystem (kurz), Karte, Gegner, Quests, Händler, alle Gegenstände.
Daten aus dem Spielcode (spiel.json, erzeugt von daten.js.mjs), Karte aus den Weltkacheln (karte.py).
Aufruf: python3 pdf_ueberblick.py ausgabe.pdf"""
import json, sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

D0 = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("S", D0 + "DejaVuSans.ttf")); pdfmetrics.registerFont(TTFont("SB", D0 + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SI", D0 + "DejaVuSans-Oblique.ttf")); pdfmetrics.registerFont(TTFont("SE", D0 + "DejaVuSerif-Bold.ttf"))
registerFontFamily("S", normal="S", bold="SB", italic="SI", boldItalic="SB")

GOLD = colors.HexColor("#8a6a2c"); DUNKEL = colors.HexColor("#2b2116"); HELL = colors.HexColor("#f6efe1"); LINIE = colors.HexColor("#c9b48a")
T = ParagraphStyle("t", fontName="SE", fontSize=26, leading=31, textColor=DUNKEL, spaceAfter=4)
U = ParagraphStyle("u", fontName="S", fontSize=10.5, leading=14, textColor=GOLD, spaceAfter=14)
H1 = ParagraphStyle("h1", fontName="SE", fontSize=16, leading=20, textColor=DUNKEL, spaceBefore=4, spaceAfter=7)
H2 = ParagraphStyle("h2", fontName="SB", fontSize=11, leading=14, textColor=GOLD, spaceBefore=9, spaceAfter=3)
P = ParagraphStyle("p", fontName="S", fontSize=9.3, leading=13, textColor=DUNKEL, spaceAfter=5)
LI = ParagraphStyle("li", parent=P, leftIndent=11, bulletIndent=2, spaceAfter=2.5)
F = ParagraphStyle("f", fontName="S", fontSize=9.1, leading=13, textColor=DUNKEL, backColor=HELL, borderPadding=(5, 7, 5, 7), leftIndent=7, rightIndent=7, spaceBefore=4, spaceAfter=8)
Z = ParagraphStyle("z", fontName="S", fontSize=8, leading=10.5, textColor=DUNKEL)
ZB = ParagraphStyle("zb", fontName="SB", fontSize=8, leading=10.5, textColor=colors.white)
K = ParagraphStyle("k", fontName="SI", fontSize=8, leading=11, textColor=colors.HexColor("#6b5a3e"), spaceAfter=6)

def p(t): return Paragraph(t, P)
def li(items): return [Paragraph(i, LI, bulletText="•") for i in items]
def kasten(t): return Paragraph(t, F)
def tab(kopf, zeilen, breiten, klein=False):
    z1 = ParagraphStyle("z1", parent=Z, fontSize=7.2, leading=9.3) if klein else Z; z2 = ParagraphStyle("z2", parent=ZB, fontSize=7.2, leading=9.3) if klein else ZB
    d = [[Paragraph(k, z2) for k in kopf]] + [[Paragraph(str(c), z1) for c in z] for z in zeilen]
    t = Table(d, colWidths=[b * mm for b in breiten], repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), DUNKEL), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.4, LINIE),
          ("TOPPADDING", (0, 0), (-1, -1), 2.6), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6), ("LEFTPADDING", (0, 0), (-1, -1), 3.5), ("RIGHTPADDING", (0, 0), (-1, -1), 3.5)]
    for i in range(1, len(d)):
        if i % 2 == 0: st.append(("BACKGROUND", (0, i), (-1, i), HELL))
    t.setStyle(TableStyle(st)); return t

STAND = "Stand 24.11.2026"
def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(16 * mm, 13 * mm, 194 * mm, 13 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(16 * mm, 9 * mm, f"Mythara – Splitterlande · Spielüberblick · {STAND}")
    c.drawRightString(194 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()

D = json.load(open("spiel.json")); LEG = json.load(open("legende.json"))
SN = {"anfaenger": "Training", "gewoehnlich": "Einfach", "selten": "Selten", "episch": "Episch", "legendaer": "Legendär", "mythisch": "Mythisch", "set": "Set"}
RANG = {k: i for i, k in enumerate(["anfaenger", "gewoehnlich", "selten", "episch", "legendaer", "mythisch", "set"])}
AN = {"geschick": "Geschick", "staerke": "Stärke", "fernkampf": "Fernkampf", "magie": "Magie", "defense": "Defense", "lp": "Lebenspunkte"}
KURZ = {"Verteidigung Nahkampf": "Abw. Nah", "Verteidigung Fernkampf": "Abw. Fern", "Verteidigung Magie": "Abw. Magie", "Magische Genauigkeit": "Mag. Genauigkeit",
        "Fernkampf-Angriff": "Fern-Angriff", "Fernkampf-Stärke": "Fern-Stärke", "Magie-Stärke": "Mag.-Stärke", "Angriffstempo": "Tempo"}
def werte(t):
    out = []
    for k, v in t["werte"]:
        if k in ("Kampfart", "Benötigt", "Reichweite"): continue
        if k == "Angriffstempo": v = v.split(" (")[0]
        out.append(f"{KURZ.get(k, k)} {v}")
    return " · ".join(out)
anf = lambda t: f"{AN.get(t['anf']['skill'], t['anf']['skill'])} {t['anf']['level']}" if t["anf"] else "–"
def woher(t):
    w = [f"Händler: {x.rsplit(' ', 1)[0]} ({x.rsplit(' ', 1)[1]} Spl.)" for x in t["preis"]] + [f"Beute: {x}" for x in t["drop"]]
    return "<br/>".join(w) if w else "noch keine Quelle"

s = []
# ---------- Titel ----------
s += [Spacer(1, 30 * mm), Paragraph("Mythara – Splitterlande", T), Paragraph(f"Spielüberblick: Welt, Kampf, Gegner, Quests, Händler und alle Gegenstände · {STAND}", U)]
s.append(p("Dieses Heft fasst den <b>aktuellen Stand des Echtzeit-Spiels</b> zusammen, wie er im Spielcode steht. Alle Zahlen (Werte, Preise, Beute-Chancen, Stellen auf der Karte) "
           "sind direkt aus dem Code gelesen. Die vollständigen Formeln des Kampfes stehen im eigenen Heft <b>Mythara-Kampfsystem-v4.pdf</b>; hier steht die Kurzfassung."))
s.append(Spacer(1, 6 * mm))
s.append(tab(["Kapitel", "Inhalt"], [
    ["1 · Das Spiel", "Spielprinzip, Held, Skills, Inventar, Tod, Abmelden"],
    ["2 · Kampfsystem", "Ticks, Würfe, Max Hit, Angriffsstile, XP – Kurzfassung von v4"],
    ["3 · Die Karte", "Weltkarte mit allen Figuren, Händlern und Gegnerlagern, Gebiete im Überblick"],
    ["4 · Gegner", "Bandit, Mooshocker, Waldgolem: Werte, Verhalten, Beute"],
    ["5 · Quests", "„Die gesperrte Straße“ und „Der stille Rain“"],
    ["6 · Händler", "Drei Läden in Waldmark mit allen Waren und Preisen"],
    ["7 · Gegenstände", f"Alle {len(D['teile'])} Gegenstände: Waffen, Schilde, Rüstung je Platz, Set, Tränke und Sonstiges"],
], [42, 132]))
s.append(PageBreak())

# ---------- 1 Spiel ----------
s.append(Paragraph("1 · Das Spiel", H1))
s.append(p("Mythara ist ein <b>Echtzeit-Rollenspiel für viele Spieler</b> in einer gemeinsamen 3D-Welt im Browser. Alle Spieler sehen einander, kämpfen gegen dieselben Gegner "
           "und chatten. Der <b>Spielserver rechnet alles Wichtige selbst</b> – Treffer, Schaden, XP, Beute, Inventar und Queststand –, der Browser zeigt nur an."))
s.append(Paragraph("Ablauf beim Spielen", H2))
s += li(["<b>Anmelden</b> (oder als Gast) → <b>Willkommensseite</b> mit Neuigkeiten → <b>„Ins Spiel“</b>.",
         "Wer noch keinen Helden hat, kommt danach in den <b>Heldeneditor</b>: Geschlecht, Frisur, Bart, Haar- und Hautfarbe, dann die <b>Startwaffe</b> (Schwert und Schild, Bogen oder Stab).",
         "Man beginnt in <b>Waldmark</b> oder an der zuletzt gemerkten Stelle. Wer fällt, erwacht in Waldmark mit vollem Leben.",
         "Auf Handy und Tablet spielt sich Mythara im <b>Querformat</b> (Android sperrt es, auf dem iPhone erscheint hochkant ein Hinweis)."])
s.append(Paragraph("Held, Skills und Heldenlevel", H2))
s.append(p("Es gibt <b>sechs Skills</b>: Geschick, Stärke, Defense, Fernkampf, Magie und Lebenspunkte, jeweils bis <b>Level 100</b>. XP gibt es für verursachten Schaden; "
           "welche Skills sie bekommen, entscheidet der <b>Angriffsstil</b>. Aus den Skills ergibt sich das <b>Heldenlevel</b> (Kampfstufe), das Mitspieler über dem Kopf sehen. "
           "Lebenspunkte beginnen bei Level 10; Leben kehrt alle 50 Sekunden um 1 Punkt zurück (Tränke heilen sofort)."))
s.append(Paragraph("Inventar, Währung, Beute", H2))
s += li([f"<b>Rucksack mit 24 Plätzen</b> und fünf Ausrüstungsplätze: Waffe, Nebenhand, Kopf, Brust, Beine. Das Inventar liegt auf dem Server – niemand kann es im Browser fälschen.",
         "<b>Splitter</b> sind die Währung (stapelbar). Man bekommt sie als Beute und als Questbelohnung und gibt sie bei den Händlern aus.",
         "Beute fällt auf den Boden: <b>30 Sekunden</b> nur für den sichtbar, der den meisten Schaden gemacht hat, danach <b>5 Minuten</b> für alle.",
         "Ausrüstung hat <b>Anforderungen</b> (z. B. Geschick 20); geprüft wird beim Anlegen auf dem Server."])
s.append(Paragraph("Abmelden und mehrere Geräte (Regeln wie OSRS)", H2))
s += li(["Nach <b>5 Minuten ohne Eingabe</b> wird man aus dem Spiel abgemeldet (Willkommensseite mit Hinweis, „Ins Spiel“ führt zurück).",
         "Wird die Verbindung <b>im Kampf</b> getrennt (Seite zu, Netz weg, Abmelden), bleibt der Held stehen und wehrt sich, bis 10 Sekunden ohne Kampf vergangen sind – höchstens 60 Sekunden. Ohne Kampf geht er sofort.",
         "<b>Ein Konto, ein Held:</b> Meldet man sich auf einem zweiten Gerät an, übernimmt das neue Gerät denselben Helden (mit Leben und Stelle); das alte wird abgemeldet."])
s.append(PageBreak())

# ---------- 2 Kampf ----------
s.append(Paragraph("2 · Kampfsystem (Kurzfassung v4)", H1))
s.append(p("Der Kampf läuft in <b>Ticks zu 0,5 Sekunden</b>. Jede Waffe hat ein Tempo in Ticks (Dolch schneller, Zweihänder langsamer). Ein Angriff besteht aus "
           "<b>Trefferwurf</b> gegen <b>Abwehrwurf</b> und, wenn er trifft, einem <b>Schadenswurf</b> zwischen 0 und dem Max Hit – wie in OSRS."))
s.append(kasten("<b>Wurf</b> = effektives Level × (Ausrüstungsbonus + 64)<br/>"
                "<b>Effektives Level (Held)</b> = Level + Stil-Bonus + 8 &nbsp;·&nbsp; <b>(Gegner)</b> = Level + 9<br/>"
                "<b>Abwehr gegen Magie</b> = (⌊0,7 · Magie⌋ + ⌊0,3 · eff. Defense⌋) × (Bonus + 64)<br/>"
                "<b>Max Hit Nah/Fern</b> = ⌊0,5 + (Level + Stil + 8) × (Stärkebonus + 64) / 640⌋ &nbsp;·&nbsp; <b>Magie</b> = Level × (Magie-Stärke + 64) / 640"))
s.append(p("Ist der Angriffswurf größer als der Abwehrwurf, trifft der Schlag (Trefferchance nach der OSRS-Rechnung). <b>Metallrüstung</b> schwächt Fernkampf- und Magie-Angriffe "
           "(negative Boni), Roben und Leder schützen dafür schlechter gegen Klingen."))
s.append(Paragraph("Angriffsstile", H2))
rows = []
for art, nm in (("nah", "Nahkampf"), ("fern", "Fernkampf"), ("magie", "Magie")):
    for st in D["stile"][art]: rows.append([nm, st["name"], st["text"]])
s.append(tab(["Kampfart", "Stil", "Wirkung und XP je Schaden"], rows, [26, 30, 118]))
s.append(Paragraph("Weitere Regeln", H2))
s += li(["<b>Einzelkampf:</b> In der offenen Welt kämpft ein Gegner nur mit einem Helden zugleich (außer in ausgewiesenen Mehrkampf-Gebieten).",
         "<b>Autoangriff</b> (Standard an): Wer angegriffen wird, schlägt sofort zurück.",
         "<b>Aggressive Gegner</b> greifen an, sobald man zu nahe kommt; manche nur Helden unter einem bestimmten Heldenlevel (Waldgolem: unter 15).",
         "Geschosse (Pfeil, Bolzen, Zauber) fliegen sichtbar zum Ziel; alle Mitspieler sehen das richtige Geschoss.",
         "XP-Kurve: 85 % der OSRS-Kurve für alle Skills – Level 10 bei 981 XP, Level 99 bei 11.079.266 XP, Level 100 bei 12.232.486 XP."])
s.append(PageBreak())

# ---------- 3 Karte ----------
s.append(Paragraph("3 · Die Karte", H1))
s.append(p("Die offene Welt, aus den echten Kacheln des Spiels zusammengesetzt (Norden oben). Punkte: <font color='#d8a520'><b>gelb</b></font> Figuren von Quest 1, "
           "<font color='#4a9ad8'><b>blau</b></font> Figuren von Quest 2, <b>weiß</b> Händler, <font color='#c83228'><b>rot</b></font> Banditen, "
           "<font color='#5aaa46'><b>grün</b></font> Mooshocker, <font color='#96643c'><b>braun</b></font> Waldgolems."))
s.append(Image("weltkarte.jpg", width=178 * mm, height=178 * mm * 2496 / 3072))
s.append(PageBreak())
s.append(Paragraph("Waldmark und Osthof vergrößert", H2))
s.append(Image("ausschnitt.jpg", width=178 * mm, height=178 * mm * 510 / 1170))
s.append(Spacer(1, 3 * mm))
half = (len(LEG) + 1) // 2
leg = [[f"<b>{a[0]}</b> {a[1]}", f"<b>{b[0]}</b> {b[1]}" if b else ""] for a, b in zip(LEG[:half], LEG[half:] + [None])]
s.append(tab(["Legende", ""], leg, [87, 87]))
s.append(Paragraph("Gebiete", H2))
s.append(tab(["Gebiet", "Was es dort gibt"], [
    ["Waldmark", "Startdorf mit Marktplatz und Rathaus. Drei Händler, Jori (Quest 1), Bürgermeister Hagan Voss, Brida Wegner (Quest 2). Hier erwacht, wer fällt; nur hier wechselt man den Helden."],
    ["Osthof", "Bauernhof östlich von Waldmark an der Steinstraße. Fenna Ried (Quest 1), Odo Kern und Wenzel (Quest 2). Am <b>Moosrain</b> im Norden: 7 Mooshocker (Trainingsgegner, nicht aggressiv)."],
    ["Kreuzwald", "Wald südlich der großen Straße. Auf der Lichtung ein <b>Banditenlager</b> (Banditen Level 1, aggressiv). Im Süden die <b>Straßensperre</b> mit den Wachen Raban und Tilda."],
    ["Nordwald", "Ruinen einer verfallenen Feste im Nordwesten. <b>5 Waldgolems</b> (Level 15), aggressiv nur gegen Helden unter Heldenlevel 15."],
    ["Weidenhain", "Dorf hinter der Straßensperre, erst nach Quest 1 erreichbar. Bürgermeister Othmar Rehn auf dem Dorfplatz."],
    ["Rabenmoor", "Moor mit Insel im Südwesten, nach Quest 1 erreichbar. Die Spur des Schriftstücks führt hierher (Fortsetzung folgt)."],
    ["Unterschlupf", "Versteck der Banditen unter einem Haus (Innenraum, nicht auf der Karte)."],
    ["Westmark, Obstwiesen, Osthang, Graufurt, Nordsaum", "Begehbar, bisher ohne Gegner und Quests – Platz für Kommendes."],
], [30, 144]))
s.append(PageBreak())

# ---------- 4 Gegner ----------
s.append(Paragraph("4 · Gegner", H1))
for m in D["monster"]:
    ag = "nicht aggressiv" if not m["aggressiv"] else (f"aggressiv gegen Helden unter Heldenlevel {m['aggroBis']}" if m["aggroBis"] else "aggressiv")
    v = m["v2"]; ab = m["v2"]["abwehr"]
    rows = [["Level", m["stufe"], "Lebenspunkte", m["lp"]], ["Angriff", f"{m['angriff']} ({'Nahkampf' if m['art'] == 'nah' else m['art']}), alle {m['ticks']} Ticks ({m['ticks'] / 2:g} s)", "Max Hit", m["maxHit"]],
            ["Skills", f"Geschick {v['geschick']} · Stärke {v['staerke']} · Defense {v['defense']} · Magie {v['magie']}", "Verhalten", ag],
            ["Abwehrboni", f"Nah {ab['nah']:+d} · Fern {ab['fern']:+d} · Magie {ab['magie']:+d}" + (f" · Angriffsbonus {v['angriffBonus']:+d}" if v.get("angriffBonus") else ""), "Wo", {"bandit_dolch": "Kreuzwald (Lichtung), Unterschlupf", "mooshocker": "Osthof, Moosrain", "waldgolem": "Nordwald, Ruinen"}[m["id"]]]]
    blk = [Paragraph(m["name"], H2), tab(["Wert", "", "Wert", ""], rows, [24, 82, 24, 44])]
    if m["info"]: blk.append(Paragraph("„" + m["info"] + "“", K))
    if any(m["drops"]): blk.append(p("<b>Beute</b> (je Wurf eine Chance):<br/>" + "<br/>".join(f"Wurf {i + 1}: {d}" for i, d in enumerate(m["drops"]) if d)))
    else: blk.append(p("<b>Beute:</b> noch keine (folgt)."))
    s.append(KeepTogether(blk))
s.append(PageBreak())

# ---------- 5 Quests ----------
s.append(Paragraph("5 · Quests", H1))
s.append(p("Quests verfolgt man im <b>Questlog</b>; eine verfolgte Quest zeigt ihr nächstes Ziel auf Karte und Minikarte. Dialoge sind privat – nur der Spieler, der redet, sieht sie. "
           "Der Fortschritt liegt auf dem Server und bleibt über Abmelden und Gerätewechsel erhalten."))
q = D["q1"]; L = q["log"]
s.append(Paragraph("Quest 1 · Die gesperrte Straße", H2))
s.append(p("Der Handel zwischen Waldmark und Weidenhain ist zum Erliegen gekommen, die Straße durch den Kreuzwald ist gesperrt. Ein Kind bittet um Hilfe."))
s.append(tab(["Schritt", "Was zu tun ist"], [[str(i + 1), L[k]] for i, k in enumerate(["angenommen", "auftrag", "osthof", "wachen", "beweis", "bestaetigt", "frei", "fertig"])], [14, 160]))
b = q["belohnung"]
s.append(p("<b>Beteiligte:</b> Jori, Bürgermeister Hagan Voss (Waldmark), Fenna Ried (Osthof), Wachtmann Raban und Wachtfrau Tilda (Sperre), Bürgermeister Othmar Rehn (Weidenhain). "
           "<b>Belohnung:</b> " + ", ".join(f"{v} {AN[k]}-XP" for k, v in b.items()) + "; die Sperre öffnet sich – <b>Weidenhain und Rabenmoor</b> werden erreichbar."))
q = D["q2"]
s.append(Paragraph("Quest 2 · Der stille Rain", H2))
s.append(p("Auf dem Osthof sind Zäune beschädigt und Weidenruten liegen verstreut. Die Spuren führen zum Moosrain, wo die Mooshocker leben."))
s.append(tab(["Schritt", "Was zu tun ist"], [[str(i + 1), x["text"]] for i, x in enumerate(q["schritte"])], [14, 160]))
s.append(p("<b>Beteiligte:</b> Brida Wegner (Waldmark), Odo Kern und Wenzel (Osthof). Drei Bruchstellen am Zaun und vier Bündel Weidenruten sind in der Welt zu finden. "
           f"<b>Belohnung:</b> {q['belohnung']['splitter']} Splitter Die Mooshocker am Moosrain bleiben danach ein guter Trainingsplatz (40 LP, kaum gefährlich)."))
s.append(PageBreak())

# ---------- 6 Händler ----------
s.append(Paragraph("6 · Händler in Waldmark", H1))
s.append(p("Alle drei Läden stehen am Marktplatz von Waldmark. Bezahlt wird mit Splittern; der Server prüft Preis und Platz im Rucksack. Händler führen Training-, Einfach- und Selten-Ausrüstung."))
for l in D["laeden"]:
    rows = [[n, f"{pr} Splitter"] for n, pr in l["waren"]]
    s.append(KeepTogether([Paragraph(f"{l['name']} – {l['haendler']}", H2), Paragraph("„" + l["spruch"] + "“", K), tab(["Ware", "Preis"], rows, [120, 54])]))
s.append(PageBreak())

# ---------- 7 Gegenstände ----------
s.append(Paragraph("7 · Alle Gegenstände", H1))
s.append(p("Sieben Stufen: <b>Training</b> (Startausrüstung), <b>Einfach</b> (Level 10), <b>Selten</b> (20), <b>Episch</b> (35), <b>Legendär</b> (45), <b>Mythisch</b> (65) und das <b>Rabenset</b>. "
           "Zu jeder Kampfart gibt es eigene Waffen und Rüstung: Metall für Nahkampf, Leder für Fernkampf, Roben für Magie. "
           "Abkürzungen: Abw. = Verteidigungsbonus, Tempo = Ticks zwischen zwei Angriffen."))
teile = sorted(D["teile"], key=lambda t: (RANG.get(t["s"], 9), t["art"] or "", t["name"]))
for platz, titel in (("waffe", "Waffen"), ("nebenhand", "Nebenhand (Schilde)"), ("kopf", "Kopf"), ("brust", "Brust"), ("beine", "Beine")):
    rows = [[f"<b>{t['name']}</b>", (t["art"] or "") + (" (zweihändig)" if t["zweihand"] else ""), SN.get(t["s"], t["s"]), werte(t), anf(t), woher(t)] for t in teile if t["platz"] == platz]
    s.append(Paragraph(f"{titel} ({len(rows)})", H2)); s.append(tab(["Name", "Art", "Stufe", "Werte", "Benötigt", "Erhältlich"], rows, [30, 24, 15, 59, 18, 28], klein=True))
s.append(Paragraph("Set", H2))
for st in D["sets"]: s.append(p(f"<b>{st['name']}</b> ({', '.join(st['teile'])}): {st['text']}"))
s.append(Paragraph("Tränke, Währung und Sonstiges", H2))
rows = [[f"<b>{t['name']}</b>", t["art"], t["text"], woher(t)] for t in teile if not t["platz"]]
s.append(tab(["Name", "Art", "Beschreibung", "Erhältlich"], rows, [30, 24, 86, 34], klein=True))
s.append(Spacer(1, 4 * mm))
s.append(Paragraph("Wo noch „noch keine Quelle“ steht, gibt es den Gegenstand im Spiel schon, aber noch keinen Weg, ihn zu bekommen – dafür sind die höheren Gegner und das Handwerk gedacht.", K))

SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm,
                  title="Mythara – Spielüberblick", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("ok", sys.argv[1])
