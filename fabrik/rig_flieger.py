"""Mythara Fabrik – ein fliegendes Tier (Adler, Drakling …) aus einem Meshy-Modell mit ausgebreiteten Flügeln: Skelett, Gewichte, Bewegungen.

  <blender-python> fabrik/rig_flieger.py -- <meshy.blend|glb> <ziel.blend> [spannweite=2.2] [flughoehe=1.4] [bewegungen=kreisen,sturzflug,landen,am_boden,angriff]
(zusätzlich zu den vier Grundbewegungen; sturzflug ersetzt sturz – für Hüter wie die Sturmschwinge)

Erwartet: Flügel ausgebreitet entlang x, Kopf nach -y, oben +z (Flugpose). Das Tier schwebt in flughoehe (Ruhelage in der Luft) wie der Moorrabe.
Knochen: wurzel – rumpf – kopf / schwanz; rumpf – fluegel.L/R – spitze.L/R (innerer und äußerer Flügel).
Gewichte nach Bereichen: Flügel nur seitlich des Rumpfs (innen bis 55 % der halben Spannweite, außen darüber), Kopf vorn, Schwanz hinten; geglättet.
Bewegungen (wie fabrik/rabe.py, 24 Bilder/s): fliegen (Schleife, Flügelschlag) · sturz (anlegen, herabstoßen, Treffer Bild 12 von 21, wieder hoch) ·
treffer · tod (trudelt zu Boden, bleibt liegen). Ausgabe danach mit fabrik/export3d.py.
"""
import json, math, os, sys
import numpy as np
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
SP, FH = float(opt.get("spannweite", 2.2)), float(opt.get("flughoehe", 1.4))
if quelle.endswith(".glb"): bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
else: bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; ob.parent = None
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data; P = np.array([v.co[:] for v in me.vertices], np.float32)
P[:, 0] -= (P[:, 0].min() + P[:, 0].max()) / 2; P[:, 1] -= (P[:, 1].min() + P[:, 1].max()) / 2; P[:, 2] -= (P[:, 2].min() + P[:, 2].max()) / 2
P *= SP / (P[:, 0].max() - P[:, 0].min()); P[:, 2] += FH
me.vertices.foreach_set("co", P.ravel()); me.update()
x, y, z = P[:, 0], P[:, 1], P[:, 2]; ax = np.abs(x); HS = SP / 2
mitte = ax < 0.12 * HS; ym0, ym1 = float(y[mitte].min()), float(y[mitte].max()); zr = float(np.median(z[mitte]))
ARM = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(ARM)
bpy.context.view_layer.objects.active = ARM; bpy.ops.object.mode_set(mode="EDIT"); E = ARM.data.edit_bones
def knochen(n, k, e, el=None):
    b = E.new(n); b.head = Vector([float(v) for v in k]); b.tail = Vector([float(v) for v in e]); b.parent = E[el] if el else None; b.use_connect = False
LG = ym1 - ym0
knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("rumpf", (0, ym0 + 0.65 * LG, zr), (0, ym0 + 0.3 * LG, zr), "wurzel")
knochen("kopf", (0, ym0 + 0.3 * LG, zr), (0, ym0, zr), "rumpf"); knochen("schwanz", (0, ym0 + 0.65 * LG, zr), (0, ym1, zr), "rumpf")
for S, sx in (("L", 1), ("R", -1)):
    knochen("fluegel." + S, (sx * 0.1 * HS, ym0 + 0.45 * LG, zr), (sx * 0.55 * HS, ym0 + 0.45 * LG, zr), "rumpf")
    knochen("spitze." + S, (sx * 0.55 * HS, ym0 + 0.45 * LG, zr), (sx * HS, ym0 + 0.5 * LG, zr), "fluegel." + S)
