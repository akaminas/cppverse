// Figure for the procedural-review lesson: the run that
// cpp-examples/architecture/two_stage_sim.cpp performs with its .args file
// (b = 5, sj = 0.25, sa = 0.5, M = 50, J0 = 0, A0 = 10, 40 generations).
// Recruitment b A / (1 + A / M) is exactly the tested Beverton–Holt step with
// R0 = b; maturation and adult survival are a linear combination.
import type { FigureSpec } from './types';
import { bevertonHoltStep } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'procedural-review-stages': () => {
    const p = { b: 5, sj: 0.25, sa: 0.5, M: 50 };
    const T = 40;
    const traj: [number, number][] = [[0, 10]];
    for (let t = 0; t < T; t++) {
      const [J, A] = traj[t];
      traj.push([bevertonHoltStep(A, { R0: p.b, M: p.M }), p.sj * J + p.sa * A]);
    }
    const R0 = (p.b * p.sj) / (1 - p.sa);
    const Astar = p.M * (R0 - 1);
    const Jstar = ((1 - p.sa) * Astar) / p.sj;
    return {
      title: 'Both stages approach the equilibrium predicted from the parameters',
      subtitle: 'Two-stage model, b = 5, sj = 0.25, sa = 0.5, M = 50, starting from 10 adults; R₀ = 2.5',
      xLabel: 'Generation t',
      yUnit: 'Individuals per stage',
      series: [
        { id: 'J', label: 'Juveniles', points: traj.map(([J], t) => [t, J] as [number, number]), family: 'teal', markers: true },
        { id: 'A', label: 'Adults', points: traj.map(([, A], t) => [t, A] as [number, number]), family: 'terracotta', markers: true },
      ],
      references: [
        { axis: 'y', value: Jstar, label: `J* = ${Jstar.toFixed(0)}` },
        { axis: 'y', value: Astar, label: `A* = ${Astar.toFixed(0)}` },
      ],
      y: { includeZero: true },
      footer: 'Recruitment computed with bevertonHoltStep (src/lib/simulations/discrete.ts); equilibrium from A* = M (R₀ − 1), J* = (1 − sa) A* / sj.',
    };
  },
};
