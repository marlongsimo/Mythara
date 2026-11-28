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
VORH = [(o['name'], o['x'], o['y']) for o in on['orte']] + [(g['name'], g['schrift'][0], g['schrift'][1]) for g in on['gebiete']] + [(q['name'], q['x'], q['y']) for q in D.get('siedlungen', [])]   # auch die neuen Siedlungen des Schritts
rng = random.Random('namen-' + schritt)
PERSONEN = ['Otto', 'Mette', 'Hinnerk', 'Grete', 'Ansgar', 'Wiebke', 'Jost', 'Alke', 'Tamme', 'Fenna', 'Lüder', 'Imme', 'Bodo', 'Gesche', 'Ruprecht', 'Edda', 'Wendel', 'Hille', 'Rolf', 'Trude',
            'Harm', 'Telse', 'Bernd', 'Ilsabe', 'Volker', 'Rieke', 'Gerold', 'Hedda', 'Lambert', 'Tini', 'Sievert', 'Agnes', 'Konrad', 'Dörte', 'Eilert', 'Marten', 'Ottilie', 'Brun', 'Wilma', 'Hauke']
# Ockerlande (Schritt 2): eigene, warme Namen statt der nördlichen (Personen weltweit einmal; Gewässer, Lage und Höhlen passend zu Lehm, Dünen und Akazien)
SCHNEE = {'stamm': ['Frost', 'Schnee', 'Eis', 'Reif', 'Weiß', 'Kalt', 'Winter', 'Firn', 'Graupel', 'Silber', 'Sturm', 'Hagel'], 'gew': ['Eisbach', 'Frostquell', 'Schmelzbach', 'Kaltbach', 'Reifbach'],
          'lage': ['Am Weißen Hang', 'Hinter den Schneewehen', 'Im Eisgrund', 'Am Frostbuckel', 'Unterm Gletscher', 'Bei den Kalten Steinen', 'Am Windbruch']}   # Schneeland (Plan „schnee“)
PERSONEN_LAND = {'Ockerlande': ['Asra', 'Kadir', 'Sela', 'Tamir', 'Neema', 'Doran', 'Yara', 'Saro', 'Imra', 'Belo', 'Zafir', 'Lavi', 'Ronah', 'Esmé', 'Tarik', 'Noor', 'Haddo', 'Mirsa', 'Ubar', 'Kesh', 'Alun', 'Ziva', 'Rabe', 'Odai']}
GEWAESSER_LAND = {'Ockerlande': ['Bitterquell', 'Trockenbach', 'Salzsumpf', 'Lehmgraben', 'Dornbach', 'Roten Quell', 'Warmbach', 'Sandbach', 'Salzsee', 'Krugbach']}
LAGE_LAND = {'Ockerlande': ['Am Roten Hang', 'Hinter den Dünen', 'Im Trockental', 'Unterm Felsdach', 'Bei den Akazien', 'Am Salzrand', 'Langes Geröll', 'Am Dornhag', 'Im Lehmgrund', 'Am Glutbuckel', 'Bei den Drei Palmen', 'Am Ausgedörrten Feld']}
GESCHICHTE_LAND = {'Ockerlande': {'hoehle': ['Hyänenbau', 'Schlangenloch', 'Kühle Grotte', 'Schattenloch'], 'fischer': ['Netzhütte', 'Salzkate', 'Krabbenhütte'], 'hof': ['Dürrer Hof', 'Lehmhof', 'Letzter Hof', 'Durstiger Hof'],
                                   'turm': ['Geierhorst', 'Dünenwacht', 'Späherturm', 'Hohe Warte', 'Krummer Turm', 'Brandwacht', 'Alte Warte', 'Leerer Turm', 'Windturm'], 'leuchtfeuer': ['Feuer am Kap', 'Strandfeuer', 'Klippenfeuer', 'Riffleuchte'],
                                   'hirten': ['Schäferlager', 'Hirtenrast', 'Ziegenpferch', 'Kamelpferch'],
                                   'brunnen': ['Bitterbrunnen', 'Tiefer Brunnen', 'Letzter Brunnen', 'Alte Zisterne', 'Kalter Brunnen', 'Durstloch']}}
def gen(n): return n + ('' if n.endswith('s') else 's')
STAEMME = {'Grenzland': ['Distel', 'Eichen', 'Linden', 'Erlen', 'Moos', 'Weiden', 'Hasel', 'Nessel', 'Birken', 'Lerchen', 'Schlehen', 'Hopfen', 'Ahorn', 'Eschen', 'Mohn', 'Holunder', 'Rüben', 'Gersten', 'Hafer', 'Flachs', 'Bienen', 'Tauben', 'Igel', 'Kiefern'],
           'Fahle Weiten': ['Heide', 'Ginster', 'Wacholder', 'Nebel', 'Asch', 'Wolfs', 'Moor', 'Dorn', 'Torf', 'Schwarz', 'Bleich', 'Krüppel', 'Föhren', 'Elster', 'Raben', 'Kranich', 'Binsen', 'Borst', 'Sumpf', 'Lerchen', 'Pfeifen', 'Erika'],
           'Ockerlande': ['Rot', 'Lehm', 'Ocker', 'Akazien', 'Sand', 'Staub', 'Dürr', 'Kamel', 'Salz', 'Ton', 'Dattel', 'Glut', 'Geier', 'Skorpion', 'Wüsten', 'Sonnen', 'Kupfer', 'Bitter', 'Hirse', 'Feigen', 'Ziegen', 'Echsen', 'Krug', 'Zimt', 'Wind', 'Brand', 'Mittag', 'Falken']}
