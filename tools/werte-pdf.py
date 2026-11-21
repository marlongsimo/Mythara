"""Baut aus daten.json (tools/werte-pdf-daten.js) das PDF mit den Werten der fünf Helden und der Knochenwächter.
Aufruf: python3 tools/werte-pdf.py daten.json ziel.pdf"""
import json, sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

D = json.load(open(sys.argv[1], encoding="utf-8"))
SCHRIFT = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("S", SCHRIFT + "DejaVuSans.ttf")); pdfmetrics.registerFont(TTFont("SB", SCHRIFT + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("S", normal="S", bold="SB", italic="S", boldItalic="SB")
DUNKEL, GRUEN, GRAU, HELL = colors.HexColor("#1b2330"), colors.HexColor("#2f7d5c"), colors.HexColor("#5b6472"), colors.HexColor("#f3f5f4")
st = lambda name, **k: ParagraphStyle(name, fontName=k.pop("fontName", "S"), **k)
P = {"klein": st("klein", fontSize=7.5, leading=10, textColor=GRUEN, fontName="SB"), "h1": st("h1", fontSize=22, leading=26, textColor=DUNKEL, fontName="SB", spaceAfter=2),
     "unter": st("unter", fontSize=10.5, leading=14, textColor=GRAU, spaceAfter=6), "h2": st("h2", fontSize=13, leading=17, textColor=DUNKEL, fontName="SB", spaceBefore=10, spaceAfter=4),
     "h3": st("h3", fontSize=10.5, leading=14, textColor=GRUEN, fontName="SB", spaceBefore=8, spaceAfter=3), "text": st("text", fontSize=9, leading=12.5, textColor=DUNKEL, spaceAfter=3),
     "zelle": st("zelle", fontSize=8, leading=10.5, textColor=DUNKEL), "zelleF": st("zelleF", fontSize=8, leading=10.5, textColor=DUNKEL, fontName="SB"), "kopf": st("kopf", fontSize=8, leading=10.5, textColor=colors.white, fontName="SB"),
     "note": st("note", fontSize=7.8, leading=10.5, textColor=GRAU, spaceBefore=3)}
esc = lambda t: str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
z = lambda t, f=False: Paragraph(esc(t), P["zelleF" if f else "zelle"])
vz = lambda n: ("+" if n >= 0 else "−") + str(abs(n))


def tabelle(kopf, zeilen, breiten):
    t = Table([[Paragraph(esc(k), P["kopf"]) for k in kopf]] + zeilen, colWidths=breiten, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), DUNKEL), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HELL]), ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#d5dad8")),
                           ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4), ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]))
    return t


TYP = {"aktion": "Aktion", "bonus": "Bonusaktion", "passiv": "passiv", "frei": "frei (kostet nichts)"}
PRO = {"kampf": "je Kampf", "rast": "je Rast", "lange": "je langer Rast"}


def eckdaten(a):
    l = []
    if a["reichweite"]: l.append(f"Reichweite {a['reichweite']} Feld" + ("er" if a["reichweite"] > 1 else "") + (" (Fernkampf)" if a["fern"] else ""))
    if a["schaden"]: l.append("Schaden " + a["schaden"] + (f" + {D['attr'][a['attr']]}" if a["attr"] and not a["rettung"] else "") + (" (Wucht)" if a["wucht"] else ""))
    if a["heilung"]: l.append("Heilung " + a["heilung"] + (" + Stufe" if a["plusStufe"] else "") + (f" + {D['attr'].get(a['plusAttr'], 'Hauptwert')}" if a["plusAttr"] else ""))
    if a["rettung"]: l.append(f"Rettungswurf {D['attr'][a['rettung']]}" + (", bei Erfolg halber Schaden" if a["halb"] else ""))
    if a["form"]: l.append("Fläche: " + ("Kreis" if a["form"] == "kreis" else a["form"]) + (f", Radius {a['groesse']}" if a["groesse"] else ""))
    if a["anzahl"]: l.append(f"{a['anzahl']} Geschosse")
    if a["ziele"]: l.append(f"bis {a['ziele']} Ziele")
    if a["zustand"]: l.append("Zustand: " + a["zustand"] + (f", {a['dauer']} Runde" + ("n" if a["dauer"] != 1 else "") if a["dauer"] else ""))
    if a["brennt"]: l.append(f"brennt {a['brennt']['runden']} Runden nach ({a['brennt']['schaden']})" if isinstance(a["brennt"], dict) else "setzt das Ziel in Brand")
    if a["platz"]: l.append(f"kostet einen Zauberplatz {a['platz']}. Grades")
    if a["pro"]:
        for k, v in a["pro"].items(): l.append((" / ".join(str(x) for x in v) + "× (Stufenbereich 1–2 / 3–6 / 7–10)" if isinstance(v, list) else f"{v}×") + " " + PRO[k])
    if a["gerissen"]: l.append("gerissene Aktion")
    return " · ".join(l)


