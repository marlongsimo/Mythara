"""Mythara Fabrik – „Die Karte des Boten“ (Phase 9, erste Quer-Quest): fünf Kartenstücke und die zusammengesetzte Reisekarte.

  python3 fabrik/botenkarte.py <blender-python> <ziel-ordner>

Schritt 1 (python3 + PIL): zeichnet die ganze Karte auf Pergament (1024 × 768): Küste, Strom, Wälder, Berge, die Wegsteine (violette Ringe),
die rote gestrichelte Route des Boten, Windrose, im Osten eine Insel im Splittermeer mit Fragezeichen. Dann reißt sie die Karte in fünf Stücke
(oben drei, unten zwei, gezackte Risskanten, dunkle Ränder) und schreibt in jede Ecke klein die Nummer (I–V).
Schritt 2 (Blender, dieselbe Datei nach „--“): baut daraus die glb-Modelle (Pergament leicht gewellt, Bild als Textur, Ränder durchsichtig):
  <ziel>/kartenstueck_1.glb … kartenstueck_5.glb · <ziel>/reisekarte.glb (ganze Karte, ein Ende eingerollt, rotes Wachssiegel mit Turm der Wacht)
Die Bilder (png) bleiben als <ziel>/_karte/*.png liegen (Quelle der Texturen, nicht für das Spiel).
"""
import math, os, random, subprocess, sys

