"""Mythara Fabrik – eine Jacke / ein Wams mit Ärmeln (z. B. von Meshy) auf einen Grundkörper setzen.

  python3 fabrik/jacke_anpassen.py <basis.blend> <jacke.glb> <ziel.glb> [oben=0.1] [unten=0.22] [abstand=0.02] [breite=1.0]
Meshy baut Jacken mit abgespreizten Ärmeln, die Figur lässt die Arme hängen. Darum wie beim Ankleiden:
  1. die Arme des Körpers in die Haltung der Ärmel heben (Richtung der Ärmel je Seite gemessen),
  2. die Jacke in dieser Haltung einpassen: Höhe (Kragen „oben“ über dem Halsansatz, Saum „unten“ unter dem Hüftgelenk), jeder Ärmel Abschnitt für Abschnitt
     auf die Armachse gesetzt und um den Arm aufgeweitet, dann alles, was dem Körper näher als „abstand“ kommt, nach außen geschoben (Verschiebung geglättet),
  3. die Jacke mit den Gewichten des Körpers in die Grundhaltung zurückbewegen – die Ärmel folgen den Armen nach unten.
Ergebnis: ein Teilnetz für rig.py mit "arme_nur_aussen": true.
"""
import os, sys, math
import numpy as np
import bpy, bmesh
from mathutils import Vector, Matrix, kdtree
from mathutils.bvhtree import BVHTree
basis, quelle, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
OBEN, UNTEN, AB, BREITE = (float(opt.get(k, d)) for k, d in (("oben", 0.1), ("unten", 0.22), ("abstand", 0.02), ("breite", 1.0)))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
for o_ in dst.objects:
    if o_: bpy.context.collection.objects.link(o_)
arm = next(o for o in dst.objects if o and o.type == "ARMATURE"); k = next(o for o in dst.objects if o and o.get("art") == "koerper"); KN = arm.data.bones
if not any(m.type == "ARMATURE" for m in k.modifiers): m_ = k.modifiers.new("skelett", "ARMATURE"); m_.object = arm
HZ = KN["hals"].head_local.z; HUEFTE = KN["oberschenkel.L"].head_local.z
P0 = np.array([v.co[:] for v in k.data.vertices]); gnamen = {g.index: g.name for g in k.vertex_groups}
# Jacke laden, fein unterteilen, Höhe und Lage
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle)); o = next(x for x in bpy.context.selected_objects if x.type == "MESH")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
for _ in range(5):
    lang = [e for e in bm.edges if e.calc_length() > 0.02]
    if not lang: break
    bmesh.ops.subdivide_edges(bm, edges=lang, cuts=1, use_grid_fill=False); bmesh.ops.triangulate(bm, faces=bm.faces[:])
bm.to_mesh(o.data); bm.free(); me = o.data; V = np.array([v.co[:] for v in me.vertices])
z_oben, z_unten = HZ + OBEN, HUEFTE - UNTEN; s = (z_oben - z_unten) / (V[:, 2].max() - V[:, 2].min()); V *= s; V[:, 2] += z_unten - V[:, 2].min()
rumpf = P0[(P0[:, 2] > HUEFTE) & (P0[:, 2] < HZ) & (np.abs(P0[:, 0]) < abs(KN["oberarm.L"].head_local.x) * 0.8)]
V[:, 0] -= (V[:, 0].max() + V[:, 0].min()) / 2; mid = V[(V[:, 2] > HUEFTE) & (V[:, 2] < HZ) & (np.abs(V[:, 0]) < 0.1)]
V[:, 1] += (rumpf[:, 1].min() + rumpf[:, 1].max()) / 2 - (mid[:, 1].min() + mid[:, 1].max()) / 2; V[:, 0] *= BREITE
# 1. Arme in die Ärmelhaltung heben
if arm.animation_data: arm.animation_data.action = None                 # sonst überschreibt die gespeicherte Bewegung die Haltung
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones; AERMEL = {}
for b in PB: b.rotation_mode = "QUATERNION"; b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0); b.scale = (1, 1, 1)
for S_, sg in (("L", 1), ("R", -1)):
    Sj = np.array(KN["oberarm." + S_].head_local); Wj = np.array(KN["hand." + S_].head_local); arm_d = (Wj - Sj) / np.linalg.norm(Wj - Sj)
    # Ärmelöffnung: die äußersten Punkte dieser Seite (über dem Saum) – die Richtung Schulter → Öffnung ist die Ärmelrichtung
    aussen = V[:, 0] * sg; kand = (V[:, 2] > z_unten + 0.1) & (aussen > abs(Sj[0]))
    if kand.sum() < 30: AERMEL[S_] = arm_d; continue
    C_ = V[kand][aussen[kand] >= np.percentile(aussen[kand], 97)].mean(0); ax = (C_ - Sj) / np.linalg.norm(C_ - Sj)
    if ax[2] > -0.2: ax = arm_d                                            # keine erkennbaren Ärmel
    q = Vector(arm_d).rotation_difference(Vector(ax)); pb = PB["oberarm." + S_]; pb.rotation_mode = "QUATERNION"
    R0 = KN["oberarm." + S_].matrix_local.to_quaternion(); pb.rotation_quaternion = R0.inverted() @ q @ R0
    AERMEL[S_] = ax; print(f"Arm {S_}: in die Ärmelhaltung gehoben um {math.degrees(q.angle):.0f}°")
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); ke = k.evaluated_get(dg); mk = ke.to_mesh(); P = np.array([v.co[:] for v in mk.vertices]); N_ = np.array([v.normal[:] for v in mk.vertices])
bmP = bmesh.new(); bmP.from_mesh(mk); bvh = BVHTree.FromBMesh(bmP); ke.to_mesh_clear()
for S_ in "LR":
    gi_ = k.vertex_groups["hand." + S_].index; ix = [v.index for v in k.data.vertices if any(g.group == gi_ and g.weight > 0.5 for g in v.groups)]
    print(f"Hand {S_}: Grundhaltung {P0[ix].mean(0).round(2)} → gehoben {P[ix].mean(0).round(2)}, Ärmelrichtung {np.round(AERMEL[S_], 2)}")
