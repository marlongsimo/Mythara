#!/usr/bin/env python3
"""World Pipeline – Übersichtskarte (Minimap) einer Region: der gebackene Boden plus die Baumkronen, damit der Wald als Wald erkennbar ist.

Liest die fertigen Chunks aus echtzeit/welt (Bodenbild und Objekte) und schreibt echtzeit/welt/karte-<region>.webp
(dieselbe Größe wie bisher aus boden.py --vorschau: 8 bzw. 4 Bildpunkte je Feld geteilt durch … – siehe MASSSTAB).
Bäume werden von oben als Kronen gezeichnet (dunkles Grün mit Licht von links oben und Schatten); Gebäude und alles andere Gesetzte
(Häuser, Brücken, Palisaden, Stände …) kommt als verkleinertes Bild an seine Stelle darüber – so zeigen Minikarte und Weltkarte das Dorf.
Regionen ohne gebackene Bodenbilder (das Festland, 26.11.2026): Grundlage sind die Geländefarben (dieselben wie in der 3D-Welt) Feld für Feld,
weich verlaufen, mit Hangschattierung aus hoehen.json – 3 Bildpunkte je Feld, reines Meer gröber. Bäume und Gesetztes kommen wie sonst darüber.
Aufruf (im Ordner realtime): python3 werkzeug/welt/karte.py <region> [<region> …]   ·   ohne Region: alle Regionen der Welt
"""
import json, math, os, random, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

WURZEL = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
WELT = os.path.join(WURZEL, 'echtzeit', 'welt')
FELD, CHUNK = 48, 32


