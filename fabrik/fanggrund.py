"""Mythara Fabrik – Fanggrund: Markierung einer Angelstelle auf dem Wasser (Kräuselringe, Schilf, Seerosenblatt) als glb.

  <blender-python> fabrik/fanggrund.py -- <ziel.glb> [art=bach|kolk]

Flach (≈ 0,35 m hoch inkl. Schilf), Ursprung = Mitte auf der Wasserfläche. Die Ringe sind kräftig hellblau (Farbton ≈ 195°),
damit sie im Spiel über modell3d.puls_ton pulsieren (BaumBild-Shader) – das wirkt wie sanftes Kräuseln.
kolk: größer, mehr Ringe, ohne Seerose (Wehrkolk unter der Mühle).
"""
import math, os, random, sys
import bpy

a_ = sys.argv[sys.argv.index("--") + 1:]; ZIEL = a_[0]; opt = dict(x.split("=", 1) for x in a_[1:] if "=" in x); KOLK = opt.get("art") == "kolk"
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(11)
def mat(name, rgb, rau=0.4, leucht=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; c = tuple((x / 255) ** 2.2 for x in rgb)
    b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Roughness"].default_value = rau
    if leucht: b.inputs["Emission Color"].default_value = (*c, 1); b.inputs["Emission Strength"].default_value = leucht
    return m
RING = mat("kraeusel", (120, 215, 245), 0.2, 0.6); SCHAUM = mat("schaum", (225, 245, 250), 0.3)
SCHILF = mat("schilf", (95, 140, 55), 0.7); KOLBEN = mat("kolben", (110, 70, 40), 0.8); BLATT = mat("seerose", (60, 125, 50), 0.5); BLUETE = mat("bluete", (245, 225, 235), 0.5)
radien = (0.25, 0.5, 0.78, 1.05, 1.3) if KOLK else (0.2, 0.42, 0.66, 0.9)
for i, r in enumerate(radien):                                                                # Kräuselringe, außen dünner und lückig
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.022 - i * 0.003, major_segments=64, minor_segments=6, location=(0.05 * i, -0.03 * i, 0.01))
    o = bpy.context.object; o.scale.z = 0.35; o.data.materials.append(RING)
    if i >= 2:                                                                                # Lücken: Teile des Rings löschen
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="DESELECT"); bpy.ops.object.mode_set(mode="OBJECT")
        s = random.uniform(0, 6.3)
        for v in o.data.vertices: v.select = math.sin(math.atan2(v.co.y, v.co.x) * 2 + s) > 0.55
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.delete(type="VERT"); bpy.ops.object.mode_set(mode="OBJECT")
for k in range(10 if KOLK else 6):                                                            # Schaumtupfen in der Mitte
    a = random.uniform(0, 6.3); r = random.uniform(0.02, 0.15)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=5, radius=random.uniform(0.025, 0.045), location=(r * math.cos(a), r * math.sin(a), 0.008)); o = bpy.context.object; o.scale.z = 0.25; o.data.materials.append(SCHAUM)
ra = radien[-1] + 0.15
for k in range(7 if KOLK else 5):                                                             # Schilfbüschel am Rand (eine Seite)
    a = math.radians(110 + k * 14 + random.uniform(-5, 5)); x, y = ra * math.cos(a), ra * math.sin(a)
    for j in range(3):
        h = random.uniform(0.25, 0.42); dx, dy = random.uniform(-0.05, 0.05), random.uniform(-0.05, 0.05)
        bpy.ops.mesh.primitive_cone_add(vertices=5, radius1=0.012, radius2=0.002, depth=h, location=(x + dx, y + dy, h / 2), rotation=(random.uniform(-0.2, 0.2), random.uniform(-0.2, 0.2), 0))
        bpy.context.object.data.materials.append(SCHILF)
    if k % 2 == 0:
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.018, depth=0.08, location=(x, y, 0.36)); bpy.context.object.data.materials.append(KOLBEN)
if not KOLK:                                                                                  # Seerosenblatt mit Blüte
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=0.01, location=(-0.62, -0.5, 0.01)); o = bpy.context.object; o.data.materials.append(BLATT)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.object.mode_set(mode="OBJECT")
    for v in o.data.vertices:                                                                 # Kerbe
        if v.co.x > 0.02 and abs(v.co.y) < 0.03: v.co.x = 0.0
    for j in range(6):
        a = j / 6 * 2 * math.pi
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.04, location=(-0.62 - 0.05 + 0.03 * math.cos(a), -0.5 + 0.03 * math.sin(a), 0.04)); o = bpy.context.object; o.scale = (1.3, 0.6, 0.5); o.rotation_euler.z = a; o.data.materials.append(BLUETE)
for o in bpy.context.scene.objects:
    for p in o.data.polygons: p.use_smooth = True
bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active = bpy.context.scene.objects[0]; bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Fanggrund:", "kolk" if KOLK else "bach", os.path.getsize(ZIEL) // 1024, "KB")
