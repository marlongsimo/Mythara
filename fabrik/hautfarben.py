"""Mythara Fabrik – Hautfarben für einen Grundkörper mit Textur: Hautmaske aus der Textur und je Hautfarbe eine eigene Körpertextur.

  python3 fabrik/hautfarben.py <koerper.glb> <ziel-ordner> <name> [groesse=1024] [maske=bild.png]

Haut = Bildpunkte im Orange-Bereich (Farbton 8–38°), mittel gesättigt und hell genug – dunkles Leder, Metall und Stoff bleiben.
Neue Farbe: Zielfarbe × (Helligkeit / Bezugshelligkeit der Haut) – Schatten, Falten und Gesichtszüge bleiben erhalten; der Rand der Maske ist weich.
Hautfarben wie im Heldeneditor (realtime/shared/aussehen.ts HAUTFARBEN). Ergebnis: <ziel>/<name>.<farbe>.webp
"""
import os, sys, colorsys
import numpy as np
import bpy
from PIL import Image
from scipy import ndimage
quelle, ziel, name = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a); G = int(opt.get("groesse", 1024))
HAUT = {"hell": (232, 190, 160), "mittel": (212, 160, 122), "oliv": (190, 140, 98), "braun": (146, 98, 66), "dunkel": (100, 66, 46)}
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
img = next(i for i in bpy.data.images if i.size[0] > 0); w, h = img.size
px = np.array(img.pixels[:], np.float32).reshape(h, w, 4)[::-1, :, :3]
im = Image.fromarray((px * 255).astype(np.uint8)).resize((G, G), Image.LANCZOS); c = np.asarray(im).astype(np.float32) / 255
mx, mn = c.max(-1), c.min(-1); v = mx; s = (mx - mn) / np.maximum(mx, 1e-4)
r, g, b = c[..., 0], c[..., 1], c[..., 2]; hue = np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) % 360
maske = (hue > 8) & (hue < 38) & (s > 0.28) & (s < 0.75) & (v > 0.42) & (r > g) & (g > b)
maske = ndimage.binary_opening(maske, iterations=1); maske = ndimage.binary_closing(maske, iterations=2)
lab, n = ndimage.label(maske); gr = ndimage.sum(maske, lab, range(1, n + 1)); maske = np.isin(lab, [i + 1 for i in range(n) if gr[i] > G * G * 0.0004])
weich = ndimage.gaussian_filter(maske.astype(np.float32), 1.2)[..., None]
lin = lambda x: np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4); srgb = lambda x: np.where(x <= 0.0031308, x * 12.92, 1.055 * np.clip(x, 0, None) ** (1 / 2.4) - 0.055)
L = lin(c) @ np.array([0.2126, 0.7152, 0.0722]); ref = float(np.median(L[maske])); os.makedirs(ziel, exist_ok=True)
if "maske" in opt: Image.fromarray(np.where(maske[..., None], (c * 255).astype(np.uint8), (c * 60).astype(np.uint8))).save(opt["maske"])
for fn, rgb in HAUT.items():
    z = lin(np.array(rgb) / 255); neu = srgb(np.clip(z[None, None, :] * (L / ref)[..., None], 0, 1))
    out = c * (1 - weich) + neu * weich
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(os.path.join(ziel, f"{name}.{fn}.webp"), quality=88)
print(f"Haut: {100 * maske.mean():.1f} % der Textur · Bezug {ref:.3f} · {len(HAUT)} Farben → {ziel}/{name}.*.webp")
