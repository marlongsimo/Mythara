"""Mythara Fabrik – eine neue Grundstruktur (Mann, Frau, …) nach der Vorlage anlegen.

  python3 fabrik/grundstruktur.py <meshy.glb> <asset-id> [vorlage=fabrik/vorlagen/grundstruktur.json]

meshy.glb   schlichter Körper (Unterkleidung, barfuß, Arme leicht abgespreizt) mit Textur – z. B. Meshy texturiert
Legt fabrik/assets/<asset-id>/v001/ an: quelle/meshy-basis.glb, quelle/koerper.glb (Textur bleibt, Punktfarben aus der Textur),
basis.json (nur Körper und Skelett – Ziel für übertragene Teile), ausruestung.json (aus der Vorlage: Unterkleidung, Waffen, Baukasten,
gemalter Stil), arbeit/basis.blend (gerigt). Danach kommen Teile dazu, z. B.
  python3 fabrik/set_aus_bild.py <asset>/v001/arbeit/basis.blend fabrik/assets/ruestung.set.leder <asset>/v001/quelle/teile/ruestung.set.leder.glb
  python3 fabrik/baukasten.py fabrik/assets/<asset-id>/v001 <teil.glb> <id> <platz>
"""
import json, os, shutil, subprocess, sys
glb, aid = sys.argv[1], sys.argv[2]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a)
FAB = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(FAB, "assets", aid, "v001"); PY = sys.executable
for u in ("quelle/teile", "arbeit"): os.makedirs(os.path.join(D, u), exist_ok=True)
os.makedirs(os.path.join(FAB, "assets", aid, "referenz"), exist_ok=True)
shutil.copy(glb, os.path.join(D, "quelle", "meshy-basis.glb"))
subprocess.run([PY, os.path.join(FAB, "grundkoerper.py"), os.path.join(D, "quelle", "meshy-basis.glb"), os.path.join(D, "quelle", "koerper.glb"), "textur"], check=True)
V = json.load(open(opt.get("vorlage", os.path.join(FAB, "vorlagen", "grundstruktur.json"))))
V["hinweis"] = f"Grundstruktur {aid} (nach der Vorlage fabrik/vorlagen/grundstruktur.json)"
for t in V.get("huelle", []): t["id"] = t["id"].rsplit(".", 1)[0] + "." + aid.split(".")[-1]   # eigene Ebenennamen je Grundstruktur (kleidung.hemd.frau …)
json.dump(V, open(os.path.join(D, "ausruestung.json"), "w"), ensure_ascii=False, indent=2)
json.dump({"hinweis": "nur Körper und Skelett – Ziel für übertragene Teile", "bewegungen": ["ruhe"], "starr": [], "huelle": [], "koerper_textur": True, "stuecke_behalten": True},
          open(os.path.join(D, "basis.json"), "w"), ensure_ascii=False, indent=2)
subprocess.run([PY, os.path.join(FAB, "rig.py"), os.path.join(D, "quelle", "koerper.glb"), os.path.abspath(os.path.join(D, "arbeit", "basis.blend")), os.path.join(D, "basis.json")], check=True)
print(f"Grundstruktur {aid} angelegt: {D}")
