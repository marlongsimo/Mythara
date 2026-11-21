"""Mythara Fabrik – Schritt 1: ein Referenzblatt in Einzelbilder zerlegen und vermessen.

  python3 -I fabrik/referenz.py fabrik/assets/<asset-id>

Liest referenz/schnitt.json (Kästen in Bildpunkten der Vorlage) und schreibt je Ausschnitt
  referenz/teile/<name>.png    freigestellt, quadratisch mit Rand – so geht das Bild an den Bild-zu-3D-Dienst
dazu referenz/analyse.json (Maße, Hauptfarben, Auflösung, Warnungen) und referenz/kontaktbogen.png zur Kontrolle.
Die Vorlage selbst wird nie verändert.

Freistellen: Der Hintergrund ist helles Papier. Vom Rand des Ausschnitts her gilt als Hintergrund, was dem Papier in der Farbe gleicht –
auch dunkler (weicher Schatten unter den Füßen), solange der Farbton stimmt. Was vom Rand nicht erreichbar ist, bleibt.
"""
import hashlib, json, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

RAND = 0.08          # freier Rand um das Motiv im quadratischen Bild
KLEIN = 512          # unter so vielen Bildpunkten (längste Seite des Motivs) wird gewarnt: zu wenig für ein gutes Modell


def freistellen(rgb, papier, stuecke=1, innen=False):
    a = rgb.astype(np.float32); hell = a.mean(-1) + 1e-3; ph = float(papier.mean())
    ton = np.abs(a / hell[..., None] - papier / ph).sum(-1)          # Abweichung im Farbton, unabhängig von der Helligkeit
    wie_papier = (ton < 0.085) & (hell > ph * 0.62)                    # Papier und sein Schatten
    wie_papier |= np.abs(a - papier).sum(-1) < 40
    wie_papier = ndimage.binary_opening(wie_papier, iterations=1)
    lab, _ = ndimage.label(wie_papier); rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    motiv = ~np.isin(lab, list(rand))
    if innen:                                                          # auch eingeschlossenes Papier entfernen (Riemenschlaufe) – nur auf Wunsch, sonst gingen helle Wappen verloren
        g = ndimage.sum(wie_papier, lab, range(1, lab.max() + 1)); motiv &= ~np.isin(lab, [i + 1 for i in range(len(g)) if g[i] >= 120])
    l2, n = ndimage.label(motiv)
    if n > stuecke:                                                    # nur die größten Stücke behalten: Krümel, Trennlinien und hereinragende Nachbarn fallen weg
        g = ndimage.sum(motiv, l2, range(1, n + 1)); motiv = np.isin(l2, [int(i) + 1 for i in np.argsort(g)[::-1][:stuecke]])
    loch = ndimage.binary_fill_holes(motiv) & ~motiv; l3, k = ndimage.label(loch)   # kleine Löcher schließen (helle Glanzlichter); große bleiben offen (Papier in einer Riemenschlaufe)
    if k: g = ndimage.sum(loch, l3, range(1, k + 1)); motiv |= np.isin(l3, [i + 1 for i in range(k) if g[i] < 120])
    return ndimage.binary_erosion(motiv, iterations=1)                 # ein Bildpunkt Papiersaum weg


def farben(rgb, maske, n=6):
    px = Image.fromarray(rgb[maske].reshape(-1, 1, 3).astype(np.uint8), "RGB").quantize(n, method=Image.Quantize.MEDIANCUT)
    pal = px.getpalette()[: n * 3]; zahl = sorted(px.getcolors(), reverse=True)
    return [{"farbe": "#%02x%02x%02x" % tuple(pal[i * 3: i * 3 + 3]), "anteil": round(c / maske.sum(), 3)} for c, i in zahl]


def main(ordner):
    ref = os.path.join(ordner, "referenz"); S = json.load(open(os.path.join(ref, "schnitt.json"))); quelle = os.path.join(ref, S["quelle"])
    im = Image.open(quelle).convert("RGB"); A = np.asarray(im); papier = np.median(A.reshape(-1, 3)[::97], axis=0).astype(np.float32)
    teile = os.path.join(ref, "teile"); os.makedirs(teile, exist_ok=True); aus, bogen = [], []
    for t in S["ausschnitte"]:
        l, o, r, u = t["kasten"]; p = 6; l, o, r, u = max(0, l - p), max(0, o - p), min(im.width, r + p), min(im.height, u + p)
        rgb = A[o:u, l:r]; m = freistellen(rgb, papier, t.get("stuecke", 1), t.get("innen", False)); ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
        bild = Image.fromarray(rgb, "RGB").convert("RGBA"); bild.putalpha(alpha); bild = bild.crop((x0, y0, x1, y1))
        b, h = bild.size; seite = round(max(b, h) * (1 + 2 * RAND)); q = Image.new("RGBA", (seite, seite), (0, 0, 0, 0)); q.alpha_composite(bild, ((seite - b) // 2, (seite - h) // 2))
        ziel = os.path.join(teile, t["name"] + ".png"); q.save(ziel)
        warn = []
        if max(b, h) < KLEIN: warn.append(f"geringe Auflösung: {max(b, h)} px (empfohlen ab {KLEIN})")
        if x0 <= 1 or y0 <= 1 or x1 >= m.shape[1] - 1 or y1 >= m.shape[0] - 1: warn.append("Motiv berührt den Rand des Kastens")
        aus.append({"name": t["name"], "asset": t["asset"], "ansicht": t["ansicht"], "datei": "teile/" + t["name"] + ".png", "kasten": [int(l + x0), int(o + y0), int(l + x1), int(o + y1)],
                    "breite": b, "hoehe": h, "verhaeltnis": round(b / h, 3), "deckung": round(float(m[y0:y1, x0:x1].mean()), 3), "farben": farben(rgb, m), "warnungen": warn})
        bogen.append((t["name"], q))
    assets = {}
    for a in aus: assets.setdefault(a["asset"], []).append(a["name"])
    json.dump({"quelle": S["quelle"], "sha256": hashlib.sha256(open(quelle, "rb").read()).hexdigest(), "groesse": list(im.size), "papier": "#%02x%02x%02x" % tuple(int(v) for v in papier),
               "assets": assets, "ausschnitte": aus}, open(os.path.join(ref, "analyse.json"), "w"), ensure_ascii=False, indent=1)
    Z, sp = 200, 6; ze = -(-len(bogen) // sp); k = Image.new("RGBA", (sp * Z, ze * Z), (52, 44, 60, 255))   # dunkler Grund: helle Reste des Papiers fallen sofort auf
    for i, (_, q) in enumerate(bogen): v = q.resize((Z - 12, Z - 12), Image.LANCZOS); k.alpha_composite(v, (i % sp * Z + 6, i // sp * Z + 6))
    k.convert("RGB").save(os.path.join(ref, "kontaktbogen.png"))
    for a in aus: print(f'{a["name"]:18} {a["breite"]:4}x{a["hoehe"]:<4} {a["asset"]:28} {"; ".join(a["warnungen"])}')
    print(len(aus), "Ausschnitte,", len(assets), "Assets")


if __name__ == "__main__": main(sys.argv[1])
