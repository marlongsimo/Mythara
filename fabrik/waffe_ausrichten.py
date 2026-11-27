"""Mythara Fabrik – ein geliefertes Waffenmodell (Meshy, .blend oder .glb) nach der Fabrik-Konvention ausrichten und skalieren.

  <blender-python> fabrik/waffe_ausrichten.py -- <quelle> <ziel.glb> art=schwert|bogen|stab laenge=<m> [vorbild=<glb>] [umdrehen=1]

Hauptachsen (PCA) der Punkte: längste Achse → z, zweite → x (Bogen: Wölbung in der Ebene x–z), dünnste → y.
schwert: Knauf oben (+z) – das breitere Ende (Klinge) kommt nach unten · stab: der breitere Kopf nach unten wie die Klinge (+z = Griffende) ·
bogen: Wölbung wie beim vorbild (Standard waffe.bogen), damit die Sehne zur selben Seite zeigt.
Danach auf laenge (m) skaliert, Mitte auf den Ursprung. Textur und Material bleiben.
"""
import os, sys
import numpy as np
import bpy
from mathutils import Matrix
a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
ART, LG = opt.get("art", "schwert"), float(opt.get("laenge", 1.0))
def laden(p):
    if p.endswith(".glb"): bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(p))
    else: bpy.ops.wm.open_mainfile(filepath=os.path.abspath(p))
    for o in list(bpy.data.objects):
        if o.type != "MESH": bpy.data.objects.remove(o)
    ms = [o for o in bpy.data.objects if o.type == "MESH"]
    for o in ms: o.parent = None
    bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = ms[0]
    if len(ms) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); return ob
def punkte(ob): return np.array([v.co[:] for v in ob.data.vertices])
def woelbung(P):                                                                                   # Mitte des Bogens gegenüber den Enden in x
    z = P[:, 2]; m = np.abs(z) < 0.15 * np.abs(z).max(); e = np.abs(z) > 0.8 * np.abs(z).max(); return P[m, 0].mean() - P[e, 0].mean()
ziel_woelbung = None
if ART == "bogen":
    vb = laden(opt.get("vorbild", "fabrik/assets/waffen/bogen/waffe.bogen/v001/quelle/bogen.glb")); ziel_woelbung = np.sign(woelbung(punkte(vb)))
ob = laden(q); P = punkte(ob); P -= P.mean(0)
w, V = np.linalg.eigh(np.cov(P.T)); V = V[:, ::-1]                                                 # Spalten: längste, mittlere, kürzeste Achse
R = np.stack([V[:, 1], V[:, 2], V[:, 0]])                                                         # neue x, y, z
if np.linalg.det(R) < 0: R[1] *= -1
P = P @ R.T
z = P[:, 2]; zr = np.abs(z).max(); breite = lambda m: np.hypot(P[m, 0], P[m, 1]).max() if m.any() else 0
oben, unten = breite(z > 0.6 * zr), breite(z < -0.6 * zr)
if (ART == "schwert" and oben > unten) or (ART == "stab" and oben > unten): P[:, 2] *= -1; P[:, 1] *= -1   # um x drehen: Knauf (schmal) / Stabkopf (breit) nach oben
if opt.get("umdrehen") == "1": P[:, 2] *= -1; P[:, 1] *= -1                                      # von Hand: oben und unten tauschen (wenn die Breitenregel irrt)
if ART == "bogen" and np.sign(woelbung(P)) != ziel_woelbung: P[:, 0] *= -1; P[:, 1] *= -1
P -= (P.max(0) + P.min(0)) / 2; P *= LG / (P[:, 2].max() - P[:, 2].min())
ob.data.vertices.foreach_set("co", P.ravel()); ob.data.update(); ob.name = os.path.splitext(os.path.basename(ziel))[0]
bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP")
print("Waffe:", ART, ziel, "Maße", np.round(P.max(0) - P.min(0), 3).tolist())
