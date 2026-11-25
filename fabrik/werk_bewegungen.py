"""Mythara Fabrik – Werk-Bewegungen des Handwerks für die Grundfiguren (basemann3d, basefrau3d), als eigene Datei neben dem Modell.

  blender -b -P fabrik/werk_bewegungen.py -- <grundfigur.glb (unkomprimiert)> <ziel.glb>

Das Modell selbst bleibt unverändert: die Datei enthält nur das Skelett (gleiche Knochennamen, gleiche Grundhaltung) mit fünf Bewegungen.
Das Spiel (client/src/welt3d/held3d.ts) lädt sie dazu und spielt sie auf dem Helden ab:
  werk_ofen       an der Esse: mit der Zange ins Feuer schieben und zurückziehen
  werk_hammer     am Amboss: ausholen und zuschlagen, die linke Hand hält das Werkstück
  werk_weben      Sehne, Garn, Stoff, Leder: die Hände drehen und ziehen vor dem Bauch
  werk_schnitzen  Holzwaren: links das Holz, rechts das Messer zieht Späne zum Körper
  werk_fuegen     zusammenfügen und nähen: die rechte Hand zieht den Faden hoch und weg
Rechenweise wie fabrik/rig.py: Knochen werden auf Richtungen im Raum der Figur gedreht (+x links, -y vorn, +z oben).
"""
import sys, math
import bpy
from mathutils import Vector, Quaternion

QUELLE, ZIEL = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=QUELLE)
ARM = next(o for o in bpy.data.objects if o.type == "ARMATURE")
for o in list(bpy.data.objects):
    if o is not ARM and o.parent is not ARM and o.type != "ARMATURE": pass
for a in list(bpy.data.actions): bpy.data.actions.remove(a)          # die Bewegungen des Modells nicht noch einmal ausliefern
KN = ARM.data.bones; PB = ARM.pose.bones
ELTERN = {b.name: (b.parent.name if b.parent else None) for b in KN}
RUHE = {b.name: b.matrix_local.to_quaternion() for b in KN}
RICHT = {b.name: (b.tail_local - b.head_local).normalized() for b in KN}
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
print("Figur: hand.L bei x =", round(KN["hand.L"].head_local.x, 3), "(soll > 0)", " Kopf bei z =", round(KN["kopf"].head_local.z, 3))
ganz = {}

def setze(name, q):
    e = ELTERN[name]; lokal = (ganz[e].inverted() @ q) if e else q; r = RUHE[name]; PB[name].rotation_quaternion = r.inverted() @ lokal @ r; ganz[name] = q
def dreh(name, *schritte):
    q = Quaternion()
    for achse, w in schritte: q = Quaternion(achse, math.radians(w)) @ q
    e = ELTERN[name]; setze(name, (ganz[e] @ q) if e else q)
def ziel(name, d): setze(name, RICHT[name].rotation_difference(Vector(d).normalized()))
def weich(t): t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)
def spur(keys, t):
    """zwischen Stützwerten (t, wert) weich überblenden; wert ist Zahl oder Tupel"""
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1 or (t1, b) == keys[-1]:
            f = weich(0 if t1 == t0 else (t - t0) / (t1 - t0))
            return a + (b - a) * f if isinstance(a, (int, float)) else tuple(p + (q - p) * f for p, q in zip(a, b))
def rumpf(vor=0.0, dreh_z=0.0, kopf=0.0):
    dreh("becken", (Z, dreh_z * 0.3)); dreh("bauch", (X, vor * 0.5), (Z, dreh_z * 0.35)); dreh("brust", (X, vor * 0.5), (Z, dreh_z * 0.35))
    dreh("hals", (X, kopf * 0.5)); dreh("kopf", (X, kopf * 0.5))
def beine():
    for S in "LR": dreh("oberschenkel." + S); dreh("unterschenkel." + S, (X, 2)); dreh("fuss." + S)
def arm(S, o, u, h=None):
    ziel("oberarm." + S, o); ziel("unterarm." + S, u); ziel("hand." + S, h or u)
spiegel = lambda v: (-v[0], v[1], v[2])
# Grundlage: Hände vor dem Bauch (rechte Seite: x < 0)
VORN_R = dict(o=(-0.16, -0.30, -0.94), u=(0.30, -0.92, -0.25))
VORN_L = dict(o=spiegel(VORN_R["o"]), u=spiegel(VORN_R["u"]))

def werk_ofen(t):
    """mit der Zange ins Feuer schieben (t 0–0,45), kurz halten, zurückziehen"""
    k = [(0, 0.0), (0.45, 1.0), (0.6, 1.0), (1.0, 0.0)]; f = spur(k, t)
    rumpf(vor=4 + 22 * f, kopf=6 + 8 * f); beine()
    for S, sx in (("R", -1), ("L", 1)):   # zurück: Ellbogen am Körper, Hände vor der Brust – vorn: Arme lang nach vorn unten ins Feuer
        arm(S, spur([(0, (sx * 0.18, 0.15, -0.97)), (1, (sx * 0.10, -0.62, -0.78))], f), spur([(0, (sx * -0.10, -0.75, 0.15)), (1, (sx * -0.02, -0.88, -0.48))], f))
