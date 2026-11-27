"""Mythara Fabrik – Handy-Stufe „mobil“ der Figuren-Atlanten (#104): jede Ebene zusätzlich in halber Auflösung, die Originale bleiben unverändert.

  python3 fabrik/mobil_texturen.py [ordner=img/figuren-fabrik] [faktor=0.5] [qualitaet=80] [--liste]

Für jeden Phaser-Atlas <ebene>.webp + <ebene>.json (TexturePacker-Format, „frames“ mit frame / spriteSourceSize / sourceSize) entsteht daneben
<ebene>.mobil.webp + <ebene>.mobil.json:
  - jedes Einzelbild wird aus dem Original ausgeschnitten, mit Lanczos um den Faktor verkleinert und neu gepackt (Regale, 1 px Abstand –
    kein Übersprechen zwischen Nachbarbildern wie beim Verkleinern des ganzen Blatts),
  - alle Pixelangaben (frame, spriteSourceSize, sourceSize) sind mit dem Faktor gerechnet, gerundet; meta.scale = Faktor, meta.mobil_faktor = Faktor.
Im Spiel: den Atlas „.mobil“ laden und das Sprite zusätzlich um 1 / Faktor vergrößern (bei 0,5: setScale × 2) – Lage, Fuß und Tiefe aus <figur>.json
bleiben in voller Auflösung gültig. Die Editorbilder (Ordner editor/, ohne json) werden nicht angefasst.
Mit --liste: Tabelle vorher/nachher (KB) je Datei und Summe, als Markdown.
"""
import json, math, os, sys
from PIL import Image

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
opt = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a)
ORDNER = os.path.join(W, opt.get("ordner", "img/figuren-fabrik")); F = float(opt.get("faktor", 0.5)); Q = int(opt.get("qualitaet", 80))

def mobil(webp, js):
    D = json.load(open(js)); bild = Image.open(webp).convert("RGBA"); frames = D["frames"]
    namen = list(frames) if isinstance(frames, dict) else [f["filename"] for f in frames]
    liste = frames if isinstance(frames, dict) else {f["filename"]: f for f in frames}
    stuecke = []
    for n in namen:
        f = liste[n]; r = f["frame"]
        if f.get("rotated"): raise SystemExit(f"gedrehte Bilder werden nicht unterstützt: {js} {n}")
        s = bild.crop((r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"]))
        w, h = max(1, round(r["w"] * F)), max(1, round(r["h"] * F)); stuecke.append((n, s.resize((w, h), Image.LANCZOS)))
    breite = max(max(s.width for _, s in stuecke), math.ceil(bild.width * F))                     # Regale packen, Reihenfolge wie im Original
    x = y = zeile = 0; ort = {}
    for n, s in stuecke:
        if x + s.width > breite: x = 0; y += zeile + 1; zeile = 0
        ort[n] = (x, y); x += s.width + 1; zeile = max(zeile, s.height)
    neu = Image.new("RGBA", (breite, y + zeile), (0, 0, 0, 0)); aus = {}
    for n, s in stuecke:
        neu.paste(s, ort[n]); f = liste[n]; ss = f["spriteSourceSize"]; so = f["sourceSize"]
        aus[n] = {"frame": {"x": ort[n][0], "y": ort[n][1], "w": s.width, "h": s.height}, "rotated": False, "trimmed": f.get("trimmed", True),
                  "spriteSourceSize": {"x": round(ss["x"] * F), "y": round(ss["y"] * F), "w": s.width, "h": s.height}, "sourceSize": {"w": round(so["w"] * F), "h": round(so["h"] * F)}}
    ziel = webp[:-5] + ".mobil.webp"; neu.save(ziel, "WEBP", quality=Q, method=6)
    meta = dict(D.get("meta", {})); meta.update({"image": os.path.basename(ziel), "size": {"w": neu.width, "h": neu.height}, "scale": str(F), "mobil_faktor": F})
    json.dump({"frames": aus, "meta": meta}, open(js[:-5] + ".mobil.json", "w"), ensure_ascii=False, separators=(",", ":"))
    return os.path.getsize(webp), os.path.getsize(ziel), bild.size, neu.size

zeilen = []; vor = nach = 0
for wurzel, _, dateien in sorted(os.walk(ORDNER)):
    if os.path.basename(wurzel) == "editor": continue
    for d in sorted(dateien):
        if not d.endswith(".webp") or d.endswith(".mobil.webp"): continue
        p = os.path.join(wurzel, d); js = p[:-5] + ".json"
        if not os.path.exists(js): continue
        a, b, g0, g1 = mobil(p, js); vor += a; nach += b; zeilen.append((os.path.relpath(p, W), a, b, g0, g1))
if "--liste" in sys.argv:
    print("| Datei | vorher | mobil | Pixel vorher → mobil |\n|---|---:|---:|---|")
    for p, a, b, g0, g1 in sorted(zeilen, key=lambda z: -z[1]): print(f"| `{p}` | {a / 1024:.0f} KB | {b / 1024:.0f} KB | {g0[0]}×{g0[1]} → {g1[0]}×{g1[1]} |")
print(f"\n{len(zeilen)} Atlanten: {vor / 1048576:.1f} MB → {nach / 1048576:.1f} MB ({100 * nach / max(1, vor):.0f} %)")
