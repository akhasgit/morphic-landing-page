// <DotField> engine (§8): CPU physics over typed arrays, rendered with raw WebGL2
// (one gl.POINTS draw call) or a Canvas 2D sprite fallback at 60% density.
// Size and color are derived in the vertex shader from each dot's displacement
// (m = |p − home|), so the only per-frame upload is positions.

import { dotField, dotThemes, type DotFieldConfig, type DotTheme } from "./config";
import { sampleMask, type ShapeMask } from "./shapes";

export type FormationLayout = (w: number, h: number, aspect: number) => { cx: number; cy: number; height: number };
export type IntroKind = "none" | "logo-burst" | "scatter";
export type Rect = { x: number; y: number; w: number; h: number };

export interface EngineOptions {
  theme: DotTheme;
  reducedMotion: boolean;
  touch: boolean;
  halo?: HTMLElement | null;
  config?: DotFieldConfig;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const easeOutBack = (x: number) => {
  const c1 = 1.25;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

// Deterministic per-index hash so rebuilds look the same.
const hash = (i: number) => {
  let x = (i + 1) * 374761393;
  x = (x ^ (x >>> 13)) * 1274126177;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
};

interface Renderer {
  readonly kind: "webgl2" | "canvas2d";
  setStatic(e: DotFieldEngine): void;
  draw(e: DotFieldEngine, timeSec: number): void;
  destroy(): void;
}

export class DotFieldEngine {
  readonly canvas: HTMLCanvasElement;
  cfg: DotFieldConfig;
  theme: DotTheme;
  reducedMotion: boolean;
  touch: boolean;
  halo: HTMLElement | null;

  W = 0;
  H = 0;
  dpr = 1;
  N = 0;
  pos = new Float32Array(0);
  vel = new Float32Array(0);
  home = new Float32Array(0);
  depth = new Float32Array(0);
  seed = new Float32Array(0);
  alpha = new Float32Array(0);
  kind = new Float32Array(0);
  sizeVar = new Float32Array(0);
  private start = new Float32Array(0);
  private delay = new Float32Array(0);

  private formation: { mask: ShapeMask; layout: FormationLayout } | null = null;
  formationCenter = { x: 0, y: 0 };
  private textSafe: Rect[] = [];

  private cursor = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, lastMove: -1e9, inside: false };
  private ghost = { x: 0, y: 0, on: false };
  private power = 0;
  private shocks: { x: number; y: number; age: number; strength: number }[] = [];
  breathTarget = 0;
  breath = 0;
  private intro: { kind: IntroKind; t0: number; speed: number } | null = null;
  private pendingIntro: { kind: IntroKind; mask?: ShapeMask } | null = null;

  private renderer: Renderer;
  private raf = 0;
  private lastT = 0;
  private running = false;
  private densityScale = 1;
  private frameTimes: number[] = [];
  private frames = 0;
  private downgrades = 0;
  private onLost = (e: Event) => {
    e.preventDefault();
    this.stop();
  };
  private onRestored = () => {
    this.renderer = this.createRenderer();
    this.renderer.setStatic(this);
    this.renderOnce();
  };

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions) {
    this.canvas = canvas;
    this.cfg = opts.config ?? dotField;
    this.theme = opts.theme;
    this.reducedMotion = opts.reducedMotion;
    this.touch = opts.touch;
    this.halo = opts.halo ?? null;
    this.renderer = this.createRenderer();
    canvas.addEventListener("webglcontextlost", this.onLost);
    canvas.addEventListener("webglcontextrestored", this.onRestored);
  }

  get rendererKind() {
    return this.renderer.kind;
  }

  private createRenderer(): Renderer {
    try {
      return new GLRenderer(this.canvas);
    } catch {
      return new Canvas2DRenderer(this.canvas);
    }
  }

  // ───────────────────────── Setup ─────────────────────────

  resize(w: number, h: number, dpr: number) {
    this.W = Math.max(1, w);
    this.H = Math.max(1, h);
    this.dpr = Math.min(dpr, 2);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.build();
  }

  setFormation(mask: ShapeMask | null, layout?: FormationLayout) {
    this.formation = mask && layout ? { mask, layout } : null;
    if (this.W > 1) this.build();
  }

