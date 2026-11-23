"""Mythara Fabrik – ein Rüstungsteil in einer anderen Seltenheitsstufe: gleiche Form, anderes Material.

  python3 fabrik/seltenheit.py <teil.glb> <ziel.glb> <stufe>
  teil.glb: am besten die fertige, ans Skelett gebundene Teil-Datei aus export3d.py auslagern=… (img/figuren-echt3d/<figur>.teile/<id>.glb)
  stufe: gewoehnlich | selten | episch | legendaer | mythisch
Die Textur wird in drei Bereiche geteilt (Lab-Farbraum): Metall (grau, wenig Farbe), Beschläge (Messing: farbig und hell) und Leder (farbig und dunkel).
Jede Stufe färbt sie eigen und legt bei episch/legendär eine Leuchtkarte auf die Beschläge (glTF emissive – three.js zeigt sie direkt):
  gewöhnlich – mattes, dunkles Eisen mit Rost, Beschläge aus Eisen      selten – unverändert (olivgrauer Stahl, Messing)
  episch     – geschwärzter Stahl mit blauem Schimmer, Gold, schwaches blaues Leuchten der Kanten
  legendär   – dunkler Stahl mit warmem Glanz, leuchtendes Gold, glühende Kanten (orange)
  mythisch   – Obsidian mit Ölfilm-Schillern (Violett, Türkis, Rosa), Weißgold, Kanten und Energieadern leuchten von Türkis bis Magenta
"""
import os, sys
import numpy as np
import bpy
from PIL import Image
teil, ziel, stufe = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def srgb(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, None), 1 / 2.4) - 0.055)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); W = np.array([0.95047, 1.0, 1.08883])
def lab(rgb):
    x = (lin(rgb) @ M.T) / W; f = np.where(x > 0.008856, np.cbrt(x), 7.787 * x + 16 / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)
def rgb(L):
    fy = (L[:, 0] + 16) / 116; fx = fy + L[:, 1] / 500; fz = fy - L[:, 2] / 200; f = np.stack([fx, fy, fz], 1)
    x = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * W; return np.clip(srgb(x @ np.linalg.inv(M).T), 0, 1)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(teil))
img = max(bpy.data.images, key=lambda b: b.size[0] * b.size[1]); B_, H_ = img.size
a = np.array(img.pixels[:], dtype=np.float32).reshape(-1, 4); L = lab(a[:, :3]); C = np.hypot(L[:, 1], L[:, 2])
metall = C < 9; messing = (C >= 9) & (L[:, 0] > 30); leder = (C >= 9) & ~messing
print(f"Bereiche: Metall {metall.mean():.0%}, Beschläge {messing.mean():.0%}, Leder {leder.mean():.0%}")
N = L.copy(); glut = np.zeros(len(L)); glutfarbe = (0, 0, 0); glutstaerke = 0.0
def setze(maske, L_=None, dL=0.0, fL=1.0, a=None, b=None, fC=None):
    if L_ is not None: N[maske, 0] = L_
    N[maske, 0] = N[maske, 0] * fL + dL
    if fC is not None: N[maske, 1] *= fC; N[maske, 2] *= fC
    if a is not None: N[maske, 1] += a
    if b is not None: N[maske, 2] += b
if stufe == "gewoehnlich":
    setze(metall, fL=0.78, dL=-2, fC=0.3, a=2.5, b=6)                     # stumpfes Eisen, leicht rostbraun
    rost = metall & (L[:, 0] < np.percentile(L[metall, 0], 35)); setze(rost, a=6, b=10)
    setze(messing, fL=0.62, fC=0.15, b=3)                                   # Beschläge: Eisen statt Messing
elif stufe == "episch":
    setze(metall, fL=0.62, fC=0.2, a=1, b=-9)                               # geschwärzter Stahl, blauer Schimmer
    setze(messing, fL=1.05, dL=4, fC=1.3, a=2, b=9)                         # Gold
    glut = (messing & (L[:, 0] > 48)).astype(float); glutfarbe = (0.35, 0.55, 1.0); glutstaerke = 0.35
