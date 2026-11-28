#!/usr/bin/env bash
# Mythara Fabrik – komprimiertes Modell (Meshopt, siehe realtime/werkzeug/modelle_komprimieren.mjs) für Blender entpacken.
# Blender liest EXT_meshopt_compression nicht. Die Ausgabe gehört in einen Scratch-Ordner, nie zurück nach img/.
#   fabrik/entpacken.sh <ein.glb> <aus.glb>
set -euo pipefail
[ $# -eq 2 ] || { echo "Aufruf: fabrik/entpacken.sh <ein.glb> <aus.glb>" >&2; exit 2; }
npx -y @gltf-transform/cli@4 dequantize "$1" "$2"
