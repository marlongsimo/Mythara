"""Mythara Fabrik – Brau-Bewegungen der Kräuterkunde für die Grundfiguren (basemann3d, basefrau3d), als eigene Datei neben dem Modell (wie fabrik/werk_bewegungen.py).

  <blender-python> fabrik/brau_bewegungen.py -- <grundfigur.glb> <ziel.glb> [vorschau-ordner]

Das Modell selbst bleibt unverändert: die Datei enthält nur das Skelett (gleiche Knochennamen, gleiche Grundhaltung) mit den Bewegungen:
  brauen        am Kessel rühren (Schleife, 2 s): beide Hände am Löffel, kreisend, leicht vorgebeugt
  brauen_zutat  eine Zutat hineingeben (einmal, 1 s)
Das Spiel lädt sie wie werk_<g>.glb nach (img/figuren-echt3d/brau_<g>.glb).
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

def brauen(t):
    """Rühren (Schleife, 2 s): beide Hände am langen Löffel, kreisen über dem Kessel vor dem Körper, leicht vorgebeugt"""
    w = 2 * math.pi * t; dx, dz = 0.14 * math.cos(w), 0.08 * math.sin(w)
    rumpf(vor=16 + 3 * math.sin(w), dreh_z=6 * math.cos(w), kopf=14); beine()
    arm("R", (-0.18, -0.55, -0.82), (-0.10 + dx, -0.92, -0.35 + dz)); arm("L", (0.18, -0.55, -0.82), (-0.25 + dx, -0.90, -0.30 + dz))
def brauen_zutat(t):
    """eine Zutat hineingeben (einmal, 1 s): die rechte Hand hebt etwas vor die Brust und lässt es über dem Kessel fallen, die linke hält den Löffel"""
    hoch = spur([(0, 0.0), (0.35, 1.0), (0.55, 1.0), (0.7, 0.4), (1.0, 0.0)], t); vor = spur([(0, 0.0), (0.5, 0.0), (0.7, 1.0), (1.0, 0.0)], t)
    rumpf(vor=14 + 6 * vor, kopf=14 + 6 * vor); beine()
    arm("R", spur([(0, (-0.18, -0.55, -0.82)), (1, (-0.25, -0.70, -0.30))], max(hoch, vor)), spur([(0, (-0.10, -0.92, -0.35)), (1, (0.10, -0.75, 0.62))], hoch * (1 - vor)) if vor < 0.5 else (-0.05, -0.97, -0.25))
    arm("L", (0.18, -0.55, -0.82), (-0.25, -0.90, -0.30))

FPS = 24
bpy.context.scene.render.fps = FPS
ARM.animation_data_create()
BEWEGUNGEN = (("brauen", brauen, 48), ("brauen_zutat", brauen_zutat, 24))   # Bilder bei 24/s
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
