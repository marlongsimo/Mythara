"""
Baut den Waldweg Waldmark -> Weidenhain: Bodenbild, Baum-Sprites, Raster und Deko-Liste.
Aufruf: python3 werkzeug/waldweg.py <assets-ordner>
  Der Assets-Ordner enthält die Renderings (welt/sprites, welt/klein) und die Bodentexturen.
Ergebnis: img/welt/waldweg.webp, img/welt/baum*.webp und shared/waldweg.ts
"""
import sys, json, math, random
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
A = sys.argv[1]; R = __file__.rsplit('/werkzeug/', 1)[0]; ROOT = R.rsplit('/realtime', 1)[0]
random.seed(7); np.random.seed(7)
W, H, Z = 40, 18, 96                     # gemalte Felder, Pixel je Feld
FEIN = 2; RW, RH = W * FEIN, H * FEIN    # Rechenfelder
PXM_SPIEL = 33.0                         # Pixel je Meter für Bäume im Spiel (leicht verkleinert)
PXM_KLEIN = 44.0                         # Felsen und Büsche: fast echte Größe neben dem Helden (84 px)

# ---------------- Wegführung (in gemalten Feldern) ----------------
def weg_y(x): return 9.7 + 1.1 * math.sin((x + 2.0) / 5.2) - 0.5 * math.sin(x / 13.0)
KX = 20.5                                 # Kreuzung
def ast_x(y): return KX + 0.7 * math.sin(y / 1.7)
LICHT = (KX + 0.3, 3.9, 6.6, 3.3)         # Lichtung: Mitte x, y, Halbachsen
def frei_f(x, y):
    """Abstand zum Rand der freien Fläche (positiv = frei), in Feldern"""
    d1 = 1.25 - abs(y - weg_y(x))
    d2 = (1.05 - abs(x - ast_x(y))) if LICHT[1] <= y <= weg_y(KX) else -9
    cx, cy, rx, ry = LICHT; e = math.hypot((x - cx) / rx, (y - cy) / ry); d3 = (1 - e) * min(rx, ry)
    return max(d1, d2, d3)

# ---------------- Raster (Rechenfelder) ----------------
frei = np.zeros((RH, RW), bool)
for j in range(RH):
    for i in range(RW):
        frei[j, i] = frei_f((i + 0.5) / FEIN, (j + 0.5) / FEIN) > 0
# Felsgruppen auf der Lichtung blockieren
BLOECKE = [(16.2, 2.6, 'felsgruppe01'), (25.6, 5.4, 'felsgruppe03')]
for bx, by, _ in BLOECKE:
    for j in range(RH):
        for i in range(RW):
            if math.hypot((i + 0.5) / FEIN - bx, ((j + 0.5) / FEIN - by) * 1.4) < 0.85: frei[j, i] = False

