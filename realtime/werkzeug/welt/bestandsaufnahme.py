"""
World Pipeline – Bestandsaufnahme (27.11.2026, Prüfauftrag der Leitstelle): misst, baut nichts.
  1. Orte (Städte, Dörfer, Gehöfte, Weiler) mit Anzahl Gebäude, Region, Koordinate – Norden/Süden
  2. Abstände: größte Lücke zu Fuß zwischen Orten entlang der Wege; Flächen, auf denen man > 150 Felder (zu Fuß) ohne Ort läuft
  3. Gegner: größter Abstand zum nächsten Gegnerplatz je Land (wie welt-gegnerdichte), schlechteste Stelle
  4. Arbeitsplätze: größter Abstand zur nächsten Holz-, Erz-, Fisch-, Kräuterstelle je Land; Stufen, die es in einem Land nicht gibt
Schreibt welt/bestandsaufnahme.json und welt/bestandsaufnahme.png (Karte). Aufruf (im Ordner realtime): python3 werkzeug/welt/bestandsaufnahme.py
"""
import json, os, re, math
from collections import deque, defaultdict
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt')
X0, Y0, B, H, C = 186 * 32, 155 * 32, 75 * 32, 99 * 32, 32
lies = lambda *p: json.load(open(os.path.join(RT, *p), encoding='utf8'))
ARTEN = {a['zeichen']: a for a in lies('welt', 'bibliothek', 'gelaende.json')['arten']}
BIB = {o['id']: o for o in lies('welt', 'bibliothek', 'objekte.json')['objekte']}

# ───── Raster: Gelände, Region, begehbar (mit Freigaben über Brücken) ─────
G = np.full((H, B), 'M', dtype='<U1'); REG = np.full((H, B), '', dtype=object); RN = {}; GEB = []; FREI = []
for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf'): continue
    ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C; x0, y0 = ux - X0, uy - Y0
    if x0 < 0 or y0 < 0 or x0 >= B or y0 >= H: continue
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z]); REG[y0:y0 + len(z), x0:x0 + len(z[0])] = n; RN[n] = r
    for o in json.load(open(os.path.join(W, 'regionen', n, 'objekte.json'), encoding='utf8')):
        if BIB.get(o['objekt'], {}).get('kategorie') == 'gebaeude': GEB.append((o['x'] + ux, o['y'] + uy, o['objekt']))
    for f in json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8')).get('kollision', {}).get('freigeben', []):
        if 'x0' in f: FREI.append((f['x0'] + ux, f['y0'] + uy, f['x1'] + ux, f['y1'] + uy))
geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)))(G)
for a, b, c, d in FREI: geh[int(b) - Y0:int(math.ceil(d)) - Y0, int(a) - X0:int(math.ceil(c)) - X0] = True
weg = np.isin(G, list('ekpd'))
lab, _ = ndimage.label(geh); gr = np.bincount(lab.ravel()); festland = geh & (gr[lab] >= 400)

# ───── Länder (wie gegnerplaetze.py) und Norden/Süden ─────
ALT = {'waldweg', 'obstwiesen', 'osthof', 'westried', 'westmark', 'nordwald', 'nordsaum', 'osthang', 'graufurt', 'rabenmoor', 'aschenwerth', 'waldmark', 'weidenhain'}
meerab = ndimage.distance_transform_edt(G != 'M')
def land(x, y):
    """Land nach Erdkunde statt nach dem Namen des Gebiets (die Gebiete heißen nach ihrem größten Land)"""
    n = REG[y - Y0, x - X0] if 0 <= y - Y0 < H and 0 <= x - X0 < B else ''
    if not n: return '?'
    if n in ALT: return 'Grenzland'
    if n == 'ostufer': return 'Fahle Weiten'
    name = re.sub(r'^(Die|Das|Der) ', '', RN[n]['name']).replace('Fahlen Weiten', 'Fahle Weiten')
    if y < 6300 and x < 6760: return 'Fahle Weiten'
    if y < 6300: return 'Frostkrone' if G[y - Y0, x - X0] in 'TS' and x < 7300 else 'Drachenarm' if x > 7700 else 'Hochlande'
    if name == 'Smaragdküste' or (x < 6640 and y >= 6780): return 'Küste' if meerab[y - Y0, x - X0] < 45 else 'Süden/Westen'
    if x >= 6640 and y >= 6300: return 'Ockerlande' if y > 7300 else 'Glutsande'
    if name in ('Glutsande', 'Ockerlande', 'Drachenarm', 'Weißes Ende'): return name
    return 'Inseln' if 'meer' in name.lower() else name
