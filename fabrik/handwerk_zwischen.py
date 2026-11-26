"""Mythara Figuren-Fabrik – Zwischenprodukte des Handwerks: Bogensehne, Garn, 6 Leder (gerollt), 6 Stoffe (gefaltet).
Farben je Stufe wie die Leder- und Stoffrüstungen (fabrik/seltenheit.py): Training naturbraun/Hanftuch, Einfach sattelbraun/Grobtuch,
Selten waldgrün/smaragd, Episch nachtblau/purpur (blaue Nähte), Legendär ochsenblut/karmesin (orange-goldene Nähte),
Mythisch schillerndes Violett (türkis-magenta Nähte).
Ausgabe: img/objekte3d/skilling/handwerk/zwischen/<id>.glb (am Boden) und img/objekte3d/skilling/erzeugnisse/<id>.webp (Rucksack, 256 px).
Aufruf (im Ordner mythara): blender -b -P fabrik/handwerk_zwischen.py"""
import bpy, math, os, sys
from mathutils import Vector

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GLB = os.path.join(WURZEL, "img/objekte3d/skilling/handwerk/zwischen"); BILD = os.path.join(WURZEL, "img/objekte3d/skilling/erzeugnisse")
os.makedirs(GLB, exist_ok=True)

def hex2(h, a=1.0): h = h.lstrip("#"); return tuple(pow(int(h[i:i + 2], 16) / 255, 2.2) for i in (0, 2, 4)) + (a,)
def mat(name, farbe, rau=0.75, leucht=None, staerke=0.0, metall=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = hex2(farbe); p.inputs["Roughness"].default_value = rau; p.inputs["Metallic"].default_value = metall
    if leucht: p.inputs["Emission Color"].default_value = hex2(leucht); p.inputs["Emission Strength"].default_value = staerke
    return m
def struktur(m, art):
    """Narbung (Leder) bzw. Webmuster (Stoff) als Relief – nur fürs gerenderte Bild"""
    nt = m.node_tree; p = nt.nodes["Principled BSDF"]; b = nt.nodes.new("ShaderNodeBump"); b.inputs["Strength"].default_value = 0.35 if art == "leder" else 0.25
    if art == "leder": t = nt.nodes.new("ShaderNodeTexNoise"); t.inputs["Scale"].default_value = 180; t.inputs["Detail"].default_value = 6; nt.links.new(t.outputs["Fac"], b.inputs["Height"])
    else: t = nt.nodes.new("ShaderNodeTexWave"); t.inputs["Scale"].default_value = 90; t.wave_type = "BANDS"; t.inputs["Distortion"].default_value = 1.5; nt.links.new(t.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"]); return m
def leeren():
    bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete()
    for b in (bpy.data.meshes, bpy.data.materials, bpy.data.curves): [b.remove(x) for x in list(b)]
def setze(o, m): o.data.materials.clear(); o.data.materials.append(m); return o
def glatt(o, stufen=2):
    bpy.context.view_layer.objects.active = o; bpy.ops.object.shade_smooth(); return o
def fase(o, w=0.008, n=3):
    md = o.modifiers.new("fase", "BEVEL"); md.width = w; md.segments = n; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="fase"); return o

# ---------- Formen ----------
def leder(farbe, dunkel, naht=None, naht2=None):
    """gerollte Haut mit zwei Riemen; auf der Rollkante ein Überstand; ab Episch leuchtende Nähte an den Enden"""
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.085, depth=0.30, rotation=(0, math.pi / 2, 0), location=(0, 0, 0.085))
    rolle = glatt(fase(setze(bpy.context.object, struktur(mat("leder", farbe, 0.8), "leder")), 0.01))
    for x in (-0.151, 0.151):   # Stirnseiten: die eingerollten Lagen als Ringe
        for r in (0.07, 0.05, 0.03):
            bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.004, location=(x, 0, 0.085), rotation=(0, math.pi / 2, 0)); glatt(setze(bpy.context.object, mat("lage", dunkel, 0.85)))
    for x in (-0.085, 0.085):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.089, minor_radius=0.009, location=(x, 0, 0.085), rotation=(0, math.pi / 2, 0)); glatt(setze(bpy.context.object, mat("riemen", dunkel, 0.6)))
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, 0.178)); s = bpy.context.object; s.scale = (0.03, 0.022, 0.012); setze(s, mat("schnalle", "#c9a24a" if not naht else "#d9d2c2", 0.35, naht, 2.5 if naht else 0, 0.8))
    if naht:
        for i, x in enumerate((-0.148, 0.148)):
            bpy.ops.mesh.primitive_torus_add(major_radius=0.072, minor_radius=0.0035, location=(x, 0, 0.085), rotation=(0, math.pi / 2, 0))
            setze(bpy.context.object, mat("naht", naht if (i == 0 or not naht2) else naht2, 0.4, naht if (i == 0 or not naht2) else naht2, 6))

