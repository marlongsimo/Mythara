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
STIL = arm.get("stil", "")                                                                         # "gemalt": weiches warmes Hauptlicht, kühle Randlichter, Schatten in Falten, helle Kanten (aus der Ausrüstungsliste)
if STIL == "gemalt":
    for name, farbe_, staerke, winkel, rot in (("haupt", (1.0, 0.92, 0.8), 3.0, 35, None), ("fuell", (0.75, 0.8, 0.95), 1.0, 40, None), ("rand", (0.9, 0.92, 1.0), 2.4, 8, None), ("rand2", (1.0, 0.95, 0.85), 1.6, 8, (-35, 0, -150))):
        l = bpy.data.objects.get(name)
        if l is None: l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); sc.collection.objects.link(l); l.rotation_euler = tuple(math.radians(v) for v in rot)
        l.data.color = farbe_; l.data.energy = staerke; l.data.angle = math.radians(winkel)
    bg = welt.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.55, 0.6, 0.72, 1); bg.inputs[1].default_value = 0.85
    def veredeln(mat):
        """Grundfarbe × Umgebungsverdeckung (dunkle Falten) + helle Kanten (Bevel-Normale weicht von der Flächennormale ab)"""
        if not mat or not mat.use_nodes or mat.get("veredelt"): return
        nt = mat.node_tree; bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None: return
        ein = bsdf.inputs["Base Color"]
        if ein.is_linked: quelle = ein.links[0].from_socket
        else: c = nt.nodes.new("ShaderNodeRGB"); c.outputs[0].default_value = ein.default_value; quelle = c.outputs[0]
        ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = 0.12; ao.samples = 8
        stufe = nt.nodes.new("ShaderNodeMapRange"); stufe.inputs["To Min"].default_value = 0.5; nt.links.new(ao.outputs["AO"], stufe.inputs["Value"])
        dunkel = nt.nodes.new("ShaderNodeMixRGB"); dunkel.blend_type = "MULTIPLY"; dunkel.inputs["Fac"].default_value = 1.0
        nt.links.new(quelle, dunkel.inputs["Color1"]); nt.links.new(stufe.outputs["Result"], dunkel.inputs["Color2"])
        bev = nt.nodes.new("ShaderNodeBevel"); bev.inputs["Radius"].default_value = 0.014; bev.samples = 6; geo = nt.nodes.new("ShaderNodeNewGeometry")
        dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"; nt.links.new(bev.outputs[0], dot.inputs[0]); nt.links.new(geo.outputs["Normal"], dot.inputs[1])
        kante = nt.nodes.new("ShaderNodeMapRange"); kante.inputs["From Min"].default_value = 0.95; kante.inputs["From Max"].default_value = 0.7; kante.inputs["To Max"].default_value = 0.22   # nur deutliche Kanten (feine Netze rauschen sonst)
        nt.links.new(dot.outputs["Value"], kante.inputs["Value"])
        hell = nt.nodes.new("ShaderNodeMixRGB"); hell.blend_type = "SCREEN"; nt.links.new(kante.outputs["Result"], hell.inputs["Fac"]); nt.links.new(dunkel.outputs[0], hell.inputs["Color1"]); hell.inputs["Color2"].default_value = (1.0, 0.95, 0.85, 1)
        nt.links.new(hell.outputs[0], ein); mat["veredelt"] = True
    for o in bpy.data.objects:
        if o.type == "MESH":
            for m_ in o.data.materials: veredeln(m_)
    print("Stil: gemalt (Licht und Material veredelt)")

teile = sorted([o for o in bpy.data.objects if o.get("ebene")], key=lambda o: (o.get("reihe", 0), o.name));   # Reihenfolge der Ausrüstungsliste: das erste Teil je Platz ist die Standardausrüstung
koerper = next(o for o in teile if o["art"] == "koerper"); huellen = [o for o in teile if o["art"] == "huelle"]; starr = [o for o in teile if o["art"] == "starr"]
volumen = [o for o in huellen if o.get("volumen")]                                                # wahlfreie Lagen (ueberlage) schneiden nichts aus
# Durchgänge: (Dateiname der Ebene, sichtbares Teil, Teile, die nur ausschneiden)
# Unterkleidung ("unten": Hemd, Hose, Schuhe) wird nur vom Körper und von anderer Unterkleidung ausgestanzt – nie von abnehmbarer Rüstung,
# sonst hätte sie dort Löcher, sobald die Rüstung abgelegt ist; die Rüstung liegt in der Zeichenreihenfolge darüber (höhere „reihe“)
laeufe = [("koerper", koerper, [])] + [(o["ebene"], o, [koerper] + [v for v in volumen if v["platz"] != o["platz"] and (v.get("unten") or not o.get("unten"))]) for o in huellen]
for o in starr: laeufe += [(o["ebene"] + ".hinten", o, []), (o["ebene"] + ".vorn", o, [koerper] + volumen)]
aktionen = [a for a in bpy.data.actions if a.get("bilder") and (BEW is None or a.name in BEW)]

