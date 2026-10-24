// Figures for the lesson runge-kutta: Euler, Heun and RK4 compared at equal
// cost (the same number of right-hand-side evaluations). Computed at build
// time from the tested integrators in src/lib/simulations/ode.ts.

import type { FigureSpec } from './types';
import { METHOD_STAGES, integrateFixed, logisticExact, logisticRhs, type Method } from '../simulations/ode';

const p = { r: 0.8, K: 100 };
const N0 = 2;
const T = 10;
const f = logisticRhs(p);
const label: Record<Method, string> = { euler: 'Euler', heun: 'Heun', rk4: 'RK4' };

/** Fixed-step run that spends `budget` right-hand-side evaluations on [0, T]. */
const runWithBudget = (method: Method, budget: number) => integrateFixed(f, [N0], 0, T, (T * METHOD_STAGES[method]) / budget, method);

export const figures: Record<string, () => FigureSpec> = {
  'runge-kutta-equal-cost': () => {
    const budget = 40;
    const exact = Array.from({ length: 201 }, (_, i) => [i / 20, logisticExact(N0, i / 20, p)] as [number, number]);
    const series = (method: Method) => {
      const s = runWithBudget(method, budget);
      return s.t.map((t, i) => [t, s.x[i][0]] as [number, number]);
    };
    const worst = (method: Method) => {
      const s = runWithBudget(method, budget);
      return Math.max(...s.t.map((t, i) => Math.abs(s.x[i][0] - logisticExact(N0, t, p))));
    };
    return {
      title: 'With the same 40 slope evaluations, RK4 stays within a tenth of an individual of the exact curve while Euler strays by six',
      subtitle: `Logistic growth, r = 0.8 per day, K = 100, N(0) = 2. Euler h = 0.25, Heun h = 0.5, RK4 h = 1 day: ${budget} evaluations each`,
      xLabel: 'Time (days)',
      yUnit: 'Population size N (individuals)',
      series: [
        { id: 'exact', label: 'Exact solution', points: exact, family: 'teal', dashed: true },
        { id: 'euler', label: 'Euler', points: series('euler'), family: 'terracotta' },
        { id: 'heun', label: 'Heun', points: series('heun'), family: 'ochre' },
        { id: 'rk4', label: 'RK4', points: series('rk4'), family: 'indigo', markers: true },
      ],
      y: { includeZero: true },
      footer:
        'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts). Largest deviation from the exact solution: ' +
        (['euler', 'heun', 'rk4'] as Method[]).map((m) => `${label[m]} ${worst(m).toFixed(2)}`).join(', ') +
        ' individuals.',
    };
  },

  'runge-kutta-work-precision': () => {
    const budgets = Array.from({ length: 8 }, (_, j) => 40 * 2 ** j); // 40 … 5120 evaluations
    const exact = logisticExact(N0, T, p);
    const series = (method: Method, family: 'terracotta' | 'ochre' | 'indigo') => ({
      id: method,
      label: label[method],
      family,
      markers: true,
      points: budgets.map((b) => {
        const s = runWithBudget(method, b);
        return [s.evaluations, Math.abs(s.x.at(-1)![0] - exact)] as [number, number];
      }),
    });
    return {
      title: 'Beyond the coarsest budgets, each extra slope evaluation buys far more accuracy with RK4 than with Euler',
      subtitle: 'Absolute error in N(10) for logistic growth (r = 0.8 per day, K = 100, N(0) = 2) against the number of right-hand-side evaluations',
      xLabel: 'Right-hand-side evaluations (log scale)',
      yUnit: 'Absolute error in N(10) (individuals, log scale)',
      series: [series('euler', 'terracotta'), series('heun', 'ochre'), series('rk4', 'indigo')],
      x: { type: 'log' },
      y: { type: 'log' },
      footer: 'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts); budgets from 40 to 5120 evaluations, doubling.',
    };
  },
};
