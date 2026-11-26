"""Mythara Fabrik – ein Rüstungsteil in einer anderen Seltenheitsstufe: gleiche Form, anderes Material.

  python3 fabrik/seltenheit.py <teil.glb> <ziel.glb> <stufe> [metall_c=9]
  teil.glb: am besten die fertige, ans Skelett gebundene Teil-Datei aus export3d.py auslagern=… (img/figuren-echt3d/<figur>.teile/<id>.glb)
  stufe: training | gewoehnlich | selten | episch | legendaer | mythisch    [art=leder]: Ledersets – Lederfarbe je Stufe (waldgrün, nachtblau, ochsenblut, schillerndes Violett)
[holz=1]: Werkzeuge – der Holzstiel bleibt Holz (je Stufe gebeizt), Leuchten an den Metallkanten statt an den Beschlägen
Die Textur wird in drei Bereiche geteilt (Lab-Farbraum): Metall (grau, wenig Farbe), Beschläge (Messing: farbig und hell) und Leder (farbig und dunkel).
Jede Stufe färbt sie eigen und legt bei episch/legendär eine Leuchtkarte auf die Beschläge (glTF emissive – three.js zeigt sie direkt):
  gewöhnlich – mattes, dunkles Eisen mit Rost, Beschläge aus Eisen      selten – unverändert (olivgrauer Stahl, Messing)
  episch     – geschwärzter Stahl mit blauem Schimmer, Gold, schwaches blaues Leuchten der Kanten
  legendär   – dunkler Stahl mit warmem Glanz, leuchtendes Gold, glühende Kanten (orange)
  mythisch   – Obsidian mit Ölfilm-Schillern (Violett, Türkis, Rosa), Weißgold, Kanten und Energieadern leuchten von Türkis bis Magenta
"""
import os, sys
import numpy as np
import bpy
from PIL import Image
teil, ziel, stufe = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def srgb(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, None), 1 / 2.4) - 0.055)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); W = np.array([0.95047, 1.0, 1.08883])
def lab(rgb):
    x = (lin(rgb) @ M.T) / W; f = np.where(x > 0.008856, np.cbrt(x), 7.787 * x + 16 / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)
def rgb(L):
    fy = (L[:, 0] + 16) / 116; fx = fy + L[:, 1] / 500; fz = fy - L[:, 2] / 200; f = np.stack([fx, fy, fz], 1)
    x = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * W; return np.clip(srgb(x @ np.linalg.inv(M).T), 0, 1)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath(teil))
img = max(bpy.data.images, key=lambda b: b.size[0] * b.size[1]); B_, H_ = img.size
a = np.array(img.pixels[:], dtype=np.float32).reshape(-1, 4); L = lab(a[:, :3]); C = np.hypot(L[:, 1], L[:, 2])
MC = float(opt.get("metall_c", 9))   # Farbsättigung, bis zu der etwas als Metall zählt (Beinschienen mit beige-olivgrauen Platten: 17)
metall = C < MC; messing = (C >= MC) & (L[:, 0] > 30); leder = (C >= MC) & ~messing
FELD = (C >= MC) & (L[:, 2] < -6) if opt.get("feld") == "1" else np.zeros(len(L), bool)   # feld=1: farbiges Wappenfeld (Schild) eigens färben, nicht als Beschlag
messing &= ~FELD; leder &= ~FELD
kanten = messing & (L[:, 0] > max(45.0, float(np.percentile(L[messing, 0], 60)) if messing.any() else 45.0))   # nur die hellsten Beschläge leuchten (je Teil gemessen – helle Platten wie bei den Beinschienen nicht)
print(f"Bereiche: Metall {metall.mean():.0%}, Beschläge {messing.mean():.0%} (davon leuchtend {kanten.sum() / max(1, messing.sum()):.0%}), Leder {leder.mean():.0%}")
N = L.copy(); glut = np.zeros(len(L)); glutfarbe = (0, 0, 0); glutstaerke = 0.0
def setze(maske, L_=None, dL=0.0, fL=1.0, a=None, b=None, fC=None):
    if L_ is not None: N[maske, 0] = L_
    N[maske, 0] = N[maske, 0] * fL + dL
    if fC is not None: N[maske, 1] *= fC; N[maske, 2] *= fC
    if a is not None: N[maske, 1] += a
    if b is not None: N[maske, 2] += b
