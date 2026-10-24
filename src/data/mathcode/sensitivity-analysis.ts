import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'sensitivity-analysis-elasticity': {
    title: 'A central-difference elasticity',
    file: 'inference/stage_elasticity.cpp',
    show: [46, 67],
    tex: String.raw`e_p \;\approx\; \htmlClass{mc-ratio}{\frac{\htmlClass{mc-up}{\lambda\big(p\,(1+\delta)\big)} \;-\; \htmlClass{mc-down}{\lambda\big(p\,(1-\delta)\big)}}{2\,\htmlClass{mc-delta}{\delta}\,\htmlClass{mc-lambda}{\lambda(p)}}}`,
    terms: [
      {
        id: 'lambda',
        label: 'baseline growth rate',
        explain: 'λ at the baseline parameters, computed once by the power method. Dividing by it turns an absolute change in λ into a proportional one.',
        lines: [49],
      },
      {
        id: 'delta',
        label: 'relative step δ',
        explain: 'The proportional perturbation, here 0.1 %. Too large and the curvature of λ biases the estimate; too small and rounding errors, in λ and in the perturbed parameter, dominate the tiny difference.',
        lines: [48],
      },
      {
        id: 'up',
        label: 'λ with p raised',
        explain: 'Copy the baseline, multiply parameter k by 1 + δ, rebuild the matrix and recompute λ. Every other parameter stays at baseline.',
        lines: [55, 57, 59],
      },
      {
        id: 'down',
        label: 'λ with p lowered',
        explain: 'The same with 1 − δ. Using both sides (a central difference) cancels the first error term, so the error shrinks as δ² rather than δ.',
        lines: [56, 58, 60],
      },
      {
        id: 'ratio',
        label: 'proportional response',
        explain: 'Change in λ over the change in p, both as proportions: (Δλ/λ) / (Δp/p). The factors of p cancel, which is why p itself never appears in the code.',
        lines: [61],
      },
    ],
  },
};
