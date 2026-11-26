"""Mythara Fabrik – Schleuder (Banditen-Späher): zwei Lederschnüre mit Fingerschlaufe, unten eine Lederschale mit Stein.

  <blender-python> fabrik/schleuder.py -- <ziel.glb>

Ursprung = Fingerschlaufe (dort hält die Hand), die Schnüre hängen nach +z bis zur Schale (≈ 0,5 m) – wie ein Werkzeug „Griff unten, Spitze oben“;
in rig.py "art": "schwert", "griff" ≈ 0.95. Ein Teil, eine Textur-freie Materialliste.
"""
import math, os, sys
import bpy
from mathutils import Vector

ZIEL = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, r=0.7):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in c], 1); b.inputs["Roughness"].default_value = r; return m
LEDER = mat("leder", (110, 72, 42)); SCHNUR = mat("schnur", (150, 115, 75), 0.85); STEIN = mat("stein", (125, 122, 115), 0.9)
def rohr(p0, p1, r, m):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m)
L = 0.48
bpy.ops.mesh.primitive_torus_add(major_radius=0.018, minor_radius=0.004, location=(0, 0, 0.0), rotation=(math.radians(90), 0, 0)); bpy.context.object.data.materials.append(SCHNUR)
for s in (-1, 1):                                                                             # zwei Schnüre, unten zur Schale gespreizt
    pts = [(0.0, 0.0, 0.015), (s * 0.006, 0.0, L * 0.5), (s * 0.03, 0.0, L - 0.02)]
    for a, b in zip(pts, pts[1:]): rohr(a, b, 0.0028, SCHNUR)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.045, location=(0, 0, L + 0.012)); o = bpy.context.object; o.scale = (1.0, 0.75, 0.42); o.data.materials.append(LEDER)
for p in o.data.polygons: p.use_smooth = True
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.022, location=(0, 0, L + 0.03)); o = bpy.context.object; o.scale = (1, 0.9, 0.8); o.data.materials.append(STEIN)
for o in bpy.context.scene.objects: o.select_set(True)
bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Schleuder:", os.path.getsize(ZIEL) // 1024, "KB")
