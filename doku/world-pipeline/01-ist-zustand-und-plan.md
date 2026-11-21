# World Pipeline – Phase 1: Ist-Zustand und Integrationsplan

Stand: 20.11.2026. Grundlage: Zweig `feature/realtime-engine` (Commit `4b49866`), dort liegt der Quelltext der Echtzeit-Engine.
In dieser Phase wurde nichts am Spiel geändert. Dieses Dokument ist das einzige Ergebnis.

Geprüfter Ausgangszustand (in einer getrennten Kopie):

- `npx tsc --noEmit`: ohne Fehler.
- `node build.mjs`: erzeugt `echtzeit/spiel.js` bytegleich zur ausgelieferten Datei.
- `test/waldweg.test.mjs`, `test/stufe.test.mjs`: bestanden.
- `test/sim.test.mjs`: Simulations- und Serverteil bestanden; der Browserteil bricht ab, weil er `node tools/testserver.js` auf Port 8765 braucht (nicht gestartet, kein Fehler im Spiel).
- Nicht ausgeführt: `koop`, `server-kampf`, `konto`, `handy` (brauchen Testserver und nachgebildete Supabase).

---

## Teil A – Ist-Zustand

### A1. Wo der Code liegt

| Zweig | Inhalt |
|---|---|
| `feature/realtime-engine` | Quelltext: `realtime/client/src`, `realtime/shared`, `realtime/server/src`, `realtime/werkzeug`, Tests. Render baut den Server aus diesem Zweig. |
| `main` | Nur das Gebaute: `echtzeit/` (GitHub Pages), `realtime/server/dist/server.js`, Bilder, Migrationen. Kein TypeScript-Quelltext. |
| `claude/mythara-world-pipeline-z4ynx5` | Arbeitszweig dieser Aufgabe. Zeigt derzeit auf `main`, enthält also **keinen Quelltext**. |

Beide Zweige tragen parallele Commits ohne Merge; das Gebaute wird offenbar von Hand nach `main` übernommen. Es gibt keine CI.
Folge: Ab Phase 2 muss der Arbeitszweig den Quelltext von `feature/realtime-engine` enthalten (siehe Entscheidung E1).

Der Build läuft in `realtime/`: `node build.mjs` (esbuild) schreibt den Client nach `../echtzeit/`, den Server nach `server/dist/server.js` und ein Testbündel nach `test/sim.gebaut.mjs`.

### A2. Raster, Maße und Perspektive

Es gibt kein einheitliches Raster. Im Umlauf sind:

| Bereich | Raster | Projektion | Heldenhöhe |
|---|---|---|---|
| Kampagnenkampf, Waldweg (`Spiel`, „flach“) | Rechenfeld 48 px, gemaltes Feld 96 px (`FEIN = 2`) | orthogonal: `x * 48, y * 48` | 84 px |
| Gemalte Orte Weidenhain, Rabenmoor (`Ort`) | Weltpixel des Bildes, Gehraster 16 px | Schräge nur über Tempo: senkrecht mal 0,62 | 108 px |
| Waldmark (`Stadt`) | Vorlagenpixel 1671 × 941, Gehraster 14 px | wie Ort, 0,62 | 112 px |
| Riss-Dungeon, altes Dorf | Iso-Raute 64 × 32 | echtes 2:1-Iso | – |
| Baukasten-Ort (Versuch) | Gehraster 20 px | Boden 45° gedreht, 0,62 gestaucht | 112 px |

„Isometrisch“ (README) trifft nur auf Riss und altes Dorf zu. Die Regel „96-px-Kachel = 2 × 2 Rechenfelder zu 48 px“ aus der Aufgabenstellung stimmt für Kampf und Waldweg (`main.ts:29`, `shared/karten.ts:38`).

### A3. Karten laden

