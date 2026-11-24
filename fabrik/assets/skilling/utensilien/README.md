# Utensilien (Skilling)

Werkzeuge für die Skills – je Werkzeug ein Ordner:

    utensilien/<werkzeug>/asset.json              Name, Skill, Quelle, Spieldatei
    utensilien/<werkzeug>/v001/quelle/meshy.blend  Meshy-Modell (nicht im Repository, fabrik/.gitignore)
    utensilien/<werkzeug>/referenz/vorschau.png    Vorschau

| Werkzeug | Skill | Länge | Spieldatei |
|---|---|---|---|
| Holzbeil | Holzfällerei | 0,6 m | img/objekte3d/skilling/utensilien/holzbeil.glb |
| Spitzhacke | Bergbau | 0,8 m | img/objekte3d/skilling/utensilien/spitzhacke.glb |

Ausgabe: `python3 fabrik/baum_export.py -- <meshy.blend> img/objekte3d/skilling/utensilien/<werkzeug>.glb <länge in m>` (Stielende im Ursprung, Kopf oben).
Später: als starres Teil an die rechte Hand der Grundfiguren (ausruestung.json „starr“) mit eigener Schlagbewegung.

## Stufen (Training bis Mythisch)

Je Werkzeug `utensilien/<werkzeug>/<n-stufe>/<name>/datenblatt.json` + `vorschau.png` (0-training … 5-mythisch), Übersicht `referenz/stufen.png`.
Grundstufe ist **selten** (das Meshy-Modell); die anderen Stufen:

    python3 fabrik/seltenheit.py img/objekte3d/skilling/utensilien/<werkzeug>.glb img/objekte3d/skilling/utensilien/<werkzeug>.<stufe>.glb <stufe> metall_c=18 stark=1 holz=1

`holz=1`: der Stiel bleibt Holz (verwittert grau, schlicht, Original, Nussbaum, rotbraun, Ebenholz); episch, legendär und mythisch leuchten an den Metallkanten (blau, orange, türkis bis magenta).
`training`: rostiges Eisen, ausgeblichenes Holz und Leder.
