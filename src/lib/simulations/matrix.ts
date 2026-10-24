// Matrix population models (Module 14 destination, Laboratory 2).

export type Matrix = number[][];
export type Vector = number[];

/** y = A x. The result is a new vector: the update is simultaneous. */
export function multiply(A: Matrix, x: Vector): Vector {
  const n = A.length;
  if (x.length !== n) throw new RangeError('multiply: dimension mismatch');
  const y = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (A[i].length !== n) throw new RangeError('multiply: matrix is not square');
    for (let j = 0; j < n; j++) y[i] += A[i][j] * x[j];
  }
  return y;
}

export const sum = (x: Vector) => x.reduce((s, v) => s + v, 0);

/** Project n_{t+1} = A n_t for T steps, returning n_0 … n_T. */
export function project(A: Matrix, n0: Vector, T: number): Vector[] {
  const out = [n0.slice()];
  let n = n0.slice();
  for (let t = 0; t < T; t++) {
    n = multiply(A, n);
    out.push(n);
  }
  return out;
}

export interface PowerIterationResult {
  lambda: number;
  /** Stable stage distribution, normalised to sum 1. */
  w: Vector;
  iterations: number;
  converged: boolean;
}

/**
 * Dominant eigenvalue and eigenvector by renormalised iteration
 * (power method). Each step divides by the total so values never overflow
 * or underflow; λ is the total before renormalisation. Converges when the
 * Euclidean change of the normalised vector falls below `tol`. For a
 * primitive non-negative matrix (Perron–Frobenius) this is the asymptotic
 * growth rate and stable structure.
 */
export function powerIteration(A: Matrix, { tol = 1e-10, maxIter = 10_000 } = {}): PowerIterationResult {
  const k = A.length;
  if (k === 0) throw new RangeError('powerIteration: empty matrix');
  let n = new Array<number>(k).fill(1 / k);
  let lambda = 0;
  for (let it = 1; it <= maxIter; it++) {
    const v = multiply(A, n);
    lambda = sum(v);
    if (!(lambda > 0)) throw new RangeError('powerIteration: population vanished (λ = 0)');
    let delta2 = 0;
    for (let i = 0; i < k; i++) {
      v[i] /= lambda;
      delta2 += (v[i] - n[i]) ** 2;
    }
    n = v;
    if (delta2 < tol * tol) return { lambda, w: n, iterations: it, converged: true };
  }
  return { lambda, w: n, iterations: maxIter, converged: false };
}

/** Characteristic polynomial det(λI − A) of a 3×3 matrix, as coefficients of λ³ + c2 λ² + c1 λ + c0. */
export function charPoly3(A: Matrix): [number, number, number] {
  const [[a, b, c], [d, e, f], [g, h, i]] = A;
  const trace = a + e + i;
  const minors = a * e - b * d + (a * i - c * g) + (e * i - f * h);
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  return [-trace, minors, -det];
}

/** Largest real root of λ³ + c2 λ² + c1 λ + c0 by bisection then Newton (verification only). */
export function dominantRootCubic([c2, c1, c0]: [number, number, number]): number {
  const p = (x: number) => ((x + c2) * x + c1) * x + c0;
  const dp = (x: number) => (3 * x + 2 * c2) * x + c1;
  // Upper bound on root magnitude (Cauchy).
  let hi = 1 + Math.max(Math.abs(c2), Math.abs(c1), Math.abs(c0));
  let lo = 0;
  // p(hi) > 0; find a sign change scanning down for the largest root.
  const steps = 4000;
  for (let s = steps; s > 0; s--) {
    const x = (hi * (s - 1)) / steps;
    if (p(x) <= 0) {
      lo = x;
      hi = (hi * s) / steps;
      break;
    }
  }
  let x = (lo + hi) / 2;
  for (let it = 0; it < 60; it++) {
    const mid = (lo + hi) / 2;
    if (p(mid) > 0) hi = mid;
    else lo = mid;
    x = mid;
  }
  for (let it = 0; it < 5; it++) x -= p(x) / dp(x);
  return x;
}

export interface StageParams {
  /** Seedlings produced per flowering plant per year. */
  fecundity: number;
  /** Probability a seedling survives to become a vegetative rosette. */
  seedlingSurvival: number;
  /** Vegetative rosettes that survive and stay vegetative. */
  stasis: number;
  /** Vegetative rosettes that survive and flower next year. */
  flowering: number;
  /** Flowering plants that survive and revert to vegetative. */
  reversion: number;
  /** Flowering plants that survive and flower again. */
  reflowering: number;
}

/**
 * Three-stage perennial plant (seedling, vegetative rosette, flowering
 * plant), a stage-classified (Lefkovitch) model with stasis and reversion:
 *
 *        S          V             F
 *   S [  0          0             fecundity  ]
 *   V [  gS         stasis        reversion  ]
 *   F [  0          flowering     reflowering]
 */
export function stageMatrix(p: StageParams): Matrix {
  return [
    [0, 0, p.fecundity],
    [p.seedlingSurvival, p.stasis, p.reversion],
    [0, p.flowering, p.reflowering],
  ];
}

export const STAGE_LABELS = ['Seedlings', 'Vegetative', 'Flowering'] as const;

/** Survival probabilities out of a stage must not exceed 1. */
export function validateStageParams(p: StageParams): string[] {
  const issues: string[] = [];
  if (p.stasis + p.flowering > 1) issues.push('Vegetative plants: stasis + flowering exceeds 1.');
  if (p.reversion + p.reflowering > 1) issues.push('Flowering plants: reversion + reflowering exceeds 1.');
  for (const [k, v] of Object.entries(p)) if (v < 0) issues.push(`${k} is negative.`);
  if (p.seedlingSurvival > 1) issues.push('Seedling survival exceeds 1.');
  return issues;
}
