"""Mythara Fabrik – eine Frisur aus vier Kopfansichten (vorn, rechts, Seite, hinten) als Haar-Ebene über den Kopf des Grundkörpers bauen.

  python3 fabrik/haar_aus_bild.py <basis.blend> <frisur-ordner> <ziel.glb> [haaransatz=0.8] [mindest=0.005] [vorschau=bild.png]

frisur-ordner  haar_vorn.png … haar_hinten.png (nur die Haare, gleiche Anordnung; wenn vorhanden, bestimmen sie Form und Farbe)
               vorn.png (Gesicht), rechts.png (rechte Kopfseite, Nase rechts im Bild), seite.png (linke Kopfseite, Nase links), hinten.png
               – freigestellt (Alpha), alle vier im selben Maßstab und auf derselben Höhe (z. B. eine Zeile eines Frisurenbogens)
zopf          auch unterhalb des Nackens Haar bauen (Zopf), wo die Rückansicht haarfarben ist
modus=gemalt  einfache saubere Form (Haarschale, oben dicker, Knoten als Kugel) mit der Zeichnung der Nur-Haar-Bilder darauf
haaransatz     Höhe des Haaransatzes an der Stirn als Anteil des Kopfknochens (0 = Halsansatz, 1 = Scheitel)
mindest        kleinster Abstand der Haare von der Kopfhaut (m), damit nichts durchscheint

Ablauf
1. Einpassen: Maßstab und Lage der Bilder werden aus Hals, Kinn und Untergesicht bestimmt (dort gibt es keine Haare) – Umriss des Grundkörpers
   gegen den Umriss im Bild, gemeinsamer Maßstab und gemeinsame Höhe für alle vier Ansichten.
2. Form: Kopf, Hals und oberer Rücken werden fein unterteilt; jeder Punkt wandert entlang seiner Flächenrichtung nach außen, solange er in allen
   passenden Ansichten noch innerhalb des Umrisses liegt (Silhouetten-Schnitt). So entstehen Volumen, Pony, lange Seiten, Zopf und Knoten.
3. Auswahl: Haar ist die Kopfhaut oberhalb des Haaransatzes (Stirn hoch, Schläfen mittel, Nacken tief) und alles, was mehr als 12 mm über den
   Körper hinausragt – nie das Gesicht. Unterhalb des Nackens (Zopf) zählt nur, was in der Rückansicht haarfarben ist.
4. Farbe aus der Ansicht, auf die die Fläche schaut; der Rand wird bis zur Haut geschlossen, damit kein Spalt bleibt.
Ergebnis: ein Teilnetz für rig.py (Platz „haar“, Gewichte vom Grundkörper).
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from PIL import Image, ImageDraw
from scipy import ndimage

basis, ordner, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
ANSATZ, MINDEST = float(opt.get("haaransatz", 0.8)), float(opt.get("mindest", 0.005))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
bpy.context.collection.objects.link(k)
KN = arm.data.bones; me = k.data; nv = len(me.vertices); gname = {g.index: g.name for g in k.vertex_groups}
W = {g.name: np.zeros(nv) for g in k.vertex_groups}
for v in me.vertices:
    for g in v.groups: W[gname[g.group]][v.index] = g.weight
P0 = np.array([v.co[:] for v in me.vertices])
KZ0, KZ1 = KN["kopf"].head_local.z, KN["kopf"].tail_local.z; KL = KZ1 - KZ0; HZ = KN["hals"].head_local.z
ZMIN = HZ - 0.12                                                                                    # Zopf reicht bis auf den oberen Rücken

# ---- Bilder -------------------------------------------------------------------------------------------------------------
ACHSE = {"vorn": (0, 1), "hinten": (0, -1), "seite": (1, 1), "rechts": (1, -1)}                     # waagerechte Bildachse = Modellachse (x/y) mit Vorzeichen
B = {}
for n in ACHSE:
    a = np.asarray(Image.open(os.path.join(ordner, n + ".png")).convert("RGBA")).astype(np.float32) / 255
    m = a[..., 3] > 0.5; idx = ndimage.distance_transform_edt(~m, return_distances=False, return_indices=True); rgb = a[..., :3][idx[0], idx[1]]
    lum = rgb @ np.array([0.3, 0.59, 0.11]); haar = m & ((rgb[..., 0] - rgb[..., 2]) > 0.07) & (lum < 0.42)     # haarfarben (nur für den Zopf unterhalb des Nackens)
    haar = ndimage.binary_closing(ndimage.binary_opening(haar, iterations=1), iterations=2)
    B[n] = dict(rgb=np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4), m=m, haar=haar, h=m.shape[0], w=m.shape[1])

# ---- 1. Einpassen ---------------------------------------------------------------------------------------------------------
RES = 0.001; H0, H1, Z0, Z1 = -0.3, 0.3, ZMIN - 0.05, KZ1 + 0.15
def umriss(ach, vz):                                                                                # Körperumriss in der Ansicht (Raster 1 mm)
    im = Image.new("L", (int((H1 - H0) / RES), int((Z1 - Z0) / RES))); dr = ImageDraw.Draw(im)
    for p in me.polygons:
        c = P0[list(p.vertices)]
        if c[:, 2].max() < Z0: continue
        dr.polygon([((vz * x[ach] - H0) / RES, (Z1 - x[2]) / RES) for x in c], fill=255)
    return np.asarray(im) > 0
MOD = {n: umriss(*ACHSE[n]) for n in ACHSE}
BAND = (HZ + 0.02, KZ0 + 0.42 * KL)                                                                 # Hals bis Mund: dort trägt niemand Haare
def lage(n, kk, zt, uc):                                                                            # Bildpunkte -> Modell (h, z)
    b = B[n]; vv, uu = np.mgrid[0:b["h"], 0:b["w"]]; return (uu - uc) * kk, zt - vv * kk
def guete(n, kk, zt, uc):
    b = B[n]; h, z = lage(n, kk, zt, uc); im = b["m"]; band = (z >= BAND[0]) & (z <= BAND[1])
    ix = np.clip(((h - H0) / RES).astype(int), 0, MOD[n].shape[1] - 1); iz = np.clip(((Z1 - z) / RES).astype(int), 0, MOD[n].shape[0] - 1)
    mo = MOD[n][iz, ix] & band; bi = im & band; u = (mo | bi).sum(); return (mo & bi).sum() / u if u else 0
def schwerpunkt(n, kk, zt):
    b = B[n]; vv, uu = np.mgrid[0:b["h"], 0:b["w"]]; z = zt - vv * kk; s = b["m"] & (z >= BAND[0]) & (z <= BAND[1])
    return uu[s].mean() if s.any() else b["w"] / 2
best = (-1,)
for kk in np.linspace(0.0014, 0.0034, 21):
    for zt in np.linspace(KZ1 + 0.02, KZ1 + 0.25, 24):
        g = guete("vorn", kk, zt, schwerpunkt("vorn", kk, zt))
        if g < best[0] - 0.25: continue
        for n in ("seite", "rechts"):
            g += max(guete(n, kk, zt, uc) for uc in np.linspace(0, B[n]["w"], 40))
        if g > best[0]: best = (g, kk, zt)
_, KK, ZT = best
for schritt in (0.00008, 0.00003):                                                                  # verfeinern
    for kk in KK + schritt * np.arange(-4, 5):
        for zt in ZT + schritt * 40 * np.arange(-4, 5):
            g = guete("vorn", kk, zt, schwerpunkt("vorn", kk, zt)) + sum(max(guete(n, kk, zt, uc) for uc in np.linspace(0, B[n]["w"], 80)) for n in ("seite", "rechts"))
            if g > best[0]: best = (g, kk, zt)
    _, KK, ZT = best
UC = {}
for n in ACHSE:
    c = np.linspace(0, B[n]["w"], 300); UC[n] = c[int(np.argmax([guete(n, KK, ZT, u) for u in c]))]
print(f"eingepasst: {KK * 1000:.2f} mm je Bildpunkt · Bildoberkante bei z {ZT:.3f} m · Übereinstimmung " + ", ".join(f"{n} {guete(n, KK, ZT, UC[n]):.2f}" for n in ACHSE))

NUR_HAAR = all(os.path.exists(os.path.join(ordner, "haar_" + n + ".png")) for n in ACHSE)           # zweiter Bogen: nur die Haare, gleiche Anordnung
if NUR_HAAR:
    for n in ACHSE:
        b = B[n]; a = np.asarray(Image.open(os.path.join(ordner, "haar_" + n + ".png")).convert("RGBA")).astype(np.float32) / 255
        a = np.pad(a, ((0, max(0, b["h"] - a.shape[0])), (0, max(0, b["w"] - a.shape[1])), (0, 0)))[:b["h"], :b["w"]]; hm = a[..., 3] > 0.5
        best = (-1, 0, 0)
        for dy in range(-14, 15):                                                                   # Verschiebung, mit der das Haar am besten im Umriss mit Gesicht liegt
            for dx in range(-14, 15):
                mm = np.roll(np.roll(hm, dy, 0), dx, 1); g = (mm & b["m"]).sum() / max(mm.sum(), 1)
                if g > best[0]: best = (g, dx, dy)
        _, dx, dy = best; hm = np.roll(np.roll(hm, dy, 0), dx, 1); a = np.roll(np.roll(a, dy, 0), dx, 1)
        idx = ndimage.distance_transform_edt(~hm, return_distances=False, return_indices=True); rgb = a[..., :3][idx[0], idx[1]]
        b["hm"] = ndimage.binary_dilation(hm, iterations=2); b["hrgb"] = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
        print(f"Nur-Haar-Bild {n}: verschoben um ({dx}, {dy}) Bildpunkte · {best[0]:.2f} im Umriss")
def projiziere(n, p):                                                                               # Modellpunkte -> Bildpunkte (u, v)
    ach, vz = ACHSE[n]; return p[:, ach] * vz / KK + UC[n], (ZT - p[:, 2]) / KK
def drin(n, p, unten_drin=True):
    b = B[n]; u, v = projiziere(n, p); ui, vi = np.round(u).astype(int), np.round(v).astype(int)
    ok = (ui >= 0) & (ui < b["w"]) & (vi >= 0) & (vi < b["h"]); r = np.zeros(len(p), bool)
    r[ok] = b["m"][vi[ok], ui[ok]]; r |= (vi >= b["h"]) & unten_drin & (ui >= 0) & (ui < b["w"]); return r
def nimm(n, feld, p):
    b = B[n]; u, v = projiziere(n, p); return b[feld][np.clip(np.round(v).astype(int), 0, b["h"] - 1), np.clip(np.round(u).astype(int), 0, b["w"] - 1)]

# ---- Modus „gemalt“: einfache saubere Form (Haarschale auf der Kopfhaut, oben dicker, Knoten als Kugel), darauf die Zeichnung aus den Nur-Haar-Bildern
if opt.get("modus") == "gemalt":
    assert NUR_HAAR, "modus=gemalt braucht haar_vorn.png … haar_hinten.png"
    from mathutils import Vector
    from mathutils.bvhtree import BVHTree
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < KZ0 - 0.03], context="VERTS")
    netz = bpy.data.meshes.new("haar"); bm.to_mesh(netz); bm.free(); o = bpy.data.objects.new("haar", netz); bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005); bpy.ops.object.mode_set(mode="OBJECT")
    sm = o.modifiers.new("fein", "SUBSURF"); sm.levels = 2; bpy.ops.object.modifier_apply(modifier="fein")
    Q = np.array([v.co[:] for v in netz.vertices]); QN = np.array([v.normal[:] for v in netz.vertices]); nq = len(Q)
    mitte = np.array([KN["kopf"].head_local.x, KN["kopf"].head_local.y, (KZ0 + KZ1) / 2])
    if (np.einsum("ij,ij->i", QN, Q - mitte) < 0).mean() > 0.5: QN = -QN
    E_ = np.array([e.vertices[:] for e in netz.edges]); nachb = [[] for _ in range(nq)]
    for a_, b_ in E_: nachb[a_].append(b_); nachb[b_].append(a_)
    def glatt(x, k=1):
        for _ in range(k): x = np.array([(x[i] + x[nachb[i]].mean(0)) / 2 if nachb[i] else x[i] for i in range(nq)])
        return x
    for n in ACHSE: B[n]["hm3"] = ndimage.binary_dilation(B[n]["hm"], iterations=2)
    RICHT = {"vorn": (0, -1, 0), "hinten": (0, 1, 0), "seite": (1, 0, 0), "rechts": (-1, 0, 0)}
    w4 = {n: np.maximum(QN @ np.array(RICHT[n], float), 0) for n in ACHSE}
    # Haar, wo die zugewandten Ansichten Haar zeigen (gewichtet); oben (Scheitel) zählen alle Ansichten
    stimme = sum(w4[n] * nimm(n, "hm3", Q + QN * 0.004) for n in ACHSE) / np.maximum(sum(w4.values()), 1e-6)
    oben = QN[:, 2] > 0.55; stimme = np.where(oben, np.max([nimm(n, "hm3", Q + QN * 0.004) for n in ACHSE], 0), stimme)   # Scheitel: eine Ansicht genügt
    hz = (Q[:, 2] - KZ0) / KL; haar = glatt((stimme > 0.5).astype(float) * (hz > 0.15), 3) > 0.5
    # Dicke: entlang der Flächenrichtung nach außen, solange alle Haarumrisse (oder der Kopf davor) zustimmen; stark geglättet, begrenzt
    OHR_ = KN["kopf"].head_local.y + 0.03; CX_ = KN["kopf"].head_local.x; D = np.zeros(nq); frei = np.ones(nq, bool)
    for t_ in np.arange(0.002, float(opt.get("max_dicke", 0.03)), 0.002):
        p_ = Q + QN * t_; ok = np.ones(nq, bool)
        vorn_ = Q[:, 1] < OHR_; links_ = Q[:, 0] > CX_                                              # nur die Ansichten, die die Stelle sehen (keine Freigabe für Verdecktes – sonst werden rasierte Seiten dick)
        ok &= np.where(vorn_, nimm("vorn", "hm", p_), nimm("hinten", "hm", p_)) & np.where(links_, nimm("seite", "hm", p_), nimm("rechts", "hm", p_))
        frei &= ok; D = np.where(frei, t_, D)
    D = glatt(D, 12); dicke = MINDEST + 0.85 * D
    print(f"gemalt: {int(haar.sum())} von {nq} Punkten Haar · Dicke {dicke[haar].min() * 1000:.0f}–{dicke[haar].max() * 1000:.0f} mm")
    ab = Q + QN * dicke[:, None]
    # Knoten: was in der Seitenansicht hinten/oben deutlich über den Kopf hinausragt
    kugeln = []
    for n_s in ("seite", "rechts"):
        b = B[n_s]; h_, z_ = lage(n_s, KK, ZT, UC[n_s]); ix = np.clip(((h_ - H0) / RES).astype(int), 0, MOD[n_s].shape[1] - 1); iz = np.clip(((Z1 - z_) / RES).astype(int), 0, MOD[n_s].shape[0] - 1)
        aussen = b["hm"] & ~ndimage.binary_dilation(MOD[n_s][iz, ix], iterations=int(0.025 / KK)) & (z_ > KZ0 + 0.55 * KL)
        lab, nl = ndimage.label(aussen)
        if nl:
            gr = ndimage.sum(aussen, lab, range(1, nl + 1)) * np.array([float((h_[lab == j + 1].mean() * ACHSE[n_s][1]) > KN["kopf"].head_local.y + 0.04) for j in range(nl)])   # nur hinten (nicht der Schopf über der Stirn)
            k_ = int(np.argmax(gr)) + 1
            if gr[k_ - 1] * KK * KK > 4e-4:
                sel = lab == k_; kugeln.append((float(h_[sel].mean()) * ACHSE[n_s][1], float(z_[sel].mean()), float(np.sqrt(gr[k_ - 1] / np.pi)) * KK))
    knoten = None
    if kugeln:
        y_k, z_k, r_k = np.mean(kugeln, 0); r_k = max(r_k, 0.025)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=14, radius=r_k * 1.1, location=(KN["kopf"].head_local.x, y_k, z_k)); knoten = bpy.context.object
        bpy.ops.object.transform_apply(location=True); print(f"Knoten: Mitte y {y_k:.3f} z {z_k:.3f} · Halbmesser {r_k * 100:.1f} cm")
    # Netz: nur Haar, Rand bis zur Haut geschlossen
    bm = bmesh.new(); bm.from_mesh(netz); bm.verts.ensure_lookup_table(); ur = bm.verts.layers.int.new("u")
    for v in bm.verts: v[ur] = v.index; v.co = ab[v.index]
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not haar[v.index]], context="VERTS"); bm.edges.ensure_lookup_table(); innen = {}
    for e in [e for e in bm.edges if e.is_boundary]:
        for v in e.verts:
            if v not in innen: i_ = v[ur]; innen[v] = bm.verts.new(Q[i_] + QN[i_] * 0.001)
    for e in [e for e in bm.edges if e.is_boundary]:
        a_, b_ = e.verts
        if a_ in innen and b_ in innen:
            try: bm.faces.new((a_, b_, innen[b_], innen[a_]))
            except ValueError: pass
    bm.verts.layers.int.remove(ur); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(netz); bm.free()
    if knoten is not None:
        bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); knoten.select_set(True); bpy.context.view_layer.objects.active = o; bpy.ops.object.join()
    netz = o.data; ab = np.array([v.co[:] for v in netz.vertices]); QN = np.array([v.normal[:] for v in netz.vertices]); nq = len(ab)
    farbe = np.zeros((nq, 3), np.float32); sw = np.zeros(nq)
    for n in ACHSE:                                                                                 # Zeichnung aus allen zugewandten Ansichten, weich gemischt
        w_ = np.maximum(QN @ np.array(RICHT[n], float), 0) ** 3 + 0.02 * (QN[:, 2] > 0.5); farbe += nimm(n, "hrgb", ab) * w_[:, None]; sw += w_
    farbe /= np.maximum(sw, 1e-6)[:, None]
    ca = netz.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.c_[farbe, np.ones(nq)].astype(np.float32).ravel())
    netz.color_attributes.active_color = ca; netz.color_attributes.render_color_index = netz.color_attributes.active_color_index
    m = bpy.data.materials.new("haar"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
    nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.6; netz.materials.clear(); netz.materials.append(m)
    bpy.context.view_layer.objects.active = o; bpy.ops.object.shade_smooth(); bpy.data.objects.remove(k)
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_vertex_color="MATERIAL", export_all_vertex_colors=False)
    print(f"Frisur gemalt: geschrieben {ziel}"); sys.exit(0)

# ---- 2. Form: Volumen aus den Umrissen ------------------------------------------------------------------------------------
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from skimage import measure
bm = bmesh.new(); bm.from_mesh(me); bvh = BVHTree.FromBMesh(bm); bm.free()
VX = float(opt.get("voxel", 0.003))
xs = np.arange(-0.17, 0.17, VX); ys = np.arange(-0.17, 0.27, VX); zs = np.arange(ZMIN, KZ1 + 0.16, VX)
G = np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1).reshape(-1, 3)
huelle = drin("vorn", G) & drin("hinten", G) & drin("seite", G) & drin("rechts", G)                # in allen vier Ansichten innerhalb des Umrisses
OHR = KN["kopf"].head_local.y + 0.03; CX0 = KN["kopf"].head_local.x
if NUR_HAAR:                                                                                        # Haar-Umriss – oder im Bild vom Kopf verdeckt (liegt auf der abgewandten Seite)
    hinten_liegt = {"vorn": G[:, 1] > OHR, "hinten": G[:, 1] < OHR, "seite": G[:, 0] < CX0, "rechts": G[:, 0] > CX0}
    im_haar = {n: nimm(n, "hm", G) & drin(n, G, False) | False for n in ACHSE}
    for n in ACHSE:
        u_, v_ = projiziere(n, G); im_haar[n] = im_haar[n] & (u_ >= 0) & (u_ < B[n]["w"]) & (v_ >= 0) & (v_ < B[n]["h"])
    huelle = np.ones(len(G), bool)
    for n in ACHSE: huelle &= im_haar[n] | (drin(n, G) & hinten_liegt[n])
    passt = {n: im_haar[n] | (drin(n, G) & hinten_liegt[n]) for n in ACHSE}
    for n in ACHSE: B[n]["hm_weit"] = ndimage.binary_dilation(B[n]["hm"], iterations=4)
    weit = sum((nimm(n, "hm_weit", G) | passt[n]).astype(int) for n in ACHSE)
    huelle_roh = (weit >= 4) | (sum(passt[n].astype(int) for n in ACHSE) >= 3)                 # dünne Schicht: großzügiger (Bilder sind nicht pixelgenau deckungsgleich)
def ausdehnung(n, z):                                                                              # je Höhe: kleinste und größte waagerechte Modellkoordinate im Umriss
    b = B[n]; v = np.round((ZT - z) / KK).astype(int); lo = np.full(len(z), np.nan); hi = np.full(len(z), np.nan); ach, vz = ACHSE[n]
    for i, vi in enumerate(v):
        mk_ = b["hm"] if NUR_HAAR and b["hm"][vi if 0 <= vi < b["h"] else 0].any() else b["m"]
        if 0 <= vi < b["h"] and mk_[vi].any():
            u = np.where(mk_[vi])[0]; h_ = (np.array([u[0], u[-1]]) - UC[n]) * KK * vz; lo[i], hi[i] = h_.min(), h_.max()
    return lo, hi
CX, CY = KN["kopf"].head_local.x, KN["kopf"].head_local.y + 0.05                                   # Mitte der Querschnitte (Schädelmitte)
xl = [ausdehnung(n, zs) for n in ("vorn", "hinten")]; yl = [ausdehnung(n, zs) for n in ("seite", "rechts")]
XP = np.fmin(xl[0][1], xl[1][1]) - CX; XN = CX - np.fmax(xl[0][0], xl[1][0]); YP = np.fmin(yl[0][1], yl[1][1]) - CY; YN = CY - np.fmax(yl[0][0], yl[1][0])
iz = np.clip(np.round((G[:, 2] - zs[0]) / VX).astype(int), 0, len(zs) - 1); dx, dy = G[:, 0] - CX, G[:, 1] - CY
ex = np.where(dx >= 0, XP[iz], XN[iz]); ey = np.where(dy >= 0, YP[iz], YN[iz])
oval = np.nan_to_num((dx / np.maximum(ex, 1e-3)) ** 2 + (dy / np.maximum(ey, 1e-3)) ** 2, nan=9) <= 1  # ovaler Querschnitt: rundet die Ecken, die vier Ansichten allein offen lassen
unter_bild = (ZT - G[:, 2]) / KK >= min(B[n]["h"] for n in B)
huelle &= oval | unter_bild
nahe = (G[:, 2] > KZ0 - 0.02) & (np.abs(G[:, 0]) < 0.14) & (G[:, 1] > -0.14) & (G[:, 1] < 0.2)      # Kopfbereich: dort auch eine dünne Schicht außerhalb des Umrisses (Kopfhaut immer bedeckt)
frage = np.where(huelle | nahe)[0]
loc = np.zeros((len(frage), 3)); nrm = np.zeros((len(frage), 3)); dist = np.full(len(frage), 9.0)
for j_, gi in enumerate(frage):
    r = bvh.find_nearest(Vector(G[gi]), 0.25)
    if r[0] is not None: loc[j_] = r[0]; nrm[j_] = r[1]; dist[j_] = r[3]
mitte = np.array([KN["kopf"].head_local.x, KN["kopf"].head_local.y, (KZ0 + KZ1) / 2]); kp = loc[:, 2] > KZ0
if (np.einsum("ij,ij->i", nrm[kp], loc[kp] - mitte) < 0).mean() > 0.5: nrm = -nrm; print("Flächenrichtungen zeigten nach innen – umgedreht")
ausserhalb = np.einsum("ij,ij->i", G[frage] - loc, nrm) > 0; sd = np.where(ausserhalb, dist, -dist)

# ---- 3. Auswahl: Kopfhaut, lange Haare, Zopf – nie das Gesicht --------------------------------------------------------------
hz = (loc[:, 2] - KZ0) / KL; f, bk, s, up = np.maximum(-nrm[:, 1], 0), np.maximum(nrm[:, 1], 0), np.abs(nrm[:, 0]), np.maximum(nrm[:, 2], 0) * 1.5
schwelle = (ANSATZ * f + (ANSATZ - 0.2) * s + 0.12 * bk) / (f + bk + s + up + 1e-9)                # Haaransatz: Stirn hoch, Schläfen tiefer, Nacken unten; nach oben gerichtete Flächen immer
OHR = KN["kopf"].head_local.y + 0.03                                                                # vor der Ohrebene liegt unterhalb des Haaransatzes das Gesicht
gesicht = (hz < schwelle) & (hz > -0.05) & ((nrm[:, 1] < -0.3) | (loc[:, 1] < OHR))
haarfarben_vorn = nimm("vorn", "haar", G[frage])
kopfhaut = (hz >= schwelle) & ~gesicht
kopfhaut &= ~((nrm[:, 1] < -0.5) & (nrm[:, 2] < 0.6) & ~haarfarben_vorn)                            # Stirn: nur wo das Bild vorn Haar zeigt
in_h = huelle[frage]; ZOPF = "zopf" in sys.argv[4:]
seitlich = np.abs(nrm[:, 0]) > np.abs(nrm[:, 1]); haarfarben = np.where(seitlich, np.where(nrm[:, 0] > 0, nimm("seite", "haar", G[frage]), nimm("rechts", "haar", G[frage])),
                                                           np.where(nrm[:, 1] > 0, nimm("hinten", "haar", G[frage]), nimm("vorn", "haar", G[frage]))) | (nrm[:, 2] > 0.6)
haar = (sd > 0.002) & (
    (kopfhaut & (in_h | (sd < MINDEST + 0.004)))                                                    # Kopfhaut: alles im Umriss, mindestens eine dünne Schicht
    | (in_h & ~gesicht & (sd > 0.012) & (hz >= 0.12) & haarfarben)                                  # lange Haare, Knoten: was deutlich über den Kopf hinausragt und im Bild Haar ist (keine Ohren)
    | (ZOPF & in_h & ~gesicht & (sd > 0.006) & (hz < 0.12) & nimm("hinten", "haar", G[frage]) & (loc[:, 1] > OHR)))   # Zopf (nur mit zopf): unterhalb des Nackens, was hinten haarfarben ist
if NUR_HAAR:                                                                                        # der Umriss ist schon die Frisur: alles außerhalb der Haut, dazu eine dünne Schicht, wo mindestens drei Ansichten Haar zeigen
    haar = (sd > 0.002) & (in_h | ((sd < MINDEST + 0.008) & huelle_roh[frage])) & (hz > -0.6)
vol = np.zeros(len(G), np.float32); vol[frage[haar]] = 1; vol = vol.reshape(len(xs), len(ys), len(zs))
lab, n_ = ndimage.label(vol > 0)                                                                    # lose Krümel weg
if n_ > 1:
    gr = ndimage.sum(vol > 0, lab, range(1, n_ + 1)); vol[np.isin(lab, [i + 1 for i in range(n_) if gr[i] < max(gr.max() * 0.03, 30)])] = 0
print(f"Haar: {int(vol.sum())} Würfel à {VX * 1000:.0f} mm · Umriss-Hülle {int(huelle.sum())} · größter Abstand {sd[haar].max() * 100 if haar.any() else 0:.1f} cm")

# ---- 4. Netz und Farbe ------------------------------------------------------------------------------------------------------
glatt = ndimage.gaussian_filter(np.pad(vol, 2), float(opt.get("weich", 1.2)))
ver, fl, _, _ = measure.marching_cubes(glatt, 0.5)
ver = (ver - 2) * VX + [xs[0], ys[0], zs[0]]
netz = bpy.data.meshes.new("haar"); netz.from_pydata(ver.tolist(), [], fl[:, ::-1].tolist()); netz.update()
o = bpy.data.objects.new("haar", netz); bpy.context.collection.objects.link(o); bpy.context.view_layer.objects.active = o; o.select_set(True)
dm = o.modifiers.new("weniger", "DECIMATE"); dm.ratio = min(1.0, float(opt.get("punkte", 12000)) / max(len(ver), 1)); bpy.ops.object.modifier_apply(modifier="weniger")
bm = bmesh.new(); bm.from_mesh(netz); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(netz); bm.free(); netz.update()
ab = np.array([v.co[:] for v in netz.vertices]); QN = np.array([v.normal[:] for v in netz.vertices]); nq = len(ab)
ny = np.abs(QN[:, 1]) >= np.abs(QN[:, 0]) * 0.8
ansicht = np.where(ny, np.where(QN[:, 1] < 0, "vorn", "hinten"), np.where(QN[:, 0] > 0, "seite", "rechts"))
oben_ = QN[:, 2] > 0.75; ansicht = np.where(oben_ & (ab[:, 1] < OHR), "vorn", np.where(oben_, "hinten", ansicht))   # Scheitel: aus der Ansicht, die ihn am flachsten sieht
farbe = np.zeros((nq, 3), np.float32); summe_w = np.zeros(nq)
RICHT = {"vorn": (0, -1, 0), "hinten": (0, 1, 0), "seite": (1, 0, 0), "rechts": (-1, 0, 0)}           # Blickrichtung zur Kamera
for n in ACHSE:                                                                                     # gewichtet aus allen Ansichten, die die Fläche sehen (keine Streifen am Scheitel)
    w_ = np.maximum(QN @ np.array(RICHT[n], float), 0) ** 3 + 0.02 * (QN[:, 2] > 0.5)
    farbe += nimm(n, "hrgb" if NUR_HAAR else "rgb", ab) * w_[:, None]; summe_w += w_
farbe /= np.maximum(summe_w, 1e-6)[:, None]
ca = netz.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.c_[farbe, np.ones(nq)].astype(np.float32).ravel())
netz.color_attributes.active_color = ca
haar = np.ones(nq, bool); Q = np.array([v.co[:] for v in me.vertices]); Q = Q[Q[:, 2] > ZMIN]; nq0 = len(Q)
m = bpy.data.materials.new("haar"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.55; b_.inputs["Metallic"].default_value = 0.0
netz.materials.append(m); bpy.ops.object.shade_smooth()
bpy.data.objects.remove(k)
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True, export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True)
if "vorschau" in opt:                                                                               # Kontrollbild: oben Bild mit Umriss (rot Körper), unten Körper grau und Haar farbig – nur Sichtbares
    reihe = []; alle = np.concatenate([Q, ab]); af = np.concatenate([np.full((nq0, 3), 0.18), farbe]); ah = np.r_[np.zeros(nq0, bool), np.ones(nq, bool)]
    BLICK = {"vorn": (1, 1), "hinten": (1, -1), "seite": (0, -1), "rechts": (0, 1)}                  # Tiefe: Achse und Richtung zur Kamera hin
    for n in ("vorn", "rechts", "seite", "hinten"):
        b = B[n]; bild = np.where(b["m"][..., None], b["rgb"] ** (1 / 2.2), 0.1); h_, z_ = lage(n, KK, ZT, UC[n])
        ix = np.clip(((h_ - H0) / RES).astype(int), 0, MOD[n].shape[1] - 1); iz = np.clip(((Z1 - z_) / RES).astype(int), 0, MOD[n].shape[0] - 1); mo = MOD[n][iz, ix]
        oben = bild.copy(); oben[mo ^ ndimage.binary_erosion(mo)] = (1, 0.2, 0.2)
        ta, tv = BLICK[n]; tiefe = -alle[:, ta] * tv; reihen = np.argsort(-tiefe); unten_ = np.full(bild.shape, 0.06, np.float32)
        u, v = projiziere(n, alle[reihen]); ui, vi = np.round(u).astype(int), np.round(v).astype(int)
        for du in (0, 1):
            for dv in (0, 1):
                ok = (ui + du >= 0) & (ui + du < b["w"]) & (vi + dv >= 0) & (vi + dv < b["h"])
                unten_[vi[ok] + dv, ui[ok] + du] = np.where(ah[reihen][ok][:, None], af[reihen][ok] ** (1 / 2.2), af[reihen][ok])
        reihe.append((np.concatenate([oben, unten_], 0) * 255).astype(np.uint8))
    hh = max(r.shape[0] for r in reihe); Image.fromarray(np.concatenate([np.pad(r, ((0, hh - r.shape[0]), (0, 4), (0, 0))) for r in reihe], 1)).save(opt["vorschau"])
print(f"Frisur aus Bildern: geschrieben {ziel}")
