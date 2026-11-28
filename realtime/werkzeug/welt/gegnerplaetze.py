"""
World Pipeline – Gegnerdichte (#130, 27.11.2026): Gegnerplätze über die ganze Oberwelt, damit man nie weit laufen muss, um etwas anzugreifen.
Regel (Kanon „Gegnerdichte“): außerhalb von Städten, Dörfern, Questorten und Bedienstellen ist von jedem begehbaren Feld der nächste Gegnerplatz höchstens ~25 Felder entfernt.
  1. vorhandene Lager zuerst (werkzeug/weltzonen.py, BESONDERS) und die Plätze aus dem Süden (welt/sueden_orte.json)
  2. ein Wabengitter (Abstand 40 → höchstens ~23 Felder bis zum nächsten Punkt), jeder Punkt auf das nächste freie Feld abseits der Wege
  3. Lücken füllen, bis alles abgedeckt ist
Gegner nach Land (Stufe) und Gelände (Wald, Wiese, Moor, Heide, Wüste, Küste, Fels, Schnee) – vorhandene Gegner zuerst, sonst Vorschläge aus den Konzepten
(„fehlend“: braucht ein Modell). Schreibt welt/gegnerplaetze.json (Plätze je Region, Ausnahmen mit Grund, fehlende Modelle, Gegner je Gebiet).
Die Gegnerwerte und den Einbau in weltzonen.py macht Systeme/Integration. Test: test/welt-gegnerdichte.test.mjs
Aufruf (im Ordner realtime): python3 werkzeug/welt/gegnerplaetze.py
"""
import json, os, re, math
import numpy as np
from scipy import ndimage

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt')
X0, Y0, B, H, C = 186 * 32, 155 * 32, 75 * 32, 99 * 32, 32
REICHWEITE = 25
arten = {a['zeichen']: a['begehbar'] for a in json.load(open(os.path.join(W, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
G = np.full((H, B), 'M', dtype='<U1'); REG = np.full((H, B), '', dtype=object); regionen = {}
for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf'): continue
    x0, y0 = r['ursprung'][0] * C - X0, r['ursprung'][1] * C - Y0
    if x0 < 0 or y0 < 0 or x0 >= B or y0 >= H: continue
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z]); REG[y0:y0 + len(z), x0:x0 + len(z[0])] = n
    regionen[n] = {**r, 'x0': x0, 'y0': y0, 'spiel': json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8'))}
geh = np.vectorize(lambda c: bool(arten.get(c, False)))(G)
weg = np.isin(G, list('ekpd'))

# ───── Ausnahmen (mit Grund) ─────
ausnahmen = []
on = json.load(open(os.path.join(W, 'ortsnamen.json'), encoding='utf8'))
RADIUS = {'Stadt': 42, 'Dorf': 28, 'Gehöft': 18, 'Ort': 16, 'Ruine': 12, 'Kreuzung': 8, 'Wegmarke': 8}
for g in on['gebiete']:
    if g['art'] in ('Stadt', 'Dorf', 'Gehöft'): ausnahmen.append({'x': g['schrift'][0], 'y': g['schrift'][1], 'r': RADIUS[g['art']], 'grund': f"{g['art']} {g['name']}"})
for o in on['orte']:
    if o['art'] in RADIUS: ausnahmen.append({'x': o['x'], 'y': o['y'], 'r': RADIUS[o['art']], 'grund': f"{o['art']} {o['name']}"})
SUED = json.load(open(os.path.join(W, 'sueden_orte.json'), encoding='utf8'))
for k, (x, y) in SUED['orte'].items():
    if not k.startswith(('lager_', 'steinbruch', 'waldsenke')): ausnahmen.append({'x': x, 'y': y, 'r': 16, 'grund': f'Ort {k} (Süden)'})
# Graufurt: die Stadt in den Mauern (die Region ist größer: Furtklamm, Ostufer des Flusses)
ausnahmen = [a for a in ausnahmen if a['grund'] != 'Stadt Graufurt'] + [{'x': 6689, 'y': 6515, 'r': 48, 'grund': 'Stadt Graufurt (Mauerring, Hafen)'}]
for n, r in regionen.items():
    for i in r['spiel'].get('interaktionen', []): ausnahmen.append({'x': r['x0'] + X0 + i['x'], 'y': r['y0'] + Y0 + i['y'], 'r': 6, 'grund': f"Questort/Lesestelle {i['id']}"})
for s in json.load(open(os.path.join(W, 'bedienstellen.json'), encoding='utf8'))['stationen']: ausnahmen.append({'x': s['x'], 'y': s['y'], 'r': 8, 'grund': f"Bedienstelle {s['id']}"})
# Sammelstellen (#142): Baumgruppen und Senken frei von Gegnern
_sm = os.path.join(W, 'sammelstellen.json')
if os.path.exists(_sm):
    _S = json.load(open(_sm, encoding='utf8'))
    _SH = json.load(open(os.path.join(RT, 'shared', 'holz_standorte.json'), encoding='utf8'))['lichtungen'] + json.load(open(os.path.join(RT, 'shared', 'bergbau_standorte.json'), encoding='utf8'))['senken']   # auch, was Integration schon übernommen hat (gilt in der Welt)
    for _l in _S['lichtungen'] + _S['senken'] + _SH:
        _p = _l.get('baeume') or _l.get('adern'); _mx = _l.get('x', sum(q['x'] for q in _p) / len(_p)); _my = _l.get('y', sum(q['y'] for q in _p) / len(_p))
        ausnahmen.append({'x': _mx, 'y': _my, 'r': max(8, max(math.hypot(q['x'] - _mx, q['y'] - _my) for q in _p) + 6), 'grund': f"Sammelstelle {_l['name']}"})
for s in json.load(open(os.path.join(W, 'troedler_standorte.json'), encoding='utf8'))['standorte']: ausnahmen.append({'x': s['x'], 'y': s['y'], 'r': 6, 'grund': f"Trödler {s['id']}"})
# Sperren (Welt-Erlebnis): auf dem Bergsturz und im Schneesturm keine Gegner (sperren.py)
_sp = os.path.join(W, 'sperren.json')
if os.path.exists(_sp):
    for _k, _n in (('drachenarm', 'Bergsturz am Drachenarm'), ('frostkrone', 'Schneesturm an der Frostkrone')):
        for _p in json.load(open(_sp, encoding='utf8'))[_k]['kette'][::3]: ausnahmen.append({'x': _p[0] + 0.5, 'y': _p[1] + 0.5, 'r': 4, 'grund': _n})
# Hauptstadt Steinhag (#167): in der Ringmauer und ~12 Felder davor keine Gegner (Kreise im Raster, damit die Prüfung sie kennt)
_ho = os.path.join(W, 'hochlande_orte.json')
_fo = os.path.join(W, 'fahleweiten_orte.json')
_mauern = ([(json.load(open(_ho, encoding='utf8'))['hauptstadt']['mauer'], 'Stadt Steinhag (Ringmauer)')] if os.path.exists(_ho) and json.load(open(_ho, encoding='utf8')).get('hauptstadt') else []) + \
          ([(json.load(open(_fo, encoding='utf8'))['grauwacht']['mauer'], 'Stadt Grauwacht (Stadtmauer, #171)')] if os.path.exists(_fo) and json.load(open(_fo, encoding='utf8')).get('grauwacht') else []) + \
          ([([6370] + json.load(open(os.path.join(W, 'kielmund_orte.json'), encoding='utf8'))['mauer'][1:], 'Stadt Kielmund (Stadtmauer und Hafen, #174)')] if os.path.exists(os.path.join(W, 'kielmund_orte.json')) else []) + \
          ([((lambda c: [c[0] - 66, c[1] - 50, c[0] + 74, c[1] + 54])(json.load(open(os.path.join(W, 'ockerlande_orte.json'), encoding='utf8'))['orte']['rotlehm']), 'Stadt Rotlehm (#172)')] if os.path.exists(os.path.join(W, 'ockerlande_orte.json')) else [])
for _m, _grund in _mauern:
    for _x in range(int(_m[0]) - 4, int(_m[2]) + 5, 12):
        for _y in range(int(_m[1]) - 4, int(_m[3]) + 5, 12): ausnahmen.append({'x': _x, 'y': _y, 'r': 17, 'grund': _grund})
AUS = np.zeros((H, B), bool); yy, xx = np.mgrid[0:H, 0:B]
for a in ausnahmen:
    cx, cy, r = int(a['x'] - X0), int(a['y'] - Y0), int(math.ceil(a['r']))
    if not (0 <= cx < B and 0 <= cy < H): continue
    ys, xs = slice(max(0, cy - r), min(H, cy + r + 1)), slice(max(0, cx - r), min(B, cx + r + 1))
    AUS[ys, xs] |= (xx[ys, xs] - cx) ** 2 + (yy[ys, xs] - cy) ** 2 <= a['r'] ** 2
# kleine Inselchen (Riedbulten, Felsen im Meer): keine Gegner nötig
lab, nlab = ndimage.label(geh); groesse = ndimage.sum(np.ones_like(lab), lab, range(1, nlab + 1))
gross = np.isin(lab, np.where(groesse >= 400)[0] + 1)
BEREICH = geh & ~AUS & gross            # hier muss ein Gegnerplatz in Reichweite sein
frei_wegrand = ndimage.distance_transform_edt(~weg) > 2.5
PLATZ = BEREICH & frei_wegrand & ~ndimage.binary_dilation(AUS, iterations=2)   # hier darf ein Gegnerplatz stehen (2 Felder Abstand zu den Ausnahmen)
print(f'begehbar {int(geh.sum())}, abzudecken {int(BEREICH.sum())} Felder; {len(ausnahmen)} Ausnahmen')

# ───── Länder und Stufen ─────
LAND = {'Das Grenzland': (5, 20), 'Die Fahlen Weiten': (30, 50), 'Die Glutsande': (40, 60), 'Die Smaragdküste': (5, 35), 'Die Hochlande': (45, 60), 'Die Frostkrone': (60, 75),
        'Der Drachenarm': (60, 75), 'Die Ockerlande': (45, 60), 'Das Weiße Ende': (70, 90)}
ALT = {'waldweg': (1, 5), 'obstwiesen': (1, 5), 'osthof': (1, 5), 'westried': (8, 18), 'westmark': (10, 18), 'nordwald': (12, 18), 'nordsaum': (15, 22), 'osthang': (18, 24), 'graufurt': (20, 26),
       'rabenmoor': (8, 14), 'aschenwerth': (10, 16), 'ostufer': (45, 50), 'waldmark': (1, 3), 'weidenhain': (1, 5)}
meerabstand = ndimage.distance_transform_edt(G != 'M')
def land_von(n, x, y):
    if n in ALT: return n, ALT[n]
    name = regionen[n]['name']
    if name == 'Die Smaragdküste': return ('Küste', (20, 40)) if meerabstand[y, x] < 45 else ('Süden', (5, 35))
    if name == 'Das Grenzland': return 'Grenzland', LAND[name]
    return name, LAND.get(name, (30, 50))
def gelaende_von(x, y):
    c = G[y, x]
    if meerabstand[y, x] < 12: return 'küste'
    return {'f': 'wald', 'j': 'wald', '.': 'wiese', ',': 'wiese', 'a': 'wiese', 'v': 'moor', 't': 'moor', 'm': 'moor', 'o': 'moor', 'T': 'heide', 'g': 'fels', 'y': 'wüste', 'u': 'wüste', 's': 'küste', 'S': 'schnee', 'h': 'fels'}.get(c, 'wiese')

# Gegner: vorhanden (shared/config.ts MONSTER) zuerst; „neu“ = Vorschlag aus den Konzepten, Modell fehlt
VORHANDEN = {'bandit_dolch': 1, 'mooshocker': 1, 'kroetchen': 2, 'schlammkroete': 8, 'irrlicht': 10, 'moorleiche': 12, 'waldgolem': 15, 'bandit_spaeher': 18, 'bandit_schlaeger': 22, 'bandit_armbrust': 24}
NEU = {  # Gegner-Idee: (Stufe, Gelände, Herkunft)
    'feldhase': (3, 'wiese', 'Süden #120'), 'kraehenschwarm': (4, 'wiese', 'Süden #120'), 'wildbienen_schwarm': (8, 'wiese', 'Süden #120'), 'schilfkroete': (12, 'moor', 'Süden #120'),
    'fuchs': (14, 'wald', 'Süden #120'), 'wildschwein': (18, 'wald', 'Süden #120'), 'steinschlucker': (26, 'fels', 'Süden #120'), 'graupelz': (30, 'wald', 'Süden #120'),
    'strandkrabbe': (22, 'küste', 'Phase 10'), 'seevogel': (26, 'küste', 'Phase 10'), 'riesenkrabbe': (34, 'küste', 'Phase 10'), 'mangrovenlurch': (38, 'moor', 'Phase 10'),
    'heidewolf': (32, 'heide', 'Phase 8'), 'wiedergaenger': (38, 'heide', 'Phase 8'), 'grabwaechter': (48, 'fels', 'Phase 8'),
    'sandkriecher': (42, 'wüste', 'Phase 9'), 'glutskorpion': (48, 'wüste', 'Phase 9'), 'glutgeist': (56, 'wüste', 'Phase 9'),
    'schlickkrebs': (45, 'küste', 'Phase 7'), 'splitterreiher': (50, 'wiese', 'Phase 7'),
    'bergtroll': (58, 'fels', 'neu (Hochlande)'), 'hochlandwidder': (52, 'wiese', 'neu (Hochlande)'), 'steppenwolf': (46, 'wiese', 'neu (Ockerlande/Glutsande)'), 'klippenadler': (56, 'küste', 'neu (Küsten der hohen Länder)'), 'tundraelch': (62, 'heide', 'neu (Frostkrone/Fahle Weiten Nord)'), 'hochlandbaer': (54, 'wald', 'neu (Hochlande)'), 'frostwolf': (64, 'schnee', 'neu (Frostkrone)'), 'eisgolem': (72, 'schnee', 'neu (Frostkrone)'),
    'drakling': (66, 'fels', 'neu (Drachenarm)'), 'ockerhyaene': (50, 'wüste', 'neu (Ockerlande)'), 'schneegeist': (82, 'schnee', 'neu (Weißes Ende)')}
# vorhandene Modelle in neuer Rolle (Grundsatz: Vorhandenes zuerst): Banditen als Deserteure, Karawanen- und Strandräuber
UMBENANNT = {'deserteur_schwert': ('bandit_schlaeger', 42, 'heide'), 'deserteur_armbrust': ('bandit_armbrust', 44, 'heide'), 'karawanenraeuber': ('bandit_schlaeger', 50, 'wüste'),
             'strandraeuber': ('bandit_armbrust', 30, 'küste'), 'wegelagerer': ('bandit_spaeher', 20, 'wiese')}
WAHL = {  # Gelände → Kandidaten (vorhanden oder neu)
    'wald': ['bandit_dolch', 'mooshocker', 'waldgolem', 'fuchs', 'wildschwein', 'bandit_spaeher', 'heidewolf', 'hochlandbaer'],   # der Graupelz bleibt einzeln in seiner Waldsenke (#120)
    'wiese': ['mooshocker', 'bandit_dolch', 'feldhase', 'kraehenschwarm', 'bandit_spaeher', 'wegelagerer', 'bandit_schlaeger', 'bandit_armbrust', 'steppenwolf', 'splitterreiher', 'hochlandwidder'],
    'moor': ['kroetchen', 'schlammkroete', 'irrlicht', 'moorleiche', 'schilfkroete', 'mangrovenlurch'],
    'heide': ['bandit_spaeher', 'heidewolf', 'wiedergaenger', 'deserteur_schwert', 'deserteur_armbrust', 'grabwaechter', 'tundraelch'],
    'fels': ['waldgolem', 'steinschlucker', 'grabwaechter', 'bergtroll', 'drakling'],
    'wüste': ['bandit_schlaeger', 'sandkriecher', 'glutskorpion', 'karawanenraeuber', 'ockerhyaene', 'glutgeist'],
    'küste': ['strandkrabbe', 'seevogel', 'strandraeuber', 'riesenkrabbe', 'schlickkrebs', 'klippenadler'],
    'schnee': ['frostwolf', 'eisgolem', 'schneegeist']}
def stufe_von(g):
    if g in VORHANDEN: return VORHANDEN[g]
    if g in UMBENANNT: return UMBENANNT[g][1]
    return NEU[g][0]
# Länder mit eigener Tierwelt (Konzept): die Hochlande (Phase 11, #147) – Widder auf den Almen, Steppenwolf unten, Bär im Wald, Troll im Geröll, Adler an den Klippen
LAND_WAHL = {'Die Hochlande': {'wald': ['hochlandbaer'], 'wiese': ['hochlandwidder', 'steppenwolf'], 'fels': ['bergtroll'], 'küste': ['klippenadler'],
                               'heide': ['steppenwolf', 'hochlandwidder'], 'schnee': ['bergtroll'], 'moor': ['hochlandwidder'], 'wüste': ['steppenwolf']}}
def waehle(gel, lo, hi, k, land=None):
    if land in LAND_WAHL: kand = LAND_WAHL[land].get(gel) or LAND_WAHL[land]['wiese']; return kand[(k * 7 + k // 5) % len(kand)]
    kand = [g for g in WAHL[gel] if lo - 6 <= stufe_von(g) <= hi + 4] or sorted(WAHL[gel] + [g for v in WAHL.values() for g in v], key=lambda g: min(abs(stufe_von(g) - lo), abs(stufe_von(g) - hi)))[:3]
    kand.sort(key=lambda g: (g not in VORHANDEN and g not in UMBENANNT, abs(stufe_von(g) - (lo + hi) / 2)))   # vorhandene zuerst
    return kand[(k * 7 + k // 5) % min(len(kand), 4)]   # bis zu vier passende im Wechsel

# ───── 1. vorhandene Plätze ─────
zentren, plaetze = [], []
src = open(os.path.join(RT, 'werkzeug', 'weltzonen.py'), encoding='utf8').read()
for art, x, y in re.findall(r'\("(\w+)",\s*(\d{4,5}),\s*(\d{4,5})\)', src):
    if art == 'zielscheibe' or not (0 <= int(x) - X0 < B and 0 <= int(y) - Y0 < H): continue   # Untergrund liegt außerhalb
    zentren.append((int(x) - X0, int(y) - Y0))
vorhandene = len(zentren)
for g in SUED['gegner']: zentren.append((int(g['x']) - X0, int(g['y']) - Y0)); plaetze.append({'id': g['id'], 'x': g['x'], 'y': g['y'], 'gegner': g['gegner'], 'stufe': g['stufe'], 'quelle': 'Süden #120'})
print(f'vorhanden: {vorhandene} Lager-Gegner (weltzonen.py), {len(SUED["gegner"])} Plätze aus #120')

# ───── 2. Wabengitter ─────
D = 40; neu_pkt = []
naechster = ndimage.distance_transform_edt(~PLATZ, return_indices=True)[1]
for j, y in enumerate(range(D // 2, H, int(D * 0.866))):
    for x in range((D // 2) if j % 2 == 0 else D, B, D):
        if not BEREICH[max(0, y - 12):y + 12, max(0, x - 12):x + 12].any(): continue
        py, px = naechster[0][y, x], naechster[1][y, x]
        if PLATZ[py, px] and math.hypot(px - x, py - y) < 14: neu_pkt.append((px, py))
# ───── 3. Lücken füllen ─────
AUSRAND_FREI = ~ndimage.binary_dilation(AUS, iterations=2)
for runde in range(12):
    alle = zentren + neu_pkt; Z = np.ones((H, B), bool)
    for x, y in alle:
        if 0 <= x < B and 0 <= y < H: Z[y, x] = False
    d = ndimage.distance_transform_edt(Z); offen = BEREICH & (d > REICHWEITE - 1)
    n_offen = int(offen.sum()); print(f'Runde {runde}: {len(alle)} Plätze, {n_offen} Felder ohne Gegner in Reichweite')
    if not n_offen: break
    l2, n2 = ndimage.label(offen)
    for i, (sy, sx) in enumerate(ndimage.center_of_mass(offen, l2, range(1, n2 + 1))):
        cy, cx = int(sy), int(sx); py, px = naechster[0][cy, cx], naechster[1][cy, cx]
        if not PLATZ[py, px] or math.hypot(px - cx, py - cy) > 20:   # kein Platz nah genug: ein Feld des Lochs selbst nehmen (abseits der Wege, wenn möglich)
            ys, xs = np.where((l2 == i + 1) & AUSRAND_FREI)
            if not len(ys): ys, xs = np.where(l2 == i + 1)
            k = len(ys) // 2; py, px = ys[k], xs[k]
        neu_pkt.append((px, py))

# ───── Gegner zuweisen ─────
# Gegner mit Werten in shared/config.ts (MONSTER) gelten als vorhanden – so werden neu gebaute Gegner (z. B. Steppenwolf, fab2fde5) ohne Handarbeit erkannt
IN_CONFIG = set(re.findall(r'^\s{2}(\w+): \{ name:', open(os.path.join(RT, 'shared', 'config.ts'), encoding='utf8').read(), re.M))
fehlend, je_region = {}, {}
# Stabil (27.11.): ein Platz, der schon im letzten Lauf an derselben Stelle stand, behält Gegner und Anzahl (solange das Land dasselbe ist);
# neue Plätze wählen nach einer festen Zahl aus ihrer Lage statt nach ihrer Nummer – so verschiebt ein neuer Ort nicht die Gegner der ganzen Welt
_alt = os.path.join(W, 'gegnerplaetze.json')
ALT_GP = {(p['x'], p['y']): p for p in (json.load(open(_alt, encoding='utf8')).get('plaetze', []) if os.path.exists(_alt) else []) if p['id'].startswith('gp_')}
for k, (x, y) in enumerate(neu_pkt):
    n = REG[y, x] or '?'; land, (lo, hi) = land_von(n, x, y) if n != '?' else ('?', (5, 20)); gel = gelaende_von(x, y)
    h = (int(x + X0) * 73856093 ^ int(y + Y0) * 19349663) & 0x7fffffff; a = ALT_GP.get((int(x + X0) + 0.5, int(y + Y0) + 0.5))
    if a and a.get('land') == land: g, anzahl = a['gegner'][0], a.get('anzahl', 1)
    else: g = waehle(gel, lo, hi, h % 997, land); anzahl = 3 if h % 6 == 0 else 2 if h % 3 == 0 else 1
    modell = UMBENANNT[g][0] if g in UMBENANNT else g
    quelle = 'vorhanden' if g in VORHANDEN else ('vorhanden (' + UMBENANNT[g][0] + ')') if g in UMBENANNT else 'vorhanden (Systeme)' if g in IN_CONFIG and NEU[g][2].startswith('neu') else 'fehlt' if NEU[g][2].startswith('neu') else 'vorhanden (Figuren)'   # Figuren hat die Gegner der Konzepte gebaut (Zweig claude/tender-heisenberg-bruby2, Leitstelle 27.11.)
    if quelle == 'fehlt': f = fehlend.setdefault(g, {'gegner': g, 'stufe': NEU[g][0], 'gelaende': NEU[g][1], 'herkunft': NEU[g][2], 'plaetze': 0}); f['plaetze'] += 1
    plaetze.append({'id': f'gp_{n}_{k + 1}', 'region': n, 'land': land, 'x': int(x + X0) + 0.5, 'y': int(y + Y0) + 0.5, 'gegner': [g], 'modell': modell, 'anzahl': anzahl, 'stufe': stufe_von(g), 'gelaende': gel, 'quelle': quelle})
    e = je_region.setdefault(n, {'plaetze': 0, 'gegner': 0}); e['plaetze'] += 1; e['gegner'] += anzahl
aus = {'hinweis': 'Gegnerdichte (#130): Gegnerplätze der ganzen Oberwelt (Weltfelder). Von jedem begehbaren Feld außerhalb der Ausnahmen ist der nächste Platz höchstens ~25 Felder entfernt '
                  '(vorhandene Lager aus weltzonen.py zählen mit). quelle: vorhanden | vorhanden (Modell in neuer Rolle) | vorhanden (Figuren, noch nicht auf feature) | fehlt (Modell nötig, Entscheidung des Nutzers). Erzeugt von werkzeug/welt/gegnerplaetze.py.',
       'reichweite': REICHWEITE, 'vorhandene_lager': vorhandene, 'plaetze': plaetze, 'fehlend': sorted(fehlend.values(), key=lambda f: f['stufe']),
       'je_region': dict(sorted(je_region.items(), key=lambda kv: -kv[1]['gegner'])),
       'ausnahmen': [a for a in ausnahmen if not a['grund'].startswith(('Questort', 'Bedienstelle', 'Trödler'))] + [{'grund': 'Questorte/Lesestellen (r 6), Bedienstellen (r 8), Trödler (r 6)', 'anzahl': sum(a['grund'].startswith(('Questort', 'Bedienstelle', 'Trödler')) for a in ausnahmen)},
                     {'grund': 'Wasser, Fels und Gebirge (nicht begehbar), Inselchen unter 400 Feldern, Untergrund (Dungeons mit eigenen Gegnern)'}]}
json.dump(aus, open(os.path.join(W, 'gegnerplaetze.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'Gegnerplätze: {len(plaetze)} ({len(neu_pkt)} neu), {sum(p.get("anzahl", 1) for p in plaetze)} Gegner; fehlende Modelle: {len(fehlend)}')
