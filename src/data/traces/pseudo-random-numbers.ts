import type { Trace } from './types';

// Step-through of cpp-examples/stochastic/prng_same_seed.cpp. The values are
// the exact std::mt19937_64 outputs (the engine is fully specified by the
// C++ standard); the printed text equals prng_same_seed.out.
export const traces: Record<string, Trace> = {
  'pseudo-random-numbers-same-seed': {
    title: 'Two engines, one seed, one sequence',
    file: 'stochastic/prng_same_seed.cpp',
    steps: [
      { line: 23, note: 'main calls the function with seed 2718 and asks for three numbers.', vars: { seed: '2718', count: '3' } },
      { line: 14, note: 'A new engine is created. Its internal state (312 numbers of 64 bits) is filled by a fixed recipe from the seed alone.', vars: { seed: '2718', engine: 'state from seed 2718, position 0' } },
      { line: 15, note: 'Label the line with the seed, so the numbers can always be traced back to it.', vars: { seed: '2718', engine: 'state from seed 2718, position 0' }, out: 'seed 2718:' },
      { line: 17, note: 'engine() returns the next number of the sequence and moves the engine on by one position.', vars: { i: '0', engine: 'position 1' }, out: ' 7751425964804573948' },
      { line: 17, note: 'The second number. Nothing about it looks related to the first, yet it follows from it by a fixed calculation.', vars: { i: '1', engine: 'position 2' }, out: ' 263483405089195025' },
      { line: 17, note: 'The third number.', vars: { i: '2', engine: 'position 3' }, out: ' 7517391294162437052' },
      { line: 19, note: 'End the line. When the function returns, its engine is destroyed.', out: '\n' },
      { line: 14, note: 'Second call, again with seed 2718: a brand-new engine with exactly the same starting state.', vars: { seed: '2718', engine: 'state from seed 2718, position 0' } },
      { line: 15, note: 'The label is printed as before.', vars: { seed: '2718' }, out: 'seed 2718:' },
      { line: 17, note: 'The loop prints three numbers: the same three, in the same order. Same seed, same sequence.', vars: { seed: '2718', engine: 'position 3' }, out: ' 7751425964804573948 263483405089195025 7517391294162437052' },
      { line: 19, note: 'End the line.', out: '\n' },
      { line: 14, note: 'Third call, with seed 2719. A seed that differs by one gives a completely different starting state.', vars: { seed: '2719', engine: 'state from seed 2719, position 0' } },
      { line: 15, note: 'The label shows the new seed.', vars: { seed: '2719' }, out: 'seed 2719:' },
      { line: 17, note: 'Three numbers with no visible relation to the sequence from seed 2718.', vars: { seed: '2719', engine: 'position 3' }, out: ' 12268940124457794244 7445969565018523212 11476704021625251941' },
      { line: 19, note: 'End the line.', out: '\n' },
      { line: 26, note: 'main returns 0. Run the program again tomorrow, or on another computer: the output is identical.' },
    ],
  },
};
