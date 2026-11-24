"""Mythara Fabrik – ein Vierbeiner-Pet (Steinwesen, Hund …) aus einem Meshy-Modell: Skelett, Gewichte, Bewegungen.

  python3 fabrik/rig_vierbeiner.py -- <meshy.blend> <ziel.blend> [hoehe=0.9]

Erwartet: Kopf vorn (-y), Länge entlang y, vier Füße am Boden.
Knochen: wurzel – rumpf – kopf; wurzel – bein.VL/VR/HL/HR (vorn/hinten, links/rechts; je Bein ein steifer Knochen von der Hüfte zum Fuß).
Die Beine hängen an der Wurzel, nicht am Rumpf: wiegt sich der Rumpf, bleiben die Füße am Boden.
Gewichte nach Abstand zu den Knochen, je Bereich begrenzt (Beine nur unten in ihrem Viertel, Kopf nur vorn), über das Netz geglättet.
Bewegungen (24 Bilder/s im Spiel):
  ruhe   – wiegt sich gemächlich von Seite zu Seite, atmet, der Kopf nickt leicht
  laufen – Schritt auf vier Beinen (diagonal: vorn links mit hinten rechts), der Rumpf wippt und schaukelt
Ausgabe danach mit fabrik/export3d.py (der Körper heißt koerper, Ebene koerper).
"""
import math, sys
import numpy as np
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x); H = float(opt.get("hoehe", 0.9))
bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; ob.rotation_mode = "XYZ"
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data; P = np.array([v.co[:] for v in me.vertices], np.float32)
P[:, 2] -= P[:, 2].min(); P[:, 0] -= (P[:, 0].min() + P[:, 0].max()) / 2; P[:, 1] -= (P[:, 1].min() + P[:, 1].max()) / 2; P *= H / P[:, 2].max()
me.vertices.foreach_set("co", P.ravel()); me.update()
x, y, z = P[:, 0], P[:, 1], P[:, 2]

# ---------------------------------------------------- Knochen aus der Form ----------------------------------------------------
boden = P[z < 0.06 * H]; xc = float(np.median(boden[:, 0])); yc = float(np.median(boden[:, 1]))
fuesse = {}
for S, mx in (("L", boden[:, 0] > xc), ("R", boden[:, 0] <= xc)):
    for V_, my in (("V", boden[:, 1] < yc), ("H", boden[:, 1] >= yc)):
        f = boden[mx & my]; fuesse[V_ + S] = f.mean(0)
yv = float(y.min()); kopf_y = yv + 0.28 * (y.max() - yv)                                         # vorderes gutes Viertel: Kopf
ARM = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(ARM)
bpy.context.view_layer.objects.active = ARM; bpy.ops.object.mode_set(mode="EDIT"); E = ARM.data.edit_bones
def knochen(n, k, e, el=None):
    b = E.new(n); b.head = Vector(k); b.tail = Vector(e); b.parent = E[el] if el else None; b.use_connect = False
knochen("wurzel", (xc, yc, 0), (xc, yc, 0.08 * H))
knochen("rumpf", (xc, float(y.max()) - 0.15 * H, 0.5 * H), (xc, kopf_y, 0.55 * H), "wurzel")
knochen("kopf", (xc, kopf_y, 0.55 * H), (xc, yv, 0.6 * H), "rumpf")
for n, f in fuesse.items(): knochen("bein." + n, (f[0], f[1], 0.42 * H), (f[0], f[1], 0.02), "wurzel")
bpy.ops.object.mode_set(mode="OBJECT"); KN = ARM.data.bones; namen = [b.name for b in KN]

# ---------------------------------------------------- Gewichte ----------------------------------------------------
A = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A
t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
W = 1.0 / (D + 0.015) ** 4
for n, f in fuesse.items():                                                                     # Bein: nur unten und im eigenen Viertel
    k = namen.index("bein." + n); viertel = ((x > xc) == (n[1] == "L")) & ((y < yc) == (n[0] == "V"))
    W[:, k] *= viertel * np.clip((0.4 * H - z) / (0.1 * H), 0, 1)
W[:, namen.index("kopf")] *= np.clip((kopf_y + 0.04 * H - y) / (0.08 * H), 0, 1) * (z > 0.25 * H)
W[:, namen.index("wurzel")] *= 0.0
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
print("Vierbeiner: Höhe", H, "m · Füße", {k: np.round(v, 2).tolist() for k, v in fuesse.items()})

# ---------------------------------------------------- Bewegungen ----------------------------------------------------
PB = ARM.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
def dreh(n, *schritte):
    """um Achsen der Figur drehen (x: Breite, y: vorn–hinten, z: oben), im Raum des Knochens"""
    R = KN[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def hoch(h): PB["wurzel"].location = (0, h, 0)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
def ruhe(t):                                                                                    # gemächliches Wiegen
    s = math.sin(2 * math.pi * t); hoch(0.008 * H * math.sin(4 * math.pi * t))
    dreh("rumpf", ((0, 1, 0), 4.5 * s), ((0, 0, 1), 1.5 * s)); dreh("kopf", ((0, 1, 0), -3 * s), ((1, 0, 0), 3 * math.sin(2 * math.pi * t + 1.2)))
def laufen(t):                                                                                  # Schritt: diagonale Beinpaare im Wechsel
    p = 2 * math.pi * t; hoch(0.025 * H * abs(math.sin(p)))
    dreh("rumpf", ((0, 1, 0), 3.5 * math.sin(p)), ((1, 0, 0), 2 * math.sin(2 * p))); dreh("kopf", ((1, 0, 0), -3 * math.sin(2 * p)), ((0, 0, 1), 3 * math.sin(p)))
    for n, ph in (("VL", 0), ("HR", 0), ("VR", math.pi), ("HL", math.pi)): dreh("bein." + n, ((1, 0, 0), 24 * math.sin(p + ph)))
BEWEGUNGEN = {"ruhe": (ruhe, 48), "laufen": (laufen, 16)}                                     # bei 24 Bildern/s: 2 s Wiegen, 0,67 s je Doppelschritt
ARM.animation_data_create()
for name, (fn, n) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; ARM.animation_data.action = a
    for i in range(n + 1):
        nullen(); fn(i / n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = n + 1; a["rate"] = 24; a["schleife"] = True; print("Bewegung:", name, n, "Bilder")
ARM.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1); ARM["pet"] = True; ARM["hoehe"] = H
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
