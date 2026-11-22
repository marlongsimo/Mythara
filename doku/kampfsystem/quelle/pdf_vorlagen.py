import sys; sys.path.insert(0, '.')
from pdfstil import *
PF='<b>Pflicht</b>'; OP='optional'; NE='<i>noch nicht im Spiel</i>'
# ───────────────────────── Ausrüstung ─────────────────────────
s=[Paragraph('DATENVORLAGE · AUSRÜSTUNG', st(fontName='DB', fontSize=8.5, textColor=GOLD)), Paragraph('Ausrüstungsstücke', T),
   Paragraph('Welche Daten ein Gegenstand braucht, damit er ins Spiel kommt · Kampfregeln v2 · Stand 22.11.2026', UT)]
s.append(kasten('Ein Gegenstand ist ein Eintrag in <i>realtime/shared/gegenstaende.ts</i> (GEGENSTAENDE). Spielserver, Simulation und Anzeige lesen dieselben Daten. Pflichtfelder müssen gesetzt sein, sonst fehlt der Gegenstand oder er hat keine Wirkung. Felder mit „noch nicht im Spiel“ sind Vorschläge für Dinge, die das Spiel heute noch nicht auswertet – sinnvoll, sie schon jetzt mit festzulegen.'))
s.append(Paragraph('1. Grunddaten (alle Gegenstände)', H1))
s.append(tab(['Feld','Status','Bedeutung','Beispiel'],[
 ['id',PF,'eindeutiger Schlüssel: klein, ohne Leerzeichen und Umlaute; wird in Inventar und Datenbank gespeichert – nie mehr ändern','ritterschwert'],
 ['name',PF,'Anzeigename im Spiel','Einfaches Schwert'],
 ['platz',PF,'Ausrüstungsplatz: waffe · brust · nebenhand (Schild)','waffe'],
 ['art',PF,'Gegenstandsart zur Anzeige','Einhandschwert, Kurzbogen, Schild'],
 ['seltenheit',PF,'gewoehnlich · selten (weitere Stufen möglich, z. B. episch)','gewoehnlich'],
 ['text',PF,'kurze Beschreibung im Untersuchen-Fenster','Eine schlichte, gut ausgewogene Klinge …'],
 ['ebenen',PF+' für Sichtbarkeit','Teilnamen aus der Figuren-Fabrik: so erscheint der Gegenstand am Helden (2D-Atlas und 3D-Modell, gleicher Name) und als Bild im Inventar','waffe.schwert.ritter'],
],[22,24,86,38]))
s.append(Paragraph('2. Waffen (platz = waffe)', H1))
s.append(Paragraph('Jede Waffe hat genau eine Kampfart. Der Angriffsstil (Genau/Normal/Aggressiv, Akkurat/Normal/Fern, Schnell/Normal/Fokus) wird nicht pro Waffe festgelegt – er gilt global für die Kampfart.', P))
s.append(tab(['Feld','Status','Bedeutung','Beispiel'],[
 ['waffe.art',PF,'nah · fern · magie','nah'],
 ['waffe.ticks',PF,'Angriffstakt im Stil Normal, ganze Ticks (1 Tick = 0,5 s). Nahkampf: Kurzwaffen 2, Langwaffen 3, Zweihänder 4','3'],
 ['waffe.reich',PF,'Reichweite in Feldern. Nahkampf immer 1,5 (gemeinsamer Wert); Fernkampf z. B. 6; Magie immer 6','1,5'],
 ['waffe.flug','Pflicht bei fern/magie','Fluggeschwindigkeit des Geschosses (Felder je Sekunde) – nur Darstellung','18'],
],[24,30,82,34]))
s.append(Paragraph('Werte je Kampfart', H2))
s.append(tab(['Kampfart','Pflichtfelder','Wirkung im Kampf','Startwaffe'],[
 ['Nahkampf','waffe.geschick, waffe.staerke','Treffer = (Geschick + Waffen-Geschick) × Stil · Max Hit = ⌊(Waffen-Stärke + Stärke ÷ 3) × Stil⌋','+5 / +5'],
 ['Fernkampf','waffe.fernStaerke','Treffer = Fernkampf + Fernkampfstärke ÷ 3 · Schaden 1 … Fernkampfstärke','10'],
 ['Magie','waffe.genau, waffe.schaden [min, max]','Treffer = Magie + Genauigkeit · Schaden = (Wurf + Magie ÷ 3) × (1 + Stil-Bonus)','+5, 1–5'],
],[22,40,80,28]))
s.append(Paragraph('3. Rüstung und Schilde (platz = brust oder nebenhand)', H1))
s.append(tab(['Feld','Status','Bedeutung','Beispiel'],[
 ['abwehr.nah',PF,'Bonus auf die Nahkampfverteidigung','+3'],
 ['abwehr.fern',PF,'Bonus auf die Fernkampfverteidigung','+3'],
 ['abwehr.magie',PF,'Bonus auf die Magieabwehr','+2'],
],[24,20,90,36]))
s.append(Paragraph('Die Boni werden je Angriffsart zur Grundverteidigung 1 + 0,5 · (Heldenlevel − 1) addiert, aus allen Richtungen. Brust und Nebenhand zählen beide.', P))
s.append(Paragraph('4. Noch festzulegen (Vorschläge, heute ohne Wirkung)', H1))
s.append(tab(['Feld','Status','Wofür','Beispiel'],[
 ['anforderung',NE,'Mindest-Skill zum Anlegen','Stärke 10'],
 ['zweihand',NE,'Waffe belegt auch die Nebenhand (kein Schild)','ja / nein'],
 ['wert',NE,'Preis beim Händler / Verkaufswert','25 Gold'],
 ['stapelbar',NE,'mehrere in einem Rucksackfach (z. B. Pfeile, Tränke)','nein'],
 ['herkunft',NE,'wie man ihn bekommt: Drop (welcher Gegner), Händler, Quest','Drop: Bandit 3 %'],
 ['gebunden',NE,'nicht handelbar, sobald angelegt','nein'],
],[24,30,80,36]))
s.append(Paragraph('5. Darstellung', H1))
s.append(tab(['Was','Wer liefert','Hinweis'],[
 ['2D-Ebene im Figuren-Atlas','Figuren-Fabrik','Name = Eintrag in ebenen; für Inventarbild und 2D-Figur'],
 ['Teil im 3D-Modell (GLB)','Figuren-Fabrik','gleicher Teilname im Basismann/Basisfrau-Modell (three.js entfernt . : / [ ] aus Knotennamen); sichtbar, wenn angelegt'],
 ['Angriffsbewegung','Figuren-Fabrik','Nahkampf stich/hieb, Fernkampf bogen, Magie zauber_stab – je Kampfart vorhanden'],
],[42,32,96]))
s.append(Paragraph('6. Vorlage zum Ausfüllen', H1))
s.append(code('''eisenschwert: {
  id: "eisenschwert", name: "Eisenschwert", platz: "waffe", art: "Einhandschwert", seltenheit: "gewoehnlich",
  ebenen: ["waffe.schwert.eisen"],                                  // Teil aus der Figuren-Fabrik
  waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 9, staerke: 8 },
  text: "Geschmiedet in der Waldmark. Spürbar schärfer als die Übungsklinge."
},
lederruestung: {
  id: "lederruestung", name: "Lederrüstung", platz: "brust", art: "Rüstung", seltenheit: "gewoehnlich",
  ebenen: ["ruestung.leder"], abwehr: { nah: 4, fern: 5, magie: 2 },
  text: "Gehärtetes Leder. Leicht und gut gegen Pfeile."
}'''))
s.append(Spacer(1,6))
s.append(kasten('<b>Wichtig für neue Gegenstände:</b> Der Server erlaubt heute nur Gegenstände, die der Held besitzt – und das ist bisher nur seine Startausrüstung. Damit ein neuer Gegenstand angelegt werden kann, braucht es noch den Besitz auf dem Server (Beute bzw. Inventar in der Datenbank). Das ist der nächste Baustein, sobald Drops oder Händler kommen.', '#fbeee8', '#c97a5a'))
bauen('Mythara-Vorlage-Ausruestung.pdf', 'Datenvorlage Ausrüstung', s)

