"""Mythara Figuren-Fabrik – Gegenstände der Phase 2 „Waldland“ (Quests A1–A3, 26.11.2026):
Brot, Golemstein, Steintafel-Bruchstück, Holzkohle, Wappenabrieb, Mehlsack, Mühlenachslager (Rucksack-Bilder, 256 px)
und die Zielscheibe als 3D-Modell (img/figuren-echt3d/zielscheibe3d.glb, Gegner „zielscheibe“).
Ausgabe: img/objekte3d/skilling/erzeugnisse/<id>.png (danach: python3 fabrik/waldland_dinge_webp.py → .webp)
Aufruf (im Ordner mythara): blender -b -P fabrik/waldland_dinge.py [-- id …]"""
import bpy, math, os, sys, random
from mathutils import Vector

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BILD = os.path.join(WURZEL, "img/objekte3d/skilling/erzeugnisse"); FIGUREN = os.path.join(WURZEL, "img/figuren-echt3d")
random.seed(7)

def hex2(h, a=1.0): h = h.lstrip("#"); return tuple(pow(int(h[i:i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (a,)
def mat(name, farbe, rau=0.75, metall=0.0, leucht=None, staerke=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = hex2(farbe); p.inputs["Roughness"].default_value = rau; p.inputs["Metallic"].default_value = metall
    if leucht: p.inputs["Emission Color"].default_value = hex2(leucht); p.inputs["Emission Strength"].default_value = staerke
    return m
def rauh(m, staerke=0.4, skala=40):
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]; b = nt.nodes.new("ShaderNodeBump"); b.inputs["Strength"].default_value = staerke
    t = nt.nodes.new("ShaderNodeTexNoise"); t.inputs["Scale"].default_value = skala; t.inputs["Detail"].default_value = 8; nt.links.new(t.outputs["Fac"], b.inputs["Height"]); nt.links.new(b.outputs["Normal"], p.inputs["Normal"]); return m
def leeren():
    bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete()
    for b in (bpy.data.meshes, bpy.data.materials, bpy.data.curves, bpy.data.cameras, bpy.data.lights): [b.remove(x) for x in list(b)]
def setze(o, m): o.data.materials.clear(); o.data.materials.append(m); return o
def glatt(o): bpy.context.view_layer.objects.active = o; bpy.ops.object.shade_smooth(); return o
def fase(o, w=0.008, n=3):
    md = o.modifiers.new("fase", "BEVEL"); md.width = w; md.segments = n; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="fase"); return o
def verbeulen(o, staerke=0.02, skala=2.0):
    """Verschiebung mit Rauschen: unregelmäßige Steine und Brocken"""
    t = bpy.data.textures.new("beul", "CLOUDS"); t.noise_scale = skala / 10
    md = o.modifiers.new("beul", "DISPLACE"); md.texture = t; md.strength = staerke; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="beul"); return o
def unterteilt(o, n=2):
    md = o.modifiers.new("sub", "SUBSURF"); md.levels = n; md.render_levels = n; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="sub"); return o

# ---------- Formen ----------
def brot():
    """runder Laib, Kruste mit drei Einschnitten und etwas Mehl"""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.15, location=(0, 0, 0.07)); l = bpy.context.object; l.scale = (1.15, 0.95, 0.62)
    glatt(setze(l, rauh(mat("kruste", "#b8732e", 0.65), 0.35, 60)))
    for i in (-1, 0, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(i * 0.06, 0, 0.158)); s = bpy.context.object; s.scale = (0.016, 0.16, 0.004); s.rotation_euler = (0, 0, math.radians(25))
        setze(s, mat("schnitt", "#e2c48a", 0.9))
    for _ in range(14):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.006, location=(random.uniform(-0.12, 0.12), random.uniform(-0.09, 0.09), 0.15)); setze(bpy.context.object, mat("mehl", "#f4ecdc", 0.95))

