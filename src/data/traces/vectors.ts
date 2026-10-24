import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'vectors-trajectory': {
    title: 'A trajectory grows one push_back at a time',
    file: 'data/vector_trajectory.cpp',
    steps: [
      { line: 11, note: 'The growth factor is a constant: the model does not change it.', vars: { growthFactor: '1.5' } },
      { line: 12, note: 'Four generations will be simulated after the initial one.', vars: { growthFactor: '1.5', generations: '4' } },
      { line: 14, note: 'An empty vector of doubles: size() is 0 and there is no element to read yet.', vars: { growthFactor: '1.5', generations: '4', N: '{ }  (size 0)' } },
      { line: 15, note: 'push_back appends the initial population. It is element 0.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40 }  (size 1)' } },
      { line: 17, note: 'The loop starts with t = 0. The condition t < 4 is true.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40 }  (size 1)', t: '0' } },
      { line: 18, note: 'N.back() is the most recent value, 40. Its successor, 1.5 × 40 = 60, is appended.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40, 60 }  (size 2)', t: '0' } },
      { line: 18, note: 't = 1: back() is now 60, so 90 is appended. The vector grows by one element per generation.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40, 60, 90 }  (size 3)', t: '1' } },
      { line: 18, note: 't = 2: 1.5 × 90 = 135 is appended.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40, 60, 90, 135 }  (size 4)', t: '2' } },
      { line: 18, note: 't = 3: 1.5 × 135 = 202.5 is appended.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '3' } },
      { line: 17, note: 't becomes 4 and t < 4 is false, so the loop ends. Five values are stored: the initial state plus four generations.', vars: { growthFactor: '1.5', generations: '4', N: '{ 40, 60, 90, 135, 202.5 }  (size 5)' } },
      { line: 21, note: 'size() reports how many elements the vector holds.', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)' }, out: 'Stored 5 values\n' },
      { line: 23, note: 'The index t runs from 0. N[0] is the first element.', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '0' }, out: 'generation 0: 40\n' },
      { line: 23, note: 'N[1] is the second element.', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '1' }, out: 'generation 1: 60\n' },
      { line: 23, note: 'N[2].', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '2' }, out: 'generation 2: 90\n' },
      { line: 23, note: 'N[3].', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '3' }, out: 'generation 3: 135\n' },
      { line: 23, note: 'N[4] is the last element: its index is size() − 1. The next test, 5 < 5, is false, so N[5] is never read.', vars: { N: '{ 40, 60, 90, 135, 202.5 }  (size 5)', t: '4' }, out: 'generation 4: 202.5\n' },
      { line: 25, note: 'main returns 0. The vector is destroyed automatically and its memory released.', vars: {} },
    ],
  },
};
