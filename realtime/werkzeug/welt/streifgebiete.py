"""
World Pipeline – Streifgebiete (#143, 27.11.2026): wenige, verteilte, weitläufige Flächen, auf denen 5–7 Tiere einer Art (Heidewolf, Steppenwolf, Ockerhyäne,
Hochlandbär, Frostwolf) jedes für sich von Ziel zu Ziel streifen – kein Rudel (Entscheidung des Nutzers), jedes Tier läuft einzeln. Etwas Besonderes, nicht die Regel: je Tierart und Land höchstens ein Gebiet.
Jedes Gebiet liegt dort, wo die Art schon steht (welt/gegnerplaetze.json, gleiche Stufe), ist 120 × 120 Felder groß, überwiegend begehbar und zusammenhängend.
Ziele (Wegpunkte) liegen auf begehbaren, verbundenen Feldern, abseits von Orten, Questorten und Sammelstellen; was die Tiere meiden sollen, steht in „meiden“
(Kreise mit Grund). Wege dürfen gequert werden. Den Lagertyp „Streifgebiet“ baut Systeme (#143) und liest diese Datei ein.
Schreibt welt/streifgebiete.json. Test: test/welt-streifgebiete.test.mjs
Aufruf (im Ordner realtime): python3 werkzeug/welt/streifgebiete.py   (nach gegnerplaetze.py)
"""
import json, os, math
import numpy as np
from scipy import ndimage

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt')
X0, Y0, B, H, C = 186 * 32, 155 * 32, 75 * 32, 99 * 32, 32
SEITE, ZIELE = 120, 8
arten = {a['zeichen']: a['begehbar'] for a in json.load(open(os.path.join(W, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
G = np.full((H, B), 'M', dtype='<U1'); REG = np.full((H, B), '', dtype=object); IA = []
for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf'): continue
    x0, y0 = r['ursprung'][0] * C - X0, r['ursprung'][1] * C - Y0
    if x0 < 0 or y0 < 0 or x0 >= B or y0 >= H: continue
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z]); REG[y0:y0 + len(z), x0:x0 + len(z[0])] = n
    sp = json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8'))
    for i in sp.get('interaktionen', []): IA.append((x0 + X0 + i['x'], y0 + Y0 + i['y'], 8, f"Questort/Lesestelle {i['id']}"))
geh = np.vectorize(lambda c: bool(arten.get(c, False)))(G)
lies = lambda f: json.load(open(os.path.join(W, f), encoding='utf8')) if os.path.exists(os.path.join(W, f)) else {}

# ───── zu meidende Kreise: Orte (wie gegnerplaetze.py), Questorte, Sammelstellen, Bedienstellen ─────
RADIUS = {'Stadt': 42, 'Dorf': 28, 'Gehöft': 18, 'Ort': 16, 'Ruine': 12, 'Kreuzung': 8, 'Wegmarke': 8}
on = lies('ortsnamen.json'); meiden = []
for g in on.get('gebiete', []):
    if g['art'] in ('Stadt', 'Dorf', 'Gehöft'): meiden.append((g['schrift'][0], g['schrift'][1], RADIUS[g['art']], f"{g['art']} {g['name']}"))
for o in on.get('orte', []):
    if o['art'] in RADIUS: meiden.append((o['x'], o['y'], RADIUS[o['art']], f"{o['art']} {o['name']}"))
meiden.append((6689, 6515, 48, 'Stadt Graufurt'))
_hs = lies('hochlande_orte.json').get('hauptstadt')
_km = lies('kielmund_orte.json').get('mauer')
if _km: meiden.append(((_km[0] + _km[2]) / 2, (_km[1] + _km[3]) / 2, math.hypot(_km[2] - _km[0], _km[3] - _km[1]) / 2 + 20, 'Stadt Kielmund (Stadtmauer)'))   # #174
_gw = lies('fahleweiten_orte.json').get('grauwacht')
if _gw: _m = _gw['mauer']; meiden.append(((_m[0] + _m[2]) / 2, (_m[1] + _m[3]) / 2, math.hypot(_m[2] - _m[0], _m[3] - _m[1]) / 2 + 8, 'Stadt Grauwacht (Stadtmauer)'))   # #171
if _hs: _m = _hs['mauer']; meiden.append(((_m[0] + _m[2]) / 2, (_m[1] + _m[3]) / 2, math.hypot(_m[2] - _m[0], _m[3] - _m[1]) / 2 + 8, 'Stadt Steinhag (Ringmauer)'))   # #167
meiden += IA
S = lies('sammelstellen.json')
for l in S.get('lichtungen', []) + S.get('senken', []):
    pts = l.get('baeume') or l.get('adern'); meiden.append((sum(q['x'] for q in pts) / len(pts), sum(q['y'] for q in pts) / len(pts), 10, f"Sammelstelle {l['name']}"))
for s in lies('bedienstellen.json').get('stationen', []): meiden.append((s['x'], s['y'], 8, f"Bedienstelle {s['id']}"))

# ───── Kandidaten: wo die Art schon steht ─────
GP = lies('gegnerplaetze.json')['plaetze']
import re
MONSTER = set(re.findall(r'^\s{2}(\w+): \{ name:', open(os.path.join(RT, 'shared', 'config.ts'), encoding='utf8').read(), re.M))   # vorhandene Gegner (Werte in shared/config.ts)
WUNSCH = [  # (Gegner, Land, Name, Anzahl) – je Art und Land ein Gebiet
    ('heidewolf', 'Die Fahlen Weiten', 'Heidewölfe in den Fahlen Weiten', [5, 7]),
    ('steppenwolf', 'Die Hochlande', 'Steppenwölfe der Hochlande', [5, 7]),
    ('steppenwolf', 'Die Glutsande', 'Steppenwölfe in den Glutsande', [5, 7]),
    ('ockerhyaene', 'Die Glutsande', 'Hyänen in den Dünen', [5, 7]),
    ('ockerhyaene', 'Die Ockerlande', 'Hyänen der Ockerlande', [5, 7]),
    ('hochlandbaer', 'Die Hochlande', 'Bären der Hochlande', [5, 6]),
    ('frostwolf', 'Die Frostkrone', 'Frostwölfe der Frostkrone', [5, 7]),
    ('heidewolf', 'Süden', 'Die Wölfe des Graupelz', [5, 7]),   # Süden (#120): Heidewölfe aus der Waldsenke, im Wald nördlich davon (Stufe 30)
]
SUEDEN_MITTEN = [(x, y) for x in range(6200, 6420, 10) for y in range(6800, 6960, 10)]
def bewerte(cx, cy, art, plaetze):
    x0, y0 = int(cx - SEITE / 2) - X0, int(cy - SEITE / 2) - Y0
    if x0 < 2 or y0 < 2 or x0 + SEITE > B - 2 or y0 + SEITE > H - 2: return None
    if len({REG[y0, x0], REG[y0, x0 + SEITE - 1], REG[y0 + SEITE - 1, x0], REG[y0 + SEITE - 1, x0 + SEITE - 1], REG[y0 + SEITE // 2, x0 + SEITE // 2]}) != 1: return None   # ganz in einem Gebiet (Systeme schneidet sonst ab)
    g = geh[y0:y0 + SEITE, x0:x0 + SEITE]
    if not g[SEITE // 2, SEITE // 2]: return None
    lab, _ = ndimage.label(g); k = lab[SEITE // 2, SEITE // 2]; zus = lab == k
    if zus.mean() < 0.6: return None
    mz = [m for m in meiden if abs(m[0] - cx) < SEITE / 2 + m[2] and abs(m[1] - cy) < SEITE / 2 + m[2]]
    gesperrt = np.zeros_like(zus); yy, xx = np.mgrid[0:SEITE, 0:SEITE]
    for mx, my, mr, _ in mz: gesperrt |= (xx + x0 + X0 + 0.5 - mx) ** 2 + (yy + y0 + Y0 + 0.5 - my) ** 2 < (mr + 4) ** 2
    frei = zus & ~gesperrt
    if frei.mean() < 0.45: return None
    # frei muss zusammenhängen (größtes Stück ≥ 85 % der freien Felder)
    lf, nf = ndimage.label(frei)
    if nf == 0: return None
    gr = np.bincount(lf.ravel())[1:]; haupt = lf == (np.argmax(gr) + 1)
    if haupt.sum() < 0.85 * frei.sum(): return None
    dichte = sum(1 for p in plaetze if abs(p['x'] - cx) < SEITE / 2 and abs(p['y'] - cy) < SEITE / 2) if plaetze[0].get('land') else 5 - math.hypot(cx - 6342, cy - 6968) / 60
    return dichte + haupt.mean() * 3 - 3 * len(mz), haupt, mz, (x0, y0)

gebiete = []
for art, land, name, anzahl in WUNSCH:
    plaetze = [p for p in GP if art in p['gegner'] and p.get('land') == land]
    if land == 'Süden': plaetze = [dict(p, x=x, y=y) for p in GP if (art in p['gegner'] or 'graupelz' in p['gegner']) and p['x'] < 6500 and p['y'] > 6800 for x, y in SUEDEN_MITTEN][:len(SUEDEN_MITTEN)]   # die Wölfe des Graupelz (Lager in der Waldsenke)
    if not plaetze: print(f'{name}: keine Plätze'); continue
    best = None
    for p in plaetze:
        for dx in (-20, 0, 20):
            for dy in (-20, 0, 20):
                b = bewerte(p['x'] + dx, p['y'] + dy, art, plaetze)
                if b and (best is None or b[0] > best[0][0]): best = (b, p['x'] + dx, p['y'] + dy)
    if not best: print(f'{name}: kein Gebiet'); continue
    (wert, haupt, mz, (x0, y0)), cx, cy = best
    # (Ziele wählt Systeme selbst; hier nur zur Prüfung, dass die Fläche zusammenhängt)
    # Ziele: weit verteilt auf dem freien Hauptstück (größter Abstand zueinander, Rand 6 Felder)
    innen = ndimage.binary_erosion(haupt, iterations=4); ys, xs = np.nonzero(innen if innen.any() else haupt)
    pts = list(zip(xs, ys)); ziele = [min(pts, key=lambda q: (q[0] - SEITE / 2) ** 2 + (q[1] - SEITE / 2) ** 2)]
    while len(ziele) < ZIELE:
        q = max(pts, key=lambda q: min((q[0] - z[0]) ** 2 + (q[1] - z[1]) ** 2 for z in ziele)); ziele.append(q)
    ziele = [[float(x0 + X0 + x + 0.5), float(y0 + Y0 + y + 0.5)] for x, y in ziele]
    stufe = sorted(p['stufe'] for p in plaetze)[len(plaetze) // 2] if land != 'Süden' else 30; modell = plaetze[0].get('quelle', '')
    gid = 'streifgebiet_' + art + '_' + land.split()[-1].lower().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
    gebiete.append({'id': gid, 'name': name, 'gegner': art, 'anzahl': anzahl[1] if art != 'hochlandbaer' else anzahl[0], 'stufe': stufe, 'land': land,
                    'region': REG[int(cy) - Y0, int(cx) - X0], 'mitte': [round(cx, 1), round(cy, 1)],
                    'rechteck': [int(x0 + X0), int(y0 + Y0), int(x0 + X0 + SEITE - 1), int(y0 + Y0 + SEITE - 1)], 'meiden': [{'x': round(m[0], 1), 'y': round(m[1], 1), 'r': m[2], 'grund': m[3]} for m in mz],
                    'modell': 'vorhanden' if art in MONSTER else 'fehlt'})
    print(f"{name}: Mitte {cx:.0f}|{cy:.0f}, Stufe {stufe}, {len(mz)} Meidekreise, Platzdichte {wert:.1f}")
json.dump({'hinweis': 'Streifgebiete (#143), erzeugt von werkzeug/welt/streifgebiete.py, gelesen von werkzeug/weltzonen.py (Systeme, 25ac9794). KEIN Rudel: jedes Tier streift einzeln. '
           'Je Gebiet: id, gegner (Name aus config.ts), anzahl (Tiere), rechteck [x0, y0, x1, y1] in Weltfeldern einschließlich, ganz in region; '
           'zur Auskunft: name, stufe, land, mitte, modell, meiden (Orte/Questorte/Sammelstellen in der Fläche, Kreise).', 'gebiete': gebiete}, open(os.path.join(W, 'streifgebiete.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'Streifgebiete: {len(gebiete)}')
