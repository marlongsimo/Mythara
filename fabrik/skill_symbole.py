"""Mythara Fabrik – die einheitlichen Skill-Symbole (gold auf schwarz) aus der Vorlage des Nutzers ausschneiden.

  python3 fabrik/skill_symbole.py [vorlage.png]      (Standard: fabrik/assets/skilling/symbole/quelle/skill-symbole-neu.png)

Je Symbol: Kreis (Mitte, Radius in Bildpunkten der Vorlage, gemessen an der Außenkante des Rings), außerhalb durchsichtig
(weiche Kante), ohne Beschriftung. Die Vorlage hat ≈ 160 px je Symbol: auf 512 hochgerechnet, dann verkleinert und leicht nachgeschärft.
Ausgabe unter den bisherigen Dateinamen: Kampf-Skills img/echtzeit/skills/<name>.webp (128 × 128),
Berufe img/objekte3d/skilling/symbole/<name>.webp (256 × 256) und <name>_klein.webp (64 × 64).
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = sys.argv[1] if len(sys.argv) > 1 else os.path.join(W, "fabrik/assets/skilling/symbole/quelle/skill-symbole-neu.png")
KREISE = {
    "geschick": (188.5, 164.5, 79.0),
    "staerke": (421.2, 163.5, 79.0),
    "fernkampf": (655.3, 163.5, 79.8),
    "magie": (890.0, 163.5, 79.5),
    "lp": (1124.0, 163.5, 79.5),
    "defense": (1359.5, 163.5, 80.0),
    "holzfaellerei": (188.5, 473.5, 79.0),
    "bergbau": (423.5, 473.5, 79.0),
    "schmieden_2": (656.5, 473.5, 79.0),
    "handwerk": (890.0, 472.5, 79.5),
    "fischen": (188.5, 786.5, 79.0),
    "kochen": (422.5, 787.5, 79.0),
    "splitterbinden": (658.5, 786.5, 80.0),
    "kraeuterkunde": (889.5, 787.0, 80.5)
}
KAMPF = ("geschick", "staerke", "fernkampf", "magie", "lp", "defense")
im = Image.open(Q).convert("RGB")
for n, (xc, yc, r) in KREISE.items():
    R = r + 0.3; s = R + 1
    big = im.crop(tuple(int(round(v)) for v in (xc - s, yc - s, xc + s, yc + s))).resize((512, 512), Image.LANCZOS)
    g = np.mgrid[:512, :512]; f = 512 / (2 * s); d = np.hypot(g[1] + 0.5 - 256, g[0] + 0.5 - 256) / f
    a = np.dstack([np.array(big, np.float32), np.clip((R - d) * f / 1.5, 0, 1) * 255]).astype(np.uint8); b = Image.fromarray(a, "RGBA")
    klein = lambda px: b.resize((px, px), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0 if px > 100 else 0.6, 60, 2))
    if n in KAMPF: klein(128).save(os.path.join(W, f"img/echtzeit/skills/{n}.webp"), "WEBP", quality=92)
    else:
        z = os.path.join(W, "img/objekte3d/skilling/symbole"); klein(256).save(f"{z}/{n}.webp", "WEBP", quality=92); klein(64).save(f"{z}/{n}_klein.webp", "WEBP", quality=92)
    print("Symbol:", n)