# ---------------- Boden ----------------
PW, PH = W * Z, H * Z
yy, xx = np.mgrid[0:PH, 0:PW] / Z
fx = np.vectorize(frei_f)
grob = fx(xx[::8, ::8] + 4 / Z, yy[::8, ::8] + 4 / Z)
abst = np.asarray(Image.fromarray(grob.astype(np.float32)).resize((PW, PH), Image.BILINEAR))
def tex(pfad, s, farbe=None, hell=1.0):
    t = Image.open(pfad).convert('RGB').resize((s, s), Image.LANCZOS); a = np.asarray(t).astype(float)
    if farbe is not None:
        f = a.reshape(-1, 3); f = (f - f.mean(0)) / (f.std(0) + 1e-6) * np.array(farbe[1]) + np.array(farbe[0]); a = f.reshape(a.shape)
    a = a * hell; reps = (PH // s + 1, PW // s + 1, 1); return np.tile(a, reps)[:PH, :PW]
def rauschen(skala, seed):
    rng = np.random.RandomState(seed); k = rng.rand(PH // skala + 2, PW // skala + 2).astype(np.float32)
    return np.asarray(Image.fromarray(k).resize((PW + 2 * skala, PH + 2 * skala), Image.BICUBIC))[skala:skala + PH, skala:skala + PW]
T = A + '/texturen/grass/'; P = A + '/pakete/wests_textures/'
wald = tex(T + 'Grass_02.png', 256, ((70, 82, 34), (22, 24, 14)))
laub = tex(P + 'leaves 1.png', 200, ((92, 70, 38), (26, 22, 16)))
wiese = tex(T + 'Grass_03.png', 256, ((128, 140, 52), (26, 26, 16)))
erde = tex(P + 'dirt 1.png', 220, ((128, 100, 66), (16, 14, 12)))
kies = tex(A + '/texturen/brick/Ground_04.png', 200, ((118, 104, 76), (30, 28, 24)))
n1, n2, n3 = rauschen(160, 1), rauschen(60, 2), rauschen(300, 3)
m_laub = np.clip((n1 - 0.45) * 3, 0, 1)[..., None] * 0.7
boden = wald * (1 - m_laub) + laub * m_laub
lc = LICHT; e = np.hypot((xx - lc[0]) / (lc[2] + 1.2), (yy - lc[1]) / (lc[3] + 1.0))
m_wiese = np.clip((1 - e) * 2.2 + (n2 - 0.5) * 0.8, 0, 1)[..., None]
boden = boden * (1 - m_wiese) + wiese * m_wiese
m_weg = np.clip((abst + 0.15 + (n2 - 0.5) * 0.5) * 2.2, 0, 1)
m_weg = m_weg * (1 - np.clip((1 - e) * 2.5, 0, 1) * 0.85)   # auf der Lichtung kein Erdweg
m_kies = np.clip((n2 - 0.62) * 4, 0, 1) * m_weg * 0.6
boden = boden * (1 - m_weg[..., None]) + erde * m_weg[..., None]
boden = boden * (1 - m_kies[..., None]) + kies * m_kies[..., None]
rand = np.exp(-((abst - 0.05) / 0.22) ** 2) * (1 - np.clip((1 - e) * 2, 0, 1))
boden = boden * (1 - 0.22 * rand[..., None])
# Licht und Schatten des Walddachs: der Weg liegt im Halbschatten, die Lichtung in der Sonne
licht = np.clip(0.62 + (abst + 0.4) * 0.3, 0.55, 1.1) + (n3 - 0.5) * 0.18 + np.clip((1 - e) * 0.6, 0, 0.25)
boden = np.clip(boden * licht[..., None], 0, 255)
boden = boden * (1 - 0.25 * np.clip((yy - np.vectorize(weg_y)(xx[:1, :])[0] - 1.6), 0, 1)[..., None] * (abst < -0.2)[..., None])
bild = Image.fromarray(boden.astype(np.uint8)).convert('RGBA')

def kleben(spr, fuss, x, y, skal, alpha=1.0):
    s = spr.resize((max(1, int(spr.width * skal)), max(1, int(spr.height * skal))), Image.LANCZOS)
    if alpha < 1: s.putalpha(s.getchannel('A').point(lambda v: int(v * alpha)))
    bild.alpha_composite(s, (int(x * Z - fuss[0] * s.width), int(y * Z - fuss[1] * s.height)))

# ---------------- Bäume ----------------
SI = {**json.load(open(A + '/welt/sprites/info_b.json')), **json.load(open(A + '/welt/sprites/info_a.json'))}
ARTEN = ['tree_brown_001_b0', 'tree_generic_001_b1', 'treebrown_002_b2', 'branchmaster_b3', 'tree_a0', 'tree_a1']
GEWICHT = [3, 3, 3, 1, 2, 1]
def nachfaerben(im, satt=1.05, hell=0.8, kontrast=1.15, stamm=False):
    a = im.getchannel('A'); rgb = im.convert('RGB')
    rgb = ImageEnhance.Brightness(ImageEnhance.Contrast(ImageEnhance.Color(rgb).enhance(satt)).enhance(kontrast)).enhance(hell)
    f = np.asarray(rgb).astype(float); f[..., 0] *= 0.95; f[..., 2] *= 0.88
    if stamm:  # Stamm und Wurzeln (alles, was nicht grün ist): dunkles Braun
        m = (f[..., 1] < f[..., 0] * 1.06)[..., None]; f = np.where(m, f * np.array([0.5, 0.4, 0.3]), f)
    rgb = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))
    rgb.putalpha(a); return rgb
