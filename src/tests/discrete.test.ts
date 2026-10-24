import { describe, expect, it } from 'vitest';
import {
  bevertonHoltExact, bevertonHoltStep, competitionEquilibrium, competitionTrajectory, iterate, logisticMapStep,
} from '../lib/simulations/discrete.ts';

describe('Beverton–Holt', () => {
  const p = { R0: 2.2, M: 40 };
  it('matches its closed-form solution at every generation', () => {
    const traj = iterate((N) => bevertonHoltStep(N, p), 5, 60);
    traj.forEach((N, t) => expect(N).toBeCloseTo(bevertonHoltExact(5, t, p), 10));
  });
  it('approaches K = (R0 − 1) M monotonically from below', () => {
    const traj = iterate((N) => bevertonHoltStep(N, p), 1, 200);
    for (let t = 1; t < traj.length; t++) expect(traj[t]).toBeGreaterThanOrEqual(traj[t - 1]);
    expect(traj.at(-1)!).toBeCloseTo((p.R0 - 1) * p.M, 8);
  });
  it('declines to extinction when R0 < 1', () => {
    const traj = iterate((N) => bevertonHoltStep(N, { R0: 0.8, M: 40 }), 50, 100);
    expect(traj.at(-1)!).toBeLessThan(1e-6);
  });
  it('handles the R0 = 1 limit of the closed form', () => {
    const q = { R0: 1, M: 10 };
    const traj = iterate((N) => bevertonHoltStep(N, q), 4, 30);
    traj.forEach((N, t) => expect(N).toBeCloseTo(bevertonHoltExact(4, t, q), 10));
  });
});

describe('logistic map', () => {
  it('converges to the fixed point 1 − 1/r for 1 < r < 3', () => {
    const traj = iterate((x) => logisticMapStep(x, { r: 2.6 }), 0.1, 500);
    expect(traj.at(-1)!).toBeCloseTo(1 - 1 / 2.6, 10);
  });
  it('shows a two-cycle at r = 3.2', () => {
    const traj = iterate((x) => logisticMapStep(x, { r: 3.2 }), 0.1, 1000);
    const [a, b, c] = traj.slice(-3);
    expect(a).toBeCloseTo(c, 10);
    expect(Math.abs(a - b)).toBeGreaterThan(0.1);
  });
  it('throws if density becomes negative (r > 4 escapes [0, 1])', () => {
    expect(() => iterate((x) => logisticMapStep(x, { r: 4.5 }), 0.5, 10)).toThrow();
  });
});

describe('Leslie–Gower competition and update order', () => {
  const p = { R1: 3, R2: 2.5, a11: 0.02, a12: 0.01, a21: 0.012, a22: 0.02 };
  it('simultaneous updating converges to the analytical interior equilibrium', () => {
    const eq = competitionEquilibrium(p)!;
    const end = competitionTrajectory([10, 10], 2000, p, 'simultaneous').at(-1)!;
    expect(end[0]).toBeCloseTo(eq[0], 6);
    expect(end[1]).toBeCloseTo(eq[1], 6);
  });
  it('sequential updating produces a different trajectory from the same model', () => {
    const sim = competitionTrajectory([10, 10], 20, p, 'simultaneous');
    const seq = competitionTrajectory([10, 10], 20, p, 'sequential');
    expect(sim[1][0]).toBe(seq[1][0]); // the first variable is identical in the first step
    expect(sim[1][1]).not.toBeCloseTo(seq[1][1], 6); // the second already differs
  });
});

import { hostParasitoidEquilibrium, hostParasitoidStep, hostParasitoidTrajectory } from '../lib/simulations/discrete.ts';

describe('host–parasitoid update order', () => {
  const p = { r: 1.2, K: 80, a: 0.06, c: 0.8 };
  const eq = hostParasitoidEquilibrium(p)!;
  it('has an interior fixed point that both update orders leave unchanged', () => {
    const sim = hostParasitoidStep(eq, p, 'simultaneous');
    const seq = hostParasitoidStep(eq, p, 'sequential');
    expect(sim[0]).toBeCloseTo(eq[0], 8);
    expect(sim[1]).toBeCloseTo(eq[1], 8);
    expect(seq[0]).toBeCloseTo(eq[0], 8);
    expect(seq[1]).toBeCloseTo(eq[1], 8);
  });
  it('the correct (simultaneous) model cycles: the fixed point is unstable', () => {
    const tail = hostParasitoidTrajectory([20, 2], 400, p, 'simultaneous').slice(300);
    const hs = tail.map((s) => s[0]);
    expect(Math.max(...hs) - Math.min(...hs)).toBeGreaterThan(20);
  });
  it('the sequential bug converges to the fixed point: a plausible but wrong conclusion', () => {
    const end = hostParasitoidTrajectory([20, 2], 400, p, 'sequential').at(-1)!;
    expect(end[0]).toBeCloseTo(eq[0], 4);
    expect(end[1]).toBeCloseTo(eq[1], 4);
  });
});