NORDEN = {'Grenzland', 'Fahle Weiten', 'Hochlande', 'Frostkrone', 'Drachenarm'}
LANDGRID = np.full((H, B), '', dtype=object)
for y in range(0, H, 4):
    for x in range(0, B, 4):
        if REG[y, x]: LANDGRID[y:y + 4, x:x + 4] = land(x + X0, y + Y0)

# ───── 1. Orte ─────
on = lies('welt', 'ortsnamen.json'); RAD = {'Stadt': 50, 'Dorf': 34, 'Gehöft': 20, 'Ort': 26, 'Ruine': 14}
orte = []
for g in on['gebiete']:
    if g['art'] in ('Stadt', 'Dorf', 'Gehöft'):
        x0, y0, x1, y1 = g['grenze']; n = sum(1 for (x, y, _) in GEB if x0 <= x < x1 and y0 <= y < y1)
        orte.append({'name': g['name'], 'art': g['art'], 'x': g['schrift'][0], 'y': g['schrift'][1], 'gebaeude': n, 'grenze': g['grenze']})
for o in on['orte']:
    if o['art'] in RAD:
        n = sum(1 for (x, y, _) in GEB if math.hypot(x - o['x'], y - o['y']) < RAD[o['art']])
        if o['art'] in ('Stadt', 'Dorf', 'Gehöft') or n >= 1: orte.append({'name': o['name'], 'art': o['art'] if o['art'] != 'Ort' else 'Weiler/Ort', 'x': o['x'], 'y': o['y'], 'gebaeude': n})
seen = set(); ORTE = []
for o in orte:
    if o['name'] in seen: continue
    seen.add(o['name']); o['land'] = land(int(o['x']), int(o['y'])); o['teil'] = 'Norden' if o['land'] in NORDEN else 'Süden'; o['region'] = REG[int(o['y']) - Y0, int(o['x']) - X0]; ORTE.append(o)
# Banken (Wunsch des Nutzers: jede etwas größere Stadt hat mindestens einen Bankschalter), Läden, Stationen
OBJ_ALLE = []
for n, r in RN.items():
    for o in json.load(open(os.path.join(W, 'regionen', n, 'objekte.json'), encoding='utf8')): OBJ_ALLE.append((o['x'] + r['ursprung'][0] * C, o['y'] + r['ursprung'][1] * C, o['objekt']))
BANK_TS = open(os.path.join(RT, 'shared', 'bank.ts'), encoding='utf8').read()
SCHALTER = [(float(x), float(y)) for x, y in re.findall(r'\{ id: "[^"]+", ort: "\w+", x: ([\d.]+), y: ([\d.]+) \}', BANK_TS.split('BANKIERS')[0])]
BANKIERS = [(float(x), float(y)) for x, y in re.findall(r'x: ([\d.]+), y: ([\d.]+), blick', BANK_TS)]
LAEDEN = [(float(x), float(y)) for x, y in re.findall(r'x: (\d{4}(?:\.\d+)?), y: (\d{4}(?:\.\d+)?)', open(os.path.join(RT, 'shared', 'laeden.ts'), encoding='utf8').read())]
STATIONEN = [(st['x'], st['y'], st['station']) for st in lies('welt', 'bedienstellen.json')['stationen']]
for o in ORTE:
    rr = RAD.get(o['art'], 26) if o['art'] in RAD else 50 if o['art'] == 'Stadt' else 26
    nah = (lambda x, y, g=o['grenze']: g[0] <= x < g[2] and g[1] <= y < g[3]) if o.get('grenze') else (lambda x, y: math.hypot(x - o['x'], y - o['y']) < rr)
    o['bank_gebaeude'] = sum(1 for x, y, ob in OBJ_ALLE if nah(x, y) and ob in ('waldmark_bank_01', 'weidenhain_bankschalter_01'))
    o['bankschalter_im_spiel'] = sum(1 for x, y in SCHALTER if nah(x, y)); o['bankier'] = sum(1 for x, y in BANKIERS if nah(x, y))
    o['laeden'] = sum(1 for x, y in LAEDEN if nah(x, y)); o['stationen'] = sorted({st for x, y, st in STATIONEN if nah(x, y)})
    o['groesser'] = o['gebaeude'] >= 8 or o['laeden'] > 0 or bool(o['stationen'])
    o['ohne_bank'] = o['groesser'] and not o['bank_gebaeude'] and not o['bankschalter_im_spiel']
ORTE.sort(key=lambda o: (o['teil'], o['land'], -o['gebaeude']))

