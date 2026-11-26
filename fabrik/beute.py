"""Mythara Fabrik – Beute und Questgegenstände (Phase 4) in Blender bauen (glb; Rucksackbilder danach mit fabrik/symbol.py).

  <blender-python> fabrik/beute.py -- <art> <ziel.glb>
  art: karrenbrief | schluesselbund | silberleuchter | apfel | rotes_banner | apfelkorb | rabenfedern | federsiegel | splitterkern | rabenschwinge | sichel | stock | staken

karrenbrief: zusammengerollter Frachtbrief mit Schnur und rotem Siegel · schluesselbund: Eisenring mit drei Bartschlüsseln ·
silberleuchter: dreiarmiger Silberleuchter mit Kerzen · apfel: roter Apfel mit Stiel und Blatt ·
rotes_banner: rotes Tuch mit schwarzem Zeichen an Querstange und Stab · apfelkorb: Weidenkorb voller Äpfel mit Henkel (für Gisbert Ast, wird in der Hand getragen).
"""
import math, os, random, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(5)
def mat(name, farbe, rau=0.6, metall=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in farbe], 1); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = metall; return m
def glatt(o):
    for p in o.data.polygons: p.use_smooth = True
    return o
def dreh(name, profil, m, n=32):
    me = bpy.data.meshes.new(name); vs, fs = [], []; k = len(profil)
    for i in range(n):
        a = 2 * math.pi * i / n
        for r, z in profil: vs.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(n):
        for j in range(k - 1): a0, a1 = i * k + j, ((i + 1) % n) * k + j; fs.append((a0, a1, a1 + 1, a0 + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o); o.data.materials.append(m); return glatt(o)
def kugel(ort, r, m, sk=(1, 1, 1), n=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=n // 2, radius=r, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def rohr(p0, p1, r, m, n=10, r1=None):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); return glatt(o)
def ring(ort, r, d, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=d, location=ort, rotation=rot, major_segments=32, minor_segments=8); o = bpy.context.object; o.data.materials.append(m); return glatt(o)
def wuerfel(ort, gr, m, rot=(0, 0, 0), fase=0.15):
    bpy.ops.mesh.primitive_cube_add(size=1, location=ort, rotation=rot); o = bpy.context.object; o.scale = gr
    b = o.modifiers.new("f", "BEVEL"); b.width = min(gr) * fase; b.segments = 2; o.data.materials.append(m); return o
def apfel(ort, r, m_haut):
    o = dreh("apfel", [(r * 0.0, -r * 0.78), (r * 0.35, -r * 0.92), (r * 0.8, -r * 0.6), (r * 1.0, 0), (r * 0.92, r * 0.55), (r * 0.5, r * 0.85), (r * 0.18, r * 0.7), (0, r * 0.62)], m_haut, 24)
    o.location = ort; rohr((ort[0], ort[1], ort[2] + r * 0.6), (ort[0] + r * 0.08, ort[1], ort[2] + r * 1.05), r * 0.06, mat("stiel", (90, 60, 30)), 6)
    return o

if ART == "karrenbrief":
    PAP = mat("papier", (225, 205, 160), 0.9)
    o = rohr((-0.11, 0, 0.025), (0.11, 0, 0.025), 0.025, PAP, 24); bpy.ops.object.mode_set(mode="OBJECT")
    for v in o.data.vertices: v.co.z += 0.0                                                      # Rolle
    wuerfel((0.0, -0.06, 0.003), (0.2, 0.08, 0.003), PAP, (0, 0, 0.06), 0.4)                 # ausgerollter Rand, der vorn auf dem Boden liegt
    for x in (-0.05, 0.05): ring((x, 0, 0.025), 0.027, 0.0025, mat("schnur", (150, 110, 60), 0.9), (0, math.radians(90), 0))
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.018, depth=0.008, location=(0.0, -0.022, 0.035), rotation=(math.radians(70), 0, 0)); o = glatt(bpy.context.object); o.data.materials.append(mat("siegel", (165, 25, 25), 0.4))
    for i in range(5): wuerfel((-0.06 + i * 0.012, -0.07, 0.0065), (0.006, 0.05 - i * 0.006, 0.0005), mat("tinte", (50, 35, 25)), (0, 0, 0.06), 0.1)
elif ART == "schluesselbund":
    EIS = mat("eisen", (110, 105, 100), 0.45, 0.8)
    ring((0, 0, 0.004), 0.045, 0.004, EIS)
    for k, a in enumerate((-40, 10, 60)):
        a = math.radians(a); c, s = math.cos(a), math.sin(a); p = Vector((0.045 * c, 0.045 * s, 0.004)); d = Vector((c, s, 0))
        ring(tuple(p + d * 0.018), 0.014, 0.0035, EIS, (0, 0, 0)).scale = (1, 1, 1)                 # Reide
        L = 0.07 + 0.012 * k; rohr(tuple(p + d * 0.032), tuple(p + d * (0.032 + L)), 0.0035, EIS, 8)  # Halm
        e = p + d * (0.032 + L - 0.012); q = Vector((-s, c, 0))
        for j in range(2): wuerfel(tuple(e - d * j * 0.011 + q * 0.008), (0.008, 0.008, 0.005), EIS, (0, 0, a))   # Bart
elif ART == "silberleuchter":
    SIL = mat("silber", (215, 215, 222), 0.22, 1.0); WACHS = mat("wachs", (240, 232, 210), 0.6)
    dreh("fuss", [(0, 0), (0.06, 0), (0.06, 0.008), (0.035, 0.02), (0.012, 0.04), (0.01, 0.16), (0.016, 0.17), (0, 0.172)], SIL)
    for x in (-0.08, 0.08):
        rohr((0, 0, 0.15), (x * 0.6, 0, 0.17), 0.006, SIL); rohr((x * 0.6, 0, 0.17), (x, 0, 0.2), 0.006, SIL)
    for x, z in ((-0.08, 0.2), (0.0, 0.17), (0.08, 0.2)):
        dreh("tuelle", [(0, 0), (0.02, 0), (0.016, 0.022), (0, 0.022)], SIL).location = (x, 0, z)
        rohr((x, 0, z + 0.02), (x, 0, z + 0.09), 0.011, WACHS); rohr((x, 0, z + 0.09), (x, 0, z + 0.1), 0.0012, mat("docht", (40, 30, 25)), 4)
elif ART == "apfel":
    apfel((0, 0, 0.04), 0.045, mat("apfelrot", (190, 35, 30), 0.35))
    kugel((0.02, 0.0, 0.092), 0.022, mat("blatt", (70, 130, 45), 0.5), (1.2, 0.5, 0.08), 10).rotation_euler = (0, 0.4, 0.3)
elif ART == "rotes_banner":
    HOLZ = mat("holz", (110, 75, 45), 0.8); ROT = mat("bannerrot", (165, 28, 28), 0.85); SCHW = mat("zeichen", (25, 20, 20), 0.85)
    rohr((0, 0, 0), (0, 0, 1.6), 0.015, HOLZ); rohr((-0.28, 0, 1.5), (0.28, 0, 1.5), 0.012, HOLZ); kugel((0, 0, 1.62), 0.025, mat("messing", (190, 150, 60), 0.35, 1.0))
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=12, y_subdivisions=16, size=1, location=(0, -0.01, 1.08)); o = bpy.context.object; o.rotation_euler = (math.radians(90), 0, 0); o.scale = (0.54, 0.84, 1)
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    for v in o.data.vertices:
        v.co.y += 0.025 * math.sin(v.co.z * 9 + v.co.x * 4)                                       # Falten
        if v.co.z < 0.72: v.co.z += 0.12 * max(0.0, 1 - abs(v.co.x) / 0.27) ** 0.5                 # Schwalbenschwanz unten
    o.data.materials.append(ROT); glatt(o); s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.006
    for p in ([(-0.09, 1.2), (0.09, 1.2), (0.0, 1.0)], [(-0.06, 1.33), (0.06, 1.33), (0.0, 1.2)]):   # schwarzes Zeichen: zwei Spitzen (Rabe / Klinge)
        me = bpy.data.meshes.new("z"); me.from_pydata([(x, -0.03, z) for x, z in p], [], [(0, 1, 2)]); z = bpy.data.objects.new("z", me); bpy.context.collection.objects.link(z); z.data.materials.append(SCHW)
        z.modifiers.new("d", "SOLIDIFY").thickness = 0.003
