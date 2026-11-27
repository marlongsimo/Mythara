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
  phase4
  phase4-inhalte
  b3-welt
  b4-welt
  sueden-welt
  welt-federmutter
  welt-gegnerdichte
  welt-troedler
  welt-beleben
  welt-sammelstellen
  welt-streifgebiete
  welt-hochlande
  welt-zunft
  phase5
  phase8-10
  abholen
  handel-welt
  verkauf
  sprint
  stufe
  teleport-welt
  waldgolem
  waldland-welt
  welt-waldmark
  waldweg
  welt-bau
  welt-dreh
  speer
  waffen70
  hochlande-leben
  tiere
  welt-daten
  welt-grenzen
  welt-raster
  welt-rathaus
  welt-unterschlupf
  welt-weidenhain
  weltkampf
  phase6
  inhalt-phase7
  inhalt-phase6
  phase6-quest
  inhalt-phase8
  inhalt-phase9
  inhalt-phase10
  bosse-116
  boss-quest-machbar
  hueter
  zunft
  bank-orte
  steinhag-stadt
  pets
  pets-welt
  bank-platzhalter
  festland-kampf
  inhalt-sueden
  kraeuterkunde
  gegnerlast
  gegner-vorbereitet
  streifgebiete
  belohnung-wahl
  bergwerk-welt
  # Durchspiel-Tests C–H (Quests bf7b907a, fe4714a0, b13ba133)
  c1-welt
  c2-welt
  c2b-welt
  c3-welt
  d-welt
  e-welt
  e2-welt
  e3-welt
  e4-welt
  f3-welt
  g12-welt
  g3-welt
  g3b-welt
  g4-welt
  c3b-welt
  e4b-welt
  f3b-welt
  f-welt
  h-welt
  h23-welt
  h4-welt
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
