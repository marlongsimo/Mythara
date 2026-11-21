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
KRIEGER = {"hand_r": "waffe.langschwert", "arm_l": "schild.baum", "brust": "ruestung.brust.platte", "bein": "ruestung.bein.schiene", "hand": "ruestung.hand.leder", "fuss": "ruestung.fuss.stiefel"}
krieger = all(t in EB for t in KRIEGER.values())
voll = KRIEGER if krieger else {p: t[0] for p, t in M["plaetze"].items() if not EB[t[0]].get("wahlfrei")}                           # sonst: je Platz das erste Teil
alle = list(voll.values()); folge = []
NAME = {"ruhe": "Ruhe", "laufen": "Laufen", "angriff": "Einhandangriff", "block": "Block (Schild)", "angriff2h": "Zweihandangriff", "treffer": "Treffer", "ausweichen": "Ausweichen",
        "angriff_axt": "Axtangriff", "angriff_dolch": "Dolchstich", "tod": "Tod", "zauber": "Heilung", "segen": "Schutzsegen", "nova": "Lichtnova", "angriff_links": "Angriff mit der linken Hand", "springen": "Springen", "zunge": "Zungenangriff"}
if not any(d["platz"] == "arm_l" for d in EB.values() if d["art"] == "starr"): NAME["block"] = "Block (Parade mit der Waffe)"
def mit_waffe(a):
    """für die Angriffsbewegung einer Waffe: diese Waffe statt der Standardwaffe in die Hand"""
    w = next((e for e, d in EB.items() if d["art"] == "starr" and d.get("angriff") == a), None)
    if not w or w in alle: return alle, ""
    return [t for t in alle if EB[t]["platz"] != EB[w]["platz"]] + [w], " · " + w.split(".")[-1]
for a, wdh in (("ruhe", 1), ("laufen", 2), ("springen", 2), ("zunge", 2), ("angriff", 2), ("angriff_axt", 2), ("angriff_dolch", 2), ("zauber", 2), ("segen", 1), ("nova", 1), ("angriff_links", 2), ("block", 1), ("angriff2h", 2), ("treffer", 2), ("ausweichen", 2), ("tod", 1)):
    if a not in A: continue
    n = A[a]["bilder"]; dauer = 1000 // A[a]["rate"]; teile, zusatz = mit_waffe(a)
    for _ in range(wdh):
        for i in range(n): folge.append((bogen(a, i, teile, f"{NAME[a]}{zusatz} · {'volle Ausrüstung · ' if M['plaetze'] else ''}acht echte Richtungen"), dauer))
    if a in ("block", "tod"): folge += [(folge[-1][0], 900)]
if krieger: wechsel = [(["waffe.langschwert", "schild.baum.stahl", "ruestung.brust.gambeson", "ruestung.fuss.stiefel"], "Ausrüstung gewechselt: Stahlschild, Gambeson, ohne Beinschienen und Handschuhe"),
                       (["waffe.langschwert"], "nur das Schwert"), ([], "ohne Ausrüstung")]
else:                                                                                                # andere Figur: zweite Waffe, dann Teil für Teil ablegen
    wechsel = []; jetzt = dict(voll)
    for p_, t in M["plaetze"].items():
        if len(t) > 1: jetzt[p_] = t[1]; wechsel.append((list(jetzt.values()), f"Waffe gewechselt: {t[1].split('.')[-1]}"))
    for p_ in [p for p in ("kopf", "hals", "brust") if p in jetzt]: jetzt.pop(p_); wechsel.append((list(jetzt.values()), "abgelegt: " + p_))
    wechsel.append(([], "ohne Ausrüstung"))
if not M["plaetze"]: wechsel = []                                                                    # Tier ohne Ausrüstung: nichts zu wechseln
for teile, text in wechsel:
    for _ in range(2):
        for i in range(A["laufen"]["bilder"]): folge.append((bogen("laufen", i, teile, text), 1000 // A["laufen"]["rate"]))
folge[0][0].save(ziel, save_all=True, append_images=[f for f, _ in folge[1:]], duration=[d for _, d in folge], loop=0, optimize=True)
print(len(folge), "Bilder ·", round(os.path.getsize(ziel) / 1e6, 1), "MB ·", ziel)
