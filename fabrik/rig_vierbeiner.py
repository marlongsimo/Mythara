"""Mythara Fabrik – ein Vierbeiner-Pet (Steinwesen, Hund …) aus einem Meshy-Modell: Skelett, Gewichte, Bewegungen.

  python3 fabrik/rig_vierbeiner.py -- <meshy.blend> <ziel.blend> [hoehe=0.9] [bein=0.42] [hals=1] [schwanz=1] [bewegungen=ruhe,laufen]

Optionen: bein = Hüfthöhe als Anteil der Höhe (Kuh: 0,5); hals = eigener Halsknochen zwischen Rumpf und Kopf (Kopf zum Boden senken);
schwanz = Schwanzknochen hinten; fluegel = Flügelknochen an den Schultern (Boden-Drache: angelegt, beim Angriff zum Drohen gespreizt); bewegungen aus: ruhe (wiegen), laufen, fressen (als ruhe: Kopf runter, kauen), gehen, angriff (Kopfstoß), treffer (zuckt zurück, 0,4 s), tod (kippt zur Seite), freude (Pet beim Fund: zwei Hüpfer, 1 s, einmal).

Erwartet: Kopf vorn (-y), Länge entlang y, vier Füße am Boden.
Knochen: wurzel – rumpf – kopf; wurzel – bein.VL/VR/HL/HR (vorn/hinten, links/rechts; je Bein ein steifer Knochen von der Hüfte zum Fuß).
Die Beine hängen an der Wurzel, nicht am Rumpf: wiegt sich der Rumpf, bleiben die Füße am Boden.
Gewichte nach Abstand zu den Knochen, je Bereich begrenzt (Beine nur unten in ihrem Viertel, Kopf nur vorn), über das Netz geglättet.
Bewegungen (24 Bilder/s im Spiel):
  ruhe   – wiegt sich gemächlich von Seite zu Seite, atmet, der Kopf nickt leicht
  laufen – Schritt auf vier Beinen (diagonal: vorn links mit hinten rechts), der Rumpf wippt und schaukelt
Ausgabe danach mit fabrik/export3d.py (der Körper heißt koerper, Ebene koerper).
"""
import json, math, sys
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
yv = float(y.min()); LG = float(y.max()) - yv; kopf_y = yv + 0.28 * LG                                  # vorderes gutes Viertel: Kopf
BEIN = float(opt.get("bein", 0.42)); HALS = opt.get("hals") == "1"; SCHWANZ = opt.get("schwanz") == "1"; FLUEGEL = opt.get("fluegel") == "1"
WB = float(np.abs(x).max())                                                                          # halbe Breite (Spannweite bei Flügeln)
if HALS: hals_y = yv + 0.3 * LG; kopf_y = yv + 0.14 * LG
ARM = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(ARM)
bpy.context.view_layer.objects.active = ARM; bpy.ops.object.mode_set(mode="EDIT"); E = ARM.data.edit_bones
def knochen(n, k, e, el=None):
    b = E.new(n); b.head = Vector(k); b.tail = Vector(e); b.parent = E[el] if el else None; b.use_connect = False
knochen("wurzel", (xc, yc, 0), (xc, yc, 0.08 * H))
if HALS:                                                                                         # langer Hals (Kuh): Rumpf – Hals – Kopf, der Kopf sitzt hoch vorn
    knochen("rumpf", (xc, float(y.max()) - 0.15 * LG, 0.65 * H), (xc, hals_y, 0.7 * H), "wurzel")
    knochen("hals", (xc, hals_y, 0.7 * H), (xc, kopf_y, 0.8 * H), "rumpf")
    knochen("kopf", (xc, kopf_y, 0.8 * H), (xc, yv, 0.68 * H), "hals")
else:
    knochen("rumpf", (xc, float(y.max()) - 0.15 * H, 0.5 * H), (xc, kopf_y, 0.55 * H), "wurzel")
    knochen("kopf", (xc, kopf_y, 0.55 * H), (xc, yv, 0.6 * H), "rumpf")
if SCHWANZ: knochen("schwanz", (xc, float(y.max()) - 0.02 * LG, 0.82 * H), (xc, float(y.max()), 0.35 * H), "rumpf")
for n, f in fuesse.items(): knochen("bein." + n, (f[0], f[1], BEIN * H), (f[0], f[1], 0.02), "wurzel")
if FLUEGEL:                                                                                      # Flügel (Boden-Drache): Ansatz an den Schultern, ausgebreitet wie im Modell
    fl = P[np.abs(x) > 0.5 * WB]; fy = float(np.median(fl[:, 1])) if len(fl) else kopf_y; fz = float(np.median(fl[:, 2])) if len(fl) else 0.8 * H
    for S, sx in (("L", 1), ("R", -1)): knochen("fluegel." + S, (xc + sx * 0.18 * WB, fy, 0.72 * H), (xc + sx * WB, fy, fz), "rumpf")
