#!/bin/bash
# Mythara Fabrik – Seltenheitsstufen der Set-Rüstungen für beide Grundfiguren bauen (nach export3d.py auslagern=…).
#   bash fabrik/stufen_bauen.sh [blender-python]
# Schreibt img/figuren-echt3d/<figur>.teile/<id>.<stufe>.glb für jede Stufe außer „selten“ (= das Teil selbst).
B=${1:-python3}
for f in basemann3d basefrau3d; do for id in ruestung.brust.eisenwacht ruestung.beine.eisenschienen kopf.helm.eisenwacht; do for st in gewoehnlich episch legendaer mythisch; do
  extra=""; [ "$id" = ruestung.beine.eisenschienen ] && extra="metall_c=17"   # helle, leicht farbige Platten: als Metall behandeln, nicht als Messing
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st $extra 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done; done
# Jäger-Set (Grundstufe gewöhnlich, Leder): selten bis mythisch über die Lederfarbe
for f in basemann3d basefrau3d; do for id in ruestung.brust.jaeger ruestung.beine.jaeger kopf.helm.jaegerkapuze; do for st in selten episch legendaer mythisch; do
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st art=leder 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done; done
