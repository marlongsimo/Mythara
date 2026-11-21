"""Mythara Fabrik – das mitmodellierte Haar eines Grundkörpers entfernen (Glatze), damit wählbare Frisuren als eigene Ebene darüber passen.

  python3 fabrik/glatze.py <koerper.glb> <ziel.glb> [schaedel=cx,cy,cz,a,b,c] [haut=#rrggbb]

koerper.glb  Grundkörper mit Textur (grundkoerper.py / grundstruktur.py), Blick nach −y, Füße bei z = 0
schaedel     Mittelpunkt und Halbachsen (m) des Schädels als Ellipsoid; ohne Angabe aus dem Gesicht geschätzt:
             Breite aus der Gesichtshaut, Tiefe 1,3 × Breite, Stirn vorn, Scheitel knapp unter der höchsten Stelle
haut         Hautfarbe der Kopfhaut; ohne Angabe der Mittelwert der Stirn

Haar erkennt das Skript an der Texturfarbe (dunkler und brauner als Haut) im Kopfbereich. Die Haarflächen (und abstehende Strähnen)
werden entfernt und durch eine glatte Schädelkappe ersetzt (Ellipsoid, nach unten zum Hals hin verjüngt, 1,5 mm unter der Haut, damit
Stirn und Ohren davor liegen). Der ganze Schädel wird einheitlich hautfarben, das Gesicht bleibt unberührt.
Die Kappe ist ein eigenes Stück im Körpernetz – in der Ausrüstungsliste „stuecke_behalten“: true setzen.
"""
import os, sys
import numpy as np
import bpy, bmesh
from PIL import Image, ImageDraw
from scipy.spatial import cKDTree
from scipy import ndimage
from mathutils import Vector
from mathutils.bvhtree import BVHTree

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
nacken = kopf & ~haar & (P[:, 2] < cz - 0.06) & (P[:, 2] > cz - 0.12)                               # Halsdicke unterhalb des Schädels
r_hals = float(np.median(np.sqrt(((P[nacken, 0] - cx) / a) ** 2 + ((P[nacken, 1] - cy) / b) ** 2))) if nacken.any() else 0.7
print(f"Hals: {r_hals:.2f} × Schädelquerschnitt")
haarnah = glatt(haar.astype(float), 0.015)
# 1. Textur: ganzer Schädel einheitlich hautfarben (Gesicht geschützt)
lin_ = lambda c_: np.where(c_ <= 0.04045, c_ / 12.92, ((c_ + 0.055) / 1.055) ** 2.4)
if "haut" in opt: hf = np.array([int(opt["haut"][i:i + 2], 16) / 255 for i in (1, 3, 5)]) ** 2.2
else: hf = lin_(col[kopf & haut & (P[:, 2] > ZT - 0.12) & (P[:, 1] < cy - b * 0.6)]).mean(0) * 0.85    # Kopfhaut etwas dunkler als die helle Stirn (linear gemittelt)
ZB = ZT - float(opt.get("brauen", 0.086))                                                          # Linie knapp über den Augenbrauen: darunter Gesicht
def gesichtszone(c_): return (c_[1] < cy - b * 0.5) & (c_[2] < ZT - 0.045) & (c_[2] > cz - c * 0.9)
def ist_gesicht(c_, vs):                                                                            # unter der Brauenlinie bleibt die Gesichtsmitte immer; darüber (Pony) und seitlich (Strähnen) nur Hautfarbenes
    if not gesichtszone(c_): return False
    if c_[2] < ZB and abs(c_[0] - cx) < float(opt.get("gesichtsbreite", 0.05)): return True
    return haarnah[vs].max() < 0.5  # Augen, Brauen, Nase, Mund
def ist_ohr(c_): return (abs(c_[0] - cx) > a * 0.85) & (c_[2] > cz - 0.05) & (c_[2] < cz + 0.035) & (abs(c_[1] - cy) < b * 0.5)
maske = Image.new("L", (w, h)); dr = ImageDraw.Draw(maske); gmaske = Image.new("L", (w, h)); dg = ImageDraw.Draw(gmaske)
weg = []; haut_uv = None
for p in me.polygons:
    vs = list(p.vertices); c_ = P[vs].mean(0); ecken = [(uv[l, 0] * (w - 1), (1 - uv[l, 1]) * (h - 1)) for l in p.loop_indices]
    if ist_gesicht(c_, vs): dg.polygon(ecken, fill=255); continue
    if not kopf[vs].any(): continue
    dr.polygon(ecken, fill=255)
    ec = np.sqrt((((c_ - [cx, cy, cz]) / [a, b, c]) ** 2).sum()) if c_[2] >= cz else np.hypot((c_[0] - cx) / a, (c_[1] - cy) / b) / max(r_hals, 0.3)
    if haarnah[vs].max() > 0.3 or (ec > 1.06 and c_[2] > cz - 0.06 and not ist_ohr(c_)): weg.append(p.index)   # Haar und abstehende Strähnen: weg
    elif haut_uv is None and c_[2] > cz - 0.1 and c_[1] > cy: haut_uv = uv[list(p.loop_indices)].mean(0)