baum_aus = {}
for k, n in enumerate(ARTEN):
    b = nachfaerben(Image.open(A + f'/welt/sprites/{n}_bild.png').convert('RGBA'), stamm=True)
    s = Image.open(A + f'/welt/sprites/{n}_schatten.png').convert('RGBA')
    f = PXM_SPIEL / SI[n]['pxm']; fu = SI[n]['fuss']
    bb = b.getbbox(); bs = b.crop(bb).resize((int((bb[2] - bb[0]) * f), int((bb[3] - bb[1]) * f)), Image.LANCZOS)
    fuss = ((fu[0] * b.width - bb[0]) / (bb[2] - bb[0]), (fu[1] * b.height - bb[1]) / (bb[3] - bb[1]))
    name = f'baum{k + 1}'; bs.save(ROOT + f'/img/welt/{name}.webp', quality=88, method=6)
    baum_aus[n] = {'name': name, 'fuss': [round(fuss[0], 4), round(fuss[1], 4)], 'w': bs.width, 'h': bs.height, 'schatten': s, 'sfuss': fu, 'f': f}

# Plätze: im Wald, nicht zu nah am Weg; unterhalb des Wegs nur ganz unten (sonst verdecken die Kronen den Weg)
plaetze = []
for _ in range(9000):
    x, y = random.uniform(-0.5, W + 0.5), random.uniform(0.3, H + 1.6)
    d = frei_f(x, y)
    if d > -0.55: continue
    unter_weg = y > weg_y(x) and not (LICHT[1] < y < weg_y(KX) and abs(x - KX) < 7)
    if unter_weg and y < weg_y(x) + 4.7: continue
    if any(math.hypot(x - p[0], (y - p[1]) * 1.3) < 1.55 for p in plaetze): continue
    plaetze.append((x, y))
plaetze.sort(key=lambda p: p[1])
deko = []
for x, y in plaetze:
    n = random.choices(ARTEN, GEWICHT)[0]; B = baum_aus[n]; sk = random.uniform(0.85, 1.12)
    # Schatten in den Boden
    s = B['schatten']; kleben(s, B['sfuss'], x, y, B['f'] * sk, 0.85)
    deko.append({'b': B['name'], 'x': round(x, 2), 'y': round(y, 2), 's': round(sk, 3)})

# ---------------- Felsen und Büsche (fest im Boden) ----------------
KI = json.load(open(A + '/welt/klein/info.json'))
def klein(n): return Image.open(A + f'/welt/klein/{n}.png').convert('RGBA')
FELSEN = [k for k in KI if k.startswith('fels') and 'gruppe' not in k]
for bx, by, n in BLOECKE: kleben(nachfaerben(klein(n), 1.0, 1.0), KI[n]['fuss'], bx, by + 0.2, PXM_KLEIN / 48)
for _ in range(70):   # Steine am Wegrand und auf der Lichtung
    x, y = random.uniform(0, W), random.uniform(0, H); d = frei_f(x, y)
    if not (-0.5 < d < 0.25): continue
    n = random.choice(FELSEN); kleben(nachfaerben(klein(n), 1.0, 0.95), KI[n]['fuss'], x, y, PXM_KLEIN / 48 * random.uniform(0.6, 1.1))
