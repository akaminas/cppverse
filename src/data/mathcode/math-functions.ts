import type { MathCode } from './types';

export const mathcode: Record<string, MathCode> = {
  'math-functions-von-bertalanffy': {
    title: 'Von Bertalanffy growth, term by term',
    tex: String.raw`\htmlClass{mc-length}{L(t)} = \htmlClass{mc-linf}{L_\infty}\,\htmlClass{mc-fraction}{\left(1 - \htmlClass{mc-exp}{e^{-\htmlClass{mc-k}{k}\,\htmlClass{mc-age}{(t - t_0)}}}\right)}`,
    file: 'foundations/math_growth_equations.cpp',
    show: [13, 19],
    terms: [
      {
        id: 'length',
        label: 'L(t), length at age t',
        explain: 'The quantity being computed, in the same unit as L∞ (here centimetres). The program stores it in `length` and prints it.',
        lines: [18, 19],
      },
      {
        id: 'linf',
        label: 'L∞, asymptotic length',
        explain: 'The length that individuals approach but never reach. It multiplies the whole bracket, so the code needs parentheses around `1.0 - std::exp(...)`.',
        lines: [14, 18],
      },
      {
        id: 'fraction',
        label: '1 − e^{…}, fraction of L∞ reached',
        explain: 'A number between 0 and 1 for t > t₀. Written `(1.0 - std::exp(...))`; without the parentheses, C++ would compute `lengthInfinity * 1.0` first and then subtract the exponential.',
        lines: [18],
      },
      {
        id: 'exp',
        label: 'e^{x}, the exponential',
        explain: 'Written `std::exp(x)` from `<cmath>`. C++ has no exponent notation for expressions: `e^x` would be a bitwise operation on integers, not a power.',
        lines: [18],
      },
      {
        id: 'k',
        label: 'k, growth coefficient',
        explain: 'Per year, so t must be in years. The minus sign belongs to the whole exponent: `-k * (age - t0)` is (−k)(t − t₀), which is what the equation says.',
        lines: [15, 18],
      },
      {
        id: 'age',
        label: 't − t₀, time since the curve’s origin',
        explain: 'The parentheses are essential: `-k * age - t0` would compute −k t − t₀. t₀ is negative here, so t − t₀ = 4 − (−0.5) = 4.5 years.',
        lines: [16, 17, 18],
      },
    ],
  },
};
