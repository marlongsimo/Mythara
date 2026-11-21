# Mythara Figuren-Pipeline (modulare 3D-Figuren → 2D-Sprites für Phaser 3)

Aus einem geriggten 3D-Körper und austauschbaren Ausrüstungsteilen entstehen Sprite-Atlanten in **acht echten Blickrichtungen**
für alle Animationen – getrennt nach **Ebenen**, damit jede Ausrüstung mit jeder anderen kombinierbar ist, ohne dass Kombinationen
gerendert werden müssen. Ein neuer Helm ist ein Modell plus eine JSON-Datei; die Pipeline erledigt den Rest.

> **Stand:** Der Krieger `krieger_test` ist ein **TEST ASSET** (KayKit-Mannequin, CC0, und selbstgebaute Platzhalter-Ausrüstung).
> Er dient nur der technischen Entwicklung. Lizenzen: [documentation/LIZENZEN.md](documentation/LIZENZEN.md).

## Schnellstart

```bash
bash tools/setup.sh                                   # Blender + numpy + Pillow (einmal je Rechner/Container)
python3 tools/produzieren.py krieger_test             # rendern (nur Geändertes) → packen → prüfen
python3 tools/produzieren.py krieger_test --schnell   # Entwicklung: nur 2 Richtungen, 2 Animationen
blender -b --python blender/scripts/anprobe.py -- krieger_test /tmp/anprobe standard   # 3D-Sichtkontrolle einer Ausrüstung
```

Ergebnis: `img/figuren3d/<figur>/` (spielfertig) und `export/<figur>/bericht.md` (Produktionsbericht) plus `export/<figur>/vorschau/*.webp`.
Ansehen: `echtzeit/figurenvorschau.html` (Vorschau, Ausrüstung wechseln) und `echtzeit/figurentest.html` (Testszene mit der echten Simulation).

## Ordner

| Ordner | Inhalt |
|---|---|
| `configs/render.json` | Renderstandard für alles: Bildgröße, Fußpunkt, Pixel je Meter, Kamera, Licht, fps, 8 Richtungen, Export |
| `configs/slots.json` | Ausrüstungsslots (mit Standardsockel) und Seltenheitsstufen |
| `configs/skelette/<id>.json` | Grundskelett: Quelle, Knochenliste, **Sockel** (Befestigungspunkte), Wurzelknochen |
| `configs/animationen/<id>.json` | Animationsbibliothek: Spielname → Clip (Datei, Schleife, Halten, am Ort, Tempo) |
| `configs/figuren/<id>.json` | Figur/Heldenklasse: Körpermodell und seine **Regionen**, Animationsliste, Standardausrüstung |
| `configs/ausruestung/<id>.json` | ein Gegenstand je Datei (Schema unten) |
| `configs/materialien.json` | Materialbibliothek (Farbe, Rauheit, Metall, Leuchten) |
| `blender/models`, `blender/animations`, `blender/equipment` | Quell-Modelle |
| `blender/scripts/mythara_figur/` | Blender-Python: `szene` (Import, Skelett, Regionen, Sockel, Material), `ausruestung` (befestigen/binden), `animation`, `kamera` |
| `blender/scripts/render_ebene.py` | rendert **eine Ebene** (alle Animationen × 8 Richtungen) |
| `tools/produzieren.py` | Ablaufsteuerung: Ebenen finden, parallel rendern (mit Zwischenspeicher), packen, prüfen |
| `tools/packen.py`, `tools/pruefen.py`, `tools/ebenen.py` | Atlanten und Metadaten, Qualitätsprüfung, gemeinsame Hilfen |
| `preview/index.html` | Vorschauseite (wird als `echtzeit/figurenvorschau.html` ausgeliefert) |
| `render/` | Zwischenspeicher der Einzelbilder (nicht im Git) |

## Architektur

### Ebenen statt Kombinationen
Jede **Körperregion** (Kopf, Rumpf, Arme, Beine – je nach Modell) und jeder **Gegenstand** ist eine eigene Ebene mit eigenem Atlas.
Alle Ebenen haben dieselbe Kamera, dieselbe Bildgröße, denselben Fußpunkt und dieselben Frames. Im Spiel liegen sie als Sprites in einem Container übereinander.