GEWAESSER = ['Kreuzbach', 'Krähenbach', 'Erlenbach', 'Mühlbach', 'Schwarzwasser', 'Moorgraben', 'Eulenbach', 'Weidengraben', 'Steinbach', 'Rotbach', 'Hasenbach', 'Ententeich', 'Dorfteich']
LAGE = ['Hinterm Moor', 'Ödes Feld', 'Am Hohlweg', 'Unterm Hang', 'Am Dornbusch', 'Hinter den Birken', 'Am Kahlen Berg', 'Im Grund', 'Am Wolfsbuckel', 'Hohe Heide', 'Am Krummen Pfad', 'Hinterm Wald', 'Langes Feld', 'Am Stillen Teich', 'Bei den Steinen']
GESCHICHTE = {'hof': ['Brandhof', 'Hungerhof', 'Wüster Hof', 'Kalter Hof', 'Spukhof', 'Witwenhof', 'Letzter Hof'], 'schrein': ['Witwenschrein', 'Schrein der Ertrunkenen', 'Pilgerschrein', 'Stiller Schrein', 'Bettlerschrein', 'Hirtenschrein'],
              'stein': ['Kahler Stein', 'Totenstein', 'Drei Steine', 'Die Neun Steine', 'Blutstein', 'Wetterstein', 'Grenzstein'], 'ruine': ['Altes Gemäuer', 'Brandstätte', 'Verfallene Kate', 'Leere Mauern', 'Zerfallener Hof', 'Alte Schanze'],
              'turm': ['Alter Turm', 'Krummer Turm', 'Leerer Turm', 'Hohe Wacht', 'Alte Warte'], 'banditen': ['Räubernest', 'Schlupfwinkel', 'Galgenvogelnest', 'Diebeslager', 'Wegelagerer'], 'muehle': ['Schwarze Mühle', 'Stille Mühle', 'Alte Mühle'],
              'hoehle': ['Dachsbau', 'Fuchsloch', 'Kalte Höhle', 'Bärenloch'], 'fischer': ['Netzhütte', 'Reusenhütte', 'Aalkate'], 'leuchtfeuer': ['Feuer am Kap', 'Strandfeuer', 'Klippenfeuer'],
              'brunnen': ['Durstbrunnen', 'Kalter Brunnen', 'Tiefer Brunnen'], 'jaeger': ['Jagdlager', 'Fallenstellerlager', 'Hirschlager'], 'koehler': ['Kohlstelle', 'Rußiger Meiler'],
              'hirten': ['Schäferlager', 'Hirtenrast'], 'weiler': ['Kleindorf', 'Drei Höfe', 'Neusiedel'], 'lager': ['Rastlager']}
ENDE = {'hof': ['hof'], 'weiler': ['au', 'feld', 'winkel'], 'muehle': ['mühle'], 'turm': ['warte', 'turm', 'wacht'], 'ruine': ['ruh'], 'schrein': ['schrein', 'kreuz'], 'stein': ['stein'], 'hoehle': ['loch', 'grotte', 'höhle'],
        'fischer': ['kate'], 'leuchtfeuer': ['feuer', 'leuchte'], 'banditen': ['nest'], 'brunnen': ['brunnen', 'born'], 'jaeger': ['lager'], 'koehler': ['meiler'], 'hirten': ['pferch'], 'lager': ['lager']}
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
    PERS, GEW, LG = PERSONEN_LAND.get(l, PERSONEN), GEWAESSER_LAND.get(l, GEWAESSER), LAGE_LAND.get(l, LAGE); GES = {**GESCHICHTE, **GESCHICHTE_LAND.get(l, {})}
    if q.get('schnee'): st, GEW, LG = SCHNEE['stamm'], SCHNEE['gew'], SCHNEE['lage']; GES = {**GESCHICHTE, 'hoehle': ['Eisgrotte', 'Kalte Höhle', 'Frostloch']}; l = l + ' (Schnee)'
    for _ in range(400):
        m = rng.random(); n = None; key = None
        if m < 0.22 and art in BESITZ:
            p = rng.choice(PERS)
            if person_n[p] >= 1: continue   # jeder Personenname einmal (weltweit)
            n = f'{gen(p)} {BESITZ[art]}'; key = ('p', l, p)
        elif m < 0.36 and art in AM:
            g = rng.choice(GEW); n = AM[art].format(g=g); key = ('g', l, g)
            if stamm_n[key] >= 1: continue
        elif m < 0.46 and art in ('hof', 'weiler', 'stein', 'ruine', 'hirten', 'brunnen'):
            n = rng.choice(LG); key = ('l', l, n)
        elif m < 0.62 and art in GES:
            n = rng.choice(GES[art]); key = ('h', l, n)
        else:
            s = rng.choice(st); e = rng.choice(ENDE.get(art, ['hof']))
            if e.lower() in s.lower() or s.lower().endswith(e[:3]) or stamm_n[('s', l, s)] >= (3 if _ > 200 else 2): continue   # nach 200 Versuchen: ein Stamm bis dreimal
            n = s + e; key = ('s', l, s)
        ohne = lambda t: t.lower().replace('der ', '').replace('die ', '').replace('das ', '')
        if not n or n in benutzt or any(ohne(n) == ohne(b) for b in benutzt) or verwechselbar(n, x, y): continue
        benutzt.add(n); stamm_n[key] += 1
        if key[0] == 'p': person_n[key[2]] += 1
        return n
    raise SystemExit(f'kein Name für {art} in {l} bei {x}|{y} – Wortlisten erweitern')
for q in D['orte']:
    if not q['besonders']: q['name'] = neu_name(q)
json.dump(D, open(P, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(D['orte']), 'Namen:', ', '.join(q['name'] for q in D['orte']))
