"""Mythara Fabrik – aus einer fertig geriggten Erwachsenen-Figur ein Kind machen (vor export3d.py).

  python3 fabrik/kind.py <figur.blend> <ziel.blend> [groesse=0.68] [kopf=1.22]
Die ganze Figur wird kleiner (Skelett-Objekt × groesse, ~1,22 m statt 1,80 m), der Kopf samt Haar wird relativ größer
(Kopfknochen in jeder Bewegung × kopf) – kindliche Proportionen. Bewegungen und Teile bleiben sonst unverändert.
"""
import os, sys
import bpy
quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
G, K = float(opt.get("groesse", 0.68)), float(opt.get("kopf", 1.22))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(quelle))
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE"); arm.scale = (G, G, G)
pb = arm.pose.bones["kopf"]; alt = arm.animation_data.action
for a in bpy.data.actions:
    if not a.get("bilder"): continue
    arm.animation_data.action = a; f0, f1 = (int(x) for x in a.frame_range)
    for f in range(f0, f1 + 1):
        pb.scale = (K, K, K); pb.keyframe_insert("scale", frame=f)
    print("Kopf vergrößert in", a.name)
arm.animation_data.action = alt; pb.scale = (K, K, K)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ziel)); print(f"Kind: Größe ×{G}, Kopf ×{K} → {ziel}")
