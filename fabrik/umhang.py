"""Mythara Fabrik – einen Umhang als eigenes, hängendes Teil bauen (gebogenes Tuch von den Schultern bis zu den Knien).

  python3 fabrik/umhang.py <ziel.glb> [farbe=#2f58ab] [breite=0.56] [laenge=0.92] [saum=#c9a24a]

Ursprung = Mitte der Oberkante (zwischen den Schulterblättern); das Tuch hängt nach -z, ist um den Rücken gebogen (Mitte weiter hinten, +y)
und schwingt unten etwas nach hinten aus, damit die Beine beim Gehen nicht hindurchstoßen. rig.py hängt es mit "art": "umhang" an die Brust.
"""
import sys
import numpy as np
import bpy, bmesh

ziel = sys.argv[1]; opt = dict(a.split("=", 1) for a in sys.argv[2:] if "=" in a)
B = float(opt.get("breite", 0.56)); L = float(opt.get("laenge", 0.92))
def farbe(h): h = h.lstrip("#"); return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1.0,)
bpy.ops.wm.read_factory_settings(use_empty=True); bm = bmesh.new(); nx, nz = 14, 18; V = []
for j in range(nz + 1):
    t = j / nz; breite = B * (0.8 + 0.35 * t)                                                    # oben schmal (Schultern), unten weiter
    for i in range(nx + 1):
        u = i / nx * 2 - 1; x = u * breite / 2; y = 0.07 * (1 - u * u) + 0.2 * t ** 1.6 - 0.03 * u * u   # um den Rücken gebogen, unten nach hinten ausgestellt
        z = -t * L + 0.025 * np.sin(u * 7) * t                                                    # leichte Falten zum Saum hin
        V.append(bm.verts.new((x, y, z)))
for j in range(nz):
    for i in range(nx): a = j * (nx + 1) + i; bm.faces.new((V[a], V[a + 1], V[a + nx + 2], V[a + nx + 1]))
me = bpy.data.meshes.new("umhang"); bm.to_mesh(me); ob = bpy.data.objects.new("umhang", me); bpy.context.collection.objects.link(ob)
s = ob.modifiers.new("dicke", "SOLIDIFY"); s.thickness = 0.018; bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier="dicke")
m = bpy.data.materials.new("tuch"); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = farbe(opt.get("farbe", "#2f58ab")); b.inputs["Roughness"].default_value = 0.9
g = bpy.data.materials.new("saum"); g.use_nodes = True; b = g.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = farbe(opt.get("saum", "#c9a24a")); b.inputs["Roughness"].default_value = 0.5
me.materials.append(m); me.materials.append(g)
for p in me.polygons: p.material_index = 1 if p.center.z < -L + 0.05 else 0                       # Saum unten in Gold
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB"); print(f"Umhang: {B} × {L} m · geschrieben: {ziel}")
