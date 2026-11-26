"""Mythara – Konzept Holz und Bergbau (Sammel-Skills) als PDF. Zahlen aus rechnen.py (zahlen.json).
Aufruf: python3 pdf_sammeln.py ausgabe.pdf"""
import json, sys
exec(open("kopf.py").read().split("STAND =")[0])
STAND = "Konzept · Stand 24.11.2026"
def seite(c, d):
    c.saveState(); c.setStrokeColor(LINIE); c.setLineWidth(0.6); c.line(16 * mm, 13 * mm, 194 * mm, 13 * mm)
    c.setFont("S", 7.5); c.setFillColor(GOLD); c.drawString(16 * mm, 9 * mm, f"Mythara – Splitterlande · Holz und Bergbau · {STAND}")
    c.drawRightString(194 * mm, 9 * mm, f"Seite {d.page}"); c.restoreState()
Z0 = json.load(open("zahlen.json"))
de = lambda v: f"{v:,}".replace(",", ".")
STUFEN = ["Training", "Einfach", "Selten", "Episch", "Legendär", "Mythisch"]

s = []
s += [Paragraph("Holz und Bergbau", T), Paragraph(f"Die beiden Sammel-Skills von Mythara: Ablauf, Stufen, Fundorte, Balancing und was wir dafür bauen müssen · {STAND}", U)]
s.append(p("Mythara bekommt <b>vier Nicht-Kampf-Skills</b>, die sich gegenseitig versorgen: <b>Holz</b> und <b>Bergbau</b> gewinnen Rohstoffe, <b>Handwerk</b> verarbeitet sie "
           "(Waffen, Rüstung, Schilde, Werkzeuge – auch Stoff und Leder) und <b>Alchemie</b> braut Tränke. Dieses Heft legt <b>Holz und Bergbau</b> fest. "
           "Handwerk und Alchemie folgen in eigenen Heften; wo sie hier hineinspielen (Schmelzen, Brennstoff, Kristalle), ist es schon vermerkt."))
s.append(kasten("<b>Kreislauf:</b> Holz + Erz → (Handwerk: Schmelzen an der Esse, Holz als Brennstoff) → Barren → (Handwerk) → Waffen, Rüstung, Werkzeuge → "
                "bessere Werkzeuge sammeln schneller, bessere Ausrüstung schafft stärkere Gegner → bessere Fundorte."))
s.append(Paragraph("Grundsätze", H2))
s += li(["<b>Jeder Stufe des Kampfsystems eine Rohstoffstufe:</b> Training (1), Einfach (10), Selten (20), Episch (35), Legendär (45), Mythisch (65) – gleiche Level-Grenzen in Holz, Bergbau und Handwerk. "
         "So füllt das Sammeln genau die Lücken „noch keine Quelle“ aus dem Spielüberblick.",
         "<b>Server entscheidet alles:</b> Abstand, Level, Werkzeug, ob der Baum noch steht, Erfolg, XP und was in den Rucksack kommt. Der Browser zeigt nur an.",
         "<b>Gemeinsame Welt:</b> Ein gefällter Baum ist für alle ein Stumpf, eine abgebaute Ader für alle erschöpft – bis sie nachwächst.",
         "<b>Nicht nur warten:</b> Wer zuschaut und im richtigen Moment tippt (Kernschlag beim Holz, Riss beim Bergbau), sammelt rund ein Fünftel mehr. Wer nur wartet, kommt trotzdem voran.",
         "<b>Die neuen Skills zählen nicht ins Heldenlevel</b> – das bleibt die Kampfstufe. Gleiche XP-Kurve wie die Kampf-Skills (85 % OSRS, Level 1 bis 100)."])
s.append(PageBreak())

# ---------- Ablauf ----------
s.append(Paragraph("1 · So funktioniert Sammeln", H1))
s.append(Paragraph("Ablauf", H2))
s += li(["Baum oder Erzader antippen → <b>„Fällen“</b> bzw. <b>„Abbauen“</b>. Der Held läuft hin und beginnt; die passende Axt bzw. Spitzhacke muss im Rucksack sein oder in der Hand.",
         "Alle <b>4 Ticks (2 Sekunden)</b> ein Versuch. Gelingt er, kommt ein Stück in den Rucksack und es gibt XP.",
         "Der Held sammelt <b>von selbst weiter</b>, bis der Rucksack voll ist, der Baum fällt oder die Ader erschöpft ist, oder bis man wegläuft oder angegriffen wird.",
         "Jeder Baum und jede Ader hat einen <b>Vorrat</b> (zufällig in einer Spanne). Ist er leer: Baumstumpf bzw. graue, leere Ader, die nach einer festen Zeit <b>für alle nachwächst</b>."])
