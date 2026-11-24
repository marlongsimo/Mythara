"""
World Pipeline – Zierbäume aus Fabrik-Renders (Meshy) und Bildern für die offene Welt: reine Optik, keine Funktion (keine Interaktion).

  python3 realtime/werkzeug/welt/baum_bilder.py <render_0.png> <render_120.png> <render_240.png> <toter_baum_render.png>

- Laubbaum (fabrik/assets/objekt.baum.laub, Renders von fabrik/baum_render.py): die Krone wird je Sorte umgefärbt (nur grüne Bildpunkte, der Stamm bleibt),
  drei Ansichten für unterschiedliche Kronenformen. Die bisherigen Standardbäume (stil_eiche_01/02, stil_linde_01, stil_herbst_01) zeigen jetzt diesen Baum,
  dazu weitere Sorten zum Platzieren (stil_laub_*).
- Toter Baum (fabrik/assets/objekt.baum.tot, Meshy „Twisted Sentinel“, Render von fabrik/baum_render.py) → stil_tot_01.
- Mit 3D-Figuren zeichnet das Spiel alle diese Bäume live in 3D (modell3d: img/objekte3d/baum-laub.glb, baum-tot.glb aus fabrik/baum_export.py);
  die Bilder hier sind dann nur der Ersatz (bis das 3D-Modul geladen ist, außerhalb des Bildausschnitts, ohne 3D).
Schreibt img/welt/stil/<kennung>.webp (mit weichem Bodenschatten) und die Einträge in realtime/welt/bibliothek/objekte.json.
"""
import json, os, sys, colorsys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__)); REALTIME = os.path.normpath(os.path.join(HIER, '..', '..')); WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
BIB = os.path.join(REALTIME, 'welt', 'bibliothek', 'objekte.json'); ZIEL = os.path.join(WURZEL, 'img', 'welt', 'stil')
HOEHE = 370   # Bildhöhe des Baumes in Bildpunkten (wie die bisherigen Stilbäume, ~7,5 Felder)

# Sorte: (Ansicht, Farbton-Verschiebung in Grad, Sättigung ×, Helligkeit ×)
SORTEN = {
    'stil_eiche_01':  (0,   14, 0.95, 0.80, 'Laubbaum (sattgrün)'),
    'stil_eiche_02':  (1,    0, 1.00, 1.00, 'Laubbaum (hellgrün)'),
    'stil_linde_01':  (2,   32, 0.80, 0.78, 'Laubbaum (blaugrün)'),
    'stil_herbst_01': (1,  -48, 1.10, 0.95, 'Laubbaum (herbstlich orange)'),
    'stil_laub_oliv': (2,  -12, 0.80, 0.90, 'Laubbaum (oliv)'),
    'stil_laub_gold': (0,  -32, 1.05, 1.02, 'Laubbaum (goldgelb)'),
    'stil_laub_rot':  (2,  -70, 1.00, 0.85, 'Laubbaum (rotbraun)'),
    'stil_laub_dunkel': (1, 20, 0.85, 0.62, 'Laubbaum (dunkel)'),
}

