"""Mythara Fabrik – Gegenstände für Fischen und Kochen in Blender bauen (als glb; Rucksackbilder danach mit fabrik/symbol.py).

  python3 fabrik/kueche.py -- <art> <ziel.glb>
  art: wuermer | fischsuppe | bauerneintopf | kuhfleisch | mehl | krug_wasser | kessel | krug | suppe_verbrannt | brot_verbrannt

wuermer: Holzschälchen mit Erde und rosa Würmern · fischsuppe: Holzschale, helle Brühe, Fischstücke, Kräuter, Löffel ·
bauerneintopf: Tonschale, braune Soße, Fleisch, Möhren, Kartoffeln · kuhfleisch: rotes Stück mit Fettrand und Knochen ·
mehl: Leinensack, zugebunden, Mehl obenauf und daneben · krug_wasser: Tonkrug mit Henkel, Wasser oben · kessel: eiserner Kessel mit Bügel.
"""
import math, os, random, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(3)
def lin(c): return tuple((x / 255) ** 2.2 for x in c)
def mat(name, farbe, rau=0.6, metall=0.0, glanz=None):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*lin(farbe), 1); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = metall; return m
def glatt(o):
    for p in o.data.polygons: p.use_smooth = True
    return o
def dreh(name, profil, m, n=40):
    """Drehkörper aus (r, z)"""
    me = bpy.data.meshes.new(name); vs, fs = [], []; k = len(profil)
    for i in range(n):
        a = 2 * math.pi * i / n
        for r, z in profil: vs.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(n):
        for j in range(k - 1): a0, a1 = i * k + j, ((i + 1) % n) * k + j; fs.append((a0, a1, a1 + 1, a0 + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(m); return glatt(o)
def kugel(ort, r, m, sk=(1, 1, 1), n=14):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=n // 2, radius=r, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def wuerfel(ort, s, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=s, location=ort, rotation=rot); o = bpy.context.object; b = o.modifiers.new("f", "BEVEL"); b.width = s * 0.18; b.segments = 3; o.data.materials.append(m); return glatt(o)
def rohr(punkte, r, m, n=8):
    kurve = bpy.data.curves.new("r", "CURVE"); kurve.dimensions = "3D"; s = kurve.splines.new("NURBS"); s.points.add(len(punkte) - 1)
    for i, p in enumerate(punkte): s.points[i].co = (*p, 1)
    s.use_endpoint_u = True; s.order_u = 3; kurve.bevel_depth = r; kurve.bevel_resolution = 3; kurve.use_fill_caps = True
    o = bpy.data.objects.new("r", kurve); bpy.context.collection.objects.link(o); o.data.materials.append(m); return o
def schale(m_schale, m_inhalt, r=0.09, h=0.05, fuell=0.8):
    dreh("schale", [(0.0, 0.0), (r * 0.55, 0.0), (r * 0.62, 0.006), (r * 0.9, h * 0.5), (r, h), (r * 0.93, h), (r * 0.82, h * 0.45), (r * 0.5, 0.008), (0.0, 0.008)], m_schale)
    return dreh("inhalt", [(0.0, h * fuell), (r * 0.92 * (0.6 + 0.4 * fuell), h * fuell)], m_inhalt, 40)

if ART == "wuermer":
    schale(mat("holz", (130, 88, 52), 0.8), mat("erde", (70, 48, 30), 0.95), 0.085, 0.045, 0.85)
    ROSA = mat("wurm", (205, 120, 120), 0.4)
    for c, a, b in (((-0.03, 0.02), 0.4, 1.0), ((0.025, 0.03), 2.3, -1.4), ((0.0, -0.03), 4.0, 0.8), ((0.04, -0.01), 5.2, 1.7)):   # unregelmäßig gekringelt
        pts = []; x, y, w = c[0], c[1], a
        for t in range(7): pts.append((x, y, 0.047 + 0.005 * math.sin(t * 1.7 + a))); w += b * random.uniform(0.3, 0.9); x += 0.011 * math.cos(w); y += 0.011 * math.sin(w)
        rohr(pts, 0.0065, ROSA)
    for i in range(10): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), 0.04), 0.008, mat("erde", (70, 48, 30)), (1, 1, 0.6), 8)
