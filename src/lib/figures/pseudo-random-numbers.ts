// Figures for the lesson "pseudo-random-numbers", computed at build time
// from the tested Gillespie simulator (src/lib/simulations/gillespie.ts).

import type { FigureSpec } from './types';
import { createRng } from '../simulations/rng';
import { birthDeath, birthDeathMean, gillespie, sampleAt } from '../simulations/gillespie';

const grid = (tEnd: number, n: number) => Array.from({ length: n + 1 }, (_, i) => (tEnd * i) / n);

export const figures: Record<string, () => FigureSpec> = {
  'pseudo-random-numbers-small-large': () => {
    const b = 1.0;
    const d = 0.9;
    const T = 10;
    const times = grid(T, 100);
    const runs = 6;
    const relativePaths = (N0: number, seedBase: number) =>
      Array.from({ length: runs }, (_, r) => {
        const path = gillespie(birthDeath(b, d), [N0], T, createRng(seedBase + r));
        return sampleAt(path, times).map((s, i) => [times[i], s[0] / N0] as [number, number]);
      });
    const small = relativePaths(10, 101);
    const large = relativePaths(1000, 201);
    const extinctSmall = small.filter((p) => p[p.length - 1][1] === 0).length;
    return {
      title: 'Chance scatters a population of 10 far from the deterministic curve but barely moves a population of 1000',
      subtitle: `Linear birth–death process, b = ${b} and d = ${d} per individual per year; ${runs} runs from N₀ = 10 and ${runs} from N₀ = 1000, each divided by N₀`,
      xLabel: 'Time (years)',
      yUnit: 'Relative population size N(t)/N₀',
      series: [
        ...small.map((points, r) => ({ id: `small${r}`, label: 'N₀ = 10', points, kind: 'member' as const, family: 'terracotta' as const, endLabel: r === 0 })),
        ...large.map((points, r) => ({ id: `large${r}`, label: 'N₀ = 1000', points, kind: 'member' as const, family: 'indigo' as const, endLabel: r === 0 })),
        { id: 'det', label: 'Deterministic model', points: times.map((t) => [t, birthDeathMean(1, t, b, d)] as [number, number]), family: 'teal' as const, dashed: true },
      ],
      y: { includeZero: true },
      footer: `Computed with gillespie and birthDeath (src/lib/simulations/gillespie.ts), seeds 101–106 and 201–206. ${extinctSmall} of the ${runs} small populations are extinct by year ${T}. Twelve runs show the spread, not its exact size.`,
    };
  },
};
