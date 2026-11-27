"""Mythara Fabrik – seltene Drops der Midgame-Bosse (#178) als kleine 3D-Modelle (für Rucksackbilder und Teile).

  <blender-python> fabrik/midgame_drops.py -- <art> <ziel.glb>

federamulett  Amulett der Federmutter: dunkle Lederschnur, runder Bronzerahmen mit violettem Stein, drei schwarze Federn darunter
kompass       Kompass der „Morgenstern“: Messinggehäuse mit Deckel (aufgeklappt), Windrose, Nadel, Kette mit Ring
soeldnerring  Söldnerring (Tjark Sölde): breiter Eisenring mit Kupferband und eingesetztem Bernstein
rabenfokus    Rabenfokus (Magie-Nebenhand): Rabenschädel mit violettem Kristall im Schnabel, Federkranz, kurzer Griff aus dunklem Holz –
              Griff unten (-z ist die Spitze/der Kopf wie bei Waffen: der Kopf zeigt nach -z, das Griffende nach +z), für rig.py "art": "schwert", "hand": "L"
Maßstab 1 = 1 m, Ursprung Mitte unten (rabenfokus: Mitte, Länge entlang z).
"""
import math, os, random, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(5)
def mat(n, c, r=0.6, gl=0.0, leucht=0.0):
    m = bpy.data.materials.get(n)
    if m: return m
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; f = (*[(x / 255) ** 2.2 for x in c], 1)
    b.inputs["Base Color"].default_value = f; b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = gl
    if leucht: b.inputs["Emission Color"].default_value = f; b.inputs["Emission Strength"].default_value = leucht
    return m
def glatt(o):
    for p in o.data.polygons: p.use_smooth = True
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
def ring(ort, r, d, m, rot=(0, 0, 0), sk=(1, 1, 1), seg=(28, 10)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=d, location=ort, rotation=rot, major_segments=seg[0], minor_segments=seg[1]); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def scheibe(ort, r, d, m, rot=(0, 0, 0), n=32):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=d, location=ort, rotation=rot); o = bpy.context.object; o.data.materials.append(m); return glatt(o)
def feder(basis, richtung, laenge, breite, m, kiel):
    """Feder: Kiel und eine schmale, zur Spitze zulaufende Fahne (in der Ebene senkrecht zu y gebogen)"""
    d = Vector(richtung).normalized(); seit = d.cross(Vector((0, 1, 0))).normalized(); vs, fs = [], []
    for i in range(9):
        t = i / 8; p = Vector(basis) + d * laenge * t + seit * 0.02 * laenge * math.sin(math.pi * t); w = breite * math.sin(math.pi * min(1, t * 1.15)) ** 0.7
        vs += [tuple(p - seit * w), tuple(p + seit * w * 0.8)]
    for i in range(8): fs.append((2 * i, 2 * i + 1, 2 * i + 3, 2 * i + 2))
    me = bpy.data.meshes.new("feder"); me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("feder", me); bpy.context.collection.objects.link(o)
    o.data.materials.append(m); s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.0015
    rohr(basis, Vector(basis) + d * laenge * 0.95, 0.0012 * laenge / 0.05, kiel, 6)
    return o
BRONZE = mat("bronze", (176, 120, 58), 0.35, 0.85); MESS = mat("messing", (205, 160, 74), 0.3, 0.9); EISEN = mat("eisen", (110, 110, 118), 0.4, 0.8)
LEDER = mat("leder", (66, 46, 32), 0.75); FED = mat("rabenfeder", (26, 24, 34), 0.45); KIEL = mat("kiel", (70, 64, 76), 0.5)
VIOLETT = mat("violett", (150, 80, 230), 0.15, 0, 1.2)
if ART == "federamulett":
    rohr((-0.09, 0, 0.16), (0, 0, 0.03), 0.003, LEDER, 6); rohr((0.09, 0, 0.16), (0, 0, 0.03), 0.003, LEDER, 6)          # Schnur (V-förmig)
    ring((0, 0, 0.0), 0.024, 0.005, BRONZE, (math.pi / 2, 0, 0)); scheibe((0, 0, 0.0), 0.02, 0.006, mat("dunkel", (40, 30, 40), 0.6), (math.pi / 2, 0, 0))
    kugel((0, -0.004, 0.0), 0.013, VIOLETT, (1, 0.6, 1.2), 12)
    for k, a in enumerate((-0.35, 0.0, 0.35)): feder((0.008 * math.sin(a), 0.0, -0.022), (math.sin(a), 0, -1), 0.075 - 0.01 * abs(k - 1), 0.011, FED, KIEL)
    ring((0, 0, -0.022), 0.006, 0.0025, BRONZE, (0, 0, 0))
