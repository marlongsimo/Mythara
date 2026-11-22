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
daten=json.load(open('pdfdaten.json'))
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
s=[]
s+= [Paragraph('KAMPFSYSTEM · DESIGNÜBERSICHT', st(fontName='DB', fontSize=8.5, textColor=GOLD)), Paragraph('Kampfregeln v2', T), Paragraph('Mythara · Splitterlande – Tick-System, vier Skills, Angriffsstile, Ausrüstung und Gegner · Stand 22.11.2026', UT)]
s.append(kasten('Diese Übersicht beschreibt das Kampfsystem genau so, wie es im Spiel umgesetzt ist (Quellcode <i>shared/kampfwerte.ts</i>, <i>shared/gegenstaende.ts</i>, <i>shared/config.ts</i>, <i>shared/sim.ts</i>). Grundlage sind die Designnotizen Nahkampf-Balancing v2, Fernkampf-Balancing v4, Magie-Balancing v2 und Rüstung Brust-/Schildslot v1. Alle Zahlentabellen wurden direkt aus dem Spielcode berechnet.'))
s.append(Paragraph('1. Grundlagen', H1))
s.append(tab(['Regel','Wert'],[
 ['Kampf-Tick','1 Tick = 0,5 Sekunden. Jeder Angriff dauert eine ganze Zahl von Ticks und fällt genau auf einen Tick.'],
 ['Bewegung','flüssig (nicht an Ticks gebunden); nur Angriffe laufen im Tick-Takt'],
 ['Ausholen','entfällt – der Angriff wird auf seinem Tick sofort ausgeführt (Geschosse fliegen sichtbar zum Ziel)'],
 ['Kampfarten','Nahkampf, Fernkampf, Magie – jede mit eigener Verteidigung des Ziels'],
 ['Kritische Treffer, Ausweichen, Schadensminderung','keine'],
],[45,125]))
s.append(Paragraph('Trefferwurf', H2))
s.append(formel('Angriffswurf = Zufall(0 … Trefferwert)   gegen   Abwehrwurf = Zufall(0 … Verteidigung)'))
s.append(Paragraph('Getroffen wird nur, wenn der Angriffswurf <b>strikt höher</b> ist; Gleichstand verfehlt. Gewürfelt wird stetig mit Nachkommastellen (ohne Zwischenrundung). Daraus ergibt sich bei Trefferwert A und Verteidigung V:', P))
s.append(formel('Trefferchance = 1 − V ÷ (2·A)  wenn A ≥ V        ·        Trefferchance = A ÷ (2·V)  wenn A < V'))
s.append(Paragraph('Nach einem Treffer wird der Schaden ganzzahlig ausgewürfelt (Formeln je Kampfart unten). Ein verfehlter Angriff erscheint als „geblockt“.', P))
s.append(Paragraph('2. Skills und Fortschritt', H1))
s.append(tab(['Skill','wirkt auf','bekommt XP durch'],[
 ['Geschick','Nahkampf: Trefferwert','Nahkampf im Stil Genau (ganz) oder Normal (Hälfte)'],
 ['Stärke','Nahkampf: Schaden (Max Hit)','Nahkampf im Stil Aggressiv (ganz) oder Normal (Hälfte)'],
 ['Fernkampf','Fernkampf: Trefferwert (nicht der Schaden)','jeden Fernkampftreffer'],
 ['Magie','Magie: Trefferwert und Schaden','jeden Magietreffer'],
],[30,62,78]))
s.append(Spacer(1,4))
s.append(Paragraph('<b>XP:</b> 1 tatsächlich abgezogener Lebenspunkt = 2 XP (kein Überkill, keine Kill-XP, keine Boni). Alle Skills beginnen auf Level 1 (0 XP) und reichen bis Level 100. Kumulierte XP für Level L = ⌊100 · (L<super>2,2</super> − 1)⌋:', P))
x=daten['xp']; s.append(tab(['Level']+[str(a) for a,b in x[:5]], [['XP gesamt']+[f'{b:,}'.replace(',','.') for a,b in x[:5]]],[22]+[29.6]*5))
s.append(Spacer(1,2)); s.append(tab(['Level']+[str(a) for a,b in x[5:]], [['XP gesamt']+[f'{b:,}'.replace(',','.') for a,b in x[5:]]],[22]+[29.6]*5))
s.append(Spacer(1,4))
s.append(tab(['Wert','Formel'],[
 ['Heldenlevel','⌊(Geschick + Stärke + Fernkampf + Magie) ÷ 4⌋'],
 ['Lebenspunkte','60 + 2 · (Heldenlevel − 1)'],
 ['Erholung','im Kampf keine; 5 s nach dem letzten Angriff (eigenem oder fremdem) 4 % der Max-LP je Sekunde'],
],[35,135]))
s.append(Paragraph('3. Nahkampf', H1))
s.append(formel('Trefferwert = (Geschick + Waffen-Geschick) × Geschick-Faktor des Stils'))
s.append(Spacer(1,3)); s.append(formel('Max Hit = ⌊(Waffen-Stärke + Stärke ÷ 3) × Stärke-Faktor des Stils⌋  (mindestens 1)  ·  Schaden = 1 … Max Hit'))
s.append(Spacer(1,4))
s.append(tab(['Stil','Geschick','Stärke','XP an','Spielgefühl'],[['Genau','× 1,05','× 0,95','Geschick','Trefferzuverlässigkeit'],['Normal','× 1,00','× 1,00','je ½ Geschick und Stärke','neutraler Mittelweg'],['Aggressiv','× 0,95','× 1,05','Stärke','mehr Schaden pro Treffer']],[24,22,22,50,52]))
s.append(Spacer(1,4))
s.append(tab(['Waffengruppe','Beispiele','Ticks','Zeit'],[['Einhand-Kurzwaffen','Dolch, Kurzschwert','2','1,0 s'],['Einhand-Langwaffen','Schwert, Streitkolben','3','1,5 s'],['Zweihandwaffen','Zweihandschwert, Speer','4','2,0 s']],[45,70,25,30]))
s.append(Paragraph('Alle Nahkampfwaffen – auch die der Gegner – haben dieselbe Reichweite: <b>1,5 Felder</b> (vom Rand des Ziels). Ohne Waffe kämpft der Held mit den Fäusten: Geschick- und Stärke-Bonus 0, 2 Ticks.', P))
s.append(Paragraph('4. Fernkampf', H1))
s.append(formel('Trefferwert = Fernkampf + Fernkampfstärke der Waffe ÷ 3   ·   Schaden = 1 … Fernkampfstärke der Waffe'))
s.append(Paragraph('Der Fernkampf-Skill verbessert nur die Trefferchance, nicht den Schaden. Die Stile ändern nur Takt und Reichweite:', P))
s.append(tab(['Stil','Takt','Reichweite','Trefferwert / Schaden'],[['Akkurat','Waffe − 1 Tick','− 10 %','unverändert'],['Normal','Grundtakt der Waffe','Grundreichweite','unverändert'],['Fern','Waffe + 1 Tick','+ 10 %','unverändert']],[28,45,40,57]))
s.append(Paragraph('5. Magie', H1))
s.append(formel('Trefferwert = Magie + Magische Genauigkeit der Waffe'))
s.append(Spacer(1,3)); s.append(formel('Schaden = (Waffen-Schadenswurf + Magie ÷ 3) × (1 + Stil-Bonus)  –  gerundet, mindestens 1'))
s.append(Spacer(1,4))
s.append(tab(['Stil','Takt','Schadensbonus','Reichweite'],[['Schnell','Waffe − 1 Tick (Stab: 4 = 2,0 s)','0 %','6'],['Normal','Grundtakt (Stab: 5 = 2,5 s)','+ 2 %','6'],['Fokus','Waffe + 1 Tick (Stab: 6 = 3,0 s)','+ 4 %','6']],[25,75,35,35]))
s.append(Paragraph('Alle Magiewaffen haben dieselbe Reichweite 6. Die Stile ändern weder Trefferwert noch Trefferchance.', P))
s.append(Paragraph('6. Verteidigung und Rüstung', H1))
s.append(formel('Verteidigung je Angriffsart = 1 + 0,5 · (Heldenlevel − 1) + Brust + Schild'))
s.append(Paragraph('Die Werte werden je Angriffsart addiert, aus allen Richtungen; keine prozentualen Effekte oder Blockchancen. Aus dem Dokument „Brust- und Schildslot v1“ (Vorschlag, noch nicht als Beute im Spiel – im Spiel gibt es derzeit nur den Einfachen Schild):', P))
s.append(tab(['Gegenstand','Nahkampf','Fernkampf','Magie'],[['Stoffrobe','+2','+2','+5'],['Lederrüstung','+4','+5','+2'],['Kettenrüstung','+6','+4','+2'],['Plattenrüstung','+8','+4','+1'],['Leichter Schild','+3','+2','+1'],['Standardschild','+5','+3','+1'],['Turmschild','+7','+4','+2']],[60,36.6,36.6,36.6]))
s.append(Paragraph('7. Startausrüstung (Level 1)', H1))
s.append(Paragraph('Bewusst schwach, aber klar unterschiedlich: Waffen-Upgrades sollen sich deutlich bemerkbar machen, die Heldenwerte zählen von Anfang an. Mit der Startwaffe im Heldeneditor: Schwert + Schild, Kurzbogen oder Stab.', P))
s.append(tab(['Gegenstand','Werte','Takt','Reichweite','Besonderheit'],[
 ['Einfaches Schwert','+5 Geschick / +5 Stärke','3 Ticks (1,5 s)','Nahkampf 1,5','solider Allrounder'],
 ['Einfacher Schild','+3 Nahkampf / +3 Fernkampf / +2 Magie','–','–','defensive Ergänzung'],
 ['Einfacher Kurzbogen','Fernkampfstärke 10 (Schaden 1–10)','4 Ticks (2,0 s)','6 Felder','erste Bogen-Verbesserung spürbar'],
 ['Einfacher Stab','+5 Magische Genauigkeit, Schaden 1–5','5 Ticks (2,5 s)','6 Felder','+2 % Schaden im Stil Normal'],
],[32,48,26,24,40]))
s.append(Paragraph('Kampfwerte eines Helden auf Level 1 (alle Skills 1)', H2))
z=[[r['w'].capitalize(), r['stil'], str(r['treffer']).replace('.',','), r['schaden'], f"{r['ticks']} ({str(r['ticks']*0.5).replace('.',',')} s)", 'Nahkampf' if r['w']=='schwert' else str(r['reich']).replace('.',','), r['abw'], str(r['chance']).replace('.',',')+' %'] for r in daten['l1']]
s.append(tab(['Waffe','Stil','Treffer','Schaden','Ticks','Reichweite','Abwehr N/F/M','Trifft Bandit'],z,[17,20,16,20,22,22,26,27]))
s.append(Paragraph('„Trifft Bandit“: Trefferchance gegen die Bandit-Abwehr (Nahkampf/Fernkampf 6, Magie 4).', K))
s.append(Paragraph('8. Gegner', H1))
s.append(Paragraph('Gegner haben feste, absolute Werte ohne Ausrüstung: Geschick (Trefferwert), Stärke (Schaden 1 … Stärke), einen festen Takt in Ticks, Abwehr je Angriffsart und dieselbe Nahkampfreichweite wie die Helden. Gewürfelt wird genau wie bei den Helden.', P))
s.append(tab(['Gegner','Lvl','LP','Geschick','Stärke','Takt','Reichweite','Abwehr N/F/M'],[['Bandit (Dolch)','1','40','6','4 (Schaden 1–4)','4 Ticks (2,0 s)','Nahkampf 1,5','6 / 6 / 4']],[24,11,11,19,27,26,24,28]))
s.append(Paragraph('9. Balancing-Ergebnis: Held Level 1 gegen Bandit', H1))
s.append(Paragraph('120 simulierte Duelle je Waffe und Stil mit der echten Spielsimulation (Fernkampf und Magie beginnen 5 Felder entfernt):', P))
erg=[['Schwert','Genau','98 %','38 s','44 %','53 %','68 %'],['Schwert','Normal','98 %','39 s','45 %','50 %','68 %'],['Schwert','Aggressiv','98 %','42 s','40 %','47 %','68 %'],['Bogen','Akkurat','90 %','31 s','41 %','35 %','92 %'],['Bogen','Normal','84 %','36 s','33 %','37 %','91 %'],['Bogen','Fern','62 %','38 s','30 %','38 %','93 %'],['Stab','Schnell','88 %','39 s','27 %','66 %','92 %'],['Stab','Normal','64 %','44 s','21 %','67 %','91 %'],['Stab','Fokus','50 %','44 s','23 %','66 %','92 %']]
s.append(tab(['Waffe','Stil','Siege','Dauer','LP übrig','Held trifft','Bandit trifft'],erg,[24,26,22,22,26,25,25]))
s.append(Spacer(1,4))
s.append(kasten('<b>Lesart:</b> Das Schwert gewinnt fast immer, weil der Schild die Abwehr auf 4 hebt. Bogen und Stab haben auf Level 1 nur Abwehr 1 – der Bandit trifft sie in gut 90 % der Fälle; sie gewinnen vor allem mit dem schnellsten Stil (Akkurat bzw. Schnell). Naheliegender Hebel, falls das zu hart ist: eine Startrüstung (z. B. Stoffrobe oder Lederrüstung) für Fernkampf und Magie.'))
s.append(Paragraph('10. Speicherung und Sicherheit', H1))
s.append(tab(['Punkt','Umsetzung'],[
 ['Wer zählt die XP?','allein der Spielserver in seiner Kampfsimulation; der Browser meldet nur angelegte Ausrüstung und gewählten Stil (beides wird vom Server geprüft – nur eigene Gegenstände)'],
 ['Speichern','alle 10 s und beim Verlassen über rpg_held_skill_gutschrift (nur service_role) in rpg_held: skill_geschick, skill_staerke, skill_fernkampf, skill_magie (Migration 042); je Aufruf höchstens 5000 XP je Skill, höchstens Level 100'],
 ['Alte Werte','die v1-XP (xp_staerke, xp_geschick, xp_magie) bleiben unverändert in der Datenbank; alle Helden beginnen mit v2 neu bei 0'],
 ['Gäste','ohne Konto rechnet der Browser selbst; die XP liegen nur auf dem Gerät'],
 ['Angriffsstil','im Browser je Kampfart gemerkt, dem Server gemeldet; gilt für alle Waffen dieser Kampfart'],
],[32,138]))
s.append(Paragraph('11. Festlegungen zu offenen Punkten der Dokumente', H1))
s.append(tab(['Offener Punkt','Festlegung im Spiel'],[
 ['Gemeinsame Nahkampfreichweite','1,5 Felder (Helden und Gegner)'],
 ['Ganzzahlige oder stetige Trefferwürfe','stetig mit Nachkommastellen, wie in der Rechenannahme der Dokumente'],
 ['Max Hit','abgerundet, mindestens 1'],
 ['Schadensspanne Kurzbogen','1 bis Fernkampfstärke der Waffe (Startbogen: 1–10)'],
 ['Rundung Magieschaden','kaufmännisch gerundet, mindestens 1'],
 ['Treffervergleich','Angriff muss strikt höher sein als die Verteidigung'],
 ['Grund-Verteidigung des Helden','1 + 0,5 · (Heldenlevel − 1), dazu Brust und Schild'],
 ['Weitere Waffen, Rüstungen, Gegner','noch nicht festgelegt – die Regeln sind dafür vorbereitet (feste Werte je Gegenstand und Gegner)'],
],[60,110]))
def zusammen(l):
    aus=[]; i=0
    while i < len(l):
        e=l[i]
        if isinstance(e, Paragraph) and e.style.fontName=='DB' and e.style.fontSize>=11 and i+1 < len(l): aus.append(KeepTogether([e, l[i+1]])); i+=2
        else: aus.append(e); i+=1
    return aus
s=zusammen(s)
def fuss(c, d):
    c.saveState(); c.setFont('D',7.5); c.setFillColor(GRAU); c.drawString(20*mm, 12*mm, 'MYTHARA / SPLITTERLANDE  •  KAMPFREGELN V2'); c.drawRightString(190*mm, 12*mm, str(d.page)); c.setStrokeColor(GOLD); c.setLineWidth(0.5); c.line(20*mm, 15*mm, 190*mm, 15*mm); c.restoreState()
doc=SimpleDocTemplate('Mythara-Kampfsystem-v2.pdf', pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=22*mm, title='Mythara – Kampfregeln v2', author='Mythara')
doc.build(s, onFirstPage=fuss, onLaterPages=fuss)
print('ok')