**Verdeckung** wird beim Rendern gelöst (Holdout):
* Körperregionen verdecken sich gegenseitig (Arm vor Brust …).
* Ein Gegenstand wird **nur vom Körper** verdeckt – Teile hinter dem Körper sind im Bild schon ausgeschnitten (Schwert hinter dem Rücken).
  Gegenstände verdecken einander beim Rendern nie; so bleibt jeder mit jedem kombinierbar.
* Zwischen Gegenständen entscheidet die **Tiefe je Frame** (mittlere Entfernung zur Kamera, im Atlas unter `meta.mythara.tiefe`):
  weiter hinten wird zuerst gezeichnet. Darum liegt der Umhang von Süden gesehen hinter der Figur und von Norden davor.
* Gegenstände geben an, was sie **verdecken** (`hides.regions`: Körperregionen werden nicht gezeichnet, z. B. Rumpf unter dem Brustpanzer;
  `hides.slots`: andere Slots, z. B. Haare unter dem Helm). Das verhindert durchstechende Haut und Haare.

### Skelett, Sockel, Bindung
Alle Teile einer Klasse nutzen **ein Skelett** (`warrior_base`, für den Test KayKit `Rig_Medium`, 23 Knochen) und damit dieselben Animationen.
* **Starre Teile** (Helm, Schulterplatten, Waffen, Schild, Haare) hängen an einem **Sockel**: `Head, Hair, Chest, Back, Waist, Shoulder_Left/Right, Hand_Left/Right, Foot_Left/Right`.
  Ein Sockel ist ein Knochen plus Versatz/Drehung (`configs/skelette/*.json`). Mehrteilige Gegenstände (Schulterplatten) nennen je Teil seinen Sockel.
* **Verformbare Teile** (Brustpanzer, Handschuhe, Beinschienen, Stiefel, Umhang) werden automatisch gebunden: Die Gewichte kommen per
  Data-Transfer (nächste Fläche, interpoliert) von den angegebenen Körperregionen (`attach.bindTo`). Bringt ein Modell schon Gewichte mit
  Knochennamen des Skeletts mit, bleiben sie mit `attach.keepWeights: true` erhalten.

### Modell-Konventionen (für Künstler und spätere Mythara-Modelle)
* Meter, Z oben, Blick nach **−Y** (Süden), Ruhepose = Ruhepose des Grundskeletts (T-Pose).
* **Starr:** Ursprung = Haltepunkt, Koordinaten im Raum des Sockels. **Waffen: Griff am Ursprung, Klinge entlang +Z des Sockels** (Hand_Right/Hand_Left).
* **Verformbar:** in Ruhepose um den Körper modelliert.
* Formate: `.blend`, `.glb/.gltf`, `.fbx`, `.obj`. Mehrere Materialien: Namen aus `configs/materialien.json` – oder eigene Texturen mit `visual.material: null`.

### Richtungen und Kamera
Orthografische Kamera aus Süden, 35° von oben (wie die gemalten Karten). Acht echte Richtungen, **keine Spiegelung** – Waffen- und Schildhand
bleiben richtig. Winkel wie im Spiel: **0 = Osten, 90° = Süden, y nach unten** (`configs/render.json → richtungen`).
Der Fußpunkt (Weltursprung) liegt in jedem Bild an derselben Stelle (Standard 112/179 bei 224 × 224); Atlas-Frames sind beschnitten,
behalten aber ihr Originalmaß (`sourceSize`), sodass Phaser sie am Fußpunkt ausrichtet.
Animationen werden mit 10 fps abgetastet; Bewegung der Wurzel wird bei `amOrt` entfernt (die Position kommt im Spiel vom Server).

