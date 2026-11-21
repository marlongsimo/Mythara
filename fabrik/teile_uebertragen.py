"""Mythara Fabrik – Teile (Rüstung, Kleidung) von einer gerigten Figur auf eine andere übertragen, über das gemeinsame Skelett.

  python3 fabrik/teile_uebertragen.py <quelle.blend> <ziel.blend> <ziel-ordner> <ebene>[,<ebene>…] [anlegen=0.06]

quelle.blend / ziel.blend   Figuren aus rig.py (gleiche Knochennamen; das Skelett jeder Figur sitzt in ihrem Körper)
Für jedes Teil der Quelle:
  1. jeder Punkt wird mit seinen Gewichten von den Knochen der Quelle auf dieselben Knochen des Ziels umgerechnet
     (Ruhelage zu Ruhelage, wie beim Skinning: Schulterplatte bleibt am Oberarm, Stiefel am Unterschenkel)
  2. Punkte, die danach im Zielkörper stecken, kommen knapp über seine Oberfläche (abstand=0.004); sonst behält das Teil seine Form
     anlegen=<m> (wahlfrei): Punkte, die in der Quelle nah am Körper lagen (Abstand < anlegen), werden im selben Abstand an die Oberfläche des
     Zielkörpers gesetzt – so schmiegt sich das Teil an einen anders gebauten Körper; weit abstehende Teile (Umhang) behalten ihre Form
  3. als <ebene>.glb (mit Material) in den Zielordner; rig.py übernimmt es dort als Teilnetz (Gewichte vom Zielkörper)
"""
import os, sys
import numpy as np
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

qpfad, zpfad, ziel, ebenen = sys.argv[1:5]; ebenen = ebenen.split(","); opt = dict(a.split("=", 1) for a in sys.argv[5:] if "=" in a); ANLEGEN = float(opt.get("anlegen", 0.0)); ABSTAND = float(opt.get("abstand", 0.004))
os.makedirs(ziel, exist_ok=True)
def lesen(pfad):
    with bpy.data.libraries.load(pfad, link=False) as (src, dst): dst.objects = list(src.objects)
    return {o.name: o for o in dst.objects if o is not None}
bpy.ops.wm.read_factory_settings(use_empty=True)
Q = lesen(qpfad); qarm = next(o for o in Q.values() if o.type == "ARMATURE"); qkoerper = next(o for o in Q.values() if o.get("art") == "koerper")
Z = lesen(zpfad); zarm = next(o for o in Z.values() if o.type == "ARMATURE"); zkoerper = next(o for o in Z.values() if o.get("art") == "koerper")
for o in (qarm, qkoerper, zarm, zkoerper): bpy.context.collection.objects.link(o)
UM = {b.name: zarm.data.bones[b.name].matrix_local @ b.matrix_local.inverted() for b in qarm.data.bones if b.name in zarm.data.bones}   # Ruhelage Quelle -> Ziel je Knochen
def baum(o):
    me = o.data; return BVHTree.FromPolygons([tuple(o.matrix_world @ v.co) for v in me.vertices], [tuple(p.vertices) for p in me.polygons])
qbaum, zbaum = baum(qkoerper), baum(zkoerper)
for e in ebenen:
    o = Q.get(e)
    if o is None: print("nicht in der Quelle:", e); continue
    o = o.copy(); o.data = o.data.copy(); bpy.context.collection.objects.link(o); o.modifiers.clear(); o.parent = None; mw = o.matrix_world.copy(); n_an = 0; n_raus = 0
    gname = {g.index: g.name for g in o.vertex_groups}
    for v in o.data.vertices:
        p = mw @ v.co; w = [(gname[g.group], g.weight) for g in v.groups if gname[g.group] in UM and g.weight > 0.001]; s = sum(x for _, x in w)
        neu = sum(((UM[b] @ p) * (x / s) for b, x in w), Vector()) if s > 0 else p
        ort, nrm, _, d = qbaum.find_nearest(p)
        if ort is not None and d < ANLEGEN:                                                        # nah am Körper: im selben Abstand an den Zielkörper anlegen
            seite = 1.0 if (p - ort).dot(nrm) >= 0 else -1.0; zo, zn, _, _ = zbaum.find_nearest(neu)
            if zo is not None: neu = zo + zn * (seite * d); n_an += 1
        zo, zn, _, _ = zbaum.find_nearest(neu)
        if zo is not None and (neu - zo).dot(zn) < ABSTAND: neu = zo + zn * ABSTAND; n_raus += 1      # steckt im Zielkörper: knapp über die Oberfläche
        v.co = neu
    o.matrix_world = Matrix.Identity(4)
    for g in list(o.vertex_groups): o.vertex_groups.remove(g)
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.export_scene.gltf(filepath=os.path.join(ziel, e + ".glb"), export_format="GLB", use_selection=True)
    print(f"übertragen: {e} · {len(o.data.vertices)} Punkte · {n_an} angelegt · {n_raus} aus dem Körper geschoben")
