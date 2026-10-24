// Figures for the while-and-jumps lesson: a loop that runs until a
// condition fails. Computed with the tested iterate() helper.
import type { FigureSpec } from './types';
import { iterate } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'while-and-jumps-threshold': () => {
    const lambda = 0.8;
    const N0 = 120;
    const threshold = 10;
    const traj = iterate((N) => lambda * N, N0, 15);
    const tStop = traj.findIndex((N) => N < threshold);
    return {
      title: `The decline first falls below the threshold in generation ${tStop}, where the while loop stops`,
      subtitle: `Geometric decline Nₜ₊₁ = ${lambda} Nₜ from N₀ = ${N0}, threshold ${threshold}; grey points are generations the loop never computes`,
      xLabel: 'Generation t',
      yUnit: 'Population size N (individuals)',
      series: [
        {
          id: 'continued',
          label: 'If the loop went on',
          grey: true,
          markers: true,
          endLabel: false,
          points: traj.slice(tStop).map((N, i) => [tStop + i, N] as [number, number]),
        },
        {
          id: 'simulated',
          label: 'Simulated by the loop',
          family: 'terracotta',
          markers: true,
          points: traj.slice(0, tStop + 1).map((N, t) => [t, N] as [number, number]),
        },
      ],
      references: [{ axis: 'y', value: threshold, label: `threshold ${threshold}` }],
      y: { includeZero: true },
      footer: 'Computed at build time with iterate (src/lib/simulations/discrete.ts), the same recurrence as while_decline.cpp.',
    };
  },
};
