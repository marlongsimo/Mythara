"""Mythara Fabrik – kleine Raben, ganz aus einfachen Formen gebaut (wenige Polygone – viele gleichzeitig im Bild), mit Skelett und Bewegungen.

  <blender-python> fabrik/rabe.py -- <art> <ziel.blend>      art: moorrabe | kueken | seevogel | kraehe | ente
Danach: fabrik/export3d.py <ziel.blend> <spiel.glb> echtzeit=1

moorrabe – Gegner, ≈ 0,5 m lang, 0,95 m Spannweite, schwarz mit grünlichem Schimmer; schwebt in 1 m Höhe (Ruhelage in der Luft).
  fliegen (Schleife, ein Flügelschlag je 0,6 s) · sturz (Flügel anlegen, herabstoßen, Treffer, wieder hoch) · treffer · tod (trudelt zu Boden, bleibt liegen)
seevogel – Seevogel der Smaragdküste (Phase 10, St. 26): Möwe ×1,4 (≈ 0,7 m, 1,3 m Spannweite), weiß, graue Flügel mit schwarzen Spitzen, gelber Schnabel;
  schwebt in 1,4 m Höhe; Bewegungen wie der Moorrabe (sturz = Sturzflug)
kraehe – Krähe (Süden #121, Schwarm auf den Feldern, St. 2–5): Moorrabe ×0,85, mattschwarz mit grauem Nacken – gleiche Bewegungen
ente – Ente (Süden #121, Stimmungstier am Schilfsee): Form des Kükens ×1,9, grauer Leib, grüner Kopf, weißer Halsring, oranger Schnabel – ruhe, laufen
kueken – Begleiter (Pet), ≈ 0,22 m hoch, flauschig rund, großer Kopf, Stummelflügel; steht am Boden.
  ruhe (wippt, pickt zweimal, plustert die Flügel) · laufen (watschelt in kleinen Hüpfern)
Gesicht nach -y, oben +z. Jedes Teil hängt starr an einem Knochen (keine Verformung nötig).
"""
import math, os, sys
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]; RABE = ART in ("moorrabe", "seevogel", "kraehe"); F = {"seevogel": 1.4, "kraehe": 0.85, "ente": 1.9}.get(ART, 1.0)   # Seevogel ×1,4, Krähe ×0,85, Ente ×1,9 (aus dem Küken)
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, r=0.6, glanz=0.0):
    m = bpy.data.materials.get(n)
    if m: return m
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in c], 1); b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = glanz; return m
teile = []                                                                                       # (Objekt, Knochen)
def kugel(ort, sk, m, kn, seg=8, ringe=6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ringe, radius=1, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); teile.append((o, kn)); return o
_kugel = kugel
def kugel(ort, sk, m, kn, seg=8, ringe=6): return _kugel(tuple(F * x for x in ort), tuple(F * x for x in sk), m, kn, seg, ringe)
def kegel(ort, r, tiefe, m, kn, rot, n=4):
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=0, depth=tiefe, location=ort, rotation=rot); o = bpy.context.object; o.data.materials.append(m); teile.append((o, kn)); return o
_kegel = kegel
def kegel(ort, r, tiefe, m, kn, rot, n=4): return _kegel(tuple(F * x for x in ort), F * r, F * tiefe, m, kn, rot, n)
def flaeche(punkte, m, kn, dicke=0.008):
    punkte = [tuple(F * x for x in p_) for p_ in punkte]; me = bpy.data.meshes.new("f"); me.from_pydata(punkte, [], [tuple(range(len(punkte)))]); o = bpy.data.objects.new("f", me); bpy.context.collection.objects.link(o)
    o.data.materials.append(m); s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = dicke; teile.append((o, kn)); return o

