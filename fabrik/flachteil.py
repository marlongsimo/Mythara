"""Mythara Fabrik – ein flaches Ausrüstungsteil (Schwert, Schild) aus seiner Zeichnung als 3D-Teil bauen.

  python3 fabrik/flachteil.py <vorn.png> <ziel.glb> <laenge_m> <dicke_m> [hinten.png]

vorn.png   freigestelltes Bild der Vorderseite (aus referenz/teile/); hinten.png die Rückseite (sonst wird die Vorderseite gespiegelt)
laenge_m   die längere Seite des Teils in Metern (Schwert 0.95, Schild 0.85)
dicke_m    größte Dicke in Metern (Schwert 0.03, Schild 0.06)

Das Teil liegt in der x-z-Ebene: Bild oben = +z, Vorderseite zeigt nach -y, der Ursprung ist die Mitte des Bildes.
Die Form ist ein Kissen: am Umriss dünn, zur Mitte hin bis zur angegebenen Dicke. Für flache Dinge reicht das; es ist kein Bild-zu-3D-Dienst nötig.
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

vorn, ziel, laenge, dicke = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]); hinten = sys.argv[5] if len(sys.argv) > 5 else None
SEITE = 384   # Rechengröße der längeren Seite in Bildpunkten


def lesen(pfad, groesse=None, spiegeln=False):
    im = Image.open(pfad).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
    if spiegeln: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if groesse is None: k = SEITE / max(im.size); groesse = (max(2, round(im.width * k)), max(2, round(im.height * k)))
    a = np.asarray(im.resize(groesse, Image.LANCZOS)); maske = a[..., 3] > 128
    idx = ndimage.distance_transform_edt(~maske, return_distances=False, return_indices=True); return a[..., :3][idx[0], idx[1]], maske


rgb_v, m = lesen(vorn); H, W = m.shape; m = ndimage.binary_fill_holes(m)
rgb_h, _ = lesen(hinten or vorn, (W, H), spiegeln=True)                                           # von hinten gesehen ist links und rechts vertauscht
tex = Image.new("RGB", (2 * W, H)); tex.paste(Image.fromarray(rgb_v), (0, 0)); tex.paste(Image.fromarray(rgb_h), (W, 0))
textur = os.path.splitext(ziel)[0] + "-textur.png"; os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True); tex.save(textur)

k = laenge / max(W, H); dt = ndimage.distance_transform_edt(m); rund = max(2.0, dicke / 2 / k * 1.5)                # nach so vielen Bildpunkten ist die volle Dicke erreicht
halb = (dicke / 2) * np.sqrt(np.clip((dt - 1) / rund, 0, 1)); halb = ndimage.gaussian_filter(halb, 1.0) * m
jj, ii = np.where(m); nr = -np.ones(m.shape, int); nr[m] = np.arange(m.sum()); n = len(jj)
kante = (m & ~ndimage.binary_erosion(m, np.ones((3, 3), bool)))[jj, ii]; t = np.where(kante, 0, halb[jj, ii])
x = (ii - W / 2) * k; z = (H / 2 - jj) * k
P = np.concatenate([np.stack([x, -t, z], 1), np.stack([x, t, z], 1)]); uv = np.concatenate([np.stack([ii / W / 2, 1 - jj / H], 1), np.stack([0.5 + ii / W / 2, 1 - jj / H], 1)])
q = m[:-1, :-1] & m[1:, :-1] & m[:-1, 1:] & m[1:, 1:]; a, b, c, d = nr[:-1, :-1][q], nr[1:, :-1][q], nr[1:, 1:][q], nr[:-1, 1:][q]
F = np.concatenate([np.stack([a, b, c, d], 1), np.stack([d + n, c + n, b + n, a + n], 1)])

import bpy
bpy.ops.wm.read_factory_settings(use_empty=True); name = os.path.splitext(os.path.basename(ziel))[0]
me = bpy.data.meshes.new(name); me.from_pydata(P.tolist(), [], F.tolist()); me.update(); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
lage = me.uv_layers.new(name="uv"); ecken = np.zeros(len(me.loops), int); me.loops.foreach_get("vertex_index", ecken); lage.data.foreach_set("uv", uv[ecken].astype(np.float32).ravel())
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=k * 0.3)
bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT"); bpy.ops.object.shade_smooth()
d_ = ob.modifiers.new("weniger", "DECIMATE"); d_.ratio = min(1.0, 6000 / max(1, len(me.polygons))); bpy.ops.object.modifier_apply(modifier="weniger")      # ein flaches Teil braucht kein dichtes Netz
mat = bpy.data.materials.new(name); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes["Principled BSDF"]; t_ = nt.nodes.new("ShaderNodeTexImage"); t_.image = bpy.data.images.load(textur)
nt.links.new(t_.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = 0.8; me.materials.append(mat)
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
print(f"{name}: {round(W * k, 3)} x {round(H * k, 3)} m, Dicke {dicke} m · {len(me.vertices)} Punkte, {len(me.polygons)} Flächen · geschrieben: {ziel}")
