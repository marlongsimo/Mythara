"""Mythara Fabrik – Objekte und Gegenstände für Graufurt und das Ostufer (Phase 7) in Blender bauen (glb; Rucksackbilder mit fabrik/symbol.py).

  <blender-python> fabrik/graufurt_objekte.py -- <art> <ziel.glb>

Weltobjekte (Maßstab 1 = 1 m, Ursprung Mitte unten):
  faehre        – Fährfloß aus Planken (6 × 3 m) mit Geländer, Pollern und der Fährkette, die über zwei Rollen läuft und vorn und hinten ins Wasser hängt
  winde         – Kettenwinde am Westanleger: Holzbock mit Trommel, Kurbelrad, aufgewickelte Kette, Kette zum Wasser
  signalfeuer   – Signalfeuer-Schale auf dem Turmdach: Eisenschale auf drei Beinen, Splitterkern mit grüner Flamme
  waechterbuch  – das Wächterbuch auf einem Lesepult (Ebene 3 des Turms), aufgeschlagen, Wappen auf dem Deckel
Grauwacht und Fahle Weiten (Phase 8): glocke · glocke_gesprungen (Riss, abgesprungenes Stück) · glockenform · dornenwall · grabhuegel_eingang · grabstein
Gegenstände (klein):
  kloeppel (Glocke) ·
  kettenglied · kettenschloss (Schäkel mit Bolzen) · splitterkern_gruen (Kern mit grüner Flamme) · krebsschere · wachtstein (Steinbrocken mit Wappen) ·
  welspastete (Pastete mit Fischschwanz)
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
EIS = mat("eisen", (150, 148, 144), 0.45, 0.55); ROST = mat("rost", (110, 72, 44), 0.8, 0.3)
HOLZ = mat("holz", (124, 92, 58), 0.85); HOLZ2 = mat("holz_dunkel", (92, 66, 42), 0.85)
GRUEN = mat("gruenflamme", (50, 225, 100), 0.3, 0, 1.8); KERN = mat("gruenkern", (225, 255, 215), 0.1, 0, 5.0); KRIST = mat("kristall", (90, 200, 150), 0.1, 0, 0.8)
def kette(p0, p1, glied=0.09, dicke=0.016, m=EIS):
    """Kette aus abwechselnd gedrehten Gliedern zwischen zwei Punkten"""
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; n = max(2, int(d.length / (glied * 0.78))); q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    for i in range(n):
        o = ring(p0 + d * ((i + 0.5) / n), glied / 2, dicke, m, sk=(1, 0.62, 1), seg=(10, 5)); o.rotation_mode = "QUATERNION"
        from mathutils import Quaternion
        o.rotation_quaternion = q @ Quaternion((0, 0, 1), math.radians(90 * (i % 2))) @ Quaternion((1, 0, 0), math.radians(90))
def gruene_flamme(ort, gr=1.0):
    o = Vector(ort); kugel(o, 0.07 * gr, KERN, n=12)
    for k in range(6): kristall(o + Vector((0.05 * gr * math.cos(k), 0.05 * gr * math.sin(k), -0.02 * gr)), 0.03 * gr, 0.12 * gr, KRIST, (0.5 * math.sin(k), -0.5 * math.cos(k), 0))
    for k in range(7):
        a = k / 7 * 2 * math.pi; kristall(o + Vector((0.05 * gr * math.cos(a), 0.05 * gr * math.sin(a), 0.14 * gr)), 0.05 * gr, (0.32 - 0.06 * (k % 3)) * gr, GRUEN, (0.25 * math.sin(a), -0.25 * math.cos(a), 0))
    kristall(o + Vector((0, 0, 0.2 * gr)), 0.04 * gr, 0.34 * gr, GRUEN)

if ART == "faehre":
    for i in range(10): wuerfel((0, -1.35 + i * 0.3, 0.28), (6.0, 0.28, 0.1), HOLZ if i % 2 else HOLZ2, fase=0.15)   # Planken
    for y in (-1.3, 0, 1.3): wuerfel((0, y, 0.15), (6.2, 0.22, 0.2), HOLZ2)                                               # Querbalken
    for x in (-2.6, -0.9, 0.9, 2.6): rohr((x, -1.45, 0.0), (x, -1.45, 0.3), 0.12, HOLZ2, 10); rohr((x, 1.45, 0.0), (x, 1.45, 0.3), 0.12, HOLZ2, 10)   # Schwimmer
    for sy in (-1, 1):                                                                            # Geländer an den Langseiten
        for x in (-2.8, -1.4, 0, 1.4, 2.8): rohr((x, sy * 1.42, 0.33), (x, sy * 1.42, 1.15), 0.04, HOLZ, 8)
        rohr((-2.85, sy * 1.42, 1.12), (2.85, sy * 1.42, 1.12), 0.045, HOLZ, 8); rohr((-2.85, sy * 1.42, 0.72), (2.85, sy * 1.42, 0.72), 0.035, HOLZ, 8)
    for x in (-2.85, 2.85):                                                                       # Poller und Kettenrollen an den Stirnseiten
        rohr((x, 0, 0.33), (x, 0, 0.85), 0.12, HOLZ2, 12); ring((x, 0, 0.95), 0.13, 0.04, EIS, rot=(math.radians(90), 0, 0))
    kette((-3.6, 0, -0.05), (-2.85, 0, 0.95)); kette((-2.85, 0, 0.95), (2.85, 0, 0.95), glied=0.12); kette((2.85, 0, 0.95), (3.6, 0, -0.05))
    for k in range(3): wuerfel((random.uniform(-2, 2), random.uniform(-0.8, 0.8), 0.48), (0.5, 0.5, 0.4), HOLZ2, (0, 0, random.uniform(0, 1)))   # Fracht: Kisten
elif ART == "winde":
    for x in (-0.7, 0.7):                                                                          # A-Böcke
        rohr((x, -0.45, 0), (x, 0, 1.2), 0.07, HOLZ2, 8); rohr((x, 0.45, 0), (x, 0, 1.2), 0.07, HOLZ2, 8); rohr((x, -0.3, 0.4), (x, 0.3, 0.4), 0.05, HOLZ2, 8)
    rohr((-0.95, 0, 1.15), (0.95, 0, 1.15), 0.05, EIS, 12); dreh([(0, -0.6), (0.32, -0.6), (0.32, 0.6), (0, 0.6)], HOLZ, 24).rotation_euler = (0, math.radians(90), 0)
    bpy.context.object.location = (0, 0, 1.15)
    for x in [i * 0.11 - 0.5 for i in range(10)]: ring((x, 0, 1.15), 0.34, 0.025, EIS, rot=(0, math.radians(90), 0), seg=(24, 5))        # aufgewickelte Kette
    ring((1.0, 0, 1.15), 0.42, 0.03, HOLZ2, rot=(0, math.radians(90), 0))                                                   # Kurbelrad mit Speichen
    for k in range(6): a = k * math.pi / 3; rohr((1.0, 0, 1.15), (1.0, 0.42 * math.cos(a), 1.15 + 0.42 * math.sin(a)), 0.025, HOLZ2, 6)
    rohr((1.0, 0.42, 1.15), (1.18, 0.42, 1.15), 0.03, HOLZ, 6)
    kette((0, -0.34, 1.0), (0, -1.6, -0.1))                                                                                   # Kette zum Wasser
    wuerfel((0, 0, 0.05), (1.8, 1.2, 0.1), HOLZ2)
elif ART == "signalfeuer":
    for k in range(3): a = k * 2 * math.pi / 3; rohr((0.5 * math.cos(a), 0.5 * math.sin(a), 0), (0.25 * math.cos(a), 0.25 * math.sin(a), 0.75), 0.05, EIS, 8)
    dreh([(0, 0.7), (0.15, 0.7), (0.55, 0.85), (0.62, 1.0), (0.58, 1.02), (0.5, 0.88), (0, 0.82)], EIS, 28)
    for k in range(8): a = k * math.pi / 4; kristall((0.58 * math.cos(a), 0.58 * math.sin(a), 1.04), 0.04, 0.12, ROST)
    for k in range(6): kugel((0.25 * math.cos(k), 0.25 * math.sin(k), 0.88), 0.08, mat("kohle", (30, 28, 26), 0.9), (1, 1, 0.6), 8)
    gruene_flamme((0, 0, 1.0), 2.6)
elif ART == "waechterbuch":
    rohr((0, 0, 0), (0, 0, 0.95), 0.06, HOLZ2, 8); wuerfel((0, 0, 0.02), (0.5, 0.4, 0.04), HOLZ2)
    wuerfel((0, 0, 1.0), (0.55, 0.4, 0.05), HOLZ2, (math.radians(-20), 0, 0))                                            # schräges Pult
    LED = mat("leder", (60, 52, 70), 0.6); PAP = mat("papier", (230, 214, 176), 0.9)
    for sx in (-1, 1):
        wuerfel((sx * 0.13, 0, 1.06), (0.26, 0.34, 0.02), LED, (math.radians(-20), math.radians(sx * -6), 0), 0.2)
        wuerfel((sx * 0.125, 0, 1.08), (0.24, 0.32, 0.03), PAP, (math.radians(-20), math.radians(sx * -6), 0), 0.15)
    for k in range(6): wuerfel((random.choice((-1, 1)) * random.uniform(0.04, 0.2), random.uniform(-0.1, 0.1), 1.1), (0.12, 0.004, 0.001), mat("tinte", (40, 30, 25)), (math.radians(-20), 0, 0), 0)
    rohr((0.02, 0.12, 1.1), (0.03, -0.12, 1.02), 0.004, mat("band", (140, 30, 30), 0.7), 4)                               # Lesebändchen
elif ART in ("glocke", "glocke_gesprungen"):                                                     # Glocke von Grauwacht (≈ 1,2 m) im Holzjoch
    BR = mat("bronze", (176, 128, 70), 0.35, 0.85); o = dreh([(0, 1.38), (0.12, 1.38), (0.2, 1.33), (0.28, 1.2), (0.33, 0.9), (0.4, 0.62), (0.52, 0.42), (0.55, 0.36), (0.5, 0.34), (0.45, 0.4), (0.36, 0.6), (0.29, 0.9), (0.24, 1.2), (0, 1.3)], BR, 36)
    ring((0, 0, 0.4), 0.52, 0.02, BR); ring((0, 0, 1.1), 0.3, 0.015, BR)
    rohr((0, 0, 1.3), (0, 0, 0.55), 0.02, EIS, 8); kugel((0, 0, 0.5), 0.06, EIS)                                                   # Klöppel innen
    for x in (-0.75, 0.75): rohr((x, 0, 0), (x, 0, 1.65), 0.07, HOLZ2, 8)
    wuerfel((0, 0, 1.55), (1.7, 0.18, 0.16), HOLZ2)
    if ART == "glocke_gesprungen":                                                                  # Riss von unten bis zur Schulter, ein Stück ausgebrochen
        R = mat("riss", (20, 16, 12), 0.95)
        prof = [(0.4, 0.54), (0.62, 0.41), (0.9, 0.335), (1.2, 0.285)]
        rz = lambda z: next(r0 + (r1 - r0) * (z - z0) / (z1 - z0) for (z0, r0), (z1, r1) in zip(prof, prof[1:]) if z <= z1)
        for k in range(10):                                                                            # Riss vorn auf der Glocke, im Zickzack nach oben
            z = 0.42 + k * 0.075; x = 0.04 * ((k % 3) - 1); r = rz(min(z, 1.19)) + 0.004
            wuerfel((x, -math.sqrt(max(0.0, r * r - x * x)), z), (0.02, 0.012, 0.085), R, (math.radians(-20), math.radians(25 * ((k % 3) - 1)), 0), 0)
        wuerfel((0.0, -0.53, 0.37), (0.16, 0.05, 0.08), R, fase=0)                                    # ausgebrochene Kerbe am Rand
        kugel((0.65, -0.4, 0.04), 0.07, BR, (1.3, 0.8, 0.4), 8)                                                                    # abgesprungenes Stück am Boden
elif ART == "glockenform":                                                                         # Lehmform für den Glockenguss (Mantel mit Eingusstrichter), auf Ziegelsockel
    LE = mat("lehm", (150, 108, 72), 0.95); ZI = mat("ziegel", (140, 70, 45), 0.9)
    dreh([(0, 1.25), (0.2, 1.25), (0.32, 1.15), (0.4, 0.85), (0.5, 0.5), (0.62, 0.3), (0.62, 0.25), (0, 0.25)], LE, 32); dreh([(0, 1.25), (0.1, 1.25), (0.13, 1.42), (0.06, 1.42), (0, 1.35)], LE, 16)
    for k in range(3): ring((0, 0, 0.45 + k * 0.28), 0.6 - k * 0.12, 0.018, EIS)
    for i in range(8): a = i * math.pi / 4; wuerfel((0.55 * math.cos(a), 0.55 * math.sin(a), 0.12), (0.26, 0.14, 0.24), ZI, (0, 0, a))
elif ART == "kloeppel":                                                                            # Klöppel der Glocke (Questgegenstand)
    rohr((0, 0, 0.02), (0.28, 0, 0.02), 0.012, EIS, 8); kugel((0.31, 0, 0.03), 0.045, EIS); ring((-0.02, 0, 0.02), 0.025, 0.008, EIS, rot=(math.radians(90), 0, 0))
elif ART == "dornenwall":                                                                          # Dornenwall (≈ 4 m lang, 1,3 m hoch) – sperrt den Weg nach Grauwacht
    DO = mat("dorn", (96, 76, 54), 0.9); BL = mat("dornblatt", (70, 80, 46), 0.9)
    for i in range(46):
        x = random.uniform(-2, 2); y = random.uniform(-0.4, 0.4); h = random.uniform(0.6, 1.3); a = random.uniform(-0.5, 0.5)
        rohr((x, y, 0), (x + h * math.sin(a), y + random.uniform(-0.2, 0.2), h), 0.04, DO, 5, 0.008)
        for k in range(3): z = random.uniform(0.2, h); kristall((x + z * math.sin(a), y, z), 0.012, 0.09, DO, (random.uniform(0, 3), random.uniform(0, 3), 0))
    for i in range(60): kugel((random.uniform(-2, 2), random.uniform(-0.4, 0.4), random.uniform(0.2, 1.1)), 0.07, BL, (1.4, 0.6, 0.3), 6)
elif ART == "grabhuegel_eingang":                                                                  # Eingang ins Hügelgrab: Erdhügel mit Steinportal, Türsturz, Stufen nach unten (dunkel)
    ER = mat("erde_gras", (96, 102, 66), 0.95); ST = mat("grabstein", (128, 124, 116), 0.9); DU = mat("dunkel", (12, 10, 9), 1.0)
    o = kugel((0, 1.15, 0), 1.9, ER, (1.0, 1.15, 0.95), 18)
    for v in o.data.vertices: v.co.z = max(v.co.z, -0.05)
    for x in (-0.55, 0.55): wuerfel((x, -1.05, 0.75), (0.32, 0.4, 1.5), ST, (0, 0, 0), 0.06)
    wuerfel((0, -1.05, 1.62), (1.6, 0.46, 0.3), ST, fase=0.06); wuerfel((0, -0.9, 0.7), (0.8, 0.2, 1.38), DU, fase=0)
    for k in range(3): wuerfel((0, -1.35 - k * 0.22, 0.06 - k * 0.0), (0.9, 0.24, 0.12), ST, fase=0.08)
    for k in range(5): kristall((random.uniform(-0.4, 0.4), -1.28, 1.8), 0.02, 0.06, ST)
elif ART == "grabstein":                                                                           # Grabstein (Deckung im Kampf gegen den Grauen Hauptmann): verwittert, Turmzeichen
    ST = mat("grabstein", (128, 124, 116), 0.9); MO = mat("moos", (78, 94, 52), 0.95)
    wuerfel((0, 0, 0.55), (0.7, 0.18, 1.1), ST, fase=0.05); kugel((0, 0, 1.08), 0.35, ST, (1, 0.26, 0.55), 12)
    wuerfel((0, -0.095, 0.7), (0.12, 0.02, 0.28), mat("ritz", (70, 68, 64), 0.9), fase=0)
    for k in range(4): kugel((random.uniform(-.3, .3), -0.09, random.uniform(0.05, 0.4)), 0.06, MO, (1.3, 0.3, 0.6), 8)
    wuerfel((0, 0, 0.03), (0.9, 0.4, 0.06), ST, fase=0.1)
elif ART == "kettenglied":
    ring((0, 0, 0.03), 0.06, 0.016, EIS, rot=(math.radians(90), 0, 0), sk=(1, 1, 1.6)); bpy.context.object.rotation_euler = (math.radians(90), 0, math.radians(30))
elif ART == "kettenschloss":
    ring((0, 0, 0.09), 0.065, 0.017, EIS, rot=(math.radians(90), 0, 0), sk=(1, 1, 1.4))                                   # Bügel (Schäkel)
    rohr((-0.1, 0, 0.02), (0.1, 0, 0.02), 0.018, EIS, 12); kugel((0.11, 0, 0.02), 0.026, EIS); rohr((-0.12, 0, 0.02), (-0.1, 0, 0.02), 0.03, EIS, 6)
    ring((0.0, -0.11, 0.02), 0.05, 0.014, EIS, rot=(0, 0, 0), sk=(1.4, 1, 1))                                               # ein angehängtes Glied
elif ART == "splitterkern_gruen":
    dreh([(0, 0), (0.06, 0), (0.05, 0.03), (0, 0.03)], EIS, 6); gruene_flamme((0, 0, 0.09), 0.75)
elif ART == "krebsschere":
    PZ = mat("panzer", (150, 70, 45), 0.45, 0.1); PH = mat("panzerhell", (200, 140, 100), 0.5)
    kugel((0, 0, 0.05), 0.07, PZ, (1.5, 0.8, 0.6)); kristall((0.14, 0.02, 0.06), 0.035, 0.14, PH, (0, math.radians(90), math.radians(8)))
    kristall((0.12, -0.035, 0.04), 0.028, 0.12, PH, (0, math.radians(90), math.radians(-14))); rohr((-0.1, 0, 0.05), (-0.18, 0.02, 0.04), 0.03, PZ, 8)
elif ART == "wachtstein":
    ST = mat("stein", (140, 136, 128), 0.9); o = kugel((0, 0, 0.08), 0.12, ST, (1.2, 0.8, 0.75), 8)
    for v in o.data.vertices: v.co *= random.uniform(0.85, 1.12)
    glatt(o, False)
    wuerfel((0, -0.08, 0.09), (0.045, 0.01, 0.07), mat("wappen", (190, 200, 210), 0.4, 0.4), fase=0.2)                    # Turm
    for z in (0.045, 0.03): rohr((-0.04, -0.085, z), (0.04, -0.085, z), 0.005, mat("wappen", (190, 200, 210)), 6)        # zwei Wellen (klein)
    kristall((0.07, 0.02, 0.15), 0.02, 0.07, KRIST)
elif ART == "welspastete":
    TEIG = mat("teig", (214, 160, 88), 0.7); RAND = mat("rand", (190, 130, 66), 0.7)
    dreh([(0, 0), (0.12, 0), (0.13, 0.04), (0.12, 0.06), (0.06, 0.075), (0, 0.078)], TEIG, 28)
    ring((0, 0, 0.04), 0.125, 0.012, RAND); [rohr((0.03 * k - 0.03, -0.05, 0.075), (0.03 * k - 0.03, 0.05, 0.075), 0.004, RAND, 4) for k in range(3)]
    kristall((0.15, 0, 0.05), 0.04, 0.06, mat("schwanz", (120, 110, 95), 0.6), (0, math.radians(-90), 0))                 # Fischschwanz schaut heraus
    bpy.context.object.scale = (1, 1, 0.3)
for o in list(bpy.context.scene.objects):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices)
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Objekt:", ART, len(o.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
