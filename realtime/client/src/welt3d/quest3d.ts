/*
 * Mythara – Quest 01 „Die gesperrte Straße“ in der 3D-Welt (shared/quest01.ts): die Figuren (Jori, Fenna, Raban, Tilda, Othmar; Hagan ist der umhergehende
 * Bürgermeister im Rathaus) mit Namen und Questmarker, Jori läuft beim ersten Besuch auf den Spieler zu, Baumstämme an den drei Sperren,
 * die persönliche Sperre im Gehraster (für jeden Spieler nach seinem eigenen Stand) und das Antippen zum Reden.
 * Alles, was man sieht, richtet sich nach dem eigenen Stand – andere Spieler sehen ihre eigene Welt.
 */
import * as THREE from "three";
import { bildnisseVon } from "../dialog"; /* Gesprächsfenster */
import { kopfbild } from "./kopfbild";
import { eigenesBildnis, aktiverHeld } from "../held";
import { NPCS, QuestNpc, SPERREN, Stand, sperreOffen, sperreHier, rang, NpcId, ZIEL } from "../../../shared/quest01";
import { questStand, questGeladen, rede, questVerfolgt, questStand2, questDing, verfolgteQuest } from "../welt";
import { Q1 } from "../../../shared/quest01";
import { Q2, NPCS2, ziel2, lage as lage2, BRUCHSTELLEN, RUTEN, Ding } from "../../../shared/quest02";
import { Npc3D } from "./npc3d";
import { LADEN_LISTE } from "../../../shared/laeden";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

/** Was die Welt der Quest zur Verfügung stellt */
export interface QuestUmgebung { motor: Welt3D; ort: { x: number; y: number }; hier: string; gesperrt: boolean; sperrenNeu(): void }
interface Figur { n: QuestNpc | (Omit<QuestNpc, "id"> & { id: string }); q: 1 | 2; npc: Npc3D | null; x: number; y: number; nm: HTMLElement; mk: HTMLElement }
/** Quest 02: wer wartet auf den Spieler („!“ / „?“) */
const wartet2 = (s: string): [string, string] | null => { const p = lage2(s).phase; return p === "" ? ["brida", "!"] : p === "angenommen" || p === "abgabe" ? ["odo", "!"] : p === "bereit" ? ["odo", "?"] : null; };
interface Objekt { d: Ding; art: "zaun" | "rute"; g: THREE.Group; kaputt?: THREE.Group; heil?: THREE.Group; ring: THREE.Mesh }
/** Bei welchem Stand wartet welche Figur auf den Spieler (Questmarker „!“) */
const WARTET: Partial<Record<Exclude<Stand, "">, NpcId[]>> = { angeboten: ["jori"], angenommen: ["hagan"], auftrag: ["fenna"], osthof: ["raban", "tilda"], beweis: ["hagan"], bestaetigt: ["raban", "tilda"], frei: ["othmar"] };

