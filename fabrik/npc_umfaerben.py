"""Mythara Fabrik – NPC-Kleidung umfärben (Förster). Aufruf: python3 fabrik/npc_umfaerben.py -- <npcmann3d koerper.glb> <haut.webp> <ziel.webp>
Kleidung des npcmann3d umfärben: Bereiche nach Körperhöhe (Rock/Weste grün, Hose oliv-braun), Haut und Stiefel bleiben."""
import bpy, sys, os, numpy as np
from PIL import Image
q, hautbild, ziel = sys.argv[sys.argv.index("--")+1:][:3]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q))
o = next(x for x in bpy.data.objects if x.type == "MESH"); me = o.data
img = bpy.data.images.load(os.path.abspath(hautbild)); W, H = img.size
basis = np.array(img.pixels[:], np.float32).reshape(H, W, 4)
Z = np.array([(o.matrix_world @ v.co).z for v in me.vertices]); Z = (Z - Z.min()) / (Z.max() - Z.min())   # 0 = Fuß, 1 = Scheitel
X = np.array([abs((o.matrix_world @ v.co).x) for v in me.vertices])
uv = me.uv_layers.active.data; region = np.zeros((H, W), np.uint8)   # 1 = Rock/Weste, 2 = Hose
from PIL import ImageDraw
mi = Image.new("L", (W, H), 0); d = ImageDraw.Draw(mi)
for p in me.polygons:
    z = Z[list(p.vertices)].mean(); x = X[list(p.vertices)].mean()
    if 0.47 < z < 0.83 and not (x > 0.26 and z < 0.66):
        r = 4 if (x > 0.17 and 0.70 < z < 0.79) else 3 if (x > 0.17 or z > 0.79) else 1   # 4 = Ärmel, 3 = Arm/Hals (dort Haut möglich)
    elif 0.17 < z <= 0.47 and x < 0.17: r = 2                                                    # Hose (ohne die Hände daneben)
    else: r = 0
    if r: d.polygon([(uv[l].uv[0] * W, (1 - uv[l].uv[1]) * H) for l in p.loop_indices], fill=r)
region = np.asarray(mi)[::-1]                                                                      # Blender-Bilder stehen auf dem Kopf
c = basis[..., :3]; mx = c.max(-1); mn = c.min(-1); s = (mx - mn) / np.maximum(mx, 1e-4)
r_, g_, b_ = c[..., 0], c[..., 1], c[..., 2]; hue = np.degrees(np.arctan2(np.sqrt(3) * (g_ - b_), 2 * r_ - g_ - b_)) % 360
haut = (hue > 8) & (hue < 38) & (s > 0.28) & (s < 0.75) & (mx > 0.42) & (r_ > g_) & (g_ > b_)
metall = s < 0.12                                                                                  # Schnallen, Nieten
def faerben(m, ziel_rgb):
    hell = mx[m] / max(1e-4, np.median(mx[m])); c[m] = np.clip(np.array(ziel_rgb)[None] * hell[:, None], 0, 1)
rumpf = ((region == 1) | (region == 4) | ((region == 3) & ~haut)) & ~metall
hellig = rumpf & ((mx > 0.35) | (region == 4)); dunkel = rumpf & ~hellig                                             # helles Hemd / dunkle Weste
faerben(hellig, (0.30, 0.38, 0.17))                                                                  # Hemd: helles Moosgrün (linear)
faerben(dunkel, (0.07, 0.15, 0.06))                                                                 # Weste: dunkles Tannengrün
faerben((region == 2) & ~metall, (0.24, 0.15, 0.07))                                                # Hose: Lederbraun
basis[..., :3] = c; img.pixels[:] = basis.ravel(); img.filepath_raw = os.path.abspath(ziel); img.file_format = "WEBP"; img.save()
print("Förster-Textur:", ziel, "Rock", int((region == 1).sum()), "Hose", int((region == 2).sum()))