def stoff(farbe, saum, naht=None, naht2=None):
    """drei gefaltete Lagen (quadratisch), etwas versetzt, mit einem Bindfaden; ab Episch leuchtender Saum"""
    for i in range(3):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.006 * (i - 1), -0.004 * i, 0.022 + i * 0.04)); l = bpy.context.object
        l.scale = (0.26, 0.26, 0.036); l.rotation_euler = (0, 0, math.radians((i - 1) * 4)); setze(l, struktur(mat(f"lage{i}", farbe, 0.9), "stoff")); fase(l, 0.012, 4); glatt(l)
        if naht:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0.006 * (i - 1), -0.004 * i - 0.131, 0.022 + i * 0.04)); s = bpy.context.object
            s.scale = (0.24, 0.006, 0.008); s.rotation_euler = (0, 0, math.radians((i - 1) * 4)); c = naht if (i % 2 == 0 or not naht2) else naht2; setze(s, mat(f"saum{i}", c, 0.4, c, 5))
        else:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(0.006 * (i - 1), -0.004 * i - 0.131, 0.022 + i * 0.04)); s = bpy.context.object
            s.scale = (0.24, 0.005, 0.006); s.rotation_euler = (0, 0, math.radians((i - 1) * 4)); setze(s, mat(f"saum{i}", saum, 0.8))
    for y in (-0.06, 0.06):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, y, 0.0625)); b = bpy.context.object; b.scale = (0.272, 0.008, 0.126); setze(b, mat("kordel", "#6e5434", 0.9)); fase(b, 0.003)

def garn():
    """Holzspule mit Hanfgarn"""
    for z in (0.012, 0.188):
        bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.085, depth=0.024, location=(0, 0, z)); glatt(fase(setze(bpy.context.object, mat("holz", "#8a5a32", 0.6)), 0.006))
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.03, depth=0.17, location=(0, 0, 0.1)); setze(bpy.context.object, mat("holz2", "#7a4e2a", 0.6))
    for i in range(9):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.058, minor_radius=0.011, location=(0, 0, 0.03 + i * 0.0175), rotation=(math.radians(4 * (-1) ** i), 0, 0))
        glatt(setze(bpy.context.object, mat(f"garn{i}", "#cdb88c" if i % 2 else "#bfa877", 0.95)))
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.004, depth=0.12, location=(0.07, 0.03, 0.15), rotation=(0.6, 0.9, 0)); setze(bpy.context.object, mat("faden", "#cdb88c", 0.95))

def sehne():
    """aufgewickelte Bogensehne aus Flachs, mit zwei Schlaufen"""
    for i in range(6):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.105 + 0.004 * (i % 3), minor_radius=0.0045, location=(0.003 * i, -0.002 * i, 0.006 + i * 0.006), rotation=(math.radians(3 * (i % 2)), math.radians(2 * (i % 3)), 0))
        glatt(setze(bpy.context.object, mat(f"sehne{i}", "#e3d3a6" if i % 2 else "#d4c08c", 0.7)))
    for a in (0.6, 2.4):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.005, location=(0.11 * math.cos(a), 0.11 * math.sin(a), 0.04), rotation=(math.pi / 2, 0, a)); glatt(setze(bpy.context.object, mat("schlaufe", "#efe2b8", 0.7)))
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.012, depth=0.04, location=(0.1, 0.0, 0.03), rotation=(0, math.pi / 2, 0.3)); setze(bpy.context.object, mat("wicklung", "#7a5432", 0.7))

