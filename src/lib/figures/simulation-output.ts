// Figure for the simulation-output lesson: the trajectory that
// cpp-examples/io/bh_trajectory_csv.cpp writes, recomputed with the tested
// TypeScript port of the same update rule.
import type { FigureSpec } from './types';
import { bevertonHoltStep, iterate } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'simulation-output-trajectory': () => {
    const p = { R0: 2.2, M: 40 };
    const N = iterate((n) => bevertonHoltStep(n, p), 5, 30);
    const K = (p.R0 - 1) * p.M;
    return {
      title: 'The trajectory in the file rises from 5 and levels off just below K = 48',
      subtitle: 'Beverton-Holt model, R₀ = 2.2, M = 40, N₀ = 5: the 31 rows of beverton_holt_output.csv',
      xLabel: 'Generation t',
      yUnit: 'Population size N (individuals)',
      series: [
        { id: 'N', label: 'N', points: N.map((n, t) => [t, n] as [number, number]), family: 'teal', markers: true },
      ],
      references: [{ axis: 'y', value: K, label: 'K = 48' }],
      y: { includeZero: true },
      footer: 'Computed at build time with bevertonHoltStep (src/lib/simulations/discrete.ts), the same rule as nextGeneration in bh_trajectory_csv.cpp.',
    };
  },
};