elif ART == "apfelkorb":
    WEIDE = mat("weide", (165, 120, 70), 0.85)
    o = dreh("korb", [(0, 0), (0.1, 0), (0.13, 0.04), (0.15, 0.12), (0.142, 0.12), (0.122, 0.042), (0.094, 0.008), (0, 0.008)], WEIDE, 36)
    for z in (0.03, 0.06, 0.09, 0.118): ring((0, 0, z), 0.11 + z * 0.33, 0.006, mat("weide_d", (130, 92, 52), 0.85))
    rohr((-0.14, 0, 0.12), (-0.1, 0, 0.27), 0.008, WEIDE); rohr((-0.1, 0, 0.27), (0.1, 0, 0.27), 0.008, WEIDE); rohr((0.1, 0, 0.27), (0.14, 0, 0.12), 0.008, WEIDE)   # Henkel
    for i in range(9):
        a = random.uniform(0, 6.3); r = random.uniform(0.0, 0.08); apfel((r * math.cos(a), r * math.sin(a), 0.115 + random.uniform(0, 0.02)), 0.035, mat("apfelrot" if i % 3 else "apfelgelb", (190, 35, 30) if i % 3 else (205, 170, 50), 0.35))
elif ART in ("rabenfedern", "federsiegel", "rabenschwinge"):
    FED = mat("feder", (30, 30, 38), 0.45, 0.2); SCH = mat("schimmer", (60, 45, 95), 0.35, 0.3); KIEL = mat("kiel", (150, 140, 125), 0.5)
    def feder(ort, laenge, winkel, breite=0.022, m=FED, z=0.0):
        a = math.radians(winkel); d = Vector((math.cos(a), math.sin(a), 0)); q = Vector((-d.y, d.x, 0)); o0 = Vector(ort) + Vector((0, 0, z)); pts = []
        for k in range(9):
            t = k / 8; w = breite * math.sin(math.pi * min(1.0, t * 1.15)) * (1 - 0.3 * t); pts.append(o0 + d * laenge * t + q * w)
        for k in range(8, -1, -1):
            t = k / 8; w = breite * 0.8 * math.sin(math.pi * min(1.0, t * 1.15)) * (1 - 0.3 * t); pts.append(o0 + d * laenge * t - q * w)
        me = bpy.data.meshes.new("f"); me.from_pydata([tuple(p) for p in pts[1:-1]], [], [tuple(range(len(pts) - 2))]); f = bpy.data.objects.new("f", me); bpy.context.collection.objects.link(f)
        f.data.materials.append(m); f.modifiers.new("d", "SOLIDIFY").thickness = 0.002
        rohr(tuple(o0 - d * 0.012), tuple(o0 + d * laenge * 0.9 + Vector((0, 0, 0.002))), 0.0011, KIEL, 5)
    if ART == "rabenfedern":
        for k, (w, L, b) in enumerate(((60, 0.2, 0.024), (78, 0.23, 0.027), (95, 0.19, 0.022))): feder((0.0 + 0.012 * k, -0.08, 0.004 * k), L, w, b, SCH if k == 1 else FED)
        ring((0.003, -0.07, 0.01), 0.01, 0.003, mat("schnur", (150, 110, 60), 0.9))
    elif ART == "federsiegel":
        WACHS = mat("wachs", (40, 28, 60), 0.35)
        dreh("siegel", [(0, 0), (0.05, 0), (0.056, 0.004), (0.052, 0.014), (0.045, 0.018), (0, 0.018)], WACHS, 28)
        for k in range(8): kugel((0.054 * math.cos(k * 0.8 + 0.3), 0.054 * math.sin(k * 0.8 + 0.3), 0.006), 0.008 + 0.003 * (k % 3), WACHS, (1, 1, 0.6), 8)
        feder((-0.025, -0.012, 0), 0.05, 35, 0.011, mat("praegung", (95, 70, 140), 0.3), 0.019)
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0.0, 0.08, 0.001)); o = bpy.context.object; o.scale = (0.05, 0.08, 1); o.data.materials.append(mat("band", (120, 20, 30), 0.7))
    else:                                                                                          # Rabenschwinge: Einhandschwert, schwarze Klinge mit violettem Schimmer, Parierstange aus Federn, Rabenkopf-Knauf
        STAHL = mat("klinge", (45, 45, 55), 0.25, 0.9); GOLD = mat("gold", (170, 135, 60), 0.3, 1.0); GRIFF = mat("griff", (40, 30, 30), 0.8)
        for sx in (-1, 1):                                                                         # Parierstange aus Federn: erst flach (y = oben) bauen, dann aufrichten
            for j in range(3): feder((sx * 0.015, 0.072 - j * 0.008, 0), 0.15 - j * 0.03, 90 - sx * (80 - j * 18), 0.028 - j * 0.004, GOLD if j == 0 else SCH)
        for o in list(bpy.context.scene.objects): o.select_set(True)
        bpy.ops.transform.rotate(value=math.radians(90), orient_axis="X", center_override=(0, 0, 0)); bpy.ops.object.transform_apply(rotation=True, location=True); bpy.ops.object.select_all(action="DESELECT")
        me = bpy.data.meshes.new("k"); L = 0.62
        me.from_pydata([(-0.025, 0, 0.08), (0.025, 0, 0.08), (0.022, 0, 0.08 + L * 0.7), (0.0, 0, 0.08 + L), (-0.03, 0, 0.08 + L * 0.62), (0, 0.006, 0.08 + L * 0.4), (0, -0.006, 0.08 + L * 0.4)],
                       [], [(0, 1, 5), (1, 2, 5), (2, 3, 5), (3, 4, 5), (4, 0, 5), (1, 0, 6), (2, 1, 6), (3, 2, 6), (4, 3, 6), (0, 4, 6)]); k_ = bpy.data.objects.new("k", me); bpy.context.collection.objects.link(k_); k_.data.materials.append(STAHL)
        rohr((0, 0, 0.1), (0, 0, 0.08 + L * 0.85), 0.003, SCH, 5)                                     # Blutrinne violett
        rohr((0, 0, -0.1), (0, 0, 0.075), 0.013, GRIFF, 10); kugel((0, 0, -0.115), 0.02, GOLD, (1, 1.3, 1), 10); rohr((0, -0.02, -0.11), (0, -0.05, -0.118), 0.007, GOLD, 6, 0.0)   # Rabenkopf-Knauf mit Schnabel