- **Kampfkarten** stehen als Textzeilen in `shared/karten.ts` (`KARTEN`): `.` frei, `~` Wasser, alles andere Hindernis. Dazu Startpunkte, Gegnerlager (`lager`), Sondermechaniken (`schleuse`, `probe`, `schuetz`). Größen: 24 × 18 bis 32 × 18 Rechenfelder.
- **Waldweg**: 80 × 36 Rechenfelder, erzeugt von `werkzeug/waldweg.py` nach `shared/waldweg.ts`. Enthält zusätzlich `deko` (175 Bäume mit Fußpunkt und Maßstab), `dekoBilder`, `ausgaenge`, `aggro`, `leine`. Das ist die größte Karte, die es heute gibt.
- **Gemalte Orte**: JSON aus `werkzeug/ortbild.py` (`weidenhain.json`, `rabenmoor.json`): ein Gesamtbild, Gehraster als Zeilen, `leute`, `stellen`, `vorn`-Vielecke für Verdeckung.
- **Waldmark**: vollständig als Konstanten im Code (`stadt.ts`).
- Alle Karten und JSON-Dateien sind statisch ins Bündel gepackt. Nachladen zur Laufzeit gibt es nicht.

### A4. Simulation, Kollision, Wegefindung (`shared/`)

- Der Kartenzustand ist modulglobal (`KB`, `KH`, `FELS`, `WASSER`, `START`, `LAGER` …). Jede `Sim` sichert ihn als `KartenStand` und setzt ihn vor jedem Aufruf wieder ein (`karteNehmen`). Das funktioniert, weil Node nacheinander rechnet; es verbietet jedes `await` innerhalb eines Sim-Schritts.
- Kollision: dichtes `Uint8Array(KB * KH)`; `fels()` meldet alles außerhalb der Karte als gesperrt; `schieben()` schiebt Kreise aus 3 × 3 Nachbarfeldern.
- Wegsuche: A* über acht Richtungen ohne Eckenschneiden, mit Glättung. Je Aufruf vier Arrays der Größe `KB * KH`, offene Liste linear durchsucht; `naechstFrei` durchsucht das ganze Raster und läuft zweimal je Wegsuche.
- Monster: `aggro` und `leine` je Karte (Grundwerte 5,5 und 10), Gruppen wecken sich gegenseitig. Alle Monster werden immer gerechnet, Paartrennung ist O(n²). Kein Respawn.
- Sieg: sobald alle Monster besiegt sind – auch auf dem Waldweg, obwohl er eine Strecke ist.

Alles ist auf kleine, begrenzte Karten ausgelegt. Für 80 × 36 reicht es nachweislich; darüber ist nichts getestet.

### A5. Darstellung im Client

- **Szenen**: `Spiel` (Riss, Kampf, Waldweg), `Stadt` (Waldmark), `Ort` (Weidenhain, Rabenmoor), `Dorf` (alt). Die Szenenliste entsteht einmalig aus URL-Parametern (`main.ts:361`).
- **Wechsel**: Nur Waldmark → Riss ist ein Phaser-Szenenwechsel. Alles andere ist ein volles Neuladen der Seite (`location.href = "?ort=…&kampf=…"`). Zustand liegt in `localStorage`.
- **Boden**: überall ein einzelnes großes Bild (bis 3968 × 1984). Keine Tilemap, kein Atlas, kein Nachladen, kein Entladen, kein Culling.
- **Objekte und Tiefe**: Waldweg-Bäume als Einzelbilder mit Fußpunkt als Ursprung, Tiefe `10 + y * 20`. In Ort und Stadt ist die Tiefe die y-Koordinate des Fußpunkts; Verdeckung über `vorn`-Ausschnitte aus dem Bodenbild.
- **Transparenz hinter Bäumen** (nur Waldweg, nur eigener Held): Rechtecktest gegen alle Bäume in jedem Bild, Alpha gleitet auf 0,42 (`main.ts:327`).
- **Figuren**: einreihige Blätter mit 176-px-Feldern, nur links/rechts gespiegelt; Fußanker und Maß aus `shared/config.ts`. Dorfleute 240 px.
- **Kamera**: von Hand nachgeführt, Grenzen gleich Kartengröße, Zoomstufen 0,8 bis 1,2 (`zoom.ts`). Mobil: Steuerknüppel als DOM-Element, Tipp = dorthin gehen.
- **Minikarte**: DOM-Element mit dem Gesamtbild des Ortes als Hintergrund.

### A6. Server, Koop, Speicherung

