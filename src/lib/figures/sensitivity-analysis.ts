// Figures for the lesson "Sensitivity analysis" (sensitivity-analysis.mdx).
// λ is computed at build time with powerIteration from the tested matrix
// code in src/lib/simulations/matrix.ts; random samples use the seeded
// generator in src/lib/simulations/rng.ts.

import type { FigureSpec } from './types';
import { powerIteration, stageMatrix, type StageParams } from '../simulations/matrix';
import { createRng, shuffle } from '../simulations/rng';

export const baseline: StageParams = { fecundity: 4.5, seedlingSurvival: 0.12, stasis: 0.5, flowering: 0.25, reversion: 0.35, reflowering: 0.4 };
const keys = Object.keys(baseline) as (keyof StageParams)[];
const names: Record<keyof StageParams, string> = {
  fecundity: 'Fecundity',
  seedlingSurvival: 'Seedling survival',
  stasis: 'Rosette stasis',
  flowering: 'Rosette flowering',
  reversion: 'Reversion',
  reflowering: 'Reflowering',
};

const lambdaOf = (p: StageParams) => powerIteration(stageMatrix(p)).lambda;
const scaled = (k: keyof StageParams, factor: number): StageParams => ({ ...baseline, [k]: baseline[k] * factor });

/** Elasticity (p/λ) ∂λ/∂p by a central difference with relative step δ. */
export function elasticity(k: keyof StageParams, delta = 1e-3): number {
  return (lambdaOf(scaled(k, 1 + delta)) - lambdaOf(scaled(k, 1 - delta))) / (2 * delta * lambdaOf(baseline));
}

const fmt2 = (v: number) => v.toFixed(2);

