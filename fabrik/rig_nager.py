"""Mythara Fabrik – ein sitzender Nager (Eichhörnchen-Pet) aus einem Meshy-Modell: Skelett, Gewichte, Bewegungen.

  python3 fabrik/rig_nager.py -- <meshy.blend> <ziel.blend> [hoehe=0.9]

Erwartet: Gesicht nach -y, sitzend, die Pfoten halten etwas vor der Brust (Nuss), buschiger Schwanz hinten (+y).
Knochen: wurzel – becken – brust – kopf; brust – pfoten (mit der Nuss); becken – hinterbein.L/R; becken – schwanz.1–4 (die Kette folgt dem Schwanz).
Gewichte nach Abstand zu den Knochen, je Körperbereich begrenzt (Schwanzknochen nur am Schwanz, Kopf nur oben), über das Netz geglättet.
Bewegungen (24 Bilder/s im Spiel):
  ruhe   – nagt an der Nuss: Kopf nickt in kurzen Bissen zur Nuss, die Pfoten heben sie an, der Schwanz wiegt sich
  laufen – tapselt hinterher: kleine Hüpfer, vorgebeugt, Hinterbeine stoßen ab, der Schwanz wedelt kräftig
Ausgabe für das Spiel danach mit fabrik/export3d.py (der Körper heißt koerper, Ebene koerper).
"""
import json, math, sys
import numpy as np
import bpy
from mathutils import Matrix, Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x); H = float(opt.get("hoehe", 0.9))
bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; ob.rotation_mode = "XYZ"
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = ob.data; P = np.array([v.co[:] for v in me.vertices], np.float32)
P[:, 2] -= P[:, 2].min(); P[:, 0] -= (P[:, 0].min() + P[:, 0].max()) / 2; P[:, 1] -= (P[:, 1].min() + P[:, 1].max()) / 2; P *= H / P[:, 2].max()
me.vertices.foreach_set("co", P.ravel()); me.update()

# ---------------------------------------------------- Bereiche und Knochen aus der Form ----------------------------------------------------
x, y, z = P[:, 0], P[:, 1], P[:, 2]
schwanz = (y > 0.02 * H / 0.9) & (x > 0.0) & ~((z > 0.62 * H) & (y < 0.15 * H))                # der Schwanz steht hinten rechts (ohne Ohren und Zweige am Kopf)
koerper = ~schwanz
k_ = P[koerper & (z < 0.5 * H)]; xb, yb = float(np.median(k_[:, 0])), float(np.median(k_[:, 1]))
kopfp = P[koerper & (z > 0.62 * H)]; yk = float(kopfp[:, 1].mean())
vorn = P[koerper & (z > 0.25 * H) & (z < 0.52 * H) & (y < np.percentile(y[koerper], 18))]; nuss = vorn.mean(0)
T = P[schwanz]; zs = np.quantile(T[:, 2], [0.0, 0.25, 0.5, 0.75])
kette = [T[(T[:, 2] >= zs[i]) & (T[:, 2] < (zs[i + 1] if i < 3 else 9))].mean(0) for i in range(4)] + [T[T[:, 2] > np.quantile(T[:, 2], 0.95)].mean(0)]
fuesse = {}
for S, m in (("L", x > xb), ("R", x <= xb)):
    f_ = P[koerper & (z < 0.12 * H) & m & (y < yb + 0.05)]; fuesse[S] = f_.mean(0) if len(f_) else np.array([xb + (0.1 if S == "L" else -0.1), yb, 0.02])
arm_ob = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm_ob)
bpy.context.view_layer.objects.active = arm_ob; bpy.ops.object.mode_set(mode="EDIT"); E = arm_ob.data.edit_bones
def knochen(n, k, e, el=None):
    b = E.new(n); b.head = Vector(k); b.tail = Vector(e); b.parent = E[el] if el else None; b.use_connect = False; return b
V = lambda *a: Vector(a)
knochen("wurzel", V(xb, yb, 0), V(xb, yb, 0.08 * H))
knochen("becken", V(xb, yb, 0.1 * H), V(xb, yb, 0.42 * H), "wurzel")
knochen("brust", V(xb, yb, 0.42 * H), V(xb, yb - 0.03 * H, 0.6 * H), "becken")
knochen("kopf", V(xb, yk, 0.6 * H), V(xb, yk, 0.92 * H), "brust")
knochen("pfoten", V(xb, yb - 0.08 * H, 0.52 * H), V(*nuss), "brust")
for S, f in fuesse.items(): knochen("hinterbein." + S, V(f[0], f[1] + 0.1 * H, 0.22 * H), V(*f), "becken")
for i in range(4): knochen(f"schwanz.{i + 1}", V(*kette[i]), V(*kette[i + 1]), "becken" if i == 0 else f"schwanz.{i}")
bpy.ops.object.mode_set(mode="OBJECT"); KN = arm_ob.data.bones; namen = [b.name for b in KN]