# 2. (wahlweise, umhuellen=1) Ärmel abschnittsweise um den gehobenen Arm aufweiten – bei Meshy-Ärmeln ohne saubere Röhre entstehen dabei Zacken, darum aus
for S_, sg in ((("L", 1), ("R", -1)) if opt.get("umhuellen") == "1" else ()):
    Sj = np.array(KN["oberarm." + S_].head_local); ad = np.array(AERMEL[S_]); gw = np.zeros(len(P0))
    for v in k.data.vertices:
        for g in v.groups:
            if gnamen[g.group] in ("oberarm." + S_, "unterarm." + S_, "hand." + S_): gw[v.index] += g.weight
    L_arm = float(np.percentile((P[gw > 0.5] - Sj) @ ad, 97))
    e1 = np.cross(ad, [0, 1, 0]); e1 /= np.linalg.norm(e1); e2 = np.cross(ad, e1)
    rel = V - Sj; sn = rel @ ad; perp = np.linalg.norm(rel - np.outer(sn, ad), axis=1)
    rk_max = float(np.percentile(np.linalg.norm((P[gw > 0.5] - Sj) - np.outer((P[gw > 0.5] - Sj) @ ad, ad), axis=1), 95))   # Armdicke
    sel = (V[:, 0] * sg > abs(Sj[0]) - 0.02) & (sn > 0.04) & (sn < L_arm + 0.05) & (perp < rk_max + 0.09)   # nur nahe der Armachse: Ärmel, nicht die Seitenschöße
    A_ = P[gw > 0.5] - Sj; sa = A_ @ ad; NB, NS = 16, 16; bi = lambda x: np.clip((x / L_arm * NB).astype(int), 0, NB - 1)
    pk = np.stack([A_ @ e1, A_ @ e2], 1); pv = np.stack([rel[sel] @ e1, rel[sel] @ e2], 1); bk, bv = bi(sa), bi(sn[sel]); n_ok = 0
    for b in range(NB):
        mk_, mv = (bk == b) & (sa > 0), bv == b
        if mk_.sum() < 5 or mv.sum() < 5: continue
        ck = (pk[mk_].min(0) + pk[mk_].max(0)) / 2; cv = (pv[mv].min(0) + pv[mv].max(0)) / 2
        ang = lambda d: ((np.arctan2(d[:, 1], d[:, 0]) + np.pi) / (2 * np.pi) * NS).astype(int) % NS
        rk = np.zeros(NS); np.maximum.at(rk, ang(pk[mk_] - ck), np.linalg.norm(pk[mk_] - ck, axis=1)); ra = np.full(NS, np.inf); np.minimum.at(ra, ang(pv[mv] - cv), np.linalg.norm(pv[mv] - cv, axis=1))
        ok = np.isfinite(ra) & (rk > 0); f = float(np.clip(np.max((rk[ok] + AB) / np.maximum(ra[ok], 1e-3)), 0.85, 2.5)) if ok.any() else 1.0
        w = np.clip((sn[sel][mv] - 0.04) / 0.08, 0, 1)[:, None]; pv[mv] = pv[mv] * (1 - w) + (ck + (pv[mv] - cv) * f) * w; n_ok += 1
    V[sel] = Sj + np.outer(sn[sel], ad) + pv[:, :1] * e1 + pv[:, 1:] * e2; print(f"Ärmel {S_}: {sel.sum()} Punkte, {n_ok} Abschnitte um den Arm gelegt")
