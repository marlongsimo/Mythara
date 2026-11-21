"""Mythara Fabrik – eine Haut (Textur) für den Kenney-Körper „characterMedium“ malen, mit Farbtönen aus den Teilbildern einer Figur.

  python3 fabrik/kenney_haut.py <grund-haut.png> <figur-ordner> <ziel.png> [bart]

grund-haut.png   eine der Kenney-Häute (CC0) – ihr Gesicht (Augen, Brauen) wird übernommen, alles andere übermalt
figur-ordner     Ordner mit referenz/teile/: kopf.png (Haar, Haut), untergewand.png, hose.png, stiefel.png
bart             zusätzlich einen Vollbart malen

Aufteilung der Kenney-Textur (1024 px, ermittelt aus den UV-Inseln des Modells):
  links oben (0–640, 0–490)     Kopf: Haar oben und an den Seiten, Gesicht in der Mitte (215–435, 150–365)
  links unten (0–640, 490–1024) Rumpf als Kreuz (oben Rücken, unten Brust) mit den Ärmeln links und rechts
  rechts oben (640–824, 0–500)  Schuhe mit Sohlen · rechts (824–1024 / 640–1024 bis 764) Hände
  rechts unten (613–1024, 764–) Hose
Die Ausrüstung (Rüstung, Umhang, Gürtel, Stiefel) kommt nicht in die Haut: sie sind eigene Ebenen der Fabrik.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw

grund, ordner, ziel = sys.argv[1:4]; BART = "bart" in sys.argv[4:]
def teil(n):
    im = Image.open(os.path.join(ordner, "referenz", "teile", n + ".png")).convert("RGBA"); a = np.asarray(im).astype(np.float32); return a[..., :3][a[..., 3] > 128]
def ton(P, hell=(0.0, 1.0)):
    """mittlerer Farbton der Bildpunkte in einem Helligkeitsband (Anteil 0..1 der sortierten Helligkeit)"""
    L = P.mean(1); o = np.argsort(L); P = P[o[int(hell[0] * len(o)):max(int(hell[0] * len(o)) + 1, int(hell[1] * len(o)))]]; return tuple(int(v) for v in np.median(P, 0))
kopf = teil("kopf"); L = kopf.mean(1); sat = kopf.max(1) - kopf.min(1)
HAAR = ton(kopf[(L < 110) & (sat > 25)], (0.3, 0.8)); HAUT = ton(kopf[(L > 150) & (sat > 40)], (0.3, 0.7))
HEMD = ton(teil("untergewand"), (0.35, 0.65)); HOSE = ton(teil("hose"), (0.45, 0.75)); SCHUH = ton(teil("stiefel"), (0.3, 0.6))
dunkel = lambda c, f: tuple(int(v * f) for v in c)
_h = next((a.split("=")[1] for a in sys.argv[4:] if a.startswith("haar=")), None)
if _h: HAAR = tuple(int(_h.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))                       # Haarfarbe wie die Frisur (eigenes Teil), damit Ränder nicht dunkler durchscheinen
print("Farben – Haar", HAAR, "Haut", HAUT, "Hemd", HEMD, "Hose", HOSE, "Schuh", SCHUH)

im = Image.open(grund).convert("RGB").resize((1024, 1024)); a = np.asarray(im).astype(np.int32)
a[(np.abs(a - np.array([245, 147, 115])).sum(2) < 70) | (np.abs(a - np.array([244, 140, 106])).sum(2) < 70)] = HAUT   # alle Hautflächen (auch die Hände) im Ton der Vorlage
kopfteil = a[:490, :640]
lum = kopfteil.mean(2)
augen = [(287, 221), (356, 221)]; yy, xx = np.mgrid[0:490, 0:640]; auge = np.zeros_like(lum, bool)
for ax, ay in augen: auge |= (xx - ax) ** 2 + (yy - ay) ** 2 < 11 ** 2
haar = (lum < 90) & ~auge; kopfteil[haar] = HAAR                                                 # Haar, Brauen, Schnurrbart: in der Haarfarbe
if "stirn" in sys.argv[4:]: kopfteil[132:192, 205:440] = HAUT          # Stirn frei (die Frisur ist ein eigenes Teil mit höherem Ansatz)
a[:490, :640] = kopfteil; im = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(im)
if BART:                                                                                         # Vollbart von Ohr zu Ohr, Mund frei
    d.polygon([(212, 228), (244, 232), (262, 266), (296, 280), (348, 280), (384, 266), (402, 232), (434, 228), (436, 300), (372, 368), (272, 368), (210, 300)], fill=HAAR)
    d.polygon([(300, 270), (322, 262), (346, 270), (340, 278), (304, 278)], fill=dunkel(HAAR, 0.7))   # Schnurrbart etwas dunkler
    d.line([(306, 291), (322, 295), (338, 291)], fill=(90, 40, 30), width=4)                    # Mund
for ax, ay in augen: d.ellipse([ax - 8, ay - 8, ax + 8, ay + 8], fill=(30, 22, 20))              # Augen bleiben dunkel
d.rectangle([0, 490, 640, 1024], fill=HEMD)                                                       # Rumpf und Ärmel: Untergewand
for x0 in (0, 585): d.rectangle([x0, 490, x0 + 55, 1024], fill=dunkel(HEMD, 0.8))
for x0 in (30, 580): d.rectangle([x0, 660, x0 + 30, 815], fill=dunkel(HEMD, 0.75))                 # Ärmelsaum am Handgelenk
d.polygon([(300, 725), (345, 725), (322, 770)], fill=HAUT)                                        # Halsausschnitt vorn
d.rectangle([160, 950, 483, 1000], fill=dunkel(HEMD, 0.82))                                       # Saum
d.rectangle([613, 764, 1024, 1024], fill=HOSE)                                                    # Hose
d.rectangle([640, 0, 824, 520], fill=dunkel(SCHUH, 0.55))                                          # Sohlen und Schuhe
for y0 in (150, 325): d.rectangle([660, y0, 805, y0 + 150], fill=SCHUH)
im.save(ziel); print("geschrieben:", ziel)
