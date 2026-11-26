"""Mythara Fabrik – Schildkröte (gepanzerter Vierbeiner, z. B. Mooshocker) aus einem texturierten Körpermodell: Skelett, Gewichte, Bewegungen.

  python3 fabrik/rig_schildkroete.py <koerper.glb> <ziel.blend> [hoehe=0.7]
Erwartet: Kopf vorn (−y), oben +z. Das Modell wird auf „hoehe“ (m) gebracht, Füße auf den Boden, mittig.
Skelett: becken (Wurzel) – panzer; hals – kopf (vorn); schwanz (hinten); je Bein oberbein – unterbein (vorn/hinten, links/rechts).
Gewichte fest nach Bereichen (die Wärmeverteilung scheitert an Panzern): Panzer und Bauchplatte starr am Panzer, Kopf/Hals vorn, Schwanz hinten,
Beine unter dem Panzerrand je Viertel; über das Netz geglättet. Kopf und Beine lassen sich so unter den Panzer ziehen (Verschiebung/Verkleinerung der Knochen).
Bewegungen (Namen fest): ruhe, gehen, kopfstoss, treffer, einrollen, tod.
"""
import json, math, sys
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Quaternion, Vector
quelle, zieldatei = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a); HZIEL = float(opt.get("hoehe", 0.7))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o is not ob: bpy.data.objects.remove(o)
me = ob.data; P = np.array([v.co[:] for v in me.vertices]); s = HZIEL / np.ptp(P[:, 2]); c = np.array([(P[:, 0].max() + P[:, 0].min()) / 2, (P[:, 1].max() + P[:, 1].min()) / 2, P[:, 2].min()])
P = (P - c) * s; me.vertices.foreach_set("co", P.ravel()); me.update(); ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"
x, y, z = P[:, 0], P[:, 1], P[:, 2]; H = float(z.max()); L0, L1 = float(y.min()), float(y.max()); LEN = L1 - L0; W = float(np.abs(x).max()); fr = (y - L0) / LEN
print(f"Maße: Höhe {H:.2f} m, Länge {LEN:.2f} m, Breite {2 * W:.2f} m")
# ---------- Bereiche ----------
ZB = 0.37 * H                                                                 # Unterkante des Panzerrands
fuss = {}
for sx in (1, -1):
    for vorn, (a_, b_) in ((True, (0.0, 0.5)), (False, (0.5, 1.0))):
        m_ = (x * sx > 0.25 * W) & (fr > a_) & (fr < b_) & (z < 0.12 * H)
        fuss[(sx, vorn)] = P[m_].mean(0) if m_.any() else np.array([sx * 0.7 * W, L0 + (0.25 if vorn else 0.75) * LEN, 0.02 * H])
kopfmask = (fr < 0.16) & (np.abs(x) < 0.45 * W) & (z > 0.25 * H)
halsmask = (fr >= 0.16) & (fr < 0.27) & (np.abs(x) < 0.35 * W) & (z > 0.28 * H) & (z < 0.62 * H)
schwanzmask = (fr > 0.86) & (z < 0.55 * H)
# ---------- Skelett ----------
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); E = arm.data.edit_bones
def knochen(n, a, b, el=None, fest=False): k = E.new(n); k.head = Vector(a); k.tail = Vector(b); k.parent = E[el] if el else None; k.use_connect = fest; return k
ym = L0 + 0.5 * LEN; kh = float(P[kopfmask, 2].mean()) if kopfmask.any() else 0.45 * H
knochen("becken", (0, ym + 0.1 * LEN, 0.45 * H), (0, ym, 0.45 * H)); knochen("panzer", (0, ym, 0.45 * H), (0, ym - 0.2 * LEN, 0.5 * H), "becken", True)
knochen("hals", (0, L0 + 0.3 * LEN, kh), (0, L0 + 0.15 * LEN, kh), "panzer"); knochen("kopf", (0, L0 + 0.15 * LEN, kh), (0, L0, kh), "hals", True)
knochen("schwanz", (0, L0 + 0.84 * LEN, 0.3 * H), (0, L1, 0.2 * H), "becken")
BEINE = []
for sx, S in ((1, "L"), (-1, "R")):
    for vorn, VN in ((True, "v"), (False, "h")):
        f = fuss[(sx, vorn)]; n = f"{VN}.{S}"; wurzel = (sx * 0.45 * W, f[1], 0.42 * H); knie = (sx * 0.78 * W, f[1], 0.2 * H)
        knochen("oberbein." + n, wurzel, knie, "becken"); knochen("unterbein." + n, knie, (f[0], f[1], 0.0), "oberbein." + n, True); BEINE.append((n, sx, vorn))