## Neue Ausrüstung hinzufügen
1. Modell nach `blender/equipment/<gruppe>/<id>.blend` (Konventionen oben).
2. `configs/ausruestung/<id>.json` anlegen:
```json
{
  "id": "warrior_helmet_steel_01", "name": "Stahlhelm", "slot": "head", "type": "helmet", "rarity": "uncommon",
  "model": { "file": "blender/equipment/helmets/steel_helmet.blend" }, "skeleton": "warrior_base",
  "attach": { "mode": "rigid", "socket": "Head" },
  "hides": { "regions": [], "slots": ["hair"] },
  "stats": { "armor": 12 }, "special": {}, "visual": { "material": "stahl", "trim": null, "glow": null }
}
```
   Verformbar: `"attach": { "mode": "skinned", "bindTo": ["rumpf"] }`. Zweihändig: `"occupies": ["main_hand", "off_hand"]`.
   Mehrteilig: `"attach": { "mode": "rigid", "parts": [{ "object": "...", "socket": "Shoulder_Left" }, …] }`.
3. `python3 tools/produzieren.py krieger_test` – erkennt den neuen Gegenstand, rendert **nur ihn** (alle Animationen × 8 Richtungen),
   packt Atlas und Katalog neu und prüft alles. Sichtkontrolle: `anprobe.py` und die Vorschauseite.

Seltenheit ist **mehr als Farbe**: Jede Stufe kann ein eigenes Modell (Form, Verzierung), eigene Materialien und leuchtende Teile
(Material mit `leuchten`) haben. Beispiele im Test: Stahlhelm (ungewöhnlich), Schattenhelm mit Hörnern und Runenband (episch),
Panzer der Splitterlande mit leuchtendem Kern (legendär).

## Haltungen (Animationssätze je Waffenart)
Eine Figur kann mehrere Haltungen haben (`haltungen` in der Figur): Zuordnung Spielzustand → Animation, z. B. `einhand: { idle: idle_1h, attack: attack_1h, block: block_1h }`.
Waffen und Schilde nennen ihre Haltung (`stance`). Die Haltung kommt von der Haupthand, sonst von der Nebenhand, sonst `standard`.
Alle Ebenen werden für alle Animationen gerendert; im Spiel wählt `CharacterAnimator` die passende (`ModularCharacter` setzt die Haltung beim Ausrüsten).
Weitere Bildraten je Clip (`fps`, z. B. 15 für schnelle Angriffe) und festgehaltene Sockel (`sockelFest`, z. B. Waffe bleibt beim Sterben in der Hand) stehen in der Animationsbibliothek.

## Prüfungen und Berichte
* `export/<figur>/bericht.md` – Produktionsprüfung (Vollständigkeit, Größen, Transparenz, Fußpunkt, Stand, Takt, Texturen, Atlas, **Überlagerung**:
  Waffen- und Schildhand über die Sockelpositionen je Bild, Schultern, Helm zur Kopfgröße, Umhang hinter/vor dem Körper, Löcher, durchragender Körper)
* `export/<figur>/kombinationen/*.webp` – 8 Sets × 8 Richtungen × Ruhe/Gehen/Angriff/Block, darunter ungewöhnliche Kombinationen
* `export/<figur>/abschlussbericht.md` – Gesamtbericht mit Nachweisbild aller Animationen in 8 Richtungen und Leistungsdaten
* `blender/scripts/modell_pruefen.py` – Eingangsprüfung neuer Körpermodelle (siehe [documentation/FINALES_MODELL.md](documentation/FINALES_MODELL.md))

## Leistung
* Rendern: Blender je Prozess mit 1 Thread, so viele Prozesse wie Kerne (gemessen 4 × 1 Thread ≈ 14 Bilder/s gegenüber 3 × alle Kerne ≈ 3,5 Bilder/s).
  Ein neues Ausrüstungsteil (12 Animationen × 8 Richtungen ≈ 1 000 Bilder) braucht etwa 6 Minuten; nur geänderte Ebenen werden neu gerendert.
* Export: Maßstab 0,75 (Figur im Atlas ~1,35× Spielgröße), gleiche Frames nur einmal gespeichert, dichtes Skyline-Packen (~95 % Füllgrad),
  Seiten ≤ 2048 px. Im Spiel werden nur die getragenen Ebenen geladen und zwischen Figuren geteilt.

