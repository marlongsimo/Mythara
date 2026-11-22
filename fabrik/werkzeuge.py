"""Mythara Fabrik – einfache Werkzeuge für Dorf-NPCs, als starre Teile für die Hand (rig.py "art": "schwert").

  python3 fabrik/werkzeuge.py <art> <ziel.glb>      art = hammer | angel | eimer
Lage wie alle Waffen der Fabrik (Griffpunkt auf der z-Achse): Griff oben, das „vordere“ Ende unten (-z). In der Hand zeigt -z nach vorn, -x entlang der Hand nach unten.
Darum hängen Hammer und Eimer entlang -x (unter der Hand) und die Angel ist im Teil schon schräg nach oben gestellt.
"""
import sys, math, bpy
from mathutils import Vector, Matrix
art, ziel = sys.argv[1:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, met=0.0, rau=0.7):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Metallic"].default_value = met; b.inputs["Roughness"].default_value = rau; return m
HOLZ, DUNKEL, EISEN, SCHNUR = mat("holz", (0.32, 0.18, 0.08)), mat("dunkelholz", (0.12, 0.07, 0.04)), mat("eisen", (0.28, 0.28, 0.3), 0.85, 0.4), mat("schnur", (0.8, 0.78, 0.7))
teile = []
def rohr(a, b, r0, r1, m, n=12):
    a, b = Vector(a), Vector(b); d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r1, depth=d.length, location=(a + b) / 2); o = bpy.context.object
    o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); teile.append(o); return o
def kasten(ort, groesse, m):
    bpy.ops.mesh.primitive_cube_add(size=1, location=ort); o = bpy.context.object; o.scale = groesse; o.data.materials.append(m); teile.append(o); return o
if art == "hammer":                                                       # Schmiedehammer hängt locker in der Hand: Stiel entlang -x, Kopf unten neben dem Bein
    rohr((0.05, 0, 0), (-0.36, 0, 0), 0.016, 0.014, HOLZ); rohr((0.05, 0, 0), (0.0, 0, 0), 0.019, 0.019, DUNKEL)
    kasten((-0.37, 0, 0), (0.06, 0.06, 0.13), EISEN); rohr((-0.37, 0, -0.065), (-0.37, 0, -0.09), 0.032, 0.028, EISEN)
elif art == "angel":                                                      # Angelrute 1.7 m, schräg nach vorn oben, Schnur hängt von der Spitze
    d = Vector((math.sin(math.radians(55)), 0, -math.cos(math.radians(55)))); a = Vector((-0.05, 0, 0.12)) * 0 + Vector((0, 0, 0.1)); s = a + d * 1.7
    rohr(a - d * 0.12, a + d * 0.3, 0.017, 0.013, DUNKEL); rohr(a + d * 0.3, s, 0.012, 0.004, HOLZ)
    rohr(a + d * 0.05, a + d * 0.12, 0.03, 0.03, EISEN, 16)                                   # Rolle
    unten = s + Vector((-1.25, 0, 0)); rohr(s, unten, 0.002, 0.002, SCHNUR, 6)                  # Schnur hängt nach unten (-x)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, location=unten); o = bpy.context.object; o.data.materials.append(mat("pose", (0.75, 0.1, 0.08))); teiles = teile.append(o)
elif art == "eimer":                                                      # Holzeimer am Bügel: Griff in der Hand, Eimer hängt darunter (-x)
    rohr((0, 0, -0.13), (0, 0, 0.13), 0.009, 0.009, DUNKEL)                                     # Griffholz quer in der Hand
    for sz in (-1, 1): rohr((0, 0, sz * 0.13), (-0.2, 0, sz * 0.13), 0.004, 0.004, EISEN, 6)    # Bügel
    rohr((-0.2, 0, 0), (-0.44, 0, 0), 0.14, 0.12, HOLZ, 20)                                     # Eimer (Achse entlang x)
    for x in (-0.23, -0.41): rohr((x - 0.012, 0, 0), (x + 0.012, 0, 0), 0.146 - (x + 0.2) * -0.08, 0.146 - (x + 0.2) * -0.08, EISEN, 20)   # Reifen
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.13, depth=0.01, location=(-0.215, 0, 0), rotation=(0, math.pi / 2, 0)); o = bpy.context.object; o.data.materials.append(mat("wasser", (0.12, 0.3, 0.45), 0, 0.1)); teile.append(o)
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); bpy.ops.object.join(); bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True); print("Werkzeug:", art, ziel)
