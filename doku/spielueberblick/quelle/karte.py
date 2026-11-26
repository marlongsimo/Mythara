import json, glob, os
from PIL import Image, ImageDraw, ImageFont
W = "/home/user/mythara/echtzeit/welt/"; S = 96  # px je Chunk (32 Felder → 2 px/Feld)
ch = {}
for f in glob.glob(W + "*.json"):
    b = os.path.basename(f)[:-5]
    if "_" not in b or not b.split("_")[0].isdigit(): continue
    j = json.load(open(f))
    if j.get("region") in ("unterschlupf", "rathaus_oben"): continue
    ch[(j["cx"], j["cy"])] = j.get("region", "")
xs = [c[0] for c in ch]; ys = [c[1] for c in ch]; X0, Y0 = min(xs), min(ys); B, H = (max(xs) - X0 + 1) * S, (max(ys) - Y0 + 1) * S
im = Image.new("RGB", (B, H), (30, 24, 18))
for (cx, cy) in ch:
    t = Image.open(f"{W}{cx}_{cy}.webp").convert("RGB").resize((S, S), Image.LANCZOS); im.paste(t, ((cx - X0) * S, (cy - Y0) * S))
F = S / 32; feld = lambda x, y: ((x - X0 * 32) * F, (y - Y0 * 32) * F)
im = im.resize((B * 2, H * 2), Image.LANCZOS); F = S / 16  # größer für Beschriftung
d = ImageDraw.Draw(im, "RGBA"); fb = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
gross, klein = ImageFont.truetype(fb, 40), ImageFont.truetype(fb, 22)
D = json.load(open("spiel.json"))
# Regionen: Mittelpunkt ihrer Chunks
reg = {}
for (cx, cy), r in ch.items(): reg.setdefault(r, []).append((cx, cy))
NAME = {"waldmark": "Waldmark", "waldweg": "Kreuzwald", "weidenhain": "Weidenhain", "rabenmoor": "Rabenmoor", "nordwald": "Nordwald", "westmark": "Westmark", "obstwiesen": "Obstwiesen", "osthof": "Osthof", "osthang": "Osthang", "graufurt": "Graufurt", "unterschlupf": "Unterschlupf", "rathaus_oben": "", "nordsaum": "Nordsaum"}
def text(x, y, t, f, farbe=(255, 236, 190)):
    w = d.textlength(t, font=f); d.text((x - w / 2, y), t, font=f, fill=farbe, stroke_width=4, stroke_fill=(20, 14, 8))
for r, cs in reg.items():
    if not NAME.get(r, r): continue
    mx = sum(c[0] for c in cs) / len(cs) + 0.5; my = sum(c[1] for c in cs) / len(cs) + 0.5
    text((mx - X0) * S * 2, (my - Y0) * S * 2 - (260 if r == "weidenhain" else 120), NAME.get(r, r).upper(), gross)
def punkt(x, y, farbe, r=9):
    px, py = feld(x, y); d.ellipse((px - r, py - r, px + r, py + r), fill=farbe, outline=(20, 14, 8), width=3); return px, py
FARBE = {"bandit_dolch": (200, 50, 40), "mooshocker": (90, 170, 70), "waldgolem": (150, 100, 50)}
for z in D["zonen"]:
    for l in z["lager"]: punkt(l["x"], l["y"], FARBE.get(l["art"], (200, 50, 40)), 7)
nr = 1; legende = []; marken = []
for q, farbe in ((D["q1"], (240, 200, 60)), (D["q2"], (110, 190, 240))):
    for n in q["npcs"]:
        px, py = punkt(n["x"], n["y"], farbe, 11); legende.append((nr, n["name"])); marken.append((px, py, str(nr))); nr += 1
for l in D["laeden"]:
    px, py = punkt(l["x"], l["y"], (230, 230, 230), 10); legende.append((nr, l["haendler"] + " – " + l["name"])); marken.append((px, py, str(nr))); nr += 1
belegt = [(mx - 14, my - 14, mx + 14, my + 14) for mx, my, _ in marken]
for mx, my, t in marken:
    w = d.textlength(t, font=klein)
    for dx, dy in ((16, -13), (-16 - w, -13), (-w / 2, -40), (-w / 2, 14), (16, 8), (-16 - w, 8), (16, -34), (-16 - w, -34), (30, -13), (-30 - w, -13)):
        b = (mx + dx - 2, my + dy, mx + dx + w + 2, my + dy + 24)
        if not any(b[0] < o[2] and b[2] > o[0] and b[1] < o[3] and b[3] > o[1] for o in belegt): break
    belegt.append(b); d.text((mx + dx, my + dy), t, font=klein, fill=(255, 236, 190), stroke_width=4, stroke_fill=(20, 14, 8))
im.save("weltkarte.jpg", quality=86)
ax, ay = feld(6405, 6395); bx, by = feld(6600, 6480); im.crop((int(ax), int(ay), int(bx), int(by))).save("ausschnitt.jpg", quality=90); json.dump(legende, open("legende.json", "w"), ensure_ascii=False)
# Ausschnitt Waldmark/Osthof für Details
print(im.size, X0, Y0)
