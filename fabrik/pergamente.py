"""Mythara Fabrik – Schriftstücke als kleine 3D-Gegenstände (für Rucksackbilder und Beute): Pergament, Hinweis, Rezeptheft, Tempelabschrift.

  <blender-python> fabrik/pergamente.py -- <ziel-ordner> [arten=pergament,hinweispergament,rezeptheft,tempelabschrift]

Die Bilder (Pergament mit Flecken, Schrift aus Kringeln, Siegel, Runen) entstehen hier mit PIL und liegen als Textur im glb.
  pergament         leeres Pergament, ein Ende eingerollt
  hinweispergament  beschriebenes Pergament (Zeilen, ein Pfeil, rotes Siegel), ein Ende eingerollt
  rezeptheft        geschlossenes Heft: Ledereinband mit Goldrahmen und Kessel-Zeichen, ein Lesezeichen, Seitenschnitt
  tempelabschrift   flaches Blatt mit Runenzeilen und einem Tempelgiebel, Ecken leicht gewellt, blaue Tinte
Ausgabe: <ziel>/<art>.glb (Maßstab 1 = 1 m, Ursprung Mitte unten). Danach Bild mit fabrik/symbol.py.
"""
import math, os, random, sys
import numpy as np
import bpy
from PIL import Image, ImageDraw, ImageFilter

a_ = sys.argv[sys.argv.index("--") + 1:]; ZIEL = a_[0]; opt = dict(x.split("=", 1) for x in a_[1:] if "=" in x)
ARTEN = opt.get("arten", "pergament,hinweispergament,rezeptheft,tempelabschrift").split(","); os.makedirs(ZIEL, exist_ok=True)
TMP = os.path.join(ZIEL, "_tex"); os.makedirs(TMP, exist_ok=True)

