"""Mythara Fabrik – kleine Wegrand-Objekte für die Verdichtung von Grenzland, Waldland und Westmark (glb, 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/wegrand.py -- <art> <ziel.glb>

wegkreuz_holz     Holzkreuz mit kleinem Dach und Blumen am Fuß (≈ 2,2 m)
wegkreuz_stein    Steinkreuz auf Sockel, verwittert, Moos (≈ 1,8 m)
bildstock         Bildstock: Steinpfeiler mit Nische und Laterne (≈ 2 m)
feldstein_1 … _3  Feldsteine / Findlinge in drei Größen und Formen (0,5 / 0,9 / 1,4 m), mit Moos
lesesteinhaufen   Haufen aufgelesener Steine am Feldrand
zaun_latten       Lattenzaun, 3 m, entlang x
zaun_flecht       Flechtzaun (Weiden), 3 m, entlang x
zaun_stein        Trockenmauer, 3 m, entlang x
heuhaufen         Heuhaufen (kegelig, mit Stange)
heuballen_rund    zwei runde Heuballen
karren_heu        Heuwagen (zweiachsig, Heu geladen)
karren_kaputt     umgestürzter Karren mit losem Rad
ruine_bogen       Torbogen-Ruine aus Bruchstein, Efeu
ruine_ecke        Mauerecke einer Ruine, Stufen gebrochen
huette_feld       kleine Feldhütte aus Brettern mit Grasdach
brunnen_feld      Feldbrunnen: Steintrog mit Schwengelpumpe
"""
import math, os, random, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(sum(map(ord, ART)))
def mat(n, c, r=0.8, gl=0.0, leucht=0.0):
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
def rohr(p0, p1, r, m, n=8, r1=None):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); return glatt(o)
def kugel(ort, r, m, sk=(1, 1, 1), n=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=max(4, n // 2), radius=r, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
def ring(ort, r, d, m, rot=(0, 0, 0), seg=(20, 6)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=d, location=ort, rotation=rot, major_segments=seg[0], minor_segments=seg[1]); o = bpy.context.object; o.data.materials.append(m); return glatt(o)
def fels(ort, r, m, sk=(1, 1, 1), zufall=0.25, n=14):
    """unregelmäßiger Stein: Kugel mit zufällig verschobenen Punkten"""
    o = kugel(ort, r, m, sk, n)
    for v in o.data.vertices: v.co *= 1 + random.uniform(-zufall, zufall)
    return glatt(o, False)
HOLZ = mat("holz", (128, 92, 58)); HOLZ2 = mat("holz_dunkel", (84, 60, 40)); HOLZ3 = mat("holz_grau", (120, 112, 100))
STEIN = mat("stein", (140, 136, 128), 0.9); STEIN2 = mat("stein_dunkel", (104, 100, 94), 0.9); MOOS = mat("moos", (84, 112, 52), 0.95)
HEU = mat("heu", (212, 180, 100), 0.95); HEU2 = mat("heu_dunkel", (176, 146, 76), 0.95); EISEN = mat("eisen", (96, 96, 102), 0.5, 0.6)
GRAS = mat("grasdach", (110, 124, 64), 0.95); BLUME = mat("blume_rot", (200, 60, 50), 0.6); BLUME2 = mat("blume_gelb", (230, 200, 70), 0.6); LICHT = mat("licht", (255, 210, 130), 0.3, 0, 2.0)
EFEU = mat("efeu", (60, 96, 44), 0.9)
def moos(o_ort, r, n=5):
    for k in range(n): kugel((o_ort[0] + random.uniform(-r, r), o_ort[1] + random.uniform(-r, r), o_ort[2]), random.uniform(0.05, 0.12), MOOS, (1.4, 1.2, 0.35), 8)
if ART == "wegkreuz_holz":
    wuerfel((0, 0, 1.1), (0.14, 0.14, 2.2), HOLZ2, fase=0.15); wuerfel((0, 0, 1.6), (0.9, 0.12, 0.12), HOLZ2, fase=0.15)
    for sx in (-1, 1): wuerfel((sx * 0.22, 0, 2.28), (0.5, 0.5, 0.04), HOLZ, (0, sx * 0.6, 0), 0.1)
    for k in range(8): a = k * 0.8; kugel((0.3 * math.cos(a), 0.3 * math.sin(a), 0.08), 0.05, BLUME if k % 2 else BLUME2, n=8); rohr((0.3 * math.cos(a), 0.3 * math.sin(a), 0), (0.3 * math.cos(a), 0.3 * math.sin(a), 0.08), 0.008, MOOS, 4)
    fels((0, 0, 0.05), 0.22, STEIN, (1.3, 1.3, 0.4))
elif ART == "wegkreuz_stein":
    wuerfel((0, 0, 0.2), (0.6, 0.6, 0.4), STEIN2, fase=0.08); wuerfel((0, 0, 1.0), (0.22, 0.18, 1.3), STEIN, fase=0.12); wuerfel((0, 0, 1.35), (0.7, 0.18, 0.2), STEIN, fase=0.12)
    moos((0, 0, 0.42), 0.25, 4); moos((0.2, 0, 1.45), 0.08, 2)
elif ART == "bildstock":
    wuerfel((0, 0, 0.15), (0.6, 0.6, 0.3), STEIN2, fase=0.08); wuerfel((0, 0, 1.0), (0.32, 0.32, 1.4), STEIN, fase=0.08)
    wuerfel((0, 0, 1.85), (0.5, 0.42, 0.5), STEIN, fase=0.06); wuerfel((0, -0.18, 1.85), (0.32, 0.1, 0.36), STEIN2, fase=0.1)   # Nische
    kugel((0, -0.17, 1.8), 0.06, LICHT, n=8)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.42, radius2=0, depth=0.35, location=(0, 0, 2.27), rotation=(0, 0, math.pi / 4)); bpy.context.object.data.materials.append(STEIN2)
    moos((0, 0, 0.3), 0.3, 4)
elif ART.startswith("feldstein_"):
    g = {"feldstein_1": (0.5, (1.3, 1.0, 0.7)), "feldstein_2": (0.9, (1.4, 1.0, 0.75)), "feldstein_3": (1.4, (1.2, 0.9, 0.9))}[ART]
    r = g[0] / 2; fels((0, 0, r * g[1][2] * 0.8), r, STEIN if ART != "feldstein_2" else STEIN2, g[1], 0.22, 16)
    moos((0, 0, r * g[1][2] * 1.55), r * 0.6, 3 + int(r * 4))
    if ART == "feldstein_3": fels((r * 1.2, r * 0.3, r * 0.3), r * 0.4, STEIN2, (1.2, 1, 0.8))
elif ART == "lesesteinhaufen":
    for k in range(22):
        a = random.uniform(0, 2 * math.pi); d = random.uniform(0, 0.8) * (1 - k / 30); z = 0.1 + (1 - d / 0.8) * 0.45 * random.uniform(0.4, 1)
        fels((d * math.cos(a), d * math.sin(a), z), random.uniform(0.12, 0.22), STEIN if k % 3 else STEIN2, (1.2, 1, 0.8))
    moos((0, 0, 0.55), 0.3, 3)
elif ART == "zaun_latten":
    for x in (-1.5, 0.0, 1.5): wuerfel((x, 0, 0.6), (0.1, 0.1, 1.2), HOLZ2, fase=0.15)
    for z in (0.4, 0.9): wuerfel((0, 0.07, z), (3.1, 0.04, 0.09), HOLZ, fase=0.1)
    for k in range(15):
        x = -1.4 + k * 0.2; h = 1.05 + random.uniform(-0.04, 0.04)
        wuerfel((x, 0.1, h / 2), (0.09, 0.025, h), HOLZ3 if k % 4 else HOLZ, (0, random.uniform(-0.04, 0.04), 0), 0.1)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.065, radius2=0, depth=0.08, location=(x, 0.1, h + 0.04), rotation=(0, 0, math.pi / 4)); bpy.context.object.scale = (1, 0.3, 1); bpy.context.object.data.materials.append(HOLZ3)
