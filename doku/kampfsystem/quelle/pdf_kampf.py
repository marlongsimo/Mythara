from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import sys, json

D = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("S", D + "DejaVuSans.ttf")); pdfmetrics.registerFont(TTFont("SB", D + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SI", D + "DejaVuSans-Oblique.ttf")); pdfmetrics.registerFont(TTFont("SE", D + "DejaVuSerif-Bold.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("S", normal="S", bold="SB", italic="SI", boldItalic="SB")

GOLD = colors.HexColor("#8a6a2c"); DUNKEL = colors.HexColor("#2b2116"); HELL = colors.HexColor("#f6efe1"); LINIE = colors.HexColor("#c9b48a")
T = ParagraphStyle("t", fontName="SE", fontSize=24, leading=29, textColor=DUNKEL, spaceAfter=4)
U = ParagraphStyle("u", fontName="S", fontSize=10.5, leading=14, textColor=GOLD, spaceAfter=14)
H1 = ParagraphStyle("h1", fontName="SE", fontSize=15, leading=19, textColor=DUNKEL, spaceBefore=14, spaceAfter=6)
H2 = ParagraphStyle("h2", fontName="SB", fontSize=11, leading=14, textColor=GOLD, spaceBefore=8, spaceAfter=3)
P = ParagraphStyle("p", fontName="S", fontSize=9.4, leading=13.2, textColor=DUNKEL, spaceAfter=5)
LI = ParagraphStyle("li", parent=P, leftIndent=11, bulletIndent=2, spaceAfter=2.5)
F = ParagraphStyle("f", fontName="S", fontSize=9.2, leading=13, textColor=DUNKEL, backColor=HELL, borderPadding=(5, 7, 5, 7), leftIndent=7, rightIndent=7, spaceBefore=4, spaceAfter=8)
Z = ParagraphStyle("z", fontName="S", fontSize=8.4, leading=11, textColor=DUNKEL)
ZB = ParagraphStyle("zb", fontName="SB", fontSize=8.4, leading=11, textColor=colors.white)
K = ParagraphStyle("k", fontName="SI", fontSize=8.2, leading=11, textColor=colors.HexColor("#6b5a3e"), spaceAfter=6)

def p(t): return Paragraph(t, P)
def li(items): return [Paragraph(i, LI, bulletText="•") for i in items]
def formel(t): return Paragraph(t, F)
def tab(kopf, zeilen, breiten, klein=False):
    z1 = ParagraphStyle("z1", parent=Z, fontSize=7.3, leading=9.5) if klein else Z; z2 = ParagraphStyle("z2", parent=ZB, fontSize=7.3, leading=9.5) if klein else ZB
    d = [[Paragraph(k, z2) for k in kopf]] + [[Paragraph(str(c), z1) for c in z] for z in zeilen]
    t = Table(d, colWidths=[b * mm for b in breiten], repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), DUNKEL), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.4, LINIE),
          ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3), ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]
    for i in range(1, len(d)):
        if i % 2 == 0: st.append(("BACKGROUND", (0, i), (-1, i), HELL))
    t.setStyle(TableStyle(st)); return t