if "--" not in sys.argv:                                                                   # ---- Schritt 1: Bilder
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
    blender, ziel = sys.argv[1], sys.argv[2]; tmp = os.path.join(ziel, "_karte"); os.makedirs(tmp, exist_ok=True)
    random.seed(11); W, H = 1024, 768
    karte = Image.new("RGB", (W, H), (226, 204, 158)); px = karte.load()
    for y in range(H):                                                                     # Pergament: Flecken und dunklere Ränder
        for x in range(W):
            r = math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2)); f = 1 - 0.18 * max(0, r - 0.55) - 0.04 * math.sin(x * 0.05 + y * 0.03) * math.sin(y * 0.07)
            c = px[x, y]; px[x, y] = tuple(int(v * f) for v in c)
    d = ImageDraw.Draw(karte); TINTE = (70, 46, 28); WASSER = (92, 118, 128)
    def linie(pts, farbe, w): d.line(pts, fill=farbe, width=w, joint="curve")
    def zitter(p0, p1, n=24, a=10):
        return [(p0[0] + (p1[0] - p0[0]) * i / n + random.uniform(-a, a) * (0 < i < n), p0[1] + (p1[1] - p0[1]) * i / n + random.uniform(-a, a) * (0 < i < n)) for i in range(n + 1)]
    kueste = zitter((60, 90), (110, 700), 30, 14); linie(kueste, TINTE, 5)                  # Westküste
    for k in range(4): linie([(x - 18 - 12 * k, y) for x, y in kueste[::3]], WASSER, 2)
    ost = zitter((760, 40), (820, 730), 30, 16); linie(ost, TINTE, 5)                         # Ostküste zum Splittermeer
    for k in range(4): linie([(x + 16 + 12 * k, y) for x, y in ost[::3]], WASSER, 2)
    insel = [(910 + 45 * math.cos(a) + random.uniform(-8, 8), 380 + 30 * math.sin(a) + random.uniform(-6, 6)) for a in [i / 14 * 2 * math.pi for i in range(15)]]
    d.polygon(insel, outline=TINTE, fill=(214, 188, 140)); d.line(insel + insel[:1], fill=TINTE, width=4)
    strom = zitter((420, 40), (520, 730), 26, 18); linie(strom, WASSER, 7); linie(zitter((240, 300), (430, 330), 10, 10), WASSER, 4)   # Strom und Nebenfluss
    for _ in range(26):                                                                    # Wälder (Westen, Waldmark)
        x, y = random.uniform(140, 380), random.uniform(120, 420); d.polygon([(x, y - 16), (x - 10, y + 6), (x + 10, y + 6)], fill=(70, 96, 52), outline=TINTE)
    for _ in range(9):                                                                     # Berge (Tafelberge im Südosten)
        x, y = random.uniform(560, 740), random.uniform(480, 680); d.line([(x - 22, y + 12), (x, y - 16), (x + 22, y + 12)], fill=TINTE, width=4)
    for _ in range(14): x, y = random.uniform(150, 360), random.uniform(500, 690); d.ellipse((x - 7, y - 4, x + 7, y + 4), outline=(90, 110, 70), width=2)   # Moor
    for _ in range(40): x, y = random.uniform(560, 740), random.uniform(120, 420); d.arc((x - 14, y - 6, x + 14, y + 8), 200, 340, fill=(170, 120, 60), width=2)   # Dünen
    WEG = [(200, 200), (330, 470), (480, 260), (600, 140), (640, 560), (700, 330)]               # Wegsteine
    route = [WEG[0], WEG[2], WEG[3], WEG[5], WEG[4]]
    for a, b in zip(route, route[1:]):
        n = int(math.dist(a, b) / 16)
        for i in range(0, n, 2): d.line([(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n), (a[0] + (b[0] - a[0]) * (i + 1) / n, a[1] + (b[1] - a[1]) * (i + 1) / n)], fill=(160, 40, 30), width=4)
    for x, y in WEG: d.ellipse((x - 15, y - 15, x + 15, y + 15), outline=(110, 60, 170), width=5); d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=(140, 90, 210))
    cx, cy = 900, 650                                                                     # Windrose
    for a in range(8):
        w = a * math.pi / 4; r = 52 if a % 2 == 0 else 30
        d.polygon([(cx + r * math.sin(w), cy - r * math.cos(w)), (cx + 8 * math.sin(w + 1.57), cy - 8 * math.cos(w + 1.57)), (cx + 8 * math.sin(w - 1.57), cy - 8 * math.cos(w - 1.57))], fill=TINTE if a % 2 == 0 else (150, 110, 70))
    schrift = None
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"):
        if os.path.exists(f): schrift = ImageFont.truetype(f, 44); klein = ImageFont.truetype(f, 34); break
    d.text((cx, cy - 78), "N", font=klein, fill=TINTE, anchor="mm"); d.text((910, 380), "?", font=schrift, fill=(160, 40, 30), anchor="mm")
    karte = karte.filter(ImageFilter.GaussianBlur(0.8)); karte.save(os.path.join(tmp, "karte.png"))
    # Risskanten: senkrecht oben bei x≈340 und x≈690, unten bei x≈512; waagerecht bei y≈380
    def riss(p0, p1, n=40, a=14): return zitter(p0, p1, n, a)
    mitte = riss((0, 380), (W, 380), 60, 12)
    def y_mitte(x): return min(mitte, key=lambda p: abs(p[0] - x))[1]
    o1, o2, u1 = riss((340, 0), (330, y_mitte(330))), riss((690, 0), (700, y_mitte(700))), riss((512, y_mitte(512)), (520, H))
    def stueck_zwischen(links, rechts, oben):
        if oben: kante = [p for p in mitte if links[-1][0] <= p[0] <= rechts[-1][0]]; return links + kante + rechts[::-1]
        kante = [p for p in mitte if links[0][0] <= p[0] <= rechts[0][0]]; return kante + rechts + links[::-1]
    L0 = [(0, 0), (0, y_mitte(0))]; R0 = [(W, 0), (W, y_mitte(W))]
    stuecke = [stueck_zwischen(L0, o1, True), stueck_zwischen(o1, o2, True), stueck_zwischen(o2, R0, True),
               stueck_zwischen([(0, y_mitte(0)), (0, H)], u1, False), stueck_zwischen(u1, [(W, y_mitte(W)), (W, H)], False)]
    for i, poly in enumerate(stuecke):
        maske = Image.new("L", (W, H), 0); ImageDraw.Draw(maske).polygon(poly, fill=255); maske = maske.filter(ImageFilter.GaussianBlur(1.2))
        rand = maske.filter(ImageFilter.MinFilter(9)); bild = karte.copy().convert("RGBA")
        dunkel = Image.new("RGBA", (W, H), (110, 74, 38, 255)); r_ = Image.eval(Image.eval(rand, lambda v: 255 - v), lambda v: int(v * 0.75))
        bild = Image.composite(dunkel, bild, Image.eval(Image.composite(r_, Image.new("L", (W, H), 0), maske), lambda v: v)); bild.putalpha(maske)
        bb = maske.getbbox(); s = bild.crop(bb); dd = ImageDraw.Draw(s)
        dd.text((40, 40) if i < 3 else (40, s.height - 50), ["I", "II", "III", "IV", "V"][i], font=klein, fill=(120, 30, 24, 255), anchor="lm")
        s.save(os.path.join(tmp, f"stueck_{i + 1}.png")); print("Stück", i + 1, s.size)
    ganz = karte.convert("RGBA"); m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).rectangle((6, 6, W - 6, H - 6), fill=255); ganz.putalpha(m.filter(ImageFilter.GaussianBlur(2)))
    ganz.save(os.path.join(tmp, "ganz.png"))
    subprocess.run([blender, os.path.abspath(__file__), "--", os.path.abspath(ziel)], check=True)
    sys.exit(0)

