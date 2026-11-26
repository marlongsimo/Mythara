/*
 * Riftmere – Quests in der 3D-Welt, alles aus den Quest-Daten (shared/quests.ts, shared/questbau.ts): Figuren mit Namen und Questmarker
 * (wer umhergeht, z. B. der Bürgermeister im Rathaus, nur aus der Nähe), Figuren, die dem Spieler entgegenlaufen (kommt) oder beiseitetreten (beiseite),
 * Baumstamm-Sperren (schranken/freigaben) samt persönlicher Sperre im Gehraster, Questobjekte, Pfeil und Minikarten-Marke, Antippen zum Reden.
 * Alles, was man sieht, richtet sich nach dem eigenen Stand – andere Spieler sehen ihre eigene Welt.
 */
import * as THREE from "three";
import { bildnisseVon } from "../dialog"; /* Gesprächsfenster */
import { kopfbild } from "./kopfbild";
import { eigenesBildnis, aktiverHeld } from "../held";
import { questGeladen, rede, questVerfolgt, questStandB, questDing, verfolgteQuest } from "../welt";
import { QUESTS as QUESTS_B, questDef, schalterAn } from "../../../shared/quests";
import { zeichenAlle, ziel as zielB, objektLage, gilt, frei, lage, type QuestObjekt, type QuestFigur, type QuestDef, type Schranke } from "../../../shared/questbau";
import { STATIONEN } from "../../../shared/handwerk";
import { TUEREN } from "../../../shared/bosse";
import { tuerenZu } from "../../../shared/boss";
import { Npc3D } from "./npc3d";
import { LADEN_LISTE } from "../../../shared/laeden";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

/** Was die Welt der Quest zur Verfügung stellt */
export interface QuestUmgebung { motor: Welt3D; ort: { x: number; y: number }; hier: string; gesperrt: boolean; sperrenNeu(): void }
/** q: Id der Quest (shared/quests.ts); beiseite: steht gerade zur Seite; laeuft/fertig: entgegenlaufen (kommt) */
interface Figur { n: QuestFigur; q: string; /** alle Quests, in denen die Figur steht (Othmar: Quest 1, B3, B4) – ein Modell für alle */ qs: string[]; npc: Npc3D | null; x: number; y: number; nm: HTMLElement; mk: HTMLElement; beiseite?: boolean; laeuft?: boolean; fertig?: boolean }
interface Objekt { d: QuestObjekt; q: string; g: THREE.Group; kaputt?: THREE.Group; heil?: THREE.Group; ring: THREE.Mesh }
/** benannte Stellen für den Pfeil (QuestDef-Schritte mit wo: "esse" …) */
const ORTE: Record<string, [number, number]> = { esse: [STATIONEN.esse.x, STATIONEN.esse.y], amboss: [STATIONEN.amboss.x, STATIONEN.amboss.y] };
const SCHRANKEN: { q: QuestDef; s: Schranke }[] = QUESTS_B.flatMap((q) => (q.schranken || []).map((s) => ({ q, s })));
const offenFuer = (q: QuestDef, id: string): boolean => frei(q, questStandB(q.id), id) !== false;