- **Server**: ein Node-Prozess, eine Schleife mit 20 Schritten je Sekunde, höchstens 40 Verbindungen. Jede Kampfverbindung hat eine eigene `Sim`; Koop-Mitspieler hängen an der Sim des Anführers (höchstens drei Helden).
- **Zustand**: 20-mal je Sekunde ein voller Schnappschuss als JSON mit allen lebenden Wesen der Karte. Kein Delta, kein Filter nach Entfernung.
- **Serverautoritativ** ist heute nur der Kampf (einschließlich Waldweg): Bewegung, Treffer, Schaden, Beute.
- **Nicht serverautoritativ**: Laufen in Waldmark und Dörfern, Dialoge, Quest-Merker, Türen, Ausgänge der Strecke. Im Koop-Dorf reicht der Server Positionen und Merker nur weiter.
- **Koop-Räume**: sechsstelliger Code, nur im Arbeitsspeicher des Servers. Der Render-Dienst (kostenloser Tarif) schläft ein und verliert dann alles.
- **Speicherung** (Supabase):
  - Der Server schreibt Erfahrung, Seelensplitter und Siege (`rpg_echtzeit_gutschrift`, `rpg_echtzeit_sieg`, Migrationen 035/036).
  - Der Client spiegelt den Questfortschritt als ein JSON-Objekt (`rpg_echtzeit_stand`, höchstens 60 000 Byte).
  - Einladungen laufen über Migration 037.
- **Ohne Server** rechnet der Browser dieselbe `Sim` selbst (`netz.ts`, `lokal()`).

### A7. Werkzeuge

Alle in `realtime/werkzeug/`, von Hand aufgerufen, nicht Teil des Builds:

- `waldweg.py`: erzeugt eine ganze Strecke regelbasiert (Wegkurve, Lichtung, Bäume mit Abstandsregeln, fester Zufallsstartwert) samt Bodenbild, Gehraster und Objektliste. **Das ist bereits ein kleiner Weltgenerator.**
- `gelaende.py`: setzt Boden aus Kacheln zusammen und rechnet Übergänge (Erde franst ins Gras, Pflaster endet in ganzen Steinen, Ufer als gemalter Streifen).
- `ortbild.py`: macht ein gemaltes Gesamtbild begehbar (handvermessene Vielecke).
- `bau.py`, `blatt.py`, `gegner.py`: stellen Gebäude und Figuren frei.
- `tools/karten-pruefen.js`: prüft die alten Würfelspiel-Karten auf Erreichbarkeit.

Es gibt keinen Editor, kein Chunk-Format und keine Prüfung für die Echtzeit-Welt.

### A8. Assets

**Wiederverwendbar (modular):**

| Kategorie | Bestand |
|---|---|
| Gelände | Wiese, Wiese mit Blumen, Erde, Pflaster (je 1254 × 1254, kachelbar, in `werkzeug/boden/`) |
| Wasser | Wasser, ruhiges Wasser |
| Übergänge | Uferstreifen (genutzt); vier gemalte Randkacheln (ungenutzt); sonst gerechnet |
| Bewuchs | `baum1`–`baum6` (Waldweg, gerendert), `baum`, `tanne` (mit Iso-Steinsockel) |
| Gebäude | Taverne, Heldenhalle, Stadttor, Händler, Riss-Tor, zwei Hausreihen – alle als Iso-Bilder mit eigenem Pflastersockel |
| Kleinteile | Zaun (zwei Richtungen), Brunnen, Kornsack, Fackel, Rune |

**Nicht modular:** Waldmark, Weidenhain und Rabenmoor existieren nur als gemalte Gesamtbilder.

**Herkunft** (`img/welt/QUELLEN.md`): Bäume 1–4 „vermutlich CC-BY 3.0 (zu bestätigen)“; Bäume 5–6 und mehrere Bodentexturen „offen – zu klären“; Felsen und Büsche CC0.

### A9. Lore und Geografie

