#!/usr/bin/env python3
"""Mythara – Kampfgebiete der offenen Welt für die Simulation (shared/weltzonen.ts).

Jede Region der Welt ist Kampfgebiet (Einzelkampf), außer den sicheren (SICHER, z. B. die Waldmark). Je Gebiet: das Gehraster der ganzen Region aus den Weltdaten (echtzeit/welt, „geh“ je Chunk) in Rechenfeldern
(ein Weltfeld = ein Rechenfeld, 48 Bildpunkte) und die Lager der Gegner in Weltfeldern. Der Spielserver rechnet darauf eine
gemeinsame Simulation; die offene Welt zeigt Gegner, Treffer und Leben an derselben Stelle – ohne eigene Kampfszene.
Aufruf (im Ordner realtime): python3 werkzeug/weltzonen.py
"""
import json, os
HIER = os.path.dirname(os.path.abspath(__file__)); WURZEL = os.path.normpath(os.path.join(HIER, "..", "..")); WELT = os.path.join(WURZEL, "echtzeit", "welt")
C = 32
welt = json.load(open(os.path.join(WELT, "welt.json")))
# Grundregel: JEDE Region der Welt ist ein Kampfgebiet mit Einzelkampf (einer gegen einen) – neue Regionen also automatisch.
# Ausnahmen nur hier (aggro/leine/wandern: Angriffsreichweite, Verfolgungsweite, Umherstreifen der Gegner – sonst 5/14/4):
#   SICHER     – Regionen, in denen nicht gekämpft wird (sicherer Ort)
#   BESONDERS  – Regionen mit eigenem Kartennamen, eigener Stufe, Gegnerlagern und Mehrkampf-Bereichen (Weltfelder [x0, y0, x1, y1])
SICHER: set = set()  # seit Zonen Stufe 2 (25.11.2026) ist auch die Waldmark Teil der einen Kampfwelt (Einzelkampf, ohne Gegner)
# Der Unterschlupf (Welt-Pipeline, werkzeug/welt/unterschlupf.mjs): Lager und Mehrkampf-Halle kommen aus der Quelle der Region
import subprocess
US = json.loads(subprocess.run(["node", "-e", "import('./werkzeug/welt/unterschlupf.mjs').then((m) => console.log(JSON.stringify({ lager: m.LAGER, mehrkampf: m.MEHRKAMPF })))"],
                               cwd=os.path.join(WURZEL, "realtime"), capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])  # die Quelle meldet zuerst ihren Umfang
