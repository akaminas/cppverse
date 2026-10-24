import type { Trace } from './types';

// A linear scan for the generation with the largest population size. The
// five sizes are illustrative numbers, not data.
const code = `const std::vector<double> N{12.0, 30.5, 41.2, 38.7, 40.9};
std::size_t best = 0;
for (std::size_t i = 1; i < N.size(); ++i) {
    if (N[i] > N[best]) best = i;
}
std::cout << "peak in generation " << best << '\\n';`;

export const traces: Record<string, Trace> = {
  'algorithms-and-pseudocode-scan': {
    title: 'Finding the peak with one pass through a trajectory',
    code,
    steps: [
      { line: 1, note: 'A simulated trajectory: the population size in generations 0 to 4.', vars: { N: '{12.0, 30.5, 41.2, 38.7, 40.9}' } },
      { line: 2, note: 'Before looking at anything else, generation 0 is the best candidate.', vars: { best: '0' } },
      { line: 3, note: 'Start comparing at generation 1.', vars: { best: '0', i: '1' } },
      { line: 4, note: 'N[1] = 30.5 is larger than N[0] = 12.0, so generation 1 becomes the candidate.', vars: { best: '1', i: '1' } },
      { line: 3, note: 'Next generation.', vars: { best: '1', i: '2' } },
      { line: 4, note: '41.2 > 30.5: generation 2 takes over.', vars: { best: '2', i: '2' } },
      { line: 3, note: 'Next generation.', vars: { best: '2', i: '3' } },
      { line: 4, note: '38.7 is not larger than 41.2; best is unchanged.', vars: { best: '2', i: '3' } },
      { line: 3, note: 'Last generation.', vars: { best: '2', i: '4' } },
      { line: 4, note: '40.9 is close, but still smaller than 41.2.', vars: { best: '2', i: '4' } },
      { line: 3, note: 'i becomes 5, which is not less than N.size() = 5: every element has been seen once, and the loop ends.', vars: { best: '2' } },
      { line: 6, note: 'The answer is an index (a generation), not a population size. N[best] would give the size.', vars: { best: '2' }, out: 'peak in generation 2\n' },
    ],
  },
};