elif stufe == "legendaer":
    setze(metall, fL=0.68, fC=0.45, a=3, b=3)                               # dunkler Stahl, warm
    setze(messing, fL=1.1, dL=6, fC=1.5, a=5, b=16)                         # leuchtendes Gold
    setze(leder, fL=0.85, a=6, b=-2)                                        # Leder tief rotbraun
    glut = (messing & (L[:, 0] > 45)).astype(float); glutfarbe = (1.0, 0.55, 0.15); glutstaerke = 0.75
elif stufe == "mythisch":                                                  # über legendär, bewusst ausgefallen
    v_, u_ = np.divmod(np.arange(len(L)), B_); u_ = u_ / B_; v_ = v_ / H_   # Lage in der Textur (für Verläufe)
    schiller = np.stack([np.sin(u_ * 9 + v_ * 5) , np.cos(u_ * 7 - v_ * 8)], 1)   # Ölfilm-Schillern: Violett, Türkis, Rosa je nach Stelle
    N[metall, 0] = L[metall, 0] * 0.42 + 4; N[metall, 1] = 22 * schiller[metall, 0] + 8; N[metall, 2] = 20 * schiller[metall, 1] - 10
    N[messing, 0] = np.clip(L[messing, 0] * 1.05 + 22, 0, 96); N[messing, 1] = L[messing, 1] * 0.2 + 4; N[messing, 2] = L[messing, 2] * 0.35 + 6   # Weißgold
    N[leder, 0] = L[leder, 0] * 0.6; N[leder, 1] = 14; N[leder, 2] = -18     # Leder tief violett
    Lb = L[:, 0].reshape(H_, B_); gx = np.abs(np.diff(Lb, axis=1, append=Lb[:, -1:])); gy = np.abs(np.diff(Lb, axis=0, append=Lb[-1:, :]))
    kante = (gx + gy).ravel(); adern = metall & (kante > np.percentile(kante[metall], 93)) & (L[:, 0] > 4)   # Energieadern: feine Linien im Metall
    glut = np.maximum((messing & (L[:, 0] > 40)).astype(float), adern * 0.8); glutstaerke = 1.1
    t_ = (np.sin(v_ * 12 + u_ * 3) + 1) / 2; glutfarbe = None; GLUT_RGB = np.stack([0.2 + 0.8 * t_, 0.85 - 0.6 * t_, 1.0 * np.ones_like(t_)], 1)   # Türkis ↔ Magenta
elif stufe != "selten": sys.exit("Stufe unbekannt: " + stufe)
a[:, :3] = rgb(N); img.pixels[:] = a.ravel(); img.pack()
if glutstaerke:                                                             # Leuchtkarte: nur die Beschläge, weich ausgeblendet
    g = np.asarray(Image.fromarray((glut.reshape(H_, B_) * 255).astype(np.uint8)).resize((B_ // 2, H_ // 2), Image.BILINEAR).resize((B_, H_), Image.BILINEAR), np.float32) / 255
    g = np.clip(g * 1.2, 0, 1).ravel(); e = np.zeros((B_ * H_, 4), np.float32); e[:, 3] = 1
    farbe = GLUT_RGB if glutfarbe is None else np.tile(np.array(glutfarbe, np.float32), (B_ * H_, 1)); e[:, :3] = g[:, None] * farbe
    eb = bpy.data.images.new("glut", B_, H_); eb.pixels[:] = e.ravel(); eb.pack()
    for m in bpy.data.materials:
        if not m.node_tree: continue
        bs = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not bs: continue
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = eb; t.image.colorspace_settings.name = "sRGB"
        uv = next((n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image == img), None)
        if uv and uv.inputs["Vector"].is_linked: m.node_tree.links.new(uv.inputs["Vector"].links[0].from_socket, t.inputs["Vector"])
        m.node_tree.links.new(t.outputs["Color"], bs.inputs["Emission Color"]); bs.inputs["Emission Strength"].default_value = glutstaerke
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_image_format="WEBP")
print(f"Seltenheit {stufe}: {ziel}")
