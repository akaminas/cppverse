// Figures for the for-loops lesson: repeating one update rule produces a
// trajectory. Computed with the tested iterate() helper.
import type { FigureSpec } from './types';
import { iterate } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'for-loops-geometric': () => {
    const N0 = 20;
    const T = 15;
    const cases = [
      { lambda: 1.2, label: 'λ = 1.2', family: 'teal' as const },
      { lambda: 1.0, label: 'λ = 1.0', family: 'indigo' as const },
      { lambda: 0.8, label: 'λ = 0.8', family: 'terracotta' as const },
    ];
    return {
      title: 'Repeating one update rule produces growth, stasis or decline, depending on λ',
      subtitle: `Geometric growth Nₜ₊₁ = λ Nₜ from N₀ = ${N0}; one point per pass of the loop`,
      xLabel: 'Generation t',
      yUnit: 'Population size N (individuals)',
      series: cases.map((c) => ({
        id: `geo-${c.lambda}`,
        label: c.label,
        family: c.family,
        markers: true,
        points: iterate((N) => c.lambda * N, N0, T).map((N, t) => [t, N] as [number, number]),
      })),
      y: { includeZero: true },
      footer: 'Computed at build time with iterate (src/lib/simulations/discrete.ts), the same recurrence as for_geometric_growth.cpp.',
    };
  },
};