# ---------------------------------------------------- Gewichte ----------------------------------------------------
A = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A
t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
W = 1.0 / (D + 0.015) ** 4
sw = np.array([n.startswith("schwanz") for n in namen]); W[:, sw] *= schwanz[:, None]   # Schwanzknochen nur am Schwanz, die übrigen dort kaum
W[np.ix_(schwanz, ~sw)] *= 0.02
W[:, namen.index("kopf")] *= np.clip((z - 0.5 * H) / (0.08 * H), 0, 1)                         # Kopf erst ab der Halshöhe
W[:, namen.index("pfoten")] *= np.clip((np.percentile(y[koerper], 35) - y) / (0.05 * H), 0, 1) * (z < 0.58 * H)   # Pfoten und Nuss: vorn vor der Brust
for S in "LR": W[:, namen.index("hinterbein." + S)] *= (z < 0.3 * H)
W[:, namen.index("wurzel")] *= 0.0
K = np.array([e.vertices[:] for e in me.edges], int)
for _ in range(6):                                                                              # über das Netz glätten
    S_ = np.zeros_like(W); N_ = np.zeros(len(W), np.float32); np.add.at(S_, K[:, 0], W[K[:, 1]]); np.add.at(S_, K[:, 1], W[K[:, 0]]); np.add.at(N_, K[:, 0], 1); np.add.at(N_, K[:, 1], 1)
    W = 0.5 * W + 0.5 * S_ / np.maximum(N_, 1)[:, None]
W[W.sum(1) < 1e-9, namen.index("becken")] = 1; W /= W.sum(1, keepdims=True); W[W < 0.02] = 0; W /= W.sum(1, keepdims=True)
for k, n in enumerate(namen):
    g = ob.vertex_groups.new(name=n); idx = np.where(W[:, k] > 0)[0]
    for i in idx: g.add([int(i)], float(W[i, k]), "REPLACE")
mod = ob.modifiers.new("skelett", "ARMATURE"); mod.object = arm_ob; ob.parent = arm_ob
ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"
print("Nager: Höhe", H, "m · Schwanzpunkte", int(schwanz.sum()), "· Nuss", np.round(nuss, 2).tolist())

# ---------------------------------------------------- Bewegungen ----------------------------------------------------
PB = arm_ob.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
def dreh(n, achse, grad):
    """um eine Achse der Figur (x: Breite, y: vorn–hinten, z: oben) drehen, im Raum des Knochens"""
    R = KN[n].matrix_local.to_quaternion(); q = Quaternion(Vector(achse), math.radians(grad)); PB[n].rotation_quaternion = R.inverted() @ q @ R
def hoch(h): PB["wurzel"].location = (0, h, 0)                                                 # der Wurzelknochen zeigt nach oben: lokale y-Achse
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
def ruhe(t):                                                                                    # nagen: drei kurze Bisse je Sekunde
    biss = max(0.0, math.sin(2 * math.pi * 3 * t)) ** 1.5
    dreh("brust", (1, 0, 0), 3 + 2 * math.sin(2 * math.pi * t)); dreh("kopf", (1, 0, 0), 10 + 9 * biss)
    dreh("pfoten", (1, 0, 0), -6 - 5 * biss)
    for i in range(4): dreh(f"schwanz.{i + 1}", (0, 1, 0), 3 * math.sin(2 * math.pi * t - i * 0.6))
def laufen(t):                                                                                  # tapseln: ein Hüpfer je Durchgang, der Schwanz wedelt doppelt so schnell
    s = math.sin(2 * math.pi * t); hoch(0.07 * H * max(0.0, s))
    dreh("becken", (1, 0, 0), 14 + 6 * s); dreh("kopf", (1, 0, 0), -10 - 4 * s); dreh("pfoten", (1, 0, 0), 6 * s)
    for S in "LR": dreh("hinterbein." + S, (1, 0, 0), 32 * math.cos(2 * math.pi * t))
    for i in range(4):
        q1 = Quaternion((0, 1, 0), math.radians(20 * math.sin(2 * math.pi * 2 * t - i * 0.8))); q2 = Quaternion((1, 0, 0), math.radians(-8))
        R = KN[f"schwanz.{i + 1}"].matrix_local.to_quaternion(); PB[f"schwanz.{i + 1}"].rotation_quaternion = R.inverted() @ (q1 @ q2) @ R
BEWEGUNGEN = {"ruhe": (ruhe, 24), "laufen": (laufen, 12)}                                     # Bilder je Durchgang bei 24 Bildern/s: 1 s nagen, 0,5 s je Hüpfer
arm_ob.animation_data_create()
for name, (fn, n) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm_ob.animation_data.action = a
    for i in range(n + 1):                                                                      # letztes Bild = erstes: die Schleife schließt ohne Sprung
        nullen(); fn(i / n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = n + 1; a["rate"] = 24; a["schleife"] = True; a["tempo"] = 1.0; print("Bewegung:", name, n, "Bilder")
arm_ob.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1); arm_ob["pet"] = True; arm_ob["hoehe"] = H
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
