#!/bin/sh
# Übernimmt Gestaltung und Bilder der Anmeldeseite in die App (www/), damit die eingebaute Startseite offline genauso aussieht.
set -e; cd "$(dirname "$0")/.."; W=../realtime/client
sed -e 's#\.\./fonts/#fonts/#g' -e 's#\.\./img/echtzeit/start/#bilder/#g' $W/start.css > www/start.css
cp $W/start-passen.js www/start-passen.js
mkdir -p www/fonts www/bilder
cp ../fonts/cinzel-latin-600-normal.woff2 ../fonts/cormorant-garamond-latin-400-normal.woff2 ../fonts/cormorant-garamond-latin-600-normal.woff2 ../fonts/inter-latin-400-normal.woff2 ../fonts/inter-latin-600-normal.woff2 ../fonts/OFL-*.txt www/fonts/
cp ../img/echtzeit/start/hintergrund.webp ../img/echtzeit/start/hintergrund-klein.webp ../img/echtzeit/start/stein.webp ../img/echtzeit/start/ranken.webp ../img/echtzeit/start/emblem.webp www/bilder/
echo "Startseite: Gestaltung übernommen"
