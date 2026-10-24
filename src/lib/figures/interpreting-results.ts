// Figures for the lesson "Interpreting simulation results"
// (interpreting-results.mdx), computed at build time from the tested
// Gillespie code in src/lib/simulations/gillespie.ts with fixed seeds.

import type { FigureSpec } from './types';
import { birthDeath, birthDeathExtinction, birthDeathMean, gillespie } from '../simulations/gillespie';
import { createRng } from '../simulations/rng';

export const figures: Record<string, () => FigureSpec> = {
  'interpreting-results-replicates': () => {
    const b = 1;
    const d = 0.8;
    const N0 = 5;
    const T = 4;
    const n = 40;
    const all = Array.from({ length: n }, (_, r) => gillespie(birthDeath(b, d), [N0], T, createRng(101 + r)));
    // Surviving replicates first, so that the extinct ones are drawn on top.
    const paths = [...all.filter((p) => p.x[p.x.length - 1][0] > 0), ...all.filter((p) => p.x[p.x.length - 1][0] === 0)];
    const finals = paths.map((p) => p.x[p.x.length - 1][0]);
    const extinct = finals.filter((v) => v === 0).length;
    const times = Array.from({ length: 41 }, (_, i) => i / 10);
    return {
      title: `The expected population more than doubles, yet ${extinct} of ${n} replicate populations die out`,
      subtitle: `Linear birth–death process, b = ${b}, d = ${d} per individual per year, N₀ = ${N0}; ${n} replicates with seeds 101–${100 + n}`,
      xLabel: 'Time (years)',
      yUnit: 'Population size N (individuals)',
      series: [
        ...paths.map((p, k) => ({
          id: `r${k}`,
          label: `Replicate ${k + 1}`,
          kind: 'member' as const,
          family: 'terracotta' as const,
          grey: finals[k] > 0,
          points: p.t.flatMap((t, i) => {
            const next = i + 1 < p.t.length ? p.t[i + 1] : T;
            return [[t, p.x[i][0]], [next, p.x[i][0]]] as [number, number][];
          }),
        })),
        { id: 'mean', label: 'Expected size', family: 'ochre', dashed: true, points: times.map((t) => [t, birthDeathMean(N0, t, b, d)] as [number, number]) },
      ],
      y: { includeZero: true },
      footer: `Computed with gillespie and birthDeathMean (src/lib/simulations/gillespie.ts). Grey: replicates alive at year ${T}; terracotta: replicates extinct by then. Exact probability of extinction by year ${T}: ${birthDeathExtinction(N0, T, b, d).toFixed(3)}.`,
    };
  },
};
