#!/usr/bin/env python3
"""Mythara – Kampfgebiete der offenen Welt für die Simulation (shared/weltzonen.ts).

Je Region mit Gegnern: das Gehraster der ganzen Region aus den Weltdaten (echtzeit/welt, „geh“ je Chunk) in Rechenfeldern
(ein Weltfeld = ein Rechenfeld, 48 Bildpunkte) und die Lager der Gegner in Weltfeldern. Der Spielserver rechnet darauf eine
gemeinsame Simulation; die offene Welt zeigt Gegner, Treffer und Leben an derselben Stelle – ohne eigene Kampfszene.
Aufruf (im Ordner realtime): python3 werkzeug/weltzonen.py
"""
import json, os
HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", "..")); WELT = os.path.join(WURZEL, "echtzeit", "welt")
C = 32
welt = json.load(open(os.path.join(WELT, "welt.json")))
# Region → Gegner und Mehrkampf-Gebiete (Weltfelder [x0, y0, x1, y1]). Sonst gilt Einzelkampf.
# Die Lichtung im Kreuzwald: vier Dolch-Banditen, Mehrkampf (viele gegen viele).
import subprocess
US = json.loads(subprocess.run(["node", "-e", "import('./werkzeug/welt/unterschlupf.mjs').then((m) => console.log(JSON.stringify({ lager: m.LAGER, mehrkampf: m.MEHRKAMPF })))"], cwd=os.path.join(WURZEL, "realtime"), capture_output=True, text=True).stdout.strip().split("\n")[-1])
ZONEN = { "unterschlupf": { "karte": "unterschlupf", "mehrkampf": US["mehrkampf"], "lager": [tuple(l) for l in US["lager"]] }, "waldweg": { "karte": "kreuzwald", "mehrkampf": [[6522, 6558, 6586, 6606]], "lager": [("bandit_dolch", 6544, 6578), ("bandit_dolch", 6556, 6575), ("bandit_dolch", 6548, 6589), ("bandit_dolch", 6561, 6586)] } }
aus = ["/* Erzeugt von werkzeug/weltzonen.py – nicht von Hand ändern. Kampfgebiete der offenen Welt: Gehraster der Region und Lager der Gegner. */"]
for rid, z in ZONEN.items():
    R = welt["regionen"][rid]["region"]; ux, uy = R["ursprung"]; bw, bh = R["chunks"]; x0, y0, B, H = ux * C, uy * C, bw * C, bh * C
    raster = [["T"] * B for _ in range(H)]
    for j in range(bh):
        for i in range(bw):
            p = os.path.join(WELT, f"{ux + i}_{uy + j}.json")
            if not os.path.exists(p): continue
            for yy, zeile in enumerate(json.load(open(p))["geh"]):
                for xx, ch in enumerate(zeile): raster[j * C + yy][i * C + xx] = "." if ch == "." else "T"
    for (art, wx, wy) in z["lager"]: assert raster[wy - y0][wx - x0] == ".", f"Lager nicht frei: {wx},{wy}"
    lager = [{"art": art, "x": (wx - x0) / 2, "y": (wy - y0) / 2, "gruppe": n + 1} for n, (art, wx, wy) in enumerate(z["lager"])]
    start = welt["regionen"][rid]["start"][0]; N = z["karte"].upper()
    aus += [f"/** {R['name']} (Region „{rid}“): {B} × {H} Rechenfelder ab Weltfeld {x0}|{y0} */",
            f"export const {N} = {{ region: {json.dumps(rid)}, x0: {x0}, y0: {y0}, b: {B}, h: {H}, stufe: {R.get('stufe', 1)} }};",
            f"export const {N}_ZEILEN: string[] = {json.dumps(['' .join(r) for r in raster])};",
            f"export const {N}_START: number[][] = {json.dumps([[(start[0] - x0) / 2 - 0.5, (start[1] - y0) / 2 - 0.5]])};",
            f"export const {N}_LAGER = {json.dumps(lager)};",
            f"/** Mehrkampf-Gebiete in Rechenfeldern des Gebiets [x0, y0, x1, y1] (sonst Einzelkampf) */",
            f"export const {N}_MEHRKAMPF: number[][] = {json.dumps([[a - x0, b - y0, c - x0, d - y0] for (a, b, c, d) in z.get('mehrkampf', [])])};"]
    print(f"{rid} → {z['karte']}: {B}×{H}, {sum(r.count('.') for r in raster)} frei, {len(lager)} Gegner")
open(os.path.join(WURZEL, "realtime", "shared", "weltzonen.ts"), "w").write("\n".join(aus) + "\n")
