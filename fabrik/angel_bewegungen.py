"""Mythara Fabrik – Angel-Bewegungen für die Grundfiguren (basemann3d, basefrau3d), als eigene Datei neben dem Modell (wie fabrik/werk_bewegungen.py).

  <blender-python> fabrik/angel_bewegungen.py -- <grundfigur.glb> <ziel.glb> [vorschau-ordner]

Das Modell selbst bleibt unverändert: die Datei enthält nur das Skelett (gleiche Knochennamen, gleiche Grundhaltung) mit den Bewegungen:
  angeln          auswerfen und warten (einmal, ≈ 2,5 s): Rute über die rechte Schulter nach hinten, nach vorn schwingen, dann ruhig halten
  angeln_warten   warten (Schleife, 2 s): Rute vorn schräg nach oben, die Spitze wippt leicht, das Gewicht verlagert sich
  angeln_einholen ein Fisch beißt (einmal, ≈ 1 s): Rute ruckartig hoch, mit der linken Hand kurbeln
Die Rute ist das Waffenteil waffe.angelrute (an hand.R); das Spiel hängt es wie Holzbeil und Spitzhacke an.
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

def angeln(t):
    """0–0,25 ausholen (Hand über die Schulter nach hinten oben), 0,25–0,42 auswerfen (nach vorn), dann ruhig halten wie angeln_warten"""
    k = [(0, 0.0), (0.25, 1.0), (0.42, 2.0), (1.0, 2.0)]; f = spur(k, t)
    hinten, vorn = max(0.0, 1 - abs(f - 1)), max(0.0, f - 1)
    rumpf(vor=2 - 8 * hinten + 10 * vorn, dreh_z=-18 * hinten + 6 * vorn, kopf=-4 * hinten + 6 * vorn); beine()
    o_r = spur([(0, (-0.25, -0.15, -0.95)), (1, (-0.35, 0.10, 0.92)), (2, (-0.22, -0.72, -0.62))], f)
    u_r = spur([(0, (-0.10, -0.75, -0.65)), (1, (-0.10, 0.55, 0.82)), (2, (-0.05, -0.97, -0.20))], f)
    arm("R", o_r, u_r); arm("L", (0.25, -0.25, -0.93), spur([(0, (0.05, -0.55, -0.83)), (2, (-0.20, -0.85, -0.45))], f))
    if t > 0.42: wippen(t - 0.42)
def wippen(t):
    w = math.sin(2 * math.pi * t * 0.9) * 3; dreh("hand.R", (X, w))
def angeln_warten(t):
    w = 2 * math.pi * t; rumpf(vor=8 + 1.5 * math.sin(w), dreh_z=4, kopf=6 + 2 * math.sin(w + 1)); beine()
    arm("R", (-0.22, -0.72, -0.62), (-0.05, -0.97, -0.20 + 0.04 * math.sin(w * 2))); arm("L", (0.25, -0.25, -0.93), (-0.20, -0.85, -0.45))
    dreh("hand.R", (X, 4 * math.sin(w * 2)))
def angeln_einholen(t):
    hoch = spur([(0, 0.0), (0.25, 1.0), (1.0, 0.8)], t); kurbel = 2 * math.pi * 3 * t
    rumpf(vor=8 - 10 * hoch, dreh_z=4, kopf=6 - 8 * hoch); beine()
    arm("R", spur([(0, (-0.22, -0.72, -0.62)), (1, (-0.25, -0.55, 0.20))], hoch), spur([(0, (-0.05, -0.97, -0.20)), (1, (-0.05, -0.45, 0.89))], hoch))
    arm("L", (0.20, -0.45, -0.87), (-0.25 + 0.12 * math.cos(kurbel), -0.90, -0.10 + 0.12 * math.sin(kurbel)))

FPS = 24
bpy.context.scene.render.fps = FPS
ARM.animation_data_create()
BEWEGUNGEN = (("angeln", angeln, 60), ("angeln_warten", angeln_warten, 48), ("angeln_einholen", angeln_einholen, 24))   # Bilder bei 24/s
for name, f, N in BEWEGUNGEN:
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
    for name, _, N in BEWEGUNGEN:
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
