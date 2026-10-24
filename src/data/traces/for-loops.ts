import type { Trace } from './types';

const fixed = { lambda: '1.5', generations: '4' };

export const traces: Record<string, Trace> = {
  'for-loops-growth': {
    title: 'A for loop, step by step',
    file: 'foundations/for_geometric_growth.cpp',
    steps: [
      { line: 9, note: 'The growth factor per generation. It never changes, so it is const.', vars: { lambda: '1.5' } },
      { line: 10, note: 'How many generations to simulate.', vars: { ...fixed } },
      { line: 11, note: 'The state of the model: the population size at generation 0.', vars: { ...fixed, N: '20' } },
      { line: 13, note: 'Print the initial state before any update.', vars: { ...fixed, N: '20' }, out: 't = 0  N = 20\n' },
      {
        line: 14,
        note: 'Initialisation runs once: t is created with the value 1. Then the condition is tested: 1 <= 4 is true, so the body runs.',
        vars: { ...fixed, N: '20', t: '1' },
      },
      { line: 15, note: 'The update rule: the new N is λ times the old N, 1.5 × 20 = 30.', vars: { ...fixed, N: '30', t: '1' } },
      { line: 16, note: 'Print generation 1. The end of the body has been reached.', vars: { ...fixed, N: '30', t: '1' }, out: 't = 1  N = 30\n' },
      {
        line: 14,
        note: 'Back to the header: the update ++t makes t = 2, then the condition 2 <= 4 is tested. True: run the body again.',
        vars: { ...fixed, N: '30', t: '2' },
      },
      { line: 15, note: 'The same statement as before, now applied to the new state: 1.5 × 30 = 45.', vars: { ...fixed, N: '45', t: '2' } },
      { line: 16, note: 'Print generation 2.', vars: { ...fixed, N: '45', t: '2' }, out: 't = 2  N = 45\n' },
      { line: 14, note: '++t gives 3; 3 <= 4 is true.', vars: { ...fixed, N: '45', t: '3' } },
      { line: 15, note: '1.5 × 45 = 67.5.', vars: { ...fixed, N: '67.5', t: '3' } },
      { line: 16, note: 'Print generation 3.', vars: { ...fixed, N: '67.5', t: '3' }, out: 't = 3  N = 67.5\n' },
      { line: 14, note: '++t gives 4; 4 <= 4 is still true, so the body runs a fourth time.', vars: { ...fixed, N: '67.5', t: '4' } },
      { line: 15, note: '1.5 × 67.5 = 101.25.', vars: { ...fixed, N: '101.25', t: '4' } },
      { line: 16, note: 'Print generation 4.', vars: { ...fixed, N: '101.25', t: '4' }, out: 't = 4  N = 101.25\n' },
      {
        line: 14,
        note: '++t gives 5, and 5 <= 4 is false. The loop ends, and t, which belongs to the loop, no longer exists. N keeps its final value.',
        vars: { ...fixed, N: '101.25' },
      },
      { line: 18, note: 'Execution continues after the loop. main returns 0: success.', vars: { ...fixed, N: '101.25' } },
    ],
  },
};