BESONDERS = {
    # #116: nach der Quest die Bosse öffentlich in ihren Räumen (stärkere Fassung, Wiederkehr 10 min); wer die Quest macht oder „eigene Instanz“ wählt, steht in einer Kopie und sieht sie nicht
    "federmutter_kammer": {"leine": 14, "wandern": 0, "mehrkampf": [[11520, 9600, 11551, 9631]], "lager": [("federmutter", 11536, 9611)]},  # #132: ihr Nest unter dem Steinkreis
    "rabengrund_thronsaal": {"leine": 14, "wandern": 0, "mehrkampf": [[10752, 9600, 10783, 9631]], "lager": [("oberster_rabenpriester", 10768, 9606)]},
    "hauptmann_gruft": {"leine": 14, "wandern": 0, "mehrkampf": [[11200, 9600, 11231, 9631]], "lager": [("grauer_hauptmann", 11216, 9619)]},
    "tempel_kammer": {"leine": 14, "wandern": 0, "mehrkampf": [[11360, 9600, 11391, 9631]], "lager": [("sandmutter", 11376, 9612)]},
    "wrack_kajuete": {"leine": 14, "wandern": 0, "mehrkampf": [[11488, 9600, 11519, 9631]], "lager": [("wrackkapitaen", 11504, 9614)]},
    # Phase 10 (#92): Klippenhöhlen (Untergrund, Welt #82) – Strandräuber im Schmugglerversteck, Krabben im Gezeitenbecken; der Wrackkapitän in der Kajüte (Instanz wrack_kajuete)
    "klippenhoehlen": {"leine": 10, "wandern": 2,
                       "lager": [("strandraeuber_saebel", 11442, 9618), ("strandraeuber_armbrust", 11444, 9614), ("strandraeuber_saebel", 11470, 9616), ("strandraeuber_armbrust", 11468, 9614),
                                 ("riesenkrabbe", 11450, 9645), ("strandkrabbe", 11448, 9643)]},
    # Phase 10 (#92): Smaragdküste (Festland-Kacheln) – Krabben am Strand und Wrack, Seevögel an den Klippen, Strandräuber am Wrack, Lurche in den Mangroven.
    "fl_186_211": {"leine": 12, "wandern": 3,
                   "lager": [("strandkrabbe", 6230, 7150), ("strandkrabbe", 6228, 7148), ("strandkrabbe", 6230, 7148),
                             ("seevogel", 6160, 7060), ("seevogel", 6158, 7058), ("seevogel", 6140, 7110)]},
    "fl_186_225": {"leine": 12, "wandern": 3,
                   "lager": [("riesenkrabbe", 6290, 7262), ("strandraeuber_saebel", 6288, 7260), ("strandraeuber_armbrust", 6290, 7260), ("strandraeuber_saebel", 6292, 7260)]},
    "fl_201_225": {"leine": 12, "wandern": 3, "lager": [("mangrovenlurch", 6500, 7580), ("mangrovenlurch", 6498, 7578), ("mangrovenlurch", 6500, 7578)]},
    # Phase 9 (#86): die Glutsande (Festland-Kacheln der Welt #79) – Sandkriecher in den Dünen, Glutskorpione an der Salzpfanne, Karawanenräuber am Kanal (F1).
    "fl_216_211": {"leine": 12, "wandern": 3,
                   "lager": [("sandkriecher", 7045, 6856), ("sandkriecher", 7043, 6854), ("glutskorpion", 7045, 6854), ("glutskorpion", 7047, 6854)]},
    "fl_216_198": {"leine": 12, "wandern": 3,
                   "lager": [("karawanenraeuber_saebel", 7209, 6728), ("karawanenraeuber_saebel", 7207, 6726), ("karawanenraeuber_bogen", 7209, 6726), ("karawanenraeuber_bogen", 7211, 6726),
                             ("glutskorpion", 7330, 6630), ("glutskorpion", 7328, 6628), ("glutskorpion", 7330, 6628)]},
    # Phase 9 (#86, F3): der versandete Tempel (Untergrund, Welt #79) – Glutgeister und Sandkriecher; die Sandmutter in ihrer Kammer (Instanz tempel_kammer)
    "tempel": {"leine": 10, "wandern": 2, "lager": [("glutgeist", 11294, 9622), ("sandkriecher", 11292, 9620), ("glutgeist", 11328, 9618), ("glutgeist", 11326, 9616), ("sandkriecher", 11312, 9640)]},
    # Phase 8 (#58): die Fahlen Weiten (Festland-Kacheln der Welt #50) – Heidewölfe in der offenen Heide, der Rudelführer mit Rudel (E1),
    # Wiedergänger bei den Hügelgräbern (friedlich beim Glockenschlag), Deserteure am Grenzposten (E3).
    # Festland-Kacheln: seit #122 Teil der Kampfwelt
    "fl_201_183": {"leine": 12, "wandern": 3,
                   "lager": [("heidewolf", 6560, 5900), ("heidewolf", 6558, 5898), ("heidewolf", 6560, 5898),
                             ("deserteur_schwert", 6640, 6110), ("deserteur_schwert", 6638, 6108), ("deserteur_armbrust", 6640, 6108), ("deserteur_armbrust", 6630, 6122)]},
    "fl_201_169": {"leine": 12, "wandern": 3,
                   "lager": [("rudelfuehrer", 6520, 5830), ("heidewolf", 6518, 5828), ("heidewolf", 6520, 5828),
                             ("wiedergaenger", 6480, 5795), ("wiedergaenger", 6478, 5793), ("wiedergaenger", 6440, 5760)]},
    # Phase 8 (#58): Grabkammern und das Grab des Grauen Hauptmanns (Untergrund, Welt #50) – Grabwächter und Wiedergänger; der Hauptmann in der Gruft (Instanz)
    "grabkammer_1": {"leine": 10, "wandern": 1, "lager": [("grabwaechter", 11088, 9614), ("wiedergaenger", 11086, 9612), ("wiedergaenger", 11088, 9612)]},
    "grabkammer_2": {"leine": 10, "wandern": 1, "lager": [("grabwaechter", 11120, 9614), ("wiedergaenger", 11118, 9612), ("wiedergaenger", 11120, 9612)]},
    "hauptmann_grab": {"leine": 10, "wandern": 1, "lager": [("grabwaechter", 11158, 9618), ("grabwaechter", 11162, 9618), ("wiedergaenger", 11160, 9618), ("wiedergaenger", 11180, 9640), ("wiedergaenger", 11182, 9638)]},
    # Phase 7 (#40): Ostufer – Schlickkrebse am Westufer, Splitterreiher auf den Wiesen (Stufe 45–60, nur über die Fähre)
    "ostufer": {"leine": 12, "wandern": 3,
                "lager": [("schlickkrebs", 6800, 6520), ("schlickkrebs", 6798, 6518), ("schlickkrebs", 6800, 6560), ("schlickkrebs", 6802, 6558),
                          ("splitterreiher", 6830, 6480), ("splitterreiher", 6828, 6478), ("splitterreiher", 6860, 6540), ("splitterreiher", 6870, 6600), ("splitterreiher", 6868, 6598)]},
    # Phase 7 (#40, D2): der Turm mit dem grünen Licht – Turmwächter auf den Ebenen, das Grünlicht mit einem Wächter auf dem Dach
    "turm_ebene1": {"leine": 10, "wandern": 1, "lager": [("turmwaechter", 10896, 9612), ("turmwaechter", 10894, 9610)]},
    "turm_ebene2": {"leine": 10, "wandern": 1, "lager": [("turmwaechter", 10928, 9612), ("turmwaechter", 10926, 9610)]},
    "turm_ebene3": {"leine": 10, "wandern": 1, "lager": [("turmwaechter", 10960, 9612)]},
    "turm_dach": {"leine": 10, "wandern": 1, "lager": [("gruenlicht", 10990, 9612), ("turmwaechter", 10988, 9614)]},
    # Phase 6 (#17, #26): Aschenwerth – drei Novizen am Steinkreis (friedlich mit Rabenkapuze), Akoluthen und die Federmutter im Heiligtum, Moorraben am Moor
    # dazu Phase 4 (#15): Banditenlager am Moorrand im Norden (Späher, Schläger, Armbrustschütze) – Mehrkampf, damit ein fliehender Späher Hilfe bekommt
    "aschenwerth": {"leine": 12, "wandern": 2, "mehrkampf": [[6200, 6600, 6224, 6620]],
                    "lager": [("bandit_spaeher", 6206, 6608), ("bandit_spaeher", 6218, 6608), ("bandit_schlaeger", 6212, 6609), ("bandit_armbrust", 6210, 6614), ("bandit_spaeher", 6216, 6614),
                              ("rabenpriester_novize", 6240, 6728), ("rabenpriester_novize", 6244, 6728), ("rabenpriester_novize", 6242, 6730),
                              ("rabenpriester_akoluth", 6212, 6714), ("rabenpriester_akoluth_speer", 6214, 6716),
                              ("moorrabe", 6198, 6688), ("moorrabe", 6200, 6688), ("moorrabe", 6202, 6688)]},
    # Phase 6 (#17, #26): Rabengrund – Federgänge mit Moorrabenschwärmen und Akoluthen bis zum Kerker; der Oberste wartet im Thronsaal (Instanz, shared/bosse.ts)
    "rabengrund": {"leine": 10, "wandern": 2, "mehrkampf": [],
                   "lager": [("moorrabe", 10592, 9643), ("moorrabe", 10590, 9641), ("moorrabe", 10592, 9641),
                             ("rabenpriester_akoluth", 10600, 9631), ("rabenpriester_akoluth_speer", 10598, 9629),
                             ("moorrabe", 10622, 9672), ("moorrabe", 10624, 9672), ("moorrabe", 10616, 9674),
                             ("rabenpriester_akoluth_speer", 10640, 9625), ("rabenpriester_akoluth", 10638, 9623), ("kerkermeister", 10645, 9612)]},  # C3: der Kerkermeister im Kerker trägt den Schlüssel
    # Banditen-Hauptquartier unter der Hütte in der Westmark: neun Dolch-Banditen in sechs Räumen, die Halle ist Mehrkampf; Gegner bleiben in ihren Räumen
    # Phase 4: die Quelle stellt Dolch-Banditen auf – hier bekommen sie ihre Rolle: Wachstube Schläger + Armbrust, Schlafsaal Schläger + Späher, Beutelager Schläger, Halle gemischt
    "unterschlupf": {"karte": "unterschlupf", "stufe": 4, "aggro": 4, "leine": 10, "wandern": 2, "mehrkampf": US["mehrkampf"],
                     "lager": [(art, l[1], l[2]) for art, l in zip(["bandit_schlaeger", "bandit_armbrust", "bandit_schlaeger", "bandit_spaeher", "bandit_schlaeger", "bandit_armbrust", "bandit_schlaeger", "bandit_spaeher"], US["lager"])]},
    # Phase 4 (#15): Späher-Lager in der Westmark (Zelte der Welt-Pipeline, #21) – Mehrkampf, damit ein fliehender Späher beim Kumpan wirklich Hilfe bekommt
    "westmark": {"aggro": 4, "leine": 10, "wandern": 2, "mehrkampf": [[6272, 6544, 6298, 6564]],
                 "lager": [("bandit_spaeher", 6280, 6552), ("bandit_spaeher", 6285, 6550), ("bandit_spaeher", 6290, 6554), ("bandit_spaeher", 6282, 6558), ("bandit_spaeher", 6288, 6558), ("bandit_spaeher", 6278, 6555)]},
    # Phase 4 (#16): Hauptmann Rotmantel als öffentlicher Mini-Boss (3 min Wiederkehr, config.ts) – wer B4 noch hat, ist in seiner eigenen Kopie der Kammer (shared/bosse.ts)
    "rotmantel_kammer": {"aggro": 3, "leine": 8, "wandern": 0, "mehrkampf": [[10432, 9600, 10463, 9631]], "lager": [("rotmantel", 10448, 9614)]},
    # Die Banditen-Lichtung im Kreuzwald: vier Dolch-Banditen, Einzelkampf (seit 22.11.2026, vorher Mehrkampf). Karte/Stufe wie bisher (Buchungen laufen als „kreuzwald“).
    "waldweg": {"karte": "kreuzwald", "stufe": 3, "aggro": 4,
                "lager": [("bandit_dolch", 6544, 6578), ("bandit_dolch", 6556, 6575), ("bandit_dolch", 6548, 6589), ("bandit_dolch", 6561, 6586)]},
    # Die verfallene Feste im Nordwald (24.11.2026): fünf Waldgolems im Innenhof, Aggro 4 Felder (nur gegen Helden unter Level 15, config.ts), Leine 10, Streifen 2
    "nordwald": {"aggro": 4, "leine": 10, "wandern": 2,
                 "lager": [("waldgolem", 6314, 6360), ("waldgolem", 6328, 6355), ("waldgolem", 6342, 6366), ("waldgolem", 6322, 6370), ("waldgolem", 6336, 6378)]},
    # Zielscheiben am Südturm der Waldmark (Phase 2 „Waldland“, Quest A1, 26.11.2026): unverwundbare Strohscheiben, greifen nie an (config.ts zielscheibe)
    "waldmark": {"aggro": 0, "leine": 1, "wandern": 0, "lager": [("zielscheibe", 6436, 6460), ("zielscheibe", 6433, 6460)]},
    # Der Moosrain im Osthof (Quest „Der stille Rain“, 23.11.2026): zehn passive Mooshocker (#81: drei mehr) in lockeren Gruppen nordöstlich der Windmühle, Leine 8, Streifen 2
    "osthof": {"aggro": 0, "leine": 8, "wandern": 2,
               "lager": [("mooshocker", 6576, 6418), ("mooshocker", 6578, 6410), ("mooshocker", 6583, 6414), ("mooshocker", 6585, 6406), ("mooshocker", 6589, 6417), ("mooshocker", 6580, 6403), ("mooshocker", 6566, 6408), ("mooshocker", 6572, 6414), ("mooshocker", 6574, 6405), ("mooshocker", 6591, 6409)]  # +3 (#81)
               # Kuhgehege (Handwerk, 25.11.2026): zehn friedliche Kühe hinter Zaun (shared/handwerk_welt.json), Kuhhaut für die Werkbank
               + [("kuh", 6522, 6409), ("kuh", 6527, 6408), ("kuh", 6533, 6409), ("kuh", 6539, 6408), ("kuh", 6524, 6412), ("kuh", 6530, 6412), ("kuh", 6536, 6413), ("kuh", 6521, 6416), ("kuh", 6528, 6416), ("kuh", 6538, 6417)]},
}
# Süden (#126, welt/sueden_orte.json): Gegnerplätze von Heckenhof bis Lehmfurt (Stufe 2–30), Tiere zur Stimmung; zu den Gebieten oben dazu
SUEDEN = {
    "fl_201_211": [("feldhase", 6480, 6821), ("feldhase", 6478, 6819), ("kraehenschwarm", 6480, 6819), ("kraehenschwarm", 6482, 6819),
                   ("schaf", 6504, 6818), ("schaf", 6502, 6816), ("schaf", 6504, 6816),
                   ("schilfkroete", 6458, 7198), ("schilfkroete", 6456, 7196), ("ente", 6455, 7194),
                   ("wegelagerer_knueppel", 6432, 6950), ("wegelagerer_knueppel", 6432, 6948), ("wegelagerer_schleuder", 6434, 6948),
                   ("wegelagerer_knueppel", 6496, 7166), ("wegelagerer_schleuder", 6496, 7164), ("wegelagerer_schleuder", 6498, 7164)],
    "fl_186_211": [("wildbienen_schwarm", 6414, 6916), ("wildbienen_schwarm", 6412, 6914),
                   ("fuchs", 6366, 6998), ("fuchs", 6364, 6996), ("wildschwein", 6366, 6996), ("wildschwein", 6368, 6996),
                   ("graupelz", 6342, 6968), ("heidewolf", 6340, 6966), ("heidewolf", 6342, 6966)],
    "fl_201_225": [("steinschlucker", 6500, 7237), ("steinschlucker", 6498, 7235), ("steinschlucker", 6500, 7235)],
}
for rid, l in SUEDEN.items(): BESONDERS.setdefault(rid, {"leine": 12, "wandern": 3, "lager": []})["lager"] += l
# #130 Gegnerdichte (Welt, welt/gegnerplaetze.json): spätestens alle ~25 Felder ein Gegnerplatz. Plätze mit quelle „fehlt“ (Modell nötig: Ockerlande, Hochlande,
# Frostkrone, Drachenarm) vorerst ausgelassen, die des Südens stehen schon oben. Namen der Welt → Gegner (abwechselnd bei Gruppen); unbekannte Gegner fallen weg.
GP_DATEI = os.path.join(WURZEL, "realtime", "welt", "gegnerplaetze.json")
# #138: Modelle des Nutzers sind da (Figuren 8c2ed9b25) – deren Plätze mit quelle „fehlt“ gelten jetzt; der Drakling erst, wenn er als Bodengegner da ist
GP_MODELL_DA = {"steppenwolf", "ockerhyaene", "hochlandwidder", "hochlandbaer", "klippenadler", "bergtroll", "tundraelch", "frostwolf", "eisgolem", "drakling"}  # Drakling als Bodengegner: Figuren 7cd8342fd
GP_ALIAS = {"wolf": ["heidewolf"], "strandraeuber": ["strandraeuber_saebel", "strandraeuber_armbrust"], "karawanenraeuber": ["karawanenraeuber_saebel", "karawanenraeuber_bogen"],
            "wegelagerer": ["wegelagerer_knueppel", "wegelagerer_schleuder"]}
