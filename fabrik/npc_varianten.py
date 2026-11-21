"""Mythara Fabrik – Varianten einer NPC-Figur: Farben und wahlfreie Teile, ohne neu zu rendern.

  python3 fabrik/npc_varianten.py <export-ordner> <asset-id> <rollen.json> <ziel-ordner>

rollen.json:  { "faerben": "<ebene, die umgefärbt wird>", "grund": [<ebenen, die jede Variante trägt>],
                "rollen": [ { "name": "…", "titel": "…", "farbe": "#rrggbb" | null, "dazu": [<wahlfreie Ebenen oder starre Teile>] }, … ] }

Schreibt in den Zielordner (Format des Spielmoduls):
  <ebene>.webp/.json                alle gebrauchten Ebenen einmal
  <faerben>.<name>.webp/.json       die umgefärbte Ebene je Rolle (Helligkeitsmuster bleibt, nur der Farbton wechselt)
  <asset-id>.json                   Angaben der Figur (Feld, Fußpunkt, sichtbare Höhe, Bewegungen, Tiefe)
  varianten.json                    je Rolle: Ebenen in Zeichenreihenfolge, starre Teile, Atlas der umgefärbten Ebene
  uebersicht.png, uebersicht.webp   alle Rollen nebeneinander (stehend von vorn; laufend in wechselnden Richtungen)
"""
import json, os, shutil, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

try: SCHRIFT = ImageFont.truetype("DejaVuSans.ttf", 13)                                            # Schrift mit Umlauten
except OSError: SCHRIFT = ImageFont.load_default(13)
ordner, kennung, liste, ziel = sys.argv[1:5]; R = json.load(open(liste)); M = json.load(open(os.path.join(ordner, kennung + ".json"))); F = M["feld"]; EB = M["ebenen"]; A = M["animationen"]
os.makedirs(ziel, exist_ok=True); FAERBEN = R["faerben"]

def faerben(bild, farbe):
    """Farbton ersetzen, Helligkeitsmuster behalten: neue Farbe × (Helligkeit / mittlere Helligkeit der Ebene)"""
    a = np.asarray(bild.convert("RGBA")).astype(np.float32); al = a[..., 3] > 8
    hell = a[..., :3] @ np.array([0.299, 0.587, 0.114], np.float32); mitte = float(np.median(hell[al])) or 1.0
    ziel_ = np.array([int(farbe[i:i + 2], 16) for i in (1, 3, 5)], np.float32); neu = np.clip(ziel_[None, None] * (hell / mitte)[..., None] ** 0.9, 0, 255)
    a[..., :3] = np.where(al[..., None], neu, a[..., :3]); return Image.fromarray(a.astype(np.uint8), "RGBA")

def kopie(e):
    for endung in (".webp", ".json"): shutil.copyfile(os.path.join(ordner, "atlas", e + endung), os.path.join(ziel, e + endung))
gebraucht = set(R["grund"]) | {d for r in R["rollen"] for d in r.get("dazu", [])}
for e in gebraucht:
    if EB.get(e, {}).get("art") == "starr": kopie(e + ".hinten"); kopie(e + ".vorn")
    else: kopie(e)
if "koerper" not in gebraucht: kopie("koerper")
varianten = []; quelle = Image.open(os.path.join(ordner, "atlas", FAERBEN + ".webp"))
for r in R["rollen"]:
    lagen = ["koerper"] + [e for e in R["grund"] if e != "koerper"] + [d for d in r.get("dazu", []) if EB[d]["art"] == "huelle"]   # wahlfreie Lagen zuletzt: sie liegen oben
    starr = [d for d in r.get("dazu", []) if EB[d]["art"] == "starr"]; atlas = FAERBEN
    if r.get("farbe"):
        atlas = f"{FAERBEN}.{r['name']}"; faerben(quelle, r["farbe"]).save(os.path.join(ziel, atlas + ".webp"), lossless=True, method=4)
        j = json.load(open(os.path.join(ordner, "atlas", FAERBEN + ".json"))); j["meta"]["image"] = atlas + ".webp"; json.dump(j, open(os.path.join(ziel, atlas + ".json"), "w"))
    varianten.append({"name": r["name"], "titel": r.get("titel", r["name"]), "farbe": r.get("farbe"), "ebenen": lagen, "waffen": starr, "atlas": {FAERBEN: atlas}})

