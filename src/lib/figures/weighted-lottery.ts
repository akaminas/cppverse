// Figures for the lesson "weighted-lottery". Neutral Wright–Fisher drift is
// simulated by multinomial sampling with weightedIndex (the tested weighted
// lottery in src/lib/simulations/rng.ts) and compared with the exact
// expectation E[H_t] = H_0 (1 − 1/N)^t.

import type { FigureSpec } from './types';
import { createRng, weightedIndex } from '../simulations/rng';

/** Heterozygosity 1 − Σ p_i² of a vector of allele counts. */
const heterozygosity = (counts: readonly number[], N: number) => 1 - counts.reduce((s, n) => s + (n / N) ** 2, 0);

export const figures: Record<string, () => FigureSpec> = {
  'weighted-lottery-drift': () => {
    const N = 25;
    const alleles = 5;
    const generations = 100;
    const replicates = 400;
    const rng = createRng(2026);
    const sumH = new Array<number>(generations + 1).fill(0);
    const sumH2 = new Array<number>(generations + 1).fill(0);
    for (let r = 0; r < replicates; r++) {
      let counts = new Array<number>(alleles).fill(N / alleles);
      for (let t = 0; t <= generations; t++) {
        const H = heterozygosity(counts, N);
        sumH[t] += H;
        sumH2[t] += H * H;
        // Each of the N offspring copies a parent chosen by a weighted lottery on the counts.
        const next = new Array<number>(alleles).fill(0);
        for (let k = 0; k < N; k++) next[weightedIndex(rng, counts)]++;
        counts = next;
      }
    }
    const mean = sumH.map((s) => s / replicates);
    const se = mean.map((m, t) => Math.sqrt(Math.max(0, sumH2[t] / replicates - m * m) / (replicates - 1)));
    const H0 = mean[0];
    const ts = mean.map((_, t) => t);
    const maxSe = Math.max(...se);
    return {
      title: 'Without selection, drift erodes allelic diversity by a factor 1 − 1/N each generation',
      subtitle: `Neutral Wright–Fisher population of N = ${N} haploid individuals, ${alleles} alleles starting at equal counts; mean of ${replicates} replicate populations`,
      xLabel: 'Generation t',
      yUnit: 'Heterozygosity H = 1 − Σ pᵢ²',
      series: [
        { id: 'exact', label: 'Exact H₀ (1 − 1/N)ᵗ', points: ts.map((t) => [t, H0 * (1 - 1 / N) ** t] as [number, number]), family: 'teal', dashed: true },
        { id: 'sim', label: 'Replicate mean', points: ts.map((t) => [t, mean[t]] as [number, number]), family: 'terracotta' },
      ],
      bands: [{ id: 'se', label: '±2 standard errors', points: ts.map((t) => [t, mean[t] - 2 * se[t], mean[t] + 2 * se[t]] as [number, number, number]), family: 'terracotta' }],
      y: { domain: [0, 0.8] },
      footer: `Computed with weightedIndex (src/lib/simulations/rng.ts), seed 2026. Band: ±2 standard errors of the mean (largest standard error ${maxSe.toFixed(3)}).`,
    };
  },
};
