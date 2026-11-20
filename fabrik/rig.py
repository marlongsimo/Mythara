"""Mythara Fabrik – einem Körpermodell das Humanoid-Skelett geben und die Grundbewegungen anlegen.

  python3 fabrik/rig.py <koerper.glb> <ziel.blend>

Erwartet das Modell ausgerichtet wie aus anmalen.py: 1,80 m hoch, Füße auf dem Boden, Blick nach -y, Arme leicht abgespreizt.
Ablauf: lose Splitter entfernen · Gelenke aus der Form des Modells schätzen · Skelett bauen · automatisch gewichten (mit Rückfallweg) ·
Bewegungen „ruhe“ und „laufen“ als Schleifen anlegen (an Ort und Stelle, Füße auf dem Boden).
Die Bewegungen sind gerechnet, nicht aufgenommen: einfache Schwingungen der Gelenke. Das reicht für kleine Spielfiguren und ist frei von Lizenzfragen.
"""
import math, sys
import numpy as np
import bpy
from mathutils import Quaternion, Vector

quelle, ziel = sys.argv[1], sys.argv[2]; H = 1.8
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o is not ob: bpy.data.objects.remove(o)

# ---------- lose Splitter weg: nur das größte zusammenhängende Stück bleibt ----------
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.mesh.separate(type="LOOSE"); bpy.ops.object.mode_set(mode="OBJECT")
stuecke = sorted([o for o in bpy.data.objects if o.type == "MESH"], key=lambda o: -len(o.data.vertices)); ob = stuecke[0]; entfernt = [len(o.data.vertices) for o in stuecke[1:]]
for o in stuecke[1:]: bpy.data.objects.remove(o)
ob.name = "koerper"; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.shade_smooth(); me = ob.data
print("Stücke:", len(stuecke), "· behalten:", len(me.vertices), "Punkte · entfernt:", entfernt or "nichts")
farbe = me.color_attributes[0].name if me.color_attributes else None
mat = bpy.data.materials.new("koerper"); mat.use_nodes = True; nt = mat.node_tree; nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
if farbe: f = nt.nodes.new("ShaderNodeVertexColor"); f.layer_name = farbe; nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
me.materials.clear(); me.materials.append(mat)

# ---------- Gelenke aus der Form schätzen ----------
P = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get("co", P); P = P.reshape(-1, 3); x, y, z = P[:, 0], P[:, 1], P[:, 2]
def tiefe(maske, sonst=0.0): return float(np.median(y[maske])) if maske.sum() > 20 else sonst
yr = tiefe((np.abs(x) < 0.12) & (z > 0.5 * H) & (z < 0.8 * H))                                   # Rumpfmitte in der Tiefe
yk = tiefe((np.abs(x) < 0.08) & (z > 0.9 * H), yr)                                                # Kopf
G = {}
for seite, s in (("L", 1), ("R", -1)):                                                            # L = linke Körperseite = +x (die Figur blickt nach -y)
    bein = (x * s > 0.02) & (z > 0.06 * H) & (z < 0.2 * H); bx = float(np.median(x[bein])); by = tiefe(bein, yr)
    hand = np.argsort(-x * s)[:300]; hx, hy, hz = [float(np.mean(P[hand, i])) for i in range(3)]  # die äußersten Punkte sind die Hand
    sx = s * 0.2; sz = 0.795 * H; schulter = Vector((sx, yr, sz)); spitze = Vector((hx, hy, hz)); gelenk = schulter.lerp(spitze, 0.82); ellbogen = schulter.lerp(gelenk, 0.5) + Vector((0, 0.02, 0))
    G[seite] = dict(huefte=Vector((bx, yr, 0.47 * H)), knie=Vector((bx, by - 0.02, 0.26 * H)), knoechel=Vector((bx, by + 0.02, 0.055 * H)), zehe=Vector((bx, by - 0.16, 0.01)),
                    schulter=schulter, ellbogen=ellbogen, hand=gelenk, spitze=spitze)
print("Gelenke: Beinabstand", round(abs(G["L"]["huefte"].x - G["R"]["huefte"].x), 2), "m · Hand links", [round(v, 2) for v in G["L"]["spitze"]], "· Hand rechts", [round(v, 2) for v in G["R"]["spitze"]])

