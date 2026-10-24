// Gillespie's direct method (Module 16 destination, Laboratory 4).
//
// A model is a list of events (reactions). Each event has a propensity
// a_j(x) — its rate given the current state — and a state change. The
// direct method repeats:
//   1. a0 = Σ a_j(x). If a0 = 0, no event can ever happen: the process is in
//      an absorbing state and the simulation stops (it is not an error).
//   2. Waiting time τ ~ Exponential(a0).
//   3. Event j chosen with probability a_j / a0 (weighted lottery).
//   4. t ← t + τ; x ← x + ν_j.
// This samples the continuous-time Markov chain exactly; no time step is
// involved.

import { exponential, weightedIndex, type Rng } from './rng.ts';

export interface StochasticEvent {
  name: string;
  propensity: (x: readonly number[]) => number;
  /** Change applied to the state when the event fires. */
  change: readonly number[];
}

export interface StochasticModel {
  variables: readonly string[];
  events: readonly StochasticEvent[];
}

export type StopReason = 'end-time' | 'absorbed' | 'max-events';

export interface Path {
  /** Event times, starting with t0. */
  t: number[];
  /** State after each event (x[0] is the initial state). */
  x: number[][];
  /** Index of the event that produced each state (−1 for the initial state). */
  event: number[];
  stop: StopReason;
}

export function gillespie(model: StochasticModel, x0: readonly number[], tEnd: number, rng: Rng, maxEvents = 1_000_000): Path {
  const t = [0];
  const x = [x0.slice()];
  const event = [-1];
  let tc = 0;
  let xc = x0.slice();
  const a = new Array<number>(model.events.length).fill(0);
  for (let n = 0; n < maxEvents; n++) {
    let a0 = 0;
    for (let j = 0; j < model.events.length; j++) {
      const v = model.events[j].propensity(xc);
      if (v < 0 || !Number.isFinite(v)) throw new RangeError(`invalid propensity ${v} for event ${model.events[j].name}`);
      a[j] = v;
      a0 += v;
    }
    if (a0 === 0) return { t, x, event, stop: 'absorbed' };
    const tau = exponential(rng, a0);
    if (tc + tau > tEnd) return { t, x, event, stop: 'end-time' };
    const j = weightedIndex(rng, a, a0);
    tc += tau;
    const change = model.events[j].change;
    xc = xc.map((v, i) => v + change[i]);
    if (xc.some((v) => v < 0)) throw new RangeError(`event ${model.events[j].name} made a count negative`);
    t.push(tc);
    x.push(xc);
    event.push(j);
  }
  return { t, x, event, stop: 'max-events' };
}

/** State of a path at the given times (piecewise constant, right-continuous). */
export function sampleAt(path: Path, times: readonly number[]): number[][] {
  const out: number[][] = [];
  let k = 0;
  for (const time of times) {
    while (k + 1 < path.t.length && path.t[k + 1] <= time) k++;
    out.push(path.x[k]);
  }
  return out;
}

// ── Models ────────────────────────────────────────────────────────────────

/** Linear birth–death process: birth b N, death d N. */
export function birthDeath(b: number, d: number): StochasticModel {
  return {
    variables: ['N'],
    events: [
      { name: 'birth', propensity: ([N]) => b * N, change: [1] },
      { name: 'death', propensity: ([N]) => d * N, change: [-1] },
    ],
  };
}

/** E[N(t)] for the linear birth–death process. */
export const birthDeathMean = (N0: number, t: number, b: number, d: number) => N0 * Math.exp((b - d) * t);

/**
 * P(N(t) = 0) for the linear birth–death process started from N0
 * (Kendall 1948): p0(t) = [d (e^{(b−d)t} − 1) / (b e^{(b−d)t} − d)]^{N0}, b ≠ d.
 */
export function birthDeathExtinction(N0: number, t: number, b: number, d: number): number {
  if (b === d) return Math.pow((b * t) / (1 + b * t), N0);
  const e = Math.exp((b - d) * t);
  return Math.pow((d * (e - 1)) / (b * e - d), N0);
}

/** Stochastic SIR epidemic in a closed population of size N (counts S, I, R). */
export function sirStochastic(beta: number, gamma: number, N: number): StochasticModel {
  return {
    variables: ['S', 'I', 'R'],
    events: [
      { name: 'infection', propensity: ([S, I]) => (beta * S * I) / N, change: [-1, 1, 0] },
      { name: 'recovery', propensity: ([, I]) => gamma * I, change: [0, -1, 1] },
    ],
  };
}

export interface EnsembleSummary {
  times: number[];
  mean: number[];
  /** Quantile bands per time: [q05, q25, q50, q75, q95]. */
  quantiles: number[][];
  /** Fraction of replicates in which variable `of` is zero at each time. */
  zeroFraction: number[];
}

/** Summaries of one state variable across replicate paths on a time grid. */
export function summarise(paths: readonly Path[], times: readonly number[], of = 0): EnsembleSummary {
  const samples = paths.map((p) => sampleAt(p, times).map((s) => s[of]));
  const mean: number[] = [];
  const quantiles: number[][] = [];
  const zeroFraction: number[] = [];
  const q = (sorted: number[], p: number) => {
    const pos = (sorted.length - 1) * p;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };
  times.forEach((_, i) => {
    const col = samples.map((s) => s[i]).sort((a, b) => a - b);
    mean.push(col.reduce((s, v) => s + v, 0) / col.length);
    quantiles.push([0.05, 0.25, 0.5, 0.75, 0.95].map((p) => q(col, p)));
    zeroFraction.push(col.filter((v) => v === 0).length / col.length);
  });
  return { times: times.slice(), mean, quantiles, zeroFraction };
}
