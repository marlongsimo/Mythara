"""Mythara Fabrik – eine bewegte Vorschau (GIF) aus den gerenderten Ebenen, so zusammengesetzt wie im Spiel.

  python3 fabrik/vorschau-gif.py <export-ordner> <asset-id> <ziel.gif>

Zeigt alle acht Richtungen nebeneinander (oben O, SO, S, SW – unten W, NW, N, NO) und spielt nacheinander jede Bewegung ab.
Danach dieselbe Laufbewegung mit wechselnder Ausrüstung, um zu zeigen, dass die Ebenen frei kombinierbar sind.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

ordner, kennung, ziel = sys.argv[1], sys.argv[2], sys.argv[3]; M = json.load(open(os.path.join(ordner, kennung + ".json"))); F = M["feld"]; EB = M["ebenen"]; A = M["animationen"]
Z = 200; OBEN, UNTEN = 0, F                                                                       # das ganze Feld: so sieht man auch, dass nichts abgeschnitten ist
_b = {}
def blatt(e, a):
    if (e, a) not in _b: _b[(e, a)] = Image.open(os.path.join(ordner, f"{e}.{a}.webp")).convert("RGBA")
    return _b[(e, a)]
def figur(a, r, i, teile):
    ohne = set(A[a].get("ohne", [])); w = sorted([t for t in teile if EB[t]["art"] == "starr" and EB[t]["platz"] not in ohne], key=lambda t: -M["tiefe"][t][a][r][i])
    bild = Image.new("RGBA", (F, F), (0, 0, 0, 0))
    for e in [t + ".hinten" for t in w] + ["koerper"] + [t for t in teile if EB[t]["art"] == "huelle"] + [t + ".vorn" for t in w]: bild.alpha_composite(blatt(e, a).crop((i * F, r * F, (i + 1) * F, (r + 1) * F)))
    return bild.crop((0, OBEN, F, UNTEN))
def bogen(a, i, teile, text):
    h = UNTEN - OBEN; k = Image.new("RGBA", (F * 4, h * 2 + 34), (40, 34, 48, 255)); d = ImageDraw.Draw(k); d.text((10, 10), text, fill=(236, 228, 212))
    for r in range(8): k.alpha_composite(figur(a, r, i, teile), (r % 4 * F, 34 + r // 4 * h))
    return k.convert("RGB").resize((F * 4 * Z // F * 1, round((h * 2 + 34) * Z / F)), Image.LANCZOS).quantize(128)
voll = {"hand_r": "waffe.langschwert", "arm_l": "schild.baum", "brust": "ruestung.brust.platte", "bein": "ruestung.bein.schiene", "hand": "ruestung.hand.leder", "fuss": "ruestung.fuss.stiefel"}
alle = list(voll.values()); folge = []
NAME = {"ruhe": "Ruhe", "laufen": "Laufen", "angriff": "Einhandangriff", "block": "Block (Schild)", "angriff2h": "Zweihandangriff", "treffer": "Treffer", "ausweichen": "Ausweichen"}
for a, wdh in (("ruhe", 1), ("laufen", 2), ("angriff", 2), ("block", 1), ("angriff2h", 2), ("treffer", 2), ("ausweichen", 2)):
    n = A[a]["bilder"]; dauer = 1000 // A[a]["rate"]
    for _ in range(wdh):
        for i in range(n): folge.append((bogen(a, i, alle, f"{NAME[a]} · volle Ausrüstung · acht echte Richtungen"), dauer))
    if a == "block": folge += [(folge[-1][0], 500)]
for teile, text in ((["waffe.langschwert", "schild.baum.stahl", "ruestung.brust.gambeson", "ruestung.fuss.stiefel"], "Ausrüstung gewechselt: Stahlschild, Gambeson, ohne Beinschienen und Handschuhe"),
                    (["waffe.langschwert"], "nur das Schwert"), ([], "ohne Ausrüstung")):
    for _ in range(2):
        for i in range(A["laufen"]["bilder"]): folge.append((bogen("laufen", i, teile, text), 1000 // A["laufen"]["rate"]))
folge[0][0].save(ziel, save_all=True, append_images=[f for f, _ in folge[1:]], duration=[d for _, d in folge], loop=0, optimize=True)
print(len(folge), "Bilder ·", round(os.path.getsize(ziel) / 1e6, 1), "MB ·", ziel)