# ───────────────────────── Gegner ─────────────────────────
s=[Paragraph('DATENVORLAGE · GEGNER', st(fontName='DB', fontSize=8.5, textColor=GOLD)), Paragraph('Gegner', T),
   Paragraph('Welche Daten ein Gegner braucht – Werte, Verhalten, Belohnung und Darstellung · Kampfregeln v2 · Stand 22.11.2026', UT)]
s.append(kasten('Ein Gegner ist ein Eintrag in <i>realtime/shared/config.ts</i> (MONSTER); wo er steht, legt <i>realtime/werkzeug/weltzonen.py</i> fest (Lager je Region). Gegner haben feste, absolute Werte ohne Ausrüstung und würfeln genau wie die Helden. Felder mit „noch nicht im Spiel“ sind Vorschläge, die das Spiel heute noch nicht auswertet.'))
s.append(Paragraph('1. Grunddaten', H1))
s.append(tab(['Feld','Status','Bedeutung','Bandit'],[
 ['id (Schlüssel)',PF,'eindeutig, klein, ohne Leerzeichen','bandit_dolch'],
 ['name',PF,'Anzeigename über dem Kopf','Bandit'],
 ['stufe',PF,'Level (Anzeige „Lv 1“; die Werte stehen fest am Gegner)','1'],
 ['lp',PF,'Lebenspunkte','40'],
 ['tempo',PF,'Laufgeschwindigkeit in Feldern je Sekunde (Held: etwa 3)','2,9'],
 ['r',PF,'Körperradius in Feldern (Kollision, Reichweite gemessen vom Rand)','0,3'],
 ['hoehe',OP,'Größe der Figur (96 = Heldengröße)','84'],
],[26,22,88,34]))
s.append(Paragraph('2. Kampfwerte (v2)', H1))
s.append(tab(['Feld','Status','Bedeutung','Bandit'],[
 ['v2.geschick',PF,'Trefferwert seines Angriffs','6'],
 ['v2.staerke',PF,'Schaden je Treffer: 1 … Stärke','4 (1–4)'],
 ['v2.ticks',PF,'Angriffstakt in Ticks (1 Tick = 0,5 s)','4 (2,0 s)'],
 ['v2.abwehr.nah / .fern / .magie',PF,'Verteidigung je Angriffsart','6 / 6 / 4'],
 ['angriff.name',PF,'Name des Angriffs (Anzeige)','Dolch'],
 ['angriff.art',PF,'nah · fern · magie – gegen welche Verteidigung des Helden gewürfelt wird','nah'],
 ['angriff.reich',PF,'Reichweite: Nahkampf immer 1,5 (wie die Helden); Fern/Magie in Feldern','1,5'],
 ['angriff.schaden / takt / aushol','automatisch','müssen zu v2 passen: schaden [1, Stärke], takt = Ticks × 0,5, aushol 0','[1,4] · 2,0 · 0'],
],[40,20,78,32]))
s.append(Paragraph('3. Verhalten und Aggro', H1))
s.append(tab(['Feld','Status','Bedeutung','Standard / Bandit'],[
 ['aggressiv',OP+' (neu)','greift von selbst an (ja) oder nur, wenn er angegriffen wird (nein)','ja'],
 ['aggroReich',OP+' (neu)','ab welcher Entfernung er von selbst angreift (Felder)','Gebiet, sonst 5 · Lichtung 4'],
 ['leine','je Gebiet','wie weit er sich von seinem Lager entfernt, bevor er umkehrt (Felder)','14 · Unterschlupf 10'],
 ['wandern','je Gebiet','Umkreis, in dem er um sein Lager streift (Felder)','4 · Unterschlupf 2'],
 ['gruppe','je Lager','Gegner einer Gruppe helfen sich, wenn einer angegriffen wird','jedes Lager eigene'],
 ['Wiederkehr','global','Sekunden bis ein besiegter Gegner wieder am Lager steht (heute für alle gleich)','60 s'],
 ['wiederkehr (je Gegner)',NE,'eigene Wiederkehrzeit je Gegnerart (Bosse länger)','z. B. 300 s'],
],[30,26,80,34]))
s.append(Paragraph('<b>Aggro-Dauer (global, unsichtbar):</b> Ein Gegner greift einen Helden höchstens 15 Minuten lang von selbst an. Danach nur noch, wenn er selbst angegriffen wird. Der Zähler beginnt neu, sobald der Held sich mindestens 20 Felder von der Stelle entfernt, an der der Zähler begann, oder die Region verlässt und wieder betritt.', P))
s.append(Paragraph('<b>Einzel- oder Mehrkampf</b> wird je Region bzw. Bereich festgelegt (weltzonen.py), nicht je Gegner. Einzelkampf: ein Held gegen einen Gegner, niemand mischt sich ein.', P))
s.append(Paragraph('4. Platzierung', H1))
s.append(tab(['Feld','Status','Bedeutung','Bandit'],[
 ['Region',PF,'in welcher Region (jede Region außer sicheren Orten ist Kampfgebiet)','waldweg (Kreuzwald)'],
 ['Lager: art, x, y',PF,'Gegnerart und Stelle in Weltfeldern; das Feld muss begehbar sein','bandit_dolch, 6544, 6578'],
 ['Mehrkampf-Bereich',OP,'Rechteck [x0, y0, x1, y1] in Weltfeldern, in dem viele gegen viele kämpfen','keiner (Einzelkampf)'],
],[34,20,80,36]))
s.append(Paragraph('5. Belohnung und Drop-Tabelle', H1))
s.append(tab(['Feld','Status','Bedeutung'],[
 ['Skill-XP','automatisch','2 XP je tatsächlich abgezogenem Lebenspunkt – kein eigenes Feld nötig'],
 ['Seelensplitter','je Gebiet/Stufe','heute aus der Gebietsstufe berechnet, bleiben am Boden liegen'],
 ['drops',NE,'Liste der möglichen Beute (Format unten)'],
 ['garantiert',NE,'Beute, die immer fällt (z. B. Knochen, Münzen)'],
 ['sichtbar',NE,'wer die Beute zuerst sieht/aufheben darf (nur der Bezwinger, nach x s alle)'],
],[30,30,110]))
s.append(Spacer(1,4)); s.append(Paragraph('Vorgeschlagenes Format der Drop-Tabelle', H2))
s.append(tab(['gegenstand (id)','chance','anzahl','Hinweis'],[['muenzen','100 %','3–8','garantiert'],['brot','25 %','1',''],['eisenschwert','2 %','1','selten'],['lederruestung','1 %','1','selten'],['(nichts)','Rest','–','ergibt sich aus den Chancen']],[40,26,26,78]))
s.append(Paragraph('Jeder Eintrag würfelt einzeln (unabhängig), oder es wird genau ein Eintrag aus der Tabelle gezogen – das ist noch festzulegen.', K))
s.append(Paragraph('6. Darstellung', H1))
s.append(tab(['Was','Status','Hinweis'],[
 ['3D-Modell (GLB)',PF,'in img/figuren-echt3d/, mit Bewegungen ruhe, gehen, laufen, Angriff (z. B. stich), tod; optional block. Zuordnung Gegnerart → Datei und Angriffsbewegung'],
 ['2D-Bild',OP,'nur noch Ersatz, falls das 3D-Modell nicht lädt (2D-Figuren sind aus der Welt entfernt)'],
],[34,20,116]))
s.append(Paragraph('7. Sonderfähigkeiten (vorhanden, optional)', H1))
s.append(tab(['Feld','Wirkung'],[
 ['spezial','Flächenangriff: lädt (laden s), Fläche am Boden sichtbar, trifft alle darin (radius, reich, schaden, art, alle s)'],
 ['aufstehen','steht einmal wieder auf, mit diesem Anteil seines Lebens (z. B. 0,5)'],
 ['brut','bringt Junge hervor (art, takt, max zugleich, gesamt)'],
 ['fest','bewegt sich nicht und greift nicht an (z. B. Krötenlaich)'],
 ['boss','Boss: mehr Beute'],
],[30,140]))
s.append(Paragraph('8. Vollständiges Beispiel: Bandit', H1))
s.append(code('''bandit_dolch: {
  name: "Bandit", stufe: 1, lp: 40, tempo: 2.9, r: 0.3, hoehe: 84,
  v2: { geschick: 6, staerke: 4, ticks: 4, abwehr: { nah: 6, fern: 6, magie: 4 } },
  angriff: { name: "Dolch", art: "nah", schaden: [1, 4], takt: 2.0, reich: 1.5, aushol: 0 },
  aggressiv: true,                 // optional, Standard ja
  // aggroReich: 4,                // optional, sonst Wert des Gebiets
  // drops: [ { gegenstand: "muenzen", chance: 100, anzahl: [3, 8] } ]   // noch nicht im Spiel
}
// 3D: bandit_dolch → img/figuren-echt3d/bandit3d.glb, Angriff "stich"
// Lager (weltzonen.py, Region waldweg): ("bandit_dolch", 6544, 6578)'''))
bauen('Mythara-Vorlage-Gegner.pdf', 'Datenvorlage Gegner', s)
print('ok')