def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(18 * mm, 14 * mm, 192 * mm, 14 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(18 * mm, 10 * mm, "Mythara – Splitterlande · Kampfsystem v4 · Stand 23.11.2026")
    c.drawRightString(192 * mm, 10 * mm, f"Seite {d.page}"); c.restoreState()


D4 = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "kampfdaten.json"))
de = lambda v: (f"{v:,.2f}".rstrip("0").rstrip(".") if isinstance(v, float) else f"{v:,}").replace(",", "X").replace(".", ",").replace("X", ".")
vz = lambda v: ("−" + de(-v)) if v < 0 else "+" + de(v)
SN = {"anfaenger": "Training", "gewoehnlich": "Einfach", "selten": "Selten", "episch": "Episch", "legendaer": "Legendär", "mythisch": "Mythisch"}
PL = {"waffe": "Waffe", "nebenhand": "Nebenhand", "brust": "Brust", "kopf": "Kopf", "beine": "Beine"}
AN = {"geschick": "Geschick", "staerke": "Stärke", "fernkampf": "Fernkampf", "magie": "Magie", "defense": "Defense"}
KA = {"nah": "Nahkampf", "fern": "Fernkampf", "magie": "Magie"}
anf = lambda a: f"{AN[a['anforderung']['skill']]} {a['anforderung']['level']}" if a.get("anforderung") else "–"
s = []
s += [Paragraph("Kampfsystem v4", T), Paragraph("Mythara – Splitterlande · Treffer, Abwehr und Ausrüstung nach der OSRS-Rechnung · Stand 23.11.2026", U)]
s.append(p("Kampfsystem v4 ersetzt alle früheren Fassungen (v2, v3). Neu gegenüber v3: Angriff und Verteidigung sind <b>Würfe nach OSRS</b> "
           "(effektives Level × (Bonus + 64)) statt Summen, die Ausrüstung trägt <b>OSRS-Werte</b> (auch die Abzüge der Metallrüstung auf Fernkampf und Magie), "
           "und der Bandit ist ein Level-1-Monster ohne Boni. Unverändert aus v3: Ticks, Max-Hit-Formeln, Stile, XP je Schaden, 85-%-XP-Kurve, Lebenspunkte ab Level 10, Heldenlevel. "
           "Alle Zahlen stammen aus dem Code (shared/kampfwerte.ts, gegenstaende.ts, config.ts, sim.ts); der Spielserver rechnet Treffer, Schaden und XP allein."))

s.append(Paragraph("1  Grundbegriffe", H1))
s.append(tab(["Begriff", "Bedeutung"], [
    ["Tick", "0,5 Sekunden. Jeder Angriff dauert eine ganze Zahl von Ticks und fällt auf einen Tick."],
    ["Feld / Feldabstand", "Kleinste Einheit der Welt; Abstand = max(|dx|, |dy|), schräg zählt wie gerade."],
    ["Skills", "Sechs Skills, Level 1–100: Geschick, Stärke, Fernkampf, Magie, Lebenspunkte, Defense. Sie steigen nur durch XP."],
    ["Heldenlevel", "Wie das Combat Level in OSRS (ohne Prayer): ⌊0,25 × (Defense + Lebenspunkte) + max(0,325 × (Geschick + Stärke), 0,325 × (Fernkampf + ⌊Fernkampf ÷ 2⌋), 0,325 × (Magie + ⌊Magie ÷ 2⌋))⌋. Ein neuer Held hat Level 3."],
    ["Lebenspunkte", "Start auf Level 10. Max-LP = Lebenspunkte-Level (10 … 99)."],
    ["Effektives Level", "Helden: Skill-Level + Stilbonus + 8. Gegner: Skill-Level + 9 (wie Monster in OSRS)."],
    ["Wurfwert", "Effektives Level × (Ausrüstungsbonus + 64). Negative Boni senken den Wurf; nie unter 0."],
], [34, 140]))

s.append(Paragraph("2  Trefferwurf (OSRS)", H1))
s.append(formel("Angreifer würfelt Zufall(0, <b>Angriffswurf</b>), Ziel würfelt Zufall(0, <b>Verteidigungswurf</b> gegen diese Angriffsart).<br/>Treffer nur, wenn der Angriffswurf strikt höher ist. Trefferchance: A ≥ V → 1 − V ÷ (2A), sonst A ÷ (2V)."))
s.append(tab(["Wurf", "Formel"], [
    ["Angriff Nahkampf", "(Geschick + Stilbonus + 8) × (Geschick-Bonus der Ausrüstung + 64)"],
    ["Angriff Fernkampf", "(Fernkampf + Stilbonus + 8) × (Fernkampf-Angriff der Ausrüstung + 64)"],
    ["Angriff Magie", "(Magie + Stilbonus + 8) × (Magische Genauigkeit der Ausrüstung + 64)"],
    ["Abwehr gegen Nah-/Fernkampf", "(Defense + Defense-Stilbonus + 8) × (Verteidigungsbonus der Rüstung gegen diese Art + 64)"],
    ["Abwehr gegen Magie", "(⌊0,7 × Magie⌋ + ⌊0,3 × (Defense + Stilbonus + 8)⌋) × (Magie-Verteidigung der Rüstung + 64)"],
    ["Gegner: Angriff", "(Level der Kampfart + 9) × (Angriffsbonus + 64) – Angriffsbonus meist 0"],
    ["Gegner: Abwehr", "Nah/Fern: (Defense + 9) × (Bonus + 64) · Magie: (Magie + 9) × (Bonus + 64)"],
], [44, 130]))
s.append(Paragraph("Die Ausrüstung zählt gesamt: Waffe und alle angelegten Teile (Kopf, Brust, Beine, Nebenhand). Auch Rüstung kann den Angriff senken.", K))

