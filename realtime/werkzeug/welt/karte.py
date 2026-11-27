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


def gelaende_grund(rid, R, pf):
    """Grundlage aus den Geländedaten: Farbe je Feld, weich verlaufen, leichte Körnung, Hänge schattiert (Licht von links oben)"""
    P = _palette(); z = [l for l in open(os.path.join(REALTIME, 'welt', 'regionen', rid, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    H, W = len(z), len(z[0]); a = np.zeros((H, W, 3), np.float32); wasser = np.zeros((H, W), bool)
    for c in set(''.join(z)):
        m = np.array([[ch == c for ch in l] for l in z]); a[m] = P.get(c, P['.']); wasser |= m if c in 'M~wo' else False
    hp = os.path.join(REALTIME, 'welt', 'regionen', rid, 'hoehen.json')
    if os.path.exists(hp):
        h = np.array(json.load(open(hp))['werte'], np.float32).reshape(H + 1, W + 1) / 100; h = (h[:-1, :-1] + h[1:, :-1] + h[:-1, 1:] + h[1:, 1:]) / 4
        gy, gx = np.gradient(ndimage.gaussian_filter(h, 1)); a *= np.clip(1 - (gx * 0.55 + gy * 0.75) * 0.5, 0.6, 1.35)[..., None]
    a[wasser] *= 0.92
    f = max(1, int(round(pf))); big = np.kron(a, np.ones((f, f, 1), np.float32)); big = ndimage.gaussian_filter(big, (f * 0.4, f * 0.4, 0))
    korn = ndimage.gaussian_filter(np.random.default_rng(len(rid)).standard_normal(big.shape[:2]).astype(np.float32), 0.8); big *= (1 + 0.05 * korn / (np.abs(korn).max() + 1e-6))[..., None]
    return Image.fromarray(np.clip(big * 1.08, 0, 255).astype(np.uint8))


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
    print(f'  karte-{rid}.webp: {bild.size[0]}×{bild.size[1]}, {len(baeume)} Bäume, {gezeichnet} Gebäude und Gesetztes')


def main():
    index = json.load(open(os.path.join(WELT, 'welt.json')))
    for rid in ([a for a in sys.argv[1:] if not a.startswith('--')] or list(index['regionen'])): karte(rid, index)


if __name__ == '__main__':
    main()
