"""Mythara Fabrik – eine feste Ausrüstungsvariante einer Figur zusammenstellen und speichern (ohne neu zu rendern).

  python3 fabrik/variante.py <export-ordner> <asset-id> <name> <waffe> <ziel-ordner>

Beispiel:  python3 fabrik/variante.py fabrik/assets/gegner.bandit/v002/export gegner.bandit dolch waffe.dolch fabrik/assets/gegner.bandit/varianten/dolch

Nimmt aus einer fertig gerenderten Figur den Körper, je Platz das erste Kleidungs- oder Rüstungsteil und genau eine Waffe.
Bewegungen: alle, außer den Angriffen anderer Waffen; der Angriff dieser Waffe steht in den Angaben unter „angriff“.
Schreibt in den Zielordner, im Format des Spielmoduls (wie spiel_export.py):
  <ebene>.webp/.json      die Atlanten der gewählten Ebenen
  <asset-id>.json         Feld, Fußpunkt, sichtbare Höhe, Bewegungen, Tiefe der Waffe, Ebenen, Variante, Angriff
  vorschau.gif            alle Bewegungen der Variante in acht Richtungen
"""
import json, os, shutil, sys
import numpy as np
from PIL import Image, ImageDraw

ordner, kennung, name, waffe, ziel = sys.argv[1:6]
M = json.load(open(os.path.join(ordner, kennung + ".json"))); F = M["feld"]; EB = M["ebenen"]; A = M["animationen"]
if waffe not in EB or EB[waffe]["art"] != "starr": sys.exit(f"{waffe} ist keine Waffe dieser Figur – vorhanden: {[e for e, d in EB.items() if d['art'] == 'starr']}")
angriff = EB[waffe].get("angriff", "angriff"); fremde = {d.get("angriff", "angriff") for e, d in EB.items() if d["art"] == "starr" and e != waffe} - {angriff}
anims = {a: v for a, v in A.items() if a not in fremde}
huellen = [t[0] for p, t in M["plaetze"].items() if EB[t[0]]["art"] == "huelle"]; ebenen = ["koerper"] + huellen
os.makedirs(ziel, exist_ok=True)

_b = {}
def blatt(e, a):
    if (e, a) not in _b: _b[(e, a)] = Image.open(os.path.join(ordner, f"{e}.{a}.webp")).convert("RGBA")
    return _b[(e, a)]
def figur(a, r, i):
    """so zusammengesetzt wie im Spiel: Waffe hinten, Körper, Kleidung, Waffe vorn"""
    bild = Image.new("RGBA", (F, F), (0, 0, 0, 0))
    for e in [waffe + ".hinten"] + ebenen + [waffe + ".vorn"]: bild.alpha_composite(blatt(e, a).crop((i * F, r * F, (i + 1) * F, (r + 1) * F)))
    return bild

# sichtbare Höhe (Sohle bis Scheitel) in Ruhe von vorn – danach richtet das Spiel den Maßstab
al = np.asarray(figur("ruhe", 2, 0))[..., 3]; ys = np.where(al.max(1) > 40)[0]; sichtbar = int(ys.max() - ys.min() + 1)
groesse = 0
for e in ebenen + [waffe + ".hinten", waffe + ".vorn"]:
    for endung in (".webp", ".json"): q = os.path.join(ordner, "atlas", e + endung); shutil.copyfile(q, os.path.join(ziel, e + endung)); groesse += os.path.getsize(q)
meta = {"id": kennung, "variante": name, "angriff": angriff, "feld": F, "fuss": M["fuss"], "sichtbar_px": sichtbar, "animationen": anims, "ebenen": ebenen, "waffen": [waffe],
        "tiefe": {waffe: {a: v for a, v in M["tiefe"][waffe].items() if a in anims}}, "richtungen": M["richtungen"], "zeile": M["zeile"], "quelle": os.path.relpath(ordner)}
json.dump(meta, open(os.path.join(ziel, kennung + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))

# Vorschau: acht Richtungen nebeneinander, jede Bewegung nacheinander
NAME = {"ruhe": "Ruhe", "laufen": "Laufen", "angriff": "Angriff", "angriff_axt": "Axtangriff", "angriff_dolch": "Dolchstich", "block": "Block", "treffer": "Treffer", "ausweichen": "Ausweichen", "tod": "Tod"}
WDH = {"ruhe": 1, "laufen": 2, "block": 1, "tod": 1}; Z = 200; folge = []
for a in [x for x in ("ruhe", "laufen", angriff, "block", "treffer", "ausweichen", "tod") if x in anims]:
    for _ in range(WDH.get(a, 2)):
        for i in range(anims[a]["bilder"]):
            k = Image.new("RGBA", (F * 4, F * 2 + 34), (40, 34, 48, 255)); ImageDraw.Draw(k).text((10, 10), f"{kennung} · Variante {name} ({waffe.split('.')[-1]}) · {NAME.get(a, a)} · acht Richtungen", fill=(236, 228, 212))
            for r in range(8): k.alpha_composite(figur(a, r, i), (r % 4 * F, 34 + r // 4 * F))
            folge.append((k.convert("RGB").resize((Z * 4, round((F * 2 + 34) * Z / F)), Image.LANCZOS).quantize(128), 1000 // anims[a]["rate"]))
    if a in ("block", "tod"): folge.append((folge[-1][0], 900))
folge[0][0].save(os.path.join(ziel, "vorschau.gif"), save_all=True, append_images=[f for f, _ in folge[1:]], duration=[d for _, d in folge], loop=0, optimize=True)
print(f"{kennung} · {name}: {waffe}, Angriff „{angriff}“, {len(ebenen)} Ebenen + Waffe, Bewegungen {', '.join(anims)} · sichtbare Höhe {sichtbar} px · {groesse / 1e6:.1f} MB · {ziel}")
