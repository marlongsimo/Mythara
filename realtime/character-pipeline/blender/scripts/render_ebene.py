"""Eine Ebene einer Figur rendern: alle Animationen × 8 Richtungen, transparente PNGs, Tiefe je Bild, Manifest.
Aufruf: blender -b --python blender/scripts/render_ebene.py -- <figur> <ebene> [anims=a,b] [richtungen=S,N] [ziel=render]
  ebene: koerper:<region>  oder  item:<gegenstand-id>
Verdeckung (Holdout): Körperregionen verdecken sich gegenseitig; Gegenstände werden nur vom Körper verdeckt – nie von anderen Gegenständen,
damit jedes Teil mit jedem anderen kombinierbar bleibt. Die Reihenfolge zwischen Gegenständen ergibt sich im Spiel aus der Tiefe je Bild."""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mythara_figur import szene, konfig, kamera, animation, ausruestung
a = sys.argv[sys.argv.index('--') + 1:]; FID, EBENE = a[0], a[1]; opt = dict(x.split('=', 1) for x in a[2:])
FIG = konfig.figur(FID); SK = konfig.skelett(FIG['skelett']); R = konfig.render(); M = konfig.lade('configs/materialien.json'); LIB = konfig.bibliothek(FIG['animationen']['bibliothek'])
anims = opt['anims'].split(',') if opt.get('anims') else FIG['animationen']['liste']
richt = [r for r in R['richtungen'] if not opt.get('richtungen') or r['id'] in opt['richtungen'].split(',')]
art, name = EBENE.split(':', 1); sicher = EBENE.replace(':', '_')
ZIEL = os.path.join(konfig.pfad(opt.get('ziel', 'render')), FID, sicher); os.makedirs(ZIEL, exist_ok=True)
t0 = time.time(); szene.leeren()
ARM = szene.skelett_laden(SK); REG = szene.koerper_laden(FIG, ARM); SO = szene.sockel_anlegen(SK, ARM)
if FIG['koerper'].get('material'): szene.material_setzen([o for l in REG.values() for o in l], FIG['koerper']['material'], M)
koerper = [o for l in REG.values() for o in l]
if art == 'koerper':
    if name not in REG: raise SystemExit('Unbekannte Region ' + name)
    eigen = REG[name]
    for o in koerper: o.is_holdout = o not in eigen
    info = {'art': 'koerper', 'region': name}
elif art == 'item':
    G = konfig.gegenstand(name)
    if G.get('skeleton') != FIG['skelett']: raise SystemExit(f'{name}: Skelett {G.get("skeleton")} passt nicht zu {FIG["skelett"]}')
    eigen = ausruestung.laden(G, ARM, SO, REG, M)
    for o in koerper: o.is_holdout = True
    info = {'art': 'item', 'item': name, 'slot': G['slot'], 'testAsset': bool(G.get('testAsset'))}
else: raise SystemExit('ebene muss koerper:<region> oder item:<id> sein')
cam = kamera.aufbauen(R); fuss = kamera.fusspunkt_pixel(cam, R); s = bpy.context.scene
A = animation.bibliothek_laden(LIB, ARM, anims); man = {'schema': 'mythara-ebene/1', 'figur': FID, 'ebene': EBENE, **info, 'bild': R['bild'], 'fuss': fuss, 'fps': R['fps'],
    'pixelProMeter': R['pixelProMeter'], 'richtungen': [r['id'] for r in richt], 'animationen': {}, 'tiefe': {}, 'fehler': []}
n = 0
for an in anims:
    act, c, ber = A[an]
    if act is None: man['fehler'].append(f'{an}: {ber.get("fehler")}'); continue
    if c.get('amOrt'): animation.am_ort(act)
    animation.setzen(ARM, act); zeiten = animation.zeitpunkte(act, c, LIB['quellFps'], R['fps'])
    man['animationen'][an] = {'clip': c['clip'], 'frames': len(zeiten), 'fps': R['fps'], 'schleife': bool(c.get('schleife')), 'halten': bool(c.get('halten')), 'tempoMeterProSek': c.get('tempoMeterProSek'), 'pruefung': ber}
    man['tiefe'][an] = {}
    for r in richt:
        kamera.richtung(ARM, r['grad']); d = os.path.join(ZIEL, an, r['id']); os.makedirs(d, exist_ok=True); tl = []
        for i, t in enumerate(zeiten):
            animation.bild(t); s.render.filepath = os.path.join(d, f'{i:03d}.png'); bpy.ops.render.render(write_still=True); tl.append(kamera.tiefe(cam, eigen)); n += 1
        man['tiefe'][an][r['id']] = tl
man['hash'] = opt.get('hash'); man['bilder'] = n; man['sekunden'] = round(time.time() - t0, 1)
json.dump(man, open(os.path.join(ZIEL, 'ebene.json'), 'w'), indent=1); print('EBENE FERTIG', EBENE, n, 'Bilder', man['sekunden'], 's')
