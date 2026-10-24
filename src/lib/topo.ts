// Build-time topographic contours for the landing page.
//
// A smooth, seeded scalar field (fractal value noise plus four broad peaks
// in the east, standing for the four modelling destinations) is contoured
// with marching squares. Segments are chained into polylines so the SVG
// stays small. Deterministic: the same seed always yields the same map.

export interface TopoOptions {
  width?: number;
  height?: number;
  cell?: number;
  levels?: number;
  seed?: number;
}

export interface TopoMap {
  width: number;
  height: number;
  /** One SVG path `d` per contour level; index contours every 4th level. */
  paths: { d: string; index: boolean }[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function valueNoise(seed: number, size = 64) {
  const rand = mulberry32(seed);
  const grid = Array.from({ length: size * size }, rand);
  const at = (x: number, y: number) => grid[((y % size) + size) % size * size + (((x % size) + size) % size)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = smooth(x - x0);
    const ty = smooth(y - y0);
    const a = at(x0, y0);
    const b = at(x0 + 1, y0);
    const c = at(x0, y0 + 1);
    const d = at(x0 + 1, y0 + 1);
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
  };
}

export function topoMap({ width = 1600, height = 1000, cell = 11, levels = 15, seed = 1717 }: TopoOptions = {}): TopoMap {
  const noise = valueNoise(seed);
  const field = (x: number, y: number) => {
    const u = x / width;
    const v = y / height;
    let f = 0;
    let amp = 1;
    let freq = 3.2;
    for (let o = 0; o < 4; o++) {
      f += amp * noise(u * freq * 1.6 + o * 11.3, v * freq + o * 7.7);
      amp *= 0.5;
      freq *= 2.03;
    }
    f /= 1.875;
    // Four destinations: broad peaks along the eastern side.
    const peaks = [
      [0.8, 0.22],
      [0.9, 0.42],
      [0.79, 0.64],
      [0.88, 0.84],
    ];
    for (const [px, py] of peaks) {
      const dx = (u - px) * 1.6;
      const dy = v - py;
      f += 0.42 * Math.exp(-(dx * dx + dy * dy) / 0.012);
    }
    // A gentle rise from west to east: foundations lead up to the destinations.
    return f + 0.18 * u;
  };

  const nx = Math.ceil(width / cell) + 1;
  const ny = Math.ceil(height / cell) + 1;
  const values = new Float64Array(nx * ny);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const v = field(i * cell, j * cell);
      values[j * nx + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  const paths: TopoMap['paths'] = [];
  for (let l = 1; l <= levels; l++) {
    const iso = min + ((max - min) * l) / (levels + 1);
    const segs: [number, number, number, number][] = [];
    const lerp = (a: number, b: number) => (iso - a) / (b - a);
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = values[j * nx + i];
        const b = values[j * nx + i + 1];
        const c = values[(j + 1) * nx + i + 1];
        const d = values[(j + 1) * nx + i];
        const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (code === 0 || code === 15) continue;
        const x = i * cell;
        const y = j * cell;
        const top: [number, number] = [x + cell * lerp(a, b), y];
        const right: [number, number] = [x + cell, y + cell * lerp(b, c)];
        const bottom: [number, number] = [x + cell * lerp(d, c), y + cell];
        const left: [number, number] = [x, y + cell * lerp(a, d)];
        const add = (p: [number, number], q: [number, number]) => segs.push([p[0], p[1], q[0], q[1]]);
        switch (code) {
          case 1: case 14: add(left, bottom); break;
          case 2: case 13: add(bottom, right); break;
          case 3: case 12: add(left, right); break;
          case 4: case 11: add(top, right); break;
          case 5: add(left, top); add(bottom, right); break;
          case 6: case 9: add(top, bottom); break;
          case 7: case 8: add(left, top); break;
          case 10: add(left, bottom); add(top, right); break;
        }
      }
    }
    paths.push({ d: chain(segs), index: l % 4 === 0 });
  }
  return { width, height, paths };
}

/** Join segments that share endpoints into polylines and serialise them. */
function chain(segs: [number, number, number, number][]): string {
  const key = (x: number, y: number) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
  const ends = new Map<string, number[]>();
  segs.forEach((s, i) => {
    for (const k of [key(s[0], s[1]), key(s[2], s[3])]) {
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k)!.push(i);
    }
  });
  const used = new Uint8Array(segs.length);
  const parts: string[] = [];
  const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    const line: [number, number][] = [
      [segs[i][0], segs[i][1]],
      [segs[i][2], segs[i][3]],
    ];
    for (const forward of [true, false]) {
      for (;;) {
        const p = forward ? line[line.length - 1] : line[0];
        const next = (ends.get(key(p[0], p[1])) ?? []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const s = segs[next];
        const q: [number, number] = key(s[0], s[1]) === key(p[0], p[1]) ? [s[2], s[3]] : [s[0], s[1]];
        if (forward) line.push(q);
        else line.unshift(q);
      }
    }
    parts.push('M' + line.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L'));
  }
  return parts.join('');
}