doc = SimpleDocTemplate(sys.argv[2], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=16 * mm, bottomMargin=16 * mm, title="Mythara – Werte aus dem Würfelspiel", author="Mythara")
B = doc.width; E = []
E += [Paragraph("MYTHARA / BESTANDSAUFNAHME", P["klein"]), Paragraph("Werte aus dem Würfelspiel", P["h1"]),
      Paragraph("Fünf Helden – einer je Klasse – und die Knochenwächter, als Grundlage für die Regeln des Echtzeit-Spiels", P["unter"]),
      Paragraph("Alle Zahlen stammen unverändert aus dem Regelwerk des bisherigen Spiels (js/regeln.js, js/figuren.js), Zehn-Stufen-Modell, wie es in der Arena und in den Kampagnen gilt. Nichts davon ist für Echtzeit umgerechnet.", P["text"]),
      Paragraph("So liest man die Werte", P["h2"]),
      Paragraph("<b>Runden und Felder.</b> Gekämpft wird in Runden auf einem Raster. In seinem Zug hat ein Held eine Aktion, eine Bonusaktion und seine Bewegung in Feldern. Ein Feld entspricht einem Schritt; schräge Nachbarfelder zählen als benachbart.", P["text"]),
      Paragraph("<b>Treffen.</b> Angriff = W20 + Übungsbonus + Bonus des Hauptwerts gegen die Rüstungsklasse (RK) des Ziels. Eine gewürfelte 20 ist ein kritischer Treffer. Vorteil und Nachteil: zwei W20, der bessere bzw. schlechtere zählt.", P["text"]),
      Paragraph("<b>Wertbonus.</b> (Wert − 10) / 2, abgerundet. Stärke 16 gibt also +3. Der Hauptwert eines Helden steigt auf Stufe 4 um 2.", P["text"]),
      Paragraph("<b>Rettungswurf.</b> W20 + Bonus des genannten Werts gegen den Schwierigkeitsgrad (SG) der Fähigkeit. SG eines Helden = 8 + Übungsbonus + Bonus des Hauptwerts.", P["text"]),
      Paragraph("<b>Zauberplätze.</b> Zauberer und Kleriker haben Plätze 1. und 2. Grades; manche Zauber verbrauchen einen. Zaubertricks kosten nichts.", P["text"]),
      Paragraph("<b>Je Kampf / je Rast / je langer Rast.</b> So oft lässt sich eine Fähigkeit einsetzen, bevor sie sich wieder auflädt.", P["text"]),
      Paragraph("Erfahrung bis zur nächsten Stufe", P["h3"]),
      tabelle(["Von Stufe"] + [str(i) for i in range(1, 10)], [[z("Erfahrung", True)] + [z(D["xp"][i]) for i in range(1, 10)]], [26 * mm] + [(B - 26 * mm) / 9] * 9),
      Paragraph("Erfahrung gibt es im Würfelspiel nur für abgeschlossene Kampagnen, nicht für einzelne Monster. Wer unter der empfohlenen Stufe liegt, bekommt mehr, wer darüber liegt, weniger.", P["note"]), PageBreak()]

