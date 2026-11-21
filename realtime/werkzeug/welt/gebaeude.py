"""
World Pipeline – Gebäude-Baukasten: baut räumliche Gebäude aus Bauplänen (Standard für alle Gebäude der offenen Welt).

  python3 werkzeug/welt/gebaeude.py [kennung …] [--vorschau bild.png]

Liest  welt/bibliothek/bauplaene.json   (ein Bauplan je Gebäude)
Schreibt  img/welt/gebaeude/raeumlich/<kennung>/<ebene>.webp  und  den Eintrag in welt/bibliothek/objekte.json
          (Gesamtbild, Fußpunkt, Ebenen mit Tiefe, Kollision mit Türlücken, Innenräume, Türpunkte).

Ansicht (siehe doku/world-pipeline/08-gebaeude-prototyp.md): schräge Parallelprojektion passend zur Kamera der Welt.
  Bildpunkt = ((x + KX·d)·48, −(d + z)·48) relativ zum Fußpunkt; x nach Osten, d nach Norden, z nach oben, alles in Rechenfeldern.
  Sichtbar sind Süd- und Ostseiten und alle Dächer. Gebäude werden nie gespiegelt.

Ein Bauplan (Felder; x relativ zum Fuß, d ab der Fußlinie nach Norden):
  koerper: [{id, x, d, b, t, h, wand: bretter|blockbohlen|stein, betretbar, sockel,
             dach: {form: sattel|walm|pult|zelt|flach, first: x|d, hoehe, ueber, deckung: ziegel|schindel|stroh, farbe: [r,g,b]}}]
  tueren:  [{koerper, x (Mitte, relativ zum Fuß), b, h, art: einfach|doppel|tor}]          – immer in der Südwand
  fenster: [{koerper, wand: sued|ost, x oder d (Mitte), z, b, h, art: kreuz|rund|schmal|glut, laeden, blumen}]
  zubehoer:[{art: kamin|schild|laterne|banner|vordach|esse|glocke|kraeuter, …}]
  innen:   {boden: bretter|stein, moebel: [{art: tisch|bett|theke|fass|amboss|regal|ofen|altar|bank|kessel, x, d}]}
Der Fuß ist die Mitte der Südwand des ersten Baukörpers (dort, wo die Figur „vor“ dem Haus steht).
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import haus3d                      # noqa: E402  Zeichenfläche (Bild), Licht, Malfilter
from haus import tex as tex_vorlage, faerben  # noqa: E402

REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
BIB = os.path.join(REALTIME, 'welt', 'bibliothek')
ZIEL = os.path.join(WURZEL, 'img', 'welt', 'gebaeude', 'raeumlich')
F, K = 48, 2
KX = 0.32                          # Scherung: so viele Felder nach Osten je Feld Tiefe – macht die Ostwände sichtbar
TIEFE_SCHATTEN = -1000.0           # Kennwert für die Schattenebene: liegt immer am Boden

# ---------- Texturen: Vorlagen und daraus gerechnete Flächen ----------
_T = {}


def _kachelbar(a, rand=24):
    n0, n1 = a.shape[:2]
    v = np.roll(a, (n0 // 2, n1 // 2), axis=(0, 1)); y, x = np.mgrid[0:n0, 0:n1]
    d = np.minimum(np.minimum(x, n1 - 1 - x), np.minimum(y, n0 - 1 - y)).astype(np.float32)
    w = np.clip(d / rand, 0, 1)[..., None]
    return a * w + v * (1 - w)


def tex(name):
    """Texturen für die Flächen; zusätzlich zu den Vorlagen gerechnete: stroh, schindel, blockbohlen, stein, putz"""
    if name in _T:
        return _T[name]
    rng = np.random.default_rng(sum(map(ord, name)))
    if name == 'stroh':
        n = 512
        r = ndimage.gaussian_filter(rng.standard_normal((n, n)).astype(np.float32), (7, 0.9), mode='wrap')
        r = r / np.abs(r).max()
        lagen = (np.sin(np.arange(n) / n * 2 * math.pi * 10) * 0.5 + 0.5) ** 3
        hell = 0.82 + 0.28 * r - 0.22 * lagen[:, None]
        a = np.array([186, 152, 88], np.float32)[None, None, :] * hell[..., None]
        a = a * (1 + 0.1 * ndimage.gaussian_filter(rng.standard_normal((n, n)), 30, mode='wrap')[..., None] / 0.02 * 0.02)
    elif name == 'schindel':
        b = tex_vorlage('bretter').astype(np.float32)
        b = np.asarray(Image.fromarray(b.astype(np.uint8)).resize((260, 260), Image.LANCZOS)).astype(np.float32)
        n = 260; a = b.copy(); reihe = 26
        for j in range(n):
            k = j // reihe; im = j % reihe
            a[j] = np.roll(b[j], (k % 2) * 17 + k * 7, axis=0) * (0.72 + 0.34 * im / reihe)
        fuge = (np.arange(n) % 34 < 2)
        for j in range(n):
            k = j // reihe
            a[j, np.roll(fuge, (k % 2) * 17)] *= 0.55
    elif name == 'blockbohlen':
        m = tex_vorlage('maserung').astype(np.float32)
        m = np.asarray(Image.fromarray(m.astype(np.uint8)).resize((400, 274), Image.LANCZOS)).astype(np.float32)
        n0 = 260; a = m[:n0, :400].copy(); hoehe = 26
        prof = np.cos((np.arange(n0) % hoehe / hoehe - 0.5) * math.pi) ** 0.6
        a = a * (0.55 + 0.6 * prof)[:, None, None]
        a[np.arange(n0) % hoehe < 2] *= 0.4
    elif name == 'stein':
        p = np.asarray(Image.open(os.path.join(REALTIME, 'werkzeug', 'boden', 'pflaster.webp')).convert('RGB').resize((420, 420), Image.LANCZOS)).astype(np.float32)
        a = p * np.array([0.98, 0.96, 0.92], np.float32)
    elif name == 'putz':
        n = 256
        r = ndimage.gaussian_filter(rng.standard_normal((n, n)).astype(np.float32), 4, mode='wrap'); r /= np.abs(r).max()
        a = np.array([214, 200, 172], np.float32)[None, None, :] * (0.92 + 0.08 * r)[..., None]
    else:
        a = tex_vorlage(name).astype(np.float32)
    if name in ('stroh', 'putz'):
        a = _kachelbar(a)
    _T[name] = np.clip(a, 0, 255).astype(np.uint8)
    return _T[name]


haus3d.tex = tex                    # die Zeichenfläche aus haus3d holt ihre Texturen von hier

DECKUNG = {'ziegel': ('dachziegel', 0.105), 'schindel': ('schindel', 0.2), 'stroh': ('stroh', 0.3)}
WAND = {'bretter': ('bretter', 0.085, False), 'blockbohlen': ('blockbohlen', 0.16, False), 'stein': ('stein', 0.14, False), 'putz': ('putz', 0.2, False)}


class P:
    """Projektion relativ zum Fußpunkt"""
    def __call__(self, x, d, z):
        return (x + KX * d) * F, -(d + z) * F


PROJ = P()


def normale(pts):
    a, b, c = (np.array(p, dtype=np.float64) for p in pts[:3])
    # Achsen: x Ost, d Nord, z oben → für das Licht (x Ost, y Süd, z oben) wird d gespiegelt
    n = np.cross(b - a, c - a)
    return (n[0], -n[1], n[2])


def hell(pts, minimum=0.45):
    n = np.array(normale(pts), dtype=np.float64)
    if np.linalg.norm(n) == 0:
        return 1.0
    n /= np.linalg.norm(n)
    if n[2] < 0:
        n = -n
    return float(max(minimum, 0.48 + 0.62 * max(0.0, n @ haus3d.LICHT)))


# ---------- Dächer ----------
def dach_flaechen(k):
    """Die Dachflächen eines Baukörpers, von hinten nach vorn. Rückgabe: Liste (Ecken, Rolle); Rolle: flaeche | giebel_ost | giebel_sued"""
    D = k.get('dach') or {'form': 'flach'}
    form, H, ue = D['form'], D.get('hoehe', 1.6), D.get('ueber', 0.35)
    x0, x1, d0, d1, h = k['x'], k['x'] + k['b'], k['d'], k['d'] + k['t'], k['h']
    us = ue * 0.8
    aus = []
    if form == 'flach':
        aus.append(([(x0 - 0.1, d0 - 0.1, h + 0.15), (x1 + 0.1, d0 - 0.1, h + 0.15), (x1 + 0.1, d1 + 0.1, h + 0.15), (x0 - 0.1, d1 + 0.1, h + 0.15)], 'flaeche'))
    elif form == 'sattel' and D.get('first', 'x') == 'x':
        dm = (d0 + d1) / 2; sl = H / (k['t'] / 2); zE = h - ue * sl
        aus.append(([(x0 - us, d1 + ue, zE), (x1 + us, d1 + ue, zE), (x1 + us, dm, h + H), (x0 - us, dm, h + H)], 'flaeche'))
        aus.append(([(x1, d0, h), (x1, d1, h), (x1, dm, h + H)], 'giebel_ost'))
        aus.append(([(x0 - us, d0 - ue, zE), (x1 + us, d0 - ue, zE), (x1 + us, dm, h + H), (x0 - us, dm, h + H)], 'flaeche'))
    elif form == 'sattel':          # First nach Norden: Giebel zeigt nach Süden
        xm = (x0 + x1) / 2; sl = H / (k['b'] / 2); zE = h - us * sl
        aus.append(([(x0 - us, d0 - ue, zE), (xm, d0 - ue, h + H), (xm, d1 + ue, h + H), (x0 - us, d1 + ue, zE)], 'flaeche'))
        aus.append(([(xm, d0 - ue, h + H), (x1 + us, d0 - ue, zE), (x1 + us, d1 + ue, zE), (xm, d1 + ue, h + H)], 'flaeche'))
        aus.append(([(x0, d0, h), (x1, d0, h), (xm, d0, h + H)], 'giebel_sued'))
    elif form == 'walm':
        dm = (d0 + d1) / 2; w = min(k['t'] / 2, k['b'] / 2 - 0.2); sl = H / (k['t'] / 2); zE = h - ue * sl
        fx0, fx1 = x0 + w, x1 - w
        aus.append(([(x0 - us, d1 + ue, zE), (x1 + us, d1 + ue, zE), (fx1, dm, h + H), (fx0, dm, h + H)], 'flaeche'))
        aus.append(([(x0 - us, d0 - ue, zE), (fx0, dm, h + H), (x0 - us, d1 + ue, zE)], 'flaeche'))
        aus.append(([(x1 + us, d1 + ue, zE), (fx1, dm, h + H), (x1 + us, d0 - ue, zE)], 'flaeche'))
        aus.append(([(x0 - us, d0 - ue, zE), (x1 + us, d0 - ue, zE), (fx1, dm, h + H), (fx0, dm, h + H)], 'flaeche'))
    elif form == 'pult':            # hoch hinten, fällt nach Süden
        zv = h; zh = h + H
        aus.append(([(x1, d0, h), (x1, d1, h), (x1, d1, zh)], 'giebel_ost'))
        aus.append(([(x0 - us, d0 - ue, zv - ue * H / k['t']), (x1 + us, d0 - ue, zv - ue * H / k['t']), (x1 + us, d1 + ue, zh + ue * H / k['t']), (x0 - us, d1 + ue, zh + ue * H / k['t'])], 'flaeche'))
    elif form == 'zelt':
        xm, dm = (x0 + x1) / 2, (d0 + d1) / 2; sp = (xm, dm, h + H)
        a, b, c, d = (x0 - us, d0 - ue, h - 0.15), (x1 + us, d0 - ue, h - 0.15), (x1 + us, d1 + ue, h - 0.15), (x0 - us, d1 + ue, h - 0.15)
        aus += [([d, c, sp], 'flaeche'), ([a, d, sp], 'flaeche'), ([c, b, sp], 'flaeche'), ([b, a, sp], 'flaeche')]
    return aus


def dach_oben(k, x, d):
    """Höhe der Dachfläche über (x, d) – für Kamine"""
    D = k.get('dach') or {'form': 'flach'}; H = D.get('hoehe', 1.6); h = k['h']
    if D['form'] == 'sattel' and D.get('first', 'x') == 'x':
        return h + H - abs(d - (k['d'] + k['t'] / 2)) * H / (k['t'] / 2)
    if D['form'] == 'sattel':
        return h + H - abs(x - (k['x'] + k['b'] / 2)) * H / (k['b'] / 2)
    if D['form'] == 'pult':
        return h + H * (d - k['d']) / k['t']
    if D['form'] == 'walm':
        return h + H - abs(d - (k['d'] + k['t'] / 2)) * H / (k['t'] / 2)
    return h + 0.2


# ---------- Teile ----------
def quader(B, x0, d0, z0, b, t, h, textur, mass, farbe=None, hell_faktor=1.0, oben=True):
    """Ein kleiner Quader (Möbel, Kamin): Südseite, Ostseite, Deckel"""
    x1, d1, z1 = x0 + b, d0 + t, z0 + h
    B.flaeche(PROJ, [(x0, d0, z0), (x1, d0, z0), (x1, d0, z1), (x0, d0, z1)], textur, 0.95 * hell_faktor, mass, farbe=farbe)
    B.flaeche(PROJ, [(x1, d0, z0), (x1, d1, z0), (x1, d1, z1), (x1, d0, z1)], textur, 0.7 * hell_faktor, mass, farbe=farbe)
    if oben:
        B.flaeche(PROJ, [(x0, d0, z1), (x1, d0, z1), (x1, d1, z1), (x0, d1, z1)], textur, 1.1 * hell_faktor, mass, farbe=farbe)


MOEBEL = {
    'tisch':  lambda B, x, d: (quader(B, x - 0.5, d - 0.4, 0, 1.0, 0.8, 0.72, 'maserung', 0.18), None),
    'bett':   lambda B, x, d: (quader(B, x - 0.5, d - 0.7, 0, 1.0, 1.4, 0.45, 'bretter', 0.06), B.flaeche(PROJ, [(x - 0.45, d - 0.65, 0.46), (x + 0.45, d - 0.65, 0.46), (x + 0.45, d + 0.65, 0.46), (x - 0.45, d + 0.65, 0.46)], 'putz', 1.0, 0.2, farbe=(170, 70, 60))),
    'theke':  lambda B, x, d: (quader(B, x - 1.1, d - 0.3, 0, 2.2, 0.6, 1.0, 'maserung', 0.16), None),
    'fass':   lambda B, x, d: (quader(B, x - 0.3, d - 0.3, 0, 0.6, 0.6, 0.8, 'bretter', 0.05, farbe=(130, 90, 56)), None),
    'amboss': lambda B, x, d: (quader(B, x - 0.25, d - 0.2, 0, 0.5, 0.4, 0.5, 'maserung', 0.18), quader(B, x - 0.45, d - 0.22, 0.5, 0.9, 0.44, 0.2, 'putz', 0.2, farbe=(70, 72, 80))),
    'regal':  lambda B, x, d: (quader(B, x - 0.8, d - 0.2, 0, 1.6, 0.4, 1.6, 'maserung', 0.18, hell_faktor=0.85), None),
    'ofen':   lambda B, x, d: (quader(B, x - 0.6, d - 0.5, 0, 1.2, 1.0, 1.1, 'stein', 0.14), B.vieleck(PROJ, [(x - 0.3, d - 0.51, 0.2), (x + 0.3, d - 0.51, 0.2), (x + 0.3, d - 0.51, 0.7), (x - 0.3, d - 0.51, 0.7)], (255, 150, 60))),
    'altar':  lambda B, x, d: (quader(B, x - 0.7, d - 0.35, 0, 1.4, 0.7, 0.9, 'stein', 0.14), B.vieleck(PROJ, [(x - 0.08, d, 0.9), (x + 0.08, d, 0.9), (x + 0.08, d, 1.4), (x - 0.08, d, 1.4)], (230, 200, 120))),
    'bank':   lambda B, x, d: (quader(B, x - 0.9, d - 0.2, 0, 1.8, 0.4, 0.45, 'bretter', 0.06), None),
    'kessel': lambda B, x, d: (quader(B, x - 0.35, d - 0.35, 0, 0.7, 0.7, 0.6, 'putz', 0.2, farbe=(56, 58, 62)), B.vieleck(PROJ, [(x - 0.28, d - 0.28, 0.61), (x + 0.28, d - 0.28, 0.61), (x + 0.28, d + 0.28, 0.61), (x - 0.28, d + 0.28, 0.61)], (96, 150, 70))),
}


def fenster_zeichnen(B, f, k):
    """Ein Fenster auf der Süd- (Ebene d = k.d) oder Ostwand (Ebene x = k.x + k.b)"""
    art = f.get('art', 'kreuz'); z0, z1 = f['z'], f['z'] + f['h']
    if f.get('wand', 'sued') == 'sued':
        dw = k['d'] - 0.03; a0, a1 = f['x'] - f['b'] / 2, f['x'] + f['b'] / 2
        q = lambda a, b, z, w: [(a, dw - w, z), (b, dw - w, z), (b, dw - w, w if False else z), (a, dw - w, z)]
        pt = lambda a, z, w=0.0: (a, dw - w, z)
    else:
        xw = k['x'] + k['b'] + 0.03; a0, a1 = f['d'] - f['b'] / 2, f['d'] + f['b'] / 2
        pt = lambda a, z, w=0.0: (xw + w, a, z)
    rechteck = lambda a, b, za, zb, w=0.0: [pt(a, za, w), pt(b, za, w), pt(b, zb, w), pt(a, zb, w)]
    if art == 'rund':
        m = ((a0 + a1) / 2, (z0 + z1) / 2); r = f['b'] / 2
        ring = [pt(m[0] + math.cos(t) * (r + 0.12), m[1] + math.sin(t) * (r + 0.12), 0.01) for t in np.linspace(0, 2 * math.pi, 24)]
        innen = [pt(m[0] + math.cos(t) * r, m[1] + math.sin(t) * r, 0.02) for t in np.linspace(0, 2 * math.pi, 24)]
        B.vieleck(PROJ, ring, (70, 48, 30)); B.vieleck(PROJ, innen, (236, 176, 86))
        B.linie(PROJ, [pt(m[0] - r, m[1], 0.03), pt(m[0] + r, m[1], 0.03)], (60, 40, 26), 2.5); B.linie(PROJ, [pt(m[0], m[1] - r, 0.03), pt(m[0], m[1] + r, 0.03)], (60, 40, 26), 2.5)
        return
    if f.get('laeden'):
        for a, b in ((a0 - f['b'] * 0.42, a0 - 0.02), (a1 + 0.02, a1 + f['b'] * 0.42)):
            B.flaeche(PROJ, rechteck(a, b, z0 - 0.05, z1 + 0.05, 0.01), 'bretter', 0.5, 0.07)
    B.flaeche(PROJ, rechteck(a0 - 0.1, a1 + 0.1, z0 - 0.1, z1 + 0.1, 0.015), 'maserung', 0.6, 0.2)
    if art == 'glut':
        B.vieleck(PROJ, rechteck(a0, a1, z0, z1, 0.02), (40, 26, 22))
        B.vieleck(PROJ, rechteck(a0 + 0.06, a1 - 0.06, z0, z0 + (z1 - z0) * 0.45, 0.025), (255, 128, 40))
        B.vieleck(PROJ, rechteck(a0 + 0.2, a1 - 0.2, z0, z0 + (z1 - z0) * 0.22, 0.03), (255, 220, 130))
        return
    B.vieleck(PROJ, rechteck(a0, a1, z0, z1, 0.02), (236, 176, 86))
    B.vieleck(PROJ, rechteck(a0 + 0.07, a1 - 0.07, z0 + 0.07, z1 - 0.07, 0.025), (255, 216, 132), 150)
    if art != 'schmal':
        am = (a0 + a1) / 2; zm = (z0 + z1) / 2
        B.linie(PROJ, [pt(am, z0, 0.03), pt(am, z1, 0.03)], (60, 40, 26), 3); B.linie(PROJ, [pt(a0, zm, 0.03), pt(a1, zm, 0.03)], (60, 40, 26), 3)
    if f.get('blumen') and f.get('wand', 'sued') == 'sued':
        rng = np.random.default_rng(int(f['x'] * 100) % 9973)
        B.flaeche(PROJ, rechteck(a0 - 0.15, a1 + 0.15, z0 - 0.2, z0 - 0.03, 0.18), 'maserung', 0.8, 0.2)
        for i in range(8):
            a = a0 - 0.1 + (a1 - a0 + 0.2) * (i + rng.uniform(0.2, 0.8)) / 8
            B.vieleck(PROJ, rechteck(a - 0.07, a + 0.07, z0 - 0.03, z0 + 0.1, 0.19), [(214, 70, 64), (236, 196, 72), (222, 222, 230), (80, 120, 50)][i % 4])


def tuer_zeichnen(B, t, k, offen):
    x0, x1, z1, dw = t['x'] - t['b'] / 2, t['x'] + t['b'] / 2, t['h'], k['d']
    art = t.get('art', 'einfach')
    B.flaeche(PROJ, [(x0 - 0.14, dw - 0.04, 0), (x1 + 0.14, dw - 0.04, 0), (x1 + 0.14, dw - 0.04, z1 + 0.14), (x0 - 0.14, dw - 0.04, z1 + 0.14)], 'maserung', 0.55, 0.2)
    if offen:
        B.vieleck(PROJ, [(x0, dw - 0.05, 0), (x1, dw - 0.05, 0), (x1, dw - 0.05, z1), (x0, dw - 0.05, z1)], (26, 20, 18))
        if art == 'einfach':
            B.flaeche(PROJ, [(x0, dw - 0.06, 0), (x0, dw + 0.8, 0), (x0, dw + 0.8, z1), (x0, dw - 0.06, z1)], 'bretter', 0.5, 0.075)
        else:
            w = (x1 - x0) / 2
            B.flaeche(PROJ, [(x0, dw - 0.06, 0), (x0, dw + w * 0.8, 0), (x0, dw + w * 0.8, z1), (x0, dw - 0.06, z1)], 'bretter', 0.5, 0.075)
            B.flaeche(PROJ, [(x1, dw - 0.06, 0), (x1, dw + w * 0.8, 0), (x1, dw + w * 0.8, z1), (x1, dw - 0.06, z1)], 'bretter', 0.45, 0.075)
        return
    B.flaeche(PROJ, [(x0, dw - 0.06, 0), (x1, dw - 0.06, 0), (x1, dw - 0.06, z1), (x0, dw - 0.06, z1)], 'bretter', 0.62, 0.075)
    if art in ('doppel', 'tor'):
        B.linie(PROJ, [((x0 + x1) / 2, dw - 0.07, 0), ((x0 + x1) / 2, dw - 0.07, z1)], (30, 22, 18), 3)
    if art == 'tor':
        for a, b in ((x0, (x0 + x1) / 2), ((x0 + x1) / 2, x1)):
            B.linie(PROJ, [(a + 0.12, dw - 0.07, 0.15), (b - 0.12, dw - 0.07, z1 - 0.15)], (70, 50, 32), 5)
    for z in (0.35, z1 - 0.4):
        B.vieleck(PROJ, [(x0, dw - 0.07, z), (x1, dw - 0.07, z), (x1, dw - 0.07, z + 0.07), (x0, dw - 0.07, z + 0.07)], (46, 44, 46))
    B.vieleck(PROJ, [(x1 - 0.2, dw - 0.08, 0.95), (x1 - 0.12, dw - 0.08, 0.95), (x1 - 0.12, dw - 0.08, 1.03), (x1 - 0.2, dw - 0.08, 1.03)], (200, 168, 90))


def zubehoer_vorn(B, z, k):
    """Zubehör an der Südwand eines Baukörpers"""
    a, dw = z['art'], k['d'] - 0.05
    if a == 'schild':
        x, h = z['x'], z.get('z', 1.9); farbe = tuple(z.get('farbe', (196, 150, 60)))
        B.flaeche(PROJ, [(x - 0.05, dw - 0.6, h + 0.3), (x + 0.05, dw - 0.6, h + 0.3), (x + 0.05, dw, h + 0.3), (x - 0.05, dw, h + 0.3)], 'maserung', 0.6, 0.2)
        B.flaeche(PROJ, [(x - 0.3, dw - 0.55, h - 0.25), (x + 0.3, dw - 0.55, h - 0.25), (x + 0.3, dw - 0.55, h + 0.25), (x - 0.3, dw - 0.55, h + 0.25)], 'maserung', 0.95, 0.2)
        ring = [(x + math.cos(t) * 0.15, dw - 0.56, h + math.sin(t) * 0.15) for t in np.linspace(0, 2 * math.pi, 16)]
        B.vieleck(PROJ, ring, farbe)
    elif a == 'laterne':
        x, h = z['x'], z.get('z', 1.6)
        B.vieleck(PROJ, [(x - 0.12, dw - 0.15, h - 0.2), (x + 0.12, dw - 0.15, h - 0.2), (x + 0.12, dw - 0.15, h + 0.12), (x - 0.12, dw - 0.15, h + 0.12)], (40, 38, 40))
        B.vieleck(PROJ, [(x - 0.08, dw - 0.16, h - 0.16), (x + 0.08, dw - 0.16, h - 0.16), (x + 0.08, dw - 0.16, h + 0.08), (x - 0.08, dw - 0.16, h + 0.08)], (255, 214, 120))
    elif a == 'banner':
        x, h = z['x'], z.get('z', 2.0); farbe = tuple(z.get('farbe', (150, 40, 38)))
        B.vieleck(PROJ, [(x - 0.22, dw - 0.02, h), (x + 0.22, dw - 0.02, h), (x + 0.22, dw - 0.02, h - 1.1), (x, dw - 0.02, h - 0.85), (x - 0.22, dw - 0.02, h - 1.1)], farbe)
        B.vieleck(PROJ, [(x - 0.22, dw - 0.03, h - 0.1), (x + 0.22, dw - 0.03, h - 0.1), (x + 0.22, dw - 0.03, h - 0.16), (x - 0.22, dw - 0.03, h - 0.16)], (214, 176, 86))
        ring = [(x + math.cos(t) * 0.09, dw - 0.03, h - 0.45 + math.sin(t) * 0.09) for t in np.linspace(0, 2 * math.pi, 12)]
        B.vieleck(PROJ, ring, (226, 190, 96))
    elif a == 'esse':
        x0, x1, h = z['x0'], z['x1'], z.get('h', 1.7)
        B.flaeche(PROJ, [(x0 - 0.12, dw, 0), (x1 + 0.12, dw, 0), (x1 + 0.12, dw, h + 0.12), (x0 - 0.12, dw, h + 0.12)], 'maserung', 0.55, 0.2)
        B.vieleck(PROJ, [(x0, dw - 0.01, 0), (x1, dw - 0.01, 0), (x1, dw - 0.01, h), (x0, dw - 0.01, h)], (34, 26, 24))
        ex = x0 + (x1 - x0) * 0.32
        quader(B, ex - 0.55, dw + 0.15, 0, 1.1, 0.6, 0.7, 'stein', 0.14)
        B.vieleck(PROJ, [(ex - 0.42, dw + 0.15, 0.71), (ex + 0.42, dw + 0.15, 0.71), (ex + 0.42, dw + 0.7, 0.71), (ex - 0.42, dw + 0.7, 0.71)], (255, 140, 50))
        B.vieleck(PROJ, [(ex - 0.2, dw + 0.3, 0.72), (ex + 0.2, dw + 0.3, 0.72), (ex + 0.2, dw + 0.55, 0.72), (ex - 0.2, dw + 0.55, 0.72)], (255, 230, 150))
        ax = x0 + (x1 - x0) * 0.78
        quader(B, ax - 0.2, dw + 0.25, 0, 0.4, 0.3, 0.42, 'maserung', 0.18)
        quader(B, ax - 0.35, dw + 0.22, 0.42, 0.7, 0.36, 0.16, 'putz', 0.2, farbe=(70, 72, 80))
    elif a == 'kraeuter':
        rng = np.random.default_rng(7)
        for i in range(z.get('anzahl', 6)):
            x = z['x0'] + (z['x1'] - z['x0']) * (i + 0.5) / z.get('anzahl', 6); h = k['h'] - 0.45
            B.linie(PROJ, [(x, dw - 0.25, h), (x, dw - 0.25, h - 0.25)], (90, 70, 40), 1.5)
            farbe = [(96, 130, 60), (130, 110, 60), (150, 90, 120), (110, 140, 70)][i % 4]
            B.vieleck(PROJ, [(x - 0.1, dw - 0.25, h - 0.25), (x + 0.1, dw - 0.25, h - 0.25), (x + 0.04, dw - 0.25, h - 0.7 - rng.uniform(0, 0.15)), (x - 0.04, dw - 0.25, h - 0.7)], farbe)
    elif a == 'glocke':
        x, h = z['x'], z.get('z', k['h'] - 0.9)
        B.flaeche(PROJ, [(x - 0.55, dw, h - 0.6), (x + 0.55, dw, h - 0.6), (x + 0.55, dw, h + 0.6), (x - 0.55, dw, h + 0.6)], 'maserung', 0.5, 0.2)
        B.vieleck(PROJ, [(x - 0.45, dw - 0.01, h - 0.5), (x + 0.45, dw - 0.01, h - 0.5), (x + 0.45, dw - 0.01, h + 0.3), (x, dw - 0.01, h + 0.5), (x - 0.45, dw - 0.01, h + 0.3)], (30, 24, 22))
        B.vieleck(PROJ, [(x - 0.25, dw + 0.05, h - 0.35), (x + 0.25, dw + 0.05, h - 0.35), (x + 0.15, dw + 0.05, h + 0.15), (x - 0.15, dw + 0.05, h + 0.15)], (196, 150, 70))
        B.vieleck(PROJ, [(x - 0.08, dw + 0.04, h + 0.15), (x + 0.08, dw + 0.04, h + 0.15), (x + 0.08, dw + 0.04, h + 0.3), (x - 0.08, dw + 0.04, h + 0.3)], (120, 90, 50))


# ---------- Ein Gebäude ----------
def rahmen(plan):
    xs, ys = [], []
    for k in plan['koerper']:
        D = k.get('dach') or {}; ue = D.get('ueber', 0.35) + 0.3; H = D.get('hoehe', 1.6) + 1.2
        for x in (k['x'] - ue, k['x'] + k['b'] + ue + 1.4):
            for d in (k['d'] - ue - 1.2, k['d'] + k['t'] + ue):
                for z in (0, k['h'] + H):
                    X, Y = PROJ(x, d, z); xs.append(X); ys.append(Y)
    ox, oy = -min(xs) + 6, -min(ys) + 6
    return ox, oy, int(max(xs) + ox + 6), int(max(ys) + oy + 6)


def baue(plan):
    ox, oy, b, h = rahmen(plan)
    neu = lambda: haus3d.Bild(b, h, ox, oy)
    ebenen = []           # (name, Bild, tiefe, rolle, koerper-index, tuer-index)
    koerper = plan['koerper']; tueren = plan.get('tueren', []); fenster = plan.get('fenster', []); zub = plan.get('zubehoer', [])
    idx = {k['id']: i for i, k in enumerate(koerper)}

    # Schatten am Boden (eine Ebene für das ganze Gebäude)
    S = neu(); m = Image.new('L', S.im.size, 0); d = ImageDraw.Draw(m)
    for k in koerper:
        hh = k['h'] + (k.get('dach') or {}).get('hoehe', 0) * 0.6
        pts = [S.p(PROJ(x, dd, 0)) for x, dd in [(k['x'] + 0.2, k['d'] - 0.1), (k['x'] + k['b'] + 0.25 * hh, k['d'] - 0.1), (k['x'] + k['b'] + 0.35 * hh, k['d'] + k['t'] + 0.3 * hh), (k['x'] + 0.3, k['d'] + k['t'] + 0.3 * hh)]]
        d.polygon(pts, fill=150)
    m = m.filter(ImageFilter.GaussianBlur(9 * K)); s = Image.new('RGBA', S.im.size, (10, 12, 6, 0)); s.putalpha(m); S.im = Image.alpha_composite(S.im, s)
    ebenen.append(('schatten', S, TIEFE_SCHATTEN, 'schatten', None, None))

    for i, k in enumerate(koerper):
        x0, x1, d0, d1, hk, t = k['x'], k['x'] + k['b'], k['d'], k['d'] + k['t'], k['h'], 0.22
        wt, wm, _ = WAND[k.get('wand', 'bretter')]
        # innen
        if k.get('betretbar'):
            E = neu(); boden = (plan.get('innen') or {}).get('boden', 'bretter')
            E.flaeche(PROJ, [(x0 + t, d0 + t, 0), (x1 - t, d0 + t, 0), (x1 - t, d1 - t, 0), (x0 + t, d1 - t, 0)], 'stein' if boden == 'stein' else 'bretter', 0.86, 0.14 if boden == 'stein' else 0.06)
            E.flaeche(PROJ, [(x0 + t, d1 - t, 0), (x1 - t, d1 - t, 0), (x1 - t, d1 - t, hk), (x0 + t, d1 - t, hk)], wt, 0.74, wm, ton=(0.7, 1.0))
            E.flaeche(PROJ, [(x0 + t, d0 + t, 0), (x0 + t, d1 - t, 0), (x0 + t, d1 - t, hk), (x0 + t, d0 + t, hk)], wt, 0.6, wm, ton=(0.7, 1.0))
            for ecken in ([(x0, d1 - t, hk), (x1, d1 - t, hk), (x1, d1, hk), (x0, d1, hk)], [(x0, d0, hk), (x0 + t, d0, hk), (x0 + t, d1, hk), (x0, d1, hk)], [(x1 - t, d0, hk), (x1, d0, hk), (x1, d1, hk), (x1 - t, d1, hk)]):
                E.flaeche(PROJ, ecken, 'maserung', 0.95, 0.2)
            for mb in sorted([mb for mb in (plan.get('innen') or {}).get('moebel', []) if x0 < mb['x'] < x1 and d0 < mb['d'] < d1], key=lambda mb: -mb['d']):
                MOEBEL[mb['art']](E, mb['x'], mb['d'])
            ebenen.append((f'{k["id"]}_innen', E, -d1 + 0.02, 'innen', i, None))
        # seite: Ostwand mit Fenstern und Giebel
        Sd = neu()
        Sd.flaeche(PROJ, [(x1, d0, 0), (x1, d1, 0), (x1, d1, hk), (x1, d0, hk)], wt, 0.72, wm, ton=(0.95, 0.78))
        for fl, rolle in dach_flaechen(k):
            if rolle == 'giebel_ost':
                Sd.flaeche(PROJ, fl, wt, 0.68, wm)
        for ecke in (d0, d1):
            Sd.flaeche(PROJ, [(x1 + 0.02, ecke - 0.14, 0), (x1 + 0.02, ecke + 0.14, 0), (x1 + 0.02, ecke + 0.14, hk), (x1 + 0.02, ecke - 0.14, hk)], 'maserung', 0.55, 0.2)
        if k.get('sockel', True) and k.get('wand') != 'stein':
            Sd.flaeche(PROJ, [(x1 + 0.02, d0, 0), (x1 + 0.02, d1, 0), (x1 + 0.02, d1, 0.3), (x1 + 0.02, d0, 0.3)], 'stein', 0.6, 0.12)
        for f in fenster:
            if f.get('koerper', koerper[0]['id']) == k['id'] and f.get('wand') == 'ost':
                fenster_zeichnen(Sd, f, k)
        ebenen.append((f'{k["id"]}_seite', Sd, -d1 + 0.03, 'seite', i, None))
        # vorn: Südwand, Südgiebel, Fenster, Zubehör an der Wand
        V = neu()
        V.flaeche(PROJ, [(x0, d0, 0), (x1, d0, 0), (x1, d0, hk), (x0, d0, hk)], wt, 1.0, wm, ton=(1.0, 0.82))
        for fl, rolle in dach_flaechen(k):
            if rolle == 'giebel_sued':
                V.flaeche(PROJ, fl, wt, 0.96, wm)
                V.flaeche(PROJ, [(x0, d0 - 0.02, hk - 0.2), (x1, d0 - 0.02, hk - 0.2), (x1, d0 - 0.02, hk + 0.05), (x0, d0 - 0.02, hk + 0.05)], 'maserung', 0.6, 0.2)
        for xe in (x0, x1 - 0.28):
            V.flaeche(PROJ, [(xe, d0 - 0.02, 0), (xe + 0.28, d0 - 0.02, 0), (xe + 0.28, d0 - 0.02, hk), (xe, d0 - 0.02, hk)], 'maserung', 0.62, 0.2)
        if k.get('sockel', True) and k.get('wand') != 'stein':
            V.flaeche(PROJ, [(x0, d0 - 0.025, 0), (x1, d0 - 0.025, 0), (x1, d0 - 0.025, 0.3), (x0, d0 - 0.025, 0.3)], 'stein', 0.75, 0.12)
        if k.get('wand') != 'stein':
            V.flaeche(PROJ, [(x0, d0 - 0.02, hk - 0.24), (x1, d0 - 0.02, hk - 0.24), (x1, d0 - 0.02, hk), (x0, d0 - 0.02, hk)], 'maserung', 0.55, 0.2)
        V.flaeche(PROJ, [(x0, d0, hk), (x1, d0, hk), (x1, d0 + 0.22, hk), (x0, d0 + 0.22, hk)], 'maserung', 1.0, 0.2)
        for f in fenster:
            if f.get('koerper', koerper[0]['id']) == k['id'] and f.get('wand', 'sued') == 'sued':
                fenster_zeichnen(V, f, k)
        for z in zub:
            if z.get('koerper', koerper[0]['id']) == k['id'] and z['art'] in ('schild', 'laterne', 'banner', 'esse', 'kraeuter', 'glocke'):
                zubehoer_vorn(V, z, k)
        ebenen.append((f'{k["id"]}_vorn', V, -d0, 'vorn', i, None))
        # Türen dieses Körpers (eigene Ebenen, zwei Zustände)
        for j, tu in enumerate(tueren):
            if tu.get('koerper', koerper[0]['id']) != k['id']:
                continue
            for offen in (False, True):
                T = neu(); tuer_zeichnen(T, tu, k, offen)
                ebenen.append((f'tuer{j}_{"offen" if offen else "zu"}', T, -d0 + 0.002, 'tuer_offen' if offen else 'tuer_zu', i, j))
        # Dach mit Kamin
        if (k.get('dach') or {}).get('form', 'flach') != 'flach' or k.get('dach'):
            Dd = neu(); D = k['dach']; deck, dmass = DECKUNG[D.get('deckung', 'ziegel')]
            for fl, rolle in dach_flaechen(k):
                if rolle != 'flaeche':
                    continue
                Dd.flaeche(PROJ, fl, deck, hell(fl), dmass, farbe=tuple(D['farbe']) if D.get('farbe') else None)
                # dunkle Kante an der Traufe und Ortgängen
                Dd.linie(PROJ, fl + [fl[0]], (44, 30, 20), 2.2, 200)
            for z in zub:
                if z['art'] == 'kamin' and z.get('koerper', koerper[0]['id']) == k['id']:
                    kx, kd, kb = z['x'], z['d'], z.get('b', 0.55); fuss = dach_oben(k, kx, kd) - 0.2
                    quader(Dd, kx - kb / 2, kd - kb / 2, fuss, kb, kb, max(0.6, k['h'] + D.get('hoehe', 1.6) + 0.6 - fuss), 'stein', 0.12)
                    Dd.vieleck(PROJ, [(kx - kb / 2, kd - kb / 2, k['h'] + D.get('hoehe', 1.6) + 0.6), (kx + kb / 2, kd - kb / 2, k['h'] + D.get('hoehe', 1.6) + 0.6), (kx + kb / 2, kd + kb / 2, k['h'] + D.get('hoehe', 1.6) + 0.6), (kx - kb / 2, kd + kb / 2, k['h'] + D.get('hoehe', 1.6) + 0.6)], (36, 32, 30))
            ebenen.append((f'{k["id"]}_dach', Dd, -d0 + (k.get('dach') or {}).get('ueber', 0.35), 'dach', i, None))
        # Vordach vor diesem Körper (eigene Ebene, liegt vor der Wand)
        for z in zub:
            if z['art'] == 'vordach' and z.get('koerper', koerper[0]['id']) == k['id']:
                Vd = neu(); a0, a1, tf, hz = z['x0'], z['x1'], z.get('tiefe', 1.2), z.get('z', 2.1)
                for xp in (a0 + 0.1, a1 - 0.25):
                    Vd.flaeche(PROJ, [(xp, d0 - tf, 0), (xp + 0.15, d0 - tf, 0), (xp + 0.15, d0 - tf, hz - 0.1), (xp, d0 - tf, hz - 0.1)], 'maserung', 0.65, 0.2)
                fl = [(a0 - 0.15, d0 - tf - 0.2, hz - 0.15), (a1 + 0.15, d0 - tf - 0.2, hz - 0.15), (a1 + 0.15, d0, hz + 0.45), (a0 - 0.15, d0, hz + 0.45)]
                deck, dmass = DECKUNG[z.get('deckung', 'schindel')]
                Vd.flaeche(PROJ, fl, deck, hell(fl), dmass, farbe=tuple(z['farbe']) if z.get('farbe') else None)
                Vd.linie(PROJ, fl + [fl[0]], (44, 30, 20), 2.2, 200)
                ebenen.append((f'{k["id"]}_vordach', Vd, -d0 + tf + 0.2, 'vordach', i, None))
    return ebenen, (ox, oy, b, h)


def kollision(plan):
    """Kollision relativ zum Fuß (y nach Süden positiv): Baukörper als Rechtecke, begehbare nur mit Wänden, Türlücken in der Südwand"""
    kk = [{'x0': k['x'], 'x1': k['x'] + k['b'], 'y0': -(k['d'] + k['t']), 'y1': -k['d'], 'voll': not k.get('betretbar')} for k in plan['koerper']]
    kmap = {k['id']: k for k in plan['koerper']}
    tt = [{'x0': t['x'] - t['b'] / 2, 'x1': t['x'] + t['b'] / 2, 'y': -kmap[t.get('koerper', plan['koerper'][0]['id'])]['d']} for t in plan.get('tueren', [])]
    return {'art': 'gebaeude', 'koerper': kk, 'tueren': tt}


def sichtbarer_bereich(im):
    """Wo das Gebäude im Bild wirklich etwas zeigt (ohne den weichen Schatten): [x0, y0, x1, y1] in Bildpunkten"""
    a = np.asarray(im.getchannel('A')) > 200
    ys, xs = np.where(a)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1] if len(xs) else [0, 0, im.width, im.height]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    vorschau = sys.argv[sys.argv.index('--vorschau') + 1] if '--vorschau' in sys.argv else None
    if vorschau:
        args = [a for a in args if a != vorschau]
    with open(os.path.join(BIB, 'bauplaene.json'), encoding='utf8') as f:
        plaene = {p['id']: p for p in json.load(f)['bauplaene']}
    with open(os.path.join(BIB, 'objekte.json'), encoding='utf8') as f:
        bib = json.load(f)
    namen = args or list(plaene)
    bilder = []
    for n in namen:
        plan = plaene[n]
        ebenen, (ox, oy, b, h) = baue(plan)
        ordner = os.path.join(ZIEL, n); os.makedirs(ordner, exist_ok=True)
        gesamt = Image.new('RGBA', (b, h), (0, 0, 0, 0)); liste = []
        for name, B, tiefe, rolle, ki, ti in ebenen:
            im = B.fertig(malen=rolle not in ('schatten', 'innen'))
            if rolle == 'schatten':
                im = B.im.resize((b, h), Image.LANCZOS)
            if rolle != 'tuer_offen':
                gesamt.alpha_composite(im)
            # auf den Inhalt zuschneiden: Das Spiel zeichnet sonst viele große, fast leere Flächen übereinander
            box = im.getchannel('A').getbbox() or (0, 0, 1, 1)
            im.crop(box).save(os.path.join(ordner, name + '.webp'), quality=90, method=6)
            e = {'name': name, 'bild': f'img/welt/gebaeude/raeumlich/{n}/{name}.webp', 'tiefe': round(tiefe, 3), 'rolle': rolle, 'versatz': [box[0], box[1]]}
            if ki is not None: e['koerper'] = ki
            if ti is not None: e['tuer'] = ti
            liste.append(e)
        gesamt.save(os.path.join(ordner, 'gesamt.webp'), quality=90, method=6)
        sichtbar = sichtbarer_bereich(gesamt)
        kmap = {k['id']: k for k in plan['koerper']}
        tueren = [{'x': round(t['x'], 3), 'y': round(-kmap[t.get('koerper', plan['koerper'][0]['id'])]['d'] + 0.6, 3)} for t in plan.get('tueren', [])]
        raum = [{'x0': k['x'] + 0.2, 'x1': k['x'] + k['b'] - 0.2, 'y0': -(k['d'] + k['t']) + 0.2, 'y1': -k['d'] - 0.05, 'koerper': i} for i, k in enumerate(plan['koerper']) if k.get('betretbar')]
        eintrag = {'id': n, 'name': plan['name'], 'kategorie': 'gebaeude', 'bild': f'img/welt/gebaeude/raeumlich/{n}/gesamt.webp', 'groesse': [b, h],
                   'anker': [round(ox / b, 4), round(oy / h, 4)], 'massstab': 1, 'kollision': kollision(plan), 'tiefe': 'fuss',
                   'ebenen': liste, 'raum': raum, 'tueren': tueren, 'sichtbar': sichtbar,
                   'interaktion': ({'art': plan.get('interaktion', 'tuer'), 'dx': tueren[0]['x'], 'dy': tueren[0]['y'], 'radius': 1.4} if tueren else None),
                   'herkunft': 'erzeugt von werkzeug/welt/gebaeude.py (Bauplan welt/bibliothek/bauplaene.json) aus Vorlagen mit UNGEKLÄRTER Lizenz (vermutlich Freepik; doku/world-pipeline/QUELLEN.md)'}
        bib['objekte'] = [o for o in bib['objekte'] if o['id'] != n] + [eintrag]
        bilder.append(gesamt)
        print(f'  {n}: {b} × {h} px, {len(liste)} Ebenen, {len(tueren)} Türen, {len(raum)} begehbare Räume')
    with open(os.path.join(BIB, 'objekte.json'), 'w', encoding='utf8') as f:
        json.dump(bib, f, ensure_ascii=False, indent=1); f.write('\n')
    if vorschau:
        sp = 4; zeilen = [bilder[i:i + sp] for i in range(0, len(bilder), sp)]
        B = max(sum(i.width for i in z) + 20 * (len(z) + 1) for z in zeilen); Hh = sum(max(i.height for i in z) + 20 for z in zeilen) + 20
        g = Image.new('RGBA', (B, Hh), (92, 128, 60, 255)); y = 20
        for z in zeilen:
            x = 20; zh = max(i.height for i in z)
            for i in z:
                g.alpha_composite(i, (x, y + zh - i.height)); x += i.width + 20
            y += zh + 20
        g.save(vorschau)
    print(f'{len(namen)} Gebäude gebaut, Bibliothek ergänzt')


if __name__ == '__main__':
    main()
