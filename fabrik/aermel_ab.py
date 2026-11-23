"""Mythara Fabrik – an einer Jacke (z. B. von Meshy) die Ärmel abschneiden: ein ärmelloses Wams, das sich wie ein Brustpanzer anpassen lässt (teil_anpassen.py).

  python3 fabrik/aermel_ab.py <jacke.glb> <ziel.glb> [schulter=0.24] [aussen=0.27] [oben=1.30] [unten=0.80]
Die Jacke wird gedanklich auf eine 1,80-m-Figur gestellt (Kragen 1,58 m, Saum 0,63 m, mittig). Weg kommt jede Fläche, deren Mitte
weiter als „aussen“ (m) von der Mitte liegt (zwischen „unten“ und Schulterhöhe), und zwischen Achsel und „oben“ alles jenseits von „schulter“ –
Schulterstücke darüber und die Schöße unten bleiben. Lose Reste werden entfernt, die Ränder bleiben offen (wie ein Ärmelloch).
"""
import os, sys
import numpy as np
import bpy, bmesh
quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
SCH, AUS, OB, UN = (float(opt.get(k, d)) for k, d in (("schulter", 0.24), ("aussen", 0.27), ("oben", 1.30), ("unten", 0.80)))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
o = next(x for x in bpy.context.selected_objects if x.type == "MESH"); bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
V = np.array([v.co[:] for v in o.data.vertices]); s = 0.95 / (V[:, 2].max() - V[:, 2].min()); z0 = V[:, 2].min(); cx = (V[:, 0].max() + V[:, 0].min()) / 2
bm = bmesh.new(); bm.from_mesh(o.data); weg = []
for f in bm.faces:
    c = f.calc_center_median(); x = abs(c.x - cx) * s; z = (c.z - z0) * s + 0.63
    if (UN < z < 1.45 and x > AUS) or (0.95 < z < OB and x > SCH): weg.append(f)
bmesh.ops.delete(bm, geom=weg, context="FACES"); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
# kleine lose Reste (abgeschnittene Ärmelfetzen) entfernen
bm.verts.ensure_lookup_table(); gesehen = set(); stuecke = []
for v in bm.verts:
    if v.index in gesehen: continue
    st, grp = [v], []; gesehen.add(v.index)
    while st:
        x_ = st.pop(); grp.append(x_)
        for e in x_.link_edges:
            y = e.other_vert(x_)
            if y.index not in gesehen: gesehen.add(y.index); st.append(y)
    stuecke.append(grp)
gross = max(len(g) for g in stuecke); klein = [v for g in stuecke if len(g) < 0.02 * gross for v in g]
bmesh.ops.delete(bm, geom=klein, context="VERTS"); bm.to_mesh(o.data); bm.free()
print(f"Ärmel ab: {len(weg)} Flächen weg, {len(klein)} lose Punkte entfernt, {len(o.data.vertices)} Punkte übrig")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