import re as _re
BEKANNT = set(_re.findall(r"^  ([a-z_0-9]+): \{ name:", open(os.path.join(WURZEL, "realtime", "shared", "config.ts"), encoding="utf-8").read(), _re.M))
GP = {}; GP_AUS = {"fehlt": 0, "unbekannt": 0}
if os.path.exists(GP_DATEI):
    for p in json.load(open(GP_DATEI, encoding="utf-8"))["plaetze"]:
        q = p.get("quelle", "")
        if (q == "fehlt" and not all(g in GP_MODELL_DA for g in p["gegner"])) or q.startswith("Süden"): GP_AUS["fehlt"] += 1 if q == "fehlt" else 0; continue
        reihe = [a for g in p["gegner"] for a in GP_ALIAS.get(g, [g])]
        for k in range(max(1, int(p.get("anzahl", 1)))):
            art = reihe[k % len(reihe)]
            if art not in BEKANNT: GP_AUS["unbekannt"] += 1; continue
            dx, dy = [(0, 0), (2, 0), (0, 2), (2, 2), (-2, 0), (0, -2)][k % 6]
            GP.setdefault(p["region"], []).append((art, int(p["x"]) + dx, int(p["y"]) + dy))
# Gebaute Lager (Quest- und Trainingsplätze wie Moosrain, Kreuzwald-Lichtung, Westmark) zählen für die Dichte mit (Hinweis der Welt): Gegnerplätze näher als
# GP_ABSTAND Felder an einem gebauten Lager fallen weg, damit dort nur die geplanten Gegner stehen
GP_ABSTAND = 20
_gebaut = [(wx, wy) for z in BESONDERS.values() for (_a, wx, wy) in z.get("lager", [])]
for rid in list(GP):
    vor = len(GP[rid]); GP[rid] = [g for g in GP[rid] if all(abs(g[1] - x) > GP_ABSTAND or abs(g[2] - y) > GP_ABSTAND for (x, y) in _gebaut)]; GP_AUS["nah"] = GP_AUS.get("nah", 0) + vor - len(GP[rid])
