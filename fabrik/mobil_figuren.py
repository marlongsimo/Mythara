"""Mythara Fabrik – einfache Fassungen der 3D-Figuren fürs Handy (#111): <name>.mobil.glb neben jeder Spieldatei, die Originale bleiben unverändert.

  <blender-python> fabrik/mobil_figuren.py -- <quelle.glb> [<quelle.glb> …] [ziel=3500] [textur=512] [--zaehlen]

Je Netz ein Budget nach seinem Namen (Ebene) – es ist immer nur eine Frisur, ein Bart, eine Waffe … zugleich sichtbar:
  koerper ziel (Standard 3500) · Haar 700 · Bart 400 · Waffe/Schild/Werkzeug 500 · Kleidung, Rüstung und alles andere 800
→ eine sichtbare Figur hat höchstens etwa 5.600 Dreiecke. Netze unter ihrem Budget bleiben, wie sie sind; verkleinert wird mit „Decimate (Collapse)“. Skelett, Skinning-Gewichte, Animationen, Namen und Extras (ebene, art, platz …)
bleiben – Rundreise durch den glTF-Import/Export wie fabrik/geist.py. Texturen werden auf höchstens textur Pixel verkleinert (webp).
Mit --zaehlen: nur die Dreiecke je Datei ausgeben (vorher), nichts schreiben.
"""
import os, sys
import bpy

a_ = sys.argv[sys.argv.index("--") + 1:]; dateien = [x for x in a_ if x.endswith(".glb")]; opt = dict(x.split("=", 1) for x in a_ if "=" in x)
ZIEL, TEX, NUR_ZAEHLEN = int(opt.get("ziel", 3500)), int(opt.get("textur", 512)), "--zaehlen" in a_
def budget(n):
    if n.startswith("koerper") or n.startswith("geometry"): return ZIEL
    if "haar" in n: return 700
    if "bart" in n: return 400
    if n.startswith(("waffe.", "schild.", "werkzeug.")): return 500
    return 800
def dreiecke(o): return sum(len(p.vertices) - 2 for p in o.data.polygons)
for q in dateien:
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(q), merge_vertices=True)   # Nähte zusammen: sonst reißt das Vereinfachen an den UV-Kanten auf
    netze = [o for o in bpy.data.objects if o.type == "MESH" and not o.name.startswith("Icosphere")]
    vor = sum(dreiecke(o) for o in netze)
    if NUR_ZAEHLEN: print(f"ZAEHLEN\t{q}\t{vor}"); continue
    if not netze: print(f"OHNE\t{q}"); continue                                                    # reine Bewegungsdateien (werk_, angeln_ …) brauchen keine Fassung
    for o in netze:
        t = dreiecke(o); B = budget(o.name)
        if t <= B: continue
        r = B / t
        bpy.context.view_layer.objects.active = o; m = o.modifiers.new("vereinfachen", "DECIMATE"); m.ratio = min(1.0, r); m.use_collapse_triangulate = True
        bpy.ops.object.modifier_move_to_index(modifier=m.name, index=0); bpy.ops.object.modifier_apply(modifier=m.name)
    for im in bpy.data.images:
        w, h = im.size
        if w > TEX or h > TEX: f = TEX / max(w, h); im.scale(max(1, round(w * f)), max(1, round(h * f)))
    nach = sum(dreiecke(o) for o in netze)
    ziel = q[:-4] + ".mobil.glb"
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=True,
                              export_extras=True, export_image_format="WEBP", export_image_quality=80)
    print(f"MOBIL\t{q}\t{vor}\t{nach}\t{os.path.getsize(q)}\t{os.path.getsize(ziel)}")
