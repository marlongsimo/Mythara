"""Mythara Fabrik – eine modulare Figur in acht Richtungen rendern: je Ebene (Körper, jedes Ausrüstungsteil) und je Bewegung ein Bildblatt.

  python3 fabrik/rendern.py <figur.blend> <export-ordner> <asset-id> [nur=ebene1,ebene2]

Blatt: Zeilen = Richtungen (O, SO, S, SW, W, NW, N, NO – 0 = Osten, im Uhrzeigersinn am Bildschirm, y nach unten), Spalten = Bilder der Bewegung.
Nichts ist gespiegelt: jede Richtung wird eigens gerendert. Die Figur dreht sich, Kamera und Licht bleiben stehen; der Fußpunkt liegt in jedem Bild auf demselben Bildpunkt.

Ebenen, damit Ausrüstung im Spiel frei kombiniert werden kann, ohne für jede Kombination neu zu rendern:
  koerper                  der Körper allein
  <rüstungsteil>           nur das Teil; der Körper und die Räume der übrigen Rüstungsplätze schneiden aus, was sie verdecken.
                           Dadurch ist die Reihenfolge der Rüstungsebenen im Spiel gleichgültig.
  <waffe/schild>.hinten    das Teil ganz – wird UNTER den Körper gelegt
  <waffe/schild>.vorn      nur, was vor Körper und Rüstung liegt – wird ÜBER alles gelegt
Welche Waffe vor der anderen liegt, steht je Bild in den Metadaten (tiefe: kleiner = näher an der Kamera).
Fertige Blätter werden übersprungen (Lauf lässt sich fortsetzen); mit nur=… werden einzelne Ebenen neu gerendert.
"""
import json, math, os, sys, time
import numpy as np
import bpy
from mathutils import Vector
from PIL import Image

quelle, ziel, kennung = sys.argv[1], sys.argv[2], sys.argv[3]; NUR = set(sys.argv[4].split(",")) if len(sys.argv) > 4 else None
RICHTUNGEN = ["o", "so", "s", "sw", "w", "nw", "n", "no"]; FELD = 256; PX_JE_M = 86.0; NEIGUNG = 35.0; FUSS = (0.5, 0.70); BREITE_M = FELD / PX_JE_M     # großes Feld: eine erhobene Waffe darf nicht abgeschnitten werden

bpy.ops.wm.open_mainfile(filepath=quelle); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; os.makedirs(ziel, exist_ok=True)
sc.render.engine = "CYCLES"; sc.cycles.samples = 12; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False; sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = FELD; sc.render.use_persistent_data = False
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
n = math.radians(NEIGUNG); h = (FUSS[1] - 0.5) * BREITE_M / math.cos(n)
cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = BREITE_M
cam.location = (0, -10 * math.cos(n), h + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, 0); sc.camera = cam; blick = Vector((0, math.cos(n), -math.sin(n)))
for name, rot, staerke in [("haupt", (50, 0, -40), 5.0), ("fuell", (65, 0, 60), 1.6), ("rand", (-40, 0, 170), 1.2)]:
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 1.3

teile = [o for o in bpy.data.objects if o.get("ebene")]; koerper = next(o for o in teile if o["art"] == "koerper"); huellen = [o for o in teile if o["art"] == "huelle"]; starr = [o for o in teile if o["art"] == "starr"]
volumen = [o for o in huellen if o.get("volumen")]
# Durchgänge: (Dateiname der Ebene, sichtbares Teil, Teile, die nur ausschneiden)
laeufe = [("koerper", koerper, [])] + [(o["ebene"], o, [koerper] + [v for v in volumen if v["platz"] != o["platz"]]) for o in huellen]
for o in starr: laeufe += [(o["ebene"] + ".hinten", o, []), (o["ebene"] + ".vorn", o, [koerper] + volumen)]
aktionen = [a for a in bpy.data.actions if a.get("bilder")]

meta = {"id": kennung, "feld": FELD, "richtungen": RICHTUNGEN, "winkel0": "osten", "drehsinn": "im Uhrzeigersinn am Bildschirm (y nach unten)", "zeile": "round(winkel / (pi/4)) mod 8",
        "fuss": list(FUSS), "mass": [FUSS[0], FUSS[1], round(1.8 * math.cos(n) * PX_JE_M / FELD, 3)], "kamera": {"neigung": NEIGUNG, "px_je_m": PX_JE_M},
        "animationen": {a.name: dict({"bilder": int(a["bilder"]), "rate": int(a["rate"]), "schleife": bool(a["schleife"])}, **json.loads(a["mehr"])) for a in aktionen},
        "ebenen": {"koerper": {"art": "koerper"}}, "plaetze": {}, "reihenfolge": "hinten-Ebenen der Waffen (fernste zuerst) · koerper · Rüstung (beliebig) · vorn-Ebenen der Waffen (fernste zuerst)", "tiefe": {}}
for o in huellen + starr: meta["ebenen"][o["ebene"]] = {"art": o["art"], "platz": o["platz"], **({"knochen": o.parent_bone} if o["art"] == "starr" else {})}; meta["plaetze"].setdefault(o["platz"], []).append(o["ebene"])
# Tiefe der Waffen je Bewegung, Richtung und Bild (in cm entlang der Blickrichtung)
for a in aktionen:
    arm.animation_data.action = a
    for o in starr: meta["tiefe"].setdefault(o["ebene"], {})[a.name] = []
    for r in range(8):
        arm.rotation_euler = (0, 0, math.radians(90 - 45 * r)); zeile = {o["ebene"]: [] for o in starr}
        for b in range(int(a["bilder"])):
            sc.frame_set(b + 1); bpy.context.view_layer.update()
            for o in starr: e = [o.matrix_world @ Vector(c) for c in o.bound_box]; zeile[o["ebene"]].append(round(sum((v.dot(blick) for v in e)) / 8 * 100))
        for o in starr: meta["tiefe"][o["ebene"]][a.name].append(zeile[o["ebene"]])
json.dump(meta, open(os.path.join(ziel, kennung + ".json"), "w"), ensure_ascii=False, indent=1)

tmp = os.path.join(ziel, ".bild.png"); start = time.time(); gerendert = 0
for name, sichtbar, schneider in laeufe:
    if NUR and name not in NUR and name.rsplit(".", 1)[0] not in NUR: continue
    for o in teile: o.hide_render = not (o is sichtbar or o in schneider); o.is_holdout = o in schneider
    for a in aktionen:
        datei = os.path.join(ziel, f"{name}.{a.name}.webp")
        if os.path.exists(datei) and not NUR: continue
        bilder = int(a["bilder"]); arm.animation_data.action = a; blatt = Image.new("RGBA", (FELD * bilder, FELD * 8), (0, 0, 0, 0))
        for r in range(8):
            arm.rotation_euler = (0, 0, math.radians(90 - 45 * r))
            for b in range(bilder): sc.frame_set(b + 1); sc.render.filepath = tmp; bpy.ops.render.render(write_still=True); blatt.paste(Image.open(tmp).convert("RGBA"), (b * FELD, r * FELD)); gerendert += 1
        px = np.asarray(blatt).copy(); px[px[..., 3] < 8] = 0; Image.fromarray(px, "RGBA").save(datei, lossless=True, method=4)
        print(f"Blatt: {name}.{a.name} · {gerendert} Bilder in {round(time.time() - start)} s", flush=True)
if os.path.exists(tmp): os.remove(tmp)
print("fertig:", ziel)
