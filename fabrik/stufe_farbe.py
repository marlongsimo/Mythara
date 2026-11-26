"""Mythara Fabrik – Seltenheitsstufe für ein Teil OHNE Textur (nur Materialfarben, z. B. die Angelrute aus fabrik/angelzeug.py).

  <blender-python> fabrik/stufe_farbe.py <teil.glb> <ziel.glb> <stufe>
  stufe: training | gewoehnlich | episch | legendaer | mythisch   (selten = das Teil selbst)

Wie fabrik/seltenheit.py … holz=1 bei Holzbeil und Spitzhacke: Materialien mit „holz“/„griff“ werden je Stufe gebeizt
(verwittert grau, schlicht, –, Nussbaum, rotbraun, Ebenholz), „metall“ wird rostig / dunkles Eisen / – / geschwärzt mit blauem Leuchten /
Gold mit orangem Glühen / Weißgold mit türkis-violettem Leuchten; Wicklungen passen sich an. Skelettbindung bleibt erhalten.
"""
import os, sys
import bpy

teil, ziel, stufe = sys.argv[-3:]
HOLZ = {"training": (0.24, 0.21, 0.17), "gewoehnlich": (0.36, 0.22, 0.1), "episch": (0.17, 0.085, 0.035), "legendaer": (0.3, 0.07, 0.03), "mythisch": (0.03, 0.025, 0.032)}
METALL = {"training": ((0.24, 0.1, 0.04), 0.3, 0.9, None), "gewoehnlich": ((0.11, 0.11, 0.12), 0.8, 0.7, None),
          "episch": ((0.05, 0.06, 0.09), 1.0, 0.35, (0.15, 0.4, 1.0)), "legendaer": ((0.9, 0.6, 0.2), 1.0, 0.3, (1.0, 0.45, 0.1)),
          "mythisch": ((0.85, 0.82, 0.78), 1.0, 0.25, (0.35, 0.3, 1.0))}
WICKEL = {"training": (0.25, 0.18, 0.13), "gewoehnlich": (0.2, 0.05, 0.03), "episch": (0.03, 0.08, 0.35), "legendaer": (0.55, 0.25, 0.02), "mythisch": (0.35, 0.05, 0.5)}
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(teil))
for m in bpy.data.materials:
    b = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
    if not b: continue
    n = m.name.lower()
    if n.startswith(("holz", "griff")):
        f = HOLZ[stufe]; k = 0.8 if n.startswith("griff") else 1.0
        b.inputs["Base Color"].default_value = (f[0] * k, f[1] * k, f[2] * k, 1); b.inputs["Roughness"].default_value = 0.75 if stufe == "training" else 0.55
    elif n.startswith("metall"):
        f, me, ra, gl = METALL[stufe]; b.inputs["Base Color"].default_value = (*f, 1); b.inputs["Metallic"].default_value = me; b.inputs["Roughness"].default_value = ra
        if gl: b.inputs["Emission Color"].default_value = (*gl, 1); b.inputs["Emission Strength"].default_value = 1.5
    elif n.startswith("wickel"):
        b.inputs["Base Color"].default_value = (*WICKEL[stufe], 1)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=False)
print("Stufe:", stufe, ziel, os.path.getsize(ziel) // 1024, "KB")
