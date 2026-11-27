# Gegner-Grundformen (Vorlagen für spätere Gegner)

Die Meshy-Modelle des Nutzers vom 27.11.2026 und die schon vorhandenen Gegner, nach Grundform. Für einen neuen Gegner zuerst hier eine passende Form suchen:
umfärben (`fabrik/textur_ton.py`, `fabrik/stein.py`, `fabrik/geist.py`) oder das Quellmodell (`fabrik/assets/<gegner>/v001/quelle/meshy.glb`) mit demselben Rig-Werkzeug neu riggen.

| Asset | Name | Stufe | Grundform | Rig-Werkzeug | Bewegungen |
|---|---|---|---|---|---|
| `gegner.steppenwolf` | Steppenwolf | 46 | Vierbeiner Wolf | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.ockerhyaene` | Ockerhyäne | 50 | Vierbeiner Wolf (Hyäne) | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.hochlandwidder` | Hochlandwidder | 52 | Vierbeiner Huftier (mit Hörnern) | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.hochlandbaer` | Hochlandbär | 54 | Vierbeiner Bär | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.klippenadler` | Klippenadler | 56 | Vogel (Flieger) | `fabrik/rig_flieger.py` | fliegen, sturz, tod, treffer |
| `gegner.bergtroll` | Bergtroll | 58 | Troll / Riese (gebückt, lange Arme) | `fabrik/rig_riese.py` | faustschlag, gehen, ruhe, tod, treffer |
| `gegner.tundraelch` | Tundraelch | 62 | Vierbeiner Huftier (mit Geweih) | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.frostwolf` | Frostwolf | 64 | Vierbeiner Wolf | `fabrik/rig_vierbeiner.py` | angriff, gehen, laufen, ruhe, tod, treffer |
| `gegner.drakling` | Drakling | 66 | Drache (Flieger mit Schwanz) | `fabrik/rig_flieger.py` | fliegen, sturz, tod, treffer |
| `gegner.eisgolem` | Eisgolem | 72 | Golem / Riese (gebückt) | `fabrik/rig_riese.py` | faustschlag, gehen, ruhe, tod, treffer |

## Schon vorhandene Grundformen (Auswahl)
| Grundform | Beispiele | Werkzeug |
|---|---|---|
| Vierbeiner Wolf (einfache Formen) | heidewolf3d, rudelfuehrer3d, fuchs3d, graupelz3d, wildschwein3d, feldhase3d, schaf3d | `fabrik/ostufer_tiere.py` |
| Vierbeiner Huftier (Meshy) | kuh3d | `fabrik/rig_vierbeiner.py` |
| Krebs / Krabbe | schlickkrebs3d, strandkrabbe3d, riesenkrabbe3d | `fabrik/ostufer_tiere.py`, `fabrik/kueste_tiere.py` |
| Wurm | sandkriecher3d, sandmutter3d | `fabrik/glutsande_tiere.py` |
| Skorpion | glutskorpion3d | `fabrik/glutsande_tiere.py` |
| Echse / Lurch | mangrovenlurch3d | `fabrik/kueste_tiere.py` |
| Schildkröte (Meshy) | mooshocker3d, schilfkroete3d | `fabrik/rig_schildkroete.py` |
| Kleiner Vogel | moorrabe3d, kraehe3d, seevogel3d, ente3d | `fabrik/rabe.py` |
| Irrlicht / Schwarm | gruenlicht3d, glutgeist3d, wildbienen3d | `fabrik/ostufer_tiere.py`, `fabrik/glutsande_tiere.py` |
| Golem aufrecht (Meshy) | waldgolem3d, steinschlucker3d | `fabrik/rig.py` (zivil, faustschlag) |
| Mensch (Kämpfer) | bandit3d … , karawanenraeuber_*, strandraeuber_*, wegelagerer_* | `fabrik/rig.py` |
| Geist | grauer_hauptmann3d, wrackkapitaen3d | `fabrik/geist.py` auf eine fertige Figur |