def werk_hammer(t):
    """ausholen (bis 0,45), zuschlagen (0,6), zurückfedern; die linke Hand hält das Werkstück auf dem Amboss"""
    o_r = spur([(0, (-0.20, -0.55, -0.80)), (0.45, (-0.30, -0.55, 0.78)), (0.6, (-0.20, -0.62, -0.76)), (1.0, (-0.20, -0.55, -0.80))], t)
    u_r = spur([(0, (-0.05, -0.95, -0.30)), (0.45, (-0.12, 0.05, 0.99)), (0.6, (-0.05, -0.96, -0.28)), (1.0, (-0.05, -0.95, -0.30))], t)
    schlag = spur([(0, 0.0), (0.45, 0.0), (0.6, 1.0), (1.0, 0.0)], t)
    rumpf(vor=8 + 8 * schlag, dreh_z=-6 + 10 * schlag, kopf=12); beine()
    arm("R", o_r, u_r); arm("L", (0.20, -0.40, -0.90), (-0.15, -0.95, -0.25))
def werk_weben(t):
    """die Hände drehen gegeneinander vor dem Bauch (Faden verdrehen, ziehen)"""
    w = 2 * math.pi * t; rumpf(vor=8, kopf=16); beine()
    for S, sx, ph in (("R", -1, 0.0), ("L", 1, math.pi)):
        dx, dz = 0.2 * math.cos(w + ph), 0.2 * math.sin(w + ph)
        arm(S, (sx * 0.16, -0.30, -0.94), (sx * -0.30 + dx, -0.90, -0.25 + dz))
def werk_schnitzen(t):
    """links hält das Holz vor dem Körper, rechts zieht das Messer zum Körper (Zug bis 0,4), dann neu ansetzen"""
    zug = spur([(0, 0.0), (0.4, 1.0), (0.7, 1.0), (1.0, 0.0)], t)
    rumpf(vor=10, kopf=22); beine()
    arm("L", (0.16, -0.32, -0.93), (-0.35, -0.90, -0.10))
    arm("R", (-0.18, -0.30 + 0.12 * zug, -0.94), spur([(0, (0.40, -0.90, 0.02)), (1, (-0.10, -0.70, -0.45))], zug))
def werk_fuegen(t):
    """links hält zusammen, rechts zieht den Faden hoch und weg (bis 0,5), zurück"""
    zieh = spur([(0, 0.0), (0.5, 1.0), (0.65, 1.0), (1.0, 0.0)], t)
    rumpf(vor=8, dreh_z=-4 * zieh, kopf=18); beine()
    arm("L", VORN_L["o"], VORN_L["u"])
    arm("R", spur([(0, VORN_R["o"]), (1, (-0.42, -0.20, -0.88))], zieh), spur([(0, VORN_R["u"]), (1, (-0.85, -0.40, 0.15))], zieh))   # Faden zur Seite ziehen, auf Brusthöhe

FPS, N = 24, 24     # eine Sekunde; das Spiel streckt auf die Dauer eines Schlags
bpy.context.scene.render.fps = FPS
ARM.animation_data_create()
for name, f in (("werk_ofen", werk_ofen), ("werk_hammer", werk_hammer), ("werk_weben", werk_weben), ("werk_schnitzen", werk_schnitzen), ("werk_fuegen", werk_fuegen)):
    act = bpy.data.actions.new(name); act.use_fake_user = True; ARM.animation_data.action = act
    for i in range(N + 1):
        ganz.clear()
        for pb in PB: pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = Quaternion(); pb.location = (0, 0, 0)
        f(i / N)
        for pb in PB:
            pb.keyframe_insert("rotation_quaternion", frame=i + 1)
            if pb.name == "becken": pb.keyframe_insert("location", frame=i + 1)
    print("Bewegung", name, N + 1, "Bilder")
VORSCHAU = sys.argv[sys.argv.index("--") + 3] if len(sys.argv) > sys.argv.index("--") + 3 else ""
if VORSCHAU:   # Prüfbilder: je Bewegung drei Zeitpunkte, von vorn und von der Seite (Cycles, ohne GPU)
    import os; os.makedirs(VORSCHAU, exist_ok=True); sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 6; sc.cycles.use_denoising = False; sc.render.resolution_x = sc.render.resolution_y = 300
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 1.2
    cam = bpy.data.objects.new("kam", bpy.data.cameras.new("kam")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.2
    for name in ("werk_ofen", "werk_hammer", "werk_weben", "werk_schnitzen", "werk_fuegen"):
        ARM.animation_data.action = bpy.data.actions[name]
        for t in (0.0, 0.3, 0.5, 0.75):
            sc.frame_set(1 + round(t * N))
            for seite, (pos, rot) in (("vorn", ((0, -4, 1.0), (math.radians(90), 0, 0))), ("seite", ((-4, 0, 1.0), (math.radians(90), 0, math.radians(-90))))):
                cam.location = pos; cam.rotation_euler = rot; sc.render.filepath = os.path.join(VORSCHAU, f"{name}_{int(t * 100):02d}_{seite}.png"); bpy.ops.render.render(write_still=True)
ARM.animation_data.action = None
for o in list(bpy.data.objects):
    if o is not ARM: bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(filepath=ZIEL, export_format="GLB", export_animations=True, export_animation_mode="ACTIONS", export_force_sampling=True,
                          export_skins=False, export_morph=False, export_apply=False, use_selection=False)
print("geschrieben:", ZIEL)
