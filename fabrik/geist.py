"""Mythara Fabrik – eine fertige Spielfigur als Geist: durchscheinend, grün leuchtend, Farben der Textur nur als Helligkeitsmuster.

  <blender-python> fabrik/geist.py -- <figur.glb> <ziel.glb> [farbe=#7dffb0] [deckung=0.55] [leuchten=1.6]

Skelett und Bewegungen bleiben (Rundreise durch den glTF-Import/Export). Jedes Material: Grundfarbe = Farbe × Helligkeit der Textur,
Leuchten in derselben Farbe, Alpha = deckung (glTF alphaMode BLEND) – im Spiel durchscheinend, ohne eigenen Shader.
"""
import os, sys
import bpy

a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
h = opt.get("farbe", "#7dffb0").lstrip("#"); F = tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))
DECK, LEUCHT = float(opt.get("deckung", 0.55)), float(opt.get("leuchten", 1.6))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
for m in bpy.data.materials:
    if not m.node_tree: continue
    nt = m.node_tree; b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if not b: continue
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
    for l in list(b.inputs["Base Color"].links) + list(b.inputs["Emission Color"].links): nt.links.remove(l)
    if tex:                                                                                         # Helligkeit der Textur × Geisterfarbe
        g = nt.nodes.new("ShaderNodeRGBToBW"); mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
        nt.links.new(tex.outputs["Color"], g.inputs["Color"]); nt.links.new(g.outputs["Val"], mul.inputs[6]); mul.inputs[7].default_value = (*F, 1)
        nt.links.new(mul.outputs[2], b.inputs["Base Color"]); nt.links.new(mul.outputs[2], b.inputs["Emission Color"])
    else:
        b.inputs["Base Color"].default_value = (*F, 1); b.inputs["Emission Color"].default_value = (*F, 1)
    b.inputs["Emission Strength"].default_value = LEUCHT; b.inputs["Alpha"].default_value = DECK; b.inputs["Metallic"].default_value = 0; b.inputs["Roughness"].default_value = 0.6
    m.surface_render_method = "BLENDED" if hasattr(m, "surface_render_method") else None
    if hasattr(m, "blend_method"): m.blend_method = "BLEND"
for o in bpy.data.objects:                                                                          # Punktfarben würden die Farbe überdecken
    if o.type == "MESH":
        for ca in list(o.data.color_attributes): o.data.color_attributes.remove(ca)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=True, export_image_format="WEBP")
print("Geist:", ziel, os.path.getsize(ziel) // 1024, "KB")
