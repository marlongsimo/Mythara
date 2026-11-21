"""Mythara Fabrik – einen schlichten Speer bauen (Holzschaft, Eisenspitze, Schuh), Spitze unten wie alle Waffen der Fabrik.

  python3 fabrik/speer.py <ziel.glb> [laenge=1.9] [schaft=0.016] [spitze=0.2]
"""
import sys, math, bpy, bmesh
ziel = sys.argv[1]; opt = dict(a.split("=", 1) for a in sys.argv[2:] if "=" in a)
L, R, SP = float(opt.get("laenge", 1.9)), float(opt.get("schaft", 0.016)), float(opt.get("spitze", 0.2))
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, met, rau):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Metallic"].default_value = met; b.inputs["Roughness"].default_value = rau; return m
holz, eisen, leder = mat("holz", (0.28, 0.16, 0.08), 0.0, 0.7), mat("eisen", (0.55, 0.56, 0.58), 0.85, 0.35), mat("leder", (0.18, 0.11, 0.06), 0.0, 0.8)
oben = L / 2; unten = -L / 2
def rohr(z0, z1, r0, r1, m, n=12):
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r1, depth=z1 - z0, location=(0, 0, (z0 + z1) / 2)); o = bpy.context.object; o.data.materials.append(m); return o
teile = [rohr(unten + SP, oben - 0.03, R, R * 1.05, holz),                                          # Schaft
         rohr(oben - 0.03, oben, R * 1.2, R * 0.9, eisen),                                         # Schuh am oberen Ende (Griffende)
         rohr(oben - 0.42, oben - 0.26, R * 1.12, R * 1.12, leder),                                # Lederwicklung (Griff der hinteren Hand)
         rohr(unten + SP - 0.05, unten + SP + 0.01, R * 1.25, R * 1.05, eisen)]                     # Tülle
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.038, radius2=0.0, depth=SP, location=(0, 0, unten + SP / 2), rotation=(math.pi, 0, math.pi / 4))
sp = bpy.context.object; sp.scale = (1, 0.25, 1); sp.data.materials.append(eisen); teile.append(sp)    # flache Blattspitze nach unten
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); bpy.ops.object.join(); bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True); print("Speer:", ziel)