s.append(Paragraph("3  Max Hit und Schaden", H1))
s.append(formel("<b>Nahkampf:</b> ⌊0,5 + (Stärke + Stilbonus + 8) × (Stärkebonus + 64) ÷ 640⌋<br/>"
                "<b>Fernkampf:</b> ⌊0,5 + (Fernkampf + Stilbonus + 8) × (Fernkampf-Stärke + 64) ÷ 640⌋ – die Pfeil- bzw. Bolzenstärke steckt in der Waffe<br/>"
                "<b>Magie:</b> ⌊0,5 + (Magie + Stilbonus) × (Magie-Stärke + 64) ÷ 640⌋ (ohne +8) – der Zauber steckt im Stab<br/>"
                "<b>Gegner:</b> ⌊0,5 + (Stärke + 9) × (Stärkebonus + 64) ÷ 640⌋<br/>Immer mindestens 1. Schadenswurf: ganzzahlig 1 … Max Hit, gleich verteilt."))
s.append(tab(["Level", "Bonus", "Nah/Fern normal", "Nah/Fern +3", "Magie normal", "Magie +3"], [[de(a), "+" + de(b), de(c), de(d), de(e), de(f)] for a, b, c, d, e, f in D4["mh"]], [22, 22, 34, 32, 32, 32]))

s.append(Paragraph("4  Angriffsstile", H1))
s.append(p("Stilboni sind unsichtbare Level, die nur fürs effektive Level zählen."))
s.append(tab(["Kampfart", "Stil", "Wirkung", "XP je Schadenspunkt"], [
    ["Nahkampf", "Akkurat", "+3 Geschick (Angriffswurf)", "4 Geschick"],
    ["", "Ausgewogen", "+1 Geschick, +1 Stärke, +1 Defense", "je 1,33 Geschick, Stärke, Defense"],
    ["", "Aggressiv", "+3 Stärke (Max Hit)", "4 Stärke"],
    ["", "Verteidigung", "+3 Defense (Abwehrwurf)", "4 Defense"],
    ["Fernkampf", "Akkurat", "+3 Fernkampf (Angriff und Max Hit)", "4 Fernkampf"],
    ["", "Schnell", "1 Tick schneller", "4 Fernkampf"],
    ["", "Fern", "+2 Felder Reichweite, +3 Defense", "2 Fernkampf + 2 Defense"],
    ["Magie", "Akkurat", "+3 Magie (Angriff und Max Hit)", "2 Magie"],
    ["", "Schnell", "1 Tick schneller", "2 Magie"],
    ["", "Defensiv", "+1 Magie, +3 Defense", "1,33 Magie + 1 Defense"],
], [24, 26, 66, 58]))
s += li(["Dazu in jedem Stil: 1,33 Lebenspunkte-XP je Schadenspunkt.",
         "XP nur für tatsächlich abgezogene Lebenspunkte; Bruchteile laufen als Rest weiter, gebucht werden ganze XP.",
         "Ein Block gibt keine XP. Defense steigt nur über die Stile."])

s.append(Paragraph("5  XP-Kurve", H1))
s.append(p("Alle sechs Skills: 85 % der kumulierten OSRS-XP je Level, kaufmännisch gerundet (Level 100 = OSRS-Formel eine Stufe weiter). Lebenspunkte beginnen mit den XP für Level 10."))
xp = D4["xp"]; h = (len(xp) + 1) // 2
s.append(tab(["Level", "Gesamt-XP", "Level", "Gesamt-XP"], [[de(xp[i][0]), de(xp[i][1]), de(xp[i + h][0]) if i + h < len(xp) else "", de(xp[i + h][1]) if i + h < len(xp) else ""] for i in range(h)], [25, 45, 25, 45]))

