"""Mythara Fabrik – ein gebückter Riese (Troll, Golem …) aus einem Meshy-Modell: Skelett, Gewichte nach Körperbereichen, Bewegungen.

  <blender-python> fabrik/rig_riese.py -- <meshy.blend|glb> <ziel.blend> [hoehe=2.6] [bewegungen=ruhe,gehen,faustschlag,treffer,tod] [waffe=<glb>] [waffe_laenge=2.0]

Für Figuren, die rig.py (aufrechte Menschen) nicht sauber verformt: breite Schultern, lange, tief hängende Arme mit den Fäusten neben den Beinen.
Erwartet: Blick nach -y, oben +z, Füße auf dem Boden (Meshy-Modell aus der Übergabe, auch ohne Rücksicht auf Maßstab).
Knochen: wurzel – rumpf – kopf; rumpf – oberarm.L/R – unterarm.L/R; wurzel – bein.L/R.
Gewichte nach Abstand zu den Knochen, aber je Bereich begrenzt: Arme nur außen (seitlich der Schultern), Beine nur unten und innen
(nicht die Fäuste daneben), Kopf nur oben in der Mitte; über das Netz geglättet. Ausgabe danach mit fabrik/export3d.py.
Bewegungen (24 Bilder/s):
  ruhe        – schweres Atmen, Arme pendeln leicht, Kopf wendet sich
  gehen       – stampfender Schritt, die Arme schwingen gegen
  faustschlag – rechte Faust hoch über den Kopf und niederschmettern (Treffer Bild 11 von 21)
  treffer     – Ruck zurück, Kopf in den Nacken
  tod         – kippt nach hinten und bleibt liegen (letztes Bild halten)
  angriff     – Keulenschlag (Waffe in der rechten Hand): wie faustschlag, der Arm nur bis über die Schulter (Treffer Bild 11 von 21)
  stampfen    – springt, beide Fäuste krachen auf den Boden (Treffer Bild 15 von 25 – Bodenwelle)
  werfen      – hebt mit links einen Fels über den Kopf und wirft ihn nach vorn (Geschoss ab Bild 14 von 25)
waffe=<glb>: eine starre Waffe (Knauf/Griff unten, Kopf oben wie fabrik/sueden_objekte.py knueppel) fest in die rechte Faust, entlang des Unterarms
nach unten verlängert, auf waffe_laenge (m) skaliert – gehört ganz zum Unterarm.
"""
import json, math, os, sys
import numpy as np
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x); H = float(opt.get("hoehe", 2.6))
if quelle.endswith(".glb"): bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
else: bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; ob.parent = None; ob.rotation_mode = "XYZ"
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data; P = np.array([v.co[:] for v in me.vertices], np.float32)
P[:, 2] -= P[:, 2].min(); P[:, 0] -= (P[:, 0].min() + P[:, 0].max()) / 2; P[:, 1] -= (P[:, 1].min() + P[:, 1].max()) / 2; P *= H / P[:, 2].max()
me.vertices.foreach_set("co", P.ravel()); me.update()
x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x); WD = float(ax.max()); yc = float(np.median(y))

# ---------------------------------------------------- Knochen aus der Form ----------------------------------------------------
faeuste, fuesse = {}, {}
for S, sx in (("L", 1), ("R", -1)):
    seite = sx * x > 0
    f = P[seite & (ax > 0.55 * WD) & (z < 0.45 * H)]; faeuste[S] = f.mean(0) if len(f) else np.array([sx * 0.8 * WD, yc, 0.3 * H])
    b = P[seite & (ax < 0.45 * WD) & (z < 0.06 * H)]; fuesse[S] = b.mean(0) if len(b) else np.array([sx * 0.25 * WD, yc, 0.0])
SZ = 0.72 * H                                                                                       # Schulterhöhe
ARM = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(ARM)
bpy.context.view_layer.objects.active = ARM; bpy.ops.object.mode_set(mode="EDIT"); E = ARM.data.edit_bones
def knochen(n, k, e, el=None):
    b = E.new(n); b.head = Vector([float(v) for v in k]); b.tail = Vector([float(v) for v in e]); b.parent = E[el] if el else None; b.use_connect = False
