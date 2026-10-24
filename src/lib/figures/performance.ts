// Closed-form operation counts for neighbour search (performance lesson).
import type { FigureSpec } from './types';

// Population sizes from 100 to 1,000,000 individuals, evenly spaced on a log axis.
const sizes = Array.from({ length: 41 }, (_, i) => Math.pow(10, 2 + i / 10));

export const figures: Record<string, () => FigureSpec> = {
  'performance-pair-scaling': () => {
    // All pairs: every pair i < j is examined once.
    const allPairs = (N: number) => (N * (N - 1)) / 2;
    // Grid with cells of side R holding m individuals on average: each
    // individual inspects the 9 cells around it and examines the half of
    // their occupants with a larger index, about 9 m N / 2 candidate pairs.
    const grid = (N: number, m: number) => (9 * m * N) / 2;
    return {
      title: 'Comparing all pairs grows with N², a spatial grid grows with N',
      subtitle: 'Candidate pairs examined in one neighbour search when density is held constant (the landscape grows with N); grid cells hold m individuals on average',
      xLabel: 'Number of individuals N',
      yUnit: 'Candidate pairs examined per search',
      series: [
        { id: 'all', label: 'All pairs, N(N − 1)/2', points: sizes.map((N) => [N, allPairs(N)] as [number, number]), family: 'terracotta' },
        { id: 'grid4', label: 'Grid, m = 4', points: sizes.map((N) => [N, grid(N, 4)] as [number, number]), family: 'indigo' },
        { id: 'grid1', label: 'Grid, m = 1', points: sizes.map((N) => [N, grid(N, 1)] as [number, number]), family: 'teal' },
      ],
      x: { type: 'log' },
      y: { type: 'log' },
      footer: 'Closed-form counts: N(N − 1)/2 for all pairs and 9mN/2 for a grid of cells at least R wide (src/lib/figures/performance.ts). The program performance_neighbour_grid.cpp checks that both searches find the same pairs.',
    };
  },
};
