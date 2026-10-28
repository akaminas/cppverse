// Figures for the lesson ibm-scheduling: the plant IBM of
// src/lib/simulations/ibm.ts run with synchronous and with random-order
// scheduling, identical parameters and identical seeds.

import type { FigureSpec } from './types';
import { PlantPopulation, defaultIbmParams, meanFieldEquilibrium, type IbmParams, type YearRecord } from '../simulations/ibm';

const YEARS = 150;
const BURN_IN = 50;
const INITIAL = 300;
const SEEDS = [1, 2, 3];

type Schedule = IbmParams['schedule'];
const cache = new Map<string, YearRecord[]>();
function run(schedule: Schedule, seed: number): YearRecord[] {
  const key = `${schedule}:${seed}`;
  if (!cache.has(key)) cache.set(key, new PlantPopulation({ ...defaultIbmParams, schedule }, INITIAL, seed).run(YEARS));
  return cache.get(key)!;
}
const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const tail = (h: YearRecord[]) => h.filter((r) => r.year >= BURN_IN);
const longRun = (schedule: Schedule, pick: (r: YearRecord) => number) => average(SEEDS.map((seed) => average(tail(run(schedule, seed)).map(pick))));

const SCHEDULES: { schedule: Schedule; label: string; family: 'teal' | 'terracotta' }[] = [
  { schedule: 'random-order', label: 'Random order', family: 'terracotta' },
  { schedule: 'synchronous', label: 'Synchronous', family: 'teal' },
];

// Each figure is rendered at two widths; compute it once.
function once(make: () => FigureSpec): () => FigureSpec {
  let spec: FigureSpec | undefined;
  return () => (spec ??= make());
}

export const figures: Record<string, () => FigureSpec> = {
  'ibm-scheduling-abundance': once(() => {
    const Nstar = meanFieldEquilibrium(defaultIbmParams);
    const sync = longRun('synchronous', (r) => r.N);
    const rand = longRun('random-order', (r) => r.N);
    return {
      title: `Visiting plants in random order lets the same population settle at ${(rand / sync).toFixed(1)} times the abundance`,
      subtitle: `Plant IBM, s₀ = 0.9, c = 0.25, R = 0.05, f = 1.2, σ = 0.02, 300 plants at year 0; three seeds per schedule (thin lines: seeds 2 and 3)`,
      xLabel: 'Year',
      yUnit: 'Plants alive N (individuals per plot)',
      series: SCHEDULES.flatMap((s) =>
        SEEDS.map((seed, k) => ({
          id: `${s.schedule}-${seed}`,
          label: k === 0 ? s.label : `${s.label}, seed ${seed}`,
          family: s.family,
          kind: k === 0 ? ('line' as const) : ('member' as const),
          endLabel: k === 0,
          points: run(s.schedule, seed).map((r) => [r.year, r.N] as [number, number]),
        })),
      ),
      references: [{ axis: 'y', value: Nstar, label: `Mean-field N* ≈ ${Nstar.toFixed(0)}` }],
      y: { includeZero: true },
      footer: `Mean N over years ${BURN_IN} to ${YEARS} and three seeds: ${rand.toFixed(0)} (random order) and ${sync.toFixed(0)} (synchronous). Computed with PlantPopulation (src/lib/simulations/ibm.ts).`,
    };
  }),

  'ibm-scheduling-crowding': once(() => {
    const p = defaultIbmParams;
    const meanFieldCrowding = (p.s0 * (1 + p.f) - 1) / p.c;
    const sync = longRun('synchronous', (r) => r.meanCrowding);
    const rand = longRun('random-order', (r) => r.meanCrowding);
    // Mean over the three seeds, then a centred five-year moving average.
    const smoothed = (schedule: Schedule): [number, number][] => {
      const perYear = Array.from({ length: YEARS }, (_, k) => average(SEEDS.map((seed) => run(schedule, seed)[k + 1].meanCrowding)));
      const out: [number, number][] = [];
      for (let k = 2; k < YEARS - 2; k++) out.push([k + 1, average(perYear.slice(k - 2, k + 3))]);
      return out;
    };
    return {
      title: 'Both schedules settle where the typical plant experiences the same crowding',
      subtitle: 'Living neighbours within R that a plant counts when its survival is decided: mean of the three seeds of the abundance figure, five-year moving average',
      xLabel: 'Year',
      yUnit: 'Crowding experienced (neighbours per plant)',
      series: SCHEDULES.map((s) => ({ id: `crowding-${s.schedule}`, label: s.label, family: s.family, points: smoothed(s.schedule) })),
      references: [{ axis: 'y', value: meanFieldCrowding, label: `Mean field ${meanFieldCrowding.toFixed(2)}` }],
      y: { domain: [0, 7], ticks: [0, 2, 4, 6] },
      footer: `Mean over years ${BURN_IN} to ${YEARS} and three seeds: ${rand.toFixed(2)} (random order) and ${sync.toFixed(2)} (synchronous) neighbours. Computed with PlantPopulation (src/lib/simulations/ibm.ts).`,
    };
  }),
};