export class QuestWelt {
  private figuren: Figur[] = []; private staemme: THREE.Group[] = [];
  constructor(private u: QuestUmgebung) {
    const holz = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 }), schnitt = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.8 });
    for (const { q, s: sp } of SCHRANKEN) for (const [x, y, l, w] of sp.staemme) { const g = new THREE.Group(), r = 0.32;
      const stamm = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, l, 12), [holz, schnitt, schnitt]); stamm.rotation.z = Math.PI / 2; stamm.position.y = r; g.add(stamm);
      g.position.set(x, this.u.motor.hoehe(x, y), y); g.rotation.y = w; g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); g.userData.sperre = sp.id; g.userData.q = q.id; this.u.motor.szene.add(g); this.staemme.push(g); }
    for (const q of QUESTS_B) for (const n of q.figuren) { const da = this.figuren.find((f) => f.n.id === n.id); if (da) { da.qs.push(q.id); continue; } /* Figur in mehreren Quests: ein Modell */ const nm = document.createElement("div"); nm.className = "ez-name3d quest"; nm.textContent = n.name; document.body.appendChild(nm);
      const mk = document.createElement("div"); mk.className = "ez-questmarke"; mk.textContent = "!"; mk.hidden = true; document.body.appendChild(mk);
      let npc: Npc3D | null = null; if (!n.wandert) { npc = new Npc3D(n.modell); npc.blick(n.blick[0], n.blick[1]); this.u.motor.szene.add(npc.gruppe); }
      this.figuren.push({ n, q: q.id, qs: [q.id], npc, x: n.x, y: n.y, nm, mk }); }
    this.objekteBauen();
    /* Mühlenflügel je Spieler (QuestDef.drehen): bei uns steht die Mühle, bis unser Schalter an ist */
    const DREHEN = QUESTS_B.flatMap((q) => q.drehen || []);
    if (DREHEN.length) this.u.motor.drehtHier = (x, z) => { const D = DREHEN.find((d) => Math.hypot(d.x - x, d.y - z) <= d.r); return !D || (questGeladen() && schalterAn((id) => questStandB(id), D.schalter)); };
    addEventListener("ez-quest", () => this.stand()); this.stand();
    /* Kopfbilder fürs Gespräch: die Figur aus ihrem 3D-Modell, der eigene Held aus seinem Bildnis (sonst die Grundfigur) */
    bildnisseVon(async (wer) => { if (wer === "Du") { const b = eigenesBildnis(); if (b) return b; const h = aktiverHeld(); return kopfbild(h ? "base" + h.aussehen.g + "3d" : "basemann3d"); }
      const n = QUESTS_B.flatMap((q) => q.figuren).find((x) => x.name === wer || x.name.endsWith(" " + wer) || x.name.startsWith(wer + " ")); if (n) return kopfbild(n.modell);
      const l = LADEN_LISTE.find((x) => x.haendler === wer); return l ? kopfbild(l.modell) : ""; }); }
  /** Stand geändert: Sperren (Baumstämme, Gehraster), Figuren, die beiseitetreten */
  private offenSchluessel = "";
  private stand() { const schl = SCHRANKEN.map(({ q, s }) => (offenFuer(q, s.id) ? 1 : 0)).join("") + "|" + this.tuerenZu().map((t) => t.id).join(",");
    if (schl !== this.offenSchluessel) { this.offenSchluessel = schl; for (const g of this.staemme) g.visible = !offenFuer(questDef(g.userData.q)!, g.userData.sperre); this.u.sperrenNeu(); }
    for (const f of this.figuren) { const B = f.n.beiseite; if (!B) continue; const q = questDef(f.q)!, auf = gilt(q, questStandB(q.id), B.wenn); if (auf === Boolean(f.beiseite)) continue; f.beiseite = auf;
      f.x = f.n.x + (auf ? B.dx : 0); f.y = f.n.y + (auf ? B.dy : 0); if (f.npc) f.npc.blick(...(auf ? B.blick : f.n.blick)); } }
  /** Die gesperrten Felder für diesen Spieler (leer, sobald die Quest sie freigibt) */
  sperren(): number[][] { return [...SCHRANKEN.filter(({ q, s }) => !offenFuer(q, s.id)).map(({ s }) => [...s.feld]), ...this.tuerenZu().map((t) => [t.feld[0], t.feld[1], t.feld[2] + 1, t.feld[3] + 1])]; } /* Türen: Ecken eingeschlossen, das Raster sperrt bis ausschließlich x1/y1 */
  /** Türen (shared/bosse.ts), die für diesen Spieler zu sind – dieselben sperrt der Server in der Kampfwelt */
  private tuerenZu() { return TUEREN.length && questGeladen() ? tuerenZu(TUEREN, (s) => schalterAn((id) => questStandB(id), s)) : TUEREN; }
  /** Wo steht die Figur gerade (wer umhergeht: der Wanderer in der Welt) */
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
    return { npc: true, x: p.x, y: p.y, text: `Mit ${f.n.name.replace(/^Wacht(mann|frau) /, "").replace(/ (Wegner|Kern)$/, "").replace(/^Förster /, "")} sprechen`, tat: () => rede(f.n.id), da: () => { const q = this.wo(f); return !!q && Math.hypot(q.x - this.u.ort.x, q.y - this.u.ort.y) <= 2.6; } }; }
  /** Figuren mit „kommt“ (z. B. Jori beim ersten Besuch): laufen dem Spieler in ihrer Region entgegen und sprechen ihn an */
  private entgegen(f: Figur, dt: number) { const K = f.n.kommt!, q = questDef(f.q)!;
    if (questGeladen() && gilt(q, questStandB(q.id), K.wenn) && this.u.hier === K.region && !f.fertig && !this.u.gesperrt) {
      const dx = this.u.ort.x - f.x, dy = this.u.ort.y - f.y, d = Math.hypot(dx, dy);
      if (d >= 14) { /* der Spieler steht woanders in der Region: die Figur kommt aus seiner Nähe herbeigelaufen (gut 12 Felder vor ihm, von ihrem Platz her) */
        f.x = this.u.ort.x - dx / d * 12; f.y = this.u.ort.y - dy / d * 12; }
      else if (d > 1.8) { const v = 3.2 * dt; f.x += dx / d * Math.min(v, d - 1.8); f.y += dy / d * Math.min(v, d - 1.8); f.laeuft = true; if (f.npc) { f.npc.blick(dx, dy); f.npc.spiele("gehen"); } }
      else if (f.laeuft) { f.fertig = true; if (f.npc) { f.npc.spiele("ruhe"); f.npc.blick(dx, dy); } rede(f.n.id); } }
    else if (f.npc && f.laeuft && !f.fertig) { f.laeuft = false; f.npc.spiele("ruhe"); } }
  schritt(dt: number) { const M = this.u.motor;
    this.objekteSchritt();
    for (const f of this.figuren) if (f.n.kommt) this.entgegen(f, dt);
    for (const f of this.figuren) { const p = this.wo(f), sichtbar = !!p && Math.hypot(p.x - this.u.ort.x, p.y - this.u.ort.y) < 40;
      if (f.npc) { f.npc.gruppe.visible = sichtbar; if (sichtbar) { f.npc.gruppe.position.set(f.x, M.hoehe(f.x, f.y), f.y); f.npc.schritt(dt); } }
      /* wer im Haus umhergeht (der Bürgermeister im Rathaus): Name und Marker nur aus der Nähe – sonst schweben sie über dem Dach */
      const nah = !f.n.wandert || (!!p && Math.hypot(p.x - this.u.ort.x, p.y - this.u.ort.y) < 7), h = p ? M.hoehe(p.x, p.y) : 0; f.nm.hidden = !sichtbar || !nah || !schildAn(f.nm, M, p!.x, h + 2.35, p!.y);
      /* „!“ / „?“ aus den Quest-Daten, nur beim Verfolgen – eine Einführung zeigt ihren Geber auch vorher */
      const z = questGeladen() ? zeichenAlle(QUESTS_B, questStandB, f.n.id, (q) => questVerfolgt(q.id) || Boolean(q.einfuehrung && lage(q, questStandB(q.id)).phase === "neu")) : null; /* mehrere Quests: „?“ vor „!“ */
      f.mk.hidden = !sichtbar || !nah || !z || !schildAn(f.mk, M, p!.x, h + 2.85, p!.y); if (z) f.mk.textContent = z; }
    this.pfeilSchritt(); }
  /** Das nächste Ziel (Figur oder Stelle) der verfolgten Quest; null: nichts zu tun */
  ziel(): { x: number; y: number } | null { if (!questGeladen()) return null;
    const qb = questDef(verfolgteQuest()); if (!qb) return null; const z = zielB(qb, questStandB(qb.id), ORTE); if (!z) return null; if (Array.isArray(z)) return { x: z[0], y: z[1] };
    const f = this.figuren.find((x) => x.qs.includes(qb.id) && x.n.id === z); return f ? this.wo(f) || { x: f.n.x, y: f.n.y } : null; }
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
  /* ───────── Questobjekte des Baukastens (QuestDef.objekte): Modelle „zaun“ (Bruchstelle, geflickt) und „ruten“ (Rutenbündel) ───────── */
  private objekte: Objekt[] = [];
  private objekteBauen() { const M = this.u.motor, holz = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.95 }), moos = new THREE.MeshStandardMaterial({ color: 0x4f7a2e, roughness: 1 }),
      stein = new THREE.MeshStandardMaterial({ color: 0x8a8a82, roughness: 0.9 }), rute = new THREE.MeshStandardMaterial({ color: 0x9a8a4a, roughness: 0.9 }), band = new THREE.MeshStandardMaterial({ color: 0x6b8a3a, roughness: 0.9 }),
      leuchten = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.5, depthWrite: false });
    const kiste = (b: number, h: number, t: number, m: THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(b, h, t), m);
    const ring = () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.72, 28), leuchten); r.rotation.x = -Math.PI / 2; r.renderOrder = 4; return r; };
    const alle = QUESTS_B.flatMap((q) => (q.objekte || []).map((d, nr) => ({ d, q: q.id, nr })));
    for (const { d, q, nr } of alle.filter((o) => o.d.modell === "zaun")) { const g = new THREE.Group(), kaputt = new THREE.Group(), heil = new THREE.Group();
      /* kaputt: ein Pfahl steht, einer ist samt Wurzel herausgedrückt und liegt schräg, die Latte hängt herunter, Moos am Boden */
      const p1 = kiste(0.14, 1.1, 0.14, holz); p1.position.set(-0.7, 0.55, 0); kaputt.add(p1);
      const p2 = kiste(0.14, 1.1, 0.14, holz); p2.position.set(0.6, 0.35, 0.15); p2.rotation.z = -0.95; kaputt.add(p2);
      const l1 = kiste(1.5, 0.08, 0.06, holz); l1.position.set(-0.05, 0.45, 0); l1.rotation.z = -0.35; kaputt.add(l1);
      const pl = new THREE.Mesh(new THREE.CircleGeometry(0.45, 14), moos); pl.rotation.x = -Math.PI / 2; pl.position.set(0.2, 0.02, 0.35); kaputt.add(pl);
      /* geflickt (nach der Abgabe der Ruten): beide Pfähle stehen, mit Weidenruten umwickelt */
      for (const x of [-0.7, 0.7]) { const p = kiste(0.14, 1.1, 0.14, holz); p.position.set(x, 0.55, 0); heil.add(p); const w = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12), band); w.rotation.x = Math.PI / 2; w.position.set(x, 0.75, 0); heil.add(w); }
      for (const y of [0.4, 0.8]) { const l = kiste(1.5, 0.08, 0.06, holz); l.position.set(0, y, 0); heil.add(l); }
      if (/Steine/.test(d.name)) for (const [x, z, r] of [[-1.2, 0.5, 0.28], [1.1, -0.4, 0.22], [0.3, 0.9, 0.18]]) { const st = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), stein); st.position.set(x, r * 0.6, z); g.add(st); }
      g.add(kaputt, heil); const r = ring(); r.position.y = 0.03; g.add(r);
      g.position.set(d.x, M.hoehe(d.x, d.y), d.y); g.rotation.y = nr * 0.9; g.traverse((o) => { o.castShadow = o !== r; o.receiveShadow = true; }); M.szene.add(g);
      this.objekte.push({ d, q, g, kaputt, heil, ring: r }); }
    /* „stelle“: nur der Leuchtring an vorhandener Kulisse (Obelisk, Gruft, Mühle …) */
    for (const { d, q } of alle.filter((o) => o.d.modell === "stelle")) { const g = new THREE.Group(), r = ring(); r.position.y = 0.05; g.add(r); g.position.set(d.x, M.hoehe(d.x, d.y), d.y); M.szene.add(g); this.objekte.push({ d, q, g, ring: r }); }
    for (const { d, q, nr } of alle.filter((o) => o.d.modell === "ruten")) { const g = new THREE.Group();
      for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.3, 5), rute); c.rotation.z = Math.PI / 2; c.rotation.y = (i - 4) * 0.035; c.position.set(0, 0.05 + (i % 3) * 0.035, (i - 4) * 0.025); g.add(c); }
      for (const x of [-0.3, 0.3]) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 5, 10), band); b.rotation.y = Math.PI / 2; b.position.set(x, 0.09, 0); g.add(b); }
      const r = ring(); r.position.y = 0.03; g.add(r);
      g.position.set(d.x, M.hoehe(d.x, d.y), d.y); g.rotation.y = nr * 1.3 + 0.4; g.traverse((o) => { o.castShadow = o !== r; o.receiveShadow = true; }); M.szene.add(g);
      this.objekte.push({ d, q, g, ring: r }); } }
  /** Sichtbarkeit nach dem eigenen Stand (aus den Quest-Daten): Aufgehobenes verschwindet; „heil“ zeigt z. B. den geflickten Zaun; leuchtet, solange es zu tun ist */
  private objekteSchritt() { const puls = 0.35 + 0.25 * Math.sin(performance.now() / 260);
    for (const o of this.objekte) { const nah = Math.hypot(o.d.x - this.u.ort.x, o.d.y - this.u.ort.y) < 45; o.g.visible = nah;
      if (!nah) continue; const q = questDef(o.q)!, L = objektLage(q, questStandB(q.id), o.d);
      if (o.kaputt && o.heil) { o.kaputt.visible = !L.heil; o.heil.visible = L.heil; } if (L.weg) o.g.visible = false;
      if (o.d.modell === "stelle" && !(L.leuchtet && questGeladen())) o.g.visible = false; /* eine Stelle an der Kulisse gibt es nur, solange sie zu tun ist (sonst bleibt deren eigenes „Ansehen“) */
      o.ring.visible = L.leuchtet && questGeladen(); (o.ring.material as THREE.MeshBasicMaterial).opacity = puls; } }
  /** Antippen einer Bruchstelle oder eines Rutenbündels: „Untersuchen“ / „Aufheben“ (hingehen, dann den Server fragen) */
  private objektStelle(x: number, y: number): { npc: boolean; x: number; y: number; text: string; tat: () => void; da: () => boolean } | null {
    let best: Objekt | null = null, bd = 1.2; for (const o of this.objekte) { if (!o.g.visible) continue; const d = Math.hypot(o.d.x - x, o.d.y - y); if (d < bd) { bd = d; best = o; } }
    if (!best) return null; const o = best;
    return { npc: false, x: o.d.x, y: o.d.y, text: o.d.tatText || `${o.d.name} ${o.d.tat === "aufheben" ? "aufheben" : o.d.tat === "benutzen" ? "benutzen" : "untersuchen"}`, tat: () => questDing(o.d.id, { x: this.u.ort.x, y: this.u.ort.y }), da: () => Math.hypot(o.d.x - this.u.ort.x, o.d.y - this.u.ort.y) <= 1.8 }; }
  /** Stand für Tests: ist eine Sperre (Baumstämme) für diesen Spieler noch zu? */
  get sperreZu(): boolean { return SCHRANKEN.some(({ q, s }) => !offenFuer(q, s.id)); }
}
