"""Mythara Fabrik – Werkbank (Handwerk) in Blender bauen: Bohlenplatte, Werkzeugwand, Schraubstock, Ablage, Späne; Hammer und Holzbeil aus img/objekte3d/skilling/utensilien.
  python3 fabrik/werkbank.py -- <ziel ohne Endung>   → <ziel>.blend und Vorschauen; weiter mit fabrik/werkbank_backen.py"""
import bpy, math, sys, random
from mathutils import Vector
ziel = sys.argv[sys.argv.index("--")+1]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene; random.seed(3)
def holz(name, farbe, rau=0.7, maser=8.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes["Principled BSDF"]; bs.inputs["Roughness"].default_value = rau
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.25, 6.0, 6.0)   # Maserung längs (x), fein quer
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    w = nt.nodes.new("ShaderNodeTexNoise"); w.inputs["Scale"].default_value = maser * 0.6; w.inputs["Detail"].default_value = 4; w.inputs["Distortion"].default_value = 1.5; nt.links.new(mp.outputs["Vector"], w.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeValToRGB"); r.color_ramp.elements[0].position = 0.35; r.color_ramp.elements[1].position = 0.65
    r.color_ramp.elements[0].color = [c * 0.78 for c in farbe] + [1]; r.color_ramp.elements[1].color = list(farbe) + [1]
    nt.links.new(w.outputs["Fac"], r.inputs["Fac"]); nt.links.new(r.outputs["Color"], bs.inputs["Base Color"]); return m
def metall(name, farbe, rau=0.4):
    m = bpy.data.materials.new(name); m.use_nodes = True; bs = m.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = list(farbe) + [1]; bs.inputs["Metallic"].default_value = 0.9; bs.inputs["Roughness"].default_value = rau; return m
HELL = holz("eiche", (0.55, 0.36, 0.18)); DUNKEL = holz("bein", (0.36, 0.22, 0.11), maser=5); EISEN = metall("eisen", (0.32, 0.32, 0.34)); MESSING = metall("messing", (0.75, 0.55, 0.22), 0.3)
def kiste(name, ort, mass, mat, dreh=(0, 0, 0), fase=0.012):
    bpy.ops.mesh.primitive_cube_add(location=ort, rotation=dreh); o = bpy.context.object; o.name = name; o.scale = [m / 2 for m in mass]
    bpy.ops.object.transform_apply(scale=True); b = o.modifiers.new("fase", "BEVEL"); b.width = fase; b.segments = 2; o.data.materials.append(mat); return o
def zyl(name, ort, r, h, mat, dreh=(0, 0, 0), n=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=n, radius=r, depth=h, location=ort, rotation=dreh); o = bpy.context.object; o.name = name; o.data.materials.append(mat); return o
L, T, H = 1.8, 0.8, 0.9                                                       # Länge, Tiefe, Höhe der Platte
for i in range(5): kiste(f"platte{i}", (0, -T / 2 + T / 10 + i * T / 5, H - 0.04), (L, T / 5 - 0.006, 0.08), HELL)   # Platte aus fünf Bohlen
for sx in (-1, 1):
    for sy in (-1, 1): kiste("bein", (sx * (L / 2 - 0.12), sy * (T / 2 - 0.1), (H - 0.08) / 2), (0.11, 0.11, H - 0.08), DUNKEL)
    kiste("quer", (sx * (L / 2 - 0.12), 0, 0.2), (0.07, T - 0.2, 0.08), DUNKEL)
for sy in (-1, 1): kiste("zarge", (0, sy * (T / 2 - 0.1), H - 0.14), (L - 0.24, 0.05, 0.1), DUNKEL)
for i in range(4): kiste(f"boden{i}", (0, -T / 2 + 0.17 + i * 0.155, 0.27), (L - 0.36, 0.14, 0.025), HELL)            # Ablage unten
for i in range(3): kiste(f"brett{i}", (0.1 + i * 0.03, -0.05, 0.31 + i * 0.03), (0.9, 0.16, 0.03), HELL, (0, 0, math.radians(3 * i)))   # Bretterstapel
# Schraubstock vorn links
kiste("backe1", (-0.6, -T / 2 - 0.03, H + 0.04), (0.26, 0.06, 0.12), EISEN); kiste("backe2", (-0.6, -T / 2 - 0.15, H + 0.04), (0.26, 0.06, 0.12), EISEN)
zyl("spindel", (-0.6, -T / 2 - 0.12, H + 0.0), 0.018, 0.3, MESSING, (math.radians(90), 0, 0)); zyl("knebel", (-0.6, -T / 2 - 0.27, H + 0.0), 0.012, 0.3, EISEN, (0, math.radians(90), 0))
# Werkzeugwand hinten
kiste("wand", (0, T / 2 - 0.02, H + 0.45), (L - 0.1, 0.04, 0.8), DUNKEL)
for sx in (-1, 1): kiste("pfosten", (sx * (L / 2 - 0.08), T / 2 - 0.02, H + 0.45), (0.08, 0.07, 0.9), DUNKEL)
kiste("leiste", (0, T / 2 - 0.06, H + 0.62), (L - 0.2, 0.04, 0.05), HELL)
for i, x in enumerate((-0.6, -0.3, 0.2, 0.5)): zyl(f"haken{i}", (x, T / 2 - 0.1, H + 0.62), 0.01, 0.1, EISEN, (math.radians(90), 0, 0))
# Säge an der Wand: Blatt + Griff
kiste("saegeblatt", (-0.45, T / 2 - 0.09, H + 0.42), (0.55, 0.005, 0.12), metall("blatt", (0.6, 0.6, 0.62), 0.25), (0, math.radians(-8), 0)); kiste("saegegriff", (-0.12, T / 2 - 0.09, H + 0.46), (0.12, 0.03, 0.12), HELL)
# Zange, Meißel liegen auf der Platte
kiste("meissel", (0.25, -0.15, H + 0.015), (0.28, 0.025, 0.02), EISEN, (0, 0, math.radians(25))); kiste("meisselgriff", (0.38, -0.09, H + 0.02), (0.12, 0.035, 0.035), DUNKEL, (0, 0, math.radians(25)))
for d in (-12, 12): kiste("zange", (0.55, 0.05, H + 0.012), (0.24, 0.02, 0.015), EISEN, (0, 0, math.radians(d)))
# Holzspäne
for i in range(28):
    a = random.uniform(0, 6.28); r = random.uniform(0.05, 0.35)
    zyl(f"span{i}", (0.0 + r * math.cos(a), -0.1 + r * math.sin(a) * 0.5, H + 0.006), 0.018, 0.006, HELL, (random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6), 0), 8)
