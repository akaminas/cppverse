// Figures for the lesson numerical-error: convergence of Euler, Heun and
// RK4 on the logistic equation, and how the global error of Euler's method
// evolves along a trajectory. Computed at build time from the tested
// integrators in src/lib/simulations/ode.ts.

import type { FigureSpec } from './types';
import { integrateFixed, logisticExact, logisticRhs, type Method } from '../simulations/ode';

const p = { r: 0.8, K: 100 };
const N0 = 2;
const T = 10;
const f = logisticRhs(p);

const globalError = (method: Method, h: number) => Math.abs(integrateFixed(f, [N0], 0, T, h, method).x.at(-1)![0] - logisticExact(N0, T, p));

export const figures: Record<string, () => FigureSpec> = {
  'numerical-error-convergence': () => {
    const hs = Array.from({ length: 15 }, (_, k) => 2 ** (k - 14)); // 2^-14 … 1 day, increasing so that labels sit at h = 1
    const curve = (method: Method, family: 'terracotta' | 'ochre' | 'indigo') => ({
      id: method,
      label: { euler: 'Euler', heun: 'Heun', rk4: 'RK4' }[method],
      family,
      markers: true,
      points: hs.map((h) => [h, globalError(method, h)] as [number, number]),
    });
    // Guide lines of slope 1, 2 and 4, parallel to the data a factor of four
    // below the measured error at h = 1/16 (RK4's guide stops before round-off).
    const guide = (order: number, method: Method) => {
      const h0 = 1 / 16;
      const e0 = globalError(method, h0) / 4;
      const span = order === 4 ? [2 ** -8, 1] : [2 ** -14, 1];
      return {
        id: `slope${order}`,
        label: `slope ${order}`,
        grey: true,
        dashed: true,
        points: span.map((h) => [h, e0 * (h / h0) ** order] as [number, number]),
      };
    };
    return {
      title: 'Halving the step halves the error of Euler, quarters that of Heun and divides that of RK4 by sixteen, until round-off takes over',
      subtitle: 'Global error in N(10) for logistic growth, r = 0.8 per day, K = 100, N(0) = 2; step sizes h = 1, 1/2, …, 1/16 384 days',
      xLabel: 'Step size h (days, log scale)',
      yUnit: 'Absolute error in N(10) (individuals, log scale)',
      series: [curve('euler', 'terracotta'), curve('heun', 'ochre'), curve('rk4', 'indigo'), guide(1, 'euler'), guide(2, 'heun'), guide(4, 'rk4')],
      x: { type: 'log' },
      y: { type: 'log' },
      footer:
        'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts). Dashed grey lines have slopes 1, 2 and 4. Below about 10⁻¹³ the RK4 error is dominated by rounding in double precision.',
    };
  },

  'numerical-error-over-time': () => {
    const run = (h: number) => {
      const s = integrateFixed(f, [N0], 0, 20, h, 'euler');
      return s.t.map((t, i) => [t, Math.abs(s.x[i][0] - logisticExact(N0, t, p))] as [number, number]);
    };
    return {
      title: 'Euler’s error builds up while the population grows fastest and fades as it settles at the carrying capacity',
      subtitle: 'Absolute global error of forward Euler for logistic growth, r = 0.8 per day, K = 100, N(0) = 2',
      xLabel: 'Time (days)',
      yUnit: 'Absolute error |N_Euler(t) − N(t)| (individuals)',
      series: [
        { id: 'h05', label: 'h = 0.5', points: run(0.5), family: 'terracotta' },
        { id: 'h025', label: 'h = 0.25', points: run(0.25), family: 'ochre' },
        { id: 'h0125', label: 'h = 0.125', points: run(0.125), family: 'indigo' },
      ],
      y: { includeZero: true },
      footer: 'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts). The stable equilibrium N = K damps errors made earlier.',
    };
  },
};
