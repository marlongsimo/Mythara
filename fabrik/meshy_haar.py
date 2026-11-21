"""Mythara Fabrik – eine Meshy-Frisur (Kopf mit Haaren, ohne Textur) auf den kahlen Grundkörper setzen und als Haar-Ebene ausgeben.

  python3 fabrik/meshy_haar.py <basis.blend> <meshy.glb> <ziel.glb> [farbbilder=<frisur-ordner>] [haaransatz=0.8] [mindest=0.004] [flaechen=24000]

basis.blend   Grundkörper mit Skelett (rig.py), kahl (glatze.py)
meshy.glb     Meshy-Modell: ganzer Kopf mit Frisur in einem Stück (Gesicht nach −y, oben = +z nach dem Import)
              – oder nur die Frisur, dann mit „nur_haar“: die Innenseite wird auf die Kopfhaut gelegt
farbbilder    Ordner mit haar_vorn.png/haar_hinten.png (Nur-Haar-Bilder): Haarfarbe = Mittel oben vorn, Stoppelfarbe = Mittel unten hinten
haaransatz    Höhe des Haaransatzes an der Stirn (Anteil des Kopfknochens) – darunter bleibt das Gesicht frei

Ablauf
1. Einpassen: Maßstab und Lage (ohne Drehung) so, dass Gesicht, Ohren und Hals des Meshy-Kopfs auf dem Grundkopf liegen
   (Iteration über nächste Punkte, die 35 % schlechtesten Paare zählen nicht – dort sitzt das Haar).
2. Auswahl: Kopfhaut oberhalb des Haaransatzes (Stirn hoch, Schläfen tiefer, Nacken unten) und alles, was deutlich über den Kopf
   hinausragt (Knoten, Zopf, Strähnen) – nie Gesicht, Ohren, Hals.
3. Farbe: mehr als 7 mm über dem Schädel = Haar (Rillen dunkler), darunter = rasierte Kopfhaut (Stoppeln).
4. Kein Durchstechen: Punkte näher als „mindest“ an der Haut werden nach außen geschoben.
Ergebnis: ein Teilnetz für rig.py (Platz „haar“, Gewichte vom Grundkörper).
"""
import os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from PIL import Image

basis, quelle, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
ANSATZ, MINDEST = float(opt.get("haaransatz", 0.8)), float(opt.get("mindest", 0.004))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
KN = arm.data.bones; KZ0, KZ1 = KN["kopf"].head_local.z, KN["kopf"].head_local.z + (KN["kopf"].tail_local.z - KN["kopf"].head_local.z); KL = KZ1 - KZ0
HZ = KN["hals"].head_local.z; OHR = KN["kopf"].head_local.y + 0.03
bm = bmesh.new(); bm.from_mesh(k.data); bvh = BVHTree.FromBMesh(bm); bm.free()
P0 = np.array([v.co[:] for v in k.data.vertices]); kopf0 = P0[(P0[:, 2] > HZ - 0.02)]                 # Grundkopf mit Hals

# ---- Meshy-Modell laden, zusammenführen, vereinfachen ------------------------------------------------------------------------
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle))
o = next(x for x in bpy.context.selected_objects if x.type == "MESH") if bpy.context.selected_objects else next(x for x in bpy.data.objects if x.type == "MESH" and x.name not in [k.name])
bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.object.mode_set(mode="OBJECT")
dm = o.modifiers.new("v", "DECIMATE"); dm.ratio = min(1, 160000 / max(len(o.data.polygons), 1)); bpy.ops.object.modifier_apply(modifier="v")
me = o.data; n = len(me.vertices); V = np.zeros(n * 3); me.vertices.foreach_get("co", V); V = V.reshape(-1, 3)

