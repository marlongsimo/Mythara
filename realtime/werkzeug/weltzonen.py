#!/usr/bin/env python3
"""Mythara – Kampfgebiete der offenen Welt für die Simulation (shared/weltzonen.ts).

Jede Region der Welt ist Kampfgebiet (Einzelkampf), außer den sicheren (SICHER, z. B. die Waldmark). Je Gebiet: das Gehraster der ganzen Region aus den Weltdaten (echtzeit/welt, „geh“ je Chunk) in Rechenfeldern
(ein Weltfeld = ein Rechenfeld, 48 Bildpunkte) und die Lager der Gegner in Weltfeldern. Der Spielserver rechnet darauf eine
gemeinsame Simulation; die offene Welt zeigt Gegner, Treffer und Leben an derselben Stelle – ohne eigene Kampfszene.
Aufruf (im Ordner realtime): python3 werkzeug/weltzonen.py
"""
import json, os
HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", "..")); WELT = os.path.join(WURZEL, "echtzeit", "welt")
C = 32
welt = json.load(open(os.path.join(WELT, "welt.json")))
# Grundregel: JEDE Region der Welt ist ein Kampfgebiet mit Einzelkampf (einer gegen einen) – neue Regionen also automatisch.
# Ausnahmen nur hier:
#   SICHER     – Regionen, in denen nicht gekämpft wird (sicherer Ort)
#   BESONDERS  – Regionen mit eigenem Kartennamen, eigener Stufe, Gegnerlagern und Mehrkampf-Bereichen (Weltfelder [x0, y0, x1, y1])
SICHER = {"waldmark"}
BESONDERS = {
    # Die Lichtung im Kreuzwald: vier Dolch-Banditen, Mehrkampf (viele gegen viele). Karte/Stufe wie bisher (Buchungen laufen als „kreuzwald“).
    "waldweg": {"karte": "kreuzwald", "stufe": 3, "mehrkampf": [[6522, 6558, 6586, 6606]],
                "lager": [("bandit_dolch", 6544, 6578), ("bandit_dolch", 6556, 6575), ("bandit_dolch", 6548, 6589), ("bandit_dolch", 6561, 6586)]},
}
aus = ["/* Erzeugt von werkzeug/weltzonen.py – nicht von Hand ändern. Kampfgebiete der offenen Welt (jede Region außer den sicheren): Gehraster, Start, Lager der Gegner, Mehrkampf-Bereiche. */",
       "export interface WeltKampfGebiet { region: string; karte: string; name: string; x0: number; y0: number; b: number; h: number; stufe: number; zeilen: string[]; start: number[][]; lager: { art: string; x: number; y: number; gruppe: number }[]; mehrkampf: number[][] }",
       "export const WELTKAMPF: WeltKampfGebiet[] = ["]
for rid, eintrag in welt["regionen"].items():
    if rid in SICHER: print(f"{rid}: sicherer Ort"); continue
    z = BESONDERS.get(rid, {}); R = eintrag["region"]; ux, uy = R["ursprung"]; bw, bh = R["chunks"]; x0, y0, B, H = ux * C, uy * C, bw * C, bh * C
    raster = [["T"] * B for _ in range(H)]
    for j in range(bh):
        for i in range(bw):
            p = os.path.join(WELT, f"{ux + i}_{uy + j}.json")
            if not os.path.exists(p): continue
            for yy, zeile in enumerate(json.load(open(p))["geh"]):
                for xx, ch in enumerate(zeile): raster[j * C + yy][i * C + xx] = "." if ch == "." else "T"
    for (art, wx, wy) in z.get("lager", []): assert raster[wy - y0][wx - x0] == ".", f"Lager nicht frei: {wx},{wy}"
    lager = [{"art": art, "x": (wx - x0) / 2, "y": (wy - y0) / 2, "gruppe": n + 1} for n, (art, wx, wy) in enumerate(z.get("lager", []))]
    start = eintrag["start"][0]; karte = z.get("karte", "welt_" + rid)
    aus.append("  " + json.dumps({"region": rid, "karte": karte, "name": R.get("name", rid), "x0": x0, "y0": y0, "b": B, "h": H, "stufe": z.get("stufe", R.get("stufe", 1)),
        "zeilen": ["".join(r) for r in raster], "start": [[(start[0] - x0) / 2 - 0.5, (start[1] - y0) / 2 - 0.5]], "lager": lager,
        "mehrkampf": [[a - x0, b - y0, c - x0, d - y0] for (a, b, c, d) in z.get("mehrkampf", [])]}, ensure_ascii=False) + ",")
    print(f"{rid} → {karte}: {B}×{H}, {sum(r.count('.') for r in raster)} frei, {len(lager)} Gegner, {'Mehrkampf-Bereiche: ' + str(len(z['mehrkampf'])) if z.get('mehrkampf') else 'Einzelkampf'}")
aus.append("];")
open(os.path.join(WURZEL, "realtime", "shared", "weltzonen.ts"), "w").write("\n".join(aus) + "\n")
