"""Mythara Fabrik – eine fertig geriggte Figur (figur.blend) als eine GLB-Datei für Echtzeit-3D im Browser ausgeben:
Skelett, Körper, alle Teilnetze (Kleidung, Haare, Bärte) als skinned Meshes, Waffen und Schilde an ihren Knochen, alle Bewegungen als Animationen.
Jedes Teil behält als Namen seine Ebenen-ID (z. B. kopf.haar.militaer) – die Szene blendet Teile ein und aus.

  python3 fabrik/export3d.py <figur.blend> <ziel.glb> [flaechen=60000] [textur=1024] [webp] [auslagern=ruestung.,kopf.helm.]
"""
import json, os, sys
import bpy
quelle, ziel = sys.argv[1], sys.argv[2]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(quelle))
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
teile = [o for o in bpy.data.objects if o.get("ebene") and o.type == "MESH"]
for o in bpy.data.objects:
    if o.type == "MESH" and o not in teile: o.hide_set(False)
for o in teile:
    o.name = o["ebene"]; o.hide_render = False; o.hide_viewport = False; o.is_holdout = False
    # sehr feine Teilnetze für Echtzeit verkleinern (Haar, Bart, Sets)
    n = len(o.data.polygons); grenze = int(opt.get("flaechen", 60000)) if o["art"] != "koerper" else 10 ** 9
    if n > grenze:
        bpy.context.view_layer.objects.active = o; m = o.modifiers.new("weniger", "DECIMATE"); m.ratio = grenze / n
        bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.ops.object.modifier_move_to_index(modifier="weniger", index=0); bpy.ops.object.modifier_apply(modifier="weniger")
T = int(opt.get("textur", 0))                                                                       # Texturen verkleinern (z. B. 1024 fürs Handy)
if T:
    for img in bpy.data.images:
        if img.size[0] > T: img.scale(T, max(1, int(img.size[1] * T / img.size[0]))); img.pack()
info = {o["ebene"]: {"art": o["art"], "platz": o.get("platz"), "bewegungen": json.loads(o.get("bewegungen", "[]") or "[]")} for o in teile}
aktionen = {a.name: {"bilder": int(a["bilder"]), "rate": int(a["rate"]), "schleife": bool(a["schleife"])} for a in bpy.data.actions if a.get("bilder")}
for a in bpy.data.actions:
    if a.get("bilder"): a.use_fake_user = True
arm.animation_data.action = bpy.data.actions.get("ruhe")
# auslagern=ruestung.,kopf.helm. – diese Teile (Präfixe) nicht in die Grundfigur, sondern je als eigene Datei <ziel>.teile/<id>.glb:
# nur Skelett und dieses eine Teil, ohne Bewegungen. Andere Dateien im Ordner (Seltenheitsstufen aus seltenheit.py) bleiben stehen. Das Spiel lädt sie erst beim Anlegen und hängt sie an das Skelett der Figur (echt3d/darsteller.ts).
AUSLAGERN = tuple(x for x in opt.get("auslagern", "").split(",") if x); ausgelagert = {}
if AUSLAGERN:
    ordner = os.path.splitext(os.path.abspath(ziel))[0] + ".teile"; os.makedirs(ordner, exist_ok=True)
    for o in [o for o in teile if o["ebene"].startswith(AUSLAGERN)]:
        bpy.ops.object.select_all(action="DESELECT"); arm.select_set(True); o.select_set(True); d_ = os.path.join(ordner, o["ebene"] + ".glb")
        bpy.ops.export_scene.gltf(filepath=d_, export_format="GLB", use_selection=True, export_animations=False, export_skins=True, export_yup=True, export_image_format="WEBP" if "webp" in sys.argv else "AUTO")
        ausgelagert[o["ebene"]] = os.path.basename(ordner) + "/" + o["ebene"] + ".glb"; info[o["ebene"]]["datei"] = ausgelagert[o["ebene"]]
        print(f"  ausgelagert: {o['ebene']} · {os.path.getsize(d_) / 1e6:.2f} MB")
    teile = [o for o in teile if o["ebene"] not in ausgelagert]
bpy.ops.object.select_all(action="DESELECT"); arm.select_set(True)
for o in teile: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_animations=True, export_animation_mode="ACTIONS",
                          export_force_sampling=True, export_frame_range=False, export_skins=True, export_yup=True, export_image_format="WEBP" if "webp" in sys.argv else "AUTO")
json.dump({"teile": info, "aktionen": aktionen}, open(os.path.splitext(os.path.abspath(ziel))[0] + ".json", "w"), ensure_ascii=False, indent=1)
print(f"export3d: {len(teile)} Teile{f' (+{len(ausgelagert)} ausgelagert)' if ausgelagert else ''}, {len(aktionen)} Bewegungen · {os.path.getsize(ziel) / 1e6:.1f} MB · {ziel}")