def wbonus(W):
    if W["art"] == "nah": return f"Angriff {vz(W.get('geschick', 0))}", f"Stärke {vz(W.get('staerke', 0))}"
    if W["art"] == "fern": return f"Angriff {vz(W.get('fernAngriff', 0))}", f"Pfeil/Bolzen {vz(W.get('fernStaerke', 0))}"
    return f"Genauigkeit {vz(W.get('genau', 0))}", f"Zauber {vz(W.get('magieStaerke', 0))}"
def rmal(a):
    b = a.get("bonus") or {}; t = []
    if b.get("fernAngriff"): t.append(f"Fern {vz(b['fernAngriff'])}")
    if b.get("genau"): t.append(f"Magie {vz(b['genau'])}")
    return ", ".join(t) or "–"
ab = lambda A: f"{vz(A['nah'])} / {vz(A['fern'])} / {vz(A['magie'])}" if A else "–"

s.append(Paragraph("6  Startausrüstung", H1))
s.append(p("Jeder neue Held wählt eine Startwaffe und bekommt ein passendes Teil dazu. Werte unten für einen frischen Helden (alle Skills Level 1, Defense 1, Magie 1)."))
NAMEN = {"schwert": "Schwert", "bogen": "Bogen", "stab": "Stab"}
for w, d in D4["start"].items():
    teile = []
    for t in d["teile"]:
        if t.get("waffe"): b1, b2 = wbonus(t["waffe"]); werte = f"{t['waffe']['ticks']} Ticks · {b1} · {b2}"
        else: werte = f"Verteidigung {ab(t['abwehr'])} · Angriff: {rmal(t)}"
        teile.append([t["name"], PL.get(t["platz"], t["platz"]), werte])
    blk = [Paragraph(f"Startwaffe {NAMEN[w]}", H2), tab(["Gegenstand", "Platz", "Werte"], teile, [42, 22, 110]),
           tab(["Stil", "Angriffswurf", "Max Hit", "Takt", "Reichweite", "Abwehrwurf Nah / Fern / Magie"], [[x["name"], de(x["angriff"]), de(x["max"]), f"{x['ticks']} Ticks ({de(x['ticks']*0.5)} s)", "Nahkampf" if w == "schwert" else f"{x['reich']} Felder", f"{de(x['abwehr']['nah'])} / {de(x['abwehr']['fern'])} / {de(x['abwehr']['magie'])}"] for x in d["stile"]], [24, 24, 16, 30, 24, 56])]
    s.append(KeepTogether(blk))

s.append(Paragraph("7  Waffen", H1))
s.append(p("Training ↔ Bronze/Leder/Zauberrobe, Einfach (Level 10) ↔ Black, Selten (Level 20) ↔ Mithril – die Boni sind OSRS-Werte. Nahkampf hat Reichweite 1 Feld."))
A = D4["ausruestung"]; FERTIG = ("anfaenger", "gewoehnlich", "selten")
wz = [a for a in A if a["waffe"] and a["seltenheit"] in FERTIG]
wz.sort(key=lambda a: (FERTIG.index(a["seltenheit"]), a["waffe"]["art"]))
s.append(tab(["Waffe", "Stufe", "Kampfart", "Benötigt", "Ticks", "Reichw.", "Angriff", "Stärke / Zauber"],
             [[a["name"] + (" (2H)" if a["zweihand"] else ""), SN[a["seltenheit"]], KA[a["waffe"]["art"]], anf(a), a["waffe"]["ticks"], "1" if a["waffe"]["art"] == "nah" else de(a["waffe"]["reich"]), *wbonus(a["waffe"])] for a in wz],
             [36, 15, 18, 22, 11, 13, 29, 30], klein=True))
s.append(Paragraph("Zweihänder (2H) belegen Waffe und Nebenhand. Der Speer hat eine kleine eigene Abwehr (Einfach +5/+5/0, Selten +7/+7/0).", K))

