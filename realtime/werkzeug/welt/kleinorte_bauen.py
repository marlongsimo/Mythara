"""
World Pipeline – Kleinorte bauen (Leitlinie des Nutzers 28.11.; Plan aus kleinorte.py + kleinorte_namen.py, freigegeben je Schritt).
Liest welt/plaene/kleinorte_<schritt>.json der freigegebenen Schritte (FREIGEGEBEN) und setzt je Ort:
  · 1–3 leichte, vorhandene Objekte nach Art (Hof: Bauernhaus und Zaun; Wachturm: Turm und Feuer; Schrein: Schrein und Grablicht …),
  · eine Lesestelle mit kurzem Text (Besonderheiten: ihr eigener Text), Kennungen „ko_<nr>“ (kurz: Server und Quests),
  · einen Feldweg zum nächsten Weg, wenn der näher als 60 Felder liegt.
Schreibt direkt in die Gebiete (nach festland.py, baumdichte.mjs; vor verdichten.py), hängt die Namen an welt/ortsnamen.json (Feld „ko“) und schreibt welt/kleinorte_orte.json (Liste für Tests).
Wiederholbar: --entfernen (am Anfang der Kette) nimmt alle „ko_“-Objekte und -Lesestellen heraus und stellt das Gelände unter den Feldwegen wieder her (welt/festland/kleinorte_grund.json).
Aufruf (im Ordner realtime): python3 werkzeug/welt/kleinorte_bauen.py [--entfernen]
"""
import json, os, sys, math, random
RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
lies = lambda *p: json.load(open(os.path.join(*p), encoding='utf8'))
FREIGEGEBEN = ['schritt1']   # Schritte mit Freigabe des Nutzers (KANON; Schritt 1 für Ausgabe 1, Nutzer 28.11.)
BIB = {o['id']: o for o in lies(W, 'bibliothek', 'objekte.json')['objekte']}
ARTEN = {a['zeichen']: a for a in lies(W, 'bibliothek', 'gelaende.json')['arten']}
GRUND = os.path.join(W, 'festland', 'kleinorte_grund.json'); grund = lies(GRUND) if os.path.exists(GRUND) else {}
BAEUME = os.path.join(W, 'festland', 'kleinorte_baeume.json'); baeume = lies(BAEUME) if os.path.exists(BAEUME) else {}   # für Lichtungen entfernte Bäume (kommen bei --entfernen zurück)

def schreibe_obj(d, obj):
    with open(os.path.join(d, 'objekte.json'), 'w', encoding='utf8') as f:
        f.write('[\n' + ',\n'.join(' ' + json.dumps(q, ensure_ascii=False, separators=(',', ':')) for q in obj) + ('\n' if obj else '') + ']\n')
REGIONEN = {}
for n in os.listdir(os.path.join(W, 'regionen')):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = lies(p)
    if r.get('ebene') or r.get('entwurf'): continue
    REGIONEN[n] = r