def zuschneiden(im):
    a = np.array(im)[..., 3]; ys, xs = np.where(a > 8); return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def krone_faerben(im, dh, ds, dv):
    a = np.array(im).astype(np.float32) / 255; rgb = a[..., :3]
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
    h = np.where(mx == rgb[..., 0], ((rgb[..., 1] - rgb[..., 2]) / d) % 6, np.where(mx == rgb[..., 1], (rgb[..., 2] - rgb[..., 0]) / d + 2, (rgb[..., 0] - rgb[..., 1]) / d + 4)) * 60
    s = np.where(mx > 0, d / (mx + 1e-6), 0); v = mx
    gruen = np.clip((s - 0.18) / 0.15, 0, 1) * np.clip(1 - np.abs(h - 95) / 55, 0, 1) ** 0.5      # Blätter: gelb- bis blaugrün, gesättigt; Stamm (Braun) bleibt
    h2 = (h + dh * gruen) % 360; s2 = np.clip(s * (1 + (ds - 1) * gruen), 0, 1); v2 = np.clip(v * (1 + (dv - 1) * gruen), 0, 1)
    c = v2 * s2; x = c * (1 - np.abs((h2 / 60) % 2 - 1)); m = v2 - c; k = (h2 // 60).astype(int) % 6
    r = np.choose(k, [c, x, 0 * c, 0 * c, x, c]); g = np.choose(k, [x, c, c, x, 0 * c, 0 * c]); b = np.choose(k, [0 * c, 0 * c, x, c, c, x])
    a[..., 0], a[..., 1], a[..., 2] = r + m, g + m, b + m
    return Image.fromarray((a * 255).clip(0, 255).astype(np.uint8), 'RGBA')

def fuss_finden(im):
    """Stammfuß: unterste Zeilen mit Inhalt, Mitte der Bildpunkte dort"""
    a = np.array(im)[..., 3] > 40; ys = np.where(a.any(1))[0]; y = ys.max(); band = a[max(0, y - 12):y + 1]; xs = np.where(band.any(0))[0]
    return (xs.min() + xs.max()) / 2, y

def mit_schatten(im, fx, fy, breite):
    """weicher, kühler Bodenschatten unter dem Stammfuß (wie bei den Stilbäumen); Bild nach unten so erweitert, dass der Schatten Platz hat"""
    W, H = im.size; rx, ry = breite * 0.36, breite * 0.075; unten = int(ry * 0.6 + breite * 0.05) + 4; neu = Image.new('RGBA', (W, H + unten), (0, 0, 0, 0))
    sch = Image.new('RGBA', neu.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sch)
    d.ellipse((fx - rx, fy - ry * 1.3, fx + rx, fy + ry * 0.6), fill=(40, 52, 70, 105)); sch = sch.filter(ImageFilter.GaussianBlur(breite * 0.03))   # Schatten um den Stammfuß, eher nach hinten
    neu.alpha_composite(sch); neu.alpha_composite(im, (0, 0)); return neu, (fx / neu.width, (fy + 2) / neu.height)

def speichern(kennung, im, name, r, herkunft):
    os.makedirs(ZIEL, exist_ok=True); p = os.path.join(ZIEL, kennung + '.webp'); im.save(p, 'WEBP', quality=88, method=6)
    return {"id": kennung, "name": name, "kategorie": "bewuchs", "bild": "img/welt/stil/" + kennung + ".webp", "groesse": list(im.size), "anker": None,
            "massstab": 1, "kollision": {"art": "kreis", "r": r}, "tiefe": "fuss", "durchscheinend": True, "interaktion": None, "spiegelbar": True, "herkunft": herkunft}

def main():
    renders, tot = sys.argv[1:4], sys.argv[4]; eintraege = []
    ansichten = []
    for r in renders:
        im = zuschneiden(Image.open(r).convert('RGBA')); f = HOEHE / im.height; ansichten.append(im.resize((round(im.width * f), HOEHE), Image.LANCZOS))
    for kennung, (ans, dh, ds, dv, name) in SORTEN.items():
        im = krone_faerben(ansichten[ans], dh, ds, dv); fx, fy = fuss_finden(im); im, anker = mit_schatten(im, fx, fy, im.width)
        e = speichern(kennung, im, name, 0.45, "fabrik/assets/objekt.baum.laub (Meshy „Verdant Twist“), gerendert mit fabrik/baum_render.py, Krone umgefärbt von werkzeug/welt/baum_bilder.py")
        e["anker"] = [round(float(anker[0]), 4), round(float(anker[1]), 4)]; eintraege.append(e)
    for e in eintraege: d = SORTEN[e['id']]; e['modell3d'] = {"url": "img/objekte3d/baum-laub.glb", "farbton": d[1], "saett": d[2], "hell": d[3]}
    # toter Baum: Render des Meshy-Modells, Krone nicht umgefärbt (er hat keine)
    im = zuschneiden(Image.open(tot).convert('RGBA')); f = (HOEHE - 25) / im.height; im = im.resize((round(im.width * f), HOEHE - 25), Image.LANCZOS)
    fx, fy = fuss_finden(im); im, anker = mit_schatten(im, fx, fy, im.width * 0.8)
    e = speichern('stil_tot_01', im, 'Toter Baum', 0.4, "fabrik/assets/objekt.baum.tot (Meshy „Twisted Sentinel“), gerendert mit fabrik/baum_render.py"); e["anker"] = [round(float(anker[0]), 4), round(float(anker[1]), 4)]
    e['modell3d'] = {"url": "img/objekte3d/baum-tot.glb", "wind": 0.05}; eintraege.append(e)   # kahle Äste: kaum Wind
    B = json.load(open(BIB)); L = B['objekte']; ids = {e['id'] for e in eintraege}
    VIELFALT = {'stil_eiche_01': ['stil_eiche_01', 'stil_laub_dunkel', 'stil_laub_oliv'], 'stil_eiche_02': ['stil_eiche_02', 'stil_laub_oliv', 'stil_eiche_01'],
                'stil_linde_01': ['stil_linde_01', 'stil_laub_dunkel', 'stil_eiche_02'], 'stil_herbst_01': ['stil_herbst_01', 'stil_laub_gold', 'stil_laub_rot']}
    for e in eintraege:
        if e['id'] in VIELFALT: e['vielfalt'] = VIELFALT[e['id']]   # das Spiel wechselt je Standort fest zwischen diesen Kronenfarben (nur Optik, gleiche Größe und Kollision)
    neu = {e['id']: e for e in eintraege}; L[:] = [neu.pop(o['id'], o) for o in L] + list(neu.values())   # bestehende Einträge an ihrem Platz ersetzen
    with open(BIB, 'w') as f: json.dump(B, f, ensure_ascii=False, indent=1); f.write('\n')
    for e in eintraege: print(e['id'], e['groesse'], [float(x) for x in e['anker']], e.get('vielfalt', ''))

if __name__ == '__main__': main()
