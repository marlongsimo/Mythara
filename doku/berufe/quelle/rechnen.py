import json
# Versuch alle 4 Ticks (2 s). Chance(L) linear zwischen lo (bei Level 1) und hi (bei 99), /256 wie OSRS; Werkzeug-Stufe s (0..5) gibt +s*8 auf lo und hi.
# 85-%-Kurve wie Kampf: XP-Werte daher ~OSRS
HOLZ = [  # name, baum, level, xp, lo, hi, vorrat, nachwachsen s
 ("Tannenholz", "Tanne", 1, 25, 64, 200, (1, 3), 20),
 ("Eichenholz", "Eiche", 10, 40, 32, 150, (3, 6), 30),
 ("Eibenholz", "Eibe", 20, 70, 16, 110, (3, 7), 60),
 ("Moorholz", "Moorweide", 35, 110, 8, 80, (4, 8), 90),
 ("Kernholz", "Kernbaum", 45, 175, 4, 60, (4, 9), 150),
 ("Weltbaumholz", "Weltbaum-Spross", 65, 260, 2, 42, (5, 10), 300)]
ERZ = [
 ("Kupfererz", "Kupferader", 1, 20, 70, 210, (2, 4), 10),
 ("Eisenerz", "Eisenader", 10, 35, 40, 160, (2, 5), 20),
 ("Schwarzeisenerz", "Schwarzeisenader", 20, 60, 18, 115, (2, 5), 45),
 ("Sternenerz", "Sternenader", 35, 100, 8, 85, (2, 6), 90),
 ("Splittererz", "Splitterfelsen", 45, 160, 4, 62, (2, 6), 180),
 ("Urerz", "Urgestein", 65, 250, 2, 44, (3, 7), 420)]
def chance(L, lo, hi, s): return min(0.95, ((lo + 8*s) * (99 - L) + (hi + 8*s) * (L - 1)) / 98 / 256)
def tab(liste):
    out = []
    for n, q, req, xp, lo, hi, v, w in liste:
        s_req = min(5, [1,10,20,35,45,65].index(req) if req in [1,10,20,35,45,65] else 0)
        z = []
        for L, s in ((req, s_req), (min(99, req+20), s_req), (99, 5)):
            c = chance(L, lo, hi, s); pro_std = 3600/2*c * 0.85  # 15 % Laufen/Nachwachsen
            z.append((L, s, round(c*100), round(pro_std), round(pro_std*xp)))
        out.append(dict(name=n, quelle=q, level=req, xp=xp, vorrat=v, nach=w, werte=z))
    return out
print(json.dumps({"holz": tab(HOLZ), "erz": tab(ERZ)}, ensure_ascii=False))
