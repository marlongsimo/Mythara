"""Mythara Fabrik – den Kopf eines Grundkörpers durch einen anderen Kopf ersetzen (z. B. einen kahlen Meshy-Kopf mit Textur, auf den
wählbare Frisuren passen).

  python3 fabrik/kopf_tauschen.py <koerper.glb> <kopf.glb> <ziel.glb> [hautton=an|aus] [schnitt=0.02] [haare_weg=an|aus] [haar_tiefe=0.3]

koerper.glb  Grundkörper mit Textur, Blick nach −y, Füße bei z = 0
kopf.glb     Kopf mit Halsansatz (mit Textur), beliebig groß und verschoben – Blick nach −y, oben = +z nach dem Import

1. Einpassen: Maßstab und Lage (ohne Drehung) so, dass Hals, Kinn, Wangen und Ohren des neuen Kopfs auf dem alten liegen
   (Iteration über nächste Punkte; der Oberkopf zählt nicht – dort sitzt beim alten Kopf das Haar).
2. Schnitt: der alte Kopf wird oberhalb des unteren Halsrands des neuen Kopfs + „schnitt“ entfernt; der neue Hals reicht in den alten hinein.
   Der Halsrand des neuen Kopfs wird auf den Querschnitt des alten Halses gebracht (weich über 3 cm), damit keine Stufe bleibt.
3. Hautton (Standard an): die Textur des neuen Kopfs wird kanalweise so skaliert, dass sein Hals die Farbe des alten Halses hat.
Ergebnis: ein Körper aus zwei Stücken (Ausrüstungsliste: „stuecke_behalten“: true) mit beiden Texturen.
"""
import os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

quelle, kopfdatei, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
SCHNITT = float(opt.get("schnitt", 0.016))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle)); k = next(x for x in bpy.context.selected_objects if x.type == "MESH")
bpy.ops.import_scene.gltf(filepath=os.path.abspath(kopfdatei)); h = next(x for x in bpy.context.selected_objects if x.type == "MESH")
for o in (k, h):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
def punkte(o): a = np.zeros(len(o.data.vertices) * 3); o.data.vertices.foreach_get("co", a); return a.reshape(-1, 3)
PK, PH = punkte(k), punkte(h)
ZT = PK[:, 2].max(); kopf_alt = PK[PK[:, 2] > ZT - 0.32]
# grobe Startlage: Breite auf Ohrhöhe, Kinnhöhe
def breite(p, z0, z1): s = (p[:, 2] > z0) & (p[:, 2] < z1); return np.percentile(p[s, 0], 98) - np.percentile(p[s, 0], 2) if s.sum() > 10 else 0
hh = PH[:, 2].max() - PH[:, 2].min(); zs_h = np.linspace(PH[:, 2].min() + 0.35 * hh, PH[:, 2].max() - 0.2 * hh, 30)
bh = [breite(PH, z - 0.02 * hh, z + 0.02 * hh) for z in zs_h]; z_ohr_h = zs_h[int(np.argmax(bh))]
zs_k = np.linspace(ZT - 0.2, ZT - 0.06, 30); bk = [breite(kopf_alt, z - 0.006, z + 0.006) for z in zs_k]; z_ohr_k = zs_k[int(np.argmax(bk))]
s = max(bk) / max(bh) * 0.92                                                                        # alter Kopf trägt Haar über den Ohren: etwas kleiner starten
t = np.array([np.median(kopf_alt[:, 0]), np.median(kopf_alt[np.abs(kopf_alt[:, 2] - z_ohr_k) < 0.01, 1]), z_ohr_k]) - s * np.array([np.median(PH[:, 0]), np.median(PH[np.abs(PH[:, 2] - z_ohr_h) < 0.02 * hh, 1]), z_ohr_h])
bm = bmesh.new(); bm.from_mesh(k.data); bvh = BVHTree.FromBMesh(bm); bm.free()
probe = PH[np.random.default_rng(0).choice(len(PH), min(len(PH), 5000), replace=False)]
for it in range(60):
    q = probe * s + t; oben = q[:, 2] < z_ohr_k + 0.015; q = q[oben]                                # unterhalb der Schläfen: Hals, Kinn, Wangen, Ohren
    zq = np.array([bvh.find_nearest(Vector(p))[0] for p in q]); d = np.linalg.norm(q - zq, axis=1); gut = d <= np.percentile(d, 70)
    a_, b_ = (q[gut] - t) / s, zq[gut]; am, bm_ = a_.mean(0), b_.mean(0)
    s_n = ((a_ - am) * (b_ - bm_)).sum() / ((a_ - am) ** 2).sum(); t_n = bm_ - s_n * am
    if abs(s_n - s) < 1e-6 and np.linalg.norm(t_n - t) < 1e-6: break
    s, t = s_n, t_n
