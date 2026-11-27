"""
World Pipeline – Lehmboden der Ockerlande (#172, 27.11.2026): zwei Kacheln „Lehm“ (rot-ocker, fest) und „Lehm, rissig“ (dunkler, Trockenrisse),
aus der Erdkachel gerechnet (ohne Bildvorlage, frei verwendbar). Die Lehmsteppe der Ockerlande mischt beide nach Rauschen.
Aufruf (im Ordner realtime): python3 werkzeug/welt/boden_lehm.py   → werkzeug/boden/gemalt/lehm.webp, lehm-rissig.webp
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ZIEL = os.path.normpath(os.path.join(HIER, '..', 'boden', 'gemalt'))
erde = np.asarray(Image.open(os.path.join(ZIEL, 'erde.webp')).convert('RGB'), np.float32) / 255
hell = erde.mean(axis=2, keepdims=True); hell = (hell - hell.mean()) / (hell.std() + 1e-6)
rng = np.random.default_rng(172)
# Trockenrisse: Ränder nahtloser Voronoi-Zellen (Polygonmuster wie getrockneter Lehm), leicht verwackelt
H, W = hell.shape[:2]; pkt = rng.random((60, 2)) * [H, W]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
wackel = ndimage.gaussian_filter(rng.standard_normal((H, W)), 6, mode='wrap') * 30
d1 = np.full((H, W), 1e9, np.float32); d2 = d1.copy()
for py, px in pkt:
    for oy in (-H, 0, H):
        for ox in (-W, 0, W):
            d = np.hypot(yy + wackel - py - oy, xx - wackel - px - ox); m = d < d1; d2 = np.where(m, d1, np.minimum(d2, d)); d1 = np.where(m, d, d1)
kanten = np.clip(1 - (d2 - d1) / 2.2, 0, 1).astype(np.float32)
for name, farbe, risse in (('lehm', (0.72, 0.42, 0.26), 0.10), ('lehm-rissig', (0.62, 0.34, 0.21), 0.42)):
    bild = np.clip(np.asarray(farbe) * (1 + 0.10 * hell) - risse * 0.35 * kanten[..., None], 0, 1)
    Image.fromarray((bild * 255).astype(np.uint8)).save(os.path.join(ZIEL, name + '.webp'), quality=88)
    print(name, 'geschrieben')
