"""Mythara Fabrik – Krummsäbel der Karawanenräuber (Phase 9, Glutsande): gebogene, einschneidige Klinge, Messing-Parierstange, dunkle Griffwicklung.

  <blender-python> fabrik/krummsaebel.py -- <ziel.glb>
Ausrichtung wie die anderen Waffen der Fabrik: Knauf oben (+z), Klinge nach unten, Länge 0,92 m; der Griff liegt in den oberen 16 % ("griff": 0.08).
"""
import math, os, sys
import bpy
ziel = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, r, me):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in c], 1); b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = me; return m
STAHL, MESSING, LEDER = mat("stahl", (200, 204, 210), 0.3, 0.9), mat("messing", (196, 150, 70), 0.35, 0.85), mat("leder", (60, 38, 28), 0.8, 0)
L, OBEN = 0.92, 0.92; GZ = OBEN - 0.15                                                         # Klinge von GZ bis 0
N = 14; vs, fs = [], []
for i in range(N + 1):
    u = i / N; z = GZ - u * GZ; x = 0.13 * u * u; w = 0.042 * (1 - u ** 3) + 0.004 + 0.012 * math.sin(math.pi * min(1, u / 0.85)) * (u > 0.6)
    d = 0.0035 * (1 - 0.7 * u)
    vs += [(x - 0.5 * w, 0, z), (x + 0.5 * w * 0.4, d, z), (x + 0.5 * w, 0, z), (x + 0.5 * w * 0.4, -d, z)]   # Rücken, Flanke, Schneide, Flanke
for i in range(N):
    a, b = 4 * i, 4 * (i + 1)
    for k in range(4): fs.append((a + k, a + (k + 1) % 4, b + (k + 1) % 4, b + k))
me = bpy.data.meshes.new("klinge"); me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new("klinge", me); bpy.context.collection.objects.link(o); me.materials.append(STAHL)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.0, 0, GZ + 0.008)); g = bpy.context.object; g.scale = (0.15, 0.03, 0.016); g.data.materials.append(MESSING)
for sx in (-1, 1): bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, segments=8, ring_count=5, location=(sx * 0.075, 0, GZ + 0.008)); bpy.context.object.data.materials.append(MESSING)
bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.016, depth=0.13, location=(0, 0, GZ + 0.08)); bpy.context.object.data.materials.append(LEDER)
for k in range(6): bpy.ops.mesh.primitive_torus_add(major_radius=0.017, minor_radius=0.003, location=(0, 0, GZ + 0.025 + k * 0.021), rotation=(0.25, 0, 0), major_segments=10, minor_segments=4); bpy.context.object.data.materials.append(LEDER)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.024, segments=10, ring_count=6, location=(0.012, 0, OBEN - 0.01)); bpy.context.object.scale = (1.2, 0.8, 1); bpy.context.object.data.materials.append(MESSING)
bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = o; bpy.ops.object.join(); bpy.ops.object.shade_flat()
o.name = "krummsaebel"; bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True); print("Krummsäbel:", ziel)
