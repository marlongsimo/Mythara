"""
World Pipeline – Welt verdichten (Welt-Erlebnis, KANON 27.11.): die offene Welt soll beim Laufen nie leer wirken.
  1. Bewuchs: Baumgruppen und Büsche (Arten wie schon im Gebiet) auf freiem Land, bis höchstens ZIEL_LEER des Landes weiter als 10 Felder
     vom nächsten Objekt liegt.
  2. Kleinigkeiten am Weg: Feldsteine, Lesesteinhaufen, Zäune (längs zum Weg), Heuhaufen, Karren, Wegkreuze, Bildstöcke, selten Ruinen,
     Feldhütten und Brunnen (Modelle „wegrand_*“ von Figuren) – bis von jedem Wegfeld höchstens 12 Felder bis zur nächsten Kleinigkeit sind
     (also etwa alle 15–25 Felder etwas). Auf Wiesen Heu und Zäune, im Wald Steine, Wegkreuze und Ruinen.
  3. Tiere: Plätze für Weidetiere (Stimmung, Integration setzt die Figuren) neben Zäunen und Heu auf Wiesen.
Frei bleiben Wege, Wasser, Orte (Stadt/Dorf/Gehöft), Lesestellen, NPC-, Gegner-, Sammel-, Kräuter- und Fischplätze; 3 Felder Abstand zum Gebietsrand.
Eigene Objekte heißen „vd_…“ und werden bei jedem Lauf zuerst entfernt (wiederholbar, fester Zufall je Gebiet).
Läuft in der Kette nach baumdichte.mjs und vor bauen.mjs. Schreibt die Gebiete und welt/verdichten.json.
Aufruf (im Ordner realtime): python3 werkzeug/welt/verdichten.py [schritt …]   (ohne Angabe: alle fertigen Schritte)
"""
import json, os, sys, math, random
import numpy as np
from scipy import ndimage

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
lies = lambda *p: json.load(open(os.path.join(*p), encoding='utf8'))
ARTEN = {a['zeichen']: a for a in lies(W, 'bibliothek', 'gelaende.json')['arten']}
BIB = {o['id']: o for o in lies(W, 'bibliothek', 'objekte.json')['objekte']}
SCHRITTE = {   # Reihenfolge des Nutzers: Grenzland, dann Waldland, dann Westmark
    'grenzland': ['fl_186_198', 'westried', 'nordwald', 'nordsaum', 'osthof', 'obstwiesen', 'osthang', 'weidenhain'],
    'waldland': ['waldweg', 'waldmark'],
    'westmark': ['westmark'],
}
ZIEL_LEER, WEG_ABSTAND = 0.12, 12   # je Gebiet höchstens 4 + 3 Arten von Kleinigkeiten (Handy)
schritte = [a for a in sys.argv[1:] if a in SCHRITTE] or list(SCHRITTE)

# ───── was frei bleiben muss (Weltfelder) ─────
meiden = []   # (x, y, r)
for f in os.listdir(W):
    if f.endswith('_orte.json'):
        for n in lies(W, f).get('npc', []) or []:
            if 'x' in n: meiden.append((n['x'], n['y'], 3))
for p in lies(W, 'gegnerplaetze.json')['plaetze']: meiden.append((p['x'], p['y'], 2.5))
SM = lies(W, 'sammelstellen.json')
for g in SM['lichtungen'] + SM['senken'] + lies(RT, 'shared', 'holz_standorte.json')['lichtungen'] + lies(RT, 'shared', 'bergbau_standorte.json')['senken']:
    for q in g.get('baeume') or g.get('adern') or []: meiden.append((q['x'], q['y'], 4))
for k in lies(W, 'kraeuter_standorte.json')['stellen']: meiden.append((k['x'], k['y'], 3))
ORTE = []   # Bewuchs nicht in Orte
RAD = {'Stadt': 45, 'Dorf': 30, 'Gehöft': 18}
on = lies(W, 'ortsnamen.json')
for g in on['gebiete']:
    if g['art'] in RAD: ORTE.append((g['schrift'][0], g['schrift'][1], RAD[g['art']]))
for o in on['orte']:
    if o['art'] in RAD: ORTE.append((o['x'], o['y'], RAD[o['art']]))

