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