# nach außen schieben (gegen den gehobenen Körper), Verschiebung glätten
me.vertices.foreach_set("co", V.ravel()); me.update(); bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
nb = [[e.other_vert(v).index for e in v.link_edges] for v in bm.verts]; bm.free()
for runde in range(5):
    D = np.zeros_like(V)
    for i in range(len(V)):
        r = bvh.find_nearest(Vector(V[i]))
        if r[0] is None: continue
        q_, n = np.array(r[0]), np.array(r[1]); d = float((V[i] - q_) @ n)
        if d < AB: D[i] = n * (AB - d)
    for _ in range(4): D = np.array([D[i] * 0.5 + np.mean(D[nb[i]], 0) * 0.5 if nb[i] else D[i] for i in range(len(V))])
    V += D
if opt.get("zwischen"):                                                 # zum Prüfen: gehobener Körper und eingepasste Jacke vor dem Zurückbewegen
    me.vertices.foreach_set("co", V.ravel()); me.update(); bpy.ops.object.mode_set(mode="OBJECT"); bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); k.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(opt["zwischen"]), export_format="GLB", use_selection=True, export_apply=True, export_skins=False); bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE")
# 3. zurück in die Grundhaltung: Gewichte vom nächsten Körperpunkt (gehoben), je Knochen zurückrechnen
kd = kdtree.KDTree(len(P))
for i, p in enumerate(P): kd.insert(p, i)
kd.balance()
GW = [{gnamen[g.group]: g.weight for g in v.groups if g.weight > 0.01} for v in k.data.vertices]
if opt.get("pruefen"):
    for S_ in "LR":
        gi_ = k.vertex_groups["unterarm." + S_].index; ix = np.array([v.index for v in k.data.vertices if any(g.group == gi_ and g.weight > 0.5 for g in v.groups)])
        c_ = P[ix].mean(0); nahe = np.where(np.linalg.norm(V - c_, axis=1) < 0.12)[0]; armw = []
        for i in nahe[:400]:
            w = {}
            for _, j, dist in kd.find_n(V[i], 4):
                for g, x in GW[j].items(): w[g] = w.get(g, 0) + x / (1e-4 + dist)
            s_ = sum(w.values()); armw.append(sum(x for g, x in w.items() if g.split(".")[0] in ("oberarm", "unterarm", "hand")) / s_)
        print(f"Prüfen {S_}: {len(nahe)} Jackenpunkte um den Unterarm, mittleres Arm-Gewicht {np.mean(armw):.2f}")
BM = {b.name: (b.bone.matrix_local @ b.matrix.inverted()) for b in PB}          # gehoben → Grundhaltung, je Knochen (Armature-Raum)
for i in range(len(V)):
    nah = kd.find_n(V[i], 4); w = {}
    for _, j, dist in nah:
        for g, x in GW[j].items(): w[g] = w.get(g, 0) + x / (1e-4 + dist)
    s_ = sum(x for g, x in w.items() if g in BM)
    if s_ <= 0: continue
    p = Vector(V[i]); V[i] = sum(((BM[g] @ p) * (x / s_) for g, x in w.items() if g in BM), Vector())
if opt.get("pruefen"):
    for S_ in "LR":
        gi_ = k.vertex_groups["hand." + S_].index; ix = [v.index for v in k.data.vertices if any(g.group == gi_ and g.weight > 0.5 for g in v.groups)]
        print(f"Prüfen {S_}: Hand gehoben {P[ix].mean(0).round(2)}, Grundhaltung {P0[ix].mean(0).round(2)}; Knochen-Matrix-Verschiebung der Hand:", np.round(np.array(BM['hand.' + S_] @ Vector(P[ix].mean(0))), 2))
bpy.ops.object.mode_set(mode="OBJECT"); me.vertices.foreach_set("co", V.ravel()); me.update()
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Jacke: {z_unten:.2f}–{z_oben:.2f} m, Maßstab {s:.3f}, {len(V)} Punkte → Grundhaltung")
