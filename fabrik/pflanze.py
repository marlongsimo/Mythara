"""Mythara Fabrik – Sammelpflanzen (Flachs, Hanf) in Blender bauen und als 3D-Spieldatei ausgeben.

  python3 fabrik/pflanze.py -- <art> <zustand> <ziel.glb> [vorschau.png]
  art: flachs | hanf      zustand: voll | geerntet (Stoppeln)

Flachs: ein Büschel aus etwa 30 schlanken Halmen (bis 0,9 m) mit schmalen Blättern, zartblauen Blüten (leicht lavendel, damit der
Spiel-Shader sie nicht als leuchtende Ader pulsieren lässt) und runden Samenkapseln.
Hanf: fünf bis sieben kräftige Stängel (bis 1,3 m) mit gefingerten Blättern (7 gezähnte Fiedern) und dichten Blütenständen an der Spitze.
Geerntet: kurze, schräg abgeschnittene Stoppeln und ein paar liegende Blätter.
Nur einfache Farben (kein Bild) – sie gehen so ins glTF; das Spiel lässt die Pflanzen im Wind wiegen (Shader, nach der Höhe).
"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector, Matrix

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZUSTAND, ZIEL = a_[0], a_[1], a_[2]; VORSCHAU = a_[3] if len(a_) > 3 else None
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(7 if ART == "flachs" else 11)
def mat(name, farbe, rau=0.75):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = list(farbe) + [1]; b.inputs["Roughness"].default_value = rau
    return m
def lin(c): return tuple(((x / 255 + 0.055) / 1.055) ** 2.4 if x / 255 > 0.04045 else x / 255 / 12.92 for x in c)
teile = []
def halm(p0, richtung, laenge, dicke, m, n=6, kruemmung=0.15):
    """ein Stängel als dünne Röhre entlang einer leicht gebogenen Linie; gibt die Punkte der Linie zurück"""
    pts = []; d = Vector(richtung).normalized(); seit = Vector((random.uniform(-1, 1), random.uniform(-1, 1), 0)).normalized() * kruemmung
    for i in range(n + 1):
        t = i / n; pts.append(Vector(p0) + d * laenge * t + seit * laenge * t * t)
    kurve = bpy.data.curves.new("halm", "CURVE"); kurve.dimensions = "3D"; s = kurve.splines.new("POLY"); s.points.add(len(pts) - 1)
    for i, p in enumerate(pts): s.points[i].co = (*p, 1); s.points[i].radius = 1 - 0.6 * i / n
    kurve.bevel_depth = dicke; kurve.bevel_resolution = 1; kurve.use_fill_caps = True
    o = bpy.data.objects.new("halm", kurve); bpy.context.collection.objects.link(o); o.data.materials.append(m); teile.append(o); return pts
def blatt(ort, richtung, laenge, breite, m, kipp=0.6, form="lanzett"):
    """flaches Blatt als Fläche (spitz zulaufend), in Richtung ausgerichtet und nach unten gekippt"""
    bm = bmesh.new(); seg = 5; vs_l, vs_r = [], []
    for i in range(seg + 1):
        t = i / seg; w = breite * (math.sin(math.pi * t) ** (0.8 if form == "lanzett" else 0.5)) * (1 - 0.2 * t)
        y = laenge * t; vs_l.append(bm.verts.new((-w / 2, y, 0.02 * laenge * math.sin(math.pi * t)))); vs_r.append(bm.verts.new((w / 2, y, 0.02 * laenge * math.sin(math.pi * t))))
    for i in range(seg): bm.faces.new((vs_l[i], vs_r[i], vs_r[i + 1], vs_l[i + 1]))
    me = bpy.data.meshes.new("blatt"); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new("blatt", me); bpy.context.collection.objects.link(o)
    d = Vector(richtung); d.z = 0; d = d.normalized() if d.length > 1e-6 else Vector((0, 1, 0))
    o.rotation_euler = (-kipp, 0, math.atan2(-d.x, d.y)); o.location = ort; o.data.materials.append(m); teile.append(o); return o
def kugel(ort, r, m, n=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=max(4, n // 2), radius=r, location=ort); o = bpy.context.object; o.data.materials.append(m); teile.append(o); return o
def bluete(ort, r, m, mitte):
    for k in range(5):                                                                           # fünf runde Blütenblätter
        a = k * 2 * math.pi / 5; blatt(Vector(ort), (math.cos(a), math.sin(a), 0), r, r * 0.9, m, kipp=-0.25, form="rund")
    kugel(ort, r * 0.25, mitte, 6)

GRUEN = mat("gruen", lin((86, 128, 52))); GRUEN2 = mat("gruen2", lin((112, 150, 62))); HALM = mat("halm", lin((128, 150, 70)))
if ART == "flachs":
    BLAU = mat("bluete", lin((150, 150, 230))); MITTE = mat("mitte", lin((235, 220, 120))); KAPSEL = mat("kapsel", lin((185, 160, 85)))
    for i in range(30):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.16); p0 = (r * math.cos(a), r * math.sin(a), 0)
        if ZUSTAND == "geerntet":
            h = random.uniform(0.06, 0.12); halm(p0, (r * math.cos(a) * 0.4, r * math.sin(a) * 0.4, 1), h, 0.005, mat("stoppel", lin((170, 160, 95))), n=1, kruemmung=0); continue
        h = random.uniform(0.6, 0.9); pts = halm(p0, (r * math.cos(a) * 0.5 + random.uniform(-.08, .08), r * math.sin(a) * 0.5 + random.uniform(-.08, .08), 1), h, 0.0045, HALM)
        for j in range(2, 6): blatt(pts[j], (random.uniform(-1, 1), random.uniform(-1, 1), 0), 0.07, 0.012, GRUEN2, kipp=random.uniform(0.2, 0.7))
        oben = pts[-1]
        if random.random() < 0.55: bluete(oben + Vector((0, 0, 0.01)), 0.022, BLAU, MITTE)
        else:
            for k in range(random.randint(1, 3)): kugel(oben + Vector((random.uniform(-.02, .02), random.uniform(-.02, .02), random.uniform(0, .02))), 0.011, KAPSEL, 8)
else:
    BLUETE = mat("hanfbluete", lin((150, 170, 80))); HAARE = mat("haare", lin((205, 170, 110)))
    for i in range(5):
        a = i * 2 * math.pi / 5 + random.uniform(-0.3, 0.3); r = random.uniform(0.05, 0.14); p0 = (r * math.cos(a), r * math.sin(a), 0)
        if ZUSTAND == "geerntet":
            halm(p0, (0.1 * math.cos(a), 0.1 * math.sin(a), 1), random.uniform(0.08, 0.16), 0.014, mat("stoppel", lin((150, 140, 80))), n=1, kruemmung=0)
            if i % 2 == 0: blatt(Vector((p0[0] * 2.5, p0[1] * 2.5, 0.01)), (math.cos(a), math.sin(a), 0), 0.16, 0.04, mat("welk", lin((140, 130, 70))), kipp=0.03)
            continue
        h = random.uniform(1.0, 1.3); pts = halm(p0, (0.22 * math.cos(a), 0.22 * math.sin(a), 1), h, 0.012, HALM, n=8, kruemmung=0.08)
        for j in (2, 3, 4, 5, 6):                                                                # gefingerte Blätter: 7 breite Fiedern im Fächer, unten größer, je Ebene zwei gegenüber
            gross = 0.32 * (1.2 - j / 8)
            for w in (random.uniform(0, 2 * math.pi),) * 1 + ((random.uniform(0, 2 * math.pi) + math.pi),):
                for f in range(7):
                    ab = (f - 3) * 0.42; l = gross * (1 - abs(f - 3) * 0.17)
                    blatt(pts[j], (math.cos(w + ab), math.sin(w + ab), 0), l, l * 0.3, GRUEN if f % 2 else GRUEN2, kipp=0.3 + abs(f - 3) * 0.12)
        for k in range(5):                                                                       # Blütenstand: dichte Knospen an der Spitze
            kugel(pts[-1] + Vector((random.uniform(-.03, .03), random.uniform(-.03, .03), -0.05 + k * 0.025)), 0.03 - k * 0.003, BLUETE, 8)
        for k in range(4): kugel(pts[-1] + Vector((random.uniform(-.035, .035), random.uniform(-.035, .035), -0.03 + k * 0.02)), 0.008, HAARE, 6)
# Erde
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.2 if ART == "flachs" else 0.22, depth=0.02, location=(0, 0, 0.0)); o = bpy.context.object; o.data.materials.append(mat("erde", lin((92, 70, 48)), 0.95)); teile.append(o)
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.convert(target="MESH"); bpy.ops.object.join(); p = bpy.context.object; p.name = ART
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
lo = min(v.co.z for v in p.data.vertices)
for v in p.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Pflanze:", ART, ZUSTAND, "Höhe", round(max(v.co.z for v in p.data.vertices), 2), "m ·", len(p.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