LEDER = opt.get("art") in ("leder", "stoff"); STOFF = opt.get("art") == "stoff"   # stoff: Roben (schon farbig) – eigene Farbfolge   # art=leder: Ledersets (wenig Metall) – die Stufe zeigt sich vor allem in der Lederfarbe, Schnallen und Nähte leuchten
def leder_farbe(maske, a_, b_, fL=1.0, dL=0.0):
    """Leder umfärben: Helligkeitsmuster bleibt, Farbton wird ersetzt (etwas Struktur aus der alten Farbe bleibt)"""
    N[maske, 0] = L[maske, 0] * fL + dL; N[maske, 1] = a_ + (L[maske, 1] - L[maske, 1].mean()) * 0.3; N[maske, 2] = b_ + (L[maske, 2] - L[maske, 2].mean()) * 0.3
if LEDER:
    if STOFF and stufe in ("selten", "episch", "legendaer"):
        a_, b_ = {"selten": (-24, 8), "episch": (34, -32), "legendaer": (40, 22)}[stufe]; leder_farbe(leder, a_, b_, 1.05, 2)   # smaragd, purpur, karmesin
        if stufe == "episch": setze(messing, fL=1.15, dL=8, fC=0.25)
        if stufe == "legendaer": setze(messing, fL=1.1, dL=6, fC=1.5, a=5, b=16)
    elif stufe == "selten": leder_farbe(leder, -16, 12, 1.05, 2); setze(metall, fC=0.6, a=-3, b=2)                         # waldgrün, Messing bleibt
    elif stufe == "episch": leder_farbe(leder, 6, -26, 1.0, 1); setze(metall, fL=0.85, fC=0.3, b=-8); setze(messing, fL=1.15, dL=8, fC=0.25)   # nachtblau, Silber
    elif stufe == "legendaer": leder_farbe(leder, 34, 20, 1.0, 2); setze(metall, fL=0.8, fC=0.5, a=4, b=2); setze(messing, fL=1.1, dL=6, fC=1.5, a=5, b=16)   # ochsenblutrot, Gold
    elif stufe == "mythisch":
        v_, u_ = np.divmod(np.arange(len(L)), B_); u_ = u_ / B_; v_ = v_ / H_; sch = np.stack([np.sin(u_ * 9 + v_ * 5), np.cos(u_ * 7 - v_ * 8)], 1)
        N[leder, 0] = L[leder, 0] * 0.75; N[leder, 1] = 26 + 14 * sch[leder, 0]; N[leder, 2] = -30 + 16 * sch[leder, 1]    # schillerndes Violett
        setze(metall, fL=0.6, fC=0.3, a=8, b=-10); N[messing, 0] = np.clip(L[messing, 0] * 1.05 + 20, 0, 96); N[messing, 1] *= 0.2; N[messing, 2] *= 0.3
    elif stufe != "gewoehnlich": sys.exit("Stufe unbekannt: " + stufe)
    if stufe in ("episch", "legendaer", "mythisch"):                       # Schnallen und Beschläge leuchten; bei mythisch zusätzlich die Nähte im Leder
        glut = (messing & (L[:, 0] > (np.percentile(L[messing, 0], 75) if messing.any() else 99))).astype(float); glutstaerke = {"episch": 0.35, "legendaer": 0.6, "mythisch": 0.8}[stufe]
        glutfarbe = {"episch": (0.4, 0.6, 1.0), "legendaer": (1.0, 0.55, 0.15), "mythisch": None}[stufe]
        if stufe == "mythisch":
            Lb = L[:, 0].reshape(H_, B_); kante = (np.abs(np.diff(Lb, axis=1, append=Lb[:, -1:])) + np.abs(np.diff(Lb, axis=0, append=Lb[-1:, :]))).ravel()
            glut = np.maximum(glut, (leder & (kante > np.percentile(kante[leder], 95))) * 0.7); t_ = (np.sin(v_ * 12 + u_ * 3) + 1) / 2; GLUT_RGB = np.stack([0.2 + 0.8 * t_, 0.85 - 0.6 * t_, np.ones_like(t_)], 1)
elif stufe == "selten" and opt.get("poliert") == "1":                     # Grundstufe gewöhnlich (Anfängerwaffen): selten = blank polierter Stahl, sattes Messing
    setze(metall, fL=1.12, dL=2, fC=0.5, b=-2); setze(messing, fL=1.05, dL=3, fC=1.3, a=2, b=8)
