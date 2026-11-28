"""
World Pipeline – leere Flächen finden (Welt-Erlebnis, Wunsch der Leitstelle 27.11.): wo läuft man mehr als 60 Felder, ohne etwas zu sehen?
Ein Feld ist „leer“, wenn im Umkreis von 30 Feldern kein Weg, kein Ort (Ortsname, Gebäude, Lesestelle) und keine Arbeitsstelle (Holz, Erz, Kraut) liegt – Bewuchs allein zählt nicht (Leitstelle 28.11.). Zusammenhängende leere Felder auf
begehbarem Land (ohne die Sperrgebiete hinter Bergsturz und Schneesturm) bilden eine leere Fläche; die Liste nennt Mitte, Größe, Gebiet und Land.
Schreibt welt/leere_flaechen.json. Fertig ist die Verdichtung, wenn die Liste leer ist.
Aufruf (im Ordner realtime): python3 werkzeug/welt/leere_flaechen.py [radius]
"""
import json, os, sys, math
import numpy as np
from scipy import ndimage
RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
RAD = float(sys.argv[1]) if len(sys.argv) > 1 else 30
ARTEN = {a['zeichen']: a for a in json.load(open(os.path.join(W, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
KAT = {o['id']: o.get('kategorie') for o in json.load(open(os.path.join(W, 'bibliothek', 'objekte.json'), encoding='utf8'))['objekte']}
X0, Y0, B, H = 186 * C, 155 * C, 75 * C, 99 * C
G = np.full((H, B), 'M', dtype='<U1'); REG = np.full((H, B), '', dtype=object); frei = np.ones((H, B), bool); FREI = []
for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf'): continue
    x0, y0 = r['ursprung'][0] * C - X0, r['ursprung'][1] * C - Y0
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z]); REG[y0:y0 + len(z), x0:x0 + len(z[0])] = n
    for f in json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8')).get('kollision', {}).get('freigeben', []):
        if 'x0' in f: FREI.append((f['x0'] + x0, f['y0'] + y0, f['x1'] + x0, f['y1'] + y0))
    # Leitstelle 28.11.: Bewuchs allein zählt nicht – nur Weg, Ort und Tätigkeit (Lesestellen, Gebäude, Arbeitsstellen)
    for o in json.load(open(os.path.join(W, 'regionen', n, 'objekte.json'), encoding='utf8')):
        if KAT.get(o['objekt']) != 'gebaeude': continue
        i, j = int(o['x'] + x0), int(o['y'] + y0)
        if 0 <= i < B and 0 <= j < H: frei[j, i] = False
    for q in json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8')).get('interaktionen', []):
        i, j = int(q['x'] + x0), int(q['y'] + y0)
        if 0 <= i < B and 0 <= j < H: frei[j, i] = False
frei &= ~np.isin(G, list('ekpd'))   # Wege
_SM = json.load(open(os.path.join(W, 'sammelstellen.json'), encoding='utf8'))
for q in [b for l in _SM['lichtungen'] for b in l['baeume']] + [a for g in _SM['senken'] for a in g['adern']] + json.load(open(os.path.join(W, 'kraeuter_standorte.json'), encoding='utf8'))['stellen']:
    i, j = int(q['x'] - X0), int(q['y'] - Y0)
    if 0 <= i < B and 0 <= j < H: frei[j, i] = False
for o in json.load(open(os.path.join(W, 'ortsnamen.json'), encoding='utf8'))['orte']:
    i, j = int(o['x'] - X0), int(o['y'] - Y0)
    if 0 <= i < B and 0 <= j < H and o['art'] not in ('Landschaft',): frei[j, i] = False
geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)) and not ARTEN.get(c, {}).get('wasser', False))(G)
for a0, b0, a1, b1 in FREI: geh[max(0, int(b0)):int(math.ceil(b1)), max(0, int(a0)):int(math.ceil(a1))] = True   # Brücken, Stege, Furten
d = ndimage.distance_transform_edt(frei)
# Sperrgebiete (Drachenarm hinter dem Bergsturz, Frostkrone hinter dem Schneesturm) zählen nicht: von Steinhag aus erreichbar mit den Sperrstücken
SP = json.load(open(os.path.join(W, 'sperren.json'), encoding='utf8')); zu = geh.copy()
for k in ('drachenarm', 'frostkrone'):
    for x, y in SP[k]['kette']:
        zu[max(0, y - Y0 - 2):y - Y0 + 3, max(0, x - X0 - 2):x - X0 + 3] = False
lab, _ = ndimage.label(zu); offen = lab == lab[5901 - Y0, 6990 - X0]
leer = offen & (d > RAD)   # auch im Wald: Bäume allein sind kein Ort und keine Tätigkeit
L, n = ndimage.label(leer); liste = []
LAND = lambda x, y: ('Grenzland' if 6144 <= x < 6784 and 6336 <= y < 6784 else 'Fahle Weiten' if y < 6300 and x < 6760 else 'Hochlande' if y < 6300 else 'Ockerlande' if y > 7300 and x >= 6640 else 'Glutsande' if x >= 6640 else 'Süden/Küste')
for i in range(1, n + 1):
    ys, xs = np.nonzero(L == i)
    if len(xs) < 20: continue
    cx, cy = int(xs.mean()) + X0, int(ys.mean()) + Y0; j = len(xs) // 2
    k = int(np.argmin((xs + X0 - cx) ** 2 + (ys + Y0 - cy) ** 2))   # ein Feld der Fläche nahe der Mitte (zum Hinlaufen)
    liste.append({'mitte': [cx, cy], 'punkt': [int(xs[k]) + X0, int(ys[k]) + Y0], 'felder': int(len(xs)), 'ausdehnung': [int(xs.max() - xs.min() + 2 * RAD), int(ys.max() - ys.min() + 2 * RAD)], 'gebiet': REG[ys[j], xs[j]], 'land': LAND(cx, cy)})
liste.sort(key=lambda q: -q['felder'])
json.dump({'hinweis': f'Leere Flächen (leere_flaechen.py): begehbares, offenes Land, auf dem im Umkreis von {RAD:g} Feldern kein Weg, kein Ort und keine Arbeitsstelle liegt (Bewuchs zählt nicht) – man läuft dort mehr als {2 * RAD:g} Felder, ohne etwas zu sehen. Weltfelder.', 'radius': RAD, 'flaechen': liste},
          open(os.path.join(W, 'leere_flaechen.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
from collections import Counter
print(f'{len(liste)} leere Flächen ({sum(q["felder"] for q in liste)} Felder); je Land:', dict(Counter(q['land'] for q in liste)))
for q in liste[:15]: print('  ', q)