def objekt_radius(o):
    k = o.get('kollision', BIB.get(o['objekt'], {}).get('kollision')); s = o.get('s', 1)
    if not k: return 0.6
    if k['art'] == 'kreis': return k['r'] * s + 0.3
    if k['art'] == 'rechteck': return math.hypot(k['b'], k['h']) / 2 * s + 0.3
    return max(math.hypot(b['x1'] - b['x0'], b['y1'] - b['y0']) / 2 for b in k['koerper']) * s + 0.5

WIESE, WALD = set('.,v'), set('ftj')
BEWUCHS_BODEN = WIESE | WALD
DEKOR_WIESE = [('wegrand_feldstein_1', 3), ('wegrand_feldstein_2', 2), ('wegrand_lesesteinhaufen', 2), ('wegrand_zaun_latten', 2), ('wegrand_zaun_flecht', 2), ('wegrand_zaun_stein', 1),
               ('wegrand_heuhaufen', 2), ('wegrand_heuballen_rund', 1), ('wegrand_karren_heu', 1), ('wegrand_wegkreuz_holz', 1), ('wegrand_bildstock', 1), ('wegrand_brunnen_feld', 0.4),
               ('wegrand_huette_feld', 0.4), ('wegrand_ruine_ecke', 0.3)]
DEKOR_WALD = [('wegrand_feldstein_1', 3), ('wegrand_feldstein_2', 2), ('wegrand_feldstein_3', 2), ('wegrand_lesesteinhaufen', 1), ('wegrand_wegkreuz_stein', 1), ('wegrand_wegkreuz_holz', 1),
              ('wegrand_bildstock', 1), ('wegrand_karren_kaputt', 1), ('wegrand_ruine_bogen', 0.5), ('wegrand_ruine_ecke', 0.5)]
TIERE = ['Schaf', 'Rind', 'Ziege', 'Huhn']

def gewichtet(rng, l):
    s = sum(w for _, w in l); z = rng.random() * s
    for o, w in l:
        z -= w
        if z <= 0: return o
    return l[-1][0]