knochen("wurzel", (0, yc, 0), (0, yc, 0.08 * H))
knochen("rumpf", (0, yc, 0.4 * H), (0, yc, SZ), "wurzel"); knochen("kopf", (0, yc - 0.05 * H, SZ), (0, yc - 0.1 * H, 0.95 * H), "rumpf")
for S, sx in (("L", 1), ("R", -1)):
    sch = np.array([sx * 0.4 * WD, yc, SZ]); fa = faeuste[S]; ell = (sch + fa) / 2 + np.array([sx * 0.08 * WD, 0.03 * H, 0])
    knochen("oberarm." + S, sch, ell, "rumpf"); knochen("unterarm." + S, ell, fa, "oberarm." + S)
    fu = fuesse[S]; knochen("bein." + S, (fu[0], fu[1], 0.4 * H), (fu[0], fu[1], 0.02), "wurzel")
bpy.ops.object.mode_set(mode="OBJECT"); KN = ARM.data.bones; namen = [b.name for b in KN]
WAFFE_PUNKTE = 0
if opt.get("waffe"):                                                                               # Waffe in die rechte Faust: Griff an der Faust, Kopf entlang des Unterarms weiter nach unten
    vor_ = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.abspath(opt["waffe"])); wo = [o for o in set(bpy.data.objects) - vor_ if o.type == "MESH"]
    for o in list(set(bpy.data.objects) - vor_):
        if o.type != "MESH": bpy.data.objects.remove(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in wo: o.select_set(True)
    bpy.context.view_layer.objects.active = wo[0]
    if len(wo) > 1: bpy.ops.object.join()
    w_ = bpy.context.view_layer.objects.active; w_.parent = None; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    Q = np.array([v.co[:] for v in w_.data.vertices]); Q[:, :2] -= Q[:, :2].mean(0); Q[:, 2] -= Q[:, 2].min(); Q *= float(opt.get("waffe_laenge", 2.0)) / Q[:, 2].max()
    ua = KN["unterarm.R"]; d_ = (ua.tail_local - ua.head_local).normalized(); rot = Vector((0, 0, 1)).rotation_difference(d_).to_matrix()
    fa = np.array(ua.tail_local); Q = np.array([tuple(rot @ Vector(q)) for q in Q]) + fa - np.array(tuple(rot @ Vector((0, 0, 0.12 * Q[:, 2].max()))))
    w_.data.vertices.foreach_set("co", Q.astype(np.float32).ravel()); w_.data.update()
    WAFFE_PUNKTE = len(w_.data.vertices)
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); w_.select_set(True); bpy.context.view_layer.objects.active = ob; bpy.ops.object.join(); me = ob.data
    P = np.array([v.co[:] for v in me.vertices], np.float32); x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x)

# ---------------------------------------------------- Gewichte ----------------------------------------------------
A = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A
t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
W = 1.0 / (D + 0.02 * H) ** 4
glatt = lambda v, a, b: np.clip((v - a) / (b - a), 0, 1)
for S, sx in (("L", 1), ("R", -1)):
    seite = (sx * x > 0).astype(np.float32); aussen = glatt(ax, 0.3 * WD, 0.42 * WD) * seite * glatt(-z, -0.9 * H, -0.8 * H)
    W[:, namen.index("oberarm." + S)] *= aussen; W[:, namen.index("unterarm." + S)] *= aussen
    W[:, namen.index("bein." + S)] *= seite * glatt(-z, -0.42 * H, -0.34 * H) * glatt(-ax, -0.52 * WD, -0.42 * WD)
