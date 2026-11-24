"""Mythara Fabrik – einen Meshy-Baum als 3D-Spieldatei für die offene Welt ausgeben (Blender).
  python3 fabrik/baum_export.py -- <meshy.blend> <ziel.glb> <höhe in m> [textur=1024] [luecken=1]
luecken=1: graue Füllflächen und schwarze Lücken der Textur mit den Farben der Nachbarn auffüllen (sonst sieht man an den Blatträndern graue Flecken)
stumpf=1.0: nur den Stumpf ausgeben – in dieser Höhe (m, nach dem Skalieren) abgeschnitten, Schnittfläche geschlossen (helles Holz)
blau=grau: blau leuchtende Stellen der Textur dunkelgrau färben (der Stumpf leuchtet und pulsiert nicht mehr)
Stammfuß in den Ursprung, auf die gewünschte Höhe skaliert, Textur verkleinert (WebP). Das Spiel zeichnet den Baum live mit three.js
(echt3d/darsteller.ts → BaumBild): eigene Drehung, Kronenfarbe und Wind je Standort."""
import bpy, sys, os
from mathutils import Vector
a = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel, hoehe = a[0], a[1], float(a[2]); opt = dict(x.split("=", 1) for x in a[3:] if "=" in x); T = int(opt.get("textur", 1024))
bpy.context.preferences.filepaths.use_scripts_auto_execute = False; bpy.ops.wm.open_mainfile(filepath=quelle, load_ui=False)
for o in list(bpy.data.objects):
    if o.type != "MESH": bpy.data.objects.remove(o)
o = [x for x in bpy.data.objects if x.type == "MESH"][0]; o.rotation_mode = "XYZ"
bpy.context.view_layer.objects.active = o; o.select_set(True); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
ps = [v.co for v in o.data.vertices]; lo = Vector([min(p[i] for p in ps) for i in range(3)]); hi = Vector([max(p[i] for p in ps) for i in range(3)])
# Stammfuß: Mitte der untersten 5 % der Punkte
unten = [p for p in ps if p.z < lo.z + 0.05 * (hi.z - lo.z)]; fuss = Vector((sum(p.x for p in unten) / len(unten), sum(p.y for p in unten) / len(unten), lo.z))
f = hoehe / (hi.z - lo.z)
for v in o.data.vertices: v.co = (v.co - fuss) * f
import numpy as np
if opt.get("stumpf"):                                                                # abschneiden: alles über der Höhe weg, das Loch schließen
    import bmesh
    hs = float(opt["stumpf"]); bm = bmesh.new(); bm.from_mesh(o.data)
    geo = bm.verts[:] + bm.edges[:] + bm.faces[:]
    r = bmesh.ops.bisect_plane(bm, geom=geo, plane_co=(0, 0, hs), plane_no=(0, 0, 1), clear_outer=True)
    rand = [e for e in r["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    fl = bmesh.ops.holes_fill(bm, edges=rand, sides=0)["faces"]
    offen = [e for e in rand if e.is_valid and e.is_boundary]                       # was nicht geschlossen wurde (nicht ganz geschlossene Ränder): mit Dreiecken füllen
    if offen: fl += [f_ for f_ in bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=offen)["geom"] if isinstance(f_, bmesh.types.BMFace)]
    lose = [v for v in bm.verts if not v.link_faces]; bmesh.ops.delete(bm, geom=lose, context="VERTS")
    gesehen, weg = set(), []                                                         # lose Stücke ohne Bodenkontakt (abgeschnittene hängende Zweige) entfernen
    for v in bm.verts:
        if v in gesehen: continue
        stueck, rand_ = [], [v]
        while rand_:
            x = rand_.pop()
            if x in gesehen: continue
            gesehen.add(x); stueck.append(x); rand_.extend(e.other_vert(x) for e in x.link_edges)
        if min(x.co.z for x in stueck) > 0.15: weg += stueck
    if weg: bmesh.ops.delete(bm, geom=weg, context="VERTS"); print("Stumpf: lose Stücke entfernt:", len(weg), "Punkte")
    holz = bpy.data.materials.new("schnitt"); holz.use_nodes = True; bsdf = holz.node_tree.nodes.get("Principled BSDF"); bsdf.inputs["Base Color"].default_value = (0.2, 0.1, 0.035, 1); bsdf.inputs["Roughness"].default_value = 0.85
    o.data.materials.append(holz); k = len(o.data.materials) - 1
    for f_ in fl:
        if f_.is_valid: f_.material_index = k
    bm.to_mesh(o.data); bm.free(); print("Stumpf: bei", hs, "m abgeschnitten,", len(fl), "Schnittflächen")
for im in bpy.data.images:
    if opt.get("blau") == "grau":                                                    # blaue Adern → dunkelgrau, kein Leuchten (der Spiel-Shader pulsiert nur Blau)
        w, h = im.size; a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); rgb = a[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
        hue = np.where(mx == rgb[..., 0], ((rgb[..., 1] - rgb[..., 2]) / d) % 6, np.where(mx == rgb[..., 1], (rgb[..., 2] - rgb[..., 0]) / d + 2, (rgb[..., 0] - rgb[..., 1]) / d + 4)) * 60
        b = (np.clip((d / (mx + 1e-6) - 0.12) / 0.12, 0, 1) * np.clip(1 - np.abs(hue - 212) / 60, 0, 1)) ** 0.35
        grau = (0.05 + 0.1 * mx)[..., None] * np.ones(3); a[..., :3] = rgb * (1 - b[..., None]) + grau * b[..., None]
        im.pixels[:] = a.ravel(); im.update(); print("Textur: blau → dunkelgrau", int((b > 0.5).sum()), "Punkte")
    if opt.get("luecken") == "1":                                                  # zuerst in voller Größe auffüllen, dann verkleinern (sonst ziehen die Lücken in die Ränder ein)
        w, h = im.size; a = np.array(im.pixels[:], np.float32).reshape(h, w, 4); rgb = a[..., :3]; mx = rgb.max(-1); s = (mx - rgb.min(-1)) / (mx + 1e-6)
        gut = ~(((s < 0.35) & (mx > 0.2)) | (mx < 0.08)); n0 = int((~gut).sum())   # graue und graugrüne Füllflächen (Blätter ~0,85–1, Rinde ~0,6–0,7) und schwarze Lücken
        for _ in range(64):                                                          # von den guten Punkten aus nach außen wachsen lassen
            if gut.all(): break
            summe = np.zeros_like(rgb); zahl = np.zeros((h, w), np.float32)
            for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)):
                g = np.roll(np.roll(gut, dy, 0), dx, 1); summe += np.roll(np.roll(rgb * gut[..., None], dy, 0), dx, 1); zahl += g
            neu = (~gut) & (zahl > 0); rgb[neu] = summe[neu] / zahl[neu][:, None]; gut = gut | neu
        a[..., :3] = rgb; im.pixels[:] = a.ravel(); im.update(); print("Textur: aufgefüllt", n0, "Punkte")
    if im.size[0] > T: im.scale(T, T)
    if im.packed_file or opt.get("luecken") == "1" or opt.get("blau"): im.pack()                     # die geänderten Bildpunkte mitnehmen (sonst nimmt der Export die gepackte Originaldatei)
o.name = "baum"; bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_image_format="WEBP", export_animations=False)
print("Baum:", ziel, "Höhe", hoehe, "m · Breite", round((hi.x - lo.x) * f, 2), "m · Punkte", len(ps), "· Größe", os.path.getsize(ziel) // 1024, "KB")
