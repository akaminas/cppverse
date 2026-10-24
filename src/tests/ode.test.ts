import { describe, expect, it } from 'vitest';
import {
  eliminationExact,
  eliminationRhs,
  integrateAdaptive,
  integrateFixed,
  logisticExact,
  logisticRhs,
  sirFinalSusceptible,
  sirRhs,
  type Method,
} from '../lib/simulations/ode.ts';

const logistic = { r: 0.8, K: 100 };
const f = logisticRhs(logistic);
const errorAt = (method: Method, h: number) => {
  const sol = integrateFixed(f, [2], 0, 10, h, method);
  return Math.abs(sol.x.at(-1)![0] - logisticExact(2, 10, logistic));
};

describe('fixed-step integrators on the logistic equation', () => {
  it.each<[Method, number]>([
    ['euler', 1],
    ['heun', 2],
    ['rk4', 4],
  ])('%s converges with order %i', (method, order) => {
    const h = method === 'euler' ? 0.01 : 0.05;
    const ratio = errorAt(method, h) / errorAt(method, h / 2);
    // Halving h divides the global error by 2^order (asymptotically).
    expect(Math.log2(ratio)).toBeGreaterThan(order - 0.15);
    expect(Math.log2(ratio)).toBeLessThan(order + 0.15);
  });
  it('ends exactly at the final time even when h does not divide the interval', () => {
    const sol = integrateFixed(f, [2], 0, 1, 0.3, 'rk4');
    expect(sol.t.at(-1)).toBe(1);
    expect(sol.t.length).toBe(5);
  });
  it('RK4 is far more accurate than Euler for the same number of slope evaluations', () => {
    const euler = errorAt('euler', 0.025); // 400 steps × 1 evaluation
    const rk4 = errorAt('rk4', 0.1); // 100 steps × 4 evaluations
    expect(rk4).toBeLessThan(euler / 100);
  });
});

describe('numerical stability of Euler on exponential elimination', () => {
  const k = 0.5;
  const g = eliminationRhs({ k });
  it('is stable and monotone for h < 1/k', () => {
    const sol = integrateFixed(g, [10], 0, 20, 1.5, 'euler');
    for (let i = 1; i < sol.x.length; i++) expect(sol.x[i][0]).toBeLessThan(sol.x[i - 1][0]);
  });
  it('oscillates in sign for 1/k < h < 2/k although the true solution never changes sign', () => {
    const sol = integrateFixed(g, [10], 0, 20, 3, 'euler');
    expect(sol.x[1][0]).toBeLessThan(0);
    expect(eliminationExact(10, 3, { k })).toBeGreaterThan(0);
  });
  it('diverges for h > 2/k', () => {
    const sol = integrateFixed(g, [10], 0, 40, 5, 'euler');
    expect(Math.abs(sol.x.at(-1)![0])).toBeGreaterThan(10);
  });
});

describe('SIR model', () => {
  const p = { beta: 0.5, gamma: 0.2 };
  const sol = integrateFixed(sirRhs(p), [0.999, 0.001, 0], 0, 400, 0.05, 'rk4');
  it('conserves S + I + R', () => {
    for (const x of sol.x) expect(x[0] + x[1] + x[2]).toBeCloseTo(1, 10);
  });
  it('reaches the analytical final size', () => {
    expect(sol.x.at(-1)![0]).toBeCloseTo(sirFinalSusceptible(0.999, p), 6);
  });
});

describe('adaptive Heun–Euler', () => {
  it('meets the tolerance on the logistic equation and rejects some steps', () => {
    const sol = integrateAdaptive(f, [2], 0, 10, { atol: 1e-7, rtol: 1e-7, h0: 1 });
    expect(sol.t.at(-1)).toBeCloseTo(10, 12);
    expect(Math.abs(sol.x.at(-1)![0] - logisticExact(2, 10, logistic))).toBeLessThan(1e-4);
    expect(sol.rejected).toBeGreaterThan(0);
  });
  it('uses larger steps where the solution is smooth', () => {
    const sol = integrateAdaptive(f, [2], 0, 30, { atol: 1e-6, rtol: 1e-6 });
    const early = sol.h.slice(5, 15).reduce((s, h) => s + h, 0) / 10;
    const late = sol.h.slice(-10).reduce((s, h) => s + h, 0) / 10;
    expect(late).toBeGreaterThan(early * 3);
  });
});
