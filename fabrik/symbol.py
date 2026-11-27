"""Mythara Fabrik – Rucksackbild (256 × 256, durchsichtig) aus einem 3D-Modell (glb oder blend), schräg von oben, mit weichem Licht.

  python3 fabrik/symbol.py -- <modell> <ziel.webp> [kipp=25] [dreh=30] [rolle=0] [matt=1] [fuellen=0.92]
matt=1: leuchtende Farben (Adern, Zeichen) stumpf grau-violett machen – z. B. „Wegstein (ungeweiht)“.
"""
import math, os, sys
import numpy as np
import bpy
from mathutils import Vector
a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
if q.endswith(".blend"): bpy.ops.wm.open_mainfile(filepath=os.path.abspath(q))
else: bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
sc = bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in ("CAMERA", "LIGHT") or o.name.startswith("Icosphere"): bpy.data.objects.remove(o)   # Icosphere: Knochenform aus dem Figuren-Export (Teile), nicht mitrahmen
if opt.get("matt") == "1":
    for im in bpy.data.images:
        w, h = im.size
        if not w: continue
        a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); rgb = a[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1); s = (mx - mn) / (mx + 1e-6)
        k = np.maximum(np.clip((s - 0.3) / 0.2, 0, 1) * np.clip((mx - 0.4) / 0.2, 0, 1), np.clip((mx - 0.7) / 0.12, 0, 1))   # helle, farbige Stellen und der weiße Kern = Leuchten
        grau = (mx * 0.42)[..., None] * np.array([0.92, 0.88, 1.0]); a[..., :3] = rgb * (1 - k[..., None]) + grau * k[..., None]; im.pixels[:] = a.ravel(); im.update()
wurzeln = [o for o in bpy.data.objects if o.parent is None and o.type in ("MESH", "EMPTY")]
g = bpy.data.objects.new("halter", None); sc.collection.objects.link(g)
for o in wurzeln: o.parent = g
g.rotation_euler = (math.radians(-float(opt.get("kipp", 25))), math.radians(float(opt.get("rolle", 0))), math.radians(float(opt.get("dreh", 30))))   # rolle: schräg ins Bild legen (lange Werkzeuge); bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); ps = [o.matrix_world @ v.co for o in bpy.data.objects if o.type == "MESH" for v in o.evaluated_get(dg).data.vertices]   # echte Punkte (gedrehte Hüllquader wären zu groß)
lo = Vector([min(p[i] for p in ps) for i in range(3)]); hi = Vector([max(p[i] for p in ps) for i in range(3)]); c = (lo + hi) / 2
eng = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]; sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in eng else "BLENDER_EEVEE"
sc.render.resolution_x = sc.render.resolution_y = 512; sc.render.film_transparent = True; sc.view_settings.view_transform = "Standard"
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
l = bpy.data.objects.new("l", bpy.data.lights.new("l", "SUN")); l.data.energy = 3.4; l.rotation_euler = (math.radians(40), 0, math.radians(-30)); sc.collection.objects.link(l)
cam = bpy.data.objects.new("k", bpy.data.cameras.new("k")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = "ORTHO"
cam.data.ortho_scale = max(hi.x - lo.x, hi.z - lo.z) / float(opt.get("fuellen", 0.92)); cam.location = c + Vector((0, -10, 0)); cam.rotation_euler = (math.radians(90), 0, 0)
png = os.path.abspath(ziel) + ".png"; sc.render.filepath = png; bpy.ops.render.render(write_still=True)
from PIL import Image
Image.open(png).resize((256, 256), Image.LANCZOS).save(ziel, "WEBP", quality=90); os.remove(png); print("Symbol:", ziel)