meta = {"id": kennung, "feld": FELD, "richtungen": RICHTUNGEN, "winkel0": "osten", "drehsinn": "im Uhrzeigersinn am Bildschirm (y nach unten)", "zeile": "round(winkel / (pi/4)) mod 8",
        "fuss": list(FUSS), "mass": [FUSS[0], FUSS[1], round(float(arm.get("hoehe", 1.8)) * math.cos(n) * PX_JE_M / FELD, 3)], "kamera": {"neigung": NEIGUNG, "px_je_m": PX_JE_M},
        "animationen": {a.name: dict({"bilder": int(a["bilder"]), "rate": int(a["rate"]), "schleife": bool(a["schleife"])}, **json.loads(a["mehr"])) for a in aktionen},
        "ebenen": {"koerper": {"art": "koerper"}}, "plaetze": {}, "reihenfolge": "hinten-Ebenen der Waffen (fernste zuerst) · koerper · Rüstung (beliebig) · vorn-Ebenen der Waffen (fernste zuerst)", "tiefe": {}}
for o in huellen + starr: meta["ebenen"][o["ebene"]] = {"art": o["art"], "platz": o["platz"], **({"ueberlage": True} if o.get("ueberlage") else {}), **({"wahlfrei": True} if o.get("wahlfrei") else {}), **({"unten": True} if o.get("unten") else {}), **({"knochen": o.parent_bone, "angriff": o.get("angriff", "angriff")} if o["art"] == "starr" else {})}; meta["plaetze"].setdefault(o["platz"], []).append(o["ebene"])
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
alt_pfad = os.path.join(ziel, kennung + ".json")
if BEW is not None and os.path.exists(alt_pfad):                                                   # nur einzelne Bewegungen neu gerendert: die übrigen Bewegungen (und ihre Tiefen) aus den bisherigen Angaben behalten
    alt = json.load(open(alt_pfad))
    for name, d in alt.get("animationen", {}).items(): meta["animationen"].setdefault(name, d)
    for e, je in alt.get("tiefe", {}).items():
        if e in meta["tiefe"]:
            for name, w in je.items(): meta["tiefe"][e].setdefault(name, w)
json.dump(meta, open(alt_pfad, "w"), ensure_ascii=False, indent=1)

tmp = os.path.join(ziel, ".bild.png"); start = time.time(); gerendert = 0
for name, sichtbar, schneider in laeufe:
    if NUR and name not in NUR and name.rsplit(".", 1)[0] not in NUR: continue
    for o in teile: o.hide_render = not (o is sichtbar or o in schneider); o.is_holdout = o in schneider
    for a in aktionen:
        datei = os.path.join(ziel, f"{name}.{a.name}.webp")
        if os.path.exists(datei) and not NUR and os.path.getmtime(datei) > os.path.getmtime(quelle): continue   # nur Blätter wiederverwenden, die neuer sind als die Figur (sonst zeigen sie eine alte Fassung)
        bilder = int(a["bilder"]); arm.animation_data.action = a; blatt = Image.new("RGBA", (FELD * bilder, FELD * 8), (0, 0, 0, 0))
        for r in range(8):
            arm.rotation_euler = (0, 0, math.radians(90 - 45 * r))
            for b in range(bilder): sc.frame_set(b + 1); sc.render.filepath = tmp; bpy.ops.render.render(write_still=True); blatt.paste(Image.open(tmp).convert("RGBA"), (b * FELD, r * FELD)); gerendert += 1
        px = np.asarray(blatt).copy(); px[px[..., 3] < 8] = 0; Image.fromarray(px, "RGBA").save(datei, lossless=True, method=4)
        print(f"Blatt: {name}.{a.name} · {gerendert} Bilder in {round(time.time() - start)} s", flush=True)
if os.path.exists(tmp): os.remove(tmp)
print("fertig:", ziel)
