#!/usr/bin/env python3
"""World Pipeline – Übersichtskarte (Minimap) einer Region: der gebackene Boden plus die Baumkronen, damit der Wald als Wald erkennbar ist.

Liest die fertigen Chunks aus echtzeit/welt (Bodenbild und Objekte) und schreibt echtzeit/welt/karte-<region>.webp
(dieselbe Größe wie bisher aus boden.py --vorschau: 8 bzw. 4 Bildpunkte je Feld geteilt durch … – siehe MASSSTAB).
Bäume werden von oben als Kronen gezeichnet (dunkles Grün mit Licht von links oben und Schatten); Gebäude und alles andere Gesetzte
(Häuser, Brücken, Palisaden, Stände …) kommt als verkleinertes Bild an seine Stelle darüber – so zeigen Minikarte und Weltkarte das Dorf.
Aufruf (im Ordner realtime): python3 werkzeug/welt/karte.py <region> [<region> …]   ·   ohne Region: alle Regionen der Welt
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter

WURZEL = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
WELT = os.path.join(WURZEL, 'echtzeit', 'welt')
FELD, CHUNK = 48, 32


def karte(rid, index):
    R = index['regionen'][rid]['region']; (ux, uy), (cb, ch) = R['ursprung'], R['chunks']; OBJ = index['objekte']
    k = 4 if max(cb, ch) <= 4 else 8                      # wie boden.py: kleine Regionen feiner
    n = CHUNK * FELD // k; pf = n / CHUNK                 # Bildpunkte je Chunk und je Feld
    bild = Image.new('RGB', (cb * n, ch * n), (40, 34, 24)); baeume, sonst = [], []
    for cy in range(ch):
        for cx in range(cb):
            p = os.path.join(WELT, f'{ux + cx}_{uy + cy}.json')
            if not os.path.exists(p): continue
            d = json.load(open(p)); bild.paste(Image.open(os.path.join(WELT, d['boden'])).convert('RGB').resize((n, n), Image.LANCZOS), (cx * n, cy * n))
            for o in d.get('objekte', []):
                D = OBJ.get(o['objekt'])
                if not D: continue
                if o['objekt'].startswith('wald_baum') and not o['objekt'].startswith('wald_baumstamm'): baeume.append((o, D))
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
    for rid in (sys.argv[1:] or list(index['regionen'])): karte(rid, index)


if __name__ == '__main__':
    main()
