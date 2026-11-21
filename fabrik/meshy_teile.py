"""Mythara Fabrik – ein fertiges Figurenmodell aus einem Stück (z. B. Meshy, ohne Textur) in ablegbare Teile zerlegen und einen Grundkörper darunter erzeugen.

  python3 fabrik/meshy_teile.py <modell.blend|glb> <ziel-ordner> [unterteilen=1]

Ablauf
  1. Modell laden (Skripte in der Datei werden nicht ausgeführt), auf 1,80 m bringen, Füße auf den Boden, Mitte auf die Achse
  2. jede Fläche nach Lage und Richtung einem Teil zuordnen (Regeln für eine stehende Ritterfigur mit Umhang, Blick nach -y):
       umhang      hinten (y deutlich hinter dem Rücken) von den Waden bis über die Schultern, dazu der Schal um den Hals
       waffenrock  vorn, unter dem Gürtel bis über die Knie, mittig
       stahl       Brustpanzer, Schulterplatten, Kniekacheln
       guertel     Gürtelband um die Hüfte
       stiefel     Füße und Stiefelschäfte
       haar        Haar und Bart (Kopf außer dem Gesicht vorn)
     was übrig bleibt (Gesicht, Hals, Hände, Arme, Hose) gehört zum Grundkörper
  3. Grundkörper: das Modell ohne Umhang und Waffenrock, Löcher geschlossen, neu vernetzt (geschlossene Hülle), geglättet und
     leicht nach innen gezogen – er liegt unter allen Teilen; Untergewand (Leinen), Hose, Haut für Gesicht und Hände
  4. schreibt koerper.glb (Punktfarben) und je Teil <teil>.glb (fester Farbton) in den Zielordner, dazu teile.png (Kontrolle: Teile farbig)
Die Teile behalten die Form des Modells (nichts wird nachgebaut); nach dem Ablegen eines Teils sieht man den Grundkörper.
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Vector
from mathutils.kdtree import KDTree

quelle, ziel = sys.argv[1], sys.argv[2]; os.makedirs(ziel, exist_ok=True); opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
bpy.context.preferences.filepaths.use_scripts_auto_execute = False
if quelle.endswith(".blend"): bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
else: bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
teile_ = [o for o in bpy.data.objects if o.type == "MESH"]; bpy.ops.object.select_all(action="DESELECT")
for o in teile_: o.select_set(True)
bpy.context.view_layer.objects.active = teile_[0]
if len(teile_) > 1: bpy.ops.object.join()
ob = bpy.context.object; bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
P = np.array([v.co[:] for v in ob.data.vertices]); k = 1.8 / np.ptp(P[:, 2])
ob.data.transform(Matrix.Scale(k, 4)); P = np.array([v.co[:] for v in ob.data.vertices])
ob.data.transform(Matrix.Translation(Vector((-(P[:, 0].max() + P[:, 0].min()) / 2, -float(np.median(P[P[:, 2] - P[:, 2].min() > 1.2, 1])), -P[:, 2].min()))))
stufen = int(opt.get("unterteilen", 1))
if stufen: m = ob.modifiers.new("t", "SUBSURF"); m.subdivision_type = "SIMPLE"; m.levels = stufen; bpy.ops.object.modifier_apply(modifier="t")
me = ob.data; me.update()

# ---- 2. Flächen zuordnen
F = len(me.polygons); C = np.zeros(F * 3); me.polygons.foreach_get("center", C); C = C.reshape(-1, 3); N = np.zeros(F * 3); me.polygons.foreach_get("normal", N); N = N.reshape(-1, 3)
x, y, z = C[:, 0], C[:, 1], C[:, 2]; ax = np.abs(x)
def ruecken(zz):                                                                                # wie weit der Körper (ohne Umhang) nach hinten reicht, je Höhe
    return np.interp(zz, [0.0, 0.45, 0.7, 1.0, 1.25, 1.45, 1.6], [0.13, 0.11, 0.13, 0.15, 0.16, 0.15, 0.12])
teil = np.full(F, "koerper", object)
kopf = z > 1.52
teil[kopf & ~((N[:, 1] < -0.25) & (z < 1.73) & (ax < 0.1) & (z > 1.6))] = "haar"                    # Kopf außer dem Gesicht (Stirn bis Mund vorn)
teil[kopf & (N[:, 1] < -0.2) & (z <= 1.6) & (ax < 0.12)] = "haar"                                   # Bart: unteres Gesicht vorn
teil[(z < 0.42) & (y < ruecken(z) + 0.03)] = "stiefel"
teil[(z >= 0.95) & (z < 1.09) & (ax < 0.3) & (y < ruecken(z) + 0.02)] = "guertel"
teil[(z >= 1.09) & (z < 1.47) & (ax < 0.27) & (y < ruecken(z) + 0.02)] = "stahl"                       # Brustpanzer
teil[(z >= 1.28) & (z < 1.55) & (ax >= 0.2) & (ax < 0.5) & (N[:, 2] > -0.3)] = "stahl"               # Schulterplatten
teil[(z >= 0.42) & (z < 0.62) & (N[:, 1] < -0.35) & (y < -0.04)] = "stahl"                          # Kniekacheln
teil[(z >= 0.55) & (z < 0.97) & (y < -0.09) & (ax < 0.17) & (N[:, 1] < 0.2)] = "waffenrock"
umhang = (y > ruecken(z) + 0.025) & (z > 0.12) & (z < 1.55) & (ax < 0.55)
schal = (z >= 1.42) & (z < 1.56) & (ax < 0.3) & ~(kopf & (ax < 0.12) & (N[:, 1] < 0))                 # Tuch um Hals und Schultern
teil[umhang | (schal & (teil != "stahl"))] = "umhang"
namen, anzahl = np.unique(teil, return_counts=True); print("Flächen je Teil:", dict(zip(namen, anzahl.tolist())))

FARBE = {"umhang": "#2f58ab", "waffenrock": "#2f58ab", "stahl": "#9aa1ad", "guertel": "#6e4224", "stiefel": "#5c3720", "haar": "#5e3720"}
KOERPER = {"haut": "#e9b48f", "hemd": "#b9a586", "hose": "#4b3526", "hand": "#6a4127"}
def lin(h): h = h.lstrip("#"); c = np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32); return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def export(o, pfad):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    try: bpy.ops.export_scene.gltf(filepath=pfad, export_format="GLB", use_selection=True, export_vertex_color="ACTIVE", export_all_vertex_colors=True)
    except TypeError: bpy.ops.export_scene.gltf(filepath=pfad, export_format="GLB", use_selection=True)
def herauslösen(name):
    o = ob.copy(); o.data = ob.data.copy(); o.name = name; bpy.context.collection.objects.link(o); bm = bmesh.new(); bm.from_mesh(o.data); bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if teil[f.index] != name], context="FACES"); bm.to_mesh(o.data); bm.free()
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = tuple(lin(FARBE[name])) + (1,)
    b.inputs["Roughness"].default_value = 0.4 if name == "stahl" else 0.85; b.inputs["Metallic"].default_value = 0.6 if name == "stahl" else 0.0
    o.data.materials.clear(); o.data.materials.append(m); return o
stuecke = {n: herauslösen(n) for n in FARBE if (teil == n).any()}
for n, o in stuecke.items(): export(o, os.path.join(ziel, n + ".glb")); print(f"Teil {n}: {len(o.data.vertices)} Punkte")

# ---- 3. Grundkörper: ohne Umhang und Waffenrock, geschlossen, neu vernetzt, leicht nach innen
g = ob.copy(); g.data = ob.data.copy(); g.name = "koerper"; bpy.context.collection.objects.link(g); bm = bmesh.new(); bm.from_mesh(g.data); bm.faces.ensure_lookup_table()
KOPF_Z = 1.48                                                                                    # der Kopf bleibt das Originalnetz (Gesicht!), nur der Rest wird neu vernetzt
bmesh.ops.delete(bm, geom=[f for f in bm.faces if teil[f.index] in ("umhang", "waffenrock") or C[f.index][2] >= KOPF_Z], context="FACES")
bmesh.ops.holes_fill(bm, edges=bm.edges, sides=0); bm.to_mesh(g.data); bm.free()
bpy.ops.object.select_all(action="DESELECT"); g.select_set(True); bpy.context.view_layer.objects.active = g
r = g.modifiers.new("neu", "REMESH"); r.mode = "VOXEL"; r.voxel_size = float(opt.get("voxel", 0.012)); bpy.ops.object.modifier_apply(modifier="neu")
s = g.modifiers.new("glatt", "SMOOTH"); s.factor = 0.6; s.iterations = 4; bpy.ops.object.modifier_apply(modifier="glatt")
for v in g.data.vertices: v.co -= v.normal * float(opt.get("einzug", 0.012))
h = ob.copy(); h.data = ob.data.copy(); bpy.context.collection.objects.link(h); bm = bmesh.new(); bm.from_mesh(h.data); bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[f for f in bm.faces if C[f.index][2] < KOPF_Z - 0.03], context="FACES"); bm.normal_update()
for v in bm.verts: v.co -= v.normal * 0.005                                                        # knapp unter dem Haar-Teil (sonst flimmern beide an derselben Stelle)
bm.to_mesh(h.data); bm.free(); bpy.ops.object.select_all(action="DESELECT"); g.select_set(True); h.select_set(True); bpy.context.view_layer.objects.active = g; bpy.ops.object.join()
# Farben des Grundkörpers: Haut an Gesicht und Händen, Haar oben am Kopf, Leinenhemd am Oberkörper und den Armen, Hose an den Beinen
kd = KDTree(F)
for i, c in enumerate(C): kd.insert(c, i)
kd.balance(); farbe = np.zeros((len(g.data.vertices), 3), np.float32)
GES = np.array([v.co[:] for v in g.data.vertices if v.co.z > 1.55 and v.co.y < -0.05 and abs(v.co.x) < 0.1])   # Augen: auf Höhe der Nasenwurzel (vorderster Punkt des Gesichts oberhalb der Mitte), seitlich versetzt
AUGE = (float(opt.get("augen_x", 0.042)), float(GES[np.argmin(GES[:, 1]), 2] + 0.035) if len(GES) else 1.66)
print("Augen bei x ±%.3f, z %.3f" % AUGE)
for v in g.data.vertices:
    _, i, _ = kd.find(v.co); t = teil[i]; p = v.co
    if p.z > 1.52:
        f = FARBE["haar"] if t == "haar" and not (p.y < -0.05 and p.z < 1.72 and abs(p.x) < 0.11) else KOERPER["haut"]
        if p.y < -0.06 and abs(abs(p.x) - AUGE[0]) < 0.016 and abs(p.z - AUGE[1]) < 0.011: f = "#2a1d17"            # Augen
        elif p.y < -0.06 and abs(abs(p.x) - AUGE[0]) < 0.03 and 0.016 < p.z - AUGE[1] < 0.03: f = FARBE["haar"]   # Brauen
    elif abs(p.x) > 0.55 and p.z < 1.05: f = KOERPER["hand"]
    elif p.z < 0.42: f = FARBE["stiefel"]
    elif p.z < 0.98: f = KOERPER["hose"]
    else: f = KOERPER["hemd"]
    farbe[v.index] = lin(f)
ca = g.data.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1).ravel())
mk = bpy.data.materials.new("koerper"); mk.use_nodes = True; vc = mk.node_tree.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; mk.node_tree.links.new(vc.outputs[0], mk.node_tree.nodes["Principled BSDF"].inputs["Base Color"])
g.data.materials.clear(); g.data.materials.append(mk); export(g, os.path.join(ziel, "koerper.glb")); print(f"Grundkörper: {len(g.data.vertices)} Punkte")

# ---- 4. Kontrollbild: Grundkörper und Teile, Teile kräftig eingefärbt
sc = bpy.context.scene; ob.hide_render = True; sc.render.engine = "CYCLES"; sc.cycles.samples = 12; sc.render.film_transparent = True; sc.render.resolution_x = 1600; sc.render.resolution_y = 520
cam = bpy.data.objects.new("k", bpy.data.cameras.new("k")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = 6.2; sc.camera = cam
cam.location = (0, -10, 0.95); cam.rotation_euler = (math.radians(90), 0, 0)
l = bpy.data.objects.new("l", bpy.data.lights.new("l", "SUN")); l.data.energy = 4; l.rotation_euler = (math.radians(50), 0, math.radians(-30)); sc.collection.objects.link(l)
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
alle = [g] + list(stuecke.values()); kopien = []
for j, (dx, rot, nur) in enumerate(((-2.4, 0, None), (-0.8, 180, None), (0.8, 0, "koerper"), (2.4, 180, "koerper"))):
    for o in alle:
        if nur and o is not g: continue
        c = o.copy(); bpy.context.collection.objects.link(c); c.matrix_world = Matrix.Translation((dx, 0, 0)) @ Matrix.Rotation(math.radians(rot), 4, "Z"); kopien.append(c)
for o in alle: o.hide_render = True
sc.render.filepath = os.path.join(ziel, "teile.png"); bpy.ops.render.render(write_still=True); print("Kontrollbild:", sc.render.filepath, "(links: mit Teilen vorn/hinten, rechts: nur Grundkörper vorn/hinten)")
