"""Mythara Fabrik – eine kurze Frisur direkt auf dem kahlen Kopf des Grundkörpers bauen (ohne Vorlagenbild): dünne Haarschale mit klarem Haaransatz,
oben etwas länger, an Seiten und Nacken kurz auslaufend, Strähnen gemalt.

  python3 fabrik/kurzhaar.py <basis.blend> <ziel.glb> [farbe=#3b2618] [oben=0.011] [seite=0.003] [stirn=0.8] [schlaefe=0.62] [nacken=0.18]

basis.blend  Grundkörper mit Skelett (rig.py / grundstruktur.py), kahler Kopf
oben/seite   Dicke der Haare oben bzw. an Seiten und Nacken (m)
stirn …      Haaransatz als Anteil des Kopfknochens (0 = Halsansatz, 1 = Scheitel) – vorn, an den Schläfen, im Nacken
Ergebnis: ein Teilnetz für rig.py (Platz „haar“, Gewichte vom Grundkörper).
"""
import math, os, sys
import numpy as np
import bpy, bmesh

basis, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
OBEN, SEITE = float(opt.get("oben", 0.011)), float(opt.get("seite", 0.003))
STIRN, SCHLAEFE, NACKEN = float(opt.get("stirn", 0.8)), float(opt.get("schlaefe", 0.62)), float(opt.get("nacken", 0.18))
hexf = opt.get("farbe", "#3b2618"); FARBE = np.array([int(hexf[i:i + 2], 16) / 255 for i in (1, 3, 5)]) ** 2.2
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
KN = arm.data.bones; KZ0, KZ1 = KN["kopf"].head_local.z, KN["kopf"].tail_local.z; KL = KZ1 - KZ0
bm = bmesh.new(); bm.from_mesh(k.data); bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < KZ0 - 0.02], context="VERTS")
netz = bpy.data.meshes.new("haar"); bm.to_mesh(netz); bm.free(); o = bpy.data.objects.new("haar", netz); bpy.context.collection.objects.link(o)
bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.object.mode_set(mode="OBJECT")
sm = o.modifiers.new("fein", "SUBSURF"); sm.levels = 3; bpy.ops.object.modifier_apply(modifier="fein")
Q = np.array([v.co[:] for v in netz.vertices]); N = np.array([v.normal[:] for v in netz.vertices]); n = len(Q)
mitte = np.array([KN["kopf"].head_local.x, KN["kopf"].head_local.y + 0.02, KZ0 + 0.55 * KL])
if (np.einsum("ij,ij->i", N, Q - mitte) < 0).mean() > 0.5: N = -N
E = np.array([e.vertices[:] for e in netz.edges]); nb = [[] for _ in range(n)]
for a, b in E: nb[a].append(b); nb[b].append(a)
def glatt(x, k_=1):
    for _ in range(k_): x = np.array([(x[i] + x[nb[i]].mean(0)) / 2 if nb[i] else x[i] for i in range(n)])
    return x
