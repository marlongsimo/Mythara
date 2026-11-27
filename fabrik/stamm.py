"""Mythara Fabrik – ein Baumstamm-Stück (Rohstoff, Questgegenstand) als kleines 3D-Modell, wie die Stamm-Bilder der Holzfällerei.

  <blender-python> fabrik/stamm.py -- <ziel.glb> [laenge=0.6] [radius=0.16] [rinde=#5a4130] [kern=#d9b07a] [riss=#58c8ff] [risse=2] [seed=7]

Liegender Stamm entlang x (Mitte im Ursprung, unten auf z = 0): Rinde mit Längsrillen und Wülsten (Punktfarbe, dunkel in den Rillen),
helle Schnittflächen mit Jahresringen; risse = Anzahl leuchtender Adern über die Rinde (Weltenbaum: blau, 0 = keine) als eigenes,
selbstleuchtendes Material. Keine Textur – klein und schnell, passt neben die gemalten Stamm-Bilder.
"""
import math, os, sys
import numpy as np
import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)
a_ = sys.argv[sys.argv.index("--") + 1:]; ziel = a_[0]; opt = dict(x.split("=", 1) for x in a_[1:] if "=" in x)
L, R, RISSE, rng = float(opt.get("laenge", 0.6)), float(opt.get("radius", 0.16)), int(opt.get("risse", 2)), np.random.default_rng(int(opt.get("seed", 7)))
farbe = lambda h: np.array([int(h.lstrip("#")[i:i + 2], 16) / 255 for i in (0, 2, 4)])
RINDE, KERN, RISS = farbe(opt.get("rinde", "#5a4130")), farbe(opt.get("kern", "#d9b07a")), farbe(opt.get("riss", "#58c8ff"))
NA, NL, NR = 96, 40, 10                                                                          # Punkte rundum, entlang, Ringe je Schnittfläche
rillen = rng.uniform(0, 2 * np.pi, 15); wuelste = rng.uniform(-L / 2, L / 2, 4)
def r_rinde(w, x):                                                                               # Rillen längs, sanfte Wülste, leicht unrund
    r = R * (1 + 0.04 * np.sin(3 * w + 0.7) + 0.03 * np.sin(5 * w))
    for g in rillen: r -= R * 0.11 * np.exp(-((np.angle(np.exp(1j * (w - g)))) / 0.07) ** 2) * (0.7 + 0.3 * np.sin(9 * x + g))
    for x0 in wuelste: r += R * 0.025 * np.exp(-((x - x0) / 0.05) ** 2)
    return r
V, F, C = [], [], []
for j in range(NL + 1):                                                                          # Mantel
    x = -L / 2 + L * j / NL
    for i in range(NA):
        w = 2 * np.pi * i / NA; r = r_rinde(w, x); V.append((x, r * np.cos(w), r * np.sin(w)))
        t = np.clip((r / R - 0.88) / 0.18, 0, 1); C.append(RINDE * (0.35 + 0.9 * t) * (0.92 + 0.08 * rng.random()))
for j in range(NL):
    for i in range(NA): a, b = j * NA + i, j * NA + (i + 1) % NA; F.append((a, b, b + NA, a + NA))
for s in (-1, 1):                                                                                # Schnittflächen: Ringe nach innen, Jahresringe in der Farbe
    x = s * L / 2; ring0 = 0 if s < 0 else NL * NA; vor = ring0
    for k in range(1, NR + 1):
        f = 1 - k / (NR + 1); x_ = x - s * 0.004 * (1 - f); neu = len(V)
        for i in range(NA):
            w = 2 * np.pi * i / NA; r = r_rinde(w, x) * f * 0.97; V.append((x_, r * np.cos(w), r * np.sin(w)))
            jahr = 0.5 + 0.5 * np.cos(f * 7 * np.pi); C.append(KERN * (0.82 + 0.18 * jahr) * (0.8 if k == 1 else 1.0))
        for i in range(NA):
            a, b = vor + i, vor + (i + 1) % NA; c, d = neu + (i + 1) % NA, neu + i
            F.append((a, b, c, d) if s > 0 else (d, c, b, a))
        vor = neu
    mitte = len(V); V.append((x, 0, 0)); C.append(KERN * 0.75)
    for i in range(NA): a, b = vor + i, vor + (i + 1) % NA; F.append((a, b, mitte) if s > 0 else (b, a, mitte))
V = np.array(V); z0 = V[:, 2].min(); V[:, 2] -= z0
me = bpy.data.meshes.new("stamm"); me.from_pydata(V.tolist(), [], F); me.update()
ca = me.color_attributes.new("Col", "FLOAT_COLOR", "CORNER"); lp = np.array([l.vertex_index for l in me.loops])   # linear (Farben oben sind sRGB)
ca.data.foreach_set("color", np.concatenate([np.clip(np.array(C), 0, 1)[lp] ** 2.2, np.ones((len(lp), 1))], 1).ravel().astype(np.float32))
ob = bpy.data.objects.new("stamm", me); bpy.context.collection.objects.link(ob)
def mat(n, emit=None):
    m = bpy.data.materials.new(n); m.use_nodes = True; nt = m.node_tree; bsdf = nt.nodes["Principled BSDF"]; bsdf.inputs["Roughness"].default_value = 0.85
    if emit is None: vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; nt.links.new(vc.outputs["Color"], bsdf.inputs["Base Color"])
    else: bsdf.inputs["Base Color"].default_value = (*emit, 1); bsdf.inputs["Emission Color"].default_value = (*emit, 1); bsdf.inputs["Emission Strength"].default_value = 1.2
    return m
ob.data.materials.append(mat("rinde"))
if RISSE:                                                                                         # leuchtende Adern: schmale Bänder knapp über der Rinde, schräg und gewunden
    ob.data.materials.append(mat("ader", RISS)); AV, AF = [], []
    for k in range(RISSE):
        w0, steig, schl = rng.uniform(-np.pi, np.pi), rng.uniform(1.5, 3.0) * rng.choice([-1, 1]), rng.uniform(0, 6)
        x0, hl = rng.uniform(-L / 5, L / 5), L * rng.uniform(0.25, 0.38); xs = np.linspace(max(-L / 2 + 0.02, x0 - hl), min(L / 2 - 0.02, x0 + hl), 60)
        for j, x in enumerate(xs):
            w = w0 + steig * x + 0.35 * np.sin(14 * x + schl) + 0.06 * np.sin(97 * x + 3 * schl); r = r_rinde(w, x) + 0.003; b = 0.006 * (1 - abs(2 * j / (len(xs) - 1) - 1)) + 0.002   # spitz auslaufend
            for dw in (-b / r, b / r): AV.append((x, r * np.cos(w + dw), r * np.sin(w + dw)))
            if j: n = len(AV); AF.append((n - 4, n - 2, n - 1, n - 3))
    am = bpy.data.meshes.new("ader"); AVa = np.array(AV); AVa[:, 2] -= z0; am.from_pydata(AVa.tolist(), [], AF); am.update(); am.materials.append(ob.data.materials[1])
    ao = bpy.data.objects.new("ader", am); bpy.context.collection.objects.link(ao); ao.select_set(True)
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.join()
for p in ob.data.polygons: p.use_smooth = True
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
print("Stamm:", ziel, f"{len(V)} Punkte, {len(F)} Flächen, Länge {L} m, Risse {RISSE}")