export const figures: Record<string, () => FigureSpec> = {
  'sensitivity-analysis-sweeps': () => {
    const factors = Array.from({ length: 21 }, (_, i) => 0.5 + i * 0.05);
    const groups: { id: string; label: string; key: keyof StageParams }[] = [
      { id: 'stasis', label: 'Rosette stasis', key: 'stasis' },
      { id: 'flowering', label: 'Rosette flowering', key: 'flowering' },
      { id: 'reflowering', label: 'Reflowering', key: 'reflowering' },
      { id: 'fecundity', label: 'Fecundity', key: 'fecundity' },
      { id: 'reversion', label: 'Reversion', key: 'reversion' },
    ];
    return {
      title: 'The growth rate responds most strongly to rosette stasis and flowering',
      subtitle: 'Three-stage plant model; each parameter scaled from half to 1.5 times its baseline while the others stay at baseline. Seedling survival gives the same curve as fecundity',
      xLabel: 'Parameter value relative to baseline',
      yUnit: 'Asymptotic growth rate λ (per year)',
      series: groups.map((g) => ({ id: g.id, label: g.label, points: factors.map((f) => [f, lambdaOf(scaled(g.key, f))] as [number, number]) })),
      references: [
        { axis: 'y', value: 1, label: 'λ = 1' },
        { axis: 'x', value: 1, label: 'baseline' },
      ],
      x: { format: fmt2 },
      footer: 'Computed with stageMatrix and powerIteration (src/lib/simulations/matrix.ts). Fecundity and seedling survival give identical curves because λ depends on them only through their product.',
    };
  },

  'sensitivity-analysis-elasticities': () => {
    const ranked = keys.map((k) => ({ k, e: elasticity(k) })).sort((a, b) => b.e - a.e);
    const total = ranked.reduce((s, r) => s + r.e, 0);
    return {
      title: 'Rosette stasis has the largest elasticity, and the six elasticities sum to one',
      subtitle: 'Elasticity (p/λ) ∂λ/∂p of each parameter at baseline, by central differences with a 0.1 % step, ranked from largest to smallest',
      xLabel: 'Elasticity of λ',
      yUnit: 'Rank',
      series: ranked.map((r, i) => ({
        id: r.k,
        label: `${names[r.k]} ${r.e.toFixed(3)}`,
        family: 'teal' as const,
        points: [[0, i + 1], [r.e, i + 1]] as [number, number][],
      })),
      x: { domain: [0, 0.3], format: fmt2 },
      y: { domain: [6.6, 0.4], ticks: [1, 2, 3, 4, 5, 6], format: (v: number) => String(v) },
      footer: `Computed with powerIteration (src/lib/simulations/matrix.ts) at baseline λ = ${lambdaOf(baseline).toFixed(4)}. Sum of the elasticities: ${total.toFixed(4)}.`,
    };
  },

  'sensitivity-analysis-interaction': () => {
    const fec = Array.from({ length: 33 }, (_, i) => i * 0.5);
    const levels = [0.06, 0.12, 0.24];
    return {
      title: 'Doubling seedling survival halves the fecundity a population needs to grow',
      subtitle: 'λ against fecundity at three levels of seedling survival; other parameters at baseline',
      xLabel: 'Fecundity (seedlings per flowering plant per year)',
      yUnit: 'Asymptotic growth rate λ (per year)',
      series: levels.map((g, i) => ({
        id: `g${i}`,
        label: `Seedling survival ${g}`,
        points: fec.map((f) => [f, lambdaOf({ ...baseline, fecundity: f, seedlingSurvival: g })] as [number, number]),
      })),
      references: [{ axis: 'y', value: 1, label: 'λ = 1' }],
      footer: 'Computed with stageMatrix and powerIteration (src/lib/simulations/matrix.ts). The curves cross λ = 1 where fecundity × seedling survival = 0.85.',
    };
  },

  'sensitivity-analysis-global': () => {
    // Latin hypercube sample: 200 points, each parameter scaled within ±30 %.
    const n = 200;
    const rng = createRng(31);
    const columns = keys.map(() => shuffle(rng, Array.from({ length: n }, (_, i) => i)).map((stratum) => 0.7 + (0.6 * (stratum + rng.next())) / n));
    const samples = Array.from({ length: n }, (_, i) => {
      const p = { ...baseline };
      keys.forEach((k, j) => (p[k] = baseline[k] * columns[j][i]));
      return { factors: keys.map((_, j) => columns[j][i]), lambda: lambdaOf(p) };
    });
    const corr2 = (j: number) => {
      const xs = samples.map((s) => s.factors[j]);
      const ys = samples.map((s) => s.lambda);
      const mx = xs.reduce((a, v) => a + v, 0) / n;
      const my = ys.reduce((a, v) => a + v, 0) / n;
      let sxy = 0, sxx = 0, syy = 0;
      for (let i = 0; i < n; i++) {
        sxy += (xs[i] - mx) * (ys[i] - my);
        sxx += (xs[i] - mx) ** 2;
        syy += (ys[i] - my) ** 2;
      }
      return (sxy * sxy) / (sxx * syy);
    };
    const shares = keys.map((k, j) => ({ k, r2: corr2(j) })).sort((a, b) => b.r2 - a.r2);
    const stasis = keys.indexOf('stasis');
    return {
      title: 'Even when all six parameters vary together, rosette stasis leaves a clear trend in λ',
      subtitle: `${n} Latin hypercube samples, every parameter scaled independently between 0.7 and 1.3 times its baseline; λ plotted against the stasis factor`,
      xLabel: 'Rosette stasis relative to baseline',
      yUnit: 'Asymptotic growth rate λ (per year)',
      series: [{ id: 'lhs', label: 'Samples', kind: 'points', family: 'indigo', points: samples.map((s) => [s.factors[stasis], s.lambda] as [number, number]) }],
      references: [{ axis: 'y', value: 1, label: 'λ = 1' }],
      x: { format: fmt2 },
      footer: 'Share of the variance in λ explained by each factor alone (squared correlation): ' + shares.map((s) => `${names[s.k].toLowerCase()} ${s.r2.toFixed(2)}`).join(', ') + '. Computed with powerIteration (src/lib/simulations/matrix.ts), seed 31.',
    };
  },
};
