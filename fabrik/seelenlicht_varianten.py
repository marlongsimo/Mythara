"""Mythara Fabrik – Seelenlicht-Varianten (Konzept Phase 3): gleiche Form, Textur umgefärbt; dazu das Ersatzbild und der Bibliothekseintrag.

  <blender-python> fabrik/seelenlicht_varianten.py

  matt       – „Mattes Licht“ (Stufe 1, um die Linde): blasses, milchiges Blaugrau, wenig Leuchten
  wiesen     – „Wiesenlicht“ (Stufe 10, Riedwiesen / Quelle der Obstwiesen): frisches Grüntürkis
  irrlicht   – Irrlicht (Stufe 20, Rabenmoor über dem Wasser): fahles Grün
  grablicht  – Grablicht (Stufe 35, Friedhof, Obelisk Nordwald): kaltes, helles Eisblau
  nebellicht – Nebellicht (Stufe 45, Nebelfelder Rabenmoor): blasses Lavendel, schwebt tiefer und träger
  splitterlicht – Splitterlicht (Stufe 65, über dem Splitterbecken): kräftiges Violett wie die Splitter
  erloschen  – abgeerntet/erschöpft: fast farblos, dunkel, sinkt tiefer und schwebt träge (kein Puls, da ohne Sättigung)

Schreibt img/objekte3d/wahrzeichen/seelenlicht_<v>.glb, img/welt/stil/wz_seelenlicht_<v>.webp und Einträge wz_seelenlicht_<v> in
realtime/welt/bibliothek/objekte.json (Kopie von wz_seelenlicht; nicht platziert).
"""
import copy, json, os
import numpy as np
import bpy
from PIL import Image

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAR = {"matt": ("Mattes Licht", 0, 0.38, 0.92, None), "wiesen": ("Wiesenlicht", -50, 0.85, 1.0, None),
       "irrlicht": ("Irrlicht", -95, 0.75, 1.0, None), "grablicht": ("Grablicht", -10, 0.3, 1.45, None),
       "nebellicht": ("Nebellicht", 45, 0.35, 0.95, {"hoehe": 0.7, "hub": 0.2, "takt": 4.5, "pendel": 0.5}), "splitterlicht": ("Splitterlicht", 55, 1.15, 1.1, None),
       "erloschen": ("Erloschenes Seelenlicht", 0, 0.08, 0.5, {"hoehe": 0.45, "hub": 0.04, "takt": 5.0, "pendel": 0.12})}

def hsv(rgb):
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn; h = np.zeros_like(mx); m = d > 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    i = m & (mx == r); h[i] = ((g - b)[i] / d[i]) % 6
    i = m & (mx == g) & ~(mx == r); h[i] = (b - r)[i] / d[i] + 2
    i = m & (mx == b) & ~(mx == r) & ~(mx == g); h[i] = (r - g)[i] / d[i] + 4
    return np.stack([h / 6, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx], -1)
def rgb(c):
    h, s, v = c[..., 0] * 6, c[..., 1], c[..., 2]; i = np.floor(h).astype(int) % 6; f = h - np.floor(h)
    p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
    w = [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]
    return np.stack([np.choose(i, [x[k] for x in w]) for k in range(3)], -1)
def faerben(a, ton, saett, hell):
    c = hsv(a[..., :3]); c[..., 0] = (c[..., 0] + ton / 360) % 1; c[..., 1] = np.clip(c[..., 1] * saett, 0, 1); c[..., 2] = np.clip(c[..., 2] * hell, 0, 1)
    if saett < 0.5: c[..., 2] = np.clip(c[..., 2] * 0.85 + 0.12 * (1 - saett) * hell, 0, 1)   # milchig statt nur grau
    a[..., :3] = rgb(c); return a

BIB = os.path.join(W, "realtime/welt/bibliothek/objekte.json"); B = json.load(open(BIB)); L = B["objekte"]
basis = next(o for o in L if o["id"] == "wz_seelenlicht")
for v, (name, ton, saett, hell, schweben) in VAR.items():
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.join(W, "img/objekte3d/wahrzeichen/seelenlicht.glb"))
    for im in bpy.data.images:
        w, h = im.size
        if not w: continue
        a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); im.pixels[:] = faerben(a, ton, saett, hell).ravel(); im.update()
    for m in bpy.data.materials:                                                              # Leuchtfarbe mitfärben
        b = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
        if b:
            for k in ("Base Color", "Emission Color"):
                c = np.array(b.inputs[k].default_value[:], np.float32)[None, None]; b.inputs[k].default_value = tuple(faerben(c, ton, saett, hell)[0, 0])
    ziel = os.path.join(W, f"img/objekte3d/wahrzeichen/seelenlicht_{v}.glb"); bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True, export_image_format="WEBP")
    a = np.array(Image.open(os.path.join(W, basis["bild"])).convert("RGBA"), np.float32) / 255     # Ersatzbild ebenso umfärben
    Image.fromarray((faerben(a, ton, saett, hell) * 255).clip(0, 255).astype(np.uint8), "RGBA").save(os.path.join(W, f"img/welt/stil/wz_seelenlicht_{v}.webp"), "WEBP", quality=92)
    e = copy.deepcopy(basis); e["id"] = f"wz_seelenlicht_{v}"; e["name"] = name; e["bild"] = f"img/welt/stil/wz_seelenlicht_{v}.webp"
    e["herkunft"] = basis["herkunft"] + f", umgefärbt mit fabrik/seelenlicht_varianten.py ({v})"; e["modell3d"]["url"] = f"img/objekte3d/wahrzeichen/seelenlicht_{v}.glb"
    if ton: e["modell3d"]["puls_ton"] = 210 + ton                                             # Puls folgt dem neuen Farbton
    if schweben: e["modell3d"]["schweben"] = schweben; e["modell3d"]["wind"] = 0.02
    L[:] = [o for o in L if o["id"] != e["id"]]; L.insert(L.index(basis) + list(VAR).index(v) + 1, e)
    print("Seelenlicht:", v, os.path.getsize(ziel) // 1024, "KB")
with open(BIB, "w") as f: json.dump(B, f, ensure_ascii=False, indent=1); f.write("\n")