# ───── 2. Abstände zu Fuß (halbe Auflösung, Mehrquellen-Breitensuche von allen Orten) ─────
S = 2; g2 = festland[::S, ::S]; h2, b2 = g2.shape; dist = np.full((h2, b2), -1, np.int32); q = deque()
for o in ORTE:
    x, y = int((o['x'] - X0) / S), int((o['y'] - Y0) / S)
    for r in range(0, 6):
        hit = False
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                if 0 <= y + dy < h2 and 0 <= x + dx < b2 and g2[y + dy, x + dx] and dist[y + dy, x + dx] < 0: dist[y + dy, x + dx] = 0; q.append((y + dy, x + dx)); hit = True
        if hit: break
while q:
    y, x = q.popleft(); d = dist[y, x] + 1
    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
        if 0 <= ny < h2 and 0 <= nx < b2 and g2[ny, nx] and dist[ny, nx] < 0: dist[ny, nx] = d; q.append((ny, nx))
D = dist.astype(np.float32) * S   # Felder zu Fuß bis zum nächsten Ort (4er-Nachbarschaft, eher zu lang)
w2 = weg[::S, ::S] & (dist >= 0)
wy, wx = np.unravel_index(np.argmax(np.where(w2, D, -1)), D.shape)
luecke = {'x': int(wx * S + X0), 'y': int(wy * S + Y0), 'bis_ort': float(D[wy, wx]), 'luecke_ca': float(2 * D[wy, wx]), 'land': land(int(wx * S + X0), int(wy * S + Y0))}
weit = (D > 150) & (dist >= 0)
wlab, wn = ndimage.label(weit); leer = []
for i in range(1, wn + 1):
    ys, xs = np.nonzero(wlab == i)
    if len(ys) * S * S < 2000: continue
    k = np.argmax(D[ys, xs]); cx, cy = int(xs[k] * S + X0), int(ys[k] * S + Y0)
    leer.append({'land': land(cx, cy), 'flaeche': int(len(ys) * S * S), 'weitester': [cx, cy], 'bis_ort': float(D[ys[k], xs[k]])})
leer.sort(key=lambda a: -a['flaeche'])
unerreichbar = int(((dist < 0) & g2).sum() * S * S)

# ───── 3. Gegner (wie welt-gegnerdichte: Ausnahmekreise frei, Inselchen < 400 Felder aus) ─────
GD = lies('welt', 'gegnerplaetze.json'); P = [(p['x'], p['y']) for p in GD['plaetze']]
for x, y in re.findall(r'\("\w+",\s*(\d{4,5}),\s*(\d{4,5})\)', open(os.path.join(RT, 'werkzeug', 'weltzonen.py'), encoding='utf8').read()):
    if 0 <= int(x) - X0 < B and 0 <= int(y) - Y0 < H: P.append((int(x), int(y)))
pm = np.ones((H, B), bool)
for x, y in P: pm[int(y) - Y0, int(x) - X0] = False
dg = ndimage.distance_transform_edt(pm)
aus = np.zeros((H, B), bool); yy, xx = np.mgrid[0:H, 0:B]
kreise = [(a['x'], a['y'], a['r']) for a in GD['ausnahmen'] if 'x' in a]
for n, r in RN.items():
    for i in json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8')).get('interaktionen', []): kreise.append((r['ursprung'][0] * C + i['x'], r['ursprung'][1] * C + i['y'], 6))
for s in lies('welt', 'bedienstellen.json')['stationen']: kreise.append((s['x'], s['y'], 8))
for s in lies('welt', 'troedler_standorte.json')['standorte']: kreise.append((s['x'], s['y'], 6))
for x, y, r in kreise:
    a0, a1, b0, b1 = max(0, int(y - r) - Y0), min(H, int(y + r) - Y0 + 1), max(0, int(x - r) - X0), min(B, int(x + r) - X0 + 1)
    if a0 < a1 and b0 < b1: aus[a0:a1, b0:b1] |= (xx[a0:a1, b0:b1] + X0 + 0.5 - x) ** 2 + (yy[a0:a1, b0:b1] + Y0 + 0.5 - y) ** 2 <= r * r
pruef = festland & ~aus
gegner = {}
for L in sorted({l for l in LANDGRID.ravel() if l and l != '?'}):
    m = pruef & (LANDGRID == L)
    if not m.any(): continue
    v = np.where(m, dg, -1); k = np.unravel_index(np.argmax(v), v.shape)
    gegner[L] = {'max': round(float(v[k]), 1), 'stelle': [int(k[1] + X0), int(k[0] + Y0)], 'plaetze': sum(1 for p in GD['plaetze'] if land(int(p['x']), int(p['y'])) == L)}

