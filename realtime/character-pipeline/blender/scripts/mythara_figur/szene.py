"""Szene aufbauen: Grundskelett laden, Körperregionen an das Skelett binden, Sockel (Befestigungspunkte) anlegen, Materialien."""
import bpy, math, mathutils, os
from . import konfig

def leeren():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene; s.unit_settings.system = 'METRIC'; return s

def importieren(datei):
    """Ein 3D-Modell importieren (glb/gltf/fbx/obj/blend). Zurück: die neuen Objekte."""
    datei = konfig.pfad(datei); vor = set(bpy.data.objects); end = os.path.splitext(datei)[1].lower()
    if end in ('.glb', '.gltf'): bpy.ops.import_scene.gltf(filepath=datei)
    elif end == '.fbx': bpy.ops.import_scene.fbx(filepath=datei)
    elif end == '.obj': bpy.ops.wm.obj_import(filepath=datei)
    elif end == '.blend':
        with bpy.data.libraries.load(datei, link=False) as (q, z): z.objects = list(q.objects)
        for o in z.objects:
            if o is not None: bpy.context.scene.collection.objects.link(o)
    else: raise ValueError('Unbekanntes Format: ' + datei)
    return [o for o in bpy.data.objects if o not in vor]

def skelett_laden(sk):
    """Das Grundskelett eines Skeletts (configs/skelette) laden. Nur das Armature-Objekt bleibt, mitgelieferte Animationen werden verworfen."""
    neu = importieren(sk['quelle']['datei']); arm = next(o for o in neu if o.type == 'ARMATURE')
    for o in neu:
        if o is not arm: bpy.data.objects.remove(o, do_unlink=True)
    if arm.animation_data: arm.animation_data.action = None
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    arm.name = 'Skelett_' + sk['id']
    fehlt = [k for k in sk['knochen'] if k not in arm.data.bones]
    if fehlt: raise RuntimeError('Skelett unvollständig, es fehlen: ' + ', '.join(fehlt))
    return arm

def an_skelett_binden(obj, arm):
    """Ein gehäutetes Objekt auf das Grundskelett umhängen (gleiche Knochennamen)."""
    mw = obj.matrix_world.copy(); obj.parent = arm; obj.matrix_world = mw
    mods = [m for m in obj.modifiers if m.type == 'ARMATURE']
    if not mods: mods = [obj.modifiers.new('Skelett', 'ARMATURE')]
    for m in mods: m.object = arm

def koerper_laden(fig, arm):
    """Körper der Figur laden und nach Regionen ordnen. Zurück: {region: [objekte]}"""
    K = fig['koerper']; neu = importieren(K['datei'])
    alte = [o for o in neu if o.type == 'ARMATURE']; regionen = {}
    namen = {n: r for r, liste in K['regionen'].items() for n in liste}
    for o in neu:
        if o.type != 'MESH': continue
        if o.name in K.get('ignorieren', []) or o.name not in namen: bpy.data.objects.remove(o, do_unlink=True); continue
        an_skelett_binden(o, arm); regionen.setdefault(namen[o.name], []).append(o); o['mythara_ebene'] = 'koerper:' + namen[o.name]
    for a in alte: bpy.data.objects.remove(a, do_unlink=True)
    fehlt = [r for r in K['regionen'] if r not in regionen]
    if fehlt: raise RuntimeError('Körperregionen ohne Objekt: ' + ', '.join(fehlt))
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    return regionen

def sockel_anlegen(sk, arm):
    """Für jeden Sockel ein Empty am Knochen (mit Versatz und Drehung im Knochenraum). Zurück: {name: empty}"""
    aus = {}
    for name, s in sk['sockel'].items():
        e = bpy.data.objects.new('Sockel_' + name, None); e.empty_display_size = 0.05; bpy.context.scene.collection.objects.link(e)
        e.parent = arm; e.parent_type = 'BONE'; e.parent_bone = s['knochen']
        b = arm.data.bones[s['knochen']]
        # Blender hängt Knochen-Kinder an die Knochenspitze; der Sockel soll am Knochenanfang sitzen (wie in glTF)
        e.location = mathutils.Vector(s.get('versatz', [0, 0, 0])) - mathutils.Vector((0, b.length, 0))
        e.rotation_euler = [math.radians(v) for v in s.get('drehung', [0, 0, 0])]; aus[name] = e
    return aus

def material(name, M):
    """Material aus configs/materialien.json bauen (Grundfarbe, Rauheit, Metall, optional Leuchten)."""
    m = bpy.data.materials.get(name)
    if m is not None and m.get('mythara_bibliothek'): return m
    if name not in M: raise KeyError('Material fehlt in configs/materialien.json: ' + name)
    d = M[name]
    if m is None: m = bpy.data.materials.new(name)
    m.use_nodes = True; m['mythara_bibliothek'] = True  # auch gleichnamige, mitimportierte Materialien werden aus der Bibliothek befüllt
    b = m.node_tree.nodes.get('Principled BSDF') or m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (*d['farbe'], 1); b.inputs['Roughness'].default_value = d.get('rauheit', 0.6); b.inputs['Metallic'].default_value = d.get('metall', 0)
    if d.get('leuchten'):
        b.inputs['Emission Color'].default_value = (*d['leuchten'], 1); b.inputs['Emission Strength'].default_value = d.get('leuchtStaerke', 2)
    return m

def material_setzen(objs, name, M):
    m = material(name, M)
    for o in objs:
        o.data.materials.clear(); o.data.materials.append(m)