if RABE:
    Z = 1.0; FED = mat("feder", (28, 32, 34), 0.45, 0.25); SCH = mat("schimmer", (30, 52, 48), 0.35, 0.3); SN = mat("schnabel", (45, 42, 40), 0.5); AUG = mat("auge", (210, 160, 40), 0.3); KOE = FED
    if ART == "kraehe": KOE = mat("kraehe", (36, 36, 40), 0.7); FED = mat("kraehe_dunkel", (22, 22, 26), 0.6); SCH = mat("kraehe_grau", (70, 72, 76), 0.7); SN = mat("kraehe_schnabel", (30, 28, 28), 0.5); AUG = mat("auge", (40, 34, 30), 0.3)
    if ART == "seevogel": KOE = mat("weiss", (236, 236, 232), 0.6); FED = mat("spitzen", (36, 36, 40), 0.5); SCH = mat("grau", (150, 158, 166), 0.55); SN = mat("gelb", (232, 190, 60), 0.4); AUG = mat("auge", (240, 220, 120), 0.3)
    kugel((0, 0, Z), (0.075, 0.17, 0.07), KOE, "koerper")
    kugel((0, -0.17, Z + 0.04), (0.055, 0.06, 0.055), KOE, "kopf")
    kegel((0, -0.255, Z + 0.035), 0.022, 0.08, SN, "kopf", (math.radians(90), 0, 0))
    for sx in (-1, 1): kugel((sx * 0.04, -0.2, Z + 0.055), (0.009, 0.009, 0.009), AUG, "kopf", 6, 4)
    for S, sx in (("L", 1), ("R", -1)):                                                          # Flügel: innen (Arm) und außen (Handschwingen, gefingert)
        flaeche([(sx * 0.05, -0.07, Z + 0.02), (sx * 0.24, -0.05, Z + 0.02), (sx * 0.24, 0.07, Z + 0.02), (sx * 0.05, 0.09, Z + 0.02)], SCH, "fluegel." + S)
        flaeche([(sx * 0.235, -0.05, Z + 0.02), (sx * 0.42, 0.0, Z + 0.02), (sx * 0.47, 0.05, Z + 0.02), (sx * 0.43, 0.09, Z + 0.02), (sx * 0.38, 0.1, Z + 0.02), (sx * 0.235, 0.07, Z + 0.02)], FED, "spitze." + S)
        kegel((sx * 0.03, 0.02, Z - 0.08), 0.008, 0.07, SN, "bein." + S, (math.radians(180), 0, 0), 4)
    flaeche([(-0.03, 0.14, Z + 0.01), (0.03, 0.14, Z + 0.01), (0.07, 0.3, Z + 0.0), (-0.07, 0.3, Z + 0.0)], KOE, "schwanz")
    KN = {"wurzel": ((0, 0, 0), (0, 0, 0.1), None), "koerper": ((0, 0.08, Z), (0, -0.1, Z), "wurzel"), "kopf": ((0, -0.13, Z + 0.03), (0, -0.23, Z + 0.04), "koerper"),
          "schwanz": ((0, 0.14, Z + 0.01), (0, 0.3, Z), "koerper")}
    for S, sx in (("L", 1), ("R", -1)):
        KN["fluegel." + S] = ((sx * 0.05, 0.01, Z + 0.02), (sx * 0.235, 0.01, Z + 0.02), "koerper"); KN["spitze." + S] = ((sx * 0.235, 0.01, Z + 0.02), (sx * 0.45, 0.04, Z + 0.02), "fluegel." + S)
        KN["bein." + S] = ((sx * 0.03, 0.02, Z - 0.05), (sx * 0.03, 0.02, Z - 0.12), "koerper")
