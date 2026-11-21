"""Mythara Fabrik – Baukasten-Eingang: ein neues Teil (Rüstung, Kleidung, Waffe, Schild) zu einer fertigen Figur hinzufügen.

  python3 fabrik/baukasten.py <versions-ordner> <teil.glb> <id> <platz> [art=teil|waffe|schild] [Optionen]

Beispiele
  Stiefel aus Meshy, im selben Raum wie der Meshy-Grundkörper erzeugt:
    python3 fabrik/baukasten.py fabrik/assets/held.schildwahrer/v004 stiefel.glb kleidung.fuss.stiefel.leder fuss wie=fabrik/assets/held.schildwahrer/v004/quelle/meshy-grundkoerper.glb
  Ein Schwert (Griff oben, Klinge unten, flach in der x-z-Ebene – sonst drehen=x,y,z in Grad):
    python3 fabrik/baukasten.py fabrik/assets/held.schildwahrer/v004 axt.glb waffe.axt.meshy hand_r art=waffe griff=0.15

Ablauf
  1. Teil laden; bei wie=<roh.glb> genauso verschieben und skalieren wie der Grundkörper in grundkoerper.py (gleiche Meshy-Szene)
  2. Teil: nach <version>/quelle/teile/<id>.glb, Eintrag in "teilnetze" (Gewichte kommen vom Grundkörper); Waffe/Schild: nach
     assets/<id>/v001/quelle/<id>.glb, Eintrag in "starr" (Griffpunkt griff, Hand hand=R|L, Angriff angriff=…)
  3. rig.py und boden.py für die Figur, dann rendern.py nur für die neue Ebene, packen.py und pruefung.py
Weitere Optionen: farbe=#rrggbb (fester Farbton) · unten (Unterkleidung) · beine_mitteln (Tuch zwischen den Beinen) · wahlfrei · nicht_rendern
"""
import json, os, subprocess, sys

ordner, glb, eid, platz = sys.argv[1:5]; mehr = sys.argv[5:]; opt = dict(a.split("=", 1) for a in mehr if "=" in a); flags = {a for a in mehr if "=" not in a}
ART = opt.get("art", "teil"); FAB = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(FAB, "assets"); PY = sys.executable
liste = os.path.join(ordner, "ausruestung.json"); AUS = json.load(open(liste)); figur = os.path.basename(os.path.dirname(os.path.abspath(ordner)))
blender_py = os.environ.get("FABRIK_BLENDER_PY", PY)
vorbereiten = r'''
import bpy, sys, numpy as np, math
from mathutils import Matrix, Vector, Euler
quelle, ziel, wie, drehen = sys.argv[-4:]
def laden(p):
    vor = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=p); neu = [o for o in bpy.data.objects if o not in vor]
    for o in neu:
        if o.type != "MESH": bpy.data.objects.remove(o)
    return [o for o in neu if o.name in bpy.data.objects and o.type == "MESH"]
bpy.ops.wm.read_factory_settings(use_empty=True)
T = Matrix.Identity(4)
if wie != "-":                                                                                     # dieselbe Normierung wie grundkoerper.py
    r = laden(wie); P = np.concatenate([np.array([tuple(o.matrix_world @ v.co) for v in o.data.vertices]) for o in r]); k = 1.8 / np.ptp(P[:, 2])
    off = Vector((-(P[:, 0].max() + P[:, 0].min()) / 2, -float(np.median(P[P[:, 2] - P[:, 2].min() > 1.2, 1])), -P[:, 2].min())); T = Matrix.Scale(k, 4) @ Matrix.Translation(off)
    for o in r: bpy.data.objects.remove(o)
teile = laden(quelle); bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]
if len(teile) > 1: bpy.ops.object.join()
o = bpy.context.object; bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
o.data.transform(T)
if drehen != "-": o.data.transform(Euler([math.radians(float(v)) for v in drehen.split(",")]).to_matrix().to_4x4())
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True); print("vorbereitet:", ziel, [round(v, 3) for v in o.dimensions])
'''
import tempfile
skript = os.path.join(tempfile.gettempdir(), "baukasten_vorbereiten.py"); open(skript, "w").write(vorbereiten)
if ART == "teil":
    ziel_rel = os.path.relpath(os.path.join(ordner, "quelle", "teile", eid + ".glb"), ASSETS); eintrag = {"id": eid, "platz": platz, "glb": ziel_rel}
    for f in ("unten", "beine_mitteln", "wahlfrei"):
        if f in flags: eintrag[f] = True
    if "farbe" in opt: eintrag["farbe"] = opt["farbe"]
    AUS["teilnetze"] = [t for t in AUS.get("teilnetze", []) if t["id"] != eid] + [eintrag]
else:
    ziel_rel = os.path.join(eid, "v001", "quelle", eid + ".glb"); eintrag = {"id": eid, "platz": platz, "art": "schwert" if ART == "waffe" else "schild", "glb": ziel_rel}
    if ART == "waffe": eintrag.update(griff=float(opt.get("griff", 0.12)), griff2=float(opt.get("griff2", 0.04)), angriff=opt.get("angriff", "angriff"), **({"hand": "L"} if opt.get("hand") == "L" else {}))
    AUS["starr"] = [t for t in AUS.get("starr", []) if t["id"] != eid] + [eintrag]
ziel = os.path.join(ASSETS, ziel_rel); os.makedirs(os.path.dirname(ziel), exist_ok=True)
subprocess.run([blender_py, skript, glb, ziel, opt.get("wie", "-"), opt.get("drehen", "-")], check=True)
json.dump(AUS, open(liste, "w"), ensure_ascii=False, indent=2); print("eingetragen:", eintrag)
if "nicht_rendern" in flags: sys.exit(0)
blend_roh = os.path.abspath(os.path.join(ordner, "arbeit", "figur-roh.blend")); blend = os.path.abspath(os.path.join(ordner, "arbeit", "figur.blend")); export = os.path.join(ordner, "export")
koerper = os.path.join(ordner, "quelle", "koerper.glb")
def lauf(*a): print("·", " ".join(os.path.basename(str(x)) for x in a[:2])); subprocess.run([blender_py, *a], check=True)
lauf(os.path.join(FAB, "rig.py"), koerper, blend_roh, liste)
lauf(os.path.join(FAB, "boden.py"), blend_roh, blend, ",".join(AUS["bewegungen"]))
ebenen = eid if ART == "teil" else f"{eid}.hinten,{eid}.vorn"
lauf(os.path.join(FAB, "rendern.py"), blend, export, figur, ebenen)
lauf(os.path.join(FAB, "packen.py"), export, figur)
lauf(os.path.join(FAB, "pruefung.py"), blend, export, figur)
print(f"fertig: {eid} ist Teil von {figur} ({os.path.basename(ordner)}) – in der Testszene unter Platz „{platz}“ wählbar")
