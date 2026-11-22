/*
 * Mythara – der 3D-Motor der offenen Welt (aus dem Prototyp welt3d/main.ts, seit 22.11.2026 die Spielwelt).
 * Zeichnet Gelände, Wasser, Bäume, Kenney-Modelle, Gebäude (Dach weg beim Betreten, Türen öffnen sich), Feuer, Nebel und Licht
 * aus den gebackenen Weltdaten (echtzeit/welt3d/, werkzeug/welt/drei.mjs) – Chunk für Chunk um den Helden.
 * Laufen, Wege, Gespräche, Ausgänge und alles Spielerische macht das Spiel (welt3d/spielwelt.ts); es setzt held.x/held.z
 * und bekommt angeklickte Bodenpunkte (beimKlick). Die Kamera folgt dem Helden und lässt sich drehen und zoomen:
 * rechte oder mittlere Maustaste ziehen, Mausrad, zwei Finger (drehen, auseinander/zusammen).
 * Alle Koordinaten sind Weltfelder wie in der 2D-Welt und auf dem Server (x Osten, z = y der Welt nach Süden, Höhe nach oben).
 */
import * as THREE from "three";
import { Figurbild } from "./figurbild";
import { bauen, type Bauplan, type Gebaeude } from "./bauten";
import { modell, istBaum, istReihe, setzeKenney, type Typ, type KenneyModell } from "./natur";
import { zufall, MATERIALIEN } from "./teile";

type Gebiet = { id: string; name: string; untertitel: string; ebene: string; biom: string; x: number; y: number; b: number; h: number };
type Index = { stand: string; chunkFelder: number; start: [number, number]; gebiete: Gebiet[]; arten: Record<string, { id: string; farbe: string; wasser: boolean; begehbar: boolean }>;
  typen: Typ[]; bauplaene: Record<string, Bauplan>; chunks: string[] };
type ChunkDaten = { cx: number; cy: number; region: string; ebene: string; boden: string[]; geh: string[]; hoehe: number[]; dinge: [number, number, number, number, number][];
  figuren: { figur: string; x: number; y: number }[]; interaktionen: unknown[] };
type Stueck = { d: ChunkDaten; obj: THREE.Object3D[]; bauten: Gebaeude[]; boden: THREE.Mesh | null; gebaut: boolean; feuer: THREE.Vector3[] };

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const HANDY = matchMedia("(pointer: coarse)").matches, C = 32, BILD = "../", RADIUS = HANDY ? 2 : 3;
const P = new URLSearchParams(location.search);

/* Farben des Geländes (etwas kräftiger als die Legende, weil Licht und Schatten sie abdunkeln) */
const FARBE: Record<string, string> = { ".": "#4e7230", ",": "#567a33", v: "#566f34", f: "#3f4f28", m: "#5a4a32", t: "#4a3a2a", s: "#c2ad78", a: "#7f5e36", e: "#8f6b44", k: "#a1978a",
  p: "#968c7e", d: "#7a5638", h: "#5c544a", "~": "#3c7d9a", w: "#3f8296", o: "#2a3a30", F: "#6a655c", " ": "#4a5e2d" };
const AUFLAGE = new Set(["k", "p", "e", "a", "d"]);   /* Wege, Pflaster, Äcker: scharf je Feld abgesetzt */

