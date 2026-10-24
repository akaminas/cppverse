import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'passing-arguments-value-reference': {
    title: 'A copy versus an alias',
    file: 'foundations/passing_value_vs_reference.cpp',
    steps: [
      { line: 19, note: 'main creates its variable N.', vars: { 'main: N': '40' } },
      { line: 20, note: 'Print the starting value.', vars: { 'main: N': '40' }, out: 'start:                  N = 40\n' },
      {
        line: 8,
        note: 'main calls grow_copy(N, 1.5) on line 21 and waits. The parameter N is a new variable, initialised with a copy of main’s N. The two share a name but not their storage.',
        vars: { 'main: N': '40', 'grow_copy: N': '40 (a copy)', 'grow_copy: lambda': '1.5' },
      },
      {
        line: 9,
        note: 'Only the copy changes. main’s N is untouched.',
        vars: { 'main: N': '40', 'grow_copy: N': '60 (a copy)', 'grow_copy: lambda': '1.5' },
      },
      {
        line: 10,
        note: 'Inside the function the new value is visible.',
        vars: { 'main: N': '40', 'grow_copy: N': '60 (a copy)', 'grow_copy: lambda': '1.5' },
        out: '  inside grow_copy:     N = 60\n',
      },
      { line: 11, note: 'The function ends. Its parameters are destroyed, and the 60 goes with them.', vars: { 'main: N': '40' } },
      { line: 22, note: 'Back in main, N is still 40.', vars: { 'main: N': '40' }, out: 'after grow_copy:        N = 40\n' },
      {
        line: 13,
        note: 'main calls grow_in_place(N, 1.5) on line 23. The parameter double& N is a reference: another name for main’s N. Nothing is copied.',
        vars: { 'main: N': '40', 'grow_in_place: N': '→ main: N', 'grow_in_place: lambda': '1.5' },
      },
      {
        line: 14,
        note: 'Assigning to the reference assigns to the variable it refers to, so main’s N becomes 60.',
        vars: { 'main: N': '60', 'grow_in_place: N': '→ main: N', 'grow_in_place: lambda': '1.5' },
      },
      {
        line: 15,
        note: 'Reading the reference reads main’s N.',
        vars: { 'main: N': '60', 'grow_in_place: N': '→ main: N', 'grow_in_place: lambda': '1.5' },
        out: '  inside grow_in_place: N = 60\n',
      },
      { line: 16, note: 'The function ends. The reference disappears, but the variable it referred to keeps its new value.', vars: { 'main: N': '60' } },
      { line: 24, note: 'main sees the change.', vars: { 'main: N': '60' }, out: 'after grow_in_place:    N = 60\n' },
      { line: 25, note: 'main returns 0.', vars: { 'main: N': '60' } },
    ],
  },
};
