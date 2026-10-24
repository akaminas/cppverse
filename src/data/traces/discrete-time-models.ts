import type { Trace } from './types';

// Step-through of cpp-examples/algorithms/bh_first_simulation.cpp. Line
// numbers include the three header comment lines. Values of N are shown to
// four decimals; the program prints two.
const params = { R0: '2.2', M: '40', generations: '5' };

export const traces: Record<string, Trace> = {
  'discrete-time-models-first': {
    title: 'Five generations of the Beverton–Holt model',
    file: 'algorithms/bh_first_simulation.cpp',
    steps: [
      { line: 9, note: 'A parameter: the growth factor at low density. const means it cannot change during the run.', vars: { R0: '2.2' } },
      { line: 10, note: 'A second parameter: the density at which the growth factor is halved.', vars: { R0: '2.2', M: '40' } },
      { line: 11, note: 'The length of the run, also fixed.', vars: { ...params } },
      { line: 12, note: 'The state variable, initialised with the initial condition N₀ = 5. It is not const: the update rule will overwrite it.', vars: { ...params, N: '5.0000' } },
      { line: 14, note: 'From now on, numbers are printed with exactly two decimals.', vars: { ...params, N: '5.0000' } },
      { line: 15, note: 'Record the initial state before anything changes.', vars: { ...params, N: '5.0000' }, out: 'generation 0: N = 5.00\n' },
      { line: 16, note: 'The loop starts: t = 1, and 1 ≤ 5, so the body runs.', vars: { ...params, N: '5.0000', t: '1' } },
      { line: 17, note: 'The update rule: 2.2 × 5 / (1 + 5/40) = 11 / 1.125. The old value of N is used on the right and then replaced.', vars: { ...params, N: '9.7778', t: '1' } },
      { line: 18, note: 'Record generation 1.', vars: { ...params, N: '9.7778', t: '1' }, out: 'generation 1: N = 9.78\n' },
      { line: 16, note: '++t makes t = 2; 2 ≤ 5, so the body runs again.', vars: { ...params, N: '9.7778', t: '2' } },
      { line: 17, note: 'The same rule, now applied to the new state: 2.2 × 9.7778 / 1.2444.', vars: { ...params, N: '17.2857', t: '2' } },
      { line: 18, note: 'Record generation 2.', vars: { ...params, N: '17.2857', t: '2' }, out: 'generation 2: N = 17.29\n' },
      { line: 16, note: 't = 3; the condition still holds.', vars: { ...params, N: '17.2857', t: '3' } },
      { line: 17, note: 'The denominator is now 1.4321: crowding takes away a growing share of the growth.', vars: { ...params, N: '26.5536', t: '3' } },
      { line: 18, note: 'Record generation 3.', vars: { ...params, N: '26.5536', t: '3' }, out: 'generation 3: N = 26.55\n' },
      { line: 16, note: 't = 4.', vars: { ...params, N: '26.5536', t: '4' } },
      { line: 17, note: 'The population still grows, but by a factor of only 1.32.', vars: { ...params, N: '35.1103', t: '4' } },
      { line: 18, note: 'Record generation 4.', vars: { ...params, N: '35.1103', t: '4' }, out: 'generation 4: N = 35.11\n' },
      { line: 16, note: 't = 5, the last generation of the run.', vars: { ...params, N: '35.1103', t: '5' } },
      { line: 17, note: 'N approaches the equilibrium K = (R₀ − 1) M = 48 from below.', vars: { ...params, N: '41.1356', t: '5' } },
      { line: 18, note: 'Record generation 5.', vars: { ...params, N: '41.1356', t: '5' }, out: 'generation 5: N = 41.14\n' },
      { line: 16, note: 't becomes 6; 6 ≤ 5 is false, so the loop ends and t goes out of scope.', vars: { ...params, N: '41.1356' } },
      { line: 20, note: 'main returns 0: the run finished successfully.', vars: { ...params, N: '41.1356' } },
    ],
  },
};
