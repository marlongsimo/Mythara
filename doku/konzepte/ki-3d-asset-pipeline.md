# Mythara Splitterlande – KI-gestützte 3D-Asset-Fabrik

Technischer Integrationsplan · Stand 20.11.2026 · Phase 1 (Analyse) abgeschlossen, Phase 2 (Auswahl und Plan) in diesem Dokument

Dieses Dokument beschreibt, was im Repository tatsächlich vorhanden ist, welche Technik gewählt wird und wie die Fabrik in zehn Phasen entsteht. Es wurden keine kostenpflichtigen Aufrufe gemacht und nichts an Server, Datenbank oder Spiel geändert.

---

## 1. Ergebnis der Analyse (Phase 1)

### 1.1 Was vorhanden ist

| Baustein | Fundort | Zustand |
|---|---|---|
| Phaser 3.90, TypeScript 5.6, esbuild | `realtime/` auf dem Zweig `feature/realtime-engine` (`package.json`, `build.mjs`) | funktioniert; auf `main` liegt nur der gebaute Client `echtzeit/spiel.js` |
| 2D-Bildblatt-Aufbereitung | `realtime/werkzeug/blatt.py`, `gegner.py`, `bau.py` | funktioniert: stellt gemalte Vorlagen frei, schneidet auf Felder zu 176 px, unten bündig, vermisst die Figur |
| Figurendaten | `realtime/shared/config.ts` (`HeldDef`, `MonsterDef`) | je Figur ein Standbild und einzelne Blätter `lauf`, `hieb`, `hieb2`, `schild`, `ruhe`; dazu Maße `[Mitte x, Bodenlinie y, Körperhöhe]` als Anteile des Feldes |
| Animationen im Client | `realtime/client/src/main.ts` (`haltung`, `anims.create`) | Ruhe, Lauf, ein bis zwei Angriffe, Schildhaltung, Spezialangriff bei Monstern |
| Blickrichtung | `realtime/shared/sim.ts` (`blick = atan2(dy, dx)`), wird je Wesen an den Client geschickt | Winkel stimmt mit der Vorgabe überein: 0 = Osten, π/2 = Süden, y nach unten |
| Blender-Einsatz | `realtime/werkzeug/waldweg.py`, `img/welt/QUELLEN.md` | nur für Bäume, Felsen und Büsche des Waldwegs; die Renderings entstanden außerhalb des Repositorys |
| Tests | `realtime/test/*.mjs`, `tests/*.test.js` | Simulation, Server, Koop, Browser-Prüfungen |

### 1.2 Was nicht vorhanden ist

Die im Auftrag genannte Character Pipeline liegt in keinem der beiden Zweige (`main`, `feature/realtime-engine`):

- **Keine acht Blickrichtungen.** Jede Figur hat eine einzige Ansicht; links/rechts entsteht durch Spiegeln (`setFlipX` in `main.ts`, `dorf.ts`, `ort.ts`, `stadt.ts`).
- **Keine 3D-Charaktermodelle, kein Warrior-Grundrig, keine gemeinsamen Skelette.** Im Repository liegt keine einzige `.blend`-, `.glb`- oder `.fbx`-Datei.
- **Keine modulare Ausrüstung.** Torvalds Schild ist ein eigenes, komplett gemaltes Bildblatt, keine getrennte Ebene.
- **Keine Blender-Skripte für Figuren**, keine Render-Pipeline für Charaktere.
- **Keine Charaktervorschau.** `prototyp/helden.html` ist ein Entwurf zur Heldenfreischaltung, kein Vorschauwerkzeug.
- **Keine Asset-Verwaltung** mit IDs, Versionen oder Lizenzangaben (einzige Ausnahme: `img/welt/QUELLEN.md`, dort sind mehrere Lizenzen noch als „offen“ vermerkt).

Folgerung: Entweder liegt diese Arbeit an einem anderen Ort (anderer Rechner, anderes Repository, nicht hochgeladener Zweig), oder sie muss neu entstehen. Der Plan unten geht vom zweiten Fall aus und baut Rig, Acht-Richtungen-Rendering und Vorschau als Teil der Fabrik. Taucht die vorhandene Arbeit auf, wird sie als Grundlage übernommen (siehe Abschnitt 10, Frage 1).

### 1.3 Was das für die Fabrik bedeutet

1. Die Schnittstelle zum Spiel ist schmal und schon da: Blätter aus gleich großen Feldern, unten bündig, plus drei Maßzahlen. Die Fabrik liefert genau dieses Format, erweitert um Richtungszeilen.
2. Der Server muss nicht angefasst werden: Die Blickrichtung kommt bereits als Winkel beim Client an. Acht Richtungen sind eine reine Client-Änderung (Zeile des Blatts wählen statt spiegeln).
3. Die bisherigen Figuren sind gemalte 2D-Bilder. Gerenderte 3D-Figuren sehen daneben anders aus. Der Stilstandard (Abschnitt 7) muss diese Lücke schließen, und es braucht eine Entscheidung, ob bestehende Helden später neu erzeugt werden.

### 1.4 Arbeitsumgebung (geprüft)

