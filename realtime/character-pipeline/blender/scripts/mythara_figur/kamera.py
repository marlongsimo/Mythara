"""Einheitlicher Kamerastandard (orthografisch, aus Süden, schräg von oben), Licht und Blickrichtungen."""
import bpy, math, mathutils
from bpy_extras.object_utils import world_to_camera_view

def aufbauen(R):
    s = bpy.context.scene; B = R['bild']; F = R['fusspunkt']; ppm = R['pixelProMeter']; el = math.radians(R['kamera']['hoehenwinkelGrad'])
    s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = B['breite'], B['hoehe'], 100
    cam = bpy.data.objects.new('Kamera', bpy.data.cameras.new('Kamera')); s.collection.objects.link(cam); s.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(B['breite'], B['hoehe']) / ppm; cam.data.clip_start = 0.1; cam.data.clip_end = 200
    d = mathutils.Vector((0, -math.cos(el), math.sin(el)))                     # aus Süden (−Y), schräg von oben
    cam.location = d * 40; cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    gross = max(B['breite'], B['hoehe'])
    cam.data.shift_x = (0.5 - F['x']) * B['breite'] / gross                    # der Fußpunkt (Weltursprung) landet an fusspunkt.x/y
    cam.data.shift_y = (F['y'] - 0.5) * B['hoehe'] / gross
    bpy.context.view_layer.update()
    # Licht
    L = R['licht']; so = L['sonne']; sun = bpy.data.objects.new('Sonne', bpy.data.lights.new('Sonne', 'SUN')); s.collection.objects.link(sun)
    sun.data.energy = so['staerke']; sun.data.color = so['farbe']; sun.data.angle = 0.2
    sun.rotation_euler = (math.radians(90 - so['hoeheGrad']), 0, math.radians(so['richtungGrad']))
    w = bpy.data.worlds.new('Himmel'); s.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (*L['himmel']['farbe'], 1); bg.inputs[1].default_value = L['himmel']['staerke']
    # Renderer
    E = R['renderer']; s.render.engine = E['engine']; s.render.film_transparent = True; s.view_settings.view_transform = E['sichtTransform']; s.view_settings.look = 'None'
    if E['engine'] == 'CYCLES': s.cycles.samples = E['samples']; s.cycles.use_denoising = False; s.cycles.device = 'CPU'; s.cycles.max_bounces = 3; s.cycles.filter_width = E.get('kantenglaettung', 1.5)
    s.render.image_settings.file_format = 'PNG'; s.render.image_settings.color_mode = 'RGBA'; s.render.image_settings.compression = 30
    return cam

def fusspunkt_pixel(cam, R):
    """Wo der Weltursprung (Fußpunkt) im Bild landet – zur Kontrolle, in Pixeln von oben links."""
    s = bpy.context.scene; v = world_to_camera_view(s, cam, mathutils.Vector((0, 0, 0)))
    return [round(v.x * R['bild']['breite'], 2), round((1 - v.y) * R['bild']['hoehe'], 2)]

def richtung(arm, grad):
    """Figur in Spielrichtung drehen. Spiel: 0 = Osten, 90 = Süden (y nach unten). Die Figur blickt in Ruhe nach Süden (−Y in Blender)."""
    arm.rotation_mode = 'XYZ'; arm.rotation_euler = (0, 0, math.radians(90 - grad))

def tiefe(cam, objs):
    """Mittlere Entfernung der sichtbaren Geometrie zur Kamera (für die Reihenfolge der Ausrüstungsebenen). Größer = weiter hinten."""
    dg = bpy.context.evaluated_depsgraph_get(); blick = cam.matrix_world.to_quaternion() @ mathutils.Vector((0, 0, -1)); summe = 0.0; n = 0
    for o in objs:
        e = o.evaluated_get(dg); me = e.to_mesh(); mw = e.matrix_world
        for v in me.vertices: summe += (mw @ v.co - cam.location).dot(blick); n += 1
        e.to_mesh_clear()
    return round(summe / n, 4) if n else None
