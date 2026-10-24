// Figures for the lesson "Matrix population models" (matrix-models.mdx).
// Every number is computed at build time from src/lib/simulations/matrix.ts.

import type { FigureSpec } from './types';
import { STAGE_LABELS, powerIteration, project, stageMatrix, sum, type StageParams } from '../simulations/matrix';

// The plant of stage_matrix.cpp and the matrix laboratory.
const plant: StageParams = { fecundity: 4.5, seedlingSurvival: 0.12, stasis: 0.5, flowering: 0.25, reversion: 0.35, reflowering: 0.4 };
const start = [100, 20, 5];
const families = ['teal', 'terracotta', 'indigo'] as const;

export const figures: Record<string, () => FigureSpec> = {
  'matrix-models-projection': () => {
    const A = stageMatrix(plant);
    const { lambda } = powerIteration(A);
    const traj = project(A, start, 30);
    return {
      title: `After a few years every stage shrinks by the same factor, λ = ${lambda.toFixed(3)}, each year`,
      subtitle: 'Three-stage plant model n(t+1) = A n(t), started from 100 seedlings, 20 vegetative and 5 flowering plants; logarithmic axis',
      xLabel: 'Year t',
      yUnit: 'Plants in each stage (number, log scale)',
      series: STAGE_LABELS.map((label, i) => ({
        id: `stage${i}`,
        label,
        points: traj.map((n, t) => [t, n[i]] as [number, number]),
        family: families[i],
      })),
      y: { type: 'log' },
      footer: 'Computed at build time with project and powerIteration (src/lib/simulations/matrix.ts). Parallel straight lines on a log axis mean a common geometric rate.',
    };
  },

  'matrix-models-structure': () => {
    const A = stageMatrix(plant);
    const { w } = powerIteration(A);
    const traj = project(A, start, 20);
    return {
      title: 'The stage proportions settle on the stable stage structure within about ten years',
      subtitle: 'Fraction of the plants in each stage, n_i(t) / Σ n_j(t), for the projection started from 100 seedlings, 20 vegetative and 5 flowering plants',
      xLabel: 'Year t',
      yUnit: 'Proportion of all plants',
      series: STAGE_LABELS.map((label, i) => ({
        id: `prop${i}`,
        label,
        points: traj.map((n, t) => [t, n[i] / sum(n)] as [number, number]),
        family: families[i],
        markers: true,
      })),
      references: STAGE_LABELS.map((label, i) => ({ axis: 'y' as const, value: w[i], label: `${label}: ${w[i].toFixed(3)}` })),
      y: { domain: [0, 1] },
      footer: 'Dotted lines: the stable structure w returned by powerIteration (src/lib/simulations/matrix.ts).',
    };
  },

  'matrix-models-lambda': () => {
    // Fecundity 85/12 gives λ = 1 exactly: then A n = n has the solution
    // n = (f, 2.4, 1) n_F, which requires 0.5 × 2.4 = 0.12 f + 0.35.
    const cases = [4.5, 85 / 12, 10].map((fecundity) => {
      const A = stageMatrix({ ...plant, fecundity });
      return { fecundity, lambda: powerIteration(A).lambda, traj: project(A, start, 40) };
    });
    return {
      title: 'The population declines, levels off or grows as λ is below, equal to or above 1',
      subtitle: 'Total plants in the three-stage model for three fecundities f (seedlings per flowering plant), all other transitions unchanged; logarithmic axis',
      xLabel: 'Year t',
      yUnit: 'All plants (number, log scale)',
      series: cases.map((c, i) => ({
        id: `lam${i}`,
        label: `f = ${c.fecundity.toFixed(2)}, λ = ${c.lambda.toFixed(3)}`,
        points: c.traj.map((n, t) => [t, sum(n)] as [number, number]),
        family: (['terracotta', 'ochre', 'teal'] as const)[i],
      })),
      y: { type: 'log' },
      footer: 'Computed with project and powerIteration (src/lib/simulations/matrix.ts). The early rise and dip come from a starting structure far from the stable one, not from λ.',
    };
  },
};
