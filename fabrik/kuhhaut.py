"""Mythara Fabrik – Beutestück Kuhhaut in Blender bauen: ein flach am Boden liegendes Fell (Umriss mit vier Beinlappen und Hals),
leicht gewellt, eine Ecke umgeschlagen; Fleckenmuster weiß/kastanienbraun wie die Kuh, in eine Textur gebacken. Ohne Animation.

  python3 fabrik/kuhhaut.py -- <ziel.glb> [vorschau.blend]
"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ziel = a_[0]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(5)
L, B, NU, NV = 0.95, 0.72, 76, 58                                                               # Länge (y), Breite (x) in m
def innen(x, y):
    """Umriss eines Fells: ovaler Körper, vier Beinlappen an den Ecken, Hals vorn, Schwanzende hinten"""
    u, v = x / (B / 2), y / (L / 2)
    koerper = (abs(u) / 0.78) ** 2.4 + (abs(v) / 0.82) ** 2.4 < 1
    lappen = any(((u - sx * 0.82) / 0.2) ** 2 + ((v - sy * 0.62) / 0.3) ** 2 < 1 for sx in (-1, 1) for sy in (-1, 1))
    hals = (u / 0.28) ** 2 + ((v + 0.88) / 0.2) ** 2 < 1; schwanz = abs(u) < 0.05 and 0.75 < v < 1.0
    rand = 0.04 * math.sin(7 * math.atan2(v, u)) + 0.03 * math.sin(13 * math.atan2(v, u) + 1)
    return koerper or lappen or hals or schwanz or ((abs(u) / 0.78) ** 2.4 + (abs(v) / 0.82) ** 2.4 < 1 + rand)
bm = bmesh.new(); uvl = bm.loops.layers.uv.new("UVMap"); V = {}
for i in range(NU + 1):
    for j in range(NV + 1):
        x = (j / NV - 0.5) * B * 1.05; y = (i / NU - 0.5) * L * 1.1
        if innen(x, y):
            z = 0.006 * math.sin(x * 23 + y * 7) + 0.005 * math.sin(y * 19 - x * 5) + 0.012 * max(0, 1 - (x * x + y * y) / 0.12)   # Wellen, Mitte leicht gewölbt
            V[i, j] = bm.verts.new((x, y, z))
for (i, j), v in list(V.items()):
    q = [V.get(k) for k in ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))]
    if all(q):
        f = bm.faces.new(q)
        for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))): l[uvl].uv = (b / NV, a / NU)
rand_ = [v for v in bm.verts if v.is_boundary]                                                  # Rand glätten (aus dem Raster ausgeschnitten: sonst treppig)
for _ in range(10): bmesh.ops.smooth_vert(bm, verts=rand_, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=False)
# eine Ecke umschlagen: Punkte jenseits der Faltlinie über die Linie zurückklappen und etwas anheben
n = Vector((0.6, 0.8, 0)).normalized(); d0 = 0.26
for v in bm.verts:
    d = v.co.dot(n) - d0
    if d > 0: v.co = v.co - n * (2 * d) + Vector((0, 0, 0.014 + 0.01 * min(1, d / 0.05)))
me = bpy.data.meshes.new("kuhhaut"); bm.to_mesh(me); bm.free(); fell = bpy.data.objects.new("kuhhaut", me); bpy.context.collection.objects.link(fell)
fell.modifiers.new("dicke", "SOLIDIFY").thickness = 0.007
m = bpy.data.materials.new("fell"); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes["Principled BSDF"]; bs.inputs["Roughness"].default_value = 0.85
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 1.3, 1.0); nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 2.6; n1.inputs["Detail"].default_value = 3; n1.inputs["Distortion"].default_value = 0.5; nt.links.new(mp.outputs["Vector"], n1.inputs["Vector"])
r1 = nt.nodes.new("ShaderNodeValToRGB"); r1.color_ramp.elements[0].position = 0.5; r1.color_ramp.elements[1].position = 0.53
r1.color_ramp.elements[0].color = (0.84, 0.79, 0.70, 1); r1.color_ramp.elements[1].color = (0.30, 0.09, 0.03, 1); nt.links.new(n1.outputs["Fac"], r1.inputs["Fac"])
n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 160; nt.links.new(mp.outputs["Vector"], n2.inputs["Vector"])
mix = nt.nodes.new("ShaderNodeMixRGB"); mix.blend_type = "MULTIPLY"; mix.inputs["Fac"].default_value = 0.16; nt.links.new(r1.outputs["Color"], mix.inputs["Color1"]); nt.links.new(n2.outputs["Fac"], mix.inputs["Color2"])
nt.links.new(mix.outputs["Color"], bs.inputs["Base Color"]); fell.data.materials.append(m)
bpy.context.view_layer.objects.active = fell; fell.select_set(True); bpy.ops.object.modifier_apply(modifier="dicke")
img = bpy.data.images.new("kuhhaut", 1024, 1024); t = nt.nodes.new("ShaderNodeTexImage"); t.image = img; nt.nodes.active = t
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 4; sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False; sc.render.bake.margin = 6
bpy.ops.object.bake(type="DIFFUSE"); img.pack()
neu = bpy.data.materials.new("kuhhaut"); neu.use_nodes = True; nb = neu.node_tree.nodes["Principled BSDF"]; tt = neu.node_tree.nodes.new("ShaderNodeTexImage"); tt.image = img
neu.node_tree.links.new(tt.outputs["Color"], nb.inputs["Base Color"]); nb.inputs["Roughness"].default_value = 0.85; fell.data.materials.clear(); fell.data.materials.append(neu)
lo = min(v.co.z for v in fell.data.vertices)
for v in fell.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP", export_animations=False)
print("Kuhhaut:", ziel, os.path.getsize(ziel) // 1024, "KB")
