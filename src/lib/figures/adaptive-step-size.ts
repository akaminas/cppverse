// Figures for the lesson adaptive-step-size: the embedded Heun–Euler pair
// of integrateAdaptive applied to the SIR epidemic. Computed at build time
// from the tested code in src/lib/simulations/ode.ts.

import type { FigureSpec } from './types';
import { integrateAdaptive, integrateFixed, sirFinalSusceptible, sirRhs } from '../simulations/ode';

const p = { beta: 0.5, gamma: 0.2 };
const x0 = [0.999, 0.001, 0];
const f = sirRhs(p);
const adaptive = (tol: number, t1: number) => integrateAdaptive(f, x0, 0, t1, { atol: tol, rtol: tol, h0: 1 });

export const figures: Record<string, () => FigureSpec> = {
  'adaptive-step-size-steps': () => {
    const run = (tol: number) => {
      const s = adaptive(tol, 150);
      // Each accepted step is plotted at the time where it ends; the final step is cut short to hit t = 150 and is left out.
      return s.h.slice(0, -1).map((h, i) => [s.t[i + 1], h] as [number, number]);
    };
    const s6 = adaptive(1e-6, 150);
    const peak = s6.t[s6.x.reduce((best, x, i, all) => (x[1] > all[best][1] ? i : best), 0)];
    return {
      title: 'The controller takes its shortest steps while the epidemic rises and peaks, and lengthens them by orders of magnitude once it is over',
      subtitle: 'Accepted step sizes of the adaptive Heun-Euler pair on the SIR model, β = 0.5 and γ = 0.2 per day, S(0) = 0.999, I(0) = 0.001; atol = rtol',
      xLabel: 'Time (days)',
      yUnit: 'Accepted step size h (days, log scale)',
      series: [
        { id: 'tol4', label: 'tolerance 10⁻⁴', points: run(1e-4), family: 'ochre' },
        { id: 'tol6', label: 'tolerance 10⁻⁶', points: run(1e-6), family: 'indigo' },
      ],
      references: [{ axis: 'x', value: peak, label: `peak of I, day ${peak.toFixed(0)}` }],
      y: { type: 'log' },
      footer: `Computed with integrateAdaptive (src/lib/simulations/ode.ts), first trial step 1 day. Over 150 days the tolerance 10⁻⁶ run accepted ${s6.accepted} steps and rejected ${s6.rejected}.`,
    };
  },

  'adaptive-step-size-prevalence': () => {
    const s = adaptive(1e-4, 100);
    return {
      title: 'Accepted steps crowd together where the proportion infectious changes fastest',
      subtitle: 'Proportion infectious I at the end of every accepted step; adaptive Heun-Euler with atol = rtol = 10⁻⁴, SIR with β = 0.5 and γ = 0.2 per day',
      xLabel: 'Time (days)',
      yUnit: 'Proportion infectious I',
      series: [{ id: 'I', label: 'I at accepted steps', points: s.t.map((t, i) => [t, s.x[i][1]] as [number, number]), family: 'terracotta', kind: 'points' }],
      y: { includeZero: true },
      footer: `Computed with integrateAdaptive (src/lib/simulations/ode.ts): ${s.accepted} accepted and ${s.rejected} rejected steps over 100 days.`,
    };
  },

  'adaptive-step-size-work-precision': () => {
    const exact = sirFinalSusceptible(x0[0], p);
    const tEnd = 400;
    const adaptivePoints = [1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8].map((tol) => {
      const s = adaptive(tol, tEnd);
      return [s.evaluations, Math.abs(s.x.at(-1)![0] - exact)] as [number, number];
    });
    const fixedPoints = [2, 1, 0.5, 0.25, 0.1, 0.05, 0.02].map((h) => {
      const s = integrateFixed(f, x0, 0, tEnd, h, 'heun');
      return [s.evaluations, Math.abs(s.x.at(-1)![0] - exact)] as [number, number];
    });
    return {
      title: 'For the same accuracy, adaptive steps need several times fewer slope evaluations than a fixed step',
      subtitle: 'Error in the final proportion susceptible, S(400), against the final-size relation; Heun steps of fixed size versus the adaptive Heun-Euler pair',
      xLabel: 'Right-hand-side evaluations (log scale)',
      yUnit: 'Absolute error in S(400) (log scale)',
      series: [
        { id: 'fixed', label: 'Fixed-step Heun', points: fixedPoints, family: 'terracotta', markers: true },
        { id: 'adaptive', label: 'Adaptive Heun-Euler', points: adaptivePoints, family: 'indigo', markers: true },
      ],
      x: { type: 'log' },
      y: { type: 'log' },
      footer:
        'Computed with integrateFixed, integrateAdaptive and sirFinalSusceptible (src/lib/simulations/ode.ts). Fixed steps h = 2 … 0.02 days; tolerances atol = rtol = 10⁻³ … 10⁻⁸.',
    };
  },
};
