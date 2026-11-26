"""Mythara Fabrik – die Wacht von Graufurt aus der Stadtwache: Blau → Schiefergrau-Blau (der graue Fluss) und auf dem Schild das Wappen
„Turm über drei Wellen“ (Quest A2): drei silberne Wellenlinien unter dem Turm, in die Textur gemalt.

  <blender-python> fabrik/graufurt_wacht.py -- <teil.glb> <ziel.glb> [wellen=1] [animationen=1]

animationen=1: eine fertige Spielfigur (z. B. img/figuren-echt3d/stadtwache3d.glb) samt Skelett und Bewegungen umfärben.

wellen=1 nur für den Schild (schild.wache): die Schildfläche liegt zweimal nebeneinander in der Textur (Turm bei x ≈ 0,36 und 0,64 der Breite, Fuß bei y ≈ 0,53).
"""
import math, os, sys
import numpy as np
import bpy
from PIL import Image, ImageDraw

a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x)
TON, SATT, HELL = 205.0, 0.42, 0.82                                                             # Schiefer: blaugrau, gedämpft

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
farbe = set()                                                                                   # nur Farbtexturen (keine Normal- oder Rauheitskarten)
for m in bpy.data.materials:
    if not m.node_tree: continue
    for l in m.node_tree.links:
        if l.from_node.type == "TEX_IMAGE" and l.to_node.type in ("BSDF_PRINCIPLED", "MIX", "MIX_RGB") and l.to_socket.name in ("Base Color", "A", "B", "Color1", "Color2"): farbe.add(l.from_node.image.name)
for im in bpy.data.images:
    w, h = im.size
    if not w or im.name not in farbe: continue
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); c = hsv(a[..., :3])
    k = np.clip((40 - np.abs(((c[..., 0] - 228 + 180) % 360) - 180)) / 14, 0, 1) * np.clip((c[..., 1] - 0.3) / 0.15, 0, 1)   # das Blau der Wache
    n = c.copy(); n[..., 0] = TON; n[..., 1] = c[..., 1] * SATT; n[..., 2] = c[..., 2] * HELL
    a[..., :3] = a[..., :3] * (1 - k[..., None]) + rgb(n) * k[..., None]
    if opt.get("wellen") == "1":                                                   # Wappen: drei Wellen unter dem Turm (Bild oben = Textur unten: Blender-Pixel stehen auf dem Kopf)
        bild = Image.fromarray((np.flipud(a) * 255).clip(0, 255).astype(np.uint8), "RGBA"); d = ImageDraw.Draw(bild); sx, sy = w / 512, h / 512
        for cx in (183, 328):
            for j, y in enumerate((274, 287, 300)):
                pts = [(cx + x / 2, y + 3 * math.sin(x / 2 / 10.0 * math.pi)) for x in range(-56 + j * 6, 57 - j * 6)]
                d.line([(px * sx, py * sy) for px, py in pts], fill=(40, 46, 56, 255), width=max(3, round(6 * sy)))   # dunkler Rand
                d.line([(px * sx, py * sy) for px, py in pts], fill=(214, 218, 222, 255), width=max(2, round(3.5 * sy)))
        a = np.flipud(np.array(bild, np.float32) / 255)
    im.pixels[:] = a.ravel(); im.update(); print("Wacht:", im.name, f"{float(k.mean()) * 100:.1f} % umgefärbt")
for o in bpy.data.objects:                                                                      # Teile mit Punktfarben (rig.py-Hüllen, Sets): ebenso umfärben
    if o.type != "MESH": continue
    for ca in o.data.color_attributes:
        n_ = len(ca.data); a = np.zeros(n_ * 4, np.float32); ca.data.foreach_get("color", a); a = a.reshape(-1, 4)
        srgb = np.where(a[:, :3] <= 0.0031308, a[:, :3] * 12.92, 1.055 * np.power(np.clip(a[:, :3], 0, None), 1 / 2.4) - 0.055)   # Punktfarben sind linear
        c = hsv(srgb[None])[0]; k = np.clip((40 - np.abs(((c[:, 0] - 228 + 180) % 360) - 180)) / 14, 0, 1) * np.clip((c[:, 1] - 0.3) / 0.15, 0, 1)
        nn = c.copy(); nn[:, 0] = TON; nn[:, 1] = c[:, 1] * SATT; nn[:, 2] = c[:, 2] * HELL; neu = srgb * (1 - k[:, None]) + rgb(nn[None])[0] * k[:, None]
        a[:, :3] = np.where(neu <= 0.04045, neu / 12.92, ((neu + 0.055) / 1.055) ** 2.4); ca.data.foreach_set("color", a.ravel()); print("Wacht:", o.name, ca.name, f"{float(k.mean()) * 100:.1f} % der Punkte umgefärbt")
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=opt.get("animationen") == "1", export_image_format="WEBP")