W[:, namen.index("kopf")] *= glatt(z, 0.7 * H, 0.78 * H) * glatt(-ax, -0.34 * WD, -0.26 * WD)
W[:, namen.index("wurzel")] *= 0.0
if WAFFE_PUNKTE: W[-WAFFE_PUNKTE:] = 0; W[-WAFFE_PUNKTE:, namen.index("unterarm.R")] = 1   # die Waffe hängt ganz am Unterarm
K = np.array([e.vertices[:] for e in me.edges], int)
for _ in range(6):
    S_ = np.zeros_like(W); N_ = np.zeros(len(W), np.float32); np.add.at(S_, K[:, 0], W[K[:, 1]]); np.add.at(S_, K[:, 1], W[K[:, 0]]); np.add.at(N_, K[:, 0], 1); np.add.at(N_, K[:, 1], 1)
    W = 0.5 * W + 0.5 * S_ / np.maximum(N_, 1)[:, None]
W[W.sum(1) < 1e-9, namen.index("rumpf")] = 1; W /= W.sum(1, keepdims=True); W[W < 0.02] = 0; W /= W.sum(1, keepdims=True)
for k, n in enumerate(namen):
    g = ob.vertex_groups.new(name=n)
    for i in np.where(W[:, k] > 0)[0]: g.add([int(i)], float(W[i, k]), "REPLACE")
mod = ob.modifiers.new("skelett", "ARMATURE"); mod.object = ARM; ob.parent = ARM
ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"
print("Riese: Höhe", H, "m · Fäuste", {k: np.round(v, 2).tolist() for k, v in faeuste.items()}, "· Füße", {k: np.round(v, 2).tolist() for k, v in fuesse.items()})