elif ART == "kompass":
    scheibe((0, 0, 0.008), 0.045, 0.016, MESS); ring((0, 0, 0.016), 0.045, 0.004, MESS)
    scheibe((0, 0, 0.0165), 0.04, 0.001, mat("ziffernblatt", (232, 220, 190), 0.7))
    for k in range(8):                                                                         # Windrose: lange und kurze Strahlen
        a = k * math.pi / 4; l = 0.034 if k % 2 == 0 else 0.02
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=0.005, radius2=0, depth=l, location=(math.cos(a) * l / 2, math.sin(a) * l / 2, 0.0175), rotation=(0, math.pi / 2, a))
        o = bpy.context.object; o.scale = (0.2, 1, 1); o.data.materials.append(mat("rose", (60, 50, 40), 0.6))
    rohr((-0.03, 0, 0.0185), (0.03, 0, 0.0185), 0.0025, mat("nadel_rot", (190, 40, 30), 0.4), 6, 0.0003); kugel((0, 0, 0.019), 0.003, MESS, n=8)
    scheibe((0, 0.0, 0.0175), 0.041, 0.001, mat("glas", (200, 220, 230), 0.05)).data.materials[0].node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.25
    d = scheibe((0, 0.055, 0.04), 0.045, 0.005, MESS, (math.radians(-70), 0, 0))                  # aufgeklappter Deckel mit Stern
    kugel((0, 0.058, 0.045), 0.01, mat("stern", (240, 200, 90), 0.2, 0.9, 0.6), (1, 0.2, 1), 8)
    ring((0, -0.05, 0.008), 0.008, 0.0025, MESS, (math.pi / 2, 0, 0))
    for k in range(6): ring((0.01 * k, -0.06 - 0.008 * k, 0.004), 0.0045, 0.0012, MESS, (math.pi / 2, 0, k * 0.8), seg=(12, 6))
elif ART == "soeldnerring":
    ring((0, 0, 0.008), 0.011, 0.0026, EISEN, sk=(1, 1, 2.4)); ring((0, 0, 0.008), 0.0132, 0.0011, mat("kupfer", (184, 100, 56), 0.35, 0.85), sk=(1, 1, 1))
    wuerfel((0, -0.0135, 0.008), (0.009, 0.004, 0.01), EISEN, fase=0.2)                          # Fassung
    kugel((0, -0.0158, 0.008), 0.004, mat("bernstein", (230, 140, 30), 0.15, 0, 0.3), (1, 0.6, 1.2), 12)
elif ART == "rabenfokus":                                                                       # Länge entlang z: Griff oben (+z), Schädel unten (-z)
    HOLZ = mat("holz_dunkel", (60, 40, 30), 0.7); KNOCHEN = mat("knochen", (220, 210, 186), 0.55)
    rohr((0, 0, 0.0), (0, 0, 0.14), 0.012, HOLZ, 10); ring((0, 0, 0.14), 0.013, 0.004, BRONZE); ring((0, 0, 0.0), 0.014, 0.004, BRONZE)
    kugel((0, 0, -0.04), 0.035, KNOCHEN, (0.75, 0.85, 1.25), 16)                                 # länglicher Rabenschädel
    bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.016, radius2=0.001, depth=0.1, location=(0, -0.012, -0.11), rotation=(math.radians(165), 0, 0))
    o = bpy.context.object; o.scale = (0.7, 1, 1); o.data.materials.append(mat("schnabel", (40, 36, 40), 0.45))
    for sx in (-1, 1): kugel((sx * 0.02, -0.025, -0.04), 0.008, VIOLETT, n=8)                    # glühende Augen
    kugel((0, -0.025, -0.085), 0.013, VIOLETT, (1, 1, 1.5), 10)                                  # Kristall im Schnabel
    for k in range(9):                                                                          # Federkranz um den Schädel
        a = k * 2 * math.pi / 9; feder((0.03 * math.cos(a), 0.03 * math.sin(a) + 0.01, -0.02), (math.cos(a), math.sin(a) + 0.4, 0.9), 0.09, 0.012, FED, KIEL)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object
if ART != "rabenfokus":
    lo = min(v.co.z for v in o.data.vertices)
    for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Drop:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