for H in D["helden"]:
    w = H["werte"]; E += [Paragraph(esc(H["klasse"]).upper(), P["klein"]), Paragraph(esc(f"{H['name']} – {H['titel']}"), P["h1"]), Paragraph(esc(f"Rolle: {H['rolle']} · „{H['spruch']}“"), P["unter"])]
    E.append(tabelle(["Grundwerte", ""], [[z("Attribute (Stufe 1)", True), z(" · ".join(f"{D['attr'][k]} {v} ({vz((v - 10) // 2)})" for k, v in w.items()))],
                                         [z("Hauptwert", True), z(f"{D['attr'][H['haupt']]} – steigt auf Stufe 4 um 2")], [z("Rüstung", True), z(H["ruestung"])],
                                         [z("Bewegung", True), z(f"{H['bewegung']} Felder je Zug")], [z("Rettungswürfe geübt", True), z(" und ".join(D["attr"][x] for x in H["rettung"]))],
                                         [z("Klassenmerkmal", True), z(H["merkmal"])]], [38 * mm, B - 38 * mm]))
    E.append(Paragraph("Werte je Stufe", P["h3"]))
    hat = H["stufen"][0]["plaetze"] is not None; kopf = ["Stufe", "Leben", "RK", "Übung", D["attr"][H["haupt"]]] + (["Plätze 1. / 2. Grad"] if hat else []) + ["Neu auf dieser Stufe"]
    zeilen = []
    for s in H["stufen"]:
        neu = [f"neu: {n}" for n in s["neu"]] + s["werte"] + ([f"besser: {s['verbesserung']}"] if s["verbesserung"] else []) + ([f"Meisterschaft: {s['meister']}"] if s["meister"] else []) + ([f"Titel „{s['titel']}“"] if s["titel"] else [])
        zeilen.append([z(s["stufe"], True), z(s["tp"]), z(s["rk"]), z(vz(s["uebung"])), z(f"{s['haupt']} ({vz(s['mod'])})")] + ([z(f"{s['plaetze'][0]} / {s['plaetze'][1]}")] if hat else []) + [z(" · ".join(neu) if neu else "–")])
    fest = [12 * mm, 13 * mm, 10 * mm, 16 * mm, 24 * mm] + ([26 * mm] if hat else []); E.append(tabelle(kopf, zeilen, fest + [B - sum(fest)]))
    E.append(Paragraph("Angriff auf Stufe 1: W20 " + vz(H["stufen"][0]["uebung"] + H["stufen"][0]["mod"]) + f", auf Stufe 10: W20 {vz(H['stufen'][9]['uebung'] + H['stufen'][9]['mod'])}. Rettungswurf-SG der eigenen Fähigkeiten: {8 + H['stufen'][0]['uebung'] + H['stufen'][0]['mod']} auf Stufe 1, {8 + H['stufen'][9]['uebung'] + H['stufen'][9]['mod']} auf Stufe 10.", P["note"]))
    E.append(Paragraph("Fähigkeiten", P["h3"]))
    E.append(tabelle(["Fähigkeit", "Art", "Ab Stufe", "Beschreibung"], [[z(a["name"], True), z(TYP.get(a["typ"], a["typ"])), z(a["ab"]), Paragraph(esc(a["text"]) + (f"<br/><font color='#5b6472'>{esc(eckdaten(a))}</font>" if eckdaten(a) else ""), P["zelle"])] for a in sorted(H["faehig"], key=lambda a: (a["ab"], a["typ"] == "passiv"))], [34 * mm, 22 * mm, 15 * mm, B - 71 * mm]))
    E.append(Paragraph("Die Beschreibungen zeigen den Grundstand. Was auf höheren Stufen besser wird, steht oben in der Stufentabelle unter „besser“ und „Meisterschaft“.", P["note"]))
    E.append(PageBreak())

