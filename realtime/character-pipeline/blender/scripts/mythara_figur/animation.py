"""Animationsbibliothek: Clips laden, auf das Grundskelett legen, prüfen (Skelett, Länge, Wurzelbewegung) und Abtastzeitpunkte bestimmen."""
import bpy, re, math
from . import konfig, szene

def bibliothek_laden(lib, arm, wahl):
    """Die gewünschten Clips (Spielnamen) aus den Dateien der Bibliothek holen. Zurück: {spielname: (action, clipdef, bericht)}"""
    aus = {}; dateien = {}
    for name in wahl:
        c = lib['clips'].get(name)
        if not c: aus[name] = (None, None, {'fehler': 'Clip nicht in der Bibliothek'}); continue
        dateien.setdefault(c['datei'], []).append(name)
    for d, namen in dateien.items():
        vor = set(bpy.data.actions); neu = szene.importieren(lib['dateien'][d])
        for o in neu: bpy.data.objects.remove(o, do_unlink=True)
        geladen = [a for a in bpy.data.actions if a not in vor]
        for name in namen:
            c = lib['clips'][name]; muster = re.compile('^' + re.escape(c['clip']) + r'(_Rig_[A-Za-z]+(\.\d+)?)?$')
            a = next((x for x in geladen if muster.match(x.name)), None)
            if not a: aus[name] = (None, c, {'fehler': 'Clip ' + c['clip'] + ' nicht gefunden'}); continue
            a = a.copy(); a.name = 'Anim_' + name; a.use_fake_user = True; zuordnen(a, lib)
            aus[name] = (a, c, pruefen(a, c, arm, lib))
        for a in geladen: bpy.data.actions.remove(a)
    return aus

def pruefen(a, c, arm, lib):
    """Skelettverträglichkeit, Länge und Wurzelbewegung eines Clips."""
    knochen = set(re.findall(r'pose\.bones\["([^"]+)"\]', ' '.join(fc.data_path for fc in a.fcurves)))
    fehlt = sorted(k for k in knochen if k not in arm.data.bones)
    s, e = a.frame_range; wurzel = {}
    for fc in a.fcurves:
        if fc.data_path == 'pose.bones["root"].location':
            vs = [k.co[1] for k in fc.keyframe_points]; wurzel['xyz'[fc.array_index]] = round(max(vs) - min(vs), 3)
    return {'knochen': len(knochen), 'fehlendeKnochen': fehlt, 'vertraeglich': len(fehlt) == 0, 'quellBilder': [int(s), int(e)], 'sekunden': round((e - s) / lib['quellFps'], 3), 'wurzelBewegung': wurzel}

def zuordnen(a, lib):
    """Fremde Knochennamen auf das Grundskelett umschreiben (lib.knochenZuordnung). Gleiche Ruhepose vorausgesetzt."""
    Z = lib.get('knochenZuordnung') or {}
    if not Z: return
    for fc in a.fcurves:
        m = re.match(r'pose\.bones\["([^"]+)"\](.*)', fc.data_path)
        if m and m.group(1) in Z: fc.data_path = f'pose.bones["{Z[m.group(1)]}"]{m.group(2)}'

def sockel_fest(a, knochen):
    """Diese Knochen nicht animieren (Ruhelage relativ zum Elternknochen) – z. B. Waffe bleibt in der Hand."""
    for fc in list(a.fcurves):
        m = re.match(r'pose\.bones\["([^"]+)"\]', fc.data_path)
        if m and m.group(1) in knochen: a.fcurves.remove(fc)

def am_ort(a):
    """Waagerechte Bewegung des Wurzelknochens entfernen (die Position bestimmt im Spiel der Server)."""
    for fc in list(a.fcurves):
        if fc.data_path == 'pose.bones["root"].location': a.fcurves.remove(fc)

def zeitpunkte(a, c, quell_fps, fps):
    """Abtastzeitpunkte (Quellbilder, auch Bruchteile) für die Ziel-Bildrate. Schleifen ohne doppeltes Schlussbild."""
    s, e = a.frame_range; laenge = e - s; n = max(1, round(laenge / quell_fps * fps))
    if c.get('schleife'): return [s + laenge * i / n for i in range(n)]
    return [s + laenge * i / n for i in range(n + 1)]

def setzen(arm, a):
    if not arm.animation_data: arm.animation_data_create()
    arm.animation_data.action = a

def bild(t):
    bpy.context.scene.frame_set(int(math.floor(t)), subframe=t - math.floor(t))
