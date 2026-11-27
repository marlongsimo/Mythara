"""Mythara Fabrik – Objekte der Hochlande (Phase 11, #148) in Blender bauen (glb, Maßstab 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/hochland_objekte.py -- <art> <ziel.glb>

Bergwerk: stolleneingang (Felsportal mit Grubenholz-Rahmen, dunkler Schacht, Laterne) · lore (Grubenwagen mit Erz auf vier Rädern) ·
          schienen (gerades Gleisstück 3 m mit Schwellen) · grubenholz (Stapel Stempel und Kappen)
Alm:      kaeserad (Käserad auf einem Brett, ein Stück angeschnitten; Deko, auch als Rucksackbild für einen Käselaib)
Pass:     steinbruecke (Bogenbrücke aus Steinblöcken, 7 m, Nord–Süd) · steinbruecke_ow (dieselbe, Bogen 6,6 m, West–Ost – Brücke zur Furt) · pass_schranke (Schlagbaum mit Gegengewicht und Pfosten, rot-weiß) ·
          gipfelkreuz (Holzkreuz auf Steinsockel) · steinmann (aufgeschichtete Steine)
Brücke (Baukasten West–Ost, #153): bruecke_mitte_ow (6,6 m, ebene Fahrbahn auf 1,4 m, 3 m breit, Mittelpfeiler mit Eisbrechern, je ein halber Bogen –
          Scheitel an den Stoßkanten, nahtlos aneinander) · bruecke_kopf_w / bruecke_kopf_o (Rampe vom Ufer auf die Fahrbahn, Torpfosten; West mit Laternen)
Teil:     eiskrone (Krone der Frostwitwe, art "kopf") · grubenhelm (Lederkappe mit Messinglampe vorn – Kopfteil der Bergleute, art "kopf", Rand bei z = 0)
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
HOLZ = mat("holz", (128, 92, 58), 0.85); HOLZ2 = mat("holz_dunkel", (84, 60, 40), 0.85); EIS = mat("eisen", (96, 96, 102), 0.45, 0.6)
STEIN = mat("stein", (138, 134, 126), 0.9); STEIN2 = mat("stein_dunkel", (104, 100, 94), 0.9); MESS = mat("messing", (200, 156, 72), 0.3, 0.9)
LICHT = mat("lampenlicht", (255, 210, 130), 0.2, 0, 2.5); ERZ = mat("erz", (90, 80, 72), 0.8); ERZ2 = mat("erz_glanz", (170, 110, 70), 0.4, 0.6)
random.seed(4)
def felsblock(ort, gr, m=STEIN, rot=(0, 0, 0)):
    o = wuerfel(ort, gr, m, rot, 0.25)
    return o
if ART == "stolleneingang":
    for k in range(14):                                                                              # Felsmassiv um den Eingang
        a = math.pi * k / 13; r = random.uniform(1.6, 2.0)
        felsblock((r * math.cos(a), 0.35 + random.uniform(-.2, .3), 0.2 + r * math.sin(a) * 0.95), (random.uniform(0.9, 1.4), random.uniform(0.8, 1.3), random.uniform(0.8, 1.2)), STEIN if k % 2 else STEIN2, (random.uniform(0, .5), random.uniform(0, .5), random.uniform(0, 1)))
    wuerfel((0, 0.55, 1.1), (2.0, 1.2, 2.2), mat("schacht", (18, 16, 14), 1.0), fase=0)          # dunkle Öffnung
    for sx in (-1, 1): wuerfel((sx * 0.95, -0.05, 1.05), (0.2, 0.2, 2.1), HOLZ2, fase=0.1)           # Grubenholz-Rahmen
    wuerfel((0, -0.05, 2.15), (2.3, 0.24, 0.22), HOLZ2, fase=0.1)
    for sx in (-1, 1): rohr((sx * 0.95, -0.1, 2.05), (sx * 0.6, -0.1, 2.12), 0.05, HOLZ2, 6)
    rohr((0.95, -0.2, 1.7), (0.95, -0.35, 1.7), 0.015, EIS, 4); wuerfel((0.95, -0.38, 1.6), (0.12, 0.12, 0.18), LICHT, fase=0.1)   # Laterne
    for x in (-0.38, 0.38): wuerfel((x, -0.6, 0.03), (0.06, 1.6, 0.06), EIS, fase=0)                  # Gleis aus dem Stollen
    for k in range(5): wuerfel((0, -1.2 + k * 0.4, 0.015), (1.0, 0.14, 0.05), HOLZ2, fase=0)
elif ART == "lore":
    wuerfel((0, 0, 0.55), (0.8, 1.2, 0.55), mat("lorenholz", (110, 80, 52), 0.85), fase=0.06)
    for sx in (-1, 1): wuerfel((sx * 0.41, 0, 0.55), (0.03, 1.22, 0.06), EIS, fase=0); wuerfel((0, sx * 0.61, 0.55), (0.82, 0.03, 0.06), EIS, fase=0)
    for k in range(12): kugel((random.uniform(-.3, .3), random.uniform(-.48, .48), 0.82 + random.uniform(0, .08)), random.uniform(0.08, 0.13), ERZ if k % 3 else ERZ2, (1, 1, 0.8), 6)
    for sx in (-1, 1):
        for sy in (-1, 1): ring((sx * 0.38, sy * 0.4, 0.17), 0.15, 0.035, EIS, (0, math.radians(90), 0), seg=(16, 6)); kugel((sx * 0.38, sy * 0.4, 0.17), 0.04, EIS)
    for sy in (-1, 1): rohr((-0.4, sy * 0.4, 0.17), (0.4, sy * 0.4, 0.17), 0.025, EIS, 6)
elif ART == "schienen":
    for x in (-0.38, 0.38): wuerfel((x, 0, 0.07), (0.06, 3.0, 0.07), EIS, fase=0)
    for k in range(8): wuerfel((0, -1.4 + k * 0.4, 0.025), (1.0, 0.14, 0.05), HOLZ2 if k % 2 else HOLZ, fase=0.05)
elif ART == "grubenholz":
    for k in range(9):
        r, c = divmod(k, 4) if k < 8 else (2, 1.5)
        rohr((-1.0, -0.3 + c * 0.2, 0.1 + r * 0.19), (1.0, -0.3 + c * 0.2 + random.uniform(-.03, .03), 0.1 + r * 0.19), 0.09, HOLZ if k % 2 else HOLZ2, 8)
    for x in (-0.9, 0.9): rohr((x, -0.45, 0), (x, -0.45, 0.6), 0.04, HOLZ2, 6); rohr((x, 0.45, 0), (x, 0.45, 0.6), 0.04, HOLZ2, 6)
elif ART == "kaeserad":
    wuerfel((0, 0, 0.02), (0.7, 0.5, 0.04), HOLZ, fase=0.1)
    K_ = mat("kaese", (232, 196, 96), 0.55); R_ = mat("kaeserinde", (196, 140, 60), 0.6)
    o = dreh([(0, 0.04), (0.22, 0.04), (0.24, 0.07), (0.24, 0.15), (0.22, 0.18), (0, 0.18)], R_, 32)
    wuerfel((0.17, -0.06, 0.11), (0.16, 0.09, 0.13), K_, (0, 0, 0.5), 0.05)                          # angeschnittene Fläche
    kugel((0.2, -0.17, 0.08), 0.035, K_, (1.6, 0.8, 0.8), 8)                                         # abgeschnittenes Stück
    for k in range(6): kugel((random.uniform(-.1, .1), random.uniform(-.1, .1), 0.181), 0.012, mat("loch", (180, 140, 60), 0.6), (1, 1, 0.2), 6)
    rohr((0.25, 0.12, 0.05), (0.38, 0.18, 0.05), 0.008, EIS, 4); wuerfel((0.42, 0.2, 0.05), (0.08, 0.03, 0.02), HOLZ2, (0, 0, 0.45), 0.1)   # Messer
elif ART in ("steinbruecke", "steinbruecke_ow"):
    SP_ = 7.0 if ART == "steinbruecke" else 6.6; ST_ = SP_ / 14                                       # Bogen aus Quadern entlang y (Nord–Süd); _ow: 6,6 m und danach um 90° gedreht (West–Ost)
    for k in range(15):
        y = -SP_ / 2 + k * ST_; z = 1.2 * math.sin(math.pi * (k + 0.5) / 15) + 0.2
        wuerfel((0, y, z), (2.4, ST_ * 0.96, 0.4), STEIN if k % 2 else STEIN2, (math.cos(math.pi * (k + 0.5) / 15) * -0.45, 0, 0), 0.1)
        for sx in (-1, 1): wuerfel((sx * 1.15, y, z + 0.35), (0.22, ST_ * 0.96, 0.35), STEIN2 if k % 2 else STEIN, (math.cos(math.pi * (k + 0.5) / 15) * -0.45, 0, 0), 0.15)   # Brüstung
    for sy in (-1, 1): wuerfel((0, sy * (SP_ / 2 + 0.1), 0.15), (2.8, 0.6, 0.3), STEIN2, fase=0.1)
    if ART == "steinbruecke_ow":
        for o_ in list(bpy.context.scene.objects): o_.location = Vector((-o_.location.y, o_.location.x, o_.location.z)); o_.rotation_mode = "XYZ"; o_.rotation_euler.rotate_axis("Z", 0) if False else None; o_.rotation_euler = (o_.rotation_euler.to_matrix().to_4x4().__rmatmul__(__import__("mathutils").Matrix.Rotation(math.radians(90), 4, "Z"))).to_euler()
elif ART in ("bruecke_mitte_ow", "bruecke_kopf_w", "bruecke_kopf_o"):                           # Baukasten Brücke zur Furt (#153): West–Ost (x), Stücke 6,6 m, nahtlos aneinander
    LS, BR_, FB, DK = 3.3, 1.5, 1.4, 0.25                                                          # halbe Länge, halbe Fahrbahnbreite, Fahrbahnhöhe (Oberkante), Deckendicke
    PFL = mat("pflaster", (122, 118, 110), 0.9)
    def bruestung(x0, x1, z0, z1):                                                                 # Brüstung beidseitig, von x0 (Höhe z0) bis x1 (Höhe z1)
        for sy in (-1, 1):
            n_ = max(1, int(round((x1 - x0) / 0.825)))
            for k in range(n_):
                xa, xb = x0 + (x1 - x0) * k / n_, x0 + (x1 - x0) * (k + 1) / n_; za, zb = z0 + (z1 - z0) * k / n_, z0 + (z1 - z0) * (k + 1) / n_
                wuerfel(((xa + xb) / 2, sy * (BR_ + 0.15), (za + zb) / 2 + 0.25), (xb - xa, 0.3, 0.5), STEIN2 if k % 2 else STEIN, (0, -math.atan2(zb - za, xb - xa), 0), 0.04)
                wuerfel(((xa + xb) / 2, sy * (BR_ + 0.15), (za + zb) / 2 + 0.53), (xb - xa, 0.38, 0.07), STEIN2, (0, -math.atan2(zb - za, xb - xa), 0), 0)   # Abdeckplatte
    if ART == "bruecke_mitte_ow":
        wuerfel((0, 0, FB - DK / 2), (2 * LS, 2 * BR_, DK), PFL, fase=0)                           # ebene Fahrbahn, bündig an den Enden
        for k in range(8): wuerfel((-LS + 0.4125 + k * 0.825, 0, FB + 0.005), (0.8, 2 * BR_ - 0.1, 0.012), STEIN if k % 2 else STEIN2, fase=0)   # Pflasterreihen
        bruestung(-LS, LS, FB, FB)
        wuerfel((0, 0, (FB - DK) / 2), (1.0, 2 * BR_ + 0.3, FB - DK), STEIN2, fase=0.04)           # Pfeiler in der Mitte
        for sy in (-1, 1):                                                                         # Eisbrecher spitz nach Norden und Süden
            bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.72, radius2=0.0, depth=1.2, location=(0, sy * (BR_ + 0.15 + 0.25), 0.55), rotation=(0, 0, math.radians(45)))
            o = bpy.context.object; o.scale = (0.7, 0.5, 1.0); o.data.materials.append(STEIN)
        # halbe Bögen links und rechts: Kämpfer am Pfeiler (|x| = 0,5) auf 0,35 m, Scheitel an der Stoßkante (|x| = 3,3) knapp unter der Fahrbahn
        R_ = 2.8; ZK = FB - DK - 0.12
        for sx in (-1, 1):
            for k in range(14):
                u0, u1 = k / 14, (k + 1) / 14; xa, xb = 0.5 + 2.8 * u0, 0.5 + 2.8 * u1
                bogen = lambda x: 0.35 + (ZK - 0.35) * math.sqrt(max(0.0, 1 - ((LS - x) / R_) ** 2))
                za = bogen((xa + xb) / 2); xm = sx * (xa + xb) / 2
                wuerfel((xm, 0, (za + FB - DK) / 2), (xb - xa + 0.01, 2 * BR_ + 0.3, max(0.02, FB - DK - za)), STEIN if k % 2 else STEIN2, fase=0)   # Zwickelmauer bis unter die Fahrbahn
                wuerfel((xm, 0, za - 0.06), (xb - xa + 0.01, 2 * BR_ + 0.36, 0.12), STEIN2, fase=0)                                            # Bogenstein
    else:                                                                                          # Brückenkopf: Rampe vom Ufer (z = 0) auf die Fahrbahn, Widerlager darunter
        aussen = -1 if ART == "bruecke_kopf_w" else 1                                              # Uferseite: West = -x, Ost = +x
        for k in range(12):
            u0, u1 = k / 12, (k + 1) / 12; xa, xb = aussen * LS * (1 - 2 * u0), aussen * LS * (1 - 2 * u1)
            za, zb = FB * u0, FB * u1; xm, zm = (xa + xb) / 2, (za + zb) / 2
            wuerfel((xm, 0, zm / 2), (abs(xb - xa) + 0.01, 2 * BR_ + 0.3, max(0.05, zm)), STEIN2 if k % 2 else STEIN, fase=0)                   # Widerlager
            wuerfel((xm, 0, zm), (abs(xb - xa) + 0.02, 2 * BR_, 0.06), PFL, (0, math.atan2(FB / 12, abs(xb - xa)) * aussen, 0), 0)             # Rampenbelag
        x_a, x_i = aussen * LS, -aussen * LS
        bruestung(min(x_a, x_i), max(x_a, x_i), 0.0 if aussen < 0 else FB, FB if aussen < 0 else 0.0)
        for sy in (-1, 1):                                                                         # Torpfosten am Ufer, im Westen mit Laternen (Wache Grauwacht)
            wuerfel((x_a - aussen * 0.3, sy * (BR_ + 0.25), 1.0), (0.6, 0.6, 2.0), STEIN2, fase=0.08); wuerfel((x_a - aussen * 0.3, sy * (BR_ + 0.25), 2.05), (0.7, 0.7, 0.12), STEIN, fase=0.1)
            if ART == "bruecke_kopf_w":
                rohr((x_a - aussen * 0.3, sy * (BR_ + 0.25), 2.1), (x_a - aussen * 0.3, sy * (BR_ + 0.25), 2.6), 0.03, EIS, 6)
                wuerfel((x_a - aussen * 0.3, sy * (BR_ + 0.25), 2.72), (0.22, 0.22, 0.28), LICHT, fase=0.15); wuerfel((x_a - aussen * 0.3, sy * (BR_ + 0.25), 2.9), (0.3, 0.3, 0.06), EIS, fase=0.2)
elif ART == "pass_schranke":
    for sx in (-1, 1): wuerfel((sx * 2.2, 0, 0.6), (0.3, 0.3, 1.2), HOLZ2, fase=0.1)
    rohr((-2.1, 0, 1.0), (2.1, 0, 1.0), 0.07, mat("weiss", (232, 228, 220), 0.6), 10)
    for k in range(5): rohr((-1.8 + k * 0.85, 0, 1.0), (-1.4 + k * 0.85, 0, 1.0), 0.075, mat("rot", (170, 40, 34), 0.6), 10)
    wuerfel((-2.5, 0, 1.0), (0.35, 0.3, 0.35), STEIN2, fase=0.2)                                     # Gegengewicht
    rohr((2.2, 0, 1.2), (2.2, 0, 1.9), 0.04, HOLZ2, 6); wuerfel((2.2, -0.05, 1.75), (0.5, 0.05, 0.35), mat("schild", (200, 180, 130), 0.8), fase=0.1)
elif ART == "gipfelkreuz":
    for k in range(8): felsblock((random.uniform(-.4, .4), random.uniform(-.4, .4), 0.15 + 0.1 * (k % 3)), (0.45, 0.4, 0.3), STEIN if k % 2 else STEIN2, (0, 0, random.uniform(0, 1)))
    wuerfel((0, 0, 1.6), (0.14, 0.14, 2.6), HOLZ2, fase=0.1); wuerfel((0, 0, 2.35), (1.2, 0.12, 0.12), HOLZ2, fase=0.1)
    kugel((0, -0.08, 2.35), 0.05, MESS)
elif ART == "steinmann":
    z = 0.0
    for k in range(7):
        r = 0.42 - k * 0.05; h = 0.16 - k * 0.01; o = kugel((random.uniform(-.03, .03), random.uniform(-.03, .03), z + h / 2), 1, STEIN if k % 2 else STEIN2, (r, r * 0.85, h / 2), 10)
        o.rotation_euler.z = random.uniform(0, 3); z += h * 0.92
elif ART == "eiskrone":                                                                              # Krone der Frostwitwe (Kopfteil, art "kopf", Rand bei z = 0): Reif mit Eiszacken, vorn die längste
    EIS_ = mat("eiskristall", (190, 230, 255), 0.1, 0, 0.8); SIL = mat("silber", (200, 206, 214), 0.25, 0.9)
    ring((0, 0, 0.012), 0.105, 0.01, SIL)
    for k in range(11):
        a = 2 * math.pi * k / 11 - math.pi / 2; l = 0.07 + 0.08 * (1 + math.cos(a + math.pi / 2)) / 2
        kristall((0.105 * math.cos(a), 0.105 * math.sin(a), 0.012 + l / 2), 0.014, l, EIS_, (0.15 * math.sin(a), -0.15 * math.cos(a), 0))
elif ART == "grubenhelm":
    LE = mat("leder_helm", (70, 52, 38), 0.7)
    dreh([(0.0, 0.13), (0.07, 0.125), (0.105, 0.09), (0.115, 0.03), (0.118, 0.0), (0.0, 0.0)], LE, 20)
    ring((0, 0, 0.01), 0.118, 0.008, LE)
    rohr((0, -0.112, 0.06), (0, -0.14, 0.06), 0.022, MESS, 10); kugel((0, -0.145, 0.06), 0.018, LICHT, (1, 0.5, 1), 8)   # Lampe vorn (-y)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices) 
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
