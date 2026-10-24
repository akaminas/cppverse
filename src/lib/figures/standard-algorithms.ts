// Figures for the lesson "standard-algorithms": the trajectory summarised
// by cpp-examples/data/algorithms_trajectory.cpp, computed with the tested
// logistic map in src/lib/simulations/discrete.ts.
import type { FigureSpec } from './types';
import { iterate, logisticMapStep } from '../simulations/discrete';

export const figures: Record<string, () => FigureSpec> = {
  'standard-algorithms-summary': () => {
    const r = 2.8;
    const x = iterate((v) => logisticMapStep(v, { r }), 0.05, 30);
    const equilibrium = 1 - 1 / r;
    let peakTime = 0;
    for (let t = 1; t < x.length; t++) if (x[t] > x[peakTime]) peakTime = t; // first maximum, like std::max_element
    let sum = 0;
    for (const v of x) sum += v; // left to right, like std::accumulate
    const mean = sum / x.length;
    return {
      title: `The density peaks in generation ${peakTime} and then settles towards its equilibrium`,
      subtitle: `Logistic map xₜ₊₁ = r xₜ (1 − xₜ), r = ${r}, x₀ = 0.05; the values summarised by the program in this lesson`,
      xLabel: 'Generation t',
      yUnit: 'Scaled density x',
      series: [{ id: 'x', label: 'x(t)', points: x.map((v, t) => [t, v] as [number, number]), markers: true, family: 'teal' }],
      references: [
        { axis: 'y', value: equilibrium, label: `equilibrium ${equilibrium.toFixed(4)}` },
        { axis: 'y', value: mean, label: `mean ${mean.toFixed(4)}` },
        { axis: 'x', value: peakTime, label: `peak ${x[peakTime].toFixed(4)}` },
      ],
      y: { domain: [0, 0.8] },
      footer: 'Computed at build time with logisticMapStep (src/lib/simulations/discrete.ts), the same recurrence as cpp-examples/data/algorithms_trajectory.cpp.',
    };
  },
};
