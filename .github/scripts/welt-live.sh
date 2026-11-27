#!/usr/bin/env bash
# Mythara – Arbeitsstände automatisch live stellen (läuft im GitHub-Workflow „Welt live“, alle 15 Minuten und auf Knopfdruck).
#
# 1. Neue Commits der Arbeitszweige (QUELLEN) werden in feature/realtime-engine gemergt. Konflikte nur in erzeugten Dateien
#    (gebautes Spiel, Kampfraster) werden aufgelöst und danach neu erzeugt; ein Konflikt in einer echten Quelldatei bricht ab
#    (der Workflow schlägt fehl, es wird nichts gepusht).
# 2. Danach: Kampfraster neu (werkzeug/weltzonen.py), Typprüfung, Spiel bauen, schnelle Tests – erst wenn alles grün ist, wird gepusht.
#    Render baut den Spielserver aus feature/realtime-engine.
# 3. main (die Webseite): Was in feature/realtime-engine unter echtzeit/, img/, UI/ und .github/scripts/ neu oder geändert ist, kommt nach main.
#    Gelöscht wird auf main nur, was in .github/main-loeschen.txt steht (einmalige Freigabe des Nutzers, #157). Das geht ohne Auschecken (nur Git-Objekte).
#
# Lokal ausprobieren ohne zu pushen:  TROCKEN=1 bash .github/scripts/welt-live.sh
set -euo pipefail

ZIEL="feature/realtime-engine"
QUELLEN="${QUELLEN:-claude/mythara-world-pipeline-z4ynx5 claude/tender-heisenberg-bruby2 claude/riftmere-quests claude/relaxed-sagan-erl6lf}"
# Zweige mit Änderungen unter diesen Pfaden haben einen Lauf des Workflows „Tests“ (Job „server“) – sie kommen nur mit grünem Lauf
# auf ihrem Kopf-Commit durch (#22). Zweige, die nur Bilder, Modelle oder Doku ändern, brauchen keinen.
GETESTET='^(realtime|supabase)/'
# Ergebnis des Jobs „server“ für einen Commit: success | failure | … | fehlt | laeuft | unbekannt (ohne Token)
testlauf() {
  [ -n "${GH_TOKEN:-}" ] || { echo unbekannt; return; }
  curl -fsS -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY:-marlongsimo/Mythara}/commits/$1/check-runs?check_name=server&per_page=20" 2>/dev/null \
  | python3 -c '
import sys, json
try: l = json.load(sys.stdin).get("check_runs", [])
except Exception: print("unbekannt"); sys.exit()
if not l: print("fehlt"); sys.exit()
l.sort(key=lambda r: r.get("started_at") or "", reverse=True); r = l[0]
print(r.get("conclusion") or "laeuft")' || echo unbekannt
}
# alles direkt unter echtzeit/ schreibt realtime/build.mjs (Seiten mit Versionsstempel, Skripte, Manifest)
ERZEUGT='^(echtzeit/[^/]+|realtime/shared/weltzonen\.ts|realtime/server/dist/.*|realtime/test/sim\.gebaut\.mjs)$'
NAME="marlongsimo"; MAIL="208301081+marlongsimo@users.noreply.github.com"
REPO_URL="${REPO_URL:-https://github.com/${GITHUB_REPOSITORY:-marlongsimo/mythara}.git}"
ARBEIT="${ARBEIT:-$(mktemp -d)}"
pushen() { if [ "${TROCKEN:-0}" = 1 ]; then echo "(trocken) git push origin $1"; else git push origin "$1"; fi; }

