"""Mythara Fabrik – die Wachtrüstung (zweites Set, Nahkampf, Phase 8) aus der Form der Eisenwacht: neue Teile an einer Grundfigur, umgefärbt.

  <blender-python> fabrik/set_wacht.py -- <teil.eisenwacht.glb> <ziel.glb> <neue-id>

Farben (Textur, Lab-ähnlich über Farbton/Sättigung/Helligkeit):
  Stoff und Leder (dunkel, mäßig farbig)  → Schiefergrau-Blau wie die Wacht von Graufurt (#4d5d6e)
  Messing/Bronze (warm, farbig, hell)     → mattes Silber
  Stahl (wenig Farbe)                     → etwas heller und kühler
Der Knoten des Netzes heißt danach wie die neue Ebene (z. B. ruestung.brust.wacht). Skelettbindung bleibt; Grundfigur unverändert.
"""
import os, sys
import numpy as np
import bpy

q, ziel, neu_id = sys.argv[sys.argv.index("--") + 1:][:3]
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
basis = set()
for m in bpy.data.materials:
    if m.node_tree:
        for l in m.node_tree.links:
            if l.from_node.type == "TEX_IMAGE" and l.to_socket.name == "Base Color": basis.add(l.from_node.image.name)
for im in bpy.data.images:
    w, h = im.size
    if not w or im.name not in basis: continue
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); c = hsv(a[..., :3]); H, S, V = c[..., 0], c[..., 1], c[..., 2]
    warm = ((H > 15) & (H < 60)).astype(np.float32)
    messing = warm * np.clip((S - 0.35) / 0.15, 0, 1) * np.clip((V - 0.45) / 0.15, 0, 1)                       # hell und farbig: Beschläge
    stoff = np.clip((S - 0.18) / 0.12, 0, 1) * np.clip((0.5 - V) / 0.15, 0, 1) * (1 - messing)                 # dunkel und etwas farbig: Leder, Stoff
    stahl = np.clip((0.18 - S) / 0.1, 0, 1) * (1 - messing) * (1 - stoff)
    n = c.copy()
    st = c.copy(); st[..., 0] = 210; st[..., 1] = 0.38; st[..., 2] = np.clip(V * 1.1 + 0.04, 0, 1)            # Schiefer
    me = c.copy(); me[..., 0] = 215; me[..., 1] = 0.06; me[..., 2] = np.clip(V * 1.05, 0, 1)                    # Silber
    sl = c.copy(); sl[..., 0] = 212; sl[..., 1] = np.minimum(S, 0.08); sl[..., 2] = np.clip(V * 1.15, 0, 1)    # Stahl kühl und heller
    out = a[..., :3] * (1 - stoff - messing - stahl)[..., None] + rgb(st) * stoff[..., None] + rgb(me) * messing[..., None] + rgb(sl) * stahl[..., None]
    a[..., :3] = np.clip(out, 0, 1); im.pixels[:] = a.ravel(); im.update()
    print(f"Wacht-Set: {im.name} Stoff {stoff.mean() * 100:.0f} % · Messing {messing.mean() * 100:.0f} % · Stahl {stahl.mean() * 100:.0f} %")
for o in bpy.data.objects:
    if o.type == "MESH" and o.name not in ("Icosphere",) and len(o.data.vertices) > 100: o.name = neu_id; o.data.name = neu_id
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_image_format="WEBP")
print("Wacht-Set:", neu_id, "→", ziel)