| Prüfung | Ergebnis |
|---|---|
| Blender als Python-Paket (`pip install bpy`) | läuft: Version 5.3 unter Python 3.13; Blender 4.0 ist als Paket nicht mehr erhältlich |
| Rendern ohne Bildschirm | Cycles auf CPU funktioniert (256 px, 16 Abtastungen: 0,6 bis 2 s je Bild auf 4 Kernen); EEVEE läuft nur mit nachinstallierten Software-Grafiktreibern und ist dann rund 25-mal langsamer – gerendert wird mit Cycles |
| Import/Export | GLB und FBX funktionieren, Rigify ist enthalten |
| Grafikkarte | keine – lokale Image-to-3D-Modelle sind hier nicht ausführbar |

Skripte werden so geschrieben, dass sie unter Blender 4.x und 5.x laufen; wo sich die Schnittstellen unterscheiden, wird die Version abgefragt.

---

## 2. Zielarchitektur

Die Fabrik entsteht in einem eigenen Ordner `fabrik/` neben dem Spiel. Sie liest nichts aus Server oder Datenbank und schreibt ins Spiel erst beim ausdrücklichen Veröffentlichen eines geprüften Assets.

```
fabrik/
  fabrik.py                 Einstieg: python3 fabrik.py neu|lauf|pruefen|status|veroeffentlichen …
  standard/
    stil.json               Stilstandard (Kamera, Licht, Auflösung, Farben, Kontur)
    kategorien.json         je Kategorie: Pflichtteile, Polygon-Budget, Rig-Profil, Animationsprofil
    rig-humanoid.json       Knochenliste, Befestigungspunkte, Ausrüstungsplätze
  dienste/                  Anbieter-Adapter mit gleicher Schnittstelle
    basis.py                erzeugen(bilder, optionen) -> Auftrag; abholen(auftrag) -> GLB + Protokoll
    <anbieter>.py           Schlüssel nur aus der Umgebung, Kostenvoranschlag vor jedem Aufruf
    lokal.py                lokales Modell, falls ein Rechner mit Grafikkarte bereitsteht
    datei.py                „Dienst“ ohne Netz: nimmt eine vorhandene GLB/FBX (für Tests und Handarbeit)
  blender/
    aufbereiten.py          Größe, Ursprung, Geometrie, Normalen, Materialien, Polygonzahl
    teile.py                Modularisierung
    rig.py                  Skelett zuweisen, gewichten, Befestigungspunkte
    animation.py            Animationen übertragen (Retargeting), Fußkontakt
    rendern.py              acht Richtungen, einheitliche Kamera und Beleuchtung
  export/
    blatt.py                Blätter (PNG, WebP) und Metadaten
  pruefung/
    modell.py  rig.py  animation.py  bild.py  bericht.py
  vorschau/                 Phaser-Seite zur Kontrolle (eigener kleiner Build)
  assets/
    register.json           zentrales Verzeichnis aller Assets
    <asset-id>/
      asset.json            Stammdaten, Lizenz, Status
      referenz/             Referenzbilder (unverändert)
      v001/ quelle/ arbeit/ export/ bericht.json protokoll.jsonl
      v002/ …
```

### 2.1 Ablauf eines Assets

```
Referenzbild(er) ─► 1 Analyse ─► 2 Erzeugen ─► 3 Aufbereiten ─► 4 Teile ─► 5 Rig ─► 6 Animation ─► 7 Rendern ─► 8 Export
                                                     │             │         │          │              │           │
                                                     └──────────── Prüfung nach jedem Schritt, Bericht, ggf. Korrektur und Wiederholung
```

Jeder Schritt liest nur das Ergebnis des vorigen aus `arbeit/`, schreibt sein eigenes und einen Eintrag ins Protokoll. Ein Lauf lässt sich an jedem Schritt wieder aufnehmen; bezahlte Schritte werden nie doppelt ausgeführt, solange ihr Ergebnis vorliegt.

### 2.2 Die Schritte im Einzelnen

**Schritt 1 – Referenz analysieren.** Eingabe: ein Bild oder mehrere Ansichten, Kategorie, wahlweise Beschreibung, Größe, Stil. Das Bild wird freigestellt (vorhandene Logik aus `blatt.py`), Silhouette und Seitenverhältnis werden gemessen, die Hauptfarben als Palette entnommen. Die inhaltliche Beschreibung (Materialien, Ausrüstungsteile, Körperbau, Besonderheiten) schreibt Claude beim Lauf als `analyse.json`; sie dient später als Sollwert für die Prüfung („Helm erwartet“, „Schild links“). Mehrere Bilder werden als Ansichten desselben Objekts geführt (vorn, hinten, links, rechts) und gemeinsam an den Dienst gegeben.

**Schritt 2 – Modell erzeugen.** Über den Anbieter-Adapter, Ergebnis ist eine GLB mit Texturen. Vor jedem bezahlten Aufruf steht ein Kostenvoranschlag; ohne ausdrückliche Freigabe (Umgebungsvariable `FABRIK_BUDGET` als Obergrenze je Lauf) wird nicht gesendet. Antwort, Auftragsnummer, Modellversion des Dienstes und Kosten landen im Protokoll.

**Schritt 3 – Aufbereiten in Blender.** Höhe auf das Kategorienmaß bringen (Humanoid 1,80 m), Ursprung zwischen die Füße auf Bodenhöhe, Blick entlang einer festen Achse; lose Teile und doppelte Punkte erkennen und zusammenführen; Normalen einheitlich nach außen; Materialien und Texturen auf Vorhandensein, Auflösung und fehlende Bilddateien prüfen; Polygonzahl messen und nur bei Überschreitung des Budgets reduzieren. Die Optik wird nicht verändert: keine neue Textur, kein Glätten, kein Umfärben.