def golemstein():
    """Mauerstein, von Wurzeln umschlungen, mit Moos"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.08)); s = bpy.context.object; s.scale = (0.26, 0.18, 0.15)
    fase(s, 0.02, 2); unterteilt(s, 2); verbeulen(s, 0.025, 3); glatt(setze(s, rauh(mat("stein", "#7d7a6e", 0.9), 0.6, 30)))
    for a in (0.3, 1.9, 3.6):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.13, minor_radius=0.011, location=(0, 0, 0.08), rotation=(math.radians(70), 0, a)); glatt(setze(bpy.context.object, mat("wurzel", "#4a3220", 0.8)))
    for _ in range(9):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.025, 0.045), location=(random.uniform(-0.12, 0.12), random.uniform(-0.08, 0.08), 0.155)); m = bpy.context.object; m.scale = (1, 1, 0.45)
        glatt(setze(m, rauh(mat("moos", "#4f7a2e", 1.0), 0.8, 80)))

def steintafel():
    """Bruchstück einer Steintafel mit eingemeißelten Zeilen"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.025)); t = bpy.context.object; t.scale = (0.28, 0.22, 0.05)
    bm_schnitt = [(0.13, 0.09, 0.7), (-0.12, -0.1, -0.6)]
    for (x, y, a) in bm_schnitt:   # abgebrochene Ecken
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 0.025)); c = bpy.context.object; c.scale = (0.12, 0.12, 0.2); c.rotation_euler = (0, 0, a)
        md = t.modifiers.new("bruch", "BOOLEAN"); md.object = c; md.operation = "DIFFERENCE"; bpy.context.view_layer.objects.active = t; bpy.ops.object.modifier_apply(modifier="bruch"); bpy.data.objects.remove(c)
    setze(t, rauh(mat("tafel", "#9a978c", 0.9), 0.5, 35))
    for i in range(4):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.01, 0.06 - i * 0.04, 0.051)); z = bpy.context.object; z.scale = (0.18 - 0.03 * (i % 2), 0.008, 0.004); setze(z, mat("rille", "#4e4b44", 0.95))

def kohle():
    """drei schwarze Brocken Holzkohle mit Jahresringen"""
    for i, (x, y, r) in enumerate([(-0.06, 0.02, 0.075), (0.07, -0.02, 0.065), (0.0, 0.06, 0.05)]):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=r, location=(x, y, r * 0.6)); k = bpy.context.object; k.scale = (1.5, 1.0, 0.8); k.rotation_euler = (0, 0, i * 0.7)
        bpy.context.view_layer.update(); verbeulen(k, 0.03, 2); setze(k, rauh(mat(f"kohle{i}", "#26231f", 0.55, 0.15), 1.0, 70))

def wappenabrieb():
    """Pergament mit einem Kohleabrieb: Turm über drei Wellen"""
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.004)); p = bpy.context.object; p.scale = (0.3, 0.38, 1)
    md = p.modifiers.new("lage", "SUBSURF"); md.levels = 3; bpy.context.view_layer.objects.active = p; bpy.ops.object.modifier_apply(modifier="lage"); verbeulen(p, 0.006, 6)
    setze(p, rauh(mat("pergament", "#e6d3a3", 0.9), 0.2, 20))
    kohle_m = mat("abrieb", "#2b2620", 0.95)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.03, 0.007)); t = bpy.context.object; t.scale = (0.08, 0.16, 0.002); setze(t, kohle_m)                     # Turm
    for x in (-0.03, 0, 0.03):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0.125, 0.007)); z = bpy.context.object; z.scale = (0.018, 0.03, 0.002); setze(z, kohle_m)          # Zinnen
    for i in range(3):
        for j in range(5):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.1 + j * 0.05, -0.08 - i * 0.035, 0.007)); w = bpy.context.object; w.scale = (0.045, 0.01, 0.002)
            w.rotation_euler = (0, 0, math.radians(18 if j % 2 else -18)); setze(w, kohle_m)                                                                  # drei Wellen

def mehlsack():
    """gefüllter Leinensack, oben zugebunden"""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, radius=0.13, location=(0, 0, 0.12)); s = bpy.context.object; s.scale = (1.0, 0.85, 1.15)
    verbeulen(s, 0.01, 4); glatt(setze(s, rauh(mat("leinen", "#d8c9a4", 0.95), 0.3, 120)))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.05, radius2=0.025, depth=0.07, location=(0, 0, 0.28)); glatt(setze(bpy.context.object, rauh(mat("zipfel", "#d2c29c", 0.95), 0.3, 120)))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.042, minor_radius=0.008, location=(0, 0, 0.255)); glatt(setze(bpy.context.object, mat("schnur", "#7a5a34", 0.8)))
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0.0, -0.11, 0.14), rotation=(math.radians(80), 0, 0)); a = bpy.context.object; a.scale = (0.07, 0.05, 1); setze(a, mat("aufdruck", "#8a6a3a", 0.9))

