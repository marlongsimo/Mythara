# Arbeitsweise – mehrere Claude-Sitzungen an einem Spiel

Stand: 26.11.2026. Kurzfassung in `CLAUDE.md` (wird von jeder Sitzung automatisch gelesen).

## 1. Die Rollen

| Rolle | Aufgabe | Zweig | Kommt live über |
|---|---|---|---|
| **Integration & Inhalte** | Zweige zusammenführen, bauen, alle Tests, live stellen; Pipeline und Test-Werkzeuge; Inhalte einbauen (Figuren, Gegnerwerte, Beute, NPCs, Symbole, Karten, Quests), Oberfläche, Wünsche, kleine Fixes | `claude/welt3d` → `feature/realtime-engine` | führt selbst zusammen |
| **Systeme** (Chat „Riftmere · Systeme“, seit 26.11.) | neue Spielmechaniken der Fahrplan-Phasen Ende-zu-Ende (Server, Spiellogik, nötige Oberfläche, Migrationen, Tests) | `claude/systeme` | Integration führt zusammen, wenn „Tests“ grün |
| **Quest-Autor** (Chat „Riftmere · Quests“, seit 26.11.) | Quests als Daten schreiben (`shared/quest*.ts`): Schritte, Dialoge, Figuren, Belohnungen | `claude/riftmere-quests` | Integration führt zusammen (geplant: Pipeline, #22) |
| **Figuren & 3D** | Modelle, Animationen, Figuren-Fabrik, Objekte | `claude/tender-heisenberg-bruby2` | Pipeline „Welt live“ (alle 15 min automatisch) |
| **Worldbuilding** | Regionen, Gelände, Festland, Karten | `claude/mythara-world-pipeline-z4ynx5` | Pipeline „Welt live“ (alle 15 min automatisch) |
| **Konzept & Review** | Konzepte (PDFs in `doku/quests/`), Commits gegen Konzept und Kanon prüfen, `doku/STAND.md` und `doku/KANON.md` pflegen, Issues anlegen | `claude/relaxed-sagan-erl6lf` | Integration führt zusammen |

Ein neuer Zweig einer Rolle wird entweder von der Integration zusammengeführt oder in `.github/scripts/welt-live.sh` (QUELLEN) eingetragen.
Eine neue Sitzung bekommt beim Start ihre Rolle genannt (Startnachrichten in Abschnitt 6).

## 2. Ordner je Rolle

Siehe Tabelle in `CLAUDE.md`. Grundsatz: **Jede Datei hat genau eine Rolle, die sie ändert.**
Wenn zwei Rollen dieselbe Datei brauchen, schreibt die eine ein Issue an die andere.

Typische Übergaben:
- Figuren & 3D fertigt ein Gegnermodell → Issue `rolle:spiel`: „Gegner X einbauen (Werte, Lager, Beute)“.
- Quest-Autor braucht ein neues Ereignis im Quest-Baukasten → Issue `rolle:spiel`.
- Spielsysteme braucht eine Figur oder Animation → Issue `rolle:figuren`.
- Eine Quest braucht einen neuen Ort, eine Höhle oder ein Gebäude → Issue `rolle:welt`.
- Der Nutzer muss etwas tun (Migration einspielen, im Spiel testen, entscheiden) → Issue `für-dich`.

## 3. Der Weg eines Auftrags

1. **Konzept** (Rolle Konzept & Review): PDF in `doku/quests/`, daraus ein oder mehrere **Issues** mit Rollen-Label und Phase-Label (`phase-3` …).
2. **Umsetzung** (zuständige Rolle): eigenen Zweig aktualisieren, umsetzen, Tests, Commit, Push. Im Issue: was gemacht wurde, Commit-Kennung, ob der Nutzer etwas tun muss.
3. **Prüfung** (automatisch): Workflow „Tests“ läuft nach jedem Push. Rot = erst reparieren.
4. **Zusammenführen und live** (Integration): Zweig nach `feature/realtime-engine`, alle Tests, Pipeline stellt live. Issue schließen.
5. **Review** (Konzept & Review, nach Bedarf): Commit gegen Konzept und Kanon prüfen, Befunde als neues Issue.
6. **Stand nachführen** (Konzept & Review): `doku/STAND.md`.

## 4. Tests je Rolle (vor dem Push)

Alle Befehle im Ordner `realtime/`, nach `node build.mjs` (Integration) bzw. `npm ci` beim ersten Mal.

| Rolle | Mindestens |
|---|---|
| Integration & Inhalte, Systeme | alle Server-Tests **gleichzeitig**: `node test/parallel.mjs` (ca. 2 min statt 8; nacheinander: `bash test/server-tests.sh`); bei Änderungen an Oberfläche oder 3D zusätzlich nur die **betroffenen** `*-ui.test.*` |
| Quest-Autor | `node test/questbau.test.mjs` (Prüfer über alle Quests) und der Welt-Test der Quest (`test/questNN-welt.test.mjs`, neu anlegen) |
| Figuren & 3D | `node test/figuren3d.test.mjs`; Sichtprüfung in `echtzeit/figurentest.html` |
| Worldbuilding | `node test/welt-daten.test.mjs`, `welt-raster`, `welt-grenzen`, `welt-bau`, `kreuzwald` (dieselben prüft auch die Pipeline) |

GitHub führt nach jedem Push auf einen `claude/…`-Zweig und auf `feature/realtime-engine` die Server-Tests aus (Workflow „Tests“, `.github/workflows/tests.yml`).
Das Ergebnis steht auf GitHub unter **Actions** und als Haken/Kreuz neben dem Commit.

## 5. Labels auf GitHub

| Label | Bedeutung |
|---|---|
| `rolle:spiel` | Integration & Inhalte |
| `rolle:systeme` | Systeme (neue Mechaniken) |
| `rolle:quests` | Quest-Autor |
| `rolle:figuren` | Figuren & 3D |
| `rolle:welt` | Worldbuilding |
| `rolle:review` | Konzept & Review |
| `für-dich` | Der Nutzer muss etwas tun oder entscheiden |
| `phase-3`, `phase-4`, … | Fahrplan-Phase |

## 6. Startnachrichten (Dauerauftrag)

Jede Sitzung bekommt **einmal vom Nutzer** ihre Rolle und ihren Dauerauftrag. Danach reicht ein Anstoß der Leitstelle
(„Issue #N ist jetzt dran“) – der Anstoß ist ein Hinweis, die Erlaubnis kommt aus diesem Dauerauftrag.

**Figuren & 3D**
> Du bist die Sitzung **Figuren & 3D** für Riftmere. Lies `CLAUDE.md`, `doku/ARBEITSWEISE.md`, `doku/STAND.md`, `doku/KANON.md`.
> Dauerauftrag: Arbeite offene Issues mit `rolle:figuren` selbstständig ab, eins nach dem anderen, ältestes zuerst, solange nichts aus einem anderen Issue fehlt.
> Nur in deinen Ordnern arbeiten, auf deinen Zweig pushen, im Issue melden was fertig ist (mit Commit) und es schließen.
> Brauchst du etwas von mir: Issue mit `für-dich`. Brauchst du etwas von einer anderen Rolle: Issue mit deren Label.
> Wenn dich die Leitstelle anstößt, schau in deine Issues.

**Worldbuilding** – wie oben, mit `rolle:welt` und „Sitzung **Worldbuilding**“.

**Integration & Inhalte**
> Du bist die Sitzung **Integration & Inhalte** für Riftmere. Lies `CLAUDE.md`, `doku/ARBEITSWEISE.md`, `doku/STAND.md`, `doku/KANON.md`.
> Dauerauftrag: Arbeite offene Issues mit `rolle:spiel` selbstständig ab (Reihenfolge nach Phase, dann Abhängigkeiten).
> Führe die Zweige der anderen Rollen zusammen, wenn ihr Workflow „Tests“ grün ist, und stelle live wie bisher.
> Live nur mit grünen Tests. Nach jeder abgeschlossenen Phase: Issue `für-dich` „Phase N bitte im Spiel testen“ anlegen und auf mein Okay warten, bevor die nächste Phase live geht.
> Führe auch den Zweig `claude/systeme` zusammen, wenn dessen „Tests“ grün sind. Neue Mechaniken baut die Sitzung Systeme – brauchst du eine, lege ein Issue `rolle:systeme` an.

**Systeme**
> Du bist die Sitzung **Systeme** für Riftmere. Lies `CLAUDE.md`, `doku/ARBEITSWEISE.md`, `doku/STAND.md`, `doku/KANON.md` und die Konzepte in `doku/konzepte/`.
> Dauerauftrag: Arbeite offene Issues mit `rolle:systeme` selbstständig ab (Reihenfolge nach Phase, dann Abhängigkeiten). Baue neue Mechaniken Ende-zu-Ende mit Tests auf `claude/systeme`;
> Inhalte (Gegnerwerte, Beute, Figuren-Einbau, Karten) trägt die Integration ein – lege dafür ein Issue `rolle:spiel` an. Hole mindestens täglich `feature/realtime-engine` in deinen Zweig.
> Push nur mit grünen Tests; die Integration führt zusammen und stellt live. Neue Migrationen immer mit Rückbau und Test; das Einspielen ist ein Issue `für-dich`.

**Leitstelle (Konzept, Quests & Fahrplan)**
> Du bist die **Leitstelle** für Riftmere. Lies `CLAUDE.md`, `doku/ARBEITSWEISE.md`, `doku/STAND.md`, `doku/KANON.md`.
> Dauerauftrag: Halte den Fahrplan nach. Schreibe Konzepte, lege daraus Issues mit Rollen-Label und Abhängigkeiten an.
> Prüfe regelmäßig das Issue-Brett: Was ist erledigt? Was ist jetzt frei? Stoße die zuständige Sitzung per Nachricht an.
> Prüfe fertige Arbeit gegen Konzept und Kanon (Befunde als Issue). Führe `doku/STAND.md` und `doku/KANON.md` nach.
> Wenn eine Phase fertig ist: mir eine kurze Zusammenfassung schicken. Antworten aus `für-dich`-Issues in den Kanon übernehmen.

**Bugs** *(optional)*
> Du bist die Sitzung **Bugs** für Riftmere. Lies `CLAUDE.md` und `doku/ARBEITSWEISE.md`.
> Dauerauftrag: Fehlerberichte (von mir, aus dem Spiel-Feedback, aus roten Tests) nachstellen und als Issue mit der zuständigen Rolle,
> Schritten zum Nachstellen und Dringlichkeit anlegen. Kleine Fehler in Tests oder Doku darfst du selbst beheben; Spielcode nur über Issues.

Rollen und Labels: Integration & Inhalte (`rolle:spiel`), Systeme (`rolle:systeme`), Quest-Autor (`rolle:quests`), Figuren & 3D (`rolle:figuren`), Worldbuilding (`rolle:welt`), Leitstelle / Konzept & Review (`rolle:review`).

## 7. Takt (automatisch)

Eine geplante Aufgabe weckt die Leitstelle regelmäßig (Vorschlag: alle 2 Stunden tagsüber). Sie prüft das Issue-Brett, stößt Sitzungen an,
führt `doku/STAND.md` nach und meldet dem Nutzer fertige Phasen. Nachts und am Wochenende kein Takt (spart Nutzung).

## 8. Was der Nutzer tut

- Entscheidungen treffen (Issues mit `für-dich`, offene Fragen in den Konzept-PDFs).
- Supabase-Migrationen einspielen, wenn ein Issue das verlangt (Datei im Ordner `supabase/`, unverändert in den SQL-Editor).
- Nach jeder Phase im echten Spiel testen (Handy und PC).
- Bei Fragen zur Aufteilung: die Sitzung Konzept & Review fragen.