cd "$ARBEIT"
if [ ! -d repo/.git ]; then git init -q repo; fi
cd repo
git remote remove origin 2>/dev/null || true
if [ -n "${GH_TOKEN:-}" ]; then git remote add origin "https://x-access-token:${GH_TOKEN}@${REPO_URL#https://}"; else git remote add origin "$REPO_URL"; fi
git config user.name "$NAME"; git config user.email "$MAIL"
# nur Commits und Bäume holen (keine Dateiinhalte) – Dateien kommen erst, wenn sie gebraucht werden
git fetch -q --filter=blob:none origin "+refs/heads/$ZIEL:refs/remotes/origin/$ZIEL" "+refs/heads/main:refs/remotes/origin/main"
NEU=()
for q in $QUELLEN; do
  git fetch -q --filter=blob:none origin "+refs/heads/$q:refs/remotes/origin/$q" 2>/dev/null || { echo "Zweig $q gibt es nicht (mehr) – übersprungen"; continue; }
  if git merge-base --is-ancestor "origin/$q" "origin/$ZIEL"; then echo "$q: nichts Neues"; continue; fi
  echo "$q: $(git rev-list --count "origin/$ZIEL..origin/$q") neue Commits"
  if git diff --name-only "origin/$ZIEL...origin/$q" | grep -Eq "$GETESTET"; then
    # jüngster Commit (erste Elternlinie) mit einem Lauf von „Tests“, nach dem unter realtime/ und supabase/ nichts mehr geändert wurde –
    # sein Ergebnis gilt dann für den Kopf (Commits nur in echtzeit/ oder .github/ starten keinen Lauf, Merge-Commits können ihn tragen)
    kopf="$(git rev-parse "origin/$q")"; lauf=fehlt
    for c in $(git rev-list --first-parent --max-count=15 "origin/$q"); do
      git diff --quiet "$c" "origin/$q" -- realtime supabase || break
      l="$(testlauf "$c")"; if [ "$l" != fehlt ]; then kopf="$c"; lauf="$l"; break; fi
    done
    if [ "$lauf" = unbekannt ]; then   # ohne Leserecht auf die Prüfungen (Workflow ohne „checks: read“): wie früher zusammenführen, aber laut sagen
      echo "::warning::$q: Testlauf nicht abfragbar (dem Workflow fehlt „checks: read“) – ohne Prüfung zusammengeführt"
    elif [ "$lauf" != success ] && [ "${OHNE_TESTPRUEFUNG:-0}" != 1 ]; then
      echo "::warning::$q übersprungen: Tests für ${kopf:0:8} sind nicht grün ($lauf) – kommt beim nächsten Lauf mit, sobald sie grün sind"; continue; fi
    echo "$q: Tests für ${kopf:0:8} grün"
  fi
  NEU+=("$q")
done

STAND="origin/$ZIEL"
if [ "${#NEU[@]}" -gt 0 ]; then
  # Arbeitskopie nur mit dem, was zum Bauen nötig ist (die Figuren-Fabrik mit ihren großen Dateien bleibt außen vor)
  git sparse-checkout set realtime echtzeit img   # img: die Formprüfung der Welt sieht nach, ob die Objektbilder da sind
  git checkout -q -B "$ZIEL" "origin/$ZIEL"
  for q in "${NEU[@]}"; do
    if ! git merge -q --no-edit -m "Automatisch: Merge $q" "origin/$q"; then
      while IFS= read -r f; do
        if [[ "$f" =~ $ERZEUGT ]]; then git checkout -q --ours -- "$f"; git add -- "$f"
        else echo "::error::Konflikt in $f (Merge von $q) – bitte von Hand zusammenführen"; git merge --abort; exit 1; fi
      done < <(git diff --name-only --diff-filter=U)
      git commit -q --no-edit
    fi
  done
  ( cd realtime
    npm ci --no-audit --no-fund --loglevel=error
    python3 werkzeug/weltzonen.py
    npx tsc --noEmit -p .
    node build.mjs
    for t in kreuzwald einzelkampf welt-raster welt-daten; do node "test/$t.test.mjs" > "/tmp/test-$t.log" 2>&1 || { cat "/tmp/test-$t.log"; echo "::error::Test $t fehlgeschlagen – nichts gepusht"; exit 1; }; tail -1 "/tmp/test-$t.log"; done )
  git add -A realtime echtzeit
  git diff --cached --quiet || git commit -q -m "Automatisch: Kampfraster und Spiel neu gebaut"
  pushen "HEAD:refs/heads/$ZIEL"
  STAND="HEAD"
