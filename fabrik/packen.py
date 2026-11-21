"""Mythara Fabrik – Bildblätter dicht packen: je Ebene ein Atlas für Phaser.

  python3 fabrik/packen.py <export-ordner> <asset-id>

Die Blätter aus rendern.py haben große, meist leere Felder (256 px). Hier wird jedes Bild auf seinen Inhalt beschnitten und je Ebene in einen Atlas gelegt:
  <export>/atlas/<ebene>.webp und <ebene>.json (Phaser-Format „JSON Hash“ mit Beschnittangaben – Phaser setzt das Bild selbst wieder an die richtige Stelle im Feld)
Name eines Bildes: <bewegung>/<richtung 0–7>/<bild>. Ganz leere Bilder fehlen im Atlas (das Teil ist dann nicht zu sehen).
In die Metadaten <asset-id>.json kommt je Ebene der Atlas und sein Speicherbedarf.
"""
import json, os, sys
import numpy as np
from PIL import Image

ordner, kennung = sys.argv[1], sys.argv[2]; meta = json.load(open(os.path.join(ordner, kennung + ".json"))); FELD = meta["feld"]; BREIT = 2048; RAND = 1
ziel = os.path.join(ordner, "atlas"); os.makedirs(ziel, exist_ok=True); gesamt = 0
ebenen = []
for e, d in meta["ebenen"].items(): ebenen += [e + ".hinten", e + ".vorn"] if d["art"] == "starr" else [e]
for ebene in ebenen:
    stuecke = []
    for anim, a in meta["animationen"].items():
        pfad = os.path.join(ordner, f"{ebene}.{anim}.webp")
        if not os.path.exists(pfad): continue
        blatt = np.asarray(Image.open(pfad).convert("RGBA"))
        for r in range(8):
            for b in range(a["bilder"]):
                f = blatt[r * FELD:(r + 1) * FELD, b * FELD:(b + 1) * FELD]; al = f[..., 3] > 0
                if not al.any(): continue
                ys, xs = np.where(al); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1; stuecke.append((f"{anim}/{r}/{b}", f[y0:y1, x0:x1], int(x0), int(y0)))
    if not stuecke: print("leer:", ebene); continue
    stuecke.sort(key=lambda s: -s[1].shape[0]); x = y = zeile = 0; plan = []                      # Regalverfahren: nach Höhe sortiert, zeilenweise
    for name, bild, ox, oy in stuecke:
        h, w = bild.shape[:2]
        if x + w + RAND > BREIT: x = 0; y += zeile + RAND; zeile = 0
        plan.append((name, bild, ox, oy, x, y)); x += w + RAND; zeile = max(zeile, h)
    breite = max(p[4] + p[1].shape[1] for p in plan); hoehe = y + zeile; atlas = np.zeros((hoehe, breite, 4), np.uint8); frames = {}
    for name, bild, ox, oy, px, py in plan:
        h, w = bild.shape[:2]; atlas[py:py + h, px:px + w] = bild
        frames[name] = {"frame": {"x": px, "y": py, "w": w, "h": h}, "rotated": False, "trimmed": True, "spriteSourceSize": {"x": ox, "y": oy, "w": w, "h": h}, "sourceSize": {"w": FELD, "h": FELD}}
    Image.fromarray(atlas, "RGBA").save(os.path.join(ziel, ebene + ".webp"), lossless=True, method=4)
    json.dump({"frames": frames, "meta": {"image": ebene + ".webp", "format": "RGBA8888", "size": {"w": breite, "h": hoehe}, "scale": "1"}}, open(os.path.join(ziel, ebene + ".json"), "w"))
    mb = breite * hoehe * 4 / 1e6; gesamt += mb; basis = ebene.rsplit(".", 1)[0] if ebene.endswith((".vorn", ".hinten")) else ebene
    meta["ebenen"][basis].setdefault("atlas", {})[ebene[len(basis) + 1:] or "bild"] = {"datei": "atlas/" + ebene, "groesse": [breite, hoehe], "bilder": len(frames), "speicher_mb": round(mb, 1)}
    print(f"{ebene:32} {breite}x{hoehe}  {len(frames):3} Bilder  {mb:5.1f} MB im Grafikspeicher")
meta["atlas_speicher_mb"] = round(gesamt, 1); json.dump(meta, open(os.path.join(ordner, kennung + ".json"), "w"), ensure_ascii=False, indent=1)
print("alle Ebenen zusammen:", round(gesamt, 1), "MB")