**Schritt 4 – Modularisierung.** In dieser Reihenfolge, die erste erfolgreiche Stufe gilt:
1. Der Dienst liefert getrennte Teile – übernehmen und benennen.
2. Das Modell besteht aus unverbundenen Stücken – nach Lage am Skelett den Plätzen zuordnen (Stück am Kopf oberhalb der Stirn → Helm).
3. Ausrüstung wird **einzeln erzeugt** statt herausgeschnitten: ein Bild des Helms ergibt ein Helmmodell. Das ist der verlässliche Weg und der Normalfall für neue Ausrüstung (Abschnitt 5).
4. Schneiden eines verschmolzenen Modells entlang von Material- und Farbgrenzen. Das gelingt nur manchmal sauber; das Ergebnis wird dann mit „manuelle Prüfung erforderlich“ markiert, nie stillschweigend als fertig.

**Schritt 5 – Rig.** Ein einziges Humanoid-Skelett für alle Helden und humanoiden Gegner (`rig-humanoid.json`), mit benannten Befestigungspunkten: Kopf, rechte Hand, linke Hand, linker Unterarm (Schild), Rücken, Hüfte. Weg: Skelett an die Körpermaße des Modells anpassen (Gelenkpositionen aus dem Rig des Dienstes oder aus der Silhouette), dann automatisch gewichten; schlägt die Gewichtung fehl, zweiter Versuch mit vereinfachter Hülle und Übertragung der Gewichte. Starre Teile (Helm, Waffe, Schild) hängen an einem Befestigungspunkt, verformbare Teile (Brustpanzer, Handschuhe, Stiefel, Umhang) übernehmen die Gewichte vom Grundkörper. Kreaturen bekommen eigene Rig-Profile (Vierbeiner, Schwebend, Starr).

**Schritt 6 – Animation.** Eine Animationsbibliothek auf dem gemeinsamen Skelett, einmal eingerichtet, für jedes kompatible Modell wiederverwendbar. Profil „Held“: Ruhe, Gehen, Laufen, Angriff, Block, Ausweichen, Zaubern, Treffer, Tod. Profil „humanoider Gegner“: dieselbe Bibliothek mit Auswahl. Profile für Kreaturen getrennt. Nach dem Übertragen: Füße am Boden halten, Bewegung an Ort und Stelle (keine Vorwärtsdrift), Schleifen schließen, Waffe in der Hand prüfen.

**Schritt 7 – Rendern.** Orthografische Kamera, fester Neigungswinkel und fester Maßstab aus `stil.json`, festes Licht. Die Figur wird gedreht, nicht die Kamera, damit das Licht in allen Richtungen von derselben Bildschirmseite kommt. Acht echte Richtungen, nichts gespiegelt, durchsichtiger Hintergrund. Der Fußpunkt ist der Ursprung des Modells und landet in jedem Bild auf demselben Bildpunkt.

**Schritt 8 – Export.** Siehe Abschnitt 4.

---

## 3. Technologieauswahl

Stand der Recherche: 20.11.2026, aus den offiziellen Preis-, Doku- und Lizenzseiten der Anbieter. Qualitätsaussagen sind Einschätzungen – es wurden keine Testmodelle erzeugt. Preise und Bedingungen ändern sich; vor dem ersten bezahlten Lauf werden sie noch einmal gegen die verlinkten Seiten geprüft. Keine Rechtsberatung.

### 3.1 Vergleich

| Dienst | Mehrere Ansichten | Getrennte Teile | Rig | Animation | Formate | Zugang | Preis je Modell etwa | Kommerzielle Nutzung |
|---|---|---|---|---|---|---|---|---|
| **Meshy** (Modell 7.1) | 1–4 Bilder | „Auto Split“, für 3D-Druck gedacht | Zwei- und Vierbeiner; Skelett wählbar (u. a. Mixamo, Rigify, Unreal) | große Bibliothek (Angriff, Parade, Zauber, Tod …), dazu Bewegung aus Text | GLB, FBX, OBJ, USDZ u. a. | API nur mit bezahltem Tarif (ab 20 $/Monat, 1 000 Credits) | 0,60 $ mit Textur | bezahlter Tarif: Ergebnis gehört dem Kunden; kostenloser Tarif: gehört Meshy, CC BY 4.0 |
| **Tripo** (v3.1 / P2) | 2–4 Ansichten | Teile-Erzeugung (nur ohne Textur), Segmentierung | acht Arten: Zweibeiner, Vierbeiner, Sechs-/Achtbeiner, Vogel, Schlange, Wasserwesen | 11 bzw. 101 Vorlagen für Zweibeiner, je ein Gang für andere | GLB, FBX | Guthaben im Voraus, 0,01 $ je Credit | 0,30–0,40 $ | laut Bedingungen für zahlende Nutzer; Stellung von Guthaben-Kunden nicht bestätigt; Recht: Hongkong |
| Rodin Gen-2.5 | 1–5 Bilder | nicht dokumentiert | nein | nein | GLB, FBX, USDZ | 120 $/Monat direkt oder über fal | 0,40 $ | über fal ja |
| Hunyuan 3D (Tencent Cloud / fal) | ja | Teile-Erzeugung | ja | nicht bestätigt | GLB u. a. | ja | 0,23–0,53 $ | über fal ja; bei Tencent nicht bestätigt |
| Stability (SF3D, SPAR3D) | nein | nein | nein | nein | GLB | ja | 0,04–0,10 $ | nach Stability-Bedingungen; nur für einfache Gegenstände |