# ---------- Skelett ----------
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); E = arm.data.edit_bones
def knochen(name, kopf, ende, eltern=None, fest=False):
    b = E.new(name); b.head = kopf; b.tail = ende; b.parent = E[eltern] if eltern else None; b.use_connect = fest; return b
knochen("becken", (0, yr, 0.47 * H), (0, yr, 0.56 * H)); knochen("bauch", (0, yr, 0.56 * H), (0, yr, 0.68 * H), "becken", True); knochen("brust", (0, yr, 0.68 * H), (0, yr, 0.82 * H), "bauch", True)
knochen("hals", (0, yr, 0.82 * H), (0, yk, 0.87 * H), "brust", True); knochen("kopf", (0, yk, 0.87 * H), (0, yk, 1.0 * H), "hals", True)
for S, g in G.items():
    knochen("oberarm." + S, g["schulter"], g["ellbogen"], "brust"); knochen("unterarm." + S, g["ellbogen"], g["hand"], "oberarm." + S, True); knochen("hand." + S, g["hand"], g["spitze"], "unterarm." + S, True)
    knochen("oberschenkel." + S, g["huefte"], g["knie"], "becken"); knochen("unterschenkel." + S, g["knie"], g["knoechel"], "oberschenkel." + S, True); knochen("fuss." + S, g["knoechel"], g["zehe"], "unterschenkel." + S, True)
bpy.ops.object.mode_set(mode="OBJECT")
# Befestigungspunkte für Ausrüstung (leere Objekte, an Knochen gehängt)
for name, bone in (("punkt.kopf", "kopf"), ("punkt.hand_r", "hand.R"), ("punkt.hand_l", "hand.L"), ("punkt.arm_l", "unterarm.L"), ("punkt.ruecken", "brust"), ("punkt.huefte", "becken")):
    p = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(p); p.parent = arm; p.parent_type = "BONE"; p.parent_bone = bone; p.empty_display_size = 0.05

# ---------- Gewichte ----------
def gewichtet(o): return sum(1 for v in o.data.vertices if any(g.weight > 0.01 for g in v.groups)) / len(o.data.vertices)
def anhaengen(o, art):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm; bpy.ops.object.parent_set(type=art)

# 1. Weg: Wärmeverteilung auf einer geschlossenen Ersatzhülle (das Netz aus dem Bild-zu-3D-Modell hat innere Flächen, daran scheitert sie oft), dann auf das Modell übertragen
huelle = ob.copy(); huelle.data = ob.data.copy(); huelle.name = "huelle"; bpy.context.collection.objects.link(huelle)
bpy.ops.object.select_all(action="DESELECT"); huelle.select_set(True); bpy.context.view_layer.objects.active = huelle
r = huelle.modifiers.new("neu", "REMESH"); r.mode = "VOXEL"; r.voxel_size = 0.014; bpy.ops.object.modifier_apply(modifier="neu")
anhaengen(huelle, "ARMATURE_AUTO"); gut = gewichtet(huelle); weg = None
if gut > 0.98:
    for b in arm.data.bones: ob.vertex_groups.new(name=b.name)
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    t = ob.modifiers.new("gewichte", "DATA_TRANSFER"); t.object = huelle; t.use_vert_data = True; t.data_types_verts = {"VGROUP_WEIGHTS"}; t.vert_mapping = "POLYINTERP_NEAREST"; bpy.ops.object.modifier_apply(modifier="gewichte")
    a = ob.modifiers.new("skelett", "ARMATURE"); a.object = arm; ob.parent = arm; weg = "automatisch (Wärmeverteilung über eine Ersatzhülle)"
