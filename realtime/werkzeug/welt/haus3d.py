"""
World Pipeline – Prototyp: räumliches Wohnhaus aus einem kleinen 3D-Modell (Prüfung „isometrisch oder frontal?“).

  python3 werkzeug/welt/haus3d.py <zielordner>

Das Haus ist ein Quader mit Satteldach, Tür, Fenstern und Kamin, gemessen in Rechenfeldern (1 Feld = 48 Bildpunkte).
Es wird mit einer wählbaren Parallelprojektion gezeichnet und in Ebenen zerlegt, die das Spiel einzeln sortiert und ausblendet:
  innen (Boden und Innenwände) · seite (östliche Außenwand mit Giebel) · vorn (Vorderwand) · dach · tuer_zu / tuer_offen · fenster

Projektionen:
  schraeg – passt zur Kamera der Welt: Der Boden ist eine echte Draufsicht (Norden = oben, 1 Feld Tiefe = 48 px nach oben),
            Höhen gehen ebenfalls nach oben. Mit der Scherung kx läuft die Tiefe leicht nach rechts: So wird die Ostwand sichtbar.
  iso     – klassische 2:1-Isometrie, Haus um 45 Grad gedreht (nur zum Vergleich, als ein einziges Bild)
Ergebnis: <zielordner>/haus3d_*.webp und haus3d.json (Maße, Ebenen, Fußpunkt, Kollision, Tür).
Die Texturen kommen aus werkzeug/welt/texturen/ (Lizenz ungeklärt, siehe doku/world-pipeline/QUELLEN.md).
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
from haus import tex, faerben  # noqa: E402  (Texturen und Einfärben wie beim Hausgenerator)

FELD, K = 48, 2                    # Bildpunkte je Feld, Rechengröße
LICHT = np.array([-0.45, -0.55, 0.70])   # Licht von links, aus Süden, von oben (x Ost, y Süd, z oben)
LICHT = LICHT / np.linalg.norm(LICHT)

# Das Modell in Feldern: Breite (Ost), Tiefe (Nord), Wandhöhe, Firsthöhe über der Wand, Überstand vorn/hinten und seitlich, Wandstärke
M = dict(W=5.0, D=4.0, H=2.45, R=1.7, ue=0.4, us=0.3, t=0.22,
         tuer=dict(x=1.45, b=1.05, h=1.95),                    # Mitte, Breite, Höhe – größer als der Held (1,75)
         fenster=[dict(x=3.55, z=1.0, b=0.95, h=0.85)],          # Vorderwand
         seitenfenster=[dict(d=2.0, z=1.0, b=0.9, h=0.8)],       # Ostwand
         kamin=dict(x=3.9, d=2.6, b=0.55))


class Projektion:
    def __init__(self, art, kx=0.32, kz=1.0):
        self.art, self.kx, self.kz = art, kx, kz

    def __call__(self, x, d, z):
        """3D (x nach Osten, d nach Norden ab der Vorderwand, z nach oben) → Bildpunkte relativ zur vorderen linken Ecke am Boden"""
        if self.art == 'schraeg':
            return x * FELD + self.kx * d * FELD, -d * FELD - z * FELD * self.kz
        # iso: um 45° gedreht, 2:1
        c = math.sqrt(0.5)
        u, v = (x - M['W'] / 2) * c - (d - M['D'] / 2) * c, (x - M['W'] / 2) * c + (d - M['D'] / 2) * c
        return u * FELD * 1.0, -v * FELD * 0.5 - z * FELD * self.kz * 0.82


class Bild:
    """Eine Ebene in Rechengröße mit gemeinsamem Rahmen"""
    def __init__(self, b, h, ox, oy):
        self.b, self.h, self.ox, self.oy = b, h, ox, oy
        self.im = Image.new('RGBA', (b * K, h * K), (0, 0, 0, 0))

    def p(self, xy):
        return ((xy[0] + self.ox) * K, (xy[1] + self.oy) * K)

    def flaeche(self, P, ecken3d, textur, hell=1.0, tex_mass=0.1, drehen=False, farbe=None, ton=None):
        """Eine ebene Fläche (3 oder 4 Ecken, 3D) mit Textur füllen. Die ersten drei Ecken spannen die Abbildung auf: e0→e1 = u, e0→e3 (oder e2) = v."""
        pts = [self.p(P(*e)) for e in ecken3d]
        o, a = np.array(pts[0]), np.array(pts[1])
        bb = np.array(pts[3] if len(pts) == 4 else pts[2])
        Lu = max(4, int(np.linalg.norm(a - o))); Lv = max(4, int(np.linalg.norm(bb - o)))
        # Textur kacheln, so groß wie die Fläche (in Rechengröße)
        t = tex(textur).astype(np.uint8)
        ti = Image.fromarray(t)
        ti = ti.resize((max(8, int(ti.width * tex_mass * K)), max(8, int(ti.height * tex_mass * K))), Image.LANCZOS)
        if drehen:
            ti = ti.rotate(90, expand=True)
        tt = np.asarray(ti)
        ys, xs = np.arange(Lv) % tt.shape[0], np.arange(Lu) % tt.shape[1]
        kach = tt[ys][:, xs].astype(np.float32)
        if farbe is not None:
            kach = faerben(kach, farbe)
        if ton is not None:   # Verlauf entlang v (0 = Kante e0→e1, 1 = gegenüber): Faktor von ton[0] nach ton[1]
            kach = kach * np.linspace(ton[0], ton[1], Lv, dtype=np.float32)[:, None, None]
        kach = np.clip(kach * hell, 0, 255).astype(np.uint8)
        quelle = Image.fromarray(kach)
        # Abbildung: Bildpunkt (X, Y) → (u, v) in der Kachel
        A = np.array([[(a - o)[0] / Lu, (bb - o)[0] / Lv], [(a - o)[1] / Lu, (bb - o)[1] / Lv]])
        if abs(np.linalg.det(A)) < 1e-6:     # die Fläche liegt genau in Blickrichtung: unsichtbar
            return pts
        Ai = np.linalg.inv(A)
        c = -Ai @ o
        bild = quelle.transform(self.im.size, Image.AFFINE, (Ai[0, 0], Ai[0, 1], c[0], Ai[1, 0], Ai[1, 1], c[1]), resample=Image.BICUBIC)
        maske = Image.new('L', self.im.size, 0)
        ImageDraw.Draw(maske).polygon(pts, fill=255)
        lage = Image.new('RGBA', self.im.size, (0, 0, 0, 0)); lage.paste(bild.convert('RGBA'), (0, 0), maske)
        self.im = Image.alpha_composite(self.im, lage)
        return pts

    def vieleck(self, P, ecken3d, farbe, alpha=255):
        pts = [self.p(P(*e)) for e in ecken3d]
        lage = Image.new('RGBA', self.im.size, (0, 0, 0, 0)); ImageDraw.Draw(lage).polygon(pts, fill=tuple(int(v) for v in farbe) + (alpha,))
        self.im = Image.alpha_composite(self.im, lage)

    def linie(self, P, punkte3d, farbe, breite, alpha=255):
        lage = Image.new('RGBA', self.im.size, (0, 0, 0, 0))
        ImageDraw.Draw(lage).line([self.p(P(*e)) for e in punkte3d], fill=tuple(int(v) for v in farbe) + (alpha,), width=int(breite * K), joint='curve')
        self.im = Image.alpha_composite(self.im, lage)

    def fertig(self, malen=True):
        """Kontur und ein leichter Malfilter (fasst Farbflächen zusammen wie Pinselstriche), dann auf Zielgröße"""
        im = self.im
        if malen:
            rgb = im.convert('RGB').filter(ImageFilter.ModeFilter(5)).filter(ImageFilter.SMOOTH_MORE)
            im = Image.merge('RGBA', (*rgb.split(), im.getchannel('A')))
        a = im.getchannel('A')
        rand = np.asarray(a.filter(ImageFilter.MaxFilter(3))).astype(np.float32) - np.asarray(a).astype(np.float32)
        kontur = Image.fromarray(np.dstack([np.full((im.height, im.width, 3), 26, np.uint8), np.clip(rand * 0.6, 0, 255).astype(np.uint8)]), 'RGBA')
        return Image.alpha_composite(kontur, im).resize((self.b, self.h), Image.LANCZOS)


def hell(normale):
    n = np.array(normale, dtype=np.float64); n /= np.linalg.norm(n)
    return float(0.5 + 0.62 * max(0.0, n @ LICHT))


def schatten_boden(B, P):
    """Weicher Schatten des Hauses auf dem Boden (nach Osten und Norden versetzt, Licht von Südwesten)"""
    m = Image.new('L', B.im.size, 0)
    W, D = M['W'], M['D']
    pts = [B.p(P(x, d, 0)) for x, d in [(0.2, -0.15), (W + 0.9, -0.15), (W + 1.1, D + 0.4), (0.4, D + 0.4)]]
    ImageDraw.Draw(m).polygon(pts, fill=140)
    m = m.filter(ImageFilter.GaussianBlur(10 * K))
    s = Image.new('RGBA', B.im.size, (10, 12, 6, 0)); s.putalpha(m)
    B.im = Image.alpha_composite(B.im, s)


def baue_schraeg(kx):
    P = Projektion('schraeg', kx)
    W, D, H, R, ue, us, t = (M[k] for k in ('W', 'D', 'H', 'R', 'ue', 'us', 't'))
    # Rahmen: alles, was das Haus belegt, plus Rand
    xs, ys = [], []
    for x in (-us - 0.5, W + us + 1.2):
        for d in (-ue - 0.3, D + ue + 0.3):
            for z in (0, H + R + 1.0):
                X, Y = P(x, d, z); xs.append(X); ys.append(Y)
    ox, oy = -min(xs) + 6, -min(ys) + 6
    b, h = int(max(xs) + ox + 6), int(max(ys) + oy + 6)
    ebenen = {}
    neu = lambda: Bild(b, h, ox, oy)

    # innen: Boden aus Dielen, Innenseiten der Rück- und Westwand, Mauerkronen (sichtbar, wenn das Dach ausgeblendet ist)
    E = neu()
    schatten_boden(E, P)
    E.flaeche(P, [(t, t, 0), (W - t, t, 0), (W - t, D - t, 0), (t, D - t, 0)], 'bretter', 0.86, 0.06, drehen=True)
    E.flaeche(P, [(t, D - t, 0), (W - t, D - t, 0), (W - t, D - t, H), (t, D - t, H)], 'bretter', 0.78, 0.085, ton=(0.7, 1.0))
    E.flaeche(P, [(t, t, 0), (t, D - t, 0), (t, D - t, H), (t, t, H)], 'bretter', 0.62, 0.085, ton=(0.7, 1.0))
    for ecken in ([(0, D - t, H), (W, D - t, H), (W, D, H), (0, D, H)], [(0, 0, H), (t, 0, H), (t, D, H), (0, D, H)]):
        E.flaeche(P, ecken, 'maserung', 0.95, 0.2)
    # Möbel als Andeutung: Tisch und Bett
    E.flaeche(P, [(2.6, 1.2, 0.75), (3.6, 1.2, 0.75), (3.6, 2.0, 0.75), (2.6, 2.0, 0.75)], 'maserung', 1.0, 0.18)
    E.flaeche(P, [(0.5, 2.6, 0.5), (1.6, 2.6, 0.5), (1.6, 3.6, 0.5), (0.5, 3.6, 0.5)], 'bretter', 1.05, 0.06, farbe=(150, 120, 90))
    ebenen['innen'] = E

    # seite: Ostwand außen mit Giebel, Mauerkrone
    S = neu()
    S.flaeche(P, [(W, 0, 0), (W, D, 0), (W, D, H), (W, 0, H)], 'bretter', hell((1, 0, 0)) * 0.95, 0.085, ton=(0.92, 0.78))
    S.flaeche(P, [(W, 0, H), (W, D, H), (W, D / 2, H + R)], 'bretter', hell((1, 0, 0)) * 0.9, 0.085)
    for f in M['seitenfenster']:
        d0, d1, z0, z1 = f['d'] - f['b'] / 2, f['d'] + f['b'] / 2, f['z'], f['z'] + f['h']
        S.flaeche(P, [(W + 0.01, d0 - 0.12, z0 - 0.12), (W + 0.01, d1 + 0.12, z0 - 0.12), (W + 0.01, d1 + 0.12, z1 + 0.12), (W + 0.01, d0 - 0.12, z1 + 0.12)], 'maserung', 0.6, 0.2)
        S.vieleck(P, [(W + 0.02, d0, z0), (W + 0.02, d1, z0), (W + 0.02, d1, z1), (W + 0.02, d0, z1)], (232, 170, 80))
        S.linie(P, [(W + 0.03, f['d'], z0), (W + 0.03, f['d'], z1)], (60, 40, 26), 2.5)
    for d in (0.0, D):          # Eckbalken
        S.flaeche(P, [(W + 0.02, d - 0.14, 0), (W + 0.02, d + 0.14, 0), (W + 0.02, d + 0.14, H), (W + 0.02, d - 0.14, H)], 'maserung', 0.55, 0.2)
    S.flaeche(P, [(W + 0.02, 0, 0), (W + 0.02, D, 0), (W + 0.02, D, 0.32), (W + 0.02, 0, 0.32)], 'maserung', 0.45, 0.2)   # Schwelle
    ebenen['seite'] = S

    # vorn: Vorderwand außen mit Eckbalken, Schwelle und der Mauerkrone der Vorderwand; die Türöffnung bleibt frei (Tür ist eine eigene Ebene)
    V = neu()
    td = M['tuer']
    V.flaeche(P, [(0, 0, 0), (W, 0, 0), (W, 0, H), (0, 0, H)], 'bretter', hell((0, -1, 0)), 0.085, ton=(1.0, 0.82))
    for x in (0.0, W - 0.28):
        V.flaeche(P, [(x, -0.02, 0), (x + 0.28, -0.02, 0), (x + 0.28, -0.02, H), (x, -0.02, H)], 'maserung', 0.62, 0.2)
    V.flaeche(P, [(0, -0.02, 0), (W, -0.02, 0), (W, -0.02, 0.32), (0, -0.02, 0.32)], 'maserung', 0.5, 0.2)
    V.flaeche(P, [(0, -0.02, H - 0.25), (W, -0.02, H - 0.25), (W, -0.02, H), (0, -0.02, H)], 'maserung', 0.55, 0.2)
    V.flaeche(P, [(0, 0, H), (W, 0, H), (W, t, H), (0, t, H)], 'maserung', 1.0, 0.2)
    ebenen['vorn'] = V

    # Tür: Rahmen und Blatt; offen = dunkle Öffnung, Blatt nach innen geschwenkt
    def tuer(offen):
        T = neu(); x0, x1, z1 = td['x'] - td['b'] / 2, td['x'] + td['b'] / 2, td['h']
        T.flaeche(P, [(x0 - 0.14, -0.04, 0), (x1 + 0.14, -0.04, 0), (x1 + 0.14, -0.04, z1 + 0.14), (x0 - 0.14, -0.04, z1 + 0.14)], 'maserung', 0.55, 0.2)
        if offen:
            T.vieleck(P, [(x0, -0.05, 0), (x1, -0.05, 0), (x1, -0.05, z1), (x0, -0.05, z1)], (28, 22, 20))
            T.flaeche(P, [(x0, -0.06, 0), (x0, 0.8, 0), (x0, 0.8, z1), (x0, -0.06, z1)], 'bretter', 0.5, 0.075)
        else:
            T.flaeche(P, [(x0, -0.06, 0), (x1, -0.06, 0), (x1, -0.06, z1), (x0, -0.06, z1)], 'bretter', 0.62, 0.075)
            for z in (0.35, z1 - 0.4):
                T.vieleck(P, [(x0, -0.07, z), (x1, -0.07, z), (x1, -0.07, z + 0.07), (x0, -0.07, z + 0.07)], (46, 44, 46))
            T.vieleck(P, [(x1 - 0.2, -0.08, 0.95), (x1 - 0.12, -0.08, 0.95), (x1 - 0.12, -0.08, 1.03), (x1 - 0.2, -0.08, 1.03)], (200, 168, 90))
        return T
    ebenen['tuer_zu'], ebenen['tuer_offen'] = tuer(False), tuer(True)

    # Fenster der Vorderwand: Rahmen, warmes Licht, Kreuz, Läden, Blumenkasten
    F = neu()
    for f in M['fenster']:
        x0, x1, z0, z1 = f['x'] - f['b'] / 2, f['x'] + f['b'] / 2, f['z'], f['z'] + f['h']
        for s in (-1, 1):
            lx = x0 - 0.42 if s < 0 else x1 + 0.02
            F.flaeche(P, [(lx, -0.05, z0 - 0.05), (lx + 0.4, -0.05, z0 - 0.05), (lx + 0.4, -0.05, z1 + 0.05), (lx, -0.05, z1 + 0.05)], 'bretter', 0.5, 0.07)
        F.flaeche(P, [(x0 - 0.1, -0.04, z0 - 0.1), (x1 + 0.1, -0.04, z0 - 0.1), (x1 + 0.1, -0.04, z1 + 0.1), (x0 - 0.1, -0.04, z1 + 0.1)], 'maserung', 0.6, 0.2)
        F.vieleck(P, [(x0, -0.05, z0), (x1, -0.05, z0), (x1, -0.05, z1), (x0, -0.05, z1)], (236, 176, 86))
        F.vieleck(P, [(x0 + 0.08, -0.05, z0 + 0.08), (x1 - 0.08, -0.05, z0 + 0.08), (x1 - 0.08, -0.05, z1 - 0.08), (x0 + 0.08, -0.05, z1 - 0.08)], (255, 214, 130), 150)
        F.linie(P, [(f['x'], -0.06, z0), (f['x'], -0.06, z1)], (60, 40, 26), 3); F.linie(P, [(x0, -0.06, (z0 + z1) / 2), (x1, -0.06, (z0 + z1) / 2)], (60, 40, 26), 3)
        F.flaeche(P, [(x0 - 0.15, -0.2, z0 - 0.18), (x1 + 0.15, -0.2, z0 - 0.18), (x1 + 0.15, -0.2, z0 - 0.02), (x0 - 0.15, -0.2, z0 - 0.02)], 'maserung', 0.8, 0.2)
        rng = np.random.default_rng(5)
        for k in range(7):
            x = x0 - 0.05 + (x1 - x0 + 0.1) * (k + rng.uniform(0.2, 0.8)) / 7
            F.vieleck(P, [(x - 0.07, -0.21, z0), (x + 0.07, -0.21, z0), (x + 0.07, -0.21, z0 + 0.12), (x - 0.07, -0.21, z0 + 0.12)], [(214, 70, 64), (236, 196, 72), (222, 222, 230), (80, 120, 50)][k % 4])
    ebenen['fenster'] = F

    # Dach: hintere Fläche (schmal sichtbar), vordere Fläche, östlicher Ortgang mit Brett, First, Kamin
    Dd = neu()
    sl = R / (D / 2)                                  # Steigung
    zx = lambda d: H + R - abs(d - D / 2) * sl        # Dachhöhe über der Tiefe d
    xl, xr = -us, W + us
    Dd.flaeche(P, [(xl, D + ue, zx(D + ue)), (xr, D + ue, zx(D + ue)), (xr, D / 2, H + R), (xl, D / 2, H + R)], 'dachziegel', 0.72, 0.105)
    vorne = [(xl, -ue, zx(-ue)), (xr, -ue, zx(-ue)), (xr, D / 2, H + R), (xl, D / 2, H + R)]
    Dd.flaeche(P, vorne, 'dachziegel', hell((0, -sl, 1)) * 1.02, 0.105, ton=(0.88, 1.12))
    # Ortgang (Stirn des Dachs auf der Ostseite): schmales Brett entlang der Dachkante
    Dd.flaeche(P, [(xr, -ue, zx(-ue)), (xr, D / 2, H + R), (xr, D / 2, H + R - 0.22), (xr, -ue, zx(-ue) - 0.22)], 'maserung', 0.7, 0.2)
    Dd.flaeche(P, [(xr, D / 2, H + R), (xr, D + ue, zx(D + ue)), (xr, D + ue, zx(D + ue) - 0.22), (xr, D / 2, H + R - 0.22)], 'maserung', 0.6, 0.2)
    Dd.linie(P, [(xl, -ue, zx(-ue)), (xr, -ue, zx(-ue))], (40, 28, 20), 4)          # Traufkante
    Dd.linie(P, [(xl, D / 2, H + R + 0.05), (xr, D / 2, H + R + 0.05)], (70, 48, 30), 6)  # First
    kd = M['kamin']; kx0, kx1, d0, d1 = kd['x'] - kd['b'] / 2, kd['x'] + kd['b'] / 2, kd['d'], kd['d'] + kd['b']
    oben = H + R + 0.7
    Dd.flaeche(P, [(kx0, d0, zx(d0)), (kx1, d0, zx(d0)), (kx1, d0, oben), (kx0, d0, oben)], 'maserung', 0.55, 0.15, farbe=(130, 124, 116))
    Dd.flaeche(P, [(kx1, d0, zx(d0)), (kx1, d1, zx(d1)), (kx1, d1, oben), (kx1, d0, oben)], 'maserung', 0.4, 0.15, farbe=(120, 114, 108))
    Dd.vieleck(P, [(kx0, d0, oben), (kx1, d0, oben), (kx1, d1, oben), (kx0, d1, oben)], (40, 36, 34))
    ebenen['dach'] = Dd
    return P, ebenen, (ox, oy, b, h)


def baue_iso():
    """Dasselbe Haus in klassischer 2:1-Isometrie (um 45° gedreht) – ein einziges Bild, nur zum Vergleich"""
    P = Projektion('iso')
    W, D, H, R, ue, us = (M[k] for k in ('W', 'D', 'H', 'R', 'ue', 'us'))
    xs, ys = [], []
    for x in (-us - 0.5, W + us + 0.5):
        for d in (-ue - 0.5, D + ue + 0.5):
            for z in (0, H + R + 1):
                X, Y = P(x, d, z); xs.append(X); ys.append(Y)
    ox, oy = -min(xs) + 6, -min(ys) + 6
    B = Bild(int(max(xs) + ox + 6), int(max(ys) + oy + 6), ox, oy)
    # bei dieser Drehung zeigen Süd- und Westseite zum Betrachter; die Südwand liegt im Licht
    B.flaeche(P, [(0, D, 0), (0, 0, 0), (0, 0, H), (0, D, H)], 'bretter', 0.7, 0.085, ton=(0.95, 0.8))
    B.flaeche(P, [(0, D, H), (0, 0, H), (0, D / 2, H + R)], 'bretter', 0.68, 0.085)
    B.flaeche(P, [(0, 0, 0), (W, 0, 0), (W, 0, H), (0, 0, H)], 'bretter', 0.98, 0.085, ton=(1.0, 0.85))
    td = M['tuer']; x0, x1 = td['x'] - td['b'] / 2, td['x'] + td['b'] / 2
    B.flaeche(P, [(x0, -0.03, 0), (x1, -0.03, 0), (x1, -0.03, td['h']), (x0, -0.03, td['h'])], 'bretter', 0.6, 0.075)
    for f in M['fenster']:
        B.vieleck(P, [(f['x'] - f['b'] / 2, -0.03, f['z']), (f['x'] + f['b'] / 2, -0.03, f['z']), (f['x'] + f['b'] / 2, -0.03, f['z'] + f['h']), (f['x'] - f['b'] / 2, -0.03, f['z'] + f['h'])], (236, 176, 86))
    sl = R / (D / 2); zx = lambda d: H + R - abs(d - D / 2) * sl
    B.flaeche(P, [(-us, -ue, zx(-ue)), (W + us, -ue, zx(-ue)), (W + us, D / 2, H + R), (-us, D / 2, H + R)], 'dachziegel', 1.0, 0.105)
    B.flaeche(P, [(-us, -ue, zx(-ue)), (-us, D / 2, H + R), (-us, D / 2, H + R - 0.2), (-us, -ue, zx(-ue) - 0.2)], 'maserung', 0.6, 0.2)
    B.linie(P, [(-us, D / 2, H + R), (W + us, D / 2, H + R)], (70, 48, 30), 6)
    fx, fy = P(0, 0, 0)         # Fuß: die vorderste Ecke (Südwest) – nach ihr wird sortiert
    # Grundriss im Weltraster (Draufsicht, 1:1): Die gedrehten Ecken des Hauses
    c = math.sqrt(0.5)
    ecken = []
    for x, d in [(0, 0), (W, 0), (W, D), (0, D)]:
        u, v = (x - W / 2) * c - (d - D / 2) * c, (x - W / 2) * c + (d - D / 2) * c
        ecken.append((u, v))
    return B, (fx + ox, fy + oy), ecken


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ziel = sys.argv[1]; os.makedirs(ziel, exist_ok=True)
    P, ebenen, (ox, oy, b, h) = baue_schraeg(0.32)
    teile = {}
    for name, B in ebenen.items():
        im = B.fertig(malen=name != 'innen')
        im.save(os.path.join(ziel, f'haus3d_{name}.webp'), quality=92, method=6)
        teile[name] = f'haus3d_{name}.webp'
    W, D = M['W'], M['D']
    # Fuß: vordere linke Ecke am Boden liegt bei (ox, oy) im Bild; das Spiel setzt die Ecke auf die Weltlage des Grundrisses
    iso, iso_fuss, iso_ecken = baue_iso()
    iso.fertig().save(os.path.join(ziel, 'haus3d_iso.webp'), quality=92, method=6)
    daten = {
        'feld': FELD, 'modell': M, 'projektion': {'art': 'schraeg', 'kx': 0.32, 'kz': 1.0},
        'groesse': [b, h], 'ecke': [ox, oy],                     # Bildpunkt der vorderen linken Ecke am Boden
        'teile': teile,
        'tiefe': {'innen': -D + 0.02, 'seite': -D + 0.03, 'vorn': 0.0, 'fenster': 0.001, 'tuer_zu': 0.002, 'tuer_offen': 0.002, 'dach': M['ue']},  # Tiefe relativ zur Vorderwand (Felder, + = weiter vorn)
        'tuer': {'x': M['tuer']['x'], 'breite': M['tuer']['b']},
        'iso': {'bild': 'haus3d_iso.webp', 'groesse': [iso.im.width // K, iso.im.height // K], 'fuss': [iso_fuss[0], iso_fuss[1]], 'ecken': iso_ecken},
    }
    with open(os.path.join(ziel, 'haus3d.json'), 'w', encoding='utf8') as f:
        json.dump(daten, f, ensure_ascii=False, indent=1)
    vorschau = Image.new('RGBA', (b * 2 + 60, h + 40), (92, 128, 60, 255))
    for name in ('innen', 'seite', 'vorn', 'fenster', 'tuer_zu', 'dach'):
        im = Image.open(os.path.join(ziel, teile[name])); vorschau.alpha_composite(im, (20, 20))
    for name in ('innen', 'seite', 'vorn', 'fenster', 'tuer_offen'):
        im = Image.open(os.path.join(ziel, teile[name])); vorschau.alpha_composite(im, (b + 40, 20))
    vorschau.save(os.path.join(ziel, 'vorschau.png'))
    print(f'Haus: {b} × {h} px je Ebene, {len(teile)} Ebenen; Iso-Vergleich {iso.im.width // K} × {iso.im.height // K} px')


if __name__ == '__main__':
    main()
