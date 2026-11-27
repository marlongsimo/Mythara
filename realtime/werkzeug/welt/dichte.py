"""
World Pipeline – Dichte messen (Welt-Erlebnis, 27.11.): wie leer wirkt ein Gebiet? Misst, baut nichts.
  leer:   Anteil des freien, begehbaren Landes (ohne Wege, Wasser, Orte), das weiter als 10 Felder vom nächsten Objekt entfernt ist
  weg:    entlang der Wege der größte und der mittlere Abstand zur nächsten Kleinigkeit (kein Bewuchs: Zaun, Stein, Karren, Haus …),
          Anteil der Wegfelder mit mehr als 12 Feldern bis dahin (Ziel: alle 15–25 Felder etwas → höchstens ~12 Felder bis zum nächsten)
Aufruf (im Ordner realtime): python3 werkzeug/welt/dichte.py <gebiet> [<gebiet> …]  (Gebiete = Regionskennungen) [--json datei]
"""
import json, os, sys
import numpy as np
from scipy import ndimage
RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
ARTEN = {a['zeichen']: a for a in json.load(open(os.path.join(W, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
BIB = {o['id']: o for o in json.load(open(os.path.join(W, 'bibliothek', 'objekte.json'), encoding='utf8'))['objekte']}
ziel = [a for a in sys.argv[1:] if not a.startswith('--') and not a.endswith('.json')]; aus = next((a for a in sys.argv[1:] if a.endswith('.json')), None)
def region(n):
    r = json.load(open(os.path.join(W, 'regionen', n, 'region.json'), encoding='utf8'))
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    return r, np.array([list(l) for l in z]), json.load(open(os.path.join(W, 'regionen', n, 'objekte.json'), encoding='utf8'))
erg = {}
for n in ziel:
    r, G, obj = region(n); H, B = G.shape; ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C
    geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)))(G); weg = np.isin(G, list('ekpd'))
    alle = np.ones((H, B), bool); klein = np.ones((H, B), bool)
    for o in obj:
        i, j = int(o['x']), int(o['y'])
        if 0 <= i < B and 0 <= j < H:
            alle[j, i] = False
            if BIB.get(o['objekt'], {}).get('kategorie') not in ('bewuchs',): klein[j, i] = False
    d_alle = ndimage.distance_transform_edt(alle); d_klein = ndimage.distance_transform_edt(klein)
    land = geh & ~weg & ~np.isin(G, list('p'))
    leer = (land & (d_alle > 10)).sum() / max(1, land.sum())
    dw = d_klein[weg]
    erg[n] = {'name': r['name'], 'land': int(land.sum()), 'leer_anteil': round(float(leer), 3), 'wegfelder': int(weg.sum()),
              'weg_max': round(float(dw.max()), 1) if len(dw) else None, 'weg_mittel': round(float(dw.mean()), 1) if len(dw) else None,
              'weg_ueber_12': round(float((dw > 12).mean()), 3) if len(dw) else None, 'objekte': len(obj),
              'bewuchs': sum(1 for o in obj if BIB.get(o['objekt'], {}).get('kategorie') == 'bewuchs')}
    print(n, json.dumps(erg[n], ensure_ascii=False))
if aus: json.dump(erg, open(aus, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
