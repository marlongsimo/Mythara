"""Mythara Fabrik – einen Meshy-Baum als 3D-Spieldatei für die offene Welt ausgeben (Blender).
  python3 fabrik/baum_export.py -- <meshy.blend> <ziel.glb> <höhe in m> [textur=1024]
Stammfuß in den Ursprung, auf die gewünschte Höhe skaliert, Textur verkleinert (WebP). Das Spiel zeichnet den Baum live mit three.js
(echt3d/darsteller.ts → BaumBild): eigene Drehung, Kronenfarbe und Wind je Standort."""
import bpy, sys, os
from mathutils import Vector
a = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel, hoehe = a[0], a[1], float(a[2]); opt = dict(x.split("=", 1) for x in a[3:] if "=" in x); T = int(opt.get("textur", 1024))
bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
o = [x for x in bpy.data.objects if x.type == "MESH"][0]; o.rotation_mode = "XYZ"
bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
ps = [v.co for v in o.data.vertices]; lo = Vector([min(p[i] for p in ps) for i in range(3)]); hi = Vector([max(p[i] for p in ps) for i in range(3)])
# Stammfuß: Mitte der untersten 5 % der Punkte
unten = [p for p in ps if p.z < lo.z + 0.05 * (hi.z - lo.z)]; fuss = Vector((sum(p.x for p in unten) / len(unten), sum(p.y for p in unten) / len(unten), lo.z))
f = hoehe / (hi.z - lo.z)
for v in o.data.vertices: v.co = (v.co - fuss) * f
for im in bpy.data.images:
    if im.size[0] > T: im.scale(T, T)
o.name = "baum"; bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP", export_animations=False)
print("Baum:", ziel, "Höhe", hoehe, "m · Breite", round((hi.x - lo.x) * f, 2), "m · Punkte", len(ps), "· Größe", os.path.getsize(ziel) // 1024, "KB")
