"""Mythara Fabrik – Objekte der Smaragdküste und von Kielmund (Phase 10) in Blender bauen (glb, Maßstab 1 = 1 m, Ursprung Mitte unten).

  <blender-python> fabrik/kueste_objekte.py -- <art> <ziel.glb>

kutsche          – Reisekutsche Weidenhain ↔ Kielmund: grüner Kasten mit Tür und Wappen des Küstenhauses (Welle unter Stern), vier Speichenräder,
                   Kutschbock, Laterne, Deichsel nach -y (≈ 4,2 m lang ohne Pferde)
linse            – Linse des Leuchtfeuers: gestufte Glasringe in einem Messinggestell auf Drehteller (≈ 1,5 m), klar und leicht leuchtend
linse_trueb      – dieselbe Linse verschmutzt und trüb (vor dem Polieren, G2)
raeucherhuette   – Räucherhütte der Möwenbucht: Bretterhütte mit Satteldach, Rauchloch, Tür, außen Gestell mit hängenden Heringen
netze            – zwei Pfähle mit aufgehängtem Fischernetz und Korkschwimmern, dazu ein Netzhaufen am Boden
wrackkiste       – Kiste aus dem Wrack: nasses dunkles Holz, Eisenbänder, Seepocken, schwarzes Wachssiegel mit Rabe (G3); auch Rucksackbild
#174 Hafen: kran (Holzkran mit Ausleger und Tretrad) · poller · taurolle · fischkisten · ruderboot (≈ 4 m) · leuchtturm (≈ 12 m, weiß-rot) ·
                   kaimauer_gerade / kaimauer_ecke (Baukasten 4 m, 2,2 m hoch; Wasser bei -y, Ecke auch bei +x)
seeschwalbe_wrack / seeschwalbe_geflickt – die Seeschwalbe (#190 Ankerholm): Rumpf des Segelschiffs mit Namensbrett am Heck;
                   Wrack: Mast abgebrochen und quer auf Deck, Segel zerrissen auf Deck, Kisten umgestürzt, Splitter, Loch im Rumpf, auf Grund (gekrängt, Ursprung Mitte unten);
                   geflickt: neuer heller Mast mit Eisenbeschlägen, Flicken im Segel, neue Planken; Ursprung auf der Wasserlinie wie das Segelschiff
segelschiff      – Einmaster für die Schiffslinien (Ausgabe 2), ≈ 12 m (+ Bugspriet), Bug nach -y; Ursprung auf der Wasserlinie (z = 0, Kiel −1,1 m),
                   ebenes Deck auf 1,3 m, Achterkastell (Deck 2,8 m) mit Steuerrad, Reling mit Gangway-Lücke mittschiffs an Steuerbord (+x)
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
elif ART == "kran":                                                                           # #174 Hafenkran: Holzbock mit Ausleger, Seil, Haken und Tretrad-Winde (≈ 6 m)
    STEIN_ = mat("stein", (138, 134, 126), 0.9); TAU = mat("tau", (176, 150, 104), 0.85)
    wuerfel((0, 0, 0.3), (2.2, 2.2, 0.6), STEIN_, fase=0.05)
    for sx in (-0.7, 0.7):
        for sy in (-0.7, 0.7): rohr((sx, sy, 0.6), (sx * 0.3, sy * 0.3, 4.2), 0.12, HOLZ2, 8)
    wuerfel((0, 0, 4.25), (0.7, 0.7, 0.3), HOLZ2, fase=0.05)
    rohr((0, 0.3, 4.3), (0, -3.6, 5.8), 0.14, HOLZ, 8); rohr((0, 0.6, 4.0), (0, 1.6, 3.2), 0.1, HOLZ, 8)   # Ausleger nach vorn (-y), Gegengewicht hinten
    wuerfel((0, 1.7, 3.0), (0.6, 0.6, 0.5), STEIN_, fase=0.1)
    rohr((0, -3.6, 5.75), (0, -3.6, 2.2), 0.025, TAU, 6); ring((0, -3.6, 2.1), 0.12, 0.03, EIS, (math.radians(90), 0, 0))
    wuerfel((0, -3.6, 1.6), (0.6, 0.6, 0.6), HOLZ, fase=0.08)                                           # Last am Haken: Kiste
    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.08, location=(1.3, 0, 1.6), rotation=(0, math.radians(90), 0), major_segments=24, minor_segments=6)
    bpy.context.object.data.materials.append(HOLZ2)
    for k in range(8): a = k * math.pi / 4; rohr((1.3, 0, 1.6), (1.3, math.cos(a), 1.6 + math.sin(a)), 0.05, HOLZ, 6)   # Tretrad
    rohr((1.0, 0, 1.6), (1.6, 0, 1.6), 0.1, HOLZ2, 8)
elif ART == "poller":                                                                          # #174 Poller am Kai: Eisen, oben verdickt, mit Tau
    dreh([(0, 0), (0.16, 0), (0.16, 0.05), (0.12, 0.1), (0.11, 0.42), (0.16, 0.5), (0.16, 0.56), (0, 0.6)], EIS, 20)
    ring((0, 0, 0.3), 0.13, 0.025, mat("tau", (176, 150, 104), 0.85), seg=(20, 6))
elif ART == "taurolle":                                                                        # #174 aufgeschossene Taurolle mit losem Ende
    TAU = mat("tau", (176, 150, 104), 0.85)
    for k in range(6): ring((0, 0, 0.035 + 0.05 * k), 0.25 - 0.012 * k, 0.03, TAU, seg=(28, 6))
    rohr((0.24, 0, 0.03), (0.6, -0.2, 0.03), 0.03, TAU, 6)
elif ART == "fischkisten":                                                                     # #174 Stapel Fischkisten mit Fisch und Eis/Salz
    FISCH = mat("fisch", (150, 168, 180), 0.35, 0.3); SALZ = mat("salz", (240, 240, 236), 0.6)
    for k, (x, y, z) in enumerate(((0, 0, 0), (0.7, 0.05, 0), (0.35, 0.02, 0.36))):
        wuerfel((x, y, z + 0.17), (0.65, 0.42, 0.34), HOLZ if k % 2 else NASS, fase=0.03)
        wuerfel((x, y, z + 0.33), (0.58, 0.35, 0.02), SALZ, fase=0)
        for j in range(4): kugel((x - 0.2 + 0.13 * j, y + random.uniform(-.08, .08), z + 0.36), 0.04, FISCH, (2.4, 0.7, 0.5), 10).rotation_euler.z = random.uniform(-.4, .4)
elif ART == "ruderboot":                                                                       # #174 angelegtes Ruderboot (≈ 4 m) mit zwei Rudern und Tau
    me = bpy.data.meshes.new("rumpf"); vs, fs = [], []; NU, NV = 16, 9
    for i in range(NU + 1):
        t = i / NU; x = (t - 0.5) * 4.0; b = 0.75 * math.sin(math.pi * t) ** 0.6; h = 0.55
        for j in range(NV + 1):
            u = j / NV; a = math.pi * u; vs.append((x, -b * math.cos(a), h - h * math.sin(a) * (0.6 + 0.4 * math.sin(math.pi * t))))
    for i in range(NU):
        for j in range(NV): a0 = i * (NV + 1) + j; fs.append((a0, a0 + NV + 1, a0 + NV + 2, a0 + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("rumpf", me); bpy.context.collection.objects.link(o); o.data.materials.append(HOLZ)
    s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.05; glatt(o)
    for x in (-0.6, 0.6): wuerfel((x, 0, 0.35), (0.3, 1.3, 0.05), HOLZ2, fase=0.1)                     # Ruderbänke
    for sy in (-1, 1): rohr((-0.2, sy * 0.4, 0.45), (0.9, sy * 0.95, 0.3), 0.03, HOLZ2, 6); wuerfel((0.95, sy * 1.0, 0.3), (0.35, 0.08, 0.02), HOLZ2, (0, 0, sy * 0.4), 0)
    rohr((2.0, 0, 0.5), (2.6, 0.2, 0.1), 0.025, mat("tau", (176, 150, 104), 0.85), 6)
elif ART == "leuchtturm":                                                                      # #174 Leuchtturm für die Mole: weiß-rot gestreift, Galerie, Laterne mit Feuer (≈ 12 m)
    WEISS = mat("putz_weiss", (232, 228, 218), 0.8); STEIN_ = mat("stein", (138, 134, 126), 0.9)
    dreh([(0, 0), (2.4, 0), (2.4, 0.8), (0, 0.8)], STEIN_, 24)
    for k in range(5):
        z0, z1 = 0.8 + k * 1.8, 0.8 + (k + 1) * 1.8; r0, r1 = 1.8 - 0.12 * k, 1.8 - 0.12 * (k + 1)
        dreh([(0, z0), (r0, z0), (r1, z1), (0, z1)], WEISS if k % 2 == 0 else ROT, 24)
    dreh([(0, 9.8), (1.6, 9.8), (1.6, 10.0), (0, 10.0)], EIS, 24)                                      # Galerie
    for k in range(16): a = k * math.pi / 8; rohr((1.5 * math.cos(a), 1.5 * math.sin(a), 10.0), (1.5 * math.cos(a), 1.5 * math.sin(a), 10.6), 0.025, EIS, 4)
    ring((0, 0, 10.6), 1.5, 0.03, EIS, seg=(32, 4))
    dreh([(0, 10.0), (0.9, 10.0), (0.9, 11.4), (0, 11.4)], mat("laternenglas", (255, 220, 150), 0.2, 0, 1.5), 16)
    kristall((0, 0, 10.6), 0.35, 0.9, FLAMME)
    dreh([(0, 11.4), (1.1, 11.4), (0.0, 12.4)], ROT, 16); kugel((0, 0, 12.45), 0.12, EIS)
    wuerfel((0, -1.75, 1.7), (0.9, 0.2, 1.7), HOLZ2, fase=0.05)                                         # Tür
elif ART in ("kaimauer_gerade", "kaimauer_ecke"):                                               # #174 Kaimauer-Baukasten: Quader am Wasser, 4 m lang, 2,2 m hoch, 1,2 m tief
    Q = mat("quader", (156, 150, 138), 0.85); Q2 = mat("quader_nass", (98, 104, 96), 0.7); ALGE = mat("alge", (60, 90, 60), 0.8)
    def mauer(u0, u1, quer):
        """Mauerstück entlang u von u0 bis u1; quer=False: entlang x (Wasser bei -y), quer=True: entlang y (Wasser bei +x)"""
        P = (lambda u, v, z: (v, u, z)) if quer else (lambda u, v, z: (u, v, z)); G = (lambda l, t, h: (t, l, h)) if quer else (lambda l, t, h: (l, t, h))
        for k in range(5):
            z = 0.22 + k * 0.44; u = u0 - 0.4 * (k % 2)
            while u < u1 - 0.05:
                l = min(0.8 + random.uniform(-0.1, 0.15), u1 - max(u, u0)); mitte = max(u, u0) + l / 2
                wuerfel(P(mitte, 0, z), G(l - 0.03, 1.2, 0.42), Q2 if k < 2 else Q, fase=0.06); u = max(u, u0) + l
        wuerfel(P((u0 + u1) / 2, 0, 2.27), G(u1 - u0, 1.3, 0.14), Q, fase=0.05)
        for k in range(6): wa = 0.62 * (1 if quer else -1); kugel(P(u0 + 0.3 + (u1 - u0 - 0.6) * k / 5, wa, 0.3 + random.uniform(0, 0.4)), 0.12, ALGE, G(1.6, 0.3, 0.8), 8)
    if ART == "kaimauer_gerade": mauer(-2.0, 2.0, False)
    else: mauer(-2.0, 0.6, False); mauer(-0.6, 2.0, True)                                       # Ecke: Kai biegt um 90° landeinwärts ab (Wasser vorn -y und rechts +x)
elif ART in ("segelschiff", "seeschwalbe_wrack", "seeschwalbe_geflickt"):                                                                    # Ausgabe 2 Schiffslinien: Einmaster ≈ 12 m, Bug nach -y, begehbares Deck (eben) auf 1,3 m über der Wasserlinie (z = 0)
    L_, B_, DECK, KIEL = 12.0, 4.0, 1.3, -1.1
    RUMPF = mat("rumpf", (110, 76, 46), 0.75); RUMPF2 = mat("rumpf_dunkel", (64, 44, 30), 0.8); DIELE = mat("deck", (176, 136, 92), 0.85); TUCH = mat("segel", (232, 222, 196), 0.9)
    BAND = mat("rumpfband", (40, 70, 110), 0.6); TAU = mat("tau", (176, 150, 104), 0.85)
    if ART != "segelschiff":                                                                   # Seeschwalbe (#190 Ankerholm): verwittertes Holz, rotes Band
        RUMPF = mat("rumpf_alt", (96, 72, 50), 0.85); BAND = mat("rumpfband_rot", (130, 40, 34), 0.7)
    me = bpy.data.meshes.new("rumpf"); vs, fs = [], []; NU, NV = 24, 12
    for i in range(NU + 1):                                                                   # Spanten von Heck (+y) bis Bug (-y): Breite rund, zum Bug spitz, Heck abgeschnitten
        t = i / NU; y = L_ / 2 - L_ * t
        b = B_ / 2 * (0.86 + 0.14 * math.sin(math.pi * t / 0.5 * 0.5) if t <= 0.5 else max(0.02, math.cos(math.pi / 2 * (t - 0.5) / 0.5)) ** 0.6)   # Heck breit, Bug spitz
        tief = KIEL * (0.55 + 0.45 * math.sin(math.pi * min(1, t * 1.1))); oben = DECK + 0.25 + 0.6 * max(0, t - 0.8) / 0.2 + 0.4 * max(0, 0.12 - t) / 0.12
        for j in range(NV + 1):
            u = j / NV; a = math.pi * u                                                         # Querschnitt: von Bordwand links über den Kiel zur rechten Bordwand
            x = -b * math.cos(a); z = oben - (oben - tief) * math.sin(a) ** 0.6
            vs.append((x, y, z))
    for i in range(NU):
        for j in range(NV): a0 = i * (NV + 1) + j; fs.append((a0, a0 + 1, a0 + NV + 2, a0 + NV + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("rumpf", me); bpy.context.collection.objects.link(o); o.data.materials.append(RUMPF)
    s_ = o.modifiers.new("d", "SOLIDIFY"); s_.thickness = 0.08; glatt(o)
    wuerfel((0, L_ / 2 - 0.05, DECK + 0.1), (B_ * 0.82, 0.12, 0.9), RUMPF2, fase=0.05)               # Heckspiegel
    wuerfel((0, 0.3, DECK), (B_ * 0.9, L_ * 0.86, 0.1), DIELE, fase=0.02)                            # Deck (eben, begehbar)
    for k in range(12): wuerfel((-B_ * 0.42 + k * B_ * 0.077, 0.3, DECK + 0.051), (0.012, L_ * 0.86, 0.005), RUMPF2, fase=0)   # Dielenfugen
    wuerfel((0, 4.2, DECK + 0.7), (3.0, 2.4, 1.4), RUMPF, fase=0.04); wuerfel((0, 4.2, DECK + 1.45), (3.2, 2.6, 0.1), DIELE, fase=0.05)   # Achterkastell
    wuerfel((0, 2.85, DECK + 0.6), (0.9, 0.08, 1.2), RUMPF2, fase=0.05)                               # Tür ins Kastell
    for sx in (-1, 1):                                                                        # Reling beidseitig, mittschiffs eine Lücke (Gangway, +x) zum Anlegen
        for k in range(15):
            y = -4.6 + k * 0.7
            if sx > 0 and -0.6 < y < 0.8: continue
            rohr((sx * B_ * 0.43, y, DECK + 0.05), (sx * B_ * 0.43, y, DECK + 0.95), 0.04, RUMPF2, 6)
        rohr((sx * B_ * 0.43, -4.6, DECK + 0.95), (sx * B_ * 0.43, -0.6 if sx > 0 else 5.2, DECK + 0.95), 0.05, RUMPF, 6)
        if sx > 0: rohr((sx * B_ * 0.43, 0.8, DECK + 0.95), (sx * B_ * 0.43, 5.2, DECK + 0.95), 0.05, RUMPF, 6)
        wuerfel((sx * (B_ / 2 - 0.02), 0.0, DECK - 0.15), (0.06, L_ * 0.8, 0.16), BAND, fase=0)       # farbiges Band außen
    WRACK, GEFLICKT = ART == "seeschwalbe_wrack", ART == "seeschwalbe_geflickt"
    if WRACK:                                                                                 # Mast auf 3,5 m abgebrochen, Oberteil liegt quer über Deck und Reling
        rohr((0, -0.8, DECK), (0, -0.8, DECK + 3.5), 0.16, RUMPF2, 10, 0.14); kristall((0, -0.8, DECK + 3.6), 0.17, 0.4, RUMPF2)
        rohr((0.2, -0.4, DECK + 0.3), (2.6, 3.2, DECK + 1.3), 0.12, RUMPF2, 10, 0.09); rohr((1.2, 1.0, DECK + 0.6), (2.9, 1.6, DECK + 1.0), 0.06, RUMPF2, 6)
    else:
        MAST = mat("mast_neu", (190, 150, 100), 0.7) if GEFLICKT else RUMPF2                      # geflickt: neuer, heller Kiefernmast
        rohr((0, -0.8, DECK), (0, -0.8, DECK + 9.5), 0.16, MAST, 10, 0.1)
        rohr((-2.0, -0.8, DECK + 8.2), (2.0, -0.8, DECK + 8.2), 0.07, MAST, 6); rohr((-2.2, -0.8, DECK + 2.4), (2.2, -0.8, DECK + 2.4), 0.08, MAST, 6)
        if GEFLICKT:
            for z in (DECK + 1.2, DECK + 4.5, DECK + 7.0): ring((0, -0.8, z), 0.15, 0.03, EIS, seg=(12, 4))   # Eisenbeschläge (aus Arvids Schmiede) um den Mast
    me = bpy.data.meshes.new("segel"); vs = []; fs = []
    for i in range(9):
        for j in range(7):
            u, v = i / 8, j / 6
            if WRACK: vs.append((0.4 + 2.0 * u, 0.2 + 2.6 * v + 0.15 * math.sin(7 * u), DECK + 0.15 + 0.35 * math.sin(math.pi * u) * math.sin(math.pi * v) + 0.9 * v * 0.3))   # Segel liegt zerknüllt auf Deck
            else: vs.append((-2.0 + 4.0 * u + 0.2 * v * (u - 0.5), -0.8 - 0.55 * math.sin(math.pi * u) * math.sin(math.pi * v) - 0.1, DECK + 2.5 + 5.6 * (1 - v)))
    for i in range(8):
        for j in range(6):
            a0 = i * 7 + j
            if WRACK and (i + j * 3) % 5 == 0: continue                                          # Risse im Segel
            fs.append((a0, a0 + 1, a0 + 8, a0 + 7))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("segel", me); bpy.context.collection.objects.link(o); o.data.materials.append(TUCH); s_ = o.modifiers.new("d", "SOLIDIFY"); s_.thickness = 0.03; glatt(o)
    rohr((0, -L_ / 2 + 0.4, DECK + 0.6), (0, -L_ / 2 - 2.2, DECK + 1.6), 0.08, RUMPF2, 6)                 # Bugspriet
    if not WRACK:
        rohr((0, -L_ / 2 - 2.1, DECK + 1.6), (0, -0.8, DECK + 9.4), 0.02, TAU, 4)                          # Stag
        for sx in (-1, 1):
            for y in (-1.6, 0.0): rohr((sx * B_ * 0.45, y, DECK + 0.3), (0, -0.8, DECK + 8.8), 0.015, TAU, 4)  # Wanten
        rohr((0, -0.8, DECK + 9.5), (0, -0.8, DECK + 10.3), 0.015, EIS, 4); wuerfel((0.3, -0.8, DECK + 10.1), (0.6, 0.02, 0.35), BAND, fase=0)   # Wimpel
    else:
        for sx in (-1, 1): rohr((sx * B_ * 0.45, -0.6, DECK + 0.3), (sx * 0.6, 0.6, DECK + 0.05), 0.015, TAU, 4)   # lose Wanten auf Deck
    if GEFLICKT:                                                                              # Flicken: helle Segelstücke, neue Planken am Rumpf
        FL = mat("segel_flicken", (214, 190, 140), 0.9); BR = mat("planke_neu", (190, 150, 100), 0.7)
        for (x, z) in ((-1.0, DECK + 6.5), (0.8, DECK + 4.2), (1.3, DECK + 7.2)): wuerfel((x, -1.42, z), (0.7, 0.03, 0.6), FL, fase=0)
        for (y, z) in ((-2.0, 0.7), (1.5, 0.3)): wuerfel((B_ / 2 - 0.02, y, z), (0.05, 1.6, 0.35), BR, fase=0.1)
    if ART != "segelschiff":                                                                  # Name am Heck
        wuerfel((0, L_ / 2 + 0.02, DECK + 0.25), (2.0, 0.03, 0.3), mat("namensbrett", (40, 34, 30), 0.8), fase=0)
        for k in range(10): wuerfel((-0.8 + k * 0.18, L_ / 2 + 0.04, DECK + 0.25), (0.09, 0.01, 0.14), mat("schrift_gold", (214, 176, 80), 0.3, 0.8), fase=0)
    if WRACK:                                                                                 # Splitter vom Sturm, Kisten umgestürzt, ein Loch im Rumpf
        GL_ = mat("splitter_blau", (90, 160, 255), 0.2, 0, 2.2)
        for k in range(6): kristall((random.uniform(-1.3, 1.3), random.uniform(-4, 3), DECK + 0.12), 0.06, random.uniform(0.15, 0.3), GL_, (random.uniform(-.5, .5), random.uniform(-.5, .5), 0))
        wuerfel((-B_ / 2 + 0.03, -1.5, 0.4), (0.06, 1.2, 0.6), mat("loch", (20, 16, 14), 0.9), fase=0.2)
    wuerfel((0, 5.6, DECK + 1.9), (0.1, 0.1, 0.9), RUMPF2, fase=0.1); rad((0, 5.6, DECK + 2.25), 0.4, RUMPF2, 8, "y")   # Steuerrad auf dem Achterdeck
    for k, (x, y) in enumerate(((-1.2, 1.6), (1.1, 1.8), (-1.3, -3.2))): wuerfel((x, y, DECK + 0.35), (0.6, 0.6, 0.6), HOLZ if k % 2 else NASS, (0.0, 0.0, 0.0) if not WRACK else (0.4 * k, 0.3, k), 0.06)   # Fracht
    for x in (-0.9, 0.9): ring((x, -3.6, DECK + 0.1), 0.3, 0.05, TAU, seg=(16, 4))
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object
if ART == "seeschwalbe_wrack":                                                                # auf Grund gelaufen: Krängung 14° nach Backbord, Bug leicht höher
    from mathutils import Matrix
    o.data.transform(Matrix.Rotation(math.radians(-20), 4, "Y") @ Matrix.Rotation(math.radians(-5), 4, "X")); o.data.update()
lo = 0.0 if ART in ("segelschiff", "seeschwalbe_geflickt") else min(v.co.z for v in o.data.vertices)   # Schiff: Ursprung bleibt auf der Wasserlinie 
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
