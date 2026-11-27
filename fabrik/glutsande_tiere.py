"""Mythara Fabrik – Gegner der Glutsande (Phase 9) aus einfachen Formen, mit Skelett und Bewegungen (wie fabrik/ostufer_tiere.py).

  <blender-python> fabrik/glutsande_tiere.py -- <art> <ziel.blend>      art: sandkriecher | sandmutter | skorpion | glutgeist
Danach: fabrik/export3d.py <ziel.blend> <spiel.glb> echtzeit=1

sandkriecher – Sandkriecher (St. 42): sandfarbener Ringelwurm (≈ 1,8 m über dem Boden), Rundmaul mit Zahnkranz, zwei Kieferzangen, Sandhügel am Fuß.
               auftauchen (bricht aus dem Sand, Bild 1 ganz unter dem Boden) · eingraben (versinkt, letztes Bild hält unter dem Boden)
               ruhe (pendeln, Maul atmet) · gehen (schlängeln) · angriff (ausholen, niederstoßen, Treffer Bild 6) · treffer · tod (sackt zur Seite, versinkt halb)
sandmutter   – Die Sandmutter (St. 60, Mini-Boss): Riesen-Sandkriecher ×2,3, dunkler, Stachelkamm, drei Zahnkränze – gleiche Bewegungen, dazu brüllen.
skorpion     – Glutskorpion (St. 48): dunkelrot-schwarzer Panzer mit glühenden Fugen (≈ 1,2 m lang), Scheren, acht Beine, Schwanz mit glühendem Stachel.
               ruhe · gehen · angriff (Stachelstich, Treffer Bild 6) · zwicken (Scherenhieb, Treffer Bild 5) · treffer · tod
glutgeist    – Glutgeist (St. 56): schwebende Flammengestalt (≈ 1,6 m), glühender Kern, Kopf mit hellen Augen, Flammenarme, Funken.
               ruhe (schweben, unruhiges Flackern) · gehen · angriff (Glutstoß, Geschoss ab Bild 6) · flackern (verlöscht kurz und erscheint wieder – Bild 6 unsichtbar) · treffer · tod (verglüht)
Gesicht nach -y, oben +z. Jedes Teil hängt starr an einem Knochen. Im Boden versenkte Teile verdeckt im Spiel das Gelände.
"""
import json, math, os, random, sys
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(5)
def mat(n, c, r=0.6, gl=0.0, leucht=0.0):
    m = bpy.data.materials.get(n)
    if m: return m
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; f = (*[(x / 255) ** 2.2 for x in c], 1)
    b.inputs["Base Color"].default_value = f; b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = gl
    if leucht: b.inputs["Emission Color"].default_value = f; b.inputs["Emission Strength"].default_value = leucht
    return m
teile = []
def kugel(ort, sk, m, kn, seg=10, ringe=6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ringe, radius=1, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); teile.append((o, kn)); return o
def rohr(p0, p1, r0, m, kn, r1=None, n=6):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r0 if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); teile.append((o, kn)); return o
def kristall(ort, r, h, m, kn, kipp=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=r, radius2=0, depth=h, location=ort, rotation=kipp); o = bpy.context.object; o.data.materials.append(m); teile.append((o, kn)); return o
KN = {}
def knochen(n, k, e, el=None): KN[n] = (k, e, el)