Lokale Modelle scheiden vorerst aus, aus zwei Gründen:

- **Rechner:** Alle brauchen eine Grafikkarte mit 8 bis 29 GB Speicher; diese Umgebung hat keine.
- **Lizenz:** Hunyuan3D (alle offenen Fassungen, auch die Teile- und Bewegungsmodelle) gilt laut Lizenz nicht in der EU, im Vereinigten Königreich und in Südkorea – ausdrücklich auch für die erzeugten Ergebnisse. Für ein in Deutschland vertriebenes Spiel ist das ein Ausschluss. TRELLIS ist selbst frei, hängt aber an einer Bibliothek, die nur für Forschung erlaubt ist. Sauber wären nur TripoSG (ohne Textur) und UniRig fürs Rig, beide MIT – eine Möglichkeit, falls später ein Rechner mit Grafikkarte bereitsteht.

Quellen: docs.meshy.ai/en/api/pricing, …/rigging-and-animation, …/multi-image-to-3d, meshy.ai/terms-of-use · developers.tripo3d.com/en/pricing, …/docs/animations-rig.md, …/terms · fal.ai/hunyuan-3d · docs.stability.ai/pricing · Lizenzdateien der Projekte Hunyuan3D-2, TRELLIS, nvdiffrast, TripoSG, UniRig auf GitHub.

### 3.2 Entscheidung

**Erster Dienst: Meshy.** Die ganze Kette liegt in einer Schnittstelle: mehrere Ansichten, erzwungene A- oder T-Haltung, Zielwert für die Polygonzahl, Texturen, Rig. Ausschlaggebend ist, dass sich das Skelett bei der Bestellung wählen lässt. Mit einem bekannten Skelett kann die Fabrik in Blender über eine feste Knochenzuordnung eigene Animationen übertragen, statt je Figur Animationen zu kaufen. Die Eigentumsfrage ist im bezahlten Tarif klar geregelt.

**Zweiter Dienst: Tripo.** Für alles, was Meshy nicht riggt (Spinnen, Schlangen, Vögel, Wasserwesen), und für die Zerlegung in Teile. Je Modell günstiger, das Rig aber fünfmal so teuer. Vor produktiver Nutzung ist schriftlich zu klären, ob Guthaben-Kunden als zahlende Nutzer mit vollen Rechten gelten.

**Ohne Dienst: Blender.** Aufbereitung, Rig-Zuweisung als Rückfallweg (Rigify mit automatischer Gewichtung), Animationsübertragung, Rendern, Prüfung – alles lokal auf dem Prozessor und kostenlos.

Die Adapter in `fabrik/dienste/` haben dieselbe Schnittstelle; ein Wechsel des Dienstes ändert nichts an den Schritten danach.

### 3.3 Skelett und Animationen

- **Gemeinsames Humanoid-Skelett:** das der *Universal Animation Library* von Quaternius (CC0, zwei Pakete mit zusammen über 250 Bewegungen: Gehen, Laufen, Nahkampf mit Waffen, Treffer, Tod und mehr). Damit sind Skelett und Bewegungen frei von Lizenzfragen und dürfen im Repository liegen.
- **Weg einer Figur aufs Skelett:** Meshy liefert die Figur mit einem Skelett bekannter Bauart; die Fabrik ordnet dessen Knochen fest dem gemeinsamen Skelett zu und überträgt die Bewegungen mit einem eigenen kleinen Übertragungsskript (Drehungen kopieren, einbacken). Fertige Zusatzprogramme dafür gibt es, ihr Betrieb ohne Oberfläche ist aber nicht belegt.
- **Abdeckung der neun Pflichtanimationen:** Ruhe, Gehen, Laufen, Angriff, Treffer und Tod sind in der Bibliothek zu erwarten; Block, Ausweichen und Zaubern werden beim Einrichten in Phase 6 geprüft. Was fehlt, wird einmalig bei Meshy als Bewegung bestellt (wenige Cent) und in die Bibliothek aufgenommen – nicht je Figur.
- **Mixamo wird nicht eingebaut:** Es gibt keine offizielle Schnittstelle, automatischer Zugriff auf die Website ist vertraglich ungeklärt, und die Rohdateien dürfen nicht weitergegeben werden.
- **Kreaturen:** Rig über Meshy (Vierbeiner) oder Tripo (übrige Formen), Bewegungen aus deren Vorlagen. Das Angebot ist dünn (meist nur ein Gang); Angriff und Tod für Kreaturen bleiben absehbar ein Punkt für „manuelle Prüfung“ oder für Bewegung aus Text.

### 3.4 Kosten

Rechenbasis: Meshy 0,02 $ je Credit im kleinsten bezahlten Tarif, Tripo 0,01 $ je Credit.

| Posten | Meshy | Tripo |
|---|---|---|
| Figur: Modell mit Textur | 30 Credits | 30 Credits |
| Polygonzahl anpassen | 5 | 10 |
| Rig | 5 | 25 |
| **Figur gesamt** | **40 Credits ≈ 0,80 $** | **65 Credits ≈ 0,65 $** |
| acht Animationen vom Dienst (entfällt mit eigener Bibliothek) | +0,48 $ | +0,80 $ |
| **Ausrüstungsteil oder Gebäude** | 0,30–0,70 $ | 0,30–0,40 $ |