# ───── entfernen (jeder Lauf beginnt damit) ─────
def entfernen():
    for n in REGIONEN:
        d = os.path.join(W, 'regionen', n); obj = lies(d, 'objekte.json'); rest = [o for o in obj if not str(o.get('id', '')).startswith('ko_')]
        da = {o.get('id') for o in rest}; zurueck = [o for o in baeume.get(n, []) if o.get('id') not in da]   # Bäume der Lichtungen zurück
        if len(rest) != len(obj) or zurueck: schreibe_obj(d, rest + zurueck)
        sp = lies(d, 'spiel.json'); ia = [i for i in sp.get('interaktionen', []) if not str(i.get('id', '')).startswith('ko_')]
        if len(ia) != len(sp.get('interaktionen', [])):
            sp['interaktionen'] = ia; json.dump(sp, open(os.path.join(d, 'spiel.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
        if n in grund:   # Gelände unter den Feldwegen zurück
            z = [list(l) for l in open(os.path.join(d, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
            for k, c in grund[n].items():
                x, y = map(int, k.split(','))
                if 0 <= y < len(z) and 0 <= x < len(z[0]) and z[y][x] == 'e': z[y][x] = c
            open(os.path.join(d, 'gelaende.txt'), 'w', encoding='utf8').write('\n'.join(''.join(l) for l in z) + '\n')
    for f in (GRUND, BAEUME):
        if os.path.exists(f): os.remove(f)
    on = lies(W, 'ortsnamen.json'); rest = [o for o in on['orte'] if 'ko' not in o]
    if len(rest) != len(on['orte']): on['orte'] = rest; json.dump(on, open(os.path.join(W, 'ortsnamen.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False); open(os.path.join(W, 'ortsnamen.json'), 'a').write('\n')
entfernen()
if '--entfernen' in sys.argv: print('Kleinorte entfernt'); sys.exit(0)

# ───── Zusammenstellung je Art: (Objekt, dx, dy, Maßstab) – wenige, leichte Objekte ─────
TEILE = {'hof': [('weidenhain_bauernhaus_01', 0, 0, 1), ('k_zaun', 5, 2, 1), ('wegrand_heuhaufen', -5, 2, 1)],
         'weiler': [('dorf_huette_holz_01', -4, 0, 1), ('dorf_huette_holz_02', 4, 1, 1), ('dorf_brunnen_01', 0, 4, 1)],
         'muehle': [('dorf_windmuehle_01', 0, 0, 1), ('dorf_holzstapel_01', 4, 2, 1)],
         'turm': [('dorf_wachturm_01', 0, 0, 1), ('dorf_festfeuer_01', 3, 3, 1)],
         'ruine': [('k_ruine_mauer', -2, 0, 1), ('k_ruine_turmstumpf', 2, -1, 1), ('k_truemmer', 0, 2, 1)],
         'schrein': [('moor_schrein_01', 0, 0, 1), ('wz_seelenlicht_grablicht', 2, 1, 1)],
         'stein': [('moor_menhir_01', -2, 0, 1), ('moor_menhir_02', 2, -1, 1), ('hochland_steinmann', 0, 2, 1)],
         'hoehle': [('k_fels_gross', 0, 0, 1), ('k_fels_klein', 3, 1, 1), ('hoehle_tuer_01', 0, 1.2, 1)],
         'fischer': [('moor_fischer_01', 0, 0, 1), ('kueste_netze', 4, 1, 1)],
         'leuchtfeuer': [('turm_signalfeuer_01', 0, 0, 1), ('k_fels_klein', 2, 1, 1)],
         'banditen': [('welt_zelt_01', -2, 0, 1), ('dorf_festfeuer_01', 2, 1, 1), ('k_kiste', 3, -1, 1)],
         'brunnen': [('dorf_brunnen_01', 0, 0, 1), ('wegrand_wegkreuz_holz', 2, 1, 1)],
         'jaeger': [('welt_zelt_01', -1, 0, 1), ('dorf_festfeuer_01', 2, 1, 1), ('welt_spuren_01', 4, 2, 1)],
         'koehler': [('wald_meiler_01', 0, 0, 1), ('dorf_holzstapel_01', 3, 1, 1)],
         'hirten': [('dorf_huette_holz_02', 0, 0, 1), ('k_zaun', 4, 1, 1), ('wegrand_heuhaufen', -4, 1, 1)],
         'lager': [('welt_zelt_01', 0, 0, 1), ('dorf_festfeuer_01', 2, 1, 1)]}
TEXT = {'hof': 'Ein einsamer Hof. Der Bauer hebt kurz die Hand und arbeitet weiter.', 'weiler': 'Ein paar Hütten um einen Brunnen – hier kennt jeder jeden.',
        'muehle': 'Eine Windmühle. Die Flügel knarren, auch wenn kaum Wind geht.', 'turm': 'Ein Wachturm am Rand der Wege. Von oben sieht man weit.',
        'ruine': 'Mauerreste, halb eingesunken. Niemand weiß mehr, wer hier gewohnt hat.', 'schrein': 'Ein kleiner Schrein. Jemand hat frische Blumen hingelegt.',
        'stein': 'Alte Steine, aufgerichtet von Leuten, die keiner mehr kennt.', 'hoehle': 'Ein dunkler Spalt im Fels. Kalte Luft weht heraus.',
        'fischer': 'Eine Fischerhütte. Netze hängen zum Trocknen, es riecht nach Salz und Tang.', 'leuchtfeuer': 'Ein Leuchtfeuer für die Boote draußen auf dem Wasser.',
        'banditen': 'Ein verlassenes Lager. Die Asche ist noch warm – sie sind nicht weit.', 'brunnen': 'Ein Brunnen am Wegrand. Das Wasser ist klar und kalt.',
        'jaeger': 'Ein Jägerlager: Feuerstelle, ein Zelt und Spuren, die in den Wald führen.', 'koehler': 'Ein Kohlenmeiler qualmt still vor sich hin.',
        'hirten': 'Ein Hirtenlager mit Pferch. Die Tiere grasen nicht weit.', 'lager': 'Ein Rastlager für Reisende.'}
# Besonderheiten von Hand (Plan „besonders“): eigene Zusammenstellung statt der Art, wo das Bild es braucht; Text ersetzt den Plantext, wenn angegeben
SONDER = {'Der Hängende Stein': ([('k_fels_klein', 0, 0.6, 1.3), ('k_fels_gross', 0, 0, 2.1), ('k_fels_klein', 4, 1.5, 0.9)], None),
          'Galgenhügel': ([('stil_tot_01', 0, 0, 1.2), ('k_grabstein_zerbrochen', 2, 1, 1), ('k_grabstein_rund', -2, 1.5, 1), ('wegrand_wegkreuz_holz', 3, -1, 1)],
                          'Ein toter Baum auf einem Hügel – früher hing hier der Galgenstrick. Die Krähen sitzen hier lieber als sonst irgendwo.'),
          'Die Sieben Linden': ([('moor_menhir_01', 0, 0, 0.8)] + [('stil_linde_01', round(6 * math.cos(k * 0.8976 - 1.2), 1), round(6 * math.sin(k * 0.8976 - 1.2), 1), 1) for k in range(7)], None),
          'Hünengrab': ([('grauwacht_grabhuegel_eingang', 0, 0, 1.3), ('moor_menhir_01', -3, 0.5, 1), ('moor_menhir_02', 3, 0, 1)], None),
          'Die Windharfe': ([('dorf_wachturm_01', 0, 0, 1), ('k_truemmer', 3, 2, 1), ('k_ruine_mauer', -4, 1, 1)], None),
          'Krähenbaum': ([('stil_tot_01', 0, 0, 1.4), ('k_grabstein_zerbrochen', 1.5, 1, 1), ('wz_seelenlicht_grablicht', -1.5, 1, 1)], None),
          'Der Versunkene Hof': ([('k_ruine_mauer', 0, 0, 1), ('k_truemmer', 2.5, 1, 1), ('stil_erle_tot_01', -3, 1, 1)], 'Ein Hof, halb im Moor versunken. Nur ein Stück Mauer schaut noch heraus.')}
ORTART = {'hof': 'Gehöft', 'ruine': 'Ruine', 'hoehle': 'Ruine', 'banditen': 'Lager'}   # für die Karte (sonst „Ort“); „Lager“ hat keinen gegnerfreien Kreis (Banditen)

# ───── Gelände und Objekte der Gebiete (zum Prüfen) ─────
def region_bei(x, y):
    for n, r in REGIONEN.items():
        ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C
        if ux <= x < ux + r['chunks'][0] * C and uy <= y < uy + r['chunks'][1] * C: return n
DATEN = {}
def daten(n):
    if n not in DATEN:
        d = os.path.join(W, 'regionen', n); r = REGIONEN[n]
        DATEN[n] = {'r': r, 'ux': r['ursprung'][0] * C, 'uy': r['ursprung'][1] * C, 'z': [list(l) for l in open(os.path.join(d, 'gelaende.txt'), encoding='utf8').read().split('\n') if l],
                    'obj': lies(d, 'objekte.json'), 'sp': lies(d, 'spiel.json'), 'neu_obj': [], 'neu_ia': [], 'grund': {}}
    return DATEN[n]
def zeichen(x, y):
    n = region_bei(x, y)
    if not n: return 'M'
    D = daten(n); i, j = int(x - D['ux']), int(y - D['uy'])
    return D['z'][j][i] if 0 <= j < len(D['z']) and 0 <= i < len(D['z'][0]) else 'M'
def begehbar(c): return bool(ARTEN.get(c, {}).get('begehbar')) and not ARTEN.get(c, {}).get('wasser')
def rahmen(o):   # Bildrechteck in Feldern (wie verdichten.py, test/welt-waldmark.test.mjs „Sichtbarkeit“)
    d = BIB[o['objekt']]; s_ = o.get('s', 1) * d.get('massstab', 1); bb, hh = d['groesse'][0] * s_ / 48, d['groesse'][1] * s_ / 48; ax = 1 - d['anker'][0] if o.get('spiegeln') else d['anker'][0]
    if d.get('sichtbar'): fx, fy = d['anker'][0] * d['groesse'][0], d['anker'][1] * d['groesse'][1]; return (o['x'] + (d['sichtbar'][0] - fx) * s_ / 48, o['y'] + (d['sichtbar'][1] - fy) * s_ / 48, o['x'] + (d['sichtbar'][2] - fx) * s_ / 48, o['y'] + (d['sichtbar'][3] - fy) * s_ / 48)
    return (o['x'] - ax * bb, o['y'] - d['anker'][1] * hh, o['x'] + (1 - ax) * bb, o['y'] + (1 - d['anker'][1]) * hh)
def verdeckt(o, D):   # Baumkronen davor (südlich) bedecken mehr als 5 % des Bildes (Bäume verdecken nichts, sie dürfen sich überdecken)
    if BIB[o['objekt']]['kategorie'] == 'bewuchs': return False
    r = rahmen(o); f = (r[2] - r[0]) * (r[3] - r[1]); su = 0
    for q in D['obj'] + D['neu_obj']:
        if q['y'] <= o['y'] - 0.6 or abs(q['x'] - o['x']) > 12 or q['y'] - o['y'] > 14 or BIB.get(q['objekt'], {}).get('kategorie') != 'bewuchs': continue
        k = rahmen(q); su += max(0, min(r[2], k[2] + 0.6) - max(r[0], k[0] - 0.6)) * max(0, min(r[3], k[3] + 0.6) - max(r[1], k[1] - 0.6))
    return su > 0.05 * f
def nah_gebaeude(x, y, r=6):   # ein Gebäude (auch Nachbarregion) näher als r: dort kein Feldweg
    n = region_bei(x, y); D = daten(n)
    return any(abs(o['x'] + D['ux'] - x) < r and abs(o['y'] + D['uy'] - y) < r and BIB.get(o['objekt'], {}).get('kategorie') == 'gebaeude' for o in D['obj'])

def lichtung(x0, y0):   # Bäume am Ort (r 5) und davor (südlich, die Kronen verdecken sonst den Ort) herausnehmen, merken
    n = region_bei(x0, y0); D = daten(n); weg = []
    for o in D['obj']:
        if BIB.get(o['objekt'], {}).get('kategorie') != 'bewuchs' or o['objekt'].startswith('samm_'): continue
        x, y = o['x'] + D['ux'], o['y'] + D['uy']
        if math.hypot(x - x0, y - y0) < 5 or (y0 - 1 < y < y0 + 11 and abs(x - x0) < 6): weg.append(o)
    if weg: D['obj'] = [o for o in D['obj'] if o not in weg]; D['lichtung'] = D.get('lichtung', []) + weg

def frei(x, y, r):   # nichts im Umkreis r (Objekte der Region und schon gesetzte)
    n = region_bei(x, y); D = daten(n)
    for o in D['obj'] + D['neu_obj']:
        if abs(o['x'] + D['ux'] - x) < r and abs(o['y'] + D['uy'] - y) < r: return False
    for i in D['sp'].get('interaktionen', []) + D['neu_ia']:
        if math.hypot(i['x'] + D['ux'] - x, i['y'] + D['uy'] - y) < 3: return False
    return True

def gesperrt(x, y, rand=0.7):   # liegt (x, y) in einem Körper (Kollision der Bibliothek, Maßstab, Spiegeln, Drehung 90/270)?
    n = region_bei(x, y); D = daten(n)
    for o in D['obj'] + D['neu_obj']:
        ox, oy = o['x'] + D['ux'], o['y'] + D['uy']
        if abs(ox - x) > 9 or abs(oy - y) > 9: continue
        k = (BIB.get(o['objekt']) or {}).get('kollision') or {}; s_ = o.get('s', 1); f = -1 if o.get('spiegeln') else 1
        if k.get('art') == 'kreis':
            if math.hypot(ox - x, oy - y) < k['r'] * s_ + rand: return True
            continue
        rects = [(k['x'], k['y'], k['x'] + k['b'], k['y'] + k['h'])] if k.get('art') == 'rechteck' else [(b['x0'], b['y0'], b['x1'], b['y1']) for b in k.get('koerper', [])]
        for a, b, c, d in rects:
            a, c = sorted((a * f, c * f))
            if (o.get('dreh', 0) % 180) == 90: a, b, c, d = b, a, d, c
            if ox + a * s_ - rand < x < ox + c * s_ + rand and oy + b * s_ - rand < y < oy + d * s_ + rand: return True
    return False

orte, namen = [], []; nr = 0
for schritt in FREIGEGEBEN:
    P = lies(W, 'plaene', f'kleinorte_{schritt}.json')
    for q in P['orte']:
        nr += 1; kid = f'ko_{nr}'; rng = random.Random(kid); x0, y0 = q['x'], q['y']
        teile = TEILE.get(q['art'], TEILE['lager']); sonder_text = None
        if q['name'] in SONDER: teile, sonder_text = SONDER[q['name']]
        if q['art'] == 'muehle' and any(zeichen(x0 + dx, y0 + dy) in '~w' for dx in range(-8, 9, 2) for dy in range(-8, 9, 2)): teile = [('weidenhain_muehle_01', 0, 0, 1), ('dorf_holzstapel_01', 4, 2, 1)]
        def versuch():
            gesetzt = []
            for k, (ob, dx, dy, s) in enumerate(teile):
                if ob not in BIB: continue
                for v in range(30 if gesetzt else 120):   # Platz suchen: begehbar, frei, nicht hinter Kronen, gleiche Region wie der Ort (Hauptstück bis 12 Felder weit)
                    a, rr = rng.random() * 6.283, (v / 10)
                    x, y = x0 + dx + math.cos(a) * rr, y0 + dy + math.sin(a) * rr
                    n = region_bei(x, y)
                    if not n or n != region_bei(x0, y0) or not begehbar(zeichen(x, y)) or not frei(x, y, 0.8 if sonder_text is not None or q['name'] in SONDER else 2.2 if BIB[ob]['kategorie'] != 'gebaeude' else 4.5): continue
                    D = daten(n); o = {'id': f'{kid}_{k}', 'objekt': ob, 'x': round(x - D['ux'], 2), 'y': round(y - D['uy'], 2)}
                    if s != 1: o['s'] = s
                    if rng.random() < 0.5 and BIB[ob].get('spiegelbar', True) and BIB[ob]['kategorie'] != 'gebaeude': o['spiegeln'] = True
                    if verdeckt(o, D): continue
                    D['neu_obj'].append(o); gesetzt.append((x, y)); break
            return gesetzt
        gesetzt = versuch()
        if not gesetzt: lichtung(x0, y0); gesetzt = versuch()   # im dichten Wald: kleine Lichtung schlagen
        if not gesetzt: continue
        hx, hy = gesetzt[0]; n = region_bei(hx, hy); D = daten(n)
        # Lesestelle vor dem Hauptstück: das nächste begehbare, von keinem Körper verdeckte Feld (vorn/südlich zuerst)
        lx = ly = None
        for rr in (2.2, 2.8, 3.5, 4.5, 5.5, 7):
            for t in (90, 60, 120, 30, 150, 0, 180, 210, 330, 270):
                x, y = hx + math.cos(math.radians(t)) * rr, hy + math.sin(math.radians(t)) * rr
                if region_bei(x, y) == n and begehbar(zeichen(x, y)) and not gesperrt(x, y): lx, ly = x, y; break
            if lx is not None: break
        if lx is None: lx, ly = hx, hy + 2.2
        text = sonder_text or q.get('text') or TEXT.get(q['art'], TEXT['lager'])
        D['neu_ia'].append({'id': f'{kid}_l', 'art': 'lesen', 'x': round(lx - D['ux'], 2), 'y': round(ly - D['uy'], 2), 'radius': 1.8, 'abgleich': 'keiner', 'daten': {'text': f'{q["name"]}. {text}'}})
        # Feldweg zum nächsten Weg (wenn näher als 60): gerade Linie, nur über begehbares Land, nicht über Pflaster
        if q.get('feldweg'):
            best = None
            for rr in range(4, 61, 2):
                for t in range(0, 360, 12):
                    x, y = hx + math.cos(math.radians(t)) * rr, hy + math.sin(math.radians(t)) * rr
                    if zeichen(x, y) in 'ekpd': best = (x, y); break
                if best: break
            if best:
                L = math.hypot(best[0] - hx, best[1] - hy)
                for s_ in range(int(L * 2)):
                    x, y = hx + (best[0] - hx) * s_ / (L * 2), hy + 3 + (best[1] - hy - 3) * s_ / (L * 2)
                    for ox, oy in ((0, 0), (0.6, 0), (0, 0.6)):
                        m = region_bei(x + ox, y + oy)
                        if not m: continue
                        E = daten(m); i, j = int(x + ox - E['ux']), int(y + oy - E['uy'])
                        if 2 <= j < len(E['z']) - 2 and 2 <= i < len(E['z'][0]) - 2 and E['z'][j][i] in '.,ftjgTyulLsv' and not nah_gebaeude(x + ox, y + oy):   # nicht am Regionsrand (Grenzen: Weg auf Weg), nicht an Häusern
                            E['grund'].setdefault(f'{i},{j}', E['z'][j][i]); E['z'][j][i] = 'e'
        orte.append({'id': kid, 'name': q['name'], 'art': q['art'], 'land': q['land'], 'x': round(hx, 1), 'y': round(hy, 1), 'lesestelle': f'{kid}_l', 'besonders': q['besonders'], 'abseits': q.get('abseits', False), 'region': n})
        namen.append([q['name'], ORTART.get(q['art'], 'Ort'), round(hx, 1), round(hy, 1)])

# ───── schreiben ─────
gr = {}
for n, D in DATEN.items():
    if not D['neu_obj'] and not D['neu_ia'] and not D['grund'] and not D.get('lichtung'): continue
    d = os.path.join(W, 'regionen', n)
    schreibe_obj(d, D['obj'] + D['neu_obj'])
    D['sp']['interaktionen'] = D['sp'].get('interaktionen', []) + D['neu_ia']; json.dump(D['sp'], open(os.path.join(d, 'spiel.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    if D['grund']:
        open(os.path.join(d, 'gelaende.txt'), 'w', encoding='utf8').write('\n'.join(''.join(l) for l in D['z']) + '\n'); gr[n] = D['grund']
json.dump(gr, open(GRUND, 'w', encoding='utf8'))
json.dump({n: D['lichtung'] for n, D in DATEN.items() if D.get('lichtung')}, open(BAEUME, 'w', encoding='utf8'), ensure_ascii=False)
on = lies(W, 'ortsnamen.json'); on['orte'] += [{'name': o['name'], 'art': ORTART.get(o['art'], 'Ort'), 'x': o['x'], 'y': o['y'], 'ko': o['id']} for o in orte]   # Karte und Schriftzug (Oberfläche); „ko“ = Kleinort
json.dump(on, open(os.path.join(W, 'ortsnamen.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False); open(os.path.join(W, 'ortsnamen.json'), 'a').write('\n')
json.dump({'hinweis': 'Kleinorte (kleinorte_bauen.py): gebaute Orte der freigegebenen Schritte – Namen (auch in ortsnamen.json mit „ko“), Lesestellen, Lage. Weltfelder.', 'schritte': FREIGEGEBEN, 'orte': orte, 'namen': namen},
          open(os.path.join(W, 'kleinorte_orte.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'Kleinorte: {len(orte)} gebaut ({sum(len(D.get("lichtung", [])) for D in DATEN.values())} Bäume für Lichtungen, {sum(len(D["neu_obj"]) for D in DATEN.values())} Objekte, {sum(len(D["neu_ia"]) for D in DATEN.values())} Lesestellen, {sum(len(g) for g in gr.values())} Feldweg-Felder)')