/** Pinselstruktur für den Boden: weiche, helle und dunkle Tupfer und Striche (grau, kachelbar) – wird mit den Bodenfarben multipliziert */
function pinsel() { const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!; g.fillStyle = "rgb(228,228,228)"; g.fillRect(0, 0, n, n);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const x = r() * n, y = r() * n, l = 6 + r() * 16, a = r() * Math.PI, v = Math.round(190 + r() * 65);
    g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 2 + r() * 4; g.lineCap = "round";
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

const BODEN = new THREE.MeshLambertMaterial({ vertexColors: true, color: new THREE.Color(1.1, 1.1, 1.1) });
const WASSER = new THREE.MeshPhongMaterial({ color: 0x3f8fae, specular: 0x99bbcc, shininess: 60, transparent: true, opacity: 0.85 });
const FARBEN = new Map<string, THREE.Color>(Object.entries(FARBE).map(([k, v]) => [k, new THREE.Color(v)]));
const farbe = (z: string) => FARBEN.get(z) || FARBEN.get(".")!;

export class Welt3D {
  ix!: Index; szene = new THREE.Scene(); kamera = new THREE.PerspectiveCamera(42, 1, 0.5, 600); r!: THREE.WebGLRenderer;
  licht = new THREE.DirectionalLight(0xffdcae, 2.9); himmelLicht = new THREE.HemisphereLight(0xc6dcff, 0x5a4a30, 1.1); fackel = new THREE.PointLight(0xffb060, 0, 16, 1.4);
  st = new Map<string, Stueck>(); laedt = new Set<string>(); warte: string[] = []; vorhanden = new Set<string>(); naechsterBlick = 0;
  held = { x: 0, z: 0, blick: 1, lauf: 0 }; pfad: { x: number; z: number }[] = []; tasten: Record<string, boolean> = {};
  gieren = 0.6; neigen = 0.95; abstand = 26; ziel = new THREE.Vector3(); uhr = new THREE.Clock();
  ebene = "";
  feuerLichter: THREE.PointLight[] = [];
  bilder = new THREE.TextureLoader(); bildMat = new Map<string, THREE.SpriteMaterial>(); bildTex = new Map<string, THREE.Texture>();

  /** Hook je Bild (vor dem Zeichnen) und für angeklickte Bodenpunkte (Weltfelder) */
  beimBild: ((dt: number) => void) | null = null; beimKlick: ((x: number, z: number) => void) | null = null;
  async start(behaelter: HTMLElement, sx: number, sz: number, laden: (text: string) => void = () => {}) {
    this.r = new THREE.WebGLRenderer({ antialias: !HANDY, powerPreference: "high-performance" });
    this.r.setPixelRatio(Math.min(devicePixelRatio, HANDY ? 1.5 : 2)); this.r.shadowMap.enabled = !HANDY && P.get("schatten") !== "0"; this.r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.12;   /* filmisch und warm wie die Heldenbilder */
    behaelter.appendChild(this.r.domElement); this.groesse(); addEventListener("resize", () => this.groesse());
    this.szene.fog = new THREE.Fog(0xb9cfe0, 60, 150); this.szene.add(this.himmelLicht, this.licht, this.licht.target, this.fackel);
    /* feste Zahl Feuerlichter (keine Neuübersetzung der Shader): sie wandern zu den nächsten Feuern */
    for (let i = 0; i < (HANDY ? 3 : 6); i++) { const l = new THREE.PointLight(0xff9a40, 0, 13, 1.6); this.feuerLichter.push(l); this.szene.add(l); }
    const s = this.licht.shadow; s.mapSize.set(2048, 2048); s.camera.left = s.camera.bottom = -38; s.camera.right = s.camera.top = 38; s.camera.near = 1; s.camera.far = 160; s.bias = -0.0006; s.normalBias = 0.04; this.licht.castShadow = true;
    BODEN.map = pinsel();
    laden("Lade Weltdaten …");
    this.ix = await (await fetch("welt3d/index.json?t=" + Math.floor(Date.now() / 60000))).json(); this.vorhanden = new Set(this.ix.chunks);
    try { setzeKenney(await (await fetch("welt3d/modelle.json?v=" + this.ix.stand)).json() as Record<string, KenneyModell>); } catch { /* ohne Kenney-Modelle: Bilder */ }
    this.held.x = sx; this.held.z = sz;
    laden("Baue die Welt …"); this.nachladen(); await this.alleGeladen();
    while (this.warte.length) this.bauen(this.warte.shift()!);
    this.eingaben(); this.r.setAnimationLoop(() => this.bild());
  }
  groesse() { const w = innerWidth, h = innerHeight; this.r.setSize(w, h); this.kamera.aspect = w / h; this.kamera.updateProjectionMatrix(); }
  async alleGeladen() { for (let i = 0; i < 300 && this.laedt.size; i++) await new Promise((r) => setTimeout(r, 30)); }

  /* ───────── Chunks laden, bauen, freigeben ───────── */
  nachladen() { const hx = Math.floor(this.held.x / C), hz = Math.floor(this.held.z / C);
    for (let dz = -RADIUS; dz <= RADIUS; dz++) for (let dx = -RADIUS; dx <= RADIUS; dx++) { const k = hx + dx + "_" + (hz + dz); if (this.vorhanden.has(k) && !this.st.has(k) && !this.laedt.has(k)) { this.laedt.add(k); void this.holen(k); } }
    for (const [k, s] of this.st) if (Math.max(Math.abs(s.d.cx - hx), Math.abs(s.d.cy - hz)) > RADIUS + 1) this.freigeben(k); }
  async holen(k: string) { try { const d = (await (await fetch("welt3d/" + k + ".json?v=" + this.ix.stand)).json()) as ChunkDaten; this.st.set(k, { d, obj: [], bauten: [], boden: null, gebaut: false, feuer: [] }); this.warte.push(k); } catch { /* später erneut */ } finally { this.laedt.delete(k); } }
  freigeben(k: string) { const s = this.st.get(k); if (!s) return; this.st.delete(k); const i = this.warte.indexOf(k); if (i >= 0) this.warte.splice(i, 1);
    for (const o of s.obj) { this.szene.remove(o); o.traverse((q) => { const im = q as THREE.InstancedMesh, m = q as THREE.Mesh; if (im.isInstancedMesh) im.dispose(); else if (m.isMesh && m.geometry && !m.geometry.userData.geteilt) m.geometry.dispose(); }); } }
  bauen(k: string) { const s = this.st.get(k); if (!s || s.gebaut) return; s.gebaut = true; this.gelaende(s); this.dinge(s); this.figuren(s); }

  /* ───────── Abfragen in Weltfeldern ───────── */
  /** Höhe eines Eckpunkts (ganze Weltfelder); fehlt der Chunk, hilft der Rand eines Nachbarn */
  eck(wx: number, wy: number) { const cx = Math.floor(wx / C), cy = Math.floor(wy / C);
    for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) { const s = this.st.get(cx + dx + "_" + (cy + dy)); if (!s) continue; const lx = wx - (cx + dx) * C, ly = wy - (cy + dy) * C; if (lx > C + 1 || ly > C + 1) continue; return s.d.hoehe[(ly + 1) * (C + 3) + lx + 1] / 100; }
    return 0; }
  hoehe(x: number, z: number) { const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
    const a = this.eck(xi, zi), b = this.eck(xi + 1, zi), c = this.eck(xi, zi + 1), e = this.eck(xi + 1, zi + 1);
    return fx + fz < 1 ? a + (b - a) * fx + (c - a) * fz : e + (c - e) * (1 - fx) + (b - e) * (1 - fz); }
  gehbar(gx: number, gz: number) { const s = this.st.get(Math.floor(gx / C) + "_" + Math.floor(gz / C)); if (!s) return false; return s.d.geh[gz - s.d.cy * C]?.[gx - s.d.cx * C] === "."; }
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
    const pos: number[] = [], col: number[] = [], uv: number[] = [], nor: number[] = [], wpos: number[] = [];
    for (let ty = 0; ty < C; ty++) for (let tx = 0; tx < C; tx++) {
      const q = z(tx, ty), scharf = AUFLAGE.has(q), fz = farbe(q), jit = 1 + (zufall((tx + x0) * 1.7, (ty + y0) * 0.9) - 0.5) * 0.12;
      const ecken = [[tx, ty], [tx + 1, ty], [tx + 1, ty + 1], [tx, ty + 1]];
      const v = ecken.map(([lx, ly]) => ({ lx, ly, p: [lx + x0, h(lx, ly), ly + y0], c: scharf ? [fz.r * jit, fz.g * jit, fz.b * jit] : U[ly * (C + 1) + lx] }));
      const tri = (tx + ty) % 2 ? [[0, 3, 1], [1, 3, 2]] : [[0, 3, 2], [0, 2, 1]];
      for (const t of tri) for (const i of t) { const e = v[i]; pos.push(...e.p); col.push(...e.c); uv.push(e.p[0] / 7, e.p[2] / 7);
        const n = new THREE.Vector3(h(e.lx - 1, e.ly) - h(e.lx + 1, e.ly), 2, h(e.lx, e.ly - 1) - h(e.lx, e.ly + 1)).normalize(); nor.push(n.x, n.y, n.z); }
      if (this.ix.arten[q]?.wasser) { const hw = Math.max(...v.map((e) => e.p[1])) + 0.12, X = tx + x0, Y = ty + y0; wpos.push(X, hw, Y, X, hw, Y + 1, X + 1, hw, Y + 1, X, hw, Y, X + 1, hw, Y + 1, X + 1, hw, Y); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, BODEN); m.receiveShadow = true; this.szene.add(m); s.obj.push(m); s.boden = m;
    if (wpos.length) { const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3)); wg.computeVertexNormals(); const wm = new THREE.Mesh(wg, WASSER); wm.receiveShadow = true; this.szene.add(wm); s.obj.push(wm); }
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
  /** den Helden versetzen (Weltfelder) – die Kamera springt mit */
  springen(x: number, z: number) { this.held.x = x; this.held.z = z; this.ziel.set(0, 0, 0); this.nachladen(); }
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

  /* ───────── Eingaben: nur die Kamera (Laufen und Antippen macht das Spiel) ───────── */
  /** Bildschirmpunkt → Bodenpunkt (Weltfelder) oder null */
  boden(px: number, py: number): { x: number; z: number } | null { const ray = new THREE.Raycaster(), b = this.r.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((px - b.left) / b.width) * 2 - 1, -((py - b.top) / b.height) * 2 + 1), this.kamera);
    const t = ray.intersectObjects([...this.st.values()].map((s) => s.boden).filter((m): m is THREE.Mesh => Boolean(m)), false)[0]; return t ? { x: t.point.x, z: t.point.z } : null; }
  /** Weltpunkt → Bildschirmpunkt (CSS-Pixel) oder null, wenn hinter der Kamera */
  bildschirm(x: number, y: number, z: number): { x: number; y: number } | null { const v = new THREE.Vector3(x, y, z).project(this.kamera); if (v.z > 1) return null; const b = this.r.domElement.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; }
  eingaben() {
    const el = this.r.domElement; let dreht = false, lx = 0, ly = 0; const finger = new Map<number, { x: number; y: number }>(); let pinch = 0, winkel = 0;
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") { finger.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (finger.size === 2) { const [a, b] = [...finger.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); winkel = Math.atan2(b.y - a.y, b.x - a.x); } return; }
      if (e.button === 1 || e.button === 2) { dreht = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); e.preventDefault(); } });
    el.addEventListener("pointermove", (e) => { if (e.pointerType === "touch") { if (!finger.has(e.pointerId)) return; finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (finger.size === 2) { const [a, b] = [...finger.values()], d = Math.hypot(a.x - b.x, a.y - b.y), w = Math.atan2(b.y - a.y, b.x - a.x); if (pinch) this.abstand = Math.max(9, Math.min(60, this.abstand * pinch / d)); let dw = w - winkel; if (dw > Math.PI) dw -= 2 * Math.PI; if (dw < -Math.PI) dw += 2 * Math.PI; this.gieren += dw; pinch = d; winkel = w; } return; }
      if (!dreht) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; this.gieren -= dx * 0.006; this.neigen = Math.max(0.42, Math.min(1.35, this.neigen + dy * 0.004)); });
    const los = (e: PointerEvent) => { finger.delete(e.pointerId); if (finger.size < 2) pinch = 0; if (e.button === 1 || e.button === 2) dreht = false; };
    el.addEventListener("pointerup", los); el.addEventListener("pointercancel", los);
    el.addEventListener("wheel", (e) => { e.preventDefault(); this.abstand = Math.max(9, Math.min(60, this.abstand * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  }
  /** Zwei Finger liegen auf dem Bild (dann steuert das Spiel nicht mit dem Stick) */
  get zweiFinger(): boolean { return false; }
  klick(px: number, py: number) { const p = this.boden(px, py); if (p && this.beimKlick) this.beimKlick(p.x, p.z); }

  /** Licht und Himmel je Ebene: Oberwelt am Tag, Untergrund dunkel mit Fackelschein */
  stimmung(ebene: string) { if (ebene === this.ebene) return; this.ebene = ebene; const unten = ebene !== "oberwelt", f = this.szene.fog as THREE.Fog;
    const himmel = new THREE.Color(unten ? "#0e0c0a" : "#b9cfe0"); this.szene.background = himmel; f.color.copy(himmel);
    this.himmelLicht.intensity = unten ? 0.62 : 1.1; this.himmelLicht.color.set(unten ? 0xb09a82 : 0xc6dcff); this.licht.intensity = unten ? 0.35 : 2.9; this.fackel.intensity = unten ? 30 : 0; this.fackel.distance = 20; }

  /* ───────── Bild für Bild ───────── */
  bild() {
    const dt = Math.min(0.1, this.uhr.getDelta()), H = this.held;   /* auf schwachen Geräten bis 0,1 s je Bild – sonst liefe der Held dort langsamer */
    /* fertig geladene Chunks bauen: einer je Bild, damit nichts ruckelt */
    if (this.warte.length) this.bauen(this.warte.shift()!);
    if (performance.now() > this.naechsterBlick) { this.naechsterBlick = performance.now() + 300; this.nachladen(); }
    if (this.beimBild) this.beimBild(dt);
    const y = this.hoehe(H.x, H.z);
    /* Kamera folgt; Nebel bis an den Rand der geladenen Chunks */
    this.ziel.lerp(new THREE.Vector3(H.x, y + 1.1, H.z), this.ziel.lengthSq() ? 0.18 : 1);
    const cp = Math.cos(this.neigen), sp = Math.sin(this.neigen); this.kamera.position.set(this.ziel.x + Math.sin(this.gieren) * cp * this.abstand, this.ziel.y + sp * this.abstand, this.ziel.z + Math.cos(this.gieren) * cp * this.abstand); this.kamera.lookAt(this.ziel);
    const hier = this.chunkBei(H.x, H.z); this.stimmung(hier ? hier.d.ebene : this.ebene || "oberwelt"); const unten = this.ebene !== "oberwelt", fog = this.szene.fog as THREE.Fog;
    const weit = Math.min((RADIUS + 0.4) * C, unten ? 34 + this.abstand : 60 + this.abstand * 1.8); fog.far = weit; fog.near = unten ? 6 + this.abstand * 0.4 : weit * 0.45;
    this.licht.position.set(this.ziel.x - 30, this.ziel.y + 55, this.ziel.z + 22); this.licht.target.position.copy(this.ziel); this.fackel.position.set(H.x + 0.4, y + 2.6, H.z + 0.6);
    /* Gebäude: drinnen kein Dach, Türen öffnen sich in der Nähe, Mühlenflügel drehen sich */
    for (const s of this.st.values()) for (const b of s.bauten) { const drin = b.raeume.some((r) => H.x > r.x0 && H.x < r.x1 && H.z > r.z0 && H.z < r.z1);
      for (const d of b.daecher) d.visible = !drin;
      for (const t of b.tueren) { const soll = Math.hypot(H.x - t.x, H.z - t.z) < 2.2 ? t.auf : t.zu; t.fluegel.rotation.y += (soll - t.fluegel.rotation.y) * 0.18; }
      for (const f of b.drehen) f.rotation.z -= dt * 0.6; }
    /* Feuerlichter zu den nächsten Feuern (nur im Untergrund und abends wichtig), leicht flackernd */
    { const nah: THREE.Vector3[] = []; for (const s of this.st.values()) for (const p of s.feuer) nah.push(p); nah.sort((a, b) => (a.x - H.x) ** 2 + (a.z - H.z) ** 2 - ((b.x - H.x) ** 2 + (b.z - H.z) ** 2));
      const t = performance.now() / 1000; this.feuerLichter.forEach((l, i) => { const p = nah[i]; if (!p || !unten) { l.intensity = 0; return; } l.position.copy(p); l.intensity = 22 * (0.85 + 0.15 * Math.sin(t * 9 + i * 2.1) * Math.sin(t * 5.3 + i)); }); }
    this.r.render(this.szene, this.kamera);
  }
}
const FLECK = new THREE.CircleGeometry(0.42, 16); FLECK.userData.geteilt = true;
/** Leuchtschein über Feuern und Laternen (additiv, ohne Tiefe) */
const GLUT = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d")!, v = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  v.addColorStop(0, "rgba(255,210,140,0.9)"); v.addColorStop(0.35, "rgba(255,150,60,0.35)"); v.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = v; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }); })();
const FLECK_MAT = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.32, depthWrite: false });

