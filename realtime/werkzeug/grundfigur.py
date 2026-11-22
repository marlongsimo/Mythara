#!/usr/bin/env python3
"""Mythara – Grundmann und Grundfrau der Figuren-Fabrik für den eigenen Helden aufbereiten (Heldeneditor und Spiel).

  python3 werkzeug/grundfigur.py            (im Ordner realtime; liest fabrik/assets/basis.mann|basis.frau/v002/export)

Schreibt nach img/figuren-fabrik/held.mann/ und held.frau/:
  <ebene>.webp/.json   Atlanten im Spielformat: Körper, Haut, alle Frisuren und Bärte, die drei Startwaffen (Schwert + Schild, Bogen, Stab)
  haut.webp/.json      die Hautpixel des Körpers als eigene Ebene (gleiche Bildaufteilung wie der Körper) – das Spiel färbt sie in der gewählten Hautfarbe
  held.<g>.json        Angaben für client/src/modulfigur.ts (Feld, Fußpunkt, sichtbare Höhe, Bewegungen, Ebenen, Waffen, Tiefe) und für die Färbung
                       (Bezugshelligkeit von Haar und Haut: färben heißt Helligkeit × Zielfarbe / Bezugshelligkeit, siehe shared/aussehen.ts)
  editor/<ebene>.webp  kleine Streifen für den Heldeneditor: Ruhe, erstes Bild, 8 Richtungen nebeneinander, gemeinsamer Ausschnitt
Die Haut wird nach Farbe erkannt (deutlich röter als das Hemd, gesättigt, hell) und nur oberhalb der Hüfte (Hose und Stiefel sind nie Haut);
kleine Sprenkel werden entfernt. Die Bilder der Fabrik bleiben unverändert.
"""
import json, os, shutil
import numpy as np
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", ".."))
WAFFEN = ["waffe.schwert.ritter", "schild.rund", "waffe.bogen.jagd", "waffe.stab.hirte"]  # die Startwaffen (Fabrik: neue Standardwaffen der Klassen)

def hautmaske(px, liegend=False):
    """px: RGBA-Bild (H×W×4, uint8) einer einzelnen Figur. Liefert die Maske der Hautpixel."""
    a = px.astype(float) / 255; r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); s = (mx - mn) / np.maximum(mx, 1e-6)
    m = (al > 0.5) & ((r - g) > 0.15) & ((r - b) > 0.2) & (s > 0.36) & (mx > 0.18)   # Spielbilder (gemessen): Hemd ≈ 0,28 Sättigung und Rot−Grün ≈ 0,13, Gesicht ≈ 0,44 und 0,25
    if not liegend:
        ys = np.where(al.max(1) > 0.5)[0]
        if len(ys): oben, unten = ys.min(), ys.max(); m &= (np.arange(px.shape[0])[:, None] < oben + 0.6 * (unten - oben))
    # Sprenkel entfernen: Öffnen (erst schrumpfen, dann wachsen), danach wieder auf die ursprünglichen Hautpixel begrenzen
    bild = Image.fromarray((m * 255).astype(np.uint8)); bild = bild.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(5))
    return (np.asarray(bild) > 127) & m

def helligkeit(px, maske, anteil=70):
    a = px[..., :3].astype(float)[maske]; return float(np.percentile(0.299 * a[:, 0] + 0.587 * a[:, 1] + 0.114 * a[:, 2], anteil)) if len(a) else 128.0

