"""Mythara Fabrik – Fußpunkt einer Bewegung festhalten: in jedem Bild steht der tiefste Punkt des Körpers genau auf dem Boden.

  python3 fabrik/boden.py <figur.blend> <ziel.blend> <bewegung>[,<bewegung>…]

Ändert nur die Höhe des Beckens in den genannten Bewegungen, sonst nichts (keine Gelenkwinkel, keine Ausrüstung).
Ohne das sinkt die Figur beim Laufen bis zu einigen Zentimetern in den Boden oder schwebt darüber, und ihr Fußpunkt springt im Spiel.
"""
import json, sys
import numpy as np
import bpy
from mathutils import Vector

quelle, ziel, namen = sys.argv[1], sys.argv[2], sys.argv[3].split(",")
bpy.ops.wm.open_mainfile(filepath=quelle); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; koerper = next(o for o in bpy.data.objects if o.get("ebene") == "koerper"); becken = arm.pose.bones["becken"]
def tiefster():
    dg = bpy.context.evaluated_depsgraph_get(); k = koerper.evaluated_get(dg); me = k.to_mesh(); P = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get("co", P)
    w = float((np.array(koerper.matrix_world) @ np.c_[P.reshape(-1, 3), np.ones(len(me.vertices))].T)[2].min()); k.to_mesh_clear(); return w
auf = arm.data.bones["becken"].matrix_local.to_3x3().inverted()                                    # „nach oben“ in der Richtung des Beckenknochens (Menschen: er zeigt nach oben; Tiere: nach vorn)
for name in namen:
    a = bpy.data.actions[name]; arm.animation_data.action = a; vorher, nachher = [], []; n = int(a["bilder"])
    flug = set(json.loads(a.get("mehr", "{}")).get("sprung", []))                                    # Flugbilder eines Sprungs: sie bleiben in der Luft
    tief = []
    for i in range(n): sc.frame_set(i + 1); bpy.context.view_layer.update(); tief.append(tiefster())
    am_boden = [i for i in range(n) if i not in flug]
    for i in range(n):
        if i in flug: nb = sorted(am_boden, key=lambda j: min(abs(j - i), n - abs(j - i)))[:2]; z = sum(tief[j] for j in nb) / len(nb)   # wie die Bilder davor und danach
        else: z = tief[i]
        vorher.append(tief[i]); sc.frame_set(i + 1); bpy.context.view_layer.update()
        becken.location = becken.location + auf @ Vector((0, 0, -z))
        becken.keyframe_insert("location", frame=i + 1, group="becken"); sc.frame_set(i + 1); bpy.context.view_layer.update(); nachher.append(tiefster())
    if flug: print(f"{name}: Flugbilder {sorted(flug)} bleiben in der Luft (höchster tiefster Punkt {max(nachher) * 100:.0f} cm)")
    print(f"{name}: tiefster Punkt vorher {min(vorher) * 100:+.1f} bis {max(vorher) * 100:+.1f} cm · nachher {min(nachher) * 100:+.2f} bis {max(nachher) * 100:+.2f} cm")
arm.animation_data.action = bpy.data.actions["ruhe"]; sc.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
