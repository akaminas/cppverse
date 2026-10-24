// Discrete-time population models (Module 14 destination, Laboratory 1).
//
// These are genuinely discrete-time models: the census is taken once per
// generation and the recurrence *is* the model. They are not numerical
// approximations of continuous-time equations.

export interface BevertonHoltParams {
  /** Density-independent growth factor per generation (R0 > 0). */
  R0: number;
  /** Density at which the growth factor is halved. */
  M: number;
}

/** One generation of the Beverton–Holt model: N' = R0 N / (1 + N / M). */
export const bevertonHoltStep = (N: number, { R0, M }: BevertonHoltParams) => (R0 * N) / (1 + N / M);

/** Closed-form solution (verification benchmark). Equilibrium K = (R0 − 1) M. */
export function bevertonHoltExact(N0: number, t: number, { R0, M }: BevertonHoltParams): number {
  if (R0 === 1) return N0 / (1 + (N0 * t) / M);
  const K = (R0 - 1) * M;
  return (K * N0) / (N0 + (K - N0) * Math.pow(R0, -t));
}

export interface LogisticMapParams {
  /** Maximum growth factor r (0 < r ≤ 4 keeps x in [0, 1]). */
  r: number;
}

/** Discrete logistic map on scaled density x ∈ [0, 1]: x' = r x (1 − x). */
export const logisticMapStep = (x: number, { r }: LogisticMapParams) => r * x * (1 - x);

/** Iterate a one-dimensional recurrence, returning N_0 … N_T. */
export function iterate(step: (x: number) => number, x0: number, T: number): number[] {
  const out = [x0];
  let x = x0;
  for (let t = 0; t < T; t++) {
    x = step(x);
    // Densities cannot be negative; a negative value would indicate a broken model.
    if (!(x >= 0)) throw new RangeError(`density became ${x} at generation ${t + 1}`);
    out.push(x);
  }
  return out;
}

// ── Two-species competition and update order ──────────────────────────────

export interface CompetitionParams {
  R1: number;
  R2: number;
  /** a_ij: per-capita effect of species j on species i. */
  a11: number;
  a12: number;
  a21: number;
  a22: number;
}

export type UpdateOrder = 'simultaneous' | 'sequential';

/**
 * Leslie–Gower competition:
 *   N1' = R1 N1 / (1 + a11 N1 + a12 N2)
 *   N2' = R2 N2 / (1 + a21 N1 + a22 N2)
 *
 * 'simultaneous' evaluates both right-hand sides from the same state (the
 * model as written). 'sequential' overwrites N1 first and then computes N2
 * from the *new* N1 — a classic implementation error that silently
 * changes the model.
 */
export function competitionStep(
  [N1, N2]: readonly [number, number],
  p: CompetitionParams,
  order: UpdateOrder = 'simultaneous',
): [number, number] {
  const next1 = (p.R1 * N1) / (1 + p.a11 * N1 + p.a12 * N2);
  const n1ForSecond = order === 'simultaneous' ? N1 : next1;
  const next2 = (p.R2 * N2) / (1 + p.a21 * n1ForSecond + p.a22 * N2);
  return [next1, next2];
}

export function competitionTrajectory(
  start: readonly [number, number],
  T: number,
  p: CompetitionParams,
  order: UpdateOrder = 'simultaneous',
): [number, number][] {
  const out: [number, number][] = [[start[0], start[1]]];
  let s: [number, number] = [start[0], start[1]];
  for (let t = 0; t < T; t++) {
    s = competitionStep(s, p, order);
    out.push(s);
  }
  return out;
}

/**
 * Interior equilibrium of the Leslie–Gower model, if it exists:
 * a11 N1 + a12 N2 = R1 − 1 and a21 N1 + a22 N2 = R2 − 1.
 */
export function competitionEquilibrium(p: CompetitionParams): [number, number] | null {
  const det = p.a11 * p.a22 - p.a12 * p.a21;
  if (det === 0) return null;
  const b1 = p.R1 - 1;
  const b2 = p.R2 - 1;
  const N1 = (b1 * p.a22 - p.a12 * b2) / det;
  const N2 = (p.a11 * b2 - b1 * p.a21) / det;
  return N1 > 0 && N2 > 0 ? [N1, N2] : null;
}

// ── Host–parasitoid dynamics (update-order demonstration) ─────────────────

export interface HostParasitoidParams {
  /** Host intrinsic growth rate per generation. */
  r: number;
  /** Host carrying capacity in the absence of parasitoids. */
  K: number;
  /** Parasitoid searching efficiency. */
  a: number;
  /** Parasitoids emerging per parasitised host. */
  c: number;
}

/**
 * Nicholson–Bailey dynamics with host self-limitation (Beddington, Free &
 * Lawton 1975):
 *   H' = H exp(r (1 − H/K) − a P)
 *   P' = c H (1 − exp(−a P))
 * Both equations use the hosts of the *current* generation. The
 * 'sequential' variant computes P' from H' instead — a bug that leaves the
 * fixed points unchanged but changes their stability.
 */
export function hostParasitoidStep(
  [H, P]: readonly [number, number],
  { r, K, a, c }: HostParasitoidParams,
  order: UpdateOrder = 'simultaneous',
): [number, number] {
  const nextH = H * Math.exp(r * (1 - H / K) - a * P);
  const hostsAttacked = order === 'simultaneous' ? H : nextH;
  const nextP = c * hostsAttacked * (1 - Math.exp(-a * P));
  return [nextH, nextP];
}

export function hostParasitoidTrajectory(
  start: readonly [number, number],
  T: number,
  p: HostParasitoidParams,
  order: UpdateOrder = 'simultaneous',
): [number, number][] {
  const out: [number, number][] = [[start[0], start[1]]];
  let s: [number, number] = [start[0], start[1]];
  for (let t = 0; t < T; t++) {
    s = hostParasitoidStep(s, p, order);
    out.push(s);
  }
  return out;
}

/**
 * Interior fixed point: r (1 − H/K) = a P and P = c H (1 − e^{−aP}).
 * Substituting H = K (1 − aP/r) leaves one equation in P, solved by bisection.
 */
export function hostParasitoidEquilibrium({ r, K, a, c }: HostParasitoidParams): [number, number] | null {
  const g = (P: number) => c * K * (1 - (a * P) / r) * (1 - Math.exp(-a * P)) - P;
  let lo = 1e-9;
  let hi = r / a - 1e-9; // H > 0 requires P < r / a
  if (g(lo) <= 0 || g(hi) >= 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid) > 0) lo = mid;
    else hi = mid;
  }
  const P = (lo + hi) / 2;
  return [K * (1 - (a * P) / r), P];
}
