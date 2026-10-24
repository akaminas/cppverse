import type { Trace } from './types';

export const traces: Record<string, Trace> = {
  'recursion-descendants': {
    title: 'Down to the base case and back up',
    file: 'foundations/recursion_descendants.cpp',
    steps: [
      {
        line: 9,
        note: 'main (line 20) calls descendants(3, 2) and waits for the answer. A new frame is created with its own copies of the parameters.',
        vars: { stack: 'main → d(3)', generations: '3', offspring: '2' },
      },
      { line: 10, note: 'Is generations 0? No: this is not the base case.', vars: { stack: 'main → d(3)', generations: '3', offspring: '2' } },
      {
        line: 9,
        note: 'Line 13 of d(3) calls descendants(2, 2). d(3) is suspended halfway through line 13; a second frame is created on top of it.',
        vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2' },
      },
      { line: 10, note: 'generations is 2 in this frame. Not the base case.', vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2' } },
      {
        line: 9,
        note: 'd(2) calls descendants(1, 2). Three calls are now waiting.',
        vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2' },
      },
      { line: 10, note: 'Not the base case yet.', vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2' } },
      {
        line: 9,
        note: 'd(1) calls descendants(0, 2). The stack is now four calls deep.',
        vars: { stack: 'main → d(3) → d(2) → d(1) → d(0)', generations: '0', offspring: '2' },
      },
      {
        line: 10,
        note: 'generations == 0 is true: the base case. No further call is made, which is what stops the recursion.',
        vars: { stack: 'main → d(3) → d(2) → d(1) → d(0)', generations: '0', offspring: '2' },
      },
      { line: 11, note: 'd(0) returns 0 and its frame is removed. The stack starts to unwind.', vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2' } },
      {
        line: 13,
        note: 'd(1) resumes where it stopped: the call on line 13 has produced its value, 0.',
        vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2', below: '0' },
      },
      {
        line: 14,
        note: 'One generation: the founder’s 2 offspring, 2 × (1 + 0) = 2.',
        vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2', below: '0', result: '2' },
      },
      {
        line: 15,
        note: 'The innermost call that does work prints first.',
        vars: { stack: 'main → d(3) → d(2) → d(1)', generations: '1', offspring: '2', below: '0', result: '2' },
        out: 'descendants(1) = 2\n',
      },
      { line: 16, note: 'd(1) returns 2 to d(2).', vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2' } },
      {
        line: 13,
        note: 'd(2) resumes with below = 2. Its own generations is still 2: each frame kept its own parameters.',
        vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2', below: '2' },
      },
      {
        line: 14,
        note: 'Each of the 2 offspring brings itself plus its 2 descendants: 2 × (1 + 2) = 6.',
        vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2', below: '2', result: '6' },
      },
      {
        line: 15,
        note: 'Print and return.',
        vars: { stack: 'main → d(3) → d(2)', generations: '2', offspring: '2', below: '2', result: '6' },
        out: 'descendants(2) = 6\n',
      },
      { line: 16, note: 'd(2) returns 6 to d(3).', vars: { stack: 'main → d(3)', generations: '3', offspring: '2' } },
      { line: 13, note: 'd(3) resumes with below = 6.', vars: { stack: 'main → d(3)', generations: '3', offspring: '2', below: '6' } },
      {
        line: 14,
        note: '2 × (1 + 6) = 14, which is 2 + 4 + 8: the offspring in each of three generations.',
        vars: { stack: 'main → d(3)', generations: '3', offspring: '2', below: '6', result: '14' },
      },
      {
        line: 15,
        note: 'The first call is the last to finish.',
        vars: { stack: 'main → d(3)', generations: '3', offspring: '2', below: '6', result: '14' },
        out: 'descendants(3) = 14\n',
      },
      { line: 16, note: 'd(3) returns 14 to main. Only main is left on the stack.', vars: { stack: 'main' } },
      { line: 20, note: 'The call on line 20 is complete: total is 14.', vars: { stack: 'main', total: '14' } },
      { line: 21, note: 'Print the result.', vars: { stack: 'main', total: '14' }, out: 'Total after 3 generations: 14\n' },
      { line: 22, note: 'main returns 0.', vars: { stack: 'main', total: '14' } },
    ],
  },
};
