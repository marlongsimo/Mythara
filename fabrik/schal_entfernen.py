"""Mythara Fabrik – einen fest modellierten Schal (Halstuch, Kragen) aus einem Grundkörper mit Textur entfernen.

  python3 fabrik/schal_entfernen.py <koerper.glb> <ziel.glb> [farbe=blau] [hals_oben=1.6] [hals_unten=1.47] [brust_bis=1.40]

Erkannt wird der Schal an der Texturfarbe (blau: Blauanteil deutlich über Rot). Am Hals (zwischen hals_unten und hals_oben) werden seine
Punkte auf einen schlanken Halsquerschnitt gezogen (gemessen am Kopfansatz, nach unten etwas breiter) und hautfarben bemalt; darunter
(der Teil, der auf Brust und Schultern liegt) bleibt die Form, die Textur bekommt die Farbe des umgebenden Wamses.
"""
import os, sys
import numpy as np
import bpy, bmesh
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.spatial import cKDTree

quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
H1, H0, B0 = float(opt.get("hals_oben", 1.6)), float(opt.get("hals_unten", 1.47)), float(opt.get("brust_bis", 1.40))
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
o = next(x for x in bpy.data.objects if x.type == "MESH"); me = o.data; M = np.array(o.matrix_world); Mi = np.linalg.inv(M)
img = next(i for i in bpy.data.images if i.size[0] > 0); w, h = img.size; px = np.array(img.pixels[:], np.float32).reshape(h, w, 4)
uv = np.zeros(len(me.loops) * 2); me.uv_layers.active.data.foreach_get("uv", uv); uv = uv.reshape(-1, 2); li = np.array([l.vertex_index for l in me.loops]); nv = len(me.vertices)
lc = px[np.clip((uv[:, 1] * (h - 1)).astype(int), 0, h - 1), np.clip((uv[:, 0] * (w - 1)).astype(int), 0, w - 1), :3]
col = np.zeros((nv, 3)); cnt = np.zeros(nv); np.add.at(col, li, lc); np.add.at(cnt, li, 1); col /= np.maximum(cnt, 1)[:, None]
P = np.array([v.co[:] for v in me.vertices]); P = (np.c_[P, np.ones(nv)] @ M.T)[:, :3]
blau_px = (px[..., 2] > px[..., 0] + 0.03) & (px[..., 2] > 0.1)
blau = (col[:, 2] > col[:, 0] + 0.03) & (col[:, 2] > 0.1) & (P[:, 2] > B0 - 0.05) & (P[:, 2] < H1 + 0.01) & (np.abs(P[:, 0]) < 0.3)
baum = cKDTree(P); blau = np.array([blau[i].mean() > 0.4 for i in baum.query_ball_point(P, 0.012)]) & (P[:, 2] > B0 - 0.05)   # Nahtpunkte und Ränder mitnehmen
# Halsquerschnitt am Kopfansatz (nicht blaue Punkte knapp über dem Schal)
ring = P[(np.abs(P[:, 2] - (H1 + 0.012)) < 0.01) & ~blau & (np.abs(P[:, 0]) < 0.15)]
cx = np.median(ring[:, 0]); ax_ = np.percentile(np.abs(ring[:, 0] - cx), 90) * 0.92; ay_ = ax_ * 1.1; vorn_y = np.percentile(ring[:, 1], 5); cy = vorn_y + ay_ * 1.05   # Hals: Breite vom Kopfansatz, Tiefe ähnlich
print(f"Hals: Mitte ({cx:.3f}, {cy:.3f}) · Halbachsen {ax_:.3f} {ay_:.3f} m · Schalpunkte {int(blau.sum())}")
# Form ohne Schal: je Höhe und Winkel ein erlaubter Abstand von der Halsachse – oben der schlanke Hals, unten der Rumpf unterhalb des Schals.
# Alles im Schalband, was weiter draußen liegt (auch das Volumen des Tuchs, das selbst nicht blau ist), wird darauf gezogen.
NB = 36; th = np.arctan2(P[:, 1] - cy, P[:, 0] - cx); bin_ = ((th + np.pi) / (2 * np.pi) * NB).astype(int) % NB; r = np.hypot(P[:, 0] - cx, P[:, 1] - cy)
rumpf = (np.abs(P[:, 2] - (B0 - 0.02)) < 0.02) & ~blau; r_t = np.full(NB, np.nan)
for b in range(NB):
    q = r[rumpf & (bin_ == b)]
    if len(q): r_t[b] = np.percentile(q, 95)
