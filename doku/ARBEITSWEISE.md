# Arbeitsweise – mehrere Claude-Sitzungen an einem Spiel

Stand: 26.11.2026. Kurzfassung in `CLAUDE.md` (wird von jeder Sitzung automatisch gelesen).

## 1. Die Rollen

| Rolle | Aufgabe | Zweig | Kommt live über |
|---|---|---|---|
| **Integration & Spielsysteme** | Fahrplan-Phasen technisch umsetzen (Systeme, Server, Client, Datenbank), Zweige der anderen zusammenführen, bauen, alle Tests, live stellen, kleine Fixes | `claude/welt3d` → `feature/realtime-engine` | führt selbst zusammen |
| **Quest-Autor** *(optional, ab Phase 3)* | Quests als Daten schreiben (`shared/quest*.ts`): Schritte, Dialoge, Figuren, Belohnungen | eigener `claude/…`-Zweig | Integration führt zusammen |
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
| Integration & Spielsysteme | alle Server-Tests: `bash test/server-tests.sh`; bei Änderungen an Oberfläche oder 3D zusätzlich die passenden `*-ui.test.*` |
| Quest-Autor | `node test/questbau.test.mjs` (Prüfer über alle Quests) und der Welt-Test der Quest (`test/questNN-welt.test.mjs`, neu anlegen) |
| Figuren & 3D | `node test/figuren3d.test.mjs`; Sichtprüfung in `echtzeit/figurentest.html` |
| Worldbuilding | `node test/welt-daten.test.mjs`, `welt-raster`, `welt-grenzen`, `welt-bau`, `kreuzwald` (dieselben prüft auch die Pipeline) |

GitHub führt nach jedem Push auf einen `claude/…`-Zweig und auf `feature/realtime-engine` die Server-Tests aus (Workflow „Tests“, `.github/workflows/tests.yml`).
Das Ergebnis steht auf GitHub unter **Actions** und als Haken/Kreuz neben dem Commit.

## 5. Labels auf GitHub

| Label | Bedeutung |
|---|---|
| `rolle:spiel` | Integration & Spielsysteme |
| `rolle:quests` | Quest-Autor |
| `rolle:figuren` | Figuren & 3D |
| `rolle:welt` | Worldbuilding |
| `rolle:review` | Konzept & Review |
| `für-dich` | Der Nutzer muss etwas tun oder entscheiden |
| `phase-3`, `phase-4`, … | Fahrplan-Phase |

## 6. Startnachrichten

Beim Öffnen einer neuen Sitzung (oder einmal in einer bestehenden) diese Nachricht schicken – `<ROLLE>` ersetzen:

> Du arbeitest in der Rolle **<ROLLE>** an Riftmere. Lies `CLAUDE.md`, `doku/ARBEITSWEISE.md`, `doku/STAND.md` und `doku/KANON.md`.
> Sieh dir dann die offenen GitHub-Issues mit dem Label `rolle:<label>` an und sag mir, womit du anfangen würdest.

Rollen und Labels: Integration & Spielsysteme (`rolle:spiel`), Quest-Autor (`rolle:quests`), Figuren & 3D (`rolle:figuren`), Worldbuilding (`rolle:welt`), Konzept & Review (`rolle:review`).

## 7. Was der Nutzer tut

- Entscheidungen treffen (Issues mit `für-dich`, offene Fragen in den Konzept-PDFs).
- Supabase-Migrationen einspielen, wenn ein Issue das verlangt (Datei im Ordner `supabase/`, unverändert in den SQL-Editor).
- Nach jeder Phase im echten Spiel testen (Handy und PC).
- Bei Fragen zur Aufteilung: die Sitzung Konzept & Review fragen.
