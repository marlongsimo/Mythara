"""Mythara Fabrik – eine fertige Spielfigur zu Stein machen (Turmwächter): Farben → Helligkeit × Steinton, dunkle Stellen moosig,
matt statt metallisch; Augenschlitze und helle Kanten leuchten schwach grün (das grüne Licht des Turms). Skelett und Bewegungen bleiben.

  <blender-python> fabrik/stein.py -- <figur.glb> <ziel.glb> [ton=#a39d90] [moos=#5d6b4a] [gluehen=0.6]
"""
import os, sys
import numpy as np
import bpy

a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
def farbe(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)
TON, MOOS, GL = farbe(opt.get("ton", "#a39d90")), farbe(opt.get("moos", "#5d6b4a")), float(opt.get("gluehen", 0.6))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
basis = set()
for m in bpy.data.materials:
    if not m.node_tree: continue
    for l in m.node_tree.links:
        if l.from_node.type == "TEX_IMAGE" and l.to_node.type in ("BSDF_PRINCIPLED", "MIX") and l.to_socket.name in ("Base Color", "A", "B"): basis.add(l.from_node.image.name)
    b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if b:
        for l in list(b.inputs["Metallic"].links) + list(b.inputs["Roughness"].links): m.node_tree.links.remove(l)
        b.inputs["Metallic"].default_value = 0.0; b.inputs["Roughness"].default_value = 0.92
for im in bpy.data.images:
    w, h = im.size
    if not w or im.name not in basis: continue
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); rgb = a[..., :3]
    L = (rgb @ np.array([0.3, 0.55, 0.15], np.float32))[..., None]; L = np.clip(0.18 + L * 1.25, 0, 1)   # Kontrast etwas flacher: Stein
    moos = np.clip((0.32 - L) / 0.2, 0, 1) * 0.55
    rauschen = (np.random.default_rng(3).random((h, w, 1), dtype=np.float32) - 0.5) * 0.06               # körnige Oberfläche
    a[..., :3] = np.clip(L * (TON * (1 - moos) + MOOS * moos) + rauschen, 0, 1); im.pixels[:] = a.ravel(); im.update(); print("Stein:", im.name)
for m in bpy.data.materials:                                                                    # grünes Glühen aus den hellsten Stellen (Kanten, Augen)
    if not m.node_tree: continue
    b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None); tex = next((n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image and n.image.name in basis), None)
    if b and tex and GL > 0:
        nt = m.node_tree; ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position = 0.86; ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
        ramp.color_ramp.elements[1].position = 0.97; ramp.color_ramp.elements[1].color = (0.25, 1.0, 0.45, 1); g = nt.nodes.new("ShaderNodeRGBToBW")
        nt.links.new(tex.outputs["Color"], g.inputs["Color"]); nt.links.new(g.outputs["Val"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = GL
for o in bpy.data.objects:
    if o.type == "MESH":
        for ca in list(o.data.color_attributes): o.data.color_attributes.remove(ca)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=True, export_image_format="WEBP")
print("Stein:", ziel, os.path.getsize(ziel) // 1024, "KB")
