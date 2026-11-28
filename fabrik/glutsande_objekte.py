"""Mythara Fabrik – Weltobjekte der Glutsande (Phase 9) in Blender bauen (glb, Maßstab 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/glutsande_objekte.py -- <art> <ziel.glb>

spiegelplatte    – Spiegelplatte für das Licht-Rätsel im versandeten Tempel: Sockel aus Sandstein mit Glutzeichen, Bronzegabel,
                   runder polierter Bronzespiegel (Ø 0,9 m) leicht nach oben geneigt, Spiegelseite nach -y (≈ 1,7 m hoch). Das Spiel dreht das ganze Objekt um die Hochachse.
salzpfanne       – Salzpfanne der Siederei: flaches Becken (3,2 × 2,2 m) mit Lehmrand, weiße Salzkruste mit Rissen, zwei Salzhaufen, Holzrechen, Salzkorb.
schoepfrad       – Schöpfrad am Kanal: Holzgestell mit Achse auf 1,8 m, Rad (Ø 3,2 m) mit Speichen und Tonkrügen am Kranz, Rinne zur Seite (+x) – alles in einem Stück.
schoepfrad_gestell / schoepfrad_rad – dasselbe getrennt: Gestell mit Rinne (Ursprung Mitte unten) und das Rad allein (Ursprung in der Achse, Achse = x),
                   damit das Spiel das Rad drehen kann (Rad auf die Höhe 1,8 m über das Gestell setzen).
"""
#172 Ockerlande: zelt_gross (Karawanenzelt 5 × 4 m, Vordach) · zelt_rund (Rundzelt Ø 4 m) · ziehbrunnen · akazie (Schirmakazie ≈ 5 m) · dornenhecke (Zaunstück 3 m, entlang x)
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
SAND = mat("sandstein", (196, 160, 112), 0.85); SAND2 = mat("sandstein_dunkel", (150, 116, 78), 0.9); BRONZE = mat("bronze", (176, 120, 60), 0.35, 0.85)
SPIEGEL = mat("spiegel", (236, 214, 170), 0.08, 1.0); GLUT = mat("glutzeichen", (255, 130, 40), 0.4, 0, 1.6)
HOLZ = mat("holz", (138, 100, 62), 0.85); HOLZ2 = mat("holz_dunkel", (96, 68, 44), 0.85); LEHM = mat("lehm", (176, 128, 88), 0.9)
SALZ = mat("salz", (244, 242, 236), 0.6); SALZ2 = mat("salz_grau", (214, 208, 196), 0.8); TON = mat("ton", (170, 92, 56), 0.75); WASSER = mat("wasser", (70, 120, 140), 0.1)
if ART == "spiegelplatte":
    dreh([(0, 0), (0.42, 0), (0.42, 0.08), (0.34, 0.12), (0.3, 0.55), (0.36, 0.6), (0.36, 0.66), (0, 0.66)], SAND, 8)          # achteckiger Sockel
    for k in range(4): a = k * math.pi / 2 + math.pi / 8; wuerfel((0.31 * math.cos(a), 0.31 * math.sin(a), 0.34), (0.02, 0.1, 0.16), GLUT, (0, 0, a), 0)   # Glutzeichen
    rohr((0, 0, 0.66), (0, 0, 0.82), 0.07, BRONZE, 12)
    for sx in (-1, 1): rohr((0, 0, 0.8), (sx * 0.52, 0, 0.92), 0.04, BRONZE, 8); rohr((sx * 0.52, 0, 0.92), (sx * 0.52, 0, 1.25), 0.04, BRONZE, 8); kugel((sx * 0.52, 0, 1.27), 0.055, BRONZE)
    K = math.radians(-12)                                                                             # leicht nach oben geneigt
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.45, depth=0.05, location=(0, 0.0, 1.22), rotation=(math.radians(90) + K, 0, 0)); bpy.context.object.data.materials.append(BRONZE)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.4, depth=0.012, location=(0, -0.028 * math.cos(K), 1.22 + 0.028 * math.sin(K)), rotation=(math.radians(90) + K, 0, 0)); bpy.context.object.data.materials.append(SPIEGEL)
    ring((0, -0.026, 1.22), 0.44, 0.022, BRONZE, (math.radians(90) + K, 0, 0), seg=(40, 8))
    for k in range(8): a = k * math.pi / 4; kristall((0.47 * math.cos(a), 0.02 * math.sin(K), 1.22 + 0.47 * math.sin(a)), 0.03, 0.09, BRONZE, (0, -a + math.pi / 2, 0))   # Sonnenzacken
    for sx in (-1, 1): rohr((sx * 0.47, 0, 1.22), (sx * 0.52, 0, 1.22), 0.035, BRONZE, 8)                          # Zapfen in der Gabel