- Kette von Süd nach Nord laut `LORE-MYTHARA.md` §5: Rabenmoor (Sandinsel im Schwarzmoor) – Weidenhain (Nordrand des Moors) – Graufurt – Halmbruck und Abtei Grauwacht – Hochwarte – Kaltbrunn – Veyrholm.
- Kampagnenreihenfolge: Weidenhain → Rabenmoor → Graufurt → Grauwacht → Hochwacht → Krone.
- Rabenmoor: zwanzig Häuser auf einer Sandinsel, Torfstapel, Netze, ein Bohlendamm als einzige Straße; einen halben Tag südlich von Weidenhain.
- Die Waldmark kommt in keiner Lore-Datei vor, nur im Echtzeit-Code („Die Zuflucht der Wanderer“).

**Widersprüche:**

1. Auf der Weltkarte im Spiel (`weltkarte.ts`) liegt Graufurt südlich von Weidenhain; laut Lore liegt es nördlich.
2. Der Waldweg führt von der Waldmark nach Osten („links die Waldmark, rechts Weidenhain“); auf der Weltkarte liegt Weidenhain nordwestlich der Waldmark.
3. Die Aufgabenstellung nennt die Waldmark „Heimatdorf“ mit dem Schwarzmoor im Süden; die Lage der Waldmark zur Kette ist nirgends festgelegt.

---

## Teil B – Bewertung der vorgeschlagenen Eckwerte

| Vorgabe | Befund | Empfehlung |
|---|---|---|
| 96-px-Kachel = 2 × 2 Rechenfelder zu 48 px | stimmt mit Kampf und Waldweg überein | übernehmen |
| Chunk 32 × 32 „logische Geländekacheln“ | Bei 96-px-Kacheln wären das 3072 × 3072 px je Chunk; neun aktive Chunks belegen dann rund 340 MB Grafikspeicher – zu viel für Mobilgeräte | **Chunk = 32 × 32 Rechenfelder** = 16 × 16 Geländekacheln = 1536 × 1536 px (neun Chunks rund 85 MB) |
| 3 × 3 aktive Chunks plus Vorladering | 3 × 3 deckt 4608 px; auf großen Bildschirmen bei Zoom 0,8 knapp zu wenig | Aktiv ist, was Sichtfeld plus ein Chunk Rand schneidet (meist 3 × 3); im Vorladering nur Daten und Bilddatei, noch keine Textur |
| Perspektive nicht ändern | Die offene Strecke (Waldweg) ist orthogonaler Boden mit schräg gemalten Objekten | Die Welt übernimmt genau das Waldweg-Muster; kein Iso |

---

## Teil C – Integrationsplan

### C1. Leitlinien

1. **Der Waldweg ist das Vorbild.** Die Welt verallgemeinert sein Muster (48-px-Rechenfelder, gemalter Boden, Objekte mit Fußpunkt, Tiefe nach y, Server-Sim mit Aggro und Leine), statt ein neues einzuführen.
2. **Additiv.** Neue Szene `Welt` mit eigenem Schalter (`?welt=<region>`), neue Dateien unter `shared/welt/`, `client/src/welt/`, `werkzeug/welt/`. `Spiel`, `Ort`, `Stadt`, alle Kampfkarten und das Protokoll der Kämpfe bleiben unverändert.
3. **Eine Quelle, zwei Ausgaben.** Regionsdaten liegen als JSON im Repository. Daraus entstehen (a) Chunk-Dateien für den Client und (b) Gehraster und Platzierungen für die Simulation. Server und Browser rechnen mit denselben Daten.
4. **Boden wird vorab gebacken.** Wie heute bei `waldweg.py` und `gelaende.py` rechnet ein Werkzeug aus Geländekarte und Kacheln je Chunk ein Bodenbild (WebP). Das vermeidet Kachelgrenzen und Wiederholungsmuster und hält die Zahl der Zeichenaufrufe klein.

### C2. Datenmodell (Phase 2)

```
realtime/welt/
  bibliothek/gelaende.json        Geländearten, Kachelquellen, Übergangsregeln, begehbar ja/nein
  bibliothek/objekte.json         Objektbibliothek (ID, Bild, Anker, Kollision, Tiefe, Interaktion …)
  regionen/<region>/region.json   Name, Größe in Chunks, Nachbarn, Übergänge, Musik, Licht
  regionen/<region>/gelaende.png  Geländekarte, ein Bildpunkt je Rechenfeld (Index = Geländeart)
  regionen/<region>/objekte.json  Platzierungen: Objekt-ID, x, y, Maßstab, Spiegelung, eigene Kennung
  regionen/<region>/spiel.json    NPCs, Spawnzonen, Interaktionen, Ausgänge, Kollisionskorrekturen
```

