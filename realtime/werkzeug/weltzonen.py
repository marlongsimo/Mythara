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
# Ausnahmen nur hier (aggro/leine/wandern: Angriffsreichweite, Verfolgungsweite, Umherstreifen der Gegner – sonst 5/14/4):
#   SICHER     – Regionen, in denen nicht gekämpft wird (sicherer Ort)
#   BESONDERS  – Regionen mit eigenem Kartennamen, eigener Stufe, Gegnerlagern und Mehrkampf-Bereichen (Weltfelder [x0, y0, x1, y1])
SICHER: set = set()  # seit Zonen Stufe 2 (25.11.2026) ist auch die Waldmark Teil der einen Kampfwelt (Einzelkampf, ohne Gegner)
# Der Unterschlupf (Welt-Pipeline, werkzeug/welt/unterschlupf.mjs): Lager und Mehrkampf-Halle kommen aus der Quelle der Region
import subprocess
US = json.loads(subprocess.run(["node", "-e", "import('./werkzeug/welt/unterschlupf.mjs').then((m) => console.log(JSON.stringify({ lager: m.LAGER, mehrkampf: m.MEHRKAMPF })))"],
                               cwd=os.path.join(WURZEL, "realtime"), capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])  # die Quelle meldet zuerst ihren Umfang
BESONDERS = {
    # Banditen-Hauptquartier unter der Hütte in der Westmark: neun Dolch-Banditen in sechs Räumen, die Halle ist Mehrkampf; Gegner bleiben in ihren Räumen
    "unterschlupf": {"karte": "unterschlupf", "stufe": 4, "aggro": 4, "leine": 10, "wandern": 2, "mehrkampf": US["mehrkampf"], "lager": [tuple(l) for l in US["lager"]]},
    # Die Banditen-Lichtung im Kreuzwald: vier Dolch-Banditen, Einzelkampf (seit 22.11.2026, vorher Mehrkampf). Karte/Stufe wie bisher (Buchungen laufen als „kreuzwald“).
    "waldweg": {"karte": "kreuzwald", "stufe": 3, "aggro": 4,
                "lager": [("bandit_dolch", 6544, 6578), ("bandit_dolch", 6556, 6575), ("bandit_dolch", 6548, 6589), ("bandit_dolch", 6561, 6586)]},
    # Die verfallene Feste im Nordwald (24.11.2026): fünf Waldgolems im Innenhof, Aggro 4 Felder (nur gegen Helden unter Level 15, config.ts), Leine 10, Streifen 2
    "nordwald": {"aggro": 4, "leine": 10, "wandern": 2,
                 "lager": [("waldgolem", 6314, 6360), ("waldgolem", 6328, 6355), ("waldgolem", 6342, 6366), ("waldgolem", 6322, 6370), ("waldgolem", 6336, 6378)]},
    # Der Moosrain im Osthof (Quest „Der stille Rain“, 23.11.2026): sieben passive Mooshocker in lockeren Gruppen nordöstlich der Windmühle, Leine 8, Streifen 2
    "osthof": {"aggro": 0, "leine": 8, "wandern": 2,
               "lager": [("mooshocker", 6576, 6418), ("mooshocker", 6578, 6410), ("mooshocker", 6583, 6414), ("mooshocker", 6585, 6406), ("mooshocker", 6589, 6417), ("mooshocker", 6580, 6403), ("mooshocker", 6566, 6408)]
               # Kuhgehege (Handwerk, 25.11.2026): zehn friedliche Kühe hinter Zaun (shared/handwerk_welt.json), Kuhhaut für die Werkbank
               + [("kuh", 6522, 6409), ("kuh", 6527, 6408), ("kuh", 6533, 6409), ("kuh", 6539, 6408), ("kuh", 6524, 6412), ("kuh", 6530, 6412), ("kuh", 6536, 6413), ("kuh", 6521, 6416), ("kuh", 6528, 6416), ("kuh", 6538, 6417)]},
}
aus = ["/* Erzeugt von werkzeug/weltzonen.py – nicht von Hand ändern. Kampfgebiete der offenen Welt (jede Region außer den sicheren): Gehraster, Start, Lager der Gegner, Mehrkampf-Bereiche. */",
       "export interface WeltKampfGebiet { region: string; karte: string; name: string; x0: number; y0: number; b: number; h: number; stufe: number; zeilen: string[]; start: number[][]; lager: { art: string; x: number; y: number; gruppe: number }[]; mehrkampf: number[][]; aggro: number; leine: number; wandern: number }",
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
        "mehrkampf": [[a - x0, b - y0, c - x0, d - y0] for (a, b, c, d) in z.get("mehrkampf", [])],
        "aggro": z.get("aggro", 5), "leine": z.get("leine", 14), "wandern": z.get("wandern", 4)}, ensure_ascii=False) + ",")
    print(f"{rid} → {karte}: {B}×{H}, {sum(r.count('.') for r in raster)} frei, {len(lager)} Gegner, {'Mehrkampf-Bereiche: ' + str(len(z['mehrkampf'])) if z.get('mehrkampf') else 'Einzelkampf'}")
aus.append("];")
aus.append("/** Alle Regionen der Welt (auch die sicheren) – der Server lässt dort die gemeinsame Welt zu (Anwesenheit, Chat) */")
aus.append("export const WELTREGIONEN: string[] = " + json.dumps(list(welt["regionen"])) + ";")
open(os.path.join(WURZEL, "realtime", "shared", "weltzonen.ts"), "w").write("\n".join(aus) + "\n")