bpy.data.objects.remove(huelle)
if weg is None or gewichtet(ob) < 0.98:                                                           # 2. Weg: Gewichte nach Abstand zu den Knochen, über das Netz geglättet
    for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
    namen = [b.name for b in arm.data.bones]; A = np.array([b.head_local for b in arm.data.bones], np.float32); B = np.array([b.tail_local for b in arm.data.bones], np.float32)
    AB = B - A; t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
    W = 1.0 / (D + 0.01) ** 4; W /= W.sum(1, keepdims=True); K = np.zeros((len(me.edges), 2), int); me.edges.foreach_get("vertices", K.ravel())
    for _ in range(12):                                                                          # glätten entlang der Kanten
        S_ = np.zeros_like(W); N_ = np.zeros(len(W), np.float32); np.add.at(S_, K[:, 0], W[K[:, 1]]); np.add.at(S_, K[:, 1], W[K[:, 0]]); np.add.at(N_, K[:, 0], 1); np.add.at(N_, K[:, 1], 1); W = 0.5 * W + 0.5 * S_ / np.maximum(N_, 1)[:, None]
    W[W < 0.03] = 0; W /= W.sum(1, keepdims=True)
    for k, name in enumerate(namen):
        g = ob.vertex_groups.new(name=name)
        for w in np.unique(np.round(W[:, k][W[:, k] > 0], 2)):
            if w > 0: g.add(np.where(np.round(W[:, k], 2) == w)[0].tolist(), float(w), "REPLACE")
    if not any(m.type == "ARMATURE" for m in ob.modifiers): a = ob.modifiers.new("skelett", "ARMATURE"); a.object = arm
    ob.parent = arm; weg = "nach Abstand zu den Knochen (Rückfall – die Wärmeverteilung ist gescheitert)"
anteil = gewichtet(ob); print("Gewichte:", weg, "·", round(anteil * 100, 1), "% der Punkte gewichtet")

# ---------- Bewegungen ----------
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)); grad = math.radians
def drehen(name, *schritte):
    """Drehungen um Achsen des Raums (nicht des Knochens), in Grad; die erste wirkt zuerst. Gilt zusätzlich zur Drehung des Elternknochens."""
    q = Quaternion()
    for achse, w in schritte: q = Quaternion(achse, grad(w)) @ q
    r = arm.data.bones[name].matrix_local.to_quaternion(); PB[name].rotation_quaternion = r.inverted() @ q @ r
def bild_setzen(name, nr):
    for b in PB:
        b.keyframe_insert("rotation_quaternion", frame=nr, group=b.name)
        if b.name == "becken": b.keyframe_insert("location", frame=nr, group=b.name)

def laufen(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p)
    PB["becken"].location = (0, 0.022 * math.cos(2 * p) - 0.022, 0)                               # leichtes Auf und Ab (Knochenachse y = nach oben)
    drehen("becken", (Z, 5 * s)); drehen("bauch", (Z, -4 * s), (X, -3)); drehen("brust", (Z, -5 * s)); drehen("hals", (Z, 3 * s)); drehen("kopf", (Z, 1 * s))
    for S, v in (("L", 1), ("R", -1)):                                                            # positiv um x = Bein nach hinten
        drehen("oberschenkel." + S, (X, -26 * s * v + 3)); drehen("unterschenkel." + S, (X, 6 + 42 * max(0.0, c * v) ** 1.3)); drehen("fuss." + S, (X, -8 * s * v))
        drehen("oberarm." + S, (Y, 24 * v), (X, 13 * s * v)); drehen("unterarm." + S, (X, -14 - 8 * max(0.0, -s * v))); drehen("hand." + S)

def ruhe(i, n):
    p = 2 * math.pi * i / n; s = math.sin(p)
    PB["becken"].location = (0, -0.004 * (1 - math.cos(p)), 0)
    drehen("becken"); drehen("bauch", (X, 1.2 * s)); drehen("brust", (X, 1.5 * s)); drehen("hals", (X, -1.5 * s)); drehen("kopf", (X, -1.0 * s))
    for S, v in (("L", 1), ("R", -1)):
        drehen("oberschenkel." + S); drehen("unterschenkel." + S, (X, 2)); drehen("fuss." + S)
        drehen("oberarm." + S, (Y, (18 + 1.5 * s) * v)); drehen("unterarm." + S, (X, -10 - 2 * s)); drehen("hand." + S)

arm.animation_data_create()
for name, fn, n in (("ruhe", ruhe, 6), ("laufen", laufen, 8)):
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a
    for i in range(n): fn(i, n); bild_setzen(name, i + 1)
    a["bilder"] = n; print("Bewegung:", name, n, "Bilder")
bpy.ops.object.mode_set(mode="OBJECT")
arm["gewichte"] = weg; arm["gewichtet"] = anteil
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
