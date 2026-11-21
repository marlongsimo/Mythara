"""Mythara Fabrik – ein Körpermodell mit den Referenzansichten anmalen.

  python3 fabrik/anmalen.py <modell.glb> <asset-ordner> <ziel.glb> [drehung=x,y,z in Grad] [hoehe=1.8]

Das Modell (z. B. von TripoSR, mit groben Punktfarben) wird ausgerichtet (Blick nach -y, oben = z), auf 1,80 m gebracht und auf den Boden gestellt.
Dann bekommt jeder Punkt seine Farbe aus den freigestellten Ansichten in referenz/teile/: von vorn, von hinten und von der Seite (für die andere Seite gespiegelt).
Welche Ansicht zählt, entscheidet die Richtung der Oberfläche; Punkte, die in einer Ansicht verdeckt sind, bekommen von ihr keine Farbe.
Wo keine Ansicht hinsieht (Scheitel, Sohlen, Innenseiten), bleibt die Farbe des Modells.

Die Ansichten werden über den Umriss eingepasst (Rahmen der Figur im Bild auf Rahmen des Modells in derselben Blickrichtung). Das ist eine Näherung:
Wo die Form des Modells von der Zeichnung abweicht, verrutscht die Farbe etwas.
"""
import math, os, sys
import numpy as np
import bpy
from mathutils import Vector
from PIL import Image
from scipy import ndimage

quelle, ordner, ziel = sys.argv[1], sys.argv[2], sys.argv[3]; dreh = [float(v) for v in sys.argv[4].split(",")] if len(sys.argv) > 4 else [0, 0, 0]
H = float(next((a.split("=")[1] for a in sys.argv[5:] if a.startswith("hoehe=")), 1.8))   # Höhe der Figur in Metern (Menschen 1,8; Tiere nach Art, z. B. hoehe=1.0)


def linear(c):  # sRGB (0..1) -> lineare Werte, wie Blender und glTF Punktfarben erwarten
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def bild(name, spiegeln=False):
    im = Image.open(os.path.join(ordner, "referenz", "teile", name + ".png")).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
    if spiegeln: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    a = np.asarray(im).astype(np.float32) / 255; maske = a[..., 3] > 0.5
    idx = ndimage.distance_transform_edt(~maske, return_distances=False, return_indices=True)       # Farbe über den Rand fortsetzen: knapp daneben liegende Punkte bekommen die Randfarbe
    rgb = a[..., :3][idx[0], idx[1]]; rgb = np.stack([ndimage.gaussian_filter(rgb[..., i], 1.0) for i in range(3)], -1)   # leicht weichzeichnen: sonst rauscht feines Muster (Kettenhemd) von Punkt zu Punkt
    return rgb, maske


bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); ob.rotation_mode = "XYZ"
ob.rotation_euler = tuple(math.radians(v) for v in dreh); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
e = [Vector(c) for c in ob.bound_box]; lo = [min(v[i] for v in e) for i in range(3)]; hi = [max(v[i] for v in e) for i in range(3)]; k = H / (hi[2] - lo[2])
ob.location = (-(lo[0] + hi[0]) / 2 * k, -(lo[1] + hi[1]) / 2 * k, -lo[2] * k); ob.scale = (k, k, k); bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT"); bpy.ops.object.shade_smooth()
me = ob.data; n = len(me.vertices); P = np.zeros(n * 3, np.float32); me.vertices.foreach_get("co", P); P = P.reshape(-1, 3); N = np.zeros(n * 3, np.float32); me.vertices.foreach_get("normal", N); N = N.reshape(-1, 3)

# Farbe des Modells als Ausgangswert
alt = np.full((n, 3), 0.4, np.float32)
if me.color_attributes:
    ca = me.color_attributes[0]; roh = np.zeros(len(ca.data) * 4, np.float32); ca.data.foreach_get("color", roh); roh = roh.reshape(-1, 4)[:, :3]
    if ca.domain == "POINT": alt = roh
    else: ecken = np.zeros(len(me.loops), int); me.loops.foreach_get("vertex_index", ecken); alt[ecken] = roh
    alt = linear(np.clip(alt, 0, 1))          # TripoSR schreibt Bildschirmwerte; als lineare Werte gelesen wirken sie ausgewaschen

# Ansichten: Name, Bild, Richtung zur Kamera, „rechts“ am Bildschirm
ANSICHTEN = [("vorn", bild("koerper-vorn"), (0, -1, 0), (1, 0, 0)), ("hinten", bild("koerper-hinten"), (0, 1, 0), (-1, 0, 0)),
             ("rechte Seite", bild("koerper-seite"), (-1, 0, 0), (0, -1, 0)), ("linke Seite", bild("koerper-seite", spiegeln=True), (1, 0, 0), (0, 1, 0))]
summe = np.zeros((n, 3), np.float32); gewicht = np.zeros(n, np.float32)
for name, (rgb, maske), zur, rechts in ANSICHTEN:
    hh, ww = maske.shape; s = P @ np.array(rechts, np.float32); t = P[:, 2]; tiefe = -(P @ np.array(zur, np.float32))             # tiefe: klein = nah an der Kamera
    u = (s - s.min()) / (s.max() - s.min()) * (ww - 1); v = (1 - (t - t.min()) / (t.max() - t.min())) * (hh - 1); ui = np.clip(np.round(u).astype(int), 0, ww - 1); vi = np.clip(np.round(v).astype(int), 0, hh - 1)
    nah = np.full((hh, ww), np.inf, np.float32); np.minimum.at(nah, (vi, ui), tiefe); nah = ndimage.minimum_filter(nah, 5)            # was liegt je Bildpunkt vorn?
    sichtbar = tiefe <= nah[vi, ui] + 0.035
    w = np.clip(N @ np.array(zur, np.float32), 0, 1) ** 3 * sichtbar * np.where(maske[vi, ui], 1.0, 0.35)                          # außerhalb des gezeichneten Umrisses zählt die Ansicht weniger
    summe += linear(rgb[vi, ui]) * w[:, None]; gewicht += w; print(f"{name:13} färbt {int((w > 0.05).sum()):6} Punkte · Modell außerhalb des Umrisses: {round(float(1 - maske[vi, ui][sichtbar].mean()) * 100)} %")
anteil = np.clip(gewicht / 0.25, 0, 1)[:, None]; farbe = summe / np.maximum(gewicht, 1e-6)[:, None] * anteil + alt * (1 - anteil)
print("ohne Farbe aus den Ansichten:", round(float((gewicht < 0.02).mean()) * 100, 1), "% der Punkte")

while me.color_attributes: me.color_attributes.remove(me.color_attributes[0])
ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((n, 1), np.float32)], 1).ravel()); me.color_attributes.render_color_index = 0; me.color_attributes.active_color_index = 0
mat = bpy.data.materials.new("koerper"); mat.use_nodes = True; nt = mat.node_tree; f = nt.nodes.new("ShaderNodeVertexColor"); f.layer_name = "Col"
nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9; me.materials.clear(); me.materials.append(mat)
os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True)
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
print("geschrieben:", ziel)
