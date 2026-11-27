"""Mythara Fabrik – Gegenstände für Fischen und Kochen in Blender bauen (als glb; Rucksackbilder danach mit fabrik/symbol.py).

  python3 fabrik/kueche.py -- <art> <ziel.glb>
  art: wuermer | fischsuppe | bauerneintopf | kuhfleisch | mehl | krug_wasser | kessel | krug | suppe_verbrannt | brot_verbrannt | salz | glutwels_salzkruste | raeucherhering | barsch_salzkruste | aalsuppe | hasenfleisch | wildschweinfleisch | wolfsfleisch | hasenbraten | rinderbraten | wildschweinbraten | wolfsgulasch

wuermer: Holzschälchen mit Erde und rosa Würmern · fischsuppe: Holzschale, helle Brühe, Fischstücke, Kräuter, Löffel ·
bauerneintopf: Tonschale, braune Soße, Fleisch, Möhren, Kartoffeln · kuhfleisch: rotes Stück mit Fettrand und Knochen ·
mehl: Leinensack, zugebunden, Mehl obenauf und daneben · krug_wasser: Tonkrug mit Henkel, Wasser oben · kessel: eiserner Kessel mit Bügel.
Phase 9: salz (offener Beutel Salz mit Kristallen) · glutwels_salzkruste (Glutwels in aufgebrochener Salzkruste auf dem Tonteller).
Süden (#121): hasenfleisch · wildschweinfleisch · wolfsfleisch (Form des Kuhfleischs) · hasenbraten · rinderbraten · wildschweinbraten (auf dem Tonteller) · wolfsgulasch (Schale des Bauerneintopfs)
Phase 10: raeucherhering (zwei Räucherheringe auf dem Brett) · barsch_salzkruste (Klippenbarsch in Salzkruste) · aalsuppe (Holzschale mit Aalstücken).
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
def ring(ort, r, d, m, rot=(0, 0, 0), sk=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=d, location=ort, rotation=rot, major_segments=28, minor_segments=6); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); return glatt(o)
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
elif ART in ("fischsuppe", "bauerneintopf", "wolfsgulasch"):
    if ART == "fischsuppe": inh = schale(mat("holz", (140, 95, 58), 0.8), mat("bruehe", (225, 195, 120), 0.25))
    elif ART == "wolfsgulasch": inh = schale(mat("holz_dunkel", (100, 66, 40), 0.8), mat("gulaschsosse", (110, 34, 20), 0.35))      # Süden #121: dunkle Paprikasoße, Holzschale
    else: inh = schale(mat("ton", (160, 90, 55), 0.7), mat("sosse", (120, 62, 30), 0.35))
    z = 0.042
    if ART == "fischsuppe":
        for i in range(5): wuerfel((random.uniform(-.045, .045), random.uniform(-.045, .045), z), 0.022, mat("fisch", (245, 232, 215), 0.5), (random.random(), random.random(), random.random()))
        for i in range(8): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), z + 0.004), 0.006, mat("kraut", (60, 130, 40), 0.6), (1.6, 0.7, 0.3), 6)
        rohr([(0.03, 0.0, z), (0.09, 0.02, 0.07), (0.15, 0.04, 0.1)], 0.005, mat("holz", (140, 95, 58)))
        kugel((0.03, 0.0, z + 0.003), 0.017, mat("holz", (140, 95, 58)), (1.2, 0.9, 0.35), 10)
    else:
        for i in range(4 if ART == "bauerneintopf" else 7): wuerfel((random.uniform(-.045, .045), random.uniform(-.045, .045), z + 0.004), 0.024, mat("fleisch", (110, 50, 30), 0.55) if ART == "bauerneintopf" else mat("wolfsfleisch_gar", (80, 34, 24), 0.55), (random.random(), random.random(), random.random()))
        for i in range(4): kugel((random.uniform(-.05, .05), random.uniform(-.05, .05), z + 0.004), 0.011, mat("moehre", (225, 120, 35), 0.5), (1.6, 0.9, 0.9), 8)
        for i in range(4): kugel((random.uniform(-.05, .05), random.uniform(-.05, .05), z + 0.004), 0.014, mat("kartoffel", (225, 200, 130), 0.6), (1, 1, 0.8), 10)
        for i in range(6): kugel((random.uniform(-.06, .06), random.uniform(-.06, .06), z + 0.006), 0.005, mat("kraut", (60, 130, 40), 0.6), (1.6, 0.7, 0.3), 6)
elif ART in ("hasenfleisch", "wildschweinfleisch", "wolfsfleisch"):                               # Süden #121: Form des Kuhfleischs, je Tier eigene Größe und Farbe
    G_, FL, FE_, KN_ = {"hasenfleisch": (0.7, (214, 118, 108), (240, 220, 205), True), "wildschweinfleisch": (1.05, (140, 38, 34), (230, 214, 196), False),
                        "wolfsfleisch": (0.95, (118, 36, 34), (205, 190, 180), True)}[ART]
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.07 * G_, depth=0.04 * G_, location=(0, 0, 0.02 * G_)); o = glatt(bpy.context.object); o.scale = (1.35, 1.0, 1); o.data.materials.append(mat("fleisch_" + ART, FL, 0.45))
    for v in o.data.vertices: v.co.x += 0.008 * G_ * math.sin(v.co.y * 60); v.co.y += 0.006 * G_ * math.sin(v.co.x * 50)
    if ART == "wildschweinfleisch":                                                                        # Schwarte mit Borsten
        dreh("schwarte", [(0.071 * G_, 0.0), (0.082 * G_, 0.006), (0.082 * G_, 0.036 * G_), (0.071 * G_, 0.042 * G_)], mat("schwarte", (70, 50, 40), 0.9)).scale = (1.35, 1, 1)
        for i in range(30): a = random.uniform(0, 6.3); rohr([(0.083 * G_ * 1.35 * math.cos(a), 0.083 * G_ * math.sin(a), 0.03 * G_), (0.09 * G_ * 1.35 * math.cos(a), 0.09 * G_ * math.sin(a), 0.038 * G_)], 0.0015, mat("borste", (30, 24, 20), 0.9), 4)
    else: dreh("fett", [(0.071 * G_, 0.0), (0.075 * G_, 0.004), (0.075 * G_, 0.036 * G_), (0.071 * G_, 0.04 * G_)], mat("fett_" + ART, FE_, 0.5)).scale = (1.35, 1, 1)
    for i in range(6 if ART == "wolfsfleisch" else 12):                                                     # Marmorierung (Wolf mager)
        a = random.uniform(0, 6.3); r = random.uniform(0.01, 0.055) * G_
        o = kugel((r * 1.3 * math.cos(a), r * math.sin(a), 0.04 * G_), 0.004, mat("fett_" + ART, FE_), (random.uniform(1.5, 3), 0.7, 0.15), 8); o.rotation_euler.z = random.uniform(0, 3.14)
    if KN_:
        rohr([(-0.11 * G_, 0.0, 0.02 * G_), (-0.08 * G_, 0.0, 0.02 * G_), (-0.05 * G_, 0.0, 0.02 * G_)], 0.011 * G_, mat("knochen", (240, 230, 205), 0.5)); kugel((-0.11 * G_, 0, 0.02 * G_), 0.018 * G_, mat("knochen", (240, 230, 205)), (1, 1.2, 1), 10)
elif ART in ("hasenbraten", "rinderbraten", "wildschweinbraten"):                                   # Süden #121: Braten auf dem flachen Tonteller (wie Barsch in Salzkruste)
    TON_ = mat("tonteller", (120, 62, 36), 0.75); KRUSTE_ = mat("bratenkruste", (128, 66, 30), 0.45); INNEN = mat("bratenfleisch", (196, 110, 96), 0.55)
    SOSSE = mat("bratensosse", (90, 46, 22), 0.25); MOE = mat("moehre", (225, 120, 35), 0.5); KART = mat("kartoffel", (225, 200, 130), 0.6); KR = mat("kraut", (60, 130, 40), 0.6)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.15, depth=0.012, location=(0, 0, 0.006)); t = bpy.context.object; t.data.materials.append(TON_)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.15, minor_radius=0.008, location=(0, 0, 0.013), major_segments=48, minor_segments=8); glatt(bpy.context.object).data.materials.append(TON_)
    kugel((0.02, 0.0, 0.013), 0.09, SOSSE, (1.2, 0.9, 0.05), 20)
    if ART == "hasenbraten":                                                                               # zwei gebratene Keulen
        for k, (x, y, a) in enumerate(((-0.02, -0.03, 0.4), (0.03, 0.035, -0.3))):
            o = kugel((x, y, 0.035), 0.035, KRUSTE_, (1.6, 1.0, 0.8), 14); o.rotation_euler.z = a
            rohr([(x - 0.05 * math.cos(a), y - 0.05 * math.sin(a), 0.03), (x - 0.085 * math.cos(a), y - 0.085 * math.sin(a), 0.03)], 0.008, mat("knochen", (240, 230, 205), 0.5))
        for k in range(3): kugel((0.08, -0.06 + 0.04 * k, 0.022), 0.012, MOE, (1.8, 0.8, 0.8), 8).rotation_euler.z = 0.5
    elif ART == "rinderbraten":                                                                            # aufgefächerte Scheiben: braune Kruste, rosa Kern
        for k in range(4):
            x = -0.06 + k * 0.03
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.045, depth=0.012, location=(x, 0.0, 0.03 + 0.004 * k), rotation=(0, math.radians(70), 0)); o = bpy.context.object; o.scale = (1, 1.3, 1); o.data.materials.append(INNEN)
            ring((x, 0.0, 0.03 + 0.004 * k), 0.045, 0.006, KRUSTE_, (0, math.radians(70), 0), (1, 1.3, 1))
        for x, y in ((0.08, 0.05), (0.09, -0.04), (0.06, 0.08)): kugel((x, y, 0.028), 0.018, KART, (1, 1, 0.85), 10)
    else:                                                                                                  # Wildschweinbraten: Rollbraten mit Kruste (Rautenmuster), Apfel
        o = dreh("braten", [(0, 0), (0.05, 0), (0.055, 0.04), (0.05, 0.075), (0, 0.08)], KRUSTE_, 24); o.scale = (1.5, 1, 0.8); o.location = (-0.01, 0, 0.012)
        for k in range(5): ring((-0.01 - 0.06 + 0.03 * k, 0, 0.045), 0.052, 0.004, mat("garn", (230, 220, 200), 0.8), (0, math.radians(90), 0), (1, 1, 0.8))
        kugel((0.09, -0.06, 0.035), 0.025, mat("apfel_rot", (190, 40, 30), 0.4), (1, 1, 0.9), 14); rohr([(0.09, -0.06, 0.058), (0.092, -0.058, 0.07)], 0.002, mat("stiel", (90, 60, 30), 0.8))
        for x, y in ((0.08, 0.06), (0.1, 0.02)): kugel((x, y, 0.028), 0.018, KART, (1, 1, 0.85), 10)
    for k in range(5): kugel((random.uniform(-.1, .1), random.uniform(-.1, .1), 0.022), 0.006, KR, (1.6, 0.7, 0.3), 6)
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
elif ART == "salz":                                                                              # Phase 9: Salz aus der Salzpfanne – offener Beutel, Salz obenauf und daneben, ein paar Kristalle
    SACK = mat("leinen_salz", (196, 172, 130), 0.95); SALZ = mat("salz", (246, 244, 238), 0.55); KR = mat("salzkristall", (235, 238, 242), 0.15)
    o = dreh("beutel", [(0.0, 0.0), (0.06, 0.0), (0.078, 0.025), (0.082, 0.07), (0.075, 0.1), (0.082, 0.11), (0.07, 0.112), (0.0, 0.112)], SACK, 32)
    for v in o.data.vertices: v.co += Vector((0.004 * math.sin(v.co.z * 70 + v.co.x * 40), 0.004 * math.cos(v.co.z * 60), 0))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.079, minor_radius=0.007, location=(0, 0, 0.106)); bpy.context.object.data.materials.append(SACK)   # umgeschlagener Rand
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.072, radius2=0.01, depth=0.05, location=(0, 0, 0.13)); o = glatt(bpy.context.object); o.data.materials.append(SALZ)   # Salzberg im Beutel
    for v in o.data.vertices: v.co.z += 0.003 * math.sin(v.co.x * 160) * math.cos(v.co.y * 140)
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=0.04, radius2=0.004, depth=0.022, location=(0.1, -0.05, 0.011)); glatt(bpy.context.object).data.materials.append(SALZ)
    for k in range(7):
        bpy.ops.mesh.primitive_cube_add(size=random.uniform(0.01, 0.016), location=(random.uniform(0.05, 0.14), random.uniform(-0.1, 0.0), 0.006), rotation=(random.uniform(0, 1), random.uniform(0, 1), random.uniform(0, 3)))
        bpy.context.object.data.materials.append(KR)
elif ART in ("glutwels_salzkruste", "barsch_salzkruste"):                                                              # Phase 9: Glutwels in Salzkruste – auf dem Tonteller, Kruste aufgebrochen, Kopf und Schwanz schauen heraus
    TON = mat("tonteller", (120, 62, 36), 0.75); KRUSTE = mat("salzkruste", (252, 248, 236), 0.7); BRAUN = mat("kruste_braun", (214, 162, 96), 0.8)
    FISCH = mat("fisch_gegart", (196, 92, 40) if ART == "glutwels_salzkruste" else (214, 110, 70), 0.5); FLEISCH = mat("fischfleisch", (250, 226, 200), 0.6); KRAUT = mat("kraut", (70, 120, 50), 0.7); RISS = mat("riss", (120, 100, 80), 0.9)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.2, depth=0.014, location=(0, 0, 0.007)); t = bpy.context.object; t.scale = (1.1, 0.72, 1); t.data.materials.append(TON)   # flacher Tonteller
    bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.009, location=(0, 0, 0.016), major_segments=48, minor_segments=8); t = glatt(bpy.context.object); t.scale = (1.1, 0.72, 1); t.data.materials.append(TON)
    k = kugel((0, 0, 0.03), 0.07, KRUSTE, (2.6, 0.95, 0.62), 24)
    for v in k.data.vertices: v.co += Vector((0, 0, 0.004 * math.sin(v.co.x * 55) * math.cos(v.co.y * 70)))
    kugel((0.02, 0.0, 0.07), 0.05, BRAUN, (2.0, 0.7, 0.12), 16)                                  # angebräunte Oberseite
    for a, x in ((0.4, -0.06), (-0.5, 0.02), (0.3, 0.09)): kugel((x, 0.0, 0.074), 0.04, RISS, (0.08, 1.2, 0.06), 8).rotation_euler = (0, 0, a)
    kugel((0.05, -0.045, 0.06), 0.035, FLEISCH, (1.3, 0.8, 0.5), 14)                            # aufgebrochen: helles Fischfleisch
    for x, y, r in ((0.11, -0.08, 0.02), (0.13, -0.05, 0.016), (0.08, -0.1, 0.013)): wuerfel((x, y, 0.03), r, KRUSTE, (0.4, 0.7, x * 10))   # Krustenbrocken
    kugel((-0.2, 0, 0.045), 0.04, FISCH, (1.4, 0.85, 0.8), 14)                                    # Kopf
    for sy in (1, -1): kugel((-0.225, sy * 0.026, 0.06), 0.008, mat("auge_gegart", (240, 235, 220), 0.2), (1, 1, 1), 8)
    if ART == "glutwels_salzkruste":
        for sy in (1, -1): rohr([(-0.235, sy * 0.012, 0.035), (-0.26, sy * 0.04, 0.03), (-0.27, sy * 0.06, 0.025)], 0.0025, FISCH)   # Barteln (nur der Wels)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.055, radius2=0.0, depth=0.07, location=(0.21, 0, 0.05), rotation=(0, math.radians(-90), 0)); o = bpy.context.object; o.scale = (1, 1, 0.2); o.data.materials.append(FISCH)   # Schwanz
    for x, y in ((-0.1, 0.07), (-0.05, 0.08), (0.13, 0.07), (0.16, -0.06)): kugel((x, y, 0.03), 0.011, KRAUT, (1.6, 0.8, 0.4), 8).rotation_euler = (0, 0, x * 9)
    for k_ in range(10): kugel((random.uniform(-.2, .2), random.uniform(-.12, .12), 0.028), 0.004, mat("salz", (246, 244, 238), 0.55), (1, 1, 0.7), 6)
elif ART == "raeucherhering":                                                                     # Phase 10: zwei Räucherheringe an der Schnur über einem Holzbrett
    BRETT = mat("brett", (150, 110, 70), 0.85); RAUCH = mat("raeucherhaut", (176, 112, 44), 0.35); GOLD_ = mat("raeuchergold", (214, 150, 60), 0.3); SCHN = mat("schnur", (170, 140, 96), 0.9)
    wuerfel((0, 0, 0.01), 0.02, BRETT).scale = (14, 8, 1)
    for k, y in enumerate((-0.04, 0.045)):
        f = kugel((0.0, y, 0.04), 0.03, RAUCH, (4.2, 1.0, 0.9), 20)
        kugel((0.03, y - 0.012 * (1 if k == 0 else -1), 0.05), 0.018, GOLD_, (3.0, 0.4, 0.7), 12)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.03, radius2=0.0, depth=0.04, location=(0.14, y, 0.04), rotation=(0, math.radians(-90), 0)); o = bpy.context.object; o.scale = (1, 1, 0.25); o.data.materials.append(RAUCH)
        kugel((-0.115, y, 0.045), 0.007, mat("auge_gegart", (240, 235, 220), 0.2))
    rohr([(0.12, -0.04, 0.045), (0.14, 0.0, 0.07), (0.12, 0.045, 0.045)], 0.003, SCHN)
elif ART == "aalsuppe":                                                                          # Phase 10: Aalsuppe – Holzschale, grünliche Brühe, Aalstücke, Kräuter, Löffel
    inh = schale(mat("holz", (140, 95, 58), 0.8), mat("aalbruehe", (196, 186, 120), 0.25))
    for x, y in ((-0.03, 0.02), (0.025, -0.02), (0.02, 0.035), (-0.035, -0.03)):
        o = dreh("aalstueck", [(0, 0), (0.016, 0), (0.016, 0.012), (0, 0.012)], mat("aalhaut", (60, 64, 52), 0.4), 16); o.location = (x, y, 0.036); o.rotation_euler = (math.radians(90), 0, x * 20)
        kugel((x, y, 0.043), 0.012, mat("aalfleisch", (240, 228, 210), 0.5), (1, 1, 0.3), 10)
    for k in range(6): kugel((random.uniform(-.05, .05), random.uniform(-.05, .05), 0.041), 0.006, mat("kraut", (70, 120, 50), 0.7), (1.5, 0.8, 0.3), 6)
    rohr([(0.05, 0.0, 0.04), (0.09, 0.02, 0.06), (0.14, 0.03, 0.075)], 0.005, mat("holzloeffel", (176, 130, 80), 0.7))
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