# #143 Streifgebiete (Welt, welt/streifgebiete.json): 5–7 Tiere derselben Art, jedes wandert für sich über eine größere Fläche (Rechteck in Weltfeldern).
# Form: {"gebiete": [{"id": "...", "gegner": "heidewolf", "anzahl": 6, "rechteck": [x0, y0, x1, y1], "region": "fl_..." (sonst die Region der Mitte)}]}
# Startfelder: zufällig (fest je Gebiet) auf freien Feldern im Rechteck, nicht näher als GP_ABSTAND an einem gebauten Lager (Questorte)
STREIF_DATEI = os.path.join(WURZEL, "realtime", "welt", "streifgebiete.json")
STREIF = {}; STREIF_AUS = 0
if os.path.exists(STREIF_DATEI):
    for s in json.load(open(STREIF_DATEI, encoding="utf-8")).get("gebiete", []):
        arten = [a for g in ([s["gegner"]] if isinstance(s["gegner"], str) else s["gegner"]) for a in GP_ALIAS.get(g, [g])]
        if not all(a in BEKANNT for a in arten): STREIF_AUS += 1; print(f"  Hinweis: Streifgebiet {s.get('id')}: Gegner {s['gegner']} unbekannt – übersprungen"); continue
        STREIF.setdefault(s.get("region"), []).append({**s, "arten": arten})
