/*
 * Mythara – die offene Welt in 3D (seit 22.11.2026). Zwei Arten zu laufen:
 *   allein (echtzeit/welt3d.html, client/src/welt3d/main.ts): eigene Bewegung und Wegsuche, kein Server;
 *   im Spiel (?3d=1, client/src/welt3d/spiel.ts): die 2D-Welt bleibt die Spiellogik (Bewegung, Kollision, Server, Kampf, Knöpfe,
 *   Minikarte) und wird nur nicht mehr gezeichnet – die 3D-Welt ist die Ansicht. Sie liest die Stelle des Helden über die „Anbindung“
 *   und gibt Klicks, Stick und Kameradrehung zurück.
 * Liest dieselben Weltdaten wie die 2D-Welt (gebacken von werkzeug/welt/drei.mjs, Chunk für Chunk) und zeigt sie mit Three.js.
 * Alle Koordinaten sind Weltfelder wie in der 2D-Welt und auf dem Server (x Osten, z = y der Welt nach Süden, Höhe nach oben).
 * Geladen werden nur die Chunks um den Helden (am Handy 5 × 5, sonst 7 × 7), entfernte werden wieder freigegeben.
 *   Gelände mit Höhen (Wege scharf, Wiesen weich), Wasser, Bäume und Kleinteile, Kenney-Modelle (Burg, Ruinen, Felsen),
 *   Gebäude aus den Bauplänen (Dach weg beim Betreten, Türen öffnen sich), Figuren als gemalte Bilder (Mischform),
 *   Untergrund mit Felswänden, dunkel und mit Fackelschein.
 * Steuerung: Klick/Tippen = hingehen (Wegsuche auf dem Feldraster der 2D-Welt) · WASD = laufen · Pfeiltasten, Q/E oder rechte Maustaste
 * ziehen = Kamera drehen und neigen · Mausrad/zwei Finger = Zoom.
 */
import * as THREE from "three";
import { bauen, type Bauplan, type Gebaeude } from "./bauten";
import { modell, istBaum, istReihe, setzeKenney, STEGE, type Typ, type KenneyModell } from "./natur";
import { zufall, MATERIALIEN } from "./teile";
import { Figurbild } from "./figurbild";

type Gebiet = { id: string; name: string; untertitel: string; ebene: string; biom: string; x: number; y: number; b: number; h: number };
type Index = { stand: string; chunkFelder: number; start: [number, number]; gebiete: Gebiet[]; arten: Record<string, { id: string; farbe: string; wasser: boolean; begehbar: boolean }>;
  typen: Typ[]; bauplaene: Record<string, Bauplan>; chunks: string[] };
type ChunkDaten = { cx: number; cy: number; region: string; ebene: string; art?: string; boden: string[]; geh: string[]; hoehe: number[]; dinge: [number, number, number, number, number][];
  figuren: { figur: string; x: number; y: number }[]; interaktionen: unknown[] };
type Stueck = { d: ChunkDaten; obj: THREE.Object3D[]; bauten: Gebaeude[]; boden: THREE.Mesh | null; gebaut: boolean; feuer: THREE.Vector3[]; stege: number[][] };

const ATTRAPPE = document.createElement("div");
const $ = (s: string) => (document.querySelector(s) as HTMLElement | null) || ATTRAPPE;   /* fehlt ein Element (im Spiel), wirkt der Zugriff ins Leere */
const HANDY = matchMedia("(pointer: coarse)").matches, C = 32, BILD = "../", RADIUS = HANDY ? 2 : 3;
const P = new URLSearchParams(location.search);

/* Farben des Geländes (etwas kräftiger als die Legende, weil Licht und Schatten sie abdunkeln) */
const FARBE: Record<string, string> = { ".": "#4e7230", ",": "#567a33", v: "#566f34", f: "#3f4f28", m: "#5a4a32", t: "#4a3a2a", s: "#c2ad78", a: "#7f5e36", e: "#8f6b44", k: "#a1978a",
  p: "#968c7e", d: "#7a5638", h: "#5c544a", "~": "#3c7d9a", w: "#3f8296", o: "#2a3a30", F: "#6a655c", X: "#120e0b", " ": "#4a5e2d" };
const AUFLAGE = new Set(["k", "p", "e", "a", "d"]);   /* Wege, Pflaster, Äcker: scharf je Feld abgesetzt */

/** Pinselstruktur für den Boden: weiche, helle und dunkle Tupfer und Striche (grau, kachelbar) – wird mit den Bodenfarben multipliziert */
function pinsel() { const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!; g.fillStyle = "rgb(228,228,228)"; g.fillRect(0, 0, n, n);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const x = r() * n, y = r() * n, l = 6 + r() * 16, a = r() * Math.PI, v = Math.round(190 + r() * 65);
    g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 2 + r() * 4; g.lineCap = "round";
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

const BODEN = new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(1.1, 1.1, 1.1) });
/* Wasser: matt, mit gemalten Wellen in zwei Schichten, die gegeneinander ziehen; die Oberfläche wogt leicht, am Ufer heller Schaum,
   auf den Wellenkämmen kleine Lichtfunken. Eckpunktfarben tragen den Schaum (hell am Ufer, dunkler in der Mitte). */
const ZEIT = { value: 0 };
const WELLEN = (() => { const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!; g.fillStyle = "rgb(150,150,150)"; g.fillRect(0, 0, n, n);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) { const x = r() * n, y = r() * n, l = 10 + r() * 26, v = r() < 0.55 ? 205 + r() * 50 : 90 + r() * 40, b = 1.5 + r() * 3;
    g.strokeStyle = `rgba(${v},${v},${v},0.7)`; g.lineWidth = b; g.lineCap = "round";
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + l / 2, y + dy - 5 - r() * 4, x + dx + l, y + dy); g.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; })();
function wasserMaterial(farbe: number, deck: number, tempo: number) {
  const m = new THREE.MeshLambertMaterial({ color: farbe, vertexColors: true, transparent: true, opacity: deck, map: WELLEN });
  m.onBeforeCompile = (sh) => { sh.uniforms.zeit = ZEIT;
    sh.vertexShader = "uniform float zeit;\nvarying vec2 vW;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      vW = position.xz; transformed.y += (sin(position.x * 0.9 + zeit * 1.4) + cos(position.z * 1.2 + zeit * 1.1)) * 0.03 * ${tempo.toFixed(2)};`);
    sh.fragmentShader = "uniform float zeit;\nvarying vec2 vW;\n" + sh.fragmentShader.replace("#include <map_fragment>", `
      float zt = zeit * ${tempo.toFixed(2)};
      float w1 = texture2D(map, vW / 5.0 + vec2(zt * 0.035, zt * 0.012)).r, w2 = texture2D(map, vW / 8.0 + vec2(-zt * 0.02, zt * 0.03)).r, w = (w1 + w2) * 0.5;
      diffuseColor.rgb *= 0.62 + 0.75 * w;`).replace("#include <opaque_fragment>", `outgoingLight += vec3(smoothstep(0.74, 0.86, w) * 0.22);
      #include <opaque_fragment>`); };
  return m; }
