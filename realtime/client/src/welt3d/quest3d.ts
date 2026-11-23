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
import { questStand, questGeladen, rede, questVerfolgt } from "../welt";
import { Npc3D } from "./npc3d";
import { LADEN_LISTE } from "../../../shared/laeden";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

/** Was die Welt der Quest zur Verfügung stellt */
export interface QuestUmgebung { motor: Welt3D; ort: { x: number; y: number }; hier: string; gesperrt: boolean; sperrenNeu(): void }
interface Figur { n: QuestNpc; npc: Npc3D | null; x: number; y: number; nm: HTMLElement; mk: HTMLElement }
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
      this.figuren.push({ n, npc, x: n.x, y: n.y, nm, mk }); }
    addEventListener("ez-quest", () => this.stand()); this.stand();
    /* Kopfbilder fürs Gespräch: die Figur aus ihrem 3D-Modell, der eigene Held aus seinem Bildnis (sonst die Grundfigur) */
    bildnisseVon(async (wer) => { if (wer === "Du") { const b = eigenesBildnis(); if (b) return b; const h = aktiverHeld(); return kopfbild(h ? "base" + h.aussehen.g + "3d" : "basemann3d"); }
      const n = NPCS.find((x) => x.name === wer || x.name.endsWith(" " + wer) || x.name.startsWith(wer + " ")); if (n) return kopfbild(n.modell);
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
  /** Wo die Questfiguren gerade stehen (für das Antippen am Bildschirm: die ganze Figur zählt) */
  punkte(): { x: number; y: number }[] { if (!questGeladen()) return []; const aus: { x: number; y: number }[] = []; for (const f of this.figuren) { const p = this.wo(f); if (p) aus.push(p); } return aus; }
  /** Antippen: liegt dort eine Questfigur? Dann „Mit … sprechen“ (hingehen, dann reden) */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean } | null {
    if (!questGeladen()) return null; let best: Figur | null = null, bd = 1.3;
    for (const f of this.figuren) { const p = this.wo(f); if (!p) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = f; } }
    if (!best) return null; const f = best, p = this.wo(f)!;
    return { x: p.x, y: p.y, text: `Mit ${f.n.name.replace(/^Wacht(mann|frau) /, "")} sprechen`, tat: () => rede(f.n.id), da: () => { const q = this.wo(f); return !!q && Math.hypot(q.x - this.u.ort.x, q.y - this.u.ort.y) <= 2.6; } }; }
  schritt(dt: number) { const s = questStand(), M = this.u.motor, warten = new Set(s ? WARTET[s] || [] : questGeladen() ? ["jori"] : []);
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
      f.mk.hidden = !sichtbar || !nah || !warten.has(f.n.id) || !(questVerfolgt() || (s === "" && f.n.id === "jori")) /* Marker nur, wenn die Quest verfolgt wird (Jori vor dem Start ausgenommen) */ || !schildAn(f.mk, M, p!.x, h + 2.85, p!.y); f.mk.textContent = s === "beweis" || s === "bestaetigt" || s === "frei" ? "?" : "!"; }
    this.pfeilSchritt(); }
  /** Das nächste Ziel (Figur oder Stelle) für diesen Stand; null: nichts zu tun */
  ziel(): { x: number; y: number } | null { if (!questGeladen()) return null; const z = ZIEL[questStand()]; if (!z) return null;
    if (Array.isArray(z)) return { x: z[0], y: z[1] }; const f = this.figuren.find((x) => x.n.id === z); if (!f) return null; return this.wo(f) || { x: f.n.x, y: f.n.y }; }
  /* Pfeil am Fuß des Helden (nur wenn die Quest im Quest-Tab abgehakt ist) */
  private pfeil: THREE.Mesh | null = null;
  private pfeilSchritt() { const z = questVerfolgt() ? this.ziel() : null, o = this.u.ort, d = z ? Math.hypot(z.x - o.x, z.y - o.y) : 0;
    if (!this.pfeil) { const form = new THREE.Shape(); form.moveTo(0, 0.55); form.lineTo(0.32, 0.05); form.lineTo(0.12, 0.05); form.lineTo(0.12, -0.35); form.lineTo(-0.12, -0.35); form.lineTo(-0.12, 0.05); form.lineTo(-0.32, 0.05); form.closePath();
      const g = new THREE.ShapeGeometry(form); g.rotateX(-Math.PI / 2); this.pfeil = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide })); this.pfeil.renderOrder = 5; this.u.motor.szene.add(this.pfeil); }
    const p = this.pfeil; p.visible = !!z && d > 2.5; if (!p.visible || !z) return;
    const w = Math.atan2(z.x - o.x, z.y - o.y), puls = 1.15 + 0.12 * Math.sin(performance.now() / 220); /* zeigt in Laufrichtung, ein wenig vor dem Helden */
    p.position.set(o.x + Math.sin(w) * puls, this.u.motor.hoehe(o.x, o.y) + 0.06, o.y + Math.cos(w) * puls); p.rotation.y = w + Math.PI; }
  /** Gelbes ! auf der Minikarte, nur wenn die Quest verfolgt wird (gezeichnet ins Kartenbild: mitte = Held, felder = Breite in Feldern, g = Drehung der Kamera beim Zeichnen) – nur, wenn das Ziel in ihrer Reichweite liegt */
  karteMarke(c: HTMLCanvasElement, felder: number, o: { x: number; y: number }, g: number) { if (!questVerfolgt()) return; /* nur beim Verfolgen */ const z = this.ziel(), x = c.getContext("2d"); if (!z || !x) return; const n = c.width, k = n / felder, dx = z.x - o.x, dy = z.y - o.y;
    let px = (dx * Math.cos(g) + dy * -Math.sin(g)) * k, py = -(dx * -Math.sin(g) + dy * -Math.cos(g)) * k; const gr0 = Math.max(18, n * 0.12), rand = n / 2 / 1.5 - gr0 * 0.75 /* der runde Ausschnitt zeigt nur die Mitte des Kartenbilds (KARTE_RAND 1,5) */, l = Math.hypot(px, py); if (l > rand) return; /* nur wenn das Ziel im Ausschnitt der Minikarte liegt */
    const sx = n / 2 + px, sy = n / 2 + py, gr = Math.max(18, n * 0.12); x.save(); x.font = `900 ${gr}px Georgia, serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = Math.max(3, gr * 0.22); x.strokeStyle = "#2a1a05"; x.strokeText("!", sx, sy); x.fillStyle = "#ffd23a"; x.fillText("!", sx, sy); x.restore(); }
  /** Stand für Tests */
  get sperreZu(): boolean { return !sperreOffen(questStand()); }
  get joriDa(): { x: number; y: number } { const j = this.figuren.find((f) => f.n.id === "jori")!; return { x: j.x, y: j.y }; }
  /** nur für Tests: wie weit ist der Stand */
  rang(): number { return rang(questStand()); }
}