elif stufe == "training":                                                    # unter einfach: stumpfes, fleckig rostiges Eisen, ausgeblichenes Leder (Werkzeuge, Waffen ohne eigenes Trainingsmodell)
    setze(metall, fL=0.7, dL=-3, fC=0.2, a=9, b=15)
    rost = metall & (L[:, 0] < np.percentile(L[metall, 0], 60)); setze(rost, a=16, b=24)
    setze(messing, fL=0.6, fC=0.2, b=5); setze(leder, fL=0.88, dL=3, fC=0.35)
elif stufe == "gewoehnlich":
    setze(metall, fL=0.78, dL=-2, fC=0.3, a=2.5, b=6)                     # stumpfes Eisen, leicht rostbraun
    rost = metall & (L[:, 0] < np.percentile(L[metall, 0], 35)); setze(rost, a=6, b=10)
    setze(messing, fL=0.62, fC=0.15, b=3)                                   # Beschläge: Eisen statt Messing
elif stufe == "episch":
    setze(metall, fL=0.62, fC=0.2, a=1, b=-9)                               # geschwärzter Stahl, blauer Schimmer
    setze(messing, fL=1.05, dL=4, fC=1.3, a=2, b=9)                         # Gold
    glut = kanten.astype(float); glutfarbe = (0.35, 0.55, 1.0); glutstaerke = 0.35
elif stufe == "legendaer":
    setze(metall, fL=0.68, fC=0.45, a=3, b=3)                               # dunkler Stahl, warm
    setze(messing, fL=1.1, dL=6, fC=1.5, a=5, b=16)                         # leuchtendes Gold
    setze(leder, fL=0.85, a=6, b=-2)                                        # Leder tief rotbraun
    glut = kanten.astype(float); glutfarbe = (1.0, 0.55, 0.15); glutstaerke = 0.75
elif stufe == "mythisch":                                                  # über legendär, bewusst ausgefallen
    v_, u_ = np.divmod(np.arange(len(L)), B_); u_ = u_ / B_; v_ = v_ / H_   # Lage in der Textur (für Verläufe)
    schiller = np.stack([np.sin(u_ * 9 + v_ * 5) , np.cos(u_ * 7 - v_ * 8)], 1)   # Ölfilm-Schillern: Violett, Türkis, Rosa je nach Stelle
    N[metall, 0] = L[metall, 0] * (0.32 if opt.get('stark') == '1' else 0.42) + 4; amp = 9 if opt.get('stark') == '1' else 28; N[metall, 1] = amp * schiller[metall, 0] + 16; N[metall, 2] = amp * schiller[metall, 1] - 20   # Waffen: sanfter (die Klinge liegt über viele Texturstücke verteilt)
    N[messing, 0] = np.clip(L[messing, 0] * 1.05 + 22, 0, 96); N[messing, 1] = L[messing, 1] * 0.2 + 4; N[messing, 2] = L[messing, 2] * 0.35 + 6   # Weißgold
    N[leder, 0] = L[leder, 0] * 0.6; N[leder, 1] = 14; N[leder, 2] = -18     # Leder tief violett
    Lb = L[:, 0].reshape(H_, B_); gx = np.abs(np.diff(Lb, axis=1, append=Lb[:, -1:])); gy = np.abs(np.diff(Lb, axis=0, append=Lb[-1:, :]))
    kante = (gx + gy).ravel(); adern = metall & (kante > np.percentile(kante[metall], 93)) & (L[:, 0] > 4)   # Energieadern: feine Linien im Metall
    glut = np.maximum(kanten.astype(float), adern * 0.8); glutstaerke = 1.1
    t_ = (np.sin(v_ * 12 + u_ * 3) + 1) / 2; glutfarbe = None; GLUT_RGB = np.stack([0.2 + 0.8 * t_, 0.85 - 0.6 * t_, 1.0 * np.ones_like(t_)], 1)   # Türkis ↔ Magenta
