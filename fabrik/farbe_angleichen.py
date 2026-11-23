"""Mythara Fabrik – die Farben eines Teils an ein anderes angleichen (Set-Teile aus verschiedenen Meshy-Modellen).

  python3 fabrik/farbe_angleichen.py <teil.glb> <vorbild.glb> <ziel.glb> [staerke=0.8] [metall=0|1]
Überträgt die Farbe der Textur des Vorbilds auf die Textur des Teils (Lab-Raum): Helligkeit nach ihrer ganzen Verteilung, Rot-Grün und Blau-Gelb nach Mittelwert und Streuung.
staerke 0..1: wie weit (1 = ganz). Form, UV und alles andere bleiben unverändert.
"""
import os, sys
import numpy as np
import bpy
teil, vorbild, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a); ST = float(opt.get("staerke", 0.8))
def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def srgb(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, None), 1 / 2.4) - 0.055)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); W = np.array([0.95047, 1.0, 1.08883])
def lab(rgb):
    x = (lin(rgb) @ M.T) / W; f = np.where(x > 0.008856, np.cbrt(x), 7.787 * x + 16 / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)
def rgb(L):
    fy = (L[:, 0] + 16) / 116; fx = fy + L[:, 1] / 500; fz = fy - L[:, 2] / 200; f = np.stack([fx, fy, fz], 1)
    x = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * W; return np.clip(srgb(x @ np.linalg.inv(M).T), 0, 1)
def bild(pfad):
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(pfad))
    i = max(bpy.data.images, key=lambda b: b.size[0] * b.size[1]); a = np.array(i.pixels[:], dtype=np.float32).reshape(-1, 4); return i, a
METALL = opt.get("metall", "0") == "1"   # metall=1: nur graue Metallflächen vergleichen (Buntes wie Leder und Messing zählt nicht mit)
def flaechen(L): return (np.hypot(L[:, 1], L[:, 2]) < 9) & (L[:, 0] > 6) if METALL else np.ones(len(L), bool)
_, b = bild(vorbild); maske_b = b[:, 3] > 0.5; Lb = lab(b[maske_b, :3]); Lb = Lb[flaechen(Lb)]; mb, sb = Lb.mean(0), Lb.std(0) + 1e-4
img, a = bild(teil); maske = a[:, 3] > 0.5; La = lab(a[maske, :3]); g = flaechen(La); ma, sa = La[g].mean(0), La[g].std(0) + 1e-4
neu = (La - ma) / sa * sb + mb
q = np.linspace(0, 100, 101); pa, pb = np.percentile(La[g, 0], q), np.percentile(Lb[:, 0], q)   # Helligkeit: ganze Verteilung angleichen (helle Platten bleiben hell, dunkle dunkel)
neu[:, 0] = np.interp(La[:, 0], pa, pb)
out = La + (neu - La) * ST; a[maske, :3] = rgb(out)
print("Farbe angeglichen: Lab vorher", ma.round(1), "→ Vorbild", mb.round(1), "Stärke", ST)
img.pixels[:] = a.ravel(); img.pack()
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
