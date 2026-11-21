"""Mythara Fabrik – Vierbeiner (Kröte, Frosch, Echse …) aus einem Körpermodell: Skelett, Gewichte, Maul, Zunge, Bewegungen.

  python3 fabrik/rig_tier.py <koerper.glb> <ziel.blend> <tier.json>

Erwartet das Modell wie aus anmalen.py: Füße auf dem Boden, Blick nach -y (Kopf vorn), oben = +z. Länge entlang y, Breite entlang x.
Ablauf:
  1. aufräumen: lose Splitter weg; eine mitgebaute Schattenplatte am Boden (dunkel, flach, abseits der Füße) entfernen
  2. Skelett aus der Form: becken (Wurzel) – rumpf – kopf; kiefer (Unterkiefer); zunge; je Seite Vorderbein (oberarm, unterarm, hand) und Hinterbein (oberschenkel, unterschenkel, fuss).
     Die Füße werden als tiefste Punkte je Viertel (vorn/hinten, links/rechts) gefunden.
  3. Gewichte automatisch (Wärmeverteilung über eine Ersatzhülle, wie rig.py); der Unterkiefer bekommt die Punkte unter der Maullinie vorn am Kopf.
  4. Mundraum (dunkelrot, sichtbar nur bei offenem Maul) und Zunge (Röhre, Farbe aus der Vorlage) werden ins Körpermodell gefügt.
  5. Bewegungen aus tier.json "bewegungen": ruhe, springen (Fortbewegung in Sprüngen, an Ort und Stelle), zunge (Angriff), tod.
Bewegungen mit Flugphase vermerken die Flugbilder unter "sprung"; dort darf (und soll) die Figur den Boden verlassen.

tier.json: { "bewegungen": [...], "maul": 0.42 (Höhe der Maullinie als Anteil der Körperhöhe), "zunge": {"farbe": "#rrggbb", "dicke": 0.05, "laenge": 1.1 (Reichweite in m)} }
"""
import json, math, sys
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Quaternion, Vector

quelle, zieldatei, liste = sys.argv[1], sys.argv[2], sys.argv[3]; T = json.load(open(liste))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o is not ob: bpy.data.objects.remove(o)
me = ob.data; FARBE = me.color_attributes[0].name if me.color_attributes else None

def punkte(m):
    P = np.zeros(len(m.vertices) * 3, np.float32); m.vertices.foreach_get("co", P); return P.reshape(-1, 3)
def farben(m):
    ca = m.color_attributes[FARBE]; roh = np.zeros(len(ca.data) * 4, np.float32); ca.data.foreach_get("color", roh); roh = roh.reshape(-1, 4)[:, :3]
    if ca.domain == "POINT": return roh
    e = np.zeros(len(m.loops), int); m.loops.foreach_get("vertex_index", e); aus = np.zeros((len(m.vertices), 3), np.float32); aus[e] = roh; return aus

# ---------------------------------------------------- 1. aufräumen ----------------------------------------------------
P = punkte(me); H = float(P[:, 2].max()); C = farben(me) if FARBE else np.ones((len(P), 3), np.float32)
viertel = [(sx, sy) for sx in (1, -1) for sy in (-1, 1)]; fuesse = {}
W0 = float(np.abs(P[:, 0]).max()); ym = float((P[:, 1].min() + P[:, 1].max()) / 2)
for sx, sy in viertel:                                                                            # tiefste Punkte je Viertel, nur außen (der Bauch liegt oft fast auf dem Boden) = Füße
    m_ = (P[:, 0] * sx > 0.45 * W0) & ((P[:, 1] - ym) * sy > 0.0); q = P[m_]; tief = q[q[:, 2] < np.quantile(q[:, 2], 0.02) + 0.01]; fuesse[(sx, sy)] = tief.mean(0)
