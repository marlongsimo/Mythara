"""
World Pipeline – Sperren am Drachenarm und an der Frostkrone (Welt-Erlebnis, KANON 27.11.): bis Quests sie freischalten, bleibt der Weg zu.
  Drachenarm: ein Bergsturz am Hals (Felsen und Trümmer zwischen Südküste und Bucht), zwei Wachen der Hochlande davor (Plätze für Figuren/Quests).
  Frostkrone: ein Schneesturm (dichte Wand aus Sturmstücken) von der großen Bucht bis zur Felszunge an der Nordküste, 40 Felder nordwestlich
              des Grauhorn-Grats – Grauhorn, Hochpass, Passwacht, die Furt und die Nordklippen bleiben offen.
Alle Sperrstücke tragen „ausbau_bis“ (drachenarm_frei bzw. frostkrone_frei, shared/stadtstufen.ts): solange es diese Stufe nicht gibt oder ihr
Schalter aus ist, sind sie da und sperren (eigene Sperrfelder je Chunk). Schaltet eine Quest den Schalter an, verschwinden sie für diesen Spieler.
Die Sperrlinien werden einmal als kürzeste Kette begehbarer Felder zwischen zwei Hindernissen berechnet und in welt/sperren.json gemerkt
(stabil über alle Läufe; neu nur mit --neu). Schreibt welt/festland/plan_sperren.json (festland.py) und welt/sperren.json.
Aufruf (im Ordner realtime): python3 werkzeug/welt/sperren.py [--neu], danach die Kette ab festland.py.
"""
import json, os, sys, math
from collections import deque
import numpy as np
from scipy import ndimage

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt')
C = 32; KX = [186, 201, 216, 231, 246, 261]; KY = [155, 169, 183, 198]   # Kachelgrenzen der Festland-Regionen (festland.py)
DATEI = os.path.join(W, 'sperren.json'); alt = json.load(open(DATEI, encoding='utf8')) if os.path.exists(DATEI) else {}
NEU = '--neu' in sys.argv

# ───── Sperrlinien (nur beim ersten Lauf oder mit --neu): Gelände der Regionen, begehbar mit Freigaben ─────
def linien():
    X0, Y0, B, H = 186 * C, 155 * C, 75 * C, 99 * C
    ARTEN = {a['zeichen']: a for a in json.load(open(os.path.join(W, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
    G = np.full((H, B), 'M', dtype='<U1'); FREI = []
    for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
        p = os.path.join(W, 'regionen', n, 'region.json')
        if not os.path.exists(p): continue
        r = json.load(open(p, encoding='utf8'))
        if r.get('ebene') or r.get('entwurf'): continue
        ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C; x0, y0 = ux - X0, uy - Y0
        if x0 < 0 or y0 < 0 or x0 >= B or y0 >= H: continue
        z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
        G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z])
        for f in json.load(open(os.path.join(W, 'regionen', n, 'spiel.json'), encoding='utf8')).get('kollision', {}).get('freigeben', []):
            if 'x0' in f: FREI.append((f['x0'] + ux, f['y0'] + uy, f['x1'] + ux, f['y1'] + uy))
    geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)))(G)
    for a, b, c, d in FREI: geh[int(b) - Y0:int(math.ceil(d)) - Y0, int(a) - X0:int(math.ceil(c)) - X0] = True
    def schnitt(x0, x1, y0, y1, pa, pb, verbot=None):
        """kürzeste Kette begehbarer Felder (8er-Nachbarschaft) zwischen zwei Hindernisflächen; Hindernisse kosten nichts"""
        gs = geh[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]; H2, W2 = gs.shape
        hl, _ = ndimage.label(~gs, structure=np.ones((3, 3))); la, lb = hl[pa[1] - y0, pa[0] - x0], hl[pb[1] - y0, pb[0] - x0]
        assert la and lb and la != lb, f'Hindernisse {pa} {pb} falsch'
        yy, xx = np.mgrid[y0:y1, x0:x1]; nein = verbot(xx, yy) if verbot else np.zeros(gs.shape, bool)
        D = np.full(gs.shape, 10 ** 9); prev = {}; dq = deque()
        for y, x in zip(*np.nonzero(hl == la)): D[y, x] = 0; dq.append((y, x))
        while dq:
            y, x = dq.popleft()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if (dy or dx) and 0 <= ny < H2 and 0 <= nx < W2:
                        c = (10 ** 6 if nein[ny, nx] else 1) if gs[ny, nx] else 0; nd = D[y, x] + c
                        if nd < D[ny, nx]: D[ny, nx] = nd; prev[(ny, nx)] = (y, x); (dq.append if c else dq.appendleft)((ny, nx))
        _, y, x = min((D[y, x], y, x) for y, x in zip(*np.nonzero(hl == lb))); kette = []; c = (y, x)
        while c in prev:
            if gs[c]: kette.append([int(c[1] + x0), int(c[0] + y0)])
            c = prev[c]
        return kette
    # Drachenarm: am Hals zwischen dem Meer im Südwesten und der Bucht im Norden (über den Felskopf bei 8000|6025)
    dr = schnitt(7850, 8150, 5880, 6080, (7870, 6060), (8000, 5960))
    # Frostkrone: große Bucht (6640|5640) bis zur Felszunge an der Nordküste (7150|5380), mindestens 40 Felder nordwestlich der Achse des Grauhorn-Grats
    fr = schnitt(6600, 7250, 5180, 5760, (6640, 5640), (7150, 5380), verbot=lambda x, y: ((x - 6880) * -270 + (y - 5720) * -230) / 354.0 < 40)
    return dr, fr