elif ART == "sichel":                                                                            # Erntesichel: Holzgriff (Ursprung = Griffende, oben +z), halbmondförmige Klinge
    HOLZ = mat("holz", (150, 105, 60), 0.75); STAHL = mat("sichelstahl", (185, 188, 195), 0.35, 0.45); ZW = mat("zwinge", (110, 85, 50), 0.4, 0.8)
    rohr((0, 0, 0), (0, 0, 0.16), 0.016, HOLZ, 10, 0.014); rohr((0, 0, 0.155), (0, 0, 0.18), 0.017, ZW, 10)
    pts_a, pts_i = [], []
    for k in range(17):                                                                          # Halbmond in der x-z-Ebene: Außen- und Innenkante
        t = k / 16; a = math.radians(-20 + 200 * t); r = 0.13; c = Vector((-0.11, 0, 0.2))
        pts_a.append(c + Vector((r * math.cos(a), 0, r * math.sin(a)))); w = 0.028 * math.sin(math.pi * min(1.0, t * 1.1)) + 0.004
        pts_i.append(c + Vector(((r - w) * math.cos(a), 0, (r - w) * math.sin(a))))
    me = bpy.data.meshes.new("klinge"); vs = [tuple(p) for p in pts_a + pts_i]; n = len(pts_a)
    me.from_pydata(vs, [], [(i, i + 1, n + i + 1, n + i) for i in range(n - 1)]); k_ = bpy.data.objects.new("klinge", me); bpy.context.collection.objects.link(k_); k_.data.materials.append(STAHL); k_.modifiers.new("d", "SOLIDIFY").thickness = 0.004
    rohr((0, 0, 0.17), (0.02, 0, 0.2), 0.008, STAHL, 6)                                                # Angel zur Klinge