bpy.ops.object.mode_set(mode="OBJECT"); KN = ARM.data.bones; namen = [b.name for b in KN]
A = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A
t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
W = 1.0 / (D + 0.02 * SP) ** 4
glatt = lambda v, a, b: np.clip((v - a) / (b - a), 0, 1)
for S, sx in (("L", 1), ("R", -1)):
    seite = (sx * x > 0).astype(np.float32)
    W[:, namen.index("fluegel." + S)] *= seite * glatt(ax, 0.12 * HS, 0.2 * HS) * glatt(-ax, -0.62 * HS, -0.5 * HS)
    W[:, namen.index("spitze." + S)] *= seite * glatt(ax, 0.5 * HS, 0.6 * HS)
rumpf_zone = glatt(-ax, -0.2 * HS, -0.12 * HS)
W[:, namen.index("kopf")] *= rumpf_zone * glatt(-y, -(ym0 + 0.32 * LG), -(ym0 + 0.26 * LG))
W[:, namen.index("schwanz")] *= rumpf_zone * glatt(y, ym0 + 0.62 * LG, ym0 + 0.7 * LG)
W[:, namen.index("wurzel")] *= 0.0
K = np.array([e.vertices[:] for e in me.edges], int)
for _ in range(6):
    S_ = np.zeros_like(W); N_ = np.zeros(len(W), np.float32); np.add.at(S_, K[:, 0], W[K[:, 1]]); np.add.at(S_, K[:, 1], W[K[:, 0]]); np.add.at(N_, K[:, 0], 1); np.add.at(N_, K[:, 1], 1)
    W = 0.5 * W + 0.5 * S_ / np.maximum(N_, 1)[:, None]
W[W.sum(1) < 1e-9, namen.index("rumpf")] = 1; W /= W.sum(1, keepdims=True); W[W < 0.02] = 0; W /= W.sum(1, keepdims=True)
for k, n in enumerate(namen):
    g = ob.vertex_groups.new(name=n)
    for i in np.where(W[:, k] > 0)[0]: g.add([int(i)], float(W[i, k]), "REPLACE")
