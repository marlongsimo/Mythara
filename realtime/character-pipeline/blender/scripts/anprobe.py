"""Anprobe: Figur mit einer Ausrüstung in 3D zusammen rendern (zur Sichtkontrolle von Sitz, Bindung, Waffenhaltung). Keine Spiel-Sprites.
Aufruf: blender -b --python blender/scripts/anprobe.py -- <figur> <ausgabe.png> [gegenstand,gegenstand,...|standard] [groesse]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mythara_figur import szene, konfig, kamera, animation, ausruestung
a = sys.argv[sys.argv.index('--') + 1:]; FIG = konfig.figur(a[0]); aus = a[1]; wahl = a[2] if len(a) > 2 else 'standard'; gross = int(a[3]) if len(a) > 3 else 260
szene.leeren(); SK = konfig.skelett(FIG['skelett']); R = konfig.render(); M = konfig.lade('configs/materialien.json')
R['bild'] = {'breite': gross, 'hoehe': gross}; R['pixelProMeter'] = gross / 3.9
ARM = szene.skelett_laden(SK); REG = szene.koerper_laden(FIG, ARM); SO = szene.sockel_anlegen(SK, ARM)
szene.material_setzen([o for l in REG.values() for o in l], FIG['koerper']['material'], M)
ids = list(FIG['standardAusruestung'].values()) if wahl == 'standard' else [x for x in wahl.split(',') if x]
versteckt = set()
for i in ids:
    g = konfig.gegenstand(i); ausruestung.laden(g, ARM, SO, REG, M); versteckt |= set(g['hides']['regions'])
for r in versteckt:
    for o in REG[r]: o.hide_render = True
cam = kamera.aufbauen(R); A = animation.bibliothek_laden(konfig.bibliothek('kaykit_medium'), ARM, ['idle', 'walk', 'attack', 'block', 'hit', 'death'])
posen = [('idle', 90, 0), ('idle', 135, 0), ('walk', 45, 6), ('attack', 90, 12), ('attack', 0, 24), ('block', 135, 4), ('idle', 270, 0), ('death', 90, 19)]
from PIL import Image
bilder = []
for n, g, t in posen:
    animation.setzen(ARM, A[n][0]); kamera.richtung(ARM, g); animation.bild(t); p = aus + f'.{n}_{g}.png'; bpy.context.scene.render.filepath = p; bpy.ops.render.render(write_still=True); bilder.append(p)
print('ANPROBE', ' '.join(bilder))
