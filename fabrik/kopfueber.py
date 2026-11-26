"""Mythara Fabrik – ein Werkzeug (Kopf oben) für die Hand umdrehen: Kopf unten, Stielende oben – so liegen alle Waffen der Fabrik (Griffpunkt von oben gemessen).
  python3 fabrik/kopfueber.py -- <quelle.glb> <ziel.glb>"""
import bpy, sys, os
q, z = sys.argv[sys.argv.index("--")+1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
for o in bpy.data.objects:
    if o.type == "MESH":
        o.data.transform(o.matrix_world); o.matrix_world.identity()
        for v in o.data.vertices: v.co.x, v.co.z = -v.co.x, -v.co.z
        o.data.flip_normals() if hasattr(o.data, "flip_normals") else None
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(z), export_format="GLB", use_selection=True, export_image_format="WEBP")