aus = ["/* Erzeugt von werkzeug/weltzonen.py – nicht von Hand ändern. Kampfgebiete der offenen Welt (jede Region außer den sicheren): Gehraster, Start, Lager der Gegner, Mehrkampf-Bereiche. */",
       "export interface WeltKampfGebiet { region: string; karte: string; name: string; x0: number; y0: number; b: number; h: number; stufe: number; /** Gehraster je Zeile in Lauflängen („12.3T.“ = 12 frei, 3 gesperrt, 1 frei; #122) */ lauf: string[]; /** dieselben Zeilen ausgeschrieben (erst beim ersten Gebrauch) */ zeilen: string[]; start: number[][]; lager: { art: string; x: number; y: number; gruppe: number; gp?: number; /** #143: Streifgebiet (Rechteck wie x/y) – das Tier wandert für sich darin */ streif?: number[] }[]; mehrkampf: number[][]; aggro: number; leine: number; wandern: number }",
       "const ROH: Omit<WeltKampfGebiet, \"zeilen\">[] = ["]
# #122 (Entscheidung des Nutzers, 27.11.): die ganze Welt ist Kampfwelt, auch das Festland. Die Raster stehen in Lauflängen in der Datei (sonst rund 8 MB)
FESTLAND: set = set()
def lauf(zeile):
    aus, i = [], 0
    while i < len(zeile):
        j = i
        while j < len(zeile) and zeile[j] == zeile[i]: j += 1
        aus.append((str(j - i) if j - i > 1 else "") + zeile[i]); i = j
    return "".join(aus)
