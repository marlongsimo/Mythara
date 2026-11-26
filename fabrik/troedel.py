"""Mythara Fabrik – Dinge des Trödlers (#88): Handkarren voller Trödel (Weltobjekt) und Bauchladen (Anbauteil der Figur).

  <blender-python> fabrik/troedel.py -- <art> <ziel.glb>

karren     – zweirädriger Handkarren (≈ 1,9 m mit Griffen nach -y): Kasten mit bunter Plane, darauf Säcke, Töpfe, Kessel, eingerollter Teppich,
             Kiste, umgedrehter Schemel, Laterne an einer Stange; Ursprung Mitte unten.
bauchladen – Bauchladen: flaches Brett mit Rand vor dem Bauch, Fläschchen, Töpfchen, Bänder, Löffel, Kerze, Riemen über die Schultern.
             Ursprung = Rückseite des Bretts in Mitte (dort sitzt es vorn am Bauch, rig.py "anbau" mit flaeche "vorn"); das Brett reicht nach -y.
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
HOLZ = mat("holz", (138, 100, 62), 0.85); HOLZ2 = mat("holz_dunkel", (90, 64, 42), 0.85); EIS = mat("eisen", (96, 96, 102), 0.45, 0.6)
KUPFER = mat("kupfer", (184, 108, 62), 0.35, 0.8); SACK = mat("sack", (196, 172, 128), 0.95); ROT = mat("stoff_rot", (160, 52, 44), 0.8); BLAU = mat("stoff_blau", (52, 80, 140), 0.8)
GELB = mat("stoff_gelb", (214, 170, 60), 0.8); TON = mat("ton", (170, 96, 58), 0.75); LEDER = mat("leder", (110, 72, 44), 0.8)
if ART == "karren":
    for sx in (-1, 1):
        ring((sx * 0.62, 0.15, 0.5), 0.5, 0.045, HOLZ2, (0, math.radians(90), 0), seg=(28, 6)); ring((sx * 0.63, 0.15, 0.5), 0.49, 0.02, EIS, (0, math.radians(90), 0), seg=(28, 4))
        for k in range(8): a = k * math.pi / 4; rohr((sx * 0.62, 0.15, 0.5), (sx * 0.62, 0.15 + 0.48 * math.cos(a), 0.5 + 0.48 * math.sin(a)), 0.02, HOLZ2, 6)
        kugel((sx * 0.62, 0.15, 0.5), 0.06, EIS)
    rohr((-0.65, 0.15, 0.5), (0.65, 0.15, 0.5), 0.03, EIS, 8)
    wuerfel((0, 0.15, 0.62), (1.05, 1.3, 0.08), HOLZ, fase=0.1)
    for sx in (-1, 1): wuerfel((sx * 0.52, 0.15, 0.78), (0.05, 1.3, 0.28), HOLZ, fase=0.1)
    wuerfel((0, 0.79, 0.78), (1.05, 0.05, 0.28), HOLZ, fase=0.1); wuerfel((0, -0.49, 0.74), (1.05, 0.05, 0.2), HOLZ, fase=0.1)
    for sx in (-1, 1): rohr((sx * 0.4, -0.45, 0.66), (sx * 0.36, -1.15, 0.78), 0.035, HOLZ2, 8)                  # Griffe
    rohr((-0.36, -1.12, 0.78), (0.36, -1.12, 0.78), 0.03, HOLZ2, 8)
    for y in (0.75, -0.42): rohr((0, y, 0.6), (0, y, 0.12), 0.03, HOLZ2, 6)                                # Stützen
    kugel((0.25, 0.45, 0.9), 0.22, SACK, (1, 0.9, 0.8)); kugel((-0.2, 0.55, 0.88), 0.18, SACK, (1, 1, 0.85))
    rohr((-0.45, 0.0, 0.92), (0.45, 0.0, 0.92), 0.12, ROT, 14); ring((-0.2, 0.0, 0.92), 0.12, 0.015, GELB, (0, math.radians(90), 0)); ring((0.2, 0.0, 0.92), 0.12, 0.015, GELB, (0, math.radians(90), 0))   # Teppichrolle
    dreh([(0, 0.0), (0.12, 0.0), (0.16, 0.08), (0.15, 0.16), (0.13, 0.17), (0, 0.17)], KUPFER, 16).location = (0.25, -0.25, 0.66)  # Kessel
    rohr((0.13, -0.25, 0.82), (0.37, -0.25, 0.82), 0.01, EIS, 6)
    dreh([(0, 0), (0.07, 0), (0.1, 0.1), (0.06, 0.18), (0.07, 0.2), (0, 0.2)], TON, 14).location = (-0.25, -0.3, 0.66)               # Tonkrug
    wuerfel((0.0, 0.5, 1.15), (0.36, 0.3, 0.26), HOLZ2, fase=0.08)                                          # Kiste obenauf
    wuerfel((-0.25, 0.25, 1.12), (0.3, 0.3, 0.04), HOLZ, (0, math.radians(180), 0.4), 0.1)                   # Schemel verkehrt herum
    for dx, dy in ((-0.12, -0.12), (0.12, -0.12), (-0.12, 0.12), (0.12, 0.12)):
        c, s_ = math.cos(0.4), math.sin(0.4); rohr((-0.25 + dx * c - dy * s_, 0.25 + dx * s_ + dy * c, 1.1), (-0.25 + dx * c - dy * s_, 0.25 + dx * s_ + dy * c, 1.38), 0.015, HOLZ, 5)
    wuerfel((0, 0.2, 0.8), (0.98, 1.0, 0.04), BLAU, (0.0, 0.0, 0.0), 0)                                    # Plane unter dem Kram
    rohr((0.5, 0.78, 0.6), (0.5, 0.78, 1.75), 0.02, HOLZ2, 6); rohr((0.5, 0.78, 1.75), (0.5, 0.6, 1.75), 0.015, HOLZ2, 6)
    wuerfel((0.5, 0.6, 1.62), (0.1, 0.1, 0.16), mat("laternenglas", (255, 220, 150), 0.2, 0, 1.0), fase=0.1)
    for k, (c_, z) in enumerate(((ROT, 1.5), (GELB, 1.38), (BLAU, 1.26))): wuerfel((0.5, 0.79, z), (0.02, 0.2, 0.08), c_, (0, 0, 0), 0)   # Wimpel
elif ART == "bauchladen":
    wuerfel((0, -0.17, -0.02), (0.52, 0.32, 0.025), HOLZ, fase=0.1)
    for sx in (-1, 1): wuerfel((sx * 0.25, -0.17, 0.01), (0.025, 0.32, 0.06), HOLZ2, fase=0.1)
    wuerfel((0, -0.32, 0.01), (0.52, 0.025, 0.06), HOLZ2, fase=0.1)
    for k, c_ in enumerate((mat("glas_gruen", (80, 150, 90), 0.15), mat("glas_blau", (80, 110, 180), 0.15), mat("glas_braun", (150, 90, 40), 0.15))):
        x = -0.18 + k * 0.07; dreh([(0, 0), (0.022, 0), (0.022, 0.06), (0.008, 0.075), (0.008, 0.09), (0, 0.09)], c_, 10).location = (x, -0.1, -0.008)
        kugel((x, -0.1, 0.085), 0.009, mat("korken", (190, 150, 100), 0.8))
    for x in (0.08, 0.17): dreh([(0, 0), (0.035, 0), (0.04, 0.04), (0.03, 0.05), (0, 0.05)], TON, 12).location = (x, -0.1, -0.008)
    for k, c_ in enumerate((ROT, GELB, BLAU)): rohr((-0.2, -0.22 - 0.025 * k, -0.002), (0.0, -0.24 - 0.025 * k, -0.002), 0.008, c_, 6)   # Bänder
    rohr((0.05, -0.25, 0.0), (0.2, -0.27, 0.0), 0.006, mat("zinn", (180, 180, 186), 0.3, 0.8), 6); kugel((0.2, -0.27, 0.0), 0.018, mat("zinn", (180, 180, 186)), (1.2, 0.8, 0.3))   # Löffel
    rohr((0.0, -0.1, -0.008), (0.0, -0.1, 0.06), 0.012, mat("kerze", (236, 226, 196), 0.6), 8)
    for sx in (-1, 1): rohr((sx * 0.22, 0.0, 0.0), (sx * 0.13, 0.02, 0.36), 0.012, LEDER, 6); rohr((sx * 0.13, 0.02, 0.36), (sx * 0.11, 0.2, 0.42), 0.012, LEDER, 6)   # Riemen
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices) if ART != "bauchladen" else 0.0   # der Bauchladen behält seinen Ursprung (Anbau am Bauch) 
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
