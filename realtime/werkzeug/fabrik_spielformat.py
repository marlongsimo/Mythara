#!/usr/bin/env python3
"""Mythara – eine fertig gerenderte Figur der Figuren-Fabrik ins Spielformat bringen (für client/src/modulfigur.ts).

  python3 werkzeug/fabrik_spielformat.py <export-ordner> <ziel-id> [--angriff stich] [--umbenennen gehen=laufen] [--standbild pfad.webp]

Beispiel (im Ordner realtime):
  python3 werkzeug/fabrik_spielformat.py ../fabrik/assets/gegner.bandit/v003/export gegner.bandit.v003 --angriff stich --umbenennen gehen=laufen --standbild ../img/echtzeit/bandit.webp

Anders als fabrik/variante.py übernimmt es ALLE Waffen der Figur (etwa Dolch und Schild) und kann Bewegungen umbenennen,
damit sie zu den Namen passen, die das Spiel erwartet (ruhe, laufen, block, schild_laufen; der Angriff steht unter „angriff“).
Schreibt nach img/figuren-fabrik/<ziel-id>/:
  <ebene>.webp/.json   Atlanten (Einzelbilder „Bewegung/Richtung/Bild“, umbenannte Bewegungen angepasst)
  <ziel-id>.json       Feld, Fußpunkt, sichtbare Höhe, Bewegungen, Tiefe der Waffen, Ebenen, Waffen, Angriff
Optional ein Standbild (Ruhe, von vorn, zugeschnitten) – das Spiel zeigt es, solange die Figur lädt.
"""
import argparse, json, os, shutil
import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", ".."))
ap = argparse.ArgumentParser(); ap.add_argument("export"); ap.add_argument("ziel_id"); ap.add_argument("--angriff", default="angriff")
ap.add_argument("--umbenennen", action="append", default=[]); ap.add_argument("--standbild")
a = ap.parse_args()
quelle = os.path.abspath(a.export); kennung = next(f[:-5] for f in os.listdir(quelle) if f.endswith(".json") and f != "bericht.json")
M = json.load(open(os.path.join(quelle, kennung + ".json"))); F = M["feld"]; EB = M["ebenen"]
umb = dict(x.split("=", 1) for x in a.umbenennen); neu = lambda n: umb.get(n, n)
anims = {neu(k): v for k, v in M["animationen"].items()}
if a.angriff not in anims: raise SystemExit(f"Angriff „{a.angriff}“ fehlt – vorhanden: {sorted(anims)}")
if "ruhe" not in anims: raise SystemExit("Die Figur braucht eine Bewegung „ruhe“")
waffen = [e for e, d in EB.items() if d["art"] == "starr"]
ebenen = ["koerper"] + [e for e, d in EB.items() if d["art"] not in ("koerper", "starr")]
ziel = os.path.join(WURZEL, "img", "figuren-fabrik", a.ziel_id); os.makedirs(ziel, exist_ok=True)

def atlas(e):
    """Atlas übernehmen, umbenannte Bewegungen in den Bildnamen anpassen"""
    j = json.load(open(os.path.join(quelle, "atlas", e + ".json"))); fr = j["frames"]
    umbenannt = lambda k: "/".join([neu(k.split("/", 1)[0])] + k.split("/")[1:])
    j["frames"] = {umbenannt(k): v for k, v in fr.items()} if isinstance(fr, dict) else [dict(f, filename=umbenannt(f["filename"])) for f in fr]
    json.dump(j, open(os.path.join(ziel, e + ".json"), "w"), separators=(",", ":"))
    shutil.copyfile(os.path.join(quelle, "atlas", e + ".webp"), os.path.join(ziel, e + ".webp"))
for e in ebenen + [w + s for w in waffen for s in (".hinten", ".vorn")]: atlas(e)

def figur(anim, r, i):
    """so zusammengesetzt wie im Spiel: Waffen hinten, Körper, Kleidung, Waffen vorn (aus den Einzelblättern der Fabrik)"""
    b = Image.new("RGBA", (F, F), (0, 0, 0, 0))
    for e in [w + ".hinten" for w in waffen] + ebenen + [w + ".vorn" for w in waffen]:
        p = os.path.join(quelle, f"{e}.{anim}.webp")
        if os.path.exists(p): b.alpha_composite(Image.open(p).convert("RGBA").crop((i * F, r * F, (i + 1) * F, (r + 1) * F)))
    return b
ruhe = next(k for k, v in M["animationen"].items() if neu(k) == "ruhe")
vorn = figur(ruhe, 2, 0); al = np.asarray(vorn)[..., 3]; ys = np.where(al.max(1) > 40)[0]; sichtbar = int(ys.max() - ys.min() + 1)
meta = {"id": a.ziel_id, "angriff": a.angriff, "feld": F, "fuss": M["fuss"], "sichtbar_px": sichtbar, "animationen": anims, "ebenen": ebenen, "waffen": waffen,
        "tiefe": {w: {neu(k): v for k, v in M["tiefe"].get(w, {}).items()} for w in waffen}, "richtungen": M["richtungen"], "zeile": M["zeile"],
        "quelle": os.path.relpath(quelle, WURZEL)}
json.dump(meta, open(os.path.join(ziel, a.ziel_id + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
if a.standbild:
    # im Rahmen der bisherigen Standbilder: Quadrat 176 px, Fuß bei 94 %, Körper 84 % hoch (MonsterDef fuss/laufMass)
    G = 176; box = vorn.getbbox(); s = vorn.crop(box); k = 0.84 * G / s.size[1]; s = s.resize((max(1, round(s.size[0] * k)), round(s.size[1] * k)), Image.LANCZOS)
    bild = Image.new("RGBA", (G, G), (0, 0, 0, 0)); bild.alpha_composite(s, (round(G / 2 - s.size[0] / 2), round(0.94 * G - s.size[1]))); bild.save(a.standbild, quality=90)
    print(f"Standbild {a.standbild}: {G}×{G}")
print(f"{a.ziel_id}: Ebenen {ebenen}, Waffen {waffen}, Bewegungen {sorted(anims)}, Angriff „{a.angriff}“, sichtbar {sichtbar} px → {os.path.relpath(ziel, WURZEL)}")
