import json
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
F='/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('D', F+'DejaVuSans.ttf')); pdfmetrics.registerFont(TTFont('DB', F+'DejaVuSans-Bold.ttf')); pdfmetrics.registerFont(TTFont('DI', F+'DejaVuSans-Oblique.ttf'))
from reportlab.lib.fonts import addMapping
addMapping('D',0,0,'D'); addMapping('D',1,0,'DB'); addMapping('D',0,1,'DI'); addMapping('D',1,1,'DB')
DUNKEL=colors.HexColor('#2b2116'); GOLD=colors.HexColor('#b08a3c'); HELL=colors.HexColor('#f6efe0'); GRAU=colors.HexColor('#6b6255')
def st(**k):
    b=dict(fontName='D', fontSize=9.5, leading=13.5, textColor=colors.HexColor('#1e1a14')); b.update(k); return ParagraphStyle('x', **b)
T=st(fontName='DB', fontSize=24, leading=28, textColor=DUNKEL, spaceAfter=2)
UT=st(fontSize=11, textColor=GRAU, spaceAfter=10)
H1=st(fontName='DB', fontSize=14.5, leading=18, textColor=DUNKEL, spaceBefore=12, spaceAfter=5)
H2=st(fontName='DB', fontSize=11, leading=14, textColor=colors.HexColor('#5a4020'), spaceBefore=7, spaceAfter=3)
P=st(); K=st(fontSize=8.3, leading=11, textColor=GRAU)
FORM=st(fontName='DB', fontSize=9.5, alignment=1)
def kasten(txt, farbe='#f3e7cf', rand='#c9a560'):
    t=Table([[Paragraph(txt, P)]], colWidths=[170*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor(farbe)),('BOX',(0,0),(-1,-1),0.8,colors.HexColor(rand)),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)])); return t
def formel(txt):
    t=Table([[Paragraph(txt, FORM)]], colWidths=[170*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#efe6d4')),('BOX',(0,0),(-1,-1),0.6,GOLD),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)])); return t
def tab(kopf, zeilen, breiten):
    c=st(fontSize=8.6, leading=11); ck=st(fontName='DB', fontSize=7.6, leading=10, textColor=colors.white)
    d=[[Paragraph(x, ck) for x in kopf]]+[[Paragraph(str(x), c) for x in z] for z in zeilen]
    t=Table(d, colWidths=[b*mm for b in breiten], repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),DUNKEL),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white, HELL]),('LINEBELOW',(0,-1),(-1,-1),0.6,GOLD),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)])); return t
def zusammen(l):
    aus=[]; i=0
    while i < len(l):
        e=l[i]
        if isinstance(e, Paragraph) and e.style.fontName=='DB' and e.style.fontSize>=11 and i+1 < len(l): aus.append(KeepTogether([e, l[i+1]])); i+=2
        else: aus.append(e); i+=1
    return aus
def fusszeile(titel):
    def f(c, d):
        c.saveState(); c.setFont('D',7.5); c.setFillColor(GRAU); c.drawString(20*mm, 12*mm, 'MYTHARA / SPLITTERLANDE  •  '+titel); c.drawRightString(190*mm, 12*mm, str(d.page)); c.setStrokeColor(GOLD); c.setLineWidth(0.5); c.line(20*mm, 15*mm, 190*mm, 15*mm); c.restoreState()
    return f
CODE=st(fontName='D', fontSize=7.8, leading=10.2)
def code(txt):
    t=Table([[Paragraph(txt.replace(' ','&nbsp;').replace('\n','<br/>'), CODE)]], colWidths=[170*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#f4f1ea')),('BOX',(0,0),(-1,-1),0.5,colors.HexColor('#cfc6b4')),('LEFTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)])); return t
def bauen(datei, titel, story):
    doc=SimpleDocTemplate(datei, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=22*mm, title='Mythara – '+titel, author='Mythara')
    f=fusszeile(titel.upper()); doc.build(zusammen(story), onFirstPage=f, onLaterPages=f)
