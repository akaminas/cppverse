// Numerical integration of ordinary differential equations (Module 15
// destination, Laboratory 3). The biological model is the right-hand side
// f(t, x); the numerical method is the stepper. Keeping them separate is the
// central design idea of this module.

export type Rhs = (t: number, x: readonly number[]) => number[];

export type Method = 'euler' | 'heun' | 'rk4';

export const METHOD_ORDER: Record<Method, number> = { euler: 1, heun: 2, rk4: 4 };
export const METHOD_STAGES: Record<Method, number> = { euler: 1, heun: 2, rk4: 4 };

const axpy = (x: readonly number[], h: number, k: readonly number[]) => x.map((xi, i) => xi + h * k[i]);

/** Forward Euler: x(t+h) ≈ x + h f(t, x). All components use the same old state. */
export function eulerStep(f: Rhs, t: number, x: readonly number[], h: number): number[] {
  return axpy(x, h, f(t, x));
}

/** Heun's method (explicit trapezoid, second order). */
export function heunStep(f: Rhs, t: number, x: readonly number[], h: number): number[] {
  const a = f(t, x);
  const b = f(t + h, axpy(x, h, a));
  return x.map((xi, i) => xi + (h / 2) * (a[i] + b[i]));
}

/** Classical fourth-order Runge–Kutta. */
export function rk4Step(f: Rhs, t: number, x: readonly number[], h: number): number[] {
  const k1 = f(t, x);
  const k2 = f(t + h / 2, axpy(x, h / 2, k1));
  const k3 = f(t + h / 2, axpy(x, h / 2, k2));
  const k4 = f(t + h, axpy(x, h, k3));
  return x.map((xi, i) => xi + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

export const STEPPERS: Record<Method, typeof eulerStep> = { euler: eulerStep, heun: heunStep, rk4: rk4Step };

export interface Solution {
  t: number[];
  x: number[][];
  /** Right-hand-side evaluations used. */
  evaluations: number;
}

/**
 * Integrate from t0 to t1 with a fixed step h. The final step is shortened
 * so that the solution ends exactly at t1.
 */
export function integrateFixed(f: Rhs, x0: readonly number[], t0: number, t1: number, h: number, method: Method): Solution {
  if (!(h > 0)) throw new RangeError('integrateFixed: step must be positive');
  const step = STEPPERS[method];
  const t = [t0];
  const x = [x0.slice()];
  let tc = t0;
  let xc = x0.slice();
  let evaluations = 0;
  const n = Math.ceil((t1 - t0) / h - 1e-9);
  for (let i = 0; i < n; i++) {
    const hh = Math.min(h, t1 - tc);
    xc = step(f, tc, xc, hh);
    evaluations += METHOD_STAGES[method];
    tc = i === n - 1 ? t1 : tc + hh;
    if (!xc.every(Number.isFinite)) break; // numerical blow-up: stop and report what we have
    t.push(tc);
    x.push(xc);
  }
  return { t, x, evaluations };
}

export interface AdaptiveOptions {
  atol?: number;
  rtol?: number;
  h0?: number;
  hMin?: number;
  hMax?: number;
  safety?: number;
  maxGrow?: number;
  maxShrink?: number;
  maxSteps?: number;
}

export interface AdaptiveSolution extends Solution {
  h: number[];
  accepted: number;
  rejected: number;
}

/**
 * Adaptive integration with the embedded Heun–Euler pair. Both methods
 * share their first slope, so the error estimate costs no extra work:
 *   e_i = (h/2) |b_i − a_i|  (difference between Euler and Heun)
 * scaled per component by atol + rtol |x_i|. A step is accepted when the
 * largest scaled error E ≤ 1, and the solution advances with the
 * higher-order Heun value. The next step is h · clamp(safety / √E,
 * maxShrink, maxGrow), because the local error of Euler scales as h².
 */
export function integrateAdaptive(f: Rhs, x0: readonly number[], t0: number, t1: number, opts: AdaptiveOptions = {}): AdaptiveSolution {
  const { atol = 1e-6, rtol = 1e-6, h0 = 1e-3, hMin = 1e-10, hMax = Infinity, safety = 0.9, maxGrow = 5, maxShrink = 0.1, maxSteps = 200_000 } = opts;
  const t = [t0];
  const x = [x0.slice()];
  const hs: number[] = [];
  let tc = t0;
  let xc = x0.slice();
  let h = Math.min(h0, t1 - t0);
  let accepted = 0;
  let rejected = 0;
  let evaluations = 0;
  while (tc < t1 && accepted + rejected < maxSteps) {
    h = Math.min(h, t1 - tc, hMax);
    const a = f(tc, xc);
    const predictor = axpy(xc, h, a);
    const b = f(tc + h, predictor);
    evaluations += 2;
    let E = 0;
    const heun = xc.map((xi, i) => xi + (h / 2) * (a[i] + b[i]));
    for (let i = 0; i < xc.length; i++) {
      const scale = atol + rtol * Math.max(Math.abs(xc[i]), Math.abs(heun[i]));
      E = Math.max(E, Math.abs((h / 2) * (b[i] - a[i])) / scale);
    }
    const factor = E > 0 ? safety / Math.sqrt(E) : maxGrow;
    if (E <= 1) {
      tc += h;
      xc = heun;
      accepted++;
      t.push(tc);
      x.push(xc);
      hs.push(h);
      h *= Math.min(maxGrow, factor);
    } else {
      rejected++;
      h *= Math.max(maxShrink, factor);
      if (h < hMin) throw new RangeError(`step size underflow at t = ${tc}`);
    }
  }
  return { t, x, h: hs, accepted, rejected, evaluations };
}

// ── Models ────────────────────────────────────────────────────────────────

export interface LogisticParams {
  r: number;
  K: number;
}

export const logisticRhs = ({ r, K }: LogisticParams): Rhs => (_t, [N]) => [r * N * (1 - N / K)];

/** Closed-form logistic solution: N(t) = K N0 e^{rt} / (K + N0 (e^{rt} − 1)). */
export function logisticExact(N0: number, t: number, { r, K }: LogisticParams): number {
  const e = Math.exp(r * t);
  return (K * N0 * e) / (K + N0 * (e - 1));
}

export interface EliminationParams {
  /** First-order elimination rate (per hour), e.g. of a drug from plasma. */
  k: number;
}

export const eliminationRhs = ({ k }: EliminationParams): Rhs => (_t, [C]) => [-k * C];
export const eliminationExact = (C0: number, t: number, { k }: EliminationParams) => C0 * Math.exp(-k * t);

export interface SirParams {
  /** Transmission rate (per day). */
  beta: number;
  /** Recovery rate (per day). */
  gamma: number;
}

/** SIR in proportions: S' = −β S I, I' = β S I − γ I, R' = γ I. */
export const sirRhs = ({ beta, gamma }: SirParams): Rhs => (_t, [S, I]) => [-beta * S * I, beta * S * I - gamma * I, gamma * I];

/**
 * Final-size relation of the SIR model (proportions, R(0) = 0):
 *   ln(S∞ / S0) = R0 (S∞ − 1),  with R0 = β/γ and S0 + I0 = 1.
 * Solved for S∞ ∈ (0, S0) by bisection; used to verify integrators.
 */
export function sirFinalSusceptible(S0: number, { beta, gamma }: SirParams): number {
  const R0 = beta / gamma;
  const g = (s: number) => Math.log(s / S0) - R0 * (s - 1);
  let lo = 1e-12;
  let hi = S0 * (1 - 1e-12);
  // g(lo) < 0 for small s; g(hi) ≈ R0 (1 − S0) > 0 when infection is present.
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
