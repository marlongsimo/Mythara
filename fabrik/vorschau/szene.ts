/*
 * Mythara Fabrik – isolierte Testszene für modulare Figuren (Phaser 3.90, wie der Echtzeit-Client, aber ohne Server, Konto und Spielstand).
 * Die Figur besteht aus übereinandergelegten Ebenen: Körper, Rüstungsteile, Waffen (je eine Ebene hinter und vor dem Körper).
 * Alle Ebenen zeigen immer dasselbe Bild derselben Bewegung in derselben Richtung – die Szene zählt die Bilder selbst, damit nichts auseinanderläuft.
 *
 * Aufruf: …/fabrik/vorschau/?figur=held.krieger&version=v004
 * Steuerung: WASD oder Pfeile laufen (acht Richtungen), Tippen/Klicken läuft dorthin · J Angriff der getragenen Waffe · K Block (halten) · L Zweihandangriff · H Treffer · Leertaste Ausweichen · T Tod (noch einmal: aufstehen)
 * Für Prüfungen: window.FABRIK (Zustand lesen, Taten auslösen, Ausrüstung setzen).
 */
import Phaser from "phaser";

interface Anim { bilder: number; rate: number; schleife: boolean; halten?: number; treffer?: number; ohne?: string[] }
interface Ebene { art: "koerper" | "huelle" | "starr"; platz?: string; angriff?: string; atlas?: Record<string, { datei: string }> }
interface Meta { id: string; feld: number; fuss: [number, number]; mass: [number, number, number]; animationen: Record<string, Anim>; ebenen: Record<string, Ebene>; plaetze: Record<string, string[]>; tiefe: Record<string, Record<string, number[][]>> }

const P = new URLSearchParams(location.search), FIGUR = P.get("figur") || "held.krieger", VERSION = P.get("version") || "v004";
const BASIS = `../assets/${FIGUR}/${VERSION}/export/`, $ = (s: string) => document.querySelector(s) as HTMLElement;
const PLATZNAME: Record<string, string> = { hand_r: "Waffe", arm_l: "Schild", brust: "Brust", bein: "Beine", hand: "Hände", fuss: "Füße", kopf: "Kopf", hals: "Hals", guertel: "Gürtel" };
const TEMPO = 150; // Bildpunkte je Sekunde