Mit zwei bis drei Versuchen je brauchbarer Figur (Annahme) liegt eine Figur bei etwa 1,50 bis 2,50 $. Fehlgeschlagene Aufträge werden erstattet, unbrauchbare Ergebnisse nicht. Für den Einstieg reicht der kleinste Meshy-Tarif: 20 $ im Monat, 1 000 Credits, das sind rund 25 Figuren oder der Krieger samt Ausrüstung mit reichlich Wiederholungen.

### 3.5 Was vor dem ersten bezahlten Lauf zu beachten ist

1. Meshy-Zugang muss ein **bezahlter** Tarif sein; im kostenlosen gehören die Ergebnisse Meshy.
2. Meshy löscht Ergebnisse der Schnittstelle nach drei Tagen – die Fabrik lädt sofort herunter und archiviert.
3. Meshy darf hochgeladene Inhalte zum Training verwenden; Widerspruch per E-Mail an den Support ist möglich.
4. Die Rechte an den Referenzbildern müssen bei euch liegen; beide Dienste geben die Haftung für Eingaben an den Kunden weiter.
5. Ob rein KI-erzeugte Modelle urheberrechtlich geschützt sind, ist unsicher. Die Fabrik hält die eigene Nachbearbeitung im Protokoll fest.
6. Der Schlüssel kommt nur als Umgebungsvariable (`MESHY_API_KEY`) in die Sitzung, nie in den Quellcode oder ins Repository.

---

## 4. Ausgabeformat und Anbindung an Phaser

### 4.1 Blätter

Je Animation ein Blatt: **Zeilen = Richtungen, Spalten = Bilder der Animation**, alle Felder gleich groß (Vorgabe 176 px wie bisher; große Gegner 300 px wie bei den heutigen Gruppenbildern).

| Zeile | Richtung | Winkel |
|---|---|---|
| 0 | Osten | 0 |
| 1 | Südosten | π/4 |
| 2 | Süden | π/2 |
| 3 | Südwesten | 3π/4 |
| 4 | Westen | π |
| 5 | Nordwesten | 5π/4 |
| 6 | Norden | 3π/2 |
| 7 | Nordosten | 7π/4 |

Zeile zu einem Winkel: `Math.round(winkel / (π/4)) mod 8`. In der schrägen Ansicht (Riss) muss der Client zuerst die Richtung am Bildschirm bilden – dort gilt `sx = cos − sin`, `sy = (cos + sin) / 2` – und daraus die Zeile wählen. Das steht in den Metadaten als Hinweis und wird in der Vorschau geprüft.

Dateien: PNG verlustfrei als Archiv im Asset-Ordner, WebP (Qualität 88, wie bisher) fürs Spiel.

### 4.2 Metadaten

```json
{
  "id": "held.krieger.torvald",
  "version": 3,
  "kategorie": "held",
  "feld": 176,
  "richtungen": ["o", "so", "s", "sw", "w", "nw", "n", "no"],
  "winkel0": "osten", "drehsinn": "im Uhrzeigersinn am Bildschirm (y nach unten)",
  "mass": [0.5, 0.946, 0.855],
  "animationen": {
    "ruhe":    { "blatt": "torvald.ruhe.webp",   "bilder": 6, "rate": 6,  "schleife": true },
    "laufen":  { "blatt": "torvald.laufen.webp", "bilder": 8, "rate": 11, "schleife": true },
    "angriff": { "blatt": "torvald.angriff.webp","bilder": 8, "rate": 20, "schleife": false, "treffer": 4 }
  },
  "plaetze": { "kopf": "ruestung.helm.stahl", "hand_r": "waffe.langschwert", "arm_l": "schild.grauwacht" },
  "ebenen": { "s": ["umhang", "koerper", "brust", "kopf", "hand_r", "arm_l"], "n": ["arm_l", "hand_r", "koerper", "brust", "kopf", "umhang"] }
}
```

`mass` ist dieselbe Dreiergruppe wie heute `laufMass` in `config.ts` – eine neue Figur lässt sich also ohne Umbau des Clients einsetzen, sobald dieser Zeilen statt Spiegelung kennt.

### 4.3 Ausrüstung als Ebenen

Jedes Ausrüstungsteil wird mit demselben Skelett, denselben Animationen, derselben Kamera gerendert – aber allein, der Körper dient nur als unsichtbare Verdeckung (er schneidet aus dem Helm heraus, was der Kopf verdeckt). Ergebnis: Blätter mit denselben Feldern wie der Körper, die der Client deckungsgleich übereinanderlegt. Die Reihenfolge der Ebenen hängt von der Richtung ab (Schild vor dem Körper bei Blick nach Süden, dahinter bei Blick nach Norden) und steht je Richtung in den Metadaten.

Grenze dieses Verfahrens: Verdeckung zwischen zwei Ausrüstungsteilen (Umhang hinter Schulterplatten) lässt sich nur über die Ebenenreihenfolge lösen, nicht bildpunktgenau. Für die genannten Plätze reicht das; Sonderfälle werden in der Prüfung als Einschränkung gemeldet.

### 4.4 Speicherbedarf

Acht Richtungen kosten das Achtfache der heutigen Blätter. Ein Blatt mit 8 × 8 Feldern zu 176 px ist 1408 × 1408 px und belegt entpackt rund 8 MB Grafikspeicher. Neun Animationen: etwa 70 MB je Figur; mit sechs Ausrüstungsebenen ein Mehrfaches. Für Handys ist das zu viel. Gegenmaßnahmen, in dieser Reihenfolge:

