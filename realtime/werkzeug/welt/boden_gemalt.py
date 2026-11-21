"""
World Pipeline – Bodenkacheln im neuen Spielstil (handgemalt wie die Heldenbilder), ohne Bildvorlage gerechnet, also frei von Lizenzfragen.

  python3 werkzeug/welt/boden_gemalt.py [--vorschau bild.png]

Schreibt realtime/werkzeug/boden/gemalt/<name>.webp (nahtlos kachelbar, 512 × 512). Die Geländearten in welt/bibliothek/gelaende.json
verweisen darauf; der Bodenbäcker (boden.py) legt sie wie bisher in Rängen übereinander und zeichnet Halme, Steinchen und Blumen dazu.
Stil: ruhige Farbflächen mit weichen, großen Flecken, wenige gemalte Grasbüschel und Kiesel, kaum Rauschen.
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.normpath(os.path.join(HIER, '..', 'boden', 'gemalt'))
N = 512


def flecken(rng, s, staerke):
    f = ndimage.gaussian_filter(rng.standard_normal((N, N)).astype(np.float32), s, mode='wrap')
    return f / (np.abs(f).max() + 1e-6) * staerke


def grund(farbe, rng, gross=0.12, mittel=0.05, gelb=0.0):
    a = np.broadcast_to(np.array(farbe, np.float32), (N, N, 3)).copy()
    g = flecken(rng, 46, gross)[..., None]; m = flecken(rng, 12, mittel)[..., None]
    a = a * (1 + g + m)
    if gelb:                                       # an hellen Stellen etwas gelblicher, an dunklen kühler
        a = a + (flecken(rng, 30, 1)[..., None] * np.array((gelb, gelb * 0.6, -gelb * 0.8), np.float32))
    return a


class Maler:
    """Formen nahtlos aufs Bild malen: jede Form auch um eine Kachel versetzt"""
    def __init__(self, a):
        self.im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); self.d = ImageDraw.Draw(self.im)

    def form(self, art, pk, *a, **k):
        for dx in (-N, 0, N):
            for dy in (-N, 0, N):
                if art in ('ellipse', 'arc'):
                    q = [pk[0] + dx, pk[1] + dy, pk[2] + dx, pk[3] + dy]
                else:
                    q = [(x + dx, y + dy) for x, y in pk]
                getattr(self.d, art)(q, *a, **k)

    def bild(self):
        return np.asarray(self.im).astype(np.float32)


def bueschel(M, x, y, farbe, rng, gross=1.0):
    """Gemaltes Grasbüschel: drei bis fünf spitze Halme, unten dunkel, oben hell"""
    for i in range(int(rng.integers(3, 6))):
        w = rng.uniform(-0.6, 0.6) + (i - 2) * 0.25; h = rng.uniform(7, 12) * gross; b = 2.2 * gross
        fx, fy = x + (i - 2) * 2.2 * gross, y
        tip = (fx + math.sin(w) * h, fy - math.cos(w) * h)
        dunkel = tuple(int(c * 0.72) for c in farbe); hell = tuple(int(min(255, c * 1.28)) for c in farbe)
        M.form('polygon', [(fx - b, fy), tip, (fx + b, fy)], fill=dunkel)
        M.form('polygon', [(fx - b * 0.4, fy - h * 0.35), tip, (fx + b * 0.5, fy - h * 0.4)], fill=hell)


def kiesel(M, x, y, r, farbe):
    M.form('ellipse', [x - r + 1, y - r * 0.7 + 1.5, x + r + 1, y + r * 0.7 + 1.5], fill=tuple(int(c * 0.55) for c in farbe))
    M.form('ellipse', [x - r, y - r * 0.7, x + r, y + r * 0.7], fill=farbe)
    M.form('ellipse', [x - r * 0.6, y - r * 0.55, x + r * 0.1, y - r * 0.05], fill=tuple(int(min(255, c * 1.25)) for c in farbe))


def wiese(rng, farbe=(104, 146, 62), dichte=70, blumen=0, gelb=10):
    M = Maler(grund(farbe, rng, gelb=gelb))
    for _ in range(dichte):
        bueschel(M, rng.uniform(0, N), rng.uniform(0, N), tuple(int(c * rng.uniform(0.92, 1.08)) for c in farbe), rng, rng.uniform(0.9, 1.3))
    for _ in range(blumen):
        x, y = rng.uniform(0, N), rng.uniform(0, N); f = [(242, 236, 214), (240, 206, 84), (214, 140, 190), (150, 170, 230)][int(rng.integers(0, 4))]
        for k in range(5):
            w = k / 5 * 2 * math.pi; M.form('ellipse', [x + math.cos(w) * 2.6 - 2, y + math.sin(w) * 2.6 - 2, x + math.cos(w) * 2.6 + 2, y + math.sin(w) * 2.6 + 2], fill=f)
        M.form('ellipse', [x - 1.4, y - 1.4, x + 1.4, y + 1.4], fill=(226, 170, 60))
    return ndimage.gaussian_filter(M.bild(), (0.6, 0.6, 0))


def waldboden(rng):
    a = grund((92, 80, 52), rng, gross=0.14, mittel=0.06)
    moos = np.clip(flecken(rng, 22, 1.6), 0, 1)[..., None]
    a = a * (1 - moos * 0.7) + np.array((88, 120, 56), np.float32) * moos * 0.7
    M = Maler(a)
    for _ in range(140):                            # Laub
        x, y, r = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(3, 5.5); f = [(150, 98, 48), (176, 122, 56), (120, 84, 44), (160, 132, 64)][int(rng.integers(0, 4))]
        w = rng.uniform(0, math.pi); pk = [(x + math.cos(w) * r, y + math.sin(w) * r * 0.6), (x + math.cos(w + 1.6) * r * 0.45, y + math.sin(w + 1.6) * r * 0.45), (x - math.cos(w) * r, y - math.sin(w) * r * 0.6), (x - math.cos(w + 1.6) * r * 0.45, y - math.sin(w + 1.6) * r * 0.45)]
        M.form('polygon', pk, fill=f)
    for _ in range(14):                             # Zweige
        x, y, l, w = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(10, 22), rng.uniform(0, math.pi)
        M.form('line', [(x, y), (x + math.cos(w) * l, y + math.sin(w) * l)], fill=(84, 60, 38), width=2)
    for _ in range(26):
        bueschel(M, rng.uniform(0, N), rng.uniform(0, N), (86, 120, 56), rng, 0.9)
    return ndimage.gaussian_filter(M.bild(), (0.6, 0.6, 0))


def erde(rng):
    a = grund((158, 118, 76), rng, gross=0.1, mittel=0.05)
    spur = 0.06 * np.sin(np.arange(N) / N * 2 * math.pi * 6)[None, :, None]   # leichte Fahrspuren (in einer Richtung, wird beim Backen gedreht)
    M = Maler(a * (1 + spur))
    for _ in range(90):
        g = rng.uniform(0.85, 1.1); kiesel(M, rng.uniform(0, N), rng.uniform(0, N), rng.uniform(2.2, 4.5), tuple(int(c * g) for c in (150, 140, 124)))
    for _ in range(40):
        x, y = rng.uniform(0, N), rng.uniform(0, N); M.form('ellipse', [x - 6, y - 3, x + 6, y + 3], fill=tuple(int(c) for c in (140, 102, 64)))
    return ndimage.gaussian_filter(M.bild(), (0.7, 0.7, 0))


def pflaster(rng):
    """Runde, gemalte Pflastersteine in leicht versetzten Reihen; dunkle Fugen (der Bäcker erkennt die Steine an den Fugen)"""
    M = Maler(np.broadcast_to(np.array((58, 52, 46), np.float32), (N, N, 3)).copy())
    y = 0
    while y < N:
        h = int(rng.integers(30, 38)); x = -int(rng.integers(0, 30))
        while x < N:
            b = int(rng.integers(32, 46)); g = float(rng.uniform(0.82, 1.12)); f = np.array(rng.choice([(168, 160, 146), (156, 152, 144), (176, 164, 140), (150, 144, 134)]), np.float32) * g
            for k, s in enumerate((1.0, 0.82, 0.6)):
                farbe = tuple(int(min(255, c * (0.8 + 0.18 * k))) for c in f); e = (1 - s) * 6
                M.form('rounded_rectangle', [(x + 3 + e * 0.5, y + 3 + e * 0.5), (x + b - 3 - e, y + h - 3 - e)], radius=10, fill=farbe)
            x += b
        y += h
    return ndimage.gaussian_filter(M.bild(), (0.6, 0.6, 0))


def wasser(rng, ruhig=False):
    a = grund((62, 118, 150) if not ruhig else (58, 108, 136), rng, gross=0.1, mittel=0.04)
    M = Maler(a)
    for _ in range(60 if not ruhig else 26):        # Wellenlichter
        x, y, l = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(10, 24)
        M.form('arc', [x - l, y - l * 0.25, x + l, y + l * 0.25], 200, 340, fill=(150, 200, 222), width=2)
    return ndimage.gaussian_filter(M.bild(), (0.8, 0.8, 0))


def moorwasser(rng):
    a = grund((40, 62, 60), rng, gross=0.14, mittel=0.05)
    M = Maler(a)
    for _ in range(22):                            # Entengrütze in Flecken
        x, y = rng.uniform(0, N), rng.uniform(0, N)
        for _ in range(int(rng.integers(6, 16))):
            dx, dy, r = rng.normal(0, 9), rng.normal(0, 6), rng.uniform(1.6, 3.2); M.form('ellipse', [x + dx - r, y + dy - r, x + dx + r, y + dy + r], fill=(96, 128, 62))
    for _ in range(18):                            # stille Lichtreflexe
        x, y, l = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(8, 18)
        M.form('arc', [x - l, y - l * 0.22, x + l, y + l * 0.22], 200, 340, fill=(92, 130, 126), width=2)
    return ndimage.gaussian_filter(M.bild(), (0.8, 0.8, 0))


def torf(rng):
    a = grund((84, 64, 44), rng, gross=0.12, mittel=0.06)
    moos = np.clip(flecken(rng, 18, 1.8), 0, 1)[..., None]
    a = a * (1 - moos * 0.6) + np.array((96, 112, 58), np.float32) * moos * 0.6
    M = Maler(a)
    for _ in range(40):
        bueschel(M, rng.uniform(0, N), rng.uniform(0, N), (110, 118, 60), rng, 1.0)
    for _ in range(30):
        x, y = rng.uniform(0, N), rng.uniform(0, N); M.form('ellipse', [x - 5, y - 2.5, x + 5, y + 2.5], fill=(62, 46, 32))
    return ndimage.gaussian_filter(M.bild(), (0.7, 0.7, 0))


def schlamm(rng):
    a = grund((92, 78, 58), rng, gross=0.12, mittel=0.05)
    M = Maler(a)
    for _ in range(40):                            # Pfützen
        x, y, r = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(4, 10); M.form('ellipse', [x - r, y - r * 0.6, x + r, y + r * 0.6], fill=(64, 72, 64))
        M.form('arc', [x - r * 0.7, y - r * 0.4, x + r * 0.5, y + r * 0.3], 200, 300, fill=(120, 130, 120), width=1)
    return ndimage.gaussian_filter(M.bild(), (0.7, 0.7, 0))


def sand(rng):
    a = grund((196, 176, 132), rng, gross=0.08, mittel=0.04)
    M = Maler(a)
    for _ in range(60):
        g = rng.uniform(0.85, 1.05); kiesel(M, rng.uniform(0, N), rng.uniform(0, N), rng.uniform(1.6, 3.2), tuple(int(c * g) for c in (170, 156, 128)))
    for _ in range(20):
        bueschel(M, rng.uniform(0, N), rng.uniform(0, N), (134, 140, 70), rng, 0.8)
    return ndimage.gaussian_filter(M.bild(), (0.7, 0.7, 0))


KACHELN = {
    'wiese': lambda r: wiese(r), 'wiese-satt': lambda r: wiese(r, (88, 138, 58), 80), 'wiese-trocken': lambda r: wiese(r, (136, 148, 70), 60, gelb=14),
    'wiese-blumen': lambda r: wiese(r, (104, 148, 64), 60, blumen=70), 'waldboden': waldboden, 'erde': erde, 'pflaster': pflaster,
    'wasser': lambda r: wasser(r), 'wasser-ruhig': lambda r: wasser(r, True),
    'moorwasser': moorwasser, 'torf': torf, 'schlamm': schlamm, 'sand': sand,
    'moorwiese': lambda r: wiese(r, (112, 116, 66), 90, blumen=6, gelb=8)}


def main():
    os.makedirs(ZIEL, exist_ok=True); bilder = []
    for i, (name, f) in enumerate(KACHELN.items()):
        a = np.clip(f(np.random.default_rng(100 + i)), 0, 255).astype(np.uint8)
        Image.fromarray(a).save(os.path.join(ZIEL, name + '.webp'), quality=92, method=6); bilder.append(Image.fromarray(a))
        print('  ' + name)
    if '--vorschau' in sys.argv:
        G = Image.new('RGB', (len(bilder) * 260, 260)); [G.paste(b.resize((256, 256)), (i * 260, 2)) for i, b in enumerate(bilder)]
        G.save(sys.argv[sys.argv.index('--vorschau') + 1])


if __name__ == '__main__':
    main()
