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
    if (e, a) not in _b:
        p = os.path.join(ordner, f"{e}.{a}.webp"); _b[(e, a)] = Image.open(p).convert("RGBA") if os.path.exists(p) else Image.new("RGBA", (F * A[a]["bilder"], F * 8), (0, 0, 0, 0))   # Waffe ohne diese Bewegung: leer
    return _b[(e, a)]
def figur(a, r, i, teile):
    ohne = set(A[a].get("ohne", [])); w = sorted([t for t in teile if EB[t]["art"] == "starr" and EB[t]["platz"] not in ohne], key=lambda t: -M["tiefe"][t][a][r][i])
    bild = Image.new("RGBA", (F, F), (0, 0, 0, 0))
    hl = sorted([t for t in teile if EB[t]["art"] == "huelle"], key=lambda t: list(EB).index(t)); um = [t for t in hl if M.get("zeichenfolge") and EB[t].get("umhang")]; rest = [t for t in hl if t not in um]
    hl = rest + um if r >= 5 else um + rest                                                       # Umhang: von vorn hinter, von hinten vor der übrigen Rüstung
    for e in [t + ".hinten" for t in w] + ["koerper"] + hl + [t + ".vorn" for t in w]: bild.alpha_composite(blatt(e, a).crop((i * F, r * F, (i + 1) * F, (r + 1) * F)))
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
        "angriff_axt": "Axtangriff", "angriff_dolch": "Dolchstich", "tod": "Tod", "zauber": "Heilung", "segen": "Schutzsegen", "nova": "Lichtnova", "angriff_links": "Angriff mit der linken Hand", "springen": "Springen", "zunge": "Zungenangriff", "zielen": "Zielen", "schiessen": "Schießen", "nachladen": "Nachladen",
        "stabhaltung": "Stabhaltung", "gehen": "Gehen", "stich": "Stich rechts", "hieb2h": "Zweihandhieb", "stich2h": "Zweihandstich (Speer)", "zauber_stab": "Zauberspruch mit erhobenem Stab", "bogen": "Bogenschuss", "armbrust1h": "Armbrust einhändig", "dolchwurf": "Dolchwurf", "geschoss": "Magisches Geschoss", "frosthauch": "Frosthauch", "donnerwelle": "Donnerwelle", "glutsphaere": "Glutsphäre", "stabschlag": "Stabschlag"}
if not any(d["platz"] == "arm_l" for d in EB.values() if d["art"] == "starr"): NAME["block"] = "Block (Parade mit der Waffe)"
def in_bewegung(e, a): return not EB[e].get("bewegungen") or a in EB[e]["bewegungen"]
def mit_waffe(a):
    """für die Angriffsbewegung einer Waffe: diese Waffe statt der Standardwaffe in die Hand"""
    if any(d.get("bewegungen") for d in EB.values()):                                                # wechselbare Waffen: je Platz das erste Teil, das diese Bewegung hat
        teile = []
        for p_, ts in M["plaetze"].items():
            t = next((e for e in ts if not EB[e].get("variante_von") and not EB[e].get("wahlfrei") and in_bewegung(e, a)), None)
            if t: teile.append(t)
        andere = [t for t in teile if t not in alle]; return teile, (" · " + ", ".join(t.split(".")[-1] for t in andere)) if andere else ""
    w = next((e for e, d in EB.items() if d["art"] == "starr" and d.get("angriff") == a), None)
    if not w or w in alle: return alle, ""
    return [t for t in alle if EB[t]["platz"] != EB[w]["platz"]] + [w], " · " + w.split(".")[-1]
for a, wdh in (("ruhe", 1), ("laufen", 2), ("springen", 2), ("zunge", 2), ("zielen", 1), ("schiessen", 2), ("nachladen", 1), ("stabhaltung", 1), ("geschoss", 2), ("frosthauch", 1), ("donnerwelle", 1), ("glutsphaere", 1), ("stabschlag", 1), ("angriff", 2), ("angriff_axt", 2), ("angriff_dolch", 2), ("zauber", 2), ("segen", 1), ("nova", 1), ("angriff_links", 2), ("block", 1), ("angriff2h", 2), ("treffer", 2), ("ausweichen", 2), ("gehen", 1), ("stich", 2), ("hieb2h", 2), ("stich2h", 2), ("zauber_stab", 1), ("bogen", 2), ("armbrust1h", 2), ("dolchwurf", 2), ("tod", 1)):
    if a not in A: continue
    n = A[a]["bilder"]; dauer = 1000 // A[a]["rate"]; teile, zusatz = mit_waffe(a)
    for _ in range(wdh):
        for i in range(n): folge.append((bogen(a, i, teile, f"{NAME[a]}{zusatz} · {'volle Ausrüstung · ' if M['plaetze'] else ''}acht echte Richtungen"), dauer))
    if a in ("block", "tod", "zielen"): folge += [(folge[-1][0], 900)]
if krieger: wechsel = [(["waffe.langschwert", "schild.baum.stahl", "ruestung.brust.gambeson", "ruestung.fuss.stiefel"], "Ausrüstung gewechselt: Stahlschild, Gambeson, ohne Beinschienen und Handschuhe"),
                       (["waffe.langschwert"], "nur das Schwert"), ([], "ohne Ausrüstung")]
else:                                                                                                # andere Figur: zweite Waffe, dann Teil für Teil ablegen
    wechsel = []; jetzt = dict(voll)
    for p_, t in M["plaetze"].items():
        t = [e for e in t if not EB[e].get("variante_von")]                                              # Farbvarianten zeigt der Fraktionsteil unten
        if len(t) > 1: jetzt[p_] = t[1]; wechsel.append((list(jetzt.values()), f"Waffe gewechselt: {t[1].split('.')[-1]}"))
    for p_ in [p for p in ("kopf", "hals", "brust") if p in jetzt]: jetzt.pop(p_); wechsel.append((list(jetzt.values()), "abgelegt: " + p_))
    wechsel.append(([], "ohne Ausrüstung"))
if not M["plaetze"]: wechsel = []                                                                    # Tier ohne Ausrüstung: nichts zu wechseln
fraktion = sorted({e.split(".")[-1] for e, d in EB.items() if d.get("variante_von")}, key=lambda n: [e for e in EB if e.endswith("." + n)][0] and list(EB).index([e for e in EB if e.endswith("." + n)][0]))
if fraktion:                                                                                         # Farbvarianten für Fraktionen: jede Farbe einmal mit voller Ausrüstung
    for n in ["Standard"] + fraktion:
        teile = [next((e for e, d in EB.items() if d.get("variante_von") == t and e.endswith("." + n)), t) for t in alle]
        for i in range(A["ruhe"]["bilder"]): folge.append((bogen("ruhe", i, teile, f"Farbvariante: {n}"), 160))
LAUF = "laufen" if "laufen" in A else ("gehen" if "gehen" in A else "ruhe")                         # Figuren ohne Rennen (z. B. Bandit): Wechsel im Gehen zeigen
for teile, text in wechsel:
    for _ in range(2):
        for i in range(A[LAUF]["bilder"]): folge.append((bogen(LAUF, i, teile, text), 1000 // A[LAUF]["rate"]))
folge[0][0].save(ziel, save_all=True, append_images=[f for f, _ in folge[1:]], duration=[d for _, d in folge], loop=0, optimize=True)
print(len(folge), "Bilder ·", round(os.path.getsize(ziel) / 1e6, 1), "MB ·", ziel)
