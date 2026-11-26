"""Mythara Fabrik – Flasche mit Quellwasser (bauchige Glasflasche, Korken, Schnur, klares bläuliches Wasser) in Blender bauen.
  python3 fabrik/quellwasser.py -- <ziel.blend>      → danach fabrik/symbol.py für das Rucksackbild"""
import math, sys
import bpy
ziel = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
prof = [(0.0, 0.0), (0.055, 0.0), (0.075, 0.03), (0.082, 0.08), (0.075, 0.13), (0.05, 0.165), (0.024, 0.19), (0.022, 0.24), (0.027, 0.25), (0.0, 0.25)]   # Halbschnitt (r, z) in m
def drehkoerper(name, punkte, n=40):
    me = bpy.data.meshes.new(name); vs = []; fs = []
    for i in range(n):
        a = 2 * math.pi * i / n
        for r, z in punkte: vs.append((r * math.cos(a), r * math.sin(a), z))
    m = len(punkte)
    for i in range(n):
        for j in range(m - 1):
            a0, a1 = i * m + j, ((i + 1) % n) * m + j; fs.append((a0, a1, a1 + 1, a0 + 1))
    me.from_pydata(vs, [], fs); me.update(); o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    return o
def mat(name, farbe, rau=0.5, alpha=1.0, trans=0.0, ior=1.45):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*farbe, 1); b.inputs["Roughness"].default_value = rau
    b.inputs["Alpha"].default_value = alpha; b.inputs["Transmission Weight"].default_value = trans; b.inputs["IOR"].default_value = ior
    if alpha < 1: m.blend_method = "BLEND" if hasattr(m, "blend_method") else None
    return m
glas = drehkoerper("glas", prof); glas.data.materials.append(mat("glas", (0.75, 0.88, 0.85), 0.05, 0.35, 0.9))
wasser = drehkoerper("wasser", [(0.0, 0.006), (0.05, 0.006), (0.07, 0.032), (0.076, 0.08), (0.07, 0.125), (0.0, 0.125)]); wasser.data.materials.append(mat("wasser", (0.35, 0.65, 0.85), 0.05, 0.75, 0.6, 1.33))
korken = drehkoerper("korken", [(0.0, 0.235), (0.02, 0.235), (0.023, 0.29), (0.0, 0.29)], 20); korken.data.materials.append(mat("korken", (0.5, 0.33, 0.17), 0.9))
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.004, location=(0, 0, 0.2)); bpy.context.object.data.materials.append(mat("schnur", (0.55, 0.45, 0.3), 0.9))
bpy.ops.mesh.primitive_torus_add(major_radius=0.03, minor_radius=0.003, location=(0.03, 0, 0.15), rotation=(math.radians(90), 0, 0)); bpy.context.object.data.materials.append(mat("schnur2", (0.55, 0.45, 0.3), 0.9))
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("Quellwasser:", ziel)
