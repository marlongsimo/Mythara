"""Mythara Fabrik – wiederverwendbare Zaubereffekte als eigene Bildblätter (unabhängig von jeder Figur).

  python3 fabrik/effekte.py <ziel-ordner>

Gerechnet aus Teilchen und weichen Formen (keine Vorlage, kein Dienst, frei von Lizenzfragen). Jeder Effekt ist ein Blatt mit einer Zeile
und mehreren Bildern, durchsichtiger Hintergrund, additiv gedacht (im Spiel mit Blend-Modus ADD am schönsten, normal geht auch).
  geschoss      magisches Geschoss, fliegt nach Osten (im Spiel in Flugrichtung drehen), Schleife
  frosthauch    Kälte-Kegel aus der Hand nach Osten (drehen), Ursprung links in der Mitte
  donnerwelle   Blitzring um den Einschlagpunkt, am Boden liegend (in der Schrägsicht gestaucht), Ursprung Mitte
  glutsphaere   Feuerexplosion mit Glutboden, Ursprung Mitte (Bodenpunkt)
Dazu effekte.json: Feldgröße, Bilder, Bildrate, Schleife, Ursprung, Radius in Bildpunkten (zum Skalieren auf den Spielradius), Farben.
"""
import json, math, os, sys
import numpy as np
from PIL import Image

ziel = sys.argv[1]; os.makedirs(ziel, exist_ok=True); NEIGUNG = math.radians(35); STAUCH = math.sin(NEIGUNG)   # der Boden erscheint in der Schrägsicht so gestaucht (wie die Figuren, rendern.py)
def leer(F): return np.zeros((F, F, 4), np.float32)
def fleck(b, x, y, r, farbe, staerke=1.0, sy=1.0):
    """weicher, additiver Lichtfleck"""
    F = b.shape[0]; x0, x1 = int(max(0, x - 3 * r)), int(min(F, x + 3 * r + 1)); y0, y1 = int(max(0, y - 3 * r * sy)), int(min(F, y + 3 * r * sy + 1))
    if x1 <= x0 or y1 <= y0: return
    yy, xx = np.mgrid[y0:y1, x0:x1]; g = np.exp(-(((xx - x) / r) ** 2 + ((yy - y) / (r * sy)) ** 2)) * staerke
    b[y0:y1, x0:x1, :3] += g[..., None] * np.array(farbe, np.float32); b[y0:y1, x0:x1, 3] += g
def linie(b, p, q, breite, farbe, staerke=1.0):
    n = max(2, int(math.dist(p, q) / max(1.0, breite * 0.5)))
    for k in range(n + 1): t = k / n; fleck(b, p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, breite, farbe, staerke)
def bild(b):
    """Licht zu Farbe mit Deckkraft: helle Mitte wird weiß, Ränder behalten die Farbe"""
    a = np.clip(b[..., 3], 0, 1); rgb = b[..., :3] / np.maximum(b[..., 3:4], 1e-4); weiss = np.clip(b[..., 3:4] - 1.0, 0, 1) * 0.6
    rgb = np.clip(rgb * (1 - weiss) + weiss, 0, 1); return np.concatenate([rgb, a[..., None]], -1)
def blatt(name, bilder, F, rate, schleife, ursprung, radius, farben, hinweis):
    out = Image.new("RGBA", (F * len(bilder), F))
    for i, b in enumerate(bilder): out.paste(Image.fromarray((bild(b) * 255).astype(np.uint8), "RGBA"), (i * F, 0))
    out.save(os.path.join(ziel, f"effekt.{name}.webp"), lossless=True); out.save(os.path.join(ziel, f"effekt.{name}.png"))
    return {"datei": f"effekt.{name}.webp", "feld": F, "bilder": len(bilder), "rate": rate, "schleife": schleife, "ursprung": ursprung, "radius_px": radius, "farben": farben, "hinweis": hinweis}

meta = {"hinweis": "Zaubereffekte der Fabrik – eigene Ebenen, nicht Teil einer Figur; Maßstab wie die Figuren (86 px je Meter in der Mitte des Feldes)", "effekte": {}}
VIOLETT, LILA, EIS, WEISS, GLUT, ROT, GELB = (0.55, 0.25, 1.0), (0.8, 0.6, 1.0), (0.45, 0.75, 1.0), (1.0, 1.0, 1.0), (1.0, 0.45, 0.1), (0.85, 0.15, 0.05), (1.0, 0.85, 0.35)

# magisches Geschoss: leuchtender Kern mit Schweif nach Westen, Funken; 6 Bilder Schleife
rng = np.random.default_rng(1); F = 128; bilder = []
for i in range(6):
    b = leer(F); cx, cy = 92, 64; flacker = 1 + 0.12 * math.sin(i * 2.1)
    for k in range(14): t = k / 14; fleck(b, cx - 70 * t, cy + 3 * math.sin(i + k * 0.9) * t, 9 * (1 - t) + 2, VIOLETT, 0.5 * (1 - t))
    fleck(b, cx, cy, 13 * flacker, VIOLETT, 1.2); fleck(b, cx, cy, 6 * flacker, WEISS, 1.6)
    for k in range(6): a = rng.uniform(0, 2 * math.pi); d = rng.uniform(8, 30); fleck(b, cx - abs(math.cos(a)) * d * 1.5, cy + math.sin(a) * d * 0.6, 2.0, LILA, 0.9)
    bilder.append(b)
