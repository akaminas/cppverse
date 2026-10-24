import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'what-is-a-program-growth': {
    title: 'The update rule, executed one instruction at a time',
    file: 'foundations/program_geometric_growth.cpp',
    steps: [
      { line: 10, note: 'A named value `lambda` is created and set to 1.5. `const` promises that it will never change: it is a parameter of the model.', vars: { lambda: '1.5' } },
      { line: 11, note: 'The state of the model, the population size, starts at 40 individuals in year 0.', vars: { lambda: '1.5', population: '40' } },
      { line: 13, note: 'The initial state is printed before anything changes.', vars: { lambda: '1.5', population: '40' }, out: 'year 0: 40\n' },
      { line: 14, note: 'The loop begins: a counter `year` is created with the value 1. The test `year <= 3` is true, so the body runs.', vars: { lambda: '1.5', population: '40', year: '1' } },
      { line: 15, note: 'The update rule N(t+1) = λ N(t). The right-hand side, 1.5 × 40, is computed first; the result replaces the old value of `population`.', vars: { lambda: '1.5', population: '60', year: '1' } },
      { line: 16, note: 'The new state is printed.', vars: { lambda: '1.5', population: '60', year: '1' }, out: 'year 1: 60\n' },
      { line: 14, note: '`++year` raises the counter to 2. The test `2 <= 3` is true, so the body runs again.', vars: { lambda: '1.5', population: '60', year: '2' } },
      { line: 15, note: 'The same instruction, applied to the new state: 1.5 × 60 = 90.', vars: { lambda: '1.5', population: '90', year: '2' } },
      { line: 16, note: 'Printed.', vars: { lambda: '1.5', population: '90', year: '2' }, out: 'year 2: 90\n' },
      { line: 14, note: 'The counter becomes 3, and `3 <= 3` is still true.', vars: { lambda: '1.5', population: '90', year: '3' } },
      { line: 15, note: '1.5 × 90 = 135.', vars: { lambda: '1.5', population: '135', year: '3' } },
      { line: 16, note: 'Printed.', vars: { lambda: '1.5', population: '135', year: '3' }, out: 'year 3: 135\n' },
      { line: 14, note: 'The counter becomes 4 and `4 <= 3` is false, so the loop ends. The counter `year` belonged to the loop and no longer exists.', vars: { lambda: '1.5', population: '135' } },
      { line: 18, note: '`main` returns 0: the program reports success and ends.', vars: { lambda: '1.5', population: '135' } },
    ],
  },
};