if NEU or 'drachenarm' not in alt or 'frostkrone' not in alt:
    dr, fr = linien()
else:
    dr, fr = alt['drachenarm']['kette'], alt['frostkrone']['kette']

# ───── Sperrstücke: je 3 Felder der Kette ein Stück, Rechteck um diese Felder + 1 Feld rundum (auch schräg dicht), an Regionsgrenzen geteilt ─────
def stuecke(kette, je=3):
    for i in range(0, len(kette), je):
        g = kette[i:i + je]; ax, ay = min(p[0] for p in g) - 1, min(p[1] for p in g) - 1; bx, by = max(p[0] for p in g) + 2, max(p[1] for p in g) + 2
        xs = [ax] + [k * C for k in KX if ax < k * C < bx] + [bx]; ys = [ay] + [k * C for k in KY if ay < k * C < by] + [by]
        for x0, x1 in zip(xs, xs[1:]):
            for y0, y1 in zip(ys, ys[1:]): yield x0, y0, x1, y1
objekte, interaktionen = [], []
def stueck(id, objekt, x0, y0, x1, y1, stufe, mehr={}):
    ax, ay = (x0 + x1) / 2, y1 - 0.02      # Fußpunkt unten in der Mitte, sicher in derselben Region
    objekte.append({'id': id, 'objekt': objekt, 'x': round(ax, 2), 'y': round(ay, 2), 'ausbau_bis': stufe,
                    'kollision': {'art': 'rechteck', 'x': round(x0 - ax, 2), 'y': round(y0 - ay, 2), 'b': round(x1 - x0, 2), 'h': round(y1 - y0, 2)}, **mehr})
def lies(id, x, y, text): interaktionen.append({'id': id, 'art': 'lesen', 'x': round(x, 2), 'y': round(y, 2), 'radius': 2.2, 'abgleich': 'keiner', 'daten': {'text': text}})
FELSEN = ['k_fels_gross', 'k_fels_breit', 'k_fels_klein']