if ART in ("sandkriecher", "sandmutter"):
    M_ = ART == "sandmutter"; G_ = 2.3 if M_ else 1.0
    HA = mat("haut" + ART, (150, 112, 70) if M_ else (186, 150, 100), 0.75); RI = mat("ring" + ART, (96, 70, 46) if M_ else (130, 98, 64), 0.8)
    MA = mat("maul", (70, 22, 20), 0.5); ZA = mat("zahn", (232, 222, 196), 0.4); SA = mat("sand", (206, 178, 128), 0.95); ST = mat("stachel", (60, 44, 34), 0.6)
    N = 6; L = 0.28 * G_; R0 = 0.24 * G_
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("huegel", (0, 0, 0), (0, 0, 0.1), "wurzel"); knochen("leib", (0, 0, 0), (0, 0, 0.1), "wurzel")
    kugel((0, 0, 0.0), (0.62 * G_, 0.62 * G_, 0.13 * G_), SA, "huegel", 14, 6)
    for k in range(9): a = k / 9 * 2 * math.pi; kugel((0.58 * G_ * math.cos(a), 0.58 * G_ * math.sin(a), 0.02), (0.14 * G_, 0.12 * G_, 0.07 * G_), SA, "huegel", 6, 4)
    for i in range(N):
        z0 = i * L; r = R0 * (1 - 0.1 * i / N); b = f"glied{i + 1}"
        kugel((0, 0, z0 + L / 2), (r, r * 0.95, L * 0.62), HA, b, 12, 7); kugel((0, 0, z0 + L * 0.95), (r * 1.06, r * 1.0, L * 0.14), RI, b, 12, 4)
        if M_ or i > 2:
            for sx in (-1, 1): kristall((sx * r * 0.45, r * 0.82, z0 + L / 2), (0.07 if M_ else 0.04) * G_, (0.26 if M_ else 0.08) * G_, ST if M_ else RI, b, (math.radians(-80), sx * 0.4, 0))
        knochen(b, (0, 0, z0), (0, 0, z0 + L), "leib" if i == 0 else f"glied{i}")
    ZK = N * L; RK = R0 * 1.05
    kugel((0, 0, ZK + RK * 0.6), (RK, RK, RK * 0.9), HA, "kopf", 14, 8); kugel((0, -RK * 0.62, ZK + RK * 0.55), (RK * 0.7, RK * 0.5, RK * 0.7), MA, "kopf", 12, 6)
    for kr, rr in ((0, 0.6),) + (((1, 0.4), (2, 0.22)) if M_ else ()):
        n = 10 if kr == 0 else 8
        for k in range(n):
            a = k / n * 2 * math.pi + kr * 0.3; kristall((rr * RK * math.cos(a), -RK * (1.02 - 0.12 * kr), ZK + RK * 0.55 + rr * RK * math.sin(a)), 0.025 * G_, 0.1 * G_, ZA, "kopf", (math.radians(90) - 0.5 * math.sin(a), 0, 0.5 * math.cos(a)))
    if M_:
        for k in range(5): kristall((0, RK * 0.6, ZK + RK * (0.3 + 0.25 * k)), 0.07 * G_, 0.3 * G_, ST, "kopf", (math.radians(-60 + 25 * k), 0, 0))
    for sx, S in ((1, "L"), (-1, "R")):
        rohr((sx * RK * 0.8, -RK * 0.6, ZK + RK * 0.5), (sx * RK * 0.55, -RK * 1.5, ZK + RK * 0.2), 0.06 * G_, RI, "kiefer." + S, 0.012 * G_)
        knochen("kiefer." + S, (sx * RK * 0.8, -RK * 0.6, ZK + RK * 0.5), (sx * RK * 0.55, -RK * 1.5, ZK + RK * 0.2), "kopf")
    knochen("kopf", (0, 0, ZK), (0, 0, ZK + RK * 1.4), f"glied{N}")