# Haaransatz: Höhe je Richtung um den Kopf (vorn hoch, Schläfen mittel, Nacken tief), weich zwischen den Richtungen
d = Q - mitte; winkel = np.arctan2(d[:, 0], -d[:, 1])                                               # 0 = vorn, ±π = hinten
vorne = np.cos(winkel) ** 2 * (np.cos(winkel) > 0); hinten = np.cos(winkel) ** 2 * (np.cos(winkel) < 0); seitlich = np.sin(winkel) ** 2
ansatz = STIRN * vorne + SCHLAEFE * seitlich + NACKEN * hinten
hz = (Q[:, 2] - KZ0) / KL
ohr = (np.abs(d[:, 0]) > 0.05) & (hz < SCHLAEFE + 0.02) & (hz > 0.25) & (np.abs(d[:, 1] + 0.01) < 0.045)   # über und hinter den Ohren: Bogen um das Ohr
ansatz = np.where(ohr, np.maximum(ansatz, SCHLAEFE), ansatz)
band = (hz > 0.2) & (hz < 0.7); halbe = np.percentile(np.abs(d[band, 0]), 80)                        # Ohren: was seitlich über die Kopfbreite hinausragt
ohren = (np.abs(d[:, 0]) > halbe * 0.97) & (hz > 0.2) & (hz < SCHLAEFE + 0.03) & (np.abs(d[:, 1]) < 0.06)
haar = glatt(((hz >= ansatz) & ~ohren & ~((N[:, 1] < -0.5) & (hz < STIRN))).astype(float), 6) > 0.5
# Abstand zum Haaransatz (über die Fläche): für weiches Auslaufen und dunklen Rand
rand = haar.astype(float)
for _ in range(10): rand = glatt(rand)
innen = np.clip((rand - 0.5) * 2, 0, 1)                                                             # 0 am Rand, 1 tief im Haar
oben = np.clip((hz - 0.55) / 0.35, 0, 1) * (1 - 0.6 * hinten)                                       # oben länger, hinten/seitlich kurz
dicke = SEITE + (OBEN - SEITE) * oben * innen + 0.0015 * innen
dicke = glatt(dicke, 4)
# Strähnen: vom Wirbel (hinten oben) nach vorn und zur Seite gekämmt – Streifen entlang dieser Richtung, gemalt als Farbe
wirbel = mitte + np.array([0.0, 0.06, 0.45 * KL]); r = Q - wirbel; r[:, 2] *= 0.4; th = np.arctan2(r[:, 0], -r[:, 1]); dist = np.linalg.norm(r, axis=1)
streifen = np.clip(0.5 + 0.5 * np.sin(th * 70 + np.sin(dist * 60) * 1.6) * (0.6 + 0.4 * np.sin(th * 17 + dist * 35 + 1.3)), 0, 1)
korn = np.random.default_rng(3).random(n); korn = glatt(korn, 1)
hell = 0.62 + 0.62 * streifen ** 1.5 + 0.18 * (korn - 0.5)
hell *= 0.62 + 0.38 * innen                                                                         # zum Rand dunkler (Haut scheint durch)
hell *= 1 + 0.15 * np.clip(N[:, 2], 0, 1) * oben                                                    # Glanz oben
farbe = np.clip(FARBE[None, :] * hell[:, None], 0, 1)
ab = Q + N * dicke[:, None]
bm = bmesh.new(); bm.from_mesh(netz); bm.verts.ensure_lookup_table(); ur = bm.verts.layers.int.new("u")
for v in bm.verts: v[ur] = v.index; v.co = ab[v.index]
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not haar[v.index]], context="VERTS"); bm.edges.ensure_lookup_table(); innen_v = {}
for e in [e for e in bm.edges if e.is_boundary]:                                                    # Rand bis an die Haut schließen
    for v in e.verts:
        if v not in innen_v: i = v[ur]; innen_v[v] = bm.verts.new(Q[i] + N[i] * 0.0008)
for e in [e for e in bm.edges if e.is_boundary]:
    a, b = e.verts
    if a in innen_v and b in innen_v:
        try: bm.faces.new((a, b, innen_v[b], innen_v[a]))
        except ValueError: pass
alt = {v: v[ur] for v in bm.verts if v not in innen_v.values()}
bm.verts.layers.int.remove(ur); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(netz); bm.free()
pos = np.array([v.co[:] for v in netz.vertices]); kd_q = __import__("scipy.spatial", fromlist=["cKDTree"]).cKDTree(ab)
_, ni = kd_q.query(pos); fv = farbe[ni] * np.where(np.linalg.norm(pos - ab[ni], axis=1)[:, None] > 0.001, 0.6, 1.0)   # Randschluss dunkler
ca = netz.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.c_[fv, np.ones(len(fv))].astype(np.float32).ravel())
netz.color_attributes.active_color = ca; netz.color_attributes.render_color_index = netz.color_attributes.active_color_index
m = bpy.data.materials.new("haar"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.62; netz.materials.append(m)
bpy.ops.object.shade_smooth(); bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_vertex_color="MATERIAL", export_all_vertex_colors=False)
print(f"Kurzhaar: {int(haar.sum())} von {n} Punkten · Dicke {dicke[haar].min() * 1000:.1f}–{dicke[haar].max() * 1000:.1f} mm · geschrieben {ziel}")