elif ART in ("fischsuppe", "bauerneintopf"):
    if ART == "fischsuppe": inh = schale(mat("holz", (140, 95, 58), 0.8), mat("bruehe", (225, 195, 120), 0.25))
    else: inh = schale(mat("ton", (160, 90, 55), 0.7), mat("sosse", (120, 62, 30), 0.35))
    z = 0.042
    if ART == "fischsuppe":
        for i in range(5): wuerfel((random.uniform(-.045, .045), random.uniform(-.045, .045), z), 0.022, mat("fisch", (245, 232, 215), 0.5), (random.random(), random.random(), random.random()))
        for i in range(8): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), z + 0.004), 0.006, mat("kraut", (60, 130, 40), 0.6), (1.6, 0.7, 0.3), 6)
        rohr([(0.03, 0.0, z), (0.09, 0.02, 0.07), (0.15, 0.04, 0.1)], 0.005, mat("holz", (140, 95, 58)))
        kugel((0.03, 0.0, z + 0.003), 0.017, mat("holz", (140, 95, 58)), (1.2, 0.9, 0.35), 10)
    else:
        for i in range(4): wuerfel((random.uniform(-.045, .045), random.uniform(-.045, .045), z + 0.004), 0.024, mat("fleisch", (110, 50, 30), 0.55), (random.random(), random.random(), random.random()))
        for i in range(4): kugel((random.uniform(-.05, .05), random.uniform(-.05, .05), z + 0.004), 0.011, mat("moehre", (225, 120, 35), 0.5), (1.6, 0.9, 0.9), 8)
        for i in range(4): kugel((random.uniform(-.05, .05), random.uniform(-.05, .05), z + 0.004), 0.014, mat("kartoffel", (225, 200, 130), 0.6), (1, 1, 0.8), 10)
        for i in range(6): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), z + 0.006), 0.005, mat("kraut", (60, 130, 40), 0.6), (1.6, 0.7, 0.3), 6)
elif ART == "kuhfleisch":
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.07, depth=0.04, location=(0, 0, 0.02)); o = glatt(bpy.context.object); o.scale = (1.35, 1.0, 1); o.data.materials.append(mat("fleisch", (175, 45, 45), 0.45))
    for v in o.data.vertices: v.co.x += 0.008 * math.sin(v.co.y * 60); v.co.y += 0.006 * math.sin(v.co.x * 50)
    dreh("fett", [(0.071, 0.0), (0.078, 0.004), (0.078, 0.036), (0.071, 0.04)], mat("fett", (245, 228, 210), 0.5)).scale = (1.35, 1, 1)
    for i in range(14):                                                                                   # feine Marmorierung
        a = random.uniform(0, 6.3); r = random.uniform(0.01, 0.055)
        o = kugel((r * 1.3 * math.cos(a), r * math.sin(a), 0.04), 0.004, mat("fett", (245, 228, 210)), (random.uniform(1.5, 3), 0.7, 0.15), 8); o.rotation_euler.z = random.uniform(0, 3.14)
    rohr([(-0.11, 0.0, 0.02), (-0.08, 0.0, 0.02), (-0.05, 0.0, 0.02)], 0.011, mat("knochen", (240, 230, 205), 0.5)); kugel((-0.11, 0, 0.02), 0.018, mat("knochen", (240, 230, 205)), (1, 1.2, 1), 10)
elif ART == "mehl":
    SACK = mat("leinen", (225, 210, 175), 0.95)
    o = dreh("sack", [(0.0, 0.0), (0.07, 0.0), (0.09, 0.03), (0.095, 0.09), (0.085, 0.14), (0.04, 0.17), (0.035, 0.18), (0.05, 0.21), (0.0, 0.215)], SACK, 32)
    for v in o.data.vertices: v.co += Vector((0.004 * math.sin(v.co.z * 70 + v.co.x * 40), 0.004 * math.cos(v.co.z * 60), 0))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.037, minor_radius=0.006, location=(0, 0, 0.178)); bpy.context.object.data.materials.append(mat("schnur", (150, 110, 60), 0.9))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.045, radius2=0.004, depth=0.03, location=(0.095, -0.05, 0.015)); o = glatt(bpy.context.object); o.data.materials.append(mat("mehl", (240, 236, 222), 0.9))   # Mehlhäufchen
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.03, depth=0.003, location=(0, -0.093, 0.09), rotation=(math.radians(90), 0, 0)); bpy.context.object.data.materials.append(mat("stempel", (90, 60, 40), 0.9))
elif ART == "krug_wasser":
    TON = mat("ton", (170, 100, 60), 0.75)
    dreh("krug", [(0.0, 0.0), (0.05, 0.0), (0.065, 0.02), (0.075, 0.07), (0.068, 0.12), (0.05, 0.16), (0.045, 0.18), (0.052, 0.195), (0.047, 0.2), (0.04, 0.185), (0.04, 0.17), (0.0, 0.17)], TON, 36)
    dreh("wasser", [(0.0, 0.178), (0.041, 0.178)], mat("wasser", (90, 150, 200), 0.05), 36)
    rohr([(0.06, 0, 0.16), (0.11, 0, 0.15), (0.11, 0, 0.07), (0.07, 0, 0.05)], 0.008, TON)
    dreh("band", [(0.0756, 0.06), (0.078, 0.065), (0.078, 0.075), (0.0756, 0.08)], mat("band", (110, 60, 35), 0.8), 36)
