"""Mythara Fabrik – ein komplettes Kleidungs- oder Rüstungsset aus drei Bildern (vorn, Seite, hinten) als eine Ebene über den ganzen Grundkörper ziehen.

  python3 fabrik/set_aus_bild.py <basis.blend> <set-ordner> <ziel.glb> [oben=hals:0.7] [dicke=0.03] [haende=0.012] [arme=12]

basis.blend   Grundkörper mit Skelett (rig.py)
set-ordner    referenz/teile/vorn.png, seite.png (linke Körperseite, Zehen links im Bild), hinten.png – das Set ohne Körper, Kopf weggelassen
kapuze        der Kopf gehört zum Set (Kapuze, Gesichtstuch), nur ein Augenschlitz bleibt frei [kapuze_dicke=0.03, augen_unten/augen_oben, spitze]
oben          bis wohin das Set reicht (Knochen:Anteil), darüber bleibt der Kopf frei
dicke         Abstand des Sets vom Körper (m); haende: an den Händen (Handschuhe liegen enger an)
frei_wo_leer  wo das Bild leer ist (Hände, Hals, Unterarme unter kurzen Ärmeln), bleibt der Körper frei – sonst wird dort die nächste Farbe gemalt
arme          wie weit die Arme im Bild vom Körper abstehen (Grad); die Arme des Grundkörpers werden für die Farbübernahme rechnerisch so gestellt,
              damit Ärmel, Armschienen und Handschuhe an der richtigen Stelle landen (die Form selbst bleibt in der Grundhaltung)
Form: der Körper unterhalb von „oben“, um „dicke“ nach außen versetzt. Farbe: die Ansichten je nach Flächenrichtung, eingepasst über die ganze Figur.
Ergebnis: ein Teilnetz für rig.py (Gewichte vom Grundkörper) – baukasten.py baut es ein.
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Vector
from PIL import Image
from scipy import ndimage

basis, ordner, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
DICKE, HAENDE, ARME = float(opt.get("dicke", 0.03)), float(opt.get("haende", 0.012)), float(opt.get("arme", 12))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
for o in (arm, k): bpy.context.collection.objects.link(o)
KN = arm.data.bones; me = k.data; nv = len(me.vertices); gname = {g.index: g.name for g in k.vertex_groups}
W = {g.name: np.zeros(nv) for g in k.vertex_groups}
for v in me.vertices:
    for g in v.groups: W[gname[g.group]][v.index] = g.weight
P = np.array([v.co[:] for v in me.vertices]); N = np.array([v.normal[:] for v in me.vertices])
o_, t_ = opt.get("oben", "hals:0.7").split(":"); ZTOP = KN[o_].head_local.lerp(KN[o_].tail_local, float(t_)).z
KAPUZE = "kapuze" in sys.argv[4:]                                                                   # Kapuze mit Gesichtstuch: der Kopf gehört zum Set, nur ein Augenschlitz bleibt frei
kopfw = W.get("kopf", np.zeros(nv))
if KAPUZE:
    KB = KN["kopf"]; kz0, kz1 = KB.head_local.z, KB.tail_local.z; kl_ = kz1 - kz0; ky = KB.head_local.y
    augen = (P[:, 2] > kz0 + float(opt.get("augen_unten", 0.33)) * kl_) & (P[:, 2] < kz0 + float(opt.get("augen_oben", 0.5)) * kl_) & (P[:, 1] < ky - 0.03) & (np.abs(P[:, 0] - KB.head_local.x) < 0.065)
    wahl = ~augen; ZTOP = 9.0
else: wahl = (P[:, 2] <= ZTOP) & (kopfw < 0.5)
hand = sum(W.get(b, 0) for b in ("hand.L", "hand.R"))
# Form: versetzte Kopie des Körpers
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
RUMPF, FUESSE = float(opt.get("rumpf", 0.045)), float(opt.get("fuesse", 0.035))
rumpf = sum(W.get(b, 0) for b in ("brust", "bauch", "becken")); fuss = sum(W.get(b, 0) for b in ("fuss.L", "fuss.R"))
kopf_ = kopfw if KAPUZE else np.zeros(nv); KOPF_D = float(opt.get("kapuze_dicke", 0.03))
rest_ = np.clip(1 - hand - rumpf - fuss - kopf_, 0, 1)
for v in bm.verts: i = v.index; v.co = v.co + v.normal * (HAENDE * hand[i] + RUMPF * rumpf[i] + FUESSE * fuss[i] + DICKE * rest_[i] + KOPF_D * kopf_[i])   # Rumpf klobiger, Stiefel weiter, Hände eng
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not wahl[v.index]], context="VERTS"); bm.verts.ensure_lookup_table()
herkunft = [v.index for v in bm.verts]                                                              # bmesh löscht ohne Umnummern der Ursprünge: Index-Liste vor dem Schreiben merken
alt = np.where(wahl)[0]
netz = bpy.data.meshes.new("set"); bm.to_mesh(netz); bm.free(); o = bpy.data.objects.new("set", netz); bpy.context.collection.objects.link(o)
# fein unterteilen (Punktfarben brauchen Auflösung für Riemen, Schnallen, Muster); Gewichte je Punkt vom nächsten Ursprungspunkt
from mathutils.kdtree import KDTree
Q0 = np.array([v.co[:] for v in netz.vertices]); kd = KDTree(len(Q0))
for i, q in enumerate(Q0): kd.insert(q, i)
kd.balance()
bpy.context.view_layer.objects.active = o; o.select_set(True); sm = o.modifiers.new("fein", "SUBSURF"); sm.levels = int(opt.get("unterteilen", 2)); bpy.ops.object.modifier_apply(modifier="fein")
Q = np.array([v.co[:] for v in netz.vertices]); QN = np.array([v.normal[:] for v in netz.vertices]); naechster = np.array([kd.find(q)[1] for q in Q]); Wq = {b: w[alt][naechster] for b, w in W.items()}
# Arme rechnerisch an die Haltung im Bild anpassen (nur für die Farbübernahme): Drehung um die Schulter in der Blickebene
Qp = Q.copy()
for S, s in (("L", 1), ("R", -1)):
    b = KN["oberarm." + S]; d = (b.tail_local - b.head_local).normalized(); ist = math.degrees(math.atan2(abs(d.x), -d.z)); dreh = math.radians(ist - ARME) * s
    w = sum(Wq.get(x + "." + S, 0) for x in ("oberarm", "unterarm", "hand")); sx, sz = b.head_local.x, b.head_local.z
    x0, z0 = Q[:, 0] - sx, Q[:, 2] - sz; c, si = np.cos(-dreh * w), np.sin(-dreh * w)
    Qp[:, 0] = np.where(w > 0, sx + x0 * c - z0 * si, Qp[:, 0]); Qp[:, 2] = np.where(w > 0, sz + x0 * si + z0 * c, Qp[:, 2])
    print(f"Arm {S}: im Modell {ist:.0f}° abgespreizt, für die Farbe auf {ARME:.0f}° gestellt")
def bild(n, spiegeln=False):
    im = Image.open(os.path.join(ordner, "referenz", "teile", n + ".png")).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
    a = np.asarray(im).astype(np.float32) / 255
    if spiegeln: a = a[:, ::-1]
    m = a[..., 3] > 0.5; idx = ndimage.distance_transform_edt(~m, return_distances=False, return_indices=True); rgb = a[..., :3][idx[0], idx[1]]
    ALPHA[n + ("_s" if spiegeln else "")] = ndimage.binary_dilation(m, iterations=3)               # wo das Bild leer ist (Hände, Hals, Unterarme ohne Ärmel), bleibt der Körper frei
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
ALPHA = {}
VORN, HINTEN, SL, SR = bild("vorn"), bild("hinten"), bild("seite"), bild("seite", True)
x0, x1 = Qp[:, 0].min(), Qp[:, 0].max(); y0, y1 = Qp[:, 1].min(), Qp[:, 1].max(); z0, z1 = Qp[:, 2].min(), ZTOP
if KAPUZE: z1 = Qp[:, 2].max() + float(opt.get("spitze", 0.03))                                         # Bildoberkante = Kapuzenspitze
def nimm(img, u, vv): h, w = img.shape[:2]; return img[np.clip((vv * (h - 1)).astype(int), 0, h - 1), np.clip((u * (w - 1)).astype(int), 0, w - 1)]
vv = np.clip((z1 - Qp[:, 2]) / (z1 - z0), 0, 1); farbe = np.zeros((len(Q), 3), np.float32); ny = np.abs(QN[:, 1]) >= np.abs(QN[:, 0])
leer = np.zeros(len(Q), bool)
for maske, img, u, al in ((ny & (QN[:, 1] < 0), VORN, (Qp[:, 0] - x0) / (x1 - x0), "vorn"), (ny & (QN[:, 1] >= 0), HINTEN, (x1 - Qp[:, 0]) / (x1 - x0), "hinten"),
                      (~ny & (QN[:, 0] > 0), SL, (Qp[:, 1] - y0) / (y1 - y0), "seite"), (~ny & (QN[:, 0] <= 0), SR, (Qp[:, 1] - y0) / (y1 - y0), "seite_s")):
    farbe[maske] = nimm(img, u[maske], vv[maske])
    if "frei_wo_leer" in sys.argv[4:]: leer[maske] = ~nimm(ALPHA[al][..., None], u[maske], vv[maske])[:, 0]
frei_teile = sum(Wq.get(b, 0) for b in ("oberarm.L", "oberarm.R", "unterarm.L", "unterarm.R", "hand.L", "hand.R", "hals", "kopf"))
leer &= frei_teile >= 0.5                                                                          # nur an Armen, Händen und Hals freilassen – die Lücke zwischen den Beinen im Bild ist keine leere Stelle der Kleidung
if leer.any():                                                                                     # leere Stellen ausschneiden (der Körper darunter bleibt sichtbar)
    bm2 = bmesh.new(); bm2.from_mesh(netz); bm2.verts.ensure_lookup_table(); behalten = np.where(~leer)[0]
    bmesh.ops.delete(bm2, geom=[bm2.verts[i] for i in np.where(leer)[0]], context="VERTS"); bm2.to_mesh(netz); bm2.free(); farbe = farbe[behalten]; print(f"frei gelassen: {int(leer.sum())} Punkte (Hände, Hals, Unterarme …)")
ca = netz.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1).ravel())
m = bpy.data.materials.new("set"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.6; b_.inputs["Metallic"].default_value = float(opt.get("metall", 0.15))
netz.materials.append(m); bpy.context.view_layer.objects.active = o; bpy.ops.object.shade_smooth()
for x in (arm, k): bpy.data.objects.remove(x)
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True, export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True)
print(f"Set aus Bildern: {len(Q)} Punkte bis z {ZTOP:.2f} m · geschrieben: {ziel}")
