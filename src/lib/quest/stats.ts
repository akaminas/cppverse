// Small statistics used by the trial checks. Everything is plain arrays.

export const mean = (x: readonly number[]) => (x.length ? x.reduce((s, v) => s + v, 0) / x.length : NaN);

export function sd(x: readonly number[]): number {
  if (x.length < 2) return 0;
  const m = mean(x);
  return Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / (x.length - 1));
}

/** Pearson correlation; 0 when either series is constant. */
export function corr(x: readonly number[], y: readonly number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
}

/**
 * Least-squares fit y ≈ a + b·sin(2πt/P) + c·cos(2πt/P) at a fixed period P.
 * Returns the amplitude √(b² + c²), the phase of the maximum (time in [0, P))
 * and the coefficient of determination R².
 */
export function sineFit(t: readonly number[], y: readonly number[], period: number) {
  const n = t.length;
  // Normal equations for [1, s, c].
  let S1 = 0, Ss = 0, Sc = 0, Sss = 0, Scc = 0, Ssc = 0, Sy = 0, Ssy = 0, Scy = 0;
  for (let i = 0; i < n; i++) {
    const w = (2 * Math.PI * t[i]) / period;
    const s = Math.sin(w);
    const c = Math.cos(w);
    S1 += 1; Ss += s; Sc += c; Sss += s * s; Scc += c * c; Ssc += s * c;
    Sy += y[i]; Ssy += s * y[i]; Scy += c * y[i];
  }
  const A = [
    [S1, Ss, Sc],
    [Ss, Sss, Ssc],
    [Sc, Ssc, Scc],
  ];
  const rhs = [Sy, Ssy, Scy];
  const sol = solve3(A, rhs);
  if (!sol) return { amplitude: 0, peak: 0, r2: 0 };
  const [a, b, c] = sol;
  const my = Sy / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const w = (2 * Math.PI * t[i]) / period;
    const f = a + b * Math.sin(w) + c * Math.cos(w);
    ssRes += (y[i] - f) ** 2;
    ssTot += (y[i] - my) ** 2;
  }
  const amplitude = Math.hypot(b, c);
  // b sin w + c cos w = R cos(w − φ) with φ = atan2(b, c): maximum at w = φ.
  const phi = Math.atan2(b, c);
  const peak = (((phi / (2 * Math.PI)) * period) % period + period) % period;
  return { amplitude, peak, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 };
}

/** The best annual-cycle fit over periods from 340 to 390 days (any calendar a student may choose). */
export function annualFit(t: readonly number[], y: readonly number[]) {
  let best = { period: 365, ...sineFit(t, y, 365) };
  for (let p = 340; p <= 390; p += 2) {
    const f = sineFit(t, y, p);
    if (f.r2 > best.r2) best = { period: p, ...f };
  }
  return best;
}

function solve3(A: number[][], b: number[]): number[] | null {
  const m = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(m[r][col]) > Math.abs(m[piv][col])) piv = r;
    if (Math.abs(m[piv][col]) < 1e-12) return null;
    [m[col], m[piv]] = [m[piv], m[col]];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = m[r][col] / m[col][col];
      for (let k = col; k < 4; k++) m[r][k] -= f * m[col][k];
    }
  }
  return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
}

/** Circular distance between two days of a year of length `len`. */
export const dayDistance = (a: number, b: number, len = 365) => {
  const d = Math.abs((((a - b) % len) + len) % len);
  return Math.min(d, len - d);
};
