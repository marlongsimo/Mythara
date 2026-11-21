"""Mythara Fabrik – das mitmodellierte Haar eines Grundkörpers entfernen (Glatze), damit wählbare Frisuren als eigene Ebene darüber passen.

  python3 fabrik/glatze.py <koerper.glb> <ziel.glb> [schaedel=cx,cy,cz,a,b,c] [haut=#rrggbb]

koerper.glb  Grundkörper mit Textur (grundkoerper.py / grundstruktur.py), Blick nach −y, Füße bei z = 0
schaedel     Mittelpunkt und Halbachsen (m) des Schädels als Ellipsoid; ohne Angabe aus dem Gesicht geschätzt:
             Breite aus der Gesichtshaut, Tiefe 1,3 × Breite, Stirn vorn, Scheitel knapp unter der höchsten Stelle
haut         Hautfarbe der Kopfhaut; ohne Angabe der Mittelwert der Stirn

Haar erkennt das Skript an der Texturfarbe (dunkler und brauner als Haut) im Kopfbereich. Haarpunkte außerhalb des Schädels werden auf seine
Oberfläche gezogen (weich ausgeblendet, damit am Haaransatz keine Stufe entsteht), die Textur unter dem Haar wird hautfarben übermalt.
Nahtpunkte der Textur (gleiche Lage, mehrere Punkte) werden gleich behandelt, damit das Netz geschlossen bleibt.
"""
import os, sys
import numpy as np
import bpy
from PIL import Image, ImageDraw
from scipy.spatial import cKDTree
from scipy import ndimage

quelle, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
o = next(x for x in bpy.data.objects if x.type == "MESH"); me = o.data; M = np.array(o.matrix_world); Mi = np.linalg.inv(M)
img = next(i for i in bpy.data.images if i.size[0] > 0); w, h = img.size; px = np.array(img.pixels[:], np.float32).reshape(h, w, 4)
uv = np.zeros((len(me.loops), 2)); me.uv_layers.active.data.foreach_get("uv", uv.ravel())
li = np.array([l.vertex_index for l in me.loops]); nv = len(me.vertices)
lc = px[np.clip((uv[:, 1] * (h - 1)).astype(int), 0, h - 1), np.clip((uv[:, 0] * (w - 1)).astype(int), 0, w - 1), :3]
col = np.zeros((nv, 3)); cnt = np.zeros(nv); np.add.at(col, li, lc); np.add.at(cnt, li, 1); col /= np.maximum(cnt, 1)[:, None]
P = np.array([v.co[:] for v in me.vertices]); P = (np.c_[P, np.ones(nv)] @ M.T)[:, :3]
ZT = P[:, 2].max(); kopf = P[:, 2] > ZT - 0.26                                                       # Kopf: oberste 26 cm
lum = col @ np.array([0.3, 0.59, 0.11]); haut = (col[:, 0] > 0.55) & (lum > 0.42)
haar = kopf & ~haut
baum = cKDTree(P)
def glatt(x, r):                                                                                    # räumlich mitteln (gleich für Nahtpunkte an derselben Stelle)
    return np.array([x[i].mean() for i in baum.query_ball_point(P, r)])
haar = glatt(haar.astype(float), 0.012) > 0.5                                                       # Einzelpunkte (Augenbrauen, Schatten) fallen weg
if "schaedel" in opt: cx, cy, cz, a, b, c = map(float, opt["schaedel"].split(","))
else:
    gs = kopf & haut & (P[:, 2] > ZT - 0.2) & (P[:, 2] < ZT - 0.09)                                 # Gesichtshaut zwischen Kinn und Stirn
    stirn = P[gs, 1].min(); x0, x1 = np.percentile(P[kopf & haut, 0], [2, 98]); cx = (x0 + x1) / 2
    a = max((x1 - x0) / 2 * 0.95, 0.068); b = a * 1.3; cy = stirn + b * 0.97; c = 0.115; cz = ZT - 0.022 - c
print(f"Schädel: Mitte ({cx:.3f}, {cy:.3f}, {cz:.3f}) · Halbachsen {a:.3f} {b:.3f} {c:.3f} m")
d = (P - [cx, cy, cz]) / [a, b, c]; e = np.sqrt((d ** 2).sum(1))
unten = P[:, 2] < cz                                                                                # unterhalb der Mitte: Schädel nicht weiter verengen (Nacken)
e = np.where(unten, np.sqrt(d[:, 0] ** 2 + d[:, 1] ** 2), e)
ziel_p = np.where(unten[:, None], np.c_[cx + (P[:, 0] - cx) / np.maximum(e, 1), cy + (P[:, 1] - cy) / np.maximum(e, 1), P[:, 2]],
                  [cx, cy, cz] + (P - [cx, cy, cz]) / np.maximum(e, 1)[:, None])
