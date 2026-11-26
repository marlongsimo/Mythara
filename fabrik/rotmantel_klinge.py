"""Mythara Fabrik – Rotmantels Klinge: sein Zweihänder (waffe.zweihaender.warlord) mit eigener roter Griffwicklung.

  <blender-python> fabrik/rotmantel_klinge.py -- <zweihaender.glb> <ziel.glb>
Vorher die Beschläge rot färben: fabrik/textur_ton.py … ton=358 von=25 breite=25 saett=2.2 hell=1.25 ab_saett=0.15
Der Griff ist der schmale Teil oberhalb der Parierstange (Knauf oben, +z): dort eine schräg laufende rote Lederwicklung.
"""
import math, os, sys
import numpy as np
import bpy
from mathutils import Vector
q, ziel = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
ps = np.array([tuple(o.matrix_world @ v.co) for o in bpy.data.objects if o.type == "MESH" for v in o.data.vertices])
zmin, zmax = ps[:, 2].min(), ps[:, 2].max(); L = zmax - zmin
def breite(z0, z1): s = ps[(ps[:, 2] >= z0) & (ps[:, 2] < z1)]; return (np.hypot(s[:, 0] - np.median(s[:, 0]), s[:, 1] - np.median(s[:, 1])).max(), np.median(s[:, 0]), np.median(s[:, 1])) if len(s) else (0, 0, 0)
# Parierstange: von oben die erste Scheibe, die viel breiter als der Griff ist
g, cx, cy = breite(zmax - L * 0.1, zmax - L * 0.05); z = zmax - L * 0.05
while z > zmin + L * 0.4 and breite(z - L * 0.02, z)[0] < g * 2.2: z -= L * 0.01
oben, unten = zmax - L * 0.035, z + L * 0.005
m = bpy.data.materials.new("wicklung"); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (0.42, 0.02, 0.02, 1); b.inputs["Roughness"].default_value = 0.7
n = max(6, int((oben - unten) / 0.018))
for i in range(n):
    zz = unten + (oben - unten) * (i + 0.5) / n
    bpy.ops.mesh.primitive_torus_add(major_radius=g * 1.05 + 0.002, minor_radius=0.0045, location=(cx, cy, zz), rotation=(math.radians(14), 0, math.radians(37 * i)), major_segments=16, minor_segments=6)
    bpy.context.object.data.materials.append(m)
print("Wicklung:", n, "Ringe von", round(unten, 3), "bis", round(oben, 3), "m, Griffradius", round(g, 3))
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP")
