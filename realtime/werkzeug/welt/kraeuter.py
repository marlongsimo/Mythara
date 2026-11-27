"""
World Pipeline – Kräuter-Fundstellen (Phase 5 vorab, Issue #35, 27.11.2026). Sucht begehbare, zu Fuß erreichbare Felder auf dem passenden Boden
und schreibt welt/kraeuter_standorte.json (Weltfelder, Kennung je Stelle). Fest gesät, mehrfach ausführbar; braucht gebaute Chunks (echtzeit/welt).
Aufruf (im Ordner realtime): python3 werkzeug/welt/kraeuter.py
"""
import json, os, random
from collections import deque

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); WELT = os.path.join(RT, '..', 'echtzeit', 'welt'); REG = os.path.join(RT, 'welt', 'regionen')
C = 32
F, Z, R = {}, {}, {}
for n in os.listdir(REG):
    p = os.path.join(REG, n, 'region.json')
    if not os.path.exists(p): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf') or n.startswith('fl_'): continue
    ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C
    for j, z in enumerate(open(os.path.join(REG, n, 'gelaende.txt'), encoding='utf8').read().split('\n')):
        for i, c in enumerate(z): Z[(ux + i, uy + j)] = c; R[(ux + i, uy + j)] = n
    for cy in range(r['ursprung'][1], r['ursprung'][1] + r['chunks'][1]):
        for cx in range(r['ursprung'][0], r['ursprung'][0] + r['chunks'][0]):
            d = json.load(open(os.path.join(WELT, f'{cx}_{cy}.json')))
            for j, z in enumerate(d['geh']):
                for i, c in enumerate(z): F[(cx * C + i, cy * C + j)] = c
seen = {(6448, 6437)}; q = deque(seen)
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        p = (x + dx, y + dy)
        if p not in seen and F.get(p) == '.': seen.add(p); q.append(p)
frei = lambda p: p in seen and sum((p[0] + dx, p[1] + dy) in seen for dx in (-1, 0, 1) for dy in (-1, 0, 1)) >= 8   # begehbar und erreichbar, mit Platz ringsum
WEG = set('ekpd')
nahWeg = lambda p, r: any(Z.get((p[0] + dx, p[1] + dy)) in WEG for dx in range(-r, r + 1) for dy in range(-r, r + 1))
rng = random.Random(3505); gewaehlt = []
def waehle(art, n, kand, abstand=6):
    kand = sorted(set(kand)); rng.shuffle(kand); aus = []
    for p in kand:
        if len(aus) >= n: break
        if not frei(p) or any(abs(p[0] - q[0]) + abs(p[1] - q[1]) < abstand for q in aus + gewaehlt): continue
        aus.append(p)
    gewaehlt.extend(aus)
    return [{'id': f'{art}_{i + 1}', 'art': art, 'x': p[0] + 0.5, 'y': p[1] + 0.5, 'region': R[p]} for i, p in enumerate(aus)]