S = D["skelett"]
E += [Paragraph("GEGNER", P["klein"]), Paragraph("Knochenwächter (Skelettkrieger)", P["h1"]), Paragraph("Untoter Wächter mit Kurzschwert – der Standardgegner der Grauwacht-Kampagne", P["unter"]),
      tabelle(["Wert", ""], [[z("Lebenspunkte", True), z(f"{S['tp']} (Grundwert; wird je Begegnung und Gruppengröße angepasst, siehe unten)")], [z("Rüstungsklasse", True), z(S["rk"])],
                             [z("Angriff", True), z(f"{S['angriff']['name']}: W20 {vz(S['angriff']['bonus'])} zum Treffen, Schaden {S['angriff']['schaden']} (im Schnitt 5,5), Nahkampf, Reichweite 1 Feld")],
                             [z("Bewegung", True), z(f"{S['bewegung']} Felder je Zug (schneller als jeder Held: Krieger, Zauberer, Kleriker 4; Schurke und Waldläufer 5)")],
                             [z("Attribute", True), z(" · ".join(f"{D['attr'][k]} {v} ({vz((v - 10) // 2)})" for k, v in S["werte"].items()))],
                             [z("Untot", True), z("Ja. Folgen: „Heiliges Licht“ und Vertreiben wirken besonders (Untote werden verängstigt statt geblendet); Silberdolch +1W4 Schaden; mit der Gesegneten Kerze greifen Untote den Träger mit Nachteil an.")],
                             [z("Anfällig", True), z("Wucht: Treffer mit Wuchtschaden (etwa Schildstoß, Streitkolben) machen anderthalbfachen Schaden.")],
                             [z("Besondere Fähigkeiten", True), z("Keine. Er läuft zum nächsten Helden und schlägt zu.")], [z("Erfahrungswert", True), z(f"{S['xp']} (Kennzahl für die Stärke; Erfahrung gibt es im Würfelspiel nur je Kampagne)")]], [38 * mm, B - 38 * mm]),
      Paragraph("Wie viele es sind und wie viel sie aushalten", P["h3"]),
      Paragraph("Anzahl und Leben hängen von der Begegnung und der Gruppengröße ab. Beispiel „Die Gruft“ (nur Knochenwächter, Helden auf Stufe 2):", P["text"]),
      tabelle(["Helden in der Gruppe", "Knochenwächter", "Leben je Knochenwächter"], [[z(g["helden"]), z(g["anzahl"]), z(g["tp"])] for g in S["gruft"]], [B / 3] * 3),
      Paragraph("Stärkere Gegner in höheren Kampagnen („Bedrohung“)", P["h3"]),
      Paragraph("Liegen die Gegner Stufen über ihrem Grundwert, gilt je Stufe: +12 % Gegnermasse (zuerst mehr Gegner, der Rest als Leben). Je 2 Stufen +1 auf Angriff und Schaden, je 3 Stufen +1 auf den Rettungswurf-SG, je 4 Stufen +1 RK.", P["text"]),
      Paragraph("Wo sie vorkommen", P["h3"]),
      tabelle(["Begegnung", "Kampagnenstufe", "Zusammen mit"], [[z(b["name"], True), z(b["stufe"]), z(", ".join(m for m in b["mit"] if m != S["name"]) or "nur Knochenwächter")] for b in S["begegnungen"]], [66 * mm, 34 * mm, B - 100 * mm]),
      Paragraph("Zum Vergleich: der Stand im Echtzeit-Versuch", P["h2"]),
      Paragraph("Diese Zahlen sind frei gesetzte Startwerte der Echtzeit-Engine und nicht aus dem Würfelspiel abgeleitet.", P["text"]),
      tabelle(["", "Würfelspiel", "Echtzeit-Versuch (heute)"], [[z("Leben", True), z(f"{S['tp']}"), z("150")], [z("Schaden je Treffer", True), z(S["angriff"]["schaden"] + " (Ø 5,5), trifft nicht immer"), z("15, trifft immer")],
                                                              [z("Angriffe", True), z("einer je Runde"), z("alle 1,1 Sekunden")], [z("Tempo", True), z(f"{S['bewegung']} Felder je Zug"), z("3,3 Felder je Sekunde (Torvald 4,2)")],
                                                              [z("Torvald Stufe 1 dagegen", True), z("13 Leben, RK 17, 1W8+3 Schaden"), z("320 Leben, 26 Schaden alle 0,8 Sekunden")]], [42 * mm, (B - 42 * mm) / 2, (B - 42 * mm) / 2])]


def fuss(c, d):
    c.saveState(); c.setFont("S", 7.5); c.setFillColor(GRAU); c.drawString(16 * mm, 9 * mm, "MYTHARA  |  Werte aus dem Würfelspiel"); c.drawRightString(A4[0] - 16 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()


doc.build(E, onFirstPage=fuss, onLaterPages=fuss)
print("fertig:", sys.argv[2])