def papier(w, h, seed, farbe=(226, 204, 158)):
    rng = np.random.default_rng(seed); y, x = np.mgrid[0:h, 0:w]
    rand = np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y)) / (0.12 * min(w, h)); dunkel = 0.78 + 0.22 * np.clip(rand, 0, 1)
    fl = np.array(Image.fromarray((rng.random((h // 16 + 1, w // 16 + 1)) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255
    a = np.stack([np.array(farbe) * (dunkel * (0.9 + 0.12 * fl))[..., None]], 0)[0]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def zeilen(d, x0, y0, x1, y1, n, farbe, rng, dicke=3):
    for i in range(n):
        y = y0 + (y1 - y0) * i / max(1, n - 1); x = x0; ende = x1 - rng.integers(0, (x1 - x0) // 3)
        while x < ende:
            l = rng.integers(14, 44); pts = [(x + k, y + 3 * math.sin(k * 0.7 + rng.random() * 6)) for k in range(0, l, 3)]
            d.line(pts, fill=farbe, width=dicke); x += l + rng.integers(8, 16)
def siegel(d, cx, cy, r, farbe=(150, 30, 28)):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=farbe); d.ellipse((cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6), outline=(110, 18, 16), width=4)
def textur(art):
    rng = np.random.default_rng(hash(art) % 1000)
    if art == "pergament": im = papier(512, 384, 1)
    elif art == "hinweispergament":
        im = papier(512, 384, 2); d = ImageDraw.Draw(im); zeilen(d, 60, 70, 450, 240, 6, (70, 48, 30), rng)
        d.line([(70, 300), (230, 300)], fill=(150, 30, 28), width=5); d.polygon([(230, 286), (260, 300), (230, 314)], fill=(150, 30, 28)); siegel(d, 330, 300, 30)
    elif art == "tempelabschrift":
        im = papier(512, 384, 3, (222, 212, 180)); d = ImageDraw.Draw(im); B = (40, 70, 130)
        d.polygon([(256, 40), (340, 90), (172, 90)], outline=B, width=4); d.line([(180, 90), (180, 150)], fill=B, width=4); d.line([(332, 90), (332, 150)], fill=B, width=4)
        for x in (215, 256, 297): d.line([(x, 96), (x, 150)], fill=B, width=3)
        d.line([(165, 152), (347, 152)], fill=B, width=4)
        for i in range(5):                                                              # Runenzeilen
            y = 190 + i * 36; x = 60
            while x < 450:
                k = rng.integers(0, 4); s = 12
                if k == 0: d.line([(x, y - s), (x, y + s)], fill=B, width=3); d.line([(x, y), (x + s, y - s)], fill=B, width=3)
                elif k == 1: d.line([(x, y + s), (x + s // 2, y - s), (x + s, y + s)], fill=B, width=3)
                elif k == 2: d.line([(x, y - s), (x + s, y + s)], fill=B, width=3); d.line([(x + s, y - s), (x, y + s)], fill=B, width=3)
                else: d.ellipse((x, y - s // 2, x + s, y + s // 2), outline=B, width=3)
                x += 22 + rng.integers(0, 10)
    elif art == "rezeptheft":                                                           # Einband: braunes Leder, Goldrahmen, Kessel
        im = Image.new("RGB", (512, 384), (110, 66, 38)); a = np.array(im).astype(float); a *= 0.9 + 0.15 * np.random.default_rng(4).random(a.shape[:2])[..., None]
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)); d = ImageDraw.Draw(im); G = (214, 172, 80)
        d.rectangle((30, 30, 482, 354), outline=G, width=6); d.rectangle((48, 48, 464, 336), outline=G, width=2)
        d.ellipse((196, 150, 316, 250), outline=G, width=8); d.line([(186, 160), (326, 160)], fill=G, width=8)
        for x in (220, 256, 292): d.arc((x - 14, 96, x + 14, 146), 200, 340, fill=G, width=4)   # Dampf
        d.line([(210, 250), (200, 280)], fill=G, width=6); d.line([(302, 250), (312, 280)], fill=G, width=6)
    p = os.path.join(TMP, art + ".png"); im.save(p); return p
def material(name, bild, rau=0.85):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = rau
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(bild); nt.links.new(t.outputs["Color"], b.inputs["Base Color"]); return m
def farbe(name, c, rau=0.7, metall=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in c], 1); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = metall; return m
def blatt(w, h, mat, rolle=0.0, welle=0.004, ecken=0.0, nx=40, ny=30):
    """Blatt in der x–y-Ebene (w × h m), UV über das ganze Blatt; rolle = Halbmesser der Rolle am Ende +x (0 = keine), ecken = Hochbiegen der Ecken"""
    vs, uv = [], []
    flach = w - (math.pi * 1.4 * rolle if rolle else 0)
    for j in range(ny + 1):
        for i in range(nx + 1):
            u, v = i / nx, j / ny; s = u * w; y = (v - 0.5) * h; z = welle * math.sin(u * 9 + v * 3) * math.sin(v * math.pi)
            if rolle and s > flach:
                a = (s - flach) / rolle; x = flach + rolle * math.sin(a) - w / 2; z += rolle * (1 - math.cos(a))
            else: x = s - w / 2
            if ecken: z += ecken * (max(0, abs(u - 0.5) * 2 - 0.6) * max(0, abs(v - 0.5) * 2 - 0.6)) * 6
            vs.append((x, y, z)); uv.append((u, v))
    fs = [(j * (nx + 1) + i, j * (nx + 1) + i + 1, (j + 1) * (nx + 1) + i + 1, (j + 1) * (nx + 1) + i) for j in range(ny) for i in range(nx)]
    me = bpy.data.meshes.new("blatt"); me.from_pydata(vs, [], fs); me.update(); L = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        for li in p.loop_indices: L.data[li].uv = uv[me.loops[li].vertex_index]
    o = bpy.data.objects.new("blatt", me); bpy.context.collection.objects.link(o); o.data.materials.append(mat)
    sol = o.modifiers.new("dicke", "SOLIDIFY"); sol.thickness = 0.0015
    for p in me.polygons: p.use_smooth = True
    return o
def quader(ort, gr, m, fase=0.08):
    bpy.ops.mesh.primitive_cube_add(size=1, location=ort); o = bpy.context.object; o.scale = gr; o.data.materials.append(m)
    if fase: b = o.modifiers.new("f", "BEVEL"); b.width = min(gr) * fase; b.segments = 2
    return o
for art in ARTEN:
    bpy.ops.wm.read_factory_settings(use_empty=True); tex = textur(art)
    if art in ("pergament", "hinweispergament"): blatt(0.32, 0.24, material(art, tex), rolle=0.02, welle=0.003)
    elif art == "tempelabschrift": blatt(0.32, 0.24, material(art, tex), welle=0.002, ecken=0.012)
    elif art == "rezeptheft":
        ein = material("einband", tex, 0.6); seiten = farbe("seiten", (232, 218, 186), 0.9)
        quader((0, 0, 0.004), (0.22, 0.16, 0.008), ein, 0.05); quader((0, 0, 0.026), (0.22, 0.16, 0.008), ein, 0.05)
        quader((-0.002, 0, 0.015), (0.212, 0.152, 0.016), seiten, 0.02); quader((-0.111, 0, 0.015), (0.01, 0.164, 0.03), farbe("ruecken", (84, 48, 28), 0.6), 0.2)
        quader((0.04, 0.0, 0.015), (0.012, 0.2, 0.002), farbe("lesezeichen", (150, 32, 30), 0.6), 0)   # Lesezeichen hängt hinten heraus
        deck = [o for o in bpy.data.objects if o.location.z > 0.02][0]                       # UV des oberen Deckels: ganze Textur auf die Oberseite
        me = deck.data; L = me.uv_layers.new(name="UVMap") if not me.uv_layers else me.uv_layers[0]
        for poly in me.polygons:
            for li in poly.loop_indices: co = me.vertices[me.loops[li].vertex_index].co; L.data[li].uv = (min(1, max(0, co.x + 0.5)), min(1, max(0, co.y + 0.5)))
    for o in list(bpy.context.scene.objects):
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    for o in bpy.context.scene.objects: o.select_set(True)
    bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices)
    for v in o.data.vertices: v.co.z -= lo
    z = os.path.join(ZIEL, art + ".glb"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(z), export_format="GLB", use_selection=True, export_image_format="WEBP", export_image_quality=85)
    print("Schrift:", art, os.path.getsize(z) // 1024, "KB")