bpy.ops.object.mode_set(mode="OBJECT"); KN = ARM.data.bones; namen = [b.name for b in KN]

# ---------------------------------------------------- Gewichte ----------------------------------------------------
A = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A
t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
W = 1.0 / (D + 0.015) ** 4
for n, f in fuesse.items():                                                                     # Bein: nur unten und im eigenen Viertel
    k = namen.index("bein." + n); viertel = ((x > xc) == (n[1] == "L")) & ((y < yc) == (n[0] == "V"))
    W[:, k] *= viertel * np.clip(((BEIN - 0.02) * H - z) / (0.1 * H), 0, 1)
W[:, namen.index("kopf")] *= np.clip((kopf_y + 0.04 * H - y) / (0.08 * H), 0, 1) * (z > 0.25 * H)
if HALS: W[:, namen.index("hals")] *= np.clip((hals_y + 0.04 * H - y) / (0.08 * H), 0, 1) * (z > 0.45 * H)
if SCHWANZ: W[:, namen.index("schwanz")] *= np.clip((y - (float(y.max()) - 0.035 * LG)) / (0.01 * LG), 0, 1)   # nur der hängende Schwanz hinter dem Rumpf
if FLUEGEL:
    for S, sx in (("L", 1), ("R", -1)): W[:, namen.index("fluegel." + S)] *= ((x - xc) * sx > 0) * np.clip((np.abs(x - xc) - 0.22 * WB) / (0.08 * WB), 0, 1) * (z > 0.5 * H)
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
def kopf_runter(g):                                                                              # Kopf zum Boden: mit Hals über den Hals, sonst über den Kopf
    if HALS: dreh("hals", ((1, 0, 0), g)); dreh("kopf", ((1, 0, 0), g * 0.45))
    else: dreh("kopf", ((1, 0, 0), g))
def vor(f): PB["wurzel"].location = (0, PB["wurzel"].location[1], f)                             # lokale z-Achse des Wurzelknochens = nach vorn (-y)
def fressen(t):                                                                                 # grasen: Kopf unten, kauen, ab und zu ein Schwanzschlag
    kau = 3 * math.sin(2 * math.pi * 4 * t)
    if HALS: dreh("hals", ((1, 0, 0), 80 + kau)); dreh("kopf", ((1, 0, 0), -28 + kau))                 # Hals tief, der Kopf richtet sich auf: das Maul zeigt nach vorn unten ins Gras
    else: kopf_runter(40 + kau)
    dreh("rumpf", ((1, 0, 0), 5), ((0, 1, 0), 1.5 * math.sin(2 * math.pi * t)))
    if SCHWANZ: dreh("schwanz", ((0, 1, 0), 14 * math.sin(2 * math.pi * 2 * t) * max(0.0, math.sin(2 * math.pi * t))))
def gehen(t):                                                                                   # ruhiger Schritt, diagonale Beinpaare
    p = 2 * math.pi * t; hoch(0.012 * H * abs(math.sin(p)))
    dreh("rumpf", ((0, 1, 0), 2 * math.sin(p))); kopf_runter(6 + 3 * math.sin(2 * p))
    for n, ph in (("VL", 0), ("HR", 0), ("VR", math.pi), ("HL", math.pi)): dreh("bein." + n, ((1, 0, 0), 20 * math.sin(p + ph)))
    if SCHWANZ: dreh("schwanz", ((0, 1, 0), 8 * math.sin(p)))
def angriff(t):                                                                                 # Kopfstoß: Kopf senken, zurücknehmen – vorstoßen mit dem Kopf voran – zurück
    k = [(0, 0, 0, 0), (0.35, 40, -0.06, -6), (0.5, -12, 0.22, 8), (0.62, -6, 0.18, 6), (1, 0, 0, 0)]
    for (t0, g0, v0, r0), (t1, g1, v1, r1) in zip(k, k[1:]):
        if t0 <= t <= t1: u = (t - t0) / (t1 - t0); u = u * u * (3 - 2 * u); g, v, r = g0 + (g1 - g0) * u, v0 + (v1 - v0) * u, r0 + (r1 - r0) * u; break
    kopf_runter(g); vor(v * H); dreh("rumpf", ((1, 0, 0), r))
    for n in ("VL", "VR"): dreh("bein." + n, ((1, 0, 0), -r * 2))
    for n in ("HL", "HR"): dreh("bein." + n, ((1, 0, 0), r * 2.5))