elif ART == "stock":                                                                             # knorriger Wanderstock (0,9 m – reicht von der hängenden Hand zum Boden), Griffende oben gebogen; Ursprung = unteres Ende
    HOLZ = mat("stockholz", (105, 75, 45), 0.85); random.seed(3); pts = [Vector((0, 0, 0))]
    for k in range(1, 9): pts.append(Vector((random.uniform(-0.01, 0.01), random.uniform(-0.01, 0.01), 0.8 * k / 8)))
    pts += [Vector((0.04, 0, 0.88)), Vector((0.09, 0, 0.86))]
    for a, b in zip(pts, pts[1:]): rohr(tuple(a), tuple(b), 0.016, HOLZ, 8)
    for z in (0.25, 0.5, 0.7): kugel((0.012, 0, z), 0.012, HOLZ, (1, 1, 1.5), 6)                    # Astknoten
elif ART == "staken":                                                                            # Fährstaken: 2,4 m Stange mit eiserner Spitze und Haken (Kord Weller); Ursprung = unteres Ende
    HOLZ = mat("stakenholz", (140, 105, 65), 0.8); EIS = mat("eisen", (90, 88, 86), 0.45, 0.8)
    rohr((0, 0, 0.08), (0, 0, 2.4), 0.018, HOLZ, 10); rohr((0, 0, 0), (0, 0, 0.1), 0.012, EIS, 8, 0.002); rohr((0, 0, 0.08), (0.06, 0, 0.16), 0.007, EIS, 6)
    for z in (1.0, 1.6): rohr((0, 0, z), (0, 0, z + 0.04), 0.021, mat("wicklung", (110, 80, 50), 0.9), 10)
