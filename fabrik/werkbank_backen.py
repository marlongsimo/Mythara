"""Mythara Fabrik – Holz der Werkbank in eine Textur backen (Blender-Muster gehen nicht ins glTF) und als Spieldatei ausgeben.
  python3 fabrik/werkbank_backen.py -- <werkbank.blend> img/objekte3d/skilling/handwerk/werkbank.glb"""
import bpy, sys, os
q, ziel = sys.argv[sys.argv.index("--")+1:][:2]
bpy.ops.wm.open_mainfile(filepath=q); sc = bpy.context.scene
for n in ("Plane",): 
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n])
holzmats = {"eiche", "bein"}
holz = [o for o in bpy.data.objects if o.type == "MESH" and o.data.materials and o.data.materials[0] and o.data.materials[0].name in holzmats]
bpy.ops.object.select_all(action="DESELECT")
for o in [o for o in bpy.data.objects if o.type == "MESH" and not o.parent]:                  # Fasen anwenden
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
for o in holz: o.select_set(True)
bpy.context.view_layer.objects.active = holz[0]; bpy.ops.object.join(); h = bpy.context.object; h.name = "werkbank_holz"
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.01); bpy.ops.object.mode_set(mode="OBJECT")
img = bpy.data.images.new("werkbank_holz", 1024, 1024)
for m in h.data.materials:
    t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = img; m.node_tree.nodes.active = t
sc.render.engine = "CYCLES"; sc.cycles.samples = 4; sc.render.bake.use_pass_direct = False; sc.render.bake.use_pass_indirect = False; sc.render.bake.margin = 8
bpy.ops.object.select_all(action="DESELECT"); h.select_set(True); bpy.context.view_layer.objects.active = h; bpy.ops.object.bake(type="DIFFUSE")
img.pack()
neu = bpy.data.materials.new("werkbank_holz"); neu.use_nodes = True; bs = neu.node_tree.nodes["Principled BSDF"]; t = neu.node_tree.nodes.new("ShaderNodeTexImage"); t.image = img
neu.node_tree.links.new(t.outputs["Color"], bs.inputs["Base Color"]); bs.inputs["Roughness"].default_value = 0.75
h.data.materials.clear(); h.data.materials.append(neu)
for o in list(bpy.data.objects):
    if o.type in ("CAMERA", "LIGHT"): bpy.data.objects.remove(o)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP", export_apply=True)
print("Werkbank:", ziel, os.path.getsize(ziel) // 1024, "KB")
