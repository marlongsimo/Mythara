"""Mythara Fabrik – ein Modell (GLB) in acht Richtungen rendern, zur Kontrolle.

  python3 fabrik/rundum.py <modell.glb> <ziel.png> [drehung=x,y,z in Grad] [feld=256]

Das Modell wird auf 1,80 m Höhe gebracht, mit den Füßen auf den Boden und mittig gestellt. drehung richtet es vorher aus (Blick nach -y, oben = z).
Kamera und Licht wie im Stilstandard: schräg von vorn oben (35 Grad), die Figur dreht sich, das Licht bleibt stehen.
Reihenfolge der Bilder: O, SO, S, SW, W, NW, N, NO (0 = Osten, im Uhrzeigersinn am Bildschirm).
Modelle ohne Textur, aber mit Punktfarben, werden mit den Punktfarben gezeigt.
"""
import math, os, sys
import bpy
from mathutils import Vector
from PIL import Image

quelle, ziel = sys.argv[1], sys.argv[2]; dreh = [float(v) for v in sys.argv[3].split(",")] if len(sys.argv) > 3 else [0, 0, 0]; feld = int(sys.argv[4]) if len(sys.argv) > 4 else 256
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
teile = [o for o in bpy.data.objects if o.type == "MESH"]; bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]
if len(teile) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active; bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); ob.rotation_mode = "XYZ"
ob.rotation_euler = tuple(math.radians(v) for v in dreh); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
e = [ob.matrix_world @ Vector(c) for c in ob.bound_box]; lo = Vector([min(v[i] for v in e) for i in range(3)]); hi = Vector([max(v[i] for v in e) for i in range(3)])
k = 1.8 / (hi.z - lo.z); ob.location = (-(lo.x + hi.x) / 2 * k, -(lo.y + hi.y) / 2 * k, -lo.z * k); ob.scale = (k, k, k); bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
print("Maße (m): breit", round((hi.x - lo.x) * k, 2), "tief", round((hi.y - lo.y) * k, 2), "hoch 1.8 ·", len(ob.data.vertices), "Punkte,", len(ob.data.polygons), "Flächen")
bpy.ops.object.shade_smooth()
if ob.data.color_attributes and not any(n.type == "TEX_IMAGE" for m in ob.data.materials if m and m.use_nodes for n in m.node_tree.nodes):
    mat = bpy.data.materials.new("punktfarben"); mat.use_nodes = True; nt = mat.node_tree; f = nt.nodes.new("ShaderNodeVertexColor"); f.layer_name = ob.data.color_attributes[0].name
    nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9; ob.data.materials.clear(); ob.data.materials.append(mat)

sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 24; sc.cycles.device = "CPU"; sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = feld
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
n = math.radians(35); cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.3
cam.location = (0, -10 * math.cos(n), 0.9 + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, 0); sc.camera = cam
for name, rot, staerke in [("haupt", (50, 0, -40), 5.0), ("fuell", (65, 0, 60), 1.6), ("rand", (-40, 0, 170), 1.2)]:
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 1.3
bogen = Image.new("RGBA", (feld * 4, feld * 2), (52, 44, 60, 255))
for i in range(8):
    ob.rotation_euler = (0, 0, math.radians(90 - 45 * i)); sc.render.filepath = ziel + f".{i}.png"; bpy.ops.render.render(write_still=True)
    bogen.alpha_composite(Image.open(sc.render.filepath), (i % 4 * feld, i // 4 * feld)); os.remove(sc.render.filepath)
bogen.convert("RGB").save(ziel); print("geschrieben:", ziel)