# ---------- Szene, Export, Rucksack-Bild ----------
def bild_und_export(id_):
    for o in bpy.context.scene.objects: o.select_set(o.type == "MESH")
    bpy.ops.export_scene.gltf(filepath=os.path.join(GLB, id_ + ".glb"), export_format="GLB", use_selection=True, export_apply=True)
    sz = bpy.context.scene; sz.render.engine = "CYCLES"; sz.cycles.samples = 64; sz.cycles.use_denoising = False; sz.cycles.device = "CPU"; sz.render.film_transparent = True
    sz.render.resolution_x = sz.render.resolution_y = 256; sz.render.image_settings.file_format = "PNG"; sz.render.image_settings.color_mode = "RGBA"
    sz.view_settings.view_transform = "Standard"
    mitte = Vector((0, 0, 0)); n = 0
    for o in sz.objects:
        if o.type == "MESH":
            for v in o.bound_box: mitte += o.matrix_world @ Vector(v); n += 1
    mitte /= n
    bpy.ops.object.camera_add(location=mitte + Vector((0.55, -0.75, 0.6))); k = bpy.context.object; k.data.type = "ORTHO"; k.data.ortho_scale = 0.42
    richt = mitte - k.location; k.rotation_euler = richt.to_track_quat("-Z", "Y").to_euler(); sz.camera = k
    bpy.ops.object.light_add(type="SUN", location=(1, -1, 2)); s = bpy.context.object; s.data.energy = 3.2; s.rotation_euler = (math.radians(40), math.radians(15), math.radians(35))
    bpy.ops.object.light_add(type="AREA", location=(-0.8, -0.4, 0.6)); f = bpy.context.object; f.data.energy = 25; f.data.size = 1.2; f.rotation_euler = (math.radians(60), 0, math.radians(-60))
    w = bpy.data.worlds.new("w") if not bpy.data.worlds else bpy.data.worlds[0]; sz.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.6
    pfad = os.path.join(BILD, id_ + ".png"); sz.render.filepath = pfad; bpy.ops.render.render(write_still=True); print("fertig", id_)

STUFEN = [  # id-Teil, Leder (Farbe, Riemen), Stoff (Farbe, Saum), Leuchten
    ("rau", "#7a5232", "#4a301c", "hanf", "#c9b590", "#a89268", None, None),
    ("weich", "#9a6a3c", "#5a3a20", "grob", "#8f826a", "#6e634e", None, None),
    ("gehaertet", "#3f5a34", "#2a3a22", "fein", "#2f6b4c", "#214a34", None, None),
    ("moor", "#26344f", "#18202f", "mond", "#5a2a6e", "#3e1c4c", "#5a90ff", None),
    ("splitter", "#6e2320", "#3e1412", "splitter", "#8a1f2c", "#5e141e", "#ff8a26", None),
    ("ur", "#4b2a5e", "#2c1838", "welten", "#24123a", "#160a26", "#33e0ff", "#ff3cc8"),
]
nur = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
auftraege = [("bogensehne", sehne), ("garn", garn)]
for l_id, lf, ld, s_id, sf, ss, n1, n2 in STUFEN:
    auftraege.append((f"leder_{l_id}", lambda lf=lf, ld=ld, n1=n1, n2=n2: leder(lf, ld, n1, n2)))
    auftraege.append((f"stoff_{s_id}", lambda sf=sf, ss=ss, n1=n1, n2=n2: stoff(sf, ss, n1, n2)))
for id_, bau in auftraege:
    if nur and id_ not in nur: continue
    leeren(); bau(); bild_und_export(id_)
