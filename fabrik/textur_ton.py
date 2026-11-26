"""Mythara Fabrik – einen Farbbereich in der Textur eines Körpers umfärben (z. B. das Banditenrot → Grün für den Späher).

  <blender-python> fabrik/textur_ton.py <koerper.glb> <ziel.glb> ton=<grad> [von=0] [breite=30] [saett=1.0] [hell=1.0] [ab_saett=0.3] [leuchten=0]

Getroffen werden Bildpunkte mit Farbton in von ± breite (Grad, Rot = 0) und Sättigung über ab_saett; sie bekommen den Farbton „ton“,
die Sättigung × saett und die Helligkeit × hell. Licht, Schatten und Muster bleiben; Haut (orange, ≈ 25°) liegt bei breite ≤ 18 außerhalb.
Weiche Kante: zum Rand des Bereichs blendet die Änderung aus.
"""
import os, sys
import numpy as np
import bpy

args = [a for a in sys.argv[sys.argv.index("--") + 1:]] if "--" in sys.argv else sys.argv[1:]
q, ziel = [a for a in args if "=" not in a][:2]; opt = dict(a.split("=", 1) for a in args if "=" in a)
TON, VON, BR = float(opt["ton"]), float(opt.get("von", 0)), float(opt.get("breite", 30))
SA, HE, AB = float(opt.get("saett", 1.0)), float(opt.get("hell", 1.0)), float(opt.get("ab_saett", 0.3))

def hsv(rgb):
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn; h = np.zeros_like(mx); m = d > 1e-6; r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    i = m & (mx == r); h[i] = ((g - b)[i] / d[i]) % 6
    i = m & (mx == g) & ~(mx == r); h[i] = (b - r)[i] / d[i] + 2
    i = m & (mx == b) & ~(mx == r) & ~(mx == g); h[i] = (r - g)[i] / d[i] + 4
    return np.stack([h * 60, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx], -1)
def rgb(c):
    h, s, v = c[..., 0] / 60, c[..., 1], c[..., 2]; i = np.floor(h).astype(int) % 6; f = h - np.floor(h)
    p, q_, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f)); w = [(v, t, p), (q_, v, p), (p, v, t), (p, q_, v), (t, p, v), (v, p, q_)]
    return np.stack([np.choose(i, [x[k] for x in w]) for k in range(3)], -1)

bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
for im in bpy.data.images:
    w, h = im.size
    if not w: continue
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); c = hsv(a[..., :3])
    ab = np.abs(((c[..., 0] - VON + 180) % 360) - 180)
    k = np.clip((BR - ab) / (BR * 0.35), 0, 1) * np.clip((c[..., 1] - AB) / 0.12, 0, 1)
    n = c.copy(); n[..., 0] = TON % 360; n[..., 1] = np.clip(c[..., 1] * SA, 0, 1); n[..., 2] = np.clip(c[..., 2] * HE, 0, 1)
    a[..., :3] = a[..., :3] * (1 - k[..., None]) + rgb(n) * k[..., None]; im.pixels[:] = a.ravel(); im.update()
    print("umgefärbt:", im.name, f"{float(k.mean()) * 100:.1f} % der Bildpunkte")
if float(opt.get("leuchten", 0)) > 0:                                                              # leuchten=<Stärke>: die Textur zusätzlich als Leuchtkarte (glTF emissive)
    for m in bpy.data.materials:
        if not m.node_tree: continue
        b = m.node_tree.nodes.get("Principled BSDF"); t = next((n for n in m.node_tree.nodes if n.type == "TEX_IMAGE"), None)
        if b and t: m.node_tree.links.new(t.outputs["Color"], b.inputs["Emission Color"]); b.inputs["Emission Strength"].default_value = float(opt["leuchten"])
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP")