elif ART == "skorpion":
    PZ = mat("panzer", (64, 26, 20), 0.45, 0.1); PD = mat("panzerdunkel", (34, 16, 14), 0.5); GL = mat("glut", (255, 120, 36), 0.4, 0, 3.0); AU = mat("auge", (255, 200, 80), 0.3, 0, 3.0)
    Z = 0.3
    kugel((0, -0.12, Z), (0.24, 0.26, 0.12), PZ, "koerper", 12, 7)
    for k in range(3): kugel((0, 0.12 + 0.13 * k, Z - 0.01 * k), (0.22 - 0.02 * k, 0.09, 0.1), PZ if k % 2 == 0 else PD, "koerper", 12, 6); kugel((0, 0.17 + 0.13 * k, Z + 0.06), (0.17 - 0.02 * k, 0.025, 0.04), GL, "koerper", 8, 4)
    for sx in (-1, 1): kugel((sx * 0.05, -0.33, Z + 0.08), (0.022, 0.022, 0.022), AU, "koerper", 6, 4)
    for sx in (-1, 1):
        S = "L" if sx > 0 else "R"
        rohr((sx * 0.16, -0.3, Z), (sx * 0.34, -0.5, Z + 0.06), 0.045, PZ, "arm." + S)
        kugel((sx * 0.38, -0.62, Z + 0.08), (0.1, 0.15, 0.08), PZ, "schere." + S, 10, 6); kugel((sx * 0.38, -0.62, Z + 0.13), (0.05, 0.08, 0.02), GL, "schere." + S, 6, 4)
        kristall((sx * 0.43, -0.8, Z + 0.1), 0.04, 0.17, PD, "schere." + S, (math.radians(90), 0, 0)); kristall((sx * 0.34, -0.78, Z + 0.06), 0.035, 0.15, PD, "finger." + S, (math.radians(90), 0, 0))
        knochen("arm." + S, (sx * 0.15, -0.28, Z), (sx * 0.34, -0.5, Z + 0.06), "koerper"); knochen("schere." + S, (sx * 0.34, -0.5, Z + 0.06), (sx * 0.4, -0.72, Z + 0.08), "arm." + S)
        knochen("finger." + S, (sx * 0.34, -0.68, Z + 0.06), (sx * 0.34, -0.84, Z + 0.06), "schere." + S)
        for i in range(4):
            y = -0.2 + i * 0.12; b = f"bein{i}.{S}"
            rohr((sx * 0.2, y, Z), (sx * 0.42, y + 0.04, Z + 0.1), 0.02, PZ, b); rohr((sx * 0.42, y + 0.04, Z + 0.1), (sx * 0.56, y + 0.07, 0.0), 0.016, PD, b, 0.005)
            knochen(b, (sx * 0.18, y, Z), (sx * 0.56, y + 0.07, 0.0), "koerper")
    P = [(0, 0.42, Z), (0, 0.6, Z + 0.14), (0, 0.68, Z + 0.36), (0, 0.62, Z + 0.58), (0, 0.46, Z + 0.72), (0, 0.27, Z + 0.72)]
    for i in range(5):
        a, e = Vector(P[i]), Vector(P[i + 1]); b = f"schwanz{i + 1}"; r = 0.085 - 0.01 * i
        kugel(tuple((a + e) / 2), (r, r, r * 1.15), PZ if i % 2 == 0 else PD, b, 10, 6); kugel(tuple(e), (r * 0.55, r * 0.55, r * 0.55), GL, b, 6, 4)
        knochen(b, P[i], P[i + 1], "koerper" if i == 0 else f"schwanz{i}")
    kugel((0, 0.22, Z + 0.7), (0.06, 0.08, 0.06), GL, "schwanz5", 8, 5); kristall((0, 0.15, Z + 0.62), 0.03, 0.18, PD, "schwanz5", (math.radians(140), 0, 0))
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.3, Z), (0, -0.3, Z), "wurzel")
else:
    KE = mat("kern", (255, 230, 160), 0.2, 0, 5.0); FL = mat("flamme", (255, 110, 30), 0.3, 0, 2.8); FD = mat("glutdunkel", (170, 44, 16), 0.4, 0, 1.4)
    FU = mat("funke", (255, 180, 70), 0.3, 0, 3.5); AU = mat("augen", (255, 246, 200), 0.2, 0, 7.0)
    kristall((0, 0, 0.88), 0.26, 0.8, FD, "koerper", (math.pi, 0, 0)); kristall((0, 0, 0.85), 0.2, 0.9, FL, "koerper", (math.pi, 0, 0.6))
    kugel((0, 0, 1.08), (0.22, 0.17, 0.18), FD, "koerper", 10, 6); kugel((0, -0.05, 1.05), (0.11, 0.11, 0.11), KE, "koerper", 10, 6)
    kugel((0, 0, 1.4), (0.15, 0.14, 0.16), FD, "kopf", 10, 6)
    for sx in (-1, 1): kugel((sx * 0.055, -0.13, 1.42), (0.035, 0.015, 0.018), AU, "kopf", 6, 4)
    for k in range(6): a = k / 6 * 2 * math.pi; kristall((0.08 * math.cos(a), 0.08 * math.sin(a), 1.58), 0.06, 0.32 - 0.06 * (k % 2), FL, "flamme", (0.35 * math.sin(a), -0.35 * math.cos(a), 0))
    kristall((0, 0.02, 1.68), 0.07, 0.45, FL, "flamme")
    for sx, S in ((1, "L"), (-1, "R")):
        rohr((sx * 0.2, 0, 1.18), (sx * 0.36, -0.08, 0.92), 0.07, FD, "arm." + S, 0.05); rohr((sx * 0.36, -0.08, 0.92), (sx * 0.42, -0.16, 0.7), 0.05, FL, "arm." + S, 0.01)
        knochen("arm." + S, (sx * 0.2, 0, 1.18), (sx * 0.42, -0.16, 0.7), "koerper")
    for k in range(7): a = k / 7 * 2 * math.pi; kugel((0.4 * math.cos(a), 0.4 * math.sin(a), 1.0 + 0.12 * math.sin(2 * a)), (0.022, 0.022, 0.022), FU, "funken", 6, 4)
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0, 0.5), (0, 0, 1.25), "wurzel"); knochen("kopf", (0, 0, 1.25), (0, 0, 1.55), "koerper")
    knochen("flamme", (0, 0, 1.5), (0, 0, 1.85), "kopf"); knochen("funken", (0, 0, 1.0), (0, 0, 1.2), "wurzel")