## Neue Heldenklasse / neue Figur
* Gleicher Körperbau: neue `configs/figuren/<id>.json` mit anderem Körpermodell, Regionen, Animationsliste und Standardausrüstung.
  Die Ausrüstung von `warrior_base` passt, wenn das Skelett dasselbe ist.
* Anderes Skelett: `configs/skelette/<neu>.json` (Knochen, Sockel) und eine Animationsbibliothek dafür. Gegenstände tragen ihr Skelett in `skeleton`.
* Das echte, hochwertige Modell des Waldmark-Kriegers ersetzt nur `koerper.datei` und `koerper.regionen` in der Figur – Pipeline,
  Spielschnittstelle und Vorschau bleiben gleich. Wichtig: Das Modell muss **modular** sein (Regionen und Teile als getrennte Objekte, ein Skelett).

## Im Spiel (Phaser 3)
`realtime/client/src/figuren3d/` – additiv, das bestehende Figurensystem bleibt unverändert:
* `CharacterConfiguration` – Datentypen, Ausrüstungsregeln (`ausruestungPruefen`, `sichtbareEbenen`)
* `CharacterAssetLoader` – lädt `figur.json`, Katalog und nur die benötigten Atlanten (`load.multiatlas`), lädt beim Wechsel nach
* `AnimationRegistry` – Animationen, Takt, Schleife/Halten, Prüfung auf fehlende Frames
* `DirectionResolver` – Blickwinkel der Simulation → eine der 8 Richtungen (Draufsicht und isometrisch, mit Hysterese)
* `CharacterAnimator` – Grundzustand aus dem Stand (steht/geht/läuft/blockt/tot), einmalige Aktionen aus Ereignissen (Hieb, Treffer …),
  Lauftempo an die echte Geschwindigkeit gekoppelt
* `ModularCharacter` – der Container: Ausrüstung setzen/wechseln/entfernen, alle Ebenen synchron, Gegenstände je Frame nach Tiefe

Der Server bleibt maßgeblich (Position, Kampf, später Ausrüstungszustand); der Client stellt nur dar. Eine Figur ohne modulare Daten
läuft weiter über das bisherige System. In diesem Entwicklungsschritt gibt es **keine** Server- oder Datenbankänderung; die Ausrüstung
wird nur lokal in Vorschau und Testszene gewechselt.

## Offene Punkte
1. ~~Haltungen~~ – umgesetzt (siehe oben).
2. **Speicher:** Der voll ausgerüstete Testkrieger belegt rund 62 MB Grafikspeicher (12 MB Download für alle 20 Ebenen).
   Gegenmittel, in dieser Reihenfolge: Atlanten je Animation statt je Ebene (nur laden, was gerade läuft), kleinerer Renderstandard
   (Figur ~100 px statt ~150 px), 8 statt 10 fps für Idle/Block, komprimierte GPU-Texturen. Alles über `configs/render.json` bzw. den Packer.
3. ~~Todesanimation lässt die Waffe fallen~~ – Sockel werden für `death` festgehalten.
4. **Echte Mythara-Grafik:** Körper und Ausrüstung sind TEST ASSETS. Das finale Painted-3D-Modell muss modular gebaut sein (siehe Konventionen).
5. **Spiel und Server:** Ausrüstungszustand auf dem Server, Weitergabe im Koop und Einbau in die Kampfszene erst nach Freigabe.

## Grenzen (Stand jetzt)
* Reihenfolge zwischen Gegenständen gilt je Frame, nicht je Pixel (z. B. Schwert, das teils vor, teils hinter dem Schild liegt).
* Umhang ohne Stoffsimulation: bewegt sich steif mit dem Oberkörper.
* KayKit-Todesanimation lässt die Waffe fallen (der Handsockel löst sich von der Hand) – so animiert.
* Speicher: je Ebene rund 700 Frames; im Spiel werden nur die getragenen Ebenen geladen und zwischen Figuren geteilt.