hell = C.mean(1); fussnah = np.min([np.linalg.norm(P[:, :2] - f[:2], axis=1) for f in fuesse.values()], axis=0)
platte = (P[:, 2] < 0.035 * H) & (hell < np.quantile(hell, 0.15)) & (fussnah > 0.18 * H)             # Schatten, den das Bild-zu-3D-Modell als Fläche mitgebaut hat
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); bmesh.ops.delete(bm, geom=[v for v in bm.verts if platte[v.index]], context="VERTS"); bm.to_mesh(me); bm.free()
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.mesh.separate(type="LOOSE"); bpy.ops.object.mode_set(mode="OBJECT")
st = sorted([o for o in bpy.data.objects if o.type == "MESH"], key=lambda o: -len(o.data.vertices)); ob = st[0]
for o in st[1:]: bpy.data.objects.remove(o)
ob.name = "koerper"; me = ob.data; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.shade_smooth()
print(f"aufgeräumt: Schattenplatte {int(platte.sum())} Punkte, {len(st) - 1} lose Stücke entfernt · {len(me.vertices)} Punkte bleiben")
P = punkte(me); x, y, z = P[:, 0], P[:, 1], P[:, 2]; H = float(z.max()); L0, L1 = float(y.min()), float(y.max()); W = float(np.abs(x).max())
LAENGE = L1 - L0; print(f"Maße: Höhe {H:.2f} m, Länge {LAENGE:.2f} m, Breite {2 * W:.2f} m")

# ---------------------------------------------------- 2. Skelett ----------------------------------------------------
fv = {s: Vector(fuesse[(sx, -1)].tolist()) for s, sx in (("L", 1), ("R", -1))}; fh = {s: Vector(fuesse[(sx, 1)].tolist()) for s, sx in (("L", 1), ("R", -1))}
yb = L0 + 0.55 * LAENGE; MAUL = T.get("maul", 0.42) * H
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); E = arm.data.edit_bones
def knochen(name, kopf, ende, eltern=None, fest=False):
    b = E.new(name); b.head = Vector(kopf); b.tail = Vector(ende); b.parent = E[eltern] if eltern else None; b.use_connect = fest; return b
knochen("becken", (0, yb + 0.15 * LAENGE, 0.45 * H), (0, yb, 0.5 * H)); knochen("rumpf", (0, yb, 0.5 * H), (0, L0 + 0.3 * LAENGE, 0.58 * H), "becken", True)
knochen("kopf", (0, L0 + 0.3 * LAENGE, 0.58 * H), (0, L0 + 0.02 * LAENGE, 0.62 * H), "rumpf", True)
knochen("kiefer", (0, L0 + 0.32 * LAENGE, MAUL - 0.04 * H), (0, L0 + 0.03 * LAENGE, MAUL - 0.06 * H), "kopf")
knochen("zunge", (0, L0 + 0.22 * LAENGE, MAUL - 0.02 * H), (0, L0 + 0.08 * LAENGE, MAUL - 0.02 * H), "kopf")
for S, sx in (("L", 1), ("R", -1)):
    f = fv[S]; schulter = Vector((sx * 0.55 * W, L0 + 0.28 * LAENGE, 0.42 * H)); ellb = Vector((sx * 0.85 * W, (schulter.y + f.y) / 2, 0.28 * H)); hand = Vector((f.x, f.y + 0.03 * LAENGE, 0.06 * H))
    knochen("oberarm." + S, schulter, ellb, "rumpf"); knochen("unterarm." + S, ellb, hand, "oberarm." + S, True); knochen("hand." + S, hand, (f.x, f.y - 0.08 * LAENGE, 0.0), "unterarm." + S, True)
    f = fh[S]; huefte = Vector((sx * 0.5 * W, L0 + 0.72 * LAENGE, 0.38 * H)); knie = Vector((sx * 0.95 * W, L0 + 0.55 * LAENGE, 0.3 * H)); ferse = Vector((f.x, L0 + 0.86 * LAENGE, 0.07 * H))
    knochen("oberschenkel." + S, huefte, knie, "becken"); knochen("unterschenkel." + S, knie, ferse, "oberschenkel." + S, True); knochen("fuss." + S, ferse, (f.x, f.y - 0.04 * LAENGE, 0.0), "unterschenkel." + S, True)
