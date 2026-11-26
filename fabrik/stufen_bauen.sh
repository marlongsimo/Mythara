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
# Magier-Set (Grundstufe gewöhnlich, blaue Robe): Stofffarben
for f in basemann3d basefrau3d; do for id in ruestung.brust.magier ruestung.beine.magierrock kopf.helm.magierkapuze; do for st in selten episch legendaer mythisch; do
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st art=stoff 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done; done
# Eid-Waffen und Sternenschild (Grundstufe selten, Metall)
for f in basemann3d basefrau3d; do for id in waffe.eidschwert waffe.eiddolch waffe.eidzweihaender schild.sternen waffe.sternbrecher waffe.sterndorn waffe.mondbogen.lang waffe.mondbogen.kurz waffe.sternarmbrust; do for st in gewoehnlich episch legendaer mythisch; do
  extra="stark=1 feld=1"; [ "${id#waffe.}" != "$id" ] && extra="metall_c=18 stark=1"   # Klingen mit warmem Ton als Metall behandeln
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st $extra 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done; done
# Anfängerwaffen (Grundstufe gewöhnlich): Schwert und Schild über das Metall (selten = poliert), Bogen und Stab über die Holzfarbe
for f in basemann3d basefrau3d; do for st in selten episch legendaer mythisch; do
  for id in waffe.schwert.ritter schild.rund; do "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st poliert=1 stark=1 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"; done
  for id in waffe.bogen.jagd waffe.stab.hirte; do "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st art=leder 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"; done
done; done
# Sternenszepter: Kristall je Stufe eigens färben
for f in basemann3d basefrau3d; do for st in gewoehnlich episch legendaer mythisch; do
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/waffe.sternenszepter.glb img/figuren-echt3d/$f.teile/waffe.sternenszepter.$st.glb $st metall_c=18 stark=1 feld=1 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done
# Werkzeuge (Utensilien, Grundstufe selten): Stiel bleibt Holz, sechs Stufen inkl. Training
for f in basemann3d basefrau3d; do for id in waffe.holzbeil waffe.spitzhacke; do for st in training gewoehnlich episch legendaer mythisch; do
  "$B" fabrik/seltenheit.py img/figuren-echt3d/$f.teile/$id.glb img/figuren-echt3d/$f.teile/$id.$st.glb $st metall_c=18 stark=1 holz=1 2>&1 | grep -E "^Seltenheit|Trace|Error:" | sed "s|^|$f |"
done; done; done
