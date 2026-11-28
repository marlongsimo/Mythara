"""
World Pipeline – Namen der Kleinorte (Leitstelle 28.11.): natürlich statt Baukasten. Behält Lage und Art aus welt/plaene/kleinorte_<schritt>.json und vergibt neue Namen:
  · Personennamen („Ottos Hof“, „Mettes Kate“), Lagebezeichnungen („Am Kreuzbach“, „Hinterm Moor“, „Ödes Feld“), Geschichten („Brandhof“, „Witwenschrein“),
    kurze Zusammensetzungen („Birkenlager“, „Distelhof“) – je Vorsilbe höchstens 2 Orte je Land, jeder Personenname einmal je Land;
  · keine Doppelungen („Steinstein“), keine sperrigen Wörter, nichts, was vorhandene Orte doppelt oder verwechselbar macht (gleicher Wortanfang wie ein Ort im Umkreis).
Die Besonderheiten behalten ihren Namen. Aufruf (im Ordner realtime): python3 werkzeug/welt/kleinorte_namen.py schritt1 (danach kleinorte.py --nur-bild schritt1)
"""
import json, os, sys, random, math
from collections import Counter
RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt')
schritt = next((a for a in sys.argv[1:] if a.startswith('schritt')), 'schritt1'); P = os.path.join(W, 'plaene', f'kleinorte_{schritt}.json'); D = json.load(open(P, encoding='utf8'))
on = json.load(open(os.path.join(W, 'ortsnamen.json'), encoding='utf8'))
VORH = [(o['name'], o['x'], o['y']) for o in on['orte']] + [(g['name'], g['schrift'][0], g['schrift'][1]) for g in on['gebiete']]
rng = random.Random('namen-' + schritt)
PERSONEN = ['Otto', 'Mette', 'Hinnerk', 'Grete', 'Ansgar', 'Wiebke', 'Jost', 'Alke', 'Tamme', 'Fenna', 'Lüder', 'Imme', 'Bodo', 'Gesche', 'Ruprecht', 'Edda', 'Wendel', 'Hille', 'Rolf', 'Trude',
            'Harm', 'Telse', 'Bernd', 'Ilsabe', 'Volker', 'Rieke', 'Gerold', 'Hedda', 'Lambert', 'Tini', 'Sievert', 'Agnes', 'Konrad', 'Dörte', 'Eilert', 'Marten', 'Ottilie', 'Brun', 'Wilma', 'Hauke']
def gen(n): return n + ('' if n.endswith('s') else 's')
STAEMME = {'Grenzland': ['Distel', 'Eichen', 'Linden', 'Erlen', 'Moos', 'Weiden', 'Hasel', 'Nessel', 'Birken', 'Lerchen', 'Schlehen', 'Hopfen', 'Ahorn', 'Eschen', 'Mohn', 'Holunder', 'Rüben', 'Gersten', 'Hafer', 'Flachs', 'Bienen', 'Tauben', 'Igel', 'Kiefern'],
           'Fahle Weiten': ['Heide', 'Ginster', 'Wacholder', 'Nebel', 'Asch', 'Wolfs', 'Moor', 'Dorn', 'Torf', 'Schwarz', 'Bleich', 'Krüppel', 'Föhren', 'Elster', 'Raben', 'Kranich', 'Binsen', 'Borst', 'Sumpf', 'Lerchen', 'Pfeifen', 'Erika'],
           'Ockerlande': ['Rot', 'Lehm', 'Ocker', 'Akazien', 'Sand', 'Staub', 'Dürr', 'Kamel', 'Salz', 'Ton', 'Dattel', 'Glut', 'Geier', 'Skorpion', 'Wüsten', 'Sonnen']}
