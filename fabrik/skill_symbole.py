"""Mythara Fabrik – die einheitlichen Skill-Symbole (gold auf schwarz) aus der Vorlage des Nutzers ausschneiden.

  python3 fabrik/skill_symbole.py [skills|leiste]
  skills: fabrik/assets/skilling/symbole/quelle/skill-symbole-neu.png (#30) · leiste: …/quelle/menueleiste-neu.png (#32, Menüleiste)

Je Symbol: Kreis (Mitte, Radius in Bildpunkten der Vorlage, gemessen an der Außenkante des Rings), außerhalb durchsichtig
(weiche Kante), ohne Beschriftung. Die Vorlage hat ≈ 160 px je Symbol: auf 512 hochgerechnet, dann verkleinert und leicht nachgeschärft.
Menüleiste: img/echtzeit/leiste/<name>.webp (160 × 160; die Vorlage hat ≈ 196 px je Symbol).
Ausgabe unter den bisherigen Dateinamen: Kampf-Skills img/echtzeit/skills/<name>.webp (128 × 128),
Berufe img/objekte3d/skilling/symbole/<name>.webp (256 × 256) und <name>_klein.webp (64 × 64).
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SATZ = sys.argv[1] if len(sys.argv) > 1 else "skills"
Q = os.path.join(W, "fabrik/assets/skilling/symbole/quelle/" + ("menueleiste-neu.png" if SATZ == "leiste" else "skill-symbole-neu.png"))
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
LEISTE = {
    "ausruestung": (158.5, 267.5, 98.0),
    "einstellungen": (400.5, 267.5, 97.5),
    "karte": (643.0, 267.5, 98.8),
    "quests": (886.0, 268.0, 97.5),
    "rucksack": (1128.5, 267.5, 98.5),
    "skills": (1372.0, 267.5, 98.8),
    "spieler": (1615.0, 267.5, 98.2),
    "sprint": (158.0, 603.0, 98.5),
    "stil": (400.5, 603.5, 97.5),
    "teleport": (643.5, 603.0, 98.8)
}
KAMPF = ("geschick", "staerke", "fernkampf", "magie", "lp", "defense")
im = Image.open(Q).convert("RGB")
for n, (xc, yc, r) in (LEISTE if SATZ == "leiste" else KREISE).items():
    R = r + 0.3; s = R + 1
    big = im.crop(tuple(int(round(v)) for v in (xc - s, yc - s, xc + s, yc + s))).resize((512, 512), Image.LANCZOS)
    g = np.mgrid[:512, :512]; f = 512 / (2 * s); d = np.hypot(g[1] + 0.5 - 256, g[0] + 0.5 - 256) / f
    a = np.dstack([np.array(big, np.float32), np.clip((R - d) * f / 1.5, 0, 1) * 255]).astype(np.uint8); b = Image.fromarray(a, "RGBA")
    klein = lambda px: b.resize((px, px), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0 if px > 100 else 0.6, 60, 2))
    if SATZ == "leiste": klein(160).save(os.path.join(W, f"img/echtzeit/leiste/{n}.webp"), "WEBP", quality=92)
    elif n in KAMPF: klein(128).save(os.path.join(W, f"img/echtzeit/skills/{n}.webp"), "WEBP", quality=92)
    else:
        z = os.path.join(W, "img/objekte3d/skilling/symbole"); klein(256).save(f"{z}/{n}.webp", "WEBP", quality=92); klein(64).save(f"{z}/{n}_klein.webp", "WEBP", quality=92)
    print("Symbol:", n)
