# World Pipeline – Phase 2: Datenmodell

Stand: 20.11.2026. Baut auf `01-ist-zustand-und-plan.md` auf.

## Was dazugekommen ist

| Datei | Inhalt |
|---|---|
| `realtime/shared/welt/typen.ts` | Maße und alle Typen: Geländearten, Objekte, Region, Platzierung, Figuren, Spawnzonen, Interaktionen, Ausgänge, gebauter Chunk |
| `realtime/shared/welt/form.ts` | Formprüfung: Aufbau und Verweise von Bibliotheken und Regionen, verständliche Fehlermeldungen |
| `realtime/welt/bibliothek/gelaende.json` | 13 Geländearten; 6 mit vorhandener Textur, 7 vorerst nur mit Platzhalterfarbe |
| `realtime/welt/bibliothek/objekte.json` | 7 Objekte für den Anfang (sechs Waldbäume, Brunnen als Platzhalter); der volle Katalog folgt in Phase 3 |
| `realtime/welt/regionen/beispiel/` | Prüfstück: 2 × 2 Chunks mit Wiese, Waldrand, Erdweg, Teich, Pflasterplatz, 46 Bäumen, einer Figur, einer Spawnzone, einer Interaktion, einem Ausgang |
| `realtime/werkzeug/welt/laden.mjs` | Liest Bibliotheken und Regionen; Grundlage aller weiteren Werkzeuge |
| `realtime/werkzeug/welt/form.mjs` | Aufruf der Formprüfung von der Befehlszeile |
| `realtime/test/welt-daten.test.mjs` | 21 Prüfungen, davon 15 mit absichtlich beschädigten Daten |

Das Spiel selbst ist unberührt: Der Client bindet `shared/welt` noch nicht ein, `echtzeit/spiel.js` ist nach dem Build bytegleich.

## Festlegungen

- **Maße:** Rechenfeld 48 px, Geländekachel 96 px (2 × 2 Rechenfelder), Chunk 32 × 32 Rechenfelder (1536 px), Held 84 px.
- **Koordinaten:** Alles in Rechenfeldern als Kommazahl, Ursprung oben links. Eine Region hat eigene Koordinaten und einen Platz im gemeinsamen Weltgitter (`ursprung` in Chunks). Regionen dürfen aneinandergrenzen, sich aber nicht überschneiden.
- **Eine Region = vier Dateien:** `region.json` (Lage, Größe, Biom, Stufe, Licht, von Hand gestaltete Sperrbereiche für den Generator), `gelaende.txt`, `objekte.json`, `spiel.json`.
- **Geländekarte als Text:** ein Zeichen je Rechenfeld, wie die bestehenden Kampfkarten. Abweichung vom Plan (dort war ein PNG vorgesehen): Text ist in Git lesbar und vergleichbar und braucht keinen Bildleser in Editor und Werkzeugen.
- **Gelände:** Jede Art hat ein Zeichen, einen Rang (wer höher steht, legt sich über die Nachbarn) und eine Randregel (`fransen`, `steine`, `ufer`, `hart`) – das sind die Verfahren, die `gelaende.py` heute schon rechnet.
- **Objekte:** ID, Name, Kategorie, Bild, Größe, Ankerpunkt, Maßstab, Kollision (Kreis, Rechteck, Vieleck – unabhängig vom Bild), Tiefe (`fuss`, `boden`, `oben`), durchscheinend, Interaktion, Animation, Effekte, Zustände (für Gebäude und Truhen), Herkunft, Platzhalter-Merkmal.
- **Abgleich** je Spielelement: `keiner` (nur Darstellung), `server` (Server entscheidet), `dauerhaft` (Server entscheidet und speichert).
- **Ausgänge** führen in die Welt, in einen bestehenden Ort oder in einen bestehenden Kampf – so bleiben die heutigen Orte und Kampfkarten anschließbar.

## Die zwölf Ebenen im Datenmodell

| Ebene | Wo |
|---|---|
| Ground, Ground_Detail, Paths, Water | `gelaende.txt` + Geländebibliothek |
| Objects_Back, Entities, Objects_Front | `objekte.json`; Reihenfolge über Fußpunkt und `tiefe` |
| Collision | Gelände (`begehbar`) + Objektkollision + `spiel.json` → `kollision` |
| Interaction | Objekt-`interaktion` und `spiel.json` → `interaktionen` |
| Spawn_Zones | `spiel.json` → `spawnzonen`, `figuren`, `start` |
| Region_Borders | `region.json` → `ursprung`, `chunks`; `spiel.json` → `ausgaenge` |
| Ambient_Effects | Objekt-`effekte`, `region.json` → `licht` |

## Geprüft

- `npx tsc --noEmit`: ohne Fehler.
- `node build.mjs`: läuft; `echtzeit/spiel.js` bytegleich.
- `node werkzeug/welt/form.mjs`: Bibliotheken und Beispielregion in Ordnung.
- `node test/welt-daten.test.mjs`: 21 von 21.
- Bestand: `waldweg.test`, `stufe.test`, `kampagne.mjs`, `rabenmoor.mjs` bestanden. Nicht ausgeführt: die Browser-, Koop-, Konto- und Server-Kampf-Tests (brauchen Testserver; die Phase hat keinen davon berührten Code geändert).

## Annahmen

- Die Formprüfung kennt die Gegnerarten aus `shared/config.ts` (`MONSTER`). Figuren (`figur`) werden noch nicht gegen die Dorfleute geprüft, weil deren Liste im Client-Code steht (`ort.ts`, `stadt.ts`); das folgt bei der Integration.
- Die Kollisionsradien der sechs Waldbäume (0,45 Rechenfelder, großer Baum 0,7) sind geschätzt und werden in Phase 3 am Bild nachgemessen.
- Der Brunnen ist ein Iso-Bild und passt nicht zur Ansicht der Welt; er steht als Platzhalter in der Bibliothek.

## Als Nächstes: Phase 3

Katalog aller vorhandenen Bilder mit Maßen, Anker, Herkunft; Asset-Standard als Dokument; Werkzeug, das neue Bilder gegen den Standard prüft und eine Übersichtsseite erzeugt.
