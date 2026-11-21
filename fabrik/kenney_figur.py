"""Mythara Fabrik – den Kenney-Körper „characterMedium“ (CC0, kenney.nl) als Körpermodell für die Fabrik vorbereiten.

  python3 fabrik/kenney_figur.py <characterMedium.fbx> <haut.png> <ziel.glb> [stufen=3]

1. Modell und Haut laden; die Arme aus der T-Haltung um 65° senken (wie die übrigen Körpermodelle: Arme leicht abgespreizt)
2. die Haltung fest ins Netz übernehmen, Kenneys Skelett entfernen (die Fabrik baut ihr eigenes)
3. auf 1,80 m bringen, Füße auf den Boden, Blick nach -y
4. das Netz ohne Glättung unterteilen (die kantige Kenney-Form bleibt) und die Haut in Punktfarben übertragen,
   damit Gesicht und Kleidung in den Punktfarben stecken, die rig.py für Körper und Hüllen liest
"""
import json, os, sys
import numpy as np
import bpy
from mathutils import Matrix, Quaternion, Vector
from PIL import Image

fbx, haut, ziel = sys.argv[1:4]; STUFEN = int(next((a.split("=")[1] for a in sys.argv[4:] if a.startswith("stufen=")), 3))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.fbx(filepath=fbx)
ob = next(o for o in bpy.data.objects if o.type == "MESH"); arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE")
for name, w in (("LeftArm", 65), ("RightArm", -65)):                                              # +x ist die linke Seite der Figur; um die Blickachse drehen senkt den Arm
    pb = arm.pose.bones[name]; kopf = arm.matrix_world @ pb.head
    R = Matrix.Translation(kopf) @ Quaternion((0, 1, 0), np.radians(w)).to_matrix().to_4x4() @ Matrix.Translation(-kopf)
    pb.matrix = arm.matrix_world.inverted() @ R @ arm.matrix_world @ pb.matrix; bpy.context.view_layer.update()
bpy.ops.object.mode_set(mode="OBJECT"); bpy.context.view_layer.update()
NAMEN = {"becken": "Hips", "bauch": "Spine", "brust": "Chest", "hals": "Neck", "kopf": "Head", "scheitel": "Head_end"}
for S, k in (("L", "Left"), ("R", "Right")):
    NAMEN.update({f"huefte.{S}": k + "UpLeg", f"knie.{S}": k + "Leg", f"knoechel.{S}": k + "Foot", f"zehe.{S}": k + "Toes_end", f"schulter.{S}": k + "Arm", f"ellbogen.{S}": k + "ForeArm", f"hand.{S}": k + "Hand", f"spitze.{S}": k + "HandIndex3_end"})
GELENK = {g: arm.matrix_world @ arm.pose.bones[b].head for g, b in NAMEN.items()}                  # Kenneys Gelenke in der gesenkten Haltung, im Raum der Welt
bpy.context.view_layer.objects.active = ob
for m in list(ob.modifiers):
    if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
ob.parent = None; ob.matrix_world = ob.matrix_world.copy()
for o in list(bpy.data.objects):
    if o is not ob: bpy.data.objects.remove(o)
bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
P = np.array([v.co[:] for v in ob.data.vertices]); h = P[:, 2].max() - P[:, 2].min(); k = 1.8 / h
T = Matrix.Scale(k, 4); ob.data.transform(T); P = np.array([v.co[:] for v in ob.data.vertices])
T2 = Matrix.Translation(Vector((-(P[:, 0].max() + P[:, 0].min()) / 2, -(P[:, 1].max() + P[:, 1].min()) / 2, -P[:, 2].min()))); ob.data.transform(T2); T = T2 @ T
nrm = sum((p.normal * p.area for p in ob.data.polygons if p.center.z > 1.2), Vector())             # Brust und Gesicht zeigen nach vorn: sonst um 180° drehen
if nrm.y > 0: ob.data.transform(Matrix.Rotation(np.pi, 4, "Z")); T = Matrix.Rotation(np.pi, 4, "Z") @ T; print("um 180° gedreht (Blick nach -y)")
GW = {g: [round(c, 4) for c in (T @ p)] for g, p in GELENK.items()}; GW["scheitel"][2] = 1.8
for S in "LR":                                                                                   # Gelenke in die Mitte der Gliedmaßen (Kenneys Knochen liegen teils am Rand); Fingerspitze etwas über die Hand hinaus
    GW["spitze." + S] = [round(v, 4) for v in (Vector(GW["hand." + S]) + (Vector(GW["spitze." + S]) - Vector(GW["hand." + S])).normalized() * 0.1)]
json.dump(GW, open(os.path.join(os.path.dirname(os.path.abspath(ziel)), "gelenke.json"), "w"), indent=1); print("Gelenke:", {k: v for k, v in GW.items() if k in ("becken", "brust", "kopf", "schulter.L", "hand.L", "knie.L")})
m = ob.modifiers.new("teilen", "SUBSURF"); m.subdivision_type = "SIMPLE"; m.levels = m.render_levels = STUFEN; bpy.ops.object.modifier_apply(modifier="teilen")
me = ob.data; tex = np.asarray(Image.open(haut).convert("RGB")).astype(np.float32) / 255; th, tw = tex.shape[:2]
uv = np.zeros(len(me.loops) * 2, np.float32); me.uv_layers[0].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
ecke = np.zeros(len(me.loops), int); me.loops.foreach_get("vertex_index", ecke)
px = np.clip((uv[:, 0] % 1.0) * (tw - 1), 0, tw - 1).astype(int); py = np.clip((1 - uv[:, 1] % 1.0) * (th - 1), 0, th - 1).astype(int)
farbe_ecke = tex[py, px]; lin = np.where(farbe_ecke <= 0.04045, farbe_ecke / 12.92, ((farbe_ecke + 0.055) / 1.055) ** 2.4)
summe = np.zeros((len(me.vertices), 3)); n = np.zeros(len(me.vertices)); np.add.at(summe, ecke, lin); np.add.at(n, ecke, 1); farbe = (summe / np.maximum(n, 1)[:, None]).astype(np.float32)
while me.color_attributes: me.color_attributes.remove(me.color_attributes[0])
ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1).ravel())
mat = bpy.data.materials.new("koerper"); mat.use_nodes = True; nt = mat.node_tree; f = nt.nodes.new("ShaderNodeTexImage"); f.image = bpy.data.images.load(os.path.abspath(haut)); f.interpolation = "Closest"
nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.8   # die Haut selbst (scharfes Gesicht); die Punktfarben bleiben für rig.py
me.materials.clear(); me.materials.append(mat); ob.name = "koerper"
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
P = np.array([v.co[:] for v in me.vertices]); print(f"Kenney-Körper: {len(me.vertices)} Punkte, Maße {np.ptp(P, 0).round(2)} m · geschrieben: {ziel}")