  /** Rects (canvas coordinates) where dots drop to textSafeOpacity so headlines stay crisp. */
  setTextSafe(rects: Rect[]) {
    this.textSafe = rects;
    if (this.N) {
      this.computeAlpha();
      this.renderer.setStatic(this);
      if (!this.running) this.renderOnce();
    }
  }

  setTheme(theme: DotTheme) {
    this.theme = theme;
    if (!this.running) this.renderOnce();
  }

  build() {
    const { W, H, cfg } = this;
    const base = W < 640 ? cfg.spacing.mobile : W < 1024 ? cfg.spacing.tablet : cfg.spacing.desktop;
    const s = base * this.densityScale * (this.renderer.kind === "canvas2d" ? 1.29 : 1); // fallback: 60% density
    const cols = Math.floor(W / s) + 2;
    const rows = Math.floor(H / s) + 2;
    const ox = (W - (cols - 1) * s) / 2;
    const oy = (H - (rows - 1) * s) / 2;

    // Formation placement (logo on the final tile, "404"…)
    let f: { x0: number; y0: number; fw: number; fh: number; mask: ShapeMask } | null = null;
    if (this.formation) {
      const { mask, layout } = this.formation;
      const L = layout(W, H, mask.aspect);
      const fw = L.height * mask.aspect;
      f = { x0: L.cx - fw / 2, y0: L.cy - L.height / 2, fw, fh: L.height, mask };
      this.formationCenter = { x: L.cx, y: L.cy };
    }
    const inForm = (x: number, y: number, pad: number) => {
      if (!f) return false;
      for (const [dx, dy] of [
        [0, 0],
        [pad, 0],
        [-pad, 0],
        [0, pad],
        [0, -pad],
      ]) {
        if (sampleMask(f.mask, (x + dx - f.x0) / f.fw, (y + dy - f.y0) / f.fh) > 70) return true;
      }
      return false;
    };

    const hx: number[] = [];
    const hy: number[] = [];
    const kd: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * s;
        const y = oy + r * s;
        if (inForm(x, y, 5)) continue; // keep the shape clean
        hx.push(x);
        hy.push(y);
        kd.push(0);
      }
    }
    if (f) {
      const step = cfg.formationStep;
      for (let y = f.y0 + step / 2; y < f.y0 + f.fh; y += step) {
        for (let x = f.x0 + step / 2; x < f.x0 + f.fw; x += step) {
          if (sampleMask(f.mask, (x - f.x0) / f.fw, (y - f.y0) / f.fh) > 128) {
            const i = hx.length;
            hx.push(x + (hash(i * 3) - 0.5) * 1.2);
            hy.push(y + (hash(i * 7) - 0.5) * 1.2);
            kd.push(1);
          }
        }
      }
    }

    const N = hx.length;
    this.N = N;
    this.pos = new Float32Array(N * 2);
    this.vel = new Float32Array(N * 2);
    this.home = new Float32Array(N * 2);
    this.depth = new Float32Array(N);
    this.seed = new Float32Array(N);
    this.alpha = new Float32Array(N);
    this.kind = new Float32Array(N);
    this.sizeVar = new Float32Array(N);
    const layers = cfg.depthLayers;
    for (let i = 0; i < N; i++) {
      this.home[i * 2] = this.pos[i * 2] = hx[i];
      this.home[i * 2 + 1] = this.pos[i * 2 + 1] = hy[i];
      this.depth[i] = layers[Math.floor(hash(i) * layers.length) % layers.length];
      this.seed[i] = hash(i + 7919) * Math.PI * 2;
      this.sizeVar[i] = 0.9 + hash(i + 104729) * 0.2; // ±10%
      this.kind[i] = kd[i];
    }
    this.computeAlpha();
    this.renderer.setStatic(this);

    if (this.pendingIntro) {
      const p = this.pendingIntro;
      this.pendingIntro = null;
      this.beginIntro(p.kind, p.mask);
    } else if (!this.running) {
      this.renderOnce();
    }
  }

  private computeAlpha() {
    const { W, H, N, home, kind } = this;
    const safe = this.cfg.textSafeOpacity;
    for (let i = 0; i < N; i++) {
      const x = home[i * 2];
      const y = home[i * 2 + 1];
      const nx = (x - W / 2) / (W / 2);
      const ny = (y - H / 2) / (H / 2);
      const d = Math.sqrt(nx * nx * 0.8 + ny * ny * 0.9);
      let a = kind[i] ? 1 : 1 - smoothstep(0.62, 1.22, d) * 0.92;
      // Formation dots (the M) dim less behind text so the shape still reads.
      const s = kind[i] ? Math.max(safe, 0.55) : safe;
      for (const r of this.textSafe) {
        const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
        const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
        const f = smoothstep(0, 56, Math.hypot(dx, dy));
        a *= s + (1 - s) * f;
      }
      this.alpha[i] = a;
    }
  }

  // ───────────────────────── Intro ─────────────────────────

  /**
   * logo-burst: every dot starts packed inside `mask` at the center, holds 300ms, then
   * bursts to its grid home, staggered by distance (≤1.8s total).
   * scatter: dots start strewn across the field and reassemble (404).
   */
  playIntro(kind: IntroKind, mask?: ShapeMask) {
    if (this.reducedMotion || kind === "none") return;
    if (!this.N) {
      this.pendingIntro = { kind, mask };
      return;
    }
    this.beginIntro(kind, mask);
  }

  private beginIntro(kind: IntroKind, mask?: ShapeMask) {
    const { N, W, H, home } = this;
    this.start = new Float32Array(N * 2);
    this.delay = new Float32Array(N);
    if (kind === "logo-burst" && mask) {
      const h = Math.min(320, H * 0.42, (W * 0.55) / mask.aspect);
      const w = h * mask.aspect;
      const x0 = W / 2 - w / 2;
      const y0 = H / 2 - h / 2;
      const pts: number[] = [];
      for (let y = 0; y < h; y += 2.2) for (let x = 0; x < w; x += 2.2) if (sampleMask(mask, x / w, y / h) > 140) pts.push(x0 + x, y0 + y);
      const P = pts.length / 2 || 1;
      const maxD = Math.hypot(W / 2, H / 2);
      for (let i = 0; i < N; i++) {
        const k = Math.floor(hash(i * 13 + 5) * P);
        this.start[i * 2] = pts[k * 2] + (hash(i * 17) - 0.5) * 2;
        this.start[i * 2 + 1] = pts[k * 2 + 1] + (hash(i * 19) - 0.5) * 2;
        const d = Math.hypot(home[i * 2] - W / 2, home[i * 2 + 1] - H / 2);
        this.delay[i] = 300 + (d / maxD) * 460 + hash(i * 23) * 60;
      }
    } else {
      for (let i = 0; i < N; i++) {
        this.start[i * 2] = (hash(i * 29) * 1.3 - 0.15) * W;
        this.start[i * 2 + 1] = (hash(i * 31) * 1.3 - 0.15) * H;
        this.delay[i] = hash(i * 37) * 380;
      }
    }
    this.pos.set(this.start);
    this.vel.fill(0);
    this.intro = { kind, t0: performance.now(), speed: 1 };
    this.renderOnce();
  }

  skipIntro() {
    if (this.intro) this.intro.speed = 4;
  }

  get introPlaying() {
    return !!this.intro;
  }

  // ───────────────────────── Input ─────────────────────────

  pointer(x: number, y: number) {
    const c = this.cursor;
    c.x = x;
    c.y = y;
    c.inside = x >= 0 && y >= 0 && x <= this.W && y <= this.H;
    c.lastMove = performance.now();
  }

  pointerLeave() {
    this.cursor.inside = false;
  }

  shockwave(x: number, y: number, strength = 1) {
    if (this.reducedMotion) return;
    if (this.shocks.length > 7) this.shocks.shift();
    this.shocks.push({ x, y, age: 0, strength });
  }

  // ───────────────────────── Loop ─────────────────────────

  setRunning(on: boolean) {
    if (on) this.startLoop();
    else this.stop();
  }

  private startLoop() {
    if (this.running || this.reducedMotion) {
      if (this.reducedMotion) this.renderOnce();
      return;
    }
    this.running = true;
    this.lastT = performance.now();
    const tick = (t: number) => {
      if (!this.running) return;
      const dt = Math.min(t - this.lastT, 50);
      this.lastT = t;
      this.step(dt, t);
      this.renderer.draw(this, t / 1000);
      this.trackPerf(dt);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  renderOnce() {
    this.renderer.draw(this, performance.now() / 1000);
  }

  private trackPerf(dt: number) {
    // Adaptive quality: if frames average >20ms over 30 frames, rebuild with 40% fewer dots.
    this.frames++;
    if (this.frames < 90 || this.downgrades >= 2) return;
    this.frameTimes.push(dt);
    if (this.frameTimes.length > 30) this.frameTimes.shift();
    if (this.frameTimes.length === 30) {
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / 30;
      if (avg > 20) {
        this.downgrades++;
        this.densityScale *= 1.29;
        this.frameTimes = [];
        this.frames = 0;
        this.build();
      }
    }
  }

  private step(dt: number, now: number) {
    const k = dt / 16.667;
    const { N, pos, vel, home, depth, W, H } = this;

    // Breath (final tile CTA hover): eased amplitude, applied in the shader.
    this.breath += (this.breathTarget - this.breath) * Math.min(1, 0.08 * k);

    if (this.intro) {
      const t = (now - this.intro.t0) * this.intro.speed;
      const dur = this.intro.kind === "logo-burst" ? 860 : 1150;
      const ease = this.intro.kind === "logo-burst" ? easeOutBack : easeOutCubic;
      let done = true;
      for (let i = 0; i < N; i++) {
        const local = (t - this.delay[i]) / dur;
        const sx = this.start[i * 2];
        const sy = this.start[i * 2 + 1];
        if (local >= 1) {
          pos[i * 2] = home[i * 2];
          pos[i * 2 + 1] = home[i * 2 + 1];
          continue;
        }
        done = false;
        const e = local <= 0 ? 0 : ease(local);
        pos[i * 2] = sx + (home[i * 2] - sx) * e;
        pos[i * 2 + 1] = sy + (home[i * 2 + 1] - sy) * e;
      }
      if (done) {
        this.intro = null;
        vel.fill(0);
      }
      this.updateHalo();
      return;
    }

    const p = this.cfg.physics;
    const R = this.touch || W < 640 ? p.cursorRadiusMobile : p.cursorRadius;
    const R2 = R * R;
    const wakeR2 = R2 * 2.25;
    const g = this.cfg.ghostCursor;
    const c = this.cursor;

    // Which cursor drives the field: real pointer, ghost (idle / touch), or none.
    const idle = now - c.lastMove > g.idleMs;
    let target = 0;
    let cx = c.x;
    let cy = c.y;
    if (!this.touch && c.inside && !idle) {
      target = 1;
      if (this.ghost.on) {
        // Real pointer takes over instantly; don't read the jump as cursor velocity.
        this.ghost.on = false;
        c.px = c.x;
        c.py = c.y;
        c.vx = c.vy = 0;
      }
    } else if (this.touch || idle) {
      const ts = now / 1000;
      const gx = W * (0.5 + 0.36 * Math.sin(ts * 0.29 + 0.8));
      const gy = H * (0.52 + 0.3 * Math.sin(ts * 0.43));
      if (!this.ghost.on) {
        this.ghost.on = true;
        c.px = gx;
        c.py = gy;
      }
      this.ghost.x = gx;
      this.ghost.y = gy;
      cx = gx;
      cy = gy;
      target = g.strength;
    }
    this.power += (target - this.power) * Math.min(1, 0.07 * k);
    const power = this.power;
    // Cursor velocity (px/frame), smoothed, for the wake term.
    if (c.px > -9000) {
      c.vx += ((cx - c.px) / Math.max(k, 0.01) - c.vx) * 0.5;
      c.vy += ((cy - c.py) / Math.max(k, 0.01) - c.vy) * 0.5;
    }
    c.px = cx;
    c.py = cy;
    const cvx = c.vx;
    const cvy = c.vy;

    // Shockwaves
    const sw = this.cfg.shockwave;
    for (const s of this.shocks) s.age += dt / 1000;
    this.shocks = this.shocks.filter((s) => s.age < sw.life);
    const shocks = this.shocks;
    const shockLive = shocks.length > 0;
    const band = 46;

    const spring = p.spring;
    const damp = Math.pow(p.damping, k);
    const strength = p.strength;
    const wake = p.wake;
    const maxD = p.maxDisplacement;
    const maxD2 = maxD * maxD;
    const cursorOn = power > 0.01;

    for (let i = 0; i < N; i++) {
      const ix = i * 2;
      const iy = ix + 1;
      let x = pos[ix];
      let y = pos[iy];
      let vx = vel[ix];
      let vy = vel[iy];
      const hx = home[ix];
      const hy = home[iy];
      const dxc = x - cx;
      const dyc = y - cy;
      const d2 = dxc * dxc + dyc * dyc;
      const near = cursorOn && d2 < wakeR2;

      // Sleep: at rest, far from the cursor, no shockwave → skip.
      if (!near && !shockLive && vx * vx + vy * vy < 0.0001) {
        const ox = x - hx;
        const oy = y - hy;
        if (ox * ox + oy * oy < 0.0025) continue;
      }

      let ax = (hx - x) * spring;
      let ay = (hy - y) * spring;

      if (cursorOn && d2 < R2) {
        const d = Math.sqrt(d2) || 0.0001;
        const f = 1 - d / R;
        const push = strength * f * f * depth[i] * power;
        ax += (dxc / d) * push;
        ay += (dyc / d) * push;
        ax += cvx * wake * f * power;
        ay += cvy * wake * f * power;
      }

      if (shockLive) {
        for (let s = 0; s < shocks.length; s++) {
          const sh = shocks[s];
          const r = sh.age * sw.speed;
          const sx = x - sh.x;
          const sy = y - sh.y;
          const sd = Math.sqrt(sx * sx + sy * sy) || 0.0001;
          const off = Math.abs(sd - r);
          if (off < band) {
            const imp = sw.strength * sh.strength * (1 - sh.age / sw.life) * (1 - off / band) * 0.32 * depth[i];
            ax += (sx / sd) * imp;
            ay += (sy / sd) * imp;
          }
        }
      }

      vx = (vx + ax * k) * damp;
      vy = (vy + ay * k) * damp;
      x += vx * k;
      y += vy * k;

      const ox = x - hx;
      const oy = y - hy;
      const m2 = ox * ox + oy * oy;
      if (m2 > maxD2) {
        const m = Math.sqrt(m2);
        x = hx + (ox / m) * maxD;
        y = hy + (oy / m) * maxD;
        vx *= 0.6;
        vy *= 0.6;
      }
      pos[ix] = x;
      pos[iy] = y;
      vel[ix] = vx;
      vel[iy] = vy;
    }
    this.updateHalo();
  }

  private updateHalo() {
    const h = this.halo;
    if (!h) return;
    const x = this.ghost.on ? this.ghost.x : this.cursor.x;
    const y = this.ghost.on ? this.ghost.y : this.cursor.y;
    h.style.transform = `translate3d(${x - 120}px, ${y - 120}px, 0)`;
    h.style.opacity = this.intro ? "0" : String(Math.min(1, this.power * 1.4));
  }

  destroy() {
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.renderer.destroy();
  }
}

// ───────────────────────── WebGL2 renderer ─────────────────────────

const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in vec2 aHome;
layout(location=2) in float aDepth;
layout(location=3) in float aSeed;
layout(location=4) in float aAlpha;
layout(location=5) in float aKind;
layout(location=6) in float aSizeVar;
uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uRadius;
uniform vec4 uBase;
uniform vec4 uActive;
uniform vec4 uForm;
uniform float uBreath;
uniform vec2 uBreathCenter;
uniform float uGlow;
uniform float uFormGlow;
uniform float uActiveScale; // <1 while the intro plays so in-flight dots stay light
out vec4 vColor;
out float vSize;
out float vRad;
out float vGlow;
void main() {
  vec2 p = aPos;
  // idle breathing: a tiny wobble so the field is never perfectly still
  p += vec2(sin(uTime * 0.6 + aSeed), cos(uTime * 0.53 + aSeed * 1.7)) * 0.15;
  if (aKind > 0.5 && uBreath > 0.0) {
    vec2 d = aHome - uBreathCenter;
    p += d / max(length(d), 1.0) * uBreath;
  }
  float m = length(aPos - aHome);
  float t = min(m / 24.0, 1.0) * uActiveScale;
  float r = uRadius * aSizeVar * (0.72 + 0.28 * aDepth) * (1.0 + min(m / 18.0, 1.4) * uActiveScale);
  r *= mix(1.0, 1.15, aKind);
  vec4 base = mix(uBase, uForm, aKind);
  vec3 rgb = mix(base.rgb, uActive.rgb, t);
  float a = mix(base.a * aAlpha, uActive.a * mix(aAlpha, 1.0, 0.25), t);
  vColor = vec4(rgb, a);
  float glow = max(uGlow * t, uFormGlow * aKind);
  vGlow = glow;
  float rPx = r * uDpr;
  vRad = rPx;
  float size = (rPx + 1.0) * 2.0 * (1.0 + glow * 1.7);
  vSize = size;
  gl_PointSize = size;
  vec2 clip = (p / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision mediump float;
in vec4 vColor;
in float vSize;
in float vRad;
in float vGlow;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5) * vSize;
  float core = clamp(vRad - d + 0.5, 0.0, 1.0); // 1px antialiased edge
  float halo = vGlow * 0.42 * exp(-pow(max(d - vRad, 0.0) / (vRad * 1.15 + 0.5), 2.0));
  float a = max(core, halo) * vColor.a;
  if (a < 0.003) discard;
  outColor = vec4(vColor.rgb * a, a); // premultiplied
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
  return sh;
}

const rgba = (c: [number, number, number, number]) => [c[0] / 255, c[1] / 255, c[2] / 255, c[3]] as const;

class GLRenderer implements Renderer {
  readonly kind = "webgl2" as const;
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private dyn: WebGLBuffer;
  private stat: WebGLBuffer;
  private u: Record<string, WebGLUniformLocation | null> = {};

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("no webgl2");
    this.gl = gl;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
    this.prog = prog;
    for (const n of ["uRes", "uDpr", "uTime", "uRadius", "uBase", "uActive", "uForm", "uBreath", "uBreathCenter", "uGlow", "uFormGlow", "uActiveScale"]) {
      this.u[n] = gl.getUniformLocation(prog, n);
    }
    this.vao = gl.createVertexArray()!;
    this.dyn = gl.createBuffer()!;
    this.stat = gl.createBuffer()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stat);
    const stride = 7 * 4;
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    for (let a = 2; a <= 6; a++) {
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 1, gl.FLOAT, false, stride, a * 4); // depth, seed, alpha, kind, sizeVar
    }
    gl.bindVertexArray(null);
  }

  setStatic(e: DotFieldEngine) {
    const { gl } = this;
    const data = new Float32Array(e.N * 7);
    for (let i = 0; i < e.N; i++) {
      const o = i * 7;
      data[o] = e.home[i * 2];
      data[o + 1] = e.home[i * 2 + 1];
      data[o + 2] = e.depth[i];
      data[o + 3] = e.seed[i];
      data[o + 4] = e.alpha[i];
      data[o + 5] = e.kind[i];
      data[o + 6] = e.sizeVar[i];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stat);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
    gl.bufferData(gl.ARRAY_BUFFER, e.pos, gl.DYNAMIC_DRAW);
  }

  draw(e: DotFieldEngine, time: number) {
    const { gl, u } = this;
    if (gl.isContextLost()) return;
    const t = dotThemes[e.theme];
    gl.viewport(0, 0, e.canvas.width, e.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!e.N) return;
    gl.useProgram(this.prog);
    gl.enable(gl.BLEND);
    if (t.additive) gl.blendFunc(gl.ONE, gl.ONE);
    else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2f(u.uRes, e.W, e.H);
    gl.uniform1f(u.uDpr, e.dpr);
    gl.uniform1f(u.uTime, e.reducedMotion ? 0 : time);
    gl.uniform1f(u.uRadius, e.cfg.radius);
    gl.uniform4f(u.uBase, ...rgba(t.base));
    gl.uniform4f(u.uActive, ...rgba(t.active));
    gl.uniform4f(u.uForm, ...rgba(t.form));
    // Breath: dots push out 4px and settle on a 1.2s loop.
    const pulse = 0.5 - 0.5 * Math.cos((time * Math.PI * 2) / 1.2);
    gl.uniform1f(u.uBreath, e.breath * 4 * pulse);
    gl.uniform2f(u.uBreathCenter, e.formationCenter.x, e.formationCenter.y);
    gl.uniform1f(u.uGlow, t.glow);
    gl.uniform1f(u.uFormGlow, t.formGlow);
    gl.uniform1f(u.uActiveScale, e.introPlaying ? 0.4 : 1);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dyn);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, e.pos);
    gl.drawArrays(gl.POINTS, 0, e.N);
    gl.bindVertexArray(null);
  }

  destroy() {
    const { gl } = this;
    gl.deleteBuffer(this.dyn);
    gl.deleteBuffer(this.stat);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.prog);
  }
}

