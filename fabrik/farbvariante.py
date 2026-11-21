"""Mythara Fabrik – Farbvarianten für Fraktionen: das Blau einzelner Ebenen (Umhang, Schild) in den fertigen Blättern umfärben, ohne neu zu rendern.

  python3 fabrik/farbvariante.py <export-ordner> <asset-id> <ebene>[,<ebene>…] <name>=<#rrggbb> [<name>=<#rrggbb> …]

Beispiel:  python3 fabrik/farbvariante.py fabrik/assets/held.schildwahrer/v001/export held.schildwahrer \
             kleidung.umhang.schildwahrer,schild.kreuz rot=#a8302a gruen=#2f6b34

Umgefärbt werden nur Bildpunkte im Blaubereich (Farbton 190–260°, gesättigt); Licht und Schatten bleiben (Helligkeit relativ zum mittleren Blau),
Goldkreuz, Saum und Rand behalten ihre Farbe. Jede Variante wird eine eigene Ebene „<ebene>.<name>“ am selben Platz, mit derselben Tiefe –
in Testszene und Spiel wie jedes andere Teil wählbar. Danach packen.py erneut laufen lassen (Atlanten).
"""
import colorsys, json, os, sys
import numpy as np
from PIL import Image

ordner, kennung, ebenen, *farben = sys.argv[1:]; ebenen = ebenen.split(","); farben = [f.split("=") for f in farben]
M = json.load(open(os.path.join(ordner, kennung + ".json"))); EB = M["ebenen"]
def rgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255
def blau(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a[..., :3].max(-1); mn = a[..., :3].min(-1); s = (mx - mn) / np.maximum(mx, 1e-4)
    h = np.zeros_like(mx); m = mx - mn > 1e-4
    h = np.where(m & (mx == b), 240 + 60 * (r - g) / np.maximum(mx - mn, 1e-4), np.where(m & (mx == g), 120 + 60 * (b - r) / np.maximum(mx - mn, 1e-4), 60 * (g - b) / np.maximum(mx - mn, 1e-4))) % 360
    return (h > 190) & (h < 260) & (s > 0.25) & (a[..., 3] > 0.02), mx
dateien = sorted(f for f in os.listdir(ordner) if f.endswith(".webp") and any(f.startswith(e + ".") for e in ebenen) and f.split(".")[-2] in M["animationen"])
for name, hexwert in farben:
    ziel = rgb(hexwert); _, _, v_ziel = colorsys.rgb_to_hsv(*ziel); n = 0
    for f in dateien:
        e = next(e for e in ebenen if f.startswith(e + ".")); rest = f[len(e):]                         # z. B. „.hinten.laufen.webp“ oder „.laufen.webp“
        a = np.asarray(Image.open(os.path.join(ordner, f)).convert("RGBA")).astype(np.float32) / 255; maske, hell = blau(a)
        if maske.any():
            bezug = float(np.median(hell[maske])); schatten = (hell / max(bezug, 1e-4))[..., None]
            a[..., :3] = np.where(maske[..., None], np.clip(ziel[None, None] * schatten, 0, 1), a[..., :3])
        Image.fromarray((a * 255).round().astype(np.uint8), "RGBA").save(os.path.join(ordner, f"{e}.{name}{rest}"), lossless=True); n += 1
    for e in ebenen:
        neu = f"{e}.{name}"; EB[neu] = dict(EB[e], variante_von=e, farbe=hexwert); M["plaetze"][EB[e]["platz"]].append(neu)
        if e in M.get("tiefe", {}): M["tiefe"][neu] = M["tiefe"][e]
    print(f"{name} ({hexwert}): {n} Blätter umgefärbt")
json.dump(M, open(os.path.join(ordner, kennung + ".json"), "w"), ensure_ascii=False, indent=1); print("eingetragen in", kennung + ".json")