for rid, eintrag in welt["regionen"].items():
    if rid in SICHER: print(f"{rid}: sicherer Ort"); continue
    z = BESONDERS.get(rid, {}); R = eintrag["region"]; ux, uy = R["ursprung"]; bw, bh = R["chunks"]; x0, y0, B, H = ux * C, uy * C, bw * C, bh * C
    raster = [["T"] * B for _ in range(H)]
    for j in range(bh):
        for i in range(bw):
            p = os.path.join(WELT, f"{ux + i}_{uy + j}.json")
            if not os.path.exists(p): continue
            for yy, zeile in enumerate(json.load(open(p))["geh"]):
                for xx, ch in enumerate(zeile): raster[j * C + yy][i * C + xx] = "." if ch == "." else "T"
    # Lager auf einem gesperrten Feld: übersprungen (mit Hinweis), statt den Bau anzuhalten – so dürfen Lager für Gebiete stehen, die die Welt gerade umbaut (Phase 8: Fahle Weiten)
    alle = z.get("lager", []); frei = [(a, wx, wy) for (a, wx, wy) in alle if 0 <= wy - y0 < H and 0 <= wx - x0 < B and raster[wy - y0][wx - x0] == "."]
    gp_weg = 0; belegt = {(l[1], l[2]) for l in frei}
    for (a, wx, wy) in GP.get(rid, []):   # Gegnerplätze (#130): das nächste freie Feld im Umkreis von 4 Feldern
        f = next(((wx + ox, wy + oy) for r in range(5) for oy in range(-r, r + 1) for ox in range(-r, r + 1) if max(abs(ox), abs(oy)) == r
                  and 0 <= wy + oy - y0 < H and 0 <= wx + ox - x0 < B and raster[wy + oy - y0][wx + ox - x0] == "." and (wx + ox, wy + oy) not in belegt), None)
        if f: frei.append((a, f[0], f[1], 1)); belegt.add(f)
        else: gp_weg += 1
    if GP.get(rid): print(f"  {rid}: {len(GP[rid]) - gp_weg} Gegner aus den Gegnerplätzen (#130){f', {gp_weg} ohne freies Feld' if gp_weg else ''}")
    import random as _zufall
    for s in STREIF.get(rid, []) + [s for s in STREIF.get(None, []) if x0 <= (s["rechteck"][0] + s["rechteck"][2]) // 2 < x0 + B and y0 <= (s["rechteck"][1] + s["rechteck"][3]) // 2 < y0 + H]:
        X0, Y0, X1, Y1 = max(s["rechteck"][0], x0), max(s["rechteck"][1], y0), min(s["rechteck"][2], x0 + B - 1), min(s["rechteck"][3], y0 + H - 1)
        felder = [(x, y) for y in range(Y0, Y1 + 1) for x in range(X0, X1 + 1) if raster[y - y0][x - x0] == "." and (x, y) not in belegt
                  and all(abs(x - gx) > GP_ABSTAND or abs(y - gy) > GP_ABSTAND for (gx, gy) in _gebaut)]
        ZF = _zufall.Random(s.get("id", f"{X0},{Y0}")); ZF.shuffle(felder); n = min(int(s.get("anzahl", 6)), len(felder))
        rechteck = [(X0 - x0) / 2, (Y0 - y0) / 2, (X1 + 1 - x0) / 2, (Y1 + 1 - y0) / 2]
        for k in range(n): frei.append((s["arten"][k % len(s["arten"])], felder[k][0], felder[k][1], 0, rechteck)); belegt.add(felder[k])
        print(f"  {rid}: Streifgebiet {s.get('id')}: {n} × {'/'.join(s['arten'])} auf {X1 - X0 + 1} × {Y1 - Y0 + 1} Feldern (#143)")
    for (a, wx, wy) in alle:
        if (a, wx, wy) not in frei: print(f"  Hinweis: {rid}: Lager {a} bei {wx},{wy} liegt nicht auf freiem Feld – übersprungen")
    lager = [{"art": l[0], "x": (l[1] - x0) / 2, "y": (l[2] - y0) / 2, "gruppe": n + 1, **({"gp": 1} if len(l) > 3 and l[3] else {}), **({"streif": l[4]} if len(l) > 4 else {})} for n, l in enumerate(frei)]  # gp: aus den Gegnerplätzen (#130)
    start = eintrag["start"][0]; karte = z.get("karte", "welt_" + rid)
    aus.append("  " + json.dumps({"region": rid, "karte": karte, "name": R.get("name", rid), "x0": x0, "y0": y0, "b": B, "h": H, "stufe": z.get("stufe", R.get("stufe", 1)),
        "lauf": [lauf("".join(r)) for r in raster], "start": [[(start[0] - x0) / 2 - 0.5, (start[1] - y0) / 2 - 0.5]], "lager": lager,
        "mehrkampf": [[a - x0, b - y0, c - x0, d - y0] for (a, b, c, d) in z.get("mehrkampf", [])],
        "aggro": z.get("aggro", 5), "leine": z.get("leine", 14), "wandern": z.get("wandern", 4)}, ensure_ascii=False) + ",")
    print(f"{rid} → {karte}: {B}×{H}, {sum(r.count('.') for r in raster)} frei, {len(lager)} Gegner, {'Mehrkampf-Bereiche: ' + str(len(z['mehrkampf'])) if z.get('mehrkampf') else 'Einzelkampf'}")
aus.append("];")
aus.append("export const WELTKAMPF = ROH as WeltKampfGebiet[];")
aus.append("/** Lauflängen ausschreiben (eine Zeile) */")
aus.append("export const laufAus = (l: string): string => l.replace(/(\\d+)([^\\d])/g, (_m, n: string, c: string) => c.repeat(Number(n)));")
aus.append("for (const z of WELTKAMPF) Object.defineProperty(z, \"zeilen\", { configurable: true, enumerable: false, get() { const v = z.lauf.map(laufAus); Object.defineProperty(z, \"zeilen\", { value: v }); return v; } });")
aus.append("/** Alle Regionen der Welt (auch die sicheren) – der Server lässt dort die gemeinsame Welt zu (Anwesenheit, Chat) */")
aus.append("export const WELTREGIONEN: string[] = " + json.dumps([r for r in welt["regionen"] if r not in FESTLAND]) + ";")
open(os.path.join(WURZEL, "realtime", "shared", "weltzonen.ts"), "w").write("\n".join(aus) + "\n")
