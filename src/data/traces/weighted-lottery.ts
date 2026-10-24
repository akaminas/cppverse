import type { Trace } from './types';

// Step-through of cpp-examples/stochastic/lottery_by_hand.cpp. The printed
// text of all steps together equals lottery_by_hand.out (checked in tests).
const eggs = '{12, 30, 0, 8, 20}';

export const traces: Record<string, Trace> = {
  'weighted-lottery-by-hand': {
    title: 'A weighted lottery by cumulative sums',
    file: 'stochastic/lottery_by_hand.cpp',
    steps: [
      { line: 32, note: 'The weights are the egg counts of five females. They do not need to sum to 1.', vars: { eggs } },
      { line: 34, note: 'cumulative will hold the running sum of the weights.', vars: { eggs, cumulative: '0' } },
      { line: 36, note: 'Female 0 owns the interval from the running sum to the running sum plus her weight.', vars: { i: '0', cumulative: '0' }, out: 'female 0: weight 12, interval [0, 12)\n' },
      { line: 38, note: 'Move the running sum to the end of her interval.', vars: { i: '0', cumulative: '12' } },
      { line: 36, note: 'Female 1 laid the most eggs, so she owns the widest interval.', vars: { i: '1', cumulative: '12' }, out: 'female 1: weight 30, interval [12, 42)\n' },
      { line: 38, note: 'The running sum is now 42.', vars: { i: '1', cumulative: '42' } },
      { line: 36, note: 'Female 2 laid no eggs. Her interval [42, 42) is empty: no number can fall inside it.', vars: { i: '2', cumulative: '42' }, out: 'female 2: weight 0, interval [42, 42)\n' },
      { line: 38, note: 'Adding a zero weight leaves the running sum unchanged.', vars: { i: '2', cumulative: '42' } },
      { line: 36, note: 'Female 3 starts where female 2 would have started.', vars: { i: '3', cumulative: '42' }, out: 'female 3: weight 8, interval [42, 50)\n' },
      { line: 38, note: 'The running sum is now 50.', vars: { i: '3', cumulative: '50' } },
      { line: 36, note: 'Female 4 owns the last interval.', vars: { i: '4', cumulative: '50' }, out: 'female 4: weight 20, interval [50, 70)\n' },
      { line: 38, note: 'The intervals now tile [0, 70) without gaps. The total weight is 70.', vars: { i: '4', cumulative: '70' } },
      { line: 42, note: 'u = 0.1 stands in for a uniform random number. Scaled by the total, the target is 7, inside [0, 12).', vars: { u: '0.1', cumulative: '70' }, out: 'u = 0.1, target 7 -> female 0\n' },
      { line: 42, note: 'A target of 21 lies in [12, 42).', vars: { u: '0.3', cumulative: '70' }, out: 'u = 0.3, target 21 -> female 1\n' },
      { line: 42, note: 'Any u between 12/70 and 42/70 picks female 1: a probability of 30/70, her share of the eggs.', vars: { u: '0.55', cumulative: '70' }, out: 'u = 0.55, target 38.5 -> female 1\n' },
      { line: 17, note: 'Inside pickIndex for u = 0.6: the total is 70 and the target is 0.6 × 70 = 42.', vars: { u: '0.6', total: '70', target: '42' } },
      { line: 21, note: 'After female 0 the running sum is 12. Is 42 < 12? No: keep scanning.', vars: { i: '0', target: '42', cumulative: '12' } },
      { line: 21, note: 'After female 1 the running sum is 42. Is 42 < 42? No: the intervals are half-open, so 42 belongs to the next interval.', vars: { i: '1', target: '42', cumulative: '42' } },
      { line: 21, note: 'Female 2 adds nothing: 42 < 42 is still false. A zero weight can never be chosen.', vars: { i: '2', target: '42', cumulative: '42' } },
      { line: 21, note: 'After female 3 the running sum is 50, and 42 < 50: return index 3.', vars: { i: '3', target: '42', cumulative: '50' } },
      { line: 42, note: 'Back in main, the result is printed.', vars: { u: '0.6', cumulative: '70' }, out: 'u = 0.6, target 42 -> female 3\n' },
      { line: 42, note: 'A target of 45.5 lies in [42, 50).', vars: { u: '0.65', cumulative: '70' }, out: 'u = 0.65, target 45.5 -> female 3\n' },
      { line: 42, note: 'A target of 56 lies in [50, 70).', vars: { u: '0.8', cumulative: '70' }, out: 'u = 0.8, target 56 -> female 4\n' },
      { line: 42, note: 'u is always below 1, so the target is always below the total and some interval always contains it.', vars: { u: '0.999', cumulative: '70' }, out: 'u = 0.999, target 69.93 -> female 4\n' },
      { line: 45, note: 'main returns 0: the program finished successfully.' },
    ],
  },
};
