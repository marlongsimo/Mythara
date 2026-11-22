"""Mythara Fabrik – ein Rüstungs- oder Kleidungsteil aus Bildern (vorn, Seite, hinten) für einen festen Grundkörper bauen.

  python3 fabrik/kleidung_aus_bild.py <basis.blend> <teil-ordner> <ziel.glb> [Optionen]

basis.blend   der Grundkörper mit Skelett (rig.py, z. B. v004/arbeit/basis.blend)
teil-ordner   Ordner mit referenz/teile/vorn.png, seite.png, hinten.png (aus referenz.py; seite = Blick auf die linke Körperseite, vorn links im Bild)
Optionen
  knochen=brust,bauch,becken   welche Körperteile das Teil bedeckt (Arme bleiben frei, außer sie werden genannt)
  oben=hals unten=becken:0.3   Grenzen: oberes Ende am Anfang des Halses, unteres bei 30 % des Beckenknochens (knochen:anteil)
  abstand=0.035                wie weit das Teil vom Körper absteht (m) · dicke=0.012 Materialstärke
  glaetten=25                  wie stark die Körperform geglättet wird (Metall: viel, Stoff: wenig, z. B. 3)
  hinten_spiegeln              die Rückansicht ist abgeschnitten: ihre linke Hälfte gespiegelt ergänzen
  metall=0.55                  Metallanteil des Materials (Stoff: 0)
Form: der Körper im genannten Bereich, geglättet, nach außen versetzt, mit Stärke. Farbe: die Ansichten je nach Flächenrichtung aufprojiziert
(vorn/hinten/Seite, über den Umriss eingepasst). Das Ergebnis ist ein Teilnetz für rig.py (Gewichte kommen vom Grundkörper) – baukasten.py baut es ein.
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from PIL import Image
from scipy import ndimage

basis, ordner, ziel = sys.argv[1:4]; mehr = sys.argv[4:]; opt = dict(a.split("=", 1) for a in mehr if "=" in a); flags = {a for a in mehr if "=" not in a}
KNOCHEN = opt.get("knochen", "brust,bauch,becken").split(","); ABSTAND = float(opt.get("abstand", 0.035)); DICKE = float(opt.get("dicke", 0.012))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
for o in (arm, k): bpy.context.collection.objects.link(o)
KN = arm.data.bones
def grenze(s, standard):
    teil = s.split(":"); b = KN[teil[0]]; f = float(teil[1]) if len(teil) > 1 else 0.0; return (b.head_local.lerp(b.tail_local, f)).z
Z1 = grenze(opt.get("oben", "hals"), None); Z0 = grenze(opt.get("unten", "becken:0.3"), None)
me = k.data; gname = {g.index: g.name for g in k.vertex_groups}; nv = len(me.vertices)
W = {b: np.zeros(nv) for b in [g.name for g in k.vertex_groups]}
for v in me.vertices:
    for g in v.groups: W[gname[g.group]][v.index] = g.weight
P = np.array([v.co[:] for v in me.vertices]); ARM = [b for b in W if b.split(".")[0] in ("oberarm", "unterarm", "hand")]
wahl = (sum(W.get(b, 0) for b in KNOCHEN) >= 0.45) & (P[:, 2] >= Z0) & (P[:, 2] <= Z1)
if not any(b.split(".")[0] in ("oberarm", "unterarm", "hand") for b in KNOCHEN): wahl &= sum(W[b] for b in ARM) < 0.3
print(f"Bereich: z {Z0:.2f}–{Z1:.2f} m · {int(wahl.sum())} Körperpunkte")
# Form: ein regelmäßiges Röhrengitter um den Bereich, mit Abstand auf den Körper (ohne Arme) aufgezogen und geglättet – saubere Flächen statt des unruhigen Körpernetzes
ziel_k = k.copy(); ziel_k.data = k.data.copy(); bpy.context.collection.objects.link(ziel_k); bm = bmesh.new(); bm.from_mesh(ziel_k.data); bm.verts.ensure_lookup_table()
weg = (sum(W[b] for b in ARM) >= 0.3) if not any(b.split(".")[0] in ("oberarm", "unterarm", "hand") for b in KNOCHEN) else np.zeros(nv, bool)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if weg[v.index]], context="VERTS"); bm.to_mesh(ziel_k.data); bm.free()
B = P[wahl]; cx, cy = float(np.median(B[:, 0])), float(np.median(B[:, 1])); R = float(np.max(np.hypot(B[:, 0] - cx, B[:, 1] - cy))) * 1.5
ringe, seg = int(opt.get("ringe", 28)), int(opt.get("segmente", 48))
bm = bmesh.new(); V = []
for j_ in range(ringe + 1):
    zz = Z0 + (Z1 - Z0) * j_ / ringe
    for i_ in range(seg): a_ = 2 * math.pi * i_ / seg; V.append(bm.verts.new((cx + R * math.cos(a_), cy + R * math.sin(a_), zz)))
for j_ in range(ringe):
    for i_ in range(seg): a_, b_ = j_ * seg + i_, j_ * seg + (i_ + 1) % seg; bm.faces.new((V[a_], V[b_], V[b_ + seg], V[a_ + seg]))
schale = bpy.data.meshes.new("teil"); bm.to_mesh(schale); bm.free(); o = bpy.data.objects.new("teil", schale); bpy.context.collection.objects.link(o)
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
for runde in range(2):                                                                            # aufziehen, glätten, noch einmal aufziehen: glatt und trotzdem nah am Körper
    sw = o.modifiers.new("aufziehen", "SHRINKWRAP"); sw.target = ziel_k; sw.wrap_method = "NEAREST_SURFACEPOINT"; sw.offset = ABSTAND; bpy.ops.object.modifier_apply(modifier="aufziehen")
    gl = int(opt.get("glaetten", 25)) // (runde + 1)
    if gl: s_ = o.modifiers.new("glatt", "SMOOTH"); s_.factor = 0.7; s_.iterations = gl; bpy.ops.object.modifier_apply(modifier="glatt")
bpy.data.objects.remove(ziel_k)
t = o.modifiers.new("fein", "SUBSURF"); t.levels = int(opt.get("fein", 1)); bpy.ops.object.modifier_apply(modifier="fein")   # fein=3: genug Punkte für Zeichnungsdetails (Borten, Wappen)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")
sd = o.modifiers.new("stark", "SOLIDIFY"); sd.thickness = DICKE; sd.offset = -1.0; bpy.ops.object.modifier_apply(modifier="stark")
o.data.update()

# ---- Farbe aus den Ansichten
def bild(n, spiegeln=False):
    im = Image.open(os.path.join(ordner, "referenz", "teile", n + ".png")).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
    a = np.asarray(im).astype(np.float32) / 255
    if n == "hinten" and "hinten_spiegeln" in flags:                                              # abgeschnitten: linke Hälfte (bis zur Mitte = halbe Breite der Vorderansicht) gespiegelt ergänzen
        vb = Image.open(os.path.join(ordner, "referenz", "teile", "vorn.png")); vb = vb.crop(vb.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
        halb = int(round(vb.width * a.shape[0] / vb.height / 2)); links = a[:, :halb]; a = np.concatenate([links, links[:, ::-1]], 1)
    if spiegeln: a = a[:, ::-1]
    m = a[..., 3] > 0.5; idx = ndimage.distance_transform_edt(~m, return_distances=False, return_indices=True); rgb = a[..., :3][idx[0], idx[1]]
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
VORN, HINTEN, SEITE_L, SEITE_R = bild("vorn"), bild("hinten"), bild("seite"), bild("seite", True)
Q = np.array([v.co[:] for v in o.data.vertices]); N = np.array([v.normal[:] for v in o.data.vertices]); x0, x1 = Q[:, 0].min(), Q[:, 0].max(); y0, y1 = Q[:, 1].min(), Q[:, 1].max(); z0, z1 = Q[:, 2].min(), Q[:, 2].max()
def nimm(img, u, vv): h, w = img.shape[:2]; return img[np.clip((vv * (h - 1)).astype(int), 0, h - 1), np.clip((u * (w - 1)).astype(int), 0, w - 1)]
vv = (z1 - Q[:, 2]) / (z1 - z0)
farbe = np.zeros((len(Q), 3), np.float32); wahl_v = np.abs(N[:, 1]) >= np.abs(N[:, 0])
vorn_ = wahl_v & (N[:, 1] < 0); hinten_ = wahl_v & (N[:, 1] >= 0); links_ = ~wahl_v & (N[:, 0] > 0); rechts_ = ~wahl_v & (N[:, 0] <= 0)
farbe[vorn_] = nimm(VORN, ((Q[:, 0] - x0) / (x1 - x0))[vorn_], vv[vorn_])                        # vorn: rechte Körperseite (-x) links im Bild
farbe[hinten_] = nimm(HINTEN, ((x1 - Q[:, 0]) / (x1 - x0))[hinten_], vv[hinten_])                 # hinten: linke Körperseite links im Bild
farbe[links_] = nimm(SEITE_L, ((Q[:, 1] - y0) / (y1 - y0))[links_], vv[links_])                   # linke Seite (+x): vorn (-y) links im Bild
farbe[rechts_] = nimm(SEITE_R, ((Q[:, 1] - y0) / (y1 - y0))[rechts_], vv[rechts_])
ca = o.data.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1).ravel())
m = bpy.data.materials.new("teil"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b.inputs["Base Color"]); b.inputs["Metallic"].default_value = float(opt.get("metall", 0.3)); b.inputs["Roughness"].default_value = 0.4
o.data.materials.clear(); o.data.materials.append(m); bpy.ops.object.shade_smooth()
for x in (arm, k): bpy.data.objects.remove(x)
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
try: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True, export_vertex_color="ACTIVE", export_all_vertex_colors=True)
except TypeError: bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True)
print(f"Teil aus Bildern: {len(o.data.vertices)} Punkte, {[round(v, 2) for v in o.dimensions]} m · geschrieben: {ziel}")