fi

# main: neue und geänderte Dateien aus echtzeit/, img/, UI/ und .github/scripts/ übernehmen – ohne Auschecken.
# .github/scripts (#85): der Workflow läuft von main und liest dieses Skript dort. Dateien unter .github/workflows/ darf das Token der Pipeline nicht ändern (GitHub) – die bleiben Handarbeit.
# Gelöscht wird auf main nur, was in .github/main-loeschen.txt steht (einmalige Freigabe des Nutzers, #157) – nie etwas unter GESCHUETZT.
MAIN_PFADE="echtzeit img UI .github/scripts"
# Einzeldateien an der Wurzel von main (Quelle=Ziel), siehe seite/LIESMICH.md: die Startseite (#78) und die Weiterleitungen alter Einstiege
MAIN_DATEIEN="realtime/client/startseite.html=index.html seite/manifest.webmanifest=manifest.webmanifest seite/spiel.html=spiel.html"
GESCHUETZT='^(echtzeit/|fonts/|vendor/|supabase/|doku/|realtime/|img/startseite/|img/app/mythara-(180|192|512)|img/app/mythara-maske-512|img/favicon|\.github/|index\.html$|manifest\.webmanifest$|spiel\.html$|CNAME$|robots\.txt$|sitemap\.xml$|verbindung\.js$|UI/mythara-ui\.css$)'
export GIT_INDEX_FILE="$ARBEIT/main.index"
git read-tree origin/main
AENDERUNG="$(git diff --name-only --diff-filter=AM origin/main "$STAND" -- $MAIN_PFADE)"; n=0
if [ -n "$AENDERUNG" ]; then
  printf '%s\n' "$AENDERUNG" > "$ARBEIT/liste"; n=$(printf '%s\n' "$AENDERUNG" | wc -l)
  git ls-tree -r "$STAND" -- $MAIN_PFADE | python3 -c '
import sys
liste = set(open(sys.argv[1], encoding="utf-8").read().splitlines())
for zeile in sys.stdin:
    if zeile.rstrip("\n").split("\t", 1)[1] in liste: sys.stdout.write(zeile)' "$ARBEIT/liste" | git update-index --index-info
fi
for paar in $MAIN_DATEIEN; do q="${paar%%=*}"; z="${paar#*=}"
  b="$(git rev-parse -q --verify "$STAND:$q" 2>/dev/null)" || continue
  [ "$b" = "$(git rev-parse -q --verify "origin/main:$z" 2>/dev/null || true)" ] && continue
  git update-index --add --cacheinfo "100644,$b,$z"; n=$((n + 1)); echo "main: $q → $z"
done
weg=0
if git cat-file -e "$STAND:.github/main-loeschen.txt" 2>/dev/null; then
  while IFS= read -r f; do
    case "$f" in ""|\#*) continue;; esac
    if [[ "$f" =~ $GESCHUETZT ]]; then echo "::warning::main-loeschen.txt: $f ist geschützt – bleibt"; continue; fi
    git cat-file -e "origin/main:$f" 2>/dev/null || continue
    git update-index --force-remove -- "$f"; weg=$((weg + 1))
  done < <(git show "$STAND:.github/main-loeschen.txt")
fi
if [ "$n" = 0 ] && [ "$weg" = 0 ]; then unset GIT_INDEX_FILE; echo "main: schon aktuell"; exit 0; fi
echo "main: $n Dateien neu oder geändert, $weg gelöscht (main-loeschen.txt)"
BAUM="$(git write-tree)"; unset GIT_INDEX_FILE
COMMIT="$(git commit-tree "$BAUM" -p origin/main -m "Automatisch live: Spiel, Welt und Bilder aus $ZIEL ($(git rev-parse --short "$STAND"))$([ "$weg" -gt 0 ] && echo " – $weg Dateien laut main-loeschen.txt entfernt (#157)")")"
pushen "$COMMIT:refs/heads/main"
echo "main aktualisiert: $COMMIT"
