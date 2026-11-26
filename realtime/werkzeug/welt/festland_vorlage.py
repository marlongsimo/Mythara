"""
World Pipeline – Vorlage für das erste Festland (26.11.2026): leitet aus einer gemalten Kontinentkarte (Bild, nicht im Repo) eine grobe
Datenkarte ab und legt sie als welt/festland/vorlage.png ab. Nur abgeleitete Werte, keine Bildinhalte:
  R = Land (0 Meer, 1 Fahle Weiten, 2 Smaragdküste, 3 Glutsande, 4 Ockerlande, 5 Weißes Ende, 6 Splitterlande-Umland)
  G = Gebirge (0 eben … 255 schroff)   B = Trockenheit (0 feucht … 128 mittel … 255 trocken)   A = Wald/Dunkelgrün (0 … 255)
Maßstab: halbe Kantenlänge, 13 Bildpunkte je Chunk; Chunk 192|198 (Nordwestecke der heutigen Karte) liegt bei Bildpunkt 110|640.
Ausschnitt: Chunks 186–260 × 155–253 (der Weltrahmen). Die Hochlande-Insel (Hochlande, Frostkrone, Drachenarm) wird zu Meer.
Aufruf: python3 werkzeug/welt/festland_vorlage.py <kontinentbild.jpg> [--pruefen bild.png]
"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ZIEL = os.path.normpath(os.path.join(HIER, '..', '..', 'welt', 'festland', 'vorlage.png'))
PX, SX, SY = 13.0, 110, 640
X0, X1, Y0, Y1 = 186, 261, 155, 254
LAENDER = [(1, (245, 520)), (2, (175, 900)), (3, (470, 900)), (4, (690, 1130)), (6, (265, 720))]
SUND = [(318, 330), (340, 352), (356, 385), (366, 415), (382, 442), (398, 470), (410, 500), (424, 528), (442, 552), (466, 584), (484, 604)]
HOCHLANDE = (590, 420)

def main():
    im = Image.open(sys.argv[1]).convert('RGB'); a = np.asarray(im).astype(np.float32); H, W = a.shape[:2]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; lum = 0.3 * r + 0.59 * g + 0.11 * b
    meer = (b > r + 8) & (b > g - 40)
    # Wolken (weiß, ungesättigt) verdecken Land wie Meer: dort gilt, was der nächste klar sichtbare Punkt ist
    sat = a.max(-1) - a.min(-1); wolke = ndimage.binary_dilation((a.min(-1) > 165) & (sat < 52), iterations=2)
    _, (iy, ix) = ndimage.distance_transform_edt(wolke, return_indices=True); meer = np.where(wolke, meer[iy, ix], meer)
    # wo große Wolken über offenem Wasser liegen, ist das Meer vorgegeben: das Splittermeer bis zum Ostmeer und das Ostmeer selbst
    see = Image.new('L', (W, H), 0); ds = ImageDraw.Draw(see)
    ds.polygon([(470, 600), (530, 588), (600, 572), (700, 552), (790, 556), (790, 712), (640, 710), (560, 706), (470, 700)], fill=255)
    ds.polygon([(705, 715), (860, 700), (880, 960), (705, 960)], fill=255)
    meer |= (np.asarray(see) > 0) & wolke
    fest = Image.new('L', (W, H), 0); ImageDraw.Draw(fest).polygon([(470, 560), (720, 548), (720, 688), (640, 698), (470, 690)], fill=255)
    meer |= np.asarray(fest) > 0                                   # Splittermeer: offen bis an die Nordküste der Glutsande
    # Beschriftungen der Vorlage (Ozean-Namen, Titel) sind kein Land
    schrift = Image.new('L', (W, H), 0); dsch = ImageDraw.Draw(schrift)
    for bx in [(52, 120, 252, 170), (636, 636, 846, 690), (804, 1244, 922, 1302), (70, 1170, 480, 1400)]: dsch.rectangle(bx, fill=255)
    rot = ndimage.binary_dilation((r > g + 55) & (r > b + 70), iterations=4)
    meer |= (np.asarray(schrift) > 0) & rot
    meer = ndimage.median_filter(meer, 7)
    # der Graue Sund (wie im Entwurf) und ein Schnitt durch die Nordwestbucht bis ins offene Meer
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for (x0, y0), (x1, y1) in zip(SUND, SUND[1:]): d.line([(x0, y0), (x1, y1)], fill=255, width=20)
    d.line([(SUND[0][0], SUND[0][1]), (270, 330), (215, 325), (150, 320)], fill=255, width=16)
    meer |= np.asarray(m) > 0
    land = ~meer
    lab, n = ndimage.label(land)
    weg = {lab[HOCHLANDE[1], HOCHLANDE[0]]}
    for k, (cy, cx) in enumerate(ndimage.center_of_mass(land, lab, range(1, n + 1)), 1):
        if cy < 330: weg.add(k)
    for k in weg: land[lab == k] = False
    land = ndimage.binary_opening(land, iterations=1)
    lab2, n2 = ndimage.label(land); groesse = ndimage.sum(land, lab2, range(1, n2 + 1))
    for k, gr in enumerate(groesse, 1):
        if gr < 260: land[lab2 == k] = False                   # Krümel (Wolkenreste) weg, echte kleine Inseln bleiben
    for k, (cy, cx) in enumerate(ndimage.center_of_mass(land, lab2, range(1, n2 + 1)), 1):
        if cx > 450 and cy < 650 and groesse[k - 1] < 20000: land[lab2 == k] = False   # Küstenreste der Hochlande-Insel im Splittermeer
    # Gebirge: Kontrast in mittlerer Größe (die Bergzeichen), Baumpunkte vorher weichgezeichnet
    weich = ndimage.gaussian_filter(lum, 1.6); band = np.abs(weich - ndimage.gaussian_filter(weich, 6))
    berg = ndimage.gaussian_filter(band, 5); berg[wolke] *= 0.4
    q = np.percentile(berg[land], [50, 97]); berg = np.clip((berg - q[0]) / (q[1] - q[0]), 0, 1)
    trocken = np.clip(128 + (r - g) * 4.5 + (lum - 150) * 0.6, 0, 255); trocken = ndimage.gaussian_filter(np.where(wolke, 128, trocken), 6)
    wald = np.clip((150 - lum) * 4, 0, 255); wald[wolke] = 0; wald = ndimage.gaussian_filter(wald, 4)
    # Länder: nächster Name (Splitterlande-Umland um die heutige Karte)
    yy, xx = np.mgrid[0:H, 0:W]; best = np.full((H, W), 1e12); welches = np.zeros((H, W), np.uint8)
    for k, (lx, ly) in LAENDER:
        dd = (xx - lx) ** 2 + (yy - ly) ** 2 * (1.0 if k != 6 else 1.6) - (9000 if k == 6 else 0)
        welches = np.where(dd < best, k, welches); best = np.minimum(best, dd)
    schnee = ndimage.binary_closing((a.min(-1) > 195) & (sat < 45), iterations=3) & (yy > 1225)   # das Weiße Ende: nur die Schneefläche ganz im Süden
    welches = np.where(schnee, 5, welches)
    klasse = np.where(land, welches, 0).astype(np.uint8)
    # Ausschnitt des Weltrahmens
    px0, py0 = int(SX + (X0 - 192) * PX), int(SY + (Y0 - 198) * PX); px1, py1 = int(SX + (X1 - 192) * PX), int(SY + (Y1 - 198) * PX)
    def aus(v): z = np.zeros((py1 - py0, px1 - px0), np.float32); ys, xs = slice(max(0, py0), min(H, py1)), slice(max(0, px0), min(W, px1)); z[ys.start - py0:ys.stop - py0, xs.start - px0:xs.stop - px0] = v[ys, xs]; return z
    rgba = np.dstack([aus(klasse), aus(berg * 255), aus(trocken), aus(wald)]).astype(np.uint8)
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True); Image.fromarray(rgba, 'RGBA').save(ZIEL)
    print(f'Vorlage {rgba.shape[1]} × {rgba.shape[0]} → {os.path.relpath(ZIEL, os.path.join(HIER, "..", ".."))}, Land: {(rgba[..., 0] > 0).mean():.0%}')
    if '--pruefen' in sys.argv:
        farben = np.array([(30, 80, 110), (150, 160, 110), (60, 130, 60), (220, 180, 110), (190, 140, 80), (235, 240, 245), (90, 140, 70)], np.uint8)
        v = farben[rgba[..., 0]].astype(np.float32); v *= (1 - 0.55 * rgba[..., 1:2] / 255)
        Image.fromarray(v.astype(np.uint8)).save(sys.argv[sys.argv.index('--pruefen') + 1])

if __name__ == '__main__':
    main()
