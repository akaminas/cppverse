// Figures for the lesson "Analysing simulation output" (analysing-output.mdx).
// Every number is computed at build time from the tested Gillespie code in
// src/lib/simulations/gillespie.ts, with one fixed seed per replicate.

import type { FigureSpec } from './types';
import { birthDeath, birthDeathExtinction, birthDeathMean, gillespie, summarise, type Path } from '../simulations/gillespie';
import { createRng } from '../simulations/rng';

const b = 1;
const d = 0.8;
const N0 = 5;
const T = 4;

// One replicate per seed, as in the C++ driver programs: replicate r uses seed base + r.
const replicatePaths = (base: number, n: number): Path[] =>
  Array.from({ length: n }, (_, r) => gillespie(birthDeath(b, d), [N0], T, createRng(base + r)));

let finalSizesCache: number[] | null = null;
/** N(T) in 4000 replicates (seeds 5001 … 9000), shared by two figures. */
function finalSizes(): number[] {
  if (!finalSizesCache) finalSizesCache = replicatePaths(5001, 4000).map((p) => p.x[p.x.length - 1][0]);
  return finalSizesCache;
}

const mean = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const sd = (xs: readonly number[]) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
};

/** Exact variance of the linear birth–death process at time t. */
const exactVariance = (t: number) => {
  const g = Math.exp((b - d) * t);
  return (N0 * (b + d) * g * (g - 1)) / (b - d);
};

export const figures: Record<string, () => FigureSpec> = {
  'analysing-output-bands': () => {
    const times = Array.from({ length: 41 }, (_, i) => i / 10);
    const paths = replicatePaths(1, 200);
    const s = summarise(paths, times);
    const last = s.quantiles[s.quantiles.length - 1];
    const memberIds = [0, 1, 2];
    return {
      title: `The mean grows smoothly, but by year 4 the middle 90 % of replicates spans ${last[0]} to ${Math.round(last[4])} individuals`,
      subtitle: `Linear birth-death process, b = ${b}, d = ${d} per individual per year, N₀ = ${N0}; 200 replicates. Bands: 5 to 95 % and 25 to 75 % of replicates`,
      xLabel: 'Time (years)',
      yUnit: 'Population size N (individuals)',
      bands: [
        { id: 'q90', label: '5-95 % of replicates', family: 'teal', points: times.map((t, i) => [t, s.quantiles[i][0], s.quantiles[i][4]] as [number, number, number]) },
        { id: 'q50', label: '25-75 % of replicates', family: 'teal', points: times.map((t, i) => [t, s.quantiles[i][1], s.quantiles[i][3]] as [number, number, number]) },
      ],
      series: [
        ...memberIds.map((k) => ({
          id: `member${k}`,
          label: `Replicate ${k + 1}`,
          kind: 'step' as const,
          grey: true,
          endLabel: false,
          points: paths[k].t.map((t, i) => [t, paths[k].x[i][0]] as [number, number]).concat([[T, paths[k].x[paths[k].x.length - 1][0]]]),
        })),
        { id: 'exact', label: 'Exact mean', family: 'ochre', dashed: true, endLabel: false, points: times.map((t) => [t, birthDeathMean(N0, t, b, d)] as [number, number]) },
        { id: 'mean', label: 'Mean of replicates', family: 'teal', points: times.map((t, i) => [t, s.mean[i]] as [number, number]) },
      ],
      y: { includeZero: true },
      footer: 'Computed at build time with gillespie and summarise (src/lib/simulations/gillespie.ts), seeds 1 to 200. Grey steps: three individual replicates; dashed: exact mean N₀ exp((b − d) t).',
    };
  },

  'analysing-output-se': () => {
    const all = finalSizes();
    const ns = [10, 20, 50, 100, 200, 500, 1000, 2000, 4000];
    const sigma = Math.sqrt(exactVariance(T));
    return {
      title: 'More replicates shrink the standard error of the mean, not the spread among populations',
      subtitle: `Population size at year ${T} in the first n of 4000 birth-death replicates (b = ${b}, d = ${d}, N₀ = ${N0}); both axes logarithmic`,
      xLabel: 'Number of replicates n',
      yUnit: 'Individuals',
      series: [
        { id: 'sd', label: 'Standard deviation', family: 'indigo', markers: true, points: ns.map((n) => [n, sd(all.slice(0, n))] as [number, number]) },
        { id: 'se', label: 'Standard error', family: 'terracotta', markers: true, points: ns.map((n) => [n, sd(all.slice(0, n)) / Math.sqrt(n)] as [number, number]) },
        { id: 'se-exact', label: 'σ/√n (exact σ)', family: 'terracotta', dashed: true, endLabel: false, points: ns.map((n) => [n, sigma / Math.sqrt(n)] as [number, number]) },
      ],
      x: { type: 'log', domain: [10, 4000], ticks: [10, 100, 1000, 4000] },
      y: { type: 'log' },
      footer: `Computed with gillespie (src/lib/simulations/gillespie.ts), seeds 5001 to 9000. Exact standard deviation σ = ${sigma.toFixed(2)} individuals from the exact variance of the linear birth-death process.`,
    };
  },

  'analysing-output-mc-error': () => {
    const all = finalSizes();
    const p0 = birthDeathExtinction(N0, T, b, d);
    const ns = Array.from({ length: 28 }, (_, i) => Math.round(50 * Math.pow(80, i / 27)));
    let extinct = 0;
    const cumulative: number[] = [];
    for (const v of all) cumulative.push((extinct += v === 0 ? 1 : 0));
    const est = ns.map((n) => cumulative[n - 1] / n);
    const half = ns.map((n, i) => 1.96 * Math.sqrt((est[i] * (1 - est[i])) / n));
    return {
      title: 'The estimated extinction risk closes in on Kendall’s exact value as its standard error shrinks like 1/√n',
      subtitle: `Fraction of the first n replicates extinct by year ${T} (b = ${b}, d = ${d}, N₀ = ${N0}); band: estimate ± 1.96 standard errors; x axis logarithmic`,
      xLabel: 'Number of replicates n',
      yUnit: 'Probability of extinction by year 4',
      bands: [{ id: 'ci', label: '± 1.96 SE', family: 'teal', points: ns.map((n, i) => [n, est[i] - half[i], est[i] + half[i]] as [number, number, number]) }],
      series: [{ id: 'est', label: 'Estimate', family: 'teal', points: ns.map((n, i) => [n, est[i]] as [number, number]) }],
      references: [{ axis: 'y', value: p0, label: `Kendall: ${p0.toFixed(3)}` }],
      x: { type: 'log', domain: [50, 4000], ticks: [50, 100, 500, 1000, 4000] },
      y: { domain: [0, 0.4] },
      footer: `Computed with gillespie and birthDeathExtinction (src/lib/simulations/gillespie.ts), seeds 5001 to 9000. With all 4000 replicates the estimate is ${est[est.length - 1].toFixed(3)} ± ${half[half.length - 1].toFixed(3)}.`,
    };
  },
};
