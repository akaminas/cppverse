// Figures for the lesson "stochastic-replicates", computed at build time
// from the tested Gillespie simulator and ensemble summaries
// (src/lib/simulations/gillespie.ts) and the SIR ODE (ode.ts).

import type { FigureSpec } from './types';
import { createRng } from '../simulations/rng';
import { birthDeath, birthDeathExtinction, birthDeathMean, gillespie, sampleAt, sirStochastic, summarise } from '../simulations/gillespie';
import { integrateFixed, sirRhs } from '../simulations/ode';

const grid = (tEnd: number, n: number) => Array.from({ length: n + 1 }, (_, i) => (tEnd * i) / n);
const b = 1.0;
const d = 0.8;
const N0 = 5;

function birthDeathEnsemble(n: number, tEnd: number, seed: number) {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => gillespie(birthDeath(b, d), [N0], tEnd, rng));
}

function sirOde(beta: number, gamma: number, T: number) {
  const ode = integrateFixed(sirRhs({ beta, gamma }), [0.99, 0.01, 0], 0, T, 0.1, 'rk4');
  return ode.t.map((t, i) => [t, ode.x[i][1]] as [number, number]).filter((_, i) => i % 10 === 0);
}

export const figures: Record<string, () => FigureSpec> = {
  'stochastic-replicates-members': () => {
    const T = 4;
    const times = grid(T, 100);
    const paths = birthDeathEnsemble(40, T, 40);
    const s = summarise(paths, times);
    const finals = paths.map((p) => sampleAt(p, [T])[0][0]);
    const extinct = finals.filter((x) => x === 0).length;
    return {
      title: 'Forty runs of one birth–death model end anywhere from extinction to several times the starting size',
      subtitle: `Gillespie simulation, b = ${b} and d = ${d} per individual per year, N₀ = ${N0}; 40 replicates, their mean and the exact expectation`,
      xLabel: 'Time t (years)',
      yUnit: 'Population size N (individuals)',
      series: [
        ...paths.map((p, r) => ({ id: `m${r}`, label: 'Replicate', points: sampleAt(p, times).map((x, i) => [times[i], x[0]] as [number, number]), kind: 'member' as const, family: 'indigo' as const })),
        { id: 'mean', label: 'Mean of 40', points: times.map((t, i) => [t, s.mean[i]] as [number, number]), family: 'terracotta' as const },
        { id: 'exact', label: 'Exact mean', points: times.map((t) => [t, birthDeathMean(N0, t, b, d)] as [number, number]), family: 'teal' as const, dashed: true },
      ],
      y: { includeZero: true },
      footer: `Computed with gillespie and summarise (src/lib/simulations/gillespie.ts), seed 40. At t = ${T}: ${extinct} of 40 runs extinct, largest N = ${Math.max(...finals)}, mean ${s.mean[s.mean.length - 1].toFixed(2)} against the exact ${birthDeathMean(N0, T, b, d).toFixed(2)}.`,
    };
  },

  'stochastic-replicates-bands': () => {
    const T = 4;
    const n = 2000;
    const times = grid(T, 80);
    const s = summarise(birthDeathEnsemble(n, T, 2000), times);
    const last = s.quantiles[s.quantiles.length - 1];
    return {
      title: 'The mean lies above the median: a few large populations pull it up while many stay small or die out',
      subtitle: `${n} replicates of the birth–death process (b = ${b}, d = ${d}, N₀ = ${N0}); bands hold the central 50 % and 90 % of runs`,
      xLabel: 'Time t (years)',
      yUnit: 'Population size N (individuals)',
      bands: [
        { id: 'q90', label: '5–95 %', points: times.map((t, i) => [t, s.quantiles[i][0], s.quantiles[i][4]] as [number, number, number]), family: 'indigo', opacity: 0.3 },
        { id: 'q50', label: '25–75 %', points: times.map((t, i) => [t, s.quantiles[i][1], s.quantiles[i][3]] as [number, number, number]), family: 'indigo', opacity: 0.55 },
      ],
      series: [
        { id: 'median', label: 'Median', points: times.map((t, i) => [t, s.quantiles[i][2]] as [number, number]), family: 'indigo' },
        { id: 'mean', label: 'Mean', points: times.map((t, i) => [t, s.mean[i]] as [number, number]), family: 'terracotta' },
        { id: 'exact', label: 'Exact mean', points: times.map((t) => [t, birthDeathMean(N0, t, b, d)] as [number, number]), family: 'teal', dashed: true },
      ],
      y: { includeZero: true },
      footer: `Computed with gillespie and summarise (src/lib/simulations/gillespie.ts), seed 2000. At t = ${T} the 5, 25, 50, 75 and 95 % quantiles are ${last.map((v) => v.toFixed(0)).join(', ')} individuals and the mean is ${s.mean[s.mean.length - 1].toFixed(2)}.`,
    };
  },

  'stochastic-replicates-extinction': () => {
    const T = 10;
    const n = 2000;
    const times = grid(T, 40);
    const s = summarise(birthDeathEnsemble(n, T, 1948), times);
    const se = s.zeroFraction.map((p) => Math.sqrt((p * (1 - p)) / n));
    const fine = grid(T, 200);
    const exact = (t: number) => birthDeathExtinction(N0, t, b, d);
    const worst = Math.max(...s.zeroFraction.map((p, i) => (se[i] > 0 ? Math.abs(p - exact(times[i])) / se[i] : 0)));
    const limit = (d / b) ** N0;
    return {
      title: 'The fraction of extinct replicates tracks Kendall’s exact extinction probability within its sampling error',
      subtitle: `${n} replicates of the birth–death process (b = ${b}, d = ${d}, N₀ = ${N0}); band: ±2 standard errors of the fraction`,
      xLabel: 'Time t (years)',
      yUnit: 'Probability that N(t) = 0',
      bands: [{ id: 'se', label: '±2 SE', points: times.map((t, i) => [t, Math.max(0, s.zeroFraction[i] - 2 * se[i]), s.zeroFraction[i] + 2 * se[i]] as [number, number, number]), family: 'terracotta' }],
      series: [
        { id: 'exact', label: 'Kendall (exact)', points: fine.map((t) => [t, exact(t)] as [number, number]), family: 'teal', dashed: true },
        { id: 'sim', label: 'Fraction extinct', points: times.map((t, i) => [t, s.zeroFraction[i]] as [number, number]), family: 'terracotta', kind: 'points', endLabel: true },
      ],
      references: [{ axis: 'y', value: limit, label: `long-run limit (d/b)^N₀ = ${limit.toFixed(3)}` }],
      y: { includeZero: true },
      footer: `Computed with gillespie, summarise and birthDeathExtinction (src/lib/simulations/gillespie.ts), seed 1948. Largest deviation from the exact value: ${worst.toFixed(1)} standard errors.`,
    };
  },

  'stochastic-replicates-sir-size': () => {
    const beta = 0.3;
    const gamma = 0.1;
    const T = 160;
    const times = grid(T, 160);
    const runs = 12;
    const members = (N: number, seed: number) => {
      const rng = createRng(seed);
      const I0 = Math.round(0.01 * N);
      return Array.from({ length: runs }, () => {
        const p = gillespie(sirStochastic(beta, gamma, N), [N - I0, I0, 0], T, rng);
        return sampleAt(p, times).map((x, i) => [times[i], x[1] / N] as [number, number]);
      });
    };
    const small = members(200, 31);
    const large = members(20000, 32);
    const fizzled = small.filter((m) => Math.max(...m.map(([, y]) => y)) < 0.05).length;
    return {
      title: 'Epidemics in 20 000 hosts nearly follow the ODE, while in 200 hosts they vary in timing and size',
      subtitle: `Stochastic SIR, β = ${beta} and γ = ${gamma} per day, 1 % of hosts initially infectious; ${runs} runs at each population size`,
      xLabel: 'Time (days)',
      yUnit: 'Proportion infectious I/N',
      series: [
        ...small.map((points, r) => ({ id: `s${r}`, label: 'N = 200', points, kind: 'member' as const, family: 'terracotta' as const, endLabel: r === 0 })),
        ...large.map((points, r) => ({ id: `l${r}`, label: 'N = 20 000', points, kind: 'member' as const, family: 'indigo' as const, endLabel: r === 0 })),
        { id: 'ode', label: 'ODE', points: sirOde(beta, gamma, T), family: 'teal' as const, dashed: true },
      ],
      x: { domain: [0, 160], ticks: [0, 40, 80, 120, 160] },
      y: { includeZero: true },
      footer: `Computed with gillespie and sirStochastic (src/lib/simulations/gillespie.ts) and integrateFixed with RK4, h = 0.1 day (src/lib/simulations/ode.ts); seeds 31 and 32. ${fizzled} of the ${runs} runs with N = 200 never exceeded 5 % infectious.`,
    };
  },

  'stochastic-replicates-sir-mean': () => {
    const beta = 0.3;
    const gamma = 0.1;
    const T = 160;
    const N = 200;
    const n = 1000;
    const times = grid(T, 80);
    const rng = createRng(33);
    const paths = Array.from({ length: n }, () => gillespie(sirStochastic(beta, gamma, N), [N - 2, 2, 0], T, rng));
    const s = summarise(paths, times, 1);
    const odePts = sirOde(beta, gamma, T);
    const meanPts = times.map((t, i) => [t, s.mean[i] / N] as [number, number]);
    const odePeak = Math.max(...odePts.map(([, y]) => y));
    const meanPeak = Math.max(...meanPts.map(([, y]) => y));
    const fizzled = paths.filter((p) => p.x[p.x.length - 1][2] < 0.05 * N && p.stop === 'absorbed').length;
    return {
      title: 'For the nonlinear SIR model, the mean of stochastic runs is lower and broader than the deterministic curve',
      subtitle: `${n} stochastic SIR runs in N = ${N} hosts (β = ${beta}, γ = ${gamma} per day, I₀ = 2) against the ODE from the same initial proportions`,
      xLabel: 'Time (days)',
      yUnit: 'Proportion infectious I/N',
      bands: [{ id: 'q90', label: '5–95 %', points: times.map((t, i) => [t, s.quantiles[i][0] / N, s.quantiles[i][4] / N] as [number, number, number]), family: 'terracotta', opacity: 0.3 }],
      series: [
        { id: 'ode', label: 'ODE', points: odePts, family: 'teal', dashed: true },
        { id: 'mean', label: 'Replicate mean', points: meanPts, family: 'terracotta' },
      ],
      x: { domain: [0, 160], ticks: [0, 40, 80, 120, 160] },
      y: { includeZero: true },
      footer: `Computed with gillespie, sirStochastic and summarise (gillespie.ts) and integrateFixed (ode.ts), seed 33. Peak of the ODE ${odePeak.toFixed(3)}, peak of the replicate mean ${meanPeak.toFixed(3)}; ${fizzled} of ${n} runs ended with fewer than 5 % of hosts ever infected. Band: 5–95 % of runs.`,
    };
  },
};
