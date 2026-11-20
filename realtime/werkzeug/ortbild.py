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
            [(455, 292), (575, 272), (605, 318), (700, 338), (790, 305), (850, 340), (858, 380), (890, 402), (940, 410), (1000, 404), (1035, 405), (1085, 440), (1100, 520), (1160, 535), (1195, 528), (1085, 588),
             (975, 614), (750, 714), (555, 808), (445, 866), (350, 842), (395, 805), (545, 725), (545, 640), (515, 480), (508, 350)],
            # der Weg links an der Scheune vorbei nach hinten (zum Krötennest)
            [(330, 323), (472, 319), (496, 344), (336, 346)],
            # der Steg über das Wehr
            [(1055, 584), (1375, 701), (1375, 724), (1055, 607)],
            # der Weg am anderen Ufer
            [(1335, 715), (1385, 650), (1500, 560), (1585, 445), (1640, 430), (1625, 520), (1520, 630), (1445, 715), (1630, 800), (1610, 850), (1400, 750), (1345, 724)],
        ],
        # Hindernisse (Vielecke oder ("kreis", x, y, rx, ry))
        "hindernisse": [("kreis", 735, 490, 86, 44), ("kreis", 630, 428, 46, 20), ("kreis", 838, 428, 40, 13), ("kreis", 638, 538, 54, 24), ("kreis", 845, 532, 54, 24),
                        ("kreis", 1095, 492, 34, 22), ("kreis", 690, 648, 62, 26), ("kreis", 562, 492, 15, 9), ("kreis", 575, 352, 15, 9), ("kreis", 985, 478, 15, 9), ("kreis", 575, 742, 12, 8), ("kreis", 983, 622, 12, 8), ("kreis", 1050, 508, 12, 8)],
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
        "leute": [("hanne", 562, 494), ("lene", 575, 354), ("agnes", 985, 480), ("tebbe", 618, 374), ("mette", 880, 600), ("bote", 610, 775)],
        "stellen": {"start": (420, 850), "scheune": (515, 300), "muehle": (1150, 528), "wehr": (1225, 657), "feuer": (735, 490), "nest": (345, 338), "ufer": (1560, 800)},
    },
    "rabenmoor": {
        "bild": "rabenmoor.webp", "breit": 1672, "mass": 1.6, "gross": 108,
        "flaechen": [
            # Dorfplatz mit Brunnen und die Wege zwischen den Hütten nach unten
            [(560, 335), (700, 352), (880, 345), (905, 425), (1010, 445), (1190, 445), (1245, 490), (1245, 552), (1150, 548), (1050, 505), (900, 508), (800, 560),
             (775, 640), (785, 800), (560, 805), (555, 720), (400, 705), (380, 655), (470, 640), (520, 560), (530, 450), (540, 385)],
            # der Steg hinaus ins Moor
            [(1230, 495), (1430, 500), (1665, 615), (1665, 665), (1400, 550), (1230, 550)],
            # der Pfad hinauf zu Heddas Hütte
            [(1140, 450), (1165, 335), (1250, 292), (1445, 285), (1445, 322), (1260, 332), (1205, 450)],
            # am Fischerhaus vorbei zum Anleger mit dem Kahn
            [(760, 735), (1060, 742), (1185, 700), (1190, 745), (1060, 778), (760, 795)],
        ],
        "hindernisse": [("kreis", 790, 448, 66, 38), ("kreis", 600, 392, 38, 12), ("kreis", 575, 517, 36, 12), ("kreis", 465, 447, 14, 8), ("kreis", 695, 662, 14, 8), ("kreis", 1075, 482, 14, 8), ("kreis", 507, 497, 8, 6), ("kreis", 862, 455, 14, 9)],
        "vorn": [([(722, 372), (742, 330), (790, 318), (840, 330), (860, 372), (858, 470), (790, 488), (724, 470)], 478)],
        "gruppen": [],
        "leute": [("bertold", 720, 372), ("ilse", 880, 520), ("jorin", 840, 535), ("joost", 1110, 720), ("hedda", 1405, 300), ("harm", 685, 548)],
        "stellen": {"start": (665, 795), "steg": (1640, 640), "kahn": (1150, 725), "pfad": (1440, 302), "schrein": (1440, 303)},
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