REALTIME = os.path.join(WURZEL, 'realtime')
def _palette():
    ts = open(os.path.join(REALTIME, 'client', 'src', 'welt3d', 'welt3d.ts'), encoding='utf8').read()
    m = re.search(r'const FARBE: Record<string, string> = \{(.*?)\};', ts, re.S).group(1)
    P = {k.strip('"'): tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in re.findall(r'("[^"]+"|\w+):\s*"(#[0-9a-fA-F]{6})"', m)}
    # Geländearten, die die 3D-Palette (noch) nicht kennt (z. B. Eis i/I, #162): Farbe aus der Bibliothek
    for a in json.load(open(os.path.join(REALTIME, 'welt', 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']:
        f = a.get('farbe', '')
        if a['zeichen'] not in P and len(f) == 7: P[a['zeichen']] = tuple(int(f[i:i + 2], 16) for i in (1, 3, 5))
    return P


RAND = 4   # #183: Felder Rand aus den Nachbarregionen – Weichzeichnen und Hangschatten laufen über die Regionsgrenze, es bleiben keine Nähte (blaue Linien)
_REG = None
def _regionen():
    global _REG
    if _REG is None:
        _REG = []
        for n in os.listdir(os.path.join(REALTIME, 'welt', 'regionen')):
            p = os.path.join(REALTIME, 'welt', 'regionen', n, 'region.json')
            if not os.path.exists(p): continue
            r = json.load(open(p, encoding='utf8'))
            if r.get('ebene') or r.get('entwurf'): continue
            _REG.append({'id': n, 'x0': r['ursprung'][0] * CHUNK, 'y0': r['ursprung'][1] * CHUNK, 'b': r['chunks'][0] * CHUNK, 'h': r['chunks'][1] * CHUNK, 'z': None, 'hh': None})
    return _REG
def _feld(x0, y0, b, h):
    """Geländezeichen und Höhen eines Rechtecks in Weltfeldern, aus allen Regionen der Oberwelt (außerhalb: Meer, Höhe 0)"""
    z = np.full((h, b), 'M', dtype='<U1'); hh = np.zeros((h + 1, b + 1), np.float32)
    for r in _regionen():
        ax, ay, bx, by = max(x0, r['x0']), max(y0, r['y0']), min(x0 + b, r['x0'] + r['b']), min(y0 + h, r['y0'] + r['h'])
        if ax >= bx or ay >= by: continue
        if r['z'] is None:
            zz = [l for l in open(os.path.join(REALTIME, 'welt', 'regionen', r['id'], 'gelaende.txt'), encoding='utf8').read().split('\n') if l]; r['z'] = np.array([list(l.ljust(r['b'], 'M')[:r['b']]) for l in zz][:r['h']])
            hp = os.path.join(REALTIME, 'welt', 'regionen', r['id'], 'hoehen.json'); r['hh'] = np.array(json.load(open(hp))['werte'], np.float32).reshape(r['h'] + 1, r['b'] + 1) / 100 if os.path.exists(hp) else np.zeros((r['h'] + 1, r['b'] + 1), np.float32)
        z[ay - y0:by - y0, ax - x0:bx - x0] = r['z'][ay - r['y0']:by - r['y0'], ax - r['x0']:bx - r['x0']]
        hh[ay - y0:by - y0 + 1, ax - x0:bx - x0 + 1] = r['hh'][ay - r['y0']:by - r['y0'] + 1, ax - r['x0']:bx - r['x0'] + 1]
    return z, hh

def gelaende_grund(rid, R, pf):
    """Grundlage aus den Geländedaten: Farbe je Feld, weich verlaufen, leichte Körnung, Hänge schattiert (Licht von links oben).
    Gerechnet mit RAND Feldern aus den Nachbarregionen und danach zugeschnitten (#183: keine Nähte an den Regionsgrenzen)."""
    P = _palette(); W0, H0 = R['chunks'][0] * CHUNK, R['chunks'][1] * CHUNK; X0, Y0 = R['ursprung'][0] * CHUNK - RAND, R['ursprung'][1] * CHUNK - RAND
    z, hh = _feld(X0, Y0, W0 + 2 * RAND, H0 + 2 * RAND); H, W = z.shape; a = np.zeros((H, W, 3), np.float32); wasser = np.isin(z, list('M~wo'))
    for c in np.unique(z): a[z == c] = P.get(str(c), P['.'])
    h = (hh[:-1, :-1] + hh[1:, :-1] + hh[:-1, 1:] + hh[1:, 1:]) / 4
    gy, gx = np.gradient(ndimage.gaussian_filter(h, 1)); schatten = np.clip(1 - (gx * 0.55 + gy * 0.75) * 0.5, 0.6, 1.35); schatten[wasser] = 1   # Wasser bleibt eben (keine Streifen am Ufer der Nachbarregion)
    a *= schatten[..., None]; a[wasser] *= 0.92
    f = max(1, int(round(pf))); big = np.kron(a, np.ones((f, f, 1), np.float32)); big = ndimage.gaussian_filter(big, (f * 0.4, f * 0.4, 0), mode='nearest')
    rng = np.random.default_rng(1830); kq = ndimage.gaussian_filter(rng.standard_normal((257, 257)).astype(np.float32), 0.8, mode='wrap')   # Körnung in Weltkoordinaten (nahtlos)
    yy, xx = np.mgrid[0:big.shape[0], 0:big.shape[1]]; korn = kq[(yy + Y0 * f) % 257, (xx + X0 * f) % 257]
    big *= (1 + 0.05 * korn / (np.abs(kq).max() + 1e-6))[..., None]; r0 = RAND * f
    return Image.fromarray(np.clip(big[r0:r0 + H0 * f, r0:r0 + W0 * f] * 1.08, 0, 255).astype(np.uint8))


def karte(rid, index):
    R = index['regionen'][rid]['region']; (ux, uy), (cb, ch) = R['ursprung'], R['chunks']; OBJ = index['objekte']
    GEBACKEN = '--gebacken' in sys.argv          # seit 26.11.2026 (#13): überall aus den Geländefarben; die alten Bodenbilder nur noch auf Wunsch
    ohne_boden = not GEBACKEN or any(not os.path.exists(os.path.join(WELT, json.load(open(os.path.join(WELT, f'{ux + i}_{uy + j}.json'))).get('boden') or f'{ux + i}_{uy + j}.webp'))
                     for i in range(cb) for j in range(ch) if os.path.exists(os.path.join(WELT, f'{ux + i}_{uy + j}.json')))
    k = 4 if max(cb, ch) <= 4 else 8                      # wie boden.py: kleine Regionen feiner
    n = CHUNK * FELD // k
    if ohne_boden and max(cb, ch) > 8: n = 16 if R.get('biom') == 'meer' else 96   # große Festland-Kacheln: 3 Bildpunkte je Feld, reines Meer 0,5 (kleine Gebiete behalten ihre Auflösung)
    pf = n / CHUNK                                        # Bildpunkte je Chunk und je Feld
    bild = Image.new('RGB', (cb * n, ch * n), (40, 34, 24)); baeume, sonst = [], []
    if ohne_boden: bild = gelaende_grund(rid, R, pf).resize((cb * n, ch * n), Image.LANCZOS)
    for cy in range(ch):
        for cx in range(cb):
            p = os.path.join(WELT, f'{ux + cx}_{uy + cy}.json')
            if not os.path.exists(p): continue
            d = json.load(open(p))
            if not ohne_boden: bild.paste(Image.open(os.path.join(WELT, d['boden'])).convert('RGB').resize((n, n), Image.LANCZOS), (cx * n, cy * n))
            for o in d.get('objekte', []):
                D = OBJ.get(o['objekt'])
                if not D: continue
                if (o['objekt'].startswith('wald_baum') and not o['objekt'].startswith('wald_baumstamm')) or o['objekt'].startswith(('stil_eiche', 'stil_linde', 'stil_tanne', 'stil_herbst')): baeume.append((o, D))
                else: sonst.append((o, D))
    # Kronen: Mitte etwas über dem Fuß (das Bild steht auf dem Fuß), Größe aus der Bildbreite
    schatten = Image.new('L', bild.size, 0); kronen = Image.new('RGBA', bild.size, (0, 0, 0, 0))
    ds, dk = ImageDraw.Draw(schatten), ImageDraw.Draw(kronen); rnd = random.Random(7)
    baeume.sort(key=lambda t: t[0]['y'])
    for o, D in baeume:
        s = o.get('s', 1) * D.get('massstab', 1); w, h = D['groesse']; x = (o['x'] - ux * CHUNK) * pf; y = (o['y'] - uy * CHUNK) * pf
        r = max(2.0, 0.27 * w * s / FELD * pf); my = y - 0.30 * h * s / FELD * pf
        ds.ellipse([x - r + r * 0.35, my - r + r * 0.45, x + r + r * 0.35, my + r + r * 0.45], fill=150)          # Schatten nach rechts unten
        g = rnd.randint(-10, 10); grund = (34 + g // 2, 74 + g, 30 + g // 2)
        dk.ellipse([x - r, my - r, x + r, my + r], fill=grund + (255,))
        rl = r * 0.62; dk.ellipse([x - r * 0.55 - rl * 0.2, my - r * 0.6 - rl * 0.2, x - r * 0.55 + rl * 1.1, my - r * 0.6 + rl * 1.1], fill=(70 + g, 120 + g, 52 + g // 2, 200))   # Licht von links oben
    schatten = schatten.filter(ImageFilter.GaussianBlur(max(1.5, pf * 0.6)))
    bild = Image.composite(Image.new('RGB', bild.size, (12, 14, 8)), bild, schatten.point(lambda v: v * 0.55))
    kronen = kronen.filter(ImageFilter.GaussianBlur(0.6))
    # Wege bleiben lesbar: wo der Boden sandig (Feldweg) oder steingrau (Steinweg) ist, wird die Krone ausgespart
    hell = bild.convert('HSV'); weg = Image.new('L', bild.size, 0); px, hp, wp = bild.load(), hell.load(), weg.load()
    for j in range(bild.size[1]):
        for i in range(bild.size[0]):
            r_, g_, b_ = px[i, j]; hh, ss, vv = hp[i, j]
            if (vv > 120 and 10 < hh < 40 and ss > 70 and r_ > g_ + 15) or (ss < 40 and vv > 105): wp[i, j] = 255
    weg = weg.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))
    alpha = kronen.split()[3]; alpha = Image.composite(Image.new('L', bild.size, 0), alpha, weg); kronen.putalpha(alpha)
    bild.paste(kronen, (0, 0), kronen)
    # Gebäude und Gesetztes: das Bild verkleinert an seinen Fuß (Anker), von hinten nach vorn
    gezeichnet = 0; cache = {}
    for o, D in sorted(sonst, key=lambda t: t[0]['y']):
        z = o.get('zustand'); q = (D.get('zustaende') or {}).get(z, {}).get('bild') if z else None; q = q or D['bild']
        pfad = os.path.join(WURZEL, q)
        if not os.path.exists(pfad): continue
        if pfad not in cache: cache[pfad] = Image.open(pfad).convert('RGBA')
        s_ = o.get('s', 1) * D.get('massstab', 1); w, h = D['groesse']; W, H = max(1, round(w * s_ / FELD * pf)), max(1, round(h * s_ / FELD * pf))
        if W < 2 and H < 2: continue
        im = cache[pfad].resize((W, H), Image.LANCZOS)
        if o.get('spiegeln'): im = im.transpose(Image.FLIP_LEFT_RIGHT)
        ax, ay = D.get('anker', [0.5, 1]); x = (o['x'] - ux * CHUNK) * pf; y = (o['y'] - uy * CHUNK) * pf
        bild.paste(im, (round(x - ax * W), round(y - ay * H)), im); gezeichnet += 1
    ziel = os.path.join(WELT, f'karte-{rid}.webp'); bild.save(ziel, quality=82)
    bild.resize((cb * CHUNK * 2, ch * CHUNK * 2), Image.LANCZOS).save(os.path.join(WELT, f'karte2-{rid}.webp'), quality=82)   # #183: 2 Bildpunkte je Feld (Karte, Stufe Gegend)
    print(f'  karte-{rid}.webp: {bild.size[0]}×{bild.size[1]}, {len(baeume)} Bäume, {gezeichnet} Gebäude und Gesetztes')


def weltbild(index):
    """#183: das ganze Festland (Oberwelt) in einem Bild mit 0,5 Bildpunkten je Feld, aus den karte2-Bildern; Lage und Maßstab in welt.json → karte"""
    reg = [r['region'] for r in index['regionen'].values() if not r['region'].get('ebene')]
    x0, y0 = min(r['ursprung'][0] for r in reg) * CHUNK, min(r['ursprung'][1] for r in reg) * CHUNK
    x1, y1 = max(r['ursprung'][0] + r['chunks'][0] for r in reg) * CHUNK, max(r['ursprung'][1] + r['chunks'][1] for r in reg) * CHUNK
    pf = 0.5; bild = Image.new('RGB', (int((x1 - x0) * pf), int((y1 - y0) * pf)), (38, 102, 128))
    for r in sorted(reg, key=lambda r: r['chunks'][0] * r['chunks'][1], reverse=True):   # kleine Gebiete zuletzt (liegen über dem Festland)
        q = os.path.join(WELT, f"karte2-{r['id']}.webp")
        if not os.path.exists(q): q = os.path.join(WELT, f"karte-{r['id']}.webp")
        if not os.path.exists(q): continue
        w, h = int(r['chunks'][0] * CHUNK * pf), int(r['chunks'][1] * CHUNK * pf)
        bild.paste(Image.open(q).convert('RGB').resize((w, h), Image.LANCZOS), (int((r['ursprung'][0] * CHUNK - x0) * pf), int((r['ursprung'][1] * CHUNK - y0) * pf)))
    bild.save(os.path.join(WELT, 'karte-welt.webp'), quality=85)
    index['karte'] = {'stufen': [2, 4], 'welt': {'bild': 'karte-welt.webp', 'pxJeFeld': pf, 'ursprung': [x0, y0], 'groesse': list(bild.size)}}
    json.dump(index, open(os.path.join(WELT, 'welt.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(f'  karte-welt.webp: {bild.size[0]}×{bild.size[1]} (0,5 px je Feld, Ursprung {x0}|{y0})')


def main():
    index = json.load(open(os.path.join(WELT, 'welt.json')))
    for rid in ([a for a in sys.argv[1:] if not a.startswith('--')] or list(index['regionen'])): karte(rid, index)
    weltbild(index)


if __name__ == '__main__':
    main()
