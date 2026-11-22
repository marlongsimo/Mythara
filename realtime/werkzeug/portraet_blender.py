"""Mythara – Porträts des eigenen Helden für die Nahansicht im Heldeneditor rendern (läuft in Blender).

  blender -b -P werkzeug/portraet_blender.py -- <ausgabe-ordner> <koerper.glb> <ebene>=<teil.glb> [<ebene>=<teil.glb> …]

Kopf und Schultern aus fast gleicher Höhe (8° Aufsicht), in 8 Richtungen (0 = Osten, im Uhrzeigersinn, wie im Spiel), je Ebene ein Bild:
  koerper_<r>.png            der Körper allein
  <ebene>_<r>.png            nur dieses Teil (Frisur, Bart); der Körper schneidet aus, was er verdeckt (Holdout) – die Ebenen lassen sich frei kombinieren
Die Figur dreht sich, Kamera und Licht stehen (wie in fabrik/rendern.py). Zusammengesetzt werden die Streifen von werkzeug/portraet.py.
"""
import bpy, math, os, sys
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]; aus, koerper_glb, teile = args[0], args[1], [a.split("=", 1) for a in args[2:]]
os.makedirs(aus, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
dreh = bpy.data.objects.new("dreh", None); sc.collection.objects.link(dreh)
def laden(pfad):
    vor = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=pfad); neu = [o for o in bpy.data.objects if o not in vor]
    for o in neu:
        if o.parent is None: o.parent = dreh
    return [o for o in neu if o.type == "MESH"]
koerper = laden(koerper_glb); ebenen = {name: laden(p) for name, p in teile}
# Kopfmitte: oberstes Stück des Körpers
pkte = [o.matrix_world @ Vector(c) for o in koerper for c in o.bound_box]; oben = max(p.z for p in pkte)
mitte_z = oben - 0.17; GROESSE = 0.54; N = math.radians(8.0); AUFL = 384
sc.render.engine = "CYCLES"; sc.cycles.samples = 32; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False; sc.render.film_transparent = True
sc.render.resolution_x = sc.render.resolution_y = AUFL; sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = GROESSE
cam.location = (0, -10 * math.cos(N), mitte_z + 10 * math.sin(N)); cam.rotation_euler = (math.radians(90) - N, 0, 0); sc.camera = cam
for name, rot, staerke in [("haupt", (50, 0, -40), 5.0), ("fuell", (65, 0, 60), 1.6), ("rand", (-40, 0, 170), 1.2)]:
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 0.35
def zeigen(sichtbar, holdout):
    for o in [o for l in [koerper, *ebenen.values()] for o in l]:
        o.hide_render = o not in sichtbar and o not in holdout; o.is_holdout = o in holdout
for r in range(8):
    dreh.rotation_euler = (0, 0, math.radians(90 - 45 * r)); bpy.context.view_layer.update()
    zeigen(set(koerper), set()); sc.render.filepath = os.path.join(aus, f"koerper_{r}.png"); bpy.ops.render.render(write_still=True)
    for name, obs in ebenen.items():
        zeigen(set(obs), set(koerper)); sc.render.filepath = os.path.join(aus, f"{name}_{r}.png"); bpy.ops.render.render(write_still=True)
    print(f"Richtung {r} fertig", flush=True)
