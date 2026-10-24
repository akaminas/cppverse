// Static scientific figures, computed at build time from the tested model
// code in src/lib/simulations and rendered to SVG with the Vellum chart.
// Every figure states what was computed and from which file.

import type { FigureSpec } from './types';
import { bevertonHoltExact, bevertonHoltStep, hostParasitoidTrajectory, iterate, logisticMapStep } from '../simulations/discrete';
import { eliminationExact, eliminationRhs, integrateFixed, logisticExact, logisticRhs, type Method } from '../simulations/ode';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const figures: Record<string, () => FigureSpec> = {
  'bh-trajectories': () => {
    const M = 40;
    const T = 25;
    const cases = [
      { R0: 3, label: 'R₀ = 3' },
      { R0: 1.8, label: 'R₀ = 1.8' },
      { R0: 0.8, label: 'R₀ = 0.8' },
    ];
    return {
      title: 'Populations settle at (R₀ − 1) M, or decline when R₀ < 1',
      subtitle: 'Beverton–Holt model, N₀ = 5, M = 40; one point per generation',
      xLabel: 'Generation t',
      yUnit: 'Population size N (individuals)',
      series: cases.map((c, i) => ({
        id: `bh${i}`,
        label: c.label,
        points: iterate((N) => bevertonHoltStep(N, { R0: c.R0, M }), 5, T).map((N, t) => [t, N] as [number, number]),
        markers: true,
      })),
      references: [
        { axis: 'y', value: (3 - 1) * M, label: 'K = 80' },
        { axis: 'y', value: (1.8 - 1) * M, label: 'K = 32' },
      ],
      y: { includeZero: true },
      footer: 'Computed at build time with bevertonHoltStep (src/lib/simulations/discrete.ts).',
    };
  },

  'bh-verification': () => {
    const p = { R0: 2.2, M: 40 };
    const sim = iterate((N) => bevertonHoltStep(N, p), 5, 30);
    return {
      title: 'The simulated recurrence lies exactly on its closed-form solution',
      subtitle: 'Beverton–Holt model, R₀ = 2.2, M = 40, N₀ = 5; dots: simulation, line: closed form',
      xLabel: 'Generation t',
      yUnit: 'Population size N (individuals)',
      series: [
        { id: 'exact', label: 'Closed form', points: range(31).map((t) => [t, bevertonHoltExact(5, t, p)] as [number, number]), family: 'teal' },
        { id: 'sim', label: 'Simulation', points: sim.map((N, t) => [t, N] as [number, number]), family: 'terracotta', kind: 'points', endLabel: true },
      ],
      y: { includeZero: true },
      footer: 'Largest absolute difference over 30 generations: ' + Math.max(...sim.map((N, t) => Math.abs(N - bevertonHoltExact(5, t, p)))).toExponential(1) + ' individuals.',
    };
  },

  'logistic-map-regimes': () => {
    const T = 40;
    const cases = [
      { r: 2.8, label: 'r = 2.8' },
      { r: 3.3, label: 'r = 3.3' },
      { r: 3.9, label: 'r = 3.9' },
    ];
    return {
      title: 'The same update rule gives a steady state, a two-cycle or chaos',
      subtitle: 'Discrete logistic map xₜ₊₁ = r xₜ (1 − xₜ), x₀ = 0.2',
      xLabel: 'Generation t',
      yUnit: 'Scaled density x',
      series: cases.map((c, i) => ({
        id: `lm${i}`,
        label: c.label,
        points: iterate((x) => logisticMapStep(x, { r: c.r }), 0.2, T).map((x, t) => [t, x] as [number, number]),
        markers: true,
      })),
      y: { domain: [0, 1] },
      footer: 'Computed at build time with logisticMapStep (src/lib/simulations/discrete.ts).',
    };
  },

  'update-order': () => {
    const p = { r: 1.2, K: 80, a: 0.06, c: 0.8 };
    const T = 80;
    const sim = hostParasitoidTrajectory([20, 2], T, p, 'simultaneous');
    const seq = hostParasitoidTrajectory([20, 2], T, p, 'sequential');
    return {
      title: 'Updating hosts before parasitoids turns persistent cycles into a false equilibrium',
      subtitle: 'Host density in the host–parasitoid model with r = 1.2, K = 80, a = 0.06, c = 0.8',
      xLabel: 'Generation t',
      yUnit: 'Hosts H (per unit area)',
      series: [
        { id: 'sim', label: 'Simultaneous (the model)', points: sim.map((s, t) => [t, s[0]] as [number, number]), family: 'teal' },
        { id: 'seq', label: 'Sequential (a bug)', points: seq.map((s, t) => [t, s[0]] as [number, number]), family: 'terracotta' },
      ],
      y: { includeZero: true },
      footer: 'Computed with hostParasitoidTrajectory (src/lib/simulations/discrete.ts); both runs use identical equations and parameters.',
    };
  },

  'euler-vs-exact': () => {
    const p = { r: 0.8, K: 100 };
    const exact = range(101).map((i) => [i / 10, logisticExact(2, i / 10, p)] as [number, number]);
    const step = (h: number, method: Method) => {
      const s = integrateFixed(logisticRhs(p), [2], 0, 10, h, method);
      return s.t.map((t, i) => [t, s.x[i][0]] as [number, number]);
    };
    return {
      title: 'Euler’s method lags behind the true solution, less so with smaller steps',
      subtitle: 'Logistic growth, r = 0.8 per day, K = 100, N(0) = 2',
      xLabel: 'Time (days)',
      yUnit: 'Population size N (individuals)',
      series: [
        { id: 'exact', label: 'Exact solution', points: exact, family: 'teal' },
        { id: 'e1', label: 'Euler, h = 1', points: step(1, 'euler'), family: 'terracotta', markers: true },
        { id: 'e025', label: 'Euler, h = 0.25', points: step(0.25, 'euler'), family: 'indigo' },
      ],
      y: { includeZero: true },
      footer: 'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts).',
    };
  },

  'euler-stability': () => {
    const k = 0.5;
    const run = (h: number) => {
      const s = integrateFixed(eliminationRhs({ k }), [10], 0, 16, h, 'euler');
      return s.t.map((t, i) => [t, s.x[i][0]] as [number, number]);
    };
    return {
      title: 'Above h = 2/k the Euler solution oscillates and grows although the true concentration decays',
      subtitle: 'First-order elimination dC/dt = −k C with k = 0.5 per hour, C(0) = 10',
      xLabel: 'Time (hours)',
      yUnit: 'Concentration C (mg per litre)',
      series: [
        { id: 'exact', label: 'Exact solution', points: range(161).map((i) => [i / 10, eliminationExact(10, i / 10, { k })] as [number, number]), family: 'teal' },
        { id: 'h1', label: 'h = 1', points: run(1), family: 'indigo', markers: true },
        { id: 'h3', label: 'h = 3', points: run(3), family: 'ochre', markers: true },
        { id: 'h45', label: 'h = 4.5', points: run(4.5), family: 'terracotta', markers: true },
      ],
      references: [{ axis: 'y', value: 0, label: 'C = 0' }],
      footer: 'Computed with integrateFixed (src/lib/simulations/ode.ts). Stability of forward Euler on this equation requires h < 2/k = 4 hours.',
    };
  },
};

