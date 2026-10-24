// Figures for the lesson "gillespie", computed at build time with the
// tested direct method (src/lib/simulations/gillespie.ts).

import type { FigureSpec } from './types';
import { createRng } from '../simulations/rng';
import { birthDeath, gillespie, type Path } from '../simulations/gillespie';

/** Event times and sizes as a step path, extended to the end time. */
const stepPoints = (path: Path, tEnd: number) => {
  const pts = path.t.map((t, i) => [t, path.x[i][0]] as [number, number]);
  pts.push([tEnd, path.x[path.x.length - 1][0]]);
  return pts;
};

export const figures: Record<string, () => FigureSpec> = {
  'gillespie-three-paths': () => {
    const b = 1.0;
    const d = 0.8;
    const N0 = 5;
    const T = 4;
    const seeds = [1, 2, 3];
    const paths = seeds.map((s) => gillespie(birthDeath(b, d), [N0], T, createRng(s)));
    const families = ['teal', 'terracotta', 'indigo'] as const;
    const describe = paths
      .map((p, i) => `seed ${seeds[i]}: ${p.t.length - 1} events, ${p.stop === 'absorbed' ? `extinct at t = ${p.t[p.t.length - 1].toFixed(2)}` : `N(${T}) = ${p.x[p.x.length - 1][0]}`}`)
      .join('; ');
    return {
      title: 'Each run of the same birth–death model takes its own path, changing by one individual at irregular times',
      subtitle: `Gillespie direct method, b = ${b} and d = ${d} per individual per year, N₀ = ${N0}, three seeds`,
      xLabel: 'Time t (years)',
      yUnit: 'Population size N (individuals)',
      series: paths.map((p, i) => ({ id: `seed${seeds[i]}`, label: `Seed ${seeds[i]}`, points: stepPoints(p, T), kind: 'step' as const, family: families[i] })),
      y: { includeZero: true },
      footer: `Computed with gillespie and birthDeath (src/lib/simulations/gillespie.ts); ${describe}.`,
    };
  },

  'gillespie-waiting-times': () => {
    const b = 1.0;
    const d = 0.8;
    const N0 = 5;
    const a0 = (b + d) * N0;
    const n = 4000;
    const rng = createRng(77);
    // The first waiting time of each run: one event only (maxEvents = 1).
    const taus = Array.from({ length: n }, () => gillespie(birthDeath(b, d), [N0], 1e9, rng, 1).t[1]);
    const s = Array.from({ length: 13 }, (_, i) => i * 0.05);
    const empirical = s.map((si) => taus.filter((tau) => tau > si).length / n);
    const mean = taus.reduce((acc, x) => acc + x, 0) / n;
    const fine = Array.from({ length: 121 }, (_, i) => i * 0.005);
    return {
      title: 'Simulated waiting times follow the exponential law P(τ > s) = e^(−a₀s)',
      subtitle: `First waiting time in ${n} runs from N₀ = ${N0} with b = ${b} and d = ${d} per year, so a₀ = (b + d) N₀ = ${a0} events per year`,
      xLabel: 'Waiting time s (years)',
      yUnit: 'Fraction of waiting times longer than s',
      series: [
        { id: 'exact', label: 'Exact e^(−a₀s)', points: fine.map((x) => [x, Math.exp(-a0 * x)] as [number, number]), family: 'teal' },
        { id: 'sim', label: 'Simulated', points: s.map((x, i) => [x, empirical[i]] as [number, number]), family: 'terracotta', kind: 'points', endLabel: true },
      ],
      y: { domain: [0, 1] },
      footer: `Computed with gillespie (src/lib/simulations/gillespie.ts), seed 77. Mean simulated waiting time ${mean.toFixed(4)} years; exact 1/a₀ = ${(1 / a0).toFixed(4)}, with a standard error of the simulated mean of about ${(1 / a0 / Math.sqrt(n)).toFixed(4)}.`,
    };
  },
};