# ---- 1. Einpassen (Maßstab + Verschiebung) -----------------------------------------------------------------------------------
NUR_HAAR = "nur_haar" in sys.argv[4:]                                                              # Modell ohne Kopf (nur die Frisur): Innenseite auf die Kopfhaut legen
if not NUR_HAAR:
    def breite(p, z0, z1): s = (p[:, 2] > z0) & (p[:, 2] < z1); return np.percentile(p[s, 0], 98) - np.percentile(p[s, 0], 2)
    hm = V[:, 2].max() - V[:, 2].min()
    zb = KN["kopf"].head_local.z + 0.42 * KL                                                            # Höhe der Ohren am Grundkopf (etwa)
    mz = np.linspace(V[:, 2].min() + 0.3 * hm, V[:, 2].max() - 0.25 * hm, 40); mb = [breite(V, z - 0.02 * hm, z + 0.02 * hm) for z in mz]
    z_ohr_m = mz[int(np.argmax(mb))]; s = breite(kopf0, zb - 0.01, zb + 0.01) / max(mb)
    t = np.array([np.median(kopf0[np.abs(kopf0[:, 2] - zb) < 0.01, 0]), np.median(kopf0[np.abs(kopf0[:, 2] - zb) < 0.01, 1]), zb]) - s * np.array([np.median(V[np.abs(V[:, 2] - z_ohr_m) < 0.02 * hm, 0]), np.median(V[np.abs(V[:, 2] - z_ohr_m) < 0.02 * hm, 1]), z_ohr_m])
    probe = V[np.random.default_rng(0).choice(n, min(n, 6000), replace=False)]
    for it in range(40):                                                                                # nächste Punkte, beschnitten
        q = probe * s + t; q = q[(q[:, 2] > HZ - 0.03) & (q[:, 2] < KZ0 + 0.75 * KL)]                 # Gesicht, Ohren, Hals – nicht der Scheitel
        ziel_q = np.array([bvh.find_nearest(Vector(p))[0] for p in q]); d = np.linalg.norm(q - ziel_q, axis=1); gut = d <= np.percentile(d, 65)
        a_, b_ = (q[gut] - t) / s, ziel_q[gut]                                                          # b ≈ s·a + t
        am, bm_ = a_.mean(0), b_.mean(0); s_neu = ((a_ - am) * (b_ - bm_)).sum() / ((a_ - am) ** 2).sum(); t_neu = bm_ - s_neu * am
        if abs(s_neu - s) < 1e-5 and np.linalg.norm(t_neu - t) < 1e-5: break
        s, t = s_neu, t_neu
else:
    kh = P0[(P0[:, 2] > KZ0 + 0.55 * KL)]; kh = kh[(kh[:, 1] > OHR - 0.02) | (kh[:, 2] > KZ0 + 0.8 * KL)]   # Kopfhaut oben und hinten (dort liegt jede Frisur auf)
    s = (np.percentile(kh[:, 0], 99) - np.percentile(kh[:, 0], 1)) * 1.2 / (np.percentile(V[:, 0], 99) - np.percentile(V[:, 0], 1))
    t = np.array([np.median(kh[:, 0]), np.median(kh[:, 1]), kh[:, 2].max() + 0.012]) - s * np.array([np.median(V[:, 0]), np.median(V[:, 1]), V[:, 2].max()])
    baum = cKDTree(V); gut = np.ones(len(kh), bool); d = np.zeros(len(kh))
    for it in range(60):                                                                            # Kopfhautpunkte -> nächster Haarpunkt; Haar so legen, dass seine Innenseite auf der Haut liegt
        q = (kh - t) / s; d_, idx = baum.query(q); a_ = V[idx]; b_ = kh; d = d_ * s; gut = d <= np.percentile(d, 70)
        am, bm_ = a_[gut].mean(0), b_[gut].mean(0); s_neu = ((a_[gut] - am) * (b_[gut] - bm_)).sum() / ((a_[gut] - am) ** 2).sum(); t_neu = bm_ - s_neu * am
        if abs(s_neu - s) < 1e-6 and np.linalg.norm(t_neu - t) < 1e-6: break
        s, t = s_neu, t_neu
print(f"eingepasst: Maßstab {s:.4f} · Verschiebung {np.round(t, 3)} · mittlerer Abstand im Gesicht {d[gut].mean() * 1000:.1f} mm")
V = V * s + t

# ---- 2. Auswahl --------------------------------------------------------------------------------------------------------------
loc = np.zeros((n, 3)); nrm = np.zeros((n, 3)); dist = np.zeros(n)
for i, p in enumerate(V): r = bvh.find_nearest(Vector(p)); loc[i] = r[0]; nrm[i] = r[1]; dist[i] = r[3]
mitte = np.array([KN["kopf"].head_local.x, KN["kopf"].head_local.y, (KZ0 + KZ1) / 2]); kp = loc[:, 2] > KZ0
if (np.einsum("ij,ij->i", nrm[kp], loc[kp] - mitte) < 0).mean() > 0.5: nrm = -nrm
sd = np.where(np.einsum("ij,ij->i", V - loc, nrm) > 0, dist, -dist)
hz = (loc[:, 2] - KZ0) / KL; f, bk, sx, up = np.maximum(-nrm[:, 1], 0), np.maximum(nrm[:, 1], 0), np.abs(nrm[:, 0]), np.maximum(nrm[:, 2], 0) * 1.5
schwelle = (ANSATZ * f + (ANSATZ - 0.25) * sx + 0.1 * bk) / (f + bk + sx + up + 1e-9)
gesicht = (hz < schwelle) & ((nrm[:, 1] < -0.3) | (loc[:, 1] < OHR))
kopfhaut = (hz >= schwelle) & (sd > -0.02)
if NUR_HAAR: kopfhaut = np.ones(n, bool)                                                            # Modell ist schon nur die Frisur
ragt = (sd > 0.012) & ~gesicht & (hz > -0.3)
if NUR_HAAR: gesicht[:] = False
nimm = kopfhaut | ragt
E = np.zeros(len(me.edges) * 2, int); me.edges.foreach_get("vertices", E); E = E.reshape(-1, 2)
A = coo_matrix((np.ones(len(E) * 2), (np.r_[E[:, 0], E[:, 1]], np.r_[E[:, 1], E[:, 0]])), shape=(n, n)).tocsr(); deg = np.asarray(A.sum(1)).ravel()
w = nimm.astype(float)
for _ in range(3): w = (A @ w + w) / (deg + 1)                                                      # Rand glätten, Krümel weg
nimm = w > 0.5
haar = (sd > 0.007) | NUR_HAAR
hw = haar.astype(float)
for _ in range(4): hw = (A @ hw + hw) / (deg + 1)
print(f"Frisur: {int(nimm.sum())} von {n} Punkten · davon Haar {int((nimm & (hw > 0.5)).sum())} · größter Abstand {sd[nimm].max() * 100:.1f} cm")

