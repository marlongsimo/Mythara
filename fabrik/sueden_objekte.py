"""Mythara Fabrik – Objekte für „Süden beleben“ (#121), soweit möglich aus Vorhandenem zusammengesetzt (glb, Maßstab 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/sueden_objekte.py -- <art> <ziel.glb> [quelle=<glb>]

vogelscheuche     – Kreuz aus Stangen, Jutekopf mit Stichgesicht, geflickter Kittel, Strohbüschel; obenauf der vorhandene Strohhut
                    (fabrik/assets/kleidung.kopf.strohhut) (≈ 1,9 m)
bienenstock       – Bienenkorb aus Strohwülsten auf einem Holzbock mit Flugloch (≈ 0,9 m)
saegemuehle       – Sägemühle: Bretterschuppen mit Pultdach und Sägegatter, Stämme davor; das Wasserrad ist das vorhandene Rad des Schöpfrads
                    (img/objekte3d/glutsande/schoepfrad_rad.glb, quelle=…), dunkler gefärbt, seitlich an der Achse
saegemuehle_rad   – nur das Rad, Ursprung in der Achse (zum Drehen im Spiel), Achse = x
trittsteine       – fünf flache Steinblöcke in einer leicht geschwungenen Reihe (Furt, S5)
trophaee_hecht    – Trophäe „Der alte Hecht“: Moorhecht aus fabrik/fische.py (glb=1, ×2,2) auf einem Brett mit Messingschild
trophaee_graupelz – Trophäe „Der Graupelz“: der Kopf der Spielfigur graupelz3d (quelle=…, alles hinter dem Hals abgeschnitten) auf einem Schild
knueppel          – Knüppel der Wegelagerer (Waffe: Knauf oben +z wie die anderen Waffen; das dicke Ende oben, Griff unten, "griff": 0.85)
"""
import math, os, random, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(7)
def mat(n, c, r=0.6, gl=0.0, leucht=0.0):
    m = bpy.data.materials.get(n)
    if m: return m
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; f = (*[(x / 255) ** 2.2 for x in c], 1)
    b.inputs["Base Color"].default_value = f; b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = gl
    if leucht: b.inputs["Emission Color"].default_value = f; b.inputs["Emission Strength"].default_value = leucht
    return m
def glatt(o, an=True):
    for p in o.data.polygons: p.use_smooth = an
    return o
def wuerfel(ort, gr, m, rot=(0, 0, 0), fase=0.1):
    bpy.ops.mesh.primitive_cube_add(size=1, location=ort, rotation=rot); o = bpy.context.object; o.scale = gr
    if fase: b = o.modifiers.new("f", "BEVEL"); b.width = min(gr) * fase; b.segments = 2
    o.data.materials.append(m); return o