# ───── 4. Arbeitsplätze: Holz, Erz, Fisch, Kräuter (im Spiel = shared/, geplant = Welt-Vorschläge) ─────
lvl = lambda pfad, muster: {a: int(l) for a, l in re.findall(muster, open(os.path.join(RT, 'shared', pfad), encoding='utf8').read())}
L_HOLZ = lvl('holz.ts', r'art: "(\w+)", name: "[^"]+", level: (\d+)'); L_ERZ = lvl('bergbau.ts', r'A\("(\w+)", "\w+", "[^"]+", (\d+)')
L_FISCH = lvl('fischen.ts', r'art: "(\w+)", name: "[^"]+", level: (\d+)'); L_KRAUT = lvl('kraeuter.ts', r'K\("(\w+)", "[^"]+", (\d+)')
STUFEN = {'Holz': L_HOLZ, 'Erz': L_ERZ, 'Fisch': L_FISCH, 'Kraut': L_KRAUT}
spots = defaultdict(list)   # typ → [(x, y, art, live)]
sh_h = lies('shared', 'holz_standorte.json')['lichtungen']; sh_e = lies('shared', 'bergbau_standorte.json')['senken']; SM = lies('welt', 'sammelstellen.json'); OR = lies('welt', 'orte.json')
live_ids = set()
for l in sh_h:
    for b in l['baeume']: spots['Holz'].append((b['x'], b['y'], b['art'], True)); live_ids.add(b['id'])
for s in sh_e:
    for a in s['adern']: spots['Erz'].append((a['x'], a['y'], a['art'], True)); live_ids.add(a['id'])
for l in SM['lichtungen'] + OR.get('lichtungen', []):
    for b in l['baeume']:
        if b['id'] not in live_ids: spots['Holz'].append((b['x'], b['y'], b['art'], False))
for s in SM['senken'] + OR.get('senken', []):
    for a in s['adern']:
        if a['id'] not in live_ids: spots['Erz'].append((a['x'], a['y'], a['art'], False))
GA = lies('welt', 'grauwacht_ausbau.json')   # Fahle Weiten (Phase 8): Vorschläge
for a in GA.get('adern', []): spots['Erz'].append((a['x'], a['y'], a['art'], a['id'] in live_ids))
for b in GA.get('kernbaeume', []): spots['Holz'].append((b['x'], b['y'], b['art'], b['id'] in live_ids))
for k in GA.get('eisenhut', []): spots['Kraut'].append((k['x'], k['y'], k['art'], False))
for g in lies('shared', 'fanggruende.json')['gruende']:
    for x, y in g['felder']: spots['Fisch'].append((x, y, g['art'], True))
for f in ['sueden_orte.json', 'kueste_orte.json', 'glutsande_orte.json', 'hochlande_orte.json']:
    for p in (lies('welt', f).get('fischplaetze') or []):
        for art in ([p['fisch']] if 'fisch' in p else p.get('fische', [])): spots['Fisch'].append((p['stehplatz'][0], p['stehplatz'][1], art, False))
for s in lies('welt', 'kraeuter_standorte.json')['stellen']: spots['Kraut'].append((s['x'], s['y'], s['art'], True))
arbeit = {}
for typ, liste in spots.items():
    m = np.ones((H, B), bool)
    for x, y, _, _ in liste:
        if 0 <= int(y) - Y0 < H and 0 <= int(x) - X0 < B: m[int(y) - Y0, int(x) - X0] = False
    dt = ndimage.distance_transform_edt(m)
    for L in sorted({l for l in LANDGRID.ravel() if l and l != '?'}):
        mm = festland & (LANDGRID == L)
        if not mm.any(): continue
        v = np.where(mm, dt, -1); k = np.unravel_index(np.argmax(v), v.shape)
        da = sorted({STUFEN[typ].get(a, -1) for x, y, a, _ in liste if land(int(x), int(y)) == L})
        fehlt = [f'{a} ({s})' for a, s in sorted(STUFEN[typ].items(), key=lambda t: t[1]) if s not in da and s < 70 and a not in ('waldgott', 'linde_totholz', 'waldstein')]   # Quest-Arten zählen nicht
        arbeit.setdefault(L, {})[typ] = {'max': round(float(v[k]), 1), 'stelle': [int(k[1] + X0), int(k[0] + Y0)], 'stellen': sum(1 for x, y, _, _ in liste if land(int(x), int(y)) == L),
                                         'davon_live': sum(1 for x, y, _, lv in liste if lv and land(int(x), int(y)) == L), 'stufen': [s for s in da if s >= 0], 'fehlt': fehlt}