# ---- 3. Farbe ----------------------------------------------------------------------------------------------------------------
def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
haarfarbe, stoppel = lin(np.array([0.36, 0.23, 0.15])), lin(np.array([0.42, 0.33, 0.27]))
if "farbbilder" in opt:
    def mittel(datei, oben):
        a = np.asarray(Image.open(os.path.join(opt["farbbilder"], datei)).convert("RGBA")).astype(float) / 255; m = a[..., 3] > 0.5
        zs = np.where(m.any(1))[0]; z0, z1 = zs[0], zs[-1]; band = np.zeros_like(m); h_ = z1 - z0
        if oben: band[z0:z0 + int(h_ * 0.35)] = True
        else: band[z1 - int(h_ * 0.25):z1 + 1] = True
        return lin(np.median(a[..., :3][m & band], 0))
    haarfarbe, stoppel = mittel("haar_vorn.png", True), mittel("haar_hinten.png", False)
N = np.zeros(n * 3); me.vertices.foreach_get("normal", N); N = N.reshape(-1, 3)
nachbar = np.zeros((n, 3)); np.add.at(nachbar, E[:, 0], V[E[:, 1]]); np.add.at(nachbar, E[:, 1], V[E[:, 0]]); nachbar /= np.maximum(deg, 1)[:, None]
mulde = np.einsum("ij,ij->i", nachbar - V, N); mulde = np.clip(mulde / (np.percentile(np.abs(mulde), 90) + 1e-9), -1, 1)   # Rillen (Mulden) dunkler, Kämme heller
for _ in range(1): mulde = (A @ mulde + mulde) / (deg + 1)
hell = np.clip(1 - 0.45 * mulde, 0.55, 1.25)[:, None]
farbe = np.where((hw > 0.5)[:, None], haarfarbe * hell, stoppel * np.clip(hell, 0.85, 1.1))
# ---- 4. Nicht durchstechen, Netz bauen ---------------------------------------------------------------------------------------
zu_nah = sd < MINDEST; V[zu_nah] = loc[zu_nah] + nrm[zu_nah] * MINDEST
for ca_ in list(me.color_attributes): me.color_attributes.remove(ca_)                              # leere Farbebenen aus dem Meshy-Import (sonst nimmt die Fabrik die weiße)
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
for v in bm.verts: v.co = V[v.index]
lay = bm.verts.layers.float_color.new("Col")
for v in bm.verts: v[lay] = (*farbe[v.index], 1.0)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not nimm[v.index]], context="VERTS"); bm.to_mesh(me); bm.free()
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.mesh.separate(type="LOOSE"); stuecke = [x for x in bpy.context.selected_objects if x.type == "MESH"]
gross = max(len(x.data.vertices) for x in stuecke)
for x in stuecke:
    if len(x.data.vertices) < gross * 0.02 and x != o: bpy.data.objects.remove(x)                   # lose Krümel weg
rest = [x for x in bpy.data.objects if x.type == "MESH" and x != k and x.name in bpy.context.view_layer.objects]
bpy.ops.object.select_all(action="DESELECT")
for x in rest: x.select_set(True)
bpy.context.view_layer.objects.active = rest[0]; bpy.ops.object.join() if len(rest) > 1 else None; o = bpy.context.view_layer.objects.active
dm = o.modifiers.new("v", "DECIMATE"); dm.ratio = min(1, float(opt.get("flaechen", 24000)) / max(len(o.data.polygons), 1)); bpy.ops.object.modifier_apply(modifier="v")
for ca_ in [c for c in o.data.color_attributes if c.name != "Col"]: o.data.color_attributes.remove(ca_)   # nur die eigene Farbebene exportieren
o.data.color_attributes.active_color = o.data.color_attributes["Col"]
m = bpy.data.materials.new("haar"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.6
o.data.materials.clear(); o.data.materials.append(m); bpy.ops.object.shade_smooth()
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
try: bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Meshy-Frisur: {len(o.data.vertices)} Punkte · geschrieben {ziel}")