def rohr(p0, p1, r, m, n=10, r1=None):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); return glatt(o)
def kugel(ort, r, m, sk=(1, 1, 1), n=14):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=n // 2, radius=r, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def ring(ort, r, d, m, rot=(0, 0, 0), sk=(1, 1, 1), seg=(20, 8)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=d, location=ort, rotation=rot, major_segments=seg[0], minor_segments=seg[1]); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def kristall(ort, r, h, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=5, radius1=r, radius2=0, depth=h, location=ort, rotation=rot); o = bpy.context.object; o.data.materials.append(m); return o
def dreh(profil, m, n=28):
    me = bpy.data.meshes.new("d"); vs, fs = [], []; k = len(profil)
    for i in range(n):
        a = 2 * math.pi * i / n
        for r, z in profil: vs.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(n):
        for j in range(k - 1): a0, a1 = i * k + j, ((i + 1) % n) * k + j; fs.append((a0, a1, a1 + 1, a0 + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("d", me); bpy.context.collection.objects.link(o); o.data.materials.append(m); return glatt(o)
QUELLE = dict(x.split("=", 1) for x in a_[2:] if "=" in x).get("quelle")
HOLZ = mat("holz", (138, 100, 62), 0.85); HOLZ2 = mat("holz_dunkel", (90, 64, 42), 0.85); STROH = mat("stroh", (214, 182, 100), 0.9); JUTE = mat("jute", (176, 150, 104), 0.95)
STEIN = mat("stein", (140, 134, 124), 0.9); STEIN2 = mat("stein_dunkel", (104, 100, 94), 0.9); MESS = mat("messing", (200, 156, 72), 0.3, 0.9); EIS = mat("eisen", (96, 96, 102), 0.45, 0.6)
def laden(pfad):
    vor = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.abspath(pfad)); neu = [o for o in set(bpy.data.objects) - vor]
    for o in neu:
        if o.type != "MESH": bpy.data.objects.remove(o)
    neu = [o for o in bpy.data.objects if o in neu or o.type == "MESH" and o not in vor]
    for o in neu:
        o.parent = None
        for m in list(o.modifiers): o.modifiers.remove(m)
    return [o for o in bpy.context.scene.objects if o.type == "MESH" and o.name not in [v.name for v in vor]]
if ART == "vogelscheuche":
    rohr((0, 0, 0), (0, 0, 1.75), 0.04, HOLZ2, 8); rohr((-0.75, 0, 1.35), (0.75, 0, 1.35), 0.035, HOLZ2, 8)
    kugel((0, 0, 1.62), 0.16, JUTE, (1, 0.95, 1.1))
    for sx in (-1, 1): wuerfel((sx * 0.06, -0.15, 1.65), (0.03, 0.01, 0.03), mat("garn", (40, 30, 24), 0.9), (0, 0, 0.3 * sx), 0)   # Kreuzstich-Augen
    wuerfel((0, -0.15, 1.56), (0.1, 0.01, 0.012), mat("garn", (40, 30, 24)), fase=0)
    dreh([(0.0, 0.55), (0.26, 0.55), (0.3, 0.75), (0.24, 1.3), (0.12, 1.42), (0.0, 1.42)], mat("kittel", (120, 90, 120), 0.9), 10)   # Kittel
    for sx in (-1, 1):
        rohr((sx * 0.1, 0, 1.33), (sx * 0.62, 0, 1.33), 0.08, mat("kittel", (120, 90, 120)), 8)
        for k in range(5): kristall((sx * 0.68, random.uniform(-.04, .04), 1.33 + random.uniform(-.05, .05)), 0.02, 0.14, STROH, (random.uniform(-.4, .4), sx * math.radians(90), 0))
    for k in range(7): kristall((random.uniform(-.2, .2), random.uniform(-.1, .1), 0.55), 0.025, 0.16, STROH, (math.pi + random.uniform(-.3, .3), random.uniform(-.3, .3), 0))
    wuerfel((0.12, -0.27, 1.0), (0.14, 0.02, 0.14), mat("flicken", (170, 70, 50), 0.9), (0, 0, 0.2), 0); wuerfel((-0.1, -0.25, 0.75), (0.12, 0.02, 0.1), mat("flicken2", (80, 120, 150), 0.9), (0, 0, -0.3), 0)
    for o in laden("fabrik/assets/kleidung.kopf.strohhut/v001/quelle/strohhut.glb"): o.location = (0, 0, 1.74); o.rotation_euler = (0.15, 0, 0.3); o.scale = (1.2, 1.2, 1.2)
elif ART == "bienenstock":
    for sx in (-1, 1):
        for sy in (-1, 1): rohr((sx * 0.25, sy * 0.25, 0), (sx * 0.25, sy * 0.25, 0.42), 0.035, HOLZ2, 6)
    wuerfel((0, 0, 0.44), (0.66, 0.66, 0.06), HOLZ, fase=0.1)
    for k in range(9):                                                                               # Strohwülste, oben enger
        z = 0.5 + k * 0.045; r = 0.26 * math.cos(min(1.0, k / 9) * 1.2) + 0.03; ring((0, 0, z), r, 0.028, STROH, seg=(24, 6))
    kugel((0, 0, 0.9), 0.06, STROH, (1, 1, 0.6))
    wuerfel((0, -0.26, 0.54), (0.08, 0.04, 0.04), mat("flugloch", (30, 22, 14), 0.9), fase=0)
    for k in range(4): kugel((random.uniform(-.2, .2), -0.32 + random.uniform(-.05, .05), 0.6 + random.uniform(0, .25)), 0.012, mat("biene", (230, 176, 40), 0.5), (1, 1.4, 1))
elif ART in ("saegemuehle", "saegemuehle_rad"):
    RAD = laden(QUELLE)
    for o in RAD:
        for m_ in o.data.materials:
            if m_ and m_.node_tree:
                b = next((n for n in m_.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
                if b and not b.inputs["Base Color"].links: c = b.inputs["Base Color"].default_value; b.inputs["Base Color"].default_value = (c[0] * 0.75, c[1] * 0.7, c[2] * 0.65, 1)   # nasses dunkleres Holz
    if ART == "saegemuehle":
        for o in RAD: o.location = (-1.9, 0.0, 1.75)
        wuerfel((0.4, 0, 0.1), (3.6, 2.6, 0.2), STEIN, fase=0.1)
        for k in range(14):
            x = -1.2 + k * 0.23
            for sy in (-1, 1): wuerfel((x, sy * 1.2, 1.3), (0.21, 0.06, 2.2), HOLZ if k % 2 else HOLZ2, fase=0.1)
        for sx in (-1, 1): wuerfel((0.4 + sx * 1.7, 0, 1.3), (0.06, 2.4, 2.2), HOLZ2, fase=0.05)
        wuerfel((0.4, 0, 2.55), (3.8, 2.9, 0.1), mat("dach", (80, 70, 62), 0.9), (math.radians(8), 0, 0), 0.05)
        wuerfel((0.4, -1.23, 0.9), (1.2, 0.04, 1.6), mat("tor", (60, 46, 34), 0.8), fase=0.05)                          # offenes Tor: dunkel
        for sx in (-0.3, 0.3): rohr((0.4 + sx, -1.0, 0.2), (0.4 + sx, -1.0, 2.0), 0.05, HOLZ2, 6)                             # Sägegatter
        rohr((0.1, -1.0, 1.0), (0.7, -1.0, 1.0), 0.04, HOLZ2, 6); wuerfel((0.4, -1.0, 1.25), (0.5, 0.01, 0.06), EIS, fase=0)
        for k in range(4): rohr((1.6 + 0.3 * (k % 2), -1.6 - 0.25 * k, 0.15 + 0.22 * (k // 2)), (3.2 + 0.3 * (k % 2), -1.6 - 0.25 * k, 0.15 + 0.22 * (k // 2)), 0.13, HOLZ, 10)   # Stämme
        rohr((-1.55, 0, 1.75), (-1.15, 0, 1.75), 0.08, HOLZ2, 8)                                                     # Achse ins Haus
        wuerfel((-1.9, 0.0, 0.08), (0.6, 2.4, 0.16), mat("wasser", (70, 110, 130), 0.1), fase=0)                         # Mühlgraben
elif ART == "trittsteine":
    for k in range(5):
        x = -1.6 + k * 0.8; y = 0.25 * math.sin(k * 1.1)
        o = kugel((x, y, 0.12), 0.32, STEIN if k % 2 else STEIN2, (1.1, 0.85, 0.4), 10)
        for v in o.data.vertices: v.co *= random.uniform(0.9, 1.1)
        glatt(o, False); o.data.vertices.foreach_set("co", [c for v in o.data.vertices for c in (v.co.x, v.co.y, max(v.co.z, -0.4))])
        kugel((x + 0.1, y - 0.05, 0.25), 0.05, mat("moos", (90, 110, 60), 0.9), (1.5, 1, 0.3), 8)
elif ART == "trophaee_hecht":
    wuerfel((0, 0.04, 0.3), (1.6, 0.06, 0.55), HOLZ2, fase=0.1); wuerfel((0, 0.0, 0.3), (1.5, 0.02, 0.47), HOLZ, fase=0.05)
    for o in laden(QUELLE):
        o.scale = (2.2, 2.2, 2.2); o.location = (0, -0.12, 0.32)                                    # Seite des Fisches zeigt nach vorn (-y)
        for m_ in o.data.materials:
            b = next((n for n in m_.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None) if m_ and m_.node_tree else None
            if b and m_.name.startswith("haut"):
                for l in list(b.inputs["Base Color"].links): m_.node_tree.links.remove(l)
                b.inputs["Base Color"].default_value = (0.07, 0.11, 0.04, 1)                       # olivgrüner Hecht (Fleckenmuster wird nicht exportiert)
    wuerfel((0, -0.03, 0.1), (0.34, 0.01, 0.08), MESS, fase=0.1)
elif ART == "trophaee_graupelz":
    dreh([(0, 0), (0.42, 0), (0.42, 0.05), (0, 0.05)], HOLZ2, 8).rotation_euler = (math.radians(90), 0, math.radians(22.5)); wuerfel((0, -0.06, -0.3), (0.3, 0.01, 0.07), MESS, fase=0.1)
    for o in laden(QUELLE):
        import bmesh
        bm = bmesh.new(); bm.from_mesh(o.data); weg = [v for v in bm.verts if v.co.y > -0.42 * 1.35]; bmesh.ops.delete(bm, geom=weg, context="VERTS"); bm.to_mesh(o.data); bm.free()
        for g in list(o.vertex_groups): o.vertex_groups.remove(g)
        zs = [v.co.z for v in o.data.vertices]; ys = [v.co.y for v in o.data.vertices]; mz = (min(zs) + max(zs)) / 2; my = max(ys)
        for v in o.data.vertices: v.co.y -= my; v.co.z -= mz
        o.location = (0, -0.05, 0.0); o.scale = (1.3, 1.3, 1.3)
elif ART == "knueppel":
    rohr((0, 0, 0.0), (0, 0, 0.45), 0.018, HOLZ2, 8, 0.022); rohr((0, 0, 0.45), (0.0, 0, 0.78), 0.03, HOLZ, 8, 0.055)
    for k in range(5): kugel((0.04 * math.cos(k * 1.3), 0.04 * math.sin(k * 1.3), 0.55 + k * 0.045), 0.018, HOLZ2, (1, 1, 1.2), 6)   # Astknoten
    for k in range(3): kristall((0.05 * math.cos(k * 2.1), 0.05 * math.sin(k * 2.1), 0.68), 0.008, 0.05, EIS, (0, math.radians(90), k * 2.1))   # eingeschlagene Nägel
    ring((0, 0, 0.12), 0.022, 0.006, mat("lederband", (110, 72, 44), 0.8))
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices) 
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
