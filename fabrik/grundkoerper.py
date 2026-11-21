"""Mythara Fabrik – einen unbekleideten Grundkörper (z. B. aus Meshy, ohne Textur) für die Fabrik vorbereiten.

  python3 fabrik/grundkoerper.py <modell.glb|blend> <ziel.glb> [punkte=40000] [haut=#e2a57f] [haar=#5e3720] [hose=#4b3526]

1,80 m, Füße auf dem Boden, Mitte auf der Achse, Blick nach -y; auf etwa <punkte> Punkte vereinfacht (ohne die Form zu verlieren);
Punktfarben: Haut, Haar und Bart am Kopf (nach Lage: Scheitel und Hinterkopf, unteres Gesicht vorn), eine schlichte Unterhose am Becken.
Kleidung (Hemd, Hose) kommt als Lagen der Fabrik darüber, Rüstung als übertragene Teile (teile_uebertragen.py).
"""
import sys
import numpy as np
import bpy
from mathutils import Matrix, Vector

quelle, ziel = sys.argv[1], sys.argv[2]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
bpy.context.preferences.filepaths.use_scripts_auto_execute = False
if quelle.endswith(".blend"): bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
else: bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
ob = next(o for o in bpy.data.objects if o.type == "MESH"); bpy.context.view_layer.objects.active = ob; ob.select_set(True)
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
P = np.array([v.co[:] for v in ob.data.vertices]); ob.data.transform(Matrix.Scale(1.8 / np.ptp(P[:, 2]), 4)); P = np.array([v.co[:] for v in ob.data.vertices])
ob.data.transform(Matrix.Translation(Vector((-(P[:, 0].max() + P[:, 0].min()) / 2, -float(np.median(P[P[:, 2] - P[:, 2].min() > 1.2, 1])), -P[:, 2].min()))))
ziel_n = int(opt.get("punkte", 40000))
if len(ob.data.vertices) > ziel_n: d = ob.modifiers.new("weniger", "DECIMATE"); d.ratio = ziel_n / len(ob.data.vertices); bpy.ops.object.modifier_apply(modifier="weniger")
me = ob.data; me.update()
def lin(h): h = h.lstrip("#"); c = np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32); return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
HAUT, HAAR, HOSE = lin(opt.get("haut", "#e2a57f")), lin(opt.get("haar", "#5e3720")), lin(opt.get("hose", "#4b3526"))
P = np.array([v.co[:] for v in me.vertices]); N = np.array([v.normal[:] for v in me.vertices]); farbe = np.tile(HAUT, (len(P), 1))
kopf_z = float(np.percentile(P[:, 2], 99.9)) - 0.30                                             # Kopfhöhe etwa 30 cm unter dem Scheitel
kopf = P[:, 2] > kopf_z; vorn = (N[:, 1] < -0.25) & (np.abs(P[:, 0]) < 0.1)
gesicht_oben = kopf & vorn & (P[:, 2] > kopf_z + 0.11) & (P[:, 2] < kopf_z + 0.22)                 # Stirn, Augen, Nase
bart = kopf & (P[:, 1] < 0.03) & (P[:, 2] < kopf_z + 0.11) & (P[:, 2] > kopf_z - 0.02) & ~((np.abs(P[:, 0]) < 0.025) & (P[:, 2] > kopf_z + 0.08))
haar = kopf & ((P[:, 2] > kopf_z + 0.22) | ((P[:, 1] > 0.02) & (P[:, 2] > kopf_z + 0.08)) | ((np.abs(P[:, 0]) > 0.085) & (P[:, 2] > kopf_z + 0.12))) & ~gesicht_oben
if opt.get("regionen"):                                                                          # Körperregionen aus einer zweiten Datei (z. B. Meshy-Segmentierung): exakte Grenzen statt der Lageregeln
    from mathutils.kdtree import KDTree
    sel = bpy.data.objects[:]; vor = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=opt["regionen"]); R = [o for o in bpy.data.objects if o not in vor and o.type == "MESH"]
    RP = [(np.array([tuple(o.matrix_world @ v.co) for v in o.data.vertices]), o.name) for o in R]; alle = np.concatenate([p_ for p_, _ in RP])
    k2 = 1.8 / np.ptp(alle[:, 2]); off = np.array([-(alle[:, 0].max() + alle[:, 0].min()) / 2, -float(np.median(alle[alle[:, 2] - alle[:, 2].min() > 1.2, 1])), -alle[:, 2].min()])
    kd = KDTree(len(alle)); namen = []; i = 0
    for p_, n_ in RP:
        for q in (p_ + off) * k2: kd.insert(q, i); namen.append(n_); i += 1
    kd.balance(); haar_teile = set(opt.get("haar_teile", "").split(","))
    region = np.array([namen[kd.find(Vector(p_))[1]] for p_ in P]); haar = np.isin(region, list(haar_teile)); bart = np.zeros_like(haar)
    for o in R: bpy.data.objects.remove(o)
    print("Regionen:", {n_: int((region == n_).sum()) for _, n_ in RP})
farbe[bart | haar] = HAAR
huefte = (P[:, 2] > 0.78) & (P[:, 2] < 0.98) & (np.abs(P[:, 0]) < 0.24)                           # schlichte Unterhose
farbe[huefte] = HOSE
ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1).ravel())
m = bpy.data.materials.new("koerper"); m.use_nodes = True; vc = m.node_tree.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; m.node_tree.links.new(vc.outputs[0], m.node_tree.nodes["Principled BSDF"].inputs["Base Color"])
me.materials.clear(); me.materials.append(m); ob.name = "koerper"
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
print(f"Grundkörper: {len(me.vertices)} Punkte, Kopf ab {kopf_z:.2f} m, Haar {int(haar.sum())} · Bart {int(bart.sum())} Punkte · geschrieben: {ziel}")