elif ART == "krug":                                                                               # leerer Tonkrug (wie krug_wasser, ohne Wasser)
    TON = mat("ton", (170, 100, 60), 0.75)
    dreh("krug", [(0.0, 0.0), (0.05, 0.0), (0.065, 0.02), (0.075, 0.07), (0.068, 0.12), (0.05, 0.16), (0.045, 0.18), (0.052, 0.195), (0.047, 0.2), (0.04, 0.185), (0.04, 0.1), (0.0, 0.1)], TON, 36)
    dreh("innen", [(0.0, 0.1), (0.04, 0.1)], mat("innen", (70, 40, 25), 0.9), 36)
    rohr([(0.06, 0, 0.16), (0.11, 0, 0.15), (0.11, 0, 0.07), (0.07, 0, 0.05)], 0.008, TON)
    dreh("band", [(0.0756, 0.06), (0.078, 0.065), (0.078, 0.075), (0.0756, 0.08)], mat("band", (110, 60, 35), 0.8), 36)
elif ART == "suppe_verbrannt":                                                                    # angebrannter Topf: schwarze Kruste, Rauchfahne
    EISEN = mat("eisen", (105, 105, 112), 0.5, 0.6)
    dreh("topf", [(0.0, 0.0), (0.06, 0.0), (0.1, 0.02), (0.11, 0.08), (0.105, 0.09), (0.1, 0.085), (0.0, 0.085)], EISEN, 36)
    o = dreh("kruste", [(0.0, 0.07), (0.1, 0.07)], mat("kruste", (25, 20, 16), 0.95), 36)
    for v in o.data.vertices: v.co.z += random.uniform(-0.004, 0.006)
    for k in range(6): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), 0.074), 0.012, mat("kohle", (15, 12, 10), 0.9), (1, 1, 0.5), 8)
    for sx in (-1, 1): rohr([(sx * 0.105, 0, 0.07), (sx * 0.14, 0, 0.075), (sx * 0.16, 0, 0.07)], 0.007, EISEN)
    for k, (x, z) in enumerate(((0.0, 0.12), (0.02, 0.17), (-0.01, 0.22))): kugel((x, 0.0, z - 0.02), 0.018 + 0.006 * k, mat("rauch", (175, 172, 168), 1.0), (1, 1, 0.8), 10)
elif ART == "brot_verbrannt":                                                                     # verkohlter Laib mit Rissen
    o = kugel((0, 0, 0.035), 0.06, mat("verbrannt", (35, 24, 16), 0.9), (1.5, 1.0, 0.65), 18)
    for v in o.data.vertices: v.co += Vector((0, 0, 0.004 * math.sin(v.co.x * 90) * (v.co.z > 0.03)))
    for k in range(3): kugel((-0.04 + 0.04 * k, 0.0, 0.07), 0.008, mat("riss", (12, 10, 8), 0.95), (0.6, 4.5, 0.3), 8).rotation_euler = (0, 0, 0.5)
    for k in range(5): kugel((random.uniform(-.1, .1), random.uniform(-.07, .07), 0.003), 0.008, mat("asche", (110, 106, 100), 1.0), (1, 1, 0.3), 6)
elif ART == "kessel":
    EISEN = mat("eisen", (105, 105, 112), 0.5, 0.6)
    dreh("kessel", [(0.0, 0.0), (0.06, 0.0), (0.12, 0.04), (0.14, 0.1), (0.13, 0.15), (0.125, 0.16), (0.12, 0.155), (0.0, 0.155)], EISEN, 40)
    dreh("suppe", [(0.0, 0.14), (0.125, 0.14)], mat("bruehe", (225, 180, 100), 0.25), 40)
    rohr([(-0.13, 0, 0.15), (-0.1, 0, 0.29), (0.0, 0, 0.33), (0.1, 0, 0.29), (0.13, 0, 0.15)], 0.006, EISEN)
    for a in (0, 2.1, 4.2): rohr([(0.07 * math.cos(a), 0.07 * math.sin(a), 0.01), (0.09 * math.cos(a), 0.09 * math.sin(a), -0.04)], 0.012, EISEN)
for o in list(bpy.context.scene.objects):
    if o.type == "CURVE": bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.convert(target="MESH"); o.select_set(False)
bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]
for o in bpy.context.scene.objects:
    for m in list(o.modifiers): bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Küche:", ART, os.path.getsize(ZIEL) // 1024, "KB")
