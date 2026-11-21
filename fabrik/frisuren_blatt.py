"""Mythara Fabrik – Vorschaublatt für Frisuren: jede Frisur auf dem Grundkörper in allen 8 Richtungen (Kamera geneigt wie im Spiel).

  python3 fabrik/frisuren_blatt.py <koerper.glb> <blatt.png> <name>=<frisur.glb> [<name>=<frisur.glb> …] [groesse=170] [ganz]

ganz: ganze Figur statt Kopf und Schultern (zeigt, wie die Frisur in Spielgröße wirkt)
"""
import math, os, sys
import bpy
from mathutils import Vector
from PIL import Image, ImageDraw

koerper, blatt = sys.argv[1], sys.argv[2]; frisuren = [a.split("=", 1) for a in sys.argv[3:] if "=" in a and not a.startswith("groesse=")]
G = int(next((a.split("=")[1] for a in sys.argv[3:] if a.startswith("groesse=")), 170)); GANZ = "ganz" in sys.argv[3:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(koerper))
for o in bpy.data.objects:                                                                          # Textur direkt (der glTF-Import multipliziert sonst mit Punktfarben)
    for m in (o.data.materials if o.type == "MESH" else []):
        nt = m.node_tree if m else None; tx = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None) if nt else None
        if tx: b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); nt.links.new(tx.outputs[0], b.inputs["Base Color"])
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 16; sc.cycles.device = "CPU"; sc.render.resolution_x = sc.render.resolution_y = G; sc.render.film_transparent = True
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.7
for rot, en in (((math.radians(50), 0, math.radians(30)), 3.0), ((math.radians(60), 0, math.radians(200)), 1.4)):
    l = bpy.data.objects.new("l", bpy.data.lights.new("l", "SUN")); l.data.energy = en; l.rotation_euler = rot; sc.collection.objects.link(l)
cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.0 if GANZ else 0.55; sc.collection.objects.link(cam); sc.camera = cam
ziel_p = Vector((0, 0.02, 0.95 if GANZ else 1.6)); NEIGUNG = math.radians(30)
zeilen = []
for name, datei in frisuren:
    vorher = set(bpy.data.objects)
    if datei != "-": bpy.ops.import_scene.gltf(filepath=os.path.abspath(datei))                     # "-": ohne Frisur (Glatze)
    neu = [o for o in bpy.data.objects if o not in vorher]
    bilder = []
    for r in range(8):
        a = math.radians(45 * r); d = Vector((math.sin(a) * math.cos(NEIGUNG), -math.cos(a) * math.cos(NEIGUNG), math.sin(NEIGUNG)))
        cam.location = ziel_p + d * 5; cam.rotation_euler = (ziel_p - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = blatt + f".{r}.png"; bpy.ops.render.render(write_still=True); bilder.append(Image.open(sc.render.filepath).convert("RGBA")); os.remove(sc.render.filepath)
    z = Image.new("RGBA", (G * 8 + 120, G), (38, 36, 44, 255)); ImageDraw.Draw(z).text((8, G // 2 - 6), name, fill=(235, 228, 214))
    for i, b in enumerate(bilder): z.alpha_composite(b, (120 + G * i, 0))
    zeilen.append(z)
    for o in neu: bpy.data.objects.remove(o)
out = Image.new("RGBA", (G * 8 + 120, G * len(zeilen)), (38, 36, 44, 255))
for i, z in enumerate(zeilen): out.paste(z, (0, G * i))
out.save(blatt); print("Vorschaublatt:", blatt, out.size)