# ---------------------------------------------------- Bewegungen ----------------------------------------------------
PB = ARM.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Zx = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def dreh(n, *schritte):
    R = KN[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def hoch(h): PB["wurzel"].location = (0, h, PB["wurzel"].location[2])
def vor(f): PB["wurzel"].location = (0, PB["wurzel"].location[1], f)                                # lokale z-Achse der Wurzel = nach vorn (-y)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
def weich(k, t):
    for (t0, *a), (t1, *b) in zip(k, k[1:]):
        if t0 <= t <= t1: u = (t - t0) / (t1 - t0); u = u * u * (3 - 2 * u); return [p + (q - p) * u for p, q in zip(a, b)]
    return k[-1][1:]
def ruhe(t):
    s = math.sin(2 * math.pi * t); hoch(0.006 * H * math.sin(4 * math.pi * t)); dreh("rumpf", (X, 2.5 * math.sin(4 * math.pi * t)), (Zx, 2 * s))
    dreh("kopf", (Zx, 10 * math.sin(2 * math.pi * t + 0.8)))
    for S, v in (("L", 1), ("R", -1)): dreh("oberarm." + S, (X, 5 * math.sin(2 * math.pi * t + v)))
def gehen(t):
    p = 2 * math.pi * t; hoch(0.02 * H * abs(math.sin(p))); dreh("rumpf", (Zx, 6 * math.sin(p)), (Y, 3 * math.sin(p)), (X, 4)); dreh("kopf", (Zx, -4 * math.sin(p)))
    dreh("bein.L", (X, 20 * math.sin(p))); dreh("bein.R", (X, -20 * math.sin(p)))
    dreh("oberarm.L", (X, -16 * math.sin(p))); dreh("oberarm.R", (X, 16 * math.sin(p)))
def faustschlag(t):                                                                                 # Arm hoch über den Kopf, niederschmettern auf den Boden vor sich
    arm, ell, rumpf, v = weich([(0, 0, 0, 0, 0), (0.4, -150, -40, -8, -0.02), (0.5, -150, -40, -8, -0.02), (0.6, -40, -5, 16, 0.08), (0.75, -35, -5, 14, 0.07), (1, 0, 0, 0, 0)], t)
    dreh("oberarm.R", (X, arm), (Y, -10 * min(1, -arm / 90))); dreh("unterarm.R", (X, ell)); dreh("rumpf", (X, rumpf), (Zx, -rumpf * 0.5)); vor(v * H)
    dreh("oberarm.L", (X, -rumpf * 1.2)); dreh("kopf", (X, -rumpf * 0.4))
def angriff(t):                                                                                      # Keulenschlag: Arm nur bis über die Schulter (weniger Dehnung am Rumpf), Rumpf holt mit aus
    arm, ell, rumpf, v = weich([(0, 0, 0, 0, 0), (0.4, -115, -30, -14, -0.03), (0.5, -115, -30, -14, -0.03), (0.6, -30, -5, 18, 0.1), (0.75, -25, -5, 15, 0.08), (1, 0, 0, 0, 0)], t)
    dreh("oberarm.R", (X, arm), (Y, -10 * min(1, -arm / 90))); dreh("unterarm.R", (X, ell)); dreh("rumpf", (X, rumpf), (Zx, -rumpf * 0.5)); vor(v * H)
    dreh("oberarm.L", (X, -rumpf * 1.2)); dreh("kopf", (X, -rumpf * 0.4))
def treffer(t):
    u = math.sin(math.pi * min(1.0, t / 0.9)) ** 1.5; dreh("rumpf", (X, -10 * u), (Zx, 8 * u)); dreh("kopf", (X, -15 * u)); vor(-0.05 * H * u)
    for S in "LR": dreh("oberarm." + S, (X, 12 * u))
def tod(t):                                                                                         # kippt nach hinten und bleibt liegen
    u = min(1.0, t / 0.7); u = u * u * (3 - 2 * u); d = max(0.0, (t - 0.7) / 0.3)
    dreh("wurzel", (X, -82 * u)); hoch(0.05 * H * u); dreh("kopf", (X, -10 * u + 15 * d))
    for S, v in (("L", 1), ("R", -1)): dreh("oberarm." + S, (X, -40 * u), (Y, v * 30 * u))
    dreh("bein.L", (X, 25 * u)); dreh("bein.R", (X, 10 * u))
def stampfen(t):                                                                                     # springt, beide Fäuste auf den Boden
    arm, sprung, rumpf = weich([(0, 0, 0, 0), (0.35, -105, 0.12, -10), (0.55, -105, 0.18, -10), (0.65, 30, 0.0, 22), (0.8, 25, -0.02, 20), (1, 0, 0, 0)], t)
    hoch(sprung * H); dreh("rumpf", (X, rumpf))
    for S in "LR": dreh("oberarm." + S, (X, arm)); dreh("unterarm." + S, (X, -20 if arm < 0 else 0))
    dreh("bein.L", (X, -15 * sprung / 0.18)); dreh("bein.R", (X, -15 * sprung / 0.18)); dreh("kopf", (X, -rumpf * 0.5))
def werfen(t):                                                                                       # Fels mit links über den Kopf und nach vorn werfen
    arm, rumpf, dz = weich([(0, 0, 0, 0), (0.3, 20, 4, 10), (0.5, -120, -14, -15), (0.58, -120, -14, -15), (0.7, -60, 18, 10), (1, 0, 0, 0)], t)
    dreh("oberarm.L", (X, arm), (Y, 10 * min(1, -arm / 90) if arm < 0 else 0)); dreh("rumpf", (X, rumpf), (Zx, dz)); dreh("kopf", (X, -rumpf * 0.5))
ALLE = {"ruhe": (ruhe, 48, True, {}), "gehen": (gehen, 32, True, {}), "faustschlag": (faustschlag, 20, False, {"treffer": 11}), "treffer": (treffer, 10, False, {}), "tod": (tod, 30, False, {"halten": 30}),
        "angriff": (angriff, 20, False, {"treffer": 11}), "stampfen": (stampfen, 24, False, {"treffer": 15}), "werfen": (werfen, 24, False, {"geschoss": 14})}
BEWEGUNGEN = {n: ALLE[n] for n in opt.get("bewegungen", "ruhe,gehen,faustschlag,treffer,tod").split(",")}
ARM.animation_data_create()
for name, (fn, n, schleife, mehr) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; ARM.animation_data.action = a
    for i in range(n + 1):
        nullen(); fn(i / n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = n + 1; a["rate"] = 24; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, n, "Bilder")
ARM.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1); ARM["hoehe"] = H
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ziel)); print("geschrieben:", ziel)