elif ART == "zaun_flecht":
    WEIDE = mat("weide", (150, 120, 80), 0.85)
    pf = [-1.5 + k * 0.5 for k in range(7)]
    for x in pf: rohr((x, 0, 0), (x, 0, 1.0), 0.035, HOLZ2, 6)
    for j in range(9):
        z = 0.12 + j * 0.095; s = 1 if j % 2 else -1
        pts = [(x, 0.035 * s * (1 if i % 2 else -1), z) for i, x in enumerate(pf)]
        for p0, p1 in zip(pts, pts[1:]): rohr(p0, p1, 0.016, WEIDE, 5)
elif ART == "zaun_stein":
    x = -1.5
    for lage in range(4):
        x = -1.5 + (0.15 if lage % 2 else 0)
        while x < 1.45:
            l = random.uniform(0.25, 0.45); l = min(l, 1.5 - x)
            fels((x + l / 2, random.uniform(-0.03, 0.03), 0.13 + lage * 0.19), l / 2, STEIN if random.random() > 0.3 else STEIN2, (1.0, 0.75, 0.55), 0.15, 10); x += l
    moos((0, 0, 0.82), 1.2, 6)
elif ART == "heuhaufen":
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=1.0, radius2=0.12, depth=1.9, location=(0, 0, 0.95)); o = bpy.context.object; o.data.materials.append(HEU)
    for v in o.data.vertices: v.co.x *= 1 + random.uniform(-0.06, 0.06); v.co.y *= 1 + random.uniform(-0.06, 0.06)
    kugel((0, 0, 1.9), 0.18, HEU2, (1, 1, 0.8)); rohr((0, 0, 1.8), (0.05, 0, 2.5), 0.03, HOLZ2, 6)
    for k in range(12): a = random.uniform(0, 6.3); rohr((0.95 * math.cos(a), 0.95 * math.sin(a), 0.02), (1.15 * math.cos(a), 1.15 * math.sin(a), 0.0), 0.012, HEU2, 4)