mod = ob.modifiers.new("skelett", "ARMATURE"); mod.object = ARM; ob.parent = ARM; ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"
print("Flieger: Spannweite", SP, "m · Flughöhe", FH, "m · Länge", round(LG, 2), "m")
PB = ARM.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Zx = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def dreh(n, *schritte):
    R = KN[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def ort(v): PB["wurzel"].location = (v[0], v[2], -v[1])                                             # Wurzel zeigt nach oben: lokal (x, y=oben, z=hinten)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
def schlag(t, k=1.0): return math.sin(2 * math.pi * k * t)
def fluegel(auf, spitze, zurueck=0.0):
    for S, sx in (("L", 1), ("R", -1)): dreh("fluegel." + S, (Y, -sx * auf), (Zx, sx * zurueck)); dreh("spitze." + S, (Y, -sx * spitze))
def fliegen(t):
    s = schlag(t); fluegel(5 + 32 * s, 15 * schlag(t - 0.12)); ort((0, 0, -0.05 * FH * s)); dreh("rumpf", (X, 3 * s)); dreh("schwanz", (X, -6 * s)); dreh("kopf", (X, -3 * s))
def sturz(t):
    w = math.sin(math.pi * min(1.0, t / 0.75)); an = math.sin(math.pi * min(1.0, t / 0.6))
    fluegel(15 * an + (35 * schlag(t, 2) if t > 0.6 else 0), -10 * an, -45 * an); dreh("rumpf", (X, 40 * an - 20 * max(0.0, (t - 0.55) / 0.45) * an))
    ort((0, -0.35 * FH * w, -0.6 * FH * w)); dreh("kopf", (X, -15 * an)); dreh("schwanz", (X, 10 * an))
def treffer(t):
    w = math.sin(math.pi * t); fluegel(10 + 45 * w, 25 * w, 10 * w); ort((0, 0.1 * w, 0.05 * w)); dreh("rumpf", (X, -20 * w), (Y, 12 * w)); dreh("kopf", (X, 18 * w))
def tod(t):
    f = min(1.0, t / 0.7); g = f * f; fluegel(10 + 25 * math.sin(6 * math.pi * f) * (1 - f) - 10 * f, -20 * f, -10 * f)
    ort((0, 0, -(FH - 0.1 * SP) * g)); dreh("rumpf", (Y, 160 * f), (X, 15 * f)); dreh("kopf", (X, 25 * f)); dreh("schwanz", (X, -10 * f))
UNTEN = 0.93 * float(P[:, 2].min())                                                                   # tiefster Punkt in der Flugpose → am Boden um so viel absenken
def landen(t):                                                                                      # aus der Luft auf den Boden: Flügel bremsen, Beine vor, absetzen, Flügel anlegen
    u = 1 - (1 - min(1.0, t / 0.8)) ** 2; ort((0, 0, -UNTEN * u)); fluegel(25 * schlag(t, 2.5) * (1 - u) + 40 * (1 - u) - 30 * max(0.0, (t - 0.8) / 0.2), -20 * u, 15 * u)
    dreh("rumpf", (X, -20 * math.sin(math.pi * u))); dreh("kopf", (X, 10 * u))
def am_boden(t):                                                                                    # steht am Boden, Flügel halb angelegt, Kopf dreht sich
    ort((0, 0, -UNTEN + 0.01 * FH * schlag(t, 2))); fluegel(-30, -25, 20); dreh("kopf", (Zx, 25 * schlag(t)), (X, 5 * schlag(t, 2))); dreh("schwanz", (X, 4 * schlag(t, 2)))
def angriff(t):                                                                                     # am Boden: Flügel aufreißen, mit dem Schnabel nach vorn hacken (Treffer Bild 11 von 21)
    a = math.sin(math.pi * min(1.0, t / 0.5)) if t < 0.5 else 0.0; h = math.sin(math.pi * min(1.0, max(0.0, (t - 0.4) / 0.4)))
    ort((0, -0.15 * FH * h, -UNTEN)); fluegel(-30 + 75 * a, -25 + 40 * a, 20 - 30 * a); dreh("rumpf", (X, -15 * a + 25 * h)); dreh("kopf", (X, -20 * a + 35 * h))
def kreisen(t):                                                                                     # Kreisen: Gleitflug in leichter Schräglage, selten ein Flügelschlag
    fluegel(8 + 6 * schlag(t) + 30 * max(0.0, schlag(t, 1)) * (t > 0.75), 6 * schlag(t - 0.1)); dreh("rumpf", (Y, -18), (X, 3 * schlag(t))); dreh("kopf", (Zx, -10)); ort((0, 0, -0.04 * FH * schlag(t)))
BW = {"fliegen": (fliegen, 24, True, {}), "sturz": (sturz, 20, False, {"treffer": 12}), "treffer": (treffer, 10, False, {}), "tod": (tod, 30, False, {"halten": 30})}
EXTRA = [b for b in opt.get("bewegungen", "").split(",") if b]                                      # zusätzliche Bewegungen (Sturmschwinge): kreisen, sturzflug, landen, am_boden, angriff
ZUSATZ = {"kreisen": (kreisen, 32, True, {}), "sturzflug": (sturz, 20, False, {"treffer": 12}), "landen": (landen, 24, False, {"halten": 24}),
          "am_boden": (am_boden, 32, True, {}), "angriff": (angriff, 20, False, {"treffer": 11})}
for b in EXTRA: BW[b] = ZUSATZ[b]
if "sturzflug" in EXTRA: del BW["sturz"]
ARM.animation_data_create()
for name, (fn, n, schleife, mehr) in BW.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; ARM.animation_data.action = a
    for i in range(n + 1):
        nullen(); fn(i / n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = n + 1; a["rate"] = 24; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, n, "Bilder")
ARM.animation_data.action = bpy.data.actions["fliegen"]; bpy.context.scene.frame_set(1); ARM["hoehe"] = FH
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ziel)); print("geschrieben:", ziel)