Die zwölf logischen Ebenen der Aufgabenstellung werden so abgebildet:

| Ebene | Umsetzung |
|---|---|
| Ground, Ground_Detail, Paths, Water | Geländekarte → gebackenes Bodenbild je Chunk |
| Objects_Back, Entities, Objects_Front | eine nach Fußpunkt sortierte Ebene (wie heute); „immer vorn/hinten“ als Eigenschaft des Objekts |
| Collision | Gehraster je Chunk, erzeugt aus Gelände + Objektkollision + Handkorrektur |
| Interaction, Spawn_Zones, Region_Borders | `spiel.json` und `region.json` |
| Ambient_Effects | Eigenschaft von Objekt oder Region (Feuer, Nebel, Glühwürmchen) |

Objektschema wie in der Aufgabenstellung vorgeschlagen, ergänzt um `massstab` (Bezug: Held 84 px), `herkunft` (Lizenz) und `zustaende` für Gebäude. Kollisionsformen: Kreis, Rechteck, Vieleck – beim Bauen ins 48-px-Gehraster gerastert, damit A* und `schieben` unverändert bleiben.

### C3. Asset-Standard und Bibliothek (Phasen 3 und 4)

- Maßstab: 48 px = 1 Rechenfeld, Held 84 px hoch; Objekte in der Projektion des Waldwegs (Ansicht von schräg oben, Boden orthogonal).
- Format WebP, transparenter Hintergrund, kein eigener Sockel, kein eingebackener Schatten außerhalb der Standfläche.
- Anker = Fußpunkt, relativ (0–1). Benennung `kategorie_name_variante_nn`.
- Jedes Asset steht in `objekte.json` mit Kategorie, Maß, Anker, Kollision, Herkunft.
- Ein Katalogwerkzeug liest alle Bilder, prüft Maße, Transparenz und Anker und erzeugt eine Übersichtsseite.

Die Waldmark-Gebäude (Iso mit Sockel) passen nicht in diesen Standard. Sie bleiben, wo sie sind; die Welt braucht eigene Gebäude (Lückenliste in C8).

### C4. Chunk-System (Phase 5)

**Gemeinsam (`shared/welt/`):**
- `WeltRaster`: Gehraster aus Chunks, gleiche Abfragen wie heute (`fels`, `begehbar`, `frei`, `schieben`, `weg`).
- Die bestehende `shared/karte.ts` bleibt unverändert; die Welt bekommt ihr eigenes Raster. Dafür nötig:
  - Wegsuche mit Suchfenster und Halde statt ganzer Karte,
  - `naechstFrei` als Ringsuche.

**Client (`client/src/welt/`):**
- Szene `Welt`: lädt Chunks nach Sichtfeld, lädt den Ring dahinter vor, entlädt mit Abstand (Texturen freigeben).
- Objekte nur in aktiven Chunks; Tiefe relativ zur Kamera, damit feste Tiefen der Anzeige nicht kollidieren.
- Transparenz hinter Bäumen nur gegen Objekte der Nachbar-Chunks.
- Zoom, Steuerknüppel, HUD und Figurenmaße werden wiederverwendet.

**Ausbaustufe 1 läuft im Browser** mit der vorhandenen Ersatz-Simulation (`lokal()`), ohne Serveränderung. So lassen sich Streaming, Darstellung und Leistung prüfen, bevor der Server angefasst wird.

### C5. Server (Teil von Phase 10, vorbereitet in Phase 5)

Für eine gemeinsam begehbare Region sind diese Erweiterungen nötig – alle additiv, hinter einem neuen Verbindungstyp (`?welt=<region>`), das Kampfprotokoll bleibt:

