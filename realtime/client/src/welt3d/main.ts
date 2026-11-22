/*
 * Mythara – 3D-Prototyp der offenen Welt (echtzeit/welt3d.html, 22.11.2026). Nicht Teil des Spiels: kein Server, kein Konto.
 * Liest dieselben Weltdaten wie die 2D-Welt (gebacken von werkzeug/welt/drei.mjs) und zeigt sie mit Three.js:
 *   Gelände mit Höhen (Felder als Kacheln, Wege scharf abgesetzt, Wiesen weich verlaufend), Wasser, Low-Poly-Bäume und Kleinteile,
 *   Gebäude aus den Bauplänen (Dächer verschwinden beim Betreten, Türen gehen auf), Figuren als gemalte Bilder (Mischform).
 * Steuerung: Klick/Tippen = hingehen (Wegsuche auf dem Feldraster der 2D-Welt) · WASD = laufen · Pfeiltasten, Q/E oder rechte Maustaste
 * ziehen = Kamera drehen und neigen · Mausrad/zwei Finger = Zoom.
 */
import * as THREE from "three";
import { bauen, type Bauplan, type Gebaeude } from "./bauten";
import { modell, istBaum, istReihe, type Typ } from "./natur";
import { zufall, MATERIALIEN } from "./teile";
import { Figurbild } from "./figurbild";

type Daten = { x0: number; y0: number; b: number; h: number; start: [number, number]; gebiete: { id: string; name: string; untertitel: string; x: number; y: number; b: number; h: number }[];
  arten: Record<string, { id: string; farbe: string; wasser: boolean; begehbar: boolean }>; boden: string[]; geh: string[]; hoehe: number[];
  typen: Typ[]; dinge: [number, number, number, number, number][]; bauplaene: Record<string, Bauplan>; figuren: { figur: string; x: number; y: number }[] };

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const HANDY = matchMedia("(pointer: coarse)").matches, C = 32, BILD = "../";
const P = new URLSearchParams(location.search);

/* Farben des Geländes (etwas kräftiger als die Legende, weil Licht und Schatten sie abdunkeln) */
const FARBE: Record<string, string> = { ".": "#4e7230", ",": "#567a33", v: "#566f34", f: "#3f4f28", m: "#5a4a32", t: "#4a3a2a", s: "#c2ad78", a: "#7f5e36", e: "#8f6b44", k: "#a1978a",
  p: "#968c7e", d: "#7a5638", h: "#5c544a", "~": "#3c7d9a", w: "#3f8296", o: "#2a3a30", F: "#77746c", " ": "#4a5e2d" };
const AUFLAGE = new Set(["k", "p", "e", "a", "d"]);   /* Wege, Pflaster, Äcker: scharf je Feld abgesetzt */

