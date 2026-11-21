"""Mythara Fabrik – einen Zauberstab aus einem gezeichneten Stabkopf und einem gerechneten Schaft bauen.

  python3 fabrik/stab.py <kopf.glb> <ziel.glb> [schaft=1.25] [dicke=0.022] [holz=#3a2a22] [gold=#b8893c]

kopf.glb   der Stabkopf aus flachteil.py, mit drehen=180 gebaut: der Kopf (Kristall, Kugel) zeigt nach -z
Ergebnis   wie ein Schwert für rig.py: oben (+z) das Schaftende, unten (-z) der Kopf; mit "griff" ≈ 0.55 steht der Kopf über der Hand
           (die Stabhaltung richtet die Klinge, hier den Kopf, nach oben). Der Kopf ist flach (Zeichnung), der Schaft rund.
"""
import sys
import bpy
from mathutils import Vector

kopf, ziel = sys.argv[1], sys.argv[2]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
SCHAFT = float(opt.get("schaft", 1.25)); R = float(opt.get("dicke", 0.022))
def farbe(h): h = h.lstrip("#"); return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1.0,)
def stoff(name, hexwert, rau, met):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = farbe(hexwert); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = met; return m
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=kopf)
k = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = k; k.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o is not k: bpy.data.objects.remove(o)
e = [Vector(c) for c in k.bound_box]; oben = max(v.z for v in e)                                   # das obere Ende des Kopfes: dort setzt der Schaft an (etwas überlappend)
HOLZ = stoff("holz", opt.get("holz", "#3a2a22"), 0.8, 0.0); GOLD = stoff("gold", opt.get("gold", "#b8893c"), 0.35, 0.9); teile = [k]
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=R, depth=SCHAFT, location=(0, 0, oben - 0.04 + SCHAFT / 2)); s = bpy.context.object; s.data.materials.append(HOLZ); teile.append(s)
for t in (0.0, 0.35, 0.62, 1.0):                                                                  # Goldringe am Schaft, oben eine Endkappe
    bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=R * 1.35, depth=0.03, location=(0, 0, oben - 0.04 + SCHAFT * t)); r = bpy.context.object; r.data.materials.append(GOLD); teile.append(r)
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = k; bpy.ops.object.join(); o = bpy.context.object; o.name = "stab"
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
e = [Vector(c) for c in o.bound_box]; print(f"Stab: {max(v.z for v in e) - min(v.z for v in e):.2f} m lang (Kopf {oben - min(v.z for v in e):.2f} m) · geschrieben: {ziel}")
