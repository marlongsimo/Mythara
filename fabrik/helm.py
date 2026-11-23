"""Mythara Fabrik – einfacher Nasalhelm, an die Kopfform eines Grundkörpers angepasst (Teilnetz für rig.py, starr am Kopf: "nur_knochen": ["kopf"]).

  python3 fabrik/helm.py <basis.blend> <ziel.glb> [abstand=0.018] [stirn=0.62] [nacken=0.3] [nase=0.075]
Kappe: eine Kugel, Punkt für Punkt von außen auf den Kopf geschossen und um „abstand“ (m) nach außen gesetzt (lieber mehr Spiel als zu wenig).
Unterkante vorn auf Stirnhöhe („stirn“ = Anteil der Kopflänge über dem Kopfansatz), hinten tiefer bis zum Nacken („nacken“), dazu ein Reif am Rand,
ein Nasenschutz („nase“ m lang) und ein Kamm über den Scheitel. Stahl, Reif und Kamm Messing.
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
basis, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
AB, STIRN, NACKEN, NASE = float(opt.get("abstand", 0.018)), float(opt.get("stirn", 0.62)), float(opt.get("nacken", 0.3)), float(opt.get("nase", 0.075))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper"); KN = arm.data.bones
kh, kt = KN["kopf"].head_local, KN["kopf"].tail_local; L = kt.z - kh.z
bm = bmesh.new(); bm.from_mesh(k.data); bvh = BVHTree.FromBMesh(bm)
P = np.array([v.co[:] for v in k.data.vertices]); kopf = P[(P[:, 2] > kh.z + 0.1 * L) & (np.abs(P[:, 0] - kh.x) < 0.2)]
M = Vector(((kopf[:, 0].min() + kopf[:, 0].max()) / 2, (kopf[:, 1].min() + kopf[:, 1].max()) / 2, kh.z + 0.55 * L))
def mat(n, c, met, rau):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Metallic"].default_value = met; b.inputs["Roughness"].default_value = rau; return m
STAHL, MESSING = mat("stahl", (0.42, 0.43, 0.46), 0.9, 0.38), mat("messing", (0.62, 0.42, 0.14), 0.9, 0.35)
z_vorn, z_hinten = kh.z + STIRN * L, kh.z + NACKEN * L
def unterkante(y):                                                         # vorn (−y) auf Stirnhöhe, hinten tiefer
    t = min(1.0, max(0.0, (y - (M.y - 0.06)) / 0.14)); return z_vorn + (z_hinten - z_vorn) * t
# Kappe: Kugel auf den Kopf schießen
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=0.3, location=M); kap = bpy.context.object
for v in kap.data.vertices:
    d = (kap.matrix_world @ v.co - M).normalized(); h = bvh.ray_cast(M + d * 0.5, -d)
    r = ((h[0] - M).length if h[0] is not None else 0.1) + AB; v.co = (M + d * r) - kap.location
kap.data.update(); bm2 = bmesh.new(); bm2.from_mesh(kap.data)
for _ in range(3): bmesh.ops.smooth_vert(bm2, verts=bm2.verts, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
weg = [v for v in bm2.verts if (kap.location + v.co).z < unterkante((kap.location + v.co).y)]; bmesh.ops.delete(bm2, geom=weg, context="VERTS")
rand = [e for e in bm2.edges if e.is_boundary]; bm2.to_mesh(kap.data); bm2.free()
s = kap.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.006; s.offset = 1; bpy.context.view_layer.objects.active = kap; bpy.ops.object.modifier_apply(modifier="d"); kap.data.materials.append(STAHL)
teile = [kap]
# Reif: Ring entlang der Unterkante (aus den Randpunkten der Kappe, leicht nach außen)
W = [kap.matrix_world @ v.co for v in kap.data.vertices]; wz = np.array([[w.x, w.y, w.z] for w in W])
rp = sorted([w for w in W if w.z < unterkante(w.y) + 0.012], key=lambda w: math.atan2(w.y - M.y, w.x - M.x))
n = 64; ring = []
for i in range(n):
    a = -math.pi + 2 * math.pi * i / n; nah = min(rp, key=lambda w: abs(((math.atan2(w.y - M.y, w.x - M.x) - a + math.pi) % (2 * math.pi)) - math.pi)); d = Vector((nah.x - M.x, nah.y - M.y, 0)).normalized()
    ring.append(Vector((nah.x, nah.y, unterkante(nah.y) + 0.012)) + d * 0.004)
cu = bpy.data.curves.new("reif", "CURVE"); cu.dimensions = "3D"; sp = cu.splines.new("POLY"); sp.points.add(n - 1)
for i, p in enumerate(ring): sp.points[i].co = (*p, 1)
sp.use_cyclic_u = True; cu.bevel_depth = 0.008; cu.bevel_resolution = 2; ro = bpy.data.objects.new("reif", cu); bpy.context.collection.objects.link(ro); ro.data.materials.append(MESSING); teile.append(ro)
# Kamm über den Scheitel (von der Stirn bis in den Nacken)
pk = []
for i in range(25):
    a = math.radians(-70 + 150 * i / 24); d = Vector((0, -math.cos(a), math.sin(a)))   # von vorn über oben nach hinten
    d = Vector((0, -math.sin(math.radians(90) - a) if False else -math.cos(a), math.sin(a))).normalized()
    h = bvh.ray_cast(M + d * 0.5, -d); r = ((h[0] - M).length if h[0] is not None else 0.1) + AB + 0.008; p = M + d * r
    if p.z > unterkante(p.y) + 0.01: pk.append(p)
cu2 = bpy.data.curves.new("kamm", "CURVE"); cu2.dimensions = "3D"; sp2 = cu2.splines.new("POLY"); sp2.points.add(len(pk) - 1)
for i, p in enumerate(pk): sp2.points[i].co = (*p, 1)
cu2.bevel_depth = 0.007; ko = bpy.data.objects.new("kamm", cu2); bpy.context.collection.objects.link(ko); ko.data.materials.append(MESSING); teile.append(ko)
# Nasenschutz: von der Stirnkante gerade nach unten, vor dem Gesicht
vorn = min(W, key=lambda w: w.y if abs(w.x - M.x) < 0.02 and w.z < z_vorn + 0.03 else 9); oben = Vector((M.x, vorn.y - 0.006, z_vorn + 0.02))
nase_h = bvh.ray_cast(Vector((M.x, M.y - 0.5, z_vorn - NASE / 2)), Vector((0, 1, 0))); ny = (nase_h[0].y - 0.012) if nase_h[0] is not None else oben.y
bpy.ops.mesh.primitive_cube_add(size=1, location=(M.x, min(oben.y, ny), z_vorn + 0.02 - (NASE + 0.02) / 2)); na = bpy.context.object; na.scale = (0.022, 0.007, NASE + 0.02); na.data.materials.append(STAHL); teile.append(na)
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = kap; bpy.ops.object.convert(target="MESH"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); bpy.ops.object.join(); bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Helm: Kappe ab {z_vorn:.2f} m (vorn) / {z_hinten:.2f} m (hinten), Abstand {AB} m, Nasenschutz {NASE} m → {ziel}")