im = lambda n: [p for p in Z if R[p] == n]
stellen = []
# Stufe 1 Wegerich: Wiesen der Waldmark (nicht auf dem Weg, aber nah dran) und Feldränder im Osthof
stellen += waehle('wegerich', 5, [p for p in im('waldmark') if Z[p] in '.,' and nahWeg(p, 3) and not nahWeg(p, 0)])[:5]
stellen += [dict(s, id=f"wegerich_{5 + i + 1}") for i, s in enumerate(waehle('wegerich', 5, [p for p in im('osthof') if Z[p] in '.,' and any(Z.get((p[0] + dx, p[1] + dy)) == 'a' for dx in (-2, 0, 2) for dy in (-2, 0, 2))]))]
# Stufe 10 Ringelblume: Obstwiesen, bevorzugt Blumenwiese
stellen += waehle('ringelblume', 7, [p for p in im('obstwiesen') if Z[p] in ',.' and not nahWeg(p, 1)], 7)
# Stufe 20 Moorglöckchen: Rabenmoor, drei auf Heddas Insel, drei im übrigen Moor (Torf, Moorwiese)
hedda = (6287, 6676)
stellen += waehle('moorgloeckchen', 3, [p for p in im('rabenmoor') if Z[p] in 'tvm' and abs(p[0] - hedda[0]) < 9 and abs(p[1] - hedda[1]) < 8], 3)
stellen += [dict(s, id=f"moorgloeckchen_{3 + i + 1}") for i, s in enumerate(waehle('moorgloeckchen', 3, [p for p in im('rabenmoor') if Z[p] in 'tv' and p[0] < 6365 and not (abs(p[0] - hedda[0]) < 12 and abs(p[1] - hedda[1]) < 10)], 10))]
# Stufe 35 Eisenhut: Friedhof (3) und Feste (2) im Nordwald
stellen += waehle('eisenhut', 3, [p for p in im('nordwald') if 6358 <= p[0] <= 6388 and 6354 <= p[1] <= 6380], 5)
stellen += [dict(s, id=f"eisenhut_{3 + i + 1}") for i, s in enumerate(waehle('eisenhut', 2, [p for p in im('nordwald') if 6308 <= p[0] <= 6348 and 6352 <= p[1] <= 6384], 7))]
# Stufe 45 Nebelkraut: begehbare Felder nahe den Nebelfeldern im Rabenmoor
ox, oy = 6272, 6656
nebel = [(round(o['x'] + ox), round(o['y'] + oy)) for o in json.load(open(os.path.join(REG, 'rabenmoor', 'objekte.json'))) if o['objekt'] == 'moor_nebel_01']
stellen += waehle('nebelkraut', 4, [p for p in im('rabenmoor') if any(abs(p[0] - a) < 6 and abs(p[1] - b) < 5 for a, b in nebel)], 12)
# Stufe 65 Lindenblüte: die alte Linde in Weidenhain (Steinring 6452 · 6678,2), eine Stelle
stellen.append({'id': 'lindenbluete_1', 'art': 'lindenbluete', 'x': 6452.0, 'y': 6680.6, 'region': 'weidenhain'})
# Phase „Süden“ (#120): Stellen aus sueden.mjs (Kennung sueden_…) bleiben erhalten
_sp = os.path.join(RT, 'welt', 'sueden_orte.json')
if os.path.exists(_sp): stellen += json.load(open(_sp, encoding='utf8')).get('kraeuter', [])
# Phase 10 (#82, #133): Kräuterhof an der Küste (kueste.mjs, Hof 6418 · 7064) – Beete („a“, 6410–6425 × 7065–7070) mit vorhandenen Kräutern der Stufe 20–45
# und Ringelblume für die Zucht-Quest; keine neuen Arten. Kessel vor dem Kräuterhaus (Objekt kraeuterhof_kessel).
_beet = {'ringelblume': [(6411.5, 7066.5), (6415.5, 7069.5)], 'moorgloeckchen': [(6415.5, 7066.5), (6419.5, 7069.5)],
         'eisenhut': [(6419.5, 7066.5), (6423.5, 7069.5)], 'nebelkraut': [(6423.5, 7066.5), (6411.5, 7069.5)]}
stellen += [{'id': f'kraeuterhof_{art}_{i + 1}', 'art': art, 'x': x, 'y': y, 'region': 'fl_186_211'} for art, l in _beet.items() for i, (x, y) in enumerate(l)]
aus = {'_hinweis': 'Kräuter-Fundstellen (Phase 5, Issue #35). Erzeugt von werkzeug/welt/kraeuter.py; Weltfelder, Stehplatz = Fundstelle. Kessel: siehe kessel.',
       'stellen': stellen,
       'kessel': [{'id': 'kessel_kraeuterhaus', 'ort': 'Kräuterhaus der Waldmark (Möbel im Bauplan)', 'x': 6420.9, 'y': 6437.5, 'stehen': [6420.9, 6438.6], 'region': 'waldmark'},
                  {'id': 'kessel_hedda', 'ort': 'vor Heddas Hütte (Objekt ort_p5_kessel_hedda)', 'x': 6291.6, 'y': 6677.8, 'stehen': [6291.6, 6679.2], 'region': 'rabenmoor'},
                  {'id': 'kessel_kraeuterhof', 'ort': 'vor dem Kräuterhaus am Kräuterhof (Objekt kraeuterhof_kessel)', 'x': 6422.0, 'y': 7062.0, 'stehen': [6422.0, 7063.4], 'region': 'fl_186_211'}]}
json.dump(aus, open(os.path.join(RT, 'welt', 'kraeuter_standorte.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
from collections import Counter; print('Kräuter-Fundstellen:', dict(Counter(s['art'] for s in stellen)))