# Drachenarm: Felsen auf der Kette, Trümmer davor; Wachen und Hinweis auf der Hochlande-Seite (Nordwest)
for i, (x0, y0, x1, y1) in enumerate(stuecke(dr, 2)): stueck(f'bergsturz_fels_{i + 1}', FELSEN[i % 3], x0, y0, x1, y1, 'drachenarm_frei', {'spiegeln': i % 2 == 1})
mx, my = sum(p[0] for p in dr) / len(dr), sum(p[1] for p in dr) / len(dr); dx, dy = dr[-1][0] - dr[0][0], dr[-1][1] - dr[0][1]; L = math.hypot(dx, dy)
nx, ny = -dy / L, dx / L
if nx * -1 + ny * -1 < 0: nx, ny = -nx, -ny          # Normale zur Hochlande-Seite (Nordwest)
for k, t in enumerate([-0.35, -0.1, 0.2, 0.45]):
    objekte.append({'id': f'bergsturz_truemmer_{k + 1}', 'objekt': 'k_truemmer', 'x': round(mx + dx * t + nx * 3.2, 2), 'y': round(my + dy * t + ny * 3.2, 2), 'ausbau_bis': 'drachenarm_frei', 'kollision': None})
WACHEN = [[7996.5, 6020.5], [8001.5, 6014.5]]   # vor den Felsen auf der Hochlande-Seite, begehbar (geprüft im Test welt-sperren)
lies('bergsturz_drachenarm', 7998.5, 6017.5, 'Ein Bergsturz hat den Hals des Drachenarms verschüttet. Felsen, so hoch wie ein Haus – dahinter geht es nicht weiter.')

# Frostkrone: Sturmstücke auf der Kette; Hinweise auf der offenen Seite (Südost) etwa alle 60 Felder
for i, (x0, y0, x1, y1) in enumerate(stuecke(fr, 3)): stueck(f'schneesturm_{i + 1}', 'moor_nebel_01', x0, y0, x1, y1, 'frostkrone_frei')
hinweise = []
for j in range(20, len(fr), 60):
    x, y = fr[j]; sx, sy = 270 / 354, 230 / 354            # Südost (zum Grat hin)
    hinweise.append([round(x + sx * 3.5, 1), round(y + sy * 3.5, 1)])
    lies(f'schneesturm_hinweis_{len(hinweise)}', x + sx * 3.5, y + sy * 3.5, 'Ein Schneesturm tobt über der Frostkrone. Man sieht die eigene Hand nicht mehr – wer hier weitergeht, kommt nicht wieder. Kehr um.')

# wo der Weg von der Passwacht nach Norden in den Sturm führt: ein eigener Hinweis auf dem Weg (vor der Kette, Südost)
hinweise.append([6921.5, 5522.5]); lies('schneesturm_weg', 6921.5, 5522.5, 'Der Weg verschwindet im Weiß. Der Sturm heult so laut, dass man die eigenen Schritte nicht hört. Die Leute der Passwacht sagen: Wer jetzt hinaufgeht, den holt die Frostkrone.')
os.makedirs(os.path.join(W, 'festland'), exist_ok=True)
json.dump({'hinweis': 'Erzeugt von werkzeug/welt/sperren.py (Welt-Erlebnis): Bergsturz am Drachenarm, Schneesturm an der Frostkrone. Weltfelder.', 'objekte': objekte, 'interaktionen': interaktionen},
          open(os.path.join(W, 'festland', 'plan_sperren.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
punkte = lambda k, n: [k[i] for i in range(0, len(k), n)] + [k[-1]]
json.dump({'hinweis': 'Sperren am Drachenarm und an der Frostkrone (sperren.py). Freischalten: Stufe drachenarm_frei bzw. frostkrone_frei (ausbau_bis) – Systeme trägt sie in shared/stadtstufen.ts ein. Weltfelder.',
           'drachenarm': {'stufe': 'drachenarm_frei', 'schalter': 'drachenarm_frei', 'mitte': [round(mx, 1), round(my, 1)], 'wachen': WACHEN, 'hinweis': 'bergsturz_drachenarm', 'kette': dr},
           'frostkrone': {'stufe': 'frostkrone_frei', 'schalter': 'frostkrone_frei', 'linie': punkte(fr, 15), 'hinweise': hinweise, 'sturm_breite': 12, 'kette': fr}},
          open(DATEI, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(f'Sperren: Drachenarm {len(dr)} Felder ({sum(1 for o in objekte if o["id"].startswith("bergsturz_fels"))} Felsen), Frostkrone {len(fr)} Felder ({sum(1 for o in objekte if o["id"].startswith("schneesturm"))} Sturmstücke), {len(interaktionen)} Hinweise')
