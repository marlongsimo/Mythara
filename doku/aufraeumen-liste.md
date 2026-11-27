# Aufräumen – Freigabeliste (Issue #73)

Stand **27.11.2026**, Zweig `claude/aufraeumen` (von `origin/feature/realtime-engine`).

**Freigabe des Nutzers (26.11.):** Gruppe A ist freigegeben und auf diesem Zweig gelöscht (Commit 5b126a02). Gruppe B bleibt, bis die neue Riftmere-Startseite live ist (#78). C und D bleiben vorerst. Das Löschen auf `main` läuft über ein eigenes Issue `für-dich`.

**Prüflauf nach dem Löschen:**
- `npm ci`, `node build.mjs`, `tsc`: grün.
- `node test/parallel.mjs`: 42 von 42 grün.
- `*-ui.test.mjs`: 18 von 24 grün. Die 6 roten (`anzeige`, `chat-schutz`, `handwerk`, `hintergrund`, `inventar`, `rucksack-ziehen`) schlagen auf dem unveränderten `origin/feature/realtime-engine` mit denselben Meldungen fehl. Sie hängen also nicht am Löschen.
- `quest01-ui` ist wackelig (einmal rot, einmal grün).
- `konto-loeschen`, `wache` und `weltenwahl` brauchen einen Webserver auf Port 8765 in der Projektwurzel.

## So wurde geprüft

- Suche nach Pfad und Dateiname in:
  - `realtime/client` (src, HTML, CSS), `realtime/server/src`, `realtime/shared`, `realtime/welt` (Bibliothek-JSON), `realtime/werkzeug`, `realtime/test`
  - `realtime/build.mjs`, `echtzeit/*.html` und die gebauten Weltdaten `echtzeit/welt*/**.json`
  - `app/`, `.github/`, `UI/`
  - das Würfelspiel (Wurzel-HTML, `js/`, `css/`, `daten/`), `fabrik/` und `doku/`
- Zusammengesetzte Pfade (z. B. `../img/fx/${n}.webp`, Bilder aus `config.ts`, `objekte.json`, `kartensymbole.json`) wurden aus den Daten abgeleitet. Die Module aus `shared` wurden dafür auch gebündelt und ausgeführt.
- Importgraph mit esbuild-Metafiles von allen Einstiegen aus `build.mjs` und aus den Test-Bundles.
- `node build.mjs` läuft in einer Kopie durch. Der volle Prüflauf (`npm ci`, Build, `parallel.mjs`, `*-ui.test.mjs`) kommt nach dem Löschen.

## Wichtig vorab

1. **`main` (die Webseite) ist nicht betroffen.** `welt-live.sh` übernimmt nach `main` nur neue und geänderte Dateien, nie Löschungen. Was hier gelöscht wird, bleibt auf riftmere.de liegen, bis die Integration es mit deinem einmaligen Okay auch dort entfernt (eigenes Issue `für-dich`).
2. **Das Würfelspiel ist noch live.** `index.html` auf `main` ist die Startseite von riftmere.de. Sie ist die Seite des Würfelspiels und verlinkt auf „Splitterlande Beta“ (`echtzeit/anmelden.html`). Riftmere verlinkt mit „← Zur Startseite von Mythara“ (`../`) zurück. Das Würfelspiel auf `main` abzuschalten, hieße also, die Startseite zu ersetzen. Das ist eine eigene Entscheidung (Gruppe B).
3. **Riftmere nutzt aus der Wurzel noch:** `vendor/supabase-js-2.45.4.js`, `verbindung.js`, `fonts/`, `img/favicon.*` und `UI/mythara-ui.css` (für `held.html`). Diese bleiben in jedem Fall.

---

## A · Unbenutzt – Freigabe empfohlen (≈ 27 MB)

Keine Verweise; der Build braucht sie nicht.

| # | Pfad | Größe | Begründung |
|---|---|---|---|
| A1 | `realtime/undefinedhacke-halt-{0,1,2}.png` | 168 KB | Versehentlich mitcommittete Testbilder (Commit 92bd5e9f, Pfad-Präfix `undefined`). Kein Verweis, auch nicht in der Historie. |
| A2 | `img/platzhalter/` (8 Dateien) | 36 KB | Kein Verweis. Ersetzt durch `img/objekte3d/skilling/kochen/symbole/` (gleiche Namen, Commit 05d4a425). |
| A3 | `img/app/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | 940 KB | Byte-gleiche Doppel von `mythara-180/192/512/maske-512.png`. Die Namen kommen nirgends vor. |
| A4 | `img/vorstellung/kampf-echt.webp`, `kampf-siegel.webp`, `szene.webp` | 370 KB | Kein Verweis im ganzen Repo. |
| A5 | `img/mythara/logo.webp`, `logo-700.webp` | 320 KB | Kein Verweis. Würfelspiel und Riftmere nutzen `logo-neu*`. |
| A6 | `img/welt/gebaeude/wald_ruine_01.webp`, `wald_ruine_02.webp` | 16 KB | Kein Verweis (auch nicht in `objekte.json` oder den Weltdaten). |
| A7 | `img/welt/gebaeude/raeumlich/weidenhain_bankschalter_01/haupt_vordach.webp` | 4 KB | `objekte.json` nennt die übrigen 5 Teile des Ordners, dieses nicht. |
| A8 | `img/figuren-fabrik/gegner.bandit.dolch/` (19 Dateien) | 8,7 MB | Abgelöst durch `gegner.bandit.v003` (`modulfigur.ts:19`, `held3d.ts:199`). Nur `fabrik/variante.py` kann ihn erzeugen. *Bereich Figuren.* |
| A9 | `UI/png/` (180), `UI/vorlage/` (3), `UI/index.html`, `UI/entwurf/`, `UI/werkzeug/`, `UI/mythara-ui.js` | 17 MB | Gold-UI-Baukasten, laut KANON „vorerst verworfen“. Außerhalb von `UI/` kein Verweis. **`UI/mythara-ui.css` und `UI/README.md` bleiben** (`held.html` lädt die CSS). |

## B · Würfelspiel – nur auf diesem Zweig tot, auf der Webseite live (≈ 52 MB)

Auf `feature/realtime-engine` wird nichts davon gebaut, getestet oder gebraucht: Kein Riftmere-Code, Test oder Workflow verweist darauf. Auf `main` ist es die laufende Webseite.

**Vorschlag:** auf dem Zweig löschen, auf `main` erst, wenn eine neue Startseite steht. Wenn du willst, bleibt es auch ganz.

| Pfad | Größe |
|---|---|
| Seiten: `spiel.html`, `handy.html`, `intro.html`, `riss-intro.html`, `rissgefecht.html`, `wuerfel-test.html`, `sw.js`, `prototyp/` | ~95 KB |
| `js/` (37), `css/` (3), `daten/` (7) | 2,1 MB |
| `server/` (Arena), `tools/` (23), `tests/` (62) | 0,9 MB |
| `ton/` (13 Klänge, Riftmere hat eigene Musik in `echtzeit/musik/`) | 7,9 MB |
| Bilder nur für das Würfelspiel: `img/dorf`, `intro`, `shop`, `riss`, `krone`, `hochwacht`, `graufurt`, `grauwacht` | ~18 MB |
| Bilder nur für das Würfelspiel (Teile von Ordnern): `img/figuren/` außer den 5 Helden-jpg, `img/gegner/` außer 6 jpg, `img/mythara/` außer `banner-loewe`, `plakette-eisen`, `siegel` | ~17 MB |
| Weitere Bilder nur für das Würfelspiel: `img/fx/{pfeil,kugel,ranke,muenzen}`, `img/welt/{abtei-*,glockenturm,gruft,halle,klostergarten,pilzkammer,schacht,siegelkammer}`, `img/rabenmoor/{abschnitt-*,titel,vorschau}`, `img/weidenhain/vorschau`, `img/app/mythara-64.png` | ~3 MB |

Auf `main` bleiben müssen die Startseite `index.html`, `manifest.webmanifest`, `CNAME`, `robots.txt`, `sitemap.xml` und die Bilder, die die Startseite zeigt.

**Sonderfall:** `supabase/functions/arena/` (300 KB) ist der Arena-Server des Würfelspiels als Edge-Funktion. Ob er bei Supabase noch läuft, sieht man hier nicht. Vorschlag: **bleibt**.

## C · Riftmere-Teile, die abgeschaltet sind, aber im Code noch erreichbar – nicht löschen, erst entscheiden

Diese Dateien hängen an Schaltern oder Adress-Parametern. Löschen hieße, Code zu ändern; das gehört zur Rolle Systeme.

**Vorschlag:** nicht in diesem Auftrag, sondern ein Issue `rolle:systeme` mit deiner Entscheidung.

| Teil | Größe | Warum noch erreichbar |
|---|---|---|
| Alte gebackene Bodenbilder `echtzeit/welt/<cx>_<cy>.webp` (267 Stück) | 34 MB | Nur der 2D-Weg (Phaser) liest sie (`welt/welt.ts:103,214`). Der 2D-Weg läuft noch: bei `?welt3d=0`, ohne WebGL (automatisch) und in Testbrowsern (`spielwelt.ts:83–87`). Zwei Browser-Tests prüfen den Boden. **Die Chunk-JSONs, `welt.json` und die `karte-*.webp` daneben werden gebraucht.** |
| 2D-Client mit Phaser | – | **Kein Rest:** Der Riss/Dungeon läuft live in Phaser (`main.ts:421`), ebenso der Ersatz ohne WebGL und fast alle Browser-Tests. |
| Kampagnen-Orte: `ort.ts`, `kampagne.ts` (teilweise), `weltkarte.ts`, `weidenhain/rabenmoor/baukasten.json` und ihre Bilder (`img/weidenhain/*`, `img/rabenmoor/{bohlenweg,ried,schrein,totenpfad}`, `img/echtzeit/{agnes,jorin-lauf,dorfgruppe,meute,zaun,rabenmoor,weltkarte,weidenhain-boden}`, `img/welt/waldweg.webp`) | ~9 MB | `freigabe.ts`: „abgeschaltet, bleibt vollständig im Code“ (`FREIGABE.kampagnen = false`). Über `ez__alles=1` wieder einschaltbar. |
| Alte Iso-Stadt `?stadt=alt`: `dorf.ts`, `dorf.json`, `werkzeug/dorf.py`, `werkzeug/vorlage-{wiese,pflaster}.png` und die Bilder `img/echtzeit/{baum,tanne,taverne,stadttor,hausreihe*,haendler,heldenhalle,riss-tor,wiese-kachel,dorf-boden}` | ~8 MB | Nur per Adresse. `dorf.ts:76` verlinkt die Arena des Würfelspiels. |
| Gemalte Stadt `?stadt=bild` (`stadt.ts`) | 34 KB | Wird noch in `test/welt-spielstart.test.mjs:55` geprüft. |
| 3D-Prototyp: `welt3d.html`, `welt3d.js`, `welt3d-spiel.js` (`client/src/welt3d/{welt3d,leute3d,main,spiel}.ts`, `client/welt3d.html`) | ~1,2 MB gebaut | Nicht verlinkt, kein Test. Nur `?welt3d=0&3d=1`. `build.mjs:33–36` baut sie bei jedem Lauf neu, also müssten die Bauzeilen mit raus. |
| `client/src/welt/geschosse.ts` | 8 KB | Nicht im Bundle. Löschen nur zusammen mit dem Typ-Import und der Map in `welt/kampf.ts` (sonst Fehler in `tsc`). |
| `client/src/welt/prototyp.ts`, `welt/seite.ts` mit `werkzeug/welt/prototyp.mjs`, `seite.mjs` und dem Bild `img/welt/gebaeude/dorf_haus_holz_01.webp` | ~25 KB | Werkzeuge, die von Hand gebaut werden. Ziel liegt außerhalb des Repos. |

## D · Unsicher – gehört anderen Rollen, nur mit deren Rückmeldung

| Teil | Größe | Grund |
|---|---|---|
| `img/figuren3d/` (`krieger_test`, 42 Dateien) und `realtime/character-pipeline/` (außer `preview/index.html`) | 12 MB + 7,7 MB | Alte Blender-Pipeline, vermutlich durch `fabrik/` abgelöst. Benutzt wird sie nur noch von der Testseite `figurentest` und `figurenvorschau` (`build.mjs`, `test/figuren3d-browser.test.cjs`). *Figuren.* |
| `img/figuren-echt3d/`: 35 Modelle ohne Spielverweis (Rabenpriester, Banditen-Varianten, Haustiere, Quest-NPCs …) | ~32 MB | Fast alle sind **vorbereitet für kommende Phasen** (Quellen in `fabrik/assets`). **Nicht löschen.** Eindeutig verwaist ist nur `held.mann.v003.*` (2 Dateien, wenige KB). *Figuren.* |
| `img/objekte3d/`: 102 von 428 Dateien nicht eingetragen (`beute/`, `graufurt/`, `kraeuterkunde/`, Kochen, Angelrute in Stufen, `lamberts_rute`, `sichel`) | ~6,6 MB | Für Phase 4–7 vorbereitet, Integration trägt sie ein. **Nicht löschen.** Ausnahme: `lamberts_rute` und die Angelrute in Stufen widersprechen dem KANON („nur eine Angelrute, ohne Stufen, keine Lamberts Rute“). Das geht an Figuren. |
| `img/echtzeit/abzeichen_geladen.webp` | klein | Erzeugt von `fabrik/abzeichen_geladen.py`, im Spiel noch nicht genutzt. Vermutlich vorbereitet (Phase 5 „geladene Waffen“). |
| `img/welt/stil/*` (~70 Dateien) und `img/welt/gebaeude/kenney/burg_turm_01.webp` | ~0,6 MB | Stehen in `realtime/welt/bibliothek/objekte.json`, sind aber nirgends platziert. Der Test `welt-daten` prüft, ob jedes Bild der Bibliothek existiert, also nur zusammen mit dem Eintrag löschen. *Welt.* `img/welt/stil/samm_hanf_geerntet.webp` steht nicht einmal in der Bibliothek. |
| `img/symbole/` (7) | 200 KB | **Noch im Code:** `symbole.ts`, `welt/kampf.ts:48,53` (`v1Tasten`), `main.ts:351` (Riss). Mit eigenem Helden meist ausgeblendet, aber erst nach einer Code-Änderung entbehrlich. *Oberfläche/Systeme.* |
| `realtime/werkzeug/.karte.gebaut.mjs`, `.karte.json` | 7 KB | Zwischenstände von `karte-json.mjs`, die mitcommittet wurden. Besser in `.gitignore` aufnehmen als löschen (sie entstehen neu). |
| `echtzeit/welt/weltkarte.webp` | 0,4 MB | Das Spiel nutzt `img/echtzeit/weltkarte.webp`. Diese Datei braucht nur `festland.py --vorschau`. *Welt.* |
| `echtzeit/animationen.html` mit Liste | 67 KB | Testseite, nicht verlinkt. Wird von `build.mjs` erzeugt; Werkzeug der Figuren-Rolle. |
| Verwaiste Skripte: `character-pipeline/tools/kombinationen.py`, `test/figuren3d-leistung.cjs`; Test `quest01.test.mjs` stürzt ab (`Q.NPCS is not iterable`) | klein | Kein Aufrufer. Den Test zu reparieren oder zu entfernen ist Sache von Bugs/Systeme. |

## E · Bleibt (zur Klarheit)

- `doku/`, alle Konzept-PDFs und die Konzept-`*.md` in der Wurzel (Würfelspiel-Konzepte, Lore). Verschieben in ein Archiv entscheidet Konzept & Review.
- `fabrik/` (Quellen) und `supabase/` (Migrationen, Tests, Funktionen).
- `app/` (iOS-App, Workflow `ios-app.yml`).
- `vendor/`, `fonts/`, `verbindung.js`, `UI/mythara-ui.css`.
- `echtzeit/welt/*.json`, `echtzeit/welt/karte-*.webp`, `echtzeit/welt3d/`, `echtzeit/musik/` und alle Seiten, die `build.mjs` erzeugt.

## Nur auf `main`: Altlasten

7 alte Bodenbilder `echtzeit/welt/23x_23x.webp` liegen nur noch auf `main`. Sie wurden in Commit 5411de34 umbenannt. Wenn du das Löschen auf `main` freigibst, kommen sie mit auf die Liste.

## Löschen auf `main` (27.11., Entscheidung des Nutzers in #108)

**Entscheidung:** Das Würfelspiel wird komplett entfernt, und Gruppe A gilt auch für `main`. Die Integration setzt das zusammen mit der neuen Startseite (#78) um.

**Genaue Liste:** `doku/aufraeumen-main-liste.txt`. Sie umfasst 674 Dateien (72,7 MB) und ist gegen `origin/main` 5844f65c geprüft.
- Gruppe A (226 Dateien auf `main`)
- Würfelspiel-Seiten und -Code (156 Dateien)
- Bilder, die nur das Würfelspiel nutzt (311 Dateien)
- Einige Dateien zählen zu zwei Gruppen; die Liste nennt jede nur einmal.

**Nicht auf der Liste:**
- Alles aus `echtzeit/`, `fonts/`, `vendor/`, `verbindung.js` und `UI/mythara-ui.css`.
- Jedes Bild, dessen Pfad oder Dateiname irgendwo in Riftmere vorkommt, also in Quellen, gebauten Seiten, Weltdaten, `app/` oder Webmanifest.
- Bewusst vorsichtig geprüft: Wer einen Treffer hat, bleibt. Deshalb bleiben z. B. einzelne Bilder in `img/rabenmoor`, `img/krone` und `img/hochwacht`.

**Ersetzt die Integration selbst:** `index.html`, `manifest.webmanifest`, `sitemap.xml`, `robots.txt` (Startseite #78, Weiterleitungen).

**Bleibt:** `supabase/` (auch `functions/arena`), die Konzept-`*.md` in der Wurzel, `doku/`, `CNAME`, `render.yaml`.

**Offen, nur auf Wunsch:** die 7 alten Bodenbilder `echtzeit/welt/23x_23x.webp`. Sie sind nicht in der Liste.