meta["effekte"]["geschoss"] = blatt("geschoss", bilder, F, 14, True, [0.72, 0.5], 14, ["#8c40ff", "#ffffff"], "fliegt nach Osten; im Spiel in Flugrichtung drehen und bewegen")

# Frosthauch: Kegel (Öffnung 50°) nach Osten, Eiswolke mit Kristallsplittern; wächst, steht, verweht
rng = np.random.default_rng(2); F = 256; bilder = []; teile = [(rng.uniform(0, 1), rng.uniform(-1, 1), rng.uniform(0.5, 1.2)) for _ in range(140)]
for i in range(8):
    b = leer(F); reich = min(1.0, (i + 1) / 4); weg = max(0.0, (i - 5) / 3)
    for d, q, g in teile:
        if d > reich: continue
        x = 12 + d * 225; y = F / 2 + q * math.tan(math.radians(25)) * d * 225 * (1 + 0.15 * i / 8); r = (4 + 14 * d) * g
        fleck(b, x, y, r, EIS if g > 0.8 else WEISS, 0.35 * (1 - weg) * (1 - 0.4 * d))
    for k in range(10):
        d = rng.uniform(0.15, reich) if reich > 0.15 else 0.15; q = rng.uniform(-1, 1); x = 12 + d * 225; y = F / 2 + q * math.tan(math.radians(25)) * d * 225
        linie(b, (x - 5, y - 5), (x + 5, y + 5), 1.4, WEISS, 0.8 * (1 - weg)); linie(b, (x - 5, y + 5), (x + 5, y - 5), 1.4, WEISS, 0.8 * (1 - weg))
    bilder.append(b)
meta["effekte"]["frosthauch"] = blatt("frosthauch", bilder, F, 12, False, [0.05, 0.5], 225, ["#73bfff", "#ffffff"], "Kegel nach Osten, Ursprung an der Hand; im Spiel in Blickrichtung drehen; radius_px = Reichweite")

# Donnerwelle: Blitzring, der sich am Boden ausbreitet, mit Zickzack-Blitzen nach außen; Mitte = Einschlag
rng = np.random.default_rng(3); F = 320; bilder = []
for i in range(8):
    b = leer(F); c = F / 2; t = (i + 1) / 8; R = 140 * min(1.0, t * 1.4); hell = 1.0 if i < 5 else (8 - i) / 3
    for k in range(48): a = 2 * math.pi * k / 48; fleck(b, c + R * math.cos(a), c + R * math.sin(a) * STAUCH, 6, VIOLETT, 0.5 * hell, STAUCH)
    fleck(b, c, c, 30 * (1 - t) + 6, WEISS, 1.2 * hell, STAUCH)
    for k in range(7):                                                                           # Blitze vom Einschlag nach außen
        a = rng.uniform(0, 2 * math.pi); p = (c, c)
        for s in range(6):
            d = R * (s + 1) / 6; w = a + rng.uniform(-0.35, 0.35); q = (c + d * math.cos(w), c + d * math.sin(w) * STAUCH - rng.uniform(0, 10)); linie(b, p, q, 1.8, LILA, 1.0 * hell); p = q
    bilder.append(b)
meta["effekte"]["donnerwelle"] = blatt("donnerwelle", bilder, F, 12, False, [0.5, 0.5], 140, ["#8c40ff", "#ccaaff", "#ffffff"], "am Boden um den Einschlag; radius_px = Radius des Zaubers")

# Glutsphäre: Feuerball schlägt ein, Explosion mit Flammenzungen, danach glühender Boden (für den Schaden über Zeit)
rng = np.random.default_rng(4); F = 320; bilder = []; funken = [(rng.uniform(0, 2 * math.pi), rng.uniform(0.4, 1.0), rng.uniform(0.6, 1.4)) for _ in range(90)]
for i in range(8):
    b = leer(F); c = F / 2; t = (i + 1) / 8; R = 150 * min(1.0, t * 1.6); hell = 1.0 if i < 5 else 0.55
    fleck(b, c, c + 4, R * 0.95, ROT, 0.35 * hell, STAUCH)                                          # glühender Boden
    for a, d, g in funken:
        x = c + math.cos(a) * d * R; y = c + math.sin(a) * d * R * STAUCH - (1 - d) * 40 * (1 - t) - 30 * g * min(1, t * 2) * (1 - t)
        fleck(b, x, y, (10 + 8 * g) * (1 - 0.5 * t), GLUT if g > 0.9 else GELB, 0.45 * hell)
    if i < 5: fleck(b, c, c - 30 * (1 - t), 60 * (1 - t) + 20, GLUT, 1.0); fleck(b, c, c - 30 * (1 - t), 30 * (1 - t) + 8, WEISS, 1.4)   # Feuerball
    bilder.append(b)
meta["effekte"]["glutsphaere"] = blatt("glutsphaere", bilder, F, 12, False, [0.5, 0.5], 150, ["#ff7319", "#d92610", "#ffd959"], "Explosion am Einschlag; die letzten Bilder (glühender Boden) eignen sich zum Halten für den Schaden über Zeit")

json.dump(meta, open(os.path.join(ziel, "effekte.json"), "w"), ensure_ascii=False, indent=1)
for k, v in meta["effekte"].items(): print(f"{k}: {v['bilder']} Bilder à {v['feld']} px · {v['datei']}")