else:
    Z = 0.0; FLAUM = mat("flaum", (62, 62, 70), 0.95); BAUCH = mat("bauch", (150, 145, 140), 0.95); SN = mat("schnabel", (215, 190, 120), 0.5); AUG = mat("auge", (20, 18, 22), 0.2); GLANZ = mat("glanz", (250, 250, 250), 0.2); KOPF = FLAUM
    if ART == "ente": FLAUM = mat("entenleib", (140, 132, 120), 0.7); BAUCH = mat("entenbrust", (150, 100, 70), 0.7); SN = mat("entenschnabel", (232, 160, 50), 0.5); KOPF = mat("entenkopf", (40, 100, 60), 0.35)
    kugel((0, 0, 0.085), (0.075, 0.08, 0.07), FLAUM, "koerper"); kugel((0, -0.035, 0.075), (0.055, 0.05, 0.05), BAUCH, "koerper")
    kugel((0, -0.03, 0.165), (0.06, 0.058, 0.055), KOPF, "kopf")
    if ART == "ente": kugel((0, -0.03, 0.125), (0.05, 0.05, 0.012), mat("halsring", (240, 240, 236), 0.6), "kopf", 10, 4)
    for k in range(3 if ART == "kueken" else 0): kugel((0.012 * (k - 1), -0.01, 0.22 + 0.004 * (k % 2)), (0.008, 0.02, 0.018), FLAUM, "kopf", 6, 4)   # Flaumbüschel
    sn_ = kegel((0, -0.095 - 0.01 * (ART == "ente"), 0.16), 0.016, 0.035 * (1.4 if ART == "ente" else 1), SN, "kopf", (math.radians(90), 0, 0))
    if ART == "ente": sn_.scale = (1.8, 0.45, 1.0)                                                   # breiter, flacher Entenschnabel
    for sx in (-1, 1): kugel((sx * 0.03, -0.075, 0.18), (0.013, 0.01, 0.015), AUG, "kopf", 8, 6); kugel((sx * 0.034, -0.084, 0.186), (0.004, 0.003, 0.004), GLANZ, "kopf", 6, 4)
    for S, sx in (("L", 1), ("R", -1)):
        kugel((sx * 0.072, 0.01, 0.095), (0.015, 0.04, 0.03), FLAUM, "fluegel." + S)
        kegel((sx * 0.025, -0.005, 0.02), 0.007, 0.04, SN, "bein." + S, (math.radians(180), 0, 0), 4); kugel((sx * 0.025, -0.02, 0.003), (0.014, 0.02, 0.004), SN, "bein." + S, 6, 4)
    KN = {"wurzel": ((0, 0, 0), (0, 0, 0.05), None), "koerper": ((0, 0, 0.04), (0, 0, 0.12), "wurzel"), "kopf": ((0, -0.02, 0.12), (0, -0.03, 0.22), "koerper")}
    for S, sx in (("L", 1), ("R", -1)):
        KN["fluegel." + S] = ((sx * 0.06, 0.0, 0.12), (sx * 0.08, 0.02, 0.07), "koerper"); KN["bein." + S] = ((sx * 0.025, 0.0, 0.045), (sx * 0.025, 0.0, 0.0), "koerper")

# ---- Skelett, Teile starr an ihre Knochen, ein Netz „koerper“
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT")
for n, (k, e, el) in KN.items():
    k, e = tuple(F * x for x in k), tuple(F * x for x in e); b = arm.data.edit_bones.new(n); b.head = Vector(k); b.tail = Vector(e) if Vector(e) != Vector(k) else Vector(k) + Vector((0, 0, 0.05))
for n, (k, e, el) in KN.items():
    if el: arm.data.edit_bones[n].parent = arm.data.edit_bones[el]
bpy.ops.object.mode_set(mode="OBJECT")
for o, kn in teile:
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    for p in o.data.polygons: p.use_smooth = not RABE
    g = o.vertex_groups.new(name=kn); g.add(list(range(len(o.data.vertices))), 1.0, "REPLACE")