def muehlenachslager():
    """Lagerring aus Kupfer mit Nabe und vier Bolzen"""
    bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.035, location=(0, 0, 0.035)); glatt(setze(bpy.context.object, mat("kupfer", "#b8683a", 0.35, 1.0)))
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.06, depth=0.07, location=(0, 0, 0.035)); glatt(fase(setze(bpy.context.object, mat("nabe", "#9a5530", 0.4, 1.0)), 0.006))
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.028, depth=0.08, location=(0, 0, 0.04)); setze(bpy.context.object, mat("loch", "#2a1a12", 0.8))
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.012, depth=0.03, location=(0.12 * math.cos(a), 0.12 * math.sin(a), 0.075)); setze(bpy.context.object, mat("bolzen", "#d08a52", 0.3, 1.0))

def zielscheibe():
    """Strohscheibe mit drei Ringen auf einem Holzgestell (in Metern, 1,6 m hoch) – als Gegner-Modell"""
    holz = mat("gestell", "#7a5534", 0.85)
    for x in (-0.35, 0.35):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0.12, 0.7)); b = bpy.context.object; b.scale = (0.07, 0.07, 1.4); b.rotation_euler = (math.radians(-8), 0, 0); setze(b, holz)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.35, 0.55)); s = bpy.context.object; s.scale = (0.06, 0.06, 1.2); s.rotation_euler = (math.radians(30), 0, 0); setze(s, holz)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.5, depth=0.14, location=(0, 0.02, 1.0), rotation=(math.pi / 2, 0, 0)); setze(bpy.context.object, rauh(mat("stroh", "#c9a85a", 0.95), 0.6, 90))
    for r, f, d in ((0.42, "#e9e0c8", 0.15), (0.3, "#b8322a", 0.16), (0.18, "#e9e0c8", 0.17), (0.08, "#b8322a", 0.18)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=0.01, location=(0, 0.02 - d / 2, 1.0), rotation=(math.pi / 2, 0, 0)); setze(bpy.context.object, mat(f"ring{r}", f, 0.9))

# ---------- Rucksack-Bild ----------
def bild(id_):
    sz = bpy.context.scene; sz.render.engine = "CYCLES"; sz.cycles.samples = 64; sz.cycles.use_denoising = False; sz.cycles.device = "CPU"; sz.render.film_transparent = True
    sz.render.resolution_x = sz.render.resolution_y = 256; sz.render.image_settings.file_format = "PNG"; sz.render.image_settings.color_mode = "RGBA"; sz.view_settings.view_transform = "Standard"
    bpy.context.view_layer.update(); lo, hi = Vector((9, 9, 9)), Vector((-9, -9, -9))
    for o in sz.objects:
        if o.type == "MESH":
            for v in o.bound_box: p = o.matrix_world @ Vector(v); lo = Vector(map(min, lo, p)); hi = Vector(map(max, hi, p))
    mitte = (lo + hi) / 2; gross = max(hi - lo); print("rahmen", id_, [round(x, 3) for x in lo], [round(x, 3) for x in hi])
    bpy.ops.object.camera_add(location=mitte + Vector((0.55, -0.75, 0.6)) * max(1, gross / 0.4)); k = bpy.context.object; k.data.type = "ORTHO"; k.data.ortho_scale = gross * 1.35
    richt = mitte - k.location; k.rotation_euler = richt.to_track_quat("-Z", "Y").to_euler(); sz.camera = k
    bpy.ops.object.light_add(type="SUN", location=(1, -1, 2)); s = bpy.context.object; s.data.energy = 3.2; s.rotation_euler = (math.radians(40), math.radians(15), math.radians(35))
    bpy.ops.object.light_add(type="AREA", location=(-0.8, -0.4, 0.6)); f = bpy.context.object; f.data.energy = 25; f.data.size = 1.2; f.rotation_euler = (math.radians(60), 0, math.radians(-60))
    w = bpy.data.worlds.new("w") if not bpy.data.worlds else bpy.data.worlds[0]; sz.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.6
    sz.render.filepath = os.path.join(BILD, id_ + ".png"); bpy.ops.render.render(write_still=True); print("fertig", id_)

nur = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
for id_, bau in [("brot", brot), ("golemstein", golemstein), ("steintafel", steintafel), ("kohle", kohle), ("wappenabrieb", wappenabrieb), ("mehlsack", mehlsack), ("muehlenachslager", muehlenachslager)]:
    if nur and id_ not in nur: continue
    leeren(); bau(); bild(id_)
if not nur or "zielscheibe" in nur:
    leeren(); zielscheibe()
    for o in bpy.context.scene.objects: o.select_set(o.type == "MESH")
    bpy.ops.export_scene.gltf(filepath=os.path.join(FIGUREN, "zielscheibe3d.glb"), export_format="GLB", use_selection=True, export_apply=True); print("fertig zielscheibe3d.glb")
