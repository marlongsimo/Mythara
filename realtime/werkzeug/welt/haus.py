"""
World Pipeline – Kleinteile und Bauteile in Frontalansicht (Fass, Kiste, Holzstapel, Bank, Heuballen, Laterne, Marktstand, Brunnen, Dorftor, Palisade).
Gebäude baut seit der Umstellung auf räumliche Gebäude werkzeug/welt/gebaeude.py aus Bauplänen; die Hausfunktionen hier bleiben nur als Vorlage.

  python3 werkzeug/welt/haus.py [kennung …] [--vorschau bild.png]

Ergebnis: ../img/welt/gebaeude/<kennung>.webp und die passenden Einträge in welt/bibliothek/objekte.json
(Größe, Fußpunkt, Kollision und Türpunkt werden aus den Maßen des Hauses gerechnet).
Ohne Angabe werden alle Häuser aus HAEUSER gebaut. Ein neues Haus ist eine weitere Zeile dort.

Ansicht wie die übrigen Objekte der Welt: von vorn und schräg oben. Zwei Bauformen:
  trauf  – der First läuft quer, man sieht die Vorderwand und darüber die Dachfläche
  giebel – der First läuft nach hinten, man sieht den Giebel und beide Dachseiten

Die Texturen liegen in werkzeug/welt/texturen/ (nicht im Repository, siehe LIESMICH.md dort).
Maße in Bildpunkten des fertigen Bildes; der Held ist 84 hoch, ein Rechenfeld 48 breit. Gerechnet wird in doppelter Größe und am Ende verkleinert.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
TEX = os.path.join(HIER, 'texturen')
ZIEL = os.path.join(WURZEL, 'img', 'welt', 'gebaeude')
BIB = os.path.join(REALTIME, 'welt', 'bibliothek', 'objekte.json')
K = 2          # Rechengröße
FELD = 48

# kennung: Bauform und Maße. b = Breite der Wand, wand = Wandhöhe, dach = sichtbare Dachhöhe (trauf) / giebel = Giebelhöhe, tiefe = Dachlänge nach hinten (giebel)
HAEUSER = {
    'dorf_marktstand_01':   dict(name='Marktstand (rot)', form='stand', b=132, tuch=(168, 58, 48), saat=14),
    'dorf_marktstand_02':   dict(name='Marktstand (grün)', form='stand', b=132, tuch=(70, 122, 84), saat=15),
    'dorf_marktstand_03':   dict(name='Marktstand (blau)', form='stand', b=112, tuch=(64, 104, 150), saat=16),
    'dorf_brunnen_01':      dict(name='Dorfbrunnen', form='brunnen', saat=17),
    'dorf_tor_01':          dict(name='Dorftor', form='tor', b=176, saat=18),
    'dorf_palisade_01':     dict(name='Palisade', form='palisade', b=96, saat=19),
    'dorf_palisade_02':     dict(name='Palisade', form='palisade', b=96, saat=20),
    'dorf_fass_01':         dict(name='Fass', form='fass', saat=21),
    'dorf_kiste_01':        dict(name='Kiste', form='kiste', saat=22),
    'dorf_holzstapel_01':   dict(name='Holzstapel', form='holzstapel', saat=23),
    'dorf_bank_01':         dict(name='Bank', form='bank', saat=24),
    'dorf_heuballen_01':    dict(name='Heuballen', form='heu', saat=25),
    'dorf_laterne_01':      dict(name='Laterne', form='laterne', saat=26),
    'wald_baumstamm_01':    dict(name='Umgestürzter Baum (quer)', form='baumstamm', saat=27),
    'dorf_festfeuer_01':    dict(name='Erntefeuer', form='feuer', saat=29),
    'dorf_steinring_01':    dict(name='Steinring (Baumbeet)', form='steinring', saat=30),
    'dorf_wehr_01':         dict(name='Wehr', form='wehr', saat=31),
    'dorf_zaun_01':         dict(name='Holzzaun', form='zaun', saat=32),
    'dorf_kuerbisse_01':    dict(name='Kürbisse', form='kuerbisse', saat=33),
    'dorf_bruecke_01':      dict(name='Holzbrücke (Ost–West)', form='bruecke', richtung='quer', tiefe='boden', saat=34),
    'dorf_bruecke_02':      dict(name='Holzbrücke (Nord–Süd)', form='bruecke', richtung='laengs', tiefe='boden', saat=35),
    'moor_kahn_01':         dict(name='Kahn', form='kahn', tiefe='boden', saat=36),
    'moor_feuerkorb_01':    dict(name='Feuerkorb', form='feuerkorb', saat=37),
    'moor_menhir_01':       dict(name='Spiralstein', form='menhir', saat=38),
    'moor_menhir_02':       dict(name='Spiralstein (schief)', form='menhir', schief=True, saat=39),
    'moor_schrein_01':      dict(name='Versunkener Schrein', form='schrein', saat=40),
    'moor_nebel_01':        dict(name='Nebelschwade', form='nebel', tiefe='oben', saat=41),
    'wald_meiler_01':       dict(name='Kohlenmeiler', form='meiler', saat=42),
    'wald_baumstamm_02':    dict(name='Umgestürzter Baum (in die Tiefe)', form='baumstamm_tief', saat=28),
}


# ---------- Texturen ----------
def periode(a, von, bis):
    """Wiederholungslänge einer Zeilen- oder Spaltenfolge (kleinste Abweichung zur verschobenen Kopie)"""
    best, bw = von, 1e18
    for p in range(von, bis):
        w = np.abs(a[p:] - a[:-p]).mean()
        if w < bw * 0.98:
            best, bw = p, w
    return best


_T = {}
def tex(name):
    if name in _T:
        return _T[name]
    if os.environ.get('MYTHARA_STIL', 'gemalt') == 'gemalt' and name in ('bretter', 'maserung', 'dachziegel'):
        import gebaeude                     # Spielstil: die gemalten, selbst gerechneten Texturen des Gebäude-Baukastens
        _T[name] = gebaeude.tex(name).astype(np.float32)
        return _T[name]
    pfad = os.path.join(TEX, name + '.jpg')
    if not os.path.exists(pfad):
        sys.exit(f'Textur fehlt: {pfad} (siehe werkzeug/welt/texturen/LIESMICH.md)')
    a = np.asarray(Image.open(pfad).convert('RGB')).astype(np.float32)
    if name == 'dachziegel':
        # auf ganze Ziegel zuschneiden, damit die Fläche ohne Sprung wiederholt werden kann
        px = periode(a.mean(axis=(0, 2)), 60, 400); py = periode(a.mean(axis=(1, 2)), 60, 400)
        a = a[:(a.shape[0] // py) * py, :(a.shape[1] // px) * px]
    _T[name] = a
    return a


def flaeche(name, breit, hoch, mass, drehen=False, saat=0):
    """Eine Fläche breit × hoch mit der Textur füllen; mass = Verkleinerung der Textur. Zurück: Feld float32 (hoch, breit, 3)."""
    t = tex(name)
    im = Image.fromarray(t.astype(np.uint8))
    im = im.resize((max(8, round(im.width * mass)), max(8, round(im.height * mass))), Image.LANCZOS)
    if drehen:
        im = im.rotate(90, expand=True)
    t = np.asarray(im).astype(np.float32)
    rng = np.random.default_rng(saat)
    oy, ox = int(rng.integers(0, t.shape[0])), int(rng.integers(0, t.shape[1]))
    ys = (np.arange(hoch) + oy) % t.shape[0]; xs = (np.arange(breit) + ox) % t.shape[1]
    return t[ys][:, xs]


def faerben(a, rgb, kraft=0.85):
    """Helligkeit behalten, Farbton auf rgb ziehen"""
    if rgb is None:
        return a
    hell = a.mean(-1, keepdims=True) / max(a.mean(), 1)
    return a * (1 - kraft) + hell * np.array(rgb, dtype=np.float32) * kraft


class Blatt:
    """Die Zeichenfläche (RGBA, in Rechengröße). Alle Maße der Aufrufe in Bildpunkten des fertigen Bildes."""
    def __init__(self, breit, hoch):
        self.b, self.h = breit * K, hoch * K
        self.bild = np.zeros((self.h, self.b, 4), dtype=np.float32)

    def maske(self, punkte):
        m = Image.new('L', (self.b, self.h), 0)
        ImageDraw.Draw(m).polygon([(x * K, y * K) for x, y in punkte], fill=255)
        return np.asarray(m).astype(np.float32) / 255

    def lege(self, farbe, m):
        """Farbe (Feld über das ganze Blatt oder ein Farbwert) mit Maske auftragen"""
        if not isinstance(farbe, np.ndarray) or farbe.ndim == 1:
            farbe = np.broadcast_to(np.array(farbe, dtype=np.float32), (self.h, self.b, 3))
        a = m[..., None]
        self.bild[..., :3] = self.bild[..., :3] * (1 - a) + farbe * a
        self.bild[..., 3:] = np.maximum(self.bild[..., 3:], a * 255)

    def dunkel(self, m, kraft):
        """Abdunkeln, wo die Maske liegt (nur auf schon Gemaltem)"""
        self.bild[..., :3] *= (1 - kraft * m)[..., None]

    def voll(self, name, mass, drehen=False, saat=0):
        return flaeche(name, self.b, self.h, mass * K, drehen, saat)

    def rechteck(self, x, y, b, h):
        return self.maske([(x, y), (x + b, y), (x + b, y + h), (x, y + h)])

    def balken(self, x, y, b, h, saat=0, hell=0.8):
        """Ein Balken aus dunklem Holz mit dunkler Kante; hochkant, wenn er höher als breit ist"""
        m = self.rechteck(x, y, b, h)
        self.lege(self.voll('maserung', 0.22, drehen=h > b, saat=saat) * hell, m)
        rand = m - self.rechteck(x + 1, y + 1, b - 2, h - 2)
        self.dunkel(np.clip(rand, 0, 1), 0.45)

    def strich(self, punkte, dick, saat=0, hell=0.75):
        """Ein Balken entlang eines Linienzugs (für Ortgänge am Giebel)"""
        m = Image.new('L', (self.b, self.h), 0)
        ImageDraw.Draw(m).line([(x * K, y * K) for x, y in punkte], fill=255, width=round(dick * K), joint='curve')
        m = np.asarray(m).astype(np.float32) / 255
        self.lege(self.voll('maserung', 0.22, saat=saat) * hell, m)
        innen = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))).astype(np.float32) / 255
        self.dunkel(np.clip(m - innen, 0, 1), 0.4)

    def fertig(self):
        """Feine dunkle Kontur um die Figur, dann auf Zielgröße verkleinern"""
        im = Image.fromarray(np.clip(self.bild, 0, 255).astype(np.uint8), 'RGBA')
        a = im.getchannel('A')
        aussen = np.asarray(a.filter(ImageFilter.MaxFilter(3))).astype(np.float32) - np.asarray(a).astype(np.float32)
        kontur = Image.fromarray(np.dstack([np.full((self.h, self.b, 3), 24, dtype=np.uint8), np.clip(aussen * 0.55, 0, 255).astype(np.uint8)]), 'RGBA')
        im = Image.alpha_composite(kontur, im)
        return im.resize((self.b // K, self.h // K), Image.LANCZOS)


def schatten(B, x0, x1, yb, hoehe):
    """Weicher Schatten am Boden, etwas nach rechts unten versetzt"""
    m = Image.new('L', (B.b, B.h), 0)
    ImageDraw.Draw(m).ellipse([(x0 - 4) * K, (yb - hoehe * 0.55) * K, (x1 + 16) * K, (yb + hoehe * 0.5) * K], fill=150)
    m = np.asarray(m.filter(ImageFilter.GaussianBlur(7 * K))).astype(np.float32) / 255
    B.bild[..., 3] = np.maximum(B.bild[..., 3], m * 255 * 0.55)   # schwarz mit weicher Deckung


def sockel(B, x, y, b, h, rng):
    """Feldsteine unter der Wand"""
    B.lege((58, 56, 52), B.rechteck(x, y, b, h))
    px = x
    while px < x + b:
        w = float(rng.uniform(9, 17)); g = float(rng.uniform(96, 138))
        m = Image.new('L', (B.b, B.h), 0)
        ImageDraw.Draw(m).rounded_rectangle([(px + 0.7) * K, (y + 0.8) * K, (min(px + w, x + b) - 0.7) * K, (y + h - 0.8) * K], radius=2.4 * K, fill=255)
        B.lege((g, g * 0.97, g * 0.9), np.asarray(m).astype(np.float32) / 255)
        px += w
    B.dunkel(B.rechteck(x, y + h * 0.6, b, h * 0.4), 0.22)


def wand(B, punkte, P, verlauf_oben, verlauf_hoehe):
    """Bretterwand; unter dem Dachüberstand dunkler"""
    m = B.maske(punkte)
    holz = B.voll('bretter', 0.085, saat=P['saat']) * P.get('holz', 1.0)
    yy = np.arange(B.h, dtype=np.float32)[:, None] / K
    licht = 0.62 + 0.38 * np.clip((yy - verlauf_oben) / verlauf_hoehe, 0, 1)
    xx = np.arange(B.b, dtype=np.float32)[None, :] / B.b
    B.lege(holz * licht[..., None] * (1.04 - 0.12 * xx)[..., None], m)


def fenster(B, cx, cy, b, h, saat):
    """Fenster mit warmem Licht, Kreuz, Rahmen und Läden"""
    for s, lx in ((-1, cx - b / 2 - b * 0.42 - 2), (1, cx + b / 2 + 2)):
        m = B.rechteck(lx, cy - h / 2 - 1, b * 0.42, h + 2)
        B.lege(B.voll('bretter', 0.07, saat=saat + s) * 0.62, m)
        B.dunkel(np.clip(m - B.rechteck(lx + 1, cy - h / 2, b * 0.42 - 2, h), 0, 1), 0.4)
    B.balken(cx - b / 2 - 3, cy - h / 2 - 3, b + 6, h + 6, saat, 0.7)
    m = B.rechteck(cx - b / 2, cy - h / 2, b, h)
    yy, xx = np.mgrid[0:B.h, 0:B.b].astype(np.float32) / K
    glut = np.clip(1 - np.hypot((xx - cx) / (b * 0.75), (yy - cy - h * 0.1) / (h * 0.75)), 0, 1)[..., None]
    B.lege(np.array([36, 30, 34], dtype=np.float32) * (1 - glut) + np.array([255, 196, 96], dtype=np.float32) * glut, m)
    B.balken(cx - 1.2, cy - h / 2, 2.4, h, saat, 0.6); B.balken(cx - b / 2, cy - 1.2, b, 2.4, saat, 0.6)
    B.balken(cx - b / 2 - 5, cy + h / 2 + 2, b + 10, 4, saat, 0.85)          # Fensterbank


def tuer(B, cx, yb, b, h, saat, zwei=False):
    """Brettertür mit Rahmen und Eisenbändern; zwei Flügel für ein Scheunentor"""
    B.balken(cx - b / 2 - 4, yb - h - 4, b + 8, h + 4, saat, 0.62)
    m = B.rechteck(cx - b / 2, yb - h, b, h)
    B.lege(B.voll('bretter', 0.075, saat=saat + 7) * 0.58, m)
    for y in (yb - h * 0.8, yb - h * 0.25):
        B.lege((44, 42, 44), B.rechteck(cx - b / 2, y, b, 3))
    if zwei:
        B.lege((26, 22, 20), B.rechteck(cx - 1, yb - h, 2, h))
        B.strich([(cx - b / 2 + 3, yb - h + 4), (cx - 3, yb - 4)], 4, saat, 0.5); B.strich([(cx + b / 2 - 3, yb - h + 4), (cx + 3, yb - 4)], 4, saat, 0.5)
    else:
        m = Image.new('L', (B.b, B.h), 0)
        ImageDraw.Draw(m).ellipse([(cx + b / 2 - 8) * K, (yb - h * 0.5 - 2) * K, (cx + b / 2 - 4) * K, (yb - h * 0.5 + 2) * K], fill=255)
        B.lege((190, 160, 90), np.asarray(m).astype(np.float32) / 255)
    B.dunkel(B.rechteck(cx - b / 2, yb - h, b, 5), 0.35)


def dachflaeche(B, punkte, P, hell, drehen=False, scherung=0.0, saat=0):
    """Ziegel auf ein Vieleck legen. scherung: so viele Bildpunkte fällt die Ziegelreihe je Bildpunkt nach rechts (für geneigte Dachseiten)."""
    z = faerben(B.voll('dachziegel', 0.105, drehen=drehen, saat=saat), P.get('dachfarbe'))
    if scherung:
        im = Image.fromarray(np.clip(z, 0, 255).astype(np.uint8))
        im = im.transform(im.size, Image.AFFINE, (1, 0, 0, -scherung, 1, B.h * 0.5 * abs(scherung) if scherung > 0 else 0), resample=Image.BICUBIC)
        z2 = np.asarray(im).astype(np.float32)
        z = np.where(z2.sum(-1, keepdims=True) > 0, z2, z)
    B.lege(z * hell, B.maske(punkte))


def kamin(B, cx, y_oben, y_unten, rng):
    b = 20
    B.lege((70, 66, 62), B.rechteck(cx - b / 2, y_oben, b, y_unten - y_oben))
    for j in range(int((y_unten - y_oben) // 7) + 1):
        for i in range(3):
            g = float(rng.uniform(104, 140)); x = cx - b / 2 + i * b / 3 + (j % 2) * 3 - 1.5; y = y_oben + j * 7
            B.lege((g, g * 0.95, g * 0.88), B.rechteck(max(cx - b / 2, x + 0.6), y + 0.6, min(b / 3 - 1.2, cx + b / 2 - x - 0.6), min(5.8, y_unten - y - 0.6)) * B.rechteck(cx - b / 2, y_oben, b, y_unten - y_oben))
    B.lege((40, 36, 34), B.rechteck(cx - b / 2 - 2, y_oben - 4, b + 4, 5))
    B.dunkel(B.rechteck(cx + b / 2 - 5, y_oben, 5, y_unten - y_oben), 0.3)


def ellipse(B, cx, cy, rx, ry):
    m = Image.new('L', (B.b, B.h), 0)
    ImageDraw.Draw(m).ellipse([(cx - rx) * K, (cy - ry) * K, (cx + rx) * K, (cy + ry) * K], fill=255)
    return np.asarray(m).astype(np.float32) / 255


def esse(B, xl, xr, yo, yu, rng):
    """Offene Werkstatt der Schmiede: dunkler Raum, gemauerte Esse mit Glut, Amboss"""
    B.balken(xl - 5, yo - 5, xr - xl + 10, yu - yo + 5, 31, 0.62)
    m = B.rechteck(xl, yo, xr - xl, yu - yo)
    yy, xx = np.mgrid[0:B.h, 0:B.b].astype(np.float32) / K
    gx, gy = xl + (xr - xl) * 0.3, yu - 26
    glut = np.clip(1 - np.hypot((xx - gx) / ((xr - xl) * 0.62), (yy - gy) / ((yu - yo) * 0.8)), 0, 1)[..., None] ** 1.4
    B.lege(np.array([30, 24, 24], dtype=np.float32) * (1 - glut) + np.array([255, 138, 44], dtype=np.float32) * glut, m)
    # Esse: Steinblock mit Glutbett
    ex, eb = xl + (xr - xl) * 0.08, (xr - xl) * 0.44
    B.lege((66, 62, 60), B.rechteck(ex, yu - 30, eb, 30))
    for j in range(4):
        for i in range(5):
            g = float(rng.uniform(98, 132)); x = ex + i * eb / 5 + (j % 2) * 4 - 2
            B.lege((g, g * 0.95, g * 0.9), B.rechteck(max(ex, x + 0.6), yu - 30 + j * 7.5 + 0.6, min(eb / 5 - 1.2, ex + eb - x - 0.6), 6.3) * B.rechteck(ex, yu - 30, eb, 30))
    B.lege((255, 176, 60), ellipse(B, ex + eb / 2, yu - 31, eb * 0.36, 4.5)); B.lege((255, 236, 150), ellipse(B, ex + eb / 2, yu - 31, eb * 0.18, 2.2))
    # Amboss auf einem Holzklotz
    ax = xl + (xr - xl) * 0.76
    B.balken(ax - 9, yu - 16, 18, 16, 33, 0.7)
    B.lege((52, 54, 60), B.maske([(ax - 15, yu - 27), (ax + 11, yu - 27), (ax + 11, yu - 22), (ax + 5, yu - 16), (ax - 6, yu - 16), (ax - 8, yu - 22), (ax - 15, yu - 23)]))
    B.lege((112, 116, 126), B.rechteck(ax - 15, yu - 27, 26, 2))
    B.balken(xl + (xr - xl) * 0.58 - 3, yo, 6, yu - yo, 34, 0.7)                                         # Stützpfosten


def schild(B, x, y, farbe):
    """Aushängeschild an einem Arm"""
    B.balken(x - 4, y, 30, 4, 41, 0.6)
    for dx in (4, 20):
        B.lege((40, 38, 40), B.rechteck(x + dx, y + 4, 1.5, 6))
    B.balken(x, y + 10, 26, 20, 42, 0.95)
    B.lege(farbe, ellipse(B, x + 13, y + 20, 7, 6)); B.lege(tuple(min(255, c + 60) for c in farbe), ellipse(B, x + 11, y + 18, 3, 2.4))


def banner(B, cx, y, b, h, farbe):
    """Hängendes Tuch mit Zipfel und heller Borte"""
    B.balken(cx - b / 2 - 3, y - 3, b + 6, 4, 43, 0.6)
    m = B.maske([(cx - b / 2, y), (cx + b / 2, y), (cx + b / 2, y + h), (cx, y + h - 12), (cx - b / 2, y + h)])
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    falte = (0.9 + 0.14 * np.sin((xx - cx) * 0.9))[..., None]
    B.lege(np.array(farbe, dtype=np.float32)[None, None, :] * falte, m)
    B.lege((214, 176, 86), B.rechteck(cx - b / 2, y + 5, b, 2.5) * m)
    B.lege((226, 190, 96), ellipse(B, cx, y + h * 0.42, 4.5, 4.5) * m)


def stand(P, rng):
    """Marktstand: Tisch mit Waren unter einem gestreiften Tuchdach"""
    b = P['b']; breit, hoch = b + 30, 138
    B = Blatt(breit, hoch); x0 = 15; yb = hoch - 16
    schatten(B, x0, x0 + b, yb, 22)
    for x in (x0 + 3, x0 + b - 8):                                                                        # hintere Pfosten
        B.balken(x, yb - 100, 5, 92, 51, 0.6)
    # Tisch mit Tuch und Waren
    B.balken(x0 + 4, yb - 40, b - 8, 34, 52, 0.9)
    B.lege(np.array(P['tuch'], dtype=np.float32) * 0.62, B.rechteck(x0 + 4, yb - 40, b - 8, 9))
    for i in range(int((b - 20) // 13)):
        cx = x0 + 14 + i * 13 + float(rng.uniform(-1.5, 1.5)); f = [(196, 70, 52), (226, 178, 72), (120, 152, 70), (206, 132, 60), (150, 96, 150), (230, 218, 190)][int(rng.integers(0, 6))]
        B.lege(f, ellipse(B, cx, yb - 44, 5, 4.2)); B.lege(tuple(min(255, c + 46) for c in f), ellipse(B, cx - 1.4, yb - 45.4, 2, 1.6))
    for x in (x0, x0 + b - 6):                                                                            # vordere Pfosten
        B.balken(x, yb - 104, 6, 104, 53, 0.78)
    # Tuchdach: Streifen, vorn ein Volant mit Zacken
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K; yy = np.arange(B.h, dtype=np.float32)[:, None] / K
    streif = ((np.floor((xx - x0 + 9) / 13) % 2) == 0)[..., None]
    hell = (1.1 - 0.32 * np.clip((yy - (yb - 128)) / 44, 0, 1))[..., None]
    tuch = np.where(streif, np.array(P['tuch'], dtype=np.float32), np.array([232, 220, 196], dtype=np.float32)) * hell
    B.lege(tuch, B.maske([(x0 + 2, yb - 128), (x0 + b - 2, yb - 128), (x0 + b + 9, yb - 92), (x0 - 9, yb - 92)]))
    zacken = [(x0 - 9, yb - 92)]
    for i in range(int((b + 18) // 13) + 1):
        zacken += [(x0 - 9 + i * 13 + 6.5, yb - 80), (min(x0 + b + 9, x0 - 9 + (i + 1) * 13), yb - 92)]
    B.lege(tuch * 0.8, B.maske(zacken))
    B.dunkel(B.rechteck(x0 - 9, yb - 93, b + 18, 2), 0.3)
    bf = round(b / FELD * 2) / 2
    return B.fertig(), [round((x0 + b / 2) / breit, 4), round(yb / hoch, 4)], {'art': 'rechteck', 'x': -bf / 2, 'y': -1.0, 'b': bf, 'h': 1.0}, {'art': 'haendler', 'dx': 0, 'dy': 0.8, 'radius': 1.4}, False


def brunnen(P, rng):
    """Gemauerter Rundbrunnen mit Wasser, zwei Pfosten, Winde und kleinem Schindeldach"""
    breit, hoch = 168, 196
    B = Blatt(breit, hoch); cx = breit / 2; yb = hoch - 22; rx, ry = 50, 24
    schatten(B, cx - rx, cx + rx, yb + 6, 34)
    for x in (cx - rx + 6, cx + rx - 12):                                                                 # Pfosten hinter dem Becken
        B.balken(x, yb - 132, 6, 110, 61, 0.7)
    # Beckenwand: Mantel aus Feldsteinen
    yo = yb - 34
    B.lege((60, 58, 56), B.rechteck(cx - rx, yo, 2 * rx, 34) + ellipse(B, cx, yb, rx, ry) * 1.0)
    B.bild[..., 3] = np.clip(B.bild[..., 3], 0, 255)
    mantel = np.clip(B.rechteck(cx - rx, yo, 2 * rx, 34) + ellipse(B, cx, yb, rx, ry), 0, 1)
    for j in range(5):
        n = 11
        for i in range(n):
            w = (i + (j % 2) * 0.5) / n * math.pi; x = cx - rx * math.cos(w); x2 = cx - rx * math.cos(min(math.pi, w + math.pi / n)); g = float(rng.uniform(104, 150)) * (0.8 + 0.3 * math.sin(w))
            y = yo + j * 9 + ry * math.sin(w) * 1.0
            B.lege((g, g * 0.97, g * 0.9), B.maske([(x + 0.8, y + 0.8), (x2 - 0.8, yo + j * 9 + ry * math.sin(min(math.pi, w + math.pi / n)) + 0.8), (x2 - 0.8, yo + j * 9 + ry * math.sin(min(math.pi, w + math.pi / n)) + 8), (x + 0.8, y + 8)]) * mantel)
    # Rand und Wasser
    B.lege((150, 146, 136), ellipse(B, cx, yo, rx, ry)); B.lege((98, 94, 88), ellipse(B, cx, yo, rx - 8, ry - 5))
    yy, xx = np.mgrid[0:B.h, 0:B.b].astype(np.float32) / K
    welle = (0.86 + 0.2 * np.sin(xx * 0.7 + yy * 1.3) * np.sin(yy * 0.9))[..., None]
    B.lege(np.array([52, 118, 138], dtype=np.float32) * welle, ellipse(B, cx, yo + 3, rx - 10, ry - 8))
    B.lege((190, 226, 230), ellipse(B, cx - 12, yo, 9, 2.2) * 0.55)
    # Winde mit Seil und Eimer
    B.balken(cx - rx + 8, yb - 112, 2 * rx - 16, 6, 62, 0.8)
    B.lege((196, 176, 132), B.rechteck(cx - 0.8, yb - 106, 1.6, 52))
    B.balken(cx - 7, yb - 56, 14, 13, 63, 0.9); B.lege((60, 58, 60), B.rechteck(cx - 7, yb - 52, 14, 2))
    # Dach
    P2 = dict(dachfarbe=(132, 88, 58))
    L, R, M = (cx - rx - 8, yb - 128), (cx + rx + 8, yb - 128), (cx, yb - 172)
    dachflaeche(B, [L, M, (M[0], M[1] - 0.1), (L[0], L[1])], P2, 1.0, saat=5)
    z = faerben(B.voll('dachziegel', 0.085, saat=5), P2['dachfarbe'])
    B.lege(z * 1.06, B.maske([L, M, (cx, yb - 128)])); B.lege(z * 0.74, B.maske([M, R, (cx, yb - 128)]))
    B.strich([L, M, R], 5, 64, 0.72); B.balken(L[0], L[1] - 2, R[0] - L[0], 5, 65, 0.7)
    return B.fertig(), [0.5, round(yb / hoch, 4)], {'art': 'kreis', 'r': 1.15, 'dy': -0.35}, {'art': 'lesen', 'dx': 0, 'dy': 1.3, 'radius': 1.6}, False


def stamm(B, x, yo, yu, b, rng, spitz=True):
    """Ein Palisadenstamm: rund schattiert, oben angespitzt"""
    hell = float(rng.uniform(0.72, 0.98))
    pk = [(x, yo + (b * 0.7 if spitz else 0)), (x + b / 2, yo), (x + b, yo + (b * 0.7 if spitz else 0)), (x + b, yu), (x, yu)]
    m = B.maske(pk)
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    rund = (0.66 + 0.5 * np.sin(np.clip((xx - x) / b, 0, 1) * math.pi) - 0.14 * np.clip((xx - x) / b, 0, 1))[..., None]
    B.lege(B.voll('maserung', 0.2, drehen=True, saat=int(x)) * hell * rund * 1.25, m)
    B.dunkel(np.clip(m - B.maske([(x + 1, yo + b * 0.7 + 1), (x + b / 2, yo + 1.6), (x + b - 1, yo + b * 0.7 + 1), (x + b - 1, yu), (x + 1, yu)]), 0, 1), 0.5)


def palisade(P, rng):
    b = P['b']; breit, hoch = b, 112
    B = Blatt(breit, hoch); yb = hoch - 10; x = 0.0; n = 8; w = b / n
    for i in range(n):
        stamm(B, i * w, yb - float(rng.uniform(84, 98)), yb, w, rng)
    B.balken(0, yb - 62, b, 6, 71, 0.62); B.balken(0, yb - 26, b, 6, 72, 0.62)
    B.dunkel(B.rechteck(0, yb - 8, b, 8), 0.3)
    return B.fertig(), [0.5, round(yb / hoch, 4)], {'art': 'rechteck', 'x': -1.0, 'y': -0.75, 'b': 2.0, 'h': 0.8}, None, False


def tor(P, rng):
    """Offenes Dorftor: zwei Türme aus Stämmen, Querbalken mit Schindeldach und Wimpeln; die Mitte ist frei"""
    b = P['b']; breit, hoch = b + 40, 236
    B = Blatt(breit, hoch); x0 = 20; yb = hoch - 12; tb = 38
    for xl in (x0, x0 + b - tb):
        for i in range(3):
            stamm(B, xl + i * tb / 3, yb - 168 - (6 if i == 1 else 0), yb, tb / 3, rng)
        for y in (yb - 120, yb - 60, yb - 20):
            B.balken(xl - 2, y, tb + 4, 6, 81, 0.6)
    # Querbalken und Dach darüber
    B.balken(x0 - 6, yb - 152, b + 12, 12, 82, 0.8); B.balken(x0 + tb, yb - 140, b - 2 * tb, 5, 83, 0.6)
    P2 = dict(dachfarbe=(132, 88, 58)); z = faerben(B.voll('dachziegel', 0.095, saat=8), P2['dachfarbe'])
    yy = np.arange(B.h, dtype=np.float32)[:, None] / K
    B.lege(z * (1.1 - 0.3 * np.clip((yy - (yb - 206)) / 50, 0, 1))[..., None], B.maske([(x0 + 4, yb - 206), (x0 + b - 4, yb - 206), (x0 + b + 14, yb - 156), (x0 - 14, yb - 156)]))
    B.balken(x0 + 2, yb - 209, b - 4, 6, 84, 0.9); B.dunkel(B.rechteck(x0 - 14, yb - 160, b + 28, 4), 0.35)
    for fx in (0.36, 0.64):
        banner(B, x0 + b * fx, yb - 138, 16, 40, (58, 110, 78))
    # Laternen an den Türmen
    for xl in (x0 + tb + 5, x0 + b - tb - 5):
        B.lege((40, 38, 40), B.rechteck(xl - 4, yb - 108, 8, 12)); B.lege((255, 200, 96), B.rechteck(xl - 2.6, yb - 106, 5.2, 8))
    return B.fertig(), [0.5, round(yb / hoch, 4)], None, None, False


def blumenkasten(B, cx, y, b, rng):
    """Kasten unter dem Fenster mit Grün und ein paar Blüten"""
    for i in range(9):
        x = cx - b / 2 + 2 + i * (b - 4) / 8
        B.lege((52 + int(rng.integers(0, 30)), 96 + int(rng.integers(0, 30)), 38), ellipse(B, x, y - 1, 3.4, 3.2))
    for i in range(5):
        x = cx - b / 2 + 4 + float(rng.uniform(0, b - 8)); f = [(214, 70, 64), (236, 196, 72), (222, 222, 230), (190, 110, 200)][int(rng.integers(0, 4))]
        B.lege(f, ellipse(B, x, y - 3 - float(rng.uniform(0, 2)), 1.9, 1.9))
    B.balken(cx - b / 2, y + 1, b, 6, 91, 0.75)


def klein_blatt(breit, hoch):
    return Blatt(breit, hoch)


def fass(P, rng):
    """Stehendes Fass: Dauben aus Brettern, zwei Eisenreifen, Deckel oben"""
    B = Blatt(48, 60); cx, yb, r = 24, 52, 14
    schatten(B, cx - r, cx + r, yb, 10)
    m = B.rechteck(cx - r, yb - 34, 2 * r, 34) + ellipse(B, cx, yb, r, 5)
    m = np.clip(m, 0, 1)
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    rund = (0.62 + 0.5 * np.sin(np.clip((xx - (cx - r)) / (2 * r), 0, 1) * math.pi) - 0.12 * np.clip((xx - (cx - r)) / (2 * r), 0, 1))[..., None]
    B.lege(B.voll('bretter', 0.05, saat=P['saat']) * rund * 0.95, m)
    for y in (yb - 28, yb - 8):
        B.lege((48, 46, 48), B.rechteck(cx - r, y, 2 * r, 3) + ellipse(B, cx, y + 3, r, 2) * 0)
    B.lege((96, 70, 44), ellipse(B, cx, yb - 34, r, 5)); B.lege((70, 50, 32), ellipse(B, cx, yb - 34, r - 3, 3.4))
    return B.fertig(), [0.5, round(yb / 60, 4)], {'art': 'kreis', 'r': 0.35}, None, False


def kiste(P, rng):
    """Holzkiste mit Deckel und Querlatten"""
    B = Blatt(64, 54); x0, yb, b, h, t = 10, 46, 40, 24, 10
    schatten(B, x0, x0 + b, yb, 10)
    B.lege(B.voll('bretter', 0.06, drehen=True, saat=P['saat']) * 0.95, B.rechteck(x0, yb - h, b, h))
    B.lege(B.voll('bretter', 0.06, drehen=True, saat=P['saat'] + 1) * 1.12, B.maske([(x0, yb - h), (x0 + b, yb - h), (x0 + b - 4, yb - h - t), (x0 + 4, yb - h - t)]))
    for x in (x0, x0 + b - 5):
        B.balken(x, yb - h, 5, h, 92, 0.7)
    B.balken(x0, yb - h, b, 4, 93, 0.7); B.strich([(x0 + 4, yb - 4), (x0 + b - 5, yb - h + 4)], 3.5, 94, 0.62)
    return B.fertig(), [0.5, round(yb / 54, 4)], {'art': 'rechteck', 'x': -0.45, 'y': -0.55, 'b': 0.9, 'h': 0.55}, None, False


def holzstapel(P, rng):
    """Scheitholz: Stirnseiten der Scheite übereinander, unter einem kleinen Brettdach"""
    B = Blatt(96, 82); x0, yb, b = 10, 74, 76
    schatten(B, x0, x0 + b, yb, 14)
    for x in (x0, x0 + b - 5):
        B.balken(x, yb - 58, 5, 58, 95, 0.62)
    reihen = 4
    for j in range(reihen):
        for i in range(7):
            cx = x0 + 8 + i * 10.2 + (j % 2) * 4.5; cy = yb - 6 - j * 10
            if cx > x0 + b - 6:
                continue
            g = float(rng.uniform(0.85, 1.1))
            B.lege((int(150 * g), int(112 * g), int(66 * g)), ellipse(B, cx, cy, 5.2, 4.6))
            B.lege((int(186 * g), int(146 * g), int(92 * g)), ellipse(B, cx - 0.6, cy - 0.5, 3.4, 2.9))
            B.lege((int(120 * g), int(84 * g), int(46 * g)), ellipse(B, cx - 0.4, cy - 0.3, 0.9, 0.8))
    z = faerben(B.voll('bretter', 0.06, saat=P['saat']), (110, 84, 56))
    B.lege(z * 0.9, B.maske([(x0 - 4, yb - 58), (x0 + b + 4, yb - 58), (x0 + b + 8, yb - 50), (x0 - 8, yb - 50)]))
    return B.fertig(), [0.5, round(yb / 82, 4)], {'art': 'rechteck', 'x': -0.8, 'y': -0.6, 'b': 1.6, 'h': 0.6}, None, False


def bank(P, rng):
    """Sitzbank aus Brettern"""
    B = Blatt(86, 44); x0, yb, b = 8, 38, 70
    schatten(B, x0, x0 + b, yb, 8)
    for x in (x0 + 6, x0 + b - 12):
        B.balken(x, yb - 15, 6, 15, 96, 0.6)
    B.lege(B.voll('bretter', 0.055, drehen=True, saat=P['saat']) * 1.05, B.rechteck(x0, yb - 20, b, 6))
    B.lege(B.voll('bretter', 0.055, drehen=True, saat=P['saat'] + 3) * 0.8, B.rechteck(x0 + 2, yb - 31, b - 4, 7))
    B.dunkel(B.rechteck(x0, yb - 15, b, 2), 0.4)
    return B.fertig(), [0.5, round(yb / 44, 4)], {'art': 'rechteck', 'x': -0.72, 'y': -0.35, 'b': 1.44, 'h': 0.35}, None, False


def heu(P, rng):
    """Runder Heuballen mit Halmen"""
    B = Blatt(70, 60); cx, yb, r = 35, 52, 25
    schatten(B, cx - r, cx + r, yb, 12)
    m = ellipse(B, cx, yb - 18, r, 19) + B.rechteck(cx - r, yb - 18, 2 * r, 14) + ellipse(B, cx, yb - 4, r, 6)
    m = np.clip(m, 0, 1)
    yy, xx = np.mgrid[0:B.h, 0:B.b].astype(np.float32) / K
    licht = (1.1 - 0.4 * np.clip((xx - (cx - r)) / (2 * r), 0, 1) - 0.2 * np.clip((yy - (yb - 37)) / 37, 0, 1))[..., None]
    gras = np.array([196, 168, 92], dtype=np.float32)[None, None, :] * (0.9 + 0.12 * np.sin(xx * 2.1 + np.sin(yy * 1.7) * 2)[..., None])
    B.lege(gras * licht, m)
    for k in range(40):
        x, y = cx + float(rng.uniform(-r, r)), yb - float(rng.uniform(4, 34)); a = float(rng.uniform(-1, 1))
        B.lege((222, 196, 120), ellipse(B, x, y, 1.2, 0.5))
    B.lege((150, 120, 60), ellipse(B, cx + r * 0.35, yb - 18, r * 0.35, 13) * 0.0 + B.rechteck(cx - r, yb - 13, 2 * r, 1.4))
    return B.fertig(), [0.5, round(yb / 60, 4)], {'art': 'kreis', 'r': 0.5}, None, False


def laterne(P, rng):
    """Laternenpfahl mit warm leuchtender Laterne"""
    B = Blatt(40, 128); cx, yb = 20, 122
    schatten(B, cx - 6, cx + 6, yb, 6)
    B.balken(cx - 3, yb - 92, 6, 92, 98, 0.7); B.balken(cx - 3, yb - 92, 16, 4, 99, 0.7)
    lx, ly = cx + 10, yb - 84
    B.lege((40, 38, 40), B.rechteck(lx - 6, ly, 12, 18)); B.lege((40, 38, 40), B.maske([(lx - 7, ly), (lx + 7, ly), (lx, ly - 6)]))
    yy, xx = np.mgrid[0:B.h, 0:B.b].astype(np.float32) / K
    glut = np.clip(1 - np.hypot((xx - lx) / 5, (yy - ly - 9) / 7), 0, 1)[..., None]
    B.lege(np.array([255, 170, 70], dtype=np.float32) * (1 - glut) + np.array([255, 240, 180], dtype=np.float32) * glut, B.rechteck(lx - 4, ly + 2, 8, 14))
    return B.fertig(), [0.5, round(yb / 128, 4)], {'art': 'kreis', 'r': 0.18}, None, False


def rinde(B, rng, hell=1.0, hochkant=False):
    """Rinde ohne Fotovorlage: längs gestreckte Rauschstreifen mit Furchen (frei von Lizenzfragen); hochkant: Streifen senkrecht"""
    h, b = B.h, B.b
    n = rng.normal(0, 1, (h // 14 + 2, b // 2 + 2) if hochkant else (h // 2 + 2, b // 14 + 2)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((b, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6 * K))
    f = np.asarray(im).astype(np.float32) / 255
    furche = np.clip((0.42 - f) * 3.2, 0, 1)                      # dunkle Risse zwischen den Borkenplatten
    grund = np.array([104, 80, 58], dtype=np.float32) * hell
    a = grund[None, None, :] * (0.8 + 0.4 * f[..., None]) * (1 - 0.55 * furche[..., None])
    return a


def baumstamm(P, rng):
    """Ein umgestürzter Baum quer über dem Weg: links der ausgerissene Wurzelteller mit Erde, rechts das abgebrochene Ende, Aststümpfe, Moos, Gras am Fuß"""
    W, H = 520, 196; B = Blatt(W, H)
    x0, x1, yb = 112, 470, 172                                   # Stamm von x0 bis x1, liegt bei yb auf
    d0, d1 = 58, 40                                              # Durchmesser am Wurzel- und am Bruchende
    schatten(B, x0 - 50, x1 + 6, yb + 6, 22)
    yy = np.arange(B.h, dtype=np.float32)[:, None] / K
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    # Wurzelteller: große, unregelmäßige Scheibe aus Erde, schräg aufgestellt; Wurzeln hängen heraus
    cx, cy, rx, ry = 74, 104, 50, 74
    form = lambda t, k=1.0: (cx + math.cos(t) * rx * k * (1 + 0.12 * math.sin(3 * t + 1) + 0.06 * math.sin(7 * t)), cy + math.sin(t) * ry * k * (1 + 0.09 * math.sin(5 * t + 2)))
    m = B.maske([form(t) for t in np.linspace(0, 2 * math.pi, 48, endpoint=False)])
    innen = B.maske([form(t, 0.8) for t in np.linspace(0, 2 * math.pi, 48, endpoint=False)])
    licht = np.clip(1.15 - 0.55 * np.clip((yy - (cy - ry)) / (2 * ry), 0, 1) - 0.25 * np.clip((xx - cx) / rx, 0, 1), 0.4, 1.2)
    erde = rinde(B, rng, 0.62) * np.array([1.0, 0.82, 0.66], dtype=np.float32) * licht[..., None]
    B.lege(erde, m)
    B.dunkel(np.clip(m - innen, 0, 1), 0.25)                                    # dunklerer Rand
    for _ in range(30):                                                          # Wurzeln: gebogen, innen dick, außen dünn, teils über den Rand hinaus
        t = rng.uniform(0, 2 * math.pi); r1 = rng.uniform(0.55, 1.18); kr = rng.uniform(-0.5, 0.5)
        punkte = [form(t + kr * f * 0.6, 0.15 + f * (r1 - 0.15)) for f in np.linspace(0, 1, 6)]
        for i in range(len(punkte) - 1):
            mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).line([(punkte[i][0] * K, punkte[i][1] * K), (punkte[i + 1][0] * K, punkte[i + 1][1] * K)], fill=255, width=max(1, round((5.5 - i * 0.9) * rng.uniform(0.6, 1.0) * K)))
            mm = np.asarray(mm).astype(np.float32) / 255
            g = float(rng.uniform(0.85, 1.1)); B.lege((int(118 * g), int(90 * g), int(62 * g)), mm)
    for _ in range(9):                                                           # Steine im Wurzelwerk
        t = rng.uniform(0, 2 * math.pi); sx, sy = form(t, rng.uniform(0.1, 0.7)); g = float(rng.uniform(0.8, 1.1)); r = rng.uniform(3, 7)
        B.lege((int(120 * g), int(117 * g), int(110 * g)), ellipse(B, sx, sy, r, r * 0.75)); B.lege((int(150 * g), int(147 * g), int(140 * g)), ellipse(B, sx - r * 0.25, sy - r * 0.25, r * 0.45, r * 0.3))
    # Stamm: rund schattiert, oben im Licht, unten dunkel, zum Bruchende dünner
    def oben(x): t = (x - x0) / (x1 - x0); return yb - (d0 + (d1 - d0) * t)
    pk = [(x0 - 6, oben(x0) + 4)] + [(x, oben(x) + 1.8 * math.sin(x / 23)) for x in np.linspace(x0, x1, 26)] + [(x1, yb), (x0 - 6, yb - 2)]
    m = B.maske(pk)
    dd = d0 + (d1 - d0) * np.clip((xx - x0) / (x1 - x0), 0, 1)
    v = np.clip((yy - (yb - dd)) / dd, 0, 1)                                     # 0 oben, 1 unten
    rund = 0.5 + 0.75 * np.sin(np.clip(v * 0.85 + 0.12, 0, 1) * math.pi) - 0.42 * v + 0.28 * np.clip(1 - v * 4, 0, 1)
    B.lege(rinde(B, rng) * rund[..., None], m)
    moos = Image.fromarray((rng.random((B.h // 7, B.b // 7)) * 255).astype(np.uint8)).resize((B.b, B.h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2 * K))
    moos = np.clip((np.asarray(moos).astype(np.float32) / 255 - 0.5) * 4, 0, 1) * np.clip(1 - v * 2.4, 0, 1) * m
    B.lege(np.array([96, 124, 56], dtype=np.float32) * (0.8 + 0.4 * rng.random((B.h, B.b, 1)).astype(np.float32)), moos * 0.9)
    # abgebrochenes Ende: helles, splittriges Holz mit Jahresringen
    ye = (oben(x1) + yb) / 2
    B.lege((150, 116, 76), ellipse(B, x1 + 2, ye, 8, d1 / 2))
    B.lege((186, 150, 100), ellipse(B, x1 + 4, ye, 6, d1 / 2 - 4))
    for r in (4, 9, 14):
        mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).ellipse([(x1 + 4 - r * 0.4) * K, (ye - r) * K, (x1 + 4 + r * 0.4) * K, (ye + r) * K], outline=255, width=K)
        B.dunkel(np.asarray(mm).astype(np.float32) / 255, 0.22)
    sp = [(x1 + 4, ye - d1 / 2 + 2), (x1 + 18, ye - 8), (x1 + 8, ye - 3), (x1 + 22, ye + 4), (x1 + 8, ye + 8), (x1 + 6, ye + d1 / 2 - 4)]
    B.lege((198, 164, 112), B.maske(sp))
    # Aststümpfe nach oben, einer mit dürrem Zweig
    for ax, lang, neig in ((206, 38, -0.35), (300, 52, 0.25), (392, 28, -0.15)):
        y0 = oben(ax) + 8; b = 11 if lang > 30 else 8
        spitze = (ax + neig * lang, y0 - lang)
        B.lege(rinde(B, rng, 1.0) * 0.92, B.maske([(ax - b / 2, y0), (spitze[0] - 2.5, spitze[1]), (spitze[0] + 2.5, spitze[1]), (ax + b / 2, y0)]))
        B.lege((178, 142, 94), ellipse(B, spitze[0], spitze[1], 3, 1.8))
        if lang > 40:
            for z in ([(spitze[0] - neig * 16, spitze[1] + 16), (spitze[0] + 16, spitze[1] + 3), (spitze[0] + 26, spitze[1] - 6)], [(spitze[0] + 16, spitze[1] + 3), (spitze[0] + 22, spitze[1] + 10)]):
                mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).line([(x * K, y * K) for x, y in z], fill=255, width=round(2.2 * K), joint='curve')
                B.lege((100, 76, 52), np.asarray(mm).astype(np.float32) / 255)
    # Gras und Farn am Fuß: der Stamm liegt im Bewuchs, nicht auf dem Boden obenauf
    for _ in range(70):
        gx = rng.uniform(x0 - 50, x1 + 10); gy = yb + rng.uniform(-3, 5); hh = rng.uniform(7, 17); g = float(rng.uniform(0.8, 1.15)); n = rng.uniform(-4, 4)
        B.lege((int(78 * g), int(112 * g), int(48 * g)), B.maske([(gx - 2.2, gy), (gx + n, gy - hh), (gx + 2.2, gy)]))
    return B.fertig(), [round((x0 + x1) / 2 / W, 4), round(yb / H, 4)], {'art': 'rechteck', 'x': -4.9, 'y': -0.9, 'b': 9.8, 'h': 1.0}, {'art': 'lesen', 'dx': 0, 'dy': 0.9, 'radius': 1.6}, False

def baumstamm_tief(P, rng):
    """Ein umgestürzter Baum, der von vorn nach hinten liegt (quer über einem Weg von West nach Ost).
    Schrägansicht wie die Gebäude: je Feld nach hinten 48 Bildpunkte hinauf und 0,32 · 48 nach rechts. Vorn der Wurzelteller, von vorn gesehen; hinten das Bruchende."""
    LF = 9; T = 0.32
    W, H = 300, 600; B = Blatt(W, H)
    fx, fy = 96, 548; bx, by = fx + T * LF * FELD, fy - LF * FELD          # Fußpunkt vorn, Ende hinten (Mitte des Stamms am Boden)
    d0, d1 = 58, 42
    yy = np.arange(B.h, dtype=np.float32)[:, None] / K
    xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    t = np.clip((fy - yy) / (fy - by), 0, 1)                               # 0 vorn, 1 hinten
    achse = fx + (bx - fx) * t - 0.0
    halb = (d0 + (d1 - d0) * t) / 2
    oben = - halb * 0.9                                                    # die Oberseite liegt um den Radius höher
    u = (xx - achse) / halb                                                # quer zum Stamm: -1 links, +1 rechts
    # Schatten rechts neben dem Stamm
    sm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(sm).polygon([((fx + 10) * K, fy * K), ((bx + 14) * K, by * K), ((bx + 40) * K, (by + 8) * K), ((fx + 44) * K, (fy + 6) * K)], fill=140)
    B.bild[..., 3] = np.maximum(B.bild[..., 3], np.asarray(sm.filter(ImageFilter.GaussianBlur(6 * K))).astype(np.float32) * 0.5)
    m = ((np.abs(u) <= 1) & (yy <= fy - 10) & (yy >= by - halb * 0.6)).astype(np.float32)
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5 * K))).astype(np.float32) / 255
    rund = 0.55 + 0.6 * np.cos(np.clip(u, -1, 1) * math.pi / 2) - 0.28 * u
    B.lege(rinde(B, rng, 1.0, hochkant=True) * rund[..., None], m)
    moos = Image.fromarray((rng.random((B.h // 7, B.b // 7)) * 255).astype(np.uint8)).resize((B.b, B.h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2 * K))
    moos = np.clip((np.asarray(moos).astype(np.float32) / 255 - 0.5) * 4, 0, 1) * np.clip(0.6 - u, 0, 1) * m
    B.lege(np.array([96, 124, 56], dtype=np.float32) * (0.8 + 0.4 * rng.random((B.h, B.b, 1)).astype(np.float32)), moos * 0.9)
    # hinten: abgebrochenes, splittriges Ende
    B.lege((186, 150, 100), ellipse(B, bx, by - 2, d1 / 2 - 2, 7))
    for r in (5, 10, 15):
        mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).ellipse([(bx - r) * K, (by - 2 - r * 0.33) * K, (bx + r) * K, (by - 2 + r * 0.33) * K], outline=255, width=K)
        B.dunkel(np.asarray(mm).astype(np.float32) / 255, 0.22)
    B.lege((198, 164, 112), B.maske([(bx - 16, by - 4), (bx - 8, by - 20), (bx - 2, by - 8), (bx + 6, by - 24), (bx + 10, by - 6), (bx + 18, by - 2)]))
    # Aststümpfe, schräg nach oben rechts
    for tt, lang in ((0.38, 40), (0.62, 30), (0.82, 22)):
        ax = fx + (bx - fx) * tt + 8; ay = fy - (fy - by) * tt - 6; b = 10 if lang > 30 else 8
        sp = (ax + lang * 0.45, ay - lang)
        B.lege(rinde(B, rng, 0.95) * 0.95, B.maske([(ax - b / 2, ay), (sp[0] - 2.5, sp[1]), (sp[0] + 2.5, sp[1]), (ax + b / 2, ay)]))
        B.lege((178, 142, 94), ellipse(B, sp[0], sp[1], 3, 1.8))
    # vorn: der aufgestellte Wurzelteller, von vorn gesehen
    cx, cy, rx, ry = fx, fy - 54, 70, 62
    form = lambda w, k=1.0: (cx + math.cos(w) * rx * k * (1 + 0.12 * math.sin(3 * w + 1) + 0.06 * math.sin(7 * w)), cy + math.sin(w) * ry * k * (1 + 0.09 * math.sin(5 * w + 2)))
    m = B.maske([form(w) for w in np.linspace(0, 2 * math.pi, 48, endpoint=False)])
    innen = B.maske([form(w, 0.8) for w in np.linspace(0, 2 * math.pi, 48, endpoint=False)])
    licht = np.clip(1.15 - 0.5 * np.clip((yy - (cy - ry)) / (2 * ry), 0, 1) - 0.2 * np.clip((xx - cx) / rx, 0, 1), 0.4, 1.2)
    B.lege(rinde(B, rng, 0.62) * np.array([1.0, 0.82, 0.66], dtype=np.float32) * licht[..., None], m)
    B.dunkel(np.clip(m - innen, 0, 1), 0.25)
    for _ in range(34):
        w = rng.uniform(0, 2 * math.pi); r1 = rng.uniform(0.55, 1.16); kr = rng.uniform(-0.5, 0.5)
        punkte = [form(w + kr * f * 0.6, 0.12 + f * (r1 - 0.12)) for f in np.linspace(0, 1, 6)]
        for i in range(len(punkte) - 1):
            mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).line([(punkte[i][0] * K, punkte[i][1] * K), (punkte[i + 1][0] * K, punkte[i + 1][1] * K)], fill=255, width=max(1, round((6 - i * 1.0) * rng.uniform(0.6, 1.0) * K)))
            g = float(rng.uniform(0.85, 1.1)); B.lege((int(118 * g), int(90 * g), int(62 * g)), np.asarray(mm).astype(np.float32) / 255)
    for _ in range(9):
        w = rng.uniform(0, 2 * math.pi); sx, sy = form(w, rng.uniform(0.1, 0.7)); g = float(rng.uniform(0.8, 1.1)); r = rng.uniform(3, 7)
        B.lege((int(120 * g), int(117 * g), int(110 * g)), ellipse(B, sx, sy, r, r * 0.75)); B.lege((int(150 * g), int(147 * g), int(140 * g)), ellipse(B, sx - r * 0.25, sy - r * 0.25, r * 0.45, r * 0.3))
    # Gras an beiden Seiten des Stamms und vor dem Wurzelteller
    for _ in range(90):
        tt = rng.uniform(0, 1); seite = rng.choice([-1, 1]); h0 = (d0 + (d1 - d0) * tt) / 2
        gx = fx + (bx - fx) * tt + seite * (h0 + rng.uniform(-3, 3)); gy = fy - (fy - by) * tt + rng.uniform(-2, 4)
        if tt < 0.05: gx = cx + rng.uniform(-rx, rx); gy = cy + ry * 0.85 + rng.uniform(-2, 6)
        hh = rng.uniform(7, 16); g = float(rng.uniform(0.8, 1.15)); n = rng.uniform(-4, 4)
        B.lege((int(78 * g), int(112 * g), int(48 * g)), B.maske([(gx - 2.2, gy), (gx + n, gy - hh), (gx + 2.2, gy)]))
    return B.fertig(), [round(fx / W, 4), round(fy / H, 4)], {'art': 'rechteck', 'x': -0.7, 'y': -LF, 'b': 1.4, 'h': LF}, {'art': 'lesen', 'dx': 0, 'dy': 0.9, 'radius': 1.6}, False


def stein(B, cx, cy, rx, ry, rng, grau=None):
    """Ein runder Feldstein: dunkler Fuß, heller Kopf mit Lichtkante oben links"""
    g = grau if grau is not None else float(rng.uniform(0.82, 1.1))
    B.lege((int(70 * g), int(68 * g), int(64 * g)), ellipse(B, cx + rx * 0.08, cy + ry * 0.12, rx, ry))
    B.lege((int(132 * g), int(128 * g), int(118 * g)), ellipse(B, cx, cy, rx * 0.92, ry * 0.86))
    B.lege((int(168 * g), int(162 * g), int(150 * g)), ellipse(B, cx - rx * 0.25, cy - ry * 0.3, rx * 0.45, ry * 0.35))


def feuer(P, rng):
    """Erntefeuer: Ring aus Feldsteinen, Scheite als Zelt, Flammen und Glut (Draufsicht schräg von vorn)"""
    W, H = 200, 190; B = Blatt(W, H); cx, cy, rx, ry = 100, 148, 70, 30
    schatten(B, cx - rx, cx + rx, cy + 10, 22)
    B.lege((44, 34, 28), ellipse(B, cx, cy, rx - 6, ry - 4))                          # Asche und Erde im Ring
    B.lege((90, 40, 20), ellipse(B, cx, cy + 2, rx * 0.55, ry * 0.5))                 # Glut
    B.lege((210, 96, 30), ellipse(B, cx, cy + 2, rx * 0.35, ry * 0.32))
    steine = sorted([(cx + math.cos(t) * rx, cy + math.sin(t) * ry, t) for t in np.linspace(0, 2 * math.pi, 18, endpoint=False)], key=lambda p: p[1])
    hinten = [p for p in steine if p[1] <= cy]; vorn = [p for p in steine if p[1] > cy]
    for x, y, t in hinten:
        stein(B, x, y, 11, 8, rng)
    for i in range(7):                                                                # Scheite, zu einem Zelt gestellt
        t = i / 7 * 2 * math.pi; fx, fy = cx + math.cos(t) * 30, cy + math.sin(t) * 13
        B.strich([(fx, fy), (cx + math.cos(t) * 4, cy - 52)], 7, 40 + i, 0.6)
    for farbe, hoch, breit in (((228, 96, 28), 100, 36), ((246, 158, 44), 80, 25), ((255, 228, 130), 56, 13)):
        pk = [(cx - breit, cy - 6), (cx - breit * 0.6, cy - hoch * 0.55), (cx - breit * 0.2, cy - hoch * 0.72), (cx, cy - hoch), (cx + breit * 0.35, cy - hoch * 0.68), (cx + breit * 0.7, cy - hoch * 0.45), (cx + breit, cy - 6)]
        m = B.maske(pk); m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2 * K))).astype(np.float32) / 255
        B.lege(farbe, m)
    for x, y, t in vorn:
        stein(B, x, y, 12, 9, rng)
    return B.fertig(), [0.5, round((cy + ry + 6) / H, 4)], {'art': 'rechteck', 'x': -1.5, 'y': -1.4, 'b': 3.0, 'h': 1.3}, {'art': 'lesen', 'dx': 0, 'dy': 0.6, 'radius': 2.2}, False


def steinring(P, rng):
    """Beet aus Feldsteinen für einen großen Baum: Gras und Blumen innen. Der Baum wird als eigenes Objekt in die Mitte gestellt."""
    W, H = 260, 150; B = Blatt(W, H); cx, cy, rx, ry = 130, 74, 112, 50
    B.lege((84, 112, 50), ellipse(B, cx, cy, rx - 8, ry - 6))
    for _ in range(140):
        t = rng.uniform(0, 2 * math.pi); r = math.sqrt(rng.uniform(0.05, 0.85)); x, y = cx + math.cos(t) * r * (rx - 14), cy + math.sin(t) * r * (ry - 10)
        g = float(rng.uniform(0.8, 1.2)); B.lege((int(70 * g), int(108 * g), int(44 * g)), B.maske([(x - 2, y), (x + rng.uniform(-3, 3), y - rng.uniform(6, 12)), (x + 2, y)]))
    for _ in range(40):
        t = rng.uniform(0, 2 * math.pi); r = math.sqrt(rng.uniform(0.1, 0.8)); x, y = cx + math.cos(t) * r * (rx - 16), cy + math.sin(t) * r * (ry - 12)
        f = [(236, 228, 210), (226, 190, 70), (190, 120, 190), (214, 90, 80)][int(rng.integers(0, 4))]
        B.lege(f, ellipse(B, x, y - 3, 2.6, 2.2))
    for x, y, t in sorted([(cx + math.cos(t) * rx, cy + math.sin(t) * ry, t) for t in np.linspace(0, 2 * math.pi, 26, endpoint=False)], key=lambda p: p[1]):
        stein(B, x, y, 12, 9, rng)
    return B.fertig(), [0.5, round((cy + ry + 8) / H, 4)], {'art': 'rechteck', 'x': -2.2, 'y': -2.3, 'b': 4.4, 'h': 2.2}, None, False


def mauer(B, x0, y0, x1, y1, rng, reihen=4):
    """Bruchsteinmauer als Vorderfläche: Reihen aus ungleich breiten Steinen mit dunklen Fugen"""
    B.lege((58, 56, 52), B.rechteck(x0, y0, x1 - x0, y1 - y0))
    hr = (y1 - y0) / reihen
    for j in range(reihen):
        x = x0 - rng.uniform(0, 14)
        while x < x1:
            b = rng.uniform(16, 30); g = float(rng.uniform(0.78, 1.1))
            xa, xb = max(x0, x + 1), min(x1, x + b - 1)
            if xb > xa:
                yy = y0 + j * hr
                B.lege((int(128 * g), int(124 * g), int(114 * g)), B.rechteck(xa, yy + 1, xb - xa, hr - 2))
                B.lege((int(156 * g), int(150 * g), int(138 * g)), B.rechteck(xa, yy + 1, xb - xa, 2.2))
            x += b


def wehr(P, rng):
    """Steinwehr über dem Mühlgraben (der Graben läuft nach Süden, auf den Betrachter zu): Mauer mit drei Überläufen,
    Wasser stürzt herab und schäumt unten; oben ein Laufsteg mit Geländer"""
    W, H = 380, 170; B = Blatt(W, H); x0, x1, yt, yb = 20, 360, 66, 124       # Vorderkante oben yt, Wasser unten yb
    B.lege((118, 112, 100), B.maske([(x0 + 10, yt - 24), (x1 + 10, yt - 24), (x1, yt), (x0, yt)]))                    # Krone (Oberseite, schräg gesehen)
    B.lege((96, 90, 80), B.maske([(x0 + 10, yt - 26), (x1 + 10, yt - 26), (x1 + 10, yt - 22), (x0 + 10, yt - 22)]))
    mauer(B, x0, yt, x1, yb, rng, 4)
    oeff = [(x0 + 62 + i * 98, 44) for i in range(3)]
    for ox, ob in oeff:
        B.lege((40, 52, 58), B.rechteck(ox, yt - 2, ob, yb - yt + 2))
        yy = np.arange(B.h, dtype=np.float32)[:, None] / K
        xx = np.arange(B.b, dtype=np.float32)[None, :] / K
        streif = 0.5 + 0.5 * np.sin(xx * 1.7 + rng.uniform(0, 6)) * np.sin(xx * 0.53)
        wasser = np.stack([170 + 60 * streif, 200 + 45 * streif, 214 + 30 * streif], -1) * (0.85 + 0.15 * np.clip((yy - yt) / (yb - yt), 0, 1))[..., None]
        B.lege(wasser, B.rechteck(ox + 2, yt - 4, ob - 4, yb - yt + 6))
        for _ in range(18):                                                           # Schaum unten
            fx = ox + rng.uniform(-8, ob + 8); fy = yb + rng.uniform(-2, 14); r = rng.uniform(4, 10)
            B.lege((236, 244, 248), ellipse(B, fx, fy, r, r * 0.55))
    # Geländer auf der Krone
    for x in np.linspace(x0 + 14, x1 + 4, 9):
        B.balken(x, yt - 58, 5, 36, int(x), 0.62)
    B.strich([(x0 + 12, yt - 52), (x1 + 8, yt - 52)], 5, 77, 0.7); B.strich([(x0 + 12, yt - 38), (x1 + 8, yt - 38)], 4, 78, 0.65)
    return B.fertig(), [0.5, round(yb / H, 4)], None, {'art': 'lesen', 'dx': 0, 'dy': 0.6, 'radius': 2.0}, False   # begehbar: die Region gibt die Krone frei


def zaun(P, rng):
    """Niedriger Holzzaun: Pfosten und zwei Latten, 2 Felder lang"""
    W, H = 110, 70; B = Blatt(W, H); yb = 62
    for x in (8, 52, 96):
        B.balken(x, yb - 44, 6, 44, x, 0.66)
    B.strich([(6, yb - 34), (104, yb - 36)], 5, 81, 0.78); B.strich([(6, yb - 16), (104, yb - 18)], 5, 82, 0.72)
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'rechteck', 'x': -1.0, 'y': -0.3, 'b': 2.0, 'h': 0.3}, None, False


def kuerbisse(P, rng):
    """Ein kleiner Haufen Kürbisse"""
    W, H = 120, 80; B = Blatt(W, H); yb = 70
    for x, y, r in sorted([(30, 60, 15), (58, 63, 18), (88, 60, 14), (44, 45, 13), (74, 46, 13), (60, 32, 11)], key=lambda p: p[1]):
        g = float(rng.uniform(0.88, 1.08))
        B.lege((int(150 * g), int(70 * g), int(20 * g)), ellipse(B, x, y, r, r * 0.8))
        B.lege((int(226 * g), int(128 * g), int(40 * g)), ellipse(B, x - 1, y - 1, r * 0.92, r * 0.72))
        for dx in (-0.45, 0, 0.45):
            B.dunkel(ellipse(B, x + dx * r, y, r * 0.08, r * 0.7), 0.25)
        B.lege((250, 176, 90), ellipse(B, x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.15))
        B.lege((86, 104, 40), B.rechteck(x - 1.5, y - r * 0.8 - 5, 3, 6))
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'rechteck', 'x': -1.0, 'y': -0.5, 'b': 2.0, 'h': 0.5}, None, False


def bruecke(P, rng):
    """Holzbrücke in der Schrägansicht der Gebäude (je Feld Tiefe 0,32 Felder nach rechts): Bohlen, Randbalken, niedriges Geländer.
    quer: Ost–West, 6 × 2,6 Felder (über einen Graben, der nach Süden fließt); laengs: Nord–Süd, 2,6 × 5 Felder. Wird unter den Figuren gezeichnet."""
    quer = P['richtung'] == 'quer'; LX, LD = (6.0, 2.6) if quer else (2.6, 5.0); T = 0.32
    x0, x1 = -LX / 2, LX / 2
    W = int((LX + T * LD) * FELD + 40); Hh = int((LD + 1.1) * FELD + 40); ox = int(-x0 * FELD + 18); oy = Hh - 16
    B = Blatt(W, Hh)
    S = lambda x, d, z=0.0: (ox + (x + T * d) * FELD, oy - (d + z) * FELD)
    zd = 0.14
    def gelaender(seite):
        """Pfosten und zwei Holme entlang einer Längsseite"""
        if quer:
            d = 0.12 if seite == 'vorn' else LD - 0.12; punkte = [(x, d) for x in np.linspace(x0 + 0.15, x1 - 0.15, 4)]
        else:
            x = x0 + 0.12 if seite == 'links' else x1 - 0.12; punkte = [(x, d) for d in np.linspace(0.15, LD - 0.15, 4)]
        for x, d in punkte:
            a, b = S(x, d, zd), S(x, d, zd + 0.85)
            B.balken(a[0] - 3, b[1], 6, a[1] - b[1], int(a[0]), 0.6)
        for zz, dick in ((0.85, 5), (0.48, 4)):
            B.strich([S(*punkte[0], zd + zz), S(*punkte[-1], zd + zz)], dick, 90 + int(zz * 10), 0.7)
    # Unterbau: vordere Stirnseite dunkel, damit die Brücke über dem Wasser steht
    if quer:
        B.lege((60, 44, 30), B.maske([S(x0, 0, zd), S(x1, 0, zd), S(x1, 0, -0.35), S(x0, 0, -0.35)]))
        B.lege((70, 52, 36), B.maske([S(x1, 0, zd), S(x1, LD, zd), S(x1, LD, -0.35), S(x1, 0, -0.35)]))
    else:
        B.lege((60, 44, 30), B.maske([S(x0, 0, zd), S(x1, 0, zd), S(x1, 0, -0.35), S(x0, 0, -0.35)]))
        B.lege((70, 52, 36), B.maske([S(x1, 0, zd), S(x1, LD, zd), S(x1, LD, -0.35), S(x1, 0, -0.35)]))
    # Bohlen quer zur Laufrichtung, mit dunklen Fugen (der dunkle Grund scheint durch)
    B.lege((44, 32, 22), B.maske([S(x0, 0, zd), S(x1, 0, zd), S(x1, LD, zd), S(x0, LD, zd)]))
    n = int((LX if quer else LD) / 0.42)
    for i in range(n):
        a, b = i / n, (i + 1) / n - 0.012; g = float(rng.uniform(0.82, 1.08))
        if quer:
            pk = [S(x0 + a * LX, 0, zd), S(x0 + b * LX, 0, zd), S(x0 + b * LX, LD, zd), S(x0 + a * LX, LD, zd)]
        else:
            pk = [S(x0, a * LD, zd), S(x1, a * LD, zd), S(x1, b * LD, zd), S(x0, b * LD, zd)]
        B.lege(faerben(B.voll('maserung', 0.07, drehen=quer, saat=i), (150, 112, 72)) * g, B.maske(pk))
    # Randbalken an beiden Längsseiten
    for seite in ((0, 0.18) if quer else (x0, x0 + 0.18)), ((LD - 0.18, LD) if quer else (x1 - 0.18, x1)):
        if quer:
            pk = [S(x0, seite[0], zd + 0.01), S(x1, seite[0], zd + 0.01), S(x1, seite[1], zd + 0.01), S(x0, seite[1], zd + 0.01)]
        else:
            pk = [S(seite[0], 0, zd + 0.01), S(seite[1], 0, zd + 0.01), S(seite[1], LD, zd + 0.01), S(seite[0], LD, zd + 0.01)]
        B.lege((92, 66, 42), B.maske(pk))
    gelaender('hinten' if quer else 'rechts'); gelaender('vorn' if quer else 'links')   # Geländer stehen über den Bohlen
    return B.fertig(), [round(ox / W, 4), round(oy / Hh, 4)], None, None, False


def kahn(P, rng):
    """Flacher Moorkahn (Ost–West), von oben schräg gesehen: Bordwand, Bodenbretter, eine Ruderbank, ein Staken"""
    W, H = 220, 110; B = Blatt(W, H); cx, cy = 110, 60
    rumpf = [(cx - 95, cy), (cx - 70, cy - 26), (cx + 70, cy - 26), (cx + 98, cy - 4), (cx + 70, cy + 22), (cx - 70, cy + 22)]
    B.lege((52, 36, 24), B.maske(rumpf))
    innen = [(cx - 80, cy - 1), (cx - 62, cy - 18), (cx + 62, cy - 18), (cx + 84, cy - 3), (cx + 62, cy + 14), (cx - 62, cy + 14)]
    B.lege(faerben(B.voll('bretter', 0.07, drehen=True, saat=3), (128, 92, 58)) * 0.95, B.maske(innen))
    for i in range(1, 6):
        x = cx - 62 + i * 21; B.dunkel(B.rechteck(x, cy - 18, 1.4, 32), 0.45)
    B.balken(cx - 6, cy - 22, 14, 40, 7, 0.75)                                    # Ruderbank
    B.strich([(cx - 20, cy + 6), (cx + 120, cy - 40)], 4, 9, 0.7)                 # Staken
    return B.fertig(), [0.5, round((cy + 22) / H, 4)], None, {'art': 'lesen', 'dx': 0, 'dy': 0.8, 'radius': 1.8}, False


def feuerkorb(P, rng):
    """Eiserner Feuerkorb auf einem Pfahl, mit Flammen"""
    W, H = 60, 130; B = Blatt(W, H); cx, yb = 30, 124
    B.balken(cx - 3, yb - 78, 6, 78, 5, 0.6)
    korb = [(cx - 16, yb - 104), (cx + 16, yb - 104), (cx + 11, yb - 80), (cx - 11, yb - 80)]
    B.lege((44, 40, 40), B.maske(korb))
    for farbe, h, b in (((228, 96, 28), 30, 15), ((248, 162, 48), 22, 10), ((255, 230, 140), 14, 5)):
        m = B.maske([(cx - b, yb - 102), (cx, yb - 102 - h), (cx + b, yb - 102)]); B.lege(farbe, np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5 * K))).astype(np.float32) / 255)
    for x in (cx - 10, cx, cx + 10):
        B.dunkel(B.rechteck(x - 1, yb - 104, 2, 24), 0.5)
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.2}, None, False


def menhir(P, rng):
    """Bemooster Standstein mit eingeritzter Spirale"""
    W, H = 90, 160; B = Blatt(W, H); cx, yb = 45, 150
    schatten(B, cx - 22, cx + 22, yb, 14)
    s = 6 if P.get('schief') else 0
    pk = [(cx - 20, yb), (cx - 22 + s * 0.5, yb - 70), (cx - 14 + s, yb - 118), (cx + s, yb - 128), (cx + 14 + s, yb - 116), (cx + 21 + s * 0.5, yb - 66), (cx + 19, yb)]
    m = B.maske(pk); xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    rund = (1.15 - 0.45 * np.clip((xx - (cx - 20)) / 40, 0, 1))[..., None]
    B.lege(np.array((128, 126, 120), np.float32)[None, None, :] * rund, m)
    for _ in range(14):                                                                # Moosflecken
        x, y, r = cx + rng.uniform(-16, 16), yb - rng.uniform(0, 70) * rng.uniform(0.3, 1), rng.uniform(4, 9)
        B.lege((92, 116, 56), ellipse(B, x, y, r, r * 0.7) * m)
    sp = []; 
    for t in np.linspace(0, 5 * math.pi, 60):                                           # Spirale
        r = 2 + t * 1.15; sp.append((cx + s * 0.6 + math.cos(t) * r, yb - 74 + math.sin(t) * r))
    mm = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(mm).line([(x * K, y * K) for x, y in sp], fill=255, width=int(2.4 * K))
    B.dunkel(np.asarray(mm).astype(np.float32) / 255 * m, 0.45)
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.45}, None, False


def schrein(P, rng):
    """Steinerner Altar mit Moos und einer flachen Schale"""
    W, H = 150, 110; B = Blatt(W, H); cx, yb = 75, 100
    schatten(B, cx - 50, cx + 50, yb, 16)
    B.lege((96, 94, 90), B.maske([(cx - 48, yb), (cx - 48, yb - 40), (cx + 48, yb - 40), (cx + 48, yb)]))
    B.lege((142, 140, 132), B.maske([(cx - 48, yb - 40), (cx - 36, yb - 64), (cx + 60, yb - 64), (cx + 48, yb - 40)]))
    B.lege((54, 70, 74), ellipse(B, cx + 6, yb - 52, 20, 7)); B.lege((150, 200, 196), ellipse(B, cx + 2, yb - 54, 8, 2.4))
    for _ in range(12):
        x, y = cx + rng.uniform(-46, 46), yb - rng.uniform(0, 40); B.lege((92, 116, 56), ellipse(B, x, y, rng.uniform(4, 8), rng.uniform(3, 5)))
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'rechteck', 'x': -1.0, 'y': -0.9, 'b': 2.0, 'h': 0.9}, {'art': 'lesen', 'dx': 0, 'dy': 0.8, 'radius': 1.8}, False


def nebel(P, rng):
    """Nebelschwade: weiche, durchscheinende Bank aus Dunst (ohne Kontur)"""
    W, H = 520, 200; yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); a = np.zeros((H, W), np.float32)
    for _ in range(9):
        cx, cy, rx, ry = rng.uniform(90, W - 90), rng.uniform(70, H - 60), rng.uniform(60, 130), rng.uniform(26, 46)
        a = np.maximum(a, np.clip(1 - ((xx - cx) / rx) ** 2 - ((yy - cy) / ry) ** 2, 0, 1) ** 1.4)
    from scipy import ndimage as nd
    a = nd.gaussian_filter(a, 10) * 0.42
    im = np.dstack([np.full((H, W), 214), np.full((H, W), 224), np.full((H, W), 222), np.clip(a * 255, 0, 255)]).astype(np.uint8)
    return Image.fromarray(im, 'RGBA'), [0.5, 0.75], None, None, False


def meiler(P, rng):
    """Kohlenmeiler: mit Erde und Grassoden abgedeckte Kuppel, oben eine Rauchöffnung mit dünnem Rauch"""
    W, H = 170, 150; B = Blatt(W, H); cx, yb = 85, 132
    schatten(B, cx - 64, cx + 64, yb, 18)
    pk = [(cx + math.cos(t) * 66, yb - math.sin(t) * 58) for t in np.linspace(0, math.pi, 30)] + [(cx - 66, yb)]
    m = B.maske(pk); xx = np.arange(B.b, dtype=np.float32)[None, :] / K
    B.lege(np.array((88, 68, 48), np.float32)[None, None, :] * (1.2 - 0.5 * np.clip((xx - cx + 66) / 132, 0, 1))[..., None], m)
    for _ in range(40):
        t = rng.uniform(0.1, math.pi - 0.1); r = rng.uniform(0.2, 0.95); x, y = cx + math.cos(t) * 66 * r, yb - math.sin(t) * 58 * r
        B.lege((96, 112, 56), ellipse(B, x, y, rng.uniform(4, 8), rng.uniform(2.5, 4)) * m)
    B.lege((30, 24, 20), ellipse(B, cx, yb - 56, 7, 3))
    rauch = Image.new('L', (B.b, B.h), 0); d = ImageDraw.Draw(rauch)
    for i in range(6):
        d.ellipse([(cx - 6 + i * 2 - 8) * K, (yb - 70 - i * 10 - 6) * K, (cx - 6 + i * 2 + 8) * K, (yb - 70 - i * 10 + 6) * K], fill=150 - i * 18)
    r = np.asarray(rauch.filter(ImageFilter.GaussianBlur(3 * K))).astype(np.float32) / 255
    B.lege((206, 206, 200), r * 0.8)
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 1.1}, {'art': 'lesen', 'dx': 0, 'dy': 1.2, 'radius': 2.0}, False


def ruine(P, rng):
    """Überwucherte Mauerreste aus Bruchstein mit Efeu; als Bogen zwei Pfeiler mit halbem Bogen"""
    W, H = 220, 190; B = Blatt(W, H); yb = 176
    schatten(B, 20, 200, yb, 16)
    stein = lambda pk, hell=1.0: B.lege(faerben(B.voll('maserung', 0.3, saat=int(pk[0][0])), (140, 136, 128)) * hell, B.maske(pk))
    if P.get('bogen'):
        for x0 in (40, 150):
            stein([(x0, yb), (x0, yb - 120), (x0 + 30, yb - 128), (x0 + 30, yb)], 1.0 if x0 == 40 else 0.85)
        bg = [(40, yb - 120), (70, yb - 150), (110, yb - 162), (130, yb - 150), (128, yb - 138), (100, yb - 146), (72, yb - 132), (70, yb - 118)]
        stein(bg, 0.95)
    else:
        for x0, h in ((20, 70), (66, 110), (112, 84), (158, 46)):
            top = [(x0, yb - h + rng.uniform(-8, 8)), (x0 + 22, yb - h - rng.uniform(4, 16)), (x0 + 46, yb - h + rng.uniform(-6, 10))]
            stein([(x0, yb)] + top + [(x0 + 46, yb)], float(rng.uniform(0.82, 1.05)))
    for _ in range(int(rng.integers(50, 70))):          # Efeu und Moos
        x, y = rng.uniform(20, 200), rng.uniform(yb - 150, yb); r = rng.uniform(3, 7)
        B.lege((70 + int(rng.uniform(0, 30)), 110 + int(rng.uniform(0, 30)), 50), ellipse(B, x, y, r, r * 0.8) * (B.bild[..., 3] > 200).astype(np.float32))
    for _ in range(40):
        x = rng.uniform(15, 205); h = rng.uniform(8, 18); B.lege((84, 118, 52), B.maske([(x - 2, yb + 2), (x + rng.uniform(-3, 3), yb - h), (x + 2, yb + 2)]))
    return B.fertig(), [0.5, round(yb / H, 4)], {'art': 'rechteck', 'x': -1.9, 'y': -0.6, 'b': 3.8, 'h': 0.6}, {'art': 'lesen', 'dx': 0, 'dy': 0.7, 'radius': 2.0}, False


KLEIN = {'stand': stand, 'brunnen': brunnen, 'palisade': palisade, 'tor': tor, 'fass': fass, 'kiste': kiste, 'holzstapel': holzstapel, 'bank': bank, 'heu': heu, 'laterne': laterne, 'baumstamm': baumstamm, 'baumstamm_tief': baumstamm_tief, 'feuer': feuer, 'steinring': steinring, 'wehr': wehr, 'zaun': zaun, 'kuerbisse': kuerbisse, 'bruecke': bruecke, 'kahn': kahn, 'feuerkorb': feuerkorb, 'menhir': menhir, 'schrein': schrein, 'nebel': nebel, 'meiler': meiler, 'ruine': ruine}


def baue(kennung):
    P = HAEUSER[kennung]; rng = np.random.default_rng(P['saat'])
    if P['form'] in KLEIN:
        im, anker, koll, akt, durch = KLEIN[P['form']](P, rng)
        os.makedirs(ZIEL, exist_ok=True); im.save(os.path.join(ZIEL, kennung + '.webp'), quality=90, method=6)
        return im, {'id': kennung, 'name': P['name'], 'kategorie': 'sonderort' if P['form'] in ('menhir', 'schrein', 'nebel', 'ruine') else 'bauteil' if P['form'] in ('palisade', 'tor', 'zaun') else 'wasserbau' if P['form'] in ('wehr', 'bruecke', 'kahn') else 'bewuchs' if P['form'].startswith('baumstamm') else 'kleinteil', 'bild': f'img/welt/gebaeude/{kennung}.webp', 'groesse': [im.width, im.height],
                    'anker': anker, 'massstab': 1, 'kollision': koll, 'tiefe': P.get('tiefe', 'fuss'), **({'durchscheinend': True} if durch else {}), 'interaktion': akt, 'spiegelbar': P['form'] not in ('tor', 'baumstamm_tief'),
                    'herkunft': 'erzeugt von werkzeug/welt/haus.py ohne Bildvorlage – frei verwendbar' if os.environ.get('MYTHARA_STIL', 'gemalt') == 'gemalt' or P['form'].startswith('baumstamm') or P['form'] in ('steinring', 'kuerbisse') else 'erzeugt von werkzeug/welt/haus.py aus Vorlagen mit UNGEKLÄRTER Lizenz (vermutlich Freepik; doku/world-pipeline/QUELLEN.md)'}
    b, wh, ue, rand, unten = P['b'], P['wand'], 13, 10, 20
    if P['form'] == 'trauf':
        dh = P['dach']; breit = b + 2 * ue + 2 * rand + 14; hoch = rand + 14 + dh + wh + unten
        B = Blatt(breit, hoch); x0 = rand + ue; yb = hoch - unten; yt = yb - wh; yd = yt - dh + 10      # das Dach hängt 10 über die Wand
        schatten(B, x0, x0 + b, yb, 34)
        wand(B, [(x0, yt), (x0 + b, yt), (x0 + b, yb), (x0, yb)], P, yt + 6, 46)
        sockel(B, x0, yb - 9, b, 9, rng)
        B.balken(x0, yt, 7, wh - 9, 1); B.balken(x0 + b - 7, yt, 7, wh - 9, 2); B.balken(x0, yb - 15, b, 6, 3, 0.7)
        for f in P.get('fenster', []):
            fenster(B, x0 + b * f, yt + wh * 0.47, 24, 28, P['saat'] * 10 + int(f * 100))
            if P.get('blumen'):
                blumenkasten(B, x0 + b * f, yt + wh * 0.47 + 20, 36, rng)
        if P.get('esse'):
            esse(B, x0 + b * P['esse'][0], x0 + b * P['esse'][1], yt + 16, yb - 9, rng)
        tuer(B, x0 + b * P['tuer'], yb - 9, 32, 70, P['saat'])
        if P.get('schild'):
            schild(B, x0 + b * P['tuer'] + 30, yt + 26, P['schild'])
        # Dach: oben in der Sonne heller, zur Traufe dunkler
        z = faerben(B.voll('dachziegel', 0.105, saat=P['saat']), P.get('dachfarbe'))
        yy = np.arange(B.h, dtype=np.float32)[:, None] / K
        z = z * (1.12 - 0.34 * np.clip((yy - yd) / dh, 0, 1))[..., None]
        m = B.maske([(x0 - ue + 5, yd), (x0 + b + ue - 5, yd), (x0 + b + ue, yt + 10), (x0 - ue, yt + 10)])
        B.lege(z, m)
        B.dunkel(B.rechteck(x0 - ue, yt + 5, b + 2 * ue, 5), 0.38)                                       # Traufkante
        if P.get('kamin'):
            kamin(B, x0 + b * P['kamin'], yd - 12, yd + 22, rng)
        if P.get('kamin2'):
            kamin(B, x0 + b * P['kamin2'], yd - 8, yd + 22, rng)
        B.strich([(x0 - ue + 5, yd), (x0 - ue, yt + 10)], 5, 4); B.strich([(x0 + b + ue - 5, yd), (x0 + b + ue, yt + 10)], 5, 5, 0.62)
        B.balken(x0 - ue + 3, yd - 3, b + 2 * ue - 6, 7, 6, 0.9)                                         # First
        tiefe = max(2.0, round(dh * 0.9 / FELD * 2) / 2)
        tx = x0 + b * P['tuer']
    else:
        gh, D = P['giebel'], P['tiefe']; breit = b + 2 * ue + 2 * rand + 14; hoch = rand + D + gh + wh + unten
        B = Blatt(breit, hoch); x0 = rand + ue; yb = hoch - unten; yt = yb - wh; xm = x0 + b / 2; yf = yt - gh
        L, R, M = (x0 - ue, yt + 8), (x0 + b + ue, yt + 8), (xm, yf - 3)
        schatten(B, x0, x0 + b, yb, 34)
        neig = (L[1] - M[1]) / (M[0] - L[0])
        dachflaeche(B, [L, M, (M[0], M[1] - D), (L[0], L[1] - D)], P, 1.08, drehen=True, scherung=-neig, saat=P['saat'])
        dachflaeche(B, [M, R, (R[0], R[1] - D), (M[0], M[1] - D)], P, 0.72, drehen=True, scherung=neig, saat=P['saat'] + 1)
        yy = np.arange(B.h, dtype=np.float32)[:, None] / K
        B.dunkel(B.maske([L, M, R, (R[0], R[1] - D), (M[0], M[1] - D), (L[0], L[1] - D)]) * np.clip((yy - (yf - D)) / (D + gh), 0, 1) * 0.0 + B.maske([(L[0], L[1] - D), (M[0], M[1] - D), (R[0], R[1] - D), (R[0], R[1] - D + 6), (M[0], M[1] - D + 6), (L[0], L[1] - D + 6)]), 0.3)
        B.strich([(M[0], M[1] - D), M], 6, 6, 0.9)                                                       # First
        wand(B, [(x0, yt), (xm, yf), (x0 + b, yt), (x0 + b, yb), (x0, yb)], P, yf + 4, gh + 30)
        # Schatten des Dachüberstands auf dem Giebel
        innen = B.maske([(x0, yt), (xm, yf), (x0 + b, yt), (x0 + b, yt + 12), (xm, yf + 14), (x0, yt + 12)])
        B.dunkel(innen, 0.3)
        sockel(B, x0, yb - 9, b, 9, rng)
        B.balken(x0, yt, 7, wh - 9, 1); B.balken(x0 + b - 7, yt, 7, wh - 9, 2); B.balken(x0, yt - 3, b, 7, 3, 0.72); B.balken(x0, yb - 15, b, 6, 4, 0.7)
        B.balken(xm - 3, yf + 10, 6, gh - 10, 5, 0.72)
        if P.get('rundfenster'):
            m = Image.new('L', (B.b, B.h), 0); r = 9 if gh < 70 else 12; cy = yt - gh * 0.42
            ImageDraw.Draw(m).ellipse([(xm - r - 3) * K, (cy - r - 3) * K, (xm + r + 3) * K, (cy + r + 3) * K], fill=255)
            B.lege(B.voll('maserung', 0.22, saat=9) * 0.62, np.asarray(m).astype(np.float32) / 255)
            m = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(m).ellipse([(xm - r) * K, (cy - r) * K, (xm + r) * K, (cy + r) * K], fill=255)
            B.lege((30, 26, 30), np.asarray(m).astype(np.float32) / 255)
        if P.get('tor'):
            tuer(B, xm, yb - 9, 92, 86, P['saat'], zwei=True)
        else:
            tuer(B, x0 + b * P['tuer'], yb - 9, 32, 68, P['saat'])
        for fx, farbe in P.get('banner', []):
            banner(B, x0 + b * fx, yt + 12, 20, 62, farbe)
        B.strich([L, M, R], 7, 7, 0.7)                                                                   # Ortgang
        tiefe = max(2.0, round(D * 0.9 / FELD * 2) / 2)
        tx = xm if P.get('tor') else x0 + b * P['tuer']
    im = B.fertig()
    os.makedirs(ZIEL, exist_ok=True)
    im.save(os.path.join(ZIEL, kennung + '.webp'), quality=90, method=6)
    bf = round(b / FELD * 2) / 2     # Grundfläche in Rechenfeldern
    return im, {
        'id': kennung, 'name': P['name'], 'kategorie': 'gebaeude', 'bild': f'img/welt/gebaeude/{kennung}.webp', 'groesse': [im.width, im.height],
        'anker': [round((x0 + b / 2) / breit, 4), round(yb / hoch, 4)], 'massstab': 1,
        'kollision': {'art': 'rechteck', 'x': -bf / 2, 'y': -tiefe, 'b': bf, 'h': tiefe}, 'tiefe': 'fuss', 'durchscheinend': True,
        'interaktion': {'art': P.get('art', 'tuer'), 'dx': round((tx - (x0 + b / 2)) / FELD, 2), 'dy': 0.7, 'radius': 1.4},
        'herkunft': 'erzeugt von werkzeug/welt/haus.py aus Vorlagen mit UNGEKLÄRTER Lizenz (vermutlich Freepik; doku/world-pipeline/QUELLEN.md)',
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    vorschau = sys.argv[sys.argv.index('--vorschau') + 1] if '--vorschau' in sys.argv else None
    if vorschau:
        args = [a for a in args if a != vorschau]
    namen = args or list(HAEUSER)
    with open(BIB, encoding='utf8') as f:
        bib = json.load(f)
    bilder = []
    for n in namen:
        im, eintrag = baue(n)
        bib['objekte'] = [o for o in bib['objekte'] if o['id'] != n] + [eintrag]
        bilder.append(im)
        print(f'  {n}: {im.width} × {im.height}, {os.path.getsize(os.path.join(ZIEL, n + ".webp")) // 1024} KB')
    with open(BIB, 'w', encoding='utf8') as f:
        json.dump(bib, f, ensure_ascii=False, indent=1)
        f.write('\n')
    if vorschau:
        g = Image.new('RGB', (sum(i.width for i in bilder) + 20 * (len(bilder) + 1), max(i.height for i in bilder) + 40), (96, 134, 62))
        x = 20
        for i in bilder:
            g.paste(i, (x, g.height - 20 - i.height), i); x += i.width + 20
        g.save(vorschau)
    print(f'{len(namen)} Gebäude gebaut, Bibliothek ergänzt')


if __name__ == '__main__':
    main()