1. Eine `Sim` je Region und Gruppe statt je Verbindung; Beitritt und Austritt einzelner Spieler.
2. Monster schlafen außerhalb eines Spielerradius; räumliches Gitter statt O(n²).
3. Schnappschuss je Spieler nur mit Wesen in Reichweite; Ereignisse je Empfänger.
4. Ausgänge, Interaktionen und Respawn entscheidet der Server.
5. Dauerhafter Weltzustand (geöffnete Truhen, besiegte Bosse) als neue Migration nach dem Muster von 035/036 in der bestehenden Supabase – keine zweite Datenbank.

Einteilung der Weltobjekte:

| Art | Beispiel | Wo |
|---|---|---|
| Statische Dekoration | Bäume, Häuser, Zäune | nur Chunk-Datei, nie synchronisiert |
| Interaktiv ohne Zustand | Tür, Wegweiser, Händler | Chunk-Datei; Server prüft Reichweite |
| Dynamisch | Gegner, Sammelobjekte | Server-Sim, im Arbeitsspeicher |
| Dauerhaft | Truhe, Questziel, Boss | Server-Sim + Supabase |
| Flüchtige Effekte | Funken, Nebel | nur Client |

### C6. World-Builder (Phase 6)

Eigene Seite `realtime/werkzeug/editor/` mit kleinem lokalen Node-Dienst, der die Regionsdateien liest und schreibt. Kein Bestandteil des ausgelieferten Spiels.

- Stufe 1: Region öffnen, Chunk- und Rechenfeldraster, Gelände malen, Objekte aus der Bibliothek setzen, verschieben, spiegeln, löschen; speichern; Undo/Redo.
- Stufe 2: Kollision von Hand, NPCs, Spawnzonen, Interaktionen, Ausgänge; Fehleranzeige aus der Prüfung; „Hier testen“ startet die Szene `Welt` an dieser Stelle.
- Stufe 3: Bereich markieren, kopieren, einfügen; Suche; Leistungsanzeige.

### C7. Generierung, Prüfung, erste Welt (Phasen 7 bis 9)

- **Generator**: Biomregeln als Daten (Wald, Sumpf, Dorf, Gebirge), aufgebaut auf den Verfahren aus `waldweg.py` und `gelaende.py`: erst Wege und Pflichtorte, dann Gelände, dann Objekte mit Abstandsregeln; fester Zufallsstartwert. Von Hand bearbeitete Bereiche werden gesperrt und beim Neuerzeugen nicht überschrieben.
- **Prüfung** (`node werkzeug/welt/pruefen.mjs <region>`): fehlende Assets, doppelte IDs, Anker, Kollision, Chunk-Nähte, Erreichbarkeit aller Spawnpunkte, Interaktionen, Ausgänge und Questziele (Flutfüllung über das Gehraster), Engstellen, Lücken am Rand.
- **Testumgebung**: `?welt=<region>&test=1` lädt eine Region ohne Hauptspiel, mit Einblendung von Gehraster, Chunk-Grenzen und Leistungswerten.
- **Erste Welt**: Waldmark-Umland → Waldweg → Weidenhain-Umland → Übergangszone → Schwarzmoor mit Rabenmoor, erst nach Klärung der Geografie (E2).

### C8. Fehlende Assets für die erste Welt

- **Gelände**: Waldboden, Sand, Schlamm, Torf, Moorwasser, Fels, Acker.
- **Übergänge**: Wiese/Waldboden, Wiese/Schlamm, Schlamm/Moorwasser, Sand/Moorwasser.
- **Wege und Bauteile**: Bohlenweg, Steg, Brücke, Wehr, Zaun in allen Richtungen mit Tor.
- **Bewuchs**: Weiden, tote Erlen, Birken, Schilf, Riedbülten, Büsche, Stümpfe, Felsen als Einzelbilder.
- **Gebäude**: Fachwerkhaus, Scheune, Kornspeicher, Mühle, Torfstecherhütte, Fischerhaus, Heddas Hütte, Schrein, Steinkreis.
- **Kleinteile**: Laterne, Festfeuer, Tisch, Bank, Fass, Kiste, Heuballen, Torfstapel, Netze, Kahn, Wegweiser.

Bis diese Bilder vorliegen, arbeitet die Pipeline mit dem Bestand (Wiese, Erde, Pflaster, Wasser, Bäume, Zaun, Brunnen) und deutlich markierten Platzhaltern.

### C9. Reihenfolge und Abnahme je Phase