elif ART == "splitterkern":
    KRIST = mat("kristall", (90, 150, 235), 0.1); KERN = mat("kern", (200, 170, 255), 0.05)
    for m_ in (KRIST, KERN):
        b = m_.node_tree.nodes["Principled BSDF"]; b.inputs["Emission Color"].default_value = b.inputs["Base Color"].default_value; b.inputs["Emission Strength"].default_value = 0.8 if m_ is KRIST else 2.5
    kugel((0, 0, 0.06), 0.016, KERN, (1, 1, 1.1), 10)                                            # leuchtender Kern, von Kristallsplittern umschlossen
    random.seed(9)
    for k in range(11):
        a = k / 11 * 2 * math.pi + random.uniform(-0.2, 0.2); e = random.uniform(-0.2, 1.2); d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))); L = random.uniform(0.07, 0.12)
        o = rohr(tuple(Vector((0, 0, 0.06)) - d * 0.01), tuple(Vector((0, 0, 0.06)) + d * L), 0.022, KRIST, 6, 0.0)
    dreh("fassung", [(0, 0), (0.04, 0), (0.035, 0.022), (0.0, 0.022)], mat("eisen", (70, 66, 72), 0.4, 0.8), 6)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join()          # ein Netz (rig.py nimmt bei starren Teilen nur eines)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Beute:", ART, os.path.getsize(ZIEL) // 1024, "KB")
