"""
World Pipeline – Eisboden (#162, 27.11.2026): zwei Eiskacheln für die Eishöhle der Frostwitwe, aus der Schneekachel gerechnet (ohne Bildvorlage, frei verwendbar).
Hell und dunkel im Schachbrett gelegt, damit jedes Feld gut sichtbar ist (die Frostwitwe friert einzelne Bodenfelder ein).
Aufruf (im Ordner realtime): python3 werkzeug/welt/boden_eis.py   → werkzeug/boden/gemalt/eis-hell.webp, eis-dunkel.webp
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ZIEL = os.path.normpath(os.path.join(HIER, '..', 'boden', 'gemalt'))
schnee = np.asarray(Image.open(os.path.join(ZIEL, 'schnee.webp')).convert('RGB'), np.float32) / 255
hell = schnee.mean(axis=2, keepdims=True)
rng = np.random.default_rng(162)
risse = ndimage.gaussian_filter(rng.random(hell.shape[:2]), 6, mode='wrap'); risse = (np.abs(risse - risse.mean()) < 0.004).astype(np.float32)   # feine Risslinien, nahtlos
for name, farbe, tief in (('eis-hell', (0.78, 0.90, 0.97), 0.0), ('eis-dunkel', (0.55, 0.74, 0.88), 0.08)):
    bild = np.clip(np.asarray(farbe) * (0.82 + 0.25 * hell) - tief - 0.18 * risse[..., None], 0, 1)
    Image.fromarray((bild * 255).astype(np.uint8)).save(os.path.join(ZIEL, name + '.webp'), quality=88)
    print(name, 'geschrieben')