1. Bilder auf den Inhalt beschneiden und dicht packen (Phaser-Atlas mit Beschnittangaben) – spart erfahrungsgemäß mehr als die Hälfte.
2. Nur laden, was im Kampf vorkommt (gewählter Held, angelegte Ausrüstung).
3. Ebenen beim Ausrüstungswechsel einmalig im Client zu einem Blatt je Animation zusammensetzen – danach kostet eine ausgerüstete Figur so viel wie eine ohne Ebenen und nur einen Zeichenaufruf.
4. Bildzahl je Animation nach Bedarf (Ruhe 4–6, Laufen 8).

Die Fabrik misst den Bedarf je Asset und schreibt ihn in den Prüfbericht.

### 4.5 Änderung am Spiel (später, getrennt)

Nötig ist nur eine Client-Änderung in `main.ts`/`ort.ts`/`dorf.ts`/`stadt.ts`: Figuren mit Richtungsblättern wählen die Zeile, Figuren ohne sie werden wie bisher gespiegelt. Bestehende Figuren bleiben unberührt. Diese Änderung gehört nicht in die jetzige Phase; bis dahin läuft alles in der Vorschau der Fabrik.

---

## 5. Ausrüstung: Ablauf am Beispiel Stahlhelm

1. Bild des Helms → Modell (Schritt 2, Kategorie `ruestung.helm`).
2. Aufbereiten (Schritt 3).
3. Größe und Lage: Der Helm wird auf die Kopfmaße des Grundkörpers skaliert und am Befestigungspunkt „Kopf“ ausgerichtet. Erste Näherung automatisch über die Hüllmaße; Feinlage über Abstand zur Kopfoberfläche (darf nirgends eindringen, höchstens 2 cm abstehen).
4. Befestigungspunkt und Platz in `asset.json` eintragen.
5. Prüfung am Rig: alle Animationen durchspielen, Eindringen in Kopf und Schultern messen.
6. Rendern in acht Richtungen für alle Animationen des Profils, Körper als Verdeckung.
7. Export der Ebenenblätter mit denselben Feldern wie der Körper.
8. Eintrag ins Register; die Vorschau zeigt das Teil sofort als wählbare Ausrüstung.

Brustpanzer, Handschuhe, Stiefel und Umhang laufen genauso, mit dem Unterschied, dass sie sich verformen: Sie werden an den Grundkörper angelegt und übernehmen dessen Gewichte. Waffen und Schilde sind starr wie der Helm.

Es wird nie für eine Kombination ein neues Gesamtmodell gebraucht.

---

## 6. Qualitätskontrolle

Jede Prüfung liefert Messwert, Grenzwert und Urteil. Aus den Einzelurteilen ergibt sich der Status des Assets.

| Bereich | Prüfung | Messung | automatisch behebbar |
|---|---|---|---|
| Modell | vollständig | ein Hauptkörper, keine Löcher über Grenzgröße, Pflichtteile der Kategorie vorhanden | lose Splitter entfernen |
| Modell | Proportionen | Höhen-/Breitenverhältnis gegen Kategorie und gegen Silhouette des Referenzbilds (Deckung in der Vorderansicht) | nein → manuell |
| Modell | Materialien | jedes Teil hat Material und Farbtextur, Bilddateien vorhanden, Auflösung ≥ Mindestwert | nein |
| Modell | Geometrie | doppelte Punkte, umgedrehte Flächen, nicht geschlossene Kanten | ja |
| Modell | Polygonzahl | gegen Budget der Kategorie | ja (Reduktion) |
| Rig | Skelett | alle Pflichtknochen und Befestigungspunkte vorhanden | ja (neu zuweisen) |
| Rig | Gewichte | kein Punkt ohne Gewicht, Summe 1, höchstens 4 Knochen je Punkt | ja |
| Rig | Verformung | Prüfposen (Arme hoch, Hocke, Drehung): Flächendehnung und Volumenverlust je Gelenk | zweiter Gewichtungsversuch |
| Rig | Ausrüstung | Abstand zum Befestigungspunkt über alle Bilder konstant; Eindringtiefe | Lage nachführen |
| Animation | vollständig | alle Animationen des Profils vorhanden, Länge > 0 | nein |
| Animation | Fußpunkt | Standfuß bewegt sich im Kontakt < Grenzwert; Ursprung driftet nicht | ja (Füße festhalten, Drift entfernen) |
| Animation | Waffe | Abstand Waffe–Hand konstant | ja |
| Animation | Schleife | erstes und letztes Bild passen zusammen | ja |
| Bild | Richtungen | 8 Zeilen, keine zwei Zeilen spiegelgleich | nein |
| Bild | Hintergrund | Ecken und Rand vollständig durchsichtig | nein |
| Bild | Felder | alle Bilder gleich groß, Figur berührt keinen Feldrand | ja (Maßstab/Feld anpassen, neu rendern) |
| Bild | Fußpunkt | Bodenlinie in allen Bildern auf derselben Höhe (±1 px) | ja |
| Bild | Bilder | Anzahl stimmt mit Metadaten, kein leeres Bild | nein |
| Bild | Ebenen | Ausrüstungsblatt deckungsgleich mit Körperblatt | ja |

Status:

- **erfolgreich** – alle Prüfungen bestanden.
- **erfolgreich mit Einschränkungen** – nur Warnungen (z. B. Polygonzahl knapp über Budget, eine Animation des Profils fehlt und ist als wahlfrei markiert); die Einschränkungen stehen im Bericht.
- **fehlerhaft** – mindestens eine harte Prüfung nicht bestanden, auch nach Korrekturversuch. Das Asset kommt in `assets/fehlerliste.json` und kann nicht veröffentlicht werden.
- **manuelle Prüfung erforderlich** – die Fabrik kann es nicht selbst beurteilen (Ähnlichkeit zur Vorlage unter Schwelle, Teile durch Schneiden getrennt, Rig nur im zweiten Versuch). Der Bericht nennt genau, worauf zu schauen ist, mit Bildern.

Korrekturen laufen höchstens zweimal je Prüfung; jede Korrektur steht im Protokoll. Der Bericht entsteht als `bericht.json` und als lesbare Seite mit Kontaktbogen (alle Richtungen, alle Animationen).

---

## 7. Stilstandard

Eine Datei `standard/stil.json`, an die sich Rendern und Prüfung halten. Erste Fassung der Werte; sie wird in Phase 7 an einer Testfigur neben den heutigen Figuren abgestimmt.

| Bereich | Vorgabe (Startwert) |
|---|---|
| Proportionen | Humanoid 1,80 m, leicht heldenhaft: Kopf etwa 1/7 der Höhe, kräftige Hände und Waffen, damit die Figur bei 84 px Höhe am Bildschirm lesbar bleibt |
| Polygon-Budget | Held 20 000–40 000 Dreiecke, Ausrüstungsteil 2 000–8 000, Gebäude bis 60 000 (es wird nur gerendert, nie in Echtzeit gezeichnet – das Budget dient der Verarbeitungszeit und sauberen Gewichtung) |
| Materialien | Farbtextur als Träger des Aussehens, matte Oberflächen, Metall nur gedämpft glänzend; keine spiegelnden Effekte |
| Farben | Palette aus den vorhandenen Bildern abgeleitet (gedeckte Erdtöne, Stahlblau, Gold als Akzent; Violett bleibt dem Riss vorbehalten) |
| Licht | Hauptlicht von oben links vorn (am Bildschirm), weiches Fülllicht, schwaches Randlicht; kein gerenderter Schlagschatten – den Bodenschatten zeichnet das Spiel |
| Kamera | orthografisch, Neigung als ein Wert für alle Assets; Startwert 35° über der Waagerechten (Mittel aus schräger Rissansicht 30° und Kampfkarten etwa 38°) |
| Auflösung | Feld 176 px, Figur etwa 150 px hoch; intern doppelt gerendert und verkleinert |
| Kontur und Oberfläche | dunkle, leicht farbige Außenkontur von etwa 1,5 px; leichte Farbstufung und Weichzeichnung im Nachgang, damit das Bild gemalt statt gerendert wirkt |

Ehrliche Einschätzung: Ein gerendertes Modell erreicht die Wirkung der heutigen gemalten Figuren nicht von selbst. Die handgemalte Anmutung hängt vor allem an der Textur des Modells (deshalb zählt die Texturqualität bei der Auswahl des Dienstes) und an der Nachbearbeitung. Ob das Ergebnis neben den bestehenden Figuren besteht, zeigt der Durchlauf mit dem Krieger in Phase 10; das ist die wichtigste offene Frage des ganzen Vorhabens.

Die heutigen CC0-Modelle und Platzhalter sind nur technische Hilfsmittel und gehen in keinen Stilwert ein.

---

## 8. Asset-Verwaltung

`assets/register.json` führt alle Assets; die Einzelheiten stehen in `assets/<id>/asset.json`.

| Feld | Inhalt |
|---|---|
| `id` | sprechend und dauerhaft: `held.krieger.torvald`, `ruestung.helm.stahl`, `gegner.moorleiche`, `bau.taverne` |
| `name`, `kategorie` | Anzeigename, Kategorie aus `kategorien.json` |
| `referenz` | Dateien mit Prüfsumme |
| `verfahren` | Dienst, Modellversion des Dienstes, Auftragsnummer, Einstellungen, Kosten |
| `lizenz` | Herkunft und Nutzungsrecht je Bestandteil (Modell, Rig, Animationen), mit Tarif zum Zeitpunkt der Erzeugung |
| `version` | laufende Nummer; `aktuell` zeigt auf die veröffentlichte Version |
| `textur`, `rig`, `animationen` | Auflösung und Karten; Rig-Profil und Skelettversion; Liste mit Quelle je Animation |
| `export` | Dateien mit Prüfsumme |
| `status` | einer der vier Qualitätsstände, mit Verweis auf den Bericht |

Regeln:

- Ein Versionsordner wird nach Abschluss nie mehr verändert. Jede Änderung erzeugt `v00N+1`. Originale (Referenz, Antwort des Dienstes) werden nie überschrieben.
- Das Spiel verweist auf die ID, nicht auf eine Version. Veröffentlichen kopiert die Exportdateien einer geprüften Version an den festen Ort im Spiel; eine neue Version ersetzt die Dateien, die ID bleibt.
- `protokoll.jsonl` hält je Schritt fest: Zeit, Eingaben mit Prüfsumme, Werkzeugversion, Ergebnis, Kosten.
- Große Quelldateien (GLB, Blender-Dateien, PNG-Archive) gehören nicht ins normale Git; Vorschlag: Git LFS oder ein Ablageort außerhalb des Repositorys (Frage 5).

---

## 9. Vorschau und Kontrolle

