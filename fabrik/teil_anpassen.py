"""Mythara Fabrik – ein eigenständiges 3D-Rüstungsteil (z. B. ein Meshy-Brustpanzer ohne Körper) auf einen Grundkörper setzen.

  python3 fabrik/teil_anpassen.py <basis.blend> <teil.glb> <ziel.glb> [breite=1.12] [oben=0.15] [abstand=0.035] [vor=-0.025] [max_weit=1.6]
Grundsatz: lieber mehr Spiel als zu wenig – Kragen am Hals, vorn Luft vor der Brust (Standardwerte aus dem Sturmzahn-Panzer) [nur=links|rechts] [kante=0.02] [seite=0.85]

Maßstab: die Breite des Teils = Schulterbreite des Körpers (äußerste Armpunkte auf Schulterhöhe) × breite.
Lage: die Oberkante des Teils liegt „oben“ über dem Halsansatz, seitlich mittig, in der Tiefe so, dass der Rumpf mittig im Teil steckt (+vor).
Dann wird jeder Punkt, der im Körper liegt oder ihm näher als „abstand“ kommt, entlang der Körpernormale nach außen geschoben.
Ergebnis: ein Teilnetz für rig.py (Gewichte vom Grundkörper; für starre Teile „nur_knochen“ setzen).
"""
import os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

basis, quelle, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper"); KN = arm.data.bones
P = np.array([v.co[:] for v in k.data.vertices]); bm = bmesh.new(); bm.from_mesh(k.data); bvh = BVHTree.FromBMesh(bm)
zs = KN["oberarm.L"].head_local.z; HZ = KN["hals"].head_local.z
band = P[np.abs(P[:, 2] - zs) < 0.03]; schulter = band[:, 0].max() - band[:, 0].min()
rumpf = P[(P[:, 2] > zs - 0.25) & (P[:, 2] < zs) & (np.abs(P[:, 0]) < 0.12)]; ymitte = (rumpf[:, 1].min() + rumpf[:, 1].max()) / 2
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle)); o = next(x for x in bpy.context.selected_objects if x.type == "MESH")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm2 = bmesh.new(); bm2.from_mesh(o.data); bmesh.ops.remove_doubles(bm2, verts=bm2.verts, dist=1e-5)
if "nur" in opt:                                                                                    # Meshy legt manchmal zwei Exemplare nebeneinander: nur eines behalten (nur=links|rechts)
    links = opt["nur"] == "links"; bmesh.ops.delete(bm2, geom=[f for f in bm2.faces if (f.calc_center_median().x > 0) == links], context="FACES")
    bmesh.ops.delete(bm2, geom=[v for v in bm2.verts if not v.link_faces], context="VERTS")
for _ in range(6):                                                                                  # große flache Flächen (Brustplatte) fein unterteilen, sonst stechen sie zwischen den Punkten durch den Körper
    lang_ = [e for e in bm2.edges if e.calc_length() > float(opt.get("kante", 0.02)) / max(1e-6, 1.0)]
    if not lang_: break
    bmesh.ops.subdivide_edges(bm2, edges=lang_, cuts=1, use_grid_fill=False); bmesh.ops.triangulate(bm2, faces=bm2.faces[:])
