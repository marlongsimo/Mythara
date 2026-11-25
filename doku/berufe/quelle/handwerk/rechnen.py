"""Mythara – Handwerk: Rezepte, XP und Spielzeit aus einer Quelle. Schreibt zahlen.json für pdf_handwerk.py.
Regeln (Konzept): XP fürs Verarbeiten = 50 % der Sammel-XP, die in den Zutaten steckt (Barren zählt als seine Erze), Schmelzen = 30 % der Erz-XP.
XP-Kurve wie alle Skills (85 % OSRS)."""
import json, math
STUFEN = ["Training", "Einfach", "Selten", "Episch", "Legendär", "Mythisch"]; LV = [1, 10, 20, 35, 45, 65]
HOLZ = ["Eichenstamm", "Tannenstamm", "Eibenstamm", "Moorweidenstamm", "Kernbaumstamm", "Weltenbaumstamm"]; HXP = [25, 40, 70, 110, 175, 260]
ERZ = ["Kupfer", "Eisen", "Schwarzeisen", "Sterneisen", "Splittereisen", "Ureisen"]; EXP = [20, 35, 60, 100, 160, 250]; ERZ_JE_BARREN = [1, 2, 2, 2, 2, 3]
PFLUECK_XP = 8; GARN_XP = 4; SEHNE_XP = 4      # Flachs und Hanf pflücken (beide ab Level 1); an der Werkbank: Flachs → Bogensehne, Hanf → Garn
LEDER = ["Raues Leder", "Weiches Leder", "Gehärtetes Leder", "Moorleder", "Splitterleder", "Urleder"]; HAEUTE = [1, 1, 2, 2, 3, 4]; GXP = [15, 25, 45, 75, 120, 190]   # Kuhhaut → Leder je nach Level
STOFF = ["Hanftuch", "Grobtuch", "Feintuch", "Mondtuch", "Splittertuch", "Weltentuch"]; GARNE = [2, 3, 4, 5, 6, 8]; WXP = [12, 22, 40, 65, 105, 170]   # Garn → Stoff je nach Level
TICK = 0.6 * 0 + 0.5
def r5(x): return int(5 * round(x / 5)) if x >= 20 else int(round(x))
def barren_xp(t): return r5(0.3 * EXP[t] * ERZ_JE_BARREN[t])
def wert(t, art):   # Sammel-XP, die in einer Einheit steckt
    return {"B": EXP[t] * ERZ_JE_BARREN[t], "S": HXP[t], "L": GXP[t] * 2, "G": (PFLUECK_XP + GARN_XP) * 2, "N": (PFLUECK_XP + SEHNE_XP) * 2, "T": WXP[t] * 2}[art]
# Rezepte: (Werkstatt, Familie, Gegenstand je Stufe (Name), Level-Versatz, Zutaten {B,S,L,G,T}, ab Stufe)
R = [
 ("Amboss", "Dolch", ["–", "Eiddolch"], 0, {"B": 1, "S": 1}, 1),
 ("Amboss", "Holzbeil", ["Trainings-Holzbeil", "Holzbeil"], 1, {"B": 1, "S": 1}, 0),
 ("Amboss", "Spitzhacke", ["Trainings-Spitzhacke", "Spitzhacke"], 1, {"B": 1, "S": 1}, 0),
 ("Amboss", "Einhandschwert", ["Ritterschwert", "Eidschwert"], 2, {"B": 2, "S": 1}, 0),
 ("Amboss", "Speer", ["–", "Sterndorn"], 3, {"B": 1, "S": 2}, 1),
 ("Amboss", "Helm (schwer)", ["–", "Eisenwachthelm"], 3, {"B": 2, "L": 1}, 1),
 ("Amboss", "Streitkolben", ["–", "Sternbrecher"], 5, {"B": 3, "S": 1}, 1),
 ("Amboss", "Beinschienen", ["–", "Eisenbeinschienen"], 6, {"B": 3, "L": 1}, 1),
 ("Amboss", "Zweihänder", ["–", "Eidzweihänder"], 7, {"B": 3, "S": 1, "L": 1}, 1),
 ("Amboss", "Brustpanzer (schwer)", ["–", "Eisenwacht"], 9, {"B": 5, "L": 1}, 1),
 ("Werkbank", "Kurzbogen", ["Jagdbogen", "Mondkurzbogen"], 1, {"S": 2, "N": 1}, 0),
 ("Werkbank", "Langbogen", ["–", "Mondlangbogen"], 4, {"S": 3, "N": 1}, 1),
 ("Werkbank", "Schild", ["Rundschild", "Sternenschild"], 5, {"S": 3, "B": 1}, 0),
 ("Werkbank", "Stab", ["Hirtenstab", "Sternenszepter"], 6, {"S": 3, "G": 1}, 0),
 ("Werkbank", "Armbrust", ["–", "Sternarmbrust"], 6, {"S": 2, "B": 1, "N": 1}, 1),
 ("Werkbank", "Kapuze (leicht)", ["–", "Jägerkapuze"], 1, {"L": 2, "G": 1}, 1),
 ("Werkbank", "Kapuze (Stoff)", ["–", "Magierkapuze"], 1, {"T": 2, "G": 1}, 1),
 ("Werkbank", "Hose (leicht)", ["–", "Jägerhose"], 3, {"L": 3, "G": 1}, 1),
 ("Werkbank", "Rock (Stoff)", ["–", "Magierrock"], 3, {"T": 3, "G": 1}, 1),
 ("Werkbank", "Wams (leicht)", ["Lederpanzer", "Jägerwams"], 8, {"L": 4, "G": 1}, 0),
 ("Werkbank", "Robe (Stoff)", ["Magiepanzer", "Magierrobe"], 8, {"T": 4, "G": 1}, 0),
]
EINHEIT = {"B": lambda t: ERZ[t] + "barren", "S": lambda t: HOLZ[t], "L": lambda t: LEDER[t],
           "G": lambda t: "Garn", "N": lambda t: "Bogensehne", "T": lambda t: STOFF[t]}