# Angaben der Figur und sichtbare Höhe (stehend von vorn, mit der Grundkleidung)
def blatt(e, a, farbe=None):
    b = Image.open(os.path.join(ordner, f"{e}.{a}.webp")).convert("RGBA")
    return faerben(b, farbe) if farbe and e == FAERBEN else b
_c = {}
def zelle(e, a, r, i, farbe=None):
    k = (e, a, farbe)
    if k not in _c: _c[k] = blatt(e, a, farbe)
    return _c[k].crop((i * F, r * F, (i + 1) * F, (r + 1) * F))
def figur(v, a, r, i):
    bild = Image.new("RGBA", (F, F), (0, 0, 0, 0)); w = v["waffen"]
    for e in [x + ".hinten" for x in w] + v["ebenen"] + [x + ".vorn" for x in w]: bild.alpha_composite(zelle(e, a, r, i, v["farbe"]))
    return bild
al = np.asarray(figur(varianten[0], "ruhe", 2, 0))[..., 3]; ys = np.where(al.max(1) > 40)[0]
alle_starr = sorted({w for v in varianten for w in v["waffen"]})
meta = {"id": kennung, "feld": F, "fuss": M["fuss"], "sichtbar_px": int(ys.max() - ys.min() + 1), "animationen": A, "tiefe": {w: M["tiefe"][w] for w in alle_starr}, "richtungen": M["richtungen"], "zeile": M["zeile"],
        "ebenen": varianten[0]["ebenen"], "waffen": varianten[0]["waffen"], "quelle": os.path.relpath(ordner)}
json.dump(meta, open(os.path.join(ziel, kennung + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
json.dump({"figur": kennung, "umgefaerbt": FAERBEN, "varianten": varianten}, open(os.path.join(ziel, "varianten.json"), "w"), ensure_ascii=False, indent=1)

# Übersicht: stehend von vorn, mit Namen
OB, UN = int(F * 0.05), F; n = len(varianten); sp = 5; ze = -(-n // sp); B = F; H = UN - OB + 24
k = Image.new("RGBA", (sp * B, ze * H), (40, 34, 48, 255)); d = ImageDraw.Draw(k)
for j, v in enumerate(varianten): x, y = j % sp * B, j // sp * H; k.alpha_composite(figur(v, "ruhe", 2, 0).crop((0, OB, F, UN)), (x, y)); d.text((x + 8, y + H - 20), v["titel"], fill=(236, 228, 212), font=SCHRIFT)
k.convert("RGB").save(os.path.join(ziel, "uebersicht.png"))
# Übersicht bewegt: alle laufen, nach jeder Runde dreht sich die Blickrichtung (S, SO, O, NO, N, NW, W, SW)
folge = []
for r in (2, 1, 0, 7, 6, 5, 4, 3):
    for i in range(A["laufen"]["bilder"]):
        k = Image.new("RGBA", (sp * B, ze * H + 26), (40, 34, 48, 255)); d = ImageDraw.Draw(k); d.text((8, 6), f"{kennung} · {n} Varianten · Laufen · Richtung {M['richtungen'][r].upper()}", fill=(236, 228, 212), font=SCHRIFT)
        for j, v in enumerate(varianten): x, y = j % sp * B, 26 + j // sp * H; k.alpha_composite(figur(v, "laufen", r, i).crop((0, OB, F, UN)), (x, y)); d.text((x + 8, y + H - 20), v["titel"], fill=(236, 228, 212), font=SCHRIFT)
        folge.append(k.convert("RGB"))
folge[0].save(os.path.join(ziel, "uebersicht.webp"), save_all=True, append_images=folge[1:], duration=1000 // A["laufen"]["rate"], loop=0, quality=88, method=4)   # animiertes WebP: volle Farbe (ein GIF verliert bei zehn Westenfarben die Töne)
groesse = sum(os.path.getsize(os.path.join(ziel, f)) for f in os.listdir(ziel)) / 1e6
print(f"{kennung}: {n} Varianten ({', '.join(v['name'] for v in varianten)}) · zusammen {groesse:.1f} MB · {ziel}")