bpy.ops.object.mode_set(mode="OBJECT"); KN = arm.data.bones; ELTERN = {b.name: (b.parent.name if b.parent else None) for b in KN}
# ---------- Gewichte ----------
namen = [b.name for b in KN]; Wt = np.zeros((len(P), len(namen))); ix = {n: i for i, n in enumerate(namen)}
Wt[:, ix["panzer"]] = 1.0
def setzen(maske, wert, knochen_):
    w = np.clip(wert, 0, 1) * maske; Wt[:] *= (1 - w)[:, None]; Wt[:, ix[knochen_]] += w
setzen(halsmask, np.ones(len(P)), "hals"); setzen(kopfmask, np.ones(len(P)), "kopf"); setzen(schwanzmask, np.clip((fr - 0.86) / 0.05, 0, 1), "schwanz")
for n, sx, vorn in BEINE:
    f = fuss[(sx, vorn)]; d = np.hypot(x - f[0], y - f[1]); R = 0.17 * LEN
    w = np.clip((R - d) / (0.35 * R), 0, 1) * np.clip((ZB + 0.02 * H - z) / (0.08 * H), 0, 1) * (x * sx > 0.2 * W) * ~kopfmask
    knie_z = 0.2 * H; unten = np.clip((knie_z + 0.04 * H - z) / (0.08 * H), 0, 1)
    setzen(w > 0, w * (1 - unten), "oberbein." + n); setzen(w > 0, w * unten, "unterbein." + n)
K_ = np.zeros((len(me.edges), 2), int); me.edges.foreach_get("vertices", K_.ravel())
for _ in range(3):
    S_ = np.zeros_like(Wt); N_ = np.zeros(len(Wt)); np.add.at(S_, K_[:, 0], Wt[K_[:, 1]]); np.add.at(S_, K_[:, 1], Wt[K_[:, 0]]); np.add.at(N_, K_[:, 0], 1); np.add.at(N_, K_[:, 1], 1)
    Wt = 0.6 * Wt + 0.4 * S_ / np.maximum(N_, 1)[:, None]
Wt[Wt < 0.02] = 0; Wt /= Wt.sum(1, keepdims=True)
for k_, n in enumerate(namen):
    g = ob.vertex_groups.new(name=n)
    for w in np.unique(np.round(Wt[:, k_][Wt[:, k_] > 0], 2)):
        if w > 0: g.add(np.where(np.round(Wt[:, k_], 2) == w)[0].tolist(), float(w), "REPLACE")
a_ = ob.modifiers.new("skelett", "ARMATURE"); a_.object = arm; ob.parent = arm
print("Gewichte: Panzer", int((Wt[:, ix['panzer']] > 0.5).sum()), "Kopf/Hals", int(((Wt[:, ix['kopf']] + Wt[:, ix['hals']]) > 0.5).sum()), "Beine", int(sum((Wt[:, ix['oberbein.' + n]] + Wt[:, ix['unterbein.' + n]] > 0.5).sum() for n, _, _ in BEINE)))
# ---------- Bewegungen ----------
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)); RUHE = {b.name: b.matrix_local.to_quaternion() for b in KN}; ganz = {}
def setze(name, q): e = ELTERN[name]; lokal = (ganz[e].inverted() @ q) if e else q; r = RUHE[name]; PB[name].rotation_quaternion = r.inverted() @ lokal @ r; ganz[name] = q
def dreh(name, *schritte):
    q = Quaternion()
    for achse, w in schritte: q = Quaternion(achse, math.radians(w)) @ q
    e = ELTERN[name]; setze(name, (ganz[e] @ q) if e else q)
def spur(keys, t):
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1 or (t1, b) == keys[-1]: f = 0 if t1 == t0 else min(1.0, max(0.0, (t - t0) / (t1 - t0))); f = f * f * (3 - 2 * f); return a + (b - a) * f
def lage(name, welt):                                                         # Knochen im Raum verschieben (Welt-Vektor → Knochen-lokal)
    PB[name].location = KN[name].matrix_local.to_3x3().inverted() @ Vector(welt)
