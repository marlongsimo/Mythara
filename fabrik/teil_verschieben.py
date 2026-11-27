"""Mythara Fabrik – ein ans Skelett gebundenes Teil (<figur>.teile/<ebene>.glb) in der Ruhelage verschieben, ohne neu zu riggen.

  <blender-python> fabrik/teil_verschieben.py -- <teil.glb> [<teil.glb> …] [hoch=<m>] [entlang=<knochen>:<anteil>]

hoch=0.03               alle Punkte um 3 cm nach oben (Helme höher auf den Kopf)
drehen=flaeche:90 [oben_nach=-x]  um die eigene Flächennormale drehen, die Oberseite zeigt danach zu oben_nach (Ruhelage; -x = aus Sicht der Kamera links)
drehen=y:-90            um eine feste Achse x|y|z der Ruhelage drehen (Grad)
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
    if "drehen" in opt:                                                                          # drehen=<x|y|z>:<grad> um die Mitte des Teils (Achse der Ruhelage; y = Blickrichtung der Spielkamera)
        from mathutils import Matrix
        ach, grad = opt["drehen"].split(":"); import math as _m
        P = [o.matrix_world @ v.co for o in netze for v in o.data.vertices]; mi = Vector([min(p[i] for p in P) for i in range(3)]); ma = Vector([max(p[i] for p in P) for i in range(3)]); c = (mi + ma) / 2
        if ach == "flaeche":                                                                     # um die eigene Flächennormale (dünnste Achse) – das Teil bleibt flach zur selben Seite
            import numpy as _np
            Q = _np.array([tuple(p) for p in P]); Q -= Q.mean(0); w_, V_ = _np.linalg.eigh(_np.cov(Q.T)); n = Vector(V_[:, 0]) if "achse" not in opt else Vector([float(x) for x in opt["achse"].split(",")]).normalized()   # achse=x,y,z: Normale vorgeben (gewölbte Schilde)
            ziel_ = {"-x": Vector((-1, 0, 0)), "x": Vector((1, 0, 0)), "-y": Vector((0, -1, 0)), "y": Vector((0, 1, 0))}[opt.get("oben_nach", "-x")]
            Rs = [Matrix.Rotation(_m.radians(s_ * abs(float(grad))), 4, n) for s_ in (1, -1)]
            R = max(Rs, key=lambda M: (M.to_3x3() @ Vector((0, 0, 1))).dot(ziel_))                 # Drehsinn so, dass die Oberseite zu oben_nach zeigt
        else: R = Matrix.Rotation(_m.radians(float(grad)), 4, ach.upper())
        for o in netze:
            Mi = o.matrix_world.inverted()
            for v in o.data.vertices: v.co = Mi @ (c + R @ (o.matrix_world @ v.co - c))
            o.data.update()
    for o in netze:
        dl = o.matrix_world.inverted().to_3x3() @ d
        for v in o.data.vertices: v.co += dl
        o.data.update()
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(q), export_format="GLB", use_selection=True, export_skins=True, export_animations=True,
                              export_extras=True, export_image_format="WEBP", export_image_quality=90)
    print(f"VERSCHOBEN\t{q}\t{tuple(round(x, 3) for x in d)}")