busch = [nachfaerben(klein('busch1'), 1.4, 0.8), nachfaerben(klein('busch2'), 1.4, 0.8)]
for _ in range(900):  # Büsche säumen den Wald, unterhalb des Wegs dichtes Unterholz
    x, y = random.uniform(-0.3, W + 0.3), random.uniform(0, H + 0.5); d = frei_f(x, y)
    unten = y > weg_y(x) + 1.2 and y < weg_y(x) + 4.9 and abs(x - KX) > 0
    if not ((-1.6 < d < -0.35) or (unten and d < -0.35 and random.random() < 0.35)): continue
    k = random.randrange(2); kleben(busch[k], KI['busch%d' % (k + 1)]['fuss'], x, y, PXM_KLEIN / 48 * random.uniform(0.8, 1.5))

bild = bild.convert('RGB')
bild.save(ROOT + '/img/welt/waldweg.webp', quality=82, method=6)
bild.resize((PW // 4, PH // 4)).save(A + '/welt/waldweg_klein.png')

# ---------------- Karte für das Spiel ----------------
zeilen = [''.join('.' if frei[j, i] else 'T' for i in range(RW)) for j in range(RH)]
start = [[1.0, weg_y(1.0)], [0.6, weg_y(0.6) - 0.5], [0.6, weg_y(0.6) + 0.5]]
lager = [('schlammkroete', 18.4, 2.5, 1), ('schlammkroete', 19.5, 3.3, 1), ('kroetchen', 17.6, 3.5, 1),
         ('irrlicht', 23.4, 2.2, 2), ('schlammkroete', 24.1, 3.1, 2), ('kroetchen', 22.6, 3.5, 2)]
# niemand darf vom Weg aus (7 Rechenfelder = 3,5 gemalte Felder) zu erreichen sein
for _, x, y, _g in lager: assert min(math.hypot(x - q / 10, y - weg_y(q / 10)) for q in range(0, 400)) > 3.5 + 1.0, (x, y)
for _, x, y, _g in lager: assert frei[int(y * FEIN), int(x * FEIN)], (x, y)
for x, y in start: assert frei[int(y * FEIN), int(x * FEIN)], (x, y)
baeume = {B['name']: {'fuss': B['fuss'], 'w': B['w'], 'h': B['h']} for B in baum_aus.values()}
ts = f'''/* Erzeugt von werkzeug/waldweg.py – nicht von Hand ändern. Der Waldweg von der Waldmark nach Weidenhain. */
/** Raster in Rechenfeldern ({RW} × {RH}): „.“ frei, „T“ Wald */
export const WALDWEG_ZEILEN: string[] = {json.dumps(zeilen)};
/** Start, Lager, Bäume und Ausgänge in gemalten Feldern ({W} × {H}, je {Z} px) */
export const WALDWEG_START: number[][] = {json.dumps([[round(a - 0.5, 2), round(b - 0.5, 2)] for a, b in start])};
export const WALDWEG_LAGER = {json.dumps([dict(art=a, x=x, y=y, gruppe=g) for a, x, y, g in lager])};
export const WALDWEG_BAEUME: Record<string, {{ fuss: number[]; w: number; h: number }}> = {json.dumps(baeume)};
export const WALDWEG_DEKO: {{ b: string; x: number; y: number; s: number }}[] = {json.dumps(deko)};
export const WALDWEG_KREUZUNG = {{ x: {KX}, y: {round(weg_y(KX), 2)} }};
export const WALDWEG_WEGY = (x: number): number => 9.7 + 1.1 * Math.sin((x + 2.0) / 5.2) - 0.5 * Math.sin(x / 13.0);
'''
open(R + '/shared/waldweg.ts', 'w').write(ts)
print('Bäume', len(deko), 'Bild', PW, 'x', PH, 'Raster', RW, 'x', RH, 'frei', int(frei.sum()))
