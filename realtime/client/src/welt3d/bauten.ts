/*
 * 3D-Prototyp – Gebäude aus den Bauplänen (welt/bibliothek/bauplaene.json, dieselben wie für die gemalten 2D-Häuser).
 * Ein Bauplan beschreibt Baukörper (Wände, Höhe, Dachform), Türen, Fenster, Zubehör und Möbel in Feldern; der Fuß ist die Mitte
 * der Südwand des ersten Baukörpers. In 3D: x nach Osten, z nach Süden (Norden = −z), y nach oben.
 * Jedes Gebäude wird zu wenigen Netzen verschmolzen: Mauerwerk mit Innenraum, je Baukörper ein Dach (wird beim Betreten
 * ausgeblendet), Türflügel (öffnen sich, wenn der Held nahe ist) und Windmühlenflügel.
 */
import * as THREE from "three";
import { Teile, type Muster } from "./teile";

export type Bauplan = {
  id: string;
  koerper: { id: string; x: number; d: number; b: number; t: number; h: number; wand?: string; betretbar?: boolean; sockel?: number | boolean;
    dach?: { form: string; first?: string; hoehe?: number; ueber?: number; deckung?: string; farbe?: number[] } }[];
  tueren?: { koerper?: string | number; x: number; b: number; h: number; art?: string }[];
  fenster?: { koerper?: string | number; wand: string; x?: number; d?: number; z: number; b: number; h: number; art?: string; laeden?: boolean; blumen?: boolean }[];
  zubehoer?: { art: string; koerper?: string | number; x?: number; d?: number; z?: number; farbe?: number[]; laenge?: number; r?: number; x0?: number; x1?: number; tiefe?: number; deckung?: string }[];
  innen?: { boden?: string; moebel?: { art: string; x: number; d: number }[] };
};

const WAND: Record<string, string> = { bretter: "#8b6542", blockbohlen: "#7b5535", stein: "#8e8a80", putz: "#d9cfb6", fachwerk: "#ddd3b8", quader: "#9b968c", ziegel: "#9c5a42" };
const DECKUNG: Record<string, string> = { ziegel: "#a2553a", schindel: "#6f5c49", stroh: "#c8a45a", schiefer: "#4c5462" };
const WANDMUSTER: Record<string, Muster> = { bretter: "holz", blockbohlen: "holz", stein: "stein", quader: "stein", ziegel: "stein", putz: "putz", fachwerk: "putz" };
const DACHMUSTER: Record<string, Muster> = { ziegel: "ziegel", schindel: "schindel", stroh: "stroh", schiefer: "schindel" };
const HOLZ = "#5b3b22", DUNKEL = "#3a2614", GLAS = "#33404c";
const rgb = (f?: number[]) => (f ? new THREE.Color(f[0] / 255, f[1] / 255, f[2] / 255).convertSRGBToLinear() : null);

export type Gebaeude = { gruppe: THREE.Group; daecher: THREE.Object3D[]; raeume: { x0: number; x1: number; z0: number; z1: number }[];
  tueren: { fluegel: THREE.Object3D; x: number; z: number; zu: number; auf: number }[]; drehen: THREE.Object3D[] };

