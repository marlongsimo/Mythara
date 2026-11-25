#!/usr/bin/env python3
"""App-Icon (1024×1024, ohne Transparenz – Apple verlangt das) und Startbild (2732×2732) für iOS aus den vorhandenen Riftmere-Bildern."""
import os
from PIL import Image
W = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
A = os.path.join(W, 'app', 'ios', 'App', 'App', 'Assets.xcassets')
# Icon: das „R“ mit Goldrahmen; knapp beschnitten, damit der Rahmen fast an iOS' runde Maske stößt; Ecken dunkel füllen
i = Image.open(os.path.join(W, 'img', 'app', 'mythara-512.png')).convert('RGBA').crop((10, 10, 502, 502)).resize((1024, 1024), Image.LANCZOS)
g = Image.new('RGBA', i.size, (12, 16, 34, 255)); g.alpha_composite(i)
g.convert('RGB').save(os.path.join(A, 'AppIcon.appiconset', 'AppIcon-512@2x.png'))
# Startbild: Hintergrund mit Logo, mittig auf 2732² (iOS schneidet je nach Gerät zu)
h = Image.open(os.path.join(W, 'img', 'echtzeit', 'start', 'hintergrund.webp')).convert('RGB')
s = 2732 / h.height; h = h.resize((round(h.width * s), 2732), Image.LANCZOS); x = (h.width - 2732) // 2; h = h.crop((x, 0, x + 2732, 2732))
import glob, json
for f in glob.glob(os.path.join(A, 'Splash.imageset', 'splash-*')): os.remove(f)
h.resize((1600, 1600), Image.LANCZOS).save(os.path.join(A, 'Splash.imageset', 'splash.jpg'), quality=86, optimize=True)   # ein Bild reicht (wird skaliert), klein halten
json.dump({'images': [{'idiom': 'universal', 'filename': 'splash.jpg', 'scale': '1x'}, {'idiom': 'universal', 'scale': '2x'}, {'idiom': 'universal', 'scale': '3x'}], 'info': {'version': 1, 'author': 'xcode'}},
          open(os.path.join(A, 'Splash.imageset', 'Contents.json'), 'w'), indent=2)
print('Icon und Startbild geschrieben')