s.append(Paragraph("Erfolgschance", H2))
s.append(kasten("<b>Chance je Versuch</b> = (lo + 8 · W) · (99 − L) / 98 + (hi + 8 · W) · (L − 1) / 98, geteilt durch 256 (höchstens 95 %)<br/>"
                "L = Skill-Level, W = Werkzeugstufe 0 bis 5 (Kupfer … Ur), lo/hi = Werte des Rohstoffs. Wie in OSRS: Level und Werkzeug machen schneller, nicht ertragreicher."))
s.append(Paragraph("Kernschlag und Riss – der aktive Moment", H2))
s.append(p("Ungefähr bei jedem achten Versuch leuchtet am Stamm eine <b>Kerbe</b> (Holz) bzw. in der Ader ein <b>Riss</b> (Bergbau) für <b>1,5 Sekunden</b> auf. "
           "Tippt man ihn an, gelingt dieser Versuch sicher, bringt <b>zwei Stücke</b> und <b>50 % mehr XP</b>. Tippt man nicht, läuft alles normal weiter. "
           "So lohnt sich Aufmerksamkeit, ohne dass Sammeln zur Pflichtübung wird. Der Server bestimmt, wann der Moment kommt, und prüft das Antippen."))
s.append(Paragraph("Nebenfunde", H2))
s += li(["<b>Harz</b> (Holz): etwa 1 von 40 Stämmen – für Alchemie und die Sehnen von Bögen (Handwerk).",
         "<b>Splitterkristall</b> (Bergbau): von 1 zu 200 (Kupfer) bis 1 zu 60 (Urerz) – Material für Zauberstäbe und Veredelung im Handwerk. "
         "Bewusst ein eigenes Wort: <b>Splitter</b> bleiben die Währung, <b>Splitterkristalle</b> sind Material.",
         "<b>Setzling</b> (Holz, später): selten; eingepflanzt wird daraus nach einiger Zeit ein neuer Baum, der Pflanzende bekommt XP."])
s.append(PageBreak())

# ---------- Holz ----------
s.append(Paragraph("2 · Holz", H1))
s.append(p("Holz kommt von Bäumen. <b>Tannen und Eichen stehen schon zu Tausenden in der Welt</b> (rund 2.500 Tannen, 4.900 Eichen) und werden fällbar. "
           "Linden und Herbstbäume bleiben Schmuck. Für die höheren Stufen kommen <b>vier neue Baumarten</b> dazu, bewusst selten und an besonderen Orten."))
rows = []
for i, r in enumerate(Z0["holz"]):
    ort = ["überall (Waldmark, Kreuzwald, Nordsaum …)", "überall, vor allem rund um die Waldmark", "Kreuzwald, Westmark (neu gesetzt, ca. 20)",
           "Rabenmoor (erst nach Quest 1 erreichbar, ca. 12)", "Nordwald, Ruinen der Feste – bei den Waldgolems (ca. 8)", "Nordsaum, einzelne Sprosse an Rissen (ca. 3)"][i]
    rows.append([f"<b>{r['name']}</b>", r["quelle"], r["level"], STUFEN[i], r["xp"], f"{r['vorrat'][0]}–{r['vorrat'][1]}", f"{r['nach']} s", ort])
s.append(tab(["Holz", "Baum", "Level", "Stufe", "XP", "Vorrat", "Nachw.", "Wo"], rows, [24, 22, 11, 15, 10, 13, 13, 66], klein=True))
s.append(Paragraph("Äxte", H2))
s.append(tab(["Axt", "Werkzeugstufe", "Benötigt", "Woher"], [
    ["Kupferaxt", "0", "Holz 1", "Händler „Zur Scharfen Kante“, später Handwerk"], ["Eisenaxt", "1", "Holz 10", "Händler, später Handwerk"],
    ["Schwarzeisenaxt", "2", "Holz 20", "Handwerk"], ["Sternenaxt", "3", "Holz 35", "Handwerk"], ["Splitteraxt", "4", "Holz 45", "Handwerk"], ["Uraxt", "5", "Holz 65", "Handwerk"]], [40, 26, 26, 82]))
s.append(p("Eine Axt kann man auch <b>als Waffe anlegen</b> (schwache Nahkampfwaffe) – dann muss sie nicht im Rucksack liegen. Ohne Axt gibt es die Meldung „Du brauchst eine Axt“."))
s.append(PageBreak())

# ---------- Bergbau ----------
s.append(Paragraph("3 · Bergbau", H1))
s.append(p("Erz kommt aus <b>Erzadern</b> – die gibt es noch nicht und werden neu in die Welt gesetzt. Dadurch bekommen die <b>bisher leeren Gebiete eine Aufgabe</b>: "
           "Westmark wird Steinbruch, der Osthang trägt Sternenadern, am Nordsaum brechen Splitterfelsen aus dem Boden."))
