"""Mythara Fabrik – zu jedem Datenblatt (fabrik/assets/waffen/<klasse>/<n-stufe>/<gegenstand>/datenblatt.json) ein Vorschaubild vorschau.png:
das Modell dieser Stufe (Spieldatei des Mannes), Breitseite zur Kamera, Griff oben (Cycles, wie die Stufenbilder).
  python3 fabrik/datenblatt_bilder.py [nur_fehlende=1]
"""
import bpy, sys, os, glob, json, math
from mathutils import Vector, Matrix, Quaternion
opt = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a); NUR = opt.get("nur_fehlende", "1") == "1"
blaetter = sorted(glob.glob("fabrik/assets/waffen/*/*/*/datenblatt.json")); n = 0
for b in blaetter:
    ziel = os.path.join(os.path.dirname(b), "vorschau.png")
    if NUR and os.path.exists(ziel): continue
    d = json.load(open(b)); glb = d["modell"]["spiel_mann"]
    if not os.path.exists(glb): print("fehlt:", glb); continue
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene; bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
    m = next(o for o in bpy.data.objects if o.type == "MESH" and o.parent is not None); mw = m.matrix_world.copy()
    for o in list(bpy.data.objects):
        if o is not m: bpy.data.objects.remove(o)
    m.matrix_world = mw; bpy.context.view_layer.objects.active = m; m.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    V = [v.co for v in m.data.vertices]; c = Vector([(max(v[k] for v in V) + min(v[k] for v in V)) / 2 for k in range(3)]); m.data.transform(Matrix.Translation(-c))
    a = max(V, key=lambda p: p.length).normalized(); m.rotation_mode = "QUATERNION"; m.rotation_quaternion = a.rotation_difference(Vector((0, 0, -1)))
    bpy.context.view_layer.update(); W = [m.matrix_world @ v.co for v in m.data.vertices]
    if max(p.y for p in W) - min(p.y for p in W) > max(p.x for p in W) - min(p.x for p in W): m.rotation_quaternion = Quaternion((0, 0, 1), math.pi / 2) @ m.rotation_quaternion
    bpy.context.view_layer.update(); W = [m.matrix_world @ v.co for v in m.data.vertices]; gross = max(max(p.z for p in W) - min(p.z for p in W), (max(p.x for p in W) - min(p.x for p in W)) * 2)
    sc.render.engine = "CYCLES"; sc.cycles.samples = 24; sc.cycles.device = "CPU"; sc.render.resolution_x = 300; sc.render.resolution_y = 600; sc.render.film_transparent = True
    sc.world = bpy.data.worlds.new("w"); sc.world.use_nodes = True; sc.world.node_tree.nodes["Background"].inputs[0].default_value = (0.03, 0.035, 0.045, 1)
    for pos, e in (((-2, -3, 3), 900), ((3, -2, 1), 400), ((0, 3, 2), 300)):
        l = bpy.data.lights.new("l", "AREA"); l.energy = e; l.size = 2; lo = bpy.data.objects.new("l", l); lo.location = pos; sc.collection.objects.link(lo); lo.rotation_euler = (Vector((0, 0, 0)) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    cam = bpy.data.objects.new("c", bpy.data.cameras.new("c")); cam.data.type = "ORTHO"; cam.data.ortho_scale = gross * 1.1; sc.collection.objects.link(cam); sc.camera = cam
    cam.location = (0, -4, 0); cam.rotation_euler = (math.radians(90), 0, 0); sc.render.filepath = os.path.abspath(ziel); bpy.ops.render.render(write_still=True); n += 1
print(f"Vorschaubilder: {n} neu, {len(blaetter)} Datenblätter")
