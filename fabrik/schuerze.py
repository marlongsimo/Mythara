"""Mythara Fabrik – Lederschürze (Schmied) als Teilnetz, an die Vorderseite eines Grundkörpers angepasst.

  python3 fabrik/schuerze.py <basis.blend> <ziel.glb> [farbe=#2b211a] [abstand=0.03] [unten=0.25]
Latz von der Brust bis zum Gürtel, darunter fällt das Leder gerade bis knapp über das Knie (unten = Anteil des Oberschenkels über dem Knie).
In rig.py als Teilnetz mit "beine_mitteln": true eintragen (folgt dem Mittel beider Beine, reißt nicht zwischen den Beinen auf).
"""
import os, sys
import numpy as np
import bpy, bmesh
basis, ziel = sys.argv[1:3]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a); AB = float(opt.get("abstand", 0.03))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper"); KN = arm.data.bones
P = np.array([v.co[:] for v in k.data.vertices])
ZO = KN["oberarm.L"].head_local.z - 0.1; ZK = KN["unterschenkel.L"].head_local.z; ZH = KN["oberschenkel.L"].head_local.z
ZU = ZK + float(opt.get("unten", 0.25)) * (ZH - ZK); SX = abs(KN["oberarm.L"].head_local.x)
rumpf = P[(np.abs(P[:, 0]) < SX * 0.8)]
NZ, NU = 36, 14; zs = np.linspace(ZO, ZU, NZ)
def breite(z):                                                            # Latz schmal oben, am Gürtel und darunter breit
    t = np.clip((ZO - z) / (ZO - ZH + 1e-6), 0, 1); return SX * (0.55 + 0.55 * min(1, t * 1.6))
front = np.zeros((NZ, NU)); X = np.zeros((NZ, NU))
for i, z in enumerate(zs):
    w = breite(z); xs = np.linspace(-w, w, NU); X[i] = xs
    band = rumpf[np.abs(rumpf[:, 2] - z) < 0.03]
    for j, x in enumerate(xs):
        b = band[np.abs(band[:, 0] - x) < 0.05] if len(band) else band
        front[i, j] = (b[:, 1].min() if len(b) else np.nan)
front = np.where(np.isnan(front), np.nanmin(front), front) - AB
for i in range(1, NZ):                                                    # unterhalb der Hüfte fällt das Leder gerade: nie wieder zum Körper zurück
    if zs[i] < ZH + 0.05: front[i] = np.minimum(front[i], front[i - 1])
for _ in range(4): front[1:-1] = (front[:-2] + front[1:-1] * 2 + front[2:]) / 4
for _ in range(2): front[:, 1:-1] = (front[:, :-2] + front[:, 1:-1] * 2 + front[:, 2:]) / 4
bm = bmesh.new(); vs = [[bm.verts.new((X[i, j], front[i, j], zs[i])) for j in range(NU)] for i in range(NZ)]
for i in range(NZ - 1):
    for j in range(NU - 1): bm.faces.new((vs[i][j], vs[i][j + 1], vs[i + 1][j + 1], vs[i + 1][j]))
hals = KN["hals"].head_local                                              # Nackenriemen: von den oberen Ecken zum Hals
for j in (0, NU - 1):
    a = vs[0][j].co.copy(); h = (hals.x + np.sign(a.x) * 0.06, hals.y - 0.01, hals.z + 0.02); n = 6
    rs = [bm.verts.new((a.x + (h[0] - a.x) * t + d, a.y + (h[1] - a.y) * t, a.z + (h[2] - a.z) * t)) for t in np.linspace(0, 1, n) for d in (0, 0.025 * (-np.sign(a.x)))]
    for q in range(n - 1): bm.faces.new((rs[2 * q], rs[2 * q + 1], rs[2 * q + 3], rs[2 * q + 2]))
me = bpy.data.meshes.new("schuerze"); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new("schuerze", me); bpy.context.collection.objects.link(o)
bpy.context.view_layer.objects.active = o; o.select_set(True); s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.008; bpy.ops.object.modifier_apply(modifier="d")
h_ = opt.get("farbe", "#2b211a").lstrip("#"); c = [int(h_[i:i + 2], 16) / 255 for i in (0, 2, 4)]; c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
m = bpy.data.materials.new("leder"); m.use_nodes = True; m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*c, 1); m.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.75; me.materials.append(m)
bpy.ops.object.shade_smooth(); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print(f"Schürze: {ZU:.2f}–{ZO:.2f} m hoch, {len(me.vertices)} Punkte")