bpy.ops.object.mode_set(mode="OBJECT"); KN = arm.data.bones; ELTERN = {b.name: (b.parent.name if b.parent else None) for b in KN}
print("Füße: vorn", [tuple(round(v, 2) for v in fv[s]) for s in "LR"], "· hinten", [tuple(round(v, 2) for v in fh[s]) for s in "LR"])

# ---------------------------------------------------- 3. Gewichte ----------------------------------------------------
def gewichtet(o): return sum(1 for v in o.data.vertices if any(g.weight > 0.01 for g in v.groups)) / len(o.data.vertices)
huelle = ob.copy(); huelle.data = ob.data.copy(); bpy.context.collection.objects.link(huelle); bpy.ops.object.select_all(action="DESELECT"); huelle.select_set(True); bpy.context.view_layer.objects.active = huelle
r = huelle.modifiers.new("neu", "REMESH"); r.mode = "VOXEL"; r.voxel_size = 0.025 * H; bpy.ops.object.modifier_apply(modifier="neu")   # gröber als beim Menschen: die Wärmeverteilung scheitert sonst am massigen Körper
bpy.ops.object.select_all(action="DESELECT"); huelle.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm; bpy.ops.object.parent_set(type="ARMATURE_AUTO")
for b in KN: ob.vertex_groups.new(name=b.name)
bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
t_ = ob.modifiers.new("gewichte", "DATA_TRANSFER"); t_.object = huelle; t_.use_vert_data = True; t_.data_types_verts = {"VGROUP_WEIGHTS"}; t_.vert_mapping = "POLYINTERP_NEAREST"; bpy.ops.object.modifier_apply(modifier="gewichte")
bpy.data.objects.remove(huelle); a_ = ob.modifiers.new("skelett", "ARMATURE"); a_.object = arm; ob.parent = arm; WEG = "automatisch (Wärmeverteilung über eine Ersatzhülle)"
if gewichtet(ob) < 0.98:                                                                          # Rückfall: Gewichte nach Abstand zu den Knochen, über das Netz geglättet (wie rig.py)
    for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
    A_ = np.array([b.head_local for b in KN], np.float32); B_ = np.array([b.tail_local for b in KN], np.float32); AB = B_ - A_
    tt = np.clip(((P[:, None, :] - A_[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A_[None] + tt[..., None] * AB[None]), axis=-1)
    namen = [b.name for b in KN]; aus = [namen.index(n_) for n_ in ("kiefer", "zunge")]; D[:, aus] = 9.0                       # Kiefer und Zunge bekommen ihre Punkte später gezielt
    Wt = 1.0 / (D + 0.02) ** 4; Wt /= Wt.sum(1, keepdims=True); K_ = np.zeros((len(me.edges), 2), int); me.edges.foreach_get("vertices", K_.ravel())
    for _ in range(10):
        S_ = np.zeros_like(Wt); N_ = np.zeros(len(Wt), np.float32); np.add.at(S_, K_[:, 0], Wt[K_[:, 1]]); np.add.at(S_, K_[:, 1], Wt[K_[:, 0]]); np.add.at(N_, K_[:, 0], 1); np.add.at(N_, K_[:, 1], 1); Wt = 0.5 * Wt + 0.5 * S_ / np.maximum(N_, 1)[:, None]
    Wt[Wt < 0.03] = 0; Wt /= Wt.sum(1, keepdims=True)
    for k_, n_ in enumerate(namen):
        g = ob.vertex_groups.new(name=n_)
        for w in np.unique(np.round(Wt[:, k_][Wt[:, k_] > 0], 2)):
            if w > 0: g.add(np.where(np.round(Wt[:, k_], 2) == w)[0].tolist(), float(w), "REPLACE")
    WEG = "nach Abstand zu den Knochen (Rückfall – die Wärmeverteilung ist gescheitert)"
print("Gewichte:", WEG)
# Unterkiefer: Punkte vorn am Kopf unterhalb der Maullinie (weich überblendet), nicht an den Vorderbeinen
gw = {g.name: g for g in ob.vertex_groups}; idx = {g.index: g.name for g in ob.vertex_groups}
vorne = np.clip((L0 + 0.3 * LAENGE - y) / (0.08 * LAENGE), 0, 1); unten = np.clip((MAUL - z) / (0.06 * H), 0, 1); breit = np.clip((0.75 * W - np.abs(x)) / (0.1 * W), 0, 1)
bein = np.zeros(len(P), np.float32)
for v in me.vertices:
    bein[v.index] = sum(g.weight for g in v.groups if idx[g.group].split(".")[0] in ("oberarm", "unterarm", "hand"))
k = vorne * unten * breit * np.clip(1 - 2 * bein, 0, 1) * (z > 0.08 * H)
for i in np.where(k > 0.02)[0]:
    w = float(k[i]); v = me.vertices[int(i)]
    for g in v.groups: g.weight *= (1 - w)
    gw["kiefer"].add([int(i)], w, "REPLACE")
print(f"Gewichte: {round(gewichtet(ob) * 100, 1)} % der Punkte · Unterkiefer: {int((k > 0.5).sum())} Punkte")

# ---------------------------------------------------- 4. Mundraum und Zunge ----------------------------------------------------
def anfuegen(neu_ob, gruppen):
    """ein Hilfsnetz mit festen Gewichten ins Körpermodell fügen (gruppen: Funktion Punkt -> {knochen: gewicht})"""
    for name in {k_ for p in neu_ob.data.vertices for k_ in gruppen(p.co)}:
        if name not in neu_ob.vertex_groups: neu_ob.vertex_groups.new(name=name)
    for p in neu_ob.data.vertices:
        for name, w in gruppen(p.co).items(): neu_ob.vertex_groups[name].add([p.index], w, "REPLACE")
    bpy.ops.object.select_all(action="DESELECT"); neu_ob.select_set(True); ob.select_set(True); bpy.context.view_layer.objects.active = ob; bpy.ops.object.join()
def faerben_netz(o, farbe):
    ca = o.data.color_attributes.new(FARBE or "Col", "FLOAT_COLOR", "POINT"); lin = [((c / 255 + 0.055) / 1.055) ** 2.4 for c in farbe]; ca.data.foreach_set("color", [*lin, 1.0] * len(o.data.vertices))
mitte_y = L0 + 0.16 * LAENGE
from mathutils.bvhtree import BVHTree
dg_ = bpy.context.evaluated_depsgraph_get(); baum = BVHTree.FromObject(ob, dg_)
def draussen(c, s_):                                                                             # Anteil der Punkte einer Kugel (Mitte c, Halbachsen s_), die außerhalb des Körpers liegen
    n_ = 0; pk = [(math.cos(u) * math.sin(v), math.sin(u) * math.sin(v), math.cos(v)) for u in np.linspace(0, 2 * math.pi, 12, endpoint=False) for v in np.linspace(0.2, math.pi - 0.2, 6)]
    for p_ in pk:
        q = Vector((c[0] + s_[0] * p_[0], c[1] + s_[1] * p_[1], c[2] + s_[2] * p_[2])); ort, nrm, _, _ = baum.find_nearest(q)
        if ort is not None and (q - ort).dot(nrm) > 0: n_ += 1
    return n_ / len(pk)
mitte = (0.0, L0 + 0.24 * LAENGE, MAUL - 0.03 * H); halb = [0.45 * W, 0.14 * LAENGE, 0.09 * H]
for _ in range(30):                                                                               # den Mundraum verkleinern, bis er ganz im Kopf liegt (sonst ragt er bei geschlossenem Maul heraus)
    if draussen(mitte, halb) <= 0.02: break
    halb = [h_ * 0.9 for h_ in halb]
print(f"Mundraum: Halbachsen {[round(h_, 2) for h_ in halb]} m, außerhalb {draussen(mitte, halb) * 100:.0f} %")
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=mitte); mund = bpy.context.object; mund.scale = halb; bpy.ops.object.transform_apply(scale=True)
faerben_netz(mund, (70, 18, 22)); anfuegen(mund, lambda c: {"kopf": 1.0} if c.z > mitte[2] else {"kiefer": 1.0})
zf = T.get("zunge", {}); farbe_z = tuple(int(zf.get("farbe", "#b8646e")[i:i + 2], 16) for i in (1, 3, 5)); dz = zf.get("dicke", 0.05) * H
zk = KN["zunge"]; z0, z1 = Vector(zk.head_local), Vector(zk.tail_local)
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=1, depth=1, location=((z0 + z1) / 2)); zu = bpy.context.object; zu.rotation_euler = (math.radians(90), 0, 0); zu.scale = (dz, dz * 0.55, (z1 - z0).length); bpy.ops.object.transform_apply(rotation=True, scale=True)
faerben_netz(zu, farbe_z); anfuegen(zu, lambda c: {"zunge": 1.0})
mat = bpy.data.materials.new("koerper"); mat.use_nodes = True; nt = mat.node_tree; nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.85
f_ = nt.nodes.new("ShaderNodeVertexColor"); f_.layer_name = FARBE or "Col"; nt.links.new(f_.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); ob.data.materials.clear(); ob.data.materials.append(mat)
ob = bpy.data.objects["koerper"]; ob["ebene"] = "koerper"; ob["art"] = "koerper"; ZUNGE_LAENGE = (z1 - z0).length