rows = []
for i, r in enumerate(Z0["erz"]):
    ort = ["Steinbruch Westmark, kleiner Bruch bei Waldmark", "Steinbruch Westmark", "Graufurt, am Flussufer", "Osthang, Sternenadern am Hang",
           "Nordsaum, Splitterfelsen an den Rissen", "Unterschlupf und tiefe Risse (wenige Adern)"][i]
    rows.append([f"<b>{r['name']}</b>", r["quelle"], r["level"], STUFEN[i], r["xp"], f"{r['vorrat'][0]}–{r['vorrat'][1]}", f"{r['nach']} s", ort])
s.append(tab(["Erz", "Ader", "Level", "Stufe", "XP", "Vorrat", "Nachw.", "Wo"], rows, [26, 26, 11, 15, 10, 13, 13, 60], klein=True))
s.append(Paragraph("Spitzhacken", H2))
s.append(p("Wie bei den Äxten: Kupfer- (Bergbau 1), Eisen- (10), Schwarzeisen- (20), Sternen- (35), Splitter- (45) und Ur-Spitzhacke (65). Die ersten beiden beim Händler, alle später über Handwerk."))
s.append(Paragraph("Vom Erz zum Barren (gehört zu Handwerk)", H2))
s.append(p("Erz wird an der <b>Esse in Waldmark</b> (neben Brann Hackebeil) zu Barren geschmolzen. <b>Schmelzen ist Handwerk</b>: So bleibt Bergbau reines Sammeln, "
           "und wer nicht selbst schmilzt, kann Erz an Handwerker verkaufen. Als <b>Brennstoff</b> braucht jeder Barren Holz – das verbindet die beiden Sammel-Skills."))
s.append(tab(["Barren", "Zutaten", "Handwerk"], [
    ["Kupferbarren", "1 Kupfererz + 1 Holz (beliebig)", "1"], ["Eisenbarren", "2 Eisenerz + 1 Holz", "10"], ["Schwarzeisenbarren", "2 Schwarzeisenerz + 1 Eichenholz oder besser", "20"],
    ["Sternenbarren", "2 Sternenerz + 1 Eibenholz oder besser", "35"], ["Splitterstahl", "2 Splittererz + 1 Splitterkristall + 1 Moorholz oder besser", "45"],
    ["Urbarren", "3 Urerz + 2 Splitterkristalle + 1 Kernholz oder besser", "65"]], [36, 112, 26]))
s.append(PageBreak())

# ---------- Balancing ----------
s.append(Paragraph("4 · Balancing", H1))
s.append(p("Gerechnet mit der Formel aus Kapitel 1, 2 Sekunden je Versuch und 15 % Abzug für Laufen und Nachwachsen – <b>ohne</b> Kernschlag/Riss (damit rund 20 % mehr) und ohne Wege zur Bank. "
           "Spalten: beim Mindestlevel mit passendem Werkzeug, 20 Level darüber, und bei Level 99 mit dem besten Werkzeug."))
for titel, key in (("Holz", "holz"), ("Bergbau", "erz")):
    rows = []
    for r in Z0[key]:
        w = r["werte"]; rows.append([f"<b>{r['name']}</b>"] + [f"{c} % · {de(n)}/h · {de(x)} XP/h" for (_L, _s, c, n, x) in w])
    s.append(Paragraph(titel, H2)); s.append(tab(["Rohstoff", "Mindestlevel", "Mindestlevel + 20", "Level 99, bestes Werkzeug"], rows, [30, 48, 48, 48], klein=True))
s.append(Paragraph("Einordnung", H2))
s += li(["Immer am ergiebigsten Rohstoff, ohne Bankwege und Kernschlag: Level 10 nach rund <b>6 Minuten</b>, 30 nach 40 Minuten, 50 nach 2½ Stunden, 70 nach 9 Stunden, <b>99 nach rund 95 Stunden</b>. Mit Wegen zum Lager real eher 120 bis 150 Stunden – in der Größenordnung von OSRS.",
         "Die besten Rohstoffe geben die meisten XP, sind aber langsam und selten – wer Menge will, sammelt eine Stufe darunter.",
         "Erste Werte zum Ausprobieren; nach dem Einbau prüfen wir sie im Spiel und passen lo/hi, Vorrat und Nachwachsen an."])
s.append(PageBreak())