elif ART == "salzpfanne":
    wuerfel((0, 0, 0.04), (3.2, 2.2, 0.08), LEHM, fase=0.05)
    for sx in (-1, 1): wuerfel((sx * 1.55, 0, 0.14), (0.16, 2.2, 0.22), LEHM, fase=0.25)
    for sy in (-1, 1): wuerfel((0, sy * 1.05, 0.14), (3.1, 0.16, 0.22), LEHM, fase=0.25)
    wuerfel((0, 0, 0.1), (2.94, 1.94, 0.04), SALZ, fase=0)                                           # Salzkruste
    random.seed(3)
    for k in range(22):                                                                              # Risse in der Kruste
        x, y, a = random.uniform(-1.35, 1.35), random.uniform(-0.85, 0.85), random.uniform(0, math.pi); wuerfel((x, y, 0.121), (random.uniform(0.25, 0.6), 0.018, 0.004), SALZ2, (0, 0, a), 0)
    for x, y, r in ((-0.8, 0.3, 0.42), (0.6, -0.4, 0.34)):
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=r, radius2=0.03, depth=r * 0.9, location=(x, y, 0.12 + r * 0.45)); o = glatt(bpy.context.object); o.data.materials.append(SALZ)
        for v in o.data.vertices: v.co *= random.uniform(0.95, 1.05)
    rohr((1.0, 0.5, 0.13), (2.0, 1.3, 1.1), 0.025, HOLZ, 6)                                           # Rechen, an den Rand gelehnt
    wuerfel((1.0, 0.5, 0.15), (0.5, 0.06, 0.05), HOLZ2, (0, 0, math.radians(-50)), 0.1)
    for k in range(6): rohr((1.0 + (k - 2.5) * 0.06 * 0.64, 0.5 - (k - 2.5) * 0.06 * 0.77, 0.13), (1.0 + (k - 2.5) * 0.06 * 0.64, 0.5 - (k - 2.5) * 0.06 * 0.77, 0.06), 0.008, HOLZ2, 4)
    dreh([(0, 0), (0.22, 0), (0.28, 0.32), (0.25, 0.32), (0.19, 0.03), (0, 0.03)], mat("korb", (186, 150, 96), 0.9), 16).location = (-1.9, -1.0, 0)   # Korb neben dem Becken
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.24, radius2=0.04, depth=0.16, location=(-1.9, -1.0, 0.34)); glatt(bpy.context.object).data.materials.append(SALZ)
elif ART in ("schoepfrad", "schoepfrad_gestell", "schoepfrad_rad"):
    AH = 1.8; R = 1.6; BR = 0.5
    if ART != "schoepfrad_gestell":
        z0 = 0.0 if ART == "schoepfrad_rad" else AH
        for sx in (-1, 1): ring((sx * BR / 2, 0, z0), R, 0.05, HOLZ, (0, math.radians(90), 0), seg=(32, 6))   # zwei Radkränze
        rohr((-BR / 2 - 0.15, 0, z0), (BR / 2 + 0.15, 0, z0), 0.09, HOLZ2, 12)                             # Nabe/Achse
        for k in range(12):
            a = k * math.pi / 6; cy, cz = R * math.cos(a), R * math.sin(a)
            for sx in (-1, 1): rohr((sx * BR / 2, 0, z0), (sx * BR / 2, cy, z0 + cz), 0.035, HOLZ, 6)          # Speichen
            wuerfel((0, cy * 1.0, z0 + cz * 1.0), (BR + 0.06, 0.06, 0.06), HOLZ2, (-a, 0, 0), 0.1)          # Querholz am Kranz
            o = dreh([(0, 0), (0.1, 0), (0.15, 0.1), (0.13, 0.22), (0.08, 0.27), (0.09, 0.3), (0, 0.3)], TON, 12)   # Tonkrug, Öffnung tangential
            o.location = (0, (R + 0.12) * math.cos(a + 0.1), z0 + (R + 0.12) * math.sin(a + 0.1)); o.rotation_euler = (a + 0.1 + math.pi, 0, 0)
    if ART != "schoepfrad_rad":
        for sx in (-1, 1):
            rohr((sx * (BR / 2 + 0.3), -0.8, 0), (sx * (BR / 2 + 0.3), 0, AH + 0.1), 0.08, HOLZ2, 8); rohr((sx * (BR / 2 + 0.3), 0.8, 0), (sx * (BR / 2 + 0.3), 0, AH + 0.1), 0.08, HOLZ2, 8)
            wuerfel((sx * (BR / 2 + 0.3), 0, AH + 0.05), (0.2, 0.2, 0.2), HOLZ2, fase=0.15); rohr((sx * (BR / 2 + 0.3), -0.55, 0.6), (sx * (BR / 2 + 0.3), 0.55, 0.6), 0.05, HOLZ, 6)
            wuerfel((sx * (BR / 2 + 0.3), 0, 0.05), (0.3, 1.9, 0.1), SAND2, fase=0.1)
        wuerfel((BR / 2 + 1.3, 0.35, AH + R - 0.1), (2.4, 0.36, 0.08), HOLZ, fase=0.05)                     # Rinne oben, zur Seite (+x)
        for sy in (-1, 1): wuerfel((BR / 2 + 1.3, 0.35 + sy * 0.17, AH + R - 0.02), (2.4, 0.04, 0.16), HOLZ, fase=0.05)
        wuerfel((BR / 2 + 1.3, 0.35, AH + R - 0.045), (2.36, 0.3, 0.01), WASSER, fase=0)
        for x in (BR / 2 + 0.6, BR / 2 + 2.3): rohr((x, 0.35, 0), (x, 0.35, AH + R - 0.14), 0.06, HOLZ2, 8)