# ───── Karte ─────
K = 3; h3, b3 = H // K, B // K
farben = {'Grenzland': (126, 168, 92), 'Fahle Weiten': (170, 168, 128), 'Hochlande': (98, 150, 78), 'Frostkrone': (205, 205, 220), 'Drachenarm': (160, 120, 96), 'Süden/Westen': (140, 186, 104),
          'Küste': (186, 196, 140), 'Glutsande': (214, 186, 128), 'Ockerlande': (196, 150, 92), 'Inseln': (150, 150, 150)}
px = np.zeros((h3, b3, 3), np.uint8); px[:] = (36, 64, 100)
lg = LANDGRID[::K, ::K][:h3, :b3]; fl = geh[::K, ::K][:h3, :b3]; berg = (G[::K, ::K][:h3, :b3] == 'F')
px[berg] = (95, 92, 88)
for L, f in farben.items(): px[(lg == L) & fl] = f
px[weg[::K, ::K][:h3, :b3]] = (120, 78, 40)
rot = np.zeros((h3, b3), bool); dd = np.repeat(np.repeat(weit, S, 0), S, 1)[:H, :B][::K, ::K][:h3, :b3]; rot |= dd & fl
px[rot] = (px[rot] * 0.55 + np.array([230, 40, 40]) * 0.45).astype(np.uint8)
img = Image.fromarray(px); d = ImageDraw.Draw(img)
from PIL import ImageFont
try: FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
except OSError: FONT = None
for o in ORTE:
    x, y = (o['x'] - X0) / K, (o['y'] - Y0) / K; r = 2 + min(6, o['gebaeude'] / 4)
    d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255), outline=(0, 0, 0)); d.text((x + r + 2, y - 7), f"{o['name']} ({o['gebaeude']})", fill=(0, 0, 0), font=FONT)
for L, gdat in gegner.items():
    x, y = (gdat['stelle'][0] - X0) / K, (gdat['stelle'][1] - Y0) / K; d.line((x - 4, y - 4, x + 4, y + 4), fill=(200, 0, 0), width=2); d.line((x - 4, y + 4, x + 4, y - 4), fill=(200, 0, 0), width=2)
x, y = (luecke['x'] - X0) / K, (luecke['y'] - Y0) / K; d.rectangle((x - 6, y - 6, x + 6, y + 6), outline=(255, 0, 255), width=3)
for i, (t, f) in enumerate([("weiß: Ort (Gebäude)", (255, 255, 255)), ("rot getönt: > 150 Felder zu Fuß ohne Ort", (230, 80, 80)), ("rotes x: weitester Punkt zum nächsten Gegner je Land", (200, 0, 0)),
                            ("violettes Quadrat: größte Lücke am Weg", (255, 0, 255)), ("braun: Wege", (120, 78, 40))]):
    d.rectangle((8, 8 + i * 16, 20, 20 + i * 16), fill=f, outline=(0, 0, 0)); d.text((26, 8 + i * 16), t, fill=(255, 255, 255), font=FONT)
for j_, (L, f) in enumerate(farben.items()): d.rectangle((8, 100 + j_ * 14, 18, 110 + j_ * 14), fill=f); d.text((24, 99 + j_ * 14), L, fill=(255, 255, 255), font=FONT)
img.save(os.path.join(W, 'bestandsaufnahme.png'))

aus_ = {'hinweis': 'Bestandsaufnahme (Messung, nichts gebaut): werkzeug/welt/bestandsaufnahme.py. Abstände zu Fuß in halber Auflösung, 4er-Nachbarschaft (etwas zu lang).',
        'orte': ORTE, 'groessere_orte_ohne_bank': [o['name'] for o in ORTE if o['ohne_bank']], 'bank_gebaeude_ohne_schalter': [o['name'] for o in ORTE if o['bank_gebaeude'] and not o['bankschalter_im_spiel']], 'luecke_weg': luecke, 'leer_ueber_150': leer, 'unerreichbar_von_orten': unerreichbar, 'gegner': gegner, 'arbeit': arbeit}
json.dump(aus_, open(os.path.join(W, 'bestandsaufnahme.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f"Orte: {len(ORTE)}, Lücke am Weg: {luecke}, Flächen > 150: {len(leer)}, Länder: {sorted(gegner)}")