export class QuestWelt {
  private figuren: Figur[] = []; private staemme: THREE.Group[] = []; private offen: boolean | null = null; private joriLaeuft = false; private joriFertig = false;
  constructor(private u: QuestUmgebung) {
    const holz = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 }), schnitt = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.8 });
    for (const sp of SPERREN) for (const [x, y, l, w] of sp.staemme) { const g = new THREE.Group(), r = 0.32;
      const stamm = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, l, 12), [holz, schnitt, schnitt]); stamm.rotation.z = Math.PI / 2; stamm.position.y = r; g.add(stamm);
      g.position.set(x, this.u.motor.hoehe(x, y), y); g.rotation.y = w; g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); g.userData.sperre = sp.id; this.u.motor.szene.add(g); this.staemme.push(g); }
    for (const n of NPCS) { const nm = document.createElement("div"); nm.className = "ez-name3d quest"; nm.textContent = n.name; document.body.appendChild(nm);
      const mk = document.createElement("div"); mk.className = "ez-questmarke"; mk.textContent = "!"; mk.hidden = true; document.body.appendChild(mk);
      let npc: Npc3D | null = null; if (!n.wandert) { npc = new Npc3D(n.modell); npc.blick(n.blick[0], n.blick[1]); this.u.motor.szene.add(npc.gruppe); }
      this.figuren.push({ n, q: 1, npc, x: n.x, y: n.y, nm, mk }); }
    for (const n of NPCS2) { const nm = document.createElement("div"); nm.className = "ez-name3d quest"; nm.textContent = n.name; document.body.appendChild(nm);
      const mk = document.createElement("div"); mk.className = "ez-questmarke"; mk.textContent = "!"; mk.hidden = true; document.body.appendChild(mk);
      const npc = new Npc3D(n.modell); npc.blick(n.blick[0], n.blick[1]); this.u.motor.szene.add(npc.gruppe); this.figuren.push({ n, q: 2, npc, x: n.x, y: n.y, nm, mk }); }
    this.objekteBauen();
    addEventListener("ez-quest", () => this.stand()); this.stand();
    /* Kopfbilder fürs Gespräch: die Figur aus ihrem 3D-Modell, der eigene Held aus seinem Bildnis (sonst die Grundfigur) */
    bildnisseVon(async (wer) => { if (wer === "Du") { const b = eigenesBildnis(); if (b) return b; const h = aktiverHeld(); return kopfbild(h ? "base" + h.aussehen.g + "3d" : "basemann3d"); }
      const n = [...NPCS, ...NPCS2].find((x) => x.name === wer || x.name.endsWith(" " + wer) || x.name.startsWith(wer + " ")); if (n) return kopfbild(n.modell);
      const l = LADEN_LISTE.find((x) => x.haendler === wer); return l ? kopfbild(l.modell) : ""; }); }
  /** Stand geändert: Sperren, Wachen, Marker */
  private offenSchluessel = "";
  private stand() { const s = questStand(), auf = sperreOffen(s), schl = SPERREN.map((sp) => (sperreHier(sp, s) ? 1 : 0)).join("");
    if (schl !== this.offenSchluessel) { this.offenSchluessel = schl; for (const g of this.staemme) g.visible = !sperreHier(SPERREN.find((sp) => sp.id === g.userData.sperre)!, s); this.u.sperrenNeu(); }
    if (auf !== this.offen) { this.offen = auf;
      for (const f of this.figuren) if (f.n.id === "raban" || f.n.id === "tilda") { f.x = f.n.x + (auf ? (f.n.id === "raban" ? -3 : 3) : 0); if (f.npc) f.npc.blick(auf ? 0 : f.n.blick[0], auf ? 1 : f.n.blick[1]); } } }
  /** Die gesperrten Felder für diesen Spieler (leer, sobald die Wachen ihn durchlassen) */
  sperren(): number[][] { const s = questStand(); return SPERREN.filter((sp) => !sperreHier(sp, s)).map((sp) => [...sp.feld]); }
  /** Wo steht die Figur gerade (Hagan: der umhergehende Bürgermeister) */
  private wo(f: Figur): { x: number; y: number } | null { if (!f.n.wandert) return { x: f.x, y: f.y };
    const w = this.u.motor.wandererMit(f.n.wandert); return w ? { x: w.x, y: w.z } : null; }
  /** Wo steht die Figur mit dieser Id (Gespräch abbrechen, wenn man sich entfernt) */
  ortVon(id: string): { x: number; y: number } | null { const f = this.figuren.find((x) => x.n.id === id); return f ? this.wo(f) : null; }
  /** Wo die Questfiguren gerade stehen (für das Antippen am Bildschirm: die ganze Figur zählt) */
  punkte(): { x: number; y: number }[] { if (!questGeladen()) return []; const aus: { x: number; y: number }[] = []; for (const f of this.figuren) { const p = this.wo(f); if (p) aus.push(p); } return aus; }
  /** Antippen: liegt dort eine Questfigur? Dann „Mit … sprechen“ (hingehen, dann reden) */
  stelle(x: number, y: number): { npc: boolean; x: number; y: number; text: string; tat: () => void; da: () => boolean } | null {
    if (!questGeladen()) return null; let best: Figur | null = null, bd = 1.3;
    for (const f of this.figuren) { const p = this.wo(f); if (!p) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = f; } }
    if (!best) return this.objektStelle(x, y); const f = best, p = this.wo(f)!;
    return { npc: true, x: p.x, y: p.y, text: `Mit ${f.n.name.replace(/^Wacht(mann|frau) /, "").replace(/ (Wegner|Kern)$/, "")} sprechen`, tat: () => rede(f.n.id), da: () => { const q = this.wo(f); return !!q && Math.hypot(q.x - this.u.ort.x, q.y - this.u.ort.y) <= 2.6; } }; }
  schritt(dt: number) { const s = questStand(), M = this.u.motor, warten = new Set<string>(s ? WARTET[s] || [] : questGeladen() ? ["jori"] : []), w2 = questGeladen() ? wartet2(questStand2()) : null;
    this.objekteSchritt();
    /* Jori: beim ersten Besuch (noch nie angeboten) läuft sie auf den Spieler zu und spricht ihn an */
    const jori = this.figuren.find((f) => f.n.id === "jori")!;
    if (questGeladen() && s === "" && this.u.hier === "waldmark" && !this.joriFertig && !this.u.gesperrt) {
      const dx = this.u.ort.x - jori.x, dy = this.u.ort.y - jori.y, d = Math.hypot(dx, dy);
      if (d >= 14) { /* der Spieler steht woanders in Waldmark: Jori kommt aus seiner Nähe herbeigelaufen (gut 12 Felder vor ihm, von ihrem Platz her) */
        jori.x = this.u.ort.x - dx / d * 12; jori.y = this.u.ort.y - dy / d * 12; }
      else if (d > 1.8) { const v = 3.2 * dt; jori.x += dx / d * Math.min(v, d - 1.8); jori.y += dy / d * Math.min(v, d - 1.8); this.joriLaeuft = true; if (jori.npc) { jori.npc.blick(dx, dy); jori.npc.spiele("gehen"); } }
      else if (d <= 1.8 && this.joriLaeuft) { this.joriFertig = true; if (jori.npc) { jori.npc.spiele("ruhe"); jori.npc.blick(dx, dy); } rede("jori"); } }
    else if (jori.npc && this.joriLaeuft && !this.joriFertig) { this.joriLaeuft = false; jori.npc.spiele("ruhe"); }
    for (const f of this.figuren) { const p = this.wo(f), sichtbar = !!p && Math.hypot(p.x - this.u.ort.x, p.y - this.u.ort.y) < 40;
      if (f.npc) { f.npc.gruppe.visible = sichtbar; if (sichtbar) { f.npc.gruppe.position.set(f.x, M.hoehe(f.x, f.y), f.y); f.npc.schritt(dt); } }
      /* wer im Haus umhergeht (Hagan im Rathaus): Name und Marker nur aus der Nähe – sonst schweben sie über dem Dach */
      const nah = !f.n.wandert || (!!p && Math.hypot(p.x - this.u.ort.x, p.y - this.u.ort.y) < 7), h = p ? M.hoehe(p.x, p.y) : 0; f.nm.hidden = !sichtbar || !nah || !schildAn(f.nm, M, p!.x, h + 2.35, p!.y);
      if (f.q === 2) { f.mk.hidden = !sichtbar || !w2 || w2[0] !== f.n.id || !questVerfolgt(Q2) || !schildAn(f.mk, M, p!.x, h + 2.85, p!.y); if (w2) f.mk.textContent = w2[1]; continue; }
      f.mk.hidden = !sichtbar || !nah || !warten.has(f.n.id) || !(questVerfolgt() || (s === "" && f.n.id === "jori")) /* Marker nur, wenn die Quest verfolgt wird (Jori vor dem Start ausgenommen) */ || !schildAn(f.mk, M, p!.x, h + 2.85, p!.y); f.mk.textContent = s === "beweis" || s === "bestaetigt" || s === "frei" ? "?" : "!"; }
    this.pfeilSchritt(); }
  /** Das nächste Ziel (Figur oder Stelle) für diesen Stand; null: nichts zu tun */
  ziel(): { x: number; y: number } | null { if (!questGeladen()) return null;
    if (verfolgteQuest() === Q2) { const z2 = ziel2(questStand2()); if (!z2) return null; if (Array.isArray(z2)) return { x: z2[0], y: z2[1] }; const f = this.figuren.find((x) => x.q === 2 && x.n.id === z2); return f ? { x: f.x, y: f.y } : null; }
    const z = ZIEL[questStand()]; if (!z) return null;
    if (Array.isArray(z)) return { x: z[0], y: z[1] }; const f = this.figuren.find((x) => x.n.id === z); if (!f) return null; return this.wo(f) || { x: f.n.x, y: f.n.y }; }
  /* Pfeil am Fuß des Helden (nur wenn die Quest im Quest-Tab abgehakt ist) */
  private pfeil: THREE.Mesh | null = null;
  private pfeilSchritt() { const z = verfolgteQuest() ? this.ziel() : null, o = this.u.ort, d = z ? Math.hypot(z.x - o.x, z.y - o.y) : 0;
    if (!this.pfeil) { const form = new THREE.Shape(); form.moveTo(0, 0.55); form.lineTo(0.32, 0.05); form.lineTo(0.12, 0.05); form.lineTo(0.12, -0.35); form.lineTo(-0.12, -0.35); form.lineTo(-0.12, 0.05); form.lineTo(-0.32, 0.05); form.closePath();
      const g = new THREE.ShapeGeometry(form); g.rotateX(-Math.PI / 2); this.pfeil = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide })); this.pfeil.renderOrder = 5; this.u.motor.szene.add(this.pfeil); }
    const p = this.pfeil; p.visible = !!z && d > 2.5; if (!p.visible || !z) return;
    const w = Math.atan2(z.x - o.x, z.y - o.y), puls = 1.15 + 0.12 * Math.sin(performance.now() / 220); /* zeigt in Laufrichtung, ein wenig vor dem Helden */
    p.position.set(o.x + Math.sin(w) * puls, this.u.motor.hoehe(o.x, o.y) + 0.06, o.y + Math.cos(w) * puls); p.rotation.y = w + Math.PI; }
  /** Gelbes ! auf der Minikarte, nur wenn die Quest verfolgt wird (gezeichnet ins Kartenbild: mitte = Held, felder = Breite in Feldern, g = Drehung der Kamera beim Zeichnen) – nur, wenn das Ziel in ihrer Reichweite liegt */
  karteMarke(c: HTMLCanvasElement, felder: number, o: { x: number; y: number }, g: number) { if (!verfolgteQuest()) return; /* nur beim Verfolgen */ const z = this.ziel(), x = c.getContext("2d"); if (!z || !x) return; const n = c.width, k = n / felder, dx = z.x - o.x, dy = z.y - o.y;
    let px = (dx * Math.cos(g) + dy * -Math.sin(g)) * k, py = -(dx * -Math.sin(g) + dy * -Math.cos(g)) * k; const gr0 = Math.max(18, n * 0.12), rand = n / 2 / 1.5 - gr0 * 0.75 /* der runde Ausschnitt zeigt nur die Mitte des Kartenbilds (KARTE_RAND 1,5) */, l = Math.hypot(px, py); if (l > rand) return; /* nur wenn das Ziel im Ausschnitt der Minikarte liegt */
    const sx = n / 2 + px, sy = n / 2 + py, gr = Math.max(18, n * 0.12); x.save(); x.font = `900 ${gr}px Georgia, serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = Math.max(3, gr * 0.22); x.strokeStyle = "#2a1a05"; x.strokeText("!", sx, sy); x.fillStyle = "#ffd23a"; x.fillText("!", sx, sy); x.restore(); }
  /* ───────── Quest 02: Bruchstellen und Rutenbündel in Osthof ───────── */
  private objekte: Objekt[] = [];
  private objekteBauen() { const M = this.u.motor, holz = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 }), moos = new THREE.MeshStandardMaterial({ color: 0x4f7a2e, roughness: 1 }),
      stein = new THREE.MeshStandardMaterial({ color: 0x8a8a82, roughness: 0.9 }), rute = new THREE.MeshStandardMaterial({ color: 0x9a8a4a, roughness: 0.9 }), band = new THREE.MeshStandardMaterial({ color: 0x6b8a3a, roughness: 0.9 }),
      leuchten = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.5, depthWrite: false });
    const kiste = (b: number, h: number, t: number, m: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(b, h, t), m);
    const ring = () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 28), leuchten); r.rotation.x = -Math.PI / 2; r.renderOrder = 4; return r; };
    for (const d of BRUCHSTELLEN) { const g = new THREE.Group(), kaputt = new THREE.Group(), heil = new THREE.Group();
      /* kaputt: ein Pfahl steht, einer ist samt Wurzel herausgedrückt und liegt schräg, die Latte hängt herunter, Moos am Boden */
      const p1 = kiste(0.14, 1.1, 0.14, holz); p1.position.set(-0.7, 0.55, 0); kaputt.add(p1);
      const p2 = kiste(0.14, 1.1, 0.14, holz); p2.position.set(0.6, 0.35, 0.15); p2.rotation.z = -0.95; kaputt.add(p2);
      const l1 = kiste(1.5, 0.08, 0.06, holz); l1.position.set(-0.05, 0.45, 0); l1.rotation.z = -0.35; kaputt.add(l1);
      const pl = new THREE.Mesh(new THREE.CircleGeometry(0.45, 14), moos); pl.rotation.x = -Math.PI / 2; pl.position.set(0.2, 0.02, 0.35); kaputt.add(pl);
      /* geflickt (nach der Abgabe der Ruten): beide Pfähle stehen, mit Weidenruten umwickelt */
      for (const x of [-0.7, 0.7]) { const p = kiste(0.14, 1.1, 0.14, holz); p.position.set(x, 0.55, 0); heil.add(p); const w = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12), band); w.rotation.x = Math.PI / 2; w.position.set(x, 0.75, 0); heil.add(w); }
      for (const y of [0.4, 0.8]) { const l = kiste(1.5, 0.08, 0.06, holz); l.position.set(0, y, 0); heil.add(l); }
      if (d.id === "zaun2") for (const [x, z, r] of [[-1.2, 0.5, 0.28], [1.1, -0.4, 0.22], [0.3, 0.9, 0.18]]) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), stein); st.position.set(x, r * 0.6, z); g.add(st); }
      g.add(kaputt, heil); const r = ring(); r.position.y = 0.03; g.add(r);
      g.position.set(d.x, M.hoehe(d.x, d.y), d.y); g.rotation.y = d.nr * 0.9; g.traverse((o) => { o.castShadow = o !== r; o.receiveShadow = true; }); M.szene.add(g);
      this.objekte.push({ d, art: "zaun", g, kaputt, heil, ring: r }); }
    for (const d of RUTEN) { const g = new THREE.Group();
      for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.3, 5), rute); c.rotation.z = Math.PI / 2; c.rotation.y = (i - 4) * 0.035; c.position.set(0, 0.05 + (i % 3) * 0.035, (i - 4) * 0.025); g.add(c); }
      for (const x of [-0.3, 0.3]) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 5, 10), band); b.rotation.y = Math.PI / 2; b.position.set(x, 0.09, 0); g.add(b); }
      const r = ring(); r.position.y = 0.03; g.add(r);
      g.position.set(d.x, M.hoehe(d.x, d.y), d.y); g.rotation.y = d.nr * 1.3 + 0.4; g.traverse((o) => { o.castShadow = o !== r; o.receiveShadow = true; }); M.szene.add(g);
      this.objekte.push({ d, art: "rute", g, ring: r }); } }
  /** Sichtbarkeit nach dem eigenen Stand: Ruten verschwinden, wenn gesammelt; Bruchstellen sind nach der Abgabe geflickt; leuchten, solange sie zu tun sind */
  private objekteSchritt() { const l = lage2(questStand2()), spur = l.phase === "spuren", nach = ["beobachten", "kampf", "bereit", "fertig"].includes(l.phase), puls = 0.35 + 0.25 * Math.sin(performance.now() / 260);
    for (const o of this.objekte) { const nah = Math.hypot(o.d.x - this.u.ort.x, o.d.y - this.u.ort.y) < 45; o.g.visible = nah;
      if (!nah) continue; const bit = 1 << o.d.nr, erledigt = o.art === "zaun" ? (l.zaun & bit) !== 0 : (l.ruten & bit) !== 0;
      if (o.art === "zaun") { o.kaputt!.visible = !nach; o.heil!.visible = nach; } else o.g.visible = !(erledigt || l.phase === "abgabe" || nach);
      o.ring.visible = spur && !erledigt && questGeladen(); (o.ring.material as THREE.MeshBasicMaterial).opacity = puls; } }
  /** Antippen einer Bruchstelle oder eines Rutenbündels: „Untersuchen“ / „Aufheben“ (hingehen, dann den Server fragen) */
  private objektStelle(x: number, y: number): { npc: boolean; x: number; y: number; text: string; tat: () => void; da: () => boolean } | null {
    let best: Objekt | null = null, bd = 1.2; for (const o of this.objekte) { if (!o.g.visible) continue; const d = Math.hypot(o.d.x - x, o.d.y - y); if (d < bd) { bd = d; best = o; } }
    if (!best) return null; const o = best;
    return { npc: false, x: o.d.x, y: o.d.y, text: o.art === "zaun" ? `${o.d.name} untersuchen` : "Weidenruten aufheben", tat: () => questDing(o.d.id, { x: this.u.ort.x, y: this.u.ort.y }), da: () => Math.hypot(o.d.x - this.u.ort.x, o.d.y - this.u.ort.y) <= 1.8 }; }
  /** Stand für Tests */
  get sperreZu(): boolean { return !sperreOffen(questStand()); }
  get joriDa(): { x: number; y: number } { const j = this.figuren.find((f) => f.n.id === "jori")!; return { x: j.x, y: j.y }; }
  /** nur für Tests: wie weit ist der Stand */
  rang(): number { return rang(questStand()); }
}