elif ART in ("zelt_gross", "zelt_rund"):                                                         # #172 Ockerlande: Karawanenzelt (gestreift, Vordach auf Stangen) / Rundzelt der Hirten
    STOFF = mat("zeltstoff", (214, 190, 146), 0.85); STREIF = mat("zeltstreifen", (166, 70, 44), 0.8); TEPPICH = mat("teppich", (140, 50, 40), 0.9)
    if ART == "zelt_gross":                                                                    # 5 × 4 m, Firsthöhe 3 m, offene Front nach -y mit Vordach
        for k, x in enumerate((-2.5, -1.5, -0.5, 0.5, 1.5)):
            m_ = STREIF if k % 2 else STOFF
            me = bpy.data.meshes.new("bahn"); me.from_pydata([(x, -2.0, 1.4), (x + 1, -2.0, 1.4), (x + 1, 0.0, 3.0), (x, 0.0, 3.0), (x, 2.0, 1.4), (x + 1, 2.0, 1.4)], [], [(0, 1, 2, 3), (3, 2, 5, 4)])
            o = bpy.data.objects.new("bahn", me); bpy.context.collection.objects.link(o); o.data.materials.append(m_); sd = o.modifiers.new("d", "SOLIDIFY"); sd.thickness = 0.03
        for sx in (-2.5, 2.5):                                                                 # Giebel und Seitenwände
            me = bpy.data.meshes.new("giebel"); me.from_pydata([(sx, -2.0, 0.0), (sx, 2.0, 0.0), (sx, 2.0, 1.4), (sx, 0.0, 3.0), (sx, -2.0, 1.4)], [], [(0, 1, 2, 3, 4)])
            o = bpy.data.objects.new("g", me); bpy.context.collection.objects.link(o); o.data.materials.append(STOFF); sd = o.modifiers.new("d", "SOLIDIFY"); sd.thickness = 0.03
        wuerfel((0, 1.98, 0.7), (5.0, 0.04, 1.4), STOFF, fase=0)
        for x in (-2.5, 0.0, 2.5):
            for y in (-2.0, 2.0): rohr((x, y, 0), (x, y, 1.45), 0.05, HOLZ2, 6)
            rohr((x, 0, 0), (x, 0, 3.05), 0.06, HOLZ2, 6)
        me = bpy.data.meshes.new("vordach"); me.from_pydata([(-2.5, -2.0, 1.4), (2.5, -2.0, 1.4), (2.5, -3.4, 1.9), (-2.5, -3.4, 1.9)], [], [(0, 1, 2, 3)])
        o = bpy.data.objects.new("vd", me); bpy.context.collection.objects.link(o); o.data.materials.append(STREIF); sd = o.modifiers.new("d", "SOLIDIFY"); sd.thickness = 0.03
        for x in (-2.4, 2.4): rohr((x, -3.4, 0), (x, -3.4, 1.95), 0.04, HOLZ2, 6)
        wuerfel((0, -0.6, 0.02), (3.0, 2.0, 0.04), TEPPICH, fase=0); wuerfel((-1.6, 1.2, 0.3), (0.8, 0.6, 0.6), HOLZ, fase=0.08); kugel((1.5, 1.2, 0.35), 0.35, TON, (1, 1, 1.2), 12)
    else:                                                                                      # Rundzelt: Ø 4 m, Kegeldach auf Mittelstange, Eingang -y
        dreh([(2.0, 0.0), (2.0, 1.5), (0.25, 3.0), (0.0, 3.0)], STOFF, 32)
        for k in range(8): a_ = k * math.pi / 4; rohr((2.02 * math.cos(a_), 2.02 * math.sin(a_), 0.3), (2.02 * math.cos(a_), 2.02 * math.sin(a_), 1.5), 0.06, STREIF, 4)
        ring((0, 0, 1.5), 2.02, 0.05, STREIF, seg=(32, 4)); rohr((0, 0, 3.0), (0, 0, 3.5), 0.05, HOLZ2, 6)
        wuerfel((0, -2.02, 0.75), (1.0, 0.06, 1.5), mat("eingang", (60, 40, 30), 0.9), fase=0)
        kugel((0.0, 0.0, 3.55), 0.08, BRONZE, n=8)