elif stufe != "selten": sys.exit("Stufe unbekannt: " + stufe)
if opt.get("stark") == "1" and not LEDER:                                 # Waffen: die Klinge ist die Hauptfläche – Stufe kräftiger zeigen, Griff mitfärben
    if stufe == "episch": setze(metall, fL=0.6, fC=0.3, a=-2, b=-18); N[leder, 1] = 4 + (L[leder, 1] - L[leder, 1].mean()) * 0.3; N[leder, 2] = -24 + (L[leder, 2] - L[leder, 2].mean()) * 0.3
    if stufe == "legendaer": setze(metall, fL=0.82, fC=1.0, a=6, b=26); N[leder, 1] = 32 + (L[leder, 1] - L[leder, 1].mean()) * 0.3; N[leder, 2] = 14 + (L[leder, 2] - L[leder, 2].mean()) * 0.3
    if stufe == "gewoehnlich": setze(leder, fL=0.8, fC=0.5); setze(metall, fL=0.9, a=3, b=6)
    if stufe == "training": setze(leder, fL=0.85, fC=0.3); setze(metall, fL=0.9, a=6, b=10)
if FELD.any():                                                              # Wappenfeld je Stufe: verblasst, blau (Original), purpur, karmesin, nachtviolett
    f_ = {"gewoehnlich": (2, -6, 0.8), "episch": (26, -36, 0.85), "legendaer": (44, 24, 0.9), "mythisch": (22, -30, 0.75)}.get(stufe)
    if f_:
        N[FELD, 0] = L[FELD, 0] * f_[2]; N[FELD, 1] = f_[0] + (L[FELD, 1] - L[FELD, 1].mean()) * 0.25; N[FELD, 2] = f_[1] + (L[FELD, 2] - L[FELD, 2].mean()) * 0.25
if opt.get("holz") == "1":                                                  # Werkzeuge: der helle, farbige Bereich ist der Holzstiel – Holz bleibt Holz (je Stufe gebeizt), das Leuchten sitzt an den Metallkanten
    holz = messing; fL_, fC_, da_, db_ = {"training": (0.78, 0.25, 1, 2), "gewoehnlich": (0.92, 0.7, 0, 0), "selten": (1, 1, 0, 0), "episch": (0.55, 0.85, 2, -3),
                                           "legendaer": (0.7, 1.1, 9, 3), "mythisch": (0.38, 0.5, 8, -10)}[stufe]   # verwittert grau, schlicht, Original, Nussbaum, rotbraun, Ebenholz
    N[holz, 0] = L[holz, 0] * fL_; N[holz, 1] = L[holz, 1] * fC_ + da_; N[holz, 2] = L[holz, 2] * fC_ + db_
    if glutstaerke:
        Lb = L[:, 0].reshape(H_, B_); km = (np.abs(np.diff(Lb, axis=1, append=Lb[:, -1:])) + np.abs(np.diff(Lb, axis=0, append=Lb[-1:, :]))).ravel()
        glut = (metall & (km > np.percentile(km[metall], 90)) & (L[:, 0] > np.percentile(L[metall, 0], 40))).astype(float)
a[:, :3] = rgb(N); img.pixels[:] = a.ravel(); img.pack()
if glutstaerke:                                                             # Leuchtkarte: nur die Beschläge, weich ausgeblendet
    g = np.asarray(Image.fromarray((glut.reshape(H_, B_) * 255).astype(np.uint8)).resize((B_ // 2, H_ // 2), Image.BILINEAR).resize((B_, H_), Image.BILINEAR), np.float32) / 255
    g = np.clip(g * 1.2, 0, 1).ravel(); e = np.zeros((B_ * H_, 4), np.float32); e[:, 3] = 1
    farbe = GLUT_RGB if glutfarbe is None else np.tile(np.array(glutfarbe, np.float32), (B_ * H_, 1)); e[:, :3] = g[:, None] * farbe
    eb = bpy.data.images.new("glut", B_, H_); eb.pixels[:] = e.ravel(); eb.pack()
    for m in bpy.data.materials:
        if not m.node_tree: continue
        bs = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if not bs: continue
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = eb; t.image.colorspace_settings.name = "sRGB"
        uv = next((n for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image == img), None)
        if uv and uv.inputs["Vector"].is_linked: m.node_tree.links.new(uv.inputs["Vector"].links[0].from_socket, t.inputs["Vector"])
        m.node_tree.links.new(t.outputs["Color"], bs.inputs["Emission Color"]); bs.inputs["Emission Strength"].default_value = glutstaerke
bpy.ops.object.select_all(action="SELECT"); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_skins=True, export_animations=False, export_image_format="WEBP")
print(f"Seltenheit {stufe}: {ziel}")