# ---- Skelett, Teile starr an ihre Knochen, ein Netz „koerper“
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT")
for n, (k, e, el) in KN.items(): b = arm.data.edit_bones.new(n); b.head = Vector(k); b.tail = Vector(e)
for n, (k, e, el) in KN.items():
    if el: arm.data.edit_bones[n].parent = arm.data.edit_bones[el]
bpy.ops.object.mode_set(mode="OBJECT")
for o, kn in teile:
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    for p in o.data.polygons: p.use_smooth = ART != "skorpion"
    g = o.vertex_groups.new(name=kn); g.add(list(range(len(o.data.vertices))), 1.0, "REPLACE")
bpy.ops.object.select_all(action="DESELECT")
for o, _ in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0][0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
ob = bpy.context.object; ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"; ob.parent = arm; ob.modifiers.new("skelett", "ARMATURE").object = arm
print(ART, "–", len(ob.data.polygons), "Flächen")

# ---- Bewegungen
PB = arm.pose.bones; B = arm.data.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Zx = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def dreh(n, *schritte):
    R = B[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def ort(v): PB["wurzel"].location = (v[0], v[2], -v[1])
def gross(n, f): PB[n].scale = (f, f, f)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0); b.scale = (1, 1, 1)
s_ = lambda t, k=1.0, ph=0.0: math.sin(2 * math.pi * k * t + ph)
glatt = lambda u: u * u * (3 - 2 * u)
def tief(f): PB["leib"].location = (0, -f, 0)
if ART in ("sandkriecher", "sandmutter"):
    GL_ = [f"glied{i + 1}" for i in range(N)]; HOCH = N * L + RK * 1.6
    BOG = 5                                                                                         # Grundhaltung: Leib im Bogen nach vorn, Maul schaut nach vorn
    def welle(t, a, k=1.0, achse=Zx, bog=1.0):
        for i, g in enumerate(GL_): dreh(g, (X, BOG * bog * (i > 1) + (a * s_(t, k, -i * 0.7) if achse == X else 0)), (Zx, a * s_(t, k, -i * 0.7) if achse == Zx else 0))
    def maul(w):
        for S, v in (("L", 1), ("R", -1)): dreh("kiefer." + S, (Zx, -v * 28 * w))
    def ruhe(t): welle(t, 5); dreh("kopf", (X, 10 + 6 * s_(t, 1, 2))); maul(0.3 + 0.3 * max(0, s_(t, 2)))
    def gehen(t): welle(t, 12, 2); dreh("glied1", (X, 8)); dreh("kopf", (X, 14)); gross("huegel", 1 + 0.1 * s_(t, 2)); maul(0.2)
    def auftauchen(t):
        u = glatt(min(1.0, t / 0.75)); tief(HOCH * 1.05 * (1 - u) - 0.08 * math.sin(math.pi * min(1, max(0, (t - 0.6) / 0.4))))
        gross("huegel", 0.5 + 0.9 * math.sin(math.pi * min(1, t / 0.9)) * (1 - 0.2 * t) + 0.3 * t); welle(t, 14 * (1 - t), 2); dreh("kopf", (X, -25 * (1 - u) + 10)); maul(math.sin(math.pi * min(1, max(0, (t - 0.5) / 0.5))))
    def eingraben(t):
        u = glatt(min(1.0, t / 0.85)); tief(HOCH * 1.05 * u); gross("huegel", 1 + 0.6 * math.sin(math.pi * min(1, t / 0.9)) - 0.4 * u); welle(t, 14 * u, 2); dreh("kopf", (X, 10 + 30 * u))
    def angriff(t):
        z = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.38) / 0.5)))
        for i, g in enumerate(GL_): dreh(g, (X, BOG * (i > 1) - 7 * z + (6 + 3 * i) * h))
        dreh("kopf", (X, 10 - 15 * z + 25 * h)); maul(z + 0.6 * h)
    def bruellen(t):
        w = math.sin(math.pi * min(1, t / 0.25)) if t < 0.8 else math.sin(math.pi * (1 - t) / 0.4)
        for i, g in enumerate(GL_): dreh(g, (X, BOG * (i > 1) - 4 * w), (Zx, 3 * w * s_(t, 6, i)))
        dreh("kopf", (X, -30 * w)); maul(1.2 * w); gross("huegel", 1 + 0.15 * w * abs(s_(t, 5)))
    def treffer(t): w = math.sin(math.pi * t); welle(t, 0); dreh("glied3", (X, -8 * w)); dreh("glied5", (X, -10 * w), (Zx, 8 * w)); dreh("kopf", (X, -15 * w)); maul(0.8 * w)
    def tod(t):
        f = glatt(min(1.0, t / 0.7))
        for i, g in enumerate(GL_): dreh(g, (Y, (5 + 4 * i) * f), (X, 4 * f))
        dreh("kopf", (Y, 20 * f)); maul(0.6 * (1 - f)); tief(HOCH * 0.35 * f); gross("huegel", 1 + 0.2 * f)
    BW = {"ruhe": (ruhe, 16, 8, True, {}), "gehen": (gehen, 12, 10, True, {}), "auftauchen": (auftauchen, 16, 12, False, {}), "eingraben": (eingraben, 14, 12, False, {"halten": 13}),
          "angriff": (angriff, 12, 12, False, {"treffer": 6}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 10, False, {"halten": 11})}
    if M_: BW["bruellen"] = (bruellen, 20, 10, False, {})
