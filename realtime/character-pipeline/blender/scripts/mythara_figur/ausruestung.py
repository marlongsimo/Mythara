"""Ausrüstung: ein Teil laden, am Sockel befestigen (starr) oder an das Skelett binden (gehäutet).
Konventionen für Modelle (gilt auch für spätere, echte Mythara-Modelle):
  starr     – Ursprung = Haltepunkt, Koordinaten im Raum des Sockels. Waffen: Griff am Ursprung, Klinge entlang +Z des Sockels.
  gehaeutet – Modell in der Ruhepose (T-Pose) des Grundskeletts, Meter, Blick nach −Y. Gewichte werden vom Körper übernommen
              (oder vorhandene Vertexgruppen mit Knochennamen bleiben, wenn attach.keepWeights = true)."""
import bpy
from . import szene

def laden(g, arm, sockel, regionen, M):
    """Gegenstand g (configs/ausruestung/<id>.json) in die Szene holen. Zurück: Liste der Objekte."""
    neu = [o for o in szene.importieren(g['model']['file']) if o.type == 'MESH']
    wahl = g['model'].get('objects')
    for o in list(neu):
        if wahl and o.name not in wahl: bpy.data.objects.remove(o, do_unlink=True); neu.remove(o)
    if not neu: raise RuntimeError(g['id'] + ': keine Objekte im Modell ' + g['model']['file'])
    A = g['attach']
    if A['mode'] == 'rigid':
        teile = {t['object']: t['socket'] for t in A.get('parts', [])}
        for o in neu:
            s = teile.get(o.name, A.get('socket'))
            if s not in sockel: raise RuntimeError(g['id'] + ': unbekannter Sockel ' + str(s))
            o.parent = sockel[s]; o.matrix_parent_inverse.identity()
    elif A['mode'] == 'skinned':
        quelle = [o for r in A.get('bindTo', list(regionen)) for o in regionen[r]]
        for o in neu: binden(o, arm, quelle, A.get('keepWeights', False))
    else: raise RuntimeError(g['id'] + ': attach.mode muss rigid oder skinned sein')
    mat = g.get('visual', {}).get('material')
    for o in neu:
        if mat and not o.get('mythara_material'): szene.material_setzen([o], mat, M)
        if o.get('mythara_material'):  # Mehrere Materialien im Modell: Namen aus der Bibliothek in Slot-Reihenfolge
            namen = str(o['mythara_material']).split(',')
            for i, n in enumerate(namen):
                if i < len(o.data.materials): o.data.materials[i] = szene.material(n, M)
        o['mythara_ebene'] = 'item:' + g['id']
    return neu

def binden(o, arm, quelle, behalten=False):
    """Gewichte vom Körper übertragen (nächste Fläche, interpoliert) und an das Skelett hängen."""
    knochen = set(b.name for b in arm.data.bones)
    if not (behalten and any(vg.name in knochen for vg in o.vertex_groups)):
        for vg in list(o.vertex_groups): o.vertex_groups.remove(vg)
        # Quelle: alle Körperregionen zu einem Hilfsobjekt zusammenfassen
        tmp = bpy.data.objects.new('Bindequelle', bpy.data.meshes.new('Bindequelle')); bpy.context.scene.collection.objects.link(tmp)
        import bmesh
        bm = bmesh.new(); gruppen = []
        for q in quelle:
            for vg in q.vertex_groups:
                if vg.name not in gruppen: gruppen.append(vg.name)
        dl = bm.verts.layers.deform.verify()
        for q in quelle:
            me = q.data; mw = q.matrix_world; idx = {vg.index: gruppen.index(vg.name) for vg in q.vertex_groups}; vs = []
            for v in me.vertices:
                nv = bm.verts.new(mw @ v.co); vs.append(nv)
                for g in v.groups:
                    if g.group in idx: nv[dl][idx[g.group]] = g.weight
            for p in me.polygons: bm.faces.new([vs[i] for i in p.vertices])
        bm.to_mesh(tmp.data); bm.free()
        for n in gruppen: tmp.vertex_groups.new(name=n)
        for n in gruppen: o.vertex_groups.new(name=n)
        m = o.modifiers.new('Gewichte', 'DATA_TRANSFER'); m.object = tmp; m.use_vert_data = True; m.data_types_verts = {'VGROUP_WEIGHTS'}
        m.vert_mapping = 'POLYINTERP_NEAREST'; m.layers_vgroup_select_src = 'ALL'; m.layers_vgroup_select_dst = 'NAME'
        bpy.context.view_layer.objects.active = o
        with bpy.context.temp_override(object=o, active_object=o): bpy.ops.object.modifier_apply(modifier=m.name)
        bpy.data.objects.remove(tmp, do_unlink=True)
    mw = o.matrix_world.copy(); o.parent = arm; o.matrix_world = mw
    am = o.modifiers.new('Skelett', 'ARMATURE'); am.object = arm
