"""Mythara Fabrik – einen eigenständigen 3D-Helm (z. B. von Meshy, auch mit Halsschutz) auf einen Grundkörper setzen.

  python3 fabrik/helm_anpassen.py <basis.blend> <helm.glb> <ziel.glb> [oben=0.03] [unten=0.0] [abstand=0.02] [max_weit=1.5] [min_weit=0.85] [vor=0.0]
Maßstab und Höhe: die Oberkante des Helms liegt „oben“ über dem Scheitel, die Unterkante „unten“ über dem Halsansatz (gleichmäßig skaliert).
Lage: mittig über dem Kopf. Dann wird er je Höhe und Richtung um die Achse von Kopf und Hals so weit aufgeweitet (oder bis „min_weit“ verengt),
dass Kopf und Hals überall „abstand“ (m) Luft haben – lieber mehr Spiel als zu wenig. Die Schultern zählen nicht (der Halsschutz liegt auf ihnen).
Ergebnis: ein Teilnetz für rig.py – "nur_knochen": ["kopf", "hals"] (der Helm folgt dem Kopf, der Halsschutz dem Hals).
"""
import os, sys
import numpy as np
import bpy, bmesh
basis, quelle, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
OBEN, UNTEN, AB, MAXW, MINW, VOR = (float(opt.get(k, d)) for k, d in (("oben", 0.03), ("unten", 0.0), ("abstand", 0.02), ("max_weit", 1.5), ("min_weit", 0.85), ("vor", 0.0)))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper"); KN = arm.data.bones
P = np.array([v.co[:] for v in k.data.vertices]); gi = {g.index: g.name for g in k.vertex_groups}; KH = np.zeros(len(P))
for v in k.data.vertices:
    for g in v.groups:
        if gi[g.group] in ("kopf", "hals"): KH[v.index] += g.weight
Z_TOP = P[:, 2].max() + OBEN; Z_BOT = KN["hals"].head_local.z + UNTEN
K = P[(KH > 0.4) & (P[:, 2] > Z_BOT - 0.02)]                              # Kopf und Hals (ohne Schultern)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle)); o = next(x for x in bpy.context.selected_objects if x.type == "MESH")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
for _ in range(5):
    lang = [e for e in bm.edges if e.calc_length() > 0.02]
    if not lang: break
    bmesh.ops.subdivide_edges(bm, edges=lang, cuts=1, use_grid_fill=False); bmesh.ops.triangulate(bm, faces=bm.faces[:])
bm.to_mesh(o.data); bm.free(); me = o.data; V = np.array([v.co[:] for v in me.vertices])
s = (Z_TOP - Z_BOT) / (V[:, 2].max() - V[:, 2].min()); V *= s; V[:, 2] += Z_BOT - V[:, 2].min()
kopf = K[K[:, 2] > KN["kopf"].head_local.z]; cx, cy = (kopf[:, 0].min() + kopf[:, 0].max()) / 2, (kopf[:, 1].min() + kopf[:, 1].max()) / 2
oben_v = V[V[:, 2] > KN["kopf"].head_local.z + 0.05]; V[:, 0] += cx - (oben_v[:, 0].min() + oben_v[:, 0].max()) / 2; V[:, 1] += cy - (oben_v[:, 1].min() + oben_v[:, 1].max()) / 2 + VOR
NZ, NA = 30, 24; ZB = np.linspace(Z_BOT - 0.03, Z_TOP + 0.02, NZ + 1); zi = lambda z: np.clip(np.searchsorted(ZB, z) - 1, 0, NZ - 1)
mx = np.full(NZ, cx); my = np.full(NZ, cy); bk = zi(K[:, 2])
for i in range(NZ):                                                       # Achse je Höhe: Mitte von Kopf bzw. Hals
    m = bk == i
    if m.sum() > 5: mx[i] = (K[m, 0].min() + K[m, 0].max()) / 2; my[i] = (K[m, 1].min() + K[m, 1].max()) / 2
wi = lambda dx, dy: (((np.arctan2(dy, dx) + np.pi) / (2 * np.pi)) * NA).astype(int) % NA
rk = np.zeros((NZ, NA)); dxk, dyk = K[:, 0] - mx[bk], K[:, 1] - my[bk]; np.maximum.at(rk, (bk, wi(dxk, dyk)), np.hypot(dxk, dyk))
bv = zi(V[:, 2]); dxv, dyv = V[:, 0] - mx[bv], V[:, 1] - my[bv]; ra = np.full((NZ, NA), np.inf); np.minimum.at(ra, (bv, wi(dxv, dyv)), np.hypot(dxv, dyv))
f = np.where(np.isfinite(ra) & (rk > 0) & (ra > 0.3 * rk), (rk + AB) / np.maximum(ra, 1e-4), np.nan)
for i in range(NZ):
    g = np.isfinite(f[i]); f[i] = np.interp(np.arange(NA), np.where(g)[0], f[i][g], period=NA) if g.any() else 1.0
for _ in range(3): f = np.maximum(f, (np.roll(f, 1, 1) + f + np.roll(f, -1, 1)) / 3)
for _ in range(3): f = np.maximum(f, (np.roll(f, 1, 0) + f + np.roll(f, -1, 0)) / 3)
f = np.clip(f, MINW, MAXW); fv = f[bv, wi(dxv, dyv)]; V[:, 0] = mx[bv] + dxv * fv; V[:, 1] = my[bv] + dyv * fv
me.vertices.foreach_set("co", V.ravel()); me.update()
print(f"Helm: Maßstab {s:.3f}, {Z_BOT:.2f}–{Z_TOP:.2f} m, Faktor {f.min():.2f}–{f.max():.2f}, {len(V)} Punkte")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