gewicht = np.clip(glatt(haar.astype(float), 0.02) * 1.6, 0, 1) * kopf                                # weich zum Haaransatz hin
nacken = kopf & ~haar & (P[:, 2] < cz - 0.06) & (P[:, 2] > cz - 0.12)                               # Halsdicke unterhalb des Schädels
r_hals = np.median(np.sqrt(((P[nacken, 0] - cx) / a) ** 2 + ((P[nacken, 1] - cy) / b) ** 2)) if nacken.any() else 0.7
sz = np.clip(1 - (cz - P[:, 2]) / 0.09, 0, 1); faktor = np.where(unten, r_hals + (1 - r_hals) * np.sqrt(np.clip(1 - (1 - sz) ** 2, 0, 1)), 1)
e_u = np.sqrt(d[:, 0] ** 2 + d[:, 1] ** 2) / np.maximum(faktor, 0.3)                               # unterhalb der Mitte: Querschnitt verengt sich glatt zum Hals hin
s_u = np.maximum(e_u, 1)
ziel_p = np.where(unten[:, None], np.c_[cx + (P[:, 0] - cx) / s_u, cy + (P[:, 1] - cy) / s_u, P[:, 2]], ziel_p)
print(f"Hals: {r_hals:.2f} × Schädelquerschnitt")
neu = P + (ziel_p - P) * gewicht[:, None]
print(f"Haar: {int(haar.sum())} Punkte · verschoben: {int((np.linalg.norm(neu - P, axis=1) > 0.002).sum())} · größte Verschiebung {np.linalg.norm(neu - P, axis=1).max() * 100:.1f} cm")
lokal = (np.c_[neu, np.ones(nv)] @ Mi.T)[:, :3]
me.vertices.foreach_set("co", lokal.ravel()); me.update()
# Textur unter dem Haar hautfarben übermalen
lin_ = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
if "haut" in opt: hf = np.array([int(opt["haut"][i:i + 2], 16) / 255 for i in (1, 3, 5)]) ** 2.2
else: hf = lin_(col[kopf & haut & (P[:, 2] > ZT - 0.12) & (P[:, 1] < cy - b * 0.6)]).mean(0) * 0.85    # Kopfhaut etwas dunkler als die helle Stirn (linear gemittelt)
maske = Image.new("L", (w, h)); dr = ImageDraw.Draw(maske); sicher = Image.new("L", (w, h)); ds = ImageDraw.Draw(sicher)
for p in me.polygons:
    vs = list(p.vertices); c_ = P[vs].mean(0); ecken = [(uv[l, 0] * (w - 1), (1 - uv[l, 1]) * (h - 1)) for l in p.loop_indices]
    gesicht = (c_[1] < cy - b * 0.55) & (c_[2] < ZT - 0.08) & (c_[2] > cz - c * 0.9)                 # Gesicht (Augen, Brauen) nie übermalen
    if gesicht: continue
    if kopf[vs].all(): dr.polygon(ecken, fill=255)
    if gewicht[vs].min() > 0.6: ds.polygon(ecken, fill=255)
mk = np.asarray(maske)[::-1] > 0; voll = np.asarray(sicher)[::-1] > 0                               # Blender-Pixel beginnen unten
lin = lin_(px[..., :3]); lum_ = px[..., :3] @ np.array([0.3, 0.59, 0.11])
haarpixel = ~((px[..., 0] > 0.55) & (lum_ > 0.42))                                                  # gleiche Regel wie für die Punkte: dunkler/brauner als Haut
mk = mk & (haarpixel | voll); mk = ndimage.binary_dilation(mk, iterations=2) & (ndimage.binary_dilation(mk, iterations=2) & np.asarray(maske)[::-1].astype(bool))
rausch = 1 + (np.random.default_rng(1).random((h, w, 1)) - 0.5) * 0.08
neu_lin = np.where(mk[..., None], np.clip(hf * rausch, 0, 1), lin)
px[..., :3] = np.where(neu_lin <= 0.0031308, neu_lin * 12.92, 1.055 * neu_lin ** (1 / 2.4) - 0.055)
neu_bild = bpy.data.images.new(img.name + "_glatze", w, h, alpha=True); neu_bild.pixels.foreach_set(px.ravel()); neu_bild.update()
neu_bild.filepath_raw = os.path.abspath(ziel) + ".textur.png"; neu_bild.file_format = "PNG"; neu_bild.save(); neu_bild.pack(); os.remove(neu_bild.filepath_raw)   # als neues Bild, sonst exportiert glTF die alte Datei
for mat in me.materials:
    for nd in (mat.node_tree.nodes if mat and mat.node_tree else []):
        if nd.type == "TEX_IMAGE" and nd.image == img: nd.image = neu_bild
print(f"Textur: {int(mk.sum())} Bildpunkte hautfarben übermalt")
for ca in me.color_attributes:                                                                      # Punktfarben (falls vorhanden) ebenfalls hautfarben
    n_ = len(ca.data); c_ = np.zeros(n_ * 4, np.float32); ca.data.foreach_get("color", c_); c_ = c_.reshape(n_, 4)
    idx = li if ca.domain == "CORNER" else np.arange(nv)
    if len(idx) == n_: sel = gewicht[idx] > 0.3; c_[sel, :3] = hf; ca.data.foreach_set("color", c_.ravel())
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Glatze: geschrieben {ziel}")
