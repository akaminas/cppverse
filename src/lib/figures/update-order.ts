// Figures for the lesson "Simultaneous versus sequential updates" (update-order.mdx).
// Computed at build time from src/lib/simulations/discrete.ts.

import type { FigureSpec } from './types';
import { hostParasitoidEquilibrium, hostParasitoidTrajectory } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'update-order-parasitoids': () => {
    const p = { r: 1.2, K: 80, a: 0.06, c: 0.8 };
    const T = 80;
    const sim = hostParasitoidTrajectory([20, 2], T, p, 'simultaneous');
    const seq = hostParasitoidTrajectory([20, 2], T, p, 'sequential');
    const eq = hostParasitoidEquilibrium(p);
    if (!eq) throw new Error('update-order-parasitoids: no interior fixed point');
    return {
      title: 'The buggy update settles on the fixed point that the true model keeps circling',
      subtitle: 'Parasitoid density in the host-parasitoid model with r = 1.2, K = 80, a = 0.06, c = 0.8, started from H = 20, P = 2',
      xLabel: 'Generation t',
      yUnit: 'Parasitoids P (per unit area)',
      series: [
        { id: 'sim', label: 'Simultaneous (the model)', points: sim.map((s, t) => [t, s[1]] as [number, number]), family: 'teal' },
        { id: 'seq', label: 'Sequential (a bug)', points: seq.map((s, t) => [t, s[1]] as [number, number]), family: 'terracotta' },
      ],
      references: [{ axis: 'y', value: eq[1], label: `P* = ${eq[1].toFixed(1)}` }],
      y: { includeZero: true },
      footer: 'Computed with hostParasitoidTrajectory and hostParasitoidEquilibrium (src/lib/simulations/discrete.ts). The fixed point is the same for both update orders.',
    };
  },
};