# ---------------------------------------------------- 5. Bewegungen ----------------------------------------------------
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)); RUHE = {b.name: b.matrix_local.to_quaternion() for b in KN}; ganz = {}
def setze(name, q): e = ELTERN[name]; lokal = (ganz[e].inverted() @ q) if e else q; r = RUHE[name]; PB[name].rotation_quaternion = r.inverted() @ lokal @ r; ganz[name] = q
def dreh(name, *schritte):
    """zusätzlich zum Elternknochen um Achsen des Raums drehen (Grad). +x: Kopf/Rumpf nach unten-vorn, Bein nach hinten"""
    q = Quaternion()
    for achse, w in schritte: q = Quaternion(achse, math.radians(w)) @ q
    e = ELTERN[name]; setze(name, (ganz[e] @ q) if e else q)
def spur(keys, t):
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1 or (t1, b) == keys[-1]: f = 0 if t1 == t0 else min(1.0, max(0.0, (t - t0) / (t1 - t0))); f = f * f * (3 - 2 * f); return a + (b - a) * f
def hoch(h): PB["becken"].location = KN["becken"].matrix_local.to_3x3().inverted() @ Vector((0, 0, h))   # senkrecht anheben, umgerechnet in die Richtung des Beckenknochens (er zeigt nach vorn)
def stellung(becken_x=0.0, kopf_x=0.0, kiefer=0.0, zunge=1.0, vorn=0.0, hinten=0.0, rolle=0.0, schlaff=0.0):
    """becken_x: Rumpf kippen (+ = Kopf runter); kopf_x: Kopf nicken (+ = runter); kiefer: Maul auf (Grad); zunge: Länge (×);
       vorn/hinten: Beine vor- (−) oder zurück (+) schwingen (Grad); rolle: um die Längsachse rollen (Tod); schlaff: Beine strecken sich zur Seite"""
    dreh("becken", (Y, rolle), (X, becken_x)); dreh("rumpf"); dreh("kopf", (X, kopf_x)); dreh("kiefer", (X, kiefer)); dreh("zunge"); PB["zunge"].scale = (1, zunge, 1)
    for S, sx in (("L", 1), ("R", -1)):
        dreh("oberarm." + S, (X, vorn), (Y, -sx * schlaff * 0.6)); dreh("unterarm." + S, (X, -vorn * 0.5)); dreh("hand." + S, (X, -vorn * 0.3))
        dreh("oberschenkel." + S, (X, hinten), (Y, -sx * schlaff)); dreh("unterschenkel." + S, (X, -hinten * 0.6)); dreh("fuss." + S, (X, hinten * 0.2))

