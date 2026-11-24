"""Mythara Fabrik – einen Meshy-Baum für die offene Welt rendern (Blender): orthografisch, 30° von oben wie die Weltobjekte, durchsichtiger Hintergrund.
  python3 fabrik/baum_render.py -- <baum.blend> <ziel.png> <drehung in Grad>
Weiter mit realtime/werkzeug/welt/baum_bilder.py (Farbvarianten der Krone, Schatten, Anker, Bibliothekseintrag)."""
import bpy, math, sys
from mathutils import Vector
blend, ziel, dreh = sys.argv[sys.argv.index("--")+1:][:3]
bpy.ops.wm.open_mainfile(filepath=blend); sc=bpy.context.scene
o=[x for x in bpy.data.objects if x.type=="MESH"][0]; o.rotation_euler[2]+=math.radians(float(dreh)); bpy.context.view_layer.update()
ps=[o.matrix_world@v.co for v in o.data.vertices]; lo=Vector([min(p[i] for p in ps) for i in range(3)]); hi=Vector([max(p[i] for p in ps) for i in range(3)])
o.location -= Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z)); bpy.context.view_layer.update(); h=hi.z-lo.z
eng=[i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]; sc.render.engine="BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in eng else "BLENDER_EEVEE"
sc.render.film_transparent=True; sc.render.resolution_x=800; sc.render.resolution_y=880; sc.view_settings.view_transform="Standard"
n=math.radians(30); cam=bpy.data.objects.new("k",bpy.data.cameras.new("k")); sc.collection.objects.link(cam); cam.data.type="ORTHO"; cam.data.ortho_scale=h*1.25
cam.location=(0,-10*math.cos(n),h*0.5+10*math.sin(n)); cam.rotation_euler=(math.radians(90)-n,0,0); sc.camera=cam
l=bpy.data.objects.new("l",bpy.data.lights.new("l","SUN")); l.data.energy=3.2; l.rotation_euler=(math.radians(45),0,math.radians(-35)); sc.collection.objects.link(l)
w=bpy.data.worlds.new("w"); sc.world=w; w.use_nodes=True; w.node_tree.nodes["Background"].inputs[0].default_value=(0.75,0.8,0.9,1); w.node_tree.nodes["Background"].inputs[1].default_value=0.9
# Fußpunkt im Bild (für den Anker) ausgeben
import bpy_extras
f=bpy_extras.object_utils.world_to_camera_view(sc,cam,Vector((0,0,0))); print("FUSS", round(f.x,4), round(1-f.y,4))
sc.render.filepath=ziel; bpy.ops.render.render(write_still=True)