| Phase | Ergebnis | Abnahme |
|---|---|---|
| 2 Datenmodell | Typen in `shared/welt/`, JSON-Schemata, eine winzige Beispielregion | Typprüfung, Build unverändert bytegleich im Bestand |
| 3 Asset-Bibliothek | Katalog des Bestands, Standard als Dokument, Katalogwerkzeug | Katalogseite, Liste der Abweichungen |
| 4 Gelände und Objekte | Bodenbäcker je Chunk, Übergangsregeln, Objektbibliothek | gebackene Testchunks ohne sichtbare Nähte |
| 5 Chunk-System | Szene `Welt`, Laden/Entladen, `WeltRaster` | Testregion 8 × 8 Chunks, Messung auf Mobilgröße |
| 6 Editor | Stufe 1, dann 2 | Beispielregion im Editor geändert und im Spiel gesehen |
| 7 Generator | Wald- und Sumpfregeln | reproduzierbare Region aus Regeldatei |
| 8 Prüfung | `pruefen.mjs`, Testumgebung | absichtlich kaputte Region wird vollständig bemängelt |
| 9 Erste Welt | zusammenhängender Testbereich | Prüfung fehlerfrei, begehbar von Waldmark bis Rabenmoor |
| 10 Integration | Server-Regionen, Koop, Speicherung, Einstieg über die Weltkarte | bestehende Tests grün, neuer Koop-Welt-Test |

Nach jeder Phase: Typprüfung, `node build.mjs`, vorhandene Tests, kurzer Ergebnisbericht in diesem Ordner.

### C10. Risiken

- **Zwei Maßstäbe**: Held 84 px in der Welt, 108–112 px in den gemalten Orten. Ein nahtloser Übergang zwischen Welt und gemaltem Dorf ist ohne Maßstabsentscheidung nicht möglich (E3).
- **Seitenwechsel**: Heute lädt fast jeder Ortswechsel die Seite neu. Innerhalb der Welt entfällt das; zwischen Welt und bestehenden Orten bleibt es zunächst.
- **Server**: kostenloser Render-Tarif, ein Prozess, Räume nur im Arbeitsspeicher. Eine dauerhafte Welt braucht gespeicherten Zustand und verträgt Neustarts nur mit Wiedereinstieg.
- **Bandbreite**: volle Schnappschüsse 20-mal je Sekunde wachsen mit der Zahl der Wesen; ohne Reichweitenfilter nicht tragfähig.
- **Lizenzen**: ungeklärte Herkunft einzelner Waldweg-Bilder (E4).
- **Auslieferung von Hand**: Client auf `main` und Server aus `feature/realtime-engine` können im Protokoll auseinanderlaufen.

---

## Teil D – Entscheidungen, die ich nicht selbst treffen kann

**E1 – Arbeitszweig.** Der vorgegebene Zweig enthält keinen Quelltext. Vorschlag: `feature/realtime-engine` in den Arbeitszweig übernehmen und dort weiterarbeiten; am Ende geht die Arbeit zurück nach `feature/realtime-engine`.

**E2 – Geografie.** Welche Lage gilt: Lore (Graufurt nördlich von Weidenhain) oder Weltkarte im Spiel? Und wo liegt die Waldmark zur Kette Rabenmoor – Weidenhain – Graufurt? Vorschlag passend zu Lore und Aufgabenstellung: Waldmark im Norden, Waldweg nach Süden bis Weidenhain, südlich davon Übergangszone und Schwarzmoor mit Rabenmoor.

**E3 – Dörfer.** Sollen Weidenhain und Rabenmoor in der offenen Welt neu aus Einzelgebäuden entstehen (braucht die Gebäude aus C8), oder bleiben vorerst die gemalten Gesamtbilder als betretbare Orte, die über Eingänge an die Welt angeschlossen sind? Vorschlag: zunächst das Zweite, das Erste, sobald die Gebäudebilder da sind.

**E4 – Neue Bilder und Lizenzen.** Wer erzeugt die fehlenden Bilder und womit? Und: Können die offenen Punkte in `img/welt/QUELLEN.md` geklärt werden, oder sollen die betroffenen Bäume und Texturen ersetzt werden?
