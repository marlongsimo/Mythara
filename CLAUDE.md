# Riftmere (Mythara) – Regeln für alle Claude-Sitzungen

Dieses Projekt wird von mehreren Claude-Sitzungen gleichzeitig bearbeitet, jede mit einer festen **Rolle**.
Diese Datei liest jede Sitzung beim Start. Ausführlich: `doku/ARBEITSWEISE.md`.

## Vor jeder Arbeit
1. Klären, welche Rolle diese Sitzung hat (steht in der ersten Nachricht des Nutzers; sonst nachfragen).
2. `doku/STAND.md` lesen (wo stehen wir im Fahrplan) und `doku/KANON.md` (Namen, Entscheidungen).
3. Offene GitHub-Issues mit dem Label der eigenen Rolle ansehen (`rolle:spiel`, `rolle:systeme`, `rolle:bugs`, `rolle:ui`, `rolle:quests`, `rolle:figuren`, `rolle:welt`, `rolle:review`).
4. Den eigenen Zweig auf den neuesten Stand bringen: `git fetch origin feature/realtime-engine && git merge origin/feature/realtime-engine`.

## Wer was ändern darf
| Rolle | Ändert | Ändert nicht |
|---|---|---|
| **Integration & Inhalte** | Zusammenführen, Bauen, Live, `.github/`, Test-Werkzeuge (`realtime/test/parallel.mjs`, `server-tests.sh`); Inhaltsdaten in `realtime/shared` (Gegner-Einträge, Beute, Läden, Karten, Kartensymbole, Gegenstände); Einbau von Figuren, Welt und Quests; Wünsche und Bugs | Modellquellen (`fabrik/`), Weltquellen (`realtime/welt/`), neue Systeme (→ Issue `rolle:systeme`) |
| **Systeme** | Neue Spielmechaniken Ende-zu-Ende: `realtime/server/src`, System-Dateien in `realtime/shared` (Simulation, Kampf, Questmotor/-bau, Inventar, Wirkungen …), nötige Client-Teile des Systems, `supabase/` (neue Migrationen), Tests dazu | Inhaltsdaten, `.github/`, Live stellen, `fabrik/`, `realtime/welt/` |
| **Oberfläche** | Client-Oberfläche: HUD, Seitenfenster, Menüleiste, Minikarte/Weltkarte, Chat, Aktionsmenü, Bank-/Laden-/Dialog-/Handelsfenster, Stile in `realtime/client/index.html` (Dateien siehe `doku/konzepte/hud.md`) | Server, Spiellogik, Inhaltsdaten, `.github/`, Live stellen, `fabrik/`, `realtime/welt/` |
| **Bugs** | Gezielte Fehlerbehebung in `realtime/client`, `realtime/server`, `realtime/shared` (nur so viel wie der Fehler braucht) + Test je Fehler, Zweig `claude/bugs` | Neue Funktionen, Umbauten, Inhaltsdaten, `.github/`, Live stellen, `fabrik/`, `realtime/welt/` |
| **Quest-Autor** | Quest-Dateien `realtime/shared/quest*.ts`, Dialoge, Questfiguren, `doku/quests/` | Motor (`questbau.ts`, `questmotor.ts`), Server, Client |
| **Figuren & 3D** | `fabrik/`, `img/figuren-*`, `img/objekte3d/`, Animationslisten | Spiellogik, Gegnerwerte, Quests |
| **Worldbuilding** | `realtime/welt/`, Weltkarte, Minikarten, Gelände, Kacheln | Quests, Server, Client-Code |
| **Konzept & Review** | `doku/` (Konzepte, `STAND.md`, `KANON.md`) | Code |

Braucht eine Rolle etwas aus einem fremden Bereich (z. B. Gegnerwerte für ein neues Modell, ein neues Quest-Ereignis):
**nicht selbst ändern**, sondern ein GitHub-Issue mit dem Label der zuständigen Rolle anlegen.
Systeme und Integration teilen sich `realtime/shared` und den Client: **Systeme baut Strukturen** (Felder, Funktionen, Ereignisse), **Integration trägt Inhalte ein**, **Oberfläche baut die Fenster und das HUD** (Systeme liefert dafür Daten und Ereignisse). Beide holen mindestens täglich `feature/realtime-engine` in ihren Zweig.

## Erzeugte Dateien
`echtzeit/spiel.js`, `echtzeit/index.html`, `echtzeit/figurentest.*`, `realtime/shared/weltzonen.ts`, `realtime/server/dist/`,
`realtime/test/sim.gebaut.mjs` und andere gebaute Dateien **nicht committen**, außer als Rolle Integration.
Sie werden von der Integration bzw. der Pipeline „Welt live“ neu gebaut (`.github/scripts/welt-live.sh`).

## Arbeiten und Abgeben
- Auf dem **eigenen Zweig** arbeiten (`claude/…`), nie direkt auf `feature/realtime-engine` oder `main` – außer als Integration.
- Kleine Commits, Nachricht auf Deutsch: was und warum.
- Vor dem Push die Tests des eigenen Bereichs laufen lassen (siehe `doku/ARBEITSWEISE.md`). GitHub prüft nach jedem Push zusätzlich die Server-Tests (Workflow „Tests“).
- Ein Issue ist erledigt, wenn der Commit gepusht ist: im Issue kurz schreiben, was gemacht wurde, mit Commit-Kennung.
- Entscheidungen des Nutzers gehören in `doku/KANON.md` (pflegt die Rolle Konzept & Review; andere schreiben sie ins Issue).

## Nie
- Geheime Schlüssel (Supabase Secret, Service-Role, Meshy-API-Key …) in Dateien schreiben. Im Browser steht nur der öffentliche Publishable Key (`verbindung.js`).
- Auf `main` etwas löschen. `main` ist die Webseite und wird nur von der Pipeline befüllt.
- Supabase-Migrationen ändern, die schon eingespielt sind – immer eine neue Migration mit Rückbau und Test.
