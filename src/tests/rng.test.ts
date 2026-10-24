import { describe, expect, it } from 'vitest';
import { bernoulli, createRng, exponential, normal, poisson, shuffle, uniformInt, weightedIndex } from '../lib/simulations/rng.ts';

const N = 200_000;
const meanVar = (xs: number[]) => {
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
  return { m, v };
};

describe('seeded generator', () => {
  it('is reproducible for a given seed and differs between seeds', () => {
    const a = createRng(42), b = createRng(42), c = createRng(43);
    const xa = Array.from({ length: 5 }, () => a.next());
    const xb = Array.from({ length: 5 }, () => b.next());
    const xc = Array.from({ length: 5 }, () => c.next());
    expect(xa).toEqual(xb);
    expect(xa).not.toEqual(xc);
  });
  it('produces uniform values in [0, 1) with mean 1/2 and variance 1/12', () => {
    const r = createRng(1);
    const xs = Array.from({ length: N }, () => r.next());
    expect(xs.reduce((a, b) => Math.min(a, b))).toBeGreaterThanOrEqual(0);
    expect(xs.reduce((a, b) => Math.max(a, b))).toBeLessThan(1);
    const { m, v } = meanVar(xs);
    expect(Math.abs(m - 0.5)).toBeLessThan(4 * Math.sqrt(1 / 12 / N));
    expect(Math.abs(v - 1 / 12)).toBeLessThan(0.002);
  });
});

describe('distributions', () => {
  const r = createRng(7);
  it('exponential(rate) has mean 1/rate and variance 1/rate²', () => {
    const rate = 2.5;
    const { m, v } = meanVar(Array.from({ length: N }, () => exponential(r, rate)));
    expect(Math.abs(m - 1 / rate)).toBeLessThan(4 * (1 / rate) / Math.sqrt(N));
    expect(Math.abs(v - 1 / rate ** 2) / (1 / rate ** 2)).toBeLessThan(0.03);
  });
  it('rejects a non-positive exponential rate', () => {
    expect(() => exponential(r, 0)).toThrow();
  });
  it.each([0.7, 4, 25, 180])('poisson(%f) has mean = variance = λ', (lam) => {
    const { m, v } = meanVar(Array.from({ length: N / 2 }, () => poisson(r, lam)));
    expect(Math.abs(m - lam)).toBeLessThan(5 * Math.sqrt(lam / (N / 2)));
    expect(Math.abs(v - lam) / lam).toBeLessThan(0.04);
  });
  it('normal has the requested mean and standard deviation', () => {
    const { m, v } = meanVar(Array.from({ length: N }, () => normal(r, 3, 0.5)));
    expect(Math.abs(m - 3)).toBeLessThan(0.01);
    expect(Math.abs(Math.sqrt(v) - 0.5)).toBeLessThan(0.01);
  });
  it('bernoulli and uniformInt have the right frequencies', () => {
    const hits = Array.from({ length: N }, () => (bernoulli(r, 0.3) ? 1 : 0)).reduce((s, x) => s + x, 0);
    expect(Math.abs(hits / N - 0.3)).toBeLessThan(0.005);
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < N; i++) counts[uniformInt(r, 1, 6) - 1]++;
    for (const c of counts) expect(Math.abs(c / N - 1 / 6)).toBeLessThan(0.006);
  });
  it('weightedIndex selects in proportion to the weights and never picks zero weights', () => {
    const w = [0, 1, 3, 0, 6];
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < N; i++) counts[weightedIndex(r, w)]++;
    expect(counts[0]).toBe(0);
    expect(counts[3]).toBe(0);
    expect(Math.abs(counts[1] / N - 0.1)).toBeLessThan(0.005);
    expect(Math.abs(counts[4] / N - 0.6)).toBeLessThan(0.005);
    expect(weightedIndex(r, [0, 0])).toBe(-1);
  });
  it('shuffle is a permutation', () => {
    const xs = shuffle(r, Array.from({ length: 50 }, (_, i) => i));
    expect([...xs].sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i));
  });
});
