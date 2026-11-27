"""Mythara Fabrik – feste Rucksackbilder für alle Gegenstände (#166: nichts wird mehr zur Laufzeit gezeichnet).

  python3 fabrik/rucksackbilder.py <blender-python> [realtime=realtime] [ref=origin/feature/realtime-engine] [--pruefen]

1. Liest die Gegenstände aus <realtime>/shared/gegenstaende.ts (mit esbuild gebündelt, wie im Spiel; GEGENSTAENDE samt BILDER_AUS_FABRIK).
2. Ohne festes Bild gilt: kein „bild“ und kein Bildpfad in „symbol“, oder „symbol“ ist ein Laufzeit-Zeichen (kristall, pergament, trank, trankrot)
   – oder der Pfad im Gegenstand zeigt auf eine Datei, die es nicht gibt.
3. Für jeden davon in dieser Reihenfolge:
   a) Eintrag in fabrik/vorlagen/rucksackbilder.json: {"bild": vorhandenes Bild} oder {"glb": Modell, "kipp", "dreh", "rolle", "ton", "schein", "ziel"}
   b) vorhandenes Bild img/objekte3d/**/symbole/<id>.webp
   c) Modell img/objekte3d/**/<id>.glb → Bild daneben in symbole/<id>.webp (fabrik/symbol.py, Standard kipp -25 = schräg von oben, dreh 30)
   Gerenderte Bilder: 256 × 256, durchsichtig, Stil der Rucksackbilder. ton=<Grad> dreht den Farbton, schein=<#rrggbb> legt einen weichen Lichtschein dahinter.
4. Schreibt fabrik/vorlagen/rucksackbilder_pfade.json ({id: bild}) – Systeme trägt die Pfade ein (bild setzen, Laufzeit-„symbol“ entfernen;
   BILDER_AUS_FABRIK greift nur, wenn weder bild noch symbol gesetzt sind) – und meldet, was offen bleibt.
--pruefen: nur auflisten, nichts rendern (gut als Prüfung für jeden neuen Gegenstand).
"""
import glob, json, os, subprocess, sys, tempfile
from PIL import Image, ImageFilter

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BL = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith(("-", "realtime=")) else None
opt = dict(a.split("=", 1) for a in sys.argv[1:] if "=" in a); PRUEFEN = "--pruefen" in sys.argv or not BL
RT = os.path.join(W, opt.get("realtime", "realtime")); LAUFZEIT = {"kristall", "pergament", "trank", "trankrot"}

def gegenstaende():
    t = tempfile.mkdtemp(); ts = os.path.join(t, "liste.ts"); js = os.path.join(t, "liste.js")
    open(ts, "w").write(f'import {{ GEGENSTAENDE }} from "{os.path.join(RT, "shared", "gegenstaende")}";\n'
                        'console.log(JSON.stringify(Object.values(GEGENSTAENDE).map((g: any) => ({ id: g.id, name: g.name, bild: g.bild, symbol: g.symbol }))));\n')
    esb = os.path.join(W, "realtime", "node_modules", ".bin", "esbuild")
    subprocess.run([esb, ts, "--bundle", "--platform=node", "--outfile=" + js, "--log-level=error"], check=True)
    return json.loads(subprocess.run(["node", js], capture_output=True, text=True, check=True).stdout)
BESTAND = set(subprocess.run(["git", "-C", W, "ls-tree", "-r", "--name-only", opt["ref"]], capture_output=True, text=True, check=True).stdout.split()) if "ref" in opt else set()
da = lambda p: os.path.exists(os.path.join(W, p)) or p in BESTAND                                  # ref=<zweig>: auch Dateien zählen, die es dort gibt
def fest(g):
    for k in ("bild", "symbol"):
        p = g.get(k)
        if p and "/" in str(p): return p if da(p) else None
    return None
vorlage = json.load(open(os.path.join(W, "fabrik", "vorlagen", "rucksackbilder.json")))["gegenstaende"]
symbole = {os.path.basename(p)[:-5]: p for p in glob.glob(os.path.join(W, "img", "objekte3d", "**", "symbole", "*.webp"), recursive=True)}
modelle = {os.path.basename(p)[:-4]: p for p in glob.glob(os.path.join(W, "img", "objekte3d", "**", "*.glb"), recursive=True) if ".mobil." not in p and ".teile" not in p}
rel = lambda p: os.path.relpath(p, W)
def rendern(id_, glb, e):
    ziel = os.path.join(W, e["ziel"]) if e.get("ziel") else os.path.join(os.path.dirname(glb), "symbole", id_ + ".webp"); os.makedirs(os.path.dirname(ziel), exist_ok=True)
    e = {"kipp": -25, **e}                                                                        # symbol.py: negatives kipp = schräg von oben (positives zeigt die Unterseite)
    arg = [f"{k}={e[k]}" for k in ("kipp", "dreh", "rolle", "matt", "fuellen") if k in e]
    subprocess.run([BL, os.path.join(W, "fabrik", "symbol.py"), "--", glb, ziel, *arg], capture_output=True, check=True)
    if "ton" in e or "schein" in e:                                                               # nachträglich: Farbton drehen, Lichtschein dahinter
        im = Image.open(ziel).convert("RGBA"); a = im.getchannel("A")
        if "ton" in e:
            h, s, v = im.convert("RGB").convert("HSV").split(); h = h.point(lambda x: (x + int(float(e["ton"]) / 360 * 255)) % 256)
            s = s.point(lambda x: min(255, int(x * float(e.get("saett", 1.0))))); im = Image.merge("HSV", (h, s, v)).convert("RGBA"); im.putalpha(a)
        if "schein" in e:
            c = tuple(int(e["schein"].lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)); glow = Image.new("RGBA", im.size, (*c, 0))
            glow.putalpha(a.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(10)).point(lambda x: int(x * 0.8))); im = Image.alpha_composite(glow, im)
        im.save(ziel, "WEBP", quality=90)
    return ziel
pfade, offen = {}, []
for g in gegenstaende():
    if fest(g) and g["id"] not in vorlage: continue
    id_, e = g["id"], vorlage.get(g["id"], {})
    if e.get("bild") and os.path.exists(os.path.join(W, e["bild"])): pfade[id_] = e["bild"]; continue
    glb = os.path.join(W, e["glb"]) if e.get("glb") else None
    if not glb and id_ in symbole: pfade[id_] = rel(symbole[id_]); continue
    glb = glb or modelle.get(id_)
    if not glb: offen.append((id_, g.get("name"))); continue
    if PRUEFEN: pfade[id_] = "(rendern aus " + rel(glb) + ")"; continue
    pfade[id_] = rel(rendern(id_, glb, e)); print("gerendert:", id_, "→", pfade[id_])
ausgabe = os.path.join(W, "fabrik", "vorlagen", "rucksackbilder_pfade.json")
if not PRUEFEN: json.dump({"hinweis": "Rucksackbilder (#166) – je Gegenstand ein festes Bild; im Spiel als bild eintragen (Laufzeit-symbol entfernen)", "bilder": pfade}, open(ausgabe, "w"), ensure_ascii=False, indent=1)
for k, v in pfade.items(): print(f"{k}\t{v}")
print(f"\n{len(pfade)} Gegenstände mit Bild aus der Fabrik, {len(offen)} offen" + (": " + ", ".join(f"{i} ({n})" for i, n in offen) if offen else ""))
