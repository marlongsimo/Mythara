"""Mythara Fabrik – stilisierte Bärte auf dem Gesicht eines Grundkörpers erzeugen (Blender-Python, gleiche Machart wie frisuren.py).

  python3 fabrik/bart.py <basis.blend> <ziel.glb> <stil> [farbe=#3b2618] [nase=0.077] [mund=0.059] [kinn=0.024] [saat=1]

stil   stoppeln | vollbart | hufeisen | schnurrbart | wikinger   (kinnbart = hufeisen)
Gesichtsmaße als Höhe über dem Kopfgelenk (m): nase = Nasenunterkante, mund = Mundspalte, kinn = Kinnunterkante (am Grundmann v002 gemessen).
Aufbau: das Untergesicht wird fein unterteilt, eine weich begrenzte Maske je Stil ausgeschnitten und als Bartschale um die Bartdicke abgehoben
(am Rand dünn auslaufend, keine gezackte Kante). Längere Bärte bekommen zusätzlich Strähnen-Cluster (abgeflachte, spitz zulaufende Bänder).
  stoppeln     Dreitagebart: Wangen, Kinn, Oberlippe, unter dem Kiefer – nur ein leichter Schatten auf der Haut
  vollbart     kurzer gepflegter Vollbart mit Schnurrbart, 6–10 mm, Wangenlinie klar
  hufeisen     Hufeisen-Schnurrbart: über der Oberlippe und an den Mundwinkeln senkrecht bis unter das Kinn, Kinnmitte frei
  schnurrbart  kräftiger Schnurrbart, an den Mundwinkeln etwas herabgezogen
  wikinger     langer Vollbart, am Kinn in Strähnen bis auf die Brust
Ergebnis: ein Teilnetz für rig.py (Platz „bart“, Gewichte vom Grundkörper).
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

basis, ziel, STIL = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
hexf = opt.get("farbe", "#3b2618"); FARBE = np.array([int(hexf[i:i + 2], 16) / 255 for i in (1, 3, 5)]) ** 2.2
rng = np.random.default_rng(int(opt.get("saat", 1)))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
KN = arm.data.bones; KZ0 = KN["kopf"].head_local.z; CX = KN["kopf"].head_local.x; KY = KN["kopf"].head_local.y
ZN, ZM, ZK = KZ0 + float(opt.get("nase", 0.077)), KZ0 + float(opt.get("mund", 0.059)), KZ0 + float(opt.get("kinn", 0.024))
OHR_Y = KY + float(opt.get("ohr", 0.057))                                                        # Ebene direkt vor den Ohren
bm0 = bmesh.new(); bm0.from_mesh(k.data); bmesh.ops.remove_doubles(bm0, verts=bm0.verts, dist=0.0005); bvh = BVHTree.FromBMesh(bm0)
# Untergesicht ausschneiden und fein unterteilen
bm = bm0.copy(); bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[f for f in bm.faces if not all((ZK - 0.07 < v.co.z < ZN + 0.035) and v.co.y < OHR_Y + 0.01 for v in f.verts)], context="FACES")
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
for _ in range(2): bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=1, use_grid_fill=True)
bm.verts.ensure_lookup_table(); bm.normal_update()
Q = np.array([v.co[:] for v in bm.verts]); n = len(Q); N = np.zeros((n, 3))
for i, v in enumerate(bm.verts): r = bvh.find_nearest(v.co); N[i] = r[1]
mitte = np.array([CX, KY + 0.02, ZM]); N[np.einsum("ij,ij->i", N, Q - mitte) < 0] *= -1
x, y, z = Q[:, 0] - CX, Q[:, 1], Q[:, 2]; ax = np.abs(x)
nb = [[] for _ in range(n)]
for e in bm.edges: a, b = e.verts[0].index, e.verts[1].index; nb[a].append(b); nb[b].append(a)
def glatt(w, k_=1):
    for _ in range(k_): w = np.array([(w[i] + np.mean(w[nb[i]])) / 2 if nb[i] else w[i] for i in range(n)])
    return w
def weich(a, b, wert): return np.clip((wert - a) / (b - a), 0, 1)                                     # 0 unter a, 1 über b
# Grundflächen (Werte 0..1, weich)
vorn = weich(OHR_Y + 0.005, OHR_Y - 0.01, y)                                                         # vor den Ohren
mund = (ax < 0.029) & (z > ZM - 0.009) & (z < ZM + 0.0045) & (y < KY - 0.02)                          # Lippen bleiben frei
wangenlinie = ZN - 0.004 + 0.026 * np.clip(ax / 0.075, 0, 1) ** 1.5                                      # vom Nasenflügel schräg hoch zum Ohr (Koteletten)
unter_kiefer = weich(ZK - 0.055, ZK - 0.04, z)                                                       # unter dem Kinn bis zum Hals
voll = weich(0.003, -0.003, z - wangenlinie) * vorn * unter_kiefer * (~mund) * (ax > 0.0) * ~((ax < 0.021) & (z > ZN - 0.004))   # nicht in die Nase
oberlippe = weich(0.0045, 0.006, z - ZM) * weich(0.002, -0.002, z - (ZN - 0.002)) * weich(0.034, 0.028, ax) * (y < KY - 0.02)
mundwinkel = weich(0.022, 0.026, ax) * weich(0.036, 0.031, ax) * weich(ZM - 0.01, ZM - 0.006, z) * weich(ZM + 0.009, ZM + 0.004, z)   # an den Mundwinkeln etwas herabgezogen
kinn = weich(0.03, 0.022, ax) * weich(ZK - 0.012, ZK - 0.004, z) * weich(ZM - 0.006, ZM - 0.009, z) * (y < KY - 0.01)
vorne_y = np.array([(lambda h: h[0].y if h[0] is not None else KY)(bvh.ray_cast(Vector((CX, -0.5, zz)), Vector((0, 1, 0)), 1.0)) for zz in z])   # Gesichtsvorderseite je Höhe
mitte_streifen = 0.03 + 0.12 * np.clip(ZM - z, 0, None)                                             # Hufeisen: Streifen von den Mundwinkeln leicht nach außen abwärts
hufeisen = weich(0.0095, 0.0065, np.abs(ax - mitte_streifen)) * weich(ZK - 0.03, ZK - 0.02, z) * weich(ZM + 0.009, ZM + 0.004, z) * weich(0.045, 0.035, y - vorne_y)   # nur vorn am Kinn (bis 2,5 cm hinter der Kinnvorderseite), nicht den Kiefer entlang
S = STIL
if S == "stoppeln": maske, dick = voll, 0.0004
elif S == "vollbart": maske, dick = voll, 0.007
elif S in ("kinnbart", "hufeisen"): maske, dick = np.maximum(hufeisen, oberlippe), 0.006
elif S == "schnurrbart": maske, dick = np.maximum(oberlippe, mundwinkel), 0.006
elif S == "wikinger": maske, dick = voll, 0.01
else: sys.exit(f"unbekannter Bart: {S}")
maske = glatt(maske.astype(float), 3); behalten = maske > 0.5
rand = glatt(behalten.astype(float), 6); innen = np.clip((rand - 0.5) * 2, 0, 1)                    # 0 am Rand, 1 innen
dicke = 0.0006 + dick * innen ** 0.7
if S in ("vollbart", "wikinger"): dicke *= 1 + 0.6 * weich(ZM - 0.01, ZK, z)            # zum Kinn hin voller
korn = glatt(rng.random(n), 1)
if S == "stoppeln":
    farbe = FARBE * 0.7 + np.array([0.3, 0.2, 0.15]) ** 2.2 * 0.3                                 # Haut mit Bartschatten
    C = np.tile(farbe, (n, 1)) * (0.92 + 0.16 * korn[:, None]); C = C * (1 - 0.1 * innen[:, None]) + (FARBE * 0.6) * 0.1 * innen[:, None]
else:
    ritz = 0.5 + 0.5 * np.sin(x * 900 + np.sin(z * 400) * 1.5)                                         # senkrechte Bartstruktur
    C = FARBE[None, :] * (0.7 + 0.35 * ritz[:, None] + 0.15 * korn[:, None]) * (0.75 + 0.25 * innen[:, None])
P_ab = Q + N * dicke[:, None]
for i, v in enumerate(bm.verts): v.co = P_ab[i]
farbschicht = bm.verts.layers.float_color.new("Col")
for i, v in enumerate(bm.verts): v[farbschicht] = (*np.clip(C[i], 0, 1), 1.0)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not behalten[v.index]], context="VERTS")
bm.verts.ensure_lookup_table()
# lange Strähnen (wikinger, vollbart etwas): vom Kinn und Kiefer nach unten
strang = []
V, F, CC = [], [], []
if S == "wikinger":                                                                                  # langer Vollbart: geschlossenes Volumen vom Kinn abwärts, liegt hinten an Hals und Brust, vorn gewölbt, unten in Spitzen
    breit0 = np.percentile(ax[behalten & (z < ZM - 0.008) & (z > ZK - 0.005)], 97) if (behalten & (z < ZM - 0.008)).any() else 0.06   # Kieferbreite
    def koerper_y(xx, zz):                                                                           # Körperoberfläche von vorn gesehen (Strahl von vorn nach hinten)
        hit = bvh.ray_cast(Vector((xx, -0.5, zz)), Vector((0, 1, 0)), 1.0); return hit[0].y if hit[0] is not None else KY
    KINN_Y = koerper_y(CX, ZK + 0.006); L = 0.15 * float(opt.get("laenge", 1.0)); RINGE, VORN_N = 16, 23; ringe = []; Z_OBEN = ZM - 0.015
    for r_ in range(RINGE):
        t = r_ / (RINGE - 1); zz = Z_OBEN - t * (Z_OBEN - (ZK - L))
        w_ = breit0 * (1.0 - 0.82 * t ** 1.25) + 0.005; tiefe = 0.003 + 0.038 * math.sin(min(1.0, t * 1.8) * math.pi / 2) * (1 - 0.5 * t)   # oben dünn (Kinn), dann voller
        ring = []
        for u in range(VORN_N):                                                                        # Vorderseite: Bogen von rechts nach links
            f = -1 + 2 * u / (VORN_N - 1); xx = CX + f * w_; ys = koerper_y(xx, zz)
            klump = (0.005 * abs(math.sin(f * 11 + r_ * 0.35)) + 0.002 * math.sin(f * 27 + r_)) * min(1.0, t * 3)                             # Strähnen-Wölbung
            vorne_y = min(ys - 0.002, KINN_Y - 0.002 - 0.014 * t)                                        # hängt gerade vom Kinn herab (folgt nicht dem Hals nach hinten)
            ring.append(np.array([xx, vorne_y - (tiefe + klump) * math.sqrt(max(0.0, 1 - f * f)) ** 0.7, zz]))
        for u in range(VORN_N - 2, 0, -1):                                                             # Rückseite: liegt flach am Körper
            f = -1 + 2 * u / (VORN_N - 1); xx = CX + f * w_ * 0.96; ring.append(np.array([xx, min(koerper_y(xx, zz) - 0.002, KINN_Y + 0.045 * (1 - 0.4 * t)), zz]))   # hinten am Körper, höchstens 4–5 cm tief
        ringe.append(ring)
    UM = len(ringe[0])
    for r_, ring in enumerate(ringe):
        t = r_ / (RINGE - 1)
        for u, p in enumerate(ring):
            ritz = 0.5 + 0.5 * math.sin(u * 2.1 + t * 2 + rng.random() * 0.8); V.append(p); CC.append(FARBE * (0.6 + 0.5 * ritz) * (0.8 + 0.35 * t))
    for r_ in range(RINGE - 1):
        for u in range(UM):
            a0, a1 = r_ * UM + u, r_ * UM + (u + 1) % UM; F.append((a0, a1, a1 + UM, a0 + UM))
    unten = ringe[-1]; b_unten = (RINGE - 1) * UM
    for u in range(VORN_N - 1):                                                                        # Spitzen am unteren Rand (Vorderseite)
        p0, p1 = unten[u], unten[u + 1]; sp = (p0 + p1) / 2 + np.array([0, 0.002, -0.018 - 0.02 * rng.random() * (1 - abs(u - VORN_N / 2) / VORN_N)]); bi = len(V)
        V.append(sp); CC.append(FARBE * 1.05); F.append((b_unten + u, b_unten + u + 1, bi))
    F.append(tuple(range(b_unten, b_unten + UM)))
    print(f"langer Vollbart: {RINGE} Querschnitte, Breite oben {breit0 * 200:.1f} cm, Länge {L * 100:.0f} cm")
for pts, breite, c in strang:
    b0 = len(V); nP = len(pts)
    for j, p in enumerate(pts):
        t_ = pts[min(j + 1, nP - 1)] - pts[max(j - 1, 0)]; t_ /= np.linalg.norm(t_) + 1e-9; up = np.array([0, -1.0, 0]); up -= np.dot(up, t_) * t_; up /= np.linalg.norm(up) + 1e-9; sd = np.cross(t_, up)
        br = breite * (1 - 0.92 * (j / (nP - 1)) ** 1.1) + 0.001
        for a in range(6): ang = 2 * math.pi * a / 6; V.append(p + sd * math.cos(ang) * br * 0.5 + up * math.sin(ang) * br * 0.17); CC.append(c * (0.85 + 0.3 * j / nP))
    for j in range(nP - 1):
        for a in range(6): a0, a1 = b0 + j * 6 + a, b0 + j * 6 + (a + 1) % 6; F.append((a0, a1, a1 + 6, a0 + 6))
    F.append(tuple(range(b0, b0 + 6))[::-1]); F.append(tuple(range(b0 + (nP - 1) * 6, b0 + nP * 6)))
netz = bpy.data.meshes.new("bart"); bm.to_mesh(netz); bm.free()
if V:
    bm2 = bmesh.new(); bm2.from_mesh(netz); fs = bm2.verts.layers.float_color.get("Col"); neu = [bm2.verts.new(v) for v in V]
    for v_, c in zip(neu, CC): v_[fs] = (*np.clip(c, 0, 1), 1.0)
    for f in F:
        try: bm2.faces.new([neu[i] for i in f])
        except ValueError: pass
    bm2.to_mesh(netz); bm2.free()
o = bpy.data.objects.new("bart", netz); bpy.context.collection.objects.link(o); bpy.context.view_layer.objects.active = o; o.select_set(True)
netz.color_attributes.active_color = netz.color_attributes["Col"]; netz.color_attributes.render_color_index = netz.color_attributes.active_color_index
m = bpy.data.materials.new("bart"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.65; netz.materials.append(m); bpy.ops.object.shade_smooth()
if S == "stoppeln":                                                                                  # Dreitagebart: halbdurchsichtiger Schatten über der Haut (Hautfarbe und Licht bleiben sichtbar)
    b_.inputs["Alpha"].default_value = float(opt.get("deckung", 0.32))
    try: m.blend_method = "BLEND"
    except Exception: pass
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_vertex_color="MATERIAL", export_all_vertex_colors=False)
print(f"Bart {S}: {int(behalten.sum())} Punkte Schale · {len(strang)} Strähnen · geschrieben {ziel}")
