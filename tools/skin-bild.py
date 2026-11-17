#!/usr/bin/env python3
"""
Mythara – Bilder für einen Helden-Skin erzeugen: freistellen und in die drei Formate schneiden.
  python3 tools/skin-bild.py <bild> <skin_id> <held_id> <weiss|schwarz|schach|alpha> [Kopfmitte 0..1] [Pruefbild]
Erzeugt img/figuren/<skin>.jpg (Porträt), img/figuren/ganz/<skin>.webp (Kampffigur im Seitenverhältnis des Helden)
und img/figuren/ganz/<skin>-gross.webp (Händler, Heldenkarte).
weiss = weißer Grund (auch mit blassem Schachbrett), schwarz = schwarzer Grund, schach = aufgemaltes grau-weißes Schachbrett,
alpha = das Bild hat schon echte Transparenz. Gemalte Hintergründe lassen sich so nicht entfernen. Braucht Pillow, numpy und scipy.
"""
import sys, os, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
quelle, skin, held, grund = sys.argv[1:5]; kopf = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5; pruef = sys.argv[6] if len(sys.argv) > 6 else None
roh = Image.open(quelle); a = np.asarray(roh.convert("RGB")).astype(np.int16); mn, mx = a.min(2), a.max(2)
if grund == "alpha":
    hg = np.asarray(roh.convert("RGBA").getchannel("A")) < 128
elif grund == "weiss":
    hg = (mn > 226) & ((mx - mn) < 14); hg[:14, :14] = True
elif grund == "schach":
    hg = ((mx - mn) < 18) & (mn > 180)
else:
    hg = mx < int(os.environ.get("SCHWELLE", 9))     # SCHWELLE höher (z. B. 34), wenn um eine helle Figur ein schwarzer Saum bleibt
lab, n = ndi.label(hg); rand = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); rand = rand[rand > 0]; weg = np.isin(lab, rand)
inseln = np.zeros_like(weg)
if grund == "schwarz" and os.environ.get("INSELN"):                     # helle Figur auf Schwarz: eingeschlossene schwarze Flächen (in Haarschlaufen, Ringen) entfernen –
    oben = int(a.shape[0] * float(os.environ.get("INSELN_BIS", 1)))     # nur bis zu dieser Höhe (0..1), damit dunkler Stoff weiter unten ganz bleibt
    for i, g in enumerate(ndi.sum(hg, lab, range(1, n + 1)), 1):
        if g > int(os.environ["INSELN"]) and i not in rand and np.nonzero(lab == i)[0].max() < oben:
            xs = np.nonzero(lab == i)[1] / a.shape[1]; rnd = float(os.environ.get("INSELN_RAND", 1))   # INSELN_RAND (0..0.5): nur in den äußeren Streifen links und rechts
            if rnd >= 0.5 or xs.max() < rnd or xs.min() > 1 - rnd: inseln |= (lab == i)
if grund == "alpha":
    al = np.asarray(roh.convert("RGBA").getchannel("A")).astype(np.float32) / 255; al = np.where(al < 0.5, 0, np.clip((al - 0.5) / 0.4, 0, 1)); rgb = a.astype(np.float32)   # halbdurchsichtigen Schein um die Figur weglassen
elif grund in ("weiss", "schach"):
    for i, g in enumerate(ndi.sum(hg, lab, range(1, n + 1)), 1):          # eingeschlossene helle Flächen (zwischen Arm und Körper)
        if g > int(os.environ.get("HELLE_INSELN", 220)) and i not in rand: weg |= (lab == i)   # HELLE_INSELN sehr groß setzen, wenn die Figur selbst weiß ist (Eis, Pelz)
    weg = ndi.binary_dilation(weg, iterations=2 if grund == "schach" else 1)
    if grund == "schach":                                                 # übrig gebliebene Krümel des Musters entfernen
        l2, n2 = ndi.label(~weg); gr = ndi.sum(~weg, l2, range(1, n2 + 1)); weg |= np.isin(l2, [i for i, g in enumerate(gr, 1) if g < 1500])
    al = np.asarray(Image.fromarray(np.where(weg, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32); al = np.clip((al - 70) / 185, 0, 1)
    rgb = a.astype(np.float32); k = (al < 0.98) & (al > 0); rgb[k] = np.clip((rgb[k] - 255 * (1 - al[k, None])) / np.maximum(al[k, None], 0.05), 0, 255)   # weißen Schimmer am Rand entfernen
else:
    figur = ndi.binary_fill_holes(ndi.binary_closing(~weg, structure=ndi.generate_binary_structure(2, 1), iterations=int(os.environ.get("SCHLIESSEN", 7)))) & ~ndi.binary_dilation(inseln, iterations=1)
    l2, n2 = ndi.label(figur); gr = ndi.sum(figur, l2, range(1, n2 + 1)); figur &= ~np.isin(l2, [i for i, g in enumerate(gr, 1) if g < 500])   # lose Krümel                                      # schmale Einschnitte in schwarzen Stoff schließen
    al = np.asarray(Image.fromarray(np.where(figur, 255, 0).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255; al = np.clip((al - 0.3) / 0.7, 0, 1); rgb = a.astype(np.float32)
fig = Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), "RGBA"); fig = fig.crop(fig.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())
W, H = Image.open(f"img/figuren/ganz/{held}.webp").size
f2 = fig.copy(); f2.thumbnail((W, H), Image.LANCZOS); can = Image.new("RGBA", (W, H), (0, 0, 0, 0)); can.paste(f2, ((W - f2.width) // 2, H - f2.height), f2); can.save(f"img/figuren/ganz/{skin}.webp", quality=92, method=6)
g = fig.copy(); g.thumbnail((640, 900), Image.LANCZOS); g.save(f"img/figuren/ganz/{skin}-gross.webp", quality=90, method=6)
w, h = fig.size; s = int(w * 0.5); cx = int(w * kopf); x0 = max(0, min(w - s, cx - s // 2)); p = fig.crop((x0, 0, x0 + s, s)).resize((256, 256), Image.LANCZOS)
farbe = np.asarray(p.convert("RGB")).reshape(-1, 3)[np.asarray(p.getchannel("A")).reshape(-1) > 128].mean(0) if np.asarray(p.getchannel("A")).max() > 128 else np.array([60, 40, 30])
yy, xx = np.mgrid[0:256, 0:256]; v = np.clip(1 - np.sqrt((xx - 128) ** 2 + (yy - 110) ** 2) / 180, 0, 1)[..., None]
hgb = Image.fromarray((np.array([18, 14, 16]) + v * farbe * 0.45).clip(0, 255).astype(np.uint8), "RGB"); hgb.paste(p, (0, 0), p); hgb.save(f"img/figuren/{skin}.jpg", quality=90)
print(skin, "Figur", fig.size, "Kampffigur", (W, H))
if pruef:
    pr = Image.new("RGB", (1200, 820), (18, 16, 24))
    for i, c in enumerate([(60, 58, 70), (150, 120, 80)]):
        t = Image.new("RGB", (450, 820), c); k2 = fig.copy(); k2.thumbnail((450, 800), Image.LANCZOS); t.paste(k2, ((450 - k2.width) // 2, 10), k2); pr.paste(t, (i * 450, 0))
    pr.paste(hgb, (920, 40)); pr.save(pruef)
