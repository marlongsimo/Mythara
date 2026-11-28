# Angeln

Rucksackbilder (256 × 256, durchsichtig) in `img/objekte3d/skilling/angeln/symbole/`:

| Fisch | roh | gebraten | verbrannt |
|---|---|---|---|
| Bachling (kleine Forelle, rot-schwarz getupft) | fisch_bachling_roh | fisch_bachling_gebraten | fisch_bachling_verbrannt |
| Mühlbarsch (grüngold, dunkle Binden, rote Flossen) | fisch_muehlbarsch_roh | … | … |
| Moorhecht (lang, olivgrün, helle Flecken) | fisch_moorhecht_roh | … | … |

Gebaut mit `fabrik/fische.py -- <ziel> [art=…] [zustand=…]` (Blender, Körper aus Ringen, Muster im Shader).

Werkzeuge (Utensilien, in der Hand wie Holzbeil und Spitzhacke): `angelrute` (nur eine, ohne Stufen),
`fischreuse` – 3D unter `img/objekte3d/skilling/utensilien/`, Teile `waffe.<id>` an den Grundfiguren, Bilder hier in `symbole/`.
Gebaut mit `fabrik/angelzeug.py -- <art> <ziel.glb>`; Rucksackbilder mit `fabrik/symbol.py`.
