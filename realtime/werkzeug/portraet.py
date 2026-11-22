#!/usr/bin/env python3
"""Mythara – Porträts des eigenen Helden für die Nahansicht im Heldeneditor (rendert mit Blender, setzt die Streifen zusammen).

  python3 werkzeug/portraet.py          (im Ordner realtime; braucht blender im Pfad)

Für Grundmann und Grundfrau (fabrik/assets/basis.<g>/v002/quelle/koerper.glb) und alle Frisuren und Bärte (fabrik/assets/kopf.*/teile/*.glb):
werkzeug/portraet_blender.py rendert Kopf und Schultern in 8 Richtungen, je Ebene getrennt. Danach hier:
  img/figuren-fabrik/held.<g>/portraet/<ebene>.webp   8 Richtungen nebeneinander (je 384 × 384), Ebenen: koerper, haut, kopf.haar.*, kopf.bart.*
  img/figuren-fabrik/held.<g>/portraet/portraet.json  Größe, Ebenen und Bezugshelligkeit von Haut, Haar und Bart (für das Färben, siehe shared/aussehen.ts)
Die Haut wird wie in werkzeug/grundfigur.py nach Farbe erkannt (ohne Höhenregel: im Porträt gibt es keine Stiefel).
"""
import json, os, shutil, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", "..")); FAB = os.path.join(WURZEL, "fabrik", "assets")
TEILE = {"mann": ["kopf.haar.herren", "kopf.bart.herren"], "frau": ["kopf.haar.damen"]}

def hautmaske(px):
    a = px.astype(float) / 255; r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); s = (mx - mn) / np.maximum(mx, 1e-6)
    m = (al > 0.5) & ((r - g) > 0.06) & ((r - b) > 0.1) & (s > 0.54) & (mx > 0.1)   # Haut: deutlich gesättigter als das Hemd (Hemd ≤ 0,50, Haut ≈ 0,66 – gemessen), auch im Schatten
    bild = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5))
    return (np.asarray(bild) > 127) & m
def helligkeit(px, maske, anteil=70):
    a = px[..., :3].astype(float)[maske]; return float(np.percentile(0.299 * a[:, 0] + 0.587 * a[:, 1] + 0.114 * a[:, 2], anteil)) if len(a) else 128.0

for g, sammlungen in TEILE.items():
    teile = []
    for s in sammlungen:
        d = os.path.join(FAB, s, "teile")
        for f in sorted(os.listdir(d)):
            if f.endswith(".glb"): teile.append((f[:-4], os.path.join(d, f)))
    tmp = tempfile.mkdtemp(prefix="portraet-")
    subprocess.run(["blender", "-b", "-P", os.path.join(HIER, "portraet_blender.py"), "--", tmp, os.path.join(FAB, f"basis.{g}", "v002", "quelle", "koerper.glb")] + [f"{n}={p}" for n, p in teile],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ziel = os.path.join(WURZEL, "img", "figuren-fabrik", f"held.{g}", "portraet"); os.makedirs(ziel, exist_ok=True)
    ebenen = ["koerper"] + [n for n, _ in teile]; A = 384; bezug = {}
    bilder = {e: [np.asarray(Image.open(os.path.join(tmp, f"{e}_{r}.png")).convert("RGBA")) for r in range(8)] for e in ebenen}
    bilder["haut"] = [np.where(hautmaske(b)[..., None], b, 0).astype(np.uint8) for b in bilder["koerper"]]
    vorn = bilder["koerper"][2]; bezug["haut"] = round(helligkeit(vorn, hautmaske(vorn), 90), 1)
    for art, praefix in (("haar", "kopf.haar."), ("bart", "kopf.bart.")):
        werte = [helligkeit(bilder[e][2], bilder[e][2][..., 3] > 200) for e in ebenen if e.startswith(praefix)]
        bezug[art] = round(float(np.median(werte)), 1) if werte else 100.0
    for e, liste in bilder.items():
        streifen = Image.new("RGBA", (A * 8, A), (0, 0, 0, 0))
        for r, b in enumerate(liste): streifen.paste(Image.fromarray(b), (r * A, 0))
        streifen.save(os.path.join(ziel, e + ".webp"), quality=90, method=5)
    json.dump({"groesse": A, "ebenen": sorted(bilder), "bezug": bezug}, open(os.path.join(ziel, "portraet.json"), "w"), separators=(",", ":"))
    shutil.rmtree(tmp, ignore_errors=True)
    mb = sum(os.path.getsize(os.path.join(ziel, f)) for f in os.listdir(ziel)) / 1e6
    print(f"held.{g}: {len(ebenen)} Ebenen + Haut, Bezug {bezug}, {mb:.1f} MB")