Eine eigene Seite `fabrik/vorschau/` (Phaser 3.90, TypeScript, esbuild – derselbe Aufbau wie der Client, aber getrennt gebaut und nicht Teil des ausgelieferten Spiels):

- Liste aller Assets mit Status, Version und Verweis auf den Prüfbericht (Produktionsstatus).
- Figur in allen acht Richtungen, einzeln und als Rundumansicht; Animationen abspielen, anhalten, Bild für Bild.
- Ausrüstung wechseln, Ebenen ein- und ausblenden, Kombinationen durchschalten.
- Fußpunkt und Bodenlinie als Hilfslinien, Feldrahmen, Maßvergleich neben einer bestehenden Figur.
- Zwei Hintergründe: schräge Rissansicht und flache Kampfkarte, damit die Richtungswahl in beiden stimmt.
- Rohansicht der exportierten Blätter.
- 3D-Ansicht des Modells: die GLB aus `arbeit/` in einem kleinen Betrachter (three.js, nur in der Vorschau), mit ein- und ausblendbaren Teilen.

---

## 10. Phasen, Abnahme und offene Punkte

| Phase | Inhalt | Abnahme | braucht |
|---|---|---|---|
| 1 | Analyse | dieses Dokument, Abschnitt 1 | – |
| 2 | Auswahl und Plan | dieses Dokument | – |
| 3 | Bild-zu-3D-Ablauf | Adapter mit Probelauf ohne Kosten (aufgezeichnete Antworten); echter Aufruf erst nach Freigabe | Schlüssel, Budget |
| 4 | Import, Prüfung, Aufbereitung | läuft an freien Testmodellen durch, Bericht entsteht | – |
| 5 | Teile und Rig | Testmodell bekommt das Humanoid-Skelett, Prüfposen bestehen | – |
| 6 | Animationen | neun Animationen auf dem Skelett, Fußpunkt-Prüfung besteht | – |
| 7 | Acht Richtungen | Blätter einer Testfigur, Bildprüfung besteht | – |
| 8 | Export | Blätter und Metadaten laden in Phaser | – |
| 9 | Prüfung und Vorschau | Vorschau zeigt Figur, Ausrüstung, Status | – |
| 10 | Durchlauf Krieger | aus einem Referenzbild bis in die Vorschau, ohne Handarbeit am Modell | Schlüssel, Budget, Referenzbild |

Die Phasen 4 bis 9 lassen sich vollständig ohne Kosten bauen und prüfen, mit einem frei lizenzierten, bereits geriggten Modell als Platzhalter. Schlüssel und Budget werden erst für Phase 3 (echter Aufruf) und Phase 10 gebraucht.

### Grenzen, die schon jetzt feststehen

- **Verschmolzene Modelle.** Bild-zu-3D-Dienste liefern in der Regel ein Stück. Sauber getrennte Ausrüstung entsteht verlässlich nur, wenn Grundkörper und Ausrüstung getrennt erzeugt werden. Für den Krieger heißt das: ein Bild des Körpers in schlichter Kleidung und je ein Bild für Helm, Brustpanzer, Schild, Schwert – oder die Fabrik erzeugt diese Einzelbilder aus dem Gesamtbild (zusätzlicher Bildschritt, zusätzliche Abweichung von der Vorlage).
- **Eine Ansicht reicht selten.** Aus einem Frontbild erfindet der Dienst die Rückseite. Für Helden sind vier Ansichten in neutraler Haltung (Arme leicht abgespreizt) die richtige Vorlage.
- **Automatisches Rig gelingt bei Humanoiden meist, bei Umhängen, langen Röcken, Schwänzen und Flügeln oft nicht.** Solche Assets enden absehbar bei „manuelle Prüfung“.
- **Kreaturen brauchen eigene Animationen.** Für Vierbeiner und Sonderformen gibt es keine wiederverwendbare Bibliothek in der Breite wie für Humanoide.
- **Rechenzeit.** Ein Held mit neun Animationen, acht Richtungen und acht Bildern sind 576 Bilder je Ebene; auf dieser Maschine ohne Grafikkarte etwa 20 bis 40 Minuten je Ebene.

### Fragen an dich

1. **Wo liegt die bisherige Character Pipeline** (Blender-Skripte, Warrior-Grundrig, acht Richtungen, Charaktervorschau)? Im Repository ist sie nicht. Wenn es sie gibt: bitte hochladen, dann baue ich darauf auf. Wenn nicht: Ich baue Rig und Rendering wie oben beschrieben neu.
2. **Dienst und Budget.** Empfehlung: Meshy im kleinsten bezahlten Tarif (20 $/Monat). Wenn du einverstanden bist: Zugang anlegen und den Schlüssel als Umgebungsvariable `MESHY_API_KEY` für die Sitzung hinterlegen, dazu eine Obergrenze je Lauf nennen. Bis dahin entsteht alles ohne Kosten.
3. **Referenzbilder für den Krieger.** Vorhanden ist `img/figuren/schildwaechter.jpg` (Torvald). Für ein gutes Ergebnis wären vier Ansichten in neutraler Haltung besser; soll ich mit dem vorhandenen Bild beginnen?
4. **Ort des Quellcodes.** Der Client-Quellcode liegt nur auf `feature/realtime-engine`, mein Arbeitszweig geht von `main` ab. Vorschlag: Die Fabrik kommt als eigenständiger Ordner `fabrik/` auf den Arbeitszweig und berührt das Spiel nicht.
5. **Ablage großer Dateien:** Git LFS oder außerhalb des Repositorys?
