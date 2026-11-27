"""Mythara Fabrik – Sammelpflanzen (Flachs, Hanf) in Blender bauen und als 3D-Spieldatei ausgeben.

  python3 fabrik/pflanze.py -- <art> <zustand> <ziel.glb> [vorschau.png]
  art: flachs | hanf | wegerich | ringelblume | moorgloeckchen | eisenhut | nebelkraut | lindenbluete (Kräuterkunde) | mondsalbei | glutwurz | splitterlilie (Zunft, #176)
  zustand: voll | geerntet (Stoppeln)

Flachs: ein Büschel aus etwa 30 schlanken Halmen (bis 0,9 m) mit schmalen Blättern, zartblauen Blüten (leicht lavendel, damit der
Spiel-Shader sie nicht als leuchtende Ader pulsieren lässt) und runden Samenkapseln.
Hanf: fünf bis sieben kräftige Stängel (bis 1,3 m) mit gefingerten Blättern (7 gezähnte Fiedern) und dichten Blütenständen an der Spitze.
Geerntet: kurze, schräg abgeschnittene Stoppeln und ein paar liegende Blätter.
Nur einfache Farben (kein Bild) – sie gehen so ins glTF; das Spiel lässt die Pflanzen im Wind wiegen (Shader, nach der Höhe).
"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector, Matrix

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZUSTAND, ZIEL = a_[0], a_[1], a_[2]; VORSCHAU = a_[3] if len(a_) > 3 else None
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed({"flachs": 7, "hanf": 11}.get(ART, sum(map(ord, ART))))
def mat(name, farbe, rau=0.75, leuchten=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = list(farbe) + [1]; b.inputs["Roughness"].default_value = rau
    if leuchten: b.inputs["Emission Color"].default_value = list(farbe) + [1]; b.inputs["Emission Strength"].default_value = leuchten
    return m
def lin(c): return tuple(((x / 255 + 0.055) / 1.055) ** 2.4 if x / 255 > 0.04045 else x / 255 / 12.92 for x in c)
teile = []
def halm(p0, richtung, laenge, dicke, m, n=6, kruemmung=0.15):
    """ein Stängel als dünne Röhre entlang einer leicht gebogenen Linie; gibt die Punkte der Linie zurück"""
    pts = []; d = Vector(richtung).normalized(); seit = Vector((random.uniform(-1, 1), random.uniform(-1, 1), 0)).normalized() * kruemmung
    for i in range(n + 1):
        t = i / n; pts.append(Vector(p0) + d * laenge * t + seit * laenge * t * t)
    kurve = bpy.data.curves.new("halm", "CURVE"); kurve.dimensions = "3D"; s = kurve.splines.new("POLY"); s.points.add(len(pts) - 1)
    for i, p in enumerate(pts): s.points[i].co = (*p, 1); s.points[i].radius = 1 - 0.6 * i / n
    kurve.bevel_depth = dicke; kurve.bevel_resolution = 1; kurve.use_fill_caps = True
    o = bpy.data.objects.new("halm", kurve); bpy.context.collection.objects.link(o); o.data.materials.append(m); teile.append(o); return pts
def blatt(ort, richtung, laenge, breite, m, kipp=0.6, form="lanzett"):
    """flaches Blatt als Fläche (spitz zulaufend), in Richtung ausgerichtet und nach unten gekippt"""
    bm = bmesh.new(); seg = 5; vs_l, vs_r = [], []
    for i in range(seg + 1):
        t = i / seg; w = breite * (math.sin(math.pi * t) ** (0.8 if form == "lanzett" else 0.5)) * (1 - 0.2 * t)
        y = laenge * t; vs_l.append(bm.verts.new((-w / 2, y, 0.02 * laenge * math.sin(math.pi * t)))); vs_r.append(bm.verts.new((w / 2, y, 0.02 * laenge * math.sin(math.pi * t))))
    for i in range(seg): bm.faces.new((vs_l[i], vs_r[i], vs_r[i + 1], vs_l[i + 1]))
    me = bpy.data.meshes.new("blatt"); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new("blatt", me); bpy.context.collection.objects.link(o)
    d = Vector(richtung); d.z = 0; d = d.normalized() if d.length > 1e-6 else Vector((0, 1, 0))
    o.rotation_euler = (-kipp, 0, math.atan2(-d.x, d.y)); o.location = ort; o.data.materials.append(m); teile.append(o); return o
def kugel(ort, r, m, n=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=max(4, n // 2), radius=r, location=ort); o = bpy.context.object; o.data.materials.append(m); teile.append(o); return o
def bluete(ort, r, m, mitte):
    for k in range(5):                                                                           # fünf runde Blütenblätter
        a = k * 2 * math.pi / 5; blatt(Vector(ort), (math.cos(a), math.sin(a), 0), r, r * 0.9, m, kipp=-0.25, form="rund")
    kugel(ort, r * 0.25, mitte, 6)

KRAEUTER = ("wegerich", "ringelblume", "moorgloeckchen", "eisenhut", "nebelkraut", "lindenbluete", "mondsalbei", "glutwurz", "splitterlilie")
GRUEN = mat("gruen", lin((86, 128, 52))); GRUEN2 = mat("gruen2", lin((112, 150, 62))); HALM = mat("halm", lin((128, 150, 70)))
if ART == "flachs":
    BLAU = mat("bluete", lin((150, 150, 230))); MITTE = mat("mitte", lin((235, 220, 120))); KAPSEL = mat("kapsel", lin((185, 160, 85)))
    for i in range(30):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.16); p0 = (r * math.cos(a), r * math.sin(a), 0)
        if ZUSTAND == "geerntet":
            h = random.uniform(0.06, 0.12); halm(p0, (r * math.cos(a) * 0.4, r * math.sin(a) * 0.4, 1), h, 0.005, mat("stoppel", lin((170, 160, 95))), n=1, kruemmung=0); continue
        h = random.uniform(0.6, 0.9); pts = halm(p0, (r * math.cos(a) * 0.5 + random.uniform(-.08, .08), r * math.sin(a) * 0.5 + random.uniform(-.08, .08), 1), h, 0.0045, HALM)
        for j in range(2, 6): blatt(pts[j], (random.uniform(-1, 1), random.uniform(-1, 1), 0), 0.07, 0.012, GRUEN2, kipp=random.uniform(0.2, 0.7))
        oben = pts[-1]
        if random.random() < 0.55: bluete(oben + Vector((0, 0, 0.01)), 0.022, BLAU, MITTE)
        else:
            for k in range(random.randint(1, 3)): kugel(oben + Vector((random.uniform(-.02, .02), random.uniform(-.02, .02), random.uniform(0, .02))), 0.011, KAPSEL, 8)
elif ART == "hanf":
    BLUETE = mat("hanfbluete", lin((150, 170, 80))); HAARE = mat("haare", lin((205, 170, 110)))
    for i in range(5):
        a = i * 2 * math.pi / 5 + random.uniform(-0.3, 0.3); r = random.uniform(0.05, 0.14); p0 = (r * math.cos(a), r * math.sin(a), 0)
        if ZUSTAND == "geerntet":
            halm(p0, (0.1 * math.cos(a), 0.1 * math.sin(a), 1), random.uniform(0.08, 0.16), 0.014, mat("stoppel", lin((150, 140, 80))), n=1, kruemmung=0)
            if i % 2 == 0: blatt(Vector((p0[0] * 2.5, p0[1] * 2.5, 0.01)), (math.cos(a), math.sin(a), 0), 0.16, 0.04, mat("welk", lin((140, 130, 70))), kipp=0.03)
            continue
        h = random.uniform(1.0, 1.3); pts = halm(p0, (0.22 * math.cos(a), 0.22 * math.sin(a), 1), h, 0.012, HALM, n=8, kruemmung=0.08)
        for j in (2, 3, 4, 5, 6):                                                                # gefingerte Blätter: 7 breite Fiedern im Fächer, unten größer, je Ebene zwei gegenüber
            gross = 0.32 * (1.2 - j / 8)
            for w in (random.uniform(0, 2 * math.pi),) * 1 + ((random.uniform(0, 2 * math.pi) + math.pi),):
                for f in range(7):
                    ab = (f - 3) * 0.42; l = gross * (1 - abs(f - 3) * 0.17)
                    blatt(pts[j], (math.cos(w + ab), math.sin(w + ab), 0), l, l * 0.3, GRUEN if f % 2 else GRUEN2, kipp=0.3 + abs(f - 3) * 0.12)
        for k in range(5):                                                                       # Blütenstand: dichte Knospen an der Spitze
            kugel(pts[-1] + Vector((random.uniform(-.03, .03), random.uniform(-.03, .03), -0.05 + k * 0.025)), 0.03 - k * 0.003, BLUETE, 8)
        for k in range(4): kugel(pts[-1] + Vector((random.uniform(-.035, .035), random.uniform(-.035, .035), -0.03 + k * 0.02)), 0.008, HAARE, 6)
elif ART in KRAEUTER:
    def stoppeln(n, h, farbe=(150, 140, 85)):
        for i in range(n):
            a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.08); halm((r * math.cos(a), r * math.sin(a), 0), (0.2 * math.cos(a), 0.2 * math.sin(a), 1), random.uniform(h * 0.5, h), 0.004, mat("stoppel", lin(farbe)), n=1, kruemmung=0)
        for i in range(3):
            a = random.uniform(0, 2 * math.pi); blatt(Vector((0.05 * math.cos(a), 0.05 * math.sin(a), 0.012)), (math.cos(a), math.sin(a), 0), 0.07, 0.025, mat("welk", lin((130, 125, 70))), kipp=0.02)
    if ART == "wegerich":                                                                        # Rosette breiter, gerippter Blätter, schlanke Ähren mit braunen Blütenköpfen
        if ZUSTAND == "geerntet": stoppeln(5, 0.05)
        else:
            for k in range(9):
                a = k * 2 * math.pi / 9 + random.uniform(-.2, .2); blatt(Vector((0, 0, 0.026)), (math.cos(a), math.sin(a), 0), random.uniform(0.13, 0.18), 0.075, GRUEN if k % 2 else GRUEN2, kipp=random.uniform(0.05, 0.25), form="rund")
            for k in range(4):
                a = random.uniform(0, 2 * math.pi); pts = halm((0.02 * math.cos(a), 0.02 * math.sin(a), 0.01), (0.15 * math.cos(a), 0.15 * math.sin(a), 1), random.uniform(0.25, 0.34), 0.003, HALM, n=4)
                for j in range(5): kugel(pts[-1] + Vector((0, 0, -0.012 * j)), 0.009 - j * 0.0008, mat("aehre", lin((120, 95, 60))), 6)
    elif ART == "ringelblume":                                                                   # buschig, leuchtend orange Korbblüten
        if ZUSTAND == "geerntet": stoppeln(8, 0.08)
        else:
            OR = mat("ringel", lin((240, 140, 25)), 0.6); MI = mat("ringelmitte", lin((150, 80, 20)))
            for i in range(9):
                a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.08); pts = halm((r * math.cos(a), r * math.sin(a), 0), (0.4 * math.cos(a), 0.4 * math.sin(a), 1), random.uniform(0.28, 0.42), 0.005, HALM, n=4)
                for j in (1, 2, 3): blatt(pts[j], (random.uniform(-1, 1), random.uniform(-1, 1), 0), 0.08, 0.025, GRUEN2, kipp=random.uniform(0.2, 0.6))
                o = pts[-1] + Vector((0, 0, 0.005))
                for k in range(12): b = k * 2 * math.pi / 12; blatt(o, (math.cos(b), math.sin(b), 0), 0.03, 0.011, OR, kipp=-0.15)
                kugel(o, 0.011, MI, 8)
    elif ART == "moorgloeckchen":                                                                # dünne Stiele, nickende Glöckchen (zartlila – pulsiert nicht im Spiel-Shader)
        if ZUSTAND == "geerntet": stoppeln(6, 0.06)
        else:
            GL = mat("gloeckchen", lin((185, 160, 225)), 0.5)
            for i in range(7):
                a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.07); pts = halm((r * math.cos(a), r * math.sin(a), 0), (0.25 * math.cos(a), 0.25 * math.sin(a), 1), random.uniform(0.25, 0.36), 0.0035, HALM, n=5, kruemmung=0.3)
                blatt(pts[1], (math.cos(a), math.sin(a), 0), 0.12, 0.018, GRUEN, kipp=0.3)
                for j in (3, 4, 5):
                    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.016, radius2=0.004, depth=0.022, location=pts[j] + Vector((0.015, 0, -0.018))); g = bpy.context.object; g.data.materials.append(GL); teile.append(g)
    elif ART == "eisenhut":                                                                      # hoher Blütenstand mit dunkelvioletten Helmblüten, gefingerte Blätter
        if ZUSTAND == "geerntet": stoppeln(4, 0.1)
        else:
            EH = mat("eisenhut", lin((70, 40, 120)), 0.5)
            for i in range(3):
                a = i * 2.1; pts = halm((0.04 * math.cos(a), 0.04 * math.sin(a), 0), (0.08 * math.cos(a), 0.08 * math.sin(a), 1), random.uniform(0.65, 0.85), 0.007, HALM, n=8, kruemmung=0.05)
                for j in (1, 2, 3):
                    for f in range(5): w = random.uniform(0, 6.3); blatt(pts[j], (math.cos(w + f * 0.5), math.sin(w + f * 0.5), 0), 0.1 - j * 0.015, 0.025, GRUEN, kipp=0.35)
                for j in range(5, 9):
                    for k in range(3):
                        b = k * 2.1 + j; o = pts[j] + Vector((0.02 * math.cos(b), 0.02 * math.sin(b), 0)); kugel(o, 0.016, EH, 8).scale = (1, 1, 1.4); kugel(o + Vector((0, 0, 0.018)), 0.011, EH, 6)
    elif ART == "nebelkraut":                                                                    # silbergraue, fein gefiederte Blätter, kleine weiße Doldenblüten
        if ZUSTAND == "geerntet": stoppeln(7, 0.07, (160, 160, 150))
        else:
            SI = mat("silber", lin((175, 185, 178)), 0.8); WE = mat("weiss", lin((240, 240, 235)), 0.6)
            for i in range(8):
                a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.09); pts = halm((r * math.cos(a), r * math.sin(a), 0), (0.35 * math.cos(a), 0.35 * math.sin(a), 1), random.uniform(0.3, 0.45), 0.004, mat("silberhalm", lin((150, 160, 140))), n=5)
                for j in (1, 2, 3, 4):
                    for f in range(4): w = random.uniform(0, 6.3); blatt(pts[j], (math.cos(w), math.sin(w), 0), 0.06, 0.008, SI, kipp=0.4)
                for k in range(7): kugel(pts[-1] + Vector((random.uniform(-.025, .025), random.uniform(-.025, .025), random.uniform(-.005, .01))), 0.006, WE, 6)
    elif ART == "lindenbluete":                                                                  # junger Lindenstrauch: herzförmige Blätter, gelbliche Blütenbüschel mit hellem Hochblatt
        if ZUSTAND == "geerntet": stoppeln(3, 0.2, (110, 85, 55))
        else:
            LB = mat("lindenbluete", lin((235, 220, 130)), 0.6); HB = mat("hochblatt", lin((190, 200, 120)))
            for i in range(4):
                a = i * 1.6; pts = halm((0.02 * math.cos(a), 0.02 * math.sin(a), 0), (0.3 * math.cos(a), 0.3 * math.sin(a), 1), random.uniform(0.55, 0.75), 0.009, mat("rinde", lin((110, 85, 55))), n=6, kruemmung=0.2)
                for j in range(2, 7):
                    for f in range(2): w = random.uniform(0, 6.3); blatt(pts[j], (math.cos(w), math.sin(w), 0), 0.09, 0.08, GRUEN if f else GRUEN2, kipp=0.5, form="rund")
                    if j >= 4:
                        b = random.uniform(0, 6.3); o = pts[j] + Vector((0.04 * math.cos(b), 0.04 * math.sin(b), -0.03)); blatt(o, (math.cos(b), math.sin(b), 0), 0.06, 0.018, HB, kipp=0.8)
                        for k in range(5): kugel(o + Vector((random.uniform(-.015, .015), random.uniform(-.015, .015), random.uniform(-.02, 0))), 0.007, LB, 6)
    elif ART == "mondsalbei":                                                                    # Zunft #176 (Stufe 70): Salbeibusch, silbergrau-blaue samtige Blätter, blasse Lavendel-Ähren
        if ZUSTAND == "geerntet": stoppeln(6, 0.08, (150, 160, 160))
        else:
            MS = mat("mondsalbei_blatt", lin((150, 168, 172)), 0.9); MS2 = mat("mondsalbei_blatt2", lin((176, 190, 196)), 0.9); AE = mat("mondsalbei_bluete", lin((196, 186, 232)), 0.55)
            for i in range(9):
                a = random.uniform(0, 2 * math.pi); r = random.uniform(0, 0.08); pts = halm((r * math.cos(a), r * math.sin(a), 0), (0.3 * math.cos(a), 0.3 * math.sin(a), 1), random.uniform(0.3, 0.5), 0.005, HALM, n=6, kruemmung=0.08)
                for j in (1, 2, 3):
                    for f in range(2): w = a + (f - 0.5) * 2.4 + random.uniform(-.3, .3); blatt(pts[j], (math.cos(w), math.sin(w), 0), 0.085, 0.04, MS if f else MS2, kipp=0.45, form="rund")
                if i % 2 == 0:
                    for j in (4, 5, 6):
                        for k in range(4): b_ = k * 1.57 + j; kugel(pts[j] + Vector((0.012 * math.cos(b_), 0.012 * math.sin(b_), 0)), 0.008, AE, 6)
    elif ART == "glutwurz":                                                                      # Zunft #176 (Stufe 80): niedrige Rosette, dunkelrote Blätter, knollige Wurzel, glühende Knospen
        if ZUSTAND == "geerntet": stoppeln(5, 0.05, (110, 40, 30))
        else:
            GB = mat("glutwurz_blatt", lin((120, 36, 28)), 0.7); GB2 = mat("glutwurz_blatt2", lin((92, 60, 32)), 0.7); GL = mat("glutwurz_glut", lin((255, 130, 40)), 0.4, 2.0)
            kugel((0, 0, 0.02), 0.06, mat("glutwurz_knolle", lin((140, 70, 40)), 0.8), 10).scale = (1, 1, 0.6)
            for i in range(10):
                a = i * 0.63; blatt(Vector((0, 0, 0.04)), (math.cos(a), math.sin(a), 0), random.uniform(0.14, 0.2), 0.055, GB if i % 2 else GB2, kipp=-0.15)
            for i in range(5):
                a = random.uniform(0, 2 * math.pi); pts = halm((0.02 * math.cos(a), 0.02 * math.sin(a), 0.04), (0.2 * math.cos(a), 0.2 * math.sin(a), 1), random.uniform(0.18, 0.28), 0.004, mat("glutwurz_stiel", lin((110, 50, 30))), n=4)
                kugel(pts[-1], 0.016, GL, 8).scale = (1, 1, 1.3)
    elif ART == "splitterlilie":                                                                 # Zunft #176 (Stufe 90): schlanke Lilie, blau leuchtende Trichterblüten (wie Splitter)
        if ZUSTAND == "geerntet": stoppeln(3, 0.1, (90, 120, 110))
        else:
            BL = mat("splitterlilie_bluete", lin((50, 120, 255)), 0.3, 1.4); KE = mat("splitterlilie_kern", lin((220, 240, 255)), 0.3, 3.0)
            for i in range(3):
                a = i * 2.1 + 0.3; pts = halm((0.03 * math.cos(a), 0.03 * math.sin(a), 0), (0.12 * math.cos(a), 0.12 * math.sin(a), 1), random.uniform(0.55, 0.7), 0.006, HALM, n=8, kruemmung=0.1)
                for j in (1, 2, 3): blatt(pts[j], (math.cos(a + j), math.sin(a + j), 0), 0.16, 0.025, GRUEN, kipp=0.25)
                for k in range(6):                                                               # sechs zurückgebogene Blütenblätter um den Kern
                    w = k * math.pi / 3; blatt(pts[-1], (math.cos(w), math.sin(w), 0), 0.11, 0.04, BL, kipp=-0.7)
                for k in range(5): rohr_ = halm(pts[-1], (0.3 * math.cos(k * 1.26), 0.3 * math.sin(k * 1.26), 1), 0.04, 0.0015, KE, n=2, kruemmung=0); kugel(rohr_[-1], 0.004, KE, 6)
# Erde
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius={"flachs": 0.2, "hanf": 0.22}.get(ART, 0.15), depth=0.02, location=(0, 0, 0.0)); o = bpy.context.object; o.data.materials.append(mat("erde", lin((92, 70, 48)), 0.95)); teile.append(o)
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.convert(target="MESH"); bpy.ops.object.join(); p = bpy.context.object; p.name = ART
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
lo = min(v.co.z for v in p.data.vertices)
for v in p.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Pflanze:", ART, ZUSTAND, "Höhe", round(max(v.co.z for v in p.data.vertices), 2), "m ·", len(p.data.polygons), "Flächen ·", os.path.getsize(ZIEL) // 1024, "KB")