def ruhe(i, n):
    s = math.sin(2 * math.pi * i / n); stellung(becken_x=-1.0 * s, kopf_x=0.8 * s, kiefer=0.0); hoch(0.008 * H * (1 + s))   # atmen: der Rumpf hebt und senkt sich, der Kopf nickt mit
def springen(i, n):
    """ein Sprung: ducken, abdrücken, fliegen, landen, abfedern (an Ort und Stelle; die Bewegung über den Boden macht das Spiel)"""
    t = i / n
    h = spur([(0, 0.0), (0.15, -0.06), (0.3, 0.18), (0.45, 0.5), (0.6, 0.42), (0.75, 0.06), (0.88, -0.05), (1, 0.0)], t) * H
    stellung(becken_x=spur([(0, 0.0), (0.15, 8.0), (0.3, -18.0), (0.45, -12.0), (0.6, 4.0), (0.75, 10.0), (0.88, 6.0), (1, 0.0)], t),
             kopf_x=spur([(0, 0.0), (0.3, -6.0), (0.6, 4.0), (1, 0.0)], t),
             vorn=spur([(0, 0.0), (0.15, 10.0), (0.3, 20.0), (0.45, -30.0), (0.6, -40.0), (0.75, -10.0), (0.88, 8.0), (1, 0.0)], t),
             hinten=spur([(0, 0.0), (0.15, -12.0), (0.3, 45.0), (0.45, 60.0), (0.6, 30.0), (0.75, -5.0), (0.88, -14.0), (1, 0.0)], t)); hoch(h)