elif ART == "heuballen_rund":
    for k, (x, y, rz) in enumerate(((-0.6, 0, 0), (0.7, 0.3, 0.6))):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.6, depth=1.1, location=(x, y, 0.6), rotation=(math.radians(90), 0, rz)); o = bpy.context.object; o.data.materials.append(HEU if k else HEU2)
        ring((x, y, 0.6), 0.6, 0.012, mat("garn", (200, 180, 140)), (math.radians(90), 0, rz)); glatt(o)
elif ART in ("karren_heu", "karren_kaputt"):
    def rad(ort, r, rot):
        ring(ort, r, r * 0.08, HOLZ2, rot, seg=(24, 6)); ring(ort, r * 0.98, r * 0.03, EISEN, rot, seg=(24, 4))
        for k in range(8):
            a = 2 * math.pi * k / 8; R = Vector((0, r * math.cos(a), r * math.sin(a)))
            if rot[2]: R = Vector((r * math.cos(a), 0, r * math.sin(a)))
            rohr(ort, Vector(ort) + R, r * 0.04, HOLZ2, 5)
        kugel(ort, r * 0.14, EISEN, n=8)
    if ART == "karren_heu":
        wuerfel((0, 0, 0.75), (1.4, 2.6, 0.1), HOLZ, fase=0.05)
        for sx in (-0.7, 0.7): wuerfel((sx, 0, 1.0), (0.06, 2.6, 0.45), HOLZ3, fase=0.1)
        for sx in (-0.75, 0.75):
            for y in (-0.9, 0.9): rad((sx, y, 0.45), 0.45, (0, math.radians(90), 0))
        rohr((0, -1.3, 0.8), (0, -2.6, 0.5), 0.05, HOLZ2, 6)
        kugel((0, 0.1, 1.25), 1.0, HEU, (0.75, 1.35, 0.55), 16)
        for k in range(20): kugel((random.uniform(-0.6, 0.6), random.uniform(-1.2, 1.3), random.uniform(1.0, 1.6)), 0.15, HEU2, (1.5, 1, 0.6), 6)
    else:
        o = wuerfel((0, 0, 0.5), (1.3, 2.2, 0.1), HOLZ3, (0.0, math.radians(28), 0.0), 0.05)
        wuerfel((0.55, 0, 0.95), (0.06, 2.2, 0.45), HOLZ3, (0, math.radians(28), 0), 0.1)
        rad((-0.75, -0.7, 0.45), 0.45, (0, math.radians(90), 0)); rad((0.9, 0.7, 0.07), 0.45, (0, 0, math.radians(90)))   # ein Rad liegt flach daneben
        rohr((0, -1.1, 0.4), (-0.3, -2.3, 0.02), 0.05, HOLZ2, 6)
        for k in range(5): wuerfel((random.uniform(-1.2, 1.4), random.uniform(-0.8, 1.4), 0.04), (0.5, 0.08, 0.06), HOLZ3, (0, 0, random.uniform(0, 3)), 0.1)
        for k in range(6): kugel((random.uniform(-1.0, 1.4), random.uniform(-0.5, 1.4), 0.05), 0.1, MOOS, (1.5, 1, 0.4), 6)