GEWAESSER = ['Kreuzbach', 'Krähenbach', 'Erlenbach', 'Mühlbach', 'Schwarzwasser', 'Moorgraben', 'Eulenbach', 'Weidengraben', 'Steinbach', 'Rotbach', 'Hasenbach', 'Ententeich', 'Dorfteich']
LAGE = ['Hinterm Moor', 'Ödes Feld', 'Am Hohlweg', 'Unterm Hang', 'Am Dornbusch', 'Hinter den Birken', 'Am Kahlen Berg', 'Im Grund', 'Am Wolfsbuckel', 'Hohe Heide', 'Am Krummen Pfad', 'Hinterm Wald', 'Langes Feld', 'Am Stillen Teich', 'Bei den Steinen']
GESCHICHTE = {'hof': ['Brandhof', 'Hungerhof', 'Wüster Hof', 'Kalter Hof', 'Spukhof', 'Witwenhof', 'Letzter Hof'], 'schrein': ['Witwenschrein', 'Schrein der Ertrunkenen', 'Pilgerschrein', 'Stiller Schrein', 'Bettlerschrein', 'Hirtenschrein'],
              'stein': ['Kahler Stein', 'Totenstein', 'Drei Steine', 'Die Neun Steine', 'Blutstein', 'Wetterstein', 'Grenzstein'], 'ruine': ['Altes Gemäuer', 'Brandstätte', 'Verfallene Kate', 'Leere Mauern', 'Zerfallener Hof', 'Alte Schanze'],
              'turm': ['Alter Turm', 'Krummer Turm', 'Leerer Turm', 'Hohe Wacht', 'Alte Warte'], 'banditen': ['Räubernest', 'Schlupfwinkel', 'Galgenvogelnest', 'Diebeslager', 'Wegelagerer'], 'muehle': ['Schwarze Mühle', 'Stille Mühle', 'Alte Mühle'],
              'hoehle': ['Dachsbau', 'Fuchsloch', 'Kalte Höhle', 'Bärenloch'], 'fischer': ['Netzhütte', 'Reusenhütte', 'Aalkate'], 'leuchtfeuer': ['Feuer am Kap', 'Strandfeuer', 'Klippenfeuer'],
              'brunnen': ['Durstbrunnen', 'Kalter Brunnen', 'Tiefer Brunnen'], 'jaeger': ['Jagdlager', 'Fallenstellerlager', 'Hirschlager'], 'koehler': ['Kohlstelle', 'Rußiger Meiler'],
              'hirten': ['Schäferlager', 'Hirtenrast'], 'weiler': ['Kleindorf', 'Drei Höfe', 'Neusiedel'], 'lager': ['Rastlager']}
ENDE = {'hof': ['hof'], 'weiler': ['au', 'feld', 'winkel'], 'muehle': ['mühle'], 'turm': ['warte', 'turm'], 'ruine': ['ruh'], 'schrein': ['schrein', 'kreuz'], 'stein': ['stein'], 'hoehle': ['loch', 'grotte'],
        'fischer': ['kate'], 'leuchtfeuer': ['feuer'], 'banditen': ['nest'], 'brunnen': ['brunnen', 'born'], 'jaeger': ['lager'], 'koehler': ['meiler'], 'hirten': ['pferch'], 'lager': ['lager']}
BESITZ = {'hof': 'Hof', 'weiler': 'Winkel', 'muehle': 'Mühle', 'fischer': 'Kate', 'koehler': 'Meiler', 'hirten': 'Pferch', 'brunnen': 'Brunnen', 'jaeger': 'Jagdhütte', 'schrein': 'Schrein', 'turm': 'Turm'}
AM = {'muehle': 'Mühle am {g}', 'jaeger': 'Lager am {g}', 'fischer': 'Kate am {g}', 'hof': 'Hof am {g}', 'schrein': 'Schrein am {g}', 'banditen': 'Versteck am {g}', 'hirten': 'Pferch am {g}', 'brunnen': 'Brunnen am {g}', 'koehler': 'Meiler am {g}'}
benutzt = {n for n, _, _ in VORH} | {q['name'] for q in D['orte'] if q['besonders']}
stamm_n, person_n, ende_n = Counter(), Counter(), Counter()
def verwechselbar(name, x, y):
    w = name.split()[-1].lower()[:5] if ' ' not in name else name.lower()
    for n, a, b in VORH:
        if math.hypot(a - x, b - y) < 400 and (n.lower()[:4] == name.lower()[:4] or (len(w) >= 4 and n.lower().startswith(w[:4]))): return True
    return False
def neu_name(q):
    art, l, x, y = q['art'], q['land'], q['x'], q['y']; st = STAEMME.get(l, STAEMME['Fahle Weiten'])
    for _ in range(400):
        m = rng.random(); n = None; key = None
        if m < 0.22 and art in BESITZ:
            p = rng.choice(PERSONEN)
            if person_n[p] >= 1: continue   # jeder Personenname einmal (weltweit)
            n = f'{gen(p)} {BESITZ[art]}'; key = ('p', l, p)
        elif m < 0.36 and art in AM:
            g = rng.choice(GEWAESSER); n = AM[art].format(g=g); key = ('g', l, g)
            if stamm_n[key] >= 1: continue
        elif m < 0.46 and art in ('hof', 'weiler', 'stein', 'ruine', 'hirten', 'brunnen'):
            n = rng.choice(LAGE); key = ('l', l, n)
        elif m < 0.62 and art in GESCHICHTE:
            n = rng.choice(GESCHICHTE[art]); key = ('h', l, n)
        else:
            s = rng.choice(st); e = rng.choice(ENDE.get(art, ['hof']))
            if e.lower() in s.lower() or s.lower().endswith(e[:3]) or stamm_n[('s', l, s)] >= 2: continue
            n = s + e; key = ('s', l, s)
        if not n or n in benutzt or verwechselbar(n, x, y): continue
        benutzt.add(n); stamm_n[key] += 1
        if key[0] == 'p': person_n[key[2]] += 1
        return n
    return q['name']
for q in D['orte']:
    if not q['besonders']: q['name'] = neu_name(q)
json.dump(D, open(P, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(D['orte']), 'Namen:', ', '.join(q['name'] for q in D['orte']))
