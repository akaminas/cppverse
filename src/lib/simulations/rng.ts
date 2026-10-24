// Seeded pseudo-random numbers for the browser laboratories.
//
// The generator is xoshiro128** (Blackman & Vigna), seeded through
// splitmix32. It is NOT the generator used by the C++ examples
// (std::mt19937_64), and the C++ standard library does not specify the
// algorithms behind its distributions, so the browser and C++ programs are
// never expected to produce identical trajectories from the same seed.
// They are compared through statistical expectations instead
// (docs/SCIENTIFIC_VALIDATION.md).

export interface Rng {
  /** Uniform on [0, 1). */
  next(): number;
  seed: number;
}

function splitmix32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
    return (z ^ (z >>> 16)) >>> 0;
  };
}

export function createRng(seed: number): Rng {
  const sm = splitmix32(seed);
  let a = sm(), b = sm(), c = sm(), d = sm();
  if ((a | b | c | d) === 0) a = 1;
  const rotl = (x: number, k: number) => (x << k) | (x >>> (32 - k));
  return {
    seed,
    next() {
      const result = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0;
      const t = b << 9;
      c ^= a;
      d ^= b;
      b ^= c;
      a ^= d;
      c ^= t;
      d = rotl(d, 11);
      // 32 random bits → [0, 1)
      return result / 4294967296;
    },
  };
}

/** Uniform on (0, 1]: safe for logarithms. */
export const uniformOpen = (rng: Rng) => 1 - rng.next();

export const uniform = (rng: Rng, lo = 0, hi = 1) => lo + (hi - lo) * rng.next();

/** Integer uniform on {lo, …, hi} inclusive. */
export const uniformInt = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng.next() * (hi - lo + 1));

export const bernoulli = (rng: Rng, p: number) => rng.next() < p;

/** Exponential with the given rate (mean 1/rate), by inversion. */
export function exponential(rng: Rng, rate: number): number {
  if (!(rate > 0)) throw new RangeError('exponential: rate must be positive');
  return -Math.log(uniformOpen(rng)) / rate;
}

/** Standard normal by the Box–Muller transform. */
export function normal(rng: Rng, mean = 0, sd = 1): number {
  const u1 = uniformOpen(rng);
  const u2 = rng.next();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const LOG_FACT_CACHE: number[] = [0];
function logFactorial(k: number): number {
  for (let i = LOG_FACT_CACHE.length; i <= k; i++) LOG_FACT_CACHE[i] = LOG_FACT_CACHE[i - 1] + Math.log(i);
  return LOG_FACT_CACHE[k];
}

/**
 * Poisson variate. Inversion by sequential search for small means; for
 * larger means the PTRS transformed-rejection method (Hörmann 1993).
 */
export function poisson(rng: Rng, mean: number): number {
  if (mean < 0) throw new RangeError('poisson: negative mean');
  if (mean === 0) return 0;
  if (mean < 10) {
    let k = 0;
    let p = Math.exp(-mean);
    let cdf = p;
    const u = rng.next();
    while (u > cdf && k < 1000) {
      k++;
      p *= mean / k;
      cdf += p;
    }
    return k;
  }
  const slam = Math.sqrt(mean);
  const loglam = Math.log(mean);
  const b = 0.931 + 2.53 * slam;
  const a = -0.059 + 0.02483 * b;
  const invalpha = 1.1239 + 1.1328 / (b - 3.4);
  const vr = 0.9277 - 3.6224 / (b - 2);
  for (;;) {
    const u = rng.next() - 0.5;
    const v = rng.next();
    const us = 0.5 - Math.abs(u);
    const k = Math.floor(((2 * a) / us + b) * u + mean + 0.43);
    if (us >= 0.07 && v <= vr) return k;
    if (k < 0 || (us < 0.013 && v > us)) continue;
    if (Math.log(v) + Math.log(invalpha) - Math.log(a / (us * us) + b) <= -mean + k * loglam - logFactorial(k)) return k;
  }
}

/** Binomial variate by direct simulation (adequate for the small n used here). */
export function binomial(rng: Rng, n: number, p: number): number {
  let k = 0;
  for (let i = 0; i < n; i++) if (rng.next() < p) k++;
  return k;
}

/**
 * Index i with probability w[i] / Σw (a weighted lottery, as
 * std::discrete_distribution). Returns -1 when all weights are zero.
 */
export function weightedIndex(rng: Rng, weights: readonly number[], total?: number): number {
  const sum = total ?? weights.reduce((s, w) => s + w, 0);
  if (!(sum > 0)) return -1;
  let target = rng.next() * sum;
  for (let i = 0; i < weights.length; i++) {
    target -= weights[i];
    if (target < 0) return i;
  }
  // Floating-point rounding: return the last positive weight.
  for (let i = weights.length - 1; i >= 0; i--) if (weights[i] > 0) return i;
  return -1;
}

/** Fisher–Yates shuffle (in place). */
export function shuffle<T>(rng: Rng, items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