/** Pinselstruktur für den Boden: weiche, helle und dunkle Tupfer und Striche (grau, kachelbar) – wird mit den Bodenfarben multipliziert */
function pinsel() { const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!; g.fillStyle = "rgb(228,228,228)"; g.fillRect(0, 0, n, n);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const x = r() * n, y = r() * n, l = 6 + r() * 16, a = r() * Math.PI, v = Math.round(190 + r() * 65);
    g.strokeStyle = `rgba(${v},${v},${v},0.55)`; g.lineWidth = 2 + r() * 4; g.lineCap = "round";
    for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) { g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

class Welt3D {
  d!: Daten; szene = new THREE.Scene(); kamera = new THREE.PerspectiveCamera(42, 1, 0.5, 400); r!: THREE.WebGLRenderer; licht = new THREE.DirectionalLight(0xffdcae, 2.9);
  stuecke: { cx: number; cy: number; obj: THREE.Object3D[] }[] = []; boden: THREE.Mesh[] = []; bauten: Gebaeude[] = [];
  held = { x: 0, z: 0, blick: 1, lauf: 0 }; pfad: { x: number; z: number }[] = []; tasten: Record<string, boolean> = {};
  gieren = 0.6; neigen = 0.95; abstand = 26; ziel = new THREE.Vector3(); uhr = new THREE.Clock();
  figur!: Figurbild; stand!: THREE.Texture; lauf!: THREE.Texture; schattenFleck!: THREE.Mesh; marke!: THREE.Mesh; fps: number[] = []; gebiet = "";

  async start() {
    this.r = new THREE.WebGLRenderer({ antialias: !HANDY, powerPreference: "high-performance" });
    this.r.setPixelRatio(Math.min(devicePixelRatio, HANDY ? 1.5 : 2)); this.r.shadowMap.enabled = !HANDY && P.get("schatten") !== "0"; this.r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 1.12;   /* filmisch und warm wie die Heldenbilder */
    $("#ez-feld").appendChild(this.r.domElement); this.groesse(); addEventListener("resize", () => this.groesse());
    const himmel = new THREE.Color("#b9cfe0"); this.szene.background = himmel; this.szene.fog = new THREE.Fog(himmel, 60, 150);
    this.szene.add(new THREE.HemisphereLight(0xc6dcff, 0x5a4a30, 1.1)); this.szene.add(this.licht); this.szene.add(this.licht.target);
    const s = this.licht.shadow; s.mapSize.set(2048, 2048); s.camera.left = s.camera.bottom = -38; s.camera.right = s.camera.top = 38; s.camera.near = 1; s.camera.far = 160; s.bias = -0.0006; s.normalBias = 0.04; this.licht.castShadow = true;
    $("#ez-lade").textContent = "Lade Weltdaten …";
    this.d = await (await fetch("welt3d/daten.json?t=" + Date.now())).json();
    $("#ez-lade").textContent = "Baue Gelände …"; await new Promise((r) => setTimeout(r, 20)); this.gelaende();
    $("#ez-lade").textContent = "Setze Bäume und Häuser …"; await new Promise((r) => setTimeout(r, 20)); this.dinge(); this.figuren();
    const [sx, sy] = P.has("x") ? [Number(P.get("x")), Number(P.get("y"))] : this.d.start; this.held.x = sx; this.held.z = sy; this.heldBauen();
    this.eingaben(); $("#ez-lade").remove(); this.r.setAnimationLoop(() => this.bild());
    Object.assign(window, { W3D: this });
  }
  groesse() { const w = innerWidth, h = innerHeight; this.r.setSize(w, h); this.kamera.aspect = w / h; this.kamera.updateProjectionMatrix(); }

  /* ───────── Gelände ───────── */
  hoeheEcke(x: number, y: number) { const W = this.d.b + 1; x = Math.max(0, Math.min(this.d.b, x)); y = Math.max(0, Math.min(this.d.h, y)); return this.d.hoehe[y * W + x] / 100; }
  /** Höhe an einer beliebigen Stelle (wie die Dreiecke des Geländes) */
  hoehe(x: number, z: number) { const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
    const a = this.hoeheEcke(xi, zi), b = this.hoeheEcke(xi + 1, zi), c = this.hoeheEcke(xi, zi + 1), e = this.hoeheEcke(xi + 1, zi + 1);
    return fx + fz < 1 ? a + (b - a) * fx + (c - a) * fz : e + (c - e) * (1 - fx) + (b - e) * (1 - fz); }
  zeichen(x: number, y: number) { const z = this.d.boden[Math.max(0, Math.min(this.d.h - 1, y))]; return z ? z[Math.max(0, Math.min(this.d.b - 1, x))] : " "; }
  gelaende() {
    const d = this.d, farbe = new Map<string, THREE.Color>(); for (const k in FARBE) farbe.set(k, new THREE.Color(FARBE[k]));
    const F = (z: string) => farbe.get(z) || farbe.get(".")!, unter = (z: string) => (AUFLAGE.has(z) ? "." : z);
    /* Unterlage je Eckpunkt: Mittel der vier anliegenden Felder (Wege zählen als Wiese) – ergibt weiche Übergänge */
    const W = d.b + 1, U = new Float32Array(W * (d.h + 1) * 3), c = new THREE.Color();
    for (let y = 0; y <= d.h; y++) for (let x = 0; x <= d.b; x++) { let r = 0, g = 0, b = 0;
      for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const f = F(unter(this.zeichen(x + dx, y + dy))); r += f.r; g += f.g; b += f.b; }
      const j = 1 + (zufall(x * 0.7, y * 1.3) - 0.5) * 0.14 + (zufall(Math.floor(x / 3), Math.floor(y / 3)) - 0.5) * 0.1 + (zufall(Math.floor(x / 9), Math.floor(y / 9)) - 0.5) * 0.12; U.set([(r / 4) * j, (g / 4) * j, (b / 4) * j], (y * W + x) * 3); }
    const boden = new THREE.MeshLambertMaterial({ vertexColors: true, map: pinsel(), color: new THREE.Color(1.1, 1.1, 1.1) });
    const wasserMat = new THREE.MeshPhongMaterial({ color: 0x3f8fae, specular: 0x99bbcc, shininess: 60, transparent: true, opacity: 0.85 });
    for (let cy = 0; cy < d.h / C; cy++) for (let cx = 0; cx < d.b / C; cx++) {
      const pos: number[] = [], col: number[] = [], uv: number[] = [], nor: number[] = [], wpos: number[] = [];
      for (let y = cy * C; y < (cy + 1) * C; y++) for (let x = cx * C; x < (cx + 1) * C; x++) {
        const z = this.zeichen(x, y), ecken = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]] as const, scharf = AUFLAGE.has(z);
        const fz = F(z), jit = 1 + (zufall(x * 1.7, y * 0.9) - 0.5) * 0.12;
        const v = ecken.map(([ex, ey]) => { const i = (ey * W + ex) * 3; return { p: [ex, this.hoeheEcke(ex, ey), ey], c: scharf ? [fz.r * jit, fz.g * jit, fz.b * jit] : [U[i], U[i + 1], U[i + 2]] }; });
        /* Diagonale wechselnd, damit Hügel nicht gestreift wirken */
        const tri = (x + y) % 2 ? [[0, 3, 1], [1, 3, 2]] : [[0, 3, 2], [0, 2, 1]];
        for (const t of tri) for (const i of t) { pos.push(...v[i].p); col.push(...v[i].c); uv.push(v[i].p[0] / 7, v[i].p[2] / 7); const ex = v[i].p[0], ey = v[i].p[2], n = new THREE.Vector3(this.hoeheEcke(ex - 1, ey) - this.hoeheEcke(ex + 1, ey), 2, this.hoeheEcke(ex, ey - 1) - this.hoeheEcke(ex, ey + 1)).normalize(); nor.push(n.x, n.y, n.z); }
        if (d.arten[z]?.wasser) { const hw = Math.max(...v.map((q) => q.p[1])) + 0.12; wpos.push(x, hw, y, x, hw, y + 1, x + 1, hw, y + 1, x, hw, y, x + 1, hw, y + 1, x + 1, hw, y); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, boden); m.receiveShadow = true; this.szene.add(m); this.boden.push(m); const obj: THREE.Object3D[] = [m];
      if (wpos.length) { const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3)); wg.computeVertexNormals(); const wm = new THREE.Mesh(wg, wasserMat); wm.receiveShadow = true; this.szene.add(wm); obj.push(wm); }
      this.stuecke.push({ cx, cy, obj });
    }
    void c;
  }

  /* ───────── Bäume, Kleinteile, Gebäude ───────── */
  dinge() {
    const d = this.d, gruppen = new Map<string, { typ: Typ; m: THREE.Matrix4[]; f: THREE.Color[] }>(), bilder = new THREE.TextureLoader(), mat = new Map<string, THREE.SpriteMaterial>();
    const reihen = d.dinge.filter(([t]) => istReihe(d.typen[t]));
    for (const [t, x, y, s] of d.dinge) { const typ = d.typen[t], cx = Math.floor(x / C), cy = Math.floor(y / C), gy = this.hoehe(x, y);
      if (typ.plan && d.bauplaene[typ.id]) { const b = bauen(d.bauplaene[typ.id], x, this.hoehe(x, y - 0.5), y); this.szene.add(b.gruppe); this.bauten.push(b); this.zuStueck(cx, cy, b.gruppe);
        b.gruppe.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } }); continue; }
      const geo = modell(typ);
      if (geo) { let ry = 0;
        if (istBaum(typ)) ry = zufall(x, y) * Math.PI * 2;
        else if (istReihe(typ)) { let best = 99, dx = 1, dy = 0; for (const [, x2, y2] of reihen) { const e = Math.hypot(x2 - x, y2 - y); if (e > 0.1 && e < best) { best = e; dx = x2 - x; dy = y2 - y; } } if (Math.abs(dy) > Math.abs(dx) * 1.2) ry = Math.PI / 2; }
        const k = typ.id + "@" + cx + "_" + cy; if (!gruppen.has(k)) gruppen.set(k, { typ, m: [], f: [] });
        const sk = s * (istBaum(typ) ? 0.9 + zufall(y, x) * 0.2 : 1), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry);
        gruppen.get(k)!.m.push(new THREE.Matrix4().compose(new THREE.Vector3(x, gy - (istBaum(typ) ? 0.1 : 0), y), q, new THREE.Vector3(sk, sk, sk)));
        const h = 0.88 + zufall(x * 3, y * 5) * 0.24; gruppen.get(k)!.f.push(new THREE.Color(h, h, h)); continue; }
      if (/nebel/.test(typ.id)) continue;
      /* Kein Modell: das gemalte Bild als Billboard (Mischform) */
      if (!mat.has(typ.id)) { const tx = bilder.load(BILD + typ.bild); tx.colorSpace = THREE.SRGBColorSpace; mat.set(typ.id, new THREE.SpriteMaterial({ map: tx, alphaTest: 0.2, toneMapped: false })); }
      const sp = new THREE.Sprite(mat.get(typ.id)!), f = (typ.massstab * s) / 48; sp.center.set(typ.anker[0], 1 - typ.anker[1]); sp.scale.set(typ.groesse[0] * f, typ.groesse[1] * f, 1); sp.position.set(x, gy, y); this.szene.add(sp); this.zuStueck(cx, cy, sp); }
    for (const [k, g] of gruppen) { const geo = modell(g.typ)!, im = new THREE.InstancedMesh(geo, MATERIALIEN, g.m.length);
      g.m.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, g.f[i]); }); im.castShadow = true; im.receiveShadow = true; im.computeBoundingSphere(); this.szene.add(im);
      const [cx, cy] = k.split("@")[1].split("_").map(Number); this.zuStueck(cx, cy, im); }
  }
  zuStueck(cx: number, cy: number, o: THREE.Object3D) { const s = this.stuecke.find((q) => q.cx === cx && q.cy === cy); if (s) s.obj.push(o); }
  figuren() { const L = new THREE.TextureLoader();
    /* Dorfbewohner: Bildstreifen mit 8 Bildern zu 176 × 176 – das erste zeigen */
    for (const f of this.d.figuren) { const tx = L.load(BILD + "img/echtzeit/" + f.figur + ".webp", (t) => { const n = Math.max(1, Math.round(t.image.width / t.image.height)); fb.setze(t, [1 / n, 1], [0, 0], [2.25, 2.25], [0.5, 0.06]); }); tx.colorSpace = THREE.SRGBColorSpace;
      const fb = new Figurbild(tx); fb.silhouette(false); fb.gruppe.position.set(f.x, this.hoehe(f.x, f.y) + 0.08, f.y); this.szene.add(fb.gruppe); this.fleck(f.x, f.y); this.zuStueck(Math.floor(f.x / C), Math.floor(f.y / C), fb.gruppe); } }
  fleck(x: number, z: number) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.32, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, this.hoehe(x, z) + 0.05, z); this.szene.add(m); return m; }

  /* ───────── Held ───────── */
  heldBauen() { const L = new THREE.TextureLoader();
    this.stand = L.load(BILD + "img/echtzeit/torvald.webp"); this.lauf = L.load(BILD + "img/echtzeit/torvald-lauf.webp"); for (const t of [this.stand, this.lauf]) t.colorSpace = THREE.SRGBColorSpace;
    this.figur = new Figurbild(this.stand); this.szene.add(this.figur.gruppe); this.schattenFleck = this.fleck(this.held.x, this.held.z);
    this.marke = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffd75e, transparent: true, opacity: 0.85, depthWrite: false })); this.marke.rotation.x = -Math.PI / 2; this.marke.visible = false; this.szene.add(this.marke); }
  frei(x: number, z: number) { const r = 0.28; for (const [dx, dz] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { const gx = Math.floor(x + dx), gz = Math.floor(z + dz); const zl = this.d.geh[gz]; if (!zl || zl[gx] !== ".") return false; } return true; }
  /** A* auf dem Feldraster (8 Richtungen, keine Ecken abschneiden) */
  weg(ax: number, az: number, bx: number, bz: number): { x: number; z: number }[] {
    const B = this.d.b, Hh = this.d.h, ok = (x: number, z: number) => x >= 0 && z >= 0 && x < B && z < Hh && this.d.geh[z][x] === ".";
    let zx = Math.floor(bx), zz = Math.floor(bz);
    if (!ok(zx, zz)) { /* Ziel gesperrt (Baum, Wand): das nächste freie Feld daneben */ let best = 1e9, nx = 0, nz = 0;
      for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) if (ok(zx + dx, zz + dz) && dx * dx + dz * dz < best) { best = dx * dx + dz * dz; nx = zx + dx; nz = zz + dz; }
      if (best === 1e9) return []; zx = nx; zz = nz; bx = nx + 0.5; bz = nz + 0.5; }
    const sx = Math.floor(ax), sz = Math.floor(az), key = (x: number, z: number) => z * B + x, g = new Map<number, number>(), von = new Map<number, number>(), offen: [number, number][] = [];
    const push = (k: number, f: number) => { offen.push([f, k]); let i = offen.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (offen[p][0] <= offen[i][0]) break; [offen[p], offen[i]] = [offen[i], offen[p]]; i = p; } };
    const pop = () => { const top = offen[0], last = offen.pop()!; if (offen.length) { offen[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < offen.length && offen[l][0] < offen[m][0]) m = l; if (r < offen.length && offen[r][0] < offen[m][0]) m = r; if (m === i) break; [offen[m], offen[i]] = [offen[i], offen[m]]; i = m; } } return top; };
    const hh = (x: number, z: number) => { const dx = Math.abs(x - zx), dz = Math.abs(z - zz); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    g.set(key(sx, sz), 0); push(key(sx, sz), hh(sx, sz)); let n = 0, gefunden = false;
    while (offen.length && n++ < 30000) { const [, k] = pop(), x = k % B, z = (k - x) / B; if (x === zx && z === zz) { gefunden = true; break; }
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const nx = x + dx, nz = z + dz; if (!ok(nx, nz)) continue; if (dx && dz && (!ok(x + dx, z) || !ok(x, z + dz))) continue;
        const nk = key(nx, nz), ng = g.get(k)! + (dx && dz ? 1.414 : 1); if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); von.set(nk, k); push(nk, ng + hh(nx, nz)); } } }
    if (!gefunden) return [];
    const p: { x: number; z: number }[] = []; let k = key(zx, zz); while (k !== key(sx, sz)) { const x = k % B; p.unshift({ x: x + 0.5, z: (k - x) / B + 0.5 }); k = von.get(k)!; }
    if (p.length) p[p.length - 1] = { x: bx, z: bz };
    /* glätten: Punkte überspringen, solange die gerade Linie frei ist */
    const glatt: { x: number; z: number }[] = []; let a = { x: ax, z: az }, i = 0;
    while (i < p.length) { let j = p.length - 1; while (j > i && !this.sicht(a, p[j])) j--; glatt.push(p[j]); a = p[j]; i = j + 1; }
    return glatt; }
  sicht(a: { x: number; z: number }, b: { x: number; z: number }) { const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 3); for (let i = 1; i <= n; i++) { const t = i / n; if (!this.frei(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false; } return true; }

  /* ───────── Eingaben ───────── */
  eingaben() {
    const el = this.r.domElement; let zieht = false, bewegt = 0, lx = 0, ly = 0; const finger = new Map<number, { x: number; y: number }>(); let pinch = 0;
    addEventListener("keydown", (e) => { this.tasten[e.key.toLowerCase()] = true; if (e.key.startsWith("Arrow")) e.preventDefault(); });
    addEventListener("keyup", (e) => { this.tasten[e.key.toLowerCase()] = false; });
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    el.addEventListener("pointerdown", (e) => { finger.set(e.pointerId, { x: e.clientX, y: e.clientY }); zieht = true; bewegt = 0; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId);
      if (finger.size === 2) { const [a, b] = [...finger.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
    el.addEventListener("pointermove", (e) => { if (!finger.has(e.pointerId)) return; finger.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (finger.size === 2) { const [a, b] = [...finger.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) this.abstand = Math.max(9, Math.min(60, this.abstand * pinch / d)); pinch = d; bewegt = 99; return; }
      if (!zieht) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; bewegt += Math.abs(dx) + Math.abs(dy);
      const drehen = e.buttons & 2 || e.buttons & 4 || (e.pointerType === "touch" && bewegt > 12); if (drehen) { this.gieren -= dx * 0.006; this.neigen = Math.max(0.42, Math.min(1.35, this.neigen + dy * 0.004)); } });
    const los = (e: PointerEvent) => { finger.delete(e.pointerId); if (finger.size < 2) pinch = 0; if (!zieht) return; zieht = false; if (bewegt < 8 && e.button === 0) this.klick(e.clientX, e.clientY); };
    el.addEventListener("pointerup", los); el.addEventListener("pointercancel", (e) => { finger.delete(e.pointerId); zieht = false; });
    el.addEventListener("wheel", (e) => { e.preventDefault(); this.abstand = Math.max(9, Math.min(60, this.abstand * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
    $("#ez-schatten").onclick = () => { this.r.shadowMap.enabled = !this.r.shadowMap.enabled; this.szene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.needsUpdate = true; }); $("#ez-schatten").textContent = this.r.shadowMap.enabled ? "Schatten: an" : "Schatten: aus"; };
    $("#ez-schatten").textContent = this.r.shadowMap.enabled ? "Schatten: an" : "Schatten: aus";
  }
  klick(px: number, py: number) { const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1), this.kamera);
    const nah = this.boden.filter((m) => m.geometry.boundingSphere!.center.distanceTo(this.ziel) < 90); const t = ray.intersectObjects(nah, false)[0]; if (!t) return;
    this.pfad = this.weg(this.held.x, this.held.z, t.point.x, t.point.z); if (this.pfad.length) { const z = this.pfad[this.pfad.length - 1]; this.marke.position.set(z.x, this.hoehe(z.x, z.z) + 0.06, z.z); this.marke.visible = true; } }

  /* ───────── Bild für Bild ───────── */
  bild() {
    const dt = Math.min(0.05, this.uhr.getDelta()), T = this.tasten, H = this.held;
    /* Kamera drehen (Pfeiltasten / Q, E) */
    if (T["arrowleft"] || T["q"]) this.gieren += dt * 1.8; if (T["arrowright"] || T["e"]) this.gieren -= dt * 1.8;
    if (T["arrowup"]) this.neigen = Math.min(1.35, this.neigen + dt * 0.9); if (T["arrowdown"]) this.neigen = Math.max(0.42, this.neigen - dt * 0.9);
    /* Laufen: WASD relativ zur Kamera, sonst dem Weg nach */
    let rx = 0, rz = 0; const vx = -Math.sin(this.gieren), vz = -Math.cos(this.gieren);
    if (T["w"]) { rx += vx; rz += vz; } if (T["s"]) { rx -= vx; rz -= vz; } if (T["a"]) { rx += vz; rz -= vx; } if (T["d"]) { rx -= vz; rz += vx; }
    if (rx || rz) { this.pfad = []; this.marke.visible = false; }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z.x - H.x, dz = z.z - H.z, l = Math.hypot(dx, dz); if (l < 0.15) { this.pfad.shift(); if (!this.pfad.length) this.marke.visible = false; } else { rx = dx / l; rz = dz / l; } }
    const l = Math.hypot(rx, rz), laeuft = l > 0.01;
    if (laeuft) { const v = 4.6 * dt / l, nx = H.x + rx * v, nz = H.z + rz * v;
      if (this.frei(nx, nz)) { H.x = nx; H.z = nz; } else if (this.frei(nx, H.z)) H.x = nx; else if (this.frei(H.x, nz)) H.z = nz; else if (this.pfad.length) this.pfad.shift();
      /* Blickrichtung auf dem Bildschirm: rechts oder links der Kamera */ const rechts = rx * Math.cos(this.gieren) - rz * Math.sin(this.gieren); if (Math.abs(rechts) > 0.2) H.blick = rechts > 0 ? 1 : -1; H.lauf += dt; }
    /* Figur: Stand- oder Laufbild (8 Bilder), gespiegelt nach Blickrichtung */
    const y = this.hoehe(H.x, H.z), fig = this.figur;
    if (laeuft) { const n = Math.floor(H.lauf * 11) % 8, h = 2.05 / 0.855; fig.setze(this.lauf, [H.blick / 4, 1 / 2], [(n % 4 + (H.blick < 0 ? 1 : 0)) / 4, n < 4 ? 0.5 : 0], [h, h], [0.5, 1 - 0.946]); }
    else { const t = this.stand, w = t.image ? t.image.width / t.image.height : 0.7; fig.setze(t, [H.blick, 1], [H.blick < 0 ? 1 : 0, 0], [2.05 * 1.065 * w, 2.05 * 1.065], [0.5, 0.06]); H.lauf = 0; }
    fig.gruppe.position.set(H.x, y + 0.08, H.z); this.schattenFleck.position.set(H.x, y + 0.05, H.z);
    /* Kamera folgt */
    this.ziel.lerp(new THREE.Vector3(H.x, y + 1.1, H.z), this.ziel.lengthSq() ? 0.18 : 1);
    const cp = Math.cos(this.neigen), sp = Math.sin(this.neigen); this.kamera.position.set(this.ziel.x + Math.sin(this.gieren) * cp * this.abstand, this.ziel.y + sp * this.abstand, this.ziel.z + Math.cos(this.gieren) * cp * this.abstand); this.kamera.lookAt(this.ziel);
    (this.szene.fog as THREE.Fog).near = 30 + this.abstand * 1.6; (this.szene.fog as THREE.Fog).far = 80 + this.abstand * 2.6;
    this.licht.position.set(this.ziel.x - 30, this.ziel.y + 55, this.ziel.z + 22); this.licht.target.position.copy(this.ziel);
    /* nur Chunks in Sichtweite zeichnen */
    const weit = (100 + this.abstand * 2.6) / C + 0.8; for (const s of this.stuecke) { const an = Math.hypot(s.cx + 0.5 - this.ziel.x / C, s.cy + 0.5 - this.ziel.z / C) < weit; for (const o of s.obj) o.visible = an; }
    /* Gebäude: drinnen kein Dach, Türen öffnen sich in der Nähe, Mühlenflügel drehen sich */
    for (const b of this.bauten) { const drin = b.raeume.some((r) => H.x > r.x0 && H.x < r.x1 && H.z > r.z0 && H.z < r.z1);
      for (const d of b.daecher) d.visible = !drin;
      for (const t of b.tueren) { const soll = Math.hypot(H.x - t.x, H.z - t.z) < 2.2 ? t.auf : t.zu; t.fluegel.rotation.y += (soll - t.fluegel.rotation.y) * 0.18; }
      for (const f of b.drehen) f.rotation.z -= dt * 0.6; }
    this.marke.rotation.z += dt;
    this.r.render(this.szene, this.kamera);
    /* Anzeige: Gebiet und Bildrate */
    const g = this.d.gebiete.find((q) => H.x >= q.x && H.x < q.x + q.b && H.z >= q.y && H.z < q.y + q.h); if (g && g.id !== this.gebiet) { this.gebiet = g.id; $("#ez-ort b").textContent = g.name; $("#ez-ort small").textContent = g.untertitel; }
    this.fps.push(dt); if (this.fps.length >= 30) { const f = this.fps.length / this.fps.reduce((a, b) => a + b, 0); $("#ez-fps").textContent = Math.round(f) + " FPS · " + this.r.info.render.calls + " Aufrufe"; this.fps = []; }
  }
}

new Welt3D().start().catch((e) => { $("#ez-lade").textContent = "Fehler: " + (e && e.message ? e.message : e); console.error(e); });