bpy.ops.object.select_all(action="DESELECT")
for o, _ in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0][0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
ob = bpy.context.object; ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"; ob.parent = arm; ob.modifiers.new("skelett", "ARMATURE").object = arm
print(ART, "–", len(ob.data.polygons), "Flächen")

# ---- Bewegungen
PB = arm.pose.bones; B = arm.data.bones
for b in PB: b.rotation_mode = "QUATERNION"
def dreh(n, *schritte):
    """um Achsen der Figur drehen (x Breite, y vorn–hinten, z oben), im Raum des Knochens"""
    R = B[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def ort(v): PB["wurzel"].location = (F * v[0], F * v[2], -F * v[1])                                         # Wurzelknochen zeigt nach oben: lokal (x, y=oben, z=hinten)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
X, Y, Zx = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def schlag(t, k=1.0): return math.sin(2 * math.pi * k * t)
def fluegel(auf, spitze, zurueck=0.0):
    for S, sx in (("L", 1), ("R", -1)): dreh("fluegel." + S, (Y, -sx * auf), (Zx, sx * zurueck)); dreh("spitze." + S, (Y, -sx * spitze))
B_ = {}
if RABE:
    def fliegen(t):
        s = schlag(t); fluegel(10 + 38 * s, 18 * schlag(t - 0.12)); ort((0, 0, -0.04 * s)); dreh("koerper", (X, 3 * s)); dreh("schwanz", (X, -6 * s)); dreh("kopf", (X, -3 * s))
        for S in "LR": dreh("bein." + S, (X, -60))
    def sturz(t):
        w = math.sin(math.pi * min(1.0, t / 0.75)); an = math.sin(math.pi * min(1.0, t / 0.6))                 # anlegen, stoßen, abfangen
        fluegel(18 * an + (40 * schlag(t, 2) if t > 0.6 else 0), -10 * an, -55 * an); dreh("koerper", (X, 50 * an - 25 * max(0.0, (t - 0.55) / 0.45) * an))
        ort((0, -0.45 * w, -0.75 * w)); dreh("kopf", (X, -15 * an)); dreh("schwanz", (X, 10 * an))
        for S in "LR": dreh("bein." + S, (X, -60 + 70 * math.sin(math.pi * max(0.0, min(1.0, (t - 0.4) / 0.3)))))   # Krallen vor beim Zustoßen
    def treffer(t):
        w = math.sin(math.pi * t); fluegel(10 + 50 * w, 30 * w, 10 * w); ort((0, 0.12 * w, 0.06 * w)); dreh("koerper", (X, -25 * w), (Y, 15 * w)); dreh("kopf", (X, 20 * w))
        for S in "LR": dreh("bein." + S, (X, -60))
    def tod(t):
        f = min(1.0, t / 0.7); g = f * f; fluegel(10 + 30 * math.sin(6 * math.pi * f) * (1 - f) - 10 * f, -20 * f, -10 * f)
        ort((0, 0, -0.93 * g)); dreh("koerper", (Y, 180 * f), (X, 20 * f)); dreh("kopf", (X, 30 * f), (Zx, 25 * f)); dreh("schwanz", (X, -10 * f))
    B_ = {"fliegen": (fliegen, 10, 16, True, {}), "sturz": (sturz, 14, 14, False, {"treffer": 8}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 14, 12, False, {"halten": 13})}
else:
    def ruhe(t):
        pick = max(0.0, math.sin(2 * math.pi * 2 * t)) ** 2 * (t < 0.5); w = math.sin(2 * math.pi * t)
        ort((0, 0, 0.004 * w)); dreh("koerper", (X, 4 * w + 18 * pick)); dreh("kopf", (X, 25 * pick), (Zx, 8 * math.sin(2 * math.pi * t) * (t >= 0.5)))
        plust = max(0.0, math.sin(2 * math.pi * 2 * t)) * (t >= 0.5); fluegel(30 * plust, 0)
    def laufen(t):
        s = schlag(t); h = abs(s); ort((0, 0, 0.022 * h)); dreh("koerper", (Y, 10 * s), (X, 10)); dreh("kopf", (X, -6), (Y, -6 * s))
        dreh("bein.L", (X, 35 * s)); dreh("bein.R", (X, -35 * s)); fluegel(15 + 15 * h, 0)
    B_ = {"ruhe": (ruhe, 24, 16, True, {}), "laufen": (laufen, 10, 16, True, {})}
    def fluegel(auf, spitze, zurueck=0.0):                                                       # Küken: nur Stummelflügel
        for S, sx in (("L", 1), ("R", -1)): dreh("fluegel." + S, (Y, -sx * auf))
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in B_.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a; k = n + 1 if schleife else n
    for i in range(k):
        nullen(); fn(i / n if schleife else i / (n - 1))
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = k; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = __import__("json").dumps(mehr); print("Bewegung:", name, k, "Bilder")
arm.animation_data.action = bpy.data.actions[list(B_)[0]]; bpy.context.scene.frame_set(1)
if ART == "kueken": arm["pet"] = True; arm["hoehe"] = 0.23
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ZIEL)); print("geschrieben:", ZIEL)