// ───────────────────────── Canvas 2D fallback ─────────────────────────

class Canvas2DRenderer implements Renderer {
  readonly kind = "canvas2d" as const;
  private ctx: CanvasRenderingContext2D;
  private sprites: HTMLCanvasElement[] = [];
  private spriteTheme: DotTheme | null = null;
  private static STEPS = 8;
  private static S = 24; // sprite px

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d");
    this.ctx = ctx;
  }

  private buildSprites(theme: DotTheme) {
    const t = dotThemes[theme];
    const S = Canvas2DRenderer.S;
    const mk = (rgb: number[]) => {
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d")!;
      g.fillStyle = `rgb(${rgb.map(Math.round).join(",")})`;
      g.beginPath();
      g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2);
      g.fill();
      return c;
    };
    this.sprites = [];
    for (let s = 0; s < Canvas2DRenderer.STEPS; s++) {
      const k = s / (Canvas2DRenderer.STEPS - 1);
      this.sprites.push(mk([0, 1, 2].map((j) => t.base[j] + (t.active[j] - t.base[j]) * k)));
    }
    this.sprites.push(mk(t.form.slice(0, 3)));
    this.spriteTheme = theme;
  }

  setStatic() {}

  draw(e: DotFieldEngine, time: number) {
    if (this.spriteTheme !== e.theme) this.buildSprites(e.theme);
    const { ctx } = this;
    const t = dotThemes[e.theme];
    ctx.setTransform(e.dpr, 0, 0, e.dpr, 0, 0);
    ctx.clearRect(0, 0, e.W, e.H);
    ctx.globalCompositeOperation = t.additive ? "lighter" : "source-over";
    const { pos, home, alpha, kind, sizeVar, depth, seed } = e;
    const pulse = 0.5 - 0.5 * Math.cos((time * Math.PI * 2) / 1.2);
    const breath = e.breath * 4 * pulse;
    const fc = e.formationCenter;
    const STEPS = Canvas2DRenderer.STEPS;
    for (let i = 0; i < e.N; i++) {
      let x = pos[i * 2];
      let y = pos[i * 2 + 1];
      const hx = home[i * 2];
      const hy = home[i * 2 + 1];
      const m = Math.hypot(x - hx, y - hy);
      const tt = Math.min(m / 24, 1) * (e.introPlaying ? 0.4 : 1);
      if (!e.reducedMotion) {
        x += Math.sin(time * 0.6 + seed[i]) * 0.15;
        y += Math.cos(time * 0.53 + seed[i] * 1.7) * 0.15;
      }
      const isForm = kind[i] > 0.5;
      if (isForm && breath > 0) {
        const dx = hx - fc.x;
        const dy = hy - fc.y;
        const l = Math.max(Math.hypot(dx, dy), 1);
        x += (dx / l) * breath;
        y += (dy / l) * breath;
      }
      const r = e.cfg.radius * sizeVar[i] * (0.72 + 0.28 * depth[i]) * (1 + Math.min(m / 18, 1.4)) * (isForm ? 1.15 : 1);
      const baseA = isForm ? t.form[3] : t.base[3] * alpha[i];
      const a = baseA + (t.active[3] * (alpha[i] + (1 - alpha[i]) * 0.25) - baseA) * tt;
      if (a < 0.01) continue;
      ctx.globalAlpha = Math.min(1, a);
      const sprite = isForm && tt < 0.3 ? this.sprites[STEPS] : this.sprites[Math.round(tt * (STEPS - 1))];
      ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  destroy() {}
}
