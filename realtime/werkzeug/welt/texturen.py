"""
World Pipeline – leitet weitere Bodentexturen aus den vorhandenen ab (werkzeug/boden/), damit alle aus derselben Hand kommen.

  python3 werkzeug/welt/texturen.py

Ergebnis in werkzeug/boden/abgeleitet/ (1024 × 1024, nahtlos kachelbar):
  wiese-trocken  – die Wiese, sonnenverbrannt und gelblicher
  wiese-satt     – die Wiese, dunkler und satter (feuchte, schattige Stellen)
  waldboden      – dunkle Erde mit Moosflecken, Nadeln und Laub
Herkunft und Lizenz folgen den Ausgangsbildern (siehe doku/world-pipeline/QUELLEN.md).
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
BODEN = os.path.normpath(os.path.join(HIER, '..', 'boden'))
ZIEL = os.path.join(BODEN, 'abgeleitet')
N = 1024
rng = np.random.default_rng(31)


def lade(name):
    return np.asarray(Image.open(os.path.join(BODEN, name + '.webp')).convert('RGB').resize((N, N), Image.LANCZOS)).astype(np.float32)


def rauschen(s):
    """Kachelbares weiches Rauschen zwischen -1 und 1"""
    r = ndimage.gaussian_filter(rng.standard_normal((N, N)).astype(np.float32), s, mode='wrap')
    return r / np.abs(r).max()


def satt(a, f):
    g = a.mean(-1, keepdims=True)
    return g + (a - g) * f


def speichern(a, name):
    os.makedirs(ZIEL, exist_ok=True)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(ZIEL, name + '.webp'), quality=90, method=6)
    print('  ' + name)


def flecken(bild, anzahl, groesse, farben, form=1.0, drehen=True):
    """Kleine Ellipsen (Laub, Nadeln) über das Bild streuen, über den Rand hinweg gespiegelt, damit es kachelbar bleibt"""
    im = Image.fromarray(np.clip(bild, 0, 255).astype(np.uint8)).convert('RGBA')
    from PIL import ImageDraw
    lage = Image.new('RGBA', (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(lage)
    for _ in range(anzahl):
        x, y = rng.uniform(0, N), rng.uniform(0, N); r = rng.uniform(*groesse); f = farben[rng.integers(0, len(farben))]
        hell = rng.uniform(0.8, 1.15); c = tuple(int(min(255, v * hell)) for v in f) + (int(rng.uniform(150, 235)),)
        w = rng.uniform(0, np.pi) if drehen else 0
        for dx in (-N, 0, N):
            for dy in (-N, 0, N):
                cx, cy = x + dx, y + dy
                if -r * 3 < cx < N + r * 3 and -r * 3 < cy < N + r * 3:
                    pts = [(cx + np.cos(w + t) * r * (1 if k % 2 == 0 else form) * (1 + 0.15 * np.sin(3 * t)), cy + np.sin(w + t) * r * (form if k % 2 == 0 else 1)) for k, t in enumerate(np.linspace(0, 2 * np.pi, 9)[:-1])]
                    d.polygon(pts, fill=c)
    im = Image.alpha_composite(im, lage)
    return np.asarray(im.convert('RGB')).astype(np.float32)


def main():
    wiese, erde = lade('wiese'), lade('erde')
    # sonnenverbrannte Wiese: gelblicher, heller, weniger satt; in großen Flecken mehr Stroh
    t = satt(wiese, 0.75) * np.array([1.16, 1.04, 0.70]) * 1.06
    t = t * (1 + 0.08 * rauschen(40))[..., None]
    speichern(t, 'wiese-trocken')
    # satte Wiese: dunkler und grüner
    s = satt(wiese, 1.15) * np.array([0.78, 0.94, 0.72]) * 0.88
    s = s * (1 + 0.07 * rauschen(30))[..., None]
    speichern(s, 'wiese-satt')
    # Waldboden: Erde dunkel und rötlich; darin Moos aus der Wiese; darüber Nadeln und Laub
    grund = satt(erde, 0.7) * np.array([0.5, 0.42, 0.33])
    moos = satt(wiese, 0.9) * np.array([0.62, 0.74, 0.5]) * 0.72
    m = np.clip((rauschen(26) * 0.8 + rauschen(9) * 0.4 + 0.02) * 2.0, 0, 1)[..., None]
    w = grund * (1 - m) + moos * m
    w = w * (1 + 0.12 * rauschen(60) + 0.08 * rauschen(5))[..., None]
    w = flecken(w, 3400, (1.4, 3.0), [(112, 82, 44), (140, 104, 56), (84, 62, 36), (160, 124, 66)], form=0.3)   # Nadeln, Halme
    w = flecken(w, 1500, (3.2, 6.4), [(150, 86, 38), (176, 120, 50), (118, 68, 34), (138, 112, 52), (96, 84, 40)], form=0.6)  # Laub
    w = ndimage.gaussian_filter(w, (0.5, 0.5, 0), mode='wrap')
    speichern(w, 'waldboden')


if __name__ == '__main__':
    main()
