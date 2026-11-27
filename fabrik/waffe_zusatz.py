"""Mythara Fabrik – Quest-Waffen aus vorhandenen ableiten (Ausgabe 1): bogen = Rabenfedern am Griff, stab = Lindenblätter und Splitterglanz am Kopf.

  <blender-python> fabrik/waffe_zusatz.py -- <quelle.glb> <ziel.glb> bogen|stab   (vorher mit fabrik/textur_ton.py umfärben)
"""
import bpy,sys,math,random
from mathutils import Vector
q,z,art=sys.argv[-3:]; random.seed(4)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=q)
ob=[o for o in bpy.data.objects if o.type=="MESH"][0]; bpy.context.view_layer.objects.active=ob; ob.select_set(True); bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
P=[v.co for v in ob.data.vertices]; zmax=max(p.z for p in P); zmin=min(p.z for p in P)
def mat(n,c,r=0.6,e=0):
    m=bpy.data.materials.new(n); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value=(*[(x/255)**2.2 for x in c],1); b.inputs["Roughness"].default_value=r
    if e: b.inputs["Emission Color"].default_value=(*[(x/255)**2.2 for x in c],1); b.inputs["Emission Strength"].default_value=e
    return m
neu=[]
def blatt(ort,richt,l,w,m):
    vs=[(0,0,0),(w/2,l*0.4,0),(0,l,0),(-w/2,l*0.4,0)]; me=bpy.data.meshes.new("b"); me.from_pydata(vs,[],[(0,1,2,3)]); o=bpy.data.objects.new("b",me); bpy.context.collection.objects.link(o)
    o.location=ort; o.rotation_euler=richt; o.data.materials.append(m); s=o.modifiers.new("d","SOLIDIFY"); s.thickness=0.002; neu.append(o)
if art=="bogen":                                                                  # Rabenfedern als Anhänger an beiden Wurfarmenden
    F=mat("rabenfeder",(26,24,34),0.45); S_=mat("schnur",(70,50,36),0.8)
    mitte=[p for p in P if abs(p.z)<0.05]; xg=max(p.x for p in mitte)                 # Griff, Rückseite des Bogens (+x)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=0.004,depth=0.1,location=(xg+0.01,0,-0.08)); bpy.context.object.data.materials.append(S_); neu.append(bpy.context.object)
    for k in range(3): blatt(Vector((xg+0.012,0,-0.12)),(math.radians(90),0,math.radians(180)+0.35*(k-1)),0.2,0.06,F)   # Fläche in x-z, hängt nach unten
else:                                                                             # Lindenblätter und Splitterglanz am Kopf (Kopf = -z nach Konvention)
    L=mat("lindenblatt",(118,160,64),0.7); L2=mat("lindenblatt_hell",(160,190,90),0.7); GL=mat("splitterglanz",(170,220,255),0.2,2.0)
    kopf=zmin
    for k in range(9):
        a=k*0.7; blatt(Vector((0.05*math.cos(a),0.05*math.sin(a),kopf+0.05+0.03*(k%3))),(math.radians(200+random.uniform(-20,20)),0,a),0.2,0.14,L if k%2 else L2)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=0.05,location=(0,0,kopf+0.02)); bpy.context.object.data.materials.append(GL); neu.append(bpy.context.object)
    for k in range(4):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=0.01,location=(0.06*math.cos(k*1.6),0.06*math.sin(k*1.6),kopf+0.09)); bpy.context.object.data.materials.append(GL); neu.append(bpy.context.object)
for o in neu:
    bpy.context.view_layer.objects.active=o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
bpy.ops.object.select_all(action="SELECT"); bpy.context.view_layer.objects.active=ob; bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=z,export_format="GLB",use_selection=True,export_image_format="WEBP")
print("FERTIG",z)
