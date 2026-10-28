// Figures for the lesson "Designing simulation experiments"
// (simulation-experiments.mdx). Lines are Kendall's exact extinction
// probability; dots are Gillespie estimates at the design points of a 3 × 3
// factorial design, computed at build time with one fixed seed per replicate.

import type { FigureSpec } from './types';
import { birthDeath, birthDeathExtinction, gillespie } from '../simulations/gillespie';
import { createRng } from '../simulations/rng';

export const figures: Record<string, () => FigureSpec> = {
  'simulation-experiments-interaction': () => {
    const b = 1;
    const T = 4;
    const reps = 400;
    const deathRates = [0.6, 0.8, 1.0];
    const sizes = [2, 5, 10];
    const families = ['teal', 'terracotta', 'indigo'] as const;
    const grid = Array.from({ length: 10 }, (_, i) => i + 1);
    let point = 0;
    const estimates = deathRates.map((d) =>
      sizes.map((N0) => {
        const base = 100_000 * ++point;
        let extinct = 0;
        for (let r = 0; r < reps; r++) {
          const path = gillespie(birthDeath(b, d), [N0], T, createRng(base + r));
          if (path.x[path.x.length - 1][0] === 0) extinct++;
        }
        return [N0, extinct / reps] as [number, number];
      }),
    );
    return {
      title: 'How much a larger start lowers extinction risk depends on the death rate: the two factors interact',
      subtitle: `Probability of extinction by year ${T} in the linear birth-death process, b = ${b} per year. Lines: exact; dots: ${reps} Gillespie replicates per design point`,
      xLabel: 'Initial population size N₀ (individuals)',
      yUnit: `Probability of extinction by year ${T}`,
      series: [
        ...deathRates.map((d, i) => ({
          id: `exact${i}`,
          label: `d = ${d.toFixed(1)}`,
          family: families[i],
          points: grid.map((N0) => [N0, birthDeathExtinction(N0, T, b, d)] as [number, number]),
        })),
        ...deathRates.map((d, i) => ({ id: `sim${i}`, label: `Simulated, d = ${d.toFixed(1)}`, family: families[i], kind: 'points' as const, points: estimates[i] })),
      ],
      y: { domain: [0, 1] },
      footer: 'Computed with gillespie and birthDeathExtinction (src/lib/simulations/gillespie.ts). Design point k (1 to 9) uses seeds 100000k + r for replicates r = 0 to 399.',
    };
  },
};