rezepte = []
for werk, fam, namen, versatz, zut, ab in R:
    for t in range(ab, 6):
        name = namen[0] if t == 0 else (namen[1] + ("" if t == 2 else ""))
        einheiten = sum(zut.values()); xp = r5(0.5 * sum(wert(t, a) * n for a, n in zut.items()))
        rezepte.append(dict(werk=werk, fam=fam, stufe=STUFEN[t], t=t, name=name, level=min(99, LV[t] + versatz),
            zutaten=[[EINHEIT[a](t), n] for a, n in zut.items()], splitter=0, xp=xp, ticks=3 + 2 * einheiten))
# Vorstufen
vor = [dict(art="Pflücken (Flachsfeld)", name="Flachs", level=1, zutaten="Flachsfeld in der Welt, kein Werkzeug", xp=PFLUECK_XP, ticks=3),
       dict(art="Pflücken (Hanffeld)", name="Hanf", level=1, zutaten="Hanffeld in der Welt, kein Werkzeug", xp=PFLUECK_XP, ticks=3),
       dict(art="Sehne drehen (Werkbank)", name="Bogensehne", level=1, zutaten="1 Flachs", xp=SEHNE_XP, ticks=2),
       dict(art="Garn drehen (Werkbank)", name="Garn", level=1, zutaten="1 Hanf", xp=GARN_XP, ticks=2)]
for t in range(6):
    vor.append(dict(art="Schmelzen (Esse)", name=ERZ[t] + "barren", level=LV[t], zutaten=f"{ERZ_JE_BARREN[t]} {ERZ[t]}erz + 1 Stamm (Brennholz, jede Sorte ab {HOLZ[max(0,t-2)]})", xp=barren_xp(t), ticks=3))
for t in range(6):
    vor.append(dict(art="Gerben (Werkbank)", name=LEDER[t], level=LV[t], zutaten=f"{HAEUTE[t]} Kuhhaut + 1 Stamm (Gerberlohe, jede Sorte)", xp=GXP[t], ticks=3))
for t in range(6):
    vor.append(dict(art="Weben (Werkbank)", name=STOFF[t], level=LV[t], zutaten=f"{GARNE[t]} Garn", xp=WXP[t], ticks=3))
# XP-Kurve
K = [0, 0]; pk = 0
for L in range(2, 101): pk += math.floor(L - 1 + 300 * 2 ** ((L - 1) / 7)); K.append(round(math.floor(pk / 4) * 0.85))
# XP/h: bestes Rezept je Stufe (XP je Tick) mit gekauften/gesammelten Zutaten, 10 % Verlust für Bankwege
proh = []
for t in range(6):
    cand = [r for r in rezepte if r["t"] == t]; best = max(cand, key=lambda r: r["xp"] / r["ticks"])
    xph = best["xp"] / (best["ticks"] * TICK) * 3600 * 0.9
    proh.append(dict(stufe=STUFEN[t], rezept=best["name"] + " (" + best["fam"] + ")", xph=int(round(xph, -2))))
# Zeit bis Level (immer das beste erlaubte Rezept)
def stunden(bis):
    h = 0; L = 1; xp = 0
    while L < bis:
        t = max(i for i in range(6) if LV[i] <= L); ziel = K[L + 1]; h += (ziel - xp) / next(p["xph"] for p in proh if p["stufe"] == STUFEN[t]); xp = ziel; L += 1
    return round(h, 1)
zeiten = {str(b): stunden(b) for b in (10, 20, 35, 45, 65, 99)}
# Zutaten-Bedarf: Handwerk-XP je Sammel-XP der Zutaten ≈ 0,5 (Verarbeiten) + 0,15 (Schmelzen, gut die Hälfte der Rezepte braucht Barren) ≈ 0,6
sammeln = {str(b): int(round(K[b] / 0.6, -3)) for b in (10, 20, 35, 45, 65, 99)}
json.dump(dict(rezepte=rezepte, vor=vor, proh=proh, zeiten=zeiten, sammeln=sammeln, kurve={str(L): K[L] for L in (10, 20, 35, 45, 65, 99)}), open("zahlen.json", "w"), ensure_ascii=False, indent=1)
print(len(rezepte), "Rezepte"); print(proh); print(zeiten)