s.append(Paragraph("8  Rüstung und Schilde", H1))
s.append(p("Abwehr Nahkampf = Mittel aus Stich, Hieb und Wucht in OSRS. Metallrüstung senkt den Fernkampf- und Magie-Angriff (volle Helme −3/−6, Plattenpanzer −15/−30, Beinschienen −11/−21, Kite-Schilde −2/−8); Leder hebt den Fernkampf-Angriff, Roben die Magie."))
rz = [a for a in A if not a["waffe"] and a["seltenheit"] in FERTIG]
OR = ["kopf", "brust", "beine", "nebenhand"]
rz.sort(key=lambda a: (FERTIG.index(a["seltenheit"]), OR.index(a["platz"]) if a["platz"] in OR else 9))
s.append(tab(["Teil", "Stufe", "Platz", "Benötigt", "Abwehr Nah / Fern / Magie", "Auf den Angriff"],
             [[a["name"], SN[a["seltenheit"]], PL.get(a["platz"], a["platz"]), anf(a), ab(a["abwehr"]), rmal(a)] for a in rz], [42, 15, 18, 22, 40, 37], klein=True))
s.append(Paragraph("Beispiel Level 20 in allem, volle Mithril-Platte mit Schild: " + " · ".join(f"{b['n']}: Angriffswurf {de(b['ohne'])} → {de(b['mit'])}" for b in D4["beispiel"])
                   + f". Abwehrwurf damit {de(D4['abwehr20']['nah'])} / {de(D4['abwehr20']['fern'])} / {de(D4['abwehr20']['magie'])}.", K))
rest = [a for a in A if a["seltenheit"] not in FERTIG]
s.append(p(f"<b>Episch, Legendär, Mythisch</b> ({len(rest)} Teile): Namen und Plätze stehen, die Werte sind noch vorläufig (alte Skala) und werden nach OSRS-Vorbild neu gesetzt."))

s.append(Paragraph("9  Gegner", H1))
s.append(p("Gegner rechnen wie Monster in OSRS: eine Kampfart mit ihren Skill-Leveln (Nahkampf: Geschick und Stärke; Fernkampf; Magie), ein Defense- und ein Magie-Level, "
           "Verteidigungsboni gegen alle drei Angriffsarten, optional Angriffs- und Stärkebonus, eigene Lebenspunkte und ein Takt. Kein Stil, keine Ausrüstung."))
B = D4["bandit"]; v = B["v2"]
s.append(tab(["Bandit (Kreuzwald)", "Wert"], [
    ["Kampfart", "Nahkampf (Dolch), nur von N/O/S/W"], ["Level", f"Geschick {v['geschick']} · Stärke {v['staerke']} · Defense {v.get('defense', 1)} · Magie {v.get('magie', 1)} · keine Boni"],
    ["Angriffswurf / Max Hit", f"(1 + 9) × 64 = {de(B['treffer'])} / {B['maxHit']}"], ["Abwehrwurf Nah / Fern / Magie", f"{de(B['abwehr']['nah'])} / {de(B['abwehr']['fern'])} / {de(B['abwehr']['magie'])}"],
    ["Lebenspunkte", str(B["lp"])], ["Takt", f"{v['ticks']} Ticks ({de(v['ticks']*0.5)} s)"], ["Wiederkehr", "60 s nach dem Tod an seinem Lager"],
], [50, 124]))
s.append(tab(["Startwaffe (Level 1)", "Siege", "Dauer", "LP übrig", "Bandit trifft"], [["Schwert", "98–100 %", "13–18 s", "56–66 %", "37–52 %"], ["Bogen", "99–100 %", "16–22 s", "63–64 %", "37–51 %"], ["Stab", "92–98 %", "20–24 s", "50–56 %", "41–57 %"]], [44, 28, 30, 34, 38]))
s.append(Paragraph("Simulation 23.11.2026: je Stil 120 Duelle Level-1-Held mit Startausrüstung gegen einen Banditen, ohne Tränke (test/kampf-v2.test.mjs).", K))
s += li(["Aggro: Gegner greifen von selbst an, wenn ein Held in ihrem Umkreis steht (meist 4–5 Felder); nach 15 Minuten am selben Ort nicht mehr.",
         "Leine: Entfernt sich ein Gegner zu weit vom Lager (meist 10–14 Felder), kehrt er um und heilt sich.",
         "Einzelkampf in der offenen Welt: ein Gegner gegen einen Helden; in Mehrkampf-Gebieten viele gegen viele.",
         "Bewegung wie in OSRS: direkt aufs Ziel, höchstens ein kurzer Umweg – Safespots sind möglich."])