elif ART in ("ruine_bogen", "ruine_ecke"):
    def mauer(x0, x1, y, h, quer=False):
        for lage in range(int(h / 0.32)):
            x = x0 + (0.2 if lage % 2 else 0)
            while x < x1 - 0.05:
                l = min(random.uniform(0.35, 0.6), x1 - x); z = 0.16 + lage * 0.32
                ort = (y, x + l / 2, z) if quer else (x + l / 2, y, z); gr = (0.6, l - 0.03, 0.3) if quer else (l - 0.03, 0.6, 0.3)
                if random.random() > 0.08: wuerfel(ort, gr, STEIN if random.random() > 0.3 else STEIN2, (0, 0, random.uniform(-0.04, 0.04)), 0.12)
                x += l
    if ART == "ruine_bogen":
        mauer(-2.2, -0.8, 0, 3.2); mauer(0.8, 2.2, 0, 2.6)
        for k in range(11):                                                                   # Bogen aus Keilsteinen über der Öffnung
            a = math.pi * k / 10; wuerfel((0.95 * math.cos(a), 0, 3.0 + 0.95 * math.sin(a) * 0.9), (0.32, 0.6, 0.28), STEIN, (0, -a + math.pi / 2, 0), 0.12)
        for k in range(14): kugel((random.uniform(-2.0, -0.9), -0.32, random.uniform(0.3, 3.0)), 0.12, EFEU, (1.4, 0.4, 1.2), 6)
    else:
        mauer(-2.0, 0.3, 0, 2.2); mauer(-0.3, 2.0, 0.0, 1.4, quer=True)
        for k in range(3): wuerfel((-1.0 + k * 0.4, -0.7 - k * 0.35, 0.1 + 0.0 * k), (1.6 - k * 0.3, 0.4, 0.2), STEIN2, fase=0.1)   # gebrochene Stufen
        for k in range(8): fels((random.uniform(-1.6, 1.6), random.uniform(-1.4, 1.4), 0.1), random.uniform(0.12, 0.2), STEIN2)
        for k in range(10): kugel((random.uniform(-1.8, 0.2), -0.32, random.uniform(0.2, 2.0)), 0.12, EFEU, (1.4, 0.4, 1.2), 6)
elif ART == "huette_feld":
    for x in (-1.2, 1.2):
        for y in (-1.0, 1.0): wuerfel((x, y, 0.9), (0.14, 0.14, 1.8), HOLZ2, fase=0.15)
    for k in range(13):                                                                       # Bretterwände (Rück- und Seitenwände, Front offen mit Tür)
        x = -1.2 + k * 0.2; wuerfel((x, 1.0, 0.85), (0.19, 0.05, 1.7), HOLZ3 if k % 3 else HOLZ, fase=0.05)
    for sx in (-1.2, 1.2):
        for k in range(10): wuerfel((sx, -0.9 + k * 0.2, 0.85), (0.05, 0.19, 1.7), HOLZ3 if k % 3 else HOLZ, fase=0.05)
    for k in range(4): x = -1.2 + k * 0.2; wuerfel((x, -1.0, 0.85), (0.19, 0.05, 1.7), HOLZ3, fase=0.05)
    for k in range(4): x = 0.6 + k * 0.2; wuerfel((x, -1.0, 0.85), (0.19, 0.05, 1.7), HOLZ3, fase=0.05)
    wuerfel((0.0, -1.0, 0.8), (0.95, 0.05, 1.6), HOLZ2, fase=0.05)                            # Tür
    for sx in (-1, 1):                                                                        # Grasdach: zwei Schrägen, First entlang y auf 2,55 m, Traufe 1,8 m
        wuerfel((sx * 0.68, 0, 2.18), (1.55, 2.5, 0.16), GRAS, (0, sx * math.radians(29), 0), 0.15)
    for sx in (-1, 1): wuerfel((sx * 1.22, 0, 1.95), (0.08, 2.1, 0.3), HOLZ2, fase=0.1)            # Giebelbretter oben an den Seitenwänden
    for k in range(18):
        x = random.uniform(-1.3, 1.3); kugel((x, random.uniform(-1.15, 1.15), 2.6 - 0.55 * abs(x) / 1.3 + 0.08), 0.13, GRAS, (1.3, 1.3, 0.45), 6)
elif ART == "brunnen_feld":
    wuerfel((0, 0, 0.35), (1.8, 0.8, 0.7), STEIN, fase=0.06); wuerfel((0, 0, 0.66), (1.6, 0.6, 0.06), mat("wasser", (70, 120, 140), 0.1), fase=0)
    wuerfel((-1.15, 0, 0.6), (0.3, 0.3, 1.2), STEIN2, fase=0.1)
    rohr((-1.15, 0, 1.2), (-1.15, 0, 1.6), 0.07, EISEN, 8); rohr((-1.15, 0, 1.55), (-0.5, 0, 1.75), 0.03, EISEN, 6)   # Schwengel
    rohr((-1.0, 0, 1.1), (-0.6, 0, 0.95), 0.04, EISEN, 6); kugel((-0.55, 0, 0.92), 0.05, EISEN, n=8)
    moos((0.6, -0.4, 0.72), 0.3, 3); moos((0, 0.45, 0.05), 0.6, 4)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices)
for v in o.data.vertices: v.co.z -= lo
os.makedirs(os.path.dirname(os.path.abspath(ZIEL)), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Wegrand:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
