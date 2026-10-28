// Figures for the lesson emergence-and-validation, computed from the plant
// IBM in src/lib/simulations/ibm.ts (fixed seeds) and, for the survival
// curves, from closed-form expectations under Poisson-distributed crowding.

import type { FigureSpec } from './types';
import { PlantPopulation, defaultIbmParams, meanFieldEquilibrium, type IbmParams, type YearRecord } from '../simulations/ibm';

const SEEDS = [1, 2, 3];
const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const p0 = defaultIbmParams;
const disc = Math.PI * p0.R * p0.R;

/** Expected survival when crowding is Poisson(λ): Σₖ e^{−λ} λᵏ/k! · s0/(1 + c k). */
function poissonSurvival(lambda: number, p: Pick<IbmParams, 's0' | 'c'> = p0): number {
  let prob = Math.exp(-lambda);
  let sum = 0;
  for (let k = 0; k < 400; k++) {
    sum += (prob * p.s0) / (1 + p.c * k);
    prob *= lambda / (k + 1);
  }
  return sum;
}

/** Abundance at which Poisson-averaged survival equals replacement, 1/(1 + f). */
function randomPatternEquilibrium(p: IbmParams = p0): number {
  let lo = 0;
  let hi = 100;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (poissonSurvival(mid, p) * (1 + p.f) > 1) lo = mid;
    else hi = mid;
  }
  return lo / (Math.PI * p.R * p.R) + 1; // crowding counts the N − 1 others
}

// Each figure is rendered at two widths; compute it once.
function once(make: () => FigureSpec): () => FigureSpec {
  let spec: FigureSpec | undefined;
  return () => (spec ??= make());
}

