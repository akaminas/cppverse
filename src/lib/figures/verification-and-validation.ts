// Figures for the lesson "Verification and validation"
// (verification-and-validation.mdx), computed at build time from the tested
// code in src/lib/simulations/ode.ts and src/lib/simulations/gillespie.ts.

import type { FigureSpec } from './types';
import { integrateFixed, logisticExact, logisticRhs, METHOD_ORDER, type Method } from '../simulations/ode';
import { birthDeath, birthDeathExtinction, gillespie, summarise } from '../simulations/gillespie';
import { createRng } from '../simulations/rng';

export const figures: Record<string, () => FigureSpec> = {
  'verification-and-validation-convergence': () => {
    const p = { r: 0.8, K: 100 };
    const exact = logisticExact(2, 10, p);
    // Largest step last, so that the direct labels sit at the right-hand end.
    const hs = [0.03125, 0.0625, 0.125, 0.25, 0.5, 1];
    const methods: { m: Method; label: string; family: 'terracotta' | 'indigo' | 'teal' }[] = [
      { m: 'euler', label: 'Euler (order 1)', family: 'terracotta' },
      { m: 'heun', label: 'Heun (order 2)', family: 'indigo' },
      { m: 'rk4', label: 'RK4 (order 4)', family: 'teal' },
    ];
    const error = (m: Method, h: number) => Math.abs(integrateFixed(logisticRhs(p), [2], 0, 10, h, m).x.at(-1)![0] - exact);
    const observed = methods.map(({ m }) => Math.log2(error(m, 0.0625) / error(m, 0.03125)));
    return {
      title: 'Halving the step divides the error by about 2, 4 and 16: each method converges at its theoretical order',
      subtitle: 'Absolute error at t = 10 days for logistic growth, r = 0.8 per day, K = 100, N(0) = 2; both axes logarithmic',
      xLabel: 'Step size h (days)',
      yUnit: 'Absolute error at t = 10 days (individuals)',
      series: methods.map(({ m, label, family }) => ({ id: m, label, family, markers: true, points: hs.map((h) => [h, error(m, h)] as [number, number]) })),
      x: { type: 'log', domain: [0.03125, 1], ticks: [0.03125, 0.125, 0.5, 1], format: (v: number) => (v === 1 ? '1' : `1/${Math.round(1 / v)}`) },
      y: { type: 'log' },
      footer:
        'Computed with integrateFixed and logisticExact (src/lib/simulations/ode.ts). Observed orders from the two smallest steps: ' +
        methods.map(({ label }, i) => `${label.split(' ')[0]} ${observed[i].toFixed(2)} (theory ${METHOD_ORDER[methods[i].m]})`).join(', ') +
        '.',
    };
  },

  'verification-and-validation-kendall': () => {
    const b = 1;
    const d = 0.8;
    const N0 = 5;
    const n = 2000;
    const times = Array.from({ length: 21 }, (_, i) => i * 0.4);
    const paths = Array.from({ length: n }, (_, r) => gillespie(birthDeath(b, d), [N0], 8, createRng(20001 + r)));
    const s = summarise(paths, times);
    const exact = times.map((t) => (t === 0 ? 0 : birthDeathExtinction(N0, t, b, d)));
    const z = s.zeroFraction.map((f, i) => (exact[i] > 0 ? (f - exact[i]) / Math.sqrt((exact[i] * (1 - exact[i])) / n) : 0));
    const worst = Math.max(...z.map(Math.abs));
    return {
      title: 'Simulated extinction fractions stay within sampling error of Kendall’s exact curve',
      subtitle: `Linear birth–death process, b = ${b}, d = ${d} per year, N₀ = ${N0}; ${n} Gillespie replicates. Band: exact value ± 1.96 binomial standard errors`,
      xLabel: 'Time (years)',
      yUnit: 'Probability that the population is extinct',
      bands: [
        {
          id: 'band',
          label: '95 % sampling range',
          family: 'teal',
          points: times.map((t, i) => {
            const half = 1.96 * Math.sqrt((exact[i] * (1 - exact[i])) / n);
            return [t, exact[i] - half, exact[i] + half] as [number, number, number];
          }),
        },
      ],
      series: [
        { id: 'exact', label: 'Kendall (exact)', family: 'teal', points: times.map((t, i) => [t, exact[i]] as [number, number]) },
        { id: 'sim', label: 'Simulated fraction', family: 'terracotta', kind: 'points', points: times.map((t, i) => [t, s.zeroFraction[i]] as [number, number]) },
      ],
      references: [{ axis: 'y', value: Math.pow(d / b, N0), label: `eventual extinction, (d/b)⁵ = ${Math.pow(d / b, N0).toFixed(3)}` }],
      y: { domain: [0, 0.4] },
      footer: `Computed with gillespie, summarise and birthDeathExtinction (src/lib/simulations/gillespie.ts), seeds 20001–${20000 + n}. Largest |z| over the ${times.length - 1} time points: ${worst.toFixed(2)}.`,
    };
  },
};
