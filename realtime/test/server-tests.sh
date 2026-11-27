#!/usr/bin/env bash
# Riftmere – alle Server-Tests ohne Browser nacheinander (sie benutzen feste Ports und dürfen nicht gleichzeitig laufen).
# Aufruf im Ordner realtime/, nach `npm ci` und `node build.mjs`:   bash test/server-tests.sh
# Einzelne Tests:                                                  bash test/server-tests.sh questbau quest01-welt
# Läuft auch auf GitHub nach jedem Push (Workflow „Tests“, .github/workflows/tests.yml).
set -u
cd "$(dirname "$0")/.."

TESTS=(
  abmelden
  ausdauer-welt
  bank-welt
  bergbau-welt
  ein-geraet
  einzelkampf
  figuren3d
  freunde-welt
  handwerk-welt
  holz-welt
  inventar
  inventar-welt
  kampf-v1
  kampf-v2
  kampfwelt
  konto-loeschen
  kreuzwald-server
  kreuzwald
  laden-welt
  quest01
  quest01-welt
  quest02-welt
  quest03-welt
  questbau
  splitterbinden-welt
  fischen-kochen-welt
  b2-welt
  sprint
  stufe
  teleport-welt
  waldgolem
  waldland-welt
  welt-waldmark
  waldweg
  welt-bau
  welt-daten
  welt-grenzen
  welt-raster
  welt-rathaus
  welt-unterschlupf
  welt-weidenhain
  weltkampf
  phase6
  phase6-quest
  phase8-10
  inhalt-phase8
  inhalt-phase9
  inhalt-phase10
  bosse-116
)
[ $# -gt 0 ] && TESTS=("$@")

LOGS="${TEST_LOGS:-$(mktemp -d)}"; fehler=(); start=$(date +%s)
for t in "${TESTS[@]}"; do
  s=$(date +%s)
  if timeout 600 node "test/$t.test.mjs" > "$LOGS/$t.log" 2>&1; then
    printf '✓ %-24s %4ss\n' "$t" "$(( $(date +%s) - s ))"
  else
    printf '✗ %-24s %4ss\n' "$t" "$(( $(date +%s) - s ))"; fehler+=("$t")
    echo "::group::Ausgabe von $t"; tail -40 "$LOGS/$t.log"; echo "::endgroup::"
  fi
done
echo "Dauer: $(( $(date +%s) - start ))s · ${#TESTS[@]} Tests · ${#fehler[@]} fehlgeschlagen"
if [ ${#fehler[@]} -gt 0 ]; then echo "Fehlgeschlagen: ${fehler[*]}"; exit 1; fi