const WASSER = wasserMaterial(0x2c6680, 0.9, 1), MOORWASSER = wasserMaterial(0x26342c, 0.94, 0.35);
const FARBEN = new Map<string, THREE.Color>(Object.entries(FARBE).map(([k, v]) => [k, new THREE.Color(v)]));
const farbe = (z: string) => FARBEN.get(z) || FARBEN.get(".")!;

/** Verbindung zur Spiellogik der 2D-Welt (im Spiel) */
export type Anbindung = { ort(): { x: number; y: number }; laeuft(): boolean; held(): { figur?: string; lauf?: string; laufMass?: number[]; gross?: number; fuss?: number[] };
  gehe(x: number, y: number): void; steuern(rx: number, ry: number): void };
/** Standardsicht: Norden oben wie in der 2D-Welt und auf der Minikarte, schräg von Süden */
export const STANDARD = { gieren: 0, neigen: 0.95, abstand: 24 };

export class Welt3D {
  constructor(private an: Anbindung | null = null, private behaelter: HTMLElement = $("#ez-feld")) {}
  hd: { figur?: string; lauf?: string; laufMass?: number[]; gross?: number; fuss?: number[] } = {};
  hinweise: { x: number; y: number; r: number; g: THREE.Group }[] = []; nord: HTMLElement | null = null; nordR = 0; zurueck: HTMLElement | null = null; stickStart: { x: number; y: number } | null = null;
  ix!: Index; szene = new THREE.Scene(); kamera = new THREE.PerspectiveCamera(42, 1, 0.5, 600); r!: THREE.WebGLRenderer;
  licht = new THREE.DirectionalLight(0xffdcae, 2.9); himmelLicht = new THREE.HemisphereLight(0xc6dcff, 0x5a4a30, 1.1); fackel = new THREE.PointLight(0xffb060, 0, 16, 1.4);
  st = new Map<string, Stueck>(); laedt = new Set<string>(); warte: string[] = []; vorhanden = new Set<string>(); naechsterBlick = 0;
  held = { x: 0, z: 0, blick: 1, lauf: 0 }; pfad: { x: number; z: number }[] = []; tasten: Record<string, boolean> = {};
  gieren = STANDARD.gieren; neigen = STANDARD.neigen; abstand = STANDARD.abstand; ziel = new THREE.Vector3(); uhr = new THREE.Clock();
  figur!: Figurbild; stand!: THREE.Texture; lauf!: THREE.Texture; schattenFleck!: THREE.Mesh; marke!: THREE.Mesh; fps: number[] = []; gebiet = ""; ebene = "";
  feuerLichter: THREE.PointLight[] = [];
  bilder = new THREE.TextureLoader(); bildMat = new Map<string, THREE.SpriteMaterial>(); bildTex = new Map<string, THREE.Texture>();

  async start() {
    this.r = new THREE.WebGLRenderer({ antialias: !HANDY, powerPreference: "high-performance" });
    this.r.setPixelRatio(Math.min(devicePixelRatio, HANDY ? 1.5 : 2)); this.r.shadowMap.enabled = !HANDY && P.get("schatten") !== "0"; this.r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.12;   /* filmisch und warm wie die Heldenbilder */
    if (this.an) this.r.domElement.style.cssText = "position:fixed;inset:0;z-index:0;touch-action:none"; this.behaelter.prepend(this.r.domElement); this.groesse(); addEventListener("resize", () => this.groesse());
    this.szene.fog = new THREE.Fog(0xb9cfe0, 60, 150); this.szene.add(this.himmelLicht, this.licht, this.licht.target, this.fackel);
    /* feste Zahl Feuerlichter (keine Neuübersetzung der Shader): sie wandern zu den nächsten Feuern */
    for (let i = 0; i < (HANDY ? 3 : 6); i++) { const l = new THREE.PointLight(0xff9a40, 0, 13, 1.6); this.feuerLichter.push(l); this.szene.add(l); }
    const s = this.licht.shadow; s.mapSize.set(2048, 2048); s.camera.left = s.camera.bottom = -38; s.camera.right = s.camera.top = 38; s.camera.near = 1; s.camera.far = 160; s.bias = -0.0006; s.normalBias = 0.04; this.licht.castShadow = true;
    BODEN.map = pinsel();
    $("#ez-lade").textContent = "Lade Weltdaten …";
    this.ix = await (await fetch("welt3d/index.json?t=" + Date.now())).json(); this.vorhanden = new Set(this.ix.chunks);
    try { setzeKenney(await (await fetch("welt3d/modelle.json?v=" + this.ix.stand)).json() as Record<string, KenneyModell>); } catch { /* ohne Kenney-Modelle: Bilder */ }
    /* Start: ?x=&y= (Weltfelder), sonst die gemerkte Stelle der 2D-Welt, sonst der Start der Waldmark */
    let [sx, sy] = this.ix.start;
    try { const g = JSON.parse(localStorage.getItem("ez_welt_pos") || "null"); if (Array.isArray(g) && this.vorhanden.has(Math.floor(g[0] / C) + "_" + Math.floor(g[1] / C))) [sx, sy] = g; } catch { /* privat */ }
    if (P.has("x")) { sx = Number(P.get("x")); sy = Number(P.get("y")); }
    if (this.an) { const o = this.an.ort(); sx = o.x; sy = o.y; this.hd = this.an.held(); }
    this.held.x = sx; this.held.z = sy; this.heldBauen();
    /* die Chunks um den Start zuerst ganz laden */
    $("#ez-lade").textContent = "Baue die Welt …"; this.nachladen(); await this.alleGeladen();
    while (this.warte.length) this.bauen(this.warte.shift()!);
    this.eingaben(); if (this.an) this.spielteile(); $("#ez-lade").remove(); this.r.setAnimationLoop(() => this.bild());
    Object.assign(window, { W3D: this });
  }
  groesse() { const w = innerWidth, h = innerHeight; this.r.setSize(w, h); this.kamera.aspect = w / h; this.kamera.updateProjectionMatrix(); }
  async alleGeladen() { for (let i = 0; i < 300 && this.laedt.size; i++) await new Promise((r) => setTimeout(r, 30)); }

