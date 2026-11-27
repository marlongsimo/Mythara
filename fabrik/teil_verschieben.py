"""Mythara Fabrik – ein ans Skelett gebundenes Teil (<figur>.teile/<ebene>.glb) in der Ruhelage verschieben, ohne neu zu riggen.

  <blender-python> fabrik/teil_verschieben.py -- <teil.glb> [<teil.glb> …] [hoch=<m>] [entlang=<knochen>:<anteil>]

hoch=0.03               alle Punkte um 3 cm nach oben (Helme höher auf den Kopf)
entlang=unterarm.L:0.3  alle Punkte um 30 % der Länge des Knochens in seine Richtung (zum Kind hin) verschieben –
                        Schilde am linken Unterarm weiter zur Hand (rig.py setzt die Schildmitte auf 55 % des Unterarms; 0.3 → 85 %)
Skelett, Gewichte, Bindung (inverseBindMatrices), Bewegungen, Namen und Extras bleiben – Rundreise durch glTF wie fabrik/mobil_figuren.py.
Die Datei wird überschrieben; die .mobil.glb danach neu mit fabrik/mobil_figuren.py bauen.
"""
import os, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; dateien = [x for x in a_ if x.endswith(".glb")]; opt = dict(x.split("=", 1) for x in a_ if "=" in x)
for q in dateien:
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
    arm = next(o for o in bpy.data.objects if o.type == "ARMATURE"); netze = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("Icosphere")]
    d = Vector((0, 0, float(opt.get("hoch", 0))))
    if "entlang" in opt:
        kn, anteil = opt["entlang"].split(":"); b = arm.data.bones[kn]
        d += arm.matrix_world.to_3x3() @ ((b.tail_local - b.head_local) * float(anteil))
    for o in netze:
        dl = o.matrix_world.inverted().to_3x3() @ d
        for v in o.data.vertices: v.co += dl
        o.data.update()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(q), export_format="GLB", use_selection=True, export_skins=True, export_animations=True,
                              export_extras=True, export_image_format="WEBP", export_image_quality=90)
    print(f"VERSCHOBEN\t{q}\t{tuple(round(x, 3) for x in d)}")