ergebnis = {'hinweis': 'Verdichtung (verdichten.py): je Gebiet Bewuchs, Kleinigkeiten am Weg, Tierplätze. Weltfelder.', 'gebiete': {}, 'tiere': []}
for schritt in schritte:
    for n in SCHRITTE[schritt]:
        d = os.path.join(W, 'regionen', n); r = lies(d, 'region.json'); ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C
        G = np.array([list(l) for l in open(os.path.join(d, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]); H, B = G.shape
        obj = [o for o in lies(d, 'objekte.json') if not str(o.get('id', '')).startswith('vd_')]
        spiel = lies(d, 'spiel.json'); rng = random.Random('verdichten-' + n)
        geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)) and not ARTEN.get(c, {}).get('wasser', False))(G)
        weg = np.isin(G, list('ekpd')); dweg = ndimage.distance_transform_edt(~weg) if weg.any() else np.full((H, B), 99.0)
        rand = np.zeros((H, B), bool); rand[3:-3, 3:-3] = True
        nahe = [(x - ux, y - uy, rr) for x, y, rr in meiden if -10 < x - ux < B + 10 and -10 < y - uy < H + 10] + [(i['x'], i['y'], 3.5) for i in spiel.get('interaktionen', [])]
        verboten = np.zeros((H, B), bool); yy, xx = np.mgrid[0:H, 0:B]
        for x, y, rr in nahe:
            a, b = max(0, int(y - rr - 1)), min(H, int(y + rr + 2)); c, e = max(0, int(x - rr - 1)), min(B, int(x + rr + 2))
            verboten[a:b, c:e] |= (xx[a:b, c:e] + 0.5 - x) ** 2 + (yy[a:b, c:e] + 0.5 - y) ** 2 < rr * rr
        imOrt = np.zeros((H, B), bool)
        for x, y, rr in ORTE:
            x, y = x - ux, y - uy
            if -rr < x < B + rr and -rr < y < H + rr: imOrt |= (xx + 0.5 - x) ** 2 + (yy + 0.5 - y) ** 2 < rr * rr
        belegt = [(o['x'], o['y'], objekt_radius(o)) for o in obj]
        def frei(x, y, r, abst=0.8):
            for (a, b, rr) in belegt:
                if abs(a - x) < r + rr + abst and abs(b - y) < r + rr + abst and math.hypot(a - x, b - y) < r + rr + abst: return False
            return True
        neu = []
        # ── 1. Bewuchs ──
        pal = {}
        for o in obj:
            oid = o['objekt']
            if BIB.get(oid, {}).get('kategorie') == 'bewuchs' and oid.startswith('stil_') and not any(s in oid for s in ('schilf', 'erle_tot', 'samm_')): pal[oid] = pal.get(oid, 0) + 1
        if not pal: pal = {'stil_eiche_01': 3, 'stil_eiche_02': 3, 'stil_linde_01': 2, 'stil_birke_01': 2, 'stil_busch_01': 3, 'stil_busch_02': 2}
        PAL = list(pal.items())
        land = geh & ~weg & (G != 'p')
        def leer_feld():
            m = np.ones((H, B), bool)
            for (a, b, _) in belegt:
                i, j = int(a), int(b)
                if 0 <= i < B and 0 <= j < H: m[j, i] = False
            return ndimage.distance_transform_edt(m)
        gruppen = 0
        for runde in range(400):
            dl = leer_feld(); leer = land & (dl > 10)
            anteil = leer.sum() / max(1, land.sum())
            if anteil <= ZIEL_LEER: break
            kand = np.argwhere(leer & rand & ~verboten & ~imOrt & np.isin(G, list(BEWUCHS_BODEN)) & (dweg > 4))
            if not len(kand): break
            gesetzt = 0
            for _ in range(min(20, len(kand))):
                cy, cx = kand[rng.randrange(len(kand))]
                if dl[cy, cx] <= 10: continue
                for k in range(rng.randint(3, 7)):
                    a, rr = rng.random() * 6.283, rng.random() * 4.5
                    x, y = cx + 0.5 + math.cos(a) * rr, cy + 0.5 + math.sin(a) * rr; i, j = int(x), int(y)
                    if not (0 <= i < B and 0 <= j < H) or not rand[j, i] or verboten[j, i] or imOrt[j, i] or G[j, i] not in BEWUCHS_BODEN or dweg[j, i] < 2.5: continue
                    art = gewichtet(rng, PAL); o = {'id': f'vd_{n}_b{len(neu) + 1}', 'objekt': art, 'x': round(x, 2), 'y': round(y, 2), 's': round(0.85 + rng.random() * 0.3, 2)}
                    if rng.random() < 0.5: o['spiegeln'] = True
                    rad = objekt_radius(o)
                    if not frei(x, y, rad, 1.4): continue
                    neu.append(o); belegt.append((x, y, rad)); gesetzt += 1
                gruppen += 1
            if not gesetzt: break
        bewuchs = len(neu)
        # ── 2. Kleinigkeiten am Weg ──
        # je Gebiet nur wenige Arten (jede Art kostet auf dem Handy einen eigenen Zeichenaufruf): 4 für Wiesen, 3 für Wald, fest je Gebiet
        DW = sorted(rng.sample(DEKOR_WIESE[:10], 4)); DWA = sorted(rng.sample(DEKOR_WALD, 3))
        klein = [(o['x'], o['y']) for o in obj if BIB.get(o['objekt'], {}).get('kategorie') not in ('bewuchs', None)]
        dk = np.full((H, B), 999.0)
        def merke(x, y):
            a, b = max(0, int(y - 14)), min(H, int(y + 15)); c, e = max(0, int(x - 14)), min(B, int(x + 15))
            dk[a:b, c:e] = np.minimum(dk[a:b, c:e], np.hypot(xx[a:b, c:e] + 0.5 - x, yy[a:b, c:e] + 0.5 - y))
        for x, y in klein: merke(x, y)
        erledigt = np.zeros((H, B), bool); dekor = 0; tiere = []
        def rahmen(o):   # Bildrechteck in Feldern (wie test/welt-waldmark.test.mjs „Sichtbarkeit“)
            d = BIB[o['objekt']]; s_ = o.get('s', 1) * d.get('massstab', 1); bb, hh = d['groesse'][0] * s_ / 48, d['groesse'][1] * s_ / 48; ax = 1 - d['anker'][0] if o.get('spiegeln') else d['anker'][0]
            if d.get('sichtbar'): fx, fy = d['anker'][0] * d['groesse'][0], d['anker'][1] * d['groesse'][1]; return (o['x'] + (d['sichtbar'][0] - fx) * s_ / 48, o['y'] + (d['sichtbar'][1] - fy) * s_ / 48, o['x'] + (d['sichtbar'][2] - fx) * s_ / 48, o['y'] + (d['sichtbar'][3] - fy) * s_ / 48)
            return (o['x'] - ax * bb, o['y'] - d['anker'][1] * hh, o['x'] + (1 - ax) * bb, o['y'] + (1 - d['anker'][1]) * hh)
        kronen = [(o['y'], rahmen(o)) for o in obj + neu if BIB.get(o['objekt'], {}).get('kategorie') == 'bewuchs']
        def verdeckt(o):   # Baumkronen davor (südlich) bedecken mehr als 5 % des Bildes: man sähe die Kleinigkeit nicht
            r = rahmen(o); f = (r[2] - r[0]) * (r[3] - r[1]); su = 0
            for y_, k in kronen:
                if y_ > o['y'] - 0.6: su += max(0, min(r[2], k[2] + 0.6) - max(r[0], k[0] - 0.6)) * max(0, min(r[3], k[3] + 0.6) - max(r[1], k[1] - 0.6))   # Spielraum: bauen.mjs richtet noch auf Felder aus
            return su > 0.05 * f
        for _ in range(3000):
            offen = weg & ~erledigt & (dk > WEG_ABSTAND) & rand
            if not offen.any(): break
            wy, wx = np.argwhere(offen)[0]; erledigt[wy, wx] = True
            best = None
            for _v in range(60):
                a, rr = (3.3 + rng.random() * 2.8 if _v < 30 else rng.random() * 6.283), 2.5 + rng.random() * 3   # zuerst nördlich des Wegs: davor liegt der Weg, kein Baum verdeckt
                x, y = wx + 0.5 + math.cos(a) * rr, wy + 0.5 + math.sin(a) * rr; i, j = int(x), int(y)
                if not (0 <= i < B and 0 <= j < H) or not rand[j, i] or not geh[j, i] or weg[j, i] or verboten[j, i] or G[j, i] == 'p': continue
                wiese = G[j, i] in WIESE; art = gewichtet(rng, DW if wiese else DWA)
                o = {'id': f'vd_{n}_k{dekor + 1}', 'objekt': art, 'x': round(x, 2), 'y': round(y, 2)}
                k = BIB[art].get('kollision') or {}
                if k.get('art') == 'rechteck':   # längs zum Weg: steht der Weg eher senkrecht (Nord–Süd), um 90° drehen
                    a0, b0, c0, e0 = max(0, wy - 4), min(H, wy + 5), max(0, wx - 4), min(B, wx + 5); py, px = np.nonzero(weg[a0:b0, c0:e0])
                    if len(py) > 3 and np.ptp(py) > np.ptp(px): o['dreh'] = 90
                rad = objekt_radius(o)
                if dweg[j, i] < rad + 1.0 or not frei(x, y, rad, 1.0) or verdeckt(o): continue
                if rng.random() < 0.5 and 'zaun' not in art and 'brunnen' not in art: o['spiegeln'] = True
                best = o; break
            if not best: continue
            neu.append(best); belegt.append((best['x'], best['y'], objekt_radius(best))); merke(best['x'], best['y']); dekor += 1
            if G[int(best['y']), int(best['x'])] in WIESE and any(s in best['objekt'] for s in ('zaun', 'heu', 'karren_heu')) and rng.random() < 0.45:
                for _v in range(12):
                    a, rr = rng.random() * 6.283, 3 + rng.random() * 3; x, y = best['x'] + math.cos(a) * rr, best['y'] + math.sin(a) * rr; i, j = int(x), int(y)
                    if 0 <= i < B and 0 <= j < H and rand[j, i] and G[j, i] in WIESE and dweg[j, i] > 2.5 and not verboten[j, i] and frei(x, y, 0.5, 0.5):
                        tiere.append({'id': f'vd_tier_{n}_{len(tiere) + 1}', 'tier': rng.choice(TIERE), 'x': round(x + ux, 1), 'y': round(y + uy, 1), 'region': n}); belegt.append((x, y, 0.6)); break
        with open(os.path.join(d, 'objekte.json'), 'w', encoding='utf8') as f:
            f.write('[\n' + ',\n'.join(' ' + json.dumps(q, ensure_ascii=False, separators=(',', ':')) for q in obj + neu) + ('\n' if obj or neu else '') + ']\n')
        ergebnis['gebiete'][n] = {'schritt': schritt, 'bewuchs': bewuchs, 'gruppen': gruppen, 'kleinigkeiten': dekor, 'tiere': len(tiere)}; ergebnis['tiere'] += tiere
        print(f'{n}: {bewuchs} Bewuchs, {dekor} Kleinigkeiten am Weg, {len(tiere)} Tierplätze')
json.dump(ergebnis, open(os.path.join(W, 'verdichten.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
