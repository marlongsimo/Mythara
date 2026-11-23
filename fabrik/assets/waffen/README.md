# Waffen und Schilde nach Klasse

```
waffen/
  schwert/                         Klasse
    1-gewoehnlich/                 Seltenheit
      anfaengerschwert/            Gegenstand
        datenblatt.json            Name, Klasse, Seltenheit, Modell (Spieldateien), Animation, Werte, Text
        vorschau.png               die Waffe in dieser Stufe
    2-selten/ … 5-mythisch/
    waffe.eidschwert/              Modellquelle (Meshy-Datei, angepasstes Modell, Stufenbild) – alle Stufen entstehen daraus
```

Datenblätter neu anlegen oder ergänzen (vorhandene Werte bleiben stehen): `cd realtime && npx esbuild ../fabrik/datenblaetter.ts --bundle --platform=node --log-level=error | (cd .. && node)`;
Vorschaubilder: `python3 fabrik/datenblatt_bilder.py` (Blender-Python).

Jede Waffe liegt unter `waffen/<klasse>/<id>/` (z. B. `waffen/schwert/waffe.eidschwert/`). Die Ausrüstungslisten der Figuren verweisen mit diesem Pfad darauf (`"glb": "waffen/schwert/waffe.eidschwert/v001/quelle/schwert.glb"`).

Die Klasse bestimmt Griff und Bewegungen (siehe `waffenklassen` in `basemann3d/v001/ausruestung.json`).

- **schwert**: `waffe.schwert.ritter`, `waffe.schwert.schildwahrer`, `waffe.eidschwert`, `waffe.kurzschwert`
- **dolch**: `waffe.dolch`, `waffe.eiddolch`, `waffe.jagdmesser`
- **zweihand**: `waffe.langschwert`, `waffe.eidzweihaender`, `waffe.zweihaender.warlord`
- **streitkolben**: `waffe.streitkolben`, `waffe.sternbrecher`
- **axt**: `waffe.axt`, `waffe.wurfaxt`
- **speer**: `waffe.speer`, `waffe.speer.wache`, `waffe.sterndorn`
- **stab**: `waffe.stab.hirte`, `waffe.zeremonienstab`, `waffe.blitzstab`, `waffe.eisstab`, `waffe.elementarstab`, `waffe.feuerstab`, `waffe.heilstab`, `waffe.kristallstab`, `waffe.lichtstab`, `waffe.sternenszepter`
- **bogen**: `waffe.bogen`, `waffe.bogen.jagd`, `waffe.bogen.orin`, `waffe.mondbogen.lang`, `waffe.mondbogen.kurz`
- **armbrust**: `waffe.armbrust`, `waffe.sternarmbrust`
- **schild**: `schild.baum`, `schild.baum.stahl`, `schild.beute`, `schild.kreuz`, `schild.rund`, `schild.sternen`, `schild.wache`

Im Ordner `fabrik/assets/` stehen für die Waffen, die die geschützten Figuren Krieger v004 und Bandit v001 nutzen, noch Verknüpfungen am alten Ort (schild.baum, schild.baum.stahl, schild.beute, waffe.axt, waffe.bogen, waffe.dolch, waffe.kurzschwert, waffe.langschwert), damit deren Dateien unverändert bleiben.
