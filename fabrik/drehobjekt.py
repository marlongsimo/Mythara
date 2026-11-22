"""Mythara Fabrik – ein Beuteobjekt (Splitter, Münze, Trank) als schwebende, sich drehende GLB für Echtzeit-3D.

  python3 fabrik/drehobjekt.py <quelle.blend|.glb> <ziel.glb> [hoehe=0.4] [schwebe=0.12] [dauer=3] [wippen=0.03] [textur=512]
Das Modell wird mittig gestellt, auf „hoehe“ (m) gebracht und schwebt „schwebe“ (m) über dem Boden (Ursprung = Bodenpunkt).
Animation „drehen“ (Schleife): eine volle Drehung um die Hochachse in „dauer“ Sekunden, gleichmäßig; dazu leichtes Auf und Ab („wippen“ m).
"""
import math, os, sys
import bpy
quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
H, SCH, D, W, T = float(opt.get("hoehe", 0.4)), float(opt.get("schwebe", 0.12)), float(opt.get("dauer", 3)), float(opt.get("wippen", 0.03)), int(opt.get("textur", 512))
if quelle.endswith(".blend"): bpy.ops.wm.open_mainfile(filepath=os.path.abspath(quelle))
else: bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
netze = [o for o in bpy.data.objects if o.type == "MESH"]
for o in list(bpy.data.objects):
    if o.type not in ("MESH",): bpy.data.objects.remove(o)
bpy.ops.object.select_all(action="DESELECT")
for o in netze: o.select_set(True)
bpy.context.view_layer.objects.active = netze[0]
if len(netze) > 1: bpy.ops.object.join()
o = bpy.context.view_layer.objects.active; bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
P = [v.co for v in o.data.vertices]; z0, z1 = min(p.z for p in P), max(p.z for p in P); cx = (min(p.x for p in P) + max(p.x for p in P)) / 2; cy = (min(p.y for p in P) + max(p.y for p in P)) / 2
s = H / (z1 - z0)
for v in o.data.vertices: v.co = ((v.co.x - cx) * s, (v.co.y - cy) * s, (v.co.z - z0) * s)
o.data.update(); o.name = "splitter" if "splitter" in os.path.basename(ziel) else os.path.splitext(os.path.basename(ziel))[0]
for img in bpy.data.images:
    if img.size[0] > T: img.scale(T, max(1, int(img.size[1] * T / img.size[0]))); img.pack()
sc = bpy.context.scene; sc.render.fps = 24; n = int(round(D * 24)); sc.frame_start, sc.frame_end = 0, n
o.animation_data_create(); o.animation_data.action = bpy.data.actions.new("drehen")
o.rotation_mode = "XYZ"                                                                    # glTF-Import stellt auf Quaternion: dann wirkte die Euler-Drehung nicht
o.rotation_euler = (0, 0, 0); o.keyframe_insert("rotation_euler", index=2, frame=0); o.rotation_euler = (0, 0, 2 * math.pi); o.keyframe_insert("rotation_euler", index=2, frame=n)
for f, z in ((0, SCH), (n // 2, SCH + W), (n, SCH)): o.location = (0, 0, z); o.keyframe_insert("location", index=2, frame=f)
def kurven(a):
    if hasattr(a, "fcurves") and len(a.fcurves): return list(a.fcurves)
    return [fc for L in getattr(a, "layers", []) for st in L.strips for cb in st.channelbags for fc in cb.fcurves]
for fc in kurven(o.animation_data.action):
    if fc.data_path == "rotation_euler":
        for k in fc.keyframe_points: k.interpolation = "LINEAR"                              # gleichmäßig drehen, ohne Abbremsen am Ende der Schleife
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_animations=True, export_image_format="WEBP", export_force_sampling=True)
print(f"Drehobjekt: {ziel} · {H} m hoch, schwebt {SCH} m, eine Drehung in {D} s · {os.path.getsize(ziel) / 1e6:.2f} MB")