def zunge(i, n):
    """Zungenangriff: Kopf heben, Maul weit auf, Zunge schnellt nach vorn, zurück, Maul zu"""
    t = i / (n - 1); auf = spur([(0, 0.0), (0.2, 20.0), (0.35, 38.0), (0.65, 38.0), (0.85, 12.0), (1, 0.0)], t)
    lang = spur([(0, 1.0), (0.25, 1.0), (0.45, T.get("zunge", {}).get("laenge", 1.1) / ZUNGE_LAENGE), (0.6, T.get("zunge", {}).get("laenge", 1.1) / ZUNGE_LAENGE * 0.9), (0.8, 1.0), (1, 1.0)], t)
    stellung(becken_x=spur([(0, 0.0), (0.2, -8.0), (0.45, 4.0), (1, 0.0)], t), kopf_x=spur([(0, 0.0), (0.2, -12.0), (0.45, 6.0), (0.8, -4.0), (1, 0.0)], t), kiefer=auf, zunge=lang,
             vorn=spur([(0, 0.0), (0.2, 6.0), (0.45, -6.0), (1, 0.0)], t))
def tod(i, n):
    """getroffen zusammenzucken (Kopf hoch, Maul auf), dann flach zusammensacken: Beine spreizen sich zur Seite, Kopf sinkt auf den Boden, die Zunge hängt heraus"""
    t = i / (n - 1); fall = spur([(0, 0.0), (0.25, 0.0), (0.75, 1.0), (1, 1.0)], t)
    stellung(becken_x=spur([(0, 0.0), (0.25, -10.0), (0.75, 6.0), (1, 6.0)], t), kopf_x=spur([(0, 0.0), (0.25, -14.0), (0.75, 18.0), (1, 20.0)], t), kiefer=spur([(0, 0.0), (0.25, 28.0), (0.75, 16.0), (1, 16.0)], t),
             zunge=spur([(0, 1.0), (0.5, 1.0), (1, 2.8)], t), schlaff=55 * fall, vorn=-20 * fall, hinten=25 * fall)

ALLE = {"ruhe": (ruhe, 6, 6, True, {}), "springen": (springen, 8, 10, True, {"sprung": [3, 4]}), "zunge": (zunge, 8, 12, False, {"treffer": 4}), "tod": (tod, 8, 10, False, {"halten": 7})}
BEWEGUNGEN = {k: v for k, v in ALLE.items() if k in T.get("bewegungen", list(ALLE))}
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a
    for i in range(n):
        ganz.clear(); fn(i, n)
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name)
        PB["becken"].keyframe_insert("location", frame=i + 1, group="becken"); PB["zunge"].keyframe_insert("scale", frame=i + 1, group="zunge")
    a["bilder"] = n; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, n, "Bilder")
bpy.ops.object.mode_set(mode="OBJECT"); arm.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1)
arm["gewichte"] = WEG; arm["gewichtet"] = gewichtet(ob); arm["hoehe"] = H; arm["tier"] = True
bpy.ops.wm.save_as_mainfile(filepath=zieldatei); print("geschrieben:", zieldatei)
