"""Abschlussbericht einer Figur: Tests, Ausrüstung, Nachweis der 8 Richtungen und aller Animationen, Leistung und Speicher, Einschränkungen.
Aufruf: python3 tools/abschlussbericht.py <figur> [messwerte.json]   →   export/<figur>/abschlussbericht.md + nachweis_*.webp"""
import json, os, sys, time
from PIL import Image, ImageDraw
import ebenen as E

def erzeugen(fid, mess=None):
    R = E.lade('configs/render.json'); fig = E.lade(f'configs/figuren/{fid}.json'); kat = E.items(); exp = os.path.join(E.W, 'export', fid)
    ziel = os.path.normpath(os.path.join(E.W, R['export']['ziel'], fig['export'])); F = json.load(open(os.path.join(ziel, 'figur.json'))); B = json.load(open(os.path.join(exp, 'bericht.json')))
    ri = [r['id'] for r in F['richtungen']]; std = F['standardAusruestung']; tief = {}
    # Nachweis: alle Animationen × 8 Richtungen (mittleres Bild), Standardausrüstung bzw. Einhand-Set für die _1h-Animationen
    ein = {**std, 'main_hand': 'test_schwert_kurz', 'off_hand': 'test_schild_rund'}; Z = 110; an_liste = list(F['animationen'])
    nb = Image.new('RGBA', (Z * (len(ri) + 1), Z * len(an_liste) + 24), (36, 34, 44, 255)); d = ImageDraw.Draw(nb)
    for k, r in enumerate(ri): d.text(((k + 1) * Z + Z // 2 - 6, 6), r, fill=(217, 180, 90))
    for j, an in enumerate(an_liste):
        d.text((6, 24 + j * Z + Z // 2), an, fill=(239, 232, 216)); A = F['animationen'][an]
        for k, r in enumerate(ri):
            im = E.zusammensetzen(fid, fig, ein if an.endswith('_1h') else std, an, r, A['frames'] // 2, tief)
            if im: nb.alpha_composite(im.resize((Z, Z), Image.LANCZOS), ((k + 1) * Z, 24 + j * Z))
    nb.save(os.path.join(exp, 'nachweis_richtungen_animationen.webp'), 'WEBP', quality=86)
    # Statistik
    st = F.get('statistik', {}); gpu_alle = sum(v['gpuBytes'] for v in st.values()); datei_alle = sum(v['dateiBytes'] for v in st.values())
    frames_alle = sum(v['frames'] for v in st.values()); einz = sum(v['einzigartig'] for v in st.values())
    sicht = lambda w: [e for e in sum(E.sichtbare_ebenen(fig, w, kat), []) if e in st]
    def set_mb(w): return sum(st[e]['gpuBytes'] for e in sicht(w)) / 1e6, sum(st[e]['dateiBytes'] for e in sicht(w)) / 1e6, len(sicht(w)), sum(st[e]['seiten'] for e in sicht(w))
    z = [f'# Abschlussbericht: {F["name"]}', '', f'Stand {time.strftime("%Y-%m-%d %H:%M")} · Skelett `{F["skelett"]}` · **TEST ASSET** (KayKit-Mannequin CC0, selbstgebaute Platzhalter-Ausrüstung)', '']
    z += ['## 1. Testergebnisse', '', f'Produktionsprüfung (`tools/pruefen.py`): **{B["ok"]} bestanden · {B["fehler"]} Fehler · {B["warnungen"]} Warnungen** (Details: `bericht.md`).', '']
    for x in B['ergebnisse']:
        if x['status'] != 'ok': z.append(f'- {"⚠" if x["status"] == "warnung" else "✗"} {x["gruppe"]}: {x["text"]}')
    if mess and mess.get('tests'): z += ['', 'Weitere Tests:', ''] + [f'- {t}' for t in mess['tests']]
    z += ['', '## 2. Verfügbare Ausrüstung', '', '| Slot | Gegenstand | Typ | Seltenheit | Haltung | Befestigung | Werte |', '|---|---|---|---|---|---|---|']
    sl = E.lade('configs/slots.json')
    for g in sorted(kat.values(), key=lambda g: (list(sl['slots']).index(g['slot']), g['id'])):
        z.append(f'| {sl["slots"][g["slot"]]["name"]} | {g["name"].replace(" (TEST ASSET)", "")} (`{g["id"]}`) | {g["type"]} | {sl["seltenheit"][g["rarity"]]} | {g.get("stance", "–")} | {g["attach"]["mode"]}{" @ " + g["attach"]["socket"] if g["attach"].get("socket") else ""} | {", ".join(f"{k} {v}" for k, v in g["stats"].items()) or "–"} |')
    z += ['', f'{len(kat)} Gegenstände. Alle sind einzeln austauschbar; ungültige Kombinationen (z. B. Zweihandwaffe + Schild) werden abgelehnt bzw. aufgelöst.', '']
    z += ['## 3. Nachweis: 8 Richtungen und alle Animationen', '', '![Nachweis](nachweis_richtungen_animationen.webp)', '', '| Animation | Frames je Richtung | fps | Dauer | Schleife / Halten |', '|---|---|---|---|---|']
    for an, A in F['animationen'].items(): z.append(f'| {an} | {A["frames"]} | {A["fps"]} | {A["frames"] / A["fps"]:.2f} s | {"Schleife" if A["schleife"] else "hält am Ende" if A["halten"] else "einmal"} |')
    z += ['', f'Richtungen (Winkel wie im Spiel, 0° = Osten, 90° = Süden): ' + ', '.join(f'{r["id"]} {r["grad"]}°' for r in F['richtungen']) + '. Keine Spiegelung.', '']
    z += ['Kombinationsbilder (alle 8 Richtungen × Ruhe/Gehen/Angriff/Block): `kombinationen/*.webp`, Überblick `kombinationen/uebersicht.webp`.', '']
    z += ['## 4. Leistung und Speicher', '', f'- Ebenen: {len(st)} · Frames gesamt: {frames_alle} · davon einzigartig gespeichert: {einz} ({100 - 100 * einz / max(1, frames_alle):.0f} % Dubletten gespart)',
          f'- Exportmaßstab {F.get("exportMassstab", 1)} (Figur im Atlas {F["spiel"]["renderHoehePx"]} px hoch, im Spiel {F["spiel"]["figurHoehePx"]} px) · Bildgröße {F["bild"]["breite"]}×{F["bild"]["hoehe"]}',
          f'- Alle Atlanten zusammen: **{datei_alle / 1e6:.1f} MB Download** (WebP), **{gpu_alle / 1e6:.1f} MB Grafikspeicher**, wenn alles geladen wäre', '']
    z += ['| Ausrüstungsset | Ebenen | Atlasseiten (Texturen) | Grafikspeicher | Download |', '|---|---|---|---|---|']
    import kombinationen
    for n, w in kombinationen.SETS.items():
        w = std if w is None else w; g_, d_, e_, s_ = set_mb(w); z.append(f'| {n.replace("_", " ")} | {e_} | {s_} | {g_:.1f} MB | {d_:.1f} MB |')
    if mess and mess.get('browser'):
        z += ['', 'Gemessen im Browser (Testszene, Headless-Chromium mit Software-Grafik – absolute fps sind dort nicht aussagekräftig):', '', '| Figuren | Texturen | Seiten | Grafikspeicher | Sprites | Laden 1. Figur | Rechenzeit Darstellung je Frame | fps |', '|---|---|---|---|---|---|---|---|']
        for m in mess['browser']: z.append(f'| {m["figuren"]} | {m["texturen"]} | {m["seiten"]} | {m["gpuMB"]} MB | {m["sprites"]} | {m["ladeMs"]} ms | {m["rechenMsJeFrame"]} ms | {m["fps"]} |')
    if mess and mess.get('vorher'): z += ['', f'Vorher (erster Prototyp, 20 Ebenen, 9 Animationen): Standardkrieger {mess["vorher"]["gpuMB"]} MB Grafikspeicher, alle Atlanten {mess["vorher"]["downloadMB"]} MB.']
    if mess and mess.get('renderzeit'): z += ['', f'Renderaufwand: {mess["renderzeit"]}']
    z += ['', '## 5. Bekannte Einschränkungen', ''] + [f'- {t}' for t in (mess or {}).get('einschraenkungen', [])]
    z += ['', '## 6. Einschätzung zur Produktionsreife', ''] + [f'{t}' for t in (mess or {}).get('reife', [])]
    open(os.path.join(exp, 'abschlussbericht.md'), 'w').write('\n'.join(z) + '\n'); return os.path.join(exp, 'abschlussbericht.md')

if __name__ == '__main__': print(erzeugen(sys.argv[1], json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None))