elif ART == "ziehbrunnen":                                                                     # #172 Ziehbrunnen: Lehmziegel-Rund, Holzgalgen mit Rolle, Seil und Eimer, Tröge
    dreh([(0.0, 0.0), (1.0, 0.0), (1.0, 0.85), (0.8, 0.85), (0.8, 0.2), (0.0, 0.2)], LEHM, 24); ring((0, 0, 0.86), 0.9, 0.08, SAND2, seg=(24, 6))
    dreh([(0.0, 0.25), (0.78, 0.25)], WASSER, 20)
    for sx in (-0.95, 0.95): rohr((sx, 0, 0.85), (sx, 0, 2.6), 0.08, HOLZ2, 6)
    rohr((-1.05, 0, 2.55), (1.05, 0, 2.55), 0.07, HOLZ, 8); ring((0, 0, 2.45), 0.14, 0.03, HOLZ2, (0, math.radians(90), 0))
    rohr((0, 0, 2.35), (0, 0, 1.3), 0.012, mat("seil", (176, 150, 104), 0.85), 4)
    dreh([(0.0, 1.0), (0.14, 1.0), (0.17, 1.28), (0.0, 1.28)], HOLZ, 12); ring((0, 0, 1.28), 0.17, 0.015, mat("eisen", (96, 96, 102), 0.45, 0.6), seg=(16, 4))
    wuerfel((1.7, 0.4, 0.2), (1.4, 0.5, 0.4), HOLZ2, fase=0.05); wuerfel((1.7, 0.4, 0.36), (1.25, 0.38, 0.06), WASSER, fase=0)
elif ART == "akazie":                                                                          # #172 Akazie (Schirmakazie): geteilter Stamm, flache breite Krone (≈ 5 m hoch, 7 m breit)
    RINDE = mat("rinde", (96, 78, 60), 0.9); LAUB = mat("akazienlaub", (110, 130, 60), 0.85); LAUB2 = mat("akazienlaub_hell", (138, 150, 70), 0.85)
    rohr((0, 0, 0), (0.1, 0, 2.0), 0.22, RINDE, 10, 0.16)
    for a_, l in ((0.6, 2.6), (2.4, 2.4), (4.2, 2.2)):
        e = (0.1 + l * 0.6 * math.cos(a_), l * 0.6 * math.sin(a_), 4.2); rohr((0.1, 0, 2.0), e, 0.14, RINDE, 8, 0.08)
    for k in range(26):                                                                        # flache Schirmkrone aus Laubpolstern
        a_ = random.uniform(0, 2 * math.pi); r = random.uniform(0.3, 3.2)
        kugel((r * math.cos(a_), r * math.sin(a_), 4.4 + random.uniform(-0.15, 0.25)), random.uniform(0.7, 1.1), LAUB if k % 3 else LAUB2, (1.4, 1.4, 0.35), 10)
elif ART == "dornenhecke":                                                                     # #172 Dornenhecke als Zaunstück: 3 m lang, 1,3 m hoch, dürre Zweige mit Dornen, entlang x
    DORN = mat("dornzweig", (110, 88, 64), 0.9); GRAU = mat("dornzweig_grau", (140, 128, 110), 0.9); BLATT = mat("dornblatt", (100, 116, 60), 0.85)
    for k in range(70):
        x = random.uniform(-1.5, 1.5); a_ = random.uniform(0, 2 * math.pi); l = random.uniform(0.6, 1.4); p0 = (x, random.uniform(-0.25, 0.25), 0)
        p1 = (x + 0.5 * l * math.cos(a_), p0[1] + 0.3 * l * math.sin(a_), l * random.uniform(0.6, 1.0)); rohr(p0, p1, 0.018, DORN if k % 2 else GRAU, 4)
        for j in range(3): t = random.uniform(0.3, 0.9); q = tuple(p0[i] + (p1[i] - p0[i]) * t for i in range(3)); kristall(q, 0.008, 0.06, GRAU, (random.uniform(0, 3), random.uniform(0, 3), 0))
    for k in range(18): kugel((random.uniform(-1.4, 1.4), random.uniform(-0.2, 0.2), random.uniform(0.4, 1.1)), 0.08, BLATT, (1.4, 1, 0.6), 6)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices) if ART != "schoepfrad_rad" else 0.0   # das Rad behält seinen Ursprung in der Achse
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
