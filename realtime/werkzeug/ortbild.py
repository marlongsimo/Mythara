"""Mythara Echtzeit – ein gemaltes Ortsbild begehbar machen.

  python3 -I werkzeug/ortbild.py weidenhain [vorschau.png]

Aus den Angaben unten (alles in Bildpunkten der Vorlage) entstehen:
  img/echtzeit/<ort>.webp     das Bild fürs Spiel
  client/src/<ort>.json       Raster, wo man laufen kann, die Stellen, und was vor dem Helden steht
Die Vorschau zeigt die begehbare Fläche (grün), Hindernisse (rot), Verdeckendes (blau) und die Stellen (gelb) über dem Bild.
"""
import json, os, sys
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", "..")

ORTE = {
    "weidenhain": {
        "bild": "weidenhain-nacht.webp", "breit": 1672, "mass": 1.6, "gross": 108,  # breit: in diesem Maß sind die Angaben unten gemessen; die Vorlage darf größer sein
        # begehbare Flächen (Vielecke); wo sie sich überlappen, hängen sie zusammen
        "flaechen": [
            # der Dorfplatz
            [(455, 292), (575, 272), (605, 318), (700, 338), (790, 305), (850, 340), (872, 405), (950, 428), (1035, 405), (1085, 440), (1100, 520), (1160, 535), (1195, 528), (1085, 588),
             (975, 614), (750, 714), (555, 808), (445, 866), (350, 842), (395, 805), (545, 725), (545, 640), (515, 480), (508, 350)],
            # der Steg über das Wehr
            [(1070, 578), (1098, 566), (1378, 690), (1358, 716)],
            # der Weg am anderen Ufer
            [(1350, 705), (1385, 650), (1500, 560), (1585, 445), (1640, 430), (1625, 520), (1520, 630), (1445, 715), (1630, 800), (1610, 850), (1400, 745)],
        ],
        # Hindernisse (Vielecke oder ("kreis", x, y, rx, ry))
        "hindernisse": [("kreis", 735, 490, 86, 44), ("kreis", 630, 428, 46, 20), ("kreis", 843, 428, 48, 20), ("kreis", 638, 538, 54, 24), ("kreis", 845, 532, 54, 24),
                        ("kreis", 1095, 492, 34, 22), ("kreis", 690, 648, 62, 26), ("kreis", 562, 492, 15, 9), ("kreis", 575, 742, 12, 8), ("kreis", 983, 622, 12, 8), ("kreis", 1050, 508, 12, 8)],
        # was vor dem Helden steht, wenn er dahinter läuft: (Vieleck, Fußlinie y)
        "vorn": [
            ([(658, 470), (690, 456), (706, 452), (718, 400), (735, 356), (752, 400), (764, 452), (780, 456), (812, 470), (814, 502), (782, 524), (735, 530), (690, 524), (656, 502)], 500),
            ([(583, 420), (668, 397), (679, 418), (600, 460), (585, 452)], 440), ([(797, 399), (893, 431), (888, 460), (794, 427)], 440),
            ([(582, 499), (693, 539), (688, 574), (584, 530)], 548), ([(791, 539), (893, 499), (901, 521), (806, 574), (792, 566)], 545),
            ([(548, 583), (603, 583), (603, 645), (582, 645), (582, 748), (568, 748), (568, 645), (548, 645)], 745),
            ([(960, 543), (1007, 543), (1007, 592), (989, 592), (989, 628), (977, 628), (977, 592), (960, 592)], 624),
            ([(1030, 335), (1080, 335), (1080, 388), (1056, 388), (1056, 514), (1044, 514), (1044, 388), (1030, 388)], 510),
        ],
        # eine Runde Dorfleute, die beisammenstehen und reden: Mitte der Füße
        "gruppen": [(690, 668)],
        # Leute, die man ansprechen kann: Kennung, x, y (Füße)
        "leute": [("hanne", 562, 494)],
        "stellen": {"start": (420, 850), "scheune": (515, 300), "muehle": (1150, 528), "wehr": (1225, 640), "feuer": (735, 490)},
    },
}


def main():
    name = sys.argv[1]; O = ORTE[name]; F = O["mass"]; gross = Image.open(os.path.join(HIER, "orte", O["bild"])).convert("RGB"); W = O["breit"]; H = round(gross.height * W / gross.width); im = gross.resize((W, H), Image.LANCZOS)
    gross.resize((round(W * F), round(H * F)), Image.LANCZOS).save(os.path.join(ROOT, "img", "echtzeit", name + ".webp"), quality=90, method=6)
    m = Image.new("L", (W, H), 0); d = ImageDraw.Draw(m)
    for p in O["flaechen"]: d.polygon(p, fill=255)
    for h in O["hindernisse"]:
        if h[0] == "kreis": _, x, y, rx, ry = h; d.ellipse((x - rx, y - ry, x + rx, y + ry), fill=0)
        else: d.polygon(h, fill=0)
    Z = 16; BW, BH = round(W * F), round(H * F); px = m.load(); zeilen = []
    for j in range(BH // Z): zeilen.append("".join("." if px[min(W - 1, int((i * Z + Z / 2) / F)), min(H - 1, int((j * Z + Z / 2) / F))] else "#" for i in range(BW // Z)))
    json.dump({"bild": name, "mass": F, "gross": O["gross"], "breit": BW, "hoch": BH, "zelle": Z, "zeilen": zeilen, "zaeune": [], "leute": [[k, round(x * F), round(y * F)] for k, x, y in O.get("leute", [])], "gruppen": [[round(x * F), round(y * F)] for x, y in O.get("gruppen", [])], "vorn": [[[list(q) for q in p], y] for p, y in O["vorn"]],
               "stellen": {k: [round(v[0] * F), round(v[1] * F)] for k, v in O["stellen"].items()}}, open(os.path.join(HIER, "..", "client", "src", name + ".json"), "w"), ensure_ascii=False)
    if len(sys.argv) > 2:
        v = im.convert("RGBA"); o = Image.new("RGBA", (W, H), (0, 0, 0, 0)); do = ImageDraw.Draw(o); o.paste((60, 255, 90, 90), mask=m)
        for h in O["hindernisse"]:
            if h[0] == "kreis": _, x, y, rx, ry = h; do.ellipse((x - rx, y - ry, x + rx, y + ry), outline=(255, 60, 60, 255), width=2)
        for p, y in O["vorn"]: do.polygon(p, outline=(90, 160, 255, 255))
        for k, (x, y) in O["stellen"].items(): do.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(255, 230, 60, 255)); do.text((x + 9, y - 6), k, fill=(255, 230, 60, 255))
        v.alpha_composite(o); v.convert("RGB").save(sys.argv[2])
    print("fertig:", name, (BW, BH), "Raster", len(zeilen[0]), "x", len(zeilen))


main()
