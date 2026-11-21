"""
World Pipeline – Kenney-Modelle (CC0) in der Ansicht der Welt rendern und mit unseren Materialien bemalen.

  python3 werkzeug/welt/kenney.py [kennung …] [--vorschau bild.png]

Die Modelle (OBJ, Kenney-Baukästen, Lizenz CC0: werkzeug/welt/kenney/*/License.txt) liefern nur die Form. Aus der Farbe jeder Fläche
in Kenneys Farbtafel wird das Material bestimmt (Stein, Dach, Holz, Metall, Öffnung) und mit unseren eigenen, gerechneten Texturen gemalt
(gebaeude.tex: quader, schiefer, holz – ohne Bildvorlage). So passt das Ergebnis zu den räumlichen Gebäuden der Welt.

Ansicht wie die Gebäude: schräge Parallelprojektion, Bildpunkt = ((x + 0,32·d)·48, −(d + z)·48) relativ zum Fuß (x Osten, d Norden, z oben, Felder).
Gerendert wird mit Tiefenpuffer je Bildpunkt; die Texturen liegen in Weltkoordinaten (je nach Lage der Fläche x/z, d/z oder x/d), damit
Mauerwerk über die vielen kleinen Flächen der Modelle durchläuft. Dazu Licht wie bei den Gebäuden, weicher Schatten, dunkle Kontur.

Schreibt img/welt/gebaeude/kenney/<kennung>.webp und den Eintrag in welt/bibliothek/objekte.json.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import haus3d                       # noqa: E402  (Licht)
from gebaeude import tex            # noqa: E402  (unsere Texturen)

REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
BIB = os.path.join(REALTIME, 'welt', 'bibliothek', 'objekte.json')
ZIEL = os.path.join(WURZEL, 'img', 'welt', 'gebaeude', 'kenney')
F, K, KX = 48, 2, 0.32

# Modelle: Teile übereinander (Datei, Höhe des Teils in Kenney-Einheiten wird aus dem Modell gelesen), Maßstab in Feldern je Einheit
MODELLE = {
    'burg_turm_01': dict(name='Burgturm (Kenney-Form)', paket='castle', teile=['tower-square-mid-door', 'tower-square-mid-windows', 'tower-square-top-roof-high'], mass=3.0, dreh=-90, saat=41),
}
# Material aus der Farbe der Farbtafel: (Textur, Maßstab der Textur) oder eine feste Farbe
def material(rgb):
    r, g, b = [float(c) for c in rgb]; m = (r + g + b) / 3
    if m < 95:
        return ('farbe', (34, 28, 30))                 # Öffnung: Fenster, Tür, Schießscharte
    if b > r + 40:
        return ('schiefer', 0.12)                      # Dach
    if b >= r and r > 140:
        return ('farbe', (118, 122, 132))              # Metall
    if r > 185 and r > g > b:
        return ('quader', 0.24)                        # Stein
    if r > g > b:
        return ('holz', 0.1)                           # Holz
    return ('farbe', tuple(int(c) for c in rgb))


def lade(pfad):
    v, vt, flaechen = [], [], []
    for z in open(pfad, encoding='utf8', errors='ignore'):
        t = z.split()
        if not t:
            continue
        if t[0] == 'v':
            v.append([float(a) for a in t[1:4]])
        elif t[0] == 'vt':
            vt.append([float(a) for a in t[1:3]])
        elif t[0] == 'f':
            ii = [p.split('/') for p in t[1:]]
            flaechen.append(([int(p[0]) - 1 for p in ii], [int(p[1]) - 1 if len(p) > 1 and p[1] else -1 for p in ii]))
    return np.array(v, dtype=np.float64), np.array(vt if vt else [[0.5, 0.5]], dtype=np.float64), flaechen


def dreiecke(M):
    """Alle Teile übereinander: Liste (Ecken in Weltfeldern 3×3, Farbe aus der Tafel)"""
    ordner = os.path.join(HIER, 'kenney', M['paket'])
    tafel = np.asarray(Image.open(os.path.join(ordner, 'colormap.png')).convert('RGB'))
    aus, z0 = [], 0.0
    for teil in M['teile']:
        v, vt, fl = lade(os.path.join(ordner, teil + '.obj'))
        P = np.stack([v[:, 0], -v[:, 2], v[:, 1] - v[:, 1].min() + z0], 1) * M['mass']   # OBJ: y oben, −z nach Norden
        if M.get('dreh'):                                                                 # um die senkrechte Achse drehen (Grad, gegen den Uhrzeigersinn von oben)
            w = math.radians(M['dreh']); c, si = math.cos(w), math.sin(w); P = np.stack([P[:, 0] * c - P[:, 1] * si, P[:, 0] * si + P[:, 1] * c, P[:, 2]], 1)
        for fi, ti in fl:
            uv = vt[[t for t in ti if t >= 0]].mean(0) if any(t >= 0 for t in ti) else np.array([0.5, 0.5])
            farbe = tafel[int(min(tafel.shape[0] - 1, max(0, (1 - uv[1]) * tafel.shape[0]))), int(min(tafel.shape[1] - 1, max(0, uv[0] * tafel.shape[1])))]
            for k in range(1, len(fi) - 1):
                aus.append((P[[fi[0], fi[k], fi[k + 1]]], farbe))
        z0 += (v[:, 1].max() - v[:, 1].min()) * 0.985          # das nächste Teil sitzt (mit einer Spur Überlappung) darauf
    return aus


def render(M):
    tris = dreiecke(M)
    alle = np.concatenate([t[0] for t in tris])
    fuss = np.array([(alle[:, 0].min() + alle[:, 0].max()) / 2, alle[:, 1].min(), 0.0])   # Mitte der Südkante
    S = lambda P: np.stack([(P[:, 0] - fuss[0] + KX * (P[:, 1] - fuss[1])) * F, -((P[:, 1] - fuss[1]) + P[:, 2]) * F], 1)
    sa = S(alle); rand = 40
    x0, y0 = sa[:, 0].min() - rand, sa[:, 1].min() - rand; W, H = int(sa[:, 0].max() - x0 + rand), int(sa[:, 1].max() - y0 + rand)
    bild = np.zeros((H * K, W * K, 3), np.float32); tiefe = np.full((H * K, W * K), np.inf, np.float32); deck = np.zeros((H * K, W * K), np.float32)
    licht = np.array(haus3d.LICHT, dtype=np.float64)
    blick = np.array([-KX, 1.0, -1.0])
    for P, farbe in tris:
        n = np.cross(P[1] - P[0], P[2] - P[0]); ln = np.linalg.norm(n)
        if ln < 1e-12 or np.dot(n, blick) > 0:            # Rückseiten weglassen
            continue
        n = n / ln
        s = (S(P) - [x0, y0]) * K
        bx0, by0 = max(0, int(s[:, 0].min())), max(0, int(s[:, 1].min())); bx1, by1 = min(W * K - 1, int(s[:, 0].max()) + 1), min(H * K - 1, int(s[:, 1].max()) + 1)
        if bx1 < bx0 or by1 < by0:
            continue
        gx, gy = np.meshgrid(np.arange(bx0, bx1 + 1) + 0.5, np.arange(by0, by1 + 1) + 0.5)
        (ax, ay), (bxx, byy), (cx, cy) = s
        den = (byy - cy) * (ax - cx) + (cx - bxx) * (ay - cy)
        if abs(den) < 1e-9:
            continue
        l1 = ((byy - cy) * (gx - cx) + (cx - bxx) * (gy - cy)) / den; l2 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den; l3 = 1 - l1 - l2
        innen = (l1 >= -1e-4) & (l2 >= -1e-4) & (l3 >= -1e-4)
        if not innen.any():
            continue
        Wp = l1[..., None] * P[0] + l2[..., None] * P[1] + l3[..., None] * P[2]          # Weltpunkt je Bildpunkt
        t = Wp[..., 1] - Wp[..., 2]                                                     # Tiefe: kleiner = näher am Betrachter
        ausschnitt = (slice(by0, by1 + 1), slice(bx0, bx1 + 1))
        neu = innen & (t < tiefe[ausschnitt] - 1e-6)
        if not neu.any():
            continue
        art = material(farbe)
        if art[0] == 'farbe':
            c = np.broadcast_to(np.array(art[1], np.float32), Wp.shape)
        else:
            T = tex(art[0]).astype(np.float32); m = art[1]; a = np.abs(n)
            if a[2] >= a[0] and a[2] >= a[1]:
                u, v = Wp[..., 0], -Wp[..., 1]
            elif a[1] >= a[0]:
                u, v = Wp[..., 0], -Wp[..., 2]
            else:
                u, v = Wp[..., 1], -Wp[..., 2]
            if art[0] == 'schiefer' and a[2] < 0.97:                                   # Dachflächen: Reihen laufen entlang der Traufe
                u, v = (Wp[..., 0] if a[0] < a[1] else Wp[..., 1]), -(Wp[..., 2] + Wp[..., 1] * 0.0)
            px = ((u * F / m) % T.shape[1]).astype(int); py = ((v * F / m) % T.shape[0]).astype(int)
            hellw = float(np.mean(farbe)) / 168.0                                       # Abstufungen der Tafel (Zierkanten) bleiben sichtbar
            c = T[py, px] * min(1.18, max(0.82, hellw))
        h = 0.5 + 0.62 * max(0.0, float(n @ licht))
        bild[ausschnitt][neu] = np.clip(c[neu] * h, 0, 255)
        tiefe[ausschnitt][neu] = t[neu]; deck[ausschnitt][neu] = 1
    # Schatten: Grundriss nach Nordosten versetzt, weich
    a = Image.fromarray((deck * 255).astype(np.uint8))
    rgba = np.dstack([bild, deck * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    gx0, gx1 = alle[:, 0].min(), alle[:, 0].max(); gd0, gd1 = alle[:, 1].min(), alle[:, 1].max(); hz = alle[:, 2].max()
    from PIL import ImageDraw
    sch = Image.new('L', im.size, 0); d = ImageDraw.Draw(sch)
    ecken = np.array([[gx0, gd0, 0], [gx1 + 0.25 * hz * 0.4, gd0, 0], [gx1 + 0.35 * hz * 0.4, gd1 + 0.3 * hz * 0.4, 0], [gx0 + 0.1, gd1 + 0.3 * hz * 0.4, 0]])
    d.polygon([tuple(p) for p in ((S(ecken) - [x0, y0]) * K)], fill=150)
    sch = np.asarray(sch.filter(ImageFilter.GaussianBlur(9 * K))).astype(np.float32) / 255 * 0.55
    sch = sch * (1 - deck)
    unten = np.zeros((im.height, im.width, 4), np.float32); unten[..., :3] = (10, 12, 6); unten[..., 3] = sch * 255
    im = Image.alpha_composite(Image.fromarray(unten.astype(np.uint8), 'RGBA'), im)
    # dunkle Kontur außen
    al = np.asarray(a).astype(np.float32); aussen = np.asarray(a.filter(ImageFilter.MaxFilter(3))).astype(np.float32) - al
    kontur = np.zeros((im.height, im.width, 4), np.uint8); kontur[..., :3] = 24; kontur[..., 3] = np.clip(aussen * 0.6, 0, 255).astype(np.uint8)
    im = Image.alpha_composite(im, Image.fromarray(kontur, 'RGBA'))
    im = im.resize((W, H), Image.LANCZOS)
    fx, fy = -x0, -y0
    return im, [round(fx / W, 4), round(fy / H, 4)], (gx1 - gx0, gd1 - gd0)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    vorschau = sys.argv[sys.argv.index('--vorschau') + 1] if '--vorschau' in sys.argv else None
    if vorschau:
        args = [a for a in args if a != vorschau]
    bib = json.load(open(BIB, encoding='utf8')); bilder = []
    for kennung in args or list(MODELLE):
        M = MODELLE[kennung]; im, anker, (b, t) = render(M)
        os.makedirs(ZIEL, exist_ok=True); im.save(os.path.join(ZIEL, kennung + '.webp'), quality=90, method=6)
        a = np.asarray(im.getchannel('A')) > 200; ys, xs = np.where(a)
        eintrag = {'id': kennung, 'name': M['name'], 'kategorie': 'gebaeude', 'bild': f'img/welt/gebaeude/kenney/{kennung}.webp', 'groesse': [im.width, im.height],
                   'anker': anker, 'massstab': 1, 'kollision': {'art': 'rechteck', 'x': round(-b / 2, 2), 'y': round(-t, 2), 'b': round(b, 2), 'h': round(t, 2)}, 'tiefe': 'fuss',
                   'durchscheinend': True, 'interaktion': None, 'sichtbar': [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1],
                   'herkunft': f'Form: Kenney {M["paket"]} kit (CC0, werkzeug/welt/kenney/{M["paket"]}/License.txt); Texturen selbst gerechnet (gebaeude.tex) – frei verwendbar'}
        bib['objekte'] = [o for o in bib['objekte'] if o['id'] != kennung] + [eintrag]; bilder.append(im)
        print(f'  {kennung}: {im.width} × {im.height} px, Grundfläche {b:.1f} × {t:.1f} Felder')
    with open(BIB, 'w', encoding='utf8') as f:
        json.dump(bib, f, ensure_ascii=False, indent=1); f.write('\n')
    if vorschau:
        G = Image.new('RGB', (sum(i.width for i in bilder) + 40 * (len(bilder) + 1), max(i.height for i in bilder) + 40), (96, 134, 62)); x = 40
        for i in bilder:
            G.paste(i, (x, G.height - 20 - i.height), i); x += i.width + 40
        G.save(vorschau)


if __name__ == '__main__':
    main()