# echte Utensilien aus dem Spiel: Hammer liegt, Holzbeil steckt im Klotz
def glb(pfad, ort, dreh, s=1.0):
    vor = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=pfad); neu = [o for o in bpy.data.objects if o not in vor]
    w = bpy.data.objects.new("halter", None); sc.collection.objects.link(w)
    for o in neu:
        if o.parent is None: o.parent = w
    w.location = ort; w.rotation_euler = dreh; w.scale = (s, s, s)
glb("img/objekte3d/skilling/utensilien/hammer.glb", (-0.15, -0.2, H + 0.03), (math.radians(90), 0, math.radians(70)))
zyl("klotz", (0.72, -0.18, H + 0.1), 0.12, 0.2, DUNKEL)
glb("img/objekte3d/skilling/utensilien/holzbeil.glb", (0.72, -0.18, H + 0.62), (math.radians(180), math.radians(12), 0))
# Boden, Licht, Kamera
bpy.ops.mesh.primitive_plane_add(size=8); g = bpy.context.object; gm = bpy.data.materials.new("gras"); gm.use_nodes = True; gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.2, 0.3, 0.1, 1); g.data.materials.append(gm)
eng = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]; sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in eng else "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"; sc.render.resolution_x, sc.render.resolution_y = 1000, 750
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.8, 0.9, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.8
l = bpy.data.objects.new("sonne", bpy.data.lights.new("sonne", "SUN")); l.data.energy = 3.5; l.rotation_euler = (math.radians(50), 0, math.radians(-35)); sc.collection.objects.link(l)
try: sc.eevee.use_shadows = True
except Exception: pass
cam = bpy.data.objects.new("k", bpy.data.cameras.new("k")); sc.collection.objects.link(cam); sc.camera = cam
for name, (dreh, neig, ortho) in {"spiel": (0, 35, 2.6), "schraeg": (-35, 22, 2.6)}.items():
    a, n = math.radians(dreh), math.radians(neig); cam.data.type = "ORTHO"; cam.data.ortho_scale = ortho
    cam.location = (10 * math.sin(a) * math.cos(n), -10 * math.cos(a) * math.cos(n), 0.8 + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, a)
    sc.render.filepath = ziel + "-" + name + ".png"; bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=ziel + ".blend")
