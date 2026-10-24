// Figures for the lesson on range, precision and overflow.
import type { FigureSpec } from './types';

// Repeats the loop of cpp-examples/foundations/limits_precision.cpp with the
// same IEEE-754 double arithmetic (JavaScript numbers are doubles), recording
// log10 of the running product and of the exact value after each observation.
function likelihoodProduct(probability: number, observations: number) {
  const computed: [number, number][] = [];
  const exact: [number, number][] = [];
  let product = 1;
  let zeroAfter = 0;
  for (let i = 1; i <= observations; i++) {
    product *= probability;
    exact.push([i, i * Math.log10(probability)]);
    if (product > 0) computed.push([i, Math.log10(product)]);
    else if (zeroAfter === 0) zeroAfter = i;
  }
  return { computed, exact, zeroAfter };
}

export const figures: Record<string, () => FigureSpec> = {
  'numeric-limits-underflow': () => {
    const { computed, exact, zeroAfter } = likelihoodProduct(0.01, 250);
    return {
      title: 'A product of small probabilities underflows to zero; its logarithm does not',
      subtitle: `Likelihood of n independent observations, each with probability 0.01, multiplied in double precision; the product is exactly 0 from n = ${zeroAfter} on`,
      xLabel: 'Number of observations n',
      yUnit: 'Decimal logarithm of the likelihood, log₁₀ L',
      series: [
        { id: 'exact', label: 'Exact value, n log₁₀ 0.01', points: exact, family: 'teal', dashed: true },
        { id: 'computed', label: 'Running product', points: computed, family: 'terracotta' },
      ],
      references: [
        { axis: 'y', value: -308, label: 'smallest normal double ≈ 10⁻³⁰⁸' },
        { axis: 'x', value: zeroAfter, label: `product = 0 at n = ${zeroAfter}` },
      ],
      footer:
        'Computed at build time with the same double arithmetic as cpp-examples/foundations/limits_precision.cpp. Between 10⁻³⁰⁸ and 10⁻³²⁴ the product is subnormal and loses precision; after that it is 0, and log₁₀ 0 is undefined.',
    };
  },
};