r_t = np.where(np.isnan(r_t), np.nanmedian(r_t), r_t); r_t = (np.roll(r_t, 1) + 2 * r_t + np.roll(r_t, -1)) / 4
r_n = 1 / np.sqrt((np.cos(th) / ax_) ** 2 + (np.sin(th) / ay_) ** 2)                                   # Halsellipse
u = np.clip((P[:, 2] - (B0 - 0.02)) / (H0 + 0.03 - (B0 - 0.02)), 0, 1); u = u * u * (3 - 2 * u)
erlaubt = r_t[bin_] * (1 - u) + r_n * (1 + 0.25 * (1 - np.clip((P[:, 2] - H0) / (H1 - H0), 0, 1))) * u
band = (P[:, 2] > B0 - 0.02) & (P[:, 2] < H1 + 0.005) & (np.abs(P[:, 0] - cx) < 0.26)
zu_weit = band & (r > erlaubt)
neu = P.copy(); k = erlaubt / np.maximum(r, 1e-6)
neu[zu_weit, 0] = cx + (P[zu_weit, 0] - cx) * k[zu_weit]; neu[zu_weit, 1] = cy + (P[zu_weit, 1] - cy) * k[zu_weit]
hals = zu_weit | (blau & band)
print(f"eingezogen: {int(zu_weit.sum())} Punkte")
# glätten (Laplace, nur Schalpunkte, Nahtpunkte gemeinsam)
schl = np.round(P / 1e-5).astype(np.int64); _, gr = np.unique(schl, axis=0, return_inverse=True); gr = gr.ravel(); ng = gr.max() + 1
E = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get("vertices", E); E = gr[E.reshape(-1, 2)]
gp = np.zeros((ng, 3)); np.add.at(gp, gr, neu); gp /= np.bincount(gr, minlength=ng)[:, None]; gw = np.zeros(ng); np.maximum.at(gw, gr, hals.astype(float))
for _ in range(10):
    s = np.zeros((ng, 3)); c = np.zeros(ng); np.add.at(s, E[:, 0], gp[E[:, 1]]); np.add.at(s, E[:, 1], gp[E[:, 0]]); np.add.at(c, E[:, 0], 1); np.add.at(c, E[:, 1], 1)
    gp = gp + (s / np.maximum(c, 1)[:, None] - gp) * 0.5 * gw[:, None]
neu = gp[gr]; me.vertices.foreach_set("co", ((np.c_[neu, np.ones(nv)] @ Mi.T)[:, :3]).ravel()); me.update()
# Textur: Hals hautfarben, Brust/Schultern in Wamsfarbe
haut = np.median(col[(np.abs(P[:, 2] - (H1 + 0.02)) < 0.015) & ~blau & (col[:, 0] > col[:, 2] + 0.1)], 0)
wams = np.median(col[(P[:, 2] > B0 - 0.08) & (P[:, 2] < B0 + 0.02) & ~blau & (np.abs(P[:, 0]) < 0.15)], 0)
oben_ = hals & (neu[:, 2] > H0 + 0.01) & (np.hypot(neu[:, 0] - cx, neu[:, 1] - cy) < (ax_ + ay_) * 0.75)
for name, auswahl, farbe in (("hals", oben_, haut), ("brust", hals & ~oben_, wams)):
    mk = Image.new("L", (w, h)); dr = ImageDraw.Draw(mk)
    for p in me.polygons:
        if auswahl[list(p.vertices)].mean() > 0.5: dr.polygon([(uv[l, 0] * (w - 1), (1 - uv[l, 1]) * (h - 1)) for l in p.loop_indices], fill=255)
    m = ndimage.binary_dilation(np.asarray(mk)[::-1] > 0, iterations=4)
    rausch = 1 + (np.random.default_rng(2).random((h, w, 1)) - 0.5) * 0.06
    lum = px[..., :3] @ np.array([0.3, 0.59, 0.11]); rel = np.clip(lum / max(float(np.median(lum[m])) if m.any() else 1, 1e-3), 0.6, 1.4) if name == "brust" else 1.0   # Falten als Hell-Dunkel behalten
    neu_f = np.clip(farbe * (rel[..., None] if name == "brust" else 1) * rausch, 0, 1); weich = ndimage.gaussian_filter(m.astype(np.float32), 2)[..., None]
    px[..., :3] = px[..., :3] * (1 - weich) + neu_f * weich; print(f"{name}: {int(m.sum())} Bildpunkte übermalt")
nb = bpy.data.images.new(img.name + "_ohne_schal", w, h, alpha=True); nb.pixels.foreach_set(px.ravel()); nb.update()
nb.filepath_raw = os.path.abspath(ziel) + ".png"; nb.file_format = "PNG"; nb.save(); nb.pack(); os.remove(nb.filepath_raw)
for mat in me.materials:
    for n in (mat.node_tree.nodes if mat and mat.node_tree else []):
        if n.type == "TEX_IMAGE" and n.image == img: n.image = nb
for ca in list(me.color_attributes): me.color_attributes.remove(ca)
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print("Schal entfernt:", ziel)