class Szene extends Phaser.Scene {
  meta!: Meta; figur!: Phaser.GameObjects.Container; bilder = new Map<string, Phaser.GameObjects.Sprite>(); tragen: Record<string, string> = {};
  anim = "ruhe"; bild = 0; uhr = 0; richtung = 2; ziel: Phaser.Math.Vector2 | null = null; tasten!: Record<string, Phaser.Input.Keyboard.Key>; blockt = false; zielt = false; kampf = false; hilfen!: Phaser.GameObjects.Graphics; zeigeHilfen = false; drehen = false; drehUhr = 0;
  constructor() { super("test"); }
  preload() { this.load.json("meta", BASIS + FIGUR + ".json"); }
  create() {
    this.meta = this.cache.json.get("meta") as Meta; const g = this.add.graphics(); /* Boden: Schachbrett, damit man Bewegung und Fußpunkt sieht */
    for (let y = -40; y < 40; y++) for (let x = -40; x < 40; x++) g.fillStyle((x + y) & 1 ? 0x3a4a34 : 0x35442f, 1).fillRect(x * 64, y * 64, 64, 64);
    this.add.ellipse(0, 0, 60, 22, 0x000000, 0.35).setName("schatten").setDepth(1);
    this.figur = this.add.container(0, 0).setDepth(2); this.hilfen = this.add.graphics().setDepth(3);
    this.cameras.main.startFollow(this.figur, true, 0.12, 0.12).setZoom(Math.min(2, Math.max(1, Math.round(Math.min(this.scale.width, this.scale.height) / 420))));
    this.tasten = this.input.keyboard!.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,J,K,L,H,T,Q,R,U,F,N,E,G,B,SPACE") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (z: Phaser.Input.Pointer) => { this.ziel = new Phaser.Math.Vector2(z.worldX, z.worldY); });
    /* Anfangsausrüstung: je Platz das erste Teil */
    for (const [platz, teile] of Object.entries(this.meta.plaetze)) this.tragen[platz] = (this.meta.ebenen[teile[0]] as { wahlfrei?: boolean }).wahlfrei ? "" : teile[0]; /* wahlfreie Teile (Kapuze) zunächst abgelegt */
    this.tafel(); this.laden(() => { this.aufbauen(); this.zeige(); });
    document.querySelectorAll("#taten button").forEach((b) => { const t = (b as HTMLElement).dataset.tat!; (b as HTMLElement).hidden = t === "waffe_l" ? !this.meta.plaetze.hand_l : t !== "waffe" && !this.meta.animationen[t]; /* nur Knöpfe für Bewegungen, die die Figur hat */ if (t === "block") { b.addEventListener("pointerdown", () => { this.blockt = true; }); for (const e of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(e, () => { this.blockt = false; }); }
      else if (t === "zielen") { b.addEventListener("pointerdown", () => { this.zielt = true; }); for (const e of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(e, () => { this.zielt = false; }); } else b.addEventListener("click", () => this.tat(t)); });
    ($("#hilfen") as HTMLInputElement).addEventListener("change", (e) => { this.zeigeHilfen = (e.target as HTMLInputElement).checked; }); ($("#drehen") as HTMLInputElement).addEventListener("change", (e) => { this.drehen = (e.target as HTMLInputElement).checked; });
    (window as unknown as { FABRIK: object }).FABRIK = { szene: this, zustand: () => ({ anim: this.anim, bild: this.bild, richtung: this.richtung, x: this.figur.x, y: this.figur.y, tragen: { ...this.tragen }, sichtbar: [...this.bilder].filter(([, s]) => s.visible).map(([k]) => k), geladen: this.fertig }),
      tat: (t: string) => this.tat(t), waffenAngriff: () => this.waffenAngriff(), trage: (platz: string, teil: string) => this.trage(platz, teil), richte: (r: number) => { this.richtung = ((r % 8) + 8) % 8; this.zeige(); }, block: (an: boolean) => { this.blockt = an; } };
  }
  fertig = false;
  /** Welche Ebenen (Atlasse) braucht die jetzige Ausrüstung? */
  ebenenJetzt(): string[] { const aus = ["koerper"]; for (const teil of Object.values(this.tragen)) { if (!teil) continue; const e = this.meta.ebenen[teil]; if (e.art === "starr") aus.push(teil + ".hinten", teil + ".vorn"); else aus.push(teil); } return aus; }
  laden(dann: () => void) {
    const fehlt = this.ebenenJetzt().filter((e) => !this.textures.exists(e)); if (!fehlt.length) { dann(); return; }
    this.fertig = false; for (const e of fehlt) this.load.atlas(e, BASIS + "atlas/" + e + ".webp", BASIS + "atlas/" + e + ".json");
    this.load.once("complete", dann); this.load.start();
  }
  /** Für jede Ebene ein Bild im Behälter; der Ursprung jedes Bildes ist der Fußpunkt des Feldes */
  aufbauen() {
    for (const s of this.bilder.values()) s.destroy(); this.bilder.clear(); const [fx, fy] = this.meta.fuss;
    for (const e of this.ebenenJetzt()) if (this.textures.exists(e)) { const s = this.add.sprite(0, 0, e).setOrigin(fx, fy); this.figur.add(s); this.bilder.set(e, s); }
    this.fertig = true;
  }
  trage(platz: string, teil: string) { this.tragen[platz] = teil; const w = document.querySelector(`select[data-platz="${platz}"]`) as HTMLSelectElement | null; if (w) w.value = teil; this.laden(() => { this.aufbauen(); this.zeige(); }); }
  tafel() {
    const el = $("#plaetze"); el.innerHTML = "";
    for (const [platz, teile] of Object.entries(this.meta.plaetze)) { const l = document.createElement("label"); l.textContent = PLATZNAME[platz] || platz; const w = document.createElement("select"); w.dataset.platz = platz;
      w.innerHTML = `<option value="">– leer –</option>` + teile.map((t) => `<option value="${t}">${t.split(".").slice(1).join(" · ")}</option>`).join(""); w.value = this.tragen[platz] || ""; w.addEventListener("change", () => this.trage(platz, w.value)); l.appendChild(w); el.appendChild(l); }
  }
  /** Eine einmalige Bewegung beginnen (nur aus Ruhe, Laufen oder Block heraus) */
  tat(t: string) {
    if (t === "tod" && this.anim === "tod") { this.spiele("ruhe"); return; } /* noch einmal: wieder aufstehen */
    if (t === "stabhaltung") { this.kampf = !this.kampf; return; }                                  /* Kampfstellung an/aus (Magier) */
    if (t === "waffe") t = this.waffenAngriff(); else if (t === "waffe_l") t = this.waffenAngriff("hand_l"); if (!this.meta.animationen[t] || !["ruhe", "stabhaltung", this.gang, "block", "zielen"].includes(this.anim)) return; this.spiele(t); }
  /** Die Angriffsbewegung der Waffe in der rechten Hand (Kurzschwert: angriff, Axt: angriff_axt, Dolch: angriff_dolch) */
  /** Fortbewegung: Menschen laufen, Tiere wie die Riesenkröte springen */
  /** Stehen: in Kampfstellung (Magier: Stabhaltung, mit B umschalten), sonst Ruhe */
  get stand(): string { return this.kampf && this.meta.animationen.stabhaltung ? "stabhaltung" : "ruhe"; }
  get gang(): string { return this.meta.animationen.laufen ? "laufen" : "springen"; }
  /** Angriff ohne Waffe (Tiere): die Bewegung mit einem Trefferbild, z. B. der Zungenangriff */
  get eigenerAngriff(): string { return this.meta.animationen.angriff ? "angriff" : Object.keys(this.meta.animationen).find((a) => this.meta.animationen[a].treffer !== undefined && a !== "tod") || "angriff"; }
  waffenAngriff(platz = "hand_r"): string { const w = this.tragen[platz]; return (w && this.meta.ebenen[w]?.angriff) || (platz === "hand_r" ? this.eigenerAngriff : ""); }
  spiele(a: string) { if (this.anim === a) return; this.anim = a; this.bild = 0; this.uhr = 0; this.zeige(); }
  /** Alle Ebenen auf dasselbe Bild stellen und in die richtige Reihenfolge bringen */
  zeige() {
    const A = this.meta.animationen[this.anim], name = `${this.anim}/${this.richtung}/${this.bild}`, ohne = new Set(A.ohne || []); let i = 0;
    const waffen = Object.entries(this.tragen).filter(([, t]) => t && this.meta.ebenen[t].art === "starr").map(([platz, t]) => ({ platz, t, tiefe: this.meta.tiefe[t]?.[this.anim]?.[this.richtung]?.[this.bild] ?? 0 })).sort((a, b) => b.tiefe - a.tiefe); /* fernste zuerst */
    const folge = [...waffen.map((w) => w.t + ".hinten"), "koerper", ...Object.values(this.tragen).filter((t) => t && this.meta.ebenen[t].art === "huelle"), ...waffen.map((w) => w.t + ".vorn")];
    const versteckt = new Set(waffen.filter((w) => ohne.has(w.platz)).flatMap((w) => [w.t + ".hinten", w.t + ".vorn"]));
    for (const e of folge) { const s = this.bilder.get(e); if (!s) continue; const da = !versteckt.has(e) && s.texture.has(name); s.setVisible(da); if (da) s.setFrame(name); this.figur.moveTo(s, Math.min(i++, this.figur.length - 1)); }
  }
  update(_: number, dt: number) {
    if (!this.fertig) return; const T = this.tasten, A = this.meta.animationen[this.anim], frei = ["ruhe", "stabhaltung", this.gang].includes(this.anim);
    if (Phaser.Input.Keyboard.JustDown(T.J)) this.tat("waffe"); if (Phaser.Input.Keyboard.JustDown(T.U)) this.tat("waffe_l"); if (Phaser.Input.Keyboard.JustDown(T.T)) this.tat("tod"); if (Phaser.Input.Keyboard.JustDown(T.Q)) this.tat(this.meta.animationen.frosthauch ? "frosthauch" : "segen"); if (Phaser.Input.Keyboard.JustDown(T.R)) this.tat(this.meta.animationen.glutsphaere ? "glutsphaere" : "nova");
    if (Phaser.Input.Keyboard.JustDown(T.E)) this.tat("donnerwelle"); if (Phaser.Input.Keyboard.JustDown(T.G)) this.tat("stabschlag"); if (Phaser.Input.Keyboard.JustDown(T.B) && this.meta.animationen.stabhaltung) this.kampf = !this.kampf; if (Phaser.Input.Keyboard.JustDown(T.L)) this.tat("angriff2h"); if (Phaser.Input.Keyboard.JustDown(T.H)) this.tat("treffer"); if (Phaser.Input.Keyboard.JustDown(T.SPACE)) this.tat("ausweichen");
    const will = T.K.isDown || this.blockt; if (will && frei && this.meta.animationen.block) this.spiele("block"); if (!will && this.anim === "block") this.spiele("ruhe");
    /* Zielen (Armbrust): F halten – im Anschlag bleiben; J schießt aus dem Anschlag; N lädt nach */
    const zielt = T.F.isDown || this.zielt; if (zielt && frei && this.meta.animationen.zielen) this.spiele("zielen"); if (!zielt && this.anim === "zielen") this.spiele("ruhe");
    if (Phaser.Input.Keyboard.JustDown(T.N)) this.tat("nachladen");
    /* laufen: Tasten haben Vorrang vor dem angetippten Ziel */
    let dx = (T.D.isDown || T.RIGHT.isDown ? 1 : 0) - (T.A.isDown || T.LEFT.isDown ? 1 : 0), dy = (T.S.isDown || T.DOWN.isDown ? 1 : 0) - (T.W.isDown || T.UP.isDown ? 1 : 0);
    if (dx || dy) this.ziel = null; else if (this.ziel) { const vx = this.ziel.x - this.figur.x, vy = this.ziel.y - this.figur.y; if (Math.hypot(vx, vy) < 4) this.ziel = null; else { dx = vx; dy = vy; } }
    if (this.drehen && frei && !dx && !dy) { this.drehUhr += dt; if (this.drehUhr > 700) { this.drehUhr = 0; this.richtung = (this.richtung + 1) % 8; this.zeige(); } }
    if (["ruhe", "stabhaltung", this.gang].includes(this.anim)) {
      if (dx || dy) { const w = Math.atan2(dy, dx); /* 0 = Osten, π/2 = Süden, y nach unten */ this.richtung = ((Math.round(w / (Math.PI / 4)) % 8) + 8) % 8; const l = Math.hypot(dx, dy), s = Math.min(TEMPO * dt / 1000, this.ziel ? l : Infinity); this.figur.x += dx / l * s; this.figur.y += dy / l * s; this.spiele(this.gang); }
      else this.spiele(this.stand);
    }
    /* Bilder zählen */
    const B = this.meta.animationen[this.anim]; this.uhr += dt; const dauer = 1000 / B.rate; let neu = false;
    while (this.uhr >= dauer) { this.uhr -= dauer; neu = true;
      if (this.bild + 1 < B.bilder) this.bild++; else if (B.schleife) this.bild = 0; else if (this.anim === "block" || this.anim === "tod" || this.anim === "zielen") this.bild = B.halten ?? B.bilder - 1; /* Block und Tod bleiben im letzten Bild stehen */ else { this.anim = "ruhe"; this.bild = 0; this.uhr = 0; break; } }
    if (neu || A !== B) this.zeige();
    (this.children.getByName("schatten") as Phaser.GameObjects.Ellipse).setPosition(this.figur.x, this.figur.y);
    this.hilfen.clear(); if (this.zeigeHilfen) { const F = this.meta.feld, [fx, fy] = this.meta.fuss, x = this.figur.x, y = this.figur.y; this.hilfen.lineStyle(1, 0xffe08a, 0.9).strokeRect(x - F * fx, y - F * fy, F, F); this.hilfen.lineStyle(1, 0xff5a5a, 1).lineBetween(x - 14, y, x + 14, y).lineBetween(x, y - 14, x, y + 14); }
    const R = ["Osten", "Südosten", "Süden", "Südwesten", "Westen", "Nordwesten", "Norden", "Nordosten"][this.richtung];
    $("#stand").innerHTML = `<b>${this.meta.id}</b> · ${VERSION}<br>Bewegung <b>${this.anim}</b> · Bild ${this.bild + 1}/${B.bilder} · Blick <b>${R}</b><br>WASD/Pfeile oder antippen: laufen · J Angriff (je nach Waffe) · U linke Hand · K Block · L Zweihand · H Treffer · Leertaste Ausweichen · Q Segen · R Nova · F Zielen (halten) · N Nachladen · Magier: Q Frosthauch · E Donnerwelle · R Glutsphäre · G Stabschlag · B Kampfstellung · T Tod / Aufstehen`;
  }
}

new Phaser.Game({ type: Phaser.AUTO, parent: "spiel", backgroundColor: "#1b1722", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, render: { pixelArt: false, antialias: true }, scene: [Szene] });