PH = PH * s + t; print(f"eingepasst: Maßstab {s:.4f} · Abstand im Untergesicht {d[gut].mean() * 1000:.1f} mm · Scheitel neu {PH[:, 2].max():.3f} m (alt mit Haar {ZT:.3f} m)")
# Schnitt
z_unten = PH[:, 2].min(); z_schnitt = z_unten + SCHNITT
bm = bmesh.new(); bm.from_mesh(k.data)
bmesh.ops.delete(bm, geom=[f for f in bm.faces if min(v.co.z for v in f.verts) > z_schnitt and np.mean([v.co.z for v in f.verts]) > ZT - 0.35], context="FACES")
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS"); bm.to_mesh(k.data); bm.free()
img_k = next((n.image for m in k.data.materials if m and m.node_tree for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image), None)
if img_k is not None and opt.get("haare_weg", "an") != "aus":                                      # lange Haare des alten Kopfs (über Nacken und Schultern) mit entfernen
    wk, hk = img_k.size; pk = np.array(img_k.pixels[:], np.float32).reshape(hk, wk, 4)
    bm = bmesh.new(); bm.from_mesh(k.data); uvl = bm.loops.layers.uv.active; weg = []
    for f in bm.faces:
        cz_ = np.mean([v.co.z for v in f.verts])
        if cz_ < z_schnitt - float(opt.get("haar_tiefe", 0.3)): continue
        c = np.array([pk[int(np.clip(l[uvl].uv[1], 0, 1) * (hk - 1)), int(np.clip(l[uvl].uv[0], 0, 1) * (wk - 1)), :3] for l in f.loops]).mean(0)
        if not ((c[0] > 0.55) and (c @ np.array([0.3, 0.59, 0.11]) > 0.42)) and (c[0] - c[2] > 0.08) and (c.max() < 0.6): weg.append(f)   # braun und dunkel: Haar (nicht Haut, nicht helle Kleidung)
    bmesh.ops.delete(bm, geom=weg, context="FACES"); bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    bm.to_mesh(k.data); bm.free(); print(f"alte Haare unterhalb des Schnitts: {len(weg)} Flächen entfernt")
bm = bmesh.new(); bm.from_mesh(k.data); bvh2 = BVHTree.FromBMesh(bm); bm.free()
# Halsrand an den alten Hals anpassen (radial um die Halsmitte, weich über 3 cm)
PKn = punkte(k); ring = PKn[np.abs(PKn[:, 2] - (z_unten + 0.005)) < 0.006]
mitte = np.array([np.median(ring[:, 0]), np.median(ring[:, 1])]) if len(ring) > 10 else PH[:, :2].mean(0)
hoehe = PH[:, 2] - z_unten; w = np.clip(1 - (hoehe - 0.012) / 0.02, 0, 1)                        # unterste 12 mm: im alten Hals versteckt (dunkler Rand der Kopftextur), darüber knapp außen
for i in np.where(w > 0)[0]:
    p = PH[i]; rich = p[:2] - mitte; l = np.linalg.norm(rich)
    if l < 1e-6: continue
    treffer = bvh2.ray_cast(Vector((mitte[0], mitte[1], p[2])), Vector((*(rich / l), 0)), 0.3)
    if treffer[0] is not None:
        r_alt = np.hypot(treffer[0].x - mitte[0], treffer[0].y - mitte[1]) + (0.001 if hoehe[i] > 0.012 else -0.004); PH[i, :2] = mitte + rich / l * (l + (r_alt - l) * w[i])
h.data.vertices.foreach_set("co", PH.ravel()); h.data.update()
# Hautton angleichen
if opt.get("hautton", "an") != "aus":
    def halsfarbe(o, pts, z0, z1):
        me = o.data; img = next((n.image for m in me.materials if m and m.node_tree for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image), None)
        if img is None: return None, None
        w_, h_ = img.size; px = np.array(img.pixels[:], np.float32).reshape(h_, w_, 4); uv = np.zeros(len(me.loops) * 2); me.uv_layers.active.data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
        li = np.array([l.vertex_index for l in me.loops]); sel = (pts[li, 2] > z0) & (pts[li, 2] < z1)
        c = px[np.clip((uv[sel, 1] * (h_ - 1)).astype(int), 0, h_ - 1), np.clip((uv[sel, 0] * (w_ - 1)).astype(int), 0, w_ - 1), :3]
        lum = c @ np.array([0.3, 0.59, 0.11]); haut = (c[:, 0] > 0.55) & (lum > 0.42)                   # nur Haut (keine Haarsträhnen im Nacken)
        return (np.median(c[haut], 0) if haut.sum() > 20 else np.median(c, 0)), img
    alt_c, _ = halsfarbe(k, PKn, z_schnitt - 0.16, z_schnitt - 0.01); neu_c, bild = halsfarbe(h, PH, z_unten + 0.005, z_unten + 0.04)
    if alt_c is not None and neu_c is not None:
        lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4); srgb = lambda c: np.where(c <= 0.0031308, c * 12.92, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
        f = lin(alt_c) / np.maximum(lin(neu_c), 1e-4); w_, h_ = bild.size; px = np.array(bild.pixels[:], np.float32).reshape(h_, w_, 4)
        px[..., :3] = np.clip(srgb(lin(px[..., :3]) * f), 0, 1)
        nb = bpy.data.images.new("kopf_haut", w_, h_, alpha=True); nb.pixels.foreach_set(px.ravel()); nb.update()
        nb.filepath_raw = os.path.abspath(ziel) + ".kopf.png"; nb.file_format = "PNG"; nb.save(); nb.pack(); os.remove(nb.filepath_raw)
        for m in h.data.materials:
            for n in (m.node_tree.nodes if m and m.node_tree else []):
                if n.type == "TEX_IMAGE" and n.image == bild: n.image = nb
        print(f"Hautton: Kopftextur × {np.round(f, 2)} (Hals alt {np.round(alt_c, 2)}, neu {np.round(neu_c, 2)})")
for o in (k, h):
    for ca in list(o.data.color_attributes): o.data.color_attributes.remove(ca)                   # Punktfarben weg – die Fabrik nimmt die Texturen
bpy.ops.object.select_all(action="DESELECT"); k.select_set(True); h.select_set(True); bpy.context.view_layer.objects.active = k; bpy.ops.object.join()
bpy.ops.object.select_all(action="DESELECT"); k.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Kopf getauscht: Schnitt bei z {z_schnitt:.3f} m · geschrieben {ziel}")