elif ART == "skorpion":
    SW = [f"schwanz{i + 1}" for i in range(5)]
    def beine(t, k=1.0):
        for i in range(4):
            for S, v in (("L", 1), ("R", -1)): dreh(f"bein{i}.{S}", (Zx, 14 * s_(t, k, i * 1.6 + (0 if S == "L" else math.pi))), (Y, v * 8 * max(0, s_(t, k, i * 1.6 + 1.5))))
    def ruhe(t):
        for i, g in enumerate(SW): dreh(g, (X, 3 * s_(t, 1, -i * 0.6)))
        for S, v in (("L", 1), ("R", -1)): dreh("finger." + S, (Zx, v * 15 * max(0, s_(t, 2, 0 if S == "L" else 1))))
    def gehen(t): beine(t, 2); ort((0, 0, 0.01 * abs(s_(t, 2)))); [dreh(g, (X, 4 * s_(t, 2, -i))) for i, g in enumerate(SW)]
    def angriff(t):
        z = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.4) / 0.4)))
        for i, g in enumerate(SW): dreh(g, (X, -6 * z + (8 + 6 * i) * h))
        dreh("koerper", (X, 4 * z - 6 * h)); ort((0, -0.05 * h, 0))
    def zwicken(t):
        w = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.4) / 0.4)))
        for S, v in (("L", 1), ("R", -1)): dreh("arm." + S, (X, 30 * w - 25 * h), (Zx, -v * 20 * h)); dreh("finger." + S, (Zx, v * 30 * w))
        dreh("koerper", (X, -5 * w + 6 * h)); ort((0, -0.08 * h, 0))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (X, -8 * w), (Y, 6 * w)); dreh("schwanz2", (X, -15 * w)); ort((0, 0.07 * w, 0.02 * w))
    def tod(t):
        f = glatt(min(1.0, t / 0.6)); dreh("koerper", (Y, 25 * f)); ort((0, 0, -0.06 * f))
        for i, g in enumerate(SW): dreh(g, (X, -14 * f))
        for i in range(4):
            for S in "LR": dreh(f"bein{i}.{S}", (Y, (30 if S == "L" else -30) * f))
    BW = {"ruhe": (ruhe, 16, 10, True, {}), "gehen": (gehen, 12, 12, True, {}), "angriff": (angriff, 12, 12, False, {"treffer": 6}), "zwicken": (zwicken, 10, 12, False, {"treffer": 5}),
          "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
else:
    def flackern_(t, f=1.0):
        u = 1 + 0.1 * s_(t, 3) + 0.07 * s_(t, 5, 1) + 0.05 * s_(t, 7, 2); gross("flamme", f * u); dreh("flamme", (Zx, 30 * s_(t)), (X, 8 * s_(t, 2)))
        for S, v in (("L", 1), ("R", -1)): dreh("arm." + S, (Y, v * 8 * s_(t, 2, v)))
    def ruhe(t):
        dip = math.exp(-((t - 0.62) / 0.05) ** 2); ort((0, 0, 0.08 * s_(t))); flackern_(t, 1 - 0.35 * dip); gross("koerper", 1 - 0.08 * dip + 0.03 * s_(t, 4)); dreh("funken", (Zx, 360 * t))
    def gehen(t): ruhe(t); dreh("koerper", (X, 12)); dreh("kopf", (X, -8))
    def angriff(t):
        z = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; a = math.sin(math.pi * min(1, max(0, (t - 0.4) / 0.45)))
        for S, v in (("L", 1), ("R", -1)): dreh("arm." + S, (X, -50 * z + 85 * a), (Y, v * 10 * z))
        dreh("koerper", (X, -12 * z + 15 * a)); flackern_(t, 1 + 0.25 * z + 0.4 * a); gross("funken", 1 + 0.6 * a); dreh("funken", (Zx, 600 * t)); ort((0, -0.12 * a, 0.05 * z))
    def flackern(t):
        w = max(0.02, 1 - math.sin(math.pi * min(1, t / 0.9)) * (1.4 if 0.3 < t < 0.6 else 1.0)); w = max(0.02, min(1, w))
        gross("wurzel", w); flackern_(t, 1 + 0.6 * (1 - w)); dreh("funken", (Zx, 720 * t)); gross("funken", 1 + 1.5 * (1 - w))
    def treffer(t): w = math.sin(math.pi * t); gross("koerper", 1 - 0.15 * w); flackern_(t, 1 - 0.45 * w); dreh("kopf", (X, -15 * w)); ort((0, 0.12 * w, 0))
    def tod(t): f = glatt(min(1.0, t / 0.8)); gross("koerper", max(0.02, 1 - 0.9 * f)); gross("flamme", max(0.02, 1 - 1.1 * f)); gross("funken", 1 + 2 * f); ort((0, 0, -0.5 * f)); dreh("kopf", (X, 30 * f))
    BW = {"ruhe": (ruhe, 20, 10, True, {}), "gehen": (gehen, 12, 10, True, {}), "angriff": (angriff, 12, 12, False, {"geschoss": 6}), "flackern": (flackern, 12, 14, False, {"weg": 6}),
          "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 14, 10, False, {"halten": 13})}
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in BW.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a; k = n + 1 if schleife else n
    for i in range(k):
        nullen(); fn(i / n if schleife else i / (n - 1))
        for b in PB:
            b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name); b.keyframe_insert("scale", frame=i + 1, group=b.name); b.keyframe_insert("location", frame=i + 1, group=b.name)
    a["bilder"] = k; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, k, "Bilder")
arm.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ZIEL)); print("geschrieben:", ZIEL)