# ---------- Was wir brauchen ----------
s.append(Paragraph("5 · Was wir dafür bauen müssen", H1))
s.append(Paragraph("Datenbank (Migration 048)", H2))
s += li(["Neue Spalten in <b>rpg_held</b>: skill_holz, skill_bergbau – gleich mit skill_handwerk und skill_alchemie, damit später keine weitere Migration nötig ist.",
         "Funktion <b>rpg_held_beruf_gutschrift</b> (nur der Server darf buchen, wie bei den Kampf-Skills), <b>rpg_held_lesen</b> liefert die neuen Werte mit. RLS bleibt unverändert.",
         "SQL samt Rückbau und Test bekommst du wie immer im Chat, bevor etwas live geht."])
s.append(Paragraph("Spielregeln und Gegenstände (shared)", H2))
s += li(["Neue Datei mit Baumarten, Erzadern, Formel-Werten, Vorrat, Nachwachsen, Nebenfunden und Fundorten.",
         "<b>Neue Gegenstände</b>: 6 Hölzer, 6 Erze, Harz, Splitterkristall, 6 Äxte, 6 Spitzhacken (später die Barren mit Handwerk).",
         "<b>Rohstoffe stapeln</b> (100 je Rucksackfach), solange es noch keine Bank gibt – mit 24 Fächern wäre man sonst nach einer Minute voll.",
         "Die vier Berufe als eigene Skill-Liste neben den Kampf-Skills; sie zählen nicht ins Heldenlevel."])
s.append(Paragraph("Server", H2))
s += li(["Sammel-Befehl in der Welt-Verbindung: Abstand, Level, Werkzeug, Zustand des Baums/der Ader prüfen; Takt alle 4 Ticks; Abbruch bei Bewegung, Angriff oder vollem Rucksack.",
         "<b>Zustand aller Bäume und Adern</b> je Region (Vorrat, Stumpf, Nachwachsen) – gemeinsam für alle, an alle in der Nähe gemeldet.",
         "Kernschlag/Riss auslosen und prüfen; XP sammeln und alle paar Sekunden buchen (wie bei den Kampf-Skills).",
         "Bäume aus den vorhandenen Weltdaten lesen; Erzadern aus der neuen Fundort-Liste."])
s.append(Paragraph("Spiel im Browser", H2))
s += li(["Menüpunkte „Fällen“ und „Abbauen“, Held schlägt sichtbar, kurze Meldungen („Du fällst die Eiche …“, „Dein Rucksack ist voll“).",
         "Stumpf und erschöpfte Ader für alle sichtbar; leuchtende Kerbe bzw. Riss zum Antippen.",
         "Skills-Fenster mit einem neuen Bereich <b>Berufe</b>; Symbole für alle neuen Gegenstände im Rucksack."])
s.append(Paragraph("Grafik und Figuren", H2))
s += li(["<b>Erzadern</b>: 6 Arten, je voll und erschöpft (aus der Figuren-Fabrik oder direkt im Spiel gebaut wie die Truhen).",
         "<b>Neue Bäume</b>: Eibe, Moorweide, Kernbaum, Weltbaum-Spross, dazu ein <b>Baumstumpf</b>.",
         "<b>Axt und Spitzhacke in der Hand</b> und die Bewegungen <b>Hacken</b> und <b>Schürfen</b> (Figuren-Fabrik). Bis dahin nutzt der Held den vorhandenen Schlag.",
         "Symbole für Hölzer, Erze, Kristall und Werkzeuge."])
s.append(Paragraph("Welt", H2))
s += li(["Fundorte festlegen: Steinbruch Westmark, kleiner Bruch bei Waldmark, Ufer von Graufurt, Osthang, Nordsaum; die neuen Baumarten in Kreuzwald, Rabenmoor, Nordwald, Nordsaum.",
         "Die Esse in Waldmark wird benutzbar (für Handwerk)."])
s.append(Paragraph("Später, aber bald nötig", H2))
s += li(["<b>Bank/Lager</b> in Waldmark – spätestens wenn Handwerk kommt, sonst wird der Rucksack zum Engpass.",
         "Handwerk (Schmelzen, Werkzeuge, Ausrüstung) und Alchemie in eigenen Heften."])
s.append(Paragraph("Vorschlag für Version 1", H2))
s.append(kasten("<b>Holz</b> mit Tanne und Eiche, <b>Bergbau</b> mit Kupfer und Eisen (kleiner Bruch bei Waldmark und Steinbruch Westmark), Kupfer- und Eisenwerkzeug beim Händler, "
                "Kernschlag und Riss, Migration 048, Skills-Fenster mit Berufen. Zwei Ader-Modelle und ein Baumstumpf genügen dafür; Hacken und Schürfen erst einmal mit dem vorhandenen Schlag."))

SimpleDocTemplate(sys.argv[1], pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=18 * mm,
                  title="Mythara – Holz und Bergbau", author="Mythara").build(s, onFirstPage=seite, onLaterPages=seite)
print("ok")
