import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'assignment-and-literals-reserves': {
    title: 'One variable, four values: assignment as a state update',
    file: 'foundations/assignment_energy_reserves.cpp',
    steps: [
      { line: 9, note: 'Initialisation: the variable `reserves` is created and receives its first value, 2.0.', vars: { reserves: '2' } },
      { line: 10, note: 'The current value is read and printed. Reading a variable does not change it.', vars: { reserves: '2' }, out: 'dawn: 2 g\n' },
      { line: 12, note: 'Assignment. The right-hand side is evaluated first, with the *old* value: 2.0 + 0.75 = 2.75. Then 2.75 is stored in `reserves` and the old value is gone.', vars: { reserves: '2.75' } },
      { line: 13, note: 'Printed.', vars: { reserves: '2.75' }, out: 'noon: 2.75 g\n' },
      { line: 15, note: 'Another assignment to the same variable: 2.75 − 0.5 = 2.25 replaces 2.75.', vars: { reserves: '2.25' } },
      { line: 16, note: 'Printed.', vars: { reserves: '2.25' }, out: 'dusk: 2.25 g\n' },
      { line: 18, note: 'A second variable is created. It is `const`, so this initialisation is the only value it will ever have.', vars: { reserves: '2.25', overnightCost: '1.25' } },
      { line: 19, note: 'The right-hand side may use any variable: 2.25 − 1.25 = 1.0 is stored in `reserves`. `overnightCost` is only read.', vars: { reserves: '1', overnightCost: '1.25' } },
      { line: 20, note: 'Printed. The variable has held four values in turn under the same name.', vars: { reserves: '1', overnightCost: '1.25' }, out: 'next dawn: 1 g\n' },
      { line: 21, note: '`main` returns 0, and both variables cease to exist.', vars: { reserves: '1', overnightCost: '1.25' } },
    ],
  },
};