def treffer(t):                                                                                 # getroffen: Kopf hoch und zur Seite, Ruck zurück, Hinterbeine knicken kurz ein
    u = math.sin(math.pi * min(1.0, t / 0.9)) ** 1.5
    kopf_runter(-22 * u); dreh("kopf", ((0, 0, 1), 18 * u)) if not HALS else dreh("hals", ((1, 0, 0), -22 * u), ((0, 0, 1), 14 * u))
    vor(-0.06 * H * u); dreh("rumpf", ((1, 0, 0), -5 * u), ((0, 1, 0), 4 * u)); hoch(-0.03 * H * u)
    for n in ("HL", "HR"): dreh("bein." + n, ((1, 0, 0), -10 * u))
    if SCHWANZ: dreh("schwanz", ((1, 0, 0), -25 * u))
def tod(t):                                                                                     # kippt zur Seite und bleibt liegen
    u = min(1.0, t / 0.7); u = u * u * (3 - 2 * u); d = max(0.0, (t - 0.7) / 0.3)
    dreh("wurzel", ((0, 1, 0), 86 * u)); hoch(0.17 * H * u); kopf_runter(-10 * u + 20 * d)
    for n in ("VL", "HL"): dreh("bein." + n, ((0, 1, 0), -12 * u))
    for n in ("VR", "HR"): dreh("bein." + n, ((0, 1, 0), 10 * u))
def freude(t):                                                                                  # Freude (Pet beim Fund): zwei kleine Hüpfer, Kopf hoch, Schwanz wedelt – einmal, 1 s
    u = math.sin(math.pi * t); h = abs(math.sin(2 * math.pi * t)); hoch(0.09 * H * h * u)
    kopf_runter(-14 * u); dreh("rumpf", ((1, 0, 0), -6 * h * u), ((0, 1, 0), 4 * math.sin(4 * math.pi * t) * u))
    for n in ("VL", "VR"): dreh("bein." + n, ((1, 0, 0), -22 * h * u))
    for n in ("HL", "HR"): dreh("bein." + n, ((1, 0, 0), 14 * h * u))
    if SCHWANZ: dreh("schwanz", ((0, 1, 0), 25 * math.sin(2 * math.pi * 4 * t) * u))
def flug(f, schlag=0.0):                                                                             # Flügel: 1 = angelegt (Ruhe, Gehen), 0 = gespreizt (Drohen beim Angriff)
    if not FLUEGEL: return
    for S, sx in (("L", 1), ("R", -1)): dreh("fluegel." + S, ((0, 1, 0), sx * (55 * f - schlag)), ((0, 0, 1), -sx * 35 * f))
def mit_fluegeln(fn, f_fn):
    def g(t): fn(t); flug(*f_fn(t))
    return g
ALLE = {"ruhe": (ruhe, 48, True, {}), "laufen": (laufen, 16, True, {}), "fressen": (fressen, 72, True, {}), "gehen": (gehen, 32, True, {}),
        "angriff": (angriff, 20, False, {"treffer": 10}), "treffer": (treffer, 10, False, {}), "tod": (tod, 30, False, {"halten": 30}), "freude": (freude, 24, False, {})}
if FLUEGEL:                                                                                      # angelegt beim Ruhen/Gehen/Laufen/Treffer/Tod, beim Angriff gespreizt und drohend geschlagen
    for n_, ff in (("ruhe", lambda t: (1.0, 4 * math.sin(2 * math.pi * t))), ("gehen", lambda t: (1.0, 0)), ("laufen", lambda t: (0.9, 6 * math.sin(4 * math.pi * t))),
                   ("angriff", lambda t: (max(0.0, 1 - 2.5 * math.sin(math.pi * t)), 25 * math.sin(3 * math.pi * t) * math.sin(math.pi * t))), ("treffer", lambda t: (1.0, -10 * math.sin(math.pi * t))), ("tod", lambda t: (1.0 - 0.6 * t, 0))):
        fn_, n__, sch_, mehr_ = ALLE[n_]; ALLE[n_] = (mit_fluegeln(fn_, ff), n__, sch_, mehr_)
AUSWAHL = opt.get("bewegungen", "ruhe,laufen").split(",")
BEWEGUNGEN = {("ruhe" if n == "fressen" else n): ALLE[n] for n in AUSWAHL}                       # fressen ist die Ruhe der Weidetiere
ARM.animation_data_create()
for name, (fn, n, schleife, mehr) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; ARM.animation_data.action = a
    for i in range(n + 1):
        nullen(); fn(i / n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = n + 1; a["rate"] = 24; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, n, "Bilder")
ARM.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1); ARM["pet"] = True; ARM["hoehe"] = H
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