export const figures: Record<string, () => FigureSpec> = {
  'emergence-clustering': once(() => {
    const runs = SEEDS.map((seed) => new PlantPopulation(p0, 400, seed).run(150));
    const ratio = (h: YearRecord[]) => h.filter((r) => r.year >= 1 && r.csrCrowding > 0).map((r) => [r.year, r.meanCrowding / r.csrCrowding] as [number, number]);
    const late = average(runs.map((h) => average(ratio(h).filter(([t]) => t >= 50).map(([, v]) => v))));
    return {
      title: 'Plants that start at random positions become clustered within two decades',
      subtitle: 'Neighbours a plant counts within R, divided by the number expected if the same plants were placed at random; σ = 0.02, R = 0.05, 400 plants at year 0',
      xLabel: 'Year',
      yUnit: 'Clustering index (observed ÷ random crowding)',
      series: runs.map((h, k) => ({
        id: `cluster-${SEEDS[k]}`,
        label: k === 0 ? 'Seed 1' : `Seed ${SEEDS[k]}`,
        family: 'indigo' as const,
        kind: k === 0 ? ('line' as const) : ('member' as const),
        endLabel: k === 0,
        points: ratio(h),
      })),
      references: [{ axis: 'y', value: 1, label: 'Spatial randomness' }],
      y: { includeZero: true },
      footer: `Mean clustering index over years 50 to 150 and three seeds: ${late.toFixed(2)}. Computed with PlantPopulation (src/lib/simulations/ibm.ts).`,
    };
  }),

  'validation-global-limit': once(() => {
    const p: IbmParams = { ...p0, interaction: 'global' };
    const Nstar = meanFieldEquilibrium(p);
    const runs = SEEDS.map((seed) => new PlantPopulation(p, 100, seed).run(150));
    // The deterministic mean-field recursion N ← N s(N) (1 + f), with the same crowding (N − 1) π R².
    const recursion: [number, number][] = [[0, 100]];
    for (let t = 1; t <= 150; t++) {
      const N = recursion[t - 1][1];
      recursion.push([t, (N * p.s0 * (1 + p.f)) / (1 + p.c * Math.max(0, N - 1) * disc)]);
    }
    const means = runs.map((h) => average(h.filter((r) => r.year >= 40).map((r) => r.N)));
    const overall = average(means);
    return {
      title: 'With global interaction the IBM fluctuates around its exact mean-field equilibrium',
      subtitle: 'Every plant experiences the mean crowding (N − 1) π R²; solid lines: the IBM with three seeds (thin: seeds 2 and 3), 100 plants at year 0',
      xLabel: 'Year',
      yUnit: 'Plants alive N (individuals per plot)',
      series: [
        ...runs.map((h, k) => ({
          id: `global-${SEEDS[k]}`,
          label: `IBM, seed ${SEEDS[k]}`,
          family: 'teal' as const,
          kind: k === 0 ? ('line' as const) : ('member' as const),
          endLabel: false,
          points: h.map((r) => [r.year, r.N] as [number, number]),
        })),
        { id: 'recursion', label: `Mean field, N* ≈ ${Nstar.toFixed(0)}`, family: 'ochre' as const, dashed: true, points: recursion },
      ],
      y: { includeZero: true },
      footer: `Dashed: the deterministic mean-field recursion; its fixed point is N* + 1 because a plant does not crowd itself. Mean N over years 40 to 150: ${means.map((m) => m.toFixed(0)).join(', ')} (seeds 1 to 3); pooled ${overall.toFixed(0)}, ${Math.abs((100 * (overall - Nstar)) / Nstar).toFixed(1)} % ${overall < Nstar ? 'below' : 'above'} N*. Computed with PlantPopulation and meanFieldEquilibrium (src/lib/simulations/ibm.ts).`,
    };
  }),

  'validation-dispersal': once(() => {
    const sigmas = [0.0125, 0.015, 0.0175, 0.02, 0.025, 0.03, 0.04, 0.06, 0.1, 0.2];
    const Nstar = meanFieldEquilibrium(p0);
    const Nrandom = randomPatternEquilibrium(p0);
    const cells = sigmas.map((sigma) =>
      SEEDS.map((seed) => {
        const h = new PlantPopulation({ ...p0, sigma }, 400, seed).run(120);
        const Ns: number[] = [];
        for (let t = 40; t <= 120; t++) Ns.push(h[t]?.N ?? 0); // a run that went extinct contributes zeros
        return average(Ns);
      }),
    );
    return {
      title: 'Short dispersal holds abundance far below the mean-field value; wide dispersal lifts it above',
      subtitle: 'Long-run abundance (mean of years 40 to 120) against dispersal distance σ; dots: three seeds per σ, line: their mean; local interaction, synchronous',
      xLabel: 'Dispersal distance σ (plot widths, log scale)',
      yUnit: 'Long-run abundance N (individuals per plot)',
      series: [
        { id: 'mean', label: 'Mean of seeds', family: 'indigo', markers: true, endLabel: false, points: sigmas.map((s, i) => [s, average(cells[i])] as [number, number]) },
        { id: 'seeds', label: 'Single seeds', family: 'indigo', kind: 'points', endLabel: false, points: sigmas.flatMap((s, i) => cells[i].map((v) => [s, v] as [number, number])) },
      ],
      references: [
        { axis: 'y', value: Nstar, label: `Mean field ${Nstar.toFixed(0)}` },
        { axis: 'y', value: Nrandom, label: `Random pattern ${Nrandom.toFixed(0)}` },
        { axis: 'x', value: p0.R, label: 'σ = R' },
      ],
      x: { type: 'log', domain: [0.01, 0.6], ticks: [0.01, 0.02, 0.05, 0.1, 0.2, 0.5] },
      y: { domain: [0, 700], ticks: [0, 200, 400, 600] },
      footer: `Mean field: N* = (s₀(1 + f) − 1)/(c π R²). Random pattern: abundance at which survival averaged over Poisson crowding equals 1/(1 + f). Computed with PlantPopulation (src/lib/simulations/ibm.ts).`,
    };
  }),

  'validation-jensen': once(() => {
    const replacement = 1 / (1 + p0.f);
    const lambdas = Array.from({ length: 121 }, (_, i) => i / 10);
    const mf = (p0.s0 * (1 + p0.f) - 1) / p0.c;
    let lo = 0;
    let hi = 50;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (poissonSurvival(mid) > replacement) lo = mid;
      else hi = mid;
    }
    return {
      title: 'Variable crowding raises average survival, so plants must be denser before births and deaths balance',
      subtitle: `Survival s(n) = s₀/(1 + c n) with s₀ = 0.9, c = 0.25, when every plant has the mean crowding and when crowding is Poisson-distributed about that mean`,
      xLabel: 'Mean crowding (neighbours per plant)',
      yUnit: 'Average survival probability',
      series: [
        { id: 'poisson', label: 'Poisson crowding', family: 'terracotta', points: lambdas.map((l) => [l, poissonSurvival(l)] as [number, number]) },
        { id: 'mean', label: 'Everyone at the mean', family: 'teal', points: lambdas.map((l) => [l, p0.s0 / (1 + p0.c * l)] as [number, number]) },
      ],
      references: [{ axis: 'y', value: replacement, label: 'Replacement 1/(1 + f)' }],
      y: { includeZero: true, domain: [0, 1] },
      footer: `Replacement is reached at a mean crowding of ${mf.toFixed(2)} when everyone has the mean and ${lo.toFixed(2)} with Poisson crowding. Closed-form expectations; nothing is simulated.`,
    };
  }),
};
