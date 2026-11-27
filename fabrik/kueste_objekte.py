"""Mythara Fabrik – Objekte der Smaragdküste und von Kielmund (Phase 10) in Blender bauen (glb, Maßstab 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/kueste_objekte.py -- <art> <ziel.glb>

kutsche          – Reisekutsche Weidenhain ↔ Kielmund: grüner Kasten mit Tür und Wappen des Küstenhauses (Welle unter Stern), vier Speichenräder,
                   Kutschbock, Laterne, Deichsel nach -y (≈ 4,2 m lang ohne Pferde)
linse            – Linse des Leuchtfeuers: gestufte Glasringe in einem Messinggestell auf Drehteller (≈ 1,5 m), klar und leicht leuchtend
linse_trueb      – dieselbe Linse verschmutzt und trüb (vor dem Polieren, G2)
raeucherhuette   – Räucherhütte der Möwenbucht: Bretterhütte mit Satteldach, Rauchloch, Tür, außen Gestell mit hängenden Heringen
netze            – zwei Pfähle mit aufgehängtem Fischernetz und Korkschwimmern, dazu ein Netzhaufen am Boden
wrackkiste       – Kiste aus dem Wrack: nasses dunkles Holz, Eisenbänder, Seepocken, schwarzes Wachssiegel mit Rabe (G3); auch Rucksackbild
dreispitz        – Dreispitz des Wrackkapitäns (Kopfteil, art "kopf"): schwarzer Filz, goldene Tresse am Rand, Spitze vorn (-y)
laterne          – Handlaterne (Werkzeug für die Leuchtturmwärterin): Knauf oben (+z), Ring zum Halten, Glas mit Flamme
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
HOLZ = mat("holz", (128, 92, 58), 0.85); HOLZ2 = mat("holz_dunkel", (84, 60, 40), 0.85); NASS = mat("holz_nass", (62, 50, 40), 0.55)
EIS = mat("eisen", (96, 96, 102), 0.45, 0.6); MESS = mat("messing", (200, 156, 72), 0.3, 0.9); GRUEN = mat("kutschgruen", (38, 96, 78), 0.5); GOLD = mat("gold", (214, 176, 80), 0.3, 0.9)
GLAS = mat("linsenglas", (200, 236, 240), 0.05, 0, 0.6); FLAMME = mat("flamme", (255, 190, 80), 0.3, 0, 4.0); ROT = mat("rot", (150, 40, 34), 0.6)
def rad(ort, r, m=HOLZ2, n=10, achse="x"):
    rot = (0, math.radians(90), 0) if achse == "x" else (math.radians(90), 0, 0)
    ring(ort, r, r * 0.08, m, rot, seg=(28, 6)); ring(ort, r * 0.98, r * 0.03, EIS, rot, seg=(28, 4))
    for k in range(n):
        a = 2 * math.pi * k / n; p = Vector(ort) + Vector((0, r * math.cos(a), r * math.sin(a))); rohr(ort, tuple(p), r * 0.035, m, 6)
    kugel(ort, r * 0.14, EIS)
if ART == "kutsche":
    for y in (-1.0, 1.0):
        for sx in (-1, 1): rad((sx * 0.85, y, 0.55 if y > 0 else 0.45), 0.55 if y > 0 else 0.45)
        rohr((-0.9, y, 0.55 if y > 0 else 0.45), (0.9, y, 0.55 if y > 0 else 0.45), 0.04, EIS, 8)
    wuerfel((0, 0.25, 1.0), (1.3, 1.9, 0.12), HOLZ2, fase=0.1)                                             # Boden
    wuerfel((0, 0.45, 1.65), (1.3, 1.5, 1.2), GRUEN, fase=0.06)                                            # Kasten
    wuerfel((0, 0.45, 2.3), (1.42, 1.62, 0.1), HOLZ2, fase=0.2); wuerfel((0, 0.45, 2.38), (1.2, 1.4, 0.08), GRUEN, fase=0.2)   # Dach
    for sx in (-1, 1):
        wuerfel((sx * 0.655, 0.45, 1.75), (0.02, 0.55, 0.45), mat("fenster", (40, 52, 60), 0.15), fase=0)   # Fenster
        wuerfel((sx * 0.66, 0.45, 1.72), (0.03, 0.62, 0.52), GOLD, fase=0).scale = (0.03, 0.62, 0.04)        # Fensterleiste
        kugel((sx * 0.665, 0.45, 1.32), 0.09, GOLD, (0.2, 1, 1)); kristall((sx * 0.68, 0.45, 1.36), 0.035, 0.07, mat("stern", (240, 226, 170), 0.3, 0.6), (0, sx * math.radians(90), 0))   # Wappen
        ring((sx * 0.67, 0.45, 1.27), 0.05, 0.008, mat("welle", (90, 170, 190), 0.3), (0, math.radians(90), 0), (1, 1, 0.4))
    wuerfel((0, -0.65, 1.55), (1.2, 0.5, 0.12), HOLZ2, fase=0.1); wuerfel((0, -0.45, 1.75), (1.2, 0.1, 0.35), HOLZ2, fase=0.1)   # Kutschbock
    wuerfel((0, -0.62, 1.63), (1.1, 0.45, 0.05), ROT, fase=0.3)
    for sx in (-1, 1): rohr((sx * 0.4, -0.9, 0.8), (sx * 0.35, -2.4, 0.75), 0.04, HOLZ, 8)                 # Deichsel
    rohr((-0.4, -2.3, 0.75), (0.4, -2.3, 0.75), 0.04, HOLZ, 8)
    rohr((0.7, -0.5, 1.6), (0.7, -0.5, 2.05), 0.015, EIS, 6); wuerfel((0.7, -0.5, 2.12), (0.12, 0.12, 0.16), mat("laternenglas", (255, 220, 150), 0.2, 0, 1.2), fase=0.1)
    wuerfel((0, 1.3, 1.25), (1.2, 0.35, 0.5), HOLZ, fase=0.1)                                              # Gepäckkasten hinten
elif ART in ("linse", "linse_trueb"):
    G = GLAS if ART == "linse" else mat("glas_trueb", (150, 140, 110), 0.8)
    dreh([(0, 0), (0.5, 0), (0.5, 0.12), (0.42, 0.16), (0, 0.16)], HOLZ2, 16)
    rohr((0, 0, 0.16), (0, 0, 0.3), 0.12, MESS, 12); ring((0, 0, 0.3), 0.36, 0.03, MESS)
    for k in range(9):                                                                                     # gestufte Glasringe (Fresnel-Linse) als Tonne
        z = 0.38 + k * 0.1; r = 0.42 - 0.12 * abs(k - 4) / 4
        ring((0, 0, z), r, 0.05, G, sk=(1, 1, 0.9), seg=(32, 8))
    dreh([(0, 0.38), (0.24, 0.38), (0.24, 1.22), (0, 1.22)], mat("kern", (255, 230, 170), 0.2, 0, 2.0) if ART == "linse" else mat("kern_dunkel", (70, 60, 50), 0.8), 16)
    for k in range(6): a = k * math.pi / 3; rohr((0.46 * math.cos(a), 0.46 * math.sin(a), 0.3), (0.46 * math.cos(a), 0.46 * math.sin(a), 1.3), 0.02, MESS, 6)
    ring((0, 0, 1.3), 0.46, 0.03, MESS); dreh([(0, 1.3), (0.4, 1.3), (0.1, 1.45), (0, 1.48)], MESS, 16); kugel((0, 0, 1.5), 0.05, MESS)
    if ART == "linse_trueb":
        for k in range(14): a = random.uniform(0, 6.28); kugel((0.44 * math.cos(a), 0.44 * math.sin(a), random.uniform(0.4, 1.2)), random.uniform(0.04, 0.09), mat("schmutz", (90, 80, 60), 0.95), (0.3, 1, 1)).rotation_euler = (0, 0, a)
elif ART == "raeucherhuette":
    wuerfel((0, 0, 0.1), (2.4, 2.0, 0.2), mat("stein", (120, 116, 108), 0.9), fase=0.1)
    for k in range(10):                                                                                    # Bretterwände
        x = -1.1 + k * 0.245
        for sy in (-1, 1): wuerfel((x, sy * 0.9, 1.1), (0.23, 0.06, 1.8), HOLZ if k % 2 else HOLZ2, fase=0.1)
    for sx in (-1, 1): wuerfel((sx * 1.15, 0, 1.1), (0.06, 1.8, 1.8), HOLZ2, fase=0.05)
    wuerfel((0, -0.94, 0.85), (0.7, 0.04, 1.3), NASS, fase=0.05); kugel((0.25, -0.97, 0.85), 0.03, EIS)  # Tür
    for sx in (-1, 1):
        o = wuerfel((sx * 0.62, 0, 2.35), (1.45, 2.3, 0.08), mat("dach", (70, 62, 56), 0.9), (0, sx * math.radians(32), 0), 0.05)
        o.location.y = 0
    for sy in (-1, 1):                                                                                     # Giebeldreiecke vorn und hinten
        y0, y1 = sy * 0.87, sy * 0.93; vs = [(-1.18, y0, 2.0), (1.18, y0, 2.0), (0, y0, 2.74), (-1.18, y1, 2.0), (1.18, y1, 2.0), (0, y1, 2.74)]
        me = bpy.data.meshes.new("giebel"); me.from_pydata(vs, [], [(0, 1, 2), (3, 5, 4), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]); me.update()
        g_ = bpy.data.objects.new("giebel", me); bpy.context.collection.objects.link(g_); me.materials.append(HOLZ2)
    wuerfel((0, 0, 2.62), (0.5, 0.5, 0.35), HOLZ2, fase=0.1); wuerfel((0, 0, 2.82), (0.6, 0.6, 0.06), mat("dach", (70, 62, 56)), fase=0.1)   # Rauchabzug
    for sy in (-0.6, 0.6): rohr((1.25, sy, 0), (1.25, sy, 1.6), 0.04, HOLZ2, 6)
    rohr((1.25, -0.7, 1.55), (1.25, 0.7, 1.55), 0.03, HOLZ2, 6)
    for k in range(6):                                                                                     # Heringe am Gestell
        y = -0.5 + k * 0.2; rohr((1.25, y, 1.55), (1.25, y, 1.45), 0.004, mat("schnur", (160, 130, 90), 0.9), 4)
        kugel((1.25, y, 1.28), 0.12, mat("raeucherfisch", (150, 98, 46), 0.5), (0.25, 0.12, 1))
elif ART == "netze":
    for x in (-1.3, 1.3): rohr((x, 0, 0), (x, 0, 2.0), 0.06, HOLZ2, 8)
    rohr((-1.3, 0, 1.95), (1.3, 0, 1.95), 0.025, mat("seil", (170, 140, 96), 0.9), 6)
    NETZ = mat("netz", (110, 120, 96), 0.9)
    def bogen(x, z): return 0.12 * math.sin(math.pi * (x + 1.25) / 2.5) * (1.95 - z) / 1.5
    for k in range(13):                                                                                    # Netz durchhängend
        x = -1.2 + k * 0.2; rohr((x, 0, 1.95), (x * 0.96, bogen(x, 0.45), 0.45), 0.006, NETZ, 4)
    for k in range(9):
        z = 1.85 - k * 0.17; pts = [(x, bogen(x, z), z - 0.08 * math.sin(math.pi * (x + 1.2) / 2.4)) for x in [-1.2 + i * 0.2 for i in range(13)]]
        for a, b in zip(pts, pts[1:]): rohr(a, b, 0.006, NETZ, 4)
    for k in range(7): kugel((-1.1 + k * 0.37, 0.0, 1.88), 0.05, mat("kork", (200, 150, 90), 0.8), (1.4, 1, 0.8))
    for k in range(10): kugel((random.uniform(-0.6, 0.6) + 0.4, random.uniform(0.4, 0.9), 0.06), random.uniform(0.14, 0.25), NETZ, (1.3, 1, 0.45))   # Netzhaufen
    for k in range(4): kugel((random.uniform(0, 0.9), random.uniform(0.4, 0.9), 0.18), 0.05, mat("kork", (200, 150, 90)), (1.4, 1, 0.8))
elif ART == "wrackkiste":
    wuerfel((0, 0, 0.3), (0.9, 0.6, 0.6), NASS, fase=0.05)
    for k in range(4): wuerfel((0, -0.302, 0.08 + k * 0.15), (0.88, 0.01, 0.012), mat("fuge", (40, 32, 26), 0.9), fase=0)   # Brettfugen
    for x in (-0.36, 0.36): wuerfel((x, 0, 0.3), (0.06, 0.62, 0.62), EIS, fase=0.1)                        # Eisenbänder
    wuerfel((0, 0, 0.6), (0.92, 0.62, 0.04), NASS, fase=0.1)
    for k in range(16):                                                                                    # Seepocken und Algen
        x, z = random.uniform(-0.45, 0.45), random.uniform(0.02, 0.25); kugel((x, -0.31, z), random.uniform(0.015, 0.03), mat("seepocke", (200, 196, 180), 0.9), (1, 0.5, 1))
    for k in range(5): kugel((random.uniform(-0.4, 0.4), random.uniform(-0.3, 0.3), 0.62), 0.05, mat("alge", (60, 90, 50), 0.8), (1.6, 1, 0.2))
    kugel((0, -0.31, 0.36), 0.075, mat("siegel_schwarz", (24, 22, 26), 0.35), (1, 0.25, 1))                 # Rabensiegel
    kugel((0, -0.335, 0.37), 0.025, mat("rabe_rot", (130, 28, 30), 0.4), (1, 0.4, 0.7)); kristall((-0.03, -0.335, 0.37), 0.012, 0.05, mat("rabe_rot", (130, 28, 30)), (0, math.radians(90), 0))
    for sx in (-1, 1): kristall((sx * 0.02, -0.335, 0.39), 0.012, 0.06, mat("rabe_rot", (130, 28, 30)), (math.radians(90), 0, sx * 0.9))   # Flügel
elif ART == "dreispitz":                                                                               # Hut des Wrackkapitäns: Spitze vorn (-y), Krempe an drei Seiten hochgeschlagen
    FILZ = mat("filz", (32, 30, 38), 0.8); TRESSE = mat("tresse", (196, 160, 70), 0.35, 0.8)
    def rr(t): return 0.2 + 0.055 * math.cos(3 * (t + math.pi / 2))
    N, RI = 48, 6; vs, fs = [], []
    for i in range(RI + 1):
        f = i / RI
        for j in range(N):
            t = 2 * math.pi * j / N; r = 0.1 + (rr(t) - 0.1) * f; vs.append((r * math.cos(t), r * math.sin(t), 0.11 * max(0.0, f - 0.25) ** 1.3 * (1.2 - 0.6 * math.cos(3 * (t + math.pi / 2)))))
    for i in range(RI):
        for j in range(N): a, b = i * N + j, i * N + (j + 1) % N; fs.append((a, b, b + N, a + N))
    me = bpy.data.meshes.new("krempe"); me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("krempe", me); bpy.context.collection.objects.link(o); me.materials.append(FILZ)
    o.modifiers.new("d", "SOLIDIFY").thickness = 0.01
    kugel((0, 0, 0.03), 0.11, FILZ, (1, 1, 0.75))
    rand = [Vector(vs[RI * N + j]) for j in range(N)]
    for a, b in zip(rand, rand[1:] + rand[:1]): rohr(tuple(a), tuple(b), 0.006, TRESSE, 4)
elif ART == "laterne":
    ring((0, 0, 0.3), 0.035, 0.006, EIS, (math.radians(90), 0, 0))
    dreh([(0, 0.26), (0.06, 0.24), (0.075, 0.22), (0, 0.22)], EIS, 12); dreh([(0.0, 0.0), (0.07, 0.0), (0.07, 0.025), (0.0, 0.025)], EIS, 12)
    for k in range(4): a = k * math.pi / 2 + math.pi / 4; rohr((0.065 * math.cos(a), 0.065 * math.sin(a), 0.02), (0.065 * math.cos(a), 0.065 * math.sin(a), 0.225), 0.006, EIS, 4)
    dreh([(0, 0.025), (0.06, 0.025), (0.06, 0.22), (0, 0.22)], mat("laternenglas", (255, 220, 150), 0.2, 0, 1.2), 12)
    kristall((0, 0, 0.1), 0.02, 0.07, FLAMME)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices) 
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