# ---- Schritt 2: Blender
import bpy
ziel = sys.argv[sys.argv.index("--") + 1]; tmp = os.path.join(ziel, "_karte"); M = 0.4 / 1024             # 1024 px = 0,4 m
def material(bildpfad, name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.85
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(bildpfad); nt.links.new(t.outputs["Color"], b.inputs["Base Color"]); nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    if hasattr(m, "blend_method"): m.blend_method = "CLIP"
    return m
def blatt(bildpfad, name, wellen=0.006, roll=0.0):
    im = bpy.data.images.load(bildpfad); w, h = im.size[0] * M, im.size[1] * M
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=48, y_subdivisions=36, size=1); o = bpy.context.object
    for v in o.data.vertices:
        u, t = v.co.x + 0.5, v.co.y + 0.5; x, y = (u - 0.5) * w, (t - 0.5) * h
        z = wellen * (math.sin(u * 7.0 + 0.6) * 0.6 + math.sin(t * 5.0 + u * 2.0) * 0.4) + wellen
        if roll and x < -w / 2 + roll * 2 * math.pi * 0.012:                               # linkes Ende eingerollt (Spirale)
            s_ = (-w / 2 + roll * 2 * math.pi * 0.012) - x; r = 0.012 * (1 - 0.25 * s_ / (roll * 2 * math.pi * 0.012)); a = s_ / 0.012
            x = -w / 2 + roll * 2 * math.pi * 0.012 - r * math.sin(a); z = r * (1 - math.cos(a)) + wellen
        v.co = (x, y, z)
    o.data.materials.append(material(bildpfad, name)); o.name = name
    s = o.modifiers.new("dick", "SOLIDIFY"); s.thickness = 0.0015; return o
def speichern(datei):
    for o in bpy.context.scene.objects:
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join()
    o = bpy.context.object; lo = min(v.co.z for v in o.data.vertices)
    for v in o.data.vertices: v.co.z -= lo
    bpy.ops.export_scene.gltf(filepath=os.path.join(ziel, datei), export_format="GLB", use_selection=True, export_image_format="WEBP"); print("Karte:", datei)
for i in range(1, 6):
    bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(i); blatt(os.path.join(tmp, f"stueck_{i}.png"), f"kartenstueck_{i}", 0.004 + 0.002 * (i % 2)); speichern(f"kartenstueck_{i}.glb")
bpy.ops.wm.read_factory_settings(use_empty=True)
blatt(os.path.join(tmp, "ganz.png"), "reisekarte", 0.004, roll=1.6)
def mat(n, c, r=0.5, gl=0.0):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*[(x / 255) ** 2.2 for x in c], 1); b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = gl; return m
WACHS = mat("siegelwachs", (150, 24, 20), 0.35); PRAEG = mat("siegel_tief", (105, 14, 12), 0.5)
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.026, depth=0.006, location=(0.13, -0.1, 0.012)); o = bpy.context.object; o.data.materials.append(WACHS)
for v in o.data.vertices: r = math.hypot(v.co.x - 0.13, v.co.y + 0.1); v.co.x += 0.003 * math.sin(math.atan2(v.co.y + 0.1, v.co.x - 0.13) * 5) * (r > 0.02)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13, -0.1, 0.0155)); t = bpy.context.object; t.scale = (0.008, 0.008, 0.002); t.data.materials.append(PRAEG)      # Turm
bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13, -0.093, 0.0155)); t = bpy.context.object; t.scale = (0.012, 0.003, 0.002); t.data.materials.append(PRAEG)    # Zinnen
for k in (0, 1): bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13, -0.11 - 0.004 * k, 0.0155)); t = bpy.context.object; t.scale = (0.014, 0.0012, 0.002); t.data.materials.append(PRAEG)   # Wellen
for sx in (-1, 1):                                                                         # zwei Bänder unter dem Siegel
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.13 + sx * 0.008, -0.13, 0.009), rotation=(0, 0, sx * 0.3)); t = bpy.context.object; t.scale = (0.008, 0.045, 0.0015); t.data.materials.append(WACHS)
speichern("reisekarte.glb")
