"""Mythara Fabrik – Gegner der Smaragdküste (Phase 10) aus einfachen Formen, mit Skelett und Bewegungen (wie fabrik/ostufer_tiere.py).

  <blender-python> fabrik/kueste_tiere.py -- <art> <ziel.blend>      art: strandkrabbe | riesenkrabbe | lurch
Danach: fabrik/export3d.py <ziel.blend> <spiel.glb> echtzeit=1

strandkrabbe – Strandkrabbe (St. 22): Form des Schlickkrebses in Krabbenrot, wenige Seepocken (≈ 0,9 m breit).
riesenkrabbe – Riesenkrabbe (St. 34): ×2, dunkleres Rot, voller Seepocken und Tang.
               beide: ruhe (Scheren klappern) · gehen (seitwärts) · angriff (Scherenhieb, Treffer Bild 5) · treffer · tod (kippt auf den Rücken)
lurch        – Mangrovenlurch (St. 38): Riesensalamander (≈ 2,3 m mit Schwanz), moosgrün mit orangen Flecken und Rückenkamm, breiter Kopf, gelbe Augen.
               ruhe · gehen (schlängelt) · angriff (Vorschnellen mit Biss, Treffer Bild 5) · treffer · tod (rollt auf den Rücken)
Gesicht nach -y, oben +z. Jedes Teil hängt starr an einem Knochen.
"""
import json, math, os, random, sys
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
F = {"riesenkrabbe": 2.0}.get(ART, 1.0)                                                       # Größe (Riesenkrabbe doppelt so groß)
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
    ort, sk = tuple(F * x for x in ort), tuple(F * x for x in sk)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ringe, radius=1, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); teile.append((o, kn)); return o
def rohr(p0, p1, r0, m, kn, r1=None, n=6):
    p0, p1, r0, r1 = tuple(F * x for x in p0), tuple(F * x for x in p1), F * r0, (None if r1 is None else F * r1)
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r0 if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); teile.append((o, kn)); return o
def kristall(ort, r, h, m, kn, kipp=(0, 0, 0)):
    ort, r, h = tuple(F * x for x in ort), F * r, F * h
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=r, radius2=0, depth=h, location=ort, rotation=kipp); o = bpy.context.object; o.data.materials.append(m); teile.append((o, kn)); return o
KN = {}
def knochen(n, k, e, el=None): KN[n] = (tuple(F * x for x in k), tuple(F * x for x in e), el)

if ART in ("strandkrabbe", "riesenkrabbe"):
    RIESE = ART == "riesenkrabbe"
    PZ = mat("panzer" + ART, (176, 64, 40) if not RIESE else (120, 46, 36), 0.5, 0.1); PH = mat("panzerhell" + ART, (226, 140, 90) if not RIESE else (190, 110, 70), 0.45); SCH = mat("seepocke", (210, 204, 186), 0.9); AU = mat("auge", (20, 18, 16), 0.2)
    Z = 0.32
    kugel((0, 0, Z), (0.42, 0.32, 0.15), PZ, "koerper", 14, 7); kugel((0, -0.05, Z + 0.06), (0.32, 0.22, 0.08), PH, "koerper", 12, 6)
    for k in range(14 if RIESE else 3): kugel((random.uniform(-.3, .3), random.uniform(-.2, .2), Z + 0.11), (0.035, 0.035, 0.03), SCH, "koerper", 6, 4)   # Seepocken (Riese: viele, dazu Tang)
    if RIESE:
        for k in range(5): kristall((random.uniform(-.25, .25), random.uniform(-.1, .2), Z + 0.12), 0.03, 0.18, mat("tang", (50, 90, 50), 0.7), "koerper", (random.uniform(-.8, .8), random.uniform(-.8, .8), 0))
    for sx in (-1, 1):
        rohr((sx * 0.08, -0.28, Z + 0.08), (sx * 0.1, -0.33, Z + 0.22), 0.015, PZ, "koerper"); kugel((sx * 0.1, -0.33, Z + 0.24), (0.035, 0.035, 0.035), AU, "koerper", 8, 4)
        S = "L" if sx > 0 else "R"
        rohr((sx * 0.32, -0.18, Z), (sx * 0.5, -0.38, Z + 0.06), 0.05, PZ, "arm." + S)                   # Oberarm
        kugel((sx * 0.55, -0.5, Z + 0.08), (0.13, 0.17, 0.09), PZ, "schere." + S, 10, 6)                    # Scherenhand
        kristall((sx * 0.6, -0.68, Z + 0.1), 0.05, 0.18, PH, "schere." + S, (math.radians(90), 0, 0))       # fester Finger
        kristall((sx * 0.5, -0.66, Z + 0.06), 0.04, 0.16, PH, "finger." + S, (math.radians(90), 0, 0))      # beweglicher Finger
        knochen("arm." + S, (sx * 0.3, -0.16, Z), (sx * 0.5, -0.38, Z + 0.06), "koerper"); knochen("schere." + S, (sx * 0.5, -0.38, Z + 0.06), (sx * 0.58, -0.6, Z + 0.08), "arm." + S)
        knochen("finger." + S, (sx * 0.5, -0.56, Z + 0.06), (sx * 0.5, -0.72, Z + 0.06), "schere." + S)
        for i in range(4):
            y = -0.12 + i * 0.1; b = f"bein{i}.{S}"
            rohr((sx * 0.36, y, Z), (sx * 0.58, y + 0.03, Z + 0.08), 0.022, PZ, b); rohr((sx * 0.58, y + 0.03, Z + 0.08), (sx * 0.72, y + 0.05, 0.0), 0.018, PZ, b, 0.006)
            knochen(b, (sx * 0.34, y, Z), (sx * 0.72, y + 0.05, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.2, Z), (0, -0.2, Z), "wurzel")