geschuetzt = np.asarray(gmaske)[::-1] > 0; mk = ndimage.binary_dilation(np.asarray(maske)[::-1] > 0, iterations=3) & ~geschuetzt   # Blender-Pixel beginnen unten
lin = lin_(px[..., :3]); rausch = 1 + (np.random.default_rng(1).random((h, w, 1)) - 0.5) * 0.03
neu_lin = np.where(mk[..., None], np.clip(hf * rausch, 0, 1), lin)
px[..., :3] = np.where(neu_lin <= 0.0031308, neu_lin * 12.92, 1.055 * neu_lin ** (1 / 2.4) - 0.055)
print(f"Textur: {int(mk.sum())} Bildpunkte hautfarben")
# 2. Haarflächen entfernen, glatte Schädelkappe einsetzen (gleiche Textur, Farbe von einer Hautstelle)
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[bm.faces[i] for i in weg], context="FACES_ONLY")
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
_st = kopf & haut & (np.abs(P[:, 2] - (ZB - 0.01)) < 0.012) & (np.abs(P[:, 0] - cx) < a * 0.45) & (P[:, 1] < cy)
stirn_y = float(np.percentile(P[_st, 1], 5)) if _st.sum() > 3 else cy - b
bv = float(np.clip(cy - stirn_y, b * 0.8, b))                                                      # vordere Halbachse: Kappe schließt bündig an die Stirn an
print(f"Stirn bei y {stirn_y:.3f} · vordere Halbachse {bv:.3f} m")
uvl = bm.loops.layers.uv.active; eins = 0.0015                                                      # Kappe 1,5 mm innen: wo Haut bleibt (Stirn, Ohren), liegt sie dahinter
NT, NP, NH = 64, 24, 10
def punkt(th, ph=None, zz=None):
    bb = b if np.sin(th) >= 0 else bv
    if ph is not None: x, y, z = (a - eins) * np.sin(ph) * np.cos(th), (bb - eins) * np.sin(ph) * np.sin(th), (c - eins) * np.cos(ph)
    else:
        sz = np.clip(1 - (cz - zz) / 0.08, 0, 1); f_ = r_hals * 0.9 + (1 - r_hals * 0.9) * np.sqrt(np.clip(1 - (1 - sz) ** 2, 0, 1))
        x, y, z = (a - eins) * f_ * np.cos(th), (bb - eins) * f_ * np.sin(th), zz - cz
    return Mi @ np.array([cx + x, cy + y, cz + z, 1.0])
ringe = [[bm.verts.new(punkt(0, 0)[:3])]]
for j in range(1, NP + 1): ringe.append([bm.verts.new(punkt(2 * np.pi * t / NT, np.pi / 2 * j / NP)[:3]) for t in range(NT)])
for j in range(1, NH + 1): ringe.append([bm.verts.new(punkt(2 * np.pi * t / NT, zz=cz - 0.10 * j / NH)[:3]) for t in range(NT)])
neue = []
for t in range(NT): neue.append(bm.faces.new((ringe[0][0], ringe[1][t], ringe[1][(t + 1) % NT])))
for j in range(1, len(ringe) - 1):
    for t in range(NT): neue.append(bm.faces.new((ringe[j][t], ringe[j + 1][t], ringe[j + 1][(t + 1) % NT], ringe[j][(t + 1) % NT])))
vorn_weg = []; bvh_rest = BVHTree.FromBMesh(bm)                                                   # vor erhaltenem Gesicht keine Kappe (sonst verdeckt sie Augen und Mund)
for f_ in neue:
    c_ = (M @ np.array([*f_.calc_center_median(), 1.0]))[:3]
    if c_[2] < cz - 0.01 and c_[1] < cy - b * 0.15: vorn_weg.append(f_); continue                   # unterhalb der Schädelmitte vorn: dort sind Wangen und Kiefer
    if not gesichtszone(c_ + [0, -0.01, 0]): continue
    ml = np.array(f_.calc_center_median()); innen = Mi[:3, :3] @ (np.array([cx, cy, c_[2]]) - c_); l_ = np.linalg.norm(innen)
    treffer = bvh_rest.ray_cast(Vector(ml + innen / l_ * 0.0005), Vector(innen / l_), 0.03)
    if treffer[0] is not None: vorn_weg.append(f_)
bmesh.ops.delete(bm, geom=vorn_weg, context="FACES"); neue = [f_ for f_ in neue if f_.is_valid]
for f_ in neue:
    f_.smooth = True; f_.material_index = 0
    for l in f_.loops: l[uvl].uv = tuple(haut_uv) if haut_uv is not None else (0.5, 0.5)
bmesh.ops.recalc_face_normals(bm, faces=neue)
bm.to_mesh(me); bm.free(); me.update()
for ca in list(me.color_attributes): me.color_attributes.remove(ca)                                 # alte Punktfarben (mit Haar) weg – die Fabrik nimmt die Textur
print(f"Haar: {len(weg)} Flächen entfernt · Schädelkappe {len(neue)} Flächen eingesetzt")
neu_bild = bpy.data.images.new(img.name + "_glatze", w, h, alpha=True); neu_bild.pixels.foreach_set(px.ravel()); neu_bild.update()
neu_bild.filepath_raw = os.path.abspath(ziel) + ".textur.png"; neu_bild.file_format = "PNG"; neu_bild.save(); neu_bild.pack(); os.remove(neu_bild.filepath_raw)   # als neues Bild, sonst exportiert glTF die alte Datei
for mat in me.materials:
    for nd in (mat.node_tree.nodes if mat and mat.node_tree else []):
        if nd.type == "TEX_IMAGE" and nd.image == img: nd.image = neu_bild
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Glatze: geschrieben {ziel}")