bm2.to_mesh(o.data); bm2.free()
me = o.data; V = np.array([v.co[:] for v in me.vertices])
s = (float(opt["hoehe"]) / (V[:, 2].max() - V[:, 2].min())) if "hoehe" in opt else schulter * float(opt.get("breite", 1.12)) / (V[:, 0].max() - V[:, 0].min()); V = V * s   # hoehe=<m>: nach der Höhe einpassen
V += np.array([-(V[:, 0].max() + V[:, 0].min()) / 2, ymitte - (V[:, 1].max() + V[:, 1].min()) / 2 + float(opt.get("vor", -0.025)), HZ + float(opt.get("oben", 0.15)) - V[:, 2].max()])
AB = float(opt.get("abstand", 0.035)); gesch = 0
# Form erhalten: je Höhe und Richtung um die Rumpfachse wird das Teil radial so weit aufgeweitet, dass seine Innenseite außerhalb des Körpers liegt
# (statt einzelne Punkte auf die Haut zu drücken – das zerknüllt die Platten). Arme zählen unterhalb der Schultern nicht zum Rumpf.
ax_x = 0.0; ax_y = ymitte; sx_ = abs(KN["oberarm.L"].head_local.x)
koerper_r = P[(np.abs(P[:, 0]) < sx_ * 0.95) | (P[:, 2] > zs + 0.02)]
NZ, NA = 40, 32; z0_, z1_ = V[:, 2].min(), V[:, 2].max(); zi = lambda z: np.clip(((z - z0_) / (z1_ - z0_ + 1e-9) * NZ).astype(int), 0, NZ - 1)
wi = lambda x, y: (((np.arctan2(y - ax_y, x - ax_x) + np.pi) / (2 * np.pi)) * NA).astype(int) % NA
rk = np.zeros((NZ, NA)); kb = (koerper_r[:, 2] >= z0_) & (koerper_r[:, 2] <= z1_); K = koerper_r[kb]
np.maximum.at(rk, (zi(K[:, 2]), wi(K[:, 0], K[:, 1])), np.hypot(K[:, 0] - ax_x, K[:, 1] - ax_y))
ra = np.full((NZ, NA), np.inf); rv = np.hypot(V[:, 0] - ax_x, V[:, 1] - ax_y); np.minimum.at(ra, (zi(V[:, 2]), wi(V[:, 0], V[:, 1])), rv)
gueltig = np.isfinite(ra) & (rk > 0) & (ra > rk * 0.55)                                           # Innenteile nahe der Achse (Kragenfutter) zählen nicht
f = np.where(gueltig, (rk + AB) / np.maximum(ra, 1e-4), 1.0); f = np.clip(f, 1.0, float(opt.get("max_weit", 1.6)))
fz = f.max(1); fz = np.maximum.accumulate(np.maximum.accumulate(fz[::-1])[::-1]) * 0 + fz      # je Höhe der größte nötige Faktor
for _ in range(3): fz = np.maximum(fz, (np.roll(fz, 1) + fz + np.roll(fz, -1)) / 3)               # weich über die Höhe
fv = fz[zi(V[:, 2])]; V[:, 0] = ax_x + (V[:, 0] - ax_x) * fv; V[:, 1] = ax_y + (V[:, 1] - ax_y) * fv; gesch = int((fv > 1.001).sum())
print(f"aufgeweitet: Faktor {fz.min():.2f}–{fz.max():.2f} über die Höhe")
if "seite" in opt:                                                                                  # seitlich stauchen (schmale Figuren): x um die Mitte, aber nie in den Körper
    k_ = float(opt["seite"]); xs_ = V[:, 0] * k_
    for i in range(len(V)):
        r = bvh.find_nearest(Vector((xs_[i], V[i, 1], V[i, 2])))
        if r[0] is not None:
            q, n = np.array(r[0]), np.array(r[1]); achse = np.array([0.0, ymitte, q[2]]); n = n if np.dot(n, q - achse) >= 0 else -n
            if np.dot(np.array([xs_[i], V[i, 1], V[i, 2]]) - q, n) < AB * 0.6: continue                # würde den Körper berühren: diesen Punkt nicht stauchen
        V[i, 0] = xs_[i]
    print(f"seitlich gestaucht auf {k_:.0%}")
me.vertices.foreach_set("co", V.ravel()); me.update()
print(f"Teil angepasst: Maßstab {s:.3f}, Schulterbreite {schulter:.2f} m, Höhe {V[:, 2].min():.2f}–{V[:, 2].max():.2f} m, {gesch} von {len(V)} Punkten nach außen geschoben")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