elif ART == "lurch":
    HA = mat("lurchhaut", (62, 84, 58), 0.4); BA = mat("lurchbauch", (196, 150, 70), 0.5); FL = mat("lurchflecken", (230, 120, 40), 0.4); AU = mat("lurchauge", (230, 200, 60), 0.2, 0, 0.4); MA = mat("lurchmaul", (150, 60, 60), 0.5)
    Z = 0.26
    kugel((0, 0.05, Z), (0.26, 0.55, 0.16), HA, "koerper", 14, 7); kugel((0, 0.05, Z - 0.07), (0.22, 0.48, 0.1), BA, "koerper", 12, 6)
    for k in range(9): kugel((random.uniform(-.17, .17), random.uniform(-.35, .45), Z + 0.13), (0.045, 0.06, 0.02), FL, "koerper", 6, 4)
    for k in range(6): kristall((0, -0.35 + k * 0.15, Z + 0.15), 0.035, 0.1, FL, "koerper", (0.3, 0, 0))                         # Rückenkamm
    kugel((0, -0.62, Z + 0.02), (0.24, 0.24, 0.1), HA, "kopf", 12, 6)                                                           # breiter flacher Kopf
    for sx in (-1, 1): kugel((sx * 0.13, -0.6, Z + 0.1), (0.045, 0.045, 0.04), AU, "kopf", 8, 5); kugel((sx * 0.14, -0.62, Z + 0.12), (0.02, 0.02, 0.02), mat("pupille", (10, 10, 10), 0.2), "kopf", 6, 4)
    kugel((0, -0.66, Z - 0.05), (0.22, 0.22, 0.05), BA, "kiefer", 12, 5); kugel((0, -0.7, Z - 0.02), (0.17, 0.12, 0.03), MA, "kiefer", 10, 4)
    rohr((0, 0.55, Z), (0, 0.95, Z - 0.06), 0.13, HA, "schwanz1", 0.08); rohr((0, 0.95, Z - 0.06), (0, 1.45, Z - 0.16), 0.08, HA, "schwanz2", 0.015)
    for k in range(4): kristall((0, 0.62 + k * 0.2, Z + 0.08 - k * 0.04), 0.03, 0.09, FL, "schwanz1" if k < 2 else "schwanz2", (0.3, 0, 0))
    for v_, S, sx, y in (("v", "L", 1, -0.3), ("v", "R", -1, -0.3), ("h", "L", 1, 0.38), ("h", "R", -1, 0.38)):
        b = f"bein{v_}.{S}"; rohr((sx * 0.2, y, Z), (sx * 0.42, y - 0.03, Z - 0.05), 0.06, HA, b, 0.05); rohr((sx * 0.42, y - 0.03, Z - 0.05), (sx * 0.46, y - 0.08, 0.02), 0.045, HA, b, 0.035)
        for a in (-0.6, 0, 0.6): rohr((sx * 0.46, y - 0.08, 0.02), (sx * 0.46 + 0.09 * math.sin(a) * sx, y - 0.08 - 0.09 * math.cos(a), 0.005), 0.015, BA, b, 0.006)
        knochen(b, (sx * 0.18, y, Z), (sx * 0.46, y - 0.08, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.5, Z), (0, -0.4, Z), "wurzel"); knochen("kopf", (0, -0.42, Z), (0, -0.82, Z + 0.02), "koerper")
    knochen("kiefer", (0, -0.5, Z - 0.04), (0, -0.84, Z - 0.05), "kopf"); knochen("schwanz1", (0, 0.5, Z), (0, 0.95, Z - 0.06), "koerper"); knochen("schwanz2", (0, 0.95, Z - 0.06), (0, 1.45, Z - 0.16), "schwanz1")

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
    for p in o.data.polygons: p.use_smooth = ART == "lurch"
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
def ort(v): PB["wurzel"].location = (F * v[0], F * v[2], -F * v[1])
def gross(n, f): PB[n].scale = (f, f, f)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0); b.scale = (1, 1, 1)
s_ = lambda t, k=1.0, ph=0.0: math.sin(2 * math.pi * k * t + ph)
glatt = lambda u: u * u * (3 - 2 * u)
if ART in ("strandkrabbe", "riesenkrabbe"):
    def beine(t, k=1.0):
        for i in range(4):
            for S, v in (("L", 1), ("R", -1)): dreh(f"bein{i}.{S}", (Y, v * 12 * s_(t, k, i * 1.6 + (0 if S == "L" else math.pi))), (Zx, 10 * s_(t, k, i * 1.6 + 1.5)))
    def ruhe(t):
        for S, v in (("L", 1), ("R", -1)): dreh("finger." + S, (Zx, v * 18 * max(0, s_(t, 2, 0 if S == "L" else 1)))); dreh("arm." + S, (X, 4 * s_(t)))
        ort((0, 0, 0.01 * s_(t)))
    def gehen(t): beine(t, 2); ort((0.03 * s_(t, 2), 0, 0.015 * abs(s_(t, 2)))); dreh("koerper", (Y, 4 * s_(t, 2)))
    def angriff(t):
        w = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.4) / 0.4)))
        for S, v in (("L", 1), ("R", -1)): dreh("arm." + S, (X, 35 * w - 25 * h), (Zx, -v * 20 * h)); dreh("finger." + S, (Zx, v * 30 * w))
        dreh("koerper", (X, -6 * w + 8 * h)); ort((0, -0.08 * h, 0))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (X, -10 * w), (Y, 8 * w)); ort((0, 0.08 * w, 0.03 * w))
    def tod(t):
        f = glatt(min(1.0, t / 0.6)); dreh("koerper", (Y, 180 * f)); ort((0, 0, 0.28 * math.sin(math.pi * f) + 0.3 * f))
        for i in range(4):
            for S in "LR": dreh(f"bein{i}.{S}", (X, 25 * f * s_(t, 3, i)))
    BW = {"ruhe": (ruhe, 16, 10, True, {}), "gehen": (gehen, 12, 12, True, {}), "angriff": (angriff, 10, 12, False, {"treffer": 5}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
elif ART == "lurch":
    def beine(f, a=28):
        for S, v in (("L", 1), ("R", -1)): dreh("beinv." + S, (Zx, -v * a * f), (X, 10 * f)); dreh("beinh." + S, (Zx, v * a * f), (X, -10 * f))
    def ruhe(t): dreh("kopf", (X, 3 * s_(t)), (Zx, 6 * s_(t, 0.5))); dreh("kiefer", (X, 4 * max(0, s_(t, 2)))); dreh("schwanz1", (Zx, 8 * s_(t))); dreh("schwanz2", (Zx, 14 * s_(t, 1, -0.8))); ort((0, 0, 0.004 * s_(t, 2)))
    def gehen(t):
        s = s_(t); dreh("koerper", (Zx, 10 * s)); dreh("kopf", (Zx, -8 * s)); dreh("schwanz1", (Zx, -16 * s)); dreh("schwanz2", (Zx, -22 * s_(t, 1, -0.8))); beine(s); ort((0, 0, 0.01 * abs(s)))
    def angriff(t):
        z = math.sin(math.pi * min(1, t / 0.4)) if t < 0.4 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.35) / 0.5)))
        dreh("koerper", (X, -6 * z + 4 * h)); dreh("kopf", (X, -12 * z + 8 * h)); dreh("kiefer", (X, 40 * h)); ort((0, -0.3 * h + 0.08 * z, 0.05 * h)); dreh("schwanz1", (X, 10 * z))
        for S in "LR": dreh("beinh." + S, (X, -20 * h))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (Zx, 12 * w), (Y, 8 * w)); dreh("kopf", (X, -15 * w)); dreh("schwanz1", (Zx, -20 * w)); ort((0, 0.1 * w, 0))
    def tod(t):
        f = glatt(min(1.0, t / 0.6)); dreh("wurzel", (Y, 170 * f)); ort((0, 0, 0.26 * math.sin(math.pi * f) + 0.42 * f)); dreh("kiefer", (X, 25 * f)); beine(f * s_(t, 2), 20)
    BW = {"ruhe": (ruhe, 16, 8, True, {}), "gehen": (gehen, 12, 12, True, {}), "angriff": (angriff, 10, 12, False, {"treffer": 5}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in BW.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a; k = n + 1 if schleife else n
    for i in range(k):
        nullen(); fn(i / n if schleife else i / (n - 1))
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name); b.keyframe_insert("scale", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = k; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, k, "Bilder")
arm.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ZIEL)); print("geschrieben:", ZIEL)
