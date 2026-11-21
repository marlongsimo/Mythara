"""Mythara Fabrik – Kleidung in der Textur eines Grundkörpers umfärben (z. B. helles Leinen → schmutziges Braun für einen Banditen).

  python3 fabrik/textur_umfaerben.py <koerper.glb> <ziel.glb> [farbe=#4a3b2a] [hell_ab=0.42] [saettigung_bis=0.32]

Getroffen werden helle, wenig gesättigte Bildpunkte (Leinen); Haut (gesättigt, orange) und dunkles Leder bleiben.
Die Helligkeitsunterschiede (Falten, Nähte) bleiben erhalten: neue Farbe × relative Helligkeit.
"""
import os, sys
import numpy as np
import bpy
quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
hexf = opt.get("farbe", "#4a3b2a"); NEU = np.array([int(hexf[i:i + 2], 16) / 255 for i in (1, 3, 5)])
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
o = next(x for x in bpy.data.objects if x.type == "MESH"); img = next(i for i in bpy.data.images if i.size[0] > 0)
w, h = img.size; px = np.array(img.pixels[:], np.float32).reshape(h, w, 4); c = px[..., :3]
lum = c @ np.array([0.3, 0.59, 0.11]); sat = (c.max(-1) - c.min(-1)) / (c.max(-1) + 1e-6)
leinen = (lum > float(opt.get("hell_ab", 0.42))) & (sat < float(opt.get("saettigung_bis", 0.32)))
rel = lum / max(float(np.median(lum[leinen])), 1e-3) if leinen.any() else lum
px[..., :3] = np.where(leinen[..., None], np.clip(NEU[None, None, :] * rel[..., None], 0, 1), c)
nb = bpy.data.images.new(img.name + "_um", w, h, alpha=True); nb.pixels.foreach_set(px.ravel()); nb.update()
nb.filepath_raw = os.path.abspath(ziel) + ".png"; nb.file_format = "PNG"; nb.save(); nb.pack(); os.remove(nb.filepath_raw)
for m in o.data.materials:
    for n in (m.node_tree.nodes if m and m.node_tree else []):
        if n.type == "TEX_IMAGE" and n.image == img: n.image = nb
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"umgefärbt: {100 * leinen.mean():.1f} % der Textur → {hexf} · geschrieben {ziel}")
