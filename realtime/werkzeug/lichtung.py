#!/usr/bin/env python3
"""Mythara – die Lichtung im Kreuzwald als gemeinsame Kampfzone (shared/lichtung.ts + img/welt/lichtung.webp).

Schneidet aus den Weltdaten (echtzeit/welt: Chunks mit Bodenbild, Begehbarkeit „geh“ und Objekten) ein Rechteck um die Lichtung
und macht daraus eine Kampfkarte, wie sie die Kampfszene und die Simulation kennen:
  * Bodenbild aus den Chunk-Bildern (halbe Auflösung, die Szene zeigt es in voller Größe),
  * Raster in Rechenfeldern (ein Weltfeld = ein Rechenfeld, beide 48 Bildpunkte): „#“ der Welt wird „T“,
  * Bäume und Stämme der Welt als Deko-Bilder an derselben Stelle (Verdeckung wie auf dem Waldweg),
  * vier Dolch-Banditen auf der Lichtung.
Aufruf (im Ordner realtime): python3 werkzeug/lichtung.py
"""
import json, os
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.normpath(os.path.join(HIER, "..", ".."))
WELT = os.path.join(WURZEL, "echtzeit", "welt")
C, FPX = 32, 48                      # Felder je Chunk, Bildpunkte je Feld
X0, Y0, B, H = 6506, 6550, 86, 60    # Ausschnitt in Weltfeldern (die Lichtung mit den Enden der beiden Pfade)
RAND = 4                             # so tief muss man in den Ausschnitt hinein, bevor die Kampfzone beginnt (die Welt prüft das)
LAGER = [(6544, 6578), (6556, 6575), (6548, 6589), (6561, 6586)]   # Weltfelder der vier Banditen

welt = json.load(open(os.path.join(WELT, "welt.json")))
OBJ = welt["objekte"]
cx0, cy0, cx1, cy1 = X0 // C, Y0 // C, (X0 + B - 1) // C, (Y0 + H - 1) // C

# Bodenbild und Raster
gross = Image.new("RGB", ((cx1 - cx0 + 1) * C * FPX, (cy1 - cy0 + 1) * C * FPX), (40, 50, 30))
raster = [["T"] * B for _ in range(H)]
objekte = []
for cy in range(cy0 - 1, cy1 + 2):
    for cx in range(cx0 - 1, cx1 + 2):
        p = os.path.join(WELT, f"{cx}_{cy}.json")
        if not os.path.exists(p): continue
        d = json.load(open(p)); objekte += d.get("objekte", [])
        if not (cx0 <= cx <= cx1 and cy0 <= cy <= cy1): continue
        gross.paste(Image.open(os.path.join(WELT, d["boden"])).convert("RGB"), ((cx - cx0) * C * FPX, (cy - cy0) * C * FPX))
        for j, zeile in enumerate(d["geh"]):
            for i, ch in enumerate(zeile):
                x, y = cx * C + i - X0, cy * C + j - Y0
                if 0 <= x < B and 0 <= y < H: raster[y][x] = "." if ch == "." else "T"
ox, oy = (X0 - cx0 * C) * FPX, (Y0 - cy0 * C) * FPX
bild = gross.crop((ox, oy, ox + B * FPX, oy + H * FPX)).resize((B * FPX // 2, H * FPX // 2), Image.LANCZOS)
bild.save(os.path.join(WURZEL, "img", "welt", "lichtung.webp"), quality=86)

# Bäume und Stämme: was im Ausschnitt steht oder mit der Krone hineinragt
deko, bilder = [], {}
for o in objekte:
    D = OBJ.get(o["objekt"]); x, y = o["x"], o["y"]
    if not D or not D["bild"].startswith("img/welt/"): continue
    if not (X0 - 4 <= x <= X0 + B + 4 and Y0 - 1 <= y <= Y0 + H + 8): continue
    name = D["bild"][len("img/welt/"):-len(".webp")]
    bilder[name] = {"fuss": D["anker"], "w": D["groesse"][0], "h": D["groesse"][1]}
    deko.append({"b": name, "x": round((x - X0) / 2, 3), "y": round((y - Y0) / 2, 3), "s": round(o.get("s", 1) * D.get("massstab", 1), 3), **({"f": True} if o.get("spiegeln") else {})})
deko.sort(key=lambda d: d["y"])

def frei(wx, wy):
    x, y = wx - X0, wy - Y0
    return 0 <= x < B and 0 <= y < H and raster[y][x] == "."
for (wx, wy) in LAGER: assert frei(wx, wy), f"Lager nicht frei: {wx},{wy}"
lager = [{"art": "bandit_dolch", "x": (wx - X0) / 2, "y": (wy - Y0) / 2, "gruppe": n + 1} for n, (wx, wy) in enumerate(LAGER)]
mitte = [(LAGER[0][0] - X0) / 2, (LAGER[0][1] - Y0) / 2]

ts = f"""/* Erzeugt von werkzeug/lichtung.py – nicht von Hand ändern. Die Lichtung im Kreuzwald als gemeinsame Kampfzone. */
/** Ausschnitt der Welt in Weltfeldern (= Rechenfeldern): links oben, Breite, Höhe; RAND: so weit innen beginnt die Kampfzone */
export const LICHTUNG_FELD = {{ x0: {X0}, y0: {Y0}, b: {B}, h: {H}, rand: {RAND} }};
/** Raster in Rechenfeldern ({B} × {H}): „.“ frei, „T“ Baum */
export const LICHTUNG_ZEILEN: string[] = {json.dumps(["".join(z) for z in raster])};
export const LICHTUNG_START: number[][] = {json.dumps([mitte])};
export const LICHTUNG_LAGER = {json.dumps(lager)};
export const LICHTUNG_BILDER: Record<string, {{ fuss: number[]; w: number; h: number }}> = {json.dumps(bilder)};
export const LICHTUNG_DEKO: {{ b: string; x: number; y: number; s: number; f?: boolean }}[] = {json.dumps(deko)};
"""
open(os.path.join(WURZEL, "realtime", "shared", "lichtung.ts"), "w").write(ts)
frei_n = sum(z.count(".") for z in raster)
print(f"Lichtung: {B}×{H} Felder, {frei_n} frei, {len(deko)} Bäume/Stämme ({len(bilder)} Bilder), Bild {bild.size}")