s.append(Paragraph("10  Bewegung, Sprint, Regeneration", H1))
s += li(["Gehen 1 Feld je Tick, Sprint 2 Felder je Tick, solange Ausdauer da ist.",
         "Ausdauer: Verbrauch je Tick 67 × (1 − Geschick ÷ 300) von 10 000, Erholung je Tick Geschick ÷ 6 + 8; neu sprinten ab 20 %.",
         "Nahkampf nur von N/O/S/W; Fernkampf und Magie nach Feldabstand und freier Sichtlinie.",
         "Regeneration: 1 LP je 100 Ticks (50 s). Gefallen: Neustart in der Waldmark mit vollem Leben."])

s.append(Paragraph("11  Tränke, Beute, Läden", H1))
s.append(tab(["Trank", "Heilung", "Preis"], [["Kleiner Heiltrank", "5 LP", "35 Splitter"], ["Heiltrank", "10 + 5 % des maximalen Lebens (stapelbar)", "150 Splitter"]], [40, 90, 44]))
s.append(tab(["Bandit-Wurf", "Inhalt"], [
    ["1  Splitter", "95 %: 1–5 Splitter · 5 %: 15–20 Splitter"],
    ["2  Ausrüstung / Trank", "je 1 %: Trainingsschwert, -schild, -bogen, -stab, -lederpanzer, -robe · 8 %: Kleiner Heiltrank"],
    ["3  Quest", "35 %: Hinweispergament (nur solange das Einsteiger-Quest läuft)"],
], [40, 134]))
s.append(p("Läden am Marktplatz: Training 10, Einfach 350, Selten 800 Splitter. Beute gehört dem, der den meisten Schaden gemacht hat: 30 s nur für ihn sichtbar, danach 5 Minuten für alle. "
           "Anforderungen prüft der Server beim Anlegen."))

s.append(Paragraph("12  Datenvorlage (für neue Ausrüstung und Gegner)", H1))
s.append(tab(["Ausrüstung", "Felder"], [
    ["Pflicht", "id, name, platz (waffe/kopf/brust/beine/nebenhand), art, seltenheit, text"],
    ["Waffe", "waffe.art (nah/fern/magie), ticks, reich; Nahkampf geschick + staerke; Fernkampf fernAngriff + fernStaerke (Pfeil/Bolzen); Magie genau + magieStaerke (Zauber); optional zweihand"],
    ["Rüstung", "abwehr { nah, fern, magie } (auch negativ); bonus { fernAngriff, genau, … } für Auf- und Abschläge auf den Angriff"],
    ["Optional", "anforderung { skill, level }, ebenen / modell3d (Darstellung), stapel"],
], [30, 144], klein=True))
s.append(tab(["Gegner", "Felder"], [
    ["Kampf (v2-Block)", "geschick + staerke (Nahkampf) oder fernkampf oder magie; defense; magie; optional angriffBonus, staerkeBonus; abwehr { nah, fern, magie } = Verteidigungsboni; ticks"],
    ["Sonst", "lp, Reichweite des Angriffs, Aggro-Umkreis, Leine, Lager, Wiederkehr, Drop-Würfe (Chancen in %), Bild/Modell"],
], [30, 144], klein=True))

s.append(Paragraph("13  Offen", H1))
s += li(["Werte für Episch, Legendär und Mythisch nach OSRS-Vorbild.",
         "Weitere Gegner nach dem Monsterschema (Mooshocker für „Der stille Rain“: 50 LP).",
         "Magie skaliert mit hohem Level stark (Seltener Stab auf Magie 99: Max Hit 37) – beim Setzen der höheren Stufen beachten."])

doc = SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=20 * mm, title="Mythara – Kampfsystem v4", author="Mythara")
doc.build(s, onFirstPage=seite, onLaterPages=seite)
