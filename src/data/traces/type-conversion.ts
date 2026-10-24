import type { Trace } from './types';

// Variables alive at each step, built up cumulatively.
const counts = { 'nAA (int)': '38', 'nAa (int)': '47', 'naa (int)': '15' };
const totals = { ...counts, 'individuals (int)': '100', 'allelesA (int)': '123', 'allelesTotal (int)': '200' };
const all = { ...totals, 'wrong (int)': '0', 'p (double)': '0.615', 'q (double)': '0.385' };

export const traces: Record<string, Trace> = {
  'type-conversion-allele': {
    title: 'Allele frequency: which operations are integer, which are double',
    file: 'foundations/conversion_allele_frequency.cpp',
    steps: [
      { line: 10, note: 'Genotype counts are whole numbers, so they are stored as `int`.', vars: { 'nAA (int)': '38' } },
      { line: 11, note: 'Heterozygotes.', vars: { 'nAA (int)': '38', 'nAa (int)': '47' } },
      { line: 12, note: 'The other homozygote.', vars: counts },
      { line: 14, note: 'int + int + int is an int: 100 individuals.', vars: { ...counts, 'individuals (int)': '100' } },
      { line: 15, note: 'Copies of allele A: 2 × 38 + 47 = 123. Multiplication binds before addition, and every operand is an `int`.', vars: { ...counts, 'individuals (int)': '100', 'allelesA (int)': '123' } },
      { line: 16, note: 'Each individual carries two alleles at this locus: 200 in total.', vars: totals },
      { line: 18, note: 'Both operands of `/` are `int`, so this is integer division. 123 / 200 would be 0.615; the fraction is discarded and the result is 0.', vars: { ...totals, 'wrong (int)': '0' } },
      { line: 19, note: '`static_cast<double>(allelesA)` produces the double 123.0. With one double operand, `allelesTotal` is converted to 200.0 and the division keeps its fraction.', vars: { ...totals, 'wrong (int)': '0', 'p (double)': '0.615' } },
      { line: 20, note: 'double − double: q = 1 − p.', vars: all },
      { line: 22, note: 'From here on, doubles are printed with exactly three decimals. Integers are not affected.', vars: all },
      { line: 23, note: 'Two ints, printed as whole numbers.', vars: all, out: 'A alleles: 123 of 200\n' },
      { line: 24, note: 'The result of the integer division.', vars: all, out: 'with integer division: 0\n' },
      { line: 25, note: 'The intended frequencies.', vars: all, out: 'p = 0.615, q = 0.385\n' },
      { line: 26, note: '`2.0 * p * q` is evaluated left to right: (2.0 × 0.615) × 0.385 = 0.47355, printed to three decimals.', vars: all, out: 'expected heterozygosity 2pq = 0.474\n' },
      { line: 27, note: 'The same pattern for a proportion of individuals: convert first, then divide. 47.0 / 100 is 0.47.', vars: all, out: 'observed heterozygosity = 0.470\n' },
      { line: 29, note: '`main` returns 0.', vars: all },
    ],
  },
};
