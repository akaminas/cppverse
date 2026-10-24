// Interactive topographic background for the landing page: a drifting
// height field drawn as glowing white contour lines on black, with heavier
// index contours every fifth level and a faint grid of survey crosses.
// The terrain rises under the pointer, and a click sends a pulse of light
// outwards through the lines. Plain WebGL 1, no dependencies.
//
// Reduced motion: one still frame, no drift, no pulses.

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDpr;
uniform vec3 uMouse;          // x, y in pixels, presence 0..1
uniform vec4 uPulse[4];       // x, y in pixels, age in seconds, strength

const float LINES = 16.0;
const float WIDTH = 1.2;
const float SCALE = 0.7;
const float DETAIL = 0.35;
const float SPEED = 0.12;
const float GRID = 104.0;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
// Gradient noise in [-1, 1].
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    s += a * noise(p);
    p = r * p * 2.03;
    a *= 0.42;
  }
  return s;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float unit = min(uRes.x, uRes.y);
  vec2 p = (frag - 0.5 * uRes) / unit;
  vec2 q = p * (1.55 / SCALE) + vec2(uTime * SPEED, 0.0);

  // Domain warp gives the ridges their folded, organic look.
  vec2 w = vec2(fbm(q + vec2(1.7, 9.2)), fbm(q + vec2(8.3, 2.8)));
  float n = fbm(q + DETAIL * 1.6 * w);

  // The pointer raises a smooth hill.
  vec2 m = (uMouse.xy - 0.5 * uRes) / unit;
  float md = length(p - m);
  float hill = exp(-md * md / 0.045) * uMouse.z;

  // Elevation above sea level: lowland stays empty, peaks gather rings.
  float h = max(n + 0.02, 0.0) * 2.5 + 0.3 * hill;

  float v = h * LINES;
  float aa = max(fwidth(v), 1e-4);
  float d = abs(fract(v - 0.5) - 0.5);
  float minor = 1.0 - smoothstep(0.0, WIDTH * uDpr * aa, d);
  float idx = mod(floor(v + 0.5), 5.0);
  float major = (idx < 0.5) ? (1.0 - smoothstep(0.0, 1.55 * WIDTH * uDpr * aa, d)) : 0.0;
  float land = smoothstep(0.0, 0.035, h);
  minor *= land;
  major *= land;

  // Higher ground reads brighter, as if lit from above.
  float lift = 0.38 + 0.62 * smoothstep(0.0, 0.7, h);
  float glow = 0.5 * hill;

  // Click pulses: a bright ring travelling outwards.
  float pulse = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 pl = uPulse[i];
    if (pl.w <= 0.0) continue;
    float r = pl.z * 0.55;
    float pd = length(p - (pl.xy - 0.5 * uRes) / unit);
    float e = (pd - r) / 0.045;
    float band = exp(-e * e);
    pulse += band * pl.w * exp(-pl.z * 1.1);
  }

  float line = max(minor * 0.62, major);
  float intensity = line * (lift + glow + 1.4 * pulse);

  // Survey crosses on a fixed grid.
  vec2 g = mod(frag / uDpr, GRID) - 0.5 * GRID;
  float arm = 4.5;
  float marks = ((abs(g.x) < 0.55 && abs(g.y) < arm) || (abs(g.y) < 0.55 && abs(g.x) < arm)) ? 0.38 : 0.0;

  float c = clamp(intensity + marks, 0.0, 1.0);
  vec3 col = mix(vec3(0.039, 0.043, 0.051), vec3(1.0), c);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function startTopoField(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(prog, 'uRes'),
    time: gl.getUniformLocation(prog, 'uTime'),
    dpr: gl.getUniformLocation(prog, 'uDpr'),
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    pulse: gl.getUniformLocation(prog, 'uPulse'),
  };

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Pixel density: at most 1.5, and at most about 1.2 megapixels in all, so the
  // shader stays cheap on large screens and on machines without a GPU.
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let last = 0;
  // Pointer state: target and eased position, in canvas pixels (origin bottom-left).
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, z: 0, tz: 0 };
  const pulses: { x: number; y: number; t0: number }[] = [];
  const t0 = performance.now();
  let raf = 0;
  let visible = true;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1.2e6 / Math.max(1, r.width * r.height)));
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (still) draw(performance.now());
  };

  const toCanvas = (e: PointerEvent | MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr, y: (r.bottom - e.clientY) * dpr, inside: e.clientY >= r.top && e.clientY <= r.bottom };
  };
  const onMove = (e: PointerEvent) => {
    const p = toCanvas(e);
    mouse.tx = p.x;
    mouse.ty = p.y;
    mouse.tz = p.inside ? 1 : 0;
    if (mouse.z === 0) {
      mouse.x = p.x;
      mouse.y = p.y;
    }
  };
  const onLeave = () => (mouse.tz = 0);
  const onDown = (e: PointerEvent) => {
    if (still) return;
    const p = toCanvas(e);
    if (!p.inside) return;
    pulses.push({ x: p.x, y: p.y, t0: performance.now() });
    if (pulses.length > 4) pulses.shift();
  };

  const draw = (now: number) => {
    const t = still ? 12 : (now - t0) / 1000;
    const ease = still ? 1 : 0.14;
    mouse.x += (mouse.tx - mouse.x) * ease;
    mouse.y += (mouse.ty - mouse.y) * ease;
    mouse.z += (mouse.tz - mouse.z) * (still ? 1 : 0.09);
    const pu = new Float32Array(16);
    pulses.forEach((p, i) => {
      const age = (now - p.t0) / 1000;
      pu.set([p.x, p.y, age, age < 4 ? 1 : 0], i * 4);
    });
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, t);
    gl.uniform1f(u.dpr, dpr);
    gl.uniform3f(u.mouse, mouse.x, mouse.y, mouse.z);
    gl.uniform4fv(u.pulse, pu);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // About 30 frames a second is plenty for a slow drift.
  const loop = (now: number) => {
    if (visible && now - last >= 32) {
      last = now;
      draw(now);
    }
    raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);
  const onVis = () => (visible = !document.hidden);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVis);
  resize();
  if (still) draw(performance.now());
  else raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVis);
  };
}
