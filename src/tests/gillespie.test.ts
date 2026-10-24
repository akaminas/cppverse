import { describe, expect, it } from 'vitest';
import { createRng } from '../lib/simulations/rng.ts';
import { birthDeath, birthDeathExtinction, birthDeathMean, gillespie, sampleAt, sirStochastic, summarise } from '../lib/simulations/gillespie.ts';
import { sirFinalSusceptible } from '../lib/simulations/ode.ts';

describe('Gillespie direct method', () => {
  it('stops in the absorbing state when the total propensity is zero', () => {
    const path = gillespie(birthDeath(1, 1), [0], 10, createRng(1));
    expect(path.stop).toBe('absorbed');
    expect(path.t).toEqual([0]);
  });
  it('never makes counts negative and records the stopping reason', () => {
    const path = gillespie(birthDeath(0.5, 1), [20], 1000, createRng(2));
    expect(path.stop).toBe('absorbed');
    expect(path.x.every((s) => s[0] >= 0)).toBe(true);
    expect(path.x.at(-1)![0]).toBe(0);
  });
  it('is reproducible for a fixed seed', () => {
    const a = gillespie(birthDeath(1, 0.9), [5], 5, createRng(9));
    const b = gillespie(birthDeath(1, 0.9), [5], 5, createRng(9));
    expect(a).toEqual(b);
  });
  it('reproduces the mean and extinction probability of the linear birth–death process', () => {
    const b = 1;
    const d = 0.8;
    const N0 = 5;
    const T = 4;
    const reps = 4000;
    const rng = createRng(2024);
    const finals = Array.from({ length: reps }, () => sampleAt(gillespie(birthDeath(b, d), [N0], T, rng), [T])[0][0]);
    const mean = finals.reduce((s, x) => s + x, 0) / reps;
    const sd = Math.sqrt(finals.reduce((s, x) => s + (x - mean) ** 2, 0) / (reps - 1));
    expect(Math.abs(mean - birthDeathMean(N0, T, b, d))).toBeLessThan((4 * sd) / Math.sqrt(reps));
    const p0 = birthDeathExtinction(N0, T, b, d);
    const pHat = finals.filter((x) => x === 0).length / reps;
    expect(Math.abs(pHat - p0)).toBeLessThan(4 * Math.sqrt((p0 * (1 - p0)) / reps));
  });
  it('waiting times are exponential with the total rate (pure death from N = 1)', () => {
    const rng = createRng(5);
    const times = Array.from({ length: 20000 }, () => gillespie(birthDeath(0, 2), [1], 100, rng).t[1]);
    const mean = times.reduce((s, x) => s + x, 0) / times.length;
    expect(Math.abs(mean - 0.5)).toBeLessThan((4 * 0.5) / Math.sqrt(times.length));
  });
  it('stochastic SIR major outbreaks approach the deterministic final size for large N', () => {
    const N = 2000;
    const beta = 0.5;
    const gamma = 0.2;
    const rng = createRng(11);
    const finalS: number[] = [];
    for (let r = 0; r < 60; r++) {
      const path = gillespie(sirStochastic(beta, gamma, N), [N - 20, 20, 0], 2000, rng);
      finalS.push(path.x.at(-1)![0] / N);
    }
    const mean = finalS.reduce((s, x) => s + x, 0) / finalS.length;
    expect(Math.abs(mean - sirFinalSusceptible((N - 20) / N, { beta, gamma }))).toBeLessThan(0.01);
  });
  it('summarises replicate paths on a time grid', () => {
    const rng = createRng(3);
    const paths = Array.from({ length: 50 }, () => gillespie(birthDeath(1, 1.2), [5], 10, rng));
    const s = summarise(paths, [0, 5, 10]);
    expect(s.mean[0]).toBe(5);
    expect(s.zeroFraction[2]).toBeGreaterThanOrEqual(s.zeroFraction[1]);
    s.quantiles.forEach((q) => expect([...q].sort((a, b) => a - b)).toEqual(q));
  });
});
