"""Mythara Fabrik – Rüstungssätze der Stufe 70 (Block H, #159) aus vorhandenen Teilen der Grundfiguren: umgefärbt, Turmschild gestreckt.

  <blender-python> fabrik/set_stufe70.py -- <teil.glb> <ziel.glb> <neue-id> stil=steinvogt|sturmfeder|frostschleier [strecken=1.6,1.15]

Teil = ans Skelett gebundene Teil-Datei aus img/figuren-echt3d/<figur>.teile/ (Skelett und Bindung bleiben, Grundfigur unverändert).
Farben (Textur, über Farbton/Sättigung/Helligkeit wie fabrik/set_wacht.py):
  steinvogt     – Nahkampf, passend zu Grumhold: Metall → verwitterter Fels (grau-ocker), dunkle Stellen moosig grün, Messing → alte Bronze
  sturmfeder    – Fernkampf: alles ins Sturmgrau-Blau entsättigt, helle Federn heller, dunkles Leder schiefergrau
  frostschleier – Magie: Stoff → Eisblau, helle Säume → frostweiß-silbern, schwaches blaues Leuchten an den hellsten Stellen
strecken=h,b: Teil in seiner Höhe (z) und Breite um den eigenen Mittelpunkt strecken (Turmschild aus dem Sternenschild).
Der Knoten des Netzes heißt danach wie die neue Ebene.
"""
import os, sys
import numpy as np
import bpy
a_ = sys.argv[sys.argv.index("--") + 1:]; q, ziel, neu_id = a_[:3]; opt = dict(x.split("=", 1) for x in a_[3:] if "=" in x); STIL = opt.get("stil", "steinvogt")
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
leucht = None
for im in bpy.data.images:
    w, h = im.size
    if not w or im.name not in basis: continue
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); c = hsv(a[..., :3]); H, S, V = c[..., 0], c[..., 1], c[..., 2]; n = c.copy()
    warm = ((H > 15) & (H < 60)).astype(np.float32); messing = warm * np.clip((S - 0.35) / 0.15, 0, 1) * np.clip((V - 0.45) / 0.15, 0, 1)
    if STIL == "steinvogt":
        dunkel = np.clip((0.35 - V) / 0.2, 0, 1)
        n[..., 0] = np.where(messing > 0.5, 32, 38 + 50 * dunkel); n[..., 1] = np.where(messing > 0.5, 0.45, 0.12 + 0.25 * dunkel); n[..., 2] = np.clip(V * (0.95 if messing.mean() else 1) * 0.92 + 0.05, 0, 1)
        n[..., 0] = np.where(dunkel > 0.5, 85, n[..., 0])                                         # Moos in den Fugen
    elif STIL == "sturmfeder":
        n[..., 0] = 212; n[..., 1] = np.minimum(S * 0.3, 0.18); n[..., 2] = np.clip(V * 1.7 + 0.2, 0, 1)
    else:
        hell = np.clip((V - 0.65) / 0.25, 0, 1)
        n[..., 0] = 198; n[..., 1] = np.clip(0.5 - 0.4 * hell, 0.08, 0.6); n[..., 2] = np.clip(V * 1.2 + 0.08, 0, 1)
        leucht = (hell, w, h)
    a[..., :3] = np.clip(rgb(n), 0, 1); im.pixels[:] = a.ravel(); im.update(); print(f"Stufe 70 ({STIL}): {im.name} umgefärbt")
if STIL == "frostschleier":                                                                       # schwaches eisblaues Leuchten
    for m in bpy.data.materials:
        b = next((x for x in m.node_tree.nodes if x.type == "BSDF_PRINCIPLED"), None) if m.node_tree else None
        if b: b.inputs["Emission Color"].default_value = (0.35, 0.65, 1.0, 1); b.inputs["Emission Strength"].default_value = 0.25
ms = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("Icosphere") and len(o.data.vertices) > 100]
if "strecken" in opt:
    fh, fb = [float(x) for x in opt["strecken"].split(",")]
    for o in ms:
        P = np.array([v.co[:] for v in o.data.vertices]); c = (P.max(0) + P.min(0)) / 2; ax = np.argsort(P.max(0) - P.min(0))   # dünnste Achse (Dicke) bleibt
        hoch, breit = ax[2], ax[1]; P[:, hoch] = c[hoch] + (P[:, hoch] - c[hoch]) * fh; P[:, breit] = c[breit] + (P[:, breit] - c[breit]) * fb
        o.data.vertices.foreach_set("co", P.ravel()); o.data.update()
for o in ms: o.name = neu_id; o.data.name = neu_id
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_image_format="WEBP", export_yup=True)
print("Stufe 70:", neu_id, "→", ziel)
