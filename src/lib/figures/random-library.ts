// Figures for the lesson "random-library", computed at build time with the
// tested browser generator and distributions (src/lib/simulations/rng.ts).

import type { FigureSpec } from './types';
import { createRng, poisson } from '../simulations/rng';

/** Poisson probability P(K = k) for mean mu, by the recurrence p_k = p_{k−1} mu / k. */
function poissonPmf(mu: number, kMax: number): number[] {
  const p = [Math.exp(-mu)];
  for (let k = 1; k <= kMax; k++) p.push((p[k - 1] * mu) / k);
  return p;
}

export const figures: Record<string, () => FigureSpec> = {
  'random-library-poisson': () => {
    const mu = 3.2;
    const kMax = 10;
    const exact = poissonPmf(mu, kMax);
    const sampled = (n: number, seed: number) => {
      const rng = createRng(seed);
      const counts = new Array<number>(kMax + 1).fill(0);
      for (let i = 0; i < n; i++) {
        const k = poisson(rng, mu);
        if (k <= kMax) counts[k]++;
      }
      return counts.map((c) => c / n);
    };
    const few = sampled(100, 7);
    const many = sampled(10000, 8);
    const ks = exact.map((_, k) => k);
    const maxDev = (f: number[]) => Math.max(...f.map((v, k) => Math.abs(v - exact[k])));
    return {
      title: 'Sampled clutch-size frequencies close in on the exact Poisson probabilities as draws accumulate',
      subtitle: `Poisson distribution with mean μ = ${mu} eggs; frequencies from 100 and from 10 000 draws`,
      xLabel: 'Clutch size k (eggs)',
      yUnit: 'Probability or relative frequency',
      series: [
        { id: 'exact', label: 'Exact P(K = k)', points: ks.map((k) => [k, exact[k]] as [number, number]), family: 'teal', markers: true },
        { id: 'few', label: '100 draws', points: ks.map((k) => [k, few[k]] as [number, number]), family: 'terracotta', kind: 'points', endLabel: true },
        { id: 'many', label: '10 000 draws', points: ks.map((k) => [k, many[k]] as [number, number]), family: 'indigo', kind: 'points', endLabel: true },
      ],
      x: { ticks: [0, 2, 4, 6, 8, 10] },
      y: { includeZero: true },
      footer: `Computed with poisson (src/lib/simulations/rng.ts), seeds 7 and 8. Largest deviation from the exact probability: ${maxDev(few).toFixed(3)} with 100 draws, ${maxDev(many).toFixed(3)} with 10 000. The line joins exact probabilities of whole numbers only.`,
    };
  },
};
