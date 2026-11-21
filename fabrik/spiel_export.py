"""Mythara Fabrik – eine gerenderte Figur fürs Spiel ausgeben (Format des Spielmoduls realtime/client/src/modulfigur.ts).

  python3 fabrik/spiel_export.py <export-ordner> <asset-id> <ziel-ordner> <ebene,ebene,…> <waffe,waffe,…>

export-ordner  Ergebnis von rendern.py und packen.py (Blätter, atlas/, <id>.json)
ziel-ordner    z. B. <spiel>/img/figuren-fabrik/<asset-id>
ebenen         Körper und Rüstung in Zeichenreihenfolge (koerper zuerst)
waffen         starre Teile; je Waffe werden die Ebenen .hinten und .vorn übernommen

Schreibt die Atlanten der gewählten Ebenen und <asset-id>.json mit Feld, Fußpunkt, sichtbarer Körperhöhe (für den Maßstab im Spiel),
Bewegungen, Tiefe der Waffen je Bild und der Ebenenliste.
"""
import json, os, shutil, sys
import numpy as np
from PIL import Image

ordner, kennung, ziel = sys.argv[1], sys.argv[2], sys.argv[3]; EBENEN = sys.argv[4].split(","); WAFFEN = [w for w in sys.argv[5].split(",") if w]
M = json.load(open(os.path.join(ordner, kennung + ".json"))); F = M["feld"]; os.makedirs(ziel, exist_ok=True)
# sichtbare Höhe der Figur (Sohle bis Scheitel) in Ruhe, von vorn (Süden): danach richtet das Spiel den Maßstab
al = np.zeros((F, F), np.float32)
for e in EBENEN:
    b = np.asarray(Image.open(os.path.join(ordner, f"{e}.ruhe.webp")).convert("RGBA"))[..., 3][2 * F:3 * F, 0:F].astype(np.float32); al = np.maximum(al, b)
ys = np.where(al.max(1) > 40)[0]; sichtbar = int(ys.max() - ys.min() + 1)
groesse = 0
for e in EBENEN + [w + x for w in WAFFEN for x in (".hinten", ".vorn")]:
    for endung in (".webp", ".json"): q = os.path.join(ordner, "atlas", e + endung); shutil.copyfile(q, os.path.join(ziel, e + endung)); groesse += os.path.getsize(q)
spiel = {"id": kennung, "feld": F, "fuss": M["fuss"], "sichtbar_px": sichtbar, "animationen": M["animationen"], "ebenen": EBENEN, "waffen": WAFFEN,
         "tiefe": {w: M["tiefe"][w] for w in WAFFEN}, "richtungen": M["richtungen"], "zeile": M["zeile"], "quelle": "fabrik/assets/" + kennung}
json.dump(spiel, open(os.path.join(ziel, kennung + ".json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{kennung}: {len(EBENEN)} Ebenen, {len(WAFFEN)} Waffen, Bewegungen {', '.join(M['animationen'])} · sichtbare Höhe {sichtbar} px · {groesse / 1e6:.1f} MB · {ziel}")