def haltung(neig=0.0, roll=0.0, gier=0.0, hoch=0.0, kopf_nick=0.0, kopf_ein=0.0, kopf_vor=0.0, beine=None, ein=0.0, schwanz=0.0):
    """neig: Panzer vorn runter (+); roll/gier: kippen/drehen; hoch: Körper heben (m); kopf_ein: 0..1 Kopf unter den Panzer; kopf_vor: Kopf nach vorn (m);
       beine: {name: (schwung°, heben°)}; ein: 0..1 Beine einziehen"""
    dreh("becken", (Z, gier), (Y, roll), (X, neig)); lage("becken", (0, 0, hoch)); dreh("panzer")
    dreh("hals", (X, kopf_nick * 0.5)); dreh("kopf", (X, kopf_nick * 0.5)); zurueck = kopf_ein * 0.17 * LEN - kopf_vor
    lage("hals", (0, zurueck, -kopf_ein * 0.03 * H)); PB["kopf"].scale = (1 - 0.15 * kopf_ein,) * 3
    dreh("schwanz", (X, schwanz), (Z, 0))
    for n, sx, vorn in BEINE:
        sw, hb = (beine or {}).get(n, (0.0, 0.0))
        dreh("oberbein." + n, (X, sw), (Y, -sx * (hb + 55 * ein))); dreh("unterbein." + n, (Y, sx * (hb * 1.3 + 40 * ein)))
        k = 1 - 0.7 * ein; PB["oberbein." + n].scale = (k, k, k); PB["unterbein." + n].scale = (1, 1 - 0.3 * ein, 1)
def ruhe(i, n):
    t = i / n; s = math.sin(2 * math.pi * t * 2); reib = spur([(0, 0.0), (0.55, 0.0), (0.65, 1.0), (0.75, -1.0), (0.85, 1.0), (0.95, 0.0), (1, 0.0)], t)
    haltung(hoch=0.006 * H * (1 + s), neig=-0.6 * s, gier=3.0 * reib, roll=1.5 * reib, kopf_nick=1.5 * s)
def gehen(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p)
    B_ = {}
    for nm, sx, vorn in BEINE:
        ph = s if (sx > 0) == vorn else -s; hub = max(0.0, (c if (sx > 0) == vorn else -c)) * 30
        B_[nm] = ((-1 if vorn else 1) * 30 * ph, hub)
    haltung(beine=B_, roll=2.5 * s, gier=1.5 * s, hoch=0.01 * H * abs(c), kopf_nick=2 * math.sin(2 * p), schwanz=4 * s)
def kopfstoss(i, n):
    t = i / (n - 1); vor = spur([(0, 0.0), (0.3, -0.06), (0.5, 0.12), (0.65, 0.09), (1, 0.0)], t) * LEN
    haltung(neig=spur([(0, 0.0), (0.3, -4.0), (0.5, 8.0), (0.7, 4.0), (1, 0.0)], t), kopf_vor=vor, kopf_nick=spur([(0, 0.0), (0.3, -10.0), (0.5, 12.0), (1, 0.0)], t),
            beine={nm: ((-1 if vorn else 1) * spur([(0, 0.0), (0.5, 8.0), (1, 0.0)], t), 0.0) for nm, sx, vorn in BEINE})
def treffer(i, n):
    t = i / (n - 1); zuck = spur([(0, 0.0), (0.25, 1.0), (0.6, 0.7), (1, 0.0)], t)
    haltung(kopf_ein=0.6 * zuck, ein=0.35 * zuck, neig=-5 * zuck, roll=3 * math.sin(t * 18) * (1 - t), hoch=-0.03 * H * zuck)
def einrollen(i, n):
    t = i / (n - 1); e = spur([(0, 0.0), (0.25, 1.0), (0.72, 1.0), (1, 0.0)], t)
    haltung(kopf_ein=e, ein=e, hoch=-(ZB - 0.04 * H) * e, schwanz=-20 * e)
def tod(i, n):
    t = i / (n - 1); e = spur([(0, 0.0), (0.2, 0.3), (0.8, 1.0), (1, 1.0)], t)
    haltung(kopf_ein=e, ein=e, hoch=-(ZB - 0.02 * H) * e, roll=4 * e, neig=2 * e, schwanz=-20 * e)
ALLE = {"ruhe": (ruhe, 24, 8, True, {}), "gehen": (gehen, 12, 8, True, {}), "kopfstoss": (kopfstoss, 10, 10, False, {"treffer": 5}),
        "treffer": (treffer, 5, 12, False, {}), "einrollen": (einrollen, 24, 10, False, {}), "tod": (tod, 10, 10, False, {"halten": 9})}
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in ALLE.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a
    for i in range(n):
        ganz.clear(); fn(i, n)
        for b in PB:
            b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name); b.keyframe_insert("location", frame=i + 1, group=b.name); b.keyframe_insert("scale", frame=i + 1, group=b.name)
    a["bilder"] = n; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print(f"Bewegung: {name} {n} Bilder · {n / rate:.2f} s")
bpy.ops.object.mode_set(mode="OBJECT"); arm.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1)
arm["hoehe"] = H; arm["tier"] = True
bpy.ops.wm.save_as_mainfile(filepath=zieldatei); print("geschrieben:", zieldatei)
