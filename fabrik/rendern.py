"""Mythara Fabrik – eine modulare Figur in acht Richtungen rendern: je Ebene (Körper, jedes Ausrüstungsteil) und je Bewegung ein Bildblatt.

  python3 fabrik/rendern.py <figur.blend> <export-ordner> <asset-id> [ebene1,ebene2] [bewegungen=a,b]

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

quelle, ziel, kennung = sys.argv[1], sys.argv[2], sys.argv[3]; mehr = sys.argv[4:]
NUR = next((set(m.split(",")) for m in mehr if "=" not in m), None); BEW = next((set(m.split("=", 1)[1].split(",")) for m in mehr if m.startswith("bewegungen=")), None)   # bewegungen=a,b: nur diese rendern
RICHTUNGEN = ["o", "so", "s", "sw", "w", "nw", "n", "no"]; PX_JE_M = 86.0; NEIGUNG = 35.0; RAND = 8     # Feldgröße und Fußpunkt werden unten aus der Bewegung berechnet: nichts darf abgeschnitten werden

bpy.ops.wm.open_mainfile(filepath=quelle); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; os.makedirs(ziel, exist_ok=True)
n = math.radians(NEIGUNG); oben_v = Vector((0, math.sin(n), math.cos(n)))                                                     # am Bildschirm „oben“, gesehen von der Kamera
def ausdehnung():
    """größte Ausdehnung aller Teile über alle Bewegungen, Richtungen und Bilder: (seitlich, über dem Fußpunkt, unter dem Fußpunkt) in Metern"""
    s_, o_, u_ = 0.0, 0.0, 0.0; dg = bpy.context.evaluated_depsgraph_get(); ob_ = [o for o in bpy.data.objects if o.get("ebene")]
    for a in [x for x in bpy.data.actions if x.get("bilder")]:
        arm.animation_data.action = a
        for r in range(8):
            arm.rotation_euler = (0, 0, math.radians(90 - 45 * r))
            for b in range(int(a["bilder"])):
                sc.frame_set(b + 1); bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
                for o in ob_:
                    e = o.evaluated_get(dg); M = e.matrix_world
                    for c in e.bound_box: v = M @ Vector(c); s_ = max(s_, abs(v.x)); o_ = max(o_, v.dot(oben_v)); u_ = max(u_, -v.dot(oben_v))
    return s_, o_, u_
seite_m, ueber_m, unter_m = ausdehnung(); ueber, unter, seite = ueber_m * PX_JE_M + RAND, unter_m * PX_JE_M + RAND, seite_m * PX_JE_M + RAND
FELD = int(math.ceil(max(2 * seite, ueber + unter) / 32) * 32); FUSS = (0.5, round(1 - (unter + (FELD - ueber - unter) / 2) / FELD, 4)); BREITE_M = FELD / PX_JE_M
alt = os.path.join(ziel, kennung + ".json")                                                         # schon gerenderte Blätter weiterverwenden: nur, wenn alles ins bisherige Feld passt
if os.path.exists(alt):
    m0 = json.load(open(alt)); F0, f0 = m0["feld"], m0["fuss"][1]
    if ueber <= f0 * F0 and unter <= (1 - f0) * F0 and seite <= F0 / 2 and (F0, f0) != (FELD, FUSS[1]): FELD, FUSS = F0, tuple(m0["fuss"]); BREITE_M = FELD / PX_JE_M; print("bisheriges Feld passt weiter – es bleibt", flush=True)
    elif (F0, f0) != (FELD, FUSS[1]):
        for d in os.listdir(ziel):
            if d.endswith(".webp"): os.remove(os.path.join(ziel, d))
        print("das bisherige Feld reicht nicht mehr – alle Blätter werden neu gerendert", flush=True)
print(f"Renderbereich: Feld {FELD} px · Fußpunkt {FUSS} · Platz über dem Fußpunkt {round(ueber)} px, darunter {round(unter)} px, seitlich {round(seite)} px", flush=True)
sc.render.engine = "CYCLES"; sc.cycles.samples = 12; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False; sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = FELD; sc.render.use_persistent_data = False
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
h = (FUSS[1] - 0.5) * BREITE_M / math.cos(n)
cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = BREITE_M
cam.location = (0, -10 * math.cos(n), h + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, 0); sc.camera = cam; blick = Vector((0, math.cos(n), -math.sin(n)))
for name, rot, staerke in [("haupt", (50, 0, -40), 5.0), ("fuell", (65, 0, 60), 1.6), ("rand", (-40, 0, 170), 1.2)]:
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 1.3

teile = sorted([o for o in bpy.data.objects if o.get("ebene")], key=lambda o: (o.get("reihe", 0), o.name));   # Reihenfolge der Ausrüstungsliste: das erste Teil je Platz ist die Standardausrüstung
koerper = next(o for o in teile if o["art"] == "koerper"); huellen = [o for o in teile if o["art"] == "huelle"]; starr = [o for o in teile if o["art"] == "starr"]
volumen = [o for o in huellen if o.get("volumen")]                                                # wahlfreie Lagen (ueberlage) schneiden nichts aus
# Durchgänge: (Dateiname der Ebene, sichtbares Teil, Teile, die nur ausschneiden)
laeufe = [("koerper", koerper, [])] + [(o["ebene"], o, [koerper] + [v for v in volumen if v["platz"] != o["platz"]]) for o in huellen]
for o in starr: laeufe += [(o["ebene"] + ".hinten", o, []), (o["ebene"] + ".vorn", o, [koerper] + volumen)]
aktionen = [a for a in bpy.data.actions if a.get("bilder") and (BEW is None or a.name in BEW)]

meta = {"id": kennung, "feld": FELD, "richtungen": RICHTUNGEN, "winkel0": "osten", "drehsinn": "im Uhrzeigersinn am Bildschirm (y nach unten)", "zeile": "round(winkel / (pi/4)) mod 8",
        "fuss": list(FUSS), "mass": [FUSS[0], FUSS[1], round(1.8 * math.cos(n) * PX_JE_M / FELD, 3)], "kamera": {"neigung": NEIGUNG, "px_je_m": PX_JE_M},
        "animationen": {a.name: dict({"bilder": int(a["bilder"]), "rate": int(a["rate"]), "schleife": bool(a["schleife"])}, **json.loads(a["mehr"])) for a in aktionen},
        "ebenen": {"koerper": {"art": "koerper"}}, "plaetze": {}, "reihenfolge": "hinten-Ebenen der Waffen (fernste zuerst) · koerper · Rüstung (beliebig) · vorn-Ebenen der Waffen (fernste zuerst)", "tiefe": {}}
for o in huellen + starr: meta["ebenen"][o["ebene"]] = {"art": o["art"], "platz": o["platz"], **({"ueberlage": True} if o.get("ueberlage") else {}), **({"wahlfrei": True} if o.get("wahlfrei") else {}), **({"knochen": o.parent_bone, "angriff": o.get("angriff", "angriff")} if o["art"] == "starr" else {})}; meta["plaetze"].setdefault(o["platz"], []).append(o["ebene"])
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
