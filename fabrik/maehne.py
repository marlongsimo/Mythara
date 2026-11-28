"""Mythara Fabrik – Mähne an einen gerigten Vierbeiner (Ockermutter, #172): Haarsträhnen entlang Hals und Rückenkamm, als starre Teile am Hals- bzw. Rumpfknochen.

  <blender-python> fabrik/maehne.py -- <figur.blend> <ziel.blend>
"""
import bpy,sys,math,random
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=sys.argv[-2]); random.seed(3)
arm=[o for o in bpy.data.objects if o.type=="ARMATURE"][0]; KN=arm.data.bones
k=[o for o in bpy.data.objects if o.type=="MESH"][0]
from mathutils.bvhtree import BVHTree; import bmesh
dg=bpy.context.evaluated_depsgraph_get(); bm=bmesh.new(); bm.from_mesh(k.data); bvh=BVHTree.FromBMesh(bm)
def mat(n,c,r=0.9):
    m=bpy.data.materials.new(n); m.use_nodes=True; b=m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value=(*[(x/255)**2.2 for x in c],1); b.inputs["Roughness"].default_value=r; return m
HAAR=mat("maehne",(52,34,26)); HAAR2=mat("maehne_hell",(96,60,38)); NARBE=mat("narbe",(214,170,150),0.6)
teile=[]
def oben(x,y):                                                                   # Oberfläche des Körpers von oben treffen
    hit=bvh.ray_cast(Vector((x,y,3.0)),Vector((0,0,-1)))
    return hit[0]
for knochen,(y0,y1),n in (("hals",(-1.12,-0.6),26),("rumpf",(-0.6,0.5),30)):
    for i in range(n):
        t=i/(n-1); y=y0+(y1-y0)*t; x=0.25+random.uniform(-0.05,0.05); p=oben(x,y)
        if p is None: continue
        l=(0.34 if knochen=="hals" else 0.22)*(1-0.5*t if knochen=="rumpf" else 1)+random.uniform(-0.04,0.04)
        bpy.ops.mesh.primitive_cone_add(vertices=4,radius1=0.05,radius2=0.0,depth=l,location=p+Vector((0,0.06,l*0.35)),rotation=(math.radians(-35),random.uniform(-.3,.3),0))
        o=bpy.context.object; o.data.materials.append(HAAR if i%3 else HAAR2); o.scale=(0.6,1.4,1); teile.append((o,knochen))
for o,kn in teile:
    mw=o.matrix_world.copy(); o.parent=arm; o.parent_type="BONE"; o.parent_bone=kn; o.matrix_world=mw
bpy.ops.object.select_all(action="DESELECT")
for kn in ("hals","rumpf"):
    sel=[o for o,k_ in teile if k_==kn]
    if not sel: continue
    for o in sel: o.select_set(True)
    bpy.context.view_layer.objects.active=sel[0]; bpy.ops.object.join(); j=bpy.context.view_layer.objects.active
    j.name="kleidung.maehne."+kn; j["ebene"]="kleidung.maehne."+kn; j["art"]="starr"; j["platz"]=kn; j["reihe"]=0; j["angriff"]="angriff"; j["bewegungen"]="[]"
    bpy.ops.object.select_all(action="DESELECT")
print("MAEHNE",len(teile),"Teile")
bpy.ops.wm.save_as_mainfile(filepath=sys.argv[-1])