def figur(geschlecht):
    quelle = os.path.join(WURZEL, "fabrik", "assets", f"basis.{geschlecht}", "v002", "export"); kennung = f"basis.{geschlecht}"
    M = json.load(open(os.path.join(quelle, kennung + ".json"))); F = M["feld"]; EB = M["ebenen"]
    ziel_id = f"held.{geschlecht}"; ziel = os.path.join(WURZEL, "img", "figuren-fabrik", ziel_id); os.makedirs(os.path.join(ziel, "editor"), exist_ok=True)
    haare = [e for e in EB if e.startswith("kopf.haar.")]; baerte = [e for e in EB if e.startswith("kopf.bart.")]
    waffen = [w for w in WAFFEN if w in EB]
    huellen = haare + baerte
    def atlas_kopieren(e):
        for endung in (".webp", ".json"): shutil.copyfile(os.path.join(quelle, "atlas", e + endung), os.path.join(ziel, e + endung))
    for e in ["koerper"] + huellen + [w + s for w in waffen for s in (".hinten", ".vorn")]: atlas_kopieren(e)
    # Haut-Ebene aus dem Körper-Atlas: je Einzelbild die Hautpixel herausziehen
    kj = json.load(open(os.path.join(quelle, "atlas", "koerper.json"))); katlas = np.asarray(Image.open(os.path.join(quelle, "atlas", "koerper.webp")).convert("RGBA"))
    haut = np.zeros_like(katlas)
    for name, f in kj["frames"].items():
        x, y, w, h = f["frame"]["x"], f["frame"]["y"], f["frame"]["w"], f["frame"]["h"]
        if f.get("rotated"): w, h = h, w
        stueck = katlas[y:y + h, x:x + w]; m = hautmaske(stueck, liegend=name.startswith("tod/"))
        haut[y:y + h, x:x + w][m] = stueck[m]
    Image.fromarray(haut).save(os.path.join(ziel, "haut.webp"), lossless=True, quality=100, method=4)
    hj = dict(kj); hj["meta"] = dict(kj["meta"], image="haut.webp"); json.dump(hj, open(os.path.join(ziel, "haut.json"), "w"), separators=(",", ":"))

    # Einzelbild „Ruhe, Richtung r, Bild 0“ einer Ebene aus den Blättern der Fabrik
    def blatt(e, anim="ruhe", r=2, i=0):
        p = os.path.join(quelle, f"{e}.{anim}.webp")
        return np.asarray(Image.open(p).convert("RGBA").crop((i * F, r * F, (i + 1) * F, (r + 1) * F))) if os.path.exists(p) else np.zeros((F, F, 4), np.uint8)
    # sichtbare Höhe (Sohle bis Scheitel) in Ruhe von vorn, mit Frisur – danach richtet das Spiel den Maßstab
    vorn = blatt("koerper").copy(); al = vorn[..., 3]; ys = np.where(al.max(1) > 40)[0]; sichtbar = int(ys.max() - ys.min() + 1)
    # Bezugshelligkeit von Haut und Haar (für das Färben)
    hautref = helligkeit(vorn, hautmaske(vorn), 90); haarref = float(np.median([helligkeit(blatt(e), blatt(e)[..., 3] > 200) for e in haare])) if haare else 128.0
    bartref = float(np.median([helligkeit(blatt(e), blatt(e)[..., 3] > 200) for e in baerte])) if baerte else 64.0
    meta = {"id": ziel_id, "angriff": "stich", "feld": F, "fuss": M["fuss"], "sichtbar_px": sichtbar, "animationen": M["animationen"],
            "ebenen": ["koerper", "haut"] + huellen, "waffen": waffen, "tiefe": {w: M["tiefe"].get(w, {}) for w in waffen},
            "richtungen": M["richtungen"], "zeile": M["zeile"], "frisuren": [e.split(".")[-1] for e in haare], "baerte": [e.split(".")[-1] for e in baerte],
            "bezug": {"haut": round(hautref, 1), "haar": round(haarref, 1), "bart": round(bartref, 1)}, "quelle": os.path.relpath(quelle, WURZEL)}
    json.dump(meta, open(os.path.join(ziel, ziel_id + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))

    # Editor-Streifen: gemeinsamer Ausschnitt über alle Ebenen und Richtungen, damit sie deckungsgleich übereinanderliegen
    ebenen_ed = {"koerper": "koerper", **{e: e for e in huellen}, **{w + s: w + s for w in waffen for s in (".hinten", ".vorn")}}
    bilder = {e: [blatt(e, r=r) for r in range(8)] for e in ebenen_ed}
    bilder["haut"] = [np.where(hautmaske(b)[..., None], b, 0).astype(np.uint8) for b in bilder["koerper"]]
    box = [F, F, 0, 0]
    for liste in bilder.values():
        for b in liste:
            yy, xx = np.where(b[..., 3] > 8)
            if len(yy): box = [min(box[0], xx.min()), min(box[1], yy.min()), max(box[2], xx.max() + 1), max(box[3], yy.max() + 1)]
    x0, y0, x1, y1 = (int(v) for v in (box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2)); w, h = x1 - x0, y1 - y0
    for e, liste in bilder.items():
        streifen = Image.new("RGBA", (w * 8, h), (0, 0, 0, 0))
        for r, b in enumerate(liste): streifen.paste(Image.fromarray(b).crop((x0, y0, x1, y1)), (r * w, 0))
        streifen.save(os.path.join(ziel, "editor", e + ".webp"), lossless=True, quality=100, method=4)
    # Kopfbereich im Streifen (für die Nahansicht): oberer Teil der Figur von vorn
    kb = np.where(bilder["koerper"][2][..., 3] > 40); kopf_oben = int(kb[0].min()) - y0; koerper_h = int(kb[0].max() - kb[0].min())
    ed = {"breite": w, "hoehe": h, "kopf": {"y": max(0, kopf_oben - int(koerper_h * 0.06)), "h": int(koerper_h * 0.27)}, "ebenen": sorted(bilder)}
    json.dump(ed, open(os.path.join(ziel, "editor", "editor.json"), "w"), separators=(",", ":"))
    groesse = sum(os.path.getsize(os.path.join(ziel, f)) for f in os.listdir(ziel) if os.path.isfile(os.path.join(ziel, f))) / 1e6
    print(f"{ziel_id}: {len(haare)} Frisuren, {len(baerte)} Bärte, Waffen {waffen}, sichtbar {sichtbar} px, Bezug {meta['bezug']}, Spiel {groesse:.1f} MB, Editor {w}×{h} je Richtung")

for g in ("mann", "frau"): figur(g)