export function bauen(plan: Bauplan, X: number, Y: number, Z: number): Gebaeude {
  const g = new THREE.Group(); g.position.set(X, Y, Z);
  const mauer = new Teile(), K = plan.koerper, nr = (r?: string | number) => (typeof r === "string" ? Math.max(0, K.findIndex((k) => k.id === r)) : r ?? 0);
  const aus: Gebaeude = { gruppe: g, daecher: [], raeume: [], tueren: [], drehen: [] }, w = 0.2;
  K.forEach((k, ki) => {
    const x0 = k.x, x1 = k.x + k.b, zs = -k.d, zn = -k.d - k.t, h = k.h, farbe = WAND[k.wand || "bretter"] || WAND.bretter;
    const D = k.dach || { form: "flach" }, H = D.hoehe ?? 1.6, ue = D.ueber ?? 0.35, form = D.form;
    const wm = { muster: WANDMUSTER[k.wand || "bretter"] || "holz", schwanken: 0.03 } as const, dm = { muster: DACHMUSTER[D.deckung || "schindel"] || "schindel", schwanken: 0.03 } as const;
    /* Wände: Süden mit Türlücken (Sturz darüber), Norden, Westen, Osten */
    const tueren = (plan.tueren || []).filter((t) => nr(t.koerper) === ki).sort((a, b) => a.x - b.x); let x = x0;
    for (const t of tueren) { const a = t.x - t.b / 2, b = t.x + t.b / 2; if (a > x) mauer.box(a - x, h, w, (x + a) / 2, 0, zs - w / 2, farbe, 0, wm); mauer.box(t.b, h - t.h, w, t.x, t.h, zs - w / 2, farbe); x = b;
      /* Rahmen und Türflügel (am Angelpunkt drehbar) */
      mauer.box(0.12, t.h, w + 0.06, a - 0.06, 0, zs - w / 2, HOLZ, 0, { muster: "holz" }); mauer.box(0.12, t.h, w + 0.06, b + 0.06, 0, zs - w / 2, HOLZ, 0, { muster: "holz" }); mauer.box(t.b + 0.24, 0.12, w + 0.06, t.x, t.h, zs - w / 2, HOLZ, 0, { muster: "holz" });
      const fl = t.art === "doppel" || t.art === "tor" ? [[a, 1], [b, -1]] : [[a, 1]];
      for (const [px, s] of fl) { const breite = t.b / fl.length, f = new Teile(); f.box(breite - 0.04, t.h - 0.04, 0.08, s * breite / 2, 0, 0, "#6a4527", 0, { muster: "holz", schwanken: 0.05 }); f.box(breite - 0.1, 0.1, 0.1, s * breite / 2, t.h * 0.3, 0.02, DUNKEL); f.box(breite - 0.1, 0.1, 0.1, s * breite / 2, t.h * 0.72, 0.02, DUNKEL);
        const n = f.netz(); const piv = new THREE.Group(); piv.position.set(px, 0, zs - 0.06); piv.add(n); g.add(piv); aus.tueren.push({ fluegel: piv, x: X + t.x, z: Z + zs, zu: 0, auf: s * -1.75 }); } }
    if (x < x1) mauer.box(x1 - x, h, w, (x + x1) / 2, 0, zs - w / 2, farbe, 0, wm);
    mauer.box(k.b, h, w, (x0 + x1) / 2, 0, zn + w / 2, farbe, 0, wm);
    mauer.box(w, h, k.t - 2 * w, x0 + w / 2, 0, (zs + zn) / 2, farbe, 0, wm); mauer.box(w, h, k.t - 2 * w, x1 - w / 2, 0, (zs + zn) / 2, farbe, 0, wm);
    if (k.wand === "fachwerk" || k.wand === "blockbohlen" || k.wand === "bretter") { const balken = k.wand === "fachwerk" ? "#4a3220" : "#5e3f25", o = 0.04;
      for (const [cx, cz] of [[x0, zs], [x1, zs], [x0, zn], [x1, zn]]) mauer.box(0.26, h, 0.26, cx, 0, cz, balken, 0, { muster: "holz" });
      mauer.box(k.b + 0.1, 0.18, 0.08, (x0 + x1) / 2, h - 0.18, zs + o, balken); mauer.box(0.08, 0.18, k.t, x1 + o, h - 0.18, (zs + zn) / 2, balken); mauer.box(0.08, 0.18, k.t, x0 - o, h - 0.18, (zs + zn) / 2, balken);
      if (k.wand === "fachwerk") { mauer.box(k.b + 0.1, 0.14, 0.08, (x0 + x1) / 2, h * 0.45, zs + o, balken); mauer.box(0.08, 0.14, k.t, x1 + o, h * 0.45, (zs + zn) / 2, balken);
        for (let i = 1; i < Math.round(k.b / 1.4); i++) mauer.box(0.14, h, 0.08, x0 + (i * k.b) / Math.round(k.b / 1.4), 0, zs + o, balken); } }
    if (k.sockel || k.wand === "stein" || k.wand === "quader") mauer.box(k.b + 0.12, 0.35, k.t + 0.12, (x0 + x1) / 2, 0, (zs + zn) / 2, "#6c675e", 0, { muster: "stein" });
    else mauer.box(k.b + 0.1, 0.3, k.t + 0.1, (x0 + x1) / 2, 0, (zs + zn) / 2, "#6c675e", 0, { muster: "stein" });   /* Steinsockel unter Holzhäusern */
    /* Giebel in Wandfarbe – gehören zum Dach, verschwinden also mit ihm, wenn man das Haus betritt */
    const top = h + H, xm = (x0 + x1) / 2, zm = (zs + zn) / 2, dach = new Teile();
    if (form === "sattel" && (D.first || "x") === "x") for (const gx of [x0 + w / 2, x1 - w / 2]) dach.flaechen([[[gx, h, zs], [gx, h, zn], [gx, top, zm]]], farbe, wm);
    if (form === "sattel" && D.first === "d") for (const gz of [zs - w / 2, zn + w / 2]) dach.flaechen([[[x0, h, gz], [x1, h, gz], [xm, top, gz]]], farbe, wm);
    if (form === "pult") for (const gx of [x0 + w / 2, x1 - w / 2]) dach.flaechen([[[gx, h, zs], [gx, h, zn], [gx, top, zn]]], farbe, wm);
    /* Dach */
    const dfarbe = rgb(D.farbe) || new THREE.Color(DECKUNG[D.deckung || "schindel"] || DECKUNG.schindel);
    const ex0 = x0 - ue, ex1 = x1 + ue, ezs = zs + ue, ezn = zn - ue;
    if (form === "flach") dach.box(k.b + 2 * ue, 0.25, k.t + 2 * ue, xm, h, zm, dfarbe, 0, dm);
    else if (form === "sattel" && (D.first || "x") === "x") { const fall = (H / (k.t / 2)) * ue, y = h - fall; dach.viereck([ex0, y, ezs], [ex1, y, ezs], [ex1, top, zm], [ex0, top, zm], dfarbe, dm); dach.viereck([ex0, y, ezn], [ex1, y, ezn], [ex1, top, zm], [ex0, top, zm], dfarbe, dm);
      dach.box(k.b + 2 * ue + 0.1, 0.16, 0.24, xm, top - 0.08, zm, DUNKEL); }
    else if (form === "sattel") { const fall = (H / (k.b / 2)) * ue, y = h - fall; dach.viereck([ex0, y, ezs], [ex0, y, ezn], [xm, top, ezn], [xm, top, ezs], dfarbe, dm); dach.viereck([ex1, y, ezs], [ex1, y, ezn], [xm, top, ezn], [xm, top, ezs], dfarbe, dm);
      dach.box(0.24, 0.16, k.t + 2 * ue + 0.1, xm, top - 0.08, zm, DUNKEL); }
    else if (form === "pult") { const fall = (H / k.t) * ue; dach.viereck([ex0, h - fall, ezs], [ex1, h - fall, ezs], [ex1, top + fall, ezn], [ex0, top + fall, ezn], dfarbe, dm); }
    else { /* walm (First längs der längeren Seite) und zelt (Spitze) */ const y = h - 0.25, lang = k.b >= k.t, r = form === "zelt" ? 0 : Math.abs(k.b - k.t) / 2;
      const a: number[] = lang ? [xm - r, top, zm] : [xm, top, zm - r], b: number[] = lang ? [xm + r, top, zm] : [xm, top, zm + r];
      const sw = [ex0, y, ezs], se = [ex1, y, ezs], ne = [ex1, y, ezn], nw = [ex0, y, ezn];
      if (lang) { dach.viereck(sw, se, b, a, dfarbe, dm); dach.viereck(nw, ne, b, a, dfarbe, dm); dach.flaechen([[sw, nw, a], [se, ne, b]], dfarbe, dm); }
      else { dach.viereck(sw, nw, a, b, dfarbe, dm); dach.viereck(se, ne, a, b, dfarbe, dm); dach.flaechen([[sw, se, b], [nw, ne, a]], dfarbe, dm); } }
    if (!dach.leer) { const n = dach.netz(); g.add(n); aus.daecher.push(n); }
    /* Innen: Boden und Möbel (nur betretbare Körper) */
    if (k.betretbar) { mauer.box(k.b - 2 * w, 0.06, k.t - 2 * w, xm, 0, zm, plan.innen?.boden === "stein" ? "#8a857c" : "#86603c", 0, { muster: plan.innen?.boden === "stein" ? "stein" : "holz" });
      aus.raeume.push({ x0: X + x0, x1: X + x1, z0: Z + zn, z1: Z + zs }); }
  });
  /* Fenster: Rahmen, Glas, Sprossen, Läden, Blumenkasten – auf der Süd- oder Ostwand */
  for (const f of plan.fenster || []) { const k = K[nr(f.koerper)], ost = f.wand === "ost", glas = f.art === "glut" ? "#e7a640" : f.art === "gruen" ? "#4e6a52" : f.art === "violett" ? "#b38ad6" : f.art === "schalter" ? "#221a16" : GLAS;
    const t = new Teile(), y = f.z; t.box(f.b + 0.16, f.h + 0.16, 0.06, 0, y - 0.08, 0, HOLZ, 0, { muster: "holz" }); t.box(f.b, f.h, 0.08, 0, y, 0.01, glas);
    if (f.art === "kreuz" || !f.art) { t.box(0.06, f.h, 0.1, 0, y, 0.02, HOLZ, 0, { muster: "holz" }); t.box(f.b, 0.06, 0.1, 0, y + f.h / 2 - 0.03, 0.02, HOLZ, 0, { muster: "holz" }); }
    if (f.art === "schalter") { for (let i = 1; i < 6; i++) t.box(0.05, f.h - 0.12, 0.08, -f.b / 2 + (f.b * i) / 6, y + 0.12, 0.05, "#c4a052", 0, { muster: "metall" }); t.box(f.b + 0.24, 0.1, 0.45, 0, y - 0.1, 0.2, "#7a5232", 0, { muster: "holz" }); }
    if (f.laeden) for (const s of [-1, 1]) t.box(f.b / 2, f.h, 0.06, s * (f.b * 0.75 + 0.1), y, 0.03, "#4f6b4c", 0, 0.05);
    if (f.blumen) { t.box(f.b + 0.1, 0.18, 0.22, 0, y - 0.2, 0.1, "#6a4527"); for (let i = 0; i < 4; i++) t.box(0.14, 0.14, 0.14, -f.b / 2 + 0.15 + i * (f.b - 0.3) / 3, y - 0.04, 0.12, i % 2 ? "#d2463c" : "#e8c547"); }
    const n = t.netz(false); if (ost) { n.rotation.y = Math.PI / 2; n.position.set(k.x + k.b + 0.01, 0, -(f.d ?? k.t / 2)); } else n.position.set(f.x ?? 0, 0, -k.d + 0.01); g.add(n); }
  /* Zubehör */
  for (const z of plan.zubehoer || []) { const k = K[nr(z.koerper)], D = k.dach || { form: "flach" }, top = k.h + (D.hoehe ?? 1.6);
    if (z.art === "kamin") mauer.box(0.6, top - k.h + 0.9, 0.6, z.x ?? 0, k.h - 0.2, -(z.d ?? k.t / 2), "#7a6f66", 0, { muster: "stein" });
    else if (z.art === "banner") { mauer.box(0.55, 1.1, 0.05, z.x ?? 0, (z.z ?? 2) - 1.1, -k.d + 0.05, rgb(z.farbe) || "#9b2f2a"); mauer.box(0.7, 0.06, 0.08, z.x ?? 0, z.z ?? 2, -k.d + 0.06, HOLZ, 0, { muster: "holz" }); }
    else if (z.art === "laterne" || z.art === "schild") mauer.box(0.24, 0.32, 0.24, z.x ?? 0, (z.z ?? 2) - 0.3, -k.d + 0.15, z.art === "laterne" ? "#f1b84d" : "#8a6440");
    else if (z.art === "vordach") { /* kleines Pultdach über der Tür auf zwei Pfosten */ const x0 = z.x0 ?? -1, x1 = z.x1 ?? 1, t = z.tiefe ?? 1, h0 = z.z ?? 2.2, zs = -k.d, dm = { muster: DACHMUSTER[z.deckung || "schindel"] || "schindel" } as const, df = rgb(z.farbe) || new THREE.Color(DECKUNG[z.deckung || "schindel"]);
      const v = new Teile(); v.viereck([x0 - 0.15, h0 + 0.45, zs], [x1 + 0.15, h0 + 0.45, zs], [x1 + 0.15, h0 - 0.05, zs + t + 0.15], [x0 - 0.15, h0 - 0.05, zs + t + 0.15], df, dm);
      for (const px of [x0, x1]) v.box(0.12, h0 - 0.05, 0.12, px, 0, zs + t, HOLZ, 0, { muster: "holz" }); const n = v.netz(); g.add(n); }
    else if (z.art === "fluegel") { const f = new Teile(), L = z.laenge ?? 3; for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; f.add(new THREE.BoxGeometry(0.16, L, 0.06), HOLZ, new THREE.Matrix4().makeRotationZ(a).multiply(new THREE.Matrix4().makeTranslation(0, L / 2, 0)));
        f.add(new THREE.BoxGeometry(0.62, L * 0.8, 0.03), "#d8cfb9", new THREE.Matrix4().makeRotationZ(a).multiply(new THREE.Matrix4().makeTranslation(0.36, L * 0.55, 0.03))); }
      f.box(0.4, 0.4, 0.5, 0, -0.2, -0.2, DUNKEL); const n = f.netz(); n.position.set(z.x ?? 0, z.z ?? k.h, -k.d + 0.45); g.add(n); aus.drehen.push(n); }
  }
  /* Möbel */
  const MOEBEL: Record<string, [number, number, number, string]> = { tisch: [1.2, 0.75, 0.8, "#7a5232"], bett: [1.0, 0.55, 2.0, "#a8443a"], theke: [2.4, 1.0, 0.6, "#6a4527"], fass: [0.6, 0.8, 0.6, "#7a5232"], amboss: [0.7, 0.7, 0.4, "#3c3c40"],
    regal: [1.2, 1.8, 0.4, "#6a4527"], ofen: [1.0, 1.3, 1.0, "#6c655e"], altar: [1.4, 1.0, 0.7, "#bdb5a5"], bank: [1.5, 0.45, 0.4, "#7a5232"], kessel: [0.7, 0.6, 0.7, "#34332f"], heu: [1.2, 0.8, 1.0, "#c9a85a"], saecke: [0.9, 0.6, 0.6, "#c2ae86"], muehlstein: [1.2, 0.5, 1.2, "#8e8a80"], frisierstuhl: [0.7, 0.55, 0.7, "#74428c"] };
  for (const m of plan.innen?.moebel || []) if (m.art === "spiegel") {   /* Nias Zauberspiegel: Goldrahmen, violett schimmerndes Glas */
    mauer.box(1.0, 1.95, 0.14, m.x, 0.06, -m.d, "#c49c46", 0, { muster: "metall" }); mauer.box(0.76, 1.55, 0.05, m.x, 0.26, -m.d + 0.09, "#c4a2ea", 0, { muster: "glatt" }); }
  for (const m of plan.innen?.moebel || []) if (m.art === "schalter") { mauer.box(1.6, 1.0, 0.5, m.x, 0.06, -m.d, "#7a5232", 0, { muster: "holz" }); for (let i = 0; i < 6; i++) mauer.box(0.04, 0.9, 0.04, m.x - 0.75 + i * 0.3, 1.06, -m.d + 0.2, "#c4a052", 0, { muster: "metall" }); mauer.box(1.6, 0.06, 0.06, m.x, 1.92, -m.d + 0.2, "#c4a052", 0, { muster: "metall" }); }
    else if (m.art === "tresor") { mauer.box(1.1, 1.2, 0.8, m.x, 0.06, -m.d, "#34363c", 0, { muster: "metall" }); mauer.add(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 14), "#cca85a", new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(m.x, 0.66, -m.d + 0.42), { muster: "metall" }); }
  for (const m of plan.innen?.moebel || []) if (m.art === "treppe") { for (let i = 0; i < 6; i++) mauer.box(1.1, 0.35 * (i + 1), 0.4, m.x, 0.06, -(m.d - 1.2 + i * 0.4 + 0.2), "#7a5232", 0, { muster: "holz" }); }
    else if (m.art === "treppe_oben") { mauer.box(1.2, 0.02, 2.4, m.x, 0.07, -m.d, "#181210", 0, { muster: "glatt" }); for (const s of [-0.65, 0.65]) mauer.box(0.1, 0.9, 2.4, m.x + s, 0.06, -m.d, "#5b3b22", 0, { muster: "holz" }); mauer.box(1.3, 0.1, 0.1, m.x, 0.9, -(m.d - 1.2), "#5b3b22", 0, { muster: "holz" }); }
  for (const m of (plan.innen?.moebel || []).filter((q) => !["spiegel", "treppe", "treppe_oben", "schalter", "tresor"].includes(q.art))) { const [b, h, t, c] = MOEBEL[m.art] || [0.8, 0.8, 0.8, "#7a5232"]; mauer.box(b, h, t, m.x, 0.06, -m.d, c, 0, { muster: c === "#8a857c" || m.art === "ofen" || m.art === "muehlstein" || m.art === "altar" ? "stein" : "holz" }); }
  const n = mauer.netz(); g.add(n);
  return aus;
}