  /* ───────── Chunks laden, bauen, freigeben ───────── */
  nachladen() { const hx = Math.floor(this.held.x / C), hz = Math.floor(this.held.z / C);
    for (let dz = -RADIUS; dz <= RADIUS; dz++) for (let dx = -RADIUS; dx <= RADIUS; dx++) { const k = hx + dx + "_" + (hz + dz); if (this.vorhanden.has(k) && !this.st.has(k) && !this.laedt.has(k)) { this.laedt.add(k); void this.holen(k); } }
    for (const [k, s] of this.st) if (Math.max(Math.abs(s.d.cx - hx), Math.abs(s.d.cy - hz)) > RADIUS + 1) this.freigeben(k); }
  async holen(k: string) { try { const d = (await (await fetch("welt3d/" + k + ".json?v=" + this.ix.stand)).json()) as ChunkDaten; this.st.set(k, { d, obj: [], bauten: [], boden: null, gebaut: false, feuer: [], stege: [] }); this.warte.push(k); } catch { /* später erneut */ } finally { this.laedt.delete(k); } }
  freigeben(k: string) { const s = this.st.get(k); if (!s) return; this.st.delete(k); this.hinweise = this.hinweise.filter((h) => !s.obj.includes(h.g)); const i = this.warte.indexOf(k); if (i >= 0) this.warte.splice(i, 1);
    for (const o of s.obj) { this.szene.remove(o); o.traverse((q) => { const im = q as THREE.InstancedMesh, m = q as THREE.Mesh; if (im.isInstancedMesh) im.dispose(); else if (m.isMesh && m.geometry && !m.geometry.userData.geteilt) m.geometry.dispose(); }); } }
  bauen(k: string) { const s = this.st.get(k); if (!s || s.gebaut) return; s.gebaut = true; this.gelaende(s); this.dinge(s); this.figuren(s); this.hinweiseBauen(s); }
  /** goldener Ring am Boden, sanfter Lichtschein und ein schwebender Rhombus über jeder Interaktion (sichtbar, wenn man nahe ist) */
  hinweiseBauen(s: Stueck) { for (const a of s.d.interaktionen as { x: number; y: number; radius?: number }[]) { const g = new THREE.Group(), y = this.stehHoehe(a.x, a.y);
      const ring = new THREE.Mesh(RING, new THREE.MeshBasicMaterial({ color: 0xf3d06a, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.07; ring.userData.deck = 0.7;
      const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLUT.map, color: 0xffd98a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); schein.position.y = 0.9; schein.scale.set(2.2, 2.6, 1); schein.userData.deck = 0.55;
      const raute = new THREE.Mesh(RAUTE, new THREE.MeshBasicMaterial({ color: 0xffd75e, transparent: true, opacity: 0.95, toneMapped: false })); raute.position.y = 2.9; raute.userData.deck = 0.95;
      g.add(ring, schein, raute); g.position.set(a.x, y, a.y); g.userData.y = 2.9; g.visible = false; this.szene.add(g); s.obj.push(g); this.hinweise.push({ x: a.x, y: a.y, r: a.radius || 1.5, g }); } }

  /* ───────── Abfragen in Weltfeldern ───────── */
  /** Höhe eines Eckpunkts (ganze Weltfelder); fehlt der Chunk, hilft der Rand eines Nachbarn */
  eck(wx: number, wy: number) { const cx = Math.floor(wx / C), cy = Math.floor(wy / C);
    for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) { const s = this.st.get(cx + dx + "_" + (cy + dy)); if (!s) continue; const lx = wx - (cx + dx) * C, ly = wy - (cy + dy) * C; if (lx > C + 1 || ly > C + 1) continue; return s.d.hoehe[(ly + 1) * (C + 3) + lx + 1] / 100; }
    return 0; }
  hoehe(x: number, z: number) { const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
    const a = this.eck(xi, zi), b = this.eck(xi + 1, zi), c = this.eck(xi, zi + 1), e = this.eck(xi + 1, zi + 1);
    return fx + fz < 1 ? a + (b - a) * fx + (c - a) * fz : e + (c - e) * (1 - fx) + (b - e) * (1 - fz); }
  gehbar(gx: number, gz: number) { const s = this.st.get(Math.floor(gx / C) + "_" + Math.floor(gz / C)); if (!s) return false; return s.d.geh[gz - s.d.cy * C]?.[gx - s.d.cx * C] === "."; }
  /** Höhe, auf der eine Figur steht: Gelände oder Brücke/Wehr darüber */
  stehHoehe(x: number, z: number) { let y = this.hoehe(x, z); const s = this.chunkBei(x, z); if (s) for (const [a, b, c, d, h] of s.stege) if (x > a && x < c && z > b && z < d) y = Math.max(y, h); return y; }
  chunkBei(x: number, z: number) { return this.st.get(Math.floor(x / C) + "_" + Math.floor(z / C)); }

  /* ───────── Gelände eines Chunks ───────── */
  gelaende(s: Stueck) {
    const d = s.d, W = C + 3, x0 = d.cx * C, y0 = d.cy * C, unten = d.ebene !== "oberwelt";
    const z = (tx: number, ty: number) => d.boden[ty + 1]?.[tx + 1] ?? " ", h = (lx: number, ly: number) => d.hoehe[(ly + 1) * W + lx + 1] / 100;
    const unter = (q: string) => (AUFLAGE.has(q) ? "." : q);
    const U: number[][] = []; for (let ly = 0; ly <= C; ly++) for (let lx = 0; lx <= C; lx++) { let r = 0, g = 0, b = 0;
      for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const f = farbe(unter(z(lx + dx, ly + dy))); r += f.r; g += f.g; b += f.b; }
      const j = 1 + (zufall((lx + x0) * 0.7, (ly + y0) * 1.3) - 0.5) * 0.14 + (zufall(Math.floor((lx + x0) / 3), Math.floor((ly + y0) / 3)) - 0.5) * 0.1 + (zufall(Math.floor((lx + x0) / 9), Math.floor((ly + y0) / 9)) - 0.5) * 0.12;
      const hell = unten ? Math.max(0.45, 1 - h(lx, ly) * 0.12) : 1; U[ly * (C + 1) + lx] = [(r / 4) * j * hell, (g / 4) * j * hell, (b / 4) * j * hell]; }
    /* Wasserspiegel je Eckpunkt (gemeinsam für benachbarte Kacheln, also ohne Stufen): knapp über dem höchsten Punkt ringsum */
    const wl = (cx: number, cy: number) => { let m = -9; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m = Math.max(m, h(Math.max(-1, Math.min(C + 1, cx + dx)), Math.max(-1, Math.min(C + 1, cy + dy)))); return m + 0.06; };
    const pos: number[] = [], col: number[] = [], uv: number[] = [], nor: number[] = [], wpos: number[] = [], mpos: number[] = [], wcol: number[] = [], mcol: number[] = [];
    for (let ty = 0; ty < C; ty++) for (let tx = 0; tx < C; tx++) {
      const q = z(tx, ty), scharf = AUFLAGE.has(q), fz = farbe(q), jit = 1 + (zufall((tx + x0) * 1.7, (ty + y0) * 0.9) - 0.5) * 0.12;
      const ecken = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      const v = ecken.map(([lx, ly]) => ({ lx, ly, p: [lx + x0, h(lx, ly), ly + y0], c: scharf ? [fz.r * jit, fz.g * jit, fz.b * jit] : U[ly * (C + 1) + lx] }));
      const tri = (tx + ty) % 2 ? [[0, 3, 1], [1, 3, 2]] : [[0, 3, 2], [0, 2, 1]];
      for (const t of tri) for (const i of t) { const e = v[i]; pos.push(...e.p); col.push(...e.c); uv.push(e.p[0] / 7, e.p[2] / 7);
        const n = new THREE.Vector3(h(e.lx - 1, e.ly) - h(e.lx + 1, e.ly), 2, h(e.lx, e.ly - 1) - h(e.lx, e.ly + 1)).normalize(); nor.push(n.x, n.y, n.z); }
      if (this.ix.arten[q]?.wasser) { const X = tx + x0, Y = ty + y0; const moor = q === "o", nass = (a: number, b: number) => Boolean(this.ix.arten[z(a, b)]?.wasser);
        /* Schaum: Ecke liegt am Ufer, wenn eines der vier anliegenden Felder kein Wasser ist */
        const schaum = (cx: number, cy: number) => (nass(cx - 1, cy - 1) && nass(cx, cy - 1) && nass(cx - 1, cy) && nass(cx, cy) ? (moor ? 0.9 : 0.86) : moor ? 1.15 : 1.32);
        for (const [ax, ay] of [[0, 0], [0, 1], [1, 1], [0, 0], [1, 1], [1, 0]]) { (moor ? mpos : wpos).push(X + ax, wl(tx + ax, ty + ay), Y + ay); const f = schaum(tx + ax, ty + ay); (moor ? mcol : wcol).push(f, f, f); } }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, BODEN); m.receiveShadow = true; this.szene.add(m); s.obj.push(m); s.boden = m;
    for (const [p, c, mat] of [[wpos, wcol, WASSER], [mpos, mcol, MOORWASSER]] as const) if (p.length) { const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); wg.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); wg.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((p.length / 3) * 2).fill(0), 2)); wg.computeVertexNormals(); const wm = new THREE.Mesh(wg, mat); wm.receiveShadow = true; this.szene.add(wm); s.obj.push(wm); }
  }

  /* ───────── Bäume, Kleinteile, Gebäude eines Chunks ───────── */
  dinge(s: Stueck) {
    const typen = this.ix.typen, gruppen = new Map<number, { m: THREE.Matrix4[]; f: THREE.Color[] }>(), reihen = s.d.dinge.filter(([t]) => istReihe(typen[t]));
    for (const [t, x, y, sk0] of s.d.dinge) { const typ = typen[t], gy = this.hoehe(x, y);
      if (typ.plan && this.ix.bauplaene[typ.id]) { const b = bauen(this.ix.bauplaene[typ.id], x, this.hoehe(x, y - 0.5), y); b.gruppe.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } }); this.szene.add(b.gruppe); s.obj.push(b.gruppe); s.bauten.push(b); continue; }
      const geo = modell(typ);
      if (geo) { let ry = 0;
        if (istBaum(typ)) ry = zufall(x, y) * Math.PI * 2;
        else if (istReihe(typ)) { let best = 99, dx = 1, dy = 0; for (const [, x2, y2] of reihen) { const e = Math.hypot(x2 - x, y2 - y); if (e > 0.1 && e < best) { best = e; dx = x2 - x; dy = y2 - y; } } if (Math.abs(dy) > Math.abs(dx) * 1.2) ry = Math.PI / 2; }
        if (!gruppen.has(t)) gruppen.set(t, { m: [], f: [] });
        const sk = sk0 * (istBaum(typ) ? 0.9 + zufall(y, x) * 0.2 : 1), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry);
        gruppen.get(t)!.m.push(new THREE.Matrix4().compose(new THREE.Vector3(x, gy - (istBaum(typ) ? 0.1 : 0), y), q, new THREE.Vector3(sk, sk, sk)));
        const hl = 0.88 + zufall(x * 3, y * 5) * 0.24; gruppen.get(t)!.f.push(new THREE.Color(hl, hl, hl)); continue; }
      if (/nebel/.test(typ.id)) continue;
      const st = STEGE[typ.id]; if (st) s.stege.push([x + st[0], y + st[1], x + st[2], y + st[3], gy + st[4]]);
      if (/moorlicht/.test(typ.id)) { const gl = new THREE.Sprite(IRRLICHT); gl.position.set(x + 0.08, gy + 1.75, y); gl.scale.setScalar(1.6); this.szene.add(gl); s.obj.push(gl); }
      if (/feuerkorb|festfeuer|fackel|laterne/.test(typ.id)) { const hoch = /festfeuer/.test(typ.id) ? 0.9 : /laterne/.test(typ.id) ? 1.5 : 1.7, p = new THREE.Vector3(x, gy + hoch, y); s.feuer.push(p); const gl = new THREE.Sprite(GLUT); gl.position.copy(p); gl.scale.setScalar(/festfeuer/.test(typ.id) ? 4 : 2.4); this.szene.add(gl); s.obj.push(gl); }
      /* Kein Modell: das gemalte Bild als Billboard (Mischform) */
      if (!this.bildMat.has(typ.id)) this.bildMat.set(typ.id, new THREE.SpriteMaterial({ map: this.textur(typ.bild), alphaTest: 0.2, toneMapped: false }));
      const sp = new THREE.Sprite(this.bildMat.get(typ.id)!), f = (typ.massstab * sk0) / 48; sp.center.set(typ.anker[0], 1 - typ.anker[1]); sp.scale.set(typ.groesse[0] * f, typ.groesse[1] * f, 1); sp.position.set(x, gy, y); this.szene.add(sp); s.obj.push(sp); }
    for (const [t, g] of gruppen) { const im = new THREE.InstancedMesh(modell(typen[t])!, MATERIALIEN, g.m.length);
      g.m.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, g.f[i]); }); im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere(); this.szene.add(im); s.obj.push(im); }
  }
  textur(pfad: string, fertig?: (t: THREE.Texture) => void): THREE.Texture { let t = this.bildTex.get(pfad);
    if (!t) { t = this.bilder.load(BILD + pfad, fertig ? (q) => setTimeout(() => fertig(q), 0) : undefined); t.colorSpace = THREE.SRGBColorSpace; this.bildTex.set(pfad, t); }
    else if (fertig) { const tt = t; if (tt.image && (tt.image as HTMLImageElement).complete !== false) fertig(tt); else setTimeout(() => this.textur(pfad, fertig), 200); }
    return t; }
  figuren(s: Stueck) {
    /* Dorfbewohner: Bildstreifen mit 8 Bildern zu 176 × 176 – das erste zeigen */
    for (const f of s.d.figuren) { const pfad = "img/echtzeit/" + f.figur + ".webp", fb = new Figurbild(this.textur(pfad));
      this.textur(pfad, (t) => { const n = Math.max(1, Math.round(t.image.width / t.image.height)); fb.setze(t, [1 / n, 1], [0, 0], [2.25, 2.25], [0.5, 0.06]); });
      fb.silhouette(false); fb.gruppe.position.set(f.x, this.hoehe(f.x, f.y) + 0.08, f.y); this.szene.add(fb.gruppe); s.obj.push(fb.gruppe, this.fleck(f.x, f.y)); } }
  fleck(x: number, z: number) { const m = new THREE.Mesh(FLECK, FLECK_MAT); m.rotation.x = -Math.PI / 2; m.position.set(x, this.hoehe(x, z) + 0.05, z); this.szene.add(m); return m; }

  /* ───────── Held ───────── */
  heldBauen() {
    this.stand = this.textur(this.hd.figur || "img/echtzeit/torvald.webp"); this.lauf = this.textur(this.hd.lauf || (this.hd.figur ? this.hd.figur : "img/echtzeit/torvald-lauf.webp"));
    if (!this.hd.figur) this.hd = { figur: "img/echtzeit/torvald.webp", lauf: "img/echtzeit/torvald-lauf.webp", laufMass: [0.5, 0.946, 0.855], gross: 1.065, fuss: [0.5, 0.94] };
    this.figur = new Figurbild(this.stand); this.szene.add(this.figur.gruppe); this.schattenFleck = this.fleck(this.held.x, this.held.z);
    this.marke = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffd75e, transparent: true, opacity: 0.85, depthWrite: false })); this.marke.rotation.x = -Math.PI / 2; this.marke.visible = false; this.szene.add(this.marke); }
  /** den Helden versetzen (Weltfelder) – etwa durch das Loch in den Untergrund */
  springen(x: number, z: number) { this.held.x = x; this.held.z = z; this.pfad = []; this.marke.visible = false; this.ziel.set(0, 0, 0); this.nachladen(); }
  frei(x: number, z: number) { const r = 0.28; for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) if (!this.gehbar(Math.floor(x + dx), Math.floor(z + dz))) return false; return true; }
  /** A* auf dem Feldraster der geladenen Chunks (8 Richtungen, keine Ecken abschneiden) */
  weg(ax: number, az: number, bx: number, bz: number): { x: number; z: number }[] {
    const ok = (x: number, z: number) => this.gehbar(x, z), K = 1 << 16;
    let zx = Math.floor(bx), zz = Math.floor(bz);
    if (!ok(zx, zz)) { /* Ziel gesperrt (Baum, Wand): das nächste freie Feld daneben */ let best = 1e9, nx = 0, nz = 0;
      for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (ok(zx + dx, zz + dz) && dx * dx + dz * dz < best) { best = dx * dx + dz * dz; nx = zx + dx; nz = zz + dz; }
      if (best === 1e9) return []; zx = nx; zz = nz; bx = nx + 0.5; bz = nz + 0.5; }
    const sx = Math.floor(ax), sz = Math.floor(az), key = (x: number, z: number) => z * K + x, g = new Map<number, number>(), von = new Map<number, number>(), offen: [number, number][] = [];
    const push = (k: number, f: number) => { offen.push([f, k]); let i = offen.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (offen[p][0] <= offen[i][0]) break; [offen[p], offen[i]] = [offen[i], offen[p]]; i = p; } };
    const pop = () => { const top = offen[0], last = offen.pop()!; if (offen.length) { offen[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < offen.length && offen[l][0] < offen[m][0]) m = l; if (r < offen.length && offen[r][0] < offen[m][0]) m = r; if (m === i) break; [offen[m], offen[i]] = [offen[i], offen[m]]; i = m; } } return top; };
    const hh = (x: number, z: number) => { const dx = Math.abs(x - zx), dz = Math.abs(z - zz); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    g.set(key(sx, sz), 0); push(key(sx, sz), hh(sx, sz)); let n = 0, gefunden = false;
    while (offen.length && n++ < 40000) { const [, k] = pop(), x = k % K, z = (k - x) / K; if (x === zx && z === zz) { gefunden = true; break; }
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, nz = z + dz; if (!ok(nx, nz)) continue; if (dx && dz && (!ok(x + dx, z) || !ok(x, z + dz))) continue;
        const nk = key(nx, nz), ng = g.get(k)! + (dx && dz ? 1.414 : 1); if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); von.set(nk, k); push(nk, ng + hh(nx, nz)); } } }
    if (!gefunden) return [];
    const p: { x: number; z: number }[] = []; let k = key(zx, zz); while (k !== key(sx, sz)) { const x = k % K; p.unshift({ x: x + 0.5, z: (k - x) / K + 0.5 }); k = von.get(k)!; }
    if (p.length) p[p.length - 1] = { x: bx, z: bz };
    const glatt: { x: number; z: number }[] = []; let a = { x: ax, z: az }, i = 0;   /* glätten: Punkte überspringen, solange die Linie frei ist */
    while (i < p.length) { let j = p.length - 1; while (j > i && !this.sicht(a, p[j])) j--; glatt.push(p[j]); a = p[j]; i = j + 1; }
    return glatt; }
  sicht(a: { x: number; z: number }, b: { x: number; z: number }) { const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 3); for (let i = 1; i <= n; i++) { const t = i / n; if (!this.frei(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false; } return true; }

  /* ───────── Eingaben ───────── */
  eingaben() {
    const el = this.r.domElement; let zieht = false, bewegt = 0, lx = 0, ly = 0; const finger = new Map<number, { x: number; y: number }>(); let pinch = 0; const mitte = { x: 0, y: 0 };
    addEventListener("keydown", (e) => { this.tasten[e.key.toLowerCase()] = true; if (e.key.startsWith("Arrow")) e.preventDefault(); });
    addEventListener("keyup", (e) => { this.tasten[e.key.toLowerCase()] = false; });
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    el.addEventListener("pointerdown", (e) => { finger.set(e.pointerId, { x: e.clientX, y: e.clientY }); zieht = true; bewegt = 0; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId);
      if (finger.size === 2) { const [a, b] = [...finger.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); mitte.x = (a.x + b.x) / 2; mitte.y = (a.y + b.y) / 2; } else if (this.an && e.pointerType === "touch") this.stickStart = { x: e.clientX, y: e.clientY }; });
    el.addEventListener("pointermove", (e) => { if (!finger.has(e.pointerId)) return; finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (finger.size === 2) { const [a, b] = [...finger.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (pinch) { this.abstand = Math.max(9, Math.min(60, this.abstand * pinch / d)); this.gieren -= (mx - mitte.x) * 0.008; this.neigen = Math.max(0.42, Math.min(1.35, this.neigen + (my - mitte.y) * 0.004)); }
        pinch = d; mitte.x = mx; mitte.y = my; bewegt = 99; if (this.an) this.stick(null); return; }
      if (!zieht) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; bewegt += Math.abs(dx) + Math.abs(dy);
      if (this.an && e.pointerType === "touch") { if (bewegt > 12) this.stick({ x: e.clientX, y: e.clientY }); return; }   /* im Spiel: ein Finger = Stick wie in der 2D-Welt */
      const drehen = e.buttons & 2 || e.buttons & 4 || (e.pointerType === "touch" && bewegt > 12); if (drehen) { this.gieren -= dx * 0.006; this.neigen = Math.max(0.42, Math.min(1.35, this.neigen + dy * 0.004)); } });
    const los = (e: PointerEvent) => { finger.delete(e.pointerId); if (finger.size < 2) pinch = 0; if (this.an) this.stick(null); if (!zieht) return; zieht = false; if (bewegt < 8 && e.button === 0) this.klick(e.clientX, e.clientY); };
    el.addEventListener("pointerup", los); el.addEventListener("pointercancel", (e) => { finger.delete(e.pointerId); zieht = false; if (this.an) this.stick(null); });
    el.addEventListener("wheel", (e) => { e.preventDefault(); this.abstand = Math.max(9, Math.min(60, this.abstand * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
    $("#ez-schatten").onclick = () => { this.r.shadowMap.enabled = !this.r.shadowMap.enabled; this.szene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined; for (const x of Array.isArray(m) ? m : m ? [m] : []) x.needsUpdate = true; }); $("#ez-schatten").textContent = this.r.shadowMap.enabled ? "Schatten: an" : "Schatten: aus"; };
    $("#ez-schatten").textContent = this.r.shadowMap.enabled ? "Schatten: an" : "Schatten: aus";
  }
  klick(px: number, py: number) { const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1), this.kamera);
    const t = ray.intersectObjects([...this.st.values()].map((s) => s.boden).filter((m): m is THREE.Mesh => Boolean(m)), false)[0]; if (!t) return;
    if (this.an) { this.an.gehe(t.point.x, t.point.z); this.marke.position.set(t.point.x, this.hoehe(t.point.x, t.point.z) + 0.06, t.point.z); this.marke.visible = true; return; }
    this.pfad = this.weg(this.held.x, this.held.z, t.point.x, t.point.z); if (this.pfad.length) { const z = this.pfad[this.pfad.length - 1]; this.marke.position.set(z.x, this.hoehe(z.x, z.z) + 0.06, z.z); this.marke.visible = true; } }

  /** Stick am Handy (im Spiel): Ziehen mit einem Finger lenkt den Helden in Bildschirmrichtung – umgerechnet nach der Kameradrehung */
  stick(p: { x: number; y: number } | null) { const el = document.querySelector("#ez-stick") as HTMLElement | null, st = this.stickStart;
    if (!p || !st || !this.an) { if (el) el.hidden = true; if (this.an) this.an.steuern(0, 0); if (!p) this.stickStart = null; return; }
    const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; if (el) { el.hidden = false; el.style.left = st.x + "px"; el.style.top = st.y + "px"; const i = el.querySelector("i") as HTMLElement | null; if (i) i.style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; }
    if (l < 8) { this.an.steuern(0, 0); return; } const k = Math.min(1, l / m), sx = dx / l, sy = dy / l, g = this.gieren;
    this.an.steuern((Math.cos(g) * sx + Math.sin(g) * sy) * k, (-Math.sin(g) * sx + Math.cos(g) * sy) * k); }
  /** Laufrichtung aus Tasten (Weltachsen der 2D-Welt) nach der Kameradrehung drehen: „hoch“ ist immer vom Betrachter weg */
  drehen(rx: number, ry: number): [number, number] { const g = this.gieren; return [Math.cos(g) * rx + Math.sin(g) * ry, -Math.sin(g) * rx + Math.cos(g) * ry]; }
  /** Im Spiel: Kompassnadel „N“ der Minikarte wandert mit der Drehung, Knopf „Kamera zurück“ */
  spielteile() { this.nord = document.querySelector("#ez-kartenrahmen .nord"); const rahmen = document.querySelector("#ez-kartenrahmen") as HTMLElement | null;
    if (rahmen) { const b = document.createElement("button"); b.type = "button"; b.id = "ez-kamera-zurueck"; b.title = "Kamera zurück"; b.setAttribute("aria-label", "Kamera zurück");
      b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
      b.style.cssText = "position:absolute;left:-4px;bottom:-4px;z-index:3;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#f3d895;background:linear-gradient(#3a2817,#24180e);border:2px solid #d6b066;box-shadow:0 3px 10px rgba(0,0,0,.55);transition:opacity .25s";
      b.onclick = (e) => { e.stopPropagation(); this.gieren = STANDARD.gieren; this.neigen = STANDARD.neigen; this.abstand = STANDARD.abstand; };
      if (getComputedStyle(rahmen).position === "static") rahmen.style.position = "relative"; rahmen.appendChild(b); this.zurueck = b; } }
  kompass() { const a = this.gieren, n = this.nord, r = this.nord?.parentElement;
    if (this.an) { const h = this.an.held(); if (h.figur && h.figur !== this.hd.figur) { this.hd = h; this.stand = this.textur(h.figur); this.lauf = this.textur(h.lauf || h.figur); } }   /* Heldenwechsel */
    if (n && r) { if (!this.nordR) { n.style.transform = ""; const rb = r.getBoundingClientRect(), nb = n.getBoundingClientRect(); this.nordR = Math.hypot(nb.left + nb.width / 2 - (rb.left + rb.width / 2), nb.top + nb.height / 2 - (rb.top + rb.height / 2)) || 1; }
      n.style.transform = `translate(${(this.nordR * Math.sin(a)).toFixed(1)}px, ${(this.nordR * (1 - Math.cos(a))).toFixed(1)}px)`; }
    if (this.zurueck) { const anders = Math.abs(((this.gieren - STANDARD.gieren + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) > 0.05 || Math.abs(this.neigen - STANDARD.neigen) > 0.05 || Math.abs(this.abstand - STANDARD.abstand) > 1;
      this.zurueck.style.opacity = anders ? "1" : "0"; this.zurueck.style.pointerEvents = anders ? "auto" : "none"; } }
  /** Licht und Himmel je Ebene: Oberwelt am Tag, Untergrund dunkel mit Fackelschein */
  art = "oberwelt";
  stimmung(ebene: string, art: string) { if (ebene === this.ebene) return; this.ebene = ebene; this.art = art; const unten = art !== "oberwelt", f = this.szene.fog as THREE.Fog;
    const himmel = new THREE.Color(art === "innen" ? "#0c0907" : unten ? "#0e0c0a" : "#b9cfe0"); this.szene.background = himmel; f.color.copy(himmel);
    this.himmelLicht.intensity = unten ? 0.62 : 1.1; this.himmelLicht.color.set(unten ? 0xb09a82 : 0xc6dcff); this.licht.intensity = unten ? 0.35 : 2.9; this.fackel.intensity = unten ? 30 : 0; this.fackel.distance = 20;
    if (art === "innen") { this.himmelLicht.intensity = 1.0; this.himmelLicht.color.set(0xffe2c0); this.licht.intensity = 1.1; this.fackel.intensity = 10; }   /* Innenraum: warmes Licht wie durch Fenster und Kerzen */ }

  /* ───────── Bild für Bild ───────── */
  bild() {
    const dt = Math.min(0.05, this.uhr.getDelta()), T = this.tasten, H = this.held; ZEIT.value += dt;
    /* fertig geladene Chunks bauen: einer je Bild, damit nichts ruckelt */
    if (this.warte.length) this.bauen(this.warte.shift()!);
    if (performance.now() > this.naechsterBlick) { this.naechsterBlick = performance.now() + 300; this.nachladen(); }
    if (T["arrowleft"] || T["q"]) this.gieren += dt * 1.8; if (T["arrowright"] || T["e"]) this.gieren -= dt * 1.8;
    if (T["arrowup"]) this.neigen = Math.min(1.35, this.neigen + dt * 0.9); if (T["arrowdown"]) this.neigen = Math.max(0.42, this.neigen - dt * 0.9);
    let rx = 0, rz = 0, laeuft = false; const vx = -Math.sin(this.gieren), vz = -Math.cos(this.gieren);
    if (this.an) { /* im Spiel: die 2D-Welt bewegt, die 3D-Welt folgt */ const o = this.an.ort(), dx = o.x - H.x, dz = o.y - H.z;
      if (Math.hypot(dx, dz) > 4) { H.x = o.x; H.z = o.y; this.ziel.set(0, 0, 0); this.nachladen(); } else { H.x = o.x; H.z = o.y; }
      laeuft = this.an.laeuft(); if (laeuft) { const rechts = dx * Math.cos(this.gieren) - dz * Math.sin(this.gieren); if (Math.abs(rechts) > 0.004) H.blick = rechts > 0 ? 1 : -1; H.lauf += dt; } else this.marke.visible = false; }
    else {
    if (!this.an) { if (T["w"]) { rx += vx; rz += vz; } if (T["s"]) { rx -= vx; rz -= vz; } if (T["a"]) { rx += vz; rz -= vx; } if (T["d"]) { rx -= vz; rz += vx; } }
    if (rx || rz) { this.pfad = []; this.marke.visible = false; }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z.x - H.x, dz = z.z - H.z, l = Math.hypot(dx, dz); if (l < 0.15) { this.pfad.shift(); if (!this.pfad.length) this.marke.visible = false; } else { rx = dx / l; rz = dz / l; } }
    const l = Math.hypot(rx, rz); laeuft = l > 0.01;
    if (laeuft) { const v = 4.6 * dt / l, nx = H.x + rx * v, nz = H.z + rz * v;
      if (this.frei(nx, nz)) { H.x = nx; H.z = nz; } else if (this.frei(nx, H.z)) H.x = nx; else if (this.frei(H.x, nz)) H.z = nz; else if (this.pfad.length) this.pfad.shift();
      const rechts = rx * Math.cos(this.gieren) - rz * Math.sin(this.gieren); if (Math.abs(rechts) > 0.2) H.blick = rechts > 0 ? 1 : -1; H.lauf += dt; } }
    const y = this.stehHoehe(H.x, H.z), fig = this.figur;
    const L = this.hd.laufMass || [0.5, 0.946, 0.91], fu = this.hd.fuss || [0.5, 0.94], gr = this.hd.gross || 1;
    if (laeuft && this.hd.lauf) { const n = Math.floor(H.lauf * 11) % 8, h = 2.05 / L[2]; fig.setze(this.lauf, [H.blick / 4, 1 / 2], [(n % 4 + (H.blick < 0 ? 1 : 0)) / 4, n < 4 ? 0.5 : 0], [h, h], [L[0], 1 - L[1]]); }
    else { const t = this.stand, w = t.image ? t.image.width / t.image.height : 0.7; fig.setze(t, [H.blick, 1], [H.blick < 0 ? 1 : 0, 0], [2.05 * gr * w, 2.05 * gr], [fu[0], 1 - fu[1]]); if (!laeuft) H.lauf = 0; }
    fig.gruppe.position.set(H.x, y + 0.08, H.z); this.schattenFleck.position.set(H.x, y + 0.05, H.z);
    /* Kamera folgt; Nebel bis an den Rand der geladenen Chunks */
    this.ziel.lerp(new THREE.Vector3(H.x, y + 1.1, H.z), this.ziel.lengthSq() ? 0.18 : 1);
    const cp = Math.cos(this.neigen), sp = Math.sin(this.neigen); this.kamera.position.set(this.ziel.x + Math.sin(this.gieren) * cp * this.abstand, this.ziel.y + sp * this.abstand, this.ziel.z + Math.cos(this.gieren) * cp * this.abstand); this.kamera.lookAt(this.ziel);
    const hier = this.chunkBei(H.x, H.z); if (hier) this.stimmung(hier.d.ebene, hier.d.art || (hier.d.ebene === "oberwelt" ? "oberwelt" : "untergrund")); const unten = this.art === "untergrund", drin = this.art === "innen", fog = this.szene.fog as THREE.Fog;
    const weit = Math.min((RADIUS + 0.4) * C, unten ? 34 + this.abstand : drin ? 40 + this.abstand : 60 + this.abstand * 1.8); fog.far = weit; fog.near = unten ? 6 + this.abstand * 0.4 : drin ? 16 + this.abstand * 0.6 : weit * 0.45;
    this.licht.position.set(this.ziel.x - 30, this.ziel.y + 55, this.ziel.z + 22); this.licht.target.position.copy(this.ziel); this.fackel.position.set(H.x + 0.4, y + 2.6, H.z + 0.6);
    /* Gebäude: drinnen kein Dach, Türen öffnen sich in der Nähe, Mühlenflügel drehen sich */
    for (const s of this.st.values()) for (const b of s.bauten) { const drin = b.raeume.some((r) => H.x > r.x0 && H.x < r.x1 && H.z > r.z0 && H.z < r.z1);
      for (const d of b.daecher) d.visible = !drin;
      for (const t of b.tueren) { const soll = Math.hypot(H.x - t.x, H.z - t.z) < 2.2 ? t.auf : t.zu; t.fluegel.rotation.y += (soll - t.fluegel.rotation.y) * 0.18; }
      for (const f of b.drehen) f.rotation.z -= dt * 0.6; }
    this.marke.rotation.z += dt;
    /* Feuerlichter zu den nächsten Feuern (nur im Untergrund und abends wichtig), leicht flackernd */
    { const nah: THREE.Vector3[] = []; for (const s of this.st.values()) for (const p of s.feuer) nah.push(p); nah.sort((a, b) => (a.x - H.x) ** 2 + (a.z - H.z) ** 2 - ((b.x - H.x) ** 2 + (b.z - H.z) ** 2));
      const t = performance.now() / 1000; this.feuerLichter.forEach((l, i) => { const p = nah[i]; if (!p || !unten) { l.intensity = 0; return; } l.position.copy(p); l.intensity = 22 * (0.85 + 0.15 * Math.sin(t * 9 + i * 2.1) * Math.sin(t * 5.3 + i)); }); }
    /* Hinweise: Türen, Leitern, Lesestellen leuchten golden, wenn man nahe ist */
    { const t = performance.now() / 1000; for (const h of this.hinweise) { const d = Math.hypot(h.x - H.x, h.y - H.z), an = d < h.r + 2.6; h.g.visible = an;
        if (an) { const k = d < h.r ? 1 : 1 - (d - h.r) / 2.6; h.g.scale.setScalar(0.9 + 0.08 * Math.sin(t * 3)); for (const c of h.g.children) { const m = (c as THREE.Mesh).material as THREE.Material & { opacity: number }; m.opacity = (c.userData.deck as number) * k; } h.g.children[2].position.y = h.g.userData.y + 0.15 * Math.sin(t * 2.4); } } }
    if (this.an) this.kompass();
    this.r.render(this.szene, this.kamera);
    const g = this.ix.gebiete.find((q) => H.x >= q.x && H.x < q.x + q.b && H.z >= q.y && H.z < q.y + q.h); if (g && g.id !== this.gebiet) { this.gebiet = g.id; $("#ez-ort b").textContent = g.name; $("#ez-ort small").textContent = g.untertitel; }
    this.fps.push(performance.now()); if (this.fps.length >= 30) { const f = (this.fps.length - 1) * 1000 / (this.fps[this.fps.length - 1] - this.fps[0]);   /* echte Bildrate (dt ist bei 0,05 s gedeckelt) */ $("#ez-fps").textContent = Math.round(f) + " FPS · " + this.r.info.render.calls + " Aufrufe · " + this.st.size + " Chunks"; this.fps = []; }
  }
}
const FLECK = new THREE.CircleGeometry(0.42, 16); FLECK.userData.geteilt = true;
/** Leuchtschein über Feuern und Laternen (additiv, ohne Tiefe) */
const IRRLICHT = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!, v = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  v.addColorStop(0, "rgba(200,255,220,0.95)"); v.addColorStop(0.4, "rgba(120,230,170,0.35)"); v.addColorStop(1, "rgba(80,200,140,0)"); g.fillStyle = v; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }); })();
const GLUT = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!, v = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  v.addColorStop(0, "rgba(255,210,140,0.9)"); v.addColorStop(0.35, "rgba(255,150,60,0.35)"); v.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = v; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }); })();
const FLECK_MAT = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.32, depthWrite: false });

const RING = new THREE.RingGeometry(0.55, 0.78, 32), RAUTE = new THREE.OctahedronGeometry(0.22, 0); RING.userData.geteilt = true; RAUTE.userData.geteilt = true;
